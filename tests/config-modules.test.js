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
assert.ok(Object.keys(window.HIVE_SOUND_CONFIG).length > 700, 'sound catalog must remain complete');
assert.ok(Object.keys(window.HIVE_VISUAL_CONFIG).length >= 15, 'visual config must remain complete');
assert.strictEqual(window.HIVE_CMC_FILES.length, 78, 'chat video catalog must remain complete');
assert.strictEqual(window.HIVE_SOUND_CONFIG['재장전'].src, 'MonsterHunter_Hunters/mh_guard.mp3');
assert.strictEqual(window.HIVE_SOUND_CONFIG['회피'].src, 'MonsterHunter_Hunters/mh_guard.mp3');

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
