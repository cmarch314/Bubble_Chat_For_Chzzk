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
assert.match(huntRenderer, /renderPerkBubbles/);
assert.match(huntRenderer, /activatePerkMarquees/);
assert.match(huntRenderer, /hunt-perk-lore-track/);
assert.match(huntRenderer, /class="hunt-loadout-build-line"/);
assert.match(huntRenderer, /hunt-quest-board--consecutive/);
assert.match(huntRenderer, /hunt-quest-target-grid/);
assert.match(huntRenderer, /class="hunt-perk-bubble hunt-perk-bubble--/);
assert.ok(!huntRenderer.includes('RANDOM PERKS'), 'loadout must not show a generic PERK caption');
assert.ok(!huntRenderer.includes('◆ PERK'), 'combat cards must show individual skill bubbles');
assert.match(css, /\.game-overlay-container\.hunt-pregame-overlay\s*\{[\s\S]*?height:\s*85vh/);
assert.match(css, /\.game-hunt-card\.hunt-combat-board\s*\{[\s\S]*?1760px/);
assert.match(css, /\.hunt-combat-info\s*\{[\s\S]*?grid-template-areas/);
assert.match(css, /\.hunt-perk-icon\s*\{[\s\S]*?width:\s*28px/);
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-build-line\s*\{[\s\S]*?display:\s*flex/);
assert.match(css, /\.hunt-loadout-board \.hunt-perk-lore\s*\{[\s\S]*?font-size:\s*\.82rem/);
assert.match(css, /\.hunt-perk-lore--scrolling\s+\.hunt-perk-lore-track/);
assert.match(css, /@keyframes hunt-perk-lore-scroll/);
assert.doesNotMatch(css, /\.hunt-perk-lore--scrolling[\s\S]*?animation-direction:\s*alternate/);
assert.match(css, /\.hunt-quest-target-grid\s*\{[\s\S]*?--quest-target-columns/);
assert.match(css, /\.hunt-quest-target-name\s*\{[\s\S]*?font-size:\s*1\.12rem/);

const HuntRenderer = require('../js/effects/hunt/HuntRenderer.js');
const perkRenderer = Object.create(HuntRenderer.prototype);
const perkHTML = perkRenderer.renderPerkBubbles([{
    name: '겁쟁이',
    description: '이 긴 설명은 카드 본문에 노출되어야 합니다.',
    affinities: ['mobility'],
    modifiers: { evadeChance: 0.12, attackRate: 0.96 }
}]);
assert.match(perkHTML, /hunt-perk-lore-track/);
assert.ok(perkHTML.includes('이 긴 설명은 카드 본문에 노출되어야 합니다.'), 'original perk lore must be restored');
assert.ok(!perkHTML.includes('hunt-perk-effect'), 'keyword-only perk effects must stay rolled back');

const scrollingClasses = new Set();
const loreStyle = {
    values: {},
    setProperty(name, value) { this.values[name] = value; },
    removeProperty(name) { delete this.values[name]; }
};
const trackStyle = {
    animationDuration: '',
    removeProperty(name) {
        if (name === 'animation-duration') this.animationDuration = '';
    }
};
const track = { scrollWidth: 230, style: trackStyle };
const lore = {
    clientWidth: 100,
    style: loreStyle,
    classList: {
        add(name) { scrollingClasses.add(name); },
        remove(name) { scrollingClasses.delete(name); }
    },
    querySelector(selector) { return selector === '.hunt-perk-lore-track' ? track : null; }
};
perkRenderer.activatePerkMarquees({ querySelectorAll: () => [lore] });
assert.strictEqual(loreStyle.values['--perk-scroll-distance'], '130px');
assert.ok(scrollingClasses.has('hunt-perk-lore--scrolling'));
assert.match(trackStyle.animationDuration, /s$/);

track.scrollWidth = 100;
perkRenderer.activatePerkMarquees({ querySelectorAll: () => [lore] });
assert.ok(!scrollingClasses.has('hunt-perk-lore--scrolling'), 'short perk lore must remain stationary');

console.log('[test] Responsive game layout contract passed.');
