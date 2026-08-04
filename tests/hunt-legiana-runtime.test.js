'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HUNT_REVIEWED_MONSTER_ANATOMY = require('../js/effects/hunt/data/ReviewedMonsterAnatomy.js');
global.HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');

const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const AnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const BlightRuntime = require('../js/effects/hunt/HuntHunterBlightRuntime.js');
const FlightRuntime = require('../js/effects/hunt/HuntMonsterFlightRuntime.js');

const legiana = profiles.legiana;
const byId = id => legiana.find(pattern => pattern.id === id);

assert.deepStrictEqual(legiana.map(pattern => pattern.id), [
    'legiana.roar',
    'legiana.bite',
    'legiana.hop_claw',
    'legiana.ground_charge',
    'legiana.tail_spin',
    'legiana.aerial_claw',
    'legiana.aerial_cold_sweep',
    'legiana.cold_tail_slam',
    'legiana.drill_cross',
    'legiana.dive_landing'
]);
assert.strictEqual(legiana.some(pattern => pattern.type === 'ultimate'), false,
    'base Legiana must not receive an invented ultimate');
assert.strictEqual(legiana.some(pattern => pattern.delivery === 'projectile' || pattern.delivery === 'beam'), false,
    'Legiana cold must originate from its body and wing underside, never from a fictional mouth breath');
assert.ok(
    legiana.filter(pattern => pattern.tags.includes('flight-only') && !pattern.tags.includes('landing-only'))
        .every(pattern => pattern.weight === 1),
    'speed tuning must preserve equal weak/strong aerial selection weight'
);

const behavior = global.HuntMonsterArchetypeCatalog.behavior({ id: 'legiana' });
assert.strictEqual(behavior.roarSize, 'large');
assert.strictEqual(behavior.rageDurationTicks, 900);
assert.strictEqual(behavior.rageOpenerTakeoff, true);
assert.strictEqual(behavior.takeoffPreservesReadyAtb, true);
assert.deepStrictEqual([...behavior.flightGroundActionRange], [1, 2]);
assert.deepStrictEqual({ ...behavior.flightActionCountByState }, { normal: 2, enraged: 3 });
assert.deepStrictEqual({ ...behavior.takeoffInterference }, { kind: 'wind', size: 'small' });
assert.deepStrictEqual([...behavior.flightFailureChanceByBrokenWings], [0, .30, .65]);
assert.strictEqual(behavior.flightFailureStaggerTicks, 45);

const tailSpin = byId('legiana.tail_spin');
assert.strictEqual(tailSpin.brokenPartDamageModifiers.tail, .7);
assert.strictEqual(tailSpin.brokenPartTargetCaps.tail, 1);
const bite = byId('legiana.bite');
const hopClaw = byId('legiana.hop_claw');
const aerialClaw = byId('legiana.aerial_claw');
assert.strictEqual(bite.damageRatio, .27);
assert.strictEqual(bite.animationDurationMs, 1400);
assert.strictEqual(hopClaw.weight, 1);
assert.strictEqual(hopClaw.cooldownTicks, 30);
assert.strictEqual(hopClaw.animationProfile, 'legiana-hop-strike');
assert.strictEqual(hopClaw.originPart, 'claw');
assert.ok(hopClaw.tags.includes('claw'));
assert.strictEqual(aerialClaw.damageRatio, .30);
assert.strictEqual(aerialClaw.animationDurationMs, 1800);
assert.strictEqual(aerialClaw.originPart, 'claw');
assert.strictEqual(aerialClaw.weight, 1,
    'quick aerial attacks must not displace Legiana strong attacks through extra selection weight');
assert.strictEqual(global.HuntAtbConfig.monsterPostActionRecoverySeconds(hopClaw), 1,
    'reviewed weak hops must use the one-second light-action recovery even above the old damage cutoff');
const coldSweep = byId('legiana.aerial_cold_sweep');
assert.strictEqual(coldSweep.delivery, 'gas');
assert.strictEqual(coldSweep.originPart, 'body');
assert.strictEqual(coldSweep.targeting.mode, 'primary-adjacent-both');
assert.strictEqual(coldSweep.maxConsecutiveUses, 3);
assert.strictEqual(coldSweep.telegraphFx.durationMs, 800);
assert.strictEqual(coldSweep.fixedWindup, true);
const tailSlam = byId('legiana.cold_tail_slam');
assert.deepStrictEqual(tailSlam.targetDamageRatios, [.48, .24, .24]);
assert.strictEqual(tailSlam.weight, 1);
assert.strictEqual(tailSlam.windupTicks, 5);
assert.strictEqual(tailSlam.animationDurationMs, 2500);
assert.strictEqual(tailSlam.originPart, 'tail',
    'the cold tail slam must release cold from the tail rather than the body centre');

const party = [0, 1, 2, 3].map(index => ({ index }));
assert.deepStrictEqual(
    ActionPolicy.primaryAdjacentBothTargets(party, 3, () => .40).map(target => target.index),
    [1, 0, 2],
    'the direct target must remain first so adjacent cold can use the half-damage ratios'
);

const drill = byId('legiana.drill_cross');
assert.strictEqual(drill.damageRatio, .54);
assert.strictEqual(drill.targeting.mode, 'screen-sweep');
assert.strictEqual(drill.weight, 1);
assert.strictEqual(drill.cooldownTicks, 30);
assert.strictEqual(drill.windupTicks, 6);
assert.strictEqual(drill.movement.ticks, 32);
assert.strictEqual(drill.movement.untargetable, true);
assert.strictEqual(drill.impact.contactLeadRatio, .28,
    'the screw dive must hit when its leading body reaches a hunter, not after its centre passes');
assert.strictEqual(drill.animationDurationMs, 3000);
assert.strictEqual(drill.telegraphFx.durationMs, 700);
assert.strictEqual(drill.delivery, 'attached',
    'the ice-coated screw dive must use a body-bound trail instead of a fictional gas breath');
assert.strictEqual(byId('legiana.ground_charge').impact.delayRatio, .50,
    'the ground charge must resolve while Legiana is crossing the hunter slot');
assert.strictEqual(AnimationCatalog.resolve(drill, drill.name, drill.type, {
    id: 'legiana', species: 'Flying Wyvern'
}).id, 'legiana-drill-cross');

assert.strictEqual(BlightRuntime.DEFINITIONS.ice.ticks, 200);
const blightEngine = { callbacks: {}, addLog: () => {} };
const blight = new BlightRuntime(blightEngine);
const chilledHunter = { elementalBlights: { ice: 20 } };
assert.strictEqual(blight.staminaDelta(chilledHunter, -40), -50,
    'iceblight must raise every action ATB spend by 25% without changing recovery');
assert.strictEqual(blight.staminaDelta(chilledHunter, 40), 40);

const events = [];
const flight = new FlightRuntime(() => 0);
const flightEngine = {
    selectedMonster: { id: 'legiana', nameKO: '레이기에나' },
    selectedWeapons: [{ index: 0, status: 'alive' }, { index: 1, status: 'alive' }],
    monsterBehavior: behavior,
    monsterCanFly: true,
    monsterFlightState: 'grounded',
    monsterAtb: 100,
    monsterFlightCooldown: 0,
    monsterState: 'normal',
    monsterPartState: [],
    monsterGroundTurns: 0,
    monsterGroundActionsBeforeFlightTarget: null,
    addLog: () => {},
    showSkillBubble: () => {},
    updateMonsterFlightUI: () => {},
    applyHunterInterference: (hunter, kind, size) => events.push([hunter.index, kind, size]),
    callbacks: {}
};
assert.strictEqual(flight.beforeTurn(flightEngine, legiana), true);
assert.strictEqual(flightEngine.monsterFlightState, 'grounded', 'one ground action must occur before takeoff');
assert.strictEqual(flight.beforeTurn(flightEngine, legiana), false,
    'Legiana takeoff must finish as its own state transition before an aerial attack starts');
assert.strictEqual(flightEngine.monsterFlightState, 'airborne');
assert.strictEqual(flightEngine.monsterAtb, 100,
    'takeoff must preserve the ready ATB; the following aerial action spends it');
assert.deepStrictEqual(events, [[0, 'wind', 'small'], [1, 'wind', 'small']]);
flight.afterAction(flightEngine, coldSweep);
assert.strictEqual(flightEngine.forcedMonsterPatternId, undefined);
flight.afterAction(flightEngine, byId('legiana.aerial_claw'));
assert.strictEqual(flightEngine.monsterLandingPending, true);
assert.strictEqual(flightEngine.forcedMonsterPatternId, 'legiana.dive_landing');

const enragedEngine = {
    ...flightEngine,
    monsterState: 'enraged',
    monsterFlightState: 'airborne',
    monsterFlightTurns: 0,
    monsterLandingPending: false,
    forcedMonsterPatternId: null,
    selectedWeapons: []
};
flight.afterAction(enragedEngine, coldSweep);
flight.afterAction(enragedEngine, byId('legiana.aerial_claw'));
assert.strictEqual(enragedEngine.monsterLandingPending, false);
flight.afterAction(enragedEngine, coldSweep);
assert.strictEqual(enragedEngine.forcedMonsterPatternId, 'legiana.dive_landing');

const css = fs.readFileSync(path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');
assert.match(css, /\.monster-motion-legiana-drill-cross/);
assert.match(css, /@keyframes monster-motion-legiana-drill-cross/);
assert.match(css, /\.monster-motion-legiana-hop-strike/);
assert.match(css, /@keyframes monster-motion-legiana-hop-strike/);
assert.match(css, /\.monster-local-action-fx\.legiana-ice-charge\.is-playing/);
assert.match(css, /\.monster-local-action-fx\.legiana-rage-ice-release\.is-playing/);
assert.match(css, /\.monster-local-action-fx\.legiana-rage-claw-ice\.is-playing/);
assert.match(css, /\.monster-local-action-fx\.legiana-rage-tail-ice\.is-playing/);
const animatorSource = fs.readFileSync(path.join(
    __dirname, '..', 'js', 'effects', 'hunt', 'HuntMonsterAttackAnimator.js'
), 'utf8');
assert.match(animatorSource, /rotatedScaledRadius[\s\S]*?safeCrossMax/,
    'screen-crossing flyers must account for their rotated image bounds above the OBS chat-safe edge');

console.log('[test] Reviewed World Legiana runtime contract passed.');
