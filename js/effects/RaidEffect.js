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
        this._injectStyles();
    }

    _injectStyles() {
        if (document.getElementById('game-raid-styles')) return;
        const style = document.createElement('style');
        style.id = 'game-raid-styles';
        style.innerHTML = `
            .game-raid-container {
                position: fixed;
                top: 4vh;
                left: 50%;
                transform: translateX(-50%);
                z-index: 2147483642;
                display: flex;
                flex-direction: column;
                align-items: center;
                pointer-events: none;
                font-family: 'CookieRun-Regular', sans-serif;
                color: #fff;
                width: 1100px;
            }
            .game-boss-showcase {
                font-size: 13rem;
                margin-bottom: 25px;
                transition: transform 0.1s ease;
                filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.7));
                display: inline-block;
                animation: boss-float 3s ease-in-out infinite alternate;
            }
            @keyframes boss-float {
                0% { transform: translateY(0); }
                100% { transform: translateY(-20px); }
            }
            .game-boss-hp-wrapper {
                width: 80%;
                height: 45px;
                background: rgba(0, 0, 0, 0.7);
                border: 4px solid #ff3b30;
                box-shadow: 0 0 25px rgba(255, 59, 48, 0.5);
                border-radius: 22px;
                overflow: hidden;
                position: relative;
                margin-bottom: 25px;
            }
            .game-boss-hp-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff3b30, #ff9500);
                width: 100%;
                transition: width 0.15s ease-out;
            }
            .game-boss-hp-text-label {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1.5rem;
                font-weight: 900;
                color: #fff;
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.95);
            }
            .game-raid-ui-panel {
                background: rgba(20, 10, 42, 0.9);
                border: 4px solid #ff3b30;
                border-radius: 24px;
                padding: 25px 45px;
                width: 100%;
                text-align: center;
                box-shadow: 0 0 35px rgba(255, 59, 48, 0.4);
                pointer-events: auto;
                animation: game-slide-up 0.5s ease-out forwards;
            }
            .game-raid-ui-panel .game-title {
                font-size: 3.5rem !important;
                margin-bottom: 12px;
            }
            .game-raid-ui-panel .game-subtitle {
                font-size: 1.8rem !important;
                margin-bottom: 20px;
            }
            .game-raid-ui-panel .game-status {
                font-size: 2.5rem !important;
                margin: 20px 0;
            }
            .game-raid-ui-panel .game-timer {
                font-size: 2.4rem !important;
                margin-top: 20px;
            }
            .game-raid-ui-panel .game-participants-count {
                font-size: 1.5rem !important;
                margin-top: 15px;
            }
            .game-raid-action-hint {
                display: flex;
                justify-content: space-around;
                margin-top: 15px;
                font-size: 1.4rem;
                color: #ccc;
            }
            .game-raid-action-hint span {
                background: rgba(255, 255, 255, 0.05);
                padding: 6px 15px;
                border-radius: 12px;
                border: 1.5px solid rgba(255, 255, 255, 0.15);
            }
            .game-attack-projectile {
                position: absolute;
                font-size: 5rem;
                z-index: 2147483643;
                pointer-events: none;
                transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), left 0.4s linear, top 0.4s cubic-bezier(0.1, 0.8, 0.3, 1);
            }
            .game-raid-damage-popup {
                position: absolute;
                font-size: 5.5rem;
                font-weight: 900;
                color: #ff9500;
                text-shadow: 0 0 5px #000, 0 0 20px #ff3b30;
                z-index: 2147483644;
                pointer-events: none;
                animation: damage-popup-anim 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes damage-popup-anim {
                0% { transform: translate(-50%, 0) scale(0.6); opacity: 1; }
                50% { transform: translate(-50%, -50px) scale(1.3); opacity: 1; }
                100% { transform: translate(-50%, -90px) scale(1.0); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    async execute(context) {
        this.director.activeGame = this;
        this.isActive = true;
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
                setTimeout(() => {
                    sc.style.transform = '';
                    sc.style.animation = 'boss-float 3s ease-in-out infinite alternate';
                }, 100);
            }
        };

        let timeLeft = 25;
        const timerEl = container.querySelector('.game-timer');

        return new Promise(resolve => {
            const timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    this.endRaid(container, false, resolve);
                } else {
                    timerEl.textContent = `남은 시간: ${timeLeft}초`;
                }
            }, 1000);

            this.resolveGame = (isVictory) => {
                clearInterval(timerInterval);
                this.endRaid(container, isVictory, resolve);
            };
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
        setTimeout(() => {
            proj.style.left = `${bossX - 25}px`;
            proj.style.top = `${bossY - 25}px`;
            proj.style.transform = `scale(0.5) rotate(${Math.random() * 720}deg)`;
        }, 50);

        // When it hits (approx 400ms)
        setTimeout(() => {
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
            setTimeout(() => pop.remove(), 800);
        }, 450);
    }

    endRaid(container, isVictory, resolve) {
        this.isActive = false;
        this.director.activeGame = null;

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
                    🏆 MVP 모험가: ${mvpName} (${mvpDmg} DMG)
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
                <div style="font-size:1.6rem; color:#888;">보스에게 가장 큰 피해를 준 자: ${mvpName} (${mvpDmg} DMG)</div>
            `;
        }

        setTimeout(() => {
            container.style.animation = "game-fade-out 0.5s ease-in forwards";
            setTimeout(() => {
                container.remove();
                resolve();
            }, 500);
        }, 6000);
    }
}
