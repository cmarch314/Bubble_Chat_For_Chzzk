'use strict';

const assert = require('assert');
const Rotation = require('../js/effects/hunt/HuntRotationContract.js');

assert.deepStrictEqual(
    ['clockwise', 'counterclockwise'].map(rotationDirection =>
        Rotation.resolve({ rotationDirection, rotationDegrees: 15 }, 0).final),
    [15, -15],
    'image-local direction must produce opposite signed angles'
);
assert.strictEqual(Rotation.resolve({ to: 'home', rotation: 0 }, -330).final, -330,
    'automatic home recovery must translate without adding a finishing or reverse turn');
assert.strictEqual(Rotation.resolve({ to: 'home', rotation: 0, rotationResetMode: 'animate' }, -330).final, 0,
    'an explicit animate mode may author a visible return rotation');
assert.strictEqual(Rotation.resolve({ rotationDirection: 'clockwise', rotationDegrees: 360 }, -15).final, 345,
    'directed full turns must accumulate without normalizing away their path');

console.log('[test] shared hunt rotation contract passed');
