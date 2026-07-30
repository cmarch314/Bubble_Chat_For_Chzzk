'use strict';

const assert = require('assert');
const { semanticFromLabel, parseNumberedNote } = require('../scripts/import-mhw-audio-references');

assert.deepStrictEqual(
    semanticFromLabel('Arrow shot', 'wp11_bow_epvsp_shell.nbnk').actionFamily,
    'bow_shot'
);
assert.strictEqual(
    semanticFromLabel('Dragon piercer hit [1/2]', 'wp11_bow_epvsp_shell.nbnk').actionFamily,
    'dragon_piercer_hit'
);
assert.strictEqual(
    semanticFromLabel('Rathalos roar', 'em001_vo.nbnk').actionFamily,
    'monster_roar'
);
assert.strictEqual(
    semanticFromLabel('Weapon sharpen [1/3]', 'pl_prop_cmn.nbnk').actionFamily,
    'whetstone_stroke'
);
assert.strictEqual(
    semanticFromLabel('Sharpen finished', 'wp_cmn_epvsp.nbnk').actionFamily,
    'whetstone_finish'
);
const roars = parseNumberedNote('em024_vo.nbnk', '24 or 34 = Kushala Daora roar', 'Bank Index!E1');
assert.deepStrictEqual(roars.map(item => item.wemOrdinal), [24, 34]);
assert(roars.every(item => item.actionFamily === 'monster_roar'));

console.log('[test] World labelled audio reference normalization passed.');
