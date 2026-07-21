class HuntBattleTickExecutor {
    static execute(engine) {
        engine.battleTime++;
        if (engine.monsterPatternSelector) engine.monsterPatternSelector.tick();
        if (engine.monsterFlightRuntime) engine.monsterFlightRuntime.tick(engine);
        engine.updateTimerUI(engine.battleTime);

        if (engine.pendingMonsterAction) {
            const interrupted = engine.monsterKnockdownDuration > 0 || engine.monsterStunDuration > 0
                || engine.monsterState === 'knocked_down' || engine.monsterState === 'stunned';
            if (interrupted) {
                engine.addLog(`💥 [공격 중단] ${engine.selectedMonster.nameKO}의 ${engine.pendingMonsterAction.pattern.name} 준비가 무너졌습니다!`, '#00ffa3');
                engine.pendingMonsterAction = null;
                engine.monsterAtb = 0;
            } else {
                engine.pendingMonsterAction.remainingTicks--;
            }
            if (engine.pendingMonsterAction && engine.pendingMonsterAction.remainingTicks <= 0) {
                const preparedPattern = engine.pendingMonsterAction.pattern;
                engine.pendingMonsterAction = null;
                engine.executeMonsterTurn(preparedPattern);
            }
        }

        // Check timeout fail condition
        if (engine.getRemainingSeconds() <= 0) {
            engine.addLog(`⏰ [시간 초과] 제한 시간이 초과되어 퀘스트에 실패했습니다...`, '#ff3b30');
            engine.triggerGameEnd(false);
            return;
        }

        // Global faint safety check
        engine.selectedWeapons.forEach(w => {
            if (engine.perkRuntime) engine.perkRuntime.tick(w);
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
            const pressureState = HuntMonsterRules.stateForBattleTime(engine.battleTime);
            const canEnterTimedRage = pressureState === 'enraged'
                && engine.monsterState !== 'enraged'
                && engine.monsterState !== 'valstrax_flying'
                && engine.monsterState !== 'knocked_down'
                && engine.monsterState !== 'stunned';
            if (canEnterTimedRage) {
                engine.monsterState = 'enraged';
                engine.monsterUltimateUsedInRage = false;
                engine.valstraxEnrageTimer = 0;
                engine.valstraxChargeDmg = 0;
                engine.valstraxChargeTimer = 0;
                engine.monsterSpeed = engine.getMonsterSpeedForState('enraged');
                engine.updateMonsterStateUI('분노 상태', `😡 분노한 ${engine.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
                engine.triggerMonsterRoarFlinch(false);
                engine.addLog(`🔥 [분노] ${engine.selectedMonster.nameKO}이(가) 흡기 여부와 관계없이 전투 압박에 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                engine.shakeMonster();
            } else if (engine.monsterState === 'normal') {
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
                if (engine.valstraxEnrageTimer >= 300 && !engine.monsterUltimateUsedInRage) { // 분노당 강습 1회
                    engine.monsterState = 'valstrax_flying';
                    engine.valstraxFlyingTimer = 0;
                    engine.monsterAtb = 0;
                    engine.updateMonsterAtbUI(0);
                    engine.updateMonsterFlightUI?.(true);
                    engine.updateMonsterStateUI('고고도 비행', `🚀 혜성으로 솟구친 ${engine.selectedMonster.nameKO} 🚀`, { color: '#ff334f', bg: 'rgba(255,20,50,0.16)' });
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
                    if (engine.perkRuntime) engine.perkRuntime.onRecovered(w);
                    engine.addLog(`✨ [경직 해제] ${w.name}이(가) 귀먹먹함에서 회복되었습니다.`, '#eee');
                    if (engine.callbacks.onTriggerRoarStun) engine.callbacks.onTriggerRoarStun(w.index, false);
                }
            }
        });

        // 조우 포효 (Encounter Roar) 트리거: 전투 개시 1초(10틱) 째
        if (engine.battleTime === 10 && engine.monsterTier !== 'small') {
            engine.triggerEncounterRoar();
        }

        // Respawn cart timers
        engine.selectedWeapons.forEach(w => {
            if (w.status === 'dead' && w.cartTimer && w.cartTimer > 0) {
                w.cartTimer--;
                if (w.cartTimer <= 0) {
                    w.status = 'alive';
                    w.hp = w.maxHp;
                    w.cartRecoveryTicks = 10;
                    w.atb = 0;
                    if (typeof engine.resupplyHunterAtCamp === 'function') engine.resupplyHunterAtCamp(w);
                    else w.potions = 10;
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
                    engine.playSFX('hunter_cart_voice', null, { hunterIndex: w.index, action: 'cart' });
                    engine.addLog(`✨ [부활] ${w.name}이(가) "아이보!" 소리와 함께 전장에 재참여하였습니다!`, '#00ffa3');
                    engine.updateHpUI(w);
                    engine.shakeWeapon(w.index, '#00ffa3');
                }
            }
        });

        // Buff / Overheat / Hit stun counters
        engine.selectedWeapons.forEach(w => {
            if (w.status === 'alive' || w.status === 'stunned') {
                if (w.cartRecoveryTicks && w.cartRecoveryTicks > 0) w.cartRecoveryTicks--;
                if (Number(w.jumpInvulnerableTicks || 0) > 0) {
                    w.jumpInvulnerableTicks--;
                    w.atb = 0;
                    if (w.jumpInvulnerableTicks === 0) {
                        engine.callbacks?.onTriggerInvincibleJump?.(w.index, false);
                        engine.addLog(`🪽 [착지] ${w.hunterName}이(가) 전장으로 복귀했습니다.`, '#86ffbf');
                    }
                }
                if (engine.weaponMechanics) engine.weaponMechanics.tick(w);
                if (engine.blightRuntime) engine.blightRuntime.tick(w);
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
                    if (w.itemDuration === 0) {
                        w.isGathering = false; // [FIX] 채집/아이템 상태 안전한 해제
                        if (w.pendingSharpnessRestore) {
                            w.pendingSharpnessRestore = false;
                            w.sharpness = Number(w.maxSharpness || 0);
                            engine.addLog(`✨ [숫돌질 완료] ${w.hunterName}의 ${w.weaponDisplayName || w.name} 예리도가 완전히 회복되었습니다!`, '#c98534');
                            engine.showSkillBubble(w.index, '🪨✨ 예리도 회복');
                            engine.updateSharpnessUI(w.index, w);
                        }
                    }
                }
                if (engine.actionStateMachine) engine.actionStateMachine.tick(w);
                else if (w.attackDuration && w.attackDuration > 0) w.attackDuration--;
                if (w.status === 'stunned' && w.stunDuration && w.stunDuration > 0) {
                    w.stunDuration--;
                    if (w.stunDuration === 0) {
                        w.status = 'alive';
                        if (engine.perkRuntime) engine.perkRuntime.onRecovered(w);
                        engine.addLog(`✨ [기절 회복] ${w.name}이(가) 정신을 차렸습니다!`, '#eee');
                        if (engine.callbacks.onTriggerStunUI) engine.callbacks.onTriggerStunUI(w.index, false);
                    }
                }
                if (engine.battleTime % 10 === 0) {
                    if (!engine.weaponMechanics && w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                        w.demonModeDuration--;
                        if (w.demonModeDuration === 0) {
                            engine.addLog(`👹 [귀인화 해제] ${w.hunterName}의 귀인화 상태가 해제되었습니다.`, '#aaa');
                            engine.restoreBorder(w.index);
                        }
                    }
                    if (!engine.weaponMechanics && w.id === 'gunlance' && w.overheatDuration && w.overheatDuration > 0) {
                        w.overheatDuration--;
                        engine.updateOverheatUI(w.index, w.overheatDuration);
                        if (w.overheatDuration === 0) {
                            engine.addLog(`🔥 [오버히트 해제] ${w.hunterName}의 건랜스 용격포 열기가 완전히 식어 오버히트가 해제되었습니다!`, '#00a8ff');
                        }
                    }
                    if (!engine.weaponMechanics && w.id === 'charge_blade' && w.shieldChargeDuration && w.shieldChargeDuration > 0) {
                        w.shieldChargeDuration--;
                        if (w.shieldChargeDuration === 0) {
                            engine.addLog(`🛡️ [방패강화 해제] ${w.hunterName}의 차지액스 방패 속성강화 상태가 해제되었습니다.`, '#aaa');
                            engine.restoreBorder(w.index);
                        }
                    }
                    if (!engine.weaponMechanics && w.id === 'insect_glaive' && w.extractDuration && w.extractDuration > 0) {
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

        // Long pressure arc: opening read, sustained rage, brief exhaustion.
        if (!engine.selectedMonster.id.includes('valstrax')) {
            const nextState = HuntMonsterRules.stateForBattleTime(engine.battleTime);

            if (engine.monsterState !== 'knocked_down' && engine.monsterState !== 'stunned' && nextState !== engine.monsterState) {
                engine.monsterState = nextState;
                if (engine.monsterState === 'enraged') {
                    engine.monsterUltimateUsedInRage = false;
                    engine.monsterSpeed = engine.getMonsterSpeedForState('enraged');
                    engine.updateMonsterStateUI('분노 상태', `😡 분노한 ${engine.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
                    if (engine.monsterTier !== 'small') engine.triggerMonsterRoarFlinch(false);
                    engine.addLog(engine.monsterTier === 'small'
                        ? `🔥 [분노] ${engine.selectedMonster.nameKO} 무리가 날뛰기 시작합니다! (공격력 1.5배, 속도 1.5배)`
                        : `🔥 [분노] ${engine.selectedMonster.nameKO}이(가) 포효를 지르며 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                    engine.shakeMonster();
                } else if (engine.monsterState === 'exhausted') {
                    engine.monsterSpeed = engine.getMonsterSpeedForState('exhausted');
                    engine.updateMonsterStateUI('탈진 상태', `🤤 탈진한 ${engine.selectedMonster.nameKO} 🤤`, { color: '#00a8ff', bg: 'rgba(0,168,255,0.1)' });
                    // No verified exhaustion cue yet; do not reuse an unrelated cart sound.
                    engine.addLog(`🤤 [탈진] ${engine.selectedMonster.nameKO}이(가) 스태미나 고갈로 비틀거립니다! (속도 0.5배, 공격력 0.5배)`, '#00a8ff');
                    engine.shakeMonster();
                } else {
                    engine.monsterSpeed = engine.getMonsterSpeedForState('normal');
                    engine.updateMonsterStateUI('일반 상태', engine.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                    engine.addLog(`📢 ${engine.selectedMonster.nameKO}이(가) 진정하여 평상시로 돌아왔습니다.`, '#eee');
                }
            }
        }

        // Check the dynamic quest cart limit (Cart Lover adds one per hunter).
        if (engine.cartCount >= Number(engine.cartLimit || 3)) {
            if (Number(engine.questFailCinematicTicks || 0) > 0) {
                engine.questFailCinematicTicks--;
                engine.monsterAtb = 0;
                engine.updateMonsterAtbUI(0);
                return;
            }
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
        if (engine.pendingMonsterAction) {
            engine.monsterAtb = 0;
        } else if (engine.monsterKnockdownDuration > 0) {
            engine.monsterKnockdownDuration--;
            if (engine.monsterKnockdownDuration <= 0) {
                // Recovery from knockdown
                const restoreState = HuntMonsterRules.stateForBattleTime(engine.battleTime);

                engine.monsterState = restoreState;
                engine.monsterSpeed = engine.getMonsterSpeedForState(restoreState);
                HuntBattleTickExecutor.resetValstraxRageOnRecovery(engine, restoreState);

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
                const restoreState = HuntMonsterRules.stateForBattleTime(engine.battleTime);

                engine.monsterState = restoreState;
                engine.monsterSpeed = engine.getMonsterSpeedForState(restoreState);
                HuntBattleTickExecutor.resetValstraxRageOnRecovery(engine, restoreState);

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
        } else if (engine.monsterRecoveryDuration > 0) {
            engine.monsterRecoveryDuration--;
            engine.monsterAtb = 0;
        } else if (engine.monsterRoarDuration > 0 || (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_flying')) {
            // 포효 시전 중 또는 발파루크 비행 중에는 몬스터 ATB가 충전되지 않음
            engine.monsterAtb = 0;
        } else if (engine.smallMonsterSwarm) {
            engine.monsterAtb = engine.smallMonsterSwarm.advanceAtb(engine.monsterSpeed);
        } else {
            engine.monsterAtb = Math.min(100, engine.monsterAtb + engine.monsterSpeed);
        }
        engine.updateMonsterAtbUI(engine.monsterAtb);
        if (engine.smallMonsterSwarm && engine.callbacks.onUpdateSmallMonsterSwarmUI) {
            engine.callbacks.onUpdateSmallMonsterSwarmUI(engine.smallMonsterSwarm.snapshot());
        }

        // Hunter ATB
        engine.selectedWeapons.forEach(w => {
            const isRolling = w.rollDuration && w.rollDuration > 0;
            const isGuarding = w.guardDuration && w.guardDuration > 0;
            const isGathering = w.isGathering;
            const isUsingItem = w.itemDuration && w.itemDuration > 0;
            const isAttacking = w.attackDuration && w.attackDuration > 0;
            const isHitStunned = w.hitDuration && w.hitDuration > 0;
            const isInvincibleJumping = Number(w.jumpInvulnerableTicks || 0) > 0;

            if (w.status === 'alive' && !isInvincibleJumping && (!engine.perkRuntime || engine.perkRuntime.canAct(w)) && (!engine.blightRuntime?.canAct || engine.blightRuntime.canAct(w)) && !w.roarStunned && !isHitStunned && !isRolling && !isGuarding && !isGathering && !isUsingItem && !isAttacking) {
                // Weapon cadence is already represented by each action's
                // motion-value-derived occupancy. A second coarse speedGroup
                // multiplier made nominally quick/slow weapons diverge far more
                // than their actual moves and even overrode individual attacks.
                // 1.15 is a shared pacing baseline that preserves the intended
                // hunt win band without reintroducing weapon-class divergence.
                let fillRate = 1.15;
                
                // Apply hunter speed multiplier from config
                fillRate *= engine.hunterSpeedMultiplier;
                fillRate *= Number(w.perkModifiers && w.perkModifiers.atbRate || 1);
                if (Number(w.hornSpeedBuffTicks || 0) > 0) fillRate *= 1.1;
                
                if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                    fillRate *= 1.2;
                }
                if (w.id === 'insect_glaive') {
                    const hasTripleUp = w.extractDuration && w.extractDuration > 0;
                    if (!hasTripleUp) {
                        // Extract gathering should feel nimble, but the former 2x
                        // bonus compounded with the global/fast-weapon multipliers
                        // and made the glaive act nearly continuously.
                        fillRate *= 1.15;
                    }
                }
                w.atb = Math.min(100, w.atb + fillRate);
            }
            engine.updateWeaponAtbUI(w.index, w.atb);
        });

        // Execute Turns
        if (engine.monsterAtb >= 100 && (!engine.monsterRoarDuration || engine.monsterRoarDuration <= 0)) {
            try {
                if (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_charging') {
                    engine.executeValstraxChargeSuccess();
                } else {
                    engine.prepareMonsterTurn();
                }
            } catch (error) {
                HuntBattleTickExecutor.recoverMonsterTurn(engine, error);
            }
        }

        engine.selectedWeapons.forEach(w => {
            if (w.atb >= 100 && (w.status === 'alive' || w.status === 'stunned') && !w.roarStunned) {
                try {
                    engine.executeHunterTurn(w);
                    w.consecutiveActionErrors = 0;
                } catch (error) {
                    HuntBattleTickExecutor.recoverHunterTurn(engine, w, error);
                }
            }
        });
    }

    static recoverHunterTurn(engine, hunter, error) {
        hunter.consecutiveActionErrors = Number(hunter.consecutiveActionErrors || 0) + 1;
        hunter.atb = 0;
        hunter.attackDuration = 0;
        hunter.currentAction = null;
        hunter.actionState = 'idle';
        hunter.isGathering = false;
        hunter.pendingSharpnessRestore = false;
        if (engine.actionStateMachine) engine.actionStateMachine.cancel(hunter, 'idle');
        engine.updateWeaponAtbUI(hunter.index, 0);
        console.error('[HuntBattleTickExecutor] Hunter turn recovered', hunter.id, error);
        if (hunter.consecutiveActionErrors === 1) {
            engine.addLog(`⚠️ [행동 자동복구] ${hunter.hunterName || hunter.name}의 잘못된 행동을 취소하고 전투를 계속합니다.`, '#ffcf70');
        }
    }

    // A Valstrax knocked down or stunned mid-rage must restart its timed-rage
    // window on recovery; otherwise a stale valstraxEnrageTimer >= 300 launches
    // the ambush the instant it wakes. Mirrors the timed-rage entry reset.
    static resetValstraxRageOnRecovery(engine, restoreState) {
        if (restoreState !== 'enraged') return;
        if (!engine.selectedMonster || !String(engine.selectedMonster.id).includes('valstrax')) return;
        engine.valstraxEnrageTimer = 0;
        engine.valstraxChargeTimer = 0;
        engine.valstraxChargeDmg = 0;
    }

    static recoverMonsterTurn(engine, error) {
        engine.pendingMonsterAction = null;
        engine.monsterAtb = 0;
        engine.updateMonsterAtbUI(0);
        console.error('[HuntBattleTickExecutor] Monster turn recovered', engine.selectedMonster?.id, error);
        if (!engine.monsterTurnErrorReported) {
            engine.monsterTurnErrorReported = true;
            engine.addLog('⚠️ [몬스터 행동 자동복구] 잘못된 패턴을 취소하고 다음 행동으로 진행합니다.', '#ffcf70');
        }
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntBattleTickExecutor;
else globalThis.HuntBattleTickExecutor = HuntBattleTickExecutor;
