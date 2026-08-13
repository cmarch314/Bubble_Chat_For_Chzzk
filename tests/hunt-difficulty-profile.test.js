'use strict';

const assert = require('assert');
const HuntDifficultyProfile = require('../js/effects/hunt/HuntDifficultyProfile');
global.HuntDifficultyProfile = HuntDifficultyProfile;
global.HuntSharedSupply = require('../js/effects/hunt/HuntSharedSupply');
const HuntJourneyRewardCatalog = require('../js/effects/hunt/HuntJourneyRewardCatalog');
const HuntRunState = require('../js/effects/hunt/HuntRunState');

assert.deepStrictEqual(
    HuntDifficultyProfile.normalize(),
    { id: 'standard', monsterDamageMultiplier: 1, rewardMultiplier: 1 }
);
assert.strictEqual(HuntJourneyRewardCatalog.coinFor('large', false), 2,
    'the default difficulty must not change current journey rewards');
assert.strictEqual(HuntJourneyRewardCatalog.coinFor('large', false, {
    id: 'future-hard', monsterDamageMultiplier: 1.25, rewardMultiplier: 1.5
}), 3, 'a future journey difficulty can scale rewards without monster-specific code');
const nodes = Array.from({ length: HuntRunState.NODE_COUNT }, (_, index) => ({
    id: `node-${index + 1}`, type: index % 2 ? 'event' : 'combat',
    monsterId: index % 2 ? null : 'diablos', eventId: index % 2 ? 'camp' : null
}));
const run = HuntRunState.normalize({ runId: 'difficulty-contract', nodes });
assert.strictEqual(run.schemaVersion, 5);
assert.deepStrictEqual(run.difficulty,
    { id: 'standard', monsterDamageMultiplier: 1, rewardMultiplier: 1 },
    'old and new journey saves must normalize to the neutral difficulty profile');

console.log('[test] Hunt difficulty profile contract passed.');
