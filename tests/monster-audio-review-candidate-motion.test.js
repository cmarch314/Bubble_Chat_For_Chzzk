'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    candidateKitRecordFor,
    saveCandidatePatternMotion
} = require('../tools/monster-audio-review-server.js');
const { loadHuntPatternAudioMap } = require('../tools/hunt-audio-pattern-map.js');
const ReviewState = require('../tools/monster-audio-review-state.js');

const source = path.join(__dirname, '..', 'data', 'hunt', 'monster-kits', 'candidates', 'rathian.json');
const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-candidate-motion-'));
const candidateFile = path.join(temporaryDir, 'rathian.json');

try {
    fs.copyFileSync(source, candidateFile);
    const record = candidateKitRecordFor({ candidate: 'rathian' }, 'rathian', temporaryDir);
    const fireball = record.kit.actions.find(item => item.id === 'rathian.fireball');
    assert.deepEqual(fireball.graph.beats.map(beat => beat.id), ['look', 'inhale', 'spit', 'recover'],
        'Rathian fireball must expose one canonical four-beat breathing timeline');
    const fireballBeat = id => fireball.graph.beats.find(beat => beat.id === id);
    const fireballVisual = id => fireballBeat(id).tracks.visual.at(-1).value;
    assert.ok(fireballVisual('inhale').scaleX > 1 && fireballVisual('inhale').scaleY > 1,
        'inhale must visibly expand the monster image');
    assert.ok(fireballVisual('spit').scaleX < 1 && fireballVisual('spit').scaleY < 1,
        'spit must visibly contract the monster image');
    assert.equal(fireballVisual('recover').scaleX, 1);
    assert.equal(fireballVisual('recover').scaleY, 1);
    assert.equal(fireball.graph.beats.filter(beat => beat.events?.some(event => event.kind === 'damage')).length, 1,
        'fireball launch judgment must have exactly one BEAT owner');
    assert.ok(fireballBeat('spit').events.some(event => event.kind === 'damage'),
        'the fireball projectile must launch from spit');

    const action = record.kit.actions.find(item => item.id === 'rathian.roar');
    const beats = Object.fromEntries(action.graph.beats.map((beat, index) => [beat.id, {
        ticks: beat.ticks + (index === 0 ? 1 : 0),
        pose: index === 0 ? 'brace' : undefined,
        rotation: index === 0 ? 45 : undefined,
        rotationResetMode: index === 0 ? 'preserve' : undefined,
        judgments: index === 0 ? [{ id: 'review-roar', group: 'review-roar', kind: 'roar',
            target: 'all', size: 'large', offsetTicks: 2 }] : []
    }]));

    const result = saveCandidatePatternMotion({
        huntId: 'rathian',
        patternId: 'rathian.roar',
        candidate: 'rathian',
        candidateRecord: record,
        beats
    });
    assert.equal(result.candidateSaved, true);
    const persisted = JSON.parse(fs.readFileSync(candidateFile, 'utf8'));
    const edited = persisted.actions.find(item => item.id === 'rathian.roar').graph.beats[0];
    assert.equal(edited.ticks, action.graph.beats[0].ticks + 1);
    const visual = edited.tracks.visual.at(-1).value;
    assert.equal(visual.rotation, 45);
    assert.equal(visual.keepRotation, undefined);
    assert.equal(visual.rotationResetMode, 'preserve');
    assert.equal(edited.events.find(event => event.id === 'review-roar')?.kind, 'roar',
        'candidate judgments must persist as native BEAT events');

    // A projectile damage event carries runtime linkage (projectileId) that
    // is intentionally not an editable motion field.  Saving an unchanged
    // candidate draft used to strip it, fail the BEAT graph validator, and
    // roll the user's timing edit back.
    const projectileRecord = candidateKitRecordFor({ candidate: 'rathian' }, 'rathian', temporaryDir);
    const projectilePattern = loadHuntPatternAudioMap('rathian', { candidateKit: projectileRecord.kit }).patterns
        .find(pattern => pattern.id === 'rathian.triple_fireball');
    const projectileDraft = ReviewState.createMotionDraft(projectilePattern, projectilePattern.timeline);
    projectileDraft['spit-left'].ticks += 1;
    const projectileSave = saveCandidatePatternMotion({
        huntId: 'rathian', patternId: 'rathian.triple_fireball', candidate: 'rathian',
        candidateRecord: projectileRecord, beats: projectileDraft
    });
    assert.equal(projectileSave.candidateSaved, true,
        'candidate projectile timing edits must survive save/reload validation');
    const projectilePersisted = JSON.parse(fs.readFileSync(candidateFile, 'utf8'))
        .actions.find(action => action.id === 'rathian.triple_fireball');
    assert.equal(projectilePersisted.graph.beats.find(beat => beat.id === 'spit-left').events
        .find(event => event.id === 'fireball-1:contact')?.projectileId, 'fireball-1',
    'candidate saving must retain non-editor projectile linkage metadata');

    for (const resetMode of ['auto', 'preserve', 'snap-end', 'animate']) {
        const tailRecord = candidateKitRecordFor({ candidate: 'rathian' }, 'rathian', temporaryDir);
        const candidateMap = loadHuntPatternAudioMap('rathian', { candidateKit: tailRecord.kit });
        const tailPattern = candidateMap.patterns.find(item => item.id === 'rathian.tail_sweep');
        const tailDraft = ReviewState.createMotionDraft(tailPattern, tailPattern.timeline);
        assert.equal(tailDraft.wind.rotation, undefined,
            'candidate editor drafts must canonicalize duplicate absolute/directed rotation');
        tailDraft.return.rotationResetMode = resetMode;
        const tailSave = saveCandidatePatternMotion({
            huntId: 'rathian', patternId: 'rathian.tail_sweep', candidate: 'rathian',
            candidateRecord: tailRecord, beats: tailDraft
        });
        assert.equal(tailSave.beats.return.rotationResetMode, resetMode,
            'candidate save response must retain every authored return-rotation mode');
        const reloadedKit = JSON.parse(fs.readFileSync(candidateFile, 'utf8'));
        const reloadedMap = loadHuntPatternAudioMap('rathian', { candidateKit: reloadedKit });
        const reloadedTail = reloadedMap.patterns.find(item => item.id === 'rathian.tail_sweep');
        const reloadedDraft = ReviewState.createMotionDraft(reloadedTail, reloadedTail.timeline);
        assert.equal(reloadedDraft.return.rotationResetMode, resetMode,
            'the editor reload projection must read every saved return-rotation mode from native BEAT');
        assert.equal(ReviewState.compareMotionValues(tailSave.beats, reloadedDraft).equal, true,
            'the server-confirmed return-rotation value must survive editor reload verification');
        assert.equal(reloadedDraft.wind.rotation, undefined,
            'candidate save must not recreate a second absolute rotation owner');
    }
} finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
}

console.log('monster audio review candidate motion tests passed');
