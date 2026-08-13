'use strict';

// Review navigation taxonomy. Official species come from img/monsters/monsters.json
// (MHW DB + installed/MHGU evidence). Cross-checks:
// https://docs.mhw-db.com/ (species enum, including Relict)
// https://monsterhunterworld-archive.fandom.com/wiki/Monsters (World roster by species)
// Size buckets intentionally win over biological species. `primitive-wyvern`
// is our quadrupedal pseudo-wyvern review group, not an official in-game species.
const CATEGORY_CATALOG = Object.freeze([
    Object.freeze({ id: 'small', label: '소형', icon: '🐾' }),
    Object.freeze({ id: 'primitive-wyvern', label: '원시비룡', icon: '🦇' }),
    Object.freeze({ id: 'flying-wyvern', label: '비룡', icon: '🐉' }),
    Object.freeze({ id: 'fanged-wyvern', label: '아룡', icon: '🐺' }),
    Object.freeze({ id: 'brute-wyvern', label: '수룡', icon: '🦖' }),
    Object.freeze({ id: 'fanged-beast', label: '아수종', icon: '🦍' }),
    Object.freeze({ id: 'amphibian', label: '양서종', icon: '🐸' }),
    Object.freeze({ id: 'elder-dragon', label: '고룡', icon: '🌌' }),
    Object.freeze({ id: 'bird-wyvern', label: '조룡', icon: '🐦' }),
    Object.freeze({ id: 'cephalopod', label: '두족종', icon: '🐙' }),
    Object.freeze({ id: 'piscine-wyvern', label: '어룡', icon: '🐟' }),
    Object.freeze({ id: 'leviathan', label: '해룡', icon: '🌊' }),
    Object.freeze({ id: 'carapaceon', label: '갑각종', icon: '🦀' }),
    Object.freeze({ id: 'temnoceran', label: '협각종', icon: '🕷️' }),
    Object.freeze({ id: 'neopteron', label: '갑충종', icon: '🪲' }),
    Object.freeze({ id: 'snake-wyvern', label: '사룡종', icon: '🐍' }),
    Object.freeze({ id: 'relict', label: '유물종', icon: '🌿' }),
    Object.freeze({ id: 'herbivore', label: '초식종', icon: '🦌' }),
    Object.freeze({ id: 'wingdrake', label: '익룡종', icon: '🪽' }),
    Object.freeze({ id: 'fish', label: '어류', icon: '🐠' }),
    Object.freeze({ id: 'construct', label: '인공종', icon: '🗿' }),
    Object.freeze({ id: 'machine', label: '기계종', icon: '⚙️' }),
    Object.freeze({ id: 'unknown-species', label: '미분류', icon: '❓' }),
    Object.freeze({ id: 'colossal', label: '특대형', icon: '⛰️' }),
    Object.freeze({ id: 'other', label: '기타', icon: '❔' })
]);

const PRIMITIVE_WYVERN_IDS = new Set([
    'tigrex', 'brute_tigrex', 'molten_tigrex', 'grimclaw_tigrex',
    'nargacuga', 'green_nargacuga', 'lucent_nargacuga', 'silverwind_nargacuga',
    'barioth', 'frostfang_barioth', 'sand_barioth',
    'khezu', 'red_khezu', 'gigginox', 'baleful_gigginox'
]);

const SPECIES_CATEGORY = Object.freeze({
    'flying wyvern': 'flying-wyvern',
    'fanged wyvern': 'fanged-wyvern',
    'brute wyvern': 'brute-wyvern',
    'fanged beast': 'fanged-beast',
    amphibian: 'amphibian',
    'elder dragon': 'elder-dragon',
    'bird wyvern': 'bird-wyvern',
    cephalopod: 'cephalopod',
    'piscine wyvern': 'piscine-wyvern',
    leviathan: 'leviathan',
    carapaceon: 'carapaceon',
    temnoceran: 'temnoceran',
    neopteron: 'neopteron',
    'snake wyvern': 'snake-wyvern',
    relict: 'relict',
    herbivore: 'herbivore',
    wingdrake: 'wingdrake',
    fish: 'fish',
    construct: 'construct',
    machine: 'machine'
});

function normalizeSpecies(value) {
    return String(value || '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function categoryForMonster(monster = {}) {
    const id = String(monster.id || '').toLowerCase();
    const tier = String(monster.tier || '').toLowerCase();
    if (tier === 'small') return 'small';
    if (tier === 'colossal') return 'colossal';
    if (PRIMITIVE_WYVERN_IDS.has(id)) return 'primitive-wyvern';
    const species = normalizeSpecies(monster.species);
    if (!species || species === '???') return 'unknown-species';
    return SPECIES_CATEGORY[species] || 'other';
}

module.exports = { CATEGORY_CATALOG, PRIMITIVE_WYVERN_IDS, categoryForMonster, normalizeSpecies };
