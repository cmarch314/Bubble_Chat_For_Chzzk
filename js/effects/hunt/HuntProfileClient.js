const HuntProfileRules = typeof HuntProfileContract !== 'undefined'
    ? HuntProfileContract
    : (typeof require === 'function' ? require('./HuntProfileContract') : null);

class HuntProfileClient {
    constructor(options = {}) {
        this.endpoint = options.endpoint || HuntProfileRules.endpoint();
        this.fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
        this.timeoutMs = Number(options.timeoutMs || HuntProfileRules.REQUEST_TIMEOUT_MS);
        this.saveDelayMs = Number(options.saveDelayMs || HuntProfileRules.SAVE_DELAY_MS);
        this.cache = new Map();
        this.pendingLoads = new Map();
        this.saveTimers = new Map();
    }

    identity(subject) {
        if (!subject || subject.isNpc) return null;
        const uid = String(subject.participantUid || subject.uid || '').trim();
        const nickname = String(subject.hunterName || subject.nickname || '').trim();
        if (!uid && !nickname) return null;
        return { uid: uid || null, nickname: nickname || null, key: uid ? `uid:${uid}` : `nickname:${nickname.normalize('NFKC').toLocaleLowerCase('ko-KR')}` };
    }

    async load(subject) {
        const identity = this.identity(subject);
        if (!identity || !this.fetchImpl) return null;
        if (this.cache.has(identity.key)) return this.cache.get(identity.key);
        if (this.pendingLoads.has(identity.key)) return this.pendingLoads.get(identity.key);
        const query = new URLSearchParams();
        if (identity.uid) query.set('uid', identity.uid);
        if (identity.nickname) query.set('nickname', identity.nickname);
        const task = this.withTimeout(this.fetchImpl(`${this.endpoint}?${query}`, { cache: 'no-store' }))
            .then(response => response && response.ok ? response.json() : null)
            .then(payload => payload?.profile ? HuntProfileRules.normalize(payload.profile) : null)
            .catch(() => null)
            .then(profile => {
                if (profile) this.cache.set(identity.key, profile);
                this.pendingLoads.delete(identity.key);
                return profile;
            });
        this.pendingLoads.set(identity.key, task);
        return task;
    }

    snapshot(hunter) {
        return HuntProfileRules.snapshot(hunter);
    }

    scheduleSave(hunter) {
        const identity = this.identity(hunter);
        if (!identity || !this.fetchImpl) return false;
        const previous = this.saveTimers.get(identity.key);
        if (previous) clearTimeout(previous);
        const timer = setTimeout(() => {
            this.saveTimers.delete(identity.key);
            this.saveNow(hunter);
        }, this.saveDelayMs);
        this.saveTimers.set(identity.key, timer);
        return true;
    }

    async saveNow(hunter) {
        const identity = this.identity(hunter);
        if (!identity || !this.fetchImpl) return null;
        const existing = this.saveTimers.get(identity.key);
        if (existing) clearTimeout(existing);
        this.saveTimers.delete(identity.key);
        const profile = this.snapshot(hunter);
        try {
            const response = await this.withTimeout(this.fetchImpl(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: identity.uid, nickname: identity.nickname, profile })
            }));
            if (!response?.ok) return null;
            const payload = await response.json();
            const saved = HuntProfileRules.normalize(payload?.profile || profile);
            this.cache.set(identity.key, saved);
            return saved;
        } catch (_) {
            return null;
        }
    }

    withTimeout(promise) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('Local profile request timed out')), this.timeoutMs);
            Promise.resolve(promise).then(value => {
                clearTimeout(timer);
                resolve(value);
            }, error => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    dispose() {
        this.saveTimers.forEach(timer => clearTimeout(timer));
        this.saveTimers.clear();
        this.pendingLoads.clear();
        this.cache.clear();
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntProfileClient;
else window.HuntProfileClient = HuntProfileClient;
