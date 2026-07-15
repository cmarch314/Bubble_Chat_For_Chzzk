const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/MessageQueue.js');
const context = vm.createContext({ console, Date });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.MessageQueue = MessageQueue;`;
vm.runInContext(source, context, { filename: sourcePath });

const emitted = [];
const scheduled = [];
const eventBus = { emit: (event, data) => emitted.push([event, data]) };
const queue = new context.MessageQueue(eventBus, null, {
    schedule: (callback, delay) => scheduled.push({ callback, delay })
});

queue.enqueue({ message: 'first' });
queue.enqueue({ message: 'second' });
queue.enqueue({ isSubscription: true });

while (scheduled.length) scheduled.shift().callback();

assert.deepStrictEqual(emitted.map(item => item[1].message), ['first', 'second', undefined]);
assert.strictEqual(queue.isProcessing, false);
assert.strictEqual(queue.queue.length, 0);

console.log('[test] MessageQueue ordering and empty-message contract passed.');
