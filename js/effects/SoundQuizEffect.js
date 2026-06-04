class SoundQuizEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.isActive = false;
        this.correctAnswer = null;
        this.winner = null;
        this.scores = {};
        this.forceStopped = false;
        this._injectStyles();
    }

    _injectStyles() {
        if (document.getElementById('game-common-styles')) return;
        const style = document.createElement('style');
        style.id = 'game-common-styles';
        style.innerHTML = `
            .game-title {
                font-size: 2.2rem;
                font-weight: 900;
                background: linear-gradient(90deg, #00ffa3, #00d2ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 8px;
                text-shadow: 0 0 10px rgba(0, 255, 163, 0.2);
            }
            .game-subtitle {
                font-size: 1.2rem;
                color: #ccc;
                margin-bottom: 20px;
            }
            .game-status {
                font-size: 1.4rem;
                color: #00d2ff;
                margin: 15px 0;
            }
            .game-quiz-hint {
                font-size: 1.5rem;
                color: #ffb703;
                font-weight: bold;
                letter-spacing: 2px;
                margin: 10px 0;
            }
            .game-timer {
                font-size: 1.4rem;
                color: #ff3b30;
                font-weight: bold;
                margin-top: 15px;
                animation: game-pulse 1s infinite alternate;
            }
            @keyframes game-pulse {
                0% { transform: scale(1.0); text-shadow: 0 0 5px rgba(255, 59, 48, 0.5); }
                100% { transform: scale(1.05); text-shadow: 0 0 15px rgba(255, 59, 48, 0.8); }
            }
            .game-participants-count {
                font-size: 1rem;
                color: #888;
                margin-top: 10px;
            }
            .game-winner-announce {
                font-size: 1.8rem;
                color: #fff;
                font-weight: bold;
                animation: game-scale-winner 0.5s ease-out forwards;
            }
            @keyframes game-scale-winner {
                0% { transform: scale(0.5); }
                100% { transform: scale(1.1); }
            }
            /* Quiz-specific 1.5x scaling overrides */
            .game-quiz-card .game-title {
                font-size: 4.5rem !important;
                margin-bottom: 15px;
                text-shadow: 0 0 20px rgba(0, 255, 163, 0.3);
            }
            .game-quiz-card .game-subtitle {
                font-size: 2.4rem !important;
                margin-bottom: 40px;
            }
            .game-quiz-card .game-status {
                font-size: 2.8rem !important;
                margin: 30px 0;
            }
            .game-quiz-card .game-quiz-hint {
                font-size: 3.2rem !important;
                letter-spacing: 4px;
                margin: 20px 0;
            }
            .game-quiz-card .game-timer {
                font-size: 2.8rem !important;
                margin-top: 30px;
            }
            .game-quiz-card .game-participants-count {
                font-size: 2.0rem !important;
                margin-top: 20px;
            }
            .game-quiz-card .game-winner-announce {
                font-size: 3.8rem !important;
            }
            .game-quiz-leaderboard {
                background: rgba(255, 255, 255, 0.08);
                border: 2px solid rgba(0, 255, 163, 0.3);
                border-radius: 15px;
                padding: 12px 24px;
                font-size: 2.0rem;
                color: #ffb703;
                font-weight: bold;
                margin-bottom: 35px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
                z-index: 10;
                backdrop-filter: blur(5px);
            }
            .game-quiz-leaderboard .leaderboard-item {
                background: rgba(0, 255, 163, 0.1);
                border-radius: 8px;
                padding: 4px 12px;
                color: #fff;
                font-size: 1.8rem;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border: 1px solid rgba(0, 255, 163, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    _getLeaderboardHTML() {
        const sorted = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) {
            return `<div class="game-quiz-leaderboard">🏆 실시간 순위: 대기 중...</div>`;
        }
        const items = sorted.slice(0, 3).map(([name, score], idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
            return `<span class="leaderboard-item">${medal} ${name}(${score}회)</span>`;
        });
        return `<div class="game-quiz-leaderboard">🏆 실시간 순위: ${items.join(' ')}</div>`;
    }

    getChoseong(word) {
        const choseongList = [
            'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
            'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        return word.split('').map(char => {
            const code = char.charCodeAt(0);
            if (code >= 44032 && code <= 55203) {
                const choseongIndex = Math.floor((code - 44032) / 588);
                return choseongList[choseongIndex] || char;
            }
            return char;
        }).join('');
    }

    _normalize(str) {
        if (!str) return "";
        return str.normalize('NFC')
                  .replace(/[^a-zA-Z0-9가-힣]/g, '')
                  .toLowerCase();
    }

    async execute(context) {
        this.director.activeGame = this;
        this.isActive = true;
        this.quizSilence = true; // 퀴즈 중 다른 채팅 사운드 차단 플래그
        this.winner = null;
        this.scores = {};
        this.forceStopped = false;


        // Parse rounds from streamer message, e.g. "!퀴즈 3"
        const msg = (context.message || "").trim();
        const parts = msg.split(/\s+/);
        let totalRounds = 1;
        if (parts.length > 1) {
            const parsed = parseInt(parts[1], 10);
            if (!isNaN(parsed) && parsed > 0) {
                totalRounds = parsed; // Remove the 20 rounds limit
            }
        }
        // Select eligible sounds
        const soundConf = this.config.getSoundConfig();
        const visualConf = this.config.getVisualConfig() || {};
        
        // Build a list of visual effect sound keys and audio override keys to exclude from quiz
        const visualSoundKeys = new Set();
        Object.values(visualConf).forEach(val => {
            if (val && val.soundKey) visualSoundKeys.add(val.soundKey.normalize('NFC').replace(/\s+/g, '').toLowerCase());
            if (val && val.audioOverride) visualSoundKeys.add(val.audioOverride.normalize('NFC').replace(/\s+/g, '').toLowerCase());
        });

        const keys = Object.keys(soundConf || {});
        const eligibleKeys = keys.filter(k => {
            const norm = this._normalize(k);
            if (norm.length < 2) return false;
            if (k.includes('풀버전') || k.includes('송') || k.includes('댄스')) return false;
            
            // Exclude keys associated with visual effects
            const cleanKey = k.normalize('NFC').replace(/\s+/g, '').toLowerCase();
            if (visualSoundKeys.has(cleanKey)) return false;

            return true;
        });

        // Keep track of asked questions in this session
        const askedKeys = [];

        // Create overlay container
        const container = document.createElement('div');
        container.className = 'game-overlay-container';
        document.body.appendChild(container);

        return new Promise(async (resolve) => {
            for (let currentRound = 1; currentRound <= totalRounds; currentRound++) {
                if (this.forceStopped) break;

                // Pick random keyword that hasn't been asked in this session
                let candidates = eligibleKeys.filter(k => !askedKeys.includes(k));
                if (candidates.length === 0) {
                    askedKeys.length = 0; // Reset history if all candidates have been asked
                    candidates = eligibleKeys;
                }
                
                this.correctAnswer = candidates.length > 0 
                    ? candidates[Math.floor(Math.random() * candidates.length)]
                    : "야호";
                askedKeys.push(this.correctAnswer);
                this.winner = null;

                console.log(`🎮 [SoundQuiz] Round ${currentRound}/${totalRounds} Started. Word: ${this.correctAnswer}`);

                container.innerHTML = `
                    <div class="game-quiz-card">
                        ${this._getLeaderboardHTML()}
                        <div class="game-title">🎵 사운드 퀴즈! (${currentRound} / ${totalRounds})</div>
                        <div class="game-subtitle">재생되는 효과음의 키워드를 맞추세요!</div>
                        <div class="game-status">🎧 소리 재생 중...</div>
                        <div class="game-quiz-hint">힌트 글자수: ${this.correctAnswer.length}글자</div>
                        <div class="game-timer">남은 시간: 30초</div>
                        <div class="game-participants-count">정답을 아시는 분은 채팅을 쳐주세요! (2번 반복 재생)</div>
                    </div>
                `;

                const soundObj = soundConf[this.correctAnswer];
                let playActive = true;

                // Play loop
                const playQuizSound = async () => {
                    if (!this.isActive || !playActive || this.forceStopped) return;
                    await this.audioManager.playSound(soundObj || this.correctAnswer, { force: true, type: 'visual' });
                    
                    if (!this.isActive || !playActive || this.forceStopped) return;
                    await new Promise(r => setTimeout(r, 2000));
                    
                    if (!this.isActive || !playActive || this.forceStopped) return;
                    this.audioManager.playSound(soundObj || this.correctAnswer, { force: true, type: 'visual' });
                };
                
                playQuizSound();

                // Timer
                let timeLeft = 30;
                const timerEl = container.querySelector('.game-timer');

                const roundWinner = await new Promise(resolveRound => {
                    const timerInterval = setInterval(() => {
                        timeLeft--;
                        if (timeLeft <= 0) {
                            clearInterval(timerInterval);
                            playActive = false;
                            resolveRound(null);
                        } else {
                            timerEl.textContent = `남은 시간: ${timeLeft}초`;
                            // Show consonant hint if 20 seconds have elapsed (10 seconds or less remaining)
                            if (timeLeft <= 10) {
                                const hintEl = container.querySelector('.game-quiz-hint');
                                if (hintEl) {
                                    const choseong = this.getChoseong(this.correctAnswer);
                                    hintEl.innerHTML = `💡 자음 힌트: <span style="color:#ffb703; font-size:2.4rem; letter-spacing:4px;">${choseong}</span> (${this.correctAnswer.length}글자)`;
                                }
                            }
                        }
                    }, 1000);

                    this.resolveGame = (winnerNickname) => {
                        clearInterval(timerInterval);
                        playActive = false;
                        resolveRound(winnerNickname);
                    };
                });

                if (roundWinner === '__FORCE_STOP__') {
                    this.forceStopped = true;
                    break;
                }

                // Show round result
                const card = container.querySelector('.game-quiz-card');
                let cleanupFireworks = () => {};

                if (roundWinner) {
                    this.scores[roundWinner] = (this.scores[roundWinner] || 0) + 1;
                    const fanfareKey = this.config.getSoundConfig()['풍악을울려라'] ? '풍악을울려라' : '따라란';
                    this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[fanfareKey] || fanfareKey);
                    
                    card.innerHTML = `
                        ${this._getLeaderboardHTML()}
                        <div class="game-title">🎉 정답자 발생! (${currentRound} / ${totalRounds})</div>
                        <div class="game-winner-announce" style="margin: 30px 0; color: #00ffa3;">
                            🏆 ${roundWinner}님 정답!
                        </div>
                        <div class="game-status" style="color: #fff;">정답: <span style="color:#ffb703; font-size:2.7rem; font-weight:bold;">${this.correctAnswer}</span></div>
                        <div class="game-participants-count">
                            ${currentRound < totalRounds ? '5초 후 다음 라운드가 시작됩니다...' : '모든 퀴즈가 종료되었습니다!'}
                        </div>
                    `;
                    cleanupFireworks = this.triggerFireworks(container);
                } else {
                    this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['안돼'] || '안돼');
                    card.innerHTML = `
                        ${this._getLeaderboardHTML()}
                        <div class="game-title" style="color: #ff3b30;">⏰ 시간 초과! (${currentRound} / ${totalRounds})</div>
                        <div class="game-status" style="margin: 30px 0;">아무도 맞추지 못했습니다...</div>
                        <div class="game-status" style="color: #fff;">정답은 <span style="color:#ffb703; font-size:2.7rem; font-weight:bold;">${this.correctAnswer}</span> 이었습니다!</div>
                        <div class="game-participants-count">
                            ${currentRound < totalRounds ? '5초 후 다음 라운드가 시작됩니다...' : '모든 퀴즈가 종료되었습니다!'}
                        </div>
                    `;
                }

                // Wait 5 seconds before next round
                await new Promise(r => setTimeout(r, 5000));
                cleanupFireworks();
            }

            this.isActive = false;
            this.quizSilence = false; // 퀴즈 종료 — 채팅 사운드 복원
            this.director.activeGame = null;


            if (this.forceStopped) {
                container.remove();
                resolve();
                return;
            }

            // Final score summary
            const sortedScores = Object.entries(this.scores).sort((a, b) => b[1] - a[1]);
            const card = container.querySelector('.game-quiz-card');
            
            this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['대박'] || '대박');
            
            card.innerHTML = `
                <div class="game-title" style="font-size:4.0rem; color:#00ffa3;">🏆 최종 퀴즈 결과! 🏆</div>
                <div style="font-size:2.4rem; text-align:center; margin: 30px 0; color:#fff; max-height:300px; overflow-y:auto;">
                    ${sortedScores.length > 0
                        ? sortedScores.map(([name, score], idx) => `
                            <div style="margin:12px 0; font-size:${idx === 0 ? '3.0rem' : '2.4rem'}; font-weight:${idx === 0 ? 'bold' : 'normal'};">
                                ${idx === 0 ? '🥇 ' : idx === 1 ? '🥈 ' : idx === 2 ? '🥉 ' : '👤 '} 
                                ${name}: <span style="color:#00ffa3;">${score}회 정답</span>
                            </div>
                        `).join('')
                        : '정답자가 한 명도 없었습니다 🥲'}
                </div>
                <div class="game-participants-count" style="font-size:1.8rem; margin-top: 30px;">참여해주신 모든 분들 감사합니다!</div>
            `;

            setTimeout(() => {
                card.style.animation = "game-fade-out 0.5s ease-in forwards";
                setTimeout(() => {
                    container.remove();
                    resolve();
                }, 500);
            }, 6000);
        });
    }

    handleChat(msgData) {
        if (!this.isActive) return false;
        const msg = (msgData.message || "").trim();
        
        // Allow streamer to stop the quiz using "!퀴즈 중단" or "!중단"
        if (msgData.isStreamer && (msg === '!퀴즈 중단' || msg === '!중단')) {
            this.forceStopped = true;
            if (this.resolveGame) this.resolveGame('__FORCE_STOP__');
            return true;
        }

        if (this._normalize(msg) === this._normalize(this.correctAnswer)) {
            this.winner = msgData.nickname;
            if (this.resolveGame) this.resolveGame(msgData.nickname);
            return true;
        }
        return false;
    }

    triggerFireworks(container) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '2147483639';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const colors = ['#ff0055', '#00ffcc', '#ffcc00', '#ff00ff', '#00ff00', '#ffff00', '#00ffff'];

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 9;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.alpha = 1;
                this.decay = 0.012 + Math.random() * 0.015;
                this.gravity = 0.06;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.vx *= 0.98;
                this.vy *= 0.98;
                this.alpha -= this.decay;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3 + Math.random() * 3, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 12;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        const createFirework = (x, y) => {
            const color = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < 70; i++) {
                particles.push(new Particle(x, y, color));
            }
        };

        // Initial bursts
        createFirework(canvas.width * 0.25, canvas.height * 0.35);
        createFirework(canvas.width * 0.75, canvas.height * 0.35);
        createFirework(canvas.width * 0.5, canvas.height * 0.25);

        // Periodically generate more fireworks
        const intervalId = setInterval(() => {
            createFirework(
                canvas.width * 0.15 + Math.random() * (canvas.width * 0.7),
                canvas.height * 0.15 + Math.random() * (canvas.height * 0.4)
            );
        }, 500);

        let animId;
        const tick = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                } else {
                    p.draw();
                }
            }
            animId = requestAnimationFrame(tick);
        };
        tick();

        return () => {
            clearInterval(intervalId);
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resizeCanvas);
            canvas.remove();
        };
    }
}
