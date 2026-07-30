'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { importReference } = require('../scripts/import-mhgu-monster-reference');
const { harvest } = require('../scripts/harvest-mhgu-monster-icons');

const root = path.resolve(__dirname, '..');
const dbPath = path.join(root, 'game_extracts', 'reference-repos', 'MHGUDB-iOS', 'MHGUDB', 'Assets', 'databases', 'mhgu.db');
const iconRoot = path.join(root, 'game_extracts', 'reference-repos', 'MHGUDB-iOS', 'MHGUDB', 'Assets', 'icons');

if (fs.existsSync(dbPath)) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-mhgu-'));
    const referencePath = path.join(temp, 'mhgu.json');
    const snapshot = importReference({ dbPath, outputPath: referencePath });
    assert.strictEqual(snapshot.monsters.length, 129);
    assert.strictEqual(snapshot.counts.small, 36);
    assert.strictEqual(snapshot.counts.large, 93);
    assert.strictEqual(snapshot.counts.habitats, 303);
    assert.strictEqual(snapshot.counts.parts, 893);
    const ahtal = snapshot.monsters.find(row => row.nameEN === 'Ahtal-Ka');
    assert.strictEqual(ahtal.nameKO, '아트랄 카');
    assert.ok(ahtal.parts.length > 0);
    assert.ok(ahtal.statuses.length > 0);

    const manifest = harvest({ sourceRoot: iconRoot, outputRoot: path.join(temp, 'icons'), referencePath });
    const records = Object.values(manifest.records);
    assert.strictEqual(records.length, 129);
    assert.ok(records.every(row => row.status === 'downloaded'));
    assert.ok(records.every(row => row.sha256 && row.bytes > 0));
}

console.log('[test] resumable MHGU SQLite reference and icon import passed.');
