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
        resolve: (weaponId, action) => {
            const isRelease = action.id.endsWith('charged_slash')
                || (weaponId === 'hammer' && /\.release_[123]$/.test(action.id));
            return ({
            actionId: action.id,
            motion: isRelease ? `${weaponId}_charged_release` : `${weaponId}_charge_hold`,
            durationMs: isRelease ? 920 : 1250,
            effect: 'none',
            impact: false,
            animateWeapon: true,
            releaseChargePose: isRelease,
            trackTarget: isRelease
        });
        },
        keyframes: () => [{ transform: 'rotate(-104deg)' }, { transform: 'rotate(42deg)' }],
        shieldMotion: () => null
    }
};
vm.createContext(context);
vm.runInContext(`${source}\nthis.HuntCombatAnimator = HuntCombatAnimator;`, context);

const owner = {
    card: null,
    animationTimers: { timeout: () => {} },
    updateWeaponChargeAuraUI: (_idx, hunter) => {
        if (!chargeContainer) return;
        const releaseLevel = Number(chargeContainer.dataset.weaponChargeReleaseStage || 0);
        const mechanicLevel = hunter?.id === 'hammer'
            ? Number(hunter?.hammerChargeLevel || 0)
            : Number(hunter?.greatSwordCharge || 0);
        const level = releaseLevel || mechanicLevel;
        chargeContainer.classList.remove(
            'weapon-charge-stage-0',
            'weapon-charge-stage-1',
            'weapon-charge-stage-2',
            'weapon-charge-stage-3'
        );
        chargeContainer.classList.add(`weapon-charge-stage-${level}`);
    }
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
    getAnimations: () => browserAnimations,
    getBoundingClientRect: () => ({ left: 100, top: 600, width: 120, height: 120 })
};

const measuredReleaseVector = animator.resolveWeaponTargetVector(weaponImg, {
    getBoundingClientRect: () => ({ left: 620, top: 180, width: 360, height: 360 })
});
assert.strictEqual(measuredReleaseVector.x, 640);
assert.strictEqual(measuredReleaseVector.y, -300,
    'Great Sword release must measure from the blade center to the live monster center');

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

const cleanupTimers = [];
const cardClasses = new Set(['weapon-charge-stage-3']);
const chargeContainer = {
    dataset: {},
    classList: {
        add: name => cardClasses.add(name),
        remove: (...names) => names.forEach(name => cardClasses.delete(name))
    }
};
const liveAnimations = [];
const stagedWeaponImg = {
    style: { removeProperty() {} },
    dataset: {},
    classList: { add() {}, remove() {} },
    offsetWidth: 115,
    closest: () => chargeContainer,
    animate() {
        const next = { cancelled: 0, cancel() { this.cancelled += 1; } };
        liveAnimations.push(next);
        return next;
    },
    getAnimations: () => liveAnimations.filter(item => item.cancelled === 0),
    getBoundingClientRect: () => ({ left: 100, top: 600, width: 115, height: 115 })
};
const stagedWeaponCard = {
    dataset: {},
    style: { borderColor: '', zIndex: '', removeProperty() {}, transform: '' },
    classList: { remove() {} },
    querySelector(selector) {
        if (selector === '.game-hunt-weapon-img') return stagedWeaponImg;
        if (selector === '.game-hunt-weapon-img-container') return chargeContainer;
        return null;
    },
    querySelectorAll: () => [stagedWeaponImg]
};
const targetMonster = {
    getBoundingClientRect: () => ({ left: 700, top: 150, width: 320, height: 320 })
};
owner.card = {
    querySelector(selector) {
        if (selector === '#fight-card-0') return stagedWeaponCard;
        if (selector === '#fight-monster-img') return targetMonster;
        return null;
    }
};
owner.animationTimers.timeout = callback => cleanupTimers.push(callback);
const stagedHunter = { id: 'great_sword', index: 0, status: 'alive', greatSwordCharge: 0 };
animator.shakeWeapon(0, stagedHunter, '#fff', true, { id: 'great_sword.charge_3' });
animator.shakeWeapon(0, stagedHunter, '#fff', true, {
    id: 'great_sword.charged_slash',
    chargeVisualLevel: 3
});
const releaseAnimation = liveAnimations[1];
assert.strictEqual(liveAnimations[0].cancelled, 1, 'release must replace the charge-hold animation');
assert(cardClasses.has('weapon-charge-stage-3'),
    'the released slash must keep the captured charge color while it swings');
owner.updateWeaponChargeAuraUI(0, stagedHunter);
assert(cardClasses.has('weapon-charge-stage-3'),
    'routine mechanic UI paints must not erase the release color');
cleanupTimers[0]();
assert.strictEqual(releaseAnimation.cancelled, 0,
    'a stale charge cleanup timer must not cancel the following slash animation');
assert.strictEqual(animator.activeWeaponAnimations.get(stagedWeaponImg), releaseAnimation);
cleanupTimers[1]();
assert.strictEqual(releaseAnimation.cancelled, 1, 'the release animation still cleans up on its own timer');
assert(cardClasses.has('weapon-charge-stage-0'));
assert(!cardClasses.has('weapon-charge-stage-3'));

animator.shakeWeapon(0, stagedHunter, '#fff', true, {
    id: 'great_sword.charged_slash',
    chargeVisualLevel: 2
});
assert(cardClasses.has('weapon-charge-stage-2'));
animator.interruptWeaponVisual(0, stagedHunter);
assert.strictEqual(chargeContainer.dataset.weaponChargeReleaseStage, undefined,
    'an interrupted slash must discard its pinned release color');
assert(cardClasses.has('weapon-charge-stage-0'),
    'an interrupted slash must immediately restore the uncharged blade color');

const hammerHunter = { id: 'hammer', index: 0, status: 'alive', hammerChargeLevel: 3 };
animator.shakeWeapon(0, hammerHunter, '#fff', true, { id: 'hammer.charge_3' });
hammerHunter.hammerChargeLevel = 0;
animator.shakeWeapon(0, hammerHunter, '#fff', true, {
    id: 'hammer.release_3',
    chargeVisualLevel: 3
});
assert(cardClasses.has('weapon-charge-stage-3'),
    'Hammer release must keep its captured charge color after mechanics consume the gauge');
cleanupTimers.at(-1)();
assert(cardClasses.has('weapon-charge-stage-0'),
    'Hammer release color must clear when the swing finishes');

console.log('hunt-great-sword-pose-cleanup.test.js passed');
