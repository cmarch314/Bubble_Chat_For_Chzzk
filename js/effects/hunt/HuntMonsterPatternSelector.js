class HuntMonsterPatternSelector {
    constructor(random = Math.random) {
        this.random = random;
        this.lastPatternByMonster = new Map();
        this.consecutiveUsesByMonster = new Map();
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
        const isRoarPattern = pattern =>
            pattern.type === 'roar' || pattern.tags?.includes('roar');
        const isCombatRoar = pattern => pattern.tags?.includes('combat-roar');
        const isAllowed = pattern => {
            if (context.monsterTier === 'small') return !isRoarPattern(pattern);
            return !isRoarPattern(pattern) || isCombatRoar(pattern);
        };
        const brokenParts = new Set((context.partState || [])
            .filter(part => part?.broken || part?.severed)
            .map(part => String(part.kind || part.id || '').toLowerCase()));
        const brokenPartKinds = (context.partState || [])
            .filter(part => part?.broken || part?.severed)
            .map(part => String(part.kind || part.id || '').toLowerCase());
        const activeTraits = new Set(context.traits || []);
        const matchesContext = pattern =>
            !pattern.isFollowUp
            && !pattern.isPhasedFollowUp
            && !(pattern.tags || []).includes('burrow-emerge')
            && (!pattern.requiredState || pattern.requiredState === context.state)
            && (!pattern.requiresPreviousPattern || pattern.requiresPreviousPattern === lastId)
            && !(pattern.forbiddenStates || []).includes(context.state)
            && (pattern.requiredTraits || []).every(trait => activeTraits.has(trait))
            && !(pattern.forbiddenTraits || []).some(trait => activeTraits.has(trait))
            && !(pattern.forbiddenWhenBroken || []).some(part => brokenParts.has(part))
            && (pattern.maxHpRatio === undefined || context.hpRatio <= pattern.maxHpRatio)
            && (!(pattern.tags || []).includes('landing-only') || context.landingPending)
            && (context.flightState === 'airborne'
                ? !(pattern.tags || []).includes('ground-only')
                    && (context.shortFlightChain
                        ? (pattern.tags || []).includes('flight-only')
                        : ((pattern.tags || []).includes('flight-only') || (pattern.tags || []).includes('air-compatible')))
                : !(pattern.tags || []).includes('flight-only'));
        let candidates = patterns.filter(pattern =>
            isAllowed(pattern)
            &&
            !this.cooldowns.has(`${monsterId}:${pattern.id}`)
            && matchesContext(pattern)
        );
        if (!candidates.length) candidates = patterns.filter(pattern =>
            isAllowed(pattern)
            && matchesContext(pattern)
        );
        if (!candidates.length) return null;
        if (context.state === 'enraged' && context.ultimateUsedInRage) {
            const nonUltimate = candidates.filter(pattern => !pattern.tags.includes('ultimate') && pattern.type !== 'ultimate');
            if (nonUltimate.length) candidates = nonUltimate;
        }
        const consecutiveUses = Number(this.consecutiveUsesByMonster.get(monsterId) || 0);
        const withoutRepeat = candidates.filter(pattern =>
            pattern.id !== lastId
            || consecutiveUses < Math.max(1, Number(
                pattern.maxConsecutiveUsesByState?.[context.state]
                ?? pattern.maxConsecutiveUses
                ?? 1
            ))
        );
        if (withoutRepeat.length) candidates = withoutRepeat;
        if (context.state !== 'enraged') {
            this.enragedTurnsWithoutUltimate.set(monsterId, 0);
            const nonUltimate = candidates.filter(pattern => !pattern.tags.includes('ultimate'));
            if (nonUltimate.length) candidates = nonUltimate;
        }
        if (context.flightState === 'airborne') {
            const aerial = candidates.filter(pattern => context.shortFlightChain
                ? pattern.tags.includes('flight-only')
                : pattern.tags.includes('flight-only') || pattern.tags.includes('air-compatible'));
            if (aerial.length) candidates = aerial;
        }
        const chanceCandidates = candidates.filter(pattern =>
            Number.isFinite(Number(pattern.selectionChanceByState?.[context.state])));
        if (chanceCandidates.length) {
            const selectedByChance = chanceCandidates.find(pattern => {
                const penalty = pattern.selectionChancePenaltyPerBrokenPart || {};
                const partPattern = String(penalty.partPattern || '').toLowerCase();
                const brokenCount = partPattern
                    ? brokenPartKinds.filter(kind => kind.includes(partPattern)).length
                    : 0;
                const chance = Math.max(0, Math.min(1,
                    Number(pattern.selectionChanceByState[context.state] || 0)
                    - brokenCount * Number(penalty.amount || 0)
                ));
                return this.random() < chance;
            });
            if (selectedByChance) candidates = [selectedByChance];
            else {
                const withoutChance = candidates.filter(pattern => !chanceCandidates.includes(pattern));
                if (withoutChance.length) candidates = withoutChance;
            }
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
            weight: Math.max(0.05, Number(
                pattern.weightByState?.[context.state]
                ?? pattern.weight
                ?? 1
            )
                * (context.state === 'enraged' && pattern.tags.includes('ultimate') ? 3 : 1)
                * (context.state === 'exhausted' && pattern.tags.includes('charge') ? 0.45 : 1)
                * (context.state === 'exhausted' && pattern.tags.includes('burrow-enter') ? 0.28 : 1)
                * Object.entries(pattern.weightWhenBroken || {}).reduce(
                    (weight, [part, modifier]) => brokenParts.has(part) ? weight * Number(modifier || 1) : weight, 1)
                * Object.entries(pattern.weightWhenTraits || {}).reduce(
                    (weight, [trait, modifier]) => activeTraits.has(trait) ? weight * Number(modifier || 1) : weight, 1))
        }));
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = this.random() * total;
        let selected = weighted[weighted.length - 1].pattern;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) { selected = entry.pattern; break; }
        }
        this.lastPatternByMonster.set(monsterId, selected.id);
        this.consecutiveUsesByMonster.set(
            monsterId,
            selected.id === lastId ? consecutiveUses + 1 : 1
        );
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
