'use strict';

const assert = require('assert');
const HuntMonsterAttackAnimator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');

const calls = [];
const animation = {
    pause() { calls.push('pause'); },
    set currentTime(value) { calls.push(value); }
};
const animator = Object.create(HuntMonsterAttackAnimator.prototype);
animator.activeBeatMotionPreview = { animations: [animation], durationMs: 2400 };

assert.strictEqual(animator.seekBeatMotion(.625), true);
assert.deepStrictEqual(calls, ['pause', 1500]);
assert.strictEqual(animator.seekBeatMotion(2), true);
assert.deepStrictEqual(calls.slice(-2), ['pause', 2400], 'scrub progress must clamp to the motion end');
animator.activeBeatMotionPreview = null;
assert.strictEqual(animator.seekBeatMotion(.5), false);

console.log('[test] Compiled monster motion supports safe paused timeline scrubbing.');
