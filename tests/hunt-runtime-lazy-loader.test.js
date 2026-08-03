'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const {
    HuntRuntimeLoader,
    HUNT_RUNTIME_SCRIPT_PATHS,
    HUNT_RUNTIME_STYLE_PATH,
    HUNT_ACTION_AUDIO_RUNTIME_PATH,
    HUNT_AUDIO_RUNTIME_PATH
} = require('../js/effects/hunt/HuntRuntimeLoader.js');

async function main() {
    assert.match(index, /HuntRuntimeLoader\.js[\s\S]*LazyHuntEffect\.js/);
    assert.doesNotMatch(index, /local_assets\/monster_hunter\/runtime-catalog\.js/,
        'the private audio catalog must not parse in the idle OBS shell');
    assert.doesNotMatch(index, /js\/effects\/HuntEffect\.js/,
        'the hunt coordinator must load only after a hunt command');
    assert.strictEqual(new Set(HUNT_RUNTIME_SCRIPT_PATHS).size, HUNT_RUNTIME_SCRIPT_PATHS.length,
        'lazy hunt scripts must be unique');
    assert.match(HUNT_RUNTIME_SCRIPT_PATHS[0], /runtime-action-routes\.js/);
    assert.strictEqual(HUNT_RUNTIME_SCRIPT_PATHS[0], HUNT_ACTION_AUDIO_RUNTIME_PATH);
    const monsterAudioScripts = HUNT_RUNTIME_SCRIPT_PATHS.filter(src =>
        /WorldMonster(?:Roar|AudioReview)Routes|HuntAudioCatalog/.test(src));
    assert.strictEqual(monsterAudioScripts.length, 3,
        'monster audio runtime must load roar evidence, reviewed routes, and the catalog');
    assert.ok(monsterAudioScripts.every(src => src.endsWith('?v=20260803a')),
        'all monster audio route layers must share one cache revision so OBS cannot mix stale mappings');
    assert.ok(!HUNT_RUNTIME_SCRIPT_PATHS.includes(HUNT_AUDIO_RUNTIME_PATH),
        'the large voice catalog must load asynchronously after hunt UI registration');
    assert.strictEqual(HUNT_RUNTIME_SCRIPT_PATHS.at(-1), 'js/effects/HuntEffect.js');
    assert.ok(HUNT_RUNTIME_SCRIPT_PATHS.includes(
        'js/effects/hunt/data/ReleasedMonsterRuntimeIndex.generated.js'
    ), 'production hunts must load only the reviewed monster roster');
    [
        'js/effects/MonsterData.js',
        'WildsMonsterBehavior.generated.js',
        'RiseMonsterBehavior.generated.js',
        'WorldMonsterBehavior.generated.js',
        'WorldShellBehavior.generated.js',
        'MhxxMonsterBehavior.generated.js',
        'MhxxDbMonsterBehavior.generated.js',
        'PublishedMonsterBehavior.js',
        'HuntMonsterTaxonomy.js',
        'HuntMonsterRoarEvidence.js'
    ].forEach(source => {
        assert.ok(!HUNT_RUNTIME_SCRIPT_PATHS.some(path => path.includes(source)),
            `unreviewed monster inventory must stay out of OBS runtime: ${source}`);
    });
    assert.ok(fs.existsSync(path.join(root, HUNT_RUNTIME_STYLE_PATH.split('?', 1)[0])));
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'style.css'), 'utf8'), /\.game-hunt-card/);
    assert.match(fs.readFileSync(path.join(root, 'styles/hunt-runtime.css'), 'utf8'), /\.game-hunt-card/);
    HUNT_RUNTIME_SCRIPT_PATHS.forEach(src => {
        const clean = src.split('?', 1)[0];
        assert.ok(fs.existsSync(path.join(root, clean)), `lazy hunt runtime asset is missing: ${clean}`);
    });

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
        'js/effects/EffectInterface.js',
        ...HUNT_RUNTIME_SCRIPT_PATHS.map(src => src.split('?', 1)[0])
    ].forEach(relative => {
        vm.runInContext(
            fs.readFileSync(path.join(root, relative), 'utf8'),
            browserContext,
            { filename: relative }
        );
    });
    assert.strictEqual(typeof browserContext.HuntEffect, 'function',
        'the exact lazy-load order must register HuntEffect in a classic-script browser context');
    assert.strictEqual(browserContext.HUNT_RELEASED_MONSTER_DATA.length, 20,
        'the browser runtime roster must contain only reviewed monsters');

    const runtimeBytes = HUNT_RUNTIME_SCRIPT_PATHS.reduce(
        (sum, src) => sum + fs.statSync(path.join(root, src.split('?', 1)[0])).size,
        0
    );
    assert.ok(runtimeBytes < 12_000_000,
        `lazy hunt runtime must stay below 12 MB (received ${runtimeBytes})`);

    const startupSources = [...index.matchAll(/<script[^>]+src="([^"]+)"/g)]
        .map(match => match[1].replace(/^\.\//, '').split('?', 1)[0])
        .filter(src => fs.existsSync(path.join(root, src)));
    const startupBytes = startupSources.reduce(
        (sum, src) => sum + fs.statSync(path.join(root, src)).size,
        0
    );
    assert.ok(startupBytes < 500_000,
        `idle OBS JavaScript must stay below 500 KB after feature lazy-loading (received ${startupBytes})`);
    const startupStyles = [...index.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
        .map(match => match[1].replace(/^\.\//, '').split('?', 1)[0])
        .filter(src => fs.existsSync(path.join(root, src)));
    const startupStyleBytes = startupStyles.reduce(
        (sum, src) => sum + fs.statSync(path.join(root, src)).size,
        0
    );
    assert.ok(startupStyleBytes < 120_000,
        `idle OBS CSS must stay below 120 KB (received ${startupStyleBytes})`);

    const loadedScripts = [];
    const runtimeNodes = [];
    const fakeDocument = {
        head: {
            appendChild(node) {
                runtimeNodes.push(node);
                if (node.dataset.huntRuntimeSrc) loadedScripts.push(node.dataset.huntRuntimeSrc);
                if (node.dataset.huntRuntimeSrc === HUNT_ACTION_AUDIO_RUNTIME_PATH) {
                    global.window.HUNT_LOCAL_WEAPON_ACTION_ROUTES = {};
                }
                if (node.dataset.huntRuntimeSrc === HUNT_AUDIO_RUNTIME_PATH) {
                    global.window.HUNT_LOCAL_AUDIO_MANIFESTS = { wilds: { entries: [] } };
                }
                if (node.dataset.huntRuntimeSrc === 'js/effects/HuntEffect.js') {
                    global.window.HuntEffect = class {};
                }
                queueMicrotask(() => node._listeners.load());
            }
        },
        createElement() {
            const node = {
                dataset: {},
                _listeners: {},
                addEventListener(type, listener) {
                    this._listeners[type] = listener;
                },
                remove() {
                    const index = runtimeNodes.indexOf(this);
                    if (index >= 0) runtimeNodes.splice(index, 1);
                }
            };
            return node;
        },
        querySelectorAll(selector) {
            if (selector.startsWith('script')) {
                return runtimeNodes.filter(node => node.dataset.huntRuntimeSrc);
            }
            return runtimeNodes.filter(node => node.dataset.huntRuntimeStyle);
        }
    };

    global.window = {};
    HuntRuntimeLoader.loadPromise = null;
    const constructors = await Promise.all([
        HuntRuntimeLoader.load(fakeDocument),
        HuntRuntimeLoader.load(fakeDocument)
    ]);
    assert.strictEqual(constructors[0], constructors[1],
        'concurrent hunt starts must share one loader');
    assert.deepStrictEqual(loadedScripts, HUNT_RUNTIME_SCRIPT_PATHS,
        'hunt runtime scripts must execute once in dependency order');
    assert.strictEqual(await HuntRuntimeLoader.loadAudioCatalog(fakeDocument), true);
    assert.strictEqual(loadedScripts.at(-1), HUNT_AUDIO_RUNTIME_PATH,
        'the large voice catalog must be independently loadable after the hunt UI');
    HuntRuntimeLoader.releaseHeavyRuntime(fakeDocument);
    assert.strictEqual(global.window.HUNT_LOCAL_AUDIO_MANIFESTS, undefined);
    assert.strictEqual(global.window.HUNT_LOCAL_WEAPON_ACTION_ROUTES, undefined);
    assert.ok(!runtimeNodes.some(node => node.dataset.huntRuntimeStyle),
        'hunt-only CSS must leave the idle overlay after results');
    await HuntRuntimeLoader.load(fakeDocument);
    assert.deepStrictEqual(
        loadedScripts.slice(HUNT_RUNTIME_SCRIPT_PATHS.length),
        [HUNT_AUDIO_RUNTIME_PATH, HUNT_ACTION_AUDIO_RUNTIME_PATH],
        'the next hunt should reload only released audio data, not every hunt class'
    );
    const readyStyle = runtimeNodes.find(node => node.dataset.huntRuntimeStyle);
    readyStyle.remove();
    global.window.HUNT_LOCAL_WEAPON_ACTION_ROUTES = {};
    await HuntRuntimeLoader.load(fakeDocument);
    assert.ok(runtimeNodes.some(node => node.dataset.huntRuntimeStyle),
        'an already-loaded hunt runtime must restore CSS removed after the previous hunt');

    global.BaseEffect = class {
        constructor(director) {
            this.director = director;
        }
        dispose() {}
    };
    delete require.cache[require.resolve('../js/effects/hunt/LazyHuntEffect.js')];
    const LazyHuntEffect = require('../js/effects/hunt/LazyHuntEffect.js');
    let releaseLoad;
    let releaseHeavyCount = 0;
    let disposeCount = 0;
    const queuedMessages = [];
    class FakeHuntEffect {
        constructor(director) {
            this.director = director;
            this.isActive = false;
        }
        beginExecution() {}
        endExecution() {}
        execute() {
            this.isActive = true;
            this.director.activeGame = this;
            this.isActive = false;
            return Promise.resolve();
        }
        handleChat(message) {
            queuedMessages.push(message);
            return true;
        }
        forceStopGame() {}
        dispose() { disposeCount++; }
    }
    const lazyDirector = { activeGame: null, config: {}, eventBus: {}, audioManager: {} };
    const lazy = new LazyHuntEffect(lazyDirector, {
        load: () => new Promise(resolve => {
            releaseLoad = () => resolve(FakeHuntEffect);
        }),
        releaseHeavyRuntime: () => { releaseHeavyCount++; }
    });
    const execution = lazy.execute({ message: '!수렵' });
    assert.strictEqual(lazyDirector.activeGame, lazy,
        'the lazy proxy must own chat during runtime loading');
    assert.strictEqual(lazy.handleChat({ message: '!참가', nickname: 'viewer' }), true);
    releaseLoad();
    await execution;
    assert.deepStrictEqual(queuedMessages, [{ message: '!참가', nickname: 'viewer' }],
        'participation chat received during load must replay into the real hunt');

    assert.strictEqual(disposeCount, 1, 'a completed hunt must dispose its heavyweight instance');
    assert.strictEqual(releaseHeavyCount, 1, 'a completed hunt must release hunt-only runtime assets');
    assert.strictEqual(lazy.instance, null);

    delete global.window;
    delete global.BaseEffect;
    console.log(`[test] Hunt runtime lazy-load passed (${startupBytes} JS idle, ${runtimeBytes} hunt runtime bytes).`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
