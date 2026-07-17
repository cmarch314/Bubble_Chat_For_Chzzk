class HuntEngine {
    constructor(config) {
        this.selectedWeapons = config.selectedWeapons;
        this.selectedMonster = config.selectedMonster;
        this.bets = config.bets || {};
        this.consecutiveTotal = config.consecutiveTotal || 1;
        this.currentConsecutiveIndex = config.currentConsecutiveIndex || 0;
        this.consecutiveQueue = config.consecutiveQueue || [];
        this.callbacks = config.callbacks || {};
        this.random = config.random || Math.random;
        this.schedule = config.schedule || ((callback, delay) => setTimeout(callback, delay));
        this.actionStateMachine = config.actionStateMachine || new HuntActionStateMachine();
        this.weaponActionSelector = config.weaponActionSelector || new HuntWeaponActionSelector(this.random);
        this.monsterPatternSelector = config.monsterPatternSelector || new HuntMonsterPatternSelector(this.random);
        this.teamTactic = config.teamTactic || 'balanced';
        this.telemetry = config.telemetry || new HuntBalanceTelemetry();
        
        // Monster Stats
        this.monsterTier = config.monsterTier || 'normal';
        this.monsterHp = config.monsterHp || 12000;
        this.monsterMaxHp = config.monsterMaxHp || 12000;
        this.monsterSpeedMultiplier = config.monsterSpeedMultiplier !== undefined ? config.monsterSpeedMultiplier : 1.0;
        this.monsterAtb = config.monsterAtb || 0;
        this.monsterState = config.monsterState || 'normal';
        this.monsterSpeed = config.monsterSpeed || this.getMonsterSpeedForState(this.monsterState);
        this.monsterDamageMod = config.monsterDamageMod || 0.9;
        this.monsterAtbSpeedMod = config.monsterAtbSpeedMod || 1.15;
        this.tierLabel = config.tierLabel || "대형 몬스터";

        this.cartCount = config.cartCount || 0;
        this.battleTime = config.battleTime || 0;
        this.monsterStunAccum = config.monsterStunAccum || 0;
        this.monsterStunThreshold = config.monsterStunThreshold || 300;
        this.monsterStunDuration = config.monsterStunDuration || 0;
        this.monsterKnockdownDuration = config.monsterKnockdownDuration || 0;
        this.monsterKnockdownTriggered = config.monsterKnockdownTriggered || { 80: false, 60: false, 40: false, 20: false };
        this.monsterRecoveryDuration = 0;

        this.MONSTER_ATTACKS = config.MONSTER_ATTACKS;
        this.MONSTER_PATTERNS = config.MONSTER_PATTERNS || HuntMonsterPatternCatalog.build(config.MONSTER_ATTACKS || {});
        this.COMBO_LIST = config.COMBO_LIST;
        this.SHOW_MONSTER_HP = config.SHOW_MONSTER_HP;
        this.hunterSpeedMultiplier = config.hunterSpeedMultiplier !== undefined ? config.hunterSpeedMultiplier : 1.15;
        this.timeLimit = config.timeLimit || 180;

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

    playAudioFile(subPath, durationLimitMs, volumeMultiplier) {
        if (this.callbacks.onPlayAudioFile) this.callbacks.onPlayAudioFile(subPath, durationLimitMs, volumeMultiplier);
    }

    shakeWeapon(idx, borderClr, isAttack, moveName, isDodge = false) {
        if (this.callbacks.onShakeWeapon) this.callbacks.onShakeWeapon(idx, borderClr, isAttack, moveName, isDodge);
    }

    shakeMonster() {
        if (this.callbacks.onShakeMonster) this.callbacks.onShakeMonster();
    }

    restoreBorder(idx) {
        if (this.callbacks.onRestoreBorder) this.callbacks.onRestoreBorder(idx);
    }

    updateHpUI(w) {
        if (this.callbacks.onUpdateHpUI) this.callbacks.onUpdateHpUI(w);
    }

    updateMonsterHpUI() {
        if (this.callbacks.onUpdateMonsterHpUI) this.callbacks.onUpdateMonsterHpUI(this.monsterHp, this.monsterMaxHp);
    }

    updateWeaponAtbUI(idx, atb) {
        if (this.callbacks.onUpdateWeaponAtbUI) this.callbacks.onUpdateWeaponAtbUI(idx, atb);
    }

    updateMonsterAtbUI(atb) {
        if (this.callbacks.onUpdateMonsterAtbUI) this.callbacks.onUpdateMonsterAtbUI(atb);
    }

    updateMonsterStateUI(stateName, title, colorInfo) {
        if (this.callbacks.onUpdateMonsterStateUI) this.callbacks.onUpdateMonsterStateUI(stateName, title, colorInfo);
    }

    updatePotionCountUI(idx, count) {
        if (this.callbacks.onUpdatePotionCountUI) this.callbacks.onUpdatePotionCountUI(idx, count);
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

    updateCartUI(carts) {
        if (this.callbacks.onUpdateCartUI) this.callbacks.onUpdateCartUI(carts);
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
            this.monsterSpeedMultiplier
        );
    }

    triggerHunterCart(target) {
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
        target.attackDuration = 0;
        target.isGathering = false;
        this.updateWeaponAtbUI(target.index, 0); // UI 게이지 초기화
        this.cartCount++;
        this.updateCartUI(this.cartCount);
        this.addLog(`🚨 [수레행] ${target.name}이(가) 쓰러졌습니다! 5초 후 부활합니다. (현재 수레: ${this.cartCount}/3)`, '#ff3b30');
        
        // 40% 확률로 사망 사운드 대신 "아이보!" 사운드 재생
        if (this.random() < 0.40) {
            this.playSFX('mh_aibo.mp3', '아이보');
        } else {
            this.playAudioFile('Unified_SFX/Player Fainted.mp3', 3500);
        }

        if (this.callbacks.onTriggerDeathTag) this.callbacks.onTriggerDeathTag(target.index);
        target.cartTimer = 50; // 5.0 seconds
    }

    processTick() {
        return HuntBattleTickExecutor.execute(this);
    }

    executeMonsterTurn() {
        return HuntMonsterTurnExecutor.execute(this);
    }

    getMonsterAttackType(attackName) {
        let type = 'physical';
        let emoji = '💥';

        if (attackName.includes('브레스') || attackName.includes('화염구') || attackName.includes('번개벼락') || attackName.includes('포효') || attackName.includes('절대영도') || attackName.includes('파편 발사') || attackName.includes('위협')) {
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
        } else if (attackName.includes('독조') || attackName.includes('독')) {
            emoji = '🟣';
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

    triggerHitAnimation(idx, damage) {
        if (this.callbacks.onTriggerHitAnimation) this.callbacks.onTriggerHitAnimation(idx, damage);
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
            this.monsterKnockdownDuration = 70;
            this.monsterStunDuration = 0;
            this.monsterState = 'knocked_down';
            this.monsterAtb = 0;
            this.updateMonsterAtbUI(0);
            this.updateMonsterStateUI('대경직 상태', `💤 대경직에 쓰러진 ${this.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
            
            if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();
            
            // this.playSFX('mh_stun.mp3', '격추');
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

            const defendRoll = this.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;

            const actionAllowsGuard = this.actionStateMachine.canGuard(w);
            const actionAllowsEvade = this.actionStateMachine.canEvade(w);
            const hasShield = actionAllowsGuard && (w.type === 'shield' || w.id === 'heavy_bowgun');
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
            if (w.id === 'long_sword' && canForesight && defendRoll < foresightProb) {
                isDodge = true;
                isForesightSlash = true;
                w.spiritLevel = Math.min(3, (w.spiritLevel || 0) + 1);
            } else if (hasShield && defendRoll < guardProb) {
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                isDodge = true;
            }

            if (isForesightSlash) {
                this.addLog(`⚡ [간파베기] ${w.name}이(가) 몬스터의 포효를 간파하고 기인 게이지를 쌓았습니다!`, '#c98534');
                this.playSFX('mh_guard.mp3', '가드성공');
                this.showSkillBubble(w.index, "간파베기!");
                this.shakeWeapon(w.index, '#c98534');
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(w.index);
                w.rollDuration = 6;
            } else if (isGuard) {
                this.actionStateMachine.cancel(w, 'guard');
                this.addLog(`🛡️ [방패 가드] ${w.name}이(가) 포효를 방패로 막아내며 흔들림 없이 버팁니다!`, '#00ffff');
                this.playSFX('mh_guard.mp3', '가드성공');
                this.showSkillBubble(w.index, "가드!");
                this.shakeWeapon(w.index, '#00ffff');
                if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(w.index);
                w.guardDuration = 6;
            } else if (isDodge) {
                this.actionStateMachine.cancel(w, 'evade');
                this.addLog(`🌀 [프레임 회피] ${w.name}이(가) 구르기 무적 시간으로 포효의 음파를 피해냈습니다!`, '#2eff7b');
                this.playSFX('mh_dodge.mp3', '회피');
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
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntEngine;
} else {
    window.HuntEngine = HuntEngine;
}
