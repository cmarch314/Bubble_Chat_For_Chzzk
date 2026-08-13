'use strict';

const assert = require('assert');
const Catalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');

global.window = global;
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require(
    '../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');
require('../js/effects/hunt/data/WildsMonsterBehavior.generated.js');
require('../js/effects/hunt/data/RiseMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldMonsterBehavior.generated.js');
require('../js/effects/hunt/data/WorldShellBehavior.generated.js');
require('../js/effects/hunt/data/MhxxMonsterBehavior.generated.js');
require('../js/effects/hunt/data/MhxxDbMonsterBehavior.generated.js');
require('../js/effects/hunt/data/PublishedMonsterBehavior.js');

const catalog = Catalog.build({});
let checked = 0;
for (const [monsterId, patterns] of Object.entries(catalog)) {
    for (const pattern of patterns) {
        checked += 1;
        assert.strictEqual(pattern.beatV2Approved, true,
            `${monsterId}/${pattern.id}: runtime pattern must be BEAT-normalized`);
        const beats = Array.isArray(pattern.motion) && pattern.motion.length
            ? pattern.motion : pattern.runtimeTimingBeats;
        assert.ok(Array.isArray(beats) && beats.length,
            `${monsterId}/${pattern.id}: normalized timing graph missing`);
        const totalTicks = beats.reduce((sum, beat) => sum + Math.max(1, Number(beat.ticks) || 1), 0);
        assert.strictEqual(Number(pattern.movement?.ticks), totalTicks,
            `${monsterId}/${pattern.id}: movement duration diverges from timing graph`);
        assert.strictEqual(Number(pattern.animationDurationMs), totalTicks * 100,
            `${monsterId}/${pattern.id}: animation duration diverges from timing graph`);
        assert.strictEqual(Number(pattern.beatV2?.totalTicks), totalTicks,
            `${monsterId}/${pattern.id}: BEAT V2 duration diverges from runtime graph`);
        for (const impact of pattern.impactTimeline || []) {
            assert.ok(Number(impact.atTicks) >= 0 && Number(impact.atTicks) <= totalTicks,
                `${monsterId}/${pattern.id}: impact lies outside its timing graph`);
        }
        for (const key of ['runtimePreviewScrub', 'runtimePreviewMuteAudio', 'runtimePreviewCardReactions']) {
            assert.ok(!Object.prototype.hasOwnProperty.call(pattern, key),
                `${monsterId}/${pattern.id}: Preview-only state leaked into runtime catalog (${key})`);
        }
    }
}

for (const pattern of catalog.diablos || []) {
    for (const impact of pattern.impactTimeline || []) {
        if (!(Number(impact.damageScale) > 0)) continue;
        assert.ok(['strong', 'butt-stumble', 'weak'].includes(impact.hitReactionKind),
            `diablos/${pattern.id}: approved damage judgment lost its Preview-authored reaction`);
        assert.strictEqual(impact.hitRecoveryTicks, undefined,
            `diablos/${pattern.id}: monster graph must not own hunter recovery timing`);
    }
}

assert.ok(checked > 100, 'catalog audit must cover the full roster rather than a single monster');
console.log(`[test] Preview/live catalog contract passed (${checked} patterns).`);
