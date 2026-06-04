class UshoEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const overlay = document.getElementById('usho-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().usho) ? this.config.getVisualConfig().usho : {
            scanPhase: 7270,
            duration: 19000,
            gifPath: './img/usho.gif',
            videoPath: './img/usho.mp4',
            backgroundVideoPath: './Video/ushoBack.mp4'
        };

        const img = overlay.querySelector('.usho-gif-scan');
        if (img && conf.gifPath && !img.src.includes(conf.gifPath)) img.src = conf.gifPath;

        // [New] Background Video Logic (Replaces Side GIFs)
        let bgVideo = overlay.querySelector('.usho-background-video');
        if (!bgVideo && conf.backgroundVideoPath) {
            bgVideo = document.createElement('video');
            bgVideo.className = 'usho-background-video';
            bgVideo.muted = false; // Set to false to route audio
            bgVideo.loop = true;
            bgVideo.playsInline = true;

            // Append to background layer
            const bgLayer = overlay.querySelector('.usho-background-layer');
            if (bgLayer) {
                bgLayer.innerHTML = ''; // Clear existing GIFs if any
                bgLayer.appendChild(bgVideo);
            }
        }

        if (bgVideo) {
            if (conf.backgroundVideoPath && !bgVideo.src.includes(conf.backgroundVideoPath)) {
                bgVideo.src = conf.backgroundVideoPath;
            }
            bgVideo.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
            bgVideo.currentTime = 0;
            bgVideo.pause();
        }

        const video = overlay.querySelector('.usho-video-reveal');
        if (video) {
            if (conf.videoPath && !video.src.includes(conf.videoPath)) video.src = conf.videoPath;
            video.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
            video.currentTime = 0; // Reset video
            video.pause();
        }

        return new Promise(resolve => {
            overlay.classList.remove('phase-scan', 'phase-reveal', 'visible');
            void overlay.offsetWidth;

            overlay.classList.add('visible', 'phase-scan');

            // Route audio & Start background video immediately
            if (bgVideo) {
                this.audioManager.connectMediaElement(bgVideo, 'visual');
                bgVideo.play().catch(e => console.warn("Background video play failed:", e));
            }

            setTimeout(() => {
                overlay.classList.replace('phase-scan', 'phase-reveal');
                if (video) {
                    this.audioManager.connectMediaElement(video, 'visual');
                    video.play().catch(e => console.warn("Video play failed:", e));
                    video.currentTime = 0;
                }
            }, conf.scanPhase);

            setTimeout(() => {
                overlay.classList.remove('visible', 'phase-reveal', 'phase-scan');
                if (video) video.pause();
                if (bgVideo) bgVideo.pause();
                resolve();
            }, conf.duration);
        });
    }
}
