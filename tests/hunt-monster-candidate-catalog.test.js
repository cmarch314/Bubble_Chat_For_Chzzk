'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const CandidateCatalog = require('../js/effects/hunt/HuntMonsterCandidateCatalog.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');

for (const monsterId of ['rathian', 'rathalos']) {
    const kit = JSON.parse(fs.readFileSync(path.join(root, 'data', 'hunt', 'monster-kits', 'candidates', `${monsterId}.json`), 'utf8'));
    const compiled = CandidateCatalog.compileKit(kit);
    assert.strictEqual(compiled.monsterId, monsterId);
    assert.ok(compiled.actions.length >= 1);
    const action = compiled.actions.find(entry => entry.id === `${monsterId}.roar`);
    assert.strictEqual(action.id, `${monsterId}.roar`);
    assert.strictEqual(action.nativeBeatCandidate, true);
    assert.strictEqual(action.reviewStatus, 'draft');
    assert.strictEqual(action.beatV2.source.kind, 'monster-candidate');
    assert.strictEqual(action.beatV2.totalTicks, monsterId === 'rathian' ? 45 : 42);
    assert.strictEqual(action.motion.reduce((sum, beat) => sum + beat.ticks, 0), action.beatV2.totalTicks);
    assert.ok(action.beatV2.events.some(event => event.kind === 'roar'));
}

const rathian = CandidateCatalog.compileKit(JSON.parse(fs.readFileSync(
    path.join(root, 'data', 'hunt', 'monster-kits', 'candidates', 'rathian.json'), 'utf8'
)));
const charge = rathian.actions.find(action => action.id === 'rathian.charge');
assert.ok(charge, 'Rathian clean rebuild starts with an explicit charge candidate');
assert.strictEqual(charge.beatV2.totalTicks, 41);
assert.deepStrictEqual(charge.beatV2.events.filter(event => event.kind === 'damage')
    .map(event => [event.beatId, event.offsetTicks, event.atTicks]), [['charge', 5, 17]]);
assert.deepStrictEqual(charge.motion.map(beat => beat.ticks), [12, 8, 7, 14]);
const bite = rathian.actions.find(action => action.id === 'rathian.bite');
assert.ok(bite, 'Rathian candidate includes the shared-timing bite');
assert.deepStrictEqual(bite.motion.map(beat => beat.ticks), [5, 3, 3, 5]);
assert.deepStrictEqual(bite.beatV2.events.filter(event => event.kind === 'damage')
    .map(event => [event.beatId, event.atTicks, event.hitReactionKind]), [['bite', 5, 'weak']]);
const tailSweep = rathian.actions.find(action => action.id === 'rathian.tail_sweep');
assert.deepStrictEqual(tailSweep.targeting, { mode: 'left-right-halves' },
    'the double tail sweep must resolve the first and second half-turns as 1·2 then 3·4');
assert.strictEqual(tailSweep.motion[0].to, 'between:hunter:1,hunter:2',
    'the sweep must enter the fixed space between hunters 2 and 3 before rotating');
assert.deepStrictEqual(tailSweep.beatV2.events.filter(event => event.kind === 'damage')
    .map(event => [event.beatId, event.target, event.atTicks]), [
        ['left-sweep', 'pair-left', 19],
        ['right-sweep', 'pair-right', 26]
    ], 'each 180° sweep must retain its own left/right impact pass');
assert.deepStrictEqual(ActionPolicy.resolveTargetScenario({
    pattern: { impactTimeline: [
        { targetMode: 'runtime-pair-left' },
        { targetMode: 'runtime-pair-right' }
    ] },
    targetable: [0, 1, 2, 3].map(index => ({ index })),
    count: 4,
    mode: tailSweep.targeting.mode
}).impactTimeline.map(impact => impact.targetIndices), [[0, 1], [2, 3]],
'the candidate target resolver must apply the half-turns to 1·2, then 3·4 without reselecting a lone hunter');
assert.deepStrictEqual(rathian.actions.find(action => action.id === 'rathian.roar').motion.map(beat => beat.ticks),
    [10, 2, 33]);
const somersault = rathian.actions.find(action => action.id === 'rathian.somersault');
assert.ok(somersault, 'Rathian candidate includes the tail-scoop somersault');
assert.strictEqual(rathian.actions.length, 13,
    'Rathian candidate must expose every reviewed World action for side-by-side feedback before release');
assert.strictEqual(somersault.flightTransition, 'takeoff');
assert.deepStrictEqual(somersault.motion.map(beat => beat.beat),
    ['approach', 'tail-load', 'tail-scoop', 'air-rise', 'airborne-settle']);
assert.deepStrictEqual(somersault.motion.slice(1, 4).map(beat => beat.rotation), [-35, 315, 360],
    'Rathian must load its curled J tail counterclockwise then scoop clockwise into flight');
assert.deepStrictEqual(somersault.motion.slice(1, 3).map(beat => beat.origin), ['part:tail', 'part:tail'],
    'the J-shaped tail, not the torso center, must remain the authored somersault scoop pivot');
assert.deepStrictEqual(somersault.motion.slice(3).map(beat => beat.partFx?.[0]?.part),
    ['left-wing', 'left-wing'],
    'the flight-only wing flutter must remain in the native BEAT projection, never in a detached CSS timeline');

const rathalos = CandidateCatalog.compileKit(JSON.parse(fs.readFileSync(
    path.join(root, 'data', 'hunt', 'monster-kits', 'candidates', 'rathalos.json'), 'utf8'
)));
assert.strictEqual(rathalos.actions.length, 13,
    'Rathalos candidate must expose every reviewed World action for side-by-side feedback before release');
const backstepFireball = rathalos.actions.find(action => action.id === 'rathalos.backstep_fireball');
assert.strictEqual(backstepFireball.flightTransition, 'takeoff');
assert.deepStrictEqual(backstepFireball.motion.map(beat => beat.beat),
    ['look', 'backstep', 'back-breath', 'takeoff', 'airborne']);
const clawDive = rathalos.actions.find(action => action.id === 'rathalos.claw_dive');
assert.strictEqual(clawDive.flightTransition, 'land');
assert.strictEqual(clawDive.beatV2.events.find(event => event.kind === 'damage').beatId, 'claw-dive');

const source = fs.readFileSync(path.join(root, 'js', 'effects', 'hunt', 'HuntMonsterCandidateCatalog.js'), 'utf8');
assert.ok(!source.includes('HuntBeatV2Adapter'), 'native candidates must not import the legacy adapter');
console.log('[test] Native monster candidate kits compile directly from the BEAT contract.');
