#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const ROOT = path.resolve(__dirname, '..');
const source = path.join(ROOT, 'game_extracts', 'tools', 'MonsterHunterWildsModding', 'files', 'MHWs.list');
const output = path.join(ROOT, 'game_extracts', 'wilds', 'weapon-media-inventory.json');
const dbPath = path.join(ROOT, 'game_extracts', 'catalogs', 'mh-wilds.sqlite');

function classify(file) {
    if (/^natives\/STM\/GUI\/ui_texture\//i.test(file) && /\.tex\./i.test(file)) return 'ui-texture-candidate';
    if (/^natives\/STM\/GUI\//i.test(file) && /\.gui\./i.test(file)) return 'ui-layout-evidence';
    return null;
}

function inventory() {
    const records = fs.readFileSync(source, 'utf8').split(/\r?\n/).filter(Boolean).map(mediaPath => ({ mediaPath, mediaKind: classify(mediaPath) })).filter(row => row.mediaKind);
    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        source: path.relative(ROOT, source),
        policy: 'Inventory only. A texture is not assigned to a weapon until GUI/resource evidence resolves its semantic identity.',
        counts: Object.fromEntries([...new Set(records.map(row => row.mediaKind))].map(kind => [kind, records.filter(row => row.mediaKind === kind).length])),
        records
    };
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    if (fs.existsSync(dbPath)) {
        const db = new DatabaseSync(dbPath);
        const add = db.prepare('INSERT OR IGNORE INTO weapon_media_evidence(media_path, media_kind, confidence, evidence) VALUES (?, ?, ?, ?)');
        db.exec('BEGIN IMMEDIATE');
        try {
            for (const row of records) add.run(row.mediaPath, row.mediaKind, 'unresolved', 'installed-archive-path-inventory');
            db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); db.close(); throw error; }
        db.close();
    }
    return { ...payload.counts, total: records.length, sha256: crypto.createHash('sha256').update(records.map(row => row.mediaPath).join('\n')).digest('hex'), output };
}

if (require.main === module) console.log(JSON.stringify(inventory(), null, 2));
module.exports = { classify, inventory };
