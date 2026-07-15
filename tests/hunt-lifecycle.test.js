const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntLifecycle.js');
const context = vm.createContext({ console });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntLifecycle = HuntLifecycle;`;
vm.runInContext(source, context, { filename: sourcePath });

const lifecycle = new context.HuntLifecycle();
assert.strictEqual(lifecycle.state, 'idle');
assert.strictEqual(lifecycle.transition('fighting'), false);
assert.strictEqual(lifecycle.state, 'idle');

assert.strictEqual(lifecycle.transition('voting'), true);
assert.strictEqual(lifecycle.sessionId, 1);
assert.strictEqual(lifecycle.transition('fighting'), true);
assert.strictEqual(lifecycle.transition('voting'), false);
assert.strictEqual(lifecycle.state, 'fighting');
assert.strictEqual(lifecycle.transition('ended'), true);
assert.strictEqual(lifecycle.transition('voting'), true);
assert.strictEqual(lifecycle.sessionId, 2);

const snapshot = lifecycle.snapshot();
assert.deepStrictEqual({ ...snapshot }, { state: 'voting', sessionId: 2 });
assert.strictEqual(Object.isFrozen(snapshot), true);

console.log('[test] HuntLifecycle state transition contract passed.');
