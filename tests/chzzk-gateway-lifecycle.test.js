const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sockets = [];
const dispatchedEvents = [];

class FakeWebSocket {
    static OPEN = 1;

    constructor(url) {
        this.url = url;
        this.readyState = 0;
        this.sent = [];
        sockets.push(this);
    }

    send(payload) {
        this.sent.push(JSON.parse(payload));
    }

    open() {
        this.readyState = FakeWebSocket.OPEN;
        this.onopen?.();
    }

    receive(packet) {
        this.onmessage?.({ data: JSON.stringify(packet) });
    }

    close() {
        this.readyState = 3;
        this.onclose?.();
    }
}

let nextTimer = 1;
const timeouts = new Map();
const intervals = new Map();
const timers = {
    setTimeout: (handler, delay) => {
        const id = nextTimer++;
        timeouts.set(id, { handler, delay });
        return id;
    },
    clearTimeout: id => timeouts.delete(id),
    setInterval: (handler, delay) => {
        const id = nextTimer++;
        intervals.set(id, { handler, delay });
        return id;
    },
    clearInterval: id => intervals.delete(id),
    now: () => 1000,
    random: () => 0,
    sessionCheckIntervalMs: 30000,
    authTimeoutMs: 8000
};

const sourcePath = path.resolve(__dirname, '../js/ChzzkGateway.js');
const context = vm.createContext({
    console,
    WebSocket: FakeWebSocket,
    window: { dispatchEvent: event => dispatchedEvents.push(event.type) },
    CustomEvent: class { constructor(type) { this.type = type; } },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch,
    AbortController,
    Date,
    Promise,
    document: { getElementById: () => null },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }
});
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.ChzzkGateway = ChzzkGateway;`;
vm.runInContext(source, context, { filename: sourcePath });

const states = [];
const eventBus = {
    emit(event, data) {
        if (event === 'network:state') states.push(data.state);
    }
};
const config = {
    channelId: 'channel',
    log() {},
    debugMode: false,
    loadHistory: false
};
const gateway = new context.ChzzkGateway(config, eventBus, null, timers);

gateway._connectSocket('chat-1', 'token-1');
const first = sockets[0];
first.open();
assert.strictEqual(gateway.ws, null, 'transport open must not be treated as authenticated');
assert.strictEqual(gateway.pendingSocket, first);
assert.strictEqual(timeouts.size, 1, 'authentication timeout must be armed');
assert.strictEqual(first.sent[0].cmd, 100);
assert.strictEqual(dispatchedEvents.length, 0);

first.receive({ cmd: 10100, bdy: { sid: 'session-1' } });
assert.strictEqual(gateway.ws, first);
assert.strictEqual(gateway.pendingSocket, null);
assert.strictEqual(timeouts.size, 0, 'authentication timeout must clear on ready');
assert.strictEqual(intervals.size, 2, 'ready socket owns heartbeat and session monitoring');
assert.deepStrictEqual(dispatchedEvents, ['chzzk_connected']);
assert.strictEqual(gateway.state, 'ready');

gateway._connectSocket('chat-2', 'token-2');
const second = sockets[1];
second.open();
assert.strictEqual(gateway.ws, first, 'old chat stays active during handover');
assert.strictEqual(gateway.pendingSocket, second);

second.receive({ cmd: 10100, bdy: { sid: 'session-2' } });
assert.strictEqual(gateway.ws, second, 'new chat replaces old chat only after authentication');
assert.strictEqual(first.readyState, 3);
assert.strictEqual(intervals.size, 2, 'replacement must replace heartbeat and session timers');

second.close();
assert.strictEqual(intervals.size, 0);
assert.strictEqual(timeouts.size, 1, 'current socket close schedules one reconnect');

gateway.disconnect();
assert.strictEqual(timeouts.size, 0);
assert.strictEqual(intervals.size, 0);
assert.strictEqual(gateway.state, 'stopped');
assert.ok(states.includes('authenticating'));
assert.ok(states.includes('ready'));

console.log('[test] ChzzkGateway authenticated handover lifecycle contract passed.');
