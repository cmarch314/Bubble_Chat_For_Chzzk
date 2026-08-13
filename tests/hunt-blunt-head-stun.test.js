const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Catalog = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');

const parts = [
    { kind: 'head', broken: false, severed: false, breakable: true, hitzones: { blunt: .65 } },
    { kind: 'torso', broken: false, severed: false, breakable: false, hitzones: { blunt: .35 } },
    { kind: 'left-leg', broken: false, severed: false, breakable: true, hitzones: { blunt: .4 } }
];
assert.strictEqual(Catalog.choosePart(parts, 'blunt', () => .70).kind, 'head', 'blunt targeting must strongly prefer the head');
assert.notStrictEqual(Catalog.choosePart(parts, 'slash', () => .70).kind, 'head', 'head preference must not be applied to cutting weapons');

const engineSource = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
const start = engineSource.indexOf('    addMonsterStun(');
const end = engineSource.indexOf('\n    executeHunterTurn(', start);
assert(start >= 0 && end > start, 'head-stun accumulation must be owned by HuntEngine');

class Harness {
    constructor() {
        this.monsterHp = 1000;
        this.monsterStunAccum = 0;
        this.monsterStunThreshold = 100;
        this.monsterStunDuration = 0;
        this.monsterAtb = 100;
        this.pendingMonsterAction = { pattern: {} };
        this.selectedMonster = { nameKO: '리오레우스' };
        this.events = [];
    }
    updateMonsterAtbUI(value) { this.events.push(['atb', value]); }
    updateMonsterStateUI(state) { this.events.push(['state', state]); }
    showSkillBubble(target, text) { this.events.push(['bubble', target, text]); }
    addLog(text) { this.events.push(['log', text]); }
    enterMonsterControlState(kind, ticks) {
        this.monsterState = kind === 'stun' ? 'stunned' : kind;
        this.monsterStunDuration = ticks;
        this.monsterAtb = 0;
        this.pendingMonsterAction = null;
        this.updateMonsterAtbUI(0);
        return true;
    }
}
const MethodHarness = Function(`return class extends arguments[0] {\n${engineSource.slice(start, end)}\n}`)(Harness);
const engine = new MethodHarness();
const hunter = { name: '해머', hunterName: '헌터' };
assert.strictEqual(engine.addMonsterStun(hunter, 150, { part: { kind: 'torso' } }), false);
assert.strictEqual(engine.monsterStunAccum, 0, 'body hits must not build KO');
assert.strictEqual(engine.addMonsterStun(hunter, 60, { part: { kind: 'head' } }), false);
assert.strictEqual(engine.addMonsterStun(hunter, 40, { part: { kind: 'horn' } }), true);
assert.strictEqual(engine.monsterState, 'stunned');
assert.strictEqual(engine.monsterStunDuration, 60);
assert.strictEqual(engine.pendingMonsterAction, null, 'KO must interrupt a telegraphed monster action');

console.log('[test] Blunt head preference and head-only stun accumulation passed.');
