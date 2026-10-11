'use strict';

const assert = require('assert');
const HuntCombatJudgmentRuntime = require('../js/effects/hunt/HuntCombatJudgmentRuntime.js');
const HuntCombatJudgmentResolver = require('../js/effects/hunt/HuntCombatJudgmentResolver.js');

const runtime = new HuntCombatJudgmentRuntime();
const action = {
    id: 'diablos.rage-charge',
    events: [
        { id: 'damage-a', kind: 'damage', atTicks: 10 },
        { id: 'tremor-a', kind: 'tremor', atTicks: 10 },
        { id: 'damage-b', kind: 'damage', atTicks: 20 }
    ]
};
const session = runtime.begin('monster', action, {
    pattern: { id: action.id },
    targetIndex: 1,
    judgmentEvents: [
        { atTicks: 10, targetIndices: [1], damageScale: 1 },
        { atTicks: 20, targetIndices: [2], damageScale: .5 }
    ]
});

runtime.observeBeatEvent('monster', action.events[0]);
runtime.observeBeatEvent('monster', action.events[1]);
runtime.observeBeatEvent('monster', action.events[2]);
const resolved = [];
runtime.drain(command => resolved.push(command));
runtime.drain(command => resolved.push(command));

assert.strictEqual(new Set(resolved.map(command => command.judgmentId)).size, 2,
    'every authored judgment must have a stable unique id');
assert.deepStrictEqual(resolved.map(command => [command.atTicks, command.targetIndices]), [
    [10, [1]], [20, [2]]
], 'multiple BEAT event kinds on one tick must commit one grouped judgment');
assert.ok(resolved.every(command => command.sessionId === session.sessionId));
assert.strictEqual(runtime.recentTrace().filter(entry => entry.type === 'judgment-consumed').length, 2,
    're-draining the outbox must be idempotent');

runtime.complete('monster');
assert.strictEqual(runtime.get('monster'), null);

{
    let cancelled = null;
    const resolver = new HuntCombatJudgmentResolver();
    const result = resolver.resolve({
        monsterState: 'stunned', monsterStunDuration: 4,
        cancelMonsterBeatAction: reason => { cancelled = reason; }
    }, { pattern: { type: 'charge' }, targetIndices: [0] });
    assert.strictEqual(result, false);
    assert.strictEqual(cancelled, 'judgment-interrupted',
        'a control interruption must purge an attached judgment before combat mutation');
}

console.log('[test] deterministic combat judgment runtime passed');
