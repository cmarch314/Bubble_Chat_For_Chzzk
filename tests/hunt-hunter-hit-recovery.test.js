'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const HuntCombatAnimator = require('../js/effects/hunt/HuntCombatAnimator.js');
const HuntMonsterAttackAnimator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');

assert.strictEqual(HuntMonsterAttackAnimator.previewReactionForAttackResult('hit'), 'hit');
for (const result of ['guard', 'perfect-guard', 'counter']) {
    assert.strictEqual(HuntMonsterAttackAnimator.previewReactionForAttackResult(result), 'guard');
}
for (const result of ['invulnerable', 'pending', 'dodge', 'miss', 'resist', 'effect', undefined]) {
    assert.strictEqual(HuntMonsterAttackAnimator.previewReactionForAttackResult(result), null,
        `${String(result)} must never be presented as a hunter hit`);
}
{
    const presented = [];
    const engine = {
        callbacks: {
            onTriggerHitAnimation: (...args) => presented.push(['hit', ...args]),
            onTriggerGuardShake: (...args) => presented.push(['guard', ...args]),
            onTriggerRollAnimation: (...args) => presented.push(['dodge', ...args])
        },
        presentHunterImpact: HuntEngine.prototype.presentHunterImpact
    };
    assert.strictEqual(engine.presentHunterImpact(1, 'invulnerable'), false);
    assert.strictEqual(engine.presentHunterImpact(1, 'pending'), false);
    assert.deepStrictEqual(presented, [], 'uncommitted/non-hit outcomes must not reach presentation');
    assert.strictEqual(engine.presentHunterImpact(1, 'hit', { reaction: { kind: 'strong' } }), true);
    assert.strictEqual(engine.presentHunterImpact(2, 'guard'), true);
    assert.strictEqual(engine.presentHunterImpact(2, 'tackle'), true);
    assert.strictEqual(engine.presentHunterImpact(3, 'dodge'), true);
    assert.deepStrictEqual(presented.map(entry => entry[0]), ['hit', 'guard', 'guard', 'dodge']);
    assert.strictEqual(presented[2][2], 'tackle',
        'damage-reducing tackle contact must be visibly distinct from a shield guard');
}
{
    const weaponCard = { dataset: { hunterHitReactionActive: 'true' } };
    const animator = Object.create(HuntCombatAnimator.prototype);
    animator.owner = {
        card: { querySelector: () => weaponCard },
        animationTimers: { timeout() {} }
    };
    animator.triggerHunterInterference = () => {
        throw new Error('an active tumble must return before restarting presentation');
    };
    assert.doesNotThrow(() => animator.triggerHitAnimation(0, {
        hp: 50,
        hitDuration: 12
    }, { kind: 'strong' }));
}
{
    const weaponCard = {
        dataset: {
            hunterHitReactionActive: 'true',
            hunterHitReactionGeneration: '4'
        },
        classList: { remove() {}, add() {} },
        querySelector: () => null,
        querySelectorAll: () => [],
        offsetWidth: 0
    };
    const animator = Object.create(HuntCombatAnimator.prototype);
    animator.owner = {
        card: { querySelector: () => weaponCard },
        animationTimers: { timeout() {} }
    };
    animator.weaponAnimationGenerations = new Map();
    animator.activeWeaponAnimations = new Map();
    animator.triggerHunterInterference = () => {};
    animator.interruptWeaponVisual = () => {};
    animator.cancelHitAnimation = () => {};
    assert.doesNotThrow(() => animator.triggerHitAnimation(0, {
        hp: 50,
        hitDuration: 50
    }, { kind: 'strong', generation: 5 }));
    assert.strictEqual(weaponCard.dataset.hunterHitReactionGeneration, '5',
        'a new combo judgment must replace a stale visual lock even when its old timer is late');
}

const rightDownKnockback = HuntCombatAnimator.knockbackVectorFromRects(
    { left: 100, top: 100, width: 100, height: 100 },
    { left: 300, top: 300, width: 100, height: 100 },
    -1
);
assert.ok(rightDownKnockback.x > 0 && rightDownKnockback.y > 0,
    'a hunter below-right of the monster must tumble down and right');
assert.ok(Math.abs(Math.hypot(rightDownKnockback.x, rightDownKnockback.y) - 1) < 0.0001,
    'measured knockback must be a normalized two-dimensional collision vector');
const leftDownKnockback = HuntCombatAnimator.knockbackVectorFromRects(
    { left: 400, top: 100, width: 100, height: 100 },
    { left: 100, top: 260, width: 100, height: 100 },
    1
);
assert.ok(leftDownKnockback.x < 0 && leftDownKnockback.y > 0,
    'a hunter below-left of the monster must tumble down and left');

{
    const frames = HuntCombatAnimator.strongHitKeyframes({ x: 240, y: 170, direction: -1 });
    const tumbleEndOffset = 1100 / 5000;
    assert.deepStrictEqual(frames.map(frame => frame.offset), [
        0, tumbleEndOffset * .25, tumbleEndOffset * .5, tumbleEndOffset * .75,
        tumbleEndOffset, .88, .90, .93, .96, .98, 1
    ], 'a strong hit must finish its tumble in 1.1 seconds and keep the final 0.6s walk home');
    assert.match(frames[4].transform, /translate\(240px, 170px\) rotate\(-540deg\) skewX\(-12deg\)/,
        'the knockback must finish one and a half turns in a visibly prone pose');
    assert.strictEqual(frames[5].transform, frames[4].transform,
        'the fallen pose and position must remain unchanged until the shortened return');
    assert.strictEqual((1 - frames[5].offset) * 5000, 600,
        'the authored walk-home segment must last exactly 0.6 seconds');
    assert.match(frames[10].transform, /translate\(0, 0\) rotate\(-720deg\)/,
        'recovery must preserve the equivalent final rotation instead of rewinding to zero');
}

for (const kind of ['roar', 'tremor', 'wind']) {
    const hunter = {
        index: 0, status: 'alive', atb: 75,
        counterInvulnerabilityTicks: 10
    };
    let interrupted = 0;
    const engine = {
        applyHunterInterference: HuntEngine.prototype.applyHunterInterference,
        callbacks: { onTriggerHunterInterference: () => { interrupted++; } }
    };
    assert.strictEqual(engine.applyHunterInterference(hunter, kind, 'large'), false);
    assert.strictEqual(hunter.atb, 75);
    assert.strictEqual(hunter.interference, undefined);
    assert.strictEqual(interrupted, 0,
        `counter protection must block delayed ${kind} before runtime or visual state changes`);
}

for (const pattern of [
    { type: 'roar', tags: ['roar'], name: '포효[대]' },
    { type: 'tremor', tags: ['tremor'], name: '지진[대]' },
    { type: 'wind', tags: ['wind'], name: '풍압[소]' },
    { type: 'physical', tags: ['interference'], name: '행동 방해' },
    { type: 'physical', tags: [], name: '분노 포효' },
    { type: 'physical', tags: [], name: '착지 지진' },
    { type: 'physical', tags: [], name: '이륙 풍압' }
]) {
    assert.strictEqual(
        HuntMonsterTurnExecutor.canInflictHunterStun(pattern),
        false,
        `${pattern.name} must not contribute hunter stun`
    );
}

for (const kind of ['roar', 'tremor', 'wind']) {
    const target = {
        status: 'alive',
        interference: { kind, size: 'large' }
    };
    assert.strictEqual(HuntMonsterTurnExecutor.isHunterDefenseLocked(target), true,
        `${kind} reaction must remain vulnerable without allowing a fresh defense roll`);
    assert.deepStrictEqual(
        HuntMonsterTurnExecutor.planHunterResponseIntent({}, target, { type: 'physical', tags: [] }),
        { attempted: false, preferred: 'none' },
        `${kind} reaction must not plan a guard or evade before an incoming hit`
    );
}
assert.strictEqual(
    HuntMonsterTurnExecutor.canInflictHunterStun({ type: 'physical', tags: ['target-contact'], name: '머리 들이받기' }),
    true,
    'an ordinary physical impact must retain its hunter-stun chance'
);

assert.deepStrictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({ tags: ['weak'] }, { index: 0 }),
    { kind: 'weak', durationTicks: 15, knockbackDirection: -1 }
);
assert.deepStrictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({ tags: ['butt-stumble'] }, { index: 3 }),
    { kind: 'weak', durationTicks: 15, knockbackDirection: 1 },
    'legacy butt-stumble tags must normalize to the canonical small-hit reaction'
);
assert.deepStrictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({}, { index: 3 }),
    { kind: 'strong', durationTicks: 50, knockbackDirection: 1 },
    'untagged attacks must conservatively use the strong reaction'
);
assert.strictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({ attackDirection: 'left' }, { index: 3 }).knockbackDirection,
    1,
    'an authored incoming direction must throw the weapon in the opposite direction'
);
assert.strictEqual(
    HuntMonsterTurnExecutor.hitReactionForPattern({
        runtimeImpactHitReactionKind: 'strong', runtimeImpactHitRecoveryTicks: 1
    }, { index: 3 }).durationTicks,
    50,
    'monster-authored timing must not override hunter-owned recovery duration'
);
assert.strictEqual(HuntMonsterTurnExecutor.isHunterHitRecovering({ hitDuration: 1 }), true);
assert.strictEqual(
    HuntMonsterTurnExecutor.hunterImpactImmunityReason({ rollDuration: 3 }),
    'evade',
    'an already visible roll must own the remaining multi-hit immunity window'
);
{
    const hunter = {};
    assert.strictEqual(HuntMonsterTurnExecutor.grantCounterInvulnerability(hunter), 10);
    assert.strictEqual(HuntMonsterTurnExecutor.isHunterImpactImmune(hunter), true,
        'a successful counter must ignore every follow-up judgment for one second');
    assert.strictEqual(hunter.counterInvulnerabilityStartedThisTick, true);
}
{
    const protectedIai = {
        id: 'long_sword', status: 'alive', spiritGauge: 50,
        counterInvulnerabilityTicks: 10,
        currentAction: { phase: 'active', tags: ['counter', 'iai'] }
    };
    assert.strictEqual(HuntMonsterTurnExecutor.hunterImpactImmunityReason(protectedIai), 'counter');
    assert.strictEqual(HuntMonsterTurnExecutor.hunterImpactImmunityReason(protectedIai, {
        resolveCounterAttempt: true
    }), null, 'a new counter attempt must resolve before protection from an earlier success');
}
for (const fixture of [
    { id: 'heavy_bowgun', tags: ['counter', 'hbg-wyverncounter'], fields: { hbgCounterWaiting: true } },
    { id: 'switch_axe', tags: ['counter', 'switch-axe-sword-counter'], fields: { switchCounterWaiting: true } },
    { id: 'hammer', tags: ['counter', 'hammer-offset'], fields: { hammerOffsetWaiting: true } },
    { id: 'sword_shield', tags: ['counter', 'perfect-guard'], fields: { snsPerfectGuardReady: true } }
]) {
    const hunter = {
        index: 0, name: fixture.id, id: fixture.id, status: 'alive',
        counterInvulnerabilityTicks: 10,
        currentAction: { phase: 'active', tags: fixture.tags },
        ...fixture.fields
    };
    const engine = {
        random: () => .99,
        monsterHp: 1000,
        monsterStunAccum: 0,
        actionStateMachine: {
            cancel(target, state) {
                target.currentAction = null;
                target.actionState = state;
            }
        },
        addLog() {}, showSkillBubble() {}, shakeWeapon() {},
        updateMonsterHpUI() {}, presentHunterImpact() {}
    };
    const result = HuntMonsterTurnExecutor.resolveHunterCounter(engine, hunter, 40, {
        defendRoll: .99, actionAllowsEvade: false, isStunned: false
    });
    assert.strictEqual(result.counterAttempted, true, `${fixture.id} must register its active counter window`);
    assert.strictEqual(result.counterSucceeded, false, `${fixture.id} must preserve a failed counter result`);
    assert.strictEqual(result.handled, true, `${fixture.id} failure must not fall through to guard or evade`);
    assert.strictEqual(result.damage, 40, `${fixture.id} failure must retain the incoming damage`);
    assert.strictEqual(hunter.counterInvulnerabilityTicks, 0,
        `${fixture.id} failure must clear prior counter protection`);
}
assert.strictEqual(
    HuntMonsterTurnExecutor.isHunterHitRecovering({ status: 'stunned', hitDuration: 15 }),
    false,
    'stun must remain vulnerable even when an overlapping tumble timer is present'
);
assert.strictEqual(
    HuntMonsterTurnExecutor.isHunterImpactImmune({
        status: 'alive', hitDuration: 15,
        interference: { kind: 'roar', size: 'large' }, roarStunned: true
    }),
    true,
    'an active damaging recovery must remain invulnerable even if stale interference flags overlap it'
);
for (const kind of ['roar', 'tremor', 'wind']) {
    const hunter = {
        index: 0, id: 'hammer', name: 'Tester', status: 'alive', atb: 85,
        hitDuration: 12, hitRecoveryTotalTicks: 12
    };
    const visuals = [];
    const engine = {
        applyHunterInterference: HuntEngine.prototype.applyHunterInterference,
        callbacks: { onTriggerHunterInterference: (...args) => visuals.push(args) }
    };
    assert.strictEqual(engine.applyHunterInterference(hunter, kind, 'large'), false,
        `${kind} must not cover an active tumble with a misleading vulnerable-reaction badge`);
    assert.strictEqual(hunter.interference, undefined);
    assert.strictEqual(visuals.length, 0);
}
assert.deepStrictEqual(
    HuntMonsterTurnExecutor.resolveImpactEventTargetIndices({
        selectedWeapons: [
            { index: 0, status: 'stunned', hitDuration: 15 },
            { index: 1, status: 'alive', hitDuration: 15 }
        ],
        perkRuntime: null,
        random: () => 0
    }, { targetMode: 'random-live' }, []),
    [0],
    'a delayed hazard must retain a stunned hunter as a valid vulnerable target'
);
assert.deepStrictEqual(
    HuntMonsterTurnExecutor.resolveImpactEventTargetIndices({
        selectedWeapons: [
            { index: 0, status: 'alive', hitDuration: 15 },
            { index: 1, status: 'alive', hitDuration: 15 }
        ],
        perkRuntime: null,
        random: () => 0
    }, { targetMode: 'random-live' }, []),
    [0],
    'hit recovery must not remove a hunter from targeting or alter the attack path'
);

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
    let cancelledHitAnimations = 0;
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
        callbacks: { onCancelHitAnimation: () => { cancelledHitAnimations++; } },
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
    return { engine, hunter, actions: () => actions, cancelledHitAnimations: () => cancelledHitAnimations };
}

{
    const { engine, hunter, actions, cancelledHitAnimations } = recoveryEngine(15);
    for (let tick = 0; tick < 14; tick++) context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.hitDuration, 1);
    assert.ok(hunter.atb > 90 && hunter.atb < 100, 'ATB must fill linearly during the fall');
    assert.strictEqual(actions(), 0, 'the hunter cannot act before getting back up');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.hitDuration, 0);
    assert.strictEqual(hunter.atb, 100);
    assert.strictEqual(actions(), 1, 'an action may begin on the exact full-recovery tick');
    assert.strictEqual(cancelledHitAnimations(), 1,
        'runtime recovery completion must clear its visual lock without waiting for a DOM timer');
}

{
    const { engine, hunter } = recoveryEngine(0);
    hunter.counterInvulnerabilityTicks = 10;
    hunter.counterInvulnerabilityStartedThisTick = true;
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.counterInvulnerabilityTicks, 10,
        'the counter success tick must not consume its first protection tick');
    for (let tick = 0; tick < 10; tick++) context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.counterInvulnerabilityTicks, 0,
        'counter protection must expire after exactly one second at 10 ticks per second');
}

{
    const { engine, hunter, actions } = recoveryEngine(15);
    hunter.hitStartedThisTick = true;
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.hitDuration, 15,
        'the impact commit tick must not consume the first recovery tick');
    assert.strictEqual(hunter.hitStartedThisTick, false);
    assert.strictEqual(actions(), 0);
    for (let tick = 0; tick < 14; tick++) context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.hitDuration, 1,
        'a boundary-timed second hit must still see the hunter as invulnerable before visual return');
    context.HuntBattleTickExecutor.execute(engine);
    assert.strictEqual(hunter.hitDuration, 0);
    assert.strictEqual(actions(), 1,
        'the hunter may act only after the complete authored recovery window');
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
assert.match(turnSource,
    /hunterImpactImmunityReason\(target[\s\S]*?isHunterHitRecovering\(target\)[\s\S]*?return 'hit-recovery'/,
    'repeat hits must retain one typed recovery-immunity owner');
assert.match(turnSource,
    /const immunityReason = HuntMonsterTurnExecutor\.hunterImpactImmunityReason\(target, \{[\s\S]*?resolveCounterAttempt: true[\s\S]*?immunityReason === 'counter'[\s\S]*?presentHunterImpact\?\.\(target\.index, 'counter'\)[\s\S]*?result: immunityReason === 'evade'/,
    'the shared impact gate must classify recovery, roll, and visibly explained counter protection');
assert.match(turnSource,
    /if \(isGreatSwordTackling\)[\s\S]*?grantCounterInvulnerability\(target\)/,
    'a successful Great Sword tackle must open the shared one-second counter protection window');
assert.doesNotMatch(turnSource,
    /isPerfectGuard = true;[\s\S]{0,180}counterProtected = true/,
    'perfect guard and ordinary guards must not receive counter invulnerability');
assert.match(turnSource,
    /clearHunterInterference\?\.\(target, 'hit'\)[\s\S]*?actionMachine\.cancel\(target, 'hitstun'\)[\s\S]*?target\.hitDuration = hitReaction\.durationTicks[\s\S]*?target\.hitStartedThisTick = true/,
    'ordinary damaging hits must replace roar, tremor, and wind reactions before knockback');
assert.doesNotMatch(turnSource,
    /callbacks(?:\?\.)?\.onTrigger(?:HitAnimation|GuardShake|RollAnimation)/,
    'monster turn resolution must publish hunter reactions only through HuntEngine.presentHunterImpact');
assert.match(turnSource,
    /presentHunterImpact\?\.\(target\.index, 'hit', \{ reaction: hitReaction \}\)/,
    'committed ordinary hits must cross the single engine presentation boundary');
const valstraxSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js'),
    'utf8'
);
assert.match(valstraxSource,
    /clearHunterInterference\?\.\(target, 'hit'\)[\s\S]*?target\.hitDuration = hitReaction\.durationTicks[\s\S]*?target\.hitStartedThisTick = true/,
    'Valstrax direct impacts must obey the same interference-to-hit priority');
assert.doesNotMatch(valstraxSource,
    /callbacks(?:\?\.)?\.onTrigger(?:HitAnimation|GuardShake|RollAnimation)|engine\.triggerHitAnimation/,
    'special monster executors must not bypass the engine impact presenter');
const combatAnimatorSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'),
    'utf8'
);
const monsterAttackAnimatorSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'),
    'utf8'
);
assert.doesNotMatch(monsterAttackAnimatorSource, /element-impact-shake|monster-uppercut-launched/,
    'monster motion rendering must not own hunter hit reaction classes');
assert.match(monsterAttackAnimatorSource,
    /runtimePreviewCardReactions[\s\S]*?schedulePreviewImpactCardReactions/,
    'simulated hunter reactions must remain explicitly preview-only');
assert.match(combatAnimatorSource,
    /restoreBorder\(wIndex, w\)[\s\S]*?Number\(w\.hitDuration \|\| 0\) > 0\) return/,
    'resource and buff cleanup must not erase a live hunter hit reaction');
assert.match(combatAnimatorSource,
    /triggerHitAnimation\(idx, w, reaction = \{\}\)[\s\S]*?layer\.animate\(keyframes,[\s\S]*?this\.activeWeaponAnimations\.set\(layer, animation\)/,
    'live hunter hit reactions must own the weapon transform through WAAPI instead of competing CSS');
assert.match(combatAnimatorSource,
    /const hitLayers = hunterAnchor && typeof hunterAnchor\.animate === 'function'[\s\S]*?\[hunterAnchor\] : \[\.\.\.weaponLayers\]/,
    'live hit tumble must animate the stable wrapper so HUD child updates cannot erase rotation');
assert.match(combatAnimatorSource,
    /triggerHitAnimation\(idx, w, reaction = \{\}\)[\s\S]*?classList\.remove\('hunter-interference-active', 'roar-stunned'\)[\s\S]*?hunter-interference-overlay/,
    'a damaging hit must synchronously remove tremor, wind, and roar CSS before starting knockback');
assert.match(combatAnimatorSource,
    /hunterHitReactionActive === 'true'[\s\S]*?Number\(w\.hitDuration \|\| 0\) > 0\) return/,
    'duplicate visual callbacks must not restart an active hunter tumble');
assert.match(combatAnimatorSource,
    /cancelHitAnimation\(idx\)[\s\S]*?this\.cancelWeaponAnimation\(layer\)/,
    'hit recovery cleanup must cancel the owned WAAPI reaction before restoring the home pose');
assert.match(combatAnimatorSource,
    /profile\.durationMs = Math\.min\(actionDurationMs, profile\.durationMs\)/,
    'BEAT action occupancy must not stretch an approved weapon motion into slow motion');
assert.match(combatAnimatorSource,
    /beatVisualTickMs = profile\.durationMs \/ Math\.max\(1, Number\(actionOrName\.durationTicks\)\)/,
    'compressed weapon motion must keep authored hit moments synchronized to its visible timeline');
const combatPresenterSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntCombatPresenter.js'),
    'utf8'
);
assert.match(combatPresenterSource,
    /hunters\.find\(candidate => Number\(candidate\?\.index\) === Number\(index\)\)/,
    'live callbacks must resolve stable hunter indexes instead of assuming array order');

console.log('[test] Hunter weak/strong hit recovery and state priority passed.');
