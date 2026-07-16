class HuntPerkCatalog {
    static get names() {
        return [
            '겁쟁이','앙심','토끼손','도전자','공격','방어','회피 거리 UP','회피 성능','가드 성능','가드 강화',
            '완전 충전','역전','불굴','재난대처능력','전화위복','돌파구','버섯 애호가','빨리 먹기','만족감','광역화',
            '체력 회복량 UP','정령의 가호','체력 증강','기절 내성','귀마개','풍압 내성','내진','납도술','숫돌 사용 고속화','칼날 연마',
            '명검','장인','심안','약점 특효','간파','슈퍼회심','힘의 해방','혼신','연격','연마술 예',
            '집중','강화 지속','포술','포탄 장전','특수 사격 강화','통상탄 강화','관통탄 강화','산탄 강화','탄환 절약','명검의 가르침',
            'KO술','스태미나 탈취','파괴왕','집중 포화','꼬리 수집가','두개골 측량사','날개 꺾기','철벽','공세적 방어','도발',
            '은신','발도술','특수납도 중독','귀인화 체질','선율 강박','포격 낭만','병 수집벽','영거리 집착','삼색 탐닉','용화살 신봉',
            '상태이상 공격 강화','독사','마비 사냥꾼','잠재우는 손','폭파광','덫 장인','포획 명인','섬광 조제사','광역 분진','우애',
            '만족할 줄 모름','절약가','야생의 치료사','영웅의 증표','희생 방패','혈기','신속 교체','무모한 준비','완벽주의','임기응변',
            '길치','고양이 혀','물욕 센서','수레 애호가','훈타','벌꿀 주세요','캠프 수호자','한 대만','빈 수첩','새벽의 생존자'
        ];
    }

    static all() {
        return this.names.map((name, index) => ({
            id: `perk_${String(index + 1).padStart(3, '0')}`,
            name,
            description: this._description(name),
            affinities: this._affinities(name),
            modifiers: this._modifiers(name)
        }));
    }

    static roll(random = Math.random) {
        const countTable = [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5];
        const count = countTable[Math.floor(random() * countTable.length)];
        if (count === 0) return [];
        const pool = this.all().filter(perk => perk.name !== '빈 수첩');
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, count);
    }

    static aggregate(perks = []) {
        const total = { attackRate: 1, atbRate: 1, evadeChance: 0, evadePower: 0, guardChance: 0, guardPower: 0, healBias: 0, lowHpAttack: 1, enragedAttack: 1 };
        perks.forEach(perk => {
            const modifiers = perk && perk.modifiers ? perk.modifiers : {};
            Object.entries(modifiers).forEach(([key, value]) => {
                if (key.endsWith('Rate') || key.endsWith('Attack')) total[key] *= value;
                else total[key] += value;
            });
        });
        return total;
    }

    static _modifiers(name) {
        const exact = {
            '겁쟁이': { evadeChance: 0.12, evadePower: 0.08, attackRate: 0.96 },
            '앙심': { lowHpAttack: 1.22, healBias: -0.18 },
            '토끼손': { atbRate: 1.15, evadeChance: -0.10 },
            '도전자': { enragedAttack: 1.18 },
            '공격': { attackRate: 1.08, guardChance: -0.04 },
            '방어': { attackRate: 0.96, guardChance: 0.10, guardPower: 0.08 },
            '회피 성능': { evadeChance: 0.10, evadePower: 0.08 },
            '가드 성능': { guardChance: 0.10, guardPower: 0.10 },
            '완전 충전': { attackRate: 1.05 },
            '재난대처능력': { lowHpAttack: 1.28, healBias: -0.20 },
            '빨리 먹기': { healBias: 0.10 },
            '정령의 가호': { guardPower: 0.06 },
            '약점 특효': { attackRate: 1.06 },
            '간파': { attackRate: 1.04 },
            '연격': { atbRate: 1.06 },
            '철벽': { attackRate: 0.95, guardChance: 0.14, guardPower: 0.12 },
            '은신': { attackRate: 1.04, guardChance: -0.06 },
            '신속 교체': { atbRate: 1.08 },
            '무모한 준비': { attackRate: 1.10, evadeChance: -0.08 },
            '캠프 수호자': { attackRate: 0.88, evadeChance: 0.14, guardPower: 0.10 },
            '한 대만': { attackRate: 1.12, atbRate: 0.94 },
            '새벽의 생존자': { guardPower: 0.08, healBias: 0.06 }
        };
        if (exact[name]) return exact[name];
        if (name === '빈 수첩') return {};

        const affinities = this._affinities(name);
        const inferred = {};
        if (affinities.includes('guard')) {
            inferred.guardChance = 0.04;
            inferred.guardPower = 0.03;
        }
        if (affinities.includes('mobility')) {
            inferred.atbRate = 1.025;
            inferred.evadeChance = 0.03;
        }
        if (affinities.includes('support')) inferred.healBias = 0.06;
        if (affinities.includes('burst')) inferred.attackRate = 1.04;
        if (affinities.includes('sever') || affinities.includes('blunt') || affinities.includes('ranged') || affinities.includes('explosive')) {
            inferred.attackRate = Math.max(Number(inferred.attackRate || 1), 1.03);
        }
        if (affinities.includes('status')) inferred.atbRate = Math.max(Number(inferred.atbRate || 1), 1.02);

        if (/절약|완벽주의|캠프|길치/.test(name)) inferred.atbRate = 0.96;
        if (/물욕|수레|훈타/.test(name)) {
            inferred.attackRate = 1.05;
            inferred.evadeChance = -0.04;
        }
        if (/벌꿀|만족|애호가/.test(name)) inferred.healBias = 0.08;
        if (/내성|귀마개|풍압|내진|가호|체력 증강/.test(name)) inferred.guardPower = 0.04;
        if (/예리|숫돌|장인|명검|강화 지속|집중/.test(name)) inferred.atbRate = Math.max(Number(inferred.atbRate || 1), 1.025);

        // Every rolled perk must affect the autobattle. Unclassified quirks use a tiny tempo bias.
        if (!Object.keys(inferred).length) inferred.atbRate = this.names.indexOf(name) % 2 === 0 ? 1.015 : 0.985;
        return inferred;
    }

    static _affinities(name) {
        const tags = [];
        if (/가드|철벽|방패|도발|방어/.test(name)) tags.push('guard');
        if (/회피|토끼|신속|납도|은신/.test(name)) tags.push('mobility');
        if (/포술|포탄|포격|병/.test(name)) tags.push('explosive');
        if (/탄|사격|포화|용화살|날개/.test(name)) tags.push('ranged');
        if (/KO|탈취|두개골|기절/.test(name)) tags.push('blunt');
        if (/꼬리|발도|예리|장인|명검/.test(name)) tags.push('sever');
        if (/광역|지원|우애|치료|회복|분진|희생/.test(name)) tags.push('support');
        if (/상태|독|마비|잠|폭파|덫|포획|섬광/.test(name)) tags.push('status');
        if (/공격|앙심|도전자|회심|약점|한 대|재난/.test(name)) tags.push('burst');
        return tags;
    }

    static _description(name) {
        const special = {
            '겁쟁이': '살아 돌아온 자만이 자신의 비겁함을 변명한다.',
            '앙심': '상처는 아물지 않았다. 그래서 칼날도 쉬지 않는다.',
            '토끼손': '손은 빠르다. 생각은 늘 그 뒤를 쫓는다.',
            '도전자': '괴물이 성낼수록, 이자는 웃는다.',
            '빈 수첩': '아무것도 쓰이지 않았다. 아직은.'
        };
        return special[name] || `${name}. 길드는 그 성정이 축복인지 흉조인지 기록하지 않았다.`;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntPerkCatalog;
else window.HuntPerkCatalog = HuntPerkCatalog;
