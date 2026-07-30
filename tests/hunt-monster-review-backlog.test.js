'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const planner = require('../scripts/plan-monster-review-batches.js');

const root = path.resolve(__dirname, '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const output = planner.plan({
    policy: read('data/hunt/monster-review-policy.json'),
    roster: read('img/monsters/monsters.json'),
    audit: read('data/hunt/monster-evidence-audit.generated.json'),
    release: read('data/hunt/monster-release-manifest.generated.json')
});
const checkedIn = read('data/hunt/monster-review-backlog.generated.json');

assert.deepStrictEqual(checkedIn, output, 'the checked-in review backlog must be deterministic');
assert.strictEqual(output.summary.released, 20);
assert.strictEqual(output.summary.queued, 238);
assert.deepStrictEqual(
    output.nextBatch.monsters.map(monster => monster.id),
    ['anjanath', 'great_jagras', 'kulu-ya-ku', 'pukei-pukei', 'barroth', 'jyuratodus', 'tobi-kadachi', 'tzitzi-ya-ku']
);
assert.ok(output.batches.every(batch => batch.monsters.length >= 1 && batch.monsters.length <= 8));
assert.strictEqual(new Set(output.batches.flatMap(batch => batch.monsters.map(monster => monster.id))).size, 238);

console.log(`[test] Monster review backlog passed (${output.summary.batches} resumable batches).`);
