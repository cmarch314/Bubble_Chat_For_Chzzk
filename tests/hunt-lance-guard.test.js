'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js');
const context = vm.createContext({ console, HuntMonsterActionPolicy });
vm.runInContext(`${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntMonsterTurnExecutor = HuntMonsterTurnExecutor;`, context, { filename: sourcePath });

const noop = () => {};
const hunter = { index: 0, id: 'lance', type: 'shield', name: '랜스 헌터', status: 'alive', hp: 100, maxHp: 100, sharpness: 100, lanceCounterWaiting: true, currentAction: { id: 'lance.counter_stance', phase: 'active', tags: ['preparation', 'counter', 'guard-point', 'lance-counter'] } };
const outcomes = [];
const engine = {
    selectedWeapons: [hunter], selectedMonster: { id: 'test_monster', nameKO: '훈련 몬스터' },
    MONSTER_PATTERNS: { test_monster: [{ id: 'test.hit', name: '훈련 공격', type: 'melee', damageRatio: .4, minTargets: 1, maxTargets: 1, runtimeImpactCommit: true }] },
    monsterState: 'normal', monsterHp: 1000, monsterMaxHp: 1000, monsterAtb: 100, monsterDamageMod: 1, monsterStunAccum: 0,
    callbacks: {}, teamTactic: 'balanced', random: () => 0,
    actionStateMachine: { cancel: (target, state) => { target.currentAction = null; target.actionState = state; }, canGuard: () => true, canEvade: () => false, canCounter: () => false },
    telemetry: { recordMonsterPattern: (monster, pattern, outcome) => outcomes.push(outcome) }, monsterPatternSelector: null,
    playSFX: noop, updateMonsterHpUI: noop, checkMonsterKnockdown: noop, updateHpUI: noop, updateWeaponAtbUI: noop,
    triggerHunterCart: noop, shakeMonster: noop, triggerHitAnimation: noop, restoreBorder: noop, addLog: noop, showSkillBubble: noop,
    shakeWeapon: noop, getMonsterAttackType: () => ({ type: 'melee', emoji: '💥' })
};

context.HuntMonsterTurnExecutor.execute(engine);
assert.strictEqual(hunter.hp, 100, 'counter guard must negate the incoming hit');
assert.strictEqual(hunter.lanceCounterWaiting, false);
assert.strictEqual(hunter.lanceCounterReady, true, 'successful guard must open counter thrust');
assert.strictEqual(hunter.atb, 100, 'guarding must immediately maximize ATB for instant counter attack');
assert.ok(hunter.guardBurden > 0, 'repeated guarding must accumulate burden');
assert.ok(outcomes.includes('counter'));

assert.strictEqual(
    context.HuntMonsterTurnExecutor.isPatternGuardable({ type: 'melee' }),
    true,
    'ordinary monster attacks should be guardable by default'
);
assert.strictEqual(
    context.HuntMonsterTurnExecutor.isPatternGuardable({ type: 'melee', guardable: false }),
    false,
    'explicitly unguardable attacks must bypass lance auto-guard'
);
assert.strictEqual(
    context.HuntMonsterTurnExecutor.isPatternGuardable({ runtimeDefenseMode: 'emergency-jump' }),
    false,
    'emergency-jump-only attacks must bypass lance auto-guard'
);

const idleLance = {
    index: 0,
    id: 'lance',
    type: 'shield',
    name: 'Lance Hunter',
    status: 'alive',
    hp: 100,
    maxHp: 100,
    sharpness: 100,
    personality: 'newbie',
    currentAction: null
};
const defensiveIntent = context.HuntMonsterTurnExecutor.planHunterResponseIntent({
    random: () => 0.9999,
    actionStateMachine: {
        canGuard: () => true,
        canEvade: () => true
    }
}, idleLance, { type: 'melee' });
assert.strictEqual(defensiveIntent.attempted, true, 'an available lance guard must not fail its intent roll');
assert.strictEqual(defensiveIntent.preferred, 'guard');

const autoGuardOutcomes = [];
const autoGuardEngine = {
    ...engine,
    selectedWeapons: [idleLance],
    monsterAtb: 100,
    random: () => 0.9999,
    actionStateMachine: {
        cancel: (target, state) => { target.currentAction = null; target.actionState = state; },
        canGuard: () => true,
        canEvade: () => true,
        canCounter: () => false
    },
    telemetry: {
        recordMonsterPattern: (monster, pattern, outcome) => autoGuardOutcomes.push(outcome)
    }
};
context.HuntMonsterTurnExecutor.execute(autoGuardEngine);
assert.ok(idleLance.hp < 100 && idleLance.hp > 60,
    'idle lance must reduce a guardable hit even when every probability roll fails');
assert.strictEqual(idleLance.lanceCounterReady, true,
    'a deterministic lance guard should retain the existing counter-thrust follow-up');
assert.ok(autoGuardOutcomes.includes('guard'));

console.log('[test] Lance deterministic guard, counter, and unguardable exceptions passed.');
