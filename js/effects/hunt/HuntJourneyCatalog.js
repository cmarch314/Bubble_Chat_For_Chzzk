class HuntJourneyCatalog {
    static STAGES = Object.freeze([
        Object.freeze(['small', 'event', 'medium', 'event', 'normal']),
        Object.freeze(['medium', 'event', 'normal', 'event', 'elder']),
        Object.freeze(['normal', 'event', 'elder', 'event', 'colossal'])
    ]);
    static EVENTS = Object.freeze([
        'smithy', 'gather', 'trader', 'camp', 'risky_gather',
        'felyne', 'tetoru', 'boaboa', 'gajalaka', 'melynx', 'mysterious_tracks'
    ]);

    static validateEventCatalog(catalog) {
        const missing = this.EVENTS.filter(id => !catalog?.get?.(id));
        if (missing.length) throw new Error(`Journey event catalog is missing: ${missing.join(', ')}`);
        return true;
    }

    static random(seed) {
        let state = (Number(seed) >>> 0) || 0x9e3779b9;
        return () => {
            state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
            return (state >>> 0) / 4294967296;
        };
    }

    static build(monsters, getTier, seed) {
        const random = this.random(seed);
        const byTier = new Map();
        (monsters || []).forEach(monster => {
            if (monster.selectable === false || monster.role === 'journey-event') return;
            const tier = getTier(monster) === 'large' ? 'normal' : getTier(monster);
            if (!byTier.has(tier)) byTier.set(tier, []);
            byTier.get(tier).push(monster);
        });
        const used = new Set();
        let previousEvent = null;
        const nodes = [];
        this.STAGES.forEach((template, stageIndex) => template.forEach((kind, stageNodeIndex) => {
            const index = nodes.length;
            if (kind === 'event') {
                const pool = this.EVENTS.filter(id => id !== previousEvent);
                const choiceCount = Math.min(pool.length, 2 + (random() >= 0.5 ? 1 : 0));
                const eventChoices = [];
                while (eventChoices.length < choiceCount && pool.length) {
                    eventChoices.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
                }
                previousEvent = eventChoices[0];
                nodes.push({ id: `s${stageIndex + 1}-n${index + 1}`, type: 'event', stageIndex,
                    eventChoices, eventScope: 'party', status: 'pending' });
                return;
            }
            const pool = byTier.get(kind) || [];
            if (!pool.length) throw new Error(`Journey monster pool is empty for tier: ${kind}`);
            const isBoss = stageNodeIndex === template.length - 1;
            const available = pool.filter(monster => !used.has(monster.id));
            const source = available.length ? [...available] : [...pool];
            const choiceCount = isBoss ? 1 : Math.min(source.length, 2 + (random() >= 0.5 ? 1 : 0));
            const monsterChoices = [];
            while (monsterChoices.length < choiceCount && source.length) {
                monsterChoices.push(source.splice(Math.floor(random() * source.length), 1)[0].id);
            }
            monsterChoices.forEach(id => used.add(id));
            nodes.push({ id: `s${stageIndex + 1}-n${index + 1}`, type: 'combat', stageIndex, tier: kind,
                isBoss, monsterChoices, monsterId: isBoss ? monsterChoices[0] : null, status: 'pending' });
        }));
        return nodes;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyCatalog;
else globalThis.HuntJourneyCatalog = HuntJourneyCatalog;
