'use strict';

const assert = require('assert');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

const engine = Object.assign(Object.create(HuntEngine.prototype), {
    monsterHp: 1000,
    selectedMonster: { id: 'diablos', nameKO: '디아브로스' },
    battleTime: 200,
    monsterState: 'knocked_down',
    monsterStunDuration: 0,
    monsterKnockdownDuration: 47,
    activeTrapControl: {
        kind: 'pitfall', elapsedTicks: 17, releaseTicks: 8,
        struggleSchedule: [18, 30, 42], nextStruggleIndex: 1,
        releasing: false, reactionBeatOwned: true
    },
    updateMonsterStateUI: () => {
        throw new Error('trap continuation must not replace its control presentation');
    },
    interruptMonsterMovement: () => {
        throw new Error('trap continuation must not cancel the active trap graph');
    },
    beginMonsterReactionBeat: () => {
        throw new Error('trap continuation must not replace the active reaction graph');
    }
});

assert.strictEqual(engine.enterMonsterControlState('stun', 60), true);
assert.strictEqual(engine.monsterState, 'knocked_down');
assert.strictEqual(engine.monsterStunDuration, 0,
    'a KO during pitfall is represented by the pitfall continuation, not a second stun timer');
assert.strictEqual(engine.monsterKnockdownDuration, 68,
    'the continuation must reserve five 1.2s struggles plus the authored escape');
assert.deepStrictEqual(engine.activeTrapControl.struggleSchedule, [29, 41, 53, 65, 77],
    'stun during a pitfall must reschedule exactly five complete future struggles');
assert.strictEqual(engine.activeTrapControl.nextStruggleIndex, 0);
assert.strictEqual(engine.activeTrapControl.forcedStruggleCount, 5);

console.log('[test] Pitfall stun continuity passed.');
