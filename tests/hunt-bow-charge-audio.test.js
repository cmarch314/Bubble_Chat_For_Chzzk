const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(`${source}\nglobalThis.Executor = HuntHunterTurnExecutor;`, context);
const HuntHunterTurnExecutor = context.Executor;

assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_1' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_2' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_3' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.charge_1' }), 'weapon_charge',
    'removing the disliked bow draw sound must not mute other weapon charge cues');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.recover_stamina' }), 'weapon_recover',
    'non-draw bow preparation cues remain independently routed');

console.log('[test] Bow draw preparation is silent without muting bow shots or other weapon charges.');
