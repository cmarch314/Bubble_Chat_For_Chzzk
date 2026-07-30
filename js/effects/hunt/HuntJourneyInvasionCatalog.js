class HuntJourneyInvasionCatalog {
    static ENTRIES = Object.freeze([
        Object.freeze({ id: 'deviljho', minStage: 1, tier: 'normal',
            habitats: ['ancient_forest', 'wildspire_waste', 'coral_highlands', 'rotten_vale', 'elders_recess'],
            evidence: 'https://mhworld.kiranico.com/en/monsters/4rATd/deviljho' }),
        Object.freeze({ id: 'bazelgeuse', minStage: 1, tier: 'normal',
            habitats: ['ancient_forest', 'wildspire_waste', 'coral_highlands', 'rotten_vale', 'elders_recess'],
            evidence: 'https://mhrise.kiranico.com/data/monsters/321844636' }),
        Object.freeze({ id: 'rajang', minStage: 2, tier: 'normal',
            habitats: ['coral_highlands', 'hoarfrost_reach', 'guiding_lands'],
            evidence: 'installed-monster-catalog-and-habitat-routing' }),
        Object.freeze({ id: 'yian_garuga', minStage: 2, tier: 'normal',
            habitats: ['ancient_forest', 'guiding_lands'],
            evidence: 'installed-monster-catalog-and-habitat-routing' })
    ]);

    static candidates(monsters, stageIndex) {
        const available = new Set((monsters || []).map(monster => monster.id));
        return this.ENTRIES.filter(entry => entry.minStage <= Number(stageIndex) + 1 && available.has(entry.id));
    }

    static pick(monsters, stageIndex, seed) {
        const candidates = this.candidates(monsters, stageIndex);
        if (!candidates.length) return null;
        const random = HuntJourneyCatalog.random(seed);
        return candidates[Math.floor(random() * candidates.length)];
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyInvasionCatalog;
else globalThis.HuntJourneyInvasionCatalog = HuntJourneyInvasionCatalog;
