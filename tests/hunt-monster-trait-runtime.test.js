'use strict';

const assert = require('assert');
const HuntMonsterTraitRuntime = require('../js/effects/hunt/HuntMonsterTraitRuntime.js');
const HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');
const HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
global.HUNT_REVIEWED_MONSTER_ANATOMY = require('../js/effects/hunt/data/ReviewedMonsterAnatomy.js');
const HuntMonsterAnatomyCatalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');

function engineFor(id, overrides = {}) {
    const engine = {
        selectedMonster: { id, nameKO: id },
        monsterBehavior: HuntMonsterArchetypeCatalog.behavior({ id }),
        monsterFlightState: 'grounded',
        monsterState: 'normal',
        monsterPartState: [],
        monsterAtb: 100,
        monsterActionLockTicks: 0,
        monsterHp: 1000,
        selectedWeapons: [{ index: 0, status: 'alive', hp: 100, maxHp: 100 }],
        callbacks: {},
        updateMonsterAtbUI() {},
        triggerEnvironmentEffect() {},
        ...overrides
    };
    const runtime = new HuntMonsterTraitRuntime(() => 0);
    runtime.initialize(engine);
    engine.monsterTraitRuntime = runtime;
    return engine;
}

{
    const engine = engineFor('nargacuga');
    assert.strictEqual(engine.monsterTraitRuntime.canTriggerTrap(engine, 'pitfall'), false);
    assert.strictEqual(engine.monsterTraitRuntime.canTriggerTrap(engine, 'shock'), true);
    engine.monsterState = 'enraged';
    assert.strictEqual(engine.monsterTraitRuntime.canTriggerTrap(engine, 'pitfall'), true);
    assert.ok(engine.monsterTraitRuntime.context(engine).includes('rage-eyes'));
}

{
    const anatomy = HuntMonsterAnatomyCatalog.find({ id: 'gold_rathian' });
    const parts = HuntMonsterAnatomyCatalog.createPartState(anatomy);
    const head = parts.find(part => part.kind === 'head');
    assert.strictEqual(head.hitzones.slash, .22);
    head.health = 1;
    const result = HuntMonsterAnatomyCatalog.applyPartDamage(
        [head],
        { id: 'great_sword' },
        100,
        1,
        () => 0
    );
    assert.strictEqual(result.newlyBroken, true);
    assert.strictEqual(head.hitzones.slash, .60);
}

{
    let reaction = null;
    const engine = engineFor('barioth', {
        monsterPartState: [{ kind: 'left-front-leg', broken: true }],
        callbacks: { onTriggerMonsterTraitReaction: kind => { reaction = kind; } }
    });
    engine.monsterTraitRuntime.afterAction(engine, { tags: ['charge', 'slip-eligible'] });
    assert.strictEqual(engine.monsterAtb, 50,
        'a broken-limb stumble must settle at half ATB instead of subtracting from action debt');
    assert.ok(engine.monsterActionLockTicks >= 24);
    assert.strictEqual(reaction, 'limb-slip');

    engine.monsterAtb = 100;
    engine.monsterActionLockTicks = 0;
    reaction = null;
    engine.monsterTraitRuntime.afterAction(engine, { tags: ['charge'] });
    assert.strictEqual(engine.monsterAtb, 100,
        'a generic charge must not slip unless its authored motion uses the broken foreleg spike');
    assert.strictEqual(reaction, null);
}

{
    const engine = engineFor('legiana', { monsterState: 'enraged' });
    const decorated = engine.monsterTraitRuntime.decorateAction(engine, {
        id: 'legiana.bite', type: 'physical', tags: ['physical']
    });
    assert.strictEqual(decorated.runtimeTraitFx, 'ice-coat');
    assert.strictEqual(decorated.attachedFx.className, 'legiana-rage-ice-release',
        'an enraged non-ice attack must retain a restrained ice-coat glint');
    const claw = engine.monsterTraitRuntime.decorateAction(engine, {
        id: 'legiana.hop_claw', type: 'physical', tags: ['physical', 'claw'],
        originPart: 'claw', animationDurationMs: 1500
    });
    assert.strictEqual(claw.attachedFx.className, 'legiana-rage-claw-ice');
    assert.strictEqual(claw.attachedFx.durationMs, 1080);
    const tail = engine.monsterTraitRuntime.decorateAction(engine, {
        id: 'legiana.tail_spin', type: 'area', tags: ['area', 'tail'],
        originPart: 'tail', animationDurationMs: 2200
    });
    assert.strictEqual(tail.attachedFx.className, 'legiana-rage-tail-ice');
    assert.strictEqual(tail.attachedFx.durationMs, 1584);
    assert.strictEqual(engine.monsterTraitRuntime.decorateAction(engine, {
        id: 'legiana.aerial_cold_sweep', type: 'area', tags: ['ice', 'elemental'],
        delivery: 'gas'
    }).attachedFx, undefined,
    'authored ice attacks must not stack a second body burst over their own cold effect');
    assert.strictEqual(engine.monsterTraitRuntime.decorateAction(engine, {
        id: 'legiana.roar', type: 'roar', tags: ['roar']
    }).attachedFx, undefined, 'roars must not masquerade as ice attacks');
}

{
    let explosion = null;
    const effects = [];
    const sfx = [];
    const scheduled = [];
    const engine = engineFor('bazelgeuse', {
        executeMonsterTurn(pattern, attackerIndex, targetIndex) {
            explosion = { pattern, attackerIndex, targetIndex };
        },
        triggerEnvironmentEffect(kind, targetIndex) {
            effects.push([kind, targetIndex]);
        },
        schedule(callback, delay) { scheduled.push({ callback, delay }); },
        playSFX(...args) { sfx.push(args); }
    });
    assert.strictEqual(engine.monsterTraitRuntime.dropScaleAtSlot(engine, 0, 'head'), true);
    assert.strictEqual(engine.monsterTraitRuntime.dropScaleAtSlot(engine, 0, 'tail'), false,
        'one hunter foot slot may hold only one scale');
    assert.strictEqual(engine.monsterTraitState.pendingHazards.length, 1);
    for (let tick = 0; tick < 270; tick++) engine.monsterTraitRuntime.tick(engine);
    assert.strictEqual(engine.monsterTraitState.pendingHazards[0].phase, 'heated');
    assert.ok(effects.some(([kind]) => kind === 'blast-scale-heat'));
    for (let tick = 0; tick < 30; tick++) engine.monsterTraitRuntime.tick(engine);
    assert.ok(explosion);
    assert.strictEqual(explosion.pattern.id, 'trait.delayed_blast_scale');
    assert.strictEqual(explosion.targetIndex, 0);
    assert.strictEqual(explosion.pattern.damageRatio, .30);
    assert.ok(explosion.pattern.tags.includes('elemental'));
    assert.ok(explosion.pattern.tags.includes('fire'));
    assert.notStrictEqual(explosion.pattern.runtimeImpactSuppressStatus, true,
        'blast-scale explosions must be allowed to inflict fireblight on an unguarded hit');
    assert.ok(explosion.pattern.tags.includes('butt-stumble'));
    assert.ok(!explosion.pattern.tags.includes('hazard-hp-only'),
        'blast-scale damage must enter the normal hit-reaction path');
    assert.strictEqual(engine.monsterTraitState.pendingHazards.length, 0);
    assert.strictEqual(sfx.length, 0,
        'blast-scale audio must not play on the explosion animation start frame');
    assert.deepStrictEqual(scheduled.map(entry => entry.delay), [1000],
        'blast-scale audio must wait one second after the visible blast begins');
    scheduled.forEach(entry => entry.callback());
    assert.deepStrictEqual(
        sfx.map(args => [args[0], args[2]?.monsterId, args[2]?.patternType]),
        [['monster_blast_scale_explosion', 'bazelgeuse', 'blast_scale_explosion']],
        'one due explosion batch must play the audition-confirmed blast-scale cue exactly once'
    );
}

{
    const effects = [];
    const engine = engineFor('bazelgeuse', {
        selectedWeapons: Array.from({ length: 4 }, (_, index) => ({
            index, status: 'alive', hp: 100, maxHp: 100
        })),
        triggerEnvironmentEffect(kind, targetIndex) {
            effects.push([kind, targetIndex]);
        }
    });
    const charge = {
        tags: ['charge', 'blast-scale-source'],
        scaleDropsByPart: { head: 1, tail: 2 },
        scaleSlotMode: 'target-adjacent'
    };
    assert.strictEqual(
        engine.monsterTraitRuntime.onImpactEvent(
            engine,
            charge,
            { targetIndices: [1] },
            false
        ),
        false,
        'a multi-event action must not shed its scales before the actual final impact'
    );
    assert.strictEqual(
        engine.monsterTraitRuntime.onImpactEvent(
            engine,
            charge,
            { targetIndices: [1] },
            true
        ),
        true,
        'the actual impact event must create Bazelgeuse scales in combat slots'
    );
    assert.deepStrictEqual(
        engine.monsterTraitState.pendingHazards.map(hazard => hazard.slotIndex),
        [1, 0, 2]
    );
    assert.strictEqual(
        effects.filter(([kind]) => kind === 'blast-scale-place').length,
        3,
        'each stored scale must emit a real renderer event'
    );
}

{
    const engine = engineFor('bazelgeuse', {
        selectedWeapons: [
            { index: 0, status: 'alive', hp: 100, maxHp: 100 },
            { index: 1, status: 'alive', hp: 100, maxHp: 100 }
        ]
    });
    engine.monsterState = 'enraged';
    engine.monsterTraitRuntime.dropScaleAtSlot(engine, 0, 'head');
    assert.strictEqual(engine.monsterTraitState.pendingHazards[0].phase, 'heated');
    assert.strictEqual(engine.monsterTraitState.pendingHazards[0].remainingTicks, 30);
    engine.monsterState = 'normal';
    engine.monsterTraitRuntime.dropScaleAtSlot(engine, 1, 'tail');
    engine.monsterTraitRuntime.heatAllScales(engine);
    assert.ok(engine.monsterTraitState.pendingHazards.every(hazard => hazard.phase === 'heated'));
}

{
    const palettes = [];
    const base = engineFor('bazelgeuse', {
        selectedWeapons: Array.from({ length: 4 }, (_, index) => ({
            index, status: 'alive', hp: 100, maxHp: 100
        })),
        triggerEnvironmentEffect(kind, targetIndex, details) {
            if (kind === 'blast-scale-place') palettes.push(details?.visualPalette);
        }
    });
    [0, 1, 2, 3].forEach(slot => base.monsterTraitRuntime.dropScaleAtSlot(base, slot));
    assert.ok(base.monsterTraitRuntime.context(base).includes('scale-critical-red'),
        'base Bazelgeuse critical blast scales must glow red');
    assert.ok(!base.monsterTraitRuntime.context(base).includes('scale-critical-purple'));
    assert.deepStrictEqual(palettes, ['red', 'red', 'red', 'red']);

    const seething = engineFor('seething_bazelgeuse', {
        selectedWeapons: Array.from({ length: 4 }, (_, index) => ({
            index, status: 'alive', hp: 100, maxHp: 100
        }))
    });
    seething.monsterState = 'enraged';
    [0, 1, 2, 3].forEach(slot =>
        seething.monsterTraitRuntime.dropScaleAtSlot(seething, slot));
    const seethingVisuals = seething.monsterTraitRuntime.context(seething);
    assert.ok(seethingVisuals.includes('scale-heated-purple'));
    assert.ok(seethingVisuals.includes('scale-critical-purple'),
        'purple blast-scale glow must remain exclusive to Seething Bazelgeuse');
    assert.ok(!seethingVisuals.includes('scale-critical-red'));
}

{
    const engine = engineFor('bazelgeuse', {
        selectedWeapons: Array.from({ length: 4 }, (_, index) => ({
            index, status: 'alive', hp: 100, maxHp: 100
        }))
    });
    engine.monsterPartState = [
        { kind: 'head', broken: true },
        { kind: 'tail', severed: true }
    ];
    engine.monsterTraitRuntime.dropScalesForAction(engine, {
        scaleDropsByPart: { body: 3, head: 1, tail: 1 },
        scaleSlotMode: 'target-adjacent'
    }, [{ index: 0 }]);
    assert.deepStrictEqual(
        engine.monsterTraitState.pendingHazards.map(hazard => [hazard.slotIndex, hazard.sourcePart]),
        [[0, 'body'], [1, 'body'], [2, 'body']],
        'base drops must remain after head break and tail sever'
    );
    engine.monsterTraitState.pendingHazards = [];
    engine.monsterPartState = [];
    engine.monsterTraitRuntime.dropScalesForAction(engine, {
        scaleDropsByPart: { body: 3, head: 1, tail: 1 },
        scaleSlotMode: 'target-adjacent'
    }, [{ index: 0 }]);
    assert.strictEqual(engine.monsterTraitState.pendingHazards.length, 4,
        'a five-scale body press must fill all four combat slots without exceeding the battlefield cap');
}

{
    const effects = [];
    const engine = engineFor('bazelgeuse', {
        selectedWeapons: Array.from({ length: 4 }, (_, index) => ({
            index, status: 'alive', hp: 100, maxHp: 100
        })),
        triggerEnvironmentEffect(kind, targetIndex) {
            effects.push([kind, targetIndex]);
        }
    });
    engine.monsterPartState = [{ kind: 'head', broken: true }];
    assert.strictEqual(engine.monsterTraitRuntime.dropScaleAtSlot(engine, 0, 'head'), false,
        'a broken source part must stop dropping scales');
    engine.monsterPartState = [];
    engine.monsterState = 'exhausted';
    assert.strictEqual(engine.monsterTraitRuntime.dropScaleAtSlot(engine, 0, 'tail'), false,
        'an exhausted Bazelgeuse must stop dropping new scales');
    engine.monsterState = 'normal';
    engine.monsterTraitRuntime.dropScaleAtSlot(engine, 0, 'head');
    engine.monsterTraitRuntime.dropScaleAtSlot(engine, 2, 'tail');
    engine.monsterTraitRuntime.onRoar(engine);
    assert.ok(engine.monsterTraitState.pendingHazards.every(hazard => hazard.phase === 'heated'),
        'roars must heat every existing scale without coupling it to rage state');
    assert.strictEqual(effects.filter(([kind]) => kind === 'blast-scale-heat').length, 2);
}

{
    let landed = false;
    const engine = engineFor('bazelgeuse', {
        monsterFlightRuntime: {
            land(target) {
                landed = true;
                target.monsterFlightState = 'grounded';
            }
        },
        clearMonsterTraversal() {}
    });
    engine.monsterTraitRuntime.beforeAction(engine, {
        tags: ['high-flight-sequence'],
        activeTicks: 120
    });
    assert.strictEqual(engine.monsterFlightState, 'airborne');
    assert.strictEqual(engine.monsterTraitRuntime.cancelAtomicFlight(engine), true);
    assert.strictEqual(landed, true);
    assert.strictEqual(engine.monsterTraitState.atomicFlightActive, false);
}

{
    const effects = [];
    const engine = engineFor('bazelgeuse', {
        selectedWeapons: [
            { index: 0, status: 'alive', hp: 100, maxHp: 100 },
            { index: 1, status: 'alive', hp: 100, maxHp: 100 }
        ],
        triggerEnvironmentEffect(kind, targetIndex) {
            effects.push([kind, targetIndex]);
        }
    });
    engine.monsterTraitRuntime.dropScaleAtSlot(engine, 0, 'head');
    for (let tick = 0; tick < 14; tick++) engine.monsterTraitRuntime.tick(engine);
    engine.monsterTraitRuntime.dropScaleAtSlot(engine, 1, 'tail');
    assert.strictEqual(engine.monsterTraitRuntime.cancelInFlightScales(engine), 1);
    assert.deepStrictEqual(
        engine.monsterTraitState.pendingHazards.map(hazard => hazard.slotIndex),
        [0],
        'flash must preserve an already-landed independent scale while removing a scale still in flight'
    );
    assert.ok(effects.some(([kind, slot]) => kind === 'blast-scale-cancel' && slot === 1));
}

{
    const selector = new HuntMonsterPatternSelector(() => 0);
    const patterns = [
        { id: 'air-sac', tags: [], weight: 1, requiredTraits: ['inflated'] },
        { id: 'ground', tags: [], weight: 1 }
    ];
    assert.strictEqual(selector.select({ id: 'test-a' }, patterns, { traits: [] }).id, 'ground');
    assert.strictEqual(selector.select({ id: 'test-b' }, patterns, { traits: ['inflated'] }).id, 'air-sac');
}

console.log('hunt-monster-trait-runtime.test.js passed');
