'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Contract = require('../tools/monster-motion-authoring-contract.js');

const source = {
    windup: {
        ticks: 7, at: 'home', to: 'pair:center', origin: 'part:feet', moveEasing: 'accelerate',
        rotationEasing: 'heavy', pose: 'crouch', face: 'target', align: 'target', bounds: 'arena',
        fade: 'in', sfx: 'dust', label: '준비', aimBodyAt: 'target', targetMode: 'pair',
        offsetX: 14, offsetY: -9, depth: 2, rotation: 45, rotationToward: 12, rotateBy: 30,
        rotateByFacing: -1, scaleX: 1.2, scaleY: .8, skewX: 4, skewY: -3, opacity: .7,
        damageScale: 1.4, hitOffsetTicks: 3, strideFlipTicks: 4, stompSteps: 2,
        fxDurationTicks: 5, fxSecondaryDurationTicks: 6, rotationDegrees: 90,
        hit: false, alignRotationToTravel: true, instantOpacity: false, instantPose: true,
        continueTravel: true, flipFacing: false, keepRotation: true,
        rotationDirection: 'clockwise', rotationResetMode: 'snap-end', fx: 'dust', fxAnchor: 'target', fxSecondary: 'arc',
        fxSecondaryAnchor: 'head', fxSecondaryAngleMode: 'travel',
        judgments: [{ id: 'windup-hit', group: 'impact', kind: 'damage', target: 'pair',
            offsetTicks: 4, damagePercent: 28, hitReactionKind: 'strong', element: 'fire', directHitSupersedes: false }],
        fxAdditional: [{ fx: 'spark', anchor: 'head', durationTicks: 3, angleMode: 'travel' }],
        ignoredImplementationField: 'must-not-persist'
    }
};

const normalized = Contract.normalizeBeats(source);
assert.deepStrictEqual(Object.keys(normalized.windup).sort(),
    Contract.EDITABLE_FIELDS.filter(key => Object.prototype.hasOwnProperty.call(source.windup, key)
        && key !== 'hitOffsetTicks'
        && !['rotation', 'rotateBy', 'rotateByFacing'].includes(key)).sort(),
    'every editor-owned field must be normalized by the one shared contract');
assert.equal(normalized.windup.rotation, undefined,
    'directed rotation must remove the competing absolute angle');
assert.equal(normalized.windup.rotateBy, undefined);
assert.equal(normalized.windup.rotateByFacing, undefined);
assert.equal(normalized.windup.ignoredImplementationField, undefined);
assert.equal(normalized.windup.judgments[0].hitReactionKind, 'strong');
assert.equal(normalized.windup.judgments[0].element, 'fire',
    'damage elements must round-trip through the shared authored judgment contract');
assert.equal(Contract.normalizeBeat({ ticks: 2, judgments: [{ kind: 'damage', element: 'inferred' }] })
    .judgments[0].element, undefined, 'unknown inferred element values must not enter authored BEAT data');
assert.equal(normalized.windup.hit, false);
assert.equal(normalized.windup.hitOffsetTicks, undefined,
    'explicit judgments must exclusively own impact timing');
assert.equal(normalized.windup.rotationResetMode, 'snap-end',
    'the visible return-rotation option must round-trip through the shared contract');
assert.equal(Contract.normalizeBeat({ ticks: 2, rotationResetMode: 'hidden-legacy-mode' }).rotationResetMode,
    undefined, 'unknown hidden rotation modes must not enter authored BEAT data');

const reordered = { windup: Object.fromEntries(Object.entries(normalized.windup).reverse()) };
assert.equal(Contract.compareBeats(normalized, reordered).equal, true,
    'property ordering must never fail save verification');
const changed = structuredClone(normalized);
changed.windup.rotationDegrees = 46;
const comparison = Contract.compareBeats(normalized, changed);
assert.equal(comparison.equal, false);
assert.ok(comparison.differences.includes('windup.rotationDegrees'),
    'save verification must identify the exact mismatched field');

const read = relative => fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
assert.doesNotMatch(read('tools/hunt-audio-pattern-map.js'), /const allowed(Text|Number|Boolean)/,
    'released motion saving must not maintain a private field allowlist');
assert.doesNotMatch(read('tools/monster-audio-review-server.js'), /CANDIDATE_VISUAL_(TEXT|NUMBER|BOOLEAN)_FIELDS/,
    'candidate motion saving must not maintain a private field allowlist');
assert.match(read('tools/monster-audio-review-state.js'), /contract\.EDITABLE_FIELDS/,
    'the browser editor must consume the shared field contract');
assert.match(read('tools/monster-audio-review-app.js'), /class="rotation-reset-mode"/,
    'the editor must expose the authored return-rotation mode instead of hiding it');
assert.doesNotMatch(read('tools/monster-audio-review-app.js'), /class="keep-rotation"/,
    'the ambiguous legacy keep-rotation checkbox must not remain as a second UI owner');

console.log('monster motion authoring contract tests passed');
