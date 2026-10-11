'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AudioMap = require('../tools/hunt-audio-pattern-map.js');
const HuntAudioManager = require('../js/effects/hunt/HuntAudioManager.js');

const kit = JSON.parse(fs.readFileSync(path.resolve(
    __dirname, '../data/hunt/monster-kits/candidates/rathian.json'), 'utf8'));
const fireball = AudioMap.loadHuntPatternAudioMap('rathian', { candidateKit: kit })
    .patterns.find(pattern => pattern.id === 'rathian.fireball');
const judgmentSlot = fireball.slots.find(slot => slot.judgmentGroup === 'spit:damage:2');

assert.ok(judgmentSlot, 'damage judgment groups must be exposed as first-class review slots');
assert.strictEqual(judgmentSlot.slot, 'judgment:spit%3Adamage%3A2:cue');
assert.strictEqual(judgmentSlot.when, 'hit', 'judgment sounds default to confirmed hit only');
assert.strictEqual(judgmentSlot.beatId, 'spit');

const route = { when: 'hit', layers: [['local_assets/test.mp3', .7, 0]] };
assert.strictEqual(HuntAudioManager.shouldPlayJudgmentRoute(route, {
    patternSlot: judgmentSlot.slot, judgmentResults: [{ result: 'hit' }]
}), true);
assert.strictEqual(HuntAudioManager.shouldPlayJudgmentRoute(route, {
    patternSlot: judgmentSlot.slot, judgmentResults: [{ result: 'dodge' }]
}), false);
assert.strictEqual(HuntAudioManager.shouldPlayJudgmentRoute({ ...route, when: 'contact' }, {
    patternSlot: judgmentSlot.slot, judgmentResults: [{ result: 'guard' }]
}), true);
assert.strictEqual(HuntAudioManager.shouldPlayJudgmentRoute({ ...route, when: 'always' }, {
    patternSlot: judgmentSlot.slot, judgmentResults: []
}), true);
assert.strictEqual(HuntAudioManager.shouldPlayJudgmentRoute({ ...route, when: 'miss' }, {
    patternSlot: judgmentSlot.slot, judgmentResults: [{ result: 'dodge' }, { result: 'invulnerable' }]
}), true);

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-judgment-route-'));
const overridesPath = path.join(tempRoot, 'routes.json');
AudioMap.savePatternRoute({
    huntId: 'rathian', patternId: 'rathian.fireball', slot: judgmentSlot.slot,
    files: ['local_assets/monster_hunter/world/monster/em001/test.mp3'], when: 'contact'
}, overridesPath);
const saved = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
assert.strictEqual(saved.routes.rathian['rathian.fireball'][judgmentSlot.slot].when, 'contact',
    'conditional route mode must survive atomic route persistence');
fs.rmSync(tempRoot, { recursive: true, force: true });

console.log('[test] Judgment audio route slots and runtime conditions passed.');
