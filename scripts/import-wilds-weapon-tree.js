#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const arg = name => process.argv.find(value => value.startsWith(`--${name}=`))?.slice(name.length + 3);
const sourceRoot = path.resolve(arg('source') || path.join(ROOT, 'game_extracts', 'tools', 'mhdb-wilds-data', 'output', 'merged'));
const dbPath = path.resolve(arg('db') || path.join(ROOT, 'game_extracts', 'catalogs', 'mh-wilds.sqlite'));
const EVIDENCE = 'installed-game-files-via-mhdb-extractor';

function load(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function json(value) { return JSON.stringify(value ?? null); }
function localized(record, locale) { return record?.names?.[locale] || null; }
function digest(files) {
    const hash = crypto.createHash('sha256');
    for (const file of files) hash.update(path.basename(file)).update(fs.readFileSync(file));
    return hash.digest('hex');
}

function discoverWeaponFiles(root) {
    const directory = path.join(root, 'weapons');
    return fs.readdirSync(directory).filter(name => name.endsWith('.json')).sort().map(name => path.join(directory, name)).filter(file => {
        const records = load(file);
        return Array.isArray(records) && records.length > 0 && records.every(row => row && typeof row.game_id === 'number' && typeof row.kind === 'string' && row.crafting);
    });
}

function importTree(options = {}) {
    const source = path.resolve(options.sourceRoot || sourceRoot);
    const destination = path.resolve(options.dbPath || dbPath);
    const weaponFiles = discoverWeaponFiles(source);
    const seriesFile = path.join(source, 'WeaponSeries.json');
    const itemFile = path.join(source, 'Item.json');
    const series = load(seriesFile);
    const items = load(itemFile);
    const weapons = weaponFiles.flatMap(load);
    const keys = new Set(weapons.map(row => `${row.kind}:${row.game_id}`));
    if (weaponFiles.length !== 14) throw new Error(`Expected 14 weapon classes, found ${weaponFiles.length}`);
    for (const weapon of weapons) {
        const crafting = weapon.crafting || {};
        if (crafting.previous_id != null && !keys.has(`${weapon.kind}:${crafting.previous_id}`)) throw new Error(`Missing parent ${weapon.kind}:${crafting.previous_id}`);
        for (const child of crafting.branches || []) if (!keys.has(`${weapon.kind}:${child}`)) throw new Error(`Missing branch ${weapon.kind}:${child}`);
    }

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const db = new DatabaseSync(destination);
    db.exec(`
        PRAGMA foreign_keys=ON;
        CREATE TABLE IF NOT EXISTS weapon_tree_series (
            series_id INTEGER PRIMARY KEY, name_ko TEXT, name_en TEXT, names_json TEXT NOT NULL,
            source_path TEXT NOT NULL, evidence TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS weapon_tree_nodes (
            weapon_key TEXT PRIMARY KEY, game_id INTEGER NOT NULL, kind TEXT NOT NULL,
            name_ko TEXT, name_en TEXT NOT NULL, description_ko TEXT, rarity INTEGER NOT NULL,
            attack_raw REAL, affinity REAL, defense REAL, series_id INTEGER,
            previous_key TEXT, zenny_cost INTEGER, is_shortcut INTEGER NOT NULL,
            tree_row INTEGER, tree_column INTEGER, sharpness_json TEXT, handicraft_json TEXT,
            specials_json TEXT, slots_json TEXT, skills_json TEXT, source_path TEXT NOT NULL,
            evidence TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_weapon_tree_kind ON weapon_tree_nodes(kind, rarity);
        CREATE INDEX IF NOT EXISTS idx_weapon_tree_series ON weapon_tree_nodes(series_id);
        CREATE TABLE IF NOT EXISTS weapon_tree_edges (
            parent_key TEXT NOT NULL, child_key TEXT NOT NULL, edge_kind TEXT NOT NULL,
            evidence TEXT NOT NULL, PRIMARY KEY(parent_key, child_key)
        );
        CREATE TABLE IF NOT EXISTS weapon_tree_materials (
            weapon_key TEXT NOT NULL, item_game_id INTEGER NOT NULL, quantity INTEGER NOT NULL,
            item_name_ko TEXT, item_name_en TEXT, evidence TEXT NOT NULL,
            PRIMARY KEY(weapon_key, item_game_id)
        );
        CREATE TABLE IF NOT EXISTS weapon_media_evidence (
            media_path TEXT PRIMARY KEY, media_kind TEXT NOT NULL, weapon_key TEXT,
            item_game_id INTEGER, confidence TEXT NOT NULL DEFAULT 'unresolved',
            evidence TEXT NOT NULL, converted_path TEXT, sha256 TEXT
        );
        CREATE TABLE IF NOT EXISTS weapon_tree_imports (
            source_hash TEXT PRIMARY KEY, imported_at TEXT NOT NULL, weapon_count INTEGER NOT NULL,
            edge_count INTEGER NOT NULL, material_count INTEGER NOT NULL, source_root TEXT NOT NULL
        );
    `);
    const itemById = new Map(items.map(item => [String(item.game_id), item]));
    db.exec('BEGIN IMMEDIATE');
    try {
        db.exec('DELETE FROM weapon_tree_materials; DELETE FROM weapon_tree_edges; DELETE FROM weapon_tree_nodes; DELETE FROM weapon_tree_series;');
        const addSeries = db.prepare('INSERT INTO weapon_tree_series VALUES (?, ?, ?, ?, ?, ?)');
        for (const row of series) addSeries.run(row.game_id, localized(row, 'ko'), localized(row, 'en'), json(row.names), path.relative(ROOT, seriesFile), EVIDENCE);
        const addNode = db.prepare('INSERT INTO weapon_tree_nodes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        const addEdge = db.prepare('INSERT OR IGNORE INTO weapon_tree_edges VALUES (?, ?, ?, ?)');
        const addMaterial = db.prepare('INSERT INTO weapon_tree_materials VALUES (?, ?, ?, ?, ?, ?)');
        for (const row of weapons) {
            const key = `${row.kind}:${row.game_id}`;
            const crafting = row.crafting || {};
            const previousKey = crafting.previous_id == null ? null : `${row.kind}:${crafting.previous_id}`;
            addNode.run(key, row.game_id, row.kind, localized(row, 'ko'), localized(row, 'en') || key,
                row.descriptions?.ko || null, row.rarity, row.attack_raw, row.affinity, row.defense, row.series_id,
                previousKey, crafting.zenny_cost ?? null, crafting.is_shortcut ? 1 : 0, crafting.row, crafting.column,
                json(row.sharpness), json(row.handicraft), json(row.specials), json(row.slots), json(row.skills),
                path.relative(ROOT, weaponFiles.find(file => path.basename(file, '.json').toLowerCase().replace(/[^a-z]/g, '') === row.kind.replace(/[^a-z]/g, '')) || source), EVIDENCE);
            if (previousKey) addEdge.run(previousKey, key, 'upgrade', EVIDENCE);
            for (const [itemId, quantity] of Object.entries(crafting.inputs || {})) {
                const item = itemById.get(String(itemId));
                addMaterial.run(key, Number(itemId), Number(quantity), localized(item, 'ko'), localized(item, 'en'), EVIDENCE);
            }
        }
        db.exec('COMMIT');
    } catch (error) {
        db.exec('ROLLBACK');
        db.close();
        throw error;
    }
    const sourceHash = digest([...weaponFiles, seriesFile, itemFile]);
    const counts = {
        weapons: weapons.length,
        edges: db.prepare('SELECT count(*) count FROM weapon_tree_edges').get().count,
        materials: db.prepare('SELECT count(*) count FROM weapon_tree_materials').get().count,
        series: series.length,
        classes: weaponFiles.length
    };
    db.prepare('INSERT OR REPLACE INTO weapon_tree_imports VALUES (?, ?, ?, ?, ?, ?)').run(sourceHash, new Date().toISOString(), counts.weapons, counts.edges, counts.materials, path.relative(ROOT, source));
    db.close();
    return { ...counts, sourceHash, dbPath: destination };
}

if (require.main === module) {
    try { console.log(JSON.stringify(importTree(), null, 2)); }
    catch (error) { console.error(`[wilds-weapon-tree] ${error.message}`); process.exitCode = 1; }
}

module.exports = { discoverWeaponFiles, importTree };
