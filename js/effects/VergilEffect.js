class VergilEffect extends BaseEffect {
    constructor(director) {
        super(director);
    }

    async execute(context) {
        const conf = (this.config.getVisualConfig() && this.config.getVisualConfig().vergil) ? this.config.getVisualConfig().vergil : {
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
                    msg = msg.replace(new RegExp(kw, 'i'), '').trim();
                    if (msg) {
                        const txt = document.createElement('div'); txt.className = 'vergil-text';
                        txt.innerHTML = renderMessageWithEmotesHTML(msg, context.emotes || {}); ov.appendChild(txt);
                        setTimeout(() => { txt.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => txt.remove(), 1000); }, 7000);
                    }
                }, conf.textDelay - explosionTime);
            }, explosionTime);
        });
    }
}
