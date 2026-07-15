const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterRules.js');
const context = vm.createContext({ Math });
vm.runInContext(`${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntMonsterRules = HuntMonsterRules;`, context);
const Rules = context.HuntMonsterRules;

assert.strictEqual(Rules.speedForState('normal', 'rathalos', 2), 4.4);
assert.strictEqual(Rules.speedForState('enraged', 'rathalos', 1), 3.3);
assert.strictEqual(Rules.speedForState('exhausted', 'vaal_hazak', 1), 0.8250000000000001);
assert.strictEqual(Rules.materialFor('리오레우스', () => 0), '리오레우스의 비늘');
assert.strictEqual(Rules.materialFor('리오레우스', () => 0.999), '리오레우스의 꼬리뼈');
assert.strictEqual(Rules.crossedKnockdownThreshold(790, 1000, {}, 'rathalos'), 80);
assert.strictEqual(Rules.crossedKnockdownThreshold(590, 1000, { 80: true }, 'rathalos'), 60);
assert.strictEqual(Rules.crossedKnockdownThreshold(100, 1000, {}, 'valstrax'), null);

console.log('[test] Hunt monster pure rules contract passed.');
