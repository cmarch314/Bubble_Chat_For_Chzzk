'use strict';

/**
 * Shared host for the real HuntEngine.
 *
 * OBS and the review editor must both instantiate this class. The host owns
 * clock transport and trace capture only; HuntEngine/BEAT owns gameplay.
 */
class HuntCombatRuntime {
    constructor(options = {}) {
        const Engine = options.Engine || globalThis.HuntEngine
            || (typeof require === 'function' ? require('./HuntEngine.js') : null);
        const Clock = options.Clock || globalThis.HuntCombatClock
            || (typeof require === 'function' ? require('./HuntCombatClock.js') : null);
        if (!Engine || !Clock) throw new Error('HuntCombatRuntime requires HuntEngine and HuntCombatClock');

        this.mode = options.mode === 'preview' ? 'preview' : 'live';
        this.trace = [];
        this.maxTraceEntries = Math.max(128, Number(options.maxTraceEntries || 4096));
        this.onError = typeof options.onError === 'function' ? options.onError : null;
        this.onTrace = typeof options.onTrace === 'function' ? options.onTrace : null;
        this.engine = options.engine || new Engine(options.engineConfig || {});
        this.tickHandler = typeof options.tick === 'function'
            ? options.tick
            : () => this.engine.processTick();
        this.monsterEventCursor = 0;
        this.clock = options.clock || new Clock({
            mode: options.clockMode || (this.mode === 'preview' ? 'manual' : 'auto'),
            tickMs: options.tickMs || 100,
            timers: options.timers,
            onTick: () => this.#tick(),
            onError: (error, tick) => this.#handleError(error, tick)
        });
    }

    start() { return this.clock.start(); }
    pause() { return this.clock.pause(); }
    resume() { return this.clock.resume(); }
    stop() { return this.clock.stop(); }
    step(count = 1) { return this.clock.step(count); }

    executeMonsterPattern(pattern, options = {}) {
        if (!pattern?.id) throw new Error('A compiled monster pattern is required');
        const primaryTargetIndex = Number.isInteger(options.primaryTargetIndex)
            ? options.primaryTargetIndex : 0;
        const runtimePattern = {
            ...pattern,
            ...(Array.isArray(options.targetIndices)
                ? { runtimeImpactTargetIndices: [...options.targetIndices] } : {}),
            ...(Array.isArray(options.impactTargets)
                ? { runtimePreviewImpactTargets: options.impactTargets.map(indices => [...indices]) } : {})
        };
        this.#record('action-requested', {
            actor: 'monster', actionId: runtimePattern.id, primaryTargetIndex,
            targetIndices: runtimePattern.runtimeImpactTargetIndices || null
        });
        this.monsterEventCursor = 0;
        return this.engine.executeMonsterTurn(runtimePattern, null, primaryTargetIndex);
    }

    cancelMonsterAction(reason = 'preview-stop') {
        const cancelled = this.engine.interruptMonsterMovement?.(reason)
            || this.engine.cancelMonsterBeatAction?.(reason)
            || false;
        this.#record('action-cancelled', { actor: 'monster', reason });
        return cancelled;
    }

    recentTrace() { return this.trace.map(entry => ({ ...entry })); }
    clearTrace() { this.trace.length = 0; }

    #tick() {
        const before = Number(this.engine.battleTime || 0);
        const result = this.tickHandler(this.engine, this.clock.elapsedTicks + 1);
        const events = Array.isArray(this.engine.monsterBeatRuntimeEvents)
            ? this.engine.monsterBeatRuntimeEvents : [];
        for (const event of events.slice(this.monsterEventCursor)) {
            this.#record('beat-event', {
                actionId: String(event?.actionId || event?.patternId || ''),
                beatId: String(event?.beatId || ''),
                eventId: String(event?.id || ''),
                kind: String(event?.kind || ''),
                atTicks: Number(event?.atTicks || 0)
            });
        }
        this.monsterEventCursor = events.length;
        const active = this.engine.monsterBeatRuntime?.get?.('monster') || null;
        this.#record('tick', {
            battleTimeBefore: before,
            battleTimeAfter: Number(this.engine.battleTime || before),
            monsterAction: active?.action?.id || null,
            monsterActionTick: Number(active?.elapsedTicks || 0),
            monsterHp: Number(this.engine.monsterHp || 0)
        });
        return result;
    }

    #record(type, detail = {}) {
        const entry = Object.freeze({
            type,
            tick: Number(this.clock?.elapsedTicks || 0),
            battleTime: Number(this.engine?.battleTime || 0),
            ...detail
        });
        this.trace.push(entry);
        if (this.trace.length > this.maxTraceEntries) this.trace.shift();
        this.onTrace?.(entry);
        return entry;
    }

    #handleError(error, tick) {
        this.#record('error', { tick, message: error?.message || String(error) });
        if (this.onError) this.onError(error, tick, this);
        else throw error;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntCombatRuntime;
else globalThis.HuntCombatRuntime = HuntCombatRuntime;
