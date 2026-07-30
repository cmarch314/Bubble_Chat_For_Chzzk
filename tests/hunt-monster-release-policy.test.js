'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterReleasePolicy = require('../js/effects/hunt/HuntMonsterReleasePolicy.js');
const flyingReview = require('../data/hunt/research/world-iceborne-flying-wyverns.json');

assert.deepStrictEqual(
    HuntMonsterReleasePolicy.REVIEWED.map(entry => entry.id).sort(),
    ['chameleos', ...flyingReview.roster].sort(),
    'the release roster must contain the explicit 19-monster World Flying Wyvern review plus Chameleos'
);

const mixed = [
    { id: 'rathian', selectable: true, tier: 'large' },
    { id: 'rathalos', selectable: true, tier: 'large' },
    { id: 'valstrax', selectable: true, tier: 'elder' },
    { id: 'diablos', selectable: false, tier: 'large' },
    { id: 'black-diablos', selectable: true, tier: 'large' },
    { id: 'chameleos', selectable: true, tier: 'elder' },
    { id: 'chameleos', selectable: true, tier: 'elder' }
];
assert.deepStrictEqual(
    HuntMonsterReleasePolicy.filter(mixed).map(monster => monster.id),
    ['rathian', 'rathalos', 'black-diablos', 'chameleos'],
    'unreviewed, disabled, and duplicate monsters must not enter the combat pool'
);
assert.strictEqual(HuntMonsterReleasePolicy.isReviewed('black-diablos'), true);
assert.strictEqual(HuntMonsterReleasePolicy.isReviewed('valstrax'), false);
assert.strictEqual(HuntMonsterReleasePolicy.reviewRecord('rathalos').canonicalEdition, 'world-iceborne');
assert.deepStrictEqual(
    [...HuntMonsterReleasePolicy.reviewRecord('black_diablos').mechanicModules],
    ['common', 'burrow', 'charge-chain', 'tremor']
);

const coverage = HuntMonsterReleasePolicy.journeyCoverage(mixed, monster => monster.tier);
assert.strictEqual(coverage.ready, false);
assert.deepStrictEqual(coverage.missing, ['small', 'medium', 'colossal']);
assert.deepStrictEqual(coverage.present, ['large', 'elder']);

const root = path.resolve(__dirname, '..');
const effectSource = fs.readFileSync(path.join(root, 'js/effects/HuntEffect.js'), 'utf8');
const loaderSource = fs.readFileSync(path.join(root, 'js/effects/hunt/HuntRuntimeLoader.js'), 'utf8');
assert.ok(
    loaderSource.indexOf('MonsterReleaseManifest.generated.js') < loaderSource.indexOf('HuntMonsterReleasePolicy.js'),
    'the generated release manifest must load before the combat roster gate'
);
assert.match(effectSource, /HuntMonsterReleaseRules\.filter\(this\.initializer\.fallbackMonsters\)/);
assert.match(effectSource, /HuntMonsterReleaseRules\.filter\(list\)/);
assert.match(effectSource, /HuntMonsterReleaseRules\.journeyCoverage/);
assert.ok(
    loaderSource.indexOf('HuntMonsterReleasePolicy.js') < loaderSource.indexOf('HuntJourneyCatalog.js'),
    'the release gate must load before any journey roster is built'
);

console.log('[test] Review-gated monster release policy passed.');
