'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const catalog = require('../js/effects/hunt/HuntAudioCatalog.js');
global.HUNT_VERIFIED_LOCAL_MONSTER_CUES = catalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES;
global.HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES = catalog.HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES;
global.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS = catalog.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS;
global.HUNT_ROAR_ROUTE = catalog.HUNT_ROAR_ROUTE;

const HuntAudioManager = require('../js/effects/hunt/HuntAudioManager.js');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const { patternAudioSlots } = require('../tools/hunt-audio-pattern-map.js');
const { generate } = require('../scripts/generate-monster-pattern-audio-routes.js');

// --- kind/phase -> override slot mapping ---
assert.strictEqual(HuntAudioManager.resolveOverrideSlot('telegraph', {}), 'telegraph');
assert.strictEqual(HuntAudioManager.resolveOverrideSlot('projectile_launch', {}), 'launch');
assert.strictEqual(HuntAudioManager.resolveOverrideSlot('charge_stride_step', {}), 'travel');
assert.strictEqual(HuntAudioManager.resolveOverrideSlot('anything', { audioPhase: 'action-start' }), 'start');
assert.strictEqual(HuntAudioManager.resolveOverrideSlot('impact', { patternSlot: 'impact:rock' }), 'impact:rock');
assert.strictEqual(HuntAudioManager.resolveOverrideSlot('attack', {}), null);

// --- runtime impact slot key must match the review-tool derivation ---
assert.strictEqual(
    HuntMonsterTurnExecutor.impactSlotKey({ runtimeImpactAudioCue: 'rock', impactTimeline: [{ audioCue: 'rock' }] }),
    'impact:rock');
assert.strictEqual(
    HuntMonsterTurnExecutor.impactSlotKey({ impactTimeline: [{}, {}], runtimeImpactTimelineIndex: 1 }),
    'impact-2');
assert.strictEqual(HuntMonsterTurnExecutor.impactSlotKey({ impactTimeline: [{}] }), 'impact');
// cross-check the multi-hit key against what the tool exposes for the same pattern
const multiSlots = patternAudioSlots({ id: 'x.tail', type: 'area', tags: ['tail'], impactTimeline: [{}, {}] }).map(s => s.slot);
assert.ok(multiSlots.includes('impact-1') && multiSlots.includes('impact-2'));

// --- playMonsterAction honours the override before any catalog/fallback ---
global.HUNT_MONSTER_PATTERN_AUDIO_ROUTES = {
    diablos: {
        'diablos.tail_slam_rock': {
            'impact:rock': { label: 'rock hit', layers: [['local_assets/x/rock_hit.mp3', 0.8, 0]] },
            launch: { label: 'rock throw', layers: [['local_assets/x/rock_throw.mp3', 0.7, 0]] },
            recovery: { disabled: true }
        }
    }
};
const manager = Object.create(HuntAudioManager.prototype);
manager.monsterGroup = () => null;
let played = null;
let fellBack = false;
manager.playVerifiedLayers = variant => { played = variant; return true; };
manager.playVerifiedMonsterCue = () => { fellBack = true; return true; };
manager.playGenericMonsterSeFallback = () => { fellBack = true; return true; };

// impact override plays the mapped layers, not a fallback
played = null; fellBack = false;
let result = manager.playMonsterAction('diablos', 'impact', { patternId: 'diablos.tail_slam_rock', patternSlot: 'impact:rock', overrideOnly: true });
assert.strictEqual(result, true);
assert.ok(played && played.layers[0][0].endsWith('rock_hit.mp3'), 'impact override must play the mapped sound');
assert.strictEqual(fellBack, false, 'override must pre-empt any fallback');

// launch resolves from the projectile_launch kind
played = null;
manager.playMonsterAction('diablos', 'projectile_launch', { patternId: 'diablos.tail_slam_rock' });
assert.ok(played && played.layers[0][0].endsWith('rock_throw.mp3'), 'launch override resolves via kind');

// overrideOnly with no mapping stays silent (no fallback, no sound)
played = null; fellBack = false;
result = manager.playMonsterAction('diablos', 'recovery', { patternId: 'diablos.tail_slam_rock', patternSlot: 'recovery', overrideOnly: true });
assert.strictEqual(result, false, 'unmapped overrideOnly phase must be silent');
assert.strictEqual(played, null);
assert.strictEqual(fellBack, false);

// An explicit removal is authoritative and must not fall through to catalogs.
played = null; fellBack = false;
result = manager.playMonsterAction('diablos', 'recovery', {
    patternId: 'diablos.tail_slam_rock', patternSlot: 'recovery'
});
assert.strictEqual(result, false);
assert.strictEqual(played, null);
assert.strictEqual(fellBack, false);

// --- generator round-trips the overrides JSON into a runtime global ---
const src = path.join(os.tmpdir(), `pa-src-${process.pid}.json`);
const out = path.join(os.tmpdir(), `pa-out-${process.pid}.generated.js`);
fs.writeFileSync(src, JSON.stringify({ version: 1, routes: { diablos: { 'diablos.roar': { roar: { layers: [['a.mp3', 0.7, 0]] } } } } }));
const stats = generate({ sourcePath: src, outputPath: out });
assert.strictEqual(stats.monsters, 1);
assert.strictEqual(stats.slots, 1);
const emitted = fs.readFileSync(out, 'utf8');
assert.ok(emitted.includes('HUNT_MONSTER_PATTERN_AUDIO_ROUTES'));
assert.ok(emitted.includes('diablos.roar'));
try { fs.unlinkSync(src); fs.unlinkSync(out); } catch { /* best effort */ }

console.log('[test] pattern-audio runtime override, phase triggers, and generator passed.');
