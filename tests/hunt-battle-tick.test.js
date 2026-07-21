const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js');
const context = vm.createContext({ console });
context.HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');
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
        prepareMonsterTurn: noop,
        executeHunterTurn: noop,
        triggerGameEnd: (...args) => calls.gameEnd.push(args),
        triggerNextConsecutive: () => { calls.nextConsecutive++; },
        ...overrides
    };
    return { engine, hunter, calls };
}

{
    let resolved = null;
    const pattern = { id: 'test.telegraph', name: '예고 공격', windupTicks: 3 };
    const { engine } = createEngine({
        pendingMonsterAction: { pattern, remainingTicks: 1, totalTicks: 3 },
        executeMonsterTurn(selected) { resolved = selected; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolved, pattern, 'a telegraphed monster action must resolve only after its windup');
    assert.strictEqual(engine.pendingMonsterAction, null);
}

{
    const { engine } = createEngine({
        monsterAtb: 85,
        pendingMonsterAction: { pattern: { id: 'test.wait', name: '준비 중' }, remainingTicks: 2 }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 0, 'monster ATB must stay frozen during a telegraphed windup');
}

{
    let resolved = false;
    const { engine } = createEngine({
        monsterKnockdownDuration: 5,
        monsterState: 'knocked_down',
        pendingMonsterAction: { pattern: { id: 'test.cancel', name: '취소될 공격' }, remainingTicks: 1 },
        executeMonsterTurn() { resolved = true; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolved, false, 'knockdown must cancel a telegraphed monster action');
    assert.strictEqual(engine.pendingMonsterAction, null);
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

{
    const { engine, hunter } = createEngine({
        actionStateMachine: {
            tick(target) {
                target.attackDuration = Math.max(0, Number(target.attackDuration || 0) - 1);
            }
        }
    });
    hunter.attackDuration = 2;
    hunter.atb = 0;

    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.attackDuration, 1);
    assert.strictEqual(hunter.atb, 0, 'ATB must stay frozen while the weapon animation owns the hunter');

    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.attackDuration, 0);
    assert.strictEqual(hunter.atb, 1.15, 'ATB must resume at the shared cadence on the tick where the action timeline completes');
}

{
    const { engine, hunter } = createEngine({ hunterSpeedMultiplier: 1.5 });
    hunter.id = 'insect_glaive';
    hunter.speedGroup = 'fast';
    context.HuntBattleTickExecutor.execute(engine);
    assert.ok(Math.abs(hunter.atb - 1.98375) < 0.001,
        'Insect Glaive extract setup may be nimble but must not compound into the former 2x ATB flood');
    hunter.atb = 0;
    hunter.extractDuration = 30;
    context.HuntBattleTickExecutor.execute(engine);
    assert.ok(Math.abs(hunter.atb - 1.725) < 0.001, 'triple extract must retain the shared motion-driven baseline cadence');
}

{
    const stateUpdates = [];
    const { engine } = createEngine({
        battleTime: 799,
        selectedMonster: { id: 'valstrax', nameKO: '발파루크' },
        valstraxChargeCount: 0,
        valstraxChargeDmg: 0,
        valstraxChargeTimer: 299,
        valstraxEnrageTimer: 0,
        valstraxFlyingTimer: 0,
        updateMonsterStateUI: (...args) => stateUpdates.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterState, 'enraged', 'Valstrax must enter the shared timed rage phase even when three intakes never succeed');
    assert.strictEqual(engine.valstraxChargeTimer, 0, 'timed rage must close a stale intake timer');
    assert.ok(stateUpdates.some(update => update[0] === '분노 상태'));
}

{
    const { engine } = createEngine({
        battleTime: 900,
        selectedMonster: { id: 'crimson_glow_valstrax', nameKO: '영묘한 광채의 발파루크' },
        monsterState: 'knocked_down',
        monsterKnockdownDuration: 1,
        valstraxChargeCount: 2,
        valstraxChargeDmg: 0,
        valstraxChargeTimer: 0,
        valstraxEnrageTimer: 0,
        valstraxFlyingTimer: 0
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterState, 'enraged', 'Valstrax must restore the correct rage phase after knockdown');
    assert.strictEqual(engine.valstraxChargeCount, 2, 'generic knockdown recovery must not erase earned intake progress');
}

{
    const flightUpdates = [];
    const stateUpdates = [];
    const { engine } = createEngine({
        selectedMonster: { id: 'valstrax', nameKO: '발파루크' },
        monsterState: 'enraged',
        valstraxChargeCount: 0,
        valstraxChargeDmg: 0,
        valstraxChargeTimer: 0,
        valstraxEnrageTimer: 299,
        valstraxFlyingTimer: 0,
        updateMonsterFlightUI: value => flightUpdates.push(value),
        updateMonsterStateUI: (...args) => stateUpdates.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterState, 'valstrax_flying');
    assert.deepStrictEqual(flightUpdates, [true], 'Valstrax launch must activate the visible airborne animation');
    assert.ok(stateUpdates.some(update => update[0] === '고고도 비행'));
}

{
    let ambushCinematic = 0;
    const { engine } = createEngine({
        selectedMonster: { id: 'crimson_glow_valstrax', nameKO: '영묘한 광채의 발파루크' },
        monsterState: 'valstrax_flying',
        valstraxChargeCount: 0,
        valstraxChargeDmg: 0,
        valstraxChargeTimer: 0,
        valstraxEnrageTimer: 0,
        valstraxFlyingTimer: 21,
        callbacks: { onTriggerValstraxAmbush: () => { ambushCinematic++; } }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(ambushCinematic, 1, 'the cloud, red-star, and meteor cinematic must start at the synchronized Ambush cue');
}

{
    const { engine, hunter } = createEngine();
    hunter.speedGroup = 'very_fast';
    context.HuntBattleTickExecutor.execute(engine);
    const veryFastMetadataAtb = hunter.atb;
    hunter.atb = 0;
    hunter.speedGroup = 'slow';
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.atb, veryFastMetadataAtb,
        'coarse weapon metadata must not override per-action motion timing');
}

{
    const { engine, hunter } = createEngine();
    hunter.status = 'dead';
    hunter.hp = 0;
    hunter.maxHp = 137;
    hunter.cartTimer = 1;
    let campResupplies = 0;
    engine.resupplyHunterAtCamp = target => {
        campResupplies++;
        target.potions = 12;
        target.lifepowders = 2;
        target.bombs = 3;
    };
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.status, 'alive');
    assert.strictEqual(hunter.hp, 137, 'a hunter must return from camp at full health');
    assert.strictEqual(hunter.cartRecoveryTicks, 9, 'camp return protection must survive the respawn tick');
    assert.strictEqual(campResupplies, 1, 'a hunter must resupply exactly once while returning from camp');
    assert.deepStrictEqual([hunter.potions, hunter.lifepowders, hunter.bombs], [12, 2, 3]);
}

{
    const { engine, calls } = createEngine({ cartCount: 3, cartLimit: 4 });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(calls.gameEnd.length, 0, 'Cart Lover must keep the quest alive on the former third-cart limit');
}

{
    const { engine, calls } = createEngine({ cartCount: 3, questFailCinematicTicks: 2 });
    context.HuntBattleTickExecutor.execute(engine);
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(calls.gameEnd.length, 0, 'third-cart result must wait for the cart animation');
    context.HuntBattleTickExecutor.execute(engine);
    assert.deepStrictEqual(calls.gameEnd, [[false]], 'quest failure must resolve after the cart cinematic window');
}

console.log('[test] Hunt battle tick terminal-transition contract passed.');
