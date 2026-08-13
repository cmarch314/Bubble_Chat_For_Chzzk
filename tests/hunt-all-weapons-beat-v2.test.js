'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
const HuntHunterBeatCatalog = require('../js/effects/hunt/HuntHunterBeatCatalog.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');

let compiledCount = 0;
for (const weaponId of HuntHunterBeatCatalog.WEAPON_IDS) {
    const actions = HuntWeaponMechanics.actionsFor(weaponId);
    assert.ok(actions?.length > 0, `${weaponId} must expose canonical actions`);
    for (const action of actions) {
        const graph = HuntHunterBeatCatalog.compile(weaponId, action);
        assert.ok(graph, `${action.id} must compile to BEAT V2`);
        assert.strictEqual(graph.actor, 'hunter');
        assert.strictEqual(graph.backend, 'beat-v2');
        assert.strictEqual(graph.totalTicks, action.durationTicks,
            `${action.id} must preserve authored occupancy`);
        const damageEvents = graph.events.filter(event => event.kind === 'damage');
        const expectedHits = action.tags?.includes('preparation') || Number(action.dmg || 0) <= 0
            ? 0
            : Math.max(1, Array.isArray(action.hits) ? action.hits.length : 1);
        assert.strictEqual(damageEvents.length, expectedHits,
            `${action.id} must author every hit exactly once`);
        damageEvents.forEach((event, index) => {
            assert.ok(event.atTicks >= 0 && event.atTicks < graph.totalTicks,
                `${action.id} hit ${index + 1} must stay inside its graph`);
            if (index > 0) assert.ok(event.atTicks >= damageEvents[index - 1].atTicks,
                `${action.id} multi-hit events must remain ordered`);
        });
        compiledCount++;
    }
}

assert.ok(compiledCount > 100, 'the complete fourteen-weapon action set must be migrated');
const animatorSource = fs.readFileSync(
    path.resolve(__dirname, '../js/effects/hunt/HuntCombatAnimator.js'),
    'utf8'
);
assert.match(animatorSource, /compiledBeat\?\.events\?\.filter\(event => event\.kind === 'damage'\)/,
    'combat visuals must consume every BEAT damage event instead of a legacy single impact delay');
assert.match(animatorSource, /authoredWeights[\s\S]*?assignedDamage[\s\S]*?visualHits\.forEach/,
    'multi-hit damage feedback must retain the authored per-hit proportions');
console.log(`[test] ${compiledCount} actions across all 14 weapons compile to BEAT V2.`);
