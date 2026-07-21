'use strict';

const assert = require('assert');
const {
    HUNT_WEAPON_AUDIO_CUES,
    HUNT_ROAR_ROUTE,
    HUNT_PROTECTED_CLASSIC_AUDIO,
    HUNT_VERIFIED_LOCAL_WEAPON_CUES,
    HUNT_VERIFIED_LOCAL_ITEM_CUES,
    HUNT_VERIFIED_LOCAL_MONSTER_CUES
} = require('../js/effects/hunt/HuntAudioCatalog.js');

assert.deepStrictEqual(HUNT_WEAPON_AUDIO_CUES, {}, 'unverified generic hunt fallbacks must stay disabled');
assert.ok(HUNT_PROTECTED_CLASSIC_AUDIO.includes('Unified_SFX/Potion Drink.mp3'));
assert.strictEqual(HUNT_ROAR_ROUTE.furious_rajang, 'rajang');
assert.strictEqual(HUNT_VERIFIED_LOCAL_ITEM_CUES.lifepowder[0].layers.length, 2);
assert.match(HUNT_VERIFIED_LOCAL_ITEM_CUES.lifepowder[0].evidence, /surrogate/i);

const entries = Object.entries(HUNT_VERIFIED_LOCAL_WEAPON_CUES);
assert.ok(entries.length >= 10, 'verified local weapon catalog must cover the proven core routes');

for (const [route, variants] of entries) {
    assert.match(route, /^[a-z_]+:[a-z_]+$/);
    assert.ok(Array.isArray(variants) && variants.length, `${route} needs at least one variation`);
    for (const variant of variants) {
        assert.ok(variant.label && variant.evidence, `${route} must retain its semantic evidence`);
        assert.ok(Array.isArray(variant.layers) && variant.layers.length, `${route} needs playable layers`);
        for (const [audioPath, volume, delayMs] of variant.layers) {
            assert.match(audioPath, /^local_assets\/monster_hunter\/world\/weapon\//);
            assert.ok(!/gimmick|laser/i.test(audioPath), `${route} must not route gimmick/laser banks`);
            assert.ok(volume > 0 && volume <= 1);
            assert.ok(delayMs >= 0);
        }
    }
}

assert.ok(HUNT_VERIFIED_LOCAL_WEAPON_CUES['bow:dragon_piercer'][0].layers.length >= 2,
    'dragon piercer must keep its labelled shot and hit layers together');

const monsterEntries = Object.entries(HUNT_VERIFIED_LOCAL_MONSTER_CUES);
assert.ok(monsterEntries.length >= 20, 'verified monster catalog must cover the proven World roar set');
for (const [route, variants] of monsterEntries) {
    assert.match(route, /^[a-z0-9_]+:(?:roar|attack|ultimate)$/);
    for (const variant of variants) {
        assert.ok(variant.label && variant.evidence, `${route} must retain exact event evidence`);
        for (const [audioPath, volume, delayMs] of variant.layers) {
            assert.match(audioPath, /^local_assets\/monster_hunter\/world\/monster\//);
            assert.ok(volume > 0 && volume <= 1);
            assert.ok(delayMs >= 0);
        }
    }
}
assert.match(HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:roar'][0].layers[0][0], /\/em001\//,
    'Rathalos must use the explicitly shared Rathian/Rathalos roar instead of the wrong em002 route');
assert.deepStrictEqual(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['jyuratodus:roar'][0].layers,
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['lavasioth:roar'][0].layers,
    'shared monster audio is allowed only where the exact source label names both monsters'
);
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['nargacuga:attack'][0].patternKeywords.includes('꼬리'));
assert.strictEqual(HUNT_VERIFIED_LOCAL_MONSTER_CUES['safi_jiiva:ultimate'][0].layers.length, 2);
assert.strictEqual(HUNT_VERIFIED_LOCAL_MONSTER_CUES['tzitzi_ya_ku:roar'][0].layers.length, 1);
monsterEntries.filter(([route]) => route.endsWith(':roar')).forEach(([route, variants]) => {
    variants.forEach(variant => assert.strictEqual(variant.layers.length, 1, `${route} must be a single isolated voice event`));
});

console.log(`[test] Verified local combat audio catalog passed (${entries.length} weapon, ${monsterEntries.length} monster routes).`);
