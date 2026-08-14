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
const sourceMotion = JSON.parse(fs.readFileSync(path.join(root,
    'data/hunt/monster-pattern-motion-overrides.json'), 'utf8')).overrides || {};
const generatedMotion = require('../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');

assert.deepStrictEqual(generatedMotion, sourceMotion,
    'the OBS runtime artifact must be an exact serialization of the editor source of truth');
assert.match(reviewApp, /data-field="hitReactionKind"/,
    'Preview judgments must author the live hit reaction instead of relying on profile tags');
assert.doesNotMatch(reviewApp, /data-field="hitRecoveryTicks"/,
    'Preview monster judgments must not expose hunter-owned invulnerability timing');

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
assert.match(fixture, /const displayedTargets=\[\.\.\.selection\.indices\]\.sort/,
    'the Preview must display adjacent pairs consistently as 1·2, 2·3, or 3·4 without changing hit order');
assert.match(reviewApp, /if \(play\) app\.previewActionSeed = Math\.max/);
assert.match(reviewApp, /scenario: \{ \.\.\.snapshot\.scenario, seed: app\.previewActionSeed/,
    'each new Preview action must receive a fresh seed while scrub/settings retain the current action');

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
