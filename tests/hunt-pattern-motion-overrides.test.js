'use strict';

const assert = require('assert');

global.HUNT_MONSTER_PATTERN_OVERRIDES = {
    editor_test: [{
        id: 'editor_test.combo', name: '편집 테스트', type: 'physical', damageRatio: 0.2,
        windupTicks: 5, activeTicks: 2, recoveryTicks: 6,
        motion: [
            { beat: 'windup', ticks: 5 },
            { beat: 'impact', ticks: 2, hit: true },
            { beat: 'return', ticks: 6 }
        ],
        evidence: 'installed-game-action-class'
    }],
    legacy_editor_test: [{
        id: 'legacy_editor_test.charge', name: '레거시 편집 테스트', type: 'charge', damageRatio: 0.2,
        windupTicks: 5, activeTicks: 2, recoveryTicks: 6,
        movement: { ticks: 8 }, evidence: 'installed-game-action-class'
    }]
};
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = {
    editor_test: { 'editor_test.combo': { beats: { windup: { ticks: 9, to: 'target', rotation: 35, moveEasing: 'accelerate' }, impact: 4, return: 11 } } },
    legacy_editor_test: { 'legacy_editor_test.charge': { beats: { telegraph: 7, start: 3, travel: 12, recovery: 10 } } }
};

const Catalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
const built = Catalog.build({}, [
    { id: 'editor_test', nameKO: '편집 테스트' },
    { id: 'legacy_editor_test', nameKO: '레거시 편집 테스트' }
]);
assert.deepStrictEqual(built.editor_test[0].motion.map(beat => beat.ticks), [9, 4, 11]);
assert.strictEqual(built.editor_test[0].motion[0].to, 'target');
assert.strictEqual(built.editor_test[0].motion[0].rotation, 35);
assert.strictEqual(built.editor_test[0].motion[0].moveEasing, 'accelerate');
assert.strictEqual(built.legacy_editor_test[0].windupTicks, 7);
assert.strictEqual(built.legacy_editor_test[0].activeTicks, 3);
assert.strictEqual(built.legacy_editor_test[0].movement.ticks, 12);
assert.strictEqual(built.legacy_editor_test[0].recoveryTicks, 10);
console.log('[test] pattern motion overrides merge into authored and legacy runtime patterns.');
