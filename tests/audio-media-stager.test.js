const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FakeAudio {
    constructor(src) {
        this.src = src;
        this.currentSrc = src;
        this.paused = false;
        this.ended = false;
        this.listeners = {};
    }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    pause() { this.paused = true; }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() { this.loaded = true; }
}

const windowObject = { location: { protocol: 'file:' } };
const context = vm.createContext({
    console,
    window: windowObject,
    document: { body: { contains: element => element.attached !== false } },
    Audio: FakeAudio
});
const sourcePath = path.resolve(__dirname, '../js/audio/AudioMediaStager.js');
vm.runInContext(
    `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.AudioMediaStager = AudioMediaStager;`,
    context,
    { filename: sourcePath }
);

const volume = { master: 0.8, visual: 0.5, sfx: 0.25 };
const configManager = {
    getNormalizerConfig: () => ({ enabled: true, visual: true, sfx: true })
};
const sourceNodes = [];
const gainNodes = [];
const audioContext = {
    createMediaElementSource(element) {
        const node = {
            element,
            disconnected: false,
            connect(target) { this.target = target; },
            disconnect() { this.disconnected = true; }
        };
        sourceNodes.push(node);
        return node;
    },
    createGain() {
        const node = {
            gain: { value: 0 },
            disconnected: false,
            connect(target) { this.target = target; },
            disconnect() { this.disconnected = true; }
        };
        gainNodes.push(node);
        return node;
    }
};
const compressor = {};
const stager = new context.AudioMediaStager({
    configManager,
    levelProfile: { gain: audioPath => audioPath.includes('quiet') ? 0.5 : 1 },
    getVolumeConfig: () => volume,
    audioContext,
    compressor
});

const localMedia = {
    src: 'file:///D:/BubbleChat/Video/quiet.mp4',
    ended: false,
    attached: true,
    pause() { this.paused = true; }
};
stager.connectMediaElement(localMedia, 'visual');
assert.strictEqual(localMedia.volume, 0.2);
assert.strictEqual(sourceNodes.length, 0, 'file media must never enter Web Audio');

volume.visual = 1;
stager.updateVolumes();
assert.strictEqual(localMedia.volume, 0.4);

const nativeAudio = stager.createNativeAudio('BGM/quiet.mp3', {
    type: 'visual', baseVolume: 0.5, loop: true
});
assert.strictEqual(nativeAudio.volume, 0.2);
assert.strictEqual(nativeAudio.loop, true);
assert.strictEqual(stager.nativeEntries.some(item => item.el === nativeAudio), true);

windowObject.location.protocol = 'https:';
const webMedia = {
    currentSrc: 'https://example.test/quiet.mp4',
    ended: false,
    attached: true
};
stager.connectMediaElement(webMedia, 'visual');
assert.strictEqual(sourceNodes.length, 1);
assert.strictEqual(gainNodes[0].gain.value, 0.5, 'master gain is applied later in the shared output graph');
assert.strictEqual(gainNodes[0].target, compressor);

volume.visual = 0.4;
stager.updateVolumes();
assert.strictEqual(gainNodes[0].gain.value, 0.2);

assert.strictEqual(stager.releaseMediaElement(webMedia), true);
assert.strictEqual(sourceNodes[0].disconnected, true);
assert.strictEqual(gainNodes[0].disconnected, true);
assert.strictEqual(stager.webAudioEntries.length, 0);

assert.strictEqual(stager.releaseMediaElement(nativeAudio, { pause: true, unload: true }), true);
assert.strictEqual(nativeAudio.paused, true);
assert.strictEqual(nativeAudio.src, '');
assert.strictEqual(stager.nativeEntries.some(item => item.el === nativeAudio), false);

stager.dispose();
assert.strictEqual(localMedia.paused, true);

console.log('[test] Audio media staging protocol and volume contract passed.');
