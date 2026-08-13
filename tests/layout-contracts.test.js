const assert = require('assert');
const fs = require('fs');
const path = require('path');

const css = require('./helpers/hunt-css');
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
const huntPartMaterials = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterPartMaterialCatalog.js'), 'utf8');
const huntAnimator = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
const huntEffect = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const insectGlaiveWeapon = fs.readFileSync(path.resolve(__dirname, '../img/weapons/insect_glaive.svg'), 'utf8');
const insectGlaiveKinsect = fs.readFileSync(path.resolve(__dirname, '../img/weapons/kinsect.svg'), 'utf8');
assert.match(huntRenderer, /class="game-hunt-card game-hunt-pregame-card hunt-quest-board/);
assert.match(huntRenderer, /class="game-hunt-card game-hunt-pregame-card hunt-loadout-board/);
assert.match(huntRenderer, /class="hunt-combat-info"/);
assert.match(huntRenderer, /renderWeaponResourceGlyphs\(w\)/);
assert.match(huntRenderer, /id="potion-count-\$\{w\.index\}"[\s\S]*?id="trap-count-\$\{w\.index\}"[\s\S]*?id="lifepowder-count-\$\{w\.index\}"/,
    'hunter cards must show potion, trap, and healing-powder counts together');
assert.match(
    huntRenderer,
    /updateHunterItemUI\(hunter, sharedSupply = null\)[\s\S]*?#potion-count-\$\{hunter\.index\}[\s\S]*?#trap-count-\$\{hunter\.index\}[\s\S]*?#lifepowder-count-\$\{hunter\.index\}[\s\S]*?#bomb-count-\$\{hunter\.index\}[\s\S]*?#flash-count-\$\{hunter\.index\}/,
    'all issued and shared combat item counts need one shared refresh path'
);
assert.match(huntRenderer, /id="bomb-count-\$\{w\.index\}"/, 'hunter cards must show remaining barrel bombs');
assert.match(huntRenderer, /weapon-icon-resource-glyph/);
assert.match(huntRenderer, /class="hunt-weapon-special-resource">\$\{this\.renderWeaponResourceGlyphs\(w\)\}/,
    'weapon resources must live in the top resource row instead of covering the weapon image');
assert.doesNotMatch(huntRenderer, /<b>악보<\/b>/, 'Hunting Horn score should communicate through large note symbols without a redundant label');
assert.match(huntRenderer, /id="horn-buffs-\$\{w\.index\}"/);
assert.match(huntRenderer, /class="hunt-hunter-heading"[\s\S]*?hunt-hunter-personality[\s\S]*?hunt-hunter-name/,
    'combat cards must lead with personality and hunter name');
assert.match(huntRenderer, /class="hunt-atb-row"[\s\S]*?id="atb-fill-\$\{w\.index\}"/,
    'hunter ATB must use a horizontal bar');
assert.doesNotMatch(huntRenderer, /<b>ATB<\/b>/, 'combat ATB bar must not waste space on a visible label');
assert.match(css, /\.hunt-atb-track\s*>\s*i\s*\{[\s\S]*?background:\s*linear-gradient\(90deg,\s*#d99b00,\s*#ffd84d/,
    'hunter ATB fill must use the compact yellow gauge color');
assert.match(huntRenderer, /hunterHpBarBackground\(w = \{\}, pct = 100\)[\s\S]*?blights\.poison[\s\S]*?blights\.fire[\s\S]*?environmentDotType === 'effluvium'/,
    'hunter HP bars must reflect poison, fire, and environmental tick-damage causes');
assert.match(huntRenderer, /hunterAtbBarBackground\(w = \{\}, interrupted = false\)[\s\S]*?blights\.ice[\s\S]*?blights\.water/,
    'hunter ATB bars must reflect ice and water ATB penalties');
assert.match(huntRenderer, /dual_blades:\s*\(\)\s*=>\s*bar\([^,]+,\s*w\.archdemonGauge,\s*null,\s*'demon'\)/,
    'Dual Blades must expose one red Demon Gauge instead of a competing stamina meter');
assert.match(css, /\.resource-demon \.weapon-resource-mini-track\s*>\s*i\s*\{[\s\S]*?#f0223f/,
    'the Demon Gauge must render as a clearly red resource bar');
assert.match(huntRenderer, /getPersonalityIcon\(w\.personality\)/, 'combat identity must show only the personality icon');
assert.match(huntRenderer, /\$\{isSmallSwarm \? '' : `[\s\S]*?id="monster-atb-fill"/, 'the shared monster ATB must be omitted for small-monster encounters');
assert.match(huntRenderer, /hunt-small-monster-atb/, 'each small monster must retain its own visible action gauge');
assert.doesNotMatch(huntRenderer, /hunt-monster-side-panel|monster-status-label|Quest Status|Monster Status|Monster Action/,
    'monster combat information must not return to bulky left/right text panels');
assert.match(huntRenderer, /id="monster-state-icon"[\s\S]*?id="monster-name-text"/,
    'temporary monster state emoji must sit immediately left of the monster name');
assert.match(huntRenderer, /state\.includes\('분노'\) \? '😡'[\s\S]*?state\.includes\('탈진'\) \? '🤤'/,
    'rage and exhaustion must be represented by name-adjacent emoji only');
assert.match(css, /\.hunt-monster-atb-track\s*\{[^}]*width:\s*50%/s,
    'monster ATB must be a centered bar at half the health-bar width');
assert.doesNotMatch(huntRenderer, /수레 현황:|남은 시간:|격추 0%/,
    'secondary monster HUD information must avoid persistent prose labels');
assert.match(huntRenderer, /id="cart-counter-board"[^>]*>🛒 \$\{this\.cartLimit\}<\/span>[\s\S]*?id="battle-timer-label"[^>]*>⏱️/,
    'cart and time must remain compact emoji-plus-number signals');
assert.doesNotMatch(huntRenderer, /class="hunt-monster-vitals"[\s\S]*?class="hunt-monster-(?:parts|corner-hud)"[\s\S]*?<\/div>\s*<\/div>\s*<div class="hunt-monster-aux-rail"/,
    'monster health flow must contain only HP and ATB, never the auxiliary parts or quest signals');
assert.match(huntRenderer, /class="hunt-monster-aux-rail"[\s\S]*?class="hunt-monster-aux-panel hunt-monster-parts-panel"[\s\S]*?class="hunt-monster-aux-panel hunt-monster-utility-panel"[\s\S]*?<!-- Monster Showcase Area -->/,
    'parts and cart/time must live in separate auxiliary plates beside the monster stage');
assert.match(css, /\.hunt-monster-aux-rail\s*\{[^}]*position:absolute[^}]*display:grid/s,
    'the auxiliary rail must not add height to the combat layout flow');
assert.match(css, /\.hunt-monster-aux-panel\s*\{[^}]*border:2px[^}]*background:linear-gradient/s,
    'each auxiliary group must have a readable independent plate');
assert.match(css, /\.hunt-monster-parts-panel\s*\{[^}]*justify-self:start/s,
    'part status must occupy the left auxiliary plate');
assert.match(css, /\.hunt-monster-utility-panel\s*\{[^}]*justify-self:end/s,
    'cart and time must occupy the distinct right auxiliary plate');
assert.match(huntRenderer, /const panel = this\.card\?\.querySelector\('#hunt-monster-parts-panel'\)[\s\S]*?panel\.hidden = isEmpty/,
    'the detached part plate must disappear when a monster has no breakable-part display');
assert.match(css, /\.hunt-monster-corner-hud\s*\{[^}]*justify-content:flex-end/s,
    'cart and time signals must align to the right auxiliary plate');
assert.match(css, /\.hunt-monster-hud-chip\s*\{[^}]*background:transparent[^}]*font-size:4rem/s,
    'monster utility signals must be doubled to four-rem emoji-plus-number text');
assert.match(css, /\.hunt-monster-part\s*\{[^}]*width:64px[^}]*height:82px[^}]*font-size:4rem[^}]*opacity:1/s,
    'breakable-part material slots and labels must remain prominent and fully opaque');
assert.match(css, /\.hunt-monster-part-label\s*\{[^}]*font-size:15px[^}]*font-weight:900[^}]*white-space:nowrap/s,
    'short part names must remain readable below their material icons');
assert.match(css, /\.hunt-monster-part-label\s*\{[^}]*background:rgba\(4,4,3,.94\)[^}]*color:#fff4d2 !important/s,
    'part labels must keep high contrast on the dark auxiliary panel');
assert.match(css, /\.hunt-monster-part::before\s*\{[^}]*radial-gradient[^}]*rgba\(255,239,181,\.38\)/s,
    'dark extracted materials need a warm backing glow for OBS readability');
assert.match(css, /\.hunt-monster-part-art::before\s*\{[^}]*var\(--hunt-part-base[^}]*mask-image:var\(--hunt-part-mask\)/s,
    'neutral part templates must receive a solid alpha-mask fill that also colours white interior pixels');
assert.match(css, /\.hunt-monster-part-image\s*\{[^}]*filter:var\(--hunt-part-tint,none\)[^}]*opacity:\.94/s,
    'the source image must tint its opaque interior instead of remaining gray');
assert.match(huntRenderer, /HuntMonsterPartMaterialCatalog\.resolve\(this\.selectedMonster, part\)/,
    'part status must resolve the current monster material instead of an anatomy emoji');
assert.match(huntRenderer, /icon\.dataset\.materialSourceId = material\?\.sourceId/,
    'rendered part items must retain their audited source identity');
assert.match(huntRenderer, /icon\.dataset\.materialShape = material\?\.shapeFamily/,
    'rendered part items must expose their audited silhouette family');
assert.match(huntRenderer, /icon\.style\.setProperty\('--hunt-part-tint', material\?\.tint/,
    'the audited monster tint must be applied to the visible source pixels');
assert.match(huntRenderer, /caption\.className = 'hunt-monster-part-label'[\s\S]*?caption\.textContent = shortLabel[\s\S]*?slot\.appendChild\(caption\)/,
    'every material icon must render its compact part name directly underneath');
assert.match(huntRenderer, /--hunt-part-mask', `url\("\$\{material\?\.path/,
    'the part renderer must bind the extracted icon alpha mask');
assert.match(huntRenderer, /--hunt-part-base', material\?\.palette\?\.base/,
    'one neutral material set must receive the current monster solid palette');
assert.doesNotMatch(huntRenderer, /const icons = \{[^}]*🐲|slot\.textContent = icons/,
    'anatomy emoji must never substitute for available material icons');
assert.match(huntPartMaterials, /爵銀龍の銀角[\s\S]*?爵銀龍の重殻[\s\S]*?爵銀龍の剛翼[\s\S]*?爵銀龍の三又尾/,
    'part slots must use the audited white Malzeno source set');
assert.match(css, /\.hunter-interference-overlay\s*\{[^}]*inset:3px[^}]*z-index:4[^}]*width:138px[^}]*height:138px[^}]*opacity:\.92/s,
    'roar, wind, and tremor overlays must match the weapon image and sit immediately above its layers');
assert.match(css, /\.hunter-interference-overlay\.is-small\s*\{[^}]*opacity:\.88/);
assert.match(css, /\.hunter-interference-overlay\.is-large\s*\{[^}]*opacity:\.98/);
assert.match(css,
    /\.hunter-interference-active \.game-hunt-weapon-img\s*\{/,
    'hit knockback animations must override stale roar, tremor, or wind wobble selectors');
for (const kind of ['roar', 'tremor', 'wind']) {
    assert.match(css, new RegExp(`\\.hunter-interference-overlay\\.is-${kind}[^}]*--hunter-interference-color`),
        `${kind} interference needs its own high-contrast color`);
}
assert.match(huntAnimator, /triggerRoarStun\(idx, isStunned\)[\s\S]*?triggerHunterInterference\(idx, 'roar', 'large', isStunned\)/,
    'legacy ear-block visuals must reuse the weapon-anchored interference layer');
assert.doesNotMatch(huntRenderer, /atb-circle-fill/, 'the former circular ATB indicator must be removed');
assert.doesNotMatch(huntRenderer, /👤 \$\{SafeContent\.escapeHTML\(w\.hunterName/, 'hunter names must not retain the person emoji');
assert.match(huntRenderer, /class="hunt-item-list" id="personality-tag-/, 'item counters must retain their live update target');
assert.match(huntRenderer, /id="lifepowder-count-\$\{w\.index\}">💚/,
    'healing powder needs a distinct recovery icon');
assert.match(huntRenderer, /id="flash-count-\$\{w\.index\}">✨/,
    'flash pods alone own the flash sparkle icon');
assert.doesNotMatch(css, /\.hunt-shared-supply-mode\s+\.hunt-item-list\s*\{\s*display\s*:\s*none/i, 'shared camp supply must not hide the per-hunter item counters');
assert.match(css, /\.hunt-combat-board \.hunt-item-list\s*\{[\s\S]*?z-index:\s*10;/,
    'item counters must stay below a monster entering the hunter lane');
assert.match(css, /\.hunt-combat-board \.hunt-item-list\s*\{[\s\S]*?font-size:\s*1\.014rem\s*!important;/, 'combat item counters must retain the 1.3x readable scale');
assert.match(css, /\.hunt-combat-board \.hunt-item-list\s*\{[\s\S]*?color:\s*#fff4d2\s*!important;/,
    'combat item quantities need an explicit high-contrast color instead of inheriting dark text');
assert.match(css, /\.hunt-combat-board \.hunt-item-list\s*>\s*span\s*\{[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*\.68\)/,
    'combat item quantities need a stable dark backing in OBS capture');
assert.doesNotMatch(huntRenderer, /w\.personality === 'offensive' \? '💥'/, 'the item column must not retain the redundant personality emoji');
assert.match(css, /grid-template-areas:\s*"heading heading heading"\s*"hp hp hp"\s*"atb atb atb"\s*"sharp sharp special"\s*"weapon-name weapon-name weapon-name"\s*"items weapon perks"\s*"probabilities probabilities probabilities"/,
    'combat weapon names must be centered immediately below the sharpness row without a reservation row');
assert.match(css, /\.hunt-combat-perks \.hunt-perk-bubble--compact\s*\{[^}]*border-radius:\s*9px/s, 'combat perks must use compact rounded corners rather than pill borders');
assert.match(css, /\.hunt-combat-board \.game-hunt-weapon-img-container\s*\{[^}]*z-index:\s*30\s*!important/s,
    'weapon spectacle must render above neighboring bars and card content');
assert.match(css, /#monster-showcase-panel\s*\{[^}]*z-index:\s*20\s*!important;/s,
    'every pattern must keep the monster spectacle below weapon images and above hunter card chrome');
assert.match(css, /\.hunt-combat-board \.game-hunt-weapon-card\s*\{\s*\/\*[^}]*?z-index:\s*auto\s*!important;/s,
    'hunter cards must not create a lower combat stacking level around their weapon');
assert.doesNotMatch(huntAnimator, /weaponCard\.style\.zIndex\s*=/,
    'attack animations must never push the hunter card and its weapon below the monster');
assert.doesNotMatch(huntAnimator, /weaponCard\.style\.transform\s*=\s*`translate\(/,
    'fallback attacks must animate the weapon rather than creating a card stacking context');
{
    const largeHitShake = css.match(/@keyframes card-large-shake\s*\{([\s\S]*?)\n\}/)?.[1] || '';
    const smallHitShake = css.match(/@keyframes card-small-shake\s*\{([\s\S]*?)\n\}/)?.[1] || '';
    assert.doesNotMatch(largeHitShake, /\btransform\s*:/,
        'hit card shake must not trap the weapon below the monster in a new stacking context');
    assert.doesNotMatch(smallHitShake, /\btransform\s*:/,
        'light hit card shake must keep the weapon in the global combat depth order');
    assert.match(largeHitShake, /\bleft\s*:/);
    assert.match(smallHitShake, /\btop\s*:/);
}
assert.doesNotMatch(huntRenderer, /weapon-charge-aura/,
    'Great Sword and Hammer charge color must stay on their moving weapon images');
assert.match(huntRenderer, /`cb-phials-\$\{w\.index\}`/);
assert.match(huntRenderer, /`ig-extracts-\$\{w\.index\}`/);
assert.doesNotMatch(huntRenderer, /hunt-weapon-resource-strip/, 'weapon resources must not resemble a stamina bar below HP');
assert.doesNotMatch(huntRenderer, /compact-mechanic/, 'combat resource panels must not return beside the weapon icon');
assert.match(huntRenderer, /renderPerkBubbles/);
assert.doesNotMatch(huntRenderer, /activatePerkMarquees|hunt-perk-lore-track/, 'loadout perk lore must remain stationary and fully visible');
assert.match(huntRenderer, /class="hunt-loadout-build-line"/);
assert.match(huntRenderer, /hunt-loadout-ready/);
assert.match(huntRenderer, /hunt-quest-board--consecutive/);
assert.match(huntRenderer, /hunt-rise-target-grid/);
assert.match(huntRenderer, /hunt-rise-sheet/);
assert.match(huntRenderer, /hunt-rise-details/);
assert.match(huntRenderer, /hunt-rise-recruit-slot/);
assert.match(huntRenderer, /hunt-rise-mission-body[\s\S]*?hunt-rise-target-grid[\s\S]*?hunt-rise-details/,
    'quest target and essential conditions must share one dense mission body');
assert.match(huntRenderer, /① 참가[\s\S]*?② 장비 설정[\s\S]*?③ 즉시 출발/,
    'quest board must explain the participation flow without relying on streamer narration');
assert.match(huntRenderer, /class="hunt-perk-bubble hunt-perk-bubble--/);
assert.match(huntRenderer, /hunt-perk-bubble--skill-/);
assert.match(huntRenderer, /img\/weapons\/kinsect\.svg/);
assert.match(huntRenderer, /ig-kinsect--rest/);
assert.match(huntAnimator, /profile\.kinsect === 'extract'/);
assert.match(huntAnimator, /ig-kinsect-extract/);
assert.match(huntAnimator, /ig-kinsect-assault/);
assert.doesNotMatch(insectGlaiveWeapon, /M650,980/, 'weapon layer must no longer contain the original kinsect silhouette');
assert.match(insectGlaiveKinsect, /M650,980/, 'kinsect layer must be extracted from the original icon geometry');
assert.doesNotMatch(insectGlaiveKinsect, /linearGradient|feGaussianBlur/, 'invented glowing bug art must not return');
assert.ok(!huntRenderer.includes('RANDOM PERKS'), 'loadout must not show a generic PERK caption');
assert.ok(!huntRenderer.includes('◆ PERK'), 'combat cards must show individual skill bubbles');
assert.match(css, /\.game-overlay-container\.hunt-pregame-overlay\s*\{[\s\S]*?height:\s*85vh/);
assert.match(css, /\.game-hunt-card\.hunt-combat-board\s*\{[\s\S]*?1760px/);
assert.match(css, /\.hunt-combat-info\s*\{[\s\S]*?grid-template-areas/);
assert.doesNotMatch(css, /"resource resource resource"/, 'combat resource UI must not add a stamina-like row below HP');
assert.match(css, /\.weapon-icon-resource-glyph\s*\{[\s\S]*?position:\s*absolute/);
assert.match(css, /\.hunt-combat-board \.weapon-resource-dock-horn\s*\{[\s\S]*?top:\s*calc\(100% \+ 12px\)/,
    'Hunting Horn score must be anchored beneath the weapon image instead of the variable-height card');
assert.match(css, /\.horn-note,[\s\S]*?\.horn-score\s*\{[\s\S]*?font-size:\s*22px/,
    'Hunting Horn notes and stored scores must remain prominent at 1080p');
assert.match(huntAnimator, /impactStage = this\.card\.querySelector\('#monster-showcase-panel'\)/,
    'weapon impact effects must render on the monster stage, not near hunter HP');
assert.match(huntAnimator, /triggerHitAnimation\(idx, w, reaction = \{\}\)\s*\{[\s\S]*?this\.interruptWeaponVisual\(idx, w\)/,
    'hunter hit reactions must interrupt the currently running weapon animation');
assert.match(huntAnimator, /triggerHitAnimation\(idx, w, reaction = \{\}\)[\s\S]*?'\.game-hunt-weapon-img, \.hunt-split-shield, \.game-hunt-weapon-overlay'/,
    'hunter hit knockback must target weapon, split shield, and attached weapon effect layers');
assert.match(huntAnimator, /weaponCard\.classList\.add\(cardShakeClass\)[\s\S]*?weaponLayers\.forEach\(layer => \{[\s\S]*?layer\.animate\(keyframes/,
    'a hunter hit may shake the fixed card while WAAPI applies knockback only to its weapon layers');
assert.doesNotMatch(huntAnimator, /layer\.classList\.add\(hitClass\)/,
    'legacy CSS hunter hit animation must not coexist with the WAAPI owner');
assert.match(huntAnimator, /kind === 'weak' \? 1500 : 4000/,
    'migrated weak and strong hit recovery must preserve the approved 1.5s and 4s timing');
assert.match(huntAnimator, /knockbackVectorFromRects[\s\S]*?offset: \.25[\s\S]*?translate\(\$\{x\}px, \$\{y \+ yOffset\}px\)[\s\S]*?offset: \.75/,
    'strong hit recovery must fall along the measured monster-to-hunter collision vector');
assert.doesNotMatch(css, /@keyframes\s+weapon-(?:small|large)-hit/,
    'legacy CSS hunter hit keyframes must be removed after WAAPI migration');
assert.doesNotMatch(huntAnimator, /weaponCard\.style\.animation\s*=\s*'cart-card-slide-out/,
    'carting must never rotate or throw the entire hunter card away');
assert.match(huntAnimator, /triggerDeathTag\(idx, w, timerVal = 5\)[\s\S]*?fallDistance = 220[\s\S]*?rotate\(720deg\)[\s\S]*?hunter-cart-sequence-cart/,
    'carting must use the authored two-turn fall and converging cart sequence');
assert.match(huntAnimator, /\(imgContainer \|\| weaponCard\)\.appendChild\(cart\)[\s\S]*?translate\(0,\$\{fallDistance\}px\)/,
    'the cart must share the weapon image coordinate space and converge on its exact fallen position');
assert.match(css, /\.hunter-cart-sequence-cart,[\s\S]*?top:50%/,
    'cart and weapon coordinates must share the image-container center origin');
assert.match(huntAnimator, /triggerHunterReturn\(idx, w\)[\s\S]*?translateY\(230px\)[\s\S]*?translateY\(0\)/,
    'camp return must jump vertically from below the hunter card back to home');
assert.doesNotMatch(huntAnimator, /weaponCard\.style\.animation\s*=\s*'none'/,
    'reviving must not leave an inline animation override that disables later card shakes');
assert.doesNotMatch(css, /@keyframes\s+cart-card-slide-out/,
    'obsolete whole-card cart rotation must not remain available');
assert.doesNotMatch(css, /weapon-carted-out|game-hunt-cart-container|cart-ride/,
    'the former CSS cart paths must not coexist with the WAAPI sequence');
assert.match(huntAnimator, /triggerRollAnimation\(idx\)[\s\S]*?querySelectorAll\(`#[^`]* \.game-hunt-weapon-img,[^`]*\.hunt-split-shield`\)/,
    'evade rotation must target only weapon/shield image layers, never chat or resource containers');
assert.match(huntAnimator, /idxOrMonster === 'monster'[\s\S]*?'skill-bubble monster-skill-bubble'/,
    'monster actions need a dedicated bubble placement class');
assert.match(css, /#monster-showcase-panel > \.monster-skill-bubble\s*\{[\s\S]*?top:\s*4px;[\s\S]*?bottom:\s*auto;/,
    'monster action bubbles must stay below the HP panel inside the showcase');
assert.doesNotMatch(huntAnimator, /triggerRollAnimation\(idx\)[\s\S]{0,300}?game-hunt-weapon-img-container/,
    'evade rotation must not move chat bubbles, Hunting Horn score, or status overlays');
assert.match(css, /\.game-hunt-weapon-img\.roll-anim,\s*\n\.hunt-split-shield\.roll-anim\s*\{/);
assert.match(huntAnimator, /interruptWeaponVisual\(idx, w\)[\s\S]*?cancelWeaponAnimation\(weaponImg\)[\s\S]*?updateWeaponChargeAuraUI\(idx, w\)/,
    'an interrupted Great Sword charge must immediately return its visual stage to the reset mechanic state');
assert.match(huntEffect, /onInterruptWeaponVisual:[\s\S]*?interruptWeaponVisual\(idx, w\)/,
    'combat defense interruptions must reach the weapon visual cleanup owner');
assert.doesNotMatch(css, /\.weapon-charge-aura/,
    'detached charge silhouettes must not return for Great Sword or Hammer');
assert.match(css, /\.weapon-great_sword:not\(\.weapon-charge-stage-0\)[\s\S]*?rotate\(calc\(135deg \* var\(--weapon-facing\)\)\)/,
    'Great Sword charge pose must not reverse its blade direction in right-side slots');
assert.match(css, /\.weapon-hammer:not\(\.weapon-charge-stage-0\)[\s\S]*?rotate\(calc\(-78deg \* var\(--weapon-facing\)\)\)/,
    'Hammer charge pose must stay visibly tilted toward the monster');
assert.match(css, /\.weapon-great_sword\.weapon-charge-stage-1 \.game-hunt-weapon-img\s*\{[\s\S]*?grayscale\(0\.72\)[\s\S]*?brightness\(1\.28\)/,
    'Great Sword charge stage 1 must recolor the moving blade white');
assert.match(css, /\.weapon-great_sword\.weapon-charge-stage-2 \.game-hunt-weapon-img\s*\{[\s\S]*?sepia\(0\.58\)[\s\S]*?saturate\(2\.15\)/,
    'Great Sword charge stage 2 must recolor the moving blade yellow');
assert.match(css, /\.weapon-great_sword\.weapon-charge-stage-3 \.game-hunt-weapon-img\s*\{[\s\S]*?saturate\(3\.15\)[\s\S]*?hue-rotate\(326deg\)[\s\S]*?drop-shadow/,
    'Great Sword charge stage 3 must recolor the moving blade red');
assert.match(css, /\.weapon-hammer\.weapon-charge-stage-1 \.game-hunt-weapon-img\s*\{[\s\S]*?grayscale\(0\.72\)[\s\S]*?brightness\(1\.28\)/,
    'Hammer charge stage 1 must recolor the moving weapon white');
assert.match(css, /\.weapon-hammer\.weapon-charge-stage-2 \.game-hunt-weapon-img\s*\{[\s\S]*?sepia\(0\.58\)[\s\S]*?saturate\(2\.15\)/,
    'Hammer charge stage 2 must recolor the moving weapon yellow');
assert.match(css, /\.weapon-hammer\.weapon-charge-stage-3 \.game-hunt-weapon-img\s*\{[\s\S]*?saturate\(3\.15\)[\s\S]*?hue-rotate\(326deg\)[\s\S]*?drop-shadow/,
    'Hammer charge stage 3 must recolor the moving weapon red');
assert.doesNotMatch(css, /\.weapon-(?:great_sword|hammer)\.weapon-charge-stage-3[\s\S]{0,220}brightness\(0\)/,
    'charge red must preserve weapon texture instead of flattening it into a primary-color silhouette');
assert.match(css, /\.hunt-perk-icon\s*\{[\s\S]*?width:\s*28px/);
assert.match(css, /\.hunt-severed-tail img\s*\{\s*width:\s*81px;\s*height:\s*81px/,
    'the severed-tail item image must render at 1.5x its original 54px size');
assert.match(huntRenderer, /const hunterGap = hunterCards\.length > 1/,
    'a severed tail must derive its throw distance from the visible spacing between hunters');
assert.match(huntRenderer, /--tail-flight-x/,
    'a severed tail must travel laterally from the live monster position instead of dropping at a random board point');
assert.match(css, /var\(--tail-flight-arc\)/,
    'the severed-tail throw must preserve a visible airborne arc');
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-build-line\s*\{[\s\S]*?display:\s*flex/);
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-card\.hunt-loadout-ready\s*\{[\s\S]*?border-color:\s*#62f59c/,
    'ready hunters need a visible locked-in border at 1080p');
assert.match(css, /\.hunt-combat-board \.game-hunt-weapon-card\.hunter-at-camp\s*\{[\s\S]*?opacity:\s*1/,
    'camp entry perks must use an explicit camp placeholder instead of a translucent weapon ghost');
assert.match(css, /\.hunter-at-camp\s*>\s*\*\s*\{[\s\S]*?visibility:\s*hidden/,
    'a hunter who is still at camp must not appear as a semi-transparent combatant');
assert.match(huntRenderer, /dataset\.campLabel/, 'camp placeholders must explain why the hunter is absent');
assert.match(huntRenderer, /🎲 !리롤 ×2/, 'loadout instructions must expose the concise two-use reroll command without ellipsis');
assert.match(huntRenderer, /🔒 !잠금 1/, 'loadout instructions must expose the numbered perk-lock command');
assert.match(huntRenderer, /🔓 !해제 1/, 'loadout instructions must expose the distinct numbered perk-unlock command');
assert.match(huntRenderer, /hunt-perk-lock-capacity[^`]*🔒 \$\{hunter\.lockedPerkId \? 1 : 0\}\/1/, 'each loadout card must show its one-lock capacity');
assert.match(huntRenderer, /hunt-perk-bubble--locked/, 'locked perks must receive a visible locked badge treatment');
assert.doesNotMatch(huntRenderer, /hunt-combat-reserve-commands|hunt-action-queue|!예약취소/,
    'autobattler combat must not render a per-hunter action reservation queue');
assert.doesNotMatch(huntRenderer, /!물약 · !가루|!숫돌|!점프|!귀환옥/,
    'autobattler combat must not advertise direct item or movement reservations');
assert.match(huntRenderer, /hunt-combat-hot-join[^`]*!참가/,
    'mid-combat participation may remain available without directing the hunter action loop');
assert.match(huntRenderer, /hunt-loadout-timer[\s\S]*?hunt-loadout-kicker[\s\S]*?game-title[\s\S]*?hunt-loadout-grid[\s\S]*?hunt-loadout-guide/,
    'loadout timer must render at the very top and command guide below the hunter grid');
assert.match(css, /\.hunt-loadout-board > \.hunt-loadout-timer\s*\{[\s\S]*?font-size:\s*1\.62rem/,
    'top loadout timer must remain prominent at 1080p');
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-guide\s*\{[\s\S]*?font-size:\s*1\.28rem/,
    'bottom loadout commands must remain large enough for OBS capture');
assert.match(css, /\.monster-element-beam[\s\S]*?\{[\s\S]*?width:\s*var\(--fx-length\)/,
    'elemental attacks must draw a directional body from the monster to the target');
assert.match(css, /\.monster-element-impact\s*\{[\s\S]*?left:\s*var\(--fx-dest-x\)/,
    'elemental attacks must place their impact burst on the selected hunter');
assert.match(css, /\.monster-element-fx\.is-ultimate \.monster-element-impact\s*\{\s*width:\s*280px/,
    'ultimate elemental attacks need a visibly larger impact silhouette at 1080p');
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/,
    'the richer monster effects must retain a reduced-motion path');
assert.match(css, /\/\* Final 1080p loadout density pass[\s\S]*?\.hunt-loadout-board \.hunt-perk-lore\s*\{[\s\S]*?font-size:\s*1\.62rem/);
assert.match(css, /\.hunt-perk-lore\s*\{[\s\S]*?white-space:\s*normal;[\s\S]*?word-break:\s*keep-all/);
assert.match(css, /\.hunt-loadout-board \.hunt-perk-lore\s*\{[\s\S]*?min-height:\s*2\.24em/);
assert.doesNotMatch(css, /hunt-perk-lore-scroll|hunt-perk-lore--scrolling/, 'loadout perk lore must not use a marquee');
assert.match(css, /\.hunt-rise-target-grid\s*\{[\s\S]*?--quest-target-columns/);
assert.match(css, /\.hunt-rise-mission-body\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\) 365px/,
    'single-hunt quest information must use horizontal space instead of leaving a hollow center');
assert.match(css, /\.hunt-rise-target-name\s*\{[\s\S]*?font-size:\s*1\.02rem/);
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-perks\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/);
assert.match(css, /\.hunt-perk-bubble--skill-burst/);
assert.match(css, /@keyframes ig-kinsect-extract/);
assert.match(css, /@keyframes ig-kinsect-assault/);
assert.match(css, /\.ig-kinsect\s*\{[\s\S]*?inset:\s*0;[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%/);
const perkLoreRule = css.match(/\.hunt-perk-lore\s*\{([^}]*)\}/);
assert.ok(perkLoreRule);
assert.doesNotMatch(perkLoreRule[1], /mask-image:/, 'perk lore must not hide its first letter behind a gradient mask');

global.HuntPerkSynergyCatalog = require('../js/effects/hunt/HuntPerkSynergyCatalog.js');
const HuntRenderer = require('../js/effects/hunt/HuntRenderer.js');
const resourceRenderer = Object.create(HuntRenderer.prototype);
assert.deepStrictEqual(
    resourceRenderer.hornBuffVisuals({ id: 'hunting_horn', hornAttackBuffTicks: 1, hornDefenseBuffTicks: 1, hornSpeedBuffTicks: 1, melodyBuffTicks: 1 }).map(buff => buff.emoji),
    ['⚔️', '🛡️', '💨', '🎵'],
    'active Hunting Horn effects must be readable on the hunter card'
);
assert.deepStrictEqual(resourceRenderer.hornBuffVisuals({ id: 'hammer', melodyBuffTicks: 5 }), [], 'self-improvement belongs only to the horn user');
assert.strictEqual(resourceRenderer.weaponResourceVisual({ id: 'hammer' }), null, 'hammer charge belongs to the ATB action chain, not a persistent resource gauge');
assert.strictEqual(resourceRenderer.weaponResourceVisual({ id: 'great_sword' }), null, 'temporary great sword charge must not become permanent UI clutter');
assert.strictEqual(resourceRenderer.weaponResourceVisual({ id: 'lance' }), null, 'combo position is not a persistent weapon resource');
assert.deepStrictEqual(resourceRenderer.weaponResourceVisual({ id: 'insect_glaive', extractBuffs: { red: true, white: false, orange: true } }).active, [true, false, true]);
assert.strictEqual(resourceRenderer.weaponResourceVisual({ id: 'charge_blade', phials: 3 }).active, 3);
const perkRenderer = Object.create(HuntRenderer.prototype);
const perkHTML = perkRenderer.renderPerkBubbles([{
    name: '겁쟁이',
    description: '이 긴 설명은 카드 본문에 노출되어야 합니다.',
    affinities: ['mobility'],
    modifiers: { evadeChance: 0.12, attackRate: 0.96 }
}]);
assert.doesNotMatch(perkHTML, /hunt-perk-lore-track/);
assert.ok(perkHTML.includes('이 긴 설명은 카드 본문에 노출되어야 합니다.'), 'original perk lore must be restored');
assert.ok(!perkHTML.includes('hunt-perk-effect'), 'keyword-only perk effects must stay rolled back');
const synergyHTML = perkRenderer.renderPerkBubbles([
    { name: '공중 추적자', description: '하늘 추적', affinities: ['ranged'] },
    { name: '공격', description: '공격', affinities: ['burst'] },
    { name: '날개 꺾기', description: '날개 파괴', affinities: ['ranged'] }
], true);
assert.match(synergyHTML, /관통 궤도/);
assert.ok(synergyHTML.indexOf('공중 추적자') < synergyHTML.indexOf('날개 꺾기'), 'synergy perks must render next to each other');
assert.match(synergyHTML, /hunt-perk-bubble--synergy/);
assert.match(css, /\.hunt-perk-synergy\s*\{[\s\S]*?border:\s*2px[\s\S]*?animation:\s*hunt-perk-synergy-glow/, 'perk synergy groups must use a substantial animated glow frame');
assert.match(css, /\.hunt-perk-synergy-label\s*\{[\s\S]*?font-size:\s*\.9rem[\s\S]*?text-shadow:/, 'perk synergy labels must remain readable and luminous at 1080p');
assert.match(css, /\.hunt-perk-bubble--synergy\s*\{[\s\S]*?border-width:\s*2px/, 'linked perk bubbles must retain a strong synergy border');
assert.ok(HuntPerkSynergyCatalog.recipes.length >= 34, 'perk synergy coverage must extend well beyond the original fourteen groups');
const cartSynergy = HuntPerkSynergyCatalog.group([{ name: '수레 애호가' }, { name: '불굴' }]);
assert.strictEqual(cartSynergy[0].synergy.label, '수레 보험');
assert.strictEqual(perkRenderer.getPerkVisual({ name: '💩' }).icon, '💩', 'the rare empty-roll jackpot needs an unmistakable perk icon');
const dungHTML = perkRenderer.renderPerkBubbles([{ name: '💩', description: '아들아... 네가 태어나던 날, 온 세상이 코를...', modifiers: { critChance: .6 } }], true);
assert.match(dungHTML, />💩</);
assert.match(dungHTML, /hunt-perk-bubble--dung/);
assert.match(css, /\.hunt-perk-bubble--dung\s*\{[\s\S]*?conic-gradient[\s\S]*?hunt-dung-rainbow/,
    'Dung must have an animated rainbow border and multicolor glow');
assert.doesNotMatch(huntRenderer, /long-sword-spirit-overlay|spirit-overlay-/,
    'long sword spirit color must stay on the moving weapon image instead of a detached duplicate silhouette');
assert.match(css, /\.game-hunt-weapon-img\.ls-spirit-img-1[\s\S]*?\.game-hunt-weapon-img\.ls-spirit-img-3/,
    'long sword spirit levels must retain direct weapon-image glow styling');
assert.doesNotMatch(huntRenderer, /charge-blade-shield-overlay|shield-overlay-/,
    'charge blade shield charge must not render a detached duplicate silhouette');
assert.match(huntRenderer, /w\.id === 'charge_blade' && w\.shieldChargeDuration > 0 \? ' cb-shield-charged-img'/,
    'charge blade shield charge must decorate the same image layer used by weapon motion');
assert.match(css, /\.game-hunt-weapon-img\.cb-shield-charged-img\s*\{[^}]*filter:/s,
    'charge blade shield charge must style the moving weapon image directly');
assert.doesNotMatch(css, /\.game-hunt-weapon-img\.cb-shield-charged-img\s*\{[^}]*animation:/s,
    'charge blade shield charge must not override action animations');
assert.match(css, /\.hunt-damage-number\s*\{[\s\S]*?position:\s*absolute[\s\S]*?hunt-damage-number-pop/,
    'successful hits must render a readable damage number at the impact coordinate');
assert.match(huntAnimator, /hitContext\.critical === true && hitContext\.bounced !== true/,
    'confirmed critical hits must reach the impact renderer without decorating bounced attacks');
assert.match(css, /\.hunt-hit-impact\.is-normal i\s*\{[\s\S]*?hunt-hit-dust/,
    'ordinary hunter hits must use a restrained dust impact');
assert.match(css, /\.hunt-critical-slash\s*\{[\s\S]*?clip-path:\s*polygon/,
    'the critical slash must taper toward its endpoint');
assert.match(css, /\.hunt-critical-slash\s*\{[\s\S]*?#[eEfF][0-9a-fA-F]{5}[\s\S]*?transform:\s*translate\(-50%, -50%\) rotate\(45deg\) scale\(/,
    'critical hits must flash as a red tapered slash fixed to the impact coordinate');
assert.doesNotMatch(css, /@keyframes hunt-critical-slash[\s\S]{0,900}scaleX\(/,
    'critical hits must not grow outward like a travelling sword beam');
assert.match(huntAnimator, /\['sever', 'blunt', 'counter', 'multi'\]\.includes\(kind\)\) return null/,
    'ordinary contact and counters must not add the old moving arc or green square above impact feedback');
assert.match(huntRenderer, /data-small-monster-index="\$\{index\}"/,
    'small monsters must expose a stable target coordinate for damage numbers');
assert.match(huntRenderer, /renderHunterProbabilityBadges\(hunter = \{\}\)/,
    'combat cards must derive compact hunter-specific probability badges');
['🎯', '💥', '💨', '🛡️', '👁️', '↩️', '🛡️⚡'].forEach(icon => assert.ok(huntRenderer.includes(icon),
    `${icon} probability needs a distinct readable emoji`));
assert.match(css, /"probabilities probabilities probabilities"/,
    'probability badges must occupy the bottom row of each hunter card');
assert.match(css, /\.hunt-probability-badge\s*\{[\s\S]*?white-space:\s*nowrap/,
    'probability badges must remain compact and unbroken in OBS');
const veteranLongSwordRates = perkRenderer.renderHunterProbabilityBadges({
    id: 'long_sword', type: 'melee', personality: 'veteran', perkModifiers: { evadeChance: .10 }
});
assert.match(veteranLongSwordRates, /🎯<\/b>90%/);
assert.match(veteranLongSwordRates, /💥<\/b>60%/);
assert.match(veteranLongSwordRates, /💨<\/b>90%/);
assert.match(veteranLongSwordRates, /👁️<\/b>80%/);
assert.match(veteranLongSwordRates, /⚡<\/b>60%/);
const newbieShieldRates = perkRenderer.renderHunterProbabilityBadges({
    id: 'lance', type: 'shield', personality: 'newbie', perkModifiers: { guardChance: .10 }
});
assert.match(newbieShieldRates, /🛡️<\/b>80%/);
assert.match(newbieShieldRates, /💨<\/b>70%/,
    'shield weapons still need their separately applied evade chance');
assert.match(newbieShieldRates, /🔱<\/b>40%/);
assert.match(perkRenderer.hunterHpBarBackground({ elementalBlights: { poison: 10 } }, 80), /#b84de0/);
assert.match(perkRenderer.hunterHpBarBackground({ elementalBlights: { fire: 10 } }, 80), /#ff5426/);
assert.match(perkRenderer.hunterHpBarBackground({ environmentDotType: 'effluvium' }, 80), /#799b26/);
assert.match(perkRenderer.hunterAtbBarBackground({ elementalBlights: { water: 10 } }), /#28a9ff/);
assert.match(perkRenderer.hunterAtbBarBackground({ elementalBlights: { ice: 10 } }), /#b9efff/);
assert.match(perkRenderer.hunterAtbBarBackground({}), /#ffd84d/);

console.log('[test] Responsive game layout contract passed.');
