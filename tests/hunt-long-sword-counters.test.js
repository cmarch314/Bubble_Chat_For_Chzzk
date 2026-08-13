'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const HuntPersonalityProfiles = require('../js/effects/hunt/HuntPersonalityProfiles.js');
const HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js');
const context = vm.createContext({
    console, HuntAtbConfig, HuntMonsterActionPolicy,
    HuntPersonalityProfiles, HuntHunterTurnExecutor
});
vm.runInContext(
    `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntMonsterTurnExecutor = HuntMonsterTurnExecutor;`,
    context,
    { filename: sourcePath }
);

function createScenario(randomValue, action) {
    const calls = { bubbles: [], animations: [], logs: [], cancels: [] };
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
        atb: 100,
        longSwordForesightEligible: true,
        specialSheatheReady: true,
        currentAction: action
    };
    const noop = () => {};
    const engine = {
        selectedWeapons: [hunter],
        selectedMonster: { id: 'test_monster', nameKO: '훈련용 몬스터' },
        MONSTER_PATTERNS: {
            test_monster: [{ id: 'test.hit', name: '훈련 타격', type: 'melee', damageRatio: 0.2, minTargets: 1, maxTargets: 1, recoveryTicks: 7, runtimeImpactCommit: true }]
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
        callbacks: { onInterruptWeaponVisual: index => calls.cancels.push(['visual', index]) },
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
        cancelHunterBeatAction: (target, reason) => calls.cancels.push([reason, target.index]),
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
    hunter.counterInvulnerabilityTicks = 10;
    hunter.counterInvulnerabilityStartedThisTick = true;
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 80, 'a failed Iai counter must take the monster hit');
    assert.strictEqual(hunter.counterInvulnerabilityTicks, 0,
        'a fresh failed Iai counter must clear protection left by an earlier success');
    assert.deepStrictEqual(calls.cancels, [['hit', 0], ['visual', 0]],
        'a failed Iai counter must cancel its weapon BEAT before hit-stun presentation');
    assert.strictEqual(hunter.spiritLevel, 1, 'a failed Iai counter must consume exactly one spirit level');
    assert.strictEqual(engine.monsterHp, 1000);
    assert.ok(calls.bubbles.includes('거합베기 · 실패!'));
}

{
    const foresightAction = { id: 'long_sword.overhead_slash', phase: 'recovery', tags: ['sever'] };
    const { engine, hunter } = createScenario(0, foresightAction);
    hunter.specialSheatheReady = false;
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 100);
    assert.strictEqual(hunter.spiritLevel, 2, 'Foresight itself must not raise spirit level');
    assert.strictEqual(hunter.spiritGauge, 100);
    assert.strictEqual(hunter.spiritRoundslashReady, true, 'success must open the Roundslash level-up follow-up');
    assert.strictEqual(hunter.longSwordReactiveFollowup, true, 'Roundslash must be allowed to start even with empty ATB');
    assert.ok(engine.monsterHp < 1000, 'Foresight must retain its low counter damage');
}

{
    const { engine, hunter, calls } = createScenario(0, null);
    hunter.spiritLevel = 0;
    hunter.specialSheatheReady = false;
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 100, 'post-attack recovery may react even after the action object has cleared');
    assert.strictEqual(hunter.spiritLevel, 0, 'reactive Foresight must wait for Roundslash to build the first level');
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
    const { engine, hunter } = createScenario(0.80, null);
    hunter.personality = 'normal';
    hunter.specialSheatheReady = false;
    context.HuntMonsterTurnExecutor.execute(engine);
    assert.strictEqual(hunter.hp, 80, 'a failed 75% balanced Foresight decision must not fall back to a generic dodge');
    assert.strictEqual(hunter.spiritGauge, 0);
    assert.strictEqual(hunter.lastActionId, null, 'being hit after a failed Foresight must reset the combo');
}

{
    const rolls = [0.1, 0.2, 0.3];
    const { engine, hunter } = createScenario(0, null);
    engine.random = () => rolls.shift() ?? 0;
    hunter.specialSheatheReady = false;
    const result = context.HuntMonsterTurnExecutor.resolveLongSwordForesight(engine, hunter, 40, {
        defendRoll: 0.1,
        foresightProb: 0.75,
        pattern: { hits: [1, 1, 1], tags: ['multi-hit'] }
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.hitCount, 3, 'multi-hit attacks must be recognized per hit');
    assert.strictEqual(hunter.longSwordForesightChain, 3, 'the internal response must model Foresight → thrust → Foresight');
}

for (const [personality, expected] of Object.entries({
    normal: 0.75, support: 0.75, offensive: 0.80, veteran: 0.80, defensive: 0.85, newbie: 0.50
})) {
    assert.strictEqual(
        context.HuntMonsterTurnExecutor.longSwordForesightChance({ personality }),
        expected,
        `${personality} Foresight decision rate`
    );
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
