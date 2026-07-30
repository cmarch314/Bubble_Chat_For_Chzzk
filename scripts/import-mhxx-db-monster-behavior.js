#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { slug, classifyMove, runtimePattern } = require('./import-rise-monster-behavior');

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, 'game_extracts', 'web', 'mh4info-mhxx', 'monster');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'mhxx-db-monster-behavior.generated.json');
const RUNTIME_PATH = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'MhxxDbMonsterBehavior.generated.js');
const SOURCE_ROOT = 'https://x.mh4info.com/m/d';
const USER_AGENT = 'BubbleChat MHXX exact attack table importer/1.0';

const TARGETS = Object.freeze({
    ahtal_ka: ['Ahtal-Ka', '아트랄 카', ['アトラル・カ']],
    akantor: ['Akantor', '아캄토름', ['アカムトルム']],
    alatreon: ['Alatreon', '알바트리온', ['アルバトリオン']],
    bloodbath_diablos: ['Bloodbath Diablos', '오마 디아블로스', ['鏖魔ディアブロス']],
    boltreaver_astalos: ['Boltreaver Astalos', '청전주 라이젝스', ['青電主ライゼクス']],
    crimson_fatalis: ['Crimson Fatalis', '밀라보레아스 홍룡', ['ミラバルカン']],
    crystalbeard_uragaan: ['Crystalbeard Uragaan', '보전 우라간킨', ['宝纏ウラガンキン']],
    deadeye_yian_garuga: ['Deadeye Yian Garuga', '척안 얀가루루가', ['隻眼イャンガルルガ']],
    dreadking_rathalos: ['Dreadking Rathalos', '흑염왕 리오레우스', ['黒炎王リオレウス']],
    dreadqueen_rathian: ['Dreadqueen Rathian', '자독희 리오레이아', ['紫毒姫リオレイア']],
    drilltusk_tetsucabra: ['Drilltusk Tetsucabra', '암천 테츠카브라', ['岩穿テツカブラ']],
    elderfrost_gammoth: ['Elderfrost Gammoth', '은령 가무토', ['銀嶺ガムート']],
    gammoth: ['Gammoth', '가무토', ['ガムート']],
    glavenus: ['Glavenus', '디노발드', ['ディノバルド']],
    grimclaw_tigrex: ['Grimclaw Tigrex', '황구조 티가렉스', ['荒鉤爪ティガレックス']],
    hellblade_glavenus: ['Hellblade Glavenus', '신멸인 디노발드', ['燼滅刃ディノバルド']],
    lao_shan_lung: ['Lao-Shan Lung', '라오샨룽', ['ラオシャンロン']],
    nakarkos: ['Nakarkos', '오스트가로아', ['オストガロア']],
    nightcloak_malfestio: ['Nightcloak Malfestio', '오보로가쿠레 호로로호루루', ['朧隠ホロロホルル']],
    old_fatalis: ['Old Fatalis', '밀라루츠', ['ミラルーツ']],
    redhelm_arzuros: ['Redhelm Arzuros', '홍두 아오아시라', ['紅兜アオアシラ']],
    rustrazor_ceanataur: ['Rustrazor Ceanataur', '요로이자키 쇼군기자미', ['鎧裂ショウグンギザミ']],
    silverwind_nargacuga: ['Silverwind Nargacuga', '백질풍 나르가쿠르가', ['白疾風ナルガクルガ']],
    snowbaron_lagombi: ['Snowbaron Lagombi', '대설주 울크스스', ['大雪主ウルクスス']],
    soulseer_mizutsune: ['Soulseer Mizutsune', '천안 타마미츠네', ['天眼タマミツネ']],
    stonefist_hermitaur: ['Stonefist Hermitaur', '모쇄 다이묘자자미', ['矛砕ダイミョウザザミ']],
    thunderlord_zinogre: ['Thunderlord Zinogre', '금뇌공 진오우거', ['金雷公ジンオウガ']],
    ukanlos: ['Ukanlos', '우캄루바스', ['ウカムルバス']]
});

function plain(value) {
    return String(value || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function normalizedTitle(value) {
    return plain(value).replace(/[（(][^)）]*[)）]/g, '').replace(/二つ名/g, '')
        .replace(/[・\s]/g, '');
}

function field(html, name) {
    const match = html.match(new RegExp(`<tr><th[^>]*>${name}<\\/th><td[^>]*>([\\s\\S]*?)<\\/td>`, 'i'));
    return match ? plain(match[1]) : null;
}

function parsePage(html, sourceId) {
    const title = plain(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
    const heading = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
        .find(match => plain(match[1]).includes('の攻撃パターン'));
    const section = heading
        ? html.slice(heading.index + heading[0].length, html.indexOf('</table>', heading.index) + 8)
        : '';
    const moves = [...section.matchAll(/<tr><td[^>]*>([\s\S]*?)<\/td><td[^>]*>([\s\S]*?)<\/td><\/tr>/gi)]
        .map(match => {
            const nameJA = plain(match[1]);
            const descriptionJA = plain(match[2]);
            const semantic = classifyMove(`${nameJA} ${descriptionJA}`, [], { Physical: 35 }, {});
            return {
                nameJA, descriptionJA, semantic, damage: { Physical: 35 }, statuses: {},
                guardable: null, power: 35, offensive: semantic !== 'utility',
                evidence: 'mh4info-mhxx-named-attack-table'
            };
        }).filter(move => move.nameJA && move.nameJA !== '攻撃方法' && move.offensive);
    return {
        sourceId: String(sourceId), title, normalizedTitle: normalizedTitle(title),
        speciesJA: field(html, '種別'), roarText: field(html, '咆哮'), moves
    };
}

function targetForPage(page) {
    return Object.entries(TARGETS).find(([, target]) =>
        target[2].some(alias => page.normalizedTitle === normalizedTitle(alias))) || null;
}

function runtimeMonster(id, target, page) {
    const patterns = page.moves.slice(0, 7).map((move, index) => ({
        ...runtimePattern(id, move, index), sourceGame: 'generations-ultimate'
    }));
    const roarAbsent = !page.roarText || /^(?:-|無し|なし|無)$/.test(page.roarText);
    if (!roarAbsent) patterns.unshift({
        id: `${id}.mhxxdb.roar`, name: '포효', type: 'roar', damageRatio: 0,
        windupTicks: 3, activeTicks: 2, recoveryTicks: 8,
        minTargets: 2, maxTargets: 4, cooldownTicks: 120, weight: 0.25,
        tags: ['roar'], sourceActionClass: '咆哮', sourceGame: 'generations-ultimate',
        evidence: 'mh4info-mhxx-monster-basic-table', confidence: 'published-guide'
    });
    return {
        id, nameEN: target[0], nameKO: target[1], speciesJA: page.speciesJA,
        roar: { status: roarAbsent ? 'verified-absent' : 'verified-present', strength: roarAbsent ? null : page.roarText, audioStatus: 'unresolved' },
        patterns, sourceId: page.sourceId, sourceUrl: `${SOURCE_ROOT}/${page.sourceId}`,
        evidence: 'mh4info-mhxx-named-attack-table'
    };
}

async function fetchPage(sourceId, refresh) {
    const file = path.join(CACHE_DIR, `${sourceId}.html`);
    if (!refresh && fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
    const response = await fetch(`${SOURCE_ROOT}/${sourceId}`, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(file, html, 'utf8');
    return html;
}

async function importBehavior(options = {}) {
    const pages = [];
    for (let start = 1; start <= 168; start += 8) {
        const ids = Array.from({ length: Math.min(8, 169 - start) }, (_, offset) => start + offset);
        const batch = await Promise.all(ids.map(async sourceId => {
            try { return parsePage(await fetchPage(sourceId, options.refresh), sourceId); }
            catch (_) { return null; }
        }));
        pages.push(...batch.filter(Boolean));
    }
    const monsters = [];
    for (const page of pages) {
        const match = targetForPage(page);
        if (!match || !page.moves.length) continue;
        const [id, target] = match;
        const record = runtimeMonster(id, target, page);
        record.sourceSha256 = crypto.createHash('sha256').update(JSON.stringify(page)).digest('hex');
        monsters.push(record);
    }
    const missing = Object.keys(TARGETS).filter(id => !monsters.some(monster => monster.id === id));
    const output = {
        version: 1,
        source: { title: 'MHXX strategy database exact named attack tables', url: SOURCE_ROOT },
        counts: {
            target: Object.keys(TARGETS).length, imported: monsters.length, missing: missing.length,
            moves: monsters.reduce((sum, monster) => sum + monster.patterns.filter(pattern => pattern.type !== 'roar').length, 0)
        },
        missing, monsters
    };
    fs.writeFileSync(options.outputPath || OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    fs.writeFileSync(RUNTIME_PATH,
        `window.HUNT_MHXX_DB_MONSTER_BEHAVIOR = ${JSON.stringify(Object.fromEntries(monsters.map(monster => [monster.id, monster])), null, 2)};\n`,
        'utf8');
    return output;
}

if (require.main === module) importBehavior({ refresh: process.argv.includes('--refresh') })
    .then(output => {
        console.log(JSON.stringify({ ...output.counts, missingIds: output.missing }, null, 2));
        if (output.missing.length) process.exitCode = 1;
    })
    .catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });

module.exports = { TARGETS, plain, normalizedTitle, field, parsePage, targetForPage, runtimeMonster, importBehavior };
