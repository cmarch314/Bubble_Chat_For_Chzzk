'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadHuntPatternAudioMap } = require('../tools/hunt-audio-pattern-map');

const patterns = loadHuntPatternAudioMap('em007').patterns;
const reactions = new Map(patterns
    .filter(pattern => (pattern.tags || []).includes('review-reaction'))
    .map(pattern => [pattern.id, pattern]));

const flinch = reactions.get('__reaction.flinch');
assert.deepStrictEqual(flinch.motion.map(beat => [beat.beat, beat.ticks]), [
    ['reaction', 3], ['recoil', 7], ['brace', 8], ['recover', 12]
], 'flinch must preserve the authored uppercut recoil, brace and recovery rhythm');
assert.strictEqual(flinch.motion[0].origin, '50% 88%',
    'the flinch must pivot near the planted feet instead of spinning around the torso');
const css = fs.readFileSync(path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');
assert.doesNotMatch(css, /@keyframes monster-part-flinch/,
    'live part reactions must use the shared BEAT profile rather than a second CSS timeline');
const largeBreak = reactions.get('__reaction.tail-sever');
assert.deepStrictEqual(largeBreak.motion.map(beat => [beat.beat, beat.ticks]), [
    ['reaction', 4], ['roll-1', 11], ['roll-2', 12], ['down', 20], ['recover', 13]
], 'large part break must preserve the former two-roll tail-sever reaction');
assert.deepStrictEqual(largeBreak.motion.map(beat => beat.rotation), [-14, 170, 700, 720, 720],
    'large part break recovery must stand up without visibly reverse-spinning the two rolls');

for (const id of [
    '__reaction.flinch',
    '__reaction.knockdown',
    '__reaction.stun',
    '__reaction.pitfall',
    '__reaction.paralysis',
    '__reaction.sleep',
    '__reaction.death',
    '__reaction.tail-sever',
    '__visual.part-break'
]) {
    assert.ok(reactions.has(id), `audio review must expose ${id}`);
    const pattern = reactions.get(id);
    if (id === '__visual.part-break') {
        assert.deepStrictEqual(pattern.slots.map(slot => slot.slot), ['beat:se'],
            'the independent part-break visual layer must own one universal SE only');
    } else if (id === '__reaction.knockdown' || id === '__reaction.stun') {
        assert.deepStrictEqual(pattern.slots.map(slot => slot.slot), [
            'beat:reaction',
            'beat:struggle-1',
            'beat:struggle-2',
            'beat:struggle-3',
            'beat:struggle-4',
            'beat:struggle-5',
            'beat:rise'
        ], `${id} must expose every authored struggle as a live sound moment`);
        assert.deepStrictEqual(pattern.timeline.beats
            .filter(beat => beat.id.startsWith('struggle-'))
            .map(beat => beat.ticks), [14, 14, 14, 14, 14],
        `${id} must inherit the saved knockdown timing overrides`);
    } else if (id === '__reaction.paralysis') {
        assert.deepStrictEqual(pattern.slots.map(slot => slot.slot), ['beat:held'],
            'paralysis must expose its real held BEAT instead of being filtered out');
    } else if (id === '__reaction.sleep') {
        assert.deepStrictEqual(pattern.slots.map(slot => slot.slot), [
            'beat:sleep-enter', 'beat:held', 'beat:wake'
        ], 'sleep must expose exactly collapse, held and wake sound moments');
    } else if (id === '__reaction.tail-sever') {
        assert.deepStrictEqual(pattern.slots.map(slot => slot.slot), [
            'beat:reaction', 'beat:roll-1', 'beat:roll-2', 'beat:down', 'beat:recover'
        ], 'tail-sever must expose every authored reaction sound moment');
    } else if (id === '__reaction.pitfall') {
        const expected = ['reaction',
            'held-1', 'held-2', 'held-3',
            'held-4', 'held-5', 'held-6', 'release'];
        assert.deepStrictEqual(pattern.timeline.beats.map(beat => beat.id), expected,
            'trap review must expose fall, six resistance-aware struggles and escape');
        assert.deepStrictEqual(pattern.timeline.beats.map(beat => beat.label), [
            '지반 붕괴', '허덕임 1', '허덕임 2', '허덕임 3',
            '허덕임 4', '허덕임 5', '허덕임 6', '탈출'
        ], 'the editor must name every assignable pitfall phase explicitly');
        assert.deepStrictEqual(pattern.timeline.beats
            .filter(beat => beat.id.startsWith('held-'))
            .map(beat => beat.ticks), [12, 12, 12, 12, 12, 12],
        'every pitfall struggle phase must last 1.2 seconds');
        assert.deepStrictEqual(pattern.slots.map(slot => slot.slot), expected.flatMap(beat => [
            `beat:${beat}-se`, `beat:${beat}-vo`
        ]), 'every trap phase must expose independent SE and VO slots');
        assert.deepStrictEqual(pattern.timeline.beats.map(beat => beat.audioSlots), expected.map(beat => [
            `beat:${beat}-se`, `beat:${beat}-vo`
        ]), 'each authored trap phase must own both sound layers');
    } else {
        assert.deepStrictEqual(pattern.slots.map(slot => slot.slot), ['beat:reaction'],
            `${id} must expose only its live reaction sound moment`);
    }
    assert.ok(pattern.timeline.beats.length >= (
        id === '__reaction.paralysis' || id === '__visual.part-break' ? 1 : 2
    ),
        `${id} must retain its complete visual reaction timeline`);
}

const knockdown = reactions.get('__reaction.knockdown');
const stun = reactions.get('__reaction.stun');
assert.deepStrictEqual(stun.motion, knockdown.motion,
    'stun and knockdown must expose one identical authored body timeline');
assert.deepStrictEqual(stun.timeline.beats.map(beat => [beat.id, beat.startTicks, beat.ticks]),
    knockdown.timeline.beats.map(beat => [beat.id, beat.startTicks, beat.ticks]),
    'stun must not retain an independent held timeline');
assert.deepStrictEqual(stun.slots.map(slot => slot.effective),
    knockdown.slots.map(slot => slot.effective),
    'stun must inherit every reviewed knockdown sound mapping beat-for-beat');

console.log('[test] audio review reaction and anatomy entries passed.');
