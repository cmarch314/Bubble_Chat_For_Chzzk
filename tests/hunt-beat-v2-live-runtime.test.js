'use strict';

const assert = require('assert');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntBeatActionRuntime = require('../js/effects/hunt/HuntBeatActionRuntime.js');

function makeEngine(events) {
    const engine = Object.create(HuntEngine.prototype);
    engine.callbacks = {
        onMonsterBeatActionComplete: action => events.push(`complete:${action.id}`),
        onMonsterBeatActionCancel: (action, reason) => events.push(`cancel:${action.id}:${reason}`),
        onResetMonsterMotion: reason => events.push(`reset:${reason}`)
    };
    engine.monsterBeatRuntimeEvents = [];
    engine.monsterBeatRuntime = new HuntBeatActionRuntime({
        onEvent: (state, event) => {
            engine.monsterBeatRuntimeEvents.push(event);
            engine.dispatchMonsterBeatEvent(state, event);
        },
        onComplete: state => engine.callbacks.onMonsterBeatActionComplete(state.action, state.context),
        onCancel: (state, reason) => engine.callbacks.onMonsterBeatActionCancel(state.action, reason, state.context)
    });
    engine.pendingMonsterAction = null;
    engine.pendingMonsterImpact = null;
    engine.monsterBurrowState = null;
    engine.monsterTraversalState = null;
    engine.monsterTraversalGeneration = 0;
    engine.monsterActionLockTicks = 0;
    engine.monsterActionPresentationTicks = 0;
    engine.selectedMonster = { id: 'diablos' };
    engine.playSFX = (kind, _unused, context) => {
        events.push(`audio:${kind}:${context.patternSlot}`);
        return true;
    };
    return engine;
}

const action = Object.freeze({
    id: 'diablos.horn-charge', backend: 'beat-v2', totalTicks: 6,
    beats: Object.freeze([
        Object.freeze({ id: 'stomp', startTicks: 0, endTicks: 2 }),
        Object.freeze({ id: 'charge', startTicks: 2, endTicks: 5 }),
        Object.freeze({ id: 'recover', startTicks: 5, endTicks: 6 })
    ]),
    events: Object.freeze([
        Object.freeze({ id: 'audio:charge', kind: 'audio', beatId: 'charge', atTicks: 2 }),
        Object.freeze({ id: 'hit:primary', kind: 'judgment', atTicks: 4 })
    ])
});

{
    const events = [];
    const engine = makeEngine(events);
    engine.beginMonsterBeatAction(action, { targetIndex: 1 });
    for (let tick = 0; tick < action.totalTicks; tick++) engine.tickMonsterBeatAction();
    assert.deepStrictEqual(engine.monsterBeatRuntimeEvents.map(event => event.id), ['audio:charge', 'hit:primary'],
        'live runtime must emit the authored gameplay judgment exactly once');
    assert.strictEqual(engine.monsterBeatJudgmentTicks.has(4), true,
        'the emitted BEAT judgment, not a renderer timer, must authorize the live impact tick');
    assert.deepStrictEqual(events, ['audio:monster_attack:beat:charge', 'complete:diablos.horn-charge'],
        'the live action must dispatch authored audio and complete exactly once');
}

{
    const events = [];
    const engine = makeEngine(events);
    engine.beginMonsterBeatAction(action, { patternId: 'horn-charge' });
    assert.strictEqual(engine.isMonsterActionSessionActive(), true,
        'a running BEAT graph must own the complete monster action session');
    for (let tick = 0; tick < action.totalTicks; tick++) engine.tickMonsterBeatAction();
    assert.strictEqual(engine.isMonsterActionSessionActive(), false,
        'the action session lock must release only after the graph completes');
}

{
    const events = [];
    const engine = makeEngine(events);
    engine.pendingMonsterImpact = { pattern: { id: 'horn-charge', tags: [] } };
    engine.monsterTraversalState = { kind: 'charge', remainingTicks: 8 };
    engine.monsterActionPresentationTicks = 8;
    engine.beginMonsterBeatAction(action, { targetIndex: 0 });
    engine.tickMonsterBeatAction();
    engine.interruptMonsterMovement('pitfall');
    assert.strictEqual(engine.monsterBeatRuntime.has('monster'), false,
        'pitfall/control interruption must cancel the live BEAT action');
    assert.strictEqual(engine.pendingMonsterImpact, null,
        'an interrupted action must not leave a delayed impact behind');
    assert.strictEqual(engine.monsterActionPresentationTicks, 0,
        'an interrupted action must not keep presentation debt over a control reaction');
    assert.deepStrictEqual(events, ['cancel:diablos.horn-charge:pitfall', 'reset:pitfall']);
}

console.log('[test] BEAT V2 live runtime completion and interruption passed');
