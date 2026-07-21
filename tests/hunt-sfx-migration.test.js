'use strict';

const assert = require('assert');
const { buildManifest, classify } = require('../scripts/build-hunt-sfx-migration.js');

assert.deepStrictEqual(classify('SFX/MonsterHunter_Hunters/mh_slash_hit.mp3', new Set()),
    { decision: 'retire', class: 'legacy-unverified' });
assert.deepStrictEqual(classify('MonsterHunter_Soundtracks/Unified_SFX/Potion Drink.mp3', new Set()),
    { decision: 'keep', class: 'protected-potion' });

const manifest = buildManifest();
assert.ok(manifest.fingerprint && manifest.entries.length > 0);
assert.ok(manifest.entries.some(entry => entry.class === 'verified-local-extract'));
assert.ok(!manifest.entries.some(entry => entry.reference === 'SFX/MonsterHunter_Hunters/mh_slash_hit.mp3'),
    'retired generic hit files must no longer be live hunt catalog references');

console.log(`[test] Hunt SFX migration inventory passed (${manifest.entries.length} live references).`);
