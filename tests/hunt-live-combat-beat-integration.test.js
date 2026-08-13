'use strict';

const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');
global.HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
global.HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
global.HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');
global.HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
global.HuntBalanceTelemetry = require('../js/effects/hunt/HuntBalanceTelemetry.js');
global.HuntBattleTickExecutor = require('../js/effects/hunt/HuntBattleTickExecutor.js');
global.HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
global.HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');
global.HuntTrapConfig = require('../js/effects/hunt/HuntTrapConfig.js');
global.HuntMonsterReactionCatalog = require('../js/effects/hunt/HuntMonsterReactionCatalog.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require(
    '../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');

const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

function createHunter(index) {
    return {
        index,
        id: 'insect_glaive',
        name: `Hunter ${index + 1}`,
        hunterName: `Hunter ${index + 1}`,
        type: 'melee',
        personality: 'balanced',
        status: 'alive',
        hp: 1000,
        maxHp: 1000,
        atb: 0,
        potions: 10,
        sharpness: 100,
        perks: []
    };
}

function createEngine() {
    const presentation = [];
    let engine = null;
    const actionStateMachine = {
        canGuard: () => false,
        canEvade: () => false,
        canCounter: () => false,
        cancel() {},
        tick() {}
    };
    const weaponMechanics = {
        initialize() {},
        onHit() {},
        tick() {}
    };
    const patterns = HuntMonsterPatternCatalog.build({});
    engine = new HuntEngine({
        selectedWeapons: [0, 1, 2, 3].map(createHunter),
        selectedMonster: { id: 'diablos', nameKO: 'Diablos' },
        monsterTier: 'large',
        monsterHp: 10000,
        monsterMaxHp: 10000,
        monsterAtb: 0,
        monsterSpeed: 0.0001,
        hunterSpeedMultiplier: 0,
        random: () => 0.999,
        actionStateMachine,
        weaponMechanics,
        weaponActionSelector: { select: () => null },
        monsterPatternSelector: { tick() {}, cooldowns: new Map() },
        telemetry: {
            recordMonsterPattern() {},
            recordHunterAction() {},
            tick() {}
        },
        MONSTER_ATTACKS: {},
        MONSTER_PATTERNS: patterns,
        COMBO_LIST: {},
        callbacks: {
            onLog() {},
            onUpdateHpUI() {},
            onUpdateMonsterHpUI() {},
            onUpdateWeaponAtbUI() {},
            onUpdateMonsterAtbUI() {},
            onUpdateMonsterStateUI() {},
            onUpdateTimerUI() {},
            onShowSkillBubble() {},
            onShakeWeapon() {},
            onShakeMonster() {},
            onRestoreBorder() {},
            onTriggerMonsterAttack: (...args) => presentation.push(['attack', ...args]),
            onTriggerHitAnimation: (index, reaction) => presentation.push(['hit', index, reaction]),
            onTriggerHunterInterference: (index, kind, size, active) =>
                presentation.push(['interference', index, kind, size, active]),
            onMonsterBeatActionComplete: action => presentation.push(['complete', action.id]),
            onMonsterBeatActionCancel: (action, reason) =>
                presentation.push(['cancel', action.id, reason]),
            onTriggerEnvironmentEffect: (kind, hunterIndex, details) =>
                presentation.push(['environment', engine?.battleTime || 0, kind, hunterIndex, details])
        }
    });
    return { engine, patterns, presentation };
}

{
    const { engine, presentation } = createEngine();
    const trap = engine.beginMonsterTrapControl('trap', 40);
    engine.triggerEnvironmentEffect('pitfall', null, trap);
    assert.strictEqual(trap.durationTicks, 90,
        'the live trap lock must cover the complete Preview-authored pitfall graph');
    assert.strictEqual(trap.releaseTicks, 12,
        'the live escape and DOM fade must inherit the authored 1.2 second release');
    for (let tick = 0; tick < trap.durationTicks; tick++) engine.processTick();
    const environment = presentation.filter(event => event[0] === 'environment');
    assert.deepStrictEqual(environment.filter(event => event[2] === 'trap-struggle')
        .map(event => event[4].struggleIndex), [1, 2, 3, 4, 5, 6],
    'the actual HuntEngine clock must emit every authored struggle exactly once');
    assert.strictEqual(environment.filter(event => event[2] === 'trap-release').length, 1,
        'the actual HuntEngine clock must emit one release handoff');
    assert.strictEqual(environment.find(event => event[2] === 'trap-release')[4].releaseTicks, 12,
        'the renderer handoff must retain the authored release duration');
    assert.strictEqual(engine.activeTrapControl, null,
        'the trap lifecycle may clear only after the complete authored graph');
}

{
    const { engine, patterns, presentation } = createEngine();
    const pattern = patterns.diablos.find(candidate => candidate.id === 'diablos.horn_charge');
    const impactTick = pattern.impactTimeline[0].atTicks;
    const target = engine.selectedWeapons[1];

    assert.strictEqual(engine.executeMonsterTurn(pattern, null, target.index), undefined);
    assert.strictEqual(engine.pendingMonsterImpact, null,
        'an approved live action must never create a legacy delayed-impact countdown');
    assert.strictEqual(engine.isMonsterActionSessionActive(), true,
        'the authored BEAT graph must lock the live monster action immediately');
    assert.deepStrictEqual(
        presentation.find(event => event[0] === 'attack')[3].map(result => result.index),
        [target.index],
        'the visible charge route and its live judgment must preserve the prepared target');

    for (let tick = 1; tick < impactTick; tick++) {
        engine.processTick();
        assert.strictEqual(target.hp, target.maxHp,
            `live damage resolved before the authored Preview marker at tick ${tick}`);
    }
    engine.processTick();
    assert.ok(target.hp < target.maxHp,
        'the real HuntEngine tick must resolve damage on the authored Preview marker');
    assert.ok(target.hitDuration > 0,
        'the same judgment must start the hunter-owned hit recovery state');
    assert.strictEqual(
        presentation.filter(event => event[0] === 'hit' && event[1] === target.index).length,
        1,
        'one live judgment must create exactly one hit presentation');

    while (engine.isMonsterActionSessionActive()) engine.processTick();
    assert.deepStrictEqual(
        presentation.filter(event => event[0] === 'complete').map(event => event[1]),
        [pattern.beatV2.id],
        'the live action must complete once, after its authored return beat');
    assert.strictEqual(engine.pendingMonsterImpact, null);
}

{
    const { engine, patterns, presentation } = createEngine();
    const pattern = patterns.diablos.find(candidate => candidate.id === 'diablos.horn_charge');
    engine.executeMonsterTurn(pattern, null, 0);
    engine.processTick();
    engine.beginMonsterTrapControl('trap', 40);
    for (let tick = 0; tick < pattern.beatV2.totalTicks; tick++) engine.processTick();
    assert.strictEqual(engine.selectedWeapons[0].hp, engine.selectedWeapons[0].maxHp,
        'a pitfall interruption must purge the cancelled action judgment from live combat');
    assert.strictEqual(engine.combatJudgmentRuntime.recentTrace()
        .some(entry => entry.type === 'session-cancelled'), true,
    'the live outbox must record control cancellation instead of leaking a late hit');
    assert.strictEqual(presentation.filter(event => event[0] === 'hit').length, 0);
}

console.log('[test] live HuntEngine BEAT combat integration passed');
