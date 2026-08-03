'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntAudioCatalog = require('../js/effects/hunt/HuntAudioCatalog.js');

global.ManagedTimers = class {
    timeout(callback) { callback(); return 1; }
    clearAll() {}
};
global.HuntBgmResolver = class {};
global.HUNT_VERIFIED_LOCAL_ITEM_CUES = HuntAudioCatalog.HUNT_VERIFIED_LOCAL_ITEM_CUES;
global.HUNT_LOCAL_ITEM_SURROGATE_CUES = HuntAudioCatalog.HUNT_LOCAL_ITEM_SURROGATE_CUES;
global.HUNT_VERIFIED_HIT_CUES = HuntAudioCatalog.HUNT_VERIFIED_HIT_CUES;
global.HUNT_VERIFIED_LOCAL_MONSTER_CUES = HuntAudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES;
const HuntAudioManager = require('../js/effects/hunt/HuntAudioManager.js');

// 1. HuntAudioCatalog verification
assert.ok(!HuntAudioCatalog.HUNT_VERIFIED_LOCAL_ITEM_CUES.barrel_bomb, 'weapon-bank bomb surrogate must not be labelled as verified item evidence');
assert.ok(HuntAudioCatalog.HUNT_LOCAL_ITEM_SURROGATE_CUES.barrel_bomb, 'barrel_bomb spectacle surrogate must be explicit');
assert.ok(HuntAudioCatalog.HUNT_LOCAL_ITEM_SURROGATE_CUES.bomb_fuse, 'bomb_fuse spectacle surrogate must be explicit');
assert.ok(!HuntAudioCatalog.HUNT_LOCAL_ITEM_SURROGATE_CUES.whetstone,
    'the old unlabelled Wilds item-bank guess must not remain on the whetstone route');
assert.strictEqual(HuntAudioCatalog.HUNT_VERIFIED_LOCAL_ITEM_CUES.whetstone_stroke[0].layers.length, 3,
    'confirmed World whetstone strokes must preserve the installed three-stroke sharpening cadence');
assert.strictEqual(HuntAudioCatalog.HUNT_VERIFIED_LOCAL_ITEM_CUES.whetstone_finish[0].layers.length, 1,
    'the confirmed sharpening glint must play once, separately from scraping');
assert.match(HuntAudioCatalog.HUNT_VERIFIED_LOCAL_ITEM_CUES.whetstone_finish[0].evidence, /WEM 52.*838569492/,
    'the sharpening glint route must retain its exact workbook and extracted-source evidence');
assert.ok(HuntAudioCatalog.HUNT_VERIFIED_HIT_CUES.sever_weakspot, 'sever_weakspot hit cue must be defined');
assert.ok(HuntAudioCatalog.HUNT_VERIFIED_HIT_CUES.blunt_weakspot, 'blunt_weakspot hit cue must be defined');
assert.ok(HuntAudioCatalog.HUNT_VERIFIED_HIT_CUES.bounce_hard, 'bounce_hard hit cue must be defined');

// 2. HuntAudioManager routing verification
const manager = new HuntAudioManager();
let playedItem = null;
let playedHit = null;

manager.playVerifiedItemCue = (cue) => {
    playedItem = cue;
    return true;
};
manager.playVerifiedHitCue = (cueKey) => {
    playedHit = cueKey;
    return true;
};
manager.playItemSurrogateCue = (cue) => {
    playedItem = `surrogate:${cue}`;
    return true;
};
let whetstoneContext = null;
manager.playWhetstoneCue = (context) => {
    playedItem = 'verified:whetstone_stroke';
    whetstoneContext = context;
    return true;
};

const telegraphManager = new HuntAudioManager();
let telegraphLayers = null;
telegraphManager.playVerifiedLayers = variant => {
    telegraphLayers = variant.layers;
    return true;
};
assert.strictEqual(telegraphManager.playVerifiedMonsterCue('rathalos', 'telegraph', {
    patternId: 'rathalos.fireball',
    durationTicks: 12
}), true);
assert.deepStrictEqual(telegraphLayers.map(layer => layer[2]), [0],
    'the confirmed Rath fireball charge vocal must begin with the authored telegraph');
assert.strictEqual(telegraphManager.playVerifiedMonsterCue('rathian', 'telegraph', {
    patternId: 'rathian.somersault',
    patternName: '독가시 서머솔트',
    durationTicks: 12
}), true);
assert.ok(
    /(?:027_137441638|047_287664299)\.mp3$/.test(telegraphLayers[0][0]),
    'Rathian somersault must resolve to one of the two user-tag-confirmed voices'
);
const monsterTurnSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
assert.match(monsterTurnSource, /playSFX\?\.\('monster_telegraph'[\s\S]{0,260}?durationTicks:\s*windupTicks/,
    'monster preparation must send the real authored windup to the telegraph audio route');

// Barrel bomb SFX routing
manager.playMHAsset('barrel_bomb', null, { hunterIndex: 0 });
assert.strictEqual(playedItem, 'surrogate:barrel_bomb', 'barrel_bomb must route through the explicitly unverified surrogate path');
manager.playMHAsset('bomb_fuse', null, { hunterIndex: 0 });
assert.strictEqual(playedItem, 'surrogate:bomb_fuse', 'bomb_fuse must route through the explicitly unverified surrogate path');
manager.playMHAsset('whetstone', null, { hunterIndex: 0, durationTicks: 30 });
assert.strictEqual(playedItem, 'verified:whetstone_stroke', 'whetstone must route through the confirmed World sharpening stroke');
assert.strictEqual(whetstoneContext.durationTicks, 30, 'whetstone audio cadence must receive the real item-lock duration');
manager.playMHAsset('whetstone_finish', null, { hunterIndex: 0 });
assert.strictEqual(playedItem, 'whetstone_finish', 'successful restoration must route to the separate confirmed completion glint');

const cadenceManager = new HuntAudioManager();
const cadenceDelays = [];
const cadencePlays = [];
cadenceManager.timers.timeout = (callback, delay) => {
    cadenceDelays.push({ callback, delay });
    return cadenceDelays.length;
};
cadenceManager.playLocalEntry = entry => cadencePlays.push(entry.path);
assert.strictEqual(cadenceManager.playWhetstoneCue({ hunterIndex: 2, durationTicks: 30 }), true);
assert.deepStrictEqual(cadenceDelays.map(item => item.delay), [1228, 2456],
    'three confirmed sharpening strokes must span the 3-second action before the completion glint');
assert.strictEqual(cadencePlays.length, 1, 'the first sharpening stroke must play immediately');
cadenceManager.cancelWhetstoneCue(2);
cadenceDelays.forEach(item => item.callback());
assert.strictEqual(cadencePlays.length, 1,
    'interrupting sharpening must invalidate every delayed scraping stroke');

const turnExecutorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
assert.match(turnExecutorSource, /playSFX\('whetstone'[\s\S]{0,220}?durationTicks:\s*w\.itemDuration/,
    'the sharpening action must pass its perk-adjusted duration into audio timing');
assert.match(turnExecutorSource, /WHETSTONE_ITEM_VISUAL[\s\S]*?426326752\.png[\s\S]*?sourceNameJa:\s*'砥石'/,
    'sharpening start must retain the audited Rise whetstone item identity');
assert.match(turnExecutorSource, /showSkillBubble\(w\.index,\s*\{[\s\S]{0,220}WHETSTONE_ITEM_VISUAL/,
    'sharpening start must show its extracted whetstone item before completion');
const battleTickSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
assert.match(battleTickSource, /pendingSharpnessRestore[\s\S]{0,260}?playSFX\?\.\('whetstone_finish'/,
    'the completion glint must fire only when pending sharpness is actually restored');
assert.match(battleTickSource, /showSkillBubble\(w\.index,\s*'예리도 회복!'\)/,
    'successful sharpening must finish with the exact recovery phrase');

assert.match(monsterTurnSource, /audioPhase:\s*'action-start'/,
    'monster action entry must request vocal-only audio');
assert.match(monsterTurnSource, /requiresDelayedImpact\(pattern\)[\s\S]*?return;[\s\S]*?audioPhase:\s*'impact'/,
    'monster SE must be requested after delayed-impact scheduling and therefore at the committed impact');
assert.match(monsterTurnSource, /audioPhase:\s*'impact'[\s\S]*?targetsToHit\.forEach/,
    'monster impact SE must be aligned with the same execution pass that resolves hunter hits');

const legianaBreathSe = manager.verifiedMonsterCue('legiana', 'attack', {
    patternId: 'legiana.aerial_cold_sweep',
    patternName: '냉기 휘쓸기',
    patternType: 'area',
    patternTags: ['flight-only', 'ice', 'elemental'],
    patternDelivery: 'gas',
    audioPhase: 'impact'
});
assert.ok(legianaBreathSe, 'Legiana cold release must resolve the reviewed breath event group');
assert.match(legianaBreathSe.sourceBank, /^em111(?:_05)?_se$/,
    'the cold release frame must select reviewed Legiana SE rather than a vocal layer');
assert.strictEqual(manager.monsterCueLayersForPhase(legianaBreathSe, 'action-start').length, 0,
    'the reviewed release SE must not play at action preparation');
assert.match(monsterTurnSource, /patternTags:\s*pattern\.tags[\s\S]{0,100}?patternDelivery:\s*pattern\.delivery/,
    'monster actions must pass authored delivery semantics into audio routing');

// Weakspot sever hit routing
manager.playMHAsset('hit_impact', null, { weaponType: 'sever', hitzoneValue: 65 });
assert.strictEqual(playedHit, 'sever_weakspot', 'hitzone 65 sever should trigger sever_weakspot');

// Normal blunt hit routing
manager.playMHAsset('hit_impact', null, { weaponType: 'blunt', hitzoneValue: 35 });
assert.strictEqual(playedHit, 'blunt_normal', 'hitzone 35 blunt should trigger blunt_normal');

// Bounce hard hit routing
manager.playMHAsset('hit_impact', null, { weaponType: 'sever', hitzoneValue: 15 });
assert.strictEqual(playedHit, 'bounce_hard', 'hitzone 15 should trigger bounce_hard');

// Projectile/explosive animation semantics must resolve to an existing ranged cue family.
manager.playMHAsset('hit_impact', null, { weaponType: 'projectile', hitzoneValue: 35 });
assert.strictEqual(playedHit, 'ranged_normal', 'projectile normal hit should resolve to ranged_normal');
manager.playMHAsset('hit_impact', null, { weaponType: 'explosive', hitzoneValue: 65 });
assert.strictEqual(playedHit, 'ranged_weakspot', 'explosive hit should resolve to the available ranged impact family');

// Guard the combat-side regression without requiring a browser DOM in this unit test.
const animatorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
assert.match(animatorSource, /descriptor\?\.type === 'item'[\s\S]*?skill-bubble-item-image[\s\S]*?dataset\.itemSourceId/,
    'item bubbles must render a provenance-bearing image rather than raw HTML');
assert.match(animatorSource, /profile\.impact\s*&&\s*hitContext\?\.resolved/, 'impact feedback must require a resolved damaging strike');
assert.doesNotMatch(animatorSource, /owner\.currentHitzone/, 'impact feedback must not read an unset global currentHitzone value');

console.log('[test] Precision hit and bomb audio timing contracts passed successfully.');
