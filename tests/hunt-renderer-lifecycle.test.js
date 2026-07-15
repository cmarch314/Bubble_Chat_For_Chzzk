const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rendererPath = path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js');
const rendererSource = fs.readFileSync(rendererPath, 'utf8');
const context = vm.createContext({ console, window: {} });
vm.runInContext(`${rendererSource}\nglobalThis.HuntRenderer = HuntRenderer;`, context, {
    filename: rendererPath
});

let clearCount = 0;
const lobbyTimers = {
    clearAll() {
        clearCount++;
    }
};
const renderer = new context.HuntRenderer({ lobbyTimers });
renderer.lobbyTimer = 17;
renderer.lobbyTimeouts = [18, 19];
renderer.clearLobbyTimer();

assert.strictEqual(clearCount, 1);
assert.strictEqual(renderer.lobbyTimer, null);
assert.deepStrictEqual(Array.from(renderer.lobbyTimeouts), []);

let removed = null;
renderer.container = {
    parentNode: {
        removeChild(node) {
            removed = node;
        }
    }
};
renderer.card = {};
const oldContainer = renderer.container;
renderer.removeContainer();

assert.strictEqual(clearCount, 2);
assert.strictEqual(removed, oldContainer);
assert.strictEqual(renderer.container, null);
assert.strictEqual(renderer.card, null);

const effectPath = path.resolve(__dirname, '../js/effects/HuntEffect.js');
const effectSource = fs.readFileSync(effectPath, 'utf8');
assert.match(
    effectSource,
    /startFight\(container\)\s*\{\s*this\.renderer\.clearLobbyTimer\(\);/,
    'fight startup must stop the lobby timer loop before changing phases'
);
assert.doesNotMatch(
    effectSource,
    /clearTimeout\(|clearInterval\(/,
    'HuntEffect must release timers only through its ManagedTimers owner'
);

console.log('[test] HuntRenderer lobby timer lifecycle contract passed.');
