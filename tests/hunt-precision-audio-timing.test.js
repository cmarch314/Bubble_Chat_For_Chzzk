'use strict';

const assert = require('assert');
const HuntAudioCatalog = require('../js/effects/hunt/HuntAudioCatalog.js');
const HuntAudioManager = require('../js/effects/hunt/HuntAudioManager.js');

// 1. HuntAudioCatalog verification
assert.ok(HuntAudioCatalog.HUNT_VERIFIED_LOCAL_ITEM_CUES.barrel_bomb, 'barrel_bomb item cue must be defined');
assert.ok(HuntAudioCatalog.HUNT_VERIFIED_LOCAL_ITEM_CUES.bomb_fuse, 'bomb_fuse item cue must be defined');
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

// Barrel bomb SFX routing
manager.playMHAsset('barrel_bomb', null, { hunterIndex: 0 });
assert.strictEqual(playedItem, 'barrel_bomb', 'barrel_bomb should trigger playVerifiedItemCue("barrel_bomb")');

// Weakspot sever hit routing
manager.playMHAsset('hit_impact', null, { weaponType: 'sever', hitzoneValue: 65 });
assert.strictEqual(playedHit, 'sever_weakspot', 'hitzone 65 sever should trigger sever_weakspot');

// Normal blunt hit routing
manager.playMHAsset('hit_impact', null, { weaponType: 'blunt', hitzoneValue: 35 });
assert.strictEqual(playedHit, 'blunt_normal', 'hitzone 35 blunt should trigger blunt_normal');

// Bounce hard hit routing
manager.playMHAsset('hit_impact', null, { weaponType: 'sever', hitzoneValue: 15 });
assert.strictEqual(playedHit, 'bounce_hard', 'hitzone 15 should trigger bounce_hard');

console.log('[test] Precision hit and bomb audio timing contracts passed successfully.');
