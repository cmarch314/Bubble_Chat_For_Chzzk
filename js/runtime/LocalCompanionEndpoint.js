class LocalCompanionEndpoint {
    static DEFAULT_ORIGIN = 'http://127.0.0.1:17890';

    static origin(globalObject = typeof globalThis !== 'undefined' ? globalThis : {}) {
        const configured = String(globalObject.BUBBLECHAT_COMPANION_ORIGIN || '').trim().replace(/\/$/, '');
        if (/^https?:\/\/(127\.0\.0\.1|localhost)(?::\d+)?$/i.test(configured)) return configured;
        const location = globalObject.location;
        if (location && /^https?:$/.test(location.protocol) && /^(127\.0\.0\.1|localhost)$/i.test(location.hostname)) {
            return String(location.origin).replace(/\/$/, '');
        }
        return this.DEFAULT_ORIGIN;
    }

    static url(pathname, search = {}, globalObject) {
        const safePath = String(pathname || '').startsWith('/') ? String(pathname) : `/${pathname}`;
        const query = Object.entries(search)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
            .join('&');
        return `${this.origin(globalObject)}${safePath}${query ? `?${query}` : ''}`;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = LocalCompanionEndpoint;
else globalThis.LocalCompanionEndpoint = LocalCompanionEndpoint;
