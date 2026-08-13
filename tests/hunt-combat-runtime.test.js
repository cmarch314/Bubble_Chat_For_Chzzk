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
