'use strict';

const assert = require('assert');
const {
    resolvePart, slotIdsForBeat, createMotionDraft, projectTimeline, locateTick, tickAtBeatProgress,
    normalizePreviewScenario, buildPreviewMotion, createEditorSession, motionValuesEqual
} = require('../tools/monster-audio-review-state');

const pattern = {
    slots: [
        { slot: 'beat:hop' },
        { slot: 'beat:impact' },
        { slot: 'beat:impact-alt' }
    ]
};
const timeline = {
    beats: [
        { id: 'hop', audioSlots: ['beat:hop'] },
        { id: 'impact', audioSlots: ['beat:impact', 'beat:impact-alt'] },
        { id: 'return', audioSlots: [] }
    ]
};

assert.deepStrictEqual(slotIdsForBeat(timeline.beats[1]), ['beat:impact', 'beat:impact-alt']);
assert.deepStrictEqual(resolvePart(pattern, timeline, { beatId: 'impact' }), {
    index: 1, beatId: 'impact', slotId: 'beat:impact'
});
assert.deepStrictEqual(resolvePart(pattern, timeline, { slotId: 'beat:impact-alt' }), {
    index: 1, beatId: 'impact', slotId: 'beat:impact-alt'
});
assert.deepStrictEqual(resolvePart(pattern, timeline, { beatId: 'return' }), {
    index: 2, beatId: 'return', slotId: ''
});
assert.deepStrictEqual(resolvePart(pattern, timeline, { beatId: 'missing' }), {
    index: 0, beatId: 'hop', slotId: 'beat:hop'
});

const motionPattern = { motion: [
    { beat: 'hop', ticks: 4, to: 'target' },
    { beat: 'impact', ticks: 2, hit: true },
    { beat: 'return', ticks: 5, to: 'home' }
] };
const timed = { beats: [
    { id: 'hop', ticks: 4 }, { id: 'impact', ticks: 2 }, { id: 'return', ticks: 5 }
] };
const draft = createMotionDraft(motionPattern, timed);
draft.hop.ticks = 8;
draft.impact.ticks = 3;
const projected = projectTimeline(timed, draft);
assert.deepStrictEqual(projected.beats.map(beat => [beat.startTicks, beat.endTicks]),
    [[0, 8], [8, 11], [11, 16]],
    'one projection must own bar widths, labels, audio offsets and save values');
assert.strictEqual(projected.durationTicks, 16);
assert.strictEqual(locateTick(timed, draft, 9).beat.id, 'impact');
assert.strictEqual(tickAtBeatProgress(timed, draft, 'impact', .5), 10,
    'duration edits must preserve the selected beat-local position');

const legacyDraft = createMotionDraft({}, timed);
const legacyPreview = buildPreviewMotion({ motion: null }, timed, legacyDraft);
assert.strictEqual(legacyPreview.motion, null,
    'legacy CSS patterns must not be replaced by inert ticks-only BEAT motion');
assert.deepStrictEqual(legacyPreview.runtimeTimingBeats.map(beat => beat.ticks), [4, 2, 5]);
const adapterDraft = createMotionDraft({ motionGraph: { renderer: 'keyframe-beat', beats: [
    { beat: 'hop', ticks: 4, offsetX: 30 }, { beat: 'impact', ticks: 2 },
    { beat: 'return', ticks: 5 }
] } }, timed);
const adapterPreview = buildPreviewMotion({ motionGraph: { renderer: 'keyframe-beat' } }, timed, adapterDraft);
assert.strictEqual(adapterPreview.motion, null);
assert.strictEqual(adapterPreview.runtimeTimingBeats[0].offsetX, 30,
    'profile-backed patterns must retain editor transforms without replacing their base animation');
const nativeGraphDraft = createMotionDraft({ motionGraph: { renderer: 'beat', beats: [
    { id: 'hop', ticks: 4, tracks: { visual: [{ offsetTicks: 0,
        value: { scaleX: 1.18, scaleY: .78, skewX: -6, origin: 'part:feet' } }] } },
    { id: 'impact', ticks: 2, tracks: { visual: [{ offsetTicks: 0, value: { pose: 'land' } }] } },
    { id: 'return', ticks: 5, tracks: { visual: [{ offsetTicks: 0, value: { to: 'home' } }] } }
] } }, timed);
assert.deepStrictEqual(
    { scaleX: nativeGraphDraft.hop.scaleX, scaleY: nativeGraphDraft.hop.scaleY,
        skewX: nativeGraphDraft.hop.skewX, origin: nativeGraphDraft.hop.origin },
    { scaleX: 1.18, scaleY: .78, skewX: -6, origin: 'part:feet' },
    'native BEAT visual transforms must reach the editor draft intact');
const nativeGraphPreview = buildPreviewMotion({ motionGraph: { renderer: 'beat' } }, timed, nativeGraphDraft);
assert.deepStrictEqual(
    { scaleX: nativeGraphPreview.motion[0].scaleX, scaleY: nativeGraphPreview.motion[0].scaleY,
        skewX: nativeGraphPreview.motion[0].skewX, origin: nativeGraphPreview.motion[0].origin },
    { scaleX: 1.18, scaleY: .78, skewX: -6, origin: 'part:feet' },
    'native BEAT visual transforms must reach the compiled preview unchanged');
const authoredPreview = buildPreviewMotion(motionPattern, timed, draft);
assert.strictEqual(authoredPreview.useBeatMotion, true);
assert.strictEqual(authoredPreview.motion[0].to, 'target');

assert.deepStrictEqual(normalizePreviewScenario({
    view: 'design', monsterState: 'enraged', primaryTargetIndex: 2,
    forcedTargetIndices: [3, 2, 3, 9],
    forcedImpactTargets: [{ impactIndex: 1, targetIndices: [0, 1, 7] }], seed: 4
}), {
    view: 'design', monsterState: 'enraged', primaryTargetIndex: 2,
    forcedTargetIndices: [3, 2],
    forcedImpactTargets: [{ impactIndex: 1, targetIndices: [0, 1] }], seed: 4
});

const session = createEditorSession();
session.load({ id: 'test.pattern', slots: pattern.slots, timeline: timed, motion: motionPattern.motion });
session.select({ beatId: 'impact' });
assert.strictEqual(session.snapshot().selection.beatId, 'impact');
session.seek(5);
assert.strictEqual(session.snapshot().scrub.beatId, 'impact');
session.updateBeat('impact', { ticks: 6, rotation: 45 });
assert.strictEqual(session.snapshot().timeline.durationTicks, 15,
    'the timeline, transform editor and save payload must share one draft');
assert.strictEqual(session.serialize().impact.rotation, 45);
session.undo();
assert.strictEqual(session.serialize().impact.ticks, 2);
session.redo();
assert.strictEqual(session.serialize().impact.ticks, 6);
session.resizeBoundary('hop', 'impact', 2);
assert.deepStrictEqual([session.serialize().hop.ticks, session.serialize().impact.ticks], [6, 4]);
session.moveImpact('impact', 3);
assert.strictEqual(session.serialize().impact.hit, false,
    'moving HIT out of a beat must not resize that beat or leave its old judgment active');
assert.strictEqual(session.serialize().hop.hit, true,
    'the beat underneath the dragged HIT marker must become the new impact owner');
assert.strictEqual(session.serialize().hop.hitOffsetTicks, 3,
    'HIT must retain an independent tick offset inside its destination beat');
const movedPreview = MonsterAudioReviewState.buildPreviewMotion(
    motionPattern, session.snapshot().timeline, session.draft);
assert.strictEqual(movedPreview.motion.find(beat => beat.beat === 'impact').hit, false,
    'an explicit hit:false must survive preview projection instead of OR-merging with the original hit');
assert.strictEqual(movedPreview.motion.find(beat => beat.beat === 'hop').hitOffsetTicks, 3);
assert.deepStrictEqual([session.serialize().hop.ticks, session.serialize().impact.ticks], [6, 4],
    'dragging HIT must never resize adjacent motion beats');
session.moveJudgment('impact', 'roar', 12);
assert.strictEqual(session.serialize().return.judgmentOffsets.roar, 2,
    'roar judgment must retain an independent offset in the destination beat');
assert.deepStrictEqual([session.serialize().hop.ticks, session.serialize().impact.ticks,
    session.serialize().return.ticks], [6, 4, 5],
'dragging a roar judgment must never resize or move a motion beat');
session.moveJudgment('return', 'roar', 7);
assert.strictEqual(session.serialize().impact.judgmentOffsets.roar, 1,
    'a judgment marker may cross into another beat without turning that beat into HIT');
assert.strictEqual(session.serialize().impact.hit, false);
assert.strictEqual(session.snapshot().timeline.beats.find(beat => beat.id === 'impact').judgmentOffsets.roar, 1,
    'projected timeline must expose the independently authored judgment offset to the editor');
session.undo();
assert.strictEqual(motionValuesEqual(
    { hop: { to: 'target', ticks: 6 }, impact: { rotation: 45, ticks: 4 } },
    { impact: { ticks: 4, rotation: 45 }, hop: { ticks: 6, to: 'target' } }
), true, 'save verification must ignore JSON object key insertion order');
assert.strictEqual(motionValuesEqual(
    { impact: { ticks: 4, judgments: [{ id: 'quake', directHitSupersedes: false }] } },
    { impact: { ticks: 4, judgments: [{ id: 'quake' }] } }
), true, 'an omitted opt-in judgment flag must be semantically equal to its explicit false default');
const reorderedSaved = Object.fromEntries(Object.entries(session.serialize()).reverse().map(([id, beat]) =>
    [id, Object.fromEntries(Object.entries(beat).reverse())]));
assert.doesNotThrow(() => session.markSaved(reorderedSaved),
    'server-normalized field order must not produce a false motion mismatch');
const savedImpactTicks = session.serialize().impact.ticks;
session.updateBeat('impact', { ticks: savedImpactTicks + 9 });
assert.strictEqual(session.snapshot().dirty, true);
session.restoreSaved();
assert.strictEqual(session.serialize().impact.ticks, savedImpactTicks,
    'recent-save reset must restore the last verified server state without deleting the authored override');
assert.strictEqual(session.snapshot().dirty, false);
assert.strictEqual(session.snapshot().canUndo, false,
    'restoring the saved baseline must also discard stale edit history');

const judgmentSession = createEditorSession();
judgmentSession.load({ id: 'test.judgment', damageRatio: .4,
    timeline: { beats: [{ id: 'impact', ticks: 5 }] }, motion: [{
    beat: 'impact', ticks: 5, fxSecondary: 'target-impact-dust',
    fxSecondaryAnchor: 'target', fxSecondaryDurationTicks: 6,
    fxSecondaryAngleMode: 'upward-diagonal',
    fxAdditional: [{ fx: 'part-swing-arc', anchor: 'head', durationTicks: 5, angleMode: 'upward-diagonal' }],
    judgments: [{ id: 'j1', group: 'g1', kind: 'damage', target: 'primary', damageScale: 1, offsetTicks: 2 }]
}] });
assert.strictEqual(judgmentSession.serialize().impact.judgments[0].damagePercent, 40,
    'the editor must expose actual max-HP damage percent instead of an opaque pattern multiplier');
judgmentSession.updateJudgment('j1', { kind: 'tremor', target: 'all' });
assert.deepStrictEqual(judgmentSession.serialize().impact.judgments[0], {
    id: 'j1', group: 'g1', kind: 'tremor', target: 'all', size: 'large', offsetTicks: 2
}, 'changing judgment kind must remove incompatible damage fields before save verification');
judgmentSession.updateJudgment('j1', { kind: 'damage', target: 'pair-left', damagePercent: 30 });
assert.strictEqual(judgmentSession.serialize().impact.judgments[0].target, 'pair-left',
    'the editor must preserve reusable two-hunter simultaneous/left/right target presets');
assert.strictEqual(judgmentSession.serialize().impact.fxSecondary, 'target-impact-dust',
    'secondary visual effects must remain in the canonical editable motion payload');

const mixedSchemaSession = createEditorSession();
mixedSchemaSession.load({ id: 'test.mixed-schema', damageRatio: .4,
    timeline: { beats: [{ id: 'old-impact', ticks: 5, hit: true }, { id: 'new-impact', ticks: 5 }] },
    motion: [{ beat: 'old-impact', ticks: 5, hit: true, hitOffsetTicks: 4,
        judgments: [{ id: 'authoritative-hit', group: 'impact-1', kind: 'damage',
            target: 'primary', damagePercent: 40, offsetTicks: 1 }] },
    { beat: 'new-impact', ticks: 5 }] });
assert.strictEqual(mixedSchemaSession.serialize()['old-impact'].hit, false,
    'unified judgments must tombstone a coexisting legacy HIT during load');
mixedSchemaSession.moveJudgmentById('authoritative-hit', 7);
assert.strictEqual(mixedSchemaSession.serialize()['old-impact'].hit, false,
    'moving a judgment must never revive the old legacy HIT cell');
assert.deepStrictEqual(mixedSchemaSession.serialize()['old-impact'].judgments, []);
assert.strictEqual(mixedSchemaSession.serialize()['new-impact'].judgments[0].offsetTicks, 2);
assert.strictEqual(mixedSchemaSession.snapshot().timeline.beats[0].hit, false,
    'the projected editor timeline must have only one HIT authority');

judgmentSession.removeJudgment('j1');
assert.deepStrictEqual(judgmentSession.serialize().impact.judgments, [],
    'deleting the final judgment must retain an empty-array tombstone for inherited motion');

console.log('[test] monster audio review selection state passed');
