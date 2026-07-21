class HuntEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.isActive = false;
        this.lifecycle = new HuntLifecycle();
        this.bets = {}; // selected hunter lookup retained for engine compatibility
        this.participants = [];
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
        const SeededRandom = typeof HuntSeededRandom !== 'undefined'
            ? HuntSeededRandom
            : class { next() { return Math.random(); } };
        const LobbyRoster = typeof HuntLobbyRoster !== 'undefined'
            ? HuntLobbyRoster
            : class { constructor() { this.entries = new Map(); } list() { return []; } selectFour() { return []; } };
        const LoadoutAdvisor = typeof HuntLoadoutAdvisor !== 'undefined'
            ? HuntLoadoutAdvisor
            : class { recommend(hunter, monster, weapons) { return weapons && weapons[0]; } };
        this.LobbyRoster = LobbyRoster;
        this.sessionRng = new SeededRandom(Date.now());
        this.random = () => this.sessionRng.next();
        this.initializer = new HuntInitializer({ random: this.random });
        this.participantParser = new HuntParticipantParser();
        this.roster = new this.LobbyRoster(this.random);
        this.loadoutAdvisor = new LoadoutAdvisor(this.initializer.WEAPONS);
        this.chatTactics = new HuntChatTactics();
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
        this.phase = 'quest_board';
        this.bets = {};
        this.participants = [];
        this.roster = new this.LobbyRoster(this.random);
        this.chatTactics.reset();

        // Reset audio
        this.audioManager.stopBgms();

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

        this.selectedWeapons = [];

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
                type: 'visual', baseVolume: this.audioManager.huntVolume(0.315), loop: true
            });
            this.audioManager.lobbyBgmPromise = this.audioManager.lobbyBgm.play().catch(() => {
                this.audioManager.lobbyBgm.src = 'BGM/SportBGM.mp3';
                this.director.audioManager.applyNativeVolume(this.audioManager.lobbyBgm, {
                    type: 'visual', path: 'BGM/SportBGM.mp3', baseVolume: this.audioManager.huntVolume(0.315)
                });
                this.audioManager.lobbyBgmPromise = this.audioManager.lobbyBgm.play().catch(err => console.warn("Lobby BGM failed to play:", err));
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        const currentTier = this.initializer.getMonsterTier(this.selectedMonster);
        const isElder = (currentTier === 'elder');
        let voteTitle = isElder ? "⚔️ 집회소 고룡 토벌 수주 ⚔️" : "⚔️ 집회소 수렵 퀘스트 수주 ⚔️";
        let voteSubtitle = "채팅에 !참가를 입력하세요. 모집 종료 후 4명의 헌터를 선발합니다.";
        if (this.consecutiveTotal > 1) {
            voteTitle = isElder 
                ? `⚔️ 연속 토벌 모집! (1/${this.consecutiveTotal}) ⚔️` 
                : `⚔️ 연속 수렵 모집! (1/${this.consecutiveTotal}) ⚔️`;
            voteSubtitle = `${this.consecutiveTotal}마리 연속 퀘스트입니다. !참가 입력자 중 4명을 선발합니다.`;
        }

        this.renderer.renderQuestBoard({
            voteTitle,
            voteSubtitle,
            consecutiveTotal: this.consecutiveTotal,
            currentConsecutiveIndex: this.currentConsecutiveIndex,
            consecutiveQueue: this.consecutiveQueue,
            selectedMonster: this.selectedMonster,
            questTier: currentTier,
            participantCount: 0,
            participants: []
        });

        let timeLeft = 30;
        return new Promise(resolve => {
            this.resolveGame = resolve;
            
            this.gameTimer = this.timers.interval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    this.timers.clear(this.gameTimer);
                    this.gameTimer = null;
                    this.beginLoadout();
                } else {
                    this.renderer.updatePhaseTimer(timeLeft, '모집 마감');
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

        if (this.phase === 'quest_board') {
            if (this.participantParser.parseRecruitment(msg)) {
                const registration = this.roster.register(msgData);
                this.participants = this.roster.list();
                this.renderer.updateRecruitmentUI(this.participants);
                if (registration.added) this.renderer.spawnRecruitmentNotification(msgData.nickname);
                if (registration.added && registration.count >= 4) {
                    if (this.gameTimer) this.timers.clear(this.gameTimer);
                    this.gameTimer = null;
                    this.beginLoadout();
                }
                return true;
            }
        } else if (this.phase === 'loadout') {
            const hunter = this.selectedWeapons.find(item => !item.isNpc && item.hunterName === msgData.nickname);
            const ready = hunter ? this.participantParser.parseReady(msg) : null;
            if (hunter && ready) {
                if (!hunter.loadoutReady) {
                    hunter.loadoutReady = true;
                    this.renderer.updateLoadoutCard(hunter);
                    this.renderer.spawnCombatChatBubble(hunter.index, '✅ 준비 · 🔒');
                    this.audioManager.playReadyConfirmationVoice(hunter);
                    this.departWhenLoadoutReady();
                } else {
                    this.renderer.spawnCombatChatBubble(hunter.index, '✅ 준비됨');
                }
                return true;
            }
            const perkReroll = hunter ? this.participantParser.parsePerkReroll(msg) : null;
            if (hunter && perkReroll) {
                if (hunter.loadoutReady) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔒 준비됨');
                    return true;
                }
                const rerollCount = Number(hunter.perkRerollCount || (hunter.perkRerolled ? 1 : 0));
                if (rerollCount >= 2) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🎲 2/2 완료');
                    return true;
                }
                if (this.initializer.rerollHunterPerks(hunter)) {
                    hunter.perkRerollCount = rerollCount + 1;
                    hunter.perkRerolled = hunter.perkRerollCount >= 2;
                    this.renderer.updateLoadoutCard(hunter);
                    this.renderer.spawnCombatChatBubble(hunter.index, `🎲 ${hunter.perkRerollCount}/2`);
                    this.audioManager.playLoadoutConfirmationVoice(hunter, { perkRerolled: true });
                }
                return true;
            }
            const change = hunter ? this.participantParser.parseLoadout(msg) : null;
            if (hunter && change) {
                if (hunter.loadoutReady) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔒 준비됨');
                    return true;
                }
                const previousWeaponId = hunter.id;
                const previousPersonality = hunter.personality;
                if (change.personality) hunter.personality = change.personality;
                if (change.personality) this.initializer.syncLoadoutItems(hunter);
                let weaponId = change.weaponId;
                if (!weaponId && change.recommend) {
                    const recommendation = this.loadoutAdvisor.recommend(hunter, this.selectedMonster, this.selectedWeapons);
                    weaponId = recommendation && recommendation.id;
                }
                if (weaponId) this.initializer.replaceHunterWeapon(hunter, weaponId);
                this.renderer.updateLoadoutCard(hunter);
                const label = this.renderer.getPersonalityLabel(hunter.personality);
                this.renderer.spawnCombatChatBubble(hunter.index, `✅ ${hunter.name} · ${label}`);
                const weaponChanged = hunter.id !== previousWeaponId;
                const personalityChanged = hunter.personality !== previousPersonality;
                if (weaponChanged || personalityChanged) {
                    this.audioManager.playLoadoutConfirmationVoice(hunter, { weaponChanged, personalityChanged });
                }
                return true;
            }
            if (hunter && msg) {
                this.renderer.spawnCombatChatBubble(hunter.index, msg);
                return true;
            }
        } else if (this.phase === 'fighting' || this.phase === 'results') {
            if (this.phase === 'fighting') {
                const tacticalResult = this.chatTactics.handle(this.engine, msgData, msg);
                if (tacticalResult.handled) {
                    const tacticalHunter = this.selectedWeapons.find(w => w.hunterName === msgData.nickname);
                    if (tacticalHunter && !tacticalResult.suppressBubble) this.renderer.spawnCombatChatBubble(tacticalHunter.index, tacticalResult.feedback);
                    return true;
                }
            }
            const hunter = this.selectedWeapons.find(w => w.hunterName === msgData.nickname);
            if (hunter && msg) {
                this.renderer.spawnCombatChatBubble(hunter.index, msg);
                return true;
            }
        }
        return false;
    }

    beginLoadout() {
        if (this.phase !== 'quest_board') return;
        this.renderer.clearLobbyTimer();
        this.phase = 'loadout';
        this.audioManager.playMHAudioFile('Unified_SFX/MH - Open Chest.mp3');
        const selected = this.roster.selectFour();
        this.selectedWeapons = this.initializer.buildSelectedWeapons([]);
        this.bets = {};

        this.selectedWeapons.forEach((hunter, index) => {
            const entrant = selected[index];
            hunter.hunterName = entrant.nickname;
            hunter.hunterColor = entrant.color || '#cccccc';
            hunter.participantUid = entrant.uid || null;
            hunter.isStreamer = Boolean(entrant.isStreamer);
            hunter.isNpc = Boolean(entrant.isNpc);
            hunter.loadoutReady = hunter.isNpc;
            hunter.perkRerolled = hunter.isNpc;
            hunter.perkRerollCount = hunter.isNpc ? 2 : 0;
            this.bets[hunter.hunterName] = {
                index,
                color: hunter.hunterColor,
                participantUid: hunter.participantUid,
                isStreamer: hunter.isStreamer,
                isNpc: hunter.isNpc
            };
        });
        this.audioManager.prepareHunterVoiceProfiles(this.selectedWeapons);

        this.renderer.renderLoadout({
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            timeLeft: 60
        });

        if (this.departWhenLoadoutReady()) return;

        let timeLeft = 60;
        this.gameTimer = this.timers.interval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                this.timers.clear(this.gameTimer);
                this.gameTimer = null;
                this.startFight(this.renderer.container);
            } else {
                this.renderer.updatePhaseTimer(timeLeft, '장비 확정');
            }
        }, 1000);
    }

    departWhenLoadoutReady() {
        if (this.phase !== 'loadout' || !this.selectedWeapons.length) return false;
        if (!this.selectedWeapons.every(hunter => Boolean(hunter.loadoutReady))) return false;
        if (this.gameTimer) this.timers.clear(this.gameTimer);
        this.gameTimer = null;
        this.startFight(this.renderer.container);
        return true;
    }

    startFight(container) {
        this.renderer.clearLobbyTimer();
        if (this.phase !== 'loadout') return;
        if (this.gameTimer) this.timers.clear(this.gameTimer);
        this.gameTimer = null;
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

        const bgmSrc = this.audioManager.getMonsterBgm(this.selectedMonster);
        try {
            this.audioManager.battleBgm = this.director.audioManager.createNativeAudio(bgmSrc, {
                type: 'visual', baseVolume: this.audioManager.huntVolume(0.315), loop: true
            });
            this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(() => {
                const fallbackBgm = this.audioManager.getMonsterBgm(this.selectedMonster, { preferDedicated: false });
                this.audioManager.battleBgm.src = fallbackBgm;
                this.director.audioManager.applyNativeVolume(this.audioManager.battleBgm, {
                    type: 'visual', path: fallbackBgm, baseVolume: this.audioManager.huntVolume(0.315)
                });
                this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(err => {
                    this.audioManager.battleBgm.src = 'BGM/MHW_Proof_of_a_Hero.mp3';
                    this.director.audioManager.applyNativeVolume(this.audioManager.battleBgm, {
                        type: 'visual', path: 'BGM/MHW_Proof_of_a_Hero.mp3', baseVolume: this.audioManager.huntVolume(0.315)
                    });
                    this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
                });
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        this.audioManager.playConfiguredSound(this.config.getSoundConfig()['가기'] || '가기');
        this.audioManager.playMHAudioFile('Unified_SFX/MH - Hunters Depart (MH3U).mp3');

        this.monsterTier = this.initializer.getMonsterTier(this.selectedMonster);
        const tierRules = HuntTierRules.resolve(this.monsterTier, 'initial');
        const baseHp = tierRules.hp;
        const baseStunThreshold = tierRules.stunThreshold;
        this.monsterDamageMod = tierRules.damageMod;
        this.monsterAtbSpeedMod = tierRules.atbSpeedMod;
        this.tierLabel = tierRules.label;
        this.smallMonsterCount = this.monsterTier === 'small' ? 3 + Math.floor(this.initializer.random() * 3) : 0;

        this.cartCount = 0;

        const actionLabel = (this.monsterTier === 'elder' || this.monsterTier === 'colossal') ? '토벌' : '수렵';
        const habitatLabel = this.audioManager.getSelectedHabitatLabel();
        const habitatSuffix = habitatLabel ? ` · 🗺️ ${habitatLabel}` : '';
        const hpLabelText = this.consecutiveTotal > 1
            ? `👾 [연속 ${actionLabel} ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO}${habitatSuffix} [체력]`
            : `👾 [${this.tierLabel}] ${this.selectedMonster.nameKO}${habitatSuffix} [체력]`;

        const timeLimitVal = this.config.getHuntConfig()?.timeLimit !== undefined ? this.config.getHuntConfig().timeLimit : 480;
        const dungAwakenedHunters = this.initializer.materializeBattleStartPerks(this.selectedWeapons);
        const cartLimit = 3 + this.selectedWeapons.filter(hunter =>
            (hunter.perks || []).some(perk => perk.name === '수레 애호가')
        ).length;
        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP,
            timeLimit: timeLimitVal,
            smallMonsterCount: this.smallMonsterCount,
            cartLimit
        });
        dungAwakenedHunters.forEach(hunter => {
            this.renderer.spawnCombatChatBubble(hunter.index, '💩🌈 똥 퍽 발현!');
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
            smallMonsterCount: this.smallMonsterCount,
            monsterSpeed: 2.2 * this.monsterAtbSpeedMod,
            monsterState: 'normal',
            monsterDamageMod: this.monsterDamageMod,
            monsterAtbSpeedMod: this.monsterAtbSpeedMod,
            monsterStunThreshold: baseStunThreshold,
            cartLimit,
            tierLabel: this.tierLabel,
            MONSTER_ATTACKS: this.initializer.MONSTER_ATTACKS,
            MONSTER_PATTERNS: this.initializer.MONSTER_PATTERNS,
            COMBO_LIST: this.initializer.COMBO_LIST,
            SHOW_MONSTER_HP: this.SHOW_MONSTER_HP,
            hunterSpeedMultiplier: this.config.getHuntConfig()?.hunterSpeedMultiplier !== undefined ? this.config.getHuntConfig().hunterSpeedMultiplier : 1.15,
            monsterSpeedMultiplier: this.config.getHuntConfig()?.monsterSpeedMultiplier !== undefined ? this.config.getHuntConfig().monsterSpeedMultiplier : 1.0,
            timeLimit: timeLimitVal,
            callbacks: {
                onLog: (text, color) => this.addCombatLog(text, color),
                onPlaySFX: (fileName, fallbackKey, context) => this.audioManager.playMHAsset(fileName, fallbackKey, context),
                onPlayAudioFile: (subPath, durationLimitMs, volumeMultiplier, audioContext) => this.audioManager.playMHAudioFile(subPath, durationLimitMs, volumeMultiplier, audioContext),
                onShakeWeapon: (idx, borderClr, isAttack, actionOrName, isDodge = false) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.shakeWeapon(idx, w, borderClr, isAttack, actionOrName, isDodge);
                },
                onShakeMonster: () => this.renderer.shakeMonster(),
                onRestoreBorder: (idx) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.restoreBorder(idx, w);
                },
                onUpdateHpUI: (w) => this.renderer.updateHpUI(w),
                onUpdateMonsterHpUI: (hp, maxHp) => this.renderer.updateMonsterHpUI(hp, maxHp),
                onUpdateSmallMonsterSwarmUI: (state) => this.renderer.updateSmallMonsterSwarmUI(state),
                onUpdateWeaponAtbUI: (idx, atb) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.updateWeaponAtbUI(idx, atb, w);
                },
                onUpdateSharpnessUI: (idx, hunter) => this.renderer.updateSharpnessUI(idx, hunter),
                onUpdateMonsterAtbUI: (atb) => this.renderer.updateMonsterAtbUI(atb),
                onUpdateMonsterStateUI: (stateName, title, colorInfo) => this.renderer.updateMonsterStateUI(stateName, title, colorInfo),
                onUpdateMonsterFlightUI: (airborne, progress, damage, threshold, remainingTicks) =>
                    this.renderer.updateMonsterFlightUI(airborne, progress, damage, threshold, remainingTicks),
                onUpdateTailSeverUI: (visible, carved, displayName) => this.renderer.updateTailSeverUI(visible, carved, displayName),
                onUpdateHunterCommandQueueUI: (hunter) => this.renderer.updateHunterCommandQueueUI(hunter),
                onUpdatePotionCountUI: (idx, count) => this.renderer.updatePotionCountUI(idx, count),
                onUpdateHunterItemUI: (hunter) => this.renderer.updateHunterItemUI(hunter),
                onUpdateOverheatUI: (idx, duration) => this.renderer.updateOverheatUI(idx, duration),
                onUpdatePhialsUI: (idx, phials) => this.renderer.updatePhialsUI(idx, phials),
                onUpdateExtractsUI: (idx, buffs) => this.renderer.updateExtractsUI(idx, buffs),
                onUpdateHunterBlightUI: (idx, blights) => this.renderer.updateHunterBlightUI(idx, blights),
                onUpdateCartUI: (carts, limit) => {
                    this.cartCount = carts;
                    this.renderer.updateCartUI(carts, limit);
                },
                onUpdateTimerUI: (timeSec) => this.renderer.updateTimerUI(timeSec),
                onShowSkillBubble: (idxOrMonster, text) => this.renderer.showSkillBubble(idxOrMonster, text),
                onSpawnEmojiBubble: (idx, emoji) => this.renderer.spawnVictoryEmoji(idx, emoji),
                onTriggerMonsterRoar: (monster) => {
                    this.renderer.triggerMonsterRoar();
                    this.audioManager.playMonsterRoar(monster);
                },
                onTriggerMonsterCharge: () => this.renderer.triggerMonsterCharge(),
                onTriggerMonsterAttack: (type, emoji, targets, attackName, pattern) => {
                    this.renderer.triggerMonsterAttack(type, emoji, targets, attackName, pattern);
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
                onInterruptWeaponVisual: (idx) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.combatAnimator.interruptWeaponVisual(idx, w);
                },
                onTriggerRollAnimation: (idx) => this.renderer.triggerRollAnimation(idx),
                onTriggerInvincibleJump: (idx, active) => this.renderer.triggerInvincibleJump(idx, active),
                onTriggerHitAnimation: (idx, damage) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.triggerHitAnimation(idx, w, damage);
                },
                onTriggerDeathTag: (idx, timerSeconds) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.triggerDeathTag(idx, w, timerSeconds || 5);
                    this.triggerCartAnimation(w);
                },
                onTriggerStunUI: (idx, isStunned) => this.renderer.triggerStunUI(idx, isStunned),
                onTriggerRoarStun: (idx, isStunned) => this.renderer.triggerRoarStun(idx, isStunned),
                onTriggerMonsterKnockdownAnim: () => this.renderer.triggerMonsterKnockdownAnim(),
                onTriggerEnvironmentEffect: (kind) => this.renderer.triggerEnvironmentEffect(kind),
                onGameEnd: (victory, winner) => this.endGame(container, victory, winner),
                onNextConsecutive: () => this.spawnNextConsecutiveMonster(container),
                onTriggerValstraxAmbush: () => {
                    this.renderer.triggerValstraxAmbushWarning();
                }
            }
        });

        // The loadout DOM is replaced before HuntEngine applies entry perks.
        // Synchronize once immediately so camp/normal cards never spend the
        // opening frame with stale pregame presentation.
        this.selectedWeapons.forEach(w => {
            this.renderer.updateHpUI(w);
            this.renderer.updateWeaponAtbUI(w.index, w.atb, w);
        });

        // Set initial UI states
        this.renderer.updateCartUI(0);
        const initialLimit = this.config.getHuntConfig()?.timeLimit !== undefined ? this.config.getHuntConfig().timeLimit : 480;
        this.renderer.updateTimerUI(initialLimit);

        // Tick loop (Process through HuntEngine)
        this.fightInterval = this.timers.interval(() => {
            if (this.phase !== 'fighting') return;
            this.processFightTickSafely();
        }, 100);
    }

    processFightTickSafely() {
        try {
            this.engine.processTick();
            this.consecutiveFightTickErrors = 0;
        } catch (error) {
            this.consecutiveFightTickErrors = Number(this.consecutiveFightTickErrors || 0) + 1;
            console.error('[HuntEffect] Combat tick recovered', error);
            const engine = this.engine;
            if (!engine) return;
            engine.pendingMonsterAction = null;
            engine.monsterAtb = 0;
            engine.selectedWeapons.forEach(hunter => {
                if (!Number.isFinite(hunter.atb)) hunter.atb = 0;
                if (!Number.isFinite(hunter.attackDuration) || hunter.attackDuration < 0) hunter.attackDuration = 0;
                if (hunter.atb >= 100 && hunter.attackDuration <= 0) hunter.atb = 92;
                engine.updateWeaponAtbUI(hunter.index, hunter.atb);
            });
            engine.updateMonsterAtbUI(0);
            if (this.consecutiveFightTickErrors === 1) {
                engine.addLog('⚠️ [전투 자동복구] 전투 루프 오류를 격리하고 즉시 재개합니다.', '#ffcf70');
            }
        }
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
        if (!weapon) return;
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
        this.audioManager.playConfiguredSound(this.config.getSoundConfig()['가자!'] || '가자!');

        // Update stats in engine
        this.monsterTier = this.initializer.getMonsterTier(this.selectedMonster);
        const tierRules = HuntTierRules.resolve(this.monsterTier, 'consecutive');
        const baseHp = tierRules.hp;
        const baseStunThreshold = tierRules.stunThreshold;
        this.monsterDamageMod = tierRules.damageMod;
        this.monsterAtbSpeedMod = tierRules.atbSpeedMod;
        this.tierLabel = tierRules.label;
        this.smallMonsterCount = this.monsterTier === 'small' ? 3 + Math.floor(this.initializer.random() * 3) : 0;

        // Apply new values to existing engine
        this.engine.selectedMonster = this.selectedMonster;
        this.engine.severedTail = {
            available: false,
            carved: false,
            material: `${this.selectedMonster.nameKO}의 꼬리`,
            displayName: `${this.selectedMonster.nameKO} 꼬리`
        };
        this.engine.currentConsecutiveIndex = this.currentConsecutiveIndex;
        this.engine.selectedWeapons.forEach(hunter => { hunter.farcasterUsed = false; });
        this.engine.monsterTier = this.monsterTier;
        this.engine.monsterHp = baseHp;
        this.engine.monsterMaxHp = baseHp;
        this.engine.smallMonsterSwarm = this.monsterTier === 'small' && typeof HuntSmallMonsterSwarm !== 'undefined'
            ? new HuntSmallMonsterSwarm(this.smallMonsterCount, baseHp)
            : null;
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
        this.engine.monsterTrapUseCount = 0;
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
                type: 'visual', baseVolume: this.audioManager.huntVolume(0.315), loop: true
            });
            this.audioManager.battleBgmPromise = this.audioManager.battleBgm.play().catch(() => {
                const fallbackBgm = this.audioManager.getMonsterBgm(this.selectedMonster, { preferDedicated: false });
                this.audioManager.battleBgm.src = fallbackBgm;
                this.director.audioManager.applyNativeVolume(this.audioManager.battleBgm, {
                    type: 'visual', path: fallbackBgm, baseVolume: this.audioManager.huntVolume(0.315)
                });
                return this.audioManager.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        // Re-render Fighting UI header/monster showcase
        const actionLabel = (this.monsterTier === 'elder' || this.monsterTier === 'colossal') ? '토벌' : '수렵';
        const habitatLabel = this.audioManager.getSelectedHabitatLabel();
        const habitatSuffix = habitatLabel ? ` · 🗺️ ${habitatLabel}` : '';
        const hpLabelText = `👾 [연속 ${actionLabel} ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO}${habitatSuffix} [체력]`;
        const resumeLimitVal = this.config.getHuntConfig()?.timeLimit !== undefined ? this.config.getHuntConfig().timeLimit : 480;
        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP,
            timeLimit: resumeLimitVal,
            smallMonsterCount: this.smallMonsterCount
        });

        // Restore actual UI states for monster HP, timer, and hunter HP
        this.renderer.updateMonsterHpUI(this.engine.monsterHp, this.engine.monsterMaxHp);
        if (this.engine.smallMonsterSwarm) this.renderer.updateSmallMonsterSwarmUI(this.engine.smallMonsterSwarm.snapshot());
        this.renderer.updateTimerUI(this.engine.getRemainingSeconds());
        this.selectedWeapons.forEach(w => this.renderer.updateHpUI(w));
        this.renderer.updateCartUI(this.engine.cartCount);

        // Restore borders
        this.selectedWeapons.forEach(w => this.renderer.restoreBorder(w.index, w));

        // Restart Tick loop (Process through HuntEngine)
        this.fightInterval = this.timers.interval(() => {
            if (this.phase !== 'fighting') return;
            this.processFightTickSafely();
        }, 100);
    }

    endGame(container, isVictory, winner = null) {
        return HuntResultPresenter.show(this, container, isVictory, winner);
    }

    forceStopGame() {
        this.isActive = false;
        this.phase = 'results';
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
