'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');

const css = fs.readFileSync(path.resolve(__dirname, '../styles/hunt-runtime.css'), 'utf8');
const animatorSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'),
    'utf8'
);
assert.match(css,
    /\.game-hunt-weapon-img\.ls-spirit-img-3\s*\{[^}]*filter:[^}]*hue-rotate\(300deg\)[^}]*animation:\s*ls-spirit-img-pulse-3/s,
    'red spirit coating needs a static red filter even if its pulse animation is interrupted');

assert.match(animatorSource,
    /playWeaponAnimation\(weaponImg[\s\S]*?cancelWeaponAnimation\(weaponImg, \{ preserveResourceAnimations: true \}\)/,
    'authored weapon actions must preserve persistent weapon-resource animation');

const animator = Object.create(HuntCombatAnimator.prototype);
animator.activeWeaponAnimations = new Map();
let actionCancels = 0;
let spiritPulseCancels = 0;
const oldAction = { cancel: () => { actionCancels += 1; } };
const spiritPulse = {
    animationName: 'ls-spirit-img-pulse-3',
    cancel: () => { spiritPulseCancels += 1; }
};
const weaponImg = {
    dataset: {},
    classList: { remove() {}, add() {} },
    style: { removeProperty() {} },
    getAnimations: () => [oldAction, spiritPulse],
    animate() { return { cancel() {}, onfinish: null }; }
};
animator.activeWeaponAnimations.set(weaponImg, oldAction);
animator.cancelWeaponAnimation(weaponImg, { preserveResourceAnimations: true });
assert.strictEqual(actionCancels, 1,
    'Special Sheathe must still replace the previous owned action animation');
assert.strictEqual(spiritPulseCancels, 0,
    'Special Sheathe must not cancel the persistent spirit coating pulse');

console.log('[test] Long Sword spirit coating survives Special Sheathe.');
