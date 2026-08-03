'use strict';

const assert = require('assert');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HUNT_REVIEWED_MONSTER_ANATOMY = require('../js/effects/hunt/data/ReviewedMonsterAnatomy.js');
global.HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const AnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const AnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const tigrex = profiles.tigrex;
const byId = id => tigrex.find(pattern => pattern.id === id);
const charges = tigrex.filter(pattern => pattern.tags.includes('tigrex-charge-chain'));

assert.deepStrictEqual(charges.map(pattern => pattern.branchKind).sort(), ['bite', 'rock', 'spin']);
assert.ok(charges.every(pattern => pattern.name === '연속 돌진'));
assert.ok(charges.every(pattern => pattern.targeting.mode === 'independent-passes'));
assert.ok(charges.every(pattern => pattern.targeting.passCountByState.normal === 2));
assert.ok(charges.every(pattern => pattern.targeting.passCountByState.enraged === 3));
assert.ok(charges.every(pattern => pattern.animationDurationMs === 8500));
assert.strictEqual(charges.reduce((sum, pattern) => sum + pattern.weightByState.normal, 0), .25);
assert.strictEqual(charges.reduce((sum, pattern) => sum + pattern.weightByState.enraged, 0), .25);
const spinCharge = byId('tigrex.charge_spin');
assert.deepStrictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').map(event => [event.atTicks, event.displayName]), [[15, null], [42, null], [78, '전신 회전']]);
assert.strictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').at(-1).animationImpactRatio, .68);
assert.deepStrictEqual(ActionPolicy.impactTimeline(spinCharge, 'enraged').map(event => event.atTicks), [14, 34, 54, 80]);
assert.deepStrictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').map(event => event.targetMode),
    ['', '', 'repeat-previous'], 'the branch must approach the last pass target instead of selecting a remote lane');
assert.strictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').at(-1).targetShape, 'primary-adjacent-both');
const biteCharge = byId('tigrex.charge_bite');
assert.deepStrictEqual(ActionPolicy.impactTimeline(biteCharge, 'normal').map(event => event.targetMode),
    ['', '', 'repeat-previous', 'repeat-previous']);
assert.strictEqual(biteCharge.stateMachine.secondReturnDodgeStuck.chance, .30);
assert.strictEqual(biteCharge.stateMachine.secondReturnDodgeStuck.recoveryMs, 7000);
assert.strictEqual(biteCharge.stateMachine.exhaustedReturnTrip.recoveryMs, 5000);
assert.deepStrictEqual(ActionPolicy.impactTimeline(biteCharge, 'exhausted').map(event => [event.eventKind, event.damageScale]), [
    ['tigrex-charge-pass', 1],
    ['tigrex-exhausted-trip', 0]
]);
const roar = byId('tigrex.roar');
assert.strictEqual(roar.damageRatio, .40);
assert.strictEqual(roar.cooldownTicks, 150);
assert.strictEqual(roar.directDamageScope, 'engaged-melee');
assert.strictEqual(roar.interference.directHitSupersedes, true);
assert.strictEqual(roar.roarVisual, 'sonic-impact');
assert.strictEqual(require('../js/effects/hunt/HuntMonsterTurnExecutor.js').isEngagedMeleeTarget({
    type: 'melee', currentAction: { phase: 'active' }
}), true);
assert.strictEqual(require('../js/effects/hunt/HuntMonsterTurnExecutor.js').isEngagedMeleeTarget({
    type: 'ranged', currentAction: { phase: 'active' }
}), false);
assert.strictEqual(roar.brokenPartDamageModifiers.head, .75);
assert.strictEqual(AnatomyCatalog.breakReaction('tigrex', 'head').durationTicks, 40);
assert.strictEqual(AnatomyCatalog.breakReaction('tigrex', 'left-front-leg').type, 'knockdown');
assert.strictEqual(AnatomyCatalog.breakReaction('tigrex', 'right-front-leg').durationTicks, 80);
const repeatedLeg = AnatomyCatalog.createPartState({ parts: [{
    id: 'tigrex:left-front-leg', kind: 'left-front-leg', health: 100,
    breakable: true, repeatToppleHealthMultiplier: 1.5,
    hitzones: { slash: 1, blunt: 1, pierce: 1 }
}] });
assert.strictEqual(AnatomyCatalog.applyPartDamage(repeatedLeg, { id: 'great_sword' }, 200, 1, () => 0).newlyBroken, true);
assert.strictEqual(AnatomyCatalog.applyPartDamage(repeatedLeg, { id: 'great_sword' }, 200, 1, () => 0).repeatedTopple, true);
assert.deepStrictEqual(byId('tigrex.double_bite').impactTimeline.map(event => event.atTicks), [10, 15]);
assert.strictEqual(byId('tigrex.double_bite').damageRatio, .25);
assert.ok(byId('tigrex.double_bite').tags.includes('weak'));
assert.ok(byId('tigrex.rock_shot').tags.includes('strong'));
assert.strictEqual(byId('tigrex.rock_shot').projectileVisual, 'rock');
assert.strictEqual(byId('tigrex.charge_rock').projectileVisual, 'rock');
assert.deepStrictEqual(byId('tigrex.charge_rock').projectileEventKinds, ['tigrex-rock']);
assert.strictEqual(byId('tigrex.rock_shot').brokenPartTargetCaps['right-front-leg'], 1);
assert.strictEqual(byId('tigrex.foreleg_slam').partUse.brokenDamageMultiplier, .70);
assert.deepStrictEqual(byId('tigrex.rock_shot').habitatVariants, { snow: 'ice', volcanic: 'fire', wet: 'water', default: 'raw' });
assert.strictEqual(require('../js/effects/hunt/HuntMonsterTurnExecutor.js').decorateHabitatVariant(
    { monsterHabitatId: 'hoarfrost_reach' }, byId('tigrex.rock_shot')).runtimeProjectileVariant, 'ice');
assert.ok(require('../js/effects/hunt/HuntMonsterTurnExecutor.js').decorateHabitatVariant(
    { monsterHabitatId: 'elders_recess' }, byId('tigrex.rock_shot')).tags.includes('fire'));
assert.strictEqual(byId('tigrex.spin').brokenPartTargetCaps.tail, 2);
assert.strictEqual(byId('tigrex.spin').animationDurationMs, 2000);
assert.strictEqual(tigrex.some(pattern => pattern.type === 'ultimate'), false);
assert.ok(tigrex.every(pattern => pattern.maxConsecutiveUses === 99));
const behavior = global.HuntMonsterArchetypeCatalog.behavior({ id: 'tigrex' });
assert.strictEqual(behavior.stamina.max, 80);
assert.strictEqual(behavior.rageDurationTicks, 900);
assert.strictEqual(behavior.rageRoarConsumesFullAtb, true);
assert.strictEqual(behavior.enragedDamageMultiplier, 1.10);
assert.strictEqual(behavior.exhaustedDamageMultiplier, .70);
assert.strictEqual(behavior.enragedAtbMultiplier, 1.20);
assert.strictEqual(behavior.exhaustedAtbMultiplier, .70);
assert.deepStrictEqual(AnatomyCatalog.visualPoint({ id: 'tigrex' }, 'mouth'), { x: .43, y: .72, kind: 'mouth' });
assert.deepStrictEqual(AnatomyCatalog.visualPoint({ id: 'tigrex' }, 'left-front-leg'), { x: .25, y: .28, kind: 'left-front-leg' });
assert.deepStrictEqual(AnatomyCatalog.visualPoint({ id: 'tigrex' }, 'right-front-leg'), { x: .72, y: .70, kind: 'right-front-leg' });
assert.deepStrictEqual(AnatomyCatalog.visualPoint({ id: 'tigrex' }, 'tail'), { x: .62, y: .28, kind: 'tail' });
for (const profile of ['tigrex-charge-chain', 'tigrex-exhausted-trip', 'tigrex-rock-hop', 'tigrex-sliding-spin', 'tigrex-running-double-bite', 'tigrex-foreleg-slam', 'tigrex-bite', 'tigrex-double-bite', 'tigrex-clockwise-spin', 'tigrex-rock-shot', 'tigrex-leap']) {
    const resolved = AnimationCatalog.resolve({ animationProfile: profile }, '', '', { id: 'tigrex' });
    assert.strictEqual(resolved.id, profile, `${profile} must resolve to a concrete motion class`);
}
const css = require('fs').readFileSync(require('path').join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');
assert.match(css, /--tigrex-pass-1-x/);
assert.match(css, /--tigrex-exit-2-x/);
assert.match(css, /@keyframes tigrex-charge-chain-three/,
    'enraged three-pass charge needs a separate straight-line route before its branch');
assert.match(css, /\.roar-wave-ring\.is-sonic-impact/);
assert.match(css, /@keyframes tigrex-sonic-impact-ring/);
assert.match(css, /physical-rock-projectile/);
assert.match(css, /tigrex-local-enrage/);
assert.doesNotMatch(
    css.match(/@keyframes tigrex-charge-chain \{[\s\S]*?\n\}/)?.[0] || '',
    /opacity:0/,
    'Tigrex charge must stay opaque while its route is naturally clipped off-screen'
);
const animatorSource = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterAttackAnimator.js'), 'utf8');
assert.match(animatorSource, /runtimeResolvedImpactTimeline/);
assert.match(animatorSource, /createRockProjectile/);
assert.match(animatorSource, /scheduleTigrexBranchMotion/);
assert.match(animatorSource, /runtimeTigrexFacingDirections/);
assert.match(animatorSource, /monsterRetainedFacing/);
assert.match(animatorSource, /preservePoseOnReplace/,
    'charge branches must replace the chain without painting one frame at the origin');
console.log('hunt tigrex runtime tests passed');
