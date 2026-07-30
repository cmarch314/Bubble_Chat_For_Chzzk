const assert = require('assert');
const HuntRunPartyAdapter = require('../js/effects/hunt/HuntRunPartyAdapter');

const hunter = {
    participantUid: 'u1', hunterName: '헌터', hunterColor: '#fff', isStreamer: true,
    hp: 55, maxHp: 100, id: 'great-sword', weaponInstance: { id: 'bone-blade' },
    personality: 'veteran', perks: [{ id: 'camp-lover' }], lockedPerkId: 'camp-lover',
    potions: 2.8, lifepowders: 1, shockTraps: 1, bombs: 0
};
const [saved] = HuntRunPartyAdapter.snapshot([hunter]);
assert.strictEqual(saved.potions, undefined);
assert.deepStrictEqual(saved.lockedPerkIds, ['camp-lover']);

const target = {};
let applied = null;
global.WILDS_WEAPON_PROGRESSION = [{
    key: 'great-sword:1', id: 1, kind: 'great-sword', nameKo: '희망의 검 I', rarity: 1, sharpness: { red: 10, orange: 10 }
}];
HuntRunPartyAdapter.restore(target, { ...saved, weaponId: 'great-sword', weaponProgressionKey: 'great-sword:1', hp: 999 }, {
    replaceHunterWeapon(_hunter, weaponId) { _hunter.id = weaponId; return true; },
    syncLoadoutItems() {},
    applyPersistentProfile(_hunter, profile) { applied = profile; },
    weaponInstanceCatalog: { apply(_hunter, instance) {
        _hunter.weaponInstance = instance; _hunter.weaponDisplayName = instance.nameKo;
        _hunter.sharpnessProfile = instance.sharpness; _hunter.maxSharpness = 20; _hunter.sharpness = 2;
    } }
});
assert.strictEqual(target.hp, 100);
assert.strictEqual(target.potions, undefined);
assert.strictEqual(applied.lockedPerkId, 'camp-lover');
assert.strictEqual(target.weaponDisplayName, '희망의 검 I');
assert.strictEqual(target.sharpness, 20);
console.log('[test] Journey party resource materialization and settlement passed.');
