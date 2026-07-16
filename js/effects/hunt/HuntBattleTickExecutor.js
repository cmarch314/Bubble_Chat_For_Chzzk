class HuntBattleTickExecutor {
    static execute(engine) {
        engine.battleTime++;
        engine.updateTimerUI(engine.battleTime);

        // Check timeout fail condition
        if (engine.getRemainingSeconds() <= 0) {
            engine.addLog(`⏰ [시간 초과] 제한 시간이 초과되어 퀘스트에 실패했습니다...`, '#ff3b30');
            engine.triggerGameEnd(false);
            return;
        }

        // Global faint safety check
        engine.selectedWeapons.forEach(w => {
            if (w.status !== 'dead' && w.hp <= 0) {
                engine.triggerHunterCart(w);
            }
        });

        // Vaal Hazak 독기 틱 데미지 (초당 1씩 = 10틱당 1)
        if (engine.selectedMonster.id.includes('vaal_hazak')) {
            if (engine.battleTime === 1) {
                engine.addLog(`⚠️ [독기 환경] 발하자크의 독기 영역으로 인해 모든 헌터의 체력이 초당 1씩 감소합니다!`, '#ff5555');
            }
            if (engine.battleTime % 10 === 0) {
                engine.selectedWeapons.forEach(w => {
                    if (w.status === 'alive') {
                        w.hp = Math.max(0, w.hp - 1);
                        engine.updateHpUI(w);
                        if (w.hp <= 0) {
                            engine.triggerHunterCart(w);
                        }
                    }
                });
            }
        }

        // Valstrax Custom States Ticks
        if (engine.selectedMonster.id.includes('valstrax')) {
            if (engine.monsterState === 'normal') {
                engine.valstraxChargeTimer++;
                if (engine.valstraxChargeTimer >= 300) { // 30초
                    engine.monsterState = 'valstrax_charging';
                    engine.monsterAtb = 0;
                    engine.updateMonsterAtbUI(0);
                    engine.monsterSpeed = engine.getMonsterSpeedForState('valstrax_charging');
                    engine.updateMonsterStateUI('시동 걸기', '⚡ 기 모으는 발파루크 ⚡', { color: '#ffcc00', bg: 'rgba(255,204,0,0.1)' });
                    engine.addLog(`⚡ [시동 개시] 발파루크가 가슴에 붉은 흡기 기운을 모으며 시동을 걸기 시작합니다! (느림 속도, 현재 시동 성공: ${engine.valstraxChargeCount}/3)`, '#ffcc00');
                }
            } else if (engine.monsterState === 'enraged') {
                engine.valstraxEnrageTimer++;
                if (engine.valstraxEnrageTimer >= 300) { // 30초 후 날아오름
                    engine.monsterState = 'valstrax_flying';
                    engine.valstraxFlyingTimer = 0;
                    engine.monsterAtb = 0;
                    engine.updateMonsterAtbUI(0);
                    engine.addLog(`🚨 [날아오름] 발파루크가 공중으로 날아올라 화면 밖으로 사라졌습니다! 12초 뒤 대폭발 착륙 공격이 가해집니다!`, '#ff3333');
                }
            } else if (engine.monsterState === 'valstrax_flying') {
                engine.valstraxFlyingTimer++;
                
                // 2.2초 (22틱) 시점에 비주얼 이펙트 트리거
                if (engine.valstraxFlyingTimer === 22) {
                    if (engine.callbacks.onTriggerValstraxAmbush) {
                        engine.callbacks.onTriggerValstraxAmbush();
                    }
                }
                
                // 12초 (120틱) 시점에 착륙 대폭발 데미지 적용
                if (engine.valstraxFlyingTimer >= 120) {
                    engine.executeValstraxAmbushLanding();
                }
            }
        }

        // 몬스터 포효 시전 중 틱 관리
        if (engine.monsterRoarDuration && engine.monsterRoarDuration > 0) {
            engine.monsterRoarDuration--;
        }

        // 헌터 귀막기 경직 틱 차감
        engine.selectedWeapons.forEach(w => {
            if (w.roarStunned && w.roarStunDuration && w.roarStunDuration > 0) {
                w.roarStunDuration--;
                if (w.roarStunDuration <= 0) {
                    w.roarStunned = false;
                    engine.addLog(`✨ [경직 해제] ${w.name}이(가) 귀먹먹함에서 회복되었습니다.`, '#eee');
                    if (engine.callbacks.onTriggerRoarStun) engine.callbacks.onTriggerRoarStun(w.index, false);
                }
            }
        });

        // 조우 포효 (Encounter Roar) 트리거: 전투 개시 1초(10틱) 째
        if (engine.battleTime === 10) {
            engine.triggerEncounterRoar();
        }

        // Respawn cart timers
        engine.selectedWeapons.forEach(w => {
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
                    engine.restoreBorder(w.index);
                    engine.playSFX('mh_aibo.mp3', '아이보');
                    engine.addLog(`✨ [부활] ${w.name}이(가) "아이보!" 소리와 함께 전장에 재참여하였습니다!`, '#00ffa3');
                    engine.updateHpUI(w);
                    engine.shakeWeapon(w.index, '#00ffa3');
                }
            }
        });

        // Buff / Overheat / Hit stun counters
        engine.selectedWeapons.forEach(w => {
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
                if (engine.actionStateMachine) engine.actionStateMachine.tick(w);
                else if (w.attackDuration && w.attackDuration > 0) w.attackDuration--;
                if (w.status === 'stunned' && w.stunDuration && w.stunDuration > 0) {
                    w.stunDuration--;
                    if (w.stunDuration === 0) {
                        w.status = 'alive';
                        engine.addLog(`✨ [기절 회복] ${w.name}이(가) 정신을 차렸습니다!`, '#eee');
                        if (engine.callbacks.onTriggerStunUI) engine.callbacks.onTriggerStunUI(w.index, false);
                    }
                }
                if (engine.battleTime % 10 === 0) {
                    if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                        w.demonModeDuration--;
                        if (w.demonModeDuration === 0) {
                            engine.addLog(`👹 [귀인화 해제] ${w.hunterName}의 귀인화 상태가 해제되었습니다.`, '#aaa');
                            engine.restoreBorder(w.index);
                        }
                    }
                    if (w.id === 'gunlance' && w.overheatDuration && w.overheatDuration > 0) {
                        w.overheatDuration--;
                        engine.updateOverheatUI(w.index, w.overheatDuration);
                        if (w.overheatDuration === 0) {
                            engine.addLog(`🔥 [오버히트 해제] ${w.hunterName}의 건랜스 용격포 열기가 완전히 식어 오버히트가 해제되었습니다!`, '#00a8ff');
                        }
                    }
                    if (w.id === 'charge_blade' && w.shieldChargeDuration && w.shieldChargeDuration > 0) {
                        w.shieldChargeDuration--;
                        if (w.shieldChargeDuration === 0) {
                            engine.addLog(`🛡️ [방패강화 해제] ${w.hunterName}의 차지액스 방패 속성강화 상태가 해제되었습니다.`, '#aaa');
                            engine.restoreBorder(w.index);
                        }
                    }
                    if (w.id === 'insect_glaive' && w.extractDuration && w.extractDuration > 0) {
                        w.extractDuration--;
                        if (w.extractDuration === 0) {
                            w.extractBuffs = { red: 0, white: 0, orange: 0 };
                            engine.addLog(`🐝 [진액 버프 해제] ${w.hunterName}의 3색 진액 효과가 소멸되었습니다.`, '#aaa');
                            engine.restoreBorder(w.index);
                        }
                    }
                }
            }
        });

        // Monster State Loop (90-second loop per state: normal -> enraged -> normal -> exhausted)
        if (!engine.selectedMonster.id.includes('valstrax')) {
            const loopTime = engine.battleTime % 3600;
            let nextState = 'normal';
            if (loopTime >= 900 && loopTime < 1800) {
                nextState = 'enraged';
            } else if (loopTime >= 1800 && loopTime < 2700) {
                nextState = 'normal';
            } else if (loopTime >= 2700 && loopTime < 3600) {
                nextState = 'exhausted';
            }

            if (engine.monsterState !== 'knocked_down' && engine.monsterState !== 'stunned' && nextState !== engine.monsterState) {
                engine.monsterState = nextState;
                if (engine.monsterState === 'enraged') {
                    engine.monsterSpeed = engine.getMonsterSpeedForState('enraged');
                    engine.updateMonsterStateUI('분노 상태', `😡 분노한 ${engine.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
                    engine.triggerMonsterRoarFlinch(false);
                    engine.addLog(`🔥 [분노] ${engine.selectedMonster.nameKO}이(가) 포효를 지르며 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                    engine.shakeMonster();
                } else if (engine.monsterState === 'exhausted') {
                    engine.monsterSpeed = engine.getMonsterSpeedForState('exhausted');
                    engine.updateMonsterStateUI('탈진 상태', `🤤 탈진한 ${engine.selectedMonster.nameKO} 🤤`, { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' });
                    engine.playSFX('mh_cart.mp3', '아이고~');
                    engine.addLog(`🤤 [탈진] ${engine.selectedMonster.nameKO}이(가) 스태미나 고갈로 비틀거립니다! (속도 0.5배, 공격력 0.5배)`, '#00a8ff');
                    engine.shakeMonster();
                } else {
                    engine.monsterSpeed = engine.getMonsterSpeedForState('normal');
                    engine.updateMonsterStateUI('일반 상태', engine.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                    engine.addLog(`📢 ${engine.selectedMonster.nameKO}이(가) 진정하여 평상시로 돌아왔습니다.`, '#eee');
                }
            }
        }

        // Check fail conditions (3 Carts)
        if (engine.cartCount >= 3) {
            engine.triggerGameEnd(false);
            return;
        }

        // Check victory conditions
        if (engine.monsterHp <= 0) {
            if (engine.currentConsecutiveIndex < engine.consecutiveTotal - 1) {
                engine.triggerNextConsecutive();
                return;
            } else {
                const aliveList = engine.selectedWeapons.filter(w => w.status === 'alive');
                const winner = aliveList.length > 0 ? aliveList[0] : engine.selectedWeapons[0];
                engine.triggerGameEnd(true, winner);
                return;
            }
        }

        // Monster ATB
        if (engine.monsterKnockdownDuration > 0) {
            engine.monsterKnockdownDuration--;
            if (engine.monsterKnockdownDuration <= 0) {
                // Recovery from knockdown
                let restoreState = 'normal';
                if (!engine.selectedMonster.id.includes('valstrax')) {
                    const loopTime = engine.battleTime % 3600;
                    if (loopTime >= 900 && loopTime < 1800) restoreState = 'enraged';
                    else if (loopTime >= 2700 && loopTime < 3600) restoreState = 'exhausted';
                } else {
                    // [FIX] 발파루크 CC기(대경직 등) 해제 시 분노/충전 게이지 초기화하여 꼬임 방지
                    engine.valstraxChargeCount = 0;
                    engine.valstraxEnrageTimer = 0;
                }

                engine.monsterState = restoreState;
                engine.monsterSpeed = engine.getMonsterSpeedForState(restoreState);

                const colorInfo = restoreState === 'enraged'
                    ? { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' }
                    : (restoreState === 'exhausted' ? { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' } : { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                
                const titleStr = restoreState === 'enraged'
                    ? `😡 분노한 ${engine.selectedMonster.nameKO} 😡`
                    : (restoreState === 'exhausted' ? `🤤 탈진한 ${engine.selectedMonster.nameKO} 🤤` : engine.selectedMonster.nameKO);

                engine.updateMonsterStateUI(restoreState === 'enraged' ? '분노 상태' : (restoreState === 'exhausted' ? '탈진 상태' : '일반 상태'), titleStr, colorInfo);
                engine.addLog(`📢 ${engine.selectedMonster.nameKO}이(가) 대경직에서 깨어나 비틀거리며 일어섭니다.`, '#00ffa3');
            }
        } else if (engine.monsterStunDuration > 0) {
            engine.monsterStunDuration--;
            if (engine.monsterStunDuration <= 0) {
                // Recovery from stun
                let restoreState = 'normal';
                if (!engine.selectedMonster.id.includes('valstrax')) {
                    const loopTime = engine.battleTime % 3600;
                    if (loopTime >= 900 && loopTime < 1800) restoreState = 'enraged';
                    else if (loopTime >= 2700 && loopTime < 3600) restoreState = 'exhausted';
                }

                engine.monsterState = restoreState;
                engine.monsterSpeed = engine.getMonsterSpeedForState(restoreState);

                const colorInfo = restoreState === 'enraged'
                    ? { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' }
                    : (restoreState === 'exhausted' ? { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' } : { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                
                const titleStr = restoreState === 'enraged'
                    ? `😡 분노한 ${engine.selectedMonster.nameKO} 😡`
                    : (restoreState === 'exhausted' ? `🤤 탈진한 ${engine.selectedMonster.nameKO} 🤤` : engine.selectedMonster.nameKO);

                engine.updateMonsterStateUI(restoreState === 'enraged' ? '분노 상태' : (restoreState === 'exhausted' ? '탈진 상태' : '일반 상태'), titleStr, colorInfo);
                
                engine.monsterStunAccum = 0;
                engine.monsterStunThreshold = Math.floor(engine.monsterStunThreshold * 1.5);
                engine.addLog(`📢 ${engine.selectedMonster.nameKO}이(가) 기절에서 깨어나 정신을 가다듬습니다. (기절 내성치 상승: ${engine.monsterStunThreshold})`, '#00ffa3');
            }
        } else if (engine.monsterRoarDuration > 0 || (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_flying')) {
            // 포효 시전 중 또는 발파루크 비행 중에는 몬스터 ATB가 충전되지 않음
            engine.monsterAtb = 0;
        } else {
            engine.monsterAtb = Math.min(100, engine.monsterAtb + engine.monsterSpeed);
        }
        engine.updateMonsterAtbUI(engine.monsterAtb);

        // Hunter ATB
        engine.selectedWeapons.forEach(w => {
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
                fillRate *= engine.hunterSpeedMultiplier;
                
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
            engine.updateWeaponAtbUI(w.index, w.atb);
        });

        // Execute Turns
        if (engine.monsterAtb >= 100 && (!engine.monsterRoarDuration || engine.monsterRoarDuration <= 0)) {
            if (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_charging') {
                engine.executeValstraxChargeSuccess();
            } else {
                engine.executeMonsterTurn();
            }
        }

        engine.selectedWeapons.forEach(w => {
            if (w.atb >= 100 && (w.status === 'alive' || w.status === 'stunned') && !w.roarStunned) {
                engine.executeHunterTurn(w);
            }
        });
    }
}
