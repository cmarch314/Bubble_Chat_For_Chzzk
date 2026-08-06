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

    /**
     * 인접한 두 헌터를 한 쌍으로 묶어 패스를 만든다. 생존자 레인 순서에서
     * (1,2) (2,3) (3,4) 같은 인접 쌍을 뽑아 서로 다른 쌍을 우선 고르고,
     * 쌍이 모자라면 남은 쌍을 재사용한다. 생존자가 한 명뿐이면 단독 패스가 된다.
     */
    static adjacentPairPivotPasses(targetable, passCount = 2, random = Math.random, anchorIndex = null) {
        const lanes = [...targetable].sort((a, b) => Number(a.index) - Number(b.index));
        const passes = Math.max(1, Number(passCount) || 1);
        if (lanes.length <= 1) {
            return Array.from({ length: passes }, () => lanes.slice(0, 1));
        }
        const pairs = lanes.slice(0, -1).map((lane, i) => [lane, lanes[i + 1]]);
        // 지정된 표적을 품은 쌍부터 시작한다. 앵커를 무시하면 1번을 노렸는데 3·4번이
        // 맞는 문제가 생긴다. 이어지는 패스는 한 명을 공유하는 옆 쌍으로 넘어간다.
        let start = Number.isInteger(anchorIndex)
            ? pairs.findIndex(pair => pair.some(lane => Number(lane.index) === Number(anchorIndex)))
            : -1;
        if (start < 0) start = Math.floor(random() * pairs.length) % pairs.length;
        return Array.from({ length: passes }, (_, i) => pairs[(start + i) % pairs.length]);
    }

    // distinct를 켜면 패스마다 서로 다른 헌터를 뽑는다(비복원 추출). 3연 급습처럼
    // "세 번 다 다른 대상을 친다"가 연출의 핵심인 패턴용이다. 표적 수가 패스 수보다
    // 적으면 풀을 다시 채우되 직전 대상은 제외해, 같은 헌터를 연달아 치지 않는다.
    static independentTargetPasses(targetable, passCount = 2, random = Math.random, distinct = false) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const passes = Math.max(1, Number(passCount || 1));
        if (!distinct) {
            return Array.from({ length: passes }, () => [
                ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))]
            ]);
        }
        const result = [];
        let pool = [];
        let last = null;
        for (let pass = 0; pass < passes; pass += 1) {
            if (!pool.length) {
                pool = ordered.filter(target => ordered.length === 1 || target !== last);
            }
            const pick = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
            pool = pool.filter(target => target !== pick);
            last = pick;
            result.push([pick]);
        }
        return result;
    }

    static leftRightHalfPasses(targetable, count = 4, random = Math.random) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [[], []];
        if (Number(count || 1) <= 1) {
            const target = ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
            return [[target], []];
        }
        return [ordered.slice(0, 2), ordered.slice(2, 4)];
    }

    static resolveTargeting({
        targetable = [],
        count = 1,
        passCount = 2,
        random = Math.random,
        mode = '',
        defaultTargets = [],
        // 회전 축처럼 "지정한 헌터"가 결과를 좌우하는 모드용. defaultTargets[0]은
        // 호출부에 따라 중앙 정렬된 레인 창의 시작점일 수 있어 표적과 다르다.
        primaryIndex = null,
        // independent-passes에서 패스마다 다른 헌터를 뽑을지 여부.
        distinctPasses = false
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
                random,
                distinctPasses
            );
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeImpactTargetSequence: passes.map(pass => pass.map(target => target.index))
                }
            };
        }
        // 회전 공격이 헌터 한 명을 노리는 대신, 인접한 두 명 사이를 축으로 삼아
        // 그 둘을 함께 훑는다. 타격 범위를 사후 검증하는 대신 축 위치를 미리 정하는
        // 방식이라, 패스마다 "몇 번과 몇 번을 함께 치는지"가 확정된다.
        if (mode === 'adjacent-pair-pivot') {
            const passes = this.adjacentPairPivotPasses(
                targetable, passCount, random,
                Number.isInteger(primaryIndex) ? primaryIndex : defaultTargets[0]?.index);
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeImpactTargetSequence: passes.map(pass => pass.map(target => target.index)),
                    runtimePivotPairs: passes.map(pass => pass.map(target => target.index)),
                    runtimeImpactAllowEmptySequence: true
                }
            };
        }
        if (mode === 'left-right-halves') {
            const passes = this.leftRightHalfPasses(targetable, count, random);
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeImpactTargetSequence: passes.map(pass => pass.map(target => target.index)),
                    runtimeImpactAllowEmptySequence: true
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
