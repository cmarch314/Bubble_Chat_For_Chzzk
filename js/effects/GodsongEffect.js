class GodsongEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const overlay = document.getElementById('god-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().godsong) ? this.config.getVisualConfig().godsong : {
            duration: 15000,
            audioPath: './SFX/갓겜합시다FULL.mp3',
            volume: 0.7,
            images: [
                { src: './img/GodGame1.png', width: '30%', top: '30%', slide: 'left', transform: 'scaleX(-1)' }
            ]
        };

        // Clear previous content
        overlay.innerHTML = '';

        return new Promise(resolve => {
            // Setup Background Video
            if (conf.videoPath) {
                const video = document.createElement('video');
                video.src = conf.videoPath;
                video.className = 'god-video-bg';
                video.autoplay = true;
                video.loop = true;
                video.muted = true; // Video is muted, soundKey plays main audio
                video.volume = 0;
                video.style.display = 'block';
                video.style.zIndex = '-1';
                if (typeof conf.videoOpacity !== 'undefined') {
                    video.style.opacity = conf.videoOpacity;
                }

                video.play().catch(e => console.warn("God video play failed:", e));
                overlay.appendChild(video);
            }

            // Setup Images (Wrapper Approach)
            if (conf.images && Array.isArray(conf.images)) {
                conf.images.forEach((imgConf, index) => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'god-image-wrapper';
                    wrapper.style.width = imgConf.width || '30%';

                    if (imgConf.top) wrapper.style.top = imgConf.top;
                    if (imgConf.bottom) wrapper.style.bottom = imgConf.bottom;

                    const img = document.createElement('img');
                    img.src = imgConf.src;
                    img.style.width = '100%';
                    img.style.display = 'block';
                    if (imgConf.transform) img.style.transform = imgConf.transform;

                    wrapper.appendChild(img);

                    wrapper.style.animationDuration = `${conf.duration / 1000}s`;
                    wrapper.style.animationTimingFunction = 'ease-out';
                    wrapper.style.animationFillMode = 'both';

                    if (imgConf.slide === 'left') {
                        wrapper.style.left = imgConf.left || '0';
                        wrapper.style.animationName = 'god-slide-in-left';
                    } else if (imgConf.slide === 'right') {
                        wrapper.style.right = imgConf.right || '0';
                        wrapper.style.animationName = 'god-slide-in-right';
                    } else {
                        wrapper.style.left = '50%';
                        wrapper.style.transform = 'translate(-50%, -50%)';
                        wrapper.style.animationName = 'hvn-god-appear';
                    }

                    if (imgConf.delay) {
                        wrapper.style.animationDelay = `${imgConf.delay}ms`;
                    }

                    if (imgConf.exitTime) {
                        setTimeout(() => {
                            wrapper.style.animationTimingFunction = "ease-in";
                            wrapper.style.animationDuration = "1.5s";
                            wrapper.style.animationDelay = "0s";
                            wrapper.style.animationFillMode = "forwards";

                            if (imgConf.slide === 'left') {
                                wrapper.style.animationName = "god-slide-out-left";
                            } else if (imgConf.slide === 'right') {
                                wrapper.style.animationName = "god-slide-out-right";
                            } else {
                                wrapper.style.transition = "opacity 0.5s ease-out";
                                wrapper.style.opacity = "0";
                            }

                            setTimeout(() => {
                                if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
                            }, 1500);
                        }, imgConf.exitTime);
                    }

                    overlay.appendChild(wrapper);
                });
            }

            overlay.classList.add('visible');

            setTimeout(() => {
                overlay.classList.remove('visible');
                resolve();
            }, conf.duration);
        });
    }
}
