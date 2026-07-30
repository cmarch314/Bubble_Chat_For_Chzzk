'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(
    __dirname,
    'fixtures/hunt-world-flying-wyverns-preview.html'
), 'utf8');

assert.match(html, /width:1920px;height:1080px/);
assert.match(html, /하단 15%/);
assert.match(html, /const roster=\[[^\]]+\]/);
for (const id of require('../data/hunt/research/world-iceborne-flying-wyverns.json').roster) {
    assert.match(html, new RegExp(`['"]${id}['"]`), `${id} must be selectable in the visual review fixture`);
}
assert.doesNotMatch(html, /\[MR\]|\uFFFD/);
console.log('[test] World Flying Wyvern 1920x1080 preview contract passed.');
