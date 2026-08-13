const assert = require('assert');
const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');

const migrated = HuntMonsterPatternCatalog.synchronizeMotionTiming({
    id: 'fixture.migrated',
    motion: [{ beat: 'prepare', ticks: 2 }, { beat: 'impact', ticks: 2, hit: true }]
});
assert.strictEqual(migrated.reviewStatus, 'migrated');
assert.strictEqual(migrated.beatV2Enabled, true);
assert.strictEqual(migrated.beatV2Approved, false,
    'a normalizer must not promote unreviewed legacy motion to approved');
assert.strictEqual(migrated.beatV2.reviewStatus, 'migrated');

const approved = HuntMonsterPatternCatalog.synchronizeMotionTiming({
    id: 'fixture.approved',
    beatV2Approved: true,
    motion: [{ beat: 'prepare', ticks: 2 }, { beat: 'impact', ticks: 2, hit: true }]
});
assert.strictEqual(approved.reviewStatus, 'approved');
assert.strictEqual(approved.beatV2Enabled, true);
assert.strictEqual(approved.beatV2Approved, true);
assert.strictEqual(approved.beatV2.reviewStatus, 'approved');

const draft = HuntMonsterPatternCatalog.synchronizeGeneratedKeyframeMotion({
    id: 'fixture.draft', reviewStatus: 'draft', animationDurationMs: 300
});
assert.strictEqual(draft.reviewStatus, 'draft');
assert.strictEqual(draft.beatV2Enabled, true);
assert.strictEqual(draft.beatV2Approved, false);

console.log('[test] BEAT review status separates enabled migration from human approval.');
