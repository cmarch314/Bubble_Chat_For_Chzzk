class HuntCombatAnimator {
    constructor(owner) {
        this.owner = owner;
        this.activeWeaponAnimations = new Map();
        this.weaponAnimationGenerations = new Map();
        this.monsterAttackAnimator = new HuntMonsterAttackAnimator(
            owner,
            () => this.triggerMonsterRoar()
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
        this.card.querySelectorAll('.hunt-split-shield').forEach(shieldImg => {
            this.cancelWeaponAnimation(shieldImg);
            shieldImg.style.removeProperty('transform');
        });
        this.card.querySelectorAll(
            '.game-hunt-weapon-img, .hunt-split-shield, .game-hunt-weapon-overlay'
        ).forEach(layer => layer.classList.remove('large-hit-anim', 'small-hit-anim'));
        this.card.querySelectorAll('.hunt-action-effect').forEach(effect => effect.remove());
        this.card.querySelectorAll('.hunt-environment-effect').forEach(effect => effect.remove());
        this.card.querySelectorAll('.hunt-damage-number').forEach(number => number.remove());
        this.card.querySelectorAll('.hunt-guard-impact').forEach(effect => effect.remove());
        this.card.querySelectorAll('.ig-kinsect').forEach(kinsect => {
            kinsect.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
        });
    }

    clearMonsterAnimations(reason = 'renderer-clear') {
        this.monsterAttackAnimator?.clearMonsterMotion(reason);
    }

    getMonsterMotionTrace() {
        return this.monsterAttackAnimator?.getMonsterMotionTrace() || [];
    }

    resolveMonsterImpactTimeline(pattern, targetIndices) {
        return this.monsterAttackAnimator?.resolveScreenCrossImpactTimeline(pattern, targetIndices) || null;
    }

    showDamageAtImpact(monsterImg, damage, hitzoneValue = 45, partKind = null) {
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
        if (hasMeasuredPosition) {
            const localX = Number(partPoint?.x ?? .55);
            const localY = Number(partPoint?.y ?? .36);
            number.style.left = `${targetRect.left - stageRect.left + targetRect.width * localX + spreadX}px`;
            number.style.top = `${targetRect.top - stageRect.top + targetRect.height * localY + spreadY}px`;
        } else {
            number.style.left = `calc(50% + ${spreadX}px)`;
            number.style.top = `calc(42% + ${spreadY}px)`;
        }

        stage.appendChild(number);
        this.animationTimers.timeout(() => number.remove(), 1050);
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
            bubble.textContent = String(content || '');
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

    triggerGuardImpact(idx) {
        if (!this.card || typeof document === 'undefined') return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const container = weaponCard?.querySelector('.game-hunt-weapon-img-container');
        if (!container) return;

        container.querySelectorAll('.hunt-guard-impact').forEach(effect => effect.remove());
        const hasSplitShield = Boolean(container.querySelector('.hunt-split-shield'));
        const impact = document.createElement('span');
        impact.className = `hunt-guard-impact${hasSplitShield ? ' is-split-shield' : ' is-weapon-fallback'}`;
        impact.textContent = '🛡️';
        impact.setAttribute('aria-hidden', 'true');
        container.appendChild(impact);
        this.animationTimers.timeout(() => impact.remove(), 620);
    }

    triggerMonsterRoar() {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (!monsterImg || !showcase) return;

        // Roar vibration animation on monster image
        monsterImg.classList.remove('monster-roar-vibrate');
        void monsterImg.offsetWidth;
        monsterImg.classList.add('monster-roar-vibrate');
        this.animationTimers.timeout(() => monsterImg.classList.remove('monster-roar-vibrate'), 1200);

        // Spawn a large shaking speaker emoji that fades out
        const speaker = document.createElement('div');
        speaker.className = 'roar-speaker-emoji';
        speaker.textContent = '🔊';
        showcase.appendChild(speaker);

        // Spawn concentric sound wave rings
        for (let i = 0; i < 3; i++) {
            this.animationTimers.timeout(() => {
                if (!this.card) return;
                const ring = document.createElement('div');
                ring.className = 'roar-wave-ring';
                showcase.appendChild(ring);
                this.animationTimers.timeout(() => ring.remove(), 1000);
            }, i * 300);
        }

        // Vibrate all hunter cards during the roar
        const weaponCards = this.card.querySelectorAll('.game-hunt-weapon-card');
        weaponCards.forEach(c => c.classList.add('hunter-roar-shake-anim'));
        this.animationTimers.timeout(() => {
            weaponCards.forEach(c => c.classList.remove('hunter-roar-shake-anim'));
        }, 1500);

        this.animationTimers.timeout(() => {
            speaker.remove();
        }, 1500);
    }

    triggerMonsterCharge() {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-attacking') || this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            monsterImg.classList.remove('monster-charge-slide');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-charge-slide');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-charge-slide'), 750);
        }
    }

    triggerMonsterAttack(type, emoji, targets, attackName = '', pattern = null) {
        return this.monsterAttackAnimator.triggerMonsterAttack(type, emoji, targets, attackName, pattern);
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
    triggerHitAnimation(idx, w, reaction = {}) {
        if (!this.card || !w || w.hp <= 0) return;
        this.interruptWeaponVisual(idx, w);
        this.cancelHitAnimation(idx);
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const weaponLayers = weaponCard?.querySelectorAll(
            '.game-hunt-weapon-img, .hunt-split-shield, .game-hunt-weapon-overlay'
        ) || [];
        if (!weaponCard) return;

        const kind = reaction.kind === 'weak' ? 'weak' : 'strong';
        const hitClass = kind === 'weak' ? 'small-hit-anim' : 'large-hit-anim';
        const cardShakeClass = kind === 'weak' ? 'hunter-card-small-shake' : 'hunter-card-large-shake';
        const durationMs = kind === 'weak' ? 1500 : 4000;
        const direction = Number(reaction.knockbackDirection || w.hitKnockbackDirection || (idx < 2 ? -1 : 1)) < 0 ? -1 : 1;
        const generation = Number(this.weaponAnimationGenerations.get(weaponCard) || 0);

        weaponLayers.forEach(layer => {
            layer.classList.remove('large-hit-anim', 'small-hit-anim', 'weapon-carted-out');
            layer.style.setProperty('--hunter-hit-direction', String(direction));
            const isShield = layer.classList.contains('hunt-split-shield');
            layer.style.setProperty('--hunter-hit-strong-x', `${direction * (isShield ? 185 : 210)}px`);
            layer.style.setProperty('--hunter-hit-weak-x', `${direction * (isShield ? 34 : 42)}px`);
            layer.style.setProperty('--hunter-hit-angle-offset', isShield ? `${direction * -16}deg` : '0deg');
            layer.style.setProperty('--hunter-hit-y-offset', isShield ? '-7px' : '0px');
        });
        void weaponCard.offsetWidth;
        weaponCard.classList.add(cardShakeClass);
        weaponLayers.forEach(layer => layer.classList.add(hitClass));

        this.animationTimers.timeout(() => {
            if (this.weaponAnimationGenerations.get(weaponCard) !== generation) return;
            weaponCard.classList.remove(cardShakeClass);
        }, kind === 'weak' ? 340 : 460);
        this.animationTimers.timeout(() => {
            if (this.weaponAnimationGenerations.get(weaponCard) !== generation || w.status === 'dead') return;
            this.cancelHitAnimation(idx);
        }, durationMs);
    }

    cancelHitAnimation(idx) {
        const weaponCard = this.card?.querySelector?.(`#fight-card-${idx}`);
        if (!weaponCard) return;
        weaponCard.classList.remove('hunter-card-large-shake', 'hunter-card-small-shake');
        weaponCard.querySelectorAll(
            '.game-hunt-weapon-img, .hunt-split-shield, .game-hunt-weapon-overlay'
        ).forEach(layer => {
            layer.classList.remove('large-hit-anim', 'small-hit-anim');
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
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (tag) {
            tag.textContent = `💀 ${timerVal}s`;
            tag.className = 'game-hunt-status-tag fainted';
        }
        
        // Wrap fainted card animation and overlay generation in a 180ms delay to let the hit-shake complete first
        this.animationTimers.timeout(() => {
            if (!this.card) return;
            const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
            if (weaponCard) {
                weaponCard.classList.remove(
                    'stunned', 'roar-stunned',
                    'large-hit-anim', 'small-hit-anim',
                    'hunter-card-large-shake', 'hunter-card-small-shake'
                );
                const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
                if (imgContainer) {
                    const roarOverlay = imgContainer.querySelector('.roar-stun-overlay');
                    if (roarOverlay) {
                        roarOverlay.remove();
                    }
                    imgContainer.querySelector('.hunter-stun-orbit')?.remove();
                }
                const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
                if (weaponImg) {
                    if (w) {
                        // Double check status: if they revived during these 180ms, do not animate
                        if (w.status !== 'dead') return;

                        // Keep the hunter HUD anchored. Only the weapon layers are
                        // knocked out of the card when the hunter carts.
                        weaponCard.classList.add('dead');
                        weaponCard.classList.add('hunter-card-large-shake');
                        const layers = weaponCard.querySelectorAll('.game-hunt-weapon-img, .hunt-split-shield');
                        layers.forEach(layer => {
                            this.cancelWeaponAnimation(layer);
                            layer.classList.remove('large-hit-anim', 'small-hit-anim', 'weapon-carted-out');
                            layer.style.setProperty('--hunter-hit-direction', idx < 2 ? '-1' : '1');
                        });
                        void weaponCard.offsetWidth;
                        layers.forEach(layer => layer.classList.add('weapon-carted-out'));
                        this.animationTimers.timeout(() => weaponCard?.classList.remove('hunter-card-large-shake'), 520);
                        
                        // Remove any existing faint cart overlay first
                        const oldOverlay = weaponCard.querySelector('.faint-cart-overlay');
                        if (oldOverlay) oldOverlay.remove();
                    } else {
                        weaponImg.style.transition = 'opacity 0.2s ease-out';
                        weaponImg.style.opacity = '0';
                    }
                }
            }
        }, 180);
    }

    triggerMonsterKnockdownAnim() {
        if (!this.card) return;
        // Travel belongs to the outer wrapper, while knockdown belongs to the
        // image. Return the wrapper home before laying the monster down.
        this.clearMonsterAnimations('knockdown');
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            monsterImg.dataset.partBreakReactionGeneration = String(
                Number(monsterImg.dataset.partBreakReactionGeneration || 0) + 1
            );
            monsterImg.classList.remove('monster-part-break-topple', 'monster-tail-sever-roll');
            monsterImg.style.removeProperty('--monster-part-reaction-duration');
            monsterImg.classList.remove('enraged');
            monsterImg.classList.remove('stunned_monster');
            monsterImg.classList.add('monster-knockdown-anim');
        }
    }

    triggerMonsterPartBreakReaction(kind, durationTicks, partKind = null) {
        if (!this.card) return;
        this.clearMonsterAnimations(`part-break:${partKind || 'unknown'}`);
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted')
            || this.card.querySelector('#fight-monster-img');
        if (!monsterImg) return;

        const reactionClass = kind === 'tail_sever_roll'
            ? 'monster-tail-sever-roll'
            : 'monster-part-break-topple';
        const durationMs = Math.max(900, Number(durationTicks || 1) * 100);
        const generation = Number(monsterImg.dataset.partBreakReactionGeneration || 0) + 1;
        monsterImg.dataset.partBreakReactionGeneration = String(generation);
        monsterImg.dataset.partBreakReaction = kind || 'part_break_topple';
        if (partKind) monsterImg.dataset.partBreakKind = String(partKind);
        else delete monsterImg.dataset.partBreakKind;
        monsterImg.classList.remove(
            'monster-knockdown-anim',
            'monster-part-break-topple',
            'monster-tail-sever-roll'
        );
        monsterImg.style.setProperty('--monster-part-reaction-duration', `${durationMs}ms`);
        void monsterImg.offsetWidth;
        monsterImg.classList.add(reactionClass);

        this.animationTimers.timeout(() => {
            if (Number(monsterImg.dataset.partBreakReactionGeneration || 0) !== generation) return;
            monsterImg.classList.remove(reactionClass);
            monsterImg.style.removeProperty('--monster-part-reaction-duration');
            delete monsterImg.dataset.partBreakReaction;
            delete monsterImg.dataset.partBreakKind;
        }, durationMs + 80);
    }

    restoreBorder(wIndex, w) {
        if (!this.card || !w) return;
        if (w.status === 'dead') return;
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
                layer.classList.remove('large-hit-anim', 'small-hit-anim', 'weapon-carted-out');
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
            if (profile.impact && hitContext?.resolved) this.animationTimers.timeout(() => {
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
                    this.showDamageAtImpact(monsterImg, hitContext.damage, hitzoneVal, hitContext.partKind);
                    monsterImg.classList.remove('small-hit-anim', 'large-hit-anim');
                    void monsterImg.offsetWidth;
                    monsterImg.classList.add(hitzoneVal >= 45 ? 'large-hit-anim' : 'small-hit-anim');
                    this.animationTimers.timeout(() => {
                        monsterImg?.classList.remove('small-hit-anim', 'large-hit-anim');
                    }, 350);
                }
            }, impactDelay);

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
                    void kinsectImg.offsetWidth;
                    kinsectImg.classList.add(profile.kinsect === 'extract' ? 'ig-kinsect-extract' : 'ig-kinsect-assault');
                    animDuration = Math.max(animDuration, profile.kinsect === 'extract' ? 1080 : 760);
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
                    if (kinsectImg) kinsectImg.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
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

    triggerEnvironmentEffect(kind) {
        if (!this.card) return;
        const showcase = this.card.querySelector('#monster-showcase-panel');
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        if (!showcase || !monsterImg || !['pitfall', 'rockfall', 'flash', 'shocktrap', 'shocktrap-pending', 'bomb'].includes(kind)) return;

        showcase.querySelectorAll('.hunt-environment-effect').forEach(effect => effect.remove());
        const effect = document.createElement('div');
        effect.className = `hunt-environment-effect environment-${kind}`;
        effect.setAttribute('aria-hidden', 'true');

        if (kind === 'shocktrap-pending') {
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
        } else if (kind === 'shocktrap') {
            effect.innerHTML = '<div class="hunt-shock-trap hunt-ground-web is-triggered"><i></i></div>';
            monsterImg.classList.remove('monster-flash-hit');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-flash-hit');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-flash-hit'), 1600);
        } else if (kind === 'flash') {
            effect.innerHTML = '<div class="hunt-flash-burst">✨</div><strong>섬광!</strong>';
            monsterImg.classList.remove('monster-flash-hit');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-flash-hit');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-flash-hit'), 1200);
        } else if (kind === 'pitfall') {
            effect.innerHTML = `
                <div class="pitfall-crack"></div><div class="pitfall-hole"></div>
                <div class="pitfall-net">🕸️</div>
                ${Array.from({ length: 12 }, (_, index) => `<i class="pitfall-dirt" style="--i:${index}"></i>`).join('')}
                <strong>🪤 구멍함정!</strong>`;
            monsterImg.classList.remove('monster-pitfall-caught', 'monster-pitfall-struggling');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-pitfall-caught');
            this.animationTimers.timeout(() => {
                if (monsterImg.classList.contains('monster-pitfall-caught')) {
                    monsterImg.classList.add('monster-pitfall-struggling');
                }
            }, 650);
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
        showcase.appendChild(effect);
        this.animationTimers.timeout(() => effect.remove(), kind === 'flash' ? 1400 : (kind === 'pitfall' ? 2500 : 2300));
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

