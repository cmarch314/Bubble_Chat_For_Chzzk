'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const index = read('index.html');
const {
    FEATURE_RUNTIME_MANIFEST
} = require('../js/runtime/FeatureRuntimeLoader.js');

async function main() {
    const featureScripts = Object.values(FEATURE_RUNTIME_MANIFEST)
        .flatMap(feature => feature.scripts);
    assert.strictEqual(new Set(featureScripts).size, featureScripts.length,
        'each optional feature script must have one manifest owner');
    featureScripts.forEach(relative => {
        assert.ok(fs.existsSync(path.join(root, relative)), `missing feature runtime: ${relative}`);
        assert.ok(!index.includes(relative), `${relative} must not parse in the idle OBS shell`);
    });
    assert.match(index, /FeatureRuntimeLoader\.js[\s\S]*LazyFeatureEffect\.js/);

    const browserContext = vm.createContext({
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        URL,
        structuredClone
    });
    browserContext.window = browserContext;
    [
        'js/runtime/DisposableScope.js',
        'js/runtime/ManagedTimers.js',
        'js/runtime/GameEffectRuntime.js',
        'js/runtime/SafeContent.js',
        'js/effects/EffectInterface.js',
        'js/runtime/FeatureRuntimeLoader.js',
        ...featureScripts
    ].forEach(relative => {
        vm.runInContext(read(relative), browserContext, { filename: relative });
    });
    Object.entries(browserContext.FEATURE_RUNTIME_MANIFEST).forEach(([key, feature]) => {
        assert.strictEqual(typeof feature.resolve(), 'function',
            `${key} must resolve after classic scripts execute in manifest order`);
    });

    global.BaseEffect = class {
        constructor(director) {
            this.director = director;
        }
        dispose() {}
    };
    global.FeatureRuntimeLoader = {};
    delete require.cache[require.resolve('../js/effects/LazyFeatureEffect.js')];
    const LazyFeatureEffect = require('../js/effects/LazyFeatureEffect.js');
    const queuedMessages = [];
    let releaseLoad;
    class FakeGame {
        constructor(director) {
            this.director = director;
        }
        beginExecution() {}
        endExecution() {}
        execute() {
            this.director.activeGame = this;
            return Promise.resolve();
        }
        handleChat(message) {
            queuedMessages.push(message);
            return true;
        }
        dispose() {}
    }
    const director = {
        activeGame: null,
        config: {},
        eventBus: {},
        audioManager: {},
        ensured: [],
        _ensureEffectOverlays(key) {
            this.ensured.push(key);
        }
    };
    const lazy = new LazyFeatureEffect(director, 'racing', {
        captureChat: true,
        loader: {
            load: () => new Promise(resolve => {
                releaseLoad = () => resolve(FakeGame);
            })
        }
    });
    const execution = lazy.execute({ message: '!경마' });
    assert.strictEqual(director.activeGame, lazy);
    assert.strictEqual(lazy.handleChat({ message: '1', nickname: 'viewer' }), true);
    releaseLoad();
    await execution;
    assert.deepStrictEqual(queuedMessages, [{ message: '1', nickname: 'viewer' }]);
    assert.deepStrictEqual(director.ensured, ['racing']);

    assert.match(read('js/VisualDirector.js'), /options\.initializeOverlays === true/,
        'optional overlay DOM must not be cloned during normal startup');
    assert.match(read('js/AssetPreloader.js'), /effect\.preload !== true/,
        'rare feature media must not be preloaded without an explicit policy');

    delete global.BaseEffect;
    delete global.FeatureRuntimeLoader;
    console.log(`[test] ${Object.keys(FEATURE_RUNTIME_MANIFEST).length} optional feature runtimes lazy-load safely.`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
