'use strict';

const assert = require('assert');
const { HuntBeatV2Contract, HuntBeatV2ContractError } = require('../js/effects/hunt/HuntBeatV2Contract.js');
const HuntBeatActionRuntime = require('../js/effects/hunt/HuntBeatActionRuntime.js');

const action = HuntBeatV2Contract.compile({
    schemaVersion: 2,
    backend: 'beat-v2',
    reviewStatus: 'approved',
    id: 'test.charge',
    actor: 'monster',
    atb: { cost: 42, recovery: 'during-action', gateUntil: 'complete' },
    beats: [
        { id: 'windup', ticks: 3, tracks: { body: [
            { offsetTicks: 0, x: 0 }, { offsetTicks: 3, x: -20 }
        ] } },
        { id: 'charge', ticks: 4, events: [
            { id: 'charge-hit', kind: 'damage', offsetTicks: 2, target: 'primary' },
            { id: 'charge-se', kind: 'audio', offsetTicks: 2, slot: 'beat:charge' }
        ] },
        { id: 'recover', ticks: 2 }
    ]
});

assert.strictEqual(action.totalTicks, 9);
assert.deepStrictEqual(action.beats.map(beat => [beat.id, beat.startTicks, beat.endTicks]), [
    ['windup', 0, 3], ['charge', 3, 7], ['recover', 7, 9]
]);
assert.deepStrictEqual(action.events.map(event => [event.id, event.atTicks]), [
    ['charge-hit', 5], ['charge-se', 5]
]);
assert(Object.isFrozen(action) && Object.isFrozen(action.beats[0].tracks.body));

assert.throws(() => HuntBeatV2Contract.compile({
    schemaVersion: 2, backend: 'beat-v2', reviewStatus: 'approved',
    id: 'bad.legacy', actor: 'monster', impactTimeline: [{ atTicks: 3 }],
    beats: [{ id: 'hit', ticks: 3 }]
}), HuntBeatV2ContractError, 'approved actions must reject a second legacy impact owner');
assert.throws(() => HuntBeatV2Contract.compile({
    schemaVersion: 2, backend: 'beat-v2', id: 'bad.event', actor: 'hunter',
    beats: [{ id: 'hit', ticks: 2, events: [{ id: 'late', kind: 'damage', offsetTicks: 2 }] }]
}), /offsetTicks/, 'events must remain inside their owning beat');

const trace = [];
const runtime = new HuntBeatActionRuntime({
    onBegin: state => trace.push(`begin:${state.action.id}`),
    onBeat: (_state, beat) => trace.push(`beat:${beat.id}`),
    onEvent: (_state, event) => trace.push(`event:${event.id}`),
    onComplete: state => trace.push(`complete:${state.action.id}`),
    onCancel: (_state, reason) => trace.push(`cancel:${reason}`)
});
runtime.begin('monster', action);
for (let tick = 0; tick < action.totalTicks; tick += 1) runtime.tick('monster');
assert.deepStrictEqual(trace, [
    'begin:test.charge', 'beat:windup', 'beat:charge',
    'event:charge-hit', 'event:charge-se', 'beat:recover', 'complete:test.charge'
]);
assert.strictEqual(runtime.activeCount(), 0);

runtime.begin('monster', action);
runtime.tick('monster');
assert.strictEqual(runtime.cancel('monster', 'stun'), true);
for (let tick = 0; tick < 20; tick += 1) runtime.tick('monster');
assert.strictEqual(trace.at(-1), 'cancel:stun', 'cancelled actions must never emit delayed events');
assert.strictEqual(runtime.activeCount(), 0);

console.log('[test] BEAT V2 contract and tick runtime passed');
