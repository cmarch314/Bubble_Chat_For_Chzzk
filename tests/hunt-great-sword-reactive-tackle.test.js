'use strict';

const assert = require('assert');
const HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
global.HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');

const noop = () => {};
const pattern = {
    id: 'test.charge',
    name: '훈련 돌진',
    type: 'charge',
    tags: ['charge'],
    damageRatio: .4,
    minTargets: 1,
    maxTargets: 1,
    runtimeImpactCommit: true
};

function createHunter() {
    return {
        index: 0,
        id: 'great_sword',
        type: 'melee',
        name: '대검 헌터',
        hunterName: '대검 헌터',
        personality: 'normal',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        atb: 80,
        sharpness: 100,
        greatSwordCharge: 2,
        greatSwordChain: 0,
        greatSwordChargeLocked: true,
        currentAction: {
            id: 'great_sword.charge_2',
            phase: 'active',
            elapsed: 3,
            tags: ['preparation', 'charge']
        }
    };
}

function createEngine(hunter, random) {
    const beats = [];
    const impacts = [];
    const bubbles = [];
    const engine = {
        selectedWeapons: [hunter],
        selectedMonster: { id: 'test_monster', nameKO: '훈련 몬스터' },
        MONSTER_PATTERNS: { test_monster: [pattern] },
        monsterState: 'normal',
        monsterHp: 1000,
        monsterMaxHp: 1000,
        monsterAtb: 100,
        monsterDamageMod: 1,
        monsterStunAccum: 0,
        monsterStunThreshold: 9999,
        teamTactic: 'balanced',
        random,
        actionStateMachine: new HuntActionStateMachine(),
        weaponMechanics: new HuntWeaponMechanics(random),
        callbacks: { onInterruptWeaponVisual: noop },
        telemetry: { recordMonsterPattern: noop },
        monsterPatternSelector: null,
        beginHunterBeatAction: (_target, action) => beats.push(action.id),
        cancelHunterBeatAction: noop,
        presentHunterImpact: (_index, outcome) => { impacts.push(outcome); return true; },
        showSkillBubble: (_index, text) => bubbles.push(text),
        playSFX: noop,
        addLog: noop,
        updateMonsterHpUI: noop,
        checkMonsterKnockdown: noop,
        updateHpUI: noop,
        updateWeaponAtbUI: noop,
        triggerHunterCart: noop,
        shakeMonster: noop,
        shakeWeapon: noop,
        restoreBorder: noop,
        getMonsterAttackType: () => ({ type: 'melee', emoji: '💥' })
    };
    return { engine, beats, impacts, bubbles };
}

const reactiveHunter = createHunter();
const reactive = createEngine(reactiveHunter, () => 0);
HuntMonsterTurnExecutor.execute(reactive.engine, pattern);
assert.strictEqual(reactiveHunter.currentAction?.id, 'great_sword.tackle',
    'a successful impact-time response must replace the active charge with the tackle action');
assert.strictEqual(reactiveHunter.greatSwordChain, 1,
    'reactive tackle must advance the Great Sword charge chain');
assert.ok(reactiveHunter.hp < reactiveHunter.maxHp,
    'tackle is super armor with reduced damage, not unexplained immunity');
assert.ok(reactive.engine.monsterHp < 1000, 'reactive tackle must deal its counter damage');
assert.ok(reactive.beats.includes('great_sword.tackle'),
    'reactive tackle must mount the authored hunter BEAT animation');
assert.ok(reactive.impacts.includes('tackle'),
    'reactive tackle must present a visible contact reaction');
assert.ok(reactive.bubbles.includes('차지 태클!'));

const failedHunter = createHunter();
failedHunter.personality = 'newbie';
const failed = createEngine(failedHunter, () => .9999);
HuntMonsterTurnExecutor.execute(failed.engine, pattern);
assert.ok(failedHunter.hp < failedHunter.maxHp,
    'a charge that does not choose tackle must take the incoming hit');
assert.strictEqual(failedHunter.currentAction, null,
    'a failed charge response must be interrupted by hitstun');
assert.ok(failed.impacts.includes('hit'),
    'failed tackle selection must produce the ordinary visible hit reaction');

console.log('[test] Great Sword impact-time reactive tackle contract passed.');
