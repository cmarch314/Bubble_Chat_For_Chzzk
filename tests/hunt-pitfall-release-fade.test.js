'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.resolve(__dirname, '../styles/hunt-runtime.css'), 'utf8');
const animator = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');

assert.match(css,
    /\.environment-pitfall\.is-releasing\s*\{\s*animation:pitfall-release-fade var\(--pitfall-release-fade-ms,1\.4s\) ease-in both;/,
    'the complete pitfall layer must fade during the authored escape window');
assert.match(css,
    /@keyframes pitfall-release-fade\s*\{[\s\S]*?0%,58%\{opacity:1\}[\s\S]*?100%\{opacity:0\}/,
    'the trap must outlive the 800ms monster escape, then reach zero opacity before cleanup');
assert.match(animator,
    /PITFALL_RELEASE_FADE_MS = 1400[\s\S]*?effects\.forEach\(effect => effect\.classList\.add\('is-releasing'\)\)[\s\S]*?effects\.forEach\(effect => effect\.remove\(\)\)[\s\S]*?HuntCombatAnimator\.PITFALL_RELEASE_FADE_MS\);/,
    'live and preview trap release must share a visible post-escape fade before DOM cleanup');
assert.match(animator,
    /effects\.forEach\(effect => effect\.style\.setProperty[\s\S]*?monsterImg\?\.classList\?\.add\('monster-pitfall-releasing'\)/,
    'BEAT-owned pitfall release must retain the renderer lifecycle guard until the fade completes');
assert.doesNotMatch(animator,
    /pitfallBeatOwned !== 'true'[\s\S]{0,120}monster-pitfall-releasing/,
    'BEAT motion ownership must not suppress trap DOM persistence');

console.log('[test] Pitfall release fade lifecycle passed.');
