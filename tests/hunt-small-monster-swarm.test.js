const assert = require('assert');
const HuntSmallMonsterSwarm = require('../js/effects/hunt/HuntSmallMonsterSwarm.js');

for (const count of [3, 4, 5]) {
    const swarm = new HuntSmallMonsterSwarm(count, 6500);
    assert.strictEqual(swarm.units.length, count);
    assert.strictEqual(swarm.totalHp(), 6500, 'split HP must preserve the authored small-monster encounter total');
    assert.ok(swarm.units.every(unit => unit.hp === unit.maxHp && unit.alive));
    assert.ok(swarm.units.every(unit => unit.atb === 0));
}
const swarm = new HuntSmallMonsterSwarm(4, 400);
assert.deepStrictEqual([0, 1, 2, 3, 0].map(() => swarm.nextAttacker().index), [0, 1, 2, 3, 0],
    'living small monsters must alternate attacks');
assert.strictEqual(swarm.randomTarget(() => .76).index, 3, 'hunter attacks must be able to select any living monster');
swarm.units[3].atb = 100;
assert.strictEqual(swarm.nextAttacker().index, 3, 'a monster whose personal action gauge is ready must attack');
assert.strictEqual(swarm.units[3].atb, 0, 'only the acting monster gauge is consumed');
swarm.advanceAtb(10);
assert.ok(swarm.units.every(unit => unit.atb > 0), 'each living monster must charge an independent action gauge');
swarm.targetIndex = 0;
let result = swarm.reconcileTotal(300);
assert.deepStrictEqual(result.defeated, [0]);
assert.strictEqual(result.targetIndex, 1, 'hunters must automatically focus the next living monster');
assert.strictEqual(swarm.units[0].alive, false);
swarm.reconcileTotal(200);
assert.strictEqual(swarm.units[1].alive, false);
assert.strictEqual(swarm.aliveUnits().length, 2);
console.log('[test] 3-5 unit small-monster swarm state passed.');
