class HuntMonsterAttackAnimator {
    constructor(owner, onRoar) {
        this.owner = owner;
        this.onRoar = onRoar;
    }

    get card() { return this.owner.card; }

    get animationTimers() { return this.owner.animationTimers; }

    triggerMonsterRoar() {
        this.onRoar();
    }

    triggerMonsterAttack(type, emoji, targets, attackName = '') {
        if (!this.card || !targets || targets.length === 0) return;

        const monsterImg = this.card.querySelector('#fight-monster-img');
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (!monsterImg || !showcase) return;

        const firstTarget = targets[0];
        const targetCard = this.card.querySelector(`#fight-card-${firstTarget.index}`);
        if (!targetCard) return;

        const containerRect = this.card.getBoundingClientRect();
        const monsterRect = monsterImg.getBoundingClientRect();

        const monsterCenter = {
            x: monsterRect.left + monsterRect.width / 2,
            y: monsterRect.top + monsterRect.height / 2
        };

        // Custom animations based on attackName
        if (attackName) {
            const cleanName = attackName.toLowerCase();
            
            // 1. Roar attack
            if (cleanName.includes('포효') || cleanName.includes('울음') || cleanName.includes('노성') || cleanName.includes('소리') || cleanName.includes('음파') || cleanName.includes('폭효')) {
                this.triggerMonsterRoar();
                return;
            }

            // 2. Tail Spin
            if (cleanName.includes('회전') || cleanName.includes('대회전') || cleanName.includes('테일베기') || cleanName.includes('꼬리치기') || cleanName.includes('휩쓸기') || cleanName.includes('후려치기')) {
                monsterImg.classList.remove('monster-tailspin-anim');
                void monsterImg.offsetWidth;
                monsterImg.classList.add('monster-tailspin-anim');
                this.animationTimers.timeout(() => monsterImg.classList.remove('monster-tailspin-anim'), 600);
                
                // Spawn a spinning/scaling wind slash emoji centered on the monster
                const slash = document.createElement('div');
                slash.className = 'tailspin-slash-particle';
                slash.textContent = '🌀';
                showcase.appendChild(slash);
                this.animationTimers.timeout(() => slash.remove(), 700);

                // Slight forward tackle impact during tail spin
                monsterImg.style.transition = 'transform 0.2s ease';
                monsterImg.style.transform = `translateY(40px)`;
                
                // Card heavy shake on impact
                this.animationTimers.timeout(() => {
                    if (this.card) {
                        this.card.classList.remove('card-heavy-shake-anim');
                        void this.card.offsetWidth;
                        this.card.classList.add('card-heavy-shake-anim');
                        this.animationTimers.timeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                    }
                }, 200);

                this.animationTimers.timeout(() => {
                    monsterImg.style.transition = 'transform 0.4s ease-in-out';
                    monsterImg.style.transform = '';
                    this.animationTimers.timeout(() => {
                        monsterImg.style.transition = '';
                    }, 400);
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

                // Charge windup and slam
                monsterImg.style.transition = 'transform 0.15s ease-in';
                monsterImg.style.transform = `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1.15)`;
                
                // Card heavy shake on impact
                this.animationTimers.timeout(() => {
                    if (this.card) {
                        this.card.classList.remove('card-heavy-shake-anim');
                        void this.card.offsetWidth;
                        this.card.classList.add('card-heavy-shake-anim');
                        this.animationTimers.timeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                    }
                }, 300);

                this.animationTimers.timeout(() => {
                    monsterImg.style.transition = 'transform 0.1s ease-out';
                    monsterImg.style.transform = `translate(${dx * 0.85}px, ${dy * 0.85}px) scale(1.2)`;
                    
                    this.animationTimers.timeout(() => {
                        monsterImg.style.transition = 'transform 0.4s ease-in-out';
                        monsterImg.style.transform = '';
                        this.animationTimers.timeout(() => {
                            monsterImg.style.transition = '';
                        }, 400);
                    }, 150);
                }, 150);
                return;
            }
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
        } else if (type === 'elemental') {
            targets.forEach(t => {
                const curTargetCard = this.card.querySelector(`#fight-card-${t.index}`);
                if (!curTargetCard) return;

                const cardRect = curTargetCard.getBoundingClientRect();
                const cardCenter = {
                    x: cardRect.left + cardRect.width / 2,
                    y: cardRect.top + cardRect.height / 2
                };

                const startX = monsterCenter.x - containerRect.left;
                const startY = monsterCenter.y - containerRect.top;
                const destX = cardCenter.x - containerRect.left;
                const destY = cardCenter.y - containerRect.top;

                const proj = document.createElement('div');
                proj.className = 'elemental-projectile';
                proj.style.left = `${startX}px`;
                proj.style.top = `${startY}px`;
                proj.textContent = emoji;
                this.card.appendChild(proj);

                void proj.offsetWidth;

                proj.style.transition = 'left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease';

                const isDodge = (t.result === 'dodge');

                if (isDodge) {
                    const extendFactor = 1.5;
                    const passX = startX + (destX - startX) * extendFactor;
                    const passY = startY + (destY - startY) * extendFactor;

                    proj.style.left = `${passX}px`;
                    proj.style.top = `${passY}px`;
                    proj.style.opacity = '0';

                    this.animationTimers.timeout(() => {
                        proj.remove();
                    }, 400);
                } else {
                    proj.style.left = `${destX}px`;
                    proj.style.top = `${destY}px`;

                    this.animationTimers.timeout(() => {
                        proj.remove();

                        const burnEl = document.createElement('div');
                        burnEl.className = 'elemental-burn';
                        burnEl.textContent = emoji;
                        curTargetCard.appendChild(burnEl);

                        this.animationTimers.timeout(() => {
                            burnEl.style.opacity = '0';
                            this.animationTimers.timeout(() => burnEl.remove(), 500);
                        }, 1500);
                    }, 400);
                }
            });
        }
    }


}
