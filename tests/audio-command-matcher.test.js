const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/audio/AudioCommandMatcher.js');
const context = vm.createContext({ console });
vm.runInContext(
    `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.AudioCommandMatcher = AudioCommandMatcher;`,
    context,
    { filename: sourcePath }
);

const config = {
    getVisualConfig: () => ({
        boom: { soundKey: 'visualPing' },
        flash: { audioOverride: 'visualOverride' }
    }),
    getSoundConfig: () => ({
        visualPing: { src: 'visual/ping.mp3' },
        visualOverride: 'visual/override.mp3'
    })
};
const matcher = new context.AudioCommandMatcher(config);
const catalog = matcher.normalizeCatalog({
    hello: { src: 'hello.mp3', volume: 0.7 },
    'hello world': 'long.mp3',
    visualPing: 'visual/ping.mp3',
    visualOverride: 'visual/override.mp3',
    'ㅋㅋ': ['laugh-a.mp3', { src: './SFX/laugh-b.mp3', volume: 0.5 }]
});
matcher.setSoundHive(catalog);

assert.strictEqual(catalog.hello.src, 'SFX/hello.mp3');
assert.strictEqual(catalog['hello world'], 'SFX/long.mp3');
assert.strictEqual(catalog['ㅋㅋ'][0], 'SFX/laugh-a.mp3');
assert.strictEqual(catalog['ㅋㅋ'][1].src, './SFX/laugh-b.mp3');

const matches = matcher.match('HeLLo World hello');
assert.deepStrictEqual(Array.from(matches, match => match.keyword), ['hello world', 'hello']);
assert.deepStrictEqual(Array.from(matcher.match('visualPing visualOverride')), []);
assert.strictEqual(matcher.match('ㅋㅋㅋㅋㅋㅋ').length, 1);
assert.deepStrictEqual(Array.from(matcher.match('')), []);

const visualPaths = matcher.buildVisualAudioPaths(source => `resolved:${source}`);
assert.deepStrictEqual(
    Array.from(visualPaths).sort(),
    ['resolved:visual/override.mp3', 'resolved:visual/ping.mp3']
);

console.log('[test] Audio command matcher behavior contract passed.');
