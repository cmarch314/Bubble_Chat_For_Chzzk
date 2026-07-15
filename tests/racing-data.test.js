const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const window = {};
const dataPath = path.resolve(__dirname, '../js/effects/RacingData.js');
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), { window }, { filename: dataPath });

assert.strictEqual(window.RACING_ALL_RACERS.length, 51);
assert.strictEqual(Object.keys(window.RACING_INTRO_TEXTS).length, 51);
assert.strictEqual(new Set(window.RACING_ALL_RACERS.map(racer => racer.code)).size, 51);
assert.strictEqual(new Set(window.RACING_ALL_RACERS.map(racer => racer.emoji)).size, 51);

for (const racer of window.RACING_ALL_RACERS) {
    assert.strictEqual(window.RACING_EMOJI_CODE_MAP[racer.emoji], racer.code);
    assert.ok(window.RACING_INTRO_TEXTS[racer.emoji], `missing intro text for ${racer.code}`);
}

const effectSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/RacingEffect.js'), 'utf8');
assert.match(effectSource, /window\.RACING_ALL_RACERS/);
assert.match(effectSource, /window\.RACING_INTRO_TEXTS/);
assert.match(effectSource, /window\.RACING_EMOJI_CODE_MAP/);
assert.doesNotMatch(effectSource, /const ALL_RACERS\s*=\s*\[/);
assert.doesNotMatch(effectSource, /const INTRO_TEXTS\s*=\s*\{/);
assert.doesNotMatch(effectSource, /_injectStyles|style\.innerHTML/);

const indexSource = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
assert.match(indexSource, /styles\/racing\.css/);
assert.ok(fs.existsSync(path.resolve(__dirname, '../styles/racing.css')));

console.log('[test] Racing data single-source contract passed.');
