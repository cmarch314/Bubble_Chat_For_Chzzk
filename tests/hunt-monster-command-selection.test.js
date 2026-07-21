const assert = require('assert');

global.window = { HUNT_WEAPONS: [] };
global.HuntMonsterPatternCatalog = { build: () => ({}), validate: () => [] };
global.HuntWeaponCatalog = { build: () => ({}), validate: () => [] };
const HuntInitializer = require('../js/effects/hunt/HuntInitializer.js');

const monsters = [
    { id: 'azure_rathalos', nameEN: 'Azure Rathalos', nameKO: '리오레우스 아종' },
    { id: 'rathalos', nameEN: 'Rathalos', nameKO: '리오레우스' },
    { id: 'silver_rathalos', nameEN: 'Silver Rathalos', nameKO: '리오레우스 희소종' },
    { id: 'pink_rathian', nameEN: 'Pink Rathian', nameKO: '리오레이아 아종' },
    { id: 'rathian', nameEN: 'Rathian', nameKO: '리오레이아' },
    { id: 'gold_rathian', nameEN: 'Gold Rathian', nameKO: '리오레이아 희소종' }
];
const initializer = new HuntInitializer({ random: () => 0 });
const selected = command => initializer.parseCommand(command, monsters).selectedMonster.id;

assert.strictEqual(selected('!수렵 레우스'), 'rathalos');
assert.strictEqual(selected('!수렵 리오레우스'), 'rathalos');
assert.strictEqual(selected('!수렵 레우스 아종'), 'azure_rathalos');
assert.strictEqual(selected('!수렵 창화룡'), 'azure_rathalos');
assert.strictEqual(selected('!수렵 은화룡'), 'silver_rathalos');
assert.strictEqual(selected('!수렵 레이아'), 'rathian');
assert.strictEqual(selected('!수렵 금화룡'), 'gold_rathian');
console.log('[test] Exact monster command selection takes priority over variants.');
