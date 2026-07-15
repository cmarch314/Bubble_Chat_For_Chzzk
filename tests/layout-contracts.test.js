const assert = require('assert');
const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../style.css');
const css = fs.readFileSync(cssPath, 'utf8');
const helpCardRule = css.match(/\.game-help-card\s*\{([\s\S]*?)\}/);

assert.ok(helpCardRule, 'game help card style must exist');
assert.match(helpCardRule[1], /width:\s*min\(1500px,\s*calc\(100vw - 40px\)\)/);
assert.match(helpCardRule[1], /max-height:\s*78vh/);
assert.match(helpCardRule[1], /overflow:\s*hidden/);
assert.match(helpCardRule[1], /box-sizing:\s*border-box/);
assert.match(helpCardRule[1], /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);

const effectCss = fs.readFileSync(path.resolve(__dirname, '../styles/game-effects.css'), 'utf8');
assert.match(effectCss, /\.game-help-title\s*\{[\s\S]*?grid-column:\s*1 \/ -1/);
assert.match(effectCss, /\.game-help-footer\s*\{[\s\S]*?grid-column:\s*1 \/ -1/);

console.log('[test] Responsive game layout contract passed.');
