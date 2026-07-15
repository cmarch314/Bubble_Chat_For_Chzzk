function parseEmojisToImages(text, size = '1.35rem') {
    if (!text) return '';
    let result = text;
    const sortedEmojis = Object.keys(window.RACING_EMOJI_CODE_MAP).sort((a, b) => b.length - a.length);
    for (const emoji of sortedEmojis) {
        if (result.includes(emoji)) {
            const code = window.RACING_EMOJI_CODE_MAP[emoji];
            const imgTag = `<img class="emoji" alt="${emoji}" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${code}.svg" style="width:${size}; height:${size}; vertical-align:middle; display:inline-block;" />`;
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
        this.runtime = new GameEffectRuntime(this, director);
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
        this.runtime.start();
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
            this.bettingBgm = this.director.audioManager.createNativeAudio('BGM/SportBGM.mp3', {
                type: 'visual', baseVolume: 0.39
            });
            this.bettingBgmPlayPromise = this.bettingBgm.play().catch(e => console.warn("Betting BGM playback blocked:", e));
        } catch (e) {
            console.warn("Failed to initialize Betting BGM:", e);
        }

        const ALL_RACERS = window.RACING_ALL_RACERS;

        this.racers = RacingRules.createRacers(ALL_RACERS);

        // Create Betting UI Card (Center of screen)
        const container = document.createElement('div');
        container.className = 'game-overlay-container';
        container.innerHTML = `
            <div class="game-racing-card">
                <div class="game-title"><img class="emoji" alt="🏇" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f3c7.svg" style="width:3.3rem; height:3.3rem; vertical-align:middle; display:inline-block;" /> 채팅 경마 게임!</div>
                <div class="game-subtitle">응원할 선수를 채팅창에 입력하여 배팅하세요!</div>
                
                <div class="game-racing-options-grid">
                    ${this.racers.map(r => `
                    <div class="game-racing-option-card" id="opt-${r.id}">
                        <div class="race-bet-emoji" style="display:flex; align-items:center; justify-content:center; height:7rem;">
                            <img class="emoji" alt="${r.emoji}" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${r.code}.svg" style="width:7rem; height:7rem; display:block; transform: scaleX(-1);" />
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
            this.resolveGame = this.runtime.once(resolve);
            this.bettingTimer = this.runtime.interval(() => {
                timeLeft--;
                if (timeLeft <= 0) {
                    this.runtime.clear(this.bettingTimer);
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
                    this.startRace(this.resolveGame);
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
            const index = RacingRules.resolveRacerIndex(msg, this.racers);

            if (index !== -1) {
                this.bets[msgData.nickname] = { index, color: msgData.color || '#ffffff' };
                if (this.updateBettingUI) this.updateBettingUI();
                return true;
            }
        } else if (this.phase === 'racing') {
            const boostIndex = RacingRules.resolveRacerIndex(msg, this.racers);

            if (boostIndex !== -1) {
                this.racers[boostIndex].boost += 1.5; // add boost
                this.spawnBoostParticle(boostIndex);
                return true;
            }
        }
        return false;
    }

    forceStopGame() {
        if (!this.runtime.end()) return;
        this.phase = 'ended';
        if (this.bettingTimer) {
            this.runtime.clear(this.bettingTimer);
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
        return RacingRunner.start(this, resolve);
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
        this.runtime.timeout(() => {
            particle.remove();
        }, 800);
    }

    triggerItemEvent(r, updateCommentary) {
        const itemRoll = Math.random();
        if (itemRoll < 0.10) {
            // 🚀 Guided missile
            const leader = RacingRules.leader(this.racers);
            if (leader && leader.id !== r.id && (!leader.eventCooldownTicks || leader.eventCooldownTicks === 0)) {
                leader.eventCooldownTicks = 50;
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
            const leader = RacingRules.leader(this.racers);
            if (leader && leader.id !== r.id && (!leader.eventCooldownTicks || leader.eventCooldownTicks === 0)) {
                const stealAmount = 2;
                leader.pos = Math.max(0, leader.pos - stealAmount);
                leader.eventCooldownTicks = 50;
                r.pos += stealAmount;
                r.statusText = '🧲 속도 흡수!';
                r.statusTimer = 15;
                this.playRaceSound('overdrive');
                updateCommentary(`🎤 [중계진] 자석 발동! ${r.name} 선수가 선두 ${leader.name}의 에너지를 뺏어 질주합니다!`);
            } else {
                r.boost += 2.6;
                r.statusText = '🥕 당근 충전!';
                r.statusTimer = 15;
                this.playRaceSound('carrot');
                updateCommentary(`🎤 [중계진] 선두인 ${r.name} 선수, 자석 대신 고영양 당근을 섭취해 질주합니다!`);
            }
        } else if (itemRoll < 0.30) {
            // 🥕 Ginseng Booster
            r.boost += 5.3;
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
            const sorted = RacingRules.standings(this.racers);
            const myIndex = sorted.findIndex(o => o.id === r.id);
            const behind = sorted[myIndex + 1];
            if (behind && (!behind.eventCooldownTicks || behind.eventCooldownTicks === 0)) {
                behind.eventCooldownTicks = 50;
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
                r.boost += 2.0;
                r.statusText = '🔥 가속 점화!';
                r.statusTimer = 15;
                this.playRaceSound('overdrive');
                updateCommentary(`🎤 [중계진] 후방에 선수가 없는 ${r.name} 선수, 미련 없이 단독 스퍼트를 개시합니다!`);
            }
        } else if (itemRoll < 0.60) {
            // ❄️ Ice Beam (Freezes a random opponent)
            const target = this.racers.find(o => o.id !== r.id && o.stunTicks === 0 && (!o.eventCooldownTicks || o.eventCooldownTicks === 0));
            if (target) {
                target.stunTicks = 30;
                target.statusText = '❄️ 꽁꽁 빙결!';
                target.statusTimer = 30;
                target.eventCooldownTicks = 50;
                this.playRaceSound('freeze');
                updateCommentary(`🎤 [중계진] 아이스 빔! ${r.name} 선수가 냉동 광선을 쏘아 ${target.name} 선수를 얼려버립니다!`);
            } else {
                r.boost += 2.3;
                r.statusText = '🔥 얼음 돌파!';
                r.statusTimer = 15;
                this.playRaceSound('overdrive');
                updateCommentary(`🎤 [중계진] 빙결 대상을 찾지 못한 ${r.name} 선수, 자체 한기를 뿜으며 빠르게 미끄러집니다!`);
            }
        } else if (itemRoll < 0.70) {
            // 😈 Devil's Deal
            r.stunTicks = 8;
            r.boost += 11.6;
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
                if (o.id !== r.id && (!o.eventCooldownTicks || o.eventCooldownTicks === 0)) {
                    o.pos = Math.max(0, o.pos - 4);
                    o.statusText = '⏳ 시간 감속!';
                    o.statusTimer = 15;
                    o.eventCooldownTicks = 50;
                }
            });
            r.statusText = '⏳ 시간 왜곡!';
            r.statusTimer = 20;
            this.playRaceSound('timewarp');
            updateCommentary(`🎤 [중계진] 시간 지연! ${r.name} 선수가 시공간을 비틀어 경쟁자들의 시계를 늦춰버립니다!`);
        } else {
            // 🌟 Golden Carrot
            r.boost += 7.3;
            r.scale = 1.5;
            r.statusText = '🌟 황금 당근!';
            r.statusTimer = 25;
            this.playRaceSound('ginseng');
            updateCommentary(`🎤 [중계진] 잭팟! ${r.name} 선수, 반짝이는 황금 당근을 먹고 거대화되어 돌진합니다!`);
        }
    }
    endRace(track, winnerId, resolve) {
        this.phase = 'ended';
        if (!this.runtime.end()) return;
        this.resolveGame = null;

        if (this.raceBgm) {
            const bgm = this.raceBgm;
            const startVolume = bgm.volume;
            const steps = 20;
            const stepTime = 100; // 100ms
            const volStep = startVolume / steps;

            const fadeOutAndStop = () => {
                let currentStep = 0;
                const fadeInterval = this.runtime.interval(() => {
                    currentStep++;
                    if (bgm && bgm.volume > volStep) {
                        bgm.volume = Math.max(0, bgm.volume - volStep);
                    } else {
                        this.runtime.clear(fadeInterval);
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

        // Play sound (already played at the finish line)

        track.innerHTML = parseEmojisToImages(`
            <div class="game-title" style="font-size:4.0rem; text-align:center; color:#00ffa3;">🏆 레이스 종료! 🏆</div>
            <div style="font-size:3.5rem; text-align:center; margin: 30px 0; color:#fff; font-weight:bold;">
                우승: ${winner.emoji} <span style="color:#ffb703;">${winner.name}</span> !
            </div>
            <div style="font-size:2.0rem; text-align:center; color:#fff; max-height: 280px; overflow-y: auto; background: rgba(0,0,0,0.4); padding: 20px; border-radius:20px; border:1px solid rgba(255,255,255,0.1);">
                ${winners.length > 0 
                    ? `<span style="color:#00ffa3; font-weight:bold; font-size:2.2rem;">🎉 우승을 맞춘 시청자 (${winners.length}명):</span><br><div style="margin-top:15px; color:#ffb703;">${winners.map(name => SafeContent.escapeHTML(name)).join(', ')}</div>`
                    : '맞춘 시청자가 없습니다.'}
            </div>
            <div style="font-size:1.6rem; text-align:center; color:#888; margin-top:25px;">참여해주신 모든 분들 감사합니다!</div>
        `, '5.0rem');


        this.runtime.timeout(() => {
            track.style.animation = "game-fade-out 0.5s ease-in forwards";
            this.runtime.timeout(() => {
                track.remove();
                resolve();
            }, 500);
        }, 7000);
    }
}
