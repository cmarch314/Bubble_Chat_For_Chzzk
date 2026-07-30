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
    { id: 'gold_rathian', nameEN: 'Gold Rathian', nameKO: '리오레이아 희소종' },
    // Keep the variant first to reproduce catalog-order ambiguity.
    { id: 'brute_tigrex', nameEN: 'Brute Tigrex', nameKO: '티가렉스 아종', variantOf: 'tigrex' },
    { id: 'tigrex', nameEN: 'Tigrex', nameKO: '티가렉스' },
    { id: 'scarred_yian_garuga', nameEN: 'Scarred Yian Garuga', nameKO: '상처입은 얀가루루가', variantOf: 'yian_garuga' },
    { id: 'yian_garuga', nameEN: 'Yian Garuga', nameKO: '얀가루루가' }
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
assert.strictEqual(selected('!수렵 티가'), 'tigrex');
assert.strictEqual(selected('!수렵 티가렉스'), 'tigrex');
assert.strictEqual(selected('!수렵 티가 아종'), 'brute_tigrex');
assert.strictEqual(selected('!수렵 얀가'), 'yian_garuga');
assert.strictEqual(selected('!수렵 얀가루루가'), 'yian_garuga');
const unavailable = initializer.parseCommand('!수렵 없는몬스터', monsters);
assert.strictEqual(unavailable.selectedMonster, null);
assert.strictEqual(unavailable.requestedMonsterMatched, false,
    'an unavailable monster request must not silently start a random hunt');
assert.strictEqual(initializer.parseCommand('!수렵 레우스', monsters).huntMode, 'single');
assert.strictEqual(initializer.parseCommand('!토벌 레우스', monsters).huntMode, 'single');
assert.strictEqual(initializer.parseCommand('!몬헌 레우스', monsters).huntMode, 'journey');
assert.strictEqual(selected('!몬헌 레우스'), 'azure_rathalos', 'journey encounter choice must ignore manual monster tokens');
console.log('[test] Exact monster command selection takes priority over variants.');
