class HuntEngine {
    static CART_CAMP_TICKS = 300;

    constructor(config) {
        this.selectedWeapons = config.selectedWeapons;
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
        this.monsterTraitRuntime = config.monsterTraitRuntime || (typeof HuntMonsterTraitRuntime !== 'undefined' ? new HuntMonsterTraitRuntime(this.random) : null);
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
        this.colossalPhaseRuntime = this.monsterTier === 'colossal' && typeof HuntColossalPhaseRuntime !== 'undefined'
            ? new HuntColossalPhaseRuntime()
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
        this.monsterDeathCuePlayed = Boolean(config.monsterDeathCuePlayed);
        this.monsterTrapUseCount = Math.max(0, Number(config.monsterTrapUseCount || 0));
        this.monsterFlashUseCount = Math.max(0, Number(config.monsterFlashUseCount || 0));
        this.monsterKnockdownTriggered = config.monsterKnockdownTriggered || { 80: false, 60: false, 40: false, 20: false };
        this.monsterRecoveryDuration = 0;
        this.pendingMonsterAction = config.pendingMonsterAction || null;
        this.pendingMonsterImpact = config.pendingMonsterImpact || null;
        this.monsterBurrowState = config.monsterBurrowState || null;
        this.monsterActionLockTicks = Math.max(0, Number(config.monsterActionLockTicks || 0));
        this.monsterActionGateDiagnostics = Array.isArray(config.monsterActionGateDiagnostics)
            ? config.monsterActionGateDiagnostics.slice(-24)
            : [];
        this.monsterTraversalGeneration = Math.max(0, Number(config.monsterTraversalGeneration || 0));
        this.monsterTraversalState = config.monsterTraversalState || null;
        this.monsterRageOpenerRetryTicks = Math.max(0, Number(config.monsterRageOpenerRetryTicks || 0));
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
        if (this.monsterTraitRuntime) this.monsterTraitRuntime.initialize(this);
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
            w.pendingSharpnessRestore = false;
            w.attackDuration = 0;
            w.currentAction = null;
            w.actionState = 'idle';
            w.isGathering = false;
        });
        this.sharedSupply = config.sharedSupply && typeof HuntSharedSupply !== 'undefined'
            ? HuntSharedSupply.bindHunters(this.selectedWeapons, config.sharedSupply)
            : null;
        this.updateMonsterPartsUI();
    }

    snapshotSharedSupply() {
        return this.sharedSupply && typeof HuntSharedSupply !== 'undefined'
            ? HuntSharedSupply.normalize(this.sharedSupply)
            : null;
    }

    isMonsterTargetable() {
        return typeof HuntMonsterRules !== 'undefined'
            ? HuntMonsterRules.isTargetable(this)
            : !this.monsterBurrowState && !this.monsterTraversalState?.untargetable;
    }

    beginMonsterTraversal(kind, ticks, options = {}) {
        const generation = ++this.monsterTraversalGeneration;
        this.monsterActionLockTicks = Math.max(
            Number(this.monsterActionLockTicks || 0),
            Math.max(1, Number(ticks || 1))
        );
        this.monsterTraversalState = {
            kind: String(kind || 'movement'),
            generation,
            untargetable: Boolean(options.untargetable),
            remainingTicks: Math.max(1, Number(ticks || 1))
        };
        return generation;
    }

    clearMonsterTraversal(reason = 'complete') {
        const previous = this.monsterTraversalState;
        this.monsterTraversalState = null;
        this.monsterActionLockTicks = 0;
        this.monsterTraversalGeneration++;
        this.callbacks?.onResetMonsterMotion?.(reason);
        return previous;
    }

    interruptMonsterMovement(reason = 'interrupted') {
        const interrupted = {
            pendingAction: this.pendingMonsterAction,
            pendingImpact: this.pendingMonsterImpact,
            burrow: this.monsterBurrowState,
            traversal: this.monsterTraversalState
        };
        this.pendingMonsterAction = null;
        this.pendingMonsterImpact = null;
        const interruptedPattern = interrupted.pendingImpact?.pattern || interrupted.pendingAction?.pattern;
        if (interruptedPattern?.tags?.includes('rage-opener')
            && this.monsterFlightState !== 'airborne') {
            this.monsterRageOpenerRetryTicks = Number(
                this.monsterBehavior?.rageOpenerRetryTicks || 450
            );
        }
        if (this.monsterBurrowState) {
            this.monsterBurrowState = null;
            this.callbacks?.onTriggerMonsterBurrowPhase?.('cancel', null, 0);
        }
        this.clearMonsterTraversal(reason);
        return interrupted;
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

    shakeWeapon(idx, borderClr, isAttack, actionOrName, isDodge = false, hitContext = null) {
        if (this.callbacks.onShakeWeapon) {
            this.callbacks.onShakeWeapon(idx, borderClr, isAttack, actionOrName, isDodge, hitContext);
        }
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

    updateMonsterPartsUI() {
        if (!this.callbacks.onUpdateMonsterPartsUI || typeof HuntMonsterAnatomyCatalog === 'undefined') return;
        this.callbacks.onUpdateMonsterPartsUI(HuntMonsterAnatomyCatalog.partDisplaySlots(this.monsterPartState));
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

    spawnEmojiBubble(idx, emoji, options = {}) {
        if (this.callbacks.onSpawnEmojiBubble) this.callbacks.onSpawnEmojiBubble(idx, emoji, options);
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

        if (!this.sharedSupply) {
            hunter.potions = 10
                + (perks.has('버섯 애호가') ? 1 : 0)
                + (perks.has('벌꿀 주세요') ? 2 : 0);
            hunter.lifepowders = 1 + (perks.has('광역 분진') ? 1 : 0);
            if (perks.has('보급관')) hunter.lifepowders++;
            hunter.shockTraps = baseTraps;
            hunter.bombs = 1 + (perks.has('폭파광') ? 2 : 0);
            if (perks.has('폭탄 배달부')) hunter.bombs++;
            if (perks.has('수레 단골')) hunter.potions++;
        }
        hunter.perkTraps = perks.has('덫 장인') ? 2 : 0;
        hunter.perkFlashes = perks.has('섬광 조제사') ? 2 : 0;
        const supportItemPolicy = typeof HuntSupportItemPolicy !== 'undefined'
            ? HuntSupportItemPolicy
            : (typeof require === 'function' ? require('./HuntSupportItemPolicy') : null);
        hunter.flashPods = supportItemPolicy?.initialFlashCount(hunter.personality) || 0;

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
        this.interruptHunterItemAction(target, 'cart', { log: false });
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
        target.hitRecoveryTotalTicks = 0;
        target.hitReactionKind = null;
        target.hitKnockbackDirection = 0;
        target.pendingStunDuration = 0;
        this.callbacks.onCancelHitAnimation?.(target.index, 'cart');
        target.rollDuration = 0;
        target.guardDuration = 0;
        target.itemDuration = 0;
        if (this.blightRuntime) this.blightRuntime.clear(target);
        target.attackDuration = 0;
        target.isGathering = false;
        this.updateWeaponAtbUI(target.index, 0); // UI 게이지 초기화
        this.cartCount++;
        target.cartCount = Number(target.cartCount || 0) + 1;
        const baseCartTicks = HuntEngine.CART_CAMP_TICKS;
        target.cartTimer = this.perkRuntime
            ? this.perkRuntime.cartRecoveryTicks(target, baseCartTicks)
            : baseCartTicks;
        if (this.cartCount >= this.cartLimit) {
            this.questFailCinematicTicks = 36;
            this.pendingMonsterAction = null;
            this.pendingMonsterImpact = null;
            this.monsterAtb = 0;
        }
        this.updateCartUI(this.cartCount, this.cartLimit);
        this.addLog(`🚨 [수레행] ${target.name}이(가) 쓰러졌습니다! ${Math.ceil(target.cartTimer / 10)}초간 캠프로 이탈합니다. (현재 수레: ${this.cartCount}/${this.cartLimit})`, '#ff3b30');
        
        // 40% 확률로 사망 사운드 대신 "아이보!" 사운드 재생
        if (this.random() < 0.40) {
            this.playSFX('hunter_cart_voice', null, { hunterIndex: target.index, action: 'cart' });
        } else {
            this.playAudioFile('Unified_SFX/Player Fainted.mp3', 3500, 1, { hunterIndex: target.index, action: 'cart', voiceChance: 0.9, voiceVolume: 0.62 });
        }

        if (this.callbacks.onTriggerDeathTag) this.callbacks.onTriggerDeathTag(target.index, Math.ceil(target.cartTimer / 10));
        return true;
    }

    interruptHunterItemAction(hunter, reason = 'interrupted', options = {}) {
        if (!hunter?.pendingSharpnessRestore) return false;
        hunter.pendingSharpnessRestore = false;
        hunter.itemDuration = 0;
        hunter.isGathering = false;
        this.callbacks?.onCancelWhetstoneCue?.(hunter.index);
        if (options.log !== false) {
            const name = hunter.name || hunter.hunterName || '헌터';
            this.addLog(`💥 [숫돌질 실패] ${name}의 숫돌질이 방해받아 중단되었습니다.`, '#ff9f43');
        }
        return true;
    }

    processTick() {
        this.colossalPhaseRuntime?.update(this);
        return HuntBattleTickExecutor.execute(this);
    }

    prepareMonsterTurn() {
        return HuntMonsterTurnExecutor.prepare(this);
    }

    executeMonsterTurn(pattern = null, attackerIndex = null, targetIndex = null) {
        return HuntMonsterTurnExecutor.execute(this, pattern, attackerIndex, targetIndex);
    }

    applyHunterInterference(hunter, kind, size = 'small') {
        if (!hunter || hunter.status !== 'alive') return false;
        const pattern = { name: kind === 'tremor' ? '지진' : kind === 'wind' ? '풍압' : '포효', type: kind };
        const resistedBy = this.perkRuntime?.ignoresPattern?.(hunter, pattern)
            || (kind === 'roar' && this.perkRuntime?.roarDuration?.(hunter, 1) === 0 ? '귀마개' : null);
        if (resistedBy) {
            this.showSkillBubble(hunter.index, `🛡️ ${resistedBy}`);
            return false;
        }
        let foresightFailed = false;
        if (!hunter.pendingSharpnessRestore
            && hunter.id === 'long_sword'
            && typeof HuntMonsterTurnExecutor !== 'undefined') {
            const foresight = HuntMonsterTurnExecutor.resolveLongSwordForesight(this, hunter, 0, {
                defendRoll: this.random(),
                foresightProb: HuntMonsterTurnExecutor.longSwordForesightChance(hunter),
                isStunned: false,
                pattern: { id: `interference.${kind}`, type: kind, interference: { kind, size }, tags: ['interference'] }
            });
            if (foresight.success) {
                this.addLog(`⚡ [간파베기] ${hunter.name}이(가) ${kind === 'tremor' ? '지진' : kind === 'wind' ? '풍압' : '포효'} 판정을 흘리고 대회전베기를 준비합니다!`, '#c98534');
                this.playSFX('hunter_guard', null, { hunterIndex: hunter.index, action: 'counter' });
                this.showSkillBubble(hunter.index, '간파베기!');
                this.shakeWeapon(hunter.index, '#c98534', true, { id: 'long_sword.foresight' });
                return false;
            }
            foresightFailed = foresight.attempted;
        }
        if (kind !== 'roar' && !foresightFailed) {
            const actionAllowsGuard = !this.actionStateMachine || this.actionStateMachine.canGuard(hunter);
            const isGreatSwordCharging = typeof HuntMonsterTurnExecutor !== 'undefined'
                ? HuntMonsterTurnExecutor.isGreatSwordCharging(hunter)
                : hunter.id === 'great_sword' && Number(hunter.greatSwordCharge || 0) > 0;
            const hasShield = actionAllowsGuard && !isGreatSwordCharging
                && (hunter.type === 'shield' || hunter.id === 'heavy_bowgun');
            const baseGuard = hunter.personality === 'veteran' ? 0.78
                : hunter.personality === 'newbie' ? 0.30 : 0.62;
            const guardChance = Math.min(0.97, baseGuard + Number(hunter.perkModifiers?.guardChance || 0));
            if (hasShield && this.random() < guardChance) {
                this.actionStateMachine?.cancel(hunter, 'guard');
                hunter.guardDuration = 6;
                this.callbacks?.onTriggerGuardShake?.(hunter.index);
                this.showSkillBubble(hunter.index, '🛡️ 가드');
                this.playSFX('hunter_guard', null, { hunterIndex: hunter.index, action: 'guard' });
                return false;
            }
        }
        const config = typeof HuntAtbConfig !== 'undefined'
            ? HuntAtbConfig
            : (typeof require === 'function' ? require('./HuntAtbConfig.js') : null);
        const cost = config ? config.interferenceCostGauge(size) : (size === 'large' ? 100 : 50);
        this.interruptHunterItemAction(hunter, kind);
        this.actionStateMachine?.cancel(hunter, `${kind}_stun`);
        this.weaponMechanics?.onHit?.(hunter);
        this.callbacks?.onInterruptWeaponVisual?.(hunter.index);
        hunter.atb = Math.max(0, Number(hunter.atb || 0) - cost);
        hunter.interference = { kind, size };
        hunter.roarStunned = kind === 'roar';
        hunter.roarStunDuration = 0;
        this.updateWeaponAtbUI(hunter.index, hunter.atb);
        this.callbacks?.onTriggerHunterInterference?.(hunter.index, kind, size, true);
        return true;
    }

    clearHunterInterference(hunter) {
        if (!hunter?.interference) return false;
        const { kind, size } = hunter.interference;
        hunter.interference = null;
        hunter.roarStunned = false;
        hunter.roarStunDuration = 0;
        hunter.actionState = 'idle';
        this.callbacks?.onTriggerHunterInterference?.(hunter.index, kind, size, false);
        if (kind === 'roar') this.callbacks?.onTriggerRoarStun?.(hunter.index, false);
        this.perkRuntime?.onRecovered?.(hunter);
        return true;
    }

    getMonsterAttackType(attackName, pattern = null) {
        let type = 'physical';
        let emoji = '💥';
        const tags = new Set(Array.isArray(pattern?.tags) ? pattern.tags : []);
        const authoredType = String(pattern?.type || '').toLowerCase();
        const delivery = String(pattern?.delivery || '').toLowerCase();

        // Authored semantics beat legacy display-name inference. A party-wide
        // roar must never become one elemental beam per targeted hunter.
        if (authoredType === 'roar' || tags.has('roar')) {
            return { type: 'roar', emoji: '📣' };
        }

        const authoredElemental = tags.has('elemental')
            || ['projectile', 'beam', 'stream', 'gas', 'field', 'elemental'].includes(authoredType)
            || ['projectile', 'beam', 'stream', 'gas', 'field'].includes(delivery);
        if (authoredElemental
            || /브레스|화염|불꽃|폭염|용암|번개|벼락|뇌격|전격|절대영도|얼음|빙결|냉기|수류|수압|포말|레이저|용속성|광룡|독액|점균|폭발|폭풍|회오리|파편 발사|포효|위협/.test(attackName)) {
            type = 'elemental';
        } else if (attackName.includes('독조강습') || attackName.includes('지중 급습') || attackName.includes('파멸의 일격') || attackName.includes('전뇌 펀치') || attackName.includes('등 찍기') || attackName.includes('빙벽 생성') || attackName.includes('얼음칼 찌르기')) {
            type = 'hybrid';
        }

        if (tags.has('fire') || pattern?.element === 'fire'
            || attackName.includes('화염') || attackName.includes('화룡') || attackName.includes('화염구')) {
            emoji = '🔥';
        } else if (tags.has('thunder') || pattern?.element === 'thunder'
            || attackName.includes('번개') || attackName.includes('뇌랑룡') || attackName.includes('전뇌') || attackName.includes('벼락')) {
            emoji = '⚡';
        } else if (tags.has('ice') || pattern?.element === 'ice'
            || attackName.includes('얼음') || attackName.includes('빙룡') || attackName.includes('빙벽') || attackName.includes('절대영도')) {
            emoji = '❄️';
        } else if (tags.has('water') || pattern?.element === 'water'
            || attackName.includes('수류') || attackName.includes('수압') || attackName.includes('포말') || attackName.includes('물')) {
            emoji = '🌊';
        } else if (tags.has('dragon') || pattern?.element === 'dragon'
            || attackName.includes('광룡') || attackName.includes('용속성')) {
            emoji = '🐉';
        } else if (tags.has('poison') || pattern?.element === 'poison'
            || attackName.includes('독조') || attackName.includes('독')) {
            emoji = '☠️';
        } else if (tags.has('wind') || pattern?.element === 'wind'
            || attackName.includes('폭풍') || attackName.includes('회오리') || attackName.includes('바람')) {
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
        const scale = HuntMonsterAnatomyCatalog.partDamageScale(
            this.monsterPartState,
            this.monsterMaxHp
        );
        const perkDamage = this.perkRuntime ? this.perkRuntime.partDamage(weapon, rawDamage) : rawDamage;
        const strikeWeapon = action?.tags?.includes('blunt') ? { ...weapon, damageTypeOverride: 'blunt' } : weapon;
        const result = HuntMonsterAnatomyCatalog.applyPartDamage(this.monsterPartState, strikeWeapon, perkDamage, scale, this.random);
        if (result?.newlyBroken) {
            const atbConfig = typeof HuntAtbConfig !== 'undefined'
                ? HuntAtbConfig
                : require('./HuntAtbConfig.js');
            const partBreakAtb = atbConfig.monsterAtbAfterPartBreak(this.monsterAtb);
            this.monsterTraitRuntime?.refresh?.(this);
            this.updateMonsterPartsUI();
            if (result.newlySevered) {
                this.severedTail.available = true;
                this.addLog(`✂️ [꼬리 절단] ${this.selectedMonster.nameKO}의 꼬리가 잘려 전장 어딘가에 떨어졌습니다!`, '#ff8f70');
                this.updateTailSeverUI(true, false);
            } else {
                this.addLog(`⚔ [부위 파괴] ${this.selectedMonster.nameKO} · ${result.part.kind}`, '#ffb347');
            }
            const airborne = this.monsterFlightState === 'airborne' || this.monsterState === 'valstrax_flying';
            const reaction = HuntMonsterAnatomyCatalog.breakReaction(
                this.selectedMonster.id,
                result.part.kind,
                airborne
            );
            if (airborne && this.monsterFlightRuntime?.onPartBreak(
                this,
                result.part,
                reaction,
                { retainedAtb: partBreakAtb }
            )) {
                result.reaction = reaction;
                return result;
            }
            this.interruptMonsterMovement(`part-break:${result.part.kind}`);
            this.monsterKnockdownDuration = Math.max(
                Number(this.monsterKnockdownDuration || 0),
                Number(reaction.durationTicks || 0)
            );
            this.monsterState = 'knocked_down';
            this.monsterAtb = partBreakAtb;
            this.monsterPartReactionKind = reaction.visualType || reaction.type;
            this.playSFX?.(
                result.newlySevered ? 'monster_knockdown' : 'monster_flinch',
                null,
                {
                    monsterId: this.selectedMonster.id,
                    sourcePart: result.part.kind
                }
            );
            this.updateMonsterAtbUI(this.monsterAtb);
            if (this.callbacks.onTriggerMonsterPartBreakReaction) {
                this.callbacks.onTriggerMonsterPartBreakReaction(
                    this.monsterPartReactionKind,
                    Number(reaction.durationTicks || 0),
                    result.part.kind
                );
            } else {
                this.callbacks.onTriggerMonsterKnockdownAnim?.();
            }
            result.reaction = reaction;
        }
        return result;
    }

    updateTailSeverUI(visible, carved) {
        if (this.callbacks.onUpdateTailSeverUI) this.callbacks.onUpdateTailSeverUI(visible, carved, this.severedTail?.displayName || `${this.selectedMonster.nameKO} 꼬리`);
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

    triggerHitAnimation(idx, reaction) {
        if (this.callbacks.onTriggerHitAnimation) this.callbacks.onTriggerHitAnimation(idx, reaction);
    }

    cancelHunterHitRecovery(target, reason = 'cancelled') {
        if (!target) return;
        target.hitDuration = 0;
        target.hitRecoveryTotalTicks = 0;
        target.hitReactionKind = null;
        target.hitKnockbackDirection = 0;
        target.pendingStunDuration = 0;
        this.callbacks.onCancelHitAnimation?.(target.index, reason);
    }

    enterMonsterControlState(kind, durationTicks, options = {}) {
        const states = {
            stun: {
                state: 'stunned',
                stateName: '기절 상태',
                title: `💫 기절한 ${this.selectedMonster.nameKO} 💫`,
                color: '#e58e26',
                bg: 'rgba(229,142,38,.12)'
            },
            paralysis: {
                state: 'paralyzed',
                stateName: '마비 상태',
                title: `⚡ 마비된 ${this.selectedMonster.nameKO} ⚡`,
                color: '#ffe66d',
                bg: 'rgba(255,230,109,.14)'
            },
            sleep: {
                state: 'sleeping',
                stateName: '수면 상태',
                title: `💤 잠든 ${this.selectedMonster.nameKO} 💤`,
                color: '#8fd7ff',
                bg: 'rgba(143,215,255,.14)'
            }
        };
        const config = states[kind];
        if (!config || this.monsterHp <= 0) return false;
        const duration = Math.max(1, Number(durationTicks || 1));
        const wasAirborne = Boolean(this.monsterFlightRuntime?.groundForStatus(this, kind));

        this.interruptMonsterMovement(`status:${kind}`);
        this.monsterAtb = 0;
        this.monsterControlStateKind = kind;
        if (kind === 'stun') {
            this.monsterStunDuration = Math.max(Number(this.monsterStunDuration || 0), duration);
            this.monsterKnockdownDuration = 0;
        } else {
            this.monsterStunDuration = 0;
            this.monsterKnockdownDuration = Math.max(Number(this.monsterKnockdownDuration || 0), duration);
        }
        this.monsterState = config.state;
        this.updateMonsterAtbUI(0);
        this.updateMonsterStateUI(config.stateName, config.title, {
            color: config.color,
            bg: config.bg
        });
        if (wasAirborne) {
            this.addLog(`🪽 [강제 착지] ${this.selectedMonster.nameKO}(이)가 공중에서 ${config.stateName.replace(' 상태', '')}에 걸려 즉시 추락했습니다.`, config.color);
        }
        return true;
    }

    addMonsterStun(hunter, stunValue, partResult = null) {
        const partKind = String(partResult?.part?.kind || '');
        const hitHead = /(^|[-_])(head|horn|chin)([-_]|$)/.test(partKind);
        if (!hitHead || Number(stunValue || 0) <= 0 || this.monsterHp <= 0) return false;
        const amount = this.perkRuntime ? this.perkRuntime.stunValue(hunter, stunValue) : Number(stunValue);
        this.monsterStunAccum = Math.max(0, Number(this.monsterStunAccum || 0) + amount);
        if (this.monsterStunDuration > 0 || this.monsterStunAccum < this.monsterStunThreshold) return false;
        this.enterMonsterControlState('stun', 60, { source: 'head-damage' });
        this.showSkillBubble('monster', '💫 머리 타격 · 기절!');
        this.addLog(`💫 [기절] ${hunter.hunterName || hunter.name}의 머리 타격으로 기절치가 한계에 도달했습니다! (6초)`, '#e58e26');
        return true;
    }

    checkMonsterKnockdown() {
        // Compatibility entry point. HP thresholds no longer invent a
        // knockdown; authored part breaks, KO, status, traps and patterns own it.
        return false;
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
        if (this.monsterTier === 'small' || this.selectedMonster?.roar?.status !== 'verified-present') {
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
        this.monsterRoarDuration = 12;
        this.updateMonsterAtbUI(this.monsterAtb);

        if (isEncounter) {
            this.addLog(`🔊 [조우 포효] ${this.selectedMonster.nameKO}이(가) 침입자를 발견하고 강력한 포효를 지릅니다!`, '#c98534');
        } else {
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

            let foresightProb = typeof HuntMonsterTurnExecutor !== 'undefined'
                ? HuntMonsterTurnExecutor.longSwordForesightChance(w)
                : 0.75;
            if (w.personality === 'veteran') {
                guardProb = 0.78;
                dodgeProb = 0.75;
            } else if (w.personality === 'newbie') {
                guardProb = 0.30;
                dodgeProb = 0.22;
            }
            const perkModifiers = w.perkModifiers || {};
            guardProb += Number(perkModifiers.guardChance || 0);
            dodgeProb += Number(perkModifiers.evadeChance || 0);
            if (!actionAllowsGuard) guardProb = 0;
            if (!actionAllowsEvade) dodgeProb = 0;

            const ignoresRoar = this.perkRuntime && this.perkRuntime.roarDuration(w, 45) === 0;
            const foresight = !ignoresRoar && w.id === 'long_sword' && typeof HuntMonsterTurnExecutor !== 'undefined'
                ? HuntMonsterTurnExecutor.resolveLongSwordForesight(this, w, 0, {
                    defendRoll,
                    foresightProb,
                    isStunned: false,
                    pattern: { id: 'monster.roar', type: 'roar', tags: ['interference'] }
                })
                : { attempted: false, success: false };
            if (ignoresRoar) {
                isDodge = true;
                this.showSkillBubble(w.index, '🔇 귀마개');
            } else if (foresight.success) {
                isDodge = true;
                isForesightSlash = true;
            } else if (!foresight.attempted && hasShield && defendRoll < guardProb) {
                isGuard = true;
            } else if (!foresight.attempted && !hasShield && defendRoll < dodgeProb) {
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
                this.applyHunterInterference(
                    w,
                    'roar',
                    this.monsterBehavior?.roarSize === 'small' ? 'small' : 'large'
                );
                this.addLog(`🙉 [포효·대] ${w.name}이(가) 귀를 막고 괴로워합니다! ATB를 모두 잃고 회복할 때까지 행동할 수 없습니다.`, '#ff3b30');
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
