class HuntMotionValueCatalog {
    static normalize(value) {
        return String(value || '').toLowerCase().replace(/\blv\s*\d+\b/g, '').replace(/\b[ivx]+\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    }

    static actionTokens(action) {
        return String(action?.id || '').split('.').slice(1).join('_').split(/[_\s]+/).filter(token => token.length > 1 && !/^\d+$/.test(token));
    }

    static score(action, candidate) {
        const normalized = this.normalize(candidate?.name);
        const tokens = this.actionTokens(action);
        if (!tokens.length || !normalized) return 0;
        const matches = tokens.filter(token => normalized.includes(token)).length;
        return matches / tokens.length;
    }

    static resolve(weaponId, action, data = null) {
        const source = data || (typeof HUNT_WILDS_MOTION_VALUES !== 'undefined' ? HUNT_WILDS_MOTION_VALUES : null);
        const candidates = source?.weapons?.[weaponId] || [];
        if (!candidates.length) return null;
        const ranked = candidates.map(candidate => ({ candidate, score: this.score(action, candidate) }))
            .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name));
        const best = ranked[0];
        return best && best.score >= 0.66 ? { ...best.candidate, matchScore: best.score } : null;
    }

    static runtimeTiming(action, timingData = null) {
        const source = timingData || (typeof HUNT_WILDS_RUNTIME_MOTION_TIMINGS !== 'undefined' ? HUNT_WILDS_RUNTIME_MOTION_TIMINGS : null);
        const timing = source?.actions?.[action?.id];
        return timing && Number(timing.seconds) > 0 ? timing : null;
    }

    static motionValueTiming(action, reference = null) {
        if (Number(action?.motionValue) === 0 || action?.tags?.includes('preparation')) return null;
        // Keep a stronger authored multi-hit total when the fuzzy sheet match
        // lands on one unavailable/partial level row (notably True Charged Slash).
        const motionValue = Math.max(Number(reference?.motionValueTotal || 0), Number(action?.motionValue || 0));
        if (!(motionValue > 0)) return null;
        // Authoring-scale cadence proxy: tiny hits remain quick, while a TCS-class
        // motion value (~190) occupies a complete budget. HuntAtbConfig converts
        // this stable five-second authoring scale to the current live duration.
        const ticks = Math.max(5, Math.min(50, Math.round(2 + motionValue * 0.25)));
        return {
            seconds: ticks / 10,
            ticks,
            motionValue,
            semanticEvidence: 'design-assumption:motion-time-proportional-to-motion-value',
            timingEvidence: 'motion-value-proxy'
        };
    }

    static enrich(weaponId, action, data = null, timingData = null) {
        const reference = this.resolve(weaponId, action, data);
        const measured = this.runtimeTiming(action, timingData);
        const proxy = measured ? null : this.motionValueTiming(action, reference);
        if (!reference) return {
            ...action,
            motionValueEvidence: action.motionValueEvidence || 'legacy-unverified',
            motionTimeSeconds: Number(measured?.seconds || proxy?.seconds || action.motionTimeSeconds) || null,
            timingEvidence: measured
                ? `${measured.semanticEvidence}+${measured.timingEvidence}`
                : (proxy ? `${proxy.semanticEvidence}+${proxy.timingEvidence}` : (action.timingEvidence || 'authored-preparation-timing')),
            motionTimingReference: measured || proxy || undefined
        };
        const timingVerified = measured || (Number(reference.motionTimeSeconds) > 0 && reference.timingEvidence !== 'unresolved');
        return {
            ...action,
            motionValue: reference.motionValueTotal,
            motionValueHits: reference.motionValueHits,
            motionValueReference: reference.name,
            motionValueEvidence: 'wilds-1.040-community-sheet',
            sourceGame: 'wilds',
            sourceVersion: '1.040.0',
            motionTimeSeconds: measured ? Number(measured.seconds) : (timingVerified ? Number(reference.motionTimeSeconds) : Number(proxy?.seconds) || null),
            timingEvidence: measured
                ? `${measured.semanticEvidence}+${measured.timingEvidence}`
                : (timingVerified ? reference.timingEvidence : (proxy ? `${proxy.semanticEvidence}+${proxy.timingEvidence}` : 'authored-preparation-timing')),
            motionTimingReference: measured || proxy || undefined
        };
    }

    static timingFor(weaponId, action, fallback) {
        const seconds = Number(action?.motionTimeSeconds);
        if (!(seconds > 0)) return { ...fallback, atbOccupancyTicks: fallback.durationTicks, timingEvidence: action?.timingEvidence || 'estimated' };
        const total = Math.max(3, Math.round(seconds * 10));
        const windupRatio = action.tags?.includes('charge') ? 0.5 : 0.32;
        const windupTicks = Math.max(1, Math.round(total * windupRatio));
        const activeTicks = Math.max(1, Math.round(total * 0.18));
        const recoveryTicks = Math.max(1, total - windupTicks - activeTicks);
        return { windupTicks, activeTicks, recoveryTicks, durationTicks: total, atbOccupancyTicks: total, timingEvidence: action.timingEvidence };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMotionValueCatalog;
else window.HuntMotionValueCatalog = HuntMotionValueCatalog;
