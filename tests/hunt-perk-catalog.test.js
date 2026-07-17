const assert = require('assert');
const HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
const HuntSeededRandom = require('../js/effects/hunt/HuntSeededRandom.js');

const all = HuntPerkCatalog.all();
assert.strictEqual(new Set(all.map(perk => perk.description)).size, 100, 'every perk needs unique lore');
assert.ok(all.every(perk => !perk.description.includes('축복인지 흉조인지')), 'placeholder perk lore must be removed');
assert.strictEqual(all.length, 100);
assert.strictEqual(new Set(all.map(perk => perk.id)).size, 100);
assert.strictEqual(new Set(all.map(perk => perk.name)).size, 100);
['겁쟁이', '앙심', '토끼손', '도전자'].forEach(name => {
    const perk = all.find(item => item.name === name);
    assert.ok(perk && Object.keys(perk.modifiers).length > 0, `${name} must affect combat`);
});
all.filter(perk => perk.name !== '빈 수첩').forEach(perk => {
    assert.ok(Object.keys(perk.modifiers).length > 0, `${perk.name} must not be cosmetic-only`);
});
for (let seed = 1; seed <= 100; seed++) {
    const rng = new HuntSeededRandom(seed);
    const rolled = HuntPerkCatalog.roll(() => rng.next());
    assert.ok(rolled.length >= 0 && rolled.length <= 5);
    assert.strictEqual(new Set(rolled.map(perk => perk.id)).size, rolled.length);
}
console.log('[test] Hunt 100-perk random assignment contract passed.');
