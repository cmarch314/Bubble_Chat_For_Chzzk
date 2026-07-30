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
assert.ok(hunter.guardBurden > 0, 'repeated guarding must accumulate burden');
assert.ok(outcomes.includes('counter'));
console.log('[test] Lance counter guard, burden, and retaliation gate passed.');
