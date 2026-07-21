const assert = require('assert');
const entries = require('../js/effects/hunt/data/WildsWeaponInstances.generated.js');
const HuntWeaponInstanceCatalog = require('../js/effects/hunt/HuntWeaponInstanceCatalog.js');

assert.strictEqual(entries.length, 439, 'the compact runtime must preserve every extracted final Wilds weapon');
assert.strictEqual(new Set(entries.map(entry => entry.kind)).size, 14, 'all 14 weapon groups need instance candidates');
assert.ok(entries.every(entry => entry.evidence === 'wilds-game-files-via-mhdb'), 'every runtime weapon must preserve extraction evidence');
assert.strictEqual(entries.filter(entry => entry.element).length, 180, 'all extracted elemental weapons must preserve their element');
assert.deepStrictEqual([...new Set(entries.filter(entry => entry.element).map(entry => entry.element))].sort(), ['dragon', 'fire', 'ice', 'thunder', 'water']);
assert.ok(entries.every(entry => entry.nameKo && /[가-힣]/.test(entry.nameKo)), 'every extracted weapon must use its official Korean localized name');
const catalog = new HuntWeaponInstanceCatalog(entries, () => 0);
for (const kind of [...new Set(entries.map(entry => entry.kind))]) assert.ok(catalog.pick(kind), `${kind} needs a selectable weapon instance`);
for (const kind of ['bow', 'light_bowgun', 'heavy_bowgun']) {
    assert.ok(entries.filter(entry => entry.kind === kind).every(entry => entry.sharpness === null), `${kind} must not receive fictional sharpness`);
}
for (const kind of ['great_sword', 'long_sword', 'sword_shield', 'dual_blades', 'hammer', 'hunting_horn', 'lance', 'gunlance', 'switch_axe', 'charge_blade', 'insect_glaive']) {
    assert.ok(entries.filter(entry => entry.kind === kind).every(entry => HuntWeaponInstanceCatalog.total(entry.sharpness) > 0), `${kind} needs extracted sharpness segments`);
}
const hunter = { id: 'great_sword', name: '대검' };
catalog.apply(hunter);
assert.ok(hunter.weaponDisplayName && hunter.sharpnessProfile);
assert.strictEqual(hunter.sharpness, hunter.maxSharpness);
assert.ok(HuntWeaponInstanceCatalog.COLORS.includes(HuntWeaponInstanceCatalog.colorAt(hunter.sharpnessProfile, hunter.sharpness)));
assert.strictEqual(HuntWeaponInstanceCatalog.rawMultiplier({ sharpnessProfile: { red: 10, blue: 10 }, sharpness: 20 }), 1.2);
assert.strictEqual(HuntWeaponInstanceCatalog.minimumColorForHitzone(.20), 'white');
assert.strictEqual(HuntWeaponInstanceCatalog.bounceCheck({ sharpnessProfile: { red: 10, blue: 10 }, sharpness: 20, perks: [] }, .20, {}).bounced, true);
assert.strictEqual(HuntWeaponInstanceCatalog.bounceCheck({ sharpnessProfile: { red: 10, white: 10 }, sharpness: 20, perks: [] }, .20, {}).bounced, false);
assert.strictEqual(HuntWeaponInstanceCatalog.bounceCheck({ sharpnessProfile: { red: 10 }, sharpness: 10, perks: [{ name: '심안' }] }, .10, {}).bounced, false);
const whetstoneProfile = { red: 50, orange: 50, yellow: 50, green: 50, blue: 50, white: 50, purple: 0 };
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'normal' }), 150,
    'normal hunters should sharpen immediately upon entering yellow sharpness');
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'offensive' }), 200,
    'offensive hunters should sharpen immediately upon entering green sharpness');
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'veteran' }), 200,
    'veterans should sharpen immediately upon entering green sharpness');
for (const personality of ['normal', 'newbie', 'defensive', 'support']) {
    assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality }), 150,
        `${personality} hunters should sharpen immediately upon entering yellow sharpness`);
}
const blueOffensive = { sharpnessProfile: whetstoneProfile, maxSharpness: 300, sharpness: 225, personality: 'offensive' };
assert.strictEqual(HuntWeaponInstanceCatalog.colorAt(blueOffensive.sharpnessProfile, blueOffensive.sharpness), 'blue');
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen(blueOffensive, () => .59), true,
    'offensive hunters should have a 60% proactive sharpening chance in blue');
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen(blueOffensive, () => .60), false,
    'blue offensive sharpening must remain probabilistic');
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen({ ...blueOffensive, personality: 'veteran' }, () => 0), false,
    'the proactive blue-sharpness chance belongs only to offensive hunters');
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen({ ...blueOffensive, sharpness: 25, personality: 'newbie' }, () => 0), false,
    'newbie hunters must never choose automatic whetstone use, even at red sharpness');
console.log('[test] 439 extracted Wilds weapon instances and sharpness profiles passed.');
