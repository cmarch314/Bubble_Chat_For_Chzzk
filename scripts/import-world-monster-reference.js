#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE_PATH = path.join(ROOT, 'game_extracts', 'web', 'mhw-db', 'monsters.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'world-monsters.generated.json');
const SOURCE_URL = 'https://mhw-db.com/monsters';

function compact(rows) {
    return (rows || []).map(row => ({
        sourceId: String(row.id),
        nameEN: row.name,
        kind: row.type,
        species: row.species || null,
        elements: row.elements || [],
        ailments: (row.ailments || []).map(ailment => ailment.name).filter(Boolean),
        locations: (row.locations || []).map(location => location.name).filter(Boolean),
        sourceUrl: `${SOURCE_URL}/${row.id}`,
        evidence: 'mhw-db-game-reference'
    }));
}

async function importReference(options = {}) {
    const cachePath = options.cachePath || CACHE_PATH;
    let raw;
    if (!options.refresh && fs.existsSync(cachePath)) {
        raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    } else {
        const response = await fetch(SOURCE_URL, { headers: { 'user-agent': 'BubbleChat evidence importer/1.0' } });
        if (!response.ok) throw new Error(`${SOURCE_URL}: HTTP ${response.status}`);
        raw = await response.json();
        fs.mkdirSync(path.dirname(cachePath), { recursive: true });
        fs.writeFileSync(cachePath, `${JSON.stringify(raw)}\n`, 'utf8');
    }
    const monsters = compact(raw);
    const output = {
        version: 1,
        generatedAt: new Date().toISOString(),
        source: {
            title: 'Monster Hunter World Database API',
            url: 'https://docs.mhw-db.com/',
            license: 'MIT',
            repository: 'https://github.com/LartTyler/MHWDB-API'
        },
        counts: {
            monsters: monsters.length,
            small: monsters.filter(monster => monster.kind === 'small').length,
            large: monsters.filter(monster => monster.kind !== 'small').length,
            species: new Set(monsters.map(monster => monster.species).filter(Boolean)).size
        },
        monsters
    };
    fs.writeFileSync(options.outputPath || OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
    return output;
}

if (require.main === module) {
    importReference({ refresh: process.argv.includes('--refresh') })
        .then(output => console.log(JSON.stringify(output.counts, null, 2)))
        .catch(error => { console.error(`[world-monster-reference] ${error.stack || error.message}`); process.exitCode = 1; });
}

module.exports = { compact, importReference };
