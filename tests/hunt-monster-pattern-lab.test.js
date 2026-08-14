'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, 'fixtures/hunt-monster-pattern-lab.html'), 'utf8');

assert.match(html, /distinctPasses:pattern\.targeting\?\.distinctPasses===true/,
    'the preview must preserve authored distinct multi-lane volleys instead of collapsing them to one target');

assert.match(html, /function authoredPattern\(patternId\)/,
    'the unified preview must resolve authored follow-up BEAT motion instead of trusting a stale server adapter');

assert.match(html, /get\('embed'\) !== '1'/,
    'the retired standalone pattern lab must only run as the unified audio review iframe');
assert.match(html, /location\.replace\('http:\/\/127\.0\.0\.1:17930\/'\)/,
    'direct pattern-lab visits must return to the unified monster audio review UI');
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
assert.match(html, /function playPreviewMotionOnly\(pattern,\s*selection\)/,
    'Preview must expose a dedicated monster-motion-only editor path');
assert.match(html, /animator\.playBeatMotion\(\s*monsterImg,motionPattern,motionPattern\.id,targetCard,targets\)/,
    'Preview must render the same authored monster BEAT graph without starting a hunter combat simulation');
assert.match(html, /const targets=\[\];/,
    'Preview must preserve target geometry without creating hunter impact recipients');
assert.match(html, /runtimePreviewMotionOnly:true/,
    'Preview motion must be explicitly marked as editor-only');
assert.match(html, /runtimeResolvedImpactTimeline:Array\.isArray\(pattern\.runtimeResolvedImpactTimeline\)/,
    'Preview must retain authored judgment timing for visual markers');
assert.match(html, /dataset\.previewHunterResolution='disabled'/,
    'Preview must not resolve hunter damage/reactions while editing monster motion');
assert.doesNotMatch(html, /playPreviewMotionOnly\(pattern,selection\)[\s\S]{0,500}previewRuntime\.executeMonsterPattern/,
    'the editor motion path must not re-enter the combat runtime');
assert.doesNotMatch(html, /new HuntCombatRuntime\(/,
    'the embedded editor must not construct a second combat runtime at all');
assert.doesNotMatch(html,
    /labAudio\?\.playPattern\(pattern,pattern\.runtimeResolvedImpactTimeline\|\|\[\]\)/,
    'Preview must not schedule a second audio/impact timeline beside the BEAT engine');
assert.match(html, /onMonsterProjectileLaunchAudio=.*playProjectileLaunch/,
    'the pattern lab must reproduce projectile launch audio callbacks');
assert.match(html, /id="preview-editor-tools"/,
    'design gizmos may add an overlay but must not restyle the production combat board');
assert.doesNotMatch(html, /id="lab-preview-overrides"/,
    'the retired Preview-only combat layout stylesheet must not survive');
assert.match(html, /new HuntRenderer\(/,
    'Preview must mount the production combat renderer itself');
assert.match(html, /previewRenderer\.renderFight\(\{/,
    'Preview combat markup must come from HuntRenderer.renderFight');
assert.doesNotMatch(html, /function renderCombatChrome\(\)/,
    'the retired hand-written combat-board clone must not survive');
assert.doesNotMatch(html, /const previewRenderer=\{/,
    'Preview must not maintain a hand-written renderer facade');
for (const productionScript of ['HuntNotificationRenderer.js', 'HuntRenderer.js']) {
    assert.match(html, new RegExp(productionScript.replace(/\./g, '\\.')),
        `${productionScript} must be loaded by the embedded real-hunt Preview`);
}
// 레이어 순서(placement > pose > aim > facing > image)는
// tests/hunt-monster-layer-contract.test.js가 실수렵 마크업과 직접 대조한다.
// 여기서 정규식으로 한 번 더 적으면 레이어가 늘 때마다 두 곳을 고쳐야 하고,
// 한쪽을 잊으면 "검수 화면과 실제 화면이 다르다"가 다시 생긴다.
assert.match(html, /id="preview-overlay" class="game-overlay-container"/,
    'the production renderer must receive the same overlay/card ownership shape as live combat');

// ---- 부위 파괴는 상태와 나란히 실험할 수 있어야 한다 ----
//
// 부위 목록을 하드코딩하면(예전에는 머리/좌익/우익/꼬리였다) 어느 몬스터를 골라도
// 같은 넷이 보이고 파괴 실험 자체가 불가능하다. 티가렉스의 앞발처럼 몬스터마다
// 다른 부위는 실제 해부 데이터에서만 나온다.
assert.doesNotMatch(html, /<span class="lab-part"><span>🗿<\/span><b>머리<\/b><\/span>/,
    '부위 목록을 하드코딩하면 몬스터별 부위를 실험할 수 없다');
assert.match(html, /HuntMonsterAnatomyCatalog\.createPartState/,
    '부위는 실제 해부 데이터에서 그려야 한다');
assert.match(html, /function togglePart\(/, '눌러서 부위를 파괴할 수 있어야 한다');

// 파괴 판정 의미가 HuntMonsterPatternSelector와 같아야 한다. 다르면 랩에서만
// 되는/안 되는 패턴이 생기고, 그게 이번 세션 사고의 형태였다.
assert.match(html, /part\.broken\|\|part\.severed/,
    '파괴 집합은 broken 또는 severed로 잡아야 한다 (선택기와 같은 규칙)');
assert.match(html, /forbiddenWhenBroken/, '파괴로 막히는 패턴을 표시해야 한다');
for (const field of ['brokenPartDamageModifiers', 'weightWhenBroken',
    'brokenPartTargetCaps', 'statusBlockedWhenBroken']) {
    assert.match(html, new RegExp(field),
        `${field}의 영향을 검수 화면에서 읽을 수 있어야 한다`);
}
// 막힌 패턴을 목록에서 지우면 왜 없는지 알 수 없다. 남겨두고 이유를 붙인다.
assert.match(html, /is-blocked/, '막힌 패턴은 지우지 않고 표시한다');

// 파괴 반응 모션은 실수렵과 같은 코드로 재생해야 한다. 랩에서 따로 구현하면
// 검수 화면과 실제 화면이 갈라지고, 그게 이번 세션 사고의 형태였다.
assert.match(html, /HuntCombatAnimator\.js/, '파괴 반응은 전투 애니메이터가 재생한다');
assert.match(html, /combat\.triggerMonsterPartBreakReaction\(/,
    '부위를 부수면 실제 반응 모션이 나와야 한다');
assert.match(html, /HuntMonsterAnatomyCatalog\.breakReaction\(/,
    '반응 종류와 길이는 해부 카탈로그가 정한다 (랩에서 숫자를 다시 적지 않는다)');
// 공격 애니메이터를 두 개 만들면 서로의 정리(clearMonsterAnimations)를 지워
// 모션이 끊긴다. 전투 애니메이터가 들고 있는 것을 그대로 쓴다.
assert.match(html, /const animator=combat\.monsterAttackAnimator/,
    '공격 애니메이터 인스턴스는 하나여야 한다');
assert.match(html, /HuntMonsterPartMaterialCatalog\.js/,
    '파괴 파편 그림은 소재 카탈로그에서 나온다');

// 부위 패널은 renderCombatChrome이 나중에 주입한다. #lab-parts에 직접 리스너를
// 걸면 그 시점에 없어서 조용히 넘어가고, 눌러도 아무 일이 없다. 실제로 그랬다.
assert.doesNotMatch(html, /getElementById\('lab-parts'\)\?\.addEventListener/,
    '나중에 주입되는 노드에 직접 리스너를 걸면 조용히 실패한다');
assert.doesNotMatch(html, /class="hunt-monster-facing-layer">\s*<div class="hunt-monster-attack-motion">/,
    'flipping a travel wrapper mirrors its coordinates and teleports the monster across the board');
assert.match(html, /HUNT_RELEASED_MONSTER_DATA/,
    'the lab must derive its monster dropdown from the reviewed release catalog');
assert.match(html, /const patternsForMonster=monsterId=>\{/,
    'pattern buttons must be generated from the live authored candidate-or-release catalog');
assert.match(html, /HuntMonsterActionPolicy\.resolveTargetScenario/,
    'automatic and manual targets must use the shared target policy');
assert.match(html, /runtimeResolvedImpactTimeline/,
    'multi-impact animations must receive the same resolved timeline used in combat');
assert.match(html, /pattern\.runtimePrimaryTargetIndex=finalPrimary/,
    'the preview must keep its selected primary target separate from area judgment recipients');
assert.match(html, /pattern\.flightTransition==='land'/,
    'pattern lab must reproduce authored landing transitions after landing actions');
assert.match(html, /applyState\('normal',true\)/,
    'landing previews must visibly return the monster to its grounded state');
assert.match(html, /--target-color/);
assert.match(html, /classList\.toggle\('is-targeted'/,
    'random target selection must illuminate the matching hunter card');
assert.match(html, /pair:random-adjacent/,
    'the preview target selector must offer a random adjacent pair rather than only a primary hunter');
assert.match(html, /const adjacentPairs=\[\[0,1\],\[1,2\],\[2,3\]\]/,
    'random adjacent targeting must choose only the 1·2, 2·3, or 3·4 lanes');
assert.match(html, /Its movement anchor stays fixed\s+\/\/ for this action/,
    'a random pair must be picked once and retained for the whole preview action');
assert.match(html, /자동→\$\{linked\+1\}/,
    'the automatic target button must reveal the selected slot');
assert.match(html, /하단 15%/);
assert.match(html, /bubblechat:pattern-preview/,
    'sound review must be able to preview an unsaved motion draft in the real animator');
assert.match(html, /new URL\(document\.referrer\)\.origin/,
    'preview readiness must return to the active loopback review-server origin, including agent-specific ports');
assert.match(html, /embedded-preview/,
    'embedded production preview must hide its own control overlay');
assert.match(html, /animator\.seekBeatMotion\(Math\.max\(0,Math\.min\(1,Number\(progress\|\|0\)\)\)\)/,
    'the embedded editor must scrub the shared BEAT animation directly');
assert.match(html, /bubblechat:pattern-preview-playback/,
    'the embedded runtime must acknowledge playback so the editor timeline follows real playback');
assert.match(html, /!pattern\.runtimePreviewMuteAudio/,
    'the embedded production renderer must stay silent when the review timeline owns preview audio');
assert.match(html, /if\(!selection\.targets\.length\)/,
    'every preview pattern must receive a safe visual target even when combat targeting resolves empty');
assert.match(html, /schedulePreviewProjectile\?\.\(motionPattern,selection\.primary/,
    'motion-only Preview must still schedule an authored detached projectile on the shared BEAT clock');
assert.match(html, /pattern=HuntMonsterPatternCatalog\.synchronizeEditedPattern\(pattern\)/,
    'native candidate preview must compile its judgment timeline before target resolution');
assert.doesNotMatch(html, /if\(!pattern\.nativeBeatCandidate\)pattern=HuntMonsterPatternCatalog\.synchronizeEditedPattern/,
    'native candidates must not bypass the same BEAT compiler used by live hunts');
assert.match(html, /bubblechat:pattern-anatomy/,
    'the editor must be able to toggle the monster anatomy position/direction guide');
assert.match(html, /monster-anatomy-guide/);
assert.match(html, /let anatomyGuideEnabled=true/,
    'the embedded editor must show anatomy guides by default');
assert.match(html, /previewRenderer\.updateMonsterPartsUI\(\s*HuntMonsterAnatomyCatalog\.partDisplaySlots\(partState\)/,
    'Preview must render the production material-backed part list instead of a second emoji-only HUD');
assert.doesNotMatch(html, /const PART_ICONS=|function partIcon\(/,
    'Preview must not maintain a second hand-authored part icon map');
assert.match(html, /part-handle/,
    'each anatomy part must expose an interactive drag handle');
assert.match(html, /syncAnatomyTransform/,
    'anatomy overlays must track the live monster image transform');
assert.match(html, /bubblechat:monster-anatomy-edit/,
    'dragged anatomy coordinates must be persisted through the review editor');
assert.match(html, /className=['"]motion-gizmo['"]/,
    'design mode must expose direct move, scale, skew and rotation handles');
assert.match(html, /bubblechat:pattern-preview-edit/,
    'gizmo changes must report the selected BEAT transform to the editor');
assert.match(html, /gizmo-origin/,
    'the design gizmo must expose a draggable rotation pivot');
assert.match(html, /kind==='scale-x'/);
assert.match(html, /kind==='scale-y'/);
assert.match(html, /kind==='skew-x'/);
assert.match(html, /kind==='skew-y'/,
    'move, axis scale and axis skew handles must be independently draggable');
assert.match(html, /previewScenario\.forcedImpactTargets/,
    'the lab must render explicit per-impact design targets through the shared resolver');
assert.match(html, /ANATOMY_LABELS=\{head:'머리'/,
    'head, limb, wing, and tail markers must use readable labels');

assert.match(html, /const representativePart=pattern\.reactionSize==='large'/,
    'grouped small/large break previews must resolve a concrete anatomy part');
assert.match(html, /triggerMonsterPartBreakReaction\(\s*visualType,durationTicks,representativePart,pattern\.motion\s*\)/,
    'grouped break previews must pass the part and current draft motion into the material split visual');
assert.doesNotMatch(html, /triggerMonsterPartBreakReaction\(visualType,durationTicks,null\)/,
    'grouped break previews must never silently suppress the part-material split visual');
assert.match(html, /kind==='tail-sever'[\s\S]*?playBeatMotion\(/,
    'tail-sever playback must dispatch its authored BEAT graph instead of returning silently');
assert.match(html, /kind==='sleeping'[\s\S]*?triggerMonsterSleepAnim\(\{motion:pattern\.motion\}\)/,
    'sleep playback must animate collapse, held sleep and wake instead of applying the final sleeping pose immediately');
assert.match(html, /function resetPatternPreviewPose\(\)\{[\s\S]*?clearPendingReaction\(\);[\s\S]*?clearMonsterAnimations\('pattern-selection'\)/,
    'selecting another pattern must cancel reaction timers before resetting the monster pose');
assert.match(html, /if\(message\.resetOnly\)\{[\s\S]*?return;/,
    'pattern selection reset must not instantiate or play the newly selected motion graph');

console.log('[test] Interactive monster pattern lab contract passed.');
