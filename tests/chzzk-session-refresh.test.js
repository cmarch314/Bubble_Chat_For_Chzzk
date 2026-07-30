const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/ChzzkGateway.js');
const companionEndpointPath = path.resolve(__dirname, '../js/runtime/LocalCompanionEndpoint.js');
const context = vm.createContext({
    console,
    WebSocket: class { static OPEN = 1; },
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
    document: { getElementById: () => null },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }
});
vm.runInContext(
    `${fs.readFileSync(companionEndpointPath, 'utf8')}\n${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.ChzzkGateway = ChzzkGateway;`,
    context,
    { filename: sourcePath }
);

(async () => {
    let now = 1000;
    const gateway = new context.ChzzkGateway(
        { channelId: 'channel', log() {} },
        null,
        null,
        { now: () => now }
    );

    gateway.ws = { readyState: 1 };
    gateway.activeChatChannelId = 'old-session';
    gateway.lastPacketAt = now;

    const restartReasons = [];
    gateway._restartSession = reason => restartReasons.push(reason);
    gateway._fetchLiveStatus = async () => ({
        code: 200,
        content: { chatChannelId: 'new-session' }
    });

    await gateway._checkLiveSession();
    assert.deepStrictEqual(restartReasons, ['live-session-changed']);
    assert.strictEqual(gateway.sessionCheckInFlight, false);

    restartReasons.length = 0;
    gateway.activeChatChannelId = 'new-session';
    now += gateway.staleConnectionMs + 1;
    await gateway._checkLiveSession();
    assert.deepStrictEqual(restartReasons, ['stale-transport']);

    console.log('[test] ChzzkGateway live-session refresh contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
