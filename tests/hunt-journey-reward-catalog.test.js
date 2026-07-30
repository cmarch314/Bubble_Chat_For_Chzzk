'use strict';

const assert = require('assert');
const Rewards = require('../js/effects/hunt/HuntJourneyRewardCatalog');

assert.strictEqual(Rewards.sealFor('rathalos', 'normal').seal, 'flying');
assert.strictEqual(Rewards.sealFor('gore_magala', 'elder').seal, 'elder');
assert.strictEqual(Rewards.sealFor('unknown-medium', 'medium').evidence, 'explicit-tier-archetype-fallback');
assert.deepStrictEqual(Rewards.award(['bone', 'flying'], 'rathalos', 'normal').seals, ['bone', 'flying']);
assert.deepStrictEqual(Rewards.award([], 'lala_barina', 'normal').seals, ['temnoceran']);
assert.strictEqual(Rewards.coinFor('small'), 1);
assert.strictEqual(Rewards.coinFor('normal'), 2);
assert.strictEqual(Rewards.coinFor('normal', true), 3);
assert.strictEqual(Rewards.coinFor('colossal', true), 3);
console.log('[test] Evidence-labelled monster reward seals and bounded inventory passed.');
