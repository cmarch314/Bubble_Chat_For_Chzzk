const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.HuntActionStateMachine = class HuntActionStateMachine {};

const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const source = fs.readFileSync(
    path.join(__dirname, '../js/effects/hunt/HuntEngine.js'),
    'utf8'
);

assert.strictEqual(HuntEngine.STANDARD_GUARD_LABEL, '가드!',
    'ordinary guard feedback must have one canonical label');
assert.strictEqual(
    (source.match(/showSkillBubble\([^\n]+HuntEngine\.STANDARD_GUARD_LABEL\)/g) || []).length,
    2,
    'interference guard and roar guard must both use the canonical label'
);
assert.doesNotMatch(source, /showSkillBubble\([^\n]+['"]🛡️ 가드['"]\)/,
    'ordinary guard bubbles must not duplicate the separate shield impact emoji');
assert.doesNotMatch(source, /showSkillBubble\([^\n]+['"]가드!['"]\)/,
    'ordinary guard labels must not be forked into inline literals again');

console.log('[test] Hunt guard presentation label passed.');
