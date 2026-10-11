'use strict';

const assert = require('assert');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntWeaponAnimationCatalog = require('../js/effects/hunt/HuntWeaponAnimationCatalog.js');

const tackleAction = HuntWeaponMechanics.actionsFor('great_sword')
    .find(action => action.id === 'great_sword.tackle');
assert.strictEqual(tackleAction.name, '태클',
    'the technique name must not retain the old charge-tackle label');

const tackleMotion = HuntWeaponAnimationCatalog.MOTIONS.shoulder_tackle;
assert.ok(Math.max(...tackleMotion.map(frame => Number(frame[1] || 0))) <= .24,
    'Great Sword tackle must be a short shoulder bump, not a long target-crossing lunge');
assert.ok(tackleMotion.some(frame => Number(frame[1] || 0) < 0),
    'the shoulder contact must visibly recoil behind the starting line before returning home');
assert.deepStrictEqual(tackleMotion.at(-1).slice(1, 3), [0, 0],
    'the compact tackle must finish at its original position');

console.log('[test] Great Sword compact tackle animation passed.');
