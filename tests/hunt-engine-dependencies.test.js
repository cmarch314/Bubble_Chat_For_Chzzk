const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js');
const context = vm.createContext({ console, window: {}, setTimeout });
const rulesPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterRules.js');
const actionStatePath = path.resolve(__dirname, '../js/effects/hunt/HuntActionStateMachine.js');
const actionSelectorPath = path.resolve(__dirname, '../js/effects/hunt/HuntWeaponActionSelector.js');
const monsterCatalogPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterPatternCatalog.js');
const monsterSelectorPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterPatternSelector.js');
const telemetryPath = path.resolve(__dirname, '../js/effects/hunt/HuntBalanceTelemetry.js');
const battleTickPath = path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js');
const valstraxPath = path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js');
const monsterTurnPath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js');
const hunterTurnPath = path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js');
vm.runInContext(fs.readFileSync(rulesPath, 'utf8'), context, { filename: rulesPath });
vm.runInContext(fs.readFileSync(actionStatePath, 'utf8'), context, { filename: actionStatePath });
vm.runInContext(fs.readFileSync(actionSelectorPath, 'utf8'), context, { filename: actionSelectorPath });
vm.runInContext(fs.readFileSync(monsterCatalogPath, 'utf8'), context, { filename: monsterCatalogPath });
vm.runInContext(fs.readFileSync(monsterSelectorPath, 'utf8'), context, { filename: monsterSelectorPath });
vm.runInContext(fs.readFileSync(telemetryPath, 'utf8'), context, { filename: telemetryPath });
vm.runInContext(fs.readFileSync(battleTickPath, 'utf8'), context, { filename: battleTickPath });
vm.runInContext(fs.readFileSync(valstraxPath, 'utf8'), context, { filename: valstraxPath });
vm.runInContext(fs.readFileSync(monsterTurnPath, 'utf8'), context, { filename: monsterTurnPath });
vm.runInContext(fs.readFileSync(hunterTurnPath, 'utf8'), context, { filename: hunterTurnPath });
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
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntBattleTickExecutor\.execute\(this\)/);
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntValstraxExecutor\.executeChargeSuccess\(this\)/);
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntMonsterTurnExecutor\.execute\(this\)/);
assert.match(fs.readFileSync(sourcePath, 'utf8'), /return HuntHunterTurnExecutor\.execute\(this, w\)/);
assert.doesNotMatch(
    fs.readFileSync(valstraxPath, 'utf8'),
    /\bthis\./,
    'Valstrax executor must receive engine state explicitly'
);
assert.doesNotMatch(
    fs.readFileSync(battleTickPath, 'utf8'),
    /\bthis\./,
    'battle tick executor must receive engine state explicitly'
);
assert.doesNotMatch(
    fs.readFileSync(monsterTurnPath, 'utf8'),
    /\bthis\./,
    'monster turn executor must receive engine state explicitly'
);
assert.doesNotMatch(
    fs.readFileSync(hunterTurnPath, 'utf8'),
    /\bthis\./,
    'hunter turn executor must receive engine state explicitly'
);
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
