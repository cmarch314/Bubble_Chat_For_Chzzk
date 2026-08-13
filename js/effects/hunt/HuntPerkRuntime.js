class HuntPerkRuntime {
    static CAMP_STAY_TICKS = Object.freeze({
        guardian: 320,
        lost: 100
    });
    static SUPPORTED_EFFECT_TYPES = Object.freeze([
        'damage','part','stun','sharpness-save','ammo-save','guts','status',
        'item-save','potion-share','camp-delay','periodic-supply','incoming',
        'combat-gather','heal-variance','target-weight','cart-recovery',
        'action-duration','item-duration','whetstone-duration','buff-duration',
        'heal-rate','status-all','bomb-damage','camp-rate','max-hp','ai'
    ]);
    static SUPPORTED_EVENTS = Object.freeze([
        'battle-start','dodge','guard','perfect-guard','critical','strong-hit',
        'heavy-hit','miss','part-break','tail-carve','gather','whetstone','cart',
        'blast-proc','low-hp-empty-potion','item-empty:flashes','roar-recover',
        'tremor-recover','wind-recover','ailment-recover'
    ]);

    constructor(engine) { this.engine = engine; }

    static personalityProfiles() {
        if (typeof HuntPersonalityProfiles !== 'undefined') return HuntPersonalityProfiles;
        if (typeof require === 'function') return require('./HuntPersonalityProfiles.js');
        return null;
    }

    static names(hunter) {
        if (!hunter) return new Set();
        // Perk arrays are reassigned (never mutated in place), so memoize the name
        // Set by array identity: rebuilt only when hunter.perks is swapped, not on
        // every per-hit damage/stun/sharpness lookup or tick.
        const perks = hunter.perks || null;
        if (hunter._perkNamesSource !== perks) {
            hunter._perkNamesSource = perks;
            hunter._perkNames = new Set((perks || []).map(perk => perk.name === '똥' ? '💩' : perk.name));
        }
        return hunter._perkNames;
    }
    static has(hunter, name) { return this.names(hunter).has(name); }

    static catalog() {
        if (typeof HuntPerkCatalog !== 'undefined') return HuntPerkCatalog;
        if (typeof require === 'function') return require('./HuntPerkCatalog.js');
        return null;
    }

    static synergyCatalog() {
        if (typeof HuntPerkSynergyCatalog !== 'undefined') return HuntPerkSynergyCatalog;
        if (typeof require === 'function') return require('./HuntPerkSynergyCatalog.js');
        return null;
    }

    expansionEffects(hunter, type = null) {
        const perks = hunter?.perks || null;
        if (hunter?._expandedPerkSource !== perks) {
            hunter._expandedPerkSource = perks;
            const catalog = HuntPerkRuntime.catalog();
            const perkEffects = (perks || []).flatMap(perk => {
                const def = catalog?.expansionFor?.(perk?.name);
                return (def?.effects || []).map((effect, index) => ({ ...effect, perkName: def.name, effectIndex: index }));
            });
            const synergyEffects = (HuntPerkRuntime.synergyCatalog()?.active?.(perks) || []).flatMap(recipe =>
                (recipe.bonus?.effects || []).map((effect, index) => ({
                    ...effect,
                    perkName: `${recipe.icon} ${recipe.label}`,
                    synergyId: recipe.id,
                    effectIndex: index
                }))
            );
            hunter._activePerkSynergies = HuntPerkRuntime.synergyCatalog()?.active?.(perks) || [];
            hunter._expandedPerkEffects = [...perkEffects, ...synergyEffects];
        }
        const effects = hunter?._expandedPerkEffects || [];
        return type ? effects.filter(effect => effect.type === type) : effects;
    }

    _survivors() {
        return (this.engine.selectedWeapons || []).filter(ally => ally.status === 'alive' && !ally.isAtCamp);
    }

    _hasItems(hunter) {
        return ['potions','lifepowders','shockTraps','flashPods','bombs'].some(key => Number(hunter?.[key] || 0) > 0);
    }

    _condition(hunter, when) {
        if (!when) return true;
        const engine = this.engine;
        const hpRate = Number(hunter?.hp || 0) / Math.max(1, Number(hunter?.maxHp || 1));
        const allies = this._survivors().filter(ally => ally !== hunter);
        const airborne = engine.monsterFlightState === 'airborne' || engine.monsterState === 'valstrax_flying';
        const partBroken = (engine.monsterPartState || []).some(part => part.broken || part.severed);
        const specialMonster = airborne || engine.monsterState === 'enraged'
            || Number(engine.monsterKnockdownDuration || 0) > 0 || Number(engine.monsterStunDuration || 0) > 0;
        const cases = {
            'part-broken': partBroken,
            airborne,
            'monster-low': Number(engine.monsterHp || 0) <= Number(engine.monsterMaxHp || 1) * .2,
            'low-hp': hpRate <= .35,
            'critical-hp': hpRate <= .2,
            'not-full-hp': hpRate < .999,
            ailmented: Boolean(hunter?.blight?.type || hunter?.statusEffect || hunter?.statusAilment || hunter?.poisonTicks || hunter?.burnTicks),
            'ally-low': allies.some(ally => Number(ally.hp || 0) <= Number(ally.maxHp || 1) * .35),
            'first-hit': !hunter?._expandedFirstHitDone,
            'monster-sleeping': engine.monsterState === 'sleeping',
            opening: Number(engine.battleTime || 0) <= 300,
            'first-hit-taken': !hunter?._expandedFirstHitTaken,
            'has-items': this._hasItems(hunter),
            'no-items': !this._hasItems(hunter),
            'few-survivors': this._survivors().length <= 2,
            'monster-special': specialMonster
            , 'always': true
            , 'full-hp': hpRate >= .999
            , 'enraged': engine.monsterState === 'enraged'
            , 'monster-downed': Number(engine.monsterKnockdownDuration || 0) > 0
                || ['knocked_down','stunned','paralyzed','sleeping'].includes(engine.monsterState)
            , 'demon-mode': Boolean(hunter?.demonMode || Number(hunter?.demonModeDuration || 0) > 0)
        };
        return Boolean(cases[when]);
    }

    _actionMatches(hunter, effect, action = {}) {
        if (effect.weapon && hunter?.id !== effect.weapon) return false;
        if (effect.when && !this._condition(hunter, effect.when)) return false;
        const tags = new Set(action?.tags || []);
        if (effect.tag && !tags.has(effect.tag)) return false;
        if (effect.idPattern && !(new RegExp(effect.idPattern)).test(String(action?.id || ''))) return false;
        return true;
    }

    _buff(hunter, effect) {
        if (!hunter._expandedPerkBuffs) hunter._expandedPerkBuffs = {};
        const key = `${effect.perkName}:${effect.buff}`;
        const prior = hunter._expandedPerkBuffs[key] || { stacks: 0 };
        const stacks = Math.min(Number(effect.stacks || 1), Number(prior.stacks || 0) + 1);
        hunter._expandedPerkBuffs[key] = {
            kind: effect.buff,
            value: Number(effect.value || 0),
            ticks: effect.permanent ? Number.POSITIVE_INFINITY : Number(effect.ticks || 1),
            stacks
        };
    }

    _eventUsed(hunter, effect, event) {
        if (!effect.once) return false;
        if (!hunter._expandedPerkOnce) hunter._expandedPerkOnce = new Set();
        const key = `${effect.perkName}:${effect.effectIndex}:${event}`;
        if (hunter._expandedPerkOnce.has(key)) return true;
        hunter._expandedPerkOnce.add(key);
        return false;
    }

    trigger(hunter, event, context = {}) {
        if (!hunter) return;
        const effects = this.expansionEffects(hunter).filter(effect => effect.on === event
            && this._actionMatches(hunter, effect, context.action || {}));
        effects.forEach(effect => {
            if (this._eventUsed(hunter, effect, event)) return;
            if (effect.chance != null && this.engine.random() >= Number(effect.chance)) return;
            if (effect.buff) this._buff(hunter, effect);
            if (effect.atb) hunter.atb = Math.min(100, Number(hunter.atb || 0) + Number(effect.atb));
            if (effect.ammo) hunter.ammo = Math.min(Number(hunter.maxAmmo || 99), Number(hunter.ammo || 0) + Number(effect.ammo));
            if (effect.heal) hunter.hp = Math.min(hunter.maxHp, hunter.hp + Math.max(1, Math.round(hunter.maxHp * Number(effect.heal))));
            if (effect.selfDamage) hunter.hp = Math.max(1, hunter.hp - Math.round(hunter.maxHp * Number(effect.selfDamage)));
            if (effect.teamAtb) this._survivors().forEach(ally => { ally.atb = Math.min(100, Number(ally.atb || 0) + Number(effect.teamAtb)); });
            if (effect.teamHeal) this._survivors().forEach(ally => { ally.hp = Math.min(ally.maxHp, ally.hp + Math.round(ally.maxHp * Number(effect.teamHeal))); });
            if (effect.teamMaxHp) this._survivors().forEach(ally => { ally.maxHp += Number(effect.teamMaxHp); ally.hp += Number(effect.teamMaxHp); });
            if (effect.item && Number(effect.amount || 0) > 0) {
                const itemKey = { traps: 'shockTraps', flashes: 'flashPods' }[effect.item] || effect.item;
                hunter[itemKey] = Math.max(0, Number(hunter[itemKey] || 0) + Number(effect.amount));
                this.engine.updateHunterItemUI?.(hunter);
            }
            if (effect.randomItem) {
                const candidates = ['potions','lifepowders','bombs'];
                const key = candidates[Math.floor(this.engine.random() * candidates.length)];
                hunter[key] = Number(hunter[key] || 0) + Number(effect.amount || 1);
            }
            if (effect.counter) {
                if (!hunter._expandedPerkCounters) hunter._expandedPerkCounters = {};
                const count = Number(hunter._expandedPerkCounters[effect.counter] || 0) + 1;
                hunter._expandedPerkCounters[effect.counter] = count;
                if (count >= Number(effect.threshold || 1)) {
                    hunter._expandedPerkCounters[effect.counter] = 0;
                    if (effect.grant === 'sure-hit') hunter.perkSureHit = true;
                }
            }
            if (effect.monsterBuild === 'blast') this.engine.monsterBlastBuild = Number(this.engine.monsterBlastBuild || 0) + Number(effect.value || 0);
            if (effect.buff === 'cart-learning') hunter.perkCartLearning = Math.min(3, Number(hunter.perkCartLearning || 0) + 1);
        });
        this.engine.updateHpUI?.(hunter);
        this.engine.updateWeaponAtbUI?.(hunter.index, hunter.atb);
    }

    _buffValue(hunter, kind, fallback) {
        const buffs = Object.values(hunter?._expandedPerkBuffs || {}).filter(buff => buff.kind === kind && Number(buff.ticks || 0) > 0);
        if (!buffs.length) return fallback;
        if (kind === 'critical' || kind === 'evade') return buffs.reduce((sum, buff) => sum + buff.value * buff.stacks, fallback);
        return buffs.reduce((rate, buff) => rate * Math.pow(buff.value, buff.stacks), fallback);
    }

    hitChance(hunter, baseChance) {
        if (hunter?.perkSureHit) { hunter.perkSureHit = false; return 1; }
        return Math.min(.99, Number(baseChance || 0));
    }

    initialize(hunter) {
        const names = HuntPerkRuntime.names(hunter);
        hunter._expandedPerkOnce = new Set();
        hunter._expandedPerkBuffs = {};
        hunter._expandedPerkCounters = {};
        hunter._expandedGutsUsed = false;
        hunter.expandedCombatGathered = false;
        hunter.perkSureHit = false;
        hunter.perkCartLearning = 0;
        if (names.has('체력 증강')) { hunter.maxHp += 20; hunter.hp += 20; }
        this.expansionEffects(hunter, 'max-hp').forEach(effect => {
            hunter.maxHp += Number(effect.value || 0);
            hunter.hp += Number(effect.value || 0);
        });
        if (names.has('장인') && hunter.sharpnessProfile) {
            const bonus = Math.max(1, Math.round(Number(hunter.maxSharpness || 0) * .2));
            hunter.maxSharpness += bonus;
            hunter.sharpness += bonus;
            hunter.sharpnessHandicraftBonus = bonus;
        } else if (names.has('장인') && !['bow', 'light_bowgun', 'heavy_bowgun'].includes(hunter.id)) {
            // Legacy/test hunters without an extracted instance retain the old scale.
            hunter.sharpness = hunter.maxSharpness = 120;
        }
        if (names.has('포탄 장전')) {
            hunter.ammo = Math.max(Number(hunter.ammo || 0), 7);
            if (hunter.id === 'gunlance') hunter.shells = hunter.maxShells = Math.max(7, Number(hunter.maxShells || 0));
        }
        if (names.has('캠프 수호자') || names.has('길치')) {
            hunter.perkCampTicks = names.has('캠프 수호자')
                ? HuntPerkRuntime.CAMP_STAY_TICKS.guardian
                : HuntPerkRuntime.CAMP_STAY_TICKS.lost;
            hunter.isAtCamp = true;
            hunter.campReason = names.has('캠프 수호자') ? '보급품을 끝까지 챙기는 중' : '출발 길을 잘못 든 상태';
            hunter.atb = 0;
        }
        if (names.has('결사의 출진')) {
            hunter.hp = Math.max(1, Math.floor(hunter.maxHp * .70));
            hunter.atb = 100;
            hunter.desperateSortieTicks = 900;
        }
        // Issued item bonuses are aggregated before battle by
        // HuntPersonalityProfiles/HuntIssuedSupplyRuntime. Never add them again here.
        hunter.heroInspirationCooldown = 0;
        hunter.dawnSurvivorCooldown = 0;
        if (names.has('첫 수는 크게')) hunter.firstStrikeReady = true;
        hunter._expandedFirstHitDone = false;
        hunter._expandedFirstHitTaken = false;
        const campEffect = this.expansionEffects(hunter, 'camp-delay')[0];
        if (campEffect) {
            hunter.perkCampTicks = Number(campEffect.ticks || 0);
            hunter.isAtCamp = true;
            hunter.campReason = campEffect.reason === '늦잠' ? '출발 신호를 못 듣고 늦잠 자는 중' : '캠프 생활을 만끽하는 중';
            hunter.atb = 0;
            hunter._expandedCampReturn = campEffect;
        }
        const campRate = this.expansionEffects(hunter, 'camp-rate')
            .reduce((rate, effect) => rate * Number(effect.value || 1), 1);
        if (hunter.isAtCamp && campRate !== 1) hunter.perkCampTicks = Math.max(1, Math.ceil(Number(hunter.perkCampTicks || 1) * campRate));
        this.trigger(hunter, 'battle-start');
    }

    tick(hunter) {
        this.tickGlobal();
        ['coalescenceTicks','resentmentTicks','offensiveGuardTicks','desperateSortieTicks',
            'heroInspirationCooldown','dawnSurvivorCooldown'].forEach(key => {
            if (Number(hunter?.[key] || 0) > 0) hunter[key]--;
        });
        Object.values(hunter?._expandedPerkBuffs || {}).forEach(buff => {
            if (Number.isFinite(buff.ticks) && buff.ticks > 0) buff.ticks--;
        });
        this.expansionEffects(hunter, 'periodic-supply').forEach(effect => {
            if (Number(this.engine.battleTime || 0) < Number(effect.tick || 0)) return;
            if (this._eventUsed(hunter, effect, 'periodic-supply')) return;
            const item = ['potions','lifepowders','bombs'].sort((a, b) => Number(hunter[a] || 0) - Number(hunter[b] || 0))[0];
            hunter[item] = Number(hunter[item] || 0) + 1;
            this.engine.updateHunterItemUI?.(hunter);
            this.engine.showSkillBubble?.(hunter.index, '🧺 현장 조달');
        });
        if (Number(hunter?.potions || 0) <= 0 && Number(hunter?.hp || 0) <= Number(hunter?.maxHp || 1) * .35) {
            this.trigger(hunter, 'low-hp-empty-potion');
        }
        if (Number(this.engine.battleTime || 0) % 3 === 0) {
            const names = HuntPerkRuntime.names(hunter);
            if (names.has('강화 지속')) ['melodyBuffTicks','hornAttackBuffTicks','hornDefenseBuffTicks','hornSpeedBuffTicks','shieldChargeDuration','extractDuration'].forEach(key => {
                if (Number(hunter[key] || 0) > 0) hunter[key]++;
            });
            if (names.has('선율 강박')) ['melodyBuffTicks','hornAttackBuffTicks','hornDefenseBuffTicks','hornSpeedBuffTicks'].forEach(key => {
                if (Number(hunter[key] || 0) > 0) hunter[key]++;
            });
            if (names.has('삼색 탐닉') && Number(hunter.extractDuration || 0) > 0) hunter.extractDuration++;
            if (names.has('귀인화 체질') && hunter.demonMode) hunter.archdemonGauge = Math.min(100, Number(hunter.archdemonGauge || 0) + .16);
        }
        if (!hunter?.isAtCamp) return;
        hunter.atb = 0;
        hunter.perkCampTicks = Math.max(0, Number(hunter.perkCampTicks || 0) - 1);
        if (hunter.perkCampTicks > 0) return;
        hunter.isAtCamp = false;
        const campGuardian = HuntPerkRuntime.has(hunter, '캠프 수호자') || HuntPerkRuntime.has(hunter, '캠프 러버');
        if (campGuardian) {
            hunter.hp = hunter.maxHp;
            hunter.sharpness = Math.max(Number(hunter.sharpness || 0), Number(hunter.maxSharpness || 100));
        }
        const returnEffect = hunter._expandedCampReturn;
        hunter.atb = Number(returnEffect?.returnAtb || 70);
        if (returnEffect?.returnBuff) this._buff(hunter, {
            perkName: returnEffect.perkName,
            buff: 'attack',
            value: returnEffect.returnBuff,
            ticks: 100
        });
        hunter._expandedCampReturn = null;
        this.engine.addLog(campGuardian
            ? `⛺ [캠프 합류] ${hunter.hunterName}이(가) 캠프에서 보급을 마치고 뒤늦게 전장에 합류했습니다!`
            : HuntPerkRuntime.has(hunter, '늦잠꾸러기')
                ? `💤 [늦잠 합류] ${hunter.hunterName}이(가) 벌떡 일어나 ATB를 가득 채우고 뛰어왔습니다!`
                : `🧭 [길치 합류] ${hunter.hunterName}이(가) 잘못 든 길에서 돌아와 뒤늦게 전장에 합류했습니다!`, '#62f59c');
        this.engine.updateHpUI(hunter);
        this.engine.updateWeaponAtbUI(hunter.index, hunter.atb);
        this.engine.updatePotionCountUI(hunter.index, hunter.potions);
        this.engine.showSkillBubble(hunter.index, campGuardian ? '⛺ 캠프 보급 완료' : '🧭 겨우 도착');
    }

    canAct(hunter) { return !hunter?.isAtCamp; }
    isTargetable(hunter) { return !hunter?.isAtCamp; }

    targetWeight(hunter) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('도발')) return 4;
        if (names.has('은신')) return .25;
        if (names.has('오늘의 주인공')) return 2.2;
        const expanded = this.expansionEffects(hunter, 'target-weight')
            .find(effect => this._condition(hunter, effect.when));
        if (expanded) return Number(expanded.value || 1);
        return 1;
    }

    aiBias(hunter, action) {
        const names = HuntPerkRuntime.names(hunter);
        let value = this.expansionEffects(hunter, 'ai')
            .filter(effect => effect.action === action)
            .reduce((sum, effect) => sum + Number(effect.value || 0), 0);
        if (names.has('우애') && action === 'powder') value += .25;
        if (names.has('만족할 줄 모름')) {
            if (['powder','flash','trap','bomb'].includes(action)) value += .10;
            if (action === 'potion-threshold') value += .08;
        }
        return value;
    }

    atbRecoveryMultiplier(hunter) {
        if (!HuntPerkRuntime.has(hunter, '집중 포화')) return 1;
        const downed = Number(this.engine.monsterKnockdownDuration || 0) > 0
            || Number(this.engine.monsterStunDuration || 0) > 0
            || ['knocked_down','stunned','paralyzed','sleeping'].includes(this.engine.monsterState);
        return downed ? 3 : 1;
    }

    canReceiveTeamHealing(hunter, source = null) {
        return hunter === source || !HuntPerkRuntime.has(hunter, '고독한 사냥꾼');
    }

    hasSynergy(hunter, id) {
        this.expansionEffects(hunter);
        return (hunter?._activePerkSynergies || []).some(recipe => recipe.id === id);
    }

    partTargetWeight(hunter, part) {
        if (!hunter || !part) return 1;
        let rate = 1;
        if (this.hasSynergy(hunter, 'part-break') && (part.breakable || part.severable) && !part.broken) rate *= 1.35;
        if (this.hasSynergy(hunter, 'break-momentum') && Number(part.damageAccumulated || 0) <= 0) rate *= 1.45;
        if (this.hasSynergy(hunter, 'anti-air-breaker') && /wing/.test(String(part.kind || ''))
            && (this.engine.monsterFlightState === 'airborne' || this.engine.monsterState === 'valstrax_flying')) rate *= 1.6;
        if (HuntPerkRuntime.has(hunter, '날개 꺾기') && /wing/.test(String(part.kind || ''))) rate *= 1.6;
        return rate;
    }

    actionDuration(hunter, action, ticks) {
        const names = HuntPerkRuntime.names(hunter);
        const id = String(action?.id || '');
        const tags = new Set(action?.tags || []);
        let rate = 1;
        if (names.has('집중') && (tags.has('charge') || tags.has('preparation') || /charge|draw/.test(id))) rate *= .72;
        if (names.has('납도술') && /sheathe|draw/.test(id)) rate *= .65;
        if (names.has('고속 변형') && /morph|change|switch/.test(id)) rate *= .7;
        this.expansionEffects(hunter, 'action-duration').forEach(effect => {
            if (this._actionMatches(hunter, effect, action)) rate *= Number(effect.value || 1);
        });
        return Math.max(1, Math.ceil(Number(ticks || 1) * rate));
    }

    whetstoneDuration(hunter, ticks) {
        let rate = HuntPerkRuntime.has(hunter, '숫돌 사용 고속화') ? .4 : 1;
        this.expansionEffects(hunter, 'whetstone-duration').forEach(effect => { rate *= Number(effect.value || 1); });
        return Math.max(1, Math.ceil(ticks * rate));
    }

    buffDuration(hunter, ticks) {
        const names = HuntPerkRuntime.names(hunter);
        let rate = names.has('강화 지속') ? 1.35 : 1;
        this.expansionEffects(hunter, 'buff-duration').forEach(effect => { rate *= Number(effect.value || 1); });
        return Math.ceil(ticks * rate);
    }

    outgoingDamage(hunter, action, damage) {
        const names = HuntPerkRuntime.names(hunter);
        let value = Number(damage || 0)
            * (HuntPerkRuntime.personalityProfiles()?.outgoingDamageMultiplier(hunter, this.engine) || 1);
        const tags = new Set(action?.tags || []);
        const id = String(action?.id || '');
        if (names.has('완전 충전') && hunter.hp >= hunter.maxHp) value *= 1.12;
        if (names.has('역전') && hunter.hp <= hunter.maxHp * .5) value *= 1.12;
        if (names.has('도전자')) value *= this.engine.monsterState === 'enraged' ? 1.14 : .95;
        if (names.has('재난대처능력') && hunter.hp <= hunter.maxHp * .35) value *= 1.28;
        if (names.has('전화위복') && Number(hunter.coalescenceTicks || 0) > 0) value *= 1.18;
        if (names.has('앙심') && Number(hunter.resentmentTicks || 0) > 0) value *= 1.16;
        if (names.has('공세적 방어') && Number(hunter.offensiveGuardTicks || 0) > 0) value *= 1.2;
        if (names.has('불굴')) value *= 1.04 + Math.min(.20, Number(hunter.cartCount || 0) * .10);
        if (names.has('심안') && hunter.sharpness <= 30) value *= 1.7;
        if (names.has('임기응변') && this.engine.pendingMonsterAction) value *= 1.12;
        const weaponAffinity = Math.max(0, Number(hunter.weaponInstance?.affinity ?? hunter.affinity ?? 0)) / 100;
        const personalityAffinity = HuntPerkRuntime.personalityProfiles()?.chance(hunter, 'critical')
            ?? Number(hunter.perkModifiers?.critChance || (names.has('💩') ? .1 : 0));
        const affinity = Math.min(.95, weaponAffinity + personalityAffinity
            + (names.has('간파') ? .18 : 0)
            + this._buffValue(hunter, 'critical', 0));
        const criticalHit = affinity > 0 && this.engine.random() < affinity;
        hunter.lastAttackCritical = criticalHit;
        if (criticalHit) value *= names.has('슈퍼회심') ? 1.4 : 1.25;
        if (names.has('한 대만')) {
            const decisive = tags.has('finisher') || tags.has('strong') || tags.has('charge-release')
                || Number(action?.motionValue || 0) >= 80;
            value *= decisive ? 1.35 : .90;
        }
        if (names.has('훈타') && this.engine.random() < .12) value = 0;
        if (names.has('발도술') && !hunter.lastActionId) value *= 1.2;
        if (names.has('포술') && (tags.has('explosive') || /shell|wyvern|discharge/.test(id))) value *= 1.14;
        if (names.has('특수 사격 강화') && /special|wyvern|dragon_piercer/.test(id)) value *= 1.13;
        if (names.has('통상탄 강화') && /normal|charged_shot/.test(id)) value *= 1.1;
        if (names.has('관통탄 강화') && /pierce/.test(id)) value *= 1.1;
        if (names.has('산탄 강화') && /spread|volley/.test(id)) value *= 1.1;
        if (names.has('용화살 신봉') && /dragon_piercer/.test(id)) value *= 1.18;
        if (names.has('귀인화 체질') && hunter.id === 'dual_blades' && hunter.demonModeDuration > 0) value *= 1.12;
        if (names.has('영거리 집착') && hunter.id === 'switch_axe' && /zero_sum/.test(id)) value *= 1.18;
        if (names.has('삼색 탐닉') && hunter.id === 'insect_glaive' && hunter.extractDuration > 0) value *= 1.12;
        if (names.has('포격 낭만') && hunter.id === 'gunlance' && /shell|burst|wyvern/.test(id)) value *= 1.16;
        if (names.has('병 수집벽') && hunter.id === 'charge_blade' && /discharge|saed|aed/.test(id)) value *= 1.14;
        if (names.has('특수납도 중독') && hunter.id === 'long_sword' && /iai|sheathe/.test(id)) value *= 1.13;
        if (names.has('선율 강박') && hunter.id === 'hunting_horn' && /recital|melody/.test(id)) value *= 1.12;
        const airborne = this.engine.monsterFlightState === 'airborne' || this.engine.monsterState === 'valstrax_flying';
        if (names.has('공중 추적자') && airborne) value *= 1.2;
        if (names.has('넘어진 김에') && Number(this.engine.monsterKnockdownDuration || 0) > 0) value *= 1.18;
        if (names.has('막타 욕심') && this.engine.monsterHp <= this.engine.monsterMaxHp * .2) value *= 1.22;
        if (names.has('복수의 일격') && hunter.revengeReady) { value *= 1.2; hunter.revengeReady = false; }
        if (names.has('외로운 늑대')) {
            const activeAllies = (this.engine.selectedWeapons || []).filter(ally => ally !== hunter && ally.status === 'alive' && !ally.isAtCamp).length;
            if (activeAllies <= 1) value *= 1.15;
        }
        if (names.has('끝까지 함께')) {
            const survivors = (this.engine.selectedWeapons || []).filter(ally => ally.status === 'alive').length;
            if (survivors <= 2) value *= 1.18;
        }
        if (names.has('첫 수는 크게') && hunter.firstStrikeReady) { value *= 1.25; hunter.firstStrikeReady = false; }
        if (names.has('퇴근 본능') && this.engine.getRemainingSeconds?.() <= 60) value *= 1.2;
        if (names.has('결사의 출진') && Number(hunter.desperateSortieTicks || 0) > 0) value *= 1.20;
        this.expansionEffects(hunter, 'damage').forEach(effect => {
            if (this._actionMatches(hunter, effect, action)) value *= Number(effect.value || 1);
        });
        value *= this._buffValue(hunter, 'attack', 1);
        value *= this._buffValue(hunter, 'glory', 1);
        value *= 1 + Math.min(.24, Number(hunter.perkCartLearning || 0) * .08);
        if (names.has('영웅의 증표') && Number(hunter.heroInspirationCooldown || 0) <= 0
            && (tags.has('finisher') || tags.has('counter'))) {
            hunter.heroInspirationCooldown = 300;
            this._survivors().forEach(ally => {
                ally.atb = Math.min(100, Number(ally.atb || 0) + 12);
                this.engine.updateWeaponAtbUI?.(ally.index, ally.atb);
            });
            this.engine.showSkillBubble?.(hunter.index, '🏅 영웅의 증표!');
        }
        this.applyMonsterStatus(hunter, action, value);
        if (names.has('스태미나 탈취') && (tags.has('blunt') || Number(action?.stun || 0) > 0)) {
            this.engine.monsterAtb = Math.max(0, Number(this.engine.monsterAtb || 0) - 8);
        }
        hunter._lastExpandedPerkAction = action;
        return Math.max(0, Math.floor(value));
    }

    applyMonsterStatus(hunter, action, damage) {
        if (this.engine.blightRuntime && this.engine.blightRuntime.blocksElementAndStatus(hunter)) return;
        const names = HuntPerkRuntime.names(hunter);
        const statusRate = names.has('상태이상 공격 강화') ? 1.3 : 1;
        const allStatusRate = this.expansionEffects(hunter, 'status-all')
            .reduce((rate, effect) => rate * Number(effect.value || 1), 1);
        const statusMultiplier = status => allStatusRate * this.expansionEffects(hunter, 'status')
            .filter(effect => effect.status === status)
            .reduce((rate, effect) => rate * Number(effect.value || 1), 1);
        const statusSpecials = (hunter?.weaponInstance?.specials || [])
            .filter(special => special?.kind === 'status' && special?.hidden !== true);
        const perkRate = status => status === 'poison' && names.has('독사') ? 1.5
            : status === 'paralysis' && names.has('마비 사냥꾼') ? 1.5
                : status === 'sleep' && names.has('잠재우는 손') ? 1.5 : 1;
        const keyFor = { poison: 'monsterPoisonBuild', paralysis: 'monsterParalysisBuild', sleep: 'monsterSleepBuild', blast: 'monsterBlastBuild' };
        statusSpecials.forEach(special => {
            const status = String(special.status || '').toLowerCase();
            const key = keyFor[status];
            if (!key) return;
            const build = Math.max(1, Number(special.raw || 0) * .35 + Number(damage || 0) * .01);
            this.engine[key] = Number(this.engine[key] || 0)
                + build * statusRate * statusMultiplier(status) * perkRate(status);
        });
        if (this.engine.monsterPoisonBuild >= 100 && !this.engine.monsterPoisonTicks) {
            this.engine.monsterPoisonBuild = 0;
            this.engine.monsterPoisonTicks = names.has('독사') ? 130 : 100;
            this.engine.addLog(`☠️ [독] ${hunter.hunterName}의 독이 축적되어 몬스터가 중독됐습니다!`, '#c77dff');
        }
        if (this.engine.monsterParalysisBuild >= 100) {
            this.engine.monsterParalysisBuild = 0;
            if (this.engine.enterMonsterControlState) {
                this.engine.enterMonsterControlState('paralysis', 35, { source: 'status-build' });
            } else {
                this.engine.monsterKnockdownDuration = Math.max(this.engine.monsterKnockdownDuration, 35);
                this.engine.monsterState = 'paralyzed'; this.engine.monsterAtb = 0;
            }
            this.engine.addLog(`⚡ [마비] ${hunter.hunterName}의 마비가 축적되어 몬스터의 움직임이 멎었습니다!`, '#ffe66d');
        }
        if (this.engine.monsterSleepBuild >= 100) {
            this.engine.monsterSleepBuild = 0;
            if (this.engine.enterMonsterControlState) {
                this.engine.enterMonsterControlState('sleep', 50, { source: 'status-build' });
            } else {
                this.engine.monsterKnockdownDuration = Math.max(this.engine.monsterKnockdownDuration, 50);
                this.engine.monsterState = 'sleeping'; this.engine.monsterAtb = 0;
            }
            this.engine.addLog(`💤 [수면] ${hunter.hunterName}의 수면치가 축적되어 몬스터가 잠들었습니다!`, '#8fd7ff');
        }
        if (this.engine.monsterBlastBuild >= 100) {
            this.engine.monsterBlastBuild = 0;
            const burst = Math.max(80, Math.floor(this.engine.monsterMaxHp * .012));
            this.engine.monsterHp = Math.max(0, this.engine.monsterHp - burst);
            this.engine.addLog(`💥 [폭파] ${hunter.hunterName}이(가) 쌓은 폭파 분진이 터졌습니다! (-${burst} HP)`, '#ff9f43');
            this.trigger(hunter, 'blast-proc');
        }
    }

    tickGlobal() {
        if (this.engine._perkGlobalTick === this.engine.battleTime) return;
        this.engine._perkGlobalTick = this.engine.battleTime;
        if (this.engine.monsterPoisonTicks > 0) {
            this.engine.monsterPoisonTicks--;
            if (this.engine.battleTime % 10 === 0) {
                const dot = Math.max(1, Math.floor(this.engine.monsterMaxHp * .002));
                this.engine.monsterHp = Math.max(0, this.engine.monsterHp - dot);
                this.engine.updateMonsterHpUI();
            }
        }
    }

    partDamage(hunter, damage) {
        const names = HuntPerkRuntime.names(hunter);
        let rate = names.has('파괴왕') ? 1.3 : 1;
        if (names.has('꼬리 수집가') && hunter.id !== 'hammer' && hunter.id !== 'hunting_horn') rate *= 1.18;
        if (names.has('두개골 측량사') && (hunter.id === 'hammer' || hunter.id === 'hunting_horn')) rate *= 1.2;
        if (names.has('날개 꺾기')) rate *= 1.18;
        if (names.has('꼬리 사냥꾼') && hunter.id !== 'hammer' && hunter.id !== 'hunting_horn') rate *= 1.16;
        if (names.has('뿔 수집가') && (hunter.id === 'hammer' || hunter.id === 'hunting_horn')) rate *= 1.18;
        if (names.has('부위 개척자') && !(this.engine.monsterPartState || []).some(part => Number(part.damageAccumulated || 0) > 0)) rate *= 1.25;
        if (names.has('약점 집착') && (this.engine.monsterPartState || []).some(part => Number(part.health || 0) <= Number(part.maxHealth || 0) * .4)) rate *= 1.18;
        this.expansionEffects(hunter, 'part').forEach(effect => {
            if (this._actionMatches(hunter, effect, hunter?._lastExpandedPerkAction || {})) rate *= Number(effect.value || 1);
        });
        return damage * rate;
    }

    stunValue(hunter, stun) {
        const names = HuntPerkRuntime.names(hunter);
        let rate = names.has('KO술') ? 1.3 : 1;
        this.expansionEffects(hunter, 'stun').forEach(effect => { rate *= Number(effect.value || 1); });
        return Math.round(stun * rate);
    }

    sharpnessCost(hunter, cost) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('명검') || names.has('명검의 가르침')) return this.engine.random() < .35 ? 0 : cost;
        if (names.has('💩')) return this.engine.random() < .1 ? 0 : cost;
        if (this.expansionEffects(hunter, 'sharpness-save').some(effect => this.engine.random() < Number(effect.chance || 0))) return 0;
        if (names.has('칼날 연마')) return Math.ceil(cost * .65);
        return cost;
    }

    ammoCost(hunter, cost) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('탄환 절약') || names.has('명검의 가르침')) return this.engine.random() < .3 ? 0 : cost;
        if (names.has('💩')) return this.engine.random() < .1 ? 0 : cost;
        if (this.expansionEffects(hunter, 'ammo-save').some(effect => this.engine.random() < Number(effect.chance || 0))) return 0;
        return cost;
    }

    prepareActionEconomy(hunter, action) {
        if (!action?.effects) return action;
        const names = HuntPerkRuntime.names(hunter);
        const canSave = names.has('탄환 절약') || names.has('명검의 가르침');
        if (!canSave || this.engine.random() >= .3) return action;
        const effects = { ...action.effects };
        if (Number(effects.magazine || 0) < 0) effects.magazine = 0;
        if (Number(effects.shells || 0) < 0) effects.shells = 0;
        return { ...action, effects };
    }

    healAmount(source, amount) {
        const names = HuntPerkRuntime.names(source);
        let rate = names.has('체력 회복량 UP') ? 1.25 : 1;
        if (names.has('버섯 애호가')) rate *= 1.1;
        if (names.has('야생의 치료사')) rate *= 1.12;
        this.expansionEffects(source, 'heal-rate').forEach(effect => { rate *= Number(effect.value || 1); });
        this.expansionEffects(source, 'heal-variance').forEach(effect => {
            rate *= Number(effect.min || 1) + this.engine.random() * (Number(effect.max || 1) - Number(effect.min || 1));
        });
        return Math.round(amount * rate);
    }

    itemDuration(hunter, ticks) {
        let rate = HuntPerkRuntime.has(hunter, '빨리 먹기') ? .55 : 1;
        if (HuntPerkRuntime.has(hunter, '고양이 혀')) rate *= 1.35;
        this.expansionEffects(hunter, 'item-duration').forEach(effect => { rate *= Number(effect.value || 1); });
        return Math.max(1, Math.ceil(ticks * rate));
    }

    shouldConsumeItem(hunter, item = null) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('💩')) return this.engine.random() >= .1;
        const canonicalItem = { shockTraps: 'traps', flashPods: 'flashes' }[item] || item;
        if (this.expansionEffects(hunter, 'item-save').some(effect => (!effect.item || effect.item === canonicalItem)
            && this.engine.random() < Number(effect.chance || 0))) return false;
        if (names.has('만족감') && this.engine.random() < .25) return false;
        const stockKey = { traps: 'shockTraps', flashes: 'flashPods' }[canonicalItem] || canonicalItem;
        if (names.has('절약가') && Number(hunter?.[stockKey] || 0) <= 1 && this.engine.random() < .5) return false;
        return true;
    }

    afterPotion(hunter, healed) {
        const names = HuntPerkRuntime.names(hunter);
        const expandedShare = this.expansionEffects(hunter, 'potion-share').reduce((sum, effect) => sum + Number(effect.value || 0), 0);
        if (!names.has('광역화') && !names.has('응급 배급') && expandedShare <= 0) return;
        const shareRate = Math.max(expandedShare, names.has('광역화') ? .45 : .35);
        const share = Math.max(1, Math.round(healed * shareRate));
        this.engine.selectedWeapons.forEach(ally => {
            if (ally !== hunter && ally.status === 'alive' && !ally.isAtCamp && this.canReceiveTeamHealing(ally, hunter)) {
                ally.hp = Math.min(ally.maxHp, ally.hp + share);
                this.engine.updateHpUI(ally);
            }
        });
        this.engine.showSkillBubble(hunter.index, `🤝 동료 회복 +${share}`);
    }

    useBomb(hunter, source = '아이템') {
        const engine = this.engine;
        if (Number(hunter?.bombs || 0) <= 0 || Number(engine?.monsterHp || 0) <= 0) return false;
        const hasBombardier = HuntPerkRuntime.has(hunter, '폭파광');
        // Journey resources need a stable early-game value across monsters.
        // 200 is roughly 80% of the shared-combat True Charged Slash baseline;
        // monster max HP must not turn bombs into flat percentage damage as
        // content tiers expand.
        const baseDamage = 200;
        let damage = Math.floor(baseDamage * (hasBombardier ? 1.5 : 1));
        this.expansionEffects(hunter, 'bomb-damage').forEach(effect => { damage = Math.floor(damage * Number(effect.value || 1)); });
        if (this.shouldConsumeItem(hunter, 'bombs')) hunter.bombs--;
        if (engine.smallMonsterSwarm) {
            const target = engine.smallMonsterSwarm.randomTarget(engine.random);
            if (target) damage = Math.min(damage, target.hp);
        }
        damage = engine.resolveSleepWakeDamage?.(damage, {
            direct: true, groupKey: engine.battleTime,
            hunterIndex: hunter.index, actionId: 'item.large-barrel-bomb'
        }) ?? damage;
        hunter.itemDuration = this.itemDuration(hunter, 18);
        engine.monsterHp = Math.max(0, engine.monsterHp - damage);
        engine.updateMonsterHpUI();
        engine.updateHunterItemUI?.(hunter);
        engine.triggerEnvironmentEffect?.('bomb');
        engine.playSFX?.('barrel_bomb', null, { hunterIndex: hunter.index, action: 'item', item: 'large-barrel-bomb' });
        engine.addLog(`💣 [${source}] ${hunter.hunterName}이(가) 대형나무통폭탄을 폭발시켰습니다! (-${damage} HP${hasBombardier ? ' · 폭파광 1.5배' : ''})`, '#ff9f43');
        engine.showSkillBubble(hunter.index, hasBombardier ? '💥 폭파광 대폭발!' : '💣 대형나무통폭탄!');
        return true;
    }

    trySpecialAction(hunter) {
        const names = HuntPerkRuntime.names(hunter);
        // Bomb timing belongs to HuntHunterDecisionPolicy. Perks modify stock,
        // preservation and damage but never create a second autonomous item AI.
        if (names.has('꼬리 수집가') && this.engine.severedTail?.available && !this.engine.severedTail.carved
            && this.engine.tryConsumeCombatGather?.()) {
            this.engine.severedTail.carved = true;
            hunter.itemDuration = 25;
            hunter.isGathering = true;
            if (!Array.isArray(hunter.gatheredMaterials)) hunter.gatheredMaterials = [];
            hunter.gatheredMaterials.push({ kind: 'tail', item: this.engine.severedTail.material });
            this.engine.addLog(`🔪 [꼬리 수집가] ${hunter.hunterName}이(가) 전투 중 잘린 꼬리를 갈무리했습니다! (획득: ${this.engine.severedTail.material} · 파티 채집 ${this.engine.combatGatherCount}/3)`, '#ffb07c');
            this.engine.showSkillBubble(hunter.index, '꼬리 갈무리');
            this.engine.updateTailSeverUI(false, true);
            this.trigger(hunter, 'tail-carve');
            return true;
        }
        const trapImmune = this.engine.isMonsterTrapImmune();
        if (names.has('포획 명인') && !trapImmune
            && this.engine.monsterHp > 0 && this.engine.monsterHp <= this.engine.monsterMaxHp * .1) {
            this.engine.monsterHp = 0;
            this.engine.addLog(`🪤 [포획 명인] ${hunter.hunterName}이(가) 약해진 몬스터를 포획했습니다!`, '#9bea64');
            this.engine.showSkillBubble(hunter.index, '🪤 포획 성공');
            return true;
        }
        if (names.has('물욕 센서') && !hunter.perkGathered && this.engine.random() < .08
            && this.engine.tryConsumeCombatGather?.()) {
            hunter.perkGathered = true; hunter.itemDuration = 20; hunter.isGathering = true;
            this.engine.addLog(`💎 [물욕 센서] ${hunter.hunterName}이(가) 반짝이는 소재를 보고 전투를 멈추고 채집합니다! (파티 채집 ${this.engine.combatGatherCount}/3)`, '#c98534');
            return true;
        }
        const gatherEffect = this.expansionEffects(hunter, 'combat-gather')
            .find(effect => !hunter.expandedCombatGathered && this.engine.random() < Number(effect.chance || 0));
        if (gatherEffect && this.engine.tryConsumeCombatGather?.()) {
            hunter.expandedCombatGathered = true;
            hunter.itemDuration = 18;
            hunter.isGathering = true;
            const items = ['potions','lifepowders','bombs'];
            const item = items[Math.floor(this.engine.random() * items.length)];
            hunter[item] = Number(hunter[item] || 0) + 1;
            this.engine.updateHunterItemUI?.(hunter);
            this.engine.addLog(`🧺 [${gatherEffect.perkName}] ${hunter.hunterName}이(가) 전투 중 반짝이는 물자를 주웠습니다!`, '#d7b86d');
            this.trigger(hunter, 'gather');
            return true;
        }
        return false;
    }

    incomingDamage(hunter, damage, context = {}) {
        const names = HuntPerkRuntime.names(hunter);
        let value = damage
            * (HuntPerkRuntime.personalityProfiles()?.incomingDamageMultiplier(hunter, this.engine) || 1);
        if (names.has('방어')) value *= .88;
        if (names.has('불굴') && Number(hunter.cartCount || 0) === 0) value *= .95;
        if (names.has('정령의 가호') && this.engine.random() < .25) value *= .5;
        if (names.has('새벽의 생존자') && Number(hunter.dawnSurvivorCooldown || 0) <= 0
            && hunter.hp <= hunter.maxHp * .35 && value >= hunter.hp) {
            value = Math.max(0, hunter.hp - 1);
            hunter.dawnSurvivorCooldown = 600;
            hunter.atb = 100;
            this.engine.showSkillBubble?.(hunter.index, '🌅 새벽까지 버틴다');
        }
        if (value > 0 && names.has('앙심')) hunter.resentmentTicks = 60;
        if (value > 0 && names.has('복수의 일격')) hunter.revengeReady = true;
        if (names.has('불길한 예감') && context.isUltimate) value *= .72;
        if (names.has('지상주의자') && (this.engine.monsterFlightState === 'airborne' || this.engine.monsterState === 'valstrax_flying')) value *= .85;
        this.expansionEffects(hunter, 'incoming').forEach(effect => {
            if (this._condition(hunter, effect.when)) value *= Number(effect.value || 1);
        });
        if (this._buffValue(hunter, 'glory', 1) > 1) value *= 1.15;
        hunter._expandedFirstHitTaken = true;
        return Math.max(0, Math.floor(value));
    }

    guardedDamage(hunter, damage) {
        return HuntPerkRuntime.has(hunter, '가드 강화') ? Math.max(1, Math.floor(damage * .7)) : damage;
    }

    ignoresPattern(hunter, pattern) {
        const name = String(pattern?.name || '');
        const type = String(pattern?.type || '');
        if (HuntPerkRuntime.has(hunter, '풍압 내성') && (type === 'wind' || /풍압|날갯짓|회오리/.test(name))) return '풍압 내성';
        if (HuntPerkRuntime.has(hunter, '내진') && (type === 'tremor' || /지진|진동|내려찍기|땅울림/.test(name))) return '내진';
        return null;
    }

    onDefense(hunter, result) {
        const names = HuntPerkRuntime.names(hunter);
        if (result === 'dodge') {
            if (names.has('회피 거리 UP')) hunter.atb = Math.max(Number(hunter.atb || 0), 35);
            if (names.has('연마술 예') && hunter.type !== 'ranged') hunter.sharpness = Math.min(Number(hunter.maxSharpness || 100), Number(hunter.sharpness || 0) + 15);
        }
        if ((result === 'guard' || result === 'perfect-guard' || result === 'counter') && names.has('공세적 방어')) hunter.offensiveGuardTicks = 50;
        if (result === 'dodge') this.trigger(hunter, 'dodge');
        if (result === 'perfect-guard') this.trigger(hunter, 'perfect-guard');
        if (result === 'guard' || result === 'perfect-guard' || result === 'counter') this.trigger(hunter, 'guard');
    }

    onRecovered(hunter, kind = 'ailment') {
        if (HuntPerkRuntime.has(hunter, '전화위복')) hunter.coalescenceTicks = 80;
        const event = kind === 'roar' ? 'roar-recover'
            : kind === 'tremor' ? 'tremor-recover'
                : kind === 'wind' ? 'wind-recover' : 'ailment-recover';
        this.trigger(hunter, event);
    }

    onWhetstoneComplete(hunter) { this.trigger(hunter, 'whetstone'); }
    onAttackMiss(hunter) { this.trigger(hunter, 'miss'); }
    onItemEmpty(hunter, item) { this.trigger(hunter, `item-empty:${item}`); }
    onPartBreak(hunter, result) { if (result?.newlyBroken) this.trigger(hunter, 'part-break', { result }); }
    onCart(hunter) { this.trigger(hunter, 'cart'); }
    evadeChanceBonus(hunter) { return this._buffValue(hunter, 'evade', 0); }

    preventCart(hunter, damage) {
        if (damage < hunter.hp) return false;
        const guts = this.expansionEffects(hunter, 'guts').find(effect => !hunter._expandedGutsUsed);
        if (!guts) return false;
        hunter._expandedGutsUsed = true;
        hunter.hp = Number(guts.hp || 1);
        hunter.atb = Number(guts.atb || 100);
        this.engine.addLog(`💓 [${guts.perkName}] ${hunter.hunterName}이(가) 치명상을 버티고 다시 일어섰습니다!`, '#ff6f7f');
        this.engine.showSkillBubble(hunter.index, '💓 불굴의 맥박!');
        return true;
    }

    cartRecoveryTicks(hunter, ticks) {
        this.expansionEffects(hunter, 'cart-recovery').forEach(effect => {
            ticks = Math.ceil(ticks * Number(effect.value || 1));
        });
        if (HuntPerkRuntime.has(hunter, '수레 단골')) return Math.max(18, Math.ceil(ticks * .45));
        return HuntPerkRuntime.has(hunter, '수레 애호가') ? Math.max(20, Math.ceil(ticks * .55)) : ticks;
    }

    stunChance(hunter, chance) { return HuntPerkRuntime.has(hunter, '기절 내성') ? chance * .25 : chance; }
    stunDuration(hunter, ticks) { return HuntPerkRuntime.has(hunter, '기절 내성') ? Math.ceil(ticks * .4) : ticks; }
    roarDuration(hunter, ticks) { return HuntPerkRuntime.has(hunter, '귀마개') ? 0 : ticks; }

    afterDamage(hunter, damage) {
        if (damage <= 0) return;
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('혈기')) {
            hunter.hp = Math.min(hunter.maxHp, hunter.hp + Math.max(1, Math.floor(damage * .06)));
            this.engine.updateHpUI(hunter);
        }
        if (names.has('분위기 메이커') && damage >= 80) {
            (this.engine.selectedWeapons || []).forEach(ally => {
                if (ally !== hunter && ally.status === 'alive') ally.atb = Math.min(100, Number(ally.atb || 0) + 5);
            });
            this.engine.showSkillBubble(hunter.index, '🎉 사기 진작');
        }
        const action = hunter._lastExpandedPerkAction || {};
        const tags = new Set(action.tags || []);
        if (hunter.lastAttackCritical) this.trigger(hunter, 'critical', { damage, action });
        if (tags.has('strong') || tags.has('finisher') || Number(action.durationTicks || 0) >= 45) this.trigger(hunter, 'strong-hit', { damage, action });
        if (damage >= 80) this.trigger(hunter, 'heavy-hit', { damage, action });
        hunter._expandedFirstHitDone = true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntPerkRuntime;
else window.HuntPerkRuntime = HuntPerkRuntime;
