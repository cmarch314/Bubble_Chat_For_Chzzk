'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = file => fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
const properties = {};
const context = vm.createContext({
    console, window: {},
    document: { getElementById: () => ({ style: { setProperty: (key, value) => { properties[key] = value; } } }) },
    DisposableScope: class { add() {} },
    ManagedTimers: class {},
    ChatMediaBubbleController: class {}
});
vm.runInContext(`${source('js/ChatRenderer.js')}\nglobalThis.Renderer = ChatRenderer;`, context);
const Renderer = context.Renderer;
const bubble = () => ({
    dataset: {}, style: {}, parentElement: {},
    remove() { this.parentElement = null; }
});

for (const columns of [5, 6, 7, 8, 12]) {
    const renderer = new Renderer(null, null, { columns });
    assert.strictEqual(Number(properties['--chat-scale']), 5 / columns);
    const bubbles = Array.from({ length: columns }, bubble);
    bubbles.forEach((item, index) => {
        assert.strictEqual(renderer._claimBubbleSlots(item).start, index);
        assert.ok(Math.abs(parseFloat(item.style.left) - index * 100 / columns) < 1e-8);
        assert.ok(Math.abs(parseFloat(item.style.right) - (columns - index - 1) * 100 / columns) < 1e-8);
    });
    assert.ok(bubbles.every(item => item.parentElement), 'full capacity must retain every bubble');
    const replacement = bubble();
    let disposed = 0;
    renderer.bubbleDisposers.set(bubbles[0], () => { disposed++; });
    assert.strictEqual(renderer._claimBubbleSlots(replacement).start, 0);
    assert.strictEqual(bubbles[0].parentElement, null, 'overflow must evict oldest');
    assert.strictEqual(disposed, 1, 'eviction must dispose media before reusing its slot');
    bubbles[2].remove();
    renderer._releaseBubbleSlots(bubbles[2]);
    assert.strictEqual(renderer._claimBubbleSlots(bubble()).start, 2, 'reuse holes without evicting a live bubble');
    // Many rotations must not accumulate floating-point slot drift.
    for (let index = 0; index < 100; index++) renderer._claimBubbleSlots(bubble());
    assert.strictEqual(new Set(renderer.activeBubbles.map(item => item.dataset.chatSlotStart)).size, columns);
    assert.ok(renderer.activeBubbles.every(item => Number(item.dataset.chatSlotStart) < columns));
}
for (const columns of [undefined, null, NaN, Infinity, -1, 0, 4, 6.5, 13, 'oops']) {
    assert.strictEqual(new Renderer(null, null, { columns }).columns, 7, `invalid columns: ${columns}`);
}
assert.strictEqual(new Renderer(null, null, { columns: '8' }).columns, 8);

// Config survives loading/encapsulation and settings-page export.
vm.runInContext(`${source('config.js')}\n${source('js/ConfigManager.js')}\nglobalThis.Manager = ConfigManager;`, context);
assert.strictEqual(context.window.HIVE_CHAT_LAYOUT.columns, 6);
context.window.HIVE_CHAT_LAYOUT = { columns: 8 };
const manager = Object.create(context.Manager.prototype);
manager._loadAllConfigs();
assert.strictEqual(manager.getChatLayout().columns, 8);
assert.strictEqual(context.window.HIVE_CHAT_LAYOUT, undefined);
manager.getChatLayout().columns = 5;
assert.strictEqual(manager.getChatLayout().columns, 8, 'getters must not expose mutable layout config');
assert.strictEqual(new Renderer(null, null, manager.getChatLayout()).columns, 8);
assert.match(source('config.html'), /window\.HIVE_CHAT_LAYOUT = \$\{JSON\.stringify\(window\.HIVE_CHAT_LAYOUT/);
assert.match(source('js/BubbleChatApp.js'), /new Types\.ChatRenderer\(this\.eventBus, this\.audio, this\.config\.getChatLayout\?\.\(\)\)/);
assert.doesNotMatch(source('js/chat/ChatMediaBubbleController.js'), /boxPos|style\.left/,
    'media cannot allocate its own slots');
console.log('[test] Chat density, slot rotation and config propagation passed.');
