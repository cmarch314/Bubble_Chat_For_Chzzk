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
assert.deepStrictEqual(result, { handled: false }, 'viewer dodge preparation must remain retired');
result = tactics.handle(engine, { nickname: 'Tester' }, '!가드');
assert.deepStrictEqual(result, { handled: false }, 'viewer guard preparation must remain retired');

tactics.supportGauge = 40;
engine.battleTime = 30;
result = tactics.handle(engine, { nickname: 'Viewer' }, '!회복');
assert.strictEqual(result.accepted, true);
assert.strictEqual(hunter.hp, 58);
assert.strictEqual(tactics.supportGauge, 5);

tactics.supportGauge = 50;
engine.battleTime = 40;
engine.monsterFlashUseCount = 4;
result = tactics.handle(engine, { nickname: 'FlashViewer' }, '!섬광');
assert.strictEqual(result.accepted, false);
assert.strictEqual(result.feedback, '🚫 섬광 내성');
assert.strictEqual(tactics.supportGauge, 50, 'an immune flash must refund viewer support gauge');

engine.battleTime = 50;
engine.monsterFlashUseCount = 3;
result = tactics.handle(engine, { nickname: 'FlashViewer2' }, '!섬광');
assert.strictEqual(result.accepted, true);
assert.strictEqual(engine.monsterFlashUseCount, 4);
assert.strictEqual(engine.monsterAtb, 50,
    'viewer flash must retain the same fixed half ATB as every other flash source');

console.log('[test] Hunt chat tactics participation contract passed.');
