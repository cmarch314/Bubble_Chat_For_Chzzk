const assert = require('assert');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(
    path.join(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'),
    'utf8'
);
const context = {
    console,
    HuntMonsterAttackAnimator: class {},
    HuntWeaponAnimationCatalog: {
        keyframes: () => [{ transform: 'rotate(-104deg)' }, { transform: 'rotate(-104deg)' }]
    }
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.HuntCombatAnimator = HuntCombatAnimator;`, context);

const owner = {
    card: null,
    animationTimers: { timeout: () => {} },
    updateWeaponChargeAuraUI: () => {}
};
const animator = new context.HuntCombatAnimator(owner);
let cancelCount = 0;
const style = {
    transform: 'rotate(-104deg)',
    removeProperty(name) {
        if (name === 'transform') this.transform = '';
    }
};
const animation = { cancel: () => { cancelCount += 1; } };
let browserAnimations = [];
const weaponImg = {
    style,
    dataset: {},
    classList: { remove: () => {} },
    animate: () => animation,
    getAnimations: () => browserAnimations
};

animator.playWeaponAnimation(weaponImg, 'great_sword', 0, { durationMs: 360 });
browserAnimations = [animation];
animation.onfinish();
assert.strictEqual(cancelCount, 1, 'finished charge animation must release its terminal pose');
assert.strictEqual(animator.activeWeaponAnimations.size, 0, 'finished animation handle must be cleared');
assert.strictEqual(style.transform, '', 'finished charge must not leave an inline preparation pose');

const chargingHunter = { id: 'great_sword', index: 0, greatSwordCharge: 2, greatSwordChain: 1 };
assert.strictEqual(HuntMonsterTurnExecutor.isGreatSwordCharging(chargingHunter), true,
    'charge stage gaps must still count as an active Great Sword charge');
let visualInterrupted = false;
const interruptionEngine = {
    weaponMechanics: { onHit: hunter => { hunter.greatSwordCharge = 0; hunter.greatSwordChain = 0; } },
    actionStateMachine: { cancel: hunter => { hunter.currentAction = null; hunter.actionState = 'idle'; } },
    callbacks: { onInterruptWeaponVisual: () => { visualInterrupted = true; } }
};
assert.strictEqual(HuntMonsterTurnExecutor.interruptGreatSwordCharge(interruptionEngine, chargingHunter), true);
assert.deepStrictEqual([chargingHunter.greatSwordCharge, chargingHunter.greatSwordChain], [0, 0]);
assert.strictEqual(visualInterrupted, true, 'an interrupted charge must cancel its weapon animation immediately');

const orphan = { cancel: () => { cancelCount += 1; } };
weaponImg.getAnimations = () => [orphan];
animator.cancelWeaponAnimation(weaponImg);
assert.strictEqual(cancelCount, 2, 'interrupt cleanup must also cancel an untracked browser animation');

console.log('hunt-great-sword-pose-cleanup.test.js passed');
