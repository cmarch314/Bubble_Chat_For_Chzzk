'use strict';

const assert = require('assert');
const Policy = require('../js/effects/hunt/HuntSupportItemPolicy.js');

assert.deepStrictEqual(
    ['offensive', 'normal', 'veteran', 'defensive', 'support', 'newbie']
        .map(personality => Policy.initialFlashCount(personality)),
    [0, 1, 1, 1, 2, 1]
);
assert.deepStrictEqual(
    ['offensive', 'normal', 'veteran', 'defensive', 'support', 'newbie']
        .map(personality => Policy.flashUseChance(personality)),
    [0, .5, 1, .75, .9, .15]
);

const support = { personality: 'support', status: 'alive', flashPods: 2 };
const veteran = { personality: 'veteran', status: 'alive', flashPods: 1 };
const engine = {
    monsterFlightState: 'airborne',
    monsterFlashUseCount: 0,
    selectedWeapons: [veteran, support]
};
assert.strictEqual(Policy.canUseFlash(engine, veteran, () => 0), false,
    'veterans must reserve their pod while another hunter can flash');
assert.strictEqual(Policy.canUseFlash(engine, support, () => .89), true);
assert.strictEqual(Policy.canUseFlash(engine, support, () => .9), false);
support.flashPods = 0;
assert.strictEqual(Policy.canUseFlash(engine, veteran, () => .99), true,
    'a veteran must use the final available flash with 100% probability');
engine.monsterFlashUseCount = 4;
assert.strictEqual(Policy.canUseFlash(engine, veteran, () => 0), false,
    'AI must not waste pods after four effective flashes');
engine.monsterFlashUseCount = 0;
engine.monsterFlightState = 'grounded';
assert.strictEqual(Policy.canUseFlash(engine, veteran, () => 0), false,
    'personality flash stock is reserved for an airborne monster');

global.HuntSupportItemPolicy = Policy;
const HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');
{
    const events = [];
    const hunter = {
        index: 0,
        id: 'great_sword',
        hunterName: '지원냥',
        personality: 'support',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        atb: 100,
        flashPods: 1,
        shockTraps: 0
    };
    const runtimeEngine = {
        selectedWeapons: [hunter],
        selectedMonster: { id: 'rathalos', nameKO: '리오레우스' },
        monsterHp: 1000,
        monsterFlightState: 'airborne',
        monsterFlashUseCount: 0,
        monsterAtb: 100,
        random: () => 0,
        isMonsterTrapImmune: () => false,
        interruptMonsterMovement: reason => events.push(`interrupt:${reason}`),
        updateMonsterAtbUI: () => {},
        updateHunterItemUI: target => events.push(`items:${target.flashPods}`),
        triggerEnvironmentEffect: kind => events.push(`effect:${kind}`),
        addLog: () => {},
        showSkillBubble: () => {},
        monsterFlightRuntime: {
            forceLanding(target, reason) {
                events.push(`landing:${reason}`);
                target.monsterFlightState = 'grounded';
                target.monsterState = 'knocked_down';
                target.monsterKnockdownDuration = 105;
            }
        }
    };
    HuntHunterTurnExecutor.execute(runtimeEngine, hunter);
    assert.strictEqual(hunter.flashPods, 0);
    assert.strictEqual(runtimeEngine.monsterFlashUseCount, 1);
    assert.strictEqual(runtimeEngine.monsterKnockdownDuration, 105);
    assert.deepStrictEqual(events, ['interrupt:flash', 'landing:flash', 'items:0', 'effect:flash']);
}

{
    const hunter = {
        index: 0,
        id: 'lance',
        hunterName: '함정냥',
        personality: 'newbie',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        atb: 100,
        flashPods: 1,
        shockTraps: 1
    };
    const runtimeEngine = {
        selectedWeapons: [hunter],
        selectedMonster: { id: 'rathalos', nameKO: '리오레우스' },
        monsterHp: 1000,
        monsterFlightState: 'airborne',
        monsterFlashUseCount: 0,
        monsterAtb: 100,
        random: () => .99,
        isMonsterTrapImmune: () => false,
        updateHunterItemUI: () => {},
        triggerEnvironmentEffect: kind => { runtimeEngine.effectKind = kind; },
        addLog: () => {}
    };
    HuntHunterTurnExecutor.execute(runtimeEngine, hunter);
    assert.strictEqual(hunter.shockTraps, 0);
    assert.deepStrictEqual(runtimeEngine.pendingLandingTrap, {
        hunterIndex: 0,
        hunterName: '함정냥'
    });
    assert.strictEqual(runtimeEngine.effectKind, 'shocktrap-pending');
}

console.log('[test] Personality flash inventory, priority, probability, and resistance passed.');
