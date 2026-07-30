class HuntJourneyEventCatalog {
    static NON_COMBAT_MONSTER_EVENTS = Object.freeze({
        boaboa: 'boaboa',
        felyne: 'felyne',
        gajalaka: 'gajalaka',
        grimalkyne: 'tetoru',
        melynx: 'melynx',
        unknown_monster: 'mysterious_tracks'
    });

    constructor() { this.definitions = new Map(); }

    register(definition) {
        const rawActions = Array.isArray(definition?.actions) ? definition.actions : [];
        if (!definition?.id || (!rawActions.length && typeof definition.apply !== 'function')) {
            throw new Error('Journey event requires id and actions');
        }
        if (rawActions.length > 3) throw new Error(`Journey event exposes more than three actions: ${definition.id}`);
        const actionIds = rawActions.map(action => String(action?.id || ''));
        if (actionIds.some(id => !id) || new Set(actionIds).size !== actionIds.length) {
            throw new Error(`Journey event action IDs must be non-empty and unique: ${definition.id}`);
        }
        if (rawActions.some(action => typeof action?.apply !== 'function' && typeof definition.apply !== 'function')) {
            throw new Error(`Journey event action is not executable: ${definition.id}`);
        }
        if (rawActions.some(action => !String(action?.label || '').trim() || !String(action?.description || '').trim())) {
            throw new Error(`Journey event actions require visible labels and consequences: ${definition.id}`);
        }
        const actions = rawActions.map(action => Object.freeze({
            id: String(action.id), icon: action.icon || '🎲', label: action.label || String(action.id),
            description: action.description || '', price: Math.max(0, Number(action.price || 0)),
            apply: action.apply || definition.apply
        }));
        const defaultActionId = definition.defaultActionId == null ? null : String(definition.defaultActionId);
        if (defaultActionId && !actions.some(action => action.id === defaultActionId)) {
            throw new Error(`Unknown default journey action: ${definition.id}:${defaultActionId}`);
        }
        this.definitions.set(String(definition.id), Object.freeze({
            id: String(definition.id), icon: definition.icon || '❔', label: definition.label || String(definition.id),
            narrative: definition.narrative || '', scope: definition.scope === 'party' ? 'party' : 'individual',
            actions: Object.freeze(actions), defaultActionId, apply: definition.apply || actions[0]?.apply
        }));
        return this;
    }

    get(id) { return this.definitions.get(String(id || '')) || null; }
    ids() { return [...this.definitions.keys()]; }

    static createDefault() {
        const Economy = typeof HuntJourneyEconomy !== 'undefined'
            ? HuntJourneyEconomy
            : require('./HuntJourneyEconomy');
        const heal = (result, indexes, ratio) => indexes.forEach(index => {
            const member = result.party[index];
            if (member) member.hp = Math.min(member.maxHp, member.hp + Math.ceil(member.maxHp * ratio));
        });
        return new HuntJourneyEventCatalog()
            .register({ id: 'smithy', icon: '🔨', label: '대장간', scope: 'party', defaultActionId: 'maintenance',
                narrative: '불꽃과 망치 소리 사이에서 장인이 오늘 한 번만 손을 봐주겠다고 한다.',
                actions: [
                    { id: 'temper', icon: '🔥', label: '담금질', description: '💰1 · 파티 리롤 +1', price: 1,
                        apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'reroll', 1, action.price); } },
                    { id: 'maintenance', icon: '🛠️', label: '야전 정비', description: '전원 체력 20% 회복',
                        apply(result, indexes) { heal(result, indexes, .2); } },
                    { id: 'haggle', icon: '🎲', label: '수상한 흥정', description: '코인 +1 · 전원 체력 5% 손실',
                        apply(result, indexes) { Economy.earn(result, 1); indexes.forEach(i => { const m = result.party[i]; if (m) m.hp = Math.max(1, m.hp - Math.ceil(m.maxHp * .05)); }); } }
                ] })
            .register({ id: 'gather', icon: '🌿', label: '채집지', scope: 'individual', defaultActionId: 'safe',
                narrative: '안전한 길과 빛이 닿지 않는 깊은 군락이 갈라진다.',
                actions: [
                    { id: 'safe', icon: '🌿', label: '안전 채집', description: '코인 +1 · 물약 +1', apply(result, indexes) { Economy.gather(result, indexes, false); } },
                    { id: 'mushroom', icon: '🍄', label: '버섯 군락', description: '체력 15% · 공용 물약 +1', apply(result, indexes) { heal(result, indexes, .15); const stock = Economy.stock(result); stock.potions = Math.min(10, stock.potions + 1); } },
                    { id: 'deep', icon: '⛏️', label: '깊은 채집', description: '코인 +2 · 난입 가능', apply(result, indexes) { Economy.gather(result, indexes, true); } }
                ] })
            .register({ id: 'trader', icon: '🛒', label: '행상인', scope: 'individual', defaultActionId: 'leave',
                narrative: '짐수레의 천막 아래에 회복품과 사냥 도구가 빼곡하다.',
                actions: [
                    { id: 'powder', icon: '💚', label: '회복가루', description: '💰2 · 가루 +1', price: 2, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'lifepowder', 1, action.price); } },
                    { id: 'bomb', icon: '💣', label: '큰통폭탄', description: '💰1 · 폭탄 +1', price: 1, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'bomb', 1, action.price); } },
                    { id: 'leave', icon: '🚶', label: '구경만 한다', description: '소모 없음', apply() {} }
                ] })
            .register({ id: 'camp', icon: '⛺', label: '낡은 야영지', scope: 'individual', defaultActionId: 'rest',
                narrative: '불씨는 살아 있지만 식량 자루에는 정체 모를 발자국이 남아 있다.',
                actions: [
                    { id: 'rest', icon: '💤', label: '휴식', description: '체력 30% 회복', apply(result, indexes) { heal(result, indexes, .3); } },
                    { id: 'search', icon: '🔎', label: '보급품 수색', description: '공용 물약 +2', apply(result) { const stock = Economy.stock(result); stock.potions = Math.min(10, stock.potions + 2); } }
                ] })
            .register({ id: 'felyne', icon: '🐱', label: '아이루 상점', scope: 'individual', defaultActionId: null,
                narrative: '아이루 상인이 계산판을 두드리며 꼬리로 상품을 가리킨다.',
                actions: [
                    { id: 'potion', icon: '🧪', label: '물약', description: '💰1 · 물약 +1', price: 1, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'potion', 1, action.price); } },
                    { id: 'powder', icon: '💚', label: '회복가루', description: '💰2 · 가루 +1', price: 2, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'lifepowder', 1, action.price); } },
                    { id: 'bomb', icon: '💣', label: '폭탄', description: '💰1 · 폭탄 +1', price: 1, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'bomb', 1, action.price); } }
                ] })
            .register({ id: 'risky_gather', icon: '⛏️', label: '수상한 광맥', scope: 'party', defaultActionId: 'edge',
                narrative: '광맥 안쪽에서 돌이 아닌 무언가가 숨 쉬는 소리가 들린다.',
                actions: [
                    { id: 'edge', icon: '🪨', label: '입구만 캔다', description: '코인 +1', apply(result, indexes) { Economy.earn(result, 1); } },
                    { id: 'deep', icon: '💎', label: '끝까지 들어간다', description: '코인 +2 · 난입 가능', apply(result, indexes) { Economy.gather(result, indexes, true); } }
                ] })
            .register({ id: 'tetoru', icon: '🐾', label: '테토루 부족', scope: 'individual', defaultActionId: 'lesson',
                narrative: '테토루들이 덫의 구조를 보여주며 교환할 물건을 기다린다.',
                actions: [
                    { id: 'trap', icon: '⚡', label: '마비함정', description: '💰2 · 함정 +1', price: 2, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'shockTrap', 1, action.price); } },
                    { id: 'lesson', icon: '📜', label: '사냥술 배우기', description: '체력 10% 회복', apply(result, indexes) { heal(result, indexes, .1); } }
                ] })
            .register({ id: 'boaboa', icon: '❄️', label: '보와보와 마을', scope: 'party', defaultActionId: null,
                narrative: '차가운 마을의 연회가 시작되고, 족장이 사냥의 대가를 묻는다.',
                actions: [
                    { id: 'feast', icon: '🍲', label: '연회 참가', description: '💰1 · 전원 체력 25%', price: 1, apply(result, indexes) { if (Economy.spend(result, 1)) heal(result, indexes, .25); } },
                    { id: 'powder', icon: '💚', label: '가루 교환', description: '💰2 · 전원 가루 +1', price: 2, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'lifepowder', 1, action.price); } }
                ] })
            .register({ id: 'gajalaka', icon: '🔥', label: '가자부 소굴', scope: 'party', defaultActionId: null,
                narrative: '가자부들이 폭약 더미 앞에서 춤추며 위험한 내기를 제안한다.',
                actions: [
                    { id: 'bombs', icon: '💣', label: '폭약 거래', description: '💰1 · 전원 폭탄 +2', price: 1, apply(result, indexes, { action }) { return Economy.buy(result, indexes, 'bomb', 2, action.price); } },
                    { id: 'gamble', icon: '🎲', label: '불꽃 내기', description: '코인 +2 · 체력 10% 손실', apply(result, indexes) { Economy.earn(result, 2); indexes.forEach(i => { const m = result.party[i]; if (m) m.hp = Math.max(1, m.hp - Math.ceil(m.maxHp * .1)); }); } }
                ] })
            .register({ id: 'melynx', icon: '🐈‍⬛', label: '메라루 암시장', scope: 'individual', defaultActionId: 'watch',
                narrative: '메라루가 훔친 물건을 펼쳐 놓고는 동전 주머니에서 눈을 떼지 않는다.',
                actions: [
                    { id: 'trade', icon: '🎒', label: '비밀 거래', description: '💰1 · 물약 +1 · 폭탄 +1', price: 1,
                        apply(result, indexes) {
                            if (!Economy.spend(result, 1)) return;
                            const stock = Economy.stock(result);
                            stock.potions = Math.min(10, stock.potions + 1);
                            stock.bombs += 1;
                        } },
                    { id: 'chase', icon: '💨', label: '도둑을 쫓는다', description: '코인 +1 · 체력 5% 손실',
                        apply(result, indexes) {
                            Economy.earn(result, 1);
                            indexes.forEach(index => {
                                const member = result.party[index];
                                if (member) member.hp = Math.max(1, member.hp - Math.ceil(member.maxHp * .05));
                            });
                        } },
                    { id: 'watch', icon: '👀', label: '지켜본다', description: '소모 없음', apply() {} }
                ] })
            .register({ id: 'mysterious_tracks', icon: '❓', label: '정체불명의 흔적', scope: 'party', defaultActionId: 'mark',
                narrative: '도감에도 없는 발자국과 비늘이 길을 가로지르고 숲 안쪽에서 시선이 느껴진다.',
                actions: [
                    { id: 'follow', icon: '🔎', label: '흔적을 추적', description: '코인 +2 · 난입 가능',
                        apply(result) {
                            Economy.earn(result, 2);
                            result.ambushHook = { chance: .35, source: 'mysterious-tracks' };
                        } },
                    { id: 'mark', icon: '🗺️', label: '지도에 기록', description: '전원 체력 10% 회복',
                        apply(result, indexes) { heal(result, indexes, .1); } }
                ] });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyEventCatalog;
else globalThis.HuntJourneyEventCatalog = HuntJourneyEventCatalog;
