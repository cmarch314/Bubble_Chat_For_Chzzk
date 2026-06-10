// ==========================================
// [Class 5] Visual Director (Effects Engine)
// ==========================================
class VisualDirector {
    constructor(config, eventBus, audioManager = null) {
        this.config = config;
        this.eventBus = eventBus;
        this.audioManager = audioManager;
        this.queue = [];
        this.isLocked = false;
        this.enabled = false; // [Default] OFF (Manual trigger keywords)
        this.alertsEnabled = true; // [Default] ON (Sub/Donation Alerts)
        this.activeGame = null; // [New] Currently running chat game
        this._initOverlays();
        this.registry = this._buildRegistry();

        if (this.eventBus) {
            this.eventBus.on('system:disableVisuals', () => this.setEnabled(false));
            this.eventBus.on('system:enableVisuals', () => this.setEnabled(true));
            this.eventBus.on('system:toggleVisuals', () => this.setEnabled(!this.enabled));
            this.eventBus.on('system:disableAlerts', () => this.setAlertsEnabled(false));
            this.eventBus.on('system:enableAlerts', () => this.setAlertsEnabled(true));
        }
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
        if (effect.soundKey) {
            const vConf = this.config.getVisualConfig();
            const soundTargetKey = (vConf && vConf[effect.key] && vConf[effect.key].audioOverride)
                ? vConf[effect.key].audioOverride
                : effect.soundKey;

            const activeSoundKey = soundTargetKey;
            if (activeSoundKey) {
                this.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()[activeSoundKey] || activeSoundKey);
            }
        }

        // 2. Visual
        try {
            await effect.execute(context);
        } catch (e) {
            console.error(`❌ Visual Effect Error (${effect.soundKey}):`, e);
        }

        // 3. Cooldown
        const vConfCommon = this.config.getVisualConfig();
        const cooldown = (vConfCommon && vConfCommon.common && vConfCommon.common.cooldown) || 1000;
        await new Promise(r => setTimeout(r, cooldown));

        this.isLocked = false;
        this._processQueue();
    }

    _initOverlays() {
        const create = (id, templateId) => {
            if (document.getElementById(id)) return;
            const div = document.createElement('div'); div.id = id;
            div.className = 'fullscreen-overlay'; // Apply utility class
            if (templateId) {
                const tmpl = document.getElementById(templateId);
                if (tmpl) div.appendChild(tmpl.content.cloneNode(true));
            }
            document.body.appendChild(div);
        };
        create('skull-overlay', 'tmpl-skull-overlay');
        create('usho-overlay', 'tmpl-usho-overlay');
        create('heart-overlay', 'tmpl-heart-overlay');
        create('flashback-overlay'); // No template needed
        create('bangjong-overlay', 'tmpl-bangjong-overlay');
        create('dango-overlay', 'tmpl-dango-overlay');
        create('king-overlay', 'tmpl-king-overlay');
        create('god-overlay', 'tmpl-god-overlay');
        create('gazabu-overlay', 'tmpl-gazabu-overlay');
        create('mulsulsan-overlay', 'tmpl-mulsulsan-overlay');
        create('random-dance-overlay', 'tmpl-random-dance-overlay');
    }

    _buildRegistry() {
        return {
            usho: { soundKey: "우쇼", instance: new UshoEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            skull: { soundKey: "해골", instance: new SkullEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            couple: { soundKey: "커플", instance: new CoupleEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            vergil: { soundKey: "버질", instance: new VergilEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            dolphin: { soundKey: "돌핀", instance: new DolphinEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            valstrax: { soundKey: "발파", instance: new ValstraxEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            bangjong: { soundKey: "방종송", instance: new BangjongEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            dango: { soundKey: "당고", instance: new DangoEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            king: { soundKey: "몬창왕", instance: new KingEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            godsong: { soundKey: "갓겜송", instance: new GodsongEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            gazabu: { soundKey: "가자부송", instance: new GazabuEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            mulsulsan: { soundKey: "물설산", instance: new MulsulsanEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            random_dance: { soundKey: "랜덤댄스", instance: new RandomDanceEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            sound_quiz: { soundKey: null, instance: new SoundQuizEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            racing: { soundKey: null, instance: new RacingEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            raid: { soundKey: null, instance: new RaidEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            hunt: { soundKey: null, instance: new HuntEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            game_help: { soundKey: null, instance: new GameHelpEffect(this), execute(ctx) { return this.instance.execute(ctx); } },
            commands_scroll: { soundKey: null, instance: new CommandsScrollEffect(this), execute(ctx) { return this.instance.execute(ctx); } }
        };
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
            el.innerHTML = renderMessageWithEmotesHTML(this._wrapText(text, (this.config.getVisualConfig()?.common?.textWrapLimit || 200)), emotes || {}, textScale);
            document.body.appendChild(el);
            el.style.animation = "hvn-skull-fadeIn 0.2s forwards";
            setTimeout(() => {
                el.style.animation = "hvn-skull-fadeOut 0.2s forwards";
                setTimeout(() => el.remove(), 200);
            }, duration - 200);
        }, delay);
    }

    _parseMessage(msg, kw) {
        let display = (msg || "").trim();
        // Case-insensitive replace for the keyword safely
        const lowerKw = kw.toLowerCase();
        const lowerDisplay = display.toLowerCase();
        const startIdx = lowerDisplay.indexOf(lowerKw);

        if (startIdx !== -1) {
            display = (display.substring(0, startIdx) + display.substring(startIdx + kw.length)).trim();
        }
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
        if (window.twemoji) {
            twemoji.parse(el);
            // Ensure generated twemoji images have inline-block display and correct size
            const images = el.querySelectorAll('img');
            images.forEach(img => {
                img.style.width = '1em';
                img.style.height = '1em';
                img.style.display = 'inline-block';
                img.style.verticalAlign = 'middle';
            });
        }
        el.style.animationDuration = opts.duration + 'ms';
        if (opts.styles) Object.keys(opts.styles).forEach(key => { if (key.startsWith('--')) el.style.setProperty(key, opts.styles[key]); else if (key !== 'nametag' && key !== 'nameColor') el.style[key] = opts.styles[key]; });
        parent.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.remove(); }, opts.duration + 2000);
        return el;
    }
}

