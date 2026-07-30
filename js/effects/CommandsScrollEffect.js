class CommandsScrollEffect extends BaseEffect {
    constructor(director) {
        super(director);
        this.isActive = false;
        this.resolveFn = null;
        this.container = null;
        this.rollTimeout = null;
        this.fadeTimeout = null;
        this.previousActiveGame = null;
    }

    async execute(context) {
        this.isActive = true;
        this.previousActiveGame = this.director.activeGame;
        this.director.activeGame = this;

        // 1. Gather keys
        const soundConf = this.config.getSoundConfig() || {};
        const soundKeys = Object.keys(soundConf).sort();

        const videoKeys = Object.keys(window.HIVE_CMC_COMMAND_GROUPS || {}).sort();

        // 2. Create container
        const container = document.createElement('div');
        this.container = container;
        container.className = 'commands-scroll-overlay';
        
        container.innerHTML = `
            <div class="commands-scroll-wrapper">
                <div class="commands-scroll-title">🎬 BUBBLECHAT COMMAND LIST 🎬</div>
                <div class="commands-scroll-subtitle">스트리머 전용 명령어 및 반응형 사운드/비디오 목록</div>
                
                <div class="commands-sections-wrapper">
                    <div class="commands-section">
                        <div class="commands-section-title">🎬 VIDEO COMMANDS (${videoKeys.length})</div>
                        <div class="commands-grid">
                            ${videoKeys.map(k => `<div class="command-item">#${k}</div>`).join('')}
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
        if (!this.isActive) return;
        const wrapperHeight = wrapper.offsetHeight;
        
        // Let's scroll at a speed of around 60 pixels per second
        const durationSec = Math.max(25, Math.ceil((wrapperHeight + window.innerHeight) / 60));
        wrapper.style.animation = `commands-credits-roll ${durationSec}s linear forwards`;

        // Fade in
        requestAnimationFrame(() => {
            if (this.isActive) container.classList.add('visible');
        });

        // Promise resolves when the animation finishes
        return new Promise(resolve => {
            this.resolveFn = resolve;
            
            this.rollTimeout = this.timers.timeout(() => {
                if (!this.isActive) return;
                container.classList.remove('visible');
                this.fadeTimeout = this.timers.timeout(() => {
                    this.cleanup();
                }, 500);
            }, durationSec * 1000);
        });
    }

    cleanup() {
        this.isActive = false;
        if (this.director.activeGame === this) {
            this.director.activeGame = this.previousActiveGame;
        }
        this.previousActiveGame = null;
        if (this.rollTimeout) this.timers.clear(this.rollTimeout);
        if (this.fadeTimeout) this.timers.clear(this.fadeTimeout);
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        if (this.resolveFn) {
            const resolve = this.resolveFn;
            this.resolveFn = null;
            resolve();
        }
    }

    stopEffect() {
        if (!this.isActive) return;
        
        if (this.container) {
            this.container.classList.remove('visible');
        }
        
        if (this.rollTimeout) this.timers.clear(this.rollTimeout);
        if (this.fadeTimeout) this.timers.clear(this.fadeTimeout);
        
        this.fadeTimeout = this.timers.timeout(() => {
            this.cleanup();
        }, 500);
    }

    handleChat(msgData) {
        if (!this.isActive) return false;
        const msg = (msgData.message || "").trim();
        if (msgData.isStreamer && (msg === '!중단' || msg === '!커맨드 중단')) {
            this.stopEffect();
            return true;
        }
        return false;
    }
}
