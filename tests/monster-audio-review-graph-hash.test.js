'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { HuntBeatV2Contract } = require('../js/effects/hunt/HuntBeatV2Contract.js');
const { candidateKitRecordFor, saveCandidatePatternMotion } = require('../tools/monster-audio-review-server.js');

const sourcePath = path.join(__dirname, '..', 'data', 'hunt', 'monster-kits', 'candidates', 'rathian.json');
const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-graph-hash-'));
const temporaryPath = path.join(temporaryDir, 'rathian.json');
fs.copyFileSync(sourcePath, temporaryPath);

try {
    const record = candidateKitRecordFor({ candidate: 'rathian' }, 'rathian', temporaryDir);
    const action = record.kit.actions.find(item => item.id === 'rathian.fireball');
    const graphHash = HuntBeatV2Contract.fingerprint(action.graph);
    const beats = Object.fromEntries(action.graph.beats.map(beat => [beat.id, {
        ticks: beat.ticks,
        ...(beat.label ? { label: beat.label } : {})
    }]));

    assert.throws(() => saveCandidatePatternMotion({
        huntId: 'rathian', patternId: action.id, candidate: 'rathian', beats,
        graphHash: 'beat-v2:stale'
    }, { candidateKitsDir: temporaryDir }), /stale/,
    'a stale editor graph must be rejected before mutating the candidate file');
    assert.strictEqual(HuntBeatV2Contract.fingerprint(JSON.parse(fs.readFileSync(temporaryPath, 'utf8'))
        .actions.find(item => item.id === action.id).graph), graphHash);

    const result = saveCandidatePatternMotion({
        huntId: 'rathian', patternId: action.id, candidate: 'rathian', beats, graphHash
    }, { candidateKitsDir: temporaryDir });
    assert.strictEqual(result.candidateSaved, true);
    assert.strictEqual(result.graphHash, HuntBeatV2Contract.fingerprint(JSON.parse(
        fs.readFileSync(temporaryPath, 'utf8')).actions.find(item => item.id === action.id).graph));
} finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true });
}

console.log('[test] candidate graph fingerprint rejects stale saves and verifies reload');
