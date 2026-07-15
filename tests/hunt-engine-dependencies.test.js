const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js');
const context = vm.createContext({ console, window: {}, setTimeout });
const source = `${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntEngine = HuntEngine;`;
vm.runInContext(source, context, { filename: sourcePath });

const scheduled = [];
const randomValues = [0, 0.99];
const random = () => randomValues.shift() ?? 0;
const schedule = (callback, delay) => scheduled.push({ callback, delay });
const engine = new context.HuntEngine({
    selectedWeapons: [],
    selectedMonster: { id: 'rathalos', nameKO: '리오레우스' },
    random,
    schedule,
    MONSTER_ATTACKS: { default: ['공격'] },
    COMBO_LIST: {},
    callbacks: {}
});

assert.strictEqual(engine.random, random);
assert.strictEqual(engine.schedule, schedule);
assert.strictEqual(engine.getPreviousMonsterMaterial('화룡'), '화룡의 비늘');
assert.strictEqual(engine.getPreviousMonsterMaterial('화룡'), '화룡의 꼬리뼈');

engine.schedule(() => {}, 2500);
assert.strictEqual(scheduled.length, 1);
assert.strictEqual(scheduled[0].delay, 2500);

const directGlobalCalls = fs.readFileSync(sourcePath, 'utf8')
    .replace(/config\.random \|\| Math\.random/, '')
    .replace(/setTimeout\(callback, delay\)/, '');
assert.doesNotMatch(directGlobalCalls, /Math\.random\(\)|setTimeout\(/);

console.log('[test] HuntEngine deterministic dependency contract passed.');
