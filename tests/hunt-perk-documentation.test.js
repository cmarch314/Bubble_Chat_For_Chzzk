const assert = require('assert');
const fs = require('fs');
const HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
const generator = require('../scripts/generate-hunt-perk-reference.js');

const expected = generator.build();
const actual = fs.readFileSync(generator.OUTPUT, 'utf8');
assert.strictEqual(actual, expected, 'perk reference must be regenerated after catalog/runtime documentation changes');

const perks = HuntPerkCatalog.all();
assert.strictEqual(perks.length, 200);
perks.forEach(perk => {
    const heading = `### ${perk.id} · ${perk.name}`;
    assert.strictEqual(actual.split(heading).length - 1, 1, `${perk.id} must have exactly one detailed section`);
});
assert.strictEqual(generator.legacyDetails.size, 141, 'all legacy perks need explicit runtime detail');
const Synergies = require('../js/effects/hunt/HuntPerkSynergyCatalog.js');
assert.ok(Synergies.recipes.every(recipe => recipe.bonus?.summary && recipe.bonus?.effects?.length), 'every visible synergy needs an executable documented bonus');
assert.ok(!actual.includes('미기록'), 'reference must not contain undocumented placeholders');
assert.ok(actual.includes('10틱 = 1초'));
assert.ok(actual.includes('연계 스킬:'));
const cowardSection = actual.slice(actual.indexOf('### perk_001 · 겁쟁이'), actual.indexOf('### perk_002 · 앙심'));
assert.ok(cowardSection.includes('연계 스킬:'), 'each perk section must disclose its linked skills');
const resentmentSection = actual.slice(actual.indexOf('### perk_002 · 앙심'), actual.indexOf('### perk_003 · 토끼손'));
assert.ok(resentmentSection.includes('도전자'), 'synergy sections must name the actual linked perks, not only the group label');
assert.ok(resentmentSection.includes('연계 효과:'), 'synergy sections must explain the resulting interaction');

console.log(`hunt perk documentation tests passed (${perks.length} perks)`);
