'use strict';

const fs = require('fs');
const path = require('path');
const { loadHuntPatternAudioMap } = require('../tools/hunt-audio-pattern-map.js');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'data', 'hunt', 'monster-pattern-motion-overrides.json');

function migrate({ write = false } = {}) {
    const document = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
    let migratedHits = 0, migratedEffects = 0, normalized = 0;
    for (const [monsterId, patterns] of Object.entries(document.overrides || {})) {
        const runtimePatterns = new Map(loadHuntPatternAudioMap(monsterId).patterns
            .map(pattern => [pattern.id, pattern]));
        for (const [patternId, override] of Object.entries(patterns || {})) {
            const pattern = runtimePatterns.get(patternId) || {};
            const seenJudgments = new Set();
            for (const [beatId, beat] of Object.entries(override.beats || {})) {
                if (!beat || typeof beat !== 'object') continue;
                const judgments = Array.isArray(beat.judgments) ? [...beat.judgments] : [];
                if (beat.hit === true && !judgments.some(item => item.kind === 'damage')) {
                    judgments.push({ id: `${beatId}-damage`, group: `${beatId}-impact`, kind: 'damage',
                        target: 'primary', offsetTicks: Math.max(0, Number(beat.hitOffsetTicks) || 0),
                        damagePercent: Math.max(0, Number(pattern.damageRatio || 0) * 100
                            * Number(beat.damageScale ?? 1)) });
                    migratedHits += 1;
                }
                for (const [kind, offsetTicks] of Object.entries(beat.judgmentOffsets || {})) {
                    if (judgments.some(item => item.kind === kind)) continue;
                    judgments.push({ id: `${beatId}-${kind}`, group: `${beatId}-impact`, kind,
                        target: 'all', offsetTicks: Math.max(0, Number(offsetTicks) || 0),
                        size: String(pattern.interference?.size || pattern.secondaryInterference?.size || 'large') });
                    migratedEffects += 1;
                }
                if (!judgments.length) continue;
                beat.judgments = judgments.filter(judgment => {
                    const key = String(judgment?.id || judgment?.group || '');
                    if (!key || seenJudgments.has(key)) return false;
                    seenJudgments.add(key);
                    return true;
                });
                beat.hit = false;
                delete beat.hitOffsetTicks;
                delete beat.judgmentOffsets;
                normalized += 1;
            }
        }
    }
    if (write) {
        document.updatedAt = new Date().toISOString();
        const temporary = `${SOURCE}.tmp`;
        fs.writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
        fs.renameSync(temporary, SOURCE);
        require('./generate-monster-pattern-motion-overrides.js').generate();
    }
    return { migratedHits, migratedEffects, normalized };
}

if (require.main === module) console.log(migrate({ write: process.argv.includes('--write') }));
module.exports = { migrate };
