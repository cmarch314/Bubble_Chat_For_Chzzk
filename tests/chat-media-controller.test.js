const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const createdVideos = [];
const emitted = [];
const scheduled = [];
const windowObject = { _activeVideoCount: 0 };
const documentObject = {
    createElement(tag) {
        assert.strictEqual(tag, 'video');
        const listeners = {};
        const video = {
            style: {},
            listeners,
            pause() {},
            removeAttribute() {},
            load() {},
            play: () => Promise.resolve(),
            addEventListener(name, callback) { listeners[name] = callback; }
        };
        createdVideos.push(video);
        return video;
    }
};
const controllerPath = path.resolve(__dirname, '../js/chat/ChatMediaBubbleController.js');
const rendererPath = path.resolve(__dirname, '../js/ChatRenderer.js');
const context = vm.createContext({
    console,
    window: windowObject,
    document: documentObject,
    encodeURIComponent,
    mapIndexSpaceRemovedToOriginal: index => index
});
vm.runInContext(
    `${fs.readFileSync(controllerPath, 'utf8')}\nglobalThis.ChatMediaBubbleController = ChatMediaBubbleController;`,
    context,
    { filename: controllerPath }
);

const owner = {
    boxPos: 20,
    audioManager: {
        getSFXSequence: () => [],
        connectMediaElement(video, type) { this.connected = [video, type]; },
        applyNativeVolume(video, options) { this.applied = [video, options]; }
    },
    eventBus: { emit: event => emitted.push(event) },
    timers: {
        timeout(callback, delay) {
            scheduled.push({ callback, delay });
            return scheduled.length;
        },
        clear() {}
    }
};
const controller = new context.ChatMediaBubbleController(owner);
const elements = {
    chatBox: { style: {}, classList: { remove() {} }, parentElement: {} },
    chatLine: { style: {} },
    chatLineInner: { style: {} },
    messageEle: { style: {}, appendChild(node) { this.child = node; } }
};
const result = controller.mount('#테스트', elements, [
    { type: 'video', name: '테스트', startIndex: 0, length: 4 }
]);

assert.strictEqual(result.timeout, null);
assert.strictEqual(windowObject._activeVideoCount, 1);
assert.strictEqual(createdVideos.length, 1);
assert.strictEqual(elements.messageEle.child, createdVideos[0]);
assert.strictEqual(createdVideos[0].src, `AI CMC/${encodeURIComponent('테스트')}.mp4`);
assert.deepStrictEqual(owner.audioManager.connected, [createdVideos[0], 'visual']);
assert.strictEqual(scheduled[0].delay, 30000);

const rendererSource = fs.readFileSync(rendererPath, 'utf8');
const controllerSource = fs.readFileSync(controllerPath, 'utf8');
assert.match(rendererSource, /this\.mediaBubbleController\.mount/);
assert.doesNotMatch(rendererSource, /document\.createElement\('video'\)|_activeVideoCount/);
assert.match(controllerSource, /video\.duration - 0\.5/);
assert.match(controllerSource, /unifiedQueue\.sort\(\(a, b\) => a\.startIndex - b\.startIndex\)/);

console.log('[test] Chat media bubble ownership and startup contract passed.');
require('./chat-special-bubble-command.test.js');
