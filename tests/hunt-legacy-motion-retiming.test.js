'use strict';

const assert = require('assert');
const HuntMonsterAttackAnimator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');

const frames = HuntMonsterAttackAnimator.remapKeyframeBeats([
    { offset: 0, transform: 'a' },
    { offset: 15 / 24, transform: 'impact' },
    { offset: 1, transform: 'end' }
], [
    { beat: 'telegraph', ticks: 5 },
    { beat: 'action-1', ticks: 10 },
    { beat: 'impact-1', ticks: 1 },
    { beat: 'action-2', ticks: 8 }
], [
    { beat: 'telegraph', ticks: 5 },
    { beat: 'action-1', ticks: 5 },
    { beat: 'impact-1', ticks: 3 },
    { beat: 'action-2', ticks: 12 }
]);

assert.strictEqual(frames[0].offset, 0);
assert(Math.abs(frames[1].offset - 10 / 25) < 1e-9,
    'the legacy impact pose must move to the edited BEAT boundary');
assert.strictEqual(frames[2].offset, 1);
assert.deepStrictEqual(HuntMonsterAttackAnimator.remapKeyframeBeats(frames,
    [{ ticks: 1 }], [{ ticks: 1 }, { ticks: 1 }]), frames,
'an invalid migration must preserve the original keyframes');

let cancelled = false;
let authoredFrames = null;
const cssAnimation = {
    animationName: 'legacy-test',
    effect: { getKeyframes: () => [{ offset: 0 }, { offset: .5 }, { offset: 1 }] },
    cancel() { cancelled = true; }
};
const element = {
    style: { setProperty() {} },
    getAnimations: () => [cssAnimation],
    removeEventListener() {},
    animate(keyframes) {
        authoredFrames = keyframes;
        return { cancel() {}, pause() {}, currentTime: 0 };
    }
};
const edited = HuntMonsterAttackAnimator.applyProfileAdapterEdits([
    { offset: 0, transform: 'translateX(10px)', opacity: 1 },
    { offset: .5, transform: 'translateX(20px)', opacity: 1 },
    { offset: 1, transform: 'translateX(0px)', opacity: 1 }
], [
    { beat: 'approach', ticks: 5, offsetX: 12, rotation: 15 },
    { beat: 'impact', ticks: 5, scaleX: 1.2, opacity: .6 }
]);
assert.match(edited[0].transform, /translate\(12px, 0px\).*rotate\(15deg\)/,
    'profile-backed patterns must apply editor movement and rotation on their original keyframes');
assert.match(edited[1].transform, /scaleX\(1\.2\)/);
assert.strictEqual(edited[1].opacity, .6);

console.log('[test] keyframe BEAT timing follows edited boundaries');
