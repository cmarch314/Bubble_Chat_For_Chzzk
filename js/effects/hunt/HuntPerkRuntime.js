class HuntPerkRuntime {
    static CAMP_STAY_TICKS = Object.freeze({
        guardian: 320,
        lost: 100
    });

    constructor(engine) { this.engine = engine; }

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

    initialize(hunter) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('체력 증강')) { hunter.maxHp += 20; hunter.hp += 20; }
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
        if (names.has('무모한 준비')) { hunter.hp = Math.max(1, hunter.hp - 15); hunter.atb = 85; }
        if (names.has('버섯 애호가')) hunter.potions += 1;
        if (names.has('벌꿀 주세요')) hunter.potions += 2;
        if (names.has('광역 분진')) hunter.lifepowders += 1;
        if (names.has('덫 장인')) hunter.perkTraps = 2;
        if (names.has('폭파광')) hunter.bombs = Number(hunter.bombs || 0) + 2;
        if (names.has('섬광 조제사')) hunter.perkFlashes = 2;
        if (names.has('영웅의 증표')) hunter.heroSaveReady = true;
        if (names.has('한 대만')) hunter.oneHitReady = true;
        if (names.has('첫 수는 크게')) hunter.firstStrikeReady = true;
        if (names.has('보급관')) hunter.lifepowders = Number(hunter.lifepowders || 0) + 1;
        if (names.has('폭탄 배달부')) hunter.bombs = Number(hunter.bombs || 0) + 1;
    }

    tick(hunter) {
        this.tickGlobal();
        ['coalescenceTicks','resentmentTicks','offensiveGuardTicks'].forEach(key => {
            if (Number(hunter?.[key] || 0) > 0) hunter[key]--;
        });
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
        const campGuardian = HuntPerkRuntime.has(hunter, '캠프 수호자');
        if (campGuardian) {
            hunter.hp = hunter.maxHp;
            hunter.potions = Math.max(Number(hunter.potions || 0), 10) + 2;
            hunter.sharpness = Math.max(Number(hunter.sharpness || 0), Number(hunter.maxSharpness || 100));
        }
        hunter.atb = 70;
        this.engine.addLog(campGuardian
            ? `⛺ [캠프 합류] ${hunter.hunterName}이(가) 캠프에서 보급을 마치고 뒤늦게 전장에 합류했습니다!`
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
        return 1;
    }

    actionDuration(hunter, action, ticks) {
        const names = HuntPerkRuntime.names(hunter);
        const id = String(action?.id || '');
        const tags = new Set(action?.tags || []);
        let rate = 1;
        if (names.has('집중') && (tags.has('charge') || tags.has('preparation') || /charge|draw/.test(id))) rate *= .72;
        if (names.has('납도술') && /sheathe|draw/.test(id)) rate *= .65;
        if (names.has('신속 교체') && /morph|change|switch/.test(id)) rate *= .7;
        return Math.max(1, Math.ceil(Number(ticks || 1) * rate));
    }

    whetstoneDuration(hunter, ticks) {
        return HuntPerkRuntime.has(hunter, '숫돌 사용 고속화') ? Math.max(1, Math.ceil(ticks * .4)) : ticks;
    }

    buffDuration(hunter, ticks) {
        const names = HuntPerkRuntime.names(hunter);
        return Math.ceil(ticks * (names.has('강화 지속') ? 1.35 : 1));
    }

    outgoingDamage(hunter, action, damage) {
        const names = HuntPerkRuntime.names(hunter);
        let value = Number(damage || 0);
        const tags = new Set(action?.tags || []);
        const id = String(action?.id || '');
        if (names.has('완전 충전') && hunter.hp >= hunter.maxHp) value *= 1.12;
        if (names.has('역전') && hunter.hp <= hunter.maxHp * .5) value *= 1.12;
        if (names.has('도전자') && this.engine.monsterState === 'enraged') value *= 1.18;
        if (names.has('재난대처능력') && hunter.hp <= hunter.maxHp * .35) value *= 1.28;
        if (names.has('돌파구') && (hunter.status === 'stunned' || hunter.roarStunned)) value *= 1.25;
        if (names.has('전화위복') && Number(hunter.coalescenceTicks || 0) > 0) value *= 1.18;
        if (names.has('앙심') && Number(hunter.resentmentTicks || 0) > 0) value *= 1.16;
        if (names.has('공세적 방어') && Number(hunter.offensiveGuardTicks || 0) > 0) value *= 1.2;
        if (names.has('불굴') && Number(hunter.cartCount || 0) > 0) value *= 1 + Math.min(.18, hunter.cartCount * .09);
        if (names.has('심안') && hunter.sharpness <= 30) value *= 1.7;
        if (names.has('완벽주의') && hunter.hp >= hunter.maxHp) value *= 1.15;
        if (names.has('임기응변') && this.engine.pendingMonsterAction) value *= 1.12;
        if (names.has('힘의 해방') && hunter.hp <= hunter.maxHp * .5) value *= 1.15;
        if (names.has('혼신') && Number(hunter.atb || 0) <= 5) value *= 1.12;
        if (names.has('연격')) value *= 1 + Math.min(.15, Number(hunter.perkComboHits || 0) * .03);
        hunter.perkComboHits = Number(hunter.perkComboHits || 0) + 1;
        const weaponAffinity = Math.max(0, Number(hunter.weaponInstance?.affinity ?? hunter.affinity ?? 0)) / 100;
        const affinity = Math.min(.95, weaponAffinity + Number(hunter.perkModifiers?.critChance || (names.has('💩') ? .6 : 0))
            + (names.has('간파') ? .18 : 0)
            + (names.has('약점 특효') && (this.engine.monsterWoundOpen || this.engine.monsterState === 'stunned') ? .3 : 0));
        if (affinity > 0 && this.engine.random() < affinity) value *= names.has('슈퍼회심') ? 1.4 : 1.25;
        if (names.has('한 대만') && hunter.oneHitReady) { value *= 1.8; hunter.oneHitReady = false; }
        if (names.has('훈타') && this.engine.random() < .12) value = 0;
        if (names.has('발도술') && !hunter.lastActionId) value *= 1.2;
        if (names.has('포술') && (tags.has('explosive') || /shell|wyvern|discharge/.test(id))) value *= 1.14;
        if (names.has('집중 포화') && tags.has('focus-strike')) value *= 1.18;
        if (names.has('특수 사격 강화') && /special|wyvern|focus|dragon_piercer/.test(id)) value *= 1.13;
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
        this.applyMonsterStatus(hunter, action, value);
        if (names.has('스태미나 탈취') && (tags.has('blunt') || Number(action?.stun || 0) > 0)) {
            this.engine.monsterAtb = Math.max(0, Number(this.engine.monsterAtb || 0) - 8);
        }
        return Math.max(0, Math.floor(value));
    }

    applyMonsterStatus(hunter, action, damage) {
        if (this.engine.blightRuntime && this.engine.blightRuntime.blocksElementAndStatus(hunter)) return;
        const names = HuntPerkRuntime.names(hunter);
        const statusRate = names.has('상태이상 공격 강화') ? 1.3 : 1;
        const add = key => { this.engine[key] = Number(this.engine[key] || 0) + Math.max(1, damage * .04 * statusRate); };
        if (names.has('독사')) add('monsterPoisonBuild');
        if (names.has('마비 사냥꾼')) add('monsterParalysisBuild');
        if (names.has('잠재우는 손')) add('monsterSleepBuild');
        if (names.has('폭파광')) add('monsterBlastBuild');
        if (this.engine.monsterPoisonBuild >= 100 && !this.engine.monsterPoisonTicks) {
            this.engine.monsterPoisonBuild = 0; this.engine.monsterPoisonTicks = 100;
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
        if (names.has('날개 꺾기') && hunter.type === 'ranged') rate *= 1.18;
        if (names.has('꼬리 사냥꾼') && hunter.id !== 'hammer' && hunter.id !== 'hunting_horn') rate *= 1.16;
        if (names.has('뿔 수집가') && (hunter.id === 'hammer' || hunter.id === 'hunting_horn')) rate *= 1.18;
        if (names.has('부위 개척자') && !(this.engine.monsterPartState || []).some(part => Number(part.damageAccumulated || 0) > 0)) rate *= 1.25;
        if (names.has('약점 집착') && (this.engine.monsterPartState || []).some(part => Number(part.health || 0) <= Number(part.maxHealth || 0) * .4)) rate *= 1.18;
        return damage * rate;
    }

    stunValue(hunter, stun) {
        const names = HuntPerkRuntime.names(hunter);
        return Math.round(stun * (names.has('KO술') ? 1.3 : 1));
    }

    sharpnessCost(hunter, cost) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('명검') || names.has('명검의 가르침')) return this.engine.random() < .35 ? 0 : cost;
        if (names.has('💩')) return this.engine.random() < .6 ? 0 : cost;
        if (names.has('칼날 연마')) return Math.ceil(cost * .65);
        return cost;
    }

    ammoCost(hunter, cost) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('탄환 절약') || names.has('명검의 가르침')) return this.engine.random() < .3 ? 0 : cost;
        if (names.has('💩')) return this.engine.random() < .6 ? 0 : cost;
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
        return Math.round(amount * rate);
    }

    itemDuration(hunter, ticks) {
        let rate = HuntPerkRuntime.has(hunter, '빨리 먹기') ? .55 : 1;
        if (HuntPerkRuntime.has(hunter, '고양이 혀')) rate *= 1.35;
        return Math.max(1, Math.ceil(ticks * rate));
    }

    shouldConsumeItem(hunter) {
        const names = HuntPerkRuntime.names(hunter);
        if (names.has('💩')) return this.engine.random() >= .6;
        return !(names.has('만족감') || names.has('만족할 줄 모름') || names.has('절약가')) || this.engine.random() >= .3;
    }

    afterPotion(hunter, healed) {
        const names = HuntPerkRuntime.names(hunter);
        if (!names.has('광역화') && !names.has('우애') && !names.has('응급 배급')) return;
        const shareRate = names.has('광역화') ? .45 : names.has('응급 배급') ? .35 : .25;
        const share = Math.max(1, Math.round(healed * shareRate));
        this.engine.selectedWeapons.forEach(ally => {
            if (ally !== hunter && ally.status === 'alive' && !ally.isAtCamp) {
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
        const baseDamage = Math.max(60, Math.floor(Number(engine.monsterMaxHp || 0) * .04));
        let damage = Math.floor(baseDamage * (hasBombardier ? 1.5 : 1));
        if (this.shouldConsumeItem(hunter)) hunter.bombs--;
        if (engine.smallMonsterSwarm) {
            const target = engine.smallMonsterSwarm.randomTarget(engine.random);
            if (target) damage = Math.min(damage, target.hp);
        }
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
        if (names.has('폭탄 배달부') && Number(hunter.bombs || 0) > 0
            && Number(this.engine.monsterKnockdownDuration || 0) > 0) {
            return this.useBomb(hunter, '폭탄 배달부');
        }
        if (names.has('폭파광') && Number(hunter.bombs || 0) > 0
            && Number(this.engine.monsterKnockdownDuration || 0) > 0) {
            return this.useBomb(hunter, '폭파광');
        }
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
        if (names.has('덫 장인') && !trapImmune && hunter.perkTraps > 0 && this.engine.monsterState === 'normal') {
            hunter.perkTraps--;
            const trapTicks = this.engine.consumeTrapDuration(45);
            this.engine.monsterKnockdownDuration = trapTicks;
            this.engine.monsterState = 'knocked_down'; this.engine.monsterAtb = 0;
            hunter.itemDuration = 12;
            this.engine.triggerEnvironmentEffect('pitfall', hunter.index);
            this.engine.addLog(`🕸️ [덫 장인] ${hunter.hunterName}이(가) 신속하게 함정을 설치해 몬스터를 ${(trapTicks / 10).toFixed(1)}초 구속했습니다!`, '#e0ffa3');
            return true;
        }
        const flashPolicy = typeof HuntSupportItemPolicy !== 'undefined'
            ? HuntSupportItemPolicy
            : (typeof require === 'function' ? require('./HuntSupportItemPolicy.js') : null);
        if (names.has('섬광 조제사') && hunter.perkFlashes > 0
            && this.engine.monsterAtb >= 70 && flashPolicy?.isFlashEffective(this.engine)) {
            hunter.perkFlashes--;
            this.engine.monsterFlashUseCount = Number(this.engine.monsterFlashUseCount || 0) + 1;
            this.engine.monsterAtb = 0; this.engine.monsterRecoveryDuration = Math.max(this.engine.monsterRecoveryDuration, 25);
            hunter.itemDuration = 8;
            if (this.engine.monsterFlightState === 'airborne') {
                this.engine.monsterFlightRuntime?.forceLanding(this.engine, 'perk-flash');
            }
            this.engine.playSFX?.('flash_pod', null, {
                hunterIndex: hunter.index,
                action: 'support',
                item: 'flash-pod'
            });
            this.engine.triggerEnvironmentEffect?.('flash', hunter.index);
            this.engine.addLog(`✨ [섬광 조제사] ${hunter.hunterName}이(가) 섬광탄으로 몬스터의 공격을 끊었습니다!`, '#fff3a3');
            return true;
        }
        if (names.has('물욕 센서') && !hunter.perkGathered && this.engine.random() < .08
            && this.engine.tryConsumeCombatGather?.()) {
            hunter.perkGathered = true; hunter.itemDuration = 20; hunter.isGathering = true;
            this.engine.addLog(`💎 [물욕 센서] ${hunter.hunterName}이(가) 반짝이는 소재를 보고 전투를 멈추고 채집합니다! (파티 채집 ${this.engine.combatGatherCount}/3)`, '#c98534');
            return true;
        }
        return false;
    }

    incomingDamage(hunter, damage, context = {}) {
        const names = HuntPerkRuntime.names(hunter);
        let value = damage;
        if (names.has('방어')) value *= .88;
        if (names.has('정령의 가호') && this.engine.random() < .25) value *= .5;
        if (names.has('새벽의 생존자') && hunter.hp <= hunter.maxHp * .25) value *= .78;
        if (value > 0 && names.has('앙심')) hunter.resentmentTicks = 60;
        if (value > 0 && names.has('복수의 일격')) hunter.revengeReady = true;
        if (names.has('불길한 예감') && context.isUltimate) value *= .72;
        if (names.has('지상주의자') && (this.engine.monsterFlightState === 'airborne' || this.engine.monsterState === 'valstrax_flying')) value *= .85;
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
    }

    onRecovered(hunter) {
        if (HuntPerkRuntime.has(hunter, '전화위복')) hunter.coalescenceTicks = 80;
    }

    preventCart(hunter, damage) {
        if (damage < hunter.hp || !hunter.heroSaveReady || !HuntPerkRuntime.has(hunter, '영웅의 증표')) return false;
        hunter.heroSaveReady = false;
        hunter.hp = 1;
        this.engine.addLog(`🔥 [영웅의 증표] ${hunter.hunterName}이(가) 치명상을 버티고 1 HP로 일어섰습니다!`, '#ffcc66');
        this.engine.showSkillBubble(hunter.index, '🔥 근성 발동');
        return true;
    }

    cartRecoveryTicks(hunter, ticks) {
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
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntPerkRuntime;
else window.HuntPerkRuntime = HuntPerkRuntime;
