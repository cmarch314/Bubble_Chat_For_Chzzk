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
        '__reaction.part-break-large': {
            'beat:break-se': { label: 'large break SE', layers: [['local_assets/x/large_break.mp3', 0.8, 0]] },
            'beat:break-vo': { label: 'large break VO', layers: [['local_assets/x/large_voice.mp3', 0.8, 0]] }
        },
        '__reaction.flinch': {
            'beat:reaction': { label: 'flinch', layers: [['local_assets/x/flinch.mp3', 0.8, 0]] }
        },
        '__reaction.pitfall': {
            'beat:held-se': { label: 'pitfall struggle SE', layers: [['local_assets/x/trap_struggle.mp3', 0.8, 0]] },
            'beat:held-vo': { label: 'pitfall struggle VO', layers: [['local_assets/x/trap_voice.mp3', 0.8, 0]] },
            'beat:held-2-se': { label: 'pitfall held 2 SE', layers: [['local_assets/x/trap_held_2.mp3', 0.8, 0]] },
            'beat:held-2-vo': { label: 'pitfall held 2 VO', layers: [['local_assets/x/trap_held_voice_2.mp3', 0.8, 0]] }
        },
        '__part.left-horn': {
            'beat:break-se': { label: 'horn break SE', layers: [['local_assets/x/horn_break.mp3', 0.8, 0]] },
            'beat:break-vo': { label: 'horn break VO', layers: [['local_assets/x/horn_voice.mp3', 0.8, 0]] }
        },
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

played = null;
manager.playMonsterAction('diablos', 'flinch', {});
assert.ok(played?.layers?.[0]?.[0]?.endsWith('flinch.mp3'),
    'the reaction-list assignment must drive the live generic flinch cue');
played = null;
const partBreakLayers = [];
manager.playVerifiedLayers = variant => { partBreakLayers.push(variant.layers[0][0]); return true; };
manager.playMonsterAction('diablos', 'knockdown', { sourcePart: 'left-horn' });
assert.deepStrictEqual(partBreakLayers, [
    'local_assets/x/horn_break.mp3', 'local_assets/x/horn_voice.mp3'
], 'a live part break must play its independently assigned break SE and monster VO together');
partBreakLayers.length = 0;
manager.playMonsterAction('diablos', 'knockdown', { sourcePart: 'left-horn', partBreakSize: 'large' });
assert.deepStrictEqual(partBreakLayers, [
    'local_assets/x/large_break.mp3', 'local_assets/x/large_voice.mp3'
], 'live combat must prefer the shared large-break group over a legacy per-part assignment');
partBreakLayers.length = 0;
manager.playMonsterAction('diablos', 'trap', {
    trapKind: 'pitfall', trapPhase: 'struggle', overrideOnly: true
});
assert.deepStrictEqual(partBreakLayers, [
    'local_assets/x/trap_struggle.mp3', 'local_assets/x/trap_voice.mp3'
], 'live pitfall struggle must play its independently assigned SE and monster VO together');
partBreakLayers.length = 0;
manager.playMonsterAction('diablos', 'trap', {
    trapKind: 'pitfall', trapPhase: 'held-2', overrideOnly: true
});
assert.deepStrictEqual(partBreakLayers, [
    'local_assets/x/trap_held_2.mp3', 'local_assets/x/trap_held_voice_2.mp3'
], 'each authored held phase must use its own independently assigned SE and VO');
manager.playVerifiedLayers = variant => { played = variant; return true; };
manager.playVerifiedMonsterCue = () => { fellBack = true; return true; };
manager.playGenericMonsterSeFallback = () => { fellBack = true; return true; };

// A reviewed random pool must not repeatedly select the same layer. This is
// especially important for two-source slots, where repetition looks broken.
const randomRoute = { mode: 'random', layers: [
    ['local_assets/x/voice-a.mp3', 0.7, 0],
    ['local_assets/x/voice-b.mp3', 0.7, 0]
] };
const randomPicks = [];
manager.playVerifiedLayers = variant => { randomPicks.push(variant.layers[0][0]); return true; };
manager.playPatternAudioRoute(randomRoute, 'barioth:shoulder_check:beat:spring-load');
manager.playPatternAudioRoute({ ...randomRoute, layers: randomRoute.layers.map(layer => [...layer]) },
    'barioth:shoulder_check:beat:spring-load');
assert.notStrictEqual(randomPicks[0], randomPicks[1],
    'two-source random routes must alternate even when the effective route object is rebuilt');
manager.playVerifiedLayers = variant => { played = variant; return true; };

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

// Once a pattern owns a BEAT-native route, generic start/impact hooks must not
// duplicate it. Only the compiler-scheduled explicit beat slot may play.
global.HUNT_MONSTER_PATTERN_AUDIO_ROUTES.diablos['diablos.beat_native'] = {
    'beat:impact': { layers: [['local_assets/x/beat_impact.mp3', 0.8, 0]] },
    impact: { layers: [['local_assets/x/stale_legacy_impact.mp3', 0.8, 0]] },
    recovery: { layers: [['local_assets/x/stale_legacy_recovery.mp3', 0.8, 0]] }
};
played = null; fellBack = false;
result = manager.playMonsterAction('diablos', 'attack', { patternId: 'diablos.beat_native' });
assert.strictEqual(result, false);
assert.strictEqual(played, null);
assert.strictEqual(fellBack, false, 'legacy catalog fallback must be suppressed for BEAT-native patterns');
result = manager.playMonsterAction('diablos', 'attack', {
    patternId: 'diablos.beat_native', patternSlot: 'beat:impact', overrideOnly: true
});
assert.strictEqual(result, true);
assert.ok(played.layers[0][0].endsWith('beat_impact.mp3'));

played = null;
result = manager.playMonsterAction('diablos', 'impact', {
    patternId: 'diablos.beat_native', patternSlot: 'impact', overrideOnly: true
});
assert.strictEqual(result, false, 'legacy impact must never layer over a BEAT-owned pattern');
assert.strictEqual(played, null);
result = manager.playMonsterAction('diablos', 'recovery', {
    patternId: 'diablos.beat_native', patternSlot: 'recovery', overrideOnly: true
});
assert.strictEqual(result, false, 'legacy recovery must never layer over a BEAT-owned pattern');
assert.strictEqual(played, null);

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
