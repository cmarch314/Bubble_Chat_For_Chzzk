const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const files = [
    'config.js',
    'config/sound-catalog.js',
    'config/visual-config.js',
    'config/cmc-catalog.js'
];
const window = {};
const context = vm.createContext({ window });

for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

assert.strictEqual(window.HIVE_VOLUME_CONFIG.master, 1.5);
assert.strictEqual(window.HIVE_VOLUME_CONFIG.visual, 1);
assert.strictEqual(window.HIVE_VOLUME_CONFIG.sfx, 1);
assert.strictEqual(window.BUBBLECHAT_COMPANION_ORIGIN, '');
assert.ok(Object.keys(window.HIVE_SOUND_CONFIG).length > 700, 'sound catalog must remain complete');
assert.ok(Object.keys(window.HIVE_VISUAL_CONFIG).length >= 15, 'visual config must remain complete');
assert.strictEqual(window.HIVE_CMC_FILES.length, 371, 'chat video catalog must remain complete');
assert.deepStrictEqual(Array.from(window.HIVE_CMC_COMMAND_GROUPS['거짓말']), ['거짓말', '거짓말3']);
assert.deepStrictEqual(Array.from(window.HIVE_CMC_COMMAND_GROUPS['진짜?']), ['진짜(물음표)', '진짜(물음표)2']);
assert.deepStrictEqual(Array.from(window.HIVE_CMC_COMMAND_GROUPS['헐']), ['헐', '헐2']);
assert.deepStrictEqual(Array.from(window.HIVE_CMC_COMMAND_GROUPS['나루호도']), ['나루호도', '나루호도2']);
assert.deepStrictEqual(Array.from(window.HIVE_CMC_COMMAND_GROUPS['소나노']), ['소나노', '소나노2']);
assert.ok(window.HIVE_CMC_VOICE_COMMANDS.length >= 400, 'live CMC chat voice group must remain substantially complete');
assert.ok(window.HIVE_CMC_VOICE_COMMANDS.every(command => window.HIVE_SOUND_CONFIG[command]),
    'every CMC voice command must resolve through the live chat sound catalog');
assert.deepStrictEqual(Array.from(window.HIVE_CMC_STREAMER_NICKNAMES), ['최마치']);
assert.strictEqual(window.HIVE_SOUND_CONFIG['재장전'].src, 'MonsterHunter_Hunters/mh_guard.mp3');
assert.strictEqual(window.HIVE_SOUND_CONFIG['회피'].src, 'MonsterHunter_Hunters/mh_guard.mp3');
assert.strictEqual(window.HIVE_SOUND_CONFIG['겁쟁이 종합병원'].src, 'Add/겁쟁이 종합병원_짧.mp3');
assert.strictEqual(window.HIVE_SOUND_CONFIG['난 되던데'].src, 'Add/난 되던데_짧.mp3');
assert.strictEqual(window.HIVE_SOUND_CONFIG['쭈쭈박스'].src, 'Add/쭈쭈박스_짧.mp3');

const coreSource = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
assert.ok(!coreSource.includes('HIVE_SOUND_CONFIG'));
assert.ok(!coreSource.includes('HIVE_VISUAL_CONFIG'));
assert.ok(!coreSource.includes('HIVE_CMC_FILES'));

for (const htmlFile of ['index.html', 'config.html']) {
    const html = fs.readFileSync(path.join(root, htmlFile), 'utf8');
    const positions = files.map(file => html.indexOf(file));
    assert.ok(positions.every(position => position >= 0), `${htmlFile} must load every config module`);
    assert.deepStrictEqual([...positions].sort((a, b) => a - b), positions, `${htmlFile} config load order changed`);
}

console.log('config module tests passed');
