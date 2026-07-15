const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let nextId = 1;
const timeouts = new Map();
const intervals = new Map();
const api = {
    setTimeout(callback) {
        const id = nextId++;
        timeouts.set(id, callback);
        return id;
    },
    clearTimeout(id) { timeouts.delete(id); },
    setInterval(callback) {
        const id = nextId++;
        intervals.set(id, callback);
        return id;
    },
    clearInterval(id) { intervals.delete(id); }
};

const sourcePath = path.resolve(__dirname, '../js/runtime/ManagedTimers.js');
const context = vm.createContext({ console });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.ManagedTimers = ManagedTimers;`;
vm.runInContext(source, context, { filename: sourcePath });

const managed = new context.ManagedTimers(api);
let timeoutRuns = 0;
const timeoutId = managed.timeout(() => timeoutRuns++, 100);
const intervalId = managed.interval(() => {}, 100);
assert.strictEqual(managed.activeCount, 2);

const timeoutCallback = timeouts.get(timeoutId);
timeouts.delete(timeoutId);
timeoutCallback();
assert.strictEqual(timeoutRuns, 1);
assert.strictEqual(managed.activeCount, 1);

managed.clear(intervalId);
assert.strictEqual(managed.activeCount, 0);

managed.timeout(() => {}, 100);
managed.interval(() => {}, 100);
managed.clearAll();
assert.strictEqual(managed.activeCount, 0);
assert.strictEqual(timeouts.size, 0);
assert.strictEqual(intervals.size, 0);

console.log('[test] ManagedTimers lifecycle contract passed.');
