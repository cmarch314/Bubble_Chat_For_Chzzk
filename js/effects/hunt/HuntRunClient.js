class HuntRunClient {
    constructor(options = {}) {
        this.endpoint = options.endpoint || LocalCompanionEndpoint.url(HuntRunState.ENDPOINT_PATH);
        this.fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
        this.timeoutMs = Number(options.timeoutMs || 700);
    }

    async request(method, channelKey, state, expectedRevision) {
        if (!this.fetchImpl || !channelKey) return null;
        const url = `${this.endpoint}?channelKey=${encodeURIComponent(channelKey)}`;
        const options = { method, cache: 'no-store', headers: {} };
        if (state) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify({ state, expectedRevision });
        }
        let timeoutId = null;
        try {
            const response = await Promise.race([
                this.fetchImpl(url, options),
                new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('run request timeout')), this.timeoutMs);
                })
            ]);
            if (!response?.ok) return null;
            return (await response.json()).state || null;
        } catch (_) { return null; }
        finally { if (timeoutId) clearTimeout(timeoutId); }
    }

    load(channelKey) { return this.request('GET', channelKey); }
    save(channelKey, state, expectedRevision = state?.revision || 0) { return this.request('POST', channelKey, state, expectedRevision); }
    remove(channelKey) { return this.request('DELETE', channelKey); }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntRunClient;
else globalThis.HuntRunClient = HuntRunClient;
