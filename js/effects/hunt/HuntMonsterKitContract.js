'use strict';

class HuntMonsterKitContract {
    static SCHEMA_VERSION = 1;
    static EDITIONS = Object.freeze([
        'world-iceborne',
        'rise-sunbreak',
        'wilds',
        'generations-ultimate'
    ]);
    static STAGES = Object.freeze([
        'inventory',
        'evidence-ready',
        'authored',
        'audited',
        'previewed',
        'released'
    ]);
    static RELEASE_GATES = Object.freeze([
        'evidence',
        'patterns',
        'anatomy',
        'animation',
        'audio',
        'preview',
        'simulation'
    ]);

    static normalizeId(value) {
        return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    }

    static validate(kit) {
        const errors = [];
        const add = (field, message) => errors.push(`${field}: ${message}`);
        if (!kit || typeof kit !== 'object' || Array.isArray(kit)) {
            return ['kit: expected an object'];
        }
        if (kit.schemaVersion !== this.SCHEMA_VERSION) {
            add('schemaVersion', `expected ${this.SCHEMA_VERSION}`);
        }
        const id = this.normalizeId(kit.id);
        if (!id || id !== kit.id || !/^[a-z0-9_]+$/.test(id)) {
            add('id', 'must be a normalized snake_case monster ID');
        }
        if (!String(kit.nameKO || '').trim()) add('nameKO', 'is required');
        if (!this.EDITIONS.includes(kit.canonicalEdition)) {
            add('canonicalEdition', 'must name a supported game edition');
        }
        if (kit.variantOf != null) {
            const variantOf = this.normalizeId(kit.variantOf);
            if (!variantOf || variantOf !== kit.variantOf || variantOf === id) {
                add('variantOf', 'must be a different normalized monster ID');
            }
        }

        const release = kit.release;
        if (!release || typeof release !== 'object') {
            add('release', 'is required');
        } else {
            if (!this.STAGES.includes(release.stage)) add('release.stage', 'is invalid');
            if (!Number.isInteger(release.order) || release.order < 0) {
                add('release.order', 'must be a non-negative integer');
            }
            if (release.stage === 'released') {
                if (!String(release.reviewId || '').trim()) add('release.reviewId', 'is required for release');
                if (!/^\d{4}-\d{2}-\d{2}$/.test(String(release.reviewedAt || ''))) {
                    add('release.reviewedAt', 'must be YYYY-MM-DD for release');
                }
                for (const gate of this.RELEASE_GATES) {
                    if (release.gates?.[gate] !== true) {
                        add(`release.gates.${gate}`, 'must be true for release');
                    }
                }
            }
        }

        if (!kit.runtime || typeof kit.runtime !== 'object') {
            add('runtime', 'is required');
        } else {
            if (this.normalizeId(kit.runtime.profileId) !== id) {
                add('runtime.profileId', 'must match the monster ID');
            }
            if (!Array.isArray(kit.runtime.mechanicModules) || !kit.runtime.mechanicModules.length) {
                add('runtime.mechanicModules', 'needs at least one explicit mechanic module');
            } else if (kit.runtime.mechanicModules.some(moduleId => !/^[a-z0-9-]+$/.test(String(moduleId)))) {
                add('runtime.mechanicModules', 'contains an invalid module ID');
            }
        }

        if (!Array.isArray(kit.evidenceRefs) || !kit.evidenceRefs.length) {
            add('evidenceRefs', 'needs at least one review or source reference');
        } else {
            kit.evidenceRefs.forEach((reference, index) => {
                if (!String(reference?.kind || '').trim()) add(`evidenceRefs[${index}].kind`, 'is required');
                if (!String(reference?.path || reference?.url || '').trim()) {
                    add(`evidenceRefs[${index}]`, 'needs path or url');
                }
            });
        }
        return errors;
    }

    static assertValid(kit, label = kit?.id || 'monster-kit') {
        const errors = this.validate(kit);
        if (errors.length) throw new Error(`${label}\n- ${errors.join('\n- ')}`);
        return kit;
    }

    static releaseRecord(kit) {
        this.assertValid(kit);
        if (kit.release.stage !== 'released') return null;
        return Object.freeze({
            id: kit.id,
            review: kit.release.reviewId,
            reviewedAt: kit.release.reviewedAt,
            order: kit.release.order,
            canonicalEdition: kit.canonicalEdition,
            variantOf: kit.variantOf || null,
            mechanicModules: Object.freeze([...kit.runtime.mechanicModules])
        });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterKitContract;
else globalThis.HuntMonsterKitContract = HuntMonsterKitContract;
