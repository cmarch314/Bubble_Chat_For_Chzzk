'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const CandidateCatalog = require('../js/effects/hunt/HuntMonsterCandidateCatalog.js');

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
    assert.strictEqual(action.beatV2.totalTicks, monsterId === 'rathian' ? 45 : 19);
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
assert.deepStrictEqual(rathian.actions.find(action => action.id === 'rathian.roar').motion.map(beat => beat.ticks),
    [10, 2, 33]);

const source = fs.readFileSync(path.join(root, 'js', 'effects', 'hunt', 'HuntMonsterCandidateCatalog.js'), 'utf8');
assert.ok(!source.includes('HuntBeatV2Adapter'), 'native candidates must not import the legacy adapter');
console.log('[test] Native monster candidate kits compile directly from the BEAT contract.');
