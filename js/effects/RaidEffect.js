class RaidEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.isActive = false;
        this.bossHP = 1000;
        this.bossMaxHP = 1000;
        this.bossEmoji = '👾';
        this.bossName = '우주 괴수';
        this.damageLog = {}; // { nickname: totalDamage }
        this.resolveGame = null;
        this.runtime = new GameEffectRuntime(this, director);
    }

    async execute(context) {
        this.runtime.start();
        this.damageLog = {};

        // Randomize boss
        const bosses = [
            { emoji: '👾', name: '외계 괴수 크라켄', hp: 1200 },
            { emoji: '🐉', name: '용암 드래곤 벨코즈', hp: 1500 },
            { emoji: '👹', name: '지옥 귀신 오우거', hp: 1000 },
            { emoji: '🐙', name: '심해 해파리 크툴루', hp: 900 }
        ];
        const selected = bosses[Math.floor(Math.random() * bosses.length)];
        this.bossEmoji = selected.emoji;
        this.bossName = selected.name;
        this.bossHP = selected.hp;
        this.bossMaxHP = selected.hp;

        console.log(`🎮 [BossRaid] Started. Boss: ${this.bossName} (${this.bossHP} HP)`);

        // Play summon sound
        this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['공습경보'] || '공습경보');

        // Create UI container
        const container = document.createElement('div');
        container.className = 'game-raid-container';
        container.innerHTML = `
            <div class="game-boss-showcase">${this.bossEmoji}</div>
            <div class="game-boss-hp-wrapper">
                <div class="game-boss-hp-fill" style="width: 100%;"></div>
                <div class="game-boss-hp-text-label">${this.bossName} HP: ${this.bossHP}/${this.bossMaxHP}</div>
            </div>
            <div class="game-raid-ui-panel">
                <div class="game-title" style="font-size:1.8rem; background: linear-gradient(90deg, #ff3b30, #ff9500); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">⚔️ 채팅 보스 레이드! ⚔️</div>
                <div style="font-size:0.95rem; color:#ccc;">제한 시간 내에 보스를 쓰러트리세요!</div>
                <div class="game-raid-action-hint">
                    <span>1. ⚔️ 물리 공격</span>
                    <span>2. 🔥 마법 공격</span>
                    <span>3. ✨ 신성 공격</span>
                </div>
                <div class="game-timer">남은 시간: 25초</div>
            </div>
        `;
        document.body.appendChild(container);

        this.updateHPUI = () => {
            const pct = (this.bossHP / this.bossMaxHP) * 100;
            const fill = container.querySelector('.game-boss-hp-fill');
            const txt = container.querySelector('.game-boss-hp-text-label');
            if (fill) fill.style.width = `${pct}%`;
            if (txt) txt.textContent = `${this.bossName} HP: ${this.bossHP}/${this.bossMaxHP}`;
        };

        this.shakeBoss = () => {
            const sc = container.querySelector('.game-boss-showcase');
            if (sc) {
                sc.style.animation = 'none';
                void sc.offsetWidth; // trigger reflow
                sc.style.transform = `translate(${(Math.random() - 0.5) * 30}px, ${(Math.random() - 0.5) * 30}px) scale(1.1)`;
                this.runtime.timeout(() => {
                    sc.style.transform = '';
                    sc.style.animation = 'boss-float 3s ease-in-out infinite alternate';
                }, 100);
            }
        };

        let timeLeft = 25;
        const timerEl = container.querySelector('.game-timer');

        return new Promise(resolve => {
            const timerInterval = this.runtime.interval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    this.endRaid(container, false, resolve);
                } else {
                    timerEl.textContent = `남은 시간: ${timeLeft}초`;
                }
            }, 1000);

            this.resolveGame = this.runtime.once((isVictory) => {
                this.runtime.clear(timerInterval);
                this.endRaid(container, isVictory, resolve);
            });
        });
    }

    handleChat(msgData) {
        if (!this.isActive) return false;
        const msg = (msgData.message || "").trim();

        let action = '';
        let dmg = 0;
        let pEmoji = '';

        if (msg === '1' || msg === '!공격' || msg.includes('⚔️') || msg.includes('🗡️') || msg.includes('strike')) {
            action = 'melee';
            dmg = 12 + Math.floor(Math.random() * 15);
            pEmoji = '⚔️';
        } else if (msg === '2' || msg === '!마법' || msg.includes('🔥') || msg.includes('⚡') || msg.includes('magic')) {
            action = 'magic';
            dmg = 18 + Math.floor(Math.random() * 20);
            pEmoji = '🔥';
        } else if (msg === '3' || msg === '!힐' || msg.includes('✨') || msg.includes('💖') || msg.includes('heal')) {
            action = 'holy';
            dmg = 15 + Math.floor(Math.random() * 12);
            pEmoji = '✨';
        }

        if (action) {
            this.bossHP = Math.max(0, this.bossHP - dmg);
            this.damageLog[msgData.nickname] = (this.damageLog[msgData.nickname] || 0) + dmg;

            // Spawn projectile
            this.spawnProjectile(pEmoji, dmg);
            this.shakeBoss();
            this.updateHPUI();

            if (this.bossHP <= 0 && this.resolveGame) {
                this.resolveGame(true);
            }
            return true;
        }
        return false;
    }

    spawnProjectile(emoji, damage) {
        const sc = document.querySelector('.game-boss-showcase');
        if (!sc) return;
        const scRect = sc.getBoundingClientRect();
        const bossX = scRect.left + scRect.width / 2;
        const bossY = scRect.top + scRect.height / 2;

        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 50;

        const proj = document.createElement('div');
        proj.className = 'game-attack-projectile';
        proj.textContent = emoji;
        proj.style.left = `${startX}px`;
        proj.style.top = `${startY}px`;
        document.body.appendChild(proj);

        // Animate projectile to boss center
        this.runtime.timeout(() => {
            proj.style.left = `${bossX - 25}px`;
            proj.style.top = `${bossY - 25}px`;
            proj.style.transform = `scale(0.5) rotate(${Math.random() * 720}deg)`;
        }, 50);

        // When it hits (approx 400ms)
        this.runtime.timeout(() => {
            proj.remove();
            
            // Play hit sound
            this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['발차기'] || '발차기');

            // Spawn damage popup
            const pop = document.createElement('div');
            pop.className = 'game-raid-damage-popup';
            pop.textContent = `-${damage}`;
            pop.style.left = `${bossX + (Math.random() - 0.5) * 60}px`;
            pop.style.top = `${bossY + (Math.random() - 0.5) * 60}px`;
            document.body.appendChild(pop);
            this.runtime.timeout(() => pop.remove(), 800);
        }, 450);
    }

    endRaid(container, isVictory, resolve) {
        if (!this.runtime.end()) return;
        this.resolveGame = null;

        const uiPanel = container.querySelector('.game-raid-ui-panel');
        const sc = container.querySelector('.game-boss-showcase');

        // Find MVP (highest damage)
        let mvpName = '없음';
        let mvpDmg = 0;
        Object.keys(this.damageLog).forEach(nick => {
            if (this.damageLog[nick] > mvpDmg) {
                mvpDmg = this.damageLog[nick];
                mvpName = nick;
            }
        });

        if (isVictory) {
            // Play success sound
            this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['대박'] || '대박');
            if (sc) {
                sc.style.transform = 'scale(0) rotate(720deg)';
                sc.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1)';
            }
            uiPanel.innerHTML = `
                <div class="game-title" style="font-size:3.5rem; color:#00ffa3;">🎉 레이드 성공! 🎉</div>
                <div style="font-size:2.4rem; color:#fff; margin:20px 0;">우주 괴수가 물리쳐졌습니다!</div>
                <div style="font-size:1.8rem; color:#ffb703; font-weight:bold;">
                    🏆 MVP 모험가: ${SafeContent.escapeHTML(mvpName)} (${mvpDmg} DMG)
                </div>
                <div style="font-size:1.4rem; color:#888; margin-top:20px;">참여한 모든 시청자 여러분 수고하셨습니다!</div>
            `;
        } else {
            // Play fail sound
            this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['안돼'] || '안돼');
            if (sc) {
                sc.style.transform = 'translateY(-300px) scale(0)';
                sc.style.transition = 'transform 1.5s ease-in';
            }
            uiPanel.innerHTML = `
                <div class="game-title" style="font-size:3.5rem; color:#ff3b30;">☠️ 레이드 실패 ☠️</div>
                <div style="font-size:2.4rem; color:#fff; margin:20px 0;">시간이 초과되어 보스가 도망쳤습니다...</div>
                <div style="font-size:1.6rem; color:#888;">보스에게 가장 큰 피해를 준 자: ${SafeContent.escapeHTML(mvpName)} (${mvpDmg} DMG)</div>
            `;
        }

        this.runtime.timeout(() => {
            container.style.animation = "game-fade-out 0.5s ease-in forwards";
            this.runtime.timeout(() => {
                container.remove();
                resolve();
            }, 500);
        }, 6000);
    }
}
