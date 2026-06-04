class BangjongEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().bangjong) ? this.config.getVisualConfig().bangjong : {
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
        msg = msg.replace(/!방종송/i, '').trim();
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

                // Initial random position
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

                // Puppy-like AI Movement
                const movePuppy = () => {
                    if (!isActive) return;

                    const curX = parseFloat(actor.style.left);
                    const destX = Math.random() * 60 + 20; // 20-80%
                    const destY = Math.random() * 52 + 24; // 24-76%

                    const distance = Math.sqrt(Math.pow(destX - curX, 2));
                    const duration = 1.5 + (distance / 15) + Math.random() * 2;

                    const movingRight = destX > curX;
                    let flipped = isTeostra ? !movingRight : movingRight;
                    actor.style.transform = flipped ? 'scaleX(-1)' : 'scaleX(1)';

                    actor.style.transition = `left ${duration}s ease-in-out, top ${duration}s ease-in-out`;
                    actor.style.left = destX + '%';
                    actor.style.top = destY + '%';

                    const totalWait = (duration * 1000) + (Math.random() > 0.7 ? 500 + Math.random() * 1500 : 0);
                    setTimeout(movePuppy, totalWait);
                };

                setTimeout(movePuppy, i * 300);
            }
        }

        return new Promise(resolve => {
            overlay.classList.add('visible');
            setTimeout(() => {
                isActive = false;
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (container) container.innerHTML = '';
                    const txt = overlay.querySelector('.bangjong-text');
                    if (txt) txt.remove();
                    resolve();
                }, 600);
            }, conf.duration);
        });
    }
}
