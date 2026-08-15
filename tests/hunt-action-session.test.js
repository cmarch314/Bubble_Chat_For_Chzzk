'use strict';

const assert = require('node:assert/strict');
const { HuntBeatV2Contract } = require('../js/effects/hunt/HuntBeatV2Contract.js');
const HuntActionSession = require('../js/effects/hunt/HuntActionSession.js');

const graph = HuntBeatV2Contract.compile({
    id: 'session-fixture',
    actor: 'monster',
    backend: 'beat-v2',
    schemaVersion: 2,
    reviewStatus: 'draft',
    beats: [
        { id: 'windup', ticks: 2, events: [{ id: 'windup-cue', kind: 'audio', offsetTicks: 1 }] },
        { id: 'impact', ticks: 2, events: [{ id: 'impact-hit', kind: 'damage', target: 'primary', offsetTicks: 0 }] }
    ]
});

const events = [];
const session = new HuntActionSession({
    action: graph,
    mode: 'preview',
    presentationOnly: true,
    sessionId: 'test-session',
    callbacks: { onEvent: (_state, event) => events.push(event.id) }
});

assert.equal(session.start({ targetIndex: 0 }), true);
assert.equal(session.status, 'running');
session.step(1);
assert.deepEqual(events, ['windup-cue']);
session.pause();
assert.equal(session.step(1), session.state, 'paused sessions do not advance the clock');
assert.deepEqual(events, ['windup-cue']);
session.resume();
session.step(3);
assert.equal(session.status, 'completed');
assert.deepEqual(events, ['windup-cue', 'impact-hit']);

session.seek(3);
assert.equal(session.snapshot().tick, 3);
assert.deepEqual(events, ['windup-cue', 'impact-hit'], 'scrubbing does not replay audio or combat events');

session.stop('test-stop');
assert.equal(session.status, 'cancelled');
assert.equal(session.runtime.has('monster'), false);

console.log('hunt-action-session.test.js: ok');
