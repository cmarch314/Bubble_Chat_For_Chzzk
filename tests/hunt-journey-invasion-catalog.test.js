'use strict';

const assert = require('assert');
global.HuntJourneyCatalog = require('../js/effects/hunt/HuntJourneyCatalog');
const Catalog = require('../js/effects/hunt/HuntJourneyInvasionCatalog');
const monsters = Catalog.ENTRIES.map(entry => ({ id: entry.id }));
assert.deepStrictEqual(Catalog.candidates(monsters, 0).map(item => item.id), ['deviljho', 'bazelgeuse']);
assert.strictEqual(Catalog.candidates([{ id: 'unknown' }], 2).length, 0);
assert.ok(Catalog.ENTRIES.every(entry => entry.evidence && entry.habitats.length && !['elder', 'colossal'].includes(entry.tier)));
assert.ok(Catalog.pick(monsters, 2, 42));
console.log('[test] Evidence-backed, habitat-labelled, tier-gated invasion catalog passed.');
