'use strict';

const assert = require('assert');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntBeatActionRuntime = require('../js/effects/hunt/HuntBeatActionRuntime.js');
const HuntCombatJudgmentRuntime = require('../js/effects/hunt/HuntCombatJudgmentRuntime.js');
const Catalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require(
    '../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');

function makeEngine(events) {
    const engine = Object.create(HuntEngine.prototype);
    engine.callbacks = {
        onMonsterBeatActionComplete: action => events.push(`complete:${action.id}`),
        onMonsterBeatActionCancel: (action, reason) => events.push(`cancel:${action.id}:${reason}`),
        onResetMonsterMotion: reason => events.push(`reset:${reason}`)
    };
    engine.monsterBeatRuntimeEvents = [];
    engine.combatJudgmentRuntime = new HuntCombatJudgmentRuntime();
    engine.monsterBeatRuntime = new HuntBeatActionRuntime({
        onEvent: (state, event) => {
            engine.monsterBeatRuntimeEvents.push(event);
            engine.dispatchMonsterBeatEvent(state, event);
        },
        onComplete: state => {
            engine.combatJudgmentRuntime.complete(state.actorKey);
            engine.callbacks.onMonsterBeatActionComplete(state.action, state.context);
        },
        onCancel: (state, reason) => {
            engine.combatJudgmentRuntime.cancel(state.actorKey, reason);
            engine.callbacks.onMonsterBeatActionCancel(state.action, reason, state.context);
        }
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
    const resolved = [];
    engine.beginMonsterBeatAction(action, {
        targetIndex: 1,
        judgmentEvents: [{ atTicks: 4, targetIndices: [1], damageScale: 1 }]
    });
    for (let tick = 0; tick < action.totalTicks; tick++) {
        engine.tickMonsterBeatAction();
        engine.combatJudgmentRuntime.drain(command => resolved.push(command));
    }
    assert.deepStrictEqual(engine.monsterBeatRuntimeEvents.map(event => event.id), ['audio:charge', 'hit:primary'],
        'live runtime must emit the authored gameplay judgment exactly once');
    assert.deepStrictEqual(resolved.map(command => [command.atTicks, command.targetIndices]), [[4, [1]]],
        'the emitted BEAT judgment must resolve exactly once without a renderer countdown');
    assert.deepStrictEqual(events, ['audio:monster_attack:beat:charge', 'complete:diablos.horn-charge'],
        'the live action must dispatch authored audio and complete exactly once');
}

{
    const diablosPatterns = Catalog.build({}).diablos;
    const roar = diablosPatterns.find(pattern => pattern.id === 'diablos.roar');
    assert.deepStrictEqual(roar.beatV2.beats.map(beat => [beat.id, beat.endTicks]), [
        ['brace', 10], ['roar', 12], ['settle', 45]
    ], 'live Diablos roar must retain all three Preview-authored parts');
    const events = [];
    const engine = makeEngine(events);
    engine.beginMonsterBeatAction(roar.beatV2, { pattern: roar });
    for (let tick = 0; tick < 44; tick++) {
        engine.tickMonsterBeatAction();
        assert.strictEqual(engine.isMonsterActionSessionActive(), true,
            `Diablos roar released its next-action gate early at tick ${tick + 1}`);
    }
    engine.tickMonsterBeatAction();
    assert.strictEqual(engine.isMonsterActionSessionActive(), false,
        'Diablos roar must release only after the final settle tick');

    for (const pattern of diablosPatterns) {
        const runtime = makeEngine([]);
        runtime.beginMonsterBeatAction(pattern.beatV2, { pattern });
        for (let tick = 1; tick < pattern.beatV2.totalTicks; tick++) {
            runtime.tickMonsterBeatAction();
            assert.strictEqual(runtime.isMonsterActionSessionActive(), true,
                `${pattern.id} released its action gate before its Preview graph completed`);
        }
        runtime.tickMonsterBeatAction();
        assert.strictEqual(runtime.isMonsterActionSessionActive(), false,
            `${pattern.id} did not release its action gate at graph completion`);
    }
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
    const engine = makeEngine([]);
    engine.activeTrapControl = { kind: 'pitfall', releasing: true };
    assert.strictEqual(engine.isMonsterActionSessionActive(), true,
        'trap escape and renderer handoff must remain part of the authoritative monster session');
    engine.activeTrapControl = null;
    assert.strictEqual(engine.isMonsterActionSessionActive(), false);
}

{
    const events = [];
    const engine = makeEngine(events);
    engine.beginMonsterBeatAction(action, { patternId: action.id });
    engine.monsterTraversalState = { kind: 'charge', remainingTicks: 0 };
    engine.monsterActionLockTicks = 5;
    engine.clearMonsterTraversal('complete');
    assert.deepStrictEqual(events, [],
        'a completed movement sub-track must not erase the parent BEAT recovery motion');
    assert.strictEqual(engine.monsterActionLockTicks, 5,
        'a movement helper must not release the parent action lock');
    engine.interruptMonsterMovement('part-break:head');
    assert.deepStrictEqual(events, [
        'cancel:diablos.horn-charge:part-break:head',
        'reset:part-break:head'
    ], 'an explicit control interruption must cancel and reset the whole action atomically');
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
