class HuntRunState {
    static SCHEMA_VERSION = 4;
    static CATALOG_VERSION = 5;
    static NODE_COUNT = 15;
    static MAX_BYTES = 32 * 1024;
    static ENDPOINT_PATH = '/api/hunt-run';
    static STATUSES = Object.freeze(['active', 'completed', 'failed']);

    static clamp(value, min, max) {
        return Math.floor(Math.max(min, Math.min(max, Number(value) || 0)));
    }

    static normalizePartyMember(member = {}) {
        const maxHp = this.clamp(member.maxHp || 100, 1, 999);
        const requestedPerks = [...new Set(Array.isArray(member.perkIds) ? member.perkIds : [])].map(String);
        const requestedLocks = [...new Set(Array.isArray(member.lockedPerkIds) ? member.lockedPerkIds : [])].map(String).slice(0, 3);
        let perkIds = requestedPerks.slice(0, 4);
        requestedLocks.filter(id => requestedPerks.includes(id) && !perkIds.includes(id)).forEach(id => {
            perkIds = [id, ...perkIds.filter(perkId => perkId !== id)].slice(0, 4);
        });
        return {
            uid: String(member.uid || '').slice(0, 128) || null,
            nickname: String(member.nickname || '').slice(0, 80),
            color: /^#[0-9a-f]{6}$/i.test(String(member.color || '')) ? String(member.color) : '#cccccc',
            isStreamer: Boolean(member.isStreamer),
            isNpc: Boolean(member.isNpc),
            hp: this.clamp(member.hp, 0, maxHp),
            maxHp,
            weaponId: String(member.weaponId || '').slice(0, 32) || null,
            weaponInstanceId: Number.isSafeInteger(Number(member.weaponInstanceId)) ? Number(member.weaponInstanceId) : null,
            weaponProgressionKey: String(member.weaponProgressionKey || '').slice(0, 64) || null,
            weaponTier: this.clamp(member.weaponTier || 1, 1, 8),
            personality: String(member.personality || '').slice(0, 24) || null,
            perkIds,
            lockedPerkIds: requestedLocks.filter(id => perkIds.includes(id)),
            rerolls: this.clamp(member.rerolls, 0, 9)
        };
    }

    static normalizeNode(node = {}, index = 0) {
        return {
            id: String(node.id || `node-${index + 1}`).slice(0, 48),
            type: node.type === 'event' ? 'event' : 'combat',
            stageIndex: this.clamp(node.stageIndex, 0, 2),
            tier: node.type === 'event' ? null : String(node.tier || 'normal').slice(0, 16),
            monsterId: node.type === 'event' ? null : String(node.monsterId || '').slice(0, 80) || null,
            eventId: node.type === 'event' ? String(node.eventId || '').slice(0, 48) || null : null,
            isBoss: node.type === 'combat' && Boolean(node.isBoss),
            monsterChoices: node.type === 'combat' ? [...new Set(Array.isArray(node.monsterChoices) ? node.monsterChoices : [node.monsterId])].filter(Boolean).map(String).slice(0, 3) : [],
            eventChoices: node.type === 'event' ? [...new Set(Array.isArray(node.eventChoices) ? node.eventChoices : [node.eventId])].filter(Boolean).map(String).slice(0, 3) : [],
            eventScope: node.type === 'event' && node.eventScope === 'individual' ? 'individual' : 'party',
            status: node.status === 'completed' ? 'completed' : 'pending'
        };
    }

    static normalize(state = {}) {
        const rawParty = Array.isArray(state.party) ? state.party : [];
        const Supply = typeof HuntSharedSupply !== 'undefined' ? HuntSharedSupply
            : (typeof require === 'function' ? require('./HuntSharedSupply') : null);
        const nodes = (Array.isArray(state.nodes) ? state.nodes : []).slice(0, this.NODE_COUNT)
            .map((node, index) => this.normalizeNode(node, index));
        const nodeIndex = this.clamp(state.nodeIndex, 0, Math.max(0, nodes.length));
        const normalized = {
            schemaVersion: this.SCHEMA_VERSION,
            catalogVersion: Number(state.catalogVersion || this.CATALOG_VERSION),
            runId: String(state.runId || '').slice(0, 64),
            seed: Number(state.seed) >>> 0,
            status: this.STATUSES.includes(state.status) ? state.status : 'active',
            stageIndex: this.clamp(state.stageIndex, 0, 2),
            nodeIndex,
            carts: this.clamp(state.carts ?? 3, 0, 9),
            zenny: this.clamp(state.zenny, 0, 9),
            lockLimit: this.clamp(state.lockLimit || 1, 1, 3),
            rerolls: this.clamp(state.rerolls, 0, 9),
            supply: Supply ? (state.supply ? Supply.normalize(state.supply) : Supply.fromLegacyParty(rawParty)) : {
                potions: this.clamp(state.supply?.potions ?? 10, 0, 10),
                lifepowders: this.clamp(state.supply?.lifepowders ?? 1, 0, 9),
                shockTraps: this.clamp(state.supply?.shockTraps, 0, 9),
                bombs: this.clamp(state.supply?.bombs ?? 1, 0, 9)
            },
            seals: [...new Set(Array.isArray(state.seals) ? state.seals : [])].map(String).slice(-9),
            upgradePendingStage: state.upgradePendingStage === null || state.upgradePendingStage === undefined
                ? null : this.clamp(state.upgradePendingStage, 1, 2),
            lastEvent: state.lastEvent ? String(state.lastEvent).slice(0, 48) : null,
            eventLog: (Array.isArray(state.eventLog) ? state.eventLog : []).slice(-7).map(entry => ({
                nodeId: String(entry.nodeId || '').slice(0, 48),
                eventId: String(entry.eventId || '').slice(0, 48),
                summary: String(entry.summary || '').slice(0, 120)
            })),
            party: rawParty.slice(0, 4).map(member => this.normalizePartyMember(member)),
            nodes,
            revision: Math.max(0, Number(state.revision) || 0)
        };
        if (!normalized.runId || nodes.length !== this.NODE_COUNT) {
            throw new Error(`A journey run requires a runId and exactly ${this.NODE_COUNT} nodes`);
        }
        const bytes = typeof Buffer !== 'undefined'
            ? Buffer.byteLength(JSON.stringify(normalized), 'utf8')
            : new TextEncoder().encode(JSON.stringify(normalized)).length;
        if (bytes > this.MAX_BYTES) {
            throw new Error('Journey run exceeds the 32 KiB checkpoint limit');
        }
        return normalized;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntRunState;
else globalThis.HuntRunState = HuntRunState;
