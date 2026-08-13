const assert = require('assert');
const fs = require('fs');
const path = require('path');

const renderer = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const animator = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
const css = require('./helpers/hunt-css');

assert.match(renderer, /\['sword_shield', 'lance', 'gunlance'\]\.includes\(w\.id\)[\s\S]*?hunt-split-weapon[\s\S]*?hunt-split-shield/,
    'Sword and Shield, Lance, and Gunlance must render independent weapon/shield layers');
assert.match(renderer, /hunt-split-weapon hunt-split-weapon--\$\{w\.id\}/,
    'split weapon layers must expose a weapon-specific clipping hook');
assert.match(animator, /const shieldMotion = HuntWeaponAnimationCatalog\.shieldMotion\(profile\)[\s\S]*?playWeaponAnimation\(shieldImg/,
    'the shield layer must receive its own semantic animation profile');
assert.match(animator, /triggerRollAnimation[\s\S]*?\.game-hunt-weapon-img, #fight-card-\$\{idx\} \.hunt-split-shield/,
    'evasion must move both visual layers without moving the hunter card');
assert.match(animator, /interruptWeaponVisual[\s\S]*?cancelWeaponAnimation\(shieldImg\)/,
    'interruptions must clear a shield pose alongside the weapon pose');
assert.match(animator, /triggerGuardImpact\(idx, outcome = 'guard'\)[\s\S]*?\.hunt-split-shield[\s\S]*?hunt-guard-impact/,
    'successful guards must anchor their translucent impact emoji to the split shield layer');
assert.match(css, /\.hunt-guard-impact\.is-split-shield,\s*\.hunt-tackle-impact\.is-split-shield\s*\{[^}]*left:\s*73%[^}]*top:\s*54%/s,
    'the guard impact must sit over the visible half of split shield art');
assert.match(css, /@keyframes hunt-guard-impact-shake\s*\{[\s\S]*?rotate\(-9deg\)[\s\S]*?rotate\(8deg\)[\s\S]*?rotate\(-6deg\)/,
    'the guard emoji needs a compact shield shake instead of moving the hunter card');
assert.match(css, /\.hunt-combat-board \.hunt-split-weapon[\s\S]*?clip-path:\s*inset\(0 50% 0 0\)/,
    'the weapon layer must mask away the shield half of the source icon');
assert.match(css, /\.hunt-combat-board \.hunt-split-weapon--lance[\s\S]*?clip-path:\s*inset\(0 52% 0 0\)/,
    'the lance weapon layer must exclude the shield rim that starts just beyond the spear guard');
assert.match(css, /\.hunt-combat-board \.hunt-split-shield[\s\S]*?clip-path:\s*inset\(0 0 0 47%\)/,
    'the shield layer must mask away the weapon half of the source icon');

console.log('[test] Shield weapon image layers and independent animation routing passed.');
