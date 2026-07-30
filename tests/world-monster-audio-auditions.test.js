'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const audit = JSON.parse(fs.readFileSync(
    path.join(root, 'data/hunt/world-monster-audio-auditions.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(
    path.join(root, 'local_assets/monster_hunter/world/manifest.json'), 'utf8'));

const expected = new Map(audit.entries.map(entry => [entry.sourceStream, entry]));
assert.strictEqual(expected.size, 23);
assert.strictEqual(audit.bankReviews.em007_vo.defaultDisposition, 'unmapped');
assert.strictEqual(audit.bankReviews.em007_vo.actionRoutingApproved, false);
assert.strictEqual(audit.bankReviews.em007_se.defaultDisposition, 'unmapped');
assert.strictEqual(audit.bankReviews.em001_vo.defaultDisposition, 'unmapped');
assert.strictEqual(audit.bankReviews.em001_se.defaultDisposition, 'unmapped');
for (const entry of expected.values()) {
    const installed = manifest.entries.find(candidate =>
        String(candidate.sourceStream) === entry.sourceStream
        && candidate.path === entry.path);
    assert.ok(installed, `${entry.sourceStream} must retain its decoded evidence file`);
    assert.deepStrictEqual(installed.wwiseEventIds.map(String), entry.eventIds);
    if (entry.evidenceType === 'user-audition-confirmed-action-family') {
        assert.strictEqual(entry.evidenceType, 'user-audition-confirmed-action-family');
        assert.strictEqual(entry.actionRoutingApproved, true,
            'an explicitly confirmed action family may route only to that semantic family');
    } else {
        assert.strictEqual(entry.evidenceType, 'user-audition-review-hint');
        assert.strictEqual(entry.actionRoutingApproved, false,
            'audition impressions alone must not become action-specific runtime claims');
    }
}

assert.deepStrictEqual(expected.get('616362085').eventIds, expected.get('961748875').eventIds,
    'one event may own both incapacitation-like and death-like sources, so event ID alone is not semantic proof');
assert.strictEqual(expected.get('948696462').actionRoutingApproved, true,
    'the user-grouped second bite must be approved for random bite playback');
assert.deepStrictEqual(expected.get('267272460').eventIds, expected.get('840416626').eventIds,
    'the added aerial vocal must retain the confirmed aerial event family');
assert.deepStrictEqual(expected.get('829711342').eventIds, expected.get('846481219').eventIds,
    'the two user-selected nearby aerial voices must retain their shared Wwise event family');
assert.deepStrictEqual(expected.get('137441638').eventIds, ['2838412660'],
    'the reference Rathian somersault voice must retain its direct Wwise event evidence');
assert.deepStrictEqual(expected.get('287664299').eventIds, [],
    'the non-reference somersault source must not claim a direct manifest event link');
assert.deepStrictEqual(expected.get('137441638').semanticCandidates, ['somersault_telegraph']);
assert.deepStrictEqual(expected.get('287664299').semanticCandidates, ['somersault_telegraph']);
assert.deepStrictEqual(
    audit.unresolvedSourceSuffixes.map(entry => entry.suffix),
    ['82684', '29851'],
    'missing decoded sources must remain re-extraction work instead of receiving guessed routes'
);

console.log('[test] World monster user-audition review hints passed.');
