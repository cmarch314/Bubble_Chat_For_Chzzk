'use strict';

const assert = require('assert');
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
assert.match(leftChargeFrames[0].transform, /rotate\(-104deg\)/);
assert.match(leftChargeFrames[0].transform, /scaleX\(-1\)/,
    'Left-side Great Sword slots must mirror the asymmetric blade toward the monster');
assert.match(rightChargeFrames[0].transform, /rotate\(-104deg\)/,
    'Great Sword charge poses must preserve blade direction in every hunter slot');
assert.match(rightChargeFrames[0].transform, /scaleX\(1\)/,
    'Right-side Great Sword slots must retain the source blade orientation');

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

const greatSwordRaise = HuntWeaponAnimationCatalog.PROFILES['great_sword.charge_1'];
const greatSwordHold = HuntWeaponAnimationCatalog.PROFILES['great_sword.charge_2'];
const greatSwordRelease = HuntWeaponAnimationCatalog.PROFILES['great_sword.charged_slash'];
assert.strictEqual(greatSwordRaise.motion, 'great_sword_charge_raise');
assert.strictEqual(greatSwordHold.motion, 'great_sword_charge_hold');
assert.strictEqual(greatSwordRelease.motion, 'great_sword_charged_release');
assert.match(HuntWeaponAnimationCatalog.keyframes(greatSwordHold, 0)[0].transform, /rotate\(-104deg\)/, 'later charge ticks must begin from the raised ready pose');
assert.match(HuntWeaponAnimationCatalog.keyframes(greatSwordRelease, 0)[0].transform, /rotate\(-104deg\)/, 'the charged slash must begin from the held overhead pose');

const specialSheathe = HuntWeaponAnimationCatalog.PROFILES['long_sword.special_sheathe'];
const iaiSuccess = HuntWeaponAnimationCatalog.PROFILES['long_sword.iai_counter_success'];
assert.strictEqual(specialSheathe.motion, 'special_sheathe');
assert.strictEqual(specialSheathe.impact, false, 'the sheath itself must not display a fake hit');
assert.strictEqual(iaiSuccess.motion, 'iai_counter_success');
assert.strictEqual(iaiSuccess.effect, 'counter');
assert.notStrictEqual(iaiSuccess.motion, HuntWeaponAnimationCatalog.PROFILES['long_sword.spirit_roundslash'].motion);
assert.strictEqual(HuntWeaponAnimationCatalog.PROFILES['long_sword.spirit_release_slash'].motion, 'spirit_release_slash');

assert.notStrictEqual(HuntWeaponAnimationCatalog.PROFILES['gunlance.full_burst'].motion, HuntWeaponAnimationCatalog.PROFILES['gunlance.rising_slash'].motion);
assert.notStrictEqual(HuntWeaponAnimationCatalog.PROFILES['charge_blade.saed'].motion, HuntWeaponAnimationCatalog.PROFILES['charge_blade.sword_slash'].motion);
assert.notStrictEqual(HuntWeaponAnimationCatalog.PROFILES['switch_axe.morph_to_sword'].motion, HuntWeaponAnimationCatalog.PROFILES['switch_axe.sword_rising_slash'].motion);

console.log('[test] All canonical weapon actions have semantic OBS animation profiles.');
