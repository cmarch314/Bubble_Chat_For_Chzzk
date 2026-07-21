const assert = require('assert');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const HuntMonsterAnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');

const hunters = [0, 1, 2, 3].map(index => ({ index }));
assert.deepStrictEqual(HuntMonsterTurnExecutor.chargeLaneTargets(hunters, 2, () => .62).map(h => h.index), [2, 3],
    'a forward charge must damage adjacent hunters on its selected line');
let rolls = [.62, .9];
assert.deepStrictEqual(HuntMonsterTurnExecutor.chargeLaneTargets(hunters, 3, () => rolls.shift(), true).map(h => h.index), [3, 2, 1],
    'a right-to-left cross charge must preserve its screen direction');
assert.strictEqual(HuntMonsterAnimationCatalog.resolve({ type: 'charge', tags: ['charge'] }, '돌진').id, 'ground-charge');
assert.strictEqual(HuntMonsterAnimationCatalog.resolve({ type: 'charge', tags: ['charge', 'cross-charge'] }, '횡단 돌진').id, 'ground-charge-cross');
console.log('[test] Monster charge lanes and full-screen trajectories passed.');
