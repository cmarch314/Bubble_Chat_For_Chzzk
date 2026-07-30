'use strict';

const assert = require('assert');
const Runtime = require('../js/effects/hunt/HuntColossalPhaseRuntime');
const phases = [];
const engine = {
    monsterTier: 'colossal', monsterHp: 650, monsterMaxHp: 1000, monsterAtb: 90,
    pendingMonsterAction: { id: 'slam' }, monsterKnockdownDuration: 0, monsterState: 'normal',
    monsterUltimateUsedInRage: true, monsterDamageMod: 1, monsterAtbSpeedMod: 1,
    callbacks: { onColossalPhase: phase => phases.push(phase) }, addLog() {}
};
const runtime = new Runtime();
assert.strictEqual(runtime.update(engine), true);
assert.strictEqual(runtime.phase, 2);
assert.strictEqual(engine.pendingMonsterAction, null);
assert.strictEqual(engine.monsterUltimateUsedInRage, false);
engine.monsterHp = 320;
assert.strictEqual(runtime.update(engine), true);
assert.deepStrictEqual(phases, [2, 3]);
assert.strictEqual(runtime.update(engine), false);
console.log('[test] Colossal 66%/33% phase transitions and action reset passed.');
