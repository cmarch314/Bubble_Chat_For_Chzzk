const assert = require('assert');
global.HUNT_WILDS_MONSTER_ANATOMY = require('../js/effects/hunt/data/WildsMonsterAnatomy.generated.js');
const HuntMonsterAnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const HuntPerkRuntime = require('../js/effects/hunt/HuntPerkRuntime.js');
const HuntRenderer = require('../js/effects/hunt/HuntRenderer.js');

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
const tailStyles = new Map();
const fieldTail = {
    hidden: true,
    dataset: {},
    offsetWidth: 81,
    classList: { toggle() {}, remove() {}, add() {} },
    querySelector(selector) { return selector === 'b' ? { textContent: '' } : null; },
    style: {
        set left(value) { tailStyles.set('left', value); },
        set top(value) { tailStyles.set('top', value); },
        setProperty(name, value) { tailStyles.set(name, value); }
    }
};
const monsterRect = { left: 750, top: 160, width: 300, height: 300 };
const hunterRects = [
    { left: 300, top: 650, width: 200, height: 200 },
    { left: 620, top: 650, width: 200, height: 200 }
];
const renderer = Object.create(HuntRenderer.prototype);
renderer.card = {
    getBoundingClientRect() { return { left: 100, top: 50, width: 1600, height: 900 }; },
    querySelector(selector) {
        if (selector === '#hunt-severed-tail') return fieldTail;
        if (selector === '#fight-monster-img') return { getBoundingClientRect: () => monsterRect };
        return null;
    },
    querySelectorAll(selector) {
        return selector === '.game-hunt-weapon-card'
            ? hunterRects.map(rect => ({ getBoundingClientRect: () => rect }))
            : [];
    }
};
const originalRandom = Math.random;
Math.random = () => .5;
renderer.updateTailSeverUI(true, false, '화룡 꼬리');
Math.random = originalRandom;
assert.strictEqual(tailStyles.get('left'), '800px',
    'the severed tail must start at the live monster center, relative to the hunt card');
assert.strictEqual(tailStyles.get('top'), '260px',
    'the severed tail must start at the live monster height, relative to the hunt card');
assert.strictEqual(Math.abs(Number.parseInt(tailStyles.get('--tail-flight-x'), 10)), 328,
    'the lateral throw must be approximately one visible hunter-slot gap');
assert.ok(Number.parseInt(tailStyles.get('--tail-flight-arc'), 10) >= 110,
    'the throw must keep a guaranteed visible arc');

console.log('[test] Tail sever state, field marker, and perk carving passed.');
