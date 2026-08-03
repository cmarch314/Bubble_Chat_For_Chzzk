'use strict';

const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HUNT_REVIEWED_MONSTER_ANATOMY = require('../js/effects/hunt/data/ReviewedMonsterAnatomy.js');
global.HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');

const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const AnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const AnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const AudioCatalog = require('../js/effects/hunt/HuntAudioCatalog.js');
const PatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
const TurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');

const rathalos = profiles.rathalos;
const byId = id => rathalos.find(pattern => pattern.id === id);
assert.ok(byId('rathalos.bite').tags.includes('weak'), 'Rathalos bite must use the weak-hit contract');

assert.deepStrictEqual(rathalos.map(pattern => pattern.id), [
    'rathalos.roar',
    'rathalos.bite',
    'rathalos.rush',
    'rathalos.fireball',
    'rathalos.aerial_fireball',
    'rathalos.backstep_fireball',
    'rathalos.claw_dive',
    'rathalos.tail_sweep',
    'rathalos.aerial_tail_sweep',
    'rathalos.hop_stomp',
    'rathalos.stomp',
    'rathalos.glide'
]);
assert.strictEqual(rathalos.some(pattern =>
    pattern.type === 'ultimate' || pattern.tags.includes('beam')), false,
'World-original Rathalos must not inherit an invented ultimate or laser');

assert.ok(byId('rathalos.fireball').tags.includes('ground-only'));
assert.ok(byId('rathalos.aerial_fireball').tags.includes('flight-only'));
assert.ok(byId('rathalos.aerial_tail_sweep').tags.includes('flight-only'));
assert.ok(byId('rathalos.hop_stomp').tags.includes('ground-only'));
assert.ok(byId('rathalos.stomp').tags.includes('landing-only'));
assert.strictEqual(byId('rathalos.backstep_fireball').flightTransition, 'takeoff');
assert.strictEqual(byId('rathalos.stomp').flightTransition, 'land');
assert.deepStrictEqual(byId('rathalos.tail_sweep').impactTimeline.map(event => event.atTicks), [14, 24]);
assert.strictEqual(byId('rathalos.tail_sweep').animationDurationMs, 3800);
assert.strictEqual(byId('rathalos.fireball').delivery, 'projectile');
assert.strictEqual(byId('rathalos.aerial_fireball').delivery, 'projectile');
for (const id of ['rathalos.fireball', 'rathalos.aerial_fireball', 'rathalos.backstep_fireball']) {
    assert.strictEqual(byId(id).projectileLaunchDelayTicks, 10,
        `${id} must turn toward its target for one second before firing`);
    assert.strictEqual(byId(id).impact.delayTicks, 17,
        `${id} damage must follow the delayed projectile instead of resolving before launch`);
}

const anatomy = AnatomyCatalog.find({ id: 'rathalos' });
assert.deepStrictEqual(
    AnatomyCatalog.partDisplaySlots(AnatomyCatalog.createPartState(anatomy))
        .map(part => part.kind),
    ['head', 'back', 'wing', 'wing', 'tail']
);

for (const id of [
    'rathalos.fireball',
    'rathalos.aerial_fireball',
    'rathalos.aerial_tail_sweep',
    'rathalos.hop_stomp',
    'rathalos.glide'
]) {
    const pattern = byId(id);
    assert.strictEqual(
        AnimationCatalog.resolve(pattern, pattern.name, pattern.type, { id: 'rathalos' }).id,
        pattern.animationProfile
    );
}

assert.strictEqual(TurnExecutor.monsterAttackAccuracy(
    byId('rathalos.aerial_fireball'),
    { monsterPartState: [{ kind: 'head', broken: true }] }
), .75);
assert.strictEqual(
    global.HuntMonsterArchetypeCatalog.behavior({ id: 'rathalos' }).rageOpenerPatternId,
    'rathalos.backstep_fireball'
);
const airbornePick = new PatternSelector(() => .99).select(
    { id: 'rathalos' },
    [byId('rathalos.fireball'), byId('rathalos.aerial_fireball')],
    { state: 'normal', hpRatio: 1, flightState: 'airborne' }
);
assert.strictEqual(airbornePick.id, 'rathalos.aerial_fireball');

const cues = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES;
assert.ok(cues['rathalos:roar']?.length);
assert.ok(cues['rathalos:telegraph']?.some(cue =>
    cue.patternKeywords?.includes('fireball')));
assert.ok(cues['rathalos:attack']?.some(cue =>
    cue.patternKeywords?.includes('glide')));

const css = require('fs').readFileSync(require('path').join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');
const tailFrames = css.match(/@keyframes monster-motion-rathalos-tail-sweep-double\s*\{([^}]*(?:\}[^@]*)?)/)?.[0] || '';
assert.match(tailFrames, /rotate\(168deg\)/);
assert.doesNotMatch(tailFrames, /rotate\((?:708|720)deg\)/,
    'Rathalos must perform two 180-degree sweeps, not two independent full spins');

console.log('[test] Reviewed World Rathalos runtime contract passed.');
