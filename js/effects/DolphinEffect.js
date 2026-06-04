class DolphinEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().dolphin) ? this.config.getVisualConfig().dolphin : {
            duration: 7000,
            creatureCount: 30,
            extraCount: 40,
            dolphinDelay: 1400,
            surferStartOffset: 1000,
            fontSize: '2.5rem',
            creatureSize: '2.5rem',
            nametagColor: '#00ffa3',
            dolphinScale: 1.2
        };

        const id = 'dolphin-overlay-root'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.className = 'fullscreen-overlay visible';
        ov.innerHTML = `<div id="dolphin-overlay" class="visible event-normal"><div class="dolphin-light dolphin-light-left"></div><div class="dolphin-light dolphin-light-right"></div><div class="dolphin-sea-bottom"><div class="sea-wave"></div></div></div>`;
        document.body.appendChild(ov);

        const overlayC = ov.querySelector('#dolphin-overlay');
        const surfingEmojis = conf.surfingEmojis || ["🏄", "🏄‍♂️", "🏄‍♀️"];

        const surferStartOffset = conf.surferStartOffset || 0;
        const animDuration = (conf.duration + surferStartOffset) / 1000;
        const animDelay = -surferStartOffset / 1000;

        this.director._spawnActor(overlayC, 'surfer-actor', surfingEmojis[Math.floor(Math.random() * surfingEmojis.length)], {
            duration: conf.duration,
            styles: {
                nametag: (context.nickname || "Anonymous"),
                nameColor: (context.color || conf.nametagColor),
                left: '-20vw',
                animation: `hvn-dolphin-surfer ${animDuration}s linear forwards`,
                animationDelay: `${animDelay}s`
            }
        });

        const dolphinLife = conf.duration - conf.dolphinDelay;
        setTimeout(() => {
            const dolphinEl = this.director._spawnActor(overlayC, 'lead-dolphin', "🐬", { duration: dolphinLife + 5000 });
            const animateWildBounce = (el, total) => {
                const start = Date.now(); let rot = 0;
                const speed = conf.bounceSpeed || 1.0;
                const bounce = () => {
                    const elapsed = Date.now() - start; if (elapsed >= total) return;
                    const x = 5 + Math.random() * 90, y = 5 + Math.random() * 90;
                    const d = (conf.dolphinRotation || 360) + Math.random() * 6040;
                    rot -= d;
                    el.style.transition = `top ${800 / speed}ms ease-in-out, left ${800 / speed}ms ease-in-out, transform ${1200 / speed}ms cubic-bezier(0.1, 0.5, 0.2, 1)`;
                    el.style.left = `${x}%`; el.style.top = `${y}%`; el.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${conf.dolphinScale || 1.2})`;
                    setTimeout(bounce, (900 + Math.random() * 300) / speed);
                };
                // Emerge spinning from the bottom (top: 120%, rotate: -360deg, scale: 0)
                el.style.left = '50%'; el.style.top = '120%'; el.style.transform = 'translate(-50%, -50%) rotate(-360deg) scale(0)';
                setTimeout(() => {
                    el.style.transition = `top ${800 / speed}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), transform ${800 / speed}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
                    el.style.left = '50%'; el.style.top = '50%'; el.style.transform = `translate(-50%, -50%) rotate(0deg) scale(${conf.dolphinScale || 1.2})`;
                    setTimeout(bounce, 800 / speed);
                }, 100);
            };
            if (dolphinEl) animateWildBounce(dolphinEl, dolphinLife + 2000);
        }, conf.dolphinDelay);

        const smallSeaCreatures = conf.creaturePool || ["🦐", "🦀", "🐡", "🐠", "🐟", "🦑", "🐙", "🐚", "🦞"];
        let accDelay = 0;
        const jumpInterval = (conf.duration - 2000) / conf.creatureCount;

        for (let i = 0; i < conf.creatureCount; i++) {
            const interval = jumpInterval * 0.3 + Math.random() * (jumpInterval * 1.4);
            accDelay += interval;

            const duration = 1500 + Math.random() * 2000; // 1.5s to 3.5s jump duration
            const fromLeft = Math.random() > 0.5; // Random direction

            const startX = -10 + Math.random() * 120; // Start between -10% and 110%
            const travelDistance = 15 + Math.random() * 35; // Travel between 15% and 50% screen width
            const endX = fromLeft ? (startX + travelDistance) : (startX - travelDistance);

            const jumpHeight = `${20 + Math.random() * 45}vh`; // Random height: 20vh to 65vh

            const startRot = `${-60 - Math.random() * 120}deg`;
            const endRot = `${60 + Math.random() * 120}deg`;
            const scaleX = fromLeft ? '1' : '-1';

            // Randomize size slightly (60% to 140% of base size)
            const baseSize = conf.creatureSize || conf.fontSize || '2.5rem';
            const sizeVal = parseFloat(baseSize) || 8;
            const sizeUnit = baseSize.replace(/[0-9.]/g, '') || 'rem';
            const randomSize = `${sizeVal * (0.6 + Math.random() * 0.8)}${sizeUnit}`;

            setTimeout(() => {
                this.director._spawnActor(overlayC, 'sea-jump', smallSeaCreatures[Math.floor(Math.random() * smallSeaCreatures.length)], {
                    duration: duration,
                    styles: {
                        fontSize: randomSize,
                        '--sx': `${startX}%`,
                        '--ex': `${endX}%`,
                        '--jh': jumpHeight,
                        '--sr': startRot,
                        '--er': endRot,
                        '--sc': scaleX
                    }
                });
            }, accDelay);
        }

        for (let i = 0; i < conf.extraCount; i++) {
            setTimeout(() => {
                this.director._spawnActor(overlayC, 'sea-extra', smallSeaCreatures[Math.floor(Math.random() * smallSeaCreatures.length)], {
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

        let msg = context.message || "";
        msg = msg.replace(/!돌핀/i, '').trim();
        if (msg) {
            setTimeout(() => {
                const txt = document.createElement('div'); txt.className = 'dolphin-text';
                txt.style.animation = `hvn-dolphin-textFade ${dolphinLife / 1000}s ease-in-out forwards`;
                txt.innerHTML = renderMessageWithEmotesHTML(this.director._wrapText(msg, (this.config.getVisualConfig()?.common?.textWrapLimit || 200), "<br>"), context.emotes || {}, 2.0);
                ov.appendChild(txt);
            }, conf.dolphinDelay);
        }
        return new Promise(resolve => {
            setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 2000); }, conf.duration);
        });
    }
}
