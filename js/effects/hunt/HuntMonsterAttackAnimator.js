class HuntMonsterAttackAnimator {
    constructor(owner, onRoar) {
        this.owner = owner;
        this.onRoar = onRoar;
        this.motionGeneration = 0;
        this.activeMonsterMotion = null;
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

    resolveFacingLayer(monsterImg) {
        const closest = monsterImg?.closest?.('.hunt-monster-facing-layer');
        return closest?.classList?.contains?.('hunt-monster-facing-layer') ? closest : null;
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
            timeoutId: undefined,
            finishers: onFinish ? [onFinish] : [],
            expectedAnimationNames,
            patternId: metadata.patternId || null,
            isolatedLayer: motionElement.classList.contains?.('hunt-monster-attack-motion') || false
        };
        active.finish = event => {
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
        this.card?.querySelectorAll?.('.monster-local-action-fx,.monster-charge-track,.monster-burrow-dust')
            ?.forEach(node => node.remove());
        return cleared;
    }

    triggerMonsterRoar(pattern = null) {
        this.onRoar(pattern);
    }

    playPatternMotion(monsterImg, targetCard, pattern, attackName, type) {
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
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        const maxX = Math.max(150, ((stage?.clientWidth || 720) - monsterRect.width) / 2 + 130);
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
        const attackX = Math.max(-maxX, Math.min(maxX, dx * approachScaleX));
        motionElement.style.setProperty('--monster-attack-x', `${attackX}px`);
        // Targeted strikes travel mainly across the wide monster lane. Their
        // downward component is capped so the enlarged impact frame cannot enter
        // OBS's bottom 15% chat-safe area; dedicated charge motions own their
        // intentional off-screen travel separately.
        const attackY = contactMotion
            ? Math.max(-240, Math.min(430, dy * approachScaleY))
            : Math.max(-190, Math.min(8, dy * approachScaleY));
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
            anatomy
        });
        if (profile.id === 'ground-charge' || profile.id === 'rathian-ground-charge' || profile.id === 'ground-charge-cross'
            || profile.id === 'ground-charge-zigzag' || profile.id === 'ground-charge-double'
            || profile.id === 'ground-charge-triple' || profile.id === 'aerial-charge-cross'
            || profile.id === 'legiana-drill-cross' || profile.id === 'tigrex-charge-chain') {
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
            const routePoint = rect => ({
                x: Math.max(-maxX, Math.min(maxX,
                    rect.left + rect.width / 2 - (monsterRect.left + monsterRect.width / 2))),
                y: Math.max(-240, Math.min(430,
                    rect.top + rect.height / 2 - (monsterRect.top + monsterRect.height / 2)))
            });
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
                const timeline = Array.isArray(pattern.runtimeResolvedImpactTimeline)
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
        const activeMotion = this.startMonsterMotion(
            motionElement,
            motionClass,
            profile.duration,
            null,
            {
                patternId: pattern?.id || null,
                disableCssAnimation: useDynamicTigrexRoute
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
        }
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
        const maxX = Math.max(150, ((stage?.clientWidth || 720) - monsterRect.width) / 2 + 130);
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
        const scaledDuration = typeof HuntAtbConfig !== 'undefined' && HuntAtbConfig.scaleVisualDurationMs
            ? HuntAtbConfig.scaleVisualDurationMs(durationMs || (phase === 'enter' ? 1250 : 1450))
            : Number(durationMs || (phase === 'enter' ? 1250 : 1450));
        motionElement.style.setProperty('--monster-motion-duration', `${scaledDuration}ms`);

        if (phase === 'enter') {
            this.card.classList.add('hunt-monster-underground');
        } else if (phase === 'telegraph') {
            this.animationTimers.timeout(() => dust.remove(), Math.max(300, scaledDuration + 180));
            return;
        } else if (phase === 'emerge') {
            this.card.classList.remove('hunt-monster-underground');
            this.positionBurrowEmergence(motionElement, monsterImg, anchor, stage);
        }

        const motionClass = phase === 'enter' ? 'monster-motion-burrow-enter' : 'monster-motion-burrow-emerge';
        const finish = () => {
            if (phase === 'emerge') this.card?.classList.remove('hunt-monster-underground');
            if (phase === 'emerge') clearBurrowPosition();
            dust.remove();
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

    createChargeSpectacle(monsterImg, targets, crossScreen, durationMs = 0, pattern = null) {
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        if (!stage) return;
        const motionDuration = Math.max(900, Number(durationMs || (crossScreen ? 2150 : 2000)));
        const isStompBurst = stage.querySelector('[data-charge-launch-style="stomp-burst"]') !== null;
        const multiPassCharge = Array.isArray(this._activeChargePassSizes);
        const launchRatio = multiPassCharge ? .317 : .476;
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
        const strikeTargets = pass => {
            const configured = Array.isArray(this._activeChargePassSizes) ? this._activeChargePassSizes : null;
            if (!configured) return pass === 0 ? targets : [];
            const offset = pass === 0 ? 0 : configured[0];
            return targets.slice(offset, offset + configured[pass]);
        };
        const shakeTargets = pass => {
            strikeTargets(pass).forEach(target => {
                if (target.result === 'dodge') return;
                const hitCard = this.card?.querySelector(`#fight-card-${target.index}`);
                if (!hitCard) return;
                hitCard.classList.remove('element-impact-shake');
                void hitCard.offsetWidth;
                hitCard.classList.add('element-impact-shake');
            });
        };
        if (isStompBurst) {
            const stompRatios = multiPassCharge ? [.075, .17, .275] : [.09, .235, .39];
            const footRatios = [.34, .66, .50];
            stompRatios.forEach((ratio, index) => {
                this.animationTimers.timeout(() => {
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
        const impactRatios = Array.isArray(pattern?.impact?.passRatios)
            ? pattern.impact.passRatios
            : null;
        const firstImpactProgress = Array.isArray(this._activeChargePassSizes)
            ? Number(impactRatios?.[0] ?? .22)
            : .36;
        const secondImpactProgress = Number(impactRatios?.[1] ?? .68);
        this.animationTimers.timeout(() => shakeTargets(0), Math.round(motionDuration * firstImpactProgress));
        if (Array.isArray(this._activeChargePassSizes)) {
            this.animationTimers.timeout(() => shakeTargets(1), Math.round(motionDuration * secondImpactProgress));
        }
        if (pattern?.runtimeWhiffStuck) {
            this.animationTimers.timeout(() => {
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
            this.card?.querySelectorAll('.element-impact-shake').forEach(card => card.classList.remove('element-impact-shake'));
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
            { id: 'wind', test: /(^|\s)wind(\s|$)|바람|폭풍|회오리|진공|분사/, emoji: '🌪️', color: '#baffdc', hot: '#ffffff', shadow: '#247f75' }
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
        const isDodge = target.result === 'dodge';
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

        const wash = document.createElement('div');
        wash.className = 'monster-element-wash';
        fx.appendChild(wash);

        const muzzle = document.createElement('div');
        muzzle.className = 'monster-element-muzzle';
        muzzle.innerHTML = '<i></i><i></i>';
        fx.appendChild(muzzle);

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

        const head = document.createElement('div');
        head.className = 'monster-element-head';
        head.textContent = theme.emoji || fallbackEmoji;
        fx.appendChild(head);

        if (!isDodge) {
            const impact = document.createElement('div');
            impact.className = 'monster-element-impact';
            impact.innerHTML = `<b>${theme.emoji || fallbackEmoji}</b><i></i><i></i><i></i>`;
            fx.appendChild(impact);
        }

        for (let i = 0; i < (isUltimate ? 18 : 12); i++) {
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

        if (!isDodge) {
            this.animationTimers.timeout(() => {
                if (!this.card) return;
                targetCard.classList.remove('element-impact-shake');
                void targetCard.offsetWidth;
                targetCard.classList.add('element-impact-shake');
                this.animationTimers.timeout(() => targetCard.classList.remove('element-impact-shake'), 440);
            }, 420 + order * 35);
        }
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
        const targetCard = this.card.querySelector(`#fight-card-${firstTarget.index}`);
        if (!targetCard) {
            this.traceMonsterMotion('skip', {
                patternId,
                reason: 'target-card-missing',
                targetIndex: firstTarget.index
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
        const motionProfile = this.playPatternMotion(monsterImg, targetCard, pattern, attackName, type);
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
        if (pattern?.attachedFx) {
            this.createMonsterAttachedEmojiFx(
                monsterImg,
                pattern.attachedFx.emoji || '💥',
                pattern.attachedFx.className || 'attached-action',
                Number(pattern.attachedFx.durationMs || motionProfile?.duration || 900),
                pattern.originPart || null
            );
        } else if (motionProfile?.id === 'tail-slam-rock') {
            const duration = Number(motionProfile?.duration || 3400);
            this.createLocalEmojiFx(stage, '☁️', 'tail-slam-dust', duration);
            this.animationTimers.timeout(() => {
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
                const targetRect = (targetCard.querySelector('.game-hunt-weapon-img-container') || targetCard).getBoundingClientRect();
                const stageRect = stage?.getBoundingClientRect();
                this.createLocalEmojiFx(stage, '💥', 'uppercut-impact', 650, stageRect ? {
                    left: `${targetRect.left + targetRect.width / 2 - stageRect.left}px`,
                    top: `${targetRect.top + targetRect.height / 2 - stageRect.top}px`
                } : {});
            }, Math.round(Number(motionProfile?.duration || 2800) * .57));
        }
        if (motionProfile?.id === 'horn-uppercut' && firstTarget.result === 'hit') {
            const weapon = targetCard.querySelector('.game-hunt-weapon-img-container');
            if (weapon) {
                const launchDuration = Math.max(1050, Number(motionProfile?.duration || 1050));
                weapon.style.setProperty('--monster-uppercut-launch-duration', `${launchDuration}ms`);
                weapon.classList.remove('monster-uppercut-launched');
                void weapon.offsetWidth;
                weapon.classList.add('monster-uppercut-launched');
                this.animationTimers.timeout(() => {
                    weapon.classList.remove('monster-uppercut-launched');
                    weapon.style.removeProperty('--monster-uppercut-launch-duration');
                }, launchDuration + 80);
            }
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
                const travelMs = 720;
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
                    const launchDelayMs = Math.max(0,
                        Number(event.atTicks || pattern.runtimeImpactDelayTicks || 0)
                            * 1000 / ticksPerSecond - travelMs);
                    this.animationTimers.timeout(() => {
                        if (!this.card) return;
                        const indices = Array.isArray(event.targetIndices) && event.targetIndices.length
                            ? event.targetIndices
                            : targets.map(target => target.index);
                        this.owner?.onMonsterProjectileLaunchAudio?.(this.owner.selectedMonster, pattern);
                        indices.forEach(index => {
                            const liveCard = this.card.querySelector(`#fight-card-${index}`);
                            if (liveCard) this.createRockProjectile(monsterImg, liveCard, pattern, travelMs);
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
        if (motionProfile?.id === 'ground-charge' || motionProfile?.id === 'ground-charge-cross'
            || motionProfile?.id === 'ground-charge-zigzag' || motionProfile?.id === 'ground-charge-double'
            || motionProfile?.id === 'ground-charge-triple' || motionProfile?.id === 'aerial-charge-cross'
            || motionProfile?.id === 'legiana-drill-cross') {
            this.createChargeSpectacle(
                monsterImg,
                targets,
                motionProfile.id !== 'ground-charge',
                motionProfile.duration,
                pattern
            );
            return;
        }

        // Named exceptions stay below the semantic profile resolver. Every pattern receives
        // a motion profile even when it has no one-off animation.
        if (attackName) {
            const cleanName = attackName.toLowerCase();

            if (cleanName.includes('붉은 혜성 강습')) {
                this.card.querySelector('.hunt-valstrax-ambush-warning')?.remove();
                this.card.classList.remove('hunt-valstrax-impact');
                void this.card.offsetWidth;
                this.card.classList.add('hunt-valstrax-impact');
                targets.forEach(target => {
                    const hitCard = this.card.querySelector(`#fight-card-${target.index}`);
                    if (!hitCard || target.result === 'dodge') return;
                    hitCard.classList.remove('element-impact-shake');
                    void hitCard.offsetWidth;
                    hitCard.classList.add('element-impact-shake');
                });
                this.animationTimers.timeout(() => {
                    this.card?.classList.remove('hunt-valstrax-impact');
                    this.card?.querySelectorAll('.element-impact-shake').forEach(card => card.classList.remove('element-impact-shake'));
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
                    monsterImg.style.transition = 'transform 0.3s ease-in-out';
                    monsterImg.style.transform = '';
                    this.animationTimers.timeout(() => {
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
                    monsterImg.style.transition = 'transform 0.3s ease-in-out';
                    monsterImg.style.transform = '';

                    leftEmoji.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-out';
                    rightEmoji.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-out';
                    leftEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                    rightEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                    leftEmoji.style.opacity = '0';
                    rightEmoji.style.opacity = '0';

                    this.animationTimers.timeout(() => {
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
