'use strict';

const assert = require('assert');
const Policy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const hunters = Array.from({ length: 4 }, (_, index) => ({ index }));

const sequential = Policy.resolveTargetScenario({
    pattern: { impactTimeline: [
        { atTicks: 5, targetMode: 'sequential' },
        { atTicks: 10, targetMode: 'sequential' }
    ] },
    targetable: hunters,
    defaultTargets: [hunters[1], hunters[2]],
    forcedTargetIndices: [1, 2],
    primaryIndex: 1
});
assert.strictEqual(sequential.primaryTargetIndex, 1);
assert.deepStrictEqual(sequential.impactTimeline.map(event => event.targetIndices), [[1], [2]]);

const forced = Policy.resolveTargetScenario({
    pattern: { impactTimeline: [{ atTicks: 5 }, { atTicks: 9, targetMode: 'repeat-previous' }] },
    targetable: hunters,
    defaultTargets: [hunters[0]],
    forcedTargetIndices: [0, 3],
    forcedImpactTargets: [{ impactIndex: 0, targetIndices: [3] }]
});
assert.deepStrictEqual(forced.impactTimeline.map(event => event.targetIndices), [[3], [3]]);
assert.deepStrictEqual(forced.targetIndices, [3]);

const invalid = Policy.resolveTargetScenario({
    pattern: { impactTimeline: [{ atTicks: 5 }] }, targetable: hunters,
    forcedTargetIndices: [9], forcedImpactTargets: [{ impactIndex: 0, targetIndices: [9] }]
});
assert(invalid.warnings.some(warning => warning.includes('target-unavailable:9')));
assert.deepStrictEqual(invalid.targetIndices, []);

const live = Policy.resolveTargetScenario({
    pattern: { impactTimeline: [{ atTicks: 5, targetMode: 'random-live' }] },
    targetable: hunters, defaultTargets: [hunters[2]], forcedTargetIndices: [2]
});
assert.deepStrictEqual(live.targetIndices, [2],
    'an unresolved live impact must retain its prepared target instead of cancelling the turn');
assert.strictEqual(live.impactTimeline[0].targetIndices, null);

const pairAnchoredArea = { motion: [{ beat: 'approach', ticks: 6, to: 'pair:center' }],
    impactTimeline: [{ atTicks: 5, targetMode: 'judgment-all' }] };
const leftPair = Policy.resolveTargetScenario({ pattern: pairAnchoredArea, targetable: hunters,
    defaultTargets: hunters, count: 4, random: () => 0 });
const rightPair = Policy.resolveTargetScenario({ pattern: pairAnchoredArea, targetable: hunters,
    defaultTargets: hunters, count: 4, random: () => .999 });
assert.deepStrictEqual(leftPair.runtime.runtimePairTargets, [0, 1],
    'a pair placement anchor must be able to use the H1-H2 lane');
assert.deepStrictEqual(rightPair.runtime.runtimePairTargets, [2, 3],
    'a pair placement anchor must be able to use the H3-H4 lane instead of always H2-H3');
assert.deepStrictEqual(leftPair.impactTimeline[0].targetIndices, [0, 1, 2, 3],
    'a pair movement anchor must not replace an area action\'s authored recipients');

console.log('[test] shared monster target scenario contract passed');
