'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { includeEntry, scoreWeaponActionEntry } = require('../scripts/generate-local-mh-audio-runtime.js');

const saed = { id: 'charge_blade.saed', audioCue: 'explosive_heavy', dmg: 620 };
const exactSaed = {
    weaponId: 'charge_blade', actionFamily: 'weapon_action', sourceBank: 'wp_caxe_cmn.nbnk',
    semanticEvidence: { label: 'Super amped elemental discharge swing', confidence: 'high' }
};
const unrelated = {
    weaponId: 'charge_blade', actionFamily: 'weapon_action', sourceBank: 'wp_caxe_cmn.nbnk',
    semanticEvidence: { label: 'Reload with no phials', confidence: 'high' }
};
assert.ok(scoreWeaponActionEntry(saed, exactSaed) > scoreWeaponActionEntry(saed, unrelated),
    'semantic action labels must outrank a generic same-weapon bank clip');
assert.strictEqual(includeEntry({
    category: 'hunter_voice', duration: 1.4,
    sourceBank: 'streaming/Sound/Wwise/pl_voice_f_16_media.pck.3.X64.Ja'
}), true, 'Rise main player-voice banks must remain available for spoken combat calls');
assert.strictEqual(includeEntry({
    category: 'hunter_voice', duration: 1.4,
    sourceBank: 'Sound/Wwise/PL_Dia_M01_01_10_m.sbnk.1.X64.Ja'
}), false, 'explicit dialogue banks must stay outside combat voice routing');

const catalogPath = path.resolve(__dirname, '../local_assets/monster_hunter/runtime-catalog.js');
assert.ok(fs.existsSync(catalogPath), 'the ignored OBS runtime audio catalog must be generated locally');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(catalogPath, 'utf8'), context, { filename: catalogPath });
const routes = context.HUNT_LOCAL_WEAPON_ACTION_ROUTES || {};
assert.ok(Object.keys(routes).length >= 90, 'the evidence database must map a substantial action set before generic fallback');
Object.entries(routes).forEach(([actionId, variants]) => {
    assert.ok(variants.length > 0, `${actionId} needs at least one ranked candidate`);
    variants.forEach(variant => {
        assert.ok(fs.existsSync(path.resolve(__dirname, '..', variant.path)), `${actionId} references a missing clip`);
        assert.ok(variant.evidence, `${actionId} must preserve route provenance`);
    });
});

console.log(`[test] Evidence-ranked weapon audio routing passed (${Object.keys(routes).length} actions).`);
