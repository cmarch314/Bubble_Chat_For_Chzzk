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
        this.monsterSpeed = config.monsterSpeed || 2.2;
        this.monsterState = config.monsterState || 'normal';
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

    shakeWeapon(idx, borderClr, isAttack, moveName) {
        if (this.callbacks.onShakeWeapon) this.callbacks.onShakeWeapon(idx, borderClr, isAttack, moveName);
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

    triggerMonsterRoar(monster) {
        if (this.callbacks.onTriggerMonsterRoar) this.callbacks.onTriggerMonsterRoar(monster);
    }

    triggerGameEnd(victory, winner) {
        if (this.callbacks.onGameEnd) this.callbacks.onGameEnd(victory, winner);
    }

    triggerNextConsecutive() {
        if (this.callbacks.onNextConsecutive) this.callbacks.onNextConsecutive();
    }

    processTick() {
        this.battleTime++;
        this.updateTimerUI(this.battleTime);

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
                    if (w.id === 'charge_blade') w.phials = 5;
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

        // Buff / Overheat counters
        this.selectedWeapons.forEach(w => {
            if (w.status === 'alive') {
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
                if (w.id === 'insect_glaive' && w.extractDuration && w.extractDuration > 0) {
                    w.extractDuration--;
                    if (w.extractDuration === 0) {
                        w.extractBuffs = { red: 0, white: 0, orange: 0 };
                        this.addLog(`🐝 [진액 버프 해제] ${w.hunterName}의 3색 진액 효과가 소멸되었습니다.`, '#aaa');
                        this.restoreBorder(w.index);
                    }
                }
            }
        });

        // Monster State Loop (1-minute loop: normal -> enraged -> normal -> exhausted)
        const loopTime = this.battleTime % 240;
        let nextState = 'normal';
        if (loopTime >= 60 && loopTime < 120) {
            nextState = 'enraged';
        } else if (loopTime >= 120 && loopTime < 180) {
            nextState = 'normal';
        } else if (loopTime >= 180 && loopTime < 240) {
            nextState = 'exhausted';
        }

        if (this.monsterState !== 'knocked_down' && this.monsterState !== 'stunned' && nextState !== this.monsterState) {
            this.monsterState = nextState;
            if (this.monsterState === 'enraged') {
                this.monsterSpeed = 3.3;
                this.updateMonsterStateUI('분노 상태', `😡 분노한 ${this.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
                this.triggerMonsterRoarFlinch(false);
                this.addLog(`🔥 [분노] ${this.selectedMonster.nameKO}이(가) 포효를 지르며 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                this.shakeMonster();
            } else if (this.monsterState === 'exhausted') {
                this.monsterSpeed = 1.1;
                this.updateMonsterStateUI('탈진 상태', `🤤 탈진한 ${this.selectedMonster.nameKO} 🤤`, { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' });
                this.playSFX('mh_cart.mp3', '아이고~');
                this.addLog(`🤤 [탈진] ${this.selectedMonster.nameKO}이(가) 스태미나 고갈로 비틀거립니다! (속도 0.5배, 공격력 0.5배)`, '#00a8ff');
                this.shakeMonster();
            } else {
                this.monsterSpeed = 2.2;
                this.updateMonsterStateUI('일반 상태', this.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                this.addLog(`📢 ${this.selectedMonster.nameKO}이(가) 진정하여 평상시로 돌아왔습니다.`, '#eee');
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
                const loopTime = this.battleTime % 240;
                let restoreState = 'normal';
                if (loopTime >= 60 && loopTime < 120) restoreState = 'enraged';
                else if (loopTime >= 180 && loopTime < 240) restoreState = 'exhausted';

                this.monsterState = restoreState;
                this.monsterSpeed = restoreState === 'enraged' ? 3.3 : (restoreState === 'exhausted' ? 1.1 : 2.2);

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
                const loopTime = this.battleTime % 240;
                let restoreState = 'normal';
                if (loopTime >= 60 && loopTime < 120) restoreState = 'enraged';
                else if (loopTime >= 180 && loopTime < 240) restoreState = 'exhausted';

                this.monsterState = restoreState;
                this.monsterSpeed = restoreState === 'enraged' ? 3.3 : (restoreState === 'exhausted' ? 1.1 : 2.2);

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
        } else if (this.monsterRoarDuration > 0) {
            // 포효 시전 중에는 몬스터 ATB가 충전되지 않음
        } else {
            this.monsterAtb = Math.min(100, this.monsterAtb + this.monsterSpeed);
        }
        this.updateMonsterAtbUI(this.monsterAtb);

        // Hunter ATB
        this.selectedWeapons.forEach(w => {
            if ((w.status === 'alive' || w.status === 'stunned') && !w.roarStunned) {
                let fillRate = 1.0;
                if (w.speedGroup === 'very_fast') fillRate = 2.0;
                else if (w.speedGroup === 'fast') fillRate = 1.5;
                else if (w.speedGroup === 'slow') fillRate = 0.65;
                
                if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                    fillRate *= 1.2;
                }
                w.atb = Math.min(100, w.atb + fillRate);
                this.updateWeaponAtbUI(w.index, w.atb);
            }
        });

        // Execute Turns
        if (this.monsterAtb >= 100 && (!this.monsterRoarDuration || this.monsterRoarDuration <= 0)) {
            this.executeMonsterTurn();
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

                // Stun check
                if (this.monsterHp > 0) {
                    if (this.monsterStunAccum >= this.monsterStunThreshold && this.monsterStunDuration <= 0) {
                        this.monsterStunDuration = 60;
                        this.monsterState = 'stunned';
                        this.updateMonsterStateUI('기절 상태', `💫 기절한 ${this.selectedMonster.nameKO} 💫`, { color: '#e58e26', bg: 'rgba(229,142,38,0.1)' });
                        this.playSFX('mh_stun.mp3', '격추');
                        this.addLog(`💫 [기절] ${this.selectedMonster.nameKO}이(가) ${target.name}의 강한 타격을 머리에 입고 기절했습니다! (6초간 무력화)`, '#e58e26');
                    }
                }

                // Knockdown check
                this.checkMonsterKnockdown();

                this.addLog(`🛡️ [태클 카운터] ${target.name}이(가) 태클로 공격을 맞받아쳐 피해를 50% 경감하고 다음 모으기 연계로 진입합니다! (-${damage} HP, 반사 피해: -${counterDmg} HP, 기절치 +${counterStun})`, '#ff9500');
                this.updateHpUI(target);
                this.shakeWeapon(target.index, '#ff9500');
                if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(target.index);
                attackResults.push({ index: target.index, result: 'tackle' });
                return;
            }

            // Normal Guard/Evade rolls
            const defendRoll = Math.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;

            const hasShield = target.type === 'shield' || target.id === 'heavy_bowgun';
            let guardProb = 0.85;
            let dodgeProb = 0.75;

            // Personality-based dodge modifiers
            if (target.personality === 'veteran') {
                guardProb = 0.90;
                dodgeProb = 0.90;
            } else if (target.personality === 'newbie') {
                guardProb = 0.45;
                dodgeProb = 0.35;
            }

            // Long Sword Foresight Slash (75%)
            if (target.id === 'long_sword' && defendRoll < 0.75) {
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
                    this.addLog(`🔥 [근성 발휘!] ${target.name}이(가) ${this.selectedMonster.nameKO}의 치명타를 입고 근성으로 1 HP 생존했습니다!`, '#ffaa00');
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
                        attackResults.push({ index: target.index, result: 'guard' });
                    } else {
                        this.addLog(`💥 [피격] ${this.selectedMonster.nameKO}이(가) [${attackName}] 시전! ${target.name}에게 큰 타격! (-${damage} HP)`, '#ff5555');
                        this.playSFX('mh_hit.mp3', ['윽!', '으악!', '아야!'][Math.floor(Math.random() * 3)]);
                        this.shakeMonster();
                        this.shakeWeapon(target.index);
                        this.triggerHitAnimation(target.index, damage);
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
            } else {
                if (isForesightSlash) {
                    this.addLog(`⚡ [간파베기] ${target.name}이(가) 간파베기로 공격을 흘려내며 기인 게이지가 상승했습니다! (현재 레벨: ${target.spiritLevel}/3)`, '#ffaa00');
                    this.playSFX('mh_guard.mp3', '가드성공');
                    this.showSkillBubble(target.index, "간파베기!");
                    this.restoreBorder(target.index);
                    this.shakeWeapon(target.index, '#ffaa00');
                } else {
                    this.addLog(`🌀 [회피] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 구르기로 회피했습니다!`, '#2eff7b');
                    this.playSFX('mh_dodge.mp3', '회피');
                    this.shakeWeapon(target.index, '#2eff7b');
                }
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(target.index);
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
                target.status = 'dead';
                target.atb = 0;
                this.cartCount++;
                this.updateCartUI(this.cartCount);
                this.addLog(`🚨 [수레행] ${target.name}이(가) 쓰러졌습니다! 5초 후 부활합니다. (현재 수레: ${this.cartCount}/3)`, '#ff3b30');
                this.playAudioFile('Unified_SFX/Player Fainted.mp3', 3500);
                if (this.callbacks.onTriggerDeathTag) this.callbacks.onTriggerDeathTag(target.index);
                target.cartTimer = 50; // 5.0 seconds
            } else {
                // Stun check (15% chance on raw damage)
                if (target.status === 'alive' && Math.random() < 0.15) {
                    target.status = 'stunned';
                    this.addLog(`🌀 [기절] ${target.name}이(가) 큰 충격으로 기절했습니다! 다음 턴 행동 불가!`, '#e58e26');
                    this.playSFX('mh_stun.mp3', '격추');
                    this.shakeWeapon(target.index, '#e58e26');
                    if (this.callbacks.onTriggerStunUI) this.callbacks.onTriggerStunUI(target.index, true);
                }
            }
        });

        // Trigger dynamic monster attack animation
        const { type: attackType, emoji } = this.getMonsterAttackType(attackName);
        if (this.callbacks.onTriggerMonsterAttack) {
            this.callbacks.onTriggerMonsterAttack(attackType, emoji, attackResults);
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

    triggerHitAnimation(idx, damage) {
        if (this.callbacks.onTriggerHitAnimation) this.callbacks.onTriggerHitAnimation(idx, damage);
    }

    checkMonsterKnockdown() {
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
            this.updateMonsterStateUI('대경직 상태', `💤 대경직에 쓰러진 ${this.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
            
            if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();
            
            this.playSFX('mh_stun.mp3', '격추');
            this.addLog(`💤 [대경직] ${this.selectedMonster.nameKO}이(가) 큰 충격으로 대경직에 걸려 쓰러졌습니다! (7초간 무력화)`, '#ff9500');
        }
    }

    executeHunterTurn(w) {
        w.atb = 0;

        // Recovery from stun state
        if (w.status === 'stunned') {
            w.status = 'alive';
            this.addLog(`✨ [기절 회복] ${w.name}이(가) 정신을 차렸습니다!`, '#eee');
            if (this.callbacks.onTriggerStunUI) this.callbacks.onTriggerStunUI(w.index, false);
            return;
        }

        // Personality-based heal probability
        let healProb = 0.65;
        if (w.personality === 'offensive') healProb = 0.40;
        else if (w.personality === 'defensive') healProb = 0.85;
        else if (w.personality === 'veteran') healProb = 0.80;
        else if (w.personality === 'support') healProb = 0.75;
        else if (w.personality === 'newbie') healProb = 0.30;

        // Veteran / Support team heal AI (Lifepowder)
        const isHealer = w.personality === 'veteran' || w.personality === 'support';
        if (isHealer && w.lifepowders && w.lifepowders > 0) {
            const damagedTeammates = this.selectedWeapons.filter(m => m.status === 'alive' && m.hp <= m.maxHp * 0.55);
            if (damagedTeammates.length > 0) {
                w.lifepowders--;
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
                this.monsterKnockdownDuration = 40;
                this.monsterState = 'knocked_down';
                this.updateMonsterStateUI('구멍함정 상태', `🕸️ 함정에 빠진 ${this.selectedMonster.nameKO} 🕸`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
                
                if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();

                this.addLog(`🕸️ [함정 설치] ${w.hunterName}이(가) 구멍함정으로 몬스터를 구속했습니다! (4초간 무력화)`, '#e0ffa3');
                this.playSFX('mh_stun.mp3', '격추');
                this.shakeWeapon(w.index, '#e0ffa3');
                return;
            }
            // Stonefall on elder dragons
            if (this.monsterTier === 'elder' && (!w.stonesUsed || w.stonesUsed < 2) && Math.random() < 0.6) {
                w.stonesUsed = (w.stonesUsed || 0) + 1;
                this.monsterKnockdownDuration = 70;
                this.monsterState = 'knocked_down';
                this.updateMonsterStateUI('낙석 대경직', `💤 낙석에 깔린 ${this.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
                
                if (this.callbacks.onTriggerMonsterKnockdownAnim) this.callbacks.onTriggerMonsterKnockdownAnim();

                this.addLog(`💥 [낙석격동] ${w.hunterName}이(가) 지형 낙석을 맞춰 몬스터에게 대경직을 유발했습니다! (7초간 무력화)`, '#ffaa00');
                this.playSFX('mh_stun.mp3', '격추');
                this.shakeWeapon(w.index, '#ffaa00');
                return;
            }

            // Gather lifepowder if empty
            if ((!w.lifepowders || w.lifepowders === 0) && Math.random() < 0.4) {
                w.lifepowders = 1;
                w.atb = 60;
                this.addLog(`🌿 [채집] ${w.name}이(가) 허브를 채집해 라이프파우더 1개를 보충했습니다!`, '#aaffaa');
                this.playAudioFile('Unified_SFX/MH - Item Found (rare).mp3');
                this.showSkillBubble(w.index, `🌿 채집 완료`);
                this.shakeWeapon(w.index, '#aaffaa');
                return;
            }
        }

        // Newbie miss chance (15%)
        if (w.personality === 'newbie' && Math.random() < 0.15) {
            this.addLog(`😅 [실수] ${w.name}이(가) 공격 타이밍을 놓쳤습니다!`, '#aaa');
            this.shakeWeapon(w.index, '#aaa');
            return;
        }

        // Self potion recovery
        if (w.hp <= w.maxHp * 0.55 && w.potions > 0 && Math.random() < healProb) {
            w.potions--;
            const healAmount = Math.round(w.maxHp * 0.60);
            w.hp = Math.min(w.maxHp, w.hp + healAmount);
            this.addLog(`🧪 [포션] ${w.name}이(가) 비약을 복용 +${healAmount} HP (남은 물약: ${w.potions}/10)`, '#2eff7b');
            this.playAudioFile('Unified_SFX/Potion Drink.mp3', null, 2.5);
            this.updateHpUI(w);
            this.updatePotionCountUI(w.index, w.potions);
            this.showSkillBubble(w.index, `🧪 물약 회복 (+60%)`);
            this.shakeWeapon(w.index, '#2eff7b');
            return;
        }

        // Ranged reload
        if (w.type === 'ranged' && w.ammo <= 0) {
            w.ammo = 5;
            this.addLog(`🔄 [재장전] ${w.name}이(가) 탄창을 갈고 재장전을 실행합니다.`, '#00a8ff');
            this.playSFX('mh_reload.mp3', '팅!');
            this.shakeWeapon(w.index, '#00a8ff');
            return;
        }

        // Melee sharpening
        if (w.type !== 'ranged' && w.sharpness <= 30) {
            w.sharpness = 100;
            this.addLog(`✨ [숫돌질] ${w.name}이(가) 구석에서 숫돌을 갈아 예리도를 회복합니다!`, '#ffaa00');
            this.playAudioFile('Unified_SFX/MH - Combine Item.mp3');
            this.shakeWeapon(w.index, '#ffaa00');
            return;
        }

        // Execute combos
        const combos = this.COMBO_LIST[w.id] || [];
        let currentCombo = combos[w.comboIndex];
        let isKnockdownAttack = false;

        if (this.monsterState === 'knocked_down' && combos.length > 0) {
            let maxDmgCombo = combos[0];
            for (let i = 1; i < combos.length; i++) {
                if (combos[i].name === '기인투구깨기') {
                    if (w.id === 'long_sword' && (w.spiritLevel || 0) < 2) continue;
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
                if (currentCombo.name === '병충전') {
                    w.phials = 5;
                    this.addLog(`⚡ [병충전] ${w.hunterName}이(가) 검 에너지를 병에 주입하여 병 5개를 완전히 장전했습니다!`, '#00a8ff');
                    this.playSFX('mh_reload.mp3', '재장전');
                    this.updatePhialsUI(w.index, w.phials);
                } else if (currentCombo.name === '도끼 속성해방베기 I') {
                    if ((w.phials || 0) > 0) {
                        w.phials--;
                        damage += 70;
                        this.addLog(`⚡ [병소모] 도끼 속성해방베기 I! 병 1개를 소비하여 속성 추타를 가합니다! (남은 병: ${w.phials}/5)`, '#ffaa00');
                        this.updatePhialsUI(w.index, w.phials);
                    }
                } else if (currentCombo.name === '고출력 속성해방베기') {
                    if ((w.phials || 0) > 0) {
                        w.phials--;
                        damage += 100;
                        this.addLog(`⚡ [병소모] 고출력 속성해방베기! 병 1개를 소비하여 속성 충격파가 추가 폭발합니다! (남은 병: ${w.phials}/5)`, '#ffaa00');
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
                        this.playAudioFile('Unified_SFX/MH - Item Found.mp3');
                    }
                    this.updateExtractsUI(w.index, w.extractBuffs);

                    if (w.extractBuffs.red && w.extractBuffs.white && w.extractBuffs.orange && (!w.extractDuration || w.extractDuration === 0)) {
                        w.extractDuration = 20;
                        this.addLog(`🐝 [진액 트리플업] ${w.hunterName}이(가) 3색 진액을 모두 획득하여 20초간 공격력이 30% 증가합니다!`, '#ffaa00');
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
                    this.addLog(`✨ [기인 연계] ${w.hunterName}이(가) 기인베기 II를 성공시켜 기인 게이지 레벨이 상승했습니다! (현재 레벨: ${w.spiritLevel}/3)`, '#ffaa00');
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

            // Stun values accumulation
            if (currentCombo.stun && currentCombo.stun > 0) {
                this.monsterStunAccum += currentCombo.stun;
            }

            // Check monster knockdown milestones
            this.checkMonsterKnockdown();

            // Hit sound triggers
            let soundKey = '';
            if (currentCombo.soundKey) {
                if (Array.isArray(currentCombo.soundKey)) {
                    soundKey = currentCombo.soundKey[Math.floor(Math.random() * currentCombo.soundKey.length)];
                } else {
                    soundKey = currentCombo.soundKey;
                }
            } else if (currentCombo.stun && currentCombo.stun > 0) {
                soundKey = '타격음_타격';
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

            this.shakeMonster();
            this.shakeWeapon(w.index, '#ff9500', true, currentCombo.name);

            // Advance combo index (except during knockdown)
            if (!isKnockdownAttack) {
                w.comboIndex = (w.comboIndex + 1) % combos.length;
            }
        }
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
            this.addLog(`🔊 [조우 포효] ${this.selectedMonster.nameKO}이(가) 침입자를 발견하고 강력한 포효를 지릅니다!`, '#ffaa00');
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

            if (w.personality === 'veteran') {
                guardProb = 0.90;
                dodgeProb = 0.90;
            } else if (w.personality === 'newbie') {
                guardProb = 0.45;
                dodgeProb = 0.35;
            }

            if (w.id === 'long_sword' && defendRoll < 0.75) {
                isDodge = true;
                isForesightSlash = true;
                w.spiritLevel = Math.min(3, (w.spiritLevel || 0) + 1);
            } else if (hasShield && defendRoll < guardProb) {
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                isDodge = true;
            }

            if (isForesightSlash) {
                this.addLog(`⚡ [간파베기] ${w.name}이(가) 몬스터의 포효를 간파하고 기인 게이지를 쌓았습니다!`, '#ffaa00');
                this.playSFX('mh_guard.mp3', '가드성공');
                this.showSkillBubble(w.index, "간파베기 (포효)!");
                this.shakeWeapon(w.index, '#ffaa00');
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(w.index);
            } else if (isGuard) {
                this.addLog(`🛡️ [방패 가드] ${w.name}이(가) 포효를 방패로 막아내며 흔들림 없이 버팁니다!`, '#00ffff');
                this.playSFX('mh_guard.mp3', '가드성공');
                this.showSkillBubble(w.index, "가드 (포효)!");
                this.shakeWeapon(w.index, '#00ffff');
                if (this.callbacks.onTriggerGuardShake) this.callbacks.onTriggerGuardShake(w.index);
            } else if (isDodge) {
                this.addLog(`🌀 [프레임 회피] ${w.name}이(가) 구르기 무적 시간으로 포효의 음파를 피해냈습니다!`, '#2eff7b');
                this.playSFX('mh_dodge.mp3', '회피');
                this.showSkillBubble(w.index, "회피 (포효)!");
                this.shakeWeapon(w.index, '#2eff7b');
                if (this.callbacks.onTriggerRollAnimation) this.callbacks.onTriggerRollAnimation(w.index);
            } else {
                // 대처 실패: 귀막기 경직 45틱 (4.5초)
                w.roarStunned = true;
                w.roarStunDuration = 45;
                w.atb = Math.max(0, w.atb - 20); // 경직에 의한 ATB 패널티
                this.addLog(`🙉 [귀막기 경직] ${w.name}이(가) 포효를 피하지 못해 귀를 막고 괴로워합니다! (4.5초 행동 불가)`, '#ff3b30');
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
