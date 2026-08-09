'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    huntToGraphId,
    patternAudioSlots,
    patternReviewTimeline,
    buildMonsterPatternAudioMap,
    loadHuntPatternAudioMap,
    savePatternRoute,
    savePatternMotion
} = require('../tools/hunt-audio-pattern-map');

// hunt monster id resolves to its World audio-graph bank id.
assert.strictEqual(huntToGraphId().diablos, 'em007');
assert.strictEqual(huntToGraphId().tigrex, 'em032');
assert.ok(loadHuntPatternAudioMap('em002').patterns.length >= 12, 'em002 (Rathalos) must load patterns');
assert.ok(loadHuntPatternAudioMap('em001').patterns.length >= 13, 'em001 (Rathian) must load patterns');
assert.ok(loadHuntPatternAudioMap('em032').patterns.length >= 10, 'em032 (Tigrex) must load patterns');
assert.ok(loadHuntPatternAudioMap('em007').patterns.length >= 10, 'em007 (Diablos) must load patterns');

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

const emergeSlots = patternAudioSlots({ id: 'diablos.burrow_emerge', type: 'charge', tags: ['charge', 'burrow-emerge'] })
    .map(s => s.slot);
assert.deepStrictEqual(emergeSlots, ['telegraph', 'impact'],
    'burrow emerge must expose a telegraph and a physical impact slot');

const beatTimeline = patternReviewTimeline({
    motion: [
        { beat: 'windup', ticks: 5, pose: 'crouch' },
        { beat: 'bite', ticks: 2, to: 'target', hit: true, sfx: 'impact' },
        { beat: 'return', ticks: 3, to: 'home', pose: 'idle' }
    ]
});
assert.strictEqual(beatTimeline.source, 'beat-motion');
assert.strictEqual(beatTimeline.durationTicks, 10);
assert.deepStrictEqual(beatTimeline.beats.map(beat => [beat.id, beat.startTicks, beat.endTicks, beat.hit]), [
    ['windup', 0, 5, false],
    ['bite', 5, 7, true],
    ['return', 7, 10, false]
]);

const legacyTimeline = patternReviewTimeline({
    animationDurationMs: 2600,
    movement: { ticks: 20 },
    impactTimeline: [{ atTicks: 15 }]
});
assert.strictEqual(legacyTimeline.source, 'legacy-phases');
assert.strictEqual(legacyTimeline.durationTicks, 27);

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
const launch = rockPattern.slots.find(s => s.slot === 'launch');
assert.strictEqual(launch.current, null, 'uncurated launch slot must read as fallback');
assert.strictEqual(launch.assigned, null);

// save an override and confirm it round-trips into the built map.
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: 'launch', files: ['local_assets/x/em007_se_launch.mp3'], gain: 0.8 }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const assigned = map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === 'launch');
assert.ok(assigned.assigned && assigned.assigned.layers[0][0].endsWith('em007_se_launch.mp3'),
    'saved override must appear on the slot');

savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: 'launch',
    files: ['local_assets/x/a.mp3', 'local_assets/x/b.mp3'], mode: 'random' }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const randomAssigned = map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === 'launch');
assert.strictEqual(randomAssigned.effective.mode, 'random');
assert.strictEqual(randomAssigned.effective.layers.length, 2);

// Explicit removal suppresses both an override and any catalog fallback.
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.roar', slot: 'roar', files: [], disabled: true }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const mutedRoar = map.patterns.find(p => p.id === 'diablos.roar').slots[0];
assert.strictEqual(mutedRoar.effective, null);
assert.strictEqual(mutedRoar.muted, true);
assert.deepStrictEqual(mutedRoar.override, { disabled: true });

// Empty files without disabled still clears a custom override and restores fallback.
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: 'launch', files: [] }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
assert.strictEqual(map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === 'launch').assigned, null);

const motionSave = savePatternMotion({
    huntId: 'diablos', patternId: 'diablos.tail_slam_rock',
    beats: { telegraph: 12, launch: 3, 'impact:rock': 2, recovery: 18 }
}, motionTmp);
assert.deepStrictEqual(motionSave.beats, { telegraph: 12, launch: 3, 'impact:rock': 2, recovery: 18 });
savePatternMotion({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', reset: true }, motionTmp);
assert.strictEqual(JSON.parse(fs.readFileSync(motionTmp, 'utf8')).overrides.diablos, undefined);

// the real reviewed catalog resolves diablos without throwing.
const live = loadHuntPatternAudioMap('diablos', { overridesPath: tmp });
assert.ok(live.patterns.length >= 8, 'diablos must expose its reviewed pattern set');
assert.ok(live.patterns.some(p => p.id === 'diablos.tail_slam_rock'));

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
        for (const patternId of Object.keys(patternRoutes || {})) {
            if (!known.has(patternId)) orphans.push(`${monsterId} → ${patternId}`);
        }
    }
    assert.deepStrictEqual(orphans, [],
        `없는 패턴을 가리키는 오디오 라우트가 있다. 조용히 재생되지 않는다:\n  ${orphans.join('\n  ')}`);
}
