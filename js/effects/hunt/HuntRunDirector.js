class HuntRunDirector {
    constructor(options = {}) {
        this.client = options.client || null;
        this.channelKey = options.channelKey || 'default';
        this.state = null;
        this.writeQueue = Promise.resolve();
    }

    async loadOrCreate(monsters, getTier, seed = Date.now()) {
        const stored = await this.client?.load(this.channelKey);
        if (stored) {
            try {
                const restored = HuntRunState.normalize(stored);
                if (restored.status === 'active' && restored.catalogVersion === HuntRunState.CATALOG_VERSION) {
                    this.state = restored;
                    return this.state;
                }
            } catch (_) {}
            await this.client?.remove(this.channelKey);
        }
        const normalizedSeed = Number(seed) >>> 0;
        const nodes = HuntJourneyCatalog.build(monsters, getTier, normalizedSeed);
        const Supply = typeof HuntSharedSupply !== 'undefined'
            ? HuntSharedSupply
            : (typeof require === 'function' ? require('./HuntSharedSupply') : null);
        this.state = HuntRunState.normalize({
            runId: `run-${normalizedSeed.toString(16)}-${Date.now().toString(36)}`,
            seed: normalizedSeed,
            status: 'active', stageIndex: 0, nodeIndex: 0,
            carts: 3, zenny: 0, lockLimit: 1, rerolls: 0,
            supply: Supply ? { ...Supply.INITIAL } : undefined,
            party: [], nodes, revision: 0
        });
        const saved = await this.client?.save(this.channelKey, this.state, 0);
        if (saved) this.state = HuntRunState.normalize(saved);
        return this.state;
    }

    currentNode() { return this.state?.nodes?.[this.state.nodeIndex] || null; }

    cloneState(patch = {}) {
        if (!this.state) return null;
        const clone = value => {
            if (typeof structuredClone === 'function') return structuredClone(value);
            return JSON.parse(JSON.stringify(value));
        };
        return HuntRunState.normalize(Object.assign(clone(this.state), clone(patch)));
    }

    async persistCandidate(candidate, expectedRevision) {
        if (!candidate) return null;
        const saved = await this.client?.save(this.channelKey, candidate, expectedRevision);
        if (this.client && !saved) {
            throw new Error('Journey checkpoint was rejected; in-memory state was not changed');
        }
        this.state = saved ? HuntRunState.normalize(saved) : candidate;
        return this.state;
    }

    enqueueWrite(operation) {
        const task = this.writeQueue.then(operation);
        this.writeQueue = task.catch(() => null);
        return task;
    }

    async resolveAutomaticEvents(eventEngine) {
        while (this.currentNode()?.type === 'event' && this.state.status === 'active') {
            const node = this.currentNode();
            const patch = eventEngine.resolve(this.state, node);
            const summary = patch.summary || node.eventId;
            delete patch.summary;
            patch.eventLog = [...(this.state.eventLog || []), { nodeId: node.id, eventId: node.eventId, summary }].slice(-7);
            await this.completeCurrentNode(patch);
        }
        return this.state;
    }

    checkpoint(patch = {}) {
        return this.enqueueWrite(async () => {
            if (!this.state) return null;
            const expectedRevision = this.state.revision;
            return this.persistCandidate(this.cloneState(patch), expectedRevision);
        });
    }

    completeCurrentNode(patch = {}) {
        return this.enqueueWrite(async () => {
            const node = this.currentNode();
            if (!node || node.status === 'completed') return this.state;
            const expectedRevision = this.state.revision;
            const candidate = this.cloneState(patch);
            const candidateNode = candidate.nodes[candidate.nodeIndex];
            candidateNode.status = 'completed';
            candidate.nodeIndex++;
            const next = candidate.nodes[candidate.nodeIndex] || null;
            candidate.stageIndex = next?.stageIndex ?? 2;
            candidate.lockLimit = Math.min(3, candidate.stageIndex + 1);
            if (!next) candidate.status = 'completed';
            return this.persistCandidate(HuntRunState.normalize(candidate), expectedRevision);
        });
    }

    async fail(patch = {}) {
        return this.checkpoint({ ...patch, status: 'failed' });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntRunDirector;
else globalThis.HuntRunDirector = HuntRunDirector;
