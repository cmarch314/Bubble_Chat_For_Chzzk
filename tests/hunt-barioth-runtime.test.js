'use strict';

const assert = require('node:assert');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const Archetypes = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const HuntStageAnchors = require('../js/effects/hunt/HuntStageAnchors.js');
const HuntMotionCompiler = require('../js/effects/hunt/HuntMotionCompiler.js');

const patterns = profiles.barioth;
const byId = id => patterns.find(pattern => pattern.id === id);

assert.strictEqual(patterns.length, 10, 'Barioth must expose the complete reviewed World kit');
assert(patterns.every(pattern => pattern.sourceGame === 'world_iceborne'));
assert(patterns.every(pattern => pattern.sourceMoveNameJA));
assert(!patterns.some(pattern => pattern.tags.includes('flight-only')),
    'short leaps and glides must not become a sustained flight state');

for (const id of ['barioth.shoulder_check', 'barioth.lateral_pounce', 'barioth.wall_pounce',
    'barioth.glide_pounce', 'barioth.landing_slam']) {
    assert(byId(id).tags.includes('slip-eligible'), `${id} must use the foreleg braking contract`);
}
assert(!byId('barioth.bite').tags.includes('slip-eligible'));

const tornado = byId('barioth.ice_tornado');
assert.strictEqual(tornado.delivery, 'projectile');
assert(tornado.tags.includes('ground-hazard'));
assert.strictEqual(tornado.impactFx.className, 'barioth-ice-tornado');
assert.deepStrictEqual(tornado.impactTimeline.map(event => event.atTicks), [18, 28]);
assert(tornado.tags.includes('butt-stumble'));
assert.deepStrictEqual(tornado.brokenPartDamageModifiers, { head: .70 });
assert.deepStrictEqual(tornado.brokenPartAccuracyModifiers, { head: .75 });
assert.deepStrictEqual(tornado.statusBlockedWhenBroken, ['head']);

const tail = byId('barioth.tail_sweep');
assert.strictEqual(ActionPolicy.effectiveTargetCap([{ kind: 'tail', severed: true }], tail), 1);
assert.strictEqual(ActionPolicy.brokenPartDamageModifier([{ kind: 'tail', severed: true }], tail), .70);

const slam = byId('barioth.landing_slam');
assert.deepStrictEqual(slam.interference, { kind: 'tremor', size: 'small', directHitSupersedes: true });
assert.strictEqual(slam.animationProfile, 'barioth-spring-leap');
assert.deepStrictEqual(slam.impact, { visualRatio: .68 });
assert.strictEqual(byId('barioth.glide_pounce').minTargets, 2);
assert.strictEqual(byId('barioth.glide_pounce').maxTargets, 3);
assert.strictEqual(byId('barioth.glide_pounce').animationProfile, 'barioth-glide-circle-land');
assert.deepStrictEqual(byId('barioth.glide_pounce').impact, { visualRatio: .74 });
assert.strictEqual(byId('barioth.shoulder_check').animationProfile, 'side-tackle-contact');
assert.strictEqual(byId('barioth.ice_breath_fizzle').damageRatio, 0);
assert(byId('barioth.ice_breath_fizzle').tags.includes('no-impact'));

const behavior = Archetypes.behavior({ id: 'barioth' });
const slip = behavior.traits.find(trait => trait.kind === 'broken-limb-slip');
assert.deepStrictEqual(slip.parts, ['left-front-leg', 'right-front-leg']);
assert.deepStrictEqual(slip.patternTags, ['slip-eligible']);

const rect = (left, top, width, height) => ({ left, top, width, height });
const anchors = new HuntStageAnchors({
    monsterRect: rect(660, 100, 380, 380),
    cardRect: rect(0, 0, 1700, 900),
    stageWidth: 1700,
    primaryTarget: 1,
    targetSequence: [1, 2],
    hunters: new Map([
        [0, rect(200, 700, 120, 160)], [1, rect(600, 700, 120, 160)],
        [2, rect(1000, 700, 120, 160)], [3, rect(1400, 700, 120, 160)]
    ])
});
const anatomyPoints = {
    head: { x: .49, y: .24 }, mouth: { x: .41, y: .23 }, torso: { x: .50, y: .53 }, tail: { x: .70, y: .15 }
};
const partOffset = name => {
    const point = anatomyPoints[String(name).replace(/^part:/, '')] || { x: .5, y: .5 };
    return { x: (point.x - .5) * 380, y: (point.y - .5) * 380 };
};

for (const pattern of patterns.filter(pattern => pattern.motion)) {
    const compiled = HuntMotionCompiler.compile(pattern.motion, { anchors, partOffset });
    assert.strictEqual(compiled.totalTicks, pattern.movement.ticks,
        `${pattern.id} motion ticks must own its complete action window`);
    assert.strictEqual(compiled.durationMs, pattern.animationDurationMs,
        `${pattern.id} visual duration must be tick-derived`);
    if (pattern.delivery === 'projectile') {
        assert.strictEqual(compiled.impacts.length, 0,
            `${pattern.id} must resolve damage at projectile impact, not the casting pose`);
        assert(compiled.cues.some(cue => cue.sfx === 'projectile'),
            `${pattern.id} must author its launch cue on the exhale beat`);
    } else if (pattern.damageRatio > 0) {
        assert.strictEqual(compiled.impacts.length, 1, `${pattern.id} needs exactly one authored contact`);
        assert.strictEqual(compiled.cues[0]?.atTicks, compiled.impacts[0].atTicks,
            `${pattern.id} impact SE must share the contact tick`);
    }
}

console.log('[test] Barioth World pattern, break, motion and timing contracts passed.');
