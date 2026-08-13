const assert = require('assert');
const fs = require('fs');
const HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');
const HuntSeededRandom = require('../js/effects/hunt/HuntSeededRandom.js');
const HuntPerkSynergyCatalog = require('../js/effects/hunt/HuntPerkSynergyCatalog.js');

const all = HuntPerkCatalog.all();
const supportedModifierKeys = new Set([
    'attackRate','atbRate','hitChance','critChance','evadeChance','guardChance',
    'guardPower','counterChance','healBias','issuedPotions','issuedLifepowders',
    'issuedTraps','issuedFlashes','issuedBombs','lowHpAttack','enragedAttack'
]);
all.forEach(perk => Object.keys(perk.modifiers || {}).forEach(key => {
    assert.ok(supportedModifierKeys.has(key), `${perk.name} declares unused modifier ${key}`);
}));
assert.ok(!Object.hasOwn(HuntPerkCatalog.aggregate([]), 'evadePower'), 'dead evadePower field must not return');
assert.strictEqual(new Set(all.map(perk => perk.description)).size, 200, 'every perk needs unique lore');
assert.ok(all.every(perk => !perk.description.includes('축복인지 흉조인지')), 'placeholder perk lore must be removed');
assert.ok(all.every(perk => [...perk.description].length <= 34), 'perk lore must fit the fixed two-line loadout treatment');
assert.strictEqual(all.length, 200);
assert.strictEqual(new Set(all.map(perk => perk.id)).size, 200);
assert.strictEqual(new Set(all.map(perk => perk.name)).size, 200);
const supportedHooks = new Set([
    'evade','temporary-buff','damage-condition','incoming-hit','item','initial-state',
    'ailment-resist','action-duration','resource-cost','buff-duration','action-specific',
    'monster-control','part-damage','targeting','monster-status','support-action',
    'lifesteal','battle-entry','quirk','dodge','guard','attack-hit','part-break',
    'interrupt-recover','ailment-recover','attack-miss','cart','whetstone','gather',
    'tail-carve','periodic'
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
all.slice(0, 141).filter(perk => perk.name !== '빈 수첩'
    && !HuntPerkCatalog.DEFERRED_LIVE_NAMES.has(perk.name)
    && Object.keys(perk.modifiers).length === 0).forEach(perk => {
    assert.ok(runtimeSources.includes(perk.name), `${perk.name} must be explicitly connected to its runtime event`);
});
assert.deepStrictEqual(HuntPerkCatalog.validate(), [], 'expanded perks must use only executable typed effects');
const runtimeTypes = new Set(HuntPerkRuntime.SUPPORTED_EFFECT_TYPES);
const runtimeEvents = new Set(HuntPerkRuntime.SUPPORTED_EVENTS);
HuntPerkCatalog.expansion.flatMap(perk => perk.effects || []).forEach(effect => {
    if (effect.type) assert.ok(runtimeTypes.has(effect.type), `runtime does not interpret ${effect.type}`);
    if (effect.on) assert.ok(runtimeEvents.has(effect.on), `runtime does not dispatch ${effect.on}`);
});
assert.ok(HuntPerkSynergyCatalog.recipes.length >= 50, 'the expanded catalog needs many visible build paths');
const perkNames = new Set(all.map(perk => perk.name));
HuntPerkSynergyCatalog.recipes.forEach(recipe => recipe.members.forEach(name => {
    assert.ok(perkNames.has(name), `${recipe.id} references unknown perk ${name}`);
}));
for (let seed = 1; seed <= 100; seed++) {
    const rng = new HuntSeededRandom(seed);
    const rolled = HuntPerkCatalog.roll(() => rng.next());
    assert.ok(rolled.length >= 0 && rolled.length <= 4);
    assert.strictEqual(new Set(rolled.map(perk => perk.id)).size, rolled.length);
    assert.ok(rolled.every(perk => Number(perk.id.slice(5)) <= HuntPerkCatalog.ACTIVE_ROLL_LIMIT),
        'draft expansion perks must stay out of live rolls until promoted');
    assert.ok(rolled.every(perk => !HuntPerkCatalog.DEFERRED_LIVE_NAMES.has(perk.name)),
        'deferred core perks must stay out of live rolls until their runtime context exists');
}
const emptyLoadoutRoll = HuntPerkCatalog.roll(() => 0);
assert.deepStrictEqual(emptyLoadoutRoll, [], 'empty rolls must stay hidden until the battle-start manifestation check');
const dung = all.find(perk => perk.name === '💩');
assert.strictEqual(dung.id, HuntPerkCatalog.DUNG_PERK_ID);
assert.strictEqual(dung.description, '아들아... 네가 태어나던 날, 온 세상이 코를...');
assert.deepStrictEqual(dung.modifiers, {
    hitChance: 0.10,
    critChance: 0.10,
    evadeChance: 0.10,
    guardChance: 0.10,
    counterChance: 0.10
}, 'Dung must add a uniform ten percentage points without changing ATB, damage, recovery, or action duration');
const dungAggregate = HuntPerkCatalog.aggregate([dung]);
assert.strictEqual(dungAggregate.atbRate, 1, 'Dung must leave ATB recovery exactly unchanged');
assert.strictEqual(dungAggregate.attackRate, 1, 'Dung must leave fixed attack power exactly unchanged');
assert.strictEqual(dungAggregate.healBias, 0, 'Dung must leave fixed healing behavior exactly unchanged');
console.log('[test] Hunt 200-perk typed assignment and empty-roll jackpot contract passed.');
