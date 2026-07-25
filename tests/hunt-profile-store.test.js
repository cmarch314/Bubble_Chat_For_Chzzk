const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { HuntProfileStore, identityKey, sanitizeProfile } = require('../tools/hunt-profile-store');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-hunt-profile-'));
const store = new HuntProfileStore(path.join(tempRoot, 'profiles.sqlite'));

try {
    assert.strictEqual(identityKey({}), null);
    assert.strictEqual(identityKey({ nickname: ' 헌터 ' }), identityKey({ nickname: '헌터' }));
    assert.notStrictEqual(identityKey({ uid: 'viewer-a', nickname: '헌터' }), identityKey({ uid: 'viewer-b', nickname: '헌터' }));

    assert.deepStrictEqual(sanitizeProfile({
        weaponId: '../bad',
        weaponInstanceId: -1,
        personality: 'wizard',
        perkIds: ['perk_001', 'perk_001', 'invalid', 'perk_002'],
        lockedPerkId: 'invalid'
    }), {
        weaponId: null,
        weaponInstanceId: null,
        personality: null,
        perkIds: ['perk_001', 'perk_002'],
        lockedPerkId: null
    });

    const identity = { uid: 'viewer-001', nickname: '테스트헌터' };
    const first = store.upsert(identity, {
        weaponId: 'long_sword',
        weaponInstanceId: 123,
        personality: 'veteran',
        perkIds: ['perk_001', 'perk_002'],
        lockedPerkId: 'perk_002'
    });
    assert.strictEqual(first.weaponId, 'long_sword');
    assert.strictEqual(first.schemaVersion, 1);
    assert.strictEqual(first.weaponInstanceId, 123);
    assert.deepStrictEqual(first.perkIds, ['perk_001', 'perk_002']);
    assert.strictEqual(first.revision, 1);

    const second = store.upsert(identity, { ...first, weaponId: 'great_sword' });
    assert.strictEqual(second.weaponId, 'great_sword');
    assert.strictEqual(second.revision, 2);
    assert.strictEqual(store.get({ uid: 'missing' }), null);
    const schemaVersion = store.db.prepare('PRAGMA user_version').get().user_version;
    assert.strictEqual(schemaVersion, 2, 'profile schema changes require an explicit SQLite migration version');
} finally {
    store.close();
    fs.rmSync(tempRoot, { recursive: true, force: true });
}

const futureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-hunt-profile-future-'));
const futurePath = path.join(futureRoot, 'profiles.sqlite');
const { DatabaseSync } = require('node:sqlite');
const futureDb = new DatabaseSync(futurePath);
futureDb.exec('PRAGMA user_version = 999;');
futureDb.close();
assert.throws(() => new HuntProfileStore(futurePath), /Unsupported hunt profile schema version/,
    'a newer DB must fail closed instead of being silently rewritten');
fs.rmSync(futureRoot, { recursive: true, force: true });

console.log('[test] Compact local hunt profile SQLite contract passed.');
