'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterFlightRuntime = require('../js/effects/hunt/HuntMonsterFlightRuntime.js');
const HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
const HuntMonsterTraitRuntime = require('../js/effects/hunt/HuntMonsterTraitRuntime.js');

assert.strictEqual(HuntMonsterFlightRuntime.isCapable({ id: 'rathalos' }), true);
assert.strictEqual(HuntMonsterFlightRuntime.isCapable({ id: 'diablos' }), false);
assert.strictEqual(
    HuntMonsterFlightRuntime.archetypes().behavior({ id: 'rathalos' }).enragedDamageMultiplier,
    1.10,
    'reviewed Rathalos rage damage must use the agreed 10% bonus'
);
assert.strictEqual(HuntMonsterFlightRuntime.archetypes().behavior({ id: 'rathalos' }).roarSize, 'small');
const engineSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
assert.match(engineSource, /authoredType === 'roar' \|\| tags\.has\('roar'\)[\s\S]*?type: 'roar'/,
    'grounded and airborne roars must bypass legacy elemental name inference');
const aerial = HuntMonsterFlightRuntime.decoratePattern('rathalos', {
    id: 'rathalos.claw_dive', name: '독조 급강하', type: 'charge', tags: ['charge'], sourceActionClass: 'cVerticalKickFly'
});
assert.ok(aerial.tags.includes('flight-only'));
assert.match(aerial.flightEvidence, /cVerticalKickFly/);
const ground = { id: 'rathalos.tail', name: '꼬리치기', type: 'physical', tags: ['physical'] };
const selector = new HuntMonsterPatternSelector(() => 0);
assert.strictEqual(selector.select({ id: 'rathalos' }, [aerial, ground], { state: 'normal', hpRatio: 1, flightState: 'grounded' }).id, ground.id,
    'grounded monsters must not select flight-only actions');
selector.cooldowns.clear();
assert.strictEqual(selector.select({ id: 'rathalos' }, [aerial, ground], { state: 'normal', hpRatio: 1, flightState: 'airborne' }).id, aerial.id,
    'airborne monsters must prefer their evidenced aerial kit');
const explicitlyGrounded = { ...ground, id: 'rathalos.ground-only', tags: ['physical', 'ground-only'] };
const airCompatible = { ...ground, id: 'rathalos.air-compatible', tags: ['projectile', 'air-compatible'] };
selector.cooldowns.clear();
assert.strictEqual(selector.select(
    { id: 'rathalos' },
    [explicitlyGrounded, airCompatible],
    { state: 'normal', hpRatio: 1, flightState: 'airborne' }
).id, airCompatible.id, 'ground-only moves must be impossible during a Rathalos flight phase');

const events = [];
const engine = {
    selectedMonster: { id: 'rathalos', nameKO: '리오레우스' }, monsterState: 'enraged', monsterMaxHp: 12000,
    addLog: text => events.push(text), showSkillBubble: () => {}, updateMonsterFlightUI: value => events.push(`flight:${value}`),
    updateMonsterAtbUI: () => {}, updateMonsterStateUI: state => events.push(state), shakeMonster: () => {},
    monsterAtb: 100, pendingMonsterAction: { pattern: aerial }, monsterKnockdownDuration: 0
};
const runtime = new HuntMonsterFlightRuntime(() => 0);
runtime.initialize(engine);
runtime.beforeTurn(engine, [aerial, ground]);
runtime.beforeTurn(engine, [aerial, ground]);
assert.strictEqual(engine.monsterFlightState, 'airborne');
assert.strictEqual(engine.monsterFlightTicksRemaining, 600, 'a flight phase must last 60 seconds at the 10 Hz combat tick');
runtime.afterAction(engine, aerial);
assert.strictEqual(engine.monsterFlightState, 'airborne', 'aerial actions must not randomly end the one-minute flight phase');
assert.strictEqual(new HuntMonsterFlightRuntime(() => .49).shouldEvade(engine), true, 'airborne monsters must evade below the 50% roll');
assert.strictEqual(new HuntMonsterFlightRuntime(() => .5).shouldEvade(engine), false, 'the 50% boundary must allow the hunter hit');
assert.strictEqual(runtime.onPartBreak(
    engine,
    { kind: 'head' },
    null,
    { retainedAtb: 50 }
), true);
assert.strictEqual(engine.monsterFlightState, 'grounded');
assert.strictEqual(engine.monsterState, 'knocked_down');
assert.strictEqual(engine.monsterAtb, 50,
    'an airborne part break must retain half of the pre-break ATB');
assert.strictEqual(engine.monsterKnockdownDuration, 105, 'aerial knockdowns must last 1.5x the normal 70-tick knockdown');
assert.strictEqual(engine.pendingMonsterAction, null);
assert.ok(events.includes('격추 대경직'));

const automaticEngine = {
    ...engine,
    monsterFlightState: 'airborne',
    monsterState: 'knocked_down',
    monsterKnockdownDuration: 70,
    monsterFlightTicksRemaining: 500,
    pendingMonsterAction: { pattern: aerial }
};
assert.strictEqual(runtime.promoteAirborneKnockdown(automaticEngine), true,
    'any knockdown entered during flight must automatically become an aerial knockdown');
assert.strictEqual(automaticEngine.monsterFlightState, 'grounded');
assert.strictEqual(automaticEngine.monsterKnockdownDuration, 105);
assert.strictEqual(automaticEngine.pendingMonsterAction, null);

const brokenInflationEngine = {
    selectedMonster: { id: 'paolumu', nameKO: '파오우르무' },
    monsterBehavior: HuntMonsterFlightRuntime.archetypes().behavior({ id: 'paolumu' }),
    monsterState: 'normal',
    monsterPartState: [{ kind: 'head', broken: true }],
    monsterFlightCooldown: 0,
    monsterFlightState: 'grounded',
    monsterCanFly: true,
    monsterTraitRuntime: new HuntMonsterTraitRuntime(() => 0)
};
brokenInflationEngine.monsterTraitRuntime.initialize(brokenInflationEngine);
const paolumuAir = {
    id: 'paolumu.air_blast',
    tags: ['flight-only'],
    requiredTraits: ['inflated']
};
assert.strictEqual(runtime.beforeTurn(brokenInflationEngine, [paolumuAir]), true);
assert.strictEqual(brokenInflationEngine.monsterFlightState, 'grounded',
    'a broken inflation-enabling part must prevent an unusable Paolumu takeoff');

const stalledAirEngine = {
    selectedMonster: { id: 'test_flyer', nameKO: '시험 비룡' },
    monsterFlightState: 'airborne',
    monsterJustTookOff: true,
    monsterFlightTicksRemaining: 100,
    monsterAtb: 100,
    battleTime: 42,
    monsterFlightCooldown: 0,
    updateMonsterFlightUI: () => {},
    updateMonsterAtbUI: () => {},
    callbacks: {}
};
assert.strictEqual(runtime.recoverNoEligibleAirAction(stalledAirEngine), true);
assert.strictEqual(stalledAirEngine.monsterFlightState, 'grounded');
assert.strictEqual(stalledAirEngine.monsterActionGateDiagnostics.at(-1).reason, 'no-eligible-air-action',
    'airborne selector recovery must leave a bounded diagnostic record');

const timedEngine = { ...engine, monsterFlightState: 'airborne', monsterFlightTicksRemaining: 1 };
runtime.tick(timedEngine);
assert.strictEqual(timedEngine.monsterFlightState, 'airborne',
    'Rathalos must remain airborne until its reviewed landing stomp resolves');
assert.strictEqual(timedEngine.forcedMonsterPatternId, 'rathalos.stomp');
assert.strictEqual(timedEngine.monsterLandingPending, true);
runtime.afterAction(timedEngine, { id: 'rathalos.stomp', flightTransition: 'land' });
assert.strictEqual(timedEngine.monsterFlightState, 'grounded',
    'the landing stomp impact must return Rathalos to the ground');

const trappedLanding = {
    ...engine,
    monsterFlightState: 'airborne',
    monsterFlightTicksRemaining: 10,
    pendingLandingTrap: { hunterIndex: 0 },
    monsterKnockdownDuration: 0,
    consumeTrapDuration: () => 40
};
runtime.land(trappedLanding, false);
assert.strictEqual(trappedLanding.pendingLandingTrap, null);
assert.strictEqual(trappedLanding.monsterState, 'knocked_down');
assert.strictEqual(trappedLanding.monsterKnockdownDuration, 40,
    'only one installed trap must trigger when the monster lands');
const transitionEngine = {
    ...engine,
    monsterFlightState: 'grounded',
    monsterFlightTicksRemaining: 0,
    monsterGroundTurns: 0
};
runtime.afterAction(transitionEngine, { id: 'rathalos.backstep_fireball', flightTransition: 'takeoff' });
assert.strictEqual(transitionEngine.monsterFlightState, 'airborne',
    'a reviewed combo may enter flight through generic pattern data');

const hunterTurnSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
const battleTickSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
const huntEffectSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const valstraxSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js'), 'utf8');
const monsterAnimatorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
assert.match(monsterAnimatorSource, /isUltimate && !isValstraxAmbush/,
    'the real Valstrax landing must skip the generic red-square ultimate spectacle');
const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const cssSource = require('./helpers/hunt-css');
assert.doesNotMatch(rendererSource, /id="hunt-flight-knockdown-gauge"/,
    'the retired airborne damage gauge must not leak invented information');
assert.match(rendererSource, /hunt-monster-parts[\s\S]*?updateMonsterPartsUI/,
    'breakable parts must have a compact persistent icon rail');
assert.match(cssSource, /translateY\(-235px\)[\s\S]*?translateY\(-275px\)/, 'the airborne stage must hover near the monster HP bar');
assert.ok(
    hunterTurnSource.indexOf('monsterFlightRuntime?.shouldEvade') < hunterTurnSource.indexOf('monsterHp = Math.max'),
    'airborne evasion must resolve before monster HP damage is applied'
);
assert.ok(
    battleTickSource.indexOf('promoteAirborneKnockdown?.(engine)') < battleTickSource.indexOf('monsterFlightRuntime.tick(engine)'),
    'generic knockdowns must be promoted before natural landing can clear the airborne state'
);
assert.doesNotMatch(huntEffectSource, /director\.trigger\(['"]valstrax['"]\)/,
    'Valstrax ambush must never enter the global visual queue');
assert.match(huntEffectSource, /renderer\.triggerValstraxAmbushWarning\(\)/,
    'the ambush warning must use a hunt-owned visual layer');
assert.match(valstraxSource, /onTriggerMonsterAttack\('physical',[\s\S]*?붉은 혜성 강습[\s\S]*?type:\s*'ultimate'/,
    'Crimson Comet Ambush must be a physical whole-party ultimate, not an elemental laser');

console.log('[test] Evidence-gated monster flight and aerial knockdown passed.');
