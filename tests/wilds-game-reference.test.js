'use strict';

const assert = require('assert');
const { normalizeMonster, isFinalWeapon, normalizeWeapon } = require('../scripts/import-wilds-game-reference.js');

const monster = normalizeMonster({
    id: 1, name: 'Test Wyvern', kind: 'large', parts: [
        { id: 10, kind: 'head', health: 200, multipliers: { slash: 0.65, blunt: 0.7, pierce: 0.55, fire: 0.1 } },
        { id: 11, kind: 'body', health: 400, multipliers: { slash: 0.3, blunt: 0.3, pierce: 0.2, fire: 0 } }
    ],
    rewards: [{ conditions: [{ kind: 'broken-part', part: 'head' }] }]
});
assert.strictEqual(monster.parts[0].breakable, true);
assert.strictEqual(monster.parts[1].breakable, false);
assert.strictEqual(monster.parts[0].multipliers.slash, 0.65);

assert.strictEqual(isFinalWeapon({ crafting: { branches: [] } }), true);
assert.strictEqual(isFinalWeapon({ crafting: { branches: [{ id: 2 }] } }), false);
const weapon = normalizeWeapon({ id: 1, name: 'Leaf', kind: 'great-sword', crafting: { branches: [], row: 2, column: 3 }, damage: { raw: 200 } });
assert.strictEqual(weapon.finalTreeNode, true);
assert.strictEqual(weapon.rank, null, 'missing Master Rank must not be invented');

console.log('wilds game reference normalizer tests passed');
