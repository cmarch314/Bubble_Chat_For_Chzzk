'use strict';

/**
 * Promotes reviewed native graphs into the regular monster catalog.  No
 * motion adapter or second timer is created here; the resulting pattern keeps
 * one compiled BEAT graph for both Preview and live combat.
 */
class HuntMonsterNativeBeatCatalog {
    static apply(patterns = [], scope = typeof window !== 'undefined' ? window : globalThis) {
        const graphs = scope.HUNT_NATIVE_BEAT_GRAPHS
            || (typeof require === 'function' ? require('./data/NativeMonsterBeatGraphs.generated.js') : {});
        const Contract = scope.HuntBeatV2Contract
            || (typeof require === 'function' ? require('./HuntBeatV2Contract.js').HuntBeatV2Contract : null);
        if (!Contract) throw new Error('HuntBeatV2Contract is required for native monster graphs');
        return (patterns || []).map(pattern => {
            const source = graphs[pattern?.id?.split('.')?.[0]]?.[pattern?.id];
            if (!source) return pattern;
            const graph = Contract.compile({ ...source, id: pattern.id, actor: 'monster' });
            const firstBeat = graph.beats[0];
            const lastBeat = graph.beats.at(-1);
            const promoted = {
                ...pattern,
                beatV2: graph,
                beatV2Enabled: true,
                beatV2Approved: true,
                nativeBeatSource: 'reviewed-candidate-promotion',
                runtimeMotionBackend: 'beat-v2',
                motion: [],
                runtimeTimingBeats: null,
                runtimeSourceTimingBeats: null,
                movement: { ...(pattern.movement || {}), ticks: graph.totalTicks },
                animationDurationMs: graph.totalTicks * 100,
                windupTicks: firstBeat?.ticks || 1,
                recoveryTicks: lastBeat?.ticks || 1,
                // Compatibility projection for catalog/audit consumers. It
                // is derived from the graph and never owns runtime timing.
                impactTimeline: graph.events
                    .filter(event => ['damage', 'judgment', 'roar', 'tremor', 'wind'].includes(event.kind))
                    .map(event => ({ atTicks: event.atTicks, target: event.target,
                        ...(event.damagePercent != null ? { damageScale: Number(event.damagePercent) / 100 } : {}) }))
            };
            // Tombstone legacy timing owners that could still be consumed by
            // a renderer. `impactTimeline` above is a derived audit
            // projection only; the graph remains the sole runtime clock.
            ['runtimeResolvedImpactTimeline', 'animationProfile', 'profileMotion']
                .forEach(field => delete promoted[field]);
            return promoted;
        });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterNativeBeatCatalog;
else globalThis.HuntMonsterNativeBeatCatalog = HuntMonsterNativeBeatCatalog;
