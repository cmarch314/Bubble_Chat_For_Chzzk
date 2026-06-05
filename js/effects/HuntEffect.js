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

        // Configuration
        this.SHOW_MONSTER_HP = true; // Toggle monster HP display

        this.WEAPONS = [
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
            { id: 'heavy_bowgun', name: '헤비보건', filename: 'heavy_bowgun.svg', type: 'shield', speedGroup: 'normal' }, // HBG has shield!
            { id: 'bow', name: '활', filename: 'bow.svg', type: 'ranged', speedGroup: 'very_fast' }
        ];

        this.fallbackMonsters = [
            { id: "rathalos", nameEN: "Rathalos", nameKO: "리오레우스", filename: "rathalos.png" },
            { id: "diablos", nameEN: "Diablos", nameKO: "디아블로스", filename: "diablos.png" },
            { id: "nergigante", nameEN: "Nergigante", nameKO: "네르기간테", filename: "nergigante.png" },
            { id: "zinogre", nameEN: "Zinogre", nameKO: "진오우거", filename: "zinogre.png" },
            { id: "velkhana", nameEN: "Velkhana", nameKO: "벨카나", filename: "velkhana.png" }
        ];

        // MHW Monster Attacks Map
        this.MONSTER_ATTACKS = {
            rathalos: ["화룡의 포효", "화염구 브레스", "독조강습 타격", "꼬리 휩쓸기", "돌진 몸통박치기"],
            diablos: ["각룡의 포효", "지중 급습 쳐올리기", "각공격 들이받기", "꼬리 회전치기", "돌진 덮치기"],
            nergigante: ["멸진룡의 포효", "파멸의 일격 (지면 덮치기)", "가시 파편 발사", "날개 지면 강강타", "앞발 내려치기"],
            zinogre: ["뇌랑룡의 포효", "연속 전뇌 펀치", "등 찍기 폭발", "초전도 번개벼락", "꼬리 공중 회전베기"],
            velkhana: ["빙룡의 포효", "빙벽 생성 강타", "얼음 브레스 방출", "고리형 절대영도 폭발", "꼬리 얼음칼 찌르기"],
            default: ["포효 위협", "몸통 박치기", "꼬리 후려치기", "성난 돌진 공격"]
        };

        // Monster Hunter Wilds Combo Sequences Map
        this.COMBO_LIST = {
            great_sword: [
                { name: "세로베기", dmg: 150, sharp: -5 },
                { name: "모아베기", dmg: 280, sharp: -8 },
                { name: "참 모아베기", dmg: 650, sharp: -15, special: "💥 [역경직] 파괴적인 참 모아베기가 몬스터에게 작렬합니다!" }
            ],
            long_sword: [
                { name: "세로베기", dmg: 100, sharp: -3 },
                { name: "기인베기 I", dmg: 140, sharp: -4 },
                { name: "기인베기 II", dmg: 180, sharp: -4 },
                { name: "기인투구깨기", dmg: 480, sharp: -12, special: "⚡ [연타] 붉은 기인 게이지를 격발시켜 투구깨기 찌르기를 먹였습니다!" }
            ],
            sword_shield: [
                { name: "베어넘기기", dmg: 70, sharp: -2 },
                { name: "저스트 러시 I", dmg: 120, sharp: -3 },
                { name: "저스트 러시 II", dmg: 160, sharp: -3 },
                { name: "저스트 러시 III", dmg: 220, sharp: -4 },
                { name: "폴배시 (방패강습)", dmg: 380, sharp: -8 }
            ],
            dual_blades: [
                { name: "귀인화 진입", dmg: 60, sharp: -2, special: "👹 [귀인화] 안개를 뿜어내며 기동성과 파괴력을 극대화합니다!" },
                { name: "귀인돌진연참", dmg: 150, sharp: -6 },
                { name: "귀인 난무", dmg: 460, sharp: -16, special: "🌀 [난무] 제자리에서 몬스터의 약점을 잘게 썰어 대량의 출혈을 냅니다!" }
            ],
            hammer: [
                { name: "힘모으기", dmg: 50, sharp: -2, special: "🔨 [차지] 해머에 묵직한 힘을 모아 다음 타격을 강화합니다." },
                { name: "3차지 내려치기", dmg: 310, sharp: -5 },
                { name: "쿵쿵쿵 (연타)", dmg: 200, sharp: -4 },
                { name: "해머 대가리 홈런!", dmg: 550, sharp: -10, special: "💥 [홈런] 기가 막힌 어퍼 스윙으로 몬스터의 턱관절을 가격했습니다!" }
            ],
            hunting_horn: [
                { name: "음표 공격 I (적)", dmg: 90, sharp: -3, special: "🎵 [자가강화] 신나는 연주로 파티원 전원의 이동 속도를 증가시킵니다." },
                { name: "향음타", dmg: 170, sharp: -4 },
                { name: "삼중 연주 (공격력 UP)", dmg: 380, sharp: -8, special: "🎺 [공대UP] 공격력 대폭 상승 연주 버프를 아군 전체에 적용합니다!" }
            ],
            lance: [
                { name: "중단찌르기", dmg: 100, sharp: -3 },
                { name: "상단찌르기", dmg: 105, sharp: -3 },
                { name: "가드 대시", dmg: 60, sharp: -2, special: "🛡️ [가드 전진] 견고한 대형 방패로 정면을 밀치며 방어 태세를 유지합니다." },
                { name: "돌진 피니시 찌르기", dmg: 350, sharp: -8 }
            ],
            gunlance: [
                { name: "수평찌르기", dmg: 90, sharp: -3 },
                { name: "포격 (방어무시)", dmg: 160, sharp: -6, special: "🔥 [포격] 포신 내 탄약 화염으로 육질을 무시하는 충격파를 입힙니다." },
                { name: "풀버스트", dmg: 480, sharp: -18, special: "💥 [풀버스트] 장전된 잔탄을 일시에 격발해 대규모 화력 폭발을 냅니다!" }
            ],
            switch_axe: [
                { name: "도끼 세로베기", dmg: 120, sharp: -4 },
                { name: "검 변형 2단베기", dmg: 230, sharp: -6 },
                { name: "기 속성 해방 찌르기", dmg: 520, sharp: -12, special: "⚡ [해방] 검날을 쑤셔 넣고 톱니가 구르며 거대한 속성 폭발을 터트립니다!" }
            ],
            charge_blade: [
                { name: "검 모아 2단베기", dmg: 130, sharp: -4 },
                { name: "고압속성베기 (방패강화)", dmg: 200, sharp: -4 },
                { name: "초고출력 속성해방베기", dmg: 650, sharp: -15, special: "⚡ [초고출력] 초거대 검으로 지면을 내리치며 대자연의 전격을 방출합니다!" }
            ],
            insect_glaive: [
                { name: "진기 추출", dmg: 80, sharp: -2, special: "🐝 [진기] 엽충을 부려 몬스터의 몸에서 3색 진기를 모아 도핑합니다." },
                { name: "비원베기", dmg: 180, sharp: -4 },
                { name: "급습찌르기 (강하)", dmg: 420, sharp: -8 }
            ],
            light_bowgun: [
                { name: "일반탄 사격", dmg: 100, ammo: -1 },
                { name: "기폭용탄 설치", dmg: 180, ammo: -1, special: "💣 [기폭용탄] 아군 탄환 공격에 유도 감응하여 기폭되는 유탄 지뢰를 놓습니다." },
                { name: "속사 (일반탄)", dmg: 340, ammo: -2 }
            ],
            heavy_bowgun: [
                { name: "기관용탄 장전 (특수)", dmg: 60, ammo: -1 },
                { name: "기관용탄 난사", dmg: 420, ammo: -3, special: "🔫 [기관용탄] 게틀링 총신을 회전시키며 전방에 무수한 철갑탄을 연사합니다!" },
                { name: "용격탄 사격", dmg: 580, ammo: -1, special: "💥 [용격탄] 짧고 무거운 압축 용격포를 격발시켜 적을 충격에 흔듭니다!" }
            ],
            bow: [
                { name: "차지 샷", dmg: 90 },
                { name: "강사", dmg: 160 },
                { name: "용의 화살 (풀 차지)", dmg: 410, special: "🏹 [용의화살] 기를 모아 온 몸을 관통해 나가는 초장거리 회전 화살을 발사합니다!" }
            ]
        };
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
        
        // Randomly select 4 weapons and initialize attributes
        const shuffledWeapons = [...this.WEAPONS].sort(() => Math.random() - 0.5);
        this.selectedWeapons = shuffledWeapons.slice(0, 4).map((w, index) => ({
            ...w,
            index,
            hp: 100,
            maxHp: 100,
            status: 'alive', // 'alive', 'dead', 'stunned'
            sharpness: 100,  // only for melee/shield
            ammo: 5,        // only for ranged
            hasMoxie: true,  // Moxie safety net (1 time per weapon)
            atb: 0,
            comboIndex: 0,
            respawnTimer: 0
        }));

        // Play Lobby BGM
        try {
            this.lobbyBgm = new Audio('BGM/MHW_Lobby.mp3');
            this.lobbyBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.lobbyBgm.volume = volConfig.master * volConfig.visual * 0.45;
            this.lobbyBgmPromise = this.lobbyBgm.play().catch(() => {
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

    playMHAsset(fileName, fallbackKey) {
        const sfxPath = `SFX/${fileName}`;
        const audio = new Audio(sfxPath);
        const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
        audio.volume = volConfig.master * volConfig.sfx * 0.75;
        
        audio.play().catch(() => {
            if (fallbackKey) {
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[fallbackKey] || fallbackKey);
            }
        });
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
        
        // Generations Ultimate Arena theme fallback for others
        return 'BGM/MHGU_Arena.mp3';
    }

    startFight(container) {
        this.phase = 'fighting';
        this.stopBgms();

        const bgmSrc = this.getMonsterBgm(this.selectedMonster.nameKO);

        // Play Battle BGM
        try {
            this.battleBgm = new Audio(bgmSrc);
            this.battleBgm.loop = true;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.battleBgm.volume = volConfig.master * volConfig.visual * 0.45;
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

        // Play start SFX
        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가자!'] || '가자!');

        // Battle stats init
        this.cartCount = 0;
        this.monsterHp = 12000;
        this.monsterMaxHp = 12000;
        this.monsterAtb = 0;
        this.monsterSpeed = 2.2;
        this.monsterState = 'normal'; // 'normal', 'enraged', 'exhausted'
        this.battleTime = 0;

        // Build UI with Top Monster HP Bar, ATB Gauges and Cart board
        const card = container.querySelector('.game-hunt-card');
        card.style.position = 'relative';
        card.innerHTML = `
            <!-- Monster HP Bar -->
            <div class="game-hunt-monster-hp-container" style="${this.SHOW_MONSTER_HP ? '' : 'display:none;'} margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.15rem; color:#ffaa00; margin-bottom:4px;">
                    <span>🐉 ${this.selectedMonster.nameKO} [체력바]</span>
                    <span id="monster-hp-text">12000 / 12000</span>
                </div>
                <div class="game-hunt-monster-hp-wrapper" style="width:100%; height:20px; background:#222; border: 2px solid #555; border-radius:10px; overflow:hidden; position:relative;">
                    <div id="monster-hp-fill" style="width:100%; height:100%; background:linear-gradient(90deg, #ff3b30, #ff9500); transition: width 0.15s ease-out;"></div>
                </div>
            </div>

            <!-- Header Info (Carts, Rage Loop, BGM status) -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:rgba(0,0,0,0.4); padding:10px 15px; border-radius:10px;">
                <div id="cart-counter-board" style="font-size:1.15rem; font-weight:bold; color:#ff3b30;">
                    🛒 수레 현황: ⬜ ⬜ ⬜ (0/3)
                </div>
                <div id="monster-status-label" style="font-size:1.15rem; font-weight:bold; color:#00ffaa; padding:3px 10px; border-radius:6px; border:1px solid #00ffaa; background:rgba(0,255,170,0.08);">
                    일반 상태
                </div>
                <div id="battle-timer-label" style="font-size:1.15rem; font-weight:bold; color:#eee;">
                    전투 시간: 00:00
                </div>
            </div>

            <!-- Target Monster Showcase (Middle) -->
            <div class="game-hunt-monster-showcase" id="monster-showcase-panel" style="margin-bottom: 20px; position:relative; overflow:visible;">
                <img class="game-hunt-monster-img" id="fight-monster-img" src="img/monsters/${this.selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" />
                <div class="game-hunt-monster-name" id="fight-monster-title">${this.selectedMonster.nameKO}</div>
                
                <!-- Monster ATB Bar -->
                <div style="width: 70%; margin: 8px auto 0 auto; background:#333; height:8px; border-radius:4px; overflow:hidden; border:1px solid #444;">
                    <div id="monster-atb-fill" style="width: 0%; height:100%; background:#e58e26;"></div>
                </div>
                <div style="font-size:0.85rem; color:#aaa; margin-top:2px;">몬스터 행동 게이지</div>
            </div>

            <!-- 4 Weapons Grid (Bottom) -->
            <div class="game-hunt-weapons-grid">
                ${this.selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card" id="fight-card-${w.index}" style="position:relative; transition: transform 0.15s ease, border-color 0.15s ease;">
                    <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" />
                    <div class="game-hunt-weapon-name">${w.name}</div>
                    
                    <!-- HP Bar -->
                    <div class="game-hunt-hp-wrapper">
                        <div class="game-hunt-hp-fill" id="hp-fill-${w.index}" style="width: 100%; background:#2eff7b;"></div>
                        <div class="game-hunt-hp-text" id="hp-text-${w.index}">100 / 100</div>
                    </div>
                    
                    <!-- ATB Bar -->
                    <div style="width:90%; height:8px; background:#222; border-radius:4px; margin: 6px auto; overflow:hidden; border: 1px solid #333;">
                        <div class="game-hunt-atb-fill" id="atb-fill-${w.index}" style="width: 0%; height:100%; background:#00a8ff; transition: width 0.1s linear;"></div>
                    </div>

                    <div class="game-hunt-status-tag active" id="status-tag-${w.index}">전투 대기</div>
                </div>`).join('')}
            </div>

            <div class="game-hunt-log-panel" id="hunt-log-panel" style="height: 140px; overflow-y: hidden; text-align:left; background:rgba(0,0,0,0.7); border:1px solid #333; padding:10px; border-radius:8px; margin-top:20px; font-family:monospace; font-size:0.95rem; line-height: 1.6;">
                <div class="game-hunt-log-line" style="color: #00ffaa;">실시간 턴제 토벌 전투가 개시되었습니다! 게이지가 차면 공격을 가합니다!</div>
            </div>
        `;

        const logPanel = card.querySelector('#hunt-log-panel');
        const addLog = (text, color = '#eee') => {
            const line = document.createElement('div');
            line.className = 'game-hunt-log-line';
            line.style.color = color;
            line.textContent = text;
            logPanel.appendChild(line);
            if (logPanel.children.length > 5) {
                logPanel.removeChild(logPanel.firstChild);
            }
            logPanel.scrollTop = logPanel.scrollHeight;
        };

        const shakeMonster = () => {
            const showcase = card.querySelector('#monster-showcase-panel');
            if (showcase) {
                showcase.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
                setTimeout(() => showcase.style.transform = '', 100);
            }
        };

        const shakeWeapon = (idx, borderClr = '#ff3b30') => {
            const weaponCard = card.querySelector(`#fight-card-${idx}`);
            if (weaponCard) {
                weaponCard.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px) scale(0.95)`;
                weaponCard.style.borderColor = borderClr;
                setTimeout(() => {
                    weaponCard.style.transform = '';
                    weaponCard.style.borderColor = '';
                }, 150);
            }
        };

        const updateCartBoard = () => {
            const el = card.querySelector('#cart-counter-board');
            if (el) {
                let icons = "";
                for (let i = 1; i <= 3; i++) {
                    if (i <= this.cartCount) {
                        icons += "❌ ";
                    } else {
                        icons += "🛒 ";
                    }
                }
                el.textContent = `수레 현황: ${icons} (${this.cartCount}/3)`;
            }
        };

        let lastTimeSec = 0;
        this.climaxPhaseStarted = false;

        // --- Real-time ATB Simulation Loop (Every 100ms) ---
        this.fightInterval = setInterval(() => {
            if (this.phase !== 'fighting') return;

            // Timer Tick (1s interval check)
            const curTime = Date.now();
            if (lastTimeSec === 0) lastTimeSec = curTime;
            if (curTime - lastTimeSec >= 1000) {
                this.battleTime++;
                lastTimeSec = curTime;

                // Update Timer UI
                const min = String(Math.floor(this.battleTime / 60)).padStart(2, '0');
                const sec = String(this.battleTime % 60).padStart(2, '0');
                const timerLbl = card.querySelector('#battle-timer-label');
                if (timerLbl) timerLbl.textContent = `전투 시간: ${min}:${sec}`;

                // Handle dead weapon respawn countdown
                this.selectedWeapons.forEach(w => {
                    if (w.status === 'dead' && w.respawnTimer > 0) {
                        w.respawnTimer--;
                        const tag = card.querySelector(`#status-tag-${w.index}`);
                        if (tag) tag.textContent = `부활대기 (${w.respawnTimer}s)`;

                        if (w.respawnTimer <= 0) {
                            // Respawn triggered!
                            w.status = 'alive';
                            w.hp = w.maxHp;
                            w.sharpness = 100;
                            w.ammo = 5;
                            w.atb = 0;
                            w.comboIndex = 0;
                            this.playMHAsset('mh_aibo.mp3', '보이스콜'); // play "Aibo!" SFX
                            addLog(`✨ [부활] ${w.name}이(가) "아이보!" 소리와 함께 전장에 재참여하였습니다!`, '#00ffa3');
                            this.updateHpUI(card, w);
                            shakeWeapon(w.index, '#00ffa3');
                        }
                    }
                });

                // --- 1-Minute State Loop (normal -> enraged -> normal -> exhausted) ---
                const loopTime = this.battleTime % 240;
                let nextState = 'normal';
                
                if (loopTime >= 60 && loopTime < 120) {
                    nextState = 'enraged';
                } else if (loopTime >= 120 && loopTime < 180) {
                    nextState = 'normal';
                } else if (loopTime >= 180 && loopTime < 240) {
                    nextState = 'exhausted';
                }

                if (nextState !== this.monsterState) {
                    this.monsterState = nextState;
                    const statusLbl = card.querySelector('#monster-status-label');
                    const monsterTitle = card.querySelector('#fight-monster-title');
                    const monsterImg = card.querySelector('#fight-monster-img');

                    if (this.monsterState === 'enraged') {
                        this.monsterSpeed = 3.3; // 1.5x speed
                        if (statusLbl) {
                            statusLbl.textContent = '분노 상태';
                            statusLbl.style.color = '#ff3b30';
                            statusLbl.style.borderColor = '#ff3b30';
                            statusLbl.style.background = 'rgba(255,59,48,0.1)';
                        }
                        if (monsterTitle) {
                            monsterTitle.textContent = `😡 분노한 ${this.selectedMonster.nameKO} 😡`;
                            monsterTitle.style.color = '#ff3b30';
                        }
                        if (monsterImg) {
                            monsterImg.classList.add('enraged');
                        }
                        this.playMHAsset('mh_roar.mp3', '공습경보');
                        addLog(`🔥 [분노] ${this.selectedMonster.nameKO}이(가) 노성을 지르며 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                        shakeMonster();
                    } else if (this.monsterState === 'exhausted') {
                        this.monsterSpeed = 1.1; // 0.5x speed
                        if (statusLbl) {
                            statusLbl.textContent = '탈진 상태';
                            statusLbl.style.color = '#00a8ff';
                            statusLbl.style.borderColor = '#00a8ff';
                            statusLbl.style.background = 'rgba(0,168,255,0.1)';
                        }
                        if (monsterTitle) {
                            monsterTitle.textContent = `🤤 탈진한 ${this.selectedMonster.nameKO} 🤤`;
                            monsterTitle.style.color = '#00a8ff';
                        }
                        if (monsterImg) {
                            monsterImg.classList.remove('enraged');
                        }
                        this.playMHAsset('mh_cart.mp3', '운동많'); // soft tired sound fallback
                        addLog(`🤤 [탈진] ${this.selectedMonster.nameKO}이(가) 스태미나 고갈로 비틀거립니다! (속도 0.5배, 공격력 0.5배)`, '#00a8ff');
                        shakeMonster();
                    } else {
                        // normal
                        this.monsterSpeed = 2.2;
                        if (statusLbl) {
                            statusLbl.textContent = '일반 상태';
                            statusLbl.style.color = '#00ffaa';
                            statusLbl.style.borderColor = '#00ffaa';
                            statusLbl.style.background = 'rgba(0,255,170,0.08)';
                        }
                        if (monsterTitle) {
                            monsterTitle.textContent = this.selectedMonster.nameKO;
                            monsterTitle.style.color = '#ffaa00';
                        }
                        if (monsterImg) {
                            monsterImg.classList.remove('enraged');
                        }
                        addLog(`📢 ${this.selectedMonster.nameKO}이(가) 진정하여 평상시로 돌아왔습니다.`, '#eee');
                    }
                }
            }

            // --- ATB Accumulation ---
            const aliveWeapons = this.selectedWeapons.filter(w => w.status !== 'dead');
            
            // Check quest fail conditions (3 carts)
            if (this.cartCount >= 3) {
                this.endGame(container, false);
                return;
            }

            // Check victory conditions
            if (this.monsterHp <= 0) {
                // If only 1 weapon survives, make it entering ending phase or resolve.
                const aliveList = this.selectedWeapons.filter(w => w.status === 'alive');
                const winner = aliveList.length > 0 ? aliveList[0] : this.selectedWeapons[0];
                this.endGame(container, true, winner);
                return;
            }

            // Accumulate Monster ATB
            this.monsterAtb = Math.min(100, this.monsterAtb + this.monsterSpeed);
            const monsterAtbFill = card.querySelector('#monster-atb-fill');
            if (monsterAtbFill) monsterAtbFill.style.width = `${this.monsterAtb}%`;

            // Accumulate Weapon ATBs
            this.selectedWeapons.forEach(w => {
                if (w.status !== 'dead') {
                    let fillRate = 2.0; // default normal
                    if (w.speedGroup === 'very_fast') fillRate = 4.0;
                    else if (w.speedGroup === 'fast') fillRate = 3.0;
                    else if (w.speedGroup === 'slow') fillRate = 1.3;

                    w.atb = Math.min(100, w.atb + fillRate);
                    const fill = card.querySelector(`#atb-fill-${w.index}`);
                    if (fill) fill.style.width = `${w.atb}%`;

                    const tag = card.querySelector(`#status-tag-${w.index}`);
                    if (tag && w.status === 'alive') {
                        tag.textContent = `대기 (${Math.floor(w.atb)}%)`;
                    }
                }
            });

            // --- Execute Turns ---

            // A. Monster Turn
            if (this.monsterAtb >= 100) {
                this.monsterAtb = 0;
                
                // Select random alive target to hit
                const targetable = this.selectedWeapons.filter(w => w.status === 'alive');
                if (targetable.length > 0) {
                    const target = targetable[Math.floor(Math.random() * targetable.length)];
                    
                    // Choose attack name
                    const list = this.MONSTER_ATTACKS[this.selectedMonster.id] || this.MONSTER_ATTACKS.default;
                    const attackName = list[Math.floor(Math.random() * list.length)];

                    // Damage calculation (rage modifier)
                    let dmgMod = 1.0;
                    if (this.monsterState === 'enraged') dmgMod = 1.5;
                    else if (this.monsterState === 'exhausted') dmgMod = 0.5;

                    let baseDmg = 10 + Math.floor(Math.random() * 11); // base 10~20
                    let damage = Math.floor(baseDmg * dmgMod);

                    // Shield / Dodge roll check
                    const defendRoll = Math.random();
                    let isGuard = false;
                    let isDodge = false;

                    // HBG has shield too!
                    const hasShield = target.type === 'shield' || target.id === 'heavy_bowgun';

                    if (hasShield && defendRoll < 0.45) {
                        damage = Math.max(1, Math.floor(damage * 0.15)); // Guard blocks 85%
                        isGuard = true;
                    } else if (!hasShield && defendRoll < 0.35) {
                        damage = 0; // Dodge evades 100%
                        isDodge = true;
                    }

                    if (damage > 0) {
                        // Moxie check
                        if (target.hp - damage <= 0 && target.hasMoxie && Math.random() < 0.75) {
                            target.hp = 1;
                            target.hasMoxie = false;
                            addLog(`🔥 [근성 발휘!] ${target.name}이(가) ${this.selectedMonster.nameKO}의 치명타를 입고 근성으로 1 HP 생존했습니다!`, '#ffaa00');
                            this.playMHAsset('mh_guard.mp3', '보이스콜');
                            shakeWeapon(target.index, '#00ffa3');
                        } else {
                            target.hp = Math.max(0, target.hp - damage);
                            if (isGuard) {
                                addLog(`🛡️ [방패 가드] ${target.name}이(가) 몬스터의 [${attackName}]을 방어했습니다! (-${damage} HP)`, '#00ffff');
                                this.playMHAsset('mh_guard.mp3', '팅!1');
                                shakeWeapon(target.index, '#00ffff');
                            } else {
                                addLog(`💥 [공격] ${this.selectedMonster.nameKO}이(가) [${attackName}] 시전! ${target.name}에게 피해! (-${damage} HP)`, '#ff5555');
                                this.playMHAsset('mh_hit.mp3', '꺄악'); // play high quality hit sound
                                shakeMonster();
                                shakeWeapon(target.index);

                                // Stun check (15% chance on raw damage if still alive)
                                if (target.hp > 0 && Math.random() < 0.15) {
                                    target.status = 'stunned';
                                    const weaponCard = card.querySelector(`#fight-card-${target.index}`);
                                    if (weaponCard) {
                                        weaponCard.classList.add('stunned');
                                    }
                                    const tag = card.querySelector(`#status-tag-${target.index}`);
                                    if (tag) {
                                        tag.textContent = '기절 상태';
                                        tag.className = 'game-hunt-status-tag stunned';
                                    }
                                    addLog(`🌀 [기절] ${target.name}이(가) 큰 충격으로 기절했습니다! 다음 턴 행동 불가!`, '#e58e26');
                                    shakeWeapon(target.index, '#e58e26');
                                }
                            }
                        }
                    } else {
                        // Evaded
                        addLog(`💨 [구르기 회피] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 구르기로 피했습니다!`, '#2eff7b');
                        this.playMHAsset('mh_dodge.mp3', '윽!');
                        shakeWeapon(target.index, '#2eff7b');
                    }

                    // Sharpness/Ammo loss on hit
                    if (damage > 0 && !isDodge) {
                        if (target.type === 'ranged') {
                            target.ammo = Math.max(0, target.ammo - 1);
                        } else {
                            target.sharpness = Math.max(0, target.sharpness - 8);
                        }
                    }

                    this.updateHpUI(card, target);

                    // Death / Cart check
                    if (target.hp <= 0) {
                        target.status = 'dead';
                        this.cartCount++;
                        updateCartBoard();
                        this.triggerCartAnimation(target);

                        if (this.cartCount >= 3) {
                            addLog(`☠️ [퀘스트 실패] 3회 수레를 타서 퀘스트 전멸 실패했습니다!`, '#ff0055');
                        } else {
                            target.respawnTimer = 5; // 5 seconds respawn time
                            addLog(`🚨 [수레행] ${target.name}이(가) 쓰러졌습니다! 5초 후 부활합니다. (현재 수레: ${this.cartCount}/3)`, '#ff3b30');
                            this.playMHAsset('mh_cart.mp3', '안돼');
                        }
                    }
                }
            }

            // B. Weapon Turns
            for (const w of this.selectedWeapons) {
                if ((w.status === 'alive' || w.status === 'stunned') && w.atb >= 100) {
                    w.atb = 0; // consume ATB

                    // I. Stunned status recover logic
                    if (w.status === 'stunned') {
                        w.status = 'alive';
                        const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                        if (weaponCard) {
                            weaponCard.classList.remove('stunned');
                        }
                        const tag = card.querySelector(`#status-tag-${w.index}`);
                        if (tag) {
                            tag.textContent = `대기 (0%)`;
                            tag.className = 'game-hunt-status-tag active';
                        }
                        addLog(`🌀 ${w.name}이(가) 기절 충격에서 깨어나며 턴을 소비했습니다.`, '#eee');
                        continue;
                    }

                    // II. Lifepowder chance (10% global team heal)
                    if (Math.random() < 0.10) {
                        const members = this.selectedWeapons.filter(member => member.status === 'alive');
                        members.forEach(m => m.hp = Math.min(m.maxHp, m.hp + 30));
                        addLog(`💚 [치유의 가루] ${w.name}이(가) 생명의 가루를 흩뿌려 파티원 전원의 체력을 회복합니다! (+30 HP)`, '#2eff7b');
                        this.playMHAsset('mh_dust.mp3', '대박');
                        this.selectedWeapons.forEach(m => this.updateHpUI(card, m));
                        shakeWeapon(w.index, '#2eff7b');
                        continue;
                    }

                    // III. Emergency Potion Heal check (HP < 70, 35% chance)
                    if (w.hp < 70 && Math.random() < 0.35) {
                        const heal = 25 + Math.floor(Math.random() * 16); // 25~40
                        w.hp = Math.min(w.maxHp, w.hp + heal);
                        addLog(`💚 [회복] ${w.name}이(가) 비약을 복용하여 상처를 치유합니다! (+${heal} HP)`, '#2eff7b');
                        this.playMHAsset('mh_potion.mp3', '대박');
                        this.updateHpUI(card, w);
                        shakeWeapon(w.index, '#2eff7b');
                        continue;
                    }

                    // IV. Ranged Reload check
                    if (w.type === 'ranged' && w.ammo <= 0) {
                        w.ammo = 5;
                        addLog(`🔄 [재장전] ${w.name}이(가) 탄창을 갈고 재장전을 실행합니다.`, '#00a8ff');
                        this.playMHAsset('mh_reload.mp3', '수류탄');
                        shakeWeapon(w.index, '#00a8ff');
                        continue;
                    }

                    // V. Melee Sharpness check
                    if (w.type !== 'ranged' && w.sharpness <= 30) {
                        w.sharpness = 100;
                        addLog(`✨ [숫돌질] ${w.name}이(가) 구석에서 숫돌을 갈아 예리도를 회복합니다!`, '#ffaa00');
                        this.playMHAsset('mh_sharpen.mp3', '예쁜칼');
                        shakeWeapon(w.index, '#ffaa00');
                        continue;
                    }

                    // VI. Execute Wilds Combo Attack!
                    const combos = this.COMBO_LIST[w.id] || [];
                    const currentCombo = combos[w.comboIndex];
                    
                    if (currentCombo) {
                        let damage = currentCombo.dmg;
                        
                        // Sharpness debuff check
                        let isDull = false;
                        if (w.type !== 'ranged' && w.sharpness <= 30) {
                            damage = Math.floor(damage * 0.5);
                            isDull = true;
                        }

                        // Consume resources
                        if (w.type === 'ranged') {
                            w.ammo = Math.max(0, w.ammo - (currentCombo.ammo || 1));
                        } else {
                            w.sharpness = Math.max(0, w.sharpness - (currentCombo.sharp || 5));
                        }

                        // Update monster HP
                        this.monsterHp = Math.max(0, this.monsterHp - damage);
                        const monsterHpFill = card.querySelector('#monster-hp-fill');
                        const monsterHpText = card.querySelector('#monster-hp-text');
                        if (monsterHpFill) monsterHpFill.style.width = `${(this.monsterHp / this.monsterMaxHp) * 100}%`;
                        if (monsterHpText) monsterHpText.textContent = `${this.monsterHp} / ${this.monsterMaxHp}`;

                        // Logging
                        if (currentCombo.special) {
                            addLog(`⚔️ [연계-${w.comboIndex+1}] ${w.name}: ${currentCombo.name}! ${currentCombo.special} (-${damage} HP)`, '#ffaa00');
                        } else if (isDull) {
                            addLog(`⚔️ [무딘 벰] ${w.name}이(가) 예리도 소모 상태로 공격을 가해 피해가 반감되었습니다! (-${damage} HP)`, '#aaaaaa');
                        } else {
                            addLog(`⚔️ [연계-${w.comboIndex+1}] ${w.name}의 [${currentCombo.name}] 시전! 몬스터를 타격! (-${damage} HP)`, '#eee');
                        }

                        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['발차기'] || '발차기');
                        shakeMonster();
                        shakeWeapon(w.index, '#ff9500');

                        // Advance combo index
                        w.comboIndex = (w.comboIndex + 1) % combos.length;
                    }
                }
            }

        }, 100);
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
                tag.style.background = '#ff0055';
            }
            if (wcard) {
                wcard.classList.add('dead');
                wcard.classList.remove('stunned');
            }
            if (fill) fill.style.width = '0%';
        } else {
            if (tag) {
                if (weapon.status === 'stunned') {
                    tag.textContent = '기절 상태';
                    tag.className = 'game-hunt-status-tag stunned';
                    tag.style.background = '#e58e26';
                } else {
                    tag.textContent = `대기 (${Math.floor(weapon.atb)}%)`;
                    tag.className = 'game-hunt-status-tag active';
                    tag.style.background = '';
                }
            }
            if (wcard) {
                wcard.classList.remove('dead');
                if (weapon.status !== 'stunned') {
                    wcard.classList.remove('stunned');
                } else {
                    wcard.classList.add('stunned');
                }
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
            // Quest failed banner (uses cart failure image style)
            card.innerHTML = `
                <div class="game-title" style="font-size:3.5rem; color:#ff3b30; font-weight:bold; text-shadow:0 0 20px rgba(255,59,48,0.5); margin-bottom:20px;">
                    ☠️ 퀘스트 실패 (3수레 전멸) ☠️
                </div>
                <div style="font-size:2.2rem; color:#fff; margin-bottom:20px;">
                    3번의 수레 탑승 누적으로 수렵 퀘스트가 강제 종료되었습니다.
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
