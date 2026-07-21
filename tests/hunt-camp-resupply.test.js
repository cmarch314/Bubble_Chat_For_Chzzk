const fs = require('fs');
const assert = require('assert');

const source = fs.readFileSync('js/effects/hunt/HuntEngine.js', 'utf8');

assert.match(source, /resupplyHunterAtCamp\(hunter\)/, 'camp resupply must have one runtime owner');
for (const field of ['potions', 'lifepowders', 'shockTraps', 'bombs', 'perkTraps', 'perkFlashes', 'sharpness', 'magazine', 'ammo']) {
    assert.match(source, new RegExp(`hunter\\.${field}\\s*=`), `camp resupply must restore ${field}`);
}
assert.match(source, /hunter\.farcasterUsed\s*=\s*false/, 'hunt initialization must own the one-use Farcaster reset');
assert.doesNotMatch(
    source.match(/resupplyHunterAtCamp\(hunter\)[\s\S]*?\n    }/)?.[0] || '',
    /hunter\.farcasterUsed\s*=/,
    'camp resupply must not reset the once-per-hunt Farcaster limit'
);

console.log('[test] Hunt camp resupply contract passed.');
