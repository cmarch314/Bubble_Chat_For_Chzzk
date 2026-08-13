'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync(path.resolve(__dirname, '../styles/hunt-runtime.css'), 'utf8');
const animator = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'), 'utf8');
const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');

assert.match(css,
    /\.environment-pitfall\.is-releasing\s*\{\s*animation:pitfall-release-fade var\(--pitfall-release-fade-ms,\.8s\) ease-in both;/,
    'the complete pitfall layer must fade during the authored escape window');
assert.match(css,
    /@keyframes pitfall-release-fade\s*\{[\s\S]*?0%\{opacity:1\}[\s\S]*?100%\{opacity:0\}/,
    'the trap must begin fading on the first escape tick and reach zero opacity with the escape');
assert.doesNotMatch(css,
    /@keyframes pitfall-release-fade\s*\{[\s\S]*?0%,58%\{opacity:1\}/,
    'the retired opaque hold must not make the trap pop out at the end of escape');
assert.match(css,
    /\.environment-pitfall\.is-releasing \.pitfall-hole\s*\{[^}]*animation:none !important;[^}]*opacity:1;[^}]*transform:translateX\(-50%\) scale\(1\);/,
    'the open hole must remain at full size while the parent layer fades');
assert.match(css,
    /\.environment-pitfall\.is-releasing \.pitfall-net\s*\{[^}]*animation:none !important;[^}]*opacity:\.9;[^}]*transform:translateX\(-50%\) scale\(1\) rotate\(0\);/,
    'the net must remain fully spread while the parent layer fades');
assert.doesNotMatch(css, /pitfall-close/,
    'pitfall release must never shrink the hole or net toward its center');
assert.match(animator,
    /PITFALL_RELEASE_TICK_MS = 100[\s\S]*?releaseFadeMs = releaseTicks \* HuntCombatAnimator\.PITFALL_RELEASE_TICK_MS[\s\S]*?effect\.animate\?\.[\s\S]*?effects\.forEach\(effect => effect\.remove\(\)\)[\s\S]*?releaseFadeMs\);/,
    'live and preview trap release must animate opacity for the authored escape ticks before DOM cleanup');
assert.match(animator,
    /effect\.style\.setProperty\('--pitfall-release-fade-ms'[\s\S]*?monsterImg\?\.classList\?\.add\('monster-pitfall-releasing'\)/,
    'BEAT-owned pitfall release must retain the renderer lifecycle guard until the fade completes');
assert.doesNotMatch(animator,
    /pitfallBeatOwned !== 'true'[\s\S]{0,120}monster-pitfall-releasing/,
    'BEAT motion ownership must not suppress trap DOM persistence');

{
    const classes = new Set(['environment-pitfall']);
    const styleValues = new Map();
    let animationArgs = null;
    let removed = false;
    const effect = {
        classList: { add: value => classes.add(value) },
        style: { setProperty: (key, value) => styleValues.set(key, value) },
        animate(frames, options) {
            animationArgs = { frames, options };
            return { cancel() {} };
        },
        remove() { removed = true; }
    };
    const monsterClasses = new Set(['monster-pitfall-caught']);
    const monsterImg = {
        dataset: { pitfallLifecycle: '1', pitfallBeatOwned: 'true' },
        classList: {
            contains: value => monsterClasses.has(value),
            add: value => monsterClasses.add(value),
            remove: (...values) => values.forEach(value => monsterClasses.delete(value))
        }
    };
    const showcase = { querySelectorAll: () => [effect] };
    const timers = [];
    const instance = Object.create(HuntCombatAnimator.prototype);
    instance.owner = {
        card: {
            querySelector(selector) {
                if (selector === '#monster-showcase-panel') return showcase;
                if (selector === '.hunt-small-monster.is-targeted') return null;
                if (selector === '#fight-monster-img') return monsterImg;
                return null;
            }
        },
        animationTimers: { timeout: (callback, delay) => timers.push({ callback, delay }) }
    };

    instance.triggerEnvironmentEffect('trap-release', null, { kind: 'pitfall', releaseTicks: 8 });
    assert.ok(classes.has('is-releasing'));
    assert.strictEqual(styleValues.get('--pitfall-release-fade-ms'), '800ms');
    assert.deepStrictEqual(animationArgs.frames, [{ opacity: 1 }, { opacity: 0 }]);
    assert.strictEqual(animationArgs.options.duration, 800,
        'the real DOM opacity animation must span all eight escape ticks');
    assert.strictEqual(removed, false, 'the trap DOM must survive while fading');
    assert.strictEqual(timers[0].delay, 800);
    instance.triggerEnvironmentEffect('trap-release', null, { kind: 'pitfall', releaseTicks: 1 });
    assert.strictEqual(animationArgs.options.duration, 800,
        'stale or malformed authored data must not collapse trap escape to a 0.1 second pop');
    assert.strictEqual(removed, false);
    assert.strictEqual(timers[1].delay, 800);
    timers[0].callback();
    assert.strictEqual(removed, false,
        'an older release cleanup must not remove a newer trap lifecycle');
    timers[1].callback();
    assert.strictEqual(removed, true, 'the trap DOM may be removed only after opacity reaches zero');
}

console.log('[test] Pitfall release fade lifecycle passed.');
