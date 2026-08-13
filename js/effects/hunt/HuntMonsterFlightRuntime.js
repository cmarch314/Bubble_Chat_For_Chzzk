'use strict';

const HuntMonsterFlightAtbConfig = typeof HuntAtbConfig !== 'undefined'
    ? HuntAtbConfig
    : (typeof require === 'function' ? require('./HuntAtbConfig.js') : null);

class HuntMonsterFlightRuntime {
    static AIRBORNE_EVADE_CHANCE = .5;
    static FLIGHT_DURATION_TICKS = 600;
    static NORMAL_KNOCKDOWN_TICKS = 70;
    static AERIAL_KNOCKDOWN_MULTIPLIER = 1.5;

    constructor(random = Math.random) {
        this.random = random;
    }

    static archetypes() {
        if (typeof HuntMonsterArchetypeCatalog !== 'undefined') return HuntMonsterArchetypeCatalog;
        if (typeof require === 'function') return require('./HuntMonsterArchetypeCatalog.js');
        return null;
    }

    static normalize(id) {
        return String(id || '').toLowerCase().replace(/[-']/g, '_');
    }

    static flightConfig(monster) {
        return this.archetypes()?.flight(monster) || null;
    }

    static isCapable(monster) {
        return Boolean(this.flightConfig(monster));
    }

    static decoratePattern(monsterId, pattern) {
        if (!this.isCapable({ id: monsterId })) return pattern;
        const evidenceText = `${pattern?.sourceActionClass || ''} ${pattern?.name || ''}`;
        const flightOnly = /Fly|Air|Aerial|공중|급강하|비상|활공/i.test(evidenceText);
        const airCompatible = flightOnly || pattern?.tags?.includes('projectile') || pattern?.type === 'roar';
        return {
            ...pattern,
            tags: [...new Set([
                ...(pattern.tags || []),
                flightOnly && 'flight-only',
                airCompatible && 'air-compatible'
            ].filter(Boolean))],
            flightEvidence: flightOnly
                ? (pattern.sourceActionClass ? `installed-action:${pattern.sourceActionClass}` : `named-pattern:${pattern.name}`)
                : undefined
        };
    }

    initialize(engine) {
        engine.monsterArchetype = HuntMonsterFlightRuntime.archetypes()?.resolve(engine.selectedMonster) || null;
        engine.monsterBehavior = HuntMonsterFlightRuntime.archetypes()?.behavior(engine.selectedMonster) || {};
        engine.monsterCanFly = Boolean(engine.monsterArchetype?.flight);
        engine.monsterFlightState = 'grounded';
        engine.monsterFlightTicksRemaining = 0;
        engine.monsterFlightTurns = 0;
        engine.monsterGroundTurns = 0;
        engine.monsterFlightCooldown = 0;
        engine.monsterJustTookOff = false;
        engine.monsterExhaustedFlightWobble = false;
    }

    tick(engine) {
        if (engine.monsterFlightCooldown > 0) engine.monsterFlightCooldown--;
        if (engine.monsterFlightState !== 'airborne') return;
        engine.monsterFlightTicksRemaining = Math.max(0, Number(engine.monsterFlightTicksRemaining || 0) - 1);
        this.updateFlightUI(engine);
        if (engine.monsterFlightTicksRemaining <= 0) {
            if (engine.monsterExhaustedFlightWobble) {
                const landingStagger = Math.max(1, Number(
                    engine.monsterBehavior?.exhaustedFlightLandingStaggerTicks || 30
                ));
                engine.monsterExhaustedFlightWobble = false;
                this.land(engine, false);
                engine.monsterRecoveryDuration = Math.max(
                    Number(engine.monsterRecoveryDuration || 0),
                    landingStagger
                );
                this.playFlightReaction(engine, 'exhausted-landing-stagger', landingStagger);
                engine.showSkillBubble?.('monster', '💫 착지 후 휘청임');
                engine.addLog?.(`💫 [탈진 착지] ${engine.selectedMonster.nameKO}가 착지한 뒤 균형을 잃고 비틀거립니다!`, '#9ed7e8');
                return;
            }
            const landingPatternId = engine.monsterBehavior?.naturalLandingPatternId;
            if (landingPatternId && engine.monsterState !== 'exhausted') {
                if (!engine.monsterLandingPending) {
                    engine.monsterLandingPending = true;
                    engine.forcedMonsterPatternId = landingPatternId;
                    engine.monsterAtb = 100;
                    engine.updateMonsterAtbUI?.(100);
                } else if (!engine.pendingMonsterAction
                    && !engine.pendingMonsterImpact
                    && !engine.forcedMonsterPatternId) {
                    engine.forcedMonsterPatternId = landingPatternId;
                }
            } else {
                this.land(engine, false);
            }
        }
    }

    updateFlightUI(engine) {
        engine.updateMonsterFlightUI(
            engine.monsterFlightState === 'airborne',
            0,
            0,
            0,
            Number(engine.monsterFlightTicksRemaining || 0)
        );
    }

    shouldEvade(engine) {
        const chance = HuntMonsterFlightRuntime.flightConfig(engine?.selectedMonster)?.airborneEvadeChance
            ?? HuntMonsterFlightRuntime.AIRBORNE_EVADE_CHANCE;
        return engine?.monsterFlightState === 'airborne' && this.random() < chance;
    }

    beforeTurn(engine, patterns = []) {
        if (!engine.monsterCanFly || engine.monsterFlightCooldown > 0 || engine.monsterFlightState === 'airborne') return true;
        if (['knocked_down', 'stunned'].includes(engine.monsterState)) return true;
        if (!patterns.some(pattern => pattern.tags?.includes('flight-only'))) return true;
        if (engine.monsterTraitRuntime?.canEnterFlight?.(engine) === false) return true;
        if (engine.monsterBehavior?.flightMode === 'short-chain') {
            const chance = Math.max(0, Math.min(1, Number(engine.monsterBehavior.flightAttemptChance || 0)));
            if (this.random() >= chance) return true;
            const result = this.attemptTakeOff(engine);
            if (result === 'failed') return false;
            if (engine.monsterState === 'exhausted') {
                const wobbleTicks = Math.max(1, Number(
                    engine.monsterBehavior.exhaustedFlightWobbleTicks || 30
                ));
                engine.monsterAtb = 0;
                engine.updateMonsterAtbUI?.(0);
                engine.monsterExhaustedFlightWobble = true;
                engine.monsterFlightTicksRemaining = wobbleTicks;
                this.playFlightReaction(engine, 'exhausted-flight-wobble', wobbleTicks);
                engine.showSkillBubble?.('monster', '💫 탈진 비행');
                engine.addLog?.(`💫 [탈진 비행] ${engine.selectedMonster.nameKO}가 간신히 날아올랐지만 공중에서 비틀거립니다!`, '#9ed7e8');
                return false;
            }
            return true;
        }
        if (engine.monsterState === 'exhausted') return true;
        engine.monsterGroundTurns++;
        const chance = engine.monsterState === 'enraged' ? .58 : .34;
        if (engine.monsterGroundTurns >= 2 && this.random() < chance) {
            const result = this.attemptTakeOff(engine);
            if (result === 'failed') return false;
            // Legiana's takeoff is a visible stance transition, not an attack.
            // Keep the ready gauge intact and select/pay for the first aerial
            // action on the following tick instead of hiding both events in
            // one empty-looking ATB spend.
            if (engine.monsterBehavior?.takeoffPreservesReadyAtb) return false;
            return true;
        }
        return true;
    }

    recoverNoEligibleAirAction(engine) {
        if (engine.monsterFlightState !== 'airborne') return false;
        this.land(engine, true);
        engine.monsterJustTookOff = false;
        engine.monsterAtb = Math.min(100, Number(engine.monsterAtb || 0));
        engine.updateMonsterAtbUI?.(engine.monsterAtb);
        engine.monsterActionGateDiagnostics = [
            ...(engine.monsterActionGateDiagnostics || []),
            {
                tick: Number(engine.battleTime || 0),
                monsterId: engine.selectedMonster?.id || 'unknown',
                reason: 'no-eligible-air-action',
                recoveredTo: 'grounded'
            }
        ].slice(-24);
        console.warn?.('[Hunt] Recovered an airborne action-selection stall.', {
            monsterId: engine.selectedMonster?.id,
            battleTick: engine.battleTime
        });
        return true;
    }

    failureChance(engine) {
        const chances = engine.monsterBehavior?.flightFailureChanceByBrokenWings;
        if (!Array.isArray(chances)) return 0;
        const broken = Math.max(0, Math.min(2,
            HuntMonsterFlightRuntime.archetypes()?.brokenWingCount(engine.monsterPartState) || 0));
        return Math.max(0, Math.min(1, Number(chances[broken] || 0)));
    }

    attemptTakeOff(engine) {
        if (this.random() < this.failureChance(engine)) {
            this.failTakeoff(engine);
            return 'failed';
        }
        this.takeOff(engine);
        return 'airborne';
    }

    failTakeoff(engine) {
        const staggerTicks = Math.max(1, Number(engine.monsterBehavior?.flightFailureStaggerTicks || 50));
        engine.monsterFlightState = 'grounded';
        engine.monsterFlightTicksRemaining = 0;
        engine.monsterJustTookOff = false;
        engine.monsterAtb = 0;
        engine.monsterRecoveryDuration = Math.max(Number(engine.monsterRecoveryDuration || 0), staggerTicks);
        engine.updateMonsterAtbUI?.(0);
        this.updateFlightUI(engine);
        this.playFlightReaction(engine, 'takeoff-failure', staggerTicks);
        engine.showSkillBubble?.('monster', '💫 비행 실패!');
        engine.addLog?.(`💫 [비행 실패] ${engine.selectedMonster.nameKO}의 손상된 날개가 꺾여 이륙에 실패했습니다!`, '#ffd27f');
    }

    playFlightReaction(engine, kind, durationTicks) {
        const target = (engine.selectedWeapons || []).find(hunter => hunter?.status === 'alive');
        if (!target) return;
        const profile = kind === 'exhausted-flight-wobble'
            ? 'rath-flight-wobble'
            : 'rath-flight-stagger';
        engine.callbacks?.onTriggerMonsterAttack?.(
            'physical',
            '💫',
            [{ index: target.index, result: 'pending' }],
            kind,
            {
                id: `flight.${kind}`,
                name: kind,
                type: 'physical',
                damageRatio: 0,
                tags: ['no-impact', 'flight-reaction'],
                animationProfile: profile,
                animationDurationMs: Math.max(100, Number(durationTicks || 1) * 100),
                attachedFx: { emoji: '💫', className: 'flight-stagger', durationMs: Math.max(100, Number(durationTicks || 1) * 100) }
            }
        );
    }

    takeOff(engine) {
        const config = HuntMonsterFlightRuntime.flightConfig(engine.selectedMonster) || {};
        const behaviorDuration = Number(engine.monsterBehavior?.shortFlightDurationTicks || 0);
        engine.monsterFlightState = 'airborne';
        engine.monsterFlightTicksRemaining = behaviorDuration
            || Number(config.durationTicks || HuntMonsterFlightRuntime.FLIGHT_DURATION_TICKS);
        engine.monsterFlightTurns = 0;
        engine.monsterGroundTurns = 0;
        engine.monsterJustTookOff = true;
        const interference = engine.monsterBehavior?.takeoffInterference;
        if (interference) {
            (engine.selectedWeapons || [])
                .filter(hunter => hunter?.status === 'alive')
                .forEach(hunter => engine.applyHunterInterference?.(
                    hunter,
                    interference.kind,
                    interference.size
                ));
        }
        engine.addLog(`🪽 [비행] ${engine.selectedMonster.nameKO}(이)가 공중 패턴에 돌입합니다.`, '#8fdcff');
        engine.showSkillBubble('monster', '🪽 비행');
        this.updateFlightUI(engine);
    }

    afterAction(engine, pattern = {}) {
        if (pattern.runtimeImpactTimelineEvent && pattern.runtimeImpactTimelineFinal !== true) return;
        if (pattern.flightTransition === 'takeoff' && engine.monsterFlightState === 'grounded') {
            this.takeOff(engine);
            return;
        }
        if (pattern.flightTransition === 'land' && engine.monsterFlightState === 'airborne') {
            this.land(engine, false);
            return;
        }
        if (engine.monsterBehavior?.flightMode === 'short-chain'
            && engine.monsterFlightState === 'airborne'
            && pattern.tags?.includes('flight-only')) {
            this.land(engine, false);
            return;
        }
        if (engine.monsterFlightState === 'airborne') {
            engine.monsterFlightTurns++;
            const actionCounts = engine.monsterBehavior?.flightActionCountByState;
            const stateKey = engine.monsterState === 'enraged' ? 'enraged' : 'normal';
            const actionLimit = Math.max(0, Number(actionCounts?.[stateKey] || 0));
            const landingPatternId = engine.monsterBehavior?.naturalLandingPatternId;
            if (actionLimit > 0
                && engine.monsterFlightTurns >= actionLimit
                && landingPatternId
                && !engine.monsterLandingPending) {
                engine.monsterLandingPending = true;
                engine.forcedMonsterPatternId = landingPatternId;
            }
        }
    }

    cooldownTicks(engine) {
        const catalog = HuntMonsterFlightRuntime.archetypes();
        return catalog
            ? catalog.flightCooldownTicks(engine.selectedMonster, engine.monsterPartState)
            : 0;
    }

    land(engine, forced = false) {
        if (engine.monsterFlightState !== 'airborne') return;
        engine.monsterFlightState = 'grounded';
        engine.monsterLandingPending = false;
        engine.monsterFlightTicksRemaining = 0;
        engine.monsterFlightTurns = 0;
        engine.monsterJustTookOff = false;
        engine.monsterFlightCooldown = this.cooldownTicks(engine);
        this.updateFlightUI(engine);
        this.triggerLandingTrap(engine);
        if (!forced) engine.addLog(`🪽 [착지] ${engine.selectedMonster.nameKO}(이)가 지상으로 돌아옵니다.`, '#d7e8ef');
    }

    triggerLandingTrap(engine) {
        const pendingTrap = engine.pendingLandingTrap;
        if (!pendingTrap) return false;
        engine.pendingLandingTrap = null;
        let trapEffect;
        if (typeof engine.beginMonsterTrapControl === 'function') {
            trapEffect = engine.beginMonsterTrapControl('pitfall', 40);
        } else {
            const trapTicks = engine.consumeTrapDuration?.(40) || 40;
            engine.monsterState = 'knocked_down';
            engine.monsterKnockdownDuration = Math.max(
                Number(engine.monsterKnockdownDuration || 0),
                trapTicks
            );
            if (HuntMonsterFlightAtbConfig?.applyMonsterControlAtb) {
                HuntMonsterFlightAtbConfig.applyMonsterControlAtb(engine, 'trap');
            } else {
                engine.monsterAtb = 50;
                engine.updateMonsterAtbUI?.(50);
            }
            trapEffect = { durationTicks: trapTicks, retainedAtb: engine.monsterAtb, useCount: 1 };
        }
        engine.triggerEnvironmentEffect?.('pitfall', pendingTrap.hunterIndex, trapEffect);
        engine.addLog?.(`🪤 [착지 함정] ${engine.selectedMonster.nameKO}(이)가 설치된 함정을 밟았습니다!`, '#ffe66d');
        return true;
    }

    groundForStatus(engine, status = 'status') {
        const airborne = engine?.monsterFlightState === 'airborne'
            || engine?.monsterState === 'valstrax_flying';
        if (!airborne) return false;
        if (engine.monsterFlightState === 'airborne') this.land(engine, true);
        else {
            engine.monsterFlightState = 'grounded';
            engine.monsterFlightTicksRemaining = 0;
            engine.monsterFlightCooldown = this.cooldownTicks(engine);
            this.updateFlightUI(engine);
        }
        return true;
    }

    forceLanding(engine, reason = 'knockdown', durationTicks = null, options = {}) {
        const airborne = engine?.monsterFlightState === 'airborne' || engine?.monsterState === 'valstrax_flying';
        if (!airborne) return false;
        engine.forcedMonsterPatternId = null;
        engine.monsterLandingPending = false;
        const config = HuntMonsterFlightRuntime.flightConfig(engine.selectedMonster) || {};
        const aerialTicks = Number(durationTicks) || Math.ceil(
            HuntMonsterFlightRuntime.NORMAL_KNOCKDOWN_TICKS
            * Number(config.forcedLandingMultiplier || HuntMonsterFlightRuntime.AERIAL_KNOCKDOWN_MULTIPLIER)
        );

        if (engine.monsterFlightState === 'airborne') this.land(engine, true);
        else {
            engine.monsterFlightState = 'grounded';
            engine.monsterFlightTicksRemaining = 0;
            engine.monsterFlightCooldown = this.cooldownTicks(engine);
            this.updateFlightUI(engine);
        }
        if (engine.interruptMonsterMovement) engine.interruptMonsterMovement(`forced-landing:${reason}`);
        else {
            engine.pendingMonsterAction = null;
            engine.pendingMonsterImpact = null;
        }
        engine.monsterAtb = Number.isFinite(options.retainedAtb)
            ? Math.max(0, Math.min(100, Number(options.retainedAtb)))
            : 0;
        engine.monsterState = 'knocked_down';
        engine.monsterKnockdownDuration = Math.max(Number(engine.monsterKnockdownDuration || 0), aerialTicks);
        engine.playSFX?.('monster_knockdown', null, {
            monsterId: engine.selectedMonster.id,
            reactionProfile: options.partReactionKind === 'tail_sever_roll' ? 'tail' : 'knockdown'
        });
        engine.updateMonsterAtbUI(engine.monsterAtb);
        engine.updateMonsterStateUI('격추 대경직', `💥 격추된 ${engine.selectedMonster.nameKO} 💥`, {
            color: '#8fdcff',
            bg: 'rgba(80,180,255,.16)'
        });
        engine.addLog(`💥 [격추] ${engine.selectedMonster.nameKO}(이)가 추락해 대경직에 빠집니다!`, '#8fdcff');
        engine.showSkillBubble('monster', '💥 격추 대경직!');
        const partReactionKind = options.partReactionKind || null;
        if (partReactionKind && engine.callbacks?.onTriggerMonsterPartBreakReaction) {
            engine.monsterPartReactionKind = partReactionKind;
            engine.callbacks.onTriggerMonsterPartBreakReaction(
                partReactionKind,
                aerialTicks,
                options.partKind || null
            );
        } else {
            engine.callbacks?.onTriggerMonsterKnockdownAnim?.();
        }
        engine.shakeMonster();
        return true;
    }

    promoteAirborneKnockdown(engine) {
        const airborne = engine?.monsterFlightState === 'airborne' || engine?.monsterState === 'valstrax_flying';
        const hasKnockdown = Number(engine?.monsterKnockdownDuration || 0) > 0 || engine?.monsterState === 'knocked_down';
        if (!airborne || !hasKnockdown) return false;
        return this.forceLanding(engine, 'knockdown');
    }

    onPartBreak(engine, part, reaction = null, options = {}) {
        const config = HuntMonsterFlightRuntime.flightConfig(engine?.selectedMonster);
        if (!config?.partBreakForcesLanding || !part) return false;
        const partReactionKind = reaction?.visualType
            || (part.severed ? 'tail_sever_roll' : 'part_break_topple');
        return this.forceLanding(
            engine,
            `part-break:${part.kind || 'unknown'}`,
            Number(reaction?.durationTicks || 0) || null,
            {
                partReactionKind,
                partKind: part.kind || null,
                retainedAtb: options.retainedAtb,
                partBreakSize: options.partBreakSize || 'large'
            }
        );
    }

    // Direct damage does not fill an invented aerial-topple gauge. Forced
    // landings come from authored reactions: part break, KO, status or flash.
    onHunterDamage() {
        return false;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterFlightRuntime;
else globalThis.HuntMonsterFlightRuntime = HuntMonsterFlightRuntime;
