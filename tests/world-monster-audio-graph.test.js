'use strict';

const assert = require('assert');
const reviewLabels = require('../data/hunt/world-monster-audio-review-labels.json');
const {
    annotationIndex,
    compactEvents,
    parseTxtp,
    sourceIds,
    sourceRefs,
    structureFrom
} = require('../scripts/extract-world-monster-audio-graph');

const randomRecipe = [
    ' wem/em001_vo.nbnk #s81 #i  ##623723504.wem',
    ' wem/em001_vo.nbnk #s116 #i  #v -3.0dB  ##895257760.wem',
    'group = -R2>1',
    '',
    '# PATH',
    '#   CAkEvent[237] 26827791',
    '#     CAkActionPlay[236] 1066033919',
    '#       CAkRanSeqCntr[50] 208834605',
    '#       * eMode: 0x00 [Random]',
    '#         CAkSound[49] 480537622',
    '#           Source 623723504'
].join('\n');

assert.deepStrictEqual(sourceIds(randomRecipe), ['623723504', '895257760']);
assert.deepStrictEqual(sourceRefs(randomRecipe), [
    { streamOrdinal: 81, sourceId: 623723504 },
    { streamOrdinal: 116, sourceId: 895257760 }
]);
assert.deepStrictEqual(
    structureFrom(randomRecipe, 'em001_vo-0237-event-26827791 {r}.txtp'),
    ['random']
);
assert.deepStrictEqual(
    structureFrom('# CAkLayerCntr[1] 9\n# CAkSwitchCntr[2] 8', 'event.txtp'),
    ['layer', 'switch']
);

const tags = annotationIndex({
    entries: [{
        monsterId: 'rathalos',
        bank: 'em001_vo',
        eventIds: ['26827791'],
        sourceStream: '623723504',
        semanticCandidates: ['aerial_attack_vocal', 'attack_vocal'],
        audition: '공중 공격 파편',
        actionRoutingApproved: false
    }]
});
assert.deepStrictEqual(tags.get('623723504')[0].tags, ['aerial_attack_vocal', 'attack_vocal']);
assert.strictEqual(tags.get('623723504')[0].sourceId, 623723504);
assert.strictEqual(tags.get('623723504')[0].chunk, 'chunkG0');

const reviewedTags = annotationIndex({
    entries: [{
        monsterId: 'rathalos',
        bank: 'em001_vo',
        eventIds: ['10'],
        sourceStream: '99',
        semanticCandidates: ['old_guess'],
        audition: 'old',
        actionRoutingApproved: true
    }]
}, {
    monsterId: 'rath-family',
    records: [
        { bank: 'em001_vo', eventId: 10, sourceId: 99, tags: ['summersalt_vocal'], verdict: '확정' },
        { bank: 'em001_vo', eventId: 11, sourceId: 100, tags: ['unknown_guess'], verdict: '모르겠음' }
    ],
    tagAliases: { summersalt_vocal: 'somersault_vocal' }
});
assert.deepStrictEqual(reviewedTags.get('99')[0].tags, ['somersault_vocal']);
assert.deepStrictEqual(reviewedTags.get('99')[0].rawTags, ['summersalt_vocal']);
assert.strictEqual(reviewedTags.get('99')[0].confidence, 'user-review-confirmed');
assert.deepStrictEqual(reviewedTags.get('100'), []);
assert.ok(reviewLabels.records.length >= 39);
assert.ok(reviewLabels.records.every(row =>
    typeof row.bank === 'string'
    && Number.isFinite(Number(row.eventId))
    && Number.isFinite(Number(row.sourceId))
    && Array.isArray(row.tags)
));
assert.ok(reviewLabels.records.some(row => row.verdict === '확정'));
assert.ok(reviewLabels.records.some(row => row.tags.includes('wing_flap')));
assert.ok(reviewLabels.records.every(row => !row.tags.includes('날개짓')));
assert.strictEqual(tags.get('623723504')[0].mutable, true);

const events = compactEvents([
    {
        chunk: 'chunkG0',
        bank: 'em001_vo',
        eventId: 26827791,
        structure: ['random'],
        sourceIds: [623723504],
        decodedClips: [{ sourceId: 623723504 }],
        annotations: [],
        variant: 'a'
    },
    {
        chunk: 'chunkG0',
        bank: 'em001_vo',
        eventId: 26827791,
        structure: ['switch'],
        sourceIds: [895257760],
        decodedClips: [],
        annotations: [],
        variant: 'b'
    }
]);
assert.strictEqual(events.length, 1);
assert.deepStrictEqual(events[0].structures, ['random', 'switch']);
assert.deepStrictEqual(events[0].sourceIds, [623723504, 895257760]);

// parseTxtp is exported for the installed-bank integration path; its file I/O
// is exercised by the generated em001 graph rather than writing fixtures here.
assert.strictEqual(typeof parseTxtp, 'function');

console.log('world monster audio graph tests passed');
