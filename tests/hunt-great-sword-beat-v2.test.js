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
assert.strictEqual(actions.length, 15, 'the Side Blow-free Great Sword action kit must be BEAT-compilable');
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

const wideSlash = HuntHunterBeatCatalog.compile('great_sword',
    actions.find(action => action.id === 'great_sword.wide_slash'));
assert.deepStrictEqual(wideSlash.beats.map(beat => beat.id),
    ['draw-side', 'horizontal-sweep', 'recovery'],
    'Wide Slash must own a dedicated lateral-cut timeline');
assert.strictEqual(wideSlash.events.find(event => event.kind === 'damage').atTicks, 5,
    'Wide Slash contact must land during the lateral sweep, not during its preparation');

const kick = HuntHunterBeatCatalog.compile('great_sword',
    actions.find(action => action.id === 'great_sword.kick'));
assert.deepStrictEqual(kick.beats.map(beat => beat.id), ['brace', 'kick', 'recovery']);
assert.strictEqual(kick.events.find(event => event.kind === 'damage').atTicks, 2,
    'the foot emoji and Kick damage must share one authored impact tick');

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
const trueChargeProfile = WeaponAnimationCatalog.resolve('great_sword',
    actions.find(action => action.id === 'great_sword.true_charged_slash'));
assert.strictEqual(trueChargeProfile.durationMs, trueCharge.totalTicks * 100,
    'the True Charged Slash visual clock must cover the same 21 ticks as its BEAT graph');
const chargedFrames = WeaponAnimationCatalog.MOTIONS.great_sword_charged_release;
assert.strictEqual(chargedFrames[0][3], 135,
    'slot 1 charge must begin grip upper-right and blade tip lower-left');
assert.ok(chargedFrames[3][3] >= 270,
    'charged slashes must carry the upward-facing edge downward onto contact');
const trueFrames = WeaponAnimationCatalog.MOTIONS.great_sword_true_release;
assert.strictEqual(trueFrames[4][3], 495,
    'the first True Charged Slash contact must follow one complete forward turn');
assert.strictEqual(trueFrames[8][3], 855,
    'the rebound must complete the next full turn into the heavy hit');
assert.deepStrictEqual([trueFrames[4][0], trueFrames[8][0]],
    trueChargeHits.map(event => event.atTicks / trueCharge.totalTicks),
    'both visible blade contacts must share the exact BEAT damage timestamps');
assert.ok(trueFrames[2][6] < -90 && trueFrames[7][6] < -90,
    'both True Charged Slash hits must approach from above their contact point');
assert.ok(trueFrames.slice(0, 4).every(frame => frame[1] < 1 && frame[2] < 1),
    'the first turn must stay in front of the monster until its actual contact frame');
assert.match(runtimeCss,
    /\.weapon-great_sword:not\(\.weapon-charge-stage-0\)[\s\S]*?rotate\(calc\(225deg \* var\(--weapon-facing\)\)\)[\s\S]*?scaleX\(var\(--great-sword-mirror, 1\)\)/,
    'the persistent charge pose and BEAT release must share the corrected 12 o’clock blade stance');

console.log('[test] Great Sword BEAT V2 compilation and runtime passed');
