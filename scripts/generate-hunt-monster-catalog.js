#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RUNTIME_JSON = path.join(ROOT, 'img', 'monsters', 'monsters.json');
const RUNTIME_JS = path.join(ROOT, 'js', 'effects', 'MonsterData.js');
const HABITAT_JS = path.join(ROOT, 'js', 'effects', 'hunt', 'data', 'HuntMonsterHabitats.generated.js');
const REFERENCE = path.join(ROOT, 'data', 'hunt', 'monster-reference.generated.json');
const RISE_MANIFEST = path.join(ROOT, 'local_assets', 'monster_hunter', 'reference-icons', 'rise', 'manifest.json');
const WILDS_MANIFEST = path.join(ROOT, 'local_assets', 'monster_hunter', 'reference-icons', 'wilds', 'manifest.json');
const WILDS_IDENTIFIERS = path.join(ROOT, 'game_extracts', 'tools', 'wilds-monster-identifiers.json');
const WILDS_GAME_REFERENCE = path.join(ROOT, 'data', 'hunt', 'wilds-game-reference.json');
const MHGU_REFERENCE = path.join(ROOT, 'data', 'hunt', 'mhgu-monsters.generated.json');
const MHGU_POLICY = path.join(ROOT, 'data', 'hunt', 'mhgu-monster-policy.json');
const MHGU_MANIFEST = path.join(ROOT, 'local_assets', 'monster_hunter', 'reference-icons', 'mhgu', 'manifest.json');
const RISE_BEHAVIOR = path.join(ROOT, 'data', 'hunt', 'rise-monster-behavior.generated.json');
const WILDS_BEHAVIOR = path.join(ROOT, 'data', 'hunt', 'wilds-monster-behavior.generated.json');
const WORLD_BEHAVIOR = path.join(ROOT, 'data', 'hunt', 'world-monster-behavior.generated.json');
const WORLD_REFERENCE = path.join(ROOT, 'data', 'hunt', 'world-monsters.generated.json');
const MHXX_BEHAVIOR = path.join(ROOT, 'data', 'hunt', 'mhxx-monster-behavior.generated.json');
const MHXX_DB_BEHAVIOR = path.join(ROOT, 'data', 'hunt', 'mhxx-db-monster-behavior.generated.json');
const PUBLISHED_BEHAVIOR = require('../js/effects/hunt/data/PublishedMonsterBehavior.js');
const MONSTER_TAXONOMY = require('../js/effects/hunt/data/HuntMonsterTaxonomy.js');
const { resolveMonsterRoarEvidence } = require('../js/effects/hunt/data/HuntMonsterRoarEvidence.js');
const REFRESH = process.argv.includes('--refresh-web');
const USER_AGENT = 'BubbleChat monster catalog generator/1.0';

const MEDIUM_NAMES = new Set([
    'great baggi', 'great izuchi', 'great wroggi', 'great jaggi', 'kulu-ya-ku', 'tzitzi-ya-ku',
    'great jagras', 'great girros', 'dodogama', 'royal ludroth', 'arzuros', 'lagombi', 'volvidon',
    'aknosom', 'tetranadon', 'bishaten', 'somnacanth', 'chatacabra', 'quematrice',
    'great maccao', 'velocidrome', 'gendrome', 'iodrome', 'cephadrome', 'bulldrome', 'giadrome',
    'seltas', 'kecha wacha', 'tetsucabra', 'daimyo hermitaur', 'malfestio'
]);
const ELDER_TOKENS = [
    'alatreon', 'chameleos', 'daora', 'fatalis', 'gogmazios', 'ibushi', 'kirin', 'kulve taroth',
    'lunastra', 'malzeno', 'namielle', 'narwa', 'nergigante', 'shagaru', 'teostra', 'vaal hazak',
    'valstrax', 'velkhana', 'zoh shia'
];
const COLOSSAL_TOKENS = [
    'ahtal-ka', 'akantor', 'amatsu', 'behemoth', 'dalamadur', 'fatalis', 'gaismagorm', 'jhen mohran', 'jin dahaad',
    'kulve taroth', 'lao-shan lung', 'nakarkos', 'omega planetes', 'safi', 'shara ishvalda',
    'ukanlos', 'xeno', 'yama tsukami', 'zorah magdaros'
];
const NON_COMBAT_NAMES = new Set(['felyne', 'melynx', 'gajalaka', 'grimalkyne', 'boaboa', 'meownster']);
const NON_COMBAT_EVENTS = Object.freeze({
    boaboa: 'boaboa',
    felyne: 'felyne',
    gajalaka: 'gajalaka',
    grimalkyne: 'tetoru',
    melynx: 'melynx',
    unknown_monster: 'mysterious_tracks'
});
const BASE_SMALL_IDS = new Set([
    'aptonoth', 'apceros', 'gajau', 'gastodon', 'girros', 'jagras', 'kestodon', 'kestodon_female',
    'mernos', 'noios', 'barnos', 'cortos', 'raphinos', 'shamos', 'wulg', 'anteka', 'kelbi', 'popo',
    'felyne', 'gajalaka', 'grimalkyne', 'boaboa', 'mosswine', 'vespoid', 'hornetaur'
]);

function readJson(file, fallback) {
    return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
}
function decodeHtml(value) {
    return String(value || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}
function slug(value) {
    return String(value || '').normalize('NFKD').replace(/[’']/g, '').replace(/&/g, ' and ')
        .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
}
function canonicalName(value) {
    return slug(value).replace(/_+/g, '_');
}
function tierFor(name, kind = 'large') {
    const lower = String(name || '').toLowerCase();
    if (kind === 'small') return 'small';
    if (COLOSSAL_TOKENS.some(token => lower.includes(token))) return 'colossal';
    if (ELDER_TOKENS.some(token => lower.includes(token)) || kind === 'elder') return 'elder';
    if (MEDIUM_NAMES.has(lower)) return 'medium';
    return 'large';
}
async function fetchText(url) {
    const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.text();
}
function parseRise(html, locale, kind) {
    const rows = [];
    const pattern = /<img[^>]+src="(https?:\/\/cdn\.kiranico\.net\/file\/kiranico\/mhrise-web\/images\/icons\/(ems?\d+_\d+)\.png)"[^>]+alt="([^"]*)"[^>]*>[\s\S]{0,500}?href="https?:\/\/mhrise\.kiranico\.com\/(?:ko\/)?data\/monsters\/(\d+)"[^>]*>/gi;
    for (const match of html.matchAll(pattern)) rows.push({
        sourceId: match[4], iconCode: match[2].toLowerCase(), name: decodeHtml(match[3]), locale, kind,
        pageUrl: `https://mhrise.kiranico.com/${locale === 'ko' ? 'ko/' : ''}data/monsters?view=${kind === 'small' ? 'sm' : 'lg'}`
    });
    return rows;
}
function parseWorld(html, locale) {
    const rows = [];
    const pattern = /<img[^>]+src="https?:\/\/cdn\.kiranico\.net\/file\/kiranico\/mhworld-web\/mhw\/icon\/(em\d+)_ID\.png"[^>]*>[\s\S]{0,300}?<a href="https?:\/\/mhworld\.kiranico\.com\/(?:[a-z-]+\/)?monsters\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    for (const match of html.matchAll(pattern)) rows.push({
        sourceId: match[2].split('/')[0], iconCode: match[1].toLowerCase(), slug: match[2], name: decodeHtml(match[3]), locale,
        pageUrl: `https://mhworld.kiranico.com/${locale === 'ko' ? 'ko/' : ''}monsters`
    });
    return rows;
}
function pairLocales(enRows, koRows, game) {
    const ko = new Map(koRows.map(row => [row.sourceId, row]));
    return enRows.map(row => ({
        game, sourceId: row.sourceId, iconCode: row.iconCode || row.sourceId,
        nameEN: row.name, nameKO: ko.get(row.sourceId)?.name || row.name,
        kind: row.kind || 'large', sourceUrl: row.pageUrl,
        evidence: 'kiranico-localized-id-and-icon-row'
    }));
}
async function refreshWebReference() {
    const [riseLargeEn, riseLargeKo, riseSmallEn, riseSmallKo, worldEn, worldKo] = await Promise.all([
        fetchText('https://mhrise.kiranico.com/data/monsters?view=lg'),
        fetchText('https://mhrise.kiranico.com/ko/data/monsters?view=lg'),
        fetchText('https://mhrise.kiranico.com/data/monsters?view=sm'),
        fetchText('https://mhrise.kiranico.com/ko/data/monsters?view=sm'),
        fetchText('https://mhworld.kiranico.com/en/monsters'),
        fetchText('https://mhworld.kiranico.com/ko/monsters')
    ]);
    const monsters = [
        ...pairLocales(parseRise(riseLargeEn, 'en', 'large'), parseRise(riseLargeKo, 'ko', 'large'), 'rise-sunbreak'),
        ...pairLocales(parseRise(riseSmallEn, 'en', 'small'), parseRise(riseSmallKo, 'ko', 'small'), 'rise-sunbreak'),
        ...pairLocales(parseWorld(worldEn, 'en'), parseWorld(worldKo, 'ko'), 'world-iceborne')
    ];
    const reference = {
        version: 1,
        generatedAt: new Date().toISOString(),
        sources: [
            'https://mhrise.kiranico.com/data/monsters?view=lg',
            'https://mhrise.kiranico.com/data/monsters?view=sm',
            'https://mhworld.kiranico.com/en/monsters'
        ],
        monsters
    };
    fs.mkdirSync(path.dirname(REFERENCE), { recursive: true });
    fs.writeFileSync(REFERENCE, `${JSON.stringify(reference, null, 2)}\n`, 'utf8');
    return reference;
}
function enrichWilds() {
    const identifiers = readJson(WILDS_IDENTIFIERS, { identifiers: [] }).identifiers || [];
    const anatomy = new Map((readJson(WILDS_GAME_REFERENCE, { monsters: [] }).monsters || []).map(row => [row.id, row]));
    const manifest = readJson(WILDS_MANIFEST, { records: {} });
    return identifiers.filter(row => row.publicMonsterId && row.nameEn && row.nameKo).map(row => {
        const details = anatomy.get(row.publicMonsterId) || {};
        const media = manifest.records?.[row.enumName];
        return {
            game: 'wilds', sourceId: String(row.publicMonsterId), iconCode: row.enumName,
            nameEN: row.nameEn, nameKO: row.nameKo, kind: details.kind || 'large', species: details.species || null,
            baseHealth: details.baseHealth || null, weaknesses: details.weaknesses || [],
            locations: details.locations || [],
            breakablePartKinds: details.breakablePartKinds || [],
            imagePath: media?.status === 'downloaded' ? `local_assets/monster_hunter/reference-icons/wilds/${media.localPath}` : null,
            evidence: row.evidence, anatomyEvidence: details.evidence || null
        };
    });
}
function enrichMhgu() {
    const snapshot = readJson(MHGU_REFERENCE, { monsters: [] });
    const policy = readJson(MHGU_POLICY, { medium: [], colossal: [], nonCombat: [] });
    const manifest = readJson(MHGU_MANIFEST, { records: {} });
    const medium = new Set(policy.medium || []);
    const colossal = new Set(policy.colossal || []);
    const nonCombat = new Set(policy.nonCombat || []);
    return (snapshot.monsters || []).map(row => {
        const media = manifest.records?.[`monster:${row.sourceId}`];
        const weaknesses = (row.weaknesses || []).map(entry => ({
            state: entry.state,
            elements: {
                fire: entry.fire, water: entry.water, thunder: entry.thunder,
                ice: entry.ice, dragon: entry.dragon
            },
            statuses: {
                poison: entry.poison, paralysis: entry.paralysis, sleep: entry.sleep
            },
            tools: {
                pitfallTrap: entry.pitfallTrap, shockTrap: entry.shockTrap, flashBomb: entry.flashBomb
            }
        }));
        return {
            game: 'generations-ultimate',
            sourceId: row.sourceId,
            iconCode: row.iconName,
            nameEN: row.nameEN,
            nameKO: row.nameKO,
            kind: row.kind,
            tier: row.kind === 'small' ? 'small'
                : colossal.has(row.nameEN) ? 'colossal'
                    : medium.has(row.nameEN) ? 'medium'
                        : tierFor(row.nameEN, row.kind),
            selectable: !nonCombat.has(row.nameEN),
            variantOf: row.variantOf || null,
            baseHealth: row.baseHealth || null,
            locations: (row.locations || []).map(location => location.name),
            weaknesses,
            imagePath: media?.status === 'downloaded'
                ? `local_assets/monster_hunter/reference-icons/mhgu/${media.localPath}` : null,
            sourceUrl: row.sourceUrl,
            evidence: row.evidence,
            anatomyEvidence: 'mhgudb-sqlite-hitzones-status-and-habitat'
        };
    });
}
function enrichWorldReference() {
    return (readJson(WORLD_REFERENCE, { monsters: [] }).monsters || []).map(row => ({
        game: 'world-iceborne',
        sourceId: row.sourceId,
        nameEN: row.nameEN,
        nameKO: null,
        kind: row.kind,
        species: row.species,
        locations: row.locations,
        ailments: row.ailments,
        sourceUrl: row.sourceUrl,
        evidence: row.evidence,
        anatomyEvidence: 'mhw-db-species-and-location-reference'
    }));
}
function main(reference) {
    const base = readJson(RUNTIME_JSON, []);
    const riseManifest = readJson(RISE_MANIFEST, { records: {} });
    const records = new Map();
    for (const monster of base) {
        // Rebuild generated-only rows from their evidence sources so stale parser output cannot accumulate.
        if (!monster.filename && monster.evidence !== 'existing-runtime-image-catalog') continue;
        const key = canonicalName(monster.nameEN || monster.id);
        const tier = monster.id === 'unknown_monster' ? 'large'
            : BASE_SMALL_IDS.has(monster.id) ? 'small'
                : (monster.tier || tierFor(monster.nameEN || monster.id));
        records.set(key, {
            ...monster,
            hitzones: undefined,
            statusThresholds: undefined,
            tier,
            selectable: monster.id !== 'unknown_monster' && !NON_COMBAT_NAMES.has(key),
            games: ['legacy-runtime'],
            sourceIds: {},
            evidence: 'existing-runtime-image-catalog'
        });
    }
    const add = source => {
        const key = canonicalName(source.nameEN);
        const existing = records.get(key);
        const media = source.game === 'rise-sunbreak' ? riseManifest.records?.[`monster:${source.sourceId}`] : null;
        const sourceImage = source.imagePath || (media?.status === 'downloaded'
            ? `local_assets/monster_hunter/reference-icons/rise/${media.localPath}` : null);
        const id = existing?.id || slug(source.nameEN);
        records.set(key, {
            ...(existing || {}),
            id,
            nameEN: source.nameEN,
            nameKO: source.nameKO || existing?.nameKO || source.nameEN,
            filename: existing?.filename || null,
            imagePath: existing?.filename ? existing.imagePath : (sourceImage || existing?.imagePath || 'img/monsters/unknown_monster.png'),
            mediaEvidence: sourceImage ? source.evidence : (existing?.filename ? 'existing-runtime-image' : 'explicit-placeholder-no-verified-icon'),
            tier: source.tier || (source.kind === 'small' ? 'small' : (existing?.tier || tierFor(source.nameEN, source.kind))),
            selectable: source.selectable ?? existing?.selectable ?? !NON_COMBAT_NAMES.has(key),
            species: source.species || existing?.species || null,
            variantOf: source.variantOf || existing?.variantOf || null,
            baseHealth: source.baseHealth || existing?.baseHealth || null,
            locations: source.locations?.length ? source.locations : (existing?.locations || []),
            weaknesses: source.weaknesses?.length ? source.weaknesses : (existing?.weaknesses || []),
            breakablePartKinds: source.breakablePartKinds?.length ? source.breakablePartKinds : (existing?.breakablePartKinds || []),
            games: [...new Set([...(existing?.games || []), source.game])],
            sourceIds: { ...(existing?.sourceIds || {}), [source.game]: source.sourceId },
            evidence: source.evidence,
            anatomyEvidence: source.anatomyEvidence || existing?.anatomyEvidence || null
        });
    };
    for (const source of reference.monsters || []) add(source);
    for (const source of enrichWorldReference()) add(source);
    for (const source of enrichWilds()) add(source);
    for (const source of enrichMhgu()) add(source);
    const riseBehavior = new Map((readJson(RISE_BEHAVIOR, { monsters: [] }).monsters || [])
        .map(row => [canonicalName(row.nameEN), row]));
    const wildsBehavior = new Map((readJson(WILDS_BEHAVIOR, { monsters: [] }).monsters || [])
        .map(row => [canonicalName(row.nameEN), row]));
    const worldBehavior = new Map((readJson(WORLD_BEHAVIOR, { monsters: [] }).monsters || [])
        .map(row => [canonicalName(row.nameEN), row]));
    const mhxxBehavior = new Map((readJson(MHXX_BEHAVIOR, { monsters: [] }).monsters || [])
        .map(row => [canonicalName(row.nameEN), row]));
    const mhxxDbBehavior = new Map((readJson(MHXX_DB_BEHAVIOR, { monsters: [] }).monsters || [])
        .map(row => [canonicalName(row.nameEN), row]));
    const output = [...records.values()].map(row => {
        const behavior = riseBehavior.get(canonicalName(row.nameEN));
        const legacyBehavior = mhxxDbBehavior.get(canonicalName(row.nameEN))
            || mhxxBehavior.get(canonicalName(row.nameEN));
        const latestBehavior = wildsBehavior.get(canonicalName(row.nameEN))
            || behavior || worldBehavior.get(canonicalName(row.nameEN)) || legacyBehavior
            || PUBLISHED_BEHAVIOR[row.id];
        const publishedBehavior = PUBLISHED_BEHAVIOR[row.id];
        const publishedRoar = resolveMonsterRoarEvidence(row.id) || publishedBehavior?.roar || null;
        const eventId = NON_COMBAT_EVENTS[row.id] || null;
        return {
            ...row,
            selectable: eventId ? false : row.selectable,
            role: eventId ? 'journey-event' : 'combat',
            journeyEventId: eventId,
            species: behavior?.species?.nameEN || row.species || publishedBehavior?.species
                || MONSTER_TAXONOMY[row.id.replace(/[-']/g, '_')]
                || (legacyBehavior?.speciesJA ? ({
                    '飛竜種': 'Flying Wyvern', '鳥竜種': 'Bird Wyvern', '牙竜種': 'Fanged Wyvern',
                    '獣竜種': 'Brute Wyvern', '海竜種': 'Leviathan', '魚竜種': 'Piscine Wyvern',
                    '牙獣種': 'Fanged Beast', '甲殻種': 'Carapaceon', '甲虫種': 'Neopteron',
                    '蛇竜種': 'Snake Wyvern', '両生種': 'Amphibian', '古龍種': 'Elder Dragon'
                })[legacyBehavior.speciesJA] : null),
            speciesKO: behavior?.species?.nameKO || row.speciesKO || null,
            skeleton: behavior?.species?.internal || row.skeleton || [],
            locomotion: behavior?.locomotion || row.locomotion || null,
            roar: publishedRoar ? {
                ...publishedRoar,
                audioStatus: row.roar?.audioStatus || 'unresolved'
            } : latestBehavior ? {
                status: latestBehavior.roar.status,
                strength: latestBehavior.roar.strength || null,
                evidence: latestBehavior.evidence || latestBehavior.roar.evidence,
                audioStatus: row.roar?.audioStatus || 'unresolved'
            } : (row.roar || { status: 'unresolved', strength: null, evidence: null, audioStatus: 'unresolved' })
        };
    }).sort((a, b) => a.nameEN.localeCompare(b.nameEN));
    fs.writeFileSync(RUNTIME_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    fs.writeFileSync(RUNTIME_JS, `window.MONSTER_DATA = ${JSON.stringify(output, null, 4)};\n`, 'utf8');
    const locationHabitats = {
        'Windward Plains': 'wildspire_waste',
        'Scarlet Forest': 'ancient_forest',
        'Oilwell Basin': 'elders_recess',
        'Iceshard Cliffs': 'hoarfrost_reach',
        'Ruins of Wyveria': 'arena',
        'Wyveria': 'arena'
    };
    const generatedHabitats = Object.fromEntries(output.map(row => {
        let ids = [...new Set((row.locations || []).map(location => {
            if (locationHabitats[location]) return locationHabitats[location];
            if (row.games?.includes('generations-ultimate')) {
                return /arena|battleground|tower|fortress|inlet|sanctuary|stronghold|polar field/i.test(location)
                    ? 'arena' : 'old_world';
            }
            return null;
        }).filter(Boolean))];
        if (!ids.length && row.games?.includes('rise-sunbreak')) ids = ['old_world', 'kamura'];
        if (!ids.length && (row.tier === 'elder' || row.tier === 'colossal')) ids = ['arena', 'old_world'];
        if (!ids.length) ids = ['old_world'];
        return [row.id, {
            latestAppearance: row.games?.at(-1) || 'legacy-runtime',
            habitats: ids.map((id, index) => ({ id, weight: Math.max(1, ids.length - index) })),
            evidence: row.locations?.length ? 'extracted-location-to-runtime-locale' : 'explicit-game-family-habitat-fallback'
        }];
    }));
    fs.mkdirSync(path.dirname(HABITAT_JS), { recursive: true });
    fs.writeFileSync(HABITAT_JS,
        `'use strict';\nconst HUNT_GENERATED_MONSTER_HABITATS = ${JSON.stringify(generatedHabitats, null, 4)};\n`
        + `if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_GENERATED_MONSTER_HABITATS;\n`
        + `else window.HUNT_GENERATED_MONSTER_HABITATS = HUNT_GENERATED_MONSTER_HABITATS;\n`, 'utf8');
    const selectable = output.filter(row => row.selectable !== false);
    const counts = selectable.reduce((acc, row) => {
        acc[row.tier] = (acc[row.tier] || 0) + 1;
        return acc;
    }, {});
    console.log(JSON.stringify({ total: output.length, selectable: selectable.length, tiers: counts,
        games: Object.fromEntries(['legacy-runtime', 'generations-ultimate', 'world-iceborne', 'rise-sunbreak', 'wilds'].map(game => [game, output.filter(row => row.games?.includes(game)).length]))
    }, null, 2));
}

async function run() {
    const reference = REFRESH || !fs.existsSync(REFERENCE)
        ? await refreshWebReference()
        : readJson(REFERENCE, { monsters: [] });
    main(reference);
}

if (require.main === module) run().catch(error => {
        console.error(`[monster-catalog] ${error.stack || error.message}`);
        process.exitCode = 1;
    });

module.exports = { parseRise, parseWorld, pairLocales, slug, tierFor };
