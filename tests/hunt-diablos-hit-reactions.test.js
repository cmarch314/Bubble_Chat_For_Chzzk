'use strict';

const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require(
    '../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js'
);

const runtime = global.HuntMonsterPatternCatalog.build({}, [{ id: 'diablos' }]);
const judgments = runtime.diablos.flatMap(pattern =>
    (pattern.impactTimeline || [])
        .filter(impact => Number(impact.damageScale ?? 1) > 0)
        .map(impact => ({ patternId: pattern.id, reaction: impact.hitReactionKind }))
);

assert.ok(judgments.length > 0, 'live Diablos must expose damaging judgments');
judgments.forEach(judgment => {
    assert.strictEqual(
        judgment.reaction,
        judgment.patternId === 'diablos.bite' ? 'weak' : 'strong',
        `${judgment.patternId} must use the approved hunter reaction class`
    );
});

console.log('[test] Diablos live weak/strong hit reactions passed.');
