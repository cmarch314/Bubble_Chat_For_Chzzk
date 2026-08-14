'use strict';

// Native candidate kits are intentionally outside the released catalog.  They
// are the first authoring surface for a clean BEAT rebuild: no legacy motion
// object is accepted as input, and no candidate can replace a released action
// until the kit release compiler performs an explicit atomic promotion.
const CANDIDATE_CONTRACT = globalThis.HuntBeatV2Contract
    || (typeof module !== 'undefined' && module.exports
        ? require('./HuntBeatV2Contract.js').HuntBeatV2Contract
        : null);
const ROTATION_CONTRACT = globalThis.HuntRotationContract
    || (typeof module !== 'undefined' && module.exports
        ? require('./HuntRotationContract.js')
        : null);

class HuntMonsterCandidateCatalog {
    static compileKit(rawKit = {}) {
        if (!CANDIDATE_CONTRACT) throw new Error('HuntBeatV2Contract is unavailable');
        if (!ROTATION_CONTRACT) throw new Error('HuntRotationContract is unavailable');
        const monsterId = String(rawKit.monsterId || '').trim();
        if (!monsterId) throw new Error('candidate monsterId is required');
        if (rawKit.schemaVersion !== 1) throw new Error(`${monsterId}: unsupported candidate schemaVersion`);
        if (rawKit.status !== 'candidate') throw new Error(`${monsterId}: candidate status is required`);
        if (!Array.isArray(rawKit.actions) || !rawKit.actions.length) {
            throw new Error(`${monsterId}: at least one candidate action is required`);
        }
        const ids = new Set();
        const actions = rawKit.actions.map(rawAction => {
            const id = String(rawAction?.id || '').trim();
            if (!id || !id.startsWith(`${monsterId}.`)) throw new Error(`${monsterId}: invalid candidate action id`);
            if (ids.has(id)) throw new Error(`${monsterId}: duplicate candidate action ${id}`);
            ids.add(id);
            if (!rawAction?.graph || typeof rawAction.graph !== 'object') {
                throw new Error(`${id}: native graph is required`);
            }
            for (const [beatIndex, beat] of rawAction.graph.beats.entries()) {
                for (const [frameIndex, frame] of (beat.tracks?.visual || []).entries()) {
                    const legacy = ROTATION_CONTRACT.LEGACY_FIELDS
                        .filter(field => frame?.value?.[field] !== undefined);
                    if (legacy.length) {
                        throw new Error(`${id}.beats[${beatIndex}].tracks.visual[${frameIndex}]: `
                            + `legacy rotation fields are forbidden: ${legacy.join(', ')}`);
                    }
                }
            }
            const graphSource = {
                ...rawAction.graph,
                beats: rawAction.graph.beats.map(rawBeat => ({
                    ...rawBeat,
                    tracks: Object.fromEntries(Object.entries(rawBeat.tracks || {}).map(([track, frames]) => [
                        track,
                        track === 'visual' && Array.isArray(frames)
                            ? frames.map(frame => ({ ...frame,
                                value: ROTATION_CONTRACT.canonicalize(frame?.value || {}) }))
                            : frames
                    ]))
                }))
            };
            const graph = CANDIDATE_CONTRACT.compile({
                ...graphSource,
                id,
                actor: 'monster',
                source: { kind: 'monster-candidate', monsterId }
            });
            if (graph.reviewStatus === 'approved') {
                throw new Error(`${id}: candidates must remain draft or migrated until atomic promotion`);
            }
            return Object.freeze({
                id,
                name: String(rawAction.name || id),
                type: String(rawAction.type || 'physical'),
                tags: Object.freeze([...(rawAction.tags || [])]),
                damageRatio: Math.max(0, Number(rawAction.damageRatio || 0)),
                minTargets: Math.max(0, Number(rawAction.minTargets ?? 1)),
                maxTargets: Math.max(0, Number(rawAction.maxTargets ?? rawAction.minTargets ?? 1)),
                targeting: rawAction.targeting ? Object.freeze({ ...rawAction.targeting }) : null,
                atbCost: Math.max(0, Number(rawAction.atbCost ?? graph.atb.cost ?? 0)),
                flightTransition: rawAction.flightTransition === 'takeoff' || rawAction.flightTransition === 'land'
                    ? rawAction.flightTransition : null,
                reviewStatus: graph.reviewStatus,
                beatV2Enabled: true,
                beatV2Approved: false,
                nativeBeatCandidate: true,
                beatV2: graph,
                // This is a renderer projection, not a second authored
                // timeline.  The graph remains the only source of ticks,
                // events and audio slots.
                motion: this.#projectVisualMotion(graph),
                movement: Object.freeze({ ticks: graph.totalTicks }),
                animationDurationMs: graph.totalTicks * 100
            });
        });
        return Object.freeze({ monsterId, status: rawKit.status, actions: Object.freeze(actions) });
    }

    static compileAll(rawKits = {}) {
        const output = {};
        for (const kit of Array.isArray(rawKits) ? rawKits : Object.values(rawKits || {})) {
            const compiled = this.compileKit(kit);
            output[compiled.monsterId] = compiled;
        }
        return Object.freeze(output);
    }

    static forMonster(monsterId, rawKits = globalThis.HUNT_MONSTER_CANDIDATE_KITS) {
        const kit = (rawKits || {})[String(monsterId || '')];
        if (!kit) return [];
        return this.compileKit(kit).actions;
    }

    static #projectVisualMotion(graph) {
        return graph.beats.map(beat => {
            const frames = beat.tracks?.visual || [];
            const partFxFrames = beat.tracks?.partFx || [];
            const visual = frames.length ? frames[frames.length - 1].value || {} : {};
            const partFx = partFxFrames.length ? partFxFrames.at(-1).value : null;
            return Object.freeze({ beat: beat.id, ticks: beat.ticks, ...visual,
                ...(Array.isArray(partFx) && partFx.length ? { partFx } : {}) });
        });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterCandidateCatalog;
else window.HuntMonsterCandidateCatalog = HuntMonsterCandidateCatalog;
