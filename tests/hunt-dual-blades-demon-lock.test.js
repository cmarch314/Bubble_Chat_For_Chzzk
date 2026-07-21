const assert = require('assert');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');

const mechanics = new HuntWeaponMechanics(() => 0.5);
const selector = new HuntWeaponActionSelector(() => 0.5, mechanics);
const actions = HuntWeaponMechanics.actionsFor('dual_blades');
const hunter = { id: 'dual_blades', hunterName: 'DB', hp: 100, maxHp: 100 };
mechanics.initialize(hunter);
const engine = { addLog() {} };
mechanics.applyAction(engine, hunter, actions.find(action => action.id === 'dual_blades.enter_demon'));
hunter.demonStamina = 20;
const immediate = selector.select(hunter, actions, {}).action;
assert.notStrictEqual(immediate.id, 'dual_blades.exit_demon',
    'Demon Mode must not switch off on the action immediately following entry');
for (let tick = 0; tick < 60; tick++) mechanics.tick(hunter);
assert.strictEqual(hunter.demonModeMinTicks, 0);
const exhausted = selector.select(hunter, actions, {}).action;
assert.strictEqual(exhausted.id, 'dual_blades.exit_demon',
    'low stamina may exit Demon Mode after the six-second commitment');

console.log('[test] Dual Blades Demon Mode minimum commitment passed.');
