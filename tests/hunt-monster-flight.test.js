'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterFlightRuntime = require('../js/effects/hunt/HuntMonsterFlightRuntime.js');
const HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');

assert.strictEqual(HuntMonsterFlightRuntime.isCapable({ id: 'rathalos' }), true);
assert.strictEqual(HuntMonsterFlightRuntime.isCapable({ id: 'diablos' }), false);
const aerial = HuntMonsterFlightRuntime.decoratePattern('rathalos', {
    id: 'rathalos.claw_dive', name: '독조 급강하', type: 'charge', tags: ['charge'], sourceActionClass: 'cVerticalKickFly'
});
assert.ok(aerial.tags.includes('flight-only'));
assert.match(aerial.flightEvidence, /cVerticalKickFly/);
const ground = { id: 'rathalos.tail', name: '꼬리치기', type: 'physical', tags: ['physical'] };
const selector = new HuntMonsterPatternSelector(() => 0);
assert.strictEqual(selector.select({ id: 'rathalos' }, [aerial, ground], { state: 'normal', hpRatio: 1, flightState: 'grounded' }).id, ground.id,
    'grounded monsters must not select flight-only actions');
selector.cooldowns.clear();
assert.strictEqual(selector.select({ id: 'rathalos' }, [aerial, ground], { state: 'normal', hpRatio: 1, flightState: 'airborne' }).id, aerial.id,
    'airborne monsters must prefer their evidenced aerial kit');

const events = [];
const engine = {
    selectedMonster: { id: 'rathalos', nameKO: '리오레우스' }, monsterState: 'enraged', monsterMaxHp: 12000,
    addLog: text => events.push(text), showSkillBubble: () => {}, updateMonsterFlightUI: value => events.push(`flight:${value}`),
    updateMonsterAtbUI: () => {}, updateMonsterStateUI: state => events.push(state), shakeMonster: () => {},
    monsterAtb: 100, pendingMonsterAction: { pattern: aerial }, monsterKnockdownDuration: 0
};
const runtime = new HuntMonsterFlightRuntime(() => 0);
runtime.initialize(engine);
runtime.beforeTurn(engine, [aerial, ground]);
runtime.beforeTurn(engine, [aerial, ground]);
assert.strictEqual(engine.monsterFlightState, 'airborne');
assert.strictEqual(engine.monsterFlightTicksRemaining, 600, 'a flight phase must last 60 seconds at the 10 Hz combat tick');
runtime.afterAction(engine, aerial);
assert.strictEqual(engine.monsterFlightState, 'airborne', 'aerial actions must not randomly end the one-minute flight phase');
assert.strictEqual(new HuntMonsterFlightRuntime(() => .49).shouldEvade(engine), true, 'airborne monsters must evade below the 50% roll');
assert.strictEqual(new HuntMonsterFlightRuntime(() => .5).shouldEvade(engine), false, 'the 50% boundary must allow the hunter hit');
assert.strictEqual(runtime.onHunterDamage(engine, { type: 'ranged' }, 1000), true);
assert.strictEqual(engine.monsterFlightState, 'grounded');
assert.strictEqual(engine.monsterState, 'knocked_down');
assert.strictEqual(engine.monsterKnockdownDuration, 105, 'aerial knockdowns must last 1.5x the normal 70-tick knockdown');
assert.strictEqual(engine.pendingMonsterAction, null);
assert.ok(events.includes('격추 대경직'));

const timedEngine = { ...engine, monsterFlightState: 'airborne', monsterFlightTicksRemaining: 1, monsterFlightDamage: 0 };
runtime.tick(timedEngine);
assert.strictEqual(timedEngine.monsterFlightState, 'grounded', 'natural landing must occur when the 60-second timer expires');

const hunterTurnSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
const huntEffectSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/HuntEffect.js'), 'utf8');
const valstraxSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntValstraxExecutor.js'), 'utf8');
const monsterAnimatorSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
assert.match(monsterAnimatorSource, /isUltimate && !isValstraxAmbush/,
    'the real Valstrax landing must skip the generic red-square ultimate spectacle');
const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const cssSource = fs.readFileSync(path.resolve(__dirname, '../style.css'), 'utf8');
assert.match(rendererSource, /hunt-flight-knockdown-gauge/, 'airborne knockdown damage needs a visible progress gauge');
assert.match(cssSource, /translateY\(-235px\)[\s\S]*?translateY\(-275px\)/, 'the airborne stage must hover near the monster HP bar');
assert.ok(
    hunterTurnSource.indexOf('monsterFlightRuntime?.shouldEvade') < hunterTurnSource.indexOf('monsterHp = Math.max'),
    'airborne evasion must resolve before monster HP damage is applied'
);
assert.doesNotMatch(huntEffectSource, /director\.trigger\(['"]valstrax['"]\)/,
    'Valstrax ambush must never enter the global visual queue');
assert.match(huntEffectSource, /renderer\.triggerValstraxAmbushWarning\(\)/,
    'the ambush warning must use a hunt-owned visual layer');
assert.match(valstraxSource, /onTriggerMonsterAttack\('physical',[\s\S]*?붉은 혜성 강습[\s\S]*?type:\s*'ultimate'/,
    'Crimson Comet Ambush must be a physical whole-party ultimate, not an elemental laser');

console.log('[test] Evidence-gated monster flight and aerial knockdown passed.');
