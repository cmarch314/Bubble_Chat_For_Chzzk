class HuntPerkCatalog {
    static MAX_PERKS = 4;
    // Expansion perks 142-200 stay preserved as drafts, but live rolls use
    // only the reviewed core until their required AI/runtime hooks exist.
    static ACTIVE_ROLL_LIMIT = 141;
    static DEFERRED_LIVE_NAMES = new Set(['돌파구', '약점 특효', '힘의 해방', '혼신', '연격']);
    static DUNG_PERK_ID = 'perk_141';
    static DUNG_PERK_NAME = '💩';

    static isDung(perk) {
        return perk?.id === this.DUNG_PERK_ID || perk?.name === this.DUNG_PERK_NAME || perk?.name === '똥';
    }

    // Expansion perks are data-authored so battle and journey runtimes can
    // interpret one trigger contract instead of scattering perk-name branches.
    static get expansion() {
        return [
            { name: '쾌격', description: '공격을 스치듯 피한 순간, 다음 공세가 번개처럼 매서워진다.', affinities: ['mobility','burst'], hooks: ['dodge','temporary-buff'], effects: [{ on: 'dodge', buff: 'attack', value: 1.18, ticks: 70 }] },
            { name: '수세의 극의', description: '정확한 방어는 움츠림이 아니라 가장 짧은 공격 준비다.', affinities: ['guard','burst'], hooks: ['guard','temporary-buff'], effects: [{ on: 'guard', buff: 'attack', value: 1.16, ticks: 65 }] },
            { name: '연쇄 회심', description: '회심의 붉은 궤적이 이어질수록 다음 칼끝도 붉어진다.', affinities: ['burst'], hooks: ['attack-hit'], effects: [{ on: 'critical', buff: 'critical', value: 0.06, ticks: 80, stacks: 3 }] },
            { name: '상처 벌리기', description: '깨진 갑각과 열린 상처를 놓치지 않고 더 깊게 파고든다.', affinities: ['part','burst'], hooks: ['damage-condition'], effects: [{ type: 'damage', when: 'part-broken', value: 1.16 }] },
            { name: '공중 격추술', description: '하늘에 뜬 몬스터의 날개뿌리를 노려 땅으로 끌어내린다.', affinities: ['ranged','part'], hooks: ['part-damage'], effects: [{ type: 'part', when: 'airborne', value: 1.28 }] },
            { name: '파쇄의 여운', description: '부위가 깨지는 굉음에 고양되어 파티의 ATB가 솟는다.', affinities: ['part','support'], hooks: ['part-break'], effects: [{ on: 'part-break', teamAtb: 12 }] },
            { name: '둔기의 호흡', description: '머리를 두드릴수록 호흡이 맞아 기절치가 묵직하게 쌓인다.', affinities: ['blunt'], hooks: ['monster-control'], effects: [{ type: 'stun', value: 1.22 }] },
            { name: '칼끝의 기억', description: '예리도가 닳을수록 손이 날을 기억해 소모를 억누른다.', affinities: ['sever'], hooks: ['resource-cost'], effects: [{ type: 'sharpness-save', chance: 0.22 }] },
            { name: '절묘한 마무리', description: '사냥감이 쓰러지기 직전일수록 마지막 일격이 무거워진다.', affinities: ['burst'], hooks: ['damage-condition'], effects: [{ type: 'damage', when: 'monster-low', value: 1.24 }] },
            { name: '위기일발', description: '체력이 바닥에 가까울 때 회피와 반격 감각이 동시에 깨어난다.', affinities: ['mobility','burst'], hooks: ['damage-condition'], modifiers: { evadeChance: 0.06, counterChance: 0.06 }, effects: [{ type: 'damage', when: 'low-hp', value: 1.18 }] },
            { name: '역경의 사냥꾼', description: '상태이상에 시달리는 동안 오히려 집중력이 날카로워진다.', affinities: ['status','burst'], hooks: ['damage-condition'], effects: [{ type: 'damage', when: 'ailmented', value: 1.2 }] },
            { name: '피 냄새', description: '쓰러질 듯한 동료를 보면 사냥 본능이 위험하게 끓어오른다.', affinities: ['support','burst'], hooks: ['damage-condition'], effects: [{ type: 'damage', when: 'ally-low', value: 1.17 }] },
            { name: '선제 제압', description: '첫 공격으로 부위를 크게 흔들어 수렵의 흐름을 선점한다.', affinities: ['part','burst'], hooks: ['battle-entry','part-damage'], effects: [{ type: 'part', when: 'first-hit', value: 1.7 }] },
            { name: '괴력의 여운', description: '강한 공격이 적중하면 남은 힘이 다음 행동까지 이어진다.', affinities: ['burst'], hooks: ['attack-hit'], effects: [{ on: 'strong-hit', atb: 16 }] },
            { name: '사냥의 고양감', description: '큰 피해를 내면 웃음이 터지고 동료의 ATB도 함께 차오른다.', affinities: ['support','burst'], hooks: ['attack-hit'], effects: [{ on: 'heavy-hit', teamAtb: 7 }] },
            { name: '완벽 수세', description: '완벽한 가드는 반동까지 삼켜 곧바로 다음 행동을 준비한다.', affinities: ['guard'], hooks: ['guard'], effects: [{ on: 'perfect-guard', atb: 30 }] },
            { name: '구르기 장전', description: '회피 동작 속에서 탄과 병을 손에 익은 만큼 되채운다.', affinities: ['mobility','ranged'], hooks: ['dodge','resource-cost'], effects: [{ on: 'dodge', ammo: 1 }] },
            { name: '회피의 장막', description: '아슬아슬한 회피 뒤 잠시 몸이 가벼워져 다음 공격도 흘린다.', affinities: ['mobility'], hooks: ['dodge','temporary-buff'], effects: [{ on: 'dodge', buff: 'evade', value: 0.1, ticks: 55 }] },
            { name: '불굴의 맥박', description: '수레 직전 단 한 번, 체력 1로 버티며 ATB를 깨운다.', affinities: ['survival'], hooks: ['incoming-hit'], effects: [{ type: 'max-hp', value: -8 }, { type: 'guts', hp: 1, atb: 100, once: true }] },
            { name: '흔들림 없는 발', description: '지진을 버텨낸 직후 땅의 반동을 공격력으로 되돌린다.', affinities: ['guard','burst'], hooks: ['interrupt-recover'], effects: [{ on: 'tremor-recover', buff: 'attack', value: 1.15, ticks: 60 }] },
            { name: '바람 가르기', description: '풍압을 뚫고 자세를 되찾으면 ATB가 크게 되돌아온다.', affinities: ['mobility'], hooks: ['interrupt-recover'], effects: [{ on: 'wind-recover', atb: 28 }] },
            { name: '포효 역이용', description: '귀를 찢는 포효가 끝나는 순간 망설임 없이 파고든다.', affinities: ['burst'], hooks: ['interrupt-recover'], effects: [{ on: 'roar-recover', buff: 'attack', value: 1.14, ticks: 50 }] },
            { name: '상태 청산', description: '상태이상을 털어내며 체력을 회복하고 전화위복의 불씨를 얻는다.', affinities: ['status','support'], hooks: ['ailment-recover'], effects: [{ on: 'ailment-recover', heal: 0.12 }] },
            { name: '독을 품은 칼', description: '독이 발동할 때 칼날에도 맹독이 번져 축적이 가속된다.', affinities: ['status'], hooks: ['monster-status'], effects: [{ type: 'status', status: 'poison', value: 1.35 }] },
            { name: '마비 전도체', description: '마비 축적이 임계치에 가까울수록 공격의 전류가 거세진다.', affinities: ['status'], hooks: ['monster-status'], effects: [{ type: 'status', status: 'paralysis', value: 1.35 }] },
            { name: '수면 폭격수', description: '잠든 사냥감 앞에서 폭탄을 아끼지 않고 기상 일격을 준비한다.', affinities: ['status','explosive'], hooks: ['damage-condition'], effects: [{ type: 'damage', when: 'monster-sleeping', value: 1.45 }] },
            { name: '폭파 연쇄', description: '폭파가 터진 뒤 남은 분진이 다음 폭파 축적의 씨앗이 된다.', affinities: ['status','explosive'], hooks: ['monster-status'], effects: [{ on: 'blast-proc', monsterBuild: 'blast', value: 24 }] },
            { name: '함정 회수반', description: '덫이 끝나면 망가진 부품을 주워 일정 확률로 다시 조립한다.', affinities: ['support'], hooks: ['item'], effects: [{ type: 'item-save', item: 'traps', chance: 0.35 }] },
            { name: '섬광 예비대', description: '마지막 섬광을 쓰면 주머니 깊숙한 예비탄 하나를 찾아낸다.', affinities: ['support','ranged'], hooks: ['item'], effects: [{ on: 'item-empty:flashes', item: 'flashes', amount: 1, once: true }] },
            { name: '폭탄 재배자', description: '부서진 갑각의 화약가루를 모아 폭탄 하나를 현장에서 만든다.', affinities: ['part','explosive'], hooks: ['part-break','item'], effects: [{ on: 'part-break', item: 'bombs', amount: 1, chance: 0.55 }] },
            { name: '마지막 물약', description: '물약이 바닥나고 체력이 위험해지면 비상약 하나가 나온다.', affinities: ['support','survival'], hooks: ['item'], effects: [{ on: 'low-hp-empty-potion', item: 'potions', amount: 1, once: true }] },
            { name: '전투 배식', description: '자신이 마신 회복약의 온기를 가장 약한 동료에게도 나눈다.', affinities: ['support'], hooks: ['item'], effects: [{ type: 'potion-share', value: 0.3 }] },
            { name: '숫돌 장인', description: '숫돌질을 마치면 예리도와 함께 잠시 공격 감각도 반짝인다.', affinities: ['sever','burst'], hooks: ['whetstone'], effects: [{ on: 'whetstone', buff: 'attack', value: 1.12, ticks: 55 }] },
            { name: '광충 양식가', description: '보급 상자에 키운 광충을 풀어 섬광 두 발을 추가 지급한다.', affinities: ['support','ranged'], hooks: ['initial-state'], modifiers: { issuedFlashes: 2 }, effects: [{ on: 'battle-start', item: 'flashes', amount: 0 }] },
            { name: '약초 감별사', description: '채집한 약초에서 쓸 만한 것만 골라 생명의 가루를 빚는다.', affinities: ['support'], hooks: ['gather','item'], effects: [{ on: 'gather', item: 'lifepowders', amount: 1, chance: 0.45 }] },
            { name: '유실물 사냥꾼', description: '부위가 깨질 때 튄 유실물을 놓치지 않고 보급품으로 바꾼다.', affinities: ['part','support'], hooks: ['part-break','item'], effects: [{ on: 'part-break', item: 'potions', amount: 1, chance: 0.4 }] },
            { name: '꼬리 미식가', description: '꼬리 갈무리 직후 즉석 요리를 만들어 파티의 체력을 채운다.', affinities: ['sever','support'], hooks: ['tail-carve'], effects: [{ on: 'tail-carve', teamHeal: 0.18 }] },
            { name: '야영지 요리사', description: '출발 전 따끈한 식사로 파티 전원의 최대 체력을 조금 늘린다.', affinities: ['camp','support'], hooks: ['battle-entry'], effects: [{ on: 'battle-start', teamMaxHp: 8 }] },
            { name: '캠프 러버', description: '전투보다 캠프가 좋다. 한참 머물다 완전 보급으로 합류한다.', affinities: ['camp','quirk'], hooks: ['battle-entry'], effects: [{ type: 'camp-delay', ticks: 200, returnAtb: 85, returnBuff: 1.22 }] },
            { name: '늦잠꾸러기', description: '개전과 함께 3초간 잠들지만 벌떡 일어나 ATB를 채운다.', affinities: ['quirk','burst'], hooks: ['battle-entry'], effects: [{ type: 'camp-delay', ticks: 30, reason: '늦잠', returnAtb: 100, returnBuff: 1.12 }] },
            { name: '현장 조달', description: '전투가 길어지면 단 한 번 주변을 훑어 부족한 물자를 찾는다.', affinities: ['gather','support'], hooks: ['periodic'], effects: [{ type: 'periodic-supply', tick: 900, once: true }] },
            { name: '짐꾼 아이루', description: '아이루가 보급품을 꽉 눌러 담아 물약과 폭탄을 더 챙겨준다.', affinities: ['camp','support'], hooks: ['initial-state'], modifiers: { issuedPotions: 2, issuedBombs: 1 }, effects: [{ on: 'battle-start', atb: 0 }] },
            { name: '대장장이의 눈', description: '무기 상태를 한눈에 읽어 예리도 소모와 탄 낭비를 줄인다.', affinities: ['camp','resource'], hooks: ['resource-cost'], effects: [{ type: 'sharpness-save', chance: 0.18 }, { type: 'ammo-save', chance: 0.18 }] },
            { name: '탐험가의 감', description: '낯선 길에서도 쓸 만한 흔적을 찾아 보급품을 하나 얻는다.', affinities: ['journey','gather'], hooks: ['battle-entry'], effects: [{ on: 'battle-start', randomItem: true, amount: 1 }] },
            { name: '난입 대비', description: '불청객이 나타날 것을 가정해 첫 강공격의 피해를 크게 줄인다.', affinities: ['journey','survival'], hooks: ['incoming-hit'], effects: [{ type: 'incoming', when: 'first-hit-taken', value: 0.55 }] },
            { name: '첫 장의 열기', description: '수렵 초반 30초 동안 공격과 회피 판단이 유난히 날카롭다.', affinities: ['burst'], hooks: ['damage-condition'], modifiers: { evadeChance: 0.04 }, effects: [{ type: 'damage', when: 'opening', value: 1.18 }] },
            { name: '오래된 상처', description: '상처를 안고 출발해 체력은 줄지만 통증이 공격력을 깨운다.', affinities: ['quirk','burst'], hooks: ['battle-entry','damage-condition'], effects: [{ on: 'battle-start', selfDamage: 0.15 }, { type: 'damage', when: 'not-full-hp', value: 1.16 }] },
            { name: '죽음 문턱의 미소', description: '빈사 상태에서 웃으며 ATB와 회심을 폭발적으로 끌어낸다.', affinities: ['quirk','burst'], hooks: ['damage-condition'], modifiers: { critChance: 0.08 }, effects: [{ type: 'damage', when: 'critical-hp', value: 1.28 }] },
            { name: '불운 수집가', description: '빗나감이 두 번 쌓이면 다음 공격은 반드시 길을 찾아간다.', affinities: ['quirk','burst'], hooks: ['attack-miss'], effects: [{ on: 'miss', counter: 'misses', threshold: 2, grant: 'sure-hit' }] },
            { name: '영광 중독', description: '강공격 성공의 환호에 취해 공격은 세지고 방어는 약해진다.', affinities: ['quirk','burst'], hooks: ['attack-hit','incoming-hit'], effects: [{ on: 'strong-hit', buff: 'glory', value: 1.2, ticks: 70 }] },
            { name: '겁을 삼키는 자', description: '포효 경직을 견딘 뒤 두려움을 삼켜 공격력으로 바꾼다.', affinities: ['quirk','burst'], hooks: ['interrupt-recover'], effects: [{ on: 'roar-recover', buff: 'attack', value: 1.2, ticks: 65 }] },
            { name: '강박적 채집가', description: '반짝이는 것이 보이면 전투를 멈추고 반드시 주워 온다.', affinities: ['quirk','gather'], hooks: ['support-action'], effects: [{ type: 'combat-gather', chance: 0.045, once: true }] },
            { name: '물자 집착', description: '소모품이 남아 있으면 안심해 단단해지고, 바닥나면 사나워진다.', affinities: ['quirk','support'], hooks: ['incoming-hit','damage-condition'], effects: [{ type: 'incoming', when: 'has-items', value: 0.9 }, { type: 'damage', when: 'no-items', value: 1.18 }] },
            { name: '동료의 등불', description: '가장 약한 동료가 살아 있는 한 자신과 그 동료가 더 버틴다.', affinities: ['support','survival'], hooks: ['incoming-hit'], effects: [{ type: 'incoming', when: 'ally-low', value: 0.88 }] },
            { name: '마지막 방패', description: '동료가 둘 이하로 남으면 자신이 표적을 끌고 피해를 줄인다.', affinities: ['guard','support'], hooks: ['targeting','incoming-hit'], effects: [{ type: 'incoming', when: 'few-survivors', value: 0.78 }, { type: 'target-weight', when: 'few-survivors', value: 2.4 }] },
            { name: '수레에서 배운 것', description: '수레를 탈 때마다 다음 합류 후 회피와 공격 감각이 성장한다.', affinities: ['quirk','survival'], hooks: ['cart','damage-condition'], effects: [{ on: 'cart', buff: 'cart-learning', value: 1, permanent: true }] },
            { name: '괴짜 약제사', description: '회복약 효과가 크게 출렁이지만 넘치면 동료에게까지 번진다.', affinities: ['quirk','support'], hooks: ['item'], effects: [{ type: 'heal-variance', min: 0.7, max: 1.6 }, { type: 'potion-share', value: 0.18 }] },
            { name: '몬스터 박사', description: '분노·비행·대경직의 징후를 읽어 약점을 더 세게 찌른다.', affinities: ['knowledge','burst'], hooks: ['damage-condition'], effects: [{ type: 'damage', when: 'monster-special', value: 1.13 }] },
            { name: '귀환 본능', description: '수레에서 복귀할 길을 너무 잘 알아 전장 합류가 빠르다.', affinities: ['camp','survival'], hooks: ['cart'], effects: [{ type: 'cart-recovery', value: 0.72 }] }
        ];
    }

    static expansionFor(name) {
        if (!this._expansionByName) this._expansionByName = new Map(this.expansion.map(def => [def.name, def]));
        return this._expansionByName.get(name) || null;
    }

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
            '만족할 줄 모름','절약가','야생의 치료사','영웅의 증표','희생 방패','혈기','고속 변형','결사의 출진','완벽주의','임기응변',
            '길치','고양이 혀','물욕 센서','수레 애호가','훈타','벌꿀 주세요','캠프 수호자','한 대만','빈 수첩','새벽의 생존자',
            '선봉장','신중한 관찰자','유리 대포','돌다리 전문가','철벽주의','박자감각','성급한 손','숨 고르기','바람잡이','몸빵 담당',
            '고독한 사냥꾼','낙관주의','비관주의','생존 우선','공격 중독','재정비 전문가','날쌘 보급','묵직한 손','민첩한 발','위기관리반',
            '꼬리 사냥꾼','뿔 수집가','공중 추적자','넘어진 김에','막타 욕심','복수의 일격','불길한 예감','보급관','폭탄 배달부','응급 배급',
            '수레 단골','오늘의 주인공','외로운 늑대','분위기 메이커','끝까지 함께','첫 수는 크게','지상주의자','부위 개척자','약점 집착','퇴근 본능','💩',
            ...this.expansion.map(def => def.name)
        ];
    }

    static all() {
        return this.names.map((name, index) => ({
            id: `perk_${String(index + 1).padStart(3, '0')}`,
            name,
            description: this._description(name),
            affinities: this._affinities(name),
            modifiers: this._modifiers(name),
            hooks: this._hooks(name),
            effects: this.expansionFor(name)?.effects || []
        }));
    }

    static validate() {
        const errors = [];
        const all = this.all();
        const allowedTypes = new Set([
            'damage','part','stun','sharpness-save','ammo-save','guts','status',
            'item-save','potion-share','camp-delay','periodic-supply','incoming',
            'combat-gather','heal-variance','target-weight','cart-recovery',
            'action-duration','item-duration','whetstone-duration','buff-duration',
            'heal-rate','status-all','bomb-damage','camp-rate','max-hp','ai'
        ]);
        const allowedEvents = new Set([
            'battle-start','dodge','guard','perfect-guard','critical','strong-hit',
            'heavy-hit','miss','part-break','tail-carve','gather','whetstone','cart',
            'blast-proc','low-hp-empty-potion','item-empty:flashes','roar-recover',
            'tremor-recover','wind-recover','ailment-recover'
        ]);
        if (all.length !== 200) errors.push(`perk count ${all.length} !== 200`);
        if (new Set(all.map(perk => perk.id)).size !== all.length) errors.push('duplicate perk id');
        if (new Set(all.map(perk => perk.name)).size !== all.length) errors.push('duplicate perk name');
        if (new Set(all.map(perk => perk.description)).size !== all.length) errors.push('duplicate perk description');
        this.expansion.forEach(def => {
            if (!def.hooks?.length) errors.push(`${def.name}: missing runtime hook`);
            if (!def.effects?.length && !Object.keys(def.modifiers || {}).length) errors.push(`${def.name}: no real effect`);
            (def.effects || []).forEach(effect => {
                if (effect.type && !allowedTypes.has(effect.type)) errors.push(`${def.name}: unknown effect type ${effect.type}`);
                if (effect.on && !allowedEvents.has(effect.on)) errors.push(`${def.name}: unknown trigger ${effect.on}`);
                if (!effect.type && !effect.on) errors.push(`${def.name}: unbound effect`);
            });
        });
        return errors;
    }

    static roll(random = Math.random) {
        const countTable = [0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
        const count = countTable[Math.floor(random() * countTable.length)];
        if (count === 0) return [];
        const pool = this.all().slice(0, this.ACTIVE_ROLL_LIMIT)
            .filter(perk => perk.name !== '빈 수첩'
                && !this.isDung(perk)
                && !this.DEFERRED_LIVE_NAMES.has(perk.name));
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool.slice(0, Math.min(count, this.MAX_PERKS));
    }

    static aggregate(perks = []) {
        const total = {
            attackRate: 1,
            atbRate: 1,
            hitChance: 0,
            critChance: 0,
            evadeChance: 0,
            guardChance: 0,
            guardPower: 0,
            counterChance: 0,
            healBias: 0,
            issuedPotions: 0,
            issuedLifepowders: 0,
            issuedTraps: 0,
            issuedFlashes: 0,
            issuedBombs: 0,
            lowHpAttack: 1,
            enragedAttack: 1
        };
        perks.forEach(perk => {
            const modifiers = perk && perk.modifiers ? perk.modifiers : {};
            Object.entries(modifiers).forEach(([key, value]) => {
                if (key.endsWith('Rate') || key.endsWith('Attack')) total[key] *= value;
                else total[key] += value;
            });
        });
        const Synergies = typeof HuntPerkSynergyCatalog !== 'undefined'
            ? HuntPerkSynergyCatalog
            : (typeof require === 'function' ? require('./HuntPerkSynergyCatalog.js') : null);
        const synergyModifiers = Synergies?.aggregate?.(perks) || {};
        Object.entries(synergyModifiers).forEach(([key, value]) => {
            if (key.endsWith('Rate') || key.endsWith('Attack')) total[key] *= value;
            else total[key] += value;
        });
        return total;
    }

    static _modifiers(name) {
        const expanded = this.expansionFor(name);
        if (expanded) return expanded.modifiers || {};
        const exact = {
            '겁쟁이': { evadeChance: 0.12, attackRate: 0.96 },
            '토끼손': { atbRate: 1.15, evadeChance: -0.10 },
            '공격': { attackRate: 1.08, guardChance: -0.04 },
            '방어': { attackRate: 0.96 },
            '체력 증강': { attackRate: 0.97 },
            '회피 성능': { evadeChance: 0.10 },
            '가드 성능': { atbRate: 0.95, guardChance: 0.10, guardPower: 0.10 },
            '빨리 먹기': { healBias: 0.10 },
            '철벽': { attackRate: 0.95, guardChance: 0.14, guardPower: 0.12 },
            '선봉장': { attackRate: 1.08, guardChance: -0.05 },
            '신중한 관찰자': { atbRate: 0.92, evadeChance: 0.08 },
            '유리 대포': { attackRate: 1.16, guardChance: -0.12 },
            '돌다리 전문가': { attackRate: 0.94, evadeChance: 0.07, guardChance: 0.05 },
            '철벽주의': { attackRate: 0.92, guardChance: 0.16, guardPower: 0.12 },
            '박자감각': { atbRate: 1.08, evadeChance: 0.03 },
            '성급한 손': { atbRate: 1.12, guardChance: -0.06 },
            '숨 고르기': { atbRate: 0.95, evadeChance: 0.07 },
            '바람잡이': { atbRate: 1.07, attackRate: 1.03 },
            '몸빵 담당': { attackRate: 0.93, guardChance: 0.12, guardPower: 0.08 },
            '고독한 사냥꾼': { attackRate: 1.12, atbRate: 1.05, healBias: -0.08 },
            '낙관주의': { attackRate: 1.04, evadeChance: -0.03 },
            '비관주의': { attackRate: 0.97, evadeChance: 0.06 },
            '생존 우선': { attackRate: 0.91, evadeChance: 0.10 },
            '공격 중독': { attackRate: 1.11, guardChance: -0.08 },
            '재정비 전문가': { atbRate: 0.97, healBias: 0.14 },
            '날쌘 보급': { atbRate: 1.06, healBias: 0.08 },
            '묵직한 손': { attackRate: 1.09, atbRate: 0.93 },
            '민첩한 발': { atbRate: 1.08, evadeChance: 0.06, attackRate: 0.97 },
            '위기관리반': { attackRate: 0.96, guardChance: 0.07, healBias: 0.09 },
            '버섯 애호가': { issuedPotions: 1 },
            '벌꿀 주세요': { issuedPotions: 2 },
            '광역 분진': { issuedLifepowders: 1 },
            '보급관': { issuedLifepowders: 1 },
            '덫 장인': { issuedTraps: 2 },
            '섬광 조제사': { issuedFlashes: 2 },
            '폭파광': { issuedBombs: 2 },
            '폭탄 배달부': { issuedBombs: 1 },
            '캠프 수호자': { issuedPotions: 2 },
            '완벽주의': { attackRate: 0.96, hitChance: 0.08, counterChance: 0.08 },
            '💩': { hitChance: 0.10, critChance: 0.10, evadeChance: 0.10, guardChance: 0.10, counterChance: 0.10 }
        };
        return exact[name] || {};
    }

    static _hooks(name) {
        const expanded = this.expansionFor(name);
        if (expanded) return expanded.hooks || [];
        if (name === '빈 수첩') return [];
        const groups = [
            [['겁쟁이','토끼손','회피 거리 UP','회피 성능','연마술 예'], 'evade'],
            [['앙심','전화위복','돌파구','공세적 방어','연격'], 'temporary-buff'],
            [['도전자','공격','완전 충전','역전','불굴','재난대처능력','심안','약점 특효','간파','슈퍼회심','힘의 해방','혼신','완벽주의','임기응변','한 대만'], 'damage-condition'],
            [['방어','가드 성능','가드 강화','정령의 가호','철벽','영웅의 증표','희생 방패','새벽의 생존자'], 'incoming-hit'],
            [['버섯 애호가','빨리 먹기','만족감','광역화','체력 회복량 UP','광역 분진','우애','만족할 줄 모름','절약가','야생의 치료사','벌꿀 주세요','고양이 혀'], 'item'],
            [['체력 증강','장인','포탄 장전'], 'initial-state'],
            [['기절 내성','귀마개','풍압 내성','내진'], 'ailment-resist'],
            [['납도술','숫돌 사용 고속화','집중','고속 변형'], 'action-duration'],
            [['칼날 연마','명검','탄환 절약','명검의 가르침'], 'resource-cost'],
            [['강화 지속','귀인화 체질','선율 강박','삼색 탐닉'], 'buff-duration'],
            [['포술','특수 사격 강화','통상탄 강화','관통탄 강화','산탄 강화','집중 포화','발도술','특수납도 중독','포격 낭만','병 수집벽','영거리 집착','용화살 신봉'], 'action-specific'],
            [['KO술','스태미나 탈취'], 'monster-control'],
            [['파괴왕','꼬리 수집가','두개골 측량사','날개 꺾기'], 'part-damage'],
            [['도발','은신'], 'targeting'],
            [['상태이상 공격 강화','독사','마비 사냥꾼','잠재우는 손','폭파광'], 'monster-status'],
            [['덫 장인','포획 명인','섬광 조제사'], 'support-action'],
            [['혈기'], 'lifesteal'],
            [['결사의 출진','길치','캠프 수호자'], 'battle-entry'],
            [['물욕 센서','수레 애호가','훈타','수레 단골'], 'quirk'],
            [['선봉장','유리 대포','바람잡이','고독한 사냥꾼','낙관주의','공격 중독','묵직한 손','공중 추적자','넘어진 김에','막타 욕심','복수의 일격','외로운 늑대','끝까지 함께','첫 수는 크게','퇴근 본능'], 'damage-condition'],
            [['신중한 관찰자','돌다리 전문가','박자감각','성급한 손','숨 고르기','생존 우선','민첩한 발'], 'evade'],
            [['철벽주의','몸빵 담당','비관주의','위기관리반','불길한 예감','지상주의자'], 'incoming-hit'],
            [['재정비 전문가','날쌘 보급'], 'item'],
            [['꼬리 사냥꾼','뿔 수집가','부위 개척자','약점 집착'], 'part-damage'],
            [['보급관','폭탄 배달부','응급 배급','분위기 메이커'], 'support-action'],
            [['오늘의 주인공'], 'targeting'],
            [['💩'], 'quirk']
        ];
        return groups.filter(([names]) => names.includes(name)).map(([, hook]) => hook);
    }

    static _affinities(name) {
        const expanded = this.expansionFor(name);
        if (expanded) return expanded.affinities || [];
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
        const expanded = this.expansionFor(name);
        if (expanded) return expanded.description;
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
            '독사': '칼끝의 보랏빛은 승리를 서두르지 않는다.',
            '마비 사냥꾼': '움직임이 멎은 찰나, 사냥은 처형으로 이름을 바꾼다.',
            '잠재우는 손': '고요한 숨결 뒤에는 가장 시끄러운 일격이 기다린다.',
            '폭파광': '대형나무통폭탄을 2개 더 챙기며 폭탄 피해가 50% 증가한다.',
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
            '고속 변형': '도끼와 검의 경계가 흐려질수록 연계는 더 거칠어진다.',
            '결사의 출진': '돌아올 체력까지 불태우고 첫 90초에 모든 것을 건다.',
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
            '새벽의 생존자': '밤이 끝날 때까지 버틴 자만이 아침을 전리품이라 부른다.',
            '선봉장': '첫 발자국은 언제나 가장 깊은 발톱 자국을 부른다.',
            '신중한 관찰자': '늦게 움직이는 눈은 대신 모든 빈틈을 기억한다.',
            '유리 대포': '깨지기 전에 부수면 약점은 존재하지 않는다.',
            '돌다리 전문가': '돌다리도 두드리다 사냥이 끝날 때가 있다.',
            '철벽주의': '공격보다 중요한 것은 오늘도 멀쩡한 방패다.',
            '박자감각': '괴물의 발소리에도 다음 박자는 숨어 있다.',
            '성급한 손': '결론은 칼끝이 내리고 생각은 나중에 따라온다.',
            '숨 고르기': '한 번의 깊은 숨이 세 번의 구르기를 만든다.',
            '바람잡이': '누군가 달리기 시작하면 사냥터 전체가 달린다.',
            '몸빵 담당': '상처의 수는 동료가 살아 있다는 영수증이다.',
            '고독한 사냥꾼': '혼자 선 자리에서 칼날은 가장 솔직해진다.',
            '낙관주의': '이번 공격은 맞을 것이다. 아마도, 분명히.',
            '비관주의': '최악을 기다린 자는 보통 한 발 먼저 구른다.',
            '생존 우선': '승리보다 중요한 것은 승리 화면에 서는 일이다.',
            '공격 중독': '멈춘 칼은 녹슬고 멈춘 헌터는 불안해진다.',
            '재정비 전문가': '잘 싸우는 법보다 다시 싸우는 법을 안다.',
            '날쌘 보급': '마개를 여는 순간 이미 다음 물약을 찾는다.',
            '묵직한 손': '느린 손끝에는 한 번으로 끝낼 무게가 실린다.',
            '민첩한 발': '발이 빠르면 실수도 재빨리 과거가 된다.',
            '위기관리반': '큰일은 막고 작은 일은 보고서에 남긴다.',
            '꼬리 사냥꾼': '시선은 얼굴이 아니라 돌아가는 꼬리를 좇는다.',
            '뿔 수집가': '부러진 뿔 하나가 백 마디 자랑보다 무겁다.',
            '공중 추적자': '하늘은 도망칠 곳이 아니라 더 큰 표적이다.',
            '넘어진 김에': '쓰러진 괴물 앞에서 예의는 칼집에 넣는다.',
            '막타 욕심': '마지막 한 칼의 주인은 기록에도 오래 남는다.',
            '복수의 일격': '방금의 상처가 다음 칼끝의 방향을 정한다.',
            '불길한 예감': '큰일이 오기 전에는 늘 먼저 등이 서늘해진다.',
            '보급관': '가방 속 한 칸은 언제나 동료의 몫이다.',
            '폭탄 배달부': '쓰러진 괴물에게 가장 급한 배송은 화약이다.',
            '응급 배급': '내 몫을 나누는 순간 네 목숨도 내 몫이 된다.',
            '수레 단골': '캠프 가는 길은 이제 눈을 감고도 찾는다.',
            '오늘의 주인공': '괴물도 이상하게 이 얼굴부터 기억한다.',
            '외로운 늑대': '동료와 떨어질수록 자신의 호흡은 선명해진다.',
            '분위기 메이커': '한 번의 멋진 일격이 네 사람의 발을 재촉한다.',
            '끝까지 함께': '빈자리가 늘수록 남은 어깨는 더 가까워진다.',
            '첫 수는 크게': '첫인상은 두 번째 칼질로 고칠 수 없다.',
            '지상주의자': '날아다니는 적 아래에서는 방패가 하늘이 된다.',
            '부위 개척자': '아무도 치지 않은 곳에 첫 균열을 새긴다.',
            '약점 집착': '금이 간 곳은 결국 부서질 때까지 바라본다.',
            '퇴근 본능': '마감이 보이면 사람은 놀랍도록 강해진다.',
            '💩': '아들아... 네가 태어나던 날, 온 세상이 코를...'
        };
        return descriptions[name] || '길드의 기록에서 이 성정에 관한 장은 찢겨 나갔다.';
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntPerkCatalog;
else window.HuntPerkCatalog = HuntPerkCatalog;
