const assert = require('assert');
const HuntProfileContract = require('../js/effects/hunt/HuntProfileContract');

assert.strictEqual(HuntProfileContract.SCHEMA_VERSION, 1);
assert.strictEqual(HuntProfileContract.endpoint({
    location: { protocol: 'http:', hostname: '127.0.0.1', origin: 'http://127.0.0.1:19000' }
}), 'http://127.0.0.1:19000/api/hunt-profile', 'custom companion ports must follow the serving origin');
assert.strictEqual(HuntProfileContract.endpoint({ BUBBLECHAT_COMPANION_ORIGIN: 'http://localhost:20000/' }),
    'http://localhost:20000/api/hunt-profile');
assert.deepStrictEqual(HuntProfileContract.snapshot({
    id: 'long_sword', weaponInstance: { id: 4 }, personality: 'veteran',
    perks: [{ id: 'perk_001' }, { id: 'perk_001' }, { id: 'invalid' }], lockedPerkId: 'perk_001'
}), {
    weaponId: 'long_sword', weaponInstanceId: 4, personality: 'veteran',
    perkIds: ['perk_001'], lockedPerkId: 'perk_001'
});
assert.deepStrictEqual(HuntProfileContract.normalize({
    perkIds: ['perk_001', 'perk_002', 'perk_003', 'perk_004', 'perk_005'],
    lockedPerkId: 'perk_005'
}), {
    weaponId: null,
    weaponInstanceId: null,
    personality: null,
    perkIds: ['perk_005', 'perk_001', 'perk_002', 'perk_003'],
    lockedPerkId: 'perk_005'
}, 'legacy five-perk profiles must preserve the locked perk while shrinking to four');

console.log('[test] Shared hunt profile schema and endpoint contract passed.');
