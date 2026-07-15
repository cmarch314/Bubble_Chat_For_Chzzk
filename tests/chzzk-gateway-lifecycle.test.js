const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sockets = [];
class FakeWebSocket {
    static OPEN = 1;

    constructor(url) {
        this.url = url;
        this.readyState = 0;
        sockets.push(this);
    }

    send() {}

    close() {
        this.onclose?.();
    }
}

let nextTimer = 1;
const timeouts = new Set();
const intervals = new Set();
const timers = {
    setTimeout: () => {
        const id = nextTimer++;
        timeouts.add(id);
        return id;
    },
    clearTimeout: id => timeouts.delete(id),
    setInterval: () => {
        const id = nextTimer++;
        intervals.add(id);
        return id;
    },
    clearInterval: id => intervals.delete(id)
};

const sourcePath = path.resolve(__dirname, '../js/ChzzkGateway.js');
const context = vm.createContext({
    console,
    WebSocket: FakeWebSocket,
    window: { dispatchEvent() {} },
    CustomEvent: class {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch,
    AbortController,
    Date,
    Promise,
    document: { getElementById: () => null }
});
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.ChzzkGateway = ChzzkGateway;`;
vm.runInContext(source, context, { filename: sourcePath });

const config = {
    channelId: 'channel',
    log() {},
    debugMode: false,
    loadHistory: false
};
const gateway = new context.ChzzkGateway(config, null, null, timers);

gateway._connectSocket('chat-1', 'token-1');
assert.strictEqual(intervals.size, 1);
const first = sockets[0];

gateway._connectSocket('chat-2', 'token-2');
assert.strictEqual(intervals.size, 1, 'a replacement socket must replace the heartbeat');
const second = sockets[1];

first.onclose();
assert.strictEqual(timeouts.size, 0, 'a stale socket must not schedule reconnect');

second.onclose();
assert.strictEqual(intervals.size, 0);
assert.strictEqual(timeouts.size, 1, 'the current socket should schedule one reconnect');

gateway.disconnect();
assert.strictEqual(timeouts.size, 0);
assert.strictEqual(intervals.size, 0);

console.log('[test] ChzzkGateway connection lifecycle contract passed.');
