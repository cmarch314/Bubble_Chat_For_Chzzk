const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');
const HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');

const mechanics = new HuntWeaponMechanics(() => 0.5);
const selector = new HuntWeaponActionSelector(() => 0.5, mechanics);
const actions = HuntWeaponMechanics.actionsFor('dual_blades');
const hunter = { id: 'dual_blades', hunterName: 'DB', hp: 100, maxHp: 100 };
mechanics.initialize(hunter);
const engine = { addLog() {} };
for (const id of ['dual_blades.double_slash', 'dual_blades.double_slash_return', 'dual_blades.circle_slash', 'dual_blades.double_slash']) {
    mechanics.applyAction(engine, hunter, actions.find(action => action.id === id));
}
assert.strictEqual(hunter.archdemonGauge, 100);
mechanics.applyAction(engine, hunter, actions.find(action => action.id === 'dual_blades.enter_demon'));
const immediate = selector.select(hunter, actions, {}).action;
assert.notStrictEqual(immediate.id, 'dual_blades.exit_demon',
    'a full red gauge must fund an attack immediately after Demon Mode entry');
hunter.archdemonGauge = 10;
const exhausted = selector.select(hunter, actions, {}).action;
assert.strictEqual(exhausted.id, 'dual_blades.exit_demon',
    'Demon Mode must exit when the red gauge cannot fund another Demon attack');

const atbHunter = { atb: 35 };
HuntHunterTurnExecutor.spendActionAtb(atbHunter, { durationTicks: 6 }, 35, true);
assert.strictEqual(atbHunter.atb, 23, 'Demon actions must spend their cost from the current partial ATB budget');
const tickSource = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
assert.match(tickSource, /atbConfig\.DEMON_MODE_ACTION_THRESHOLD/,
    'Demon Mode partial-action threshold must come from the shared ATB balance config');

console.log('[test] Dual Blades red-gauge and partial-ATB Demon Mode passed.');
