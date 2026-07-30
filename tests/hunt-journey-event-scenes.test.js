'use strict';

const assert = require('assert');
global.HuntJourneyEconomy = require('../js/effects/hunt/HuntJourneyEconomy');
const Catalog = require('../js/effects/hunt/HuntJourneyEventCatalog');
const Engine = require('../js/effects/hunt/HuntJourneyEventEngine');

const catalog = Catalog.createDefault();
assert.deepStrictEqual(Object.keys(Catalog.NON_COMBAT_MONSTER_EVENTS).sort(), [
    'boaboa', 'felyne', 'gajalaka', 'grimalkyne', 'melynx', 'unknown_monster'
]);
for (const eventId of Object.values(Catalog.NON_COMBAT_MONSTER_EVENTS)) {
    assert.ok(catalog.get(eventId), `${eventId}: non-combat monster needs an executable journey event`);
}
assert.throws(() => new Catalog().register({ id: 'empty', actions: [] }), /requires id and actions/);
assert.throws(() => new Catalog().register({ id: 'duplicate', actions: [
    { id: 'same', apply() {} }, { id: 'same', apply() {} }
] }), /non-empty and unique/);
assert.throws(() => new Catalog().register({ id: 'fake', actions: [{ id: 'noop' }] }), /not executable/);
assert.throws(() => new Catalog().register({ id: 'silent', actions: [{ id: 'noop', apply() {} }] }), /visible labels and consequences/);
assert.throws(() => new Catalog().register({ id: 'crowded', actions: [1, 2, 3, 4].map(id => ({ id, apply() {} })) }), /more than three/);
for (const id of catalog.ids()) {
    const scene = catalog.get(id);
    assert(scene.narrative.length >= 12, `${id}: D&D scene narrative is missing`);
    assert(scene.actions.length >= 2 && scene.actions.length <= 3, `${id}: scene must expose 2-3 actions`);
    assert(scene.actions.every(action => action.id && action.label && action.description && typeof action.apply === 'function'));
}

const state = { zenny: 3, rerolls: 0, supply: { potions: 0, lifepowders: 0, shockTraps: 0, bombs: 0 }, party: [
    { nickname: 'A', hp: 50, maxHp: 100, potions: 0, lifepowders: 0, bombs: 0 },
    { nickname: 'B', hp: 50, maxHp: 100, potions: 0, lifepowders: 0, bombs: 0 }
] };
const engine = new Engine(catalog);
const smithy = engine.resolveEventActions(state, 'smithy', [1]);
assert.strictEqual(smithy.party[0].hp, 70);
assert.strictEqual(smithy.zenny, 3);
const shop = engine.resolveEventActions(state, 'felyne', [0, 2]);
assert.strictEqual(shop.supply.potions, 1);
assert.strictEqual(shop.supply.bombs, 1);
assert.strictEqual(shop.zenny, 1);
const deep = engine.resolveEventActions(state, 'risky_gather', [1]);
assert.deepStrictEqual(deep.ambushHook, { chance: .35, source: 'deep-gather' });
const safeSmithyDefault = engine.resolveEventActions(state, 'smithy', []);
assert.strictEqual(safeSmithyDefault.party[0].hp, 70, 'no-vote smithy must use its declared safe maintenance action');
const noPurchaseDefault = engine.resolveEventActions({ ...state, zenny: 3 }, 'felyne', []);
assert.strictEqual(noPurchaseDefault.zenny, 3, 'no-vote shops must never spend shared currency');
assert.match(noPurchaseDefault.summary, /행동 없음/);
const unaffordable = engine.resolveEventActions({ ...state, zenny: 0 }, 'felyne', [1, 1]);
assert.strictEqual(unaffordable.supply.lifepowders, 0);
assert.ok(unaffordable.eventOutcomes.every(outcome => outcome.reason === 'insufficient-zenny'));
assert.match(unaffordable.summary, /실패/, 'failed purchases must not be logged as successful effects');
console.log('[test] Two-step D&D scenes, individual shops, costs, and consequences passed.');
