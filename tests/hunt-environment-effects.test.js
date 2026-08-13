'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const read = relative => fs.readFileSync(path.resolve(__dirname, '..', relative), 'utf8');

const animator = read('js/effects/hunt/HuntCombatAnimator.js');
const monsterAttackAnimator = read('js/effects/hunt/HuntMonsterAttackAnimator.js');
const monsterGeometryChoreography = read('js/effects/hunt/HuntMonsterGeometryChoreography.js');
const renderer = read('js/effects/hunt/HuntRenderer.js');
const engine = read('js/effects/hunt/HuntEngine.js');
const effect = read('js/effects/HuntEffect.js');
const hunterTurns = read('js/effects/hunt/HuntHunterTurnExecutor.js');
const tactics = read('js/effects/hunt/HuntChatTactics.js');
const perks = read('js/effects/hunt/HuntPerkRuntime.js');
const flight = read('js/effects/hunt/HuntMonsterFlightRuntime.js');
const css = require('./helpers/hunt-css');
const combatRenderer = read('js/effects/hunt/HuntRenderer.js');

assert.match(animator, /triggerEnvironmentEffect\(kind,\s*hunterIndex\s*=\s*null,\s*details\s*=\s*null\)/);
assert.match(animator, /kind === 'blast-scale-place'[\s\S]*?hunt-blast-scale-hazard[\s\S]*?anchor\.appendChild\(hazard\)/,
    'a Bazelgeuse scale placement event must create a persistent combat DOM node');
assert.match(css, /\.hunt-blast-scale-hazard\.is-placed[\s\S]*?hunt-blast-scale-drop/,
    'placed Bazelgeuse scales must remain visibly rendered under hunter weapons');
assert.match(css,
    /\.hunt-blast-scale-hazard\.is-placed\.has-landed\s*\{[\s\S]*?opacity:\s*1;[\s\S]*?translate\(-50%,0\)/,
    'an unheated grounded blast scale must stay opaque throughout its normal waiting phase');
assert.match(animator, /sourcePart[\s\S]*?--blast-scale-source-x[\s\S]*?--blast-scale-arc-y/,
    'blast scales must launch from the live transformed monster body toward their ground slot');
assert.match(css, /\.hunt-blast-scale-hazard\.is-placed:not\(\.has-landed\)[\s\S]*?!important/,
    'heated scales must finish their body-to-ground flight before warning pulses can replace it');
assert.match(monsterGeometryChoreography, /runtimeDiveTargetIndex[\s\S]*?--monster-carpet-dive-x[\s\S]*?--monster-carpet-dive-y/,
    'Bazelgeuse must aim the diagonal crash animation at its independently selected dive target');
assert.match(css, /76%\s*\{\s*transform:translate\(var\(--monster-carpet-dive-x\),var\(--monster-carpet-dive-y\)\)/,
    'the carpet-bomb crash frame must visually contact the same hunter used by damage resolution');
assert.match(css,
    /17%\s*\{[^}]*--monster-charge-bottom[^}]*opacity:1[^}]*\}[\s\S]*?17\.01%\s*\{[^}]*--monster-charge-bottom[^}]*opacity:0/,
    'the opening charge must visibly run off-board before Bazelgeuse is hidden');
assert.match(css,
    /20\.99%\s*\{[^}]*--monster-carpet-start-x[^}]*opacity:0[^}]*\}[\s\S]*?21%\s*\{[^}]*--monster-carpet-start-x[^}]*opacity:1/,
    'the hidden reposition must finish before Bazelgeuse appears directly on the upper bombing lane');
assert.match(css, /\.hunt-blast-scale-hazard\.is-placed:not\(\.has-landed\)[\s\S]*?1\.35s/,
    'falling scales must remain large and readable long enough to see their body-to-ground route');
assert.match(monsterAttackAnimator, /Math\.round\(28 \+ normalized \* 38\)/,
    'carpet-bomb drops must be distributed across the long visible traversal instead of one fast burst');
assert.match(monsterGeometryChoreography, /--monster-carpet-flight-y[\s\S]*?Math\.max\(-160,/,
    'high-altitude bombing must stay visible inside the 1080p combat canvas');
assert.match(hunterTurns, /atomicFlightActive[\s\S]*?cancelInFlightScales/,
    'a flash interruption during the atomic flight sequence must cancel scales that have not landed');

{
    class FakeClassList {
        constructor() { this.values = new Set(); }
        add(...values) { values.forEach(value => this.values.add(value)); }
        contains(value) { return this.values.has(value); }
    }
    class FakeElement {
        constructor() {
            this.children = [];
            this.className = '';
            this.classList = new FakeClassList();
        }
        setAttribute() {}
        appendChild(child) { this.children.push(child); return child; }
        querySelector(selector) {
            if (selector === '.hunt-blast-scale-hazard') {
                return this.children.find(child => child.className === 'hunt-blast-scale-hazard') || null;
            }
            return null;
        }
        get offsetWidth() { return 78; }
    }
    const anchor = new FakeElement();
    const card = {
        querySelector(selector) {
            if (selector === '#fight-card-1') {
                return { querySelector: nested => nested === '.game-hunt-weapon-img-container' ? anchor : null };
            }
            return null;
        }
    };
    const previousDocument = global.document;
    const previousAttackAnimator = global.HuntMonsterAttackAnimator;
    global.document = { createElement: () => new FakeElement() };
    global.HuntMonsterAttackAnimator = class {};
    delete require.cache[require.resolve('../js/effects/hunt/HuntCombatAnimator.js')];
    const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');
    const pendingTimers = [];
    const instance = new HuntCombatAnimator({
        card,
        animationTimers: { timeout(callback, delay) { pendingTimers.push({ callback, delay }); } }
    });
    instance.triggerEnvironmentEffect('blast-scale-place', 1, { visualPalette: 'purple' });
    const hazard = anchor.querySelector('.hunt-blast-scale-hazard');
    assert.ok(hazard, 'a real combat animator call must append the blast scale to the hunter slot');
    assert.ok(hazard.classList.contains('is-placed'));
    assert.ok(hazard.classList.contains('palette-purple'),
        'Seething Bazelgeuse scales must retain their authored purple palette');
    const landingTimer = pendingTimers.find(timer => timer.delay === 1380);
    assert.ok(landingTimer, 'a dropped blast scale must transition into its grounded waiting state');
    landingTimer.callback();
    assert.ok(hazard.classList.contains('has-landed'),
        'an unheated scale must retain an explicit visible grounded state after its drop animation');
    instance.triggerEnvironmentEffect('blast-scale-heat', 1);
    assert.ok(hazard.classList.contains('is-heated'));
    global.document = previousDocument;
    global.HuntMonsterAttackAnimator = previousAttackAnimator;
}
for (const className of ['pitfall-hole', 'pitfall-hole-back', 'pitfall-hole-front', 'pitfall-net', 'pitfall-net-back', 'pitfall-net-front', 'pitfall-dirt', 'rockfall-boulder', 'rockfall-impact-ring', 'rockfall-debris']) {
    assert.ok(animator.includes(className), `${className} must be created by the environment animator`);
    assert.ok(css.includes(`.${className}`), `${className} must have a visible style`);
}
assert.match(animator, /querySelectorAll\('\.hunt-environment-effect'\).*remove/,
    'phase cleanup must remove detached environment effects');
assert.match(animator,
    /const replacementSelector = kind === 'pitfall'[\s\S]*?`\.environment-\$\{kind\}`;[\s\S]*?querySelectorAll\(replacementSelector\)/,
    'runtime environment effects must replace only their own lifecycle slot');
assert.doesNotMatch(animator,
    /triggerEnvironmentEffect\(kind,[\s\S]*?showcase\.querySelectorAll\('\.hunt-environment-effect'\)\.forEach/,
    'a transient runtime effect must not erase an active ATB-bound trap');
assert.match(renderer,
    /triggerEnvironmentEffect\(kind,\s*hunterIndex\s*=\s*null,\s*details\s*=\s*null\).*combatAnimator\.triggerEnvironmentEffect\(kind,\s*hunterIndex,\s*details\)/s);
assert.match(engine, /onTriggerEnvironmentEffect/);
assert.match(effect,
    /onTriggerEnvironmentEffect:\s*\(kind,\s*hunterIndex,\s*details\).*renderer\.triggerEnvironmentEffect\(kind,\s*hunterIndex,\s*details\)/s);
assert.match(hunterTurns, /triggerEnvironmentEffect\('pitfall'/);
assert.match(hunterTurns, /triggerEnvironmentEffect\('flash'/);
assert.match(animator, /'pitfall', 'pitfall-pending', 'rockfall', 'flash', 'bomb'/,
    'combat items need hunt-owned environment effects');
assert.match(animator, /kind === 'pitfall-pending'[\s\S]*?showcase\.appendChild\(effect\);[\s\S]*?return;/,
    'an airborne landing trap must remain visible until another environment event triggers it');
assert.match(css, /\.environment-flash/, 'flash use needs a visible full-combat burst');
assert.match(hunterTurns, /triggerEnvironmentEffect\('pitfall'/, 'the default trap inventory must deploy the authored pitfall reaction');
assert.doesNotMatch(animator, /if \(kind === 'shocktrap'\) kind = 'pitfall'/,
    'an explicit paralysis trap must never be rewritten as a pitfall trap');
assert.doesNotMatch(css, /\.environment-shocktrap\s*\{/,
    'the retired electric trap visual must not compete with the default pitfall');
assert.match(animator, /hunt-ground-web/, 'installed and triggered traps must use the same grounded web shape');
assert.match(css, /\.hunt-ground-web[\s\S]*?repeating-radial-gradient[\s\S]*?repeating-conic-gradient/,
    'the trap must be a large flat CSS web instead of a small emoji');
assert.match(css, /\.environment-bomb/, 'barrel bombs need a dedicated explosion effect');
assert.match(engine, /consumeTrapDuration\(baseTicks\)/, 'all trap sources need one shared diminishing-duration owner');
assert.match(engine, /beginMonsterTrapControl\(kind,\s*baseTicks\)/,
    'trap duration, diminishing ATB loss and visual lifetime need one shared runtime owner');
for (const [owner, source] of [
    ['hunter AI traps', hunterTurns],
    ['viewer support traps', tactics],
    ['landing traps', flight]
]) {
    assert.match(source, /beginMonsterTrapControl\(/,
        `${owner} must enter the shared half-ATB trap lifecycle`);
}
assert.match(animator, /kind === 'trap-release'[\s\S]*?environment-pitfall[\s\S]*?monster-pitfall-struggling/,
    'trap visuals must be explicitly released by ATB recovery instead of a fixed wall-clock timeout');
assert.match(animator, /const hasActivePitfall = Boolean\([\s\S]*?if \(!hasActivePitfall\) return;/,
    'an empty cleanup release must not poison the next trap with a stale release animation');
assert.match(animator, /monster-pitfall-caught'[\s\S]*?monster-pitfall-struggle-pulse'[\s\S]*?monster-pitfall-releasing'/,
    'new pitfall entry must clear every struggle and release class from the prior lifecycle');
assert.match(animator, /kind !== 'pitfall'/,
    'active trap visuals must not schedule fixed cleanup while the monster ATB is recovering');
assert.match(css, /\.environment-pitfall\.is-atb-bound[\s\S]*?pitfall-open-held/,
    'the pitfall hole must remain visible throughout the ATB-bound opening');
assert.match(tactics, /triggerEnvironmentEffect\?\.\('pitfall'/);
assert.match(tactics, /triggerEnvironmentEffect\?\.\('rockfall'/);
assert.match(hunterTurns, /trapImmune.*isMonsterTrapImmune/s,
    'support AI traps must use the shared immunity rule');
for (const keyframe of ['pitfall-open', 'monster-pitfall-caught', 'rockfall-drop', 'rockfall-impact-ring', 'hunt-rockfall-screen-shake']) {
    assert.ok(css.includes(`@keyframes ${keyframe}`), `${keyframe} animation must remain defined`);
}
assert.match(animator, /monster-pitfall-struggling/,
    'pitfall entry must transition into a persistent struggle pose');
assert.doesNotMatch(animator,
    /kind === 'trap-struggle'[\s\S]{0,220}?pitfallBeatOwned[\s\S]{0,80}?return/,
    'BEAT ownership must not suppress resistance-aware live struggle pulses');
assert.match(css, /monster-pitfall-caught\.monster-pitfall-struggle-pulse[\s\S]*?monster-pitfall-struggle/,
    'pitfall struggle must be an explicitly triggered pulse rather than an uncounted infinite loop');
assert.match(css, /monster-pitfall-struggle-pulse\s*\{[^}]*animation:monster-pitfall-struggle 1\.2s/,
    'each pitfall struggle pulse must visibly spend 1.2 seconds attempting escape');
assert.match(css, /@keyframes monster-pitfall-struggle[\s\S]*?translate\(15px,27px\)[\s\S]*?translate\(-10px,23px\)[\s\S]*?translate\(0,59px\)[\s\S]*?translateY\(50px\)/,
    'the struggle must visibly brace in both directions, slip back into the hole, then settle into the held pose');
assert.doesNotMatch(css, /monster-pitfall-struggle[\s\S]{0,900}?clip-path:inset\(0 0 [0-9]% 0\)/,
    'a pitfall struggle must never reveal nearly the whole monster and make it appear airborne');
assert.match(css, /@keyframes monster-pitfall-release[\s\S]*?55%[\s\S]*?translate\(7px,31px\)[\s\S]*?90%[\s\S]*?translateY\(-8px\)/,
    'the monster must climb out throughout the escape beat instead of teleporting home at its start');
assert.match(css, /@keyframes pitfall-close\s*\{[\s\S]*?0%,72%\{opacity:1\}/,
    'the hole and net must stay visible until the monster has mostly climbed out');
assert.match(css, /\.pitfall-rear\s*\{[^}]*z-index:5[\s\S]*?\.pitfall-front\s*\{[^}]*z-index:15/,
    'the rear rim must sit behind the monster while the foreground net and mask sit in front');
assert.match(css, /@keyframes monster-pitfall-caught[\s\S]*?clip-path:inset\(0 0 34% 0\)/,
    'the trapped monster lower body must be occluded as it sinks');
assert.doesNotMatch(css, /monster-shocktrap-held/,
    'the retired electric-spasm animation must not survive in production CSS');
assert.match(combatRenderer, /monster-pitfall-releasing[\s\S]*?pitfallLifecycle/,
    'pitfall escape must own its visual lifecycle instead of disappearing on state restoration');
assert.doesNotMatch(combatRenderer, /stateName\.includes\('대경직'\)\s*\|\|\s*stateName\.includes\('함정'\)/,
    'monster state refresh must not layer the retired generic knockdown animation over a pitfall');
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
