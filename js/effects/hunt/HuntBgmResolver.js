class HuntBgmResolver {
    constructor(options = {}) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        this.random = options.random || Math.random;
        this.locales = options.locales || globalScope.HUNT_BGM_LOCALES || {};
        this.themes = options.themes || globalScope.HUNT_DEDICATED_THEMES || {};
        this.habitats = options.habitats || globalScope.HUNT_MONSTER_HABITATS || {};
        this.recentTracks = [];
        this.historyLimit = options.historyLimit || 3;
    }

    normalizeId(monster) {
        return String(monster && (monster.id || monster.nameKO || monster.name) || 'default')
            .toLowerCase()
            .replace(/[-']/g, '_');
    }

    weightedPick(entries) {
        if (!entries || entries.length === 0) return null;
        const total = entries.reduce((sum, item) => sum + Math.max(0, Number(item.weight || 1)), 0);
        let roll = this.random() * (total || entries.length);
        for (const item of entries) {
            roll -= Math.max(0, Number(item.weight || 1));
            if (roll <= 0) return item;
        }
        return entries[entries.length - 1];
    }

    pickTrack(pool) {
        if (!pool || pool.length === 0) return null;
        const fresh = pool.filter(track => !this.recentTracks.includes(track));
        const candidates = fresh.length ? fresh : pool;
        const track = candidates[Math.floor(this.random() * candidates.length)];
        this.recentTracks.push(track);
        if (this.recentTracks.length > this.historyLimit) this.recentTracks.shift();
        return track;
    }

    resolve(monster, options = {}) {
        const monsterId = this.normalizeId(monster);
        const dedicated = this.themes[monsterId] || [];
        if (dedicated.length && options.preferDedicated !== false) {
            return {
                monsterId,
                kind: 'dedicated',
                habitatId: null,
                track: this.pickTrack(dedicated),
                latestAppearance: (this.habitats[monsterId] || {}).latestAppearance || 'unknown'
            };
        }

        const profile = this.habitats[monsterId] || { habitats: [{ id: 'arena', weight: 1 }], latestAppearance: 'unknown' };
        const habitat = options.habitatId
            ? { id: options.habitatId, weight: 1 }
            : this.weightedPick(profile.habitats);
        const habitatId = habitat && this.locales[habitat.id] ? habitat.id : 'arena';
        return {
            monsterId,
            kind: 'habitat',
            habitatId,
            track: this.pickTrack(this.locales[habitatId] || this.locales.arena || []),
            latestAppearance: profile.latestAppearance || 'unknown'
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntBgmResolver;
} else {
    window.HuntBgmResolver = HuntBgmResolver;
}
