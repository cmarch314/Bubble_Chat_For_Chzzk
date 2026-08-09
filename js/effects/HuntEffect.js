const HuntMonsterReleaseRules = typeof HuntMonsterReleasePolicy !== 'undefined'
    ? HuntMonsterReleasePolicy
    : (typeof require === 'function' ? require('../js/effects/hunt/HuntMonsterReleasePolicy.js') : null);

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
        this.renderer.onMonsterStrideAudio = monster =>
            this.audioManager.playMonsterAction(monster, 'charge_stride_step');
        this.renderer.onMonsterProjectileLaunchAudio = (monster, pattern = {}) => {
            const context = {
                patternId: pattern.id,
                patternName: pattern.name,
                patternType: pattern.type,
                patternTags: pattern.tags,
                patternDelivery: pattern.delivery
            };
            if (this.audioManager.playMonsterAction(monster, 'projectile_launch', context)) return;
            this.audioManager.playMonsterAction(monster, 'telegraph', context);
        };
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
        this.journeyWeaponGrowth = typeof HuntJourneyWeaponGrowth !== 'undefined'
            ? new HuntJourneyWeaponGrowth(this.initializer.weaponInstanceCatalog) : null;
        this.journeyEventCatalog = typeof HuntJourneyEventCatalog !== 'undefined' ? HuntJourneyEventCatalog.createDefault() : null;
        if (this.journeyEventCatalog && typeof HuntJourneyCatalog !== 'undefined') {
            HuntJourneyCatalog.validateEventCatalog(this.journeyEventCatalog);
        }
        this.participantParser = new HuntParticipantParser();
        this.roster = new this.LobbyRoster(this.random);
        this.loadoutAdvisor = new LoadoutAdvisor(this.initializer.WEAPONS);
        this.profileClient = typeof HuntProfileClient !== 'undefined' ? new HuntProfileClient() : null;
        this.runClient = typeof HuntRunClient !== 'undefined' ? new HuntRunClient() : null;
        this.runDirector = null;
        this.journeyFlow = typeof HuntJourneyFlowController !== 'undefined' ? new HuntJourneyFlowController(this) : null;
        this.journeyTravelShownNode = null;
        this.journeyTravelResolve = null;
        this.journeyTravelActive = false;
        this.chatTactics = new HuntChatTactics();
        this.engine = null;

        // Static emoji mapping for victory emotions (purely emotion/gesture based, no items)
        this.victoryEmojiMap = {
            veteran: ['😎', '👍', '😄', '✌️', '💪'],
            support: ['🥰', '💚', '😍', '😊', '🥳'],
            newbie: ['🤩', '😂', '🥳', '🙌', '💛'],
            offensive: ['😼', '😈', '😎', '👊', '✊'],
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

    shouldPlayBaseChatAudio(msgData = {}) {
        if (!this.isActive || !['loadout', 'fighting', 'results'].includes(this.phase)) return false;
        const message = String(msgData.message || '').trim();
        if (!message || /^[!！]/.test(message)) return false;
        const uid = msgData.uid || msgData.userIdHash || null;
        const nickname = String(msgData.nickname || '').normalize('NFKC').trim().toLowerCase();
        return this.selectedWeapons.some(hunter => !hunter.isNpc && (
            (uid && hunter.participantUid === uid)
            || String(hunter.hunterName || '').normalize('NFKC').trim().toLowerCase() === nickname
        ));
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
        let monsters = HuntMonsterReleaseRules.filter(this.initializer.fallbackMonsters);
        try {
            const response = await fetch('img/monsters/monsters.json');
            if (response.ok) {
                const list = await response.json();
                if (list && list.length > 0) {
                    monsters = HuntMonsterReleaseRules.filter(list);
                }
            }
        } catch (e) {
            console.warn("Failed to load monsters.json, using fallback monsters", e);
        }
        if (!monsters.length) {
            this.forceStopGame();
            throw new Error('No reviewed monsters are available in the hunt catalog');
        }

        const msgText = context ? context.message : "";
        this.monsters = monsters;
        const parsed = this.initializer.parseCommand(msgText, monsters);
        if (parsed.requestedMonsterMatched === false) {
            this.forceStopGame();
            throw new Error(`Requested monster is not in the reviewed hunt roster: ${parsed.requestedMonsterName}`);
        }

        this.huntMode = parsed.huntMode;
        this.journeyResultCommitted = false;
        if (this.huntMode === 'journey') {
            const coverage = HuntMonsterReleaseRules.journeyCoverage(
                monsters,
                monster => this.initializer.getMonsterTier(monster)
            );
            if (!coverage.ready) {
                this.forceStopGame();
                throw new Error(`Journey is locked until reviewed monster tiers are complete: ${coverage.missing.join(', ')}`);
            }
        }
        if (this.huntMode === 'journey' && this.runClient && typeof HuntRunDirector !== 'undefined') {
            const channelKey = this.config?.channelId || globalThis.CHZZK_CHANNEL_ID || 'bubblechat-local';
            this.runDirector = new HuntRunDirector({ client: this.runClient, channelKey });
            await this.runDirector.loadOrCreate(monsters, monster => this.initializer.getMonsterTier(monster), Date.now());
            await this.journeyFlow.prepareCurrent(monsters);
            if (!this.isActive) return;
            parsed.selectedMonster = this.selectedMonster;
            parsed.consecutiveQueue = [this.selectedMonster];
            parsed.consecutiveTotal = 1;
        } else {
            this.runDirector = null;
        }
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
        const journeyOpening = this.huntMode === 'journey'
            && Number(this.runDirector?.state?.nodeIndex || 0) === 0
            && !(this.runDirector?.state?.party || []).length;
        const isElder = (currentTier === 'elder');
        let voteTitle = isElder ? "⚔️ 집회소 고룡 토벌 수주 ⚔️" : "⚔️ 집회소 수렵 퀘스트 수주 ⚔️";
        let voteSubtitle = "채팅에 !참가를 입력하세요. 모집 종료 후 4명의 헌터를 선발합니다.";
        const modeCommand = HuntCommandCatalog.mode(this.huntMode);
        if (modeCommand.lobbyTitle) {
            voteTitle = modeCommand.lobbyTitle;
            voteSubtitle = modeCommand.lobbySubtitle;
        }
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
            monsterHabitatId: this.audioManager.lastBgmResolution?.habitatId || 'arena',
            questTier: currentTier,
            journey: this.huntMode === 'journey' ? {
                stage: Number(this.runDirector?.state?.stageIndex || 0) + 1,
                node: Number(this.runDirector?.state?.nodeIndex || 0) + 1,
                carts: this.runDirector?.state?.carts ?? 3,
                zenny: this.runDirector?.state?.zenny ?? 0,
                lockLimit: this.runDirector?.state?.lockLimit ?? 1,
                rerolls: this.runDirector?.state?.rerolls ?? 0,
                lastEvent: this.runDirector?.state?.eventLog?.at(-1)?.summary || '',
                totalNodes: HuntRunState.NODE_COUNT
            } : null,
            journeyChoices: this.journeyVote ? this.journeyCombatChoices : [],
            journeyOpening,
            journeyReward: this.huntMode === 'journey'
                ? HuntJourneyRewardCatalog.coinFor(
                    this.runDirector?.currentNode()?.tier || currentTier,
                    Boolean(this.runDirector?.currentNode()?.isBoss)
                )
                : 0,
            participantCount: 0,
            participants: []
        });

        const resumedParty = this.huntMode === 'journey' ? (this.runDirector?.state?.party || []) : [];
        if (resumedParty.length) this.renderer.updateRecruitmentUI(resumedParty);
        let timeLeft = this.journeyVote ? HuntJourneyVoteRuntime.VOTE_DURATION_SECONDS : 30;
        if (resumedParty.length && !this.journeyVote) timeLeft = 15;
        const questBoardTimerLabel = this.journeyVote ? '투표 마감'
            : (this.huntMode === 'journey' && !journeyOpening ? '출발 준비' : '모집 마감');
        this.renderer.updatePhaseTimer(timeLeft, questBoardTimerLabel);
        return new Promise(resolve => {
            this.resolveGame = resolve;
            
            this.gameTimer = this.timers.interval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    this.timers.clear(this.gameTimer);
                    this.gameTimer = null;
                    this.beginLoadout();
                } else {
                    this.renderer.updatePhaseTimer(timeLeft, questBoardTimerLabel);
                }
            }, 1000);
        });
    }

    prepareJourneyCombatNode(node, monsters) {
        const candidateIds = node?.monsterChoices?.length ? node.monsterChoices : [node?.monsterId];
        const monster = monsters.find(item => item.id === (node.monsterId || candidateIds[0]));
        if (!monster) throw new Error('The current journey combat node has no valid monster');
        this.journeyVote = HuntJourneyVoteRuntime.shouldOpenCombatVote(this.runDirector.state, node)
            ? new HuntJourneyVoteRuntime(this.runDirector.state.seed ^ this.runDirector.state.nodeIndex)
            : null;
        this.journeyVoteFinalized = false;
        this.journeyCombatChoices = candidateIds.map(id => monsters.find(item => item.id === id)).filter(Boolean);
        this.selectedMonster = monster;
        this.consecutiveQueue = [monster];
    }

    joinNpcHunterDuringLoadout(msgData = {}) {
        if (this.phase !== 'loadout' || !this.participantParser.parseRecruitment(msgData.message || '')) return false;
        const nickname = String(msgData.nickname || '').trim();
        const uid = msgData.uid || msgData.userIdHash || null;
        if (!nickname) return true;
        const normalize = value => this.LobbyRoster.normalizeNickname
            ? this.LobbyRoster.normalizeNickname(value)
            : String(value || '').trim().toLowerCase();
        const normalized = normalize(nickname);
        const alreadyJoined = this.selectedWeapons.find(hunter => !hunter.isNpc && (
            (uid && hunter.participantUid === uid) || normalize(hunter.hunterName) === normalized
        ));
        if (alreadyJoined) {
            this.renderer.spawnCombatChatBubble(alreadyJoined.index, '✅ 이미 참가 중');
            return true;
        }

        const npc = this.selectedWeapons.find(hunter => hunter.isNpc);
        if (!npc) return true;
        const previousName = npc.hunterName;
        delete this.bets[previousName];
        npc.hunterName = nickname;
        npc.hunterColor = msgData.color || '#ffffff';
        npc.participantUid = uid;
        npc.isStreamer = this.LobbyRoster.isStreamerParticipant
            ? this.LobbyRoster.isStreamerParticipant(msgData, nickname)
            : Boolean(msgData.isStreamer);
        npc.isNpc = false;
        npc.loadoutReady = false;
        npc.perkRerolled = false;
        npc.perkRerollCount = 0;
        this.bets[nickname] = {
            index: npc.index,
            color: npc.hunterColor,
            participantUid: npc.participantUid,
            isStreamer: npc.isStreamer,
            isNpc: false
        };
        this.roster.register?.(msgData);
        this.participants = this.roster.list?.() || this.participants;
        this.renderer.updateLoadoutCard(npc);
        this.renderer.updateLoadoutJoinAvailability(this.selectedWeapons.some(hunter => hunter.isNpc));
        this.renderer.spawnCombatChatBubble(npc.index, '👤 AI 교대 · 장비 선택');

        const initialPerkSignature = (npc.perks || []).map(perk => perk.id).join('|');
        const initialLockedPerkId = npc.lockedPerkId || null;
        if (this.profileClient) {
            this.profileClient.load(npc).then(profile => {
                const stillOwnsSlot = this.phase === 'loadout'
                    && !npc.isNpc
                    && ((uid && npc.participantUid === uid) || normalize(npc.hunterName) === normalized);
                const perksUnchanged = (npc.perks || []).map(perk => perk.id).join('|') === initialPerkSignature
                    && (npc.lockedPerkId || null) === initialLockedPerkId;
                if (!stillOwnsSlot || npc.loadoutReady || !perksUnchanged || !profile) return;
                if (this.initializer.applyPersistentProfile(npc, profile)) this.renderer.updateLoadoutCard(npc);
            }).catch(() => {});
        }
        if (this.huntMode === 'journey' && this.runDirector) {
            this.runDirector.checkpoint({ party: HuntRunPartyAdapter.snapshot(this.selectedWeapons) })
                .catch(error => console.warn('[HuntJourney] loadout join checkpoint failed', error));
        }
        return true;
    }

    joinNpcHunterDuringCombat(msgData = {}) {
        if (this.phase !== 'fighting' || !this.participantParser.parseRecruitment(msgData.message || '')) return false;
        const nickname = String(msgData.nickname || '').trim();
        const uid = msgData.uid || msgData.userIdHash || null;
        if (!nickname) return true;
        const normalized = this.LobbyRoster.normalizeNickname
            ? this.LobbyRoster.normalizeNickname(nickname)
            : nickname.toLowerCase();
        const alreadyJoined = this.selectedWeapons.some(hunter => !hunter.isNpc && (
            (uid && hunter.participantUid === uid)
            || (this.LobbyRoster.normalizeNickname
                ? this.LobbyRoster.normalizeNickname(hunter.hunterName) === normalized
                : String(hunter.hunterName || '').toLowerCase() === normalized)
        ));
        if (alreadyJoined) {
            const hunter = this.selectedWeapons.find(item => !item.isNpc && (
                (uid && item.participantUid === uid)
                || String(item.hunterName || '').trim().toLowerCase() === nickname.toLowerCase()
            ));
            if (hunter) this.renderer.spawnCombatChatBubble(hunter.index, '✅ 이미 참가 중');
            return true;
        }
        const npc = this.selectedWeapons.find(hunter => hunter.isNpc && hunter.status === 'alive')
            || this.selectedWeapons.find(hunter => hunter.isNpc);
        if (!npc) {
            this.engine?.addLog(`👥 [참가 대기] ${nickname} · 교대 가능한 AI 헌터 자리가 없습니다.`, '#a9b8c7');
            return true;
        }

        const previousName = npc.hunterName;
        delete this.bets[previousName];
        npc.hunterName = nickname;
        npc.hunterColor = msgData.color || '#ffffff';
        npc.participantUid = uid;
        npc.isStreamer = this.LobbyRoster.isStreamerParticipant
            ? this.LobbyRoster.isStreamerParticipant(msgData, nickname)
            : Boolean(msgData.isStreamer);
        npc.isNpc = false;
        npc.loadoutReady = true;
        this.bets[nickname] = {
            index: npc.index,
            color: npc.hunterColor,
            participantUid: npc.participantUid,
            isStreamer: npc.isStreamer,
            isNpc: false
        };
        this.renderer.updateCombatHunterIdentity(npc, this.selectedWeapons.some(hunter => hunter.isNpc));
        this.renderer.spawnCombatChatBubble(npc.index,
            npc.status === 'alive' ? '🟢 AI 교대 참가!' : '⛺ 교대 참가 · 복귀 대기');
        this.engine?.addLog(`👤 [난입 참가] ${nickname}이(가) ${previousName}의 자리를 이어받았습니다!`, npc.hunterColor);
        if (this.huntMode === 'journey' && this.runDirector) {
            this.runDirector.checkpoint({ party: HuntRunPartyAdapter.snapshot(this.selectedWeapons) })
                .catch(error => console.warn('[HuntJourney] hot-join checkpoint failed', error));
        }
        return true;
    }

    async showJourneyTravelMap(node) {
        if (this.huntMode !== 'journey' || !this.runDirector?.state || !node) return;
        const nodeIndex = Number(this.runDirector.state.nodeIndex || 0);
        if (this.journeyTravelShownNode === nodeIndex) return;
        this.journeyTravelShownNode = nodeIndex;
        this.journeyTravelActive = true;
        const monstersById = new Map((this.monsters || []).map(monster => [monster.id, monster]));
        const eventLog = new Map((this.runDirector.state.eventLog || []).map(entry => [entry.nodeId, entry.summary]));
        const nodes = this.runDirector.state.nodes.map((entry, index) => {
            const monsterId = entry.monsterId || entry.monsterChoices?.[0];
            const monster = monstersById.get(monsterId);
            return {
                ...entry,
                index,
                label: entry.type === 'event'
                    ? (eventLog.get(entry.id) || '랜덤 이벤트')
                    : (monster?.nameKO || (entry.isBoss ? '스테이지 보스' : '사냥 후보'))
            };
        });
        const travelDuration = HuntJourneyFlowController.TRAVEL_DURATION_SECONDS;
        this.renderer.renderJourneyTravelMap({
            nodes,
            currentIndex: nodeIndex,
            stage: Number(node.stageIndex || 0) + 1,
            carts: this.runDirector.state.carts,
            zenny: this.runDirector.state.zenny,
            duration: travelDuration
        });
        await new Promise(resolve => {
            this.journeyTravelResolve = resolve;
            let timeLeft = travelDuration;
            this.gameTimer = this.timers.interval(() => {
                timeLeft--;
                this.renderer.updateJourneyTravelTimer(timeLeft);
                if (timeLeft <= 0) {
                    this.timers.clear(this.gameTimer);
                    this.gameTimer = null;
                    this.journeyTravelResolve = null;
                    resolve();
                }
            }, 1000);
        });
        this.journeyTravelActive = false;
    }

    handleChat(msgData) {
        if (!this.isActive) return false;
        const msg = (msgData.message || "").trim();

        if (msgData.isStreamer && HuntCommandCatalog.isStop(msg)) {
            this.forceStopGame();
            return true;
        }
        if (this.journeyTravelActive) return false;

        if (this.phase === 'quest_board') {
            if (this.journeyUpgradeVote) {
                const voteIndex = HuntJourneyVoteRuntime.parse(msg);
                if (voteIndex === null) return false;
                const memberIndex = (this.runDirector?.state?.party || []).findIndex(item => item.nickname === msgData.nickname && !item.isNpc);
                const choices = this.journeyUpgradeVote.choices[memberIndex] || [];
                if (memberIndex >= 0 && voteIndex < choices.length) {
                    this.journeyUpgradeVote.votes.set(memberIndex, voteIndex);
                    this.renderer.updateJourneyUpgradeVoteUI(memberIndex, voteIndex);
                    const pendingHumans = (this.runDirector?.state?.party || [])
                        .map((member, index) => ({ member, index }))
                        .filter(({ member, index }) => !member.isNpc && (this.journeyUpgradeVote.choices[index] || []).length);
                    if (pendingHumans.every(({ index }) => this.journeyUpgradeVote.votes.has(index))) {
                        this.finishJourneyTimedVote();
                    }
                }
                return true;
            }
            if (this.journeyEventVote) {
                const voteIndex = HuntJourneyVoteRuntime.parse(msg);
                if (voteIndex === null) return false;
                const member = (this.runDirector?.state?.party || []).find(item => item.nickname === msgData.nickname && !item.isNpc);
                if (!member) return true;
                const voterKey = member.uid || member.nickname;
                const choiceCount = Number(this.journeyEventVote.choiceCount || this.journeyEventVote.node.eventChoices.length);
                if (this.journeyEventVote.runtime.cast(voterKey, voteIndex, choiceCount)) {
                    this.renderer.updateJourneyEventVoteUI(this.journeyEventVote.runtime.tally(choiceCount));
                    if (HuntJourneyVoteRuntime.hasAllEligibleVotes(this.runDirector?.state, this.journeyEventVote.runtime)) {
                        this.finishJourneyTimedVote();
                    }
                }
                return true;
            }
            const hasJourneyParty = this.huntMode === 'journey' && (this.runDirector?.state?.party || []).length > 0;
            if (!hasJourneyParty && this.participantParser.parseRecruitment(msg)) {
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
            const voteIndex = this.journeyVote ? HuntJourneyVoteRuntime.parse(msg) : null;
            if (voteIndex !== null) {
                const participant = this.roster.list().find(item => item.nickname === msgData.nickname)
                    || (this.runDirector?.state?.party || []).find(item => item.nickname === msgData.nickname && !item.isNpc);
                if (!participant) return true;
                const voterKey = participant.uid || participant.nickname;
                if (this.journeyVote.cast(voterKey, voteIndex, this.journeyCombatChoices.length)) {
                    this.renderer.updateJourneyVoteUI(this.journeyVote.tally(this.journeyCombatChoices.length));
                    if (!this.journeyVoteFinalized
                        && HuntJourneyVoteRuntime.hasAllEligibleVotes(this.runDirector?.state, this.journeyVote)) {
                        this.journeyVoteFinalized = true;
                        if (this.gameTimer) this.timers.clear(this.gameTimer);
                        this.gameTimer = null;
                        this.beginLoadout();
                    }
                }
                return true;
            }
        } else if (this.phase === 'loadout') {
            if (this.joinNpcHunterDuringLoadout(msgData)) return true;
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
            const perkLock = hunter ? this.participantParser.parsePerkLock(msg) : null;
            const perkUnlock = hunter ? this.participantParser.parsePerkUnlock(msg) : null;
            if (hunter && perkUnlock) {
                if (hunter.loadoutReady) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔒 준비됨');
                    return true;
                }
                if (!hunter.lockedPerkId) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔓 0/1');
                    return true;
                }
                const selectedPerk = (hunter.perks || [])[perkUnlock.perkIndex];
                if (!selectedPerk || selectedPerk.id !== hunter.lockedPerkId) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔓 잠긴 번호 확인');
                    return true;
                }
                hunter.lockedPerkId = null;
                hunter.perkModifiers = HuntPerkCatalog.aggregate(hunter.perks);
                this.profileClient?.scheduleSave(hunter);
                this.renderer.updateLoadoutCard(hunter);
                this.renderer.spawnCombatChatBubble(hunter.index, `🔓 ${selectedPerk.name}`);
                return true;
            }
            if (hunter && perkLock) {
                if (hunter.loadoutReady) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔒 준비됨');
                    return true;
                }
                if (hunter.lockedPerkId) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔒 1/1');
                    return true;
                }
                const selectedPerk = (hunter.perks || [])[perkLock.perkIndex];
                if (!selectedPerk) {
                    this.renderer.spawnCombatChatBubble(hunter.index, '🔒 번호 확인');
                    return true;
                }
                hunter.lockedPerkId = selectedPerk.id;
                hunter.perks = [selectedPerk, ...hunter.perks.filter(perk => perk.id !== selectedPerk.id)];
                hunter.perkModifiers = HuntPerkCatalog.aggregate(hunter.perks);
                this.profileClient?.scheduleSave(hunter);
                this.renderer.updateLoadoutCard(hunter);
                this.renderer.spawnCombatChatBubble(hunter.index, `🔒 ${selectedPerk.name}`);
                return true;
            }
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
                    this.profileClient?.scheduleSave(hunter);
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
                const previousPersonality = hunter.personality;
                if (change.personality) hunter.personality = change.personality;
                if (change.personality) this.initializer.syncLoadoutItems(hunter);
                let weaponId = change.weaponId;
                let weaponReplaced = false;
                if (!weaponId && change.recommend) {
                    const recommendation = this.loadoutAdvisor.recommend(hunter, this.selectedMonster, this.selectedWeapons);
                    weaponId = recommendation && recommendation.id;
                }
                if (weaponId) weaponReplaced = this.initializer.replaceHunterWeapon(hunter, weaponId);
                this.renderer.updateLoadoutCard(hunter);
                // Re-selecting the same weapon kind still rolls a new weapon instance,
                // so the refreshed weapon data must receive the same visual confirmation.
                const weaponChanged = weaponReplaced;
                const personalityChanged = hunter.personality !== previousPersonality;
                if (weaponChanged || personalityChanged) {
                    this.renderer.highlightLoadoutChanges(hunter.index, {
                        weaponChanged,
                        personalityChanged
                    });
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
                if (this.joinNpcHunterDuringCombat(msgData)) return true;
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

    async runJourneyEventChoices() {
        while (this.runDirector?.currentNode()?.type === 'event') {
            const node = this.runDirector.currentNode();
            const engine = new HuntJourneyEventEngine(this.journeyEventCatalog);
            const collectVote = async ({ choices, scope, seed, scene = null, defaultIndex = undefined }) => {
                const runtime = new HuntJourneyVoteRuntime(seed);
                this.journeyEventVote = { node, runtime, choiceCount: choices.length, scene: scene?.id || 'destination' };
                this.renderer.renderJourneyEventBoard({
                    stage: node.stageIndex + 1, scope, choices, scene,
                    title: scene ? `${scene.icon} ${scene.label}` : '다음 행선지를 정한다'
                });
                await new Promise(resolve => {
                    this.journeyEventResolve = resolve;
                    let timeLeft = HuntJourneyVoteRuntime.VOTE_DURATION_SECONDS;
                    this.renderer.updatePhaseTimer(timeLeft, scene ? '행동 선택' : '행선지 투표');
                    this.gameTimer = this.timers.interval(() => {
                        timeLeft--;
                        this.renderer.updatePhaseTimer(timeLeft, scene ? '행동 선택' : '행선지 투표');
                        if (timeLeft <= 0) {
                            this.timers.clear(this.gameTimer);
                            this.gameTimer = null;
                            this.journeyEventResolve = null;
                            resolve();
                        }
                    }, 1000);
                });
                if (scope === 'party') {
                    return [runtime.resolve(choices.length, this.runDirector.state.nodeIndex, defaultIndex).index];
                }
                return (this.runDirector.state.party || []).map(member => {
                    const key = member.uid || member.nickname;
                    return runtime.votes.has(key) ? runtime.votes.get(key) : defaultIndex;
                });
            };

            const destinations = node.eventChoices.map(id => this.journeyEventCatalog?.get(id) || { id, icon: '❔', label: id });
            const destinationVotes = await collectVote({
                choices: destinations, scope: 'party',
                seed: this.runDirector.state.seed ^ this.runDirector.state.nodeIndex
            });
            const destination = destinations[destinationVotes[0]] || destinations[0];
            const actions = destination.actions || [];
            if (!actions.length) throw new Error(`Journey destination has no actions: ${destination.id}`);
            const actionVotes = await collectVote({
                choices: actions, scope: destination.scope, scene: destination,
                seed: this.runDirector.state.seed ^ this.runDirector.state.nodeIndex ^ 0xa5a5,
                defaultIndex: destination.defaultActionId
                    ? actions.findIndex(action => action.id === destination.defaultActionId)
                    : null
            });
            const patch = engine.resolveEventActions(this.runDirector.state, destination.id, actionVotes);
            const summary = patch.summary;
            delete patch.summary;
            patch.eventLog = [...(this.runDirector.state.eventLog || []), { nodeId: node.id, eventId: patch.lastEvent, summary }].slice(-7);
            if (patch.ambushHook && typeof HuntJourneyInvasionCatalog !== 'undefined') {
                const ambushRandom = HuntJourneyCatalog.random(this.runDirector.state.seed ^ (this.runDirector.state.nodeIndex << 8));
                const invader = ambushRandom() < Number(patch.ambushHook.chance || 0)
                    ? HuntJourneyInvasionCatalog.pick(this.monsters, node.stageIndex, this.runDirector.state.seed ^ this.runDirector.state.nodeIndex)
                    : null;
                if (invader) {
                    const nodes = this.runDirector.state.nodes.map((entry, index) => index === this.runDirector.state.nodeIndex
                        ? { ...entry, type: 'combat', tier: invader.tier, monsterId: invader.id,
                            monsterChoices: [invader.id], eventChoices: [], eventId: null, eventScope: 'party', isBoss: false }
                        : entry);
                    delete patch.ambushHook;
                    await this.runDirector.checkpoint({ ...patch, nodes });
                    this.journeyEventVote = null;
                    return;
                }
            }
            delete patch.ambushHook;
            await this.runDirector.completeCurrentNode(patch);
            this.journeyEventVote = null;
        }
    }

    async runJourneyWeaponUpgrade() {
        const stage = this.runDirector?.state?.upgradePendingStage;
        if (!stage || !this.journeyWeaponGrowth) return false;
        const party = this.runDirector.state.party || [];
        const choices = party.map((member, index) => this.journeyWeaponGrowth.candidates(member, stage,
            this.runDirector.state.seed ^ this.runDirector.state.nodeIndex ^ index, 2, this.runDirector.state.seals));
        if (!choices.some(list => list.length)) {
            await this.runDirector.checkpoint({ upgradePendingStage: null });
            return true;
        }
        this.journeyUpgradeVote = { choices, votes: new Map() };
        this.renderer.renderJourneyUpgradeBoard({ stage: stage + 1, party, choices });
        await new Promise(resolve => {
            let timeLeft = HuntJourneyVoteRuntime.VOTE_DURATION_SECONDS;
            this.renderer.updatePhaseTimer(timeLeft, '강화 선택');
            this.journeyEventResolve = resolve;
            this.gameTimer = this.timers.interval(() => {
                timeLeft--;
                this.renderer.updatePhaseTimer(timeLeft, '강화 선택');
                if (timeLeft <= 0) {
                    this.timers.clear(this.gameTimer);
                    this.gameTimer = null;
                    this.journeyEventResolve = null;
                    resolve();
                }
            }, 1000);
        });
        const random = HuntJourneyCatalog.random(this.runDirector.state.seed ^ (stage << 20));
        party.forEach((member, index) => {
            const list = choices[index];
            if (!list.length) return;
            const selectedIndex = this.journeyUpgradeVote.votes.has(index)
                ? this.journeyUpgradeVote.votes.get(index) : Math.floor(random() * list.length);
            this.journeyWeaponGrowth.apply(member, list[selectedIndex].key || list[selectedIndex].id);
        });
        this.journeyUpgradeVote = null;
        await this.runDirector.checkpoint({ party, upgradePendingStage: null });
        return true;
    }

    async beginLoadout() {
        if (this.phase !== 'quest_board') return;
        await this.finalizeJourneyCombatVote();
        this.renderer.clearLobbyTimer();
        this.phase = 'loadout';
        this.audioManager.playMHAudioFile('Unified_SFX/MH - Open Chest.mp3');
        const savedParty = this.huntMode === 'journey' ? (this.runDirector?.state?.party || []) : [];
        const selected = savedParty.length
            ? savedParty.map(member => ({
                nickname: member.nickname,
                color: member.color || '#cccccc',
                uid: member.uid,
                isStreamer: Boolean(member.isStreamer),
                isNpc: Boolean(member.isNpc)
            }))
            : this.roster.selectFour();
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

        if (this.profileClient) {
            await Promise.all(this.selectedWeapons.map(async hunter => {
                if (hunter.isNpc) return;
                const profile = await this.profileClient.load(hunter);
                if (profile) this.initializer.applyPersistentProfile(hunter, profile);
            }));
        }
        if (savedParty.length) {
            this.selectedWeapons.forEach((hunter, index) => HuntRunPartyAdapter.restore(hunter, savedParty[index], this.initializer));
        } else if (this.huntMode === 'journey' && this.journeyWeaponGrowth) {
            this.selectedWeapons.forEach((hunter, index) => {
                const starter = this.journeyWeaponGrowth.starter(hunter.id, this.runDirector.state.seed ^ index);
                if (starter) {
                    this.initializer.weaponInstanceCatalog.apply(hunter, starter);
                    hunter.weaponProgressionKey = starter.key || null;
                }
                hunter.weaponTier = Number(starter?.tier || starter?.rarity || 1);
            });
        }
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

    finishJourneyTimedVote() {
        if (!this.journeyEventResolve) return false;
        const resolve = this.journeyEventResolve;
        this.journeyEventResolve = null;
        if (this.gameTimer) this.timers.clear(this.gameTimer);
        this.gameTimer = null;
        resolve();
        return true;
    }

    async finalizeJourneyCombatVote() {
        if (!this.journeyVote || !this.runDirector) return;
        const node = this.runDirector.currentNode();
        const result = this.journeyVote.resolve(this.journeyCombatChoices.length, this.runDirector.state.nodeIndex);
        const selected = this.journeyCombatChoices[result.index];
        if (!selected) return;
        node.monsterId = selected.id;
        this.selectedMonster = selected;
        this.consecutiveQueue = [selected];
        await this.runDirector.checkpoint({ nodes: this.runDirector.state.nodes });
        this.journeyVote = null;
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
        this.selectedWeapons.forEach(hunter => this.profileClient?.saveNow(hunter));
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
        const tierRules = HuntTierRules.resolve(this.monsterTier, 'initial', this.selectedMonster);
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
        const journeySupply = this.huntMode === 'journey' && this.runDirector
            ? { ...this.runDirector.state.supply }
            : null;
        if (journeySupply) this.selectedWeapons.forEach(hunter => {
            hunter.potions = journeySupply.potions;
            hunter.lifepowders = journeySupply.lifepowders;
            hunter.shockTraps = journeySupply.shockTraps;
            hunter.bombs = journeySupply.bombs;
        });
        const defaultCartLimit = 3 + this.selectedWeapons.filter(hunter =>
            (hunter.perks || []).some(perk => perk.name === '수레 애호가')
        ).length;
        const cartLimit = this.huntMode === 'journey' && this.runDirector?.state?.party?.length
            ? Math.max(1, Number(this.runDirector.state.carts || 1))
            : defaultCartLimit;
        this.renderer.renderFight({
            hpLabelText,
            selectedMonster: this.selectedMonster,
            selectedWeapons: this.selectedWeapons,
            showMonsterHp: this.SHOW_MONSTER_HP,
            timeLimit: timeLimitVal,
            smallMonsterCount: this.smallMonsterCount,
            cartLimit,
            sharedSupply: journeySupply
        });
        dungAwakenedHunters.forEach(hunter => {
            this.profileClient?.saveNow(hunter).catch(() => {});
            this.renderer.spawnCombatChatBubble(hunter.index, '💩🌈 퍽 발현!');
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
            monsterAtb: HuntAtbConfig.monsterEncounterStartAtb(),
            monsterSpeed: HuntAtbConfig.FILL_PER_TICK * this.monsterAtbSpeedMod,
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
            sharedSupply: journeySupply,
            schedule: (callback, delay) => this.timers.timeout(callback, delay),
            callbacks: {
                onLog: (text, color) => this.addCombatLog(text, color),
                onPlaySFX: (fileName, fallbackKey, context) => this.audioManager.playMHAsset(fileName, fallbackKey, context),
                onCancelWhetstoneCue: hunterIndex => this.audioManager.cancelWhetstoneCue(hunterIndex),
                onPlayAudioFile: (subPath, durationLimitMs, volumeMultiplier, audioContext) => this.audioManager.playMHAudioFile(subPath, durationLimitMs, volumeMultiplier, audioContext),
                onShakeWeapon: (idx, borderClr, isAttack, actionOrName, isDodge = false, hitContext = null) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.shakeWeapon(idx, w, borderClr, isAttack, actionOrName, isDodge, hitContext);
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
                onUpdateMonsterTraitVisual: traits => this.renderer.updateMonsterTraitVisual(traits),
                onUpdateMonsterPartsUI: parts => this.renderer.updateMonsterPartsUI(parts),
                onUpdateTailSeverUI: (visible, carved, displayName) => this.renderer.updateTailSeverUI(visible, carved, displayName),
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
                onSpawnEmojiBubble: (idx, emoji, options) => this.renderer.spawnVictoryEmoji(idx, emoji, options),
                onTriggerMonsterRoar: (monster) => {
                    this.renderer.triggerMonsterRoar();
                    this.audioManager.playMonsterRoar(monster);
                },
                onTriggerMonsterCharge: () => this.renderer.triggerMonsterCharge(),
                onTriggerMonsterAttack: (type, emoji, targets, attackName, pattern) => {
                    this.renderer.triggerMonsterAttack(type, emoji, targets, attackName, pattern);
                },
                onTriggerMonsterTelegraphFx: effect => this.renderer.triggerMonsterTelegraphFx(effect),
                onResolveMonsterImpactTimeline: (pattern, targetIndices) =>
                    this.renderer.resolveMonsterImpactTimeline(pattern, targetIndices),
                onTriggerMonsterBurrowPhase: (phase, targetIndex, durationMs) => {
                    this.renderer.combatAnimator.triggerMonsterBurrowPhase(phase, targetIndex, durationMs);
                },
                onResetMonsterMotion: reason => {
                    this.renderer.combatAnimator.monsterAttackAnimator?.clearMonsterMotion?.(reason);
                },
                onTriggerHunterInterference: (idx, kind, size, active) => {
                    this.renderer.combatAnimator.triggerHunterInterference(idx, kind, size, active);
                },
                onTriggerGuardShake: (idx) => {
                    this.renderer.combatAnimator.triggerGuardImpact(idx);
                },
                onInterruptWeaponVisual: (idx) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.combatAnimator.interruptWeaponVisual(idx, w);
                },
                onTriggerRollAnimation: (idx) => this.renderer.triggerRollAnimation(idx),
                onTriggerInvincibleJump: (idx, active) => this.renderer.triggerInvincibleJump(idx, active),
                onTriggerHitAnimation: (idx, reaction) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.triggerHitAnimation(idx, w, reaction);
                },
                onCancelHitAnimation: (idx) => this.renderer.cancelHitAnimation(idx),
                onTriggerDeathTag: (idx, timerSeconds) => {
                    const w = this.selectedWeapons[idx];
                    this.renderer.triggerDeathTag(idx, w, timerSeconds || 5);
                    this.triggerCartAnimation(w);
                },
                onTriggerStunUI: (idx, isStunned) => this.renderer.triggerStunUI(idx, isStunned),
                onTriggerRoarStun: (idx, isStunned) => this.renderer.triggerRoarStun(idx, isStunned),
                onTriggerMonsterKnockdownAnim: () => {
                    // Traps, perks, and forced landings can trigger knockdown
                    // outside HuntEngine.checkMonsterKnockdown().
                    if (this.engine?.pendingMonsterAction
                        || this.engine?.monsterBurrowState
                        || this.engine?.monsterTraversalState
                        || Number(this.engine?.monsterActionLockTicks || 0) > 0) {
                        this.engine.interruptMonsterMovement?.('knockdown');
                    }
                    this.renderer.triggerMonsterKnockdownAnim();
                },
                onTriggerMonsterPartBreakReaction: (kind, durationTicks, partKind) => {
                    if (this.engine?.pendingMonsterAction
                        || this.engine?.monsterBurrowState
                        || this.engine?.monsterTraversalState
                        || Number(this.engine?.monsterActionLockTicks || 0) > 0) {
                        this.engine.interruptMonsterMovement?.(`part-break:${partKind || 'unknown'}`);
                    }
                    this.renderer.triggerMonsterPartBreakReaction(kind, durationTicks, partKind);
                },
                onTriggerMonsterTraitReaction: (kind, durationTicks) =>
                    this.renderer.triggerMonsterTraitReaction(kind, durationTicks),
                onTriggerEnvironmentEffect: (kind, hunterIndex, details) =>
                    this.renderer.triggerEnvironmentEffect(kind, hunterIndex, details),
                onGameEnd: (victory, winner) => this.endGame(container, victory, winner),
                onNextConsecutive: () => this.spawnNextConsecutiveMonster(container),
                onTriggerValstraxAmbush: () => {
                    this.renderer.triggerValstraxAmbushWarning();
                }
            }
        });
        if (this.engine.sharedSupply) this.selectedWeapons.forEach(hunter => this.renderer.updateHunterItemUI(hunter));

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
        if (this.huntMode === 'journey' && this.runDirector) {
            this.runDirector.checkpoint({
                party: HuntRunPartyAdapter.snapshot(this.selectedWeapons),
                supply: this.engine.snapshotSharedSupply(),
                carts: cartLimit
            }).catch(error => console.warn('[HuntJourney] combat-start checkpoint failed', error));
        }
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
        const tierRules = HuntTierRules.resolve(this.monsterTier, 'consecutive', this.selectedMonster);
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
        this.engine.monsterTier = this.monsterTier;
        this.engine.monsterHp = baseHp;
        this.engine.monsterMaxHp = baseHp;
        const encounterStartAtb = HuntAtbConfig.monsterEncounterStartAtb();
        this.engine.smallMonsterSwarm = this.monsterTier === 'small' && typeof HuntSmallMonsterSwarm !== 'undefined'
            ? new HuntSmallMonsterSwarm(this.smallMonsterCount, baseHp, encounterStartAtb)
            : null;
        this.engine.battleTime = 0; // Reset countdown timer for each monster!
        this.engine.monsterAtb = encounterStartAtb;
        this.engine.pendingMonsterEncounterRoar = false;
        this.engine.pendingMonsterRageRoar = false;
        this.engine.monsterState = 'normal';
        this.engine.monsterSpeed = HuntAtbConfig.FILL_PER_TICK * this.monsterAtbSpeedMod;
        this.engine.monsterDamageMod = this.monsterDamageMod;
        this.engine.monsterAtbSpeedMod = this.monsterAtbSpeedMod;
        this.engine.tierLabel = this.tierLabel;
        this.engine.monsterStunAccum = 0;
        this.engine.monsterStunThreshold = baseStunThreshold;
        this.engine.monsterStunDuration = 0;
        this.engine.monsterKnockdownDuration = 0;
        this.engine.monsterDeathCuePlayed = false;
        this.engine.monsterTrapUseCount = 0;
        this.engine.activeTrapControl = null;
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
        if (this.huntMode === 'journey' && this.runDirector && !this.journeyResultCommitted) {
            this.journeyResultCommitted = true;
            const remainingCarts = Math.max(0, Number(this.engine?.cartLimit || 3) - Number(this.engine?.cartCount || 0));
            const currentNode = this.runDirector.currentNode();
            const patch = {
                party: HuntRunPartyAdapter.snapshot(this.selectedWeapons),
                supply: this.engine?.snapshotSharedSupply?.() || this.runDirector.state.supply,
                carts: remainingCarts
            };
            if (isVictory && currentNode?.type === 'combat' && typeof HuntJourneyRewardCatalog !== 'undefined') {
                const reward = HuntJourneyRewardCatalog.award(this.runDirector.state.seals, currentNode.monsterId, currentNode.tier);
                patch.seals = reward.seals;
                patch.zenny = HuntJourneyEconomy.clampZenny(Number(this.runDirector.state.zenny || 0)
                    + HuntJourneyRewardCatalog.coinFor(currentNode.tier, currentNode.isBoss));
            }
            if (isVictory && currentNode?.isBoss && currentNode.stageIndex < 2) patch.upgradePendingStage = currentNode.stageIndex + 1;
            this.journeySettlementPromise = isVictory
                ? this.runDirector.completeCurrentNode(patch)
                : this.runDirector.fail(patch);
        }
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
        if (this.journeyEventResolve) {
            const resolveEvent = this.journeyEventResolve;
            this.journeyEventResolve = null;
            resolveEvent();
        }
        if (this.journeyTravelResolve) {
            const resolveTravel = this.journeyTravelResolve;
            this.journeyTravelResolve = null;
            this.journeyTravelActive = false;
            resolveTravel();
        }

        this.audioManager.stopBgms();
        this.renderer.removeContainer();
        document.body.classList.remove('in-hunt');

        if (this.resolveGame) {
            this.resolveGame();
            this.resolveGame = null;
        }
    }

    dispose() {
        if (this.isActive || this.resolveGame) {
            this.forceStopGame();
        } else {
            this.clearAllTimers();
            this.renderer.removeContainer();
        }
        this.profileClient?.dispose?.();
        this.audioManager?.dispose?.();
        this.participants = [];
        this.selectedWeapons = [];
        this.monsters = [];
        this.selectedMonster = null;
        this.engine = null;
        this.runDirector = null;
        this.journeyFlow = null;
        super.dispose();
    }
}

if (typeof window !== 'undefined') window.HuntEffect = HuntEffect;
