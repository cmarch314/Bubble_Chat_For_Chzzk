const assert = require('assert');
const fs = require('fs');
const path = require('path');

const dolphinEffectPath = path.resolve(__dirname, '../js/effects/DolphinEffect.js');
const dolphinSource = fs.readFileSync(dolphinEffectPath, 'utf8');

assert.match(dolphinSource, /rainbowProbability/, 'DolphinEffect must define rainbow probability config');
assert.match(dolphinSource, /rainbow-dolphin/, 'DolphinEffect must apply rainbow-dolphin CSS class');

const stylePath = path.resolve(__dirname, '../style.css');
const styleSource = fs.readFileSync(stylePath, 'utf8');
assert.match(styleSource, /\.lead-dolphin\.rainbow-dolphin/, 'style.css must contain .lead-dolphin.rainbow-dolphin styles');
assert.match(styleSource, /@keyframes rainbow-dolphin-hue/, 'style.css must contain @keyframes rainbow-dolphin-hue');

assert.ok(dolphinSource.includes('isRainbowRequested'), 'DolphinEffect must define isRainbowRequested for forced trigger');

console.log('[test] Dolphin rainbow probability unit test passed.');
