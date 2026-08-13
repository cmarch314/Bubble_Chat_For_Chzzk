'use strict';

const fs = require('fs');
const path = require('path');
const { loadHuntPatternAudioMap } = require('../tools/hunt-audio-pattern-map.js');

const ROOT = path.resolve(__dirname, '..');
const labelsPath = path.join(ROOT, 'data/hunt/world-monster-audio-review-labels.json');
const overridesPath = path.join(ROOT, 'data/hunt/monster-pattern-motion-overrides.json');
const labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
const document = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
document.overrides ||= {};

// This one-time importer creates timing/keyframe BEAT graphs. Extracted
// keyframes remain distinct from authored BEAT choreography.
let adapted = 0, preserved = 0, repaired = 0, authored = 0, empty = 0;
for (const monsterId of labels.runtimePolicy?.completedMonsterIds || []) {
    const map = loadHuntPatternAudioMap(monsterId);
    if (!map.patterns.length) { empty += 1; continue; }
    for (const pattern of map.patterns) {
        if (pattern.timeline?.source === 'beat-motion') { authored += 1; continue; }
        const existing = document.overrides[monsterId]?.[pattern.id];
        if (existing?.beats && Object.keys(existing.beats).length) {
            const entries = Object.entries(existing.beats);
            if (entries.some(([key]) => /^action-\d+$/.test(key) || /^impact-\d+$/.test(key))) {
                preserved += 1;
                continue;
            }
            let actionIndex = 0, impactIndex = 0;
            existing.beats = Object.fromEntries(entries.map(([key, value]) => {
                const hit = /^impact/.test(key) || value?.hit;
                const canonical = hit ? `impact-${++impactIndex}`
                    : key === 'telegraph' ? 'telegraph' : `action-${++actionIndex}`;
                return [canonical, value];
            }));
            repaired += 1;
            continue;
        }
        let actionIndex = 0, impactIndex = 0;
        const beats = Object.fromEntries((pattern.timeline?.beats || []).map(beat => [
            beat.hit ? `impact-${++impactIndex}`
                : beat.id === 'telegraph' ? 'telegraph' : `action-${++actionIndex}`, {
            ticks: Math.max(1, Math.round(Number(beat.ticks) || 1))
        }]));
        if (!Object.keys(beats).length) continue;
        document.overrides[monsterId] ||= {};
        document.overrides[monsterId][pattern.id] = { beats };
        adapted += 1;
    }
}

document.version = Math.max(1, Number(document.version) || 1);
document.updatedAt = new Date().toISOString();
const temporaryPath = `${overridesPath}.tmp`;
fs.writeFileSync(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
fs.renameSync(temporaryPath, overridesPath);
console.log(`[motion-graph] keyframe-beat=${adapted} preserved=${preserved} repaired=${repaired} `
    + `authored=${authored} empty-completed=${empty}`);
