'use strict';

// Regenerates data/hunt/released-monster-pattern-baseline.json — the Phase 0
// fingerprint guard consumed by tests/hunt-released-monster-baseline.test.js.
//
// The baseline is a fail-closed guard: any change to a reviewed monster's
// runtime patterns changes its SHA-256 and turns the test red on purpose so the
// change is reviewed rather than slipping in silently. Once a pattern edit is
// intentional, run this script to accept the new fingerprints:
//
//   npm run generate:monster-baseline           # rewrite the JSON in place
//   npm run generate:monster-baseline -- --check # report drift, write nothing
//
// The catalog build here mirrors the test exactly; keep them in lockstep.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

global.window = global;
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
require('../js/effects/hunt/data/WildsMonsterBehavior.generated.js');
require('../js/effects/hunt/data/RiseMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldShellBehavior.generated.js');
require('../js/effects/hunt/data/MhxxMonsterBehavior.generated.js');
require('../js/effects/hunt/data/MhxxDbMonsterBehavior.generated.js');
require('../js/effects/hunt/data/PublishedMonsterBehavior.js');
require('../js/effects/MonsterData.js');

const PatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const ReleasePolicy = require('../js/effects/hunt/HuntMonsterReleasePolicy.js');

const BASELINE_PATH = path.join(__dirname, '..', 'data', 'hunt', 'released-monster-pattern-baseline.json');

function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
}

function buildRecords() {
    const releasedIds = ReleasePolicy.REVIEWED.map(record => record.id);
    const monsters = global.MONSTER_DATA.filter(monster => releasedIds.includes(monster.id));
    const catalog = PatternCatalog.build({}, monsters);
    return releasedIds.map(id => {
        const patterns = catalog[id] || [];
        const sha256 = crypto.createHash('sha256')
            .update(JSON.stringify(canonical(patterns)))
            .digest('hex');
        return { id, count: patterns.length, sha256 };
    });
}

const existing = fs.existsSync(BASELINE_PATH)
    ? JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
    : { version: 2, purpose: '', records: [] };

const records = buildRecords();
const before = new Map((existing.records || []).map(record => [record.id, record]));
const drift = records.filter(record => {
    const prior = before.get(record.id);
    return !prior || prior.sha256 !== record.sha256 || prior.count !== record.count;
});
const added = records.filter(record => !before.has(record.id));

const checkOnly = process.argv.includes('--check');
if (checkOnly) {
    if (!drift.length) {
        console.log('[baseline] up to date — no reviewed monster fingerprints changed.');
        process.exit(0);
    }
    console.error(`[baseline] ${drift.length} monster(s) drifted from the committed baseline:`);
    for (const record of drift) {
        const prior = before.get(record.id);
        console.error(prior
            ? `  - ${record.id}: ${prior.sha256.slice(0, 12)}… → ${record.sha256.slice(0, 12)}… (count ${prior.count} → ${record.count})`
            : `  - ${record.id}: NEW (${record.count} patterns)`);
    }
    console.error('Run "npm run generate:monster-baseline" to accept these changes intentionally.');
    process.exit(1);
}

// Preserve the committed formatting: one compact object per record so an
// accepted change shows only the handful of hashes that actually moved.
const recordLines = records
    .map(record => `    { "id": ${JSON.stringify(record.id)}, "count": ${record.count}, "sha256": ${JSON.stringify(record.sha256)} }`)
    .join(',\n');
const serialized = [
    '{',
    `  "version": ${JSON.stringify(existing.version || 2)},`,
    `  "purpose": ${JSON.stringify(existing.purpose || '')},`,
    '  "records": [',
    recordLines,
    '  ]',
    '}',
    ''
].join('\n');
fs.writeFileSync(BASELINE_PATH, serialized);

if (!drift.length) {
    console.log(`[baseline] rewrote ${records.length} fingerprints (no changes).`);
} else {
    console.log(`[baseline] rewrote ${records.length} fingerprints; ${drift.length} changed${added.length ? `, ${added.length} new` : ''}:`);
    for (const record of drift) {
        const prior = before.get(record.id);
        console.log(prior
            ? `  - ${record.id}: refreshed (count ${prior.count} → ${record.count})`
            : `  - ${record.id}: added (${record.count} patterns)`);
    }
}
