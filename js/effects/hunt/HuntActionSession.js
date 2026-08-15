'use strict';

/**
 * The single authored-action session shared by live combat and the review
 * editor.  It deliberately owns only transport and lifecycle; combat mutation
 * stays behind callbacks so a presentation-only preview cannot accidentally
 * damage hunters or advance AI state.
 */
class HuntActionSession {
    constructor(options = {}) {
        const BeatRuntime = options.BeatRuntime || globalThis.HuntBeatActionRuntime
            || (typeof require === 'function' ? require('./HuntBeatActionRuntime.js') : null);
        const Clock = options.Clock || globalThis.HuntCombatClock
            || (typeof require === 'function' ? require('./HuntCombatClock.js') : null);
        if (!BeatRuntime || !Clock) throw new Error('HuntActionSession requires BEAT runtime and clock');

        const action = options.action || options.graph;
        if (!action || action.backend !== 'beat-v2' || !action.id) {
            throw new Error('HuntActionSession requires a compiled BEAT V2 action');
        }
        this.action = action;
        this.actorKey = String(options.actorKey || 'monster');
        this.mode = options.mode === 'live' ? 'live' : 'preview';
        this.presentationOnly = options.presentationOnly !== false;
        this.sessionId = String(options.sessionId || `${this.mode}:${action.id}:${Date.now()}`);
        this.callbacks = options.callbacks || {};
        this.trace = [];
        this.maxTraceEntries = Math.max(128, Number(options.maxTraceEntries || 4096));
        this.generation = 0;
        this.status = 'idle';
        this.state = null;
        this.context = Object.freeze({});

        this.runtime = options.runtime || new BeatRuntime({
            onBegin: state => this.#onBegin(state),
            onBeat: (state, beat, previous) => this.#onBeat(state, beat, previous),
            onEvent: (state, event) => this.#onEvent(state, event),
            onTick: (state, beat) => this.#onTick(state, beat),
            onComplete: state => this.#onComplete(state),
            onCancel: (state, reason) => this.#onCancel(state, reason)
        });
        this.clock = options.clock || new Clock({
            mode: options.clockMode || (this.mode === 'preview' ? 'manual' : 'auto'),
            tickMs: options.tickMs || 100,
            rate: options.rate || 1,
            timers: options.timers,
            onTick: () => this.runtime.tick(this.actorKey),
            onError: (error, tick) => this.#onError(error, tick)
        });
    }

    start(context = {}) {
        if (this.status === 'running') return false;
        if (this.status === 'completed' || this.status === 'cancelled') this.reset();
        this.generation += 1;
        const nextContext = Object.keys(context || {}).length ? context : this.context;
        const runtimeContext = {
            ...nextContext,
            actionSessionId: this.sessionId,
            mode: this.mode,
            presentationOnly: this.presentationOnly
        };
        this.context = Object.freeze({ ...runtimeContext });
        this.state = this.runtime.begin(this.actorKey, this.action, runtimeContext);
        this.status = 'running';
        this.clock.start();
        return true;
    }

    pause() {
        if (this.status !== 'running') return false;
        this.clock.pause();
        this.status = 'paused';
        this.callbacks.onPause?.(this.snapshot());
        return true;
    }

    resume() {
        if (this.status !== 'paused') return false;
        this.status = 'running';
        this.clock.resume();
        this.callbacks.onResume?.(this.snapshot());
        return true;
    }

    step(count = 1) {
        if (this.status === 'idle') this.start();
        if (this.status !== 'running' && this.status !== 'paused') return null;
        if (this.status === 'paused') return this.state;
        return this.clock.step(count);
    }

    stop(reason = 'stopped') {
        const changed = this.status === 'running' || this.status === 'paused';
        this.clock.stop();
        if (this.runtime.has(this.actorKey)) this.runtime.cancel(this.actorKey, reason);
        if (changed) this.status = 'cancelled';
        return changed;
    }

    reset() {
        this.clock.stop();
        this.clock.reset(0);
        if (this.runtime.has(this.actorKey)) this.runtime.cancel(this.actorKey, 'reset');
        this.state = null;
        this.status = 'idle';
        this.trace.length = 0;
        return this;
    }

    /**
     * Deterministic scrub.  Event callbacks are suppressed while replaying the
     * prefix; callers render the resulting state at the requested tick.
     */
    seek(tick = 0) {
        const target = Math.max(0, Math.min(this.action.totalTicks, Math.floor(Number(tick) || 0)));
        this.reset();
        this.#seeking = true;
        this.start(this.context);
        this.clock.pause();
        for (let index = 0; index < target; index += 1) this.runtime.tick(this.actorKey);
        this.clock.reset(target);
        this.#seeking = false;
        this.callbacks.onSeek?.(this.snapshot());
        return this.snapshot();
    }

    setRate(rate = 1) { return this.clock.setRate(rate); }

    snapshot() {
        const state = this.state;
        return Object.freeze({
            sessionId: this.sessionId,
            actionId: this.action.id,
            actorKey: this.actorKey,
            mode: this.mode,
            presentationOnly: this.presentationOnly,
            status: this.status,
            tick: Number(this.clock.elapsedTicks || 0),
            beatId: state?.action?.beats?.[state.beatIndex]?.id || null,
            elapsedTicks: Number(state?.elapsedTicks || 0)
        });
    }

    recentTrace() { return this.trace.map(entry => ({ ...entry })); }

    #seeking = false;

    #record(type, detail = {}) {
        const entry = Object.freeze({
            type,
            tick: Number(this.clock?.elapsedTicks || 0),
            sessionId: this.sessionId,
            actionId: this.action.id,
            ...detail
        });
        this.trace.push(entry);
        if (this.trace.length > this.maxTraceEntries) this.trace.shift();
        return entry;
    }

    #onBegin(state) {
        this.state = state;
        this.#record('begin');
        this.callbacks.onBegin?.(state, this.snapshot());
    }

    #onBeat(state, beat, previous) {
        this.#record('beat', { beatId: beat?.id || null });
        this.callbacks.onBeat?.(state, beat, previous, this.snapshot());
    }

    #onEvent(state, event) {
        this.#record('event', { eventId: event?.id || null, kind: event?.kind || null });
        if (!this.#seeking) this.callbacks.onEvent?.(state, event, this.snapshot());
    }

    #onTick(state, beat) {
        this.state = state;
        this.#record('tick', { beatId: beat?.id || null });
        this.callbacks.onTick?.(state, beat, this.snapshot());
    }

    #onComplete(state) {
        this.state = state;
        this.clock.stop();
        this.status = 'completed';
        this.#record('complete');
        this.callbacks.onComplete?.(state, this.snapshot());
    }

    #onCancel(state, reason) {
        this.state = state;
        this.clock.stop();
        if (this.status !== 'completed') this.status = 'cancelled';
        this.#record('cancel', { reason });
        this.callbacks.onCancel?.(state, reason, this.snapshot());
    }

    #onError(error, tick) {
        this.#record('error', { tick, message: error?.message || String(error) });
        this.callbacks.onError?.(error, tick, this.snapshot());
        if (!this.callbacks.onError) throw error;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntActionSession;
else globalThis.HuntActionSession = HuntActionSession;
