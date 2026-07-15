class GameEffectRuntime {
    constructor(owner, director, options = {}) {
        this.owner = owner;
        this.director = director;
        this.timers = options.timers || new ManagedTimers();
        this.ended = true;
        this.waiters = new Set();
    }

    start() {
        this.cancelWaiters();
        this.timers.clearAll();
        this.ended = false;
        this.owner.isActive = true;
        this.director.activeGame = this.owner;
    }

    end() {
        if (this.ended) return false;
        this.ended = true;
        this.owner.isActive = false;
        if (this.director.activeGame === this.owner) {
            this.director.activeGame = null;
        }
        this.cancelWaiters();
        this.timers.clearAll();
        return true;
    }

    timeout(callback, delay) {
        return this.timers.timeout(callback, delay);
    }

    interval(callback, delay) {
        return this.timers.interval(callback, delay);
    }

    clear(timerId) {
        this.timers.clear(timerId);
    }

    wait(delay) {
        if (this.ended) return Promise.resolve(false);
        return new Promise(resolve => {
            let timerId = null;
            const finish = completed => {
                this.waiters.delete(cancel);
                if (!completed) this.timers.clear(timerId);
                resolve(completed);
            };
            const cancel = () => finish(false);
            this.waiters.add(cancel);
            timerId = this.timeout(() => finish(true), delay);
        });
    }

    cancelWaiters() {
        const waiters = Array.from(this.waiters);
        this.waiters.clear();
        waiters.forEach(cancel => cancel());
    }

    once(callback) {
        let called = false;
        return (...args) => {
            if (called) return undefined;
            called = true;
            return callback(...args);
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEffectRuntime;
} else {
    window.GameEffectRuntime = GameEffectRuntime;
}
