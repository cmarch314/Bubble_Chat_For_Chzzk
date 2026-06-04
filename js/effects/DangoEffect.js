class DangoEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const overlay = document.getElementById('dango-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().dango) ? this.config.getVisualConfig().dango : {
            duration: 19000,
            videoPath: './Video/Dango.mp4',
            emojiPool: ["🍡", "🍺", "🌀"],
            emojiCount: 20,
            emojiSize: '6rem'
        };

        const video = overlay.querySelector('.dango-video');
        const container = overlay.querySelector('.dango-emoji-container');

        return new Promise(resolve => {
            if (container) container.innerHTML = '';

            overlay.classList.add('visible');
            if (video) {
                video.muted = false;
                video.volume = 1.0;
                if (conf.videoPath && !video.src.includes(conf.videoPath.replace(/^\.\//, ''))) {
                    video.src = conf.videoPath;
                }
                video.currentTime = 0;

                video.style.width = conf.videoWidth || '100vw';
                video.style.height = conf.videoHeight || '100vh';
                video.style.opacity = conf.videoOpacity !== undefined ? conf.videoOpacity : 1;

                // Route through Web Audio Context!
                this.audioManager.connectMediaElement(video, 'visual');
                video.play().catch(e => console.warn("Dango video play failed:", e));
            }

            // Spawn emojis
            if (container && conf.emojiPool) {
                const variants = ['hvn-dango-move-v1', 'hvn-dango-move-v2', 'hvn-dango-move-v3', 'hvn-dango-move-v4'];
                for (let i = 0; i < conf.emojiCount; i++) {
                    const span = document.createElement('span');
                    span.className = 'dango-emoji';
                    span.innerText = conf.emojiPool[Math.floor(Math.random() * conf.emojiPool.length)];

                    const variant = variants[Math.floor(Math.random() * variants.length)];
                    const startTop = 10 + Math.random() * 80;
                    const startLeft = 10 + Math.random() * 80;
                    const delay = Math.random() * -10;
                    const moveDuration = 10 + Math.random() * 10;
                    const spinDuration = 3 + Math.random() * 5;

                    span.style.top = `${startTop}%`;
                    span.style.left = `${startLeft}%`;
                    span.style.fontSize = (0.5 + Math.random() * 1.5) * parseFloat(conf.emojiSize) + 'rem';
                    span.style.animation = `${variant} ${moveDuration}s ease-in-out ${delay}s infinite alternate, hvn-dango-spin ${spinDuration}s linear infinite`;

                    container.appendChild(span);
                }
            }

            setTimeout(() => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (video) video.pause();
                    if (container) container.innerHTML = '';
                }, 1000);
                resolve();
            }, conf.duration);
        });
    }
}
