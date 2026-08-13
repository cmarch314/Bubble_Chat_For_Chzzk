'use strict';

const assert = require('assert');
global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
const HuntHunterBeatCatalog = require('../js/effects/hunt/HuntHunterBeatCatalog.js');
const HuntBeatActionRuntime = require('../js/effects/hunt/HuntBeatActionRuntime.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');

const actions = HuntWeaponMechanics.actionsFor('great_sword');
assert.strictEqual(actions.length, 16, 'the complete Great Sword action kit must be BEAT-compilable');
for (const action of actions) {
    const compiled = HuntHunterBeatCatalog.compile('great_sword', action);
    assert.strictEqual(compiled.actor, 'hunter');
    assert.strictEqual(compiled.backend, 'beat-v2');
    assert.strictEqual(compiled.totalTicks, action.durationTicks,
        `${action.id} must preserve its authored action occupancy`);
    const damageEvents = compiled.events.filter(event => event.kind === 'damage');
    const expectedHits = action.tags?.includes('preparation')
        ? 0
        : Math.max(1, Array.isArray(action.hits) ? action.hits.length : 1);
    assert.strictEqual(damageEvents.length, expectedHits,
        `${action.id} must author each impact unless it is preparation`);
}

const trueCharge = HuntHunterBeatCatalog.compile('great_sword',
    actions.find(action => action.id === 'great_sword.true_charged_slash'));
const trueChargeHits = trueCharge.events.filter(event => event.kind === 'damage');
assert.ok(trueChargeHits[0].atTicks / trueCharge.totalTicks < .5,
    'the first True Charged Slash hit must land when the blade plants in the ground');
assert.ok(trueChargeHits[1].atTicks / trueCharge.totalTicks >= .75,
    'the heavy hit must land only after the planted-blade rebound completes');
assert.deepStrictEqual(trueCharge.beats.map(beat => beat.id),
    ['first-swing', 'blade-plant', 'rebound-swing', 'recovery']);
const emitted = [];
const runtime = new HuntBeatActionRuntime({ onEvent: (_state, event) => emitted.push(event.id) });
runtime.begin('hunter:0', trueCharge);
for (let tick = 0; tick < trueCharge.totalTicks; tick++) runtime.tick('hunter:0');
assert.deepStrictEqual(emitted, [
    'great_sword.true_charged_slash:hit:1',
    'great_sword.true_charged_slash:plant-audio',
    'great_sword.true_charged_slash:hit:2'
], 'the true charged slash must emit its first hit, planted-blade cue, and rebound hit in order');

const charge = HuntHunterBeatCatalog.compile('great_sword',
    actions.find(action => action.id === 'great_sword.charge_1'));
runtime.begin('hunter:0', charge);
assert.strictEqual(runtime.cancel('hunter:0', 'cart'), true);
assert.strictEqual(runtime.has('hunter:0'), false, 'cart/hit interruption must remove the active Great Sword graph');

const WeaponAnimationCatalog = require('../js/effects/hunt/HuntWeaponAnimationCatalog.js');
const chargedFrames = WeaponAnimationCatalog.MOTIONS.great_sword_charged_release;
assert.ok(chargedFrames[2][6] < -100 && chargedFrames[3][6] === 0,
    'charged slashes must approach above the target and descend onto contact');
const trueFrames = WeaponAnimationCatalog.MOTIONS.great_sword_true_release;
assert.strictEqual(trueFrames.at(-1)[3] - trueFrames[0][3], -720,
    'True Charged Slash must preserve exactly two blade-leading turns before contact');
assert.ok(trueFrames[2][6] < -100 && trueFrames[6][6] < -100,
    'both True Charged Slash hits must begin above their contact point');

console.log('[test] Great Sword BEAT V2 compilation and runtime passed');
