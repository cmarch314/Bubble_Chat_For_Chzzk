'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

class StubMonsterAttackAnimator {
    constructor() {}
    clearMonsterMotion() {}
    getMonsterMotionTrace() { return []; }
}
global.HuntMonsterAttackAnimator = StubMonsterAttackAnimator;
global.HuntMonsterAnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');

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

animator.triggerMonsterPartBreakReaction('part_break_topple', 35, 'head');
assert.strictEqual(monsterImg.classList.contains('monster-part-break-topple'), true);
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), false);
assert.strictEqual(styles.get('--monster-part-reaction-duration'), '3500ms');
assert.strictEqual(monsterImg.dataset.partBreakKind, 'head');
assert.strictEqual(scheduled.at(-1).delay, 3580);

animator.triggerMonsterPartBreakReaction('tail_sever_roll', 55, 'tail');
assert.strictEqual(monsterImg.classList.contains('monster-part-break-topple'), false);
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), true);
assert.strictEqual(styles.get('--monster-part-reaction-duration'), '5500ms');
assert.strictEqual(monsterImg.dataset.partBreakKind, 'tail');
assert.strictEqual(scheduled.at(-1).delay, 5580);
animator.triggerMonsterKnockdownAnim();
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), true,
    'a generic knocked-down refresh must not erase the authored tail-sever tumble');
assert.strictEqual(monsterImg.classList.contains('monster-knockdown-anim'), false,
    'tail sever owns the pose until its reaction generation finishes');
assert.deepStrictEqual(queuedPartBreakVisuals, ['head', 'tail'],
    'each part break must enqueue exactly one material-split visual');

// An old cleanup must not cancel a newer reaction.
scheduled[0].callback();
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), true);
scheduled.at(-1).callback();
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), false);
assert.strictEqual(styles.has('--monster-part-reaction-duration'), false);

function breakPart(part, weapon, monsterId = 'test') {
    const reactions = [];
    const sounds = [];
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
        monsterAtb: 100,
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
        playSFX: kind => sounds.push(kind),
        updateMonsterAtbUI: () => {}
    };
    const result = HuntEngine.prototype.recordMonsterPartDamage.call(engine, weapon, 10000);
    return { engine, reactions, sounds, result };
}

const headBreak = breakPart(
    { id: 'test:head', kind: 'head', health: 10, breakable: true, severable: false },
    { id: 'hammer' }
);
assert.strictEqual(headBreak.result.newlyBroken, true);
assert.strictEqual(headBreak.engine.monsterKnockdownDuration, 40);
assert.strictEqual(headBreak.engine.monsterAtb, 50);
assert.strictEqual(headBreak.engine.monsterState, 'knocked_down');
assert.deepStrictEqual(headBreak.reactions[0], ['part_break_topple', 40, 'head']);

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
    assert.strictEqual(forelegBreak.engine.monsterKnockdownDuration, 80);
    assert.deepStrictEqual(forelegBreak.reactions[0], ['part_break_topple', 80, `${side}-front-leg`]);
    assert.strictEqual(forelegBreak.sounds[0], 'monster_knockdown',
        'Tigrex foreleg breaks must use the large-knockdown reaction and sound');
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
assert.strictEqual(HuntAtbConfig.monsterAtbAfterControl('flash'), 0,
    'a non-knockdown flash reaction keeps its explicit reset policy');
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
assert.match(css, /@keyframes monster-part-break-topple/);
assert.match(css, /@keyframes monster-tail-sever-roll/);
assert.match(
    css,
    /@keyframes monster-tail-sever-roll[\s\S]*?78%\s*\{[^}]*rotate\(720deg\)[^}]*\}[\s\S]*?91%\s*\{[^}]*rotate\(720deg\)[^}]*\}[\s\S]*?100%\s*\{[^}]*rotate\(720deg\)/,
    'tail-sever recovery must hold the completed forward-roll angle instead of rewinding it'
);
assert.match(css, /\.game-hunt-monster-img\.monster-part-break-topple/);
assert.match(css, /\.game-hunt-monster-img\.monster-tail-sever-roll/);
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
