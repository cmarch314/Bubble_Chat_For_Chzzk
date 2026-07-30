'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js');
const context = vm.createContext({ console, HuntMonsterActionPolicy });
vm.runInContext(`${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntMonsterTurnExecutor = HuntMonsterTurnExecutor;`, context, { filename: sourcePath });

const calls = { bubbles: [], profiles: [] };
const hunter = {
    index: 0, id: 'sword_shield', type: 'shield', name: '한손검 헌터', hunterName: '한손검 헌터', status: 'alive',
    hp: 100, maxHp: 100, sharpness: 100, snsPerfectGuardReady: true,
    currentAction: { id: 'sword_shield.perfect_guard', phase: 'active', tags: ['preparation', 'guard-point', 'perfect-guard'] }
};
const noop = () => {};
const engine = {
    selectedWeapons: [hunter], selectedMonster: { id: 'test_monster', nameKO: '훈련용 몬스터' },
    MONSTER_PATTERNS: { test_monster: [{ id: 'test.hit', name: '훈련 타격', type: 'melee', damageRatio: .3, minTargets: 1, maxTargets: 1, recoveryTicks: 7, runtimeImpactCommit: true }] },
    monsterState: 'normal', monsterHp: 1000, monsterMaxHp: 1000, monsterAtb: 100, monsterDamageMod: 1,
    monsterStunAccum: 0, monsterStunThreshold: 9999, monsterStunDuration: 0, callbacks: {}, teamTactic: 'balanced',
    random: () => 0, actionStateMachine: { cancel: (target, state) => { target.currentAction = null; target.actionState = state; }, canGuard: () => true, canEvade: () => true, canCounter: () => false },
    telemetry: null, monsterPatternSelector: null, playSFX: noop, updateMonsterHpUI: noop, checkMonsterKnockdown: noop,
    updateHpUI: noop, updateWeaponAtbUI: noop, triggerHunterCart: noop, shakeMonster: noop, triggerHitAnimation: noop,
    restoreBorder: noop, addLog: noop, showSkillBubble: (idx, text) => calls.bubbles.push(text),
    shakeWeapon: (idx, color, strong, profile) => calls.profiles.push(profile?.id || null), getMonsterAttackType: () => ({ type: 'melee', emoji: '💥' })
};

context.HuntMonsterTurnExecutor.execute(engine);
assert.strictEqual(hunter.hp, 100, 'an active Perfect Guard window must negate the hit');
assert.strictEqual(hunter.snsCounterReady, true, 'Perfect Guard must open Counter Slash');
assert.strictEqual(hunter.snsPerfectGuardReady, false, 'Perfect Guard state must be consumed');
assert.ok(calls.bubbles.includes('퍼펙트 가드!'));
assert.ok(calls.profiles.includes('sword_shield.perfect_guard'));

const guardPayloads = [];
const guardingHunter = {
    index: 0, id: 'sword_shield', type: 'shield', name: '가드 헌터', hunterName: '가드 헌터',
    status: 'alive', hp: 100, maxHp: 100, sharpness: 100
};
const guardEngine = {
    ...engine,
    selectedWeapons: [guardingHunter],
    MONSTER_PATTERNS: {
        test_monster: [{
            id: 'test.poison_hit', name: '독 공격', type: 'melee', damageRatio: .3,
            minTargets: 1, maxTargets: 1, runtimeImpactCommit: true, tags: ['poison']
        }]
    },
    random: () => 0,
    actionStateMachine: {
        cancel: (target, state) => { target.currentAction = null; target.actionState = state; },
        canGuard: () => true, canEvade: () => false, canCounter: () => false
    },
    blightRuntime: {
        onIncomingHit: (_, damage) => damage,
        fromAttack: () => 'poison',
        apply: (_, type) => guardPayloads.push(type),
        canAct: () => true,
        stunChance: () => 1,
        stunDuration: (_, ticks) => ticks
    }
};
context.HuntMonsterTurnExecutor.execute(guardEngine);
assert.ok(guardingHunter.hp < 100, 'ordinary guard may retain authored chip damage');
assert.deepStrictEqual(guardPayloads, [], 'successful guard must block poison and every other status payload');
assert.strictEqual(guardingHunter.status, 'alive', 'successful guard must bypass the stun roll');
assert.strictEqual(guardingHunter.pendingStunDuration, undefined);

console.log('[test] Sword and Shield Perfect Guard counter window passed.');
