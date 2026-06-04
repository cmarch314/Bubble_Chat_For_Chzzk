class DolphinEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().dolphin) ? this.config.getVisualConfig().dolphin : {
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

        this.director._spawnActor(overlayC, 'surfer-actor', surfingEmojis[Math.floor(Math.random() * surfingEmojis.length)], {
            duration: conf.duration,
            styles: {
                nametag: (context.nickname || "Anonymous"),
                nameColor: (context.color || conf.nametagColor),
                left: '-20vw',
                animation: `hvn-dolphin-surfer ${conf.duration / 1000}s linear forwards`
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
                this.director._spawnActor(overlayC, 'sea-jump', smallSeaCreatures[Math.floor(Math.random() * smallSeaCreatures.length)], {
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
                txt.innerHTML = renderMessageWithEmotesHTML(this.director._wrapText(msg, (this.config.getVisualConfig()?.common?.textWrapLimit || 200), "<br>"), context.emotes || {}, 2.0);
                ov.appendChild(txt);
            }, conf.dolphinDelay);
        }
        return new Promise(resolve => {
            setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 2000); }, conf.duration);
        });
    }
}
