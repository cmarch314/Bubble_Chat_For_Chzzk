class RandomDanceEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const overlay = document.getElementById('random-dance-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().random_dance) ? this.config.getVisualConfig().random_dance : {
            duration: 18000,
            videoWidth: '22rem',
            videoHeight: '39rem',
            cycleInterval: 6000,
            bloomOpacity: 0.5,
            videoBrightness: 1.1,
            vignetteOpacity: 0.6,
            sepiaIntensity: 0.15,
            filmContrast: 1.25,
            opacity: 0.9,
            positions: { left: { x: '15%', y: '50%' }, right: { x: '85%', y: '50%' } },
            videoPool: []
        };

        // Apply cinematic visual variables
        overlay.style.setProperty('--rd-bloom-op', conf.bloomOpacity || 0.5);
        overlay.style.setProperty('--rd-vid-bright', conf.videoBrightness || 1.1);
        overlay.style.setProperty('--rd-vignette-op', conf.vignetteOpacity || 0.6);
        overlay.style.setProperty('--rd-sepia', conf.sepiaIntensity || 0.15);
        overlay.style.setProperty('--rd-contrast', conf.filmContrast || 1.25);

        const leftContainer = overlay.querySelector('.rd-left');
        const rightContainer = overlay.querySelector('.rd-right');

        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';

        [leftContainer, rightContainer].forEach((cont, idx) => {
            const side = idx === 0 ? 'left' : 'right';
            const pos = conf.positions[side];
            cont.style.width = conf.videoWidth || '22rem';
            cont.style.height = conf.videoHeight || '39rem';
            cont.style.left = pos.x;
            cont.style.top = pos.y;
            cont.style.opacity = '0';
            cont.style.transition = 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out';
        });

        const shuffle = (array) => array.sort(() => Math.random() - 0.5);
        const selectedVideos = shuffle([...conf.videoPool]).slice(0, 6);
        let currentIndex = 0;

        const spawnVideo = (container, videoName) => {
            container.innerHTML = '';
            const video = document.createElement('video');
            video.src = `./Video/RandomDance/${videoName}`;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.preload = 'auto';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = '20px';
            video.style.boxShadow = '0 0 20px rgba(255,105,180,0.5)';
            container.appendChild(video);
            video.load();
        };

        const cycleVideos = () => {
            leftContainer.style.opacity = '0';
            rightContainer.style.opacity = '0';

            setTimeout(() => {
                const vid1 = selectedVideos[currentIndex];
                const vid2 = selectedVideos[(currentIndex + 1) % selectedVideos.length];
                spawnVideo(leftContainer, vid1);
                spawnVideo(rightContainer, vid2);

                leftContainer.style.opacity = (conf.opacity || 0.9).toString();
                rightContainer.style.opacity = (conf.opacity || 0.9).toString();

                currentIndex = (currentIndex + 2) % selectedVideos.length;
            }, 300);
        };

        return new Promise(resolve => {
            overlay.classList.add('visible');
            overlay.classList.remove('rd-bloom');

            cycleVideos();
            const interval = setInterval(cycleVideos, conf.cycleInterval || 6000);

            const bloomTimeout = setTimeout(() => {
                overlay.classList.add('rd-bloom');
            }, 6000);

            setTimeout(() => {
                clearInterval(interval);
                clearTimeout(bloomTimeout);
                overlay.classList.remove('visible', 'rd-bloom');

                setTimeout(() => {
                    leftContainer.innerHTML = '';
                    rightContainer.innerHTML = '';
                    resolve();
                }, 400);
            }, conf.duration);
        });
    }
}
