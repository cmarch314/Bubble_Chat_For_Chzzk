'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    PRESETS,
    evidenceScope,
    groupEvents,
    normalizeStoredLabels,
    normalizeTags,
    orderedSources,
    reviewStatusForGraphId,
    saveReviewCompletion,
    saveGroupReview
} = require('../tools/monster-audio-review-server');

const reviewUi = fs.readFileSync(path.join(__dirname, '..', 'tools', 'monster-audio-review.html'), 'utf8');
assert.match(reviewUi, /\['미완료',[\s\S]*\['검수 완료'/,
    'monster dropdown must separate pending and completed reviews');
assert.match(reviewUi, /document\.createElement\('optgroup'\)/,
    'review status sections must use accessible native optgroups');

const event = {
    chunk: 'chunkG0',
    bank: 'em001_vo',
    eventId: 123,
    structures: ['random', 'layer'],
    sourceIds: [10, 11, 12],
    variants: [{
        variant: 'event-a',
        structure: ['random'],
        decodedClips: [
            { sourceId: 10, stream: 1, path: 'local_assets/monster_hunter/world/monster/em001/a.mp3' },
            { sourceId: 11, stream: 2, path: 'local_assets/monster_hunter/world/monster/em001/b.mp3' }
        ]
    }]
};
const aliases = [{
    chunk: 'chunkG0',
    bank: 'em001_vo',
    sourceId: 12,
    canonicalPath: 'local_assets/monster_hunter/world/monster/em001/c.mp3'
}];

assert.deepStrictEqual(orderedSources(event, aliases).map(source => source.sourceId), [10, 11, 12]);
assert.deepStrictEqual(normalizeTags('roar'), ['monster_roar']);
assert.deepStrictEqual(normalizeTags('wingFlap'), ['wing_flap']);
assert.deepStrictEqual(normalizeTags('custom', '날개짓, 브레스적중'), ['wing_flap', 'breath_impact']);
assert.deepStrictEqual(normalizeTags('custom', 'bite_vocal, attack_vocal, bite_vocal'), ['bite_vocal', 'attack_vocal']);
assert.strictEqual(PRESETS.physical.label, '물리공격');
assert.deepStrictEqual(evidenceScope('em024_se'), {
    sourceLayer: 'sound-effect',
    reuseScope: 'cross-title-semantic'
});
assert.deepStrictEqual(evidenceScope('em024_vo'), {
    sourceLayer: 'voice',
    reuseScope: 'monster-identity'
});
assert.strictEqual(reviewStatusForGraphId('em011', {
    completedMonsterIds: ['kirin']
}, { em011_vo: ['kirin'] }), 'completed');
assert.strictEqual(reviewStatusForGraphId('em023', {
    silentVoiceMonsterIds: ['rajang']
}, { em023_vo: ['rajang'] }), 'silent-voice');

const grouped = groupEvents({
    events: [event],
    deduplication: { aliases }
}, {
    records: [
        { bank: 'em001_vo', eventId: 123, sourceId: 10, tags: ['monster_roar'] },
        { bank: 'em001_vo', eventId: 123, sourceId: 11, tags: ['monster_roar'] },
        { bank: 'em001_vo', eventId: 123, sourceId: 12, tags: ['monster_roar'] }
    ]
});
assert.strictEqual(grouped.length, 1);
assert.deepStrictEqual(grouped[0].structures, ['random', 'layer']);
assert.deepStrictEqual(grouped[0].groupTags, ['monster_roar']);

const nonBaseChunkEvent = { ...event, chunk: 'chunkG3', eventId: 124 };
const groupedFromInstalledChunk = groupEvents({
    events: [nonBaseChunkEvent],
    deduplication: { aliases: [] }
}, { records: [] });
assert.strictEqual(groupedFromInstalledChunk.length, 1,
    'World monster review must include installed banks outside chunkG0');

const groupedWithoutSilentSource = groupEvents({
    events: [event],
    deduplication: { aliases }
}, {
    excludedSourceIds: [11],
    records: []
});
assert.deepStrictEqual(groupedWithoutSilentSource[0].sources.map(source => source.sourceId), [10, 12]);

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-audio-review-'));
const labelsPath = path.join(temporaryRoot, 'labels.json');
fs.writeFileSync(labelsPath, JSON.stringify({
    version: 1,
    records: [{
        bank: 'em001_vo',
        eventId: 123,
        sourceId: 12,
        tags: ['individual_exception'],
        verdict: '확정',
        reviewMethod: 'individual-audition'
    }]
}));
const saved = saveGroupReview({
    monster: 'em001',
    bank: 'em001_vo',
    eventId: 123,
    sourceIds: [10, 11, 12],
    category: 'breath'
}, labelsPath);
assert.deepStrictEqual(saved, { tags: ['breath'], savedSources: 2 });
let labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.strictEqual(labels.records.length, 3);
assert.ok(labels.records.every(record => record.verdict === '확정'));
assert.strictEqual(labels.records.find(record => record.sourceId === 12).tags[0], 'individual_exception');
assert.ok(labels.records.filter(record => record.sourceId !== 12)
    .every(record => record.reuseScope === 'monster-identity'));

saveGroupReview({
    monster: 'em001',
    bank: 'em001_vo',
    eventId: 123,
    sourceIds: [10, 11, 12],
    category: 'clear'
}, labelsPath);
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.strictEqual(labels.records.length, 1);
assert.strictEqual(labels.records[0].reviewMethod, 'individual-audition');

const completion = saveReviewCompletion(
    { monster: 'em001', completed: true },
    labelsPath,
    { em001_vo: ['rathian', 'rathalos'] }
);
assert.deepStrictEqual(completion, {
    monster: 'em001',
    monsterIds: ['rathian', 'rathalos'],
    reviewStatus: 'completed'
});
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.deepStrictEqual(labels.runtimePolicy.completedMonsterIds, ['rathalos', 'rathian']);
saveReviewCompletion(
    { monster: 'em001', completed: false },
    labelsPath,
    { em001_vo: ['rathian', 'rathalos'] }
);
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.deepStrictEqual(labels.runtimePolicy.completedMonsterIds, []);

fs.writeFileSync(labelsPath, JSON.stringify({
    version: 1,
    records: [{ bank: 'em024_se', eventId: 9, sourceId: 8, tags: ['회오리', '날개짓'] }]
}));
assert.deepStrictEqual(normalizeStoredLabels(labelsPath), { changedRecords: 1, records: 1 });
labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
assert.deepStrictEqual(labels.records[0].tags, ['tornado', 'wing_flap']);
assert.strictEqual(labels.records[0].reuseScope, 'cross-title-semantic');
assert.strictEqual(labels.tagAliases.브레스적중, 'breath_impact');

const htmlPath = path.join(__dirname, '..', 'tools', 'monster-audio-review.html');
if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('패턴 슬롯 매핑'));
    assert.ok(html.includes('포효'));
    assert.ok(html.includes('구성 음원 '));
    assert.ok(html.includes('음성 없음 ✓'));
    assert.ok(html.includes('완료 ✓'));
    assert.ok(html.includes('id="completeReview"'));
    assert.ok(html.includes('/api/review-completion'));
    assert.ok(html.includes('/api/hunt-patterns'));
    assert.ok(html.includes('/api/hunt-pattern-route'));
    assert.ok(html.includes('class="slot-pick"'));
}

console.log('monster audio event-group review server tests passed');
