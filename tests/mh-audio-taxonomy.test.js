const assert = require('assert');
const { classifyBank, inferClipPurpose } = require('../scripts/mh-audio-taxonomy');

const wildsWeapon = classifyBank('natives/STM/Sound/Wwise/Wp10_Insect_Cmn_Effect.sbnk.1.X64', 'wilds');
assert.strictEqual(wildsWeapon.category, 'weapon');
assert.strictEqual(wildsWeapon.weaponId, 'insect_glaive');
assert.strictEqual(wildsWeapon.purpose, 'kinsect_action');

const worldRoar = classifyBank('sound/wwise/Windows/em002_vo.nbnk', 'world');
assert.strictEqual(worldRoar.category, 'monster');
assert.strictEqual(worldRoar.monsterId, 'em002');
const unresolvedRoar = inferClipPurpose(worldRoar, 1.9);
assert.strictEqual(unresolvedRoar.actionFamily, 'unknown');
assert.strictEqual(unresolvedRoar.semanticEvidence, null);
assert.strictEqual(unresolvedRoar.reviewHints.durationSeconds, 1.9);
const labelledRoar = inferClipPurpose(worldRoar, {
    duration: 1.9,
    semanticReference: {
        purpose: 'monster_vocal', actionFamily: 'monster_roar', label: 'Rathalos roar', confidence: 'high',
        evidence: { type: 'labelled-community-map', location: 'Bank Index!E1' }
    }
});
assert.strictEqual(labelledRoar.actionFamily, 'monster_roar');
assert.strictEqual(labelledRoar.semanticEvidence.confidence, 'high');

const worldGreatSword = classifyBank('chunkG0/wp/two/two001/sound/snd_two001_bk.wwbk', 'world');
assert.strictEqual(worldGreatSword.category, 'weapon');
assert.strictEqual(worldGreatSword.weaponId, 'great_sword');

const worldHunterVoice = classifyBank('chunkG0/sound/wwise/Windows/pl_act_vo_f_01_m.nbnk', 'world');
assert.strictEqual(worldHunterVoice.category, 'hunter_voice');
assert.strictEqual(worldHunterVoice.group, 'f_01');

const wildsVoice = classifyBank('Player_ActVoice_F02.sbnk.1.X64.Ja', 'wilds');
assert.strictEqual(wildsVoice.category, 'hunter_voice');
assert.strictEqual(wildsVoice.group, 'f02');
assert.strictEqual(wildsVoice.language, 'ja');
assert.strictEqual(inferClipPurpose(wildsVoice, 0.31).actionFamily, 'unknown');

const riseWeapon = classifyBank('pl_wp_g_swd_com_media.bnk.2.X64', 'rise');
assert.strictEqual(riseWeapon.weaponId, 'great_sword');
assert.strictEqual(riseWeapon.category, 'weapon');

console.log('[test] Cross-game Monster Hunter audio taxonomy passed.');
