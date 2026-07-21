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

    playPatternMotion(monsterImg, targetCard, pattern, attackName, type) {
        const Catalog = typeof HuntMonsterAnimationCatalog !== 'undefined' ? HuntMonsterAnimationCatalog : null;
        if (!Catalog) return null;
        const profile = Catalog.resolve(pattern || {}, attackName, type);
        const monsterRect = monsterImg.getBoundingClientRect();
        const targetRect = targetCard.getBoundingClientRect();
        const dx = targetRect.left + targetRect.width / 2 - (monsterRect.left + monsterRect.width / 2);
        const dy = targetRect.top + targetRect.height / 2 - (monsterRect.top + monsterRect.height / 2);
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        const maxX = Math.max(150, ((stage?.clientWidth || 720) - monsterRect.width) / 2 + 130);
        monsterImg.style.setProperty('--monster-lane-x', `${maxX}px`);
        monsterImg.style.setProperty('--monster-attack-x', `${Math.max(-maxX, Math.min(maxX, dx * .72))}px`);
        monsterImg.style.setProperty('--monster-attack-y', `${Math.max(-190, Math.min(210, dy * .58))}px`);
        monsterImg.style.setProperty('--monster-motion-duration', `${profile.duration}ms`);
        if (profile.id === 'ground-charge' || profile.id === 'ground-charge-cross' || profile.id === 'ground-charge-zigzag') {
            const cardRect = this.card.getBoundingClientRect();
            const targetIndex = Number(targetCard.id.replace(/\D+/g, '')) || 0;
            const direction = targetIndex < 2 ? -1 : 1;
            monsterImg.style.setProperty('--monster-charge-bottom', `${Math.max(620, cardRect.bottom - monsterRect.top + monsterRect.height)}px`);
            monsterImg.style.setProperty('--monster-charge-top', `${Math.max(420, monsterRect.bottom - cardRect.top + monsterRect.height)}px`);
            monsterImg.style.setProperty('--monster-charge-side', `${direction * Math.max(1150, cardRect.width * .72 + monsterRect.width)}px`);
            monsterImg.style.setProperty('--monster-charge-start-side', `${direction * -Math.max(1050, cardRect.width * .68 + monsterRect.width)}px`);
        }
        monsterImg.classList.remove(...Array.from(monsterImg.classList).filter(name => name.startsWith('monster-motion-')));
        void monsterImg.offsetWidth;
        monsterImg.classList.add(`monster-motion-${profile.id}`);
        this.animationTimers.timeout(() => monsterImg.classList.remove(`monster-motion-${profile.id}`), profile.duration + 80);
        return profile;
    }

    createChargeSpectacle(monsterImg, targets, crossScreen) {
        const stage = monsterImg.closest('.hunt-monster-motion-stage');
        if (!stage) return;
        const track = document.createElement('div');
        track.className = `monster-charge-track${crossScreen ? ' is-cross' : ' is-forward'}`;
        track.innerHTML = Array.from({ length: 9 }, (_, index) => `<i style="--step:${index};--stagger:${index % 2}"></i>`).join('');
        stage.appendChild(track);
        this.card.classList.remove('monster-charge-rumble');
        void this.card.offsetWidth;
        this.card.classList.add('monster-charge-rumble');
        this.animationTimers.timeout(() => {
            targets.forEach(target => {
                if (target.result === 'dodge') return;
                const hitCard = this.card?.querySelector(`#fight-card-${target.index}`);
                if (!hitCard) return;
                hitCard.classList.remove('element-impact-shake');
                void hitCard.offsetWidth;
                hitCard.classList.add('element-impact-shake');
            });
        }, crossScreen ? 760 : 720);
        this.animationTimers.timeout(() => {
            track.remove();
            this.card?.classList.remove('monster-charge-rumble');
            this.card?.querySelectorAll('.element-impact-shake').forEach(card => card.classList.remove('element-impact-shake'));
        }, crossScreen ? 2150 : 2000);
    }

    getElementalTheme(attackName = '') {
        const name = attackName.toLowerCase();
        const themes = [
            { id: 'fire', test: /화염|화룡|화염구|겁염|불꽃|폭염|용암/, emoji: '🔥', color: '#ff5a16', hot: '#fff4a8', shadow: '#9d1200' },
            { id: 'thunder', test: /번개|벼락|뇌격|전격|전뇌|초전도/, emoji: '⚡', color: '#aeefff', hot: '#ffffff', shadow: '#596dff' },
            { id: 'ice', test: /얼음|빙결|빙룡|빙벽|절대영도|냉기/, emoji: '❄️', color: '#6ee9ff', hot: '#ffffff', shadow: '#2681ff' },
            { id: 'water', test: /수류|수압|물|포말|거품|레이저/, emoji: '🌊', color: '#29bfff', hot: '#eaffff', shadow: '#075dcc' },
            { id: 'dragon', test: /광룡|용속성|광기|흑룡|용기/, emoji: '🐉', color: '#d641ff', hot: '#ffb8ff', shadow: '#35005f' },
            { id: 'poison', test: /독|맹독|독조|독액/, emoji: '☠️', color: '#b8ff35', hot: '#f1ffad', shadow: '#4a0570' },
            { id: 'blast', test: /폭발|폭파|점균|대재앙|혜성/, emoji: '💥', color: '#ff7b22', hot: '#ffffff', shadow: '#a40037' },
            { id: 'wind', test: /바람|폭풍|회오리|진공|분사/, emoji: '🌪️', color: '#baffdc', hot: '#ffffff', shadow: '#247f75' }
        ];
        return themes.find(theme => theme.test.test(name)) || {
            id: 'arcane', emoji: '✨', color: '#d966ff', hot: '#ffffff', shadow: '#5322a8'
        };
    }

    getBreathDelivery(attackName = '', pattern = null) {
        const evidence = [attackName, pattern?.id, pattern?.sourceActionClass, ...(pattern?.tags || [])]
            .filter(Boolean).join(' ');
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
        const theme = this.getElementalTheme(attackName);
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

        const beam = document.createElement('div');
        beam.className = 'monster-element-beam';
        beam.innerHTML = '<i class="beam-aura"></i><i class="beam-body"></i><i class="beam-core"></i><i class="beam-ripple"></i>';
        fx.appendChild(beam);

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
        const theme = this.getElementalTheme(attackName);
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
        if (!this.card || !targets || targets.length === 0) return;

        const monsterImg = this.card.querySelector('.hunt-small-monster.is-attacking') || this.card.querySelector('#fight-monster-img');
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
        const isUltimate = pattern?.type === 'ultimate' || pattern?.tags?.includes('ultimate');
        const isValstraxAmbush = pattern?.id === 'valstrax.crimson_comet_ambush'
            || /붉은 혜성 강습/.test(attackName);
        const motionProfile = this.playPatternMotion(monsterImg, targetCard, pattern, attackName, type);
        if (isUltimate && !isValstraxAmbush) {
            const elementalUltimate = pattern?.tags?.includes('elemental') || type === 'elemental';
            this.createUltimateSpectacle(monsterCenter, containerRect, attackName, emoji, pattern, elementalUltimate);
            monsterImg.classList.remove('monster-signature-ultimate');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-signature-ultimate');
            this.animationTimers.timeout(() => monsterImg.classList.remove('monster-signature-ultimate'), 1700);
        }
        if (motionProfile?.id === 'ground-charge' || motionProfile?.id === 'ground-charge-cross' || motionProfile?.id === 'ground-charge-zigzag') {
            this.createChargeSpectacle(monsterImg, targets, motionProfile.id !== 'ground-charge');
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
            targets.forEach((t, order) => {
                const curTargetCard = this.card.querySelector(`#fight-card-${t.index}`);
                if (!curTargetCard) return;
                this.createElementalAttack(monsterCenter, containerRect, curTargetCard, t, attackName, emoji, order, pattern);
            });
        }
    }


}
