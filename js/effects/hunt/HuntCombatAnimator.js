class HuntCombatAnimator {
    static PITFALL_RELEASE_TICK_MS = 100;
    static PITFALL_RELEASE_TICKS = 8;

    constructor(owner) {
        this.owner = owner;
        this.activeWeaponAnimations = new Map();
        this.weaponAnimationGenerations = new Map();
        this.monsterPartBreakVisualQueue = [];
        this.monsterPartBreakVisualActive = false;
        this.monsterStunMarkerGeneration = 0;
        this.monsterKnockdownAnimation = null;
        this.monsterAttackAnimator = new HuntMonsterAttackAnimator(
            owner,
            pattern => this.triggerMonsterRoar(pattern),
            (index, kind, size, active) =>
                this.triggerHunterInterference(index, kind, size, active)
        );
    }

    get card() { return this.owner.card; }

    get animationTimers() { return this.owner.animationTimers; }

    visualDuration(durationMs) {
        return typeof HuntAtbConfig !== 'undefined' && HuntAtbConfig.scaleVisualDurationMs
            ? HuntAtbConfig.scaleVisualDurationMs(durationMs)
            : Number(durationMs || 0);
    }

    clearWeaponAnimations() {
        this.activeWeaponAnimations.forEach(animation => {
            try { animation.cancel(); } catch (_) { /* detached OBS node */ }
        });
        this.activeWeaponAnimations.clear();
        this.weaponAnimationGenerations.clear();
        if (!this.card?.querySelectorAll) return;
        this.card.querySelectorAll('.game-hunt-weapon-img').forEach(weaponImg => {
            this.cancelWeaponAnimation(weaponImg);
            weaponImg.style.removeProperty('transform');
        });
        this.card.querySelectorAll('.game-hunt-weapon-img-container').forEach(container => {
            this.cancelWeaponAnimation(container);
            container.style.removeProperty('transform');
            container.style.removeProperty('filter');
            container.style.removeProperty('opacity');
        });
        this.card.querySelectorAll('[id^="fight-card-"]').forEach(weaponCard => {
            delete weaponCard.dataset.hunterHitReactionActive;
        });
        this.card.querySelectorAll('.hunt-split-shield').forEach(shieldImg => {
            this.cancelWeaponAnimation(shieldImg);
            shieldImg.style.removeProperty('transform');
        });
        this.card.querySelectorAll('.hunt-action-effect').forEach(effect => effect.remove());
        this.card.querySelectorAll('.hunt-environment-effect').forEach(effect => effect.remove());
        this.card.querySelectorAll('.hunt-hit-impact').forEach(effect => effect.remove());
        this.card.querySelectorAll('.hunt-damage-number').forEach(number => number.remove());
        this.card.querySelectorAll('.hunt-guard-impact, .hunt-tackle-impact').forEach(effect => effect.remove());
        this.card.querySelectorAll('.monster-part-break-visual').forEach(effect => effect.remove());
        this.card.querySelectorAll('.monster-stun-head-marker').forEach(effect => effect.remove());
        this.monsterStunMarkerGeneration += 1;
        this.monsterPartBreakVisualQueue = [];
        this.monsterPartBreakVisualActive = false;
        this.card.querySelectorAll('.ig-kinsect').forEach(kinsect => {
            kinsect.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
        });
    }

    clearMonsterAnimations(reason = 'renderer-clear') {
        const clearedMotion = this.monsterAttackAnimator?.clearMonsterMotion(reason);
        const clearedReaction = this.clearMonsterReactionAnimations(reason);
        return Boolean(clearedMotion || clearedReaction);
    }

    clearMonsterReactionAnimations(reason = 'renderer-clear') {
        let cleared = false;
        if (this.monsterKnockdownAnimation) {
            try { this.monsterKnockdownAnimation.cancel(); } catch (_) { /* detached image */ }
            this.monsterKnockdownAnimation = null;
            cleared = true;
        }
        this.monsterStunMarkerGeneration += 1;
        this.card?.querySelectorAll?.('.monster-stun-head-marker')?.forEach(marker => marker.remove());
        this.card?.querySelectorAll?.('#fight-monster-img,.hunt-small-monster')?.forEach(monsterImg => {
            if (monsterImg.dataset.monsterKnockdownSequence
                || monsterImg.dataset.monsterSleepSequence
                || monsterImg.dataset.partBreakReaction) cleared = true;
            delete monsterImg.dataset.monsterKnockdownSequence;
            delete monsterImg.dataset.monsterSleepSequence;
            delete monsterImg.dataset.partBreakReaction;
            delete monsterImg.dataset.partBreakKind;
            monsterImg.classList.remove(
                'stunned_monster', 'monster-knockdown-anim',
                'monster-knockdown-sequence', 'monster-sleeping'
            );
            monsterImg.style.removeProperty('--monster-knockdown-duration');
            // Reaction WAAPI tracks use the image transform itself. Cancelling
            // the track and removing its fill guarantees the next selected
            // pattern starts from the authored home pose.
            monsterImg.style.removeProperty('transform');
        });
        return cleared;
    }

    getMonsterMotionTrace() {
        return this.monsterAttackAnimator?.getMonsterMotionTrace() || [];
    }

    resolveMonsterImpactTimeline(pattern, targetIndices) {
        return this.monsterAttackAnimator?.resolveBazelCarpetImpactTimeline(pattern, targetIndices)
            || this.monsterAttackAnimator?.resolveScreenCrossImpactTimeline(pattern, targetIndices)
            || null;
    }

    showDamageAtImpact(monsterImg, damage, hitzoneValue = 45, partKind = null, isCritical = false) {
        const stage = this.card?.querySelector?.('#monster-showcase-panel');
        const amount = Math.max(0, Math.round(Number(damage) || 0));
        if (!stage || !monsterImg || amount <= 0) return;

        const number = document.createElement('div');
        number.className = `hunt-damage-number${hitzoneValue >= 65 ? ' is-weakpoint' : ''}`;
        number.textContent = String(amount);
        number.setAttribute('aria-label', `피해 ${amount}`);

        const stageRect = stage.getBoundingClientRect?.();
        const targetRect = monsterImg.getBoundingClientRect?.();
        const hasMeasuredPosition = stageRect && targetRect && targetRect.width > 0 && targetRect.height > 0;
        const sequence = Number(stage.dataset.damageSequence || 0) + 1;
        stage.dataset.damageSequence = String(sequence);
        const spreadX = ((sequence % 5) - 2) * 13;
        const spreadY = ((sequence % 3) - 1) * 9;

        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog
            : null;
        const partPoint = anatomy?.visualPoint?.(this.owner?.selectedMonster, partKind, sequence);
        const impact = document.createElement('div');
        impact.className = `hunt-hit-impact ${isCritical ? 'is-critical' : 'is-normal'}`;
        impact.setAttribute('aria-hidden', 'true');
        if (isCritical) {
            const slash = document.createElement('i');
            slash.className = 'hunt-critical-slash';
            impact.appendChild(slash);
        } else {
            for (let particle = 0; particle < 5; particle++) {
                impact.appendChild(document.createElement('i'));
            }
        }
        if (hasMeasuredPosition) {
            const localX = Number(partPoint?.x ?? .55);
            const localY = Number(partPoint?.y ?? .36);
            const impactX = targetRect.left - stageRect.left + targetRect.width * localX;
            const impactY = targetRect.top - stageRect.top + targetRect.height * localY;
            impact.style.left = `${impactX}px`;
            impact.style.top = `${impactY}px`;
            number.style.left = `${impactX + spreadX}px`;
            number.style.top = `${impactY + spreadY}px`;
        } else {
            impact.style.left = '50%';
            impact.style.top = '42%';
            number.style.left = `calc(50% + ${spreadX}px)`;
            number.style.top = `calc(42% + ${spreadY}px)`;
        }

        stage.appendChild(impact);
        stage.appendChild(number);
        this.animationTimers.timeout(() => impact.remove(), isCritical ? 850 : 520);
        this.animationTimers.timeout(() => number.remove(), 1050);
    }

    queueMonsterPartBreakVisual(partKind) {
        if (!partKind || typeof document === 'undefined') return;
        this.monsterPartBreakVisualQueue.push(String(partKind));
        this.playNextMonsterPartBreakVisual();
    }

    playNextMonsterPartBreakVisual() {
        if (this.monsterPartBreakVisualActive || !this.monsterPartBreakVisualQueue.length) return;
        const stage = this.card?.querySelector?.('#monster-showcase-panel');
        if (!stage || typeof document === 'undefined') return;
        const partKind = this.monsterPartBreakVisualQueue.shift();
        const materialCatalog = typeof HuntMonsterPartMaterialCatalog !== 'undefined'
            ? HuntMonsterPartMaterialCatalog
            : null;
        const material = materialCatalog?.resolve?.(
            this.owner?.selectedMonster,
            { kind: partKind || 'part' }
        );
        const visual = document.createElement('div');
        visual.className = 'monster-part-break-visual';
        visual.dataset.partKind = partKind;
        const partLabel = material?.shortLabel || '부위';
        visual.setAttribute('aria-label', `${partLabel} 파괴`);
        const source = String(material?.path || '');
        for (const side of ['left', 'right']) {
            const half = document.createElement('span');
            half.className = `monster-part-break-half is-${side}`;
            const image = document.createElement('img');
            image.className = 'hunt-monster-part-image';
            image.src = source;
            image.alt = '';
            image.style.setProperty('--hunt-part-tint', material?.tint || 'none');
            image.style.filter = `${material?.tint || 'grayscale(1) brightness(1.08)'} brightness(1.25) contrast(1.12)`;
            half.appendChild(image);
            visual.appendChild(half);
        }
        const label = document.createElement('strong');
        label.textContent = `${partLabel} 파괴`;
        visual.appendChild(label);
        stage.appendChild(visual);
        this.monsterPartBreakVisualActive = true;
        const visualDurationMs = 2500;
        this.animationTimers.timeout(() => {
            visual.remove();
            this.monsterPartBreakVisualActive = false;
            this.playNextMonsterPartBreakVisual();
        }, visualDurationMs + 80);
    }

    showSkillBubble(idxOrMonster, content) {
        if (!this.card) return;
        let targetEl = null;
        if (idxOrMonster === 'monster') {
            targetEl = this.card.querySelector('#monster-showcase-panel');
        } else {
            targetEl = this.card.querySelector(`#fight-card-${idxOrMonster}`);
        }
        if (!targetEl) return;

        // Remove old bubble if exists
        const oldBubble = targetEl.querySelector('.skill-bubble');
        if (oldBubble) oldBubble.remove();

        const bubble = document.createElement('div');
        bubble.className = idxOrMonster === 'monster'
            ? 'skill-bubble monster-skill-bubble'
            : 'skill-bubble hunter-skill-bubble';
        const descriptor = content && typeof content === 'object' ? content : null;
        if (descriptor?.type === 'item' && descriptor.imagePath) {
            bubble.classList.add('skill-bubble--item');
            bubble.setAttribute('aria-label', descriptor.label || '아이템 사용');
            const image = document.createElement('img');
            image.className = 'skill-bubble-item-image';
            image.src = descriptor.imagePath;
            image.alt = '';
            image.dataset.itemSourceId = descriptor.sourceId || '';
            bubble.appendChild(image);
        } else {
            bubble.textContent = String(descriptor?.text ?? content ?? '');
        }
        targetEl.appendChild(bubble);
        const visibleDuration = Math.max(500, Number(descriptor?.durationMs || 2500));

        this.animationTimers.timeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateX(-50%) translateY(-15px)';
        }, 10);

        this.animationTimers.timeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateX(-50%) translateY(-30px)';
            this.animationTimers.timeout(() => bubble.remove(), 400);
        }, visibleDuration);
    }

    triggerGuardImpact(idx, outcome = 'guard') {
        if (!this.card || typeof document === 'undefined') return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const container = weaponCard?.querySelector('.game-hunt-weapon-img-container');
        if (!container) return;

        const isTackle = outcome === 'tackle';
        const shakeClass = isTackle ? 'hunter-card-hit-shake' : 'hunter-card-guard-shake';
        weaponCard.classList.remove('hunter-card-hit-shake', 'hunter-card-guard-shake');
        void weaponCard.offsetWidth;
        weaponCard.classList.add(shakeClass);
        this.animationTimers.timeout(() => weaponCard?.classList.remove(shakeClass), isTackle ? 360 : 300);

        container.querySelectorAll('.hunt-guard-impact, .hunt-tackle-impact').forEach(effect => effect.remove());
        const hasSplitShield = Boolean(container.querySelector('.hunt-split-shield'));
        const impact = document.createElement('span');
        impact.className = `${isTackle ? 'hunt-tackle-impact' : 'hunt-guard-impact'}${hasSplitShield ? ' is-split-shield' : ' is-weapon-fallback'}`;
        impact.textContent = isTackle ? '💥' : '🛡️';
        impact.setAttribute('aria-hidden', 'true');
        container.appendChild(impact);
        this.animationTimers.timeout(() => impact.remove(), 620);
    }

    triggerMonsterRoar(pattern = null) {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (!monsterImg || !showcase) return;

        // Roar vibration animation on monster image
        monsterImg.classList.remove('monster-roar-vibrate');
        void monsterImg.offsetWidth;
        monsterImg.classList.add('monster-roar-vibrate');
        this.animationTimers.timeout(() => monsterImg.classList.remove('monster-roar-vibrate'), 1200);

        const sonicImpact = pattern?.roarVisual === 'sonic-impact';
        let speaker = null;
        if (!sonicImpact) {
            speaker = document.createElement('div');
            speaker.className = 'roar-speaker-emoji';
            speaker.textContent = '🔊';
            showcase.appendChild(speaker);
        }
        const showcaseRect = showcase.getBoundingClientRect();
        const monsterRect = monsterImg.getBoundingClientRect();
        const centerX = monsterRect.left + monsterRect.width * .48 - showcaseRect.left;
        const centerY = monsterRect.top + monsterRect.height * .58 - showcaseRect.top;

        // Spawn concentric sound wave rings
        for (let i = 0; i < (sonicImpact ? 5 : 3); i++) {
            this.animationTimers.timeout(() => {
                if (!this.card) return;
                const ring = document.createElement('div');
                ring.className = `roar-wave-ring${sonicImpact ? ' is-sonic-impact' : ''}`;
                ring.style.left = `${centerX}px`;
                ring.style.top = `${centerY}px`;
                ring.style.setProperty('--roar-ring-index', String(i));
                showcase.appendChild(ring);
                this.animationTimers.timeout(() => ring.remove(), sonicImpact ? 1250 : 1000);
            }, i * (sonicImpact ? 115 : 300));
        }

        // Vibrate all hunter cards during the roar
        const weaponCards = this.card.querySelectorAll('.game-hunt-weapon-card');
        weaponCards.forEach(c => c.classList.add('hunter-roar-shake-anim'));
        this.animationTimers.timeout(() => {
            weaponCards.forEach(c => c.classList.remove('hunter-roar-shake-anim'));
        }, 1500);

        this.animationTimers.timeout(() => {
            speaker?.remove();
        }, 1500);
    }

    triggerMonsterCharge() {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-attacking') || this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            if (details?.kind !== 'stun' && stage?.querySelector?.('.monster-stun-head-marker')) return;
            monsterImg.classList.remove('monster-charge-slide');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-charge-slide');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-charge-slide'), 750);
        }
    }

    triggerMonsterAttack(type, emoji, targets, attackName = '', pattern = null) {
        return this.monsterAttackAnimator.triggerMonsterAttack(type, emoji, targets, attackName, pattern);
    }

    triggerMonsterTelegraphFx(effect) {
        return this.monsterAttackAnimator.triggerMonsterTelegraphFx(effect);
    }

    triggerMonsterBurrowPhase(phase, targetIndex, durationMs) {
        return this.monsterAttackAnimator.triggerMonsterBurrowPhase(phase, targetIndex, durationMs);
    }

    triggerHunterInterference(idx, kind, size, active) {
        const card = this.card?.querySelector?.(`#fight-card-${idx}`);
        const container = card?.querySelector?.('.game-hunt-weapon-img-container');
        if (!card || !container) return;
        card.classList.toggle('hunter-interference-active', Boolean(active));
        card.dataset.interferenceKind = active ? kind : '';
        card.dataset.interferenceSize = active ? size : '';
        container.querySelector('.hunter-interference-overlay')?.remove();
        if (!active) return;
        const overlay = document.createElement('div');
        overlay.className = `hunter-interference-overlay is-${kind} is-${size}`;
        overlay.textContent = kind === 'tremor' ? '〰️' : kind === 'wind' ? '🌪️' : '🙉';
        container.appendChild(overlay);
    }

    static knockbackVectorFromRects(monsterRect, hunterRect, fallbackDirection = 1) {
        const center = rect => ({
            x: Number(rect?.left || 0) + Number(rect?.width || 0) / 2,
            y: Number(rect?.top || 0) + Number(rect?.height || 0) / 2
        });
        if (monsterRect && hunterRect) {
            const monster = center(monsterRect);
            const hunter = center(hunterRect);
            const dx = hunter.x - monster.x;
            const dy = hunter.y - monster.y;
            const length = Math.hypot(dx, dy);
            if (Number.isFinite(length) && length > 1) {
                return { x: dx / length, y: dy / length };
            }
        }
        return { x: Number(fallbackDirection) < 0 ? -1 : 1, y: .28 };
    }

    static strongHitKeyframes({ x = 0, y = 0, direction = 1, angleOffset = 0 } = {}) {
        const spinDirection = Number(direction) < 0 ? -1 : 1;
        const fallSpin = spinDirection * 540;
        const standingSpin = spinDirection * 720;
        const proneSkew = spinDirection * 12;
        const fallen = `translate(${Math.round(x)}px, ${Math.round(y)}px) rotate(${fallSpin + Number(angleOffset || 0)}deg) skewX(${proneSkew}deg) scale(.82, .76)`;
        const tumbleFrame = (offset, progress, degrees, lift = 0) => {
            const scale = progress === 1 ? '.82' : String(Number((1 - .18 * progress).toFixed(3)));
            return {
                offset,
                transform: `translate(${Math.round(x * progress)}px, ${Math.round(y * progress - lift)}px) rotate(${spinDirection * degrees + Number(angleOffset || 0) * progress}deg) scale(${scale})`,
                filter: `brightness(${1 - .38 * progress}) sepia(${.5 * progress}) hue-rotate(${-50 * progress}deg)`,
                opacity: 1 - .32 * progress
            };
        };
        return [
            { offset: 0, transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'brightness(1)', opacity: 1 },
            // Explicit waypoints prevent transform matrix normalization from
            // collapsing the 1.5-turn fall into parallel translation.
            tumbleFrame(.06, .25, 135, 18),
            tumbleFrame(.12, .50, 270, 28),
            tumbleFrame(.18, .75, 405, 16),
            { offset: .24, transform: fallen, filter: 'brightness(.62) sepia(.5) hue-rotate(-50deg)', opacity: .68 },
            // Stay visibly prone instead of ending on an upright full turn.
            { offset: .76, transform: fallen, filter: 'brightness(.62) sepia(.5) hue-rotate(-50deg)', opacity: .68 },
            // Stand without rewinding, then return with alternating planted
            // steps so the recovery reads as walking rather than translation.
            { offset: .82, transform: `translate(${Math.round(x * .78)}px, ${Math.round(y * .78)}px) rotate(${standingSpin}deg) scale(.94, 1.02)`, filter: 'brightness(.78)', opacity: .76 },
            { offset: .87, transform: `translate(${Math.round(x * .60)}px, ${Math.round(y * .60 - 5)}px) rotate(${standingSpin - spinDirection * 7}deg) skewX(${spinDirection * 4}deg) scale(.96)`, filter: 'brightness(.84)', opacity: .82 },
            { offset: .92, transform: `translate(${Math.round(x * .40)}px, ${Math.round(y * .40)}px) rotate(${standingSpin + spinDirection * 7}deg) skewX(${-spinDirection * 4}deg) scale(.97)`, filter: 'brightness(.9)', opacity: .88 },
            { offset: .97, transform: `translate(${Math.round(x * .18)}px, ${Math.round(y * .18 - 4)}px) rotate(${standingSpin - spinDirection * 5}deg) skewX(${spinDirection * 3}deg) scale(.99)`, filter: 'brightness(.96)', opacity: .95 },
            { offset: 1, transform: `translate(0, 0) rotate(${standingSpin}deg) scale(1)`, filter: 'brightness(1)', opacity: 1 }
        ];
    }

    triggerHitAnimation(idx, w, reaction = {}) {
        if (!this.card || !w || w.hp <= 0) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (!weaponCard) return;
        // Runtime impact commits are authoritative, but keep the renderer
        // idempotent too. A stale/speculative callback must never restart the
        // tumble while the same hunter is still inside hit recovery.
        const reactionGeneration = Math.max(0, Number(reaction.generation || 0));
        const activeGeneration = Math.max(0, Number(weaponCard.dataset.hunterHitReactionGeneration || 0));
        if (weaponCard.dataset.hunterHitReactionActive === 'true'
            && Number(w.hitDuration || 0) > 0
            && (reactionGeneration === 0 || reactionGeneration === activeGeneration)) return;
        // A damaging hit replaces roar, tremor, and wind-pressure presentation.
        // Keep this defensive cleanup even when the runtime callback arrives late.
        this.triggerHunterInterference(idx, '', '', false);
        this.interruptWeaponVisual(idx, w);
        this.cancelHitAnimation(idx);
        const weaponLayers = weaponCard?.querySelectorAll(
            '.game-hunt-weapon-img, .hunt-split-shield, .game-hunt-weapon-overlay'
        ) || [];
        weaponCard.dataset.hunterHitReactionActive = 'true';
        weaponCard.dataset.hunterHitReactionGeneration = String(reactionGeneration);

        // Interference used a CSS animation with !important. Remove its DOM
        // ownership synchronously as well as clearing the runtime state above,
        // so a damaging hit during tremor/wind/roar can immediately take over
        // the same weapon layers with the WAAPI knockback reaction.
        weaponCard.classList.remove('hunter-interference-active', 'roar-stunned');
        delete weaponCard.dataset.interferenceKind;
        delete weaponCard.dataset.interferenceSize;
        weaponCard.querySelector('.hunter-interference-overlay')?.remove();

        const kind = ['weak', 'butt-stumble'].includes(reaction.kind) ? 'weak' : 'strong';
        const cardShakeClass = 'hunter-card-hit-shake';
        const durationMs = kind === 'weak' ? 1500 : 5000;
        const authoredDirection = Number(
            reaction.knockbackDirection || w.hitKnockbackDirection || (idx < 2 ? -1 : 1)
        ) < 0 ? -1 : 1;
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted')
            || this.card.querySelector('#fight-monster-img');
        const hunterAnchor = weaponCard.querySelector('.game-hunt-weapon-img-container') || weaponCard;
        const knockback = HuntCombatAnimator.knockbackVectorFromRects(
            monsterImg?.getBoundingClientRect?.(),
            hunterAnchor?.getBoundingClientRect?.(),
            authoredDirection
        );
        const direction = Math.abs(knockback.x) > .08
            ? (knockback.x < 0 ? -1 : 1)
            : authoredDirection;
        const strongX = Math.round(knockback.x * 270);
        const strongY = Math.round(knockback.y * 190);
        const weakX = Math.round(knockback.x * 62);
        const weakY = Math.round(knockback.y * 54);
        const generation = Number(this.weaponAnimationGenerations.get(weaponCard) || 0);

        weaponLayers.forEach(layer => {
            layer.style.setProperty('--hunter-hit-direction', String(direction));
            const isShield = layer.classList.contains('hunt-split-shield');
            layer.style.setProperty('--hunter-hit-strong-x', `${Math.round(strongX * (isShield ? .88 : 1))}px`);
            layer.style.setProperty('--hunter-hit-weak-x', `${Math.round(weakX * (isShield ? .82 : 1))}px`);
            layer.style.setProperty('--hunter-hit-angle-offset', isShield ? `${direction * -16}deg` : '0deg');
            layer.style.setProperty('--hunter-hit-y-offset', isShield ? '-7px' : '0px');
        });
        void weaponCard.offsetWidth;
        weaponCard.classList.add(cardShakeClass);
        // Own knockback on the stable wrapper. Live HUD refreshes legitimately
        // update child weapon/shield transforms; animating those children made
        // their rotation disappear while translation appeared to survive.
        // One wrapper track keeps every visual layer together and guarantees
        // the authored two-turn tumble remains visible in production.
        const hitLayers = hunterAnchor && typeof hunterAnchor.animate === 'function'
            ? [hunterAnchor] : [...weaponLayers];
        hitLayers.forEach(layer => {
            if (typeof layer.animate !== 'function') return;
            const x = Math.round(strongX * (layer.classList.contains('hunt-split-shield') ? .88 : 1));
            const y = Math.round(strongY * (layer.classList.contains('hunt-split-shield') ? .92 : 1));
            const shortX = Math.round(weakX * (layer.classList.contains('hunt-split-shield') ? .82 : 1));
            const shortY = Math.round(weakY * (layer.classList.contains('hunt-split-shield') ? .9 : 1));
            const angleOffset = layer.classList.contains('hunt-split-shield') ? direction * -16 : 0;
            const yOffset = layer.classList.contains('hunt-split-shield') ? -7 : 0;
            const keyframes = kind === 'weak'
                ? [
                    { offset: 0, transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'brightness(1)' },
                    { offset: .28, transform: `translate(${shortX}px, ${shortY + yOffset}px) rotate(${direction * 88 + angleOffset}deg) scale(.9)`, filter: 'brightness(.72)' },
                    { offset: .68, transform: `translate(${shortX}px, ${shortY + yOffset}px) rotate(${direction * 88 + angleOffset}deg) scale(.9)`, filter: 'brightness(.72)' },
                    { offset: 1, transform: 'translate(0, 0) rotate(0deg) scale(1)', filter: 'brightness(1)' }
                ]
                : HuntCombatAnimator.strongHitKeyframes({
                    x,
                    y: y + yOffset,
                    direction,
                    angleOffset
                });
            const animation = layer.animate(keyframes, {
                duration: durationMs,
                easing: kind === 'weak' ? 'ease-in-out' : 'cubic-bezier(.18,.72,.2,1)',
                iterations: 1,
                fill: 'both'
            });
            this.activeWeaponAnimations.set(layer, animation);
            animation.onfinish = () => {
                if (this.activeWeaponAnimations.get(layer) !== animation) return;
                try { animation.cancel(); } catch (_) { /* detached OBS node */ }
                this.activeWeaponAnimations.delete(layer);
                layer.style.removeProperty('transform');
            };
        });

        this.animationTimers.timeout(() => {
            if (this.weaponAnimationGenerations.get(weaponCard) !== generation) return;
            weaponCard.classList.remove(cardShakeClass);
        }, 360);
        this.animationTimers.timeout(() => {
            if (this.weaponAnimationGenerations.get(weaponCard) !== generation || w.status === 'dead') return;
            this.cancelHitAnimation(idx);
        }, durationMs);
    }

    cancelHitAnimation(idx) {
        const weaponCard = this.card?.querySelector?.(`#fight-card-${idx}`);
        if (!weaponCard) return;
        delete weaponCard.dataset.hunterHitReactionActive;
        delete weaponCard.dataset.hunterHitReactionGeneration;
        weaponCard.classList.remove('hunter-card-large-shake', 'hunter-card-small-shake',
            'hunter-card-hit-shake', 'hunter-card-guard-shake');
        weaponCard.querySelectorAll(
            '.game-hunt-weapon-img-container, .game-hunt-weapon-img, .hunt-split-shield, .game-hunt-weapon-overlay'
        ).forEach(layer => {
            this.cancelWeaponAnimation(layer);
            layer.style.removeProperty('transform');
            layer.style.removeProperty('filter');
            layer.style.removeProperty('opacity');
            layer.style.removeProperty('--hunter-hit-direction');
            layer.style.removeProperty('--hunter-hit-strong-x');
            layer.style.removeProperty('--hunter-hit-weak-x');
            layer.style.removeProperty('--hunter-hit-angle-offset');
            layer.style.removeProperty('--hunter-hit-y-offset');
        });
    }

    interruptWeaponVisual(idx, w) {
        const weaponCard = this.card?.querySelector(`#fight-card-${idx}`);
        const weaponImg = weaponCard?.querySelector('.game-hunt-weapon-img');
        const shieldImg = weaponCard?.querySelector('.hunt-split-shield');
        const weaponContainer = weaponCard?.querySelector('.game-hunt-weapon-img-container');
        if (weaponCard) {
            this.weaponAnimationGenerations.set(
                weaponCard,
                Number(this.weaponAnimationGenerations.get(weaponCard) || 0) + 1
            );
        }
        if (weaponImg) {
            this.cancelWeaponAnimation(weaponImg);
            weaponImg.style.removeProperty('transform');
        }
        if (shieldImg) {
            this.cancelWeaponAnimation(shieldImg);
            shieldImg.style.removeProperty('transform');
        }
        if (weaponContainer) {
            this.cancelWeaponAnimation(weaponContainer);
            weaponContainer.style.removeProperty('transform');
            weaponContainer.style.removeProperty('filter');
            weaponContainer.style.removeProperty('opacity');
        }
        if (['great_sword', 'hammer'].includes(w?.id)) {
            if (weaponContainer?.dataset) delete weaponContainer.dataset.weaponChargeReleaseStage;
            this.owner.updateWeaponChargeAuraUI(idx, w);
        }
    }

    triggerRollAnimation(idx) {
        if (!this.card) return;
        const layers = this.card.querySelectorAll(`#fight-card-${idx} .game-hunt-weapon-img, #fight-card-${idx} .hunt-split-shield`);
        layers.forEach(layer => {
            this.cancelWeaponAnimation(layer);
            layer.classList.remove('roll-anim');
            void layer.offsetWidth;
            layer.classList.add('roll-anim');
            this.animationTimers.timeout(() => layer.classList.remove('roll-anim'), 600);
        });
    }

    triggerInvincibleJump(idx, active) {
        if (!this.card) return;
        const layers = this.card.querySelectorAll(`#fight-card-${idx} .game-hunt-weapon-img, #fight-card-${idx} .hunt-split-shield`);
        if (!layers.length) return;
        layers.forEach(layer => {
            this.cancelWeaponAnimation(layer);
            layer.style.removeProperty('transform');
            layer.classList.toggle('hunter-invincible-jump', Boolean(active));
        });
    }

    triggerStunUI(idx, isStunned) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const imgContainer = weaponCard?.querySelector('.game-hunt-weapon-img-container');
        if (isStunned) {
            const weaponImg = weaponCard?.querySelector('.game-hunt-weapon-img');
            const shieldImg = weaponCard?.querySelector('.hunt-split-shield');
            if (weaponImg) {
                this.cancelWeaponAnimation(weaponImg);
                weaponImg.style.removeProperty('transform');
            }
            if (shieldImg) {
                this.cancelWeaponAnimation(shieldImg);
                shieldImg.style.removeProperty('transform');
            }
            if (weaponCard) weaponCard.classList.add('stunned');
            if (imgContainer && !imgContainer.querySelector('.hunter-stun-orbit')) {
                const orbit = document.createElement('div');
                orbit.className = 'hunter-stun-orbit';
                orbit.setAttribute('aria-label', '기절');
                orbit.innerHTML = '<i>💫</i><i>⭐</i><i>💫</i><i>⭐</i>';
                imgContainer.appendChild(orbit);
            }
        } else {
            if (weaponCard) weaponCard.classList.remove('stunned');
            imgContainer?.querySelector('.hunter-stun-orbit')?.remove();
        }
    }

    triggerDeathTag(idx, w, timerVal = 5) {
        if (!this.card) return;
        this.interruptWeaponVisual(idx, w);
        this.cancelHitAnimation(idx);
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (tag) {
            tag.textContent = `💀 ${timerVal}s`;
            tag.className = 'game-hunt-status-tag fainted';
        }
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (!weaponCard || !w || w.status !== 'dead') return;
        weaponCard.classList.remove('stunned', 'roar-stunned');
        weaponCard.classList.add('dead');
        const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
        imgContainer?.querySelector('.roar-stun-overlay')?.remove();
        imgContainer?.querySelector('.hunter-stun-orbit')?.remove();
        weaponCard.querySelector('.hunter-cart-sequence-cart')?.remove();
        weaponCard.querySelector('.hunter-cart-sequence-flash')?.remove();

        const layers = [...weaponCard.querySelectorAll(
            '.game-hunt-weapon-img, .hunt-split-shield, .game-hunt-weapon-overlay'
        )];
        const travelDirection = idx < 2 ? 1 : -1;
        const fallDistance = 220;
        const cartLiftDistance = 62;
        layers.forEach(layer => {
            this.cancelWeaponAnimation(layer);
            if (typeof layer.animate !== 'function') return;
            const animation = layer.animate([
                { offset: 0, transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1, filter: 'brightness(1)' },
                { offset: .4, transform: `translate(0,${fallDistance}px) rotate(720deg) scale(.86)`, opacity: 1, filter: 'grayscale(.55) brightness(.68)' },
                { offset: .62, transform: `translate(0,${fallDistance}px) rotate(720deg) scale(.86)`, opacity: 1, filter: 'grayscale(.55) brightness(.68)' },
                { offset: .7, transform: `translate(0,${fallDistance - cartLiftDistance}px) rotate(720deg) scale(.72)`, opacity: 1, filter: 'brightness(2.8)' },
                { offset: 1, transform: `translate(${travelDirection * 520}px,${fallDistance - cartLiftDistance}px) rotate(720deg) scale(.72)`, opacity: 0, filter: 'brightness(1.2)' }
            ], { duration: 3000, easing: 'linear', fill: 'forwards' });
            this.activeWeaponAnimations.set(layer, animation);
        });

        const cart = document.createElement('span');
        cart.className = 'hunter-cart-sequence-cart';
        cart.textContent = '🛒';
        cart.setAttribute('aria-label', `${w.name} 수레행`);
        (imgContainer || weaponCard).appendChild(cart);
        cart.animate([
            { offset: 0, transform: `translate(${travelDirection * -360}px,${fallDistance}px)`, opacity: 0 },
            { offset: .4, transform: `translate(${travelDirection * -360}px,${fallDistance}px)`, opacity: 0 },
            { offset: .62, transform: `translate(0,${fallDistance}px)`, opacity: 1 },
            { offset: .7, transform: `translate(0,${fallDistance - cartLiftDistance}px) scale(1.12)`, opacity: 1, filter: 'brightness(2.8)' },
            { offset: 1, transform: `translate(${travelDirection * 520}px,${fallDistance - cartLiftDistance}px) scale(1.12)`, opacity: 0, filter: 'brightness(1)' }
        ], { duration: 3000, easing: 'linear', fill: 'forwards' });
        const flash = document.createElement('span');
        flash.className = 'hunter-cart-sequence-flash';
        flash.textContent = '✦';
        (imgContainer || weaponCard).appendChild(flash);
        flash.animate([
            { offset: 0, opacity: 0, transform: `translateY(${fallDistance}px) scale(.2)` },
            { offset: .62, opacity: 0, transform: `translateY(${fallDistance}px) scale(.2)` },
            { offset: .69, opacity: 1, transform: `translateY(${fallDistance - cartLiftDistance}px) scale(2.4)` },
            { offset: .78, opacity: 0, transform: `translateY(${fallDistance - cartLiftDistance}px) scale(3.2)` },
            { offset: 1, opacity: 0, transform: `translateY(${fallDistance - cartLiftDistance}px) scale(3.2)` }
        ], { duration: 3000, easing: 'linear', fill: 'forwards' });
        this.animationTimers.timeout(() => { cart.remove(); flash.remove(); }, 3100);
    }

    triggerHunterReturn(idx, w) {
        const weaponCard = this.card?.querySelector?.(`#fight-card-${idx}`);
        if (!weaponCard || !w) return;
        weaponCard.classList.remove('dead');
        const layers = weaponCard.querySelectorAll(
            '.game-hunt-weapon-img, .hunt-split-shield, .game-hunt-weapon-overlay'
        );
        layers.forEach(layer => {
            this.cancelWeaponAnimation(layer);
            if (typeof layer.animate !== 'function') return;
            const animation = layer.animate([
                { offset: 0, transform: 'translateY(230px) scale(.72)', opacity: 0 },
                { offset: .55, transform: 'translateY(-28px) scale(1.08)', opacity: 1 },
                { offset: .76, transform: 'translateY(10px) scale(.97)', opacity: 1 },
                { offset: 1, transform: 'translateY(0) scale(1)', opacity: 1 }
            ], { duration: 1000, easing: 'cubic-bezier(.18,.82,.22,1)', fill: 'both' });
            this.activeWeaponAnimations.set(layer, animation);
            animation.onfinish = () => {
                if (this.activeWeaponAnimations.get(layer) !== animation) return;
                try { animation.cancel(); } catch (_) { /* detached OBS node */ }
                this.activeWeaponAnimations.delete(layer);
            };
        });
    }

    setMonsterStunHeadMarker(active) {
        const stage = this.card?.querySelector?.('#monster-showcase-panel');
        const existing = stage?.querySelector?.('.monster-stun-head-marker');
        if (!active) {
            this.monsterStunMarkerGeneration += 1;
            existing?.remove();
            return null;
        }
        const monsterImg = this.card?.querySelector?.('.hunt-small-monster.is-targeted')
            || this.card?.querySelector?.('#fight-monster-img');
        if (!stage || !monsterImg || typeof document === 'undefined') return null;
        const marker = existing || document.createElement('div');
        marker.className = 'monster-stun-head-marker';
        marker.textContent = '💫';
        marker.setAttribute('aria-label', '몬스터 기절');
        const anatomy = typeof HuntMonsterAnatomyCatalog !== 'undefined'
            ? HuntMonsterAnatomyCatalog : null;
        const head = anatomy?.visualPoint?.(this.owner?.selectedMonster, 'head', 0) || { x: .5, y: .2 };
        if (!existing) stage.appendChild(marker);
        const generation = ++this.monsterStunMarkerGeneration;
        const followHead = () => {
            if (generation !== this.monsterStunMarkerGeneration || !marker.isConnected) return;
            const stageRect = stage.getBoundingClientRect?.();
            const quads = monsterImg.getBoxQuads?.();
            const quad = quads?.[0];
            if (stageRect && quad) {
                // Bilinear interpolation across the transformed image quad
                // follows travel, rotation, scale and skew without guessing
                // from its axis-aligned bounding rectangle.
                const x = quad.p1.x + (quad.p2.x - quad.p1.x) * head.x
                    + (quad.p4.x - quad.p1.x) * head.y;
                const y = quad.p1.y + (quad.p2.y - quad.p1.y) * head.x
                    + (quad.p4.y - quad.p1.y) * head.y;
                marker.style.left = `${x - stageRect.left}px`;
                marker.style.top = `${y - stageRect.top}px`;
            } else {
                const monsterRect = monsterImg.getBoundingClientRect?.();
                if (stageRect && monsterRect) {
                    marker.style.left = `${monsterRect.left - stageRect.left + monsterRect.width * head.x}px`;
                    marker.style.top = `${monsterRect.top - stageRect.top + monsterRect.height * head.y}px`;
                }
            }
            if (typeof requestAnimationFrame === 'function') requestAnimationFrame(followHead);
        };
        followHead();
        return marker;
    }

    triggerMonsterKnockdownAnim(details = null) {
        if (!this.card) return;
        // Travel belongs to the outer wrapper, while knockdown belongs to the
        // image. Return the wrapper home before laying the monster down.
        this.clearMonsterAnimations('knockdown');
        const stage = this.card.querySelector('#monster-showcase-panel');
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            // An authored BEAT part reaction owns the pose until its controller
            // finishes. Do not replace it with the generic CSS knockdown.
            if (monsterImg.dataset.partBreakReaction && details?.kind !== 'stun') return;
            if (details?.kind === 'stun') {
                delete monsterImg.dataset.partBreakReaction;
                delete monsterImg.dataset.partBreakKind;
            }
            monsterImg.dataset.partBreakReactionGeneration = String(
                Number(monsterImg.dataset.partBreakReactionGeneration || 0) + 1
            );
            monsterImg.classList.remove('enraged');
            monsterImg.classList.remove('stunned_monster', 'monster-knockdown-anim', 'monster-knockdown-sequence');
            monsterImg.dataset.monsterKnockdownSequence = 'active';
            const knockdownBeatTicks = {
                reaction: 6,
                'struggle-1': 12,
                'struggle-2': 12,
                'struggle-3': 12,
                'struggle-4': 12,
                'struggle-5': 12,
                rise: 10
            };
            const monsterId = this.owner?.selectedMonster?.id;
            const previewBeats = Array.isArray(details?.motion)
                ? Object.fromEntries(details.motion.map((beat, index) => [
                    beat?.beat || `beat-${index + 1}`, beat || {}
                ]))
                : null;
            const savedBeats = previewBeats || globalThis.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES
                ?.[monsterId]?.['__reaction.knockdown']?.beats || {};
            Object.keys(knockdownBeatTicks).forEach(beatId => {
                const saved = savedBeats[beatId];
                const ticks = Number(typeof saved === 'object' ? saved?.ticks : saved);
                if (Number.isFinite(ticks) && ticks > 0) knockdownBeatTicks[beatId] = ticks;
            });
            const struggleCount = details?.kind === 'stun'
                ? Math.max(3, Math.min(5, Number(details?.struggleCount) || 5))
                : 5;
            Object.keys(knockdownBeatTicks).forEach(beatId => {
                const match = /^struggle-(\d+)$/.exec(beatId);
                if (match && Number(match[1]) > struggleCount) delete knockdownBeatTicks[beatId];
            });
            const totalTicks = Object.values(knockdownBeatTicks).reduce((sum, ticks) => sum + ticks, 0);
            const fallBeat = typeof savedBeats.reaction === 'object' ? savedBeats.reaction : {};
            // Position is authored by the fall BEAT.  Every struggle inherits
            // that landing point and only the rise interpolates back home.
            // Previously the runtime read only saved ticks, so editor X/Y
            // changes round-tripped on disk but had no effect in the hunt.
            const fallX = Number.isFinite(Number(fallBeat.offsetX)) ? Number(fallBeat.offsetX) : 0;
            const fallY = Number.isFinite(Number(fallBeat.offsetY)) ? Number(fallBeat.offsetY) : 0;
            const atFall = transform => `translate(${fallX}px, ${fallY}px) ${transform}`;
            monsterImg.style.setProperty('--monster-knockdown-duration', `${totalTicks / 10}s`);
            void monsterImg.offsetWidth;
            this.monsterKnockdownAnimation?.cancel?.();
            this.monsterKnockdownAnimation = null;
            if (typeof monsterImg.animate === 'function') {
                const frames = [{ offset: 0, transform: 'rotate(0deg) scale(1) skewX(0deg)' }];
                let elapsed = knockdownBeatTicks.reaction;
                frames.push({ offset: elapsed / totalTicks,
                    transform: atFall('rotate(30deg) scale(1.08,.68) skewX(-10deg)') });
                for (let index = 1; index <= struggleCount; index++) {
                    const ticks = knockdownBeatTicks[`struggle-${index}`];
                    frames.push({ offset: (elapsed + ticks * .83) / totalTicks,
                        transform: atFall('rotate(15deg) scale(1.04,.78) skewX(-6deg)') });
                    elapsed += ticks;
                    frames.push({ offset: elapsed / totalTicks,
                        transform: atFall('rotate(30deg) scale(1.08,.68) skewX(-10deg)') });
                }
                frames.push({ offset: 1, transform: 'rotate(0deg) scale(1) skewX(0deg)' });
                this.monsterKnockdownAnimation = monsterImg.animate(frames, {
                    duration: totalTicks * 100, easing: 'linear', fill: 'both'
                });
            } else monsterImg.classList.add('monster-knockdown-sequence');
            this.setMonsterStunHeadMarker(details?.kind === 'stun');

            // The initial fall keeps the existing authoritative knockdown cue.
            // Every struggle/rise beat is independently addressable in the
            // review tool and is emitted at the same authored runtime tick.
            let elapsedTicks = knockdownBeatTicks.reaction;
            const audioMoments = Object.keys(knockdownBeatTicks).slice(1).map(beatId => {
                const moment = [beatId, elapsedTicks * 100];
                elapsedTicks += knockdownBeatTicks[beatId];
                return moment;
            });
            // Stun differs only by its head marker; it inherits the reviewed
            // large-knockdown sound mapping beat-for-beat.
            const audioPatternId = '__reaction.knockdown';
            audioMoments.forEach(([beatId, delayMs]) => {
                this.animationTimers.timeout(() => {
                    if (monsterImg.dataset.monsterKnockdownSequence !== 'active') return;
                    this.owner?.playSFX?.('monster_attack', null, {
                        monsterId,
                        patternId: audioPatternId,
                        patternSlot: `beat:${beatId}`,
                        overrideOnly: true
                    });
                }, delayMs);
            });
            this.animationTimers.timeout(() => {
                if (monsterImg.dataset.monsterKnockdownSequence !== 'active') return;
                this.monsterKnockdownAnimation?.cancel?.();
                this.monsterKnockdownAnimation = null;
                monsterImg.classList.remove('monster-knockdown-sequence');
                delete monsterImg.dataset.monsterKnockdownSequence;
                if (details?.kind === 'stun') this.setMonsterStunHeadMarker(false);
            }, totalTicks * 100);
        }
    }

    triggerMonsterPartBreakReaction(kind, durationTicks, partKind = null, authoredMotion = null) {
        if (!this.card) return;
        this.clearMonsterAnimations(`part-break:${partKind || 'unknown'}`);
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted')
            || this.card.querySelector('#fight-monster-img');
        if (!monsterImg) return;
        const catalog = typeof HuntMonsterReactionCatalog !== 'undefined'
            ? HuntMonsterReactionCatalog
            : null;
        const monsterId = this.owner?.selectedMonster?.id;
        const profileId = kind === 'part_flinch' ? 'flinch'
            : kind === 'tail_sever_roll' ? 'tail'
                : 'knockdown';
        const catalogProfile = catalog?.applyAuthoredMotion?.(monsterId, catalog.profile(profileId));
        const profile = Array.isArray(authoredMotion) && authoredMotion.length
            ? { ...catalogProfile, motion: authoredMotion }
            : catalogProfile;
        const motion = profile?.motion;
        if (profileId === 'knockdown' && Array.isArray(motion) && motion.length) {
            // Part-break knockdowns previously bypassed the shared knockdown
            // player and sent mostly pose-only struggle beats to playBeatMotion.
            // That kept the monster lying perfectly still. Route every large
            // knockdown through the same fall/struggle/rise owner used by KO
            // and forced landings, while retaining the editor-authored ticks.
            this.triggerMonsterKnockdownAnim({
                kind: 'knockdown',
                motion,
                struggleCount: motion.filter(beat => /^struggle-\d+$/.test(String(beat?.beat || ''))).length
            });
            return;
        }
        const actualTicks = Array.isArray(motion)
            ? motion.reduce((sum, beat) => sum + Math.max(1, Number(beat.ticks) || 1), 0)
            : Number(durationTicks || 1);
        const durationMs = Math.max(900, actualTicks * 100);
        const generation = Number(monsterImg.dataset.partBreakReactionGeneration || 0) + 1;
        monsterImg.dataset.partBreakReactionGeneration = String(generation);
        monsterImg.dataset.partBreakReaction = profile?.id || kind || 'small';
        if (partKind) monsterImg.dataset.partBreakKind = String(partKind);
        else delete monsterImg.dataset.partBreakKind;
        monsterImg.classList.remove('monster-knockdown-anim');
        if (Array.isArray(motion) && motion.length) {
            this.monsterAttackAnimator.playBeatMotion(monsterImg, {
                id: profile.patternId,
                name: profile.id === 'flinch' ? '소경직'
                    : profile.id === 'tail' ? '꼬짤경직' : '대경직',
                type: 'reaction',
                motion,
                runtimePreviewMuteAudio: true
            }, profile.patternId, null, []);
        }

        this.animationTimers.timeout(() => {
            if (Number(monsterImg.dataset.partBreakReactionGeneration || 0) !== generation) return;
            delete monsterImg.dataset.partBreakReaction;
            delete monsterImg.dataset.partBreakKind;
        }, durationMs + 80);
    }

    triggerMonsterPartBreakVisual(partKind = null) {
        // Independent presentation layer: always allowed, even while the body
        // is already trapped, asleep, paralyzed, stunned or knocked down.
        this.queueMonsterPartBreakVisual(partKind);
    }

    triggerMonsterSleepAnim(details = null) {
        if (!this.card) return;
        this.clearMonsterAnimations('sleep');
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted')
            || this.card.querySelector('#fight-monster-img');
        if (!monsterImg) return;
        const catalog = typeof HuntMonsterReactionCatalog !== 'undefined'
            ? HuntMonsterReactionCatalog : null;
        const profile = catalog?.resolveSleep?.(this.owner?.selectedMonster?.id);
        // The review preview passes its live edited graph. Runtime callers
        // without a graph continue to use the catalog-authored sleep motion.
        const motion = Array.isArray(details?.motion) && details.motion.length
            ? details.motion : (profile?.motion || []);
        if (!motion.length) return;
        monsterImg.classList.remove('monster-sleeping');
        monsterImg.dataset.monsterSleepSequence = 'active';
        this.monsterAttackAnimator.playBeatMotion(monsterImg, {
            id: '__reaction.sleep', name: '수면', type: 'reaction', motion,
            runtimePreviewMuteAudio: true
        }, '__reaction.sleep', null, []);
        const wakeDelay = motion.slice(0, -1).reduce((sum, beat) =>
            sum + Math.max(1, Number(beat.ticks) || 1), 0) * 100;
        this.animationTimers.timeout(() => {
            if (monsterImg.dataset.monsterSleepSequence !== 'active') return;
            this.showSkillBubble('monster', { text: '!', durationMs: 500 });
        }, wakeDelay);
        const durationMs = motion.reduce((sum, beat) =>
            sum + Math.max(1, Number(beat.ticks) || 1), 0) * 100;
        this.animationTimers.timeout(() => {
            delete monsterImg.dataset.monsterSleepSequence;
        }, durationMs + 80);
    }

    restoreBorder(wIndex, w) {
        if (!this.card || !w) return;
        if (w.status === 'dead') return;
        // Buff/resource cleanup can occur while a hunter is still tumbling.
        // It must never erase the hit class and inline transform owned by the
        // active recovery state; recovery completion performs the real reset.
        if (Number(w.hitDuration || 0) > 0) return;
        const weaponCard = this.card.querySelector(`#fight-card-${w.index}`);
        if (weaponCard) {
            // Remove all custom classes and animations from card
            weaponCard.classList.remove(
                'dead', 'ls-spirit-1', 'ls-spirit-2', 'ls-spirit-3',
                'db-demon-mode', 'cb-shield-charged', 'ig-3-extracts',
                'hunter-card-large-shake', 'hunter-card-small-shake'
            );
            weaponCard.style.removeProperty('animation');
            weaponCard.style.transform = '';
            weaponCard.style.borderColor = '';
            weaponCard.style.boxShadow = '';
            weaponCard.style.transition = 'transform 0.15s ease, border-color 0.15s ease';
            
            const cartOverlay = weaponCard.querySelector('.faint-cart-overlay');
            if (cartOverlay) {
                cartOverlay.remove();
            }

            // Handle Long Sword Image Border & Glow on Container
            const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
            if (imgContainer) {
                imgContainer.classList.remove('ls-spirit-border-1', 'ls-spirit-border-2', 'ls-spirit-border-3');
            }

            // Handle Weapon Image direct filter classes
            const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
            if (weaponImg) {
                weaponImg.style.transition = 'opacity 0.2s ease-in';
                weaponImg.style.opacity = '1';
                weaponImg.style.animation = ''; // [FIX] 'none'으로 고정하면 진행 중인 공격 애니메이션(CSS Class)이 즉시 취소됨
                weaponImg.style.transform = ''; // [FIX] 동일한 이유로 CSS transform 애니메이션 방해 제거
                weaponImg.style.filter = '';
                weaponImg.classList.remove('ls-spirit-img-1', 'ls-spirit-img-2', 'ls-spirit-img-3', 'cb-shield-charged-img');
                if (w.id === 'long_sword' && w.spiritLevel > 0) {
                    weaponImg.classList.add(`ls-spirit-img-${w.spiritLevel}`);
                } else if (w.id === 'charge_blade' && w.shieldChargeDuration > 0) {
                    weaponImg.classList.add('cb-shield-charged-img');
                }
            }
            weaponCard.querySelectorAll('.game-hunt-weapon-img, .hunt-split-shield').forEach(layer => {
                layer.style.removeProperty('--hunter-hit-direction');
                layer.style.removeProperty('filter');
                layer.style.removeProperty('opacity');
            });

            if (w.id === 'dual_blades' && w.demonModeDuration > 0) {
                weaponCard.classList.add('db-demon-mode');
            }
            if (w.id === 'charge_blade' && w.shieldChargeDuration > 0) {
                weaponCard.classList.add('cb-shield-charged');
            }
            if (w.id === 'insect_glaive' && w.extractDuration > 0) {
                weaponCard.classList.add('ig-3-extracts');
            }

            // Restore status tag to active when revived / restored
            const tag = this.card.querySelector(`#status-tag-${w.index}`);
            if (tag) {
                if (w.status === 'alive') {
                    tag.textContent = '⚔️';
                    tag.className = 'game-hunt-status-tag active';
                } else if (w.status === 'stunned') {
                    tag.textContent = '🌀';
                    tag.className = 'game-hunt-status-tag stunned';
                }
            }
        }
    }

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, actionOrName = null, isDodge = false, hitContext = null) {
        if (!this.card) return;
        if (w && w.status === 'dead' && !isAttack) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (!weaponCard) return;
        const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
        const shieldImg = weaponCard.querySelector('.hunt-split-shield');
        const kinsectImg = weaponCard.querySelector('.ig-kinsect');

        if (isAttack) {
            const animationGeneration = Number(this.weaponAnimationGenerations.get(weaponCard) || 0) + 1;
            this.weaponAnimationGenerations.set(weaponCard, animationGeneration);
            const resolvedProfile = HuntWeaponAnimationCatalog.resolve(w?.id, actionOrName);
            const profile = {
                ...resolvedProfile,
                chargeVisualLevel: Math.min(3, Math.max(0, Number(actionOrName?.chargeVisualLevel) || 0)),
                durationMs: this.visualDuration(resolvedProfile.durationMs),
                impactDelayMs: Number.isFinite(resolvedProfile.impactDelayMs)
                    ? this.visualDuration(resolvedProfile.impactDelayMs)
                    : resolvedProfile.impactDelayMs
            };
            let compiledBeat = null;
            let beatVisualTickMs = 100;
            if (Number(actionOrName?.durationTicks) > 0) {
                const actionDurationMs = Math.max(100, Math.round(Number(actionOrName.durationTicks) * 100));
                // BEAT occupancy/ATB may deliberately outlast the visible swing.
                // Never stretch an approved weapon motion past its catalog
                // cadence merely because its action lock includes recovery.
                profile.durationMs = Math.min(actionDurationMs, profile.durationMs);
                beatVisualTickMs = profile.durationMs / Math.max(1, Number(actionOrName.durationTicks));
                compiledBeat = typeof HuntHunterBeatCatalog !== 'undefined'
                    ? HuntHunterBeatCatalog.compile(w.id, actionOrName)
                    : null;
                const hitEvent = compiledBeat?.events?.find(event => event.kind === 'damage');
                if (hitEvent) profile.impactDelayMs = hitEvent.atTicks * beatVisualTickMs;
            }
            const impactDelay = Number.isFinite(profile.impactDelayMs)
                ? Math.max(0, Math.floor(profile.impactDelayMs))
                : Math.floor(profile.durationMs * Number(profile.impactRatio || 0.52));
            const reservedSmallTarget = Number.isInteger(hitContext?.targetUnitIndex)
                ? this.card.querySelector(`.hunt-small-monster[data-small-monster-index="${hitContext.targetUnitIndex}"]`)
                : null;
            const impactTarget = reservedSmallTarget || this.card.querySelector('.hunt-small-monster.is-targeted')
                || this.card.querySelector('#fight-monster-img');
            const impactStage = this.card.querySelector('#monster-showcase-panel');
            const actionEffect = this.createActionEffect(profile, impactStage, impactTarget);

            if (actionEffect) {
                (impactStage || weaponCard).appendChild(actionEffect);
                this.animationTimers.timeout(() => actionEffect.remove(), Math.min(1200, profile.durationMs));
            }

            // Only resolved strikes get impact feedback. Preparation motions still animate,
            // but cannot manufacture a hit sound or shake before damage is dealt.
            if (profile.impact && hitContext?.resolved) {
                const beatHits = compiledBeat?.events?.filter(event => event.kind === 'damage') || [];
                const visualHits = beatHits.length > 0
                    ? beatHits
                    : [{ atTicks: impactDelay / 100, hitIndex: 0, hitCount: 1 }];
                const authoredWeights = Array.isArray(actionOrName?.hits) && actionOrName.hits.length === visualHits.length
                    ? actionOrName.hits.map(value => Math.max(0, Number(value) || 0))
                    : visualHits.map(() => 1);
                const weightTotal = Math.max(1, authoredWeights.reduce((sum, value) => sum + value, 0));
                let assignedDamage = 0;
                visualHits.forEach((event, visualIndex) => {
                    const eventDelay = beatHits.length > 0
                        ? Math.max(0, Math.floor(Number(event.atTicks || 0) * beatVisualTickMs))
                        : impactDelay;
                    const isLast = visualIndex === visualHits.length - 1;
                    const visualDamage = isLast
                        ? Math.max(0, Math.round(Number(hitContext.damage || 0)) - assignedDamage)
                        : Math.max(0, Math.round(Number(hitContext.damage || 0) * authoredWeights[visualIndex] / weightTotal));
                    assignedDamage += visualDamage;
                    this.animationTimers.timeout(() => {
                        if (!this.card) return;
                        const monsterImg = impactTarget?.isConnected === false ? null : impactTarget;
                        const weaponType = hitContext.weaponType || profile.effect || 'sever';
                        const hitzoneVal = Number(hitContext.hitzoneValue ?? 45);

                        this.owner.playSFX?.('hit_impact', null, {
                            hunterIndex: idx,
                            weaponId: w?.id,
                            weaponType,
                            hitzoneValue: hitzoneVal,
                            bounced: hitContext.bounced === true,
                            action: 'hit_impact'
                        });

                        if (monsterImg && profile.impact) {
                            const impactAccent = this.createWeaponImpactAccent(
                                profile,
                                impactStage,
                                monsterImg,
                                idx
                            );
                            if (impactAccent) {
                                (impactStage || weaponCard).appendChild(impactAccent);
                                this.animationTimers.timeout(() => impactAccent.remove(), 760);
                            }
                            this.showDamageAtImpact(
                                monsterImg,
                                visualDamage,
                                hitzoneVal,
                                hitContext.partKind,
                                hitContext.critical === true && hitContext.bounced !== true
                            );
                            monsterImg.classList.remove('small-hit-anim', 'large-hit-anim');
                            void monsterImg.offsetWidth;
                            monsterImg.classList.add(hitzoneVal >= 45 ? 'large-hit-anim' : 'small-hit-anim');
                            this.animationTimers.timeout(() => {
                                monsterImg?.classList.remove('small-hit-anim', 'large-hit-anim');
                            }, 350);
                        }
                    }, eventDelay);
                });
            }

            let animDuration = profile.durationMs;
            weaponCard.dataset.huntActionId = profile.actionId;
            weaponCard.dataset.huntMotion = profile.motion;
            if (profile.releaseChargePose) {
                const weaponContainer = weaponImg?.closest?.('.game-hunt-weapon-img-container');
                if (weaponContainer) {
                    // The mechanic state is already consumed. Pin only its visual
                    // stage while Web Animations owns the slash transform.
                    const releaseStage = Math.max(1, profile.chargeVisualLevel || 1);
                    weaponContainer.dataset.weaponChargeReleaseStage = String(releaseStage);
                    weaponContainer.classList.remove(
                        'weapon-charge-stage-0',
                        'weapon-charge-stage-1',
                        'weapon-charge-stage-2',
                        'weapon-charge-stage-3'
                    );
                    weaponContainer.classList.add(`weapon-charge-stage-${releaseStage}`);
                    weaponImg?.style?.removeProperty('transform');
                    if (weaponImg) void weaponImg.offsetWidth;
                }
            }
            if (weaponImg && profile.animateWeapon) {
                this.playWeaponAnimation(weaponImg, w?.id, idx, profile, impactTarget);
            }
            const shieldMotion = HuntWeaponAnimationCatalog.shieldMotion(profile);
            if (shieldImg && shieldMotion) {
                this.playWeaponAnimation(shieldImg, w?.id, idx, { ...profile, motion: shieldMotion });
            }

            if (kinsectImg && w?.id === 'insect_glaive') {
                kinsectImg.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
                if (profile.kinsect !== 'none') {
                    kinsectImg.style.setProperty('--ig-kinsect-duration', `${profile.durationMs}ms`);
                    void kinsectImg.offsetWidth;
                    kinsectImg.classList.add(profile.kinsect === 'extract' ? 'ig-kinsect-extract' : 'ig-kinsect-assault');
                    animDuration = Math.max(animDuration, profile.durationMs);
                }
            }

            weaponCard.style.borderColor = borderClr;
            this.animationTimers.timeout(() => {
                // Charge stages overlap slightly for visual continuity. A cleanup
                // timer from an older stage must never cancel the following release.
                if (this.weaponAnimationGenerations.get(weaponCard) !== animationGeneration) return;
                if (w && w.status !== 'dead') {
                    if (weaponImg) this.cancelWeaponAnimation(weaponImg);
                    if (shieldImg) this.cancelWeaponAnimation(shieldImg);
                    if (kinsectImg) {
                        kinsectImg.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
                        kinsectImg.style.removeProperty('--ig-kinsect-duration');
                    }
                    if (['great_sword', 'hammer'].includes(w.id)) {
                        const weaponContainer = weaponImg?.closest?.('.game-hunt-weapon-img-container');
                        if (weaponContainer?.dataset) delete weaponContainer.dataset.weaponChargeReleaseStage;
                        this.owner.updateWeaponChargeAuraUI(idx, w);
                    }
                    this.restoreBorder(idx, w);
                }
            }, animDuration);
            return;
        }

        weaponCard.style.borderColor = borderClr;
        this.animationTimers.timeout(() => {
            if (w && w.status !== 'dead') {
                this.restoreBorder(idx, w);
            }
        }, 150);
    }

    triggerEnvironmentEffect(kind, hunterIndex = null, details = null) {
        // Generic inventory actions explicitly request pitfall today. Keep
        // explicit shock traps distinct for the later item overhaul.
        if (!this.card) return;
        if (String(kind || '').startsWith('blast-scale-')) {
            const targetCard = Number.isInteger(Number(hunterIndex))
                ? this.card.querySelector(`#fight-card-${Number(hunterIndex)}`)
                : null;
            const anchor = targetCard?.querySelector('.game-hunt-weapon-img-container') || targetCard;
            if (!anchor) return;
            let hazard = anchor.querySelector('.hunt-blast-scale-hazard');
            if (kind === 'blast-scale-place') {
                if (hazard) return;
                hazard = document.createElement('div');
                hazard.className = 'hunt-blast-scale-hazard';
                hazard.classList.add(
                    details?.visualPalette === 'purple' ? 'palette-purple' : 'palette-red'
                );
                hazard.setAttribute('aria-hidden', 'true');
                hazard.innerHTML = '<i></i><b></b><span></span>';
                anchor.appendChild(hazard);
                const monsterImg = this.card.querySelector(
                    '.hunt-small-monster.is-targeted, #fight-monster-img'
                );
                const monsterRect = monsterImg?.getBoundingClientRect?.();
                const anchorRect = anchor.getBoundingClientRect?.();
                if (monsterRect && anchorRect && hazard.style?.setProperty) {
                    const sourcePart = String(details?.sourcePart || 'body');
                    const sourceRatio = sourcePart === 'head'
                        ? { x: .28, y: .56 }
                        : sourcePart === 'tail'
                            ? { x: .76, y: .58 }
                            : { x: .50, y: .52 };
                    const sourceX = monsterRect.left + monsterRect.width * sourceRatio.x;
                    const sourceY = monsterRect.top + monsterRect.height * sourceRatio.y;
                    const groundX = anchorRect.left + anchorRect.width / 2;
                    const groundY = anchorRect.bottom - 2;
                    const deltaX = Math.round(sourceX - groundX);
                    const deltaY = Math.round(sourceY - groundY);
                    hazard.style.setProperty('--blast-scale-source-x', `${deltaX}px`);
                    hazard.style.setProperty('--blast-scale-source-y', `${deltaY}px`);
                    hazard.style.setProperty('--blast-scale-arc-x', `${Math.round(deltaX * .52)}px`);
                    hazard.style.setProperty(
                        '--blast-scale-arc-y',
                        `${Math.round(Math.min(deltaY - 72, -108))}px`
                    );
                }
                void hazard.offsetWidth;
                hazard.classList.add('is-placed');
                this.animationTimers.timeout(() => hazard?.classList?.add('has-landed'), 1380);
                return;
            }
            if (!hazard) return;
            if (kind === 'blast-scale-cancel') {
                hazard.classList.add('is-cancelled');
                this.animationTimers.timeout(() => hazard.remove(), 180);
                return;
            }
            if (kind === 'blast-scale-heat') {
                hazard.classList.add('is-heated');
                return;
            }
            if (kind === 'blast-scale-explode') {
                hazard.classList.add('is-heated', 'is-exploding');
                this.animationTimers.timeout(() => hazard.remove(), 950);
                return;
            }
        }
        const showcase = this.card.querySelector('#monster-showcase-panel');
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        if (kind === 'trap-struggle') {
            if (!monsterImg?.dataset?.pitfallLifecycle) return;
            // The BEAT graph owns the persistent sunk pose while the live trap
            // clock owns resistance-aware struggle occurrences. Compose the
            // short pulse on the outer monster container instead of suppressing
            // it; inner BEAT placement/pose tracks remain intact.
            monsterImg.classList.remove('monster-pitfall-struggle-pulse');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-pitfall-struggle-pulse');
            return;
        }
        if (kind === 'trap-release') {
            const effects = showcase?.querySelectorAll(
                '.environment-pitfall, .environment-pitfall-pending, .environment-shocktrap, .environment-shocktrap-pending'
            ) || [];
            const hasActivePitfall = Boolean(
                monsterImg?.dataset?.pitfallLifecycle
                || monsterImg?.classList?.contains('monster-pitfall-caught')
                || effects.length
            );
            if (!hasActivePitfall) return;
            const lifecycle = Number(monsterImg?.dataset?.pitfallLifecycle || 0) + 1;
            if (monsterImg?.dataset) monsterImg.dataset.pitfallLifecycle = String(lifecycle);
            const releaseTicks = Math.max(1, Number(details?.releaseTicks)
                || HuntCombatAnimator.PITFALL_RELEASE_TICKS);
            const releaseFadeMs = releaseTicks * HuntCombatAnimator.PITFALL_RELEASE_TICK_MS;
            effects.forEach(effect => {
                effect.classList.add('is-releasing');
                effect.style.setProperty('--pitfall-release-fade-ms', `${releaseFadeMs}ms`);
                // OBS must show the fade even if a stale stylesheet or another
                // CSS animation wins the cascade. WAAPI owns the actual opacity
                // from the first escape tick; CSS remains the fallback.
                effect._pitfallReleaseAnimation?.cancel?.();
                effect._pitfallReleaseAnimation = effect.animate?.(
                    [{ opacity: 1 }, { opacity: 0 }],
                    { duration: releaseFadeMs, easing: 'ease-in', fill: 'forwards' }
                ) || null;
            });
            monsterImg?.classList?.remove('monster-pitfall-struggle-pulse');
            // Renderer uses this lifecycle guard to keep the trap mounted until
            // its release fade finishes. BEAT owns motion, not DOM persistence.
            monsterImg?.classList?.add('monster-pitfall-releasing');
            this.animationTimers.timeout(() => {
                if (Number(monsterImg?.dataset?.pitfallLifecycle || 0) !== lifecycle) return;
                effects.forEach(effect => effect.remove());
                monsterImg?.classList?.remove(
                    'monster-pitfall-caught',
                    'monster-pitfall-struggling',
                    'monster-pitfall-struggle-pulse',
                    'monster-pitfall-releasing',
                    'monster-flash-hit',
                    'monster-shocktrap-caught'
                );
                if (monsterImg?.dataset) delete monsterImg.dataset.pitfallLifecycle;
                if (monsterImg?.dataset) delete monsterImg.dataset.pitfallBeatOwned;
            }, releaseFadeMs);
            return;
        }
        if (!showcase || !monsterImg || !['pitfall', 'pitfall-pending', 'rockfall', 'flash', 'bomb'].includes(kind)) return;

        // ATB-bound traps live until trap-release. Unrelated transient effects
        // must never erase them; only replace the same lifecycle slot.
        const replacementSelector = kind === 'pitfall' || kind === 'pitfall-pending'
            ? '.environment-pitfall, .environment-pitfall-pending, .environment-shocktrap, .environment-shocktrap-pending'
            : `.environment-${kind}`;
        showcase.querySelectorAll(replacementSelector).forEach(effect => effect.remove());
        const effect = document.createElement('div');
        effect.className = `hunt-environment-effect environment-${kind}`;
        effect.setAttribute('aria-hidden', 'true');

        if (kind === 'pitfall-pending') {
            effect.innerHTML = '<div class="hunt-shock-trap-pending hunt-ground-web"><i></i></div>';
            showcase.appendChild(effect);
            return;
        } else if (kind === 'bomb') {
            effect.innerHTML = '<div class="hunt-barrel-bomb">💣</div><div class="hunt-bomb-blast">💥</div><strong>대형나무통폭탄!</strong>';
            showcase.appendChild(effect);

            // Stage 1 (0ms): Placement & Fuse ignition SFX
            this.owner.playSFX?.('bomb_fuse', null, { action: 'item', item: 'fuse' });

            // Stage 2 (550ms): Explosion, blast visual, screen shake & barrel bomb SFX
            this.animationTimers.timeout(() => {
                effect.classList.add('detonated');
                monsterImg.classList.remove('monster-bomb-hit');
                void monsterImg.offsetWidth;
                monsterImg.classList.add('monster-bomb-hit');
                this.card?.classList.add('hunt-bomb-shake');
                this.owner.playSFX?.('barrel_bomb', null, { action: 'item', item: 'large-barrel-bomb' });
            }, 550);

            this.animationTimers.timeout(() => {
                monsterImg.classList.remove('monster-bomb-hit');
                this.card?.classList.remove('hunt-bomb-shake');
                effect.remove();
            }, 1800);
            return;
        } else if (kind === 'flash') {
            effect.innerHTML = '<div class="hunt-flash-burst">✨</div><strong>섬광!</strong>';
            monsterImg.classList.remove('monster-flash-hit');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-flash-hit');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-flash-hit'), 1200);
        } else if (kind === 'pitfall') {
            effect.innerHTML = `
                <div class="pitfall-rear" aria-hidden="true">
                    <div class="pitfall-hole pitfall-hole-back"></div>
                    <div class="pitfall-net pitfall-net-back"><i></i></div>
                </div>
                <div class="pitfall-crack"></div>
                <div class="pitfall-front" aria-hidden="true">
                    <div class="pitfall-hole pitfall-hole-front"></div>
                    <div class="pitfall-net pitfall-net-front"><i></i></div>
                </div>
                ${Array.from({ length: 12 }, (_, index) => `<i class="pitfall-dirt" style="--i:${index}"></i>`).join('')}
                <strong>🪤 구멍함정!</strong>`;
            monsterImg.classList.remove(
                'monster-pitfall-caught',
                'monster-pitfall-struggling',
                'monster-pitfall-struggle-pulse',
                'monster-pitfall-releasing'
            );
            const lifecycle = Number(monsterImg.dataset.pitfallLifecycle || 0) + 1;
            monsterImg.dataset.pitfallLifecycle = String(lifecycle);
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-pitfall-caught');
            if (Array.isArray(details?.motion) && details.motion.length) {
                monsterImg.dataset.pitfallBeatOwned = 'true';
                this.monsterAttackAnimator.playBeatMotion(monsterImg, {
                    id: '__reaction.pitfall', name: '구멍함정', type: 'reaction',
                    motion: details.motion, runtimePreviewMuteAudio: true
                }, '__reaction.pitfall', null, []);
            }
            this.animationTimers.timeout(() => {
                if (Number(monsterImg.dataset.pitfallLifecycle || 0) === lifecycle
                    && monsterImg.classList.contains('monster-pitfall-caught')) {
                    monsterImg.classList.add('monster-pitfall-struggling');
                }
            }, 600);
        } else {
            effect.innerHTML = `
                <div class="rockfall-warning">⚠️</div>
                ${Array.from({ length: 5 }, (_, index) => `<b class="rockfall-boulder" style="--i:${index}">🪨</b>`).join('')}
                <div class="rockfall-impact-ring"></div>
                ${Array.from({ length: 14 }, (_, index) => `<i class="rockfall-debris" style="--i:${index}"></i>`).join('')}
                <strong>💥 낙석 명중!</strong>`;
            monsterImg.classList.remove('monster-rockfall-hit');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-rockfall-hit');
            this.card.classList.add('hunt-rockfall-shake');
            this.animationTimers.timeout(() => {
                monsterImg.classList.remove('monster-rockfall-hit');
                this.card?.classList.remove('hunt-rockfall-shake');
            }, 1900);
        }
        if (kind === 'pitfall') {
            effect.classList.add('is-atb-bound');
            effect.style?.setProperty?.('--trap-retained-atb', String(Number(details?.retainedAtb || 0)));
            effect.dataset.trapUseCount = String(Number(details?.useCount || 1));
        }
        showcase.appendChild(effect);
        if (kind !== 'pitfall') {
            this.animationTimers.timeout(() => effect.remove(), kind === 'flash' ? 1400 : 2300);
        }
    }

    resolveWeaponTargetVector(weaponImg, target) {
        const weaponRect = weaponImg?.getBoundingClientRect?.();
        const targetRect = target?.getBoundingClientRect?.();
        if (!weaponRect?.width || !targetRect?.width) return null;
        return {
            x: targetRect.left + targetRect.width / 2 - (weaponRect.left + weaponRect.width / 2),
            y: targetRect.top + targetRect.height / 2 - (weaponRect.top + weaponRect.height / 2)
        };
    }

    playWeaponAnimation(weaponImg, weaponId, idx, profile, target = null) {
        this.cancelWeaponAnimation(weaponImg);
        if (typeof weaponImg.animate === 'function') {
            const targetVector = profile.trackTarget
                ? this.resolveWeaponTargetVector(weaponImg, target)
                : null;
            const animation = weaponImg.animate(
                HuntWeaponAnimationCatalog.keyframes(profile, idx, targetVector),
                { duration: profile.durationMs, easing: 'ease-in-out', iterations: 1 }
            );
            this.activeWeaponAnimations.set(weaponImg, animation);
            animation.onfinish = () => {
                if (this.activeWeaponAnimations.get(weaponImg) === animation) {
                    // A finished Web Animation can retain its terminal keyframe in OBS Chromium.
                    // Great Sword charge profiles end in a raised preparation pose, so release
                    // the effect before removing our only handle to it.
                    try { animation.cancel(); } catch (_) { /* detached OBS node */ }
                    this.activeWeaponAnimations.delete(weaponImg);
                    weaponImg.style.removeProperty('transform');
                }
            };
            return;
        }

        // Old CEF fallback. Current OBS Chromium uses Web Animations and receives the semantic profile above.
        const suffix = ({
            great_sword: 'gs', long_sword: 'ls', dual_blades: 'db', sword_shield: 'sns', hammer: 'hm',
            hunting_horn: 'hh', lance: 'lc', gunlance: 'gl', switch_axe: 'sa', charge_blade: 'cb',
            insect_glaive: 'ig', light_bowgun: 'lbg', heavy_bowgun: 'hbg', bow: 'bow'
        })[weaponId] || 'ls';
        const fallbackClass = `w-anim-${suffix}-${idx}`;
        weaponImg.dataset.huntFallbackClass = fallbackClass;
        weaponImg.classList.remove(fallbackClass);
        void weaponImg.offsetWidth;
        weaponImg.classList.add(fallbackClass);
        this.animationTimers.timeout(() => weaponImg.classList.remove(fallbackClass), profile.durationMs);
    }

    cancelWeaponAnimation(weaponImg) {
        if (!weaponImg) return;
        const animation = this.activeWeaponAnimations.get(weaponImg);
        const animations = typeof weaponImg.getAnimations === 'function'
            ? weaponImg.getAnimations()
            : [];
        new Set([animation, ...animations].filter(Boolean)).forEach(activeAnimation => {
            try { activeAnimation.cancel(); } catch (_) { /* detached OBS node */ }
        });
        this.activeWeaponAnimations.delete(weaponImg);
        const fallbackClass = weaponImg?.dataset?.huntFallbackClass;
        if (fallbackClass) {
            weaponImg.classList.remove(fallbackClass);
            delete weaponImg.dataset.huntFallbackClass;
        }
    }

    createActionEffect(profile, stage = null, target = null) {
        if (typeof document === 'undefined') return null;
        const kind = profile?.effect;
        if (!kind || kind === 'none') return null;
        // Physical contact already gets an impact-anchored dust/critical effect.
        // The old moving sever arc and green counter square duplicated that
        // feedback and made a critical look like a projectile leaving the hit.
        if (['sever', 'blunt', 'counter', 'multi'].includes(kind)) return null;
        const effect = document.createElement('span');
        effect.className = `hunt-action-effect hunt-action-effect-${kind}`;
        effect.dataset.actionId = String(profile.actionId || '');
        const stageRect = stage?.getBoundingClientRect?.();
        const targetRect = target?.getBoundingClientRect?.();
        if (stageRect?.width > 0 && targetRect?.width > 0) {
            const actionId = String(profile.actionId || '');
            const spectacleScale = /(?:saed|wyvern_fire|full_release|focus_blast|zero_sum)/.test(actionId) ? 1.25 : 1;
            const targetSpan = Math.max(targetRect.width, targetRect.height);
            const size = Math.max(68, Math.min(220, targetSpan * .62 * spectacleScale));
            effect.style.left = `${targetRect.left - stageRect.left + targetRect.width / 2}px`;
            effect.style.top = `${targetRect.top - stageRect.top + targetRect.height / 2}px`;
            effect.style.setProperty('--hunt-action-effect-size', `${Math.round(size)}px`);
        }
        effect.setAttribute('aria-hidden', 'true');
        return effect;
    }

    createWeaponImpactAccent(profile, stage = null, target = null, hunterIndex = 0) {
        if (typeof document === 'undefined' || !profile?.impactAccent) return null;
        const stageRect = stage?.getBoundingClientRect?.();
        const targetRect = target?.getBoundingClientRect?.();
        if (!(stageRect?.width > 0) || !(targetRect?.width > 0)) return null;

        const accent = document.createElement('span');
        accent.className = `hunt-action-effect hunt-weapon-impact-accent hunt-weapon-impact-${profile.impactAccent}`;
        if (Number(hunterIndex) >= 2) accent.classList.add('is-from-right');
        accent.dataset.actionId = String(profile.actionId || '');
        accent.style.left = `${targetRect.left - stageRect.left + targetRect.width / 2}px`;
        accent.style.top = `${targetRect.top - stageRect.top + targetRect.height / 2}px`;
        accent.style.setProperty('--hunt-impact-width', `${Math.round(Math.max(170, Math.min(360, targetRect.width * .95)))}px`);
        accent.style.setProperty('--hunt-impact-height', `${Math.round(Math.max(100, Math.min(220, targetRect.height * .62)))}px`);
        if (profile.impactAccent === 'wide-slash') accent.innerHTML = '<i></i><b></b>';
        else if (profile.impactAccent === 'kick') {
            accent.textContent = '🦶';
        }
        accent.setAttribute('aria-hidden', 'true');
        return accent;
    }

    shakeMonster() {
        if (!this.card) return;
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (showcase) {
            showcase.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
            this.animationTimers.timeout(() => showcase.style.transform = '', 100);
        }
    }

    triggerRoarStun(idx, isStunned) {
        // Legacy roar callbacks share the same weapon-anchored interference layer
        // as wind and tremor so no second status badge can drift over the card.
        this.triggerHunterInterference(idx, 'roar', 'large', isStunned);
    }

    spawnVictoryEmoji(idx, emoji, options = {}) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#weapon-img-container-${idx}`);
        if (!targetEl) return;

        const emojiEl = document.createElement('div');
        emojiEl.className = 'victory-emoji-bubble hunter-weapon-emotion';
        if (options.variant === 'flashbug') emojiEl.classList.add('hunt-gather-flashbug');
        emojiEl.textContent = emoji;
        targetEl.appendChild(emojiEl);

        // Keep reactions anchored to the static weapon container. Only the image
        // itself receives attack/evasion transforms, so the emoji stays readable.
        this.animationTimers.timeout(() => {
            emojiEl.style.opacity = '1';
            emojiEl.style.transform = 'translate(-50%, -80px) scale(1.3)';
        }, 50);

        this.animationTimers.timeout(() => {
            emojiEl.style.opacity = '0';
            emojiEl.style.transform = 'translate(-50%, -120px) scale(1.0)';
            this.animationTimers.timeout(() => emojiEl.remove(), 400);
        }, 2200);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntCombatAnimator;
else globalThis.HuntCombatAnimator = HuntCombatAnimator;
