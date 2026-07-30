#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const REPO = path.join(ROOT, 'game_extracts', 'reference-repos', 'MHGUDB-iOS');
const SOURCE_ROOT = path.join(REPO, 'MHGUDB', 'Assets', 'icons');
const REFERENCE = path.join(ROOT, 'data', 'hunt', 'mhgu-monsters.generated.json');
const OUTPUT_ROOT = path.join(ROOT, 'local_assets', 'monster_hunter', 'reference-icons', 'mhgu');
const MANIFEST = path.join(OUTPUT_ROOT, 'manifest.json');
const SOURCE_URL = 'https://github.com/JoeLago/MHGUDB-iOS';

function sha256(bytes) {
    return crypto.createHash('sha256').update(bytes).digest('hex');
}

function harvest(options = {}) {
    const sourceRoot = options.sourceRoot || SOURCE_ROOT;
    const outputRoot = options.outputRoot || OUTPUT_ROOT;
    const referencePath = options.referencePath || REFERENCE;
    const reference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
    const records = {};
    fs.mkdirSync(path.join(outputRoot, 'monster'), { recursive: true });
    for (const row of reference.monsters) {
        const filename = `${row.iconName}.png`;
        const sourcePath = path.join(sourceRoot, filename);
        if (!fs.existsSync(sourcePath)) {
            records[`monster:${row.sourceId}`] = {
                game: 'generations-ultimate', mediaKind: 'monster-icon', sourceId: row.sourceId,
                nameEn: row.nameEN, nameKo: row.nameKO, sourceUrl: SOURCE_URL,
                pageUrl: row.sourceUrl, status: 'unavailable',
                evidence: 'mhgudb-icon-name-with-missing-source-file'
            };
            continue;
        }
        const bytes = fs.readFileSync(sourcePath);
        const localPath = `monster/${filename}`;
        fs.copyFileSync(sourcePath, path.join(outputRoot, localPath));
        records[`monster:${row.sourceId}`] = {
            game: 'generations-ultimate', mediaKind: 'monster-icon', sourceId: row.sourceId,
            nameEn: row.nameEN, nameKo: row.nameKO, monsterCode: row.iconName,
            sourceUrl: SOURCE_URL, pageUrl: row.sourceUrl, localPath,
            bytes: bytes.length, sha256: sha256(bytes), status: 'downloaded',
            license: 'MIT', evidence: 'mhgudb-database-icon-name-and-repository-asset'
        };
    }
    const manifest = {
        version: 1,
        generatedAt: new Date().toISOString(),
        source: { title: 'MHGUDB for iOS', url: SOURCE_URL, license: 'MIT' },
        records
    };
    fs.writeFileSync(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    return manifest;
}

if (require.main === module) {
    try {
        const manifest = harvest();
        const rows = Object.values(manifest.records);
        console.log(JSON.stringify({
            records: rows.length,
            downloaded: rows.filter(row => row.status === 'downloaded').length,
            unavailable: rows.filter(row => row.status === 'unavailable').length
        }, null, 2));
    } catch (error) {
        console.error(`[mhgu-icons] ${error.stack || error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { harvest };
