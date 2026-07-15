class GameEffectRuntime {
    constructor(owner, director, options = {}) {
        this.owner = owner;
        this.director = director;
        this.timers = options.timers || new ManagedTimers();
        this.ended = true;
    }

    start() {
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
