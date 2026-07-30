'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');

assert.deepStrictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({ tags: ['weak'] }, { index: 0 }),
    { kind: 'weak', durationTicks: 15, knockbackDirection: -1 }
);
assert.deepStrictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({}, { index: 3 }),
    { kind: 'strong', durationTicks: 40, knockbackDirection: 1 },
    'untagged attacks must conservatively use the strong reaction'
);
assert.strictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({ attackDirection: 'left' }, { index: 3 }).knockbackDirection,
    1,
    'an authored incoming direction must throw the weapon in the opposite direction'
);
assert.strictEqual(HuntMonsterTurnExecutor.isHunterHitRecovering({ hitDuration: 1 }), true);

const tickPath = path.resolve(__dirname, '../js/effects/hunt/HuntBattleTickExecutor.js');
const context = vm.createContext({ console });
context.HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');
context.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
vm.runInContext(
    `${fs.readFileSync(tickPath, 'utf8')}\nglobalThis.HuntBattleTickExecutor = HuntBattleTickExecutor;`,
    context,
    { filename: tickPath }
);

function recoveryEngine(durationTicks, pendingStunDuration = 0) {
    const hunter = {
        index: 0, id: 'great_sword', name: 'Tester', hunterName: 'Tester',
        status: 'alive', hp: 100, maxHp: 100, atb: 0,
        hitDuration: durationTicks, hitRecoveryTotalTicks: durationTicks,
        pendingStunDuration
    };
    let actions = 0;
    const noop = () => {};
    const engine = {
        battleTime: 0,
        selectedWeapons: [hunter],
        selectedMonster: { id: 'test_monster', nameKO: '훈련용' },
        monsterState: 'normal',
        monsterHp: 1000,
        monsterAtb: 0,
        monsterSpeed: 0,
        monsterKnockdownDuration: 0,
        monsterStunDuration: 0,
        monsterRoarDuration: 0,
        cartCount: 0,
        currentConsecutiveIndex: 0,
        consecutiveTotal: 1,
        hunterSpeedMultiplier: 1,
        callbacks: {},
        getRemainingSeconds: () => 999,
        updateTimerUI: noop,
        addLog: noop,
        triggerHunterCart: noop,
        updateHpUI: noop,
        updateMonsterAtbUI: noop,
        updateMonsterStateUI: noop,
        triggerEncounterRoar: noop,
        restoreBorder: noop,
        playSFX: noop,
        shakeWeapon: noop,
        updateOverheatUI: noop,
        getMonsterSpeedForState: () => 0,
        triggerMonsterRoarFlinch: noop,
        shakeMonster: noop,
        updateWeaponAtbUI: noop,
        executeValstraxChargeSuccess: noop,
        prepareMonsterTurn: noop,
        executeHunterTurn: () => { actions++; }
    };
    return { engine, hunter, actions: () => actions };
}

{
    const { engine, hunter, actions } = recoveryEngine(15);
    for (let tick = 0; tick < 14; tick++) context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.hitDuration, 1);
    assert.ok(hunter.atb > 90 && hunter.atb < 100, 'ATB must fill linearly during the fall');
    assert.strictEqual(actions(), 0, 'the hunter cannot act before getting back up');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.hitDuration, 0);
    assert.strictEqual(hunter.atb, 100);
    assert.strictEqual(actions(), 1, 'an action may begin on the exact full-recovery tick');
}

{
    const { engine, hunter, actions } = recoveryEngine(15, 50);
    for (let tick = 0; tick < 15; tick++) context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.status, 'stunned', 'stun must begin only after the hunter stands up');
    assert.strictEqual(hunter.stunDuration, 50);
    assert.strictEqual(hunter.atb, 0, 'stun owns the ATB reset after hit recovery');
    assert.strictEqual(actions(), 0);
}

const turnSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'),
    'utf8'
);
assert.match(turnSource, /isHunterHitRecovering\(target\)[\s\S]*?result: 'invulnerable'[\s\S]*?return;/,
    'repeat hits must silently pass through a recovering hunter before damage/status resolution');

console.log('[test] Hunter weak/strong hit recovery and state priority passed.');
