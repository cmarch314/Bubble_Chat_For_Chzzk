'use strict';

const BEAT_V2_CONTRACT = globalThis.HuntBeatV2Contract
    || (typeof module !== 'undefined' && module.exports
        ? require('./HuntBeatV2Contract.js').HuntBeatV2Contract
        : null);

class HuntBeatV2Adapter {
    static fromMonsterPattern(pattern = {}, options = {}) {
        if (!BEAT_V2_CONTRACT) throw new Error('HuntBeatV2Contract is unavailable');
        if (!Array.isArray(pattern.motion) || !pattern.motion.length) {
            throw new Error(`${pattern.id || 'monster-pattern'} has no authored motion beats`);
        }
        const hasJudgments = pattern.motion.some(beat => Array.isArray(beat?.judgments) && beat.judgments.length);
        // An editor draft changes visual BEAT durations, then recompiles the
        // graph.  Preserve authored non-judgment gameplay events while doing
        // so: projectile launch/finish is not a damage judgment and used to
        // disappear from that round trip, leaving a valid HIT with no visible
        // fireball.  Ownership remains the original beat id; the current beat
        // duration only clamps its local offset.
        const sourceEventsByBeat = new Map();
        for (const event of pattern?.beatV2?.events || []) {
            if (!event?.beatId || ['audio', 'damage', 'judgment', 'roar', 'tremor', 'wind'].includes(event.kind)) continue;
            const beatId = String(event.beatId);
            sourceEventsByBeat.set(beatId, [...(sourceEventsByBeat.get(beatId) || []), event]);
        }
        const impactEventsByBeat = hasJudgments ? new Map() : this.#legacyImpactsByBeat(pattern);
        const beats = pattern.motion.map((beat, beatIndex) => {
            const ticks = Math.max(1, Math.round(Number(beat?.ticks) || 1));
            const events = [];
            for (const [judgmentIndex, judgment] of (beat.judgments || []).entries()) {
                const kind = String(judgment.kind || 'damage');
                events.push({
                    ...judgment,
                    id: String(judgment.id || `${pattern.id}:${beat.beat}:${kind}:${judgmentIndex + 1}`),
                    kind,
                    offsetTicks: Math.max(0, Math.min(ticks - 1, Math.round(Number(judgment.offsetTicks) || 0)))
                });
            }
            if (!hasJudgments && beat.hit && !(impactEventsByBeat.get(beatIndex) || []).length) {
                events.push({
                    id: `${pattern.id}:${beat.beat}:damage`,
                    kind: 'damage',
                    target: beat.targetMode || 'primary',
                    damageScale: Number(beat.damageScale ?? 1),
                    offsetTicks: Math.max(0, Math.min(ticks - 1,
                        Math.round(Number(beat.hitOffsetTicks) || 0)))
                });
            }
            for (const event of impactEventsByBeat.get(beatIndex) || []) events.push(event);
            for (const sourceEvent of sourceEventsByBeat.get(String(beat.beat || `beat-${beatIndex + 1}`)) || []) {
                if (events.some(event => String(event.id) === String(sourceEvent.id))) continue;
                events.push({
                    ...sourceEvent,
                    offsetTicks: Math.max(0, Math.min(ticks - 1,
                        Math.round(Number(sourceEvent.offsetTicks) || 0)))
                });
            }
            // Every authored beat is an assignable audio moment in the editor.
            // Emitting a silent-by-default event keeps preview and live routing
            // identical even when the original motion did not carry an `sfx`
            // hint. The route owner decides whether a clip exists.
            events.push({
                id: `${pattern.id}:${beat.beat}:audio`,
                kind: 'audio',
                slot: String(beat.sfx || beat.beat || `beat-${beatIndex + 1}`),
                offsetTicks: Math.max(0, Math.min(ticks - 1,
                    Math.round(Number(beat.sfxOffsetTicks) || 0)))
            });
            return {
                id: String(beat.beat || `beat-${beatIndex + 1}`),
                ticks,
                events,
                tracks: {
                    visual: [{ offsetTicks: 0, value: this.#visualFrame(beat) }]
                }
            };
        });
        return BEAT_V2_CONTRACT.compile({
            schemaVersion: 2,
            backend: 'beat-v2',
            reviewStatus: String(options.reviewStatus || 'migrated'),
            id: String(pattern.id || ''),
            actor: 'monster',
            source: Object.freeze({ kind: 'monster-pattern', monsterId: options.monsterId || null }),
            atb: {
                cost: Number(pattern.atbCost || pattern.atb?.cost || 0),
                recovery: pattern.atb?.recovery || 'during-action',
                gateUntil: 'complete'
            },
            beats
        });
    }

    static gameplayEventTicks(compiledAction = {}) {
        const groups = new Map();
        for (const event of compiledAction.events || []) {
            if (!['damage', 'roar', 'tremor', 'wind'].includes(event.kind)) continue;
            const group = String(event.group || event.id);
            groups.set(group, Math.min(groups.get(group) ?? Infinity, event.atTicks));
        }
        return [...groups.values()].sort((left, right) => left - right);
    }

    static #legacyImpactsByBeat(pattern) {
        const result = new Map();
        const boundaries = [];
        let elapsed = 0;
        pattern.motion.forEach((beat, index) => {
            const ticks = Math.max(1, Math.round(Number(beat?.ticks) || 1));
            boundaries.push({ index, start: elapsed, end: elapsed + ticks, ticks });
            elapsed += ticks;
        });
        (pattern.impactTimeline || []).forEach((impact, impactIndex) => {
            const atTicks = Math.max(0, Math.round(Number(impact?.atTicks ?? impact) || 0));
            const owner = boundaries.find(item => atTicks >= item.start && atTicks < item.end)
                || boundaries[boundaries.length - 1];
            if (!owner) return;
            const events = result.get(owner.index) || [];
            events.push({
                ...(typeof impact === 'object' ? impact : {}),
                id: `${pattern.id}:legacy-impact:${impactIndex + 1}`,
                kind: impact?.secondaryInterference?.kind || 'damage',
                offsetTicks: Math.max(0, Math.min(owner.ticks - 1, atTicks - owner.start)),
                migrationSource: 'impactTimeline'
            });
            result.set(owner.index, events);
        });
        return result;
    }

    static #visualFrame(beat) {
        const ignored = new Set(['beat', 'ticks', 'judgments', 'sfx', 'sfxOffsetTicks']);
        return Object.fromEntries(Object.entries(beat || {}).filter(([key]) => !ignored.has(key)));
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntBeatV2Adapter;
else window.HuntBeatV2Adapter = HuntBeatV2Adapter;
