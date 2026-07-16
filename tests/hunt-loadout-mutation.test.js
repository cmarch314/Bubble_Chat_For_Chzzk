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
hunter.perks = [{ id: 'fixed', name: '고정 퍽', modifiers: {} }];
hunter.perkModifiers = { atbRate: 1.1 };

// First chat: !지원가. Second chat: !차액. Partial edits accumulate.
assert.strictEqual(initializer.replaceHunterWeapon(hunter, 'charge_blade'), true);
assert.strictEqual(hunter.id, 'charge_blade');
assert.strictEqual(hunter.hunterName, '선발자');
assert.strictEqual(hunter.personality, 'support');
assert.strictEqual(hunter.perks[0].id, 'fixed');
assert.strictEqual(hunter.perkModifiers.atbRate, 1.1);

hunter.personality = 'offensive';
assert.strictEqual(initializer.replaceHunterWeapon(hunter, 'great_sword'), true);
assert.strictEqual(hunter.personality, 'offensive');
assert.strictEqual(hunter.perks[0].id, 'fixed');
console.log('[test] Hunt repeated loadout edits preserve immutable perks.');
