'use strict';

const assert = require('assert');

global.window = global;
global.HUNT_MONSTER_RELEASE_MANIFEST = {
    records: [{ id: 'edition_test', canonicalEdition: 'world-iceborne' }]
};
global.HUNT_WILDS_MONSTER_BEHAVIOR = {
    edition_test: { patterns: [{ id: 'edition_test.wilds', name: 'Wilds move', damageRatio: 0.2, windupTicks: 1, recoveryTicks: 1 }] }
};
global.HUNT_WORLD_MONSTER_BEHAVIOR = {
    edition_test: { patterns: [{ id: 'edition_test.world', name: 'World move', damageRatio: 0.2, windupTicks: 1, recoveryTicks: 1 }] }
};
global.HUNT_MONSTER_PATTERN_OVERRIDES = {};
global.HuntMonsterEditionResolver = require('../js/effects/hunt/HuntMonsterEditionResolver.js');

delete require.cache[require.resolve('../js/effects/hunt/HuntMonsterPatternCatalog.js')];
const Catalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const resolved = Catalog.build({}, [{ id: 'edition_test', tier: 'large' }]);
assert.deepStrictEqual(resolved.edition_test.map(pattern => pattern.id), ['edition_test.world'],
    'a released World kit must ignore a newer Wilds candidate');
assert.deepStrictEqual(Catalog.validateReleased(resolved, global.HUNT_MONSTER_RELEASE_MANIFEST), []);

global.HUNT_WORLD_MONSTER_BEHAVIOR = {};
const missing = Catalog.build({}, [{ id: 'edition_test', tier: 'large' }]);
assert.deepStrictEqual(missing.edition_test, [],
    'a released kit must fail closed instead of borrowing another edition');
assert.deepStrictEqual(
    Catalog.validateReleased(missing, global.HUNT_MONSTER_RELEASE_MANIFEST),
    ['edition_test released kit has no patterns for world-iceborne']
);

console.log('[test] Released monster patterns obey canonical edition and fail closed.');
