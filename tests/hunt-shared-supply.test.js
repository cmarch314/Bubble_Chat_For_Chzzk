'use strict';

const assert = require('assert');
global.HuntPersonalityProfiles = require('../js/effects/hunt/HuntPersonalityProfiles');
const HuntIssuedSupplyRuntime = require('../js/effects/hunt/HuntIssuedSupplyRuntime');
global.HuntSharedSupply = require('../js/effects/hunt/HuntSharedSupply');
const HuntRunState = require('../js/effects/hunt/HuntRunState');

const offensive = { hunterName: 'A', personality: 'offensive', perkModifiers: {} };
const support = { hunterName: 'B', personality: 'support', perkModifiers: {} };
HuntIssuedSupplyRuntime.grant(offensive, 'hunt-1');
HuntIssuedSupplyRuntime.grant(support, 'hunt-1');
assert.strictEqual(offensive.potions, 10);
assert.strictEqual(support.potions, 10);
offensive.potions--;
assert.strictEqual(support.potions, 10, 'per-hunt issued items must remain personal');

const camp = HuntSharedSupply.normalize({ potions: 10, lifepowders: 4, shockTraps: 3, flashPods: 2, bombs: 5 });
offensive.potions = 7;
offensive.bombs = 2;
const transferred = HuntIssuedSupplyRuntime.resupplyFromCamp(offensive, camp);
assert.deepStrictEqual(transferred, { potions: 3, lifepowders: 0, shockTraps: 0, flashPods: 0, bombs: 3 });
assert.strictEqual(offensive.potions, 10);
assert.strictEqual(camp.potions, 7, 'camp supply must only pay for the missing personal amount');
assert.strictEqual(camp.bombs, 2);
offensive.potions = 4;
HuntIssuedSupplyRuntime.grant(offensive, 'hunt-1');
assert.strictEqual(offensive.potions, 4, 'same grant id must be idempotent and preserve current inventory');

const tiers = ['small', 'event', 'medium', 'event', 'medium', 'event', 'normal',
    'normal', 'event', 'normal', 'event', 'elder', 'medium', 'event', 'medium', 'event', 'colossal'];
const nodes = tiers.map((tier, index) => tier === 'event'
    ? { id: `n${index}`, type: 'event', stageIndex: index < 7 ? 0 : index < 12 ? 1 : 2, eventChoices: ['camp'] }
    : { id: `n${index}`, type: 'combat', stageIndex: index < 7 ? 0 : index < 12 ? 1 : 2, tier, monsterChoices: ['m'] });
const state = HuntRunState.normalize({ runId: 'shared', nodes, supply: HuntSharedSupply.INITIAL, party: [
    { nickname: 'A', potions: 10, bombs: 1 }, { nickname: 'B', potions: 10, bombs: 1 }
] });
assert.deepStrictEqual(state.supply, { potions: 10, lifepowders: 1, shockTraps: 0, flashPods: 0, bombs: 1 });
assert.strictEqual(state.party[0].potions, undefined, 'party records must not persist consumables');
const depleted = HuntRunState.normalize({ runId: 'depleted', nodes, supply: {
    potions: 0, lifepowders: 0, shockTraps: 0, flashPods: 0, bombs: 0
} });
assert.deepStrictEqual(depleted.supply, { potions: 0, lifepowders: 0, shockTraps: 0, flashPods: 0, bombs: 0 });

const engineSource = require('fs').readFileSync(require('path').join(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
assert.doesNotMatch(engineSource, /bindHunters/, 'runtime must never alias personal inventory to camp stock');
assert.match(engineSource, /resupplyFromCamp/);
console.log('[test] Personal issued supplies and persistent camp stock separation passed.');
