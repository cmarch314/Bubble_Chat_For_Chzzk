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
    assert.match(html, new RegExp(audioScript.replace(/\./g, '\\.')),
        `${audioScript} must be loaded by the pattern lab`);
}
// 손으로 관리하는 ?v= 토큰은 쓰지 않는다. 프리뷰 서버가 Cache-Control: no-store를
// 보내므로 매번 새로 읽히고, 토큰은 올리는 것을 잊었을 때 "고쳤는데 화면이 그대로"로
// 나타난다. 실제로 그 오해에 검수 두 라운드를 썼다. 지금 무엇이 로드됐는지는
// 우측 상단 CSS 빌드 표시로 눈으로 확인한다.
assert.doesNotMatch(html, /\.js\?v=/,
    '패턴 랩은 손관리 캐시 토큰을 쓰지 않는다 (프리뷰 서버가 no-store를 보낸다)');
assert.match(html, /id="css-build"/,
    '무엇이 로드됐는지 눈으로 확인할 빌드 표시가 필요하다');
assert.match(html, /labAudio\?\.playPattern\(pattern,pattern\.runtimeResolvedImpactTimeline\|\|\[\]\)/,
    'preview audio must follow the resolved multi-impact timeline');
assert.match(html, /onMonsterProjectileLaunchAudio=.*playProjectileLaunch/,
    'the pattern lab must reproduce projectile launch audio callbacks');
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
// 레이어 순서(placement > pose > aim > facing > image)는
// tests/hunt-monster-layer-contract.test.js가 실수렵 마크업과 직접 대조한다.
// 여기서 정규식으로 한 번 더 적으면 레이어가 늘 때마다 두 곳을 고쳐야 하고,
// 한쪽을 잊으면 "검수 화면과 실제 화면이 다르다"가 다시 생긴다.
assert.match(html, /class="hunt-monster-pose-layer"/,
    'the preview must carry the production pose layer');
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
assert.match(html, /pattern\.flightTransition==='land'/,
    'pattern lab must reproduce authored landing transitions after landing actions');
assert.match(html, /applyState\('normal',true\)/,
    'landing previews must visibly return the monster to its grounded state');
assert.match(html, /--target-color/);
assert.match(html, /classList\.toggle\('is-targeted'/,
    'random target selection must illuminate the matching hunter card');
assert.match(html, /자동→\$\{linked\+1\}/,
    'the automatic target button must reveal the selected slot');
assert.match(html, /하단 15%/);

console.log('[test] Interactive monster pattern lab contract passed.');
