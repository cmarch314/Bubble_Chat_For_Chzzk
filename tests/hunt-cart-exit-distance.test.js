const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntCombatAnimator.js'),
    'utf8'
);
const context = {
    HuntMonsterAttackAnimator: class HuntMonsterAttackAnimator {},
    globalThis: { innerWidth: 1920 }
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.HuntCombatAnimator = HuntCombatAnimator;`, context);

const animator = Object.create(context.HuntCombatAnimator.prototype);
animator.owner = {
    card: {
        getBoundingClientRect: () => ({ left: 80, right: 1840, width: 1760 })
    }
};

const leftHunter = {
    getBoundingClientRect: () => ({ left: 100, width: 115 })
};
const rightHunter = {
    getBoundingClientRect: () => ({ left: 1600, width: 115 })
};

assert.strictEqual(animator.cartExitDistance(leftHunter, 1), 1769,
    'a right-moving cart must clear the combat map from the left hunter slot');
assert.strictEqual(animator.cartExitDistance(rightHunter, -1), 1664,
    'a left-moving cart must clear the combat map from the right hunter slot');
assert.ok(animator.cartExitDistance(leftHunter, 1) > 520,
    'map-edge travel must replace the obsolete short fixed displacement');

assert.match(source, /travelDirection \* exitDistance/g,
    'the carried weapon and cart must share the measured map-exit distance');
assert.match(source, /offset: \.96[^\n]+travelDirection \* exitDistance[^\n]+opacity: 1/g,
    'the carried hunter and cart must remain visible until reaching the map boundary');

console.log('[test] Hunter cart exits through the measured combat-map boundary.');
