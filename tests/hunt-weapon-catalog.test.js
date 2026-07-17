const assert = require('assert');
const HuntWeaponCatalog = require('../js/effects/hunt/HuntWeaponCatalog.js');

const catalog = HuntWeaponCatalog.build({
    great_sword: [{ name: '참모아베기', dmg: 680 }],
    charge_blade: [{ name: '초고출력 속성해방베기', dmg: 650 }],
    bow: [{ name: '용의 화살', dmg: 410 }]
});

assert.deepStrictEqual(HuntWeaponCatalog.validate(catalog), []);
assert.ok(catalog.great_sword[0].tags.includes('charge'));
assert.strictEqual(catalog.great_sword[0].audioCue, 'slash_heavy');
assert.strictEqual(catalog.charge_blade[0].audioCue, 'explosive_heavy');
assert.strictEqual(catalog.bow[0].audioCue, 'dragon_piercer');
assert.strictEqual(catalog.great_sword[0].durationTicks, 18);

console.log('[test] Hunt weapon catalog contract passed.');
