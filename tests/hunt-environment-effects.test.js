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
const css = read('style.css');
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
assert.match(animator, /'pitfall', 'rockfall', 'flash', 'shocktrap', 'bomb'/, 'combat items need hunt-owned environment effects');
assert.match(css, /\.environment-flash/, 'flash use needs a visible full-combat burst');
assert.match(hunterTurns, /triggerEnvironmentEffect\('shocktrap'/, 'crafted Thunderbugs must deploy a visible shock trap');
assert.match(css, /\.environment-shocktrap/, 'shock traps need a visible electric field');
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
assert.doesNotMatch(combatRenderer, /id="status-tag-\$\{w\.index\}"/,
    'ordinary hunter combat/status tags must not occupy permanent card space');
assert.match(animator, /hunter-stun-orbit/);
assert.match(css, /@keyframes hunter-stun-orbit-spin/);

console.log('[test] Pitfall and rockfall combat spectacle routing passed.');
