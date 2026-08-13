class HuntBattleTickExecutor {
    static displayPatternName(pattern, monster) {
        const catalog = globalThis.HuntMonsterPatternCatalog
            || (typeof require === 'function' ? require('./HuntMonsterPatternCatalog.js') : null);
        return catalog?.displayName ? catalog.displayName(pattern, monster) : String(pattern?.name || '');
    }

    static atbConfig() {
        if (typeof HuntAtbConfig !== 'undefined') return HuntAtbConfig;
        if (typeof require === 'function') return require('./HuntAtbConfig.js');
        throw new Error('HuntAtbConfig is required before the battle tick runtime');
    }

    static monsterTurnExecutor() {
        if (typeof HuntMonsterTurnExecutor !== 'undefined') return HuntMonsterTurnExecutor;
        if (typeof require === 'function') return require('./HuntMonsterTurnExecutor.js');
        return null;
    }

    static queueTransitionRoar(engine, kind) {
        if (engine.monsterTier === 'small') return;
        if (kind === 'rage') engine.pendingMonsterRageRoar = true;
        else if (kind === 'encounter') engine.pendingMonsterEncounterRoar = true;
    }

    static actionStateTransitionLocked(engine) {
        return Boolean(
            engine.isMonsterActionSessionActive?.()
            || Number(engine.monsterActionPresentationTicks || 0) > 0
            || engine.pendingMonsterAction
            || engine.pendingMonsterImpact
            || engine.monsterTraversalState
            || engine.monsterBurrowState
            || Number(engine.monsterRecoveryDuration || 0) > 0
            || Number(engine.monsterActionLockTicks || 0) > 0
        );
    }

    static rageCadenceTime(engine) {
        return Math.max(0,
            Number(engine?.battleTime || 0)
            - Math.max(0, Number(engine?.monsterRageCadenceOffsetTicks || 0))
        );
    }

    static timedMonsterState(engine) {
        return HuntMonsterRules.stateForBattleTime(
            HuntBattleTickExecutor.rageCadenceTime(engine),
            engine?.monsterBehavior
        );
    }

    static resolveTimedMonsterState(engine) {
        const nextState = HuntBattleTickExecutor.timedMonsterState(engine);
        const currentState = String(engine?.monsterState || 'normal');
        const cadenceState = currentState === 'normal' || currentState === 'enraged';
        if (cadenceState
            && nextState !== currentState
            && HuntBattleTickExecutor.actionStateTransitionLocked(engine)) {
            // Hold the cadence at its boundary. Otherwise a long attack can
            // skip the complete normal recovery window and appear permanently
            // enraged when the absolute clock has already wrapped around.
            engine.monsterRageCadenceOffsetTicks = Math.max(0,
                Number(engine.monsterRageCadenceOffsetTicks || 0)) + 1;
            return currentState;
        }
        return nextState;
    }

    static flushTransitionRoar(engine) {
        const kind = engine.pendingMonsterEncounterRoar
            ? 'encounter'
            : (engine.pendingMonsterRageRoar ? 'rage' : null);
        if (!kind) return false;
        const rageConsumesFullAtb = kind === 'rage'
            && engine.monsterBehavior?.rageRoarConsumesFullAtb === true;
        if ((kind === 'encounter' || rageConsumesFullAtb)
            && Number(engine.monsterAtb || 0) < HuntBattleTickExecutor.atbConfig().GAUGE_MAX) {
            return false;
        }
        const busy = Boolean(
            engine.isMonsterActionSessionActive?.()
            || Number(engine.monsterActionPresentationTicks || 0) > 0
            || engine.pendingMonsterAction
            || engine.pendingMonsterImpact
            || engine.monsterTraversalState
            || engine.monsterBurrowState
            || Number(engine.monsterRecoveryDuration || 0) > 0
            || Number(engine.monsterActionLockTicks || 0) > 0
            || Number(engine.monsterKnockdownDuration || 0) > 0
            || Number(engine.monsterStunDuration || 0) > 0
            || Number(engine.monsterRoarDuration || 0) > 0
            || engine.monsterFlightState === 'airborne'
            || engine.monsterState === 'knocked_down'
            || engine.monsterState === 'stunned'
        );
        if (busy) return false;

        if (kind === 'encounter') {
            engine.pendingMonsterEncounterRoar = false;
            engine.triggerEncounterRoar();
        } else {
            engine.pendingMonsterRageRoar = false;
            if (rageConsumesFullAtb) {
                engine.monsterAtb = 0;
                engine.updateMonsterAtbUI?.(0);
            }
            engine.triggerMonsterRoarFlinch(false);
            const monsterKey = engine.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
            const patterns = engine.MONSTER_PATTERNS?.[monsterKey]
                || engine.MONSTER_PATTERNS?.[engine.selectedMonster.id]
                || [];
            patterns
                .filter(pattern => pattern.tags?.includes('combat-roar'))
                .forEach(pattern => engine.monsterPatternSelector?.cooldowns?.set(
                    `${engine.selectedMonster.id}:${pattern.id}`,
                    Math.max(1, Number(pattern.cooldownTicks || 1))
                ));
            engine.forcedMonsterPatternId = engine.monsterBehavior?.rageOpenerPatternId || null;
            if (engine.monsterBehavior?.rageOpenerTakeoff) {
                engine.monsterRageTakeoffPending = true;
            }
        }
        return true;
    }

    static execute(engine) {
        engine.battleTime++;
        engine.tickMonsterBeatAction?.();
        engine.tickHunterBeatActions?.();
        if (Number(engine.monsterActionPresentationTicks || 0) > 0) {
            engine.monsterActionPresentationTicks--;
        }
        engine.flushPendingMonsterPartReaction?.();
        engine.monsterStaminaRuntime?.tick?.(engine);
        if (Number(engine.monsterRageOpenerRetryTicks || 0) > 0) {
            engine.monsterRageOpenerRetryTicks--;
            if (engine.monsterRageOpenerRetryTicks === 0
                && engine.monsterState === 'enraged'
                && engine.monsterFlightState !== 'airborne') {
                engine.forcedMonsterPatternId = engine.monsterBehavior?.rageOpenerPatternId || null;
            }
        }
        if (Number(engine.monsterActionLockTicks || 0) > 0) {
            engine.monsterActionLockTicks--;
        }
        if (engine.monsterTraversalState) {
            const forciblyInterrupted = engine.monsterKnockdownDuration > 0
                || engine.monsterStunDuration > 0
                || engine.monsterState === 'knocked_down'
                || engine.monsterState === 'stunned';
            if (forciblyInterrupted) {
                const MonsterTurns = HuntBattleTickExecutor.monsterTurnExecutor();
                const detachedImpact = Boolean(
                    engine.pendingMonsterImpact
                    && MonsterTurns?.actionPolicy?.().impactSurvivesInterruption?.(
                        engine.pendingMonsterImpact.pattern
                    )
                );
                if (detachedImpact) engine.clearMonsterTraversal?.('interrupted');
                else if (engine.interruptMonsterMovement) engine.interruptMonsterMovement('interrupted');
                else engine.clearMonsterTraversal?.('interrupted');
            }
        }
        if (engine.monsterTraversalState) {
            engine.monsterTraversalState.remainingTicks = Math.max(
                0, Number(engine.monsterTraversalState.remainingTicks || 0) - 1
            );
            if (engine.monsterTraversalState.remainingTicks <= 0) {
                engine.clearMonsterTraversal?.('complete');
            }
        }
        if (engine.monsterPatternSelector) engine.monsterPatternSelector.tick();
        if (engine.monsterFlightRuntime) {
            engine.monsterFlightRuntime.promoteAirborneKnockdown?.(engine);
            engine.monsterFlightRuntime.tick(engine);
        }
        engine.monsterTraitRuntime?.tick?.(engine);
        engine.updateTimerUI(engine.battleTime);

        if (engine.pendingMonsterImpact) {
            const interrupted = engine.monsterKnockdownDuration > 0 || engine.monsterStunDuration > 0
                || engine.monsterState === 'knocked_down' || engine.monsterState === 'stunned';
            const MonsterTurns = HuntBattleTickExecutor.monsterTurnExecutor();
            const detachedImpact = Boolean(
                MonsterTurns?.actionPolicy?.().impactSurvivesInterruption?.(
                    engine.pendingMonsterImpact.pattern
                )
            );
            if (interrupted && !detachedImpact) {
                if (engine.interruptMonsterMovement) engine.interruptMonsterMovement('impact-interrupted');
                else {
                    engine.pendingMonsterImpact = null;
                    engine.clearMonsterTraversal?.('impact-interrupted');
                }
            } else {
                const beatState = engine.monsterBeatRuntime?.get?.('monster');
                const beatDriven = Boolean(
                    engine.pendingMonsterImpact.pattern?.beatV2Approved === true
                    && beatState?.action === engine.pendingMonsterImpact.pattern?.beatV2
                );
                if (beatDriven) {
                    const eventIndex = Number(engine.pendingMonsterImpact.nextEventIndex || 0);
                    const dueEvent = engine.pendingMonsterImpact.events?.[eventIndex];
                    const dueTick = Number(dueEvent?.atTicks || 0);
                    engine.pendingMonsterImpact.remainingTicks =
                        Number(engine.monsterBeatJudgmentTicks?.get?.(dueTick) || 0) > 0
                            ? 0
                            : Math.max(1, dueTick - Number(beatState.elapsedTicks || 0));
                } else {
                    engine.pendingMonsterImpact.remainingTicks--;
                }
                if (engine.pendingMonsterImpact.remainingTicks <= 0) {
                    const pendingImpact = engine.pendingMonsterImpact;
                    const hasTimeline = Array.isArray(pendingImpact.events);
                    const events = hasTimeline
                        ? pendingImpact.events
                        : [{
                            atTicks: pendingImpact.totalTicks,
                            targetIndices: [pendingImpact.targetIndex].filter(Number.isInteger)
                        }];
                    const eventIndex = Number(pendingImpact.nextEventIndex || 0);
                    const event = events[eventIndex] || events[0];
                    if (beatDriven) {
                        const judgmentTick = Number(event?.atTicks || 0);
                        const remainingJudgments = Number(engine.monsterBeatJudgmentTicks?.get?.(judgmentTick) || 0) - 1;
                        if (remainingJudgments > 0) {
                            engine.monsterBeatJudgmentTicks.set(judgmentTick, remainingJudgments);
                        } else {
                            engine.monsterBeatJudgmentTicks?.delete?.(judgmentTick);
                        }
                    }
                    const nextEvent = events[eventIndex + 1];
                    if (nextEvent) {
                        pendingImpact.nextEventIndex = eventIndex + 1;
                        pendingImpact.remainingTicks = Math.max(
                            1, Number(nextEvent.atTicks || 0) - Number(event.atTicks || 0)
                        );
                    } else {
                        engine.pendingMonsterImpact = null;
                    }
                    const resolvedEvent = {
                        ...event,
                        targetIndices: MonsterTurns?.resolveImpactEventTargetIndices?.(
                            engine,
                            event,
                            [pendingImpact.targetIndex]
                        ) || event.targetIndices
                    };
                    let eventConsumed = false;
                    if (resolvedEvent.eventKind === 'blast-scale-drop') {
                        engine.monsterTraitRuntime?.dropScaleAtSlot?.(
                            engine,
                            resolvedEvent.targetIndices?.[0],
                            resolvedEvent.sourcePart || null
                        );
                        eventConsumed = true;
                    }
                    if (resolvedEvent.eventKind === 'blast-scale-volley') {
                        engine.monsterTraitRuntime?.dropScalesForAction?.(
                            engine,
                            pendingImpact.pattern,
                            (resolvedEvent.targetIndices || []).map(index => ({
                                index,
                                result: 'pending-impact'
                            }))
                        );
                        eventConsumed = true;
                    }
                    if (resolvedEvent.eventKind === 'carpet-dive'
                        && engine.monsterTraitRuntime?.interceptAerialImpact?.(
                            engine,
                            pendingImpact.pattern,
                            resolvedEvent
                        )) {
                        engine.pendingMonsterImpact = null;
                        eventConsumed = true;
                    }
                    if (!eventConsumed) {
                        engine.monsterTraitRuntime?.onImpactEvent?.(
                            engine,
                            pendingImpact.pattern,
                            resolvedEvent,
                            !nextEvent
                        );
                    }
                    if (!eventConsumed) engine.executeMonsterTurn(
                        hasTimeline ? {
                            ...pendingImpact.pattern,
                            runtimeImpactTargetIndices: resolvedEvent.targetIndices,
                            runtimeImpactEmpty: resolvedEvent.allowEmpty === true,
                            runtimeImpactDamageScale: Number(resolvedEvent.damageScale ?? 1),
                            runtimeImpactHitRecoveryTicks: Number.isFinite(Number(resolvedEvent.hitRecoveryTicks))
                                ? Math.max(1, Number(resolvedEvent.hitRecoveryTicks))
                                : null,
                            runtimeImpactHitReactionKind: resolvedEvent.hitReactionKind || null,
                            runtimeImpactSecondaryInterference: resolvedEvent.secondaryInterference || null,
                            runtimeImpactAudioCue: resolvedEvent.audioCue || null,
                            runtimeImpactEventKind: resolvedEvent.eventKind || null,
                            runtimeDefenseMode: resolvedEvent.defenseMode || null,
                            runtimeImpactIgnoreBrokenPartDamage: resolvedEvent.ignoreBrokenPartDamage === true,
                            runtimeImpactSuppressStatus: resolvedEvent.suppressStatus === true,
                            runtimeImpactTimelineIndex: eventIndex,
                            runtimeImpactTimelineFinal: !nextEvent,
                            name: resolvedEvent.displayName || pendingImpact.pattern.name,
                            animationProfile: resolvedEvent.animationProfile
                                || pendingImpact.pattern.animationProfile,
                            animationDurationMs: resolvedEvent.animationDurationMs
                                || pendingImpact.pattern.animationDurationMs
                        } : pendingImpact.pattern,
                        pendingImpact.attackerIndex,
                        resolvedEvent.targetIndices?.[0] ?? pendingImpact.targetIndex
                    );
                }
            }
        }

        if (engine.pendingMonsterAction) {
            const interrupted = engine.monsterKnockdownDuration > 0 || engine.monsterStunDuration > 0
                || engine.monsterState === 'knocked_down' || engine.monsterState === 'stunned';
            if (interrupted) {
                const interruptedName = HuntBattleTickExecutor.displayPatternName(
                    engine.pendingMonsterAction.pattern, engine.selectedMonster);
                engine.addLog(`💥 [공격 중단] ${engine.selectedMonster.nameKO}의 ${interruptedName} 준비가 무너졌습니다!`, '#00ffa3');
                HuntBattleTickExecutor.atbConfig().applyMonsterControlAtb(engine, 'knockdown');
                if (engine.interruptMonsterMovement) engine.interruptMonsterMovement('interrupted');
                else {
                    engine.pendingMonsterAction = null;
                    engine.clearMonsterTraversal?.('interrupted');
                }
            } else {
                const MonsterTurns = HuntBattleTickExecutor.monsterTurnExecutor();
                if (!MonsterTurns?.refreshPreparedTarget || MonsterTurns.refreshPreparedTarget(engine)) {
                    engine.pendingMonsterAction.remainingTicks--;
                }
            }
            if (engine.pendingMonsterAction && engine.pendingMonsterAction.remainingTicks <= 0) {
                const preparedAction = engine.pendingMonsterAction;
                engine.pendingMonsterAction = null;
                engine.executeMonsterTurn(preparedAction.pattern, preparedAction.attackerIndex, preparedAction.targetIndex);
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
                        w.environmentDotType = 'effluvium';
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
                && !engine.monsterStaminaRuntime?.isExhausted?.(engine)
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
                HuntBattleTickExecutor.queueTransitionRoar(engine, 'rage');
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

        // Legacy timed roar recovery remains for old saved states. New
        // interference poses recover from their ATB gauge instead.
        engine.selectedWeapons.forEach(w => {
            if (!w.interference && w.roarStunned && w.roarStunDuration && w.roarStunDuration > 0) {
                w.roarStunDuration--;
                if (w.roarStunDuration <= 0) {
                    w.roarStunned = false;
                    if (engine.perkRuntime) engine.perkRuntime.onRecovered(w, 'roar');
                    engine.addLog(`✨ [경직 해제] ${w.name}이(가) 귀먹먹함에서 회복되었습니다.`, '#eee');
                    if (engine.callbacks.onTriggerRoarStun) engine.callbacks.onTriggerRoarStun(w.index, false);
                }
            }
        });

        // 조우 포효 (Encounter Roar) 트리거: 전투 개시 1초(10틱) 째
        if (engine.battleTime === 10 && engine.monsterTier !== 'small') {
            HuntBattleTickExecutor.queueTransitionRoar(engine, 'encounter');
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
                    else {
                        w.potions = 10;
                        if (typeof engine.resetHunterSpecialWeaponStates === 'function') engine.resetHunterSpecialWeaponStates(w);
                    }
                    engine.restoreBorder(w.index);
                    engine.callbacks?.onTriggerHunterReturn?.(w.index);
                    engine.playSFX('hunter_cart_voice', null, { hunterIndex: w.index, action: 'cart' });
                    engine.addLog(`✨ [부활] ${w.name}이(가) "아이보!" 소리와 함께 전장에 재참여하였습니다!`, '#00ffa3');
                    engine.updateHpUI(w);
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
                if (Number(w.counterInvulnerabilityTicks || 0) > 0) {
                    if (w.counterInvulnerabilityStartedThisTick) {
                        w.counterInvulnerabilityStartedThisTick = false;
                    } else {
                        w.counterInvulnerabilityTicks = Math.max(
                            0, Number(w.counterInvulnerabilityTicks) - 1
                        );
                    }
                }
                if (engine.weaponMechanics) engine.weaponMechanics.tick(w);
                if (engine.blightRuntime) engine.blightRuntime.tick(w);
                if (w.hitDuration && w.hitDuration > 0) {
                    const totalTicks = Math.max(1, Number(w.hitRecoveryTotalTicks || w.hitDuration));
                    if (w.hitStartedThisTick) {
                        // Impact resolution and hunter recovery share this
                        // executor tick. Preserve the full authored recovery
                        // window; countdown begins on the next tick.
                        w.hitStartedThisTick = false;
                    } else {
                        w.hitDuration = Math.max(0, Number(w.hitDuration) - 1);
                    }
                    w.atb = Math.min(
                        HuntBattleTickExecutor.atbConfig().GAUGE_MAX,
                        HuntBattleTickExecutor.atbConfig().GAUGE_MAX * (totalTicks - w.hitDuration) / totalTicks
                    );
                    if (w.hitDuration === 0) {
                        w.hitStartedThisTick = false;
                        w.atb = HuntBattleTickExecutor.atbConfig().GAUGE_MAX;
                        w.hitRecoveryTotalTicks = 0;
                        w.hitReactionKind = null;
                        w.hitKnockbackDirection = 0;
                        if (Number(w.pendingStunDuration || 0) > 0
                            && (!engine.blightRuntime?.canAct || engine.blightRuntime.canAct(w))) {
                            w.status = 'stunned';
                            w.stunDuration = Number(w.pendingStunDuration);
                            w.pendingStunDuration = 0;
                            w.atb = 0;
                            w.stunStartedThisTick = true;
                            engine.addLog(`🌀 [기절] ${w.name}이(가) 피격에서 일어난 직후 기절했습니다!`, '#e58e26');
                            engine.callbacks?.onTriggerStunUI?.(w.index, true);
                        }
                    }
                }
                if (w.rollDuration && w.rollDuration > 0) {
                    w.rollDuration--;
                }
                if (w.guardDuration && w.guardDuration > 0) {
                    w.guardDuration--;
                }
                if (w.pendingSharpnessRestore
                    && (Number(w.hitDuration || 0) > 0 || w.status !== 'alive')) {
                    engine.interruptHunterItemAction?.(w, 'hit');
                }
                if (w.itemDuration && w.itemDuration > 0) {
                    w.itemDuration--;
                    if (w.itemDuration === 0) {
                        w.isGathering = false; // [FIX] 채집/아이템 상태 안전한 해제
                        if (w.pendingSharpnessRestore) {
                            w.pendingSharpnessRestore = false;
                            w.sharpness = Number(w.maxSharpness || 0);
                            engine.playSFX?.('whetstone_finish', null, {
                                hunterIndex: w.index,
                                item: 'whetstone_finish',
                                action: 'whetstone_finish'
                            });
                            engine.addLog?.(`✨ [숫돌질 완료] ${w.hunterName}의 ${w.weaponDisplayName || w.name} 예리도가 완전히 회복되었습니다!`, '#c98534');
                            if (engine.showSkillBubble) engine.showSkillBubble(w.index, '예리도 회복!');
                            engine.updateSharpnessUI?.(w.index, w);
                            engine.perkRuntime?.onWhetstoneComplete?.(w);
                        }
                    }
                }
                if (engine.actionStateMachine) engine.actionStateMachine.tick(w);
                else if (w.attackDuration && w.attackDuration > 0) w.attackDuration--;
                if (w.status === 'stunned' && w.stunDuration && w.stunDuration > 0) {
                    if (w.stunStartedThisTick) w.stunStartedThisTick = false;
                    else w.stunDuration--;
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
        if (!engine.selectedMonster.id.includes('valstrax')
            && !engine.monsterStaminaRuntime?.isExhausted?.(engine)) {
            const nextState = HuntBattleTickExecutor.resolveTimedMonsterState(engine);

            if (engine.monsterState !== 'knocked_down'
                && engine.monsterState !== 'stunned'
                && nextState !== engine.monsterState) {
                engine.monsterState = nextState;
                if (engine.monsterState === 'enraged') {
                    engine.monsterUltimateUsedInRage = false;
                    engine.monsterSpeed = engine.getMonsterSpeedForState('enraged');
                    engine.updateMonsterStateUI('분노 상태', `😡 분노한 ${engine.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
                    HuntBattleTickExecutor.queueTransitionRoar(engine, 'rage');
                    engine.addLog(engine.monsterTier === 'small'
                        ? `🔥 [분노] ${engine.selectedMonster.nameKO} 무리가 날뛰기 시작합니다! (공격력 1.5배, 속도 1.5배)`
                        : `🔥 [분노] ${engine.selectedMonster.nameKO}이(가) 포효를 지르며 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                    engine.shakeMonster();
                } else {
                    engine.pendingMonsterRageRoar = false;
                    engine.monsterSpeed = engine.getMonsterSpeedForState('normal');
                    engine.updateMonsterStateUI('일반 상태', engine.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
                    engine.addLog(`📢 ${engine.selectedMonster.nameKO}이(가) 진정하여 평상시로 돌아왔습니다.`, '#eee');
                }
            }
        }
        HuntBattleTickExecutor.flushTransitionRoar(engine);

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
            if (!engine.monsterDeathCuePlayed) {
                engine.monsterDeathCuePlayed = true;
                engine.playSFX?.('monster_death', null, {
                    monsterId: engine.selectedMonster.id
                });
            }
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
        if (engine.monsterStunDuration > 0 && engine.monsterKnockdownDuration > 0) {
            // KO has priority over every knockdown source. Part destruction can
            // still resolve, but its control duration cannot replace KO.
            engine.monsterKnockdownDuration = 0;
        }
        // A trap is an authoritative control state. The interrupted action can
        // remain pending until its cancelled promise settles, but it must never
        // freeze trap ATB recovery or suppress authored struggle beats.
        if (!engine.activeTrapControl && (engine.pendingMonsterAction || engine.pendingMonsterImpact)) {
            engine.monsterAtb = engine.smallMonsterSwarm
                ? engine.smallMonsterSwarm.advanceAtb(engine.monsterSpeed)
                : Math.min(HuntBattleTickExecutor.atbConfig().GAUGE_MAX, engine.monsterAtb + engine.monsterSpeed);
        } else if (engine.monsterKnockdownDuration > 0) {
            engine.monsterKnockdownDuration--;
            // Traps and knockdowns prevent actions, but they do not pause the
            // monster's ATB recovery. A full gauge is held until the opening ends.
            const trapRecoveryPerTick = Number(engine.activeTrapControl?.recoveryPerTick);
            const recoveryPerTick = Number.isFinite(trapRecoveryPerTick) && trapRecoveryPerTick > 0
                ? trapRecoveryPerTick
                : engine.monsterSpeed;
            if (engine.activeTrapControl) {
                engine.activeTrapControl.elapsedTicks = Number(engine.activeTrapControl.elapsedTicks || 0) + 1;
                const schedule = Array.isArray(engine.activeTrapControl.struggleSchedule)
                    ? engine.activeTrapControl.struggleSchedule
                    : [];
                let nextIndex = Number(engine.activeTrapControl.nextStruggleIndex || 0);
                while (nextIndex < schedule.length
                    && engine.activeTrapControl.elapsedTicks >= Number(schedule[nextIndex])) {
                    nextIndex++;
                    engine.activeTrapControl.nextStruggleIndex = nextIndex;
                    engine.playSFX?.('monster_trap', null, {
                        monsterId: engine.selectedMonster.id,
                        trapKind: engine.activeTrapControl.kind,
                        trapPhase: `held-${nextIndex}`,
                        overrideOnly: true
                    });
                    engine.triggerEnvironmentEffect?.('trap-struggle', null, {
                        kind: engine.activeTrapControl.kind,
                        useCount: engine.activeTrapControl.useCount,
                        struggleIndex: nextIndex
                    });
                }
            }
            engine.monsterAtb = Math.min(
                HuntBattleTickExecutor.atbConfig().GAUGE_MAX,
                engine.monsterAtb + recoveryPerTick
            );
            if (engine.activeTrapControl && !engine.activeTrapControl.releasing) {
                const TrapConfig = typeof HuntTrapConfig !== 'undefined' ? HuntTrapConfig : null;
                const escapeTicks = Number(TrapConfig?.ESCAPE_TICKS || 8);
                if (engine.monsterKnockdownDuration <= escapeTicks) {
                    engine.activeTrapControl.releasing = true;
                    engine.playSFX?.('monster_trap', null, {
                        monsterId: engine.selectedMonster.id,
                        trapKind: engine.activeTrapControl.kind,
                        trapPhase: 'escape',
                        overrideOnly: true
                    });
                    engine.triggerEnvironmentEffect?.('trap-release', null, {
                        kind: engine.activeTrapControl.kind,
                        useCount: engine.activeTrapControl.useCount
                    });
                }
            }
            if (engine.monsterKnockdownDuration <= 0) {
                if (engine.activeTrapControl && !engine.activeTrapControl.releasing) {
                engine.playSFX?.('monster_trap', null, {
                    monsterId: engine.selectedMonster.id,
                    trapKind: engine.activeTrapControl.kind,
                    trapPhase: 'escape',
                    overrideOnly: true
                });
                engine.triggerEnvironmentEffect?.('trap-release', null, {
                    kind: engine.activeTrapControl.kind,
                    useCount: engine.activeTrapControl.useCount
                });
                }
                if (engine.activeTrapControl) {
                    engine.activeTrapControl = null;
                    engine.monsterActionLockTicks = Math.max(
                        Number(engine.monsterActionLockTicks || 0),
                        1);
                }
                // Recovery from knockdown
                const restoreState = engine.monsterStaminaRuntime?.isExhausted?.(engine)
                    ? 'exhausted'
                    : HuntBattleTickExecutor.timedMonsterState(engine);

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
            // KO prevents actions, but the downed animation is already the
            // monster's recovery window. Refill and hold ATB during the KO so
            // it does not start a second recovery from zero after standing up.
            engine.monsterAtb = Math.min(
                HuntBattleTickExecutor.atbConfig().GAUGE_MAX,
                engine.monsterAtb + engine.monsterSpeed
            );
            if (engine.monsterStunDuration <= 0) {
                // Recovery from stun
                const restoreState = engine.monsterStaminaRuntime?.isExhausted?.(engine)
                    ? 'exhausted'
                    : HuntBattleTickExecutor.timedMonsterState(engine);

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
            // Compatibility-only motion lock. ATB is the actual recovery cost and
            // continues filling instead of being reset for a second cooldown.
            engine.monsterRecoveryDuration--;
            engine.monsterAtb = Math.min(HuntBattleTickExecutor.atbConfig().GAUGE_MAX, engine.monsterAtb + engine.monsterSpeed);
        } else if (engine.monsterRoarDuration > 0) {
            // Roar motion is an action lock, not a second ATB penalty.
            engine.monsterAtb = Math.min(HuntBattleTickExecutor.atbConfig().GAUGE_MAX, engine.monsterAtb + engine.monsterSpeed);
        } else if (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_flying') {
            engine.monsterAtb = 0;
        } else if (engine.smallMonsterSwarm) {
            engine.monsterAtb = engine.smallMonsterSwarm.advanceAtb(engine.monsterSpeed);
        } else {
            engine.monsterAtb = Math.min(100, engine.monsterAtb + engine.monsterSpeed);
        }
        if (!engine.smallMonsterSwarm) engine.updateMonsterAtbUI(engine.monsterAtb);
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

            const cartReturnAllowsAtb = Number(w.cartRecoveryTicks || 0) <= 3;
            if (w.status === 'alive' && cartReturnAllowsAtb && !isInvincibleJumping && (!engine.perkRuntime || engine.perkRuntime.canAct(w)) && (!engine.blightRuntime?.canAct || engine.blightRuntime.canAct(w)) && (!w.roarStunned || w.interference?.kind === 'roar') && !isHitStunned) {
                // One shared timing config owns the full-gauge cadence. Actions
                // spend a proportional portion while recovery continues in motion.
                let fillRate = HuntBattleTickExecutor.atbConfig().FILL_PER_TICK;
                
                // Apply hunter speed multiplier from config
                fillRate *= engine.hunterSpeedMultiplier;
                fillRate *= Number(w.perkModifiers && w.perkModifiers.atbRate || 1);
                fillRate *= Number(engine.perkRuntime?.atbRecoveryMultiplier?.(w) || 1);
                if (Number(w.hornSpeedBuffTicks || 0) > 0) fillRate *= 1.1;
                
                if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                    fillRate *= 1.2;
                }
                w.atb = Math.min(HuntBattleTickExecutor.atbConfig().GAUGE_MAX, w.atb + fillRate);
            }
            if (w.interference && w.atb >= HuntBattleTickExecutor.atbConfig().GAUGE_MAX) {
                engine.clearHunterInterference?.(w);
            }
            engine.updateWeaponAtbUI(w.index, w.atb);
        });

        // Execute Turns
        if (engine.monsterAtb >= 100
            && !engine.pendingMonsterEncounterRoar
            && !HuntBattleTickExecutor.actionStateTransitionLocked(engine)
            && Number(engine.monsterKnockdownDuration || 0) <= 0
            && Number(engine.monsterStunDuration || 0) <= 0
            && engine.monsterState !== 'knocked_down'
            && engine.monsterState !== 'stunned'
            && (!engine.monsterRoarDuration || engine.monsterRoarDuration <= 0)) {
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
            const actionLocked = Number(w.attackDuration || 0) > 0
                || Number(w.rollDuration || 0) > 0
                || Number(w.guardDuration || 0) > 0
                || Number(w.itemDuration || 0) > 0
                || Boolean(w.isGathering)
                || Boolean(w.interference)
                || Number(w.hitDuration || 0) > 0
                || w.status === 'stunned'
                || Number(w.jumpInvulnerableTicks || 0) > 0;
            const atbConfig = HuntBattleTickExecutor.atbConfig();
            const actionAtbThreshold = w.id === 'dual_blades' && w.demonMode
                ? atbConfig.DEMON_MODE_ACTION_THRESHOLD
                : atbConfig.GAUGE_MAX;
            const continuesGreatSwordCharge = w.id === 'great_sword' && Boolean(w.greatSwordChargeLocked);
            const continuesLongSwordCounter = w.id === 'long_sword'
                && Boolean(w.longSwordReactiveFollowup)
                && Boolean(w.spiritRoundslashReady);
            if ((w.atb >= actionAtbThreshold || continuesGreatSwordCharge || continuesLongSwordCounter) && !actionLocked && w.status === 'alive' && !w.roarStunned) {
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
        hunter.greatSwordChargeLocked = false;
        hunter.attackDuration = 0;
        hunter.currentAction = null;
        hunter.actionState = 'idle';
        hunter.isGathering = false;
        hunter.pendingSharpnessRestore = false;
        if (engine.actionStateMachine) engine.actionStateMachine.cancel(hunter, 'idle');
        engine.cancelHunterBeatAction?.(hunter, 'turn-error');
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
        engine.monsterTraitRuntime?.cancelAtomicFlight?.(engine, 'turn-error-recovery');
        engine.pendingMonsterAction = null;
        engine.pendingMonsterImpact = null;
        engine.monsterAtb = 0;
        if (engine.monsterBurrowState) {
            engine.monsterBurrowState = null;
            engine.callbacks?.onTriggerMonsterBurrowPhase?.('cancel', null, 0);
        }
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
