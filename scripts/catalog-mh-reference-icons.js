#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const mediaRoot = path.join(ROOT, 'local_assets', 'monster_hunter', 'reference-icons');
const sources = ['rise', 'wilds', 'mhgu']
    .map(collection => ({ collection, root: path.join(mediaRoot, collection), manifestPath: path.join(mediaRoot, collection, 'manifest.json') }))
    .filter(source => fs.existsSync(source.manifestPath));
const dbPath = path.join(ROOT, 'game_extracts', 'catalogs', 'mh-wilds.sqlite');
const AUDIT_ONLY = process.argv.includes('--audit-only');
function hash(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }

function catalog() {
    const rows = sources.flatMap(source => {
        const manifest = JSON.parse(fs.readFileSync(source.manifestPath, 'utf8'));
        return Object.entries(manifest.records || {}).map(([key, row]) => [key, row, source]);
    });
    const counts = { downloaded: 0, unavailable: 0, missing: 0, hashMismatch: 0, bytes: 0 };
    for (const [, row, source] of rows) {
        if (row.status === 'unavailable') { counts.unavailable += 1; continue; }
        if (!row.localPath) { counts.missing += 1; continue; }
        const file = path.join(source.root, row.localPath);
        if (!fs.existsSync(file)) { counts.missing += 1; continue; }
        const bytes = fs.readFileSync(file);
        counts.downloaded += 1; counts.bytes += bytes.length;
        if (bytes.length !== row.bytes || hash(bytes) !== row.sha256) counts.hashMismatch += 1;
    }
    if (counts.missing || counts.hashMismatch) throw new Error(`Reference icon audit failed: ${counts.missing} missing, ${counts.hashMismatch} hash mismatches`);
    if (!AUDIT_ONLY) {
        const db = new DatabaseSync(dbPath);
        db.exec(`CREATE TABLE IF NOT EXISTS reference_media (
            game TEXT NOT NULL, media_kind TEXT NOT NULL, source_id TEXT NOT NULL, variant TEXT NOT NULL DEFAULT '',
            name_ja TEXT, source_url TEXT NOT NULL, page_url TEXT, local_path TEXT,
            name_en TEXT, name_ko TEXT, monster_code TEXT,
            byte_length INTEGER, sha256 TEXT, status TEXT NOT NULL, evidence TEXT NOT NULL,
            PRIMARY KEY(game, media_kind, source_id, variant)
        ); CREATE INDEX IF NOT EXISTS idx_reference_media_lookup ON reference_media(game, media_kind, status);`);
        const columns = new Set(db.prepare('PRAGMA table_info(reference_media)').all().map(row => row.name));
        for (const [name, type] of [['name_en', 'TEXT'], ['name_ko', 'TEXT'], ['monster_code', 'TEXT']]) {
            if (!columns.has(name)) db.exec(`ALTER TABLE reference_media ADD COLUMN ${name} ${type}`);
        }
        const add = db.prepare(`INSERT OR REPLACE INTO reference_media
            (game,media_kind,source_id,variant,name_ja,name_en,name_ko,monster_code,source_url,page_url,local_path,byte_length,sha256,status,evidence)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
        db.exec('BEGIN IMMEDIATE');
        try {
            for (const [, row, source] of rows) add.run(
                row.game, row.mediaKind, row.sourceId, row.variant || '', row.nameJa || null,
                row.nameEn || null, row.nameKo || null, row.monsterCode || null,
                row.sourceUrl, row.pageUrl || null,
                row.localPath ? `${source.collection}/${row.localPath}` : null,
                row.bytes || null, row.sha256 || null, row.status || 'downloaded', row.evidence
            );
            db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
        db.close();
    }
    return { records: rows.length, ...counts, dbImported: !AUDIT_ONLY };
}

if (require.main === module) {
    try { console.log(JSON.stringify(catalog(), null, 2)); }
    catch (error) { console.error(`[mh-icons] ${error.message}`); process.exitCode = 1; }
}
module.exports = { catalog };
