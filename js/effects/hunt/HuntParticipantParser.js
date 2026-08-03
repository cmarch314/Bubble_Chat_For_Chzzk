class HuntParticipantParser {
    constructor() {
        this.personalities = {
            '공격적': 'offensive', '공격': 'offensive', '극공': 'offensive', '공격형': 'offensive', '딜러': 'offensive',
            '수비적': 'defensive', '수비': 'defensive', '방어적': 'defensive', '방어': 'defensive', '수비형': 'defensive', '방어형': 'defensive', '탱커': 'defensive',
            '베테랑': 'veteran', '숙련자': 'veteran', '고수': 'veteran', '배태랑': 'veteran', '배테랑': 'veteran', '베태랑': 'veteran', '베테랑형': 'veteran',
            '서포터': 'support', '서포트': 'support', '지원': 'support', '지원형': 'support', '지원가': 'support', '서폿': 'support',
            '뉴비': 'newbie', '초보': 'newbie', '몬린이': 'newbie', '뉴비형': 'newbie', '초보형': 'newbie',
            '밸런스': 'normal', '평범': 'normal', '일반': 'normal', '평범한': 'normal', '노멀': 'normal', '밸런': 'normal', '밸런스형': 'normal'
        };
        this.weapons = {
            '대검': 'great_sword', '그레이트소드': 'great_sword',
            '태도': 'long_sword', '롱소드': 'long_sword',
            '한손검': 'sword_shield', '손검': 'sword_shield', '한손': 'sword_shield', '검방': 'sword_shield',
            '쌍검': 'dual_blades', '쌍도': 'dual_blades', '듀블': 'dual_blades',
            '해머': 'hammer', '망치': 'hammer',
            '수렵피리': 'hunting_horn', '피리': 'hunting_horn', '수피': 'hunting_horn',
            '랜스': 'lance', '창': 'lance',
            '건랜스': 'gunlance', '건랜': 'gunlance', '건창': 'gunlance',
            '슬래시액스': 'switch_axe', '슬액': 'switch_axe', '스위치액스': 'switch_axe',
            '차지액스': 'charge_blade', '차액': 'charge_blade', '차지블레이드': 'charge_blade',
            '조충곤': 'insect_glaive', '충곤': 'insect_glaive', '벌레봉': 'insect_glaive',
            '라이트보건': 'light_bowgun', '라이트보우건': 'light_bowgun', '라보': 'light_bowgun',
            '헤비보건': 'heavy_bowgun', '헤비보우건': 'heavy_bowgun', '헤보': 'heavy_bowgun',
            '활': 'bow', '보우': 'bow'
        };
    }

    parseRecruitment(message) {
        const tokens = this._tokens(message);
        if (tokens.length !== 1) return null;
        return tokens[0] === '참가' ? { join: true } : null;
    }

    parseReady(message) {
        const normalized = String(message || '').normalize('NFKC').trim().toLowerCase();
        return /^!\s*준비$/.test(normalized) ? { ready: true } : null;
    }

    parsePerkReroll(message) {
        const normalized = String(message || '').normalize('NFKC').trim().toLowerCase();
        return /^!\s*(?:리롤|퍽리롤)$/.test(normalized) ? { reroll: true } : null;
    }

    parsePerkLock(message) {
        const normalized = String(message || '').normalize('NFKC').trim().toLowerCase();
        const match = normalized.match(/^!\s*잠금\s*(\d+)$/);
        if (!match) return null;
        return { perkIndex: Number(match[1]) - 1 };
    }

    parsePerkUnlock(message) {
        const normalized = String(message || '').normalize('NFKC').trim().toLowerCase();
        const match = normalized.match(/^!\s*해제\s*(\d+)$/);
        if (!match) return null;
        return { perkIndex: Number(match[1]) - 1 };
    }

    parseLoadout(message) {
        if (!/[!！]/.test(String(message || ''))) return null;
        const tokens = this._tokens(message);
        if (!tokens.length) return null;

        let weaponId = null;
        let personality = null;
        let recommend = false;
        const recognized = [];

        tokens.forEach(token => {
            if (this.weapons[token]) {
                weaponId = this.weapons[token];
                recognized.push(token);
            } else if (this.personalities[token]) {
                personality = this.personalities[token];
                recognized.push(token);
            } else if (token === '추천' || token === '자동추천') {
                recommend = true;
                recognized.push(token);
            }
        });

        if (!weaponId && !personality && !recommend) return null;
        return { weaponId, personality, recommend, recognized };
    }

    // 구형 슬롯 참가 명령은 외부 호환을 위해서만 유지한다.
    parse(message, msgData = {}, debugMode = false) {
        const cleaned = (message || '').replace(/^!?참가\s+/, '').trim();
        const match = cleaned.match(/^!?([1-4])(?:[\s,]+(.+))?$/);
        if (!match) return null;
        const loadout = this.parseLoadout(`!${match[2] || ''}`) || {};
        return {
            index: Number(match[1]) - 1,
            isSubscriber: this._isSubscriber(msgData, debugMode),
            weaponId: loadout.weaponId || null,
            personality: loadout.personality || null
        };
    }

    _tokens(message) {
        return String(message || '')
            .normalize('NFKC')
            .replace(/[!！]+/g, ' ')
            .replace(/[,，/|+·ㆍ]+/g, ' ')
            .trim()
            .split(/\s+/)
            .map(token => token.trim().toLowerCase())
            .filter(Boolean);
    }

    _isSubscriber(msgData, debugMode) {
        if (msgData.isSubscriber || msgData.isSubscription || msgData.isStreamer || debugMode) return true;
        if (!Array.isArray(msgData.badges)) return false;
        return msgData.badges.some(badge => {
            const id = (badge.badgeId || '').toLowerCase();
            const title = (badge.title || badge.name || '').toLowerCase();
            const url = (badge.imageUrl || badge.url || '').toLowerCase();
            return id.includes('subscription') || id.includes('subscriber') || id.includes('sub')
                || title.includes('구독') || title.includes('sub')
                || url.includes('subscription') || url.includes('subscriber') || url.includes('sub');
        });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntParticipantParser;
else window.HuntParticipantParser = HuntParticipantParser;
