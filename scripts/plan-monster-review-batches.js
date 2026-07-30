#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POLICY_PATH = path.join(ROOT, 'data', 'hunt', 'monster-review-policy.json');
const ROSTER_PATH = path.join(ROOT, 'img', 'monsters', 'monsters.json');
const AUDIT_PATH = path.join(ROOT, 'data', 'hunt', 'monster-evidence-audit.generated.json');
const RELEASE_PATH = path.join(ROOT, 'data', 'hunt', 'monster-release-manifest.generated.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'hunt', 'monster-review-backlog.generated.json');

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const normalize = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

function canonicalEdition(monster, editionOrder) {
    const games = new Set(monster.games || []);
    return editionOrder.find(edition => edition !== 'unassigned' && games.has(edition)) || 'unassigned';
}

function readiness(record = {}) {
    return {
        image: record.image?.status === 'verified-local',
        patternCandidate: !['fallback-candidate', undefined].includes(record.patterns?.status),
        anatomy: record.anatomy?.speciesStatus === 'verified',
        animationRig: record.animation?.rig !== 'generic',
        roarResolved: ['verified-present', 'verified-absent', 'not-used-small-monster'].includes(record.roar?.status),
        audio: record.roar?.status !== 'verified-present'
            || String(record.roar?.audioStatus || '').startsWith('verified')
    };
}

function plan({ policy, roster, audit, release }) {
    const released = new Set(release.records.map(record => record.id));
    const auditById = new Map(audit.records.map(record => [record.id, record]));
    const waveRank = new Map(policy.firstWorldWave.map((id, index) => [id, index]));
    const candidates = roster
        .filter(monster => monster.selectable !== false && !released.has(monster.id))
        .map(monster => {
            const edition = canonicalEdition(monster, policy.editionOrder);
            return {
                id: monster.id,
                nameKO: monster.nameKO,
                nameEN: monster.nameEN,
                tier: monster.tier,
                edition,
                variantOf: monster.variantOf ? normalize(monster.variantOf) : null,
                sourceIds: monster.sourceIds || {},
                readiness: readiness(auditById.get(monster.id))
            };
        });
    const editionRank = new Map(policy.editionOrder.map((edition, index) => [edition, index]));
    candidates.sort((a, b) => {
        const editionDelta = editionRank.get(a.edition) - editionRank.get(b.edition);
        if (editionDelta) return editionDelta;
        const aWave = waveRank.has(a.id) ? waveRank.get(a.id) : Number.MAX_SAFE_INTEGER;
        const bWave = waveRank.has(b.id) ? waveRank.get(b.id) : Number.MAX_SAFE_INTEGER;
        if (aWave !== bWave) return aWave - bWave;
        if (Boolean(a.variantOf) !== Boolean(b.variantOf)) return a.variantOf ? 1 : -1;
        return a.id.localeCompare(b.id);
    });

    const batches = [];
    for (const edition of policy.editionOrder) {
        const editionCandidates = candidates.filter(candidate => candidate.edition === edition);
        for (let offset = 0; offset < editionCandidates.length; offset += policy.batchSize) {
            batches.push({
                id: `${edition}-batch-${String((offset / policy.batchSize) + 1).padStart(2, '0')}`,
                edition,
                status: 'queued',
                monsters: editionCandidates.slice(offset, offset + policy.batchSize)
            });
        }
    }
    return {
        schemaVersion: policy.schemaVersion,
        policy: {
            editionOrder: policy.editionOrder,
            batchSize: policy.batchSize,
            researchLanguages: policy.researchLanguages,
            releaseGates: policy.releaseGates
        },
        summary: {
            released: released.size,
            queued: candidates.length,
            batches: batches.length,
            byEdition: Object.fromEntries(policy.editionOrder.map(edition => [
                edition,
                candidates.filter(candidate => candidate.edition === edition).length
            ]))
        },
        nextBatch: batches[0] || null,
        batches
    };
}

function main(args = process.argv.slice(2)) {
    const output = plan({
        policy: readJson(POLICY_PATH),
        roster: readJson(ROSTER_PATH),
        audit: readJson(AUDIT_PATH),
        release: readJson(RELEASE_PATH)
    });
    const text = `${JSON.stringify(output, null, 2)}\n`;
    if (args.includes('--check')) {
        if (!fs.existsSync(OUTPUT_PATH) || fs.readFileSync(OUTPUT_PATH, 'utf8') !== text) {
            throw new Error('stale monster review backlog; run node scripts/plan-monster-review-batches.js');
        }
    } else {
        fs.writeFileSync(OUTPUT_PATH, text, 'utf8');
    }
    console.log(`[monster-review] ${output.summary.queued} queued in ${output.summary.batches} batches; next=${output.nextBatch?.id || 'none'}`);
    return output;
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(`[monster-review] ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { canonicalEdition, readiness, plan, main };
