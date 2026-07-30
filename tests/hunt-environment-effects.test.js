'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const read = relative => fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8');

const animator = read('js/effects/hunt/HuntCombatAnimator.js');
const renderer = read('js/effects/hunt/HuntRenderer.js');
const engine = read('js/effects/hunt/HuntEngine.js');
const effect = read('js/effects/HuntEffect.js');
const hunterTurns = read('js/effects/hunt/HuntHunterTurnExecutor.js');
const tactics = read('js/effects/hunt/HuntChatTactics.js');
const perks = read('js/effects/hunt/HuntPerkRuntime.js');
const css = require('./helpers/hunt-css');
const combatRenderer = read('js/effects/hunt/HuntRenderer.js');

assert.match(animator, /triggerEnvironmentEffect\(kind\)/);
for (const className of ['pitfall-hole', 'pitfall-net', 'pitfall-dirt', 'rockfall-boulder', 'rockfall-impact-ring', 'rockfall-debris']) {
    assert.ok(animator.includes(className), `${className} must be created by the environment animator`);
    assert.ok(css.includes(`.${className}`), `${className} must have a visible style`);
}
assert.match(animator, /querySelectorAll\('\.hunt-environment-effect'\).*remove/,
    'phase cleanup must remove detached environment effects');
assert.match(renderer, /triggerEnvironmentEffect\(kind\).*combatAnimator\.triggerEnvironmentEffect\(kind\)/);
assert.match(engine, /onTriggerEnvironmentEffect/);
assert.match(effect, /onTriggerEnvironmentEffect:\s*\(kind\).*renderer\.triggerEnvironmentEffect\(kind\)/);
assert.match(hunterTurns, /triggerEnvironmentEffect\('pitfall'/);
assert.match(hunterTurns, /triggerEnvironmentEffect\('rockfall'/);
assert.match(hunterTurns, /triggerEnvironmentEffect\('flash'/);
assert.match(animator, /'pitfall', 'rockfall', 'flash', 'shocktrap', 'shocktrap-pending', 'bomb'/, 'combat items need hunt-owned environment effects');
assert.match(animator, /kind === 'shocktrap-pending'[\s\S]*?showcase\.appendChild\(effect\);[\s\S]*?return;/,
    'an airborne landing trap must remain visible until another environment event triggers it');
assert.match(css, /\.environment-flash/, 'flash use needs a visible full-combat burst');
assert.match(hunterTurns, /triggerEnvironmentEffect\('shocktrap'/, 'crafted Thunderbugs must deploy a visible shock trap');
assert.match(css, /\.environment-shocktrap/, 'shock traps need a visible electric field');
assert.match(animator, /hunt-ground-web/, 'installed and triggered traps must use the same grounded web shape');
assert.match(css, /\.hunt-ground-web[\s\S]*?repeating-radial-gradient[\s\S]*?repeating-conic-gradient/,
    'the trap must be a large flat CSS web instead of a small emoji');
assert.match(css, /\.environment-bomb/, 'barrel bombs need a dedicated explosion effect');
assert.match(engine, /consumeTrapDuration\(baseTicks\)/, 'all trap sources need one shared diminishing-duration owner');
assert.match(tactics, /triggerEnvironmentEffect\?\.\('pitfall'/);
assert.match(tactics, /triggerEnvironmentEffect\?\.\('rockfall'/);
assert.match(perks, /triggerEnvironmentEffect\('pitfall'/);
assert.match(hunterTurns, /trapImmune.*isMonsterTrapImmune/s,
    'support AI traps must use the shared immunity rule');
assert.match(perks, /trapImmune.*isMonsterTrapImmune/s,
    'perk traps and capture must use the shared immunity rule');
for (const keyframe of ['pitfall-open', 'monster-pitfall-caught', 'rockfall-drop', 'rockfall-impact-ring', 'hunt-rockfall-screen-shake']) {
    assert.ok(css.includes(`@keyframes ${keyframe}`), `${keyframe} animation must remain defined`);
}
assert.match(animator, /monster-pitfall-struggling/,
    'pitfall entry must transition into a persistent struggle pose');
assert.match(css, /monster-pitfall-caught\.monster-pitfall-struggling[\s\S]*?infinite/,
    'pitfall struggle animation must continue until the trapped state is released');
assert.match(combatRenderer, /remove\('monster-pitfall-caught', 'monster-pitfall-struggling'\)/,
    'pitfall animation classes must be released with the monster state');
assert.doesNotMatch(combatRenderer, /id="status-tag-\$\{w\.index\}"/,
    'ordinary hunter combat/status tags must not occupy permanent card space');
assert.match(animator, /hunter-stun-orbit/);
assert.match(css, /@keyframes hunter-stun-orbit-spin/);
const interferenceRule = css.match(/\.hunter-interference-overlay\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.match(interferenceRule, /border:\s*0/);
assert.doesNotMatch(interferenceRule, /border:\s*[1-9]/,
    'roar, wind, and tremor overlays must not gain a yellow badge border');
const legacyRoarRule = css.match(/\.roar-stun-overlay\s*\{([\s\S]*?)\n\}/)?.[1] || '';
assert.match(legacyRoarRule, /border:\s*0/,
    'a stale legacy roar node must not restore the removed yellow border');

console.log('[test] Pitfall and rockfall combat spectacle routing passed.');
