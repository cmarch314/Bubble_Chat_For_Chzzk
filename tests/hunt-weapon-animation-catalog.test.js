'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntWeaponAnimationCatalog = require('../js/effects/hunt/HuntWeaponAnimationCatalog.js');

const leftChargeFrames = HuntWeaponAnimationCatalog.keyframes(
    HuntWeaponAnimationCatalog.resolve('great_sword', { id: 'great_sword.charge_2' }),
    0
);
const rightChargeFrames = HuntWeaponAnimationCatalog.keyframes(
    HuntWeaponAnimationCatalog.resolve('great_sword', { id: 'great_sword.charge_2' }),
    3
);
assert.match(leftChargeFrames[0].transform, /rotate\(225deg\)/,
    'slots 1/2 must hold the corrected Great Sword bitmap on its 12 o’clock start axis');
assert.match(leftChargeFrames[0].transform, /scaleX\(-1\)/,
    'slots 1/2 must flip the source edge upward into the cutting direction');
assert.match(rightChargeFrames[0].transform, /rotate\(-225deg\)/,
    'slots 3/4 must mirror the Great Sword charge angle used by slots 1/2');
assert.match(rightChargeFrames[0].transform, /scaleX\(1\)/,
    'slots 3/4 must mirror the complete Great Sword stance toward the monster');
const measuredLeft = HuntWeaponAnimationCatalog.keyframes(
    HuntWeaponAnimationCatalog.resolve('great_sword', { id: 'great_sword.charged_slash' }),
    1, { x: -400, y: -200 }
);
assert.match(measuredLeft[0].transform, /rotate\(225deg\).*scaleX\(-1\)/,
    'live target coordinates must adjust reach without reversing the slot 1/2 blade stance');

const weaponIds = [
    'great_sword', 'long_sword', 'sword_shield', 'dual_blades', 'hammer', 'hunting_horn', 'lance',
    'gunlance', 'switch_axe', 'charge_blade', 'insect_glaive', 'light_bowgun', 'heavy_bowgun', 'bow'
];

weaponIds.forEach(weaponId => {
    const actions = HuntWeaponMechanics.actionsFor(weaponId);
    const profiles = actions.map(action => HuntWeaponAnimationCatalog.resolve(weaponId, action));
    profiles.forEach(profile => {
        assert.ok(!profile.fallback, `${profile.actionId} must have an exact animation profile`);
        assert.ok(profile.motion, `${profile.actionId} must name a motion family`);
        assert.ok(profile.durationMs >= 350, `${profile.actionId} must remain readable in OBS`);
        const frames = HuntWeaponAnimationCatalog.keyframes(profile, 0);
        assert.ok(frames.length >= 2, `${profile.actionId} must generate keyframes`);
        assert.strictEqual(frames[0].offset, 0);
        assert.strictEqual(frames.at(-1).offset, 1);
    });
    assert.ok(new Set(profiles.map(profile => profile.motion)).size >= 2, `${weaponId} needs more than one generic weapon motion`);
});

const preparationIds = [
    'great_sword.charge_1', 'great_sword.charge_2', 'great_sword.charge_3',
    'great_sword.strong_charge_1', 'great_sword.strong_charge_2', 'great_sword.strong_charge_3',
    'great_sword.true_charge_1', 'great_sword.true_charge_2', 'great_sword.true_charge_3',
    'long_sword.special_sheathe', 'sword_shield.backstep', 'dual_blades.enter_demon', 'hammer.charge_3',
    'hunting_horn.recital_start', 'hunting_horn.recital_finish', 'lance.power_guard_1', 'gunlance.quick_reload', 'switch_axe.morph_to_sword',
    'charge_blade.load_phials', 'charge_blade.charge_shield', 'insect_glaive.extract_red',
    'light_bowgun.reload', 'heavy_bowgun.reload', 'bow.draw_3'
];
preparationIds.forEach(actionId => {
    const profile = HuntWeaponAnimationCatalog.PROFILES[actionId];
    assert.ok(profile, `${actionId} must be mapped`);
    assert.strictEqual(profile.impact, false, `${actionId} must not draw a fake hit effect`);
    assert.strictEqual(profile.effect, 'none');
});

const extract = HuntWeaponAnimationCatalog.PROFILES['insect_glaive.extract_red'];
assert.strictEqual(extract.animateWeapon, false, 'extract harvest moves only the kinsect');
assert.strictEqual(extract.kinsect, 'extract');
assert.strictEqual(HuntWeaponAnimationCatalog.PROFILES['insect_glaive.tornado_slash'].kinsect, 'assault');
for (const action of HuntWeaponMechanics.actionsFor('insect_glaive')) {
    const profile = HuntWeaponAnimationCatalog.resolve('insect_glaive', action);
    assert.strictEqual(
        profile.durationMs * 1.25,
        action.durationTicks * 100,
        `${action.id} visual duration must match its action ownership`
    );
}
assert.strictEqual(
    HuntWeaponAnimationCatalog.shieldMotion(HuntWeaponAnimationCatalog.PROFILES['sword_shield.shield_bash_1']),
    'split_shield_bash'
);
assert.strictEqual(
    HuntWeaponAnimationCatalog.shieldMotion(HuntWeaponAnimationCatalog.PROFILES['lance.power_guard_1']),
    'split_shield_guard'
);
assert.strictEqual(
    HuntWeaponAnimationCatalog.shieldMotion(HuntWeaponAnimationCatalog.PROFILES['gunlance.full_burst']),
    'split_shield_recoil'
);
for (const motion of ['split_shield_brace', 'split_shield_guard', 'split_shield_bash', 'split_shield_dash', 'split_shield_recoil']) {
    assert.ok(HuntWeaponAnimationCatalog.MOTIONS[motion], `${motion} needs independent shield keyframes`);
}

const greatSwordRaise = HuntWeaponAnimationCatalog.PROFILES['great_sword.charge_1'];
const greatSwordHold = HuntWeaponAnimationCatalog.PROFILES['great_sword.charge_2'];
const greatSwordRelease = HuntWeaponAnimationCatalog.PROFILES['great_sword.charged_slash'];
assert.strictEqual(greatSwordRaise.durationMs, 800, 'global 1.25x visual cadence turns the authored charge motion into 1000ms');
assert.strictEqual(greatSwordHold.durationMs, 800, 'every Great Sword charge level must use the same one-second runtime duration');
assert.strictEqual(
    HuntWeaponAnimationCatalog.PROFILES['hammer.charge_1'].durationMs,
    greatSwordRaise.durationMs,
    'Hammer and Great Sword charge stages must share the same one-second runtime duration'
);
assert.strictEqual(
    HuntWeaponAnimationCatalog.PROFILES['hammer.mighty_charge'].durationMs,
    greatSwordRaise.durationMs,
    'Mighty Charge must not accelerate or slow the shared charge stage'
);
const hammerChargeFrames = HuntWeaponAnimationCatalog.keyframes(
    HuntWeaponAnimationCatalog.PROFILES['hammer.charge_2'],
    0
);
assert.match(hammerChargeFrames[0].transform, /rotate\(-78deg\)/,
    'Hammer charge levels after the first must begin from the held pose instead of returning to idle');
assert.match(hammerChargeFrames.at(-1).transform, /rotate\(-78deg\)/,
    'Hammer charge must finish in a tilted held pose instead of snapping back to idle');
assert.strictEqual(
    HuntWeaponAnimationCatalog.PROFILES['hammer.charge_1'].motion,
    'hammer_charge_raise',
    'only the first Hammer charge stage may raise the weapon from idle'
);
for (const actionId of ['hammer.charge_2', 'hammer.charge_3', 'hammer.mighty_charge']) {
    assert.strictEqual(
        HuntWeaponAnimationCatalog.PROFILES[actionId].motion,
        'hammer_charge_hold',
        `${actionId} must preserve the existing tilted charge pose`
    );
}
for (const actionId of [
    'hammer.release_1', 'hammer.release_2', 'hammer.release_3', 'hammer.mighty_charge_slam'
]) {
    const profile = HuntWeaponAnimationCatalog.PROFILES[actionId];
    assert.strictEqual(profile.releaseChargePose, true,
        `${actionId} must pin its charge color through the released swing`);
    assert.strictEqual(profile.trackTarget, true,
        `${actionId} must release from the held pose toward the live monster`);
    assert.match(HuntWeaponAnimationCatalog.keyframes(profile, 0)[0].transform, /rotate\(-(?:78|82)deg\)/,
        `${actionId} must begin from the tilted charge pose`);
}
assert.strictEqual(greatSwordRaise.motion, 'great_sword_charge_raise');
assert.strictEqual(greatSwordHold.motion, 'great_sword_charge_hold');
assert.strictEqual(greatSwordRelease.motion, 'great_sword_charged_release');
for (const actionId of [
    'great_sword.charged_slash',
    'great_sword.strong_charged_slash',
    'great_sword.true_charged_slash'
]) {
    assert.strictEqual(
        HuntWeaponAnimationCatalog.PROFILES[actionId].releaseChargePose,
        true,
        `${actionId} must clear the static charge pose before its blade animation`
    );
    assert.strictEqual(
        HuntWeaponAnimationCatalog.PROFILES[actionId].trackTarget,
        true,
        `${actionId} must travel to the currently rendered monster position`
    );
}
assert.match(HuntWeaponAnimationCatalog.keyframes(greatSwordHold, 0)[0].transform, /rotate\(225deg\).*scaleX\(-1\)/,
    'later charge ticks must keep the corrected 12 o’clock start axis');
assert.match(HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, 0)[0].transform, /rotate\(225deg\).*scaleX\(-1\)/,
    'the charged slash must begin from the corrected held cutting pose');
const greatSwordReleaseFrames = HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, 0);
const slotTwoGreatSwordReleaseFrames = HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, 1);
assert.ok(greatSwordReleaseFrames.every(frame => frame.transformOrigin === '50% 88%'),
    'Great Sword must rotate from its bottom grip instead of the image center');
assert.ok(greatSwordReleaseFrames.some(frame => /rotate\(360deg\)/.test(frame.transform)),
    'slots 1/2 must finish the slash on the 9 o’clock axis');
assert.match(slotTwoGreatSwordReleaseFrames[0].transform, /rotate\(225deg\)/,
    'slot 2 must start its charged slash on the 12 o’clock axis');
assert.match(slotTwoGreatSwordReleaseFrames.at(-1).transform, /rotate\(360deg\)/,
    'slot 2 must finish its charged slash on the 9 o’clock axis');
const trueGreatSwordFrames = HuntWeaponAnimationCatalog.keyframes(
    HuntWeaponAnimationCatalog.PROFILES['great_sword.true_charged_slash'], 0
);
assert.ok(trueGreatSwordFrames.some(frame => frame.transform.includes('rotate(720deg)')),
    'true charged slash must plant downward, then continue into its rebound rotation');
assert.ok(
    HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, 0, { x: 420, y: -310 })
        .some(frame => frame.transform.includes('translate(420px, -310px)')),
    'charged slash impact must use the measured monster vector instead of the old fixed card offset'
);
const greatSwordLeftTarget = HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, 0, { x: -420, y: -310 });
const greatSwordRightTarget = HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, 0, { x: 420, y: -310 });
assert.deepStrictEqual(
    greatSwordLeftTarget.map(frame => frame.transform.match(/rotate\((-?\d+)deg\)/)?.[1]),
    greatSwordRightTarget.map(frame => frame.transform.match(/rotate\((-?\d+)deg\)/)?.[1]),
    'slot formation, not transient DOM target position, must own Great Sword swing direction');
assert.ok([...greatSwordLeftTarget, ...greatSwordRightTarget]
    .every(frame => frame.transform.includes('scaleX(-1)')),
    'slot 1 must retain its corrected upward cutting edge for either measured reach vector');

const greatSwordSlotFrames = [0, 1, 2, 3]
    .map(slot => HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, slot));
const rotationsOf = frames => frames.map(frame => frame.transform.match(/rotate\((-?\d+)deg\)/)?.[1]);
assert.deepStrictEqual(rotationsOf(greatSwordSlotFrames[0]), rotationsOf(greatSwordSlotFrames[1]),
    'slots 1/2 must share the same upper-left charge and downward slash arc');
assert.deepStrictEqual(rotationsOf(greatSwordSlotFrames[2]), rotationsOf(greatSwordSlotFrames[3]),
    'slots 3/4 must share the mirrored charge and slash arc');
assert.ok(greatSwordSlotFrames[0].every(frame => frame.transform.includes('scaleX(-1)'))
    && greatSwordSlotFrames[1].every(frame => frame.transform.includes('scaleX(-1)')),
    'slots 1/2 must flip the source edge upward into the cutting direction');
assert.ok(greatSwordSlotFrames[2].every(frame => frame.transform.includes('scaleX(1)'))
    && greatSwordSlotFrames[3].every(frame => frame.transform.includes('scaleX(1)')),
    'slots 3/4 must be true left-right mirrors of slots 1/2');

const specialSheathe = HuntWeaponAnimationCatalog.PROFILES['long_sword.special_sheathe'];
const iaiSuccess = HuntWeaponAnimationCatalog.PROFILES['long_sword.iai_counter_success'];
assert.strictEqual(specialSheathe.motion, 'ls_special_sheathe');
assert.strictEqual(specialSheathe.impact, false, 'the sheath itself must not display a fake hit');
assert.strictEqual(iaiSuccess.motion, 'ls_iai_counter_success');
assert.strictEqual(iaiSuccess.effect, 'counter');
assert.notStrictEqual(iaiSuccess.motion, HuntWeaponAnimationCatalog.PROFILES['long_sword.spirit_roundslash'].motion);
assert.strictEqual(HuntWeaponAnimationCatalog.PROFILES['long_sword.spirit_release_slash'].motion, 'ls_spirit_release_slash');

const longSwordProfiles = HuntWeaponMechanics.actionsFor('long_sword')
    .map(action => HuntWeaponAnimationCatalog.resolve('long_sword', action));
longSwordProfiles.forEach(profile => {
    assert.match(profile.motion, /^ls_/, `${profile.actionId} must use a Long Sword-specific blade-axis motion`);
    const frames = HuntWeaponAnimationCatalog.keyframes(profile, 0);
    assert.ok(frames.every(frame => frame.transformOrigin === '82% 18%'),
        `${profile.actionId} must pivot from the upper-right grip rather than the image center`);
});
for (const weaponId of [
    'great_sword', 'long_sword', 'sword_shield', 'dual_blades',
    'switch_axe', 'charge_blade', 'insect_glaive'
]) {
    HuntWeaponMechanics.actionsFor(weaponId).forEach(action => {
        const profile = HuntWeaponAnimationCatalog.resolve(weaponId, action);
        if (['sever', 'multi', 'counter'].includes(profile.effect)) {
            assert.strictEqual(profile.trackTarget, true,
                `${profile.actionId} must derive its blade-leading arc from the live monster side`);
        }
    });
}
for (const actionId of [
    'long_sword.overhead_slash', 'long_sword.rising_slash', 'long_sword.spirit_slash_1',
    'long_sword.spirit_slash_2', 'long_sword.spirit_slash_3', 'long_sword.spirit_roundslash',
    'long_sword.foresight', 'long_sword.iai_counter_success', 'long_sword.spirit_release_slash'
]) {
    const profile = HuntWeaponAnimationCatalog.PROFILES[actionId];
    const rotations = HuntWeaponAnimationCatalog.keyframes(profile, 0)
        .map(frame => Number(frame.transform.match(/rotate\((-?\d+)deg\)/)?.[1] || 0));
    assert.ok(Math.max(...rotations) - Math.min(...rotations) >= 100,
        `${actionId} must sweep the blade through a readable cutting arc`);
}

assert.notStrictEqual(HuntWeaponAnimationCatalog.PROFILES['gunlance.full_burst'].motion, HuntWeaponAnimationCatalog.PROFILES['gunlance.rising_slash'].motion);
assert.notStrictEqual(HuntWeaponAnimationCatalog.PROFILES['charge_blade.saed'].motion, HuntWeaponAnimationCatalog.PROFILES['charge_blade.sword_slash'].motion);
assert.notStrictEqual(HuntWeaponAnimationCatalog.PROFILES['switch_axe.morph_to_sword'].motion, HuntWeaponAnimationCatalog.PROFILES['switch_axe.sword_rising_slash'].motion);

const animatorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
const hunterTurnSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
assert.match(hunterTurnSource, /w\.id === 'hammer'[\s\S]*?tags\?\.includes\('charge-release'\)[\s\S]*?chargeVisualLevel/,
    'Hammer must capture its mechanic charge before the release action consumes it');
assert.match(animatorSource, /createActionEffect\(profile, impactStage, impactTarget\)/,
    'weapon effects must anchor to the resolved monster target instead of the showcase midpoint');
assert.match(animatorSource, /targetRect\.left - stageRect\.left \+ targetRect\.width \/ 2/,
    'effect positions must be converted into monster-stage coordinates');
assert.match(animatorSource, /--hunt-action-effect-size/,
    'effect size must derive from the current target bounds');
assert.match(animatorSource, /saed\|wyvern_fire\|full_release/,
    'signature explosive attacks must retain a larger bounded spectacle scale');
assert.match(animatorSource, /if \(profile\.releaseChargePose\)/,
    'Great Sword releases must clear the stale static charge pose before animating');
assert.match(animatorSource, /weapon-charge-stage-0/,
    'the released Great Sword must return its DOM charge stage to zero');
assert.match(animatorSource, /resolveWeaponTargetVector\(weaponImg, target\)/,
    'target-tracked weapon attacks must measure the live monster position');
assert.match(animatorSource, /keyframes\(profile, idx, targetVector\)/,
    'the measured monster vector must drive generated weapon keyframes');

console.log('[test] All canonical weapon actions have semantic OBS animation profiles.');
