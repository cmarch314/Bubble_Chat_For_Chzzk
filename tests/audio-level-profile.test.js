const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/runtime/AudioLevelProfile.js');
const context = vm.createContext({ Math, Number, decodeURIComponent });
vm.runInContext(
    `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.AudioLevelProfile = AudioLevelProfile;`,
    context,
    { filename: sourcePath }
);

const profile = new context.AudioLevelProfile({
    'SFX/quiet.mp3': { gainDb: 6 },
    'BGM/loud.mp3': { gainDb: -6 }
});

assert.ok(Math.abs(profile.gain('./SFX/quiet.mp3') - 1.995262) < 0.0001);
assert.ok(Math.abs(profile.gain('BGM/loud.mp3?v=1') - 0.501187) < 0.0001);
assert.ok(Math.abs(profile.gain('file:///D:/BubbleChat/SFX/quiet.mp3') - 1.995262) < 0.0001);
assert.strictEqual(profile.volume('SFX/quiet.mp3', 0.4).toFixed(3), '0.798');
assert.strictEqual(profile.volume('SFX/quiet.mp3', 0.8), 1, 'native volume must be capped');
assert.strictEqual(profile.gain('missing.mp3'), 1);

const generatedWindow = {};
vm.runInNewContext(
    fs.readFileSync(path.resolve(__dirname, '../js/audio-levels.generated.js'), 'utf8'),
    { window: generatedWindow }
);
const generated = generatedWindow.HIVE_AUDIO_LEVELS;
assert.strictEqual(Object.keys(generated).length, 1421, 'every runtime audio/video file needs a profile');
assert.strictEqual(generated['SFX/MonsterHunter_Hunters/mh_reload.mp3'].silent, true);
assert.strictEqual(generated['Video/GodGame.mp4'].measurement, 'silence');
assert.strictEqual(generated['SFX/Chzzk_Signatures/DDuk.mp3'].measurement, 'volume-fallback');
assert.strictEqual(generated['SFX/Chzzk_Signatures/샀어.mp3'].gainDb, 2.8);

console.log('[test] AudioLevelProfile measured-gain contract passed.');
