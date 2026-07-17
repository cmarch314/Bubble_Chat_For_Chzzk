class HuntCombatAnimator {
    constructor(owner) {
        this.owner = owner;
        this.monsterAttackAnimator = new HuntMonsterAttackAnimator(
            owner,
            () => this.triggerMonsterRoar()
        );
    }

    get card() { return this.owner.card; }

    get animationTimers() { return this.owner.animationTimers; }

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
        bubble.className = 'skill-bubble';
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
        const monsterImg = this.card.querySelector('#fight-monster-img');
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
        const monsterImg = this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            monsterImg.classList.remove('monster-charge-slide');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-charge-slide');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-charge-slide'), 750);
        }
    }

    triggerMonsterAttack(type, emoji, targets, attackName = '') {
        return this.monsterAttackAnimator.triggerMonsterAttack(type, emoji, targets, attackName);
    }
    triggerHitAnimation(idx, w, damage) {
        if (!this.card) return;
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

    triggerRollAnimation(idx) {
        if (!this.card) return;
        const container = this.card.querySelector(`#fight-card-${idx} .game-hunt-weapon-img-container`);
        if (container) {
            container.classList.remove('roll-anim');
            void container.offsetWidth; // trigger reflow
            container.classList.add('roll-anim');
            this.animationTimers.timeout(() => container.classList.remove('roll-anim'), 600);
        }
    }

    triggerStunUI(idx, isStunned) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (isStunned) {
            if (weaponCard) weaponCard.classList.add('stunned');
            if (tag) {
                tag.textContent = '🌀';
                tag.className = 'game-hunt-status-tag stunned';
            }
        } else {
            if (weaponCard) weaponCard.classList.remove('stunned');
            if (tag) {
                tag.textContent = '⚔️';
                tag.className = 'game-hunt-status-tag active';
            }
        }
    }

    triggerDeathTag(idx, w, timerVal = 5) {
        if (!this.card) return;
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
        const monsterImg = this.card.querySelector('#fight-monster-img');
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

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, moveName = null, isDodge = false) {
        if (!this.card) return;
        if (w && w.status === 'dead' && !isAttack) return; // Dead hunters sliding out do not shake, but lethal hits should shake first
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (weaponCard) {
            const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
            const kinsectImg = weaponCard.querySelector('.ig-kinsect');
            if (isAttack) {
                const isKinsectExtract = w?.id === 'insect_glaive' && String(moveName || '').includes('진액 추출');
                const actionEffect = this.createActionEffect(moveName);
                if (actionEffect) {
                    weaponCard.appendChild(actionEffect);
                    this.animationTimers.timeout(() => actionEffect.remove(), 900);
                }
                // Default fallback
                let animClass = 'w-anim-ls';
                let animDuration = 500;

                const animMap = {
                    great_sword: { className: 'w-anim-gs', duration: 900 },
                    long_sword: { className: 'w-anim-ls', duration: 500 },
                    dual_blades: { className: 'w-anim-db', duration: 450 },
                    sword_shield: { className: 'w-anim-sns', duration: 400 },
                    hammer: { className: 'w-anim-hm', duration: 850 },
                    hunting_horn: { className: 'w-anim-hh', duration: 600 },
                    lance: { className: 'w-anim-lc', duration: 550 },
                    gunlance: { className: 'w-anim-gl', duration: 650 },
                    switch_axe: { className: 'w-anim-sa', duration: 600 },
                    charge_blade: { className: 'w-anim-cb', duration: 750 },
                    insect_glaive: { className: 'w-anim-ig', duration: 650 },
                    light_bowgun: { className: 'w-anim-lbg', duration: 500 },
                    heavy_bowgun: { className: 'w-anim-hbg', duration: 700 },
                    bow: { className: 'w-anim-bow', duration: 650 }
                };

                if (moveName && (moveName.includes('공중회전난무') || moveName.includes('공중 회전') || moveName.includes('리와이베기') || moveName.includes('돌진연참'))) {
                    animClass = 'w-anim-db-levi';
                    animDuration = 1200;
                } else if (w && animMap[w.id]) {
                    animClass = animMap[w.id].className;
                    animDuration = animMap[w.id].duration;
                }

                if (weaponImg && !isKinsectExtract) {
                    // Remove all old and new animation classes
                    const allClasses = [
                        'attack-melee-anim', 'attack-hammer-kkt', 'attack-hammer-keep-sway', 
                        'attack-hammer-charge2', 'attack-hammer-charge3', 'attack-hammer-tornado', 
                        'attack-hammer-anim', 'attack-gs-charge1', 'attack-gs-charge2', 
                        'attack-gs-charge3', 'attack-bowgun-anim',
                        'w-anim-gs', 'w-anim-ls', 'w-anim-db', 'w-anim-db-levi', 'w-anim-sns', 'w-anim-hm',
                        'w-anim-hh', 'w-anim-lc', 'w-anim-gl', 'w-anim-sa', 'w-anim-cb',
                        'w-anim-ig', 'w-anim-lbg', 'w-anim-hbg', 'w-anim-bow'
                    ];
                    // OBS CEF 호환: 접미사 붙은 애니메이션 클래스도 일괄 삭제
                    allClasses.forEach(cls => {
                        weaponImg.classList.remove(cls);
                        for (let i = 0; i < 4; i++) weaponImg.classList.remove(`${cls}-${i}`);
                    });
                    void weaponImg.offsetWidth; // trigger reflow
                    
                    const targetAnimClass = animClass.startsWith('w-anim-') ? `${animClass}-${idx}` : animClass;
                    weaponImg.classList.add(targetAnimClass);
                }

                if (kinsectImg && w?.id === 'insect_glaive') {
                    kinsectImg.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
                    void kinsectImg.offsetWidth;
                    kinsectImg.classList.add(isKinsectExtract ? 'ig-kinsect-extract' : 'ig-kinsect-assault');
                    animDuration = isKinsectExtract ? 1100 : Math.max(animDuration, 760);
                }

                weaponCard.style.borderColor = borderClr;
                weaponCard.style.zIndex = "10";
                this.animationTimers.timeout(() => {
                    if (w && w.status !== 'dead') {
                        if (weaponImg) {
                            weaponImg.classList.remove(animClass);
                            weaponImg.classList.remove(`${animClass}-${idx}`);
                        }
                        if (kinsectImg) kinsectImg.classList.remove('ig-kinsect-extract', 'ig-kinsect-assault');
                        this.restoreBorder(idx, w);
                        weaponCard.style.zIndex = "";
                    }
                }, animDuration);
            } else {
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
        }
    }

    createActionEffect(moveName = '') {
        if (typeof document === 'undefined') return null;
        const name = String(moveName || '');
        let kind = 'sever';
        if (/포격|용격|폭발|초고출력|속성해방|기폭/.test(name)) kind = 'explosive';
        else if (/탄|사격|화살|저격/.test(name)) kind = 'projectile';
        else if (/간파|카운터|상쇄|가드 포인트|태클/.test(name)) kind = 'counter';
        else if (/해머|쿵|방패치기|어퍼|빅뱅|연주|향옥/.test(name)) kind = 'blunt';
        else if (/난무|연참|연격|기관용탄/.test(name)) kind = 'multi';
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

