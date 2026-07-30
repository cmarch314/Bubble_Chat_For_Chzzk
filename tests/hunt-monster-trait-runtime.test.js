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
    engine.monsterTraitRuntime.afterAction(engine, { tags: ['charge'] });
    assert.strictEqual(engine.monsterAtb, 0);
    assert.ok(engine.monsterActionLockTicks >= 24);
    assert.strictEqual(reaction, 'limb-slip');
}

{
    let explosion = null;
    const engine = engineFor('bazelgeuse', {
        executeMonsterTurn(pattern, attackerIndex, targetIndex) {
            explosion = { pattern, attackerIndex, targetIndex };
        }
    });
    engine.monsterTraitRuntime.afterAction(engine, { tags: ['scale', 'blast'] });
    assert.strictEqual(engine.monsterTraitState.pendingHazards.length, 2);
    for (let tick = 0; tick < 23; tick++) engine.monsterTraitRuntime.tick(engine);
    assert.ok(explosion);
    assert.strictEqual(explosion.pattern.id, 'trait.delayed_blast_scale');
    assert.strictEqual(explosion.targetIndex, 0);
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
