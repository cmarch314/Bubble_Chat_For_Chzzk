'use strict';

const assert = require('assert');
const graphs = require('../js/effects/hunt/data/NativeMonsterBeatGraphs.generated.js');
const { HuntBeatV2Contract } = require('../js/effects/hunt/HuntBeatV2Contract.js');
const NativeCatalog = require('../js/effects/hunt/HuntMonsterNativeBeatCatalog.js');
const ProjectileTiming = require('../js/effects/hunt/HuntProjectileTimingResolver.js');

global.HUNT_NATIVE_BEAT_GRAPHS = graphs;
global.HuntBeatV2Contract = HuntBeatV2Contract;

const [pattern] = NativeCatalog.apply([{ id: 'rathian.fireball', type: 'projectile', damageRatio: .34 }], global);
assert.strictEqual(pattern.beatV2Enabled, true);
assert.strictEqual(pattern.beatV2Approved, true);
assert.strictEqual(pattern.runtimeMotionBackend, 'beat-v2');
assert.deepStrictEqual(pattern.motion, []);
assert.deepStrictEqual(pattern.beatV2.beats.map(beat => [beat.id, beat.ticks]), [
    ['look', 3], ['inhale', 16], ['spit', 7], ['recover', 15]
]);
const launch = pattern.beatV2.events.find(event => event.kind === 'projectile-launch');
const contact = pattern.beatV2.events.find(event => event.kind === 'damage');
assert.strictEqual(launch.atTicks, 19, 'fireball must launch on the first spit tick');
assert.strictEqual(contact.atTicks, 26, 'the authored contact starts at the recover boundary');
const resolved = ProjectileTiming.resolveSession(pattern.beatV2, {
    targetIndex: 1,
    projectileStage: { width: 1920, height: 900 }
});
const resolvedContact = resolved.action.events.find(event => event.id === contact.id);
assert.ok(resolvedContact.atTicks > launch.atTicks, 'distance resolver must delay contact until projectile arrival');
assert.strictEqual(resolved.context.judgmentEvents, undefined);

console.log('[test] native monster BEAT promotion and projectile timing passed');
