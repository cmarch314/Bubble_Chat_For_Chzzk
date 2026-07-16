class HuntMonsterPatternCatalog {
    static slug(value) {
        return String(value || '').replace(/[^a-zA-Z0-9가-힣]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
    }

    static infer(name, index = 0) {
        const roar = /포효|노성|울부짖|울음|위협 소리|노래/.test(name);
        const ultimate = /에스카톤|황도|슈퍼노바|헬 플레어|겁염|대재앙|혜성|초폭|대폭발|절대영도/.test(name);
        const projectile = /브레스|탄환|레이저|발사|투척|번개|벼락|수류|비늘|가시/.test(name);
        const area = /회전|휩쓸|폭발|폭사|폭풍|지진|연쇄|난무|분사|주변|대지/.test(name);
        const charge = /돌진|급습|강습|활공|덮치|들이받|쳐올리|바디프레스/.test(name);
        const element = /화염|불꽃|폭|빙|얼음|번개|전격|뇌|용속성|독|수압|물|바람|점균/.test(name);
        let damageRatio = 0.27;
        let windupTicks = 5;
        let recoveryTicks = 7;
        let maxTargets = 1;
        if (charge) { damageRatio = 0.36; windupTicks = 6; recoveryTicks = 9; }
        if (projectile) { damageRatio = 0.30; maxTargets = 2; }
        if (area) { damageRatio = 0.34; maxTargets = 4; recoveryTicks = 11; }
        if (ultimate) { damageRatio = 0.58; windupTicks = 12; recoveryTicks = 16; maxTargets = 4; }
        if (roar) { damageRatio = 0; windupTicks = 3; recoveryTicks = 8; maxTargets = 4; }
        return {
            id: `pattern.${index}.${HuntMonsterPatternCatalog.slug(name)}`,
            name,
            type: roar ? 'roar' : ultimate ? 'ultimate' : projectile ? 'projectile' : charge ? 'charge' : area ? 'area' : 'physical',
            element: element ? 'inferred' : 'raw',
            damageRatio,
            windupTicks,
            activeTicks: ultimate ? 5 : 2,
            recoveryTicks,
            minTargets: area || roar || ultimate ? 2 : 1,
            maxTargets,
            cooldownTicks: ultimate ? 90 : area ? 45 : 25,
            weight: roar ? 0.25 : ultimate ? 0.45 : 1,
            tags: [roar && 'roar', ultimate && 'ultimate', projectile && 'projectile', area && 'area', charge && 'charge', element && 'elemental'].filter(Boolean),
            sourceGame: 'mixed_reference',
            confidence: 'pattern-inferred'
        };
    }

    static build(monsterAttacks = {}) {
        const result = {};
        const scope = typeof window !== 'undefined' ? window : globalThis;
        const overrides = scope.HUNT_MONSTER_PATTERN_OVERRIDES || {};
        Object.entries(monsterAttacks).forEach(([monsterId, attacks]) => {
            if (overrides[monsterId]) {
                result[monsterId] = overrides[monsterId].map(pattern => ({ ...pattern }));
                return;
            }
            result[monsterId] = (attacks || []).map((attack, index) => typeof attack === 'string'
                ? { ...HuntMonsterPatternCatalog.infer(attack, index), id: `${monsterId}.${HuntMonsterPatternCatalog.slug(attack)}` }
                : { ...HuntMonsterPatternCatalog.infer(attack.name || attack.id, index), ...attack });
        });
        return result;
    }

    static validate(catalog = {}) {
        const errors = [];
        Object.entries(catalog).forEach(([monsterId, patterns]) => {
            const ids = new Set();
            (patterns || []).forEach((pattern, index) => {
                if (!pattern.id || ids.has(pattern.id)) errors.push(`${monsterId}[${index}] duplicate or missing id`);
                ids.add(pattern.id);
                if (!pattern.name) errors.push(`${monsterId}[${index}] missing name`);
                if (!(pattern.damageRatio >= 0 && pattern.damageRatio <= 0.75)) errors.push(`${monsterId}[${index}] unsafe damage ratio`);
                if (!(pattern.windupTicks >= 0 && pattern.recoveryTicks >= 0)) errors.push(`${monsterId}[${index}] invalid timing`);
            });
        });
        return errors;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterPatternCatalog;
else window.HuntMonsterPatternCatalog = HuntMonsterPatternCatalog;
