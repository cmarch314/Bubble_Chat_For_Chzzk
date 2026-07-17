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
        const descriptions = {
            '겁쟁이': '살아 돌아온 자만이 자신의 비겁함을 변명한다.',
            '앙심': '상처는 아물지 않았다. 그래서 칼날도 쉬지 않는다.',
            '토끼손': '손은 빠르다. 생각은 늘 그 뒤를 쫓는다.',
            '도전자': '괴물이 성낼수록, 이자는 웃는다.',
            '공격': '망설임을 버린 자의 칼끝은 늘 먼저 피를 본다.',
            '방어': '금이 간 방패도 들고 있는 동안은 성벽이다.',
            '회피 거리 UP': '한 걸음 더 물러난 곳에 내일이 기다린다.',
            '회피 성능': '죽음은 스쳤고, 그는 이미 다음 자리에 있었다.',
            '가드 성능': '충격은 뼈에 남지만 발은 물러서지 않는다.',
            '가드 강화': '막을 수 없다는 말은 방패 없는 자의 핑계다.',
            '완전 충전': '흠 없는 육신에는 오만할 만큼의 힘이 깃든다.',
            '역전': '벼랑 끝은 추락할 곳이 아니라 되받아칠 자리다.',
            '불굴': '쓰러질 때마다 무언가가 부서지고, 더 단단한 것이 남는다.',
            '재난대처능력': '피가 모자랄수록 살고자 하는 칼날은 선명해진다.',
            '전화위복': '저주는 걷히지 않았다. 다만 주인이 바뀌었을 뿐.',
            '돌파구': '막힌 길 앞에서 그는 길 대신 벽을 없앤다.',
            '버섯 애호가': '숲이 준 것은 약인가 독인가. 그는 묻지 않고 삼킨다.',
            '빨리 먹기': '맛을 느낄 틈은 없다. 살아남는 데 미식은 사치다.',
            '만족감': '빈 병에서 한 모금이 더 나왔다. 욕심이 기적을 닮았다.',
            '광역화': '한 사람의 약효가 네 사람의 숨을 붙든다.',
            '체력 회복량 UP': '상처가 닫힐 때마다 죽음은 한 발 물러선다.',
            '정령의 가호': '보이지 않는 손이 치명상을 우연으로 바꾼다.',
            '체력 증강': '더 많은 피는 더 오래 버틸 이유가 된다.',
            '기절 내성': '별이 보여도 무릎만큼은 땅을 잊지 않는다.',
            '귀마개': '포효는 산을 흔들었으나 그의 눈꺼풀조차 움직이지 않았다.',
            '풍압 내성': '폭풍이 밀어도 사냥꾼의 발자국은 지워지지 않는다.',
            '내진': '대지가 비명을 질러도 그는 중심을 내주지 않는다.',
            '납도술': '칼집으로 돌아간 칼은 다음 피를 더 빨리 찾는다.',
            '숫돌 사용 고속화': '불꽃 세 번이면 무딘 후회도 다시 날이 선다.',
            '칼날 연마': '막 벼린 예리함은 잠시나마 갑각의 거짓말을 벗긴다.',
            '명검': '좋은 칼은 살을 가르고도 자신의 상처를 남기지 않는다.',
            '장인': '평범한 쇳조각에서 아직 드러나지 않은 날을 끌어낸다.',
            '심안': '단단함은 눈을 속일 뿐, 손끝까지 속이지는 못한다.',
            '약점 특효': '상처를 본 순간 그의 세계에는 그곳만 남는다.',
            '간파': '찰나의 틈은 준비된 눈에만 영원처럼 길다.',
            '슈퍼회심': '정확한 한 번이 수십 번의 난타를 조롱한다.',
            '힘의 해방': '속박이 끊어진 뒤 남은 것은 힘과 대가뿐이다.',
            '혼신': '남김없이 쏟아붓는 자에게 후퇴할 힘은 필요 없다.',
            '연격': '첫 타는 문을 열고, 나머지는 안쪽을 폐허로 만든다.',
            '연마술 예': '잃어버린 예리함은 돌아올 때 더 잔혹한 빛을 낸다.',
            '집중': '호흡이 길어질수록 다음 일격은 피할 수 없는 결론이 된다.',
            '강화 지속': '타오른 힘을 오래 붙드는 일도 하나의 광기다.',
            '포술': '화약은 논쟁하지 않는다. 그저 가장 큰 목소리로 답한다.',
            '포탄 장전': '빈 약실은 불안이다. 그는 불안을 하나 더 채워 넣는다.',
            '특수 사격 강화': '비장의 탄환은 마지막까지 남겨둘 때만 비장하다.',
            '통상탄 강화': '평범함을 끝없이 갈고닦으면 결국 공포가 된다.',
            '관통탄 강화': '첫 상처는 입구일 뿐, 진짜 고통은 그 뒤를 지나간다.',
            '산탄 강화': '빗나갈 곳마저 탄환으로 채우면 명중은 선택이 아니다.',
            '탄환 절약': '격발된 탄환이 돌아오진 않는다. 가끔 소모되지 않을 뿐.',
            '명검의 가르침': '검과 탄은 다르지만 아끼는 집착만큼은 닮아 있다.',
            'KO술': '두개골은 단단하다. 그래서 울림도 오래 남는다.',
            '스태미나 탈취': '숨을 빼앗는 사냥은 피를 흘리는 것보다 조용하다.',
            '파괴왕': '부서질 수 있는 것은 약점이고, 약점은 남겨두지 않는다.',
            '집중 포화': '모든 총구가 한 점을 향하면 갑각도 밤도 함께 찢어진다.',
            '꼬리 수집가': '잘린 꼬리는 전리품이자 다음 집착의 시작이다.',
            '두개골 측량사': '그는 머리의 크기보다 금이 갈 자리를 먼저 잰다.',
            '날개 꺾기': '하늘의 주인을 땅으로 끌어내리는 데 자비는 필요 없다.',
            '철벽': '벽은 공격하지 않는다. 다만 공격한 쪽을 먼저 지치게 한다.',
            '공세적 방어': '막아낸 충격을 고스란히 칼끝으로 돌려보낸다.',
            '도발': '괴물의 시선을 독차지하는 일은 용기와 허영의 경계다.',
            '은신': '보이지 않는 칼날은 휘두르기 전부터 상처를 만든다.',
            '발도술': '칼집에서 나온 첫 빛이 마지막으로 본 빛이 된다.',
            '특수납도 중독': '칼을 거두는 순간조차 그는 다음 참격을 꿈꾼다.',
            '귀인화 체질': '붉은 기운은 피로를 잊게 하고 이성을 함께 가져간다.',
            '선율 강박': '한 음이라도 어긋나면 그는 괴물보다 먼저 자신을 미워한다.',
            '포격 낭만': '효율은 몰라도 폭발 뒤의 침묵만큼은 완벽하다.',
            '병 수집벽': '채운 병마다 힘이 쌓이고, 비운 마음만 남는다.',
            '영거리 집착': '숨결이 닿는 거리에서 폭발은 실수조차 명중으로 만든다.',
            '삼색 탐닉': '세 빛을 모은 순간 벌레와 사냥꾼의 경계가 흐려진다.',
            '용화살 신봉': '긴 준비 끝의 한 발에 그는 모든 변명을 실어 보낸다.',
            '상태이상 공격 강화': '상처보다 늦게 찾아오는 고통이 더 오래 기억된다.',
            '독사': '칼끝의 초록빛은 승리를 서두르지 않는다.',
            '마비 사냥꾼': '움직임이 멎은 찰나, 사냥은 처형으로 이름을 바꾼다.',
            '잠재우는 손': '고요한 숨결 뒤에는 가장 시끄러운 일격이 기다린다.',
            '폭파광': '그는 문제를 해결하지 않는다. 흔적째 폭파한다.',
            '덫 장인': '괴물이 밟는 순간까지 땅은 아무 비밀도 말하지 않는다.',
            '포획 명인': '죽이는 것보다 살려 묶는 일이 때로 더 냉혹하다.',
            '섬광 조제사': '한 줌의 빛이 하늘의 폭군에게 밤을 선물한다.',
            '광역 분진': '가루가 흩날리면 네 사람의 운명이 잠시 같은 숨을 쉰다.',
            '우애': '자신의 약병을 나누는 자는 상처까지 나눌 각오를 했다.',
            '만족할 줄 모름': '한 모금이면 충분했다. 그는 두 번째 기적을 요구했다.',
            '절약가': '아낀 한 병이 언젠가 한 목숨의 값이 된다.',
            '야생의 치료사': '약초와 흙 냄새 사이에서 그는 아직 죽지 않을 이유를 찾는다.',
            '영웅의 증표': '영웅은 두려움이 없는 자가 아니라 들킨 적 없는 자다.',
            '희생 방패': '동료 앞에 선 등에는 늘 가장 깊은 흉터가 남는다.',
            '혈기': '흘린 피를 되찾는 방법을 그는 괴물의 살에서 배웠다.',
            '신속 교체': '무기를 바꾸는 한순간조차 공격의 일부로 삼는다.',
            '무모한 준비': '계획은 완벽했다. 살아 돌아올 부분만 빠져 있었다.',
            '완벽주의': '작은 흠 하나가 보이면 사냥보다 먼저 자신이 무너진다.',
            '임기응변': '계획이 죽은 자리에서 본능이 칼을 집어 든다.',
            '길치': '목표는 북쪽에 있었다. 그는 남쪽의 괴물부터 베었다.',
            '고양이 혀': '뜨거운 식사는 식을 때까지, 괴물은 기다려주지 않는다.',
            '물욕 센서': '간절히 원하는 순간, 세상은 그것만 빼고 전부 내어준다.',
            '수레 애호가': '세 번째 귀환에도 그는 이동 수단이었다고 우긴다.',
            '훈타': '용기는 넘쳤고 지식은 모자랐다. 대개 피로 차이를 메운다.',
            '벌꿀 주세요': '달콤한 한 숟갈을 위해 존엄은 이미 캠프에 두고 왔다.',
            '캠프 수호자': '누군가는 천막을 지켜야 한다. 아무도 부탁하지 않았지만.',
            '한 대만': '단 한 번이면 된다는 말은 대개 두 번째 공격 전에 나온다.',
            '빈 수첩': '아무것도 쓰이지 않았다. 아직은.',
            '새벽의 생존자': '밤이 끝날 때까지 버틴 자만이 아침을 전리품이라 부른다.'
        };
        return descriptions[name] || '길드의 기록에서 이 성정에 관한 장은 찢겨 나갔다.';
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntPerkCatalog;
else window.HuntPerkCatalog = HuntPerkCatalog;
