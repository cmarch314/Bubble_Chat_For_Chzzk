'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
    HUNT_WEAPON_AUDIO_CUES,
    HUNT_ROAR_ROUTE,
    HUNT_MONSTER_VOICE_FAMILY_ROUTES,
    HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES,
    HUNT_WORLD_MONSTER_SILENT_VOICE_IDS,
    HUNT_PROTECTED_CLASSIC_AUDIO,
    HUNT_VERIFIED_LOCAL_WEAPON_CUES,
    HUNT_VERIFIED_LOCAL_ITEM_CUES,
    HUNT_VERIFIED_LOCAL_MONSTER_CUES
} = require('../js/effects/hunt/HuntAudioCatalog.js');
const {
    HUNT_WORLD_MONSTER_ROAR_REVIEW
} = require('../js/effects/hunt/data/WorldMonsterRoarRoutes.generated.js');

assert.deepStrictEqual(HUNT_WEAPON_AUDIO_CUES, {}, 'unverified generic hunt fallbacks must stay disabled');
assert.ok(HUNT_PROTECTED_CLASSIC_AUDIO.includes('Unified_SFX/Potion Drink.mp3'));
assert.strictEqual(HUNT_ROAR_ROUTE.furious_rajang, 'rajang');
assert.ok(!HUNT_WORLD_MONSTER_SILENT_VOICE_IDS.includes('rajang'),
    'decoded Rajang VO must remain available for event-group review');
assert.match(
    fs.readFileSync(path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntAudioManager.js'), 'utf8'),
    /'charge_stride_step'/,
    'the dedicated Tigrex stride route must not collapse into the broad attack pool'
);
assert.strictEqual(HUNT_ROAR_ROUTE.rathian, 'rathalos',
    'Rathian roar playback must resolve through the exact Rathalos route');
assert.strictEqual(HUNT_VERIFIED_LOCAL_ITEM_CUES.flash_pod[0].label, 'Flash pod explosion');
assert.match(HUNT_VERIFIED_LOCAL_ITEM_CUES.flash_pod[0].evidence, /2588333717.*584946289/);
assert.match(HUNT_VERIFIED_LOCAL_ITEM_CUES.flash_pod[0].layers[0][0], /_051_584946289\.mp3$/);
assert.strictEqual(HUNT_VERIFIED_LOCAL_ITEM_CUES.flash_pod[0].layers.length, 1,
    'flash pod must use only its exact explosion source, without reload or unrelated impact layers');
assert.strictEqual(HUNT_VERIFIED_LOCAL_ITEM_CUES.lifepowder[0].layers.length, 2);
assert.match(HUNT_VERIFIED_LOCAL_ITEM_CUES.lifepowder[0].evidence, /surrogate/i);
for (const tag of ['wing_flap', 'physical_attack', 'physical_impact']) {
    const variants = HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES[tag];
    assert.ok(Array.isArray(variants) && variants.length, `${tag} needs an audition-confirmed fallback pool`);
    for (const variant of variants) {
        assert.strictEqual(variant.temporaryFallback, true);
        assert.strictEqual(variant.reuseScope, 'cross-species-semantic-se');
        assert.strictEqual(variant.evidence, 'world-user-audition-semantic-se-fallback');
        assert.ok(variant.layers.every(([audioPath]) =>
            audioPath.includes('_se_') && !audioPath.includes('_vo_')),
        `${tag} must contain SE only`);
    }
}

const entries = Object.entries(HUNT_VERIFIED_LOCAL_WEAPON_CUES);
assert.ok(entries.length >= 10, 'verified local weapon catalog must cover the proven core routes');

for (const [route, variants] of entries) {
    assert.match(route, /^[a-z_]+:[a-z_]+[a-z0-9_]*$/);
    assert.ok(Array.isArray(variants) && variants.length, `${route} needs at least one variation`);
    for (const variant of variants) {
        assert.ok(variant.label && variant.evidence, `${route} must retain its semantic evidence`);
        assert.ok(Array.isArray(variant.layers) && variant.layers.length, `${route} needs playable layers`);
        for (const [audioPath, volume, delayMs] of variant.layers) {
            assert.match(audioPath, /^local_assets\/monster_hunter\/world\/(?:weapon\/|unknown\/common\/pl_prop_cmn_nbnk_104_449143534\.mp3$)/);
            assert.ok(!/gimmick|laser/i.test(audioPath), `${route} must not route gimmick/laser banks`);
            assert.ok(volume > 0 && volume <= 1);
            assert.ok(delayMs >= 0);
        }
    }
}

assert.ok(HUNT_VERIFIED_LOCAL_WEAPON_CUES['bow:dragon_piercer'][0].layers.length >= 2,
    'dragon piercer must keep its labelled shot and hit layers together');
assert.strictEqual(HUNT_VERIFIED_LOCAL_WEAPON_CUES['bow:bow_charge_start'], undefined,
    'bow draw must stay silent instead of restoring a string-pull or charge-air surrogate');
const bowStep = HUNT_VERIFIED_LOCAL_WEAPON_CUES['bow:bow_charge_step'][0];
assert.strictEqual(bowStep.label, 'Quick dash begin/stop');
assert.match(bowStep.layers[0][0], /pl_prop_cmn_nbnk_104_449143534/);
assert.ok(bowStep.maxDurationMs > 0 && bowStep.maxDurationMs <= 700,
    'charging sidestep must stop inside its movement window');
assert.ok(!/string pull|304692171/i.test(`${bowStep.label} ${bowStep.evidence} ${bowStep.layers[0][0]}`),
    'charging sidestep must never reuse the rejected bow draw source');
assert.match(HUNT_VERIFIED_LOCAL_WEAPON_CUES['great_sword:charge_tier_1'][0].layers[0][0], /_010_739955564/);
assert.match(HUNT_VERIFIED_LOCAL_WEAPON_CUES['great_sword:charge_tier_2'][0].layers[0][0], /_002_285500585/);
assert.match(HUNT_VERIFIED_LOCAL_WEAPON_CUES['great_sword:charge_tier_3'][0].layers[0][0], /_009_701005050/,
    'each Great Sword charge stage must remain pinned to its exact labelled event');

const monsterEntries = Object.entries(HUNT_VERIFIED_LOCAL_MONSTER_CUES);
assert.ok(monsterEntries.length >= 3, 'verified monster catalog must retain proven attack and audition-confirmed routes');
for (const [route, variants] of monsterEntries) {
    assert.match(route, /^[a-z0-9_]+:(?:roar|attack|ultimate|burrow|telegraph|knockdown|trap|flinch|death|blast_scale_explosion|charge_stride_step|projectile_launch)$/);
    for (const variant of variants) {
        assert.ok(variant.label && variant.evidence, `${route} must retain exact event evidence`);
        for (const [audioPath, volume, delayMs] of variant.layers) {
            assert.match(audioPath, /^local_assets\/monster_hunter\/world\/monster\//);
            assert.ok(volume > 0 && volume <= 1);
            assert.ok(delayMs >= 0);
        }
    }
}
assert.match(HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:roar'][0].layers[0][0], /091_721725382/,
    'Rathalos must use the user-audition-confirmed signature roar');
assert.match(HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathian:roar'][0].layers[0][0], /091_721725382/,
    'Rathian must use the same user-confirmed shared roar as Rathalos');
assert.strictEqual(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathian:roar'][0].layers[0][0],
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:roar'][0].layers[0][0],
    'the Rath pair must never drift onto separate roar clips'
);
assert.strictEqual(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathian:roar'],
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:roar'],
    'Rathian must alias the exact audition-confirmed Rathalos roar route'
);
assert.deepStrictEqual(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathian:telegraph']
        .filter(variant => variant.patternKeywords?.includes('somersault'))
        .map(variant => variant.layers[0][0]),
    [
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_027_137441638.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_047_287664299.mp3'
    ],
    'Rathian somersault must use both clips from the user-tagged VO event as random variants'
);
assert.ok(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathian:telegraph']
        .filter(variant => variant.patternKeywords?.includes('somersault'))
        .every(variant => !variant.layers.some(([audioPath]) => audioPath.includes('291684548'))),
    'the generic aerial vocal must not remain hardcoded as Rathian somersault audio'
);
assert.ok(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:telegraph']
        .every(variant => !variant.layers.some(([audioPath]) => audioPath.includes('137441638'))),
    'the corrected somersault vocal must not remain routed as a Rathalos fireball cue'
);
assert.deepStrictEqual(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:attack']
        .filter(variant => variant.patternKeywords?.includes('bite'))
        .map(variant => variant.layers[0][0]),
    [
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_042_249895042.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_124_948696462.mp3'
    ],
    'both user-grouped Rathalos bite voices must remain in the random variant pool'
);
const rathalosAerialVariants = HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:attack']
    .filter(variant => variant.patternKeywords?.includes('glide'));
assert.ok(rathalosAerialVariants.length >= 8,
    'reviewed aerial vocals and installed wing flaps must remain independent random variants');
assert.ok(rathalosAerialVariants.every(variant => variant.layers.length === 1),
    'the same aerial vocal must not be fixed above every random wing-flap candidate');
const rathalosAerialVoicePaths = rathalosAerialVariants
    .filter(variant => variant.layers[0][0].includes('_vo_'))
    .map(variant => variant.layers[0][0]);
assert.strictEqual(new Set(rathalosAerialVoicePaths).size, rathalosAerialVoicePaths.length,
    'review compilation must not duplicate an existing aerial voice path');
for (const requiredPath of [
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_107_840416626.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_046_267272460.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_105_829711342.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_109_846481219.mp3'
]) assert.ok(rathalosAerialVoicePaths.includes(requiredPath),
    `the aerial voice pool must retain ${requiredPath}`);
assert.match(HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:death'][0].layers[0][0], /045_265716738/);
assert.match(HUNT_VERIFIED_LOCAL_MONSTER_CUES['diablos:roar'][0].layers[0][0], /056_543762063/,
    'Diablos must use the audition-confirmed signature roar');
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['tigrex:roar'].some(variant =>
    variant.layers.some(([audioPath]) => /em032(?:_01)?_vo_/.test(audioPath))),
    'Tigrex must retain at least one audition-confirmed vocal roar clip');
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['bazelgeuse:roar'].some(variant =>
    variant.layers.some(([audioPath]) => /em118_vo_/.test(audioPath))),
    'Bazelgeuse must retain its recovered audition-confirmed roar route');
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['bazelgeuse:attack'].some(variant =>
    variant.layers.some(([audioPath]) => /em118_vo_/.test(audioPath))),
    'Bazelgeuse attack actions must retain their recovered species-bound voice pool');
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['seething_bazelgeuse:roar'].some(variant =>
    variant.layers.some(([audioPath]) => /em118_vo_/.test(audioPath))),
    'Seething Bazelgeuse must inherit only the base-species reviewed voice');
assert.match(HUNT_VERIFIED_LOCAL_MONSTER_CUES['diablos:burrow'][0].layers[0][0], /056_205431218/,
    'Diablos burrow must use the user-confirmed ground rumble');
assert.strictEqual(HUNT_VERIFIED_LOCAL_MONSTER_CUES['yian_garuga:roar'].length, 1,
    'Yian Garuga must retain its audition-confirmed roar route');
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['yian_garuga:attack'].length >= 40,
    'Yian Garuga must expose the completed audition mapping to combat audio routing');
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['yian_garuga:attack'].some(variant =>
    variant.semanticTag === 'breath'),
    'Yian Garuga breath vocals must remain distinguishable from physical attack vocals');
for (const kind of ['roar', 'attack', 'flinch', 'death', 'trap']) {
    const baseVoicePaths = HUNT_VERIFIED_LOCAL_MONSTER_CUES[`tigrex:${kind}`]
        .flatMap(variant => variant.layers.map(layer => layer[0]))
        .filter(audioPath => audioPath.includes('_vo_'));
    const variantVoicePaths = HUNT_VERIFIED_LOCAL_MONSTER_CUES[`brute_tigrex:${kind}`]
        .flatMap(variant => variant.layers.map(layer => layer[0]))
        .filter(audioPath => audioPath.includes('_vo_'));
    assert.deepStrictEqual(
        variantVoicePaths,
        baseVoicePaths,
        `Brute Tigrex must share the audition-confirmed Tigrex ${kind} voice pool`
    );
}
for (const [variantId, baseId] of Object.entries(HUNT_MONSTER_VOICE_FAMILY_ROUTES)) {
    for (const kind of ['roar', 'attack', 'telegraph', 'knockdown', 'trap', 'flinch', 'death']) {
        const baseRoute = HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${baseId}:${kind}`] || [];
        const expectedVoicePaths = baseRoute
            .flatMap(variant => variant.layers.map(layer => layer[0]))
            .filter(audioPath => audioPath.includes('_vo_'));
        if (!expectedVoicePaths.length) continue;
        const variantVoicePaths = HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${variantId}:${kind}`]
            .flatMap(variant => variant.layers.map(layer => layer[0]))
            .filter(audioPath => audioPath.includes('_vo_'));
        assert.deepStrictEqual(
            variantVoicePaths,
            expectedVoicePaths,
            `${variantId} must inherit the ${baseId} ${kind} voice pool`
        );
    }
}
assert.match(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['jyuratodus:roar'][0].layers[0][0],
    /em036_vo_nbnk_026_197342589\.mp3$/,
    'the saved user-audition event group must supersede the older ambiguous-workbook silence rule'
);
assert.strictEqual(
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['jyuratodus:roar'][0].evidence,
    'world-user-audition-event-group'
);
assert.strictEqual(HUNT_VERIFIED_LOCAL_MONSTER_CUES['tzitzi_ya_ku:roar'], undefined,
    'multi-part roar notes must not collapse into an arbitrary runtime clip');
assert.ok(HUNT_WORLD_MONSTER_ROAR_REVIEW.some(entry =>
    entry.bank === 'em007_vo' && entry.status === 'user-confirmed'));
assert.ok(HUNT_WORLD_MONSTER_ROAR_REVIEW.some(entry =>
    entry.bank === 'em024_vo' && entry.status === 'needs-audition'));
assert.ok(HUNT_VERIFIED_LOCAL_MONSTER_CUES['nargacuga:attack'][0].patternKeywords.includes('꼬리'));
assert.strictEqual(HUNT_VERIFIED_LOCAL_MONSTER_CUES['safi_jiiva:ultimate'][0].layers.length, 2);
monsterEntries.filter(([route]) => route.endsWith(':roar')).forEach(([route, variants]) => {
    variants.forEach(variant => assert.strictEqual(variant.layers.length, 1, `${route} must be a single isolated voice event`));
});

console.log(`[test] Verified local combat audio catalog passed (${entries.length} weapon, ${monsterEntries.length} monster routes).`);
