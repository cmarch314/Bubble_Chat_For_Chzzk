'use strict';

/**
 * One clock contract for live hunts and the review editor.
 *
 * Live mode advances automatically through ManagedTimers. Preview mode calls
 * step() explicitly. Neither mode is allowed to create a second gameplay
 * timeline; they only decide when the same HuntEngine tick is advanced.
 */
class HuntCombatClock {
    constructor(options = {}) {
        this.mode = options.mode === 'manual' ? 'manual' : 'auto';
        this.tickMs = Math.max(1, Number(options.tickMs || 100));
        this.rate = this.#normalizeRate(options.rate || 1);
        this.timers = options.timers || null;
        this.onTick = typeof options.onTick === 'function' ? options.onTick : () => {};
        this.onError = typeof options.onError === 'function' ? options.onError : null;
        this.intervalId = null;
        this.running = false;
        this.elapsedTicks = 0;
    }

    start() {
        if (this.running) return false;
        this.running = true;
        if (this.mode === 'auto') this.#startInterval();
        return true;
    }

    pause() {
        if (!this.running) return false;
        this.running = false;
        this.#clearInterval();
        return true;
    }

    resume() { return this.start(); }

    setRate(rate = 1) {
        const next = this.#normalizeRate(rate);
        if (next === this.rate) return this.rate;
        this.rate = next;
        if (this.running && this.mode === 'auto') {
            this.#clearInterval();
            this.#startInterval();
        }
        return this.rate;
    }

    stop() {
        const changed = this.running || this.intervalId != null;
        this.running = false;
        this.#clearInterval();
        return changed;
    }

    step(count = 1) {
        const ticks = Math.max(0, Math.floor(Number(count) || 0));
        let result = null;
        for (let index = 0; index < ticks; index += 1) {
            try {
                result = this.onTick(this.elapsedTicks + 1);
                this.elapsedTicks += 1;
            } catch (error) {
                if (!this.onError) throw error;
                this.onError(error, this.elapsedTicks + 1);
                break;
            }
        }
        return result;
    }

    reset(tick = 0) {
        this.elapsedTicks = Math.max(0, Math.floor(Number(tick) || 0));
    }

    #startInterval() {
        const callback = () => {
            if (this.running) this.step(1);
        };
        const intervalMs = Math.max(1, this.tickMs / this.rate);
        this.intervalId = this.timers?.interval
            ? this.timers.interval(callback, intervalMs)
            : setInterval(callback, intervalMs);
    }

    #normalizeRate(rate) {
        const numeric = Number(rate);
        return [1, 2, 4].includes(numeric) ? numeric : 1;
    }

    #clearInterval() {
        if (this.intervalId == null) return;
        if (this.timers?.clear) this.timers.clear(this.intervalId);
        else clearInterval(this.intervalId);
        this.intervalId = null;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntCombatClock;
else globalThis.HuntCombatClock = HuntCombatClock;
