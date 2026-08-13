'use strict';

const assert = require('assert');
const HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
global.HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');

const noop = () => {};
const hunter = {
    index: 0,
    id: 'great_sword',
    type: 'melee',
    name: '숫돌 헌터',
    hunterName: '숫돌 헌터',
    status: 'alive',
    hp: 100,
    maxHp: 100,
    atb: 0,
    sharpness: 25,
    pendingSharpnessRestore: true,
    itemDuration: 20,
    isGathering: false
};
const logs = [];
let cancelledAudio = 0;
const engine = {
    selectedWeapons: [hunter],
    selectedMonster: { id: 'test_monster', nameKO: '훈련 몬스터' },
    MONSTER_PATTERNS: {
        test_monster: [{
            id: 'test.hit',
            name: '훈련 공격',
            type: 'melee',
            damageRatio: 0.2,
            minTargets: 1,
            maxTargets: 1,
            runtimeImpactCommit: true
        }]
    },
    monsterState: 'normal',
    monsterHp: 1000,
    monsterMaxHp: 1000,
    monsterAtb: 100,
    monsterDamageMod: 1,
    monsterStunAccum: 0,
    callbacks: {
        onCancelWhetstoneCue: () => { cancelledAudio++; }
    },
    teamTactic: 'balanced',
    random: () => 0.99,
    actionStateMachine: new HuntActionStateMachine(),
    telemetry: { recordMonsterPattern: noop },
    monsterPatternSelector: null,
    weaponMechanics: { onHit: noop, tick: noop },
    interruptHunterItemAction: HuntEngine.prototype.interruptHunterItemAction,
    playSFX: noop,
    updateMonsterHpUI: noop,
    checkMonsterKnockdown: noop,
    updateHpUI: noop,
    updateWeaponAtbUI: noop,
    triggerHunterCart: noop,
    shakeMonster: noop,
    triggerHitAnimation: noop,
    restoreBorder: noop,
    addLog: (text) => logs.push(text),
    showSkillBubble: noop,
    shakeWeapon: noop,
    getMonsterAttackType: () => ({ type: 'melee', emoji: '💥' })
};

HuntMonsterTurnExecutor.execute(engine);

assert.ok(hunter.hp < hunter.maxHp, 'the attack must actually hit a sharpening hunter');
assert.strictEqual(hunter.pendingSharpnessRestore, false, 'the hit must revoke pending sharpness restoration');
assert.strictEqual(hunter.itemDuration, 0, 'the hit must end the sharpening item lock immediately');
assert.strictEqual(cancelledAudio, 1, 'the hit must invalidate delayed whetstone scraping audio');
assert.ok(logs.some(text => text.includes('[숫돌질 실패]')), 'the interruption must be readable in combat logs');

const evadingHunter = {
    ...hunter,
    hp: 100,
    pendingSharpnessRestore: true,
    itemDuration: 20,
    actionState: 'idle',
    currentAction: null,
    hitDuration: 0
};
let evadeCancelledAudio = 0;
let evadePresentationCount = 0;
const evadeEngine = {
    ...engine,
    selectedWeapons: [evadingHunter],
    monsterHp: 1000,
    monsterAtb: 100,
    random: () => 0,
    callbacks: {
        ...engine.callbacks,
        onCancelWhetstoneCue: () => { evadeCancelledAudio++; },
        onTriggerRollAnimation: () => { evadePresentationCount++; }
    },
    presentHunterImpact: HuntEngine.prototype.presentHunterImpact
};

HuntMonsterTurnExecutor.execute(evadeEngine);

assert.strictEqual(evadingHunter.hp, evadingHunter.maxHp, 'a sharpening hunter may evade the incoming attack');
assert.strictEqual(evadingHunter.pendingSharpnessRestore, false, 'evading must revoke pending sharpness restoration');
assert.strictEqual(evadingHunter.itemDuration, 0, 'evading must end the sharpening item lock');
assert.strictEqual(evadeCancelledAudio, 1, 'evading must invalidate delayed whetstone scraping audio');
assert.strictEqual(evadePresentationCount, 1,
    'a sharpening hunter may avoid damage only with a committed visible roll');

const liveStateHunter = {
    ...evadingHunter,
    pendingSharpnessRestore: true,
    itemDuration: 20,
    currentAction: null,
    rollDuration: 0
};
assert.deepStrictEqual(
    HuntMonsterTurnExecutor.resolveHunterResponseIntent({
        random: () => 0,
        actionStateMachine: new HuntActionStateMachine()
    }, liveStateHunter, { type: 'charge', tags: ['charge'] }, {
        attempted: true,
        preferred: 'guard'
    }),
    { attempted: true, preferred: 'evade' },
    'impact-time state must replace a stale telegraph guard choice with the only legal visible response'
);

const protectedHunter = {
    ...hunter,
    hp: 100,
    pendingSharpnessRestore: true,
    itemDuration: 20,
    hitDuration: 0,
    counterInvulnerabilityTicks: 5
};
let counterProtectionPresentation = 0;
const protectedEngine = {
    ...engine,
    selectedWeapons: [protectedHunter],
    monsterHp: 1000,
    monsterAtb: 100,
    presentHunterImpact: HuntEngine.prototype.presentHunterImpact,
    callbacks: {
        ...engine.callbacks,
        onTriggerGuardShake: () => { counterProtectionPresentation++; }
    }
};
HuntMonsterTurnExecutor.execute(protectedEngine);
assert.strictEqual(protectedHunter.hp, protectedHunter.maxHp,
    'the authored one-second post-counter protection must still negate damage');
assert.strictEqual(counterProtectionPresentation, 1,
    'post-counter protection must never discard an impact without visible feedback');

// Test 0-damage hit interruption
const zeroDmgHunter = {
    ...hunter,
    hp: 100,
    sharpness: 10,
    pendingSharpnessRestore: true,
    itemDuration: 20,
    hitDuration: 0
};
const zeroDmgPattern = {
    id: 'test.zerodmg',
    name: '0데미지 공격',
    type: 'melee',
    damageRatio: 0,
    minTargets: 1,
    maxTargets: 1
};
const zeroDmgEngine = {
    ...engine,
    selectedWeapons: [zeroDmgHunter],
    preparedMonsterTargetIndex: 0,
    preparedMonsterPattern: zeroDmgPattern,
    MONSTER_PATTERNS: {
        test_monster: [zeroDmgPattern]
    },
    random: () => 0.99
};
HuntMonsterTurnExecutor.execute(zeroDmgEngine, zeroDmgPattern);
assert.strictEqual(zeroDmgHunter.pendingSharpnessRestore, false, '0-damage hits must also revoke pending sharpness restoration');
assert.strictEqual(zeroDmgHunter.itemDuration, 0, '0-damage hits must cancel item lock');

// Test tick completion safety check when hunter is in hitstun
const HuntBattleTickExecutor = require('../js/effects/hunt/HuntBattleTickExecutor.js');
const tickInterruptedHunter = {
    ...hunter,
    sharpness: 10,
    maxSharpness: 100,
    pendingSharpnessRestore: true,
    itemDuration: 1,
    hitDuration: 5
};
const tickEngine = {
    ...engine,
    selectedWeapons: [tickInterruptedHunter],
    colossalPhaseRuntime: null,
    updateTimerUI: noop,
    updateMonsterAtbUI: noop,
    getRemainingSeconds: () => 180,
    callbacks: {
        ...engine.callbacks,
        onTriggerStunUI: noop,
        onTriggerDeathTag: noop
    }
};
HuntBattleTickExecutor.execute(tickEngine);
assert.strictEqual(tickInterruptedHunter.pendingSharpnessRestore, false, 'tick completion must not restore sharpness if hunter is interrupted');
assert.strictEqual(tickInterruptedHunter.sharpness, 10, 'sharpness must remain unchanged when interrupted');

console.log('[test] Whetstone hit and evade interruption contracts passed.');
