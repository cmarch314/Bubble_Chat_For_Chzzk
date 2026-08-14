'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CandidateCatalog = require('../js/effects/hunt/HuntMonsterCandidateCatalog.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');

const kit = JSON.parse(fs.readFileSync(path.resolve(
    __dirname, '../data/hunt/monster-kits/candidates/rathian.json'), 'utf8'));
const fireball = CandidateCatalog.compileKit(kit).actions.find(action => action.id === 'rathian.fireball');
const timeline = ActionPolicy.impactTimeline(fireball);

assert.deepStrictEqual(timeline.map(event => [event.atTicks, event.judgmentGroup]), [[17, 'spit:damage:2']],
    'Rathian fireball must expose one exact authored judgment group for its conditional impact sound');
assert.strictEqual(fireball.beatV2.events.filter(event => event.kind === 'audio' && event.slot === 'impact').length, 0,
    'impact SE must not be an unconditional recovery audio event');

console.log('[test] Rathian fireball impact outcome contract passed.');
