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

// An old cleanup must not cancel a newer reaction.
scheduled[0].callback();
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), true);
scheduled.at(-1).callback();
assert.strictEqual(monsterImg.classList.contains('monster-tail-sever-roll'), false);
assert.strictEqual(styles.has('--monster-part-reaction-duration'), false);

function breakPart(part, weapon) {
    const reactions = [];
    const engine = {
        monsterAnatomy: { id: 'test' },
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
        selectedMonster: { id: 'test', nameKO: '시험 몬스터' },
        severedTail: { available: false },
        callbacks: {
            onTriggerMonsterPartBreakReaction: (...args) => reactions.push(args)
        },
        random: () => 0,
        updateMonsterPartsUI: () => {},
        updateTailSeverUI: () => {},
        addLog: () => {},
        interruptMonsterMovement: () => {},
        playSFX: () => {},
        updateMonsterAtbUI: () => {}
    };
    const result = HuntEngine.prototype.recordMonsterPartDamage.call(engine, weapon, 10000);
    return { engine, reactions, result };
}

const headBreak = breakPart(
    { id: 'test:head', kind: 'head', health: 10, breakable: true, severable: false },
    { id: 'hammer' }
);
assert.strictEqual(headBreak.result.newlyBroken, true);
assert.strictEqual(headBreak.engine.monsterKnockdownDuration, 35);
assert.strictEqual(headBreak.engine.monsterAtb, 50);
assert.strictEqual(headBreak.engine.monsterState, 'knocked_down');
assert.deepStrictEqual(headBreak.reactions[0], ['part_break_topple', 35, 'head']);

const tailBreak = breakPart(
    { id: 'test:tail', kind: 'tail', health: 10, breakable: false, severable: true },
    { id: 'great_sword' }
);
assert.strictEqual(tailBreak.result.newlySevered, true);
assert.strictEqual(tailBreak.engine.monsterKnockdownDuration, 55);
assert.strictEqual(tailBreak.engine.monsterAtb, 50);
assert.strictEqual(tailBreak.engine.severedTail.available, true);
assert.deepStrictEqual(tailBreak.reactions[0], ['tail_sever_roll', 55, 'tail']);

assert.strictEqual(HuntAtbConfig.monsterAtbAfterPartBreak(60), 30);
assert.strictEqual(HuntAtbConfig.monsterAtbAfterPartBreak(-80), 0);

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
assert.match(css, /@keyframes monster-part-break-topple/);
assert.match(css, /@keyframes monster-tail-sever-roll/);
assert.match(css, /\.game-hunt-monster-img\.monster-part-break-topple/);
assert.match(css, /\.game-hunt-monster-img\.monster-tail-sever-roll/);

console.log('[test] Shared monster part-break reaction contract passed.');
