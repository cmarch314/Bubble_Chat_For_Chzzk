'use strict';

const assert = require('assert');
const HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');

const logs = [];
const engine = {
    addLog: text => logs.push(text),
    selectedWeapons: [],
    updatePhialsUI() {},
    updateExtractsUI() {},
    updateOverheatUI() {}
};
const mechanics = new HuntWeaponMechanics(() => 0);
const selector = new HuntWeaponActionSelector(() => 0, mechanics);

const greatSwordActions = HuntWeaponMechanics.actionsFor('great_sword');
assert.ok(greatSwordActions.some(action => action.id === 'great_sword.wide_slash'), 'Great Sword must retain a non-charge severing route');
assert.ok(!greatSwordActions.some(action => action.id === 'great_sword.side_blow'), 'removed Side Blow must not remain selectable');
const greatSword = { id: 'great_sword', hunterName: 'GS', hp: 100, maxHp: 100 };
mechanics.initialize(greatSword);
const normalGreatSword = { id: 'great_sword', hunterName: 'GS NORMAL', hp: 100, maxHp: 100 };
mechanics.initialize(normalGreatSword);
const firstNormal = selector.select(normalGreatSword, greatSwordActions, { monsterDowned: false, monsterAtb: 20 }).action;
assert.strictEqual(firstNormal.id, 'great_sword.wide_slash', 'an ordinary opening must allow a non-charge Great Sword attack');
mechanics.applyAction(engine, normalGreatSword, firstNormal);
normalGreatSword.lastActionId = firstNormal.id;
assert.strictEqual(selector.select(normalGreatSword, greatSwordActions, { monsterDowned: false, monsterAtb: 20 }).action.id, 'great_sword.kick', 'Wide Slash must link directly into the retained emoji Kick');
const orthodoxGreatSwordTrace = [
    'great_sword.charge_1', 'great_sword.charge_2', 'great_sword.charge_3', 'great_sword.charged_slash',
    'great_sword.strong_charge_1', 'great_sword.strong_charge_2', 'great_sword.strong_charge_3', 'great_sword.strong_charged_slash',
    'great_sword.true_charge_1', 'great_sword.true_charge_2', 'great_sword.true_charge_3', 'great_sword.true_charged_slash'
];
greatSwordActions
    .filter(action => /^great_sword\.(?:strong_|true_)?charge_[123]$/.test(action.id))
    .forEach(action => assert.strictEqual(action.durationTicks, 10, `${action.id} must use the shared one-second charge stage`));
orthodoxGreatSwordTrace.forEach(expected => {
    const selected = selector.select(greatSword, greatSwordActions, { monsterDowned: true, monsterAtb: 0 }).action;
    assert.strictEqual(selected.id, expected, 'Great Sword must complete all three charge stages in every orthodox combo tier');
    const result = mechanics.applyAction(engine, greatSword, selected);
    if (mechanics.isPreparation(selected)) assert.ok(result.atbAfterAction >= 92, 'Great Sword charge ticks must rapidly recycle ATB');
});
assert.deepStrictEqual([greatSword.greatSwordChain, greatSword.greatSwordCharge], [0, 0]);

const pressuredGreatSword = { id: 'great_sword', hunterName: 'GS PRESSURE', hp: 100, maxHp: 100, greatSwordChain: 0, greatSwordCharge: 1 };
mechanics.initialize(pressuredGreatSword);
const tackle = selector.select(pressuredGreatSword, greatSwordActions, { monsterAtb: 95, monsterState: 'enraged' }).action;
assert.strictEqual(tackle.id, 'great_sword.charged_slash',
    'high monster ATB alone must release the stored charge instead of manufacturing a tackle');
pressuredGreatSword.greatSwordCharge = 1;
assert.strictEqual(mechanics.damageMultiplier(pressuredGreatSword, greatSwordActions.find(row => row.id === 'great_sword.strong_charged_slash')), 0.55);
pressuredGreatSword.greatSwordCharge = 3;
assert.strictEqual(mechanics.damageMultiplier(pressuredGreatSword, greatSwordActions.find(row => row.id === 'great_sword.strong_charged_slash')), 1);
const cautiousRandomMechanics = new HuntWeaponMechanics(() => .99);
const cautiousSelector = new HuntWeaponActionSelector(() => .99, cautiousRandomMechanics);
const imminentGreatSword = { id: 'great_sword', hunterName: 'GS IMMINENT', hp: 100, maxHp: 100, greatSwordChain: 0, greatSwordCharge: 1 };
cautiousRandomMechanics.initialize(imminentGreatSword);
assert.strictEqual(
    cautiousSelector.select(imminentGreatSword, greatSwordActions, { monsterAtb: 94, monsterPressure: true }).action.id,
    'great_sword.charged_slash',
    'monster pressure metadata must not bypass the impact-time reactive tackle owner'
);

const finalTierPressure = {
    id: 'great_sword', hunterName: 'GS LOOP GUARD', hp: 100, maxHp: 100,
    greatSwordChain: 2, greatSwordCharge: 0
};
cautiousRandomMechanics.initialize(finalTierPressure);
const pressureTrace = [];
for (let turn = 0; turn < 6; turn++) {
    const selected = cautiousSelector.select(finalTierPressure, greatSwordActions, {
        monsterAtb: 99, monsterPressure: true, monsterState: 'enraged'
    }).action;
    pressureTrace.push(selected.id);
    cautiousRandomMechanics.applyAction(engine, finalTierPressure, selected);
    finalTierPressure.lastActionId = selected.id;
}
assert.ok(!pressureTrace.includes('great_sword.tackle'),
    'ordinary turns must never produce the old charge/tackle feedback loop');
assert.ok(pressureTrace.includes('great_sword.true_charged_slash'),
    'the final charge tier must cash out into True Charged Slash under sustained pressure');

const switchActions = HuntWeaponMechanics.actionsFor('switch_axe');
const switchAxe = { id: 'switch_axe', hunterName: 'SA' };
mechanics.initialize(switchAxe);
assert.strictEqual(switchAxe.weaponMode, 'axe');
assert.strictEqual(selector.select(switchAxe, switchActions).action.id, 'switch_axe.axe_overhead_slash');

let action = switchActions.find(row => row.id === 'switch_axe.axe_overhead_slash');
mechanics.applyAction(engine, switchAxe, action);
switchAxe.lastActionId = action.id;
assert.strictEqual(selector.select(switchAxe, switchActions).action.id, 'switch_axe.axe_wild_swing');
action = switchActions.find(row => row.id === 'switch_axe.axe_wild_swing');
mechanics.applyAction(engine, switchAxe, action);
switchAxe.lastActionId = action.id;
assert.strictEqual(selector.select(switchAxe, switchActions).action.id, 'switch_axe.axe_heavy_slam');
action = switchActions.find(row => row.id === 'switch_axe.axe_heavy_slam');
mechanics.applyAction(engine, switchAxe, action);
switchAxe.lastActionId = action.id;
assert.ok(switchAxe.powerAxeDuration > 0);
assert.strictEqual(selector.select(switchAxe, switchActions).action.id, 'switch_axe.morph_to_sword');

action = switchActions.find(row => row.id === 'switch_axe.morph_to_sword');
mechanics.applyAction(engine, switchAxe, action);
assert.strictEqual(switchAxe.weaponMode, 'sword');
for (const id of ['switch_axe.sword_rising_slash', 'switch_axe.sword_double_slash', 'switch_axe.sword_heavenward_flurry']) {
    action = switchActions.find(row => row.id === id);
    switchAxe.switchGauge = Math.max(switchAxe.switchGauge, 60);
    mechanics.applyAction(engine, switchAxe, action);
}
action = switchActions.find(row => row.id === 'switch_axe.sword_rising_slash');
switchAxe.switchGauge = Math.max(switchAxe.switchGauge, 60);
mechanics.applyAction(engine, switchAxe, action);
assert.ok(switchAxe.ampedStateDuration > 0, 'sword attacks must build into amped state');
switchAxe.switchGauge = 80;
assert.strictEqual(
    selector.select(switchAxe, switchActions, { monsterDowned: true }).action.id,
    'switch_axe.full_release_slash',
    'a downed opening must cash out the built amped state'
);

switchAxe.ampedStateDuration = 0;
switchAxe.ampGauge = 40;
switchAxe.switchGauge = 80;
assert.strictEqual(
    selector.select(switchAxe, switchActions, { monsterDowned: true }).action.id,
    'switch_axe.unbridled_slash',
    'a large opening before amped state must route into Wilds Unbridled/Compressed Release Slash'
);
switchAxe.switchGauge = 60;
const counterStance = selector.select(switchAxe, switchActions, { monsterPressure: true }).action;
assert.strictEqual(counterStance.id, 'switch_axe.sword_counter_stance', 'sword mode must answer pressure with its Wilds counter window');
mechanics.applyAction(engine, switchAxe, counterStance);
switchAxe.switchCounterWaiting = false;
switchAxe.switchCounterReady = true;
assert.strictEqual(
    selector.select(switchAxe, switchActions).action.id,
    'switch_axe.sword_counter_rising',
    'a successful counter window must immediately route into Counter Rising Slash'
);

const hammerActions = HuntWeaponMechanics.actionsFor('hammer');
hammerActions
    .filter(action => /^hammer\.(?:charge_[123]|mighty_charge)$/.test(action.id))
    .forEach(action => {
        assert.strictEqual(action.durationTicks, 10, `${action.id} must use the shared one-second charge stage`);
        assert.strictEqual(action.atbCostSeconds, 0.5, `${action.id} must recover its ATB inside that one-second stage`);
    });
const hammer = { id: 'hammer', hunterName: 'HAM' };
mechanics.initialize(hammer);
for (const expected of ['hammer.charge_1', 'hammer.charge_2', 'hammer.charge_3', 'hammer.mighty_charge', 'hammer.mighty_charge_slam']) {
    const selected = hammerActions.find(row => row.id === expected);
    assert.ok(mechanics.isEligible(hammer, selected), `${expected} must follow the charge gate`);
    const result = mechanics.applyAction(engine, hammer, selected);
    if (mechanics.isPreparation(selected)) assert.ok(result.atbAfterAction >= 90, 'short charge steps must rapidly recycle ATB');
}
assert.strictEqual(hammer.hammerChargeLevel, 0);
const normalHammer = { id: 'hammer', hunterName: 'NORMAL HAM', hp: 100, maxHp: 100 };
mechanics.initialize(normalHammer);
for (const expected of ['hammer.overhead_1', 'hammer.overhead_2', 'hammer.upswing']) {
    const selected = selector.select(normalHammer, hammerActions, { monsterDowned: false, monsterPressure: false }).action;
    assert.strictEqual(selected.id, expected, 'normal hammer flow must preserve the three-hit overhead chain');
    mechanics.applyAction(engine, normalHammer, selected);
}
const bigBangHammer = { id: 'hammer', hunterName: 'BIG BANG', hp: 100, maxHp: 100 };
mechanics.initialize(bigBangHammer);
for (const expected of ['hammer.big_bang_1', 'hammer.big_bang_2', 'hammer.big_bang_3', 'hammer.big_bang_4', 'hammer.big_bang_finisher']) {
    const selected = selector.select(bigBangHammer, hammerActions, { monsterDowned: true }).action;
    assert.strictEqual(selected.id, expected, 'a downed monster must permit the complete Big Bang chain');
    mechanics.applyAction(engine, bigBangHammer, selected);
}
const focusHammer = { id: 'hammer', hunterName: 'FOCUS', hp: 100, maxHp: 100 };
mechanics.initialize(focusHammer);
const focusAction = selector.select(focusHammer, hammerActions, { monsterWounded: true }).action;
assert.strictEqual(focusAction.id, 'hammer.focus_earthquake');
mechanics.applyAction(engine, focusHammer, focusAction);
assert.ok(focusHammer.hammerFocusCooldown > 0, 'focus strike must have a bounded repeat cooldown');
const pressuredHammer = { id: 'hammer', hunterName: 'PRESSURED HAM', hp: 18, maxHp: 100, hammerChargeLevel: 1 };
mechanics.initialize(pressuredHammer);
assert.strictEqual(
    selector.select(pressuredHammer, hammerActions, { monsterPressure: true }).action.id,
    'hammer.release_1',
    'a critically pressured hunter may cash out early instead of blindly charging'
);
hammer.hammerChargeLevel = 2;
mechanics.onHit(hammer);
assert.strictEqual(hammer.hammerChargeLevel, 0, 'taking a clean hit must break hammer charge buildup');

const swordShieldActions = HuntWeaponMechanics.actionsFor('sword_shield');
const swordShield = { id: 'sword_shield', hunterName: 'SNS', hp: 100, maxHp: 100 };
mechanics.initialize(swordShield);
for (const id of ['sword_shield.chop', 'sword_shield.lateral_slash', 'sword_shield.return_stroke', 'sword_shield.spinning_rising_slash', 'sword_shield.spinning_reaper']) {
    const snsAction = swordShieldActions.find(row => row.id === id);
    assert.ok(mechanics.isEligible(swordShield, snsAction), `${id} must retain its intended Wilds chain gate`);
    mechanics.applyAction(engine, swordShield, snsAction);
}
assert.strictEqual(swordShield.snsChain, 0);

const shieldBash = id => swordShieldActions.find(row => row.id === id);
for (const id of ['sword_shield.shield_bash_1', 'sword_shield.shield_bash_2', 'sword_shield.shield_bash_3', 'sword_shield.guard_slash']) {
    const snsAction = shieldBash(id);
    assert.ok(mechanics.isEligible(swordShield, snsAction));
    mechanics.applyAction(engine, swordShield, snsAction);
}
assert.strictEqual(swordShield.snsShieldStep, 0, 'guard slash must reset the shield-bash loop cleanly');

const backstep = swordShieldActions.find(row => row.id === 'sword_shield.backstep');
mechanics.applyAction(engine, swordShield, backstep);
assert.strictEqual(swordShield.snsBackstepReady, true);
for (const id of ['sword_shield.perfect_rush_1', 'sword_shield.perfect_rush_2', 'sword_shield.perfect_rush_finisher']) {
    mechanics.applyAction(engine, swordShield, swordShieldActions.find(row => row.id === id));
}
assert.strictEqual(swordShield.perfectRushStep, 0);

mechanics.applyAction(engine, swordShield, backstep);
mechanics.applyAction(engine, swordShield, swordShieldActions.find(row => row.id === 'sword_shield.charged_slash'));
assert.strictEqual(selector.select(swordShield, swordShieldActions, { monsterDowned: true }).action.id, 'sword_shield.falling_bash');
assert.deepStrictEqual(mechanics.presentationFor(swordShield, swordShieldActions.find(row => row.id === 'sword_shield.chop')), { label: '연속 베기', bubble: false, log: false });
assert.deepStrictEqual(mechanics.presentationFor(swordShield, swordShieldActions.find(row => row.id === 'sword_shield.falling_bash')), { label: '방패 내려찍기!', bubble: true, log: true });

const dualBladeActions = HuntWeaponMechanics.actionsFor('dual_blades');
const dualBlades = { id: 'dual_blades', hunterName: 'DB', hp: 100, maxHp: 100 };
mechanics.initialize(dualBlades);
for (const expected of ['dual_blades.double_slash', 'dual_blades.double_slash_return', 'dual_blades.circle_slash']) {
    const selected = selector.select(dualBlades, dualBladeActions).action;
    assert.strictEqual(selected.id, expected, 'normal Dual Blades attacks must build the red Demon Gauge in sequence');
    mechanics.applyAction(engine, dualBlades, selected);
    dualBlades.lastActionId = selected.id;
}
assert.strictEqual(dualBlades.archdemonGauge, 90);
let selected = selector.select(dualBlades, dualBladeActions).action;
mechanics.applyAction(engine, dualBlades, selected);
dualBlades.lastActionId = selected.id;
assert.strictEqual(dualBlades.archdemonGauge, 100, 'normal attacks must cap the red Demon Gauge at 100');
assert.strictEqual(selector.select(dualBlades, dualBladeActions).action.id, 'dual_blades.enter_demon');
mechanics.applyAction(engine, dualBlades, dualBladeActions.find(row => row.id === 'dual_blades.enter_demon'));
assert.strictEqual(dualBlades.demonModeMinTicks, 0, 'Demon Mode lifetime must be owned by the red gauge, not a hidden timer');
for (const expected of [
    'dual_blades.demon_fang', 'dual_blades.demon_double_slash',
    'dual_blades.demon_flurry', 'dual_blades.demon_roundslash'
]) {
    const selected = selector.select(dualBlades, dualBladeActions).action;
    assert.strictEqual(selected.id, expected, 'Demon Mode must preserve its fast four-action internal loop');
    mechanics.applyAction(engine, dualBlades, selected);
    dualBlades.lastActionId = selected.id;
}
assert.strictEqual(dualBlades.archdemonGauge, 40, 'Demon attacks must consume rather than generate the red Demon Gauge');
dualBlades.archdemonGauge = 100;
for (const expected of ['dual_blades.blade_dance_1', 'dual_blades.blade_dance_2', 'dual_blades.blade_dance']) {
    const selected = selector.select(dualBlades, dualBladeActions, { monsterDowned: true }).action;
    assert.strictEqual(selected.id, expected, 'a downed opening must build visibly through Demon Dance I, II and III');
    mechanics.applyAction(engine, dualBlades, selected);
    dualBlades.lastActionId = selected.id;
}
assert.strictEqual(dualBlades.demonDanceStep, 0);
assert.strictEqual(dualBlades.archdemonGauge, 34, 'Demon Dance must cash out 66 points of Demon Gauge');
dualBlades.archdemonGauge = 10;
const demonExit = selector.select(dualBlades, dualBladeActions).action;
assert.strictEqual(demonExit.id, 'dual_blades.exit_demon', 'insufficient Demon Gauge must cause an explicit Demon Mode exit');
mechanics.applyAction(engine, dualBlades, demonExit);
assert.strictEqual(dualBlades.demonToggleCooldown, 100, 'Demon Mode exit must open a real re-entry cooldown');
dualBlades.archdemonGauge = 100;
dualBlades.dualChain = 0;
dualBlades.lastActionId = '';
assert.notStrictEqual(selector.select(dualBlades, dualBladeActions).action.id, 'dual_blades.enter_demon',
    'a full Demon Gauge must not cause an immediate mode bounce during the toggle cooldown');
for (let tick = 0; tick < 99; tick++) mechanics.tick(dualBlades);
assert.notStrictEqual(selector.select(dualBlades, dualBladeActions).action.id, 'dual_blades.enter_demon',
    'Demon Mode must remain locked until the full cooldown has elapsed');
mechanics.tick(dualBlades);
dualBlades.dualChain = 0;
dualBlades.lastActionId = '';
assert.strictEqual(selector.select(dualBlades, dualBladeActions).action.id, 'dual_blades.enter_demon',
    'Demon Mode may resume only after cooldown with a completely filled red gauge');
assert.deepStrictEqual(mechanics.presentationFor(dualBlades, dualBladeActions.find(row => row.id === 'dual_blades.demon_flurry')), { label: '쌍검 연계', bubble: false, log: false });
assert.deepStrictEqual(mechanics.presentationFor(dualBlades, dualBladeActions.find(row => row.id === 'dual_blades.blade_dance')), { label: '귀인난무 III!', bubble: true, log: true });

const hornActions = HuntWeaponMechanics.actionsFor('hunting_horn');
const horn = { id: 'hunting_horn', hunterName: 'HH', status: 'alive', hp: 100, maxHp: 100 };
const hornAlly = { id: 'great_sword', hunterName: 'ALLY', status: 'alive', hp: 50, maxHp: 100 };
engine.selectedWeapons = [horn, hornAlly];
mechanics.initialize(horn);
const playNote = color => mechanics.applyAction(engine, horn, hornActions.find(row => row.id === `hunting_horn.note_${color}`));
['red', 'blue', 'red', 'blue', 'green', 'blue', 'green', 'red', 'green'].forEach(playNote);
assert.deepStrictEqual(horn.storedMelodies, ['attack', 'defense', 'heal'], 'three-note recipes must charge up to three melody sheets');
assert.strictEqual(horn.hornNotes.length, 0);
let hornAction = selector.select(horn, hornActions).action;
assert.strictEqual(hornAction.id, 'hunting_horn.recital_start');
mechanics.applyAction(engine, horn, hornAction);
assert.strictEqual(horn.recitalStartCount, 3);
for (const melodyId of ['attack', 'defense', 'heal']) {
    hornAction = selector.select(horn, hornActions).action;
    assert.strictEqual(hornAction.id, 'hunting_horn.recital_strike', 'each fast recital step must consume exactly one stocked melody');
    assert.strictEqual(horn.storedMelodies[0], melodyId);
    mechanics.applyAction(engine, horn, hornAction);
}
assert.deepStrictEqual(horn.storedMelodies, []);
assert.ok(hornAlly.hornAttackBuffTicks > 0, 'attack melody must buff the party');
assert.ok(hornAlly.hornDefenseBuffTicks > 0, 'defense melody must buff the party');
assert.ok(hornAlly.hp > 50, 'healing melody must restore party health');
hornAction = selector.select(horn, hornActions).action;
assert.strictEqual(hornAction.id, 'hunting_horn.recital_finish');
assert.deepStrictEqual(mechanics.presentationFor(horn, hornAction), { label: '3악보 연주 완주!', bubble: true, log: true });
mechanics.applyAction(engine, horn, hornAction);
assert.strictEqual(horn.recitalActive, false);
assert.ok(hornAlly.hornSpeedBuffTicks > 0, 'a full three-sheet recital must grant its completion tempo bonus');
assert.deepStrictEqual(mechanics.presentationFor(horn, hornActions.find(row => row.id === 'hunting_horn.note_red')), { label: '음색 입력', bubble: false, log: false });
horn.storedMelodies = ['speed'];
horn.recitalActive = true;
horn.recitalStartCount = 1;
mechanics.onHit(horn);
assert.deepStrictEqual(horn.storedMelodies, ['speed'], 'an interrupted recital must preserve every melody sheet that was not consumed');
assert.strictEqual(horn.recitalActive, false);

const longSwordActions = HuntWeaponMechanics.actionsFor('long_sword');
const longSword = { id: 'long_sword', hunterName: 'LS', hp: 100, maxHp: 100, spiritGauge: 100 };
mechanics.initialize(longSword);
for (const expected of [
    'long_sword.spirit_slash_1',
    'long_sword.spirit_slash_2',
    'long_sword.spirit_slash_3',
    'long_sword.spirit_roundslash'
]) {
    const selected = selector.select(longSword, longSwordActions, { monsterAtb: 20 }).action;
    assert.strictEqual(selected.id, expected, 'Long Sword must preserve the full spirit I→II→III→roundslash route');
    mechanics.applyAction(engine, longSword, selected);
    mechanics.onConfirmedHit(engine, longSword, selected);
    longSword.lastActionId = selected.id;
}
assert.strictEqual(longSword.spiritLevel, 1, 'only the roundslash payoff may raise spirit color');

{
    const roundslash = longSwordActions.find(action => action.id === 'long_sword.spirit_roundslash');
    const missedRoundslash = {
        id: 'long_sword',
        hunterName: 'MISS LS',
        hp: 100,
        maxHp: 100,
        spiritGauge: 100,
        spiritLevel: 2,
        spiritRoundslashReady: true
    };
    mechanics.initialize(missedRoundslash);
    mechanics.applyAction(engine, missedRoundslash, roundslash);
    assert.strictEqual(missedRoundslash.spiritLevel, 2,
        'starting Roundslash must not raise spirit level before hit confirmation');
    mechanics.onAttackMiss(engine, missedRoundslash, roundslash);
    assert.strictEqual(missedRoundslash.spiritLevel, 2,
        'a missed Roundslash must fail the level-up without lowering an existing level');
    assert.strictEqual(missedRoundslash.spiritGauge, 0,
        'a missed Roundslash must empty the spirit gauge');
}

assert.strictEqual(HuntWeaponMechanics.longSwordSpecialSheatheChance(0), 0);
assert.strictEqual(HuntWeaponMechanics.longSwordSpecialSheatheChance(1), 0.10);
assert.strictEqual(HuntWeaponMechanics.longSwordSpecialSheatheChance(2), 0.20);
assert.strictEqual(HuntWeaponMechanics.longSwordSpecialSheatheChance(3), 1);
{
    const selectedUnderPressure = (level, roll) => {
        const probabilityMechanics = new HuntWeaponMechanics(() => roll);
        const hunter = {
            id: 'long_sword',
            hunterName: 'CHANCE LS',
            hp: 100,
            maxHp: 100,
            spiritGauge: 0,
            spiritLevel: level,
            _mechanicMonsterPressure: true
        };
        probabilityMechanics.initialize(hunter);
        const index = probabilityMechanics.selectAction(hunter, longSwordActions, { monsterAtb: 80 });
        return longSwordActions[index]?.id;
    };
    assert.strictEqual(selectedUnderPressure(1, 0.099), 'long_sword.special_sheathe');
    assert.notStrictEqual(selectedUnderPressure(1, 0.10), 'long_sword.special_sheathe');
    assert.strictEqual(selectedUnderPressure(2, 0.199), 'long_sword.special_sheathe');
    assert.notStrictEqual(selectedUnderPressure(2, 0.20), 'long_sword.special_sheathe');
}

longSword.spiritLevel = 2;
longSword.spiritGauge = 70;
assert.strictEqual(selector.isEligible(longSword, longSwordActions.find(action => action.id === 'long_sword.helm_breaker')), false,
    'Helm Breaker must remain forbidden below red spirit level 3');
const specialSheathe = selector.select(longSword, longSwordActions, { monsterAtb: 90, monsterState: 'enraged' }).action;
assert.strictEqual(specialSheathe.id, 'long_sword.special_sheathe');
assert.strictEqual(specialSheathe.activeTicks, 60, 'Special Sheathe must keep its counter wait window open for 6 seconds');
assert.strictEqual(specialSheathe.durationTicks, 64, 'the 6 second active window must be included in total action ownership');
mechanics.applyAction(engine, longSword, specialSheathe);
assert.strictEqual(longSword.specialSheatheReady, true);
const expiredSheathe = selector.select(longSword, longSwordActions, { monsterAtb: 0 }).action;
assert.strictEqual(expiredSheathe.id, 'long_sword.iai_counter_fail', 'an unanswered special-sheathe window must not remain armed forever');
mechanics.applyAction(engine, longSword, expiredSheathe);
assert.strictEqual(longSword.spiritLevel, 1, 'missing the World-style Iai counter must consume one spirit level');

longSword.spiritLevel = 3;
longSword.iaiHelmBreakerReady = true;
const iaiFollowup = selector.select(longSword, longSwordActions, { monsterAtb: 25 }).action;
assert.strictEqual(iaiFollowup.id, 'long_sword.helm_breaker', 'Wilds Iai success must route into Helm Breaker, not Roundslash');
mechanics.applyAction(engine, longSword, iaiFollowup);
assert.strictEqual(longSword.spiritLevel, 2);
assert.strictEqual(longSword.spiritReleaseReady, true, 'a red-gauge Helm Breaker must open Spirit Release Slash');
const releaseSlash = selector.select(longSword, longSwordActions, { monsterAtb: 25 }).action;
assert.strictEqual(releaseSlash.id, 'long_sword.spirit_release_slash');
mechanics.applyAction(engine, longSword, releaseSlash);
assert.strictEqual(longSword.spiritReleaseReady, false);

const redGaugeMechanics = new HuntWeaponMechanics(() => 0.7);
const redGaugeSelector = new HuntWeaponActionSelector(() => 0.7, redGaugeMechanics);
const redGaugeLongSword = { id: 'long_sword', hunterName: 'RED LS', hp: 100, maxHp: 100, spiritGauge: 70, spiritLevel: 3 };
redGaugeMechanics.initialize(redGaugeLongSword);
assert.strictEqual(
    redGaugeSelector.select(redGaugeLongSword, longSwordActions, { monsterAtb: 90, monsterState: 'enraged' }).action.id,
    'long_sword.special_sheathe',
    'red spirit level 3 must make Special Sheathe the primary response under monster pressure'
);

longSword.specialSheatheReady = true;
longSword.spiritRoundslashReady = true;
longSword.iaiHelmBreakerReady = true;
longSword.spiritReleaseReady = true;
mechanics.onHit(longSword);
assert.strictEqual(longSword.specialSheatheReady, false, 'taking a hit must close a stale Iai window');
assert.strictEqual(longSword.spiritRoundslashReady, false, 'taking a hit must close a stale foresight follow-up');
assert.strictEqual(longSword.iaiHelmBreakerReady, false, 'taking a hit must close a stale Iai follow-up');
assert.strictEqual(longSword.spiritReleaseReady, false, 'taking a hit must close a stale release follow-up');

const chargeBladeActions = HuntWeaponMechanics.actionsFor('charge_blade');
const chargeBlade = { id: 'charge_blade', hunterName: 'CB', hp: 100, maxHp: 100 };
mechanics.initialize(chargeBlade);
chargeBlade.phials = 3;
chargeBlade.shieldChargeDuration = 45;
assert.strictEqual(
    selector.select(chargeBlade, chargeBladeActions).action.id,
    'charge_blade.refresh_shield',
    'Charge Blade must spend stocked phials to refresh unified shield/Power Axe before it expires'
);
chargeBlade.chargeBladeMode = 'axe';
chargeBlade.phials = 3;
chargeBlade.shieldChargeDuration = 45;
assert.strictEqual(
    selector.select(chargeBlade, chargeBladeActions).action.id,
    'charge_blade.morph_sword',
    'an expiring shield charge must make axe mode return to sword before the refresh opportunity is lost'
);
const saed = chargeBladeActions.find(row => row.id === 'charge_blade.saed');
chargeBlade.phials = 5;
assert.ok(mechanics.damageMultiplier(chargeBlade, saed) > mechanics.damageMultiplier({ ...chargeBlade, phials: 3 }, saed), 'SAED payoff must scale with the number of discharged phials');

const heavyBowgunActions = HuntWeaponMechanics.actionsFor('heavy_bowgun');
const heavyBowgun = { id: 'heavy_bowgun', hunterName: 'HBG', ignitionGauge: 100, magazine: 4, maxMagazine: 4 };
mechanics.initialize(heavyBowgun);
let hbgAction = selector.select(heavyBowgun, heavyBowgunActions, { monsterDowned: true }).action;
assert.strictEqual(hbgAction.id, 'heavy_bowgun.enter_ignition');
mechanics.applyAction(engine, heavyBowgun, hbgAction);
for (const id of ['heavy_bowgun.wyvernheart_1', 'heavy_bowgun.wyvernheart_2', 'heavy_bowgun.wyvernheart_3']) {
    hbgAction = selector.select(heavyBowgun, heavyBowgunActions).action;
    assert.strictEqual(hbgAction.id, id, 'Wyvernheart must retain its escalating barrage stage');
    mechanics.applyAction(engine, heavyBowgun, hbgAction);
}

const bowActions = HuntWeaponMechanics.actionsFor('bow');
const bowHunter = { id: 'bow', hunterName: 'BOW', bowStamina: 20 };
mechanics.initialize(bowHunter);
const breath = selector.select(bowHunter, bowActions).action;
assert.strictEqual(breath.id, 'bow.recover_stamina', 'Bow must stop its damage chain when stamina is exhausted');
mechanics.applyAction(engine, bowHunter, breath);
assert.ok(bowHunter.bowStamina > 20, 'the recovery beat must restore enough stamina to resume charging');

const expectedWeapons = [
    'great_sword', 'long_sword', 'sword_shield', 'dual_blades', 'hammer', 'hunting_horn', 'lance',
    'gunlance', 'switch_axe', 'charge_blade', 'insect_glaive', 'light_bowgun', 'heavy_bowgun', 'bow'
];

const interruptedStates = {
    great_sword: { set: { greatSwordCharge: 3, greatSwordChain: 2, greatSwordChargeLocked: true }, cleared: ['greatSwordCharge', 'greatSwordChain', 'greatSwordChargeLocked'] },
    long_sword: { set: { specialSheatheReady: true, spiritReleaseReady: true }, cleared: ['specialSheatheReady', 'spiritReleaseReady'] },
    sword_shield: { set: { snsChain: 3, perfectRushStep: 2, snsAerialReady: true }, cleared: ['snsChain', 'perfectRushStep', 'snsAerialReady'] },
    dual_blades: { set: { dualChain: 2, demonChain: 3, demonDanceStep: 2, archdemonStep: 1 }, cleared: ['dualChain', 'demonChain', 'demonDanceStep', 'archdemonStep'] },
    hammer: { set: { hammerChargeLevel: 3, hammerBigBangStep: 4, hammerOffsetWaiting: true }, cleared: ['hammerChargeLevel', 'hammerBigBangStep', 'hammerOffsetWaiting'] },
    hunting_horn: { set: { recitalActive: true, recitalPlayed: 2, recitalStartCount: 3 }, cleared: ['recitalActive', 'recitalPlayed', 'recitalStartCount'] },
    lance: { set: { lanceDashStep: 2, powerGuardWaiting: true, powerGuardReady: true, powerGuardCharge: 3 }, cleared: ['lanceDashStep', 'powerGuardWaiting', 'powerGuardReady', 'powerGuardCharge'] },
    gunlance: { set: { gunlanceStep: 5, shellStep: 2, wyvernFireCharging: true }, cleared: ['gunlanceStep', 'shellStep', 'wyvernFireCharging'] },
    switch_axe: { set: { switchCounterWaiting: true, switchCounterReady: true }, cleared: ['switchCounterWaiting', 'switchCounterReady'] },
    charge_blade: { set: { cbSwordStep: 3, cbAxeStep: 2, cbGuardWaiting: true, cbGuardReady: true }, cleared: ['cbSwordStep', 'cbAxeStep', 'cbGuardWaiting', 'cbGuardReady'] },
    insect_glaive: { set: { glaiveStep: 2, glaiveCharge: 2, airborne: true }, cleared: ['glaiveStep', 'glaiveCharge', 'airborne'] },
    light_bowgun: { set: {}, cleared: [] },
    heavy_bowgun: { set: { wyvernheartStep: 2, hbgCounterWaiting: true, hbgCounterReady: true }, cleared: ['wyvernheartStep', 'hbgCounterWaiting', 'hbgCounterReady'] },
    bow: { set: { bowCharge: 3, bowPowerStep: 2 }, cleared: ['bowCharge', 'bowPowerStep'] }
};
for (const [weaponId, contract] of Object.entries(interruptedStates)) {
    const hunter = { id: weaponId, hunterName: `HIT-${weaponId}`, lastActionId: `${weaponId}.internal_step` };
    mechanics.initialize(hunter);
    Object.assign(hunter, contract.set);
    mechanics.onHit(hunter);
    assert.strictEqual(hunter.lastActionId, null, `${weaponId} must not resume a linked action after being hit`);
    contract.cleared.forEach(key => assert.ok(!hunter[key], `${weaponId}.${key} must clear on interruption`));
}

const traces = {};
expectedWeapons.forEach(weaponId => {
    const actions = HuntWeaponMechanics.actionsFor(weaponId);
    assert.ok(actions && actions.length >= 4, `${weaponId} must own a canonical mechanic action set`);
    assert.strictEqual(new Set(actions.map(row => row.id)).size, actions.length, `${weaponId} action ids must be unique`);
    actions.forEach(row => assert.ok(row.mechanicEvidence, `${row.id} must retain mechanic evidence`));

    const hunter = { id: weaponId, hunterName: weaponId };
    mechanics.initialize(hunter);
    const trace = [];
    for (let turn = 0; turn < 80; turn++) {
        const context = { monsterDowned: turn % 7 === 6, monsterAtb: weaponId === 'lance' && turn % 4 === 3 ? 85 : 20 };
        const selected = selector.select(hunter, actions, context).action;
        assert.ok(selected, `${weaponId} must always find a legal autobattler action`);
        trace.push(selected.id);
        mechanics.applyAction(engine, hunter, selected);
        hunter.lastActionId = selected.id;
    }
    assert.ok(new Set(trace).size >= 3, `${weaponId} must express a rotation, not repeat one move name`);
    assert.ok(trace.some(id => Number(actions.find(row => row.id === id)?.dmg || 0) > 0), `${weaponId} must reach a damaging payoff`);
    traces[weaponId] = trace;
});

assert.ok(traces.great_sword.includes('great_sword.true_charged_slash'), 'Great Sword must build through to True Charged Slash');
assert.ok(traces.long_sword.includes('long_sword.spirit_roundslash'), 'Long Sword must finish a spirit combo to raise color');
assert.ok(traces.long_sword.includes('long_sword.spirit_slash_3'), 'Long Sword must not skip spirit slash III');
assert.ok(traces.sword_shield.includes('sword_shield.perfect_rush_finisher'), 'Sword and Shield must finish Perfect Rush timing chain');
assert.ok(traces.dual_blades.includes('dual_blades.blade_dance'), 'Dual Blades must cash stamina out into Blade Dance');
assert.ok(traces.hunting_horn.includes('hunting_horn.recital_strike'), 'Hunting Horn must assemble melody sheets before staged recital strikes');
assert.ok(traces.hammer.includes('hammer.big_bang_finisher'), 'Hammer must cash a downed opening out into the complete Big Bang finisher');
assert.ok(traces.lance.includes('lance.payback_thrust') || traces.lance.includes('lance.counter_thrust'), 'Lance must convert pressure stance into a counter payoff');
assert.ok(traces.gunlance.includes('gunlance.full_burst'), 'Gunlance must route slam into shell-consuming Full Burst');
assert.ok(traces.charge_blade.includes('charge_blade.charge_shield'), 'Charge Blade must load phials before charging its shield');
assert.ok(traces.charge_blade.includes('charge_blade.sword_return_stroke'), 'Charge Blade must build sword energy through a real sword combo');
assert.ok(traces.charge_blade.includes('charge_blade.savage_axe'), 'unified shield charge must also unlock Power Axe multihits');
assert.ok(traces.charge_blade.includes('charge_blade.saed'), 'Charge Blade must unlock SAED only after its resource build');
assert.ok(traces.insect_glaive.includes('insect_glaive.descending_thrust'), 'Insect Glaive must gather three extracts before its aerial finisher');
assert.ok(traces.insect_glaive.includes('insect_glaive.strong_descending_slash'), 'Wilds Insect Glaive must charge and release Strong Descending Slash');
assert.ok(traces.insect_glaive.includes('insect_glaive.rising_spiral_slash'), 'Strong Descending Slash must cash triple extract out into Rising Spiral Slash');
const glaiveActions = HuntWeaponMechanics.actionsFor('insect_glaive');
assert.deepStrictEqual(
    glaiveActions.map(row => row.durationTicks),
    [14, 14, 14, 18, 24, 30, 10, 10, 34, 38, 30],
    'Insect Glaive occupancy must scale from extract commands through aerial finishers'
);
assert.deepStrictEqual(
    glaiveActions.filter(row => row.id.startsWith('insect_glaive.descending_charge_')).map(row => row.durationTicks),
    [10, 10],
    'Strong Descending Slash charge beats must each own a full readable second'
);
assert.ok(
    HuntAtbConfig.actionCostGauge(glaiveActions.find(row => row.id === 'insect_glaive.rising_spiral_slash'))
        > HuntAtbConfig.actionCostGauge(glaiveActions.find(row => row.id === 'insect_glaive.rising_slash')),
    'the aerial finisher must spend substantially more ATB than the combo opener'
);
assert.ok(traces.light_bowgun.includes('light_bowgun.reload'), 'Light Bowgun magazine must cause an explicit reload');
assert.ok(traces.light_bowgun.includes('light_bowgun.chaser'), 'Light Bowgun Chaser Shot must accelerate Rapid Fire gauge recovery');
assert.ok(traces.light_bowgun.includes('light_bowgun.enter_rapid'), 'Light Bowgun must explicitly enter Wilds Rapid Fire Mode');
assert.ok(traces.light_bowgun.includes('light_bowgun.rapid_burst'), 'Rapid Fire Mode must spend its gauge on a readable burst');
assert.ok(traces.light_bowgun.includes('light_bowgun.wyvernblast_detonate'), 'a downed opening must allow Wyvernblast placement and detonation');
assert.ok(traces.heavy_bowgun.includes('heavy_bowgun.enter_ignition'), 'Heavy Bowgun must explicitly enter Wilds Ignition Mode');
assert.ok(traces.heavy_bowgun.includes('heavy_bowgun.wyvernheart_3'), 'Heavy Bowgun Wyvernheart must ramp through to maximum output');
assert.ok(traces.bow.includes('bow.power_volley'), 'Bow must preserve charge into its power-shot chain');
assert.ok(traces.bow.includes('bow.tracer_arrow'), 'Bow must spend Trick Arrow gauge on a Tracer Arrow setup');

console.log('[test] All 14 weapon mechanic state machines passed.');
