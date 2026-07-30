'use strict';

const assert = require('assert');
const catalog = require('../js/effects/hunt/HuntAudioCatalog.js');

global.HUNT_VERIFIED_LOCAL_MONSTER_CUES = catalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES;
global.HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES = catalog.HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES;
global.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS = catalog.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS;
global.HUNT_ROAR_ROUTE = catalog.HUNT_ROAR_ROUTE;

const HuntAudioManager = require('../js/effects/hunt/HuntAudioManager.js');
const manager = Object.create(HuntAudioManager.prototype);

for (const patternType of ['physical', 'charge', 'projectile', 'breath']) {
    assert.strictEqual(manager.normalizedMonsterAudioKind(patternType), 'attack',
        `${patternType} is a pattern type, not a separate audio route`);
}
assert.strictEqual(manager.normalizedMonsterAudioKind('roar'), 'roar');
assert.strictEqual(
    manager.monsterSeFallbackTag('attack', { patternType: 'flight', patternId: 'aerial_glide' }),
    'wing_flap'
);
assert.strictEqual(
    manager.monsterSeFallbackTag('attack', { patternType: 'charge', patternId: 'body_tackle' }),
    'physical_impact'
);
assert.strictEqual(
    manager.monsterSeFallbackTag('attack', { patternType: 'projectile', patternId: 'fire_breath' }),
    null,
    'elemental/projectile delivery must not borrow a generic physical effect'
);
assert.strictEqual(manager.monsterSeFallbackTag('roar', {}), null,
    'identity-bound voice moments must never enter an SE fallback pool');

let routedKind = null;
manager.playVerifiedMonsterCue = (_monster, kind) => {
    routedKind = kind;
    return true;
};
manager.playMonsterAction({ id: 'fixture_monster' }, 'physical', { patternId: 'claw_swipe' });
assert.strictEqual(routedKind, 'attack',
    'pattern types must resolve through the authored monster attack route');

let selected = null;
manager.playVerifiedLayers = variant => {
    selected = variant;
    return true;
};
assert.strictEqual(
    manager.playGenericMonsterSeFallback('attack', { patternType: 'flight' }),
    true
);
assert.ok(selected.layers.every(([audioPath]) =>
    audioPath.includes('_se_') && !audioPath.includes('_vo_')),
'temporary cross-species fallback must never select a monster voice');

console.log('[test] Monster semantic SE fallback policy passed.');
