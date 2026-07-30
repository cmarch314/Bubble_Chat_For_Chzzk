const assert = require('assert');
const HuntJourneyCatalog = require('../js/effects/hunt/HuntJourneyCatalog');
const HuntRunState = require('../js/effects/hunt/HuntRunState');

const monsters = [
    { id: 's1', tier: 'small' }, { id: 's2', tier: 'small' },
    { id: 'm1', tier: 'medium' }, { id: 'm2', tier: 'medium' }, { id: 'm3', tier: 'medium' },
    { id: 'l1', tier: 'normal' }, { id: 'l2', tier: 'normal' }, { id: 'l3', tier: 'normal' },
    { id: 'e1', tier: 'elder' }, { id: 'e2', tier: 'elder' }, { id: 'e3', tier: 'elder' },
    { id: 'c1', tier: 'colossal' }
];
const getTier = monster => monster.tier;
const first = HuntJourneyCatalog.build(monsters, getTier, 12345);
const second = HuntJourneyCatalog.build(monsters, getTier, 12345);
assert.deepStrictEqual(first, second, 'the same seed and catalog must reproduce the same journey');
assert.strictEqual(first.length, 15);
assert.strictEqual(first.filter(node => node.type === 'combat').length, 9);
assert.strictEqual(first.filter(node => node.type === 'event').length, 6);
assert.deepStrictEqual(first.map(node => node.type === 'event' ? 'event' : node.tier),
    HuntJourneyCatalog.STAGES.flat());
for (let index = 1; index < first.length; index++) {
    if (first[index].type === 'event' && first[index - 1].type === 'event') {
        assert.notStrictEqual(first[index].eventId, first[index - 1].eventId);
    }
}
first.forEach((node, index) => {
    const stageTemplate = HuntJourneyCatalog.STAGES[node.stageIndex];
    const priorStageNodes = HuntJourneyCatalog.STAGES.slice(0, node.stageIndex).reduce((sum, stage) => sum + stage.length, 0);
    const isStageBoss = index - priorStageNodes === stageTemplate.length - 1;
    if (node.type === 'combat') {
        assert.strictEqual(node.monsterChoices.length, isStageBoss ? 1 : Math.min(node.monsterChoices.length, 3));
        if (isStageBoss) assert.ok(node.monsterId);
        else assert.strictEqual(node.monsterId, null);
    } else {
        assert.ok(node.eventChoices.length >= 2 && node.eventChoices.length <= 3);
        assert.strictEqual(node.eventScope, 'party',
            'destination selection is a party vote; the selected event owns its action scope');
    }
});
const state = HuntRunState.normalize({ runId: 'run-test', seed: 12345, nodes: first });
assert.strictEqual(state.nodes.length, 15);
assert.throws(() => HuntRunState.normalize({ runId: 'bad', nodes: first.slice(0, 14) }), /exactly 15/);
assert.throws(() => HuntJourneyCatalog.build(monsters.filter(monster => monster.tier !== 'elder'), getTier, 1), /elder/);
assert.throws(() => HuntJourneyCatalog.validateEventCatalog({ get() { return null; } }), /missing:/,
    'the route deck and executable event catalog must not silently drift apart');

console.log('[test] Deterministic three-stage 15-node journey catalog passed.');
