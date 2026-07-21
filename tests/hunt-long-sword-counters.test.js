'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js');
const context = vm.createContext({ console });
vm.runInContext(
    `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntMonsterTurnExecutor = HuntMonsterTurnExecutor;`,
    context,
    { filename: sourcePath }
);

function createScenario(randomValue, action) {
    const calls = { bubbles: [], animations: [], logs: [] };
    const hunter = {
        index: 0,
        id: 'long_sword',
        name: '태도 헌터',
        hunterName: '태도 헌터',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        sharpness: 100,
        spiritGauge: 70,
        spiritLevel: 2,
        specialSheatheReady: true,
        currentAction: action
    };
    const noop = () => {};
    const engine = {
        selectedWeapons: [hunter],
        selectedMonster: { id: 'test_monster', nameKO: '훈련용 몬스터' },
        MONSTER_PATTERNS: {
            test_monster: [{ id: 'test.hit', name: '훈련 타격', type: 'melee', damageRatio: 0.2, minTargets: 1, maxTargets: 1, recoveryTicks: 7 }]
        },
        monsterPatternSelector: null,
        random: () => randomValue,
        monsterState: 'normal',
        monsterHp: 1000,
        monsterMaxHp: 1000,
        monsterAtb: 100,
        monsterDamageMod: 1,
        monsterStunAccum: 0,
        monsterStunThreshold: 9999,
        monsterStunDuration: 0,
        callbacks: {},
        teamTactic: 'balanced',
        actionStateMachine: new HuntActionStateMachine(),
        weaponMechanics: new HuntWeaponMechanics(() => randomValue),
        telemetry: null,
        addLog: text => calls.logs.push(text),
        showSkillBubble: (target, text) => calls.bubbles.push(text),
        shakeWeapon: (target, color, strong, profile) => calls.animations.push(profile?.id || null),
        playSFX: noop,
        updateMonsterHpUI: noop,
        checkMonsterKnockdown: noop,
        updateHpUI: noop,
        updateWeaponAtbUI: noop,
        triggerHunterCart: noop,
        shakeMonster: noop,
        triggerHitAnimation: noop,
        restoreBorder: noop,
        getMonsterAttackType: () => ({ type: 'melee', emoji: '💥' })
    };
    return { engine, hunter, calls };
}

const iaiAction = {
    id: 'long_sword.special_sheathe',
    phase: 'active',
    tags: ['preparation', 'counter', 'iai']
};

{
    const { engine, hunter, calls } = createScenario(0, { ...iaiAction });
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 100, 'a successful Iai counter must negate the incoming hit');
    assert.strictEqual(hunter.spiritLevel, 2, 'World-style Iai success must maintain, not raise, spirit level');
    assert.strictEqual(engine.monsterHp, 592, 'Iai success must deal a large level-scaled counter hit');
    assert.strictEqual(hunter.specialSheatheReady, false);
    assert.ok(calls.bubbles.includes('거합베기 · 성공!'));
    assert.ok(calls.animations.includes('long_sword.iai_counter_success'));
    assert.strictEqual(hunter.iaiHelmBreakerReady, true, 'successful Iai must open the Wilds Helm Breaker follow-up');
}

{
    const { engine, hunter, calls } = createScenario(0.99, { ...iaiAction });
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 80, 'a failed Iai counter must take the monster hit');
    assert.strictEqual(hunter.spiritLevel, 1, 'a failed Iai counter must consume exactly one spirit level');
    assert.strictEqual(engine.monsterHp, 1000);
    assert.ok(calls.bubbles.includes('거합베기 · 실패!'));
}

{
    const foresightAction = { id: 'long_sword.foresight_slash', phase: 'active', tags: ['counter', 'foresight'] };
    const { engine, hunter } = createScenario(0, foresightAction);
    hunter.specialSheatheReady = false;
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 100);
    assert.strictEqual(hunter.spiritLevel, 3, 'a successful foresight slash must immediately raise one spirit level');
    assert.strictEqual(hunter.spiritGauge, 100);
    assert.strictEqual(hunter.spiritRoundslashReady, false, 'the immediate level reward must not also open a duplicate roundslash level-up');
}

{
    const { engine, hunter, calls } = createScenario(0, null);
    hunter.spiritLevel = 0;
    hunter.specialSheatheReady = false;
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 100, 'an idle Long Sword hunter must be able to react with Foresight Slash');
    assert.strictEqual(hunter.spiritLevel, 1, 'reactive Foresight Slash must build the first spirit level');
    assert.ok(calls.animations.includes('long_sword.foresight'), 'reactive Foresight Slash must use its counter animation');
}

{
    const lockedAction = {
        id: 'long_sword.overhead_slash', phase: 'active', elapsed: 2,
        tags: ['sever'], evadeCancelFrom: null
    };
    const { engine, hunter, calls } = createScenario(0, lockedAction);
    hunter.specialSheatheReady = false;
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.spiritLevel, 2, 'Foresight Slash must not bypass an attack action lock');
    assert.ok(!calls.animations.includes('long_sword.foresight'));
}

{
    const mechanics = new HuntWeaponMechanics(() => 0);
    const hunter = { id: 'long_sword', status: 'alive', spiritGauge: 100, spiritLevel: 0, _mechanicMonsterPressure: true };
    mechanics.initialize(hunter);
    const actions = HuntWeaponMechanics.actionsFor('long_sword');
    const selected = actions[mechanics.selectAction(hunter, actions, { monsterAtb: 100 })];
    assert.notStrictEqual(selected?.id, 'long_sword.foresight', 'Foresight Slash must never be selected as a normal ATB attack');
}

console.log('[test] Long Sword World-style counter outcomes passed.');
