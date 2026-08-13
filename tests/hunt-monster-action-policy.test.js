const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const HuntMonsterAnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');

{
    const pattern = {
        id: 'future_monster.lunging_spin',
        movement: { kind: 'lunging-spin', ticks: 36, enragedTicks: 52, untargetable: true }
    };
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.movement(pattern, 'normal'),
        { kind: 'lunging-spin', ticks: 36, untargetable: true }
    );
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.movement(pattern, 'enraged'),
        { kind: 'lunging-spin', ticks: 52, untargetable: true },
        'future monsters must receive state-aware movement locks without an ID branch'
    );
}

{
    const fireball = {
        brokenPartAccuracyModifiers: { head: .75 },
        brokenPartDamageModifiers: { head: .60 }
    };
    const brokenHead = [{ kind: 'head', broken: true }];
    assert.strictEqual(HuntMonsterActionPolicy.brokenPartAccuracyModifier(brokenHead, fireball), .75);
    assert.strictEqual(HuntMonsterActionPolicy.brokenPartDamageModifier(brokenHead, fireball), .60);
}

{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    const scenario = HuntMonsterActionPolicy.resolveTargetScenario({
        pattern: { targeting: { mode: 'return-adjacent-passes' }, impactTimeline: [
            { atTicks: 10, targetMode: 'runtime-pair' },
            { atTicks: 20, targetMode: 'runtime-pair-left' },
            { atTicks: 30, targetMode: 'runtime-pair-right' }
        ] },
        targetable: hunters, count: 2, passCount: 2, random: () => .45,
        mode: 'return-adjacent-passes', defaultTargets: [hunters[1], hunters[2]]
    });
    const pair = scenario.runtime.runtimePairTargets;
    assert.strictEqual(pair.length, 2, 'the reusable pair preset must own exactly two adjacent hunters');
    assert.strictEqual(Math.abs(pair[0] - pair[1]), 1, 'the reusable pair preset must be an adjacent lane');
    assert.deepStrictEqual(scenario.impactTimeline.map(event => event.targetIndices), [
        [...pair], [Math.min(...pair)], [Math.max(...pair)]
    ], '2인 동시/좌/우 must resolve from the same selected pair');
}

{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    const anchored = HuntMonsterActionPolicy.resolveTargetScenario({
        pattern: { targeting: { mode: 'return-adjacent-passes' }, impactTimeline: [
            { atTicks: 10, targetMode: 'runtime-pair-left' },
            { atTicks: 20, targetMode: 'runtime-pair-right' }
        ] },
        targetable: hunters, count: 2, passCount: 2, random: () => 0,
        mode: 'return-adjacent-passes', primaryIndex: 2
    });
    assert.deepStrictEqual(anchored.runtime.runtimePairTargets, [1, 2],
        'an explicit hunter selection must anchor an adjacent two-hunter lane');
}

{
    const hunters = [0, 2, 3].map(index => ({ index }));
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.adjacentLaneTargets(hunters, 2, () => 0).map(target => target.index),
        [0],
        'shared lane targeting must never jump across an empty hunter slot'
    );
    const [outbound, returning] = HuntMonsterActionPolicy.returnAdjacentPasses(
        [0, 1, 2, 3].map(index => ({ index })),
        2,
        () => 0
    );
    assert.strictEqual(Math.abs(outbound[0].index - returning[0].index), 1);
}

{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    const anchored = HuntMonsterActionPolicy.resolveTargetScenario({
        pattern: { impactTimeline: [{ atTicks: 8, targetMode: 'judgment-primary' }] },
        targetable: hunters,
        count: 2,
        random: () => .999,
        mode: 'adjacent-lane',
        defaultTargets: [hunters[1]],
        primaryIndex: 1
    });
    assert.deepStrictEqual(anchored.targets.map(target => target.index), [1],
        'a primary-only judgment must preserve the prepared live target');
    assert.deepStrictEqual(anchored.impactTimeline[0].targetIndices, [1],
        'the authored primary judgment must hit the same hunter used by the visible route');
}

{
    const sourcePattern = {
        id: 'future_monster.submerge',
        phase: { kind: 'burrow', enterVisualMs: 900, emergeVisualMs: 1200 },
        followUp: {
            idSuffix: 'eruption',
            name: '지면 분출',
            type: 'charge',
            damageRatio: 0.4,
            windupTicks: { normal: 10, enraged: 6 },
            tags: ['burrow-emerge'],
            secondaryInterference: { kind: 'tremor', size: 'small' }
        }
    };
    const followUp = HuntMonsterActionPolicy.phasedFollowUp(
        'future_monster',
        'enraged',
        { phase: 'underground', sourcePattern }
    );
    assert.strictEqual(followUp.id, 'future_monster.eruption');
    assert.strictEqual(followUp.windupTicks, 6);
    assert.ok(followUp.tags.includes('locked-target'),
        'every authored phase follow-up must use safe target reacquisition');
    assert.deepStrictEqual(followUp.secondaryInterference, { kind: 'tremor', size: 'small' });
}

{
    const pattern = {
        id: 'future_monster.wall_rush',
        runtimeChargePassSizes: [1, 1],
        whiffReaction: {
            pass: 'last',
            result: 'dodge',
            disabledWhenAllBroken: ['left-tusk', 'right-tusk'],
            kind: 'knockdown'
        }
    };
    const partState = [];
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction(partState, pattern, [
        { result: 'hit' }, { result: 'dodge' }
    ]), true);
    partState.push(
        { kind: 'left-tusk', broken: true },
        { kind: 'right-tusk', broken: true }
    );
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction(partState, pattern, [
        { result: 'hit' }, { result: 'dodge' }
    ]), false, 'authored part damage must be able to disable a whiff opening');
}

{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    const simultaneous = HuntMonsterActionPolicy.resolveTargetScenario({
        pattern: { impactTimeline: [{ atTicks: 8, targetMode: 'all-prepared' }] },
        targetable: hunters,
        count: 3,
        passCount: 3,
        distinctPasses: true,
        random: () => 0,
        mode: 'independent-passes',
        defaultTargets: [hunters[0]]
    });
    assert.deepStrictEqual(simultaneous.impactTimeline[0].targetIndices, [0, 1, 2],
        'all-prepared must preserve a simultaneous multi-lane volley instead of consuming one pass');
    const plan = HuntMonsterActionPolicy.resolveTargetScenario({
        pattern: {
            impactTimeline: [
                { atTicks: 11, targetMode: 'sequential' },
                { atTicks: 24, targetMode: 'sequential' }
            ]
        },
        targetable: hunters,
        count: 2,
        passCount: 2,
        random: () => .6,
        mode: 'adjacent-pair-sequential',
        defaultTargets: [hunters[1]],
        primaryIndex: 1
    });
    assert.deepStrictEqual(plan.impactTimeline.map(event => event.targetIndices), [[1], [2]],
        'an adjacent pair must be struck one hunter at a time from left to right');
    assert.deepStrictEqual(plan.runtime.runtimePivotPairs, [[1, 2]],
        'the selected 1-2, 2-3 or 3-4 boundary must remain one stable pivot pair');
    assert.deepStrictEqual(plan.runtime.runtimePairTargets, [1, 2],
        'pair-left and pair-right judgments must resolve from the same stable adjacent pair');
}

{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    const plan = HuntMonsterActionPolicy.resolveTargeting({
        targetable: hunters,
        count: 2,
        random: () => 0,
        mode: 'return-adjacent-passes'
    });
    assert.deepStrictEqual(plan.targets.map(target => target.index), [0, 1]);
    assert.deepStrictEqual(plan.runtime.runtimeChargePassSizes, [1, 1]);
    assert.deepStrictEqual(plan.runtime.runtimeChargeAnchors, [0, 1]);
}

{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    const plan = HuntMonsterActionPolicy.resolveTargeting({
        targetable: hunters,
        count: 3,
        random: () => 0,
        mode: 'triple-lane-passes'
    });
    assert.deepStrictEqual(plan.targets.map(target => target.index), [0, 1, 2]);
    assert.deepStrictEqual(plan.runtime.runtimeChargePasses, [[0], [1], [2]]);
    const pattern = {
        movement: { ticks: 98 },
        runtimeChargePasses: plan.runtime.runtimeChargePasses,
        impact: { passRatios: [.18, .5, .78] }
    };
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.impactTimeline(pattern).map(event => event.atTicks),
        [18, 49, 76],
        'Rathian three-charge collisions must occur on the three visible hunter crossings'
    );
}

{
    const poisonedTailAttack = { statusBlockedWhenBroken: ['tail'] };
    assert.strictEqual(HuntMonsterActionPolicy.statusAllowed([], poisonedTailAttack), true);
    assert.strictEqual(
        HuntMonsterActionPolicy.statusAllowed([{ kind: 'tail', severed: true }], poisonedTailAttack),
        false,
        'tail severing must remove Rathian poison without deleting the physical somersault'
    );
}

{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    assert.strictEqual(
        HuntMonsterActionPolicy.chargeMode({ type: 'charge', tags: ['charge'] }),
        'single',
        'ordinary charges must keep target-contact lane routing'
    );
    assert.strictEqual(
        HuntMonsterActionPolicy.chargeMode({ type: 'charge', tags: ['charge', 'wide-charge'] }),
        'wide',
        'screen-crossing charges must bypass single-target lane routing'
    );
    const leftToRight = HuntMonsterActionPolicy.resolveTargeting({
        targetable: hunters,
        count: 4,
        random: () => 0,
        mode: 'screen-sweep'
    });
    assert.deepStrictEqual(leftToRight.targets.map(target => target.index), [0, 1, 2, 3]);
    assert.strictEqual(leftToRight.runtime.runtimeSweepDirection, 'left-to-right');
    const rightToLeft = HuntMonsterActionPolicy.resolveTargeting({
        targetable: hunters,
        count: 4,
        random: () => .9,
        mode: 'screen-sweep'
    });
    assert.deepStrictEqual(rightToLeft.targets.map(target => target.index), [3, 2, 1, 0]);
    assert.strictEqual(rightToLeft.runtime.runtimeSweepDirection, 'right-to-left');
}

{
    const pattern = {
        id: 'future_monster.tusk_launch',
        maxTargets: 3,
        movement: { ticks: 40 },
        impact: { delayRatio: 0.6 },
        brokenPartTargetCaps: { tusk: 1 },
        brokenPartDamageModifiers: { tusk: 0.7 }
    };
    const intact = [];
    const broken = [{ kind: 'tusk', broken: true }];
    assert.strictEqual(HuntMonsterActionPolicy.requiresDelayedImpact(pattern), true);
    assert.strictEqual(HuntMonsterActionPolicy.impactDelayTicks(pattern), 24);
    assert.strictEqual(HuntMonsterActionPolicy.effectiveTargetCap(intact, pattern), 3);
    assert.strictEqual(HuntMonsterActionPolicy.effectiveTargetCap(broken, pattern), 1);
    assert.strictEqual(HuntMonsterActionPolicy.brokenPartDamageModifier(broken, pattern), 0.7);
}

{
    const ordinaryAttack = {
        id: 'future_monster.bite',
        type: 'physical',
        damageRatio: 0.2,
        recovery: 10
    };
    assert.strictEqual(HuntMonsterActionPolicy.requiresDelayedImpact(ordinaryAttack), true,
        'ordinary attacks must resolve at contact even without an authored impact block');
    assert.strictEqual(HuntMonsterActionPolicy.requiresDelayedImpact({
        id: 'future_monster.submerge',
        type: 'burrow',
        tags: ['burrow-enter']
    }), false, 'non-damaging phase setup must not invent a collision');

    const combo = HuntMonsterActionPolicy.impactTimeline({
        ...ordinaryAttack,
        repeatByState: { enraged: 3 },
        repeatIntervalTicks: 2
    }, 'enraged');
    assert.deepStrictEqual(combo.map(event => event.atTicks), [5, 7, 9],
        'repeated attacks must expose independent collision ticks');
}

{
    const profile = HuntMonsterAnimationCatalog.resolve({
        id: 'future_monster.signature',
        type: 'charge',
        tags: ['charge'],
        animationProfile: 'ground-charge-double'
    }, '', 'charge', { id: 'future_monster', species: 'Brute Wyvern' });
    assert.strictEqual(profile.id, 'ground-charge-double',
        'animation profiles must be selected by data rather than monster IDs');
}

console.log('[test] Shared monster action policy contract passed.');
