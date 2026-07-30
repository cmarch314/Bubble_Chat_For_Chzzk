'use strict';
const assert = require('assert');
const { parseGroups, build, usable } = require('../scripts/generate-world-shell-behavior');
const fixture = `<details>
    <summary>GreatJagras</summary>
<summary><b>[1 Shell] Action ID: 5 ACTION::ROLLING_ATTACK</b></summary>
<li><code>em\\em101\\00\\shell\\em101_00\\data\\em101_00.shlp</code></li>
<summary><b>[1 Shell] Action ID: 6 ACTION::GRAPPLE_WITH_EM100</b></summary>`;
const groups = parseGroups(fixture);
assert.strictEqual(groups[0].monsterCodes[0], 'em101_00');
assert.strictEqual(usable('GRAPPLE_WITH_EM100'), false);
const monsters = build(groups);
assert.strictEqual(monsters[0].id, 'great_jagras');
assert.strictEqual(monsters[0].patterns[0].sourceActionClass, 'ROLLING_ATTACK');
assert.strictEqual(monsters[0].patterns[0].evidence, 'mhw-action-shell-mapping');
console.log('[test] World action-shell behavior generator passed.');
