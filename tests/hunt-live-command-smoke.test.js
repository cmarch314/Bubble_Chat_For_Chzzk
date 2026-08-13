'use strict';

const assert = require('assert');

global.window = { HUNT_WEAPONS: [] };
global.HuntMonsterPatternCatalog = { build: () => ({}), validate: () => [] };
global.HuntWeaponCatalog = { build: () => ({}), validate: () => [] };

const HuntInitializer = require('../js/effects/hunt/HuntInitializer.js');
const initializer = new HuntInitializer({ random: () => 0 });
const monsters = [{
    id: 'diablos', nameKO: '디아블로스', nameEN: 'Diablos', filename: 'diablos.png'
}];

for (const command of ['!수렵 디아블로스', '!수렵 디아브로스', '!수렵 Diablos']) {
    const parsed = initializer.parseCommand(command, monsters);
    assert.strictEqual(parsed.requestedMonsterMatched, true,
        `${command} must resolve to a reviewed live monster`);
    assert.strictEqual(parsed.selectedMonster?.id, 'diablos');
}

console.log('[test] live Diablos command aliases passed');
