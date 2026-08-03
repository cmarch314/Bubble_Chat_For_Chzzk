'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HUNT_REVIEWED_MONSTER_ANATOMY = require('../js/effects/hunt/data/ReviewedMonsterAnatomy.js');
global.HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');

const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const AnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const AnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const AudioCatalog = require('../js/effects/hunt/HuntAudioCatalog.js');
const ArchetypeCatalog = global.HuntMonsterArchetypeCatalog;
const FlightRuntime = require('../js/effects/hunt/HuntMonsterFlightRuntime.js');
const PatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
const ReleasePolicy = require('../js/effects/hunt/HuntMonsterReleasePolicy.js');
const TurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
global.HuntMonsterAnatomyCatalog = AnatomyCatalog;
const AttackAnimator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');

const rathian = profiles.rathian;
const byId = id => rathian.find(pattern => pattern.id === id);

assert.deepStrictEqual(rathian.map(pattern => pattern.id), [
    'rathian.roar',
    'rathian.bite',
    'rathian.tail_sweep',
    'rathian.fireball',
    'rathian.triple_fireball',
    'rathian.fireball_fizzle',
    'rathian.charge',
    'rathian.triple_charge',
    'rathian.somersault',
    'rathian.double_somersault',
    'rathian.bite_somersault',
    'rathian.somersault_glide',
    'rathian.glide'
], 'the final World-original kit must replace the older pilot snapshot');
assert.strictEqual(rathian.some(pattern => pattern.type === 'ultimate'), false,
    'World Rathian must not receive an invented signature ultimate');
assert.deepStrictEqual(
    rathian.map(pattern => pattern.name),
    ['포효', '물어뜯기', '이단 꼬리 회전', '화염구', '삼연 화염구', '탈진 화염구 불발',
        '돌진', '삼연속 돌진', '서머솔트', '이단 서머솔트', '공중 물어뜯기 연계',
        '서머솔트 저공 활공', '저공 활공'],
    'rank/import labels must never leak into the visible World Rathian move names'
);

const fireball = byId('rathian.fireball');
const tripleFireball = byId('rathian.triple_fireball');
const fizzle = byId('rathian.fireball_fizzle');
assert.deepStrictEqual(fireball.forbiddenStates, ['enraged', 'exhausted']);
assert.strictEqual(tripleFireball.requiredState, 'enraged');
assert.strictEqual(tripleFireball.targeting.mode, 'center-left-right');
assert.deepStrictEqual(
    ActionPolicy.impactTimeline(tripleFireball).map(event => event.atTicks),
    [17, 22, 27],
    'enraged fireballs must begin after the one-second turn and retain 0.5-second intervals'
);
assert.strictEqual(fireball.projectileLaunchDelayTicks, 10);
assert.strictEqual(tripleFireball.projectileLaunchDelayTicks, 10);
assert.ok(Math.abs((tripleFireball.damageRatio * 1.10) / fireball.damageRatio - 1.30) < .01,
    'each enraged shot must finish 30% stronger after the shared rage modifier');
assert.strictEqual(fireball.brokenPartDamageModifiers.head, .80);
assert.strictEqual(fireball.brokenPartAccuracyModifiers.head, .75);
assert.ok(fizzle.tags.includes('no-impact'));
assert.strictEqual(fizzle.requiredState, 'exhausted');

const fourHunters = [0, 1, 2, 3].map(index => ({ index }));
const centerSequence = ActionPolicy.centerLeftRightSequence(fourHunters, () => .01);
assert.deepStrictEqual(centerSequence.map(pass => pass.map(target => target.index)), [[0], [], [1]],
    'a side shot outside the party must remain a visible whiff lane');
const targetPlan = ActionPolicy.resolveTargeting({
    targetable: fourHunters,
    count: 1,
    random: () => .01,
    mode: 'center-left-right'
});
assert.strictEqual(targetPlan.runtime.runtimeImpactAllowEmptySequence, true);

const tailCut = [{ kind: 'tail', severed: true }];
const somersault = byId('rathian.somersault');
const doubleSomersault = byId('rathian.double_somersault');
const biteSomersault = byId('rathian.bite_somersault');
const somersaultGlide = byId('rathian.somersault_glide');
assert.strictEqual(somersault.weight, 1.25);
assert.strictEqual(doubleSomersault.weight, .72);
assert.strictEqual(biteSomersault.weight, .38);
assert.strictEqual(somersaultGlide.weight, .32);
assert.strictEqual(ActionPolicy.statusAllowed(tailCut, somersault), false);
assert.strictEqual(TurnExecutor.statusAllowed({ monsterPartState: tailCut }, somersault), false,
    'a severed tail must remove somersault poison');
assert.strictEqual(ActionPolicy.brokenPartDamageModifier(tailCut, somersault), .70);
assert.strictEqual(ActionPolicy.effectiveTargetCap(tailCut, doubleSomersault), 1);
assert.deepStrictEqual(doubleSomersault.impactTimeline.map(event => event.audioCue),
    ['somersault', 'somersault'], 'both somersaults need their own voice event');
assert.deepStrictEqual(somersault.impactTimeline.map(event => event.atTicks), [19]);
assert.deepStrictEqual(doubleSomersault.impactTimeline.map(event => event.atTicks), [22, 53]);
assert.deepStrictEqual(biteSomersault.impactTimeline.map(event => event.atTicks), [20, 54]);
assert.deepStrictEqual(somersaultGlide.impactTimeline.map(event => event.atTicks), [21, 80]);
assert.strictEqual(biteSomersault.impactTimeline[0].suppressStatus, true);
assert.strictEqual(biteSomersault.impactTimeline[0].ignoreBrokenPartDamage, true);
assert.strictEqual(somersaultGlide.impactTimeline[1].secondaryInterference.scope, 'adjacent');
assert.strictEqual(byId('rathian.bite').maxConsecutiveUses, 1);
assert.ok(byId('rathian.bite').tags.includes('weak'), 'Rathian bite must use the weak-hit contract');
assert.deepStrictEqual(byId('rathian.tail_sweep').impactTimeline.map(event => event.atTicks), [24, 34]);
assert.strictEqual(byId('rathian.tail_sweep').animationDurationMs, 4200);
assert.strictEqual(byId('rathian.tail_sweep').animationProfile, 'rathian-tail-sweep-double');
assert.strictEqual(byId('rathian.triple_charge').animationDurationMs, 9000);
assert.strictEqual(byId('rathian.triple_charge').movement.ticks, 113);
assert.strictEqual(byId('rathian.charge').animationProfile, 'rathian-ground-charge');
assert.strictEqual(byId('rathian.charge').impact.visualRatio, .30);
assert.deepStrictEqual(byId('rathian.triple_charge').impact.passRatios, [.12, .43, .74],
    'each charge collision must land during the constant-speed pass, before the off-screen exit');
const facingAnimator = new AttackAnimator({ selectedMonster: { id: 'rathian' } });
assert.deepStrictEqual(
    facingAnimator.facingPlan({ id: 'rathian-ground-charge' }, {}, 180).slice(0, 2),
    [{ offset: 0, direction: 1 }, { offset: .73, direction: 1 }],
    'Rathian single charge must face its actual horizontal travel direction'
);
assert.deepStrictEqual(
    facingAnimator.facingPlan({ id: 'ground-charge-triple' }, {
        runtimeChargeFacingDirections: [-1, 1, -1]
    }).filter(step => step.direction !== 0).map(step => step.direction),
    [-1, -1, 1, 1, -1, -1],
    'each Rathian triple-charge pass must use its independently measured travel direction'
);
assert.strictEqual(byId('rathian.glide').impactTimeline[0].atTicks, 42);
assert.strictEqual(doubleSomersault.animationDurationMs, 6400,
    'Rathian multi-step motions must not be compressed by the shared animation defaults');

const anatomy = AnatomyCatalog.find({ id: 'rathian' });
const slots = AnatomyCatalog.partDisplaySlots(AnatomyCatalog.createPartState(anatomy));
assert.deepStrictEqual(slots.map(part => part.kind), ['head', 'back', 'wing', 'wing', 'tail']);

const behavior = ArchetypeCatalog.behavior({ id: 'rathian' });
assert.strictEqual(behavior.roarSize, 'small');
assert.strictEqual(behavior.naturalLandingPatternId, null);
assert.strictEqual(behavior.enragedDamageMultiplier, 1.10);
assert.strictEqual(behavior.flightMode, 'short-chain');
assert.strictEqual(behavior.flightAttemptChance, .40);
assert.strictEqual(behavior.flightCooldownTicks, 0);
assert.deepStrictEqual([...behavior.flightFailureChanceByBrokenWings], [0, .35, .70]);
assert.strictEqual(behavior.flightFailureStaggerTicks, 50);
assert.strictEqual(behavior.exhaustedFlightWobbleTicks, 30);
assert.strictEqual(behavior.exhaustedFlightLandingStaggerTicks, 30);
assert.strictEqual(behavior.maxEffectiveFlashes, 4);
assert.strictEqual(ReleasePolicy.isReviewed('rathian'), true);
const audioCues = AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES;
assert.ok(audioCues['rathian:attack'].filter(cue =>
    cue.patternKeywords?.includes('somersault')).length >= 3,
    'Rathian aerial actions need the shared Rath-family random pool');
for (const kind of ['knockdown', 'trap', 'flinch', 'death']) {
    assert.strictEqual(audioCues[`rathian:${kind}`], audioCues[`rathalos:${kind}`],
        `Rathian ${kind} must share the audition-confirmed Rath-family reaction`);
}

const normalAerial = new PatternSelector(() => 0).select(
    { id: 'rathian' },
    rathian,
    { state: 'normal', flightState: 'airborne', shortFlightChain: true }
);
assert.ok(normalAerial.tags.includes('flight-only'));
assert.notStrictEqual(normalAerial.type, 'roar',
    'short flight chains must not select generic air-compatible actions');

const flightEvents = [];
const flightEngine = {
    selectedMonster: { id: 'rathian', nameKO: '리오레이아' },
    selectedWeapons: [{ index: 0, status: 'alive' }],
    monsterBehavior: behavior,
    monsterCanFly: true,
    monsterFlightState: 'grounded',
    monsterFlightCooldown: 0,
    monsterState: 'normal',
    monsterPartState: [
        { kind: 'left-wing', broken: true },
        { kind: 'right-wing', broken: false }
    ],
    monsterAtb: 100,
    updateMonsterAtbUI: value => flightEvents.push(['atb', value]),
    updateMonsterFlightUI: (...args) => flightEvents.push(['flight-ui', ...args]),
    showSkillBubble: () => {},
    addLog: () => {},
    callbacks: {
        onTriggerMonsterAttack: (...args) => flightEvents.push(['reaction', ...args])
    }
};
const failedFlight = new FlightRuntime((() => {
    const values = [.1, .2]; // attempt flight, then fail the 35% one-wing roll
    return () => values.shift() ?? 0;
})());
assert.strictEqual(failedFlight.beforeTurn(flightEngine, rathian), false);
assert.strictEqual(flightEngine.monsterFlightState, 'grounded');
assert.strictEqual(flightEngine.monsterRecoveryDuration, 50);
assert.ok(flightEvents.some(event => event[0] === 'reaction'
    && event[5]?.animationProfile === 'rath-flight-stagger'));

for (const pattern of [
    tripleFireball,
    somersault,
    doubleSomersault,
    biteSomersault,
    somersaultGlide,
    byId('rathian.glide'),
    byId('rathian.triple_charge')
]) {
    const animation = AnimationCatalog.resolve(pattern, pattern.name, pattern.type, {
        id: 'rathian',
        species: 'Flying Wyvern'
    });
    assert.strictEqual(animation.id, pattern.animationProfile);
    assert.ok(animation.duration >= Number(pattern.animationDurationMs || 0),
        `${pattern.id} must preserve at least its authored visible motion time`);
}

const css = fs.readFileSync(path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');
const profileSource = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterProfiles.js'),
    'utf8'
);
assert.strictEqual(
    (profileSource.match(/HUNT_MONSTER_PATTERN_OVERRIDES\.rathian\s*=\s*pilot/g) || []).length,
    1,
    'Rathian must have one authoritative runtime definition'
);
const tripleChargeFrames = css.match(/@keyframes monster-motion-ground-charge-triple\s*\{([\s\S]*?)\n\}/)?.[1] || '';
for (const [percent, variable] of [
    ['12%', '--monster-charge-first-y'],
    ['43%', '--monster-charge-second-y'],
    ['74%', '--monster-charge-third-y']
]) {
    assert.match(tripleChargeFrames, new RegExp(`${percent.replace('%', '%')}[^}]*${variable}`),
        `Rathian triple charge needs a visible ${percent} collision at ${variable}`);
}
assert.match(css, /\.monster-motion-ground-charge-triple\s*\{[^}]*\slinear\s/);
const singleChargeFrames = css.match(/@keyframes monster-motion-rathian-ground-charge\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.match(singleChargeFrames, /30%[^}]*--monster-charge-first-y/,
    'Rathian single charge must reach the hunter early instead of slowly approaching before acceleration');
assert.doesNotMatch(tripleChargeFrames, /rotate\(180deg\)/);
const sharedDoubleTailFrames = css.split('\n').find(line =>
    line.includes('@keyframes monster-motion-tail-sweep-double')) || '';
assert.match(sharedDoubleTailFrames, /rotate\(162deg\)/);
assert.match(sharedDoubleTailFrames, /rotate\(342deg\)/);
assert.doesNotMatch(sharedDoubleTailFrames, /rotate\((?:702|720)deg\)/,
    'two half-turns must complete one circle instead of spinning a full circle twice');
for (const animationName of [
    'rathian-somersault',
    'rathian-tail-sweep-double',
    'rathian-ground-charge',
    'rathian-somersault-double',
    'rathian-bite-somersault',
    'rathian-somersault-glide',
    'rathian-glide',
    'rath-flight-stagger',
    'rath-flight-wobble'
]) {
    assert.match(css, new RegExp(`@keyframes monster-motion-${animationName}`));
}
const somersaultFrames = css.match(/@keyframes monster-motion-rathian-somersault\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.match(somersaultFrames, /36%\{[^}]*rotate\(0deg\)/,
    'Rathian must finish approaching the target before beginning the somersault');
assert.match(somersaultFrames, /48%\{[^}]*rotate\(calc\(-108deg\*var\(--monster-facing-flip,1\)\)\)/,
    'the tail impact must rise only after the approach has finished');
assert.doesNotMatch(somersaultFrames, /rotate\((?:150|200|250)deg\)/,
    'the somersault must not reach the same pose by sweeping the tail downward first');
for (const [animationName, impactAngle] of [
    ['rathian-somersault-double', '-108deg'],
    ['rathian-bite-somersault', '-108deg'],
    ['rathian-somersault-glide', '-108deg']
]) {
    const frames = css.match(new RegExp(`@keyframes monster-motion-${animationName}\\s*\\{([\\s\\S]*?)\\n\\}`))?.[1] || '';
    assert.match(frames, new RegExp(`rotate\\(calc\\(${impactAngle.replace('-', '\\-')}\\*var\\(--monster-facing-flip,1\\)\\)\\)`),
        `${animationName} must share the upward somersault rotation`);
    assert.match(frames, /rotate\(0deg\)/,
        `${animationName} must complete its approach before rotating`);
}
const somersaultGlideFrames = css.match(/@keyframes monster-motion-rathian-somersault-glide\s*\{([\s\S]*?)\n\}/)?.[1] || '';
for (const percent of ['8%', '15%', '22%', '30%']) {
    assert.match(somersaultGlideFrames, new RegExp(`${percent.replace('%', '%')}[^}]*opacity:1`),
        `Rathian must stay fully visible through the somersault at ${percent}`);
}
for (const [percent, variable] of [
    ['29%', '--monster-charge-first-exit-y'],
    ['61%', '--monster-charge-second-exit-y'],
    ['89%', '--monster-charge-third-exit-y']
]) {
    assert.match(tripleChargeFrames, new RegExp(`${percent.replace('%', '%')}[^}]*${variable}`),
        `Rathian triple charge must pass through its hunter and leave the screen at ${percent}`);
}
assert.match(css, /\.monster-local-action-fx\.breath-fizzle/);
assert.match(css, /\.monster-local-action-fx\.flight-stagger/);
const animatorSource = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterAttackAnimator.js'),
    'utf8'
);
assert.match(animatorSource, /runtimeImpactTargetSequence/);
assert.match(animatorSource, /runtimeImpactAllowEmptySequence/);
assert.match(animatorSource, /const phantomCard/,
    'empty left/right lanes still need a visible off-screen fireball');
const turnExecutorSource = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterTurnExecutor.js'),
    'utf8'
);
assert.match(turnExecutorSource,
    /!isImpactCommit && pattern\.type !== 'roar' && !pattern\.suppressPrepareAudio/,
    'somersault vocals must not fire when the action merely starts');
assert.match(turnExecutorSource,
    /pattern\.type !== 'roar' && pattern\.runtimeImpactAudioCue !== 'somersault'/,
    'the authored somersault contact vocal must not be doubled by the default impact route');

console.log('[test] Reviewed World Rathian runtime contract passed.');
