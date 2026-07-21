const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '../js/effects/hunt/HuntEngine.js'), 'utf8');
assert(source.includes('great_sword: 70') && source.includes('bow: 55'), 'strong-hit thresholds must be weapon-specific');
assert(source.includes("success: ['😆'") && source.includes("failure: ['😡'") && source.includes("hurt: ['😵'"), 'emotion outcomes need distinct random emoji pools');

const methodStart = source.indexOf('    isStrongHunterAttack(');
const methodEnd = source.indexOf('\n    triggerMonsterRoar(', methodStart);
assert(methodStart >= 0 && methodEnd > methodStart, 'hunter emotion methods must remain on HuntEngine');

class EmotionHarness {
    constructor(randomValues) { this.values = randomValues; this.battleTime = 100; this.spawned = []; }
    random() { return this.values.shift() ?? 0; }
    spawnEmojiBubble(index, emoji) { this.spawned.push([index, emoji]); }
}

const methods = source.slice(methodStart, methodEnd);
const Harness = Function(`return class extends arguments[0] {\n${methods}\n}`)(EmotionHarness);
const engine = new Harness([0.1, 0]);
const hunter = { id: 'great_sword', index: 2, status: 'alive' };
assert.strictEqual(engine.expressHunterEmotion(hunter, 'success', { dmg: 300, motionValue: 80 }), true);
assert.deepStrictEqual(engine.spawned, [[2, '😆']]);
assert.strictEqual(engine.expressHunterEmotion(hunter, 'hurt'), false, 'emotion cooldown must prevent emoji spam');
engine.battleTime += 18;
engine.values.push(0.1, 0);
assert.strictEqual(engine.expressHunterEmotion(hunter, 'failure'), true);
assert.strictEqual(engine.spawned[1][1], '😡');

console.log('[test] Hunter strong-hit and negative emotion reactions passed.');
