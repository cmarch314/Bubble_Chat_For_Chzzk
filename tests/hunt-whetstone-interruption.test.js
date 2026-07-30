'use strict';

const assert = require('assert');
const HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');

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
    weaponMechanics: { onHit: noop },
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

console.log('[test] Whetstone hit interruption contract passed.');
