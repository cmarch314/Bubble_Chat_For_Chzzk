class HuntEngine {
    static CART_CAMP_TICKS = 300;
    static STANDARD_GUARD_LABEL = '가드!';

    static personalityProfiles() {
        if (typeof HuntPersonalityProfiles !== 'undefined') return HuntPersonalityProfiles;
        if (typeof require === 'function') return require('./HuntPersonalityProfiles.js');
        return null;
    }

    constructor(config) {
        this.selectedWeapons = config.selectedWeapons;
        this.selectedMonster = config.selectedMonster;
        this.monsterHabitatId = String(config.monsterHabitatId || 'arena');
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
        const BeatActionRuntime = typeof HuntBeatActionRuntime !== 'undefined'
            ? HuntBeatActionRuntime
            : (typeof require === 'function' ? require('./HuntBeatActionRuntime.js') : null);
        const CombatJudgmentRuntime = typeof HuntCombatJudgmentRuntime !== 'undefined'
            ? HuntCombatJudgmentRuntime
            : (typeof require === 'function' ? require('./HuntCombatJudgmentRuntime.js') : null);
        const CombatJudgmentResolver = typeof HuntCombatJudgmentResolver !== 'undefined'
            ? HuntCombatJudgmentResolver
            : (typeof require === 'function' ? require('./HuntCombatJudgmentResolver.js') : null);
        this.monsterBeatRuntimeEvents = [];
        this.combatJudgmentRuntime = config.combatJudgmentRuntime
            || (CombatJudgmentRuntime ? new CombatJudgmentRuntime() : null);
        this.combatJudgmentResolver = config.combatJudgmentResolver
            || (CombatJudgmentResolver ? new CombatJudgmentResolver() : null);
        this.hunterBeatRuntimeEvents = new Map();
        this.monsterBeatRuntime = config.monsterBeatRuntime || (BeatActionRuntime
            ? new BeatActionRuntime({
                onEvent: (state, event) => {
                    if (String(state.actorKey).startsWith('hunter:')) {
                        const hunterIndex = Number(state.context?.hunterIndex);
                        const queue = this.hunterBeatRuntimeEvents.get(hunterIndex) || [];
                        queue.push(event);
                        if (queue.length > 32) queue.shift();
                        this.hunterBeatRuntimeEvents.set(hunterIndex, queue);
                        this.confirmPendingHunterPartImpact?.(
                            hunterIndex,
                            state.context?.action?.id,
                            event
                        );
                    } else {
                        this.monsterBeatRuntimeEvents.push(event);
                        if (this.monsterBeatRuntimeEvents.length > 64) this.monsterBeatRuntimeEvents.shift();
                        this.dispatchMonsterBeatEvent?.(state, event);
                    }
                },
                onComplete: state => {
                    if (String(state.actorKey).startsWith('hunter:')) {
                        this.callbacks?.onHunterBeatActionComplete?.(state.action, state.context);
                    } else {
                        this.combatJudgmentRuntime?.complete?.(state.actorKey);
                        this.callbacks?.onMonsterBeatActionComplete?.(state.action, state.context);
                    }
                },
                onCancel: (state, reason) => {
                    if (String(state.actorKey).startsWith('hunter:')) {
                        this.callbacks?.onHunterBeatActionCancel?.(state.action, reason, state.context);
                    } else {
                        this.combatJudgmentRuntime?.cancel?.(state.actorKey, reason);
                        this.callbacks?.onMonsterBeatActionCancel?.(state.action, reason, state.context);
                    }
                }
            })
            : null);
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
        this.teamIntentCoordinator = config.teamIntentCoordinator
            || (typeof HuntTeamIntentCoordinator !== 'undefined' ? new HuntTeamIntentCoordinator() : null);
        
        // Monster Stats
        this.monsterTier = config.monsterTier || 'normal';
        this.monsterHp = config.monsterHp || 15600;
        this.monsterMaxHp = config.monsterMaxHp || 15600;
        this.monsterSpeedMultiplier = config.monsterSpeedMultiplier !== undefined ? config.monsterSpeedMultiplier : 1.0;
        const DifficultyProfile = typeof HuntDifficultyProfile !== 'undefined'
            ? HuntDifficultyProfile
            : (typeof require === 'function' ? require('./HuntDifficultyProfile.js') : null);
        this.difficultyProfile = DifficultyProfile
            ? DifficultyProfile.normalize(config.difficultyProfile)
            : Object.freeze({ id: 'standard', monsterDamageMultiplier: 1, rewardMultiplier: 1 });
        this.monsterAtbSpeedMod = config.monsterAtbSpeedMod || 1.15;
        this.monsterAtb = Number.isFinite(Number(config.monsterAtb))
            ? Math.max(0, Math.min(HuntAtbConfig.GAUGE_MAX, Number(config.monsterAtb)))
            : HuntAtbConfig.monsterEncounterStartAtb();
        this.monsterState = config.monsterState || 'normal';
        this.monsterUltimateUsedInRage = Boolean(config.monsterUltimateUsedInRage);
        this.monsterSpeed = config.monsterSpeed || this.getMonsterSpeedForState(this.monsterState);
        this.monsterDamageMod = config.monsterDamageMod || 0.9;
        this.tierLabel = config.tierLabel || "대형 몬스터";
        this.smallMonsterSwarm = this.monsterTier === 'small' && typeof HuntSmallMonsterSwarm !== 'undefined'
            ? new HuntSmallMonsterSwarm(config.smallMonsterCount || 3, this.monsterMaxHp, this.monsterAtb)
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
        this.monsterStunCount = Math.max(0, Number(config.monsterStunCount || 0));
        this.monsterKnockdownDuration = config.monsterKnockdownDuration || 0;
        this.monsterControlEnteredAtTick = Number.isFinite(Number(config.monsterControlEnteredAtTick))
            ? Number(config.monsterControlEnteredAtTick) : null;
        this.monsterSleepGeneration = 0;
        this.monsterSleepWakeBatch = null;
        this.monsterDeathCuePlayed = Boolean(config.monsterDeathCuePlayed);
        this.monsterTrapUseCount = Math.max(0, Number(config.monsterTrapUseCount || 0));
        this.activeTrapControl = config.activeTrapControl || null;
        this.monsterFlashUseCount = Math.max(0, Number(config.monsterFlashUseCount || 0));
        this.monsterRecoveryDuration = 0;
        this.pendingMonsterAction = config.pendingMonsterAction || null;
        this.pendingMonsterImpact = config.pendingMonsterImpact || null;
        this.monsterActionPresentationTicks = Math.max(0, Number(config.monsterActionPresentationTicks || 0));
        this.pendingMonsterPartReactions = Array.isArray(config.pendingMonsterPartReactions)
            ? config.pendingMonsterPartReactions.slice() : [];
        this.pendingMonsterEncounterRoar = Boolean(config.pendingMonsterEncounterRoar);
        this.pendingMonsterRageRoar = Boolean(config.pendingMonsterRageRoar);
        this.pendingMonsterTransitionRoarKind = config.pendingMonsterTransitionRoarKind || null;
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
        const MonsterStaminaRuntime = typeof HuntMonsterStaminaRuntime !== 'undefined'
            ? HuntMonsterStaminaRuntime
            : (typeof require === 'function' ? require('./HuntMonsterStaminaRuntime.js') : null);
        this.monsterStaminaRuntime = config.monsterStaminaRuntime
            || (MonsterStaminaRuntime ? new MonsterStaminaRuntime() : null);
        this.monsterStaminaRuntime?.initialize?.(this, config.monsterStaminaProfile || {});
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
            ? HuntSharedSupply.normalize(config.sharedSupply)
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

    beginMonsterBeatAction(compiledAction, context = {}) {
        if (!compiledAction || compiledAction.backend !== 'beat-v2' || !this.monsterBeatRuntime) return null;
        this.monsterBeatRuntimeEvents.length = 0;
        this.monsterBeatRuntime.cancel?.('monster', 'replaced');
        const judgmentSession = Array.isArray(context.judgmentEvents)
            ? this.combatJudgmentRuntime?.begin?.('monster', compiledAction, context)
            : null;
        return this.monsterBeatRuntime.begin('monster', compiledAction, {
            ...context,
            actionSessionId: judgmentSession?.sessionId || null
        });
    }

    isMonsterActionSessionActive() {
        return Boolean(
            this.monsterBeatRuntime?.has?.('monster')
            || Number(this.monsterActionPresentationTicks || 0) > 0
            || this.pendingMonsterAction
            || this.pendingMonsterImpact
            || this.monsterTraversalState
            || this.monsterBurrowState
            || Number(this.monsterActionLockTicks || 0) > 0
        );
    }

    dispatchMonsterBeatEvent(state, event) {
        if (['damage', 'judgment', 'roar', 'tremor', 'wind'].includes(event?.kind)) {
            this.combatJudgmentRuntime?.observeBeatEvent?.(state.actorKey, event);
            return true;
        }
        if (event?.kind !== 'audio') return false;
        const pattern = state?.context?.pattern || null;
        const patternId = String(pattern?.id || state?.context?.patternId || state?.action?.id || '');
        if (!patternId) return false;
        return this.playSFX?.('monster_attack', null, {
            monsterId: this.selectedMonster?.id,
            patternId,
            patternName: pattern?.name || patternId,
            patternType: pattern?.type || 'attack',
            patternTags: pattern?.tags || [],
            patternSlot: `beat:${event.beatId}`,
            beatEventId: event.id,
            audioPhase: 'beat-event',
            overrideOnly: true
        }) || false;
    }

    tickMonsterBeatAction() {
        return this.monsterBeatRuntime?.tick?.('monster') || null;
    }

    drainCombatJudgments() {
        return this.combatJudgmentRuntime?.drain?.(command =>
            this.combatJudgmentResolver?.resolve?.(this, command)
        ) || [];
    }

    cancelMonsterBeatAction(reason = 'interrupted') {
        this.monsterBeatRuntimeEvents.length = 0;
        this.combatJudgmentRuntime?.cancel?.('monster', reason);
        return this.monsterBeatRuntime?.cancel?.('monster', reason) || false;
    }

    beginHunterBeatAction(hunter, action) {
        if (!hunter || !action || typeof HuntHunterBeatCatalog === 'undefined') return null;
        const compiled = HuntHunterBeatCatalog.compile(hunter.id, action);
        if (!compiled || !this.monsterBeatRuntime) return null;
        const actorKey = `hunter:${hunter.index}`;
        this.hunterBeatRuntimeEvents.set(hunter.index, []);
        return this.monsterBeatRuntime.begin(actorKey, compiled, { hunterIndex: hunter.index, action });
    }

    tickHunterBeatActions() {
        this.selectedWeapons.forEach(hunter => this.monsterBeatRuntime?.tick?.(`hunter:${hunter.index}`));
    }

    cancelHunterBeatAction(hunter, reason = 'interrupted') {
        if (!hunter) return false;
        this.hunterBeatRuntimeEvents.delete(hunter.index);
        return this.monsterBeatRuntime?.cancel?.(`hunter:${hunter.index}`, reason) || false;
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
        this.pendingMonsterTransitionRoarKind = null;
        this.cancelMonsterBeatAction(reason);
        // Presentation belongs to the interrupted action. Leaving this debt
        // alive lets a trap/control pose and the cancelled BEAT graph coexist.
        this.monsterActionPresentationTicks = 0;
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

    triggerEnvironmentEffect(kind, hunterIndex, details = null) {
        if (this.callbacks.onTriggerEnvironmentEffect) {
            this.callbacks.onTriggerEnvironmentEffect(kind, hunterIndex, details);
        }
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
            this.monsterSpeedMultiplier * this.monsterAtbSpeedMod,
            this.monsterBehavior
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
        const issuedRuntime = typeof HuntIssuedSupplyRuntime !== 'undefined'
            ? HuntIssuedSupplyRuntime
            : (typeof require === 'function' ? require('./HuntIssuedSupplyRuntime.js') : null);
        if (this.sharedSupply) issuedRuntime?.resupplyFromCamp?.(hunter, this.sharedSupply);
        else issuedRuntime?.grant?.(hunter, `camp:${Number(hunter.cartCount || 0)}`, { force: true });

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
        this.clearHunterInterference(target, 'cart');
        if (this.actionStateMachine) this.actionStateMachine.cancel(target, 'cart');
        this.cancelHunterBeatAction(target, 'cart');
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
        target.hitStartedThisTick = false;
        target.hitReactionKind = null;
        target.hitKnockbackDirection = 0;
        target.pendingStunDuration = 0;
        target.counterInvulnerabilityTicks = 0;
        target.counterInvulnerabilityStartedThisTick = false;
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
        this.perkRuntime?.onCart?.(target);
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
        if (!hunter || !['alive', 'stunned'].includes(hunter.status)) return false;
        const alreadyStunned = hunter.status === 'stunned';
        // A hunter already tumbling is invulnerable to follow-up judgments and
        // keeps that presentation until returning. Do not cover the tumble with
        // an earplug/tremor/wind badge while leaving its hidden immunity alive.
        // Stun is deliberately vulnerable, however; a stale overlapping tumble
        // timer must not turn KO into immunity against roar/tremor/wind.
        if (!alreadyStunned && Number(hunter.hitDuration || 0) > 0) return false;
        // Damage and control judgments share the same post-counter immunity.
        // A delayed tremor must not bypass the counter that answered the
        // preceding direct impact.
        if (!alreadyStunned && Number(hunter.counterInvulnerabilityTicks || 0) > 0
            && !(typeof HuntMonsterTurnExecutor !== 'undefined'
                && HuntMonsterTurnExecutor.hasFreshCounterAttempt?.(hunter))) return false;
        const pattern = { name: kind === 'tremor' ? '지진' : kind === 'wind' ? '풍압' : '포효', type: kind };
        const resistedBy = this.perkRuntime?.ignoresPattern?.(hunter, pattern)
            || (kind === 'roar' && this.perkRuntime?.roarDuration?.(hunter, 1) === 0 ? '귀마개' : null);
        if (resistedBy) {
            this.showSkillBubble(hunter.index, `🛡️ ${resistedBy}`);
            return false;
        }
        let foresightFailed = false;
        if (!alreadyStunned && !hunter.pendingSharpnessRestore
            && hunter.id === 'long_sword'
            && typeof HuntMonsterTurnExecutor !== 'undefined') {
            const foresight = HuntMonsterTurnExecutor.resolveLongSwordForesight(this, hunter, 0, {
                defendRoll: this.random(),
                foresightProb: HuntMonsterTurnExecutor.longSwordForesightChance(hunter),
                isStunned: false,
                pattern: { id: `interference.${kind}`, type: kind, interference: { kind, size }, tags: ['interference'] }
            });
            if (foresight.success) {
                HuntMonsterTurnExecutor.grantCounterInvulnerability?.(hunter);
                this.addLog(`⚡ [간파베기] ${hunter.name}이(가) ${kind === 'tremor' ? '지진' : kind === 'wind' ? '풍압' : '포효'} 판정을 흘리고 대회전베기를 준비합니다!`, '#c98534');
                this.playSFX('hunter_guard', null, { hunterIndex: hunter.index, action: 'counter' });
                this.showSkillBubble(hunter.index, '간파베기!');
                this.shakeWeapon(hunter.index, '#c98534', true, { id: 'long_sword.foresight' });
                return false;
            }
            foresightFailed = foresight.attempted;
            if (foresight.attempted && !foresight.success) {
                HuntMonsterTurnExecutor.clearCounterInvulnerability?.(hunter);
            }
        }
        if (!alreadyStunned && !foresightFailed) {
            const actionAllowsGuard = !this.actionStateMachine || this.actionStateMachine.canGuard(hunter);
            const isGreatSwordCharging = typeof HuntMonsterTurnExecutor !== 'undefined'
                ? HuntMonsterTurnExecutor.isGreatSwordCharging(hunter)
                : hunter.id === 'great_sword' && Number(hunter.greatSwordCharge || 0) > 0;
            const hasShield = actionAllowsGuard && !isGreatSwordCharging
                && (hunter.type === 'shield' || hunter.id === 'heavy_bowgun');
            const guaranteedLanceGuard = hunter.id === 'lance' && hasShield;
            const guardChance = HuntEngine.personalityProfiles()?.chance(hunter, 'guard') ?? .62;
            if (hasShield && (guaranteedLanceGuard || this.random() < guardChance)) {
                this.actionStateMachine?.cancel(hunter, 'guard');
                hunter.guardDuration = 6;
                this.presentHunterImpact(hunter.index, 'guard');
                this.showSkillBubble(hunter.index, HuntEngine.STANDARD_GUARD_LABEL);
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
        this.cancelHunterBeatAction(hunter, `${kind}_stun`);
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

    clearHunterInterference(hunter, reason = 'recovered') {
        if (!hunter || (!hunter.interference && !hunter.roarStunned)) return false;
        const kind = hunter.interference?.kind || 'roar';
        const size = hunter.interference?.size || 'large';
        hunter.interference = null;
        hunter.roarStunned = false;
        hunter.roarStunDuration = 0;
        hunter.actionState = 'idle';
        this.callbacks?.onTriggerHunterInterference?.(hunter.index, kind, size, false);
        if (kind === 'roar') this.callbacks?.onTriggerRoarStun?.(hunter.index, false);
        if (reason === 'recovered') this.perkRuntime?.onRecovered?.(hunter, kind);
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
        const previousPartState = new Map(this.monsterPartState.map(part => [part, {
            health: Number(part.health || 0),
            damageAccumulated: Number(part.damageAccumulated || 0),
            flinchAccumulated: Number(part.flinchAccumulated || 0),
            postBreakDamageAccumulated: Number(part.postBreakDamageAccumulated || 0),
            broken: Boolean(part.broken),
            severed: Boolean(part.severed),
            breakPending: Boolean(part.breakPending),
            hitzones: { ...(part.hitzones || {}) }
        }]));
        const scale = HuntMonsterAnatomyCatalog.partDamageScale(
            this.monsterPartState,
            this.monsterMaxHp
        );
        const perkDamage = this.perkRuntime ? this.perkRuntime.partDamage(weapon, rawDamage) : rawDamage;
        const strikeWeapon = action?.tags?.includes('blunt') ? { ...weapon, damageTypeOverride: 'blunt' } : weapon;
        const result = HuntMonsterAnatomyCatalog.applyPartDamage(
            this.monsterPartState,
            strikeWeapon,
            perkDamage,
            scale,
            this.random,
            part => this.perkRuntime?.partTargetWeight?.(weapon, part) || 1
        );
        if (result) {
            result.sourceHunterIndex = Number(weapon?.index);
            result.sourceActionId = String(action?.id || '');
            result.partStateBeforeImpact = previousPartState.get(result.part) || null;
            // Normal hunter turns author the real contact on their BEAT damage
            // event. Until that event is emitted, a break detected by the old
            // synchronous damage path is provisional and must be reversible if
            // roar, hitstun, or another control judgment cancels the swing.
            result.impactConfirmed = !result.sourceActionId || !this.monsterBeatRuntime;
        }
        if (result?.newlyBroken || result?.newlyFlinched || result?.repeatedTopple) {
            if (HuntEngine.prototype.isMonsterActionPresenting.call(this)) {
                if (result.newlyBroken) {
                    result.part.broken = false;
                    result.part.severed = false;
                    result.part.breakPending = true;
                    result.part.hitzones = { ...(result.previousHitzones || result.part.hitzones || {}) };
                }
                this.pendingMonsterPartReactions.push(result);
                result.reactionDeferred = true;
                return result;
            }
            HuntEngine.prototype.resolveMonsterPartReaction.call(this, result);
        }
        return result;
    }

    confirmPendingHunterPartImpact(hunterIndex, actionId, event) {
        if (event?.kind !== 'damage') return false;
        const sourceIndex = Number(hunterIndex);
        const sourceActionId = String(actionId || '');
        const result = this.pendingMonsterPartReactions?.find(candidate =>
            !candidate.impactConfirmed
            && Number(candidate.sourceHunterIndex) === sourceIndex
            && String(candidate.sourceActionId || '') === sourceActionId
        );
        if (!result) return false;
        result.impactConfirmed = true;
        result.confirmedImpactEventId = String(event.id || '');
        return true;
    }

    rollbackPendingMonsterPartReaction(result) {
        const part = result?.part;
        const snapshot = result?.partStateBeforeImpact;
        if (!part || !snapshot) return false;
        part.health = snapshot.health;
        part.damageAccumulated = snapshot.damageAccumulated;
        part.flinchAccumulated = snapshot.flinchAccumulated;
        part.postBreakDamageAccumulated = snapshot.postBreakDamageAccumulated;
        part.broken = snapshot.broken;
        part.severed = snapshot.severed;
        part.breakPending = snapshot.breakPending;
        part.hitzones = { ...snapshot.hitzones };
        return true;
    }

    isPendingHunterPartImpactActive(result) {
        if (!result?.sourceActionId || !this.monsterBeatRuntime?.get) return false;
        const state = this.monsterBeatRuntime.get(`hunter:${result.sourceHunterIndex}`);
        return Boolean(state
            && String(state.context?.action?.id || '') === String(result.sourceActionId));
    }

    isMonsterActionPresenting() {
        return Boolean(this.monsterBeatRuntime?.has?.('monster'))
            || Number(this.monsterActionPresentationTicks || 0) > 0
            || Boolean(this.pendingMonsterAction)
            || Boolean(this.pendingMonsterImpact)
            || Boolean(this.monsterTraversalState)
            || Boolean(this.monsterBurrowState)
            || Number(this.monsterRoarDuration || 0) > 0;
    }

    flushPendingMonsterPartReaction() {
        if (!this.pendingMonsterPartReactions?.length
            || HuntEngine.prototype.isMonsterActionPresenting.call(this)) return false;
        if (Number(this.monsterKnockdownDuration || 0) > 0
            || Number(this.monsterStunDuration || 0) > 0
            || Number(this.monsterActionLockTicks || 0) > 0
            || ['knocked_down', 'stunned', 'paralyzed', 'sleeping'].includes(this.monsterState)) return false;
        // A provisional break may outlive the attack that appeared to cause it.
        // Wait while that action is still approaching its authored HIT; if the
        // action vanished without emitting the HIT, restore part durability and
        // discard the impossible delayed reaction.
        while (this.pendingMonsterPartReactions.length) {
            const pending = this.pendingMonsterPartReactions[0];
            if (pending.sourceActionId && !pending.impactConfirmed) {
                if (HuntEngine.prototype.isPendingHunterPartImpactActive.call(this, pending)) return false;
                this.pendingMonsterPartReactions.shift();
                HuntEngine.prototype.rollbackPendingMonsterPartReaction.call(this, pending);
                continue;
            }
            break;
        }
        if (!this.pendingMonsterPartReactions.length) return false;
        const result = this.pendingMonsterPartReactions.shift();
        HuntEngine.prototype.resolveMonsterPartReaction.call(this, result);
        return true;
    }

    resolveMonsterPartReaction(result) {
            if (result?.newlyBroken && result.part?.breakPending) {
                result.part.breakPending = false;
                result.part.broken = true;
                result.part.severed = Boolean(result.newlySevered && result.part.severable);
                if (result.part.breakHitzones) {
                    result.part.hitzones = { ...result.part.breakHitzones };
                }
            }
            const atbConfig = typeof HuntAtbConfig !== 'undefined'
                ? HuntAtbConfig
                : require('./HuntAtbConfig.js');
            const partBreakAtb = atbConfig.monsterAtbAfterControl('partBreak');
            if (result.newlyBroken) {
                this.monsterTraitRuntime?.refresh?.(this);
                this.updateMonsterPartsUI();
                const sourceHunter = this.selectedWeapons?.find(hunter => Number(hunter.index) === Number(result.sourceHunterIndex));
                this.perkRuntime?.onPartBreak?.(sourceHunter, result);
            }
            if (result.newlySevered) {
                this.severedTail.available = true;
                this.addLog(`✂️ [꼬리 절단] ${this.selectedMonster.nameKO}의 꼬리가 잘려 전장 어딘가에 떨어졌습니다!`, '#ff8f70');
                this.updateTailSeverUI(true, false);
            } else if (result.newlyBroken) {
                this.addLog(`⚔ [부위 파괴] ${this.selectedMonster.nameKO} · ${result.part.kind}`, '#ffb347');
            } else {
                this.addLog(`💥 [부위 경직] ${this.selectedMonster.nameKO} · ${result.part.kind}`, '#ffcf70');
            }
            const airborne = this.monsterFlightState === 'airborne' || this.monsterState === 'valstrax_flying';
            const reaction = result.newlyFlinched && !result.newlyBroken
                ? HuntMonsterAnatomyCatalog.flinchReaction(this.selectedMonster.id, result.part.kind)
                : HuntMonsterAnatomyCatalog.breakReaction(
                    this.selectedMonster.id,
                    result.part.kind,
                    airborne
                );
            if (!reaction) return result;
            const partBreakSize = result.newlyBroken
                ? HuntMonsterAnatomyCatalog.breakAudioSize(result, reaction)
                : null;
            const reactionProfile = reaction.reactionProfile || (reaction.type === 'flinch'
                ? 'flinch' : reaction.type === 'tail_sever_roll' ? 'tail' : 'knockdown');
            if (result.newlyBroken) {
                // Material break is independent from body control. It always
                // cracks and plays its reviewed break audio, even if the body
                // is already unable to react in another control state.
                this.callbacks.onTriggerMonsterPartBreakVisual?.(result.part.kind);
                this.playSFX?.('monster_part_break_visual', null, {
                    monsterId: this.selectedMonster.id,
                    partBreakVisualProfile: reactionProfile === 'flinch' ? 'small' : 'large'
                });
            }
            if (airborne && this.monsterFlightRuntime?.onPartBreak(
                this,
                result.part,
                reaction,
                { retainedAtb: partBreakAtb, partBreakSize }
            )) {
                result.reaction = reaction;
                return result;
            }
            const isFlinch = reaction.type === 'flinch';
            const bodyReactionBlocked = Number(this.monsterStunDuration || 0) > 0
                || Number(this.monsterKnockdownDuration || 0) > 0
                || Boolean(this.activeTrapControl)
                || ['stunned', 'paralyzed', 'sleeping', 'knocked_down'].includes(this.monsterState);
            if (!bodyReactionBlocked) this.interruptMonsterMovement(`part-break:${result.part.kind}`);
            if (!bodyReactionBlocked && isFlinch) {
                this.monsterActionLockTicks = Math.max(
                    Number(this.monsterActionLockTicks || 0),
                    Number(reaction.durationTicks || 0)
                );
            } else if (!bodyReactionBlocked) {
                this.monsterKnockdownDuration = Math.max(
                    Number(this.monsterKnockdownDuration || 0),
                    Number(reaction.durationTicks || 0)
                );
                this.monsterState = 'knocked_down';
                this.monsterControlEnteredAtTick = Number(this.battleTime || 0);
            }
            this.monsterAtb = isFlinch
                ? (bodyReactionBlocked ? this.monsterAtb : atbConfig.monsterAtbAfterControl('flinch'))
                : (bodyReactionBlocked ? this.monsterAtb : partBreakAtb);
            this.monsterPartReactionKind = reaction.visualType || reaction.type;
            if (!bodyReactionBlocked) this.playSFX?.(
                isFlinch ? 'monster_flinch' : 'monster_knockdown', null,
                { monsterId: this.selectedMonster.id, reactionProfile }
            );
            this.updateMonsterAtbUI(this.monsterAtb);
            if (!bodyReactionBlocked && this.callbacks.onTriggerMonsterPartBreakReaction) {
                this.callbacks.onTriggerMonsterPartBreakReaction(
                    this.monsterPartReactionKind,
                    Number(reaction.durationTicks || 0),
                    result.newlyBroken ? result.part.kind : null
                );
            }
            result.reaction = reaction;
        return result;
    }

    updateTailSeverUI(visible, carved) {
        if (this.callbacks.onUpdateTailSeverUI) this.callbacks.onUpdateTailSeverUI(visible, carved, this.severedTail?.displayName || `${this.selectedMonster.nameKO} 꼬리`);
    }

    consumeTrapEffect(baseTicks, options = {}) {
        const multipliers = [1, .7, .45, .25];
        const multiplier = multipliers[Math.min(this.monsterTrapUseCount, multipliers.length - 1)];
        this.monsterTrapUseCount++;
        const TrapConfig = typeof HuntTrapConfig !== 'undefined'
            ? HuntTrapConfig
            : (typeof require === 'function' ? require('./HuntTrapConfig.js') : null);
        const minimumTicks = Math.max(
            TrapConfig?.minimumDurationTicks?.(this.monsterTrapUseCount) || 14,
            Number(options.minimumDurationTicks || 0)
        );
        const durationTicks = Math.max(minimumTicks, Math.round(Number(baseTicks || 0) * multiplier));
        const atbConfig = typeof HuntAtbConfig !== 'undefined'
            ? HuntAtbConfig
            : require('./HuntAtbConfig.js');
        const retainedAtb = atbConfig.monsterAtbAfterTrap(multiplier);
        return {
            durationTicks,
            multiplier,
            retainedAtb,
            recoveryPerTick: (atbConfig.GAUGE_MAX - retainedAtb) / durationTicks,
            useCount: this.monsterTrapUseCount
        };
    }

    consumeTrapDuration(baseTicks) {
        return this.consumeTrapEffect(baseTicks).durationTicks;
    }

    beginMonsterTrapControl(kind, baseTicks) {
        const TrapConfig = typeof HuntTrapConfig !== 'undefined'
            ? HuntTrapConfig
            : (typeof require === 'function' ? require('./HuntTrapConfig.js') : null);
        const runtimeKind = TrapConfig
            ? TrapConfig.normalizeKind(kind)
            : (!kind || kind === 'trap' ? 'pitfall' : kind);
        this.interruptMonsterMovement?.(`trap:${runtimeKind}`);
        const nextUseCount = Number(this.monsterTrapUseCount || 0) + 1;
        const struggleCount = TrapConfig?.struggleCount?.(nextUseCount) || 0;
        const baseTrapReaction = typeof HuntMonsterReactionCatalog !== 'undefined'
            ? HuntMonsterReactionCatalog.resolvePitfall?.(
                this.selectedMonster?.id,
                struggleCount,
                0
            )
            : null;
        const baseLifecycle = TrapConfig?.lifecycleFromMotion?.(
            baseTrapReaction?.motion,
            nextUseCount
        );
        const trapEffect = this.consumeTrapEffect(baseTicks, {
            minimumDurationTicks: baseLifecycle?.durationTicks
        });
        const atbConfig = typeof HuntAtbConfig !== 'undefined'
            ? HuntAtbConfig
            : require('./HuntAtbConfig.js');
        this.monsterState = 'knocked_down';
        this.monsterKnockdownDuration = trapEffect.durationTicks;
        this.monsterControlEnteredAtTick = Number(this.battleTime || 0);
        atbConfig.applyMonsterTrapAtb(this, trapEffect.multiplier);
        const trapReaction = typeof HuntMonsterReactionCatalog !== 'undefined'
            ? HuntMonsterReactionCatalog.resolvePitfall?.(
                this.selectedMonster?.id,
                struggleCount,
                trapEffect.durationTicks
            )
            : null;
        const lifecycle = TrapConfig?.lifecycleFromMotion?.(
            trapReaction?.motion,
            trapEffect.useCount
        );
        trapEffect.motion = trapReaction?.motion || [];
        trapEffect.entryTicks = lifecycle?.entryTicks || TrapConfig?.ENTRY_TICKS || 6;
        trapEffect.releaseTicks = lifecycle?.releaseTicks || TrapConfig?.ESCAPE_TICKS || 8;
        this.activeTrapControl = {
            kind: runtimeKind,
            durationTicks: trapEffect.durationTicks,
            recoveryPerTick: trapEffect.recoveryPerTick,
            retainedAtb: trapEffect.retainedAtb,
            useCount: trapEffect.useCount,
            elapsedTicks: 0,
            struggleSchedule: lifecycle?.struggleSchedule
                || TrapConfig?.struggleSchedule?.(trapEffect.durationTicks, trapEffect.useCount)
                || [],
            releaseTicks: trapEffect.releaseTicks,
            nextStruggleIndex: 0,
            releasing: false
        };
        this.playSFX?.('monster_trap', null, {
            monsterId: this.selectedMonster.id,
            trapKind: runtimeKind,
            trapPhase: 'fall',
            overrideOnly: true
        });
        return trapEffect;
    }

    setMonsterAtbForControl(kind) {
        const atbConfig = typeof HuntAtbConfig !== 'undefined'
            ? HuntAtbConfig
            : require('./HuntAtbConfig.js');
        return atbConfig.applyMonsterControlAtb(this, kind);
    }

    isMonsterTrapImmune() {
        return HuntMonsterRules.isTrapImmune(this.selectedMonster, this.monsterTier);
    }

    presentHunterImpact(idx, outcome, details = {}) {
        // This is the single live presentation boundary for committed monster
        // judgments. Monster motion starts with pending targets and must never
        // call hunter reaction callbacks on its own.
        if (outcome === 'hit') {
            this.callbacks.onTriggerHitAnimation?.(idx, details.reaction || details);
            return true;
        }
        if (['guard', 'perfect-guard', 'counter', 'tackle'].includes(outcome)) {
            this.callbacks.onTriggerGuardShake?.(idx, outcome);
            return true;
        }
        if (outcome === 'dodge') {
            this.callbacks.onTriggerRollAnimation?.(idx);
            return true;
        }
        return false;
    }

    triggerHitAnimation(idx, reaction) {
        return this.presentHunterImpact(idx, 'hit', { reaction });
    }

    cancelHunterHitRecovery(target, reason = 'cancelled') {
        if (!target) return;
        target.hitDuration = 0;
        target.hitRecoveryTotalTicks = 0;
        target.hitStartedThisTick = false;
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
        const stateBeforeControl = this.monsterState;
        let duration = Math.max(1, Number(durationTicks || 1));
        if (kind === 'sleep' && typeof HuntMonsterReactionCatalog !== 'undefined') {
            const sleepProfile = HuntMonsterReactionCatalog.resolveSleep?.(this.selectedMonster?.id);
            if (sleepProfile?.motion?.length) duration = sleepProfile.motion.reduce((sum, beat) =>
                sum + Math.max(1, Number(beat.ticks) || 1), 0);
        }
        const wasAirborne = Boolean(this.monsterFlightRuntime?.groundForStatus(this, kind));

        this.interruptMonsterMovement(`status:${kind}`);
        this.setMonsterAtbForControl(kind);
        this.monsterControlStateKind = kind;
        if (kind === 'stun') {
            this.monsterStunCount += 1;
            const struggleCount = Math.max(3, 6 - this.monsterStunCount);
            const reaction = typeof HuntMonsterReactionCatalog !== 'undefined'
                ? HuntMonsterReactionCatalog.resolveKnockdown(this.selectedMonster?.id, struggleCount)
                : null;
            if (reaction?.motion?.length) {
                duration = reaction.motion.reduce((sum, beat) =>
                    sum + Math.max(1, Number(beat.ticks) || 1), 0);
            }
            this.monsterStunDuration = Math.max(Number(this.monsterStunDuration || 0), duration);
            this.monsterKnockdownDuration = 0;
        } else {
            this.monsterStunDuration = 0;
            this.monsterKnockdownDuration = Math.max(Number(this.monsterKnockdownDuration || 0), duration);
        }
        this.monsterState = config.state;
        this.monsterControlEnteredAtTick = Number(this.battleTime || 0);
        if (kind === 'sleep') {
            this.monsterSleepRestoreState = ['enraged', 'exhausted'].includes(stateBeforeControl)
                ? stateBeforeControl : 'normal';
        }
        this.updateMonsterStateUI(config.stateName, config.title, {
            color: config.color,
            bg: config.bg
        });
        if (kind === 'paralysis') {
            this.playSFX?.('monster_attack', null, {
                monsterId: this.selectedMonster.id,
                patternId: '__reaction.paralysis',
                patternSlot: 'beat:held',
                overrideOnly: true
            });
        } else if (kind === 'sleep') {
            const sleepGeneration = ++this.monsterSleepGeneration;
            const sleepMotion = typeof HuntMonsterReactionCatalog !== 'undefined'
                ? HuntMonsterReactionCatalog.resolveSleep?.(this.selectedMonster?.id)?.motion || []
                : [];
            this.callbacks?.onTriggerMonsterSleepAnim?.({ durationTicks: duration, motion: sleepMotion });
            let elapsedTicks = 0;
            sleepMotion.forEach(beat => {
                const playBeat = () => {
                    if (this.monsterState !== 'sleeping'
                        || this.monsterSleepGeneration !== sleepGeneration) return;
                    this.playSFX?.('monster_attack', null, {
                        monsterId: this.selectedMonster.id,
                        patternId: '__reaction.sleep',
                        patternSlot: `beat:${beat.beat}`,
                        overrideOnly: true
                    });
                };
                if (elapsedTicks <= 0) playBeat();
                else this.schedule(playBeat, elapsedTicks * 100);
                if (beat.beat === 'held') {
                    const heldStartTicks = elapsedTicks;
                    const heldTicks = Math.max(1, Number(beat.ticks) || 1);
                    // Sleeping VO/SE is ambience owned by the held phase. The
                    // first cue plays on entering held, then repeats every 3s
                    // without extending beyond the authored held duration.
                    for (let repeatAt = heldStartTicks + 30;
                        repeatAt < heldStartTicks + heldTicks; repeatAt += 30) {
                        this.schedule(playBeat, repeatAt * 100);
                    }
                }
                elapsedTicks += Math.max(1, Number(beat.ticks) || 1);
            });
        }
        if (kind === 'stun') {
            // KO shares the authored large-knockdown body reaction. The
            // renderer adds only the head marker as stun-specific presentation.
            this.callbacks?.onTriggerMonsterKnockdownAnim?.({
                kind: 'stun', durationTicks: duration,
                struggleCount: Math.max(3, 6 - this.monsterStunCount)
            });
        }
        if (wasAirborne) {
            this.addLog(`🪽 [강제 착지] ${this.selectedMonster.nameKO}(이)가 공중에서 ${config.stateName.replace(' 상태', '')}에 걸려 즉시 추락했습니다.`, config.color);
        }
        return true;
    }

    resolveSleepWakeDamage(rawDamage, options = {}) {
        const damage = Math.max(0, Number(rawDamage) || 0);
        if (!damage || options.direct === false) return damage;
        const groupKey = String(options.groupKey ?? this.battleTime ?? 0);
        let batch = this.monsterSleepWakeBatch;
        if (this.monsterState === 'sleeping') {
            const generation = ++this.monsterSleepGeneration;
            batch = { groupKey, maxDamage: 0, generation };
            this.monsterSleepWakeBatch = batch;
            this.wakeMonsterFromSleep();
            this.schedule(() => {
                if (this.monsterSleepWakeBatch?.generation === generation) {
                    this.monsterSleepWakeBatch = null;
                }
            }, 0);
        }
        if (!batch || batch.groupKey !== groupKey) return damage;
        // Every simultaneous hit keeps its ordinary damage. Exactly one bonus
        // copy of the largest hit is shared by the whole impact group.
        const bonusDelta = Math.max(0, damage - Number(batch.maxDamage || 0));
        batch.maxDamage = Math.max(Number(batch.maxDamage || 0), damage);
        return damage + bonusDelta;
    }

    wakeMonsterFromSleep() {
        if (this.monsterState !== 'sleeping') return false;
        const profile = typeof HuntMonsterReactionCatalog !== 'undefined'
            ? HuntMonsterReactionCatalog.resolveSleep?.(this.selectedMonster?.id) : null;
        const wakeMotion = (profile?.motion || []).filter(beat => beat.beat === 'wake');
        this.monsterKnockdownDuration = 0;
        this.monsterStunDuration = 0;
        this.monsterAtb = HuntAtbConfig.GAUGE_MAX;
        this.monsterState = this.monsterStaminaRuntime?.isExhausted?.(this)
            ? 'exhausted' : (this.monsterSleepRestoreState || 'normal');
        this.monsterSleepRestoreState = null;
        this.monsterSpeed = this.getMonsterSpeedForState(this.monsterState);
        this.callbacks?.onTriggerMonsterSleepAnim?.({ motion: wakeMotion, wakeOnly: true });
        this.playSFX?.('monster_attack', null, {
            monsterId: this.selectedMonster.id,
            patternId: '__reaction.sleep', patternSlot: 'beat:wake', overrideOnly: true
        });
        this.updateMonsterAtbUI(this.monsterAtb);
        const wakeStateUi = this.monsterState === 'enraged'
            ? ['분노 상태', `🔥 분노한 ${this.selectedMonster.nameKO} 🔥`,
                { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' }]
            : this.monsterState === 'exhausted'
                ? ['탈진 상태', `💨 탈진한 ${this.selectedMonster.nameKO} 💨`,
                    { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' }]
                : ['일반 상태', this.selectedMonster.nameKO,
                    { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' }];
        this.updateMonsterStateUI(...wakeStateUi);
        this.addLog(`❗ [수면 기상] ${this.selectedMonster.nameKO}이(가) 기상 일격에 깨어났습니다!`, '#ffd27a');
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

    triggerMonsterRoarFlinch(isEncounter = false, options = {}) {
        if (this.monsterTier === 'small' || this.selectedMonster?.roar?.status !== 'verified-present') {
            this.monsterRoarDuration = 0;
            this.selectedWeapons.forEach(hunter => {
                hunter.roarStunned = false;
                hunter.roarStunDuration = 0;
            });
            return false;
        }
        this.monsterTraitRuntime?.onRoar?.(this);
        // 몬스터 포효 트리거
        this.triggerMonsterRoar(this.selectedMonster);
        
        // Approved transition-roar graphs own the complete brace/roar/settle
        // session. The fixed timer remains only for legacy/fallback callers.
        this.monsterRoarDuration = options.actionOwned ? 0 : 12;
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
            const guaranteedLanceGuard = w.id === 'lance' && hasShield;
            const personalityProfiles = HuntEngine.personalityProfiles();
            let guardProb = actionAllowsGuard ? (personalityProfiles?.chance(w, 'guard') ?? .62) : 0;
            let dodgeProb = actionAllowsEvade ? (personalityProfiles?.chance(w, 'evade') ?? .48) : 0;

            let foresightProb = typeof HuntMonsterTurnExecutor !== 'undefined'
                ? HuntMonsterTurnExecutor.longSwordForesightChance(w)
                : 0.75;
            const perkModifiers = w.perkModifiers || {};
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
            } else if (!foresight.attempted
                && hasShield
                && (guaranteedLanceGuard || defendRoll < guardProb)) {
                isGuard = true;
            } else if (!foresight.attempted && !hasShield && defendRoll < dodgeProb) {
                isDodge = true;
            }

            if (isGreatSwordCharging && (isGuard || isDodge)) {
                if (this.weaponMechanics?.onHit) this.weaponMechanics.onHit(w);
                else { w.greatSwordCharge = 0; w.greatSwordChain = 0; }
                this.actionStateMachine.cancel(w, 'idle');
                this.cancelHunterBeatAction(w, 'defensive-cancel');
                this.callbacks.onInterruptWeaponVisual?.(w.index);
            }

            if (isForesightSlash) {
                this.addLog(`⚡ [간파베기] ${w.name}이(가) 몬스터의 포효를 간파하고 기인 게이지를 쌓았습니다!`, '#c98534');
                this.playSFX('hunter_guard', null, { hunterIndex: w.index, action: 'guard' });
                this.showSkillBubble(w.index, "간파베기!");
                this.shakeWeapon(w.index, '#c98534');
                this.presentHunterImpact(w.index, 'dodge');
                w.rollDuration = 6;
            } else if (isGuard) {
                this.actionStateMachine.cancel(w, 'guard');
                this.cancelHunterBeatAction(w, 'guard');
                this.addLog(`🛡️ [방패 가드] ${w.name}이(가) 포효를 방패로 막아내며 흔들림 없이 버팁니다!`, '#00ffff');
                this.playSFX('hunter_guard', null, { hunterIndex: w.index, action: 'guard' });
                this.showSkillBubble(w.index, HuntEngine.STANDARD_GUARD_LABEL);
                this.shakeWeapon(w.index, '#00ffff');
                this.presentHunterImpact(w.index, 'guard');
                w.guardDuration = 6;
            } else if (isDodge) {
                this.actionStateMachine.cancel(w, 'evade');
                this.cancelHunterBeatAction(w, 'evade');
                this.addLog(`🌀 [프레임 회피] ${w.name}이(가) 구르기 무적 시간으로 포효의 음파를 피해냈습니다!`, '#2eff7b');
                this.playSFX('hunter_evade', null, { hunterIndex: w.index, action: 'evade' });
                this.showSkillBubble(w.index, "회피!");
                this.shakeWeapon(w.index, '#2eff7b', false, null, true);
                this.presentHunterImpact(w.index, 'dodge');
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
