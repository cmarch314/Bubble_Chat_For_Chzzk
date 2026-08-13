'use strict';

const assert = require('assert');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterPatternCatalog = HuntMonsterPatternCatalog;
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const motionOverrides = require('../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');
const HuntBeatV2Adapter = require('../js/effects/hunt/HuntBeatV2Adapter.js');
const HuntMotionCompiler = require('../js/effects/hunt/HuntMotionCompiler.js');
const HuntStageAnchors = require('../js/effects/hunt/HuntStageAnchors.js');

assert.strictEqual(profiles.diablos.length, 9, 'the approved Diablos attack kit must remain complete');
for (const pattern of profiles.diablos) {
    const reviewed = {
        ...pattern,
        motion: pattern.motion.map(beat => ({
            ...beat,
            ...(motionOverrides.diablos?.[pattern.id]?.beats?.[beat.beat] || {})
        }))
    };
    const synchronized = HuntMonsterPatternCatalog.synchronizeMotionTiming(reviewed);
    const compiled = HuntBeatV2Adapter.fromMonsterPattern(reviewed, {
        monsterId: 'diablos',
        reviewStatus: 'approved'
    });
    assert.strictEqual(compiled.totalTicks,
        reviewed.motion.reduce((sum, beat) => sum + Math.max(1, Math.round(Number(beat.ticks) || 1)), 0),
        `${pattern.id} must preserve its approved total duration`);
    assert.deepStrictEqual(
        HuntBeatV2Adapter.gameplayEventTicks(compiled),
        (synchronized.impactTimeline || []).map(event => Number(event.atTicks)).sort((a, b) => a - b),
        `${pattern.id} preview judgments and live gameplay impacts must share one tick source`
    );
}

{
    const burrow = motionOverrides.diablos['diablos.burrow_enter'].beats;
    assert.strictEqual(burrow.track.at, 'below:target 150',
        'burrow tracking must follow the locked runtime target instead of a hard-coded arena point');
    assert.strictEqual(burrow.track.fxAnchor, 'target',
        'burrow tracking dust must share the locked runtime target anchor');
    assert.strictEqual(burrow.eruption.to, 'above:target 20',
        'burrow emergence must use the same locked target anchor in preview and live hunt');
    assert.strictEqual(burrow.eruption.fxAnchor, 'target',
        'eruption dust must appear at the selected target rather than the arena center');
    assert.strictEqual(burrow.land.to, 'below:target 28',
        'the landing rebound must preserve the emergence target before returning home');
    assert.strictEqual(burrow.dig.judgments, undefined,
        'dig dust is visual-only and must not retain legacy wind pressure');
    const tremor = burrow.eruption.judgments.find(judgment => judgment.kind === 'tremor');
    assert.strictEqual(tremor.target, 'primary-adjacent',
        'the authored large tremor must cover the locked target lane and only its live neighbours');

    const source = profiles.diablos.find(pattern => pattern.id === 'diablos.burrow_enter');
    const motion = source.motion.map(beat => ({ ...beat, ...(burrow[beat.beat] || {}) }));
    const rect = (left, top, width, height) => ({ left, top, width, height });
    const compileForTarget = primaryTarget => HuntMotionCompiler.compile(motion, {
        anchors: new HuntStageAnchors({
            monsterRect: rect(660, 100, 380, 380),
            cardRect: rect(0, 0, 1700, 900),
            stageWidth: 1700,
            hunters: new Map([
                [0, rect(200, 700, 120, 160)],
                [1, rect(600, 700, 120, 160)],
                [2, rect(1000, 700, 120, 160)],
                [3, rect(1400, 700, 120, 160)]
            ]),
            primaryTarget
        })
    });
    const eruptionEndTransform = compiled => compiled.placement
        .filter(frame => Math.abs(frame.offset - (43 / 68)) < 1e-8).at(-1)?.transform;
    assert.strictEqual(eruptionEndTransform(compileForTarget(0)), 'translate(-590px, 470px)');
    assert.strictEqual(eruptionEndTransform(compileForTarget(3)), 'translate(610px, 470px)',
        'changing the locked target must redirect the complete emergence graph, not only its HIT recipient');
}

console.log('[test] Diablos BEAT V2 shadow compilation passed');
