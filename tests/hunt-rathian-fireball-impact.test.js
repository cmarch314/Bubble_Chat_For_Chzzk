'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
global.HuntRotationContract = require('../js/effects/hunt/HuntRotationContract.js');
const CandidateCatalog = require('../js/effects/hunt/HuntMonsterCandidateCatalog.js');
const ReviewState = require('../tools/monster-audio-review-state.js');
const AudioPatternMap = require('../tools/hunt-audio-pattern-map.js');
const PatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');

const kit = JSON.parse(fs.readFileSync(path.resolve(
    __dirname, '../data/hunt/monster-kits/candidates/rathian.json'), 'utf8'));
const actions = CandidateCatalog.compileKit(kit).actions;
const fireball = actions.find(action => action.id === 'rathian.fireball');
const tripleFireball = actions.find(action => action.id === 'rathian.triple_fireball');

function projectileTriples(action) {
    const events = action.beatV2.events;
    return events.filter(event => event.kind === 'projectile-launch').map(launch => {
        const contact = events.find(event => event.id === launch.outcomeEventId);
        const finish = events.find(event => event.kind === 'projectile-finish'
            && event.projectileId === launch.projectileId);
        return { launch, contact, finish };
    });
}

assert.strictEqual(fireball.delivery, 'projectile');
assert.strictEqual(fireball.originPart, 'head');
const single = projectileTriples(fireball);
assert.strictEqual(single.length, 1, 'single fireball has exactly one authored launch');
assert.ok(single[0].launch.atTicks < single[0].contact.atTicks);
assert.ok(single[0].contact.atTicks < single[0].finish.atTicks);
assert.strictEqual(single[0].launch.target, single[0].contact.target);

assert.strictEqual(tripleFireball.delivery, 'projectile');
assert.deepStrictEqual(tripleFireball.beatV2.beats.map(beat => beat.id),
    ['look', 'inhale', 'spit-primary', 'spit-left', 'spit-right', 'recover']);
const triple = projectileTriples(tripleFireball);
assert.strictEqual(triple.length, 3, 'triple fireball emits exactly three projectiles');
assert.deepStrictEqual(triple.map(entry => entry.launch.target), ['primary', 'left', 'right']);
assert.deepStrictEqual(triple.map(entry => entry.launch.atTicks), [17, 24, 31],
    'each spit owns exactly one launch tick');
triple.forEach(({ launch, contact, finish }) => {
    assert.ok(contact && finish, `${launch.projectileId} has contact and finish`);
    assert.ok(launch.atTicks < contact.atTicks && contact.atTicks < finish.atTicks,
        `${launch.projectileId} lifecycle is ordered by BEAT`);
    assert.strictEqual(launch.target, contact.target);
});

// The review UI receives a visual draft, then recompiles it for the shared
// Preview/live BEAT runtime. Projectile lifecycle metadata must survive that
// edit projection; otherwise the spit damage remains while its fireball never
// launches.
const reviewPattern = AudioPatternMap.loadHuntPatternAudioMap('rathian', { candidateKit: kit })
    .patterns.find(pattern => pattern.id === 'rathian.fireball');
const reviewSession = ReviewState.createEditorSession();
reviewSession.load(reviewPattern);
const reviewSnapshot = reviewSession.snapshot();
const previewMotion = ReviewState.buildPreviewMotion(
    reviewPattern, reviewSnapshot.timeline, reviewSnapshot.draft
);
const previewCompiled = PatternCatalog.synchronizeEditedPattern({
    ...reviewPattern,
    motion: previewMotion.motion
});
assert.ok(previewCompiled.beatV2.events.some(event => event.kind === 'projectile-launch'),
    'editor projection preserves an authored fireball launch');
assert.ok(previewCompiled.beatV2.events.some(event => event.kind === 'projectile-finish'),
    'editor projection preserves an authored fireball finish');
assert.strictEqual(previewCompiled.beatV2.events.find(event => event.id === 'fireball-1:contact')?.projectileId,
    'fireball-1', 'editor projection preserves projectile/contact identity');

console.log('[test] Rathian fireball BEAT projectile contract passed.');
