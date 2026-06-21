class HuntInitializer {
    constructor() {
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

        this.fallbackMonsters = window.MONSTER_DATA || [
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

        this.COMBO_LIST = window.HUNT_COMBO_LIST;
    }

    parseCommand(message, monsters) {
        let consecutiveCount = 1;
        let targetMonsterName = null;
        let chosenWeaponIds = [];

        if (message) {
            const trimmed = message.trim();
            const match = trimmed.match(/^!(수렵|토벌)\s*([1-9]|10)(?![0-9])/);
            if (match) {
                consecutiveCount = parseInt(match[2], 10);
            }

            const cleanedMsg = trimmed.replace(/^!(수렵|토벌)\s*/, "").trim();
            const tokens = cleanedMsg.split(/\s+/);
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
        }

        let selectedMonster = null;
        let consecutiveQueue = [];

        if (consecutiveCount > 1) {
            for (let i = 0; i < consecutiveCount; i++) {
                consecutiveQueue.push(monsters[Math.floor(Math.random() * monsters.length)]);
            }
            selectedMonster = consecutiveQueue[0];
        } else if (targetMonsterName) {
            const nicknameMap = {
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
            const searchName = nicknameMap[targetMonsterName] || targetMonsterName;
            const matched = monsters.find(m => 
                m.nameKO.includes(searchName) || 
                m.nameEN.toLowerCase().includes(searchName.toLowerCase()) ||
                m.id.toLowerCase().includes(searchName.toLowerCase())
            );
            if (matched) {
                selectedMonster = matched;
            } else {
                selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
            }
            consecutiveQueue = [selectedMonster];
        } else {
            selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
            consecutiveQueue = [selectedMonster];
        }

        return {
            consecutiveTotal: consecutiveCount,
            selectedMonster,
            consecutiveQueue,
            chosenWeaponIds
        };
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
            selected.push(this.WEAPONS[Math.floor(Math.random() * this.WEAPONS.length)]);
        }

        const personalities = ['offensive', 'offensive', 'normal', 'normal', 'defensive', 'veteran', 'support', 'newbie'];
        return selected.map((w, index) => {
            const initialSpeedGroup = w.id === 'charge_blade' ? 'very_fast' : w.speedGroup;
            const personality = personalities[Math.floor(Math.random() * personalities.length)];
            return {
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
                personality: personality,
                potions: 10,
                lifepowders: 1,
                spiritLevel: 0,
                demonModeDuration: 0,
                phials: w.id === 'charge_blade' ? 0 : 5,
                shieldChargeDuration: 0,
                overheatDuration: 0,
                extractBuffs: { red: 0, white: 0, orange: 0 },
                extractDuration: 0
            };
        });
    }

    getMonsterTier(monster) {
        if (!monster) return 'large';
        const id = (monster.id || "").toLowerCase();
        
        const smallIds = [
            'aptonoth', 'apceros', 'gajau', 'gastodon', 'girros', 'jagras', 
            'kestodon', 'kestodon_female', 'mernos', 'noios', 'barnos', 
            'cortos', 'raphinos', 'shamos', 'wulg', 'anteka', 'kelbi', 
            'popo', 'felyne', 'gajalaka', 'grimalkyne', 'boaboa', 
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

        const elderIds = [
            'ancient_leshen', 'alatreon', 'amatsu', 'behemoth', 'blackveil_vaal_hazak',
            'crimson_glow_valstrax', 'fatalis', 'furious_rajang', 'kirin', 
            'kulve_taroth', 'kushala_daora', 'lunastra', 'malzeno', 'namielle', 
            'nergigante', 'primordial_malzeno', 'ruiner_nergigante', 'safi_jiiva', 
            'shara_ishvalda', 'teostra', 'vaal_hazak', 'valstrax', 'velkhana', 
            'xeno_jiiva', 'shagaru_magala', 'akantor', 'ukanlos', 'nakarkos', 
            'lao_shan_lung', 'yamatsukami'
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
