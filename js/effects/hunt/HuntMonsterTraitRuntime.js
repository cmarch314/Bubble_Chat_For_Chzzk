'use strict';

/**
 * Data-driven monster state which survives individual actions.
 *
 * Profiles author individual moves. Traits own cross-action mechanics such as
 * inflation, broken-limb slips and persistent blast scales. Executors never
 * branch on a monster ID.
 */
class HuntMonsterTraitRuntime {
    static atbConfig() {
        if (typeof HuntAtbConfig !== 'undefined') return HuntAtbConfig;
        if (typeof require === 'function') return require('./HuntAtbConfig.js');
        throw new Error('HuntAtbConfig is required before the monster trait runtime');
    }

    constructor(random = Math.random) {
        this.random = random;
    }

    initialize(engine) {
        engine.monsterTraits = Array.isArray(engine.monsterBehavior?.traits)
            ? engine.monsterBehavior.traits.map(trait => ({ ...trait }))
            : [];
        engine.monsterTraitState = {
            active: new Set(),
            heat: 0,
            pendingHazards: [],
            nextHazardChainId: 1,
            atomicFlightActive: false,
            visualKey: ''
        };
        this.refresh(engine);
    }

    trait(engine, kind) {
        return (engine.monsterTraits || []).find(trait => trait.kind === kind) || null;
    }

    brokenCount(engine, parts = []) {
        const expected = new Set(parts.map(part => String(part).toLowerCase()));
        return (engine.monsterPartState || []).filter(part =>
            (part.broken || part.severed)
            && expected.has(String(part.kind || '').toLowerCase())
        ).length;
    }

    isPartBroken(engine, partKind) {
        const expected = String(partKind || '').toLowerCase();
        return (engine.monsterPartState || []).some(part =>
            String(part.kind || part.id || '').toLowerCase() === expected
            && (part.broken || part.severed)
        );
    }

    refresh(engine) {
        const state = engine.monsterTraitState;
        if (!state) return;
        const next = new Set();
        const airborne = engine.monsterFlightState === 'airborne';
        const enraged = engine.monsterState === 'enraged';

        for (const trait of engine.monsterTraits || []) {
            if (trait.kind === 'inflation') {
                const disabled = this.brokenCount(engine, trait.disabledByParts || []) > 0;
                if (airborne && !disabled) next.add('inflated');
            } else if (trait.kind === 'rage-eyes' && enraged) {
                next.add('rage-eyes');
            } else if (trait.kind === 'ice-coat' && (airborne || enraged)) {
                next.add('ice-coated');
            } else if (trait.kind === 'hellfire' && enraged) {
                next.add('hellfire');
            } else if (trait.kind === 'blast-scales') {
                const hazards = state.pendingHazards || [];
                const palette = trait.visualPalette === 'purple' ? 'purple' : 'red';
                if (hazards.some(hazard => hazard.phase === 'heated')) {
                    next.add(`scale-heated-${palette}`);
                }
                if (hazards.length >= 4) next.add(`scale-critical-${palette}`);
            }
        }

        state.active = next;
        const visualKey = [...next].sort().join(' ');
        if (visualKey !== state.visualKey) {
            state.visualKey = visualKey;
            engine.callbacks?.onUpdateMonsterTraitVisual?.([...next]);
        }
    }

    context(engine) {
        this.refresh(engine);
        return [...(engine.monsterTraitState?.active || [])];
    }

    canEnterFlight(engine) {
        return !(engine.monsterTraits || []).some(trait =>
            trait.kind === 'inflation'
            && this.brokenCount(engine, trait.disabledByParts || []) > 0
        );
    }

    canTriggerTrap(engine, trapKind) {
        const conditional = this.trait(engine, 'conditional-trap');
        if (!conditional || conditional.trap !== trapKind) return true;
        return (conditional.allowedStates || []).includes(engine.monsterState);
    }

    decorateAction(engine, pattern) {
        if (!pattern || pattern.type === 'roar' || pattern.tags?.includes('roar')) return pattern;
        const iceCoat = this.trait(engine, 'ice-coat');
        if (!iceCoat || engine.monsterState !== 'enraged') return pattern;
        // Authored ice actions already own their plume/trail and must not stack
        // a second full-body burst over it.
        if (pattern.tags?.includes('ice') || pattern.attachedFx) return pattern;
        const attackFx = iceCoat.attackFx || {
            emoji: '❄️', className: 'legiana-rage-ice-release', durationMs: 850
        };
        const originPart = String(pattern.originPart || '').toLowerCase();
        const tags = new Set(pattern.tags || []);
        const partClass = originPart === 'tail' || tags.has('tail')
            ? 'legiana-rage-tail-ice'
            : originPart === 'claw' || tags.has('claw')
                ? 'legiana-rage-claw-ice'
                : attackFx.className;
        const partBound = partClass !== attackFx.className;
        const durationMs = partBound
            ? Math.max(900, Math.min(1800, Math.round(Number(pattern.animationDurationMs || 1200) * .72)))
            : Number(attackFx.durationMs || 850);
        return {
            ...pattern,
            attachedFx: { ...attackFx, className: partClass, durationMs },
            runtimeTraitFx: 'ice-coat'
        };
    }

    scaleHazard(engine, slotIndex) {
        return (engine.monsterTraitState?.pendingHazards || [])
            .find(hazard => hazard.slotIndex === Number(slotIndex)) || null;
    }

    setScaleHeated(engine, hazard, ticks = 30) {
        if (!hazard || hazard.phase === 'heated') return false;
        hazard.phase = 'heated';
        hazard.remainingTicks = Math.min(
            Math.max(1, Number(hazard.remainingTicks || ticks)),
            Math.max(1, Number(ticks || 30))
        );
        engine.triggerEnvironmentEffect?.('blast-scale-heat', hazard.slotIndex);
        return true;
    }

    dropScaleAtSlot(engine, slotIndex, sourcePart = null) {
        const scaleTrait = this.trait(engine, 'blast-scales');
        const slot = Number(slotIndex);
        if (!scaleTrait || !Number.isInteger(slot) || slot < 0 || slot > 3) return false;
        if (engine.monsterState === 'exhausted' || this.scaleHazard(engine, slot)) return false;
        if (sourcePart && this.isPartBroken(engine, sourcePart)) return false;

        const heated = engine.monsterState === 'enraged';
        const hazard = {
            slotIndex: slot,
            sourcePart: sourcePart || null,
            landingTicks: 14,
            phase: heated ? 'heated' : 'normal',
            remainingTicks: heated
                ? Number(scaleTrait.heatedFuseTicks || 30)
                : Number(scaleTrait.totalLifetimeTicks || 300),
            chainId: null,
            globalChain: false
        };
        engine.monsterTraitState.pendingHazards.push(hazard);
        engine.triggerEnvironmentEffect?.('blast-scale-place', slot, {
            sourcePart: sourcePart || 'body',
            visualPalette: scaleTrait.visualPalette === 'purple' ? 'purple' : 'red'
        });
        if (heated) engine.triggerEnvironmentEffect?.('blast-scale-heat', slot);
        return true;
    }

    cancelInFlightScales(engine) {
        const state = engine.monsterTraitState;
        if (!state?.pendingHazards?.length) return 0;
        const cancelled = state.pendingHazards.filter(hazard => Number(hazard.landingTicks || 0) > 0);
        if (!cancelled.length) return 0;
        state.pendingHazards = state.pendingHazards.filter(hazard => Number(hazard.landingTicks || 0) <= 0);
        cancelled.forEach(hazard => {
            engine.triggerEnvironmentEffect?.('blast-scale-cancel', hazard.slotIndex);
        });
        this.refresh(engine);
        return cancelled.length;
    }

    sourcePartsFor(pattern = {}) {
        const result = [];
        Object.entries(pattern.scaleDropsByPart || {}).forEach(([part, count]) => {
            for (let index = 0; index < Math.max(0, Number(count || 0)); index++) {
                result.push(part);
            }
        });
        return result;
    }

    adjacentSlots(anchor, count) {
        const origin = Number(anchor);
        if (!Number.isInteger(origin) || origin < 0 || origin > 3) return [];
        return [0, 1, 2, 3]
            .sort((left, right) =>
                Math.abs(left - origin) - Math.abs(right - origin)
                || left - right
            )
            .slice(0, Math.max(0, Number(count || 0)));
    }

    dropScalesForAction(engine, pattern, attackResults = []) {
        const sourceParts = this.sourcePartsFor(pattern);
        if (!sourceParts.length || pattern.scaleSlotMode === 'all') return;
        const anchor = attackResults.map(result => Number(result?.index)).find(Number.isInteger);
        if (!Number.isInteger(anchor)) return;
        const slots = this.adjacentSlots(anchor, sourceParts.length);
        sourceParts.forEach((part, index) => {
            if (index < slots.length) this.dropScaleAtSlot(engine, slots[index], part);
        });
    }

    onImpactEvent(engine, pattern, event = {}, isFinal = false) {
        if (!isFinal || !pattern?.tags?.includes('blast-scale-source')) return false;
        if (pattern.scaleDropTiming === 'before-impact') return false;
        const targetIndices = Array.isArray(event.targetIndices)
            ? event.targetIndices.filter(Number.isInteger)
            : [];
        if (!targetIndices.length) return false;
        const before = Number(engine.monsterTraitState?.pendingHazards?.length || 0);
        this.dropScalesForAction(
            engine,
            pattern,
            targetIndices.map(index => ({ index, result: 'pending-impact' }))
        );
        return Number(engine.monsterTraitState?.pendingHazards?.length || 0) > before;
    }

    heatTargetScale(engine, attackResults = []) {
        const targetIndex = attackResults.map(result => Number(result?.index)).find(Number.isInteger);
        if (!Number.isInteger(targetIndex)) return false;
        return this.setScaleHeated(engine, this.scaleHazard(engine, targetIndex), 30);
    }

    heatAllScales(engine) {
        for (const hazard of engine.monsterTraitState?.pendingHazards || []) {
            this.setScaleHeated(engine, hazard, 30);
        }
    }

    scheduleGlobalDetonation(engine, anchorSlot) {
        const hazards = [...(engine.monsterTraitState?.pendingHazards || [])]
            .sort((a, b) =>
                Math.abs(a.slotIndex - Number(anchorSlot || 0))
                - Math.abs(b.slotIndex - Number(anchorSlot || 0))
                || a.slotIndex - b.slotIndex
            );
        const chainId = Number(engine.monsterTraitState?.nextHazardChainId || 1);
        engine.monsterTraitState.nextHazardChainId = chainId + 1;
        hazards.forEach((hazard, index) => {
            hazard.phase = 'heated';
            hazard.remainingTicks = (index + 1) * 10;
            hazard.chainId = chainId;
            hazard.globalChain = true;
            engine.triggerEnvironmentEffect?.('blast-scale-heat', hazard.slotIndex);
        });
    }

    beforeAction(engine, pattern) {
        if (!pattern?.tags?.includes('high-flight-sequence')) return;
        engine.monsterTraitState.atomicFlightActive = true;
        engine.monsterFlightState = 'airborne';
        engine.monsterFlightTicksRemaining = Math.max(1, Number(pattern.activeTicks || 120));
        engine.monsterLandingPending = true;
        engine.beginMonsterTraversal?.(
            'bazel-carpet-bombing',
            Math.max(1, Number(pattern.activeTicks || 120) + Number(pattern.windupTicks || 1)),
            { untargetable: true }
        );
        engine.updateMonsterFlightUI?.(true, 0, 0, 0, engine.monsterFlightTicksRemaining);
    }

    onRoar(engine) {
        if (this.trait(engine, 'blast-scales')) this.heatAllScales(engine);
    }

    cancelAtomicFlight(engine, reason = 'atomic-flight-cancelled') {
        if (!engine.monsterTraitState?.atomicFlightActive) return false;
        engine.monsterTraitState.atomicFlightActive = false;
        if (engine.monsterFlightRuntime?.land) engine.monsterFlightRuntime.land(engine, true);
        else {
            engine.monsterFlightState = 'grounded';
            engine.monsterFlightTicksRemaining = 0;
            engine.monsterLandingPending = false;
        }
        engine.clearMonsterTraversal?.(reason);
        return true;
    }

    interceptAerialImpact(engine, pattern) {
        if (!pattern?.tags?.includes('high-flight-sequence') || !engine.pendingLandingTrap) {
            return false;
        }
        engine.monsterTraitState.atomicFlightActive = false;
        if (engine.monsterFlightRuntime?.land) engine.monsterFlightRuntime.land(engine, true);
        else {
            engine.monsterFlightState = 'grounded';
            engine.monsterLandingPending = false;
        }
        engine.clearMonsterTraversal?.('aerial-trap-intercept');
        return true;
    }

    afterAction(engine, pattern, attackResults = []) {
        const judgment = pattern?.runtimeJudgment || null;
        if ((pattern?.runtimeImpactTimelineEvent || judgment)
            && (judgment?.timelineFinal ?? pattern.runtimeImpactTimelineFinal) !== true) {
            return attackResults;
        }

        const scaleTrait = this.trait(engine, 'blast-scales');
        if (scaleTrait) {
            if (pattern?.ignitesAllScales || pattern?.tags?.includes('ignites-all-scales')) {
                this.heatAllScales(engine);
            } else if (pattern?.ignitesScaleTarget || pattern?.tags?.includes('ignites-scale-target')) {
                this.heatTargetScale(engine, attackResults);
            }
            if ((judgment?.eventKind ?? pattern?.runtimeImpactEventKind) === 'carpet-dive') {
                const anchor = (judgment?.targetIndices ?? pattern.runtimeImpactTargetIndices)?.[0]
                    ?? attackResults[0]?.index
                    ?? 0;
                this.scheduleGlobalDetonation(engine, anchor);
                engine.monsterTraitState.atomicFlightActive = false;
                if (engine.monsterFlightRuntime?.land) engine.monsterFlightRuntime.land(engine, true);
                else engine.monsterFlightState = 'grounded';
            }
        }

        const slipTrait = this.trait(engine, 'broken-limb-slip');
        if (slipTrait
            && pattern?.tags?.some(tag => (slipTrait.patternTags || ['charge']).includes(tag))
            && this.brokenCount(engine, slipTrait.parts || []) > 0) {
            const broken = this.brokenCount(engine, slipTrait.parts || []);
            const duration = Math.max(1, Math.round(
                Number(slipTrait.baseTicks || 18) + Number(slipTrait.perBrokenPartTicks || 8) * broken
            ));
            HuntMonsterTraitRuntime.atbConfig().applyMonsterControlAtb(engine, 'stumble');
            engine.monsterActionLockTicks = Math.max(Number(engine.monsterActionLockTicks || 0), duration);
            engine.callbacks?.onTriggerMonsterTraitReaction?.('limb-slip', duration);
        }

        const fatigueTrait = this.trait(engine, 'charge-fatigue');
        if (fatigueTrait
            && engine.monsterState === 'exhausted'
            && pattern?.tags?.includes('charge')) {
            const duration = Math.max(1, Number(fatigueTrait.stumbleTicks || 24));
            HuntMonsterTraitRuntime.atbConfig().applyMonsterControlAtb(engine, 'stumble');
            engine.monsterActionLockTicks = Math.max(Number(engine.monsterActionLockTicks || 0), duration);
            engine.callbacks?.onTriggerMonsterTraitReaction?.('fatigue-stumble', duration);
        }

        this.refresh(engine);
        return attackResults;
    }

    tick(engine) {
        const state = engine.monsterTraitState;
        if (!state) return;
        this.refresh(engine);
        if (!state.pendingHazards.length || engine.monsterHp <= 0) return;

        state.pendingHazards.forEach(hazard => {
            hazard.landingTicks = Math.max(0, Number(hazard.landingTicks || 0) - 1);
            hazard.remainingTicks--;
            if (hazard.phase === 'normal' && hazard.remainingTicks <= 30) {
                this.setScaleHeated(engine, hazard, 30);
            }
        });
        const due = state.pendingHazards.filter(hazard => hazard.remainingTicks <= 0);
        state.pendingHazards = state.pendingHazards.filter(hazard => hazard.remainingTicks > 0);
        if (!due.length) return;

        const dueSlots = new Set(due.map(hazard => hazard.slotIndex));
        due.forEach(hazard => {
            engine.triggerEnvironmentEffect?.('blast-scale-explode', hazard.slotIndex);
            const target = (engine.selectedWeapons || []).find(hunter =>
                hunter?.index === hazard.slotIndex
                && ['alive', 'stunned'].includes(String(hunter.status || ''))
                && Number(hunter.cartRecoveryTicks || 0) <= 0
                && !hunter.isAtCamp
            );
            if (target) {
                engine.executeMonsterTurn?.({
                    id: 'trait.delayed_blast_scale',
                    name: '폭린 폭발',
                    type: 'field',
                    delivery: 'field',
                    damageRatio: Number(this.trait(engine, 'blast-scales')?.damageRatio || .30),
                    maxTargets: 1,
                    tags: ['blast', 'elemental', 'fire', 'delayed-hazard', 'butt-stumble'],
                    runtimeImpactTargetIndices: [target.index],
                    runtimeImpactCommit: true,
                    runtimeImpactTimelineEvent: true,
                    runtimeImpactTimelineFinal: true
                }, null, target.index);
            }
        });
        // Adjacent scales can detonate on the same tick. Treat that visual
        // burst as one audio event and align it with the expanding explosion
        // graphic instead of playing it at the animation's first frame.
        const audioDelayMs = Math.max(
            0,
            Number(this.trait(engine, 'blast-scales')?.explosionAudioDelayMs ?? 500)
        );
        const explosionMonsterId = engine.selectedMonster?.id;
        const schedule = typeof engine.schedule === 'function'
            ? engine.schedule.bind(engine)
            : callback => callback();
        schedule(() => {
            engine.playSFX?.('monster_blast_scale_explosion', null, {
                monsterId: explosionMonsterId,
                patternId: 'trait.delayed_blast_scale',
                patternName: '폭린 폭발',
                patternType: 'blast_scale_explosion'
            });
        }, audioDelayMs);

        const chained = new Set();
        due.filter(hazard => !hazard.globalChain).forEach(hazard => {
            for (const neighbour of [hazard.slotIndex - 1, hazard.slotIndex + 1]) {
                if (dueSlots.has(neighbour) || chained.has(neighbour)) continue;
                const adjacent = this.scaleHazard(engine, neighbour);
                if (!adjacent) continue;
                adjacent.phase = 'heated';
                adjacent.remainingTicks = Math.min(Number(adjacent.remainingTicks || 10), 10);
                adjacent.chainId = hazard.chainId || Number(state.nextHazardChainId || 1);
                adjacent.globalChain = false;
                chained.add(neighbour);
                engine.triggerEnvironmentEffect?.('blast-scale-heat', neighbour);
            }
            if (!hazard.chainId) state.nextHazardChainId++;
        });
        this.refresh(engine);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterTraitRuntime;
else globalThis.HuntMonsterTraitRuntime = HuntMonsterTraitRuntime;
