class HuntPerkSynergyCatalog {
    static get recipes() {
        return [
            { id: 'greatsword-focus', label: '필살 축적', icon: '⚔️', color: '#ff786b', members: ['집중','첫 수는 크게','한 대만','발도술'] },
            { id: 'critical-engine', label: '회심 기관', icon: '💢', color: '#ff5e75', members: ['간파','약점 특효','슈퍼회심','혼신','힘의 해방'] },
            { id: 'guard-fortress', label: '움직이는 성벽', icon: '🏰', color: '#739dff', members: ['가드 성능','가드 강화','철벽','철벽주의','몸빵 담당'] },
            { id: 'ammo-economy', label: '탄약 순환', icon: '🔫', color: '#e7c35d', members: ['포탄 장전','탄환 절약','명검의 가르침','특수 사격 강화'] },
            { id: 'normal-shot', label: '정밀 사격', icon: '🎯', color: '#f2cf70', members: ['통상탄 강화','집중 포화','약점 특효','간파'] },
            { id: 'pierce-shot', label: '관통 궤도', icon: '➹', color: '#62d9ff', members: ['관통탄 강화','용화살 신봉','날개 꺾기','공중 추적자'] },
            { id: 'spread-shot', label: '근접 포화', icon: '💥', color: '#ff9970', members: ['산탄 강화','집중 포화','공격 중독','유리 대포'] },
            { id: 'horn-maestro', label: '명연주', icon: '🎶', color: '#65e3a0', members: ['선율 강박','강화 지속','광역화','분위기 메이커'] },
            { id: 'dual-demon', label: '귀인 폭주', icon: '👹', color: '#ff5470', members: ['귀인화 체질','연격','공격 중독','토끼손'] },
            { id: 'longsword-iai', label: '납도 반격', icon: '🌙', color: '#a78cff', members: ['특수납도 중독','납도술','복수의 일격','간파'] },
            { id: 'gunlance-shell', label: '포격 장전', icon: '🚀', color: '#ffad54', members: ['포격 낭만','포술','포탄 장전','명검의 가르침'] },
            { id: 'chargeblade-phial', label: '병 과충전', icon: '⚡', color: '#ffd04f', members: ['병 수집벽','포술','집중','강화 지속'] },
            { id: 'switchaxe-zero', label: '영거리 폭주', icon: '🪓', color: '#ff665c', members: ['영거리 집착','신속 교체','연격','유리 대포'] },
            { id: 'glaive-tricolor', label: '삼색 비상', icon: '🪲', color: '#7ee8b5', members: ['삼색 탐닉','강화 지속','공중 추적자','날개 꺾기'] },
            { id: 'item-loop', label: '소모품 순환', icon: '♻️', color: '#80df78', members: ['만족감','만족할 줄 모름','절약가','빨리 먹기'] },
            { id: 'full-health', label: '완전무결', icon: '💎', color: '#8ff5de', members: ['완전 충전','완벽주의','체력 증강','체력 회복량 UP'] },
            { id: 'rage-hunter', label: '분노 추격', icon: '😈', color: '#ff4d55', members: ['도전자','앙심','공격','복수의 일격'] },
            { id: 'ailment-wall', label: '상태 철벽', icon: '🛡️', color: '#77d8cf', members: ['기절 내성','귀마개','풍압 내성','내진'] },
            { id: 'gather-craft', label: '현지 조달', icon: '⛏️', color: '#d0b36b', members: ['물욕 센서','야생의 치료사','버섯 애호가','폭탄 배달부'] },
            { id: 'cart-insurance', label: '수레 보험', icon: '🛒', color: '#ff9eb4', members: ['수레 애호가','수레 단골','영웅의 증표','불굴','보급관'] },
            { id: 'aerial-control', label: '공중 제압', icon: '🪽', color: '#65dfff', members: ['공중 추적자','날개 꺾기','섬광 조제사','집중 포화'] },
            { id: 'part-break', label: '부위 파쇄', icon: '💥', color: '#ff8b66', members: ['파괴왕','꼬리 수집가','꼬리 사냥꾼','뿔 수집가','두개골 측량사','부위 개척자','약점 집착'] },
            { id: 'demolition', label: '화약 연계', icon: '💣', color: '#ffbd52', members: ['폭파광','폭탄 배달부','포술','포격 낭만'] },
            { id: 'camp-supply', label: '캠프 보급망', icon: '⛺', color: '#73e58c', members: ['보급관','캠프 수호자','수레 단골','수레 애호가','벌꿀 주세요','재정비 전문가','날쌘 보급'] },
            { id: 'team-heal', label: '생존 지원', icon: '✨', color: '#70f0b0', members: ['광역화','광역 분진','우애','응급 배급','야생의 치료사','체력 회복량 UP'] },
            { id: 'trap-control', label: '구속 작전', icon: '🪤', color: '#d2dc67', members: ['덫 장인','포획 명인','마비 사냥꾼','스태미나 탈취'] },
            { id: 'last-stand', label: '배수진', icon: '🔥', color: '#ff5f64', members: ['역전','재난대처능력','불굴','끝까지 함께','새벽의 생존자','영웅의 증표','퇴근 본능'] },
            { id: 'counter', label: '반격 태세', icon: '⚡', color: '#9ba7ff', members: ['복수의 일격','공세적 방어','앙심','임기응변','가드 강화'] },
            { id: 'evasion', label: '회피 연계', icon: '💨', color: '#62dbea', members: ['회피 거리 UP','회피 성능','토끼손','민첩한 발','신중한 관찰자','숨 고르기'] },
            { id: 'sharpness', label: '예리 운용', icon: '🗡️', color: '#a9e8ff', members: ['장인','명검','칼날 연마','연마술 예','숫돌 사용 고속화'] },
            { id: 'status', label: '상태이상 연계', icon: '☠️', color: '#ce86ff', members: ['상태이상 공격 강화','독사','마비 사냥꾼','잠재우는 손','폭파광'] },
            { id: 'opening-burst', label: '개막 폭딜', icon: '🌟', color: '#ffd66b', members: ['첫 수는 크게','한 대만','완전 충전','발도술','선봉장'] },
            { id: 'knockdown', label: '대경직 맹공', icon: '🔨', color: '#ff9668', members: ['넘어진 김에','폭탄 배달부','KO술','스태미나 탈취','집중 포화'] },
            { id: 'aggro', label: '시선 집중', icon: '🎯', color: '#ff77a8', members: ['오늘의 주인공','도발','몸빵 담당','철벽주의','희생 방패'] }
        ];
    }

    static group(perks = []) {
        const remaining = perks.map((perk, index) => ({ perk, index }));
        const groups = [];
        this.recipes.forEach(recipe => {
            const matches = remaining.filter(entry => recipe.members.includes(entry.perk?.name));
            if (matches.length < 2) return;
            groups.push({ synergy: recipe, perks: matches.map(entry => entry.perk), order: Math.min(...matches.map(entry => entry.index)) });
            const claimed = new Set(matches);
            for (let index = remaining.length - 1; index >= 0; index--) {
                if (claimed.has(remaining[index])) remaining.splice(index, 1);
            }
        });
        remaining.forEach(entry => groups.push({ synergy: null, perks: [entry.perk], order: entry.index }));
        return groups.sort((a, b) => a.order - b.order);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntPerkSynergyCatalog;
else window.HuntPerkSynergyCatalog = HuntPerkSynergyCatalog;
