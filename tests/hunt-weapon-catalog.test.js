const assert = require('assert');
global.HUNT_WILDS_MOTION_VALUES = require('../js/effects/hunt/data/WildsMotionValues.generated.js');
global.HuntMotionValueCatalog = require('../js/effects/hunt/HuntMotionValueCatalog.js');
global.HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
global.HUNT_WILDS_COMBO_LINKS = {
    weapons: { great_sword: { 'great_sword.tackle': { gameActionClass: 'cTackle', next: ['great_sword.rising_slash'], evidence: 'installed-game-action-guide-transition' } } }
};
const HuntWeaponCatalog = require('../js/effects/hunt/HuntWeaponCatalog.js');

const catalog = HuntWeaponCatalog.build({
    great_sword: [{ name: '참모아베기', dmg: 680 }],
    charge_blade: [{ name: '초고출력 속성해방베기', dmg: 650 }],
    bow: [{ name: '용의 화살', dmg: 410 }]
});

assert.deepStrictEqual(HuntWeaponCatalog.validate(catalog), []);
const trueChargedSlash = catalog.great_sword.find(action => action.id === 'great_sword.true_charged_slash');
assert.ok(catalog.great_sword[0].tags.includes('charge'));
assert.strictEqual(trueChargedSlash.audioCue, 'true_charged_slash');
assert.strictEqual(catalog.charge_blade.find(action => action.id === 'charge_blade.saed').audioCue, 'explosive_heavy');
assert.strictEqual(catalog.bow.find(action => action.id === 'bow.tracer_dragon_piercer').audioCue, 'dragon_piercer');
assert.match(trueChargedSlash.timingEvidence, /motion-value-proxy/);
assert(trueChargedSlash.durationTicks >= 3 && trueChargedSlash.durationTicks <= 24);
const tackle = catalog.great_sword.find(action => action.id === 'great_sword.tackle');
assert(trueChargedSlash.durationTicks > tackle.durationTicks, 'higher-MV finisher must occupy more ATB time than tackle');
assert.strictEqual(tackle.gameActionClass, 'cTackle');
assert.ok(tackle.next.includes('great_sword.rising_slash'));
assert.strictEqual(tackle.comboEvidence, 'installed-game-action-guide-transition');

const canonical = HuntWeaponCatalog.build({ switch_axe: [{ name: 'legacy placeholder', dmg: 1 }], hammer: [] });
assert.strictEqual(canonical.switch_axe[0].id, 'switch_axe.axe_overhead_slash');
assert.ok(canonical.switch_axe.some(action => action.id === 'switch_axe.full_release_slash'));
assert.deepStrictEqual(canonical.hammer.slice(0, 3).map(action => action.id), [
    'hammer.overhead_1', 'hammer.overhead_2', 'hammer.upswing'
]);
assert.strictEqual(canonical.hammer.find(action => action.id === 'hammer.charge_1').durationTicks, 3, 'explicit short charge timing must survive catalog enrichment');
assert.ok(canonical.hammer.some(action => action.id === 'hammer.big_bang_finisher'));
assert.ok(canonical.hammer.some(action => action.id === 'hammer.offset_followup_spinslam'));

console.log('[test] Hunt weapon catalog contract passed.');
