'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const batch = JSON.parse(fs.readFileSync(
    path.join(root, 'data/hunt/research/world-iceborne-batch-01.json'),
    'utf8'
));
const backlog = JSON.parse(fs.readFileSync(
    path.join(root, 'data/hunt/monster-review-backlog.generated.json'),
    'utf8'
));

assert.strictEqual(batch.stage, 'evidence-ready');
assert.strictEqual(batch.releaseBlocked, true, 'research alone must never release a monster');
assert.deepStrictEqual(
    batch.monsters.map(monster => monster.id),
    backlog.nextBatch.monsters.map(monster => monster.id)
);
batch.monsters.forEach(monster => {
    assert.ok(monster.sources.some(source => source.language === 'ja' && source.url),
        `${monster.id} needs a Japanese source`);
    monster.sources.filter(source => source.path).forEach(source => {
        assert.ok(fs.existsSync(path.join(root, source.path)), `${monster.id} is missing ${source.path}`);
    });
    assert.ok(monster.findings.length >= 2, `${monster.id} needs observable behavior findings`);
    assert.ok(monster.openGates.includes('preview') && monster.openGates.includes('simulation'));
});

console.log('[test] World batch 01 evidence dossier passed (8 monsters, release blocked).');
