'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    huntToGraphId,
    patternAudioSlots,
    buildMonsterPatternAudioMap,
    loadHuntPatternAudioMap,
    savePatternRoute
} = require('../tools/hunt-audio-pattern-map');

// hunt monster id resolves to its World audio-graph bank id.
assert.strictEqual(huntToGraphId().diablos, 'em007');
assert.strictEqual(huntToGraphId().tigrex, 'em032');
assert.ok(loadHuntPatternAudioMap('em002').patterns.length >= 12, 'em002 (Rathalos) must load patterns');
assert.ok(loadHuntPatternAudioMap('em001').patterns.length >= 13, 'em001 (Rathian) must load patterns');
assert.ok(loadHuntPatternAudioMap('em032').patterns.length >= 10, 'em032 (Tigrex) must load patterns');
assert.ok(loadHuntPatternAudioMap('em007').patterns.length >= 10, 'em007 (Diablos) must load patterns');

// slot derivation covers the distinct audio moments per pattern shape.
const roarSlots = patternAudioSlots({ id: 'x.roar', type: 'roar', tags: ['roar'] }).map(s => s.slot);
assert.deepStrictEqual(roarSlots, ['roar']);

const rock = patternAudioSlots({
    id: 'diablos.tail_slam_rock', type: 'projectile', delivery: 'projectile',
    tags: ['tail', 'projectile', 'fire'], impactTimeline: [{ audioCue: 'rock', atTicks: 27 }]
});
const rockSlots = rock.map(s => s.slot);
assert.deepStrictEqual(rock.map(s => s.phase), ['telegraph', 'launch', 'impact', 'recovery'],
    'a projectile must expose canonical phases in play order');
assert.ok(rockSlots.includes('launch'), 'rock slam must expose a launch (시작) slot');
assert.ok(rockSlots.includes('impact:rock'), 'authored rock cue must own a dedicated impact slot');
assert.strictEqual(rock.find(s => s.slot === 'impact:rock').atTicks, 27, 'impact slot carries its timeline tick');
assert.strictEqual(rock.find(s => s.slot === 'impact:rock').runtimeReady, false, 'generic impact is not yet runtime-wired');
assert.strictEqual(rock.find(s => s.slot === 'telegraph').runtimeReady, true, 'telegraph is runtime-wired');

const charge = patternAudioSlots({ id: 'diablos.horn_charge', type: 'charge', tags: ['charge'], chargeLaunchStyle: 'stomp-burst', movement: { ticks: 42 }, impactTimeline: [{ atTicks: 20 }] });
assert.deepStrictEqual(charge.map(s => s.phase), ['telegraph', 'start', 'travel', 'impact', 'recovery']);

const emergeSlots = patternAudioSlots({ id: 'diablos.burrow_emerge', type: 'charge', tags: ['charge', 'burrow-emerge'] })
    .map(s => s.slot);
assert.deepStrictEqual(emergeSlots, ['telegraph', 'impact'],
    'burrow emerge must expose a telegraph and a physical impact slot');

// build map reflects the hand-authored catalog: diablos roar/burrow are curated.
const catalog = {
    'diablos:roar': [{ label: 'Diablos roar', layers: [['a/em007_vo_roar.mp3', 0.7, 0]] }],
    'diablos:burrow': [{ label: 'Diablos burrow', layers: [['a/em007_se_burrow.mp3', 0.66, 0]] }]
};
const patterns = [
    { id: 'diablos.roar', name: '포효', type: 'roar', tags: ['roar'] },
    { id: 'diablos.burrow_enter', name: '지중 잠행', type: 'burrow', tags: ['burrow-enter'] },
    { id: 'diablos.tail_slam_rock', name: '꼬리 바위', type: 'projectile', delivery: 'projectile', tags: ['tail', 'projectile'], impactTimeline: [{ audioCue: 'rock' }] }
];
const tmp = path.join(os.tmpdir(), `hunt-audio-overrides-${process.pid}.json`);
try { fs.unlinkSync(tmp); } catch { /* fresh */ }

let map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
assert.strictEqual(map.graphId, 'em007');
const roarPattern = map.patterns.find(p => p.id === 'diablos.roar');
assert.ok(roarPattern.slots[0].current, 'roar slot must report its curated route');
const rockPattern = map.patterns.find(p => p.id === 'diablos.tail_slam_rock');
const launch = rockPattern.slots.find(s => s.slot === 'launch');
assert.strictEqual(launch.current, null, 'uncurated launch slot must read as fallback');
assert.strictEqual(launch.assigned, null);

// save an override and confirm it round-trips into the built map.
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: 'launch', files: ['local_assets/x/em007_se_launch.mp3'], gain: 0.8 }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
const assigned = map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === 'launch');
assert.ok(assigned.assigned && assigned.assigned.layers[0][0].endsWith('em007_se_launch.mp3'),
    'saved override must appear on the slot');

// clearing removes it.
savePatternRoute({ huntId: 'diablos', patternId: 'diablos.tail_slam_rock', slot: 'launch', files: [] }, tmp);
map = buildMonsterPatternAudioMap({ huntId: 'diablos', patterns, catalog, overridesPath: tmp });
assert.strictEqual(map.patterns.find(p => p.id === 'diablos.tail_slam_rock').slots.find(s => s.slot === 'launch').assigned, null);

// the real reviewed catalog resolves diablos without throwing.
const live = loadHuntPatternAudioMap('diablos', { overridesPath: tmp });
assert.ok(live.patterns.length >= 8, 'diablos must expose its reviewed pattern set');
assert.ok(live.patterns.some(p => p.id === 'diablos.tail_slam_rock'));

try { fs.unlinkSync(tmp); } catch { /* best effort */ }
console.log('[test] hunt audio pattern-map derivation, overrides, and live catalog passed.');
