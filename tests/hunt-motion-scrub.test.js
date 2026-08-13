'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterAttackAnimator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');

const animatorSource = fs.readFileSync(
    path.join(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
assert.match(animatorSource, /clearActiveMonsterMotion\(null, 'beat-replaced'\)/,
    'starting BEAT motion must retire a stale legacy CSS/profile owner first');
assert.match(animatorSource, /filter\(name => name\.startsWith\('monster-motion-'\)\)/,
    'starting BEAT motion must remove stale legacy motion classes before WAAPI playback');
assert.match(animatorSource, /data\.monsterBeatFallback|dataset\.monsterBeatFallback/,
    'BEAT motion must compile a scoped CSS fallback when OBS WebView has no WAAPI');
assert.match(animatorSource, /controller\?\.cssTracks\?\.forEach/,
    'the CSS fallback must remain seekable by the unified timeline');

const calls = [];
const legacyCalls = [];
const animation = {
    pause() { calls.push('pause'); },
    set currentTime(value) { calls.push(value); }
};
const animator = Object.create(HuntMonsterAttackAnimator.prototype);
animator.owner = { animationTimers: { clear(id) { legacyCalls.push(`clear:${id}`); } } };
animator.activeBeatMotionPreview = { animations: [animation], durationMs: 2400 };

animator.freezeBeatMotionPreview(animator.activeBeatMotionPreview, 0);
assert.deepStrictEqual(calls, ['pause', 0],
    'a scrub preview must be frozen before its first browser paint');
assert.strictEqual(animator.seekBeatMotion(.625), true);
assert.deepStrictEqual(calls.slice(-2), ['pause', 1500]);
assert.strictEqual(animator.seekBeatMotion(2), true);
assert.deepStrictEqual(calls.slice(-2), ['pause', 2400], 'scrub progress must clamp to the motion end');
animator.activeBeatMotionPreview = null;
const legacyAnimation = {
    effect: { getComputedTiming: () => ({ activeDuration: 3200 }) },
    pause() { legacyCalls.push('pause'); },
    set currentTime(value) { legacyCalls.push(value); }
};
animator.activeMonsterMotion = {
    durationMs: 3200,
    timeoutId: 77,
    element: {
        style: { setProperty() {} },
        classList: { remove() {}, add() {} },
        offsetWidth: 1,
        getAnimations: () => [legacyAnimation]
    }
};
assert.strictEqual(animator.seekBeatMotion(.5), true,
    'legacy CSS monster motion must use the same scrub controller as BEAT motion');
assert.deepStrictEqual(legacyCalls, ['clear:77', 'pause', 1600]);
animator.activeMonsterMotion = null;
assert.strictEqual(animator.seekBeatMotion(.5), false);

const cancelled = [];
const previewElement = { dataset: { monsterBeatTimeline: 'old', monsterBeatImpacts: '12' } };
animator.activeBeatMotionPreview = {
    animations: [{ cancel() { cancelled.push('cancel'); } }],
    durationMs: 2400,
    motionElement: previewElement
};
assert.strictEqual(animator.cancelBeatMotionPreview(), true);
assert.deepStrictEqual(cancelled, ['cancel'],
    '새 재생 전에는 남아 있는 스크럽/비트 모션을 취소해야 한다');
assert.strictEqual(animator.activeBeatMotionPreview, null);
assert.strictEqual(previewElement.dataset.monsterBeatTimeline, undefined);
assert.strictEqual(previewElement.dataset.monsterBeatImpacts, undefined);

console.log('[test] Compiled monster motion supports safe paused timeline scrubbing.');
