'use strict';

class HuntMonsterEditionResolver {
    static DEFAULT_SOURCE_ORDER = Object.freeze([
        'wilds',
        'rise-sunbreak',
        'world-iceborne',
        'world-shell',
        'generations-ultimate-db',
        'generations-ultimate',
        'published'
    ]);

    static EDITION_SOURCES = Object.freeze({
        'wilds': Object.freeze(['wilds']),
        'rise-sunbreak': Object.freeze(['rise-sunbreak']),
        'world-iceborne': Object.freeze(['world-iceborne', 'world-shell']),
        'generations-ultimate': Object.freeze(['generations-ultimate-db', 'generations-ultimate'])
    });

    static normalizeEdition(value) {
        return String(value || '').trim().toLowerCase().replace(/_/g, '-');
    }

    static sourceOrder(canonicalEdition = null, strict = false) {
        const edition = this.normalizeEdition(canonicalEdition);
        const preferred = this.EDITION_SOURCES[edition] || [];
        if (strict) return [...preferred];
        return [...new Set([...preferred, ...this.DEFAULT_SOURCE_ORDER])];
    }

    static resolve(sources = {}, options = {}) {
        const canonicalEdition = this.normalizeEdition(options.canonicalEdition);
        const strict = Boolean(options.strict);
        for (const source of this.sourceOrder(canonicalEdition, strict)) {
            const patterns = sources[source];
            if (Array.isArray(patterns) && patterns.length) {
                return Object.freeze({
                    canonicalEdition: canonicalEdition || null,
                    source,
                    patterns
                });
            }
        }
        return null;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterEditionResolver;
else globalThis.HuntMonsterEditionResolver = HuntMonsterEditionResolver;
