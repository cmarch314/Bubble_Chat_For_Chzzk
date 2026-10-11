const HuntCommandRules = typeof HuntCommandCatalog !== 'undefined'
    ? HuntCommandCatalog
    : (typeof require === 'function' ? require('./HuntCommandCatalog') : null);
const HuntPersistentProfileRules = typeof HuntProfileContract !== 'undefined'
    ? HuntProfileContract
    : (typeof require === 'function' ? require('./HuntProfileContract') : null);
const HuntPersonalityRules = typeof HuntPersonalityProfiles !== 'undefined'
    ? HuntPersonalityProfiles
    : (typeof require === 'function' ? require('./HuntPersonalityProfiles') : null);
const HuntIssuedSupplyRules = typeof HuntIssuedSupplyRuntime !== 'undefined'
    ? HuntIssuedSupplyRuntime
    : (typeof require === 'function' ? require('./HuntIssuedSupplyRuntime') : null);
const HUNT_EXCLUDED_CROSSOVER_MONSTERS = new Set(['leshen', 'ancient_leshen']);

class HuntInitializer {
    constructor(options = {}) {
        this.random = options.random || Math.random;
        this.weaponInstanceCatalog = typeof HuntWeaponInstanceCatalog !== 'undefined'
            ? new HuntWeaponInstanceCatalog(typeof HUNT_WILDS_WEAPON_INSTANCES !== 'undefined' ? HUNT_WILDS_WEAPON_INSTANCES : [], this.random)
            : null;
        this.WEAPONS = window.HUNT_WEAPONS || [
            { id: 'great_sword', name: '대검', filename: 'great_sword.svg', type: 'shield', speedGroup: 'slow' },
            { id: 'long_sword', name: '태도', filename: 'long_sword.svg', type: 'melee', speedGroup: 'fast' },
            { id: 'sword_shield', name: '한손검', filename: 'sword_shield.svg', type: 'shield', speedGroup: 'very_fast' },
            { id: 'dual_blades', name: '쌍검', filename: 'dual_blades.svg', type: 'melee', speedGroup: 'very_fast' },
            { id: 'hammer', name: '해머', filename: 'hammer.svg', type: 'melee', speedGroup: 'slow' },
            { id: 'hunting_horn', name: '수렵피리', filename: 'hunting_horn.svg', type: 'melee', speedGroup: 'normal' },
            { id: 'lance', name: '랜스', filename: 'lance.svg', type: 'shield', speedGroup: 'fast' },
            { id: 'gunlance', name: '건랜스', filename: 'gunlance.svg', type: 'shield', speedGroup: 'normal' },
            { id: 'switch_axe', name: '슬래시액스', filename: 'switch_axe.svg', type: 'melee', speedGroup: 'normal' },
            { id: 'charge_blade', name: '차지액스', filename: 'charge_blade.svg', type: 'shield', speedGroup: 'slow' },
            { id: 'insect_glaive', name: '조충곤', filename: 'insect_glaive.svg', type: 'melee', speedGroup: 'fast' },
            { id: 'light_bowgun', name: '라이트보건', filename: 'light_bowgun.svg', type: 'ranged', speedGroup: 'fast' },
            { id: 'heavy_bowgun', name: '헤비보건', filename: 'heavy_bowgun.svg', type: 'shield', speedGroup: 'normal' },
            { id: 'bow', name: '활', filename: 'bow.svg', type: 'ranged', speedGroup: 'very_fast' }
        ];

        this.fallbackMonsters = window.HUNT_RELEASED_MONSTER_DATA || window.MONSTER_DATA || [
            { id: "rathalos", nameEN: "Rathalos", nameKO: "리오레우스", filename: "rathalos.png" },
            { id: "diablos", nameEN: "Diablos", nameKO: "디아블로스", filename: "diablos.png" },
            { id: "nergigante", nameEN: "Nergigante", nameKO: "네르기간테", filename: "nergigante.png" },
            { id: "zinogre", nameEN: "Zinogre", nameKO: "진오우거", filename: "zinogre.png" },
            { id: "velkhana", nameEN: "Velkhana", nameKO: "벨카나", filename: "velkhana.png" }
        ];

        this.MONSTER_ATTACKS = window.MONSTER_ATTACKS || {
            rathalos: ["화룡의 포효", "화염구 브레스", "독조강습 타격", "꼬리 휩쓸기", "돌진 몸통박치기"],
            diablos: ["각룡의 포효", "지중 급습 쳐올리기", "각공격 들이받기", "꼬리 회전치기", "돌진 덮치기"],
            nergigante: ["멸진룡의 포효", "파멸의 일격 (지면 덮치기)", "가시 파편 발사", "날개 지면 강강타", "앞발 내려치기"],
            zinogre: ["뇌랑룡의 포효", "연속 전뇌 펀치", "등 찍기 폭발", "초전도 번개벼락", "꼬리 공중 회전베기"],
            velkhana: ["빙룡의 포효", "빙벽 생성 강타", "얼음 브레스 방출", "고리형 절대영도 폭발", "꼬리 얼음칼 찌르기"],
            default: ["포효 위협", "몸통 박치기", "꼬리 후려치기", "성난 돌진 공격"]
        };
        this.MONSTER_PATTERNS = HuntMonsterPatternCatalog.build(this.MONSTER_ATTACKS, this.fallbackMonsters);
        const patternErrors = [
            ...HuntMonsterPatternCatalog.validate(this.MONSTER_PATTERNS),
            ...(typeof HuntMonsterPatternCatalog.validateReleased === 'function'
                ? HuntMonsterPatternCatalog.validateReleased(this.MONSTER_PATTERNS)
                : [])
        ];
        if (patternErrors.length) console.warn('[HuntMonsterPatternCatalog] Invalid patterns:', patternErrors);

        this.COMBO_LIST = HuntWeaponCatalog.build(window.HUNT_COMBO_LIST || {});
        const catalogErrors = HuntWeaponCatalog.validate(this.COMBO_LIST);
        if (catalogErrors.length) {
            console.warn('[HuntWeaponCatalog] Invalid actions:', catalogErrors);
        }
    }

    parseCommand(message, monsters) {
        monsters = (monsters || []).filter(monster => !HUNT_EXCLUDED_CROSSOVER_MONSTERS.has(
            String(monster?.id || '').toLowerCase().replace(/-/g, '_')
        ));
        let consecutiveCount = 1;
        let targetMonsterName = null;
        let chosenWeaponIds = [];
        let huntMode = 'single';

        if (message) {
            const trimmed = message.trim();
            const command = HuntCommandRules.matchStart(trimmed);
            huntMode = command?.mode || 'single';
            const commandArgs = command?.args || '';
            const match = commandArgs.match(/^([1-9]|10)(?![0-9])/);
            if (match) {
                consecutiveCount = parseInt(match[1], 10);
            }

            const tokens = commandArgs ? commandArgs.split(/\s+/) : [];
            const WEAPON_CHAR_MAP = {
                '대': 'great_sword', '태': 'long_sword', '한': 'sword_shield', '쌍': 'dual_blades',
                '해': 'hammer', '피': 'hunting_horn', '건': 'gunlance', '랜': 'lance',
                '슬': 'switch_axe', '차': 'charge_blade', '충': 'insect_glaive', '활': 'bow',
                '라': 'light_bowgun', '헤': 'heavy_bowgun'
            };
            const weaponChars = Object.keys(WEAPON_CHAR_MAP);
            const monsterNameTokens = [];

            for (const token of tokens) {
                const isConsecutiveToken = /^[1-9]$|^10$|^[1-9]마리$|^10마리$/.test(token);
                if (isConsecutiveToken) continue;

                const isWeaponToken = token.length > 0 && token.split("").every(char => weaponChars.includes(char));
                if (isWeaponToken) {
                    token.split("").forEach(char => {
                        chosenWeaponIds.push(WEAPON_CHAR_MAP[char]);
                    });
                } else {
                    monsterNameTokens.push(token);
                }
            }

            if (monsterNameTokens.length > 0) {
                targetMonsterName = monsterNameTokens.join(" ");
            }
            if (command && !command.definition.acceptsArguments) {
                // The command catalog, not parser-specific mode checks, owns
                // whether route-affecting arguments are accepted.
                consecutiveCount = 1;
                targetMonsterName = null;
                chosenWeaponIds = [];
            }
        }

        let selectedMonster = null;
        let consecutiveQueue = [];
        let requestedMonsterMatched = targetMonsterName ? false : null;

        if (consecutiveCount > 1) {
            for (let i = 0; i < consecutiveCount; i++) {
                consecutiveQueue.push(monsters[Math.floor(this.random() * monsters.length)]);
            }
            selectedMonster = consecutiveQueue[0];
        } else if (targetMonsterName) {
            const nicknameMap = {
                '디아브로스': '디아블로스',
                '네기': '네르기간테',
                '발파': '발파루크',
                '이베르': '벨카나',
                '벨카': '벨카나',
                '멜제': '멜제나',
                '멜제나': '멜제나',
                '이슈': '안-이슈왈다',
                '무페토': '무페토-지바',
                '제노': '제노-지바',
                '지바': '지바-모르그',
                '로알': '로알루드로스',
                '레이아': '리오레이아',
                '디아': '디아블로스',
                '디블': '디아블로스',
                '진오': '진오우거',
                '바젤': '바젤기우스',
                '샤갈': '샤가르마가라',
                '고어': '고어-마가라'
            };
            const stableAliases = {
                '레우스': '리오레우스',
                '레우스 아종': '리오레우스 아종',
                '창화룡': '리오레우스 아종',
                '은화룡': '리오레우스 희소종',
                '레이아': '리오레이아',
                '레이아 아종': '리오레이아 아종',
                '앵화룡': '리오레이아 아종',
                '금화룡': '리오레이아 희소종',
                '티가': '티가렉스',
                '티가 아종': '티가렉스 아종',
                '얀가': '얀가루루가'
            };
            const searchName = stableAliases[targetMonsterName] || nicknameMap[targetMonsterName] || targetMonsterName;
            const normalizedSearch = String(searchName).trim().toLowerCase();
            const requestsVariant = /아종|희소종|특수개체|역전왕|deviant|subspecies|rare species/.test(normalizedSearch);
            const scoreMonsterMatch = monster => {
                const names = [monster.nameKO, monster.nameEN, monster.id]
                    .filter(Boolean).map(value => String(value).trim().toLowerCase());
                const variantPenalty = !requestsVariant && (
                    Boolean(monster.variantOf)
                    || names.some(value => /아종|희소종|특수개체|subspecies|rare species/.test(value))
                ) ? 75 : 0;
                if (names.some(value => value === normalizedSearch)) return 300 - variantPenalty;
                if (names.some(value => value.startsWith(normalizedSearch))) return 200 - variantPenalty;
                if (names.some(value => value.includes(normalizedSearch))) return 100 - variantPenalty;
                return 0;
            };
            const matched = monsters
                .map((monster, index) => ({ monster, index, score: scoreMonsterMatch(monster) }))
                .filter(candidate => candidate.score > 0)
                .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.monster;
            if (matched) {
                selectedMonster = matched;
                requestedMonsterMatched = true;
            }
            consecutiveQueue = selectedMonster ? [selectedMonster] : [];
        } else {
            selectedMonster = monsters[Math.floor(this.random() * monsters.length)];
            consecutiveQueue = [selectedMonster];
        }

        return {
            huntMode,
            consecutiveTotal: consecutiveCount,
            selectedMonster,
            consecutiveQueue,
            chosenWeaponIds,
            requestedMonsterName: targetMonsterName,
            requestedMonsterMatched
        };
    }

    applyPersistentProfile(hunter, profile) {
        if (!hunter || !profile || typeof profile !== 'object') return false;
        profile = HuntPersistentProfileRules.normalize(profile);
        let applied = false;
        if (Array.isArray(profile.perkIds) && typeof HuntPerkCatalog !== 'undefined') {
            const byId = new Map(HuntPerkCatalog.all().map(perk => [perk.id, perk]));
            const perks = [...new Set(profile.perkIds)]
                .map(id => byId.get(id))
                .filter(Boolean)
                .slice(0, HuntPersistentProfileRules.MAX_PERKS);
            hunter.perks = perks;
            hunter.lockedPerkId = perks.some(perk => perk.id === profile.lockedPerkId)
                ? profile.lockedPerkId
                : null;
            if (hunter.lockedPerkId) {
                hunter.perks = [
                    ...perks.filter(perk => perk.id === hunter.lockedPerkId),
                    ...perks.filter(perk => perk.id !== hunter.lockedPerkId)
                ];
            }
            hunter.perkModifiers = HuntPerkCatalog.aggregate(hunter.perks);
            applied = true;
        }
        hunter.profileLoaded = applied;
        return applied;
    }

    initialTrapCount(personality) {
        return Number(HuntPersonalityRules?.get(personality)?.issued?.shockTraps || 0);
    }

    initialFlashCount(personality) {
        return Number(HuntPersonalityRules?.get(personality)?.issued?.flashPods || 0);
    }

    syncLoadoutItems(hunter) {
        if (!hunter) return hunter;
        HuntIssuedSupplyRules?.grant(hunter, 'loadout', { force: true });
        return hunter;
    }

    grantIssuedSupplies(hunters, grantId) {
        return (hunters || []).map(hunter => HuntIssuedSupplyRules?.grant(hunter, grantId));
    }

    buildSelectedWeapons(chosenWeaponIds) {
        const selected = [];
        const chosen = chosenWeaponIds || [];
        for (let i = 0; i < Math.min(4, chosen.length); i++) {
            const foundWeapon = this.WEAPONS.find(w => w.id === chosen[i]);
            if (foundWeapon) {
                selected.push({ ...foundWeapon });
            }
        }
        while (selected.length < 4) {
            selected.push(this.WEAPONS[Math.floor(this.random() * this.WEAPONS.length)]);
        }

        const personalities = ['offensive', 'offensive', 'normal', 'normal', 'defensive', 'veteran', 'support', 'newbie'];
        return selected.map((w, index) => {
            const initialSpeedGroup = w.speedGroup;
            const personality = personalities[Math.floor(this.random() * personalities.length)];
            const perks = typeof HuntPerkCatalog !== 'undefined' ? HuntPerkCatalog.roll(this.random) : [];
            const issued = HuntPersonalityRules?.get(personality)?.issued || {};
            const hunter = {
                ...w,
                speedGroup: initialSpeedGroup,
                index,
                hp: 100,
                maxHp: 100,
                status: 'alive',
                sharpness: 100,
                ammo: 5,
                hasMoxie: true,
                atb: 0,
                comboIndex: 0,
                respawnTimer: 0,
                personality,
                perks,
                lockedPerkId: null,
                perkRerollCount: 0,
                perkModifiers: typeof HuntPerkCatalog !== 'undefined' ? HuntPerkCatalog.aggregate(perks) : {},
                potions: Number(issued.potions || 0),
                lifepowders: Number(issued.lifepowders || 0),
                shockTraps: Number(issued.shockTraps || 0),
                flashPods: Number(issued.flashPods || 0),
                bombs: Number(issued.bombs || 0),
                spiritLevel: 0,
                demonModeDuration: 0,
                phials: w.id === 'charge_blade' ? 0 : 5,
                shieldChargeDuration: 0,
                overheatDuration: 0,
                extractBuffs: { red: 0, white: 0, orange: 0 },
                extractDuration: 0
            };
            if (this.weaponInstanceCatalog) this.weaponInstanceCatalog.apply(hunter);
            return hunter;
        });
    }

    replaceHunterWeapon(hunter, weaponId) {
        const matchedWeapon = this.WEAPONS.find(weapon => weapon.id === weaponId);
        if (!hunter || !matchedWeapon) return false;
        const preserved = {
            index: hunter.index,
            hunterName: hunter.hunterName,
            hunterColor: hunter.hunterColor,
            personality: hunter.personality,
            perks: hunter.perks || [],
            lockedPerkId: hunter.lockedPerkId || null,
            perkModifiers: hunter.perkModifiers || {},
            isNpc: Boolean(hunter.isNpc),
            loadoutReady: Boolean(hunter.loadoutReady),
            perkRerolled: Boolean(hunter.perkRerolled),
            perkRerollCount: Number(hunter.perkRerollCount || (hunter.perkRerolled ? 1 : 0))
        };
        const initialSpeedGroup = matchedWeapon.speedGroup;
        const issued = HuntPersonalityRules?.get(preserved.personality)?.issued || {};
        Object.assign(hunter, {
            ...matchedWeapon,
            ...preserved,
            speedGroup: initialSpeedGroup,
            hp: 100,
            maxHp: 100,
            status: 'alive',
            sharpness: 100,
            ammo: 5,
            hasMoxie: true,
            atb: 0,
            comboIndex: 0,
            respawnTimer: 0,
            potions: Number(issued.potions || 0),
            lifepowders: Number(issued.lifepowders || 0),
            shockTraps: Number(issued.shockTraps || 0),
            flashPods: Number(issued.flashPods || 0),
            bombs: Number(issued.bombs || 0),
            spiritLevel: 0,
            demonModeDuration: 0,
            phials: matchedWeapon.id === 'charge_blade' ? 0 : 5,
            shieldChargeDuration: 0,
            overheatDuration: 0,
            extractBuffs: { red: 0, white: 0, orange: 0 },
            extractDuration: 0
        });
        if (this.weaponInstanceCatalog) this.weaponInstanceCatalog.apply(hunter);
        return true;
    }

    rerollHunterPerks(hunter) {
        if (!hunter || typeof HuntPerkCatalog === 'undefined') return false;
        const signature = perks => (perks || []).map(perk => perk.id).sort().join('|');
        const previous = signature(hunter.perks);
        const locked = hunter.lockedPerkId
            ? (hunter.perks || []).find(perk => perk.id === hunter.lockedPerkId)
            : null;
        const boundDung = (hunter.perks || []).find(perk => HuntPerkCatalog.isDung(perk));
        const retained = [locked, boundDung].filter((perk, index, list) =>
            perk && list.findIndex(candidate => candidate?.id === perk.id) === index
        );
        const withRetainedPerks = rolled => {
            const retainedIds = new Set(retained.map(perk => perk.id));
            return [
                ...retained,
                ...(rolled || []).filter(perk => !retainedIds.has(perk.id))
            ].slice(0, HuntPersistentProfileRules.MAX_PERKS);
        };
        let next = HuntPerkCatalog.roll(this.random);
        next = withRetainedPerks(next);
        for (let attempt = 0; attempt < 7 && signature(next) === previous; attempt++) {
            next = withRetainedPerks(HuntPerkCatalog.roll(this.random));
        }
        if (signature(next) === previous) {
            const alternative = HuntPerkCatalog.all().find(perk =>
                perk.name !== '빈 수첩' && !HuntPerkCatalog.isDung(perk)
                && !(hunter.perks || []).some(current => current.id === perk.id)
            );
            if (alternative) {
                next = withRetainedPerks(
                    next.length ? [...next.slice(0, -1), alternative] : [alternative]
                );
            }
        }
        next = withRetainedPerks(next);
        next = next.slice(0, HuntPersistentProfileRules.MAX_PERKS);
        hunter.perks = next;
        hunter.perkModifiers = HuntPerkCatalog.aggregate(next);
        return signature(next) !== previous;
    }

    materializeBattleStartPerks(hunters = []) {
        if (typeof HuntPerkCatalog === 'undefined') return [];
        const dung = HuntPerkCatalog.all().find(perk => HuntPerkCatalog.isDung(perk));
        if (!dung) return [];
        return hunters.filter(hunter => {
            if (!hunter || (hunter.perks || []).length > 0 || this.random() >= .1) return false;
            hunter.perks = [dung];
            hunter.perkModifiers = HuntPerkCatalog.aggregate(hunter.perks);
            hunter.dungAwakened = true;
            return true;
        });
    }

    getMonsterTier(monster) {
        if (!monster) return 'large';
        if (monster.selectable === false || monster.role === 'journey-event') return 'event';
        if (['small', 'medium', 'large', 'elder', 'colossal'].includes(monster.tier)) return monster.tier;
        const id = (monster.id || "").toLowerCase().replace(/'/g, '_');
        
        const smallIds = [
            'aptonoth', 'apceros', 'gajau', 'gastodon', 'girros', 'jagras', 
            'kestodon', 'kestodon_female', 'mernos', 'noios', 'barnos', 
            'cortos', 'raphinos', 'shamos', 'wulg', 'anteka', 'kelbi', 
            'popo',
            'mosswine', 'vespoid', 'hornetaur'
        ];
        if (smallIds.includes(id)) {
            return 'small';
        }

        const mediumIds = [
            'great_jagras', 'great_girros', 'kulu-ya-ku', 'tzitzi-ya-ku', 
            'dodogama', 'pukei-pukei', 'coral_pukei-pukei', 'royal_ludroth'
        ];
        if (mediumIds.includes(id)) {
            return 'medium';
        }

        const colossalIds = [
            'lao_shan_lung', 'yamatsukami', 'kulve_taroth', 'safi_jiiva', 
            'xeno_jiiva', 'shara_ishvalda', 'fatalis', 'amatsu', 
            'behemoth', 'akantor', 'ukanlos', 'nakarkos'
        ];
        if (colossalIds.includes(id)) {
            return 'colossal';
        }

        const elderIds = [
            'ancient_leshen', 'alatreon', 'blackveil_vaal_hazak',
            'chameleos', 'crimson_glow_valstrax', 'furious_rajang', 'kirin',
            'kushala_daora', 'lunastra', 'malzeno', 'namielle', 
            'nergigante', 'primordial_malzeno', 'ruiner_nergigante', 
            'teostra', 'vaal_hazak', 'valstrax', 'velkhana', 
            'shagaru_magala'
        ];
        if (elderIds.includes(id)) {
            return 'elder';
        }

        return 'large';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntInitializer;
} else {
    window.HuntInitializer = HuntInitializer;
}
