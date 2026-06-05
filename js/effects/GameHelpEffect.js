class GameHelpEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this._injectStyles();
    }

    _injectStyles() {
        if (document.getElementById('game-help-styles')) return;
        const style = document.createElement('style');
        style.id = 'game-help-styles';
        style.innerHTML = `
            .game-help-title {
                font-size: 3.2rem;
                font-weight: 900;
                background: linear-gradient(90deg, #00ffa3, #00d2ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 30px;
                text-shadow: 0 0 15px rgba(0, 255, 163, 0.25);
                text-align: center;
            }
            .game-help-item {
                margin-bottom: 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.15);
                padding-bottom: 20px;
            }
            .game-help-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .game-help-name {
                font-size: 2.2rem;
                font-weight: bold;
                color: #00d2ff;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .game-help-cmd {
                background: rgba(0, 255, 163, 0.15);
                border: 1.5px solid rgba(0, 255, 163, 0.4);
                color: #00ffa3;
                padding: 4px 12px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 1.6rem;
                margin-left: auto;
            }
            .game-help-desc {
                font-size: 1.55rem;
                color: #ccc;
                line-height: 1.6;
                padding-left: 36px;
            }
            .game-help-footer {
                text-align: center;
                font-size: 1.3rem;
                color: #888;
                margin-top: 35px;
            }
        `;
        document.head.appendChild(style);
    }

    async execute(context) {
        // Create help overlay container
        const container = document.createElement('div');
        container.className = 'game-help-overlay-container';
        
        container.innerHTML = `
            <div class="game-help-card">
                <div class="game-help-title">🎮 플레이 가능한 채팅 게임 목록</div>
                
                <div class="game-help-item">
                    <div class="game-help-name">
                        <span>🎵 사운드 퀴즈</span>
                        <span class="game-help-cmd">!퀴즈 [라운드]</span>
                    </div>
                    <div class="game-help-desc">
                        재생되는 효과음의 키워드를 맞추는 퀴즈입니다. 20초간 아무도 못 맞추면 <strong>자음(초성) 힌트</strong>가 주어집니다. (시작: 스트리머 전용, 중단: !중단)
                    </div>
                </div>

                <div class="game-help-item">
                    <div class="game-help-name">
                        <span>🏇 채팅 경마 레이스</span>
                        <span class="game-help-cmd">!경마</span>
                    </div>
                    <div class="game-help-desc">
                        15초 동안 원하는 번호/선수이름을 쳐서 배팅하고, 경기 도중 응원 번호나 이모지(🐢, 🐰, 🏇, 🚀)를 치면 해당 선수에게 <strong>번개 부스트(⚡)</strong>가 적용됩니다. (시작: 스트리머 전용)
                    </div>
                </div>

                <div class="game-help-item">
                    <div class="game-help-name">
                        <span>⚔️ 채팅 보스 레이드</span>
                        <span class="game-help-cmd">!레이드</span>
                    </div>
                    <div class="game-help-desc">
                        거대 보스를 물리치는 협동 레이드입니다. 채팅창에 <strong>1/!공격</strong>(칼 ⚔️), <strong>2/!마법</strong>(파이어볼 🔥), <strong>3/!힐</strong>(빛 ✨)을 치면 보스를 타격합니다. (시작: 스트리머 전용)
                    </div>
                </div>

                <div class="game-help-item">
                    <div class="game-help-name">
                        <span>🦖 몬스터 수렵 배틀</span>
                        <span class="game-help-cmd">!토벌</span>
                    </div>
                    <div class="game-help-desc">
                        무작위 4개의 무기가 몬스터와 대결합니다. 투표 시간 동안 생존할 무기 번호(1~4)를 쳐서 투표하고, 전투 종료 시 최후의 1인 무기가 10초간의 최후 결전을 버텨내면 수렵에 성공하여 투표한 시청자가 승리합니다. (시작: 스트리머 전용)
                    </div>
                </div>

                <div class="game-help-footer">
                    정답 및 기동 명령어는 대소문자나 띄어쓰기를 구분하지 않습니다!
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Play helper sound if available
        const dingKey = this.config.getSoundConfig()['따라란'] ? '따라란' : '두둥탁';
        this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[dingKey] || dingKey);

        return new Promise(resolve => {
            setTimeout(() => {
                const card = container.querySelector('.game-help-card');
                if (card) {
                    card.style.animation = "game-fade-out 0.5s ease-in forwards";
                }
                setTimeout(() => {
                    container.remove();
                    resolve();
                }, 500);
            }, 8000); // Display for 8 seconds
        });
    }
}
