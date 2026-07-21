const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mapping = require('../data/hunt/wilds-weapon-codes.json').codes;
const timings = require('../scripts/import-wilds-motion-timings.js');
const taxonomy = require('../scripts/mh-audio-taxonomy.js');
const comboImporter = fs.readFileSync(path.resolve(__dirname, '../scripts/import-wilds-weapon-combos.py'), 'utf8');

assert.strictEqual(Object.keys(mapping).length, 14);
assert.strictEqual(mapping.Wp05, 'hunting_horn');
assert.strictEqual(mapping.Wp06, 'lance');
assert.strictEqual(mapping.Wp07, 'gunlance');
assert.strictEqual(mapping.Wp09, 'charge_blade');
assert.strictEqual(mapping.Wp10, 'insect_glaive');
assert.deepStrictEqual(timings.WEAPONS, mapping);
assert.strictEqual(taxonomy.WEAPON_BY_INDEX['10'], 'insect_glaive');
assert.match(comboImporter, /wilds-weapon-codes\.json/, 'Python combo importer must use the canonical mapping');
console.log('[test] Wilds weapon-code mapping passed.');
