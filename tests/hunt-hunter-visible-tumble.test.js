'use strict';

const assert = require('assert');
const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');

const frames = HuntCombatAnimator.strongHitKeyframes({
    x: 240,
    y: 170,
    direction: -1
});

const tumbleEndOffset = .44 / 1.3;
assert.deepStrictEqual(frames.map(frame => frame.offset), [
    0, tumbleEndOffset * .25, tumbleEndOffset * .5, tumbleEndOffset * .75,
    tumbleEndOffset, .88, .90, .93, .96, .98, 1
], 'strong hit must tumble 30% faster, remain prone, and preserve the stepped return');
assert.ok(Math.abs(frames[4].offset * 5000 - (2200 / 1.3)) < .001,
    'the 2.2-second tumble must be shortened by exactly a 1.3x speed multiplier');
assert.deepStrictEqual(
    frames.slice(1, 5).map(frame => Number(frame.transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/)?.[1])),
    [-135, -270, -405, -540],
    'explicit rotation waypoints must prevent the tumble from collapsing into parallel translation'
);
assert.match(frames[4].transform, /translate\(240px, 170px\) rotate\(-540deg\) skewX\(-12deg\)/,
    'the tumble must finish one and a half turns away in a visibly prone pose');
assert.strictEqual(frames[5].transform, frames[4].transform,
    'the hunter must remain at the fallen pose without reverse rotation');
assert.match(frames[10].transform, /translate\(0, 0\) rotate\(-720deg\)/,
    'recovery must return naturally without rewinding the tumble');
assert.notStrictEqual(frames[7].transform, frames[8].transform,
    'return frames must alternate planted steps instead of parallel-sliding home');

const fs = require('fs');
const path = require('path');
const animatorSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'),
    'utf8'
);
assert.match(animatorSource,
    /easing:\s*kind === 'weak' \? 'ease-in-out' : 'linear'/,
    'strong-hit offsets must stay on a linear real-time clock so the final 0.5s remains 0.5s');
assert.doesNotMatch(animatorSource,
    /easing:\s*kind === 'weak' \? 'ease-in-out' : 'cubic-bezier/,
    'an effect-wide easing curve must not stretch the authored walk-home segment');

console.log('[test] Hunter visible tumble keyframes passed.');
