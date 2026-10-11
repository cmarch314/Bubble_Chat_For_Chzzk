'use strict';

const assert = require('assert');
global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
const Catalog = require('../js/effects/hunt/HuntHunterBeatCatalog.js');

const approved = Catalog.compile('great_sword', {
    id: 'great_sword.true_charged_slash', durationTicks: 21, dmg: 760,
    hits: [15, 175], tags: ['sever', 'charge-release', 'heavy', 'finisher']
});
assert.strictEqual(approved.reviewStatus, 'approved',
    'the reviewed Great Sword core action must retain approval');

const unreviewed = Catalog.compile('great_sword', {
    id: 'great_sword.future_prototype', durationTicks: 12, dmg: 150, tags: ['sever']
});
assert.strictEqual(unreviewed.reviewStatus, 'migrated',
    'new weapon actions must not inherit approval merely from their weapon');

const otherWeapon = Catalog.compile('long_sword', {
    id: 'long_sword.foresight', durationTicks: 10, dmg: 110, tags: ['sever', 'counter']
});
assert.strictEqual(otherWeapon.reviewStatus, 'migrated',
    'unreviewed weapons must still run through BEAT without being released as approved');

console.log('[test] Hunter action BEAT approval remains action-scoped.');
