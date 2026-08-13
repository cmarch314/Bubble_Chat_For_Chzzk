'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadHuntPatternAudioMap } = require('../tools/hunt-audio-pattern-map.js');
const { createMotionDraft, buildPreviewMotion } = require('../tools/monster-audio-review-state.js');

const labels = JSON.parse(fs.readFileSync(path.join(__dirname,
    '../data/hunt/world-monster-audio-review-labels.json'), 'utf8'));
const completed = labels.runtimePolicy?.completedMonsterIds || [];
const unresolved = [];
let authored = 0;
let adapted = 0;

for (const monsterId of completed) {
    const map = loadHuntPatternAudioMap(monsterId);
    for (const pattern of map.patterns) {
        const { timeline } = pattern;
        assert(pattern.motionGraph && Array.isArray(pattern.motionGraph.beats),
            `${monsterId}/${pattern.id}: every reviewed pattern must expose the unified motion graph`);
        assert.strictEqual(pattern.motionGraph.beats.length, timeline.beats.length,
            `${monsterId}/${pattern.id}: motion graph and editor timeline must share every beat`);
        assert.notStrictEqual(pattern.runtimeMotionBackend, 'retimed-css',
            `${monsterId}/${pattern.id}: the retired CSS editor backend must not leak into review data`);
        assert.notStrictEqual(timeline.source, 'legacy-phases',
            `${monsterId}/${pattern.id}: fabricated additive phase timeline is forbidden`);
        assert(!pattern.slots.some(slot => 'legacySlot' in slot || 'legacySlots' in slot),
            `${monsterId}/${pattern.id}: editor slots must not expose legacy phase-route ownership`);
        assert(!pattern.motionGraph.beats.some(beat => beat.hit === true
            || beat.hitOffsetTicks != null || beat.judgmentOffsets != null),
            `${monsterId}/${pattern.id}: unified judgments must be the sole authored impact schema`);
        assert.strictEqual(timeline.beats.reduce((sum, beat) => sum + beat.ticks, 0),
            timeline.durationTicks, `${monsterId}/${pattern.id}: timeline must have no gaps or overlap`);
        assert.deepStrictEqual(timeline.beats.map(beat => beat.startTicks),
            timeline.beats.map((_, index) => index === 0 ? 0 : timeline.beats[index - 1].endTicks),
            `${monsterId}/${pattern.id}: adjacent timeline beats must share an exact boundary`);
        if (timeline.source === 'keyframe-motion') {
            adapted += 1;
            const preview = buildPreviewMotion(pattern, timeline, createMotionDraft(pattern, timeline));
            assert.strictEqual(preview.motion, null,
                `${monsterId}/${pattern.id}: retimed CSS playback must not be replaced by inert BEAT motion`);
            assert.strictEqual(preview.runtimeTimingBeats.length, timeline.beats.length,
                `${monsterId}/${pattern.id}: retimed CSS playback must preserve every timeline beat`);
            const hitTicks = timeline.beats.filter(beat => beat.hit).map(beat => beat.startTicks);
            assert(hitTicks.length > 0 || !pattern.slots.some(slot => slot.phase === 'impact'),
                `${monsterId}/${pattern.id}: an impact slot requires a real runtime hit tick`);
        } else if (timeline.source === 'unresolved-motion') {
            unresolved.push(`${monsterId}/${pattern.id}`);
        } else if (timeline.source === 'beat-motion') {
            authored += 1;
            const preview = buildPreviewMotion(pattern, timeline, createMotionDraft(pattern, timeline));
            assert(Array.isArray(preview.motion) && preview.motion.length === timeline.beats.length,
                `${monsterId}/${pattern.id}: authored BEAT playback must retain its motion graph`);
        }
    }
}

assert.deepStrictEqual(unresolved, [],
    `every completed monster pattern must use authored or retimed BEAT timing: ${unresolved.join(', ')}`);

console.log(`[test] reviewed timeline audit passed: ${completed.length} monsters; `
    + `${authored} authored BEAT, ${adapted} keyframe BEAT graphs.`);
