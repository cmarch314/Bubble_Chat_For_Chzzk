const assert = require('assert');
const HuntWeaponActionSelector = require('../js/effects/hunt/HuntWeaponActionSelector.js');

const selector = new HuntWeaponActionSelector(() => 0);
const hunter = { comboIndex: 1, spiritLevel: 0, status: 'alive' };
const actions = [
    { id: 'slash', name: '베기', motionValue: 20 },
    { id: 'helmbreaker', name: '투구깨기', motionValue: 100, requirements: { minSpirit: 1 } },
    { id: 'thrust', name: '찌르기', motionValue: 30 }
];

let selected = selector.select(hunter, actions);
assert.strictEqual(selected.action.id, 'slash', 'ineligible indexed actions must be skipped');

hunter.spiritLevel = 1;
selected = selector.select(hunter, actions);
assert.strictEqual(selected.action.id, 'helmbreaker');

selected = selector.select(hunter, actions, { monsterDowned: true });
assert.strictEqual(selected.action.id, 'helmbreaker', 'downed openings should choose the strongest eligible action');

hunter.spiritLevel = 0;
hunter.comboIndex = 0;
assert.strictEqual(selector.nextIndex(hunter, actions, actions[0]), 2);

console.log('[test] Hunt conditional weapon action selector passed.');
