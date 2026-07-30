'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js');
const context = vm.createContext({ console, HuntMonsterActionPolicy });
vm.runInContext(`${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntMonsterTurnExecutor = HuntMonsterTurnExecutor;`, context, { filename: sourcePath });

const calls = { bubbles: [], profiles: [], outcomes: [] };
const hunter = {
    index: 0, id: 'hammer', type: 'melee', name: '해머 헌터', hunterName: '해머 헌터', status: 'alive',
    hp: 100, maxHp: 100, sharpness: 100, hammerOffsetWaiting: true,
    currentAction: { id: 'hammer.offset_stance', phase: 'active', tags: ['preparation', 'counter', 'hammer-offset'] }
};
const noop = () => {};
const engine = {
    selectedWeapons: [hunter], selectedMonster: { id: 'test_monster', nameKO: '훈련 몬스터' },
    MONSTER_PATTERNS: { test_monster: [{ id: 'test.hit', name: '훈련 공격', type: 'melee', damageRatio: .3, minTargets: 1, maxTargets: 1, recoveryTicks: 7, runtimeImpactCommit: true }] },
    monsterState: 'normal', monsterHp: 1000, monsterMaxHp: 1000, monsterAtb: 100, monsterDamageMod: 1,
    monsterStunAccum: 0, monsterStunThreshold: 9999, monsterStunDuration: 0, callbacks: {}, teamTactic: 'balanced',
    random: () => 0, actionStateMachine: { cancel: (target, state) => { target.currentAction = null; target.actionState = state; }, canGuard: () => false, canEvade: () => false, canCounter: () => false },
    telemetry: { recordMonsterPattern: (monster, pattern, outcome) => calls.outcomes.push(outcome) }, monsterPatternSelector: null,
    playSFX: noop, updateMonsterHpUI: noop, checkMonsterKnockdown: noop, updateHpUI: noop, updateWeaponAtbUI: noop,
    triggerHunterCart: noop, shakeMonster: noop, triggerHitAnimation: noop, restoreBorder: noop, addLog: noop,
    showSkillBubble: (idx, text) => calls.bubbles.push(text),
    shakeWeapon: (idx, color, strong, profile) => calls.profiles.push(profile?.id || null),
    getMonsterAttackType: () => ({ type: 'melee', emoji: '💥' })
};

context.HuntMonsterTurnExecutor.execute(engine);
assert.strictEqual(hunter.hp, 100, 'an active Hammer offset window must negate the incoming hit');
assert.strictEqual(engine.monsterHp, 620, 'offset upswing must deal its counter motion-value payoff');
assert.strictEqual(hunter.hammerOffsetWaiting, false, 'the stance must be consumed');
assert.strictEqual(hunter.hammerOffsetFollowupReady, true, 'a successful offset must open the spinning slam follow-up');
assert.ok(calls.bubbles.includes('상쇄 어퍼!'));
assert.ok(calls.profiles.includes('hammer.offset_upswing'));
assert.ok(calls.outcomes.includes('counter'));

console.log('[test] Hammer offset counter and follow-up gate passed.');
