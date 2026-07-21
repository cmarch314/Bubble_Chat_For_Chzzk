class HuntEngine {
    constructor(config) {
        this.selectedWeapons = config.selectedWeapons;
        this.selectedWeapons.forEach(hunter => { hunter.farcasterUsed = false; });
        this.selectedMonster = config.selectedMonster;
        this.bets = config.bets || {};
        this.consecutiveTotal = config.consecutiveTotal || 1;
        this.currentConsecutiveIndex = config.currentConsecutiveIndex || 0;
        this.consecutiveQueue = config.consecutiveQueue || [];
        this.combatGatherLimit = 3;
        this.combatGatherCount = Math.max(0, Math.min(this.combatGatherLimit, Number(config.combatGatherCount || 0)));
        this.callbacks = config.callbacks || {};
        this.random = config.random || Math.random;
        this.schedule = config.schedule || ((callback, delay) => setTimeout(callback, delay));
        this.actionStateMachine = config.actionStateMachine || new HuntActionStateMachine();
        this.weaponMechanics = config.weaponMechanics || new HuntWeaponMechanics(this.random);
        this.weaponMechanics.engine = this;
        this.perkRuntime = config.perkRuntime || (typeof HuntPerkRuntime !== 'undefined' ? new HuntPerkRuntime(this) : null);
        this.blightRuntime = config.blightRuntime || (typeof HuntHunterBlightRuntime !== 'undefined' ? new HuntHunterBlightRuntime(this) : null);
        this.weaponActionSelector = config.weaponActionSelector || new HuntWeaponActionSelector(this.random, this.weaponMechanics);
        this.monsterPatternSelector = config.monsterPatternSelector || new HuntMonsterPatternSelector(this.random);
        this.monsterFlightRuntime = config.monsterFlightRuntime || (typeof HuntMonsterFlightRuntime !== 'undefined' ? new HuntMonsterFlightRuntime(this.random) : null);
        this.hunterCommandQueue = config.hunterCommandQueue || (typeof HuntHunterCommandQueue !== 'undefined' ? new HuntHunterCommandQueue() : null);
        this.teamTactic = config.teamTactic || 'balanced';
        this.telemetry = config.telemetry || new HuntBalanceTelemetry();
        
        // Monster Stats
        this.monsterTier = config.monsterTier || 'normal';
        this.monsterHp = config.monsterHp || 15600;
        this.monsterMaxHp = config.monsterMaxHp || 15600;
        this.monsterSpeedMultiplier = config.monsterSpeedMultiplier !== undefined ? config.monsterSpeedMultiplier : 1.0;
        this.monsterAtbSpeedMod = config.monsterAtbSpeedMod || 1.15;
        this.monsterAtb = config.monsterAtb || 0;
        this.monsterState = config.monsterState || 'normal';
        this.monsterUltimateUsedInRage = Boolean(config.monsterUltimateUsedInRage);
        this.monsterSpeed = config.monsterSpeed || this.getMonsterSpeedForState(this.monsterState);
        this.monsterDamageMod = config.monsterDamageMod || 0.9;
        this.tierLabel = config.tierLabel || "대형 몬스터";
        this.smallMonsterSwarm = this.monsterTier === 'small' && typeof HuntSmallMonsterSwarm !== 'undefined'
            ? new HuntSmallMonsterSwarm(config.smallMonsterCount || 3, this.monsterMaxHp)
            : null;

        this.cartCount = config.cartCount || 0;
        this.cartLimit = Math.max(3, Number(config.cartLimit || (3 + this.selectedWeapons.filter(hunter =>
            (hunter.perks || []).some(perk => perk.name === '수레 애호가')
        ).length)));
        this.battleTime = config.battleTime || 0;
        this.monsterStunAccum = config.monsterStunAccum || 0;
        this.monsterStunThreshold = config.monsterStunThreshold || 390;
        this.monsterStunDuration = config.monsterStunDuration || 0;
        this.monsterKnockdownDuration = config.monsterKnockdownDuration || 0;
        this.monsterTrapUseCount = Math.max(0, Number(config.monsterTrapUseCount || 0));
        this.monsterKnockdownTriggered = config.monsterKnockdownTriggered || { 80: false, 60: false, 40: false, 20: false };
        this.monsterRecoveryDuration = 0;
        this.pendingMonsterAction = config.pendingMonsterAction || null;
        this.monsterAnatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog.find(this.selectedMonster)
            : null;
        this.monsterPartState = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog.createPartState(this.monsterAnatomy)
            : [];
        this.severedTail = { available: false, carved: false, material: `${this.selectedMonster.nameKO}의 꼬리`, displayName: `${this.selectedMonster.nameKO} 꼬리` };

        this.MONSTER_ATTACKS = config.MONSTER_ATTACKS;
        this.MONSTER_PATTERNS = config.MONSTER_PATTERNS || HuntMonsterPatternCatalog.build(config.MONSTER_ATTACKS || {});
        if (this.monsterFlightRuntime) this.monsterFlightRuntime.initialize(this);
        this.COMBO_LIST = config.COMBO_LIST;
        this.SHOW_MONSTER_HP = config.SHOW_MONSTER_HP;
        this.hunterSpeedMultiplier = config.hunterSpeedMultiplier !== undefined ? config.hunterSpeedMultiplier : 1.15;
        this.timeLimit = config.timeLimit || 480;

        // Valstrax Custom States
        if (this.selectedMonster.id.includes('valstrax')) {
            this.valstraxChargeCount = 0;
            this.valstraxChargeDmg = 0;
            this.valstraxChargeTimer = 0;
            this.valstraxEnrageTimer = 0;
            this.valstraxFlyingTimer = 0;
        }

        // Initialize hunter states
        this.selectedWeapons.forEach(w => {
            this.weaponMechanics.initialize(w);
            if (this.perkRuntime) this.perkRuntime.initialize(w);
            if (this.blightRuntime) this.blightRuntime.initialize(w);
            w.rollDuration = 0;
            w.guardDuration = 0;
            w.itemDuration = 0;
            w.attackDuration = 0;
            w.currentAction = null;
            w.actionState = 'idle';
            w.isGathering = false;
        });
    }

    addLog(text, color) {
        if (this.callbacks.onLog) this.callbacks.onLog(text, color);
    }

    playSFX(fileName, fallbackKey, context = {}) {
        if (this.callbacks.onPlaySFX) this.callbacks.onPlaySFX(fileName, fallbackKey, context);
    }

    playAudioFile(subPath, durationLimitMs, volumeMultiplier, context = {}) {
        if (this.callbacks.onPlayAudioFile) this.callbacks.onPlayAudioFile(subPath, durationLimitMs, volumeMultiplier, context);
    }

    shakeWeapon(idx, borderClr, isAttack, actionOrName, isDodge = false) {
        if (this.callbacks.onShakeWeapon) this.callbacks.onShakeWeapon(idx, borderClr, isAttack, actionOrName, isDodge);
    }

    shakeMonster() {
        if (this.callbacks.onShakeMonster) this.callbacks.onShakeMonster();
    }

    triggerEnvironmentEffect(kind, hunterIndex) {
        if (this.callbacks.onTriggerEnvironmentEffect) this.callbacks.onTriggerEnvironmentEffect(kind, hunterIndex);
    }

    restoreBorder(idx) {
        if (this.callbacks.onRestoreBorder) this.callbacks.onRestoreBorder(idx);
    }

    updateHpUI(w) {
        if (this.callbacks.onUpdateHpUI) this.callbacks.onUpdateHpUI(w);
    }

    updateMonsterHpUI() {
        if (this.smallMonsterSwarm) {
            const result = this.smallMonsterSwarm.reconcileTotal(this.monsterHp);
            this.monsterHp = result.remaining;
            if (this.callbacks.onUpdateSmallMonsterSwarmUI) this.callbacks.onUpdateSmallMonsterSwarmUI(this.smallMonsterSwarm.snapshot());
            result.defeated.forEach(index => this.addLog(`💥 ${this.selectedMonster.nameKO} ${index + 1}번 개체를 쓰러뜨렸습니다!`, '#ffcf66'));
        }
        if (this.callbacks.onUpdateMonsterHpUI) this.callbacks.onUpdateMonsterHpUI(this.monsterHp, this.monsterMaxHp);
    }

    updateWeaponAtbUI(idx, atb) {
        if (this.callbacks.onUpdateWeaponAtbUI) this.callbacks.onUpdateWeaponAtbUI(idx, atb);
    }

    updateSharpnessUI(idx, hunter) {
        if (this.callbacks.onUpdateSharpnessUI) this.callbacks.onUpdateSharpnessUI(idx, hunter);
    }

    updateMonsterAtbUI(atb) {
        if (this.callbacks.onUpdateMonsterAtbUI) this.callbacks.onUpdateMonsterAtbUI(atb);
    }

    updateMonsterStateUI(stateName, title, colorInfo) {
        if (this.callbacks.onUpdateMonsterStateUI) this.callbacks.onUpdateMonsterStateUI(stateName, title, colorInfo);
    }

    updateMonsterFlightUI(airborne, progress = 0, damage = 0, threshold = 0, remainingTicks = 0) {
        if (this.callbacks.onUpdateMonsterFlightUI) this.callbacks.onUpdateMonsterFlightUI(airborne, progress, damage, threshold, remainingTicks);
    }

    updatePotionCountUI(idx, count) {
        if (this.callbacks.onUpdatePotionCountUI) this.callbacks.onUpdatePotionCountUI(idx, count);
    }

    updateHunterItemUI(hunter) {
        if (this.callbacks.onUpdateHunterItemUI) this.callbacks.onUpdateHunterItemUI(hunter);
    }

    updateOverheatUI(idx, duration) {
        if (this.callbacks.onUpdateOverheatUI) this.callbacks.onUpdateOverheatUI(idx, duration);
    }

    updatePhialsUI(idx, phials) {
        if (this.callbacks.onUpdatePhialsUI) this.callbacks.onUpdatePhialsUI(idx, phials);
    }

    updateExtractsUI(idx, buffs) {
        if (this.callbacks.onUpdateExtractsUI) this.callbacks.onUpdateExtractsUI(idx, buffs);
    }

    updateCartUI(carts, limit = this.cartLimit || 3) {
        if (this.callbacks.onUpdateCartUI) this.callbacks.onUpdateCartUI(carts, limit);
    }

    getRemainingSeconds() {
        return Math.max(0, this.timeLimit - Math.floor(this.battleTime / 10));
    }

    updateTimerUI(timeSec) {
        const remaining = this.getRemainingSeconds();
        if (this.callbacks.onUpdateTimerUI) this.callbacks.onUpdateTimerUI(remaining);
    }

    showSkillBubble(idxOrMonster, text) {
        if (this.callbacks.onShowSkillBubble) this.callbacks.onShowSkillBubble(idxOrMonster, text);
    }

    spawnEmojiBubble(idx, emoji) {
        if (this.callbacks.onSpawnEmojiBubble) this.callbacks.onSpawnEmojiBubble(idx, emoji);
    }

    isStrongHunterAttack(hunter, action) {
        if (!hunter || !action || Number(action.dmg || 0) <= 0) return false;
        const thresholds = {
            great_sword: 70, long_sword: 60, sword_shield: 70, dual_blades: 85,
            hammer: 70, hunting_horn: 60, lance: 55, gunlance: 80,
            switch_axe: 75, charge_blade: 70, insect_glaive: 70,
            light_bowgun: 65, heavy_bowgun: 90, bow: 55
        };
        const tags = Array.isArray(action.tags) ? action.tags : [];
        return Number(action.motionValue || 0) >= Number(thresholds[hunter.id] || 70)
            || tags.some(tag => ['offset', 'counter', 'finisher', 'ultimate'].includes(tag));
    }

    expressHunterEmotion(hunter, kind, action = null) {
        if (!hunter || hunter.status === 'dead') return false;
        if (kind === 'success' && !this.isStrongHunterAttack(hunter, action)) return false;
        const now = Number(this.battleTime || 0);
        if (Number(hunter.lastEmotionTick ?? -999) + 18 > now) return false;
        const chances = { success: 0.35, failure: 0.58, hurt: 0.48 };
        if (this.random() >= Number(chances[kind] || 0)) return false;
        const pools = {
            success: ['😆', '😁', '🤩', '😎', '🥳', '🔥', '💪', '✨'],
            failure: ['😡', '🤬', '😤', '😫', '😱', '💢', '😭'],
            hurt: ['😵', '😭', '😨', '😖', '🥲', '💀', '💢']
        };
        const pool = pools[kind];
        const emoji = pool[Math.floor(this.random() * pool.length)];
        hunter.lastEmotionTick = now;
        this.spawnEmojiBubble(hunter.index, emoji);
        return true;
    }

    triggerMonsterRoar(monster) {
        if (this.callbacks.onTriggerMonsterRoar) this.callbacks.onTriggerMonsterRoar(monster);
    }

    triggerGameEnd(victory, winner) {
        this.telemetry.finish(victory, this.battleTime);
        if (this.callbacks.onGameEnd) this.callbacks.onGameEnd(victory, winner);
    }

    triggerNextConsecutive() {
        if (this.callbacks.onNextConsecutive) this.callbacks.onNextConsecutive();
    }

    getMonsterSpeedForState(state) {
        return HuntMonsterRules.speedForState(
            state,
            this.selectedMonster.id,
            this.monsterSpeedMultiplier * this.monsterAtbSpeedMod
        );
    }

    tryConsumeCombatGather() {
        if (this.combatGatherCount >= this.combatGatherLimit) return false;
        this.combatGatherCount++;
        return true;
    }

    resupplyHunterAtCamp(hunter) {
        if (!hunter) return false;
        const perks = new Set((hunter.perks || []).map(perk => perk?.name));
        const baseTraps = hunter.personality === 'support' ? 2 : hunter.personality === 'veteran' ? 1 : 0;

        hunter.potions = 10
            + (perks.has('버섯 애호가') ? 1 : 0)
            + (perks.has('벌꿀 주세요') ? 2 : 0);
        hunter.lifepowders = 1 + (perks.has('광역 분진') ? 1 : 0);
        if (perks.has('보급관')) hunter.lifepowders++;
        hunter.shockTraps = baseTraps;
        hunter.bombs = 1 + (perks.has('폭파광') ? 2 : 0);
        if (perks.has('폭탄 배달부')) hunter.bombs++;
        if (perks.has('수레 단골')) hunter.potions++;
        if (perks.has('똥')) {
            hunter.potions += 3;
            hunter.lifepowders += 1;
            hunter.bombs += 2;
            hunter.shockTraps += 1;
        }
        hunter.perkTraps = perks.has('덫 장인') ? 2 : 0;
        hunter.perkFlashes = perks.has('섬광 조제사') ? 2 : 0;
        hunter.flashPods = 0;

        if (hunter.sharpnessProfile) hunter.sharpness = Number(hunter.maxSharpness || 0);
        if (Number.isFinite(Number(hunter.maxMagazine))) hunter.magazine = Number(hunter.maxMagazine);
        hunter.ammo = perks.has('포탄 장전') ? 7 : 5;
        if (hunter.id === 'light_bowgun') {
            hunter.wyvernblastCharges = 3;
            hunter.wyvernblastRecharge = 0;
        }

        this.resetHunterSpecialWeaponStates(hunter);

        this.updatePotionCountUI(hunter.index, hunter.potions);
        this.updateHunterItemUI(hunter);
        this.updateSharpnessUI(hunter.index, hunter);
        return true;
    }

    resetHunterSpecialWeaponStates(hunter) {
        if (!hunter) return;
        if (hunter.id === 'charge_blade') {
            hunter.phials = 0;
            hunter.shieldChargeDuration = 0;
            hunter.savageAxeTicks = 0;
        } else if (hunter.id === 'gunlance') {
            hunter.overheatDuration = 0;
        } else if (hunter.id === 'insect_glaive') {
            hunter.extractBuffs = { red: 0, white: 0, orange: 0 };
            hunter.extractDuration = 0;
        } else if (hunter.id === 'switch_axe') {
            hunter.switchGauge = 100;
            hunter.ampGauge = 0;
            hunter.ampStateTicks = 0;
        } else if (hunter.id === 'long_sword') {
            hunter.spiritGauge = 0;
            hunter.spiritLevel = 0;
        } else if (hunter.id === 'dual_blades') {
            hunter.demonStamina = 100;
            hunter.archdemonGauge = 0;
            hunter.demonModeDuration = 0;
        }
    }

    triggerHunterCart(target) {
        if (!target || target.status === 'dead') return false;
        if (this.actionStateMachine) this.actionStateMachine.cancel(target, 'cart');
        target.status = 'dead';
        target.hp = 0; // 체력을 명확하게 0으로 설정
        this.updateHpUI(target); // [FIX] 수레 탈 때 체력바도 즉시 0으로 갱신하여 UI 동기화
        target.atb = 0;
        target.roarStunned = false; // 포효 경직 상태 해제
        target.roarStunDuration = 0;
        if (this.callbacks.onTriggerRoarStun) this.callbacks.onTriggerRoarStun(target.index, false); // [FIX] 포효 UI 강제 해제
        target.stunDuration = 0; // 일반 기절 상태 해제
        if (this.callbacks.onTriggerStunUI) this.callbacks.onTriggerStunUI(target.index, false); // [FIX] 기절 UI 강제 해제
        target.hitDuration = 0; // 피격 경직 상태 해제
        target.rollDuration = 0;
        target.guardDuration = 0;
        target.itemDuration = 0;
        if (this.blightRuntime) this.blightRuntime.clear(target);
        target.attackDuration = 0;
        target.isGathering = false;
        this.updateWeaponAtbUI(target.index, 0); // UI 게이지 초기화
        this.cartCount++;
        target.cartCount = Number(target.cartCount || 0) + 1;
        target.cartTimer = this.perkRuntime ? this.perkRuntime.cartRecoveryTicks(target, 50) : 50;
        if (this.cartCount >= this.cartLimit) {
            this.questFailCinematicTicks = 36;
            this.pendingMonsterAction = null;
            this.monsterAtb = 0;
        }
        this.updateCartUI(this.cartCount, this.cartLimit);
        this.addLog(`🚨 [수레행] ${target.name}이(가) 쓰러졌습니다! 5초 후 부활합니다. (현재 수레: ${this.cartCount}/${this.cartLimit})`, '#ff3b30');
        
        // 40% 확률로 사망 사운드 대신 "아이보!" 사운드 재생
        if (this.random() < 0.40) {
            this.playSFX('hunter_cart_voice', null, { hunterIndex: target.index, action: 'cart' });
        } else {
            this.playAudioFile('Unified_SFX/Player Fainted.mp3', 3500, 1, { hunterIndex: target.index, action: 'cart', voiceChance: 0.9, voiceVolume: 0.62 });
        }

        if (this.callbacks.onTriggerDeathTag) this.callbacks.onTriggerDeathTag(target.index, Math.ceil(target.cartTimer / 10));
        return true;
    }

    processTick() {
        return HuntBattleTickExecutor.execute(this);
    }

    prepareMonsterTurn() {
        return HuntMonsterTurnExecutor.prepare(this);
    }

    executeMonsterTurn(pattern = null) {
        return HuntMonsterTurnExecutor.execute(this, pattern);
    }

    getMonsterAttackType(attackName) {
        let type = 'physical';
        let emoji = '💥';

        if (/브레스|화염|불꽃|폭염|용암|번개|벼락|뇌격|전격|절대영도|얼음|빙결|냉기|수류|수압|포말|레이저|용속성|광룡|독액|점균|폭발|폭풍|회오리|파편 발사|포효|위협/.test(attackName)) {
            type = 'elemental';
        } else if (attackName.includes('독조강습') || attackName.includes('지중 급습') || attackName.includes('파멸의 일격') || attackName.includes('전뇌 펀치') || attackName.includes('등 찍기') || attackName.includes('빙벽 생성') || attackName.includes('얼음칼 찌르기')) {
            type = 'hybrid';
        }

        if (attackName.includes('화염') || attackName.includes('화룡') || attackName.includes('화염구')) {
            emoji = '🔥';
        } else if (attackName.includes('번개') || attackName.includes('뇌랑룡') || attackName.includes('전뇌') || attackName.includes('벼락')) {
            emoji = '⚡';
        } else if (attackName.includes('얼음') || attackName.includes('빙룡') || attackName.includes('빙벽') || attackName.includes('절대영도')) {
            emoji = '❄️';
        } else if (attackName.includes('수류') || attackName.includes('수압') || attackName.includes('포말') || attackName.includes('물')) {
            emoji = '🌊';
        } else if (attackName.includes('광룡') || attackName.includes('용속성')) {
            emoji = '🐉';
        } else if (attackName.includes('독조') || attackName.includes('독')) {
            emoji = '☠️';
        } else if (attackName.includes('폭풍') || attackName.includes('회오리') || attackName.includes('바람')) {
            emoji = '🌪️';
        } else if (attackName.includes('포효') || attackName.includes('위협') || attackName.includes('🔊')) {
            emoji = '🔊';
        } else if (attackName.includes('지중') || attackName.includes('가시') || attackName.includes('🪨')) {
            emoji = '🪨';
        }

        return { type, emoji };
    }

    getPreviousMonsterMaterial(monsterName) {
        return HuntMonsterRules.materialFor(monsterName, this.random);
    }

    recordMonsterPartDamage(weapon, rawDamage, action = null) {
        if (!this.monsterAnatomy || !this.monsterPartState.length || typeof HuntMonsterAnatomyCatalog === 'undefined') return null;
        const scale = Number(this.monsterAnatomy.baseHealth) > 0 && this.monsterMaxHp > 0
            ? Number(this.monsterAnatomy.baseHealth) / this.monsterMaxHp
            : 1;
        const perkDamage = this.perkRuntime ? this.perkRuntime.partDamage(weapon, rawDamage) : rawDamage;
        const strikeWeapon = action?.tags?.includes('blunt') ? { ...weapon, damageTypeOverride: 'blunt' } : weapon;
        const result = HuntMonsterAnatomyCatalog.applyPartDamage(this.monsterPartState, strikeWeapon, perkDamage, scale, this.random);
        if (result?.newlyBroken) {
            if (result.newlySevered) {
                this.severedTail.available = true;
                this.addLog(`✂️ [꼬리 절단] ${this.selectedMonster.nameKO}의 꼬리가 잘려 전장 어딘가에 떨어졌습니다!`, '#ff8f70');
                this.updateTailSeverUI(true, false);
            } else {
                this.addLog(`⚔ [부위 파괴] ${this.selectedMonster.nameKO} · ${result.part.kind}`, '#ffb347');
            }
        }
        return result;
    }

    updateTailSeverUI(visible, carved) {
        if (this.callbacks.onUpdateTailSeverUI) this.callbacks.onUpdateTailSeverUI(visible, carved, this.severedTail?.displayName || `${this.selectedMonster.nameKO} 꼬리`);
    }

    updateHunterCommandQueueUI(hunter) {
        if (this.callbacks.onUpdateHunterCommandQueueUI) this.callbacks.onUpdateHunterCommandQueueUI(hunter);
    }

    consumeTrapDuration(baseTicks) {
        const multipliers = [1, .7, .45, .25];
        const multiplier = multipliers[Math.min(this.monsterTrapUseCount, multipliers.length - 1)];
        this.monsterTrapUseCount++;
        return Math.max(10, Math.round(Number(baseTicks || 0) * multiplier));
    }

    isMonsterTrapImmune() {
        return HuntMonsterRules.isTrapImmune(this.selectedMonster, this.monsterTier);
    }

    triggerHitAnimation(idx, damage) {
        if (this.callbacks.onTriggerHitAnimation) this.callbacks.onTriggerHitAnimation(idx, damage);
    }

    addMonsterStun(hunter, stunValue, partResult = null) {
        const partKind = String(partResult?.part?.kind || '');
        const hitHead = /(^|[-_])(head|horn|chin)([-_]|$)/.test(partKind);
        if (!hitHead || Number(stunValue || 0) <= 0 || this.monsterHp <= 0) return false;
        const amount = this.perkRuntime ? this.perkRuntime.stunValue(hunter, stunValue) : Number(stunValue);
        this.monsterStunAccum = Math.max(0, Number(this.monsterStunAccum || 0) + amount);
        if (this.monsterStunDuration > 0 || this.monsterStunAccum < this.monsterStunThreshold) return false;
        this.pendingMonsterAction = null;
        this.monsterStunDuration = 60;
        this.monsterState = 'stunned';
        this.monsterAtb = 0;
        this.updateMonsterAtbUI(0);
        this.updateMonsterStateUI('기절 상태', `💫 기절한 ${this.selectedMonster.nameKO} 💫`, { color: '#e58e26', bg: 'rgba(229,142,38,0.1)' });
        this.showSkillBubble('monster', '💫 머리 타격 · 기절!');
        this.addLog(`💫 [기절] ${hunter.hunterName || hunter.name}의 머리 타격으로 기절치가 한계에 도달했습니다! (6초)`, '#e58e26');
        return true;
    }

    checkMonsterKnockdown() {
        const crossedThresholds = HuntMonsterRules.crossedKnockdownThresholds(
            this.monsterHp,
            this.monsterMaxHp,
            this.monsterKnockdownTriggered,
            this.selectedMonster.id
        );
        crossedThresholds.forEach(threshold => {
            this.monsterKnockdownTriggered[threshold] = true;
        });

        if (crossedThresholds.length) {
            this.monsterKnockdownDuration = Math.max(Number(this.monsterKnockdownDuration || 0), 70);
            this.monsterStunDuration = 0;
            this.monsterState = 'knocked_down';
            this.monsterAtb = 0;
            this.updateMonsterAtbUI(0);
            this.updateMonsterStateUI('대경직 상태', `💤 대경직에 쓰러진 ${this.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
            
            if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();
            
            // Verified monster-stun audio will be added when a labelled event is available.
            this.addLog(`💤 [대경직] ${this.selectedMonster.nameKO}이(가) 큰 충격으로 대경직에 걸려 쓰러졌습니다! 행동 게이지가 초기화되며 7초간 무력화됩니다.`, '#ff9500');
        }
    }

    executeHunterTurn(w) {
        return HuntHunterTurnExecutor.execute(this, w);
    }

    executeValstraxChargeSuccess() {
        return HuntValstraxExecutor.executeChargeSuccess(this);
    }

    triggerValstraxChargeInterrupt() {
        return HuntValstraxExecutor.triggerChargeInterrupt(this);
    }

    executeValstraxAmbushLanding() {
        return HuntValstraxExecutor.executeAmbushLanding(this);
    }

    triggerEncounterRoar() {
        this.triggerMonsterRoarFlinch(true);
    }

    triggerMonsterRoarFlinch(isEncounter = false) {
        if (this.monsterTier === 'small') {
            this.monsterRoarDuration = 0;
            this.selectedWeapons.forEach(hunter => {
                hunter.roarStunned = false;
                hunter.roarStunDuration = 0;
            });
            return false;
        }
        // 몬스터 포효 트리거
        this.triggerMonsterRoar(this.selectedMonster);
        
        // 포효 시전 중 몬스터도 멈춤 (느림 약 4.5초)
        this.monsterRoarDuration = 45;
        this.monsterAtb = 0;
        this.updateMonsterAtbUI(this.monsterAtb);

        if (isEncounter) {
            this.playAudioFile('Unified_SFX/Encounter.mp3');
            this.addLog(`🔊 [조우 포효] ${this.selectedMonster.nameKO}이(가) 침입자를 발견하고 강력한 포효를 지릅니다!`, '#c98534');
        } else {
            this.playAudioFile('Unified_SFX/Encounter.mp3');
            this.addLog(`😡 [분노 포효] 격노한 ${this.selectedMonster.nameKO}이(가) 대지진 포효를 내뿜으며 격렬하게 소리칩니다!`, '#ff3b30');
        }

        // 헌터들의 포효 대처 판정 (회피 / 가드 / 간파베기)
        this.selectedWeapons.forEach(w => {
            if (w.status !== 'alive') return;
            if (Number(w.jumpInvulnerableTicks || 0) > 0) return;

            const defendRoll = this.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;

            const actionAllowsGuard = this.actionStateMachine.canGuard(w);
            const actionAllowsEvade = this.actionStateMachine.canEvade(w);
            const isGreatSwordCharging = w.id === 'great_sword' && (
                Number(w.greatSwordCharge || 0) > 0
                || w.currentAction?.tags?.includes('charge')
                || /great_sword\.(?:strong_|true_)?charge_/.test(String(w.currentAction?.id || ''))
            );
            const hasShield = actionAllowsGuard && !isGreatSwordCharging
                && (w.type === 'shield' || w.id === 'heavy_bowgun');
            let guardProb = actionAllowsGuard ? 0.62 : 0;
            let dodgeProb = actionAllowsEvade ? 0.48 : 0;

            let foresightProb = 0.55;
            if (w.personality === 'veteran') {
                guardProb = 0.78;
                dodgeProb = 0.75;
                foresightProb = 0.78;
            } else if (w.personality === 'newbie') {
                guardProb = 0.30;
                dodgeProb = 0.22;
                foresightProb = 0.20;
            }
            const perkModifiers = w.perkModifiers || {};
            guardProb += Number(perkModifiers.guardChance || 0);
            dodgeProb += Number(perkModifiers.evadeChance || 0);
            if (!actionAllowsGuard) guardProb = 0;
            if (!actionAllowsEvade) dodgeProb = 0;

            const canForesight = this.actionStateMachine.canCounter(w, 'foresight');
            const ignoresRoar = this.perkRuntime && this.perkRuntime.roarDuration(w, 45) === 0;
            if (ignoresRoar) {
                isDodge = true;
                this.showSkillBubble(w.index, '🔇 귀마개');
            } else if (w.id === 'long_sword' && canForesight && defendRoll < foresightProb) {
                isDodge = true;
                isForesightSlash = true;
                w.spiritLevel = Math.min(3, (w.spiritLevel || 0) + 1);
            } else if (hasShield && defendRoll < guardProb) {
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                isDodge = true;
            }

            if (isGreatSwordCharging && (isGuard || isDodge)) {
                if (this.weaponMechanics?.onHit) this.weaponMechanics.onHit(w);
                else { w.greatSwordCharge = 0; w.greatSwordChain = 0; }
                this.actionStateMachine.cancel(w, 'idle');
                this.callbacks.onInterruptWeaponVisual?.(w.index);
            }

            if (isForesightSlash) {
                this.addLog(`⚡ [간파베기] ${w.name}이(가) 몬스터의 포효를 간파하고 기인 게이지를 쌓았습니다!`, '#c98534');
                this.playSFX('hunter_guard', null, { hunterIndex: w.index, action: 'guard' });
                this.showSkillBubble(w.index, "간파베기!");
                this.shakeWeapon(w.index, '#c98534');
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(w.index);
                w.rollDuration = 6;
            } else if (isGuard) {
                this.actionStateMachine.cancel(w, 'guard');
                this.addLog(`🛡️ [방패 가드] ${w.name}이(가) 포효를 방패로 막아내며 흔들림 없이 버팁니다!`, '#00ffff');
                this.playSFX('hunter_guard', null, { hunterIndex: w.index, action: 'guard' });
                this.showSkillBubble(w.index, "가드!");
                this.shakeWeapon(w.index, '#00ffff');
                if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(w.index);
                w.guardDuration = 6;
            } else if (isDodge) {
                this.actionStateMachine.cancel(w, 'evade');
                this.addLog(`🌀 [프레임 회피] ${w.name}이(가) 구르기 무적 시간으로 포효의 음파를 피해냈습니다!`, '#2eff7b');
                this.playSFX('hunter_evade', null, { hunterIndex: w.index, action: 'evade' });
                this.showSkillBubble(w.index, "회피!");
                this.shakeWeapon(w.index, '#2eff7b', false, null, true);
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(w.index);
                w.rollDuration = 6;
            } else {
                this.actionStateMachine.cancel(w, 'roar_stun');
                // 대처 실패: 귀막기 경직 45틱 (4.5초)
                w.roarStunned = true;
                w.roarStunDuration = 45;
                w.atb = 0;
                this.updateWeaponAtbUI(w.index, 0);
                this.addLog(`🙉 [귀막기 경직] ${w.name}이(가) 포효를 피하지 못해 귀를 막고 괴로워합니다! 행동 게이지가 초기화되며 4.5초간 행동 불능이 됩니다.`, '#ff3b30');
                if (this.callbacks.onTriggerRoarStun) this.callbacks.onTriggerRoarStun(w.index, true);
            }
        });
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntEngine;
} else {
    window.HuntEngine = HuntEngine;
}
