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

        this.MONSTER_ATTACKS = config.MONSTER_ATTACKS;
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
            w.isGathering = false;
        });
    }

    addLog(text, color) {
        if (this.callbacks.onLog) this.callbacks.onLog(text, color);
    }

    playSFX(fileName, fallbackKey) {
        if (this.callbacks.onPlaySFX) this.callbacks.onPlaySFX(fileName, fallbackKey);
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
        this.battleTime++;
        this.updateTimerUI(this.battleTime);

        // Check timeout fail condition
        if (this.getRemainingSeconds() <= 0) {
            this.addLog(`⏰ [시간 초과] 제한 시간이 초과되어 퀘스트에 실패했습니다...`, '#ff3b30');
            this.triggerGameEnd(false);
            return;
        }

        // Global faint safety check
        this.selectedWeapons.forEach(w => {
            if (w.status !== 'dead' && w.hp <= 0) {
                this.triggerHunterCart(w);
            }
        });

        // Vaal Hazak 독기 틱 데미지 (초당 1씩 = 10틱당 1)
        if (this.selectedMonster.id.includes('vaal_hazak')) {
            if (this.battleTime === 1) {
                this.addLog(`⚠️ [독기 환경] 발하자크의 독기 영역으로 인해 모든 헌터의 체력이 초당 1씩 감소합니다!`, '#ff5555');
            }
            if (this.battleTime % 10 === 0) {
                this.selectedWeapons.forEach(w => {
                    if (w.status === 'alive') {
                        w.hp = Math.max(0, w.hp - 1);
                        this.updateHpUI(w);
                        if (w.hp <= 0) {
                            this.triggerHunterCart(w);
                        }
                    }
                });
            }
        }

        // Valstrax Custom States Ticks
        if (this.selectedMonster.id.includes('valstrax')) {
            if (this.monsterState === 'normal') {
                this.valstraxChargeTimer++;
                if (this.valstraxChargeTimer >= 300) { // 30초
                    this.monsterState = 'valstrax_charging';
                    this.monsterAtb = 0;
                    this.updateMonsterAtbUI(0);
                    this.monsterSpeed = this.getMonsterSpeedForState('valstrax_charging');
                    this.updateMonsterStateUI('시동 걸기', '⚡ 기 모으는 발파루크 ⚡', { color: '#ffcc00', bg: 'rgba(255,204,0,0.1)' });
                    this.addLog(`⚡ [시동 개시] 발파루크가 가슴에 붉은 흡기 기운을 모으며 시동을 걸기 시작합니다! (느림 속도, 현재 시동 성공: ${this.valstraxChargeCount}/3)`, '#ffcc00');
                }
            } else if (this.monsterState === 'enraged') {
                this.valstraxEnrageTimer++;
                if (this.valstraxEnrageTimer >= 300) { // 30초 후 날아오름
                    this.monsterState = 'valstrax_flying';
                    this.valstraxFlyingTimer = 0;
                    this.monsterAtb = 0;
                    this.updateMonsterAtbUI(0);
                    this.addLog(`🚨 [날아오름] 발파루크가 공중으로 날아올라 화면 밖으로 사라졌습니다! 12초 뒤 대폭발 착륙 공격이 가해집니다!`, '#ff3333');
                }
            } else if (this.monsterState === 'valstrax_flying') {
                this.valstraxFlyingTimer++;
                
                // 2.2초 (22틱) 시점에 비주얼 이펙트 트리거
                if (this.valstraxFlyingTimer === 22) {
                    if (this.callbacks.onTriggerValstraxAmbush) {
                        this.callbacks.onTriggerValstraxAmbush();
                    }
                }
                
                // 12초 (120틱) 시점에 착륙 대폭발 데미지 적용
                if (this.valstraxFlyingTimer >= 120) {
                    this.executeValstraxAmbushLanding();
                }
            }
        }

        // 몬스터 포효 시전 중 틱 관리
        if (this.monsterRoarDuration && this.monsterRoarDuration > 0) {
            this.monsterRoarDuration--;
        }

        // 헌터 귀막기 경직 틱 차감
        this.selectedWeapons.forEach(w => {
            if (w.roarStunned && w.roarStunDuration && w.roarStunDuration > 0) {
                w.roarStunDuration--;
                if (w.roarStunDuration <= 0) {
                    w.roarStunned = false;
                    this.addLog(`✨ [경직 해제] ${w.name}이(가) 귀먹먹함에서 회복되었습니다.`, '#eee');
                    if (this.callbacks.onTriggerRoarStun) this.callbacks.onTriggerRoarStun(w.index, false);
                }
            }
        });

        // 조우 포효 (Encounter Roar) 트리거: 전투 개시 1초(10틱) 째
        if (this.battleTime === 10) {
            this.triggerEncounterRoar();
        }

        // Respawn cart timers
        this.selectedWeapons.forEach(w => {
            if (w.status === 'dead' && w.cartTimer && w.cartTimer > 0) {
                w.cartTimer--;
                if (w.cartTimer <= 0) {
                    w.status = 'alive';
                    w.hp = w.maxHp;
                    w.atb = 0;
                    w.potions = 10;
                    if (w.id === 'charge_blade') {
                        w.phials = 0;
                        w.shieldChargeDuration = 0;
                    }
                    if (w.id === 'gunlance') w.overheatDuration = 0;
                    if (w.id === 'insect_glaive') {
                        w.extractBuffs = { red: 0, white: 0, orange: 0 };
                        w.extractDuration = 0;
                    }
                    this.restoreBorder(w.index);
                    this.playSFX('mh_aibo.mp3', '아이보');
                    this.addLog(`✨ [부활] ${w.name}이(가) "아이보!" 소리와 함께 전장에 재참여하였습니다!`, '#00ffa3');
                    this.updateHpUI(w);
                    this.shakeWeapon(w.index, '#00ffa3');
                }
            }
        });

        // Buff / Overheat / Hit stun counters
        this.selectedWeapons.forEach(w => {
            if (w.status === 'alive' || w.status === 'stunned') {
                if (w.hitDuration && w.hitDuration > 0) {
                    w.hitDuration--;
                }
                if (w.rollDuration && w.rollDuration > 0) {
                    w.rollDuration--;
                }
                if (w.guardDuration && w.guardDuration > 0) {
                    w.guardDuration--;
                }
                if (w.itemDuration && w.itemDuration > 0) {
                    w.itemDuration--;
                    if (w.itemDuration === 0) w.isGathering = false; // [FIX] 채집/아이템 상태 안전한 해제
                }
                if (w.attackDuration && w.attackDuration > 0) {
                    w.attackDuration--;
                }
                if (w.status === 'stunned' && w.stunDuration && w.stunDuration > 0) {
                    w.stunDuration--;
                    if (w.stunDuration === 0) {
                        w.status = 'alive';
                        this.addLog(`✨ [기절 회복] ${w.name}이(가) 정신을 차렸습니다!`, '#eee');
                        if (this.callbacks.onTriggerStunUI) this.callbacks.onTriggerStunUI(w.index, false);
                    }
                }
                if (this.battleTime % 10 === 0) {
                    if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                        w.demonModeDuration--;
                        if (w.demonModeDuration === 0) {
                            this.addLog(`👹 [귀인화 해제] ${w.hunterName}의 귀인화 상태가 해제되었습니다.`, '#aaa');
                            this.restoreBorder(w.index);
                        }
                    }
                    if (w.id === 'gunlance' && w.overheatDuration && w.overheatDuration > 0) {
                        w.overheatDuration--;
                        this.updateOverheatUI(w.index, w.overheatDuration);
                        if (w.overheatDuration === 0) {
                            this.addLog(`🔥 [오버히트 해제] ${w.hunterName}의 건랜스 용격포 열기가 완전히 식어 오버히트가 해제되었습니다!`, '#00a8ff');
                        }
                    }
                    if (w.id === 'charge_blade' && w.shieldChargeDuration && w.shieldChargeDuration > 0) {
                        w.shieldChargeDuration--;
                        if (w.shieldChargeDuration === 0) {
                            this.addLog(`🛡️ [방패강화 해제] ${w.hunterName}의 차지액스 방패 속성강화 상태가 해제되었습니다.`, '#aaa');
                            this.restoreBorder(w.index);
                        }
                    }
                    if (w.id === 'insect_glaive' && w.extractDuration && w.extractDuration > 0) {
                        w.extractDuration--;
                        if (w.extractDuration === 0) {
                            w.extractBuffs = { red: 0, white: 0, orange: 0 };
                            this.addLog(`🐝 [진액 버프 해제] ${w.hunterName}의 3색 진액 효과가 소멸되었습니다.`, '#aaa');
                            this.restoreBorder(w.index);
                        }
                    }
                }
            }
        });

        // Monster State Loop (90-second loop per state: normal -> enraged -> normal -> exhausted)
        if (!this.selectedMonster.id.includes('valstrax')) {
            const loopTime = this.battleTime % 3600;
            let nextState = 'normal';
            if (loopTime >= 900 && loopTime < 1800) {
                nextState = 'enraged';
            } else if (loopTime >= 1800 && loopTime < 2700) {
                nextState = 'normal';
            } else if (loopTime >= 2700 && loopTime < 3600) {
                nextState = 'exhausted';
            }

            if (this.monsterState !== 'knocked_down' && this.monsterState !== 'stunned' && nextState !== this.monsterState) {
                this.monsterState = nextState;
                if (this.monsterState === 'enraged') {
                    this.monsterSpeed = this.getMonsterSpeedForState('enraged');
                    this.updateMonsterStateUI('분노 상태', `😡 분노한 ${this.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
                    this.triggerMonsterRoarFlinch(false);
                    this.addLog(`🔥 [분노] ${this.selectedMonster.nameKO}이(가) 포효를 지르며 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                    this.shakeMonster();
                } else if (this.monsterState === 'exhausted') {
                    this.monsterSpeed = this.getMonsterSpeedForState('exhausted');
                    this.updateMonsterStateUI('탈진 상태', `🤤 탈진한 ${this.selectedMonster.nameKO} 🤤`, { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' });
                    this.playSFX('mh_cart.mp3', '아이고~');
                    this.addLog(`🤤 [탈진] ${this.selectedMonster.nameKO}이(가) 스태미나 고갈로 비틀거립니다! (속도 0.5배, 공격력 0.5배)`, '#00a8ff');
                    this.shakeMonster();
                } else {
                    this.monsterSpeed = this.getMonsterSpeedForState('normal');
                    this.updateMonsterStateUI('일반 상태', this.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                    this.addLog(`📢 ${this.selectedMonster.nameKO}이(가) 진정하여 평상시로 돌아왔습니다.`, '#eee');
                }
            }
        }

        // Check fail conditions (3 Carts)
        if (this.cartCount >= 3) {
            this.triggerGameEnd(false);
            return;
        }

        // Check victory conditions
        if (this.monsterHp <= 0) {
            if (this.currentConsecutiveIndex < this.consecutiveTotal - 1) {
                this.triggerNextConsecutive();
            } else {
                const aliveList = this.selectedWeapons.filter(w => w.status === 'alive');
                const winner = aliveList.length > 0 ? aliveList[0] : this.selectedWeapons[0];
                this.triggerGameEnd(true, winner);
                return;
            }
        }

        // Monster ATB
        if (this.monsterKnockdownDuration > 0) {
            this.monsterKnockdownDuration--;
            if (this.monsterKnockdownDuration <= 0) {
                // Recovery from knockdown
                let restoreState = 'normal';
                if (!this.selectedMonster.id.includes('valstrax')) {
                    const loopTime = this.battleTime % 3600;
                    if (loopTime >= 900 && loopTime < 1800) restoreState = 'enraged';
                    else if (loopTime >= 2700 && loopTime < 3600) restoreState = 'exhausted';
                } else {
                    // [FIX] 발파루크 CC기(대경직 등) 해제 시 분노/충전 게이지 초기화하여 꼬임 방지
                    this.valstraxChargeCount = 0;
                    this.valstraxEnrageTimer = 0;
                }

                this.monsterState = restoreState;
                this.monsterSpeed = this.getMonsterSpeedForState(restoreState);

                const colorInfo = restoreState === 'enraged'
                    ? { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' }
                    : (restoreState === 'exhausted' ? { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' } : { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                
                const titleStr = restoreState === 'enraged'
                    ? `😡 분노한 ${this.selectedMonster.nameKO} 😡`
                    : (restoreState === 'exhausted' ? `🤤 탈진한 ${this.selectedMonster.nameKO} 🤤` : this.selectedMonster.nameKO);

                this.updateMonsterStateUI(restoreState === 'enraged' ? '분노 상태' : (restoreState === 'exhausted' ? '탈진 상태' : '일반 상태'), titleStr, colorInfo);
                this.addLog(`📢 ${this.selectedMonster.nameKO}이(가) 대경직에서 깨어나 비틀거리며 일어섭니다.`, '#00ffa3');
            }
        } else if (this.monsterStunDuration > 0) {
            this.monsterStunDuration--;
            if (this.monsterStunDuration <= 0) {
                // Recovery from stun
                let restoreState = 'normal';
                if (!this.selectedMonster.id.includes('valstrax')) {
                    const loopTime = this.battleTime % 3600;
                    if (loopTime >= 900 && loopTime < 1800) restoreState = 'enraged';
                    else if (loopTime >= 2700 && loopTime < 3600) restoreState = 'exhausted';
                }

                this.monsterState = restoreState;
                this.monsterSpeed = this.getMonsterSpeedForState(restoreState);

                const colorInfo = restoreState === 'enraged'
                    ? { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' }
                    : (restoreState === 'exhausted' ? { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' } : { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                
                const titleStr = restoreState === 'enraged'
                    ? `😡 분노한 ${this.selectedMonster.nameKO} 😡`
                    : (restoreState === 'exhausted' ? `🤤 탈진한 ${this.selectedMonster.nameKO} 🤤` : this.selectedMonster.nameKO);

                this.updateMonsterStateUI(restoreState === 'enraged' ? '분노 상태' : (restoreState === 'exhausted' ? '탈진 상태' : '일반 상태'), titleStr, colorInfo);
                
                this.monsterStunAccum = 0;
                this.monsterStunThreshold = Math.floor(this.monsterStunThreshold * 1.5);
                this.addLog(`📢 ${this.selectedMonster.nameKO}이(가) 기절에서 깨어나 정신을 가다듬습니다. (기절 내성치 상승: ${this.monsterStunThreshold})`, '#00ffa3');
            }
        } else if (this.monsterRoarDuration > 0 || (this.selectedMonster.id.includes('valstrax') && this.monsterState === 'valstrax_flying')) {
            // 포효 시전 중 또는 발파루크 비행 중에는 몬스터 ATB가 충전되지 않음
            this.monsterAtb = 0;
        } else {
            this.monsterAtb = Math.min(100, this.monsterAtb + this.monsterSpeed);
        }
        this.updateMonsterAtbUI(this.monsterAtb);

        // Hunter ATB
        this.selectedWeapons.forEach(w => {
            const isRolling = w.rollDuration && w.rollDuration > 0;
            const isGuarding = w.guardDuration && w.guardDuration > 0;
            const isGathering = w.isGathering;
            const isUsingItem = w.itemDuration && w.itemDuration > 0;
            const isAttacking = w.attackDuration && w.attackDuration > 0;
            const isHitStunned = w.hitDuration && w.hitDuration > 0;

            if (w.status === 'alive' && !w.roarStunned && !isHitStunned && !isRolling && !isGuarding && !isGathering && !isUsingItem && !isAttacking) {
                let fillRate = 1.0;
                if (w.speedGroup === 'very_fast') fillRate = 1.4;
                else if (w.speedGroup === 'fast') fillRate = 1.2;
                else if (w.speedGroup === 'slow') fillRate = 0.85;
                
                // Apply hunter speed multiplier from config
                fillRate *= this.hunterSpeedMultiplier;
                
                if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                    fillRate *= 1.2;
                }
                if (w.id === 'insect_glaive') {
                    const hasTripleUp = w.extractDuration && w.extractDuration > 0;
                    if (!hasTripleUp) {
                        fillRate *= 2.0;
                    }
                }
                w.atb = Math.min(100, w.atb + fillRate);
            }
            this.updateWeaponAtbUI(w.index, w.atb);
        });

        // Execute Turns
        if (this.monsterAtb >= 100 && (!this.monsterRoarDuration || this.monsterRoarDuration <= 0)) {
            if (this.selectedMonster.id.includes('valstrax') && this.monsterState === 'valstrax_charging') {
                this.executeValstraxChargeSuccess();
            } else {
                this.executeMonsterTurn();
            }
        }

        this.selectedWeapons.forEach(w => {
            if (w.atb >= 100 && (w.status === 'alive' || w.status === 'stunned') && !w.roarStunned) {
                this.executeHunterTurn(w);
            }
        });
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
        this.monsterAtb = 0;
        this.updateMonsterAtbUI(0);
        this.valstraxChargeCount++;
        
        if (this.valstraxChargeCount >= 3) {
            this.monsterState = 'enraged';
            this.valstraxEnrageTimer = 0;
            this.monsterSpeed = this.getMonsterSpeedForState('enraged');
            this.updateMonsterStateUI('분노 상태', `😡 분노한 ${this.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
            this.triggerMonsterRoarFlinch(false);
            this.addLog(`🔥 [분노] 발파루크가 3회의 흡기를 성공하여 전신이 붉게 폭발하며 분노 상태로 돌입합니다! (속도 1.5배, 공격력 1.5배)`, '#ff3b30');
            this.shakeMonster();
            
            // Reset charging state trackers
            this.valstraxChargeCount = 0;
            this.valstraxChargeDmg = 0;
            this.valstraxChargeTimer = 0;
        } else {
            this.monsterState = 'normal';
            this.valstraxChargeTimer = 0;
            this.monsterSpeed = this.getMonsterSpeedForState('normal');
            this.updateMonsterStateUI('일반 상태', this.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
            this.addLog(`⚡ [시동 성공] 발파루크가 기 모으기 흡기에 성공했습니다! (현재 성공: ${this.valstraxChargeCount}/3, 누적 시동 데미지: ${Math.round(this.valstraxChargeDmg)} / ${Math.round(this.monsterMaxHp * 0.10)})`, '#eee');
        }
    }

    triggerValstraxChargeInterrupt() {
        this.monsterKnockdownDuration = 70;
        this.monsterStunDuration = 0;
        this.monsterState = 'knocked_down';
        this.monsterAtb = 0;
        this.updateMonsterAtbUI(0);
        this.updateMonsterStateUI('대경직 상태', `💤 대경직에 쓰러진 ${this.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
        
        this.valstraxChargeCount = 0;
        this.valstraxChargeDmg = 0;
        this.valstraxChargeTimer = 0;

        if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();
        
        this.addLog(`💤 [시동 저지] 헌터들의 집중 포화로 발파루크의 시동 흡기가 저지되었습니다! 대경직에 쓰러집니다. (시동 횟수 및 누적 데미지 리셋)`, '#ff9500');
    }

    executeValstraxAmbushLanding() {
        this.addLog(`💥 [착륙 대폭발] 발파루크가 혜성처럼 지상으로 돌진 착륙하며 초거대 폭발을 일으킵니다!`, '#ff3333');
        this.playSFX('mh_heavy_hit.mp3', '격추');
        this.shakeMonster();

        const targets = this.selectedWeapons.filter(w => w.status === 'alive' || w.status === 'stunned');
        const attackResults = [];

        targets.forEach(target => {
            let damage = target.maxHp;

            // Normal Guard/Evade rolls
            const defendRoll = this.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;

            const isStunned = target.status === 'stunned';
            const hasShield = !isStunned && (target.type === 'shield' || target.id === 'heavy_bowgun');
            let guardProb = isStunned ? 0 : 0.85;
            let dodgeProb = isStunned ? 0 : 0.75;

            let foresightProb = 0.70;
            if (target.personality === 'veteran') {
                guardProb = 0.90;
                dodgeProb = 0.90;
                foresightProb = 0.90;
            } else if (target.personality === 'newbie') {
                guardProb = 0.45;
                dodgeProb = 0.35;
                foresightProb = 0.25;
            }

            if (!isStunned && target.id === 'long_sword' && defendRoll < foresightProb) {
                damage = 0;
                isDodge = true;
                isForesightSlash = true;
                target.spiritLevel = Math.min(3, (target.spiritLevel || 0) + 1);
            } else if (hasShield && defendRoll < guardProb) {
                damage = Math.max(1, Math.floor(damage * 0.08));
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                damage = 0;
                isDodge = true;
            }

            if (damage > 0) {
                // Moxie check
                if (target.hp - damage <= 0 && target.hasMoxie && this.random() < 0.75) {
                    target.hp = 1;
                    target.hasMoxie = false;
                    target.atb = 0;
                    this.updateWeaponAtbUI(target.index, 0);
                    this.addLog(`🔥 [근성 발휘!] ${target.name}이(가) 발파루크의 혜성 습격 폭발 속에서 근성으로 1 HP 생존했습니다!`, '#c98534');
                    this.playSFX('mh_guard.mp3', '오살았어');
                    this.shakeWeapon(target.index, '#00ffa3');
                    attackResults.push({ index: target.index, result: 'hit' });
                } else {
                    target.hp = Math.max(0, target.hp - damage);
                    if (isGuard) {
                        this.addLog(`🛡️ [방패 가드] ${target.name}이(가) 혜성 습격 폭발을 방어해냈습니다! (-${damage} HP)`, '#00ffff');
                        this.playSFX('mh_guard.mp3', '가드성공');
                        this.shakeWeapon(target.index, '#00ffff');
                        if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(target.index);
                        target.guardDuration = 6;
                        attackResults.push({ index: target.index, result: 'guard' });
                    } else {
                        target.atb = 0;
                        this.updateWeaponAtbUI(target.index, 0);
                        target.hitDuration = 25; // 피격 경직
                        this.addLog(`💥 [피격] ${target.name}이(가) 혜성 습격 직격! 치명적인 데미지를 입었습니다. (-${damage} HP)`, '#ff5555');
                        this.shakeWeapon(target.index);
                        this.triggerHitAnimation(target.index, damage);
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
            } else {
                if (isForesightSlash) {
                    this.addLog(`⚡ [간파베기] ${target.name}이(가) 혜성 습격 폭발을 간파베기로 흘려넘겼습니다! (현재 기인 게이지 레벨: ${target.spiritLevel}/3)`, '#c98534');
                    this.playSFX('mh_guard.mp3', '가드성공');
                    this.showSkillBubble(target.index, "간파베기!");
                    this.restoreBorder(target.index);
                    this.shakeWeapon(target.index, '#c98534');
                } else {
                    this.addLog(`🌀 [회피] ${target.name}이(가) 혜성 습격을 프레임 회피로 피했습니다!`, '#2eff7b');
                    this.playSFX('mh_dodge.mp3', '회피');
                    this.shakeWeapon(target.index, '#2eff7b', false, null, true);
                }
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(target.index);
                target.rollDuration = 6;
                attackResults.push({ index: target.index, result: 'dodge' });
            }

            // Sharpness/Ammo loss on hit
            if (damage > 0 && !isDodge) {
                if (target.type === 'ranged') {
                    target.ammo = Math.max(0, target.ammo - 1);
                } else {
                    target.sharpness = Math.max(0, target.sharpness - 8);
                }
            }

            this.updateHpUI(target);

            // Faint check
            if (target.hp <= 0) {
                this.triggerHunterCart(target);
            }
        });

        // Trigger dynamic monster attack animation on UI
        if (this.callbacks.onTriggerMonsterAttack) {
            this.callbacks.onTriggerMonsterAttack('elemental', '☄️', attackResults, '혜성 습격');
        }

        // Return monster to normal state
        this.monsterState = 'normal';
        this.valstraxChargeTimer = 0;
        this.valstraxChargeCount = 0;
        this.valstraxChargeDmg = 0;
        this.monsterSpeed = this.getMonsterSpeedForState('normal');
        this.updateMonsterStateUI('일반 상태', this.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
        this.addLog(`📢 발파루크가 착륙 후 지면을 고르며 일반 상태로 돌아왔습니다.`, '#eee');
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

            const hasShield = w.type === 'shield' || w.id === 'heavy_bowgun';
            let guardProb = 0.85;
            let dodgeProb = 0.75;

            let foresightProb = 0.70;
            if (w.personality === 'veteran') {
                guardProb = 0.90;
                dodgeProb = 0.90;
                foresightProb = 0.90;
            } else if (w.personality === 'newbie') {
                guardProb = 0.45;
                dodgeProb = 0.35;
                foresightProb = 0.25;
            }

            if (w.id === 'long_sword' && defendRoll < foresightProb) {
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
                this.addLog(`🛡️ [방패 가드] ${w.name}이(가) 포효를 방패로 막아내며 흔들림 없이 버팁니다!`, '#00ffff');
                this.playSFX('mh_guard.mp3', '가드성공');
                this.showSkillBubble(w.index, "가드!");
                this.shakeWeapon(w.index, '#00ffff');
                if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(w.index);
                w.guardDuration = 6;
            } else if (isDodge) {
                this.addLog(`🌀 [프레임 회피] ${w.name}이(가) 구르기 무적 시간으로 포효의 음파를 피해냈습니다!`, '#2eff7b');
                this.playSFX('mh_dodge.mp3', '회피');
                this.showSkillBubble(w.index, "회피!");
                this.shakeWeapon(w.index, '#2eff7b', false, null, true);
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(w.index);
                w.rollDuration = 6;
            } else {
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
