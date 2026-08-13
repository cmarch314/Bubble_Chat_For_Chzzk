'use strict';

class HuntBeatActionRuntime {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        this.actions = new Map();
        this.nextGeneration = 0;
    }

    begin(actorKey, compiledAction, context = {}) {
        if (!compiledAction || compiledAction.backend !== 'beat-v2') {
            throw new Error('HuntBeatActionRuntime requires a compiled BEAT V2 action');
        }
        this.cancel(actorKey, 'replaced');
        const state = {
            actorKey,
            action: compiledAction,
            context,
            generation: ++this.nextGeneration,
            elapsedTicks: 0,
            beatIndex: 0,
            emitted: new Set(),
            status: 'running'
        };
        this.actions.set(actorKey, state);
        this.callbacks.onBegin?.(state);
        this.callbacks.onBeat?.(state, compiledAction.beats[0], null);
        this.#emitAt(state, 0);
        return state;
    }

    tick(actorKey) {
        const state = this.actions.get(actorKey);
        if (!state || state.status !== 'running') return null;
        state.elapsedTicks += 1;
        if (state.elapsedTicks >= state.action.totalTicks) {
            this.#complete(state);
            return null;
        }
        const previousBeat = state.action.beats[state.beatIndex];
        while (state.beatIndex + 1 < state.action.beats.length
            && state.elapsedTicks >= state.action.beats[state.beatIndex].endTicks) {
            state.beatIndex += 1;
        }
        const currentBeat = state.action.beats[state.beatIndex];
        if (currentBeat !== previousBeat) this.callbacks.onBeat?.(state, currentBeat, previousBeat);
        this.#emitAt(state, state.elapsedTicks);
        this.callbacks.onTick?.(state, currentBeat);
        return state;
    }

    cancel(actorKey, reason = 'cancelled') {
        const state = this.actions.get(actorKey);
        if (!state) return false;
        this.actions.delete(actorKey);
        state.status = 'cancelled';
        state.cancelReason = reason;
        this.callbacks.onCancel?.(state, reason);
        return true;
    }

    get(actorKey) { return this.actions.get(actorKey) || null; }
    has(actorKey) { return this.actions.has(actorKey); }
    activeCount() { return this.actions.size; }

    clear(reason = 'runtime-clear') {
        [...this.actions.keys()].forEach(actorKey => this.cancel(actorKey, reason));
    }

    #emitAt(state, tick) {
        for (const event of state.action.events) {
            if (event.atTicks !== tick || state.emitted.has(event.id)) continue;
            state.emitted.add(event.id);
            this.callbacks.onEvent?.(state, event);
        }
    }

    #complete(state) {
        if (this.actions.get(state.actorKey) !== state) return;
        this.actions.delete(state.actorKey);
        state.status = 'completed';
        this.callbacks.onComplete?.(state);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntBeatActionRuntime;
} else {
    window.HuntBeatActionRuntime = HuntBeatActionRuntime;
}
