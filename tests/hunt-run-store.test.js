const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { HuntProfileStore } = require('../tools/hunt-profile-store');
const HuntJourneyCatalog = require('../js/effects/hunt/HuntJourneyCatalog');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bubblechat-hunt-run-'));
const store = new HuntProfileStore(path.join(root, 'runs.sqlite'));
const tiers = ['small', 'medium', 'normal', 'elder', 'colossal'];
const monsters = tiers.map((tier, index) => ({ id: `monster-${index}`, tier }));
const nodes = HuntJourneyCatalog.build(monsters, monster => monster.tier, 9);
try {
    const base = { runId: 'run-9', seed: 9, nodes, status: 'active', nodeIndex: 0, party: [] };
    const first = store.saveRun('channel-a', base, 0);
    assert.strictEqual(first.revision, 1);
    assert.strictEqual(store.getRun('channel-a').runId, 'run-9');
    assert.throws(() => store.saveRun('channel-a', first, 0), error => error.status === 409);
    first.nodeIndex = 1;
    first.nodes[0].status = 'completed';
    const second = store.saveRun('channel-a', first, 1);
    assert.strictEqual(second.revision, 2);
    assert.strictEqual(second.nodeIndex, 1);
    second.status = 'completed';
    const terminal = store.saveRun('channel-a', second, 2);
    assert.strictEqual(terminal.status, 'completed');
    assert.strictEqual(store.getRun('channel-a'), null);
    assert.strictEqual(store.getLatestRunSummary().state.runId, 'run-9');
    assert.strictEqual(store.deleteRun('channel-a'), false);
} finally {
    store.close();
    fs.rmSync(root, { recursive: true, force: true });
}

console.log('[test] Active journey SQLite checkpoint and revision contract passed.');
