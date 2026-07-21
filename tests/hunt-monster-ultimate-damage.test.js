const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '../js/effects/hunt/HuntMonsterTurnExecutor.js'), 'utf8');
assert.match(source, /isUltimate[\s\S]*?guardProb \*= 0\.62;[\s\S]*?dodgeProb \*= 0\.42;/,
    'signature attacks must reduce passive automatic guard and evade odds');
assert.match(source, /isUltimate && !isGuard && !isDodge[\s\S]*?target\.maxHp \* 0\.72/,
    'an unguarded signature hit must retain a threatening post-mitigation floor');
assert.match(source, /canIaiCounter[\s\S]*?iaiCounterProb/,
    'authored weapon counter windows must remain available against signature attacks');
console.log('[test] Monster ultimate damage pressure contract passed.');
