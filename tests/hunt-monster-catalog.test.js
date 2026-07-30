'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog');
global.window = global;
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
require('../js/effects/hunt/data/WildsMonsterBehavior.generated.js');
require('../js/effects/hunt/data/RiseMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldShellBehavior.generated.js');
require('../js/effects/hunt/data/MhxxMonsterBehavior.generated.js');
require('../js/effects/hunt/data/MhxxDbMonsterBehavior.generated.js');
require('../js/effects/hunt/data/PublishedMonsterBehavior.js');

const root = path.resolve(__dirname, '..');
const monsters = require('../img/monsters/monsters.json');
const reference = require('../data/hunt/monster-reference.generated.json');
const mhgu = require('../data/hunt/mhgu-monsters.generated.json');
const wilds = require('../data/hunt/wilds-game-reference.json');
const identifiers = require('../game_extracts/tools/wilds-monster-identifiers.json');

assert.ok(monsters.length >= 264, 'the merged catalog must include the complete MHGU expansion');
assert.strictEqual(new Set(monsters.map(row => row.id)).size, monsters.length, 'runtime monster IDs must be unique');
const selectable = monsters.filter(row => row.selectable !== false);
assert.ok(selectable.length >= 258);
assert.ok(selectable.every(row => row.nameEN && row.nameKO && row.evidence));
assert.ok(selectable.every(row => ['small', 'medium', 'large', 'elder', 'colossal'].includes(row.tier)));
assert.ok(selectable.every(row => row.filename || row.imagePath), 'every selectable row needs media or an explicit placeholder');
assert.ok(monsters.filter(row => ['Felyne', 'Gajalaka', 'Grimalkyne', 'Boaboa'].includes(row.nameEN))
    .every(row => row.selectable === false), 'settlement allies must not leak into the combat pool');

const gameCount = game => monsters.filter(row => row.games?.includes(game)).length;
assert.ok(gameCount('world-iceborne') >= 48);
assert.strictEqual(gameCount('generations-ultimate'), 129);
assert.strictEqual(gameCount('rise-sunbreak'), 112);
assert.strictEqual(gameCount('wilds'), 34);
assert.strictEqual(reference.monsters.filter(row => row.game === 'rise-sunbreak').length, 112);
assert.ok(reference.monsters.filter(row => row.game === 'world-iceborne').length >= 48);
assert.strictEqual(mhgu.monsters.length, 129, 'MHGUDB snapshot must preserve all 129 monsters');
assert.deepStrictEqual(mhgu.counts, {
    monsters: 129,
    small: 36,
    large: 93,
    habitats: 303,
    parts: 893,
    statuses: 728
});
for (const row of mhgu.monsters) {
    const runtime = monsters.find(monster => monster.nameEN === row.nameEN);
    assert.ok(runtime?.games.includes('generations-ultimate'), `${row.nameEN} must retain its MHGU appearance`);
    assert.strictEqual(runtime.sourceIds['generations-ultimate'], row.sourceId);
    assert.ok(runtime.filename || runtime.imagePath, `${row.nameEN} must resolve an icon`);
    if (row.kind !== 'small') {
        assert.ok(runtime.baseHealth > 0, `${row.nameEN} must retain MHGU base health`);
    }
}
assert.ok(mhgu.monsters.reduce((sum, row) => sum + row.parts.length, 0) === 893,
    'full MHGU hitzones stay in the analysis snapshot instead of bloating OBS');
assert.ok(mhgu.monsters.reduce((sum, row) => sum + row.statuses.length, 0) === 728,
    'full MHGU status thresholds stay in the analysis snapshot instead of bloating OBS');
assert.ok(monsters.every(row => !row.hitzones && !row.statusThresholds),
    'bulk MHGU mechanics must not be duplicated into the compact OBS roster');

const exactWilds = identifiers.identifiers.filter(row => row.publicMonsterId && row.nameEn && row.nameKo);
assert.strictEqual(exactWilds.length, 34, 'installed EmID to public game ID joins must stay complete');
assert.strictEqual(wilds.monsters.length, 34, 'Wilds anatomy reference must cover every exact join');
for (const row of exactWilds) {
    const runtime = monsters.find(monster => monster.nameEN === row.nameEn);
    assert.ok(runtime?.games.includes('wilds'), `${row.nameEn} must be routed into the runtime catalog`);
    assert.strictEqual(runtime.nameKO, row.nameKo);
    assert.ok(runtime.weaknesses.length > 0, `${row.nameEn} must retain extracted weakness data`);
}

for (const row of selectable.filter(row => row.imagePath?.startsWith('local_assets/'))) {
    assert.ok(fs.existsSync(path.join(root, row.imagePath)), `${row.nameEN} local reference icon is missing`);
}
const placeholders = selectable.filter(row => row.mediaEvidence === 'explicit-placeholder-no-verified-icon');
assert.deepStrictEqual(placeholders, [], 'every selectable monster must have a verified local image');

const patterns = HuntMonsterPatternCatalog.build({}, monsters);
assert.deepStrictEqual(HuntMonsterPatternCatalog.validate(patterns), []);
for (const row of selectable) {
    const runtimeId = row.id.replace(/[-']/g, '_');
    const kit = patterns[runtimeId] || [];
    const exactSourceKit = kit.length > 0 && kit.every(pattern =>
        !pattern.evidence?.startsWith('species-archetype:'));
    assert.ok(kit.length >= (exactSourceKit ? 1 : 3), `${row.nameEN} needs a non-empty validated pattern kit`);
    assert.ok(kit.every(pattern => pattern.evidence),
        `${row.nameEN} every move must disclose exact or fallback evidence`);
}

console.log('[test] merged Monster Hunter roster, media, evidence, tiers, and fallback kits passed.');
