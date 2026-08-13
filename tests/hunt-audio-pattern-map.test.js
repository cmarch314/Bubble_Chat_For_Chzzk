'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    huntToGraphId,
    patternAudioSlots,
    patternReviewTimeline,
    bindAudioSlotsToTimeline,
    buildMonsterPatternAudioMap,
    loadHuntPatternAudioMap,
    refreshHuntCatalogSources,
    savePatternRoute,
    movePatternRouteFile,
    savePatternMotion
} = require('../tools/hunt-audio-pattern-map');

// hunt monster id resolves to its World audio-graph bank id.
assert.strictEqual(huntToGraphId().diablos, 'em007');
assert.strictEqual(huntToGraphId().tigrex, 'em032');
assert.ok(loadHuntPatternAudioMap('em002').patterns.length >= 12, 'em002 (Rathalos) must load patterns');
assert.ok(loadHuntPatternAudioMap('em001').patterns.length >= 13, 'em001 (Rathian) must load patterns');
assert.ok(loadHuntPatternAudioMap('em032').patterns.length >= 10, 'em032 (Tigrex) must load patterns');
assert.ok(loadHuntPatternAudioMap('em007').patterns.length >= 10, 'em007 (Diablos) must load patterns');
const liveBarioth = loadHuntPatternAudioMap('em042').patterns.find(pattern => pattern.id === 'barioth.shoulder_check');
assert.deepStrictEqual(liveBarioth.timeline.beats.map(beat => beat.label), [
    '도약 압축', '측면 도약', '어깨 들이밀기', '횡이동 충돌', '철산고 충돌', '느린 자세 복귀'
], 'the review API must project the same current Barioth motion authored for the real hunt');
assert.deepStrictEqual(liveBarioth.slots.map(slot => slot.beatId),
    liveBarioth.timeline.beats.map(beat => beat.id),
    'every authored motion beat must be an equally selectable sound moment');
assert.deepStrictEqual(liveBarioth.slots.map(slot => slot.atTicks),
    liveBarioth.timeline.beats.map(beat => beat.startTicks),
    'sound moments must follow the latest user-edited cumulative timing instead of stale hardcoded ticks');
assert.strictEqual(refreshHuntCatalogSources(), false,
    'unchanged hunt sources must stay cached instead of reloading on every review request');
assert.strictEqual(refreshHuntCatalogSources({ force: true }), true,
    'the review server must be able to refresh authored hunt sources without restarting');

// slot derivation covers the distinct audio moments per pattern shape.
const roarSlots = patternAudioSlots({ id: 'x.roar', type: 'roar', tags: ['roar'] }).map(s => s.slot);
assert.deepStrictEqual(roarSlots, ['roar']);

const rock = patternAudioSlots({
    id: 'diablos.tail_slam_rock', type: 'projectile', delivery: 'projectile',
    tags: ['tail', 'projectile', 'fire'], impactTimeline: [{ audioCue: 'rock', atTicks: 27 }]
});
const rockSlots = rock.map(s => s.slot);
assert.deepStrictEqual(rock.map(s => s.phase), ['telegraph', 'launch', 'impact', 'recovery'],
    'a projectile must expose canonical phases in play order');
assert.ok(rockSlots.includes('launch'), 'rock slam must expose a launch (시작) slot');
assert.ok(rockSlots.includes('impact:rock'), 'authored rock cue must own a dedicated impact slot');
assert.strictEqual(rock.find(s => s.slot === 'impact:rock').atTicks, 27, 'impact slot carries its timeline tick');
assert.strictEqual(rock.find(s => s.slot === 'impact:rock').runtimeReady, false, 'generic impact is not yet runtime-wired');
assert.strictEqual(rock.find(s => s.slot === 'telegraph').runtimeReady, true, 'telegraph is runtime-wired');

const charge = patternAudioSlots({ id: 'diablos.horn_charge', type: 'charge', tags: ['charge'], chargeLaunchStyle: 'stomp-burst', movement: { ticks: 42 }, impactTimeline: [{ atTicks: 20 }] });
assert.deepStrictEqual(charge.map(s => s.phase), ['telegraph', 'start', 'travel', 'impact', 'recovery']);

const mergedBurrow = loadHuntPatternAudioMap('em007').patterns
    .find(pattern => pattern.id === 'diablos.burrow_enter');
assert.deepStrictEqual(mergedBurrow.timeline.beats.map(beat => beat.id),
    ['dig', 'sink', 'still', 'track', 'eruption', 'land', 'return'],
    'burrow and eruption must expose one complete sound-synchronised BEAT timeline');
assert.ok(!loadHuntPatternAudioMap('em007').patterns.some(pattern => pattern.id === 'diablos.burrow_emerge'),
    'audio review must not retain the removed second action');

const beatTimeline = patternReviewTimeline({
    motion: [
        { beat: 'windup', label: '도약 압축', ticks: 5, pose: 'crouch' },
        { beat: 'bite', ticks: 2, to: 'target', hit: true, sfx: 'impact' },
        { beat: 'return', ticks: 3, to: 'home', pose: 'idle' }
    ]
});
assert.strictEqual(beatTimeline.source, 'beat-motion');
assert.strictEqual(beatTimeline.durationTicks, 10);
assert.strictEqual(beatTimeline.beats[0].label, '도약 압축',
    'review timelines must show authored phase labels instead of raw internal beat ids');
assert.deepStrictEqual(beatTimeline.beats.map(beat => [beat.id, beat.startTicks, beat.endTicks, beat.hit]), [
    ['windup', 0, 5, false],
    ['bite', 5, 7, true],
    ['return', 7, 10, false]
]);

const boundPhysical = bindAudioSlotsToTimeline(
    patternAudioSlots({ id: 'x.shoulder', type: 'physical', impactTimeline: [{ atTicks: 13 }] }),
    patternReviewTimeline({ motion: [
        { beat: 'spring-load', ticks: 2 },
        { beat: 'flank-hop', ticks: 5, to: 'flank:target' },
        { beat: 'shoulder-set', ticks: 3 },
        { beat: 'lateral-slam', ticks: 3, to: 'target' },
        { beat: 'shoulder-impact', ticks: 2, hit: true, sfx: 'impact' },
        { beat: 'slow-return', ticks: 10, to: 'home' }
    ] })
);
assert.deepStrictEqual(boundPhysical.slots.map(slot => [slot.slot, slot.beatId, slot.atTicks]), [
    ['telegraph', 'spring-load', 0],
    ['start', 'lateral-slam', 10],
    ['impact', 'shoulder-impact', 13]
], 'physical audio phases must bind to authored motion beats instead of UI guesses or array positions');
assert.deepStrictEqual(boundPhysical.errors, []);
assert.deepStrictEqual(boundPhysical.timeline.beats.find(beat => beat.id === 'shoulder-impact').audioSlots, ['impact']);

const legacyTimeline = patternReviewTimeline({
    animationDurationMs: 2600,
    movement: { ticks: 20 },
    impactTimeline: [{ atTicks: 15 }]
});
assert.strictEqual(legacyTimeline.source, 'keyframe-motion');
assert.strictEqual(legacyTimeline.durationTicks, 26,
    'runtime timing projection must cover the longest live animation/movement/impact clock');
assert.deepStrictEqual(legacyTimeline.beats.filter(beat => beat.hit).map(beat => beat.startTicks), [15],
    'legacy review timelines must use the live impact tick instead of fabricated phase sums');

// build map reflects the hand-authored catalog: diablos roar/burrow are curated.
const catalog = {
    'diablos:roar': [{ label: 'Diablos roar', layers: [['a/em007_vo_roar.mp3', 0.7, 0]] }],
    'diablos:burrow': [{ label: 'Diablos burrow', layers: [['a/em007_se_burrow.mp3', 0.66, 0]] }]
};
const patterns = [
    { id: 'diablos.roar', name: '포효', type: 'roar', tags: ['roar'] },
    { id: 'diablos.burrow_enter', name: '지중 잠행', type: 'burrow', tags: ['burrow-enter'] },
    { id: 'diablos.tail_slam_rock', name: '꼬리 바위', type: 'projectile', delivery: 'projectile', tags: ['tail', 'projectile'], impactTimeline: [{ audioCue: 'rock' }] }
];
const tmp = path.join(os.tmpdir(), `hunt-audio-overrides-${process.pid}.json`);
const motionTmp = path.join(os.tmpdir(), `hunt-motion-overrides-${process.pid}.json`);
try { fs.unlinkSync(tmp); } catch { /* fresh */ }
try { fs.unlinkSync(motionTmp); } catch { /* fresh */ }

let map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
assert.strictEqual(map.graphId, 'em007');
const roarPattern = map.patterns.find(p => p.id === 'diablos.roar');
assert.ok(roarPattern.slots[0].current, 'roar slot must report its curated route');
const rockPattern = map.patterns.find(p => p.id === 'diablos.tail_slam_rock');
assert.ok(rockPattern.timeline && rockPattern.timeline.beats.length,
    'review projection must expose a left-to-right motion timeline');
const launch = rockPattern.slots.find(s => s.phase === 'launch');
assert.strictEqual(launch.current, null, 'uncurated launch slot must read as fallback');
assert.strictEqual(launch.assigned, null);

// save an override and confirm it round-trips into the built map.
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: launch.slot, files: ['local_assets/x/em007_se_launch.mp3'], gain: 0.8 }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const assigned = map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === launch.slot);
assert.ok(assigned.assigned && assigned.assigned.layers[0][0].endsWith('em007_se_launch.mp3'),
    'saved override must appear on the slot');

savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: launch.slot,
    files: ['local_assets/x/a.mp3', 'local_assets/x/b.mp3'], mode: 'random' }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const randomAssigned = map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === launch.slot);
assert.strictEqual(randomAssigned.effective.mode, 'random');
assert.strictEqual(randomAssigned.effective.layers.length, 2);

savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: launch.slot,
    files: ['local_assets/x/selected-only.mp3'] }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const singleAssigned = map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === launch.slot);
assert.strictEqual(singleAssigned.effective.mode, undefined,
    'choosing one source must clear a previous random-group mode');
assert.deepStrictEqual(singleAssigned.effective.layers.map(layer => layer[0]),
    ['local_assets/x/selected-only.mp3'], 'single assignment must replace the whole previous group');

const movePattern = loadHuntPatternAudioMap('barioth', { overridesPath: tmp })
    .patterns.find(pattern => pattern.id === 'barioth.spin_claw');
const [moveFrom, moveTo] = movePattern.slots;
savePatternRoute({ huntId: 'barioth', patternId: movePattern.id, slot: moveFrom.slot,
    files: ['local_assets/x/move-a.mp3', 'local_assets/x/stay-b.mp3'], mode: 'random' }, tmp);
savePatternRoute({ huntId: 'barioth', patternId: movePattern.id, slot: moveTo.slot,
    files: ['local_assets/x/target-c.mp3'] }, tmp);
movePatternRouteFile({ huntId: 'barioth', patternId: movePattern.id, fromSlot: moveFrom.slot,
    toSlot: moveTo.slot, file: 'local_assets/x/move-a.mp3' }, tmp);
const movedPattern = loadHuntPatternAudioMap('barioth', { overridesPath: tmp })
    .patterns.find(pattern => pattern.id === movePattern.id);
assert.deepStrictEqual(movedPattern.slots[0].effective.layers.map(layer => layer[0]), ['local_assets/x/stay-b.mp3']);
assert.deepStrictEqual(movedPattern.slots[1].effective.layers.map(layer => layer[0]),
    ['local_assets/x/target-c.mp3', 'local_assets/x/move-a.mp3'],
    'drag move atomically removes one group member and appends it without replacing the target route');

// Explicit removal suppresses both an override and any catalog fallback.
const roarSlot = roarPattern.slots[0].slot;
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.roar', slot: roarSlot, files: [], disabled: true }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const mutedRoar = map.patterns.find(p => p.id === 'diablos.roar').slots[0];
assert.strictEqual(mutedRoar.effective, null);
assert.strictEqual(mutedRoar.muted, true);
assert.deepStrictEqual(mutedRoar.override, { disabled: true });

// Empty files without disabled still clears a custom override and restores fallback.
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: launch.slot, files: [] }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
assert.strictEqual(map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === launch.slot).assigned, null);

const motionSave = savePatternMotion({
    huntId: 'diablos', patternId: 'diablos.tail_slam_rock',
    beats: { telegraph: { ticks: 12, strideFlipTicks: 0 }, launch: 3,
        'impact:rock': { ticks: 2, hit: true, hitOffsetTicks: 1 }, recovery: 18 }
}, motionTmp);
assert.deepStrictEqual(motionSave.beats, {
    telegraph: { ticks: 12, strideFlipTicks: 0 }, launch: 3,
    'impact:rock': { ticks: 2, hitOffsetTicks: 1, hit: true }, recovery: 18
});
const unifiedMotionSave = savePatternMotion({
    huntId: 'diablos', patternId: 'diablos.rage_double_charge',
    beats: { charge: { ticks: 8, hit: true, hitOffsetTicks: 6,
        judgments: [{ id: 'charge-hit', group: 'charge-1', kind: 'damage',
            target: 'primary', offsetTicks: 2, damagePercent: 50,
            hitReactionKind: 'butt-stumble', hitRecoveryTicks: 15 }] } }
}, motionTmp);
assert.strictEqual(unifiedMotionSave.beats.charge.hit, false,
    'the save boundary must reject dual legacy/new HIT ownership');
assert.strictEqual(unifiedMotionSave.beats.charge.hitOffsetTicks, undefined);
assert.strictEqual(unifiedMotionSave.beats.charge.judgments[0].offsetTicks, 2);
assert.strictEqual(unifiedMotionSave.beats.charge.judgments[0].hitReactionKind, 'butt-stumble',
    'the editor save boundary must preserve authored hit reaction identity');
assert.strictEqual(unifiedMotionSave.beats.charge.judgments[0].hitRecoveryTicks, 15,
    'the editor save boundary must preserve authored hit recovery');
const duplicateJudgmentSave = savePatternMotion({
    huntId: 'diablos', patternId: 'diablos.rage_charge', beats: {
        first: { ticks: 5, judgments: [{ id: 'same-hit', group: 'same-group', kind: 'damage',
            target: 'primary', offsetTicks: 3, damagePercent: 50 }] },
        old: { ticks: 5, judgments: [{ id: 'same-hit', group: 'same-group', kind: 'damage',
            target: 'primary', offsetTicks: 0, damagePercent: 50 }] }
    }
}, motionTmp);
assert.strictEqual(duplicateJudgmentSave.beats.first.judgments.length, 1);
assert.deepStrictEqual(duplicateJudgmentSave.beats.old.judgments, [],
    'the save boundary must remove a judgment from its previous beat after a drag');
savePatternMotion({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', reset: true }, motionTmp);
savePatternMotion({ huntId: 'diablos', patternId: 'diablos.rage_double_charge', reset: true }, motionTmp);
savePatternMotion({ huntId: 'diablos', patternId: 'diablos.rage_charge', reset: true }, motionTmp);
assert.strictEqual(JSON.parse(fs.readFileSync(motionTmp, 'utf8')).overrides.diablos, undefined);

// the real reviewed catalog resolves diablos without throwing.
const live = loadHuntPatternAudioMap('diablos', { overridesPath: tmp });
assert.ok(live.patterns.length >= 8, 'diablos must expose its reviewed pattern set');
assert.ok(live.patterns.some(p => p.id === 'diablos.tail_slam_rock'));

// Release guard: every reviewable audio moment for a released monster must
// resolve to an authored motion beat. The editor intentionally exposes
// unreleased reference monsters before their BEAT authoring is complete.
const bindingFailures = [];
const releasedIds = require('../js/effects/hunt/data/MonsterReleaseManifest.generated.js')
    .records.map(record => String(record.id).replace(/[-']/g, '_'));
for (const huntId of releasedIds) {
    for (const pattern of loadHuntPatternAudioMap(huntId, { overridesPath: tmp }).patterns) {
        if (pattern.audioBindingErrors.length) bindingFailures.push(`${huntId}/${pattern.id}: ${pattern.audioBindingErrors.join(', ')}`);
    }
}
assert.deepStrictEqual(bindingFailures, [], `all motion/audio moments must be explicitly bound:\n${bindingFailures.join('\n')}`);

try { fs.unlinkSync(tmp); } catch { /* best effort */ }
try { fs.unlinkSync(motionTmp); } catch { /* best effort */ }
console.log('[test] hunt audio pattern-map derivation, overrides, and live catalog passed.');

// ── 라우트가 존재하는 패턴을 가리키는가 ──────────────────────────────────────
//
// 벨리오로스에 `barioth.glide_dive` 라우트가 있었는데, 그 이름의 패턴은 어느
// 버전에도 존재한 적이 없다. 텔레그래프 음성이 한 번도 재생되지 않았고 아무
// 신호도 없었다. 같은 부류로 `barioth.shoulder_check`는 패턴이 이름을 바꾸면서
// 남겨진 죽은 키였다.
//
// 라우트는 조용히 죽는다. 재생되지 않는 것과 그 패턴에 음성이 없는 것이
// 화면에서 구분되지 않기 때문이다. 전수로 대조한다.
{
    const routes = require('../data/hunt/monster-pattern-audio-routes.json').routes || {};
    global.window = global;
    const overrides = require('../js/effects/hunt/HuntMonsterProfiles.js');
    const known = new Set();
    for (const [monsterId, list] of Object.entries(overrides)) {
        for (const pattern of list || []) {
            known.add(pattern.id);
            // 후속기(지중 급습 등)는 카탈로그가 followUp에서 만들어 낸다.
            // 원본 목록에만 없을 뿐 실재하는 패턴이므로 함께 센다.
            const suffix = pattern.followUp?.idSuffix;
            if (suffix) known.add(`${monsterId}.${suffix}`);
        }
    }
    const orphans = [];
    for (const [monsterId, patternRoutes] of Object.entries(routes)) {
        const reviewPatternIds = monsterId === 'common' ? ['__visual.part-break']
            : loadHuntPatternAudioMap(monsterId).patterns.map(pattern => pattern.id);
        reviewPatternIds.forEach(patternId => known.add(patternId));
        for (const patternId of Object.keys(patternRoutes || {})) {
            if (!known.has(patternId)) orphans.push(`${monsterId} → ${patternId}`);
        }
    }
    assert.deepStrictEqual(orphans, [],
        `없는 패턴을 가리키는 오디오 라우트가 있다. 조용히 재생되지 않는다:\n  ${orphans.join('\n  ')}`);
}
