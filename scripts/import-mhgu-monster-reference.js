#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_REPO = path.join(ROOT, 'game_extracts', 'reference-repos', 'MHGUDB-iOS');
const DEFAULT_DB = path.join(DEFAULT_REPO, 'MHGUDB', 'Assets', 'databases', 'mhgu.db');
const POLICY_PATH = path.join(ROOT, 'data', 'hunt', 'mhgu-monster-policy.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'mhgu-monsters.generated.json');
const SOURCE_URL = 'https://github.com/JoeLago/MHGUDB-iOS';

function readPolicy() {
    return JSON.parse(fs.readFileSync(POLICY_PATH, 'utf8'));
}

function loadReference(dbPath = DEFAULT_DB, policy = readPolicy()) {
    if (!fs.existsSync(dbPath)) throw new Error(`MHGU reference database not found: ${dbPath}`);
    const db = new DatabaseSync(dbPath, { readOnly: true });
    try {
        const habitats = new Map();
        for (const row of db.prepare(`
            SELECT mh.monster_id AS monsterId, l._id AS locationId, l.name AS location
            FROM monster_habitat mh JOIN locations l ON l._id = mh.location_id
            ORDER BY mh.monster_id, l._id
        `).all()) {
            if (!habitats.has(row.monsterId)) habitats.set(row.monsterId, []);
            habitats.get(row.monsterId).push({ id: row.locationId, name: row.location });
        }
        const weaknesses = new Map();
        for (const row of db.prepare(`
            SELECT monster_id AS monsterId, state, fire, water, thunder, ice, dragon,
                   poison, paralysis, sleep, pitfall_trap AS pitfallTrap,
                   shock_trap AS shockTrap, flash_bomb AS flashBomb
            FROM monster_weakness ORDER BY monster_id, _id
        `).all()) {
            if (!weaknesses.has(row.monsterId)) weaknesses.set(row.monsterId, []);
            weaknesses.get(row.monsterId).push(row);
        }
        const parts = new Map();
        for (const row of db.prepare(`
            SELECT monster_id AS monsterId, body_part AS bodyPart, cut, impact, shot,
                   fire, water, ice, thunder, dragon, ko
            FROM monster_damage ORDER BY monster_id, _id
        `).all()) {
            if (!parts.has(row.monsterId)) parts.set(row.monsterId, []);
            parts.get(row.monsterId).push(row);
        }
        const statuses = new Map();
        for (const row of db.prepare(`
            SELECT monster_id AS monsterId, status, initial, increase, max, duration, damage
            FROM monster_status ORDER BY monster_id, _id
        `).all()) {
            if (!statuses.has(row.monsterId)) statuses.set(row.monsterId, []);
            statuses.get(row.monsterId).push(row);
        }
        return db.prepare(`
            SELECT _id AS sourceId, class AS monsterClass, name AS nameEN,
                   base_hp AS baseHealth, icon_name AS iconName
            FROM monsters ORDER BY _id
        `).all().map(row => ({
            ...row,
            sourceId: String(row.sourceId),
            nameKO: policy.displayNamesKO[row.nameEN] || null,
            kind: row.monsterClass === '1' ? 'small' : 'large',
            variantOf: policy.variantOf[row.nameEN] || null,
            locations: habitats.get(Number(row.sourceId)) || [],
            weaknesses: weaknesses.get(Number(row.sourceId)) || [],
            parts: parts.get(Number(row.sourceId)) || [],
            statuses: statuses.get(Number(row.sourceId)) || [],
            sourceUrl: 'https://mhgu.kiranico.com/monster',
            evidence: 'mhgudb-sqlite-monster-anatomy-and-habitat'
        }));
    } finally {
        db.close();
    }
}

function importReference(options = {}) {
    const dbPath = options.dbPath || DEFAULT_DB;
    const outputPath = options.outputPath || OUTPUT_PATH;
    const policy = options.policy || readPolicy();
    const monsters = loadReference(dbPath, policy);
    const snapshot = {
        version: 1,
        game: 'generations-ultimate',
        generatedAt: new Date().toISOString(),
        source: {
            title: 'MHGUDB for iOS',
            url: SOURCE_URL,
            license: 'MIT',
            databasePath: 'MHGUDB/Assets/databases/mhgu.db'
        },
        counts: {
            monsters: monsters.length,
            small: monsters.filter(row => row.kind === 'small').length,
            large: monsters.filter(row => row.kind !== 'small').length,
            habitats: monsters.reduce((sum, row) => sum + row.locations.length, 0),
            parts: monsters.reduce((sum, row) => sum + row.parts.length, 0),
            statuses: monsters.reduce((sum, row) => sum + row.statuses.length, 0)
        },
        monsters
    };
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    return snapshot;
}

if (require.main === module) {
    try {
        const snapshot = importReference();
        console.log(JSON.stringify(snapshot.counts, null, 2));
    } catch (error) {
        console.error(`[mhgu-reference] ${error.stack || error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { loadReference, importReference };
