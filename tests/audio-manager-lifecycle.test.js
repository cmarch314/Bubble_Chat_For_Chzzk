const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FakeAudioContext {
    constructor() {
        this.state = 'running';
        this.destination = {};
        this.currentTime = 0;
        this.closed = false;
        this.compressors = [];
    }

    createDynamicsCompressor() {
        const compressor = {
            threshold: {}, knee: {}, ratio: {}, attack: {}, release: {},
            target: null,
            connect(target) { this.target = target; }
        };
        this.compressors.push(compressor);
        return compressor;
    }

    createGain() {
        return {
            gain: { value: 0, setTargetAtTime() {} },
            target: null,
            connect(target) { this.target = target; },
            disconnect() {}
        };
    }

    close() {
        this.closed = true;
        return Promise.resolve();
    }
}

const context = vm.createContext({
    console,
    window: {
        AudioContext: FakeAudioContext,
        location: { protocol: 'file:' },
        HIVE_AUDIO_LEVELS: {
            'Video/test.mp4': { gainDb: -6 }
        }
    },
    document: { body: { contains: () => true } },
    Audio: class {},
    fetch,
    setTimeout,
    clearTimeout,
    requestIdleCallback: undefined,
    Promise,
    Map,
    Set
});

const scopePath = path.resolve(__dirname, '../js/runtime/DisposableScope.js');
const timersPath = path.resolve(__dirname, '../js/runtime/ManagedTimers.js');
const profilePath = path.resolve(__dirname, '../js/runtime/AudioLevelProfile.js');
const matcherPath = path.resolve(__dirname, '../js/audio/AudioCommandMatcher.js');
const mediaStagerPath = path.resolve(__dirname, '../js/audio/AudioMediaStager.js');
const playbackEnginePath = path.resolve(__dirname, '../js/audio/AudioPlaybackEngine.js');
const busPath = path.resolve(__dirname, '../js/EventBus.js');
const audioPath = path.resolve(__dirname, '../js/AudioManager.js');
const source = [scopePath, timersPath, profilePath, matcherPath, mediaStagerPath, playbackEnginePath, busPath, audioPath].map(file => fs.readFileSync(file, 'utf8')).join('\n')
    + '\nglobalThis.Exports = { AudioManager, EventBus };';
vm.runInContext(source, context, { filename: audioPath });

const normalizerConfig = { enabled: true, visual: true, sfx: true };
const config = {
    getVolumeConfig: () => ({ master: 1, visual: 1, sfx: 1 }),
    getSoundConfig: () => ({}),
    getVisualConfig: () => ({}),
    getSfxRenames: () => ({}),
    getExcludedSfx: () => [],
    getNormalizerConfig: () => normalizerConfig,
    updateVolumeConfig() {}
};
const bus = new context.Exports.EventBus();
const audio = new context.Exports.AudioManager(config, bus);
assert.strictEqual(audio.outputLimiter.threshold.value, -1);
assert.strictEqual(audio.outputLimiter.ratio.value, 20);
assert.strictEqual(audio.masterGain.target, audio.outputLimiter, 'master boost must feed the final peak limiter');
assert.strictEqual(audio.outputLimiter.target, audio.audioCtx.destination, 'no gain stage may bypass the final limiter');
const media = {
    src: 'file:///D:/BubbleChat/Video/test.mp4',
    paused: false,
    pause() { this.paused = true; }
};
audio.connectMediaElement(media, 'visual');
assert.ok(Math.abs(media.volume - 0.501187) < 0.0001, 'native file media must receive measured gain');
audio.updateConfig('visual');
assert.strictEqual(media.volume, 1, 'normalizer changes must update active native media immediately');

audio.setEnabled(false);
bus.emit('system:unmuteAudio');
assert.strictEqual(audio.enabled, true);

audio.setEnabled(false);
audio.dispose();
audio.dispose();
bus.emit('system:unmuteAudio');

assert.strictEqual(audio.enabled, false, 'disposed manager must not receive system events');
assert.strictEqual(media.paused, true);
assert.strictEqual(audio.audioCtx.closed, true);
assert.strictEqual(audio.scope.disposed, true);

console.log('[test] AudioManager disposal contract passed.');
