class HuntPerkSynergyCatalog {
    static get bonuses() {
        return {
            'greatsword-focus': { summary: '차지·발도 준비를 10% 단축하고 차지 해방 피해를 6% 강화.', effects: [{ type: 'action-duration', tag: 'charge', value: .90 }, { type: 'damage', tag: 'charge-release', value: 1.06 }] },
            'critical-engine': { summary: '회심 확률 +3%p. 회심 적중 시 ATB 5% 회수.', modifiers: { critChance: .03 }, effects: [{ on: 'critical', atb: 5 }] },
            'guard-fortress': { summary: '가드 확률·경감 +4%p. 가드 성공 시 팀 ATB 2% 지원.', modifiers: { guardChance: .04, guardPower: .04 }, effects: [{ on: 'guard', teamAtb: 2 }] },
            'ammo-economy': { summary: '탄약 소모 12% 무효, 재장전 시간 15% 단축.', effects: [{ type: 'ammo-save', chance: .12 }, { type: 'action-duration', idPattern: 'reload|load_phials', value: .85 }] },
            'normal-shot': { summary: '적중률 +3%p, 통상탄·차지샷 피해 +6%.', modifiers: { hitChance: .03 }, effects: [{ type: 'damage', idPattern: 'normal|charged_shot', value: 1.06 }] },
            'pierce-shot': { summary: '관통탄·용화살 피해 +6%, 비행 중 부위 피해 +6%.', effects: [{ type: 'damage', idPattern: 'pierce|dragon_piercer', value: 1.06 }, { type: 'part', when: 'airborne', value: 1.06 }] },
            'spread-shot': { summary: '산탄·발리 피해 +8%. 대가로 받는 피해 +4%.', effects: [{ type: 'damage', idPattern: 'spread|volley', value: 1.08 }, { type: 'incoming', when: 'always', value: 1.04 }] },
            'horn-maestro': { summary: '무기 버프 지속 +15%, 수렵피리 피해 +5%, 물약 공유 +8%.', effects: [{ type: 'buff-duration', value: 1.15 }, { type: 'damage', weapon: 'hunting_horn', value: 1.05 }, { type: 'potion-share', value: .08 }] },
            'dual-demon': { summary: 'ATB 회복 +4%, 귀인화 중 피해 +5%.', modifiers: { atbRate: 1.04 }, effects: [{ type: 'damage', weapon: 'dual_blades', when: 'demon-mode', value: 1.05 }] },
            'longsword-iai': { summary: '특수납도 시간 10% 단축, 특수납도 공격 피해 +6%, 간파율 +4%p.', modifiers: { counterChance: .04 }, effects: [{ type: 'action-duration', idPattern: 'iai|sheathe', value: .90 }, { type: 'damage', idPattern: 'iai|sheathe', value: 1.06 }] },
            'gunlance-shell': { summary: '포격 피해 +6%, 포탄·탄약 소모 10% 무효.', effects: [{ type: 'damage', idPattern: 'shell|burst|wyvern', value: 1.06 }, { type: 'ammo-save', chance: .10 }] },
            'chargeblade-phial': { summary: '차지 준비 10% 단축, 병 해방 피해 +6%.', effects: [{ type: 'action-duration', tag: 'charge', value: .90 }, { type: 'damage', idPattern: 'discharge|saed|aed', value: 1.06 }] },
            'switchaxe-zero': { summary: '변형 시간 10% 단축, 영거리해방 피해 +8%. 대가로 받는 피해 +3%.', effects: [{ type: 'action-duration', idPattern: 'morph|change|switch', value: .90 }, { type: 'damage', idPattern: 'zero_sum', value: 1.08 }, { type: 'incoming', when: 'always', value: 1.03 }] },
            'glaive-tricolor': { summary: '무기 버프 지속 +15%, 비행 중 조충곤 피해 +5%.', effects: [{ type: 'buff-duration', value: 1.15 }, { type: 'damage', weapon: 'insect_glaive', when: 'airborne', value: 1.05 }] },
            'item-loop': { summary: '모든 소모품 보존 확률 +10%, 사용시간 10% 단축.', effects: [{ type: 'item-save', chance: .10 }, { type: 'item-duration', value: .90 }] },
            'full-health': { summary: '최대·현재 체력 +5, 회복량 +5%, 최대 체력일 때 피해 +4%. 물약을 12%p 일찍 판단.', effects: [{ type: 'max-hp', value: 5 }, { type: 'heal-rate', value: 1.05 }, { type: 'damage', when: 'full-hp', value: 1.04 }, { type: 'ai', action: 'potion-threshold', value: .12 }, { type: 'ai', action: 'potion', value: .08 }] },
            'rage-hunter': { summary: '분노 중 피해 +6%. 대가로 분노 중 받는 피해 +4%.', effects: [{ type: 'damage', when: 'enraged', value: 1.06 }, { type: 'incoming', when: 'enraged', value: 1.04 }] },
            'ailment-wall': { summary: '포효·풍압·지진·상태이상 회복 시 ATB 10% 회수.', effects: ['roar-recover','wind-recover','tremor-recover','ailment-recover'].map(on => ({ on, atb: 10 })) },
            'gather-craft': { summary: '채집 성공 시 50% 확률로 무작위 소모품 1개 추가.', effects: [{ on: 'gather', randomItem: true, amount: 1, chance: .50 }] },
            'cart-insurance': { summary: '수레 복귀시간 추가 15% 단축, 복귀 시 물약 1개 보급.', effects: [{ type: 'cart-recovery', value: .85 }, { on: 'cart', item: 'potions', amount: 1 }] },
            'aerial-control': { summary: '비행 중 피해 +5%, 섬광 AI 판단 +12%p.', effects: [{ type: 'damage', when: 'airborne', value: 1.05 }, { type: 'ai', action: 'flash', value: .12 }] },
            'part-break': { summary: '모든 부위 피해 +8%, 부위파괴 시 ATB 8% 회수.', effects: [{ type: 'part', when: 'always', value: 1.08 }, { on: 'part-break', atb: 8 }] },
            'demolition': { summary: '폭탄 피해 +12%, 폭파 축적량 +10%.', effects: [{ type: 'bomb-damage', value: 1.12 }, { type: 'status', status: 'blast', value: 1.10 }] },
            'camp-supply': { summary: '캠프 체류시간 25% 단축, 수레 복귀 시 물약 1개 보급.', effects: [{ type: 'camp-rate', value: .75 }, { on: 'cart', item: 'potions', amount: 1 }] },
            'team-heal': { summary: '회복량 +8%, 물약 공유 +8%, 가루 사용 AI +12%p.', modifiers: { healBias: .04 }, effects: [{ type: 'heal-rate', value: 1.08 }, { type: 'potion-share', value: .08 }, { type: 'ai', action: 'powder', value: .12 }] },
            'trap-control': { summary: '덫 보존 12%, 덫 사용 AI +15%p, 마비 축적 +8%.', effects: [{ type: 'item-save', item: 'traps', chance: .12 }, { type: 'ai', action: 'trap', value: .15 }, { type: 'status', status: 'paralysis', value: 1.08 }] },
            'last-stand': { summary: '체력 35% 이하에서 피해 +5%, 받는 피해 -10%. 회복 판단선을 8%p 늦추되 빈사 시 생존 회복 우선.', effects: [{ type: 'damage', when: 'low-hp', value: 1.05 }, { type: 'incoming', when: 'low-hp', value: .90 }, { type: 'ai', action: 'potion-threshold', value: -.08 }] },
            'counter': { summary: '특수 대응 확률 +3%p. 가드 성공 후 3초간 피해 +5%.', modifiers: { counterChance: .03 }, effects: [{ on: 'guard', buff: 'attack', value: 1.05, ticks: 30 }] },
            'evasion': { summary: '회피 확률 +3%p. 회피 성공 시 ATB 10% 회수.', modifiers: { evadeChance: .03 }, effects: [{ on: 'dodge', atb: 10 }] },
            'sharpness': { summary: '예리도 소모 10% 무효, 숫돌 시간 15% 단축.', effects: [{ type: 'sharpness-save', chance: .10 }, { type: 'whetstone-duration', value: .85 }] },
            'status': { summary: '모든 상태이상 축적량 +10%.', effects: [{ type: 'status-all', value: 1.10 }] },
            'opening-burst': { summary: '전투 초반 30초 동안 피해 +6%.', effects: [{ type: 'damage', when: 'opening', value: 1.06 }] },
            'knockdown': { summary: '기절 축적 +8%, 대경직 중 피해 +6%.', effects: [{ type: 'stun', value: 1.08 }, { type: 'damage', when: 'monster-downed', value: 1.06 }] },
            'aggro': { summary: '받는 피해 -7%, 대상 선택 가중치 1.35배, 가드 확률 +3%p.', modifiers: { guardChance: .03 }, effects: [{ type: 'incoming', when: 'always', value: .93 }, { type: 'target-weight', when: 'always', value: 1.35 }] },
            'perfect-response': { summary: '회피·가드·퍼펙트가드 성공 시 ATB 8% 회수.', effects: ['dodge','guard'].map(on => ({ on, atb: 8 })) },
            'critical-chain': { summary: '회심 확률 +3%p. 회심 적중 시 5초간 회심 +2%p, 최대 2중첩.', modifiers: { critChance: .03 }, effects: [{ on: 'critical', buff: 'critical', value: .02, ticks: 50, stacks: 2 }] },
            'break-momentum': { summary: '첫 부위 피해 +10%. 부위파괴 후 5초간 피해 +6%.', effects: [{ type: 'part', when: 'first-hit', value: 1.10 }, { on: 'part-break', buff: 'attack', value: 1.06, ticks: 50 }] },
            'anti-air-breaker': { summary: '비행 중 부위 피해 +10%, 섬광 AI 판단 +15%p.', effects: [{ type: 'part', when: 'airborne', value: 1.10 }, { type: 'ai', action: 'flash', value: .15 }] },
            'last-smile': { summary: '체력 35% 이하에서 받는 피해 -10%, 회피 확률 +3%p. 회복 판단선을 6%p 늦추되 빈사 시 생존 회복 우선.', modifiers: { evadeChance: .03 }, effects: [{ type: 'incoming', when: 'low-hp', value: .90 }, { type: 'ai', action: 'potion-threshold', value: -.06 }] },
            'fear-eater': { summary: '포효·풍압·지진 회복 시 ATB 10%, 상태이상 회복 시 체력 5% 회복.', effects: [{ on: 'roar-recover', atb: 10 }, { on: 'wind-recover', atb: 10 }, { on: 'tremor-recover', atb: 10 }, { on: 'ailment-recover', heal: .05 }] },
            'field-crafter': { summary: '채집 시 40% 확률로 무작위 소모품 1개 추가, 120초에 1회 부족 물자 보급.', effects: [{ on: 'gather', randomItem: true, amount: 1, chance: .40 }, { type: 'periodic-supply', tick: 1200, once: true }] },
            'camp-gourmet': { summary: '캠프 체류시간 25% 단축, 최대·현재 체력 +5.', effects: [{ type: 'camp-rate', value: .75 }, { type: 'max-hp', value: 5 }] },
            'item-hoarder': { summary: '모든 소모품 보존 확률 +8%, 물약 사용 판단 +8%p.', effects: [{ type: 'item-save', chance: .08 }, { type: 'ai', action: 'potion', value: .08 }] },
            'sleep-demolition': { summary: '수면 대상 피해 +12%, 폭탄 피해 +15%.', effects: [{ type: 'damage', when: 'monster-sleeping', value: 1.12 }, { type: 'bomb-damage', value: 1.15 }] },
            'toxic-loop': { summary: '모든 상태이상 축적 +12%, 폭파 발동 후 폭파 축적 10 회수.', effects: [{ type: 'status-all', value: 1.12 }, { on: 'blast-proc', monsterBuild: 'blast', value: 10 }] },
            'quirk-engine': { summary: '공격 실패 시 ATB 8% 회수, 강공 적중 시 체력 3% 회복, 받는 피해 -3%.', effects: [{ on: 'miss', atb: 8 }, { on: 'strong-hit', heal: .03 }, { type: 'incoming', when: 'always', value: .97 }] },
            'party-heart': { summary: '동료 빈사 시 받는 피해 -6%, 물약 공유 +8%, 가루 AI +15%p.', effects: [{ type: 'incoming', when: 'ally-low', value: .94 }, { type: 'potion-share', value: .08 }, { type: 'ai', action: 'powder', value: .15 }] },
            'second-life': { summary: '수레 복귀시간 추가 15% 단축, 수레마다 공격 +5%(최대 3중첩).', effects: [{ type: 'cart-recovery', value: .85 }, { on: 'cart', buff: 'attack', value: 1.05, permanent: true, stacks: 3 }] },
            'opening-control': { summary: '전투 초반 피해 +5%, 회피 +2%p, 첫 피격 피해 -10%.', modifiers: { evadeChance: .02 }, effects: [{ type: 'damage', when: 'opening', value: 1.05 }, { type: 'incoming', when: 'first-hit-taken', value: .90 }] },
            'sharp-craftsman': { summary: '예리도 소모 12% 무효. 숫돌 완료 후 5초간 피해 +5%.', effects: [{ type: 'sharpness-save', chance: .12 }, { on: 'whetstone', buff: 'attack', value: 1.05, ticks: 50 }] }
        };
    }

    static get recipes() {
        const recipes = [
            { id: 'greatsword-focus', label: '필살 축적', icon: '⚔️', color: '#ff786b', members: ['집중','첫 수는 크게','한 대만','발도술','묵직한 손'] },
            { id: 'critical-engine', label: '회심 기관', icon: '💢', color: '#ff5e75', members: ['간파','약점 특효','슈퍼회심','혼신','힘의 해방'] },
            { id: 'guard-fortress', label: '움직이는 성벽', icon: '🏰', color: '#739dff', members: ['방어','가드 성능','가드 강화','정령의 가호','철벽','철벽주의','몸빵 담당','돌다리 전문가','위기관리반','지상주의자'] },
            { id: 'ammo-economy', label: '탄약 순환', icon: '🔫', color: '#e7c35d', members: ['포탄 장전','탄환 절약','명검의 가르침','특수 사격 강화','구르기 장전'] },
            { id: 'normal-shot', label: '정밀 사격', icon: '🎯', color: '#f2cf70', members: ['통상탄 강화','약점 특효','간파'] },
            { id: 'pierce-shot', label: '관통 궤도', icon: '➹', color: '#62d9ff', members: ['관통탄 강화','용화살 신봉','날개 꺾기','공중 추적자'] },
            { id: 'spread-shot', label: '근접 포화', icon: '💥', color: '#ff9970', members: ['산탄 강화','공격 중독','유리 대포'] },
            { id: 'horn-maestro', label: '명연주', icon: '🎶', color: '#65e3a0', members: ['선율 강박','강화 지속','광역화','분위기 메이커'] },
            { id: 'dual-demon', label: '귀인 폭주', icon: '👹', color: '#ff5470', members: ['귀인화 체질','연격','공격 중독','토끼손'] },
            { id: 'longsword-iai', label: '납도 반격', icon: '🌙', color: '#a78cff', members: ['특수납도 중독','납도술','복수의 일격','간파'] },
            { id: 'gunlance-shell', label: '포격 장전', icon: '🚀', color: '#ffad54', members: ['포격 낭만','포술','포탄 장전','명검의 가르침'] },
            { id: 'chargeblade-phial', label: '병 과충전', icon: '⚡', color: '#ffd04f', members: ['병 수집벽','포술','집중','강화 지속'] },
            { id: 'switchaxe-zero', label: '영거리 폭주', icon: '🪓', color: '#ff665c', members: ['영거리 집착','고속 변형','연격','유리 대포'] },
            { id: 'glaive-tricolor', label: '삼색 비상', icon: '🪲', color: '#7ee8b5', members: ['삼색 탐닉','강화 지속','공중 추적자','날개 꺾기'] },
            { id: 'item-loop', label: '소모품 순환', icon: '♻️', color: '#80df78', members: ['만족감','만족할 줄 모름','절약가','빨리 먹기'] },
            { id: 'full-health', label: '완전무결', icon: '💎', color: '#8ff5de', members: ['완전 충전','완벽주의','체력 증강','체력 회복량 UP','혈기','방어'] },
            { id: 'rage-hunter', label: '분노 추격', icon: '😈', color: '#ff4d55', members: ['도전자','앙심','공격','복수의 일격'] },
            { id: 'ailment-wall', label: '상태 철벽', icon: '🛡️', color: '#77d8cf', members: ['기절 내성','귀마개','풍압 내성','내진','전화위복','돌파구'] },
            { id: 'gather-craft', label: '현지 조달', icon: '⛏️', color: '#d0b36b', members: ['물욕 센서','야생의 치료사','버섯 애호가','폭탄 배달부','유실물 사냥꾼','꼬리 미식가','탐험가의 감'] },
            { id: 'cart-insurance', label: '수레 보험', icon: '🛒', color: '#ff9eb4', members: ['수레 애호가','수레 단골','영웅의 증표','불굴','보급관'] },
            { id: 'aerial-control', label: '공중 제압', icon: '🪽', color: '#65dfff', members: ['공중 추적자','날개 꺾기','섬광 조제사'] },
            { id: 'part-break', label: '부위 파쇄', icon: '💥', color: '#ff8b66', members: ['파괴왕','꼬리 수집가','꼬리 사냥꾼','뿔 수집가','두개골 측량사','부위 개척자','약점 집착'] },
            { id: 'demolition', label: '화약 연계', icon: '💣', color: '#ffbd52', members: ['폭파광','폭탄 배달부','포술','포격 낭만'] },
            { id: 'camp-supply', label: '캠프 보급망', icon: '⛺', color: '#73e58c', members: ['보급관','캠프 수호자','수레 단골','수레 애호가','벌꿀 주세요','재정비 전문가','날쌘 보급'] },
            { id: 'team-heal', label: '생존 지원', icon: '✨', color: '#70f0b0', members: ['광역화','광역 분진','우애','응급 배급','야생의 치료사','체력 회복량 UP'] },
            { id: 'trap-control', label: '구속 작전', icon: '🪤', color: '#d2dc67', members: ['덫 장인','포획 명인','마비 사냥꾼','스태미나 탈취'] },
            { id: 'last-stand', label: '배수진', icon: '🔥', color: '#ff5f64', members: ['역전','재난대처능력','불굴','끝까지 함께','새벽의 생존자','영웅의 증표','퇴근 본능','결사의 출진','외로운 늑대','고독한 사냥꾼','생존 우선','불길한 예감'] },
            { id: 'counter', label: '반격 태세', icon: '⚡', color: '#9ba7ff', members: ['복수의 일격','공세적 방어','앙심','임기응변','가드 강화'] },
            { id: 'evasion', label: '회피 연계', icon: '💨', color: '#62dbea', members: ['겁쟁이','회피 거리 UP','회피 성능','토끼손','민첩한 발','신중한 관찰자','숨 고르기','박자감각','성급한 손','바람잡이'] },
            { id: 'sharpness', label: '예리 운용', icon: '🗡️', color: '#a9e8ff', members: ['장인','명검','칼날 연마','연마술 예','숫돌 사용 고속화','심안'] },
            { id: 'status', label: '상태이상 연계', icon: '☠️', color: '#ce86ff', members: ['상태이상 공격 강화','독사','마비 사냥꾼','잠재우는 손','폭파광'] },
            { id: 'opening-burst', label: '개막 폭딜', icon: '🌟', color: '#ffd66b', members: ['첫 수는 크게','한 대만','완전 충전','발도술','선봉장','결사의 출진','성급한 손','은신'] },
            { id: 'knockdown', label: '대경직 맹공', icon: '🔨', color: '#ff9668', members: ['넘어진 김에','폭탄 배달부','KO술','스태미나 탈취','집중 포화','둔기의 호흡','괴력의 여운'] },
            { id: 'aggro', label: '시선 집중', icon: '🎯', color: '#ff77a8', members: ['오늘의 주인공','도발','몸빵 담당','철벽주의','희생 방패','방어','위기관리반'] },
            { id: 'perfect-response', label: '찰나의 응수', icon: '⚡', color: '#73e6ff', members: ['쾌격','수세의 극의','완벽 수세','회피의 장막','겁쟁이'] },
            { id: 'critical-chain', label: '붉은 연쇄', icon: '🩸', color: '#ff426a', members: ['연쇄 회심','간파','슈퍼회심','약점 특효'] },
            { id: 'break-momentum', label: '파쇄 질주', icon: '💥', color: '#ff9a61', members: ['파쇄의 여운','상처 벌리기','선제 제압','부위 개척자'] },
            { id: 'anti-air-breaker', label: '추락 유도', icon: '🪽', color: '#58d8ff', members: ['공중 격추술','공중 추적자','날개 꺾기','섬광 예비대'] },
            { id: 'last-smile', label: '죽음의 문턱', icon: '💓', color: '#ff576b', members: ['위기일발','죽음 문턱의 미소','불굴의 맥박','재난대처능력','막타 욕심','절묘한 마무리','외로운 늑대'] },
            { id: 'fear-eater', label: '방해 역류', icon: '📣', color: '#cf8cff', members: ['겁을 삼키는 자','포효 역이용','흔들림 없는 발','바람 가르기','상태 청산','전화위복','돌파구','역경의 사냥꾼'] },
            { id: 'field-crafter', label: '현장 공방', icon: '🧰', color: '#e0bd66', members: ['현장 조달','폭탄 재배자','약초 감별사','광충 양식가','대장장이의 눈'] },
            { id: 'camp-gourmet', label: '야영 만찬', icon: '🍖', color: '#74e69a', members: ['캠프 러버','야영지 요리사','짐꾼 아이루','캠프 수호자','길치','늦잠꾸러기'] },
            { id: 'item-hoarder', label: '보급 집착', icon: '🎒', color: '#f1ca68', members: ['물자 집착','마지막 물약','함정 회수반','섬광 예비대','만족감'] },
            { id: 'sleep-demolition', label: '기상 폭파', icon: '💤', color: '#b997ff', members: ['수면 폭격수','잠재우는 손','폭탄 재배자','폭파광'] },
            { id: 'toxic-loop', label: '상태 연금', icon: '🧪', color: '#a66cff', members: ['독을 품은 칼','마비 전도체','폭파 연쇄','상태이상 공격 강화'] },
            { id: 'quirk-engine', label: '괴짜 원정대', icon: '🎭', color: '#ff92d0', members: ['겁쟁이','오래된 상처','불운 수집가','영광 중독','강박적 채집가','괴짜 약제사','길치','고양이 혀','훈타','빈 수첩','💩','낙관주의','비관주의'] },
            { id: 'party-heart', label: '사냥대의 심장', icon: '🤝', color: '#78f0b0', members: ['동료의 등불','마지막 방패','사냥의 고양감','전투 배식','피 냄새','바람잡이','위기관리반'] },
            { id: 'second-life', label: '재기 학습', icon: '🛒', color: '#ff8ca5', members: ['수레에서 배운 것','귀환 본능','불굴','수레 애호가'] },
            { id: 'opening-control', label: '초반 제압', icon: '🌅', color: '#ffd067', members: ['첫 장의 열기','선제 제압','난입 대비','첫 수는 크게','성급한 손','몬스터 박사'] },
            { id: 'sharp-craftsman', label: '날 관리반', icon: '✨', color: '#8de5ff', members: ['칼끝의 기억','숫돌 장인','대장장이의 눈','명검','장인','심안'] }
        ];
        return recipes.map(recipe => ({ ...recipe, bonus: this.bonuses[recipe.id] }));
    }

    static active(perks = []) {
        const names = new Set((perks || []).map(perk => perk?.name).filter(Boolean));
        return this.recipes.filter(recipe => recipe.members.filter(name => names.has(name)).length >= 2);
    }

    static aggregate(perks = []) {
        const total = {};
        this.active(perks).forEach(recipe => Object.entries(recipe.bonus?.modifiers || {}).forEach(([key, value]) => {
            if (key.endsWith('Rate') || key.endsWith('Attack')) total[key] = Number(total[key] || 1) * Number(value);
            else total[key] = Number(total[key] || 0) + Number(value);
        }));
        const caps = { atbRate: [0.9, 1.10], attackRate: [.9, 1.12], hitChance: [-.05, .08], critChance: [0, .08], evadeChance: [0, .08], guardChance: [0, .08], guardPower: [0, .08], counterChance: [0, .08], healBias: [0, .10] };
        Object.entries(caps).forEach(([key, [min, max]]) => {
            if (total[key] != null) total[key] = Math.max(min, Math.min(max, total[key]));
        });
        return total;
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
