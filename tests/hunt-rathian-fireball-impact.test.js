'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CandidateCatalog = require('../js/effects/hunt/HuntMonsterCandidateCatalog.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');

const kit = JSON.parse(fs.readFileSync(path.resolve(
    __dirname, '../data/hunt/monster-kits/candidates/rathian.json'), 'utf8'));
const fireball = CandidateCatalog.compileKit(kit).actions.find(action => action.id === 'rathian.fireball');
const tripleFireball = CandidateCatalog.compileKit(kit).actions.find(action => action.id === 'rathian.triple_fireball');
const timeline = ActionPolicy.impactTimeline(fireball);
const tripleTimeline = ActionPolicy.impactTimeline(tripleFireball);
const expectedImpactTick = fireball.beatV2.beats
    .slice(0, 2)
    .reduce((total, beat) => total + Number(beat.ticks || 0), 0) + 4;

assert.strictEqual(fireball.delivery, 'projectile',
    'candidate projectile action must retain detached-delivery semantics into the live executor');
assert.deepStrictEqual(timeline.map(event => [event.atTicks, event.judgmentGroup]), [[expectedImpactTick, 'spit:damage:2']],
    'Rathian fireball must expose its impact on the authored spit beat, not a stale fixed tick');
assert.strictEqual(fireball.beatV2.events.filter(event => event.kind === 'audio' && event.slot === 'impact').length, 0,
    'impact SE must not be an unconditional recovery audio event');
assert.strictEqual(tripleFireball.delivery, 'projectile',
    'triple fireball must use the same detached projectile delivery contract as the single fireball');
assert.deepStrictEqual(tripleFireball.beatV2.beats.map(beat => beat.id),
    ['look', 'inhale', 'spit-primary', 'spit-left', 'spit-right', 'recover'],
    'triple fireball must retain three distinct spits after the shared windup');
assert.deepStrictEqual(tripleTimeline.map(event => [event.targetMode, event.judgmentGroup]), [
    ['judgment-primary', 'spit-primary:damage:4'],
    ['judgment-left', 'spit-left:damage:4'],
    ['judgment-right', 'spit-right:damage:4']
], 'triple fireball must deliver primary → left → right, one projectile per spit');

console.log('[test] Rathian fireball impact outcome contract passed.');
