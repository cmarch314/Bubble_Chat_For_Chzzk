'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Contract = require('../js/effects/hunt/HuntMonsterKitContract.js');
const Compiler = require('../scripts/compile-monster-kits.js');

const kits = Compiler.readKits();
const manifest = Compiler.compile(kits);
const runtimeIndex = Compiler.compileRuntimeIndex(manifest);
assert.strictEqual(kits.length, 20);
assert.deepStrictEqual(manifest.records.map(record => record.id), [
    'bazelgeuse',
    'chameleos',
    'rathian',
    'rathalos',
    'diablos',
    'black_diablos',
    'legiana',
    'shrieking_legiana',
    'paolumu',
    'nightshade_paolumu',
    'seething_bazelgeuse',
    'tigrex',
    'brute_tigrex',
    'nargacuga',
    'barioth',
    'frostfang_barioth',
    'pink_rathian',
    'gold_rathian',
    'azure_rathalos',
    'silver_rathalos'
]);
assert.ok(manifest.records.every(record => Contract.EDITIONS.includes(record.canonicalEdition)));
assert.strictEqual(manifest.records.find(record => record.id === 'rathalos').canonicalEdition, 'world-iceborne');
assert.strictEqual(manifest.records.find(record => record.id === 'chameleos').canonicalEdition, 'rise-sunbreak');
assert.strictEqual(manifest.records.find(record => record.id === 'black_diablos').variantOf, 'diablos');
const worldFlyingIds = [
    'rathian', 'pink_rathian', 'gold_rathian',
    'rathalos', 'azure_rathalos', 'silver_rathalos',
    'diablos', 'black_diablos',
    'legiana', 'shrieking_legiana',
    'paolumu', 'nightshade_paolumu',
    'bazelgeuse', 'seething_bazelgeuse',
    'tigrex', 'brute_tigrex', 'nargacuga',
    'barioth', 'frostfang_barioth'
];
assert.deepStrictEqual(
    worldFlyingIds.filter(id => !manifest.records.some(record =>
        record.id === id && record.canonicalEdition === 'world-iceborne')),
    [],
    'all 19 World/Iceborne Flying Wyverns must be released through reviewed kits'
);
assert.deepStrictEqual(
    runtimeIndex.monsters.map(monster => monster.id),
    manifest.records.map(record => record.id)
);
assert.ok(runtimeIndex.monsters.every(monster => monster.filename || monster.imagePath));
assert.ok(runtimeIndex.monsters.every(monster =>
    monster.canonicalEdition && monster.releaseReview && monster.mechanicModules.length));

const diablosKit = kits.find(kit => kit.id === 'diablos');
const diablosActions = Compiler.readActionManifest(diablosKit);
assert.ok(diablosActions, 'the golden Diablos kit must own an explicit action approval manifest');
assert.deepStrictEqual(
    diablosActions.manifest.actions.map(action => action.reviewStatus),
    Array(diablosActions.manifest.actions.length).fill('approved'),
    'every Diablos golden action must carry explicit approval rather than inherit it from a normalizer'
);
assert.doesNotThrow(() => Compiler.assertActionManifestMatchesProfile(
    diablosKit,
    require('../js/effects/hunt/HuntMonsterProfiles.js').diablos
));

const invalid = structuredClone(kits[0]);
invalid.release.gates.audio = false;
assert.ok(Contract.validate(invalid).some(error => error.startsWith('release.gates.audio:')));
assert.throws(() => Compiler.compile([...kits, structuredClone(kits[0])]), /duplicate monster kit ID/);

const root = path.resolve(__dirname, '..');
assert.strictEqual(
    fs.readFileSync(Compiler.JSON_OUTPUT, 'utf8'),
    Compiler.jsonText(manifest),
    'the checked-in JSON release manifest must be regenerated after kit changes'
);
assert.strictEqual(
    fs.readFileSync(Compiler.JS_OUTPUT, 'utf8'),
    Compiler.jsText(manifest),
    'the OBS runtime release manifest must be regenerated after kit changes'
);
assert.strictEqual(
    fs.readFileSync(Compiler.RUNTIME_INDEX_OUTPUT, 'utf8'),
    Compiler.runtimeIndexText(runtimeIndex),
    'the compact OBS monster index must be regenerated after roster or kit changes'
);

console.log(`[test] MonsterKit schema and ${manifest.records.length}-monster release manifest passed.`);
