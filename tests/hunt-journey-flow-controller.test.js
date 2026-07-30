const assert = require('assert');
const HuntJourneyFlowController = require('../js/effects/hunt/HuntJourneyFlowController');

(async () => {
    const nodes = [{ type: 'event' }, { type: 'ambush' }, { type: 'combat' }];
    let index = 0;
    const prepared = [];
    const effect = {
        huntMode: 'journey',
        runDirector: { state: { status: 'active' }, currentNode: () => nodes[index] || null },
        showJourneyTravelMap: async node => prepared.push(`travel:${node.type}`),
        runJourneyEventChoices: async () => { prepared.push('event'); index++; },
        prepareJourneyCombatNode: node => prepared.push(node.type),
        execute: async context => prepared.push(context.internalContinuation ? 'continued' : 'started'),
        journeySettlementPromise: Promise.resolve(),
        resolveGame: () => prepared.push('resolved')
    };
    const flow = new HuntJourneyFlowController(effect);
    flow.register('ambush', async () => { prepared.push('ambush'); index++; return true; });
    await flow.prepareCurrent([]);
    assert.deepStrictEqual(prepared, ['travel:event', 'event', 'travel:ambush', 'ambush', 'travel:combat', 'combat']);
    assert.ok(await flow.continueAfterResult(true));
    await Promise.resolve();
    assert.ok(prepared.includes('continued'));
    assert.throws(() => flow.register('', () => {}));
    console.log('[test] Extensible journey node registry and continuation contract passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
