'use strict';

const assert = require('assert');
const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');

const frames = HuntCombatAnimator.strongHitKeyframes({
    x: 240,
    y: 170,
    direction: -1
});

assert.deepStrictEqual(frames.map(frame => frame.offset), [0, .0375, .075, .1125, .15, .90, 1],
    'strong hit must force four visible half-turns before the downed hold');
assert.deepStrictEqual(
    frames.slice(1, 5).map(frame => Number(frame.transform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/)?.[1])),
    [-180, -360, -540, -720],
    'explicit rotation waypoints must prevent a two-turn tumble from collapsing into parallel translation'
);
assert.match(frames[4].transform, /translate\(240px, 170px\) rotate\(-720deg\)/,
    'the tumble must finish two turns away along the collision vector');
assert.strictEqual(frames[5].transform, frames[4].transform,
    'the hunter must remain at the fallen pose without reverse rotation');
assert.match(frames[6].transform, /translate\(0, 0\) rotate\(-720deg\)/,
    'recovery must return naturally without rewinding the tumble');

console.log('[test] Hunter visible tumble keyframes passed.');
