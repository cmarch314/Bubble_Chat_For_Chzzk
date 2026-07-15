const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const calls = [];
const listeners = new Map();
const scheduled = [];

class FakeEventBus {
    constructor() {
        this.handlers = new Map();
    }

    on(event, handler) {
        this.handlers.set(event, handler);
    }

    emit(event, data) {
        this.handlers.get(event)?.(data);
    }
}

function fakeType(name, methods = {}) {
    return class {
        constructor(...args) {
            calls.push(['construct', name, args.length]);
            Object.assign(this, methods);
        }
    };
}

const context = vm.createContext({
    console,
    document: {
        getElementById: () => null
    },
    window: {
        addEventListener: (event, handler) => listeners.set(event, handler),
        removeEventListener: event => listeners.delete(event)
    },
    setTimeout: (handler, delay) => {
        scheduled.push({ handler, delay });
        return scheduled.length;
    }
});

const scopePath = path.resolve(__dirname, '../js/runtime/DisposableScope.js');
const sourcePath = path.resolve(__dirname, '../js/BubbleChatApp.js');
const source = `${fs.readFileSync(scopePath, 'utf8')}\n${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.BubbleChatApp = BubbleChatApp;`;
vm.runInContext(source, context, { filename: sourcePath });

const constructors = {
    EventBus: FakeEventBus,
    ConfigManager: fakeType('config'),
    AudioManager: fakeType('audio', { dispose: () => calls.push(['audioDispose']) }),
    AssetPreloader: fakeType('preloader', { start: () => calls.push(['preload']) }),
    ChatRenderer: fakeType('chatRenderer'),
    VisualDirector: fakeType('visuals', {
        clearQueue: () => calls.push(['clearQueue']),
        trigger: (...args) => calls.push(['trigger', ...args]),
        dispose: () => calls.push(['visualDispose'])
    }),
    SystemController: fakeType('system'),
    DebugController: fakeType('debug'),
    MessageRouter: fakeType('router', { route: data => calls.push(['route', data]) }),
    MessageQueue: fakeType('queue', { enqueue: data => calls.push(['enqueue', data]) }),
    ChzzkGateway: fakeType('network', {
        connect: () => calls.push(['connect']),
        disconnect: () => calls.push(['disconnect'])
    })
};

const app = new context.BubbleChatApp(constructors);
assert.strictEqual(app.start(), app);
assert.strictEqual(app.start(), app, 'start must be idempotent');
assert.strictEqual(calls.filter(call => call[0] === 'connect').length, 1);
assert.ok(listeners.has('chzzk_connected'));

context.window.processMessage({ message: 'manual' });
assert.ok(calls.some(call => call[0] === 'enqueue' && call[1].message === 'manual'));

app.eventBus.emit('chat:received', { message: 'network' });
assert.ok(calls.some(call => call[0] === 'enqueue' && call[1].message === 'network'));

app.eventBus.emit('chat:process', { message: 'queued' });
assert.ok(calls.some(call => call[0] === 'route' && call[1].message === 'queued'));

listeners.get('chzzk_connected')();
assert.ok(calls.some(call => call[0] === 'clearQueue'));
assert.deepStrictEqual(scheduled.map(item => item.delay), [1000, 2000]);

app.stop();
app.stop();
assert.strictEqual(calls.filter(call => call[0] === 'disconnect').length, 1);
assert.strictEqual(calls.filter(call => call[0] === 'visualDispose').length, 1);
assert.strictEqual(calls.filter(call => call[0] === 'audioDispose').length, 1);
assert.strictEqual(context.window.processMessage, undefined);

console.log('[test] BubbleChatApp lifecycle contract passed.');
