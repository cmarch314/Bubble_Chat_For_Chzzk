class HuntJourneyFlowController {
    static TRAVEL_DURATION_SECONDS = 10;

    constructor(effect) {
        this.effect = effect;
        this.handlers = new Map();
        this.gates = [];
        this.registerGate(async () => this.effect.runJourneyWeaponUpgrade?.());
        this.register('event', async () => {
            await this.effect.runJourneyEventChoices();
            return true;
        });
        this.register('combat', async (node, monsters) => {
            this.effect.prepareJourneyCombatNode(node, monsters);
            return false;
        });
    }

    register(type, handler) {
        if (!type || typeof handler !== 'function') throw new Error('Journey node handler requires a type and function');
        this.handlers.set(String(type), handler);
        return this;
    }

    registerGate(handler) {
        if (typeof handler !== 'function') throw new Error('Journey flow gate requires a function');
        this.gates.push(handler);
        return this;
    }

    async prepareCurrent(monsters) {
        let guard = 0;
        const RunState = globalThis.HuntRunState
            || (typeof require === 'function' ? require('./HuntRunState.js') : null);
        const nodeBudget = Number(this.effect.runDirector?.state?.nodes?.length || RunState?.NODE_COUNT || 0) + 1;
        while (this.effect.runDirector?.state?.status === 'active' && guard++ < nodeBudget) {
            for (const gate of this.gates) await gate();
            const node = this.effect.runDirector.currentNode();
            if (!node) return null;
            await this.effect.showJourneyTravelMap?.(node);
            if (!this.effect.isActive && this.effect.isActive !== undefined) return null;
            const handler = this.handlers.get(node.type);
            if (!handler) throw new Error(`No journey node handler registered for: ${node.type}`);
            const advanced = await handler(node, monsters);
            if (!advanced) return node;
        }
        return this.effect.runDirector?.currentNode() || null;
    }

    async continueAfterResult(isVictory) {
        if (!isVictory || this.effect.huntMode !== 'journey') return false;
        await this.effect.journeySettlementPromise;
        if (this.effect.runDirector?.state?.status !== 'active') return false;
        const rootResolve = this.effect.resolveGame;
        this.effect.resolveGame = null;
        Promise.resolve(this.effect.execute({ message: '!몬헌', internalContinuation: true }))
            .then(() => rootResolve?.())
            .catch(error => {
                console.error('[HuntJourney] continuation failed', error);
                rootResolve?.();
            });
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyFlowController;
else globalThis.HuntJourneyFlowController = HuntJourneyFlowController;
