'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Archetypes = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');
const Anatomy = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');

const review = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../data/hunt/research/world-iceborne-flying-wyverns.json'),
    'utf8'
));

assert.strictEqual(review.roster.length, 19);
assert.strictEqual(new Set(review.roster).size, 19);

for (const id of review.roster) {
    assert(Archetypes.FLYING_WYVERN_IDS.has(id), `${id} must classify as a Flying Wyvern`);
    assert(profiles[id]?.length >= 5, `${id} must have a reviewed World action kit`);
    assert(profiles[id].every(pattern => pattern.sourceGame === 'world_iceborne'),
        `${id} must use the World/Iceborne edition`);
    assert(profiles[id].every(pattern => pattern.evidence && pattern.confidence),
        `${id} patterns must retain evidence and confidence`);
    assert(profiles[id].every(pattern => !/\[MR\]|\uFFFD/.test(pattern.name)),
        `${id} must expose natural Korean action names without rank prefixes or broken text`);
    const anatomy = Anatomy.find({ id });
    assert(anatomy?.evidence?.breakContract,
        `${id} must use reviewed World anatomy instead of a generic body plan`);
}

for (const id of ['diablos', 'black_diablos', 'tigrex', 'brute_tigrex', 'nargacuga', 'barioth', 'frostfang_barioth']) {
    assert(!profiles[id].some(pattern => pattern.tags.includes('flight-only')),
        `${id} is a grounded Flying Wyvern and must not enter sustained flight`);
    assert.strictEqual(Archetypes.resolve({ id }).id, 'grounded-flying-wyvern');
    assert.strictEqual(Archetypes.flight({ id }), null);
}

for (const id of ['legiana', 'shrieking_legiana', 'paolumu', 'nightshade_paolumu',
    'bazelgeuse', 'seething_bazelgeuse', 'rathalos', 'azure_rathalos', 'silver_rathalos']) {
    assert(profiles[id].some(pattern => pattern.tags.includes('flight-only')),
        `${id} needs authored airborne attacks`);
}

assert(profiles.nightshade_paolumu.some(pattern =>
    pattern.tags.includes('sleep') && pattern.delivery === 'gas'));
assert(profiles.seething_bazelgeuse.some(pattern =>
    pattern.id.endsWith('diving_explosion') && pattern.tags.includes('heated-scale')));
assert(profiles.brute_tigrex.some(pattern =>
    pattern.tags.includes('sonic') && Number(pattern.damageRatio) > 0));
assert(profiles.nargacuga.some(pattern =>
    pattern.tags.includes('bleed') && pattern.tags.includes('ground-hazard')));
assert(profiles.frostfang_barioth.some(pattern =>
    pattern.tags.includes('frost-ground') && pattern.delivery === 'ground-wave'));
assert(profiles.gold_rathian.some(pattern => pattern.tags.includes('blue-flame')));
assert(profiles.silver_rathalos.some(pattern => pattern.tags.includes('blue-flame')));

console.log('[test] 19 World/Iceborne Flying Wyvern kits passed.');
