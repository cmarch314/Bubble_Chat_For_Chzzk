const assert = require('assert');
const fs = require('fs');
const path = require('path');

const cssPath = path.resolve(__dirname, '../style.css');
const css = fs.readFileSync(cssPath, 'utf8');
const helpCardRule = css.match(/\.game-help-card\s*\{([\s\S]*?)\}/);

assert.ok(helpCardRule, 'game help card style must exist');
assert.match(helpCardRule[1], /width:\s*min\(1208px,\s*calc\(100vw - 40px\)\)/);
assert.match(helpCardRule[1], /max-height:\s*78vh/);
assert.match(helpCardRule[1], /overflow-y:\s*auto/);
assert.match(helpCardRule[1], /box-sizing:\s*border-box/);

console.log('[test] Responsive game layout contract passed.');
