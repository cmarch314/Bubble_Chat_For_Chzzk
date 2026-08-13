const assert = require('assert');
const fs = require('fs');
const path = require('path');
const HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor');

assert.strictEqual(HuntHunterTurnExecutor.BASE_HIT_CHANCE, 0.90,
    'ordinary hunter attacks must use a 90% base hit chance');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntHunterTurnExecutor.js'), 'utf8');
assert.match(source, /personalityProfiles\(\)\?\.chance\(w, 'hit'\)/,
    'hit chance must come from the centralized personality profile plus perk modifiers');
assert.match(source, /engine\.random\(\)\s*>=\s*hitChance[\s\S]*?onAttackMiss\?\.\(engine,\s*w,\s*currentCombo\)/,
    'a missed attack must notify weapon mechanics before its action lifecycle completes');
assert.match(source, /\[빗나감\][\s\S]*?completeAction\([\s\S]*?return;/,
    'a miss must still finish its action lifecycle before returning');

console.log('[test] Hunter base accuracy and miss lifecycle passed.');
