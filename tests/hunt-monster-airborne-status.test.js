'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterFlightRuntime = require('../js/effects/hunt/HuntMonsterFlightRuntime.js');
const HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');

const engineSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
const start = engineSource.indexOf('    enterMonsterControlState(');
const end = engineSource.indexOf('\n    addMonsterStun(', start);
assert(start >= 0 && end > start, 'HuntEngine must own the shared monster control-state entry');

class Harness {
    constructor() {
        this.selectedMonster = { id: 'rathalos', nameKO: '리오레우스' };
        this.monsterHp = 1000;
        this.monsterState = 'normal';
        this.monsterFlightState = 'airborne';
        this.monsterFlightTicksRemaining = 400;
        this.monsterFlightCooldown = 0;
        this.monsterPartState = [];
        this.monsterAtb = 88;
        this.monsterStunDuration = 0;
        this.monsterKnockdownDuration = 0;
        this.pendingMonsterAction = { id: 'air-attack' };
        this.pendingMonsterImpact = { id: 'air-impact' };
        this.events = [];
        this.monsterFlightRuntime = new HuntMonsterFlightRuntime(() => 0);
    }
    updateMonsterFlightUI(value) { this.events.push(['flight', value]); }
    interruptMonsterMovement(reason) {
        this.pendingMonsterAction = null;
        this.pendingMonsterImpact = null;
        this.events.push(['interrupt', reason]);
    }
    updateMonsterAtbUI(value) { this.events.push(['atb', value]); }
    setMonsterAtbForControl(kind) {
        return HuntAtbConfig.applyMonsterControlAtb(this, kind);
    }
    updateMonsterStateUI(state) { this.events.push(['state', state]); }
    addLog(text) { this.events.push(['log', text]); }
}

const StatusHarness = Function(`return class extends arguments[0] {\n${engineSource.slice(start, end)}\n}`)(Harness);
for (const [kind, expectedState, durationField, ticks] of [
    ['stun', 'stunned', 'monsterStunDuration', 60],
    ['paralysis', 'paralyzed', 'monsterKnockdownDuration', 35],
    ['sleep', 'sleeping', 'monsterKnockdownDuration', 50]
]) {
    const engine = new StatusHarness();
    assert.strictEqual(engine.enterMonsterControlState(kind, ticks), true);
    assert.strictEqual(engine.monsterFlightState, 'grounded', `${kind} must begin on the ground`);
    assert.strictEqual(engine.monsterFlightTicksRemaining, 0);
    assert.strictEqual(engine.monsterState, expectedState);
    assert.strictEqual(engine[durationField], ticks);
    assert.strictEqual(engine.monsterAtb, 100,
        `${kind} must hold a full gauge while grounded in the control pose`);
    assert.strictEqual(engine.pendingMonsterAction, null);
    assert.strictEqual(engine.pendingMonsterImpact, null);
    assert.ok(engine.events.some(event => event[0] === 'interrupt' && event[1] === `status:${kind}`));
}

const rendererSource = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntRenderer.js'), 'utf8');
const cssSource = require('./helpers/hunt-css');
assert.match(rendererSource, /monster-paralyzed[\s\S]*?monster-sleeping/);
assert.match(cssSource, /monster-paralyzed-pose[\s\S]*?monster-sleeping-pose/);

console.log('[test] Airborne stun, paralysis, and sleep land before their status pose starts.');
