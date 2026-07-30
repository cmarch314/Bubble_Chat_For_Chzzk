const assert = require('assert');
const HuntCommandCatalog = require('../js/effects/hunt/HuntCommandCatalog');

assert.strictEqual(HuntCommandCatalog.matchStart('!수렵 레우스').mode, 'single');
assert.strictEqual(HuntCommandCatalog.matchStart('!수렵 레우스').args, '레우스');
assert.strictEqual(HuntCommandCatalog.matchStart('!토벌').mode, 'single');
assert.strictEqual(HuntCommandCatalog.matchStart('!수렵3마리').args, '3마리', 'legacy compact consecutive syntax must remain compatible');
assert.strictEqual(HuntCommandCatalog.matchStart('!몬헌').mode, 'journey');
assert.strictEqual(HuntCommandCatalog.matchStart('!몬헌아님'), null, 'commands require an exact token boundary');
assert.strictEqual(HuntCommandCatalog.matchStart('!수렵피리'), null, 'weapon loadout commands must not start a new hunt');
assert.strictEqual(HuntCommandCatalog.isStop(' !몬헌 중단 '), true);
assert.strictEqual(HuntCommandCatalog.isStop('!수렵 레우스'), false);
assert.match(HuntCommandCatalog.helpLabel(), /!수렵/);
assert.match(HuntCommandCatalog.helpLabel(), /!몬헌/);

console.log('[test] Hunt command catalog is the single start/stop/help contract.');
