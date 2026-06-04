const EMOJI_CODE_MAP = {
    // 50가지 레이서 동물/아이콘 이모지
    '🐎': '1f40e',
    '🦄': '1f984',
    '🦓': '1f993',
    '🏇': '1f3c7',
    '🐴': '1f434',
    '🐇': '1f407',
    '🐢': '1f422',
    '🐸': '1f438',
    '🦊': '1f98a',
    '🐺': '1f43a',
    '🦁': '1f981',
    '🐯': '1f42f',
    '🐼': '1f43c',
    '🦝': '1f99d',
    '🦘': '1f998',
    '🦙': '1f999',
    '🦌': '1f98c',
    '🐗': '1f417',
    '🦩': '1fa7b',
    '🦅': '1f985',
    '🐧': '1f427',
    '🦆': '1f986',
    '🦜': '1f99c',
    '🐊': '1f40a',
    '🦈': '1f988',
    '🐬': '1f42c',
    '🐙': '1f419',
    '🦂': '1f982',
    '🐉': '1f409',
    '🦕': '1f995',
    '🦖': '1f996',
    '🤖': '1f916',
    '👾': '1f47e',
    '🚀': '1f680',
    '🏎️': '1f3ce-fe0f',
    '🏎': '1f3ce',
    '🛸': '1f6f8',
    '🏍️': '1f3cd-fe0f',
    '🏍': '1f3cd',
    '🔥': '1f525',
    '⚡': '26a1',
    '👻': '1f47b',
    '💀': '1f480',
    '😈': '1f608',
    '🥷': '1f977',
    '🦸': '1f9b8',
    '🧟': '1f9df',
    '🧙': '1f9d9',
    '⛄': '26c4',
    '🎅': '1f385',
    '🦔': '1f994',
    '🐖': '1f416',
    '🐻‍❄️': '1f43b-200d-2744-fe0f',

    // 추가 게임 요소 및 자막용 이모지
    '🎤': '1f3a4',
    '🏆': '1f3c6',
    '🍌': '1f34c',
    '🤕': '1f915',
    '💤': '1f4a4',
    '🛡️': '1f6e1-fe0f',
    '🛡': '1f6e1',
    '🧲': '1f9f2',
    '🥕': '1f955',
    '🎉': '1f389',
    '💥': '1f4a5',
    '💢': '1f4a2',
    '🏁': '1f3c1'
};

function parseEmojisToImages(text, size = '1.35rem') {
    if (!text) return '';
    let result = text;
    const sortedEmojis = Object.keys(EMOJI_CODE_MAP).sort((a, b) => b.length - a.length);
    for (const emoji of sortedEmojis) {
        if (result.includes(emoji)) {
            const code = EMOJI_CODE_MAP[emoji];
            const imgTag = `<img class="emoji" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${code}.svg" style="width:${size}; height:${size}; vertical-align:middle; display:inline-block;" />`;
            result = result.split(emoji).join(imgTag);
        }
    }
    return result;
}

class RacingEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.isActive = false;
        this.phase = 'betting'; // 'betting' | 'racing' | 'ended'
        this.bets = {}; // { nickname: { index, color } }
        this.racers = [];
        this.resolveGame = null;
        this.bettingBgm = null;
        this.bettingBgmPlayPromise = null;
        this.raceBgm = null;
        this.raceBgmPlayPromise = null;
        this._injectStyles();
    }

    _injectStyles() {
        if (document.getElementById('game-racing-styles')) return;
        const style = document.createElement('style');
        style.id = 'game-racing-styles';
        style.innerHTML = `
            .game-racetrack-container {
                position: fixed;
                top: 4vh;
                left: 5%;
                width: 90%;
                max-height: 76vh;
                background: rgba(10, 10, 25, 0.9);
                border: 4px solid #00d2ff;
                box-shadow: 0 0 40px rgba(0, 210, 255, 0.45), inset 0 0 20px rgba(0, 210, 255, 0.2);
                border-radius: 28px;
                padding: 2vh;
                box-sizing: border-box;
                backdrop-filter: blur(15px);
                z-index: 2147483641;
                animation: game-slide-up 0.5s ease-out forwards;
                font-family: 'CookieRun-Regular', sans-serif;
                overflow: visible;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .game-racing-card {
                background: rgba(20, 10, 42, 0.9);
                border: 6px solid #00ffa3;
                box-shadow: 0 0 60px rgba(0, 255, 163, 0.45), inset 0 0 30px rgba(0, 255, 163, 0.2);
                border-radius: 42px;
                padding: 40px 60px;
                width: 1100px;
                text-align: center;
                backdrop-filter: blur(15px);
                animation: game-slide-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                pointer-events: auto;
                position: relative;
                z-index: 2147483645;
            }
            .game-racing-card .game-title {
                font-size: 4.5rem !important;
                margin-bottom: 12px;
            }
            .game-racing-card .game-subtitle {
                font-size: 2.2rem !important;
                margin-bottom: 25px;
                color: #00d2ff;
                font-weight: bold;
            }
            .game-racing-card .game-timer {
                font-size: 3.0rem !important;
                margin-top: 25px;
            }
            .game-racing-card .game-participants-count {
                font-size: 1.8rem !important;
                margin-top: 15px;
                color: #ffb703;
                font-weight: bold;
            }
            .game-racing-options-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 25px;
                margin: 35px 0;
            }
            .game-racing-option-card {
                background: rgba(255, 255, 255, 0.05);
                border: 2.5px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 25px 15px;
                text-align: center;
                transition: all 0.25s ease;
            }
            .game-racing-option-card.active {
                border-color: #00ffa3;
                background: rgba(0, 255, 163, 0.15);
                box-shadow: 0 0 25px rgba(0, 255, 163, 0.3);
            }
            .game-lane-track {
                height: clamp(130px, 16.5vh, 200px);
                position: relative;
                border-bottom: 2px dashed rgba(255, 255, 255, 0.15);
                display: flex;
                align-items: center;
                overflow: visible;
            }
            .game-lane-track:last-child {
                border-bottom: none;
            }
            .game-lane-num-badge {
                width: 80px;
                font-size: clamp(2.5rem, 3.5vh, 4rem);
                font-weight: bold;
                color: #00d2ff;
                text-align: center;
                z-index: 10;
            }
            .game-racer-wrapper {
                position: absolute;
                left: 80px;
                bottom: 0.5vh;
                top: 0.5vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                z-index: 5;
                transition: left 0.08s linear;
                overflow: visible;
            }
            .game-racer-avatar {
                font-size: clamp(70px, 8.4vh, 140px);
                line-height: 1;
                font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Android Emoji', 'EmojiSymbols', sans-serif !important;
                font-style: normal;
                display: flex;
                align-items: center;
                justify-content: center;
                width: clamp(70px, 8.4vh, 140px);
                height: clamp(70px, 8.4vh, 140px);
                transition: filter 0.15s ease;
                will-change: transform;
                flex-shrink: 0;
                position: relative;
                z-index: 6;
            }
            .game-racer-avatar img.emoji {
                width: clamp(70px, 8.4vh, 140px) !important;
                height: clamp(70px, 8.4vh, 140px) !important;
                max-width: none !important;
                max-height: none !important;
                display: block !important;
                pointer-events: none;
                transform: scaleX(-1); /* 이모지 좌우 반전으로 우측 진행 방향 맞춤 */
            }
            .game-racer-label {
                font-size: clamp(14px, 1.6vh, 22px);
                font-weight: bold;
                color: #fff;
                background: rgba(0, 0, 0, 0.75);
                padding: 4px 12px;
                border-radius: 8px;
                margin-top: 5px;
                white-space: nowrap;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            .game-racer-status-bubble {
                position: absolute;
                top: -45px;
                background: #ffb703;
                color: #000;
                font-size: 1.4rem;
                font-weight: bold;
                padding: 4px 12px;
                border-radius: 10px;
                white-space: nowrap;
                opacity: 0;
                transform: scale(0.8);
                transition: opacity 0.15s ease, transform 0.15s ease;
                pointer-events: none;
                box-shadow: 0 5px 12px rgba(0,0,0,0.35);
                z-index: 10;
            }
            .game-racer-status-bubble.visible {
                opacity: 1;
                transform: scale(1.0);
            }
            .game-racing-finish-line {
                position: absolute;
                right: 60px;
                top: 0;
                bottom: 0;
                width: 16px;
                background: repeating-linear-gradient(
                    0deg,
                    #fff,
                    #fff 16px,
                    #000 16px,
                    #000 32px
                );
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.65);
                z-index: 3;
            }
            .game-racing-particle {
                position: absolute;
                font-size: 3.5rem;
                pointer-events: none;
                z-index: 100;
                animation: racer-particle-float 0.8s ease-out forwards;
            }
            @keyframes racer-particle-float {
                0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
                100% { transform: translateY(-60px) scale(0.5) rotate(180deg); opacity: 0; }
            }
            .game-commentary-bar {
                background: rgba(0, 0, 0, 0.85);
                border: 2px solid #ffb703;
                border-radius: 12px;
                padding: 12px 20px;
                font-size: clamp(1.4rem, 2vh, 2.2rem);
                color: #ffb703;
                font-weight: bold;
                margin-top: 1vh;
                text-align: center;
                text-shadow: 0 0 5px rgba(255, 183, 3, 0.4);
                min-height: 35px;
                transition: all 0.2s ease;
                animation: pulse-commentary 1.5s infinite alternate;
            }
            @keyframes pulse-commentary {
                0% { border-color: #ffb703; box-shadow: 0 0 5px rgba(255,183,3,0.3); }
                100% { border-color: #00d2ff; box-shadow: 0 0 15px rgba(0,210,255,0.5); }
            }
        `;
        document.head.appendChild(style);
    }

    playRaceSound(category) {
        const soundPools = {
            start: ['시작!', '가자', '가즈아', '가자!', '아스아!', '나이스', '오케이'],
            slip: ['꺄악', '아이썅', '어딜도', '어머어머', '응애', '지랄도풍년', '아이고~', '끼야악', '냥냥', '이상한데수', '뭐야!', '엥?'],
            trip: ['아이보', '이런씨벌', '이런시벌탱', '아악!', '너무한', '아이고~', '윽!', '시발', '시발롬'],
            sleep: ['잠들어라', '귀찮아귀찮아', '근무시간', '모넌을꺼요', '잠깐만요'],
            lightning: ['부끝', '기가맥', '알피엠', '이요옷', '용의항문', '뜨겁게해줄게'],
            overdrive: ['가즈아', '나이사', '오예', '오올', '카와붕가', '용못참', '나이스', '기모띠', '피버'],
            missile: ['공습경보', '격추', '응너개못해', '수류탄', '쏠수있어'],
            carrot: ['당근', '옴뇸뇸', '야무지게먹어', '존맛탱', '마이쩡', '맛있다', '마이쪙'],
            ginseng: ['대박', '대빵', '기가맥', '아주강력해', '역시!', '갓겜송', '나이스', '기폭용항', '노벨상줘야'],
            shield: ['네전태', '가드만', '자제하시오', '도킹'],
            banana_trap: ['똥침', '퇴엣', '지랄도풍년', '함정'],
            tackle: ['발차기!', '팅!'],
            win: ['대박', '풍악을울려라', '아주마음에듭니다', '굉장히만족', '오홍홍좋아요', '우마꾸데끼루', '만족해?', '따라란', '나이스', '나이사', '성공!'],
            portal: ['왜자르지않', '이상한데수', '어디가냐'],
            wind: ['하야이', '알피엠'],
            dizzy: ['정신차려', '대구빡이'],
            gravity: ['이요옷', '기가맥', '가즈아'],
            freeze: ['꽁꽁', '꼼짝'],
            devil: ['사쿠라야', '야스', '이건기회야'],
            ghost: ['못숨지', '이상한데수'],
            timewarp: ['잠깐만요', '장비를 정지', '정지가 안돼']
        };

        const pool = soundPools[category];
        if (!pool) return;
        const chosenKey = pool[Math.floor(Math.random() * pool.length)];
        const soundConfig = this.config.getSoundConfig();
        const sound = soundConfig[chosenKey] || chosenKey;
        this.eventBus.emit('audio:playVisualSound', sound);
    }

    async execute(context) {
        this.director.activeGame = this;
        this.isActive = true;
        this.phase = 'betting';
        this.bets = {};

        // 안전 장치: 기존 재생 중인 BGM 완전 정리
        if (this.bettingBgm) {
            const bgm = this.bettingBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (this.bettingBgmPlayPromise) {
                this.bettingBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            this.bettingBgm = null;
            this.bettingBgmPlayPromise = null;
        }
        if (this.raceBgm) {
            const bgm = this.raceBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (this.raceBgmPlayPromise) {
                this.raceBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            this.raceBgm = null;
            this.raceBgmPlayPromise = null;
        }

        // [New] Betting Phase Background BGM Play
        try {
            this.bettingBgm = new Audio('BGM/SportBGM.mp3');
            this.bettingBgm.loop = false;
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.bettingBgm.volume = volConfig.master * volConfig.visual * 0.39;
            this.bettingBgmPlayPromise = this.bettingBgm.play().catch(e => console.warn("Betting BGM playback blocked:", e));
        } catch (e) {
            console.warn("Failed to initialize Betting BGM:", e);
        }

        // 50-racer pool — 4 are randomly selected each game
        const ALL_RACERS = [
            { name: '적토마',   emoji: '🐎', code: '1f40e' },
            { name: '유니콘',   emoji: '🦄', code: '1f984' },
            { name: '얼룩마',   emoji: '🦓', code: '1f993' },
            { name: '경주마',   emoji: '🏇', code: '1f3c7' },
            { name: '조랑말',   emoji: '🐴', code: '1f434' },
            { name: '쾌속토끼', emoji: '🐇', code: '1f407' },
            { name: '불굴거북', emoji: '🐢', code: '1f422' },
            { name: '도약개구리',emoji: '🐸', code: '1f438' },
            { name: '영리여우', emoji: '🦊', code: '1f98a' },
            { name: '늑대기사', emoji: '🐺', code: '1f43a' },
            { name: '사자왕',   emoji: '🦁', code: '1f981' },
            { name: '호랑이',   emoji: '🐯', code: '1f42f' },
            { name: '북극곰',   emoji: '🐻‍❄️', code: '1f43b-200d-2744-fe0f' },
            { name: '판다무사', emoji: '🐼', code: '1f43c' },
            { name: '너구리도둑',emoji: '🦝', code: '1f99d' },
            { name: '캥거루',   emoji: '🦘', code: '1f998' },
            { name: '알파카',   emoji: '🦙', code: '1f999' },
            { name: '사슴왕',   emoji: '🦌', code: '1f98c' },
            { name: '멧돼지',   emoji: '🐗', code: '1f417' },
            { name: '플라밍고', emoji: '🦩', code: '1fa7b' },
            { name: '독수리',   emoji: '🦅', code: '1f985' },
            { name: '펭귄특공대',emoji: '🐧', code: '1f427' },
            { name: '오리',     emoji: '🦆', code: '1f986' },
            { name: '앵무새',   emoji: '🦜', code: '1f99c' },
            { name: '악어',     emoji: '🐊', code: '1f40a' },
            { name: '상어',     emoji: '🦈', code: '1f988' },
            { name: '돌고래',   emoji: '🐬', code: '1f42c' },
            { name: '문어',     emoji: '🐙', code: '1f419' },
            { name: '전갈',     emoji: '🦂', code: '1f982' },
            { name: '드래곤',   emoji: '🐉', code: '1f409' },
            { name: '브라키오', emoji: '🦕', code: '1f995' },
            { name: '티라노',   emoji: '🦖', code: '1f996' },
            { name: '로봇',     emoji: '🤖', code: '1f916' },
            { name: '외계인',   emoji: '👾', code: '1f47e' },
            { name: '우주선',   emoji: '🚀', code: '1f680' },
            { name: 'F1카',     emoji: '🏎️', code: '1f3ce-fe0f' },
            { name: 'UFO',      emoji: '🛸', code: '1f6f8' },
            { name: '오토바이', emoji: '🏍️', code: '1f3cd-fe0f' },
            { name: '불꽃마',   emoji: '🔥', code: '1f525' },
            { name: '번개마',   emoji: '⚡', code: '26a1' },
            { name: '유령마',   emoji: '👻', code: '1f47b' },
            { name: '해골마',   emoji: '💀', code: '1f480' },
            { name: '악마마',   emoji: '😈', code: '1f608' },
            { name: '닌자',     emoji: '🥷', code: '1f977' },
            { name: '슈퍼영웅', emoji: '🦸', code: '1f9b8' },
            { name: '좀비',     emoji: '🧟', code: '1f9df' },
            { name: '마법사',   emoji: '🧙', code: '1f9d9' },
            { name: '눈사람',   emoji: '⛄', code: '26c4' },
            { name: '크리스마스',emoji: '🎅', code: '1f385' },
            { name: '고슴도치', emoji: '🦔', code: '1f994' },
            { name: '피그레인저',emoji: '🐖', code: '1f416' }
        ];

        // Shuffle and pick 4 random racers each game
        const shuffled = [...ALL_RACERS].sort(() => Math.random() - 0.5);
        this.racers = shuffled.slice(0, 4).map((r, id) => ({
            id, name: r.name, emoji: r.emoji, code: r.code,
            pos: 0, speed: 0, boost: 0,
            stunTicks: 0, shieldTicks: 0,
            scale: 1, rotate: 0,
            statusText: '', statusTimer: 0,
            hasItem1: false, hasItem2: false
        }));

        // Create Betting UI Card (Center of screen)
        const container = document.createElement('div');
        container.className = 'game-overlay-container';
        container.innerHTML = `
            <div class="game-racing-card">
                <div class="game-title"><img class="emoji" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3c7.svg" style="width:3.3rem; height:3.3rem; vertical-align:middle; display:inline-block;" /> 채팅 경마 게임!</div>
                <div class="game-subtitle">응원할 선수를 채팅창에 입력하여 배팅하세요!</div>
                
                <div class="game-racing-options-grid">
                    ${this.racers.map(r => `
                    <div class="game-racing-option-card" id="opt-${r.id}">
                        <div class="race-bet-emoji" style="display:flex; align-items:center; justify-content:center; height:7rem;">
                            <img class="emoji" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${r.code}.svg" style="width:7rem; height:7rem; display:block; transform: scaleX(-1);" />
                        </div>
                        <div style="font-weight:bold; font-size:1.4rem; margin-top:8px; color:#fff;">${r.id + 1}. ${r.name}</div>
                        <div style="font-size:0.9rem; color:#00ffa3; margin-top:5px; font-weight:bold; background:rgba(0,255,163,0.1); border-radius:6px; padding:3px 0;">채팅: ${r.id + 1}</div>
                        <div class="bet-count" style="font-size:1.1rem; color:#aaa; margin-top:8px; font-weight:bold;">0명 배팅</div>
                    </div>`).join('')}
                </div>
                
                <div class="game-timer">남은 배팅 시간: 29초</div>
                <div class="game-participants-count">선수 번호(1~4)를 쳐서 신속하게 배팅하세요!</div>
            </div>
        `;
        document.body.appendChild(container);

        this.updateBettingUI = () => {
            const counts = [0, 0, 0, 0];
            Object.values(this.bets).forEach(bet => {
                counts[bet.index]++;
            });
            for (let i = 0; i < 4; i++) {
                const opt = container.querySelector(`#opt-${i}`);
                if (opt) {
                    opt.querySelector('.bet-count').textContent = `${counts[i]}명 배팅`;
                    if (counts[i] > 0) opt.classList.add('active');
                }
            }
        };

        let timeLeft = 29;
        const timerEl = container.querySelector('.game-timer');

        if (this.bettingBgm) {
            const onBettingMetadata = () => {
                if (this.bettingBgm.duration && this.bettingBgm.duration > 1) {
                    timeLeft = Math.round(this.bettingBgm.duration);
                    if (timerEl) {
                        timerEl.textContent = `남은 배팅 시간: ${timeLeft}초`;
                    }
                }
            };
            if (this.bettingBgm.readyState >= 1) {
                onBettingMetadata();
            } else {
                this.bettingBgm.addEventListener('loadedmetadata', onBettingMetadata);
            }
        }

        return new Promise(resolve => {
            this.resolveGame = resolve;
            this.bettingTimer = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    clearInterval(this.bettingTimer);
                    this.bettingTimer = null;
                    if (this.bettingBgm) {
                        const bgm = this.bettingBgm;
                        const stopBgm = () => {
                            try {
                                bgm.pause();
                                bgm.volume = 0;
                                bgm.muted = true;
                                bgm.src = '';
                                bgm.load();
                            } catch(e){}
                        };
                        if (this.bettingBgmPlayPromise) {
                            this.bettingBgmPlayPromise.then(stopBgm).catch(stopBgm);
                        } else {
                            stopBgm();
                        }
                        this.bettingBgm = null;
                        this.bettingBgmPlayPromise = null;
                    }
                    container.remove();
                    this.startRace(resolve);
                } else {
                    timerEl.textContent = `남은 배팅 시간: ${timeLeft}초`;
                }
            }, 1000);
        });
    }

    handleChat(msgData) {
        if (!this.isActive) return false;
        const msg = (msgData.message || "").trim();

        // [New] Streamer force stop support
        if (msgData.isStreamer && (msg === '!경마 중단' || msg === '!중단')) {
            this.forceStopGame();
            return true;
        }

        if (this.phase === 'betting') {
            let index = -1;
            if (msg === '1' || msg === '!1' || msg.includes('적토마') || msg.includes('🐎')) index = 0;
            else if (msg === '2' || msg === '!2' || msg.includes('유니콘') || msg.includes('🦄')) index = 1;
            else if (msg === '3' || msg === '!3' || msg.includes('얼룩마') || msg.includes('🦓')) index = 2;
            else if (msg === '4' || msg === '!4' || msg.includes('질풍마') || msg.includes('🏇')) index = 3;

            if (index !== -1) {
                this.bets[msgData.nickname] = { index, color: msgData.color || '#ffffff' };
                if (this.updateBettingUI) this.updateBettingUI();
                return true;
            }
        } else if (this.phase === 'racing') {
            let boostIndex = -1;
            if (msg.includes('1') || msg.includes('🐎') || msg.includes('적토마')) boostIndex = 0;
            else if (msg.includes('2') || msg.includes('🦄') || msg.includes('유니콘')) boostIndex = 1;
            else if (msg.includes('3') || msg.includes('🦓') || msg.includes('얼룩마')) boostIndex = 2;
            else if (msg.includes('4') || msg.includes('🏇') || msg.includes('질풍마')) boostIndex = 3;

            if (boostIndex !== -1) {
                this.racers[boostIndex].boost += 4.5; // add boost
                this.spawnBoostParticle(boostIndex);
                return true;
            }
        }
        return false;
    }

    forceStopGame() {
        this.isActive = false;
        this.phase = 'ended';
        this.director.activeGame = null;
        if (this.bettingTimer) {
            clearInterval(this.bettingTimer);
            this.bettingTimer = null;
        }
        if (this.bettingBgm) {
            const bgm = this.bettingBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (this.bettingBgmPlayPromise) {
                this.bettingBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            this.bettingBgm = null;
            this.bettingBgmPlayPromise = null;
        }
        if (this.raceBgm) {
            const bgm = this.raceBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (this.raceBgmPlayPromise) {
                this.raceBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            this.raceBgm = null;
            this.raceBgmPlayPromise = null;
        }
        const overlay = document.querySelector('.game-overlay-container');
        if (overlay) overlay.remove();
        const track = document.querySelector('.game-racetrack-container');
        if (track) track.remove();
        if (this.resolveGame) {
            this.resolveGame('__FORCE_STOP__');
            this.resolveGame = null;
        }
    }

    startRace(resolve) {
        this.phase = 'racing';
        
        // 안전 장치: 혹시라도 남아있을 기존 BGM 완전 정리
        if (this.bettingBgm) {
            const bgm = this.bettingBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (this.bettingBgmPlayPromise) {
                this.bettingBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            this.bettingBgm = null;
            this.bettingBgmPlayPromise = null;
        }
        if (this.raceBgm) {
            const bgm = this.raceBgm;
            const stopBgm = () => {
                try {
                    bgm.pause();
                    bgm.volume = 0;
                    bgm.muted = true;
                    bgm.src = '';
                    bgm.load();
                } catch(e){}
            };
            if (this.raceBgmPlayPromise) {
                this.raceBgmPlayPromise.then(stopBgm).catch(stopBgm);
            } else {
                stopBgm();
            }
            this.raceBgm = null;
            this.raceBgmPlayPromise = null;
        }

        // 1. 질주 배경 BGM 로딩 및 재생 (소개 페이즈부터 시작)
        try {
            this.raceBgm = new Audio('BGM/William Tell.mp3');
            this.raceBgm.loop = false; // 루프 방지 설정 명시화
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            this.raceBgm.volume = volConfig.master * volConfig.visual * 0.45;
            this.raceBgmPlayPromise = this.raceBgm.play().catch(e => console.warn("Race BGM playback blocked:", e));
        } catch (e) {
            console.warn("Failed to load racing BGM:", e);
        }

        const track = document.createElement('div');
        track.className = 'game-racetrack-container';
        track.innerHTML = `
            <div class="game-title" style="font-size:3.5rem; text-align:center; margin-bottom: 8px;">
                <img class="emoji" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3c7.svg" style="width:3.5rem; height:3.5rem; vertical-align:middle; display:inline-block;" /> 실시간 경마 레이스! <img class="emoji" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3c1.svg" style="width:3.5rem; height:3.5rem; vertical-align:middle; display:inline-block;" />
            </div>
            <div style="font-size:2.0rem; text-align:center; color:#00d2ff; margin-bottom:20px; font-weight:bold;">
                채팅창에 번호(1~4) 또는 이모지를 쳐서 응원선수에게 부스트(⚡)를 주세욧!
            </div>
            <div class="game-racing-finish-line"></div>
            ${this.racers.map(r => `
                <div class="game-lane-track" id="racer-lane-${r.id}">
                    <div class="game-lane-num-badge">${r.id + 1}</div>
                    <div class="game-racer-wrapper" id="wrapper-${r.id}" style="left: 80px;">
                        <div class="game-racer-status-bubble" id="status-bubble-${r.id}"></div>
                        <div class="game-racer-avatar" id="avatar-${r.id}">
                            <img class="emoji" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${r.code}.svg" style="width:clamp(70px, 8.4vh, 140px); height:clamp(70px, 8.4vh, 140px); display:block;" />
                        </div>
                        <div class="game-racer-label" id="label-${r.id}">${r.name}</div>
                    </div>
                </div>
            `).join('')}
            <div class="game-commentary-bar" id="game-commentary"><img class="emoji" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3a4.svg" style="width:2.0rem; height:2.0rem; vertical-align:middle; display:inline-block;" /> [중계진] 경기 신호와 함께 힘차게 출발했습니다! 초반 기선 제압이 중요합니다!</div>
        `;
        document.body.appendChild(track);

        const width = window.innerWidth * 0.9;
        const finishX = width - 220; // Finish line boundary (adjusted for 2x larger racers)

        const commentaryEl = track.querySelector('#game-commentary');
        const updateCommentary = (text) => {
            if (commentaryEl) {
                commentaryEl.innerHTML = parseEmojisToImages(text, '2.0rem');
            }
        };

        // 13초 소개 타이머 세팅
        let introTicks = Math.round(13 * 1000 / 60); // 13초 = 217 ticks
        const INTRO_TEXTS = {
            '🐎': '🐎 적토마, 불꽃 파워 질주 준비!',
            '🦄': '🦄 유니콘, 무지개 차원 질주 준비!',
            '🦓': '🦓 얼룩마, 야생의 스피드 주행 준비!',
            '🏇': '🏇 경주마, 정통 기수 탑승 준비!',
            '🐴': '🐴 조랑말, 작지만 날카로운 다리 찢기!',
            '🐇': '🐇 쾌속토끼, 깡총 깡총 광속 도약!',
            '🐢': '🐢 불굴거북, 대기만성 껍질 충전!',
            '🐸': '🐸 개구리, 높이 뛰어 날아갈 테다!',
            '🦊': '🦊 영리여우, 잔머리 오버 가속!',
            '🐺': '🐺 늑대기사, 사냥감 포착 질주 개시!',
            '🦁': '🦁 사자왕, 트랙의 맹수 포효 시작!',
            '🐯': '🐯 호랑이, 어흥! 백호의 기운 충전!',
            '🐻‍❄️': '🐻‍❄️ 북극곰, 빙하 슬라이드 대기!',
            '🐼': '🐼 판다무사, 대나무 섭취 부스터 대기!',
            '🦝': '🦝 너구리, 요리조리 야바위 가속!',
            '🦘': '🦘 캥거루, 투 홉 원 스킵 무한 질주!',
            '🦙': '🦙 알파카, 우아한 메롱 도발 준비!',
            '🦌': '🦌 사슴왕, 뿔 박고 황소 돌진!',
            '🐗': '🐗 멧돼지, 일직선 돈돌격 가동!',
            '🦩': '🦩 플라밍고, 학다리 비행 전속력!',
            '🦅': '🦅 독수리, 지면 활공 스피드 기어!',
            '🐧': '🐧 펭귄, 배때지 슬라이딩 장전!',
            '🦆': '🦆 오리, 꽥꽥 폭음 분사기 개방!',
            '🦜': '🦜 앵무새, 구사일생 수다 부스터!',
            '🐊': '🐊 악어, 악어 이빨 들이밀기 장전!',
            '🦈': '🦈 상어, 피 냄새 맡은 극한의 속도!',
            '🐬': '🐬 돌고래, 파도타기 에어 점프 대기!',
            '🐙': '🐙 문어, 여덟 다리 동시 모터 가동!',
            '🦂': '🦂 전갈, 꼬리 독침 엔진 부착 완료!',
            '🐉': '🐉 드래곤, 용의 날개 가속 분사!',
            '🦕': '🦕 브라키오, 울트라 롱 스텝 질주!',
            '🦖': '🦖 티라노, 포식자 공룡 폭풍 돌진!',
            '🤖': '🤖 로봇, 초합금 피스톤 터보 스퍼트!',
            '👾': '👾 외계인, 텔레포트 전방 가속!',
            '🚀': '🚀 우주선, 메인 스러스트 무한 가속!',
            '🏎️': '🏎️ F1카, 포뮬러 RPM 레드라인 도달!',
            '🛸': '🛸 UFO, 반중력 비행 시동 완료!',
            '🏍️': '🏍️ 오토바이, 윌리 주행 머플러 화염!',
            '🔥': '🔥 불꽃마, 활활 타오르는 엔진 점화!',
            '⚡': '⚡ 번개마, 초광속 벼락 전류 준비!',
            '👻': '👻 유령마, 물질 투과 은신 대기!',
            '💀': '💀 해골마, 언데드 뼈다귀 기어 가동!',
            '😈': '😈 악마마, 지옥불 꼬리 불뿜기 완료!',
            '🥷': '🥷 닌자, 그림자 분신 가속 장전!',
            '🦸': '🦸 히어로, 초능력 슈퍼 스피드 대기!',
            '🧟': '🧟 좀비, 뇌를 쫓는 무한 생명력!',
            '🧙': '🧙 마법사, 염력 단축 이동 준비!',
            '⛄': '⛄ 눈사람, 빙판길 고속 눈사태!',
            '🎅': '🎅 산타, 루돌프 썰매 터보 엔진!',
            '🦔': '🦔 고슴도치, 스핀 대시 초고속 구르기!',
            '🐖': '🐖 피그, 꿀꿀 돼지 파워 전력 질주!'
        };

        let ticks = 0;
        let bgmDuration = 42; // loadedmetadata 전 폴백 시간
        let runDuration = Math.max(5, bgmDuration - 13); // 실 주행 시간 (BGM 시간 - 소개 시간 13초)
        let totalTicks = runDuration * 1000 / 60;
        let targetAvgSpeed = 100 / totalTicks;

        if (this.raceBgm) {
            const onMetadataLoaded = () => {
                bgmDuration = this.raceBgm.duration || 42;
                runDuration = Math.max(5, bgmDuration - 13);
                totalTicks = runDuration * 1000 / 60;
                targetAvgSpeed = 100 / totalTicks;
            };
            if (this.raceBgm.readyState >= 1) {
                onMetadataLoaded();
            } else {
                this.raceBgm.addEventListener('loadedmetadata', onMetadataLoaded);
            }
        }

        const interval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(interval);
                return;
            }
            let finished = false;
            let winnerId = -1;
            ticks++;

            // 1. 소개(인트로) 상태 처리 (13초 = 217 ticks 동안)
            if (introTicks > 0) {
                introTicks--;
                const elapsedMs = ticks * 60;
                const elapsedSec = elapsedMs / 1000;
                const activeRacerIdx = Math.floor(elapsedSec / 3); // 3초마다 1마리씩

                this.racers.forEach((r, idx) => {
                    const av = track.querySelector(`#avatar-${r.id}`);
                    const bubble = track.querySelector(`#status-bubble-${r.id}`);

                    if (idx === activeRacerIdx && elapsedSec < 12) {
                        // 소개 대상 말: 1.8배로 줌인
                        r.scale = 1.8;
                        r.statusText = INTRO_TEXTS[r.emoji] || `${r.emoji} ${r.name}, 출발 준비 완료!`;
                        
                        // 매 3초가 시작될 때마다 말 울음소리/시작 CMC 연동
                        if (Math.abs(elapsedMs % 3000 - 60) < 30) {
                            this.playRaceSound('win'); // "대박" 등 활기찬 목소리로 소개
                            updateCommentary(`🎤 [중계진] ${idx + 1}번 마, ${r.name} 선수가 온몸의 힘을 충전하며 긴장감을 올립니다!`);
                        }
                    } else if (elapsedSec >= 12 && elapsedSec < 13) {
                        // 카운트다운 기간 (12~13초)
                        r.scale = 1.0;
                        r.statusText = '🏁 게이트 정렬!';
                        if (Math.abs(elapsedMs % 12000 - 60) < 30) {
                            this.playRaceSound('start'); // "시작!" 등 사운드
                            updateCommentary(`🎤 [중계진] 모든 선수 준비 완료! 게이트가 닫히고 출발 신호를 대기합니다!`);
                        }
                    } else {
                        // 소개받지 않는 다른 말들: scale 다운하여 줌인 효과 강조
                        r.scale = 0.85;
                        r.statusText = '';
                    }

                    if (av) {
                        av.style.transform = `scale(${r.scale})`;
                    }
                    if (bubble) {
                        if (r.statusText) {
                            bubble.innerHTML = parseEmojisToImages(r.statusText, '1.2rem');
                            bubble.classList.add('visible');
                        } else {
                            bubble.classList.remove('visible');
                        }
                    }
                });

                if (introTicks === 0) {
                    // 소개 상태 복원
                    this.racers.forEach(r => {
                        r.scale = 1.0;
                        r.statusText = '';
                        const av = track.querySelector(`#avatar-${r.id}`);
                        const bubble = track.querySelector(`#status-bubble-${r.id}`);
                        if (av) av.style.transform = `scale(1.0)`;
                        if (bubble) bubble.classList.remove('visible');
                    });
                    
                    this.playRaceSound('start');
                    updateCommentary(`🎤 [중계진] 탕! 신호와 함께 전설적인 레이스가 시작됩니다!!!`);
                    ticks = 0; // 달리기를 위한 틱 카운트 초기화
                }
                return;
            }

            // 2. 실제 달리기 처리
            // Periodic commentary updates every 90 ticks (~5.4s)
            if (ticks % 90 === 0) {
                const sorted = [...this.racers].sort((a, b) => b.pos - a.pos);
                const leader = sorted[0];
                const second = sorted[1];
                const last = sorted[3];

                const comments = [
                    `🎤 [중계진] 현재 1위는 ${leader.emoji} ${leader.name}! 선두를 굳건히 지키고 있습니다!`,
                    `🎤 [중계진] ${second.emoji} ${second.name} 선수가 선두 ${leader.name}를 바짝 압박 중입니다!`,
                    `🎤 [중계진] 힘을 내야 합니다! ${last.emoji} ${last.name} 선수가 하위권에서 역전을 노립니다!`,
                    `🎤 [중계진] 경기장 열기가 뜨겁습니다! 과연 어떤 말이 우승을 차지할까요?`
                ];
                updateCommentary(comments[Math.floor(Math.random() * comments.length)]);
            }

            this.racers.forEach(r => {
                if (finished) return;

                // Decrement stun ticks
                if (r.stunTicks > 0) {
                    r.stunTicks--;
                    if (r.stunTicks === 0) {
                        r.rotate = 0;
                        r.scale = 1.0;
                    }
                }

                // Decrement shield ticks
                if (r.shieldTicks > 0) {
                    r.shieldTicks--;
                }

                // Decrement status timer
                if (r.statusTimer > 0) {
                    r.statusTimer--;
                    if (r.statusTimer === 0) {
                        r.statusText = '';
                    }
                }

                // Item check 1 (At 35% distance)
                if (r.pos >= 35 && !r.hasItem1) {
                    r.hasItem1 = true;
                    this.triggerItemEvent(r, updateCommentary);
                }

                // Item check 2 (At 70% distance)
                if (r.pos >= 70 && !r.hasItem2) {
                    r.hasItem2 = true;
                    this.triggerItemEvent(r, updateCommentary);
                }

                // Random event trigger: 0.8% chance per tick (21 rich random events!)
                if (r.stunTicks === 0 && r.pos > 5 && r.pos < 90 && Math.random() < 0.008) {
                    const eventRoll = Math.random();
                    if (eventRoll < 0.05 && r.shieldTicks === 0) {
                        // 1. Slipped on banana!
                        r.stunTicks = 25; 
                        r.rotate = 360;
                        r.scale = 0.9;
                        r.statusText = '🍌 바나나 밟음!';
                        r.statusTimer = 25;
                        this.playRaceSound('slip');
                        updateCommentary(`🎤 [중계진] 앗! ${r.name} 선수가 누군가 버린 바나나 껍질에 미끄러집니다!!!`);
                    } else if (eventRoll < 0.10) {
                        // 2. Struck by lightning!
                        r.boost += 12.0;
                        r.scale = 1.35;
                        r.statusText = '⚡ 벼락 돌진!';
                        r.statusTimer = 20;
                        this.playRaceSound('lightning');
                        updateCommentary(`🎤 [중계진] 쿠르릉 쾅! ${r.name} 선수, 마른하늘에 날벼락을 맞고 초고속 돌진!!!`);
                    } else if (eventRoll < 0.15 && r.shieldTicks === 0) {
                        // 3. Tripped!
                        r.stunTicks = 18; 
                        r.rotate = -90;
                        r.statusText = '🤕 엎어짐!';
                        r.statusTimer = 18;
                        this.playRaceSound('trip');
                        updateCommentary(`🎤 [중계진] 아이쿠! ${r.name} 선수, 턱에 걸려 꼴사납게 엎어집니다!`);
                    } else if (eventRoll < 0.20) {
                        // 4. Exhausted / Sleepy!
                        r.stunTicks = 15;
                        r.scale = 0.8;
                        r.statusText = '💤 졸음 비틀';
                        r.statusTimer = 15;
                        this.playRaceSound('sleep');
                        updateCommentary(`🎤 [중계진] ${r.name} 선수, 밤샘 수렵으로 졸음 비틀 상태에 빠집니다!`);
                    } else if (eventRoll < 0.25) {
                        // 5. Overdrive!
                        r.boost += 18.0;
                        r.statusText = '🔥 부스터 폭발!';
                        r.statusTimer = 25;
                        this.playRaceSound('overdrive');
                        updateCommentary(`🎤 [중계진] ${r.name} 선수, 엉덩이에 부스터 점화! 무서운 속도입니다!`);
                    } else if (eventRoll < 0.30) {
                        // 6. Portal Teleport!
                        r.pos += 12.0;
                        r.statusText = '🌀 차원 관통!';
                        r.statusTimer = 20;
                        this.playRaceSound('portal');
                        updateCommentary(`🎤 [중계진] 공간 왜곡! ${r.name} 선수가 포탈을 타고 훌쩍 앞서나갑니다!`);
                    } else if (eventRoll < 0.35) {
                        // 7. Wind Gust!
                        r.boost += 9.0;
                        r.statusText = '🌪️ 순풍 탑승!';
                        r.statusTimer = 20;
                        this.playRaceSound('wind');
                        updateCommentary(`🎤 [중계진] 대기 흐름 가동! ${r.name} 선수, 순풍을 타고 매끄럽게 속도를 올립니다!`);
                    } else if (eventRoll < 0.40 && r.shieldTicks === 0) {
                        // 8. Stumble/Dizzy!
                        r.stunTicks = 12;
                        r.rotate = 360;
                        r.statusText = '💫 어지러움!';
                        r.statusTimer = 15;
                        this.playRaceSound('dizzy');
                        updateCommentary(`🎤 [중계진] 아차차! ${r.name} 선수, 발이 꼬이며 제자리 360도 턴을 돕니다!`);
                    } else if (eventRoll < 0.45) {
                        // 9. Gravity Inversion!
                        r.boost += 14.0;
                        r.scale = 1.25;
                        r.statusText = '🎈 반중력 부상!';
                        r.statusTimer = 25;
                        this.playRaceSound('gravity');
                        updateCommentary(`🎤 [중계진] 중력 상실! ${r.name} 선수가 가볍게 떠오르며 트랙 마찰을 무시하고 질주합니다!`);
                    } else if (eventRoll < 0.50) {
                        // 10. Rivalry / Fire in Eyes!
                        r.boost += 20.0;
                        r.statusText = '🔥 승부욕 폭발!';
                        r.statusTimer = 20;
                        this.playRaceSound('fire');
                        updateCommentary(`🎤 [중계진] 눈빛 교환! ${r.name} 선수가 엄청난 열정을 내뿜으며 앞서나갑니다!`);
                    } else if (eventRoll < 0.55 && r.shieldTicks === 0) {
                        // 11. Mud Puddle!
                        r.stunTicks = 16;
                        r.statusText = '💩 진흙 함정!';
                        r.statusTimer = 16;
                        this.playRaceSound('mud');
                        updateCommentary(`🎤 [중계진] 앗! ${r.name} 선수가 질척이는 진흙 웅덩이에 빠져 버둥거립니다!`);
                    } else if (eventRoll < 0.60 && r.shieldTicks === 0) {
                        // 12. Hypnosis / Reverse Run!
                        r.pos = Math.max(0, r.pos - 5.0);
                        r.statusText = '🌀 최면 역주행!';
                        r.statusTimer = 15;
                        this.playRaceSound('trip');
                        updateCommentary(`🎤 [중계진] 이런! ${r.name} 선수가 최면에 걸려 잠시 역주행을 시도합니다!`);
                    } else if (eventRoll < 0.65) {
                        // 13. Gold Rush / Coin Shower!
                        r.boost += 10.0;
                        r.statusText = '🪙 황금 샤워!';
                        r.statusTimer = 20;
                        this.playRaceSound('carrot');
                        updateCommentary(`🎤 [중계진] 보너스 타임! ${r.name} 선수가 트랙에 떨어진 금화를 주우며 전진합니다!`);
                    } else if (eventRoll < 0.70 && r.shieldTicks === 0) {
                        // 14. EMP Blast!
                        r.stunTicks = 14;
                        r.statusText = '🔌 EMP 타격!';
                        r.statusTimer = 14;
                        this.playRaceSound('missile');
                        updateCommentary(`🎤 [중계진] 피잉! 전자기 펄스가 발생해 ${r.name} 선수의 전자 제어가 일시 정지됩니다!`);
                    } else if (eventRoll < 0.75) {
                        // 15. Adrenaline Rush!
                        r.boost += 25.0;
                        r.statusText = '⚡ 아드레날린!';
                        r.statusTimer = 22;
                        this.playRaceSound('overdrive');
                        updateCommentary(`🎤 [중계진] 호르몬 폭발! ${r.name} 선수가 폭발적인 아드레날린 분출로 달리기 시작합니다!`);
                    } else if (eventRoll < 0.80) {
                        // 16. Tornado fling!
                        r.pos += 15.0;
                        r.stunTicks = 10;
                        r.rotate = 720;
                        r.statusText = '🌪️ 회오리 탑승!';
                        r.statusTimer = 20;
                        this.playRaceSound('wind');
                        updateCommentary(`🎤 [중계진] 거센 토네이도! ${r.name} 선수가 회오리에 휘말려 앞으로 날아갔지만 비틀거립니다!`);
                    } else if (eventRoll < 0.85) {
                        // 17. Sneezing!
                        r.pos += 6.0;
                        r.rotate = 30;
                        r.statusText = '🤧 재채기 뿜!';
                        r.statusTimer = 15;
                        this.playRaceSound('trip');
                        updateCommentary(`🎤 [중계진] 에취! ${r.name} 선수가 강력한 재채기 추진력으로 앞으로 살짝 밀려납니다!`);
                    } else if (eventRoll < 0.90) {
                        // 18. Shadow Clone!
                        r.boost += 13.0;
                        r.statusText = '🥷 분신 분열!';
                        r.statusTimer = 20;
                        this.playRaceSound('ghost');
                        updateCommentary(`🎤 [중계진] 인법 분신술! ${r.name} 선수가 잔상을 남기며 앞으로 빠르게 가속합니다!`);
                    } else if (eventRoll < 0.95) {
                        // 19. Giant Weight Stomp!
                        r.stunTicks = 8;
                        r.scale = 1.6;
                        r.statusText = '🏋️ 무게 초과!';
                        r.statusTimer = 20;
                        this.playRaceSound('tackle');
                        updateCommentary(`🎤 [중계진] 쿵! ${r.name} 선수가 대형화되며 엄청난 무게로 바닥을 찍고 비틀댑니다!`);
                    } else if (r.shieldTicks === 0) {
                        // 20. Panic run!
                        r.boost += 15.0;
                        r.rotate = 45;
                        r.statusText = '😱 패닉 질주!';
                        r.statusTimer = 20;
                        this.playRaceSound('slip');
                        updateCommentary(`🎤 [중계진] 깜짝이야! ${r.name} 선수가 갑자기 공포에 질려 비명을 지르며 뛰어갑니다!`);
                    } else {
                        // 21. Blessing of the Goddess!
                        r.shieldTicks = 120;
                        r.boost += 11.0;
                        r.statusText = '😇 여신의 가호!';
                        r.statusTimer = 25;
                        this.playRaceSound('shield');
                        updateCommentary(`🎤 [중계진] 성스러운 보호! ${r.name} 선수가 긴 시간 무적 가호를 얻고 안정적으로 스피드를 냅니다!`);
                    }
                }

                // Interaction check: tackle/push a nearby opponent (0.25% chance per tick)
                if (r.stunTicks === 0 && r.pos > 10 && r.pos < 85 && Math.random() < 0.0025) {
                    const target = this.racers.find(o => o.id !== r.id && Math.abs(o.pos - r.pos) < 6 && o.stunTicks === 0);
                    if (target) {
                        if (target.shieldTicks > 0) {
                            target.statusText = '🛡️ 공격 방어!';
                            target.statusTimer = 15;
                            this.playRaceSound('shield');
                            updateCommentary(`🎤 [중계진] ${r.name}가 밀쳐보려 했으나 ${target.name}의 방어막에 튕겨나갑니다!`);
                        } else {
                            r.boost += 4.0;
                            r.statusText = '💢 몸싸움 승리!';
                            r.statusTimer = 15;
 
                            target.pos = Math.max(0, target.pos - 5);
                            target.stunTicks = 10;
                            target.rotate = 15;
                            target.statusText = '💥 밀려남!';
                            target.statusTimer = 15;
                            
                            this.playRaceSound('tackle');
                            updateCommentary(`🎤 [중계진] 쾅! ${r.name} 선수의 격렬한 몸싸움! ${target.name} 선수를 밀쳐냅니다!`);
                        }
                    }
                }

                // BGM 시간 기준 속도 자동 보정 (William Tell 재생 시간에 따라)
                const currentTime = this.raceBgm ? this.raceBgm.currentTime : 0;
                const duration = this.raceBgm ? this.raceBgm.duration : 42;
                
                // 남은 시간 4초 미만 시 가속하여 부드럽고 자연스러운 피니시 연출
                let speedMultiplier = 1.0;
                if (duration - currentTime < 4.0 && duration > 5) {
                    speedMultiplier = 1.8;
                }

                // Calculate move speed based on targetAvgSpeed
                let baseSpeed = 0;
                if (r.stunTicks === 0) {
                    baseSpeed = targetAvgSpeed * (0.35 + Math.random() * 0.50) * speedMultiplier;
                } else {
                    if (r.statusText.includes('바나나') || r.statusText.includes('어지러움') || r.statusText.includes('빙결') || r.statusText.includes('스퍼트') || r.statusText.includes('회오리') || r.statusText.includes('최면') || r.statusText.includes('패닉')) {
                        r.rotate = (r.rotate + 15) % 360;
                    }
                }

                // 동적 러버밴드(Rubber-banding) 보정: BGM 재생률과 말의 위치 싱크 맞추기
                const elapsedSec = ticks * 0.06; // 1틱 = 60ms = 0.06초
                // BGM 시간 기준 위치 비율 목표치 (최대 0.95까지 유도 후 막판 스퍼트)
                const targetPosRatio = Math.min(0.95, elapsedSec / runDuration);
                const currentPosRatio = r.pos / 100;
                const diff = targetPosRatio - currentPosRatio;
                
                let minFactor = 0.15;
                if (r.statusText && (r.statusText.includes('돌진') || r.statusText.includes('부스터') || r.statusText.includes('당근') || r.statusText.includes('산삼') || r.statusText.includes('아드레날린') || r.statusText.includes('가속') || r.statusText.includes('순풍') || r.statusText.includes('스퍼트'))) {
                    minFactor = 0.6; // 버프 질주 중일 때는 감속 제약을 완화
                }
                
                let rubberBandFactor = 1.0;
                if (diff > 0) {
                    rubberBandFactor = 1.0 + (diff * 2.2); // 뒤처진 상태: 가속 유도 (최대 약 3배 속도)
                } else {
                    rubberBandFactor = Math.max(minFactor, 1.0 + (diff * 2.5)); // 너무 앞서간 상태: 감속 제어
                }

                // 남은 시간이 4초 미만인 피니시 구간에서는 감속 제약을 풀고 피니시 골인 가속
                if (duration - currentTime < 4.0 && duration > 5) {
                    rubberBandFactor = Math.max(rubberBandFactor, 1.3); // 감속 제약 해제 및 최소 1.3배 가속 유지
                }

                const boostDecay = r.boost * 0.15;
                const currentMove = (baseSpeed + boostDecay) * rubberBandFactor;
                r.boost = Math.max(0, r.boost - boostDecay); // consume boost

                r.pos += currentMove;

                // [하드 캡] BGM 재생 진행도가 90% 미만일 때 말이 결승선(100)을 조기 완주하지 않도록 최대 위치를 93%로 제한
                if (targetPosRatio < 0.90) {
                    r.pos = Math.min(93, r.pos);
                }

                const visualLeft = Math.min(finishX, 80 + (r.pos / 100) * (finishX - 80));

                const wrapper = track.querySelector(`#wrapper-${r.id}`);
                const av = track.querySelector(`#avatar-${r.id}`);
                const bubble = track.querySelector(`#status-bubble-${r.id}`);

                if (wrapper) {
                    wrapper.style.left = `${visualLeft}px`;
                }

                if (av) {
                    let rotation = r.rotate;
                    let scale = r.scale;
                    let translateY = 0;

                    // Running animation (bounce and wiggle merged into transform)
                    if (r.stunTicks === 0 && r.pos > 0 && r.pos < 100) {
                        const wiggle = Math.sin(Date.now() / 80) * 10;
                        rotation += wiggle;
                        translateY = -Math.abs(Math.sin(Date.now() / 80)) * 6;
                    }

                    // Reset opacity and filters first
                    av.style.opacity = '1.0';
                    av.style.filter = 'none';

                    // Apply visual styling based on status
                    if (r.shieldTicks > 0) {
                        av.style.filter = 'drop-shadow(0 0 10px #00d2ff) brightness(1.2)';
                    }
                    if (r.statusText.includes('유체 이탈') || r.statusText.includes('유령') || r.statusText.includes('분열')) {
                        av.style.opacity = '0.45';
                        av.style.filter = 'drop-shadow(0 0 12px #d800ff) brightness(1.3)';
                    }
                    if (r.statusText.includes('최면')) {
                        scale = -scale; // Flip horizontally
                        av.style.filter = 'drop-shadow(0 0 12px #ff007c) hue-rotate(180deg)';
                    }
                    if (r.statusText.includes('빙결') || r.statusText.includes('꽁꽁')) {
                        av.style.filter = 'drop-shadow(0 0 12px #00e5ff) brightness(1.1) saturate(1.5)';
                        rotation = 0;
                        translateY = 0;
                    }

                    av.style.transform = `rotate(${rotation}deg) scale(${scale}) translateY(${translateY}px)`;
                }


                if (bubble) {
                    if (r.statusText) {
                        bubble.innerHTML = parseEmojisToImages(r.statusText, '1.2rem');
                        bubble.classList.add('visible');
                    } else {
                        bubble.classList.remove('visible');
                    }
                }

                if (r.pos >= 100) {
                    finished = true;
                    winnerId = r.id;
                }
            });

            // BGM 종료 시점 도달 시 1위 강제 골인 보정 (완벽 동기화 보장)
            const currentTime = this.raceBgm ? this.raceBgm.currentTime : 0;
            const duration = this.raceBgm ? this.raceBgm.duration : 42;
            if (this.raceBgm && (this.raceBgm.ended || (currentTime >= duration - 0.2 && duration > 5))) {
                const leader = [...this.racers].sort((a, b) => b.pos - a.pos)[0];
                if (leader && leader.pos < 100) {
                    leader.pos = 100;
                    finished = true;
                    winnerId = leader.id;
                }
            }

            if (finished) {
                clearInterval(interval);
                this.endRace(track, winnerId, resolve);
            }
        }, 60); // 60ms tick rate
    }

    spawnBoostParticle(boostIndex) {
        const lane = document.getElementById(`racer-lane-${boostIndex}`);
        if (!lane) return;
        const wrapper = lane.querySelector('.game-racer-wrapper');
        if (!wrapper) return;
        
        const particle = document.createElement('div');
        particle.className = 'game-racing-particle';
        particle.textContent = '⚡';
        
        // Position it around the racer
        particle.style.left = `${wrapper.offsetLeft + 40 + Math.random() * 40}px`;
        particle.style.top = `${wrapper.offsetTop + Math.random() * 20}px`;
        
        lane.appendChild(particle);
        setTimeout(() => {
            particle.remove();
        }, 800);
    }

    triggerItemEvent(r, updateCommentary) {
        const itemRoll = Math.random();
        if (itemRoll < 0.10) {
            // 🚀 Guided missile
            const leader = [...this.racers].sort((a, b) => b.pos - a.pos)[0];
            if (leader && leader.id !== r.id) {
                if (leader.shieldTicks > 0) {
                    leader.statusText = '🛡️ 방어 성공!';
                    leader.statusTimer = 15;
                    this.playRaceSound('shield');
                    updateCommentary(`🎤 [중계진] 앗! ${r.name}의 유도 미사일이 날아갔지만 ${leader.name}가 실드로 막아냅니다!`);
                } else {
                    leader.stunTicks = 25;
                    leader.rotate = 180;
                    leader.pos = Math.max(0, leader.pos - 6);
                    leader.statusText = '🚀 미사일 피격!';
                    leader.statusTimer = 25;
                    this.playRaceSound('missile');
                    updateCommentary(`🎤 [중계진] 조준 격파! ${r.name} 선수가 선두 ${leader.name} 선수에게 유도 미사일을 명중시킵니다!!`);
                }
            } else {
                r.shieldTicks = 50;
                r.statusText = '🛡️ 실드 획득!';
                r.statusTimer = 20;
                this.playRaceSound('shield');
                updateCommentary(`🎤 [중계진] 1위를 달리는 ${r.name} 선수, 후방 저격을 막을 무적 실드를 가동합니다!`);
            }
        } else if (itemRoll < 0.20) {
            // 🧲 Magnet
            const leader = [...this.racers].sort((a, b) => b.pos - a.pos)[0];
            if (leader && leader.id !== r.id) {
                const stealAmount = 6;
                leader.pos = Math.max(0, leader.pos - stealAmount);
                r.pos += stealAmount;
                r.statusText = '🧲 속도 흡수!';
                r.statusTimer = 15;
                this.playRaceSound('overdrive');
                updateCommentary(`🎤 [중계진] 자석 발동! ${r.name} 선수가 선두 ${leader.name}의 에너지를 뺏어 질주합니다!`);
            } else {
                r.boost += 8.0;
                r.statusText = '🥕 당근 충전!';
                r.statusTimer = 15;
                this.playRaceSound('carrot');
                updateCommentary(`🎤 [중계진] 선두인 ${r.name} 선수, 자석 대신 고영양 당근을 섭취해 질주합니다!`);
            }
        } else if (itemRoll < 0.30) {
            // 🥕 Ginseng Booster
            r.boost += 16.0;
            r.statusText = '🥕 산삼 버프!';
            r.statusTimer = 20;
            this.playRaceSound('ginseng');
            updateCommentary(`🎤 [중계진] 대박! ${r.name} 선수, 특산품 산삼을 먹고 눈이 뒤집혀 질주합니다!`);
        } else if (itemRoll < 0.40) {
            // 🛡️ Shield
            r.shieldTicks = 60;
            r.statusText = '🛡️ 무적 실드!';
            r.statusTimer = 20;
            this.playRaceSound('shield');
            updateCommentary(`🎤 [중계진] 방어 모드! ${r.name} 선수가 다가오는 온갖 위험에 면역인 실드를 가동합니다!`);
        } else if (itemRoll < 0.50) {
            // 🍌 Banana trap to behind
            const sorted = [...this.racers].sort((a, b) => b.pos - a.pos);
            const myIndex = sorted.findIndex(o => o.id === r.id);
            const behind = sorted[myIndex + 1];
            if (behind) {
                if (behind.shieldTicks > 0) {
                    behind.statusText = '🛡️ 방어 성공!';
                    behind.statusTimer = 15;
                    this.playRaceSound('shield');
                    updateCommentary(`🎤 [중계진] ${r.name} 선수가 바나나 껍질을 던졌으나 ${behind.name}가 가뿐히 피합니다!`);
                } else {
                    behind.stunTicks = 20;
                    behind.rotate = 360;
                    behind.statusText = '🍌 바나나 밟음!';
                    behind.statusTimer = 20;
                    this.playRaceSound('banana_trap');
                    updateCommentary(`🎤 [중계진] 함정 카드! ${r.name} 선수가 던진 바나나를 뒤따르던 ${behind.name}가 밟았습니다!`);
                }
            } else {
                r.boost += 6.0;
                r.statusText = '🔥 가속 점화!';
                r.statusTimer = 15;
                this.playRaceSound('overdrive');
                updateCommentary(`🎤 [중계진] 후방에 선수가 없는 ${r.name} 선수, 미련 없이 단독 스퍼트를 개시합니다!`);
            }
        } else if (itemRoll < 0.60) {
            // ❄️ Ice Beam (Freezes a random opponent)
            const target = this.racers.find(o => o.id !== r.id && o.stunTicks === 0);
            if (target) {
                target.stunTicks = 30;
                target.statusText = '❄️ 꽁꽁 빙결!';
                target.statusTimer = 30;
                this.playRaceSound('freeze');
                updateCommentary(`🎤 [중계진] 아이스 빔! ${r.name} 선수가 냉동 광선을 쏘아 ${target.name} 선수를 얼려버립니다!`);
            } else {
                r.boost += 7.0;
                r.statusText = '🔥 얼음 돌파!';
                r.statusTimer = 15;
                this.playRaceSound('overdrive');
                updateCommentary(`🎤 [중계진] 빙결 대상을 찾지 못한 ${r.name} 선수, 자체 한기를 뿜으며 빠르게 미끄러집니다!`);
            }
        } else if (itemRoll < 0.70) {
            // 😈 Devil's Deal
            r.stunTicks = 8;
            r.boost += 35.0;
            r.statusText = '😈 악마의 스퍼트!';
            r.statusTimer = 30;
            this.playRaceSound('devil');
            updateCommentary(`🎤 [중계진] 영혼의 딜! ${r.name} 선수가 악마의 계약으로 순간 경직된 뒤 무시무시하게 가속합니다!`);
        } else if (itemRoll < 0.80) {
            // 👻 Ghost Walk
            r.shieldTicks = 95;
            r.scale = 0.9;
            r.statusText = '👻 유체 이탈!';
            r.statusTimer = 30;
            this.playRaceSound('ghost');
            updateCommentary(`🎤 [중계진] 영체화! ${r.name} 선수가 유령 상태가 되어 모든 간섭과 장애물을 무시합니다!`);
        } else if (itemRoll < 0.90) {
            // ⏳ Time Warp
            this.racers.forEach(o => {
                if (o.id !== r.id) {
                    o.pos = Math.max(0, o.pos - 4);
                    o.statusText = '⏳ 시간 감속!';
                    o.statusTimer = 15;
                }
            });
            r.statusText = '⏳ 시간 왜곡!';
            r.statusTimer = 20;
            this.playRaceSound('timewarp');
            updateCommentary(`🎤 [중계진] 시간 지연! ${r.name} 선수가 시공간을 비틀어 경쟁자들의 시계를 늦춰버립니다!`);
        } else {
            // 🌟 Golden Carrot
            r.boost += 22.0;
            r.scale = 1.5;
            r.statusText = '🌟 황금 당근!';
            r.statusTimer = 25;
            this.playRaceSound('ginseng');
            updateCommentary(`🎤 [중계진] 잭팟! ${r.name} 선수, 반짝이는 황금 당근을 먹고 거대화되어 돌진합니다!`);
        }
    }

    endRace(track, winnerId, resolve) {
        this.phase = 'ended';
        this.isActive = false;
        this.director.activeGame = null;

        if (this.raceBgm) {
            const bgm = this.raceBgm;
            const startVolume = bgm.volume;
            const steps = 20;
            const stepTime = 100; // 100ms
            const volStep = startVolume / steps;

            const fadeOutAndStop = () => {
                let currentStep = 0;
                const fadeInterval = setInterval(() => {
                    currentStep++;
                    if (bgm && bgm.volume > volStep) {
                        bgm.volume = Math.max(0, bgm.volume - volStep);
                    } else {
                        clearInterval(fadeInterval);
                        try {
                            bgm.pause();
                            bgm.volume = 0;
                            bgm.muted = true;
                            bgm.src = '';
                            bgm.load();
                        } catch (e) {}
                    }
                }, stepTime);
            };

            if (this.raceBgmPlayPromise) {
                this.raceBgmPlayPromise.then(fadeOutAndStop).catch(fadeOutAndStop);
            } else {
                fadeOutAndStop();
            }
            this.raceBgm = null;
            this.raceBgmPlayPromise = null;
        }

        const winner = this.racers[winnerId];

        // Find winning betters
        const winners = [];
        Object.keys(this.bets).forEach(nickname => {
            if (this.bets[nickname].index === winnerId) {
                winners.push(nickname);
            }
        });

        // Play sound
        this.playRaceSound('win');

        track.innerHTML = parseEmojisToImages(`
            <div class="game-title" style="font-size:4.0rem; text-align:center; color:#00ffa3;">🏆 레이스 종료! 🏆</div>
            <div style="font-size:3.5rem; text-align:center; margin: 30px 0; color:#fff; font-weight:bold;">
                우승: ${winner.emoji} <span style="color:#ffb703;">${winner.name}</span> !
            </div>
            <div style="font-size:2.0rem; text-align:center; color:#fff; max-height: 280px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 20px; border-radius:20px; border:1px solid rgba(255,255,255,0.1);">
                ${winners.length > 0 
                    ? `<span style="color:#00ffa3; font-weight:bold; font-size:2.2rem;">🎉 우승을 맞춘 시청자 (${winners.length}명):</span><br><div style="margin-top:15px; color:#ffb703;">${winners.join(', ')}</div>`
                    : '맞춘 시청자가 없습니다.'}
            </div>
            <div style="font-size:1.6rem; text-align:center; color:#888; margin-top:25px;">참여해주신 모든 분들 감사합니다!</div>
        `, '5.0rem');


        setTimeout(() => {
            track.style.animation = "game-fade-out 0.5s ease-in forwards";
            setTimeout(() => {
                track.remove();
                resolve();
            }, 500);
        }, 7000);
    }
}
