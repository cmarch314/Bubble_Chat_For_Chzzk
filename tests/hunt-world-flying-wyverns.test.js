'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Archetypes = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');
const Anatomy = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const PatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');

const review = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, '../data/hunt/research/world-iceborne-flying-wyverns.json'),
    'utf8'
));

assert.strictEqual(review.roster.length, 19);
assert.strictEqual(new Set(review.roster).size, 19);

for (const id of review.roster) {
    assert(Archetypes.FLYING_WYVERN_IDS.has(id), `${id} must classify as a Flying Wyvern`);
    assert(profiles[id]?.length >= 5, `${id} must have a reviewed World action kit`);
    assert(profiles[id].every(pattern => pattern.sourceGame === 'world_iceborne'),
        `${id} must use the World/Iceborne edition`);
    assert(profiles[id].every(pattern => pattern.evidence && pattern.confidence),
        `${id} patterns must retain evidence and confidence`);
    assert(profiles[id].every(pattern => !/\[MR\]|\uFFFD/.test(pattern.name)),
        `${id} must expose natural Korean action names without rank prefixes or broken text`);
    const anatomy = Anatomy.find({ id });
    assert(anatomy?.evidence?.breakContract,
        `${id} must use reviewed World anatomy instead of a generic body plan`);
}

for (const id of ['diablos', 'black_diablos', 'tigrex', 'brute_tigrex', 'nargacuga', 'barioth', 'frostfang_barioth']) {
    assert(!profiles[id].some(pattern => pattern.tags.includes('flight-only')),
        `${id} is a grounded Flying Wyvern and must not enter sustained flight`);
    assert.strictEqual(Archetypes.resolve({ id }).id, 'grounded-flying-wyvern');
    assert.strictEqual(Archetypes.flight({ id }), null);
}

for (const id of ['legiana', 'shrieking_legiana', 'paolumu', 'nightshade_paolumu',
    'bazelgeuse', 'seething_bazelgeuse', 'rathalos', 'azure_rathalos', 'silver_rathalos']) {
    assert(profiles[id].some(pattern =>
        pattern.tags.includes('flight-only') || pattern.tags.includes('high-flight-sequence')),
        `${id} needs authored airborne attacks`);
}

assert(profiles.nightshade_paolumu.some(pattern =>
    pattern.tags.includes('sleep') && pattern.delivery === 'gas'));
assert(profiles.seething_bazelgeuse.some(pattern =>
    pattern.id.endsWith('diving_explosion') && pattern.tags.includes('heated-scale')));
assert(profiles.brute_tigrex.some(pattern =>
    pattern.tags.includes('sonic') && Number(pattern.damageRatio) > 0));
assert(profiles.nargacuga.some(pattern =>
    pattern.tags.includes('bleed') && pattern.tags.includes('ground-hazard')));
const nargacugaTriple = profiles.nargacuga.find(pattern =>
    pattern.id === 'nargacuga.leaping_cutwing_triple');
assert.deepStrictEqual(nargacugaTriple.impactTimeline.map(event => event.hitReactionKind ?? 'strong'),
    ['weak', 'weak', 'strong'],
    'Nargacuga triple rush must author reaction classes without owning hunter recovery ticks');
const nargacugaAmbush = profiles.nargacuga.find(pattern =>
    pattern.id === 'nargacuga.leaping_cutwing');
const ambushReappear = nargacugaAmbush.motion.find(beat => beat.beat === 'reappear');
const ambushAim = nargacugaAmbush.motion.find(beat => beat.beat === 'ambush-aim');
assert.match(ambushReappear.at, /^polar:target\b/,
    'Nargacuga cutwing ambush must visibly reappear beside and behind its target');
assert(ambushAim && ambushAim.ticks >= 3 && !ambushAim.to && !ambushAim.at,
    'Nargacuga cutwing ambush must hold its revealed flank position before diving');
assert.strictEqual(nargacugaAmbush.motion.reduce((ticks, beat) => ticks + beat.ticks, 0),
    nargacugaAmbush.movement.ticks,
    'Nargacuga cutwing ambush review timeline must cover the exact live animation');
const ambushHitTick = nargacugaAmbush.motion.reduce((result, beat) => ({
    elapsed: result.elapsed + beat.ticks,
    hit: result.hit ?? (beat.hit ? result.elapsed : null)
}), { elapsed: 0, hit: null }).hit;
assert.strictEqual(ambushHitTick, nargacugaAmbush.impactTimeline[0].atTicks,
    'Nargacuga cutwing ambush damage must occur on the authored impact beat');
const synchronizedQuickBite = PatternCatalog.synchronizeMotionTiming({
    ...profiles.nargacuga.find(pattern => pattern.id === 'nargacuga.quick_bite'),
    motion: [
        { beat: 'windup', ticks: 4 },
        { beat: 'approach', ticks: 3 },
        { beat: 'bite', ticks: 3, hit: true },
        { beat: 'return', ticks: 6 }
    ]
});
assert.strictEqual(synchronizedQuickBite.impactTimeline[0].atTicks, 7,
    'saved beat lengths must move live damage to the same authored hit boundary');
assert.strictEqual(synchronizedQuickBite.movement.ticks, 16);
assert.strictEqual(synchronizedQuickBite.animationDurationMs, 1600);
const nargacugaTailSlam = profiles.nargacuga.find(pattern =>
    pattern.id === 'nargacuga.spiked_tail_slam');
const tailAimBeat = nargacugaTailSlam.motion.find(beat => beat.beat === 'aim');
const tailImpactBeat = nargacugaTailSlam.motion.find(beat => beat.beat === 'slam');
assert(tailAimBeat.scaleY > 1 && tailImpactBeat.scaleY > 1,
    'Nargacuga spiked tail must remain extended through the slam impact');
assert.strictEqual(tailImpactBeat.scaleX, tailAimBeat.scaleX,
    'Nargacuga spiked tail must not contract sideways at impact');
const MonsterTurns = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
assert.strictEqual(MonsterTurns.hitReactionForPattern({
    tags: ['strong'], runtimeImpactHitRecoveryTicks: 99, runtimeImpactHitReactionKind: 'weak'
}).durationTicks, 15,
    'hunter-owned recovery must follow reaction class and ignore monster recovery metadata');
const battleTickSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
assert.doesNotMatch(battleTickSource, /runtimeImpactHitRecoveryTicks/,
    'the monster timeline must not forward hunter-owned recovery metadata');
assert(profiles.frostfang_barioth.some(pattern =>
    pattern.tags.includes('frost-ground') && pattern.delivery === 'ground-wave'));
assert(profiles.gold_rathian.some(pattern => pattern.tags.includes('blue-flame')));
assert(profiles.silver_rathalos.some(pattern => pattern.tags.includes('blue-flame')));

console.log('[test] 19 World/Iceborne Flying Wyvern kits passed.');
