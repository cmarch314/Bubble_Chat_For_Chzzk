const assert = require('assert');
global.HuntRunState = require('../js/effects/hunt/HuntRunState');
global.HuntJourneyCatalog = require('../js/effects/hunt/HuntJourneyCatalog');
const HuntRunDirector = require('../js/effects/hunt/HuntRunDirector');
const HuntJourneyEventEngine = require('../js/effects/hunt/HuntJourneyEventEngine');

(async () => {
    let stored = null;
    const client = {
        load: async () => stored,
        remove: async () => { stored = null; return null; },
        save: async (_key, state, revision) => {
            if (stored && stored.revision !== revision) return null;
            stored = JSON.parse(JSON.stringify(state));
            stored.revision = revision + 1;
            return stored;
        }
    };
    const tiers = ['small', 'medium', 'normal', 'elder', 'colossal'];
    const monsters = tiers.map((tier, index) => ({ id: `m-${index}`, tier }));
    const director = new HuntRunDirector({ client, channelKey: 'channel' });
    await director.loadOrCreate(monsters, monster => monster.tier, 77);
    assert.strictEqual(director.state.revision, 1);
    const firstId = director.currentNode().id;
    await director.completeCurrentNode({ zenny: 1 });
    assert.strictEqual(director.state.nodeIndex, 1);
    assert.strictEqual(director.state.nodes[0].id, firstId);
    assert.strictEqual(director.state.nodes[0].status, 'completed');
    const beforeRejectedCheckpoint = JSON.parse(JSON.stringify(director.state));
    stored.revision++;
    await assert.rejects(() => director.checkpoint({ zenny: 9 }), /checkpoint was rejected/);
    assert.deepStrictEqual(director.state, beforeRejectedCheckpoint,
        'a rejected checkpoint must not mutate the live journey state');
    stored.revision--;
    await Promise.all([
        director.checkpoint({ zenny: 2 }),
        director.checkpoint({ rerolls: 1 })
    ]);
    assert.deepStrictEqual({ zenny: director.state.zenny, rerolls: director.state.rerolls }, { zenny: 2, rerolls: 1 },
        'concurrent runtime checkpoints must serialize instead of fighting over one revision');
    const revision = director.state.revision;
    director.state.nodeIndex = 0;
    await director.completeCurrentNode();
    assert.strictEqual(director.state.revision, revision, 'a completed node callback must be idempotent');

    const resumed = new HuntRunDirector({ client, channelKey: 'channel' });
    await resumed.loadOrCreate(monsters, monster => monster.tier, 999);
    assert.strictEqual(resumed.state.runId, director.state.runId);
    assert.strictEqual(resumed.state.seed, 77);

    const eventEngine = new HuntJourneyEventEngine();
    while (resumed.state.status === 'active') {
        await resumed.resolveAutomaticEvents(eventEngine);
        if (resumed.currentNode()?.type === 'combat') await resumed.completeCurrentNode();
    }
    assert.strictEqual(resumed.state.nodeIndex, HuntRunState.NODE_COUNT);
    assert.strictEqual(resumed.state.status, 'completed');
    assert.strictEqual(resumed.state.lockLimit, 3);
    assert.strictEqual(resumed.state.eventLog.length, 6);
    assert.ok(resumed.state.eventLog.every(entry => entry.summary.length > 0));
    const completedRunId = resumed.state.runId;
    const fresh = new HuntRunDirector({ client, channelKey: 'channel' });
    await fresh.loadOrCreate(monsters, monster => monster.tier, 88);
    assert.notStrictEqual(fresh.state.runId, completedRunId, 'terminal run must release the active-run slot');
    assert.strictEqual(fresh.state.seed, 88);
    console.log('[test] Journey director create, checkpoint, idempotency, and resume passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
