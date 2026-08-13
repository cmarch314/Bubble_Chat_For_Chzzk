'use strict';

const assert = require('assert');
global.HuntJourneyEconomy = require('../js/effects/hunt/HuntJourneyEconomy');
const HuntJourneyEventCatalog = require('../js/effects/hunt/HuntJourneyEventCatalog');
const Economy = global.HuntJourneyEconomy;

const result = { zenny: 9, rerolls: 0, supply: { potions: 0, lifepowders: 0, shockTraps: 0, bombs: 0 }, party: [{}] };
Economy.earn(result, 3);
assert.strictEqual(result.zenny, 9);
assert.strictEqual(Economy.buy(result, [0], 'lifepowder'), true);
assert.strictEqual(result.zenny, 7);
assert.strictEqual(result.supply.lifepowders, 1);
const capped = { zenny: 3, rerolls: 0, supply: { potions: 40, lifepowders: 0, shockTraps: 0, flashPods: 0, bombs: 0 }, party: [{}] };
assert.strictEqual(Economy.buy(capped, [0], 'potion'), false);
assert.strictEqual(capped.zenny, 3, 'a full shared stock must not consume currency for a fake purchase');
const discounted = { zenny: 1, rerolls: 0, supply: {}, party: [] };
assert.strictEqual(Economy.buy(discounted, [], 'reroll', 1, 1), true);
assert.deepStrictEqual({ zenny: discounted.zenny, rerolls: discounted.rerolls }, { zenny: 0, rerolls: 1 },
    'event-specific prices must match their displayed cost instead of silently using the global price');
Economy.gather(result, [0], true);
assert.deepStrictEqual(result.ambushHook, { chance: .35, source: 'deep-gather' });
const catalog = HuntJourneyEventCatalog.createDefault();
assert.ok(['felyne', 'tetoru', 'boaboa', 'gajalaka'].every(id => catalog.get(id)));
assert.ok(Object.values(Economy.PRICES).every(price => price >= 1 && price <= 3));
console.log('[test] Journey 0-9 economy, common trade, villages, and deep-gather ambush hook passed.');
