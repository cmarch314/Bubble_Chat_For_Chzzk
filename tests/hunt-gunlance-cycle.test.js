'use strict';

const assert = require('assert');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');
const actions = HuntWeaponMechanics.actionsFor('gunlance');
const engine = { addLog() {}, updateOverheatUI() {} };

function run(type, randomValue, turns = 36, allowDown = false) {
    const mechanics = new HuntWeaponMechanics(() => randomValue);
    const selector = new HuntWeaponActionSelector(() => randomValue, mechanics);
    const hunter = { id: 'gunlance', shellingType: type, hunterName: type };
    mechanics.initialize(hunter);
    const trace = [];
    for (let turn = 0; turn < turns; turn++) {
        const selected = selector.select(hunter, actions, { monsterDowned: allowDown && turn % 9 === 8, monsterAtb: 20 }).action;
        assert.ok(selected, `${type} shelling must never dead-end`);
        trace.push(selected.id);
        mechanics.applyAction(engine, hunter, selected);
        hunter.lastActionId = selected.id;
    }
    return { hunter, trace };
}

const normal = run('normal', .8);
assert.ok(normal.trace.includes('gunlance.full_burst'));
assert.ok(normal.trace.includes('gunlance.wyrmstake_attach'));
assert.ok(normal.trace.includes('gunlance.wyrmstake_detonate'), 'attached Wyrmstake must detonate on a later ATB action');
assert.ok(normal.trace.includes('gunlance.quick_reload'), 'empty shells must feed back into slam through Quick Reload');

const wide = run('wide', 0);
assert.ok(wide.trace.includes('gunlance.shell_1') && wide.trace.includes('gunlance.shell_2'));
assert.ok(wide.trace.includes('gunlance.shell_wyrmstake'));

const mechanics = new HuntWeaponMechanics(() => .5);
const charged = { id: 'gunlance', shellingType: 'long', wyvernGauge: 100, wyvernFireCooldown: 0 };
mechanics.initialize(charged);
const selector = new HuntWeaponActionSelector(() => .5, mechanics);
let action = selector.select(charged, actions, { monsterDowned: true, monsterAtb: 0 }).action;
assert.strictEqual(action.id, 'gunlance.wyvern_fire_charge');
mechanics.applyAction(engine, charged, action);
action = selector.select(charged, actions, { monsterDowned: true, monsterAtb: 0 }).action;
assert.strictEqual(action.id, 'gunlance.wyvern_fire');
mechanics.applyAction(engine, charged, action);
assert.strictEqual(charged.wyvernGauge, 0);

console.log('[test] Gunlance shell types, Wyrmstake delay, reload loop, and Wyvern Fire passed.');
