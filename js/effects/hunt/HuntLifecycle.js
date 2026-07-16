class HuntLifecycle {
    constructor() {
        this.state = 'idle';
        this.sessionId = 0;
        this.transitions = {
            idle: new Set(['quest_board']),
            quest_board: new Set(['loadout', 'results']),
            loadout: new Set(['fighting', 'results']),
            fighting: new Set(['results']),
            results: new Set(['quest_board', 'idle'])
        };
    }

    transition(nextState) {
        if (nextState === this.state) return true;
        const allowed = this.transitions[this.state];
        if (!allowed || !allowed.has(nextState)) {
            console.warn(`[HuntLifecycle] Invalid transition: ${this.state} -> ${nextState}`);
            return false;
        }

        this.state = nextState;
        if (nextState === 'quest_board') this.sessionId++;
        return true;
    }

    is(state) { return this.state === state; }

    snapshot() {
        return Object.freeze({ state: this.state, sessionId: this.sessionId });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntLifecycle;
else window.HuntLifecycle = HuntLifecycle;
