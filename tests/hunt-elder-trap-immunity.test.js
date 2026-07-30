const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');

assert.strictEqual(HuntMonsterRules.isTrapImmune({ id: 'chameleos' }, 'large'), true, 'Chameleos must be trap immune even with a stale tier');
assert.strictEqual(HuntMonsterRules.isTrapImmune({ id: 'kushala-daora' }, 'large'), true, 'hyphenated elder IDs must normalize');
assert.strictEqual(HuntMonsterRules.isTrapImmune({ id: 'rathalos' }, 'large'), false);
assert.strictEqual(HuntMonsterRules.isTrapImmune({ id: 'unknown' }, 'elder'), true, 'elder tier remains a fail-safe');
assert.strictEqual(HuntMonsterRules.isTrapImmune({ id: 'jagras' }, 'small'), true,
    'small-monster battles must reject AI, perk, and chat trap use');

const root = path.resolve(__dirname, '..');
const initializer = fs.readFileSync(path.join(root, 'js/effects/hunt/HuntInitializer.js'), 'utf8');
assert(/elderIds[\s\S]*?'chameleos'/.test(initializer), 'Chameleos must also receive elder-tier combat stats');
for (const [name, file] of [
    ['AI traps', 'HuntHunterTurnExecutor.js'], ['chat traps', 'HuntChatTactics.js'], ['perk traps', 'HuntPerkRuntime.js']
]) {
    const source = fs.readFileSync(path.join(root, 'js/effects/hunt', file), 'utf8');
    assert(source.includes('isMonsterTrapImmune'), `${name} must use the shared elder immunity owner`);
}

console.log('[test] Small-monster and Elder Dragon trap immunity passed.');
