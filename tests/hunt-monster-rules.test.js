const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sourcePath = path.resolve(__dirname, '../js/effects/hunt/HuntMonsterRules.js');
const HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const context = vm.createContext({ Math, HuntAtbConfig });
vm.runInContext(`${fs.readFileSync(sourcePath, 'utf8')}\nglobalThis.HuntMonsterRules = HuntMonsterRules;`, context);
const Rules = context.HuntMonsterRules;

assert.strictEqual(Rules.BASE_ATTACK_ACCURACY, 1);
assert.strictEqual(Rules.attackAccuracy({ accuracy: 0, hitChance: 0 }), 1,
    'monster pattern data must not introduce passive misses; hunters must actively defend');
assert.strictEqual(Rules.isHunterTargetable({}, { status: 'alive' }), true);
assert.strictEqual(Rules.isHunterTargetable({}, { status: 'stunned' }), true,
    'stunned hunters remain vulnerable monster targets');
assert.strictEqual(Rules.isHunterTargetable({}, { status: 'dead' }), false);
assert.strictEqual(Rules.isHunterTargetable({}, { status: 'alive', cartRecoveryTicks: 1 }), false);
assert.strictEqual(Rules.isHunterTargetable({}, { status: 'alive', jumpInvulnerableTicks: 1 }), false);
assert.strictEqual(Rules.isHunterTargetable({}, { status: 'alive', isAtCamp: true }), false);
assert.strictEqual(Rules.speedForState('normal', 'rathalos', 2), HuntAtbConfig.FILL_PER_TICK * 2);
assert.strictEqual(Rules.speedForState('enraged', 'rathalos', 1), HuntAtbConfig.FILL_PER_TICK * 1.5);
const rathalosSchedule = { rageStartTick: 800, rageDurationTicks: 1200, rageRecoveryDurationTicks: 300 };
assert.strictEqual(Rules.stateForBattleTime(799, rathalosSchedule), 'normal');
assert.strictEqual(Rules.stateForBattleTime(800, rathalosSchedule), 'enraged');
assert.strictEqual(Rules.stateForBattleTime(1999, rathalosSchedule), 'enraged');
assert.strictEqual(Rules.stateForBattleTime(2000, rathalosSchedule), 'normal',
    'the former timed exhaustion slot must now be a calm interval between rages');
assert.strictEqual(Rules.stateForBattleTime(2300, rathalosSchedule), 'enraged',
    'the next rage must begin after the calm interval');
assert.strictEqual(Rules.speedForState('exhausted', 'vaal_hazak', 1), HuntAtbConfig.FILL_PER_TICK * 0.5 * 0.75);
assert.strictEqual(Rules.materialFor('리오레우스', () => 0), '리오레우스의 비늘');
assert.strictEqual(Rules.materialFor('리오레우스', () => 0.999), '리오레우스의 꼬리뼈');
assert.strictEqual(Rules.crossedKnockdownThreshold(790, 1000, {}, 'rathalos'), 80);
assert.strictEqual(Rules.crossedKnockdownThreshold(590, 1000, { 80: true }, 'rathalos'), 60);
assert.strictEqual(Rules.crossedKnockdownThreshold(100, 1000, {}, 'valstrax'), null);
assert.deepStrictEqual(
    Array.from(Rules.crossedKnockdownThresholds(190, 1000, {}, 'rathalos')),
    [80, 60, 40, 20],
    'one large hit must consume every crossed threshold without chaining knockdowns'
);

console.log('[test] Hunt monster pure rules contract passed.');
