'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fixture = fs.readFileSync(path.join(root,
    'tests/fixtures/hunt-monster-pattern-lab.html'), 'utf8');
const reviewApp = fs.readFileSync(path.join(root,
    'tools/monster-audio-review-app.js'), 'utf8');
const executor = fs.readFileSync(path.join(root,
    'js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');

assert.match(fixture, /pattern=HuntMonsterPatternCatalog\.synchronizeEditedPattern\(pattern\)/,
    'Preview must compile its current draft through the same catalog normalizer as live hunts');
assert.match(fixture, /HuntMonsterActionPolicy\.rollTargetCount\(/,
    'Preview and live hunts must share target-count selection');
assert.match(executor, /actionPolicy\(\)\.rollTargetCount\(/,
    'live hunts must use the shared target-count selection');
assert.doesNotMatch(fixture.slice(
    fixture.indexOf('function resolvePreviewTargets'),
    fixture.indexOf('function patternEmoji')
), /Math\.random/,
    'Preview target resolution must be reproducible from its scenario seed');
assert.match(fixture, /result:'effect'/,
    'an empty judgment set may retain a presentation anchor but must not invent a hit');

const audioFunction = reviewApp.slice(
    reviewApp.indexOf('function playTimelineAudio'),
    reviewApp.indexOf('function playCurrentPreview')
);
assert.match(audioFunction, /previewAudioSchedule/,
    'Preview audio must use a timeline schedule');
assert.match(audioFunction, /emitPreviewAudioThrough/,
    'Preview audio must advance from the playback clock');
assert.doesNotMatch(audioFunction, /setTimeout/,
    'Preview audio must not drift through pause on independent timers');
assert.match(reviewApp, /previewAudios\.forEach\(clip => clip\.play\(\)\.catch/,
    'resuming Preview must resume clips that were paused with its timeline');

console.log('[test] Preview/live runtime contract passed.');
