#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {
    slug, classifyMove, runtimePattern
} = require('./import-rise-monster-behavior');

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, 'game_extracts', 'web', 'game-e-mhxx', 'monster');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'mhxx-monster-behavior.generated.json');
const RUNTIME_PATH = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'MhxxMonsterBehavior.generated.js');
const SOURCE_ROOT = 'https://game-e.com/mhxx/monster';
const USER_AGENT = 'BubbleChat MHXX behavior evidence importer/1.0';
const SPECIES = Object.freeze({
    '飛竜種': ['Flying Wyvern', '비룡종'], '鳥竜種': ['Bird Wyvern', '조룡종'],
    '牙竜種': ['Fanged Wyvern', '아룡종'], '獣竜種': ['Brute Wyvern', '수룡종'],
    '海竜種': ['Leviathan', '해룡종'], '魚竜種': ['Piscine Wyvern', '어룡종'],
    '牙獣種': ['Fanged Beast', '아수종'], '甲殻種': ['Carapaceon', '갑각종'],
    '甲虫種': ['Neopteron', '갑충종'], '蛇竜種': ['Snake Wyvern', '사룡종'],
    '両生種': ['Amphibian', '양서종'], '古龍種': ['Elder Dragon', '고룡종']
});

const PAGE_MONSTERS = Object.freeze({
    agnaktor: ['Agnaktor', '아그나코트'], amatsumagatsushi: ['Amatsu', '아마츠마가츠치'],
    arzuros: ['Arzuros', '아오아시라'], blangonga: ['Blangonga', '도도블랑고'],
    brachydios: ['Brachydios', '브라키디오스'], bulldrome: ['Bulldrome', '도스팽고'],
    cephadrome: ['Cephadrome', '도스가레오스'], chameleos: ['Chameleos', '오오나즈치'],
    'daimyo-hermitaur': ['Daimyo Hermitaur', '다이묘자자미'], dosmakkao: ['Great Maccao', '도스마카오'],
    duramboros: ['Duramboros', '도볼베르크'], giadrome: ['Giadrome', '도스기아노스'],
    'gore-magala': ['Gore Magala', '고어 마가라'], gypceros: ['Gypceros', '게리오스'],
    hororohoruru: ['Malfestio', '호로로호루루'], iodrome: ['Iodrome', '도스이오스'],
    'kecha-wacha': ['Kecha Wacha', '케차와차'], khezu: ['Khezu', '푸루푸루'],
    kirin: ['Kirin', '키린'], 'kushala-daora': ['Kushala Daora', '크샬다오라'],
    lagiacrus: ['Lagiacrus', '라기아크루스'], lagombi: ['Lagombi', '울크스스'],
    lavasioth: ['Lavasioth', '볼가노스'], najarala: ['Najarala', '가라라아자라'],
    nargacuga: ['Nargacuga', '나르가쿠르가'], nibelsnarf: ['Nibelsnarf', '하플보카'],
    plesioth: ['Plesioth', '가노토토스'], rathalos: ['Rathalos', '리오레우스'],
    rathian: ['Rathian', '리오레이아'], 'royal-ludroth': ['Royal Ludroth', '로아루도로스'],
    seltas: ['Seltas', '아르셀타스'], 'seltas-queen': ['Seltas Queen', '게넬 셀타스'],
    seregios: ['Seregios', '셀레기오스'], 'shogun-ceanataur': ['Shogun Ceanataur', '쇼군기자미'],
    teostra: ['Teostra', '테오 테스카토르'], tetsucabra: ['Tetsucabra', '테츠카브라'],
    tigrex: ['Tigrex', '티가렉스'], uragaan: ['Uragaan', '우라간킨'],
    velocidrome: ['Velocidrome', '도스람포스'], volvidon: ['Volvidon', '랑그로토라'],
    'yian-garuga': ['Yian Garuga', '얀가루루가'], 'yian-kut-ku': ['Yian Kut-Ku', '얀쿡'],
    zamtrios: ['Zamtrios', '자보아자길'], zinogre: ['Zinogre', '진오우거']
});

function plainText(value) {
    return String(value || '').replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ').trim();
}

function sectionAfterHeading(html, suffix) {
    const headings = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)];
    const heading = headings.find(match => plainText(match[1]).endsWith(suffix));
    if (!heading) return '';
    const start = heading.index + heading[0].length;
    const next = html.indexOf('<h3', start);
    return html.slice(start, next < 0 ? html.length : next);
}

function tableValue(html, label) {
    const match = html.match(new RegExp(`<tr><td[^>]*>\\s*${label}\\s*<\\/td><td[^>]*>([\\s\\S]*?)<\\/td><\\/tr>`, 'i'));
    return match ? plainText(match[1]) : null;
}

function parsePage(html, pageId, names = PAGE_MONSTERS[pageId]) {
    const [nameEN, nameKO] = names;
    const attackSection = sectionAfterHeading(html, 'の攻撃パターン');
    const attackNames = [...attackSection.matchAll(/<li\s+class="coin_contents">([\s\S]*?)<\/li>/gi)]
        .map(match => plainText(match[1])).filter(Boolean);
    const descriptions = [...attackSection.matchAll(/<li\s+class="coin_contents2">([\s\S]*?)<\/li>/gi)]
        .map(match => plainText(match[1])).filter(Boolean);
    const moves = attackNames.map((nameJA, index) => {
        const semantic = classifyMove(nameJA, [], { Physical: 35 }, {});
        return {
            nameJA, descriptionJA: descriptions[index] || null, semantic,
            damage: { Physical: 35 }, statuses: {}, guardable: null, power: 35,
            offensive: semantic !== 'utility',
            evidence: 'game-e-mhxx-named-attack-pattern-guide'
        };
    }).filter(move => move.offensive);
    const roarText = tableValue(html, '咆哮');
    const speciesJA = tableValue(html, '種族');
    const roarStatus = roarText === null ? 'unresolved'
        : /^(?:-|無し|なし|無)$/.test(roarText) ? 'verified-absent' : 'verified-present';
    return {
        game: 'generations-ultimate', pageId, nameEN, nameKO, speciesJA,
        roar: { status: roarStatus, strength: roarStatus === 'verified-present' ? roarText : null },
        moves, sourceUrl: `${SOURCE_ROOT}/${pageId}.php`,
        evidence: 'game-e-mhxx-named-attack-pattern-guide'
    };
}

function runtimeMonster(monster) {
    const id = slug(monster.nameEN);
    const patterns = monster.moves.slice(0, 6).map((move, index) => ({
        ...runtimePattern(id, move, index),
        sourceGame: 'generations-ultimate'
    }));
    if (monster.roar.status === 'verified-present') patterns.unshift({
        id: `${id}.mhxx.roar`, name: '포효', type: 'roar', damageRatio: 0,
        windupTicks: 3, activeTicks: 2, recoveryTicks: 8,
        minTargets: 2, maxTargets: 4, cooldownTicks: 120, weight: 0.25,
        tags: ['roar'], sourceActionClass: '咆哮', sourceGame: 'generations-ultimate',
        evidence: 'game-e-mhxx-monster-basic-data', confidence: 'published-guide'
    });
    return {
        id, nameEN: monster.nameEN, nameKO: monster.nameKO,
        species: monster.speciesJA ? {
            nameJA: monster.speciesJA,
            nameEN: SPECIES[monster.speciesJA]?.[0] || null,
            nameKO: SPECIES[monster.speciesJA]?.[1] || null,
            internal: []
        } : null,
        locomotion: null,
        roar: { ...monster.roar, audioStatus: 'unresolved' },
        patterns
    };
}

async function fetchCached(pageId, refresh) {
    const file = path.join(CACHE_DIR, `${pageId}.html`);
    const sourceUrl = `${SOURCE_ROOT}/${pageId}.php`;
    if (!refresh && fs.existsSync(file)) return { html: fs.readFileSync(file, 'utf8'), sourceUrl };
    const response = await fetch(sourceUrl, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) throw new Error(`${sourceUrl}: HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    const html = new TextDecoder('shift_jis').decode(bytes);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(file, html, 'utf8');
    return { html, sourceUrl };
}

async function importBehavior(options = {}) {
    const monsters = [];
    const failures = [];
    for (const [pageId, names] of Object.entries(PAGE_MONSTERS)) {
        try {
            const { html } = await fetchCached(pageId, options.refresh);
            const monster = parsePage(html, pageId, names);
            monster.sourceSha256 = crypto.createHash('sha256').update(html).digest('hex');
            monsters.push(monster);
        } catch (error) {
            failures.push({ pageId, nameEN: names[0], error: error.message });
        }
    }
    const output = {
        version: 1,
        source: {
            title: 'Monster Hunter Double Cross guide - named attack patterns',
            url: `${SOURCE_ROOT}/`,
            evidence: 'individual monster attack-pattern headings, descriptions, species and roar table'
        },
        counts: {
            expected: Object.keys(PAGE_MONSTERS).length, imported: monsters.length,
            failed: failures.length, moves: monsters.reduce((sum, monster) => sum + monster.moves.length, 0),
            verifiedRoarPresent: monsters.filter(monster => monster.roar.status === 'verified-present').length,
            verifiedRoarAbsent: monsters.filter(monster => monster.roar.status === 'verified-absent').length
        },
        failures, monsters
    };
    fs.writeFileSync(options.outputPath || OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    fs.writeFileSync(RUNTIME_PATH,
        `window.HUNT_MHXX_MONSTER_BEHAVIOR = ${JSON.stringify(Object.fromEntries(monsters.map(monster => {
            const record = runtimeMonster(monster);
            return [record.id, record];
        })), null, 2)};\n`, 'utf8');
    return output;
}

if (require.main === module) importBehavior({ refresh: process.argv.includes('--refresh') })
    .then(output => {
        console.log(JSON.stringify(output.counts, null, 2));
        if (output.failures.length) process.exitCode = 1;
    })
    .catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });

module.exports = { PAGE_MONSTERS, plainText, sectionAfterHeading, tableValue, parsePage, runtimeMonster, importBehavior };
