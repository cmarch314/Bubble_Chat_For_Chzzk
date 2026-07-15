const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/EffectRegistry.js');
const context = vm.createContext({ console });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.EffectRegistry = EffectRegistry;`;
vm.runInContext(source, context, { filename: sourcePath });

(async () => {
    const calls = [];
    const instance = {
        beginExecution: () => calls.push('begin'),
        execute: async value => calls.push(value),
        endExecution: () => calls.push('end')
    };
    const registry = new context.EffectRegistry();
    registry.register('sample', 'sound', instance, { kind: 'game' });

    assert.strictEqual(registry.entries.sample.key, 'sample');
    assert.strictEqual(registry.entries.sample.soundKey, 'sound');
    assert.strictEqual(registry.entries.sample.kind, 'game');
    await registry.entries.sample.execute('context');
    assert.deepStrictEqual(calls, ['begin', 'context', 'end']);
    assert.throws(() => registry.register('sample', null, instance), /Duplicate effect key/);
    assert.throws(() => registry.register('broken', null, {}), /must implement execute/);

    console.log('[test] EffectRegistry descriptor contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
