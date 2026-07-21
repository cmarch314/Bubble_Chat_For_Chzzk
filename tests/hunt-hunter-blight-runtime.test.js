'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntHunterBlightRuntime = require('../js/effects/hunt/HuntHunterBlightRuntime.js');

const updates = [];
const cancelled = [];
const engine = {
    battleTime: 0,
    callbacks: { onUpdateHunterBlightUI: (index, blights) => updates.push([index, { ...blights }]) },
    actionStateMachine: { cancel: (hunter, state) => cancelled.push([hunter.index, state]) },
    addLog: () => {}, updateHpUI: () => {}, updateWeaponAtbUI: () => {}, triggerHunterCart: () => {}
};
const runtime = new HuntHunterBlightRuntime(engine);

const cases = [
    [{ id: 'rathalos.fireball', name: '화염구 브레스', type: 'projectile', tags: ['projectile', 'elemental'] }, 'fire'],
    [{ id: 'mizutsune.water_laser', name: '고압 수류', tags: ['elemental'] }, 'water'],
    [{ id: 'lagiacrus.thunder_breath', name: '뇌격 브레스', tags: ['elemental'] }, 'thunder'],
    [{ id: 'velkhana.ice_wall', name: '빙벽', tags: ['area', 'elemental'] }, 'ice'],
    [{ id: 'valstrax.dragon_shot', name: '용속성 포환', tags: ['ultimate', 'elemental'] }, 'dragon'],
    [{ id: 'rathian.poison_tail', name: '독가시 서머솔트', tags: ['poison'] }, 'poison'],
    [{ id: 'girros.paralysis_fang', name: '마비 송곳니', tags: ['paralysis'] }, 'paralysis'],
    [{ id: 'somnacanth.sleep_gas', name: '수면 가스', tags: ['sleep'] }, 'sleep']
];
cases.forEach(([pattern, expected]) => assert.strictEqual(runtime.fromAttack(pattern), expected));
assert.strictEqual(runtime.fromAttack({ id: 'tail_slam', tags: ['physical'] }), null);

const hunter = { index: 2, hunterName: '상태 확인', status: 'alive', hp: 100, maxHp: 100, atb: 100 };
cases.forEach(([, type]) => assert.strictEqual(runtime.apply(hunter, type), true));
assert.deepStrictEqual(Object.keys(hunter.elementalBlights).sort(), ['dragon', 'fire', 'ice', 'paralysis', 'poison', 'sleep', 'thunder', 'water']);
assert.strictEqual(runtime.canAct(hunter), false);
assert.strictEqual(hunter.atb, 0);
assert.strictEqual(cancelled.length, 2, 'paralysis and sleep must both cancel the current action');

delete hunter.elementalBlights.paralysis;
assert.strictEqual(runtime.onIncomingHit(hunter, 20), 30, 'a hit must wake a sleeping hunter with bonus damage');
assert.strictEqual(runtime.active(hunter, 'sleep'), false);

hunter.elementalBlights = { poison: 20 };
engine.battleTime = 10;
runtime.tick(hunter);
assert.strictEqual(hunter.hp, 99, 'poison must deal periodic max-HP damage');

const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
for (const emoji of ['🔥', '💧', '⚡', '❄️', '🐉', '☠️', '💤']) assert.ok(rendererSource.includes(emoji), `${emoji} must remain visible in the hunter overlay renderer`);
const turnSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
assert.match(turnSource, /blightRuntime\.fromAttack\(pattern\)/, 'all monster status-tagged attacks must route through the ailment runtime');

console.log('[test] Elemental and poison/paralysis/sleep hunter ailments passed.');
