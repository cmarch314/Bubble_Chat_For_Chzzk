const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
const context = vm.createContext({ console });
vm.runInContext(`${source}\nglobalThis.Executor = HuntHunterTurnExecutor;`, context);
const HuntHunterTurnExecutor = context.Executor;

assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_1' }), 'bow_charge_start');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_2' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.draw_3' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.charging_sidestep' }), 'bow_charge_step');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'bow.recover_stamina' }), null);
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.charge_1' }), 'charge_tier_1');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.strong_charge_2' }), 'charge_tier_2');
assert.strictEqual(HuntHunterTurnExecutor.preparationAudioCue({ id: 'great_sword.true_charge_3' }), 'charge_tier_3',
    'great sword charge stages must use their exact labelled World events instead of a random weapon-bank fallback');

console.log('[test] Bow uses one charge-air cue without repeated string pulls; charge-step and Great Sword tiers stay explicit.');
