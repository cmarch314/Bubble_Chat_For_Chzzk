class ManagedTimers {
    constructor(api = {}) {
        this.api = {
            setTimeout: api.setTimeout || ((callback, delay) => setTimeout(callback, delay)),
            clearTimeout: api.clearTimeout || (id => clearTimeout(id)),
            setInterval: api.setInterval || ((callback, delay) => setInterval(callback, delay)),
            clearInterval: api.clearInterval || (id => clearInterval(id))
        };
        this.timeouts = new Set();
        this.intervals = new Set();
    }

    timeout(callback, delay) {
        let id = null;
        id = this.api.setTimeout(() => {
            this.timeouts.delete(id);
            callback();
        }, delay);
        this.timeouts.add(id);
        return id;
    }

    interval(callback, delay) {
        const id = this.api.setInterval(callback, delay);
        this.intervals.add(id);
        return id;
    }

    clear(id) {
        if (id === null || id === undefined) return;
        if (this.timeouts.delete(id)) this.api.clearTimeout(id);
        if (this.intervals.delete(id)) this.api.clearInterval(id);
    }

    clearAll() {
        for (const id of this.timeouts) this.api.clearTimeout(id);
        for (const id of this.intervals) this.api.clearInterval(id);
        this.timeouts.clear();
        this.intervals.clear();
    }

    get activeCount() {
        return this.timeouts.size + this.intervals.size;
    }
}
