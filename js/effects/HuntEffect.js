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
        this.winBgm = null;
        this.winBgmPromise = null;

        // Configuration
        this.SHOW_MONSTER_HP = true; // Toggle monster HP display

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

        // MHW Monster Attacks Map
                this.MONSTER_ATTACKS = window.MONSTER_ATTACKS || {
            rathalos: ["화룡의 포효", "화염구 브레스", "독조강습 타격", "꼬리 휩쓸기", "돌진 몸통박치기"],
            diablos: ["각룡의 포효", "지중 급습 쳐올리기", "각공격 들이받기", "꼬리 회전치기", "돌진 덮치기"],
            nergigante: ["멸진룡의 포효", "파멸의 일격 (지면 덮치기)", "가시 파편 발사", "날개 지면 강강타", "앞발 내려치기"],
            zinogre: ["뇌랑룡의 포효", "연속 전뇌 펀치", "등 찍기 폭발", "초전도 번개벼락", "꼬리 공중 회전베기"],
            velkhana: ["빙룡의 포효", "빙벽 생성 강타", "얼음 브레스 방출", "고리형 절대영도 폭발", "꼬리 얼음칼 찌르기"],
            default: ["포효 위협", "몸통 박치기", "꼬리 후려치기", "성난 돌진 공격"]
        };

        // Monster Hunter Wilds Combo Sequences Map
        this.COMBO_LIST = window.HUNT_COMBO_LIST || {
            great_sword: [
                { name: "발차기", dmg: 70, sharp: 0, stun: 20, nextSpeed: "very_fast", soundKey: ["발차기!"], special: "🦶 [발차기] 매우 빠른 발차기로 몬스터의 턱을 걷어찹니다!" },
                { name: "모아베기", dmg: 290, sharp: -8, stun: 10, nextSpeed: "slow", soundKey: ["아주강력해", "기가맥", "개꿀잼"] },
                { name: "강모아베기", dmg: 420, sharp: -10, stun: 20, nextSpeed: "slow", soundKey: ["아주강력해", "성공!", "개꿀잼"], special: "💥 [강모아베기] 더욱 힘을 실은 모아베기로 몬스터를 강하게 내려칩니다!" },
                { name: "참모아베기", dmg: 680, sharp: -15, stun: 30, nextSpeed: "slow", soundKey: ["아주강력해", "성공!", "상쾌해", "개꿀잼"], special: "💥 [역경직] 파괴적인 참모아베기가 몬스터에게 작렬합니다!" }
            ],
            long_sword: [
                { name: "세로베기", dmg: 100, sharp: -3 },
                { name: "기인베기 I", dmg: 140, sharp: -4 },
                { name: "기인베기 II", dmg: 180, sharp: -4 },
                { name: "기인투구깨기", dmg: 480, sharp: -12, special: "⚡ [연타] 붉은 기인 게이지를 격발시켜 투구깨기 찌르기를 먹였습니다!" }
            ],
            sword_shield: [
                { name: "돌진베기", dmg: 70, sharp: -2, stun: 0 },
                { name: "방패치기", dmg: 60, sharp: 0, stun: 60, special: "🛡️ [방패타격] 방패 모서리로 몬스터의 정수리를 강하게 들이받습니다!" },
                { name: "저스트 러시 I", dmg: 120, sharp: -3, stun: 0 },
                { name: "저스트 러시 II", dmg: 160, sharp: -3, stun: 0 },
                { name: "폴배시 (방패강습)", dmg: 380, sharp: -8, stun: 90 }
            ],
            dual_blades: [
                { name: "귀인화 진입", dmg: 60, sharp: -2, special: "👹 [귀인화] 안개를 뿜어내며 기동성과 파괴력을 극대화합니다!" },
                { name: "귀인돌진연참", dmg: 150, sharp: -6 },
                { name: "귀인 난무", dmg: 460, sharp: -16, special: "🌀 [난무] 제자리에서 몬스터의 약점을 잘게 썰어 대량의 출혈을 냅니다!" },
                { name: "공중 회전 난무 (리와이베기)", dmg: 520, sharp: -18, special: "💫 [리와이베기] 공중으로 도약, 몬스터 위에서 고속 회전 난무를 퍼붓습니다!" }
            ],
            hammer: [
                { name: "쿵 쿵 따", dmg: 260, sharp: -6, stun: 50 },
                { name: "키프 스웨이", dmg: 70, sharp: -2, stun: 10, special: "🌀 [키프 스웨이] 해머를 든 채 빠르게 옆으로 회전하며 회피 기동을 실행합니다!" },
                { name: "2차지 어퍼!", dmg: 210, sharp: -5, stun: 60 },
                { name: "3차지 내려치기", dmg: 380, sharp: -8, stun: 90 },
                { name: "회전 회오리!!!", dmg: 620, sharp: -15, stun: 180, special: "🌀 [회전회오리] 온 힘을 실어 공중으로 도약해 해머를 7회 연속 회전시키며 몬스터의 정수리를 분쇄합니다!" }
            ],
            hunting_horn: [
                { name: "음표 공격 I (적)", dmg: 90, sharp: -3, stun: 20, special: "🎵 [자가강화] 신나는 연주로 파티원 전원의 이동 속도를 증가시킵니다." },
                { name: "향음타 (피리 연주 회복)", dmg: 120, sharp: -4, stun: 30, special: "🎵 [피리 연주 회복] 향음 연주를 격발시켜 파티원 전체의 체력을 회복시킵니다! (+25 HP)" },
                { name: "삼중 연주 (공격력 UP)", dmg: 380, sharp: -8, stun: 80, special: "🎺 [공대UP] 공격력 대폭 상승 연주 버프를 아군 전체에 적용합니다!" }
            ],
            charge_blade: [
                { name: "검 모아 2단베기", dmg: 130, sharp: -4, nextSpeed: "very_fast" },
                { name: "방패치기", dmg: 90, sharp: 0, stun: 30, nextSpeed: "very_fast" },
                { name: "병충전", dmg: 0, sharp: 0, nextSpeed: "very_fast", special: "⚡ [병충전] 검 격침 게이지를 병에 주입하여 phial을 모두 충전합니다! (병 5개 충전)" },
                { name: "변형 (검→도끼)", dmg: 150, sharp: -5, special: "⚙️ [속성변형] 검과 방패를 합체하여 거대한 도끼 모드로 변형합니다!", nextSpeed: "slow" },
                { name: "도끼 속성해방베기 I", dmg: 220, sharp: -6, nextSpeed: "slow" },
                { name: "고출력 속성해방베기", dmg: 350, sharp: -8, nextSpeed: "slow", special: "⚡ [고출력] 축적된 에너지를 해방하여 몬스터에게 강한 충격파를 방출합니다!" },
                { name: "초고출력 속성해방베기", dmg: 400, sharp: -15, special: "💥 [초고출력] 병 전량을 일시에 격발해 지면을 내리치며 대자연의 전격을 방출합니다!", nextSpeed: "slow" },
                { name: "변형 (도끼→검)", dmg: 120, sharp: -3, special: "⚙️ [속성변형] 도끼를 분리하여 가벼운 검과 방패의 검 모드로 변형합니다!", nextSpeed: "very_fast" }
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
                { name: "풀버스트", dmg: 480, sharp: -18, special: "💥 [풀버스트] 장전된 잔탄을 일시에 격발해 대규모 화력 폭발을 냅니다!" },
                { name: "용격포", dmg: 680, sharp: -25, special: "💥 [용격포] 전탄 압축 화염을 격발하여 대재앙의 열량을 방출합니다! (30초간 과열)" }
            ],
            switch_axe: [
                { name: "도끼 세로베기", dmg: 120, sharp: -4 },
                { name: "검 변형 2단베기", dmg: 230, sharp: -6 },
                { name: "기 속성 해방 찌르기", dmg: 520, sharp: -12, special: "⚡ [해방] 검날을 쑤셔 넣고 톱니가 구르며 거대한 속성 폭발을 터트립니다!" }
            ],
            insect_glaive: [
                { name: "진액 추출", dmg: 80, sharp: -2, special: "🐝 [진액] 엽충을 부려 몬스터의 몸에서 3색 진액을 모아 도핑합니다." },
                { name: "비원베기", dmg: 180, sharp: -4 },
                { name: "급습찌르기 (강하)", dmg: 420, sharp: -8 }
            ],
            light_bowgun: [
                { name: "일반탄 사격", dmg: 100, ammo: -1 },
                { name: "기폭용탄 설치", dmg: 180, ammo: -1, special: "💣 [기폭용탄] 아군 탄환 공격에 유도 감응하여 기폭되는 유탄 지뢰를놓습니다." },
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
        if (this.isActive) {
            console.warn("Monster hunt game is already active. Ignoring double trigger.");
            return;
        }
        this.director.activeGame = this;
        this.isActive = true;
        this.phase = 'voting';
        this.bets = {};
        this.climaxTimer = null;

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

        // Parse custom target name or consecutive count from !?�렵 or !?�벌 command
        let targetMonsterName = null;
        let consecutiveCount = 1;

        if (context && context.message) {
            const trimmed = context.message.trim();
            // Match "!수렵" or "!토벌" followed optionally by spaces, followed by a number 1-10 (optionally followed by "마리" or non-digit suffix)
            const match = trimmed.match(/^!(수렵|토벌)\s*([1-9]|10)(?![0-9])/);
            if (match) {
                consecutiveCount = parseInt(match[2], 10);
            } else {
                const parts = trimmed.split(/\s+/);
                if (parts.length > 1) {
                    targetMonsterName = parts.slice(1).join(" ");
                }
            }
        }

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
        
        const shuffledWeapons = [...this.WEAPONS].sort(() => Math.random() - 0.5);
        // 성향 6종: 공격형/밸런스형/수비형/베테랑/서포터/몬린이 (각 weight 반영)
        const personalities = ['offensive', 'offensive', 'normal', 'normal', 'defensive', 'veteran', 'support', 'newbie'];
        this.selectedWeapons = shuffledWeapons.slice(0, 4).map((w, index) => {
            const initialSpeedGroup = w.id === 'charge_blade' ? 'very_fast' : w.speedGroup;
            const personality = personalities[Math.floor(Math.random() * personalities.length)];
            return {
                ...w,
                speedGroup: initialSpeedGroup,
                index,
                hp: 100,
                maxHp: 100,
                status: 'alive', // 'alive', 'dead', 'stunned'
                sharpness: 100,  // only for melee/shield
                ammo: 5,        // only for ranged
                hasMoxie: true,  // Moxie safety net (1 time per weapon)
                atb: 0,
                comboIndex: 0,
                respawnTimer: 0,
                personality: personality,
                potions: 10,
                lifepowders: 1,       // 팀 힐 아이템 (라이프파우더)
                spiritLevel: 0,       // 태도 전용: 기인 게이지 레벨 (0~3)
                demonModeDuration: 0, // 쌍검 전용: 귀인화 지속시간 (초)
                phials: 5,            // 차지액스 전용: 병 개수 (0~5)
                overheatDuration: 0,  // 건랜스 전용: 오버히트 남은 시간 (초)
                extractBuffs: { red: 0, white: 0, orange: 0 }, // 조충곤 전용: 진액 상태
                extractDuration: 0    // 조충곤 전용: 3색 버프 지속시간 (초)
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
        } else if (targetMonsterName) {
            voteTitle = `⚔️ 지정 수렵 모집! ⚔️`;
        }

        // Build monster showcase section dynamically
        let monsterShowcaseHTML = '';
        if (this.consecutiveTotal > 1) {
            monsterShowcaseHTML = `
                <div class="game-hunt-monster-showcase" style="margin-bottom: 25px; width: 90%; margin-left: auto; margin-right: auto; padding: 20px 25px;">
                    <div style="font-size: 1.3rem; color: #ffaa00; font-weight: bold; margin-bottom: 15px;">연속 수렵 대상 (${this.consecutiveTotal}마리)</div>
                    <div style="display:flex; justify-content:center; gap:25px; align-items:center; width: 100%;">
                        ${this.consecutiveQueue.map((m, idx) => `
                            <div style="display:flex; flex-direction:column; align-items:center; position:relative; width: 110px;">
                                <div style="position:absolute; top:-12px; left:-12px; background:#ffaa00; color:#111; font-weight:bold; border-radius:50%; width:26px; height:26px; display:flex; justify-content:center; align-items:center; font-size:0.9rem; border:2px solid #111; z-index:10;">
                                    ${idx + 1}
                                </div>
                                <img class="game-hunt-monster-img" src="img/monsters/${m.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width:105px; height:105px; border-radius:18px; border:2.5px solid #ffaa00; box-shadow:0 0 15px rgba(255,170,0,0.35); background:rgba(0,0,0,0.6);" />
                                <div style="font-size:1.1rem; font-weight:bold; color:#ffaa00; margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:115px;" title="${m.nameKO}">${m.nameKO}</div>
                            </div>
                            ${idx < this.consecutiveQueue.length - 1 ? '<div style="font-size:2.2rem; color:#ffaa00; font-weight:bold; opacity:0.6; margin: 0 5px;">→</div>' : ''}
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            monsterShowcaseHTML = `
                <div class="game-hunt-monster-showcase" style="margin-bottom: 25px;">
                    <div style="font-size: 1.25rem; color: #ffaa00; font-weight: bold; margin-bottom: 8px;">수렵 대상 몬스터</div>
                    <img class="game-hunt-monster-img" src="img/monsters/${this.selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" />
                    <div class="game-hunt-monster-name">${this.selectedMonster.nameKO}</div>
                </div>
            `;
        }

        // Create Betting UI
        const container = document.createElement('div');
        container.className = 'game-overlay-container';
        container.innerHTML = `
            <div class="game-hunt-card">
                <div class="game-title" style="font-size:2.8rem; background: linear-gradient(90deg, #ffaa00, #ff5500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight:bold; margin-bottom:10px;">
                    ${voteTitle}
                </div>
                <div class="game-subtitle" style="font-size:1.3rem; color:#ccc; margin-bottom: 25px;">
                    ${voteSubtitle}
                </div>

                ${monsterShowcaseHTML}

                <div class="game-hunt-weapons-grid">
                    ${(() => {
                        const pMap = {
                            veteran:   { label: "베테랑",  bg: "rgba(255,200,0,0.2)",   border: "#ffc800", color: "#ffc800" },
                            support:   { label: "서포터",  bg: "rgba(0,220,100,0.2)",   border: "#00dc64", color: "#00dc64" },
                            newbie:    { label: "몬린이",  bg: "rgba(100,200,255,0.2)", border: "#64c8ff", color: "#64c8ff" },
                            offensive: { label: "공격형",  bg: "rgba(255,60,60,0.2)",   border: "#ff3c3c", color: "#ff3c3c" },
                            defensive: { label: "수비형",  bg: "rgba(80,140,255,0.2)",  border: "#508cff", color: "#508cff" },
                            normal:    { label: "밸런스",  bg: "rgba(160,160,160,0.2)", border: "#aaa",    color: "#aaa"    },
                        };
                        return this.selectedWeapons.map(w => {
                            const p = pMap[w.personality] || pMap.normal;
                            return `
                    <div class="game-hunt-weapon-card" id="hunt-opt-${w.index}">
                        <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" />
                        <div class="game-hunt-weapon-name" style="font-size:1.6rem;font-weight:bold;color:#ffaa00;">${w.name}</div>
                        <div style="font-size:0.82rem;font-weight:bold;background:${p.bg};border:1px solid ${p.border};border-radius:6px;padding:2px 8px;margin-top:4px;margin-bottom:6px;color:${p.color};">${p.label}</div>
                        <div style="font-size:0.9rem;color:#fff;font-weight:bold;background:rgba(0,170,255,0.25);border:1px solid rgba(0,170,255,0.4);border-radius:6px;padding:3px 0;margin-top:2px;margin-bottom:8px;">참가 번호: ${w.index + 1}</div>
                        <div class="bet-count" style="font-size:1.05rem;color:#aaa;font-weight:bold;">0명 신청</div>
                    </div>`;
                        }).join("");
                    })()} 
                </div>

                <div class="game-timer" style="font-size:1.8rem; font-weight:bold; color:#ff5500; margin-top:20px;">참가 모집 시간: 30초</div>
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
                    opt.querySelector('.bet-count').textContent = `${counts[i]}명 신청`;
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
                    timerEl.textContent = `참가 모집 시간: ${timeLeft}초`;
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
        if (fallbackKey) {
            this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[fallbackKey] || fallbackKey);
        }
    }

    getMonsterBgm(monsterName) {
        const name = (monsterName || "").toLowerCase();

        // Specific Monster BGMs
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

        // Map Areas
        // Ancient Forest
        if (name.includes('안쟈나프') || name.includes('anjan') || 
            name.includes('리오레우스') || name.includes('rathalos') ||
            name.includes('리오레이아') || name.includes('rathian') ||
            name.includes('푸케푸케') || name.includes('pukei') ||
            name.includes('도스쟈그라스') || name.includes('jagras') ||
            name.includes('토비카가치') || name.includes('kadachi') ||
            name.includes('쿠루루야쿠') || name.includes('kulu')) {
            return 'BGM/MHW_Ancient_Forest.mp3';
        }

        // Wildspire Waste
        if (name.includes('디아블로스') || name.includes('diablos') ||
            name.includes('볼보로스') || name.includes('barroth') ||
            name.includes('쥬라토도스') || name.includes('jyuratodus')) {
            return 'BGM/MHW_Wildspire_Waste.mp3';
        }

        // Coral Highlands
        if (name.includes('레이기에나') || name.includes('legiana') ||
            name.includes('파오우르무') || name.includes('paolumu') ||
            name.includes('치치야쿠') || name.includes('tzitzi') ||
            name.includes('치치') || name.includes('푸케푸케 아종') || name.includes('coral_pukei')) {
            return 'BGM/MHW_Coral_Highlands.mp3';
        }

        // Rotten Vale
        if (name.includes('오도가론') || name.includes('odogaron') ||
            name.includes('도스기르오스') || name.includes('girros') ||
            name.includes('라도발킨') || name.includes('radobaan')) {
            return 'BGM/MHW_Rotten_Vale.mp3';
        }

        // Elder's Recess
        if (name.includes('도도가마') || name.includes('dodogama') ||
            name.includes('우라간킨') || name.includes('uragaan') ||
            name.includes('볼가노스') || name.includes('lavasioth')) {
            return 'BGM/MHW_Elders_Recess.mp3';
        }

        // Hoarfrost Reach
        if (name.includes('버프바로') || name.includes('banbaro') ||
            name.includes('베리오로스') || name.includes('barioth') ||
            name.includes('브란토도스') || name.includes('beotodus')) {
            return 'BGM/MHWI_Hoarfrost_Reach.mp3';
        }

        // Generations Ultimate Arena theme fallback for others
        return 'BGM/MHGU_Arena.mp3';
    }

    startFight(container) {
        this.phase = 'fighting';
        this.stopBgms();

        // Assign a random voter name to each selected weapon as the "hunter"
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

        // Play Battle BGM
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

        // Play start SFX
        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가기'] || '가기');

        // Play departure SFX
        this.playMHAudioFile('Unified_SFX/MH - Hunters Depart (MH3U).mp3');

        // Determine monster tier & stats
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

        // Battle stats init
        this.cartCount = 0;
        this.monsterHp = baseHp;
        this.monsterMaxHp = baseHp;
        this.monsterAtb = 0;
        this.monsterSpeed = 2.2 * this.monsterAtbSpeedMod;
        this.monsterState = 'normal'; // 'normal', 'enraged', 'exhausted'
        this.battleTime = 0;
        this.monsterStunAccum = 0;
        this.monsterStunThreshold = baseStunThreshold;
        this.monsterStunDuration = 0;
        this.monsterKnockdownDuration = 0;
        this.monsterKnockdownTriggered = { 80: false, 60: false, 40: false, 20: false };

        const hpLabelText = this.consecutiveTotal > 1 
            ? `👾 [연속 수렵 ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`
            : `👾 [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력]`;

        // Build UI with Top Monster HP Bar, ATB Gauges and Cart board
        const card = container.querySelector('.game-hunt-card');
        card.style.position = 'relative';
        card.innerHTML = `
            <div id="game-hunt-top-panel">
                <!-- Monster HP Bar -->
                <div class="game-hunt-monster-hp-container" style="${this.SHOW_MONSTER_HP ? '' : 'display:none;'} margin-bottom: 15px;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.15rem; color:#ffaa00; margin-bottom:4px;">
                        <span>${hpLabelText}</span>
                        <span id="monster-hp-text">12000 / 12000</span>
                    </div>
                    <div class="game-hunt-monster-hp-wrapper" style="width:100%; height:20px; background:#222; border: 2px solid #555; border-radius:10px; overflow:hidden; position:relative;">
                        <div id="monster-hp-fill" style="width:100%; height:100%; background:linear-gradient(90deg, #ff3b30, #ff9500); transition: width 0.15s ease-out;"></div>
                    </div>
                </div>

                <!-- Header Info (Carts, Rage Loop, BGM status) -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:rgba(0,0,0,0.4); padding:10px 15px; border-radius:10px;">
                    <div id="cart-counter-board" style="font-size:1.15rem; font-weight:bold; color:#ff3b30;">
                        🛒 수레 상황: 0/3
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
            </div>

            <!-- 4 Weapons Grid (Bottom) -->
            <div class="game-hunt-weapons-grid">
                ${this.selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card" id="fight-card-${w.index}" style="position:relative; transition: transform 0.15s ease, border-color 0.15s ease;">
                    <div class="game-hunt-weapon-img-container" style="position: relative; width: 95px; height: 95px; margin: 0 auto 12px;">
                        <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" style="margin: 0;" />
                        ${w.id === 'gunlance' ? `
                            <div class="gunlance-overheat-overlay" id="overheat-overlay-${w.index}" style="position: absolute; top: 0; left: 0; width: 95px; height: 95px; background: linear-gradient(180deg, #ff3b30 0%, #ff9500 100%); mask-image: url('img/weapons/gunlance.svg'); -webkit-mask-image: url('img/weapons/gunlance.svg'); mask-size: 95px 95px; -webkit-mask-size: 95px 95px; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; pointer-events: none; transition: clip-path 0.3s ease; clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0 0 0);"></div>
                        ` : ''}
                        ${w.id === 'charge_blade' ? `
                            <div class="cb-phial-dots" id="cb-phials-${w.index}" style="position: absolute; bottom: 0; right: 0; display: flex; gap: 2px; background: rgba(0,0,0,0.6); padding: 2px 4px; border-radius: 4px; pointer-events: none;">
                                ${Array.from({length: 5}).map((_, i) => `
                                    <span class="cb-dot" style="font-size: 0.8rem; color: #ffffff; line-height: 1; transition: opacity 0.2s;">
                                        ${i < (w.phials !== undefined ? w.phials : 5) ? '●' : '○'}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${w.id === 'insect_glaive' ? `
                            <div class="ig-extracts" id="ig-extracts-${w.index}" style="position: absolute; bottom: 0; right: 0; display: flex; gap: 4px; background: rgba(0,0,0,0.6); padding: 2px 4px; border-radius: 4px; pointer-events: none;">
                                <span class="ig-dot red" style="font-size: 0.8rem; color: ${w.extractBuffs && w.extractBuffs.red ? '#ff3b30' : '#444'}; line-height: 1;">●</span>
                                <span class="ig-dot white" style="font-size: 0.8rem; color: ${w.extractBuffs && w.extractBuffs.white ? '#ffffff' : '#444'}; line-height: 1;">●</span>
                                <span class="ig-dot orange" style="font-size: 0.8rem; color: ${w.extractBuffs && w.extractBuffs.orange ? '#ff9500' : '#444'}; line-height: 1;">●</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="game-hunt-weapon-name" style="font-size: 2.1rem; font-weight: bold; color:${w.hunterColor || '#ffaa00'}; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; margin-bottom: 4px;">
                        👤 ${w.hunterName}
                    </div>
                    
                    <div id="personality-tag-${w.index}" style="font-size:0.85rem; color:#aaa; margin-top:2px; margin-bottom:8px; display:flex; justify-content:center; gap:8px;">
                        <span style="color: #ffaa00; font-weight: bold;">${w.name}</span>
                        <span>|</span>
                        <span>성향: ${
                            w.personality === 'offensive' ? '💥 공격형' : 
                            w.personality === 'defensive' ? '🛡️ 수비형' : 
                            w.personality === 'veteran' ? '🏆 베테랑' : 
                            w.personality === 'support' ? '💚 서포터' : 
                            w.personality === 'newbie' ? '🐣 몬린이' : 
                            '⚖️ 밸런스형'
                        }</span>
                        <span>|</span>
                        <span id="potion-count-${w.index}">🧪 포션 ${w.potions}/10</span>
                    </div>
                    
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
        `;

        const addLog = (text, color = '#eee') => {
            console.log(`[Combat Log] ${text}`);
        };

        const shakeMonster = () => {
            const showcase = card.querySelector('#monster-showcase-panel');
            if (showcase) {
                showcase.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
                setTimeout(() => showcase.style.transform = '', 100);
            }
        };

        const restoreBorder = (wIndex) => {
            const w = this.selectedWeapons[wIndex];
            if (!w) return;
            const weaponCard = card.querySelector(`#fight-card-${w.index}`);
            if (weaponCard) {
                // Remove all spirit level classes, demon mode, shield charge, extracts, and inline overrides
                weaponCard.classList.remove('ls-spirit-1', 'ls-spirit-2', 'ls-spirit-3', 'db-demon-mode', 'cb-shield-charged', 'ig-3-extracts');
                weaponCard.style.borderColor = '';
                weaponCard.style.boxShadow = '';

                if (w.id === 'long_sword' && w.spiritLevel > 0) {
                    weaponCard.classList.add(`ls-spirit-${w.spiritLevel}`);
                }
                if (w.id === 'dual_blades' && w.demonModeDuration > 0) {
                    weaponCard.classList.add('db-demon-mode');
                }
                if (w.id === 'charge_blade' && w.phials > 0) {
                    weaponCard.classList.add('cb-shield-charged'); // or cb style
                }
                if (w.id === 'insect_glaive' && w.extractDuration > 0) {
                    weaponCard.classList.add('ig-3-extracts');
                }
            }
        };

                const shakeWeapon = (idx, borderClr = '#ff3b30', isAttack = false, moveName = null) => {
            const weaponCard = card.querySelector(`#fight-card-${idx}`);
            if (weaponCard) {
                if (isAttack) {
                    const w = this.selectedWeapons[idx];
                    let animClass = 'attack-melee-anim';
                    let animDuration = 250;

                    if (w) {
                        if (w.id === 'hammer') {
                            if (moveName === '쿵 쿵 따') {
                                animClass = 'attack-hammer-kkt';
                                animDuration = 1200;
                            } else if (moveName === '키프 스웨이') {
                                animClass = 'attack-hammer-keep-sway';
                                animDuration = 450;
                            } else if (moveName === '2차지 어퍼!') {
                                animClass = 'attack-hammer-charge2';
                                animDuration = 650;
                            } else if (moveName === '3차지 내려치기') {
                                animClass = 'attack-hammer-charge3';
                                animDuration = 900;
                            } else if (moveName === '회전 회오리!!!') {
                                animClass = 'attack-hammer-tornado';
                                animDuration = 1600;
                            } else {
                                animClass = 'attack-hammer-anim';
                                animDuration = 400;
                            }
                        } else if (w.id === 'great_sword') {
                            if (moveName === '모아베기') {
                                animClass = 'attack-gs-charge1';
                                animDuration = 800;
                            } else if (moveName === '강모아베기') {
                                animClass = 'attack-gs-charge2';
                                animDuration = 1000;
                            } else if (moveName === '참모아베기') {
                                animClass = 'attack-gs-charge3';
                                animDuration = 1300;
                            }
                        } else if (w.id === 'light_bowgun' || w.id === 'heavy_bowgun') {
                            animClass = 'attack-bowgun-anim';
                            animDuration = 600;
                        }
                    }

                    weaponCard.classList.remove('attack-melee-anim', 'attack-hammer-kkt', 'attack-hammer-keep-sway', 'attack-hammer-charge2', 'attack-hammer-charge3', 'attack-hammer-tornado', 'attack-hammer-anim', 'attack-gs-charge1', 'attack-gs-charge2', 'attack-gs-charge3', 'attack-bowgun-anim');
                    void weaponCard.offsetWidth; // trigger reflow
                    weaponCard.classList.add(animClass);
                    weaponCard.style.borderColor = borderClr;
                    weaponCard.style.zIndex = "10";
                    setTimeout(() => {
                        weaponCard.classList.remove(animClass);
                        restoreBorder(idx);
                        weaponCard.style.zIndex = "";
                    }, animDuration);
                } else {
                    weaponCard.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px) scale(0.95)`;
                    weaponCard.style.borderColor = borderClr;
                    setTimeout(() => {
                        weaponCard.style.transform = '';
                        restoreBorder(idx);
                    }, 150);
                }
            }
        };;

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
                            w.spiritLevel = 0;
                            w.demonModeDuration = 0;
                            w.phials = 5;
                            w.overheatDuration = 0;
                            w.extractBuffs = { red: 0, white: 0, orange: 0 };
                            w.extractDuration = 0;
                            restoreBorder(w.index);

                            this.playMHAsset('mh_aibo.mp3', '아이보'); // play "Aibo!" SFX
                            addLog(`✨ [부활] ${w.name}이(가) "아이보!" 소리와 함께 전장에 재참여하였습니다!`, '#00ffa3');
                            this.updateHpUI(card, w);
                            shakeWeapon(w.index, '#00ffa3');
                        }
                    }
                });

                // Ticking down buffs/overheats
                this.selectedWeapons.forEach(w => {
                    if (w.status === 'alive') {
                        // 1. Dual Blades Demon Mode duration decrement
                        if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                            w.demonModeDuration--;
                            if (w.demonModeDuration === 0) {
                                addLog(`👹 [귀인화 해제] ${w.hunterName}의 귀인화 상태가 해제되었습니다.`, '#aaa');
                                restoreBorder(w.index);
                            }
                        }

                        // 2. Gunlance Overheat duration decrement
                        if (w.id === 'gunlance' && w.overheatDuration && w.overheatDuration > 0) {
                            w.overheatDuration--;
                            const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                            const overlay = weaponCard ? weaponCard.querySelector(`#overheat-overlay-${w.index}`) : null;
                            if (overlay) {
                                let pct = ((30 - w.overheatDuration) / 30) * 100;
                                overlay.style.clipPath = `inset(${pct}% 0 0 0)`;
                            }
                            if (w.overheatDuration === 0) {
                                addLog(`🔥 [오버히트 해제] ${w.hunterName}의 건랜스 용격포 열기가 완전히 식어 오버히트가 해제되었습니다!`, '#00a8ff');
                            }
                        }

                        // 3. Insect Glaive tripleUp buff duration decrement
                        if (w.id === 'insect_glaive' && w.extractDuration && w.extractDuration > 0) {
                            w.extractDuration--;
                            if (w.extractDuration === 0) {
                                w.extractBuffs = { red: 0, white: 0, orange: 0 };
                                addLog(`🐝 [진액 버프 해제] ${w.hunterName}의 3색 진액 효과가 소멸되었습니다.`, '#aaa');
                                restoreBorder(w.index);
                            }
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

                if (this.monsterState !== 'knocked_down' && this.monsterState !== 'stunned' && nextState !== this.monsterState) {
                    this.monsterState = nextState;
                    const statusLbl = card.querySelector('#monster-status-label');
                    const monsterTitle = card.querySelector('#fight-monster-title');
                    const monsterImg = card.querySelector('#fight-monster-img');

                    if (this.monsterState === 'enraged') {
                        this.monsterSpeed = 3.3; // 1.5x speed (halved)
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
                        this.playMonsterRoar(this.selectedMonster);
                        this.playMHAudioFile('Unified_SFX/Encounter.mp3');
                        addLog(`🔥 [분노] ${this.selectedMonster.nameKO}이(가) 포효를 지르며 격노합니다! (공격력 1.5배, 속도 1.5배)`, '#ff3b30');
                        shakeMonster();
                    } else if (this.monsterState === 'exhausted') {
                        this.monsterSpeed = 1.1; // 0.5x speed (halved)
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
                        this.playMHAsset('mh_cart.mp3', '아이고~'); // soft tired sound fallback
                        addLog(`🤤 [탈진] ${this.selectedMonster.nameKO}이(가) 스태미나 고갈로 비틀거립니다! (속도 0.5배, 공격력 0.5배)`, '#00a8ff');
                        shakeMonster();
                    } else {
                        // normal
                        this.monsterSpeed = 2.2; // halved
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
                if (this.currentConsecutiveIndex < this.consecutiveTotal - 1) {
                    this.spawnNextConsecutiveMonster(container);
                } else {
                    // If only 1 weapon survives, make it entering ending phase or resolve.
                    const aliveList = this.selectedWeapons.filter(w => w.status === 'alive');
                    const winner = aliveList.length > 0 ? aliveList[0] : this.selectedWeapons[0];
                    this.endGame(container, true, winner);
                    return;
                }
            }

            // Accumulate Monster ATB (Pause if knocked down or stunned)
            if (this.monsterKnockdownDuration > 0) {
                this.monsterKnockdownDuration--;
                if (this.monsterKnockdownDuration <= 0) {
                    // Knockdown recovery!
                    const statusLbl = card.querySelector('#monster-status-label');
                    const monsterTitle = card.querySelector('#fight-monster-title');
                    const monsterImg = card.querySelector('#fight-monster-img');

                    if (monsterImg) {
                        monsterImg.classList.remove('monster-knockdown-anim');
                        monsterImg.classList.remove('stunned_monster');
                    }

                    // Restore state visually based on battleTime loop state
                    const loopTime = this.battleTime % 240;
                    let restoreState = 'normal';
                    if (loopTime >= 60 && loopTime < 120) restoreState = 'enraged';
                    else if (loopTime >= 180 && loopTime < 240) restoreState = 'exhausted';

                    this.monsterState = restoreState;
                    this.monsterSpeed = restoreState === 'enraged' ? 3.3 : (restoreState === 'exhausted' ? 1.1 : 2.2);

                    if (statusLbl) {
                        if (restoreState === 'enraged') {
                            statusLbl.textContent = '분노 ?�태';
                            statusLbl.style.color = '#ff3b30';
                            statusLbl.style.borderColor = '#ff3b30';
                            statusLbl.style.background = 'rgba(255,59,48,0.1)';
                        } else if (restoreState === 'exhausted') {
                            statusLbl.textContent = '?�진 ?�태';
                            statusLbl.style.color = '#00a8ff';
                            statusLbl.style.borderColor = '#00a8ff';
                            statusLbl.style.background = 'rgba(0,168,255,0.1)';
                        } else {
                            statusLbl.textContent = '?�반 ?�태';
                            statusLbl.style.color = '#00ffaa';
                            statusLbl.style.borderColor = '#00ffaa';
                            statusLbl.style.background = 'rgba(0,255,170,0.08)';
                        }
                    }

                    if (monsterTitle) {
                        if (restoreState === 'enraged') {
                            monsterTitle.textContent = `😡 분노한 ${this.selectedMonster.nameKO} 😡`;
                            monsterTitle.style.color = '#ff3b30';
                            if (monsterImg) monsterImg.classList.add('enraged');
                        } else if (restoreState === 'exhausted') {
                            monsterTitle.textContent = `🤤 탈진한 ${this.selectedMonster.nameKO} 🤤`;
                            monsterTitle.style.color = '#00a8ff';
                        } else {
                            monsterTitle.textContent = this.selectedMonster.nameKO;
                            monsterTitle.style.color = '#ffaa00';
                        }
                    }

                    addLog(`📢 ${this.selectedMonster.nameKO}이(가) 기절에서 깨어나 정신을 가다듬습니다. (기절 내성치 상승: ${this.monsterStunThreshold})`, '#00ffa3');
                }
            } else if (this.monsterStunDuration > 0) {
                this.monsterStunDuration--;
                if (this.monsterStunDuration <= 0) {
                    // Stun recovery!
                    const statusLbl = card.querySelector('#monster-status-label');
                    const monsterTitle = card.querySelector('#fight-monster-title');
                    const monsterImg = card.querySelector('#fight-monster-img');

                    if (monsterImg) {
                        monsterImg.classList.remove('stunned_monster');
                    }

                    // Restore state visually based on battleTime loop state
                    const loopTime = this.battleTime % 240;
                    let restoreState = 'normal';
                    if (loopTime >= 60 && loopTime < 120) restoreState = 'enraged';
                    else if (loopTime >= 180 && loopTime < 240) restoreState = 'exhausted';

                    this.monsterState = restoreState;
                    this.monsterSpeed = restoreState === 'enraged' ? 3.3 : (restoreState === 'exhausted' ? 1.1 : 2.2);

                    if (statusLbl) {
                        if (restoreState === 'enraged') {
                            statusLbl.textContent = '분노 상태';
                            statusLbl.style.color = '#ff3b30';
                            statusLbl.style.borderColor = '#ff3b30';
                            statusLbl.style.background = 'rgba(255,59,48,0.1)';
                        } else if (restoreState === 'exhausted') {
                            statusLbl.textContent = '탈진 상태';
                            statusLbl.style.color = '#00a8ff';
                            statusLbl.style.borderColor = '#00a8ff';
                            statusLbl.style.background = 'rgba(0,168,255,0.1)';
                        } else {
                            statusLbl.textContent = '일반 상태';
                            statusLbl.style.color = '#00ffaa';
                            statusLbl.style.borderColor = '#00ffaa';
                            statusLbl.style.background = 'rgba(0,255,170,0.08)';
                        }
                    }

                    if (monsterTitle) {
                        if (restoreState === 'enraged') {
                            monsterTitle.textContent = `😡 분노한 ${this.selectedMonster.nameKO} 😡`;
                            monsterTitle.style.color = '#ff3b30';
                            if (monsterImg) monsterImg.classList.add('enraged');
                        } else if (restoreState === 'exhausted') {
                            monsterTitle.textContent = `🤤 탈진한 ${this.selectedMonster.nameKO} 🤤`;
                            monsterTitle.style.color = '#00a8ff';
                        } else {
                            monsterTitle.textContent = this.selectedMonster.nameKO;
                            monsterTitle.style.color = '#ffaa00';
                        }
                    }

                    this.monsterStunAccum = 0;
                    this.monsterStunThreshold = Math.floor(this.monsterStunThreshold * 1.5);
                    addLog(`📢 ${this.selectedMonster.nameKO}이(가) 기절에서 깨어나 정신을 가다듬습니다. (기절 내성치 상승: ${this.monsterStunThreshold})`, '#00ffa3');
                }
            } else {
                this.monsterAtb = Math.min(100, this.monsterAtb + this.monsterSpeed);
            }
            const monsterAtbFill = card.querySelector('#monster-atb-fill');
            if (monsterAtbFill) monsterAtbFill.style.width = `${this.monsterAtb}%`;

            // Accumulate Weapon ATBs (Pause if knocked_down or dead)
            this.selectedWeapons.forEach(w => {
                if (w.status === 'alive' || w.status === 'stunned') {
                    let fillRate = 1.0; // default normal (halved from 2.0)
                    if (w.speedGroup === 'very_fast') fillRate = 2.0; // halved from 4.0
                    else if (w.speedGroup === 'fast') fillRate = 1.5;  // halved from 3.0
                    else if (w.speedGroup === 'slow') fillRate = 0.65; // halved from 1.3
                    // 귀인화 중 쌍검 ATB +20% 보정
                    if (w.id === 'dual_blades' && w.demonModeDuration && w.demonModeDuration > 0) {
                        fillRate *= 1.2;
                    }

                    w.atb = Math.min(100, w.atb + fillRate);
                    const fill = card.querySelector(`#atb-fill-${w.index}`);
                    if (fill) fill.style.width = `${w.atb}%`;

                    const tag = card.querySelector(`#status-tag-${w.index}`);
                    if (tag && w.status === 'alive') {
                        tag.textContent = '';
                    }
                }
            });

            // --- Execute Turns ---

            // A. Monster Turn
            if (this.monsterAtb >= 100) {
                this.monsterAtb = 0;
                
                // Select random alive targets to hit (1 to 4 targets)
                const targetable = this.selectedWeapons.filter(w => w.status === 'alive');
                if (targetable.length > 0) {
                    // Randomly decide how many targets to hit (1 to 4, capped at targetable.length)
                    const maxTargets = Math.min(4, targetable.length);
                    const numTargets = Math.floor(Math.random() * maxTargets) + 1;
                    
                    // Shuffle targetable and select the first numTargets
                    const shuffledTargets = [...targetable].sort(() => Math.random() - 0.5);
                    const targetsToHit = shuffledTargets.slice(0, numTargets);
                    
                    // Choose attack name
                    const monsterKey = this.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
                    const list = this.MONSTER_ATTACKS[monsterKey] || this.MONSTER_ATTACKS[this.selectedMonster.id] || this.MONSTER_ATTACKS.default;
                    const attackName = list[Math.floor(Math.random() * list.length)];

                    // Show skill bubble above monster
                    const monsterShowcase = card.querySelector('#monster-showcase-panel');
                    this.showSkillBubble(monsterShowcase, attackName);

                    // Trigger charge animation if attack name implies a charge/rush/sweep/fly
                    const isChargeAttack = attackName.includes('돌진') || attackName.includes('급습') || attackName.includes('휩쓸기') || attackName.includes('강습') || attackName.includes('활공') || attackName.includes('진격') || attackName.includes('습격') || attackName.includes('들이받기');
                    if (isChargeAttack) {
                        const monsterImg = card.querySelector('#fight-monster-img');
                        if (monsterImg) {
                            monsterImg.classList.remove('monster-charge-anim');
                            void monsterImg.offsetWidth; // trigger reflow
                            monsterImg.classList.add('monster-charge-anim');
                            setTimeout(() => monsterImg.classList.remove('monster-charge-anim'), 600);
                        }
                    }

                    // Damage calculation (rage modifier)
                    let dmgMod = 1.0;
                    if (this.monsterState === 'enraged') dmgMod = 1.5;
                    else if (this.monsterState === 'exhausted') dmgMod = 0.5;

                    targetsToHit.forEach(target => {
                        let baseDmg = Math.floor(target.maxHp * 0.45); // 45% of hunter's max HP
                        let damage = Math.floor(baseDmg * dmgMod * (this.monsterDamageMod || 1.0));

                        // Great Sword Tackle check
                        const combos = this.COMBO_LIST[target.id] || [];
                        const isGreatSwordCharging = target.id === 'great_sword' && target.comboIndex >= 1 && target.comboIndex <= 3;

                        if (isGreatSwordCharging) {
                            damage = Math.floor(damage * 0.5); // 50% damage reduction
                            target.hp = Math.max(0, target.hp - damage);

                            const counterDmg = 90;
                            const counterStun = 70;
                            this.monsterHp = Math.max(0, this.monsterHp - counterDmg);
                            this.monsterStunAccum += counterStun;

                            // Update monster HP UI
                            const monsterHpFill = card.querySelector('#monster-hp-fill');
                            const monsterHpText = card.querySelector('#monster-hp-text');
                            if (monsterHpFill) monsterHpFill.style.width = `${(this.monsterHp / this.monsterMaxHp) * 100}%`;
                            if (monsterHpText) monsterHpText.textContent = `${this.monsterHp} / ${this.monsterMaxHp}`;

                            // Stun check
                            if (this.monsterHp > 0) {
                                if (this.monsterStunAccum >= this.monsterStunThreshold && this.monsterStunDuration <= 0) {
                                    this.monsterStunDuration = 60; // 6s
                                    this.monsterState = 'stunned';
                                    const statusLbl = card.querySelector('#monster-status-label');
                                    const monsterTitle = card.querySelector('#fight-monster-title');
                                    const monsterImg = card.querySelector('#fight-monster-img');
                                    if (statusLbl) {
                                        statusLbl.textContent = '기절 ?�태';
                                        statusLbl.style.color = '#e58e26';
                                        statusLbl.style.borderColor = '#e58e26';
                                        statusLbl.style.background = 'rgba(229,142,38,0.1)';
                                    }
                                    if (monsterTitle) {
                                        monsterTitle.textContent = `💫 기절한 ${this.selectedMonster.nameKO} 💫`;
                                        monsterTitle.style.color = '#e58e26';
                                    }
                                    if (monsterImg) {
                                        monsterImg.classList.remove('enraged');
                                        monsterImg.classList.add('stunned_monster');
                                    }
                                    this.playMHAsset('mh_stun.mp3', '격추');
                                addLog(`💫 [기절] ${this.selectedMonster.nameKO}이(가) ${target.name}의 강한 타격을 머리에 입고 기절했습니다! (6초간 무력화)`, '#e58e26');
                                }
                            }

                            // Knockdown milestone check
                            const hpRatio = (this.monsterHp / this.monsterMaxHp) * 100;
                            let triggerKnockdown = false;
                            if (this.monsterHp > 0) {
                                if (hpRatio <= 80 && !this.monsterKnockdownTriggered[80]) {
                                    this.monsterKnockdownTriggered[80] = true;
                                    triggerKnockdown = true;
                                }
                                if (hpRatio <= 60 && !this.monsterKnockdownTriggered[60]) {
                                    this.monsterKnockdownTriggered[60] = true;
                                    triggerKnockdown = true;
                                }
                                if (hpRatio <= 40 && !this.monsterKnockdownTriggered[40]) {
                                    this.monsterKnockdownTriggered[40] = true;
                                    triggerKnockdown = true;
                                }
                                if (hpRatio <= 20 && !this.monsterKnockdownTriggered[20]) {
                                    this.monsterKnockdownTriggered[20] = true;
                                    triggerKnockdown = true;
                                }
                            }

                            if (triggerKnockdown) {
                                this.monsterKnockdownDuration = 70; // 7 seconds (70 ticks of 100ms)
                                this.monsterStunDuration = 0;
                                this.monsterState = 'knocked_down';

                                const statusLbl = card.querySelector('#monster-status-label');
                                const monsterTitle = card.querySelector('#fight-monster-title');
                                const monsterImg = card.querySelector('#fight-monster-img');

                                if (statusLbl) {
                                    statusLbl.textContent = '?�경직 ?�태';
                                    statusLbl.style.color = '#ff9500';
                                    statusLbl.style.borderColor = '#ff9500';
                                    statusLbl.style.background = 'rgba(255,149,0,0.1)';
                                }
                                if (monsterTitle) {
                                    monsterTitle.textContent = `?�� ?�러�?${this.selectedMonster.nameKO} ?��`;
                                    monsterTitle.style.color = '#ff9500';
                                }
                                if (monsterImg) {
                                    monsterImg.classList.remove('enraged');
                                    monsterImg.classList.remove('stunned_monster');
                                    monsterImg.classList.add('monster-knockdown-anim');
                                }

                                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['?�경짧'] || '?�경짧');
                                addLog(`💤 [대경직] ${this.selectedMonster.nameKO}이(가) 큰 충격으로 대경직에 걸려 쓰러졌습니다! (7초간 무력화)`, '#ff9500');
                            }

                            // Advance combo stage
                            let stageNameBefore = combos[target.comboIndex].name;
                            if (target.comboIndex === 1) target.comboIndex = 2; // 모아베기 -> 강모?�베�?+                            else if (target.comboIndex === 2) target.comboIndex = 3; // 강모?�베�?-> 참모?�베�?+                            else if (target.comboIndex === 3) target.comboIndex = 3; // 참모?�베�?-> stays at 참모?�베�?+                            let stageNameAfter = combos[target.comboIndex].name;

                            // UI Updates
                            this.updateHpUI(card, target);
                            const weaponCard = card.querySelector(`#fight-card-${target.index}`);
                            this.showSkillBubble(weaponCard, `🛡️ 태클! (${stageNameBefore} ➡️ ${stageNameAfter})`);

                            // Sound and visual impact
                            const soundKey = ["타격음_베기", "타격음_타격", "타격음_무겁"][Math.floor(Math.random() * 3)];
                            this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[soundKey] || soundKey);

                            if (weaponCard) {
                                weaponCard.classList.remove('guard-shake-anim');
                                void weaponCard.offsetWidth;
                                weaponCard.classList.add('guard-shake-anim');
                                setTimeout(() => weaponCard.classList.remove('guard-shake-anim'), 300);
                            }

                            addLog(`🛡️ [태클 카운터] ${target.name}이(가) 태클로 공격을 맞받아쳐 피해를 50% 경감하고 다음 모으기 연계로 진입합니다! (-${damage} HP, 반사 피해: -${counterDmg} HP, 기절치 +${counterStun})`, '#ff9500');
                            return; // Bypass normal hit/evade logic
                        }

                        // Shield / Dodge roll check
                        const defendRoll = Math.random();
                        let isGuard = false;
                        let isDodge = false;
                        let isForesightSlash = false;

                        // HBG has shield too!
                        const hasShield = target.type === 'shield' || target.id === 'heavy_bowgun';

                        // 성향별 회피/가드 확률 적용
                        let guardProb = 0.85;
                        let dodgeProb = 0.75;
                        if (target.personality === 'veteran') {
                            guardProb = 0.90;
                            dodgeProb = 0.90;
                        } else if (target.personality === 'newbie') {
                            guardProb = 0.45;
                            dodgeProb = 0.35;
                        }

                        if (target.id === 'long_sword' && defendRoll < 0.75) {
                            damage = 0;
                            isDodge = true;
                            isForesightSlash = true;
                            target.spiritLevel = Math.min(3, (target.spiritLevel || 0) + 1);
                        } else if (hasShield && defendRoll < guardProb) {
                            damage = Math.max(1, Math.floor(damage * 0.08)); // Guard blocks 92%
                            isGuard = true;
                        } else if (!hasShield && defendRoll < dodgeProb) {
                            damage = 0; // Dodge evades 100%
                            isDodge = true;
                        }

                        if (damage > 0) {
                            // Moxie check
                            if (target.hp - damage <= 0 && target.hasMoxie && Math.random() < 0.75) {
                                target.hp = 1;
                                target.hasMoxie = false;
                                addLog(`🔥 [근성 발휘!] ${target.name}이(가) ${this.selectedMonster.nameKO}의 치명타를 입고 근성으로 1 HP 생존했습니다!`, '#ffaa00');
                                this.playMHAsset('mh_guard.mp3', '오살았어');
                                shakeWeapon(target.index, '#00ffa3');
                            } else {
                                target.hp = Math.max(0, target.hp - damage);
                                if (isGuard) {
                                    addLog(`🛡️ [방패 가드] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 방어해냈습니다! (-${damage} HP)`, '#00ffff');
                                    this.playMHAsset('mh_guard.mp3', '가드성공');
                                    shakeWeapon(target.index, '#00ffff');

                                    // Trigger guard shake animation on card
                                    const weaponCard = card.querySelector(`#fight-card-${target.index}`);
                                    if (weaponCard) {
                                        weaponCard.classList.remove('guard-shake-anim');
                                        void weaponCard.offsetWidth; // trigger reflow
                                        weaponCard.classList.add('guard-shake-anim');
                                        setTimeout(() => weaponCard.classList.remove('guard-shake-anim'), 300);
                                    }
                                } else {
                                    addLog(`💥 [피격] ${this.selectedMonster.nameKO}이(가) [${attackName}] 시전! ${target.name}에게 큰 타격! (-${damage} HP)`, '#ff5555');
                                    const hitSound = ['윽!', '으악!', '아야!'][Math.floor(Math.random() * 3)];
                                    this.playMHAsset('mh_hit.mp3', hitSound); // play high quality hit sound
                                    shakeMonster();
                                    shakeWeapon(target.index);

                                    // Trigger knockdown animation (Large vs Small Hit)
                                    const weaponCard = card.querySelector(`#fight-card-${target.index}`);
                                    if (weaponCard && target.hp > 0) {
                                        if (damage >= 30) {
                                            // Large Hit: spin 3 times, knocked back, invulnerable for 2.5s
                                            target.status = 'knocked_down';
                                            weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                                            void weaponCard.offsetWidth;
                                            weaponCard.classList.add('large-hit-anim');

                                            const tag = card.querySelector(`#status-tag-${target.index}`);
                                            if (tag) {
                                                tag.textContent = '다운!';
                                                tag.className = 'game-hunt-status-tag fainted';
                                            }

                                            setTimeout(() => {
                                                weaponCard.classList.remove('large-hit-anim');
                                                if (target.status === 'knocked_down' && target.hp > 0) {
                                                    target.status = 'alive';
                                                    const currentTag = card.querySelector(`#status-tag-${target.index}`);
                                                    if (currentTag) {
                                                        currentTag.textContent = '';
                                                        currentTag.className = 'game-hunt-status-tag active';
                                                    }
                                                }
                                            }, 2500);
                                        } else {
                                            // Small Hit: tip over 90 degrees, down for 1.0s
                                            target.status = 'knocked_down';
                                            weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                                            void weaponCard.offsetWidth;
                                            weaponCard.classList.add('small-hit-anim');

                                            const tag = card.querySelector(`#status-tag-${target.index}`);
                                            if (tag) {
                                                tag.textContent = '넘어짐';
                                                tag.className = 'game-hunt-status-tag stunned';
                                            }

                                            setTimeout(() => {
                                                weaponCard.classList.remove('small-hit-anim');
                                                if (target.status === 'knocked_down' && target.hp > 0) {
                                                    target.status = 'alive';
                                                    const currentTag = card.querySelector(`#status-tag-${target.index}`);
                                                    if (currentTag) {
                                                        currentTag.textContent = '';
                                                        currentTag.className = 'game-hunt-status-tag active';
                                                    }
                                                }
                                            }, 1000);
                                        }
                                    }

                                    // Stun check (15% chance on raw damage if still alive and NOT knocked down)
                                    if (target.hp > 0 && target.status === 'alive' && Math.random() < 0.15) {
                                        target.status = 'stunned';
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
                            if (isForesightSlash) {
                                addLog(`⚡ [간파베기] ${target.name}이(가) 간파베기로 공격을 흘려내며 기인 게이지가 상승했습니다! (현재 레벨: ${target.spiritLevel}/3)`, '#ffaa00');
                                this.playMHAsset('mh_guard.mp3', '가드성공');
                                this.showSkillBubble(card.querySelector(`#fight-card-${target.index}`), "간파베기!");
                                restoreBorder(target.index);
                                shakeWeapon(target.index, '#ffaa00');
                            } else {
                                addLog(`🌀 [회피] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 구르기로 회피했습니다!`, '#2eff7b');
                                this.playMHAsset('mh_dodge.mp3', '회피');
                                shakeWeapon(target.index, '#2eff7b');
                            }

                            // Trigger spin roll animation on weapon image
                            const img = card.querySelector(`#fight-card-${target.index} .game-hunt-weapon-img`);
                            if (img) {
                                img.classList.remove('roll-anim');
                                void img.offsetWidth; // trigger reflow
                                img.classList.add('roll-anim');
                                setTimeout(() => img.classList.remove('roll-anim'), 600);
                            }
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
                            target.spiritLevel = 0;
                            target.demonModeDuration = 0;
                            target.phials = 5;
                            target.overheatDuration = 0;
                            target.extractBuffs = { red: 0, white: 0, orange: 0 };
                            target.extractDuration = 0;
                            restoreBorder(target.index);

                            this.cartCount++;
                            updateCartBoard();
                            this.triggerCartAnimation(target);

                            if (this.cartCount >= 3) {
                                addLog(`☠️ [퀘스트 실패] 3회 수레를 타서 퀘스트 전멸 실패했습니다!`, '#ff0055');
                            } else {
                                target.respawnTimer = 5; // 5 seconds respawn time
                                addLog(`🚨 [수레행] ${target.name}이(가) 쓰러졌습니다! 5초 후 부활합니다. (현재 수레: ${this.cartCount}/3)`, '#ff3b30');
                                this.playMHAsset('mh_cart.mp3', '?�돼');
                                this.playMHAudioFile('Unified_SFX/Player Fainted.mp3', 3500);
                            }
                        }
                    });
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
                            tag.textContent = '';
                            tag.className = 'game-hunt-status-tag active';
                        }
                        addLog(`🌀 ${w.name}이(가) 기절 충격에서 깨어나며 턴을 소비했습니다.`, '#eee');
                        continue;
                    }

                    // IA. 성향별 회복 AI
                    {
                        const healProbMap = {
                            defensive: 1.0, normal: 0.80, offensive: 0.50,
                            veteran: 0.90, support: 0.90, newbie: 0.30
                        };
                        const healProb = healProbMap[w.personality] || 0.80;

                        // [veteran/support] 팀원 HP 낮으면 라이프파우더 우선
                        if ((w.personality === 'veteran' || w.personality === 'support') && w.lifepowders !== undefined) {
                            const lowHpAllies = this.selectedWeapons.filter(m => m.status === 'alive' && m.hp <= m.maxHp * 0.55);
                            if (lowHpAllies.length > 0) {
                                if (w.lifepowders > 0) {
                                    w.lifepowders--;
                                    this.selectedWeapons.filter(m => m.status === 'alive').forEach(m => {
                                        m.hp = Math.min(m.maxHp, m.hp + 25);
                                    });
                                    w.atb = 60; // 빠른 행동 ATB 환급
                                    addLog(`💊 [라이프파우더] ${w.name}이(가) 파우더를 뿌려 파티 전원 +25 HP 회복! (남은 파우더: ${w.lifepowders})`, '#2eff7b');
                                    this.playMHAudioFile('Unified_SFX/Potion Drink.mp3', null, 2.5);
                                    this.selectedWeapons.forEach(m => this.updateHpUI(card, m));
                                    shakeWeapon(w.index, '#2eff7b');
                                    continue;
                                } else {
                                    // 파우더 채집 (ATB 소모 후 1개 보충)
                                    w.lifepowders = 1;
                                    w.atb = 60;
                                    addLog(`🌿 [채집] ${w.name}이(가) 허브를 채집해 라이프파우더 1개를 보충했습니다!`, '#aaffaa');
                                    this.playMHAudioFile('Unified_SFX/MH - Item Found (rare).mp3');
                                    const weaponCard2 = card.querySelector(`#fight-card-${w.index}`);
                                    this.showSkillBubble(weaponCard2, `🌿 채집 완료`);
                                    shakeWeapon(w.index, '#aaffaa');
                                    continue;
                                }
                            }
                        }

                        // [newbie] 실수 확률 15% (턴 낭비)
                        if (w.personality === 'newbie' && Math.random() < 0.15) {
                            addLog(`😅 [실수] ${w.name}이(가) 공격 타이밍을 놓쳤습니다!`, '#aaa');
                            shakeWeapon(w.index, '#aaa');
                            continue;
                        }

                        // 자기 HP 낮을 때 포션 (성향별 확률)
                        if (w.hp <= w.maxHp * 0.55 && w.potions > 0 && Math.random() < healProb) {
                            w.potions--;
                            const healAmount = Math.round(w.maxHp * 0.60);
                            w.hp = Math.min(w.maxHp, w.hp + healAmount);
                            addLog(`🧪 [포션] ${w.name}이(가) 비약을 복용 +${healAmount} HP (남은 물약: ${w.potions}/10)`, '#2eff7b');
                            this.playMHAudioFile('Unified_SFX/Potion Drink.mp3', null, 2.5);
                            this.updateHpUI(card, w);
                            const potEl = card.querySelector(`#potion-count-${w.index}`);
                            if (potEl) potEl.textContent = `🧪 ${w.potions}/10`;
                            const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                            this.showSkillBubble(weaponCard, `🧪 물약 회복 (+60%)`);
                            shakeWeapon(w.index, '#2eff7b');
                            continue;
                        }
                    }

                    // IV. Ranged Reload check
                    if (w.type === 'ranged' && w.ammo <= 0) {
                        w.ammo = 5;
                        addLog(`🔄 [재장전] ${w.name}이(가) 탄창을 갈고 재장전을 실행합니다.`, '#00a8ff');
                        this.playMHAsset('mh_reload.mp3', '팅!');
                        shakeWeapon(w.index, '#00a8ff');
                        continue;
                    }

                    // V. Melee Sharpness check
                    if (w.type !== 'ranged' && w.sharpness <= 30) {
                        w.sharpness = 100;
                        addLog(`✨ [숫돌질] ${w.name}이(가) 구석에서 숫돌을 갈아 예리도를 회복합니다!`, '#ffaa00');
                        this.playMHAudioFile('Unified_SFX/MH - Combine Item.mp3');
                        shakeWeapon(w.index, '#ffaa00');
                        continue;
                    }

                    // VI. Execute Wilds Combo Attack!
                    const combos = this.COMBO_LIST[w.id] || [];
                    let currentCombo = combos[w.comboIndex];
                    let isKnockdownAttack = false;

                    if (this.monsterState === 'knocked_down' && combos.length > 0) {
                        let maxDmgCombo = combos[0];
                        for (let i = 1; i < combos.length; i++) {
                            // 태도: 기인투구깨기는 spiritLevel 2 이상일 때만 선택
                            if (combos[i].name === '기인투구깨기') {
                                if (w.id === 'long_sword' && (w.spiritLevel || 0) < 2) continue;
                            }
                            if (combos[i].dmg > maxDmgCombo.dmg) {
                                maxDmgCombo = combos[i];
                            }
                        }
                        if (maxDmgCombo) {
                            currentCombo = maxDmgCombo;
                            isKnockdownAttack = true;
                        }
                    }

                    // 쌍검: 귀인화 중에 index 0(귀인화 진입)에 오면 건너뜀
                    if (w.id === 'dual_blades' && w.comboIndex === 0 && w.demonModeDuration > 0) {
                        w.comboIndex = 1;
                        currentCombo = combos[1] || currentCombo;
                    }

                    // 태도: 기인투구깨기는 spiritLevel 3 이상일 때만 진행
                    if (w.id === 'long_sword' && w.comboIndex === 3 && (w.spiritLevel || 0) < 3) {
                        w.comboIndex = 0;
                        currentCombo = combos[0];
                    }

                    // 건랜스: 오버히트 중에 용격포 콤보 진입 시 수평찌르기로 강제 리다이렉트
                    if (w.id === 'gunlance' && w.comboIndex === 3) {
                        if (w.overheatDuration && w.overheatDuration > 0) {
                            w.comboIndex = 0;
                            currentCombo = combos[0];
                        }
                    }
                    
                    if (currentCombo) {
                        let damage = currentCombo.dmg;

                        // 태도: 기인 레벨에 따른 데미지 배수
                        if (w.id === 'long_sword') {
                            const spiritMults = { 0: 1.0, 1: 1.05, 2: 1.10, 3: 1.20 };
                            const mult = spiritMults[w.spiritLevel || 0] || 1.0;
                            damage = Math.floor(damage * mult);
                        }

                        // 쌍검: 귀인화 중 데미지 1.2배
                        if (w.id === 'dual_blades' && w.demonModeDuration > 0) {
                            damage = Math.floor(damage * 1.2);
                        }

                        // 차지액스: 병(phial) 충전 및 해방 로직
                        if (w.id === 'charge_blade') {
                            if (currentCombo.name === '병충전') {
                                w.phials = 5;
                                addLog(`⚡ [병충전] ${w.hunterName}이(가) 검 에너지를 병에 주입하여 병 5개를 완전히 장전했습니다!`, '#00a8ff');
                                this.playMHAsset('mh_reload.mp3', '재장전');
                            } else if (currentCombo.name === '도끼 속성해방베기 I') {
                                if ((w.phials || 0) > 0) {
                                    w.phials--;
                                    damage += 70;
                                    addLog(`⚡ [병소모] 도끼 속성해방베기 I! 병 1개를 소비하여 속성 추타를 가합니다! (남은 병: ${w.phials}/5)`, '#ffaa00');
                                }
                            } else if (currentCombo.name === '고출력 속성해방베기') {
                                if ((w.phials || 0) > 0) {
                                    w.phials--;
                                    damage += 100;
                                    addLog(`⚡ [병소모] 고출력 속성해방베기! 병 1개를 소비하여 속성 충격파가 추가 폭발합니다! (남은 병: ${w.phials}/5)`, '#ffaa00');
                                }
                            } else if (currentCombo.name === '초고출력 속성해방베기') {
                                const phialsUsed = w.phials || 0;
                                w.phials = 0;
                                damage += phialsUsed * 120;
                                addLog(`💥 [초고출력] 초고출력 속성해방베기! 병 ${phialsUsed}개를 한꺼번에 해방하여 전천후 대폭발을 일으킵니다! (데미지 +${phialsUsed * 120})`, '#ff3333');
                                this.playMHAsset('mh_heavy_hit.mp3', '팅!');
                            }

                            // Update phial dots UI
                            const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                            const cbPhials = weaponCard ? weaponCard.querySelector(`#cb-phials-${w.index}`) : null;
                            if (cbPhials) {
                                const dots = cbPhials.querySelectorAll('.cb-dot');
                                dots.forEach((dot, idx) => {
                                    dot.textContent = idx < (w.phials || 0) ? '●' : '○';
                                });
                            }
                        }

                        // 건랜스: 용격포 시전 시 오버히트 30초 활성화
                        if (w.id === 'gunlance' && currentCombo.name === '용격포') {
                            w.overheatDuration = 30;
                            addLog(`🔥 [용격포] ${w.hunterName}이(가) 용격포를 격발했습니다! 대량의 열기로 인해 30초간 오버히트 상태가 됩니다!`, '#ff5500');
                            this.playMHAsset('mh_reload.mp3', '재장전');
                            const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                            const overlay = weaponCard ? weaponCard.querySelector(`#overheat-overlay-${w.index}`) : null;
                            if (overlay) {
                                overlay.style.clipPath = 'inset(0% 0 0 0)'; // fill full red
                            }
                        }

                        // 조충곤: 진액 추출 및 트리플업 버프 로직
                        if (w.id === 'insect_glaive') {
                            if (currentCombo.name === '진액 추출') {
                                // 획득하지 않은 색상 순서대로 획득 (빨강 -> 하양 -> 주황)
                                let colorAcquired = "";
                                if (!w.extractBuffs.red) {
                                    w.extractBuffs.red = 1;
                                    colorAcquired = "빨강";
                                } else if (!w.extractBuffs.white) {
                                    w.extractBuffs.white = 1;
                                    colorAcquired = "하양";
                                } else if (!w.extractBuffs.orange) {
                                    w.extractBuffs.orange = 1;
                                    colorAcquired = "주황";
                                }

                                if (colorAcquired) {
                                    addLog(`🐝 [진액 획득] ${w.hunterName}이(가) ${colorAcquired} 진액을 획득했습니다!`, '#e0ffa3');
                                    this.playMHAudioFile('Unified_SFX/MH - Item Found.mp3');
                                }

                                // 3색 버프 완성 여부 체크
                                if (w.extractBuffs.red && w.extractBuffs.white && w.extractBuffs.orange && (!w.extractDuration || w.extractDuration === 0)) {
                                    w.extractDuration = 20; // 20초간 버프
                                    addLog(`🐝 [진액 트리플업] ${w.hunterName}이(가) 3색 진액을 모두 획득하여 20초간 공격력이 30% 증가합니다!`, '#ffaa00');
                                    this.playMHAsset('mh_reload.mp3', '재장전');
                                    restoreBorder(w.index);
                                }
                            }

                            // 버프 적용 시 데미지 1.3배
                            if (w.extractDuration && w.extractDuration > 0) {
                                damage = Math.floor(damage * 1.3);
                            }

                            // UI 갱신
                            const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                            const igExtracts = weaponCard ? weaponCard.querySelector(`#ig-extracts-${w.index}`) : null;
                            if (igExtracts) {
                                const redDot = igExtracts.querySelector('.red');
                                const whiteDot = igExtracts.querySelector('.white');
                                const orangeDot = igExtracts.querySelector('.orange');

                                if (redDot) redDot.style.color = w.extractBuffs.red ? '#ff3b30' : '#444';
                                if (whiteDot) whiteDot.style.color = w.extractBuffs.white ? '#ffffff' : '#444';
                                if (orangeDot) orangeDot.style.color = w.extractBuffs.orange ? '#ff9500' : '#444';
                            }
                        }

                        // 태도: 기인베기 II 콤보 시 spiritLevel 증가 (최대 3)
                        if (w.id === 'long_sword') {
                            if (currentCombo.name === '기인베기 II') {
                                w.spiritLevel = Math.min(3, (w.spiritLevel || 0) + 1);
                                addLog(`✨ [기인 연계] ${w.hunterName}이(가) 기인베기 II를 성공시켜 기인 게이지 레벨이 상승했습니다! (현재 레벨: ${w.spiritLevel}/3)`, '#ffaa00');
                                restoreBorder(w.index);
                            } else if (currentCombo.name === '기인투구깨기') {
                                w.spiritLevel = Math.max(0, (w.spiritLevel || 0) - 1);
                                addLog(`💥 [기인투구깨기] ${w.hunterName}이(가) 공중에서 내리치며 기인투구깨기를 시전했습니다! 기인 게이지 레벨 1 소모! (현재 레벨: ${w.spiritLevel}/3)`, '#e74c3c');
                                restoreBorder(w.index);
                            }
                        }

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

                        // Check for monster knockdown (?�경직) at 80%, 60%, 40%, 20% HP ratio thresholds
                        const hpRatio = (this.monsterHp / this.monsterMaxHp) * 100;
                        let triggerKnockdown = false;
                        if (this.monsterHp > 0) {
                            if (hpRatio <= 80 && !this.monsterKnockdownTriggered[80]) {
                                this.monsterKnockdownTriggered[80] = true;
                                triggerKnockdown = true;
                            }
                            if (hpRatio <= 60 && !this.monsterKnockdownTriggered[60]) {
                                this.monsterKnockdownTriggered[60] = true;
                                triggerKnockdown = true;
                            }
                            if (hpRatio <= 40 && !this.monsterKnockdownTriggered[40]) {
                                this.monsterKnockdownTriggered[40] = true;
                                triggerKnockdown = true;
                            }
                            if (hpRatio <= 20 && !this.monsterKnockdownTriggered[20]) {
                                this.monsterKnockdownTriggered[20] = true;
                                triggerKnockdown = true;
                            }
                        }

                        if (triggerKnockdown) {
                            this.monsterKnockdownDuration = 70; // 7 seconds (70 ticks of 100ms)
                            this.monsterStunDuration = 0; // Clear stun if knockdown triggers
                            this.monsterState = 'knocked_down';

                            const statusLbl = card.querySelector('#monster-status-label');
                            const monsterTitle = card.querySelector('#fight-monster-title');
                            const monsterImg = card.querySelector('#fight-monster-img');

                            if (statusLbl) {
                                statusLbl.textContent = '?�경직 ?�태';
                                statusLbl.style.color = '#ff9500';
                                statusLbl.style.borderColor = '#ff9500';
                                statusLbl.style.background = 'rgba(255,149,0,0.1)';
                            }
                            if (monsterTitle) {
                                monsterTitle.textContent = `?�� ?�러�?${this.selectedMonster.nameKO} ?��`;
                                monsterTitle.style.color = '#ff9500';
                            }
                            if (monsterImg) {
                                monsterImg.classList.remove('enraged');
                                monsterImg.classList.remove('stunned_monster');
                                monsterImg.classList.add('monster-knockdown-anim');
                            }

                            this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['?�경짧'] || '?�경짧');
                                addLog(`💤 [대경직] ${this.selectedMonster.nameKO}이(가) 큰 충격으로 대경직에 걸려 쓰러졌습니다! (7초간 무력화)`, '#ff9500');
                        }

                        // Show skill bubble above weapon card
                        const weaponCard = card.querySelector(`#fight-card-${w.index}`);
                        this.showSkillBubble(weaponCard, currentCombo.name);

                        // Special combo effects (like hunting horn heal)
                        if (w.id === 'hunting_horn' && currentCombo.name.includes('?�복?�주')) {
                            const healAmount = 25;
                            const members = this.selectedWeapons.filter(member => member.status === 'alive');
                            members.forEach(m => m.hp = Math.min(m.maxHp, m.hp + healAmount));
                            this.selectedWeapons.forEach(m => this.updateHpUI(card, m));
                            this.playMHAudioFile('Unified_SFX/The Performance Begins.mp3');
                            members.forEach(m => shakeWeapon(m.index, '#2eff7b'));
                        }

                        // Next speed transition (dynamic speed change based on combo flow)
                        if (currentCombo.nextSpeed) {
                            w.speedGroup = currentCombo.nextSpeed;
                        }

                        // Stun accumulation (only if NOT knocked down already)
                        if (currentCombo.stun && currentCombo.stun > 0 && this.monsterHp > 0 && this.monsterState !== 'knocked_down') {
                            this.monsterStunAccum += currentCombo.stun;
                            
                            if (this.monsterStunAccum >= this.monsterStunThreshold && this.monsterStunDuration <= 0) {
                                this.monsterStunDuration = 60; // 6 seconds (60 ticks of 100ms)
                                this.monsterState = 'stunned';
                                
                                const statusLbl = card.querySelector('#monster-status-label');
                                const monsterTitle = card.querySelector('#fight-monster-title');
                                const monsterImg = card.querySelector('#fight-monster-img');

                                if (statusLbl) {
                                    statusLbl.textContent = '기절 상태';
                                    statusLbl.style.color = '#e58e26';
                                    statusLbl.style.borderColor = '#e58e26';
                                    statusLbl.style.background = 'rgba(229,142,38,0.1)';
                                }
                                if (monsterTitle) {
                                        monsterTitle.textContent = `💫 기절한 ${this.selectedMonster.nameKO} 💫`;
                                    monsterTitle.style.color = '#e58e26';
                                }
                                if (monsterImg) {
                                    monsterImg.classList.remove('enraged');
                                    monsterImg.classList.add('stunned_monster');
                                }

                                this.playMHAsset('mh_stun.mp3', '격추');
                                addLog(`💫 [기절] ${this.selectedMonster.nameKO}이(가) ${target.name}의 강한 타격을 머리에 입고 기절했습니다! (6초간 무력화)`, '#e58e26');
                            } else {
                                addLog(`💫 [기절 누적] ${w.name}의 타격으로 몬스터 기절 수치 누적! (${this.monsterStunAccum} / ${this.monsterStunThreshold})`, '#aaaaaa');
                            }
                        }

                        // Logging
                        if (isKnockdownAttack) {
                            addLog(`✨ [대경직 찬스!] ${w.name}이(가) 최강 기술 [${currentCombo.name}] 시전! (-${damage} HP)`, '#ff9500');
                        } else if (currentCombo.special) {
                            addLog(`?�️ [?�계-${w.comboIndex+1}] ${w.name}: ${currentCombo.name}! ${currentCombo.special} (-${damage} HP)`, '#ffaa00');
                        } else if (isDull) {
                            addLog(`⚔️ [무딘 벰] ${w.name}이(가) 예리도 소모 상태로 공격을 가해 피해가 반감되었습니다! (-${damage} HP)`, '#aaaaaa');
                        } else {
                            addLog(`⚔️ [연계-${w.comboIndex+1}] ${w.name}의 [${currentCombo.name}] 시전! 몬스터를 타격! (-${damage} HP)`, '#eee');
                        }

                        // Play Combo-Specific Sound or default hit sound
                        let soundKey = '타격음_베기';
                        if (currentCombo.soundKey) {
                            if (Array.isArray(currentCombo.soundKey)) {
                                soundKey = currentCombo.soundKey[Math.floor(Math.random() * currentCombo.soundKey.length)];
                            } else {
                                soundKey = currentCombo.soundKey;
                            }
                        } else if (currentCombo.stun && currentCombo.stun > 0) {
                            soundKey = '타격음_타격';
                        } else if (currentCombo.dmg > 300) {
                            soundKey = '타격음_무겁';
                        }
                        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[soundKey] || soundKey);

                        shakeMonster();
                        shakeWeapon(w.index, '#ff9500', true, currentCombo.name);

                        // Advance combo index (except during knockdown)
                        if (!isKnockdownAttack) {
                            w.comboIndex = (w.comboIndex + 1) % combos.length;
                        }
                    }
                }
            }

        }, 100);
    }

    playMHAudioFile(subPath, durationLimitMs = null, volumeMultiplier = 1.0) {
        const filePath = `MonsterHunter_Soundtracks/${subPath}`;
        try {
            const audio = new Audio(filePath);
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            const baseVolume = volConfig.master * volConfig.sfx * 0.75 * volumeMultiplier;

            // If volumeMultiplier is high (e.g. 2.5 for potions), use AudioContext & GainNode to amplify beyond 1.0 limit
            if (volumeMultiplier > 1.0) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    const ctx = new AudioContext();
                    const source = ctx.createMediaElementSource(audio);
                    const gainNode = ctx.createGain();

                    gainNode.gain.value = baseVolume; // Amplifies cleanly
                    source.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    audio.play().catch(e => console.warn(`Failed to play amplified audio: ${filePath}`, e));

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
                                    audio.pause();
                                    gainNode.gain.value = 0;
                                    ctx.close();
                                } else {
                                    gainNode.gain.value = Math.max(0, originalGain * (1 - elapsed / fadeDuration));
                                }
                            }, fadeInterval);
                        }, durationLimitMs - 500 > 0 ? durationLimitMs - 500 : 0);
                    }
                    return;
                }
            }

            // Normal volume mapping (cap at 1.0)
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
            }).catch(e => console.warn(`Failed to play MH audio file: ${filePath}`, e));
        } catch(e) {
            console.warn(`Error loading MH audio: ${filePath}`, e);
        }
    }

    triggerGatheringEvent(card, w, addLog, shakeWeapon) {
        addLog(`🌿 [채집 시작] ${w.name}이(가) 주변 수풀을 헤치며 채집을 시도합니다..`, '#a8ff00');
        this.playMHAudioFile('Unified_SFX/Gathering Location.mp3');
        
        const weaponCard = card.querySelector(`#fight-card-${w.index}`);
        this.showSkillBubble(weaponCard, "?�� 채집 ?�도!");
        shakeWeapon(w.index, '#a8ff00');
        
        setTimeout(() => {
            if (this.phase !== 'fighting' || w.status !== 'alive') return;
            
            const roll = Math.random();
            if (roll < 0.60) {
                // Herb / Honey
                const heal = 25;
                w.hp = Math.min(w.maxHp, w.hp + heal);
                this.playMHAudioFile('Unified_SFX/MH - Item Found.mp3');
                addLog(`🌿 [채집 성공] ${w.name}이(가) [약초와 벌꿀]을 발견해 체력을 회복합니다! (+${heal} HP)`, '#2eff7b');
                this.showSkillBubble(weaponCard, "?�� ?�초 채집!");
                this.updateHpUI(card, w);
                shakeWeapon(w.index, '#2eff7b');
            } else if (roll < 0.90) {
                // Lifepowder
                const heal = 20;
                const members = this.selectedWeapons.filter(member => member.status === 'alive');
                members.forEach(m => m.hp = Math.min(m.maxHp, m.hp + heal));
                this.playMHAudioFile('Unified_SFX/MH - Item Found (rare).mp3');
                addLog(`🌿 [채집-성공] ${w.name}이(가) [생명의 가루]를 얻어 흩뿌립니다! 아군 전체 회복! (+${heal} HP)`, '#00ffaa');
                this.showSkillBubble(weaponCard, "🌿 가루 획득!");
                this.selectedWeapons.forEach(m => this.updateHpUI(card, m));
                shakeWeapon(w.index, '#00ffaa');
            } else {
                // Max Potion
                w.maxHp = Math.min(150, w.maxHp + 10);
                w.hp = w.maxHp;
                this.playMHAudioFile('Unified_SFX/MH - Item Found (rarest).mp3');
                addLog(`🌿 [채집-전설] ${w.name}이(가) 고대 유적에서 [비약]을 찾아 복용했습니다! 최대 체력 증가 및 완전 회복! (+10 Max HP, 완치)`, '#ffaa00');
                this.showSkillBubble(weaponCard, "🌿 비약 발견!");
                this.updateHpUI(card, w);
                shakeWeapon(w.index, '#ffaa00');
            }
        }, 1500);
    }

    triggerCookingEvent(card, w, addLog, shakeWeapon) {
        addLog(`🍖 [고기 굽기] ${w.name}이(가) 불판을 벌이고 생고기를 굽기 시작합니다! (BGM 재생)`, '#ff5500');
        this.playMHAudioFile('Unified_SFX/MH - Cooking.mp3');
        
        const weaponCard = card.querySelector(`#fight-card-${w.index}`);
        this.showSkillBubble(weaponCard, "?�� 고기 굽는 �?..");
        shakeWeapon(w.index, '#ff5500');
        
        setTimeout(() => {
            if (this.phase !== 'fighting' || w.status !== 'alive') return;
            
            const roll = Math.random();
            if (roll < 0.60) {
                // Well-cooked
                this.playMHAudioFile('Unified_SFX/Well-Cooked!.mp3');
                setTimeout(() => {
                    if (this.phase !== 'fighting' || w.status !== 'alive') return;
                    this.playMHAudioFile('Unified_SFX/MH - Looks Tasty.mp3');
                    w.hp = Math.min(w.maxHp, w.hp + 50);
                    w.atb = 100; // instant turn back
                    addLog(`🍖 [고기 굽기-대성공] ${w.name}이(가) 잘 익은 고기를 구웠습니다! "고기가 아주 잘 구워졌습니다!" (+50 HP, ATB 즉시 완충)`, '#2eff7b');
                    this.showSkillBubble(weaponCard, "🍖 잘 익은 고기!");
                    this.updateHpUI(card, w);
                    shakeWeapon(w.index, '#2eff7b');
                }, 1000);
            } else if (roll < 0.85) {
                // Rare
                this.playMHAudioFile('Unified_SFX/MH - Rare Steak.mp3');
                w.hp = Math.min(w.maxHp, w.hp + 20);
                addLog(`🍖 [고기 굽기-설익음] ${w.name}이(가) 덜 익은 고기를 구웠습니다! (+20 HP)`, '#ffaa00');
                this.showSkillBubble(weaponCard, "?�� ?�익?� 고기!");
                this.updateHpUI(card, w);
                shakeWeapon(w.index, '#ffaa00');
            } else {
                // Burned
                this.playMHAudioFile('Unified_SFX/MH - Burned.mp3');
                w.hp = Math.max(1, w.hp - 10);
                addLog(`🍖 [고기 굽기-실패] ${w.name}이(가) 너무 오래 구워 탄 고기를 만들어 먹었습니다. (-10 HP)`, '#ff3b30');
                this.showSkillBubble(weaponCard, "🍖 탄 고기...");
                this.updateHpUI(card, w);
                shakeWeapon(w.index, '#ff3b30');
            }
        }, 3000);
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
                    tag.textContent = '';
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

    spawnNextConsecutiveMonster(container) {
        const prevName = this.selectedMonster.nameKO;
        this.currentConsecutiveIndex++;
        this.selectedMonster = this.consecutiveQueue[this.currentConsecutiveIndex];
        
        const addLog = (text, color) => {
            this.director.eventBus.emit('chat:render', {
                nickname: '시스템',
                message: text,
                color: color || '#ffaa00',
                isSystem: true
            });
            console.log(`[HUNT] ${text}`);
        };
        addLog(`🎉 [토벌 완료] ${prevName}을(가) 완벽하게 토벌했습니다!`, '#00ffa3');
        addLog(`🐉 [대연속 수렵 ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] ${this.selectedMonster.nameKO}이(가) 출현했습니다!`, '#ffaa00');

        // Play SFX (Roar or start sound)
        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['가자!'] || '가자!');

        // Determine monster tier & stats
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

        // Reset stats
        this.monsterHp = baseHp;
        this.monsterMaxHp = baseHp;
        this.monsterAtb = 0;
        this.monsterState = 'normal';
        this.monsterSpeed = 2.2 * this.monsterAtbSpeedMod;
        this.monsterStunAccum = 0;
        this.monsterStunThreshold = baseStunThreshold;
        this.monsterStunDuration = 0;
        this.monsterKnockdownDuration = 0;
        this.monsterKnockdownTriggered = { 80: false, 60: false, 40: false, 20: false };

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
                this.battleBgmPromise = this.battleBgm.play().catch(e => console.warn("Lobby BGM failed:", e));
            });
        } catch (e) {
            console.warn("Audio error:", e);
        }

        // Update UI elements
        const card = container.querySelector('.game-hunt-card');
        if (card) {
            const hpText = card.querySelector('#monster-hp-text');
            const hpFill = card.querySelector('#monster-hp-fill');
            const hpLabel = card.querySelector('.game-hunt-monster-hp-container span');
            const monsterImg = card.querySelector('#fight-monster-img');
            const monsterTitle = card.querySelector('#fight-monster-title');
            const statusLabel = card.querySelector('#monster-status-label');
            const atbFill = card.querySelector('#monster-atb-fill');

            if (hpText) hpText.textContent = `${this.monsterHp} / ${this.monsterMaxHp}`;
            if (hpFill) hpFill.style.width = `100%`;
            if (hpLabel) hpLabel.textContent = `?�� [?�?�속 ?�렵 ${this.currentConsecutiveIndex + 1}/${this.consecutiveTotal}] [${this.tierLabel}] ${this.selectedMonster.nameKO} [체력�?`;
            if (monsterImg) {
                monsterImg.src = `img/monsters/${this.selectedMonster.filename}`;
                monsterImg.classList.remove('monster-knockdown-anim', 'stunned_monster');
                monsterImg.style.transform = 'rotate(0deg)';
            }
            if (monsterTitle) monsterTitle.textContent = this.selectedMonster.nameKO;
            if (statusLabel) {
                statusLabel.textContent = '?�반 ?�태';
                statusLabel.style.color = '#00ffaa';
                statusLabel.style.borderColor = '#00ffaa';
                statusLabel.style.background = 'rgba(0,255,170,0.08)';
            }
            if (atbFill) atbFill.style.width = '0%';
        }
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
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['?�승!'] || '?�승!');
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
                    this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['?�돼'] || '?�돼');
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
            
            // Trigger victory jump on winner card
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
                // Quest failed banner
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

            // Apply crying tears to surviving hunters and make fainted ones look dead
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
                            tag.textContent = '?�� ?�물...';
                            tag.className = 'game-hunt-status-tag fainted';
                        }
                    } else {
                        // Dead/fainted hunters (ensure flipped upside down and shows KO)
                        weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                        void weaponCard.offsetWidth;
                        weaponCard.style.transform = 'rotate(180deg)';
                        const tag = card.querySelector(`#status-tag-${w.index}`);
                        if (tag) {
                            tag.textContent = '?�️ 기절 (?�레)';
                            tag.className = 'game-hunt-status-tag fainted';
                        }
                    }
                }
            });
        }

        // Remove container after 15 seconds
        setTimeout(() => {
            container.style.animation = "game-fade-out 0.5s ease-in forwards";
            setTimeout(() => {
                container.remove();
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
        stop(this.winBgm, this.winBgmPromise);
        this.lobbyBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgm = null;
        this.battleBgmPromise = null;
        this.winBgm = null;
        this.winBgmPromise = null;
    }

    showSkillBubble(parentEl, skillName) {
        if (!parentEl) return;
        
        // Remove existing bubble if any
        const existing = parentEl.querySelector('.skill-bubble');
        if (existing) {
            existing.remove();
        }

        const bubble = document.createElement('div');
        bubble.className = 'skill-bubble';
        bubble.textContent = skillName;
        
        parentEl.appendChild(bubble);

        // Remove after 3 seconds with fadeout effect
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.style.animation = 'bubble-fade-out 0.25s ease-in forwards';
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.remove();
                    }
                }, 250);
            }
        }, 2750);
    }

    getMonsterTier(monster) {
        if (!monster) return 'large';
        const id = (monster.id || "").toLowerCase();
        
        // 1. Small Monster IDs
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

        // 2. Medium Monster IDs
        const mediumIds = [
            'great_jagras', 'great_girros', 'kulu-ya-ku', 'tzitzi-ya-ku', 
            'dodogama', 'pukei-pukei', 'coral_pukei-pukei', 'royal_ludroth'
        ];
        if (mediumIds.includes(id)) {
            return 'medium';
        }

        // 3. Elder Dragons / Epic Bosses IDs
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

        // 4. Fallback is Large Wyverns
        return 'large';
    }

    triggerMonsterKnockdown(card, type) {
        this.monsterState = 'knocked_down';
        this.monsterKnockdownDuration = 70; // 7 seconds
        this.monsterStunDuration = 0;

        const statusLbl = card.querySelector('#monster-status-label');
        const monsterTitle = card.querySelector('#fight-monster-title');
        const monsterImg = card.querySelector('#fight-monster-img');

        if (statusLbl) {
            statusLbl.textContent = type === 'pitfall' ? '구멍함정 상태' : '낙석 다운';
            statusLbl.style.color = '#ff9500';
            statusLbl.style.borderColor = '#ff9500';
            statusLbl.style.background = 'rgba(255,149,0,0.1)';
        }
        if (monsterTitle) {
            monsterTitle.textContent = `🌀 쓰러진 ${this.selectedMonster.nameKO} 🌀`;
            monsterTitle.style.color = '#ff9500';
        }
        if (monsterImg) {
            monsterImg.classList.remove('enraged');
            monsterImg.classList.remove('stunned_monster');
            monsterImg.classList.add('monster-knockdown-anim');
        }

        this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['대경직'] || '대경직');
    }
}
