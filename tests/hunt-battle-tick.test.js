const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js');
const context = vm.createContext({ console });
context.HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');
context.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
context.HuntTrapConfig = require('../js/effects/hunt/HuntTrapConfig.js');
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
        monsterAtbUpdates: 0,
        sfx: []
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
        playSFX: (...args) => calls.sfx.push(args),
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
    let roars = 0;
    let turns = 0;
    const { engine } = createEngine({
        battleTime: 9,
        monsterTier: 'large',
        monsterAtb: 84,
        triggerEncounterRoar() {
            roars++;
            this.monsterRoarDuration = 12;
        },
        prepareMonsterTurn() { turns++; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.pendingMonsterEncounterRoar, true);
    assert.strictEqual(roars, 0, 'encounter roar must wait for the remaining ATB quarter');
    assert.strictEqual(turns, 0, 'a normal attack must not bypass a queued encounter roar');
    engine.monsterAtb = 100;
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(roars, 1, 'encounter roar must begin after the opening ATB reaches full');
    assert.strictEqual(turns, 0);
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
    const impactPattern = { id: 'diablos.horn_uppercut', runtimeImpactCommit: true };
    const resolutions = [];
    const { engine } = createEngine({
        pendingMonsterImpact: {
            pattern: impactPattern,
            remainingTicks: 2,
            totalTicks: 2,
            attackerIndex: null,
            targetIndex: 0
        },
        executeMonsterTurn: (...args) => resolutions.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolutions.length, 0,
        'uppercut defense and damage must not resolve before the collision tick');
    assert.strictEqual(engine.pendingMonsterImpact.remainingTicks, 1);
    context.HuntBattleTickExecutor.execute(engine);
    assert.deepStrictEqual(resolutions, [[impactPattern, null, 0]],
        'the collision tick must resolve against the originally approached hunter');
    assert.strictEqual(engine.pendingMonsterImpact, null);
}

{
    const beatV2 = { id: 'diablos.burrow_enter', backend: 'beat-v2' };
    const impactPattern = {
        id: 'diablos.burrow_enter', beatV2Approved: true, beatV2,
        runtimeImpactCommit: true, runtimeImpactTimelineEvent: true
    };
    const resolutions = [];
    const { engine } = createEngine({
        tickMonsterBeatAction() {},
        monsterBeatRuntime: {
            get: () => ({ action: beatV2, elapsedTicks: 41 })
        },
        monsterBeatJudgmentTicks: new Map(),
        pendingMonsterImpact: {
            pattern: impactPattern,
            remainingTicks: 1,
            totalTicks: 40,
            attackerIndex: null,
            targetIndex: 0,
            nextEventIndex: 0,
            events: [{ atTicks: 40, targetIndices: [0], damageScale: 1 }]
        },
        executeMonsterTurn: (...args) => resolutions.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolutions.length, 1,
        'an authored eruption whose due tick has passed must commit even if its notification was missed');
    assert.strictEqual(resolutions[0][0].runtimeImpactTargetIndices[0], 0,
        'the recovered eruption commit must retain the locked hunter');
    assert.strictEqual(engine.pendingMonsterImpact, null,
        'a recovered overdue judgment must not remain stuck at one tick forever');
}

{
    const volleys = [];
    const resolutions = [];
    const { engine } = createEngine({
        pendingMonsterImpact: {
            pattern: {
                id: 'bazelgeuse.breath',
                tags: ['blast-scale-source'],
                scaleDropsByPart: { body: 1, head: 2 },
                scaleDropTiming: 'before-impact',
                runtimeImpactCommit: true,
                runtimeImpactTimelineEvent: true
            },
            remainingTicks: 1,
            totalTicks: 1,
            attackerIndex: null,
            targetIndex: 0,
            nextEventIndex: 0,
            events: [
                { atTicks: 1, targetIndices: [0], damageScale: 0, eventKind: 'blast-scale-volley' },
                { atTicks: 3, targetIndices: [0], damageScale: 1, eventKind: 'breath-impact' }
            ]
        },
        monsterTraitRuntime: {
            dropScalesForAction(_engine, pattern, targets) {
                volleys.push({ pattern, targets });
            },
            onImpactEvent() {}
        },
        executeMonsterTurn: (...args) => resolutions.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(volleys.length, 1);
    assert.deepStrictEqual(
        JSON.parse(JSON.stringify(volleys[0].targets)),
        [{ index: 0, result: 'pending-impact' }]
    );
    assert.strictEqual(resolutions.length, 0,
        'the scale volley must not deal breath damage before the authored impact frame');
    context.HuntBattleTickExecutor.execute(engine);
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolutions.length, 1);
    assert.strictEqual(resolutions[0][0].runtimeImpactEventKind, 'breath-impact');
}

{
    const previousTurns = context.HuntMonsterTurnExecutor;
    context.HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
    const hunters = [0, 1, 2].map(index => ({
        index,
        id: 'great_sword',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        atb: 0,
        hitDuration: index === 1 ? 8 : 0
    }));
    const resolutions = [];
    const { engine } = createEngine({
        selectedWeapons: hunters,
        random: () => .99,
        pendingMonsterImpact: {
            pattern: {
                id: 'bazelgeuse.carpet_bombing',
                runtimeImpactCommit: true,
                runtimeImpactTimelineEvent: true
            },
            remainingTicks: 1,
            totalTicks: 1,
            attackerIndex: null,
            targetIndex: 0,
            events: [{
                atTicks: 1,
                targetIndices: null,
                targetMode: 'random-live',
                eventKind: 'carpet-dive',
                defenseMode: 'emergency-jump'
            }],
            nextEventIndex: 0
        },
        executeMonsterTurn: (...args) => resolutions.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.deepStrictEqual(resolutions[0][0].runtimeImpactTargetIndices, [2],
        'Bazelgeuse must acquire the dive target at the crash event, not at takeoff');
    assert.strictEqual(resolutions[0][2], 2);
    context.HuntMonsterTurnExecutor = previousTurns;
}

{
    let resolved = false;
    const { engine } = createEngine({
        monsterKnockdownDuration: 5,
        monsterState: 'knocked_down',
        pendingMonsterImpact: {
            pattern: { id: 'diablos.horn_uppercut', runtimeImpactCommit: true },
            remainingTicks: 1,
            targetIndex: 0
        },
        executeMonsterTurn() { resolved = true; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolved, false, 'knockdown before contact must cancel the uppercut impact');
    assert.strictEqual(engine.pendingMonsterImpact, null);
}

{
    const resolutions = [];
    const { engine } = createEngine({
        pendingMonsterImpact: {
            pattern: {
                id: 'test.combo',
                runtimeImpactCommit: true,
                runtimeImpactTimelineEvent: true
            },
            remainingTicks: 1,
            totalTicks: 1,
            attackerIndex: null,
            targetIndex: 0,
            nextEventIndex: 0,
            events: [
                { atTicks: 1, targetIndices: [0], damageScale: 1 },
                { atTicks: 3, targetIndices: [0], damageScale: .8 }
            ]
        },
        executeMonsterTurn: (...args) => resolutions.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolutions.length, 1);
    assert.strictEqual(engine.pendingMonsterImpact.remainingTicks, 2);
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolutions.length, 1, 'combo follow-up must wait for its own contact tick');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolutions.length, 2);
    assert.deepStrictEqual(resolutions.map(call => call[0].runtimeImpactDamageScale), [1, .8]);
    assert.deepStrictEqual(resolutions.map(call => call[0].runtimeImpactTimelineFinal), [false, true],
        'only the final crossing may resolve a last-pass whiff reaction');
    assert.strictEqual(engine.pendingMonsterImpact, null);
}

{
    const { engine } = createEngine({
        monsterAtb: 85,
        pendingMonsterAction: { pattern: { id: 'test.wait', name: '준비 중' }, remainingTicks: 2 }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 86, 'monster ATB recovery must continue during a telegraphed windup');
}

{
    let packAtb = 35;
    let packUpdates = 0;
    const swarm = {
        advanceAtb(amount) { packAtb += amount; return packAtb; },
        snapshot() { return { units: [{ index: 0, atb: packAtb, alive: true }] }; }
    };
    const { engine, calls } = createEngine({
        smallMonsterSwarm: swarm,
        monsterSpeed: 2,
        pendingMonsterAction: { pattern: { id: 'small.wait', name: '물어뜯기' }, remainingTicks: 2 },
        callbacks: { onUpdateSmallMonsterSwarmUI: () => { packUpdates++; } }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(packAtb, 37, 'the other small monsters must keep charging while one attack is telegraphed');
    assert.strictEqual(engine.monsterAtb, 37, 'the compatibility pressure value should mirror the highest personal gauge');
    assert.strictEqual(calls.monsterAtbUpdates, 0, 'small encounters must not update the obsolete shared monster ATB UI');
    assert.strictEqual(packUpdates, 1, 'personal small-monster gauges must refresh during a telegraph');
}

{
    let resolved = false;
    const { engine } = createEngine({
        monsterKnockdownDuration: 5,
        monsterState: 'knocked_down',
        monsterAtb: 100,
        pendingMonsterAction: { pattern: { id: 'test.cancel', name: '취소될 공격' }, remainingTicks: 1 },
        prepareMonsterTurn() { resolved = true; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(resolved, false, 'knockdown must cancel a telegraphed monster action');
    assert.strictEqual(engine.pendingMonsterAction, null);
    assert.strictEqual(engine.monsterAtb, 100,
        'a true knockdown must keep its already-filled ATB while the interrupted attack is cleared');
}

{
    let resolved = false;
    const { engine } = createEngine({
        monsterKnockdownDuration: 5,
        monsterState: 'knocked_down',
        monsterAtb: 98,
        prepareMonsterTurn() { resolved = true; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 99, 'monster ATB must keep recovering during knockdown');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 100, 'knockdown recovery may fill and hold the monster ATB gauge');
    assert.strictEqual(resolved, false, 'a full ATB gauge must not act before knockdown recovery ends');
}

{
    let resolved = false;
    const { engine } = createEngine({
        monsterStunDuration: 3,
        monsterState: 'stunned',
        monsterAtb: 98,
        prepareMonsterTurn() { resolved = true; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 99, 'monster ATB must recover during the stun animation');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 100, 'stun recovery may fill and hold the monster ATB gauge');
    assert.strictEqual(resolved, false, 'a full ATB gauge must not act before stun recovery ends');
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
    assert.strictEqual(calls.sfx.length, 1,
        'the confirmed death voice must fire once before the result transition');
    assert.strictEqual(calls.sfx[0][0], 'monster_death');
    assert.strictEqual(calls.sfx[0][1], null);
    assert.strictEqual(calls.sfx[0][2].monsterId, 'rathalos');
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
    assert.strictEqual(hunter.atb, 1, 'ATB must recover during the weapon animation');

    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.attackDuration, 0);
    assert.strictEqual(hunter.atb, 2, 'the ten-second ATB budget must recover at one point per tick');
}

{
    const { engine, hunter } = createEngine({ hunterSpeedMultiplier: 1.5 });
    hunter.id = 'insect_glaive';
    hunter.speedGroup = 'fast';
    context.HuntBattleTickExecutor.execute(engine);
    assert.ok(Math.abs(hunter.atb - 1.5) < 0.001,
        'Insect Glaive extract setup must not bypass the shared ten-second ATB cadence');
    hunter.atb = 0;
    hunter.extractDuration = 30;
    context.HuntBattleTickExecutor.execute(engine);
    assert.ok(Math.abs(hunter.atb - 1.5) < 0.001, 'triple extract must retain the shared ten-second ATB cadence');
}

{
    let rageRoars = 0;
    const pattern = { id: 'rathalos.fireball', name: 'Fireball' };
    const { engine } = createEngine({
        battleTime: 799,
        monsterTier: 'large',
        monsterBehavior: {
            rageStartTick: 800,
            rageDurationTicks: 1200,
            rageRecoveryDurationTicks: 300,
            rageOpenerPatternId: 'rathalos.backstep_fireball'
        },
        pendingMonsterAction: { pattern, remainingTicks: 2, totalTicks: 2 },
        triggerMonsterRoarFlinch: () => { rageRoars++; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterState, 'normal',
        'timed rage must not replace the state snapshot of an action already in progress');
    assert.strictEqual(rageRoars, 0,
        'rage must not roar over an attack that is still in progress');
    assert.strictEqual(engine.pendingMonsterRageRoar, undefined);
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterState, 'enraged');
    assert.strictEqual(rageRoars, 1,
        'the queued rage roar must fire exactly once after the current attack completes');
    assert.strictEqual(engine.pendingMonsterRageRoar, false);
    assert.strictEqual(engine.forcedMonsterPatternId, 'rathalos.backstep_fireball',
        'Rathalos rage opener must be queued after its rage roar');
}

{
    const impactPattern = { id: 'tigrex.charge_rock', name: '연속 돌진' };
    const { engine } = createEngine({
        battleTime: 1999,
        monsterState: 'enraged',
        monsterBehavior: {
            rageStartTick: 800,
            rageDurationTicks: 1200,
            rageRecoveryDurationTicks: 300
        },
        pendingMonsterImpact: {
            pattern: impactPattern,
            remainingTicks: 5,
            totalTicks: 10,
            events: [{ atTicks: 10, targetIndices: [0] }],
            nextEventIndex: 0,
            targetIndex: 0
        }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterState, 'enraged',
        'rage expiry must wait until a multi-impact charge and its traversal finish');
    engine.pendingMonsterImpact = null;
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterState, 'normal',
        'the deferred timed state must apply at the first safe action boundary');
}

{
    const engine = {
        battleTime: 1999,
        monsterState: 'enraged',
        monsterBehavior: {
            rageStartTick: 800,
            rageDurationTicks: 1200,
            rageRecoveryDurationTicks: 300
        },
        pendingMonsterImpact: { remainingTicks: 400 }
    };
    for (let tick = 0; tick < 350; tick++) {
        engine.battleTime++;
        assert.strictEqual(context.HuntBattleTickExecutor.resolveTimedMonsterState(engine), 'enraged');
    }
    engine.pendingMonsterImpact = null;
    engine.battleTime++;
    assert.strictEqual(context.HuntBattleTickExecutor.resolveTimedMonsterState(engine), 'normal',
        'a long action must not skip the entire normal recovery window and leave rage permanent');
    engine.monsterState = 'normal';
    for (let tick = 0; tick < 299; tick++) {
        engine.battleTime++;
        assert.strictEqual(context.HuntBattleTickExecutor.resolveTimedMonsterState(engine), 'normal');
    }
    engine.battleTime++;
    assert.strictEqual(context.HuntBattleTickExecutor.resolveTimedMonsterState(engine), 'enraged',
        'the next rage must begin only after the full authored recovery interval');
}

{
    let rageRoars = 0;
    const { engine } = createEngine({
        battleTime: 799,
        monsterTier: 'large',
        monsterFlightState: 'airborne',
        monsterBehavior: {
            rageStartTick: 800,
            rageDurationTicks: 1200,
            rageRecoveryDurationTicks: 300
        },
        triggerMonsterRoarFlinch: () => { rageRoars++; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(rageRoars, 0,
        'a flying monster must not emit a transition roar in midair');
    assert.strictEqual(engine.pendingMonsterRageRoar, true);
    engine.monsterFlightState = 'grounded';
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(rageRoars, 1,
        'the deferred rage roar must fire after landing');
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
    assert.strictEqual(hunter.atb, 0, 'return animation must hold ATB at zero before its final 30%');
    assert.strictEqual(campResupplies, 1, 'a hunter must resupply exactly once while returning from camp');
    assert.deepStrictEqual([hunter.potions, hunter.lifepowders, hunter.bombs], [12, 2, 3]);
    for (let tick = 0; tick < 5; tick++) context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.atb, 0, 'ATB must remain stopped through the first 70% of the return jump');
    context.HuntBattleTickExecutor.execute(engine);
    assert.ok(hunter.atb > 0, 'ATB must begin charging near the final 30% of the return jump');
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

{
    const effects = [];
    let monsterTurns = 0;
    const { engine } = createEngine({
        monsterAtb: 75,
        monsterState: 'knocked_down',
        monsterKnockdownDuration: 10,
        activeTrapControl: {
            kind: 'shocktrap',
            durationTicks: 10,
            recoveryPerTick: 2.5,
            retainedAtb: 75,
            useCount: 3,
            elapsedTicks: 0,
            struggleSchedule: [],
            nextStruggleIndex: 0,
            releasing: false
        },
        triggerEnvironmentEffect: (...args) => effects.push(args),
        prepareMonsterTurn: () => { monsterTurns++; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 77.5);
    assert.ok(engine.activeTrapControl,
        'the trap visual state must remain active while its ATB recovery is incomplete');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.monsterAtb, 80);
    assert.strictEqual(engine.activeTrapControl.releasing, true,
        'escape must begin at the start of its reserved eight-tick timeline segment');
    assert.strictEqual(JSON.stringify(effects),
        JSON.stringify([['trap-release', null, { kind: 'shocktrap', useCount: 3 }]]),
        'the trap visual must release exactly once at the authored escape beat');
    assert.strictEqual(monsterTurns, 0,
        'trap release and the next monster pattern must never share a frame');
    for (let tick = 0; tick < 8; tick++) {
        context.HuntBattleTickExecutor.execute(engine);
        assert.strictEqual(monsterTurns, 0,
            'the monster must stay locked until the authored escape animation completes');
    }
    assert.strictEqual(engine.activeTrapControl, null);
    assert.strictEqual(effects.length, 1, 'escape must not be emitted again when its final tick completes');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(monsterTurns, 1,
        'the full ATB action may start only after the complete escape handoff');
}

{
    const effects = [];
    const { engine } = createEngine({
        monsterAtb: 50,
        monsterState: 'knocked_down',
        monsterKnockdownDuration: 20,
        // Cancellation completion is asynchronous in the live hunt. A stale
        // pending action must not stall the authoritative trap clock.
        pendingMonsterAction: Promise.resolve(),
        activeTrapControl: {
            kind: 'pitfall', durationTicks: 20, recoveryPerTick: 2.5,
            retainedAtb: 50, useCount: 1, elapsedTicks: 5,
            struggleSchedule: [6], nextStruggleIndex: 0, releasing: false
        },
        triggerEnvironmentEffect: (...args) => effects.push(args)
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(engine.activeTrapControl.elapsedTicks, 6,
        'a cancelled pending action must not freeze the live pitfall clock');
    assert.strictEqual(JSON.stringify(effects), JSON.stringify([['trap-struggle', null,
        { kind: 'pitfall', useCount: 1, struggleIndex: 1 }]]),
    'the authored struggle pulse must still fire while action cancellation settles');
}

{
    let monsterTurns = 0;
    const { engine } = createEngine({
        monsterAtb: 100,
        monsterActionPresentationTicks: 2,
        prepareMonsterTurn: () => { monsterTurns++; }
    });
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(monsterTurns, 0,
        'a new pattern must not start while the prior BEAT presentation still owns the monster');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(monsterTurns, 1,
        'the next pattern may start after the presentation reaches its clean boundary');
}

console.log('[test] Hunt battle tick terminal-transition contract passed.');
