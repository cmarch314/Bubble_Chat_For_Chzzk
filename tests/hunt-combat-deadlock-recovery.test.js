const assert = require('assert');
const Executor = require('../js/effects/hunt/HuntBattleTickExecutor.js');

const calls = [];
const engine = {
    actionStateMachine: { cancel: (hunter) => calls.push(['cancel', hunter.index]) },
    updateWeaponAtbUI: (index, atb) => calls.push(['atb', index, atb]),
    updateMonsterAtbUI: atb => calls.push(['monster-atb', atb]),
    addLog: text => calls.push(['log', text]),
    selectedMonster: { id: 'rathalos' },
    pendingMonsterAction: { pattern: {} },
    monsterAtb: 100
};
const hunter = {
    index: 1, id: 'great_sword', hunterName: 'test', atb: 100,
    attackDuration: 12, currentAction: { id: 'broken' }, actionState: 'windup',
    isGathering: true, pendingSharpnessRestore: true
};

Executor.recoverHunterTurn(engine, hunter, new Error('bad action'));
assert.strictEqual(hunter.atb, 0);
assert.strictEqual(hunter.attackDuration, 0);
assert.strictEqual(hunter.currentAction, null);
assert.strictEqual(hunter.isGathering, false);
assert(calls.some(call => call[0] === 'cancel'), 'stuck action lock must be cancelled');

Executor.recoverMonsterTurn(engine, new Error('bad pattern'));
assert.strictEqual(engine.pendingMonsterAction, null);
assert.strictEqual(engine.monsterAtb, 0);

console.log('[test] Hunt combat deadlock recovery passed.');
