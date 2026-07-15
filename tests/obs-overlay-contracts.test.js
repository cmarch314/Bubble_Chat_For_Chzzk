const assert = require('assert');
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.resolve(__dirname, '../style.css'), 'utf8');

const bodyRule = css.match(/body\s*\{([\s\S]*?)\}/);
assert.ok(bodyRule, 'OBS overlay body style must exist');
assert.match(bodyRule[1], /background:\s*transparent/);
assert.match(bodyRule[1], /overflow:\s*hidden/);

const rootRule = css.match(/:root\s*\{([\s\S]*?)\}/);
assert.ok(rootRule, 'overlay layer variables must exist');
assert.match(rootRule[1], /--z-chat:\s*2147483647/);

const chatRule = css.match(/#chat\s*\{([\s\S]*?)\}/);
assert.ok(chatRule, 'chat anchor style must exist');
assert.match(chatRule[1], /bottom:\s*0px/);
assert.match(chatRule[1], /z-index:\s*var\(--z-chat\)/);

const gameOverlayRule = css.match(/\.game-overlay-container,\s*\.game-help-overlay-container\s*\{([\s\S]*?)\}/);
assert.ok(gameOverlayRule, 'shared game overlay boundary must exist');
assert.match(gameOverlayRule[1], /height:\s*80vh/);
assert.match(gameOverlayRule[1], /pointer-events:\s*none/);

console.log('[test] OBS overlay transparency and chat-layer contract passed.');
