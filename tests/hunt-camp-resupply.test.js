const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('js/effects/hunt/HuntEngine.js', 'utf8');

assert.match(source, /resupplyHunterAtCamp\(hunter\)/, 'camp resupply must have one runtime owner');
assert.match(source, /HuntIssuedSupplyRuntime/);
assert.match(source, /resupplyFromCamp/);
assert.doesNotMatch(source, /hunter\.perk(?:Traps|Flashes)\s*=/,
    'perk items must not create a second camp inventory');
for (const field of ['sharpness', 'magazine', 'ammo']) assert.match(source,
    new RegExp(`hunter\\.${field}\\s*=`), `camp resupply must restore ${field}`);
console.log('[test] Hunt camp resupply contract passed.');
