class HuntMonsterActionPolicy {
    static movement(pattern = {}, monsterState = 'normal') {
        const movement = pattern.movement;
        if (!movement) return null;
        const stateTicks = movement.ticksByState?.[monsterState];
        const legacyStateTicks = monsterState === 'enraged' ? movement.enragedTicks : null;
        const ticks = Number(stateTicks ?? legacyStateTicks ?? movement.ticks);
        if (!(ticks > 0)) return null;
        return {
            kind: String(movement.kind || pattern.id || 'movement'),
            ticks: Math.max(1, Math.round(ticks)),
            untargetable: Boolean(movement.untargetable)
        };
    }

    static phasedFollowUp(monsterId, monsterState = 'normal', phaseState = null) {
        const source = phaseState?.sourcePattern || {};
        const followUp = source.followUp;
        if (!followUp) return null;
        const authoredWindup = typeof followUp.windupTicks === 'object'
            ? followUp.windupTicks[monsterState] ?? followUp.windupTicks.normal
            : followUp.windupTicks;
        return {
            ...source,
            ...followUp,
            id: followUp.id || `${monsterId}.${followUp.idSuffix || 'follow_up'}`,
            windupTicks: Math.max(1, Number(authoredWindup || 1)),
            tags: [...new Set([...(followUp.tags || []), 'locked-target'])],
            phase: source.phase || null
        };
    }

    static orderedTargets(targetable = []) {
        return [...targetable].sort((a, b) => Number(a.index) - Number(b.index));
    }

    static chargeMode(pattern = {}) {
        if (pattern.chargeMode === 'wide' || pattern.tags?.includes('wide-charge')) return 'wide';
        return 'single';
    }

    static laneTargets(targetable, count, random = Math.random, reverseChance = false) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const take = Math.max(1, Math.min(Number(count || 1), ordered.length));
        const anchor = Math.min(ordered.length - 1, Math.floor(random() * ordered.length));
        const start = Math.max(0, Math.min(ordered.length - take, anchor - Math.floor((take - 1) / 2)));
        const lane = ordered.slice(start, start + take);
        return reverseChance && random() >= .5 ? lane.reverse() : lane;
    }

    static adjacentLaneTargets(targetable, count, random = Math.random) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const anchor = ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
        if (Number(count || 1) < 2) return [anchor];
        const adjacent = ordered.filter(target =>
            target.index !== anchor.index && Math.abs(Number(target.index) - Number(anchor.index)) === 1);
        if (!adjacent.length) return [anchor];
        const neighbour = adjacent[Math.min(adjacent.length - 1, Math.floor(random() * adjacent.length))];
        return [anchor, neighbour];
    }

    static primaryAdjacentBothTargets(targetable, count, random = Math.random) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const anchor = ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
        const neighbours = ordered.filter(target =>
            target.index !== anchor.index && Math.abs(Number(target.index) - Number(anchor.index)) === 1);
        return [anchor, ...neighbours].slice(0, Math.max(1, Number(count || 1)));
    }

    static returnAdjacentPasses(targetable, totalTargets, random = Math.random) {
        const lane = this.adjacentLaneTargets(
            targetable,
            Math.min(2, Math.max(1, Number(totalTargets || 1))),
            random
        );
        if (!lane.length) return [[], []];
        return lane.length === 1 ? [[lane[0]], [lane[0]]] : [[lane[0]], [lane[1]]];
    }

    static tripleLanePasses(targetable, random = Math.random) {
        const lane = this.laneTargets(targetable, Math.min(3, targetable.length), random, false);
        if (!lane.length) return [[], [], []];
        while (lane.length < 3) lane.push(lane[lane.length - 1]);
        return lane.slice(0, 3).map(target => [target]);
    }

    static tripleAdjacentPasses(targetable, random = Math.random) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [[], [], []];
        return Array.from({ length: 3 }, () => {
            const anchor = ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
            const pass = [anchor];
            const adjacent = ordered.filter(target =>
                target.index !== anchor.index
                && Math.abs(Number(target.index) - Number(anchor.index)) === 1);
            if (adjacent.length && random() < .5) {
                pass.push(adjacent[Math.min(adjacent.length - 1, Math.floor(random() * adjacent.length))]);
            }
            return pass;
        });
    }

    static centerLeftRightSequence(targetable, random = Math.random) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const anchor = ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
        const byIndex = new Map(ordered.map(target => [Number(target.index), target]));
        return [
            [anchor],
            [byIndex.get(Number(anchor.index) - 1)].filter(Boolean),
            [byIndex.get(Number(anchor.index) + 1)].filter(Boolean)
        ];
    }

    static independentTargetPasses(targetable, passCount = 2, random = Math.random) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        return Array.from({ length: Math.max(1, Number(passCount || 1)) }, () => [
            ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))]
        ]);
    }

    static resolveTargeting({
        targetable = [],
        count = 1,
        passCount = 2,
        random = Math.random,
        mode = '',
        defaultTargets = []
    } = {}) {
        if (mode === 'adjacent-lane') {
            return { targets: this.adjacentLaneTargets(targetable, count, random), runtime: {} };
        }
        if (mode === 'primary-adjacent-both') {
            return { targets: this.primaryAdjacentBothTargets(targetable, count, random), runtime: {} };
        }
        if (mode === 'lane') {
            return { targets: this.laneTargets(targetable, count, random, false), runtime: {} };
        }
        if (mode === 'screen-sweep') {
            const leftToRight = random() < .5;
            const targets = this.orderedTargets(targetable);
            if (!leftToRight) targets.reverse();
            return {
                targets,
                runtime: {
                    runtimeSweepDirection: leftToRight ? 'left-to-right' : 'right-to-left'
                }
            };
        }
        if (mode === 'bazel-carpet') {
            const leftToRight = random() < .5;
            const divePool = targetable.length ? targetable : defaultTargets;
            const diveTarget = divePool.length
                ? divePool[Math.floor(random() * divePool.length)]
                : null;
            return {
                targets: [...defaultTargets],
                runtime: {
                    runtimeSweepDirection: leftToRight ? 'left-to-right' : 'right-to-left',
                    runtimeDiveTargetIndex: diveTarget?.index
                }
            };
        }
        if (mode === 'return-adjacent-passes') {
            const passes = this.returnAdjacentPasses(targetable, count, random);
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeChargePasses: passes.map(pass => pass.map(target => target.index)),
                    runtimeChargeAnchors: passes.map(pass => pass[0]?.index).filter(Number.isInteger),
                    runtimeChargePassSizes: passes.map(pass => pass.length)
                }
            };
        }
        if (mode === 'triple-lane-passes') {
            const passes = this.tripleLanePasses(targetable, random);
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeChargePasses: passes.map(pass => pass.map(target => target.index)),
                    runtimeChargeAnchors: passes.map(pass => pass[0]?.index).filter(Number.isInteger),
                    runtimeChargePassSizes: passes.map(pass => pass.length)
                }
            };
        }
        if (mode === 'triple-adjacent-passes') {
            const passes = this.tripleAdjacentPasses(targetable, random);
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeChargePasses: passes.map(pass => pass.map(target => target.index)),
                    runtimeChargeAnchors: passes.map(pass => pass[0]?.index).filter(Number.isInteger),
                    runtimeChargePassSizes: passes.map(pass => pass.length)
                }
            };
        }
        if (mode === 'center-left-right') {
            const passes = this.centerLeftRightSequence(targetable, random);
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeImpactTargetSequence: passes.map(pass => pass.map(target => target.index)),
                    runtimeImpactAllowEmptySequence: true
                }
            };
        }
        if (mode === 'independent-passes') {
            const passes = this.independentTargetPasses(
                targetable,
                passCount,
                random
            );
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeImpactTargetSequence: passes.map(pass => pass.map(target => target.index))
                }
            };
        }
        return { targets: [...defaultTargets], runtime: {} };
    }

    static repeatTargets(targets, pattern = {}, monsterState = 'normal') {
        const authored = pattern.repeatByState?.[monsterState];
        const legacy = monsterState === 'enraged' ? pattern.repeatWhenEnraged : null;
        const repeatCount = Math.max(1, Number(authored ?? legacy ?? 1));
        return Array.from({ length: repeatCount }, () => [...targets]).flat();
    }

    static isPartBroken(partState = [], partKind) {
        const expected = String(partKind || '').toLowerCase();
        return partState.some(part =>
            String(part?.kind || part?.id || '').toLowerCase() === expected
            && (part.broken || part.severed));
    }

    static allPartsBroken(partState = [], partKinds = []) {
        return partKinds.length > 0
            && partKinds.every(part => this.isPartBroken(partState, part));
    }

    static effectiveTargetCap(partState, pattern = {}) {
        let cap = Number(pattern.maxTargets || 1);
        Object.entries(pattern.brokenPartTargetCaps || {}).forEach(([part, brokenCap]) => {
            if (this.isPartBroken(partState, part)) cap = Math.min(cap, Number(brokenCap || cap));
        });
        return Math.max(1, cap);
    }

    static brokenPartDamageModifier(partState, pattern = {}) {
        return Object.entries(pattern.brokenPartDamageModifiers || {}).reduce((modifier, [part, rate]) =>
            this.isPartBroken(partState, part) ? modifier * Number(rate || 1) : modifier, 1);
    }

    static brokenPartAccuracyModifier(partState, pattern = {}) {
        return Object.entries(pattern.brokenPartAccuracyModifiers || {}).reduce((modifier, [part, rate]) =>
            this.isPartBroken(partState, part) ? modifier * Number(rate || 1) : modifier, 1);
    }

    static statusAllowed(partState, pattern = {}) {
        return !(pattern.statusBlockedWhenBroken || [])
            .some(part => this.isPartBroken(partState, part));
    }

    static requiresDelayedImpact(pattern = {}) {
        if (pattern.runtimeImpactCommit) return false;
        if (pattern.impact?.disabled || pattern.tags?.includes('no-impact')) return false;
        if (pattern.tags?.includes('burrow-enter')) return false;
        const type = String(pattern.type || '').toLowerCase();
        const damageRatio = Number(pattern.damageRatio || 0);
        return damageRatio > 0
            || ['roar', 'tremor', 'wind', 'ultimate', 'physical', 'charge',
                'projectile', 'beam', 'area', 'gas', 'field', 'elemental', 'hybrid']
                .includes(type)
            || Boolean(pattern.impact)
            || pattern.tags?.includes('delayed-impact');
    }

    static impactDelayTicks(pattern = {}, monsterState = 'normal') {
        const authoredTicks = Number(pattern.impact?.delayTicks ?? pattern.impactDelayTicks ?? 0);
        if (authoredTicks > 0) return Math.max(1, Math.round(authoredTicks));
        const visualRatio = Number(pattern.impact?.visualRatio);
        const authoredVisualMs = Number(pattern.animationDurationMs || 0);
        if (visualRatio > 0 && authoredVisualMs > 0) {
            const timing = typeof HuntAtbConfig !== 'undefined'
                ? HuntAtbConfig
                : (typeof require === 'function' ? require('./HuntAtbConfig.js') : null);
            const scaledVisualMs = timing?.scaleVisualDurationMs
                ? timing.scaleVisualDurationMs(authoredVisualMs)
                : authoredVisualMs;
            const ticksPerSecond = Number(timing?.TICKS_PER_SECOND || 10);
            return Math.max(1, Math.round(
                scaledVisualMs / 1000 * ticksPerSecond
                * Math.max(0.01, Math.min(1, visualRatio))
            ));
        }
        const movement = this.movement(pattern, monsterState);
        const type = String(pattern.type || '').toLowerCase();
        const defaultRatio = ['projectile', 'charge'].includes(type) ? .58
            : ['beam', 'area', 'gas', 'field'].includes(type) ? .48
                : .52;
        const ratio = Number(pattern.impact?.delayRatio ?? pattern.impactDelayRatio ?? defaultRatio);
        const authoredActionTicks = Number(pattern.activeTicks || pattern.motionTicks
            || pattern.recoveryTicks || pattern.recovery || 0);
        const baseTicks = Number(movement?.ticks || authoredActionTicks || 8);
        return Math.max(1, Math.round(baseTicks * Math.max(0.05, Math.min(1, ratio))));
    }

    static impactTimeline(pattern = {}, monsterState = 'normal') {
        const stateTimeline = pattern.impactTimelineByState?.[monsterState];
        const authored = Array.isArray(stateTimeline)
            ? stateTimeline
            : (Array.isArray(pattern.impactTimeline) ? pattern.impactTimeline : null);
        if (authored?.length) {
            return authored.map((entry, index) => {
                const source = typeof entry === 'number' ? { atTicks: entry } : (entry || {});
                return {
                    index,
                    atTicks: Math.max(1, Math.round(Number(
                        source.atTicks ?? source.delayTicks ?? source.tick ?? 1
                    ))),
                    targetIndices: Array.isArray(source.targetIndices)
                        ? source.targetIndices.filter(Number.isInteger)
                        : null,
                    targetMode: String(source.targetMode || ''),
                    targetShape: String(source.targetShape || ''),
                    damageScale: Number(source.damageScale ?? 1),
                    secondaryInterference: source.secondaryInterference || null,
                    audioCue: source.audioCue || null,
                    eventKind: source.eventKind || null,
                    defenseMode: source.defenseMode || null,
                    sourcePart: source.sourcePart || null,
                    ignoreBrokenPartDamage: source.ignoreBrokenPartDamage === true,
                    suppressStatus: source.suppressStatus === true,
                    displayName: source.displayName || null,
                    animationProfile: source.animationProfile || null,
                    animationDurationMs: Number(source.animationDurationMs || 0) || null,
                    animationImpactRatio: Number(source.animationImpactRatio || 0) || null
                };
            }).sort((a, b) => a.atTicks - b.atTicks);
        }

        const firstImpact = this.impactDelayTicks(pattern, monsterState);
        const authoredRepeat = pattern.repeatByState?.[monsterState]
            ?? (monsterState === 'enraged' ? pattern.repeatWhenEnraged : null);
        const chargePasses = Array.isArray(pattern.runtimeChargePasses)
            ? pattern.runtimeChargePasses
            : null;
        const repeatCount = Math.max(1, Number(chargePasses?.length || authoredRepeat || 1));
        const passRatios = Array.isArray(pattern.impact?.passRatios)
            ? pattern.impact.passRatios
            : null;
        if (chargePasses?.length && passRatios?.length) {
            const movementTicks = Math.max(1, Number(
                this.movement(pattern, monsterState)?.ticks || pattern.activeTicks || 8
            ));
            return chargePasses.map((pass, index) => ({
                index,
                atTicks: Math.max(1, Math.round(
                    movementTicks * Math.max(0.01, Math.min(1, Number(passRatios[index] ?? passRatios.at(-1))))
                )),
                targetIndices: pass.filter(Number.isInteger),
                damageScale: 1
            })).sort((a, b) => a.atTicks - b.atTicks);
        }
        const interval = Math.max(1, Math.round(Number(
            pattern.impact?.repeatIntervalTicks ?? pattern.repeatIntervalTicks ?? 4
        )));
        return Array.from({ length: repeatCount }, (_, index) => ({
            index,
            atTicks: firstImpact + (index * interval),
            targetIndices: chargePasses?.[index]?.filter(Number.isInteger) || null,
            damageScale: 1
        }));
    }

    static impactSurvivesInterruption(pattern = {}) {
        if (pattern.impact?.survivesInterruption != null) {
            return Boolean(pattern.impact.survivesInterruption);
        }
        const delivery = String(pattern.delivery || pattern.type || '').toLowerCase();
        return ['projectile', 'field', 'gas'].includes(delivery);
    }

    static shouldTriggerWhiffReaction(partState, pattern = {}, attackResults = []) {
        const policy = pattern.whiffReaction;
        if (!policy) return false;
        if (policy.pass === 'last'
            && pattern.runtimeImpactTimelineEvent
            && pattern.runtimeImpactTimelineFinal !== true) return false;
        if (this.allPartsBroken(partState, policy.disabledWhenAllBroken || [])) return false;
        const passSizes = pattern.runtimeChargePassSizes || [];
        let inspected = attackResults;
        if (policy.pass === 'last' && passSizes.length) {
            const lastSize = Math.max(0, Number(passSizes[passSizes.length - 1] || 0));
            inspected = attackResults.slice(Math.max(0, attackResults.length - lastSize));
        }
        return inspected.length > 0
            && inspected.every(result => result.result === (policy.result || 'dodge'));
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterActionPolicy;
if (typeof globalThis !== 'undefined') globalThis.HuntMonsterActionPolicy = HuntMonsterActionPolicy;
