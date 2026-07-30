'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Registry = require('../js/effects/hunt/HuntMonsterMechanicRegistry.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');

const kitDir = path.resolve(__dirname, '../data/hunt/monster-kits');
const kits = fs.readdirSync(kitDir)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(path.join(kitDir, file), 'utf8')));

kits.forEach(kit => {
    assert.deepStrictEqual(
        Registry.validateKit(kit, profiles[kit.id] || []),
        [],
        `${kit.id} must not claim an unregistered or behaviorless mechanic`
    );
});

const fake = {
    id: 'fake',
    runtime: { mechanicModules: ['common', 'invisibility'] }
};
assert.ok(Registry.validateKit(fake, []).some(error => /invisibility/.test(error)),
    'a thematic mechanic name must not pass release without a registered runtime owner');

console.log(`[test] ${kits.length} released monster mechanic contracts passed.`);
