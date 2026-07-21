const assert = require('assert');
const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');

const catalog = HuntMonsterPatternCatalog.build({
    test_monster: ['괴수의 포효', '돌진 몸통박치기', '화염 브레스', '대재앙 대폭발']
});
assert.deepStrictEqual(HuntMonsterPatternCatalog.validate(catalog), []);
assert.strictEqual(catalog.test_monster[0].type, 'roar');
assert.strictEqual(catalog.test_monster[0].damageRatio, 0);
assert.strictEqual(catalog.test_monster[1].type, 'charge');
assert.ok(catalog.test_monster[3].damageRatio > catalog.test_monster[1].damageRatio);
assert.ok(catalog.test_monster[3].recoveryTicks > catalog.test_monster[1].recoveryTicks);
assert.strictEqual(catalog.test_monster[3].damageRatio, 0.90);
assert.strictEqual(catalog.test_monster[3].minTargets, 4);
assert.strictEqual(catalog.test_monster[3].maxTargets, 4);

const selector = new HuntMonsterPatternSelector(() => 0);
const monster = { id: 'test_monster' };
const first = selector.select(monster, catalog.test_monster, { state: 'normal' });
const second = selector.select(monster, catalog.test_monster, { state: 'normal' });
assert.notStrictEqual(first.id, second.id, 'the selector should not immediately repeat a pattern');
assert.ok(!first.tags.includes('ultimate'), 'ultimates should be reserved for enraged state when alternatives exist');

const smallSelector = new HuntMonsterPatternSelector(() => 0);
const smallPick = smallSelector.select(monster, catalog.test_monster, { state: 'normal', monsterTier: 'small' });
assert.notStrictEqual(smallPick.type, 'roar', 'small monsters must never select roar patterns');

const pitySelector = new HuntMonsterPatternSelector(() => 0.99);
let pityPick = null;
for (let turn = 0; turn < 5; turn++) {
    pitySelector.cooldowns.clear();
    pityPick = pitySelector.select(monster, catalog.test_monster, { state: 'enraged', hpRatio: .5 });
}
assert.ok(pityPick.tags.includes('ultimate'), 'an enraged monster must use its available ultimate by the fifth eligible turn');
const postUltimate = pitySelector.select(monster, catalog.test_monster, {
    state: 'enraged', hpRatio: .5, ultimateUsedInRage: true
});
assert.ok(!postUltimate.tags.includes('ultimate'), 'an ultimate may occur only once in the same rage phase');

const curated = HuntMonsterPatternCatalog.build({ rathalos: ['placeholder'] }).rathalos;
assert.strictEqual(curated.length, 5);
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.aerial_barrage').requiredState, 'enraged');
for (const monsterId of ['rathian', 'rathalos', 'gore_magala', 'seregios', 'mizutsune', 'lagiacrus']) {
    const extracted = HuntMonsterPatternCatalog.build({})[monsterId];
    assert.strictEqual(extracted.length, 5, `${monsterId} needs a compact extracted pattern kit`);
    assert.ok(extracted.every(pattern => pattern.sourceActionClass && pattern.evidence === 'installed-game-action-class'));
}
const valstraxPatterns = HuntMonsterPatternCatalog.build({ valstrax: ['placeholder'] }).valstrax;
assert.ok(!valstraxPatterns.some(pattern => pattern.id === 'valstrax.ambush'),
    'Crimson Comet Ambush must exist only in the dedicated disappear-and-land state machine');
const rosterFallback = HuntMonsterPatternCatalog.build({}, [
    { id: 'anjanath', nameKO: '안쟈나프' },
    { id: 'jagras', nameKO: '쟈그라스' }
]);
assert.strictEqual(rosterFallback.anjanath.length, 5);
assert.strictEqual(rosterFallback.jagras.length, 3);
assert.ok(rosterFallback.anjanath.every(pattern => pattern.evidence.startsWith('web-reference:')));
const variants = HuntMonsterPatternCatalog.build({});
assert.strictEqual(variants.silver_rathalos.length, 5);
assert.ok(variants.silver_rathalos.every(pattern => pattern.confidence === 'variant-curated'));
assert.ok(variants.silver_rathalos[1].damageRatio > variants.rathalos[1].damageRatio);

global.window = global;
require('../js/effects/MonsterData.js');
const fullRosterCatalog = HuntMonsterPatternCatalog.build({}, window.MONSTER_DATA);
assert.strictEqual(Object.keys(fullRosterCatalog).length, window.MONSTER_DATA.length);
assert.deepStrictEqual(HuntMonsterPatternCatalog.validate(fullRosterCatalog), []);
for (const entry of window.MONSTER_DATA) {
    const runtimeId = entry.id.replace(/[-']/g, '_');
    assert.ok(fullRosterCatalog[runtimeId]?.length >= 3, `${entry.id} needs a complete combat pattern kit`);
    const ultimate = fullRosterCatalog[runtimeId].find(pattern => pattern.tags?.includes('ultimate'));
    if (ultimate) {
        assert.strictEqual(ultimate.damageRatio, 0.90, `${entry.id} signature ultimate must deal 90% max HP`);
        assert.deepStrictEqual([ultimate.minTargets, ultimate.maxTargets], [4, 4], `${entry.id} ultimate must target the full party`);
    }
}

console.log('[test] Hunt monster pattern catalog and selector passed.');
