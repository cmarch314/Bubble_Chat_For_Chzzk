'use strict';

const assert = require('assert');
const HuntCombatClock = require('../js/effects/hunt/HuntCombatClock.js');
const HuntCombatRuntime = require('../js/effects/hunt/HuntCombatRuntime.js');

{
    const ticks = [];
    const clock = new HuntCombatClock({
        mode: 'manual',
        onTick: tick => ticks.push(tick)
    });
    clock.start();
    clock.step(3);
    clock.pause();
    assert.deepStrictEqual(ticks, [1, 2, 3]);
    assert.strictEqual(clock.elapsedTicks, 3);
    clock.reset(8);
    clock.step();
    assert.deepStrictEqual(ticks, [1, 2, 3, 9]);
}

{
    const scheduled = [];
    const cleared = [];
    const clock = new HuntCombatClock({
        mode: 'auto',
        tickMs: 100,
        timers: {
            interval(callback, milliseconds) {
                const token = { callback, milliseconds };
                scheduled.push(token);
                return token;
            },
            clear(token) { cleared.push(token); }
        }
    });
    clock.start();
    assert.strictEqual(scheduled[0].milliseconds, 100);
    assert.strictEqual(clock.setRate(2), 2);
    assert.strictEqual(scheduled[1].milliseconds, 50);
    assert.strictEqual(cleared[0], scheduled[0]);
    assert.strictEqual(clock.setRate(4), 4);
    assert.strictEqual(scheduled[2].milliseconds, 25);
    assert.strictEqual(clock.setRate(3), 1, 'unsupported preview rates normalize to real time');
    assert.strictEqual(scheduled[3].milliseconds, 100);
    clock.stop();
}

{
    class FakeEngine {
        constructor(config) {
            this.config = config;
            this.battleTime = 0;
            this.monsterHp = 500;
            this.requests = [];
        }

        processTick() { this.battleTime += 1; }

        executeMonsterTurn(pattern, _attack, primaryTargetIndex) {
            this.requests.push({ pattern, primaryTargetIndex });
            return true;
        }

        interruptMonsterMovement(reason) {
            this.cancelReason = reason;
            return true;
        }
    }

    const runtime = new HuntCombatRuntime({
        Engine: FakeEngine,
        Clock: HuntCombatClock,
        mode: 'preview',
        engineConfig: { marker: 'shared' }
    });
    runtime.start();
    runtime.step(2);
    assert.strictEqual(runtime.engine.battleTime, 2);
    assert.strictEqual(runtime.recentTrace().filter(entry => entry.type === 'tick').length, 2);

    runtime.executeMonsterPattern({ id: 'diablos.horn_charge' }, {
        primaryTargetIndex: 2,
        targetIndices: [1, 2]
    });
    assert.strictEqual(runtime.engine.requests[0].primaryTargetIndex, 2);
    assert.deepStrictEqual(runtime.engine.requests[0].pattern.runtimeImpactTargetIndices, [1, 2]);
    assert.strictEqual(runtime.cancelMonsterAction('editor-stop'), true);
    assert.strictEqual(runtime.engine.cancelReason, 'editor-stop');
}

console.log('hunt-combat-runtime tests passed');
