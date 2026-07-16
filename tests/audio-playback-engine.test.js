const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const enginePath = path.resolve(__dirname, '../js/audio/AudioPlaybackEngine.js');
const managerPath = path.resolve(__dirname, '../js/AudioManager.js');
const context = vm.createContext({ console, Math, Promise, fetch: () => Promise.reject(new Error('unexpected fetch')) });
vm.runInContext(
    `${fs.readFileSync(enginePath, 'utf8')}\nglobalThis.AudioPlaybackEngine = AudioPlaybackEngine;`,
    context,
    { filename: enginePath }
);

const manager = {
    disposed: false,
    enabled: true,
    audioCtx: { state: 'running' },
    configManager: null
};

const engineSource = fs.readFileSync(enginePath, 'utf8');
const managerSource = fs.readFileSync(managerPath, 'utf8');
assert.doesNotMatch(engineSource, /\bthis\./, 'playback engine must receive manager state explicitly');
assert.match(managerSource, /return AudioPlaybackEngine\.play\(this, input, options\)/);
assert.doesNotMatch(managerSource, /createBufferSource\(|decodeAudioData\(/);

(async () => {
    assert.strictEqual(await context.AudioPlaybackEngine.play(manager, 'not-an-audio-command'), undefined);
    manager.enabled = false;
    assert.strictEqual(await context.AudioPlaybackEngine.play(manager, 'SFX/test.mp3'), undefined);
    console.log('[test] Audio playback engine ownership contract passed.');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
