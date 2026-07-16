const assert = require('assert');
const HuntChatTactics = require('../js/effects/hunt/HuntChatTactics.js');

const logs = [];
const hunter = { hunterName: 'Tester', status: 'alive', hp: 40, maxHp: 100 };
const engine = {
    battleTime: 10,
    selectedWeapons: [hunter],
    monsterTier: 'normal',
    monsterHp: 1000,
    monsterMaxHp: 1000,
    monsterAtb: 100,
    monsterRecoveryDuration: 0,
    addLog: text => logs.push(text),
    updateHpUI: () => {},
    updateMonsterAtbUI: () => {},
    updateMonsterHpUI: () => {},
    checkMonsterKnockdown: () => {}
};

const tactics = new HuntChatTactics({ userCooldownTicks: 5 });
let result = tactics.handle(engine, { nickname: 'Tester' }, '!지원');
assert.strictEqual(result.accepted, true);
assert.strictEqual(engine.teamTactic, 'support');
assert.strictEqual(tactics.supportGauge, 8);

result = tactics.handle(engine, { nickname: 'Tester' }, '!회피');
assert.strictEqual(result.accepted, false, 'per-user cooldown should stop command spam');

engine.battleTime = 20;
result = tactics.handle(engine, { nickname: 'Tester' }, '!회피');
assert.strictEqual(result.accepted, true);
assert.strictEqual(hunter.nextEvadeBoost, 0.18);

tactics.supportGauge = 40;
engine.battleTime = 30;
result = tactics.handle(engine, { nickname: 'Viewer' }, '!회복');
assert.strictEqual(result.accepted, true);
assert.strictEqual(hunter.hp, 58);
assert.strictEqual(tactics.supportGauge, 5);

console.log('[test] Hunt chat tactics participation contract passed.');
