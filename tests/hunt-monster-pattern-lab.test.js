'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, 'fixtures/hunt-monster-pattern-lab.html'), 'utf8');

assert.match(html, /width:1920px;height:1080px/);
assert.match(html, /id="monster-select"/);
assert.match(html, /id="pattern-buttons"/);
assert.match(html, /id="state-buttons"/);
assert.match(html, /id="target-buttons"/);
assert.match(html, /id="lab-audio-toggle"|labAudio\.installToggle/,
    'the pattern lab must expose an explicit audio on/off control');
assert.match(html, /HUNT_LOCAL_AUDIO_MANIFESTS=\{world:\{defaultGain:\.8,entries:\[\]\}\}/,
    'the lab must avoid parsing the full private hunter-audio inventory just to audition monster cues');
assert.match(html, /HuntAudioCatalog\.js/);
assert.match(html, /HuntAudioManager\.js/);
for (const audioScript of [
    'WorldMonsterRoarRoutes.generated.js',
    'WorldMonsterAudioReviewRoutes.generated.js',
    'HuntAudioCatalog.js',
    'hunt-monster-pattern-lab-audio.js'
]) {
    assert.match(html, new RegExp(`${audioScript.replace(/\./g, '\\.')}\\?v=20260803a`),
        `${audioScript} must share the current audio-route cache revision`);
}
assert.match(html, /labAudio\?\.playPattern\(pattern,pattern\.runtimeResolvedImpactTimeline\|\|\[\]\)/,
    'preview audio must follow the resolved multi-impact timeline');
assert.match(html, /\.lab-controls\{position:fixed;z-index:2147483647;/,
    'the inspection console must float in its own top layer without changing combat geometry');
assert.match(html, /backdrop-filter:blur\(6px\);[^}]*opacity:\.76/,
    'the floating inspection console must remain translucent over the production scene');
assert.match(html, /function renderCombatChrome\(\)/);
assert.match(html, /class="hunt-monster-vitals lab-vitals"/,
    'the preview must include the production monster HP and ATB structure');
assert.match(html, /class="hunt-monster-aux-rail lab-aux"/,
    'the preview must include the production parts, cart, and timer rails');
assert.match(html, /class="hunt-hunter-heading"/);
assert.match(html, /class="hunt-atb-row"/);
assert.match(html, /class="hunt-item-list"/);
assert.match(html, /class="game-hunt-weapon-name"/,
    'preview hunter cards must preserve production combat-card information order');
assert.match(html, /class="hunt-monster-attack-motion">\s*<div class="hunt-monster-facing-layer">\s*<img id="fight-monster-img"/,
    'the preview must mirror the production travel > facing > image ownership order');
assert.doesNotMatch(html, /class="hunt-monster-facing-layer">\s*<div class="hunt-monster-attack-motion">/,
    'flipping a travel wrapper mirrors its coordinates and teleports the monster across the board');
assert.match(html, /HUNT_RELEASED_MONSTER_DATA/,
    'the lab must derive its monster dropdown from the reviewed release catalog');
assert.match(html, /HUNT_MONSTER_PATTERN_OVERRIDES\[monster\.id\]/,
    'pattern buttons must be generated from live authored monster data');
assert.match(html, /HuntMonsterActionPolicy\.resolveTargeting/,
    'automatic and manual targets must use the shared target policy');
assert.match(html, /runtimeResolvedImpactTimeline/,
    'multi-impact animations must receive the same resolved timeline used in combat');
assert.match(html, /--target-color/);
assert.match(html, /classList\.toggle\('is-targeted'/,
    'random target selection must illuminate the matching hunter card');
assert.match(html, /자동→\$\{linked\+1\}/,
    'the automatic target button must reveal the selected slot');
assert.match(html, /하단 15%/);

console.log('[test] Interactive monster pattern lab contract passed.');
