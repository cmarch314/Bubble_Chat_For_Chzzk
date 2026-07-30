'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { generate, SERIES_SEALS } = require('../scripts/generate-wilds-weapon-progression');

const dbPath = path.join(__dirname, '..', 'game_extracts', 'catalogs', 'mh-wilds.sqlite');
if (!fs.existsSync(dbPath)) {
    console.log('[test] Wilds progression DB is private and unavailable; generator integration skipped.');
    process.exit(0);
}
const outputPath = path.join(os.tmpdir(), `wilds-progression-${process.pid}.js`);
const { entries } = generate({ dbPath, outputPath });
assert.strictEqual(entries.length, 1188);
assert.strictEqual(new Set(entries.map(item => item.kind)).size, 14);
assert.strictEqual(new Set(entries.map(item => item.seriesName)).size, Object.keys(SERIES_SEALS).length);
for (const kind of new Set(entries.map(item => item.kind))) {
    assert(entries.some(item => item.kind === kind && item.starterStyle === 'iron'), `${kind}: missing iron starter`);
    assert(entries.some(item => item.kind === kind && item.starterStyle === 'bone'), `${kind}: missing bone starter`);
}
assert(entries.every(item => item.nameKo && item.evidence && item.seal));
assert(entries.some(item => item.sharpness && Object.keys(item.sharpness).length));
fs.unlinkSync(outputPath);
console.log('[test] 1,188-node Wilds progression runtime contract passed.');
