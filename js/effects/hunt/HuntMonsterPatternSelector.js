class HuntMonsterPatternSelector {
    constructor(random = Math.random) {
        this.random = random;
        this.lastPatternByMonster = new Map();
        this.cooldowns = new Map();
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
        let candidates = patterns.filter(pattern =>
            !this.cooldowns.has(`${monsterId}:${pattern.id}`)
            && (!pattern.requiredState || pattern.requiredState === context.state)
            && (pattern.maxHpRatio === undefined || context.hpRatio <= pattern.maxHpRatio)
        );
        if (!candidates.length) candidates = [...patterns];
        const withoutRepeat = candidates.filter(pattern => pattern.id !== lastId);
        if (withoutRepeat.length) candidates = withoutRepeat;
        if (context.state !== 'enraged') {
            const nonUltimate = candidates.filter(pattern => !pattern.tags.includes('ultimate'));
            if (nonUltimate.length) candidates = nonUltimate;
        }
        const weighted = candidates.map(pattern => ({
            pattern,
            weight: Math.max(0.05, Number(pattern.weight || 1)
                * (context.state === 'enraged' && pattern.tags.includes('ultimate') ? 2 : 1)
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
        this.cooldowns.set(`${monsterId}:${selected.id}`, Number(selected.cooldownTicks || 1));
        return selected;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterPatternSelector;
else window.HuntMonsterPatternSelector = HuntMonsterPatternSelector;
