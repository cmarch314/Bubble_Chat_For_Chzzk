const assert = require('assert');
global.HUNT_WILDS_MONSTER_ANATOMY = require('../js/effects/hunt/data/WildsMonsterAnatomy.generated.js');
const HuntMonsterAnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');

const profile = HuntMonsterAnatomyCatalog.find({ id: 'rathalos', nameEN: 'Rathalos' });
const parts = HuntMonsterAnatomyCatalog.createPartState(profile);
const tail = parts.find(part => part.severable);
assert.ok(tail, 'every roster monster known to allow a tail cut needs a severable tail state');
const blunt = HuntMonsterAnatomyCatalog.applyPartDamage([tail], { id: 'hammer' }, 9999, 1, () => 0);
assert.strictEqual(blunt.applied, 0, 'blunt damage must never sever a tail');
const slash = HuntMonsterAnatomyCatalog.applyPartDamage([tail], { id: 'long_sword', type: 'melee' }, 9999, 1, () => 0);
assert.strictEqual(slash.newlySevered, true, 'slash damage must create a distinct severed state');
const kirinParts = HuntMonsterAnatomyCatalog.createPartState(
    HuntMonsterAnatomyCatalog.find({ id: 'kirin' })
);
assert.ok(!kirinParts.some(part => part.severable),
    'monsters without severable tails must not receive a fictional tail-cut state');

const logs = [];
const hunter = { index: 0, hunterName: 'TAIL', perks: [{ name: '꼬리 수집가' }] };
const engine = {
    severedTail: { available: true, carved: false, material: '화룡의 꼬리' }, combatGatherCount: 0,
    tryConsumeCombatGather() { this.combatGatherCount++; return true; },
    addLog(text) { logs.push(text); }, showSkillBubble() {}, updateTailSeverUI() {}
};
const runtime = new HuntPerkRuntime(engine);
assert.strictEqual(runtime.trySpecialAction(hunter), true);
assert.strictEqual(engine.severedTail.carved, true);
assert.deepStrictEqual(hunter.gatheredMaterials, [{ kind: 'tail', item: '화룡의 꼬리' }]);
assert.ok(logs[0].includes('파티 채집 1/3'));
console.log('[test] Tail sever state, field marker, and perk carving passed.');
