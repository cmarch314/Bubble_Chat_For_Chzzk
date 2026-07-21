const assert = require('assert');

global.HUNT_WILDS_MONSTER_ANATOMY = {
    monsters: {
        rathalos: {
            id: 'rathalos', baseHealth: 5000, parts: [
                { id: 1, kind: 'head', health: 100, breakable: true, hitzones: { slash: 0.6, blunt: 0.7, pierce: 0.5 } },
                { id: 2, kind: 'torso', health: 200, breakable: false, hitzones: { slash: 0.2, blunt: 0.2, pierce: 0.2 } }
            ]
        }
    }
};
const Catalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');

const profile = Catalog.find({ id: 'rathalos', nameEN: 'Rathalos' });
assert.strictEqual(profile.baseHealth, 5000);
const state = Catalog.createPartState(profile);
assert.strictEqual(state.length, 2);
const result = Catalog.applyPartDamage(state, { id: 'great_sword', type: 'melee' }, 200, 1, () => 0);
assert.strictEqual(result.part.kind, 'head');
assert.strictEqual(result.newlyBroken, true);
assert.strictEqual(Catalog.damageTypeForWeapon({ id: 'hammer' }), 'blunt');
assert.strictEqual(Catalog.damageTypeForWeapon({ type: 'ranged' }), 'pierce');
console.log('[test] Hunt monster anatomy catalog passed.');
