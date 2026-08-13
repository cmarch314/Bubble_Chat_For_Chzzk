'use strict';

const assert = require('assert');
const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const HuntMotionCompiler = require('../js/effects/hunt/HuntMotionCompiler.js');
const HuntStageAnchors = require('../js/effects/hunt/HuntStageAnchors.js');

assert.strictEqual(HuntMonsterActionPolicy.judgmentTargetMode('pair'), 'runtime-pair');
assert.strictEqual(HuntMonsterActionPolicy.judgmentTargetMode('pair-left'), 'runtime-pair-left');
assert.strictEqual(HuntMonsterActionPolicy.judgmentTargetMode('pair-right'), 'runtime-pair-right');

for (const targetMode of ['runtime-pair', 'runtime-pair-left', 'runtime-pair-right']) {
    assert.strictEqual(HuntMonsterActionPolicy.minimumImpactTargetCount({
        impactTimeline: [{ targetMode }]
    }), 2, `${targetMode} must reserve a complete adjacent pair in live hunts`);
}

assert.strictEqual(HuntMonsterActionPolicy.minimumImpactTargetCount({
    motion: [{ judgments: [{ kind: 'damage', target: 'pair' }] }]
}), 2, 'editor-authored pair judgments must reserve two live targets before impact resolution');
assert.strictEqual(HuntMonsterActionPolicy.minimumImpactTargetCount({
    motion: [{ judgments: [{ kind: 'damage', target: 'primary' }] }]
}), 1, 'ordinary primary judgments must remain single-target');

assert.strictEqual(HuntMonsterActionPolicy.rollTargetCount({
    minTargets: 1, maxTargets: 2,
    impactTimeline: [{ targetMode: 'runtime-pair' }]
}, 4, () => 0), 2, 'pair judgments must select two hunters in Preview and live hunts');
assert.strictEqual(HuntMonsterActionPolicy.rollTargetCount({
    minTargets: 1, maxTargets: 2
}, 4, () => 0), 1, 'ordinary target count must preserve the authored minimum');
assert.strictEqual(HuntMonsterActionPolicy.rollTargetCount({
    minTargets: 1, maxTargets: 2
}, 4, () => .999), 2, 'ordinary target count must preserve the authored random range');
const seededA = HuntMonsterActionPolicy.seededRandom(73);
const seededB = HuntMonsterActionPolicy.seededRandom(73);
assert.deepStrictEqual([seededA(), seededA(), seededA()], [seededB(), seededB(), seededB()],
    'Preview scenario seeds must reproduce the same target selection');

const synchronizedTackle = HuntMonsterPatternCatalog.synchronizeMotionTiming({
    id: 'test.side_tackle',
    minTargets: 2,
    maxTargets: 2,
    damageRatio: .30,
    targeting: { mode: 'lane' },
    motion: [{
        beat: 'tackle', ticks: 4,
        judgments: [{ kind: 'damage', group: 'impact', target: 'primary', damagePercent: 30 }]
    }]
});
assert.strictEqual(synchronizedTackle.impactTimeline[0].targetMode, 'runtime-pair',
    'a two-person lane attack must not collapse to one hunter when editor judgment data says primary');
assert.strictEqual(HuntMonsterActionPolicy.minimumImpactTargetCount(synchronizedTackle), 2,
    'the live executor must reserve both hunters required by the synchronized judgment');

const synchronizedDraft = HuntMonsterPatternCatalog.synchronizeEditedPattern({
    id: 'test.edited_draft', damageRatio: .4,
    movement: { ticks: 99 }, animationDurationMs: 9900,
    impactTimeline: [{ atTicks: 88, targetMode: 'primary' }],
    beatV2: { timeline: [{ atTicks: 88 }] },
    motion: [
        { beat: 'approach', ticks: 5 },
        { beat: 'impact', ticks: 3, judgments: [{
            kind: 'damage', group: 'impact', target: 'pair', offsetTicks: 1, damagePercent: 40
        }] }
    ]
});
assert.strictEqual(synchronizedDraft.movement.ticks, 8,
    'an edited Preview draft must replace stale saved movement timing');
assert.strictEqual(synchronizedDraft.animationDurationMs, 800,
    'an edited Preview draft must replace stale saved animation timing');
assert.strictEqual(synchronizedDraft.impactTimeline[0].atTicks, 6,
    'an edited Preview draft must regenerate the live impact tick');
assert.strictEqual(synchronizedDraft.impactTimeline[0].targetMode, 'runtime-pair',
    'an edited Preview draft must regenerate the live target mode');
assert.strictEqual(synchronizedDraft.beatV2.totalTicks, 8,
    'an edited Preview draft must regenerate stale BEAT V2 data');

const anchors = new HuntStageAnchors({
    monsterRect: { left: 600, top: 100, width: 400, height: 400 },
    cardRect: { left: 0, top: 0, width: 1600, height: 900 },
    stageWidth: 1600,
    hunters: new Map([[0, { left: 200, top: 700, width: 120, height: 160 }]])
});
const previewPair = HuntMotionCompiler.compile([{
    beat: 'impact', ticks: 4,
    judgments: [{ kind: 'damage', target: 'pair', offsetTicks: 1 }]
}], { anchors });
assert.strictEqual(previewPair.impacts[0].targetMode, 'runtime-pair',
    'Preview must compile the same pair target mode used by live judgment resolution');

const hunters = [0, 1, 2, 3].map(index => ({ index }));
for (const primaryIndex of [0, 1, 2, 3]) {
    const passes = HuntMonsterActionPolicy.returnAdjacentPasses(
        hunters,
        2,
        () => 0,
        primaryIndex
    );
    const pair = [...new Set(passes.flat().map(target => target.index))].sort((a, b) => a - b);
    assert.strictEqual(pair.length, 2, `primary ${primaryIndex + 1} must keep a two-hunter lane`);
    assert.strictEqual(pair[1] - pair[0], 1,
        `primary ${primaryIndex + 1} must resolve to physically adjacent hunters`);
}

console.log('[test] Preview/live judgment target parity passed.');
