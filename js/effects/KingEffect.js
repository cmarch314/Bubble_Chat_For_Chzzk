class KingEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const overlay = document.getElementById('king-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().king) ? this.config.getVisualConfig().king : {
            duration: 23000,
            imagePath: './img/King_Of_MH.png',
            audioPath: './SFX/Chzzk_Signatures/아들아.mp3',
            volume: 0.7,
            emojiPool: ["❄️", "🧊", "⭐"],
            delayedEmojiPool: ["💩", "🧻", "🤮"],
            delayedEmojiDelay: 11000
        };

        const image = overlay.querySelector('.king-image');
        const snowContainer = overlay.querySelector('.king-snow-container');

        return new Promise(resolve => {
            if (image) image.src = conf.imagePath;
            if (snowContainer) snowContainer.innerHTML = '';

            overlay.querySelectorAll('.king-snowflake').forEach(el => el.remove());

            const getEmoji = (pool) => {
                if (!pool || pool.length === 0) return '❄️';
                return pool[Math.floor(Math.random() * pool.length)];
            };

            const createFlake = (pool, isDelayed = false) => {
                const flake = document.createElement('div');
                flake.className = 'king-snowflake';
                flake.style.left = (Math.random() * 100) + 'vw';
                flake.style.animationDuration = (Math.random() * 2 + 3) + 's';
                flake.style.animationDelay = (Math.random() * -5) + 's';

                if (conf.emojiSize) {
                    flake.style.fontSize = conf.emojiSize;
                } else {
                    flake.style.fontSize = (Math.random() * 40 + 60) + 'px';
                }

                flake.innerHTML = getEmoji(pool);

                if (isDelayed) {
                    flake.style.opacity = '0';
                    flake.style.transition = 'opacity 2s ease-in';

                    if (snowContainer) snowContainer.appendChild(flake);
                    else overlay.appendChild(flake);

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            flake.style.opacity = '1';
                        });
                    });
                } else {
                    flake.style.opacity = '1';

                    if (snowContainer) snowContainer.appendChild(flake);
                    else overlay.appendChild(flake);
                }
            };

            const initialCount = conf.emojiCount || 150;
            for (let i = 0; i < initialCount; i++) {
                createFlake(conf.emojiPool, false);
            }

            setTimeout(() => {
                if (overlay.classList.contains('visible')) {
                    const delayedCount = conf.delayedEmojiCount || 100;
                    for (let i = 0; i < delayedCount; i++) {
                        createFlake(conf.delayedEmojiPool, true);
                    }
                }
            }, conf.delayedEmojiDelay || 11000);

            overlay.classList.add('visible');

            // Play visual sound via EventBus
            this.eventBus.emit('audio:playVisualSound', conf.audioPath);

            setTimeout(() => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (snowContainer) snowContainer.innerHTML = '';
                }, 1000);
                resolve();
            }, conf.duration);
        });
    }
}
