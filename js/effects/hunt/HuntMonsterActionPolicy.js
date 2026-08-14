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

    // `pair:*` is a placement vocabulary as well as a judgment vocabulary.
    // A visual-only pair anchor must still receive one authored adjacent lane;
    // otherwise the anchor falls back to the union of every hit recipient and
    // silently becomes the fixed middle (H2-H3) point.
    static usesPairAnchor(pattern = {}) {
        const beats = Array.isArray(pattern.motionGraph?.beats)
            ? pattern.motionGraph.beats : (Array.isArray(pattern.motion) ? pattern.motion : []);
        return beats.some(beat => ['to', 'at', 'face', 'align'].some(key =>
            /(?:^|[.:])pair(?::|\b)/.test(String(beat?.[key] || ''))
        ));
    }

    static randomAdjacentPair(targetable = [], random = Math.random) {
        const ordered = this.orderedTargets(targetable);
        const pairs = ordered.slice(0, -1).map((target, index) => [target, ordered[index + 1]])
            .filter(([left, right]) => Number(right.index) - Number(left.index) === 1);
        if (!pairs.length) return ordered.slice(0, 2);
        return pairs[Math.min(pairs.length - 1, Math.floor(Math.max(0, Math.min(.999999,
            Number(random()) || 0)) * pairs.length))];
    }

    static judgmentTargetMode(target = '') {
        return ({
            primary: 'judgment-primary',
            left: 'judgment-left',
            right: 'judgment-right',
            pair: 'runtime-pair',
            'pair-left': 'runtime-pair-left',
            'pair-right': 'runtime-pair-right',
            'primary-adjacent': 'judgment-primary-adjacent',
            all: 'judgment-all'
        })[String(target)] || 'judgment-primary';
    }

    static minimumImpactTargetCount(pattern = {}) {
        const modes = (Array.isArray(pattern.impactTimeline) ? pattern.impactTimeline : [])
            .map(event => String(event?.targetMode || event?.targetShape || ''));
        const motionTargets = (Array.isArray(pattern.motion) ? pattern.motion : [])
            .flatMap(beat => Array.isArray(beat?.judgments) ? beat.judgments : [])
            .filter(judgment => judgment?.kind === 'damage')
            .map(judgment => this.judgmentTargetMode(judgment.target));
        return [...modes, ...motionTargets].some(mode =>
            ['runtime-pair', 'runtime-pair-left', 'runtime-pair-right'].includes(mode)) ? 2 : 1;
    }

    static rollTargetCount(pattern = {}, availableCount = 0, random = Math.random, targetCap = null) {
        const available = Math.max(0, Math.floor(Number(availableCount) || 0));
        if (!available) return 0;
        const hasTargetCap = targetCap !== null && targetCap !== undefined && targetCap !== ''
            && Number.isFinite(Number(targetCap));
        const cap = Math.max(1, Math.min(available,
            hasTargetCap ? Math.floor(Number(targetCap)) : available));
        const required = Math.min(cap, this.minimumImpactTargetCount(pattern));
        const maximum = Math.min(cap, Math.max(required,
            Math.floor(Number(pattern.maxTargets || pattern.minTargets || 1))));
        const minimum = Math.min(maximum, Math.max(required,
            Math.floor(Number(pattern.minTargets || 1))));
        return minimum + Math.floor(Math.max(0, Math.min(.999999, Number(random()) || 0))
            * (maximum - minimum + 1));
    }

    static seededRandom(seed = 1) {
        let state = Math.max(1, Math.floor(Number(seed) || 1)) >>> 0;
        return () => {
            state += 0x6D2B79F5;
            let value = state;
            value = Math.imul(value ^ value >>> 15, value | 1);
            value ^= value + Math.imul(value ^ value >>> 7, value | 61);
            return ((value ^ value >>> 14) >>> 0) / 4294967296;
        };
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

    static adjacentLaneTargets(targetable, count, random = Math.random, primaryIndex = null) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const prepared = Number.isInteger(Number(primaryIndex))
            ? ordered.find(target => Number(target.index) === Number(primaryIndex))
            : null;
        const anchor = prepared
            || ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
        if (Number(count || 1) < 2) return [anchor];
        const adjacent = ordered.filter(target =>
            target.index !== anchor.index && Math.abs(Number(target.index) - Number(anchor.index)) === 1);
        if (!adjacent.length) return [anchor];
        const neighbour = adjacent[Math.min(adjacent.length - 1, Math.floor(random() * adjacent.length))];
        return [anchor, neighbour];
    }

    static primaryAdjacentBothTargets(targetable, count, random = Math.random, primaryIndex = null) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const prepared = Number.isInteger(Number(primaryIndex))
            ? ordered.find(target => Number(target.index) === Number(primaryIndex))
            : null;
        const anchor = prepared
            || ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
        const neighbours = ordered.filter(target =>
            target.index !== anchor.index && Math.abs(Number(target.index) - Number(anchor.index)) === 1);
        return [anchor, ...neighbours].slice(0, Math.max(1, Number(count || 1)));
    }

    static returnAdjacentPasses(targetable, totalTargets, random = Math.random, primaryIndex = null) {
        const ordered = this.orderedTargets(targetable);
        const primary = primaryIndex !== null && primaryIndex !== '' && Number.isInteger(Number(primaryIndex))
            ? ordered.find(target => Number(target.index) === Number(primaryIndex))
            : null;
        const neighbours = primary
            ? ordered.filter(target => Math.abs(Number(target.index) - Number(primary.index)) === 1)
            : [];
        const partner = neighbours.length
            ? neighbours[Math.min(neighbours.length - 1, Math.floor(random() * neighbours.length))]
            : null;
        const lane = (primary && partner
            ? [primary, partner]
            : this.adjacentLaneTargets(
                ordered,
                Math.min(2, Math.max(1, Number(totalTargets || 1))),
                random
            )).sort((left, right) => Number(left.index) - Number(right.index));
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

    static adjacentPairSequentialPasses(targetable, random = Math.random, anchorIndex = null) {
        const lanes = [...targetable].sort((a, b) => Number(a.index) - Number(b.index));
        if (!lanes.length) return [];
        if (lanes.length === 1) return [[lanes[0]], [lanes[0]]];
        const pairs = lanes.slice(0, -1)
            .map((lane, index) => [lane, lanes[index + 1]])
            .filter(pair => Number(pair[1].index) - Number(pair[0].index) === 1);
        if (!pairs.length) return [[lanes[0]], [lanes[0]]];
        const anchored = Number.isInteger(anchorIndex)
            ? pairs.filter(pair => pair.some(lane => Number(lane.index) === Number(anchorIndex)))
            : [];
        const candidates = anchored.length ? anchored : pairs;
        const pair = candidates[Math.min(candidates.length - 1,
            Math.floor(random() * candidates.length))];
        return pair.map(target => [target]);
    }

    /**
     * 주 표적 위에 자리를 잡고 좌우로 한 번씩 훑는 회전용. 1패스는 주 표적과
     * 왼쪽 이웃, 2패스는 주 표적과 오른쪽 이웃이다. 주 표적은 두 패스 모두에
     * 들어가므로, 회전 축이 바뀌어도 맞는 사람이 이어진다.
     * 한쪽 끝(1번이나 4번)이면 그쪽 이웃이 없으므로 그 패스는 주 표적만 맞는다.
     */
    static primaryFlankPasses(targetable, random = Math.random, primaryIndex = null, passCount = 2) {
        const ordered = this.orderedTargets(targetable);
        if (!ordered.length) return [];
        const anchor = ordered.find(target => Number(target.index) === Number(primaryIndex))
            || ordered[Math.min(ordered.length - 1, Math.floor(random() * ordered.length))];
        const byIndex = new Map(ordered.map(target => [Number(target.index), target]));
        const left = byIndex.get(Number(anchor.index) - 1);
        const right = byIndex.get(Number(anchor.index) + 1);
        if (Number(passCount) === 1) {
            // 1회전짜리는 한 방향만 고른다. 이웃이 한쪽에만 있으면 그쪽으로 돌아야
            // 회전이 헛돌지 않는다. 양쪽 다 있으면 무작위다.
            const side = left && right ? (random() < .5 ? left : right) : (left || right);
            return [[anchor, side].filter(Boolean)];
        }
        return [
            [anchor, left].filter(Boolean),
            [anchor, right].filter(Boolean)
        ];
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
            return {
                targets: this.adjacentLaneTargets(targetable, count, random, primaryIndex),
                runtime: {}
            };
        }
        if (mode === 'primary-adjacent-both') {
            return {
                targets: this.primaryAdjacentBothTargets(targetable, count, random, primaryIndex),
                runtime: {}
            };
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
            const passes = this.returnAdjacentPasses(targetable, count, random, primaryIndex);
            const tailPair = [...new Map(passes.flat()
                .filter(target => Number.isInteger(target?.index))
                .map(target => [target.index, target])).values()];
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeChargePasses: passes.map(pass => pass.map(target => target.index)),
                    runtimeChargeAnchors: passes.map(pass => pass[0]?.index).filter(Number.isInteger),
                    runtimeChargePassSizes: passes.map(pass => pass.length),
                    runtimePairTargets: tailPair.map(target => target.index).sort((left, right) => left - right),
                    runtimeTailCrossTargets: tailPair.map(target => target.index).sort((left, right) => left - right)
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
        // 주 표적 바로 위에 자리 잡고, 좌회전으로 왼쪽까지 · 우회전으로 오른쪽까지
        // 훑는다. 축이 바뀌어도 주 표적은 두 번 다 맞는다.
        if (mode === 'primary-flank-passes') {
            const passes = this.primaryFlankPasses(targetable, random,
                Number.isInteger(primaryIndex) ? primaryIndex : defaultTargets[0]?.index,
                passCount);
            const anchorIndex = passes[0]?.[0]?.index ?? null;
            // 1회전짜리는 고른 이웃이 어느 쪽인지를 회전 방향으로 넘긴다.
            // +1이면 왼쪽 이웃까지 훑는 시계 회전, -1이면 오른쪽 이웃까지 반시계.
            const companion = passes[0]?.[1]?.index;
            const spinDirection = Number.isInteger(companion) && Number.isInteger(anchorIndex)
                ? (Number(companion) < Number(anchorIndex) ? 1 : -1)
                : 1;
            return {
                targets: passes.flat(),
                runtime: {
                    runtimeImpactTargetSequence: passes.map(pass => pass.map(target => target.index)),
                    runtimeSpinPrimaryIndex: anchorIndex,
                    runtimeSpinDirection: spinDirection
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
        if (mode === 'adjacent-pair-sequential') {
            const passes = this.adjacentPairSequentialPasses(
                targetable, random,
                Number.isInteger(primaryIndex) ? primaryIndex : defaultTargets[0]?.index);
            const pair = passes.map(pass => pass[0]).filter(Boolean);
            return {
                targets: pair,
                runtime: {
                    runtimeImpactTargetSequence: passes.map(pass => pass.map(target => target.index)),
                    runtimePivotPairs: [pair.map(target => target.index)],
                    runtimePairTargets: pair.map(target => target.index)
                        .filter(Number.isInteger).sort((left, right) => left - right),
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
        if (pattern.runtimeImpactCommit || pattern.runtimeJudgment) return false;
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
        // An interference BEAT's draggable judgment marker is its gameplay
        // commit. Falling back to a percentage of the full animation made the
        // visible marker and the actual reaction disagree.
        const interferenceKind = String(pattern.interference?.kind || '')
            .replace(/-(?:small|large)$/, '');
        if (interferenceKind && Array.isArray(pattern.motion)) {
            let elapsed = 0;
            for (const beat of pattern.motion) {
                const offset = Number(beat?.judgmentOffsets?.[interferenceKind]);
                if (Number.isFinite(offset)) {
                    return Math.max(1, Math.round(elapsed + Math.max(0, offset)));
                }
                elapsed += Math.max(1, Number(beat?.ticks) || 1);
            }
        }
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
            const compiledTicks = pattern.beatV2
                && pattern.runtimeJudgmentGroups === true
                && (pattern.beatV2Enabled === true || pattern.beatV2Approved === true)
                ? this.#beatV2GameplayTicks(pattern.beatV2)
                : [];
            return authored.map((entry, index) => {
                const source = typeof entry === 'number' ? { atTicks: entry } : (entry || {});
                return {
                    index,
                    atTicks: Math.max(1, Math.round(Number(
                        compiledTicks[index] ?? source.atTicks ?? source.delayTicks ?? source.tick ?? 1
                    ))),
                    launchAtTicks: Number.isFinite(Number(source.launchAtTicks))
                        ? Math.max(0, Math.round(Number(source.launchAtTicks))) : null,
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

    static resolveTargetScenario({
        pattern = {}, monsterState = 'normal', targetable = [], count = 1,
        passCount = 2, random = Math.random, mode = '', defaultTargets = [],
        primaryIndex = null, distinctPasses = false, forcedTargetIndices = null,
        forcedImpactTargets = null
    } = {}) {
        const byIndex = new Map(targetable.filter(target => Number.isInteger(target?.index))
            .map(target => [target.index, target]));
        const warnings = [];
        const forced = Array.isArray(forcedTargetIndices)
            ? [...new Set(forcedTargetIndices.filter(Number.isInteger))] : null;
        forced?.filter(index => !byIndex.has(index))
            .forEach(index => warnings.push(`target-unavailable:${index}`));
        const resolved = this.resolveTargeting({ targetable, count, passCount, random, mode,
            defaultTargets, primaryIndex, distinctPasses });
        const targets = forced ? forced.map(index => byIndex.get(index)).filter(Boolean) : resolved.targets;
        const runtime = { ...resolved.runtime };
        // Placement-only two-hunter presets select their own lane once per
        // action. Keep that lane separate from damage recipients: an area
        // action can still hit all hunters while moving through 1-2, 2-3, or
        // 3-4 instead of always anchoring at the all-target midpoint.
        if (!Array.isArray(runtime.runtimePairTargets) && this.usesPairAnchor(pattern)) {
            runtime.runtimePairTargets = this.randomAdjacentPair(targetable, random)
                .map(target => target.index).filter(Number.isInteger);
        }
        const forcedByImpact = new Map((forcedImpactTargets || [])
            .filter(item => Number.isInteger(item?.impactIndex))
            .map(item => [item.impactIndex,
                [...new Set((item.targetIndices || []).filter(Number.isInteger))]]));
        const sequence = Array.isArray(runtime.runtimeImpactTargetSequence)
            ? runtime.runtimeImpactTargetSequence : [];
        const fallbackIndices = targets.map(target => target.index);
        const impactTimeline = [];
        this.impactTimeline({ ...pattern, ...runtime }, monsterState).forEach((event, index) => {
            const previous = impactTimeline[index - 1]?.targetIndices || [];
            const chargePassMatch = String(event.targetMode || '').match(/^charge-pass-(\d+)$/);
            const chargePassTargets = chargePassMatch && Array.isArray(runtime.runtimeChargePasses)
                ? runtime.runtimeChargePasses[Math.max(0, Number(chargePassMatch[1]) - 1)]
                : null;
            let targetIndices = forcedByImpact.has(index) ? forcedByImpact.get(index)
                : Array.isArray(event.targetIndices) && event.targetIndices.length ? event.targetIndices
                    : Array.isArray(chargePassTargets) && chargePassTargets.length ? chargePassTargets
                    : ['runtime-pair', 'runtime-pair-left', 'runtime-pair-right',
                        'runtime-tail-pair', 'runtime-tail-left', 'runtime-tail-right'].includes(event.targetMode)
                        && Array.isArray(runtime.runtimePairTargets || runtime.runtimeTailCrossTargets)
                        ? ['runtime-pair', 'runtime-tail-pair'].includes(event.targetMode)
                            ? (runtime.runtimePairTargets || runtime.runtimeTailCrossTargets)
                            : (() => {
                                const orderedTailTargets = [...(runtime.runtimePairTargets || runtime.runtimeTailCrossTargets)]
                                    .filter(Number.isInteger).sort((left, right) => left - right);
                                if (!orderedTailTargets.length) return [];
                                return [['runtime-pair-right', 'runtime-tail-right'].includes(event.targetMode)
                                    ? orderedTailTargets.at(-1) : orderedTailTargets[0]];
                            })()
                    : event.targetMode === 'all-prepared' ? fallbackIndices
                    : event.targetMode === 'judgment-all' ? [...byIndex.keys()]
                    : event.targetMode === 'judgment-primary' ? [primaryIndex ?? fallbackIndices[0]].filter(Number.isInteger)
                    : event.targetMode === 'judgment-left' ? [Number(primaryIndex ?? fallbackIndices[0]) - 1].filter(index => byIndex.has(index))
                    : event.targetMode === 'judgment-right' ? [Number(primaryIndex ?? fallbackIndices[0]) + 1].filter(index => byIndex.has(index))
                    : event.targetMode === 'judgment-primary-adjacent' ? [-1, 0, 1]
                        .map(delta => Number(primaryIndex ?? fallbackIndices[0]) + delta).filter(index => byIndex.has(index))
                    : event.targetMode === 'repeat-previous' ? previous
                        : event.targetMode === 'runtime-dive' && Number.isInteger(runtime.runtimeDiveTargetIndex)
                            ? [runtime.runtimeDiveTargetIndex]
                            : event.targetMode === 'random-live' ? null
                                : Array.isArray(sequence[index]) && sequence[index].length ? sequence[index]
                                    : event.targetMode === 'sequential' && fallbackIndices.length
                                        ? [fallbackIndices[index % fallbackIndices.length]] : fallbackIndices;
            if (Array.isArray(targetIndices)) {
                targetIndices = [...new Set(targetIndices.filter(Number.isInteger))];
                targetIndices.filter(targetIndex => !byIndex.has(targetIndex))
                    .forEach(targetIndex => warnings.push(`impact-${index}-target-unavailable:${targetIndex}`));
                targetIndices = targetIndices.filter(targetIndex => byIndex.has(targetIndex));
            }
            impactTimeline.push({ ...event, targetIndices });
        });
        const resolvedImpactIndices = [...new Set(impactTimeline.flatMap(event => event.targetIndices || []))];
        // random-live deliberately leaves an impact unresolved until impact time. Keep the
        // prepared target set alive so the turn is not cancelled before that live re-roll.
        const targetIndices = resolvedImpactIndices.length ? resolvedImpactIndices : fallbackIndices;
        const resolvedPrimary = Number.isInteger(primaryIndex) && byIndex.has(primaryIndex)
            ? primaryIndex : targetIndices[0] ?? targets[0]?.index ?? null;
        return Object.freeze({
            primaryTargetIndex: resolvedPrimary,
            targetIndices,
            targets: targetIndices.map(index => byIndex.get(index)).filter(Boolean),
            runtime,
            impactTimeline,
            warnings: [...new Set(warnings)]
        });
    }

    static #beatV2GameplayTicks(compiledAction = {}) {
        const grouped = new Map();
        for (const event of compiledAction.events || []) {
            if (!['damage', 'roar', 'tremor', 'wind'].includes(event.kind)) continue;
            const group = String(event.group || event.id);
            grouped.set(group, Math.min(grouped.get(group) ?? Infinity, Number(event.atTicks)));
        }
        return [...grouped.values()].filter(Number.isFinite).sort((left, right) => left - right);
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
            && (pattern.runtimeImpactTimelineEvent || pattern.runtimeJudgment)
            && (pattern.runtimeJudgment?.timelineFinal ?? pattern.runtimeImpactTimelineFinal) !== true) return false;
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
