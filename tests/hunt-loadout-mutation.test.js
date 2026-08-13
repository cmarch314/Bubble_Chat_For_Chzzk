const assert = require('assert');

global.window = {
    HUNT_WEAPONS: [
        { id: 'great_sword', name: '대검', filename: 'great_sword.svg', type: 'melee', speedGroup: 'slow' },
        { id: 'charge_blade', name: '차지액스', filename: 'charge_blade.svg', type: 'shield', speedGroup: 'slow' }
    ],
    MONSTER_DATA: [], MONSTER_ATTACKS: {}, HUNT_COMBO_LIST: {}
};
global.HuntMonsterPatternCatalog = { build: () => ({}), validate: () => [] };
global.HuntWeaponCatalog = { build: () => ({}), validate: () => [] };
global.HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
global.HuntSupportItemPolicy = require('../js/effects/hunt/HuntSupportItemPolicy.js');
const HuntInitializer = require('../js/effects/hunt/HuntInitializer.js');

const initializer = new HuntInitializer({ random: () => 0 });
const hunter = initializer.buildSelectedWeapons(['great_sword'])[0];
hunter.hunterName = '선발자';
hunter.hunterColor = '#123456';
hunter.personality = 'support';
initializer.syncLoadoutItems(hunter);
assert.strictEqual(hunter.shockTraps, 2, 'support hunters must start with two traps');
hunter.perks = [{ id: 'fixed', name: '고정 퍽', modifiers: {} }];
hunter.lockedPerkId = 'fixed';
hunter.perkModifiers = { atbRate: 1.1 };

// First chat: !지원가. Second chat: !차액. Partial edits accumulate.
assert.strictEqual(initializer.replaceHunterWeapon(hunter, 'charge_blade'), true);
assert.strictEqual(hunter.id, 'charge_blade');
assert.strictEqual(hunter.hunterName, '선발자');
assert.strictEqual(hunter.personality, 'support');
assert.strictEqual(hunter.shockTraps, 2, 'weapon changes must preserve the support loadout trap count');
assert.strictEqual(hunter.perks[0].id, 'fixed');
assert.strictEqual(hunter.lockedPerkId, 'fixed', 'weapon changes must preserve the perk lock until an explicit unlock command');
assert.strictEqual(hunter.perkModifiers.atbRate, 1.1);

hunter.personality = 'offensive';
assert.strictEqual(initializer.replaceHunterWeapon(hunter, 'great_sword'), true);
assert.strictEqual(hunter.personality, 'offensive');
assert.strictEqual(hunter.perks[0].id, 'fixed');
assert.strictEqual(initializer.rerollHunterPerks(hunter), true);

for (const [personality, expected] of [['support', 2], ['veteran', 1], ['offensive', 0], ['defensive', 0], ['normal', 1], ['newbie', 2]]) {
    assert.strictEqual(initializer.syncLoadoutItems({ personality }).shockTraps, expected, `${personality} initial trap count`);
}
for (const [personality, expected] of [['support', 2], ['veteran', 2], ['offensive', 1], ['defensive', 0], ['normal', 1], ['newbie', 2]]) {
    assert.strictEqual(initializer.syncLoadoutItems({ personality }).flashPods, expected, `${personality} initial flash count`);
}
assert.strictEqual(hunter.perks[0].id, 'fixed', 'reroll must retain the locked perk in the first position');
assert.strictEqual(hunter.perks.filter(perk => perk.id === 'fixed').length, 1, 'reroll must not duplicate the locked perk');
assert.ok(hunter.perks.length <= 4, 'locked rerolls must keep the four-perk UI cap');
assert.deepStrictEqual(hunter.perkModifiers, HuntPerkCatalog.aggregate(hunter.perks), 'reroll must rebuild runtime perk modifiers');
hunter.perkRerollCount = 1;
initializer.replaceHunterWeapon(hunter, 'hammer');
assert.strictEqual(hunter.perkRerollCount, 1, 'weapon changes must preserve the first of two used rerolls');
const emptyHunter = { perks: [], perkModifiers: {} };
initializer.random = () => .09;
assert.deepStrictEqual(initializer.materializeBattleStartPerks([emptyHunter]), [emptyHunter], 'an empty reroll result must remain eligible for battle-start Dung');
assert.strictEqual(emptyHunter.perks[0].name, '💩');
assert.strictEqual(emptyHunter.dungAwakened, true);
const boundDungId = emptyHunter.perks[0].id;
initializer.random = () => .5;
assert.strictEqual(initializer.rerollHunterPerks(emptyHunter), true);
assert.ok(emptyHunter.perks.some(perk => perk.id === boundDungId),
    'battle-awakened Dung must remain bound without consuming the ordinary perk lock');
const missedDung = { perks: [], perkModifiers: {} };
initializer.random = () => .1;
assert.deepStrictEqual(initializer.materializeBattleStartPerks([missedDung]), [], 'Dung must use an exclusive 10% battle-start boundary');
assert.deepStrictEqual(missedDung.perks, []);

const savedPerks = HuntPerkCatalog.all().filter(perk => perk.id !== 'perk_empty').slice(0, 2);
const savedHunter = initializer.buildSelectedWeapons(['great_sword'])[0];
assert.strictEqual(initializer.applyPersistentProfile(savedHunter, {
    weaponId: 'charge_blade',
    personality: 'veteran',
    perkIds: savedPerks.map(perk => perk.id),
    lockedPerkId: savedPerks[1].id
}), true);
assert.strictEqual(savedHunter.id, 'great_sword', 'profiles must not restore the prior hunt weapon');
assert.notStrictEqual(savedHunter.personality, 'veteran', 'profiles must not restore the prior hunt personality');
assert.deepStrictEqual(savedHunter.perks.map(perk => perk.id), [savedPerks[1].id, savedPerks[0].id]);
assert.strictEqual(savedHunter.lockedPerkId, savedPerks[1].id);
console.log('[test] Hunt repeated loadout edits and two-use perk reroll state preservation passed.');

require('./hunt-support-item-policy.test.js');
