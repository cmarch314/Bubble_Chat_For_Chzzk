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
    { hp: 3000, stunThreshold: 100, damageMod: 0.3, atbSpeedMod: 0.7 }
);

const initialElder = context.HuntTierRules.resolve('elder', 'initial');
const consecutiveElder = context.HuntTierRules.resolve('elder', 'consecutive');
assert.strictEqual(initialElder.damageMod, 1.15);
assert.strictEqual(consecutiveElder.damageMod, 1.4);
assert.strictEqual(initialElder.stunThreshold, 500);
assert.strictEqual(consecutiveElder.stunThreshold, 500);

const fallback = context.HuntTierRules.resolve('unknown', 'initial');
assert.strictEqual(fallback.hp, 12000);
assert.strictEqual(Object.isFrozen(fallback), true);

const huntEffectSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const resultPresenterSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntResultPresenter.js'), 'utf8');
assert.match(huntEffectSource, /monsterStunThreshold:\s*baseStunThreshold/);
assert.match(huntEffectSource, /return HuntResultPresenter\.show\(this, container, isVictory, winner\)/);
assert.doesNotMatch(resultPresenterSource, /\bthis\./);

console.log('[test] HuntTierRules balance contract passed.');
