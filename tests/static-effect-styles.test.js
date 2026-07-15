const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const effectFiles = [
    'js/effects/GameHelpEffect.js',
    'js/effects/CommandsScrollEffect.js',
    'js/effects/RaidEffect.js'
];

for (const file of effectFiles) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(!source.includes('_injectStyles'), `${file} must not inject presentation rules at runtime`);
    assert.ok(!source.includes("createElement('style')"), `${file} must use the static stylesheet`);
}

const css = fs.readFileSync(path.join(root, 'styles/game-effects.css'), 'utf8');
for (const selector of ['.game-help-title', '.commands-scroll-overlay', '.game-raid-container']) {
    assert.ok(css.includes(selector), `missing extracted selector ${selector}`);
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(html.includes('./styles/game-effects.css'));

console.log('static effect stylesheet contract passed');
