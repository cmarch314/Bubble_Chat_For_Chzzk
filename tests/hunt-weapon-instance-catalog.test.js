const assert = require('assert');
const entries = require('../js/effects/hunt/data/WildsWeaponInstances.generated.js');
const HuntWeaponInstanceCatalog = require('../js/effects/hunt/HuntWeaponInstanceCatalog.js');

assert.strictEqual(entries.length, 439, 'the compact runtime must preserve every extracted final Wilds weapon');
assert.strictEqual(new Set(entries.map(entry => entry.kind)).size, 14, 'all 14 weapon groups need instance candidates');
assert.ok(entries.every(entry => entry.evidence === 'wilds-game-files-via-mhdb'), 'every runtime weapon must preserve extraction evidence');
assert.strictEqual(entries.filter(entry => entry.element).length, 180, 'all extracted elemental weapons must preserve their element');
assert.deepStrictEqual([...new Set(entries.filter(entry => entry.element).map(entry => entry.element))].sort(), ['dragon', 'fire', 'ice', 'thunder', 'water']);
const meleeStatusSpecials = entries.flatMap(entry => entry.specials || []);
assert.strictEqual(meleeStatusSpecials.length, 49,
    'all extracted final melee status weapons must survive compact runtime generation');
assert.deepStrictEqual(Object.fromEntries(['poison', 'paralysis', 'sleep', 'blast'].map(status => [
    status, meleeStatusSpecials.filter(special => special.status === status).length
])), { poison: 19, paralysis: 12, sleep: 7, blast: 11 });
assert.ok(meleeStatusSpecials.every(special => special.kind === 'status'
    && special.hidden === false && special.raw > 0),
    'runtime status specials need normalized kinds and extracted positive buildup values');
assert.ok(entries.filter(entry => ['bow', 'light_bowgun', 'heavy_bowgun'].includes(entry.kind))
    .every(entry => entry.specials.length === 0),
    'ranged coatings and ammo must not be misrepresented as permanent melee status');
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
assert.strictEqual(HuntWeaponInstanceCatalog.bounceCheck({ sharpnessProfile: { red: 10, white: 10 }, sharpness: 20, perks: [] }, .21, {}).bounced, false,
    'white sharpness must not bounce from the reviewed Diablos horn sever hitzone');
assert.strictEqual(HuntWeaponInstanceCatalog.bounceCheck({ sharpnessProfile: { red: 10, white: 10 }, sharpness: 20, perks: [] }, .42, {}).bounced, false,
    'white sharpness must not bounce from the reviewed Diablos horn blunt hitzone');
assert.strictEqual(HuntWeaponInstanceCatalog.bounceCheck({ sharpnessProfile: { red: 10 }, sharpness: 10, perks: [{ name: '심안' }] }, .10, {}).bounced, false);
const whetstoneProfile = { red: 50, orange: 50, yellow: 50, green: 50, blue: 50, white: 50, purple: 0 };
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'offensive' }), 240);
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'veteran' }), 225);
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'normal' }), 195);
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'support' }), 180);
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'defensive' }), 165);
assert.strictEqual(HuntWeaponInstanceCatalog.sharpenThreshold({ sharpnessProfile: whetstoneProfile, maxSharpness: 300, personality: 'newbie' }), 50,
    'newbie hunters must wait for the extracted red band instead of disabling whetstones');
const thinWhiteOffensive = { sharpnessProfile: { red: 100, orange: 50, yellow: 50, green: 50, blue: 45, white: 5 }, maxSharpness: 300, sharpness: 300, personality: 'offensive' };
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen(thinWhiteOffensive, () => 0), false,
    'a thin top-color band must never make a full weapon sharpen');
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen({ ...thinWhiteOffensive, sharpness: 241 }, () => 0), false);
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen({ ...thinWhiteOffensive, sharpness: 240 }, () => 0), true,
    'offensive sharpening is based on relative wear, independent of color bands');
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen({ ...thinWhiteOffensive, sharpness: 120, personality: 'newbie' }, () => 0), false,
    'newbie hunters do not sharpen when sharpness is above red');
assert.strictEqual(HuntWeaponInstanceCatalog.shouldSharpen({ ...thinWhiteOffensive, sharpness: 25, personality: 'newbie' }, () => 0), true,
    'newbie hunters sharpen when sharpness reaches red level');
console.log('[test] 439 extracted Wilds weapon instances and sharpness profiles passed.');
