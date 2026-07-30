const assert = require('assert');
const fs = require('fs');
const HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
const HuntSeededRandom = require('../js/effects/hunt/HuntSeededRandom.js');

const all = HuntPerkCatalog.all();
assert.strictEqual(new Set(all.map(perk => perk.description)).size, 141, 'every perk needs unique lore');
assert.ok(all.every(perk => !perk.description.includes('축복인지 흉조인지')), 'placeholder perk lore must be removed');
assert.ok(all.every(perk => [...perk.description].length <= 34), 'perk lore must fit the fixed two-line loadout treatment');
assert.strictEqual(all.length, 141);
assert.strictEqual(new Set(all.map(perk => perk.id)).size, 141);
assert.strictEqual(new Set(all.map(perk => perk.name)).size, 141);
const supportedHooks = new Set([
    'evade','temporary-buff','damage-condition','incoming-hit','item','initial-state',
    'ailment-resist','action-duration','resource-cost','buff-duration','action-specific',
    'monster-control','part-damage','targeting','monster-status','support-action',
    'lifesteal','battle-entry','quirk'
]);
all.filter(perk => perk.name !== '빈 수첩').forEach(perk => {
    assert.ok(perk.hooks.length > 0, `${perk.name} must declare a real combat event hook`);
    perk.hooks.forEach(hook => assert.ok(supportedHooks.has(hook), `${perk.name} uses unsupported hook ${hook}`));
});
assert.deepStrictEqual(all.find(perk => perk.name === '빈 수첩').hooks, [], '빈 수첩 is deliberately blank');
assert.ok(!HuntPerkCatalog._modifiers('캠프 수호자').atbRate, 'camp behavior must not be replaced by a tempo surrogate');
assert.ok(!HuntPerkCatalog._modifiers('독사').attackRate, 'status behavior must not be replaced by generic damage');
const runtimeSources = [
    '../js/effects/hunt/HuntPerkRuntime.js',
    '../js/effects/hunt/HuntHunterTurnExecutor.js',
    '../js/effects/hunt/HuntMonsterTurnExecutor.js'
].map(file => fs.readFileSync(require.resolve(file), 'utf8')).join('\n');
all.filter(perk => perk.name !== '빈 수첩' && Object.keys(perk.modifiers).length === 0).forEach(perk => {
    assert.ok(runtimeSources.includes(perk.name), `${perk.name} must be explicitly connected to its runtime event`);
});
for (let seed = 1; seed <= 100; seed++) {
    const rng = new HuntSeededRandom(seed);
    const rolled = HuntPerkCatalog.roll(() => rng.next());
    assert.ok(rolled.length >= 0 && rolled.length <= 4);
    assert.strictEqual(new Set(rolled.map(perk => perk.id)).size, rolled.length);
}
const emptyLoadoutRoll = HuntPerkCatalog.roll(() => 0);
assert.deepStrictEqual(emptyLoadoutRoll, [], 'empty rolls must stay hidden until the battle-start manifestation check');
const dung = all.find(perk => perk.name === '💩');
assert.strictEqual(dung.id, HuntPerkCatalog.DUNG_PERK_ID);
assert.strictEqual(dung.description, '아들아... 네가 태어나던 날, 온 세상이 코를...');
assert.deepStrictEqual(dung.modifiers, {
    hitChance: 0.09,
    critChance: 0.60,
    evadeChance: 0.35,
    guardChance: 0.35,
    counterChance: 0.25
}, 'Dung must dramatically boost probability rolls without changing ATB, damage, recovery, or action duration');
const dungAggregate = HuntPerkCatalog.aggregate([dung]);
assert.strictEqual(dungAggregate.atbRate, 1, 'Dung must leave ATB recovery exactly unchanged');
assert.strictEqual(dungAggregate.attackRate, 1, 'Dung must leave fixed attack power exactly unchanged');
assert.strictEqual(dungAggregate.healBias, 0, 'Dung must leave fixed healing behavior exactly unchanged');
console.log('[test] Hunt 141-perk random assignment and empty-roll jackpot contract passed.');
