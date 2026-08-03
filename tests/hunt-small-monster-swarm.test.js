const assert = require('assert');
const HuntSmallMonsterSwarm = require('../js/effects/hunt/HuntSmallMonsterSwarm.js');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');

for (const count of [3, 4, 5]) {
    const swarm = new HuntSmallMonsterSwarm(count, 6500);
    assert.strictEqual(swarm.units.length, count);
    assert.strictEqual(swarm.totalHp(), 6500, 'split HP must preserve the authored small-monster encounter total');
    assert.ok(swarm.units.every(unit => unit.hp === unit.maxHp && unit.alive));
    assert.ok(swarm.units.every(unit => unit.atb === 0));
}
const encounterSwarm = new HuntSmallMonsterSwarm(4, 400, 75);
assert.ok(encounterSwarm.units.every(unit => unit.atb === 75),
    'every small monster must support the shared 25%-depleted encounter start');
const swarm = new HuntSmallMonsterSwarm(4, 400);
assert.strictEqual(swarm.activeAttackerIndex, -1, 'no small monster should appear to be attacking before its gauge is ready');
assert.deepStrictEqual([0, 1, 2, 3, 0].map(() => swarm.nextAttacker().index), [0, 1, 2, 3, 0],
    'living small monsters must alternate attacks');
assert.strictEqual(swarm.randomTarget(() => .76).index, 3, 'hunter attacks must be able to select any living monster');
swarm.units[3].atb = 100;
assert.strictEqual(swarm.reserveReadyAttacker().index, 3, 'a monster whose personal action gauge is ready must reserve the attack');
assert.strictEqual(swarm.units[3].atb, 0, 'only the acting monster gauge is consumed');
assert.strictEqual(swarm.reserveReadyAttacker(), null, 'an unready monster must never borrow the pack action gauge');
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

{
    const turnSwarm = new HuntSmallMonsterSwarm(3, 300);
    turnSwarm.units[0].atb = 100;
    turnSwarm.units[1].atb = 70;
    turnSwarm.units[2].atb = 40;
    const originalSelectPattern = HuntMonsterTurnExecutor.selectPattern;
    HuntMonsterTurnExecutor.selectPattern = () => ({ id: 'small.bite', name: '물어뜯기', windupTicks: 4 });
    const engine = {
        pendingMonsterAction: null,
        smallMonsterSwarm: turnSwarm,
        monsterAtb: 100,
        monsterState: 'normal',
        monsterFlightRuntime: null,
        selectedMonster: { id: 'jagras', nameKO: '쟈그라스' },
        MONSTER_PATTERNS: { default: [] },
        callbacks: { onUpdateSmallMonsterSwarmUI() {} },
        showSkillBubble() {},
        addLog() {},
        updateMonsterAtbUI() { throw new Error('small encounter must not touch shared ATB UI'); }
    };
    assert.strictEqual(HuntMonsterTurnExecutor.prepare(engine), true);
    assert.strictEqual(engine.pendingMonsterAction.attackerIndex, 0, 'the ready unit identity must survive the windup');
    assert.strictEqual(turnSwarm.units[0].atb, 0, 'the reserved unit alone must spend its gauge at windup start');
    assert.strictEqual(turnSwarm.units[1].atb, 70, 'other personal gauges must remain intact');
    HuntMonsterTurnExecutor.selectPattern = originalSelectPattern;
}
console.log('[test] 3-5 unit small-monster swarm state passed.');
