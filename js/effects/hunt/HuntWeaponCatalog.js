class HuntWeaponCatalog {
    static slug(value) {
        return String(value || '')
            .normalize('NFKD')
            .replace(/[^a-zA-Z0-9가-힣]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toLowerCase();
    }

    static timingFor(weaponId, action) {
        const name = action.name || '';
        const heavy = /참모아|초고출력|고출력|용격포|투구깨기|난무|용의 화살|기관용탄 난사|회전 회오리/.test(name);
        const quick = /발차기|병충전|진액 추출|귀인화|가드 대시|기폭용탄 설치/.test(name);
        if (heavy) return { windupTicks: 6, activeTicks: 4, recoveryTicks: 8, durationTicks: 18 };
        if (quick) return { windupTicks: 2, activeTicks: 2, recoveryTicks: 4, durationTicks: 8 };
        if (['great_sword', 'hammer', 'heavy_bowgun'].includes(weaponId)) {
            return { windupTicks: 4, activeTicks: 3, recoveryTicks: 6, durationTicks: 13 };
        }
        return { windupTicks: 3, activeTicks: 2, recoveryTicks: 5, durationTicks: 10 };
    }

    static tagsFor(weaponId, action) {
        const name = action.name || '';
        const tags = [];
        if (/방패|가드/.test(name)) tags.push('guard-point');
        if (/간파|카운터|태클/.test(name)) tags.push('counter');
        if (/포격|용격|탄|사격|화살/.test(name)) tags.push('ranged');
        if (/모아|차지/.test(name)) tags.push('charge');
        if (/난무|연사|속사|기관용탄/.test(name)) tags.push('multi-hit');
        if (/변형/.test(name)) tags.push('transform');
        if (/연주|회복/.test(name)) tags.push('support');
        if (weaponId === 'hammer' || /방패치기/.test(name)) tags.push('blunt');
        else tags.push('sever');
        return [...new Set(tags)];
    }

    static audioFor(weaponId, action) {
        const tags = HuntWeaponCatalog.tagsFor(weaponId, action);
        if (/용격|초고출력|풀버스트/.test(action.name || '')) return 'explosive_heavy';
        if (tags.includes('ranged')) return weaponId === 'bow' ? 'bow_shot' : 'bowgun_shot';
        if (tags.includes('blunt')) return Number(action.dmg || 0) >= 300 ? 'blunt_heavy' : 'blunt_light';
        if (tags.includes('transform')) return 'mechanical_transform';
        return Number(action.dmg || 0) >= 300 ? 'slash_heavy' : 'slash_light';
    }

    static build(comboList = {}) {
        const catalog = {};
        Object.entries(comboList).forEach(([weaponId, actions]) => {
            catalog[weaponId] = (actions || []).map((action, index) => {
                const timing = HuntWeaponCatalog.timingFor(weaponId, action);
                return {
                    ...action,
                    id: action.id || `${weaponId}.${index}.${HuntWeaponCatalog.slug(action.name)}`,
                    motionValue: Number(action.motionValue || action.dmg || 0),
                    hits: Array.isArray(action.hits) ? action.hits : [100],
                    tags: action.tags || HuntWeaponCatalog.tagsFor(weaponId, action),
                    audioCue: action.audioCue || HuntWeaponCatalog.audioFor(weaponId, action),
                    sourceGame: action.sourceGame || 'mixed_reference',
                    confidence: action.confidence || 'legacy-unverified',
                    ...timing
                };
            });
        });
        return catalog;
    }

    static validate(catalog) {
        const errors = [];
        Object.entries(catalog || {}).forEach(([weaponId, actions]) => {
            const ids = new Set();
            (actions || []).forEach((action, index) => {
                if (!action.id || ids.has(action.id)) errors.push(`${weaponId}[${index}] invalid or duplicate id`);
                ids.add(action.id);
                if (!action.name) errors.push(`${weaponId}[${index}] missing name`);
                if (!Number.isFinite(action.motionValue)) errors.push(`${weaponId}[${index}] invalid motion value`);
                if (!action.audioCue) errors.push(`${weaponId}[${index}] missing audio cue`);
            });
        });
        return errors;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntWeaponCatalog;
} else {
    window.HuntWeaponCatalog = HuntWeaponCatalog;
}
