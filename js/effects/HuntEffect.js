class HuntEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.isActive = false;
        this.lifecycle = new HuntLifecycle();
        this.bets = {}; // { nickname: { index, color } }
        this.selectedWeapons = []; // 4 selected weapons
        this.selectedMonster = null; // random monster
        this.gameTimer = null;
        this.fightInterval = null;
        this.victoryEmojiTimeouts = [];
        this.resolveGame = null;
        this.timers = new ManagedTimers();

        // Configuration
        this.SHOW_MONSTER_HP = true;

        this.renderer = new HuntRenderer();
        this.audioManager = new HuntAudioManager(director, this.config);
        this.initializer = new HuntInitializer();
        this.participantParser = new HuntParticipantParser();
        this.engine = null;

        // Static emoji mapping for victory emotions (purely emotion/gesture based, no items)
        this.victoryEmojiMap = {
            veteran: ['😎', '👍', '😄', '✌️', '💪'],
            support: ['🥰', '💚', '😍', '😊', '🥳'],
            newbie: ['🤩', '😂', '🥳', '🙌', '💛'],
            offensive: ['😼', '😈', '😎', '🔥', '✊'],
            defensive: ['😌', '👍', '😊', '👌', '🧡'],
            normal: ['🙂', '👍', '😄', '👏', '❤️']
        };
    }

    get phase() {
        return this.lifecycle.state;
    }

    set phase(nextState) {
        this.lifecycle.transition(nextState);
    }

    async execute(context) {
        if (this.isActive) {
            console.warn("Monster hunt game is already active. Ignoring double trigger.");
            return;
        }
        
        // [FIX] 이전 수렵의 페이드아웃 타이머가 겹쳐서 새 UI를 파괴하는 버그 방지
        if (this.endGameFadeoutTimer) {
            this.timers.clear(this.endGameFadeoutTimer);
            this.endGameFadeoutTimer = null;
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
        this.monsters = monsters;
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
            this.audioManager.lobbyBgm = this.director.audioManager.createNativeAudio(selectedLobby, {
                type: 'visual', baseVolume: 0.315, loop: true
            });
            this.audioManager.lobbyBgmPromise = this.audioManager.lobbyBgm.play().catch(() => {
                this.audioManager.lobbyBgm.src = 'BGM/SportBGM.mp3';
                this.director.audioManager.applyNativeVolume(this.audioManager.lobbyBgm, {
                    type: 'visual', path: 'BGM/SportBGM.mp3', baseVolume: 0.315
                });
                this.audioManager.lobbyBgmPromise = this.audioManager.lobbyBgm.play().catch(err => console.warn("Lobby BGM failed to play:", err));
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        const currentTier = this.initializer.getMonsterTier(this.selectedMonster);
        const isElder = (currentTier === 'elder');
        let voteTitle = isElder ? "⚔️ 고룡 토벌 모집! ⚔️" : "⚔️ 몬스터 수렵 모집! ⚔️";
        let voteSubtitle = isElder ? "함께 토벌할 헌터 번호(1~4)를 채팅창에 치세요!" : "함께 수렵할 헌터 번호(1~4)를 채팅창에 치세요!";
        if (this.consecutiveTotal > 1) {
            voteTitle = isElder 
                ? `⚔️ 연속 토벌 모집! (1/${this.consecutiveTotal}) ⚔️` 
                : `⚔️ 연속 수렵 모집! (1/${this.consecutiveTotal}) ⚔️`;
            voteSubtitle = isElder 
                ? `${this.consecutiveTotal}마리 연속 토벌! 함께 참가할 번호(1~4)를 채팅창에 치세요!` 
                : `${this.consecutiveTotal}마리 연속 수렵! 함께 참가할 번호(1~4)를 채팅창에 치세요!`;
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
            
            this.gameTimer = this.timers.interval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    this.timers.clear(this.gameTimer);
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

        if (msgData.isStreamer && (msg === '!토벌 중단' || msg === '!중단' || msg === '!수렵 중단' || msg === '!토벌중단' || msg === '!수렵중단')) {
            this.forceStopGame();
            return true;
        }

        if (this.phase === 'voting') {
            const selection = this.participantParser.parse(msg, msgData, this.config.debugMode);
            if (selection) {
                const { index, isSubscriber: isSub, weaponId: chosenWeaponId, personality: chosenPersonality } = selection;

                this.bets[msgData.nickname] = {
                    index,
                    color: msgData.color || '#ffffff',
                    isSubscriber: isSub,
                    weaponId: chosenWeaponId,
                    personality: chosenPersonality
                };

                this.renderer.updateBettingUI(this.bets);

                // 스폰 이모지 및 참가 말풍선
                const chosenWeaponObj = chosenWeaponId ? this.initializer.WEAPONS.find(wp => wp.id === chosenWeaponId) : null;
                const chosenWeaponName = chosenWeaponObj ? chosenWeaponObj.name : '';
                const pMap = {
                    offensive: '💥 공격적',
                    defensive: '🛡️ 수비적',
                    support: '💚 서포터',
                    newbie: '🐣 몬린이',
                    veteran: '🏆 베테랑',
                    normal: '⚖️ 밸런스'
                };
                const chosenPersName = chosenPersonality ? (pMap[chosenPersonality] || '⚖️ 밸런스') : '';

                let feedbackMsg = `참가 신청!`;
                if (chosenWeaponName && chosenPersName) {
                    feedbackMsg = `⚔️ ${chosenWeaponName} (${chosenPersName})`;
                } else if (chosenWeaponName) {
                    feedbackMsg = `⚔️ ${chosenWeaponName}`;
                } else if (chosenPersName) {
                    feedbackMsg = `${chosenPersName}`;
                }

                this.renderer.spawnLobbyNotification(index, msgData.nickname, feedbackMsg, isSub);
                return true;
            }

            // If the user is already registered in this.bets, display their chat above their card
            const bet = this.bets[msgData.nickname];
            if (bet !== undefined && msg) {
                this.renderer.spawnCombatChatBubble(bet.index, msg);
                return true;
            }
        } else if (this.phase === 'fighting' || this.phase === 'ended') {
            const hunter = this.selectedWeapons.find(w => w.hunterName === msgData.nickname);
            if (hunter && msg) {
                this.renderer.spawnCombatChatBubble(hunter.index, msg);
                return true;
            }
        }
        return false;
    }

    startFight(container) {
        this.renderer.clearLobbyTimer();
        this.phase = 'fighting';
        document.body.classList.add('in-hunt');

        // Handle Unknown Monster random reveal upon hunt start
        const realMonsters = (this.monsters || []).filter(m => m.id !== 'unknown_monster');
        if (realMonsters.length > 0) {
            if (this.selectedMonster && this.selectedMonster.id === 'unknown_monster') {
                const randomMonster = realMonsters[Math.floor(Math.random() * realMonsters.length)];
                this.selectedMonster = randomMonster;
            }
            if (this.consecutiveQueue && this.consecutiveQueue.length > 0) {
                this.consecutiveQueue = this.consecutiveQueue.map(m => {
                    if (m.id === 'unknown_monster') {
                        return realMonsters[Math.floor(Math.random() * realMonsters.length)];
                    }
                    return m;
                });
            }
        }

        this.audioManager.stopBgms();
        this.renderer.setContainer(container);

        this.selectedWeapons.forEach(w => {
            const voters = Object.entries(this.bets)
                .filter(([nick, bet]) => bet.index === w.index)
                .map(([nick, bet]) => ({
                    nickname: nick,
                    color: bet.color,
                    isSubscriber: bet.isSubscriber,
                    weaponId: bet.weaponId,
                    personality: bet.personality
                }));

            if (voters.length > 0) {
                // Prioritize subscribers
                const subs = voters.filter(v => v.isSubscriber);
                const chosen = subs.length > 0
                    ? subs[Math.floor(Math.random() * subs.length)]
                    : voters[Math.floor(Math.random() * voters.length)];

                w.hunterName = chosen.nickname;
                w.hunterColor = chosen.color;

                // Handle weapon override if they selected a specific weapon
                if (chosen.weaponId) {
                    const matchedWeapon = this.initializer.WEAPONS.find(wp => wp.id === chosen.weaponId);
                    if (matchedWeapon) {
                        const prevIndex = w.index;
                        const initialSpeedGroup = matchedWeapon.id === 'charge_blade' ? 'very_fast' : matchedWeapon.speedGroup;
                        
                        Object.assign(w, {
                            ...matchedWeapon,
                            speedGroup: initialSpeedGroup,
                            index: prevIndex,
                            hp: 100,
                            maxHp: 100,
                            status: 'alive',
                            sharpness: 100,
                            ammo: 5,
                            hasMoxie: true,
                            atb: 0,
                            comboIndex: 0,
                            respawnTimer: 0,
                            potions: 10,
                            lifepowders: 1,
                            spiritLevel: 0,
                            demonModeDuration: 0,
                            phials: 5,
                            overheatDuration: 0,
                            extractBuffs: { red: 0, white: 0, orange: 0 },
                            extractDuration: 0
                        });
                    }
                }

                // Handle personality override if they selected a specific personality
                if (chosen.personality) {
                    w.personality = chosen.personality;
                }
            } else {
                w.hunterName = `HUNTER ${w.index + 1}`;
                w.hunterColor = "#cccccc";
            }
        });

        const bgmSrc = this.audioManager.getMonsterBgm(this.selectedMonster);
        try {
            this.audioManager.battleBgm = this.director.audioManager.createNativeAudio(bgmSrc, {
                type: 'visual', baseVolume: 0.315, loop: true
            });
            this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(() => {
                this.audioManager.battleBgm.src = 'BGM/MHGU_Arena.mp3';
                this.director.audioManager.applyNativeVolume(this.audioManager.battleBgm, {
                    type: 'visual', path: 'BGM/MHGU_Arena.mp3', baseVolume: 0.315
                });
                this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(err => {
                    this.audioManager.battleBgm.src = 'BGM/MHW_Proof_of_a_Hero.mp3';
                    this.director.audioManager.applyNativeVolume(this.audioManager.battleBgm, {
                        type: 'visual', path: 'BGM/MHW_Proof_of_a_Hero.mp3', baseVolume: 0.315
                    });
                    this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
                });
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가기'] || '가기');
        this.audioManager.playMHAudioFile('Unified_SFX/MH - Hunters Depart (MH3U).mp3');

        this.monsterTier = this.initializer.getMonsterTier(this.selectedMonster);
        const tierRules = HuntTierRules.resolve(this.monsterTier, 'initial');
        const baseHp = tierRules.hp;
        const baseStunThreshold = tierRules.stunThreshold;
        this.monsterDamageMod = tierRules.damageMod;
        this.monsterAtbSpeedMod = tierRules.atbSpeedMod;
        this.tierLabel = tierRules.label;

        this.cartCount = 0;

        const actionLabel = (this.monsterTier === 'elder' || this.monsterTier === 'colossal') ? '토벌' : '수렵';
        const hpLabelText = this.consecutiveTotal > 1 
            ? `👾 [연속 ${actionLabel} ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`
            : `👾 [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`;

        const timeLimitVal = this.config.getHuntConfig()?.timeLimit !== undefined ? this.config.getHuntConfig().timeLimit : 180;
        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP,
            timeLimit: timeLimitVal
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
            monsterStunThreshold: baseStunThreshold,
            tierLabel: this.tierLabel,
            MONSTER_ATTACKS: this.initializer.MONSTER_ATTACKS,
            COMBO_LIST: this.initializer.COMBO_LIST,
            SHOW_MONSTER_HP: this.SHOW_MONSTER_HP,
            hunterSpeedMultiplier: this.config.getHuntConfig()?.hunterSpeedMultiplier !== undefined ? this.config.getHuntConfig().hunterSpeedMultiplier : 1.15,
            monsterSpeedMultiplier: this.config.getHuntConfig()?.monsterSpeedMultiplier !== undefined ? this.config.getHuntConfig().monsterSpeedMultiplier : 1.0,
            timeLimit: timeLimitVal,
            callbacks: {
                onLog: (text, color) => this.addCombatLog(text, color),
                onPlaySFX: (fileName, fallbackKey) => this.audioManager.playMHAsset(fileName, fallbackKey),
                onPlayAudioFile: (subPath, durationLimitMs, volumeMultiplier) => this.audioManager.playMHAudioFile(subPath, durationLimitMs, volumeMultiplier),
                onShakeWeapon: (idx, borderClr, isAttack, moveName, isDodge = false) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.shakeWeapon(idx, w, borderClr, isAttack, moveName, isDodge);
                },
                onShakeMonster: () => this.renderer.shakeMonster(),
                onRestoreBorder: (idx) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.restoreBorder(idx, w);
                },
                onUpdateHpUI: (w) => this.renderer.updateHpUI(w),
                onUpdateMonsterHpUI: (hp, maxHp) => this.renderer.updateMonsterHpUI(hp, maxHp),
                onUpdateWeaponAtbUI: (idx, atb) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.updateWeaponAtbUI(idx, atb, w);
                },
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
                onSpawnEmojiBubble: (idx, emoji) => this.renderer.spawnVictoryEmoji(idx, emoji),
                onTriggerMonsterRoar: (monster) => {
                    this.renderer.triggerMonsterRoar();
                    this.audioManager.playMonsterRoar(monster);
                },
                onTriggerMonsterCharge: () => this.renderer.triggerMonsterCharge(),
                onTriggerMonsterAttack: (type, emoji, targets, attackName) => {
                    this.renderer.triggerMonsterAttack(type, emoji, targets, attackName);
                },
                onTriggerGuardShake: (idx) => {
                    if (this.renderer.card) {
                        const weaponCard = this.renderer.card.querySelector(`#fight-card-${idx}`);
                        if (weaponCard) {
                            weaponCard.classList.remove('guard-shake-anim');
                            void weaponCard.offsetWidth;
                            weaponCard.classList.add('guard-shake-anim');
                            const w = this.selectedWeapons[idx];
                            this.timers.timeout(() => {
                                if (w && w.status !== 'dead') {
                                    weaponCard.classList.remove('guard-shake-anim');
                                }
                            }, 300);
                        }
                    }
                },
                onTriggerRollAnimation: (idx) => this.renderer.triggerRollAnimation(idx),
                onTriggerHitAnimation: (idx, damage) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.triggerHitAnimation(idx, w, damage);
                },
                onTriggerDeathTag: (idx) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.triggerDeathTag(idx, w, 5);
                },
                onTriggerStunUI: (idx, isStunned) => this.renderer.triggerStunUI(idx, isStunned),
                onTriggerRoarStun: (idx, isStunned) => this.renderer.triggerRoarStun(idx, isStunned),
                onTriggerMonsterKnockdownAnim: () => this.renderer.triggerMonsterKnockdownAnim(),
                onGameEnd: (victory, winner) => this.endGame(container, victory, winner),
                onNextConsecutive: () => this.spawnNextConsecutiveMonster(container),
                onTriggerValstraxAmbush: () => {
                    this.director.trigger('valstrax');
                }
            }
        });

        // Set initial UI states
        this.renderer.updateCartUI(0);
        const initialLimit = this.config.getHuntConfig()?.timeLimit !== undefined ? this.config.getHuntConfig().timeLimit : 120;
        this.renderer.updateTimerUI(initialLimit);

        // Tick loop (Process through HuntEngine)
        this.fightInterval = this.timers.interval(() => {
            if (this.phase !== 'fighting') return;
            this.engine.processTick();
        }, 100);
    }

    addCombatLog(text, color) {
        console.log(`[HUNT] ${text}`);
    }

    getMonsterMaterialName(monsterName, personality) {
        const name = monsterName || "몬스터";
        let rare = "역린";
        let scale = "비늘";
        let shell = "갑각";
        let claw = "발톱";
        let tail = "꼬리";

        if (name.includes("리오레우스") || name.includes("레우스") || name.includes("리오레이아") || name.includes("레이아")) {
            rare = "화룡의 홍옥";
            scale = "화룡의 비늘";
            shell = "화룡의 갑각";
            claw = "화룡의 발톱";
            tail = "화룡의 꼬리";
        } else if (name.includes("진오우거")) {
            rare = "뇌랑룡의 보옥";
            scale = "뇌랑룡의 갑각";
            shell = "뇌랑룡의 대전모피";
            claw = "뇌랑룡의 발톱";
            tail = "뇌랑룡의 꼬리";
        } else if (name.includes("벨카나")) {
            rare = "빙룡의 보옥";
            scale = "빙룡의 비늘";
            shell = "빙룡의 얼음갑각";
            claw = "빙룡의 발톱";
            tail = "빙룡의 꼬리";
        } else if (name.includes("네르기간테")) {
            rare = "멸진룡의 보옥";
            scale = "멸진룡의 재생가시";
            shell = "멸진룡의 견갑각";
            claw = "멸진룡의 첨예뿔";
            tail = "멸진룡의 대꼬리";
        } else if (name.includes("라잔")) {
            rare = "금사자의 투기모피";
            scale = "금사자의 검은털";
            shell = "금사자의 송곳니";
            claw = "금사자의 예리한 발톱";
            tail = "금사자의 꼬리";
        } else {
            rare = `${name} 보옥`;
            scale = `${name} 비늘`;
            shell = `${name} 갑각`;
            claw = `${name} 발톱`;
            tail = `${name} 꼬리`;
        }

        if (personality === 'newbie') {
            return Math.random() < 0.2 ? rare : scale;
        } else if (personality === 'offensive') {
            return Math.random() < 0.25 ? rare : claw;
        } else if (personality === 'defensive') {
            return shell;
        } else if (personality === 'support') {
            const items = ['그레이트 회복약', '생명의 가루', '비약', '귀인약'];
            return items[Math.floor(Math.random() * items.length)];
        } else {
            return Math.random() < 0.15 ? rare : tail;
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
        // [FIX] 렌더러 컨테이너 내부에 종속시켜 !중단 시 함께 삭제되도록 수정
        if (this.renderer && this.renderer.container) {
            this.renderer.container.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
        this.timers.timeout(() => { if (container.parentNode) container.remove(); }, 4000);
    }

    clearAllTimers() {
        if (this.gameTimer) { this.timers.clear(this.gameTimer); this.gameTimer = null; }
        if (this.fightInterval) { this.timers.clear(this.fightInterval); this.fightInterval = null; }
        this.timers.clearAll();
        this.victoryEmojiTimeouts = [];
    }

    spawnNextConsecutiveMonster(container) {
        this.clearAllTimers();
        const prevTier = this.initializer.getMonsterTier(this.selectedMonster);
        const prevAction = prevTier === 'elder' ? '토벌' : '수렵';
        const prevName = this.selectedMonster.nameKO;
        this.currentConsecutiveIndex++;
        this.selectedMonster = this.consecutiveQueue[this.currentConsecutiveIndex];
        
        const nextTier = this.initializer.getMonsterTier(this.selectedMonster);
        const nextAction = nextTier === 'elder' ? '토벌' : '수렵';

        this.addCombatLog(`🎉 [${prevAction} 완료] ${prevName}을(가) 완벽하게 ${prevAction}했습니다!`, '#00ffa3');
        this.addCombatLog(`🐉 [대연속 ${nextAction} ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] ${this.selectedMonster.nameKO}이(가) 출현했습니다!`, '#c98534');

        // Play start SFX
        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가자!'] || '가자!');

        // Update stats in engine
        this.monsterTier = this.initializer.getMonsterTier(this.selectedMonster);
        const tierRules = HuntTierRules.resolve(this.monsterTier, 'consecutive');
        const baseHp = tierRules.hp;
        const baseStunThreshold = tierRules.stunThreshold;
        this.monsterDamageMod = tierRules.damageMod;
        this.monsterAtbSpeedMod = tierRules.atbSpeedMod;
        this.tierLabel = tierRules.label;

        // Apply new values to existing engine
        this.engine.selectedMonster = this.selectedMonster;
        this.engine.currentConsecutiveIndex = this.currentConsecutiveIndex;
        this.engine.monsterTier = this.monsterTier;
        this.engine.monsterHp = baseHp;
        this.engine.monsterMaxHp = baseHp;
        this.engine.battleTime = 0; // Reset countdown timer for each monster!
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

        if (this.selectedMonster.id.includes('valstrax')) {
            this.engine.valstraxChargeCount = 0;
            this.engine.valstraxChargeDmg = 0;
            this.engine.valstraxChargeTimer = 0;
            this.engine.valstraxEnrageTimer = 0;
            this.engine.valstraxFlyingTimer = 0;
        }

        // Reset BGM
        this.audioManager.stopBgms();
        const bgmSrc = this.audioManager.getMonsterBgm(this.selectedMonster);
        try {
            this.audioManager.battleBgm = this.director.audioManager.createNativeAudio(bgmSrc, {
                type: 'visual', baseVolume: 0.315, loop: true
            });
            this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
        } catch (e) {
            console.warn("Audio error:", e);
        }

        // Re-render Fighting UI header/monster showcase
        const actionLabel = (this.monsterTier === 'elder' || this.monsterTier === 'colossal') ? '토벌' : '수렵';
        const hpLabelText = `👾 [연속 ${actionLabel} ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`;
        const resumeLimitVal = this.config.getHuntConfig()?.timeLimit !== undefined ? this.config.getHuntConfig().timeLimit : 180;
        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP,
            timeLimit: resumeLimitVal
        });

        // Restore actual UI states for monster HP, timer, and hunter HP
        this.renderer.updateMonsterHpUI(this.engine.monsterHp, this.engine.monsterMaxHp);
        this.renderer.updateTimerUI(this.engine.getRemainingSeconds());
        this.selectedWeapons.forEach(w => this.renderer.updateHpUI(w));
        this.renderer.updateCartUI(this.engine.cartCount);

        // Restore borders
        this.selectedWeapons.forEach(w => this.renderer.restoreBorder(w.index, w));

        // Restart Tick loop (Process through HuntEngine)
        this.fightInterval = this.timers.interval(() => {
            if (this.phase !== 'fighting') return;
            this.engine.processTick();
        }, 100);
    }

    endGame(container, isVictory, winner = null) {
        return HuntResultPresenter.show(this, container, isVictory, winner);
    }

    forceStopGame() {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;

        // [FIX] 중단 시에도 잔여 페이드아웃 타이머 제거
        if (this.endGameFadeoutTimer) {
            this.timers.clear(this.endGameFadeoutTimer);
            this.endGameFadeoutTimer = null;
        }

        this.clearAllTimers();

        this.audioManager.stopBgms();
        this.renderer.removeContainer();
        document.body.classList.remove('in-hunt');

        if (this.resolveGame) {
            this.resolveGame();
            this.resolveGame = null;
        }
    }
}
