'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
global.HuntBeatV2Contract = require('../js/effects/hunt/HuntBeatV2Contract.js').HuntBeatV2Contract;
const HuntHunterBeatCatalog = require('../js/effects/hunt/HuntHunterBeatCatalog.js');
const HuntBeatActionRuntime = require('../js/effects/hunt/HuntBeatActionRuntime.js');
const HuntWeaponMechanics = require('../js/effects/hunt/HuntWeaponMechanics.js');
const runtimeCss = fs.readFileSync(path.resolve(__dirname, '../styles/hunt-runtime.css'), 'utf8');

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
assert.strictEqual(chargedFrames[0][3], 135,
    'slot 1 charge must begin grip upper-right and blade tip lower-left');
assert.ok(chargedFrames[3][3] >= 270,
    'charged slashes must carry the upward-facing edge downward onto contact');
const trueFrames = WeaponAnimationCatalog.MOTIONS.great_sword_true_release;
assert.strictEqual(trueFrames[3][3], 270,
    'the first True Charged Slash swing must plant downward rather than uppercut');
assert.strictEqual(trueFrames[7][3], 630,
    'the rebound must continue the same rotation for the second downward hit');
assert.ok(trueFrames[2][6] < -90 && trueFrames[6][6] < -90,
    'both True Charged Slash hits must approach from above their contact point');
assert.match(runtimeCss,
    /\.weapon-great_sword:not\(\.weapon-charge-stage-0\)[\s\S]*?rotate\(calc\(225deg \* var\(--weapon-facing\)\)\)[\s\S]*?scaleX\(var\(--great-sword-mirror, 1\)\)/,
    'the persistent charge pose and BEAT release must share the corrected 12 o’clock blade stance');

console.log('[test] Great Sword BEAT V2 compilation and runtime passed');
