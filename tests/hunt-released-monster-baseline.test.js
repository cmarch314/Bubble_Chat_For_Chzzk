'use strict';

const assert = require('assert');
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
const baseline = require('../data/hunt/released-monster-pattern-baseline.json');

function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
}

const releasedIds = ReleasePolicy.REVIEWED.map(record => record.id);
assert.deepStrictEqual(baseline.records.map(record => record.id), releasedIds);
const monsters = global.MONSTER_DATA.filter(monster => releasedIds.includes(monster.id));
const catalog = PatternCatalog.build({}, monsters);
for (const expected of baseline.records) {
    const patterns = catalog[expected.id] || [];
    const release = ReleasePolicy.reviewRecord(expected.id);
    const authoredEditions = [...new Set(patterns
        .map(pattern => String(pattern.sourceGame || '').replace(/_/g, '-'))
        .filter(Boolean))];
    const sha256 = crypto.createHash('sha256')
        .update(JSON.stringify(canonical(patterns)))
        .digest('hex');
    assert.strictEqual(patterns.length, expected.count, `${expected.id} pattern count changed`);
    assert.deepStrictEqual(
        authoredEditions,
        [release.canonicalEdition],
        `${expected.id} runtime patterns must match its reviewed canonical edition`
    );
    assert.strictEqual(
        sha256,
        expected.sha256,
        `${expected.id} reviewed behavior changed; review and intentionally refresh the Phase 0 baseline`
    );
}

console.log(`[test] ${baseline.records.length} released monster behavior fingerprints are stable.`);
