const assert = require('assert');
const fs = require('fs');
const path = require('path');

const monsterTurn = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
const battleTick = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
const valstrax = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js'), 'utf8');
assert.match(monsterTurn, /if \(isUltimate\) engine\.monsterUltimateUsedInRage = true;/,
    'executing an ultimate must consume the current rage-phase allowance');
assert.match(battleTick, /monsterState = 'enraged';\s*engine\.monsterUltimateUsedInRage = false;/,
    'a genuine rage entry must grant one ultimate allowance');
assert.match(battleTick, /valstraxEnrageTimer >= 300 && !engine\.monsterUltimateUsedInRage/,
    'Valstrax must not launch a second ambush in one rage phase');
assert.match(valstrax, /executeAmbushLanding\(engine\)[\s\S]*?if \(engine\.monsterUltimateUsedInRage\) return false;[\s\S]*?monsterUltimateUsedInRage = true;/,
    'Valstrax landing must atomically consume the same rage allowance');

console.log('[test] Monster ultimates are limited to once per rage phase.');
