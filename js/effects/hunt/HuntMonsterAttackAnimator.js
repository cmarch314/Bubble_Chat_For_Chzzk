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
        const movementTicks = Math.max(1, Math.round(Number(pattern.movement?.ticks || 40)));
        const visibleStart = .10;
        const visibleEnd = .82;
        const routeWidth = geometry.endX - geometry.startX;
        if (Math.abs(routeWidth) < 1) return null;

        const timeline = targetIndices.map(targetIndex => {
            const targetCard = this.card.querySelector?.(`#fight-card-${targetIndex}`);
            const targetAnchor = targetCard?.querySelector?.('.game-hunt-weapon-img-container') || targetCard;
            const targetRect = targetAnchor?.getBoundingClientRect?.();
            if (!targetRect) return null;
            const targetX = targetRect.left + targetRect.width / 2;
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

        if (['ground-charge-cross', 'aerial-charge-cross', 'ground-charge'].includes(id)) {
            if (!horizontalDirection) return null;
            const hideOffset = id === 'aerial-charge-cross' ? .65 : .73;
            return [
                { offset: 0, direction: horizontalDirection },
                { offset: hideOffset, direction: horizontalDirection },
                { offset: Math.min(.99, hideOffset + .01), direction: 0 },
                { offset: 1, direction: 0 }
            ];
        }
        if (id === 'ground-charge-double') {
            const firstDirection = horizontalDirection;
            const betweenDirection = Math.abs(secondX - attackX) >= 12
                ? Math.sign(secondX - attackX)
                : -firstDirection;
            if (!firstDirection && !betweenDirection) return null;
            return [
                { offset: 0, direction: firstDirection || betweenDirection },
                { offset: .39, direction: firstDirection || betweenDirection },
                { offset: .40, direction: betweenDirection || firstDirection },
                { offset: .78, direction: betweenDirection || firstDirection },
                { offset: .79, direction: 0 },
                { offset: 1, direction: 0 }
            ];
        }
        if (id === 'ground-charge-triple') {
            const firstDirection = horizontalDirection || -1;
            return [
                { offset: 0, direction: firstDirection },
                { offset: .30, direction: firstDirection },
                { offset: .31, direction: -firstDirection },
                { offset: .60, direction: -firstDirection },
                { offset: .61, direction: firstDirection },
                { offset: .88, direction: firstDirection },
                { offset: .89, direction: 0 },
                { offset: 1, direction: 0 }
            ];
        }
        if (id === 'ground-charge-zigzag') {
            return [
                { offset: 0, direction: -1 }, { offset: .25, direction: -1 },
                { offset: .26, direction: 1 }, { offset: .43, direction: 1 },
                { offset: .44, direction: -1 }, { offset: .61, direction: -1 },
                { offset: .62, direction: 1 }, { offset: .79, direction: 1 },
                { offset: .80, direction: 0 }, { offset: 1, direction: 0 }
            ];
        }
        if (id === 'lateral-sweep') {
            return [
                { offset: 0, direction: -1 }, { offset: .14, direction: -1 },
                { offset: .15, direction: 1 }, { offset: .42, direction: 1 },
                { offset: .43, direction: -1 }, { offset: .68, direction: -1 },
                { offset: .69, direction: 1 }, { offset: .84, direction: 1 },
                { offset: .85, direction: -1 }, { offset: 1, direction: 0 }
            ];
        }
        if (id === 'pounce-chain') {
            return [
                { offset: 0, direction: -1 }, { offset: .15, direction: -1 },
                { offset: .16, direction: 1 }, { offset: .51, direction: 1 },
                { offset: .52, direction: -1 }, { offset: .70, direction: -1 },
                { offset: .71, direction: 1 }, { offset: .86, direction: 1 },
                { offset: .87, direction: -1 }, { offset: 1, direction: 0 }
            ];
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
        const keyframes = plan.map(step => ({
            offset: step.offset,
            transform: `scaleX(${scaleFor(step.direction)})`
        }));
        layer.dataset.monsterFacingPlan = String(profile?.id || 'directional');
        const animation = typeof layer.animate === 'function'
            ? layer.animate(keyframes, { duration: profile.duration, easing: 'linear', fill: 'both' })
            : null;
        if (!animation) layer.style.transform = keyframes[0].transform;
        const cleanup = () => {
            try { animation?.cancel(); } catch (_) { /* detached OBS node */ }
            layer.style.removeProperty('transform');
            delete layer.dataset.monsterFacingPlan;
        };
        if (activeMotion) activeMotion.finishers.push(cleanup);
        return { animation, keyframes, cleanup };
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
        void motionElement.offsetWidth;
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

    triggerMonsterRoar() {
        this.onRoar();
    }

    playPatternMotion(monsterImg, targetCard, pattern, attackName, type) {
        const Catalog = typeof HuntMonsterAnimationCatalog !== 'undefined' ? HuntMonsterAnimationCatalog : null;
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
        const dx = targetRect.left + targetRect.width / 2 - (monsterRect.left + monsterRect.width / 2);
        const dy = targetRect.top + targetRect.height / 2 - (monsterRect.top + monsterRect.height / 2);
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        const maxX = Math.max(150, ((stage?.clientWidth || 720) - monsterRect.width) / 2 + 130);
        motionElement?.style?.setProperty?.('--monster-lane-x', `${maxX}px`);
        const isUppercut = profile.id === 'horn-uppercut';
        const isSideTackle = profile.id === 'side-tackle-contact';
        const contactMotion = pattern?.tags?.includes('target-contact')
            || ['close-strike', 'horn-uppercut', 'horn-sweep-contact', 'side-tackle-contact'].includes(profile.id);
        const isTailMotion = ['tail-sweep', 'tail-sweep-double', 'tail-slam-rock'].includes(profile.id);
        const geometry = pattern?.animationGeometry || {};
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
        motionElement.dataset.monsterRig = profile.rig.id;
        let secondFacingX = 0;
        if (profile.id === 'ground-charge' || profile.id === 'ground-charge-cross'
            || profile.id === 'ground-charge-zigzag' || profile.id === 'ground-charge-double'
            || profile.id === 'ground-charge-triple' || profile.id === 'aerial-charge-cross') {
            const cardRect = this.card.getBoundingClientRect();
            const targetIndex = Number(targetCard.id.replace(/\D+/g, '')) || 0;
            const crossGeometry = profile.id === 'aerial-charge-cross'
                ? this.screenCrossGeometry(monsterImg, pattern)
                : null;
            const authoredDirection = String(pattern?.runtimeSweepDirection || '');
            const direction = crossGeometry?.direction
                || (authoredDirection === 'left-to-right' ? 1
                : authoredDirection === 'right-to-left' ? -1
                    : targetIndex < 2 ? -1 : 1);
            motionElement.style.setProperty('--monster-charge-bottom', `${Math.max(620, cardRect.bottom - monsterRect.top + monsterRect.height)}px`);
            motionElement.style.setProperty('--monster-charge-top', `${Math.max(420, monsterRect.bottom - cardRect.top + monsterRect.height)}px`);
            motionElement.style.setProperty('--monster-charge-side', `${crossGeometry?.endOffset
                ?? direction * Math.max(1150, cardRect.width * .72 + monsterRect.width)}px`);
            motionElement.style.setProperty('--monster-charge-start-side', `${crossGeometry?.startOffset
                ?? direction * -Math.max(1050, cardRect.width * .68 + monsterRect.width)}px`);
            if (profile.id === 'aerial-charge-cross') {
                const targetRows = (pattern?.runtimeSweepDirection
                    ? [...this.card.querySelectorAll('.game-hunt-weapon-card')]
                    : [targetCard])
                    .map(card => (card.querySelector('.game-hunt-weapon-img-container') || card).getBoundingClientRect());
                const rowY = targetRows.length
                    ? targetRows.reduce((sum, rect) => sum + rect.top + rect.height / 2, 0) / targetRows.length
                    : targetRect.top + targetRect.height / 2;
                const crossY = Math.max(-80, Math.min(430, rowY - (monsterRect.top + monsterRect.height / 2)));
                motionElement.style.setProperty('--monster-charge-cross-y', `${crossY}px`);
                motionElement.style.setProperty('--monster-charge-tilt', `${direction * 7}deg`);
            }
            if (profile.id === 'ground-charge-double') {
                const anchors = Array.isArray(pattern?.runtimeChargeAnchors) ? pattern.runtimeChargeAnchors : [];
                const secondTarget = this.card.querySelector(`#fight-card-${anchors[1]}`);
                const secondAnchor = secondTarget?.querySelector('.game-hunt-weapon-img-container') || secondTarget || targetAnchor;
                const secondRect = secondAnchor.getBoundingClientRect();
                const firstX = Math.max(-maxX, Math.min(maxX, dx * .92));
                const secondX = Math.max(-maxX, Math.min(maxX,
                    secondRect.left + secondRect.width / 2 - (monsterRect.left + monsterRect.width / 2)));
                secondFacingX = secondX;
                const secondY = Math.max(-240, Math.min(430,
                    secondRect.top + secondRect.height / 2 - (monsterRect.top + monsterRect.height / 2)));
                motionElement.style.setProperty('--monster-charge-first-x', `${firstX}px`);
                motionElement.style.setProperty('--monster-charge-first-y', `${attackY}px`);
                motionElement.style.setProperty('--monster-charge-second-x', `${secondX}px`);
                motionElement.style.setProperty('--monster-charge-second-y', `${secondY}px`);
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
                const point = rect => ({
                    x: Math.max(-maxX, Math.min(maxX,
                        rect.left + rect.width / 2 - (monsterRect.left + monsterRect.width / 2))),
                    y: Math.max(-240, Math.min(430,
                        rect.top + rect.height / 2 - (monsterRect.top + monsterRect.height / 2)))
                });
                const first = point(firstRect);
                const second = point(secondRect);
                const third = point(thirdRect);
                secondFacingX = second.x;
                motionElement.style.setProperty('--monster-charge-first-x', `${first.x}px`);
                motionElement.style.setProperty('--monster-charge-first-y', `${first.y}px`);
                motionElement.style.setProperty('--monster-charge-second-x', `${second.x}px`);
                motionElement.style.setProperty('--monster-charge-second-y', `${second.y}px`);
                motionElement.style.setProperty('--monster-charge-third-x', `${third.x}px`);
                motionElement.style.setProperty('--monster-charge-third-y', `${third.y}px`);
            }
        }
        const motionClass = `monster-motion-${profile.id}`;
        const activeMotion = this.startMonsterMotion(
            motionElement,
            motionClass,
            profile.duration,
            null,
            { patternId: pattern?.id || null }
        );
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

    createChargeSpectacle(monsterImg, targets, crossScreen, durationMs = 0) {
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        if (!stage) return;
        const motionDuration = Math.max(900, Number(durationMs || (crossScreen ? 2150 : 2000)));
        const track = document.createElement('div');
        track.className = `monster-charge-track${crossScreen ? ' is-cross' : ' is-forward'}`;
        track.innerHTML = Array.from({ length: 9 }, (_, index) => `<i style="--step:${index};--stagger:${index % 2}"></i>`).join('');
        stage.appendChild(track);
        for (let i = 0; i < 4; i++) {
            this.createLocalEmojiFx(stage, '💨', `charge-wind wind-${i}`, motionDuration);
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
        const firstImpactProgress = Array.isArray(this._activeChargePassSizes) ? .22 : .36;
        this.animationTimers.timeout(() => shakeTargets(0), Math.round(motionDuration * firstImpactProgress));
        if (Array.isArray(this._activeChargePassSizes)) {
            this.animationTimers.timeout(() => shakeTargets(1), Math.round(motionDuration * .68));
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

    createMonsterAttachedEmojiFx(monsterImg, emoji, extraClass, durationMs) {
        const motionElement = this.resolveMotionElement(monsterImg);
        const container = motionElement !== monsterImg
            ? motionElement
            : monsterImg?.closest?.('.hunt-monster-motion-stage');
        return this.createLocalEmojiFx(container, emoji, extraClass, durationMs);
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
            { id: 'poison', test: /(^|\s)poison(\s|$)|독|맹독|독조|독액/, emoji: '☠️', color: '#b8ff35', hot: '#f1ffad', shadow: '#4a0570' },
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
        if (/Sweep|FlameThrow|Continuous|쓸기|휩쓸|지속|분사|방출|화염\s*브레스|겁염/i.test(evidence)) return 'stream';
        if (pattern?.tags?.includes('projectile') || pattern?.type === 'projectile') return 'projectile';
        return 'stream';
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

        const deliveryBody = document.createElement('div');
        if (delivery === 'projectile') {
            // A fireball is a detached body, not a beam restyled into a circle.
            // Keeping it out of the beam DOM prevents stale or competing OBS CSS
            // from ever revealing a full-length laser for projectile attacks.
            deliveryBody.className = 'monster-element-projectile';
        } else {
            deliveryBody.className = 'monster-element-beam';
            deliveryBody.innerHTML = '<i class="beam-aura"></i><i class="beam-body"></i><i class="beam-core"></i><i class="beam-ripple"></i>';
        }
        fx.appendChild(deliveryBody);

        if (delivery === 'gas') {
            for (let i = 0; i < 9; i++) {
                const progress = (i + 1) / 10;
                const lateral = ((i % 3) - 1) * 34;
                const cloud = document.createElement('i');
                cloud.className = 'monster-gas-cloud';
                cloud.style.setProperty('--gas-start-x', `${dx * progress * .22}px`);
                cloud.style.setProperty('--gas-start-y', `${dy * progress * .22 + lateral * .4}px`);
                cloud.style.setProperty('--gas-x', `${dx * progress}px`);
                cloud.style.setProperty('--gas-y', `${dy * progress + lateral}px`);
                cloud.style.setProperty('--gas-size', `${82 + (i % 4) * 18}px`);
                cloud.style.setProperty('--gas-delay', `${order * 35 + i * 38}ms`);
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
        const isElementalDelivery = type === 'elemental'
            || pattern?.type === 'projectile'
            || pattern?.tags?.includes('elemental')
            || ['projectile', 'beam', 'stream', 'gas', 'field'].includes(pattern?.delivery);
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
        const isRoar = type === 'roar'
            || pattern?.type === 'roar'
            || pattern?.tags?.includes('roar');
        if (isRoar) {
            if (!pattern?.runtimeImpactPending) this.triggerMonsterRoar();
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
                Number(pattern.attachedFx.durationMs || motionProfile?.duration || 900)
            );
        } else if (motionProfile?.id === 'tail-slam-rock') {
            const duration = Number(motionProfile?.duration || 3400);
            this.createLocalEmojiFx(stage, '☁️', 'tail-slam-dust', duration);
            this.animationTimers.timeout(() => {
                const rockTarget = targets[1] || targets[0];
                const rockCard = this.card.querySelector(`#fight-card-${rockTarget.index}`) || targetCard;
                const rockRect = (rockCard.querySelector('.game-hunt-weapon-img-container') || rockCard).getBoundingClientRect();
                const stageRect = stage?.getBoundingClientRect();
                this.createLocalEmojiFx(stage, '🪨', 'tail-rock-projectile', Math.max(700, duration * .42), stageRect ? {
                    left: `${rockRect.left + rockRect.width / 2 - stageRect.left}px`,
                    top: `${rockRect.top + rockRect.height / 2 - stageRect.top}px`
                } : {});
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
            const delivery = authoredDelivery;
            const usesDetachedDelivery = isElementalDelivery
                && ['projectile', 'stream', 'beam', 'gas'].includes(delivery);
            if (usesDetachedDelivery) {
                const ticksPerSecond = typeof HuntAtbConfig !== 'undefined'
                    ? Number(HuntAtbConfig.TICKS_PER_SECOND || 10)
                    : 10;
                const visualTravelMs = delivery === 'projectile' ? 720 : 900;
                const timeline = Array.isArray(pattern.impactTimeline) && pattern.impactTimeline.length
                    ? pattern.impactTimeline
                    : [{ atTicks: pattern.runtimeImpactDelayTicks }];
                const targetSequence = Array.isArray(pattern.runtimeImpactTargetSequence)
                    ? pattern.runtimeImpactTargetSequence
                    : null;
                timeline.forEach((event, eventIndex) => {
                    const impactTicks = Number(event.atTicks ?? pattern.runtimeImpactDelayTicks ?? 0);
                    const launchDelayMs = Math.max(
                        0,
                        Math.round(impactTicks * (1000 / ticksPerSecond) - visualTravelMs)
                    );
                    this.animationTimers.timeout(() => {
                        if (!this.card) return;
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
                                monsterCenter,
                                containerRect,
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
                                monsterCenter,
                                containerRect,
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
            || motionProfile?.id === 'ground-charge-triple' || motionProfile?.id === 'aerial-charge-cross') {
            this.createChargeSpectacle(monsterImg, targets, motionProfile.id !== 'ground-charge', motionProfile.duration);
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
                this.triggerMonsterRoar();
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

        if (isElementalDelivery) {
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
