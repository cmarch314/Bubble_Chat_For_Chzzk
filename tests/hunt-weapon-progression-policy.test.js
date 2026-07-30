'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validatePolicy, projectWeapons } = require('../scripts/project-hunt-weapon-progression');

const policy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'hunt', 'weapon-progression-policy.json'), 'utf8'));
validatePolicy(policy);
const nodes = [
    { weaponKey: 'world:gs:1', kind: 'great-sword', rank: 'low', rarity: 1, raw: 80, affinity: 0, sharpness: { yellow: 50 } },
    { weaponKey: 'rise:gs:2', kind: 'great-sword', rank: 'master', rarity: 2, raw: 100, affinity: 0, sharpness: { green: 50 } },
    { weaponKey: 'wilds:gs:3', kind: 'great-sword', rank: null, rarity: 3, raw: 120, affinity: 0, sharpness: { blue: 50 } },
    { weaponKey: 'world:gs:4', kind: 'great-sword', rank: 'high', rarity: 4, raw: 140, affinity: 0, sharpness: { white: 50 } }
];
const projected = projectWeapons(nodes, policy);
assert.deepStrictEqual(projected.map(node => node.progressionTier), [1, 2, 3, 4]);
assert.deepStrictEqual(projected.map(node => node.sourceRank), ['low', 'master', null, 'high']);
const renamedRanks = projectWeapons(nodes.map(node => ({ ...node, rank: 'anything' })), policy);
assert.deepStrictEqual(renamedRanks.map(node => node.projectionScore), projected.map(node => node.projectionScore), 'source rank must not affect the journey projection');
const compact = structuredClone(policy); compact.projection.tierCount = 3; compact.projection.stageTierCaps = [1, 2, 3];
assert.deepStrictEqual(projectWeapons(nodes, compact).map(node => node.progressionTier), [1, 1, 2, 3]);
const overridden = structuredClone(policy); overridden.overrides['world:gs:1'] = { tier: 3 };
assert.strictEqual(projectWeapons(nodes, overridden).find(node => node.weaponKey === 'world:gs:1').progressionTier, 3);
console.log('[test] Rank-agnostic, policy-driven weapon progression projection passed.');
