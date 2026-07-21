class HuntMonsterPatternCatalog {
    static slug(value) {
        return String(value || '').replace(/[^a-zA-Z0-9가-힣]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
    }

    static infer(name, index = 0) {
        const statusText = String(name || '').toLowerCase();
        const statusTag = /독|맹독|poison|venom/.test(statusText) ? 'poison'
            : /마비|paraly|신경독/.test(statusText) ? 'paralysis'
            : /수면|최면|sleep|졸음/.test(statusText) ? 'sleep' : null;
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
        if (ultimate) { damageRatio = 0.90; windupTicks = 14; recoveryTicks = 18; maxTargets = 4; }
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
            minTargets: ultimate ? 4 : area || roar ? 2 : 1,
            maxTargets,
            cooldownTicks: ultimate ? 450 : area ? 45 : 25,
            weight: roar ? 0.25 : ultimate ? 0.55 : 1,
            tags: [roar && 'roar', ultimate && 'ultimate', projectile && 'projectile', area && 'area', charge && 'charge', element && 'elemental', statusTag].filter(Boolean),
            sourceGame: 'mixed_reference',
            confidence: 'pattern-inferred'
        };
    }

    static fallbackForMonster(monster = {}) {
        const id = String(monster.id || 'unknown_monster').replace(/[-']/g, '_');
        const name = monster.nameKO || monster.nameEN || id;
        const small = /^(?:apceros|aptonoth|barnos|felyne|gajalaka|gajau|gastodon|girros|grimalkyne|hornetaur|jagras|kelbi|kestodon|mernos|mosswine|noios|popo|raphinos|shamos|vespoid|wulg|anteka|boaboa)$/.test(id);
        const flying = /rath|legiana|paolumu|bazel|tigrex|nargacuga|barioth|seregios|astalos|valstrax|pukei|kushala|teostra|lunastra/.test(id);
        const burrow = /diablos|jyuratodus|lavasioth|beotodus|barroth|radobaan|uragaan|shara|akantor|ukanlos/.test(id);
        const agile = /odogaron|tobi|zinogre|rajang|kirin|nargacuga|barioth|lunagaron/.test(id);
        const elemental = /rath|anjanath|teostra|lunastra|fatalis|glavenus|gravios|agni/.test(id) ? ['화염', 'elemental']
            : /zinogre|kirin|astalos|lagiacrus|rajang/.test(id) ? ['뇌격', 'elemental']
            : /velkhana|beotodus|barioth|gammoth|ukanlos|lunagaron/.test(id) ? ['빙결', 'elemental']
            : /mizutsune|jyuratodus|royal_ludroth|namielle|amatsu|somnacanth/.test(id) ? ['수류', 'elemental']
            : /gore|shagaru|valstrax|deviljho|nakarkos|alatreon/.test(id) ? ['용속성', 'elemental']
            : /pukei|rathian|garuga|gypceros|chameleos/.test(id) ? ['독', 'poison']
            : ['충격', 'physical'];
        if (/great_girros|volvidon/.test(id)) elemental.splice(0, 2, '마비', 'paralysis');
        else if (/radobaan|nightshade_paolumu|somnacanth/.test(id)) elemental.splice(0, 2, '수면', 'sleep');
        const evidence = 'web-reference:kiranico-species-attack-table';
        const make = (suffix, label, type, damageRatio, options = {}) => ({
            id: `${id}.${suffix}`, name: `${name} ${label}`, type, damageRatio,
            windupTicks: options.windup || 5, activeTicks: options.active || 2, recoveryTicks: options.recovery || 8,
            minTargets: options.minTargets || 1, maxTargets: options.maxTargets || 1,
            cooldownTicks: options.cooldown || 30, weight: options.weight || 1,
            tags: options.tags || [type], requiredState: options.state,
            sourceGame: 'latest-available-reference', evidence, confidence: 'archetype-curated'
        });
        if (small) return [
            make('alert', '위협 울음', 'roar', 0, { maxTargets: 4, tags: ['roar'], weight: 0.35 }),
            make('rush', agile ? '재빠른 덮치기' : '필사적인 돌진', 'charge', 0.20, { windup: 4, recovery: 7, maxTargets: 2 }),
            make('swarm', '무리 협공', 'area', 0.24, { minTargets: 2, maxTargets: 3, cooldown: 45 })
        ];
        return [
            make('roar', '포효', 'roar', 0, { maxTargets: 4, tags: ['roar'], weight: 0.28 }),
            make('signature', flying ? '급강하 강습' : burrow ? '지면 급습' : agile ? '연속 발톱공격' : '전력 몸통박치기', flying || burrow ? 'charge' : 'physical', 0.31, { windup: 6, recovery: 9, maxTargets: 2 }),
            make('element', `${elemental[0]} 방출`, elemental[1] === 'physical' ? 'physical' : 'projectile', 0.32, { maxTargets: 3, tags: [elemental[1], elemental[1] === 'physical' ? 'physical' : 'projectile'] }),
            make('sweep', flying ? '꼬리 대회전' : burrow ? '지반 붕괴' : '전방위 휩쓸기', 'area', 0.37, { minTargets: 2, maxTargets: 4, recovery: 12, cooldown: 44, tags: ['area'] }),
            make('enraged', `${elemental[0]} 폭주 연계`, 'ultimate', 0.90, { minTargets: 4, maxTargets: 4, windup: 14, recovery: 18, cooldown: 450, state: 'enraged', weight: 0.55, tags: ['ultimate', elemental[1], 'multi-hit'] })
        ];
    }

    static build(monsterAttacks = {}, monsters = []) {
        const result = {};
        const scope = typeof window !== 'undefined' ? window : globalThis;
        const overrides = scope.HUNT_MONSTER_PATTERN_OVERRIDES || {};
        const monsterById = new Map((monsters || []).map(monster => [String(monster.id || '').replace(/[-']/g, '_'), monster]));
        const monsterIds = new Set([...Object.keys(monsterAttacks), ...Object.keys(overrides), ...monsterById.keys()]);
        monsterIds.forEach(monsterId => {
            const attacks = monsterAttacks[monsterId] || [];
            if (overrides[monsterId]) {
                result[monsterId] = overrides[monsterId].map(pattern => pattern.tags?.includes('ultimate') || pattern.type === 'ultimate'
                    ? { ...pattern, type: 'ultimate', damageRatio: 0.90, minTargets: 4, maxTargets: 4, weight: 0.55,
                        cooldownTicks: Math.max(450, Number(pattern.cooldownTicks || 0)),
                        windupTicks: Math.max(14, Number(pattern.windupTicks || 0)), recoveryTicks: Math.max(18, Number(pattern.recoveryTicks || 0)),
                        tags: [...new Set([...(pattern.tags || []), 'ultimate', 'all-target'])] }
                    : { ...pattern });
                return;
            }
            if (!attacks.length && monsterById.has(monsterId)) {
                result[monsterId] = HuntMonsterPatternCatalog.fallbackForMonster(monsterById.get(monsterId));
                return;
            }
            result[monsterId] = (attacks || []).map((attack, index) => typeof attack === 'string'
                ? { ...HuntMonsterPatternCatalog.infer(attack, index), id: `${monsterId}.${HuntMonsterPatternCatalog.slug(attack)}` }
                : { ...HuntMonsterPatternCatalog.infer(attack.name || attack.id, index), ...attack });
        });
        if (typeof HuntMonsterFlightRuntime !== 'undefined') {
            Object.entries(result).forEach(([monsterId, patterns]) => {
                result[monsterId] = patterns.map(pattern => HuntMonsterFlightRuntime.decoratePattern(monsterId, pattern));
            });
        }
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
                if (!(pattern.damageRatio >= 0 && pattern.damageRatio <= 0.90)) errors.push(`${monsterId}[${index}] unsafe damage ratio`);
                if (!(pattern.windupTicks >= 0 && pattern.recoveryTicks >= 0)) errors.push(`${monsterId}[${index}] invalid timing`);
            });
        });
        return errors;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterPatternCatalog;
else window.HuntMonsterPatternCatalog = HuntMonsterPatternCatalog;
