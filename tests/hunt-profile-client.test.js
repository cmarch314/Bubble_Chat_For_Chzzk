const assert = require('assert');
const HuntProfileClient = require('../js/effects/hunt/HuntProfileClient');

(async () => {
    const calls = [];
    const savedProfile = {
        perkIds: ['perk_001'], lockedPerkId: 'perk_001'
    };
    const fetchImpl = async (url, options = {}) => {
        calls.push({ url: String(url), options });
        if (options.method === 'POST') {
            const body = JSON.parse(options.body);
            return { ok: true, json: async () => ({ profile: body.profile }) };
        }
        return { ok: true, json: async () => ({ profile: savedProfile }) };
    };
    const client = new HuntProfileClient({ fetchImpl, timeoutMs: 100, saveDelayMs: 5 });
    const hunter = {
        participantUid: 'viewer-1', hunterName: '헌터', id: 'great_sword',
        weaponInstance: { id: 99 }, personality: 'support',
        perks: [{ id: 'perk_002' }], lockedPerkId: 'perk_002'
    };

    assert.deepStrictEqual(await client.load(hunter), savedProfile);
    assert.deepStrictEqual(await client.load(hunter), savedProfile);
    assert.strictEqual(calls.length, 1, 'one viewer profile must be fetched once per HuntEffect lifetime');
    const saved = await client.saveNow(hunter);
    assert.strictEqual(saved.weaponId, undefined);
    assert.strictEqual(saved.personality, undefined);
    assert.deepStrictEqual(saved.perkIds, ['perk_002']);
    assert.strictEqual(calls.length, 2);
    hunter.perks = [{ id: 'perk_141', name: '💩' }];
    hunter.lockedPerkId = null;
    const boundJackpot = await client.saveNow(hunter);
    assert.deepStrictEqual(boundJackpot, { perkIds: ['perk_141'], lockedPerkId: null },
        'a battle-awakened emoji perk must persist without consuming the normal perk lock');
    assert.strictEqual(client.scheduleSave({ ...hunter, isNpc: true }), false, 'NPC profiles must never be persisted');
    client.dispose();
    console.log('[test] Hunt profile client cache and compact save contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
