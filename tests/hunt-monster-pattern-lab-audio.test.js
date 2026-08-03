'use strict';

const assert = require('assert');

global.ManagedTimers = class {
    constructor() { this.jobs = []; }
    timeout(callback, delay) { this.jobs.push({ callback, delay }); return this.jobs.length; }
    clearAll() { this.jobs = []; }
};
global.HuntAudioManager = class {
    constructor() { this.calls = []; global.audioManagerProbe = this; }
    playMonsterAction(monster, kind, context) {
        this.calls.push({ monster, kind, context });
        return true;
    }
};

const HuntMonsterPatternLabAudio = require('./fixtures/hunt-monster-pattern-lab-audio.js');
const controller = new HuntMonsterPatternLabAudio({
    monsterProvider: () => ({ id: 'tigrex', nameKO: '티가렉스' })
});
const pattern = {
    id: 'tigrex.charge_chain',
    name: '연속 돌진',
    type: 'charge',
    tags: ['physical', 'multi-hit'],
    delivery: 'body'
};

controller.playPattern(pattern, [
    { atTicks: 4, eventKind: 'charge-pass' },
    { atTicks: 11, eventKind: 'charge-pass' }
]);

assert.strictEqual(global.audioManagerProbe.calls.length, 1,
    'only creature VO may play when the action starts');
assert.strictEqual(global.audioManagerProbe.calls[0].context.audioPhase, 'action-start');
assert.deepStrictEqual(controller.scheduled.jobs.map(job => job.delay), [400, 1100],
    'impact SE must be scheduled at the authored impact ticks');
controller.scheduled.jobs[0].callback();
assert.strictEqual(global.audioManagerProbe.calls[1].context.audioPhase, 'impact');
assert.strictEqual(global.audioManagerProbe.calls[1].context.impactEventKind, 'charge-pass');

controller.playPattern({ ...pattern, type: 'roar' }, [{ atTicks: 5 }]);
assert.strictEqual(global.audioManagerProbe.calls.at(-1).kind, 'roar');
const roarImpactJob = controller.scheduled.jobs[0];
const beforeRoarImpact = global.audioManagerProbe.calls.length;
roarImpactJob.callback();
assert.strictEqual(global.audioManagerProbe.calls.length, beforeRoarImpact,
    'roar patterns must not invent a physical impact SE');

console.log('[test] Monster pattern lab audio timing contract passed.');
