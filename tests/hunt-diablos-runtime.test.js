const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntMonsterAnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');

const enter = profiles.diablos.find(pattern => pattern.id === 'diablos.burrow_enter');
assert.deepStrictEqual(
    enter.secondaryInterference,
    { kind: 'wind', size: 'small', scope: 'all' },
    'entering the ground must throw a visible small wind-pressure pulse before Diablos vanishes'
);
assert.strictEqual(
    HuntMonsterTurnExecutor.monsterAttackAccuracy({ accuracy: 0, hitChance: 0 }),
    1,
    'installed monster attacks must use guaranteed contact before hunter defense'
);
for (const idSuffix of ['.horn_charge', '.rage_charge']) {
    const pattern = profiles.diablos.find(candidate => candidate.id.endsWith(idSuffix));
    assert.deepStrictEqual([pattern.minTargets, pattern.maxTargets], [1, 2],
        `${pattern.id} must stay within the one-to-two hunter lane`);
    assert.strictEqual(pattern.chargeLaunchStyle, 'stomp-burst',
        `${pattern.id} must hold during the stomp telegraph and launch without creeping`);
}
assert.strictEqual(HuntAtbConfig.monsterActionCostGauge(enter), 45);
assert.strictEqual(HuntAtbConfig.interferenceCostGauge('small'), 50);
assert.strictEqual(HuntAtbConfig.interferenceCostGauge('large'), 100);
assert.strictEqual(
    profiles.diablos.find(pattern => pattern.id.endsWith('.horn_charge')).movement.ticks,
    Math.round(HuntMonsterAnimationCatalog.resolve(
        profiles.diablos.find(pattern => pattern.id.endsWith('.horn_charge')),
        '',
        'charge',
        { id: 'diablos', species: 'Flying Wyvern' }
    ).duration / 100),
    'normal horn charge traversal lock must cover its complete visual route'
);
assert.deepStrictEqual(
    HuntMonsterActionPolicy.movement(
        profiles.diablos.find(pattern => pattern.id.endsWith('.horn_charge'))
    ),
    { kind: 'diablos.horn_charge', ticks: 42, untargetable: true }
);
assert.deepStrictEqual(
    HuntMonsterActionPolicy.movement(
        profiles.diablos.find(pattern => pattern.id.endsWith('.rage_charge'))
    ),
    { kind: 'diablos-return-charge', ticks: 133, untargetable: true },
    'the enraged double-charge lock must include the two-second off-screen pause'
);
{
    const rageCharge = profiles.diablos.find(pattern => pattern.id.endsWith('.rage_charge'));
    const timeline = HuntMonsterActionPolicy.impactTimeline({
        ...rageCharge,
        runtimeChargePasses: [[0], [1]]
    }, 'enraged');
    assert.strictEqual(timeline.length, 2,
        'Diablos enraged consecutive charge is exactly one outbound and one return pass');
    assert.deepStrictEqual(timeline.map(event => event.atTicks), [47, 103],
        'each charge hit must resolve at its visible hunter-crossing point');
    assert.deepStrictEqual(timeline.map(event => event.targetIndices), [[0], [1]]);
    assert.strictEqual(rageCharge.impact.completePathOnTargetLoss, true,
        'a carted or absent return target must not stop the off-screen route');
}
{
    const uppercut = profiles.diablos.find(pattern => pattern.id.endsWith('.horn_uppercut'));
    assert.strictEqual(HuntMonsterTurnExecutor.requiresDelayedImpact(uppercut), true);
    assert.strictEqual(HuntMonsterTurnExecutor.impactDelayTicks(uppercut), 16,
        'the uppercut defense roll must wait for the 57% collision frame');

    const hunter = {
        index: 1,
        name: 'Target',
        hunterName: 'Target',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        cartRecoveryTicks: 0,
        jumpInvulnerableTicks: 0
    };
    const animationCalls = [];
    const engine = {
        selectedMonster: { id: 'diablos', nameKO: 'Diablos' },
        selectedWeapons: [hunter],
        monsterTier: 'large',
        monsterState: 'normal',
        monsterPartState: [],
        perkRuntime: null,
        random: () => 0,
        callbacks: {
            onTriggerMonsterAttack: (...args) => animationCalls.push(args)
        },
        playSFX() {},
        beginMonsterTraversal(kind, ticks) {
            this.monsterTraversalState = { kind, remainingTicks: ticks };
        },
        showSkillBubble() {},
        getMonsterAttackType: () => ({ type: 'physical', emoji: 'impact' })
    };
    HuntMonsterTurnExecutor.execute(engine, uppercut);
    assert.strictEqual(hunter.hp, 100,
        'starting the approach must not deal damage or resolve the hunter response');
    assert.strictEqual(engine.pendingMonsterImpact.targetIndex, 1);
    assert.strictEqual(engine.pendingMonsterImpact.remainingTicks, 16);
    assert.strictEqual(engine.pendingMonsterImpact.pattern.runtimeImpactCommit, true);
    assert.deepStrictEqual(
        engine.pendingMonsterImpact.pattern.runtimeDefenseIntents[1],
        { attempted: true, preferred: 'evade' },
        'the telegraph must lock a response intent while leaving success for the impact roll'
    );
    assert.strictEqual(animationCalls.length, 1);
    assert.strictEqual(animationCalls[0][2][0].result, 'pending');
    assert.strictEqual(animationCalls[0][4].runtimeImpactPending, true);
}
{
    const tailCross = profiles.diablos.find(pattern => pattern.id.endsWith('.tail_sweep'));
    assert.strictEqual(tailCross.name, '후방 X자 꼬리치기');
    assert.strictEqual(tailCross.requiresPreviousPattern, 'diablos.horn_charge');
    assert.strictEqual(tailCross.animationProfile, 'diablos-tail-cross');
    assert.deepStrictEqual(HuntMonsterActionPolicy.impactTimeline(tailCross).map(event => event.atTicks), [14, 24]);
    const selector = new HuntMonsterPatternSelector(() => 0);
    assert.strictEqual(selector.select({ id: 'diablos' }, [tailCross], { state: 'normal' }), null,
        'the rear X sweep must not appear as an unrelated standalone attack');
    selector.lastPatternByMonster.set('diablos', 'diablos.horn_charge');
    assert.strictEqual(selector.select({ id: 'diablos' }, [tailCross], { state: 'normal' }).id, tailCross.id,
        'the rear X sweep becomes eligible immediately after the normal charge');
    const blackTail = profiles.black_diablos.find(pattern => pattern.id.endsWith('.tail_sweep'));
    assert.strictEqual(blackTail.name, '후방 X자 꼬리치기');
}
assert.ok(profiles.black_diablos.every(pattern => pattern.id.startsWith('black_diablos.')));
{
    const tailRock = profiles.diablos.find(pattern => pattern.id.endsWith('.tail_slam_rock'));
    assert.ok(tailRock, 'the verified Rise/Sunbreak tail-slam rock follow-up must be installed');
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.impactTimeline(tailRock).map(event => ({
            atTicks: event.atTicks,
            targetMode: event.targetMode,
            damageScale: event.damageScale,
            audioCue: event.audioCue
        })),
        [
            { atTicks: 16, targetMode: 'sequential', damageScale: 1, audioCue: null },
            { atTicks: 27, targetMode: 'sequential', damageScale: 1.114, audioCue: 'rock' }
        ],
        'the tail contact and launched rock must resolve as two visible, sequential impacts'
    );
    assert.strictEqual(tailRock.delivery, 'projectile');
    assert.strictEqual(tailRock.projectileVisual, 'rock',
        'Diablos must route its physical rock through the dedicated rock visual instead of the elemental orb renderer');
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.movement(tailRock),
        { kind: 'diablos.tail_slam_rock', ticks: 34, untargetable: false }
    );
    assert.strictEqual(
        HuntMonsterAnimationCatalog.resolve(tailRock, '', tailRock.type, { id: 'diablos' }).id,
        'tail-slam-rock'
    );
    const sideTackle = profiles.diablos.find(pattern => pattern.id.endsWith('.side_tackle'));
    assert.strictEqual(sideTackle.name, '철산고');
    assert.deepStrictEqual(sideTackle.targetDamageRatios, [0.30, 0.15]);
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.movement(sideTackle),
        { kind: 'diablos.side_tackle', ticks: 30, untargetable: false }
    );
    assert.ok(profiles.diablos.some(pattern => pattern.id.endsWith('.bite')),
        'the low-threat bite must remain in the kit instead of every turn becoming a spectacle');
}
{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.adjacentLaneTargets([hunters[0], hunters[2], hunters[3]], 2, () => 0)
            .map(target => target.index),
        [0],
        'a two-hunter charge must not jump across an empty, non-adjacent card slot'
    );
    const [first, second] = HuntMonsterActionPolicy.returnAdjacentPasses(hunters, 2, () => 0);
    assert.notStrictEqual(first[0].index, second[0].index,
        'the return charge must lock a new primary hunter after leaving the screen');
    assert.strictEqual(Math.abs(first[0].index - second[0].index), 1,
        'the two return-charge victims must occupy adjacent card slots');
    assert.strictEqual(first.length + second.length, 2);
    const [soloFirst, soloSecond] = HuntMonsterActionPolicy.returnAdjacentPasses(hunters, 1, () => 0);
    assert.strictEqual(soloFirst[0].index, soloSecond[0].index,
        'a one-hunter return charge must not expand onto another card');
}
{
    const pattern = {
        ...profiles.diablos.find(candidate => candidate.id.endsWith('.rage_charge')),
        runtimeChargePassSizes: [1, 1]
    };
    const partState = [];
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction(partState, pattern, [
        { result: 'hit' }, { result: 'dodge' }
    ]), true, 'only the return pass must miss for Diablos to become stuck');
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction(partState, {
        ...pattern,
        runtimeImpactTimelineEvent: true,
        runtimeImpactTimelineFinal: false
    }, [{ result: 'dodge' }]), false,
    'a missed outbound pass must not trigger the return-pass terrain collision early');
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction(partState, {
        ...pattern,
        runtimeImpactTimelineEvent: true,
        runtimeImpactTimelineFinal: true
    }, [{ result: 'dodge' }]), true,
    'the final off-screen return pass owns the terrain-stuck reaction');
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction(partState, pattern, [
        { result: 'dodge' }, { result: 'hit' }
    ]), false);
    partState.push(
        { kind: 'left-horn', broken: true },
        { kind: 'right-horn', broken: true }
    );
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction(partState, pattern, [
        { result: 'hit' }, { result: 'dodge' }
    ]), false, 'two broken horns must disable the terrain-stuck opening');
}
{
    const traversal = {
        callbacks: { onResetMonsterMotion() {} },
        monsterActionLockTicks: 0,
        monsterTraversalGeneration: 0,
        monsterTraversalState: null
    };
    traversal.beginMonsterTraversal = HuntEngine.prototype.beginMonsterTraversal;
    traversal.clearMonsterTraversal = HuntEngine.prototype.clearMonsterTraversal;
    traversal.interruptMonsterMovement = HuntEngine.prototype.interruptMonsterMovement;
    traversal.beginMonsterTraversal('diablos-return-charge', 57, { untargetable: true });
    assert.strictEqual(traversal.monsterActionLockTicks, 57);
    assert.strictEqual(traversal.monsterTraversalState.untargetable, true);
    traversal.pendingMonsterAction = { pattern: { id: 'diablos.rage_charge' } };
    traversal.pendingMonsterImpact = { pattern: { id: 'diablos.horn_uppercut' } };
    traversal.monsterBurrowState = { phase: 'underground' };
    let burrowCancelled = false;
    traversal.callbacks.onTriggerMonsterBurrowPhase = phase => { burrowCancelled = phase === 'cancel'; };
    traversal.interruptMonsterMovement('knockdown');
    assert.strictEqual(traversal.monsterTraversalState, null);
    assert.strictEqual(traversal.monsterActionLockTicks, 0);
    assert.strictEqual(traversal.pendingMonsterAction, null);
    assert.strictEqual(traversal.pendingMonsterImpact, null);
    assert.strictEqual(traversal.monsterBurrowState, null);
    assert.strictEqual(burrowCancelled, true);
}
{
    const hunter = {
        index: 0, id: 'hammer', type: 'melee', status: 'alive',
        hp: 100, maxHp: 100, atb: 100, personality: 'balanced',
        hammerChargeLevel: 0, shockTraps: 0, flashPods: 0, potions: 0,
        powders: 0, sharpnessProfile: null, perks: []
    };
    const engine = {
        monsterHp: 1000,
        monsterState: 'normal',
        monsterAtb: 0,
        monsterFlightState: 'grounded',
        selectedMonster: { id: 'diablos' },
        random: () => 0.99,
        perkRuntime: null,
        blightRuntime: null,
        weaponMechanics: null,
        actionStateMachine: { cancel() {} },
        isMonsterTrapImmune: () => false,
        isMonsterTargetable: () => false,
        COMBO_LIST: { hammer: [] },
        updateWeaponAtbUI() {},
        updateSharpnessUI() {},
        updateHunterItemUI() {},
        spawnEmojiBubble() {},
        shakeWeapon() {},
        addLog() { throw new Error('waiting for an unavailable monster must stay silent'); }
    };
    HuntHunterTurnExecutor.execute(engine, hunter);
    assert.strictEqual(hunter.atb, 100,
        'an uncommitted hunter must wait at full ATB instead of attacking the stale home position');
}
assert.ok(profiles.black_diablos.find(pattern => pattern.id.endsWith('.horn_charge')).monsterAtbCost
    < profiles.diablos.find(pattern => pattern.id.endsWith('.horn_charge')).monsterAtbCost,
'Black Diablos must keep a separately faster ATB kit');

{
    const phases = [];
    const engine = {
        selectedMonster: { id: 'diablos', nameKO: '디아블로스' },
        selectedWeapons: [
            { index: 2, status: 'alive', cartRecoveryTicks: 0, jumpInvulnerableTicks: 0 },
            { index: 3, status: 'alive', cartRecoveryTicks: 0, jumpInvulnerableTicks: 0 }
        ],
        monsterBurrowState: { phase: 'underground', sourcePattern: enter },
        monsterState: 'normal',
        monsterAtb: 100,
        monsterTier: 'large',
        MONSTER_PATTERNS: { diablos: profiles.diablos },
        random: () => 0,
        updateMonsterAtbUI() {},
        callbacks: { onTriggerMonsterBurrowPhase: (...args) => phases.push(args) },
        showSkillBubble() {},
        addLog() {}
    };
    assert.strictEqual(HuntMonsterTurnExecutor.prepare(engine), true);
    assert.strictEqual(engine.pendingMonsterAction.pattern.id, 'diablos.burrow_emerge');
    assert.strictEqual(engine.pendingMonsterAction.targetIndex, 2);
    assert.strictEqual(engine.monsterAtb, 25, 'emergence spends 75% ATB rather than resetting through recoveryTicks');
    assert.deepStrictEqual(phases[0], ['telegraph', 2, 1200]);

    engine.selectedWeapons[0].status = 'dead';
    engine.selectedWeapons[0].cartRecoveryTicks = 300;
    assert.strictEqual(HuntMonsterTurnExecutor.refreshPreparedTarget(engine), true);
    assert.strictEqual(engine.pendingMonsterAction.targetIndex, 3,
        'a burrow target that carts during windup must be replaced by an available hunter');
    assert.deepStrictEqual(phases.at(-1), ['telegraph', 3, 1200],
        'retargeting must preserve the remaining warning time at the new hunter');

    engine.selectedWeapons[1].jumpInvulnerableTicks = 50;
    assert.strictEqual(HuntMonsterTurnExecutor.refreshPreparedTarget(engine), false);
    assert.strictEqual(engine.pendingMonsterAction, null);
    assert.strictEqual(engine.monsterBurrowState, null,
        'Diablos must return home instead of remaining underground when every hunter is unavailable');
    assert.deepStrictEqual(phases.at(-1), ['cancel', null, 0]);
}

{
    const phases = [];
    const engine = {
        selectedMonster: { id: 'diablos', nameKO: '디아블로스' },
        selectedWeapons: [{ index: 0, status: 'dead', cartRecoveryTicks: 300 }],
        monsterBurrowState: { phase: 'underground', sourcePattern: enter },
        monsterState: 'normal',
        monsterAtb: 100,
        monsterTier: 'large',
        MONSTER_PATTERNS: { diablos: profiles.diablos },
        random: () => 0,
        updateMonsterAtbUI() {},
        callbacks: { onTriggerMonsterBurrowPhase: (...args) => phases.push(args) },
        showSkillBubble() {},
        addLog() {}
    };
    assert.strictEqual(HuntMonsterTurnExecutor.prepare(engine), false);
    assert.strictEqual(engine.monsterBurrowState, null,
        'a burrowed monster with no valid hunter must surface at home immediately');
    assert.deepStrictEqual(phases, [['cancel', null, 0]]);
}

{
    const phases = [];
    const engine = {
        selectedMonster: { id: 'diablos', nameKO: '디아블로스' },
        selectedWeapons: [{ index: 0, status: 'alive', cartRecoveryTicks: 0, jumpInvulnerableTicks: 0 }],
        monsterBurrowState: null,
        monsterState: 'normal',
        monsterTier: 'large',
        random: () => 0,
        callbacks: { onTriggerMonsterBurrowPhase: (...args) => phases.push(args) },
        showSkillBubble() {},
        addLog() {}
    };
    HuntMonsterTurnExecutor.execute(engine, enter);
    assert.strictEqual(engine.monsterBurrowState.phase, 'underground');
    assert.deepStrictEqual(phases[0], ['enter', null, 1250]);
}

function interferenceHarness({ atb = 100, random = 0.99, shield = false, resisted = false } = {}) {
    const calls = { cancelled: 0, reset: 0, visuals: [] };
    const hunter = {
        index: 0, id: shield ? 'lance' : 'hammer', type: shield ? 'shield' : 'melee',
        name: 'Tester', status: 'alive', atb, personality: 'balanced', perkModifiers: {}
    };
    const engine = {
        random: () => random,
        perkRuntime: {
            ignoresPattern: () => resisted ? '내진' : null,
            roarDuration: () => 1
        },
        actionStateMachine: {
            canGuard: () => true,
            cancel: () => { calls.cancelled++; }
        },
        weaponMechanics: { onHit: () => { calls.reset++; } },
        callbacks: {
            onInterruptWeaponVisual() {},
            onTriggerHunterInterference: (...args) => calls.visuals.push(args),
            onTriggerGuardShake() {}
        },
        updateWeaponAtbUI() {},
        addLog() {},
        showSkillBubble() {},
        playSFX() {}
    };
    engine.applyHunterInterference = HuntEngine.prototype.applyHunterInterference;
    engine.clearHunterInterference = HuntEngine.prototype.clearHunterInterference;
    engine.interruptHunterItemAction = HuntEngine.prototype.interruptHunterItemAction;
    return { engine, hunter, calls };
}

{
    const { engine, hunter, calls } = interferenceHarness({ atb: 85 });
    assert.strictEqual(engine.applyHunterInterference(hunter, 'tremor', 'large'), true);
    assert.strictEqual(hunter.atb, 0);
    assert.deepStrictEqual(hunter.interference, { kind: 'tremor', size: 'large' });
    assert.strictEqual(calls.cancelled, 1);
    assert.strictEqual(calls.reset, 1, 'interference must cancel and reset the active combo');
    hunter.atb = 100;
    assert.strictEqual(engine.clearHunterInterference(hunter), true);
    assert.strictEqual(hunter.interference, null);
}

for (const [kind, size] of [['roar', 'large'], ['tremor', 'large'], ['wind', 'small']]) {
    const { engine, hunter, calls } = interferenceHarness({ atb: 85 });
    assert.strictEqual(engine.applyHunterInterference(hunter, kind, size), true);
    assert.strictEqual(engine.clearHunterInterference(hunter, 'hit'), true);
    assert.strictEqual(hunter.interference, null,
        `${kind} reaction must yield immediately to a damaging hit`);
    assert.strictEqual(hunter.roarStunned, false);
    assert.deepStrictEqual(calls.visuals.at(-1), [hunter.index, kind, size, false],
        `${kind} overlay must be removed before hit knockback starts`);
}

{
    const { engine, hunter, calls } = interferenceHarness();
    hunter.roarStunned = true;
    hunter.roarStunDuration = 12;
    assert.strictEqual(engine.clearHunterInterference(hunter, 'hit'), true,
        'legacy roar-only state must also yield to hit recovery');
    assert.strictEqual(hunter.roarStunned, false);
    assert.deepStrictEqual(calls.visuals.at(-1), [hunter.index, 'roar', 'large', false]);
}

{
    const { engine, hunter } = interferenceHarness({ atb: 85 });
    hunter.pendingSharpnessRestore = true;
    hunter.itemDuration = 20;
    assert.strictEqual(engine.applyHunterInterference(hunter, 'wind', 'small'), true);
    assert.strictEqual(hunter.atb, 35);
    assert.strictEqual(hunter.pendingSharpnessRestore, false, 'wind pressure must interrupt sharpening');
    assert.strictEqual(hunter.itemDuration, 0, 'interference must clear the remaining sharpening lock');
}

{
    const { engine, hunter } = interferenceHarness({ atb: 85, shield: true, random: 0 });
    assert.strictEqual(engine.applyHunterInterference(hunter, 'tremor', 'large'), false);
    assert.strictEqual(hunter.atb, 85, 'a successful guard blocks both the pose and ATB loss');
    assert.strictEqual(hunter.interference, undefined);
}

console.log('[test] Diablos two-stage burrow, ATB costs, and interference contract passed.');
