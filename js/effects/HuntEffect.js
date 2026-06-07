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
        
        this.lobbyBgm = null;
        this.battleBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgmPromise = null;
        this.winBgm = null;
        this.winBgmPromise = null;

        // Configuration
        this.SHOW_MONSTER_HP = true;

        this.WEAPONS = window.HUNT_WEAPONS || [
            { id: 'great_sword', name: '대검', filename: 'great_sword.svg', type: 'shield', speedGroup: 'slow' },
            { id: 'long_sword', name: '태도', filename: 'long_sword.svg', type: 'melee', speedGroup: 'fast' },
            { id: 'sword_shield', name: '한손검', filename: 'sword_shield.svg', type: 'shield', speedGroup: 'very_fast' },
            { id: 'dual_blades', name: '쌍검', filename: 'dual_blades.svg', type: 'melee', speedGroup: 'very_fast' },
            { id: 'hammer', name: '해머', filename: 'hammer.svg', type: 'melee', speedGroup: 'slow' },
            { id: 'hunting_horn', name: '수렵피리', filename: 'hunting_horn.svg', type: 'melee', speedGroup: 'normal' },
            { id: 'lance', name: '랜스', filename: 'lance.svg', type: 'shield', speedGroup: 'fast' },
            { id: 'gunlance', name: '건랜스', filename: 'gunlance.svg', type: 'shield', speedGroup: 'normal' },
            { id: 'switch_axe', name: '슬래시액스', filename: 'switch_axe.svg', type: 'melee', speedGroup: 'normal' },
            { id: 'charge_blade', name: '차지액스', filename: 'charge_blade.svg', type: 'shield', speedGroup: 'slow' },
            { id: 'insect_glaive', name: '조충곤', filename: 'insect_glaive.svg', type: 'melee', speedGroup: 'fast' },
            { id: 'light_bowgun', name: '라이트보건', filename: 'light_bowgun.svg', type: 'ranged', speedGroup: 'fast' },
            { id: 'heavy_bowgun', name: '헤비보건', filename: 'heavy_bowgun.svg', type: 'shield', speedGroup: 'normal' },
            { id: 'bow', name: '활', filename: 'bow.svg', type: 'ranged', speedGroup: 'very_fast' }
        ];

        this.fallbackMonsters = window.MONSTER_DATA || [
            { id: "rathalos", nameEN: "Rathalos", nameKO: "리오레우스", filename: "rathalos.png" },
            { id: "diablos", nameEN: "Diablos", nameKO: "디아블로스", filename: "diablos.png" },
            { id: "nergigante", nameEN: "Nergigante", nameKO: "네르기간테", filename: "nergigante.png" },
            { id: "zinogre", nameEN: "Zinogre", nameKO: "진오우거", filename: "zinogre.png" },
            { id: "velkhana", nameEN: "Velkhana", nameKO: "벨카나", filename: "velkhana.png" }
        ];

        this.MONSTER_ATTACKS = window.MONSTER_ATTACKS || {
            rathalos: ["화룡의 포효", "화염구 브레스", "독조강습 타격", "꼬리 휩쓸기", "돌진 몸통박치기"],
            diablos: ["각룡의 포효", "지중 급습 쳐올리기", "각공격 들이받기", "꼬리 회전치기", "돌진 덮치기"],
            nergigante: ["멸진룡의 포효", "파멸의 일격 (지면 덮치기)", "가시 파편 발사", "날개 지면 강강타", "앞발 내려치기"],
            zinogre: ["뇌랑룡의 포효", "연속 전뇌 펀치", "등 찍기 폭발", "초전도 번개벼락", "꼬리 공중 회전베기"],
            velkhana: ["빙룡의 포효", "빙벽 생성 강타", "얼음 브레스 방출", "고리형 절대영도 폭발", "꼬리 얼음칼 찌르기"],
            default: ["포효 위협", "몸통 박치기", "꼬리 후려치기", "성난 돌진 공격"]
        };

        this.COMBO_LIST = window.HUNT_COMBO_LIST;

        this.renderer = new HuntRenderer();
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
        this.stopBgms();

        // Play supply box opening SFX
        this.playMHAudioFile('Unified_SFX/MH - Open Chest.mp3');

        // Load monsters list
        let monsters = window.MONSTER_DATA || this.fallbackMonsters;
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

        // Parse custom target name or consecutive count
        let targetMonsterName = null;
        let consecutiveCount = 1;

        let chosenWeaponIds = [];

        if (context && context.message) {
            const trimmed = context.message.trim();
            const match = trimmed.match(/^!(수렵|토벌)\s*([1-9]|10)(?![0-9])/);
            if (match) {
                consecutiveCount = parseInt(match[2], 10);
            }

            const cleanedMsg = trimmed.replace(/^!(수렵|토벌)\s*/, "").trim();
            const tokens = cleanedMsg.split(/\s+/);
            const WEAPON_CHAR_MAP = {
                '대': 'great_sword', '태': 'long_sword', '한': 'sword_shield', '쌍': 'dual_blades',
                '해': 'hammer', '피': 'hunting_horn', '건': 'gunlance', '랜': 'lance',
                '슬': 'switch_axe', '차': 'charge_blade', '충': 'insect_glaive', '활': 'bow',
                '라': 'light_bowgun', '헤': 'heavy_bowgun'
            };
            const weaponChars = Object.keys(WEAPON_CHAR_MAP);
            const monsterNameTokens = [];

            for (const token of tokens) {
                const isConsecutiveToken = /^[1-9]$|^10$|^[1-9]마리$|^10마리$/.test(token);
                if (isConsecutiveToken) continue;

                const isWeaponToken = token.length > 0 && token.split("").every(char => weaponChars.includes(char));
                if (isWeaponToken) {
                    token.split("").forEach(char => {
                        chosenWeaponIds.push(WEAPON_CHAR_MAP[char]);
                    });
                } else {
                    monsterNameTokens.push(token);
                }
            }

            if (monsterNameTokens.length > 0) {
                targetMonsterName = monsterNameTokens.join(" ");
            }
        }
        this.chosenWeaponIds = chosenWeaponIds; // Store in instance temporarily for use in weapon selection

        this.consecutiveTotal = consecutiveCount;
        this.currentConsecutiveIndex = 0;
        this.consecutiveQueue = [];

        if (consecutiveCount > 1) {
            for (let i = 0; i < consecutiveCount; i++) {
                this.consecutiveQueue.push(monsters[Math.floor(Math.random() * monsters.length)]);
            }
            this.selectedMonster = this.consecutiveQueue[0];
        } else if (targetMonsterName) {
            const nicknameMap = {
                '네기': '네르기간테',
                '발파': '발파루크',
                '이베르': '벨카나',
                '벨카': '벨카나',
                '멜제': '멜제나',
                '멜제나': '멜제나',
                '이슈': '안-이슈왈다',
                '무페토': '무페토-지바',
                '제노': '제노-지바',
                '지바': '지바-모르그',
                '로알': '로알루드로스',
                '레이아': '리오레이아',
                '디아': '디아블로스',
                '디블': '디아블로스',
                '진오': '진오우거',
                '바젤': '바젤기우스',
                '샤갈': '샤가르마가라',
                '고어': '고어-마가라'
            };
            const searchName = nicknameMap[targetMonsterName] || targetMonsterName;
            const matched = monsters.find(m => 
                m.nameKO.includes(searchName) || 
                m.nameEN.toLowerCase().includes(searchName.toLowerCase()) ||
                m.id.toLowerCase().includes(searchName.toLowerCase())
            );
            if (matched) {
                this.selectedMonster = matched;
            } else {
                this.selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
            }
            this.consecutiveQueue = [this.selectedMonster];
        } else {
            this.selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
            this.consecutiveQueue = [this.selectedMonster];
        }
        
        const selected = [];
        const chosen = this.chosenWeaponIds || [];
        for (let i = 0; i < Math.min(4, chosen.length); i++) {
            const foundWeapon = this.WEAPONS.find(w => w.id === chosen[i]);
            if (foundWeapon) {
                selected.push({ ...foundWeapon });
            }
        }
        while (selected.length < 4) {
            selected.push(this.WEAPONS[Math.floor(Math.random() * this.WEAPONS.length)]);
        }
        delete this.chosenWeaponIds; // clean up
        const personalities = ['offensive', 'offensive', 'normal', 'normal', 'defensive', 'veteran', 'support', 'newbie'];
        this.selectedWeapons = selected.map((w, index) => {
            const initialSpeedGroup = w.id === 'charge_blade' ? 'very_fast' : w.speedGroup;
            const personality = personalities[Math.floor(Math.random() * personalities.length)];
            return {
                ...w,
                speedGroup: initialSpeedGroup,
                index,
                hp: 100,
                maxHp: 100,
                status: 'alive',
                sharpness: 100,
                ammo: 5,
                hasMoxie: true,
                atb: 0,
                comboIndex: 0,
                respawnTimer: 0,
                personality: personality,
                potions: 10,
                lifepowders: 1,
                spiritLevel: 0,
                demonModeDuration: 0,
                phials: 5,
                overheatDuration: 0,
                extractBuffs: { red: 0, white: 0, orange: 0 },
                extractDuration: 0
            };
        });

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
            this.lobbyBgm = new Audio(selectedLobby);
            this.lobbyBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.lobbyBgm.volume = volConfig.master * volConfig.visual * 0.315;
            this.lobbyBgmPromise = this.lobbyBgm.play().catch(() => {
                this.lobbyBgm.src = 'BGM/SportBGM.mp3';
                this.lobbyBgmPromise = this.lobbyBgm.play().catch(err => console.warn("Lobby BGM failed to play:", err));
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

    playMHAsset(fileName, fallbackKey) {
        const soundConfig = this.config.getSoundConfig();
        if (fallbackKey && soundConfig[fallbackKey]) {
            this.director.eventBus.emit('audio:playVisualSound', soundConfig[fallbackKey]);
            return;
        }
        if (fileName) {
            const hasAudioExtension = /\.(mp3|wav|ogg|m4a|aac|webm|flac)$/i.test(fileName);
            if (hasAudioExtension) {
                this.playMHAudioFile(fileName);
            }
        }
    }

    getMonsterBgm(monsterName) {
        const name = (monsterName || "").toLowerCase();
        if (name.includes('진오우거') || name.includes('zinogre')) return 'BGM/MHW_Zinogre.mp3';
        if (name.includes('벨카나') || name.includes('velkhana')) return 'BGM/MHW_Velkhana.mp3';
        if (name.includes('네르기간테') || name.includes('nergigante')) return 'BGM/MHW_Nergigante.mp3';
        if (name.includes('이블조') || name.includes('deviljho')) return 'BGM/MHW_Deviljho.mp3';
        if (name.includes('티가렉스') || name.includes('tigrex')) return 'BGM/MHW_Tigrex.mp3';
        if (name.includes('나르가') || name.includes('nargacuga')) return 'BGM/MHW_Nargacuga.mp3';
        if (name.includes('디노발드') || name.includes('glavenus')) return 'BGM/MHW_Glavenus.mp3';
        if (name.includes('브라키') || name.includes('brachydios')) return 'BGM/MHW_Brachydios.mp3';
        if (name.includes('밀라보레아스') || name.includes('fatalis')) return 'BGM/MHW_Fatalis.mp3';
        if (name.includes('아마츠') || name.includes('amatsu')) return 'BGM/MHR_Amatsu.mp3';
        if (name.includes('샤가르') || name.includes('샤갈') || name.includes('shagaru')) return 'BGM/MH4_Shagaru_Magala.mp3';
        if (name.includes('노산룡') || name.includes('lao_shan')) return 'BGM/MH_Lao_Shan_Lung.mp3';
        if (name.includes('라잔') || name.includes('rajang')) return 'BGM/William Tell.mp3';
        if (name.includes('요츠미와두') || name.includes('tetranadon')) return 'BGM/MHGU_Arena.mp3';
        if (name.includes('발파루크') || name.includes('valstrax')) return 'BGM/MHGU_Valstrax.mp3';
        if (name.includes('테오') || name.includes('teostra') || name.includes('나나') || name.includes('lunastra')) return 'BGM/MHW_Teostra.mp3';

        if (name.includes('안쟈나프') || name.includes('anjan') || 
            name.includes('리오레우스') || name.includes('rathalos') ||
            name.includes('리오레이아') || name.includes('rathian') ||
            name.includes('푸케푸케') || name.includes('pukei') ||
            name.includes('도스쟈그라스') || name.includes('jagras') ||
            name.includes('토비카가치') || name.includes('kadachi') ||
            name.includes('쿠루루야쿠') || name.includes('kulu')) {
            return 'BGM/MHW_Ancient_Forest.mp3';
        }

        if (name.includes('디아블로스') || name.includes('diablos') ||
            name.includes('볼보로스') || name.includes('barroth') ||
            name.includes('쥬라토도스') || name.includes('jyuratodus')) {
            return 'BGM/MHW_Wildspire_Waste.mp3';
        }

        if (name.includes('레이기에나') || name.includes('legiana') ||
            name.includes('파오우르무') || name.includes('paolumu') ||
            name.includes('치치야쿠') || name.includes('tzitzi') ||
            name.includes('치치') || name.includes('푸케푸케 아종') || name.includes('coral_pukei')) {
            return 'BGM/MHW_Coral_Highlands.mp3';
        }

        if (name.includes('오도가론') || name.includes('odogaron') ||
            name.includes('도스기르오스') || name.includes('girros') ||
            name.includes('라도발킨') || name.includes('radobaan')) {
            return 'BGM/MHW_Rotten_Vale.mp3';
        }

        if (name.includes('도도가마') || name.includes('dodogama') ||
            name.includes('우라간킨') || name.includes('uragaan') ||
            name.includes('볼가노스') || name.includes('lavasioth')) {
            return 'BGM/MHW_Elders_Recess.mp3';
        }

        if (name.includes('버프바로') || name.includes('banbaro') ||
            name.includes('베리오로스') || name.includes('barioth') ||
            name.includes('브란토도스') || name.includes('beotodus')) {
            return 'BGM/MHWI_Hoarfrost_Reach.mp3';
        }

        return 'BGM/MHGU_Arena.mp3';
    }

    startFight(container) {
        this.phase = 'fighting';
        this.stopBgms();
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

        const bgmSrc = this.getMonsterBgm(this.selectedMonster.nameKO);
        try {
            this.battleBgm = new Audio(bgmSrc);
            this.battleBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.battleBgm.volume = volConfig.master * volConfig.visual * 0.315;
            this.battleBgmPromise = this.battleBgm.play().catch(() => {
                this.battleBgm.src = 'BGM/MHGU_Arena.mp3';
                this.battleBgmPromise = this.battleBgm.play().catch(err => {
                    this.battleBgm.src = 'BGM/MHW_Proof_of_a_Hero.mp3';
                    this.battleBgmPromise = this.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
                });
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가기'] || '가기');
        this.playMHAudioFile('Unified_SFX/MH - Hunters Depart (MH3U).mp3');

        this.monsterTier = this.getMonsterTier(this.selectedMonster);
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
            MONSTER_ATTACKS: this.MONSTER_ATTACKS,
            COMBO_LIST: this.COMBO_LIST,
            SHOW_MONSTER_HP: this.SHOW_MONSTER_HP,
            callbacks: {
                onLog: (text, color) => this.addCombatLog(text, color),
                onPlaySFX: (fileName, fallbackKey) => this.playMHAsset(fileName, fallbackKey),
                onPlayAudioFile: (subPath, durationLimitMs, volumeMultiplier) => this.playMHAudioFile(subPath, durationLimitMs, volumeMultiplier),
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
                    this.playMonsterRoar(monster);
                },
                onTriggerMonsterCharge: () => this.renderer.triggerMonsterCharge(),
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

    playMonsterRoar(monster) {
        if (!monster) return;
        let id = monster.id.toLowerCase();
        
        if (id.includes('zinogre')) id = 'zinogre';
        else if (id.includes('tigrex')) id = 'tigrex';
        else if (id.includes('nargacuga')) id = 'nargacuga';
        else if (id.includes('rathalos') || id.includes('rathian')) id = 'rathalos';
        else if (id.includes('deviljho')) id = 'deviljho';
        else if (id.includes('diablos')) id = 'diablos';
        else if (id.includes('nergigante')) id = 'nergigante';
        else if (id.includes('velkhana')) id = 'velkhana';
        else if (id.includes('bazelgeuse')) id = 'bazelgeuse';
        else if (id.includes('alatreon')) id = 'alatreon';
        else if (id.includes('fatalis')) id = 'fatalis';
        else if (id.includes('amatsu')) id = 'amatsu';
        else if (id.includes('valstrax')) id = 'valstrax';
        else if (id.includes('rajang')) id = 'rajang';
        else if (id.includes('brachydios')) id = 'brachydios';
        else if (id.includes('glavenus')) id = 'glavenus';

        const dedicatedPath = `SFX/roar_${id}.mp3`;
        const defaultPath = `SFX/roar_default.mp3`;
        const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
        const volume = Math.min(1.0, Math.max(0, volConfig.master * volConfig.sfx * 0.7));

        const audio = new Audio(dedicatedPath);
        audio.volume = volume;
        audio.play().catch(() => {
            const defaultAudio = new Audio(defaultPath);
            defaultAudio.volume = volume;
            defaultAudio.play().catch(() => {
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['포효'] || '포효');
            });
        });
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
        this.monsterTier = this.getMonsterTier(this.selectedMonster);
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
        this.stopBgms();
        const bgmSrc = this.getMonsterBgm(this.selectedMonster.nameKO);
        try {
            this.battleBgm = new Audio(bgmSrc);
            this.battleBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.battleBgm.volume = volConfig.master * volConfig.visual * 0.315;
            this.battleBgmPromise = this.battleBgm.play().catch(() => {
                this.battleBgm.src = 'BGM/MHGU_Arena.mp3';
                this.battleBgmPromise = this.battleBgm.play().catch(e => console.warn("Battle BGM failed:", e));
            });
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

        this.stopBgms();

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
                this.winBgm = new Audio(selectedClear);
                const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
                this.winBgm.volume = volConfig.master * volConfig.visual * 0.315;
                this.winBgmPromise = this.winBgm.play().catch(() => {
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
                this.winBgm = new Audio(selectedFail);
                const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
                this.winBgm.volume = volConfig.master * volConfig.visual * 0.315;
                this.winBgmPromise = this.winBgm.play().catch(() => {
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
                this.stopBgms();
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

        this.stopBgms();
        this.renderer.removeContainer();

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
        stop(this.winBgm, this.winBgmPromise);
        this.lobbyBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgm = null;
        this.battleBgmPromise = null;
        this.winBgm = null;
        this.winBgmPromise = null;
    }

    playMHAudioFile(subPath, durationLimitMs = null, volumeMultiplier = 1.0) {
        const filePath = `MonsterHunter_Soundtracks/${subPath}`;
        try {
            const audio = new Audio(filePath);
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            const baseVolume = volConfig.master * volConfig.sfx * 0.75 * volumeMultiplier;

            if (volumeMultiplier > 1.0) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    const ctx = new AudioContext();
                    const source = ctx.createMediaElementSource(audio);
                    const gainNode = ctx.createGain();

                    gainNode.gain.value = baseVolume;
                    source.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    if (ctx.state === 'suspended') {
                        ctx.resume();
                    }

                    let isCleaned = false;
                    const cleanup = () => {
                        if (isCleaned) return;
                        isCleaned = true;
                        try {
                            audio.pause();
                            gainNode.gain.value = 0;
                            source.disconnect();
                            gainNode.disconnect();
                            ctx.close().catch(() => {});
                        } catch (e) {
                            console.warn("Cleanup AudioContext error:", e);
                        }
                    };

                    audio.play().catch(e => {
                        console.warn(`Failed to play amplified audio: ${filePath}`, e);
                        cleanup();
                    });

                    audio.onended = cleanup;
                    audio.onerror = cleanup;

                    if (durationLimitMs) {
                        setTimeout(() => {
                            const fadeDuration = 500;
                            const fadeInterval = 50;
                            let elapsed = 0;
                            const originalGain = gainNode.gain.value;
                            const timer = setInterval(() => {
                                elapsed += fadeInterval;
                                if (elapsed >= fadeDuration) {
                                    clearInterval(timer);
                                    cleanup();
                                } else {
                                    gainNode.gain.value = Math.max(0, originalGain * (1 - elapsed / fadeDuration));
                                }
                            }, fadeInterval);
                        }, durationLimitMs - 500 > 0 ? durationLimitMs - 500 : 0);
                    }
                    return;
                }
            }

            audio.volume = Math.min(1.0, Math.max(0, baseVolume));
            audio.play().then(() => {
                if (durationLimitMs) {
                    setTimeout(() => {
                        const fadeDuration = 500;
                        const fadeInterval = 50;
                        let elapsed = 0;
                        const originalVol = audio.volume;
                        const timer = setInterval(() => {
                            elapsed += fadeInterval;
                            if (elapsed >= fadeDuration) {
                                clearInterval(timer);
                                audio.pause();
                                audio.volume = 0;
                            } else {
                                audio.volume = Math.max(0, originalVol * (1 - elapsed / fadeDuration));
                            }
                        }, fadeInterval);
                    }, durationLimitMs - 500 > 0 ? durationLimitMs - 500 : 0);
                }
            }).catch(e => console.warn(`Failed to play MH audio: ${filePath}`, e));
        } catch(e) {
            console.warn(`Error loading MH audio: ${filePath}`, e);
        }
    }

    getMonsterTier(monster) {
        if (!monster) return 'large';
        const id = (monster.id || "").toLowerCase();
        
        const smallIds = [
            'aptonoth', 'apceros', 'gajau', 'gastodon', 'girros', 'jagras', 
            'kestodon', 'kestodon_female', 'mernos', 'noios', 'barnos', 
            'cortos', 'raphinos', 'shamos', 'wulg', 'anteka', 'kelbi', 
            'popo', 'felyne', 'gajalaka', 'grimalkyne', 'boaboa', 
            'mosswine', 'vespoid', 'hornetaur'
        ];
        if (smallIds.includes(id)) {
            return 'small';
        }

        const mediumIds = [
            'great_jagras', 'great_girros', 'kulu-ya-ku', 'tzitzi-ya-ku', 
            'dodogama', 'pukei-pukei', 'coral_pukei-pukei', 'royal_ludroth'
        ];
        if (mediumIds.includes(id)) {
            return 'medium';
        }

        const elderIds = [
            'ancient_leshen', 'alatreon', 'amatsu', 'behemoth', 'blackveil_vaal_hazak',
            'crimson_glow_valstrax', 'fatalis', 'furious_rajang', 'kirin', 
            'kulve_taroth', 'kushala_daora', 'lunastra', 'malzeno', 'namielle', 
            'nergigante', 'primordial_malzeno', 'ruiner_nergigante', 'safi_jiiva', 
            'shara_ishvalda', 'teostra', 'vaal_hazak', 'valstrax', 'velkhana', 
            'xeno_jiiva', 'shagaru_magala', 'akantor', 'ukanlos', 'nakarkos', 
            'lao_shan_lung', 'yamatsukami'
        ];
        if (elderIds.includes(id)) {
            return 'elder';
        }

        return 'large';
    }
}
