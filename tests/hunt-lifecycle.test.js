const assert = require('assert');
const HuntLifecycle = require('../js/effects/hunt/HuntLifecycle.js');

const lifecycle = new HuntLifecycle();
assert.strictEqual(lifecycle.state, 'idle');
assert.strictEqual(lifecycle.transition('fighting'), false);
assert.strictEqual(lifecycle.transition('quest_board'), true);
assert.strictEqual(lifecycle.sessionId, 1);
assert.strictEqual(lifecycle.transition('loadout'), true);
assert.strictEqual(lifecycle.transition('fighting'), true);
assert.strictEqual(lifecycle.transition('quest_board'), false);
assert.strictEqual(lifecycle.transition('results'), true);
assert.strictEqual(lifecycle.transition('quest_board'), true);
assert.strictEqual(lifecycle.sessionId, 2);
const snapshot = lifecycle.snapshot();
assert.deepStrictEqual({ ...snapshot }, { state: 'quest_board', sessionId: 2 });
assert.strictEqual(Object.isFrozen(snapshot), true);
console.log('[test] Hunt four-phase lifecycle contract passed.');
