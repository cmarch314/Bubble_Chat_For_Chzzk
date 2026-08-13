'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.resolve(__dirname, '../styles/hunt-runtime.css'), 'utf8');
const animator = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');

assert.match(css,
    /\.environment-pitfall\.is-releasing\s*\{\s*animation:pitfall-release-fade \.8s ease-in both;/,
    'the complete pitfall layer must fade during the authored escape window');
assert.match(css,
    /@keyframes pitfall-release-fade\s*\{[\s\S]*?0%,35%\{opacity:1\}[\s\S]*?100%\{opacity:0\}/,
    'the trap must remain readable as escape begins and reach zero opacity before cleanup');
assert.match(animator,
    /effects\.forEach\(effect => effect\.classList\.add\('is-releasing'\)\)[\s\S]*?effects\.forEach\(effect => effect\.remove\(\)\)[\s\S]*?}, 800\);/,
    'live and preview trap release must share the fade class and remove only after its 800ms animation');

console.log('[test] Pitfall release fade lifecycle passed.');
