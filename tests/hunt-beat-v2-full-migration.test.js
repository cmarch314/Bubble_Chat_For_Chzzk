'use strict';

const assert = require('assert');
const fs = require('fs');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HuntBeatV2Adapter = require('../js/effects/hunt/HuntBeatV2Adapter.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES =
    require('../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');

const Catalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const manifest = require('../js/effects/hunt/data/MonsterReleaseManifest.generated.js');
const ids = manifest.records.map(record => String(record.id).replace(/[-']/g, '_'));
const catalog = Catalog.build({}, ids.map(id => ({ id })));
const missing = [];
let total = 0;

for (const monsterId of ids) {
    for (const pattern of catalog[monsterId] || []) {
        total += 1;
        if (pattern.beatV2Approved !== true || pattern.beatV2?.backend !== 'beat-v2') {
            missing.push(`${monsterId}/${pattern.id}`);
            continue;
        }
        assert.strictEqual(pattern.beatV2.totalTicks, Number(pattern.movement?.ticks),
            `${monsterId}/${pattern.id}: session and presentation must share total ticks`);
        assert.deepStrictEqual(
            HuntBeatV2Adapter.gameplayEventTicks(pattern.beatV2),
            (pattern.impactTimeline || []).map(event =>
                Math.max(0, Number(event?.atTicks ?? event) || 0)).sort((a, b) => a - b),
            `${monsterId}/${pattern.id}: live judgments and runtime impacts must share one BEAT clock`
        );
        for (const beat of pattern.beatV2.beats) {
            assert(pattern.beatV2.events.some(event => event.kind === 'audio'
                && event.beatId === beat.id),
            `${monsterId}/${pattern.id}/${beat.id}: every editor beat must emit one routable audio moment`);
        }
    }
}

assert(total > 0, 'released catalog must contain patterns');
assert.deepStrictEqual(missing, [],
    `released patterns may not fall back to a non-session runtime: ${missing.join(', ')}`);

const executor = fs.readFileSync('js/effects/hunt/HuntMonsterTurnExecutor.js', 'utf8');
assert.match(executor, /const windupTicks = pattern\.beatV2Approved === true \? 0 : legacyWindupTicks/,
    'approved actions must not prepend the retired pending windup clock');
assert.match(executor, /pattern\.beatV2Approved !== true[\s\S]{0,160}monster_impact/,
    'legacy impact audio hooks must be unreachable for approved sessions');
assert.match(executor, /pattern\.beatV2Approved !== true[\s\S]{0,160}burrow-enter/,
    'legacy split burrow choreography must be unreachable for approved sessions');

console.log(`[test] full BEAT V2 migration passed: ${ids.length} released monsters, ${total} patterns.`);
