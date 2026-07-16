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

const selector = new HuntMonsterPatternSelector(() => 0);
const monster = { id: 'test_monster' };
const first = selector.select(monster, catalog.test_monster, { state: 'normal' });
const second = selector.select(monster, catalog.test_monster, { state: 'normal' });
assert.notStrictEqual(first.id, second.id, 'the selector should not immediately repeat a pattern');
assert.ok(!first.tags.includes('ultimate'), 'ultimates should be reserved for enraged state when alternatives exist');

const curated = HuntMonsterPatternCatalog.build({ rathalos: ['placeholder'] }).rathalos;
assert.strictEqual(curated.length, 5);
assert.strictEqual(curated.find(pattern => pattern.id === 'rathalos.aerial_barrage').requiredState, 'enraged');

console.log('[test] Hunt monster pattern catalog and selector passed.');
