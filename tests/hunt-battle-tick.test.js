const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js');
const context = vm.createContext({ console });
vm.runInContext(
    `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntBattleTickExecutor = HuntBattleTickExecutor;`,
    context,
    { filename: sourcePath }
);

function createEngine(overrides = {}) {
    const hunter = {
        index: 0,
        id: 'great_sword',
        name: 'Great Sword',
        hunterName: 'Tester',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        atb: 0,
        potions: 10,
        speedGroup: 'normal'
    };
    const calls = {
        gameEnd: [],
        nextConsecutive: 0,
        monsterAtbUpdates: 0
    };
    const noop = () => {};
    const engine = {
        battleTime: 0,
        selectedWeapons: [hunter],
        selectedMonster: { id: 'rathalos', nameKO: 'Rathalos' },
        monsterState: 'normal',
        monsterHp: 100,
        monsterAtb: 0,
        monsterSpeed: 1,
        monsterKnockdownDuration: 0,
        monsterStunDuration: 0,
        monsterRoarDuration: 0,
        cartCount: 0,
        currentConsecutiveIndex: 0,
        consecutiveTotal: 1,
        hunterSpeedMultiplier: 1,
        callbacks: {},
        getRemainingSeconds: () => 100,
        updateTimerUI: noop,
        addLog: noop,
        triggerHunterCart: noop,
        updateHpUI: noop,
        updateMonsterAtbUI: () => { calls.monsterAtbUpdates++; },
        updateMonsterStateUI: noop,
        triggerEncounterRoar: noop,
        restoreBorder: noop,
        playSFX: noop,
        shakeWeapon: noop,
        updateOverheatUI: noop,
        getMonsterSpeedForState: () => 1,
        triggerMonsterRoarFlinch: noop,
        shakeMonster: noop,
        updateWeaponAtbUI: noop,
        executeValstraxChargeSuccess: noop,
        executeMonsterTurn: noop,
        executeHunterTurn: noop,
        triggerGameEnd: (...args) => calls.gameEnd.push(args),
        triggerNextConsecutive: () => { calls.nextConsecutive++; },
        ...overrides
    };
    return { engine, hunter, calls };
}

{
    const { engine, calls } = createEngine({ getRemainingSeconds: () => 0 });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.battleTime, 1);
    assert.deepStrictEqual(calls.gameEnd, [[false]]);
}

{
    const { engine, hunter, calls } = createEngine({ monsterHp: 0 });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(calls.gameEnd.length, 1);
    assert.strictEqual(calls.gameEnd[0][0], true);
    assert.strictEqual(calls.gameEnd[0][1], hunter);
}

{
    const { engine, hunter, calls } = createEngine({
        monsterHp: 0,
        consecutiveTotal: 2
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(calls.nextConsecutive, 1);
    assert.strictEqual(calls.gameEnd.length, 0);
    assert.strictEqual(calls.monsterAtbUpdates, 0, 'the completed monster tick must stop at handover');
    assert.strictEqual(engine.monsterAtb, 0);
    assert.strictEqual(hunter.atb, 0);
}

console.log('[test] Hunt battle tick terminal-transition contract passed.');
