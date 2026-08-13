'use strict';

const assert = require('assert');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

function provisionalResult(index = 2) {
    const part = {
        health: 0,
        damageAccumulated: 20,
        flinchAccumulated: 3,
        postBreakDamageAccumulated: 4,
        broken: false,
        severed: false,
        breakPending: true,
        hitzones: { slash: .5 }
    };
    return {
        part,
        sourceHunterIndex: index,
        sourceActionId: 'hammer.overhead_smash',
        impactConfirmed: false,
        partStateBeforeImpact: {
            health: 10,
            damageAccumulated: 0,
            flinchAccumulated: 0,
            postBreakDamageAccumulated: 0,
            broken: false,
            severed: false,
            breakPending: false,
            hitzones: { slash: 1 }
        }
    };
}

const cancelled = provisionalResult();
const cancelledEngine = {
    pendingMonsterPartReactions: [cancelled],
    monsterBeatRuntime: { get: () => null },
    monsterState: 'normal',
    monsterKnockdownDuration: 0,
    monsterStunDuration: 0,
    monsterActionLockTicks: 0,
    monsterActionPresentationTicks: 0,
    pendingMonsterAction: null,
    pendingMonsterImpact: null,
    monsterTraversalState: null,
    monsterBurrowState: null,
    monsterRoarDuration: 0
};
assert.strictEqual(HuntEngine.prototype.flushPendingMonsterPartReaction.call(cancelledEngine), false,
    'a cancelled swing must not release its provisional part reaction');
assert.strictEqual(cancelledEngine.pendingMonsterPartReactions.length, 0);
assert.deepStrictEqual(cancelled.part, {
    health: 10,
    damageAccumulated: 0,
    flinchAccumulated: 0,
    postBreakDamageAccumulated: 0,
    broken: false,
    severed: false,
    breakPending: false,
    hitzones: { slash: 1 }
});

const active = provisionalResult(3);
const activeEngine = {
    ...cancelledEngine,
    pendingMonsterPartReactions: [active],
    monsterBeatRuntime: {
        get: key => key === 'hunter:3'
            ? { context: { action: { id: 'hammer.overhead_smash' } } }
            : null
    }
};
assert.strictEqual(HuntEngine.prototype.flushPendingMonsterPartReaction.call(activeEngine), false,
    'a provisional reaction must wait while its authored swing approaches HIT');
assert.strictEqual(activeEngine.pendingMonsterPartReactions.length, 1);
assert.strictEqual(active.part.breakPending, true);

assert.strictEqual(HuntEngine.prototype.confirmPendingHunterPartImpact.call(
    activeEngine,
    3,
    'hammer.overhead_smash',
    { id: 'hammer.overhead_smash:hit:1', kind: 'damage' }
), true);
assert.strictEqual(active.impactConfirmed, true,
    'the authored BEAT damage event must commit the pending reaction');

console.log('[test] Deferred part reactions require their hunter BEAT impact.');
