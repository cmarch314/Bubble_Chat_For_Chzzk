const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');

const roar = { id: 'small.roar', name: '포효', type: 'roar', tags: ['roar'] };
const bite = { id: 'small.bite', name: '물어뜯기', type: 'physical', tags: ['physical'] };
const engine = {
    selectedMonster: { id: 'jagras' }, monsterTier: 'small',
    MONSTER_PATTERNS: { jagras: [roar, bite], default: [roar, bite] },
    monsterState: 'normal', monsterHp: 100, monsterMaxHp: 100,
    monsterFlightState: 'grounded', random: () => 0
};
assert.strictEqual(HuntMonsterTurnExecutor.selectPattern(engine), bite,
    'direct random fallback must remove roar before selecting a small-monster attack');

const battleTick = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js'), 'utf8');
const huntEngine = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
assert.match(battleTick, /battleTime === 10 && engine\.monsterTier !== 'small'/,
    'small monsters must skip the encounter roar');
assert.match(huntEngine, /triggerMonsterRoarFlinch\(isEncounter = false\)[\s\S]*?monsterTier === 'small'/,
    'the roar runtime must reject small monsters as a final safety gate');

console.log('[test] Small monsters never roar.');
