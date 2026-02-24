// ==========================================
// [Class 5] Visual Director (Effects Engine)
// ==========================================
class VisualDirector {
    constructor(config) {
        this.config = config;
        this.queue = [];
        this.isLocked = false;
        this.enabled = false; // [Default] OFF (Manual trigger keywords)
        this.alertsEnabled = true; // [Default] ON (Sub/Donation Alerts)
        this._initOverlays();
        this.registry = this._buildRegistry();
    }

    setEnabled(enabled) { this.enabled = enabled; }
    setAlertsEnabled(enabled) { this.alertsEnabled = enabled; } // [New] Setter
    clearQueue() {
        console.log("🧹 [VisualDirector] Clearing Queue...");
        this.queue = [];
        this.isLocked = false;
        // [Fix] Removed global overlay removal to allow active effects to finish naturally.
    }

    trigger(effectType, context = {}) {
        // [Refinement] enabled 체크는 호출부(network callback)에서 세밀하게 처리하므로 여기선 제외
        if (!this.registry[effectType]) return;
        console.log(`📥 [VisualDirector] Queuing: ${effectType}`);
        this.queue.push({ effect: this.registry[effectType], context });
        this._processQueue();
    }

    async _processQueue() {
        if (this.isLocked || this.queue.length === 0) return;

        this.isLocked = true;
        const { effect, context } = this.queue.shift();

        // 1. Sound (Using Audio Manager - Real-time enabled check)
        // [User Request] Visual effect sounds should play even if SFX is muted (!음소거)
        const isSoundActive = !!window.audioManager;
        if (isSoundActive && effect.soundKey && window.audioManager) {
            // [New] Support Audio Override (e.g. !가자부송 -> Play Full Version instead of short clips)
            // If audioOverride is present in config, use that key instead of soundKey for audio lookup
            const soundTargetKey = (window.VISUAL_CONFIG && window.VISUAL_CONFIG[effect.key] && window.VISUAL_CONFIG[effect.key].audioOverride)
                ? window.VISUAL_CONFIG[effect.key].audioOverride
                : effect.soundKey;

            const activeSoundKey = soundTargetKey;
            if (activeSoundKey) {
                // Pass force: true to bypass general mute (!음소거)
                window.audioManager.playSound(window.soundHive[activeSoundKey], { force: true, type: 'visual' });
            }
        }

        // 2. Visual
        try {
            await effect.execute(context);
        } catch (e) {
            console.error(`❌ Visual Effect Error (${effect.soundKey}):`, e);
        }

        // 3. Cooldown
        const cooldown = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.common && window.VISUAL_CONFIG.common.cooldown) || 1000;
        await new Promise(r => setTimeout(r, cooldown));

        this.isLocked = false;
        this._processQueue();
    }

    _initOverlays() {
        const create = (id, html) => {
            if (document.getElementById(id)) return;
            const div = document.createElement('div'); div.id = id;
            div.className = 'fullscreen-overlay'; // Apply utility class
            if (html) div.innerHTML = html;
            document.body.appendChild(div);
        };
        create('skull-overlay', '<div class="skull-wrapper"><div class="skull-emoji" data-text="☠️">☠️</div></div><div class="film-grain"></div>');
        create('usho-overlay', `
            <div class="usho-flash"></div>
            <div class="usho-container">
                <div class="usho-scan-wrapper">
                    <img class="usho-gif-scan" src="./img/usho.gif">
                </div>
                <div class="usho-reveal-wrapper">
                    <div class="usho-reveal-content-wrapper">
                        <video class="usho-video-reveal" src="./img/usho.mp4" muted playsinline></video>
                        <div class="usho-rainbow-overlay"></div>
                    </div>
                </div>
                <!-- [New] Multi-Layer Background (Moved outside reveal-wrapper for visibility) -->
                <div class="usho-background-layer">
                    <img class="usho-side-gif left" src="./img/usho4.gif">
                    <img class="usho-side-gif right" src="./img/usho2.gif">
                </div>
            </div>
        `);
        create('heart-overlay', '<div class="heart-emoji">❤️‍🩹</div>');
        create('flashback-overlay');
        create('bangjong-overlay', '<div class="bangjong-flame-border"></div><div class="bangjong-actors-container"></div>');
        create('dango-overlay', '<video class="dango-video" muted playsinline></video><div class="dango-emoji-container"></div>');
        create('king-overlay', '<img class="king-image" src="" alt="King"><div class="king-snow-container"></div>');
        create('god-overlay', '<img class="god-image" src="" alt="God">'); // [New] God Overlay
        create('gazabu-overlay', '<video class="gazabu-bg" src="" muted playsinline loop></video>'); // [Update] Video Background
        create('mulsulsan-overlay', '<video class="mulsulsan-bg" src="" playsinline loop></video>'); // [New] Mulsulsan Background (Unmuted for Audio)
        create('random-dance-overlay', '<div class="rd-container rd-left"></div><div class="rd-container rd-right"></div><div class="rd-bloom-layer"></div><div class="rd-vignette-layer"></div>');
    }

    _buildRegistry() {
        return {
            usho: { soundKey: "우쇼", execute: (ctx) => this._runUsho(ctx) },
            skull: { soundKey: "해골", execute: (ctx) => this._runSkull(ctx) },
            couple: { soundKey: "커플", execute: (ctx) => this._runCouple(ctx) },
            vergil: { soundKey: "버질", execute: (ctx) => this._runVergil(ctx) },
            dolphin: { soundKey: "돌핀", execute: (ctx) => this._runDolphin(ctx) },
            valstrax: { soundKey: "발파", execute: (ctx) => this.triggerValstrax(ctx.message) },
            bangjong: { soundKey: "방종송", execute: (ctx) => this._runBangjong(ctx) },
            dango: { soundKey: "당고", execute: (ctx) => this._runDango(ctx) },
            king: { soundKey: "몬창왕", execute: (ctx) => this._runKing(ctx) },
            godsong: { soundKey: "갓겜송", execute: (ctx) => this._runGod(ctx) },
            gazabu: { soundKey: "가자부송", execute: (ctx) => this._runGazabu(ctx) },
            mulsulsan: { soundKey: "물설산", execute: (ctx) => this._runMulsulsan(ctx) },
            random_dance: { soundKey: "랜덤댄스", execute: (ctx) => this._runRandomDance(ctx) }
        };
    }

    _runSkull(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.skull) ? window.VISUAL_CONFIG.skull : {
            duration: 8000,
            floatingTextDuration: 4000
        };
        return this._genericSkullLikeEffect('skull-overlay', '!해골', 'skull-style', 'skull-emoji', context, conf);
    }

    _runUsho(context) {
        const overlay = document.getElementById('usho-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.usho) ? window.VISUAL_CONFIG.usho : {
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
            bgVideo.muted = true;
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
            // Apply opacity
            bgVideo.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;

            bgVideo.currentTime = 0;
            bgVideo.pause();
        }

        const video = overlay.querySelector('.usho-video-reveal');
        if (video) {
            if (conf.videoPath && !video.src.includes(conf.videoPath)) video.src = conf.videoPath;
            // Apply opacity to reveal video too? Usually yes if it's part of the 'scene'.
            // But reveal might be intended to be full visibility?
            // User asked "Usho also opacity control". 
            // Let's apply to background video primarily, but maybe reveal video should also be controlled?
            // Given the context of "opacity control", it likely means the whole effect or the background.
            // Let's apply to both for consistency, or just background?
            // Usho effect has a background video and a center reveal video.
            // Let's apply to both.
            video.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;

            video.currentTime = 0; // Reset video
            video.pause();
        }

        return new Promise(resolve => {
            overlay.classList.remove('phase-scan', 'phase-reveal', 'visible');
            void overlay.offsetWidth;

            overlay.classList.add('visible', 'phase-scan');

            // Start background video immediately (if desired, or sync with phases)
            if (bgVideo) {
                bgVideo.play().catch(e => console.warn("Background video play failed:", e));
            }

            setTimeout(() => {
                overlay.classList.replace('phase-scan', 'phase-reveal');
                if (video) {
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

    _runDango(context) {
        const overlay = document.getElementById('dango-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.dango) ? window.VISUAL_CONFIG.dango : {
            duration: 19000,
            videoPath: './Video/Dango.mp4',
            emojiPool: ["🍡", "🍺", "🌀"],
            emojiCount: 20,
            emojiSize: '6rem'
        };

        const video = overlay.querySelector('.dango-video');
        const container = overlay.querySelector('.dango-emoji-container');

        return new Promise(resolve => {
            // Clear previous emojis
            if (container) container.innerHTML = '';

            overlay.classList.add('visible');
            if (video) {
                if (conf.videoPath && !video.src.includes(conf.videoPath)) video.src = conf.videoPath;
                video.currentTime = 0;
                video.muted = false; // Enable audio for this effect
                video.volume = 0.7; // Standard volume consistent with SFX

                // Apply configurable size and opacity
                video.style.width = conf.videoWidth || '100vw';
                video.style.height = conf.videoHeight || '100vh';
                video.style.opacity = conf.videoOpacity !== undefined ? conf.videoOpacity : 1;

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
                    const delay = Math.random() * -10; // Negative delay to start mid-animation
                    const moveDuration = 10 + Math.random() * 10; // Slower movement: 10s to 20s
                    const spinDuration = 3 + Math.random() * 5; // Also slower spinning

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
                }, 1000); // Wait for transition
                resolve();
            }, conf.duration);
        });
    }

    _runKing(context) {
        const overlay = document.getElementById('king-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.king) ? window.VISUAL_CONFIG.king : {
            duration: 23000,
            imagePath: './img/King_Of_MH.png',
            audioPath: './SFX/아들아.mp3',
            volume: 0.7,
            emojiPool: ["❄️", "🧊", "⭐"],
            delayedEmojiPool: ["💩", "🧻", "🤮"],
            delayedEmojiDelay: 11000
        };

        const image = overlay.querySelector('.king-image');
        const snowContainer = overlay.querySelector('.king-snow-container');

        // Audio setup
        let audio = new Audio(conf.audioPath);
        audio.volume = conf.volume || 0.7;

        return new Promise(resolve => {
            // Setup Image
            if (image) image.src = conf.imagePath;

            // Clear previous flakes and diagnostic tests
            if (snowContainer) snowContainer.innerHTML = '';

            // Safety: ensure any loose flakes on overlay are also cleared
            overlay.querySelectorAll('.king-snowflake').forEach(el => el.remove());

            const getEmoji = (pool) => {
                if (!pool || pool.length === 0) return '❄️';
                return pool[Math.floor(Math.random() * pool.length)];
            };

            const createFlake = (pool, isDelayed = false) => {
                const flake = document.createElement('div');
                flake.className = 'king-snowflake';
                flake.style.left = (Math.random() * 100) + 'vw';

                // Animation duration/delay handled here
                flake.style.animationDuration = (Math.random() * 2 + 3) + 's';
                flake.style.animationDelay = (Math.random() * -5) + 's';

                // Set size based on config or default random
                if (conf.emojiSize) {
                    flake.style.fontSize = conf.emojiSize;
                } else {
                    flake.style.fontSize = (Math.random() * 40 + 60) + 'px';
                }

                flake.innerHTML = getEmoji(pool);

                // If delayed, start with opacity 0 and fade in
                if (isDelayed) {
                    flake.style.opacity = '0';
                    flake.style.transition = 'opacity 2s ease-in';

                    if (snowContainer) snowContainer.appendChild(flake);
                    else overlay.appendChild(flake);

                    // Trigger fade-in
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

            // Initial Heavy Snowstorm
            const initialCount = conf.emojiCount || 150;
            for (let i = 0; i < initialCount; i++) {
                createFlake(conf.emojiPool, false);
            }

            // Delayed Storm using config delay
            setTimeout(() => {
                if (overlay.classList.contains('visible')) {
                    const delayedCount = conf.delayedEmojiCount || 100;
                    for (let i = 0; i < delayedCount; i++) {
                        createFlake(conf.delayedEmojiPool, true);
                    }
                }
            }, conf.delayedEmojiDelay || 11000);

            overlay.classList.add('visible');
            // [User Request] Use AudioManager to handle audio for !몬창왕 so it bypasses mute
            if (window.audioManager) {
                window.audioManager.playSound(conf.audioPath, { force: true, type: 'visual' });
            } else {
                audio.play().catch(e => console.warn("King audio play failed:", e));
            }

            setTimeout(() => {
                overlay.classList.remove('visible');
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                // No need to stop AudioManager sound manually here as it's fire-and-forget buffer usually,
                // but for 23s sound it might overlap. However, playSound currently doesn't return stop handle.

                setTimeout(() => {
                    if (snowContainer) snowContainer.innerHTML = '';
                }, 1000);
                resolve();
            }, conf.duration);
        });
    }

    // God Game Effect
    _runGod(context) {
        const overlay = document.getElementById('god-overlay');
        if (!overlay) return Promise.resolve();

        // [Fix] Load config explicitly
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.godsong) ? window.VISUAL_CONFIG.godsong : {
            duration: 15000,
            audioPath: './SFX/갓겜합시다FULL.mp3',
            volume: 0.7,
            images: [
                { src: './img/GodGame1.png', width: '30%', top: '30%', slide: 'left', transform: 'scaleX(-1)' }
            ]
        };

        // Clear previous content
        overlay.innerHTML = '';

        // Audio setup
        let audio = new Audio(conf.audioPath);
        audio.volume = conf.volume || 0.7;

        return new Promise(resolve => {
            // 0. Setup Background Video
            if (conf.videoPath) {
                const video = document.createElement('video');
                video.src = conf.videoPath;
                video.className = 'god-video-bg';
                video.autoplay = true;
                video.loop = true; // Loop if video is shorter than duration
                video.muted = true; // Use separate audio file as requested
                video.volume = 0;
                video.style.display = 'block'; // [Fix] Ensure it's not hidden
                video.style.zIndex = '-1'; // [Fix] Explicitly set z-index
                // [Feature] Video Opacity
                if (typeof conf.videoOpacity !== 'undefined') {
                    video.style.opacity = conf.videoOpacity;
                }

                // Muted/Play handling
                // [User Request] Use AudioManager if intended for audible audio in visual effects
                // But for background video it's usually muted as requested.
                video.play().catch(e => console.warn("God video play failed:", e));

                if (window.audioManager) {
                    window.audioManager.playSound(conf.audioPath, { force: true, type: 'visual' });
                } else if (audio) {
                    audio.play().catch(e => console.warn("God audio play failed:", e));
                }
                overlay.appendChild(video);
            }

            // Setup Images (Wrapper Approach)
            if (conf.images && Array.isArray(conf.images)) {
                console.log(`[GodEffect] Rendering ${conf.images.length} images.`);
                conf.images.forEach((imgConf, index) => {
                    // 1. Wrapper: Handles Position & Slide Animation
                    const wrapper = document.createElement('div');
                    wrapper.className = 'god-image-wrapper';
                    wrapper.style.width = imgConf.width || '30%';

                    // Position
                    if (imgConf.top) wrapper.style.top = imgConf.top;
                    if (imgConf.bottom) wrapper.style.bottom = imgConf.bottom;

                    // 2. Inner Image: Handles Content & Flip Transform
                    const img = document.createElement('img');
                    img.src = imgConf.src;
                    img.style.width = '100%';
                    img.style.display = 'block';
                    if (imgConf.transform) img.style.transform = imgConf.transform;

                    wrapper.appendChild(img);

                    // 3. Slide Animation on Wrapper (Common Props)
                    wrapper.style.animationDuration = `${conf.duration / 1000}s`;
                    wrapper.style.animationTimingFunction = 'ease-out';
                    wrapper.style.animationFillMode = 'both'; // Ensure initial state (opacity) is applied

                    // Apply Animation Name & Position
                    if (imgConf.slide === 'left') {
                        wrapper.style.left = imgConf.left || '0';
                        wrapper.style.animationName = 'god-slide-in-left';
                    } else if (imgConf.slide === 'right') {
                        wrapper.style.right = imgConf.right || '0';
                        wrapper.style.animationName = 'god-slide-in-right';
                    } else {
                        // Center/Default fallback
                        wrapper.style.left = '50%';
                        wrapper.style.transform = 'translate(-50%, -50%)';
                        wrapper.style.animationName = 'hvn-god-appear';
                    }

                    // [Feature] Configurable Delay
                    if (imgConf.delay) {
                        wrapper.style.animationDelay = `${imgConf.delay}ms`;
                    }

                    // [Feature] Configurable Exit Time (Absolute time from start)
                    if (imgConf.exitTime) {
                        setTimeout(() => {
                            // [Feature] Slide Out Animation
                            wrapper.style.animationTimingFunction = "ease-in";
                            wrapper.style.animationDuration = "1.5s"; // Slide out speed
                            wrapper.style.animationDelay = "0s"; // [Fix] Reset any entrance delay
                            wrapper.style.animationFillMode = "forwards";

                            if (imgConf.slide === 'left') {
                                wrapper.style.animationName = "god-slide-out-left";
                            } else if (imgConf.slide === 'right') {
                                wrapper.style.animationName = "god-slide-out-right";
                            } else {
                                // Fallback for center/other
                                wrapper.style.transition = "opacity 0.5s ease-out";
                                wrapper.style.opacity = "0";
                            }

                            // Remove after animation (Wait 1.5s for slide out)
                            setTimeout(() => {
                                if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
                            }, 1500);
                        }, imgConf.exitTime);
                    }

                    console.log(`[GodEffect] Image ${index}: slide=${imgConf.slide}, delay=${imgConf.delay}ms, exitTime=${imgConf.exitTime}ms`);
                    overlay.appendChild(wrapper);
                });
            }

            overlay.classList.add('visible');
            audio.play().catch(e => console.warn("God audio play failed:", e));

            // End effect
            setTimeout(() => {
                overlay.classList.remove('visible');
                audio.pause();
                audio.currentTime = 0;
                resolve();
            }, conf.duration);
        });
    }

    _runCouple(context) {
        const flashback = document.getElementById('flashback-overlay');
        const overlay = document.getElementById('heart-overlay');
        if (!flashback || !overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.couple) ? window.VISUAL_CONFIG.couple : {
            duration: 21000,
            fontSize: '13rem',
            flashbackDuration: 11800
        };

        let displayMsg = (context.message || "").trim();
        const triggerKw = "!커플";
        if (displayMsg.startsWith(triggerKw)) displayMsg = displayMsg.substring(triggerKw.length).trim();

        const wrappedMsg = this._wrapText(displayMsg, 200);
        const centerMsgSnippet = document.createElement('div');
        centerMsgSnippet.className = 'couple-premium-text';
        centerMsgSnippet.style.fontSize = conf.fontSize; // Apply config font size
        centerMsgSnippet.innerHTML = renderMessageWithEmotesHTML(wrappedMsg, context.emotes || {}, 2.0);
        centerMsgSnippet.style.animation = "hvn-couple-fadeIn 1s forwards";

        document.body.appendChild(centerMsgSnippet);

        return new Promise(resolve => {
            const fadeInTime = 1000;
            const messageTotalTime = conf.flashbackDuration;
            const emojiPhaseDuration = conf.duration - conf.flashbackDuration;

            flashback.classList.add('visible');

            // Fade out message shortly before flashback ends
            setTimeout(() => { centerMsgSnippet.style.animation = "hvn-couple-fadeOut 1s forwards"; }, messageTotalTime - 1500);

            setTimeout(() => {
                if (centerMsgSnippet) centerMsgSnippet.remove();
                flashback.classList.remove('visible');
                overlay.classList.add('visible');
                const emojiContainer = overlay.querySelector('.heart-emoji');

                const getRandomFromRanges = (ranges) => {
                    let total = 0;
                    ranges.forEach(r => total += (r[1] - r[0] + 1));
                    let randomIdx = Math.floor(Math.random() * total);
                    for (let r of ranges) {
                        let size = (r[1] - r[0] + 1);
                        if (randomIdx < size) return String.fromCodePoint(r[0] + randomIdx);
                        randomIdx -= size;
                    }
                    return String.fromCodePoint(ranges[0][0]);
                };

                const personRanges = conf.personEmojiRanges || [[0x1F600, 0x1F64F], [0x1F466, 0x1F480], [0x1F9DC, 0x1F9DF], [0x1F470, 0x1F478]];
                const heartRanges = conf.heartEmojiRanges || [[0x1F493, 0x1F49F], [0x2764, 0x2764], [0x1F9E1, 0x1F9E1], [0x1F90D, 0x1F90E], [0x1F48B, 0x1F48D]];

                const p1 = getRandomFromRanges(personRanges), p2 = getRandomFromRanges(personRanges), h3 = getRandomFromRanges(heartRanges);

                const updateState = (step) => {
                    const hue = Math.floor(Math.random() * 360);
                    // Use configurable opacity or default 0.3
                    const dim = (conf.bgOpacity !== undefined) ? conf.bgOpacity : 0.3;
                    overlay.style.backgroundColor = `hsla(${hue}, 100%, 70%, ${dim})`;
                    emojiContainer.classList.remove('grow-effect'); void emojiContainer.offsetWidth; emojiContainer.classList.add('grow-effect');

                    if (step === 3) {
                        emojiContainer.style.fontSize = conf.fontSize;
                    } else {
                        // Intermediate emojis are scaled by conf.intermediateScale
                        emojiContainer.style.fontSize = `calc(${conf.fontSize} * ${conf.intermediateScale || 1.5})`;
                    }

                    if (step === 0) emojiContainer.innerText = p1;
                    else if (step === 1) emojiContainer.innerText = p2;
                    else if (step === 2) emojiContainer.innerText = h3;
                    else if (step === 3) emojiContainer.innerText = `${p1}${h3}${p2}`;
                };

                const phaseStep = emojiPhaseDuration / 4;
                updateState(0);
                setTimeout(() => updateState(1), phaseStep);
                setTimeout(() => updateState(2), phaseStep * 2);
                setTimeout(() => updateState(3), phaseStep * 2.5);

                setTimeout(() => {
                    overlay.style.backgroundColor = ''; overlay.classList.remove('visible');
                    emojiContainer.innerText = '❤️‍🩹'; emojiContainer.style.fontSize = '';
                    resolve();
                }, emojiPhaseDuration);
            }, conf.flashbackDuration);
        });
    }


    _runVergil(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.vergil) ? window.VISUAL_CONFIG.vergil : {
            duration: 19000,
            slashCount: 30,
            shardCount: 20,
            textDelay: 10000
        };

        const id = 'void-overlay'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.className = 'fullscreen-overlay visible';
        ov.innerHTML = '<div id="void-backdrop"></div><div id="void-slashes"></div>'; document.body.appendChild(ov);
        const slashC = document.getElementById('void-slashes'), backdrop = document.getElementById('void-backdrop');
        backdrop.style.opacity = 1;

        const slashes = [];
        const stagger = conf.slashStagger || 0.02;
        for (let i = 0; i < conf.slashCount; i++) {
            const s = document.createElement('div'); s.className = 'void-slash';
            s.style.cssText = `position:absolute; top:${10 + Math.random() * 80}%; left:${10 + Math.random() * 80}%; height:${1 + Math.random() * 49}px; --rot:${Math.random() * 360}deg; z-index:${200 - i}; animation:hvn-vergil-slashEnter 0.2s forwards ${i * stagger}s;`;
            slashC.appendChild(s); slashes.push(s);
        }

        return new Promise(resolve => {
            setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, conf.duration);

            const slashTrembleTime = conf.slashTrembleTime || 5200;
            const explosionTime = conf.explosionTime || 6200;

            setTimeout(() => { slashes.forEach(s => s.style.animation = `hvn-vergil-slashTremble ${0.05 + Math.random() * 0.1}s infinite`); }, slashTrembleTime);

            setTimeout(() => {
                slashes.forEach(s => { s.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => s.remove(), 1000); });
                for (let i = 0; i < 12; i++) {
                    const row = Math.floor(i / 4), col = i % 4, w = window.innerWidth / 4, h = window.innerHeight / 3;
                    const cx = (col * w) + (w * 0.2) + (Math.random() * w * 0.6), cy = (row * h) + (h * 0.2) + (Math.random() * h * 0.6);
                    for (let j = 0; j < conf.shardCount; j++) {
                        const shard = document.createElement('div'); shard.className = 'void-shard';
                        const ang = Math.random() * 360;
                        const d = (conf.shardDistance || 400) * (0.8 + Math.random() * 0.4);
                        shard.style.cssText = `left:${cx + Math.random() * 40 - 20}px; top:${cy + Math.random() * 40 - 20}px; --tx:${Math.cos(ang * Math.PI / 180) * d}px; --ty:${Math.sin(ang * Math.PI / 180) * d}px; --rot:${Math.random() * 360}deg;`;
                        const dur = (conf.shardSpeedMin || 1.5) + Math.random() * ((conf.shardSpeedMax || 2.5) - (conf.shardSpeedMin || 1.5));
                        shard.style.animation = `hvn-vergil-shardFly ${dur}s ease-out forwards`;
                        ov.appendChild(shard); setTimeout(() => shard.remove(), dur * 1000);
                    }
                }
                backdrop.style.opacity = 0;

                setTimeout(() => {
                    let msg = context.message || "";
                    const kw = "!버질";
                    if (msg.startsWith(kw)) msg = msg.substring(kw.length).trim();
                    if (msg) {
                        const txt = document.createElement('div'); txt.className = 'vergil-text';
                        txt.innerHTML = renderMessageWithEmotesHTML(msg, context.emotes || {}); ov.appendChild(txt);
                        setTimeout(() => { txt.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => txt.remove(), 1000); }, 7000);
                    }
                }, conf.textDelay - explosionTime);
            }, explosionTime);
        });
    }

    _runDolphin(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.dolphin) ? window.VISUAL_CONFIG.dolphin : {
            duration: 21000,
            creatureCount: 30,
            extraCount: 40,
            dolphinDelay: 6000,
            fontSize: '2.5rem',
            creatureSize: '2.5rem',
            nametagColor: '#00ffa3'
        };

        const id = 'dolphin-overlay-root'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.className = 'fullscreen-overlay visible';
        ov.innerHTML = `<div id="dolphin-overlay" class="visible event-normal"><div class="dolphin-light dolphin-light-left"></div><div class="dolphin-light dolphin-light-right"></div><div class="dolphin-sea-bottom"><div class="sea-wave"></div></div></div>`;
        document.body.appendChild(ov);

        const overlayC = ov.querySelector('#dolphin-overlay');
        const surfingEmojis = conf.surfingEmojis || ["🏄", "🏄‍♂️", "🏄‍♀️"];

        this._spawnActor(overlayC, 'surfer-actor', surfingEmojis[Math.floor(Math.random() * surfingEmojis.length)], {
            duration: conf.duration,
            styles: {
                nametag: (context.nickname || "Anonymous"),
                nameColor: (context.color || conf.nametagColor), // Use config fallback
                left: '-20vw',
                animation: `hvn-dolphin-surfer ${conf.duration / 1000}s linear forwards`
            }
        });

        const dolphinLife = conf.duration - conf.dolphinDelay;
        setTimeout(() => {
            const dolphinEl = this._spawnActor(overlayC, 'lead-dolphin', "🐬", { duration: dolphinLife + 5000 });
            const animateWildBounce = (el, total) => {
                const start = Date.now(); let rot = 0;
                const speed = conf.bounceSpeed || 1.0;
                const bounce = () => {
                    const elapsed = Date.now() - start; if (elapsed >= total) return;
                    const x = 5 + Math.random() * 90, y = 5 + Math.random() * 90;
                    const d = (conf.dolphinRotation || 360) + Math.random() * 6040;
                    rot -= d;
                    el.style.transition = `top ${800 / speed}ms ease-in-out, left ${800 / speed}ms ease-in-out, transform ${1200 / speed}ms cubic-bezier(0.1, 0.5, 0.2, 1)`;
                    el.style.left = `${x}%`; el.style.top = `${y}%`; el.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${conf.dolphinScale || 1.5})`;
                    setTimeout(bounce, (900 + Math.random() * 300) / speed);
                };
                el.style.left = '50%'; el.style.top = '50%'; el.style.transform = 'translate(-50%, -50%) scale(0)';
                setTimeout(() => {
                    el.style.transition = `transform ${500 / speed}ms`;
                    el.style.transform = `translate(-50%, -50%) rotate(0deg) scale(${conf.dolphinScale || 1.5})`;
                    setTimeout(bounce, 500 / speed);
                }, 100);
            };
            if (dolphinEl) animateWildBounce(dolphinEl, dolphinLife + 2000);
        }, conf.dolphinDelay);

        const smallSeaCreatures = conf.creaturePool || ["🦐", "🦀", "🐡", "🐠", "🐟", "🦑", "🐙", "🐚", "🦞"];
        let accDelay = 0;
        const jumpInterval = (conf.duration - 2000) / conf.creatureCount;

        for (let i = 0; i < conf.creatureCount; i++) {
            const interval = jumpInterval * 0.5 + Math.random() * jumpInterval; accDelay += interval;
            setTimeout(() => {
                const fromLeft = (i % 2 === 0);
                this._spawnActor(overlayC, 'sea-jump', smallSeaCreatures[Math.floor(Math.random() * smallSeaCreatures.length)], {
                    duration: 4000,
                    styles: {
                        fontSize: (conf.creatureSize || conf.fontSize),
                        '--sx': (fromLeft ? '-10%' : '110%'), '--ex': (fromLeft ? '110%' : '-10%'),
                        '--sr': (fromLeft ? '-120deg' : '120deg'), '--er': (fromLeft ? '120deg' : '-120deg'),
                        '--sc': (fromLeft ? '-1' : '1')
                    }
                });
            }, accDelay);
        }

        for (let i = 0; i < conf.extraCount; i++) {
            setTimeout(() => {
                this._spawnActor(overlayC, 'sea-extra', smallSeaCreatures[Math.floor(Math.random() * smallSeaCreatures.length)], {
                    duration: 3000 + Math.random() * 2000,
                    styles: {
                        fontSize: `calc(${conf.creatureSize || conf.fontSize} * 0.8)`,
                        left: `${Math.random() * 100}%`,
                        top: '110%',
                        '--x-end': `${(Math.random() - 0.5) * 20}vw`,
                        '--y-end': `-${20 + Math.random() * 10}vh`,
                        '--r-start': `${Math.random() * 360}deg`,
                        '--r-end': `${Math.random() * 360}deg`
                    }
                });
            }, Math.random() * (conf.duration - 5000));
        }

        let msg = context.message || ""; if (msg.startsWith("!돌핀")) msg = msg.substring(3).trim();
        if (msg) {
            setTimeout(() => {
                const txt = document.createElement('div'); txt.className = 'dolphin-text';
                txt.innerHTML = renderMessageWithEmotesHTML(this._wrapText(msg, (window.VISUAL_CONFIG?.common?.textWrapLimit || 200), "<br>"), context.emotes || {}, 2.0);
                ov.appendChild(txt);
            }, conf.dolphinDelay);
        }
        return new Promise(resolve => {
            setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 2000); }, conf.duration);
        });
    }

    _runValstrax(context) {
        // This method is now a placeholder or can be removed if triggerValstrax is the new entry point.
        // For now, it will just resolve immediately.
        return Promise.resolve();
    }

    // [New] Valstrax Logic
    triggerValstrax(message) {
        if (!window.VISUAL_CONFIG.valstrax) return Promise.resolve();
        const conf = window.VISUAL_CONFIG.valstrax;

        return new Promise(resolve => {
            // 1. 오버레이 생성
            const overlay = document.createElement('div');
            overlay.className = 'valstrax-overlay';
            overlay.style.setProperty('--cloud-height', `${conf.cloudHeight || 180}px`);
            overlay.style.setProperty('--cloud-size', `${conf.cloudSize || 400}px`);
            document.body.appendChild(overlay);

            // [New] 초기 배경 이미지 추가 (6초 전까지)
            const initialBg = document.createElement('div');
            initialBg.className = 'valstrax-initial-bg';
            overlay.appendChild(initialBg);

            // 2. 초기 구름 (바닥 3겹) 생성
            const cloudsContainer = document.createElement('div');
            cloudsContainer.className = 'valstrax-clouds';
            cloudsContainer.innerHTML = `
                <div class="cloud-layer cloud-3"></div>
                <div class="cloud-layer cloud-2"></div>
                <div class="cloud-layer cloud-1"></div>
            `;
            overlay.appendChild(cloudsContainer);

            // 사운드 재생
            if (window.AudioManager && conf.soundKey) window.AudioManager.playSFX(conf.soundKey);

            // 3. 5초: 제트기 (붉은 선 - 두 줄) & 제트운 (흰 선)
            setTimeout(() => {
                // [Fix] 비행운(흰 선)을 비행기(붉은 선)와 분리하여 그 자리에 남도록 처리
                const contrailL = document.createElement('div');
                contrailL.className = 'valstrax-contrail valstrax-jet-left contrail-active';
                overlay.appendChild(contrailL);

                const contrailR = document.createElement('div');
                contrailR.className = 'valstrax-contrail valstrax-jet-right contrail-active';
                overlay.appendChild(contrailR);

                const jetL = document.createElement('div');
                jetL.className = 'valstrax-jet valstrax-jet-left jet-active';
                overlay.appendChild(jetL);

                const jetR = document.createElement('div');
                jetR.className = 'valstrax-jet valstrax-jet-right jet-active';
                overlay.appendChild(jetR);
            }, conf.jetDelay);

            // 4. 6초: 시네마틱 구름 서지 (전환 가림막)
            setTimeout(() => {
                // [New] 구름 서지 레이어 생성 (전체화면 구름 덮기)
                const surge = document.createElement('div');
                surge.className = 'valstrax-surge';
                overlay.appendChild(surge);

                // 구름이 화면을 완전히 가리는 피크 시점(약 0.6초 뒤)에 요소 교체
                setTimeout(() => {
                    overlay.querySelectorAll('.valstrax-clouds, .valstrax-jet, .valstrax-contrail, .valstrax-initial-bg').forEach(el => el.remove());

                    const flashLayer = document.createElement('div');
                    flashLayer.className = 'valstrax-flash-layer scene-active';
                    overlay.appendChild(flashLayer);

                    const mountains = document.createElement('div');
                    mountains.className = 'valstrax-mountains';
                    overlay.appendChild(mountains);

                    const star = document.createElement('div');
                    star.className = 'valstrax-star';
                    star.style.opacity = '1';
                    overlay.appendChild(star);

                    this.activeStar = star;
                }, 600); // 0.6s Peak Timing

                // 3초 뒤(페이드아웃 완료 후) 서지 레이어 제거
                setTimeout(() => surge.remove(), 3000);
            }, conf.flashDelay);

            // 5. 7.3초: 별 폭발 & 유성 진입
            setTimeout(() => {
                if (this.activeStar) this.activeStar.style.display = 'none'; // 별 사라짐

                // [Fix] 쉐이커 컨테이너 추가하여 스케일(접근)과 쉐이크(흔들림) 애니메이션 공존 유도
                const shaker = document.createElement('div');
                shaker.className = 'valstrax-shaker shaker-active';

                const meteor = document.createElement('div');
                meteor.className = 'valstrax-meteor meteor-active';

                shaker.appendChild(meteor);
                overlay.appendChild(shaker);
            }, conf.starExplodeDelay);

            // 6. 충돌 임팩트 (impactDelay 지점)
            setTimeout(() => {
                const impactFlash = document.createElement('div');
                impactFlash.className = 'valstrax-impact-flash';
                overlay.appendChild(impactFlash);

                setTimeout(() => impactFlash.classList.add('flash-fade-out'), 100);
                setTimeout(() => impactFlash.remove(), 1200);

                // [Fix] 메테오 충돌 후 이전 오브젝트들 완전 정리 (비행운 포함)
                overlay.querySelectorAll('.valstrax-clouds, .valstrax-mountains, .valstrax-jet, .valstrax-meteor, .valstrax-star, .valstrax-flash-layer, .valstrax-shaker, .valstrax-contrail').forEach(el => el.remove());

                // [New] 최종 배경 GIF 추가 (전체화면)
                const finalBg = document.createElement('div');
                finalBg.className = 'valstrax-final-bg';
                overlay.appendChild(finalBg);

                // [Fix] 충돌과 동시에 구름 등장
                // 상단 구름 생성
                const topClouds = document.createElement('div');
                topClouds.className = 'valstrax-clouds';
                topClouds.style.top = '0';
                topClouds.style.bottom = 'auto';
                topClouds.innerHTML = `
                    <div class="cloud-layer cloud-3 top"></div>
                    <div class="cloud-layer cloud-2 top"></div>
                    <div class="cloud-layer cloud-1 top"></div>
                `;
                overlay.appendChild(topClouds);

                // 하단 구름 생성 (바닥에 다시 깔림)
                const bottomClouds = document.createElement('div');
                bottomClouds.className = 'valstrax-clouds';
                bottomClouds.innerHTML = `
                    <div class="cloud-layer cloud-3"></div>
                    <div class="cloud-layer cloud-2"></div>
                    <div class="cloud-layer cloud-1"></div>
                `;
                overlay.appendChild(bottomClouds);
            }, conf.impactDelay);

            // 7. 메시지 등장 (textAppearDelay 지점)
            setTimeout(() => {
                let msg = message || "";
                if (msg.startsWith("!발파")) msg = msg.substring(3).trim();

                const msgBox = document.createElement('div');
                msgBox.className = 'valstrax-msg-box';
                msgBox.innerHTML = `<div>${msg}</div>`;
                overlay.appendChild(msgBox);

                // Fade In 효과
                requestAnimationFrame(() => msgBox.classList.add('visible'));

            }, conf.textAppearDelay);

            // 7. 18초: 종료
            setTimeout(() => {
                overlay.remove();
                resolve(); // Signal completion to the queue
            }, conf.duration);
        });
    }

    _runBangjong(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.bangjong) ? window.VISUAL_CONFIG.bangjong : {
            duration: 90000,
            teostraPath: './img/Teostra.png',
            lunastraPath: './img/Lunastra.png',
            characterCount: 8,
            characterSize: '15rem'
        };

        const overlay = document.getElementById('bangjong-overlay');
        if (!overlay) return Promise.resolve();

        const container = overlay.querySelector('.bangjong-actors-container');
        if (container) container.innerHTML = ''; // Clear previous actors

        // Add text message if any
        let msg = context.message || "";
        if (msg.startsWith("!방종송")) msg = msg.substring(4).trim();
        if (msg) {
            const txt = document.createElement('div');
            txt.className = 'bangjong-text';
            txt.innerHTML = renderMessageWithEmotesHTML(msg, context.emotes || {});
            overlay.appendChild(txt);
            setTimeout(() => { if (txt.parentNode) txt.remove(); }, conf.duration);
        }

        // Spawn characters (Teostra & Lunastra)
        let isActive = true;
        if (container) {
            for (let i = 0; i < conf.characterCount; i++) {
                const isTeostra = (i % 2 === 0);
                const charPath = isTeostra ? conf.teostraPath : conf.lunastraPath;

                const actor = document.createElement('div');
                actor.className = 'bangjong-actor';
                actor.style.width = conf.characterSize;

                // Initial random position (Narrowed range to keep on-screen)
                const startX = Math.random() * 60 + 20;
                const startY = Math.random() * 52 + 24;
                actor.style.left = startX + '%';
                actor.style.top = startY + '%';

                const img = document.createElement('img');
                img.src = charPath;
                actor.appendChild(img);
                container.appendChild(actor);

                const hopDuration = 0.4 + Math.random() * 0.3;
                const delay = Math.random() * -5;
                img.style.animation = `hvn-bangjong-hop ${hopDuration}s ease-in-out infinite ${delay}s`;

                // --- Puppy-like AI Movement ---
                const movePuppy = () => {
                    if (!isActive) return;

                    const curX = parseFloat(actor.style.left);
                    const destX = Math.random() * 60 + 20; // Narrowed: 20-80%
                    const destY = Math.random() * 52 + 24; // Narrowed: 24-76%

                    // Speed: ~10-20% per second
                    const distance = Math.sqrt(Math.pow(destX - curX, 2));
                    const duration = 1.5 + (distance / 15) + Math.random() * 2;

                    // Direction Flip
                    const movingRight = destX > curX;
                    let flipped = isTeostra ? !movingRight : movingRight;
                    actor.style.transform = flipped ? 'scaleX(-1)' : 'scaleX(1)';

                    actor.style.transition = `left ${duration}s ease-in-out, top ${duration}s ease-in-out`;
                    actor.style.left = destX + '%';
                    actor.style.top = destY + '%';

                    // Next move after reaching or pausing
                    const totalWait = (duration * 1000) + (Math.random() > 0.7 ? 500 + Math.random() * 1500 : 0);
                    setTimeout(movePuppy, totalWait);
                };

                // Start AI with a slight staggered delay
                setTimeout(movePuppy, i * 300);
            }
        }

        return new Promise(resolve => {
            overlay.classList.add('visible');
            setTimeout(() => {
                isActive = false;
                overlay.classList.remove('visible');
                // Wait for fade out transition (0.5s in CSS) before clearing
                setTimeout(() => {
                    if (container) container.innerHTML = '';
                    const txt = overlay.querySelector('.bangjong-text');
                    if (txt) txt.remove();
                    resolve();
                }, 600);
            }, conf.duration);
        });
    }

    _runGazabu(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.gazabu) ? window.VISUAL_CONFIG.gazabu : {
            duration: 8000,
            backgroundPath: './Video/가자부.mp4'
        };

        const overlay = document.getElementById('gazabu-overlay');
        if (!overlay) return Promise.resolve();

        // Set background video
        const bg = overlay.querySelector('.gazabu-bg');
        if (bg) {
            bg.src = conf.backgroundPath;
            bg.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
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

    _runMulsulsan(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.mulsulsan) ? window.VISUAL_CONFIG.mulsulsan : {
            duration: 10000,
            backgroundPath: './Video/물설산씨티.mp4'
        };

        const overlay = document.getElementById('mulsulsan-overlay');
        if (!overlay) return Promise.resolve();

        // Set background video
        const bg = overlay.querySelector('.mulsulsan-bg');
        if (bg) {
            bg.src = conf.backgroundPath;
            bg.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
            // [Audio] Apply volume from visual audio settings if possible
            const visualVol = (window.audioManager && window.audioManager.volumeConfig) ? window.audioManager.volumeConfig.visual : 1.0;
            bg.volume = visualVol * (conf.videoVolume || 1.0);
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

    _runRandomDance(context) {
        const overlay = document.getElementById('random-dance-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.random_dance) ? window.VISUAL_CONFIG.random_dance : {
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

        // [Fix] Explicitly clear containers at the start to prevent ghosting from previous runs Boris again
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';

        // Apply shared styles
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
            video.preload = 'auto'; // Boris again
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = '20px';
            video.style.boxShadow = '0 0 20px rgba(255,105,180,0.5)';
            container.appendChild(video);
            video.load(); // Boris again
        };

        const cycleVideos = () => {
            // Fade out
            leftContainer.style.opacity = '0';
            rightContainer.style.opacity = '0';

            setTimeout(() => {
                const vid1 = selectedVideos[currentIndex];
                const vid2 = selectedVideos[(currentIndex + 1) % selectedVideos.length];
                spawnVideo(leftContainer, vid1);
                spawnVideo(rightContainer, vid2);

                // Fade in
                leftContainer.style.opacity = (conf.opacity || 0.9).toString();
                rightContainer.style.opacity = (conf.opacity || 0.9).toString();

                currentIndex = (currentIndex + 2) % selectedVideos.length;
            }, 300);
        };

        return new Promise(resolve => {
            overlay.classList.add('visible');
            overlay.classList.remove('rd-bloom'); // Reset bloom

            cycleVideos(); // Initial
            const interval = setInterval(cycleVideos, conf.cycleInterval || 6000);

            // [New] Bloom effect (뽀샤시) start at 6s
            const bloomTimeout = setTimeout(() => {
                overlay.classList.add('rd-bloom');
            }, 6000);

            setTimeout(() => {
                clearInterval(interval);
                clearTimeout(bloomTimeout);
                overlay.classList.remove('visible', 'rd-bloom');

                // [Fix] Extra delay before resolve to ensure 0.3s fade-out is complete Boris again
                setTimeout(() => {
                    leftContainer.innerHTML = '';
                    rightContainer.innerHTML = '';
                    resolve();
                }, 400);
            }, conf.duration);
        });
    }

    _genericSkullLikeEffect(overlayId, kw, styleClass, emojiClass, context, conf) {
        const overlay = document.getElementById(overlayId); if (!overlay) return Promise.resolve();
        const parts = this._parseMessage(context.message, kw);
        const floatTime = conf.floatingTextDuration || 4000;
        const textScale = conf.textScale || 1.5;
        this._showFloatingText(parts.rest, 0, floatTime - 500, styleClass, context.emotes, conf.fontSize, textScale);
        this._showFloatingText(parts.last, floatTime - 400, 500, styleClass, context.emotes, conf.fontSize, textScale);
        return new Promise(resolve => {
            setTimeout(() => {
                overlay.classList.add('visible');
                const emoji = overlay.querySelector('.' + emojiClass);
                let active = true;
                const glitch = () => {
                    if (!active) return;
                    void emoji.offsetWidth;
                    emoji.classList.add('glitching');
                    const delay = (conf.glitchMinDelay || 260) + Math.random() * ((conf.glitchMaxDelay || 780) - (conf.glitchMinDelay || 260));
                    setTimeout(() => {
                        emoji.classList.remove('glitching');
                        if (active) setTimeout(glitch, delay);
                    }, 200);
                };
                glitch();
                setTimeout(() => { active = false; overlay.classList.remove('visible'); resolve(); }, conf.duration - floatTime);
            }, floatTime);
        });
    }

    _showFloatingText(text, delay, duration, styleClass, emotes, fontSize, textScale = 1.5) {
        if (!text) return;
        setTimeout(() => {
            const el = document.createElement('div'); el.className = `visual-center-text ${styleClass}`;
            if (fontSize) el.style.fontSize = fontSize;
            el.innerHTML = renderMessageWithEmotesHTML(this._wrapText(text, (window.VISUAL_CONFIG?.common?.textWrapLimit || 200)), emotes || {}, textScale);
            document.body.appendChild(el);
            el.style.animation = "hvn-skull-fadeIn 0.2s forwards";
            setTimeout(() => { el.style.animation = "hvn-skull-fadeOut 0.2s forwards"; setTimeout(() => el.remove(), 200); }, duration - 200);
        }, delay);
    }

    _parseMessage(msg, kw) {
        let display = (msg || "").trim(); if (display.startsWith(kw)) display = display.substring(kw.length).trim();
        const words = display.split(/\s+/).filter(w => w.length > 0);
        let last = "", rest = ""; if (words.length > 1) { last = words.pop(); rest = words.join(' '); } else if (words.length === 1) { last = words[0]; }
        return { last, rest };
    }

    _wrapText(text, limit = 20, separator = '<br>') {
        const words = text.split(/\s+/).filter(w => w.length > 0); if (words.length === 0) return "";
        let lines = [], cur = words[0];
        for (let i = 1; i < words.length; i++) { if ((cur + " " + words[i]).length <= limit) cur += " " + words[i]; else { lines.push(cur); cur = words[i]; } }
        if (cur) lines.push(cur); return lines.join(separator);
    }

    _splitMessageIntoParts(msg, count) {
        const words = msg.split(/\s+/).filter(w => w.length > 0);
        let parts = new Array(count).fill("");
        if (words.length === 0) return parts;

        // If only one word, put it at the very end (punchline)
        if (words.length === 1) {
            parts[count - 1] = words[0];
            return parts;
        }

        // Reserve last word for the last part
        const last = words.pop();
        parts[count - 1] = last;

        const rem = words;
        const remainingSlots = count - 1;

        if (rem.length <= remainingSlots) {
            // If fewer (or equal) words than slots, fill them sequentially.
            // Empty slots remain empty (no duplication).
            for (let i = 0; i < rem.length; i++) {
                parts[i] = rem[i];
            }
        } else {
            // Distribute remaining words across the remaining slots
            let currentIndex = 0;
            for (let i = 0; i < remainingSlots; i++) {
                const slotsLeft = remainingSlots - i;
                const wordsLeft = rem.length - currentIndex;
                const take = Math.ceil(wordsLeft / slotsLeft);
                parts[i] = rem.slice(currentIndex, currentIndex + take).join(' ');
                currentIndex += take;
            }
        }
        return parts;
    }

    _spawnActor(parent, cls, emoji, opts) {
        const el = document.createElement('div'); el.className = cls;
        if (opts.styles && opts.styles.nametag) {
            el.style.cssText = "display:flex; flex-direction:column; align-items:center; justify-content:flex-end; white-space:nowrap;";

            const userColor = opts.styles.nameColor || '#fff';
            const nt = document.createElement('div'); nt.className = 'surfer-nametag';
            nt.innerHTML = `<span class="user-name">${opts.styles.nametag}</span>`;
            nt.style.setProperty('--user-color', userColor);
            el.appendChild(nt);
        }
        const inner = document.createElement('div'); inner.className = 'actor-emoji';
        inner.innerHTML = emoji; inner.style.lineHeight = '1'; el.appendChild(inner);
        if (window.twemoji) twemoji.parse(el);
        el.style.animationDuration = opts.duration + 'ms';
        if (opts.styles) Object.keys(opts.styles).forEach(key => { if (key.startsWith('--')) el.style.setProperty(key, opts.styles[key]); else if (key !== 'nametag' && key !== 'nameColor') el.style[key] = opts.styles[key]; });
        parent.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.remove(); }, opts.duration + 2000);
        return el;
    }
}

