'use strict';

const assert = require('assert');
const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');

const frames = HuntCombatAnimator.strongHitKeyframes({
    x: 240,
    y: 170,
    direction: -1
});

assert.deepStrictEqual(frames.map(frame => frame.offset), [0, .11, .22, .33, .44, .96, .97, .98, .99, .995, 1],
    'strong hit must spend 2.2s tumbling and reserve only 0.2s for the stepped return');
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

console.log('[test] Hunter visible tumble keyframes passed.');
