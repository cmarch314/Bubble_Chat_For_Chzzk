'use strict';

// Seeds data/hunt/monster-pattern-audio-routes.json from the user's auditioned
// event labels (data/hunt/world-monster-audio-review-labels.json) by matching
// each canonical audio phase slot (see monster-audio-phase-standard.md) to the
// semantic tag a reviewer already confirmed for that monster's World banks.
//
// This is "as far as the auditioned data allows": slots whose phase has no
// matching tagged sound are left as fallback. Re-running is idempotent.
//
//   node scripts/apply-monster-pattern-audio-from-labels.js [huntId ...] [--dry]

const fs = require('fs');
const path = require('path');
const { huntToGraphId, savePatternRoute, loadHuntPatternAudioMap } = require('../tools/hunt-audio-pattern-map.js');

const ROOT = path.resolve(__dirname, '..');
const LABELS = path.join(ROOT, 'data', 'hunt', 'world-monster-audio-review-labels.json');
const MONSTER_AUDIO = path.join(ROOT, 'local_assets', 'monster_hunter', 'world', 'monster');

const DEFAULT_MONSTERS = ['rathian', 'rathalos', 'bazelgeuse', 'legiana'];

// Per-phase gain defaults (VO sits a touch lower than contact SE).
const PHASE_GAIN = { telegraph: 0.7, start: 0.72, launch: 0.75, impact: 0.85, recovery: 0.6 };

// Conservative candidate tags per slot. Only maps sounds we are confident are
// both correct and distinct — the user's complaint was wrong/repetitive audio,
// so generic physical telegraph/start (a single reused grunt) is intentionally
// left as fallback. `seOnly` slots must resolve to a contact SE, never a vocal.
function tagsForSlot(slot, pattern) {
    const tags = new Set(pattern.tags || []);
    const id = String(pattern.id || '');
    const isBreath = pattern.type === 'projectile' || tags.has('projectile') || tags.has('elemental')
        || /breath|fireball|frost|ice|wind|beam/i.test(id) || Boolean(pattern.delivery);
    const isSomersault = /somersault/.test(id) || tags.has('somersault');
    const isBite = /bite/.test(id) || tags.has('bite');
    switch (slot.phase) {
        case 'telegraph':
            if (isSomersault) return { tags: ['somersault_vocal'], layer: 'vo' };
            if (isBreath) return { tags: ['breath_charge'], layer: 'vo' };
            return { tags: [] };
        case 'start':
            if (isBite) return { tags: ['bite_vocal'], layer: 'vo' };
            return { tags: [] };
        case 'launch':
            if (isBreath) return { tags: ['breath_shot', 'breath'], layer: 'se' };
            return { tags: [] };
        case 'impact':
            if (isBreath) return { tags: ['breath_impact'], layer: 'se' };
            return { tags: ['physical_impact', 'physical_attack'], layer: 'se' };
        case 'recovery':
            if (isBreath) return { tags: ['ground_fire'], layer: 'se' };
            return { tags: [] };
        default:
            return { tags: [] }; // roar / burrow / travel: owned elsewhere
    }
}

// Index every mp3 in a monster folder by "<bank>::<sourceId>" so a label record
// (bank + sourceId) resolves to its repo-relative path.
function indexFiles(graphId) {
    const dir = path.join(MONSTER_AUDIO, graphId);
    const index = new Map();
    let files = [];
    try { files = fs.readdirSync(dir); } catch { return index; }
    for (const file of files) {
        const match = /^(em\d+(?:_\d+)?_(?:vo|se))_.*_(\d+)\.mp3$/i.exec(file);
        if (!match) continue;
        index.set(`${match[1]}::${match[2]}`, `local_assets/monster_hunter/world/monster/${graphId}/${file}`);
    }
    return index;
}

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry');
    const monsters = args.filter(arg => !arg.startsWith('--'));
    const targets = monsters.length ? monsters : DEFAULT_MONSTERS;

    const labels = JSON.parse(fs.readFileSync(LABELS, 'utf8'));
    const huntGraph = huntToGraphId();

    for (const huntId of targets) {
        const graphId = huntGraph[huntId];
        if (!graphId) { console.log(`- ${huntId}: no World bank mapping, skipped`); continue; }
        const bankVo = `${graphId}_vo`;
        const bankSe = `${graphId}_se`;
        const fileIndex = indexFiles(graphId);
        // Reference (canonical) records for this monster's own banks, indexed by tag.
        const byTag = new Map();
        for (const record of labels.records || []) {
            if (record.bank !== bankVo && record.bank !== bankSe) continue;
            const filePath = fileIndex.get(`${record.bank}::${record.sourceId}`);
            if (!filePath) continue;
            for (const tag of record.tags || []) {
                if (!byTag.has(tag)) byTag.set(tag, []);
                byTag.get(tag).push({ ...record, filePath });
            }
        }
        const pickForTag = (tag, preferLayer) => {
            const pool = byTag.get(tag);
            if (!pool || !pool.length) return null;
            const layered = preferLayer
                ? pool.filter(record => record.filePath.includes(`_${preferLayer}_`))
                : pool;
            // seOnly slots must not fall back to a vocal clip.
            const usable = layered.length ? layered : (preferLayer === 'se' ? [] : pool);
            if (!usable.length) return null;
            return (usable.find(record => record.reference) || usable[0]).filePath;
        };

        const map = loadHuntPatternAudioMap(huntId);
        let applied = 0;
        const lines = [];
        for (const pattern of map.patterns) {
            const usedInPattern = new Set();
            for (const slot of pattern.slots) {
                if (slot.assigned) continue; // never overwrite a manual assignment
                const { tags: candidates, layer } = tagsForSlot(slot, pattern);
                let file = null;
                let via = null;
                for (const tag of candidates) {
                    const resolved = pickForTag(tag, layer);
                    if (resolved && !usedInPattern.has(resolved)) { file = resolved; via = tag; break; }
                }
                if (!file) continue;
                usedInPattern.add(file);
                if (!dryRun) {
                    savePatternRoute({
                        huntId, patternId: pattern.id, slot: slot.slot,
                        files: [file], gain: PHASE_GAIN[slot.phase] || 0.7,
                        label: `${pattern.name} · ${slot.label} (auditioned:${via})`
                    });
                }
                applied += 1;
                lines.push(`    ${pattern.id} [${slot.slot}] ← ${via} · ${file.split('/').pop()}`);
            }
        }
        console.log(`\n# ${huntId} (${graphId}) — ${applied} slot(s) ${dryRun ? 'mappable' : 'mapped'}`);
        for (const line of lines) console.log(line);
    }
    console.log(dryRun ? '\n(dry run — nothing written)' : '\nDone.');
}

if (require.main === module) main();
module.exports = { tagsForSlot, indexFiles };
