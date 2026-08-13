'use strict';

const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = {
    diablos: { '__reaction.sleep': { beats: {
        'sleep-enter': { ticks: 30 }, held: { ticks: 200 }, wake: { ticks: 5 }
    } } }
};
global.HuntMonsterReactionCatalog = require('../js/effects/hunt/HuntMonsterReactionCatalog.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const fs = require('fs');
const path = require('path');

function harness() {
    const scheduled = [];
    const sounds = [];
    const animations = [];
    const engine = Object.create(HuntEngine.prototype);
    Object.assign(engine, {
        selectedMonster: { id: 'diablos', nameKO: '디아블로스' },
        monsterHp: 1000,
        monsterState: 'normal',
        monsterAtb: 0,
        monsterSpeed: 1,
        monsterStunDuration: 0,
        monsterKnockdownDuration: 0,
        monsterStunCount: 0,
        monsterSleepGeneration: 0,
        monsterSleepWakeBatch: null,
        battleTime: 120,
        callbacks: { onTriggerMonsterSleepAnim: details => animations.push(details) },
        schedule: (callback, delay) => { scheduled.push({ callback, delay }); return scheduled.length; },
        playSFX: (kind, fallback, context) => sounds.push(context),
        interruptMonsterMovement: () => {},
        setMonsterAtbForControl: () => { engine.monsterAtb = 100; },
        updateMonsterStateUI: () => {},
        updateMonsterAtbUI: () => {},
        addLog: () => {},
        getMonsterSpeedForState: () => 1,
        monsterFlightRuntime: null,
        monsterStaminaRuntime: null
    });
    return { engine, scheduled, sounds, animations };
}

{
    const { engine, scheduled, sounds } = harness();
    assert.strictEqual(engine.enterMonsterControlState('sleep', 1), true);
    const heldCallbacks = scheduled.filter(item => item.delay >= 3000 && item.delay <= 21000
        && item.delay % 3000 === 0);
    assert.deepStrictEqual(heldCallbacks.map(item => item.delay),
        [3000, 6000, 9000, 12000, 15000, 18000, 21000]);
    heldCallbacks.forEach(item => item.callback());
    assert.strictEqual(sounds.filter(item => item.patternSlot === 'beat:held').length, 7,
        'sleep-held audio must play on entry and every three seconds while held');
}

{
    const { engine, animations } = harness();
    engine.monsterState = 'sleeping';
    engine.monsterKnockdownDuration = 235;
    assert.strictEqual(engine.resolveSleepWakeDamage(40, { direct: false }), 40);
    assert.strictEqual(engine.monsterState, 'sleeping', 'damage-over-time must not wake sleep');
    assert.strictEqual(engine.resolveSleepWakeDamage(40, { direct: true, groupKey: 120 }), 80);
    assert.strictEqual(engine.monsterState, 'normal');
    assert.strictEqual(engine.monsterAtb, 100);
    assert.strictEqual(engine.resolveSleepWakeDamage(70, { direct: true, groupKey: 120 }), 100,
        'a larger simultaneous hit must replace only the shared sleep bonus delta');
    assert.strictEqual(engine.resolveSleepWakeDamage(20, { direct: true, groupKey: 120 }), 20);
    assert.deepStrictEqual(animations.at(-1).motion.map(beat => beat.beat), ['wake'],
        'a direct wake hit must immediately play only the wake motion');
}

const hunterTurnSource = fs.readFileSync(path.resolve(__dirname,
    '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
const perkRuntimeSource = fs.readFileSync(path.resolve(__dirname,
    '../js/effects/hunt/HuntPerkRuntime.js'), 'utf8');
assert.match(hunterTurnSource, /resolveSleepWakeDamage\?\.\(damage,[\s\S]*?direct: true/,
    'ordinary hunter hits must pass through the shared sleep wake resolver');
assert.match(perkRuntimeSource, /item\.large-barrel-bomb[\s\S]*?monsterHp = Math\.max/,
    'barrel bombs must receive the same wake bonus before applying monster HP damage');

console.log('[test] Shared monster sleep audio, wake bonus, and wake motion contract passed.');
