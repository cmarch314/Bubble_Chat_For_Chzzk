'use strict';

const assert = require('assert');
global.HuntSharedSupply = require('../js/effects/hunt/HuntSharedSupply');
const HuntRunState = require('../js/effects/hunt/HuntRunState');

const hunters = [{ hunterName: 'A', potions: 99 }, { hunterName: 'B', potions: 0 }];
const supply = HuntSharedSupply.bindHunters(hunters, { potions: 10, lifepowders: 1, shockTraps: 2, bombs: 1 });
assert.strictEqual(hunters[0].potions, 10);
assert.strictEqual(hunters[1].potions, 10);
hunters[0].potions--;
assert.strictEqual(hunters[1].potions, 9, 'all hunters must consume the same camp stock');
hunters[1].lifepowders++;
assert.strictEqual(hunters[0].lifepowders, 2);
assert.deepStrictEqual(HuntSharedSupply.normalize(supply), { potions: 9, lifepowders: 2, shockTraps: 2, bombs: 1 });

const tiers = ['small', 'event', 'medium', 'event', 'medium', 'event', 'normal',
    'normal', 'event', 'normal', 'event', 'elder', 'medium', 'event', 'medium', 'event', 'colossal'];
const nodes = tiers.map((tier, index) => tier === 'event'
    ? { id: `n${index}`, type: 'event', stageIndex: index < 7 ? 0 : index < 12 ? 1 : 2, eventChoices: ['camp'] }
    : { id: `n${index}`, type: 'combat', stageIndex: index < 7 ? 0 : index < 12 ? 1 : 2, tier, monsterChoices: ['m'] });
const state = HuntRunState.normalize({ runId: 'shared', nodes, party: [
    { nickname: 'A', potions: 10, bombs: 1 }, { nickname: 'B', potions: 10, bombs: 1 }
] });
assert.deepStrictEqual(state.supply, { potions: 10, lifepowders: 1, shockTraps: 0, bombs: 1 });
assert.strictEqual(state.party[0].potions, undefined, 'party records must not duplicate shared consumables');
const depleted = HuntRunState.normalize({ runId: 'depleted', nodes, party: [
    { nickname: 'A', potions: 0, lifepowders: 0, shockTraps: 0, bombs: 0 },
    { nickname: 'B', potions: 0, lifepowders: 0, shockTraps: 0, bombs: 0 }
] });
assert.deepStrictEqual(depleted.supply, { potions: 0, lifepowders: 0, shockTraps: 0, bombs: 0 },
    'legacy migration must preserve depletion instead of granting a free refill');

const rendererSource = require('fs').readFileSync(require('path').join(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
assert.match(rendererSource, /shared-potion-count/);
assert.match(rendererSource, /updatePotionCountUI\(idx, count\)[\s\S]*?updateSharedPotionUI\(count\)/,
    'direct potion consumption must refresh shared UI');

const engineSource = require('fs').readFileSync(require('path').join(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
assert.match(engineSource, /if \(!this\.sharedSupply\)/, 'camp return must not clone shared supplies');
console.log('[test] Shared camp supply binding, migration, cap, and compact persistence passed.');
