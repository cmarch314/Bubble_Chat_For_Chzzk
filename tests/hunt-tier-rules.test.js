const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntTierRules.js');
const context = vm.createContext({ console });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntTierRules = HuntTierRules;`;
vm.runInContext(source, context, { filename: sourcePath });

const initialSmall = context.HuntTierRules.resolve('small', 'initial');
assert.deepStrictEqual(
    { hp: initialSmall.hp, stunThreshold: initialSmall.stunThreshold, damageMod: initialSmall.damageMod, atbSpeedMod: initialSmall.atbSpeedMod },
    { hp: 6500, stunThreshold: 140, damageMod: 0.3, atbSpeedMod: 0.7 }
);

const initialElder = context.HuntTierRules.resolve('elder', 'initial');
const consecutiveElder = context.HuntTierRules.resolve('elder', 'consecutive');
assert.strictEqual(initialElder.damageMod, 1.15);
assert.strictEqual(consecutiveElder.damageMod, 1.4);
assert.strictEqual(initialElder.stunThreshold, 650);
assert.strictEqual(consecutiveElder.stunThreshold, 650);

const fallback = context.HuntTierRules.resolve('unknown', 'initial');
assert.strictEqual(fallback.hp, 15600);
assert.strictEqual(Object.isFrozen(fallback), true);

for (const id of ['bazelgeuse', 'seething_bazelgeuse']) {
    const bazel = context.HuntTierRules.resolve('normal', 'initial', { id });
    assert.strictEqual(bazel.hp, 18720, `${id} must have 20% more HP than its tier baseline`);
    assert.strictEqual(bazel.hpMultiplier, 1.2);
}
assert.strictEqual(
    context.HuntTierRules.resolve('normal', 'consecutive', { id: 'bazelgeuse' }).hp,
    18720,
    'the Bazelgeuse vitality bonus must apply exactly once in consecutive hunts'
);
assert.strictEqual(
    context.HuntTierRules.resolve('normal', 'initial', { id: 'rathalos' }).hp,
    15600,
    'the Bazelgeuse vitality bonus must not leak into other monsters'
);

const tiers = ['small', 'medium', 'normal', 'elder', 'colossal'].map(tier => context.HuntTierRules.resolve(tier, 'initial'));
assert.ok(tiers.every((profile, index) => profile.hp >= [3000, 6000, 12000, 24000, 36000][index] * 1.3));
assert.ok(tiers.at(-1).hp / tiers[0].hp < 8, 'monster HP spread should be compressed below eightfold');

const huntEffectSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const resultPresenterSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntResultPresenter.js'), 'utf8');
assert.match(huntEffectSource, /HuntTierRules\.resolve\(this\.monsterTier,\s*'initial',\s*this\.selectedMonster\)/);
assert.match(huntEffectSource, /HuntTierRules\.resolve\(this\.monsterTier,\s*'consecutive',\s*this\.selectedMonster\)/);
assert.match(huntEffectSource, /monsterStunThreshold:\s*baseStunThreshold/);
assert.match(huntEffectSource, /return HuntResultPresenter\.show\(this, container, isVictory, winner\)/);
assert.doesNotMatch(resultPresenterSource, /\bthis\./);

console.log('[test] HuntTierRules balance contract passed.');
