class HuntCombatAnimator {
    constructor(owner) {
        this.owner = owner;
        this.activeWeaponAnimations = new Map();
        this.monsterAttackAnimator = new HuntMonsterAttackAnimator(
            owner,
            () => this.triggerMonsterRoar()
        );
    }

    get card() { return this.owner.card; }

    get animationTimers() { return this.owner.animationTimers; }

    clearWeaponAnimations() {
        this.activeWeaponAnimations.forEach(animation => {
            try { animation.cancel(); } catch (_) { /* detached OBS node */ }
        });
        this.activeWeaponAnimations.clear();
        if (!this.card?.querySelectorAll) return;
        this.card.querySelectorAll('.game-hunt-weapon-img').forEach(weaponImg => {
            this.cancelWeaponAnimation(weaponImg);
            weaponImg.style.removeProperty('transform');
        });
        this.card.querySelectorAll('.hunt-action-effect').forEach(effect => effect.remove());
        this.card.querySelectorAll('.hunt-environment-effect').forEach(effect => effect.remove());
        this.card.querySelectorAll('.ig-kinsect').forEach(kinsect => {
            kinsect.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
        });
    }

    showSkillBubble(idxOrMonster, text) {
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
        bubble.textContent = text;
        targetEl.appendChild(bubble);

        this.animationTimers.timeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateX(-50%) translateY(-15px)';
        }, 10);

        this.animationTimers.timeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateX(-50%) translateY(-30px)';
            this.animationTimers.timeout(() => bubble.remove(), 400);
        }, 2500);
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
    triggerHitAnimation(idx, w, damage) {
        if (!this.card) return;
        this.interruptWeaponVisual(idx, w);
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (weaponCard && w.hp > 0) {
            if (damage >= 30) {
                weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                void weaponCard.offsetWidth; // reflow
                weaponCard.classList.add('large-hit-anim');

                const tag = this.card.querySelector(`#status-tag-${idx}`);
                if (tag) {
                    tag.textContent = '🥴';
                    tag.className = 'game-hunt-status-tag fainted';
                }

                this.animationTimers.timeout(() => {
                    if (!this.card) return; // [FIX] 강제 중단 시 TypeError 방지
                    if (w && w.status !== 'dead') {
                        weaponCard.classList.remove('large-hit-anim');
                        if (w.status === 'alive' && w.hp > 0) {
                            const currentTag = this.card.querySelector(`#status-tag-${idx}`);
                            if (currentTag) {
                                currentTag.textContent = '⚔️';
                                currentTag.className = 'game-hunt-status-tag active';
                            }
                        }
                    }
                }, 2500);
            } else {
                weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                void weaponCard.offsetWidth; // reflow
                weaponCard.classList.add('small-hit-anim');

                const tag = this.card.querySelector(`#status-tag-${idx}`);
                if (tag) {
                    tag.textContent = '💫';
                    tag.className = 'game-hunt-status-tag stunned';
                }

                this.animationTimers.timeout(() => {
                    if (!this.card) return; // [FIX] 강제 중단 시 TypeError 방지
                    if (w && w.status !== 'dead') {
                        weaponCard.classList.remove('small-hit-anim');
                        if (w.status === 'alive' && w.hp > 0) {
                            const currentTag = this.card.querySelector(`#status-tag-${idx}`);
                            if (currentTag) {
                                currentTag.textContent = '⚔️';
                                currentTag.className = 'game-hunt-status-tag active';
                            }
                        }
                    }
                }, 1000);
            }
        }
    }

    interruptWeaponVisual(idx, w) {
        const weaponCard = this.card?.querySelector(`#fight-card-${idx}`);
        const weaponImg = weaponCard?.querySelector('.game-hunt-weapon-img');
        if (weaponImg) {
            this.cancelWeaponAnimation(weaponImg);
            weaponImg.style.removeProperty('transform');
        }
        if (w?.id === 'great_sword') this.owner.updateWeaponChargeAuraUI(idx, w);
    }

    triggerRollAnimation(idx) {
        if (!this.card) return;
        const weaponImg = this.card.querySelector(`#fight-card-${idx} .game-hunt-weapon-img`);
        if (weaponImg) {
            this.cancelWeaponAnimation(weaponImg);
            weaponImg.classList.remove('roll-anim');
            void weaponImg.offsetWidth; // trigger reflow
            weaponImg.classList.add('roll-anim');
            this.animationTimers.timeout(() => weaponImg.classList.remove('roll-anim'), 600);
        }
    }

    triggerInvincibleJump(idx, active) {
        if (!this.card) return;
        const weaponImg = this.card.querySelector(`#fight-card-${idx} .game-hunt-weapon-img`);
        if (!weaponImg) return;
        this.cancelWeaponAnimation(weaponImg);
        weaponImg.style.removeProperty('transform');
        weaponImg.classList.toggle('hunter-invincible-jump', Boolean(active));
    }

    triggerStunUI(idx, isStunned) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const imgContainer = weaponCard?.querySelector('.game-hunt-weapon-img-container');
        if (isStunned) {
            const weaponImg = weaponCard?.querySelector('.game-hunt-weapon-img');
            if (weaponImg) {
                this.cancelWeaponAnimation(weaponImg);
                weaponImg.style.removeProperty('transform');
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
                weaponCard.classList.remove('stunned', 'roar-stunned', 'large-hit-anim', 'small-hit-anim');
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

                        // Add dead class to card and deactivate weapon image filter
                        weaponCard.classList.add('dead');
                        weaponImg.style.transition = 'filter 0.3s ease';
                        weaponImg.style.filter = 'grayscale(0.5)';
                        
                        // Clear previous inline transform/animation/transition first to ensure clean state
                        weaponCard.style.transform = '';
                        weaponCard.style.borderColor = '';
                        weaponCard.style.boxShadow = '';
                        weaponCard.style.transition = 'none';
                        weaponCard.style.animation = 'none';
                        void weaponCard.offsetWidth; // Force reflow
                        
                        // Animate the weapon card itself down-left
                        weaponCard.style.animation = 'cart-card-slide-out 3.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards';
                        
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
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            monsterImg.classList.remove('enraged');
            monsterImg.classList.remove('stunned_monster');
            monsterImg.classList.add('monster-knockdown-anim');
        }
    }

    restoreBorder(wIndex, w) {
        if (!this.card || !w) return;
        if (w.status === 'dead') return;
        const weaponCard = this.card.querySelector(`#fight-card-${w.index}`);
        if (weaponCard) {
            // Remove all custom classes and animations from card
            weaponCard.classList.remove('dead', 'ls-spirit-1', 'ls-spirit-2', 'ls-spirit-3', 'db-demon-mode', 'cb-shield-charged', 'ig-3-extracts');
            weaponCard.style.animation = 'none';
            weaponCard.style.transform = '';
            weaponCard.style.borderColor = '';
            weaponCard.style.boxShadow = '';
            weaponCard.style.transition = 'transform 0.15s ease, border-color 0.15s ease';
            
            const cartOverlay = weaponCard.querySelector('.faint-cart-overlay');
            if (cartOverlay) {
                cartOverlay.remove();
            }

            // Handle Weapon Image Overlays
            const spiritOverlay = this.card.querySelector(`#spirit-overlay-${w.index}`);
            if (spiritOverlay) {
                spiritOverlay.style.opacity = '0';
                spiritOverlay.style.animation = 'none';
            }

            const shieldOverlay = this.card.querySelector(`#shield-overlay-${w.index}`);
            if (shieldOverlay) {
                shieldOverlay.style.opacity = '0';
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

            if (w.id === 'long_sword' && w.spiritLevel > 0) {
                if (spiritOverlay) {
                    if (w.spiritLevel === 1) {
                        spiritOverlay.style.backgroundColor = '#ffffff';
                        spiritOverlay.style.opacity = '0.5';
                    } else if (w.spiritLevel === 2) {
                        spiritOverlay.style.backgroundColor = '#f1c40f';
                        spiritOverlay.style.opacity = '0.6';
                    } else if (w.spiritLevel === 3) {
                        spiritOverlay.style.backgroundColor = '#e74c3c';
                        spiritOverlay.style.opacity = '0.75';
                        spiritOverlay.style.animation = 'ls-spirit-image-pulse 1s infinite alternate';
                    }
                }
            }
            if (w.id === 'dual_blades' && w.demonModeDuration > 0) {
                weaponCard.classList.add('db-demon-mode');
            }
            if (w.id === 'charge_blade' && w.shieldChargeDuration > 0) {
                // Charge Blade shield charge activates overlay
                weaponCard.classList.add('cb-shield-charged');
                if (shieldOverlay) {
                    shieldOverlay.style.opacity = '0.75';
                }
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

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, actionOrName = null, isDodge = false) {
        if (!this.card) return;
        if (w && w.status === 'dead' && !isAttack) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (!weaponCard) return;
        const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
        const kinsectImg = weaponCard.querySelector('.ig-kinsect');

        if (isAttack) {
            const profile = HuntWeaponAnimationCatalog.resolve(w?.id, actionOrName);
            const actionEffect = this.createActionEffect(profile);
            if (actionEffect) {
                const impactStage = this.card.querySelector('#monster-showcase-panel');
                (impactStage || weaponCard).appendChild(actionEffect);
                this.animationTimers.timeout(() => actionEffect.remove(), Math.min(1200, profile.durationMs));
            }

            let animDuration = profile.durationMs;
            weaponCard.dataset.huntActionId = profile.actionId;
            weaponCard.dataset.huntMotion = profile.motion;
            if (weaponImg && profile.animateWeapon) this.playWeaponAnimation(weaponImg, w?.id, idx, profile);

            if (kinsectImg && w?.id === 'insect_glaive') {
                kinsectImg.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
                if (profile.kinsect !== 'none') {
                    void kinsectImg.offsetWidth;
                    kinsectImg.classList.add(profile.kinsect === 'extract' ? 'ig-kinsect-extract' : 'ig-kinsect-assault');
                    animDuration = Math.max(animDuration, profile.kinsect === 'extract' ? 1080 : 760);
                }
            }

            weaponCard.style.borderColor = borderClr;
            weaponCard.style.zIndex = '10';
            this.animationTimers.timeout(() => {
                if (w && w.status !== 'dead') {
                    if (weaponImg) this.cancelWeaponAnimation(weaponImg);
                    if (kinsectImg) kinsectImg.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
                    this.restoreBorder(idx, w);
                    weaponCard.style.zIndex = '';
                }
            }, animDuration);
            return;
        }

        if (!isDodge) {
            weaponCard.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px) scale(0.95)`;
        }
        weaponCard.style.borderColor = borderClr;
        this.animationTimers.timeout(() => {
            if (w && w.status !== 'dead') {
                if (!isDodge) weaponCard.style.transform = '';
                this.restoreBorder(idx, w);
            }
        }, 150);
    }

    triggerEnvironmentEffect(kind) {
        if (!this.card) return;
        const showcase = this.card.querySelector('#monster-showcase-panel');
        const monsterImg = this.card.querySelector('.hunt-small-monster.is-targeted') || this.card.querySelector('#fight-monster-img');
        if (!showcase || !monsterImg || !['pitfall', 'rockfall', 'flash', 'shocktrap', 'bomb'].includes(kind)) return;

        showcase.querySelectorAll('.hunt-environment-effect').forEach(effect => effect.remove());
        const effect = document.createElement('div');
        effect.className = `hunt-environment-effect environment-${kind}`;
        effect.setAttribute('aria-hidden', 'true');

        if (kind === 'bomb') {
            effect.innerHTML = '<div class="hunt-barrel-bomb">💣</div><div class="hunt-bomb-blast">💥</div><strong>대형나무통폭탄!</strong>';
            monsterImg.classList.remove('monster-bomb-hit');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-bomb-hit');
            this.card.classList.add('hunt-bomb-shake');
            this.animationTimers.timeout(() => {
                monsterImg.classList.remove('monster-bomb-hit');
                this.card?.classList.remove('hunt-bomb-shake');
            }, 1500);
        } else if (kind === 'shocktrap') {
            effect.innerHTML = '<div class="hunt-shock-trap">⚡🪤⚡</div><strong>마비함정!</strong>';
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
            monsterImg.classList.remove('monster-pitfall-caught');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-pitfall-caught');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-pitfall-caught'), 2200);
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

    playWeaponAnimation(weaponImg, weaponId, idx, profile) {
        this.cancelWeaponAnimation(weaponImg);
        if (typeof weaponImg.animate === 'function') {
            const animation = weaponImg.animate(
                HuntWeaponAnimationCatalog.keyframes(profile, idx),
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

    createActionEffect(profile) {
        if (typeof document === 'undefined') return null;
        const kind = profile?.effect;
        if (!kind || kind === 'none') return null;
        const effect = document.createElement('span');
        effect.className = `hunt-action-effect hunt-action-effect-${kind}`;
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
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (isStunned) {
            if (weaponCard) {
                weaponCard.classList.add('roar-stunned');
                
                const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
                if (imgContainer) {
                    let roarOverlay = imgContainer.querySelector('.roar-stun-overlay');
                    if (!roarOverlay) {
                        roarOverlay = document.createElement('div');
                        roarOverlay.className = 'roar-stun-overlay';
                        roarOverlay.textContent = '🙉';
                        imgContainer.appendChild(roarOverlay);
                    }
                }
            }
            if (tag) {
                tag.textContent = '🙉';
                tag.className = 'game-hunt-status-tag stunned';
            }
        } else {
            if (weaponCard) {
                weaponCard.classList.remove('roar-stunned');
                
                const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
                if (imgContainer) {
                    const roarOverlay = imgContainer.querySelector('.roar-stun-overlay');
                    if (roarOverlay) {
                        roarOverlay.remove();
                    }
                }
            }
            if (tag) {
                tag.textContent = '⚔️';
                tag.className = 'game-hunt-status-tag active';
            }
        }
    }

    spawnVictoryEmoji(idx, emoji) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#fight-card-${idx}`);
        if (!targetEl) return;

        const emojiEl = document.createElement('div');
        emojiEl.className = 'victory-emoji-bubble';
        emojiEl.textContent = emoji;
        targetEl.appendChild(emojiEl);

        // Animate up and fade out (starts from weapon image center and floats up higher)
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

