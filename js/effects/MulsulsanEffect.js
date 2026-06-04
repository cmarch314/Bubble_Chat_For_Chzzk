class MulsulsanEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().mulsulsan) ? this.config.getVisualConfig().mulsulsan : {
            duration: 10000,
            backgroundPath: './Video/물설산씨티.mp4'
        };

        const overlay = document.getElementById('mulsulsan-overlay');
        if (!overlay) return Promise.resolve();

        const bg = overlay.querySelector('.mulsulsan-bg');
        if (bg) {
            bg.src = conf.backgroundPath;
            bg.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
            bg.muted = false;
            bg.volume = 1.0; // Let Web Audio gain staging manage volume

            // Route through Web Audio Context!
            this.audioManager.connectMediaElement(bg, 'visual');
            bg.play().catch(e => console.warn("Mulsulsan video play failed:", e));
        }

        return new Promise(resolve => {
            overlay.classList.add('visible');
            setTimeout(() => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (bg) {
                        bg.pause();
                        bg.currentTime = 0;
                        bg.src = "";
                    }
                    resolve();
                }, 600);
            }, conf.duration);
        });
    }
}
