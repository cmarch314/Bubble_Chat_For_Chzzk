'use strict';

const assert = require('assert');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HUNT_REVIEWED_MONSTER_ANATOMY = require('../js/effects/hunt/data/ReviewedMonsterAnatomy.js');
global.HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const AnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const AnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const fs = require('fs');
const path = require('path');
const tigrex = profiles.tigrex;
const byId = id => tigrex.find(pattern => pattern.id === id);
const charges = tigrex.filter(pattern => pattern.tags.includes('tigrex-charge-chain'));

assert.deepStrictEqual(charges.map(pattern => pattern.branchKind).sort(), ['bite', 'rock', 'spin']);
assert.ok(charges.every(pattern => pattern.name === '연속 돌진'));
assert.ok(charges.every(pattern => pattern.targeting.mode === 'independent-passes'));
assert.ok(charges.every(pattern => pattern.targeting.passCountByState.normal === 2));
assert.ok(charges.every(pattern => pattern.targeting.passCountByState.enraged === 2));
assert.ok(charges.every(pattern => pattern.animationDurationMs === 8500));
assert.strictEqual(charges.reduce((sum, pattern) => sum + pattern.weightByState.normal, 0), .25);
assert.strictEqual(charges.reduce((sum, pattern) => sum + pattern.weightByState.enraged, 0), .25);
const spinCharge = byId('tigrex.charge_spin');
assert.deepStrictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').map(event => [event.atTicks, event.displayName]), [[15, null], [42, null], [78, '전신 회전']]);
assert.strictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').at(-1).animationImpactRatio, .52,
    'the final spin impact must occur during the rotation instead of after it finishes');
assert.strictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').at(-1).audioCue, 'tigrex-final-vocal');
assert.deepStrictEqual(ActionPolicy.impactTimeline(spinCharge, 'enraged').map(event => event.atTicks), [14, 34, 80]);
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
const turnExecutorSource = fs.readFileSync(path.join(
    __dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterTurnExecutor.js'
), 'utf8');
assert.match(turnExecutorSource,
    /onTriggerMonsterAttack\?\.\([\s\S]*?synchronizedImpactDelay[\s\S]*?events\[0\]\?\.atTicks[\s\S]*?pendingMonsterImpact\.remainingTicks = synchronizedImpactDelay/,
    'the first engine impact countdown must be synchronized after the renderer measures the charge collision');
assert.match(turnExecutorSource,
    /synchronizedFinalImpactTick[\s\S]*?monsterTraversalState\.remainingTicks/,
    'the traversal lock must cover the complete synchronized multi-pass route');
assert.match(turnExecutorSource, /pattern\.type === 'roar' && isImpactCommit[\s\S]*?triggerMonsterRoarFlinch/,
    'damaging Tigrex roars must still trigger their creature roar audio');
assert.match(turnExecutorSource, /이빨이 벽에 박힘/,
    'the return-charge wall collision must announce its opening');
assert.match(turnExecutorSource, /tigrex-final-vocal[\s\S]*?audioPhase: 'action-start'/,
    'the final charge branch must emit Tigrex vocal audio at its impact event');
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
assert.strictEqual(byId('tigrex.rock_shot').originPart, 'lower-front-leg');
assert.strictEqual(byId('tigrex.rock_shot').postActionRecoverySeconds, 3,
    'standalone rock throw must leave a three-second opening');
assert.strictEqual(byId('tigrex.charge_rock').postActionRecoverySeconds, 3,
    'the charge-chain rock finisher must leave the same three-second opening');
assert.strictEqual(byId('tigrex.rock_shot').minTargets, 3,
    'intact Tigrex forelegs must launch all three rocks');
assert.strictEqual(byId('tigrex.charge_rock').originPart, 'lower-front-leg');
assert.deepStrictEqual(byId('tigrex.charge_rock').projectileEventKinds, ['tigrex-rock']);
assert.strictEqual(byId('tigrex.rock_shot').brokenPartTargetCaps['right-front-leg'], 1);
assert.strictEqual(byId('tigrex.foreleg_slam').partUse.brokenDamageMultiplier, .70);
assert.deepStrictEqual(byId('tigrex.rock_shot').habitatVariants, { snow: 'ice', volcanic: 'fire', wet: 'water', default: 'raw' });
assert.strictEqual(require('../js/effects/hunt/HuntMonsterTurnExecutor.js').decorateHabitatVariant(
    { monsterHabitatId: 'hoarfrost_reach' }, byId('tigrex.rock_shot')).runtimeProjectileVariant, 'ice');
assert.ok(require('../js/effects/hunt/HuntMonsterTurnExecutor.js').decorateHabitatVariant(
    { monsterHabitatId: 'elders_recess' }, byId('tigrex.rock_shot')).tags.includes('fire'));
assert.strictEqual(byId('tigrex.spin').brokenPartTargetCaps.tail, 2);
assert.strictEqual(byId('tigrex.spin').animationDurationMs, 1540,
    'the standalone full-body spin should play about 30% faster');
assert.strictEqual(ActionPolicy.impactTimeline(spinCharge, 'normal').at(-1).animationDurationMs, 2000,
    'the charge-chain full-body spin branch should also play 30% faster');
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
    'the generic renderer retains a three-pass route for future authored variants');
assert.match(css, /monster-motion-tigrex-charge-chain \.hunt-monster-facing-layer > \.game-hunt-monster-img[\s\S]*tigrex-charge-stride-flip/,
    'Tigrex running cadence must flip only its image layer while the motion wrapper owns travel');
assert.match(css, /tigrex-charge-stride-flip \.6s[\s\S]*var\(--tigrex-stride-delay,1s\)/,
    'the stride must wait through recoil and then flip once every 0.3 seconds');
const strideFlipFrames = css.match(/@keyframes tigrex-charge-stride-flip \{[\s\S]*?\n\}/)?.[0] || '';
assert.match(strideFlipFrames, /scaleX\(1\)[\s\S]*scaleX\(-1\)/,
    'the charge stride must visibly alternate left and right');
assert.match(css, /\.roar-wave-ring\.is-sonic-impact/);
assert.match(css, /@keyframes tigrex-sonic-impact-ring/);
assert.match(css, /physical-rock-projectile/);
assert.doesNotMatch(css, /tigrex-local-enrage/,
    'Tigrex rage must use the shared full-body red aura');
assert.doesNotMatch(
    css.match(/@keyframes tigrex-charge-chain \{[\s\S]*?\n\}/)?.[0] || '',
    /opacity:0/,
    'Tigrex charge must stay opaque while its route is naturally clipped off-screen'
);
const normalChargeFrames = css.match(/@keyframes tigrex-charge-chain \{[\s\S]*?\n\}/)?.[0] || '';
const enragedChargeFrames = css.match(/@keyframes tigrex-charge-chain-three \{[\s\S]*?\n\}/)?.[0] || '';
for (const frames of [normalChargeFrames, enragedChargeFrames]) {
    assert.match(frames, /tigrex-launch-recoil-x[^}]*tigrex-launch-recoil-y/,
        'Tigrex must lean backward opposite its live target route before launching');
    assert.doesNotMatch(frames, /scale\((?:\.97|1\.18|1\.2|1\.3[68]|\.8[89])\)/,
        'size ramps must not make Tigrex appear to accelerate only at hunter contact');
}
assert.match(normalChargeFrames, /72\.2%,100%[^}]*tigrex-exit-2-x/,
    'the two-pass chain must remain at its offscreen exit until the separate branch approach starts');
assert.match(enragedChargeFrames, /96\.8%,100%[^}]*tigrex-exit-3-x/,
    'the enraged chain must remain at its offscreen exit until the separate branch approach starts');
const branchApproachFrames = css.match(/@keyframes tigrex-branch-approach \{[\s\S]*?\n\}/)?.[0] || '';
assert.match(branchApproachFrames, /branch-last-exit-x[\s\S]*90%,100%[^}]*tigrex-branch-x/,
    'every charge finisher must use a distinct constant-speed approach before its branch motion');
assert.match(normalChargeFrames, /29%,37%[^}]*tigrex-exit-1-x[\s\S]*?48\.3%[^}]*tigrex-pass-2-x/,
    'the second pass must wait offscreen and then cross directly through its selected hunter');
assert.match(enragedChargeFrames, /27%,28%[^}]*tigrex-exit-1-x[\s\S]*?39\.5%[^}]*tigrex-pass-2-x/,
    'enraged passes must also wait offscreen instead of easing back into view');
const rockHopFrames = css.match(/@keyframes tigrex-rock-hop \{[^\n]*\}/)?.[0] || '';
assert.match(rockHopFrames, /22%[^}]*translate\(0,-68px\)[\s\S]*?34%[^}]*translate\(0,0\)[\s\S]*?38%[^}]*rotate\(10deg\)/,
    'the cancelled charge must hop back to the home position before throwing its rock');
const runningBiteFrames = css.match(/@keyframes tigrex-running-double-bite \{[^\n]*\}/)?.[0] || '';
assert.match(runningBiteFrames, /tigrex-bite-contact-x[\s\S]*tigrex-bite-finish-x/,
    'the running double bite must cross the mouth through the hunter and finish beyond them');
const doubleBiteFrames = css.match(/@keyframes tigrex-double-bite \{[^\n]*\}/)?.[0] || '';
assert.match(doubleBiteFrames, /tigrex-bite-contact-x[\s\S]*tigrex-bite-finish-x/,
    'the standalone double bite must cross the mouth through the hunter and finish beyond them');
const leapFrames = css.match(/@keyframes tigrex-leap \{[\s\S]*?\n\}/)?.[0] || '';
assert.match(leapFrames, /30%[^}]*translate\(0,-270px\)[\s\S]*?50%[^}]*- 300px[\s\S]*?68%[^}]*monster-attack-x[^}]*monster-attack-y/,
    'Tigrex leap must rise vertically at home before arcing down onto the hunter at impact');
const slidingSpinFrames = css.match(/@keyframes tigrex-sliding-spin \{[^\n]*\}/)?.[0] || '';
assert.match(slidingSpinFrames, /100%[^}]*translate\(0,0\) rotate\(360deg\)/,
    'the charge spin must return without reversing its completed rotation');
const animatorSource = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterAttackAnimator.js'), 'utf8');
assert.match(animatorSource, /runtimeResolvedImpactTimeline/);
assert.match(animatorSource, /createRockProjectile/);
assert.match(animatorSource,
    /onMonsterProjectileLaunchAudio[\s\S]*?indices\.forEach/,
    'Tigrex rock launch audio must fire once when projectiles spawn, before per-target visuals');
assert.match(animatorSource, /originKind === 'lower-front-leg'/,
    'Tigrex rocks must resolve from the visually lower foreleg rather than a fixed label');
assert.match(animatorSource, /scheduleTigrexBranchMotion/);
assert.match(animatorSource, /runtimeTigrexBranchApproachDurationMs/);
assert.match(animatorSource, /runtimeTigrexRouteExitDelayMs/);
assert.match(animatorSource, /tigrexChargeRouteKeyframes/);
assert.match(animatorSource, /disableCssAnimation: useDynamicTigrexRoute/,
    'Tigrex charge must use measured route offsets instead of fixed uneven CSS segments');
assert.match(animatorSource, /--monster-motion-duration[^\n]*approachMotionMs/,
    'the separated approach must use its own duration instead of inheriting the full charge duration');
assert.match(animatorSource, /branchEvent\.eventKind === 'tigrex-rock'[\s\S]*profile\.duration \* impactRatio - travelMs/,
    'the charge-finisher rock must launch from its own home-position release frame');
assert.match(animatorSource, /branchOwnsRockProjectile[\s\S]*pattern\.branchKind === 'rock'/,
    'the generic projectile scheduler must not launch the branch rock while Tigrex is still offscreen');
assert.match(animatorSource, /frontLegBroken[\s\S]*?primary - 1[\s\S]*?primary \+ 1/,
    'an intact foreleg branch must visibly launch rocks toward the primary and adjacent slots');
assert.match(animatorSource, /runtimeTigrexFacingDirections/);
assert.match(animatorSource, /--tigrex-launch-recoil-x/);
assert.match(animatorSource, /--tigrex-launch-recoil-y/);
assert.match(animatorSource, /--tigrex-stride-delay/);
assert.match(animatorSource, /scheduleTigrexStrideAudio/);
assert.match(animatorSource, /animationTimers\.interval\(playStep, 300\)/,
    'each 0.3-second Tigrex image flip must request one reviewed stride-step cue');
assert.match(animatorSource, /monsterRetainedFacing/);
assert.match(animatorSource, /preservePoseOnReplace/,
    'charge branches must replace the chain without painting one frame at the origin');
console.log('hunt tigrex runtime tests passed');
