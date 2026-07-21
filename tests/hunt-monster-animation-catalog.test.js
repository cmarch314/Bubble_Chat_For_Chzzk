const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Catalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');

const cases = [
    ['화염 브레스', 'ranged-cast'], ['꼬리 회전', 'tail-sweep'], ['전력 돌진', 'ground-charge'],
    ['공중 급강하', 'aerial-dive'], ['지중 급습', 'burrow'], ['바디 프레스', 'leap-slam'],
    ['앞발 할퀴기', 'close-strike'], ['대폭발', 'area-burst'], ['포효', 'roar']
];
cases.forEach(([name, expected]) => assert.strictEqual(Catalog.resolve({ name }, name, 'physical').id, expected, name));
assert.strictEqual(Catalog.resolve({ name: '미분류 공격' }, '', 'elemental').id, 'ranged-cast');
assert.strictEqual(Catalog.resolve({ name: '미분류 공격' }, '', 'physical').id, 'close-strike');
assert.strictEqual(Catalog.resolve({ name: '피날레', type: 'ultimate' }, '', 'physical').ultimate, true);

assert.strictEqual(Catalog.resolve({ name: '광란의 지그재그 돌진', tags: ['charge', 'cross-charge', 'multi-hit'] }).id, 'ground-charge-zigzag');
assert.strictEqual(Catalog.resolve({ name: '화염 브레스 쓸기', tags: ['area', 'elemental'] }).id, 'lateral-sweep');
assert.strictEqual(Catalog.resolve({ name: '연속 발톱 공격', tags: ['multi-hit'] }).id, 'pounce-chain');

const css = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
for (const id of ['ground-charge-zigzag', 'lateral-sweep', 'pounce-chain']) {
    assert(css.includes(`.monster-motion-${id}`), `${id} class must exist`);
    assert(css.includes(`@keyframes monster-motion-${id}`), `${id} keyframes must exist`);
}
assert(css.includes('var(--monster-lane-x)'), 'wide motions must scale to the available monster lane');

console.log('[test] Monster animation semantic and wide-lane coverage passed.');
