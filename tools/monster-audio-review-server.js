'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const { generate: generateReviewRoutes } = require('../scripts/generate-world-monster-audio-review-routes');
const { loadHuntPatternAudioMap, savePatternRoute } = require('./hunt-audio-pattern-map');

const ROOT = path.resolve(__dirname, '..');
const GRAPH_ROOT = path.join(ROOT, 'local_assets', 'monster_hunter', 'world', 'audio_graph');
const AUDIO_ROOT = path.join(ROOT, 'local_assets', 'monster_hunter', 'world', 'monster');
const LABELS_PATH = path.join(ROOT, 'data', 'hunt', 'world-monster-audio-review-labels.json');
const UI_PATH = path.join(__dirname, 'monster-audio-review.html');
const HOST = '127.0.0.1';
const DEFAULT_PORT = 17930;
const BODY_LIMIT = 64 * 1024;

const PRESETS = Object.freeze({
    roar: { label: '포효', tags: ['monster_roar'] },
    breath: { label: '브레스', tags: ['breath'] },
    physical: { label: '물리공격', tags: ['physical_attack'] },
    wingFlap: { label: '날개짓', tags: ['wing_flap'] },
    aerialAttack: { label: '공중공격 음성', tags: ['aerial_attack_vocal'] },
    physicalVocal: { label: '물리공격 음성', tags: ['physical_attack_vocal'] },
    bite: { label: '깨물기 음성', tags: ['bite_vocal'] },
    somersault: { label: '서머솔트 음성', tags: ['somersault_vocal'] },
    breathCharge: { label: '브레스 준비', tags: ['breath_charge'] },
    breathShot: { label: '브레스 발사', tags: ['breath_shot'] },
    breathImpact: { label: '브레스 적중', tags: ['breath_impact'] },
    physicalImpact: { label: '물리 충돌음', tags: ['physical_impact'] },
    smallFlinch: { label: '소경직 음성', tags: ['small_flinch_vocal'] },
    knockdown: { label: '대경직 음성', tags: ['knockdown_vocal'] },
    trapped: { label: '함정 음성', tags: ['trapped_vocal'] },
    death: { label: '죽음 음성', tags: ['death_vocal'] },
    groundFire: { label: '바닥 화염', tags: ['ground_fire'] },
    tornado: { label: '회오리', tags: ['tornado'] },
    thunder: { label: '천둥', tags: ['thunder'] },
    hoofStep: { label: '발굽', tags: ['hoof_step'] },
    chargeStrideStep: { label: '돌진 스탭', tags: ['charge_stride_step'] },
    projectileLaunch: { label: '투사체 발사', tags: ['projectile_launch'] }
});

const TAG_ALIASES = Object.freeze({
    날개짓: 'wing_flap',
    소경직: 'small_flinch_vocal',
    브레스적중: 'breath_impact',
    브레스발사: 'breath_shot',
    물리임팩트: 'physical_impact',
    회오리: 'tornado',
    천둥: 'thunder',
    발굽: 'hoof_step',
    '돌진 스탭': 'charge_stride_step',
    '바위 발사': 'projectile_launch',
    summersalt_vocal: 'somersault_vocal'
});

const MONSTER_NAMES = Object.freeze({
    em013: '밀라보레아스',
    em042: '벨리오로스',
    em050: '알바트리온',
    em057: '진오우거',
    em063: '브라키디오스',
    em080: '디노발드',
    em100: '안쟈나프',
    em101: '도스쟈그라스',
    em105: '제노-지바',
    em108: '쥬라토도스',
    em114: '라도발킨',
    em115: '발하자크 · 죽음을 두른 발하자크',
    em116: '도도가마루',
    em117: '맘-타로트',
    em121: '베히모스',
    em122: '브란토도스',
    em123: '버프바로',
    em124: '이베르카나',
    em125: '네로미에르',
    em126: '안-이슈왈다',
    em127: '레셴 · 고대 레셴',
    em118: '바젤기우스 · 홍련의 솟구치는 바젤기우스',
    em001: '리오레이아',
    em002: '리오레우스',
    em007: '디아블로스',
    em011: '키린',
    em018: '얀가루루가',
    em023: '라잔',
    em024: '크샬다오라',
    em026: '나나 테스카토리',
    em027: '테오 테스카토르',
    em032: '티가렉스',
    em036: '쥬라토도스 · 볼가노스',
    em037: '나르가쿠르가',
    em043: '이블조',
    em044: '볼보로스',
    em045: '우라간킨 · 라도발킨',
    em102: '푸케푸케',
    em103: '네르기간테',
    em104: '무페토 지바',
    em106: '조라 마그다라오스',
    em107: '쿠루루야크',
    em109: '토비카가치',
    em110: '파오우르무',
    em111: '레이기에나',
    em112: '도스기르오스',
    em113: '오도가론',
    em120: '치치야크'
});

function readJson(file, fallback) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return fallback;
    }
}

function evidenceScope(bank) {
    const normalized = String(bank || '').toLowerCase();
    if (/_vo(?:_|$)/.test(normalized)) {
        return { sourceLayer: 'voice', reuseScope: 'monster-identity' };
    }
    if (/_se(?:_|$)/.test(normalized)) {
        return { sourceLayer: 'sound-effect', reuseScope: 'cross-title-semantic' };
    }
    return { sourceLayer: 'unknown', reuseScope: 'unresolved' };
}

function orderedSources(event, aliases = []) {
    const clips = [];
    const seen = new Set();
    for (const variant of event.variants || []) {
        for (const clip of variant.decodedClips || []) {
            const key = String(clip.sourceId);
            if (seen.has(key)) continue;
            seen.add(key);
            clips.push({
                sourceId: Number(clip.sourceId),
                stream: clip.stream ?? null,
                duration: clip.duration ?? null,
                path: clip.path,
                variant: variant.variant,
                structure: variant.structure || []
            });
        }
    }
    for (const sourceId of event.sourceIds || []) {
        const key = String(sourceId);
        if (seen.has(key)) continue;
        const alias = aliases.find(item =>
            item.chunk === event.chunk
            && item.bank === event.bank
            && Number(item.sourceId) === Number(sourceId)
        );
        seen.add(key);
        clips.push({
            sourceId: Number(sourceId),
            stream: null,
            duration: null,
            path: alias?.canonicalPath || null,
            variant: null,
            structure: event.structures || []
        });
    }
    return clips;
}

function groupEvents(graph, labels) {
    const records = labels.records || [];
    const excludedSourceIds = new Set((labels.excludedSourceIds || []).map(Number));
    const seenGroups = new Set();
    return (graph.events || [])
        .map(event => {
            const sources = orderedSources(event, graph.deduplication?.aliases || [])
                .filter(source => !excludedSourceIds.has(Number(source.sourceId)));
            const sourceIds = new Set(sources.map(source => Number(source.sourceId)));
            const reviews = records.filter(record =>
                record.bank === event.bank
                && Number(record.eventId) === Number(event.eventId)
                && sourceIds.has(Number(record.sourceId))
            );
            const tagCounts = new Map();
            for (const review of reviews) {
                for (const tag of review.tags || []) {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                }
            }
            const groupTags = [...tagCounts.entries()]
                .filter(([, count]) => count === sources.length)
                .map(([tag]) => tag);
            return {
                key: `${event.bank}:${event.eventId}`,
                bank: event.bank,
                eventId: Number(event.eventId),
                ...evidenceScope(event.bank),
                structures: event.structures || ['single'],
                sources,
                groupTags,
                reviewedSources: reviews.length
            };
        })
        .filter(group => group.sources.length)
        .filter(group => {
            const signature = `${group.bank}:${group.eventId}:${group.sources
                .map(source => source.sourceId).sort((a, b) => a - b).join(',')}`;
            if (seenGroups.has(signature)) return false;
            seenGroups.add(signature);
            return true;
        })
        .sort((a, b) => a.bank.localeCompare(b.bank) || a.eventId - b.eventId);
}

function normalizeTags(category, customLabel) {
    if (PRESETS[category]) return [...PRESETS[category].tags];
    if (category !== 'custom') return [];
    return [...new Set(String(customLabel || '')
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .map(tag => TAG_ALIASES[tag] || tag))];
}

function normalizeStoredLabels(labelsPath = LABELS_PATH) {
    const labels = readJson(labelsPath, { version: 1, records: [], tagAliases: {} });
    let changedRecords = 0;
    labels.records = (labels.records || []).map(record => {
        const tags = [...new Set((record.tags || []).map(tag => TAG_ALIASES[tag] || tag))];
        if (JSON.stringify(tags) !== JSON.stringify(record.tags || [])) changedRecords += 1;
        return { ...record, tags, ...evidenceScope(record.bank) };
    });
    labels.tagAliases = { ...(labels.tagAliases || {}), ...TAG_ALIASES };
    labels.reusePolicy = {
        voice: 'monster-identity-only',
        soundEffect: 'cross-title-by-semantic-delivery-element-and-body-compatibility',
        unknown: 'never-route-until-resolved'
    };
    labels.normalizedAt = new Date().toISOString();
    const temporary = `${labelsPath}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(labels, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, labelsPath);
    return { changedRecords, records: labels.records.length };
}

function reviewStatusForGraphId(graphId, runtimePolicy = {}, bankMap = {}) {
    const monsterIds = bankMap[`${graphId}_vo`] || [];
    const completed = new Set(runtimePolicy.completedMonsterIds || []);
    const silentVoice = new Set(runtimePolicy.silentVoiceMonsterIds || []);
    if (monsterIds.some(id => silentVoice.has(id))) return 'silent-voice';
    if (monsterIds.some(id => completed.has(id))) return 'completed';
    return 'pending';
}

function saveReviewCompletion(
    { monster, completed = true },
    labelsPath = LABELS_PATH,
    bankMap = readJson(path.join(ROOT, 'data', 'hunt', 'world-monster-audio-banks.json'), {})
) {
    const graphId = String(monster || '').toLowerCase();
    if (!/^[a-z0-9_-]+$/i.test(graphId)) throw new Error('잘못된 몬스터 ID입니다.');
    const monsterIds = [...new Set(bankMap[`${graphId}_vo`] || [])];
    if (!monsterIds.length) throw new Error('몬스터 음성 은행 연결 정보를 찾을 수 없습니다.');

    const labels = readJson(labelsPath, {
        version: 1,
        monsterId: 'world-monsters',
        reviewMethod: 'local-event-group-audition',
        records: []
    });
    labels.runtimePolicy = labels.runtimePolicy || {};
    const completedIds = new Set(labels.runtimePolicy.completedMonsterIds || []);
    for (const monsterId of monsterIds) {
        if (completed) completedIds.add(monsterId);
        else completedIds.delete(monsterId);
    }
    labels.runtimePolicy.completedMonsterIds = [...completedIds].sort();
    labels.updatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(labelsPath), { recursive: true });
    const temporary = `${labelsPath}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(labels, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, labelsPath);
    return {
        monster: graphId,
        monsterIds,
        reviewStatus: completed ? 'completed' : 'pending'
    };
}

function saveGroupReview({ monster, bank, eventId, sourceIds, category, customLabel }, labelsPath = LABELS_PATH) {
    const tags = normalizeTags(category, customLabel);
    if (!monster || !bank || !Number.isFinite(Number(eventId)) || !Array.isArray(sourceIds)) {
        throw new Error('잘못된 이벤트 묶음입니다.');
    }
    const labels = readJson(labelsPath, {
        version: 1,
        monsterId: 'world-monsters',
        reviewMethod: 'local-event-group-audition',
        records: [],
        tagAliases: { summersalt_vocal: 'somersault_vocal' }
    });
    const idSet = new Set(sourceIds.map(Number));
    const keep = (labels.records || []).filter(record =>
        record.bank !== bank
        || Number(record.eventId) !== Number(eventId)
        || !idSet.has(Number(record.sourceId))
        || record.reviewMethod !== 'event-group-audition'
    );
    const protectedIds = new Set(keep
        .filter(record =>
            record.bank === bank
            && Number(record.eventId) === Number(eventId)
            && idSet.has(Number(record.sourceId))
        )
        .map(record => Number(record.sourceId)));
    const additions = tags.length
        ? sourceIds.filter(sourceId => !protectedIds.has(Number(sourceId))).map((sourceId, index) => ({
            monster,
            bank,
            eventId: Number(eventId),
            sourceId: Number(sourceId),
            reference: index === 0,
            tags,
            verdict: '확정',
            reviewMethod: 'event-group-audition',
            ...evidenceScope(bank)
        }))
        : [];
    labels.version = Math.max(1, Number(labels.version) || 1);
    labels.reviewMethod = 'local-event-group-audition';
    labels.updatedAt = new Date().toISOString();
    labels.records = [...keep, ...additions];
    fs.mkdirSync(path.dirname(labelsPath), { recursive: true });
    const temporary = `${labelsPath}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(labels, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, labelsPath);
    return { tags, savedSources: additions.length };
}

const HUNT_ID_TO_GRAPH_ID = Object.freeze({
    rathian: 'em001',
    rathalos: 'em001',
    diablos: 'em007',
    tigrex: 'em032',
    pukei_pukei: 'em102',
    legiana: 'em111',
    bazelgeuse: 'em118',
    nargacuga: 'em037',
    barioth: 'em042',
    zinogre: 'em057',
    brachydios: 'em063',
    glavenus: 'em080',
    anjanath: 'em100'
});

function resolveGraphId(idOrHuntId) {
    const id = String(idOrHuntId || '').toLowerCase();
    return HUNT_ID_TO_GRAPH_ID[id] || id;
}

const MONSTER_DISPLAY_LIST = [
    { id: 'rathian', name: '리오레이아', graphId: 'em001' },
    { id: 'rathalos', name: '리오레우스', graphId: 'em001' },
    { id: 'diablos', name: '디아블로스', graphId: 'em007' },
    { id: 'tigrex', name: '티가렉스', graphId: 'em032' },
    { id: 'legiana', name: '레이기에나', graphId: 'em111' },
    { id: 'bazelgeuse', name: '바젤기우스', graphId: 'em118' },
    { id: 'pukei_pukei', name: '푸케푸케', graphId: 'em102' }
];

function listMonsters(labelsPath = LABELS_PATH) {
    if (!fs.existsSync(GRAPH_ROOT)) return [];
    const runtimePolicy = readJson(labelsPath, { runtimePolicy: {} }).runtimePolicy || {};
    const bankMap = readJson(path.join(ROOT, 'data', 'hunt', 'world-monster-audio-banks.json'), {});
    
    const huntMonsters = MONSTER_DISPLAY_LIST.map(item => {
        const graphPath = path.join(GRAPH_ROOT, item.graphId, 'audio-graph.json');
        const graph = fs.existsSync(graphPath) ? readJson(graphPath, { events: [] }) : { events: [] };
        return {
            id: item.id,
            name: item.name,
            groups: groupEvents(graph, { records: [] }).length,
            reviewStatus: reviewStatusForGraphId(item.graphId, runtimePolicy, bankMap)
        };
    });

    const knownGraphIds = new Set(MONSTER_DISPLAY_LIST.map(item => item.graphId));
    const otherMonsters = fs.readdirSync(GRAPH_ROOT, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .filter(id => !knownGraphIds.has(id) && fs.existsSync(path.join(GRAPH_ROOT, id, 'audio-graph.json')))
        .sort()
        .map(id => {
            const graph = readJson(path.join(GRAPH_ROOT, id, 'audio-graph.json'), { events: [] });
            return {
                id,
                name: MONSTER_NAMES[id] || id,
                groups: groupEvents(graph, { records: [] }).length,
                reviewStatus: reviewStatusForGraphId(id, runtimePolicy, bankMap)
            };
        });

    return [...huntMonsters, ...otherMonsters];
}

function isLoopbackHost(value) {
    const hostname = String(value || '').split(':')[0].replace(/^\[|\]$/g, '').toLowerCase();
    return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';
}

function sendJson(response, status, value) {
    response.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
    });
    response.end(JSON.stringify(value));
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.setEncoding('utf8');
        request.on('data', chunk => {
            body += chunk;
            if (body.length > BODY_LIMIT) {
                reject(new Error('요청이 너무 큽니다.'));
                request.destroy();
            }
        });
        request.on('end', () => {
            try {
                resolve(JSON.parse(body || '{}'));
            } catch {
                reject(new Error('JSON 형식이 아닙니다.'));
            }
        });
        request.on('error', reject);
    });
}

function safeAudioPath(relativePath) {
    const normalized = String(relativePath || '').replace(/\\/g, '/');
    if (!normalized.toLowerCase().endsWith('.mp3')) return null;
    const absolute = path.resolve(ROOT, normalized);
    const relative = path.relative(AUDIO_ROOT, absolute);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
    return absolute;
}

function createServer(options = {}) {
    const labelsPath = options.labelsPath || LABELS_PATH;
    return http.createServer(async (request, response) => {
        if (!isLoopbackHost(request.headers.host)) {
            response.writeHead(403);
            response.end('Forbidden');
            return;
        }
        const url = new URL(request.url, `http://${request.headers.host}`);
        try {
            if (request.method === 'GET' && url.pathname === '/') {
                response.writeHead(200, {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-store',
                    'X-Content-Type-Options': 'nosniff'
                });
                response.end(fs.readFileSync(UI_PATH));
                return;
            }
            if (request.method === 'GET' && url.pathname === '/api/monsters') {
                sendJson(response, 200, { monsters: listMonsters(labelsPath), presets: PRESETS });
                return;
            }
            if (request.method === 'GET' && url.pathname === '/api/groups') {
                const monster = String(url.searchParams.get('monster') || '');
                if (!/^[a-z0-9_-]+$/i.test(monster)) throw new Error('잘못된 몬스터 ID입니다.');
                const graphId = resolveGraphId(monster);
                const graphPath = path.join(GRAPH_ROOT, graphId, 'audio-graph.json');
                if (!fs.existsSync(graphPath)) {
                    sendJson(response, 404, { error: '아직 이벤트 그래프가 준비되지 않았습니다.' });
                    return;
                }
                const graph = readJson(graphPath, { events: [] });
                const labels = readJson(labelsPath, { records: [] });
                sendJson(response, 200, {
                    monster,
                    name: MONSTER_DISPLAY_LIST.find(m => m.id === monster)?.name || MONSTER_NAMES[monster] || monster,
                    groups: groupEvents(graph, labels)
                });
                return;
            }
            if (request.method === 'GET' && url.pathname === '/api/hunt-patterns') {
                const huntId = String(url.searchParams.get('monster') || '').toLowerCase();
                if (!/^[a-z0-9_]+$/i.test(huntId)) throw new Error('잘못된 몬스터 ID입니다.');
                sendJson(response, 200, loadHuntPatternAudioMap(huntId));
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/hunt-pattern-route') {
                const result = savePatternRoute(await readBody(request));
                sendJson(response, 200, { ok: true, ...result });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/group-label') {
                const result = saveGroupReview(await readBody(request), labelsPath);
                const runtime = labelsPath === LABELS_PATH
                    ? generateReviewRoutes({ labelsPath })
                    : null;
                sendJson(response, 200, { ok: true, ...result, runtime });
                return;
            }
            if (request.method === 'POST' && url.pathname === '/api/review-completion') {
                const result = saveReviewCompletion(await readBody(request), labelsPath);
                sendJson(response, 200, { ok: true, ...result });
                return;
            }
            if (request.method === 'GET' && url.pathname === '/audio') {
                const audioPath = safeAudioPath(url.searchParams.get('path'));
                if (!audioPath || !fs.existsSync(audioPath)) {
                    response.writeHead(404);
                    response.end('Not found');
                    return;
                }
                response.writeHead(200, {
                    'Content-Type': 'audio/mpeg',
                    'Cache-Control': 'private, max-age=3600',
                    'X-Content-Type-Options': 'nosniff'
                });
                fs.createReadStream(audioPath).pipe(response);
                return;
            }
            response.writeHead(404);
            response.end('Not found');
        } catch (error) {
            sendJson(response, 400, { error: error.message });
        }
    });
}

function main() {
    const portArg = process.argv.find(arg => arg.startsWith('--port='));
    const port = Number(portArg?.split('=')[1]) || DEFAULT_PORT;
    createServer().listen(port, HOST, () => {
        console.log(`[monster-audio-review] http://${HOST}:${port}`);
    });
}

if (require.main === module) main();

module.exports = {
    PRESETS,
    TAG_ALIASES,
    createServer,
    evidenceScope,
    groupEvents,
    listMonsters,
    normalizeStoredLabels,
    normalizeTags,
    orderedSources,
    reviewStatusForGraphId,
    saveReviewCompletion,
    saveGroupReview
};
