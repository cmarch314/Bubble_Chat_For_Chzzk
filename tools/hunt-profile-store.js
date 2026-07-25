const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const HuntProfileContract = require('../js/effects/hunt/HuntProfileContract');
const HuntRunState = require('../js/effects/hunt/HuntRunState');

const DEFAULT_DB_PATH = path.resolve(__dirname, '..', '.runtime', 'hunt-profiles.sqlite');

function cleanText(value, maxLength) {
    return HuntProfileContract.cleanText(value, maxLength);
}

function identityKey(identity = {}) {
    const uid = cleanText(identity.uid, 128);
    const nickname = cleanText(identity.nickname, 80).normalize('NFKC').toLocaleLowerCase('ko-KR');
    const source = uid ? `uid:${uid}` : nickname ? `nickname:${nickname}` : '';
    return source ? crypto.createHash('sha256').update(source).digest('hex') : null;
}

function sanitizeProfile(profile = {}) {
    return HuntProfileContract.normalize(profile);
}

class HuntProfileStore {
    constructor(dbPath = DEFAULT_DB_PATH) {
        this.dbPath = path.resolve(dbPath);
        fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        this.db = new DatabaseSync(this.dbPath);
        this.db.exec(`
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
        `);
        try {
            this.migrate();
        } catch (error) {
            this.db.close();
            throw error;
        }
        this.readStatement = this.db.prepare(`
            SELECT weapon_id, weapon_instance_id, personality, perk_ids, locked_perk_id, revision, updated_at
            FROM hunt_profiles WHERE profile_key = ?
        `);
        this.writeStatement = this.db.prepare(`
            INSERT INTO hunt_profiles (
                profile_key, weapon_id, weapon_instance_id,
                personality, perk_ids, locked_perk_id, revision, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 1, ?)
            ON CONFLICT(profile_key) DO UPDATE SET
                weapon_id = excluded.weapon_id,
                weapon_instance_id = excluded.weapon_instance_id,
                personality = excluded.personality,
                perk_ids = excluded.perk_ids,
                locked_perk_id = excluded.locked_perk_id,
                revision = hunt_profiles.revision + 1,
                updated_at = excluded.updated_at
        `);
    }

    migrate() {
        let current = Number(this.db.prepare('PRAGMA user_version').get().user_version || 0);
        const databaseVersion = 2;
        if (current > databaseVersion) {
            throw new Error(`Unsupported hunt profile schema version: ${current}`);
        }
        if (current < 1) {
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS hunt_profiles (
                profile_key TEXT PRIMARY KEY,
                weapon_id TEXT,
                weapon_instance_id INTEGER,
                personality TEXT,
                perk_ids TEXT NOT NULL DEFAULT '[]',
                locked_perk_id TEXT,
                revision INTEGER NOT NULL DEFAULT 1,
                updated_at INTEGER NOT NULL
                ) WITHOUT ROWID;
                PRAGMA user_version = 1;
            `);
            current = 1;
        }
        if (current < 2) {
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS hunt_runs (
                    channel_key TEXT PRIMARY KEY,
                    state_json TEXT NOT NULL,
                    revision INTEGER NOT NULL DEFAULT 1,
                    updated_at INTEGER NOT NULL
                ) WITHOUT ROWID;
                CREATE TABLE IF NOT EXISTS hunt_run_summaries (
                    run_id TEXT PRIMARY KEY,
                    state_json TEXT NOT NULL,
                    completed_at INTEGER NOT NULL
                ) WITHOUT ROWID;
                PRAGMA user_version = 2;
            `);
        }
    }

    get(identity) {
        const key = identityKey(identity);
        if (!key) return null;
        const row = this.readStatement.get(key);
        if (!row) return null;
        let perkIds = [];
        try { perkIds = JSON.parse(row.perk_ids); } catch (_) { perkIds = []; }
        return {
            schemaVersion: HuntProfileContract.SCHEMA_VERSION,
            weaponId: row.weapon_id,
            weaponInstanceId: row.weapon_instance_id,
            personality: row.personality,
            perkIds: Array.isArray(perkIds) ? perkIds : [],
            lockedPerkId: row.locked_perk_id,
            revision: row.revision,
            updatedAt: row.updated_at
        };
    }

    upsert(identity, profile) {
        const key = identityKey(identity);
        if (!key) throw new Error('A viewer uid or nickname is required');
        const clean = sanitizeProfile(profile);
        const updatedAt = Date.now();
        this.writeStatement.run(
            key,
            clean.weaponId,
            clean.weaponInstanceId,
            clean.personality,
            JSON.stringify(clean.perkIds),
            clean.lockedPerkId,
            updatedAt
        );
        return this.get(identity);
    }

    runKey(channelKey) {
        const value = cleanText(channelKey, 128);
        return value ? crypto.createHash('sha256').update(`channel:${value}`).digest('hex') : null;
    }

    getRun(channelKey) {
        const key = this.runKey(channelKey);
        if (!key) return null;
        const row = this.db.prepare('SELECT state_json, revision FROM hunt_runs WHERE channel_key = ?').get(key);
        if (!row) return null;
        const state = HuntRunState.normalize(JSON.parse(row.state_json));
        state.revision = Number(row.revision);
        return state;
    }

    saveRun(channelKey, state, expectedRevision = 0) {
        const key = this.runKey(channelKey);
        if (!key) throw new Error('A channel key is required');
        const clean = HuntRunState.normalize(state);
        const current = this.getRun(channelKey);
        if (current && Number(current.revision) !== Number(expectedRevision)) {
            const conflict = new Error('Journey checkpoint revision conflict');
            conflict.status = 409;
            throw conflict;
        }
        if (!current && Number(expectedRevision) !== 0) {
            const conflict = new Error('Journey checkpoint does not exist');
            conflict.status = 409;
            throw conflict;
        }
        const revision = Number(expectedRevision) + 1;
        clean.revision = revision;
        if (clean.status !== 'active') {
            const completedAt = Date.now();
            this.db.exec('BEGIN IMMEDIATE');
            try {
                this.db.prepare('DELETE FROM hunt_run_summaries WHERE run_id <> ?').run(clean.runId);
                this.db.prepare(`
                    INSERT INTO hunt_run_summaries (run_id, state_json, completed_at) VALUES (?, ?, ?)
                    ON CONFLICT(run_id) DO UPDATE SET state_json = excluded.state_json, completed_at = excluded.completed_at
                `).run(clean.runId, JSON.stringify(clean), completedAt);
                this.db.prepare('DELETE FROM hunt_runs WHERE channel_key = ?').run(key);
                this.db.exec('COMMIT');
            } catch (error) {
                this.db.exec('ROLLBACK');
                throw error;
            }
            return clean;
        }
        this.db.prepare(`
            INSERT INTO hunt_runs (channel_key, state_json, revision, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT(channel_key) DO UPDATE SET state_json = excluded.state_json, revision = excluded.revision, updated_at = excluded.updated_at
        `).run(key, JSON.stringify(clean), revision, Date.now());
        return this.getRun(channelKey);
    }

    getLatestRunSummary() {
        const row = this.db.prepare('SELECT state_json, completed_at FROM hunt_run_summaries ORDER BY completed_at DESC LIMIT 1').get();
        if (!row) return null;
        return { state: HuntRunState.normalize(JSON.parse(row.state_json)), completedAt: Number(row.completed_at) };
    }

    deleteRun(channelKey) {
        const key = this.runKey(channelKey);
        if (!key) return false;
        return Number(this.db.prepare('DELETE FROM hunt_runs WHERE channel_key = ?').run(key).changes || 0) > 0;
    }

    close() {
        this.db.close();
    }
}

module.exports = { DEFAULT_DB_PATH, HuntProfileStore, identityKey, sanitizeProfile };
