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
const HuntInitializer = require('../js/effects/hunt/HuntInitializer.js');

const initializer = new HuntInitializer({ random: () => 0 });
const hunter = initializer.buildSelectedWeapons(['great_sword'])[0];
hunter.hunterName = '선발자';
hunter.hunterColor = '#123456';
hunter.personality = 'support';
initializer.syncLoadoutItems(hunter);
assert.strictEqual(hunter.shockTraps, 2, 'support hunters must start with two traps');
hunter.perks = [{ id: 'fixed', name: '고정 퍽', modifiers: {} }];
hunter.perkModifiers = { atbRate: 1.1 };

// First chat: !지원가. Second chat: !차액. Partial edits accumulate.
assert.strictEqual(initializer.replaceHunterWeapon(hunter, 'charge_blade'), true);
assert.strictEqual(hunter.id, 'charge_blade');
assert.strictEqual(hunter.hunterName, '선발자');
assert.strictEqual(hunter.personality, 'support');
assert.strictEqual(hunter.shockTraps, 2, 'weapon changes must preserve the support loadout trap count');
assert.strictEqual(hunter.perks[0].id, 'fixed');
assert.strictEqual(hunter.perkModifiers.atbRate, 1.1);

hunter.personality = 'offensive';
assert.strictEqual(initializer.replaceHunterWeapon(hunter, 'great_sword'), true);
assert.strictEqual(hunter.personality, 'offensive');
assert.strictEqual(hunter.perks[0].id, 'fixed');
assert.strictEqual(initializer.rerollHunterPerks(hunter), true);

for (const [personality, expected] of [['support', 2], ['veteran', 1], ['offensive', 0], ['defensive', 0], ['normal', 0], ['newbie', 0]]) {
    assert.strictEqual(initializer.syncLoadoutItems({ personality }).shockTraps, expected, `${personality} initial trap count`);
}
assert.notStrictEqual(hunter.perks.map(perk => perk.id).join('|'), 'fixed', 'reroll must replace the complete perk set');
assert.deepStrictEqual(hunter.perkModifiers, HuntPerkCatalog.aggregate(hunter.perks), 'reroll must rebuild runtime perk modifiers');
hunter.perkRerollCount = 1;
initializer.replaceHunterWeapon(hunter, 'hammer');
assert.strictEqual(hunter.perkRerollCount, 1, 'weapon changes must preserve the first of two used rerolls');
const emptyHunter = { perks: [], perkModifiers: {} };
initializer.random = () => .09;
assert.deepStrictEqual(initializer.materializeBattleStartPerks([emptyHunter]), [emptyHunter], 'an empty reroll result must remain eligible for battle-start Dung');
assert.strictEqual(emptyHunter.perks[0].name, '똥');
assert.strictEqual(emptyHunter.dungAwakened, true);
const missedDung = { perks: [], perkModifiers: {} };
initializer.random = () => .1;
assert.deepStrictEqual(initializer.materializeBattleStartPerks([missedDung]), [], 'Dung must use an exclusive 10% battle-start boundary');
assert.deepStrictEqual(missedDung.perks, []);
console.log('[test] Hunt repeated loadout edits and two-use perk reroll state preservation passed.');
