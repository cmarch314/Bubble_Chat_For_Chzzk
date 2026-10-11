const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');
const HuntHunterDecisionPolicy = require('../js/effects/hunt/HuntHunterDecisionPolicy.js');

const events = [];
const engine = {
    monsterHp: 10000,
    monsterMaxHp: 10000,
    monsterState: 'normal',
    monsterKnockdownDuration: 0,
    monsterStunDuration: 0,
    random: () => 0,
    updateMonsterHpUI: () => events.push('hp'),
    updateHunterItemUI: () => events.push('items'),
    triggerEnvironmentEffect: kind => events.push(kind),
    playSFX: key => events.push(key),
    addLog: text => events.push(text),
    showSkillBubble: (_index, text) => events.push(text)
};
const runtime = new HuntPerkRuntime(engine);
const normal = { index: 0, hunterName: '일반', status: 'alive', bombs: 1, perks: [] };
assert.strictEqual(runtime.useBomb(normal, '검사'), true);
assert.strictEqual(normal.bombs, 0);
assert.strictEqual(engine.monsterHp, 9800, 'a barrel bomb must deal the fixed cross-title balance damage');
assert.ok(events.includes('bomb'), 'a barrel bomb must trigger its dedicated visual effect');
assert.deepStrictEqual(
    [engine.monsterState, engine.monsterKnockdownDuration, engine.monsterStunDuration],
    ['normal', 0, 0],
    'barrel bombs must deal HP damage without creating or extending monster control'
);

engine.monsterHp = 20000;
engine.monsterMaxHp = 20000;
normal.bombs = 1;
assert.strictEqual(runtime.useBomb(normal, '검사'), true);
assert.strictEqual(engine.monsterHp, 19800, 'barrel bomb damage must not scale with monster maximum HP');

engine.monsterHp = 10000;
engine.monsterMaxHp = 10000;
const specialist = { index: 1, hunterName: '폭파광', status: 'alive', bombs: 1, perks: [{ name: '폭파광' }] };
assert.strictEqual(runtime.useBomb(specialist, '폭파광'), true);
assert.strictEqual(engine.monsterHp, 9700, 'Bombardier must multiply real bomb damage by 1.5');

const decisionHunter = { index: 0, personality: 'normal', status: 'alive', hp: 100, maxHp: 100,
    bombs: 1, perks: [], lifepowders: 0, flashPods: 0, shockTraps: 0 };
const decisionEngine = {
    selectedWeapons: [decisionHunter], battleTime: 10, timeLimit: 480, monsterAtb: 0,
    monsterState: 'knocked_down', monsterFlightState: 'grounded', random: () => 0,
    perkRuntime: { aiBias: () => 0 }
};
assert.strictEqual(HuntHunterDecisionPolicy.chooseSupportAction(decisionEngine, decisionHunter), null,
    'non-Bombardier AI must conserve bombs outside sleep');
decisionEngine.monsterState = 'sleeping';
assert.strictEqual(HuntHunterDecisionPolicy.chooseSupportAction(decisionEngine, decisionHunter)?.kind, 'bomb',
    'non-Bombardier AI must reserve bombs for sleeping monsters');
decisionEngine.monsterState = 'knocked_down';
decisionHunter.perks = [{ name: '폭파광' }];
assert.strictEqual(HuntHunterDecisionPolicy.chooseSupportAction(decisionEngine, decisionHunter)?.kind, 'bomb',
    'Bombardier AI may use bombs during other safe control windows');
decisionEngine.monsterControlEnteredAtTick = decisionEngine.battleTime;
assert.strictEqual(HuntHunterDecisionPolicy.chooseSupportAction(decisionEngine, decisionHunter), null,
    'Bombardier must not make a fresh knockdown look as though the bomb caused it');
decisionEngine.battleTime += 6;
assert.strictEqual(HuntHunterDecisionPolicy.chooseSupportAction(decisionEngine, decisionHunter)?.kind, 'bomb',
    'Bombardier may follow up after the control cause has remained readable for six ticks');

const loadout = { bombs: 1, perks: [{ name: '폭파광' }] };
runtime.initialize(loadout);
assert.strictEqual(loadout.bombs, 1,
    'perk runtime must not duplicate Bombardier stock already issued by the loadout supply owner');

const renderer = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
assert.match(renderer, /bomb-count-\$\{w\.index\}/, 'combat item UI must show bomb inventory');
assert.doesNotMatch(renderer, /!폭탄/, 'combat UI must not expose a direct bomb reservation');

console.log('[test] Autonomous barrel bomb item and Bombardier perk passed.');
