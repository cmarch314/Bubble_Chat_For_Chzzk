const assert = require('assert');
const HuntLoadoutAdvisor = require('../js/effects/hunt/HuntLoadoutAdvisor.js');

const weapons = [
    { id: 'great_sword', name: '대검' },
    { id: 'lance', name: '랜스' },
    { id: 'light_bowgun', name: '라이트보건' }
];
const advisor = new HuntLoadoutAdvisor(weapons);
assert.strictEqual(advisor.recommend({ personality: 'defensive', perks: [] }, null, []).id, 'lance');
assert.strictEqual(advisor.recommend({ personality: 'support', perks: [] }, null, []).id, 'light_bowgun');
assert.strictEqual(advisor.recommend({ personality: 'offensive', perks: [] }, null, []).id, 'great_sword');
console.log('[test] Hunt loadout weapon recommendation passed.');
