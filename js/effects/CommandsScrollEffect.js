class CommandsScrollEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this._injectStyles();
    }

    _injectStyles() {
        if (document.getElementById('commands-scroll-styles')) return;
        const style = document.createElement('style');
        style.id = 'commands-scroll-styles';
        style.innerHTML = `
            .commands-scroll-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(10, 5, 20, 0.95);
                backdrop-filter: blur(10px);
                z-index: 2147483640;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                overflow: hidden;
                font-family: 'CookieRun-Regular', sans-serif;
                color: #fff;
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            .commands-scroll-overlay.visible {
                opacity: 1;
            }
            .commands-scroll-wrapper {
                position: absolute;
                width: 85%;
                max-width: 1200px;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding-top: 50px;
                padding-bottom: 150px;
            }
            @keyframes commands-credits-roll {
                0% { transform: translateY(100vh); }
                100% { transform: translateY(-105%); }
            }
            .commands-scroll-title {
                font-size: 4.2rem;
                font-weight: 900;
                text-align: center;
                color: #00ffa3;
                text-shadow: 0 0 25px rgba(0, 255, 163, 0.6);
                margin-bottom: 12px;
                letter-spacing: 2px;
            }
            .commands-scroll-subtitle {
                font-size: 2.0rem;
                text-align: center;
                color: #aaa;
                margin-bottom: 60px;
            }
            .commands-sections-wrapper {
                display: flex;
                flex-direction: column;
                gap: 60px;
                width: 100%;
            }
            .commands-section {
                flex: 1;
                background: rgba(255, 255, 255, 0.03);
                border: 3px solid rgba(0, 255, 163, 0.2);
                border-radius: 24px;
                padding: 40px;
                box-shadow: inset 0 0 20px rgba(0, 255, 163, 0.05);
            }
            .commands-section-title {
                font-size: 2.5rem;
                font-weight: bold;
                color: #00d2ff;
                border-bottom: 2px solid rgba(0, 210, 255, 0.3);
                padding-bottom: 18px;
                margin-bottom: 30px;
                text-align: center;
                text-shadow: 0 0 10px rgba(0, 210, 255, 0.4);
            }
            .commands-grid {
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                gap: 15px;
            }
            .command-item {
                font-size: 1.5rem;
                font-weight: bold;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 10px 16px;
                text-align: center;
                color: #eee;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                border: 1.5px solid rgba(255, 255, 255, 0.05);
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }
        `;
        document.head.appendChild(style);
    }

    async execute(context) {
        // 1. Gather keys
        const soundConf = this.config.getSoundConfig() || {};
        const soundKeys = Object.keys(soundConf).sort();

        const CMC_FILES = window.HIVE_CMC_FILES || [];
        const videoKeys = [...CMC_FILES].sort();

        // 2. Create container
        const container = document.createElement('div');
        container.className = 'commands-scroll-overlay';
        
        container.innerHTML = `
            <div class="commands-scroll-wrapper">
                <div class="commands-scroll-title">🎬 BUBBLECHAT COMMAND LIST 🎬</div>
                <div class="commands-scroll-subtitle">스트리머 전용 명령어 및 반응형 사운드/비디오 목록</div>
                
                <div class="commands-sections-wrapper">
                    <div class="commands-section">
                        <div class="commands-section-title">🎬 VIDEO COMMANDS (${videoKeys.length})</div>
                        <div class="commands-grid">
                            ${videoKeys.map(k => `<div class="command-item">@${k}</div>`).join('')}
                        </div>
                    </div>

                    <div class="commands-section">
                        <div class="commands-section-title">🎵 SOUND COMMANDS (${soundKeys.length})</div>
                        <div class="commands-grid">
                            ${soundKeys.map(k => `<div class="command-item">${k}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Play sound if available
        const dingKey = this.config.getSoundConfig()['대박'] ? '대박' : '따라란';
        this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[dingKey] || dingKey);

        // Adjust animation duration dynamically based on the height of content
        const wrapper = container.querySelector('.commands-scroll-wrapper');
        
        // Wait for next frame to measure height
        await new Promise(r => requestAnimationFrame(r));
        const wrapperHeight = wrapper.offsetHeight;
        
        // Let's scroll at a speed of around 60 pixels per second
        const durationSec = Math.max(25, Math.ceil((wrapperHeight + window.innerHeight) / 60));
        wrapper.style.animation = `commands-credits-roll ${durationSec}s linear forwards`;

        // Fade in
        requestAnimationFrame(() => {
            container.classList.add('visible');
        });

        // Promise resolves when the animation finishes
        return new Promise(resolve => {
            setTimeout(() => {
                container.classList.remove('visible');
                setTimeout(() => {
                    container.remove();
                    resolve();
                }, 500);
            }, durationSec * 1000);
        });
    }
}
