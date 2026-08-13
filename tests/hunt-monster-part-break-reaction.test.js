'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class StubMonsterAttackAnimator {
    constructor() { this.played = []; }
    clearMonsterMotion() {}
    getMonsterMotionTrace() { return []; }
    playBeatMotion(monsterImg, pattern) { this.played.push(pattern); return { durationMs: 1 }; }
}
global.HuntMonsterAttackAnimator = StubMonsterAttackAnimator;
global.HuntMonsterReactionCatalog = require('../js/effects/hunt/HuntMonsterReactionCatalog.js');
global.HuntMonsterAnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');

assert.deepStrictEqual([5, 4, 3, 2].map(count =>
    global.HuntMonsterReactionCatalog.resolveKnockdown('diablos', count).motion
        .filter(beat => /^struggle-/.test(beat.beat)).length),
[5, 4, 3, 2], 'the canonical knockdown resolver must trim struggle beats deterministically');

const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

function classList() {
    const values = new Set();
    return {
        add: (...names) => names.forEach(name => values.add(name)),
        remove: (...names) => names.forEach(name => values.delete(name)),
        contains: name => values.has(name),
        values
    };
}

const scheduled = [];
const styles = new Map();
const monsterImg = {
    classList: classList(),
    dataset: {},
    style: {
        setProperty: (name, value) => styles.set(name, value),
        removeProperty: name => styles.delete(name)
    },
    offsetWidth: 380
};
const card = {
    querySelector: selector => selector === '#fight-monster-img' ? monsterImg : null,
    querySelectorAll: () => []
};
const animator = new HuntCombatAnimator({
    card,
    animationTimers: {
        timeout: (callback, delay) => {
            scheduled.push({ callback, delay });
            return scheduled.length;
        }
    }
});
const queuedPartBreakVisuals = [];
animator.queueMonsterPartBreakVisual = partKind => queuedPartBreakVisuals.push(partKind);

animator.triggerMonsterPartBreakReaction('part_flinch', 30, 'head');
assert.strictEqual(monsterImg.classList.contains('monster-part-break-topple'), false,
    'part reactions must not start the retired CSS motion');
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), false);
assert.strictEqual(monsterImg.dataset.partBreakKind, 'head');
assert.strictEqual(animator.monsterAttackAnimator.played.at(-1).id, '__reaction.flinch');
assert.strictEqual(scheduled.at(-1).delay, 3080);

animator.triggerMonsterPartBreakReaction('tail_sever_roll', 55, 'tail');
assert.strictEqual(monsterImg.classList.contains('monster-part-break-topple'), false);
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), false);
assert.strictEqual(monsterImg.dataset.partBreakKind, 'tail');
assert.strictEqual(animator.monsterAttackAnimator.played.at(-1).id, '__reaction.knockdown');
assert.strictEqual(scheduled.at(-1).delay, 6080);
animator.triggerMonsterKnockdownAnim();
assert.strictEqual(monsterImg.classList.contains('monster-knockdown-anim'), false,
    'a generic knockdown refresh must not replace an active authored part reaction');
assert.deepStrictEqual(queuedPartBreakVisuals, ['head', 'tail'],
    'each part break must enqueue exactly one material-split visual');

// An old cleanup must not cancel a newer reaction.
scheduled[0].callback();
assert.strictEqual(monsterImg.dataset.partBreakKind, 'tail');
scheduled.at(-1).callback();
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), false);

animator.triggerMonsterPartBreakReaction('part_flinch', 14, null);
assert.strictEqual(animator.monsterAttackAnimator.played.at(-1).id, '__reaction.flinch',
    'an accumulated small flinch must use the shared authored BEAT profile');
assert.strictEqual(monsterImg.classList.contains('monster-part-break-topple'), false);

function breakPart(part, weapon, monsterId = 'test', rawDamage = 10000, options = {}) {
    const reactions = [];
    const sounds = [];
    const soundContexts = [];
    const engine = {
        monsterAnatomy: { id: monsterId },
        monsterPartState: [{
            ...part,
            maxHealth: part.health,
            damageAccumulated: 0,
            broken: false,
            severed: false,
            hitzones: { slash: 1, blunt: 1, pierce: 1 }
        }],
        monsterMaxHp: 1000,
        monsterHp: 1000,
        monsterState: 'normal',
        monsterFlightState: 'grounded',
        monsterKnockdownDuration: 0,
        monsterActionLockTicks: 0,
        monsterAtb: 100,
        monsterActionPresentationTicks: Number(options.presentationTicks || 0),
        pendingMonsterAction: options.pendingMonsterAction || null,
        pendingMonsterImpact: null,
        monsterTraversalState: null,
        monsterBurrowState: null,
        pendingMonsterPartReactions: [],
        monsterStunDuration: 0,
        selectedMonster: { id: monsterId, nameKO: '시험 몬스터' },
        severedTail: { available: false },
        callbacks: {
            onTriggerMonsterPartBreakReaction: (...args) => reactions.push(args)
        },
        random: () => 0,
        updateMonsterPartsUI: () => {},
        updateTailSeverUI: () => {},
        addLog: () => {},
        interruptMonsterMovement: () => {},
        playSFX: (kind, _variant, context) => { sounds.push(kind); soundContexts.push(context); },
        updateMonsterAtbUI: () => {}
    };
    const result = HuntEngine.prototype.recordMonsterPartDamage.call(engine, weapon, rawDamage);
    return { engine, reactions, sounds, soundContexts, result };
}

const headBreak = breakPart(
    { id: 'test:head', kind: 'head', health: 10, breakable: true, severable: false },
    { id: 'hammer' }
);
assert.strictEqual(headBreak.result.newlyBroken, true);
assert.strictEqual(headBreak.engine.monsterKnockdownDuration, 0);
assert.strictEqual(headBreak.engine.monsterActionLockTicks, 30);
assert.strictEqual(headBreak.engine.monsterAtb, 50);
assert.strictEqual(headBreak.engine.monsterState, 'normal');
assert.deepStrictEqual(headBreak.reactions[0], ['part_flinch', 30, 'head']);
assert.strictEqual(headBreak.soundContexts[0].partBreakSize, 'small',
    'an ordinary break must route through the shared small-break group');

const activePatternHeadBreak = breakPart(
    { id: 'test:deferred-head', kind: 'head', health: 10, breakable: true, severable: false },
    { id: 'hammer' },
    'test',
    10000,
    { presentationTicks: 12 }
);
assert.strictEqual(activePatternHeadBreak.result.newlyBroken, true,
    'part durability must still accumulate during a monster attack');
assert.strictEqual(activePatternHeadBreak.result.reactionDeferred, undefined,
    'an already-confirmed hit must not wait for the monster pattern to finish');
assert.deepStrictEqual(activePatternHeadBreak.reactions[0], ['part_flinch', 30, 'head'],
    'a confirmed part break must interrupt the active monster pattern immediately');
assert.strictEqual(activePatternHeadBreak.result.part.broken, true);
assert.strictEqual(activePatternHeadBreak.result.part.breakPending, false);

const diablosHeadFlinch = breakPart(
    {
        id: 'diablos:head', kind: 'head', health: 100000, breakable: true,
        severable: false, flinchHealth: 10, flinchAccumulated: 0
    },
    { id: 'hammer' },
    'diablos',
    20
);
assert.strictEqual(diablosHeadFlinch.result.newlyFlinched, true);
assert.strictEqual(diablosHeadFlinch.engine.monsterState, 'normal',
    'an ordinary Diablos part flinch must not masquerade as a full knockdown');
assert.strictEqual(diablosHeadFlinch.engine.monsterKnockdownDuration, 0);
assert.strictEqual(diablosHeadFlinch.engine.monsterActionLockTicks, 18);
assert.strictEqual(diablosHeadFlinch.engine.monsterAtb, 50);
assert.deepStrictEqual(diablosHeadFlinch.reactions[0], ['part_flinch', 18, null]);
assert.strictEqual(diablosHeadFlinch.sounds[0], 'monster_flinch');
assert.strictEqual(diablosHeadFlinch.soundContexts[0].partBreakSize, null,
    'ordinary accumulated flinches must remain generic flinches, not small part breaks');

const tailBreak = breakPart(
    { id: 'test:tail', kind: 'tail', health: 10, breakable: false, severable: true },
    { id: 'great_sword' }
);
assert.strictEqual(tailBreak.result.newlySevered, true);
assert.strictEqual(tailBreak.engine.monsterKnockdownDuration, 60);
assert.strictEqual(tailBreak.engine.monsterAtb, 50);
assert.strictEqual(tailBreak.engine.severedTail.available, true);
assert.deepStrictEqual(tailBreak.reactions[0], ['tail_sever_roll', 60, 'tail']);

for (const side of ['left', 'right']) {
    const forelegBreak = breakPart(
        { id: `tigrex:${side}-front-leg`, kind: `${side}-front-leg`, health: 10, breakable: true, severable: false },
        { id: 'great_sword' },
        'tigrex'
    );
    assert.strictEqual(forelegBreak.engine.monsterKnockdownDuration, 60);
    assert.deepStrictEqual(forelegBreak.reactions[0], ['part_break_topple', 60, `${side}-front-leg`]);
    assert.strictEqual(forelegBreak.sounds[0], 'monster_knockdown',
        'Tigrex foreleg breaks must use the large-knockdown reaction and sound');
}

for (const side of ['left', 'right']) {
    const forelegBreak = breakPart(
        { id: `diablos:${side}-front-leg`, kind: `${side}-front-leg`, health: 10, breakable: true, severable: false },
        { id: 'great_sword' },
        'diablos'
    );
    assert.strictEqual(forelegBreak.engine.monsterKnockdownDuration, 60);
    assert.strictEqual(forelegBreak.engine.monsterState, 'knocked_down');
    assert.deepStrictEqual(forelegBreak.reactions[0], ['part_break_topple', 60, `${side}-front-leg`]);
    assert.strictEqual(forelegBreak.sounds[0], 'monster_knockdown');
}

assert.strictEqual(HuntAtbConfig.monsterAtbAfterPartBreak(60), 50);
assert.strictEqual(HuntAtbConfig.monsterAtbAfterPartBreak(-80), 50);
for (const kind of ['partBreak', 'flinch', 'stumble', 'trap']) {
    assert.strictEqual(HuntAtbConfig.monsterAtbAfterControl(kind), 50,
        `${kind} must set a fixed half gauge instead of subtracting from current ATB`);
}
for (const kind of ['knockdown', 'stun', 'paralysis', 'sleep']) {
    assert.strictEqual(HuntAtbConfig.monsterAtbAfterControl(kind), 100,
        `${kind} must fill and hold ATB so the monster can act as soon as control ends`);
}
assert.strictEqual(HuntAtbConfig.monsterAtbAfterControl('flash'), 50,
    'a flash reaction must retain a fixed half gauge instead of emptying ATB');
const negativeControlEngine = {
    monsterAtb: -175,
    updateMonsterAtbUI(value) { this.renderedMonsterAtb = value; }
};
assert.strictEqual(HuntAtbConfig.applyMonsterControlAtb(negativeControlEngine, 'trap'), 50);
assert.strictEqual(negativeControlEngine.monsterAtb, 50,
    'a trap must overwrite pre-existing action debt rather than subtract another half gauge');
assert.strictEqual(negativeControlEngine.renderedMonsterAtb, 50);
assert.deepStrictEqual(
    [1, .7, .45, .25].map(multiplier => HuntAtbConfig.monsterAtbAfterTrap(multiplier)),
    [50, 65, 77.5, 87.5],
    'trap resistance must reduce the ATB loss rather than subtracting a fixed half gauge every time'
);

const engineSource = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntEngine.js'),
    'utf8'
);
assert.match(engineSource, /onTriggerMonsterPartBreakReaction/);
assert.match(engineSource, /monsterKnockdownDuration = Math\.max/);
assert.doesNotMatch(
    engineSource.match(/recordMonsterPartDamage\([\s\S]*?\n    updateTailSeverUI/)?.[0] || '',
    /reaction\.type === 'topple'/,
    'all genuine part breaks must use the shared control-state reaction'
);

const css = fs.readFileSync(path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');
const animatorSource = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntCombatAnimator.js'),
    'utf8'
);
const rendererSource = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntRenderer.js'),
    'utf8'
);
const engineSourceForStun = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntEngine.js'),
    'utf8'
);
assert.match(engineSourceForStun,
    /kind === 'stun'[\s\S]*?onTriggerMonsterKnockdownAnim\?\.\(\{[\s\S]*?kind: 'stun'[\s\S]*?struggleCount/,
    'monster KO must invoke the same large-knockdown body reaction');
assert.match(engineSourceForStun, /const struggleCount = Math\.max\(3, 6 - this\.monsterStunCount\)/,
    'successive KO reactions must use 5, 4, then at least 3 struggles');
assert.match(engineSourceForStun, /stunBlocksKnockdown[\s\S]*?!stunBlocksKnockdown/,
    'part-break knockdowns must not start while KO is active');
assert.doesNotMatch(css, /monster-stun-shake|\.game-hunt-monster-img\.stunned_monster/,
    'monster KO must not retain a competing shake-only CSS body motion');
assert.match(css, /\.monster-stun-head-marker[\s\S]*?@keyframes monster-stun-head-orbit/,
    'monster KO must render a dedicated visible marker at the head');
assert.match(animatorSource, /getBoxQuads\?\.\(\)[\s\S]*?requestAnimationFrame\(followHead\)/,
    'the single KO marker must follow the transformed anatomy head every frame');
assert.match(rendererSource, /const visibleIcon = stunned \? '' : icon/,
    'the generic monster-state badge must not duplicate the KO head marker');
assert.doesNotMatch(css, /@keyframes monster-part-break-topple|@keyframes monster-part-flinch|@keyframes monster-tail-sever-roll/,
    'legacy CSS part-reaction timelines must not coexist with the shared BEAT owner');
assert.match(css, /@keyframes monster-knockdown-sequence/);
assert.match(css, /monster-knockdown-sequence var\(--monster-knockdown-duration, 7\.6s\)/,
    'large knockdown duration must follow its authored BEAT total');
const knockdownCss = css.match(/@keyframes monster-knockdown-sequence[\s\S]*?\n\}/)?.[0] || '';
assert.match(knockdownCss, /rotate\(30deg\) scale\(1\.08,\.68\) skewX\(-10deg\)/,
    'large knockdown must reuse the tail-sever sideways squashed pose');
assert.strictEqual((knockdownCss.match(/rotate\(15deg\)/g) || []).length, 5,
    'each struggle must rise from 30 degrees to 15 degrees before collapsing');
assert.match(knockdownCss, /100% \{ transform:rotate\(0deg\) scale\(1\) skewX\(0\)/,
    'the monster must retain its 30 degree topple through every struggle and stand upright only during rise');
assert.match(css, /transform-origin:50% 100% !important/,
    'large knockdown must pivot around the planted legs instead of sliding the whole image');
assert.match(animatorSource, /savedBeats[\s\S]*?elapsedTicks \* 100[\s\S]*?audioPatternId/,
    'each struggle and rise sound must derive from the saved BEAT timeline instead of fixed milliseconds');
assert.match(animatorSource, /Stun differs only by its head marker[\s\S]*?const audioPatternId = '__reaction\.knockdown'/,
    'stun must reuse the reviewed knockdown audio route as well as its body timing');
assert.match(animatorSource, /monsterAttackAnimator\.playBeatMotion/,
    'live part reactions must execute the same authored BEAT motion exposed by the editor');
assert.match(css, /\.monster-part-break-visual\s*\{[^}]*left:50%[^}]*top:50%[^}]*z-index:75/s,
    'part-break material must be fixed over the visible monster-stage center');
assert.match(css, /animation:monster-part-break-visual 2500ms linear both/,
    'part-break material must use the authored 0.5s reveal, 1s split, and 1s fade timeline');
assert.match(css, /monster-part-break-half\.is-left[\s\S]*?clip-path:polygon/,
    'the material image must be cut into a real left half');
assert.match(css, /monster-part-break-half\.is-right[\s\S]*?clip-path:polygon/,
    'the material image must be cut into a real right half');
assert.match(css, /@keyframes monster-part-break-left[\s\S]*?20% \{ opacity:1[\s\S]*?60% \{ opacity:1/s,
    'the split must begin after the first 0.5 seconds and finish one second later');
assert.doesNotMatch(animatorSource, /monster-part-break-crack|crack\.textContent/,
    'part breaks must split the material itself instead of covering it with an emoji');
assert.doesNotMatch(animatorSource, /spawnMonsterPartBreakEffect|hunt-monster-part-break-burst/,
    'the retired local burst must not duplicate the central material-split visual');
assert.doesNotMatch(css, /\.hunt-monster-part-break-burst|@keyframes hunt-part-break-fragment/,
    'legacy duplicate part-break presentation CSS must stay removed');
assert.match(animatorSource, /const visualDurationMs = 2500/);
assert.match(animatorSource, /monsterPartBreakVisualQueue\.push[\s\S]*?playNextMonsterPartBreakVisual/,
    'rapid part breaks must queue instead of replacing an unread visual');
assert.match(animatorSource, /stage\.appendChild\(visual\)/,
    'the part-break visual must belong to the fixed monster showcase stage');

console.log('[test] Shared monster part-break reaction contract passed.');
