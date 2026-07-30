'use strict';

const assert = require('assert');
const Catalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');

const rathalos = Catalog.resolve({ id: 'rathalos' });
assert.strictEqual(rathalos.id, 'flying-wyvern');
assert.deepStrictEqual(rathalos.actionPhases, ['telegraph', 'travel', 'impact', 'return', 'recovery']);
assert.strictEqual(Catalog.resolve({ id: 'diablos' }).id, 'grounded-flying-wyvern');
assert.strictEqual(Catalog.flight({ id: 'rathalos' }).airborneEvadeChance, .5);
assert.strictEqual(Catalog.flightCooldownTicks({ id: 'rathalos' }, []), 300);
assert.strictEqual(Catalog.flightCooldownTicks({ id: 'rathalos' }, [
    { kind: 'left-wing', broken: true }
]), 450);
assert.strictEqual(Catalog.flightCooldownTicks({ id: 'rathalos' }, [
    { kind: 'left-wing', broken: true },
    { kind: 'right-wing', broken: true }
]), 600);

const slots = Catalog.partDisplaySlots([
    { id: 'right-horn', kind: 'right-horn', breakable: true, broken: false },
    { id: 'left-horn', kind: 'left-horn', breakable: true, broken: true },
    { id: 'torso', kind: 'torso', breakable: false, broken: false },
    { id: 'tail', kind: 'tail', severable: true, severed: false }
]);
assert.deepStrictEqual(slots.map(slot => slot.kind), ['head', 'head', 'tail'],
    'two horns are displayed as two head break slots while retaining unique source IDs');
assert.deepStrictEqual(slots.map(slot => slot.shortLabel), ['뿔', '뿔', '꼬리']);
assert.strictEqual(slots[0].id, 'right-horn');
assert.deepStrictEqual(Catalog.validatePattern({
    id: 'charge',
    name: '돌진',
    windupTicks: 10,
    movement: { impactTick: 20, returnsToOrigin: true, returnTicks: 10 }
}), []);
assert.deepStrictEqual(Catalog.validatePattern({
    id: 'broken',
    name: '불완전',
    windupTicks: 0,
    movement: { returnsToOrigin: true }
}), ['pattern.windupTicks', 'movement.impactTick', 'movement.returnTicks']);

console.log('[test] Shared monster and flying-wyvern archetype contracts passed.');
