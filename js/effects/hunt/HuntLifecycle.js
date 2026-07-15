class HuntLifecycle {
    constructor() {
        this.state = 'idle';
        this.sessionId = 0;
        this.transitions = {
            idle: new Set(['voting']),
            voting: new Set(['fighting', 'ended']),
            fighting: new Set(['ended']),
            ended: new Set(['voting', 'idle'])
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
        if (nextState === 'voting') this.sessionId++;
        return true;
    }

    is(state) {
        return this.state === state;
    }

    snapshot() {
        return Object.freeze({ state: this.state, sessionId: this.sessionId });
    }
}
