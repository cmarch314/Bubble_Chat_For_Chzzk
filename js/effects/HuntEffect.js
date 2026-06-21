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
        this.victoryEmojiTimeouts = [];
        this.resolveGame = null;

        // Configuration
        this.SHOW_MONSTER_HP = true;

        this.renderer = new HuntRenderer();
        this.audioManager = new HuntAudioManager(director, this.config);
        this.initializer = new HuntInitializer();
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

        if (msgData.isStreamer && (msg === '!토벌 중단' || msg === '!중단' || msg === '!수렵 중단' || msg === '!토벌중단' || msg === '!수렵중단')) {
            this.forceStopGame();
            return true;
        }

        if (this.phase === 'voting') {
            // Mapping for Weapons and Personalities
            const PERSONALITY_MAP = {
                '공격적': 'offensive', '공격': 'offensive', '극공': 'offensive',
                '수비적': 'defensive', '수비': 'defensive', '방어적': 'defensive', '방어': 'defensive',
                '베테랑': 'veteran', '숙련자': 'veteran', '고수': 'veteran',
                '서포터': 'support', '서포트': 'support', '지원': 'support',
                '뉴비': 'newbie', '초보': 'newbie', '몬린이': 'newbie',
                '밸런스': 'normal', '평범': 'normal', '일반': 'normal', '평범한': 'normal', '노멀': 'normal', '밸런': 'normal'
            };

            const WEAPON_NAME_MAP = {
                '대검': 'great_sword',
                '태도': 'long_sword',
                '한손검': 'sword_shield', '손검': 'sword_shield',
                '쌍검': 'dual_blades', '쌍도': 'dual_blades',
                '해머': 'hammer', '망치': 'hammer',
                '수렵피리': 'hunting_horn', '피리': 'hunting_horn',
                '랜스': 'lance',
                '건랜스': 'gunlance', '건랜': 'gunlance',
                '슬래시액스': 'switch_axe', '슬액': 'switch_axe',
                '차지액스': 'charge_blade', '차액': 'charge_blade',
                '조충곤': 'insect_glaive', '충곤': 'insect_glaive',
                '라이트보건': 'light_bowgun', '라보': 'light_bowgun',
                '헤비보건': 'heavy_bowgun', '헤보': 'heavy_bowgun',
                '활': 'bow'
            };

            // Remove "참가" prefix if exists
            const cleaned = msg.replace(/^참가\s+/, '').trim();
            // Regex to capture "1", "!1", "1 해머", "1 공격적", "1 해머 공격적"
            const match = cleaned.match(/^!?([1-4])(?:\s+(.+))?$/);

            if (match) {
                const index = parseInt(match[1], 10) - 1;
                const remain = match[2] ? match[2].trim() : '';

                let chosenWeaponId = null;
                let chosenPersonality = null;

                if (remain) {
                    const tokens = remain.split(/\s+/);
                    for (const token of tokens) {
                        if (WEAPON_NAME_MAP[token]) {
                            chosenWeaponId = WEAPON_NAME_MAP[token];
                        } else if (PERSONALITY_MAP[token]) {
                            chosenPersonality = PERSONALITY_MAP[token];
                        }
                    }
                }

                // Subscriber check helper
                let isSub = msgData.isSubscriber || msgData.isSubscription || false;
                if (!isSub && msgData.badges && Array.isArray(msgData.badges)) {
                    isSub = msgData.badges.some(badge => {
                        const id = (badge.badgeId || "").toLowerCase();
                        return id.includes("subscription") || id.includes("subscriber") || id.includes("sub");
                    });
                }

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
                return false;
            }
        } else if (this.phase === 'fighting' || this.phase === 'ended') {
            const hunter = this.selectedWeapons.find(w => w.hunterName === msgData.nickname);
            if (hunter && msg) {
                this.renderer.spawnCombatChatBubble(hunter.index, msg);
                return false;
            }
        }
        return false;
    }

    startFight(container) {
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

        const actionLabel = this.monsterTier === 'elder' ? '토벌' : '수렵';
        const hpLabelText = this.consecutiveTotal > 1 
            ? `👾 [연속 ${actionLabel} ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`
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
        this.renderer.updateTimerUI(0);

        // Tick loop (Process through HuntEngine)
        this.fightInterval = setInterval(() => {
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
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 4000);
    }

    clearAllTimers() {
        if (this.gameTimer) { clearInterval(this.gameTimer); this.gameTimer = null; }
        if (this.fightInterval) { clearInterval(this.fightInterval); this.fightInterval = null; }
        if (this.victoryEmojiTimeouts && this.victoryEmojiTimeouts.length > 0) {
            this.victoryEmojiTimeouts.forEach(t => clearTimeout(t));
            this.victoryEmojiTimeouts = [];
        }
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
            this.tierLabel = "고룡종";
        }

        // Apply new values to existing engine
        this.engine.selectedMonster = this.selectedMonster;
        this.engine.currentConsecutiveIndex = this.currentConsecutiveIndex;
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

        if (this.selectedMonster.id.includes('valstrax')) {
            this.engine.valstraxChargeCount = 0;
            this.engine.valstraxChargeDmg = 0;
            this.engine.valstraxChargeTimer = 0;
            this.engine.valstraxEnrageTimer = 0;
            this.engine.valstraxFlyingTimer = 0;
        }

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
        const actionLabel = this.monsterTier === 'elder' ? '토벌' : '수렵';
        const hpLabelText = `👾 [연속 ${actionLabel} ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`;
        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP
        });

        // Restore actual UI states for monster HP, timer, and hunter HP
        this.renderer.updateMonsterHpUI(this.engine.monsterHp, this.engine.monsterMaxHp);
        this.renderer.updateTimerUI(this.engine.battleTime);
        this.selectedWeapons.forEach(w => this.renderer.updateHpUI(w));
        this.renderer.updateCartUI(this.engine.cartCount);

        // Restore borders
        this.selectedWeapons.forEach(w => this.renderer.restoreBorder(w.index, w));

        // Restart Tick loop (Process through HuntEngine)
        this.fightInterval = setInterval(() => {
            if (this.phase !== 'fighting') return;
            this.engine.processTick();
        }, 100);
    }

    endGame(container, isVictory, winner = null) {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;

        this.clearAllTimers();

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
            const showcase = card.querySelector('#monster-showcase-panel');
            if (showcase) {
                showcase.style.display = 'none';
            }
            if (topPanel) {
                topPanel.innerHTML = `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        margin: 35px 0 35px;
                        box-sizing: border-box;
                    ">
                        <div class="quest-stamp-container quest-complete-stamp">
                            <svg class="quest-svg-border" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
                                <!-- Plaque Backplate -->
                                <path d="M 45 20 L 555 20 C 560 20, 565 25, 565 30 L 565 120 C 565 125, 560 130, 555 130 L 45 130 C 40 130, 35 125, 35 120 L 35 30 C 35 25, 40 20, 45 20 Z" fill="currentColor" fill-opacity="0.05" />
                                
                                <!-- Left/Right Plaque Caps -->
                                <line x1="45" y1="35" x2="45" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />
                                <line x1="555" y1="35" x2="555" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />

                                <!-- TOP BORDER (y=30) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 18 L 77 30 L 65 42 L 53 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 30 L 77 30 M 65 18 L 65 42 M 59 24 L 71 36 M 71 24 L 59 36" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 27 L 265 27 M 85 33 L 265 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw -->
                                <path d="M 300 18 C 304 22, 306 28, 301 42 C 297 28, 296 22, 300 18 Z" fill="currentColor" />
                                <path d="M 288 20 C 291 23, 290 29, 283 39 C 283 29, 285 23, 288 20 Z" fill="currentColor" />
                                <path d="M 312 20 C 309 23, 310 29, 317 39 C 317 29, 315 23, 312 20 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 27 L 515 27 M 335 33 L 515 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 18 L 547 30 L 535 42 L 523 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 30 L 547 30 M 535 18 L 535 42 M 529 24 L 541 36 M 541 24 L 529 36" stroke="currentColor" stroke-width="1.2" />


                                <!-- BOTTOM BORDER (y=120) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 108 L 77 120 L 65 132 L 53 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 120 L 77 120 M 65 108 L 65 132 M 59 114 L 71 126 M 71 114 L 59 126" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 117 L 265 117 M 85 123 L 265 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw (mirrored vertically to point up) -->
                                <path d="M 300 132 C 304 128, 306 122, 301 108 C 297 122, 296 128, 300 132 Z" fill="currentColor" />
                                <path d="M 288 130 C 291 127, 290 121, 283 111 C 283 121, 285 127, 288 130 Z" fill="currentColor" />
                                <path d="M 312 130 C 309 127, 310 121, 317 111 C 317 121, 315 127, 312 130 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 117 L 515 117 M 335 123 L 515 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 108 L 547 120 L 535 132 L 523 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 120 L 547 120 M 535 108 L 535 132 M 529 114 L 541 126 M 541 114 L 529 126" stroke="currentColor" stroke-width="1.2" />
                            </svg>
                            <div class="quest-gothic-text">QUEST COMPLETE</div>
                        </div>
                    </div>
                `;
            }

            const playCarveSound = (materialName) => {
                if (materialName.includes('홍옥') || materialName.includes('보옥') || materialName.includes('투기모피') || materialName.includes('대꼬리') || materialName.includes('재생가시')) {
                    this.audioManager.playMHAudioFile('Unified_SFX/MH - Item Found (rarest).mp3', null, 0.5);
                } else if (materialName.includes('그레이트') || materialName.includes('비약') || materialName.includes('귀인약') || materialName.includes('가루')) {
                    this.audioManager.playMHAudioFile('Unified_SFX/MH - Item Found (rare).mp3', null, 0.5);
                } else {
                    this.audioManager.playMHAudioFile('Unified_SFX/MH - Item Found.mp3', null, 0.5);
                }
            };
            
            // 기절한 헌터들은 기절 상태 유지, 생존자들은 3회 갈무리 슥슥 시작
            this.victoryEmojiTimeouts = [];
            this.selectedWeapons.forEach((w, i) => {
                const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                if (!weaponCard) return;

                if (w.hp > 0) {
                    w.isCarving = true; // 갈무리(채집) 상태 활성화
                    const tag = card.querySelector(`#status-tag-${w.index}`);
                    
                    if (w.index === winner.index) {
                        weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                        void weaponCard.offsetWidth;
                        weaponCard.classList.add('victory-jump');
                        if (tag) {
                            tag.textContent = '🏆 MVP 🏆';
                            tag.className = 'game-hunt-status-tag active';
                        }
                    } else {
                        weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                        void weaponCard.offsetWidth;
                        weaponCard.classList.add('victory-bounce');
                        if (tag) {
                            tag.textContent = '⚔️ 생존';
                            tag.className = 'game-hunt-status-tag active';
                        }
                    }

                    // Stagger delay based on hunter index in selectedWeapons array (0, 1.2s, 2.4s, 3.6s)
                    const staggerDelay = i * 1200;

                    const material1 = this.getMonsterMaterialName(this.selectedMonster.nameKO, w.personality);
                    const material2 = this.getMonsterMaterialName(this.selectedMonster.nameKO, w.personality);
                    const material3 = this.getMonsterMaterialName(this.selectedMonster.nameKO, w.personality);

                    // 1차 갈무리 (staggerDelay): 둥근 감정표현 버블로 칼질 이모지 띄우기
                    const t1 = setTimeout(() => {
                        if (this.phase === 'ended' && w.hp > 0) {
                            this.renderer.spawnVictoryEmoji(w.index, '🔪');
                        }
                    }, staggerDelay);
                    this.victoryEmojiTimeouts.push(t1);

                    // 2차 갈무리 (staggerDelay + 2000): 칼질 이모지 버블 팝 & 1차 소재 사운드 & 소재 메시지 박스 표현
                    const t2 = setTimeout(() => {
                        if (this.phase === 'ended' && w.hp > 0) {
                            this.renderer.spawnVictoryEmoji(w.index, '🔪');
                            playCarveSound(material1);
                            this.renderer.spawnMaterialBox(w.index, material1);
                            this.addCombatLog(`🍖 [갈무리] ${w.hunterName}이(가) [${material1}]을(를) 획득했습니다.`);
                        }
                    }, staggerDelay + 2000);
                    this.victoryEmojiTimeouts.push(t2);

                    // 3차 갈무리 (staggerDelay + 4000): 칼질 이모지 버블 팝 & 2차 소재 사운드 & 소재 메시지 박스 표현
                    const t3 = setTimeout(() => {
                        if (this.phase === 'ended' && w.hp > 0) {
                            this.renderer.spawnVictoryEmoji(w.index, '🔪');
                            playCarveSound(material2);
                            this.renderer.spawnMaterialBox(w.index, material2);
                            this.addCombatLog(`🍖 [갈무리] ${w.hunterName}이(가) [${material2}]을(를) 획득했습니다.`);
                        }
                    }, staggerDelay + 4000);
                    this.victoryEmojiTimeouts.push(t3);

                    // 갈무리 완료 (staggerDelay + 6000): 갈무리 상태 해제 & 3차 소재 사운드 & 획득 완료 이모지 버블 & 소재 메시지 박스 표현
                    const t4 = setTimeout(() => {
                        if (this.phase === 'ended' && w.hp > 0) {
                            w.isCarving = false; // 갈무리 완수! 감정표현 차단 해제!
                            playCarveSound(material3);
                            this.renderer.spawnMaterialBox(w.index, material3);
                            this.addCombatLog(`🍖 [갈무리] ${w.hunterName}이(가) [${material3}]을(를) 획득했습니다.`);
                            this.renderer.spawnVictoryEmoji(w.index, '💎');
                        }
                    }, staggerDelay + 6000);
                    this.victoryEmojiTimeouts.push(t4);

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
            });

            // 생존자 Victory 감정표현 루프 시작 (각 헌터마다 4~6초 주기로 반복)
            const livingHunters = this.selectedWeapons.filter(w => w.hp > 0);
            if (livingHunters.length > 0) {
                livingHunters.forEach((hunter, idx) => {
                    const originalIdx = this.selectedWeapons.findIndex(w => w.index === hunter.index);
                    const staggerDelay = originalIdx >= 0 ? originalIdx * 1200 : idx * 1200;

                    const runHunterEmojiLoop = () => {
                        if (this.phase !== 'ended') return;
                        
                        // 채집(갈무리) 중에는 감정표현 금지!
                        if (hunter.isCarving || hunter.isGathering) {
                            const delay = 1000; // 1초 뒤에 다시 시도
                            const timeoutId = setTimeout(runHunterEmojiLoop, delay);
                            this.victoryEmojiTimeouts.push(timeoutId);
                            return;
                        }

                        const personality = hunter.personality || 'normal';
                        const pool = this.victoryEmojiMap[personality] || this.victoryEmojiMap.normal;
                        const randomEmoji = pool[Math.floor(Math.random() * pool.length)];

                        this.renderer.spawnVictoryEmoji(hunter.index, randomEmoji);

                        const delay = 4000 + Math.random() * 2000;
                        const timeoutId = setTimeout(runHunterEmojiLoop, delay);
                        this.victoryEmojiTimeouts.push(timeoutId);
                    };

                    // 갈무리가 6초 동안 수행되므로, 최초 Stagger 지연을 staggerDelay + 6.5s ~ 8.5s로 주어 갈무리 직후부터 감정표현 루프가 돌게 만듭니다!
                    const initialDelay = staggerDelay + 6500 + Math.random() * 2000;
                    const initialTimeoutId = setTimeout(runHunterEmojiLoop, initialDelay);
                    this.victoryEmojiTimeouts.push(initialTimeoutId);
                });
            }
        } else {
            const showcase = card.querySelector('#monster-showcase-panel');
            if (showcase) {
                showcase.style.display = 'none';
            }
            if (topPanel) {
                const actionLabel = this.monsterTier === 'elder' ? '토벌' : '수렵';
                topPanel.innerHTML = `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        margin: 35px 0 35px;
                        box-sizing: border-box;
                    ">
                        <div class="quest-stamp-container quest-failed-stamp">
                            <svg class="quest-svg-border" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
                                <!-- Plaque Backplate -->
                                <path d="M 45 20 L 555 20 C 560 20, 565 25, 565 30 L 565 120 C 565 125, 560 130, 555 130 L 45 130 C 40 130, 35 125, 35 120 L 35 30 C 35 25, 40 20, 45 20 Z" fill="currentColor" fill-opacity="0.05" />
                                
                                <!-- Left/Right Plaque Caps -->
                                <line x1="45" y1="35" x2="45" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />
                                <line x1="555" y1="35" x2="555" y2="115" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3" />

                                <!-- TOP BORDER (y=30) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 18 L 77 30 L 65 42 L 53 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 30 L 77 30 M 65 18 L 65 42 M 59 24 L 71 36 M 71 24 L 59 36" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 27 L 265 27 M 85 33 L 265 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw -->
                                <path d="M 300 18 C 304 22, 306 28, 301 42 C 297 28, 296 22, 300 18 Z" fill="currentColor" />
                                <path d="M 288 20 C 291 23, 290 29, 283 39 C 283 29, 285 23, 288 20 Z" fill="currentColor" />
                                <path d="M 312 20 C 309 23, 310 29, 317 39 C 317 29, 315 23, 312 20 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 27 L 515 27 M 335 33 L 515 33" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 18 L 547 30 L 535 42 L 523 30 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 30 L 547 30 M 535 18 L 535 42 M 529 24 L 541 36 M 541 24 L 529 36" stroke="currentColor" stroke-width="1.2" />


                                <!-- BOTTOM BORDER (y=120) -->
                                <!-- Left: Diamond sliced with X -->
                                <path d="M 65 108 L 77 120 L 65 132 L 53 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 53 120 L 77 120 M 65 108 L 65 132 M 59 114 L 71 126 M 71 114 L 59 126" stroke="currentColor" stroke-width="1.2" />
                                
                                <!-- Double lines -->
                                <path d="M 85 117 L 265 117 M 85 123 L 265 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Center: Claw (mirrored vertically to point up) -->
                                <path d="M 300 132 C 304 128, 306 122, 301 108 C 297 122, 296 128, 300 132 Z" fill="currentColor" />
                                <path d="M 288 130 C 291 127, 290 121, 283 111 C 283 121, 285 127, 288 130 Z" fill="currentColor" />
                                <path d="M 312 130 C 309 127, 310 121, 317 111 C 317 121, 315 127, 312 130 Z" fill="currentColor" />
                                
                                <!-- Double lines -->
                                <path d="M 335 117 L 515 117 M 335 123 L 515 123" stroke="currentColor" stroke-width="2" />
                                
                                <!-- Right: Diamond sliced with X -->
                                <path d="M 535 108 L 547 120 L 535 132 L 523 120 Z" fill="none" stroke="currentColor" stroke-width="2" />
                                <path d="M 523 120 L 547 120 M 535 108 L 535 132 M 529 114 L 541 126 M 541 114 L 529 126" stroke="currentColor" stroke-width="1.2" />
                            </svg>
                            <div class="quest-gothic-text">QUEST FAILED</div>
                        </div>
                        <div style="font-size:1.4rem; color:#ccc; margin-top: 4px; text-align: center; line-height: 1.4;">
                            3번의 수레 탑승 누적으로 ${actionLabel} 퀘스트에 실패했습니다.<br>
                            <span style="font-size:1.25rem; color:#888;">${this.selectedMonster.nameKO}은(는) 유유히 떠났습니다.</span>
                        </div>
                    </div>
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
                        weaponCard.classList.add('dead');
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
                document.body.classList.remove('in-hunt');
                this.audioManager.stopBgms();
                if (this.resolveGame) {
                    this.resolveGame();
                    this.resolveGame = null;
                }
            }, 500);
        }, 30000);
    }

    forceStopGame() {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;

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
