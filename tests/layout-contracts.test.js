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

const huntRenderer = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
assert.match(huntRenderer, /class="game-hunt-card game-hunt-pregame-card hunt-quest-board/);
assert.match(huntRenderer, /class="game-hunt-card game-hunt-pregame-card hunt-loadout-board/);
assert.match(huntRenderer, /class="hunt-combat-info"/);
assert.match(huntRenderer, /class="hunt-loadout-perk"[\s\S]*?class="hunt-perk-lore"/);
assert.match(css, /\.game-overlay-container\.hunt-pregame-overlay\s*\{[\s\S]*?height:\s*85vh/);
assert.match(css, /\.game-hunt-card\.hunt-combat-board\s*\{[\s\S]*?1760px/);
assert.match(css, /\.hunt-combat-info\s*\{[\s\S]*?grid-template-areas/);

console.log('[test] Responsive game layout contract passed.');
