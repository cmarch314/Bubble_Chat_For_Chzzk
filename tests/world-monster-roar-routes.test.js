'use strict';

const assert = require('assert');
const { resolveWorldMonsterRoars } = require('../scripts/resolve-world-monster-roars');

const result = resolveWorldMonsterRoars({
    clips: [{
        bank: 'em007_vo', wemOrdinal: 54, label: 'Diablos roar',
        actionFamily: 'monster_roar', evidence: { type: 'labelled-community-map' }
    }]
}, {
    entries: [
    {
        path: 'local/em007_groan.mp3', category: 'monster',
        sourceBank: 'chunk/sound/em007_vo.nbnk', stream: 54,
        sourceStream: '520295467', wwiseEventIds: ['2109899398'],
        wwiseSourceIds: ['520295467']
    },
    {
        path: 'local/em007_fill_55.mp3', category: 'monster',
        sourceBank: 'chunk/sound/em007_vo.nbnk', stream: 55,
        sourceStream: '530282413', wwiseEventIds: ['761965276'],
        wwiseSourceIds: ['530282413']
    },
    {
        path: 'local/em007_roar.mp3', category: 'monster',
        sourceBank: 'chunk/sound/em007_vo.nbnk', stream: 56,
        sourceStream: '543762063', wwiseEventIds: ['1263597779'],
        wwiseSourceIds: ['543762063']
    }]
}, { em007_vo: ['diablos'] }, {
    em007_vo: {
        sourceStream: '543762063',
        eventIds: ['1263597779'],
        label: 'Diablos signature roar',
        verification: 'user-audition'
    }
});

const cue = result.routes['diablos:roar'][0];
assert.deepStrictEqual(cue.layers, [['local/em007_roar.mp3', 0.78, 0]]);
assert.strictEqual(cue.evidence.type, 'world-user-audition-event-chain');
assert.strictEqual(cue.evidence.ordinalBasis, 'audition-confirmed-source');
assert.strictEqual(cue.evidence.referenceWemNumber, 54);
assert.strictEqual(cue.evidence.decodedStream, 56);
assert.deepStrictEqual(cue.evidence.eventIds, ['1263597779']);
assert.deepStrictEqual(cue.evidence.sourceIds, ['543762063']);
assert.strictEqual(result.unresolved.length, 0);
assert.deepStrictEqual(
    result.review[0].candidates.map(candidate => candidate.decodedStream),
    [54],
    'the synthetic bank exposes its workbook-direct candidate'
);

const broken = resolveWorldMonsterRoars({
    clips: [{ bank: 'em007_vo', wemOrdinal: 0, label: 'Diablos roar', actionFamily: 'monster_roar' }]
}, {
    entries: [{
        path: 'local/wrong.mp3', category: 'monster', sourceBank: 'em007_vo.nbnk', stream: 54,
        sourceStream: '999', wwiseEventIds: [], wwiseSourceIds: ['999']
    }]
}, { em007_vo: ['diablos'] });
assert.strictEqual(broken.routes['diablos:roar'], undefined,
    'a bank/index label without a real event-to-source chain must not become a roar');
assert.strictEqual(broken.unresolved[0].reason, 'missing-event-chain');

const ambiguous = resolveWorldMonsterRoars({
    clips: [
        { bank: 'em024_vo', wemOrdinal: 0, label: 'candidate A', actionFamily: 'monster_roar' },
        { bank: 'em024_vo', wemOrdinal: 1, label: 'candidate B', actionFamily: 'monster_roar' }
    ]
}, {
    entries: [
        {
            path: 'local/a.mp3', category: 'monster', sourceBank: 'em024_vo.nbnk', stream: 1,
            sourceStream: '100', wwiseEventIds: ['200'], wwiseSourceIds: ['100']
        },
        {
            path: 'local/b.mp3', category: 'monster', sourceBank: 'em024_vo.nbnk', stream: 2,
            sourceStream: '101', wwiseEventIds: ['201'], wwiseSourceIds: ['101']
        }
    ]
}, { em024_vo: ['kushala_daora'] });
assert.strictEqual(ambiguous.routes['kushala_daora:roar'], undefined,
    'community alternatives must remain silent until one candidate is audition-confirmed');
assert.strictEqual(ambiguous.unresolved[0].reason, 'needs-audition');

const divergentNumbering = resolveWorldMonsterRoars({
    clips: [{ bank: 'em001_vo', wemOrdinal: 1, label: 'review candidate', actionFamily: 'monster_roar' }]
}, {
    entries: [
        { path: 'local/stream1.mp3', category: 'monster', sourceBank: 'em001_vo.nbnk', stream: 1, sourceStream: '100', wwiseEventIds: ['10'], wwiseSourceIds: ['100'] },
        { path: 'local/stream2.mp3', category: 'monster', sourceBank: 'em001_vo.nbnk', stream: 2, sourceStream: '200', wwiseEventIds: ['20'], wwiseSourceIds: ['200'] },
        { path: 'local/stream4.mp3', category: 'monster', sourceBank: 'em001_vo.nbnk', stream: 4, sourceStream: '300', wwiseEventIds: ['30'], wwiseSourceIds: ['300'] }
    ]
}, { em001_vo: ['rathian'] });
assert.deepStrictEqual(
    divergentNumbering.review[0].candidates.map(candidate => candidate.decodedStream),
    [1, 2],
    'review must expose direct-stream and decoded-index interpretations when they diverge'
);

const speciesScoped = resolveWorldMonsterRoars({
    clips: [{
        bank: 'em001_vo', wemOrdinal: 0, label: 'Rath family roar',
        actionFamily: 'monster_roar', evidence: { type: 'labelled-community-map' }
    }]
}, {
    entries: [{
        path: 'local/rathalos-roar.mp3', category: 'monster', sourceBank: 'em001_vo.nbnk',
        stream: 91, sourceStream: '721725382', wwiseEventIds: ['1991097789'],
        wwiseSourceIds: ['721725382']
    }]
}, { em001_vo: ['rathian', 'rathalos'] }, {
    em001_vo: {
        sourceStream: '721725382',
        eventIds: ['1991097789'],
        monsterIds: ['rathalos'],
        label: 'Rathalos signature roar',
        verification: 'user-audition'
    }
});
assert.ok(speciesScoped.routes['rathalos:roar']);
assert.strictEqual(speciesScoped.routes['rathian:roar'], undefined,
    'a user-confirmed Rathalos source must not silently become Rathian voice');

console.log('[test] World monster roar candidate and audition-confirmation resolution passed.');
