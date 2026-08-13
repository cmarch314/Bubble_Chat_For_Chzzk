'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
assert.strictEqual(HuntAtbConfig.monsterEncounterStartAtb(), 75,
    'monsters must enter combat with exactly 25% of their ATB depleted');
const AnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const ActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const TurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const released = require('../js/effects/hunt/data/ReleasedMonsterRuntimeIndex.generated.js');

const timingFor = (monster, pattern, state, recoveryPerTick) => {
    const stateRate = pattern.fixedWindup
        ? 1
        : state === 'enraged' ? 0.78 : state === 'exhausted' ? 1.28 : 1;
    const windupTicks = Math.max(1, Math.round(
        Number(pattern.windupTicks || 1) * (pattern.tags?.includes('burrow-emerge') ? 1 : stateRate)
    ));
    const animationTicks = Math.max(1, Math.ceil(
        AnimationCatalog.resolve(pattern, pattern.name, pattern.type, monster).duration / 100
    ));
    const movementTicks = Number(ActionPolicy.movement(pattern, state)?.ticks || 0);
    const impactTimelineTicks = Math.max(0, ...(pattern.impactTimeline || [])
        .map(event => Number(event?.atTicks || 0)));
    const postWindupTicks = Math.max(
        animationTicks,
        movementTicks,
        impactTimelineTicks
    );
    return {
        windupTicks,
        animationTicks,
        movementTicks,
        impactTimelineTicks,
        postWindupTicks,
        occupancyTicks: windupTicks + postWindupTicks,
        recoveryPerTick
    };
};

let auditedPatterns = 0;
let debtPatterns = 0;
for (const monster of released) {
    const monsterPatterns = profiles[monster.id] || [];
    assert.ok(monsterPatterns.length > 0, `${monster.id} needs a reviewed runtime pattern profile`);
    for (const pattern of monsterPatterns) {
        for (const [state, recoveryPerTick] of [['normal', 1.15], ['enraged', 1.725]]) {
            const timing = timingFor(monster, pattern, state, recoveryPerTick);
            const recoverySeconds = HuntAtbConfig.monsterPostActionRecoverySeconds(pattern);
            assert.ok(recoverySeconds >= 1 && recoverySeconds <= 3,
                `${monster.id}/${pattern.id} recovery must remain within 1-3 seconds`);
            const postGap = recoverySeconds
                * HuntAtbConfig.TICKS_PER_SECOND
                * recoveryPerTick
                * (Number(pattern.monsterAtbCostMultiplier) || 1);
            const expectedCost = Math.min(
                HuntAtbConfig.GAUGE_MAX * HuntAtbConfig.MAX_MONSTER_ACTION_DEBT_GAUGES,
                timing.occupancyTicks * recoveryPerTick + postGap
            );
            const cost = HuntAtbConfig.monsterActionCostGauge(pattern, timing);
            assert.ok(
                Math.abs(cost - expectedCost) <= 0.000001,
                `${monster.id}/${pattern.id}/${state} ATB cost must equal visible occupancy plus its 1-3 second recovery`
            );
            const atbAfterVisibleMotion = 100 - cost + timing.occupancyTicks * recoveryPerTick;
            assert.ok(
                atbAfterVisibleMotion <= 100 - postGap + 0.000001,
                `${monster.id}/${pattern.id}/${state} must not refill before its visible motion ends`
            );
            if (cost > 100) debtPatterns++;
            auditedPatterns++;
        }
    }
}

assert.ok(debtPatterns > 0, 'long monster animations must be able to create ATB debt beyond one gauge');
assert.strictEqual(
    HuntAtbConfig.monsterActionCostGauge(
        { type: 'physical', damageRatio: 0.2, monsterAtbCost: 1 },
        { occupancyTicks: 60, recoveryPerTick: 1 }
    ),
    71,
    'a six-second light animation must ignore fixed legacy costs and add its damage-scaled 1.1-second recovery'
);

assert.strictEqual(
    HuntAtbConfig.monsterPostActionRecoverySeconds({
        type: 'physical', damageRatio: 0.3, tags: ['physical', 'weak']
    }),
    1.3,
    'damage must continuously tune recovery even when an obsolete strength tag disagrees'
);

assert.ok(
    HuntAtbConfig.monsterPostActionRecoverySeconds({
        type: 'physical', damageRatio: 0.7, maxTargets: 4, tags: ['multi-hit']
    }) > HuntAtbConfig.monsterPostActionRecoverySeconds({
        type: 'physical', damageRatio: 0.25, maxTargets: 1
    }),
    'high-damage team-wide chains must leave a longer opening than a light single-target hit'
);

assert.strictEqual(
    HuntAtbConfig.monsterActionCostGauge(
        { type: 'ultimate', damageRatio: 0.9, monsterAtbCost: 0.1 },
        { occupancyTicks: 10, recoveryPerTick: 1 }
    ),
    40,
    'a one-second ultimate must add its three-second recovery without using an undersized legacy cost'
);

const bazelBodyPress = profiles.bazelgeuse.find(pattern => pattern.id === 'bazelgeuse.body_press');
const bazelBodyPressTiming = timingFor(
    released.find(monster => monster.id === 'bazelgeuse'),
    bazelBodyPress,
    'normal',
    1.15
);
assert.strictEqual(bazelBodyPress.postActionRecoverySeconds, 1,
    'Bazelgeuse body press must declare its short landing recovery');
assert.strictEqual(bazelBodyPressTiming.animationTicks, 30,
    'Bazelgeuse body press visual occupancy must remain a short three-second slam');

const longCharge = profiles.diablos.find(pattern => pattern.id === 'diablos.rage_charge');
const preparedEngine = {
    selectedWeapons: [{ index: 0, status: 'alive' }],
    selectedMonster: { id: 'diablos', nameKO: '디아블로스', species: 'Flying Wyvern' },
    MONSTER_PATTERNS: { diablos: [longCharge] },
    monsterPatternSelector: { select: () => longCharge },
    monsterFlightRuntime: null,
    smallMonsterSwarm: null,
    monsterState: 'enraged',
    monsterTier: 'large',
    monsterHp: 100,
    monsterMaxHp: 100,
    monsterUltimateUsedInRage: false,
    monsterPartState: [],
    monsterSpeed: 1.725,
    monsterAtb: 100,
    callbacks: {},
    updateMonsterAtbUI() {},
    playSFX() {},
    showSkillBubble() {},
    addLog() {}
};
assert.strictEqual(TurnExecutor.prepare(preparedEngine), true);
assert.ok(preparedEngine.monsterAtb < 0,
    'preparing a long enraged charge must retain action debt below zero');
assert.ok(preparedEngine.pendingMonsterAction.timing.occupancyTicks >= 100,
    'the prepared action must preserve its measured visual occupancy for diagnostics');

const executorSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'),
    'utf8'
);
const rendererSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'),
    'utf8'
);
assert.match(executorSource, /Number\(engine\.monsterAtb \|\| 0\) - actionCost/,
    'monster execution must retain negative ATB debt instead of clamping it away');
assert.doesNotMatch(executorSource, /Math\.max\(0,\s*Number\(engine\.monsterAtb \|\| 0\) - actionCost\)/,
    'monster action spending must never erase long-animation debt');
assert.match(rendererSource, /Math\.max\(0,\s*Math\.min\(100,\s*Number\(atb \|\| 0\)\)\)/,
    'negative internal ATB debt must render as an empty, valid-width bar');

console.log(`[test] Monster ATB cadence audited ${auditedPatterns} state-pattern pairs; ${debtPatterns} require debt beyond one gauge.`);
