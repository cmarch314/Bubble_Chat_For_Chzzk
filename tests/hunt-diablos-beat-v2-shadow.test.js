'use strict';

const assert = require('assert');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterPatternCatalog = HuntMonsterPatternCatalog;
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const motionOverrides = require('../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');
const HuntBeatV2Adapter = require('../js/effects/hunt/HuntBeatV2Adapter.js');

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
    assert.strictEqual(burrow.track.at, 'below:arena:center 150',
        'burrow tracking must converge on the authored arena center, not a stale target anchor');
    assert.strictEqual(burrow.eruption.to, 'above:arena:center 20',
        'burrow emergence must use the same center anchor in preview and live hunt');
    assert.strictEqual(burrow.dig.judgments, undefined,
        'dig dust is visual-only and must not retain legacy wind pressure');
    const tremor = burrow.eruption.judgments.find(judgment => judgment.kind === 'tremor');
    assert.strictEqual(tremor.target, 'all',
        'the authored large tremor must not degrade into a primary-adjacent three-hunter shortcut');
}

console.log('[test] Diablos BEAT V2 shadow compilation passed');
