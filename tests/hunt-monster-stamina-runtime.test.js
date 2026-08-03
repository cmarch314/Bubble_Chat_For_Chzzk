'use strict';

const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntMonsterStaminaRuntime = require('../js/effects/hunt/HuntMonsterStaminaRuntime.js');

function createEngine(overrides = {}) {
    const engine = {
        battleTime: 0,
        monsterTier: 'large',
        monsterHp: 1000,
        monsterState: 'normal',
        monsterAtb: 25,
        monsterSpeed: 1,
        monsterActionLockTicks: 0,
        selectedMonster: { id: 'test_monster', nameKO: '시험 몬스터' },
        monsterBehavior: {},
        getMonsterSpeedForState: state => state === 'exhausted' ? 0.5 : 1,
        updateMonsterAtbUI() {},
        updateMonsterStateUI() {},
        addLog() {},
        interruptMonsterMovement() {},
        ...overrides
    };
    const runtime = new HuntMonsterStaminaRuntime();
    engine.monsterStaminaRuntime = runtime;
    runtime.initialize(engine, overrides.profile || {});
    return { engine, runtime };
}

{
    const { engine, runtime } = createEngine({ profile: { naturalDrainPerAtb: 0.02 } });
    const result = runtime.consumeMonsterAction(engine, 100);
    assert.strictEqual(result.drained, 2,
        'one full ATB action cost must drain the configured stamina proportion once');
    assert.strictEqual(engine.monsterStamina, 98);
}

{
    const { engine, runtime } = createEngine({
        profile: { teamWindowTicks: 100, teamWindowCapRate: 0.06, hunterDrainMultiplier: 1 }
    });
    const drains = [1.7, 1.7, 1.7, 1.7].map(amount =>
        runtime.consumeHunterExhaust(engine, amount).drained
    );
    assert.strictEqual(drains.reduce((sum, value) => sum + value, 0), 6,
        'four horns in one window must saturate at six percent team drain');
    assert.strictEqual(engine.monsterStamina, 94);
}

{
    const { engine, runtime } = createEngine({
        monsterStamina: 1,
        profile: {
            exhaustDurationTicks: 3,
            pantTicks: 2,
            postProtectionTicks: 2,
            teamWindowCapRate: 1
        }
    });
    const result = runtime.consumeHunterExhaust(engine, 2);
    assert.strictEqual(result.exhausted, true);
    assert.strictEqual(engine.monsterState, 'exhausted');
    assert.strictEqual(engine.monsterAtb, HuntAtbConfig.GAUGE_MAX);
    assert.strictEqual(engine.monsterActionLockTicks, 2);
    assert.strictEqual(runtime.consumeHunterExhaust(engine, 100).drained, 0,
        'exhaust attacks must not extend an active exhaustion');
    runtime.tick(engine);
    runtime.tick(engine);
    runtime.tick(engine);
    assert.strictEqual(engine.monsterState, 'normal');
    assert.strictEqual(engine.monsterStamina, 100,
        'exhaustion exit must restore the full stamina pool');
    assert.strictEqual(engine.monsterExhaustProtectionTicks, 2);
    assert.strictEqual(runtime.consumeHunterExhaust(engine, 100).drained, 0,
        'post-exhaust protection must prevent immediate horn relock');
}

{
    const { engine, runtime } = createEngine({
        profile: { teamWindowCapRate: 1, hunterDrainMultiplier: 1, resistanceMultipliers: [1, 0.7, 0.5, 0.35] }
    });
    engine.monsterExhaustionCount = 3;
    assert.strictEqual(runtime.consumeHunterExhaust(engine, 10).drained, 3.5,
        'repeat resistance must affect hunter exhaust only');
    assert.strictEqual(runtime.consumeMonsterAction(engine, 100).drained, 2,
        'repeat resistance must never weaken natural action stamina use');
}

console.log('[test] Monster stamina exhaustion runtime contract passed.');
