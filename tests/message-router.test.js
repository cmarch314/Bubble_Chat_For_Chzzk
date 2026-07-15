const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const gameMatcherPath = path.resolve(__dirname, '../js/routing/GameCommandMatcher.js');
const matcherPath = path.resolve(__dirname, '../js/routing/VisualCommandMatcher.js');
const sourcePath = path.resolve(__dirname, '../js/MessageRouter.js');
const source = `${fs.readFileSync(gameMatcherPath, 'utf8')}\n${fs.readFileSync(matcherPath, 'utf8')}\n${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.MessageRouter = MessageRouter;`;
const context = vm.createContext({ console, performance: { now: () => 0 } });
vm.runInContext(source, context, { filename: sourcePath });
const MessageRouter = context.MessageRouter;

function message(overrides = {}) {
    return {
        message: 'hello',
        nickname: 'tester',
        emojis: {},
        color: '#fff',
        isStreamer: false,
        isDonation: false,
        isSubscription: false,
        ...overrides
    };
}

function fixture(overrides = {}) {
    const calls = [];
    const systemController = {
        handle: data => {
            calls.push(['system', data.message]);
            return false;
        }
    };
    const audioManager = {
        checkAndPlay: (...args) => calls.push(['audio', ...args])
    };
    const visualDirector = {
        activeGame: null,
        registry: {},
        enabled: true,
        alertsEnabled: true,
        trigger: (...args) => calls.push(['visual', ...args])
    };
    const eventBus = {
        emit: (...args) => calls.push(['event', ...args])
    };
    const config = { debugMode: false };

    Object.assign(systemController, overrides.systemController);
    Object.assign(audioManager, overrides.audioManager);
    Object.assign(visualDirector, overrides.visualDirector);
    Object.assign(config, overrides.config);

    return {
        calls,
        router: new MessageRouter(config, eventBus, systemController, audioManager, visualDirector)
    };
}

{
    const { calls, router } = fixture();
    router.route(message());
    assert.deepStrictEqual(calls.map(call => call[0]), ['system', 'audio', 'event']);
    assert.strictEqual(calls[2][1], 'chat:render');
}

{
    const { calls, router } = fixture();
    router.route(message({ isStreamer: true, message: '!수렵 3' }));
    assert.deepStrictEqual(calls.map(call => call[0]), ['system', 'visual']);
    assert.strictEqual(calls[1][1], 'hunt');
}

{
    const { calls, router } = fixture();
    router.route(message({ message: '!수렵 3' }));
    assert.deepStrictEqual(calls.map(call => call[0]), ['system', 'audio', 'event']);
}

{
    const { calls, router } = fixture({
        visualDirector: {
            registry: { bangjong: { soundKey: 'restricted' } }
        }
    });
    router.route(message({ message: '!restricted' }));
    assert.deepStrictEqual(calls.map(call => call[0]), ['system', 'audio', 'event']);
}

{
    const { calls, router } = fixture({
        visualDirector: {
            registry: { bangjong: { soundKey: 'restricted' } }
        }
    });
    router.route(message({ isStreamer: true, message: '!restricted' }));
    assert.deepStrictEqual(calls.map(call => call[0]), ['system', 'visual']);
}

{
    const { calls, router } = fixture({
        systemController: { handle: () => true }
    });
    router.route(message({ isStreamer: true, message: '!control' }));
    assert.deepStrictEqual(calls, []);
}

{
    const { calls, router } = fixture({
        visualDirector: { activeGame: { handleChat: () => true } }
    });
    router.route(message({ message: '!join' }));
    assert.deepStrictEqual(calls.map(call => call[0]), ['system']);
}

{
    const { calls, router } = fixture();
    router.route(message({ isDonation: true, message: 'donation text' }));
    assert.deepStrictEqual(calls.map(call => call[0]), ['system', 'audio']);
}

{
    const { calls, router } = fixture({
        visualDirector: {
            registry: { sample: { soundKey: 'effect' } }
        }
    });
    router.route(message({ message: '!effect hello' }));
    assert.deepStrictEqual(calls.map(call => call[0]), ['system', 'visual']);
    assert.strictEqual(calls[1][1], 'sample');
}

console.log('[test] MessageRouter behavior contract passed.');
