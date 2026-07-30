const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
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
    assert.strictEqual(first.schemaVersion, 2);
    assert.strictEqual(first.weaponId, undefined);
    assert.strictEqual(first.personality, undefined);
    assert.deepStrictEqual(first.perkIds, ['perk_001', 'perk_002']);
    assert.strictEqual(first.revision, 1);

    const second = store.upsert(identity, { ...first, weaponId: 'great_sword', personality: 'support' });
    assert.strictEqual(second.weaponId, undefined);
    assert.strictEqual(second.revision, 2);
    assert.strictEqual(store.get({ uid: 'missing' }), null);
    const schemaVersion = store.db.prepare('PRAGMA user_version').get().user_version;
    assert.strictEqual(schemaVersion, 3, 'profile schema changes require an explicit SQLite migration version');
    const columns = store.db.prepare('PRAGMA table_info(hunt_profiles)').all().map(column => column.name);
    assert.deepStrictEqual(columns, ['profile_key', 'perk_ids', 'locked_perk_id', 'revision', 'updated_at']);
} finally {
    store.close();
    fs.rmSync(tempRoot, { recursive: true, force: true });
}

const legacyRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-hunt-profile-v2-'));
const legacyPath = path.join(legacyRoot, 'profiles.sqlite');
const legacyDb = new DatabaseSync(legacyPath);
legacyDb.exec(`
    CREATE TABLE hunt_profiles (
        profile_key TEXT PRIMARY KEY,
        weapon_id TEXT,
        weapon_instance_id INTEGER,
        personality TEXT,
        perk_ids TEXT NOT NULL DEFAULT '[]',
        locked_perk_id TEXT,
        revision INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL
    ) WITHOUT ROWID;
    PRAGMA user_version = 2;
`);
const legacyIdentity = { uid: 'legacy-viewer' };
legacyDb.prepare(`
    INSERT INTO hunt_profiles VALUES (?, 'great_sword', 77, 'offensive', ?, 'perk_002', 4, 1234)
`).run(identityKey(legacyIdentity), JSON.stringify(['perk_001', 'perk_002']));
legacyDb.close();
const migratedStore = new HuntProfileStore(legacyPath);
assert.deepStrictEqual(migratedStore.get(legacyIdentity), {
    schemaVersion: 2,
    perkIds: ['perk_001', 'perk_002'],
    lockedPerkId: 'perk_002',
    revision: 4,
    updatedAt: 1234
}, 'v2 profiles must preserve perks while deleting weapon and personality persistence');
assert.deepStrictEqual(
    migratedStore.db.prepare('PRAGMA table_info(hunt_profiles)').all().map(column => column.name),
    ['profile_key', 'perk_ids', 'locked_perk_id', 'revision', 'updated_at']
);
migratedStore.close();
fs.rmSync(legacyRoot, { recursive: true, force: true });

const futureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-hunt-profile-future-'));
const futurePath = path.join(futureRoot, 'profiles.sqlite');
const futureDb = new DatabaseSync(futurePath);
futureDb.exec('PRAGMA user_version = 999;');
futureDb.close();
assert.throws(() => new HuntProfileStore(futurePath), /Unsupported hunt profile schema version/,
    'a newer DB must fail closed instead of being silently rewritten');
fs.rmSync(futureRoot, { recursive: true, force: true });

console.log('[test] Compact local hunt profile SQLite contract passed.');
