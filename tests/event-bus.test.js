const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadClass(relativePath, className, globals = {}) {
    const sourcePath = path.resolve(__dirname, relativePath);
    const context = vm.createContext({ console, ...globals });
    const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.Exported = ${className};`;
    vm.runInContext(source, context, { filename: sourcePath });
    return context.Exported;
}

const EventBus = loadClass('../js/EventBus.js', 'EventBus');

{
    const bus = new EventBus();
    const values = [];
    const unsubscribe = bus.on('value', value => values.push(value));
    bus.emit('value', 1);
    unsubscribe();
    bus.emit('value', 2);
    assert.deepStrictEqual(values, [1]);
}

{
    const bus = new EventBus();
    let count = 0;
    bus.once('once', () => count++);
    bus.emit('once');
    bus.emit('once');
    assert.strictEqual(count, 1);
}

console.log('[test] EventBus lifecycle contract passed.');
