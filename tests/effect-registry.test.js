const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/EffectRegistry.js');
const context = vm.createContext({ console });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.EffectRegistry = EffectRegistry;`;
vm.runInContext(source, context, { filename: sourcePath });

const calls = [];
const instance = { execute: value => calls.push(value) };
const registry = new context.EffectRegistry();
registry.register('sample', 'sound', instance, { kind: 'game' });

assert.strictEqual(registry.entries.sample.key, 'sample');
assert.strictEqual(registry.entries.sample.soundKey, 'sound');
assert.strictEqual(registry.entries.sample.kind, 'game');
registry.entries.sample.execute('context');
assert.deepStrictEqual(calls, ['context']);
assert.throws(() => registry.register('sample', null, instance), /Duplicate effect key/);
assert.throws(() => registry.register('broken', null, {}), /must implement execute/);

console.log('[test] EffectRegistry descriptor contract passed.');
