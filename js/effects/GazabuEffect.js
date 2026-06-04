class GazabuEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().gazabu) ? this.config.getVisualConfig().gazabu : {
            duration: 8000,
            backgroundPath: './Video/가자부.mp4'
        };

        const overlay = document.getElementById('gazabu-overlay');
        if (!overlay) return Promise.resolve();

        const bg = overlay.querySelector('.gazabu-bg');
        if (bg) {
            bg.src = conf.backgroundPath;
            bg.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
            bg.muted = false;
            bg.volume = 1.0; // Let Web Audio gain staging manage volume

            // Route through Web Audio Context!
            this.audioManager.connectMediaElement(bg, 'visual');
            bg.play().catch(e => console.warn("Gazabu video play failed:", e));
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
