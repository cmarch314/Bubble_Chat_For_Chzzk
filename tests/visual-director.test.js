const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const scopePath = path.resolve(__dirname, '../js/runtime/DisposableScope.js');
const timersPath = path.resolve(__dirname, '../js/runtime/ManagedTimers.js');
const sourcePath = path.resolve(__dirname, '../js/VisualDirector.js');
const context = vm.createContext({ console, Promise, setTimeout, clearTimeout, setInterval, clearInterval });
const source = `${fs.readFileSync(scopePath, 'utf8')}\n${fs.readFileSync(timersPath, 'utf8')}\n${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.VisualDirector = VisualDirector;`;
vm.runInContext(source, context, { filename: sourcePath });

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

async function flush() {
    await new Promise(resolve => setImmediate(resolve));
}

(async () => {
    const calls = [];
    const active = deferred();
    const registry = {
        first: {
            key: 'first',
            soundKey: null,
            execute: () => {
                calls.push('first');
                return active.promise;
            }
        },
        second: {
            key: 'second',
            soundKey: null,
            execute: () => calls.push('second')
        }
    };
    const config = {
        getVisualConfig: () => ({ common: { cooldown: 0 } }),
        getSoundConfig: () => ({})
    };
    const director = new context.VisualDirector(config, null, null, {
        initializeOverlays: false,
        registry,
        wait: () => Promise.resolve()
    });

    assert.strictEqual(director.trigger('missing'), false);
    assert.strictEqual(director.trigger('first'), true);
    director.trigger('second');
    assert.deepStrictEqual(calls, ['first']);
    assert.strictEqual(director.isLocked, true);

    director.clearQueue();
    assert.strictEqual(director.isLocked, true, 'clearing pending work must not unlock an active effect');

    active.resolve();
    await flush();
    assert.deepStrictEqual(calls, ['first']);
    assert.strictEqual(director.activeEffect, null);
    assert.strictEqual(director.isLocked, false);

    console.log('[test] VisualDirector queue lifecycle contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
