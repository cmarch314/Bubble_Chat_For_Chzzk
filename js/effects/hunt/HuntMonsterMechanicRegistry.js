'use strict';

class HuntMonsterMechanicRegistry {
    static MODULES = Object.freeze({
        common: Object.freeze({
            owner: 'HuntMonsterActionPolicy',
            matches: () => true
        }),
        flight: Object.freeze({
            owner: 'HuntMonsterFlightRuntime',
            matches: pattern => pattern.flightTransition
                || pattern.tags?.includes('flight-only')
                || pattern.tags?.includes('air-compatible')
        }),
        'blast-scales': Object.freeze({
            owner: 'HuntMonsterTraitRuntime',
            matches: pattern => pattern.tags?.includes('blast') && pattern.tags?.includes('scale')
        }),
        elder: Object.freeze({
            owner: 'HuntMonsterRules',
            matches: () => true
        }),
        mist: Object.freeze({
            owner: 'HuntMonsterAttackAnimator',
            matches: pattern => pattern.delivery === 'gas' || pattern.tags?.includes('mist')
        }),
        burrow: Object.freeze({
            owner: 'HuntMonsterTurnExecutor/HuntMonsterAttackAnimator',
            matches: pattern => pattern.tags?.includes('burrow-enter')
                || pattern.tags?.includes('burrow-emerge')
        }),
        'charge-chain': Object.freeze({
            owner: 'HuntMonsterActionPolicy',
            matches: pattern => pattern.tags?.includes('multi-hit')
                && (pattern.tags?.includes('charge') || pattern.type === 'charge')
        }),
        tremor: Object.freeze({
            owner: 'HuntMonsterTurnExecutor',
            matches: pattern => String(pattern.interference?.kind || '').startsWith('tremor')
                || pattern.tags?.some(tag => String(tag).startsWith('tremor'))
        }),
        'rath-family': Object.freeze({
            owner: 'HuntMonsterArchetypeCatalog/HuntMonsterAnatomyCatalog',
            matches: pattern => pattern.flightTransition
                || pattern.tags?.includes('flight-only')
                || pattern.tags?.includes('tail')
        })
    });

    static validateKit(kit, patterns = []) {
        const errors = [];
        const authoredPatterns = patterns.flatMap(pattern =>
            pattern?.followUp ? [pattern, pattern.followUp] : [pattern]);
        for (const moduleId of kit?.runtime?.mechanicModules || []) {
            const descriptor = this.MODULES[moduleId];
            if (!descriptor) {
                errors.push(`${kit.id}: unregistered mechanic module "${moduleId}"`);
                continue;
            }
            if (!authoredPatterns.some(pattern => descriptor.matches(pattern, kit))) {
                errors.push(`${kit.id}: mechanic module "${moduleId}" has no authored pattern signal`);
            }
        }
        return errors;
    }

    static assertKit(kit, patterns = []) {
        const errors = this.validateKit(kit, patterns);
        if (errors.length) throw new Error(errors.join('\n'));
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterMechanicRegistry;
else globalThis.HuntMonsterMechanicRegistry = HuntMonsterMechanicRegistry;
