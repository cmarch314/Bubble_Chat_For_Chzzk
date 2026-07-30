const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');

const events = [];
const engine = {
    monsterHp: 10000,
    monsterMaxHp: 10000,
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
assert.strictEqual(engine.monsterHp, 9600, 'a barrel bomb must deal 4% maximum HP damage');
assert.ok(events.includes('bomb'), 'a barrel bomb must trigger its dedicated visual effect');

engine.monsterHp = 10000;
const specialist = { index: 1, hunterName: '폭파광', status: 'alive', bombs: 1, perks: [{ name: '폭파광' }] };
assert.strictEqual(runtime.useBomb(specialist, '폭파광'), true);
assert.strictEqual(engine.monsterHp, 9400, 'Bombardier must multiply real bomb damage by 1.5');

const loadout = { bombs: 1, perks: [{ name: '폭파광' }] };
runtime.initialize(loadout);
assert.strictEqual(loadout.bombs, 3, 'Bombardier must add two usable bombs to the loadout');

const initializer = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntInitializer.js'), 'utf8');
const renderer = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const perkRuntime = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntPerkRuntime.js'), 'utf8');
assert.match(initializer, /bombs:\s*1/, 'all hunters need one base bomb');
assert.match(renderer, /bomb-count-\$\{w\.index\}/, 'combat item UI must show bomb inventory');
assert.match(perkRuntime, /trySpecialAction\(hunter\)[\s\S]*return this\.useBomb\(hunter, '폭파광'\)/,
    'Bombardier must use bombs through autonomous perk decision-making');
assert.doesNotMatch(renderer, /!폭탄/, 'combat UI must not expose a direct bomb reservation');

console.log('[test] Autonomous barrel bomb item and Bombardier perk passed.');
