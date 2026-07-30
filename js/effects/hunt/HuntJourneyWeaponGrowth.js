class HuntJourneyWeaponGrowth {
    constructor(instanceCatalog, progression = typeof WILDS_WEAPON_PROGRESSION !== 'undefined' ? WILDS_WEAPON_PROGRESSION : null) {
        this.catalog = instanceCatalog;
        this.progression = Array.isArray(progression) ? progression : [];
        this.byKey = new Map(this.progression.map(item => [item.key, item]));
        this.progressionByKind = new Map();
        this.progression.forEach(item => {
            if (!this.progressionByKind.has(item.kind)) this.progressionByKind.set(item.kind, []);
            this.progressionByKind.get(item.kind).push(item);
        });
    }

    pool(kind) {
        const key = String(kind || '');
        return (this.progressionByKind.get(key) || this.catalog?.byKind?.get(key) || []).slice();
    }

    starter(kind, seed = 0, preferredStyle = null) {
        const pool = this.pool(kind);
        if (!pool.length) return null;
        if (this.progression.length) {
            let candidates = pool.filter(item => item.starterStyle && (!preferredStyle || item.starterStyle === preferredStyle));
            if (!candidates.length) candidates = pool.filter(item => item.starterStyle);
            const random = HuntJourneyCatalog.random(seed);
            return candidates[Math.floor(random() * candidates.length)] || null;
        }
        const rarity = Math.min(...pool.map(item => Number(item.rarity || 1)));
        const candidates = pool.filter(item => Number(item.rarity || 1) === rarity);
        const random = HuntJourneyCatalog.random(seed);
        return candidates[Math.floor(random() * candidates.length)] || null;
    }

    candidates(member, stageIndex, seed = 0, count = 2, unlockedSeals = []) {
        const pool = this.pool(member.weaponId);
        const currentId = Number(member.weaponInstanceId);
        const current = member.weaponProgressionKey
            ? this.byKey.get(member.weaponProgressionKey)
            : pool.find(item => Number(item.id) === currentId);
        if (this.progression.length && current) {
            // Journey bosses grant only two weapon upgrades: establish the family at R2,
            // then allow the real tree to reach its R4 finisher before the final stage.
            const cap = Number(stageIndex) <= 1 ? 2 : 4;
            const reachable = [];
            const queue = [...(current.branches || [])];
            const visited = new Set(queue);
            while (queue.length) {
                const item = this.byKey.get(queue.shift());
                if (!item || item.kind !== member.weaponId) continue;
                if (Number(item.tier) > Number(current.tier) && Number(item.tier) <= cap) reachable.push(item);
                if (Number(item.tier) < cap) for (const child of item.branches || []) if (!visited.has(child)) {
                    visited.add(child);
                    queue.push(child);
                }
            }
            reachable.sort((a, b) => Number(a.tier) - Number(b.tier) || Number(a.rarity) - Number(b.rarity) || a.key.localeCompare(b.key));
            const bestTier = Math.max(0, ...reachable.map(item => Number(item.tier)));
            let eligible = reachable.filter(item => Number(item.tier) === bestTier);
            const seals = new Set(unlockedSeals || []);
            const matched = eligible.filter(item => seals.has(item.seal) || ['iron', 'bone'].includes(item.seal));
            if (matched.length) eligible = matched;
            const random = HuntJourneyCatalog.random(seed ^ currentId ^ (Number(stageIndex) << 16));
            const selected = [];
            while (eligible.length && selected.length < Math.min(2, count)) selected.push(eligible.splice(Math.floor(random() * eligible.length), 1)[0]);
            return selected;
        }
        const currentRarity = Number(current?.rarity || member.weaponTier || 1);
        const cap = [6, 7, 8][Math.max(0, Math.min(2, Number(stageIndex) || 0))];
        let eligible = pool.filter(item => Number(item.id) !== currentId && Number(item.rarity || 1) > currentRarity && Number(item.rarity || 1) <= cap);
        if (!eligible.length) eligible = pool.filter(item => Number(item.id) !== currentId && Number(item.rarity || 1) <= cap && Number(item.raw || 0) > Number(current?.raw || 0));
        eligible.sort((a, b) => Number(a.rarity || 0) - Number(b.rarity || 0) || Number(a.raw || 0) - Number(b.raw || 0) || Number(a.id) - Number(b.id));
        const random = HuntJourneyCatalog.random(seed ^ currentId ^ (Number(stageIndex) << 16));
        const selected = [];
        while (eligible.length && selected.length < count) selected.push(eligible.splice(Math.floor(random() * eligible.length), 1)[0]);
        return selected;
    }

    apply(member, instanceId) {
        const instance = typeof instanceId === 'string'
            ? this.byKey.get(instanceId)
            : this.pool(member.weaponId).find(item => Number(item.id) === Number(instanceId));
        if (!instance) return false;
        member.weaponInstanceId = Number(instance.id);
        member.weaponProgressionKey = instance.key || null;
        member.weaponTier = Math.max(Number(member.weaponTier || 1), Number(instance.tier || instance.rarity || 1));
        member.weaponDisplayName = instance.nameKo || instance.name;
        member.weaponRarity = Number(instance.rarity || 1);
        member.weaponSeal = instance.seal || null;
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyWeaponGrowth;
else globalThis.HuntJourneyWeaponGrowth = HuntJourneyWeaponGrowth;
