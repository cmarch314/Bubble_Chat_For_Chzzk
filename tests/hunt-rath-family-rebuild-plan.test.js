'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
global.HuntBeatV2Adapter = require('../js/effects/hunt/HuntBeatV2Adapter.js');
global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = require('../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');
const Catalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');

const root = path.resolve(__dirname, '..');
const profiles = Catalog.build({});
const forbidden = new Set([
    'motion', 'profileMotion', 'impactTimeline', 'animationClass', 'cssAnimation',
    'hitOffsetTicks', 'judgmentOffsets', 'beatV2'
]);

function findForbidden(value, at = '$', result = []) {
    if (!value || typeof value !== 'object') return result;
    for (const [key, child] of Object.entries(value)) {
        if (forbidden.has(key)) result.push(`${at}.${key}`);
        findForbidden(child, `${at}.${key}`, result);
    }
    return result;
}

for (const monsterId of ['rathian', 'rathalos']) {
    const file = path.join(root, 'data', 'hunt', 'monster-kits', 'rebuild', `${monsterId}.json`);
    const plan = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.strictEqual(plan.monsterId, monsterId);
    assert.strictEqual(plan.status, 'planned');
    assert.strictEqual(plan.sourcePolicy, 'reference-only-clean-beat');
    assert.deepStrictEqual(plan.cutover, { mode: 'atomic', keepCurrentRuntimeUntilApproved: true });
    assert.deepStrictEqual(plan.actions.map(action => action.id).sort(),
        profiles[monsterId].map(action => action.id).sort(), `${monsterId} rebuild must cover every current action exactly once`);
    assert.strictEqual(new Set(plan.actions.map(action => action.id)).size, plan.actions.length);
    assert.ok(plan.actions.every(action => Array.isArray(action.acceptance) && action.acceptance.length >= 2),
        `${monsterId} actions need observable acceptance criteria`);
    assert.deepStrictEqual(findForbidden(plan), [], `${monsterId} rebuild plan must not embed legacy runtime data`);
    assert.ok(profiles[monsterId].every(action => action.reviewStatus === 'migrated'),
        `${monsterId} current compatibility runtime must not be mistaken for a clean approved rebuild`);
}

console.log('[test] Rath-family clean rebuild plans are complete, isolated, and non-runtime.');
