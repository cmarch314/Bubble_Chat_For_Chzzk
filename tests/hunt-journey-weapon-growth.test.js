const assert = require('assert');
global.HuntJourneyCatalog = require('../js/effects/hunt/HuntJourneyCatalog');
const HuntJourneyWeaponGrowth = require('../js/effects/hunt/HuntJourneyWeaponGrowth');
const entries = [
    { id: 1, kind: 'great_sword', rarity: 5, raw: 100 },
    { id: 2, kind: 'great_sword', rarity: 6, raw: 120 },
    { id: 3, kind: 'great_sword', rarity: 7, raw: 140 },
    { id: 4, kind: 'great_sword', rarity: 8, raw: 160 },
    { id: 9, kind: 'hammer', rarity: 6, raw: 999 }
];
const byKind = new Map();
entries.forEach(item => { if (!byKind.has(item.kind)) byKind.set(item.kind, []); byKind.get(item.kind).push(item); });
const growth = new HuntJourneyWeaponGrowth({ byKind });
assert.strictEqual(growth.starter('great_sword', 2).id, 1);
const member = { weaponId: 'great_sword', weaponInstanceId: 1, weaponTier: 5 };
assert.deepStrictEqual(growth.candidates(member, 0, 3).map(item => item.id), [2]);
assert.ok(growth.candidates(member, 2, 3).every(item => item.kind === 'great_sword'));
assert.strictEqual(growth.apply(member, 9), false);
assert.strictEqual(growth.apply(member, 3), true);
assert.strictEqual(member.weaponTier, 7);
const graph = [
    { key: 'great-sword:1', id: 1, kind: 'great_sword', tier: 1, rarity: 1, starterStyle: 'iron', branches: ['great-sword:2'], nameKo: '희망의 검 I', seal: 'iron' },
    { key: 'great-sword:2', id: 2, kind: 'great_sword', tier: 2, rarity: 3, branches: ['great-sword:3'], nameKo: '희망의 검 II', seal: 'iron' },
    { key: 'great-sword:3', id: 3, kind: 'great_sword', tier: 3, rarity: 5, branches: ['great-sword:4'], nameKo: '희망의 검 III', seal: 'flying' },
    { key: 'great-sword:4', id: 4, kind: 'great_sword', tier: 4, rarity: 7, branches: [], nameKo: '희망의 검 IV', seal: 'elder' },
    { key: 'great-sword:39', id: 39, kind: 'great_sword', tier: 1, rarity: 1, starterStyle: 'bone', branches: [], nameKo: '본블레이드 I', seal: 'bone' }
];
const treeGrowth = new HuntJourneyWeaponGrowth({ byKind: new Map() }, graph);
const treeMember = { weaponId: 'great_sword', weaponInstanceId: 1, weaponProgressionKey: 'great-sword:1', weaponTier: 1 };
assert.strictEqual(treeGrowth.starter('great_sword', 1, 'bone').key, 'great-sword:39');
assert.deepStrictEqual(treeGrowth.candidates(treeMember, 1, 7).map(item => item.key), ['great-sword:2']);
assert.deepStrictEqual(treeGrowth.candidates(treeMember, 2, 7).map(item => item.key), ['great-sword:4']);
assert.strictEqual(treeGrowth.apply(treeMember, 'great-sword:3'), true);
assert.strictEqual(treeMember.weaponDisplayName, '희망의 검 III');
assert.strictEqual(treeMember.weaponSeal, 'flying');
console.log('[test] Journey weapon starter, upgrade candidates, and class boundary passed.');
