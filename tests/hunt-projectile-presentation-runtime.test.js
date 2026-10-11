'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Runtime = require('../js/effects/hunt/HuntProjectilePresentationRuntime.js');

const runtimeCss = fs.readFileSync(path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');
assert.ok(runtimeCss.includes('is-playing:not(.is-beat-projectile) .monster-element-projectile'),
    'reduced-motion styling must not override an authored BEAT projectile flight duration');

const calls = [];
const runtime = new Runtime({
    onLaunch: projectile => calls.push(['launch', projectile.id]),
    onOutcome: projectile => calls.push(['outcome', projectile.id]),
    onFinish: projectile => calls.push(['finish', projectile.id]),
    onCancel: (_session, reason) => calls.push(['cancel', reason])
});
const state = { actorKey: 'monster', generation: 7, context: { actionSessionId: 'rathian.fireball#7' } };
runtime.begin(state);
const launch = {
    kind: 'projectile-launch', id: 'fireball-1:launch', projectileId: 'fireball-1',
    target: 'primary', outcomeEventId: 'fireball-1:contact', atTicks: 21
};
const finish = { kind: 'projectile-finish', id: 'fireball-1:finish', projectileId: 'fireball-1', atTicks: 27 };

assert.strictEqual(runtime.observeEvent(state, launch), true);
assert.strictEqual(runtime.observeEvent(state, launch), false,
    'the same BEAT event cannot launch a second projectile');
assert.strictEqual(runtime.resolveOutcome({
    sessionId: 'rathian.fireball#7', projectileId: 'fireball-1', id: 'fireball-1:contact'
}, [{ index: 1, result: 'hit' }]), true);
assert.strictEqual(runtime.resolveOutcome({
    sessionId: 'rathian.fireball#7', projectileId: 'fireball-1', id: 'fireball-1:contact'
}, [{ index: 1, result: 'hit' }]), false,
    'an outcome cannot replay or relaunch an existing projectile');
assert.strictEqual(runtime.observeEvent(state, finish), true);
assert.deepStrictEqual(calls, [
    ['launch', 'fireball-1'], ['outcome', 'fireball-1'], ['finish', 'fireball-1']
]);

console.log('[test] BEAT projectile presentation runtime passed.');
