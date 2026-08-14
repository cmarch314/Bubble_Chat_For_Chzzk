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
    const action = record.kit.actions.find(item => item.id === 'rathian.roar');
    const beats = Object.fromEntries(action.graph.beats.map((beat, index) => [beat.id, {
        ticks: beat.ticks + (index === 0 ? 1 : 0),
        pose: index === 0 ? 'brace' : undefined,
        rotation: index === 0 ? 45 : undefined,
        keepRotation: index === 0,
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
    assert.equal(visual.keepRotation, true);
    assert.equal(edited.events.find(event => event.id === 'review-roar')?.kind, 'roar',
        'candidate judgments must persist as native BEAT events');

    const tailRecord = candidateKitRecordFor({ candidate: 'rathian' }, 'rathian', temporaryDir);
    const candidateMap = loadHuntPatternAudioMap('rathian', { candidateKit: tailRecord.kit });
    const tailPattern = candidateMap.patterns.find(item => item.id === 'rathian.tail_sweep');
    const tailDraft = ReviewState.createMotionDraft(tailPattern, tailPattern.timeline);
    tailDraft.return.rotationResetMode = 'snap-end';
    const tailSave = saveCandidatePatternMotion({
        huntId: 'rathian', patternId: 'rathian.tail_sweep', candidate: 'rathian',
        candidateRecord: tailRecord, beats: tailDraft
    });
    assert.equal(tailSave.beats.return.rotationResetMode, 'snap-end',
        'candidate save response must retain the authored return-rotation mode');
    const reloadedKit = JSON.parse(fs.readFileSync(candidateFile, 'utf8'));
    const reloadedMap = loadHuntPatternAudioMap('rathian', { candidateKit: reloadedKit });
    const reloadedTail = reloadedMap.patterns.find(item => item.id === 'rathian.tail_sweep');
    const reloadedDraft = ReviewState.createMotionDraft(reloadedTail, reloadedTail.timeline);
    assert.equal(reloadedDraft.return.rotationResetMode, 'snap-end',
        'the editor reload projection must read the saved return-rotation mode from native BEAT');
    assert.equal(ReviewState.compareMotionValues(tailDraft, reloadedDraft).equal, true,
        'return-rotation edits must survive the same reload verification used by the editor');
} finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
}

console.log('monster audio review candidate motion tests passed');
