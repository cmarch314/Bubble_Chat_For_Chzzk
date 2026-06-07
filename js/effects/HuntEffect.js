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

        // Configuration
        this.SHOW_MONSTER_HP = true;

        this.renderer = new HuntRenderer();
        this.audioManager = new HuntAudioManager(director, this.config);
        this.initializer = new HuntInitializer();
        this.engine = null;
    }

    async execute(context) {
        if (this.isActive) {
            console.warn("Monster hunt game is already active. Ignoring double trigger.");
            return;
        }
        this.director.activeGame = this;
        this.isActive = true;
        this.phase = 'voting';
        this.bets = {};

        // Reset audio
        this.audioManager.stopBgms();

        // Play supply box opening SFX
        this.audioManager.playMHAudioFile('Unified_SFX/MH - Open Chest.mp3');

        // Load monsters list
        let monsters = this.initializer.fallbackMonsters;
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

        const msgText = context ? context.message : "";
        const parsed = this.initializer.parseCommand(msgText, monsters);

        this.consecutiveTotal = parsed.consecutiveTotal;
        this.currentConsecutiveIndex = 0;
        this.consecutiveQueue = parsed.consecutiveQueue;
        this.selectedMonster = parsed.selectedMonster;

        this.selectedWeapons = this.initializer.buildSelectedWeapons(parsed.chosenWeaponIds);

        // Play Lobby BGM
        try {
            const lobbyBgms = [
                'BGM/MHW_Lobby.mp3',
                'BGM/MH_Kokoto.mp3',
                'BGM/MH_Pokke.mp3',
                'BGM/MH_Yukumo.mp3',
                'BGM/MH_Bherna.mp3',
                'BGM/MH_ValHabar.mp3',
                'BGM/MHWI_Seliana.mp3',
                'BGM/MHR_Kamura.mp3',
                'BGM/MHRS_Elgado.mp3'
            ];
            const selectedLobby = lobbyBgms[Math.floor(Math.random() * lobbyBgms.length)];
            this.audioManager.lobbyBgm = new Audio(selectedLobby);
            this.audioManager.lobbyBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.audioManager.lobbyBgm.volume = volConfig.master * volConfig.visual * 0.315;
            this.audioManager.lobbyBgmPromise = this.audioManager.lobbyBgm.play().catch(() => {
                this.audioManager.lobbyBgm.src = 'BGM/SportBGM.mp3';
                this.audioManager.lobbyBgmPromise = this.audioManager.lobbyBgm.play().catch(err => console.warn("Lobby BGM failed to play:", err));
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        let voteTitle = "⚔️ 몬스터 수렵 모집! ⚔️";
        let voteSubtitle = "함께 수렵할 헌터 번호(1~4)를 채팅창에 치세요!";
        if (this.consecutiveTotal > 1) {
            voteTitle = `⚔️ 연속 수렵 모집! (1/${this.consecutiveTotal}) ⚔️`;
            voteSubtitle = `${this.consecutiveTotal}마리 연속 수렵! 함께 참가할 번호(1~4)를 채팅창에 치세요!`;
        }

        this.renderer.renderLobby({
            voteTitle,
            voteSubtitle,
            consecutiveTotal: this.consecutiveTotal,
            currentConsecutiveIndex: this.currentConsecutiveIndex,
            consecutiveQueue: this.consecutiveQueue,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons
        });

        let timeLeft = 30;
        return new Promise(resolve => {
            this.resolveGame = resolve;
            
            this.gameTimer = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(this.gameTimer);
                    this.gameTimer = null;
                    this.startFight(this.renderer.container);
                } else {
                    this.renderer.updateBettingTimer(timeLeft);
                }
            }, 1000);
        });
    }

    handleChat(msgData) {
        if (!this.isActive) return false;
        const msg = (msgData.message || "").trim();

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
                this.renderer.updateBettingUI(this.bets);
                return true;
            }
        }
        return false;
    }

    startFight(container) {
        this.phase = 'fighting';
        this.audioManager.stopBgms();
        this.renderer.setContainer(container);

        this.selectedWeapons.forEach(w => {
            const voters = Object.entries(this.bets)
                .filter(([nick, bet]) => bet.index === w.index)
                .map(([nick, bet]) => ({ nickname: nick, color: bet.color }));

            if (voters.length > 0) {
                const chosen = voters[Math.floor(Math.random() * voters.length)];
                w.hunterName = chosen.nickname;
                w.hunterColor = chosen.color;
            } else {
                w.hunterName = `HUNTER ${w.index + 1}`;
                w.hunterColor = "#cccccc";
            }
        });

        const bgmSrc = this.audioManager.getMonsterBgm(this.selectedMonster.nameKO);
        try {
            this.audioManager.battleBgm = new Audio(bgmSrc);
            this.audioManager.battleBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.audioManager.battleBgm.volume = volConfig.master * volConfig.visual * 0.315;
            this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(() => {
                this.audioManager.battleBgm.src = 'BGM/MHGU_Arena.mp3';
                this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(err => {
                    this.audioManager.battleBgm.src = 'BGM/MHW_Proof_of_a_Hero.mp3';
                    this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
                });
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가기'] || '가기');
        this.audioManager.playMHAudioFile('Unified_SFX/MH - Hunters Depart (MH3U).mp3');

        this.monsterTier = this.initializer.getMonsterTier(this.selectedMonster);
        let baseHp = 12000;
        let baseStunThreshold = 300;
        this.monsterDamageMod = 0.9;
        this.monsterAtbSpeedMod = 1.15;
        this.tierLabel = "대형 몬스터";

        if (this.monsterTier === 'small') {
            baseHp = 3000;
            baseStunThreshold = 100;
            this.monsterDamageMod = 0.3;
            this.monsterAtbSpeedMod = 0.7;
            this.tierLabel = "소형 몬스터";
        } else if (this.monsterTier === 'medium') {
            baseHp = 6000;
            baseStunThreshold = 200;
            this.monsterDamageMod = 0.65;
            this.monsterAtbSpeedMod = 0.95;
            this.tierLabel = "중형 몬스터";
        } else if (this.monsterTier === 'elder') {
            baseHp = 24000;
            baseStunThreshold = 500;
            this.monsterDamageMod = 1.15;
            this.monsterAtbSpeedMod = 1.45;
            this.tierLabel = "고룡종";
        }

        this.cartCount = 0;

        const hpLabelText = this.consecutiveTotal > 1 
            ? `👾 [연속 수렵 ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`
            : `👾 [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`;

        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP
        });

        // Initialize pure Simulation Engine
        this.engine = new HuntEngine({
            selectedWeapons: this.selectedWeapons,
            selectedMonster: this.selectedMonster,
            bets: this.bets,
            consecutiveTotal: this.consecutiveTotal,
            currentConsecutiveIndex: this.currentConsecutiveIndex,
            consecutiveQueue: this.consecutiveQueue,
            monsterTier: this.monsterTier,
            monsterHp: baseHp,
            monsterMaxHp: baseHp,
            monsterSpeed: 2.2 * this.monsterAtbSpeedMod,
            monsterState: 'normal',
            monsterDamageMod: this.monsterDamageMod,
            monsterAtbSpeedMod: this.monsterAtbSpeedMod,
            tierLabel: this.tierLabel,
            MONSTER_ATTACKS: this.initializer.MONSTER_ATTACKS,
            COMBO_LIST: this.initializer.COMBO_LIST,
            SHOW_MONSTER_HP: this.SHOW_MONSTER_HP,
            callbacks: {
                onLog: (text, color) => this.addCombatLog(text, color),
                onPlaySFX: (fileName, fallbackKey) => this.audioManager.playMHAsset(fileName, fallbackKey),
                onPlayAudioFile: (subPath, durationLimitMs, volumeMultiplier) => this.audioManager.playMHAudioFile(subPath, durationLimitMs, volumeMultiplier),
                onShakeWeapon: (idx, borderClr, isAttack, moveName) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.shakeWeapon(idx, w, borderClr, isAttack, moveName);
                },
                onShakeMonster: () => this.renderer.shakeMonster(),
                onRestoreBorder: (idx) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.restoreBorder(idx, w);
                },
                onUpdateHpUI: (w) => this.renderer.updateHpUI(w),
                onUpdateMonsterHpUI: (hp, maxHp) => this.renderer.updateMonsterHpUI(hp, maxHp),
                onUpdateWeaponAtbUI: (idx, atb) => this.renderer.updateWeaponAtbUI(idx, atb),
                onUpdateMonsterAtbUI: (atb) => this.renderer.updateMonsterAtbUI(atb),
                onUpdateMonsterStateUI: (stateName, title, colorInfo) => this.renderer.updateMonsterStateUI(stateName, title, colorInfo),
                onUpdatePotionCountUI: (idx, count) => this.renderer.updatePotionCountUI(idx, count),
                onUpdateOverheatUI: (idx, duration) => this.renderer.updateOverheatUI(idx, duration),
                onUpdatePhialsUI: (idx, phials) => this.renderer.updatePhialsUI(idx, phials),
                onUpdateExtractsUI: (idx, buffs) => this.renderer.updateExtractsUI(idx, buffs),
                onUpdateCartUI: (carts) => {
                    this.cartCount = carts;
                    this.renderer.updateCartUI(carts);
                },
                onUpdateTimerUI: (timeSec) => this.renderer.updateTimerUI(timeSec),
                onShowSkillBubble: (idxOrMonster, text) => this.renderer.showSkillBubble(idxOrMonster, text),
                onTriggerMonsterRoar: (monster) => {
                    this.renderer.triggerMonsterRoar();
                    this.audioManager.playMonsterRoar(monster);
                },
                onTriggerMonsterCharge: () => this.renderer.triggerMonsterCharge(),
                onTriggerMonsterAttack: (type, emoji, targets) => {
                    this.renderer.triggerMonsterAttack(type, emoji, targets);
                },
                onTriggerGuardShake: (idx) => {
                    if (this.renderer.card) {
                        const weaponCard = this.renderer.card.querySelector(`#fight-card-${idx}`);
                        if (weaponCard) {
                            weaponCard.classList.remove('guard-shake-anim');
                            void weaponCard.offsetWidth;
                            weaponCard.classList.add('guard-shake-anim');
                            setTimeout(() => weaponCard.classList.remove('guard-shake-anim'), 300);
                        }
                    }
                },
                onTriggerRollAnimation: (idx) => this.renderer.triggerRollAnimation(idx),
                onTriggerHitAnimation: (idx, damage) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.triggerHitAnimation(idx, w, damage);
                },
                onTriggerDeathTag: (idx) => {
                    this.renderer.triggerDeathTag(idx, 5);
                    const w = this.selectedWeapons[idx];
                    this.triggerCartAnimation(w);
                },
                onTriggerStunUI: (idx, isStunned) => this.renderer.triggerStunUI(idx, isStunned),
                onTriggerRoarStun: (idx, isStunned) => this.renderer.triggerRoarStun(idx, isStunned),
                onTriggerMonsterKnockdownAnim: () => this.renderer.triggerMonsterKnockdownAnim(),
                onGameEnd: (victory, winner) => this.endGame(container, victory, winner),
                onNextConsecutive: () => this.spawnNextConsecutiveMonster(container)
            }
        });

        // Set initial UI states
        this.renderer.updateCartUI(0);
        this.renderer.updateTimerUI(0);

        // Tick loop (Process through HuntEngine)
        this.fightInterval = setInterval(() => {
            if (this.phase !== 'fighting') return;
            this.engine.processTick();
        }, 100);
    }

    addCombatLog(text, color) {
        this.director.eventBus.emit('chat:render', {
            nickname: '시스템',
            message: text,
            color: color || '#ffaa00',
            isSystem: true
        });
        console.log(`[HUNT] ${text}`);
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

    spawnNextConsecutiveMonster(container) {
        const prevName = this.selectedMonster.nameKO;
        this.currentConsecutiveIndex++;
        this.selectedMonster = this.consecutiveQueue[this.currentConsecutiveIndex];
        
        this.addCombatLog(`🎉 [토벌 완료] ${prevName}을(가) 완벽하게 토벌했습니다!`, '#00ffa3');
        this.addCombatLog(`🐉 [대연속 수렵 ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] ${this.selectedMonster.nameKO}이(가) 출현했습니다!`, '#ffaa00');

        // Play start SFX
        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가자!'] || '가자!');

        // Update stats in engine
        this.monsterTier = this.initializer.getMonsterTier(this.selectedMonster);
        let baseHp = 12000;
        let baseStunThreshold = 300;
        this.monsterDamageMod = 1.0;
        this.monsterAtbSpeedMod = 1.0;
        this.tierLabel = "특수 몬스터";

        if (this.monsterTier === 'small') {
            baseHp = 3000;
            baseStunThreshold = 100;
            this.monsterDamageMod = 0.4;
            this.monsterAtbSpeedMod = 0.8;
            this.tierLabel = "소형 몬스터";
        } else if (this.monsterTier === 'medium') {
            baseHp = 6000;
            baseStunThreshold = 200;
            this.monsterDamageMod = 0.7;
            this.monsterAtbSpeedMod = 1.0;
            this.tierLabel = "중형 몬스터";
        } else if (this.monsterTier === 'elder') {
            baseHp = 24000;
            baseStunThreshold = 500;
            this.monsterDamageMod = 1.4;
            this.monsterAtbSpeedMod = 1.5;
            this.tierLabel = "대형 몬스터";
        }

        // Apply new values to existing engine
        this.engine.selectedMonster = this.selectedMonster;
        this.engine.monsterTier = this.monsterTier;
        this.engine.monsterHp = baseHp;
        this.engine.monsterMaxHp = baseHp;
        this.engine.monsterAtb = 0;
        this.engine.monsterState = 'normal';
        this.engine.monsterSpeed = 2.2 * this.monsterAtbSpeedMod;
        this.engine.monsterDamageMod = this.monsterDamageMod;
        this.engine.monsterAtbSpeedMod = this.monsterAtbSpeedMod;
        this.engine.tierLabel = this.tierLabel;
        this.engine.monsterStunAccum = 0;
        this.engine.monsterStunThreshold = baseStunThreshold;
        this.engine.monsterStunDuration = 0;
        this.engine.monsterKnockdownDuration = 0;
        this.engine.monsterKnockdownTriggered = { 80: false, 60: false, 40: false, 20: false };

        // Reset BGM
        this.audioManager.stopBgms();
        const bgmSrc = this.audioManager.getMonsterBgm(this.selectedMonster.nameKO);
        try {
            this.audioManager.battleBgm = new Audio(bgmSrc);
            this.audioManager.battleBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.audioManager.battleBgm.volume = volConfig.master * volConfig.visual * 0.315;
            this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
        } catch (e) {
            console.warn("Audio error:", e);
        }

        // Re-render Fighting UI header/monster showcase
        const hpLabelText = `👾 [연속 수렵 ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`;
        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP
        });

        // Restore borders
        this.selectedWeapons.forEach(w => this.renderer.restoreBorder(w.index, w));
    }

    endGame(container, isVictory, winner = null) {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;

        if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
        if (this.fightInterval) { clearInterval(this.fightInterval); this.fightInterval = null; }

        this.audioManager.stopBgms();

        if (isVictory) {
            try {
                const successBgms = [
                    'BGM/MHW_Quest_Clear.mp3',
                    'BGM/MH_Quest_Clear_Kokoto.mp3',
                    'BGM/MH_Quest_Clear_Pokke.mp3',
                    'BGM/MH_Quest_Clear_Yukumo.mp3',
                    'BGM/MH_Quest_Clear_MH4.mp3',
                    'BGM/MHR_Quest_Clear_Kamura.mp3'
                ];
                const selectedClear = successBgms[Math.floor(Math.random() * successBgms.length)];
                this.audioManager.winBgm = new Audio(selectedClear);
                const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
                this.audioManager.winBgm.volume = volConfig.master * volConfig.visual * 0.315;
                this.audioManager.winBgmPromise = this.audioManager.winBgm.play().catch(() => {
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['우승!'] || '우승!');
                });
            } catch (e) {
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['우승!'] || '우승!');
            }
        } else {
            try {
                const failBgms = [
                    'BGM/MH_Quest_Fail_Classic.mp3',
                    'BGM/MHW_Quest_Fail.mp3',
                    'BGM/MHR_Quest_Fail.mp3'
                ];
                const selectedFail = failBgms[Math.floor(Math.random() * failBgms.length)];
                this.audioManager.winBgm = new Audio(selectedFail);
                const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
                this.audioManager.winBgm.volume = volConfig.master * volConfig.visual * 0.315;
                this.audioManager.winBgmPromise = this.audioManager.winBgm.play().catch(() => {
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['안돼'] || '안돼');
                });
            } catch (e) {
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['안돼'] || '안돼');
            }
        }

        const card = container.querySelector('.game-hunt-card');
        const topPanel = card.querySelector('#game-hunt-top-panel');
        
        if (isVictory && winner) {
            if (topPanel) {
                topPanel.innerHTML = `
                    <div class="game-title" style="font-size:3.5rem; color:#00ffa3; font-weight:bold; text-shadow:0 0 20px rgba(0,255,163,0.5); margin-bottom:20px;">
                        🎉 퀘스트 클리어! 수렵 성공! 🎉
                    </div>
                    <div style="font-size:2.2rem; color:#fff; margin-bottom: 25px;">
                        마지막까지 생존한 <span style="color:${winner.hunterColor || '#ffaa00'}; font-weight:bold;">🏆 ${winner.hunterName}</span>이(가) ${this.selectedMonster.nameKO} 수렵에 성공했습니다!
                    </div>
                `;
            }
            
            const winnerCard = card.querySelector(`#fight-card-${winner.index}`);
            if (winnerCard) {
                winnerCard.classList.remove('large-hit-anim', 'small-hit-anim');
                void winnerCard.offsetWidth;
                winnerCard.classList.add('victory-jump');
                const tag = card.querySelector(`#status-tag-${winner.index}`);
                if (tag) {
                    tag.textContent = '🏆 MVP 🏆';
                    tag.className = 'game-hunt-status-tag active';
                }
            }
        } else {
            if (topPanel) {
                topPanel.innerHTML = `
                    <div class="game-title" style="font-size:3.5rem; color:#ff3b30; font-weight:bold; text-shadow:0 0 20px rgba(255,59,48,0.5); margin-bottom:20px;">
                        ☠️ 퀘스트 실패 (3수레 전멸) ☠️
                    </div>
                    <div style="font-size:2.2rem; color:#fff; margin-bottom:20px;">
                        3번의 수레 탑승 누적으로 수렵 퀘스트가 강제 종료되었습니다.
                    </div>
                    <div style="font-size:1.5rem; color:#aaa; margin-bottom:10px;">${this.selectedMonster.nameKO}은(는) 상처투성이가 되어 유유히 떠났습니다.</div>
                `;
            }

            this.selectedWeapons.forEach(w => {
                const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                if (weaponCard) {
                    if (w.hp > 0) {
                        weaponCard.classList.add('crying-hunter');
                        const tearDrops = document.createElement('div');
                        tearDrops.className = 'tear-drops';
                        tearDrops.innerHTML = `
                            <div class="tear tear-left"></div>
                            <div class="tear tear-right"></div>
                        `;
                        weaponCard.appendChild(tearDrops);
                        const tag = card.querySelector(`#status-tag-${w.index}`);
                        if (tag) {
                            tag.textContent = '훌쩍 훌쩍...';
                            tag.className = 'game-hunt-status-tag fainted';
                        }
                    } else {
                        weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                        void weaponCard.offsetWidth;
                        weaponCard.style.transform = 'rotate(180deg)';
                        const tag = card.querySelector(`#status-tag-${w.index}`);
                        if (tag) {
                            tag.textContent = '💀 기절 (수레)';
                            tag.className = 'game-hunt-status-tag fainted';
                        }
                    }
                }
            });
        }

        setTimeout(() => {
            container.style.animation = "game-fade-out 0.5s ease-in forwards";
            setTimeout(() => {
                this.renderer.removeContainer();
                this.audioManager.stopBgms();
                if (this.resolveGame) {
                    this.resolveGame();
                    this.resolveGame = null;
                }
            }, 500);
        }, 15000);
    }

    forceStopGame() {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;

        if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
        if (this.fightInterval) { clearInterval(this.fightInterval); this.fightInterval = null; }

        this.audioManager.stopBgms();
        this.renderer.removeContainer();

        if (this.resolveGame) {
            this.resolveGame();
            this.resolveGame = null;
        }
    }
}
