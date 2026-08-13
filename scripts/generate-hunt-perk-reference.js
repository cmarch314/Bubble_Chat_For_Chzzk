const fs = require('fs');
const path = require('path');
const HuntPerkCatalog = require('../js/effects/hunt/HuntPerkCatalog.js');
const HuntPerkSynergyCatalog = require('../js/effects/hunt/HuntPerkSynergyCatalog.js');

const OUTPUT = path.join(__dirname, '..', 'data', 'hunt', 'hunt-perk-reference.md');

const legacyDetails = new Map(`
001|상시: 회피 확률 +12%p. 대가: 공격 피해 -4%.
002|피해를 받으면 6초 동안 공격 피해 +16%. 재피격 시 지속시간 갱신.
003|상시: ATB 회복 속도 +15%. 대가: 회피 확률 -10%p.
004|몬스터가 분노 상태일 때 공격 피해 +14%. 대가: 비분노 중 공격 피해 -5%.
005|상시: 공격 피해 +8%, 가드 확률 -4%p.
006|상시: 받는 피해 -12%, 공격 피해 -4%.
007|회피 성공 시 ATB를 최소 35%까지 즉시 확보.
008|상시: 회피 확률 +10%p.
009|상시: 가드 확률 +10%p, 가드 피해 경감 +10%p. 대가: ATB 회복 속도 -5%.
010|가드 성공으로 받은 피해를 추가로 30% 감소.
011|체력이 가득 찼을 때 공격 피해 +12%.
012|체력이 50% 이하일 때 공격 피해 +12%.
013|수레 전에는 공격 피해 +4% 및 받는 피해 -5%. 수레를 탈 때마다 공격 피해가 추가 +10%, 최대 2회(+20%) 누적되어 최종 +24%.
014|체력이 35% 이하일 때 공격 피해 +28%.
015|포효·풍압·지진·상태이상에서 회복한 뒤 8초 동안 공격 피해 +18%.
016|[구현 보류] 상태이상 중 회피·ATB 대응을 원작 성격에 맞게 설계할 예정. 현재 랜덤 풀에서 제외.
017|출전 물약 +1. 회복량 +10%.
018|물약 사용 판단 확률 +10%p, 아이템 사용시간 -45%.
019|모든 소모품 사용 시 25% 확률로 수량을 소모하지 않음.
020|자신의 물약 회복량 중 45%를 생존한 동료에게도 분배.
021|자신이 받는 모든 직접 회복량 +25%.
022|피격 시 25% 확률로 해당 피해를 50% 감소.
023|전투 시작 시 최대 체력과 현재 체력 +20. 대가: 공격 피해 -3%.
024|기절 발생 확률 75% 감소, 기절 지속시간 60% 감소.
025|포효 경직 지속시간을 0으로 만들어 무효화.
026|풍압 패턴을 완전히 무효화.
027|지진 패턴을 완전히 무효화.
028|납도·발도 계열 행동시간 -35%.
029|숫돌 행동시간 -60%.
030|예리도 소모량을 35% 줄여 올림 처리.
031|예리도 소모 시 35% 확률로 소모 무효.
032|근접무기 최대·현재 예리도 +20%.
033|예리도가 30% 이하일 때 공격 피해 +70%.
034|[구현 보류] 실제 공격 부위의 육질이 45 이상일 때 회심 확률 +30%p. 부위 문맥 연동 전까지 랜덤 풀에서 제외.
035|회심 확률 +18%p.
036|회심 피해 배율을 1.25배에서 1.40배로 강화.
037|[구현 보류] 체력 30% 이하 진입 시 회심 +30%p, 30초 지속. 임계 진입 이벤트 연동 전까지 랜덤 풀에서 제외.
038|[구현 보류] 10초간 회피하지 않으면 회심 +30%p, 회피 시 해제. 회피 시각 연동 전까지 랜덤 풀에서 제외.
039|[구현 보류] 적중 연계는 유지하되 5초간 미적중 시 초기화. 적중 시각 단일화 전까지 랜덤 풀에서 제외.
040|회피 성공 시 근접무기 예리도 15 회복.
041|차지·준비·발도 행동시간 -28%.
042|버프 행동 지속시간 +35%. 선율·방패강화·진액 등 주요 무기 버프는 틱 보정으로도 연장.
043|폭발·포격·용격·해방 계열 공격 피해 +14%.
044|탄창 및 건랜스 장탄 최대·현재치를 최소 7로 보정.
045|특수탄·용격·용화살 계열 피해 +13%.
046|통상탄 계열 피해 +10%.
047|관통탄 계열 피해 +10%.
048|산탄 계열 피해 +10%.
049|탄약 소모 시 30% 확률로 소모 무효.
050|예리도 소모 35% 무효와 탄약 소모 30% 무효를 함께 적용.
051|타격 공격의 기절 축적치 +30%.
052|타격·기절 태그 공격 적중 시 몬스터 ATB 8% 추가 감소.
053|모든 부위 피해 +30%.
054|몬스터 대경직·기절·마비·수면 중 ATB 회복속도 3배.
055|절단무기의 꼬리 부위 피해 +18%. 절단 후 전투 중 꼬리 갈무리 행동 가능.
056|해머·수렵피리의 머리 부위 피해 +20%.
057|근거리·원거리 구분 없이 날개 부위 피해 +18%, 날개 표적 가중치 +60%.
058|상시: 가드 확률 +14%p, 가드 피해 경감 +12%p. 대가: 공격 피해 -5%.
059|가드·퍼펙트가드·카운터 성공 후 5초 동안 공격 피해 +20%.
060|몬스터의 자신 대상 선택 가중치 4배.
061|몬스터의 자신 대상 선택 가중치 0.25배.
062|직전 공격 기록이 없는 첫 발도 공격 피해 +20%.
063|태도의 특수납도·납도 계열 공격 피해 +13%.
064|쌍검 귀인화 중 0.3초마다 귀인 게이지 +0.16, 귀인 공격 피해 +12%.
065|수렵피리 공격·방어·속도·보호 선율 지속시간을 틱 보정으로 약 50% 연장. 선율 공격 피해 +12%.
066|건랜스 포격·용격 계열 공격 피해 +16%.
067|차지액스 해방 계열 공격 피해 +14%.
068|슬래시액스 영거리해방 계열 공격 피해 +18%.
069|조충곤 삼색 진액 지속시간을 틱 보정으로 약 50% 연장. 삼색 상태 공격 피해 +12%.
070|활 용화살 계열 공격 피해 +18%.
071|무기에 이미 존재하는 독·마비·수면·폭파 축적량 +30%. 상태이상을 새로 만들지는 않음.
072|독 무기의 독 축적량 +50%, 독 발동 지속시간 10초→13초. 비독 무기에는 효과 없음.
073|마비 무기의 마비 축적량 +50%. 비마비 무기에는 효과 없음.
074|수면 무기의 수면 축적량 +50%. 비수면 무기에는 효과 없음.
075|출전 폭탄 +2. 폭탄 피해 +50%.
076|출전 덫 +2.
077|덫 사용이 가능한 몬스터의 체력이 10% 이하이면 포획으로 수렵 종료 가능.
078|출전 섬광 +2.
079|출전 생명의 가루 +1.
080|생명의 가루 사용 판단 +25%p, 가루 회복량 +20%. 개인 물약을 공유하지는 않음.
081|물약 임계값 +8%p, 가루·섬광·덫·폭탄 사용 판단 +10%p. 수량 절약 효과 없음.
082|마지막 남은 소모품을 사용할 때 50% 확률로 수량을 보존.
083|자신이 받는 회복량 +12%.
084|피니시·카운터 성공 시 생존 아군 전원의 ATB +12%. 재사용 대기시간 30초.
085|몬스터의 단일 대상 공격 시 생존한 동료 대신 맞아주는 희생 가드 후보가 됨.
086|공격으로 준 피해의 6%만큼 체력 회복.
087|변형 계열 행동시간 -30%.
088|체력 70%·ATB 100%로 출전. 첫 90초 공격 피해 +20%.
089|적중률·무기 특수행동 확률 +8%p. 대가: 공격 피해 -4%.
090|몬스터 행동이 예약된 동안 공격 피해 +12%.
091|전투 시작 후 10초간 캠프 이탈. 복귀 시 완전 보급 및 ATB 70%.
092|아이템 사용시간 +35%.
093|전투당 1회 8% 확률로 전투 중 채집. 팀 전투 채집 상한 3개 적용.
094|수레 한도 +1. 수레 복귀시간을 55%로 단축(최소 2초).
095|공격 시 12% 확률로 피해가 0이 됨.
096|출전 물약 +2.
097|출전 물약 +2. 전투 시작 후 32초간 캠프 이탈, 복귀 시 체력·예리도 완전 회복 및 ATB 70%.
098|강공·피니시·차지 해방 피해 +35%. 대가: 그 외 공격 피해 -10%.
099|실제 효과 없음. 전투 시작 시 10% 확률로 💩 퍽으로 영구 발현 가능.
100|체력이 35% 이하일 때 치명상을 HP 1로 버티고 ATB 완충. 재사용 대기시간 60초.
101|상시: 공격 피해 +8%, 가드 확률 -5%p.
102|상시: 회피 확률 +8%p, ATB 회복 속도 -8%.
103|상시: 공격 피해 +16%, 가드 확률 -12%p.
104|상시: 회피 확률 +7%p, 가드 확률 +5%p. 대가: 공격 피해 -6%.
105|상시: 가드 확률 +16%p, 가드 피해 경감 +12%p. 대가: 공격 피해 -8%.
106|상시: ATB 회복 속도 +8%, 회피 확률 +3%p.
107|상시: ATB 회복 속도 +12%, 가드 확률 -6%p.
108|상시: 회피 확률 +7%p, ATB 회복 속도 -5%.
109|상시: ATB 회복 속도 +7%, 공격 피해 +3%.
110|상시: 가드 확률 +12%p, 가드 피해 경감 +8%p. 대가: 공격 피해 -7%.
111|아군 물약 공유·생명의 가루를 받지 않음. 대가로 공격 피해 +12%, ATB 회복 +5%, 물약 판단 -8%p.
112|상시: 공격 피해 +4%, 회피 확률 -3%p.
113|상시: 회피 확률 +6%p, 공격 피해 -3%.
114|상시: 회피 확률 +10%p, 공격 피해 -9%.
115|상시: 공격 피해 +11%, 가드 확률 -8%p.
116|상시: 물약 사용 판단 +14%p, ATB 회복 속도 -3%.
117|상시: ATB 회복 속도 +6%, 물약 사용 판단 +8%p.
118|상시: 공격 피해 +9%, ATB 회복 속도 -7%.
119|상시: ATB 회복 속도 +8%, 회피 확률 +6%p. 대가: 공격 피해 -3%.
120|상시: 가드 확률 +7%p, 물약 사용 판단 +9%p. 대가: 공격 피해 -4%.
121|절단무기의 꼬리 부위 피해 +16%.
122|타격무기의 머리 부위 피해 +18%.
123|몬스터 비행 중 공격 피해 +20%.
124|몬스터가 대경직 상태일 때 공격 피해 +18%.
125|몬스터 체력이 20% 이하일 때 공격 피해 +22%.
126|피격 후 다음 공격 피해 +20%. 적중 시 1회 소모.
127|몬스터 필살기 피해 -28%.
128|출전 생명의 가루 +1.
129|출전 폭탄 +1.
130|자신의 물약 회복량 중 35%를 생존한 동료에게도 분배.
131|수레 복귀시간을 45%로 단축(최소 1.8초).
132|몬스터의 자신 대상 선택 가중치 2.2배.
133|생존한 동료가 1명 이하일 때 공격 피해 +15%.
134|한 번에 80 이상 피해를 주면 다른 생존 동료들의 ATB +5%.
135|생존자가 2명 이하일 때 공격 피해 +18%.
136|전투당 첫 공격 피해 +25%.
137|몬스터가 비행 중일 때 받는 피해 -15%.
138|아직 피해가 누적되지 않은 부위에 주는 첫 부위 피해 +25%.
139|파괴 가능 부위 중 하나라도 내구도 40% 이하이면 부위 피해 +18%.
140|남은 수렵시간이 60초 이하일 때 공격 피해 +20%.
141|전투 시작 시 발현·영구 귀속. 적중·회심·회피·가드·무기 특수행동 확률을 각각 +45%p, 아이템 절약 확률을 60%로 강화. 공격 피해·ATB 속도·고정 회복량은 변경하지 않음.
`.trim().split('\n').map(line => {
    const [id, ...detail] = line.split('|');
    return [`perk_${id}`, detail.join('|')];
}));

const synergyEffects = new Map(`
greatsword-focus|차지·발도 시간을 줄이고 첫 공격 배율을 겹쳐 강한 개막 일격을 빠르게 완성함.
critical-engine|회심 확률을 여러 조건에서 끌어올리고 발생한 회심의 피해 배율을 강화함.
guard-fortress|가드 확률과 피해 경감을 함께 높여 정면 공격을 안정적으로 받아냄.
ammo-economy|장탄 수를 확보하고 탄약 소모를 억제하면서 특수 사격 피해를 강화함.
normal-shot|통상탄의 명중·약점 공격·회심을 한 축으로 묶어 안정적인 단일 부위 화력을 만듦.
pierce-shot|관통·용화살과 날개 파괴 보정을 결합해 비행 몬스터의 긴 부위를 공략함.
spread-shot|근거리 산탄과 집중 화력을 공격 특화 퍽으로 증폭하는 고위험 근접 사격 구성임.
horn-maestro|선율 유지시간을 늘리고 연주 피해·광역 회복·팀 ATB 지원을 함께 강화함.
dual-demon|빠른 ATB와 귀인 게이지 유지, 연격 누적을 결합해 끊기지 않는 쌍검 공세를 만듦.
longsword-iai|납도 시간을 줄이고 특수납도·회심·피격 후 반격 피해를 함께 강화함.
gunlance-shell|장탄 수·포격 피해·탄약 절약을 함께 확보해 포격 순환 손실을 줄임.
chargeblade-phial|집중으로 준비시간을 줄이고 병 해방 피해와 강화 지속시간을 함께 올림.
switchaxe-zero|빠른 변형과 연격을 영거리해방 피해에 연결하는 고위험 폭딜 구성임.
glaive-tricolor|삼색 진액을 오래 유지하면서 비행 대상과 날개에 주는 피해를 강화함.
item-loop|아이템 사용시간을 줄이고 소모 무효 확률을 겹쳐 보급품 사용 횟수를 늘림.
full-health|최대 체력·회복량을 높여 완전 충전과 완벽주의의 최대 체력 조건을 오래 유지함.
rage-hunter|몬스터 분노와 자신의 피격을 공격 강화로 바꾸고 다음 복수 공격까지 증폭함.
ailment-wall|포효·풍압·지진·기절에 의한 행동 손실을 줄이거나 무효화함.
gather-craft|전투 채집과 지급 물자를 회복·폭탄 자원으로 연결해 장기 수렵 보급을 보완함.
cart-insurance|수레 한도를 늘리고 복귀시간을 줄이며 치명상 방지와 수레 후 공격 강화를 연결함.
aerial-control|비행 중 피해와 날개 파괴력을 높이고 섬광 자원으로 착지 기회를 만듦.
part-break|부위 피해와 특정 부위 우선도를 겹쳐 파괴·절단 시점을 앞당김.
demolition|폭탄·폭파·포격 피해와 지급 폭탄을 묶어 폭발 중심의 순간 화력을 만듦.
camp-supply|개인 지급품과 캠프 복귀·수레 회복을 묶어 장기전 보급 공백을 줄임.
team-heal|개인 회복량을 키운 뒤 일부를 동료에게 분배하고 가루 지급까지 보완함.
trap-control|덫 지급과 마비·탈진을 연계해 몬스터 구속 시간을 공격 기회로 바꿈.
last-stand|저체력·수레·인원 감소·시간 부족 조건을 생존과 후반 공격 강화로 전환함.
counter|가드나 피격 뒤 생기는 짧은 공격 강화들을 겹쳐 다음 반격의 피해를 높임.
evasion|회피 확률과 회피 후 ATB 확보를 결합해 공격 회피 뒤 다음 행동을 빠르게 준비함.
sharpness|예리도 최대치·소모 억제·회복 속도·회피 회복을 함께 개선해 날 유지시간을 늘림.
status|상태이상 축적 보정과 독·마비·수면·폭파 축적원을 함께 확보함.
opening-burst|첫 공격·발도·최대 체력 조건의 피해 보정을 겹쳐 전투 첫 일격을 극대화함.
knockdown|기절·탈진으로 대경직을 유도하고 대경직 중 공격과 폭탄 화력을 집중함.
aggro|몬스터의 시선을 방어형 헌터에게 모으고 희생 가드로 동료 공격을 대신 받음.
perfect-response|회피·가드 성공을 공격·회피·ATB 강화로 바꿔 연속 대응을 가능하게 함.
critical-chain|기본 회심과 약점 회심을 올리고 회심 적중마다 다음 회심 확률과 피해를 강화함.
break-momentum|첫 부위 타격을 강화하고 파괴 후 공격 피해와 팀 ATB를 얻어 다음 부위로 이어감.
anti-air-breaker|비행 중 날개 부위 피해를 높이고 섬광 보급으로 격추 기회를 보완함.
last-smile|빈사 공격 강화와 치명상 1회 생존을 결합해 저체력 구간의 폭발력을 유지함.
fear-eater|포효·풍압·지진·상태이상 회복을 공격 강화·ATB·회복으로 되돌려 받음.
field-crafter|시간 경과·채집·부위파괴로 소모품을 만들고 예리도·탄약 절약까지 지원함.
camp-gourmet|일부 인원이 늦게 합류하는 대가로 팀 최대 체력과 개인 보급·복귀 버프를 얻음.
item-hoarder|아이템을 보유할 때 생존력을 얻고 소진 시 재지급·회수 효과로 공백을 메움.
sleep-demolition|수면을 축적한 뒤 강화된 첫 타격과 폭탄·폭파 피해를 집중하는 기상 공격 구성임.
toxic-loop|독·마비 축적과 폭파 재축적을 상태이상 강화로 증폭해 제어 발동을 반복함.
quirk-engine|체력 손실·공격 실패·강공 성공·채집 변동을 각각 보상으로 바꾸는 변칙 구성임.
party-heart|동료 저체력과 생존자 감소를 개인 방어·공격·팀 ATB·광역 회복으로 전환함.
second-life|수레 한도와 복귀속도를 개선하고 수레를 탈수록 다음 전투력을 누적 강화함.
opening-control|전투 초반 공격·회피·첫 부위 피해를 높이고 첫 피격 피해를 줄임.
sharp-craftsman|예리도 최대치와 소모 무효를 확보하고 숫돌 완료 후 공격 강화까지 연결함.
`.trim().split('\n').map(line => {
    const [id, ...effect] = line.split('|');
    return [id, effect.join('|')];
}));

const hookLabels = {
    'attack-hit': '공격 적중', 'attack-miss': '공격 실패', 'damage-condition': '조건부 피해',
    'incoming-hit': '피격', 'temporary-buff': '시간제 버프', evade: '회피', guard: '가드',
    'part-damage': '부위 피해', 'part-break': '부위파괴', 'monster-control': '몬스터 제어',
    'resource-cost': '자원 소모', 'battle-entry': '전투 시작', 'interrupt-recover': '행동방해 회복',
    'ailment-recover': '상태이상 회복', 'monster-status': '몬스터 상태이상', item: '아이템',
    whetstone: '숫돌 완료', gather: '채집', periodic: '주기 효과', cart: '수레',
    targeting: '대상 선택', 'support-action': '지원 행동', 'initial-state': '초기 상태',
    camp: '캠프', survival: '생존', burst: '공격 강화'
};

const modifierLabels = {
    attackRate: ['공격 피해', true], atbRate: ['ATB 회복 속도', true],
    evadeChance: ['회피 확률', false],
    guardChance: ['가드 확률', false], guardPower: ['가드 피해 경감', false],
    healBias: ['물약 사용 판단 확률', false], critChance: ['회심 확률', false]
};

function percent(value, multiplier = false) {
    const amount = multiplier ? (Number(value) - 1) * 100 : Number(value) * 100;
    const rounded = Math.round(amount * 10) / 10;
    return `${rounded >= 0 ? '+' : ''}${rounded}%${multiplier ? '' : 'p'}`;
}

function renderModifiers(modifiers = {}) {
    const lines = [];
    Object.entries(modifiers).forEach(([key, value]) => {
        if (modifierLabels[key]) {
            const [label, multiplier] = modifierLabels[key];
            lines.push(`${label} ${percent(value, multiplier)}`);
        } else if (key.startsWith('issued')) {
            const item = { issuedPotions: '물약', issuedLifepowders: '생명의 가루', issuedTraps: '덫', issuedFlashes: '섬광', issuedBombs: '폭탄' }[key] || key;
            lines.push(`출전 ${item} +${value}`);
        }
    });
    return lines;
}

function seconds(ticks) {
    return `${Number(ticks) / 10}초`;
}

function conditionLabel(when) {
    return ({
        'part-broken': '부위가 하나 이상 파괴된 동안', airborne: '몬스터 비행 중',
        'monster-low': '몬스터 체력이 낮을 때', 'low-hp': '자신의 체력이 낮을 때',
        ailmented: '자신이 상태이상일 때', 'ally-low': '동료 체력이 낮을 때',
        'first-hit': '해당 부위 첫 타격', 'monster-sleeping': '몬스터 수면 중',
        opening: '전투 초반 30초', 'not-full-hp': '체력이 가득 차지 않았을 때',
        'critical-hp': '빈사 상태일 때', 'monster-special': '몬스터 특수상태 중',
        'first-hit-taken': '전투 첫 피격', 'has-items': '소모품을 보유한 동안',
        'no-items': '소모품이 모두 바닥났을 때', 'few-survivors': '생존자가 적을 때'
    })[when] || when;
}

function itemLabel(item) {
    return ({ potions: '물약', lifepowders: '생명의 가루', traps: '덫', flashes: '섬광', bombs: '폭탄', poison: '독', paralysis: '마비', sleep: '수면', blast: '폭파' })[item] || item;
}

function eventLabel(on) {
    if (String(on).startsWith('item-empty:')) return `${itemLabel(String(on).split(':')[1])} 소진`;
    return ({
        dodge: '회피 성공', guard: '가드 성공', 'perfect-guard': '퍼펙트 가드 성공', critical: '회심 적중',
        'strong-hit': '강공격 적중', 'heavy-hit': '80 이상 피해 적중', 'part-break': '부위파괴',
        'tail-carve': '꼬리 갈무리', gather: '채집', whetstone: '숫돌 완료', cart: '수레 복귀',
        'blast-proc': '폭파 발동', miss: '공격 실패', 'battle-start': '전투 시작',
        'roar-recover': '포효 회복', 'tremor-recover': '지진 회복', 'wind-recover': '풍압 회복',
        'ailment-recover': '상태이상 회복', 'low-hp-empty-potion': '빈사 상태에서 물약 소진'
    })[on] || on;
}

function renderTypedEffect(effect) {
    if (effect.type === 'damage') return `${conditionLabel(effect.when)} 공격 피해 ${percent(effect.value, true)}`;
    if (effect.type === 'part') return `${conditionLabel(effect.when)} 부위 피해 ${percent(effect.value, true)}`;
    if (effect.type === 'stun') return `기절 축적치 ${percent(effect.value, true)}`;
    if (effect.type === 'sharpness-save') return `예리도 소모 ${Math.round(effect.chance * 100)}% 확률로 무효`;
    if (effect.type === 'ammo-save') return `탄약 소모 ${Math.round(effect.chance * 100)}% 확률로 무효`;
    if (effect.type === 'guts') return `전투당 1회 치명상을 HP ${effect.hp}로 버티고 ATB ${effect.atb}% 확보`;
    if (effect.type === 'status') return `${itemLabel(effect.status)} 상태이상 축적량 ${percent(effect.value, true)}`;
    if (effect.type === 'item-save') return `${itemLabel(effect.item)} 사용 시 ${Math.round(effect.chance * 100)}% 확률로 수량 보존`;
    if (effect.type === 'potion-share') return `물약 회복량의 ${Math.round(effect.value * 100)}%를 생존 동료에게 분배`;
    if (effect.type === 'camp-delay') return `전투 시작 후 ${seconds(effect.ticks)} 캠프 이탈. 복귀 시 체력·예리도 완전 회복, ATB ${effect.returnAtb}%, 이후 10초간 공격 피해 ${percent(effect.returnBuff, true)}`;
    if (effect.type === 'periodic-supply') return `전투 ${seconds(effect.tick)} 경과 시 1회 무작위 소모품 보급`;
    if (effect.type === 'incoming') return `${conditionLabel(effect.when)} 받는 피해 ${percent(effect.value, true)}`;
    if (effect.type === 'combat-gather') return `지원 행동 시 전투당 1회 ${Math.round(effect.chance * 1000) / 10}% 확률로 무작위 소모품 채집`;
    if (effect.type === 'heal-variance') return `회복량이 매번 ${Math.round(effect.min * 100)}~${Math.round(effect.max * 100)}%로 변동`;
    if (effect.type === 'target-weight') return `${conditionLabel(effect.when)} 몬스터 대상 선택 가중치 ${effect.value}배`;
    if (effect.type === 'cart-recovery') return `수레 복귀시간을 ${Math.round(effect.value * 100)}%로 단축`;
    if (effect.type === 'max-hp') return `최대·현재 체력 ${effect.value >= 0 ? '+' : ''}${effect.value}`;
    if (effect.type === 'action-duration') return `지정 행동시간 ${percent(effect.value, true)}`;
    if (effect.type === 'item-duration') return `아이템 사용시간 ${percent(effect.value, true)}`;
    if (effect.type === 'whetstone-duration') return `숫돌 사용시간 ${percent(effect.value, true)}`;
    if (effect.type === 'buff-duration') return `무기 버프 지속시간 ${percent(effect.value, true)}`;
    if (effect.type === 'heal-rate') return `회복량 ${percent(effect.value, true)}`;
    if (effect.type === 'status-all') return `모든 상태이상 축적량 ${percent(effect.value, true)}`;
    if (effect.type === 'bomb-damage') return `폭탄 피해 ${percent(effect.value, true)}`;
    if (effect.type === 'camp-rate') return `캠프 체류시간 ${percent(effect.value, true)}`;
    if (effect.type === 'ai') return `${effect.action} AI 판단 ${percent(effect.value, false)}`;

    const prefix = `${eventLabel(effect.on)} 시 `;
    if (effect.buff === 'cart-learning') return `${prefix}이후 공격 피해 +8%, 최대 3중첩(+24%), 전투 종료까지 유지`;
    if (effect.buff === 'glory') return `${prefix}7초 동안 공격 피해 +20%. 현재 구현상 받는 피해도 15% 증가`;
    if (effect.buff) {
        const buff = { attack: '공격 피해', critical: '회심 확률', evade: '회피 확률', glory: '공격·방어 효과', 'cart-learning': '수레 학습' }[effect.buff] || effect.buff;
        const value = effect.buff === 'critical' || effect.buff === 'evade' ? percent(effect.value, false) : percent(effect.value, true);
        return `${prefix}${buff} ${value}${effect.ticks ? `, ${seconds(effect.ticks)} 지속` : ''}${effect.stacks ? `, 최대 ${effect.stacks}중첩` : ''}${effect.permanent ? ', 영구 누적' : ''}`;
    }
    if (effect.atb != null) return `${prefix}ATB +${effect.atb}%`;
    if (effect.teamAtb != null) return `${prefix}팀 전원 ATB +${effect.teamAtb}%`;
    if (effect.heal != null) return `${prefix}최대 체력의 ${Math.round(effect.heal * 100)}% 회복`;
    if (effect.teamHeal != null) return `${prefix}팀 전원 최대 체력의 ${Math.round(effect.teamHeal * 100)}% 회복`;
    if (effect.teamMaxHp != null) return `${prefix}팀 전원 최대·현재 체력 +${effect.teamMaxHp}`;
    if (effect.selfDamage != null) return `${prefix}자신의 최대 체력 ${Math.round(effect.selfDamage * 100)}% 손실`;
    if (effect.item && Number(effect.amount || 0) > 0) return `${prefix}${itemLabel(effect.item)} +${effect.amount}${effect.chance ? ` (${Math.round(effect.chance * 100)}% 확률)` : ''}${effect.once ? ', 전투당 1회' : ''}`;
    if (effect.ammo != null) return `${prefix}탄약 +${effect.ammo}`;
    if (effect.monsterBuild) return `${prefix}${effect.monsterBuild} 축적 +${effect.value}`;
    if (effect.randomItem) return `${prefix}무작위 소모품 +${effect.amount}`;
    if (effect.counter) return `${prefix}${effect.threshold}회 누적 후 다음 공격 확정 적중`;
    return `${prefix}런타임 효과 ${JSON.stringify(effect)}`;
}

function synergyLinks(name) {
    return HuntPerkSynergyCatalog.recipes
        .filter(recipe => recipe.members.includes(name))
        .map(recipe => ({
            id: recipe.id,
            label: `${recipe.icon} ${recipe.label}`,
            members: recipe.members.filter(member => member !== name),
            effect: recipe.bonus?.summary
        }));
}

function build() {
    const perks = HuntPerkCatalog.all();
    const errors = HuntPerkCatalog.validate();
    if (errors.length) throw new Error(`perk catalog invalid: ${errors.join('; ')}`);
    if (perks.length !== 200) throw new Error(`expected 200 perks, got ${perks.length}`);
    const undocumentedSynergies = HuntPerkSynergyCatalog.recipes.filter(recipe => !recipe.bonus?.summary || !recipe.bonus?.effects?.length);
    if (undocumentedSynergies.length) throw new Error(`undocumented synergies: ${undocumentedSynergies.map(recipe => recipe.id).join(', ')}`);

    const lines = [
        '<!-- GENERATED by scripts/generate-hunt-perk-reference.js. Edit the catalog/runtime or generator, not this file. -->',
        '# 수렵 퍽 200종 효과 명세', '',
        `현재 \`HuntPerkCatalog\`의 **${perks.length}개 퍽**과 \`HuntPerkSynergyCatalog\`의 **${HuntPerkSynergyCatalog.recipes.length}개 조합군**을 정리한 문서임. 001–141만 라이브 랜덤 풀이고 142–200은 전투 AI 확립 뒤 재검토할 보존 초안임.`, '',
        '## 읽는 법', '',
        '- 시간 단위는 10틱 = 1초임.',
        '- `+N%p`는 확률 자체에 더하는 값이고, `+N%`는 피해·속도·축적량 배율임.',
        '- `출전 +N`은 개인 지급량임. 여정형의 캠프 공동자원과는 별도이며 향후 공급 정책이 바뀌어도 이 표기는 개인 지급 효과만 뜻함.',
        '- 연계 조합은 같은 조합군 퍽을 2개 이상 장착하면 실제 보너스가 발동하며 UI에서 인접·글로우로 표시됨.',
        '- 실제 코드가 아직 영구 누적 또는 전투당 1회로 동작하는 경우 그 상태를 그대로 기록함.', '',
        '## 공통 상한과 규칙', '',
        '- 한 헌터가 장착할 수 있는 퍽은 최대 4개임.',
        '- 적중·회심 등 최종 확률은 각 행동 런타임의 공통 상한을 따름. 퍽 수치가 상한을 넘으면 초과분은 잘림.',
        '- 확률·아이템·ATB·피해 효과는 성향 AI 판단과 합산되지만, 퍽이 개별 공격을 채팅으로 지시하지는 않음.',
        '- 💩은 빈 수첩에서 전투 시작 시 발현되거나 리롤에서 직접 등장할 수 있고, 발현 후 시청자 퍽으로 귀속됨.', ''
    ];

    perks.forEach((perk, index) => {
        if (index === 0 || index === 50 || index === 100 || index === 141) {
            const titles = { 0: '기본 전투·생존 퍽 (001–050)', 50: '무기·상태·아이템 퍽 (051–100)', 100: '성향·부위·특수 퍽 (101–141)', 141: '확장 반응·여정 퍽 (142–200)' };
            lines.push(`## ${titles[index]}`, '');
        }
        const modifiers = renderModifiers(perk.modifiers);
        const typed = (perk.effects || []).filter(effect => !(effect.on === 'battle-start' && Number(effect.amount || 0) === 0 && !effect.randomItem && !effect.selfDamage && !effect.teamMaxHp)).map(renderTypedEffect);
        const detail = legacyDetails.get(perk.id);
        const effects = detail ? [detail] : [...modifiers, ...typed];
        if (!effects.length) effects.push('현재 실행 가능한 수치 효과 없음. 카탈로그 설명 및 조합 분류만 제공.');
        lines.push(`### ${perk.id} · ${perk.name}`, '', `> ${perk.description}`, '');
        effects.forEach(effect => lines.push(`- 효과: ${effect}`));
        if (!detail && modifiers.length && typed.length) lines.push('- 적용 순서: 상시 보정 후 조건·이벤트 효과를 별도로 계산함.');
        const hooks = (perk.hooks || []).map(hook => hookLabels[hook] || hook);
        lines.push(`- 발동/연동: ${hooks.length ? hooks.join(', ') : '상시 또는 전용 런타임'}`);
        const synergies = synergyLinks(perk.name);
        if (!synergies.length) {
            lines.push('- 연계 스킬: 없음', '');
        } else {
            lines.push('- 연계 스킬:');
            synergies.forEach(synergy => {
                lines.push(`  - ${synergy.label}: ${synergy.members.join(', ')}`);
                lines.push(`    - 연계 효과: ${synergy.effect}`);
            });
            lines.push('');
        }
    });

    lines.push('## 설계 참고 자료', '',
        '- Monster Hunter Wilds 스킬 목록: https://mhwilds.gamertw.com/ja/skill',
        '- Monster Hunter: World / Iceborne 스킬 목록: https://game8.jp/mhw/184827',
        '- Darkest Dungeon Quirks: https://darkestdungeon.wiki.gg/wiki/Quirks_%28Darkest_Dungeon%29',
        '- Darkest Dungeon Camping Skills: https://darkestdungeon.wiki.gg/wiki/Camping_Skills', '',
        '## 유지보수 계약', '',
        '- 원본 데이터: `js/effects/hunt/HuntPerkCatalog.js`',
        '- 실행 의미: `js/effects/hunt/HuntPerkRuntime.js` 및 성향/전투 실행기',
        '- 조합 분류: `js/effects/hunt/HuntPerkSynergyCatalog.js`',
        '- 재생성: `node scripts/generate-hunt-perk-reference.js`',
        '- 검증: `node tests/hunt-perk-documentation.test.js`', '');
    return `${lines.join('\n')}\n`;
}

if (require.main === module) {
    fs.writeFileSync(OUTPUT, build(), 'utf8');
    console.log(`wrote ${OUTPUT}`);
}

module.exports = { build, OUTPUT, legacyDetails, synergyEffects, renderTypedEffect };
