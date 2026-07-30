'use strict';

const assert = require('assert');
const report = require('../data/hunt/monster-evidence-audit.generated.json');

assert.strictEqual(report.scope.combat, 258);
assert.strictEqual(report.scope.journeyEventOnly, 6);
assert.strictEqual(report.summary.verifiedImages, report.scope.combat);
assert.strictEqual(report.summary.verifiedSpecies, report.scope.combat);
assert.strictEqual(report.summary.resolvedAnimationRigs, report.scope.combat);
assert.strictEqual(report.summary.reviewedPatternKits, 20);
assert.strictEqual(report.summary.fallbackCandidateKits, 0);
assert.strictEqual(
    report.summary.reviewedPatternKits
        + report.summary.sourceDerivedCandidateKits
        + report.summary.documentedCandidateKits
        + report.summary.fallbackCandidateKits,
    report.scope.combat
);
assert.strictEqual(report.summary.unresolvedLargeRoar, 0);
assert.deepStrictEqual(report.unresolved.images, []);
assert.deepStrictEqual(report.unresolved.patterns, []);
assert.strictEqual(report.unresolved.patternReview.length, report.scope.combat - report.summary.reviewedPatternKits);
assert.deepStrictEqual(report.unresolved.species, []);
assert.deepStrictEqual(report.unresolved.animationRig, []);
assert.deepStrictEqual(report.unresolved.largeRoar, []);
assert.ok(report.summary.verifiedRoarAudio > 0);

console.log('[test] complete monster image, taxonomy, roar-state, behavior, and rig evidence audit passed.');
