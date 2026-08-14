class HuntMonsterAttackAnimator {
    constructor(owner, onRoar, onInterference = null) {
        this.owner = owner;
        this.onRoar = onRoar;
        this.onInterference = onInterference;
        this.motionGeneration = 0;
        this.activeMonsterMotion = null;
        this.activeBeatMotionPreview = null;
        this.motionTrace = [];
        this.motionTraceLimit = 48;
    }

    get card() { return this.owner.card; }

    get animationTimers() { return this.owner.animationTimers; }

    static projectileArc(originX, originY, targetX, targetY) {
        const startX = Number(originX || 0) - Number(targetX || 0);
        const startY = Number(originY || 0) - Number(targetY || 0);
        return {
            startX,
            startY,
            midX: startX * .18,
            midY: startY * .18 - 70
        };
    }

    static targetFacingOrigin(monsterRect, targetRect, partPoint = null, baseFacing = 'front') {
        const monsterCenterX = monsterRect.left + monsterRect.width / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const authoredX = Number(partPoint?.x ?? .5);
        let resolvedX = authoredX;
        if (baseFacing === 'left') {
            resolvedX = targetCenterX >= monsterCenterX ? 1 - authoredX : authoredX;
        } else if (baseFacing === 'right') {
            resolvedX = targetCenterX >= monsterCenterX ? authoredX : 1 - authoredX;
        }
        return {
            x: monsterRect.left + monsterRect.width * resolvedX,
            y: monsterRect.top + monsterRect.height * Number(partPoint?.y ?? .5)
        };
    }

    static projectileLaunchDelayMs(pattern, impactTicks, firstImpactTicks, ticksPerSecond, visualTravelMs) {
        const tickMs = 1000 / Math.max(1, Number(ticksPerSecond || 10));
        const authoredTicks = Number(pattern?.projectileLaunchDelayTicks || 0);
        if (authoredTicks > 0) {
            return Math.max(0, Math.round(
                authoredTicks * tickMs
                + Math.max(0, Number(impactTicks || 0) - Number(firstImpactTicks || 0)) * tickMs
            ));
        }
        return Math.max(0, Math.round(Number(impactTicks || 0) * tickMs - visualTravelMs));
    }

    static previewReactionForAttackResult(result) {
        // Preview results are simulated and must stay inside the explicitly
        // preview-only timeline path. Live hunter reactions are owned by
        // HuntEngine.presentHunterImpact() after judgment commit.
        if (result === 'hit') return 'hit';
        if (['guard', 'perfect-guard', 'counter'].includes(result)) return 'guard';
        return null;
    }

    static tigrexRouteDirections(points = [], exits = []) {
        let previousDirection = -1;
        return points.map((point, index) => {
            const start = index === 0 ? { x: 0 } : (exits[index - 1] || { x: 0 });
            const direction = Math.sign(Number(point?.x || 0) - Number(start?.x || 0));
            if (direction) previousDirection = direction;
            return direction || previousDirection;
        });
    }

    static tigrexBranchStartDelayMs(atTicks, branchDurationMs, impactRatio, ticksPerSecond = 10) {
        const visualBranchDurationMs = typeof HuntAtbConfig !== 'undefined'
            && HuntAtbConfig.scaleVisualDurationMs
            ? HuntAtbConfig.scaleVisualDurationMs(branchDurationMs)
            : Number(branchDurationMs || 0);
        return Math.max(0,
            Number(atTicks || 0) * 1000 / Math.max(1, Number(ticksPerSecond || 10))
            - visualBranchDurationMs * Math.max(0, Math.min(1, Number(impactRatio || 0))));
    }

    static tigrexBranchApproachDurationMs(
        passStart, passTarget, passExit, branchPoint, chargeDurationMs, passTravelRatio
    ) {
        const distance = (from, to) => Math.hypot(
            Number(to?.x || 0) - Number(from?.x || 0),
            Number(to?.y || 0) - Number(from?.y || 0)
        );
        const passDistance = distance(passStart, passTarget) + distance(passTarget, passExit);
        const approachDistance = distance(passExit, branchPoint);
        const passDurationMs = Math.max(1,
            Number(chargeDurationMs || 0) * Number(passTravelRatio || 0));
        const chargeSpeed = passDistance / passDurationMs;
        if (!Number.isFinite(chargeSpeed) || chargeSpeed <= 0) return 520;
        return Math.max(280, Math.min(1000, Math.round(approachDistance / chargeSpeed)));
    }

    static tigrexChargeRouteKeyframes(points = [], exits = [], recoil = {}, passCount = 2) {
        const distance = (from, to) => Math.max(1, Math.hypot(
            Number(to?.x || 0) - Number(from?.x || 0),
            Number(to?.y || 0) - Number(from?.y || 0)
        ));
        const transform = (point, scale = 1.12) =>
            `translate(${Number(point?.x || 0)}px,${Number(point?.y || 0)}px) scale(${scale})`;
        const firstHitOffset = passCount === 3 ? .165 : .176;
        const firstExitOffset = passCount === 3 ? .27 : .29;
        const firstChargeSpeed = distance(points[0], exits[0])
            / (firstExitOffset - firstHitOffset);
        const impactOffsets = [firstHitOffset];
        const route = [{
            startOffset: passCount === 3 ? .09 : .10,
            hitOffset: firstHitOffset,
            exitOffset: firstExitOffset
        }];
        let cursor = firstExitOffset;
        for (let index = 1; index < Math.min(passCount, points.length, exits.length); index += 1) {
            cursor += passCount === 3 ? .01 : .08;
            const hitOffset = cursor + distance(exits[index - 1], points[index]) / firstChargeSpeed;
            const exitOffset = hitOffset + distance(points[index], exits[index]) / firstChargeSpeed;
            route.push({ startOffset: cursor, hitOffset, exitOffset });
            impactOffsets.push(hitOffset);
            cursor = exitOffset;
        }
        const frames = [
            { offset: 0, transform: 'none', opacity: 1 },
            { offset: passCount === 3 ? .055 : .06, transform: transform(recoil, 1), opacity: 1 },
            { offset: passCount === 3 ? .09 : .10, transform: transform(recoil, 1), opacity: 1 }
        ];
        route.forEach((pass, index) => {
            if (index > 0) frames.push({
                offset: pass.startOffset,
                transform: transform(exits[index - 1]),
                opacity: 1
            });
            frames.push(
                { offset: pass.hitOffset, transform: transform(points[index]), opacity: 1 },
                { offset: pass.exitOffset, transform: transform(exits[index]), opacity: 1 }
            );
        });
        frames.push({ offset: 1, transform: transform(exits[route.length - 1]), opacity: 1 });
        frames.sort((a, b) => a.offset - b.offset);
        frames.impactOffsets = impactOffsets;
        frames.routeExitOffset = route[route.length - 1].exitOffset;
        frames.speedPerNormalizedDuration = firstChargeSpeed;
        return frames;
    }

    static tigrexBiteRoute(lastExit, targetPoint, monsterRect, mouthPoint, overshoot = 112) {
        const contact = {
            x: Number(targetPoint?.x || 0)
                - (Number(mouthPoint?.x ?? .5) - .5) * Number(monsterRect?.width || 0),
            y: Number(targetPoint?.y || 0)
                - (Number(mouthPoint?.y ?? .5) - .5) * Number(monsterRect?.height || 0)
        };
        const dx = contact.x - Number(lastExit?.x || 0);
        const dy = contact.y - Number(lastExit?.y || 0);
        const distance = Math.max(1, Math.hypot(dx, dy));
        return {
            contact,
            finish: {
                x: contact.x + dx / distance * Number(overshoot || 0),
                y: contact.y + dy / distance * Number(overshoot || 0)
            }
        };
    }

    resolveMotionElement(monsterImg) {
        const closest = monsterImg?.closest?.('.hunt-monster-attack-motion');
        if (closest?.classList?.contains?.('hunt-monster-attack-motion')) return closest;
        const parent = monsterImg?.parentElement;
        return parent?.classList?.contains?.('hunt-monster-attack-motion') ? parent : monsterImg;
    }

    // 좌표 어휘 해석기. 매 모션마다 새로 계측한다 — 레이아웃이 바뀌면 앵커도 따라
    // 가야 하고, 캐시하면 예전 사고(430 클램프와 실제 거리 505의 차이를 --narga-drop
    // 으로 메우던 일)가 그대로 재현된다.
    resolveStageAnchors(monsterImg, primaryTarget = null, targetSequence = null, targetGroup = null) {
        const Anchors = typeof HuntStageAnchors !== 'undefined'
            ? HuntStageAnchors
            : (typeof require === 'function' ? require('./HuntStageAnchors.js') : null);
        if (!Anchors) throw new Error('HuntStageAnchors가 로드되지 않았다');
        return Anchors.fromDom(this.card, monsterImg, { primaryTarget, targetSequence, targetGroup });
    }

    // 겨냥 레이어는 몸 방향 전용이다. 없으면(구형 fixture) null을 돌려 무시한다.
    resolveAimLayer(monsterImg) {
        const closest = monsterImg?.closest?.('.hunt-monster-aim-layer');
        return closest?.classList?.contains?.('hunt-monster-aim-layer') ? closest : null;
    }

    // 자세 레이어. 구형 fixture에는 없으므로 null을 돌려 무시한다.
    resolvePoseLayer(monsterImg) {
        const closest = monsterImg?.closest?.('.hunt-monster-pose-layer');
        return closest?.classList?.contains?.('hunt-monster-pose-layer') ? closest : null;
    }

    // 자세(비율)와 원근(크기)을 하나의 scale로 합쳐 자세 레이어에 쓴다.
    //
    // 둘을 분리해 저작하는 이유는 실측에서 나왔다. 기존 키프레임 515개 중 320개
    // (62%)가 비율 1.000 — 자세는 없고 원근만 있다. 그런데 그 원근이 0.52~1.62로
    // 3.1배 퍼져 있어, 한 필드에 묶으면 "같은 웅크림인데 거리가 달라서" 매번 다른
    // 숫자를 적게 된다. 실제로 scale 조합이 139가지까지 늘어나 있었고, 분리하면
    // 13가지다.
    //
    //   scaleX = depth * sqrt(squash),  scaleY = depth / sqrt(squash)
    //   => scaleX/scaleY = squash,  sqrt(scaleX*scaleY) = depth
    static poseScale(squash = 1, depth = 1) {
        const ratio = Number.isFinite(Number(squash)) && Number(squash) > 0 ? Number(squash) : 1;
        const size = Number.isFinite(Number(depth)) && Number(depth) > 0 ? Number(depth) : 1;
        const root = Math.sqrt(ratio);
        return { x: size * root, y: size / root };
    }

    // pose: { squash, depth, rotate, pivot } — pivot은 부위 이름('part:tail')이거나
    // 백분율 쌍이다. 부위는 반전을 해석 시점에 반영한다(재설계안 규칙 2).
    applyPose(monsterImg, pose = null, facing = 1) {
        const layer = this.resolvePoseLayer(monsterImg);
        if (!layer) return null;
        if (!pose) {
            for (const name of ['--pose-rotate', '--pose-scale-x', '--pose-scale-y',
                '--pose-pivot-x', '--pose-pivot-y']) layer.style.removeProperty(name);
            return layer;
        }
        const scale = this.constructor.poseScale(pose.squash, pose.depth);
        layer.style.setProperty('--pose-rotate', `${Number(pose.rotate) || 0}deg`);
        layer.style.setProperty('--pose-scale-x', scale.x.toFixed(4));
        layer.style.setProperty('--pose-scale-y', scale.y.toFixed(4));
        const pivot = this.resolvePosePivot(pose.pivot, facing);
        if (pivot) {
            layer.style.setProperty('--pose-pivot-x', `${pivot.xPercent.toFixed(2)}%`);
            layer.style.setProperty('--pose-pivot-y', `${pivot.yPercent.toFixed(2)}%`);
        }
        return layer;
    }

    // 회전축은 CSS transform-origin을 직접 쓰지 않고 부위 데이터에서 나온다.
    // 그래야 특이도 사고(rig 기본 축이 모션별 축을 이기던 22개 규칙)가 원천적으로
    // 발생하지 않는다. 축이 데이터면 CSS 우선순위와 무관하다.
    resolvePosePivot(pivot, facing = 1) {
        if (!pivot) return null;
        if (typeof pivot === 'object') {
            return { xPercent: Number(pivot.xPercent) || 50, yPercent: Number(pivot.yPercent) || 72 };
        }
        const Anchors = typeof HuntStageAnchors !== 'undefined'
            ? HuntStageAnchors
            : (typeof require === 'function' ? require('./HuntStageAnchors.js') : null);
        // "발 중심"은 특정 한쪽 발이 아니라 좌·우 앞발의 중점이다. 화면 반전에도
        // 같은 지면 접점에 남아 넘어짐/일어남의 회전축이 좌우로 튀지 않는다.
        if (String(pivot).replace(/^part:/, '') === 'feet') {
            const feet = ['part:left-front-leg', 'part:right-front-leg'].map(name => {
                try { return Anchors.resolvePart(HuntMonsterAnatomyCatalog, this.owner?.selectedMonster, name, facing); }
                catch (_) { return null; }
            }).filter(Boolean);
            if (feet.length) return {
                xPercent: feet.reduce((total, point) => total + point.xPercent, 0) / feet.length,
                yPercent: feet.reduce((total, point) => total + point.yPercent, 0) / feet.length
            };
        }
        return Anchors.resolvePart(
            HuntMonsterAnatomyCatalog, this.owner?.selectedMonster, pivot, facing);
    }

    resolveFacingLayer(monsterImg) {
        const closest = monsterImg?.closest?.('.hunt-monster-facing-layer');
        return closest?.classList?.contains?.('hunt-monster-facing-layer') ? closest : null;
    }

    // The clipped copy lives inside the same facing layer as its source sprite.
    // Placement, pose rotation and image mirroring are inherited first; only
    // the requested anatomy region is then deformed, so it cannot drift away.
    createBeatPartFxLayers(monsterImg, motion, built, addCssTrack) {
        const facingLayer = this.resolveFacingLayer(monsterImg);
        if (!facingLayer || !monsterImg?.src || !Array.isArray(motion)) return { layers: [], animations: [] };
        const totalTicks = Math.max(1, Number(built?.durationMs || 0) / 100);
        const groups = new Map(); let elapsed = 0;
        for (const beat of motion) {
            const ticks = Math.max(1, Number(beat?.ticks) || 1);
            const start = elapsed / totalTicks, end = (elapsed + ticks) / totalTicks;
            elapsed += ticks;
            for (const value of Array.isArray(beat?.partFx) ? beat.partFx : []) {
                const part = String(value?.part || '').replace(/^part:/, '').trim();
                if (!part) continue;
                const entries = groups.get(part) || [];
                entries.push({ start, end, value }); groups.set(part, entries);
            }
        }
        const layers = [], animations = [];
        const transformFor = (value, phase = 0) => {
            const cycles = Math.max(1, Math.min(5, Math.round(Number(value?.cycles) || 1)));
            const wave = Math.sin(phase * Math.PI * 2 * cycles);
            const rotate = wave * Math.max(0, Number(value?.degrees ?? value?.rotate ?? 0));
            const skew = wave * (Number(value?.skewX) || 0);
            return `rotate(${rotate.toFixed(2)}deg) skewX(${skew.toFixed(2)}deg) scale(${Number(value?.scaleX ?? 1) || 1},${Number(value?.scaleY ?? 1) || 1})`;
        };
        for (const [part, entries] of groups) {
            const first = entries[0].value;
            const pivot = this.resolvePosePivot(`part:${part}`, 1) || { xPercent: 50, yPercent: 50 };
            const layer = document.createElement('div');
            layer.className = 'hunt-monster-part-fx-layer';
            layer.dataset.partFx = part; layer.setAttribute('aria-hidden', 'true');
            layer.style.clipPath = String(first.clip || `ellipse(24% 18% at ${pivot.xPercent}% ${pivot.yPercent}%)`);
            layer.style.webkitClipPath = layer.style.clipPath;
            layer.style.transformOrigin = `${pivot.xPercent.toFixed(2)}% ${pivot.yPercent.toFixed(2)}%`;
            const copy = document.createElement('img');
            copy.src = monsterImg.currentSrc || monsterImg.src; copy.alt = ''; copy.draggable = false;
            layer.appendChild(copy); facingLayer.appendChild(layer); layers.push(layer);
            const frames = [{ offset: 0, opacity: 0, transform: 'none' }];
            for (const entry of entries) {
                const opacity = Math.max(0, Math.min(.9, Number(entry.value.opacity ?? .42)));
                const filter = String(entry.value.filter || 'brightness(1.08) saturate(1.08)');
                frames.push({ offset: entry.start, opacity: 0, transform: transformFor(entry.value, 0), filter });
                for (const phase of [.25, .5, .75, 1]) frames.push({
                    offset: entry.start + (entry.end - entry.start) * phase,
                    opacity, transform: transformFor(entry.value, phase), filter
                });
            }
            frames.push({ offset: 1, opacity: 0, transform: 'none', filter: 'none' });
            const animation = layer.animate?.(frames, { duration: built.durationMs, easing: 'linear', fill: 'both' });
            if (animation) animations.push(animation);
            else addCssTrack(layer, `part-fx-${part.replace(/[^a-z0-9_-]/gi, '-')}`, frames);
        }
        return { layers, animations };
    }

    screenCrossGeometry(monsterImg, pattern = {}) {
        if (!this.card || !monsterImg) return null;
        const cardRect = this.card.getBoundingClientRect?.();
        const monsterRect = monsterImg.getBoundingClientRect?.();
        if (!cardRect || !monsterRect || monsterRect.width <= 0) return null;
        const authoredDirection = String(pattern.runtimeSweepDirection || '');
        const direction = authoredDirection === 'right-to-left' ? -1 : 1;
        const homeX = monsterRect.left + monsterRect.width / 2;
        const startOffset = direction * -Math.max(1050, cardRect.width * .68 + monsterRect.width);
        const endOffset = direction * Math.max(1150, cardRect.width * .72 + monsterRect.width);
        return {
            direction: Math.sign(endOffset - startOffset) || direction,
            homeX,
            startOffset,
            endOffset,
            startX: homeX + startOffset,
            endX: homeX + endOffset
        };
    }

    resolveScreenCrossImpactTimeline(pattern = {}, targetIndices = []) {
        if (!pattern?.tags?.includes?.('screen-crossing') || !this.card) return null;
        const monsterImg = this.card.querySelector?.('#fight-monster-img');
        const geometry = this.screenCrossGeometry(monsterImg, pattern);
        if (!geometry) return null;
        const monsterRect = monsterImg?.getBoundingClientRect?.();
        const movementTicks = Math.max(1, Math.round(Number(pattern.movement?.ticks || 40)));
        const visibleStart = .10;
        const visibleEnd = .82;
        const routeWidth = geometry.endX - geometry.startX;
        if (Math.abs(routeWidth) < 1) return null;
        // A crossing monster contacts the hunter with its leading body edge,
        // not after its sprite centre has already passed the weapon slot. Kits
        // can author the visible collision depth without coupling the runtime
        // to a monster id or a fixed pixel offset.
        const contactLeadRatio = Math.max(0, Math.min(.45, Number(
            pattern.impact?.contactLeadRatio || 0
        )));
        const contactLeadX = Number(monsterRect?.width || 0)
            * contactLeadRatio
            * geometry.direction;

        const timeline = targetIndices.map(targetIndex => {
            const targetCard = this.card.querySelector?.(`#fight-card-${targetIndex}`);
            const targetAnchor = targetCard?.querySelector?.('.game-hunt-weapon-img-container') || targetCard;
            const targetRect = targetAnchor?.getBoundingClientRect?.();
            if (!targetRect) return null;
            const targetX = targetRect.left + targetRect.width / 2 - contactLeadX;
            const routeProgress = Math.max(0, Math.min(1,
                (targetX - geometry.startX) / routeWidth
            ));
            const animationProgress = visibleStart + routeProgress * (visibleEnd - visibleStart);
            return {
                atTicks: Math.max(1, Math.round(movementTicks * animationProgress)),
                targetIndices: [targetIndex],
                damageScale: 1
            };
        }).filter(Boolean).sort((a, b) => a.atTicks - b.atTicks);

        if (!timeline.length) return null;
        return {
            timeline,
            runtimeSweepVector: geometry.direction
        };
    }

    resolveBazelCarpetImpactTimeline(pattern = {}, targetIndices = []) {
        if (!pattern?.tags?.includes?.('high-flight-sequence') || !this.card) return null;
        const orderedCards = [...this.card.querySelectorAll('.game-hunt-weapon-card')]
            .map(card => {
                const anchor = card.querySelector('.game-hunt-weapon-img-container') || card;
                const rect = anchor.getBoundingClientRect?.();
                const index = Number(card.id.replace(/\D+/g, ''));
                return rect && Number.isInteger(index)
                    ? { index, x: rect.left + rect.width / 2 }
                    : null;
            })
            .filter(Boolean)
            .sort((a, b) => a.x - b.x);
        if (!orderedCards.length) return null;

        const leftToRight = pattern.runtimeSweepDirection !== 'right-to-left';
        const route = leftToRight ? orderedCards : [...orderedCards].reverse();
        const minX = Math.min(...orderedCards.map(card => card.x));
        const maxX = Math.max(...orderedCards.map(card => card.x));
        const span = Math.max(1, maxX - minX);
        const sources = Object.entries(pattern.scaleDropsByPart || {})
            .flatMap(([part, count]) =>
                Array.from({ length: Math.max(0, Number(count || 0)) }, () => part)
            );
        const drops = route.map((card, index) => {
            const normalized = leftToRight
                ? (card.x - minX) / span
                : (maxX - card.x) / span;
            return {
                atTicks: Math.max(28, Math.min(66, Math.round(28 + normalized * 38))),
                targetIndices: [card.index],
                damageScale: 0,
                eventKind: 'blast-scale-drop',
                sourcePart: sources[index] || 'body'
            };
        });
        const authoredImpacts = (pattern.impactTimeline || []).map(entry => (
            entry?.eventKind === 'carpet-dive'
                && Number.isInteger(pattern.runtimeDiveTargetIndex)
                ? {
                    ...entry,
                    targetMode: '',
                    targetIndices: [pattern.runtimeDiveTargetIndex]
                }
                : { ...entry }
        ));
        return {
            timeline: [
                ...authoredImpacts,
                ...drops
            ].sort((a, b) => a.atTicks - b.atTicks),
            runtimeSweepVector: leftToRight ? 1 : -1
        };
    }

    facingPlan(profile, pattern, attackX = 0, secondX = 0) {
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog
            : null;
        const baseFacing = anatomy?.baseFacing?.(this.owner?.selectedMonster) || 'front';
        if (baseFacing === 'front') return null;
        const authored = String(pattern?.runtimeSweepDirection || '');
        const measuredDirection = Math.sign(Number(pattern?.runtimeSweepVector || 0));
        const authoredDirection = measuredDirection || (authored === 'left-to-right' ? 1
            : authored === 'right-to-left' ? -1
                : 0);
        const horizontalDirection = authoredDirection || (Math.abs(attackX) >= 12 ? Math.sign(attackX) : 0);
        const id = String(profile?.id || '');

        const choreography = typeof HuntMonsterFacingChoreography !== 'undefined'
            ? HuntMonsterFacingChoreography
            : (typeof require === 'function' ? require('./HuntMonsterFacingChoreography.js') : null);
        const buildFacingPlan = choreography?.[id];
        if (buildFacingPlan) {
            return buildFacingPlan({
                id,
                pattern,
                profile,
                horizontalDirection,
                authoredDirection,
                attackX,
                secondX,
                monsterState: this.owner?.monsterState,
                ticksPerSecond: typeof HuntAtbConfig !== 'undefined'
                    ? Number(HuntAtbConfig.TICKS_PER_SECOND || 10)
                    : 10,
                projectileLaunchDelayMs: HuntMonsterAttackAnimator.projectileLaunchDelayMs
            });
        }

        if (profile?.aim !== 'target' || !horizontalDirection) return null;
        return [
            { offset: 0, direction: horizontalDirection },
            { offset: .68, direction: horizontalDirection },
            { offset: .69, direction: -horizontalDirection },
            { offset: .92, direction: -horizontalDirection },
            { offset: .93, direction: 0 },
            { offset: 1, direction: 0 }
        ];
    }

    startFacingMotion(monsterImg, profile, pattern, attackX = 0, secondX = 0, activeMotion = null) {
        const layer = this.resolveFacingLayer(monsterImg);
        const plan = this.facingPlan(profile, pattern, attackX, secondX);
        if (!layer || !plan?.length) return null;
        const baseFacing = HuntMonsterAnatomyCatalog.baseFacing(this.owner?.selectedMonster);
        const scaleFor = direction => direction === 0 ? 1
            : (baseFacing === 'left' ? (direction < 0 ? 1 : -1) : (direction > 0 ? 1 : -1));
        const initialFlip = scaleFor(plan[0]?.direction ?? 0);
        layer.style.setProperty('--monster-facing-flip', String(initialFlip));
        monsterImg?.style?.setProperty?.('--monster-facing-flip', String(initialFlip));
        const keyframes = plan.map(step => ({
            offset: step.offset,
            transform: `scaleX(${scaleFor(step.direction)})`
        }));
        layer.dataset.monsterFacingPlan = String(profile?.id || 'directional');
        layer.dataset.monsterFacingDirections = plan
            .map(step => `${step.offset}:${step.direction}`)
            .join('|');
        const animation = typeof layer.animate === 'function'
            ? layer.animate(keyframes, { duration: profile.duration, easing: 'step-end', fill: 'both' })
            : null;
        if (!animation) layer.style.transform = keyframes[0].transform;
        const cleanup = () => {
            try { animation?.cancel(); } catch (_) { /* detached OBS node */ }
            const retainLastFacing = profile?.id === 'tigrex-charge-chain';
            const finalTransform = keyframes[keyframes.length - 1]?.transform;
            if (retainLastFacing && finalTransform) {
                layer.style.transform = finalTransform;
                layer.dataset.monsterRetainedFacing = finalTransform;
            } else {
                layer.style.removeProperty('transform');
                delete layer.dataset.monsterRetainedFacing;
            }
            layer.style.removeProperty('--monster-facing-flip');
            monsterImg?.style?.removeProperty?.('--monster-facing-flip');
            delete layer.dataset.monsterFacingPlan;
            delete layer.dataset.monsterFacingDirections;
            // 겨냥도 함께 푼다. 남겨두면 다음 대기 자세가 기울어진 채로 유지된다.
            this.resolveAimLayer(monsterImg)?.style?.removeProperty?.('--narga-aim-deg');
        };
        if (activeMotion) activeMotion.finishers.push(cleanup);
        return { animation, keyframes, cleanup };
    }

    scheduleTigrexStrideAudio(activeMotion, strideDelayMs = 0) {
        if (!activeMotion || typeof this.owner?.onMonsterStrideAudio !== 'function') return;
        let intervalId = null;
        const expectedGeneration = activeMotion.generation;
        const playStep = () => {
            if (this.activeMonsterMotion?.generation !== expectedGeneration) return;
            this.owner.onMonsterStrideAudio(this.owner.selectedMonster);
        };
        const startId = this.animationTimers.timeout(() => {
            playStep();
            intervalId = this.animationTimers.interval(playStep, 300);
        }, Math.max(0, Number(strideDelayMs || 0)) + 300);
        activeMotion.finishers.push(() => {
            this.animationTimers.clear?.(startId);
            if (intervalId !== null) this.animationTimers.clear?.(intervalId);
        });
    }

    traceMonsterMotion(event, details = {}, anomaly = false) {
        const entry = {
            at: Date.now(),
            event,
            monsterId: this.owner.selectedMonster?.id || null,
            ...details
        };
        this.motionTrace.push(entry);
        if (this.motionTrace.length > this.motionTraceLimit) this.motionTrace.splice(0, this.motionTrace.length - this.motionTraceLimit);
        if (anomaly && typeof console !== 'undefined' && console.warn) {
            console.warn('[HuntMonsterMotion]', entry, this.motionTrace.slice());
        }
        return entry;
    }

    getMonsterMotionTrace() {
        return this.motionTrace.map(entry => ({ ...entry }));
    }

    clearActiveMonsterMotion(expectedGeneration = null, reason = 'clear') {
        const active = this.activeMonsterMotion;
        if (!active || (expectedGeneration !== null && active.generation !== expectedGeneration)) return false;
        this.activeMonsterMotion = null;
        active.element.removeEventListener?.('animationend', active.finish);
        active.element.removeEventListener?.('animationcancel', active.finish);
        if (active.timeoutId !== undefined) this.animationTimers.clear?.(active.timeoutId);
        active.element.classList.remove(active.motionClass);
        active.element.style.removeProperty('animation');
        active.element.style.removeProperty('animation-delay');
        active.element.style.removeProperty('animation-play-state');
        active.element.style.removeProperty('transform');
        active.element.style.removeProperty('transition');
        delete active.element.dataset.tigrexChargePasses;
        delete active.element.dataset.tigrexRouteOffsets;
        delete active.element.dataset.tigrexRouteFallback;
        this.card?.querySelectorAll?.('.monster-local-action-fx')?.forEach(node => node.remove());
        active.finishers.forEach(finisher => finisher());
        this.traceMonsterMotion('complete', {
            generation: active.generation,
            motionClass: active.motionClass,
            patternId: active.patternId,
            reason
        }, reason === 'animationcancel' || (reason === 'watchdog' && active.isolatedLayer));
        return true;
    }

    /**
     * 분노한 나르가쿠르가의 붉은 눈 잔상.
     *
     * 잔상을 직접 그리는 대신, 모션 요소와 "같은 클래스 · 같은 CSS 변수"를 가진
     * 빈 복제본을 형제로 두고 animation-delay만 준다. CSS 애니메이션은 지연된 시간만큼
     * 과거의 프레임을 그리므로, 복제본은 몬스터가 조금 전에 있던 자리에 놓인다.
     * 복제본에는 몸 이미지 없이 눈 점만 있으므로 붉은 선 두 줄이 궤적으로 남는다.
     *
     * 요소는 두 개뿐이고 각각 점 두 개를 가상 요소로 그리므로 비용이 작다.
     * 트레이트(rage-eyes)를 가진 몬스터가 분노 상태일 때만 만든다. 몬스터 id로
     * 분기하지 않는다.
     */
    spawnEyeTrail(motionElement, motionClass, active) {
        const image = motionElement.querySelector?.('.game-hunt-monster-img');
        if (!image?.classList?.contains?.('monster-trait-rage-eyes')) return;
        const stage = motionElement.parentElement;
        if (!stage) return;
        // CSS 애니메이션을 끈 경로(동적 경로 키프레임을 쓰는 돌진)는 클래스 애니메이션이
        // 돌지 않으므로 잔상도 따라갈 수 없다. 제자리에 붉은 점만 남기지 않도록 건너뛴다.
        if (String(motionElement.style?.animation || '').includes('none')) return;
        // 좌표 계산에 쓰이는 커스텀 속성만 물려받는다. cssText를 통째로 복사하면
        // transform이나 animation 같은 확정값까지 따라와 잔상이 제 경로를 그리지 못한다.
        const variables = Array.from(motionElement.style || [])
            .filter(name => String(name).startsWith('--'))
            .map(name => [name, motionElement.style.getPropertyValue(name)]);
        const ghosts = [];
        for (let index = 1; index <= 2; index += 1) {
            const ghost = document.createElement('div');
            ghost.className = `hunt-monster-eye-trail ${motionClass}`;
            ghost.dataset.trail = String(index);
            ghost.setAttribute('aria-hidden', 'true');
            variables.forEach(([name, value]) => ghost.style.setProperty(name, value));
            ghost.style.animationDelay = `${index * 70}ms`;
            ghost.style.animationFillMode = 'both';
            ghost.innerHTML = '<div class="hunt-monster-eye-glow"></div>';
            stage.appendChild(ghost);
            ghosts.push(ghost);
        }
        active.finishers.push(() => ghosts.forEach(ghost => ghost.remove()));
    }

    startMonsterMotion(motionElement, motionClass, duration, onFinish = null, metadata = {}) {
        this.clearActiveMonsterMotion(null, 'replaced');
        motionElement.classList.remove(...Array.from(motionElement.classList).filter(name => name.startsWith('monster-motion-')));
        if (metadata.disableCssAnimation) {
            motionElement.style.setProperty('animation', 'none', 'important');
        }
        if (metadata.preservedTransform && metadata.preservedTransform !== 'none') {
            motionElement.style.setProperty('--tigrex-branch-start-transform', metadata.preservedTransform);
        }
        // A charge branch begins at the final approach pose of the charge. Do
        // not paint/reflow the wrapper at its origin between the two classes.
        if (!metadata.preservePoseOnReplace) void motionElement.offsetWidth;
        motionElement.classList.add(motionClass);
        const generation = ++this.motionGeneration;
        const computedStyle = typeof getComputedStyle === 'function' ? getComputedStyle(motionElement) : null;
        const expectedAnimationNames = new Set(String(computedStyle?.animationName || motionClass)
            .split(',').map(name => name.trim()).filter(Boolean));
        const active = {
            element: motionElement,
            motionClass,
            generation,
            durationMs: Math.max(1, Number(duration) || 1),
            timeoutId: undefined,
            finishers: onFinish ? [onFinish] : [],
            expectedAnimationNames,
            patternId: metadata.patternId || null,
            isolatedLayer: motionElement.classList.contains?.('hunt-monster-attack-motion') || false
        };
        active.finish = event => {
            if (active.scrubbing) return;
            if (event) {
                if (event.target !== motionElement) {
                    this.traceMonsterMotion('ignored-child-event', {
                        generation,
                        motionClass,
                        animationName: event.animationName || null
                    });
                    return;
                }
                if (event.animationName && !expectedAnimationNames.has(event.animationName)) {
                    this.traceMonsterMotion('ignored-foreign-event', {
                        generation,
                        motionClass,
                        animationName: event.animationName
                    });
                    return;
                }
            }
            this.clearActiveMonsterMotion(
                generation,
                event?.type === 'animationcancel' ? 'animationcancel' : (event ? 'animationend' : 'watchdog')
            );
        };
        this.spawnEyeTrail(motionElement, motionClass, active);
        this.activeMonsterMotion = active;
        motionElement.addEventListener?.('animationend', active.finish);
        motionElement.addEventListener?.('animationcancel', active.finish);
        active.timeoutId = this.animationTimers.timeout(() => active.finish(), duration + 160);
        this.traceMonsterMotion('start', {
            generation,
            motionClass,
            patternId: active.patternId,
            duration,
            isolatedLayer: active.isolatedLayer,
            connected: motionElement.isConnected !== false
        });
        return active;
    }

    clearMonsterMotion(reason = 'dispose') {
        this.motionGeneration++;
        // A BEAT preview owns WAAPI/CSS tracks outside activeMonsterMotion.
        // Dropping only the controller reference leaves those filled tracks on
        // screen, so selecting another pattern can inherit its predecessor's
        // position, rotation, facing, scale and skew.
        const clearedBeatPreview = this.cancelBeatMotionPreview();
        const cleared = this.clearActiveMonsterMotion(null, reason);
        this.card?.classList?.remove?.('hunt-monster-underground', 'monster-charge-rumble');
        this.card?.querySelectorAll?.('.hunt-monster-attack-motion')?.forEach(motionElement => {
            const motionClasses = Array.from(motionElement.classList || [])
                .filter(name => name.startsWith('monster-motion-'));
            if (motionClasses.length) motionElement.classList.remove(...motionClasses);
            motionElement.style?.removeProperty?.('animation');
            motionElement.style?.removeProperty?.('transform');
            motionElement.style?.removeProperty?.('transition');
            motionElement.style?.removeProperty?.('opacity');
        });
        this.card?.querySelectorAll?.('.hunt-monster-facing-layer')?.forEach(layer => {
            layer.getAnimations?.().forEach(animation => animation.cancel());
            layer.style?.removeProperty?.('transform');
            delete layer.dataset.monsterFacingPlan;
        });
        this.card?.querySelectorAll?.('.monster-local-action-fx,.monster-charge-track,.monster-stomp-dust,.monster-wall-stuck-fx,.monster-burrow-dust,.monster-tail-slam-arc,.monster-part-swing-arc,.hunt-monster-eye-trail')
            ?.forEach(node => node.remove());
        this.card?.querySelectorAll?.('#fight-monster-img,.hunt-small-monster')?.forEach(monsterImg => {
            monsterImg.classList.remove('monster-horn-stuck-anim', 'monster-beat-stride-flip');
            delete monsterImg.dataset.hornStuck;
            for (const property of ['--stuck-x', '--stuck-y', '--monster-stride-cycle']) {
                monsterImg.style.removeProperty(property);
            }
        });
        return cleared || clearedBeatPreview;
    }

    triggerMonsterRoar(pattern = null) {
        this.onRoar(pattern);
    }

    // 비트 목록을 가진 패턴은 새 경로를 탄다. 없으면 종전 키프레임 경로 그대로다.
    // 병존이 되므로 몬스터를 하나씩 옮길 수 있고, 어느 시점에 멈춰도 나머지는
    // 그대로 동작한다.
    cancelBeatMotionPreview(controller = this.activeBeatMotionPreview) {
        if (!controller) return false;
        controller.animations?.forEach(animation => {
            try { animation.cancel(); } catch (_) { /* detached preview layer */ }
        });
        if (this.activeBeatMotionPreview === controller) {
            const element = controller.motionElement;
            if (element?.dataset) {
                delete element.dataset.monsterBeatTimeline;
                delete element.dataset.monsterBeatImpacts;
            }
            this.activeBeatMotionPreview = null;
        }
        controller.monsterImg?.classList?.remove?.('monster-beat-stride-flip');
        controller.monsterImg?.style?.removeProperty?.('--monster-stride-cycle');
        controller.cssTracks?.forEach(track => {
            track.element?.style?.removeProperty?.('animation');
            track.element?.style?.removeProperty?.('animation-delay');
            track.element?.style?.removeProperty?.('animation-play-state');
        });
        controller.cssStyle?.remove?.();
        controller.partFxLayers?.forEach(layer => layer.remove());
        if (controller.motionElement?.dataset) delete controller.motionElement.dataset.monsterBeatBackend;
        return true;
    }

    static remapKeyframeBeats(keyframes = [], sourceBeats = [], targetBeats = []) {
        const normalize = beats => {
            let elapsed = 0;
            return beats.map((beat, index) => {
                const ticks = Math.max(1, Number(beat?.ticks) || 1);
                const item = { id: beat?.beat || `beat-${index + 1}`, start: elapsed, end: elapsed + ticks };
                elapsed += ticks;
                return item;
            });
        };
        const source = normalize(sourceBeats), target = normalize(targetBeats);
        const sourceTotal = source.at(-1)?.end || 0, targetTotal = target.at(-1)?.end || 0;
        if (!sourceTotal || !targetTotal || source.length !== target.length) return keyframes;
        return keyframes.map(frame => {
            const sourceTick = Math.max(0, Math.min(sourceTotal, Number(frame.offset) * sourceTotal));
            let index = source.findIndex((beat, beatIndex) => sourceTick < beat.end
                || beatIndex === source.length - 1);
            if (index < 0) index = source.length - 1;
            const sourceBeat = source[index], targetBeat = target[index];
            const ratio = sourceBeat.end > sourceBeat.start
                ? (sourceTick - sourceBeat.start) / (sourceBeat.end - sourceBeat.start) : 0;
            return { ...frame, offset: Math.max(0, Math.min(1,
                (targetBeat.start + ratio * (targetBeat.end - targetBeat.start)) / targetTotal)) };
        });
    }

    static applyProfileAdapterEdits(keyframes = [], beats = []) {
        const normalized = [];
        let elapsed = 0;
        for (const beat of beats || []) {
            const ticks = Math.max(1, Number(beat?.ticks) || 1);
            normalized.push({ ...beat, start: elapsed, end: elapsed + ticks });
            elapsed += ticks;
        }
        if (!elapsed || !normalized.length) return keyframes;
        return keyframes.map(frame => {
            const tick = Math.max(0, Math.min(elapsed - Number.EPSILON,
                Math.max(0, Math.min(1, Number(frame.offset) || 0)) * elapsed));
            const beat = normalized.find((item, index) => tick < item.end
                || index === normalized.length - 1) || {};
            const additions = [];
            const x = Number(beat.offsetX) || 0, y = Number(beat.offsetY) || 0;
            if (x || y) additions.push(`translate(${x}px, ${y}px)`);
            if (beat.rotation !== undefined && beat.rotation !== null) additions.push(`rotate(${Number(beat.rotation) || 0}deg)`);
            else if (beat.rotateBy !== undefined && beat.rotateBy !== null) additions.push(`rotate(${Number(beat.rotateBy) || 0}deg)`);
            if (beat.scaleX !== undefined && beat.scaleX !== null) additions.push(`scaleX(${Math.max(.05, Number(beat.scaleX) || 1)})`);
            if (beat.scaleY !== undefined && beat.scaleY !== null) additions.push(`scaleY(${Math.max(.05, Number(beat.scaleY) || 1)})`);
            if (beat.skewX !== undefined && beat.skewX !== null) additions.push(`skewX(${Number(beat.skewX) || 0}deg)`);
            if (beat.skewY !== undefined && beat.skewY !== null) additions.push(`skewY(${Number(beat.skewY) || 0}deg)`);
            return {
                ...frame,
                ...(additions.length ? { transform: `${frame.transform && frame.transform !== 'none' ? frame.transform : ''} ${additions.join(' ')}`.trim() } : {}),
                ...(beat.opacity !== undefined && beat.opacity !== null
                    ? { opacity: Math.max(0, Math.min(1, Number(beat.opacity))) } : {})
            };
        });
    }

    static motionFromCompiledBeat(pattern = {}) {
        const graphBeats = pattern?.beatV2?.beats;
        if (!((pattern?.beatV2Enabled === true || pattern?.beatV2Approved === true)
            && Array.isArray(graphBeats) && graphBeats.length)) return pattern;
        // Live rendering must observe the exact compiled BEAT graph that owns
        // Preview scrubbing and combat judgments. Keeping a parallel raw
        // `pattern.motion` path allowed an editor-approved facing change to be
        // visible in Preview while an older profile copy rendered in the hunt.
        const motion = graphBeats.map((beat, index) => {
            const frames = Array.isArray(beat?.tracks?.visual) ? beat.tracks.visual : [];
            const visual = frames.length
                ? [...frames].sort((left, right) => Number(left?.offsetTicks || 0)
                    - Number(right?.offsetTicks || 0))[0]?.value || {}
                : {};
            return {
                ...visual,
                beat: String(beat?.id || `beat-${index + 1}`),
                ticks: Math.max(1, Number(beat?.ticks) || 1)
            };
        });
        return { ...pattern, motion };
    }

    playProfileGraphMotion(active, pattern, profile, frames, timing = {}) {
        if (!active?.element || !Array.isArray(frames) || !frames.length
            || typeof active.element.animate !== 'function') return false;
        const source = pattern?.runtimeSourceTimingBeats;
        const target = pattern?.runtimeTimingBeats;
        const retimed = Array.isArray(source) && Array.isArray(target) && source.length === target.length
            ? HuntMonsterAttackAnimator.remapKeyframeBeats(frames, source, target)
            : frames;
        const edited = HuntMonsterAttackAnimator.applyProfileAdapterEdits(retimed, target || []);
        if (timing.origin) active.element.style.transformOrigin = timing.origin;
        const animation = active.element.animate(edited, {
            duration: active.durationMs,
            easing: timing.easing || 'linear',
            fill: 'both'
        });
        active.retimedAnimations = [animation];
        active.element.dataset.monsterMotionBackend = 'profile-graph';
        active.finishers.push(() => {
            try { animation.cancel(); } catch (_) { /* detached profile graph */ }
            active.element.style?.removeProperty?.('transform-origin');
            delete active.element.dataset.monsterMotionBackend;
        });
        return true;
    }

    playBeatMotion(monsterImg, pattern, profileId, targetCard = null, targets = []) {
        // 에디터의 정지 프레임과 전체 재생, 또는 연속 패턴의 이전 모션이
        // 동시에 같은 레이어를 잡으면 위치·투명도·복귀가 서로 덮어쓴다.
        // 새 비트 모션은 항상 단일 owner가 되게 기존 컨트롤러부터 폐기한다.
        this.cancelBeatMotionPreview();
        this.clearActiveMonsterMotion(null, 'beat-replaced');
        const Compiler = typeof HuntMotionCompiler !== 'undefined'
            ? HuntMotionCompiler
            : (typeof require === 'function' ? require('./HuntMotionCompiler.js') : null);
        const motionElement = this.resolveMotionElement(monsterImg);
        const poseLayer = this.resolvePoseLayer(monsterImg);
        if (!Compiler || !motionElement || !poseLayer) return null;
        const legacyMotionClasses = Array.from(motionElement.classList || [])
            .filter(name => name.startsWith('monster-motion-'));
        if (legacyMotionClasses.length) motionElement.classList.remove(...legacyMotionClasses);
        for (const property of ['animation', 'animation-delay', 'animation-play-state',
            'transition', 'transform', 'opacity']) motionElement.style.removeProperty(property);
        if (pattern?.chargeLaunchStyle) motionElement.dataset.chargeLaunchStyle = pattern.chargeLaunchStyle;
        else delete motionElement.dataset.chargeLaunchStyle;

        const rig = HuntMonsterAnimationCatalog?.resolveRig?.(this.owner?.selectedMonster)?.id || 'winged';
        // 비트의 `target`이 가리킬 이번 턴의 주 표적. 비트는 번호를 박지 않는다.
        const primaryTarget = targetCard?.id
            ? Number(String(targetCard.id).replace('fight-card-', ''))
            : null;
        const resolvedPasses = Array.isArray(pattern?.runtimeResolvedImpactTimeline)
            ? pattern.runtimeResolvedImpactTimeline
                .map(event => event?.targetIndices?.[0])
                .filter(Number.isInteger)
            : [];
        const resolvedTargetGroup = Array.isArray(pattern?.runtimePairTargets)
            && pattern.runtimePairTargets.some(Number.isInteger)
            ? [...new Set(pattern.runtimePairTargets.filter(Number.isInteger))]
            : Array.isArray(pattern?.runtimeResolvedImpactTimeline)
            ? [...new Set(pattern.runtimeResolvedImpactTimeline
                .flatMap(event => event?.targetIndices || []).filter(Number.isInteger))]
            : (Array.isArray(targets) ? [...new Set(targets.map(target => target?.index)
                .filter(Number.isInteger))] : []);
        const targetSequence = Array.isArray(pattern?.runtimePairTargets)
            && pattern.runtimePairTargets.some(Number.isInteger)
            ? pattern.runtimePairTargets.filter(Number.isInteger)
            : resolvedPasses.length
            ? resolvedPasses
            : (Array.isArray(targets) ? targets.map(target => target?.index).filter(Number.isInteger) : []);
        // align이 쓸 부위 오프셋. 이미지 중심 기준 픽셀이다. 스프라이트 크기를
        // 실측해서 곱하므로 이미지 크기가 바뀌어도 따라간다.
        const monsterRect = monsterImg.getBoundingClientRect();
        const partOffset = (name, facing) => {
            let point = null;
            try {
                point = this.resolvePosePivot(name, facing);
            } catch (error) {
                this.traceMonsterMotion('part-anchor-fallback', {
                    patternId: pattern?.id || null,
                    part: name,
                    reason: error?.message || String(error)
                });
            }
            // 부위 데이터 누락은 해당 정렬만 포기한다. 한 앵커 때문에 유효한
            // BEAT 그래프 전체가 재생 전 예외로 중단되어서는 안 된다.
            if (!point || !Number.isFinite(point.xPercent) || !Number.isFinite(point.yPercent)) {
                return { x: 0, y: 0 };
            }
            return {
                x: (point.xPercent / 100 - .5) * monsterRect.width,
                y: (point.yPercent / 100 - .5) * monsterRect.height
            };
        };
        const built = Compiler.compile(pattern.motion, {
            anchors: this.resolveStageAnchors(monsterImg, primaryTarget, targetSequence, resolvedTargetGroup),
            rig,
            partOffset
        });

        // 자세 키프레임의 축은 부위 이름이다. 여기서 백분율로 푼다 — 반전은
        // 해석 시점에 반영된다(규칙 2). 저작자는 좌우 두 벌을 적지 않는다.
        const poseFrames = built.pose.map(frame => {
            const keyframe = { offset: frame.offset, transform: frame.transform };
            if (frame.easing) keyframe.easing = frame.easing;
            if (frame.filter) keyframe.filter = frame.filter;
            if (frame.origin) keyframe.transformOrigin = frame.origin;
            const pivot = frame.pivot
                ? this.resolvePosePivot(frame.pivot, frame.facing ?? 1)
                : null;
            if (pivot) keyframe.transformOrigin = `${pivot.xPercent.toFixed(2)}% ${pivot.yPercent.toFixed(2)}%`;
            return keyframe;
        });

        const timing = { duration: built.durationMs, easing: 'linear', fill: 'both' };
        const animations = [
            motionElement.animate?.(built.placement, timing),
            poseLayer.animate?.(poseFrames, timing)
        ].filter(Boolean);

        // Facing is deliberately CSS-backed even when placement/pose use WAAPI.
        // Some OBS/embedded Chromium builds expose Element.animate() and return
        // Animation objects, but silently fail to composite a transform on the
        // nested facing layer. That left authored flipFacing beats visible in
        // data while both X-tail contacts rendered with the same orientation.
        // A scoped CSS track also gives playback and scrubbing one dependable
        // direction source across Preview and live hunts.
        let cssStyle = null;
        const cssTracks = [];
        const generation = this.motionGeneration + 1;
        const declarations = frame => [
            frame.transform != null ? `transform:${frame.transform}` : '',
            frame.opacity != null ? `opacity:${frame.opacity}` : '',
            frame.filter != null ? `filter:${frame.filter}` : '',
            frame.transformOrigin != null ? `transform-origin:${frame.transformOrigin}` : '',
            frame.easing ? `animation-timing-function:${frame.easing}` : ''
        ].filter(Boolean).join(';');
        const addCssTrack = (element, suffix, frames, easing = 'linear') => {
            if (!element || !frames.length) return;
            if (!cssStyle) {
                cssStyle = document.createElement('style');
                cssStyle.dataset.monsterBeatFallback = String(generation);
                (document.head || document.documentElement).appendChild(cssStyle);
            }
            const name = `monster-beat-${generation}-${suffix}`;
            const keyframes = frames.map(frame =>
                `${(Math.max(0, Math.min(1, Number(frame.offset) || 0)) * 100).toFixed(4)}%{${declarations(frame)}}`
            ).join('');
            cssStyle.textContent += `@keyframes ${name}{${keyframes}}`;
            element.style.setProperty('animation',
                `${name} ${built.durationMs}ms ${easing} both`, 'important');
            cssTracks.push({ element, name });
        };

        const facingLayer = this.resolveFacingLayer(monsterImg);
        let facingFrames = [];
        if (facingLayer && built.facingActive) {
            const baseFacing = HuntMonsterAnatomyCatalog.baseFacing(this.owner?.selectedMonster);
            const flip = direction => (baseFacing === 'left'
                ? (direction < 0 ? 1 : -1)
                : (direction > 0 ? 1 : -1));
            const authoredSteps = built.facing;
            // A single authored facing step is still a full-duration pose.
            // Keep an explicit terminal frame so the CSS fallback cannot
            // restore the base sprite direction before the BEAT completes.
            const singleFacingHold = built.facing.length === 1
                && authoredSteps[0]?.offset < 1;
            const facingSteps = authoredSteps.length
                ? [
                    ...(authoredSteps[0].offset > 0 ? [{ ...authoredSteps[0], offset: 0 }] : []),
                    ...authoredSteps,
                    ...(singleFacingHold || authoredSteps.at(-1).offset < 1
                        ? [{ ...authoredSteps.at(-1), offset: 1 }] : [])
                ]
                : [];
            facingFrames = facingSteps.map(step => ({
                offset: step.offset, transform: `scaleX(${flip(step.direction)})`
            }));
            addCssTrack(facingLayer, 'facing', facingFrames, 'steps(1,end)');
        }

        const partFx = this.createBeatPartFxLayers(monsterImg, pattern.motion, built, addCssTrack);
        animations.push(...partFx.animations);

        // OBS/WebView builds can expose neither Element.animate nor Animation.
        // Silently optional-chaining animate() used to leave a valid BEAT graph
        // with zero moving tracks. Compile the same frames into scoped CSS so
        // playback, pause and timeline seeking retain one authoritative graph.
        if (!animations.length) {
            motionElement.dataset.monsterBeatBackend = 'css-fallback';
            addCssTrack(motionElement, 'placement', built.placement);
            addCssTrack(poseLayer, 'pose', poseFrames);
        } else if (facingFrames.length) {
            motionElement.dataset.monsterBeatBackend = 'waapi+css-facing';
        }

        // 검수 화면이 비트 구간과 접촉 시점을 그대로 읽을 수 있게 남긴다.
        motionElement.dataset.monsterBeatTimeline = built.timeline
            .map(step => `${step.beat}:${step.startTicks}-${step.endTicks}`).join('|');
        motionElement.dataset.monsterBeatImpacts = built.impacts
            .map(impact => impact.atTicks).join(',');

        const previewController = { animations, cssTracks, cssStyle, partFxLayers: partFx.layers,
            durationMs: built.durationMs, motionElement, monsterImg };
        this.activeBeatMotionPreview = previewController;
        // Timeline scrubbing is a still-frame editor, not playback. WAAPI
        // animations start running as soon as `animate()` returns, so pause
        // them in the same task before the browser can paint the first frame.
        if (pattern?.runtimePreviewScrub) {
            this.freezeBeatMotionPreview(previewController, pattern.runtimePreviewProgress || 0);
        }
        const clear = () => {
            if (this.activeBeatMotionPreview === previewController) {
                this.cancelBeatMotionPreview(previewController);
            } else {
                for (const animation of animations) { try { animation.cancel(); } catch (_) { /* detached */ } }
            }
        };
        if (!pattern?.runtimePreviewScrub) this.animationTimers.timeout(clear, built.durationMs + 60);

        const audioGeneration = ++this.motionGeneration;
        if (!pattern?.runtimePreviewScrub) {
            // The review shell mutes only renderer-owned audio. Visual BEAT cues
            // (burrow dust, tracking trails, emergence dust) and stride motion
            // remain part of the authored animation and must still run.
            // Live approved audio is emitted by HuntBeatActionRuntime. Keeping
            // this renderer timer would play the same assigned slot twice and
            // would survive on a clock unrelated to gameplay interruption.
            if (!(pattern?.beatV2Enabled === true || pattern?.beatV2Approved === true) && !pattern?.runtimePreviewMuteAudio) for (const cue of built.cues || []) {
                this.animationTimers.timeout(() => {
                    if (this.motionGeneration !== audioGeneration) return;
                    this.owner.onMonsterPatternAudio?.('monster_attack', null, {
                        monsterId: this.owner.selectedMonster?.id,
                        patternId: pattern.id,
                        patternName: pattern.name,
                        patternType: pattern.type,
                        patternSlot: cue.audioSlot,
                        overrideOnly: true
                    });
                }, Math.round(Number(cue.atTicks || 0) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND));
            }
            // Scrubbing/pattern selection must produce a still frame only.
            // Running authored FX here made merely selecting a pattern emit
            // dust, roar waves and other combat spectacle without playback.
            if (!pattern?.runtimePreviewScrub) for (const cue of built.visualCues || []) {
                this.animationTimers.timeout(() => {
                    if (this.motionGeneration !== audioGeneration) return;
                    if (cue.fx === 'burrow-tracking-dust') {
                        this.createBurrowTrackingDustEffect(
                            monsterImg,
                            targetCard || monsterImg,
                            Math.round(Number(cue.durationTicks || 1) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND)
                        );
                    } else if (cue.fx === 'burrow-dust' || cue.fx === 'burrow-emerge-dust') {
                        this.createBurrowDustEffect(
                            cue.anchor === 'target' ? targetCard : monsterImg,
                            cue.fx === 'burrow-emerge-dust' ? 'emerge' : 'enter',
                            Math.round(Number(cue.durationTicks || 1) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND)
                        );
                    } else if (cue.fx === 'part-dust') {
                        this.createMonsterPartDustEffect(
                            monsterImg,
                            cue.anchor || 'head',
                            Math.round(Number(cue.durationTicks || 1) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND)
                        );
                    } else if (cue.fx === 'target-impact-dust') {
                        const impactEvents = Array.isArray(pattern.runtimeResolvedImpactTimeline)
                            ? pattern.runtimeResolvedImpactTimeline : [];
                        const sameTickEvents = impactEvents.filter(event =>
                            Number.isFinite(Number(event?.atTicks))
                            && Number(event.atTicks) === Number(cue.atTicks));
                        const matchingEvents = sameTickEvents.length
                            ? sameTickEvents
                            : impactEvents.filter(event => event?.targetMode === cue.targetMode);
                        const fallbackTargetIndices = Array.isArray(targets)
                            ? targets.map(target => target?.index).filter(Number.isInteger)
                            : [];
                        const resolvedImpactTargets = matchingEvents
                            .flatMap(event => event?.targetIndices || [])
                            .filter(Number.isInteger);
                        const resolvedTargetCards = [...new Set(
                            resolvedImpactTargets.length ? resolvedImpactTargets : fallbackTargetIndices
                        )]
                            .filter(Number.isInteger)
                            .map(index => this.card.querySelector?.(`#fight-card-${index}`))
                            .filter(Boolean);
                        const dustTargets = resolvedTargetCards.length
                            ? resolvedTargetCards
                            : [targetCard].filter(Boolean);
                        for (const dustTarget of dustTargets) {
                            this.createTargetImpactDustEffect(
                                dustTarget,
                                Math.round(Number(cue.durationTicks || 1) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND),
                                { angleMode: cue.angleMode }
                            );
                        }
                    } else if (cue.fx === 'part-swing-arc') {
                        const impactEvents = Array.isArray(pattern.runtimeResolvedImpactTimeline)
                            ? pattern.runtimeResolvedImpactTimeline : [];
                        const matchingEvent = impactEvents.find(event =>
                            Number(event?.atTicks) === Number(cue.atTicks)
                            && (!cue.targetMode || event?.targetMode === cue.targetMode))
                            || impactEvents.find(event => event?.targetMode === cue.targetMode);
                        const swingTargetIndex = matchingEvent?.targetIndices?.[0];
                        const swingTarget = Number.isInteger(swingTargetIndex)
                            ? this.card.querySelector?.(`#fight-card-${swingTargetIndex}`)
                            : targetCard;
                        this.createMonsterPartSwingArcEffect(
                            monsterImg,
                            cue.anchor || 'head',
                            swingTarget,
                            Math.round(Number(cue.durationTicks || 1) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND),
                            { angleMode: cue.angleMode }
                        );
                    } else if (cue.fx === 'tail-slam-arc') {
                        this.createTailSlamArcEffect(
                            monsterImg,
                            Math.round(Number(cue.durationTicks || 1) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND)
                        );
                    }
                }, Math.round(Number(cue.atTicks || 0) * 1000 / HuntMotionCompiler.TICKS_PER_SECOND));
            }
            for (const stride of built.strideWindows || []) {
                const tickMs = 1000 / HuntMotionCompiler.TICKS_PER_SECOND;
                this.animationTimers.timeout(() => {
                    if (this.motionGeneration !== audioGeneration) return;
                    monsterImg.style.setProperty('--monster-stride-cycle', `${stride.intervalTicks * tickMs * 2}ms`);
                    monsterImg.classList.remove('monster-beat-stride-flip');
                    void monsterImg.offsetWidth;
                    monsterImg.classList.add('monster-beat-stride-flip');
                }, Math.round(stride.startTicks * tickMs));
                this.animationTimers.timeout(() => {
                    monsterImg.classList.remove('monster-beat-stride-flip');
                    monsterImg.style.removeProperty('--monster-stride-cycle');
                }, Math.round(stride.endTicks * tickMs));
            }
        }

        if (pattern?.runtimePreviewMotionOnly && !pattern?.runtimePreviewScrub) {
            // The editor shows judgment ownership without invoking the live
            // hunter reaction path. Markers share the authored impact ticks.
            this.schedulePreviewJudgmentMarkers(pattern);
        }
        return Object.freeze({
            id: profileId || pattern.id || 'beat-motion',
            duration: built.durationMs,
            ultimate: Boolean(pattern?.tags?.includes('ultimate')),
            aim: false,
            rig: { id: rig },
            delivery: pattern?.delivery || null,
            beats: built
        });
    }

    seekBeatMotion(progress = 0) {
        const controller = this.activeBeatMotionPreview;
        if (controller?.animations?.length) {
            this.freezeBeatMotionPreview(controller, progress);
            return true;
        }
        return this.freezeKeyframeMotionPreview(progress);
    }

    freezeKeyframeMotionPreview(progress = 0) {
        const active = this.activeMonsterMotion;
        if (!active?.element) return false;
        active.scrubbing = true;
        if (active.timeoutId !== undefined) {
            this.animationTimers.clear?.(active.timeoutId);
            active.timeoutId = undefined;
        }
        const ratio = Math.max(0, Math.min(1, Number(progress) || 0));
        if (active.retimedAnimations?.length) {
            active.retimedAnimations.forEach(animation => {
                try {
                    animation.pause();
                    animation.currentTime = active.durationMs * ratio;
                } catch (_) { /* detached retimed preview layer */ }
            });
            return true;
        }
        // Extracted keyframe graphs are authoritative for reviewed profile motion.
        // wyverns. Pause the actual class animation and seek it with a negative
        // delay; this works even in OBS/WebView builds where getAnimations() is
        // absent or returns no CSSAnimation objects.
        // Recreate the CSSAnimation after changing its negative delay. Merely
        // changing animation-delay on an already paused animation does not seek
        // currentTime consistently in Chromium/OBS; it can keep the old frame.
        active.element.classList.remove(active.motionClass);
        active.element.style.setProperty('animation-delay', `${-active.durationMs * ratio}ms`, 'important');
        active.element.style.setProperty('animation-play-state', 'running', 'important');
        void active.element.offsetWidth;
        active.element.classList.add(active.motionClass);
        const pauseCssFrame = () => {
            if (this.activeMonsterMotion === active && active.scrubbing) {
                active.element.style.setProperty('animation-play-state', 'paused', 'important');
            }
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(pauseCssFrame);
        else pauseCssFrame();
        const animations = active.element.getAnimations?.({ subtree: true }) || [];
        for (const animation of animations) {
            try {
                animation.pause();
                const timing = animation.effect?.getComputedTiming?.();
                const duration = Number(timing?.activeDuration);
                animation.currentTime = (Number.isFinite(duration) && duration > 0
                    ? duration : active.durationMs) * ratio;
            } catch (_) { /* detached legacy preview layer */ }
        }
        return true;
    }

    freezeBeatMotionPreview(controller, progress = 0) {
        const ratio = Math.max(0, Math.min(1, Number(progress) || 0));
        controller?.animations?.forEach(animation => {
            try {
                animation.pause();
                animation.currentTime = controller.durationMs * ratio;
            } catch (_) { /* detached preview layer */ }
        });
        controller?.cssTracks?.forEach(track => {
            track.element.style.setProperty('animation-delay', `${-controller.durationMs * ratio}ms`, 'important');
            track.element.style.setProperty('animation-play-state', 'paused', 'important');
        });
    }

    playPatternMotion(monsterImg, targetCard, pattern, attackName, type, targets = []) {
        const renderedPattern = HuntMonsterAttackAnimator.motionFromCompiledBeat(pattern);
        if (Array.isArray(renderedPattern?.motion) && renderedPattern.motion.length) {
            const beatProfile = this.playBeatMotion(
                monsterImg, renderedPattern, renderedPattern.id, targetCard, targets
            );
            if (beatProfile) return beatProfile;
            // Authored BEAT motion is authoritative. Falling through to an old
            // CSS profile after a transient compile/DOM failure can execute a
            // second, differently timed choreography for the same action.
            this.traceMonsterMotion('skip', {
                reason: 'beat-motion-unavailable',
                patternId: pattern?.id || null
            }, true);
            return null;
        }
        const Catalog = typeof HuntMonsterAnimationCatalog !== 'undefined' ? HuntMonsterAnimationCatalog : null;
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog
            : null;
        if (!Catalog) {
            this.traceMonsterMotion('skip', { reason: 'catalog-missing', patternId: pattern?.id || null }, true);
            return null;
        }
        const profile = Catalog.resolve(pattern || {}, attackName, type, this.owner.selectedMonster || null);
        const motionElement = this.resolveMotionElement(monsterImg);
        if (!motionElement) {
            this.traceMonsterMotion('skip', { reason: 'motion-element-missing', patternId: pattern?.id || null }, true);
            return null;
        }
        const monsterRect = monsterImg.getBoundingClientRect();
        const targetAnchor = targetCard.querySelector?.('.game-hunt-weapon-img-container') || targetCard;
        const targetRect = targetAnchor.getBoundingClientRect();
        const geometry = pattern?.animationGeometry || {};
        let dx = targetRect.left + targetRect.width / 2 - (monsterRect.left + monsterRect.width / 2);
        let dy = targetRect.top + targetRect.height / 2 - (monsterRect.top + monsterRect.height / 2);
        if (geometry.anchor === 'arena-center-lower') {
            const arenaRect = this.card?.getBoundingClientRect?.();
            if (arenaRect) {
                dx = arenaRect.left + arenaRect.width / 2 - (monsterRect.left + monsterRect.width / 2);
                dy = arenaRect.top + arenaRect.height * Number(geometry.yRatio || .56)
                    - (monsterRect.top + monsterRect.height / 2);
            }
        }
        // 앵커 해석기가 이동 한계와 채팅 안전선을 단독으로 소유한다. 예전에는
        // maxX·-240·430이 애니메이터와 지오메트리 핸들러에 각각 복사돼 있어서,
        // 한쪽만 고치면 패스마다 다른 거리에서 멈추는 사고가 났다.
        const anchors = this.resolveStageAnchors(monsterImg);
        const maxX = anchors.maxX;
        motionElement?.style?.setProperty?.('--monster-lane-x', `${maxX}px`);
        const isUppercut = profile.id === 'horn-uppercut';
        const isSideTackle = profile.id === 'side-tackle-contact';
        const contactMotion = pattern?.tags?.includes('target-contact')
            || ['close-strike', 'horn-uppercut', 'horn-sweep-contact', 'side-tackle-contact'].includes(profile.id);
        const isTailMotion = ['tail-sweep', 'tail-sweep-double', 'tail-slam-rock'].includes(profile.id);
        const geometryNumber = (value, fallback) => Number.isFinite(Number(value))
            ? Number(value)
            : fallback;
        const approachScaleX = geometryNumber(
            geometry.approachX,
            isTailMotion ? .30 : (isUppercut ? 1 : (contactMotion ? .92 : .72))
        );
        const approachScaleY = geometryNumber(
            geometry.approachY,
            isTailMotion ? .30 : (isUppercut ? .92 : (contactMotion ? .88 : .58))
        );
        // Targeted strikes travel mainly across the wide monster lane. Their
        // downward component is capped so the enlarged impact frame cannot enter
        // OBS's bottom 15% chat-safe area; dedicated charge motions own their
        // intentional off-screen travel separately.
        const approachPoint = anchors.clamp(
            { x: dx * approachScaleX, y: dy * approachScaleY },
            contactMotion ? 'contact' : 'standoff');
        const attackX = approachPoint.x;
        const attackY = approachPoint.y;
        motionElement.style.setProperty('--monster-attack-x', `${attackX}px`);
        motionElement.style.setProperty('--monster-attack-y', `${attackY}px`);
        if (isSideTackle) {
            // Stop with 30% of the measured route still remaining, then drive
            // through the final distance without rotating the whole sprite.
            const readyRatio = geometryNumber(geometry.readyRatio, .7);
            motionElement.style.setProperty('--monster-side-ready-x', `${attackX * readyRatio}px`);
            motionElement.style.setProperty('--monster-side-ready-y', `${attackY * readyRatio}px`);
        }
        motionElement.style.setProperty('--monster-motion-duration', `${profile.duration}ms`);
        motionElement.dataset.monsterMotionProfile = profile.id;
        motionElement.dataset.monsterRig = profile.rig.id;
        if (pattern?.chargeLaunchStyle) {
            motionElement.dataset.chargeLaunchStyle = pattern.chargeLaunchStyle;
        } else {
            delete motionElement.dataset.chargeLaunchStyle;
        }
        let secondFacingX = 0;
        let tigrexRouteKeyframes = null;
        let tigrexStrideDelayMs = 0;
        const geometryChoreography = typeof HuntMonsterGeometryChoreography !== 'undefined'
            ? HuntMonsterGeometryChoreography
            : (typeof require === 'function' ? require('./HuntMonsterGeometryChoreography.js') : null);
        geometryChoreography?.[profile.id]?.({
            animator: this,
            motionElement,
            monsterImg,
            monsterRect,
            targetCard,
            targetAnchor,
            targetRect,
            pattern,
            profile,
            maxX,
            dx,
            dy,
            attackX,
            attackY,
            anatomy,
            anchors
        });
        if (profile.id === 'ground-charge' || profile.id === 'rathian-ground-charge' || profile.id === 'ground-charge-cross'
            || profile.id === 'ground-charge-zigzag' || profile.id === 'ground-charge-double'
            || profile.id === 'ground-charge-triple' || profile.id === 'aerial-charge-cross'
            || profile.id === 'legiana-drill-cross' || profile.id === 'tigrex-charge-chain'
            || profile.id === 'nargacuga-flank-charge' || profile.id === 'nargacuga-lunge-finish'
            || profile.id === 'nargacuga-offscreen-charge') {
            const cardRect = this.card.getBoundingClientRect();
            const targetIndex = Number(targetCard.id.replace(/\D+/g, '')) || 0;
            const crossGeometry = ['aerial-charge-cross', 'legiana-drill-cross'].includes(profile.id)
                ? this.screenCrossGeometry(monsterImg, pattern)
                : null;
            const authoredDirection = String(pattern?.runtimeSweepDirection || '');
            const direction = crossGeometry?.direction
                || (authoredDirection === 'left-to-right' ? 1
                : authoredDirection === 'right-to-left' ? -1
                    : targetIndex < 2 ? -1 : 1);
            const chargeBottom = Math.max(620, cardRect.bottom - monsterRect.top + monsterRect.height);
            const chargeTop = Math.max(420, monsterRect.bottom - cardRect.top + monsterRect.height);
            const chargeSide = Math.max(1150, cardRect.width * .72 + monsterRect.width);
            const clampRouteX = value => Math.max(-chargeSide * 1.35, Math.min(chargeSide * 1.35, value));
            const routePoint = rect => anchors.clamp({
                x: rect.left + rect.width / 2 - (monsterRect.left + monsterRect.width / 2),
                y: rect.top + rect.height / 2 - (monsterRect.top + monsterRect.height / 2)
            }, 'contact');
            const exitFromHome = point => {
                const scale = chargeBottom / Math.max(80, Math.abs(point.y));
                return { x: clampRouteX(point.x * scale), y: chargeBottom };
            };
            const exitPastPoint = (start, point) => {
                const dx = point.x - start.x;
                const dy = point.y - start.y;
                const boundaryY = dy >= 0 ? chargeBottom : -chargeTop;
                const verticalScale = Math.abs(dy) > 1
                    ? (boundaryY - point.y) / dy
                    : 0;
                if (Math.abs(dy) > 1 && verticalScale >= 0) {
                    return {
                        x: clampRouteX(point.x + dx * verticalScale),
                        y: boundaryY
                    };
                }
                const boundaryX = dx >= 0 ? chargeSide : -chargeSide;
                const horizontalScale = Math.abs(dx) > 1
                    ? (boundaryX - point.x) / dx
                    : 1;
                return {
                    x: boundaryX,
                    y: Math.max(-chargeTop, Math.min(chargeBottom, point.y + dy * horizontalScale))
                };
            };
            const firstPoint = routePoint(targetRect);
            const firstExit = exitFromHome(firstPoint);
            motionElement.style.setProperty('--monster-charge-bottom', `${chargeBottom}px`);
            motionElement.style.setProperty('--monster-charge-top', `${chargeTop}px`);
            motionElement.style.setProperty('--monster-charge-side', `${crossGeometry?.endOffset
                ?? direction * chargeSide}px`);
            motionElement.style.setProperty('--monster-charge-start-side', `${crossGeometry?.startOffset
                ?? direction * -Math.max(1050, cardRect.width * .68 + monsterRect.width)}px`);
            motionElement.style.setProperty('--monster-charge-first-x', `${firstPoint.x}px`);
            motionElement.style.setProperty('--monster-charge-first-y', `${firstPoint.y}px`);
            motionElement.style.setProperty('--monster-charge-first-exit-x', `${firstExit.x}px`);
            motionElement.style.setProperty('--monster-charge-first-exit-y', `${firstExit.y}px`);
            motionElement.style.setProperty('--monster-charge-return-x', `${firstExit.x * -.12}px`);
            motionElement.style.setProperty('--monster-charge-return-y', `${-chargeTop}px`);
            if (['aerial-charge-cross', 'legiana-drill-cross'].includes(profile.id)) {
                const targetRows = (pattern?.runtimeSweepDirection
                    ? [...this.card.querySelectorAll('.game-hunt-weapon-card')]
                    : [targetCard])
                    .map(card => (card.querySelector('.game-hunt-weapon-img-container') || card).getBoundingClientRect());
                const rowY = targetRows.length
                    ? targetRows.reduce((sum, rect) => sum + rect.top + rect.height / 2, 0) / targetRows.length
                    : targetRect.top + targetRect.height / 2;
                const monsterCenterY = monsterRect.top + monsterRect.height / 2;
                const rotatedScaledRadius = Math.hypot(monsterRect.width, monsterRect.height) * .56;
                const safeCrossMax = cardRect.bottom - monsterCenterY - rotatedScaledRadius - 3;
                const crossY = Math.max(-80, Math.min(safeCrossMax,
                    rowY - monsterCenterY));
                motionElement.style.setProperty('--monster-charge-cross-y', `${crossY}px`);
                motionElement.style.setProperty('--monster-charge-tilt', `${direction * 7}deg`);
            }
            if (profile.id === 'ground-charge-double') {
                const anchors = Array.isArray(pattern?.runtimeChargeAnchors) ? pattern.runtimeChargeAnchors : [];
                const firstTarget = this.card.querySelector(`#fight-card-${anchors[0]}`);
                const firstAnchor = firstTarget?.querySelector('.game-hunt-weapon-img-container') || firstTarget || targetAnchor;
                const secondTarget = this.card.querySelector(`#fight-card-${anchors[1]}`);
                const secondAnchor = secondTarget?.querySelector('.game-hunt-weapon-img-container') || secondTarget || targetAnchor;
                const authoredFirstPoint = routePoint(firstAnchor.getBoundingClientRect());
                const secondRect = secondAnchor.getBoundingClientRect();
                const authoredFirstExit = exitFromHome(authoredFirstPoint);
                const secondPoint = routePoint(secondRect);
                const secondExit = exitPastPoint(authoredFirstExit, secondPoint);
                secondFacingX = secondPoint.x;
                motionElement.style.setProperty('--monster-charge-first-x', `${authoredFirstPoint.x}px`);
                motionElement.style.setProperty('--monster-charge-first-y', `${authoredFirstPoint.y}px`);
                motionElement.style.setProperty('--monster-charge-first-exit-x', `${authoredFirstExit.x}px`);
                motionElement.style.setProperty('--monster-charge-first-exit-y', `${authoredFirstExit.y}px`);
                motionElement.style.setProperty('--monster-charge-second-x', `${secondPoint.x}px`);
                motionElement.style.setProperty('--monster-charge-second-y', `${secondPoint.y}px`);
                motionElement.style.setProperty('--monster-charge-second-exit-x', `${secondExit.x}px`);
                motionElement.style.setProperty('--monster-charge-second-exit-y', `${secondExit.y}px`);
                motionElement.style.setProperty('--monster-charge-return-x', `${secondExit.x * -.12}px`);
            }
            if (profile.id === 'ground-charge-triple') {
                const anchors = Array.isArray(pattern?.runtimeChargeAnchors) ? pattern.runtimeChargeAnchors : [];
                const anchorRect = (anchorIndex, fallback) => {
                    const card = this.card.querySelector(`#fight-card-${anchorIndex}`);
                    const anchor = card?.querySelector('.game-hunt-weapon-img-container') || card;
                    return anchor?.getBoundingClientRect?.() || fallback;
                };
                const firstRect = anchorRect(anchors[0], targetRect);
                const secondRect = anchorRect(anchors[1], firstRect);
                const thirdRect = anchorRect(anchors[2], secondRect);
                const first = routePoint(firstRect);
                const second = routePoint(secondRect);
                const third = routePoint(thirdRect);
                // Every pass is a complete straight charge: contact the hunter,
                // continue along the same vector beyond the screen, then start
                // the next independently calculated line from that off-screen
                // endpoint. Never use a hunter contact point as a turn vertex.
                const firstExit = exitFromHome(first);
                const secondExit = exitPastPoint(firstExit, second);
                const thirdExit = exitPastPoint(secondExit, third);
                const directionOr = (dx, fallback) => Math.sign(dx) || fallback || -1;
                const firstDirection = directionOr(first.x, -1);
                const secondDirection = directionOr(second.x - firstExit.x, -firstDirection);
                const thirdDirection = directionOr(third.x - secondExit.x, -secondDirection);
                pattern.runtimeChargeFacingDirections = [
                    firstDirection,
                    secondDirection,
                    thirdDirection
                ];
                secondFacingX = second.x;
                motionElement.style.setProperty('--monster-charge-first-x', `${first.x}px`);
                motionElement.style.setProperty('--monster-charge-first-y', `${first.y}px`);
                motionElement.style.setProperty('--monster-charge-first-exit-x', `${firstExit.x}px`);
                motionElement.style.setProperty('--monster-charge-first-exit-y', `${firstExit.y}px`);
                motionElement.style.setProperty('--monster-charge-second-x', `${second.x}px`);
                motionElement.style.setProperty('--monster-charge-second-y', `${second.y}px`);
                motionElement.style.setProperty('--monster-charge-second-exit-x', `${secondExit.x}px`);
                motionElement.style.setProperty('--monster-charge-second-exit-y', `${secondExit.y}px`);
                motionElement.style.setProperty('--monster-charge-third-x', `${third.x}px`);
                motionElement.style.setProperty('--monster-charge-third-y', `${third.y}px`);
                motionElement.style.setProperty('--monster-charge-third-exit-x', `${thirdExit.x}px`);
                motionElement.style.setProperty('--monster-charge-third-exit-y', `${thirdExit.y}px`);
            }
            if (profile.id === 'tigrex-charge-chain') {
                const sequence = Array.isArray(pattern?.runtimeImpactTargetSequence)
                    ? pattern.runtimeImpactTargetSequence
                    : [];
                const passCount = Math.max(2, Math.min(3,
                    Number(pattern?.targeting?.passCountByState?.[this.owner.monsterState])
                    || sequence.length
                    || 2));
                const sequenceIndex = passIndex => {
                    const pass = sequence[passIndex];
                    if (Array.isArray(pass)) return Number(pass[0]?.index ?? pass[0]);
                    return Number(pass?.index ?? pass);
                };
                const pointForPass = (passIndex, fallback) => {
                    const index = sequenceIndex(passIndex);
                    const card = Number.isInteger(index)
                        ? this.card.querySelector(`#fight-card-${index}`)
                        : null;
                    const anchor = card?.querySelector('.game-hunt-weapon-img-container') || card;
                    return anchor?.getBoundingClientRect
                        ? routePoint(anchor.getBoundingClientRect())
                        : fallback;
                };
                const points = [pointForPass(0, firstPoint)];
                points.push(pointForPass(1, points[0]));
                if (passCount === 3) points.push(pointForPass(2, points[1]));
                const firstDistance = Math.max(1, Math.hypot(points[0].x, points[0].y));
                const launchRecoilDistance = 56;
                const launchRecoil = {
                    x: -points[0].x / firstDistance * launchRecoilDistance,
                    y: -points[0].y / firstDistance * launchRecoilDistance
                };
                motionElement.style.setProperty('--tigrex-launch-recoil-x',
                    `${launchRecoil.x}px`);
                motionElement.style.setProperty('--tigrex-launch-recoil-y',
                    `${launchRecoil.y}px`);
                const exits = [];
                exits.push(exitPastPoint({ x: 0, y: 0 }, points[0]));
                for (let index = 1; index < points.length; index += 1) {
                    exits.push(exitPastPoint(exits[index - 1], points[index]));
                }
                points.forEach((point, index) => {
                    const ordinal = index + 1;
                    motionElement.style.setProperty(`--tigrex-pass-${ordinal}-x`, `${point.x}px`);
                    motionElement.style.setProperty(`--tigrex-pass-${ordinal}-y`, `${point.y}px`);
                    motionElement.style.setProperty(`--tigrex-exit-${ordinal}-x`, `${exits[index].x}px`);
                    motionElement.style.setProperty(`--tigrex-exit-${ordinal}-y`, `${exits[index].y}px`);
                });
                const lastPoint = points[points.length - 1];
                const lastExit = exits[exits.length - 1];
                const branchApproachRatio = .84;
                const branchPoint = {
                    x: lastExit.x + (lastPoint.x - lastExit.x) * branchApproachRatio,
                    y: lastExit.y + (lastPoint.y - lastExit.y) * branchApproachRatio
                };
                const finalPassStart = exits[Math.max(0, exits.length - 2)] || { x: 0, y: 0 };
                const finalPassTravelRatio = passCount === 3 ? .11 : .16;
                pattern.runtimeTigrexBranchApproachDurationMs =
                    HuntMonsterAttackAnimator.tigrexBranchApproachDurationMs(
                        finalPassStart,
                        lastPoint,
                        lastExit,
                        branchPoint,
                        profile.duration,
                        finalPassTravelRatio
                    );
                motionElement.style.setProperty('--tigrex-branch-x',
                    `${branchPoint.x}px`);
                motionElement.style.setProperty('--tigrex-branch-y',
                    `${branchPoint.y}px`);
                motionElement.style.setProperty('--tigrex-branch-last-exit-x', `${lastExit.x}px`);
                motionElement.style.setProperty('--tigrex-branch-last-exit-y', `${lastExit.y}px`);
                motionElement.dataset.tigrexBranchApproachMs =
                    String(pattern.runtimeTigrexBranchApproachDurationMs);
                if (pattern?.branchKind === 'bite') {
                    const mouthPoint = anatomy?.visualPoint?.(this.owner?.selectedMonster, 'mouth', 0)
                        || { x: .5, y: .5 };
                    const biteRoute = HuntMonsterAttackAnimator.tigrexBiteRoute(
                        lastExit, lastPoint, monsterRect, mouthPoint);
                    motionElement.style.setProperty('--tigrex-bite-contact-x', `${biteRoute.contact.x}px`);
                    motionElement.style.setProperty('--tigrex-bite-contact-y', `${biteRoute.contact.y}px`);
                    motionElement.style.setProperty('--tigrex-bite-finish-x', `${biteRoute.finish.x}px`);
                    motionElement.style.setProperty('--tigrex-bite-finish-y', `${biteRoute.finish.y}px`);
                }
                const passDirections = HuntMonsterAttackAnimator.tigrexRouteDirections(points, exits);
                const branchDirection = Math.sign(branchPoint.x - lastExit.x)
                    || passDirections[passDirections.length - 1]
                    || -1;
                pattern.runtimeTigrexFacingDirections = [...passDirections, branchDirection];
                tigrexRouteKeyframes = HuntMonsterAttackAnimator.tigrexChargeRouteKeyframes(
                    points, exits, launchRecoil, passCount);
                const routeSpeedPxPerMs = Number(
                    tigrexRouteKeyframes.speedPerNormalizedDuration || 1) / profile.duration;
                const branchApproachDistance = Math.hypot(
                    branchPoint.x - lastExit.x,
                    branchPoint.y - lastExit.y
                );
                pattern.runtimeTigrexBranchApproachDurationMs = Math.max(280,
                    Math.round(branchApproachDistance / Math.max(.01, routeSpeedPxPerMs)));
                pattern.runtimeTigrexRouteExitDelayMs = profile.duration
                    * Number(tigrexRouteKeyframes.routeExitOffset || 0);
                motionElement.dataset.tigrexBranchApproachMs =
                    String(pattern.runtimeTigrexBranchApproachDurationMs);
                tigrexStrideDelayMs = Math.round(profile.duration * (passCount === 3 ? .09 : .10));
                motionElement.style.setProperty('--tigrex-stride-delay', `${tigrexStrideDelayMs}ms`);
                const timeline = (pattern?.beatV2Enabled === true || pattern?.beatV2Approved === true)
                    ? []
                    : Array.isArray(pattern.runtimeResolvedImpactTimeline)
                    ? pattern.runtimeResolvedImpactTimeline
                    : [];
                // Engine ticks stay at 100 ms. The profile duration is already
                // visually scaled, so scaling the tick divisor again resolves
                // damage before the sprite reaches the hunter.
                const runtimeTickMs = 1000 / Math.max(1,
                    Number(typeof HuntAtbConfig !== 'undefined'
                        ? HuntAtbConfig.TICKS_PER_SECOND
                        : 10));
                const passEvents = timeline.filter(event =>
                    /^tigrex-charge-(?:pass|return)$/.test(event.eventKind || ''));
                passEvents.forEach((event, index) => {
                    const offset = tigrexRouteKeyframes.impactOffsets?.[index];
                    if (Number.isFinite(offset)) {
                        event.atTicks = Math.max(1, Math.round(offset * profile.duration / runtimeTickMs));
                    }
                });
                const branchEvent = timeline.find(event =>
                    /^tigrex-(?:rock|spin|bite)$/.test(event.eventKind || ''));
                if (branchEvent) {
                    const scaledBranchDuration = typeof HuntAtbConfig !== 'undefined'
                        && HuntAtbConfig.scaleVisualDurationMs
                        ? HuntAtbConfig.scaleVisualDurationMs(branchEvent.animationDurationMs || 0)
                        : Number(branchEvent.animationDurationMs || 0);
                    const branchImpactMs = pattern.runtimeTigrexRouteExitDelayMs
                        + pattern.runtimeTigrexBranchApproachDurationMs
                        + scaledBranchDuration * Number(branchEvent.animationImpactRatio || .6);
                    branchEvent.atTicks = Math.max(1, Math.ceil(branchImpactMs / runtimeTickMs));
                    const secondBite = timeline.find(event => event.eventKind === 'tigrex-bite-second');
                    if (secondBite) secondBite.atTicks = branchEvent.atTicks + 5;
                }
                motionElement.dataset.tigrexChargePasses = String(passCount);
                secondFacingX = points[points.length - 1]?.x ?? points[0].x;
            }
        }
        const motionClass = `monster-motion-${profile.id}`;
        const useDynamicTigrexRoute = Boolean(
            tigrexRouteKeyframes?.length && typeof motionElement.animate === 'function');
        const ProfileMotionRuntime = typeof HuntMonsterProfileMotionRuntime !== 'undefined'
            ? HuntMonsterProfileMotionRuntime
            : (typeof require === 'function' ? require('./HuntMonsterProfileMotionRuntime.js') : null);
        const profileGraphFrames = !useDynamicTigrexRoute
            ? ProfileMotionRuntime?.frames?.(profile.id, pattern, profile.rig.id) : null;
        const profileGraphTiming = ProfileMotionRuntime?.timing?.(profile.id) || {};
        const activeMotion = this.startMonsterMotion(
            motionElement,
            motionClass,
            profile.duration,
            null,
            {
                patternId: pattern?.id || null,
                disableCssAnimation: useDynamicTigrexRoute || Boolean(profileGraphFrames?.length)
            }
        );
        if (useDynamicTigrexRoute) {
            try {
                const routeAnimation = motionElement.animate(tigrexRouteKeyframes, {
                    duration: profile.duration,
                    easing: 'linear',
                    fill: 'both'
                });
                activeMotion.finishers.push(() => {
                    try { routeAnimation.cancel(); } catch (_) { /* detached OBS node */ }
                });
                motionElement.dataset.tigrexRouteOffsets = tigrexRouteKeyframes
                    .map(frame => Number(frame.offset).toFixed(4)).join('|');
            } catch (error) {
                // Never leave the wrapper at animation:none with only the child
                // stride flip running. Invalid/unsupported WAAPI keyframes fall
                // back to the authored CSS route so the charge still travels.
                motionElement.style.removeProperty('animation');
                void motionElement.offsetWidth;
                activeMotion.expectedAnimationNames = new Set([
                    Number(motionElement.dataset.tigrexChargePasses) === 3
                        ? 'tigrex-charge-chain-three'
                        : 'tigrex-charge-chain'
                ]);
                motionElement.dataset.tigrexRouteFallback = 'css';
                this.traceMonsterMotion('route-fallback', {
                    generation: activeMotion.generation,
                    motionClass,
                    patternId: pattern?.id || null,
                    reason: String(error?.message || error || 'waapi-failed')
                });
            }
        } else if (profileGraphFrames?.length) {
            this.playProfileGraphMotion(activeMotion, pattern, profile, profileGraphFrames, profileGraphTiming);
        } else {
            this.traceMonsterMotion('profile-graph-missing', {
                generation: activeMotion.generation,
                motionClass,
                patternId: pattern?.id || null,
                profileId: profile.id
            });
        }
        // Stride is a continuous locomotion loop, not a legacy pattern-start
        // cue. Keep it bound to the authored 0.3 s gait while BEAT owns the
        // action milestones and impact audio.
        if (profile.id === 'tigrex-charge-chain') {
            this.scheduleTigrexStrideAudio(activeMotion, tigrexStrideDelayMs);
        }
        this.startFacingMotion(monsterImg, profile, pattern, attackX, secondFacingX, activeMotion);
        return profile;
    }

    positionBurrowEmergence(motionElement, monsterImg, targetAnchor, stage) {
        if (!motionElement?.style || !monsterImg || !targetAnchor) return null;
        const monsterRect = monsterImg.getBoundingClientRect();
        const targetRect = targetAnchor.getBoundingClientRect();
        const monsterCenterX = monsterRect.left + monsterRect.width / 2;
        const monsterCenterY = monsterRect.top + monsterRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;
        // 이동 한계는 앵커 해석기가 소유한다. 세로는 지면에서 솟는 궤적이 스스로
        // 정하므로 클램프하지 않는다.
        const maxX = this.resolveStageAnchors(monsterImg).maxX;
        const targetX = Math.max(-maxX, Math.min(maxX, targetCenterX - monsterCenterX));
        const targetY = targetCenterY - monsterCenterY;
        // The emergence crosses the hunter only slightly: its apex is exactly
        // 20% of the measured hunter/weapon anchor height above that target.
        const apexY = targetY - targetRect.height * .2;
        motionElement.style.setProperty('--monster-burrow-target-x', `${targetX}px`);
        motionElement.style.setProperty('--monster-burrow-target-y', `${targetY}px`);
        motionElement.style.setProperty('--monster-burrow-apex-y', `${apexY}px`);
        return { targetX, targetY, apexY };
    }

    createBurrowDustEffect(anchor, phase = 'enter', durationMs = 1250) {
        const monsterImg = this.card?.querySelector?.('#fight-monster-img');
        const stage = monsterImg?.closest?.('.hunt-monster-motion-stage')
            || this.card?.querySelector?.('#monster-showcase-panel');
        if (!anchor || !stage) return null;
        const stageRect = stage.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        const dust = document.createElement('div');
        dust.className = `monster-burrow-dust is-${phase}`;
        dust.style.left = `${anchorRect.left - stageRect.left + anchorRect.width / 2}px`;
        dust.style.top = `${anchorRect.top - stageRect.top + anchorRect.height * 0.78}px`;
        dust.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
        stage.appendChild(dust);
        this.createLocalEmojiFx(stage, '☁️', 'burrow-cloud', Math.max(900, Number(durationMs || 1250)), {
            left: dust.style.left,
            top: dust.style.top
        });
        void dust.offsetWidth;
        dust.classList.add('is-playing');
        this.animationTimers.timeout(() => dust.remove(), Math.max(300, Number(durationMs || 1250) + 180));
        return dust;
    }

    createMonsterPartDustEffect(monsterImg, partKind = 'head', durationMs = 600) {
        const stage = monsterImg?.closest?.('.hunt-monster-motion-stage')
            || this.card?.querySelector?.('#monster-showcase-panel');
        if (!monsterImg || !stage) return null;
        const stageRect = stage.getBoundingClientRect();
        const imageRect = monsterImg.getBoundingClientRect();
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog : null;
        const point = anatomy?.visualPoint?.(this.owner?.selectedMonster, partKind, 0)
            || anatomy?.visualPoint?.(this.owner?.selectedMonster, 'head', 0)
            || { x: .5, y: .45 };
        const dust = document.createElement('div');
        dust.className = 'monster-part-impact-dust';
        dust.style.left = `${imageRect.left - stageRect.left + imageRect.width * point.x}px`;
        dust.style.top = `${imageRect.top - stageRect.top + imageRect.height * point.y}px`;
        dust.style.setProperty('--part-dust-duration', `${Math.max(320, Number(durationMs) || 600)}ms`);
        dust.innerHTML = '<i></i><i></i><i></i><i></i><i></i><b></b>';
        stage.appendChild(dust);
        void dust.offsetWidth;
        dust.classList.add('is-playing');
        this.animationTimers.timeout(() => dust.remove(), Math.max(420, Number(durationMs || 600) + 120));
        return dust;
    }

    createTargetImpactDustEffect(targetCard, durationMs = 600, options = {}) {
        if (!targetCard) return null;
        const weapon = targetCard.querySelector?.('.game-hunt-weapon-img-container');
        const fxStage = targetCard.closest?.('.hunt-combat-board') || this.card || targetCard;
        const stageRect = fxStage.getBoundingClientRect?.();
        const weaponRect = weapon?.getBoundingClientRect?.();
        const monsterRect = (this.card?.querySelector?.('#fight-monster-img')
            || this.card?.querySelector?.('.hunt-monster-img'))?.getBoundingClientRect?.();
        const dust = document.createElement('div');
        dust.className = 'monster-part-impact-dust hunter-target-impact-dust';
        // Keep target impact FX outside the weapon transform/isolation layer.
        // Hit knockback, guard recoil and split-weapon transforms can otherwise
        // clip or bury a correctly timed dust node. Measure the live weapon
        // centre, then place the effect in the hunter card's top FX layer.
        const hasLiveRects = stageRect && weaponRect
            && Number.isFinite(stageRect.left) && Number.isFinite(weaponRect.left);
        dust.style.left = hasLiveRects
            ? `${weaponRect.left - stageRect.left + weaponRect.width / 2}px`
            : '50%';
        dust.style.top = hasLiveRects
            ? `${weaponRect.top - stageRect.top + weaponRect.height * .58}px`
            : '52%';
        if (weaponRect && monsterRect) {
            const targetX = weaponRect.left + weaponRect.width / 2;
            const monsterX = monsterRect.left + monsterRect.width / 2;
            const impactAngle = options.angleMode === 'upward-diagonal'
                ? (targetX < monsterX ? -125 : -55)
                : Math.atan2(
                    weaponRect.top + weaponRect.height * .58 - (monsterRect.top + monsterRect.height / 2),
                    targetX - monsterX
                ) * 180 / Math.PI;
            dust.style.setProperty('--impact-angle', `${impactAngle.toFixed(2)}deg`);
        }
        dust.style.setProperty('--part-dust-duration', `${Math.max(320, Number(durationMs) || 600)}ms`);
        dust.innerHTML = '<i></i><i></i><i></i><i></i><i></i><b></b><em><u></u><u></u><u></u></em>';
        dust.dataset.targetCard = targetCard.id || '';
        fxStage.appendChild(dust);
        void dust.offsetWidth;
        dust.classList.add('is-playing');
        this.animationTimers.timeout(() => dust.remove(), Math.max(420, Number(durationMs || 600) + 120));
        return dust;
    }

    createMonsterPartSwingArcEffect(monsterImg, partKind = 'head', targetCard = null, durationMs = 500,
        options = {}) {
        const stage = monsterImg?.closest?.('.hunt-monster-motion-stage')
            || this.card?.querySelector?.('#monster-showcase-panel');
        if (!monsterImg || !stage) return null;
        const stageRect = stage.getBoundingClientRect();
        const imageRect = monsterImg.getBoundingClientRect();
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog : null;
        const point = anatomy?.visualPoint?.(this.owner?.selectedMonster, partKind, 0)
            || { x: .5, y: .5 };
        const originX = imageRect.left - stageRect.left + imageRect.width * point.x;
        const originY = imageRect.top - stageRect.top + imageRect.height * point.y;
        const targetRect = (targetCard?.querySelector?.('.game-hunt-weapon-img-container')
            || targetCard)?.getBoundingClientRect?.();
        const targetX = targetRect ? targetRect.left + targetRect.width / 2 - stageRect.left : originX + 120;
        const targetY = targetRect ? targetRect.top + targetRect.height / 2 - stageRect.top : originY;
        const angle = options.angleMode === 'upward-diagonal'
            ? (targetX < originX ? -125 : -55)
            : Math.atan2(targetY - originY, targetX - originX) * 180 / Math.PI;
        const arc = document.createElement('div');
        arc.className = 'monster-part-swing-arc';
        arc.style.left = `${originX}px`;
        arc.style.top = `${originY}px`;
        arc.style.setProperty('--swing-angle', `${angle.toFixed(2)}deg`);
        arc.style.setProperty('--swing-duration', `${Math.max(280, Number(durationMs) || 500)}ms`);
        arc.innerHTML = '<i></i><i></i><i></i>';
        stage.appendChild(arc);
        void arc.offsetWidth;
        arc.classList.add('is-playing');
        this.animationTimers.timeout(() => arc.remove(), Math.max(400, Number(durationMs || 500) + 120));
        return arc;
    }

    createTailSlamArcEffect(monsterImg, durationMs = 400) {
        const stage = monsterImg?.closest?.('.hunt-monster-motion-stage')
            || this.card?.querySelector?.('#monster-showcase-panel');
        if (!monsterImg || !stage) return null;
        const stageRect = stage.getBoundingClientRect();
        const imageRect = monsterImg.getBoundingClientRect();
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog : null;
        const tail = anatomy?.visualPoint?.(this.owner?.selectedMonster, 'tail', 0)
            || { x: .72, y: .18 };
        const arc = document.createElement('div');
        arc.className = 'monster-tail-slam-arc';
        arc.style.left = `${imageRect.left - stageRect.left + imageRect.width * tail.x}px`;
        arc.style.top = `${imageRect.top - stageRect.top + imageRect.height * tail.y}px`;
        arc.style.setProperty('--tail-slam-duration', `${Math.max(280, Number(durationMs) || 400)}ms`);
        arc.innerHTML = '<i></i><i></i><i></i><b>💥</b>';
        stage.appendChild(arc);
        void arc.offsetWidth;
        arc.classList.add('is-playing');
        const duration = Math.max(280, Number(durationMs) || 400);
        this.animationTimers.timeout(() => this.createMonsterPartDustEffect(monsterImg, 'tail', 620),
            Math.round(duration * .78));
        this.animationTimers.timeout(() => arc.remove(), duration + 220);
        return arc;
    }

    createBurrowTrackingDustEffect(fromAnchor, targetAnchor, durationMs = 800) {
        const monsterImg = this.card?.querySelector?.('#fight-monster-img');
        const stage = monsterImg?.closest?.('.hunt-monster-motion-stage')
            || this.card?.querySelector?.('#monster-showcase-panel');
        if (!fromAnchor || !targetAnchor || !stage) return null;
        const stageRect = stage.getBoundingClientRect();
        const fromRect = fromAnchor.getBoundingClientRect();
        const targetRect = targetAnchor.getBoundingClientRect();
        const startX = fromRect.left - stageRect.left + fromRect.width / 2;
        const startY = fromRect.top - stageRect.top + fromRect.height * .78;
        const targetX = targetRect.left - stageRect.left + targetRect.width / 2;
        const targetY = targetRect.top - stageRect.top + targetRect.height * .82;
        const dust = document.createElement('div');
        dust.className = 'monster-burrow-dust is-track';
        dust.style.left = `${startX}px`;
        dust.style.top = `${startY}px`;
        dust.style.setProperty('--burrow-track-x', `${targetX - startX}px`);
        dust.style.setProperty('--burrow-track-y', `${targetY - startY}px`);
        dust.style.setProperty('--burrow-track-duration', `${Math.max(300, Number(durationMs) || 800)}ms`);
        dust.innerHTML = '<i></i><i></i><i></i><i></i><b></b>';
        stage.appendChild(dust);
        void dust.offsetWidth;
        dust.classList.add('is-playing');
        this.animationTimers.timeout(() => dust.remove(), Math.max(480, Number(durationMs || 800) + 180));
        return dust;
    }

    triggerMonsterBurrowPhase(phase, targetIndex = null, durationMs = 0) {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('#fight-monster-img');
        const stage = monsterImg?.closest('.hunt-monster-motion-stage')
            || this.card.querySelector('#monster-showcase-panel');
        if (!monsterImg || !stage) {
            this.traceMonsterMotion('skip', {
                reason: !monsterImg ? 'burrow-monster-missing' : 'burrow-stage-missing',
                phase
            }, true);
            return;
        }
        const motionElement = this.resolveMotionElement(monsterImg);

        const clearDust = () => stage.querySelectorAll('.monster-burrow-dust').forEach(node => node.remove());
        const clearBurrowPosition = () => {
            motionElement.style.removeProperty('--monster-burrow-target-x');
            motionElement.style.removeProperty('--monster-burrow-target-y');
            motionElement.style.removeProperty('--monster-burrow-apex-y');
        };
        if (phase === 'cancel') {
            this.motionGeneration++;
            this.clearActiveMonsterMotion();
            clearDust();
            clearBurrowPosition();
            this.card.classList.remove('hunt-monster-underground');
            motionElement.classList.remove('monster-motion-burrow-enter', 'monster-motion-burrow-emerge');
            motionElement.style.removeProperty('transform');
            motionElement.style.removeProperty('opacity');
            return;
        }

        const targetCard = Number.isInteger(targetIndex)
            ? this.card.querySelector(`#fight-card-${targetIndex}`)
            : null;
        const anchor = targetCard?.querySelector('.game-hunt-weapon-img-container') || monsterImg;
        const dust = this.createBurrowDustEffect(anchor, phase, durationMs || (phase === 'enter' ? 1250 : 1450));
        const scaledDuration = typeof HuntAtbConfig !== 'undefined' && HuntAtbConfig.scaleVisualDurationMs
            ? HuntAtbConfig.scaleVisualDurationMs(durationMs || (phase === 'enter' ? 1250 : 1450))
            : Number(durationMs || (phase === 'enter' ? 1250 : 1450));
        motionElement.style.setProperty('--monster-motion-duration', `${scaledDuration}ms`);

        if (phase === 'enter') {
            this.card.classList.add('hunt-monster-underground');
        } else if (phase === 'telegraph') {
            this.animationTimers.timeout(() => dust?.remove(), Math.max(300, scaledDuration + 180));
            return;
        } else if (phase === 'emerge') {
            this.card.classList.remove('hunt-monster-underground');
            this.positionBurrowEmergence(motionElement, monsterImg, anchor, stage);
        }

        const motionClass = phase === 'enter' ? 'monster-motion-burrow-enter' : 'monster-motion-burrow-emerge';
        const finish = () => {
            if (phase === 'emerge') this.card?.classList.remove('hunt-monster-underground');
            if (phase === 'emerge') clearBurrowPosition();
            dust?.remove();
        };
        const active = this.activeMonsterMotion;
        if (active?.element === motionElement && active.motionClass === motionClass) {
            active.finishers.push(finish);
            return;
        }
        this.startMonsterMotion(
            motionElement,
            motionClass,
            Math.max(600, scaledDuration),
            finish,
            { patternId: `burrow:${phase}` }
        );
    }

    schedulePreviewImpactCardReactions(pattern, targets = []) {
        const timeline = Array.isArray(pattern?.runtimeResolvedImpactTimeline)
            ? pattern.runtimeResolvedImpactTimeline : [];
        if (!timeline.length || !this.card) return;
        const ticksPerSecond = typeof HuntAtbConfig !== 'undefined'
            ? Math.max(1, Number(HuntAtbConfig.TICKS_PER_SECOND || 10)) : 10;
        const resultByIndex = new Map(targets.map(target => [Number(target.index), target.result]));
        const hasDirectDamage = Number(pattern?.damageRatio || 0) > 0;
        timeline.forEach(event => {
            if (Number(event?.damageScale ?? 1) <= 0) return;
            const indices = Array.isArray(event.targetIndices) ? event.targetIndices : [];
            this.animationTimers.timeout(() => {
                indices.forEach(index => {
                    const card = this.card?.querySelector(`#fight-card-${index}`);
                    const result = resultByIndex.get(Number(index));
                    const reaction = HuntMonsterAttackAnimator.previewReactionForAttackResult(result);
                    if (!card || !reaction) return;
                    if (!hasDirectDamage && pattern?.interference?.kind) return;
                    const guarded = reaction === 'guard';
                    const className = guarded
                        ? 'hunter-card-guard-shake' : 'hunter-card-hit-shake';
                    card.classList.remove('hunter-card-hit-shake', 'hunter-card-guard-shake');
                    card.querySelectorAll('.hunt-preview-impact-badge').forEach(badge => badge.remove());
                    void card.offsetWidth;
                    card.classList.add(className);
                    const badge = document.createElement('span');
                    badge.className = `hunt-preview-impact-badge${guarded ? ' is-guard' : ' is-hit'}`;
                    badge.textContent = guarded ? 'GUARD' : 'HIT';
                    badge.setAttribute('aria-hidden', 'true');
                    card.appendChild(badge);
                    this.animationTimers.timeout(() => card?.classList.remove(className),
                        className === 'hunter-card-guard-shake' ? 300 : 360);
                    this.animationTimers.timeout(() => badge?.remove(), guarded ? 520 : 620);
                });
            }, Math.max(0, Math.round(Number(event.atTicks || 0) * 1000 / ticksPerSecond)));
        });
        if (!hasDirectDamage && String(pattern?.interference?.kind || '').startsWith('roar')) {
            const firstTick = Math.min(...timeline.map(event => Number(event?.atTicks || 0)));
            this.animationTimers.timeout(() => this.triggerMonsterRoar(pattern),
                Math.max(0, Math.round(firstTick * 1000 / ticksPerSecond)));
        }
        this.schedulePreviewInterferenceReactions(pattern, targets, ticksPerSecond);
    }

    clearPreviewJudgmentMarkers() {
        this.card?.querySelectorAll?.('.hunt-preview-judgment-marker')?.forEach(marker => marker.remove());
    }

    schedulePreviewJudgmentMarkers(pattern) {
        const timeline = Array.isArray(pattern?.runtimeResolvedImpactTimeline)
            ? pattern.runtimeResolvedImpactTimeline : [];
        if (!timeline.length || !this.card) return;
        this.clearPreviewJudgmentMarkers();
        const ticksPerSecond = typeof HuntAtbConfig !== 'undefined'
            ? Math.max(1, Number(HuntAtbConfig.TICKS_PER_SECOND || 10)) : 10;
        const allCards = [...this.card.querySelectorAll('[id^="fight-card-"]')];
        const generation = this.motionGeneration;
        const labelFor = kind => ({
            damage: 'HIT',
            roar: '귀마개',
            tremor: '지진',
            wind: '풍압'
        }[kind] || String(kind || '').toUpperCase());
        timeline.forEach((event, eventIndex) => {
            const interference = event?.secondaryInterference || null;
            const kinds = [];
            if (Number(event?.damageScale ?? 0) > 0) kinds.push('damage');
            if (interference?.kind) kinds.push(String(interference.kind).replace(/-(?:small|large)$/, ''));
            if (!kinds.length) return;
            const targetIndices = Array.isArray(event?.targetIndices)
                ? event.targetIndices.filter(Number.isInteger)
                : [];
            const cards = interference?.scope === 'all'
                ? allCards
                : targetIndices.map(index => this.card.querySelector(`#fight-card-${index}`)).filter(Boolean);
            const atTicks = Math.max(0, Number(event?.atTicks || 0));
            this.animationTimers.timeout(() => {
                if (this.motionGeneration !== generation) return;
                for (const card of cards) {
                    const marker = document.createElement('span');
                    marker.className = 'hunt-preview-judgment-marker';
                    marker.dataset.atTicks = String(atTicks);
                    marker.dataset.eventIndex = String(eventIndex);
                    marker.textContent = kinds.map(labelFor).join(' · ');
                    marker.setAttribute('aria-label', `${marker.textContent} ${atTicks}틱`);
                    card.appendChild(marker);
                    this.animationTimers.timeout(() => marker.remove(), 760);
                }
            }, Math.round(atTicks * 1000 / ticksPerSecond));
        });
    }

    schedulePreviewInterferenceReactions(pattern, targets = [], ticksPerSecond = 10) {
        const definitions = [pattern?.interference, pattern?.secondaryInterference]
            .filter(value => value?.kind);
        if (!definitions.length || !this.card) return;
        const allIndices = [...this.card.querySelectorAll('[id^="fight-card-"]')]
            .map(card => Number(String(card.id).replace('fight-card-', '')))
            .filter(Number.isInteger);
        const targetIndices = [...new Set(targets.map(target => Number(target.index)).filter(Number.isInteger))];
        const impactTicks = Array.isArray(pattern?.runtimeResolvedImpactTimeline)
            ? Number(pattern.runtimeResolvedImpactTimeline[0]?.atTicks || 0) : 0;
        definitions.forEach(definition => {
            const rawKind = String(definition.kind || '');
            const kind = rawKind.replace(/-(?:small|large)$/, '');
            const size = definition.size || (rawKind.endsWith('-large') ? 'large' : 'small');
            let elapsed = 0;
            let judgmentTick = null;
            for (const beat of (pattern.motion || [])) {
                const offset = Number(beat?.judgmentOffsets?.[kind]);
                if (Number.isFinite(offset)) {
                    judgmentTick = elapsed + Math.max(0, offset);
                    break;
                }
                elapsed += Math.max(1, Number(beat?.ticks) || 1);
            }
            const atTicks = Number.isFinite(judgmentTick) ? judgmentTick : impactTicks;
            const indices = definition.scope === 'all' ? allIndices : targetIndices;
            this.animationTimers.timeout(() => {
                indices.forEach(index => this.onInterference?.(index, kind, size, true));
                this.animationTimers.timeout(() => indices.forEach(index =>
                    this.onInterference?.(index, kind, size, false)), 900);
            }, Math.max(0, Math.round(atTicks * 1000 / Math.max(1, ticksPerSecond))));
        });
    }

    createChargeSpectacle(monsterImg, targets, crossScreen, durationMs = 0, pattern = null) {
        const spectacleGeneration = this.motionGeneration;
        const isCurrent = () => this.motionGeneration === spectacleGeneration;
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        if (!stage) return;
        const motionDuration = Math.max(900, Number(durationMs || (crossScreen ? 2150 : 2000)));
        const isStompBurst = stage.querySelector('[data-charge-launch-style="stomp-burst"]') !== null;
        const multiPassCharge = Array.isArray(this._activeChargePassSizes);
        const motionBeats = Array.isArray(pattern?.motion) ? pattern.motion : [];
        const totalMotionTicks = motionBeats.reduce((sum, beat) => sum + Math.max(1, Number(beat.ticks) || 1), 0);
        const chargeBeatIndex = motionBeats.findIndex(beat => beat.strideFlipTicks || beat.beat === 'charge');
        const authoredLaunchTicks = chargeBeatIndex > 0
            ? motionBeats.slice(0, chargeBeatIndex).reduce((sum, beat) => sum + Math.max(1, Number(beat.ticks) || 1), 0)
            : 0;
        const launchRatio = authoredLaunchTicks && totalMotionTicks
            ? authoredLaunchTicks / totalMotionTicks
            : multiPassCharge ? .317 : .476;
        const track = document.createElement('div');
        track.className = `monster-charge-track${crossScreen ? ' is-cross' : ' is-forward'}${isStompBurst ? ' is-delayed' : ''}`;
        if (isStompBurst) {
            track.style.setProperty('--charge-track-delay', `${Math.round(motionDuration * launchRatio)}ms`);
        }
        track.innerHTML = Array.from({ length: 9 }, (_, index) => `<i style="--step:${index};--stagger:${index % 2}"></i>`).join('');
        stage.appendChild(track);
        if (!isStompBurst) {
            for (let i = 0; i < 4; i++) {
                this.createLocalEmojiFx(stage, '💨', `charge-wind wind-${i}`, motionDuration);
            }
        }
        this.card.classList.remove('monster-charge-rumble');
        void this.card.offsetWidth;
        this.card.classList.add('monster-charge-rumble');
        if (isStompBurst) {
            const stompRatios = authoredLaunchTicks
                ? [launchRatio * .22, launchRatio * .58, launchRatio * .92]
                : multiPassCharge ? [.075, .17, .275] : [.09, .235, .39];
            const footRatios = [.34, .66, .50];
            stompRatios.forEach((ratio, index) => {
                this.animationTimers.timeout(() => {
                    if (!isCurrent()) return;
                    if (!monsterImg.isConnected || !stage.isConnected) return;
                    const stageRect = stage.getBoundingClientRect();
                    const monsterRect = monsterImg.getBoundingClientRect();
                    const dust = document.createElement('div');
                    dust.className = `monster-stomp-dust stomp-${index + 1}${index === 2 ? ' is-final' : ''}`;
                    dust.style.left = `${monsterRect.left - stageRect.left + monsterRect.width * footRatios[index]}px`;
                    dust.style.top = `${monsterRect.bottom - stageRect.top - monsterRect.height * .04}px`;
                    dust.style.setProperty('--stomp-width', `${Math.max(90, monsterRect.width * (index === 2 ? .48 : .34))}px`);
                    dust.style.setProperty('--stomp-drift', `${index === 0 ? -34 : (index === 1 ? 34 : 0)}px`);
                    stage.appendChild(dust);
                    this.animationTimers.timeout(() => dust.remove(), 820);
                    this.card.classList.remove('monster-charge-rumble');
                    void this.card.offsetWidth;
                    this.card.classList.add('monster-charge-rumble');
                }, Math.round(motionDuration * ratio));
            });
        }
        if (pattern?.runtimeWhiffStuck) {
            this.animationTimers.timeout(() => {
                if (!isCurrent()) return;
                const motionElement = stage.querySelector('[data-monster-rig]') || stage;
                const secondExitX = motionElement.style.getPropertyValue('--monster-charge-second-exit-x')
                    || motionElement.style.getPropertyValue('--monster-charge-first-exit-x')
                    || '400px';
                const secondExitY = motionElement.style.getPropertyValue('--monster-charge-second-exit-y')
                    || motionElement.style.getPropertyValue('--monster-charge-first-exit-y')
                    || '-120px';

                monsterImg.dataset.hornStuck = 'true';
                monsterImg.style.setProperty('--stuck-x', secondExitX);
                monsterImg.style.setProperty('--stuck-y', secondExitY);

                this.card.classList.remove('card-heavy-shake-anim');
                void this.card.offsetWidth;
                this.card.classList.add('card-heavy-shake-anim');

                const wallParticles = [
                    { emoji: '🧱', dx: '-30px', dy: '-20px', rot: '-20deg' },
                    { emoji: '🪨', dx: '30px', dy: '-30px', rot: '35deg' },
                    { emoji: '💥', dx: '0px', dy: '-10px', rot: '0deg' },
                    { emoji: '💨', dx: '-15px', dy: '20px', rot: '15deg' }
                ];
                wallParticles.forEach(p => {
                    const fx = document.createElement('div');
                    fx.className = 'monster-wall-stuck-fx';
                    fx.textContent = p.emoji;
                    fx.style.setProperty('--fx-x', secondExitX);
                    fx.style.setProperty('--fx-y', secondExitY);
                    fx.style.setProperty('--drift-x', p.dx);
                    fx.style.setProperty('--drift-y', p.dy);
                    fx.style.setProperty('--rot', p.rot);
                    fx.style.left = '50%';
                    fx.style.top = '50%';
                    stage.appendChild(fx);
                    this.animationTimers.timeout(() => fx.remove(), 850);
                });

                monsterImg.classList.remove('monster-knockdown-anim');
                monsterImg.classList.add('monster-horn-stuck-anim');
            }, Math.round(motionDuration * 0.82));
        }
        this.animationTimers.timeout(() => {
            track.remove();
            this.card?.classList.remove('monster-charge-rumble');
        }, motionDuration + 120);
    }

    createLocalEmojiFx(stage, emoji, extraClass, durationMs, position = {}) {
        if (!stage) return null;
        const fx = document.createElement('div');
        fx.className = `monster-local-action-fx ${extraClass || ''}`.trim();
        fx.textContent = emoji;
        fx.style.setProperty('--monster-local-duration', `${Math.max(300, Number(durationMs || 900))}ms`);
        if (position.left) fx.style.left = position.left;
        if (position.top) fx.style.top = position.top;
        stage.appendChild(fx);
        void fx.offsetWidth;
        fx.classList.add('is-playing');
        this.animationTimers.timeout(() => fx.remove(), Math.max(300, Number(durationMs || 900)) + 100);
        return fx;
    }

    createRockProjectile(monsterImg, targetCard, pattern = {}, durationMs = 720) {
        const stage = monsterImg?.closest?.('.hunt-monster-motion-stage');
        const stageRect = stage?.getBoundingClientRect?.();
        const monsterRect = monsterImg?.getBoundingClientRect?.();
        const targetAnchor = targetCard?.querySelector?.('.game-hunt-weapon-img-container') || targetCard;
        const targetRect = targetAnchor?.getBoundingClientRect?.();
        if (!stage || !stageRect || !monsterRect || !targetRect) return null;
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog
            : null;
        const originKind = pattern.originPart || pattern.partUse?.fixed || 'right-front-leg';
        const originPoint = originKind === 'lower-front-leg'
            ? ['left-front-leg', 'right-front-leg']
                .map(kind => anatomy?.visualPoint?.(this.owner?.selectedMonster, kind, 0))
                .filter(Boolean)
                .sort((a, b) => Number(b.y || 0) - Number(a.y || 0))[0]
            : anatomy?.visualPoint?.(this.owner?.selectedMonster, originKind, 0);
        const originX = monsterRect.left + monsterRect.width * (originPoint?.x ?? .5);
        const originY = monsterRect.top + monsterRect.height * (originPoint?.y ?? .58);
        const targetX = targetRect.left + targetRect.width / 2;
        const targetY = targetRect.top + targetRect.height / 2;
        const arc = HuntMonsterAttackAnimator.projectileArc(originX, originY, targetX, targetY);
        const rockGlyph = pattern.runtimeProjectileVariant === 'ice' ? '❄️'
            : pattern.runtimeProjectileVariant === 'fire' ? '🔥'
                : pattern.runtimeProjectileVariant === 'water' ? '🪨💧' : '🪨';
        const rockFx = this.createLocalEmojiFx(
            stage,
            rockGlyph,
            `tail-rock-projectile physical-rock-projectile is-${pattern.runtimeProjectileVariant || 'raw'}`,
            durationMs,
            {
                left: `${targetX - stageRect.left}px`,
                top: `${targetY - stageRect.top}px`
            }
        );
        rockFx?.style.setProperty('--tail-rock-start-x', `${arc.startX}px`);
        rockFx?.style.setProperty('--tail-rock-start-y', `${arc.startY}px`);
        rockFx?.style.setProperty('--tail-rock-mid-x', `${arc.midX}px`);
        rockFx?.style.setProperty('--tail-rock-mid-y', `${arc.midY}px`);
        return rockFx;
    }

    resolveRockVolleyVisualTargets(event = {}, pattern = {}, fallbackTargets = []) {
        const indices = Array.isArray(event.targetIndices) && event.targetIndices.length
            ? event.targetIndices.filter(Number.isInteger)
            : fallbackTargets.map(target => target?.index).filter(Number.isInteger);
        if (!pattern.tags?.includes('tail-slam-rock')) {
            return indices.map(index => this.card.querySelector(`#fight-card-${index}`)).filter(Boolean);
        }
        const primary = Number.isInteger(pattern.runtimePrimaryTargetIndex)
            ? pattern.runtimePrimaryTargetIndex
            : indices[Math.floor(indices.length / 2)];
        if (!Number.isInteger(primary)) return [];
        const realCards = [0, 1, 2, 3]
            .map(index => this.card.querySelector(`#fight-card-${index}`)).filter(Boolean);
        const rects = realCards.map(card => card.getBoundingClientRect());
        const pitch = rects.length > 1
            ? Math.abs(rects[1].left - rects[0].left)
            : (rects[0]?.width || 220);
        return [primary - 1, primary, primary + 1].map(index => {
            const real = this.card.querySelector(`#fight-card-${index}`);
            if (real) return real;
            const edgeIndex = index < 0 ? 0 : 3;
            const edge = this.card.querySelector(`#fight-card-${edgeIndex}`);
            const rect = edge?.getBoundingClientRect?.();
            if (!rect) return null;
            const shift = index < 0 ? -pitch : pitch;
            return {
                querySelector: () => null,
                getBoundingClientRect: () => ({
                    left: rect.left + shift, right: rect.right + shift,
                    top: rect.top, bottom: rect.bottom,
                    width: rect.width, height: rect.height,
                    x: rect.x + shift, y: rect.y
                })
            };
        }).filter(Boolean);
    }

    scheduleTigrexBranchMotion(monsterImg, pattern = {}) {
        if (!pattern.tags?.includes('tigrex-charge-chain') || !pattern.runtimeImpactPending) return;
        const timeline = Array.isArray(pattern.runtimeResolvedImpactTimeline)
            ? pattern.runtimeResolvedImpactTimeline
            : [];
        const branchEvent = timeline.find(event => /^tigrex-(?:rock|spin|bite)$/.test(event.eventKind || ''));
        if (!branchEvent?.animationProfile) return;
        const expectedGeneration = this.activeMonsterMotion?.generation;
        const ticksPerSecond = typeof HuntAtbConfig !== 'undefined'
            ? Number(HuntAtbConfig.TICKS_PER_SECOND || 10)
            : 10;
        const delayMs = HuntMonsterAttackAnimator.tigrexBranchStartDelayMs(
            branchEvent.atTicks,
            branchEvent.animationDurationMs,
            branchEvent.animationImpactRatio || .6,
            ticksPerSecond
        );
        const approachTravelMs = Math.max(120,
            Number(pattern.runtimeTigrexBranchApproachDurationMs || 520));
        const approachMotionMs = Math.ceil(approachTravelMs / .9);
        const approachDelayMs = Math.max(
            Number(pattern.runtimeTigrexRouteExitDelayMs || 0),
            Math.max(0, delayMs - approachTravelMs)
        );
        this.animationTimers.timeout(() => {
            if (!this.card || this.activeMonsterMotion?.generation !== expectedGeneration) return;
            const motionElement = this.resolveMotionElement(monsterImg);
            if (!motionElement) return;
            motionElement.style.setProperty('--monster-motion-duration', `${approachMotionMs}ms`);
            const approachMotion = this.startMonsterMotion(
                motionElement,
                'monster-motion-tigrex-branch-approach',
                approachMotionMs,
                null,
                {
                    patternId: `${pattern.id}:branch-approach`
                }
            );
            this.animationTimers.timeout(() => {
                if (!this.card || this.activeMonsterMotion?.generation !== approachMotion?.generation) return;
                const Catalog = typeof HuntMonsterAnimationCatalog !== 'undefined'
                    ? HuntMonsterAnimationCatalog
                    : null;
                const profile = Catalog?.resolve?.({
                    animationProfile: branchEvent.animationProfile,
                    animationDurationMs: branchEvent.animationDurationMs
                }, branchEvent.displayName || '', 'physical', this.owner.selectedMonster);
                if (!profile) return;
                const preservedTransform = typeof getComputedStyle === 'function'
                    ? getComputedStyle(motionElement).transform
                    : null;
                motionElement.style.setProperty('--monster-motion-duration', `${profile.duration}ms`);
                const branchMotion = this.startMonsterMotion(
                    motionElement,
                    `monster-motion-${profile.id}`,
                    profile.duration,
                    null,
                    {
                        patternId: `${pattern.id}:${branchEvent.eventKind}`,
                        preservePoseOnReplace: true,
                        preservedTransform
                    }
                );
                if (branchEvent.eventKind === 'tigrex-rock') {
                    const travelMs = 720;
                    const impactRatio = Math.max(0, Math.min(1,
                        Number(branchEvent.animationImpactRatio || .7)));
                    const releaseDelayMs = Math.max(0,
                        Math.round(profile.duration * impactRatio - travelMs));
                    this.animationTimers.timeout(() => {
                        if (!this.card || this.activeMonsterMotion?.generation !== branchMotion?.generation) return;
                        let indices = Array.isArray(branchEvent.targetIndices)
                            && branchEvent.targetIndices.length
                            ? branchEvent.targetIndices
                            : [];
                        const primary = Number(indices[0]);
                        const frontLegBroken = (pattern.runtimeBrokenPartKinds || [])
                            .some(kind => /front-leg/.test(String(kind)));
                        if (!frontLegBroken && Number.isInteger(primary)) {
                            indices = [primary - 1, primary, primary + 1]
                                .filter(index => index >= 0 && index <= 3)
                                .filter(index => this.card.querySelector(`#fight-card-${index}`));
                        } else {
                            indices = indices.slice(0, 1);
                        }
                        this.owner?.onMonsterProjectileLaunchAudio?.(this.owner.selectedMonster, pattern);
                        indices.forEach(index => {
                            const liveCard = this.card.querySelector(`#fight-card-${index}`);
                            if (liveCard) this.createRockProjectile(monsterImg, liveCard, pattern, travelMs);
                        });
                    }, releaseDelayMs);
                }
            }, approachTravelMs);
        }, approachDelayMs);
    }

    createMonsterAttachedEmojiFx(monsterImg, emoji, extraClass, durationMs, originPart = null) {
        const motionElement = this.resolveMotionElement(monsterImg);
        const facingLayer = this.resolveFacingLayer(monsterImg);
        const container = originPart && facingLayer
            ? facingLayer
            : motionElement !== monsterImg
                ? motionElement
                : monsterImg?.closest?.('.hunt-monster-motion-stage');
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog
            : null;
        const point = originPart
            ? anatomy?.visualPoint?.(this.owner?.selectedMonster, originPart, 0)
            : null;
        return this.createLocalEmojiFx(container, emoji, extraClass, durationMs, point ? {
            left: `${Number(point.x) * 100}%`,
            top: `${Number(point.y) * 100}%`
        } : {});
    }

    triggerMonsterTelegraphFx(effect = {}) {
        const monsterImg = this.card?.querySelector?.('#fight-monster-img');
        if (!monsterImg) return null;
        return this.createMonsterAttachedEmojiFx(
            monsterImg,
            effect.emoji || '❄️',
            effect.className || 'attached-action',
            Number(effect.durationMs || 800)
        );
    }

    getElementalTheme(attackName = '', pattern = null) {
        const name = [
            pattern?.element,
            ...(pattern?.tags || []),
            pattern?.id,
            attackName
        ].filter(Boolean).join(' ').toLowerCase();
        const themes = [
            { id: 'fire', test: /(^|\s)fire(\s|$)|화염|화룡|화염구|겁염|불꽃|폭염|용암/, emoji: '🔥', color: '#ff5a16', hot: '#fff4a8', shadow: '#9d1200' },
            { id: 'thunder', test: /(^|\s)thunder(\s|$)|번개|벼락|뇌격|전격|전뇌|초전도/, emoji: '⚡', color: '#aeefff', hot: '#ffffff', shadow: '#596dff' },
            { id: 'ice', test: /(^|\s)ice(\s|$)|얼음|빙결|빙룡|빙벽|절대영도|냉기/, emoji: '❄️', color: '#6ee9ff', hot: '#ffffff', shadow: '#2681ff' },
            { id: 'water', test: /(^|\s)water(\s|$)|수류|수압|물|포말|거품|레이저/, emoji: '🌊', color: '#29bfff', hot: '#eaffff', shadow: '#075dcc' },
            { id: 'dragon', test: /(^|\s)dragon(\s|$)|광룡|용속성|광기|흑룡|용기/, emoji: '🐉', color: '#d641ff', hot: '#ffb8ff', shadow: '#35005f' },
            { id: 'poison', test: /(^|\s)poison(\s|$)|독|맹독|독조|독액/, emoji: '☠️', color: '#b542ff', hot: '#f4d5ff', shadow: '#35005f' },
            { id: 'blast', test: /(^|\s)blast(\s|$)|폭발|폭파|점균|대재앙|혜성/, emoji: '💥', color: '#ff7b22', hot: '#ffffff', shadow: '#a40037' },
            { id: 'wind', test: /(^|\s)wind(\s|$)|바람|폭풍|회오리|진공|분사/, emoji: '🌪️', color: '#baffdc', hot: '#ffffff', shadow: '#247f75' },
            // 던지는 칼날(가시깃 등)은 속성탄이 아니다. 속성 판정을 모두 지나친 뒤에만
            // 걸리도록 마지막에 둔다. 이게 없으면 arcane 폴백의 보라색 구체가 날아간다.
            // minimalFx: 속성 연출(화면 워시 · 총구 링 · 궤적 입자 · 착탄 링)을 만들지
            // 않고 날아가는 몸체만 남긴다. 금속 날에는 어차피 어울리지 않는 연출인데,
            // 3표적짜리 패턴이라 인스턴스마다 60개 넘는 요소가 블러·블렌드와 함께
            // 애니메이션되어 프레임이 떨어졌다.
            { id: 'quill', test: /(^|\s)bleed(\s|$)|가시깃|가시|열상|칼날|참격/, emoji: '♦', color: '#3a53d8', hot: '#c3d0ff', shadow: '#0b1440', minimalFx: true }
        ];
        return themes.find(theme => theme.test.test(name)) || {
            id: 'arcane', emoji: '✨', color: '#d966ff', hot: '#ffffff', shadow: '#5322a8'
        };
    }

    getBreathDelivery(attackName = '', pattern = null) {
        if (pattern?.delivery) return pattern.delivery;
        const evidence = [attackName, pattern?.id, pattern?.sourceActionClass, ...(pattern?.tags || [])]
            .filter(Boolean).join(' ');
        if (/毒霧|독무|독안개|poison\s*mist|mist|gas/i.test(evidence)) return 'gas';
        if (/Laser|Beam|WaterPressure|CrossLaser|StraightThunder|레이저|광선|고압\s*수류|직선\s*뇌격|십자\s*수류/i.test(evidence)) return 'beam';
        if (/Fireball|Bullet|Ball|Shoot|Threeway|SingleBreath|BubbleBreath|화염구|탄환|포말|연사|삼연|삼방향/i.test(evidence)) return 'projectile';
        if (/Sweep|FlameThrow|Continuous|쓸기|휩쓸|지속|분사|방출|화염\s*브레스|겁염/i.test(evidence)) return 'gas';
        if (pattern?.tags?.includes('projectile') || pattern?.type === 'projectile') return 'projectile';
        return 'gas';
    }

    static usesElementalDelivery(type = '', pattern = null) {
        if (pattern?.projectileVisual) return false;
        return type === 'elemental'
            || pattern?.type === 'projectile'
            || pattern?.tags?.includes('elemental')
            || ['projectile', 'beam', 'stream', 'gas', 'field'].includes(pattern?.delivery);
    }

    createElementalAttack(monsterCenter, containerRect, targetCard, target, attackName, fallbackEmoji, order, pattern = null) {
        const weaponTarget = targetCard.querySelector('.game-hunt-weapon-img-container') || targetCard;
        const targetRect = weaponTarget.getBoundingClientRect();
        const startX = monsterCenter.x - containerRect.left;
        const startY = monsterCenter.y - containerRect.top;
        const destX = targetRect.left + targetRect.width / 2 - containerRect.left;
        const destY = targetRect.top + targetRect.height / 2 - containerRect.top;
        const dx = destX - startX;
        const dy = destY - startY;
        const distance = Math.max(80, Math.hypot(dx, dy));
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const theme = this.getElementalTheme(attackName, pattern);
        const delivery = this.getBreathDelivery(attackName, pattern);
        const isDodge = pattern?.runtimePreviewCardReactions === true
            && target.result === 'dodge';
        const isBreath = /브레스|레이저|수류|분사|방출|화염구/.test(attackName);
        const isUltimate = /겁염|절대영도|대재앙|혜성|초폭|대폭발|에스카톤|황도|슈퍼노바|헬 플레어/.test(attackName);
        const travelScale = isDodge ? 1.32 : 1;

        const fx = document.createElement('div');
        fx.className = `monster-element-fx element-${theme.id} delivery-${delivery}${isBreath ? ' is-breath' : ''}${isUltimate ? ' is-ultimate' : ''}${isDodge ? ' is-dodge' : ''}`;
        fx.style.setProperty('--fx-x', `${startX}px`);
        fx.style.setProperty('--fx-y', `${startY}px`);
        fx.style.setProperty('--fx-dest-x', `${destX}px`);
        fx.style.setProperty('--fx-dest-y', `${destY}px`);
        fx.style.setProperty('--fx-dx', `${dx * travelScale}px`);
        fx.style.setProperty('--fx-dy', `${dy * travelScale}px`);
        fx.style.setProperty('--fx-length', `${distance * travelScale}px`);
        fx.style.setProperty('--fx-angle', `${angle}deg`);
        fx.style.setProperty('--fx-color', theme.color);
        fx.style.setProperty('--fx-hot', theme.hot);
        fx.style.setProperty('--fx-shadow', theme.shadow);
        fx.style.setProperty('--fx-delay', `${order * 35}ms`);

        // 속성탄이 아닌 투척물은 부수 연출을 아예 만들지 않는다. display:none으로
        // 감추는 것과 달리 DOM 생성과 스타일 계산 자체가 없어진다.
        const minimalFx = Boolean(theme.minimalFx);
        if (!minimalFx) {
            const wash = document.createElement('div');
            wash.className = 'monster-element-wash';
            fx.appendChild(wash);

            const muzzle = document.createElement('div');
            muzzle.className = 'monster-element-muzzle';
            muzzle.innerHTML = '<i></i><i></i>';
            fx.appendChild(muzzle);
        }

        let deliveryBody = null;
        if (delivery === 'projectile') {
            // A fireball is a detached body, not a beam restyled into a circle.
            // Keeping it out of the beam DOM prevents stale or competing OBS CSS
            // from ever revealing a full-length laser for projectile attacks.
            deliveryBody = document.createElement('div');
            deliveryBody.className = 'monster-element-projectile';
        } else if (delivery !== 'gas') {
            deliveryBody = document.createElement('div');
            deliveryBody.className = 'monster-element-beam';
            deliveryBody.innerHTML = '<i class="beam-aura"></i><i class="beam-body"></i><i class="beam-core"></i><i class="beam-ripple"></i>';
        }
        if (deliveryBody) fx.appendChild(deliveryBody);

        if (delivery === 'gas') {
            const perpendicularX = -dy / distance;
            const perpendicularY = dx / distance;
            for (let i = 0; i < 15; i++) {
                const row = Math.floor(i / 3);
                const progress = (row + 1) / 6;
                const lane = (i % 3) - 1;
                const lateral = lane * (22 + progress * 68);
                const cloud = document.createElement('i');
                cloud.className = 'monster-gas-cloud';
                cloud.style.setProperty('--gas-start-x', `${dx * progress * .12}px`);
                cloud.style.setProperty('--gas-start-y', `${dy * progress * .12}px`);
                cloud.style.setProperty('--gas-x', `${dx * progress + perpendicularX * lateral}px`);
                cloud.style.setProperty('--gas-y', `${dy * progress + perpendicularY * lateral}px`);
                cloud.style.setProperty('--gas-size', `${76 + row * 15 + (i % 3) * 7}px`);
                cloud.style.setProperty('--gas-delay', `${order * 35 + row * 58 + (i % 3) * 22}ms`);
                fx.appendChild(cloud);
            }
        }

        if (!minimalFx) {
            const head = document.createElement('div');
            head.className = 'monster-element-head';
            head.textContent = theme.emoji || fallbackEmoji;
            fx.appendChild(head);
        }

        if (!isDodge && !minimalFx) {
            const impact = document.createElement('div');
            impact.className = 'monster-element-impact';
            impact.innerHTML = `<b>${theme.emoji || fallbackEmoji}</b><i></i><i></i><i></i>`;
            fx.appendChild(impact);
        }

        for (let i = 0; !minimalFx && i < (isUltimate ? 18 : 12); i++) {
            const particle = document.createElement('i');
            particle.className = 'monster-element-particle';
            const progress = (i + 1) / (isUltimate ? 19 : 13);
            particle.style.setProperty('--p-x', `${dx * travelScale * progress}px`);
            particle.style.setProperty('--p-dy', `${dy * travelScale * progress}px`);
            particle.style.setProperty('--p-y', `${((i % 5) - 2) * (isUltimate ? 18 : 12)}px`);
            particle.style.setProperty('--p-delay', `${i * 22}ms`);
            fx.appendChild(particle);
        }

        this.card.appendChild(fx);
        void fx.offsetWidth;
        fx.classList.add('is-playing');
        this.animationTimers.timeout(() => fx.remove(), isUltimate ? 1800 : 1400);

    }

    resolveLiveElementalOrigin(monsterImg, targetCard, pattern, fallback) {
        const monsterRect = monsterImg?.getBoundingClientRect?.();
        const targetAnchor = targetCard?.querySelector?.('.game-hunt-weapon-img-container') || targetCard;
        const targetRect = targetAnchor?.getBoundingClientRect?.();
        if (!monsterRect || !targetRect || monsterRect.width <= 0 || monsterRect.height <= 0) {
            return fallback;
        }
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog
            : null;
        const originPart = pattern?.originPart || 'head';
        const partPoint = anatomy?.visualPoint?.(this.owner?.selectedMonster, originPart, 0);
        const baseFacing = anatomy?.baseFacing?.(this.owner?.selectedMonster) || 'front';
        return HuntMonsterAttackAnimator.targetFacingOrigin(
            monsterRect, targetRect, partPoint, baseFacing);
    }

    createUltimateSpectacle(monsterCenter, containerRect, attackName, emoji, pattern, elemental) {
        const theme = this.getElementalTheme(attackName, pattern);
        const fx = document.createElement('div');
        fx.className = `monster-ultimate-fx ${elemental ? `ultimate-elemental element-${theme.id}` : 'ultimate-physical'}`;
        fx.style.setProperty('--ultimate-x', `${monsterCenter.x - containerRect.left}px`);
        fx.style.setProperty('--ultimate-y', `${monsterCenter.y - containerRect.top}px`);
        fx.style.setProperty('--fx-color', elemental ? theme.color : '#ffcf66');
        fx.style.setProperty('--fx-hot', elemental ? theme.hot : '#ffffff');
        fx.style.setProperty('--fx-shadow', elemental ? theme.shadow : '#7c1200');
        fx.innerHTML = `
            <div class="monster-ultimate-vignette"></div>
            <div class="monster-ultimate-flash"></div>
            <div class="monster-ultimate-title"><small>SIGNATURE ATTACK</small><strong>${emoji} ${attackName} ${emoji}</strong><em>전원 대상 · 최대 체력 90%</em></div>
            <div class="monster-ultimate-core">${elemental ? (theme.emoji || emoji) : '💥'}</div>
            <i class="monster-ultimate-ring ring-a"></i><i class="monster-ultimate-ring ring-b"></i><i class="monster-ultimate-ring ring-c"></i>
            <div class="monster-ultimate-shockwave"></div>`;
        for (let i = 0; i < 24; i++) {
            const shard = document.createElement('i');
            shard.className = 'monster-ultimate-shard';
            shard.textContent = elemental ? (theme.emoji || emoji) : (i % 2 ? '💥' : '🪨');
            shard.style.setProperty('--shard-angle', `${i * 15}deg`);
            shard.style.setProperty('--shard-delay', `${(i % 6) * 35}ms`);
            fx.appendChild(shard);
        }
        this.card.appendChild(fx);
        void fx.offsetWidth;
        fx.classList.add('is-playing');
        this.card.classList.add('monster-ultimate-board-shake');
        this.animationTimers.timeout(() => this.card?.classList.remove('monster-ultimate-board-shake'), 1500);
        this.animationTimers.timeout(() => fx.remove(), 2300);
    }

    triggerValstraxAmbushWarning() {
        if (!this.card) return;
        this.card.querySelector('.hunt-valstrax-ambush-warning')?.remove();
        const warning = document.createElement('div');
        warning.className = 'hunt-valstrax-ambush-warning';
        warning.innerHTML = '<i></i><b>☄️</b><strong>상공에서 붉은 혜성 접근</strong>';
        this.card.appendChild(warning);
        void warning.offsetWidth;
        warning.classList.add('is-playing');
        this.animationTimers.timeout(() => warning.remove(), 10000);
    }

    triggerMonsterAttack(type, emoji, targets, attackName = '', pattern = null) {
        const patternId = pattern?.id || null;
        this.traceMonsterMotion('request', {
            patternId,
            attackName,
            targetCount: Array.isArray(targets) ? targets.length : 0
        });
        if (!this.card || !targets || targets.length === 0) {
            this.traceMonsterMotion('skip', {
                patternId,
                reason: !this.card ? 'card-missing' : 'targets-missing'
            }, true);
            return;
        }

        const monsterImg = this.card.querySelector('.hunt-small-monster.is-attacking') || this.card.querySelector('#fight-monster-img');
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (!monsterImg || !showcase) {
            this.traceMonsterMotion('skip', {
                patternId,
                reason: !monsterImg ? 'monster-image-missing' : 'showcase-missing'
            }, true);
            return;
        }

        const firstTarget = targets[0];
        // `targets` is the union of all judgment recipients.  Area interference
        // (roar/tremor/wind) can put hunter 0 first even when a different hunter
        // is the authored primary movement target.
        const primaryTargetIndex = Number.isInteger(pattern?.runtimePrimaryTargetIndex)
            ? pattern.runtimePrimaryTargetIndex
            : firstTarget.index;
        const targetCard = this.card.querySelector(`#fight-card-${primaryTargetIndex}`);
        if (!targetCard) {
            this.traceMonsterMotion('skip', {
                patternId,
                reason: 'target-card-missing',
                targetIndex: primaryTargetIndex
            }, true);
            return;
        }

        const containerRect = this.card.getBoundingClientRect();
        const monsterRect = monsterImg.getBoundingClientRect();

        const fallbackMonsterCenter = {
            x: monsterRect.left + monsterRect.width / 2,
            y: monsterRect.top + monsterRect.height / 2
        };
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog
            : null;
        const authoredDelivery = this.getBreathDelivery(attackName, pattern);
        const isElementalDelivery = HuntMonsterAttackAnimator.usesElementalDelivery(type, pattern);
        const originPart = pattern?.originPart || (isElementalDelivery ? 'head' : null);
        const originPoint = anatomy?.visualPoint?.(this.owner?.selectedMonster, originPart, 0);
        const monsterCenter = originPoint ? {
            x: monsterRect.left + monsterRect.width * originPoint.x,
            y: monsterRect.top + monsterRect.height * originPoint.y
        } : fallbackMonsterCenter;
        const isUltimate = pattern?.type === 'ultimate' || pattern?.tags?.includes('ultimate');
        const isValstraxAmbush = pattern?.id === 'valstrax.crimson_comet_ambush'
            || /붉은 혜성 강습/.test(attackName);
        const motionProfile = this.playPatternMotion(monsterImg, targetCard, pattern, attackName, type, targets);
        // Every delayed spectacle below belongs to this exact playback. Trap,
        // stun, part break, flash, or a replacement action increments the
        // generation in clearMonsterMotion(); stale callbacks must become inert.
        const playbackGeneration = this.motionGeneration;
        const isPlaybackCurrent = () => this.motionGeneration === playbackGeneration;
        if (pattern?.runtimePreviewCardReactions && !pattern?.runtimePreviewScrub) {
            this.schedulePreviewImpactCardReactions(pattern, targets);
        }
        // The review scrubber controls extracted keyframe graphs as well as BEAT
        // motion. Previously only BEAT animations were paused/searched, leaving
        // most reviewed wyverns to play independently of the timeline.
        if (pattern?.runtimePreviewScrub && !this.activeBeatMotionPreview) {
            this.freezeKeyframeMotionPreview(pattern.runtimePreviewProgress || 0);
        }
        // The editor loads a selected pattern through the same renderer so its
        // first frame is accurate. Everything below this point is live combat
        // spectacle/state and must only run after an explicit Play command.
        if (pattern?.runtimePreviewScrub) return;
        this.scheduleTigrexBranchMotion(monsterImg, pattern);
        const isRoar = type === 'roar'
            || pattern?.type === 'roar'
            || pattern?.tags?.includes('roar');
        if (isRoar) {
            if (!pattern?.runtimeImpactPending) this.triggerMonsterRoar(pattern);
            return;
        }
        this._activeChargePassSizes = Array.isArray(pattern?.runtimeChargePassSizes)
            ? pattern.runtimeChargePassSizes
            : null;
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        const usesChargeSpectacle = pattern?.chargeLaunchStyle === 'stomp-burst'
            || motionProfile?.id === 'ground-charge' || motionProfile?.id === 'ground-charge-cross'
            || motionProfile?.id === 'ground-charge-zigzag' || motionProfile?.id === 'ground-charge-double'
            || motionProfile?.id === 'ground-charge-triple' || motionProfile?.id === 'aerial-charge-cross'
            || motionProfile?.id === 'legiana-drill-cross';
        if (usesChargeSpectacle) {
            const crossScreenCharge = motionProfile.id !== 'ground-charge'
                && (pattern?.tags?.includes('cross-charge')
                    || pattern?.tags?.includes('global-charge')
                    || motionProfile.id !== pattern?.id);
            // Delayed-impact actions return before the generic spectacle section.
            // Charge telegraphs therefore start here, together with their BEAT motion.
            this.createChargeSpectacle(monsterImg, targets, crossScreenCharge, motionProfile.duration, pattern);
        }
        if (pattern?.attachedFx) {
            this.createMonsterAttachedEmojiFx(
                monsterImg,
                pattern.attachedFx.emoji || '💥',
                pattern.attachedFx.className || 'attached-action',
                Number(pattern.attachedFx.durationMs || motionProfile?.duration || 900),
                pattern.originPart || null
            );
        }
        if (pattern?.impactFx && stage) {
            const impactTicks = Number(pattern.impact?.delayTicks
                ?? pattern.impactTimeline?.[0]?.atTicks
                ?? pattern.windupTicks
                ?? 0);
            const tickMs = 1000 / Math.max(1, Number(
                (typeof HuntAtbConfig !== 'undefined' && HuntAtbConfig?.TICKS_PER_SECOND) || 10
            ));
            this.animationTimers.timeout(() => {
                if (!isPlaybackCurrent()) return;
                const liveTarget = this.card.querySelector(`#fight-card-${targets[0]?.index}`) || targetCard;
                const anchor = liveTarget?.querySelector?.('.game-hunt-weapon-img-container') || liveTarget;
                const targetRect = anchor?.getBoundingClientRect?.();
                const stageRect = stage.getBoundingClientRect?.();
                this.createLocalEmojiFx(
                    stage,
                    pattern.impactFx.emoji || '💥',
                    pattern.impactFx.className || 'impact-action',
                    Number(pattern.impactFx.durationMs || 900),
                    targetRect && stageRect ? {
                        left: `${targetRect.left + targetRect.width / 2 - stageRect.left}px`,
                        top: `${targetRect.top + targetRect.height * .42 - stageRect.top}px`
                    } : {}
                );
            }, Math.max(0, Math.round(impactTicks * tickMs)));
        }
        // Authored BEAT tail slams launch their rocks from resolved impact
        // events below. Keep this branch only for a truly legacy profile that
        // has no motion graph, otherwise it would add a fourth phantom rock.
        if (motionProfile?.id === 'tail-slam-rock' && !Array.isArray(pattern?.motion)) {
            const duration = Number(motionProfile?.duration || 3400);
            this.createLocalEmojiFx(stage, '☁️', 'tail-slam-dust', duration);
            this.animationTimers.timeout(() => {
                if (!isPlaybackCurrent()) return;
                const rockTarget = targets[1] || targets[0];
                const rockCard = this.card.querySelector(`#fight-card-${rockTarget.index}`) || targetCard;
                const rockRect = (rockCard.querySelector('.game-hunt-weapon-img-container') || rockCard).getBoundingClientRect();
                const stageRect = stage?.getBoundingClientRect();
                const liveMonsterRect = monsterImg.getBoundingClientRect();
                const tailPoint = anatomy?.visualPoint?.(this.owner?.selectedMonster, 'tail', 0);
                const originX = liveMonsterRect.left + liveMonsterRect.width * (tailPoint?.x ?? .5);
                const originY = liveMonsterRect.top + liveMonsterRect.height * (tailPoint?.y ?? .55);
                const targetX = rockRect.left + rockRect.width / 2;
                const targetY = rockRect.top + rockRect.height / 2;
                const arc = HuntMonsterAttackAnimator.projectileArc(
                    originX, originY, targetX, targetY);
                const rockFx = this.createLocalEmojiFx(
                    stage,
                    '🪨',
                    'tail-rock-projectile',
                    Math.max(700, duration * .42),
                    stageRect ? {
                        left: `${targetX - stageRect.left}px`,
                        top: `${targetY - stageRect.top}px`
                    } : {}
                );
                rockFx?.style.setProperty('--tail-rock-start-x', `${arc.startX}px`);
                rockFx?.style.setProperty('--tail-rock-start-y', `${arc.startY}px`);
                rockFx?.style.setProperty('--tail-rock-mid-x', `${arc.midX}px`);
                rockFx?.style.setProperty('--tail-rock-mid-y', `${arc.midY}px`);
            }, Math.round(duration * .51));
        } else if (motionProfile?.id === 'horn-uppercut') {
            this.createLocalEmojiFx(stage, '☁️', 'uppercut-dust', motionProfile?.duration || 2800);
            this.animationTimers.timeout(() => {
                if (!isPlaybackCurrent()) return;
                const targetRect = (targetCard.querySelector('.game-hunt-weapon-img-container') || targetCard).getBoundingClientRect();
                const stageRect = stage?.getBoundingClientRect();
                this.createLocalEmojiFx(stage, '💥', 'uppercut-impact', 650, stageRect ? {
                    left: `${targetRect.left + targetRect.width / 2 - stageRect.left}px`,
                    top: `${targetRect.top + targetRect.height / 2 - stageRect.top}px`
                } : {});
            }, Math.round(Number(motionProfile?.duration || 2800) * .57));
        }
        // A delayed hit starts the monster motion now, but detached projectiles
        // must still be created before the impact commit. Launch late enough for
        // the 720 ms projectile animation to arrive at the authored impact tick.
        if (pattern?.runtimeImpactPending) {
            if (pattern.projectileVisual === 'rock') {
                const branchOwnsRockProjectile = pattern.tags?.includes('tigrex-charge-chain')
                    && pattern.branchKind === 'rock';
                if (branchOwnsRockProjectile) return;
                const ticksPerSecond = typeof HuntAtbConfig !== 'undefined'
                    ? Number(HuntAtbConfig.TICKS_PER_SECOND || 10)
                    : 10;
                const defaultTravelMs = 720;
                const timeline = Array.isArray(pattern.runtimeResolvedImpactTimeline)
                    ? pattern.runtimeResolvedImpactTimeline
                    : [{
                        atTicks: pattern.runtimeImpactDelayTicks,
                        targetIndices: targets.map(target => target.index),
                        eventKind: null
                    }];
                const requiredKinds = new Set(pattern.projectileEventKinds || []);
                const rockEvents = timeline.filter(event =>
                    Number(event?.damageScale ?? 1) > 0
                    && (requiredKinds.size === 0 || requiredKinds.has(event.eventKind))
                );
                rockEvents.forEach(event => {
                    const impactTicks = Number(event.atTicks || pattern.runtimeImpactDelayTicks || 0);
                    const authoredLaunchTicks = Number(event.launchAtTicks);
                    const hasAuthoredLaunch = Number.isFinite(authoredLaunchTicks)
                        && authoredLaunchTicks >= 0 && authoredLaunchTicks <= impactTicks;
                    const travelMs = hasAuthoredLaunch
                        ? Math.max(100, (impactTicks - authoredLaunchTicks) * 1000 / ticksPerSecond)
                        : defaultTravelMs;
                    const launchDelayMs = Math.max(0, hasAuthoredLaunch
                        ? authoredLaunchTicks * 1000 / ticksPerSecond
                        : impactTicks * 1000 / ticksPerSecond - travelMs);
                    this.animationTimers.timeout(() => {
                        if (!isPlaybackCurrent()) return;
                        if (!this.card) return;
                        const visualTargets = this.resolveRockVolleyVisualTargets(event, pattern, targets);
                        this.owner?.onMonsterProjectileLaunchAudio?.(this.owner.selectedMonster, pattern);
                        visualTargets.forEach(visualTarget => {
                            this.createRockProjectile(monsterImg, visualTarget, pattern, travelMs);
                        });
                    }, launchDelayMs);
                });
                return;
            }
            const delivery = authoredDelivery;
            const usesDetachedDelivery = isElementalDelivery
                && ['projectile', 'stream', 'beam', 'gas'].includes(delivery);
            if (usesDetachedDelivery) {
                const ticksPerSecond = typeof HuntAtbConfig !== 'undefined'
                    ? Number(HuntAtbConfig.TICKS_PER_SECOND || 10)
                    : 10;
                const visualTravelMs = delivery === 'projectile' ? 720 : 900;
                const timeline = Array.isArray(pattern.impactTimeline) && pattern.impactTimeline.length
                    ? pattern.impactTimeline.filter(event =>
                        Number(event?.damageScale ?? 1) > 0
                        && event?.eventKind !== 'blast-scale-volley'
                    )
                    : [{ atTicks: pattern.runtimeImpactDelayTicks }];
                const targetSequence = Array.isArray(pattern.runtimeImpactTargetSequence)
                    ? pattern.runtimeImpactTargetSequence
                    : null;
                const firstImpactTicks = Number(
                    timeline[0]?.atTicks ?? pattern.runtimeImpactDelayTicks ?? 0);
                timeline.forEach((event, eventIndex) => {
                    const impactTicks = Number(event.atTicks ?? pattern.runtimeImpactDelayTicks ?? 0);
                    const launchDelayMs = HuntMonsterAttackAnimator.projectileLaunchDelayMs(
                        pattern,
                        impactTicks,
                        firstImpactTicks,
                        ticksPerSecond,
                        visualTravelMs
                    );
                    this.animationTimers.timeout(() => {
                        if (!isPlaybackCurrent()) return;
                        if (!this.card) return;
                        const liveContainerRect = this.card.getBoundingClientRect();
                        const sequenced = targetSequence?.[eventIndex];
                        const pendingTargets = Array.isArray(sequenced)
                            ? sequenced.map(index => ({ index, result: 'pending' }))
                            : eventIndex === 0 ? targets : [];
                        if (pendingTargets.length === 0 && pattern.runtimeImpactAllowEmptySequence) {
                            const side = eventIndex === 1 ? -1 : 1;
                            const anchorRect = targetCard.getBoundingClientRect();
                            const phantomX = side < 0
                                ? containerRect.left - Math.max(90, anchorRect.width)
                                : containerRect.right + Math.max(90, anchorRect.width);
                            const phantomCard = {
                                querySelector: () => null,
                                getBoundingClientRect: () => ({
                                    left: phantomX,
                                    top: anchorRect.top,
                                    width: anchorRect.width,
                                    height: anchorRect.height
                                })
                            };
                            this.createElementalAttack(
                                this.resolveLiveElementalOrigin(
                                    monsterImg, phantomCard, pattern, monsterCenter),
                                liveContainerRect,
                                phantomCard,
                                { index: -1, result: 'dodge' },
                                attackName,
                                emoji,
                                eventIndex,
                                pattern
                            );
                            return;
                        }
                        pendingTargets.forEach((pendingTarget, order) => {
                            const pendingCard = this.card.querySelector(`#fight-card-${pendingTarget.index}`);
                            if (!pendingCard) return;
                            this.createElementalAttack(
                                this.resolveLiveElementalOrigin(
                                    monsterImg, pendingCard, pattern, monsterCenter),
                                liveContainerRect,
                                pendingCard,
                                pendingTarget,
                                attackName,
                                emoji,
                                order,
                                pattern
                            );
                        });
                    }, launchDelayMs);
                });
            }
            return;
        }
        // Explicit gas attacks layer their elemental plume over their authored
        // body motion. Tail/sweep/charge branches below must not swallow it.
        const layeredGasDelivery = isElementalDelivery && pattern?.delivery === 'gas';
        if (layeredGasDelivery) {
            targets.forEach((target, order) => {
                const liveTargetCard = this.card.querySelector(`#fight-card-${target.index}`);
                if (!liveTargetCard) return;
                this.createElementalAttack(
                    monsterCenter, containerRect, liveTargetCard, target,
                    attackName, emoji, order, pattern
                );
            });
        }
        if (isUltimate && !isValstraxAmbush) {
            const elementalUltimate = pattern?.tags?.includes('elemental') || type === 'elemental';
            this.createUltimateSpectacle(monsterCenter, containerRect, attackName, emoji, pattern, elementalUltimate);
            monsterImg.classList.remove('monster-signature-ultimate');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-signature-ultimate');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-signature-ultimate'), 1700);
        }
        if (usesChargeSpectacle) return;

        // Named exceptions stay below the semantic profile resolver. Every pattern receives
        // a motion profile even when it has no one-off animation.
        if (attackName) {
            const cleanName = attackName.toLowerCase();

            if (cleanName.includes('붉은 혜성 강습')) {
                this.card.querySelector('.hunt-valstrax-ambush-warning')?.remove();
                this.card.classList.remove('hunt-valstrax-impact');
                void this.card.offsetWidth;
                this.card.classList.add('hunt-valstrax-impact');
                this.animationTimers.timeout(() => {
                    if (!isPlaybackCurrent()) return;
                    this.card?.classList.remove('hunt-valstrax-impact');
                }, 1800);
                return;
            }
            
            // 1. Roar attack
            if (cleanName.includes('포효') || cleanName.includes('울음') || cleanName.includes('노성') || cleanName.includes('소리') || cleanName.includes('음파') || cleanName.includes('폭효')) {
                if (pattern?.runtimeImpactPending) return;
                this.triggerMonsterRoar(pattern);
                return;
            }

            // 2. Tail Spin
            if (pattern?.tags?.includes('tail')) {
                const slash = document.createElement('div');
                slash.className = 'tailspin-slash-particle';
                slash.textContent = '🌀';
                const tailPoint = anatomy?.visualPoint?.(this.owner?.selectedMonster, 'tail', 2);
                const showcaseRect = showcase.getBoundingClientRect?.();
                if (tailPoint && showcaseRect) {
                    slash.style.left = `${monsterRect.left + monsterRect.width * tailPoint.x - showcaseRect.left}px`;
                    slash.style.top = `${monsterRect.top + monsterRect.height * tailPoint.y - showcaseRect.top}px`;
                }
                showcase.appendChild(slash);
                this.animationTimers.timeout(() => slash.remove(), 700);
                this.animationTimers.timeout(() => {
                    if (!isPlaybackCurrent()) return;
                    if (!this.card) return;
                    this.card.classList.remove('card-heavy-shake-anim');
                    void this.card.offsetWidth;
                    this.card.classList.add('card-heavy-shake-anim');
                    this.animationTimers.timeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                }, 200);
                return;
            }
            if (cleanName.includes('회전') || cleanName.includes('대회전') || cleanName.includes('테일베기') || cleanName.includes('꼬리치기') || cleanName.includes('휩쓸기') || cleanName.includes('후려치기')) {
                // Spawn a spinning/scaling wind slash emoji centered on the monster
                const slash = document.createElement('div');
                slash.className = 'tailspin-slash-particle';
                slash.textContent = '🌀';
                showcase.appendChild(slash);
                this.animationTimers.timeout(() => slash.remove(), 700);

                // Card heavy shake on impact
                this.animationTimers.timeout(() => {
                    if (!isPlaybackCurrent()) return;
                    if (this.card) {
                        this.card.classList.remove('card-heavy-shake-anim');
                        void this.card.offsetWidth;
                        this.card.classList.add('card-heavy-shake-anim');
                        this.animationTimers.timeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                    }
                }, 200);

                return;
            }

            // 3. Charge toward target
            if (cleanName.includes('돌진') || cleanName.includes('급습') || cleanName.includes('돌격') || cleanName.includes('대폭격') || cleanName.includes('태클') || cleanName.includes('강습') || cleanName.includes('박치기') || cleanName.includes('몸통박치기') || cleanName.includes('들이받기')) {
                const cardRect = targetCard.getBoundingClientRect();
                const cardCenter = {
                    x: cardRect.left + cardRect.width / 2,
                    y: cardRect.top + cardRect.height / 2
                };
                const dx = cardCenter.x - monsterCenter.x;
                const dy = cardCenter.y - monsterCenter.y;

                // Spawn dust particles drifting in the opposite direction of the charge
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const odx = -(dx / len) * 80;
                const ody = -(dy / len) * 80;

                for (let i = 0; i < 4; i++) {
                    this.animationTimers.timeout(() => {
                        if (!isPlaybackCurrent()) return;
                        if (!this.card) return;
                        const dust = document.createElement('div');
                        dust.className = 'charge-dust-particle';
                        dust.textContent = '💨';
                        dust.style.setProperty('--dx', `${odx + (Math.random() - 0.5) * 40}px`);
                        dust.style.setProperty('--dy', `${ody + (Math.random() - 0.5) * 40}px`);
                        dust.style.left = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
                        dust.style.top = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
                        showcase.appendChild(dust);
                        this.animationTimers.timeout(() => dust.remove(), 700);
                    }, i * 80);
                }

                // The semantic motion class owns travel, return, and cleanup.
                // Only the impact shake remains here; inline transforms used to
                // override every species motion and stale timers could freeze all
                // later monster animations.
                this.animationTimers.timeout(() => {
                    if (!isPlaybackCurrent()) return;
                    if (this.card) {
                        this.card.classList.remove('card-heavy-shake-anim');
                        void this.card.offsetWidth;
                        this.card.classList.add('card-heavy-shake-anim');
                        this.animationTimers.timeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                    }
                }, Math.max(180, Math.round(Number(motionProfile?.duration || 700) * .45)));
                return;
            }
        }

        if (isElementalDelivery && !layeredGasDelivery) {
            targets.forEach((t, order) => {
                const curTargetCard = this.card.querySelector(`#fight-card-${t.index}`);
                if (!curTargetCard) return;
                this.createElementalAttack(monsterCenter, containerRect, curTargetCard, t, attackName, emoji, order, pattern);
            });
            return;
        }

        // The semantic motion class owns the monster transform. The old inline
        // transform path overwrote its keyframes and could strand the sprite when
        // another action began before the reset timer fired.
        if (motionProfile) {
            this.animationTimers.timeout(() => {
                if (!isPlaybackCurrent()) return;
                if (!this.card) return;
                this.card.classList.remove('card-heavy-shake-anim');
                void this.card.offsetWidth;
                this.card.classList.add('card-heavy-shake-anim');
                this.animationTimers.timeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
            }, Math.max(120, Math.round(Number(motionProfile.duration || 600) * 0.45)));
            return;
        }

        if (type === 'physical' || type === 'hybrid') {
            const cardRect = targetCard.getBoundingClientRect();
            const cardCenter = {
                x: cardRect.left + cardRect.width / 2,
                y: cardRect.top + cardRect.height / 2
            };

            const dx = cardCenter.x - monsterCenter.x;
            const dy = cardCenter.y - monsterCenter.y;

            // Trigger card shake on physical impact
            this.animationTimers.timeout(() => {
                if (!isPlaybackCurrent()) return;
                if (this.card) {
                    this.card.classList.remove('card-heavy-shake-anim');
                    void this.card.offsetWidth;
                    this.card.classList.add('card-heavy-shake-anim');
                    this.animationTimers.timeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                }
            }, 200);

            if (type === 'physical') {
                monsterImg.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                monsterImg.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;

                this.animationTimers.timeout(() => {
                    if (!isPlaybackCurrent()) return;
                    monsterImg.style.transition = 'transform 0.3s ease-in-out';
                    monsterImg.style.transform = '';
                    this.animationTimers.timeout(() => {
                        if (!isPlaybackCurrent()) return;
                        monsterImg.style.transition = '';
                    }, 300);
                }, 200);
            } else if (type === 'hybrid') {
                const leftEmoji = document.createElement('div');
                leftEmoji.className = 'monster-hybrid-emoji-left';
                leftEmoji.textContent = emoji;

                const rightEmoji = document.createElement('div');
                rightEmoji.className = 'monster-hybrid-emoji-right';
                rightEmoji.textContent = emoji;

                showcase.appendChild(leftEmoji);
                showcase.appendChild(rightEmoji);

                void leftEmoji.offsetWidth;

                monsterImg.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                leftEmoji.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                rightEmoji.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

                monsterImg.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
                leftEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
                rightEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;

                this.animationTimers.timeout(() => {
                    if (!isPlaybackCurrent()) return;
                    monsterImg.style.transition = 'transform 0.3s ease-in-out';
                    monsterImg.style.transform = '';

                    leftEmoji.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-out';
                    rightEmoji.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-out';
                    leftEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                    rightEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                    leftEmoji.style.opacity = '0';
                    rightEmoji.style.opacity = '0';

                    this.animationTimers.timeout(() => {
                        if (!isPlaybackCurrent()) return;
                        monsterImg.style.transition = '';
                        leftEmoji.remove();
                        rightEmoji.remove();
                    }, 300);
                }, 200);
            }
        }
    }


}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterAttackAnimator;
else if (typeof window !== 'undefined') window.HuntMonsterAttackAnimator = HuntMonsterAttackAnimator;
