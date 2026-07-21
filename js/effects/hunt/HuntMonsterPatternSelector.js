class HuntMonsterPatternSelector {
    constructor(random = Math.random) {
        this.random = random;
        this.lastPatternByMonster = new Map();
        this.cooldowns = new Map();
        this.enragedTurnsWithoutUltimate = new Map();
    }

    tick() {
        for (const [key, value] of this.cooldowns.entries()) {
            if (value <= 1) this.cooldowns.delete(key);
            else this.cooldowns.set(key, value - 1);
        }
    }

    select(monster, patterns, context = {}) {
        if (!patterns || !patterns.length) return null;
        const monsterId = monster.id || 'default';
        const lastId = this.lastPatternByMonster.get(monsterId);
        const isAllowed = pattern => context.monsterTier !== 'small'
            || (pattern.type !== 'roar' && !pattern.tags?.includes('roar'));
        let candidates = patterns.filter(pattern =>
            isAllowed(pattern)
            &&
            !this.cooldowns.has(`${monsterId}:${pattern.id}`)
            && (!pattern.requiredState || pattern.requiredState === context.state)
            && (pattern.maxHpRatio === undefined || context.hpRatio <= pattern.maxHpRatio)
            && (context.flightState === 'airborne'
                ? (pattern.tags.includes('flight-only') || pattern.tags.includes('air-compatible'))
                : !pattern.tags.includes('flight-only'))
        );
        if (!candidates.length) candidates = patterns.filter(pattern =>
            isAllowed(pattern)
            && (!pattern.requiredState || pattern.requiredState === context.state)
            && (pattern.maxHpRatio === undefined || context.hpRatio <= pattern.maxHpRatio)
            && (context.flightState === 'airborne'
                ? (pattern.tags.includes('flight-only') || pattern.tags.includes('air-compatible'))
                : !pattern.tags.includes('flight-only'))
        );
        if (!candidates.length) return null;
        if (context.state === 'enraged' && context.ultimateUsedInRage) {
            const nonUltimate = candidates.filter(pattern => !pattern.tags.includes('ultimate') && pattern.type !== 'ultimate');
            if (nonUltimate.length) candidates = nonUltimate;
        }
        const withoutRepeat = candidates.filter(pattern => pattern.id !== lastId);
        if (withoutRepeat.length) candidates = withoutRepeat;
        if (context.state !== 'enraged') {
            this.enragedTurnsWithoutUltimate.set(monsterId, 0);
            const nonUltimate = candidates.filter(pattern => !pattern.tags.includes('ultimate'));
            if (nonUltimate.length) candidates = nonUltimate;
        }
        if (context.flightState === 'airborne') {
            const aerial = candidates.filter(pattern => pattern.tags.includes('flight-only') || pattern.tags.includes('air-compatible'));
            if (aerial.length) candidates = aerial;
        }
        const ultimateCandidates = context.ultimateUsedInRage
            ? []
            : candidates.filter(pattern => pattern.tags.includes('ultimate'));
        const missedUltimates = Number(this.enragedTurnsWithoutUltimate.get(monsterId) || 0);
        if (context.state === 'enraged' && ultimateCandidates.length && missedUltimates >= 4) {
            candidates = ultimateCandidates;
        }
        const weighted = candidates.map(pattern => ({
            pattern,
            weight: Math.max(0.05, Number(pattern.weight || 1)
                * (context.state === 'enraged' && pattern.tags.includes('ultimate') ? 3 : 1)
                * (context.state === 'exhausted' && pattern.tags.includes('charge') ? 0.45 : 1))
        }));
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = this.random() * total;
        let selected = weighted[weighted.length - 1].pattern;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) { selected = entry.pattern; break; }
        }
        this.lastPatternByMonster.set(monsterId, selected.id);
        if (context.state === 'enraged') {
            this.enragedTurnsWithoutUltimate.set(monsterId,
                selected.tags.includes('ultimate') ? 0 : missedUltimates + 1);
        }
        this.cooldowns.set(`${monsterId}:${selected.id}`, Number(selected.cooldownTicks || 1));
        return selected;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterPatternSelector;
else window.HuntMonsterPatternSelector = HuntMonsterPatternSelector;
