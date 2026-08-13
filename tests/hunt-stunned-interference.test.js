'use strict';

const assert = require('assert');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

for (const [kind, size, expectedAtb] of [
    ['roar', 'large', 0],
    ['tremor', 'large', 0],
    ['wind', 'small', 35]
]) {
    const calls = { cancelled: 0, reset: 0, visuals: [] };
    const hunter = {
        index: 1,
        id: 'lance',
        type: 'shield',
        name: 'Stunned Hunter',
        status: 'stunned',
        stunDuration: 20,
        hitDuration: 15,
        counterInvulnerabilityTicks: 10,
        atb: 85,
        personality: 'defensive'
    };
    const engine = {
        applyHunterInterference: HuntEngine.prototype.applyHunterInterference,
        random: () => 0,
        perkRuntime: {
            ignoresPattern: () => null,
            roarDuration: () => 1
        },
        actionStateMachine: {
            canGuard: () => { throw new Error('stun must bypass guard decisions'); },
            cancel: () => { calls.cancelled++; }
        },
        weaponMechanics: { onHit: () => { calls.reset++; } },
        callbacks: {
            onInterruptWeaponVisual() {},
            onTriggerHunterInterference: (...args) => calls.visuals.push(args)
        },
        interruptHunterItemAction: () => false,
        cancelHunterBeatAction: () => false,
        updateWeaponAtbUI() {}
    };

    assert.strictEqual(engine.applyHunterInterference(hunter, kind, size), true,
        `a stunned hunter must remain vulnerable to ${kind}`);
    assert.strictEqual(hunter.status, 'stunned',
        `${kind} must not replace the existing stun owner`);
    assert.strictEqual(hunter.stunDuration, 20);
    assert.deepStrictEqual(hunter.interference, { kind, size });
    assert.strictEqual(hunter.atb, expectedAtb);
    assert.strictEqual(calls.cancelled, 1);
    assert.strictEqual(calls.reset, 1);
    assert.deepStrictEqual(calls.visuals, [[hunter.index, kind, size, true]]);
}

console.log('[test] Stunned hunters remain vulnerable to roar, tremor, and wind.');
