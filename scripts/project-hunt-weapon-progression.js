#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_POLICY = path.join(ROOT, 'data', 'hunt', 'weapon-progression-policy.json');

function clamp01(value) { return Math.max(0, Math.min(1, Number(value) || 0)); }
function normalize(value, min, max) { return max > min ? clamp01((Number(value) - min) / (max - min)) : 0; }
function sharpnessScore(profile, weights) {
    const entries = Object.entries(profile || {}).filter(([, amount]) => Number(amount) > 0);
    if (!entries.length) return 0;
    const total = entries.reduce((sum, [, amount]) => sum + Number(amount), 0);
    return entries.reduce((sum, [color, amount]) => sum + Number(amount) * Number(weights[color] || 0), 0) / Math.max(1, total * 6);
}

function validatePolicy(policy) {
    const projection = policy?.projection || {};
    if (!Number.isInteger(projection.tierCount) || projection.tierCount < 2 || projection.tierCount > 8) throw new Error('tierCount must be an integer from 2 to 8');
    if (!Array.isArray(projection.stageTierCaps) || projection.stageTierCaps.length !== 3) throw new Error('stageTierCaps must contain exactly three stages');
    if (projection.stageTierCaps.some(cap => !Number.isInteger(cap) || cap < 1 || cap > projection.tierCount)) throw new Error('stageTierCaps must fit tierCount');
    const weightTotal = Object.values(projection.weights || {}).reduce((sum, value) => sum + Number(value || 0), 0);
    if (Math.abs(weightTotal - 1) > 0.0001) throw new Error('projection weights must total 1');
    if (policy.sourcePolicy?.sourceRankAffectsProgression !== false) throw new Error('journey projection must not depend on source rank');
    return policy;
}

function projectWeapons(nodes, policy) {
    validatePolicy(policy);
    const output = [];
    const groups = new Map();
    for (const node of nodes || []) {
        const key = String(node.kind || 'unknown');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(node);
    }
    for (const group of groups.values()) {
        const ranges = {};
        for (const field of ['rarity', 'raw', 'affinity']) {
            const values = group.map(node => Number(node[field] || 0));
            ranges[field] = [Math.min(...values), Math.max(...values)];
        }
        const scored = group.map(node => {
            const w = policy.projection.weights;
            const score = normalize(node.rarity, ...ranges.rarity) * w.rarity
                + normalize(node.raw, ...ranges.raw) * w.raw
                + sharpnessScore(node.sharpness, policy.projection.sharpnessWeights) * w.sharpness
                + normalize(node.affinity, ...ranges.affinity) * w.affinity;
            return { node, score };
        }).sort((a, b) => a.score - b.score || String(a.node.weaponKey).localeCompare(String(b.node.weaponKey)));
        scored.forEach((entry, index) => {
            const calculated = Math.min(policy.projection.tierCount, Math.floor(index * policy.projection.tierCount / Math.max(1, scored.length)) + 1);
            const override = policy.overrides?.[entry.node.weaponKey];
            output.push({ ...entry.node, sourceRank: entry.node.rank ?? null, progressionTier: Number(override?.tier || calculated), projectionScore: Number(entry.score.toFixed(6)), projectionProfile: policy.profileId });
        });
    }
    return output;
}

if (require.main === module) {
    const policyPath = path.resolve(process.argv[2] || DEFAULT_POLICY);
    validatePolicy(JSON.parse(fs.readFileSync(policyPath, 'utf8')));
    console.log(`[weapon-projection] valid policy: ${policyPath}`);
}

module.exports = { validatePolicy, projectWeapons, sharpnessScore };
