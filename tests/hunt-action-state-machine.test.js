const assert = require('assert');
const HuntActionStateMachine = require('../js/effects/hunt/HuntActionStateMachine.js');

const machine = new HuntActionStateMachine();
const hunter = { status: 'alive', actionState: 'idle', attackDuration: 0 };

machine.begin(hunter, {
    id: 'great_sword.true_charge_slash',
    name: '참모아베기',
    windupTicks: 3,
    activeTicks: 2,
    recoveryTicks: 4,
    durationTicks: 9
});
assert.strictEqual(hunter.actionState, 'windup');
assert.strictEqual(machine.canEvade(hunter), false, 'ordinary attacks must not roll during their animation');
assert.strictEqual(machine.canGuard(hunter), false, 'ordinary attacks must not guard during their animation');

for (let i = 0; i < 9; i++) machine.tick(hunter);
assert.strictEqual(hunter.actionState, 'idle');
assert.strictEqual(hunter.currentAction, null);
assert.strictEqual(machine.canEvade(hunter), true);

hunter.pendingSharpnessRestore = true;
hunter.itemDuration = 20;
assert.strictEqual(machine.canEvade(hunter), true, 'sharpening may be cancelled into an evade');
assert.strictEqual(machine.canGuard(hunter), false, 'sharpening must not guard an incoming attack');
hunter.pendingSharpnessRestore = false;
hunter.itemDuration = 0;
hunter.rollDuration = 6;
assert.strictEqual(machine.canEvade(hunter), false,
    'an active visible roll must not reroll defense against every combo hit');
hunter.rollDuration = 0;

machine.begin(hunter, {
    id: 'long_sword.foresight_slash',
    name: '간파베기',
    tags: ['counter', 'foresight'],
    durationTicks: 8
});
assert.strictEqual(machine.canCounter(hunter, 'foresight'), true);
assert.strictEqual(machine.canEvade(hunter), false);

machine.cancel(hunter, 'hitstun');
assert.strictEqual(hunter.currentAction, null);
assert.strictEqual(hunter.actionState, 'hitstun');

console.log('[test] Hunt action state machine contract passed.');
