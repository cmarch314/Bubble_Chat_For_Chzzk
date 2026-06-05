class HuntEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.isActive = false;
        this.phase = 'idle'; // 'idle', 'voting', 'fighting', 'ended'
        this.bets = {}; // { nickname: { index, color } }
        this.selectedWeapons = []; // 4 selected weapons
        this.selectedMonster = null; // random monster
        this.gameTimer = null;
        this.fightInterval = null;
        this.resolveGame = null;
        this.climaxTimer = null;
        this.climaxTimeLeft = 10;
        this.lobbyBgm = null;
        this.battleBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgmPromise = null;

        this.WEAPONS = [
            { id: 'great_sword', name: '대검', filename: 'great_sword.svg' },
            { id: 'long_sword', name: '태도', filename: 'long_sword.svg' },
            { id: 'sword_shield', name: '한손검', filename: 'sword_shield.svg' },
            { id: 'dual_blades', name: '쌍검', filename: 'dual_blades.svg' },
            { id: 'hammer', name: '해머', filename: 'hammer.svg' },
            { id: 'hunting_horn', name: '수렵피리', filename: 'hunting_horn.svg' },
            { id: 'lance', name: '랜스', filename: 'lance.svg' },
            { id: 'gunlance', name: '건랜스', filename: 'gunlance.svg' },
            { id: 'switch_axe', name: '슬래시액스', filename: 'switch_axe.svg' },
            { id: 'charge_blade', name: '차지액스', filename: 'charge_blade.svg' },
            { id: 'insect_glaive', name: '조충곤', filename: 'insect_glaive.svg' },
            { id: 'light_bowgun', name: '라이트보건', filename: 'light_bowgun.svg' },
            { id: 'heavy_bowgun', name: '헤비보건', filename: 'heavy_bowgun.svg' },
            { id: 'bow', name: '활', filename: 'bow.svg' }
        ];

        this.fallbackMonsters = [
            { id: "rathalos", nameEN: "Rathalos", nameKO: "리오레우스", filename: "rathalos.png" },
            { id: "diablos", nameEN: "Diablos", nameKO: "디아블로스", filename: "diablos.png" },
            { id: "nergigante", nameEN: "Nergigante", nameKO: "네르기간테", filename: "nergigante.png" },
            { id: "zinogre", nameEN: "Zinogre", nameKO: "진오우거", filename: "zinogre.png" },
            { id: "velkhana", nameEN: "Velkhana", nameKO: "벨카나", filename: "velkhana.png" }
        ];
    }

    async execute(context) {
        this.director.activeGame = this;
        this.isActive = true;
        this.phase = 'voting';
        this.bets = {};
        this.climaxTimer = null;

        // Reset audio
        this.stopBgms();

        // Load monsters list
        let monsters = this.fallbackMonsters;
        try {
            const response = await fetch('img/monsters/monsters.json');
            if (response.ok) {
                const list = await response.json();
                if (list && list.length > 0) {
                    monsters = list;
                }
            }
        } catch (e) {
            console.warn("Failed to load monsters.json, using fallback monsters", e);
        }

        // Randomly select monster
        this.selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
        
        // Randomly select 4 weapons
        const shuffledWeapons = [...this.WEAPONS].sort(() => Math.random() - 0.5);
        this.selectedWeapons = shuffledWeapons.slice(0, 4).map((w, index) => ({
            ...w,
            index,
            hp: 100,
            maxHp: 100,
            status: 'alive' // 'alive', 'dead'
        }));

        // Play Lobby BGM
        try {
            // Check if MHW BGM exists, fallback to SportBGM
            this.lobbyBgm = new Audio('BGM/MHW_Lobby.mp3');
            this.lobbyBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.lobbyBgm.volume = volConfig.master * volConfig.visual * 0.45;
            this.lobbyBgmPromise = this.lobbyBgm.play().catch(() => {
                // fallback BGM
                this.lobbyBgm.src = 'BGM/SportBGM.mp3';
                this.lobbyBgmPromise = this.lobbyBgm.play().catch(err => console.warn("Lobby BGM failed to play:", err));
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        // Create Betting UI
        const container = document.createElement('div');
        container.className = 'game-overlay-container';
        container.innerHTML = `
            <div class="game-hunt-card">
                <div class="game-title" style="font-size:2.8rem; background: linear-gradient(90deg, #ffaa00, #ff5500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight:bold; margin-bottom:10px;">
                    ⚔️ 몬스터 수렵 투표! ⚔️
                </div>
                <div class="game-subtitle" style="font-size:1.3rem; color:#ccc; margin-bottom: 25px;">
                    이번 수렵에서 성공할 무기 번호(1~4)를 채팅창에 입력하세요!
                </div>

                <div class="game-hunt-monster-showcase">
                    <div style="font-size: 1.1rem; color: #ffaa00; font-weight: bold; margin-bottom: 5px;">🎯 타겟 몬스터</div>
                    <img class="game-hunt-monster-img" src="img/monsters/${this.selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" />
                    <div class="game-hunt-monster-name">${this.selectedMonster.nameKO}</div>
                </div>

                <div class="game-hunt-weapons-grid">
                    ${this.selectedWeapons.map(w => `
                    <div class="game-hunt-weapon-card" id="hunt-opt-${w.index}">
                        <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" />
                        <div class="game-hunt-weapon-name">${w.index + 1}. ${w.name}</div>
                        <div style="font-size:0.95rem; color:#ffaa00; font-weight:bold; background:rgba(255,170,0,0.1); border-radius:6px; padding:3px 0; margin-bottom: 8px;">채팅: ${w.index + 1}</div>
                        <div class="bet-count" style="font-size:1.05rem; color:#aaa; font-weight:bold;">0명 투표</div>
                    </div>`).join('')}
                </div>

                <div class="game-timer" style="font-size:1.8rem; font-weight:bold; color:#ff5500; margin-top:20px;">남은 투표 시간: 30초</div>
            </div>
        `;
        document.body.appendChild(container);

        this.updateBettingUI = () => {
            const counts = [0, 0, 0, 0];
            Object.values(this.bets).forEach(bet => {
                counts[bet.index]++;
            });
            for (let i = 0; i < 4; i++) {
                const opt = container.querySelector(`#hunt-opt-${i}`);
                if (opt) {
                    opt.querySelector('.bet-count').textContent = `${counts[i]}명 투표`;
                    if (counts[i] > 0) opt.classList.add('active');
                }
            }
        };

        let timeLeft = 30;
        const timerEl = container.querySelector('.game-timer');

        return new Promise(resolve => {
            this.resolveGame = resolve;
            
            this.gameTimer = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(this.gameTimer);
                    this.gameTimer = null;
                    this.startFight(container);
                } else {
                    timerEl.textContent = `남은 투표 시간: ${timeLeft}초`;
                }
            }, 1000);
        });
    }

    handleChat(msgData) {
        if (!this.isActive) return false;
        const msg = (msgData.message || "").trim();

        // Streamer stop command
        if (msgData.isStreamer && (msg === '!토벌 중단' || msg === '!중단')) {
            this.forceStopGame();
            return true;
        }

        if (this.phase === 'voting') {
            let index = -1;
            if (msg === '1' || msg === '!1') index = 0;
            else if (msg === '2' || msg === '!2') index = 1;
            else if (msg === '3' || msg === '!3') index = 2;
            else if (msg === '4' || msg === '!4') index = 3;

            if (index !== -1) {
                this.bets[msgData.nickname] = { index, color: msgData.color || '#ffffff' };
                if (this.updateBettingUI) this.updateBettingUI();
                return true;
            }
        }
        return false;
    }

    startFight(container) {
        this.phase = 'fighting';
        this.stopBgms();

        // Play Battle BGM
        try {
            this.battleBgm = new Audio('BGM/MHW_Proof_of_a_Hero.mp3');
            this.battleBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.battleBgm.volume = volConfig.master * volConfig.visual * 0.45;
            this.battleBgmPromise = this.battleBgm.play().catch(() => {
                this.battleBgm.src = 'BGM/William Tell.mp3';
                this.battleBgmPromise = this.battleBgm.play().catch(err => console.warn("Battle BGM failed to play:", err));
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        // Play start SFX
        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가자!'] || '가자!');

        // Update UI to fight dashboard
        const card = container.querySelector('.game-hunt-card');
        card.innerHTML = `
            <div class="game-title" style="font-size:2.4rem; color:#ffaa00; font-weight:bold; margin-bottom:10px;">
                🍖 수렵 개시! (타겟: ${this.selectedMonster.nameKO}) 🍖
            </div>
            
            <div class="game-hunt-monster-showcase" id="monster-showcase-panel">
                <img class="game-hunt-monster-img" id="fight-monster-img" src="img/monsters/${this.selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" />
                <div class="game-hunt-monster-name" id="fight-monster-title">${this.selectedMonster.nameKO}</div>
                <div class="game-timer" id="climax-timer-label" style="font-size: 1.4rem; color: #ffaa00; margin-top: 5px;">🔥 대난투 진행 중...</div>
            </div>

            <div class="game-hunt-weapons-grid">
                ${this.selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card" id="fight-card-${w.index}">
                    <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" />
                    <div class="game-hunt-weapon-name">${w.name}</div>
                    <div class="game-hunt-hp-wrapper">
                        <div class="game-hunt-hp-fill" id="hp-fill-${w.index}" style="width: 100%;"></div>
                        <div class="game-hunt-hp-text" id="hp-text-${w.index}">100 / 100</div>
                    </div>
                    <div class="game-hunt-status-tag active" id="status-tag-${w.index}">전투 중</div>
                </div>`).join('')}
            </div>

            <div class="game-hunt-log-panel" id="hunt-log-panel">
                <div class="game-hunt-log-line" style="color: #00ffaa;">수렵이 시작되었습니다! 몬스터를 격퇴하십시오!</div>
            </div>
        `;

        const logPanel = card.querySelector('#hunt-log-panel');
        const addLog = (text, color = '#eee') => {
            const line = document.createElement('div');
            line.className = 'game-hunt-log-line';
            line.style.color = color;
            line.textContent = text;
            logPanel.appendChild(line);
            if (logPanel.children.length > 4) {
                logPanel.removeChild(logPanel.firstChild);
            }
        };

        // Shake monster showcase on hit
        const shakeMonster = () => {
            const showcase = card.querySelector('#monster-showcase-panel');
            if (showcase) {
                showcase.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
                setTimeout(() => showcase.style.transform = '', 100);
            }
        };

        // Weapon hit animation
        const shakeWeapon = (idx) => {
            const weaponCard = card.querySelector(`#fight-card-${idx}`);
            if (weaponCard) {
                weaponCard.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px) scale(0.95)`;
                weaponCard.style.borderColor = '#ff3b30';
                setTimeout(() => {
                    weaponCard.style.transform = '';
                    weaponCard.style.borderColor = '';
                }, 150);
            }
        };

        // Action simulation tick
        const monsterAttacks = [
            "포효를 내지르며 덮쳤습니다", "꼬리 휘두르기를 시전했습니다", "돌진 공격을 가했습니다", 
            "브레스를 뿜어 휩쓸었습니다", "공중에서 강습 타격을 날렸습니다", "강력한 몸통 박치기를 시전했습니다"
        ];
        const weaponHeals = [
            "비약을 마셨습니다", "그레이트 회복약을 꿀꺽 마셨습니다", "생명의 가루를 뿌려 회복했습니다"
        ];
        const statusAilments = [
            "포효에 기절했습니다", "독 기운에 취해 비틀거립니다", "빙결 상태가 되어 속도가 느려집니다"
        ];

        this.climaxPhaseStarted = false;

        this.fightInterval = setInterval(() => {
            if (this.climaxPhaseStarted) return; // Climax timer handles the climax

            const aliveWeapons = this.selectedWeapons.filter(w => w.status === 'alive');
            if (aliveWeapons.length === 0) {
                this.endGame(container, false);
                return;
            }

            // Climax Phase transition trigger
            if (aliveWeapons.length === 1 && !this.climaxPhaseStarted) {
                this.climaxPhaseStarted = true;
                this.startClimax(container, aliveWeapons[0], addLog);
                return;
            }

            // Simulation event probability
            const target = aliveWeapons[Math.floor(Math.random() * aliveWeapons.length)];
            const eventType = Math.random();

            if (eventType < 0.55) {
                // Monster Attacks
                const damage = 18 + Math.floor(Math.random() * 20);
                target.hp = Math.max(0, target.hp - damage);
                
                const attackDesc = monsterAttacks[Math.floor(Math.random() * monsterAttacks.length)];
                addLog(`💥 [피해] ${this.selectedMonster.nameKO}이(가) ${target.name}에게 ${attackDesc}! (-${damage} HP)`, '#ff5555');
                
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['꺄악'] || '꺄악');
                shakeMonster();
                shakeWeapon(target.index);
                this.updateHpUI(card, target);

                if (target.hp <= 0) {
                    target.status = 'dead';
                    this.triggerCartAnimation(target);
                    addLog(`🚨 [수레] ${target.name}의 체력이 다해 수레에 실려갑니다!`, '#ff0055');
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['안돼'] || '안돼');
                }
            } else if (eventType < 0.82) {
                // Weapon Heals (only if damaged)
                if (target.hp < target.maxHp) {
                    const heal = 15 + Math.floor(Math.random() * 15);
                    target.hp = Math.min(target.maxHp, target.hp + heal);
                    const healDesc = weaponHeals[Math.floor(Math.random() * weaponHeals.length)];
                    addLog(`💚 [회복] ${target.name}이(가) ${healDesc}! (+${heal} HP)`, '#2eff7b');
                    
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['대박'] || '대박');
                    this.updateHpUI(card, target);
                } else {
                    // Counterattack
                    addLog(`⚔️ [반격] ${target.name}이(가) 몬스터의 약점을 노려 강력한 반격을 가했습니다!`, '#ffaa00');
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['발차기'] || '발차기');
                    shakeMonster();
                }
            } else {
                // Status Ailment
                const ailmentDesc = statusAilments[Math.floor(Math.random() * statusAilments.length)];
                addLog(`🌀 [상태이상] ${target.name}이(가) ${ailmentDesc}!`, '#e58e26');
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['쇼크'] || '쇼크');
                shakeWeapon(target.index);
            }

        }, 1000);
    }

    startClimax(container, survivor, addLog) {
        clearInterval(this.fightInterval);
        this.fightInterval = null;

        const card = container.querySelector('.game-hunt-card');
        const timerLabel = card.querySelector('#climax-timer-label');
        const monsterTitle = card.querySelector('#fight-monster-title');

        monsterTitle.textContent = `🚨 분노한 ${this.selectedMonster.nameKO} 🚨`;
        monsterTitle.style.color = '#ff3b30';
        timerLabel.textContent = `🔥 최후의 결전! 10초 버티기!`;
        timerLabel.style.color = '#ff3b30';

        addLog(`📢 최후의 생존자 ${survivor.name}! 몬스터가 폭주하기 시작했습니다! 10초간 버티십시오!`, '#ffaa00');
        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['공습경보'] || '공습경보');

        this.climaxTimeLeft = 10;
        
        this.climaxTimer = setInterval(() => {
            this.climaxTimeLeft--;
            
            if (survivor.status === 'dead' || survivor.hp <= 0) {
                clearInterval(this.climaxTimer);
                this.climaxTimer = null;
                this.endGame(container, false);
                return;
            }

            if (this.climaxTimeLeft <= 0) {
                clearInterval(this.climaxTimer);
                this.climaxTimer = null;
                this.endGame(container, true, survivor);
                return;
            }

            timerLabel.textContent = `🔥 최후의 결전! ${this.climaxTimeLeft}초 버티기!`;

            // Climax damage tick
            const dmg = 8 + Math.floor(Math.random() * 12);
            survivor.hp = Math.max(0, survivor.hp - dmg);
            
            addLog(`💥 [폭주 공격] ${this.selectedMonster.nameKO}의 난동! ${survivor.name}이(가) 버티며 피해를 입습니다! (-${dmg} HP)`, '#ff3b30');
            this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['꺄악'] || '꺄악');
            
            this.updateHpUI(card, survivor);
            this.shakeClimaxMonster(card);
            
            const weaponCard = card.querySelector(`#fight-card-${survivor.index}`);
            if (weaponCard) {
                weaponCard.style.transform = `scale(1.05) translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
                setTimeout(() => weaponCard.style.transform = 'scale(1.05)', 100);
            }

            if (survivor.hp <= 0) {
                survivor.status = 'dead';
                this.triggerCartAnimation(survivor);
                addLog(`🚨 [수레] ${survivor.name}이(가) 끝내 쓰러졌습니다!`, '#ff0055');
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['안돼'] || '안돼');
            }

        }, 1000);
    }

    shakeClimaxMonster(card) {
        const showcase = card.querySelector('#monster-showcase-panel');
        if (showcase) {
            showcase.style.transform = `scale(1.1) translate(${(Math.random() - 0.5) * 35}px, ${(Math.random() - 0.5) * 35}px)`;
            setTimeout(() => showcase.style.transform = 'scale(1.1)', 100);
        }
    }

    updateHpUI(card, weapon) {
        const fill = card.querySelector(`#hp-fill-${weapon.index}`);
        const text = card.querySelector(`#hp-text-${weapon.index}`);
        const tag = card.querySelector(`#status-tag-${weapon.index}`);
        const wcard = card.querySelector(`#fight-card-${weapon.index}`);

        if (fill) fill.style.width = `${weapon.hp}%`;
        if (text) text.textContent = `${weapon.hp} / ${weapon.maxHp}`;
        
        if (weapon.hp <= 0) {
            if (tag) {
                tag.textContent = '수레행';
                tag.className = 'game-hunt-status-tag fainted';
            }
            if (wcard) {
                wcard.classList.add('dead');
            }
        }
    }

    triggerCartAnimation(weapon) {
        const container = document.createElement('div');
        container.className = 'game-hunt-cart-container';
        container.innerHTML = `
            <div class="game-hunt-cart-sprite">
                <div class="game-hunt-cart-fainter">
                    <img src="img/weapons/${weapon.filename}" style="width: 55px; height: 55px; filter: grayscale(0.5);" />
                </div>
                <div style="font-size: 3.5rem; margin-top: -10px;">🛒</div>
                <div style="font-size: 0.95rem; font-weight: bold; background: rgba(0,0,0,0.85); color: #ff3b30; border: 1px solid #ff3b30; padding: 2px 8px; border-radius: 6px; margin-top: 5px; white-space: nowrap;">
                    ${weapon.name} 수레행
                </div>
            </div>
        `;
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 4000);
    }

    endGame(container, isVictory, winner = null) {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;

        if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
        if (this.fightInterval) { clearInterval(this.fightInterval); this.fightInterval = null; }
        if (this.climaxTimer) { clearInterval(this.climaxTimer); this.climaxTimer = null; }

        this.stopBgms();

        // Play End BGM/SFX
        if (isVictory) {
            try {
                const winBgm = new Audio('BGM/MHW_Quest_Clear.mp3');
                const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
                winBgm.volume = volConfig.master * volConfig.visual * 0.45;
                winBgm.play().catch(() => {
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['우승!'] || '우승!');
                });
            } catch (e) {
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['우승!'] || '우승!');
            }
        } else {
            this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['안돼'] || '안돼');
        }

        // Determine winners
        const winningBets = [];
        if (winner) {
            Object.keys(this.bets).forEach(nickname => {
                const bet = this.bets[nickname];
                if (bet.index === winner.index) {
                    winningBets.push(nickname);
                }
            });
        }

        const card = container.querySelector('.game-hunt-card');
        
        if (isVictory && winner) {
            card.innerHTML = `
                <div class="game-title" style="font-size:3.5rem; color:#00ffa3; font-weight:bold; text-shadow:0 0 20px rgba(0,255,163,0.5); margin-bottom:20px;">
                    🎉 퀘스트 클리어! 수렵 성공! 🎉
                </div>
                <div style="font-size:2.2rem; color:#fff; margin-bottom: 25px;">
                    마지막까지 생존한 <span style="color:#ffaa00; font-weight:bold;">${winner.name}</span>이(가) ${this.selectedMonster.nameKO} 수렵에 성공했습니다!
                </div>
                
                <div style="background:rgba(255,170,0,0.06); border: 2px dashed #ffaa00; border-radius: 20px; padding: 25px; margin: 20px auto; width: 85%;">
                    <div style="font-size:1.6rem; color:#ffaa00; font-weight:bold; margin-bottom: 12px;">🏆 승리 투표 시청자 (${winningBets.length}명)</div>
                    <div style="font-size:1.3rem; color:#eee; max-height: 120px; overflow-y: auto; line-height: 1.5;">
                        ${winningBets.length > 0 ? winningBets.join(', ') : '맞춘 사람이 없습니다!'}
                    </div>
                </div>
            `;
        } else {
            card.innerHTML = `
                <div class="game-title" style="font-size:3.5rem; color:#ff3b30; font-weight:bold; text-shadow:0 0 20px rgba(255,59,48,0.5); margin-bottom:20px;">
                    ☠️ 퀘스트 실패 (3수레 전멸) ☠️
                </div>
                <div style="font-size:2.2rem; color:#fff; margin-bottom:20px;">
                    모든 무기가 수레를 타며 토벌에 실패하였습니다...
                </div>
                <div style="font-size:1.5rem; color:#aaa;">${this.selectedMonster.nameKO}은(는) 상처투성이가 되어 유유히 떠났습니다.</div>
            `;
        }

        // Remove container after 8 seconds
        setTimeout(() => {
            container.style.animation = "game-fade-out 0.5s ease-in forwards";
            setTimeout(() => {
                container.remove();
                if (this.resolveGame) {
                    this.resolveGame();
                    this.resolveGame = null;
                }
            }, 500);
        }, 8000);
    }

    forceStopGame() {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;

        if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
        if (this.fightInterval) { clearInterval(this.fightInterval); this.fightInterval = null; }
        if (this.climaxTimer) { clearInterval(this.climaxTimer); this.climaxTimer = null; }

        this.stopBgms();

        const container = document.querySelector('.game-overlay-container');
        if (container) {
            container.remove();
        }
        if (this.resolveGame) {
            this.resolveGame();
            this.resolveGame = null;
        }
    }

    stopBgms() {
        const stop = (bgm, promise) => {
            if (bgm) {
                const action = () => {
                    try {
                        bgm.pause();
                        bgm.volume = 0;
                        bgm.muted = true;
                        bgm.src = '';
                        bgm.load();
                    } catch(e){}
                };
                if (promise) {
                    promise.then(action).catch(action);
                } else {
                    action();
                }
            }
        };
        stop(this.lobbyBgm, this.lobbyBgmPromise);
        stop(this.battleBgm, this.battleBgmPromise);
        this.lobbyBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgm = null;
        this.battleBgmPromise = null;
    }
}
