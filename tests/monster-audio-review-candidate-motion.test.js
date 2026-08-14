'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    candidateKitRecordFor,
    saveCandidatePatternMotion
} = require('../tools/monster-audio-review-server.js');

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
        keepRotation: index === 0
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
} finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
}

console.log('monster audio review candidate motion tests passed');
