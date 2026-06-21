class HuntEngine {
    constructor(config) {
        this.selectedWeapons = config.selectedWeapons;
        this.selectedMonster = config.selectedMonster;
        this.bets = config.bets || {};
        this.consecutiveTotal = config.consecutiveTotal || 1;
        this.currentConsecutiveIndex = config.currentConsecutiveIndex || 0;
        this.consecutiveQueue = config.consecutiveQueue || [];
        this.callbacks = config.callbacks || {};
        
        // Monster Stats
        this.monsterTier = config.monsterTier || 'normal';
        this.monsterHp = config.monsterHp || 12000;
        this.monsterMaxHp = config.monsterMaxHp || 12000;
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

    updateTimerUI(timeSec) {
        if (this.callbacks.onUpdateTimerUI) this.callbacks.onUpdateTimerUI(timeSec);
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
        let baseSpeed = 2.2;
        if (state === 'enraged') baseSpeed = 3.3;
        else if (state === 'exhausted' || state === 'valstrax_charging') baseSpeed = 1.1;
        
        if (this.selectedMonster.id.includes('vaal_hazak')) {
            baseSpeed *= 0.75;
        }
        return baseSpeed;
    }

    triggerHunterCart(target) {
        target.status = 'dead';
        target.hp = 0; // 체력을 명확하게 0으로 설정
        target.atb = 0;
        target.roarStunned = false; // 포효 경직 상태 해제
        target.roarStunDuration = 0;
        target.stunDuration = 0; // 일반 기절 상태 해제
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
        if (Math.random() < 0.40) {
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
                if (w.speedGroup === 'very_fast') fillRate = 2.0;
                else if (w.speedGroup === 'fast') fillRate = 1.5;
                else if (w.speedGroup === 'slow') fillRate = 0.65;
                
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
        this.monsterAtb = 0;
        const targetable = this.selectedWeapons.filter(w => w.status === 'alive');
        if (targetable.length === 0) return;

        const maxTargets = Math.min(4, targetable.length);
        const numTargets = Math.floor(Math.random() * maxTargets) + 1;
        const shuffledTargets = [...targetable].sort(() => Math.random() - 0.5);
        const targetsToHit = shuffledTargets.slice(0, numTargets);

        const monsterKey = this.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
        const list = this.MONSTER_ATTACKS[monsterKey] || this.MONSTER_ATTACKS[this.selectedMonster.id] || this.MONSTER_ATTACKS.default;
        const attackName = list[Math.floor(Math.random() * list.length)];

        this.showSkillBubble('monster', attackName);

        // Charge trigger
        const isChargeAttack = attackName.includes('돌진') || attackName.includes('급습') || attackName.includes('휩쓸기') || attackName.includes('강습') || attackName.includes('활공') || attackName.includes('진격') || attackName.includes('습격') || attackName.includes('들이받기');
        if (isChargeAttack) {
            if (this.callbacks.onTriggerMonsterCharge) this.callbacks.onTriggerMonsterCharge();
        }

        let dmgMod = 1.0;
        if (this.monsterState === 'enraged') dmgMod = 1.5;
        else if (this.monsterState === 'exhausted') dmgMod = 0.5;

        const attackResults = [];

        targetsToHit.forEach(target => {
            let baseDmg = Math.floor(target.maxHp * 0.45);
            let damage = Math.floor(baseDmg * dmgMod * (this.monsterDamageMod || 1.0));

            // Great Sword Tackle check
            const isGreatSwordCharging = target.id === 'great_sword' && target.comboIndex >= 1 && target.comboIndex <= 3;
            if (isGreatSwordCharging) {
                damage = Math.floor(damage * 0.5);
                target.hp = Math.max(0, target.hp - damage);

                const counterDmg = 90;
                const counterStun = 70;
                this.monsterHp = Math.max(0, this.monsterHp - counterDmg);
                this.monsterStunAccum += counterStun;
                this.updateMonsterHpUI();

                if (this.selectedMonster.id.includes('valstrax') && this.monsterState === 'valstrax_charging') {
                    this.valstraxChargeDmg += counterDmg;
                    if (this.monsterHp > 0 && this.valstraxChargeDmg >= this.monsterMaxHp * 0.10) {
                        this.triggerValstraxChargeInterrupt();
                    }
                }

                // Stun check
                if (this.monsterHp > 0) {
                    if (this.monsterStunAccum >= this.monsterStunThreshold && this.monsterStunDuration <= 0) {
                        this.monsterStunDuration = 60;
                        this.monsterState = 'stunned';
                        this.monsterAtb = 0;
                        this.updateMonsterAtbUI(0);
                        this.updateMonsterStateUI('기절 상태', `💫 기절한 ${this.selectedMonster.nameKO} 💫`, { color: '#e58e26', bg: 'rgba(229,142,38,0.1)' });
                        // this.playSFX('mh_stun.mp3', '격추');
                        this.addLog(`💫 [기절] ${this.selectedMonster.nameKO}이(가) ${target.name}의 강한 타격을 머리에 입고 기절했습니다! 행동 게이지가 초기화되며 6초간 무력화됩니다.`, '#e58e26');
                    }
                }

                // Knockdown check
                this.checkMonsterKnockdown();

                this.addLog(`🛡️ [태클 카운터] ${target.name}이(가) 태클로 공격을 맞받아쳐 피해를 50% 경감하고 다음 모으기 연계로 진입합니다! (-${damage} HP, 반사 피해: -${counterDmg} HP, 기절치 +${counterStun})`, '#ff9500');
                this.updateHpUI(target);
                this.shakeWeapon(target.index, '#ff9500');
                if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(target.index);
                attackResults.push({ index: target.index, result: 'tackle' });
                if (target.hp <= 0) {
                    this.triggerHunterCart(target);
                }
                return;
            }

            // Normal Guard/Evade rolls
            const defendRoll = Math.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;

            const isStunned = target.status === 'stunned';
            const hasShield = !isStunned && (target.type === 'shield' || target.id === 'heavy_bowgun');
            let guardProb = isStunned ? 0 : 0.85;
            let dodgeProb = isStunned ? 0 : 0.75;

            // Personality-based dodge modifiers
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

            // Long Sword Foresight Slash
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
                if (target.hp - damage <= 0 && target.hasMoxie && Math.random() < 0.75) {
                    target.hp = 1;
                    target.hasMoxie = false;
                    target.atb = 0;
                    this.updateWeaponAtbUI(target.index, 0);
                    this.addLog(`🔥 [근성 발휘!] ${target.name}이(가) ${this.selectedMonster.nameKO}의 치명타를 입고 근성으로 1 HP 생존했습니다! (행동 게이지 초기화)`, '#c98534');
                    this.playSFX('mh_guard.mp3', '오살았어');
                    this.shakeWeapon(target.index, '#00ffa3');
                    attackResults.push({ index: target.index, result: 'hit' });
                } else {
                    target.hp = Math.max(0, target.hp - damage);
                    if (isGuard) {
                        this.addLog(`🛡️ [방패 가드] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 방어해냈습니다! (-${damage} HP)`, '#00ffff');
                        this.playSFX('mh_guard.mp3', '가드성공');
                        this.shakeWeapon(target.index, '#00ffff');
                        if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(target.index);
                        target.guardDuration = 6;
                        attackResults.push({ index: target.index, result: 'guard' });
                    } else {
                        target.atb = 0;
                        this.updateWeaponAtbUI(target.index, 0);
                        if (damage >= 30) {
                            target.hitDuration = 25; // 2.5 seconds
                        } else {
                            target.hitDuration = 10; // 1.0 second
                        }
                        this.addLog(`💥 [피격] ${this.selectedMonster.nameKO}이(가) [${attackName}] 시전! ${target.name}에게 큰 타격! (-${damage} HP, 행동 게이지 초기화)`, '#ff5555');
                        // this.playSFX('mh_hit.mp3', ['윽!', '으악!', '아야!'][Math.floor(Math.random() * 3)]);
                        this.shakeMonster();
                        this.shakeWeapon(target.index);
                        this.triggerHitAnimation(target.index, damage);
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
            } else {
                if (isForesightSlash) {
                    this.addLog(`⚡ [간파베기] ${target.name}이(가) 간파베기로 공격을 흘려내며 기인 게이지가 상승했습니다! (현재 레벨: ${target.spiritLevel}/3)`, '#c98534');
                    this.playSFX('mh_guard.mp3', '가드성공');
                    this.showSkillBubble(target.index, "간파베기!");
                    this.restoreBorder(target.index);
                    this.shakeWeapon(target.index, '#c98534');
                } else {
                    this.addLog(`🌀 [회피] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 구르기로 회피했습니다!`, '#2eff7b');
                    this.playSFX('mh_dodge.mp3', '회피');
                    this.shakeWeapon(target.index, '#2eff7b', false, null, true);
                }
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(target.index);
                target.rollDuration = 6;
                attackResults.push({ index: target.index, result: 'dodge' });
            }

            // Sharpness/Ammo penalty on hit
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
            } else {
                // Stun check (15% chance on raw damage)
                if (target.status === 'alive' && Math.random() < 0.15) {
                    target.status = 'stunned';
                    target.stunDuration = 50;
                    target.atb = 0;
                    this.updateWeaponAtbUI(target.index, 0);
                    this.addLog(`🌀 [기절] ${target.name}이(가) 큰 충격으로 기절했습니다! 행동 게이지가 초기화되며 다음 턴 행동이 불가합니다!`, '#e58e26');
                    // this.playSFX('mh_stun.mp3', '격추');
                    this.shakeWeapon(target.index, '#e58e26');
                    if (this.callbacks.onTriggerStunUI) this.callbacks.onTriggerStunUI(target.index, true);
                }
            }
        });

        // Trigger dynamic monster attack animation
        const { type: attackType, emoji } = this.getMonsterAttackType(attackName);
        if (this.callbacks.onTriggerMonsterAttack) {
            this.callbacks.onTriggerMonsterAttack(attackType, emoji, attackResults, attackName);
        }
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
        const name = monsterName || "몬스터";
        const materials = ["비늘", "갑각", "발톱", "꼬리", "날개", "꼬리뼈"];
        const randomMat = materials[Math.floor(Math.random() * materials.length)];
        return `${name}의 ${randomMat}`;
    }

    triggerHitAnimation(idx, damage) {
        if (this.callbacks.onTriggerHitAnimation) this.callbacks.onTriggerHitAnimation(idx, damage);
    }

    checkMonsterKnockdown() {
        if (this.selectedMonster.id.includes('valstrax')) {
            return; // 발파루크는 일반 체력 기반 대경직 없음
        }
        const hpRatio = (this.monsterHp / this.monsterMaxHp) * 100;
        let triggerKnockdown = false;
        if (this.monsterHp > 0) {
            if (hpRatio <= 80 && !this.monsterKnockdownTriggered[80]) {
                this.monsterKnockdownTriggered[80] = true;
                triggerKnockdown = true;
            }
            if (hpRatio <= 60 && !this.monsterKnockdownTriggered[60]) {
                this.monsterKnockdownTriggered[60] = true;
                triggerKnockdown = true;
            }
            if (hpRatio <= 40 && !this.monsterKnockdownTriggered[40]) {
                this.monsterKnockdownTriggered[40] = true;
                triggerKnockdown = true;
            }
            if (hpRatio <= 20 && !this.monsterKnockdownTriggered[20]) {
                this.monsterKnockdownTriggered[20] = true;
                triggerKnockdown = true;
            }
        }

        if (triggerKnockdown) {
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
        if (w.hitDuration && w.hitDuration > 0) {
            w.atb = 0;
            return;
        }
        w.atb = 0;



        // Personality-based heal probability
        let healProb = 0.65;
        if (w.personality === 'offensive') healProb = 0.40;
        else if (w.personality === 'defensive') healProb = 0.85;
        else if (w.personality === 'veteran') healProb = 0.80;
        else if (w.personality === 'support') healProb = 0.75;
        else if (w.personality === 'newbie') healProb = 0.30;

        // 몬린이 전용 돌발 행동 패턴 (채집 딴짓 20%, 분노 시 공황 도주 35%)
        if (w.personality === 'newbie') {
            const roll = Math.random();
            if (roll < 0.20) {
                w.itemDuration = 15; // 1.5초 행동 봉쇄
                if (this.consecutiveTotal > 1 && this.currentConsecutiveIndex > 0 && Math.random() < 0.5) {
                    const prevMonster = this.consecutiveQueue[this.currentConsecutiveIndex - 1];
                    const prevMonsterName = prevMonster ? prevMonster.nameKO : "이전 몬스터";
                    const material = this.getPreviousMonsterMaterial(prevMonsterName);
                    w.isGathering = true;
                    this.addLog(`😅 [몬린이 딴짓] ${w.hunterName} (${w.name})이(가) 전투 도중 이전 토벌 대상인 [${prevMonsterName}]의 사체로 달려가 갈무리를 시도합니다! (획득: ${material})`, '#c98534');
                    this.playAudioFile('Unified_SFX/MH - Item Found.mp3');
                    this.spawnEmojiBubble(w.index, `🏃`);
                    this.shakeWeapon(w.index, '#c98534');
                    setTimeout(() => { w.isGathering = false; }, 2500);
                } else {
                    w.isGathering = true;
                    this.addLog(`🌿 [몬린이 딴짓] ${w.hunterName} (${w.name})이(가) 이쁜 풀꽃을 채집하느라 한눈을 팝니다! (획득: 약초)`, '#aaffaa');
                    this.playAudioFile('Unified_SFX/MH - Item Found.mp3');
                    this.spawnEmojiBubble(w.index, `🌿`);
                    this.shakeWeapon(w.index, '#aaffaa');
                    setTimeout(() => { w.isGathering = false; }, 2500);
                }
                return;
            } else if (this.monsterState === 'enraged' && Math.random() < 0.35) {
                w.itemDuration = 15; // 1.5초 행동 봉쇄
                this.addLog(`😱 [몬린이 공황] ${w.hunterName} (${w.name})이(가) 몬스터의 분노에 기겁하며 비명을 지르고 도망다닙니다! (무기 해제, 1.5초간 공황)`, '#ff5555');
                this.playAudioFile('Unified_SFX/Unified_Rathian_Roar.mp3');
                this.spawnEmojiBubble(w.index, `😱`);
                this.shakeWeapon(w.index, '#ff5555');
                return;
            }
        }

        // Veteran / Support team heal AI (Lifepowder)
        const isHealer = w.personality === 'veteran' || w.personality === 'support';
        if (isHealer && w.lifepowders && w.lifepowders > 0) {
            const damagedTeammates = this.selectedWeapons.filter(m => m.status === 'alive' && m.hp <= m.maxHp * 0.55);
            if (damagedTeammates.length > 0) {
                w.lifepowders--;
                w.itemDuration = 15;
                this.selectedWeapons.forEach(m => {
                    if (m.status === 'alive') {
                        m.hp = Math.min(m.maxHp, m.hp + 25);
                        m.atb = Math.min(100, m.atb + 60);
                        this.updateHpUI(m);
                        this.updateWeaponAtbUI(m.index, m.atb);
                    }
                });
                this.addLog(`🌿 [생명의 가루] ${w.hunterName}이(가) 생명의 가루를 흩뿌려 아군 전체 회복 및 ATB 충전! (+25 HP, +60 ATB)`, '#00ffaa');
                this.playAudioFile('Unified_SFX/MH - Item Found.mp3');
                this.showSkillBubble(w.index, "🌿 생명의 가루!");
                this.selectedWeapons.forEach(m => {
                    if (m.status === 'alive') this.shakeWeapon(m.index, '#00ffaa');
                });
                return;
            }
        }

        // Support Trap or Stonefall AI
        if (w.personality === 'support') {
            // Trapping
            if (this.monsterState === 'normal' && (!w.trapsUsed || w.trapsUsed < 2)) {
                w.trapsUsed = (w.trapsUsed || 0) + 1;
                w.itemDuration = 20;
                this.monsterKnockdownDuration = 40;
                this.monsterState = 'knocked_down';
                this.monsterAtb = 0;
                this.updateMonsterAtbUI(0);
                this.updateMonsterStateUI('구멍함정 상태', `🕸️ 함정에 빠진 ${this.selectedMonster.nameKO} 🕸`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
                
                if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();

                this.addLog(`🕸️ [함정 설치] ${w.hunterName}이(가) 구멍함정으로 몬스터를 구속했습니다! 행동 게이지가 초기화되며 4초간 무력화됩니다.`, '#e0ffa3');
                // this.playSFX('mh_stun.mp3', '격추');
                this.shakeWeapon(w.index, '#e0ffa3');
                return;
            }
            // Stonefall on elder dragons
            if (this.monsterTier === 'elder' && (!w.stonesUsed || w.stonesUsed < 2) && Math.random() < 0.6) {
                w.stonesUsed = (w.stonesUsed || 0) + 1;
                w.itemDuration = 20;
                this.monsterKnockdownDuration = 70;
                this.monsterState = 'knocked_down';
                this.monsterAtb = 0;
                this.updateMonsterAtbUI(0);
                this.updateMonsterStateUI('낙석 대경직', `💤 낙석에 깔린 ${this.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
                
                if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();

                this.addLog(`💥 [낙석격동] ${w.hunterName}이(가) 지형 낙석을 맞춰 몬스터에게 대경직을 유발했습니다! 행동 게이지가 초기화되며 7초간 무력화됩니다.`, '#c98534');
                // this.playSFX('mh_stun.mp3', '격추');
                this.shakeWeapon(w.index, '#c98534');
                return;
            }

            // Gather lifepowder if empty
            if ((!w.lifepowders || w.lifepowders === 0) && Math.random() < 0.4) {
                w.lifepowders = 1;
                w.atb = 60;
                w.isGathering = true;
                this.addLog(`🌿 [채집] ${w.hunterName}이(가) 허브를 채집해 라이프파우더 1개를 보충했습니다!`, '#aaffaa');
                this.playAudioFile('Unified_SFX/MH - Item Found (rare).mp3');
                this.spawnEmojiBubble(w.index, `🌿`);
                this.shakeWeapon(w.index, '#aaffaa');
                setTimeout(() => { w.isGathering = false; }, 2500);
                return;
            }
        }

        // Self potion recovery (몬린이는 80% 이하일 때 95% 확률로 조기/강박적 복용)
        const hpThreshold = w.personality === 'newbie' ? 0.80 : 0.55;
        const currentHealProb = w.personality === 'newbie' ? 0.95 : healProb;
        if (w.hp <= w.maxHp * hpThreshold && w.potions > 0 && Math.random() < currentHealProb) {
            w.potions--;
            w.itemDuration = 20;
            const healAmount = Math.round(w.maxHp * 0.60);
            w.hp = Math.min(w.maxHp, w.hp + healAmount);
            this.addLog(`🧪 [포션] ${w.hunterName} (${w.name})이(가) 비약을 복용 +${healAmount} HP (남은 물약: ${w.potions}/10)`, '#2eff7b');
            this.playAudioFile('Unified_SFX/Potion Drink.mp3', null, 2.5);
            this.updateHpUI(w);
            this.updatePotionCountUI(w.index, w.potions);
            this.showSkillBubble(w.index, `🧪 물약 회복 (+60%)`);
            this.shakeWeapon(w.index, '#2eff7b');
            return;
        }

        // Ranged reload (몬린이는 잔탄 3발 이하일 때 강박적 재장전)
        const ammoThreshold = w.personality === 'newbie' ? 3 : 0;
        if (w.type === 'ranged' && w.ammo <= ammoThreshold) {
            const prevAmmo = w.ammo;
            w.ammo = 5;
            w.itemDuration = 12;
            this.addLog(`🔄 [재장전] ${w.hunterName} (${w.name})이(가) 탄창을 갈고 재장전을 실행합니다. (재장전 전 잔탄: ${prevAmmo}/5)`, '#00a8ff');
            this.playSFX('mh_reload.mp3', '팅!');
            this.shakeWeapon(w.index, '#00a8ff');
            return;
        }

        // Melee sharpening (몬린이는 예리도 75 이하일 때 강박적 숫돌질)
        const sharpnessThreshold = w.personality === 'newbie' ? 75 : 30;
        if (w.type !== 'ranged' && w.sharpness <= sharpnessThreshold) {
            const prevSharpness = w.sharpness;
            w.sharpness = 100;
            w.itemDuration = 30;
            this.addLog(`✨ [숫돌질] ${w.hunterName} (${w.name})이(가) 구석에서 숫돌을 갈아 예리도를 회복합니다! (숫돌질 전 예리도: ${prevSharpness}/100)`, '#c98534');
            this.playAudioFile('Unified_SFX/MH - Combine Item.mp3');
            this.shakeWeapon(w.index, '#c98534');
            return;
        }

        // Check if Valstrax is flying (untargetable)
        if (this.selectedMonster.id.includes('valstrax') && this.monsterState === 'valstrax_flying') {
            this.addLog(`💨 [공격 실패] 발파루크가 고공 비행 중이라 ${w.name}의 공격이 공중으로 헛돌았습니다!`, '#aaa');
            this.shakeWeapon(w.index, '#aaa');
            return;
        }

        // Execute combos
        const combos = this.COMBO_LIST[w.id] || [];
        let currentCombo = combos[w.comboIndex];
        let isKnockdownAttack = false;

        let bypassKnockdownMaxDmg = w.id === 'great_sword';
        if (w.id === 'charge_blade' && (w.phials || 0) === 0) {
            bypassKnockdownMaxDmg = true;
        }

        if (this.monsterState === 'knocked_down' && combos.length > 0 && !bypassKnockdownMaxDmg) {
            let maxDmgCombo = combos[0];
            for (let i = 1; i < combos.length; i++) {
                if (combos[i].name === '기인투구깨기') {
                    if (w.id === 'long_sword' && (w.spiritLevel || 0) < 3) continue;
                }
                // Charge Blade phial/shield checks for knockdown attacks
                if (w.id === 'charge_blade') {
                    const isShieldCharged = w.shieldChargeDuration && w.shieldChargeDuration > 0;
                    const phialCount = w.phials || 0;
                    if (combos[i].name === '초고출력 속성해방베기') {
                        if (!isShieldCharged || phialCount === 0) continue;
                    }
                    if (combos[i].name === '고출력 속성해방베기') {
                        if (phialCount === 0) continue;
                    }
                    if (combos[i].name === '도끼 속성해방베기 I') {
                        if (phialCount === 0) continue;
                    }
                }
                // Insect Glaive cannot use high damage combo without tripleUp buff active
                if (w.id === 'insect_glaive') {
                    const hasTripleUp = w.extractDuration && w.extractDuration > 0;
                    if (!hasTripleUp && combos[i].name !== '진액 추출') continue;
                }
                if (combos[i].dmg > maxDmgCombo.dmg) {
                    maxDmgCombo = combos[i];
                }
            }
            if (maxDmgCombo) {
                currentCombo = maxDmgCombo;
                isKnockdownAttack = true;
            }
        }

        // Dual blades demon mode bypass reload index 0
        if (w.id === 'dual_blades' && w.comboIndex === 0 && w.demonModeDuration > 0) {
            w.comboIndex = 1;
            currentCombo = combos[1] || currentCombo;
        }

        // Long Sword spiritLevel threshold for Helm Breaker
        if (w.id === 'long_sword' && w.comboIndex === 3 && (w.spiritLevel || 0) < 3) {
            w.comboIndex = 0;
            currentCombo = combos[0];
        }

        // Gunlance overheat bypass
        if (w.id === 'gunlance' && w.comboIndex === 3) {
            if (w.overheatDuration && w.overheatDuration > 0) {
                w.comboIndex = 0;
                currentCombo = combos[0];
            }
        }

        // Charge Blade special combo overrides
        if (w.id === 'charge_blade') {
            const isShieldCharged = w.shieldChargeDuration && w.shieldChargeDuration > 0;
            
            // 1. Intercept Move 3 if shield not charged and phials === 5
            if (w.comboIndex === 3 && !isKnockdownAttack) {
                if (!isShieldCharged && (w.phials || 0) === 5) {
                    currentCombo = { name: "방패강화", dmg: 0, sharp: -2 };
                }
            }

            // 2. Downgrade Axe attacks if phials are empty
            if ((w.comboIndex === 4 || w.comboIndex === 5 || w.comboIndex === 6) && (w.phials || 0) === 0) {
                currentCombo = combos[7]; // 변형 (도끼→검)
                w.comboIndex = 7;
            }

            // 3. Downgrade SAED to AED if shield not charged
            if (currentCombo && currentCombo.name === '초고출력 속성해방베기') {
                if (!isShieldCharged) {
                    currentCombo = combos[5];
                }
            }
        }

        // Insect Glaive extracts restriction (No attack combos without 3-extract tripleUp active)
        if (w.id === 'insect_glaive') {
            const hasTripleUp = w.extractDuration && w.extractDuration > 0;
            if (!hasTripleUp) {
                w.comboIndex = 0;
                currentCombo = combos[0];
                isKnockdownAttack = false;
            } else {
                if (w.comboIndex === 0) {
                    w.comboIndex = 1;
                }
                currentCombo = combos[w.comboIndex];
            }
        }

        if (currentCombo) {
            let damage = currentCombo.dmg;

            // Multipliers
            if (w.id === 'long_sword') {
                const spiritMults = { 0: 1.0, 1: 1.05, 2: 1.10, 3: 1.20 };
                const mult = spiritMults[w.spiritLevel || 0] || 1.0;
                damage = Math.floor(damage * mult);
            }
            if (w.id === 'dual_blades' && w.demonModeDuration > 0) {
                damage = Math.floor(damage * 1.2);
            }

            // Charge Blade special phial costs
            if (w.id === 'charge_blade') {
                if (currentCombo.name === '방패강화') {
                    w.phials = 0;
                    w.shieldChargeDuration = 60;
                    this.addLog(`🛡️ [방패강화] ${w.hunterName}이(가) 병 5개를 소모하여 차지액스의 방패를 고출력 속성강화 상태로 강화했습니다! (60초간 유지)`, '#e84393');
                    this.playSFX('mh_reload.mp3', '재장전');
                    this.restoreBorder(w.index);
                    this.updatePhialsUI(w.index, w.phials);
                } else if (currentCombo.name === '병충전') {
                    w.phials = 5;
                    this.addLog(`⚡ [병충전] ${w.hunterName}이(가) 검 에너지를 병에 주입하여 병 5개를 완전히 장전했습니다!`, '#00a8ff');
                    this.playSFX('mh_reload.mp3', '재장전');
                    this.updatePhialsUI(w.index, w.phials);
                } else if (currentCombo.name === '도끼 속성해방베기 I') {
                    if ((w.phials || 0) > 0) {
                        w.phials--;
                        damage += 70;
                        this.addLog(`⚡ [병소모] 도끼 속성해방베기 I! 병 1개를 소비하여 속성 추타를 가합니다! (남은 병: ${w.phials}/5)`, '#c98534');
                        this.updatePhialsUI(w.index, w.phials);
                    }
                } else if (currentCombo.name === '고출력 속성해방베기') {
                    if ((w.phials || 0) > 0) {
                        w.phials--;
                        damage += 100;
                        this.addLog(`⚡ [병소모] 고출력 속성해방베기! 병 1개를 소비하여 속성 충격파가 추가 폭발합니다! (남은 병: ${w.phials}/5)`, '#c98534');
                        this.updatePhialsUI(w.index, w.phials);
                    }
                } else if (currentCombo.name === '초고출력 속성해방베기') {
                    const phialsUsed = w.phials || 0;
                    w.phials = 0;
                    damage += phialsUsed * 120;
                    this.addLog(`💥 [초고출력] 초고출력 속성해방베기! 병 ${phialsUsed}개를 한꺼번에 해방하여 전천후 대폭발을 일으킵니다! (데미지 +${phialsUsed * 120})`, '#ff3333');
                    this.playSFX('mh_heavy_hit.mp3', '팅!');
                    this.updatePhialsUI(w.index, w.phials);
                }
            }

            // Gunlance special overheat trigger
            if (w.id === 'gunlance' && currentCombo.name === '용격포') {
                w.overheatDuration = 30;
                this.addLog(`🔥 [용격포] ${w.hunterName}이(가) 용격포를 격발했습니다! 대량의 열기로 인해 30초간 오버히트 상태가 됩니다!`, '#ff5500');
                this.playSFX('mh_reload.mp3', '재장전');
                this.updateOverheatUI(w.index, w.overheatDuration);
            }

            // Insect Glaive extracts tripleUp
            if (w.id === 'insect_glaive') {
                if (currentCombo.name === '진액 추출') {
                    let colorAcquired = "";
                    if (!w.extractBuffs.red) {
                        w.extractBuffs.red = 1;
                        colorAcquired = "빨강";
                    } else if (!w.extractBuffs.white) {
                        w.extractBuffs.white = 1;
                        colorAcquired = "하양";
                    } else if (!w.extractBuffs.orange) {
                        w.extractBuffs.orange = 1;
                        colorAcquired = "주황";
                    }

                    if (colorAcquired) {
                        this.addLog(`🐝 [진액 획득] ${w.hunterName}이(가) ${colorAcquired} 진액을 획득했습니다!`, '#e0ffa3');
                        this.playAudioFile('Unified_SFX/MH - Combine Item.mp3');
                    }
                    this.updateExtractsUI(w.index, w.extractBuffs);

                    if (w.extractBuffs.red && w.extractBuffs.white && w.extractBuffs.orange && (!w.extractDuration || w.extractDuration === 0)) {
                        w.extractDuration = 90;
                        this.addLog(`🐝 [진액 트리플업] ${w.hunterName}이(가) 3색 진액을 모두 획득하여 90초간 공격력이 30% 증가합니다!`, '#c98534');
                        this.playSFX('mh_reload.mp3', '재장전');
                        this.restoreBorder(w.index);
                    }
                }

                if (w.extractDuration && w.extractDuration > 0) {
                    damage = Math.floor(damage * 1.3);
                }
            }

            // Dual Blades Demon Mode activation
            if (w.id === 'dual_blades' && currentCombo.name === '귀인화 진입') {
                w.demonModeDuration = 20;
                this.addLog(`👹 [귀인화 발동] ${w.hunterName}이(가) 20초간 귀인화 상태에 돌입합니다! (공격력 +20%, ATB 수급 +20%)`, '#e74c3c');
                this.playSFX('mh_reload.mp3', '재장전');
                this.restoreBorder(w.index);
            }

            // Long Sword spiritLevel progressions
            if (w.id === 'long_sword') {
                if (currentCombo.name === '기인베기 II') {
                    w.spiritLevel = Math.min(3, (w.spiritLevel || 0) + 1);
                    this.addLog(`✨ [기인 연계] ${w.hunterName}이(가) 기인베기 II를 성공시켜 기인 게이지 레벨이 상승했습니다! (현재 레벨: ${w.spiritLevel}/3)`, '#c98534');
                    this.restoreBorder(w.index);
                } else if (currentCombo.name === '기인투구깨기') {
                    w.spiritLevel = Math.max(0, (w.spiritLevel || 0) - 1);
                    this.addLog(`💥 [기인투구깨기] ${w.hunterName}이(가) 공중에서 내리치며 기인투구깨기를 시전했습니다! 기인 게이지 레벨 1 소모! (현재 레벨: ${w.spiritLevel}/3)`, '#e74c3c');
                    this.restoreBorder(w.index);
                }
            }

            // Sharpness/Ammo loss on strike
            let isDull = false;
            if (w.type !== 'ranged' && w.sharpness <= 30) {
                damage = Math.floor(damage * 0.5);
                isDull = true;
            }

            if (w.type === 'ranged') {
                w.ammo = Math.max(0, w.ammo - (currentCombo.ammo || 1));
            } else {
                w.sharpness = Math.max(0, w.sharpness - (currentCombo.sharp || 5));
            }

            // Apply Damage to Monster
            this.monsterHp = Math.max(0, this.monsterHp - damage);
            this.updateMonsterHpUI();

            if (this.selectedMonster.id.includes('valstrax') && this.monsterState === 'valstrax_charging') {
                this.valstraxChargeDmg += damage;
                if (this.monsterHp > 0 && this.valstraxChargeDmg >= this.monsterMaxHp * 0.10) {
                    this.triggerValstraxChargeInterrupt();
                }
            }

            // Stun values accumulation
            if (currentCombo.stun && currentCombo.stun > 0) {
                this.monsterStunAccum += currentCombo.stun;
            }

            // Check monster knockdown milestones
            this.checkMonsterKnockdown();

            // Hit sound triggers
            let soundKey = '';
            if (currentCombo.name && (currentCombo.name.includes('회전 회오리') || currentCombo.name.includes('회전회오리'))) {
                soundKey = '회전회오리';
            } else if (currentCombo.soundKey) {
                if (Array.isArray(currentCombo.soundKey)) {
                    soundKey = currentCombo.soundKey[Math.floor(Math.random() * currentCombo.soundKey.length)];
                } else {
                    soundKey = currentCombo.soundKey;
                }
            } else if (currentCombo.stun && currentCombo.stun > 0) {
                soundKey = '타격음_베기';
            } else if (currentCombo.dmg > 300) {
                soundKey = '타격음_무겁';
            } else {
                soundKey = '타격음_베기';
            }
            this.playSFX(null, soundKey);

            if (isKnockdownAttack) {
                this.addLog(`✨ [대경직 찬스!] ${w.name}이(가) 최강 기술 [${currentCombo.name}] 시전! (-${damage} HP)`, '#ff9500');
            } else if (isDull) {
                this.addLog(`⚔️ [무딘 벰] ${w.name}이(가) 예리도 소모 상태로 공격을 가해 피해가 반감되었습니다! (-${damage} HP)`, '#aaaaaa');
            } else {
                this.addLog(`⚔️ [연계-${w.comboIndex+1}] ${w.name}의 [${currentCombo.name}] 시전! 몬스터를 타격! (-${damage} HP)`, '#eee');
            }

            // [Fix] Trigger hunter skill speech bubble
            this.showSkillBubble(w.index, currentCombo.name);

            this.shakeMonster();
            this.shakeWeapon(w.index, '#ff9500', true, currentCombo.name);

            // Set attack duration based on attack type (ATB pauses during attack)
            let attackTicks = 10; // Default 1.0s
            if (isKnockdownAttack) {
                attackTicks = 18; // Heavy knockdown attack takes 1.8s
            } else if (currentCombo.name && (
                currentCombo.name.includes('초고출력') || 
                currentCombo.name.includes('고출력') || 
                currentCombo.name.includes('투구깨기') || 
                currentCombo.name.includes('용격포') || 
                currentCombo.name.includes('참모아')
            )) {
                attackTicks = 18; // Special/heavy attacks take 1.8s
            }
            w.attackDuration = attackTicks;

            // Advance combo index (except during knockdown)
            if (!isKnockdownAttack) {
                if (w.id === 'great_sword' && w.comboIndex === 3) {
                    w.comboIndex = 1;
                } else {
                    w.comboIndex = (w.comboIndex + 1) % combos.length;
                }
            }
        }
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
            const defendRoll = Math.random();
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
                if (target.hp - damage <= 0 && target.hasMoxie && Math.random() < 0.75) {
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

            const defendRoll = Math.random();
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
