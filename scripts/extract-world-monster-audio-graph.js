#!/usr/bin/env node
'use strict';

// Preserve the installed World Wwise graph before assigning gameplay meaning.
// Output is local-only under local_assets/monster_hunter and never publishes
// extracted media or raw HIRC data.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WORLD_ROOT = path.join(ROOT, 'game_extracts', 'world');
const RUNTIME_ROOT = path.join(ROOT, 'local_assets', 'monster_hunter', 'world');
const MANIFEST = path.join(RUNTIME_ROOT, 'manifest.json');
const AUDITIONS = path.join(ROOT, 'data', 'hunt', 'world-monster-audio-auditions.json');
const REVIEW_LABELS = path.join(ROOT, 'data', 'hunt', 'world-monster-audio-review-labels.json');
const WWISER = path.join(ROOT, 'game_extracts', 'tools', 'wwiser', 'wwiser.py');
const VGMSTREAM = path.join(ROOT, 'game_extracts', 'tools', 'vgmstream', 'vgmstream-cli.exe');
const FFMPEG = process.env.FFMPEG_PATH || 'D:\\VideoDownload\\ffmpeg\\bin\\ffmpeg.exe';
const PYTHON = process.env.PYTHON_PATH || 'python';

function readJson(file, fallback) {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function walk(folder, output = []) {
    if (!fs.existsSync(folder)) return output;
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
        const file = path.join(folder, entry.name);
        if (entry.isDirectory()) walk(file, output);
        else output.push(file);
    }
    return output;
}

function safeName(value) {
    return String(value).replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

function relativeRoot(file) {
    return path.relative(ROOT, file).replace(/\\/g, '/');
}

function discoverBankSets(monsterId) {
    if (!/^em\d{3}$/i.test(monsterId)) {
        throw new Error(`Expected a World monster bank id such as em001, received: ${monsterId}`);
    }
    return fs.readdirSync(WORLD_ROOT, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && /^chunkG\d+$/i.test(entry.name))
        .map(entry => {
            const bankRoot = path.join(WORLD_ROOT, entry.name, 'sound', 'wwise', 'Windows');
            const monsterBanks = fs.existsSync(bankRoot)
                ? fs.readdirSync(bankRoot)
                    .filter(name => new RegExp(`^${monsterId}(?:_|\\.)`, 'i').test(name) && /\.nbnk$/i.test(name))
                    .map(name => path.join(bankRoot, name))
                    .sort()
                : [];
            const init = path.join(bankRoot, 'Init.nbnk');
            return {
                chunk: entry.name,
                bankRoot,
                monsterBanks,
                inputs: [...(fs.existsSync(init) ? [init] : []), ...monsterBanks]
            };
        })
        .filter(group => group.monsterBanks.length)
        .sort((a, b) => a.chunk.localeCompare(b.chunk, undefined, { numeric: true }));
}

function sourceIds(text) {
    return [...new Set([
        ...[...text.matchAll(/(?:^|\n)\s*(?:wem\/)?(?:[^#\n]+\s+)?#s\d+\s+#[ie]\s+##(\d+)\.wem/gi)].map(match => match[1]),
        ...[...text.matchAll(/(?:^|\n)\s*(?:wem\/)?(\d+)\.wem\s+#[ie]\b/gi)].map(match => match[1]),
        ...[...text.matchAll(/##(\d+)\.wem\b/gi)].map(match => match[1])
    ])];
}

function streamOrdinals(text) {
    return [...new Set([...text.matchAll(/#s(\d+)\s+#[ie]\b/gi)].map(match => Number(match[1])))];
}

function sourceRefs(text) {
    // wwiser may place playback modifiers (for example `#v -3.0dB`)
    // between the embedded stream marker and the semantic WEM source id.
    // Keep the match on one recipe line so unrelated source ids cannot pair.
    return [...text.matchAll(/#s(\d+)\s+#[ie]\b[^\r\n]*?##(\d+)\.wem/gi)].map(match => ({
        streamOrdinal: Number(match[1]),
        sourceId: Number(match[2])
    }));
}

function hircNodes(text) {
    return [...new Set([...text.matchAll(/^\s*#\s+(CAk[A-Za-z0-9_]+)/gm)].map(match => match[1]))];
}

function gameSyncs(fileName) {
    return [...fileName.matchAll(/\[([^=\]]+)=([^\]]+)\]/g)].map(match => ({
        groupId: match[1],
        valueId: match[2]
    }));
}

function structureFrom(text, fileName) {
    const nodes = hircNodes(text);
    const modes = [];
    if (/\{r\}/i.test(fileName) || /\[Random\]/i.test(text)) modes.push('random');
    if (/\[Sequence\]/i.test(text)) modes.push('sequence');
    if (nodes.includes('CAkLayerCntr')) modes.push('layer');
    if (nodes.includes('CAkSwitchCntr')) modes.push('switch');
    if (nodes.includes('CAkDialogueEvent')) modes.push('dialogue');
    if (!modes.length) modes.push('single');
    return [...new Set(modes)];
}

function pathTrace(text) {
    const section = text.match(/# PATH\r?\n([\s\S]*?)(?:\r?\n# GAMEVARS|\r?\n# STATECHUNKS|\r?\n#\s*$)/);
    if (!section) return [];
    return section[1].split(/\r?\n/)
        .map(line => line.replace(/^\s*#\s?/, '').trimEnd())
        .filter(Boolean);
}

function propertyLines(text) {
    return text.split(/\r?\n/)
        .filter(line => /^\s*#\s+\*/.test(line))
        .map(line => line.replace(/^\s*#\s+\*\s*/, '').trim());
}

function parseTxtp(file, chunk, decodedIndex, annotationIndex) {
    const name = path.basename(file);
    const eventId = name.match(/event-(\d+)/i)?.[1];
    if (!eventId) return null;
    const text = fs.readFileSync(file, 'utf8');
    const bank = name.match(/^(.+?)-\d+-event-/i)?.[1] || 'unknown';
    const ids = sourceIds(text);
    const annotations = [];
    for (const sourceId of ids) {
        for (const annotation of annotationIndex.get(sourceId) || []) {
            if (annotation.bank && annotation.bank !== bank) continue;
            if (annotation.eventIds.length && !annotation.eventIds.includes(Number(eventId))) continue;
            if (annotation.chunk && annotation.chunk !== chunk) continue;
            const key = JSON.stringify([annotation.sourceId, annotation.monsterId, annotation.tags, annotation.note]);
            if (!annotations.some(item => item.key === key)) annotations.push({ key, ...annotation });
        }
    }
    return {
        eventId: Number(eventId),
        bank,
        chunk,
        variant: name.replace(/\.txtp$/i, ''),
        structure: structureFrom(text, name),
        gameSyncs: gameSyncs(name),
        sourceIds: ids.map(Number),
        streamOrdinals: streamOrdinals(text),
        sourceRefs: sourceRefs(text),
        decodedClips: ids.flatMap(sourceId =>
            (decodedIndex.get(`${chunk}:${bank}:${sourceId}`) || []).map(entry => ({
                sourceId: Number(sourceId),
                stream: entry.stream,
                duration: entry.duration,
                path: entry.path
            }))
        ),
        hircNodes: hircNodes(text),
        pathTrace: pathTrace(text),
        properties: propertyLines(text),
        recipe: text.split(/\r?\n/)
            .map(line => line.trimEnd())
            .filter(line => line.trim() && !line.trimStart().startsWith('#')),
        annotations: annotations.map(({ key, ...annotation }) => annotation),
        rawTxtp: relativeRoot(file)
    };
}

function decodedClipIndex(manifest) {
    const index = new Map();
    for (const entry of manifest.entries || []) {
        const sourceId = String(entry.sourceStream || '');
        const chunk = String(entry.sourceBank || '').replace(/\\/g, '/').split('/')[0];
        const bank = path.basename(String(entry.sourceBank || '')).replace(/\.nbnk$/i, '');
        if (!sourceId || !chunk || !bank) continue;
        const key = `${chunk}:${bank}:${sourceId}`;
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(entry);
    }
    return index;
}

function annotationIndex(auditions, reviews = { records: [], tagAliases: {} }) {
    const index = new Map();
    for (const entry of auditions.entries || []) {
        const sourceId = String(entry.sourceStream || '');
        if (!sourceId) continue;
        if (!index.has(sourceId)) index.set(sourceId, []);
        index.get(sourceId).push({
            sourceId: Number(sourceId),
            bank: entry.bank || null,
            eventIds: (entry.eventIds || []).map(Number),
            // Existing audition entries were made against the canonical base
            // extraction. A matching source ID in an expansion chunk is not
            // assumed to have identical media without a separate audition.
            chunk: entry.chunk || 'chunkG0',
            monsterId: entry.monsterId || null,
            tags: [...new Set(entry.semanticCandidates || [])],
            note: entry.audition || '',
            confidence: entry.actionRoutingApproved ? 'user-confirmed-action-family' : 'user-review-hint',
            mutable: true
        });
    }
    for (const review of reviews.records || []) {
        const sourceId = String(review.sourceId || '');
        if (!sourceId) continue;
        const current = index.get(sourceId) || [];
        index.set(sourceId, current.filter(annotation =>
            annotation.chunk !== (review.chunk || 'chunkG0')
            || annotation.bank !== review.bank
            || !annotation.eventIds.includes(Number(review.eventId))
        ));
        if (!['확정', '비슷함'].includes(review.verdict) || !(review.tags || []).length) continue;
        const normalizedTags = [...new Set((review.tags || []).map(tag =>
            reviews.tagAliases?.[tag] || tag
        ))];
        index.get(sourceId).push({
            sourceId: Number(sourceId),
            bank: review.bank,
            eventIds: [Number(review.eventId)],
            chunk: review.chunk || 'chunkG0',
            monsterId: reviews.monsterId || null,
            tags: normalizedTags,
            rawTags: [...new Set(review.tags || [])],
            note: `사용자 검수판 ${review.verdict}`,
            confidence: review.verdict === '확정' ? 'user-review-confirmed' : 'user-review-similar',
            verdict: review.verdict,
            reference: Boolean(review.reference),
            mutable: true
        });
    }
    return index;
}

function run(command, args) {
    const result = spawnSync(command, args, {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024
    });
    if (result.status !== 0) {
        const detail = String(result.stderr || result.stdout || '').trim().slice(-2000);
        throw new Error(`${path.basename(command)} failed (${result.status}): ${detail}`);
    }
}

function extractSet(group, outputRoot, fresh) {
    const output = path.join(outputRoot, group.chunk);
    const txtp = path.join(output, 'txtp');
    const bankFingerprint = group.inputs.map(file => ({
        path: relativeRoot(file),
        size: fs.statSync(file).size,
        sha256: sha256(file)
    }));
    const completion = path.join(output, 'extraction.json');
    const previous = readJson(completion, null);
    const fingerprint = crypto.createHash('sha256')
        .update(JSON.stringify(bankFingerprint))
        .digest('hex');
    if (fresh || previous?.fingerprint !== fingerprint || !fs.existsSync(txtp)) {
        fs.rmSync(output, { recursive: true, force: true });
        fs.mkdirSync(txtp, { recursive: true });
        const dumpBase = path.join(output, 'original-hirc');
        run(PYTHON, [WWISER, '-d', 'xml', '-dn', dumpBase, ...group.inputs]);
        run(PYTHON, [
            WWISER, '-g', '-gu', '-gd', '-gde', '-gwd',
            '-go', txtp, '-gnw', '-gxni', ...group.inputs
        ]);
        fs.writeFileSync(completion, `${JSON.stringify({
            fingerprint,
            generatedAt: new Date().toISOString(),
            inputs: bankFingerprint,
            policy: 'raw-installed-hirc-before-semantic-labels'
        }, null, 2)}\n`, 'utf8');
    }
    return output;
}

function compactEvents(variants) {
    const events = new Map();
    for (const variant of variants) {
        const key = `${variant.chunk}:${variant.bank}:${variant.eventId}`;
        if (!events.has(key)) {
            events.set(key, {
                chunk: variant.chunk,
                bank: variant.bank,
                eventId: variant.eventId,
                structures: [],
                sourceIds: [],
                decodedClipCount: 0,
                variants: []
            });
        }
        const event = events.get(key);
        variant.structure.forEach(mode => {
            if (!event.structures.includes(mode)) event.structures.push(mode);
        });
        variant.sourceIds.forEach(id => {
            if (!event.sourceIds.includes(id)) event.sourceIds.push(id);
        });
        event.decodedClipCount += variant.decodedClips.length;
        event.variants.push(variant);
    }
    return [...events.values()].sort((a, b) =>
        a.chunk.localeCompare(b.chunk, undefined, { numeric: true })
        || a.bank.localeCompare(b.bank)
        || a.eventId - b.eventId
    );
}

function report(monsterId, sets, events, decodedEntries) {
    const variants = events.flatMap(event => event.variants);
    const structures = {};
    variants.flatMap(variant => variant.structure).forEach(mode => {
        structures[mode] = (structures[mode] || 0) + 1;
    });
    const uniqueSources = new Set(variants.flatMap(variant =>
        variant.sourceIds.map(sourceId => `${variant.chunk}:${variant.bank}:${sourceId}`)
    ));
    const mappedSources = new Set(variants.flatMap(variant =>
        variant.decodedClips.map(clip => `${variant.chunk}:${variant.bank}:${clip.sourceId}`)
    ));
    const annotatedSources = new Set(variants.flatMap(variant =>
        variant.annotations.map(annotation => `${variant.chunk}:${variant.bank}:${annotation.sourceId}`)
    ));
    const referencedDecodedPaths = new Set(variants.flatMap(variant =>
        variant.decodedClips.map(clip => clip.path)
    ));
    const decodedWithoutGraph = decodedEntries
        .filter(entry => !referencedDecodedPaths.has(entry.path))
        .map(entry => ({
            chunk: String(entry.sourceBank || '').replace(/\\/g, '/').split('/')[0],
            bank: path.basename(String(entry.sourceBank || '')).replace(/\.nbnk$/i, ''),
            sourceId: Number(entry.sourceStream),
            stream: entry.stream,
            duration: entry.duration,
            path: entry.path
        }));
    const graphWithoutDecoded = [...uniqueSources]
        .filter(key => !mappedSources.has(key))
        .map(key => {
            const [chunk, bank, sourceId] = key.split(':');
            return { chunk, bank, sourceId: Number(sourceId) };
        });
    return {
        version: 1,
        monsterId,
        generatedAt: new Date().toISOString(),
        evidencePolicy: {
            rawGraph: 'Installed bank HIRC and wwiser TXTP preserve playback structure.',
            semantics: 'User labels are mutable multi-tags and never alter the raw graph.',
            limitation: 'An event recipe proves playback structure, not the gameplay move name. Motion/trigger evidence or audition is still required.'
        },
        bankSets: sets.map(set => ({
            chunk: set.chunk,
            inputs: set.inputs.map(relativeRoot)
        })),
        summary: {
            bankSets: sets.length,
            events: events.length,
            variants: variants.length,
            uniqueSourceIds: uniqueSources.size,
            decodedSourceIds: mappedSources.size,
            userAnnotatedSourceIds: annotatedSources.size,
            decodedClipsWithoutGraph: decodedWithoutGraph.length,
            graphSourceIdsWithoutDecodedClip: graphWithoutDecoded.length,
            structures
        },
        coverageGaps: {
            decodedWithoutGraph,
            graphWithoutDecoded
        },
        events
    };
}

function writeReadme(outputRoot, graph) {
    const summary = graph.summary;
    const lines = [
        `# ${graph.monsterId} 원본 Wwise 오디오 그래프`,
        '',
        '이 폴더는 의미를 추측해 분류한 결과가 아니라 설치된 뱅크의 재생 구조 보존본이다.',
        '',
        `- 뱅크 세트: ${summary.bankSets}`,
        `- 이벤트: ${summary.events}`,
        `- 상태/랜덤 변형: ${summary.variants}`,
        `- 고유 Source ID: ${summary.uniqueSourceIds}`,
        `- 디코딩 음원 연결: ${summary.decodedSourceIds}`,
        `- 사용자 태그가 있는 Source ID: ${summary.userAnnotatedSourceIds}`,
        `- 이벤트가 연결되지 않은 디코딩 음원: ${summary.decodedClipsWithoutGraph}`,
        `- 디코딩 음원이 없는 그래프 Source ID: ${summary.graphSourceIdsWithoutDecodedClip}`,
        `- 중복 제거 원본으로 역연결: ${summary.dedupAliasSourceOccurrences || 0}`,
        `- 끝까지 미해결된 그래프 Source ID: ${summary.unresolvedGraphSourceOccurrences || 0}`,
        `- 구조별 변형: ${Object.entries(summary.structures).map(([key, value]) => `${key} ${value}`).join(', ')}`,
        '',
        '## 읽는 순서',
        '',
        '1. `audio-graph.json`에서 이벤트와 source 연결을 검색한다.',
        '2. 각 변형의 `rawTxtp`를 열어 Random/Sequence/Switch/Layer와 지연을 확인한다.',
        '3. 청크별 `original-hirc.xml`은 파싱 전 원본 HIRC 덤프다.',
        '4. `user-tags.generated.json`은 교정 가능한 복수 태그이며 원본 구조의 일부가 아니다.',
        '',
        '같은 이벤트에 여러 source가 있어도 반드시 동시 재생이라는 뜻은 아니다. `structure`, `recipe`, `pathTrace`를 함께 봐야 한다.',
        ''
    ];
    fs.writeFileSync(path.join(outputRoot, 'README.md'), lines.join('\n'), 'utf8');
}

function writeKnownNeighborhoods(outputRoot, graph) {
    const entries = graph.events
        .filter(event => event.chunk === 'chunkG0')
        .map(event => {
            const annotations = event.variants.flatMap(variant => variant.annotations);
            if (!annotations.length) return null;
            const knownSourceIds = [...new Set(annotations.map(annotation => annotation.sourceId))];
            return {
                bank: event.bank,
                eventId: event.eventId,
                structures: event.structures,
                eventSourceIds: event.sourceIds,
                knownSources: annotations.map(annotation => ({
                    sourceId: annotation.sourceId,
                    tags: annotation.tags,
                    note: annotation.note,
                    confidence: annotation.confidence
                })),
                unreviewedSiblingSourceIds: event.sourceIds.filter(id => !knownSourceIds.includes(id)),
                interpretation: 'same-event-neighbor-only',
                warning: 'A shared event proves a playback relationship, not identical semantics. Switch, sequence, and layer branches must be interpreted before copying tags.'
            };
        })
        .filter(Boolean);
    fs.writeFileSync(path.join(outputRoot, 'known-event-neighborhoods.generated.json'), `${JSON.stringify({
        version: 1,
        policy: 'original-event-structure-first',
        entries
    }, null, 2)}\n`, 'utf8');
}

function writeAuditionReview(outputRoot, monsterId) {
    const displayName = monsterId === 'em001'
        ? '레우스·레이아 공유 뱅크 (em001)'
        : monsterId;
    const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${displayName} 원본 음원 검수판</title>
<style>
:root{color-scheme:dark;--bg:#0b0d12;--panel:#151923;--line:#30394d;--text:#f5f7fb;--muted:#9da7ba;--gold:#ffca55;--blue:#69b9ff;--green:#5de0a0;--red:#ff7474}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 50% -20%,#283249 0,#0b0d12 48%);color:var(--text);font-family:"Pretendard","Noto Sans KR",sans-serif}
header{position:sticky;top:0;z-index:10;padding:20px 28px 16px;background:rgba(11,13,18,.94);border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}
h1{margin:0 0 8px;font-size:28px}.summary{color:var(--muted);font-size:14px}.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
button,input,select{font:inherit}.toolbar button,.toolbar select,.toolbar input{min-height:42px;border:1px solid var(--line);border-radius:10px;background:#111722;color:var(--text);padding:0 13px}
.toolbar input{width:320px}.toolbar button.active{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset;color:var(--gold)}
main{max-width:1480px;margin:0 auto;padding:22px 28px 130px}.guide{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.guide div{padding:12px 14px;border:1px solid var(--line);border-radius:10px;background:rgba(21,25,35,.86);font-size:13px}.guide b{display:block;margin-bottom:4px;color:var(--gold)}
.event{margin:0 0 16px;border:2px solid #252d3c;border-radius:14px;background:linear-gradient(135deg,rgba(24,29,41,.98),rgba(16,19,27,.98));overflow:hidden}
.event.known{border-color:#66552d;box-shadow:0 0 20px rgba(255,202,85,.08)}.event-head{display:flex;align-items:center;gap:9px;padding:14px 16px;border-bottom:1px solid var(--line)}
.event-title{font-weight:900;font-size:18px}.chip{padding:4px 8px;border-radius:7px;background:#222b3b;color:#c9d2e1;font-size:12px;font-weight:800}.chip.random{color:#ffe097}.chip.sequence{color:#93d6ff}.chip.layer{color:#9ef0c2}.chip.switch{color:#d8b4ff}
.sources{display:grid;gap:8px;padding:12px}.source{display:grid;grid-template-columns:62px 150px minmax(260px,1fr) minmax(260px,1.2fr) auto;align-items:center;gap:10px;padding:10px;border:1px solid #293244;border-radius:10px;background:#111620}
.source.reference{border-color:#8b7439;background:#1c1a14}.play{height:42px;border:0;border-radius:10px;background:#2d77be;color:white;font-size:20px;cursor:pointer}.play.playing{background:var(--gold);color:#17120a}
.source-id{font-family:ui-monospace,monospace;color:#a9b8ce}.identity b{display:block;color:var(--gold)}.identity small{display:block;color:var(--muted);margin-top:3px}.tags{width:100%;height:40px;border:1px solid var(--line);border-radius:8px;background:#0c1017;color:white;padding:0 10px}
.verdicts{display:flex;gap:5px}.verdicts button{height:36px;border:1px solid var(--line);border-radius:7px;background:#1a2130;color:#cbd3e0;padding:0 9px;cursor:pointer}.verdicts button.selected{border-color:var(--green);color:var(--green);box-shadow:0 0 10px rgba(93,224,160,.25)}
.empty{padding:60px;text-align:center;color:var(--muted)}.player{position:fixed;left:50%;bottom:18px;z-index:20;transform:translateX(-50%);display:flex;align-items:center;gap:14px;width:min(1060px,calc(100% - 40px));padding:13px 18px;border:1px solid #53627c;border-radius:14px;background:rgba(15,19,27,.96);box-shadow:0 14px 45px #000}
.now{min-width:270px}.now b{display:block;color:var(--gold)}.now small{color:var(--muted)}audio{width:100%}
@media(max-width:1000px){.guide{grid-template-columns:1fr 1fr}.source{grid-template-columns:54px 130px 1fr}.source .tags,.source .verdicts{grid-column:2/-1}.player{bottom:8px}.now{min-width:180px}}
</style>
</head>
<body>
<header>
  <h1>🐉 ${displayName} 원본 음원 검수판</h1>
  <div class="summary" id="summary">원본 Wwise 그래프를 읽는 중…</div>
  <div class="toolbar">
    <button id="knownOnly" class="active">내가 알아본 이벤트</button>
    <button id="allEvents">전체 이벤트</button>
    <input id="search" placeholder="태그, 메모, 이벤트·Source 번호 검색">
    <select id="structure"><option value="">모든 구조</option><option>random</option><option>sequence</option><option>layer</option><option>switch</option><option>single</option></select>
    <button id="export">검수 결과 복사</button>
  </div>
</header>
<main>
  <section class="guide">
    <div><b>RANDOM</b>후보 중 하나가 재생됨</div><div><b>SEQUENCE</b>정해진 순서로 이어짐</div>
    <div><b>LAYER</b>여러 파편이 동시에 겹침</div><div><b>SWITCH</b>상태·개체 조건에 따라 갈림</div>
  </section>
  <section id="events"></section>
</main>
<div class="player"><div class="now"><b id="nowTitle">음원을 선택하세요</b><small id="nowMeta">기준음부터 듣는 것을 권장합니다.</small></div><audio id="audio" controls></audio></div>
<script>
const MONSTER=${JSON.stringify(monsterId)};
const STORE_KEY='bubblechat-audio-review:'+MONSTER;
const state={knownOnly:true,search:'',structure:'',reviews:JSON.parse(localStorage.getItem(STORE_KEY)||'{}'),playing:null};
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pathUrl=value=>'../../../../../'+String(value).replace(/^local_assets\\//,'local_assets/');
let graph,known,eventRows=[];
function clipFor(event,sourceId){
  for(const variant of event.variants)for(const clip of variant.decodedClips)if(clip.sourceId===sourceId)return clip.path;
  return graph.deduplication.aliases.find(a=>a.chunk===event.chunk&&a.bank===event.bank&&a.sourceId===sourceId)?.canonicalPath||null;
}
function knownMap(entry){return new Map((entry?.knownSources||[]).map(x=>[x.sourceId,x]));}
function render(){
  const root=document.getElementById('events');root.textContent='';
  const needle=state.search.trim().toLowerCase();
  const rows=eventRows.filter(row=>{
    if(state.knownOnly&&!row.known)return false;
    if(state.structure&&!row.event.structures.includes(state.structure))return false;
    if(!needle)return true;
    return JSON.stringify(row).toLowerCase().includes(needle);
  });
  if(!rows.length){root.innerHTML='<div class="empty">조건에 맞는 이벤트가 없습니다.</div>';return}
  for(const row of rows){
    const event=row.event, refs=knownMap(row.known), card=document.createElement('article');
    card.className='event'+(row.known?' known':'');
    card.innerHTML='<div class="event-head"><span class="event-title">'+esc(event.bank)+' · EVENT '+event.eventId+'</span>'+event.structures.map(x=>'<span class="chip '+esc(x)+'">'+esc(x.toUpperCase())+'</span>').join('')+'<span class="chip">'+event.sourceIds.length+' SOURCES</span></div><div class="sources"></div>';
    const sources=card.querySelector('.sources');
    const ordered=[...event.sourceIds].sort((a,b)=>(refs.has(b)?1:0)-(refs.has(a)?1:0));
    for(const sourceId of ordered){
      const ref=refs.get(sourceId),key=event.bank+':'+event.eventId+':'+sourceId,review=state.reviews[key]||{},clip=clipFor(event,sourceId);
      const item=document.createElement('div');item.className='source'+(ref?' reference':'');
      item.innerHTML='<button class="play" '+(clip?'':'disabled')+'>▶</button><span class="source-id">'+sourceId+'</span><span class="identity">'+(ref?'<b>기준음 · '+esc(ref.note)+'</b><small>'+esc(ref.tags.join(' · '))+'</small>':'<b style="color:#d6dce7">같은 이벤트의 미검증 파편</b><small>원본 구조만 연결됨</small>')+'</span><input class="tags" value="'+esc(review.tags??(ref?.tags||[]).join(', '))+'" placeholder="태그 여러 개: 쉼표로 구분"><span class="verdicts">'+['확정','비슷함','다름','모르겠음'].map(v=>'<button class="'+(review.verdict===v?'selected':'')+'" data-v="'+v+'">'+v+'</button>').join('')+'</span>';
      item.querySelector('.play').onclick=()=>play(clip,event,sourceId,ref,item);
      item.querySelector('.tags').onchange=e=>save(key,{...review,tags:e.target.value});
      item.querySelectorAll('.verdicts button').forEach(button=>button.onclick=()=>{save(key,{...(state.reviews[key]||review),verdict:button.dataset.v});render()});
      sources.appendChild(item);
    }
    root.appendChild(card);
  }
}
function save(key,value){state.reviews[key]=value;localStorage.setItem(STORE_KEY,JSON.stringify(state.reviews))}
function play(clip,event,sourceId,ref,item){
  if(!clip)return;const audio=document.getElementById('audio');audio.src='/'+clip;audio.play();
  document.querySelectorAll('.play').forEach(x=>x.classList.remove('playing'));item.querySelector('.play').classList.add('playing');
  document.getElementById('nowTitle').textContent=(ref?'기준음 · ':'미검증 · ')+sourceId;
  document.getElementById('nowMeta').textContent=event.bank+' / EVENT '+event.eventId+' / '+event.structures.join('+');
}
async function init(){
  const dataRoot='/local_assets/monster_hunter/world/audio_graph/'+MONSTER+'/';
  [graph,known]=await Promise.all([fetch(dataRoot+'audio-graph.json').then(r=>r.json()),fetch(dataRoot+'known-event-neighborhoods.generated.json').then(r=>r.json())]);
  const knownIndex=new Map(known.entries.map(x=>[x.bank+':'+x.eventId,x]));
  eventRows=graph.events.filter(e=>e.chunk==='chunkG0').map(event=>({event,known:knownIndex.get(event.bank+':'+event.eventId)||null}));
  eventRows.sort((a,b)=>(b.known?1:0)-(a.known?1:0)||a.event.bank.localeCompare(b.event.bank)||a.event.eventId-b.event.eventId);
  document.getElementById('summary').textContent=graph.summary.events+'개 이벤트 · '+graph.summary.variants+'개 변형 · 원본 소스 미해결 '+graph.summary.unresolvedGraphSourceOccurrences+'개';
  render();
}
const knownOnlyButton=document.getElementById('knownOnly'),allEventsButton=document.getElementById('allEvents'),exportButton=document.getElementById('export');
knownOnlyButton.onclick=()=>{state.knownOnly=true;knownOnlyButton.classList.add('active');allEventsButton.classList.remove('active');render()};
allEventsButton.onclick=()=>{state.knownOnly=false;allEventsButton.classList.add('active');knownOnlyButton.classList.remove('active');render()};
document.getElementById('search').oninput=e=>{state.search=e.target.value;render()};
document.getElementById('structure').onchange=e=>{state.structure=e.target.value;render()};
exportButton.onclick=async()=>{const payload=JSON.stringify({version:1,monsterId:MONSTER,reviewedAt:new Date().toISOString(),reviews:state.reviews},null,2);await navigator.clipboard.writeText(payload);exportButton.textContent='복사 완료';setTimeout(()=>exportButton.textContent='검수 결과 복사',1200)};
init().catch(error=>{document.getElementById('events').innerHTML='<div class="empty">검수 자료를 불러오지 못했습니다: '+esc(error.message)+'</div>'});
</script>
</body>
</html>`;
    fs.writeFileSync(path.join(outputRoot, 'audition-review.html'), html, 'utf8');
}

function resolveDedupAliases(graph, manifest, sets, outputRoot) {
    const decodedBySource = new Map();
    for (const entry of manifest.entries || []) {
        const id = Number(entry.sourceStream);
        if (!Number.isFinite(id)) continue;
        if (!decodedBySource.has(id)) decodedBySource.set(id, []);
        decodedBySource.get(id).push(entry);
    }
    const aliases = [];
    const unresolved = [];
    const gaps = graph.coverageGaps.graphWithoutDecoded;
    for (const gap of gaps) {
        const sameId = decodedBySource.get(gap.sourceId)?.[0];
        if (sameId) {
            aliases.push({
                ...gap,
                canonicalPath: sameId.path,
                canonicalSourceId: Number(sameId.sourceStream),
                proof: 'identical-wwise-source-id'
            });
        } else {
            unresolved.push(gap);
        }
    }
    if (!unresolved.length || !fs.existsSync(VGMSTREAM) || !fs.existsSync(FFMPEG)) {
        return { aliases, unresolved, probeAvailable: !unresolved.length };
    }
    const canonicalByHash = new Map((manifest.entries || []).map(entry => [entry.sha256, entry]));
    const tempRoot = path.resolve(outputRoot, '.dedup-probe');
    if (!tempRoot.startsWith(path.resolve(outputRoot) + path.sep)) {
        throw new Error(`Unsafe dedup probe path: ${tempRoot}`);
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
    fs.mkdirSync(tempRoot, { recursive: true });
    const resolvedSources = new Map();
    const stagedBanks = new Map();
    for (const gap of unresolved) {
        const gapKey = `${gap.chunk}:${gap.bank}:${gap.sourceId}`;
        if (resolvedSources.has(gapKey)) continue;
        const variant = graph.events
            .filter(event => event.chunk === gap.chunk && event.bank === gap.bank)
            .flatMap(event => event.variants)
            .find(item => item.sourceRefs.some(ref => ref.sourceId === gap.sourceId));
        const streamOrdinal = variant?.sourceRefs.find(ref => ref.sourceId === gap.sourceId)?.streamOrdinal;
        const set = sets.find(item => item.chunk === gap.chunk);
        const bank = set?.monsterBanks.find(file =>
            path.basename(file).replace(/\.nbnk$/i, '') === gap.bank
        );
        if (!bank || !streamOrdinal) continue;
        const stem = `${gap.chunk}_${gap.bank}_${gap.sourceId}`;
        const wav = path.join(tempRoot, `${stem}.wav`);
        const mp3 = path.join(tempRoot, `${stem}.mp3`);
        if (!stagedBanks.has(bank)) {
            const staged = path.join(tempRoot, `${gap.chunk}_${gap.bank}.bnk`);
            fs.copyFileSync(bank, staged);
            stagedBanks.set(bank, staged);
        }
        run(VGMSTREAM, ['-i', '-s', String(streamOrdinal), '-o', wav, stagedBanks.get(bank)]);
        run(FFMPEG, [
            '-hide_banner', '-loglevel', 'error', '-y', '-i', wav,
            '-map_metadata', '-1', '-af', 'loudnorm=I=-20:TP=-2:LRA=11',
            '-ar', '48000', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '128k', mp3
        ]);
        const hash = sha256(mp3);
        const canonical = canonicalByHash.get(hash);
        if (canonical) {
            resolvedSources.set(gapKey, {
                canonicalPath: canonical.path,
                canonicalSourceId: Number(canonical.sourceStream),
                sha256: hash,
                proof: 'identical-normalized-mp3-sha256'
            });
        } else {
            const recoveredRoot = path.join(RUNTIME_ROOT, 'monster', graph.monsterId, 'recovered');
            fs.mkdirSync(recoveredRoot, { recursive: true });
            const recoveredPath = path.join(
                recoveredRoot,
                `${safeName(gap.bank)}_stream_${streamOrdinal}_source_${gap.sourceId}.mp3`
            );
            if (!fs.existsSync(recoveredPath)) fs.copyFileSync(mp3, recoveredPath);
            const recovered = {
                canonicalPath: relativeRoot(recoveredPath),
                canonicalSourceId: gap.sourceId,
                sha256: hash,
                proof: 'direct-bank-stream-recovery'
            };
            resolvedSources.set(gapKey, recovered);
            canonicalByHash.set(hash, {
                path: recovered.canonicalPath,
                sourceStream: gap.sourceId,
                sha256: hash
            });
        }
    }
    fs.rmSync(tempRoot, { recursive: true, force: true });
    const stillUnresolved = [];
    for (const gap of unresolved) {
        const gapKey = `${gap.chunk}:${gap.bank}:${gap.sourceId}`;
        const resolved = resolvedSources.get(gapKey);
        if (resolved) {
            aliases.push({
                ...gap,
                ...resolved,
                proof: resolved.proof || (gap.chunk === 'chunkG0'
                    ? 'identical-normalized-mp3-sha256'
                    : 'same-source-id-after-base-sha256-match')
            });
        } else {
            stillUnresolved.push(gap);
        }
    }
    return { aliases, unresolved: stillUnresolved, probeAvailable: true };
}

function main() {
    const monsterId = (process.argv.find(value => value.startsWith('--monster='))?.split('=')[1] || 'em001').toLowerCase();
    const fresh = process.argv.includes('--fresh');
    if (!fs.existsSync(WWISER)) throw new Error(`Missing wwiser: ${WWISER}`);
    const sets = discoverBankSets(monsterId);
    if (!sets.length) throw new Error(`No installed World banks found for ${monsterId}`);
    const outputRoot = path.join(RUNTIME_ROOT, 'audio_graph', monsterId);
    fs.mkdirSync(outputRoot, { recursive: true });
    const manifest = readJson(MANIFEST, { entries: [] });
    const decodedEntries = (manifest.entries || []).filter(entry =>
        new RegExp(`(?:^|/)${monsterId}(?:_|\\.)`, 'i')
            .test(String(entry.sourceBank || '').replace(/\\/g, '/'))
    );
    const decodedIndex = decodedClipIndex(manifest);
    const tags = annotationIndex(
        readJson(AUDITIONS, { entries: [] }),
        readJson(REVIEW_LABELS, { records: [], tagAliases: {} })
    );
    const variants = [];
    for (const [index, set] of sets.entries()) {
        const output = extractSet(set, outputRoot, fresh);
        const parsed = walk(path.join(output, 'txtp'))
            .filter(file => file.toLowerCase().endsWith('.txtp'))
            .filter(file => path.basename(file).toLowerCase().startsWith(`${monsterId}_`))
            .map(file => parseTxtp(file, set.chunk, decodedIndex, tags))
            .filter(Boolean);
        variants.push(...parsed);
        console.log(`[world-audio-graph] ${index + 1}/${sets.length} ${set.chunk}: ${parsed.length} variants`);
    }
    const graph = report(monsterId, sets, compactEvents(variants), decodedEntries);
    graph.deduplication = resolveDedupAliases(graph, manifest, sets, outputRoot);
    graph.summary.dedupAliasSourceOccurrences = graph.deduplication.aliases.length;
    graph.summary.unresolvedGraphSourceOccurrences = graph.deduplication.unresolved.length;
    fs.writeFileSync(path.join(outputRoot, 'audio-graph.json'), `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
    const userTags = graph.events.flatMap(event => event.variants)
        .flatMap(variant => variant.annotations.map(annotation => ({
            chunk: variant.chunk,
            bank: variant.bank,
            eventId: variant.eventId,
            sourceIds: [annotation.sourceId],
            ...annotation
        })));
    fs.writeFileSync(path.join(outputRoot, 'user-tags.generated.json'), `${JSON.stringify({
        version: 1,
        policy: 'mutable-multi-tag-overlay',
        entries: userTags
    }, null, 2)}\n`, 'utf8');
    writeReadme(outputRoot, graph);
    writeKnownNeighborhoods(outputRoot, graph);
    writeAuditionReview(outputRoot, monsterId);
    console.log(`[world-audio-graph] wrote ${relativeRoot(outputRoot)}`);
    console.log(`[world-audio-graph] ${graph.summary.events} events, ${graph.summary.variants} variants, ${graph.summary.uniqueSourceIds} sources`);
}

if (require.main === module) main();

module.exports = {
    annotationIndex,
    compactEvents,
    discoverBankSets,
    parseTxtp,
    sourceIds,
    sourceRefs,
    structureFrom
};
