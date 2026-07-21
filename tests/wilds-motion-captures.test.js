'use strict';

const assert = require('assert');
const { compileCaptures } = require('../scripts/import-wilds-motion-captures.js');

const timings = { weapons: { hammer: { motions: [
    { motionId: 42, internalName: 'wp04_00_042', frames: 72, fps: 60, seconds: 1.2, timingEvidence: 'installed-game-motlist-header' },
    { motionId: 43, internalName: 'wp04_00_043', frames: 90, fps: 60, seconds: 1.5, timingEvidence: 'installed-game-motlist-header' }
] } } };
const combos = { weapons: { hammer: { actions: [{ className: 'cCharge2Swing' }] } } };
const runtimeMap = { actions: { hammer: { 'hammer.release_2': 'cCharge2Swing' } } };

const compiled = compileCaptures([
    { weaponId: 'hammer', actionClass: 'cCharge2Swing', motionId: 42 },
    { weaponId: 'hammer', actionClass: 'cCharge2Swing', motionId: 42 }
], timings, combos, runtimeMap);
assert.deepStrictEqual(compiled.unresolved, []);
assert.strictEqual(compiled.actions['hammer.release_2'].seconds, 1.2);
assert.strictEqual(compiled.actions['hammer.release_2'].observationCount, 2);
assert.strictEqual(compiled.actions['hammer.release_2'].semanticEvidence, 'reframework-action-class+live-motion-observation');

const conflict = compileCaptures([
    { weaponId: 'hammer', actionClass: 'cCharge2Swing', motionId: 42 },
    { weaponId: 'hammer', actionClass: 'cCharge2Swing', motionId: 43 }
], timings, combos, runtimeMap);
assert.strictEqual(Object.keys(conflict.actions).length, 0);
assert.strictEqual(conflict.unresolved[0].reason, 'conflicting-motion-ids');

assert.throws(() => compileCaptures(
    [{ weaponId: 'hammer', actionClass: 'cCharge2Swing', motionId: 999 }], timings, combos, runtimeMap
), /absent from the installed motlist/);
assert.throws(() => compileCaptures(
    [{ weaponId: 'hammer', actionClass: 'cInvented', motionId: 42 }], timings, combos, runtimeMap
), /unknown installed-game action class/);

console.log('wilds motion capture linkage tests passed');
