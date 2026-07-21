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
assert.match(huntRenderer, /updateHunterItemUI\(hunter\)/, 'all three combat item counts need a shared refresh path');
assert.match(huntRenderer, /id="bomb-count-\$\{w\.index\}"/, 'hunter cards must show remaining barrel bombs');
assert.match(huntRenderer, /weapon-icon-resource-glyph/);
assert.match(huntRenderer, /weapon-resource-dock-horn/);
assert.doesNotMatch(huntRenderer, /<b>악보<\/b>/, 'Hunting Horn score should communicate through large note symbols without a redundant label');
assert.match(huntRenderer, /id="horn-buffs-\$\{w\.index\}"/);
assert.match(huntRenderer, /class="weapon-charge-aura"/);
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
assert.match(huntAnimator, /triggerHitAnimation\(idx, w, damage\)\s*\{[\s\S]*?this\.interruptWeaponVisual\(idx, w\)/,
    'hunter hit reactions must interrupt the currently running weapon animation');
assert.match(huntAnimator, /triggerRollAnimation\(idx\)[\s\S]*?querySelector\(`#[^`]* \.game-hunt-weapon-img`\)/,
    'evade rotation must target only the weapon image, never its chat or resource container');
assert.match(huntAnimator, /idxOrMonster === 'monster'[\s\S]*?'skill-bubble monster-skill-bubble'/,
    'monster actions need a dedicated bubble placement class');
assert.match(css, /#monster-showcase-panel > \.monster-skill-bubble\s*\{[\s\S]*?top:\s*4px;[\s\S]*?bottom:\s*auto;/,
    'monster action bubbles must stay below the HP panel inside the showcase');
assert.doesNotMatch(huntAnimator, /triggerRollAnimation\(idx\)[\s\S]{0,300}?game-hunt-weapon-img-container/,
    'evade rotation must not move chat bubbles, Hunting Horn score, or status overlays');
assert.match(css, /\.game-hunt-weapon-img\.roll-anim\s*\{/);
assert.match(huntAnimator, /interruptWeaponVisual\(idx, w\)[\s\S]*?cancelWeaponAnimation\(weaponImg\)[\s\S]*?updateWeaponChargeAuraUI\(idx, w\)/,
    'an interrupted Great Sword charge must immediately return its visual stage to the reset mechanic state');
assert.match(huntEffect, /onInterruptWeaponVisual:[\s\S]*?interruptWeaponVisual\(idx, w\)/,
    'combat defense interruptions must reach the weapon visual cleanup owner');
assert.match(css, /\.weapon-charge-aura\s*\{[\s\S]*?mask-repeat:\s*no-repeat/);
assert.match(css, /\.weapon-charge-stage-3 \.weapon-charge-aura\s*\{[\s\S]*?opacity:\s*0\.19/);
assert.match(css, /\.weapon-great_sword:not\(\.weapon-charge-stage-0\)[\s\S]*?rotate\(-104deg\)/,
    'Great Sword charge pose must not reverse its blade direction in right-side slots');
assert.match(css, /\.hunt-perk-icon\s*\{[\s\S]*?width:\s*28px/);
assert.match(css, /\.hunt-severed-tail img\s*\{\s*width:\s*81px;\s*height:\s*81px/,
    'the severed-tail item image must render at 1.5x its original 54px size');
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-build-line\s*\{[\s\S]*?display:\s*flex/);
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-card\.hunt-loadout-ready\s*\{[\s\S]*?border-color:\s*#62f59c/,
    'ready hunters need a visible locked-in border at 1080p');
assert.match(css, /\.hunt-combat-board \.game-hunt-weapon-card\.hunter-at-camp\s*\{[\s\S]*?opacity:\s*1/,
    'camp entry perks must use an explicit camp placeholder instead of a translucent weapon ghost');
assert.match(css, /\.hunter-at-camp\s*>\s*\*\s*\{[\s\S]*?visibility:\s*hidden/,
    'a hunter who is still at camp must not appear as a semi-transparent combatant');
assert.match(huntRenderer, /dataset\.campLabel/, 'camp placeholders must explain why the hunter is absent');
assert.match(huntRenderer, /🎲 !리롤 ×2/, 'loadout instructions must expose the concise two-use reroll command without ellipsis');
assert.match(huntRenderer, />예약<[\s\S]*!물약 · !가루 · !폭탄 · !숫돌 · !점프 · !귀환옥/, 'combat instructions must expose the compact reservation command line without ellipsis');
assert.match(huntRenderer, /renderSharpnessGauge[\s\S]*?hunt-action-queue/, 'each hunter action queue must render directly below sharpness');
assert.match(huntRenderer, /hunt-action-queue-\$\{w\.index\}/, 'each hunter needs a stable queue UI target');
assert.match(huntRenderer, /monster-showcase-panel[\s\S]*?hunt-combat-reserve-commands[\s\S]*?game-hunt-weapons-grid/,
    'combat reservation commands must sit between the monster showcase and hunter cards, not beside monster HP');
assert.doesNotMatch(css, /\.hunt-combat-reserve-commands\s*\{[^}]*position:\s*absolute/,
    'combat reservation commands must not be pinned beside the monster HP panel');
assert.match(huntRenderer, /hunt-loadout-timer[\s\S]*?hunt-loadout-kicker[\s\S]*?game-title[\s\S]*?hunt-loadout-grid[\s\S]*?hunt-loadout-guide/,
    'loadout timer must render at the very top and command guide below the hunter grid');
assert.match(css, /\.hunt-loadout-board > \.hunt-loadout-timer\s*\{[\s\S]*?font-size:\s*1\.62rem/,
    'top loadout timer must remain prominent at 1080p');
assert.match(css, /\.hunt-loadout-board \.hunt-loadout-guide\s*\{[\s\S]*?font-size:\s*1\.28rem/,
    'bottom loadout commands must remain large enough for OBS capture');
assert.match(css, /\.monster-element-beam\s*\{[\s\S]*?width:\s*var\(--fx-length\)/,
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
assert.ok(HuntPerkSynergyCatalog.recipes.length >= 34, 'perk synergy coverage must extend well beyond the original fourteen groups');
const cartSynergy = HuntPerkSynergyCatalog.group([{ name: '수레 애호가' }, { name: '불굴' }]);
assert.strictEqual(cartSynergy[0].synergy.label, '수레 보험');
assert.strictEqual(perkRenderer.getPerkVisual({ name: '똥' }).icon, '💩', 'the rare empty-roll jackpot needs an unmistakable perk icon');
const dungHTML = perkRenderer.renderPerkBubbles([{ name: '똥', description: '잭팟', modifiers: { attackRate: 1.35 } }], true);
assert.match(dungHTML, />💩</);
assert.match(dungHTML, /hunt-perk-bubble--dung/);
assert.match(css, /\.hunt-perk-bubble--dung\s*\{[\s\S]*?conic-gradient[\s\S]*?hunt-dung-rainbow/,
    'Dung must have an animated rainbow border and multicolor glow');

console.log('[test] Responsive game layout contract passed.');
