class GameHelpEffect extends BaseEffect {
    constructor(director) {
        super(director);
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
                        <span class="game-help-cmd">${HuntCommandCatalog.helpLabel()}</span>
                    </div>
                    <div class="game-help-desc">
                        집회소에서 <strong>!참여</strong>를 입력하면 4명을 선발합니다. 선발자는 출발 전 <strong>!대검 지원가</strong>처럼 무기와 성향을 몇 번이든 변경할 수 있으며 퍽은 무작위로 고정됩니다. 전투 중에는 <strong>!공격/!안전/!지원</strong>, <strong>!회피/!가드</strong>, 공동 지원 <strong>!회복/!섬광/!함정/!낙석</strong>을 사용합니다. (시작: 스트리머 전용)
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
            this.timers.timeout(() => {
                const card = container.querySelector('.game-help-card');
                if (card) {
                    card.style.animation = "game-fade-out 0.5s ease-in forwards";
                }
                this.timers.timeout(() => {
                    container.remove();
                    resolve();
                }, 500);
            }, 8000); // Display for 8 seconds
        });
    }
}
