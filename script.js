// ==========================================
// [Global Variables] 기본 전역 변수
// ==========================================
const idElement = document.getElementById('id');
const chatEle = document.getElementById('chat');
let boxPos = 0;
const mainArray = [];
let soundEnabled = true; // ConfigManager와 동기화됨
const promptQue = [];
let visualConfig = {};   // 레거시 호환용
let soundHive = {};      // 레거시 호환용

// ==========================================
// [Class 1] Config & State Manager
// ==========================================
class ConfigManager {
    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.has('debug');
        this.loadHistory = urlParams.has('history');
        this.channelId = this._resolveChannelId();

        // 초기 동기화
        this._initBroadcastChannel();
        this._loadLocalConfig();
    }

    _resolveChannelId() {
        const local = localStorage.getItem('CHZZK_CHANNEL_ID');
        const attr = document.getElementById('id')?.getAttribute('chzzkHash');
        return local || attr;
    }

    _initBroadcastChannel() {
        this.bc = new BroadcastChannel('bubble_chat_control');
        this.bc.onmessage = (event) => this._handleCommand(event.data);
    }

    _handleCommand(data) {
        switch (data.type) {
            case 'setSound':
                soundEnabled = data.enabled; // 전역 변수 동기화
                this.log(`Sound: ${data.enabled}`);
                break;
            case 'reload':
                location.reload();
                break;
            case 'setChannel':
                if (data.channelId) {
                    localStorage.setItem('CHZZK_CHANNEL_ID', data.channelId);
                    location.reload();
                }
                break;
            case 'updateConfig':
                if (window.updateSoundHive) window.updateSoundHive(data.soundConfig);
                if (data.visualConfig) visualConfig = data.visualConfig;
                break;
        }
    }

    _loadLocalConfig() {
        // config.js 혹은 로컬스토리지 로드 시뮬레이션
        if (window.loadConfigs) window.loadConfigs();
    }

    log(msg) {
        console.log(`[Config] ${msg}`);
        if (this.debugMode) this._visualLog(msg);
    }

    _visualLog(msg) {
        let box = document.getElementById('debug-log-box');
        if (!box) {
            box = document.createElement('div');
            box.id = 'debug-log-box';
            Object.assign(box.style, {
                position: 'fixed', bottom: '10px', right: '10px', width: '300px',
                maxHeight: '200px', background: 'rgba(0,0,0,0.8)', color: '#0f0',
                fontSize: '12px', zIndex: '10000', overflowY: 'auto'
            });
            document.body.appendChild(box);
        }
        const line = document.createElement('div');
        line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        box.appendChild(line);
        box.scrollTop = box.scrollHeight;
    }
}

// ==========================================
// [Class 2] Chzzk Network Gateway
// ==========================================
class ChzzkGateway {
    constructor(config, messageHandler) {
        this.config = config;
        this.onMessage = messageHandler;
        this.ws = null;
        this.proxies = [
            "https://corsproxy.io/?",
            "https://api.allorigins.win/raw?url=",
            "https://api.codetabs.com/v1/proxy?quest="
        ];
    }

    async connect() {
        this._showLoader("치지직 채널 탐색 중...", "loading");

        try {
            if (!this.config.channelId) throw new Error("채널 ID가 설정되지 않았습니다.");

            const statusData = await this._fetchWithProxy(
                `https://api.chzzk.naver.com/polling/v2/channels/${this.config.channelId}/live-status`
            );
            const { chatChannelId } = statusData.content;

            this._showLoader("채팅 서버 접근 권한 요청 중...", "loading");
            const tokenData = await this._fetchWithProxy(
                `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`
            );
            const accessToken = tokenData.content.accessToken;

            this._connectSocket(chatChannelId, accessToken);

        } catch (e) {
            this.config.log(`Connection Failed: ${e.message}`);
            this._showLoader(`연결 실패: ${e.message}<br>5초 후 재시도`, "error");
            setTimeout(() => this.connect(), 5000);
        }
    }

    _connectSocket(chatChannelId, accessToken) {
        this.ws = new WebSocket('wss://kr-ss1.chat.naver.com/chat');

        this.ws.onopen = () => {
            this.config.log("WS Open. Sending Handshake.");
            this._showLoader("채팅 서버 연결 완료!", "success");
            this.ws.send(JSON.stringify({
                ver: "2", cmd: 100, svcid: "game", cid: chatChannelId,
                bdy: { accTkn: accessToken, auth: "READ", devType: 2001, uid: null }, tid: 1
            }));
        };

        this.ws.onmessage = (e) => this._parsePacket(JSON.parse(e.data), chatChannelId);
        this.ws.onclose = () => {
            this.config.log("WS Closed. Reconnecting...");
            setTimeout(() => this.connect(), 3000);
        };
        this.ws.onerror = (err) => console.error("WS Error", err);

        setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ ver: "2", cmd: 0 }));
        }, 20000);
    }

    _parsePacket(data, chatChannelId) {
        if (data.cmd === 0) {
            this.ws.send(JSON.stringify({ ver: "2", cmd: 10000 }));
            return;
        }

        if (data.cmd === 10100 && this.config.loadHistory) {
            this.ws.send(JSON.stringify({
                ver: "2", cmd: 5101, svcid: "game", cid: chatChannelId,
                bdy: { recentMessageCount: 50 }, tid: 2, sid: data.bdy.sid
            }));
        }

        if ([93101, 15101].includes(data.cmd)) {
            const chats = (data.cmd === 15101) ? data.bdy.messageList : data.bdy;
            if (!chats) return;

            chats.forEach(chat => {
                const profile = chat.profile ? JSON.parse(chat.profile) : {};
                const extra = chat.extras ? JSON.parse(chat.extras) : {};

                const messageData = {
                    message: chat.msg || chat.content || "",
                    nickname: profile.nickname || "Anonymous",
                    color: profile.streamingProperty?.nicknameColor?.colorCode || null,
                    badges: profile.activityBadges || [],
                    emojis: extra.emojis || {},
                    isStreamer: profile.userRoleCode === 'streamer',
                    uid: profile.userIdHash,
                    type: 'chat' // [FIX] Required for nametag rendering in showMessage
                };

                this.onMessage(messageData);
            });
        }
    }

    async _fetchWithProxy(url) {
        for (let proxy of this.proxies) {
            try {
                const res = await fetch(proxy + encodeURIComponent(url));
                if (res.ok) return await res.json();
            } catch (e) { console.warn(`Proxy ${proxy} failed`); }
        }
        throw new Error("All proxies failed");
    }

    _showLoader(msg, type) {
        let loader = document.getElementById('chzzk-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'chzzk-loader';
            document.body.appendChild(loader);
            Object.assign(loader.style, {
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '10px', zIndex: '9999'
            });
        }
        loader.innerHTML = msg;
        loader.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => { loader.style.opacity = 0; setTimeout(() => loader.remove(), 500); }, 1000);
        }
    }
}

// ==========================================
// [Class 3] Visual Director (Effects Engine)
// ==========================================
class VisualDirector {
    constructor(config) {
        this.config = config;
        this.queue = [];
        this.isLocked = false;
        this._initOverlays();
        this.registry = this._buildRegistry();
    }

    trigger(effectType, context = {}) {
        if (!this.registry[effectType]) return;
        console.log(`📥 [VisualDirector] Queuing: ${effectType}`);
        this.queue.push({ effect: this.registry[effectType], context });
        this._processQueue();
    }

    async _processQueue() {
        if (this.isLocked || this.queue.length === 0) return;

        this.isLocked = true;
        const { effect, context } = this.queue.shift();

        // 1. Sound
        if (soundEnabled && effect.soundKey && typeof playZergSound === 'function') {
            const sound = soundHive[effect.soundKey];
            if (sound) playZergSound(sound);
        }

        // 2. Visual
        try {
            await effect.execute(context);
        } catch (e) {
            console.error(`❌ Visual Effect Error (${effect.soundKey}):`, e);
        }

        // 3. Cooldown
        await new Promise(r => setTimeout(r, 1000));

        this.isLocked = false;
        this._processQueue();
    }

    _initOverlays() {
        const create = (id, html) => {
            if (document.getElementById(id)) return;
            const div = document.createElement('div'); div.id = id;
            if (html) div.innerHTML = html;
            document.body.appendChild(div);
        };
        create('skull-overlay', '<div class="skull-wrapper"><div class="skull-emoji" data-text="☠️">☠️</div></div><div class="film-grain"></div>');
        create('usho-overlay', '<div class="usho-wrapper"><div class="usho-emoji" data-text="😱" style="display:none;">😱</div><div class="usho-hammer">🔨</div></div>');
        create('heart-overlay', '<div class="heart-emoji">❤️‍🩹</div>');
        create('flashback-overlay');
    }

    _buildRegistry() {
        return {
            usho: { soundKey: "우쇼", execute: (ctx) => this._runUsho(ctx) },
            skull: { soundKey: "해골", execute: (ctx) => this._runSkull(ctx) },
            couple: { soundKey: "커플", execute: (ctx) => this._runCouple(ctx) },
            heart: { soundKey: "하트", execute: (ctx) => this._runHeart(ctx) },
            vergil: { soundKey: "버질", execute: (ctx) => this._runVergil(ctx) },
            dolphin: { soundKey: "돌핀", execute: (ctx) => this._runDolphin(ctx) }
        };
    }

    // --- Effect Implementations ---
    _runSkull(context) {
        return this._genericSkullLikeEffect('skull-overlay', '해골', 'skull-style', 'skull-emoji', context);
    }

    _runUsho(context) {
        const overlay = document.getElementById('usho-overlay');
        if (!overlay) return Promise.resolve();
        const parts = this._parseMessage(context.message, "우쇼");
        this._showFloatingText(parts.rest, 0, 3700, 'usho-style', context.emotes);
        this._showFloatingText(parts.last, 3600, 700, 'usho-style', context.emotes);
        return new Promise(resolve => {
            setTimeout(() => {
                overlay.classList.add('visible');
                const hammer = overlay.querySelector('.usho-hammer');
                if (hammer) {
                    hammer.style.opacity = '0'; hammer.style.animation = 'none';
                    setTimeout(() => { hammer.style.opacity = '1'; hammer.style.animation = "hvn-skull-hammerStrike 3.14s infinite"; }, 1200);
                }
                setTimeout(() => { overlay.classList.remove('visible'); if (hammer) { hammer.style.opacity = '0'; hammer.style.animation = 'none'; } resolve(); }, 8000);
            }, 4000);
        });
    }

    _runCouple(context) {
        const flashback = document.getElementById('flashback-overlay');
        const overlay = document.getElementById('heart-overlay');
        if (!flashback || !overlay) return Promise.resolve();

        let displayMsg = (context.message || "").trim();
        if (displayMsg.startsWith("커플")) displayMsg = displayMsg.substring(2).trim();

        const words = displayMsg.split(' ');
        let lines = [];
        let currentLine = words[0] || "";
        for (let i = 1; i < words.length; i++) {
            if ((currentLine + " " + words[i]).length <= 20) currentLine += " " + words[i];
            else { lines.push(currentLine); currentLine = words[i]; }
        }
        if (currentLine) lines.push(currentLine);

        const wrappedMsg = lines.join('<br>');
        const centerMsgSnippet = document.createElement('div');
        centerMsgSnippet.className = 'couple-premium-text';
        centerMsgSnippet.innerHTML = renderMessageWithEmotesHTML(this._wrapText(displayMsg, 20), context.emotes || {});
        centerMsgSnippet.style.animation = "hvn-couple-fadeIn 1s forwards";

        document.body.appendChild(centerMsgSnippet);

        return new Promise(resolve => {
            flashback.classList.add('visible');
            setTimeout(() => { centerMsgSnippet.style.animation = "hvn-couple-fadeOut 1s forwards"; }, 10300);

            setTimeout(() => {
                if (centerMsgSnippet) centerMsgSnippet.remove();
                flashback.classList.remove('visible');
                overlay.classList.add('visible');

                const emojiEl = overlay.querySelector('.heart-emoji');
                const personRanges = [[0x1F600, 0x1F64F], [0x1F466, 0x1F480], [0x1F9DC, 0x1F9DF], [0x1F470, 0x1F478]];
                const heartRanges = [[0x1F493, 0x1F49F], [0x2764, 0x2764], [0x1F9E1, 0x1F9E1], [0x1F90D, 0x1F90E], [0x1F48B, 0x1F48D]];

                const getRandom = (ranges) => {
                    let total = ranges.reduce((acc, r) => acc + (r[1] - r[0] + 1), 0);
                    let rIdx = Math.floor(Math.random() * total);
                    for (let r of ranges) {
                        let size = r[1] - r[0] + 1;
                        if (rIdx < size) return String.fromCodePoint(r[0] + rIdx);
                        rIdx -= size;
                    }
                    return "❓";
                };

                const p1 = getRandom(personRanges), p2 = getRandom(personRanges), h3 = getRandom(heartRanges);

                const step = (idx) => {
                    const hue = Math.floor(Math.random() * 360);
                    overlay.style.backgroundColor = `hsla(${hue}, 100%, 70%, 0.3)`;
                    emojiEl.classList.remove('grow-effect');
                    void emojiEl.offsetWidth;
                    emojiEl.classList.add('grow-effect');
                    emojiEl.style.fontSize = (idx === 3) ? '13rem' : '20rem';
                    if (idx === 0) emojiEl.innerText = p1;
                    else if (idx === 1) emojiEl.innerText = p2;
                    else if (idx === 2) emojiEl.innerText = h3;
                    else if (idx === 3) emojiEl.innerText = `${p1}${h3}${p2}`;
                };

                step(0);
                setTimeout(() => step(1), 2250);
                setTimeout(() => step(2), 4500);
                setTimeout(() => step(3), 5625);

                setTimeout(() => {
                    overlay.style.backgroundColor = '';
                    overlay.classList.remove('visible');
                    emojiEl.innerText = '❤️‍🩹';
                    emojiEl.style.fontSize = '';
                    resolve();
                }, 9000);
            }, 11800);
        });
    }

    _runHeart(context) {
        const id = 'heart-overlay-root'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483647; pointer-events:none;";
        ov.innerHTML = `
            <div id="heart-overlay" class="visible">
                <div id="heart-backdrop"></div>
                <div class="heart-emoji-container"></div>
                <div class="heart-flash"></div>
            </div>`;
        document.body.appendChild(ov);
        const overlay = ov.querySelector('#heart-overlay');
        const backdrop = ov.querySelector('#heart-backdrop');
        const flash = ov.querySelector('.heart-flash');
        const emojiContainer = ov.querySelector('.heart-emoji-container');

        let msg = context.message || ""; if (msg.startsWith("하트")) msg = msg.substring(2).trim();

        // [RESTORED] Original 4-part message distribution logic
        const allWords = msg.split(' ').filter(w => w.length > 0);
        let parts = ["", "", "", ""];
        if (allWords.length === 1) { parts[3] = allWords[0]; }
        else if (allWords.length > 1) {
            const last = allWords.pop(); const rem = allWords;
            if (rem.length === 1) { parts[0] = parts[1] = parts[2] = rem[0]; parts[3] = last; }
            else if (rem.length === 2) { parts[0] = parts[1] = rem[0]; parts[2] = rem[1]; parts[3] = last; }
            else {
                const p1 = Math.ceil(rem.length / 3); const p2 = Math.ceil((rem.length - p1) / 2);
                parts[0] = rem.slice(0, p1).join(' '); parts[1] = rem.slice(p1, p1 + p2).join(' ');
                parts[2] = rem.slice(p1 + p2).join(' '); parts[3] = last;
            }
        }

        const showPart = (text, delay, duration) => {
            if (!text) return;
            setTimeout(() => {
                const el = document.createElement('div'); el.className = 'heart-premium-text';
                el.innerHTML = renderMessageWithEmotesHTML(this._wrapText(text, 5), context.emotes || {});
                document.body.appendChild(el);
                el.style.animation = "hvn-couple-fadeIn 0.5s forwards";
                setTimeout(() => {
                    el.style.animation = "hvn-couple-fadeOut 0.5s forwards";
                    setTimeout(() => el.remove(), 500);
                }, duration - 500);
            }, delay);
        };

        showPart(parts[0], 0, 4000);
        showPart(parts[1], 4000, 3500);
        showPart(parts[2], 7500, 2800);
        showPart(parts[3], 10300, 1000);

        setTimeout(() => {
            overlay.classList.add('visible');
            if (backdrop) backdrop.classList.add('visible');
        }, 100);

        const startEmojiTime = 11000;
        const endEmojiTime = 18000;
        const finalCleanupTime = 18000;

        const ranges = [[0x1F600, 0x1F64F], [0x1F9D1, 0x1F9D1], [0x2764, 0x2764], [0x1F493, 0x1F49F], [0x1F466, 0x1F469], [0x1F48B, 0x1F48B]];
        const getRandom = (ranges) => {
            let total = ranges.reduce((acc, r) => acc + (r[1] - r[0] + 1), 0);
            let rIdx = Math.floor(Math.random() * total);
            for (let r of ranges) {
                let size = r[1] - r[0] + 1;
                if (rIdx < size) return String.fromCodePoint(r[0] + rIdx);
                rIdx -= size;
            }
            return "❤️";
        };

        const delays = [1000, 300, 700];
        let delayIdx = 0, currentTime = startEmojiTime, emojiCounter = 0, lastWrapper = null;

        while (currentTime < endEmojiTime) {
            const time = currentTime;
            const currentCount = ++emojiCounter;
            setTimeout(() => {
                const prev = lastWrapper;
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `position:absolute; left:${Math.random() * 30 + 35}%; top:${Math.random() * 30 + 35}%; transform:translate(-50%, -50%) rotate(${Math.random() * 60 - 30}deg); z-index:15; display:flex; justify-content:center; align-items:center; width:100rem; height:100rem;`;
                const em = document.createElement('div');
                em.className = 'heart-dreamy-emoji';
                em.innerHTML = getRandom(ranges);
                wrapper.appendChild(em);
                emojiContainer.appendChild(wrapper);
                lastWrapper = wrapper;
                if (window.twemoji) twemoji.parse(wrapper);
                if (prev) setTimeout(() => { if (prev.parentNode) prev.remove(); }, 100);
                if ((currentCount - 1) % 3 === 0) {
                    flash.style.transition = 'none'; flash.style.opacity = '0.3';
                    setTimeout(() => { flash.style.transition = 'opacity 0.5s'; flash.style.opacity = '0'; }, 100);
                }
                setTimeout(() => { if (wrapper.parentNode) wrapper.remove(); }, 2000);
            }, time);
            currentTime += delays[delayIdx % delays.length];
            delayIdx++;
        }

        return new Promise(resolve => {
            setTimeout(() => {
                ov.style.transition = 'opacity 1s';
                ov.style.opacity = '0';
                setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 1000);
            }, finalCleanupTime);
        });
    }

    _runVergil(context) {
        const id = 'void-overlay'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.innerHTML = '<div id="void-backdrop"></div><div id="void-slashes"></div>'; document.body.appendChild(ov);
        const slashC = document.getElementById('void-slashes'); document.getElementById('void-backdrop').style.opacity = 1;
        const slashes = [];
        for (let i = 0; i < 30; i++) {
            const s = document.createElement('div'); s.className = 'void-slash';
            s.style.cssText = `position:absolute; top:${10 + Math.random() * 80}%; left:${10 + Math.random() * 80}%; height:${1 + Math.random() * 49}px; --rot:${Math.random() * 360}deg; z-index:${200 - i}; animation:hvn-vergil-slashEnter 0.2s forwards ${i * 0.02}s;`;
            slashC.appendChild(s); slashes.push(s);
        }
        return new Promise(resolve => {
            setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 19000);
            setTimeout(() => slashes.forEach(s => s.style.animation = `hvn-vergil-slashTremble ${0.05 + Math.random() * 0.1}s infinite`), 5200);
            setTimeout(() => {
                slashes.forEach(s => { s.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => s.remove(), 1000); });
                this._createVergilShards(ov); document.getElementById('void-backdrop').style.opacity = 0;
                setTimeout(() => {
                    let msg = context.message || ""; if (msg.startsWith("버질")) msg = msg.substring(2).trim();
                    if (msg) {
                        const txt = document.createElement('div'); txt.className = 'vergil-text';
                        txt.innerHTML = renderMessageWithEmotesHTML(msg, context.emotes || {}); document.body.appendChild(txt);
                        setTimeout(() => { txt.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => txt.remove(), 1000); }, 7000);
                    }
                }, 3800);
            }, 6200);
        });
    }

    _runDolphin(context) {
        const isRare = Math.random() < 0.5;
        const id = 'dolphin-overlay-root'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483647; pointer-events:none; transition:opacity 0.5s;";
        ov.innerHTML = `<div id="dolphin-overlay" class="visible ${isRare ? 'event-rare' : 'event-normal'}"><div class="dolphin-light dolphin-light-left"></div><div class="dolphin-light dolphin-light-right"></div><div class="dolphin-sea-bottom"><div class="sea-wave"></div></div></div>`;
        document.body.appendChild(ov);
        const overlayC = ov.querySelector('#dolphin-overlay');

        if (!document.getElementById('rainbow-filter-style')) {
            const s = document.createElement('style'); s.id = 'rainbow-filter-style';
            s.innerHTML = `@keyframes rainbow-filter { 0% { filter: hue-rotate(0deg) brightness(1.5) saturate(200%); } 100% { filter: hue-rotate(360deg) brightness(1.5) saturate(200%); } }`;
            document.head.appendChild(s);
        }

        // 1. Surfer
        const surfingEmojis = ["🏄", "🏄‍♂️", "🏄‍♀️"];
        const randomSurfer = surfingEmojis[Math.floor(Math.random() * surfingEmojis.length)];
        this._spawnActor(overlayC, 'surfer-actor', randomSurfer, {
            duration: 21000,
            nametag: (context.nickname || ""),
            nameColor: (context.color || "#ffffff")
        });

        // 2. Lead Dolphin
        setTimeout(() => {
            const dolphinEl = this._spawnActor(overlayC, 'lead-dolphin', "🐬", {
                duration: 15000
            });
            if (dolphinEl) this._animateWildBounce(dolphinEl, 14000);
        }, 6000);

        // 3. Sea Jumpers
        const seaCreatures = ["🐬", "🦈", "🐋", "🐳", "🐡", "🐠", "🐟", "🧜‍♀️", "🧜"];
        let accDelay = 0;
        for (let i = 0; i < 30; i++) {
            accDelay += (500 + Math.random() * 500);
            setTimeout(() => {
                const fromLeft = (i % 2 === 0);
                const isWildSpin = Math.random() < 0.3;
                let sr, er;
                if (isWildSpin) {
                    const spinAmount = 360 + Math.random() * 360;
                    const direction = Math.random() < 0.5 ? 1 : -1;
                    sr = fromLeft ? `${-45 * direction}deg` : `${45 * direction}deg`;
                    er = fromLeft ? `${spinAmount * direction}deg` : `${-spinAmount * direction}deg`;
                } else {
                    sr = fromLeft ? '-45deg' : '45deg';
                    er = fromLeft ? '45deg' : '-45deg';
                }
                const sc = fromLeft ? '-1' : '1';
                const styles = { '--sx': fromLeft ? '-10vw' : '110vw', '--ex': fromLeft ? '110vw' : '-10vw', '--sr': sr, '--er': er, '--sc': sc };
                this._spawnActor(overlayC, 'sea-jump', seaCreatures[Math.floor(Math.random() * seaCreatures.length)], { duration: 4000, styles });
            }, accDelay);
        }
        const extras = ["🦞", "🦀", "🦑", "🐙", "🦐", "🦪"];
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                this._spawnActor(overlayC, 'sea-extra', extras[Math.floor(Math.random() * extras.length)], {
                    duration: 5000 + Math.random() * 3000, styles: { left: Math.random() * 95 + 'vw', bottom: '-10vh', '--x-end': (Math.random() * 30 - 15) + 'vw', '--y-end': -(20 + Math.random() * 25) + 'vh', '--r-start': (Math.random() * 60 - 30) + 'deg', '--r-end': (Math.random() * 90 - 45) + 'deg' }
                });
            }, Math.random() * 19000);
        }
        let msg = context.message || ""; if (msg.startsWith("돌핀")) msg = msg.substring(2).trim();
        if (msg) {
            setTimeout(() => {
                const txt = document.createElement('div'); txt.className = 'dolphin-text';
                txt.innerHTML = renderMessageWithEmotesHTML(this._wrapText(msg, 25, "<br>"), context.emotes || {});
                overlayC.appendChild(txt);
            }, 6000);
        }
        return new Promise(resolve => {
            setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 2000); }, 21000);
        });
    }

    _genericSkullLikeEffect(overlayId, kw, styleClass, emojiClass, context) {
        const overlay = document.getElementById(overlayId); if (!overlay) return Promise.resolve();
        const parts = this._parseMessage(context.message, kw);
        this._showFloatingText(parts.rest, 0, 3700, styleClass, context.emotes);
        this._showFloatingText(parts.last, 3600, 700, styleClass, context.emotes);
        return new Promise(resolve => {
            setTimeout(() => {
                overlay.classList.add('visible');
                const emoji = overlay.querySelector('.' + emojiClass);
                let active = true;
                const glitch = () => { if (!active) return; void emoji.offsetWidth; emoji.classList.add('glitching'); setTimeout(() => { emoji.classList.remove('glitching'); if (active) setTimeout(glitch, 260 + Math.random() * 780); }, 200); };
                glitch();
                setTimeout(() => { active = false; overlay.classList.remove('visible'); resolve(); }, 8000);
            }, 4000);
        });
    }

    _showFloatingText(text, delay, duration, styleClass, emotes) {
        if (!text) return;
        setTimeout(() => {
            const el = document.createElement('div'); el.className = `visual-center-text ${styleClass}`;
            el.innerHTML = renderMessageWithEmotesHTML(this._wrapText(text), emotes || {});
            document.body.appendChild(el);
            el.style.animation = "hvn-skull-fadeIn 0.2s forwards";
            setTimeout(() => { el.style.animation = "hvn-skull-fadeOut 0.2s forwards"; setTimeout(() => el.remove(), 200); }, duration - 200);
        }, delay);
    }

    _showFloatingTextSimple(text, delay, duration, parent, emotes) {
        if (!text) return;
        setTimeout(() => {
            const el = document.createElement('div'); el.className = 'heart-dreamy-text';
            el.innerHTML = renderMessageWithEmotesHTML(text, emotes || {});
            parent.appendChild(el);
            el.style.animation = "hvn-heart-fadeIn 0.5s forwards";
            setTimeout(() => { el.style.animation = "hvn-heart-fadeOut 0.5s forwards"; setTimeout(() => el.remove(), 500); }, duration - 500);
        }, delay);
    }

    _parseMessage(msg, kw) {
        let display = (msg || "").trim(); if (display.startsWith(kw)) display = display.substring(kw.length).trim();
        const words = display.split(/\s+/).filter(w => w.length > 0);
        let last = "", rest = ""; if (words.length > 1) { last = words.pop(); rest = words.join(' '); } else if (words.length === 1) { last = words[0]; }
        return { last, rest };
    }

    _wrapText(text, limit = 20, separator = '<br>') {
        const words = text.split(' '); let lines = [], cur = words[0] || "";
        for (let i = 1; i < words.length; i++) { if ((cur + " " + words[i]).length <= limit) cur += " " + words[i]; else { lines.push(cur); cur = words[i]; } }
        if (cur) lines.push(cur); return lines.join(separator);
    }

    _splitMessageIntoParts(msg, count) {
        const words = msg.split(' ').filter(w => w.length > 0); let parts = new Array(count).fill("");
        if (words.length === 0) return parts; if (words.length === 1) { parts[count - 1] = words[0]; return parts; }
        const last = words.pop(); const rem = words;
        if (rem.length === 1) { parts[0] = parts[1] = parts[2] = rem[0]; parts[3] = last; }
        else if (rem.length === 2) { parts[0] = parts[1] = rem[0]; parts[2] = rem[1]; parts[3] = last; }
        else { const p1 = Math.ceil(rem.length / 3); const p2 = Math.ceil((rem.length - p1) / 2); parts[0] = rem.slice(0, p1).join(' '); parts[1] = rem.slice(p1, p1 + p2).join(' '); parts[2] = rem.slice(p1 + p2).join(' '); parts[3] = last; }
        return parts;
    }

    _runEmojiExplosion(container, flash) {
        const ranges = [[0x1F600, 0x1F64F], [0x2764, 0x2764]]; let count = 0;
        const interval = setInterval(() => {
            count++; const el = document.createElement('div');
            const code = ranges[0][0] + Math.floor(Math.random() * 50);
            el.innerHTML = String.fromCodePoint(code);
            el.className = 'heart-dreamy-emoji';
            el.style.cssText = `position:absolute; left:${35 + Math.random() * 30}%; top:${35 + Math.random() * 30}%; font-size:5rem; visibility:visible !important; opacity:1 !important; z-index:200; font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif !important;`;
            container.appendChild(el);
            if (window.twemoji) twemoji.parse(el);
            setTimeout(() => { if (el.parentNode) el.remove(); }, 2000);
            if (count % 3 === 0 && flash) { flash.style.opacity = '0.3'; setTimeout(() => flash.style.opacity = '0', 100); }
            if (count > 30) clearInterval(interval);
        }, 200);
    }

    _createVergilShards(parent) {
        for (let i = 0; i < 12; i++) {
            const row = Math.floor(i / 4), col = i % 4, w = window.innerWidth / 4, h = window.innerHeight / 3;
            const cx = (col * w) + (w * 0.2) + (Math.random() * w * 0.6), cy = (row * h) + (h * 0.2) + (Math.random() * h * 0.6);
            for (let j = 0; j < 20; j++) {
                const shard = document.createElement('div'); shard.className = 'void-shard';
                const ang = Math.random() * 360, d = 200 + Math.random() * 400;
                shard.style.cssText = `left:${cx + Math.random() * 40 - 20}px; top:${cy + Math.random() * 40 - 20}px; --tx:${Math.cos(ang * Math.PI / 180) * d}px; --ty:${Math.sin(ang * Math.PI / 180) * d}px; --rot:${Math.random() * 360}deg;`;
                const dur = 1.5 + Math.random() * 2; shard.style.animation = `hvn-vergil-shardFly ${dur}s ease-out forwards`;
                parent.appendChild(shard); setTimeout(() => shard.remove(), dur * 1000);
            }
        }
    }

    _animateWildBounce(el, totalDuration) {
        const startTime = Date.now();
        let currentRotation = 0;
        const bounce = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed >= totalDuration) return;
            const x = 10 + Math.random() * 80;
            const y = 10 + Math.random() * 80;
            const rotateDelta = 360 + Math.random() * 6040;
            currentRotation -= rotateDelta;
            const speed = 600;
            const rotateSpeed = 1200;

            // [FIX] Apply POSITION to el, but ROTATION to actor-emoji inner element to fix axis issue
            const inner = el.querySelector('.actor-emoji');
            el.style.transition = `top ${speed}ms ease-in-out, left ${speed}ms ease-in-out`;
            el.style.left = `${x}%`;
            el.style.top = `${y}%`;

            if (inner) {
                inner.style.transition = `transform ${rotateSpeed}ms cubic-bezier(0.1, 0.5, 0.2, 1)`;
                inner.style.transform = `rotate(${currentRotation}deg)`;
            }
            // Keep parent scaled
            el.style.transform = `translate(-50%, -50%) scale(1.2)`;

            setTimeout(bounce, speed + 400 + Math.random() * 1000);
        };
        el.style.left = '50%'; el.style.top = '50%'; el.style.transform = 'translate(-50%, -50%) scale(0)';
        setTimeout(() => {
            el.style.transition = "transform 0.5s";
            el.style.transform = 'translate(-50%, -50%) scale(1.2)';
            setTimeout(bounce, 500);
        }, 100);
    }

    _spawnActor(parent, cls, emoji, opts) {
        const el = document.createElement('div'); el.className = cls;
        el.style.opacity = '1';
        el.style.visibility = 'visible';

        if (opts.nametag) {
            el.style.display = 'inline-flex'; el.style.flexDirection = 'column'; el.style.alignItems = 'center'; el.style.justifyContent = 'flex-end';
            const nameTag = document.createElement('div');
            nameTag.className = 'name-box';
            nameTag.innerHTML = `<span class="user-name">${opts.nametag}</span>`;

            // Re-adjust nametag scale relative to huge emoji
            nameTag.style.fontSize = '0.15em'; nameTag.style.width = 'max-content'; nameTag.style.background = opts.nameColor || '#ffffff';
            nameTag.style.borderColor = opts.nameColor || '#ffffff'; nameTag.style.marginBottom = '2px'; nameTag.style.padding = '0.10em 0.2em';
            nameTag.style.zIndex = '5';
            el.appendChild(nameTag);
        }

        const inner = document.createElement('div'); inner.className = 'actor-emoji';
        inner.innerHTML = emoji; inner.style.lineHeight = '1';
        inner.style.visibility = 'visible'; inner.style.opacity = '1';
        el.appendChild(inner);
        if (window.twemoji) twemoji.parse(inner);

        el.style.fontFamily = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
        el.style.animationDuration = opts.duration + 'ms';

        if (opts.styles) {
            Object.keys(opts.styles).forEach(key => {
                if (key.startsWith('--')) el.style.setProperty(key, opts.styles[key]);
                else el.style[key] = opts.styles[key];
            });
        }

        if (cls !== 'lead-dolphin') {
            el.style.zIndex = Math.floor(2147483640 + Math.random() * 10);
        }

        parent.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.remove(); }, opts.duration + 2000);
        return el;
    }
}

// ==========================================
// [Execution & Init]
// ==========================================
const appConfig = new ConfigManager();
const visualDirector = new VisualDirector(appConfig);

const network = new ChzzkGateway(appConfig, (msgData) => {
    // 1. 유저 정보 구성 (레거시 브릿지)
    const userstate = {
        'display-name': msgData.nickname,
        'username': msgData.nickname,
        'color': msgData.color,
        'user-id': msgData.uid,
        'emotes_chzzk': msgData.emojis,
        'chzzk_badges': msgData.badges.map(b => ({ url: b.imageUrl, title: b.title }))
    };
    if (msgData.isStreamer) userstate.badges = { broadcaster: '1' };
    userstate['message-type'] = 'chat'; // [FIX] Explicitly set for showMessage

    // 2. 시각 효과 트리거 확인 (강화: 매핑 시스템 적용)
    const visualMap = {
        '해골': 'skull',
        '우쇼': 'usho',
        '커플': 'couple',
        '하트': 'heart',
        '버질': 'vergil',
        '돌핀': 'dolphin'
    };
    const trimmedMsg = msgData.message.trim();
    const foundKeyword = Object.keys(visualMap).find(k => trimmedMsg.startsWith(k) || trimmedMsg.startsWith('!' + k));

    if (foundKeyword) {
        const effectType = visualMap[foundKeyword];
        // 시각 효과 트리거
        visualDirector.trigger(effectType, {
            message: msgData.message,
            emotes: msgData.emojis,
            nickname: msgData.nickname,
            color: msgData.color
        });
    } else {
        // 일반 채팅 렌더링 (시각 효과가 없을 때만 채팅 버블 표시)
        handleMessage('chzzk', userstate, msgData.message, false);
    }
});

// 자동 시작
network.connect();

// ==========================================
// [Helpers] Legacy & Utility Functions
// ==========================================
function updateSoundHive(config) {
    soundHive = {};
    const processItem = (item) => {
        if (typeof item === 'string') return `SFX/${item}`;
        else if (typeof item === 'object' && item !== null && item.src) return { ...item, src: `SFX/${item.src}` };
        return item;
    };
    for (const [key, value] of Object.entries(config)) {
        if (Array.isArray(value)) soundHive[key] = value.map(processItem);
        else soundHive[key] = processItem(value);
    }
}

function loadConfigs() {
    const defaultsSound = window.HIVE_SOUND_CONFIG || {};
    const defaultsVisual = window.HIVE_VISUAL_CONFIG || {};
    const savedSound = localStorage.getItem('HIVE_SOUND_CONFIG');
    const savedVisual = localStorage.getItem('HIVE_VISUAL_CONFIG');

    let activeSoundConfig = defaultsSound;
    if (savedSound) {
        try { activeSoundConfig = { ...defaultsSound, ...JSON.parse(savedSound) }; } catch (e) { }
    }
    updateSoundHive(activeSoundConfig);

    if (savedVisual) { try { visualConfig = { ...defaultsVisual, ...JSON.parse(savedVisual) }; } catch (e) { } }
    else visualConfig = defaultsVisual;
}
loadConfigs();

function playZergSound(input) {
    if (!soundEnabled) return Promise.resolve();
    let target = input;
    if (Array.isArray(target)) target = target[Math.floor(Math.random() * target.length)];
    if (!target) return Promise.resolve();
    let fileName, volume = 0.5;
    if (typeof target === 'object' && target !== null && target.src) { fileName = target.src; if (target.volume !== undefined) volume = target.volume; }
    else fileName = target;
    if (!fileName) return Promise.resolve();

    let finalUrl;
    try { finalUrl = new URL(fileName, window.location.href).href; } catch (e) { finalUrl = fileName; }

    return new Promise((resolve) => {
        const audio = new Audio(finalUrl);
        audio.volume = volume;
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
    });
}

function handleMessage(channel, userstate, message, fromSelf) {
    // showDebugLog(`HandleMsg: ${message.substring(0, 10)}...`); 
    // Filter logic
    // if (chatFilter.test(message)) return; // chatFilter가 없다면 주석처리

    let chan = getChan(channel);
    let name = userstate['display-name'] || userstate.username;
    userstate.name = name;
    showMessage({ chan, type: userstate['message-type'], message, data: userstate });
}

function getChan(channel = '') { return channel.replace(/^#/, ''); }

const pSBC = (p, c0, c1, l) => {
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    if (!this.pSBCr) this.pSBCr = (d) => {
        let n = d.length, x = {};
        if (n > 9) { [r, g, b, a] = d = d.split(","), n = d.length; if (n < 3 || n > 4) return null; x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1 }
        else { if (n == 8 || n == 6 || n < 4) return null; if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : ""); d = i(d.slice(1), 16); if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000; else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1 } return x
    };
    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}

function showMessage({ chan, type, message = '', data = {}, timeout = 10000, attribs = {} } = {}) {
    const originalMessage = message;
    const normOriginal = originalMessage.normalize('NFC').trim();
    let bubbleMessage = message.replace(/(^|\s)![\S]+/g, "").replace(/\s+/g, " ").trim();
    message = bubbleMessage;

    let nameBox = document.createElement('div'), chatBox = document.createElement('div');
    let chatLine_ = document.createElement('div'), chatLineBg = document.createElement('div');
    let chatLineInner = document.createElement('div'), chatLine_tail = document.createElement('div');
    let chatUser = document.createElement('div'), badgeEle = document.createElement('span');
    let nameEle = document.createElement('span'), messageEle = document.createElement('span');

    chatBox.classList.add('chat-box'); chatLine_.classList.add('chat-line'); chatLineBg.classList.add('chat-line-bg');
    chatLineInner.classList.add('chat-line-inner'); chatLine_tail.classList.add('chat-line-inner-tail'); chatUser.classList.add('chat-user');

    let random_color;
    const safePSBC = (p, c0, c1, l) => { if (typeof pSBC === 'function') return pSBC(p, c0, c1, l); return null; };
    let userColor = data.color;
    if (userColor && userColor !== "#000000" && userColor.startsWith("#")) random_color = userColor;
    else if (data.color === "#000000") { random_color = "#000000"; nameEle.style.color = "#ffffff"; }
    else { if (typeof randomColor === 'function') random_color = randomColor({ luminosity: 'light', seed: data['user-id'] }); else random_color = '#5555ff'; }

    // [SOUND ONLY TRIGGER] - Visuals are handled by VisualDirector separately
    let allMatches = [];
    Object.keys(soundHive).forEach(keyword => {
        if (visualConfig[keyword]) return; // Skip visual keys
        const normKey = keyword.normalize('NFC');
        let searchPos = 0, index;
        while ((index = normOriginal.indexOf(normKey, searchPos)) !== -1) {
            allMatches.push({ startIndex: index, endIndex: index + normKey.length, length: normKey.length, sound: soundHive[keyword], keyword: normKey });
            searchPos = index + 1;
        }
    });
    allMatches.sort((a, b) => (a.startIndex === b.startIndex) ? b.length - a.length : a.startIndex - b.startIndex);
    let sequence = [], lastEnd = 0;
    for (let match of allMatches) { if (match.startIndex >= lastEnd) { sequence.push(match); lastEnd = match.endIndex; } }
    if (sequence.length > 0 && soundEnabled) {
        (async () => { for (let item of sequence.slice(0, 5)) { await playZergSound(item.sound); } })();
    }

    chatLineInner.style.borderColor = random_color;
    let bgColor = safePSBC(-0.5, random_color, false, true) || random_color;
    chatLineInner.style.background = bgColor; chatLineInner.style.color = "#ffffff";
    chatBox.appendChild(chatLine_); chatLine_.appendChild(chatLineBg); chatLine_.appendChild(chatUser); chatLineBg.appendChild(chatLineInner); chatLineInner.appendChild(chatLine_tail);
    if (chan) chatBox.setAttribute('channel', chan); Object.keys(attribs).forEach(key => chatBox.setAttribute(key, attribs[key]));

    if (type === 'chat') {
        if (('badges' in data && data.badges) || (data.chzzk_badges && data.chzzk_badges.length > 0)) {
            badgeEle.classList.add('badges');
            if (data.badges && data.badges.broadcaster) { let ele = document.createElement('img'); ele.src = 'https://ssl.pstatic.net/static/nng/glive/icon/streamer.png'; ele.classList.add('badge'); badgeEle.appendChild(ele); }
            if (data.chzzk_badges) { data.chzzk_badges.forEach(b => { let ele = document.createElement('img'); ele.src = b.url; ele.classList.add('badge'); badgeEle.appendChild(ele); }); }
        }
        nameBox.classList.add('name-box'); nameEle.classList.add('user-name'); nameEle.innerText = data.name;
        nameBox.style.background = random_color; messageEle.classList.add('message');
    }

    boxPos = boxPos % 100;
    chatBox.style.left = boxPos + "%";

    // Animation Logic (Restored from backup)
    if (originalMessage.includes("ㅜㅑ")) {
        random_color = "pink";
        chatLineInner.style.borderColor = random_color;
        chatLineInner.style.background = "hotpink";
        nameBox.style.background = random_color;
        nameBox.style.borderColor = random_color;
        nameEle.style.color = "black";
        messageEle.style.color = "white";
        messageEle.style.filter = "blur(3px)";
        badgeEle.style.filter = "blur(3px)";
        nameEle.style.filter = "blur(4px)";
    }
    else if (["x", "f", "rip"].includes(originalMessage.toLowerCase()) || (originalMessage.startsWith("-") && originalMessage.endsWith("-") && originalMessage.length == 3)) {
        message = message.toUpperCase().replace("RIP", "R.I.P.");
        random_color = "#595959";
        chatLineInner.style.borderColor = "black";
        chatLineInner.style.background = random_color;
        chatLineInner.style.color = "#ffffff";
        nameBox.style.background = "black";
        nameBox.style.borderColor = "black";
        nameBox.style.borderRadius = "10px";
        chatLineInner.style.borderWidth = "10px";
        nameEle.style.color = "#ffffff";
        chatLineInner.style.textAlign = "center";
        messageEle.style.fontSize = "3.0em";
    }

    if (includesAny(["똥", "츠지모토", "후지오카", "토쿠다", "야스노리", "스즈키", "이치하라"], originalMessage)) {
        chatLineInner.style.color = "#c28f38";
        chatLineInner.style.textShadow = "0 0 10px #946f2f";
    }
    else if (includesAny(["흑화", "흑"], originalMessage)) {
        messageEle.style.textShadow = "0px 0px 30px #000000, 0 0px 10px #000000, 0 0px 10px #000000";
        messageEle.style.color = "grey";
    }

    if (originalMessage.includes("빛")) { chatLineInner.style.animationName = "chat-hvn-glow"; chatLineInner.style.animationIterationCount = 10; chatLineInner.style.animationDuration = "1s"; }
    else if (includesAny(["무지개", "겜성", "led", "rgb"], originalMessage.toLowerCase())) { chatLineInner.style.animationName = "chat-hvn-rainbow"; chatLineInner.style.animationIterationCount = 10; chatLineInner.style.animationDuration = "2.5s"; }

    let finalMessage = handleEmotes(chan, data.emotes_chzzk || {}, message);
    addEmoteDOM(messageEle, finalMessage);

    if (message.length <= 5) { messageEle.style.fontSize = 2.6 - message.length / 3 + "em"; messageEle.style.position = "middle"; messageEle.style.textAlign = "center"; chatBox.style.left = boxPos + Math.random() * 5 % 10 + "%"; }

    let usesSlot = true;
    if (originalMessage.includes("ㅂㄷㅂㄷ")) {
        messageEle.style.animationName = "chat-hvn-vibrate-laugh";
        messageEle.style.animationIterationCount = 30;
        messageEle.style.animationDuration = "0.5s";
        messageEle.style.animationTimingFunction = "linear";
    }
    else if (normOriginal.includes("유격")) {
        usesSlot = false;
        while (messageEle.firstChild) messageEle.removeChild(messageEle.firstChild);
        addEmoteDOM(messageEle, handleEmotes(chan, data.emotes_chzzk || {}, message));
        chatBox.style.width = "auto"; messageEle.style.whiteSpace = "nowrap"; chatBox.style.left = "0"; chatBox.style.top = "0"; chatBox.style.bottom = "auto"; chatBox.style.transform = "none";
        chatBox.style.animation = "chat-hvn-slideDiagonal 3s linear forwards"; messageEle.style.fontSize = "2.5em";
        timeout = 3500;
    }
    else if (includesAny(["조이고"], message) || (message.startsWith(")") && message.endsWith("("))) {
        messageEle.style.animation = "chat-hvn-shrinkX 3s linear forwards";
    }
    else if (normOriginal.includes("압축")) {
        messageEle.style.animation = "chat-hvn-squeeze 2s linear forwards";
        messageEle.style.display = "inline-block"; messageEle.style.whiteSpace = "nowrap";
        chatLineInner.style.textAlign = "center";
    }
    else if (startsWithAny(["자라나라"], message)) {
        messageEle.style.animation = "chat-hvn-growY 1s linear infinite";
    }
    else if (message.includes("))")) {
        messageEle.style.fontSize = "3em"; messageEle.style.textAlign = "center";
        messageEle.style.animation = "chat-hvn-hipDance 1.8s linear infinite";
    }
    else if (message.includes("((")) {
        messageEle.style.fontSize = "3em"; messageEle.style.textAlign = "center";
        messageEle.style.animation = "chat-hvn-hipDanceReverse 1.8s linear infinite";
    }
    else if (message.includes("나죽어")) {
        chatBox.style.animation = "chat-hvn-death 3s linear forwards";
        timeout = 3000;
    }
    else if (message.includes("흡!") || message.endsWith("흡")) {
        chatBox.style.animation = "chat-hvn-fadeOutFall 6s forwards";
        timeout = 6000;
    }
    else if (message.startsWith("성불")) {
        chatBox.style.animation = "chat-hvn-toHeaven 5s forwards";
    }
    else if (["갔냐?", "갔냐", "ㄱㄴ?", "ㄱㄴㄱㄴ?", "ㄱㄴ", "ㄱㄴㄱㄴ"].includes(message)) {
        chatBox.style.animation = "chat-hvn-scout 4s linear forwards";
    }
    else if (includesAny(["덜렁덜렁", "ㄷㄹㄷㄹ", "출렁", "덜렁"], message)) {
        chatBox.style.animation = "chat-hvn-balls 2s linear forwards";
        timeout = 3000;
    }
    else if (message.endsWith("~")) {
        chatBox.style.animation = `chat-hvn-wave 1s linear ${Math.max(1, (message.match(/~/g) || []).length)}`;
    }
    else if (message.startsWith("앗") || message.includes("엌")) {
        chatBox.style.animation = "chat-hvn-upDown .4s forwards";
    }
    else if (includesAny(["맞음", "맞아요", "ㅔ", "ㅖ", "ㅇㅇ", "ㅇㅋ"], message) || message == "ㄹㅇ") {
        chatBox.style.animation = "chat-hvn-yes .6s 2";
    }
    else if (message.includes("?")) {
        chatBox.style.animation = "chat-hvn-shake4 .3s linear";
    }
    else if (includesAny(["안녕", "👋"], message) || endsWithAny(["하", "바"], message)) {
        chatBox.style.animation = "chat-hvn-shake4 .3s linear 5";
        messageEle.style.position = "middle";
    }
    else if (["해", "명", "극", "나", "락"].includes(message) || message.endsWith("!")) {
        chatBox.style.animation = "chat-hvn-shake3 .4s linear 50";
        messageEle.style.position = "middle";
    }
    else if (message.includes("ㄷㄷ")) {
        chatBox.style.animation = `chat-hvn-fear .3s linear ${Math.max(1, (message.match(/ㄷ/g) || []).length)}`;
    }
    else if (includesAny(["ㅠㅠ", "ㅠㅜ", "ㅜㅠ", "ㅜㅜ"], message)) {
        chatBox.style.animation = "chat-hvn-crying 1.5s linear 5";
    }
    else if (message.includes("ㄴㄴ")) {
        chatBox.style.animation = `chat-hvn-nope 1s linear ${Math.max(1, (message.match(/ㄴ/g) || []).length)}`;
    }
    else if (message.includes("ㅋㅋ") || message.includes("ㅎㅎ")) {
        chatBox.style.animation = `chat-hvn-vibrate-laugh 0.5s linear ${Math.max(1, (message.match(/[ㅋㅎ]/g) || []).length)}`;
    }
    else if (message.includes("ㄱㄱ")) {
        chatBox.style.animation = `chat-hvn-walking 1s linear ${Math.max(1, (message.match(/ㄱ/g) || []).length)}`;
    }
    else if (message.includes("헤으응")) {
        chatBox.style.animation = "chat-hvn-shrink 2s linear forwards";
        chatLineInner.style.animation = "chat-hvn-shy 2s linear forwards";
    }
    else if (["ㄴㅇㄱ", "ㅇ0ㅇ", 'oOo', 'o0o'].includes(message)) {
        messageEle.style.fontSize = "2.6em";
        chatBox.style.animation = "chat-hvn-surprised 0.5s ease-in forwards";
    }
    else if (includesAny(["...", ";;"], message)) {
        chatBox.style.animation = "chat-hvn-fall 10s linear forwards";
    }
    else if (message == "히오스" || message == "짜잔") {
        chatBox.style.animation = "chat-hvn-Hots 1s linear forwards";
        timeout = 3000;
    }
    else if (message.includes("둠칫둠칫")) {
        messageEle.style.fontSize = "2.2em";
        messageEle.style.textAlign = "center";
        chatBox.style.animation = "chat-hvn-beat 0.5s linear 20";
        messageEle.style.animation = "chat-hvn-beat 0.5s linear 20";
    }
    else if (normOriginal.includes("제발") || message == "🤣") {
        nameBox.style.animation = "chat-hvn-shake3 0.3s linear 50";
        messageEle.style.animation = "chat-hvn-shake2 0.2s linear 40";
    }
    else if (message == "틀") {
        messageEle.innerText = "-틀-";
        nameBox.style.animation = "chat-hvn-shake3 0.4s linear 40";
        messageEle.style.animation = "chat-hvn-shake3 0.4s linear 40";
        chatBox.style.animation = "chat-hvn-fear 6s linear 10";
    }
    else if (["지나갑니다", "실례합니다", "수레"].includes(message) || includesAny(["가즈아", "드가자"], message) || message.endsWith("ㅏㅏ")) {
        usesSlot = false;
        const fromLeft = Math.random() >= 0.5;
        chatBox.style.left = fromLeft ? "-350px" : "auto";
        chatBox.style.right = fromLeft ? "auto" : "-350px";
        chatBox.style.animation = `${fromLeft ? 'chat-hvn-passThroughLtoR' : 'chat-hvn-passThroughRtoL'} 3.5s ease-in forwards`;
        timeout = 3000;
    }
    else if (message == "나락" || message == "떡락" || startsWithAny(["!나락", "!떡락"], normOriginal)) {
        usesSlot = false;
        chatBox.style.width = "auto"; messageEle.style.whiteSpace = "nowrap";
        chatBox.style.left = Math.random() * 90 + "%"; chatBox.style.bottom = "1300px";
        chatBox.style.animation = "chat-hvn-passThrough2 3s cubic-bezier(0.31, 0.44, 0.445, 1.65) forwards";
        messageEle.style.fontSize = "2.5em"; timeout = 3500;
    }
    else if (message == "극락" || message == "떡상" || message === "🦇" || startsWithAny(["!극락", "!떡상"], message.trimStart())) {
        usesSlot = false;
        chatBox.style.width = "auto"; messageEle.style.whiteSpace = "nowrap";
        chatBox.style.left = Math.random() * 90 + "%"; chatBox.style.bottom = "-500px";
        chatBox.style.animation = "chat-hvn-passThrough3 3s cubic-bezier(0.31, 0.44, 0.445, 1.65) forwards";
        messageEle.style.fontSize = "2.5em"; timeout = 3500;
    }

    if (usesSlot) { boxPos += 20; mainArray.push(chatBox); }

    nameBox.appendChild(badgeEle); nameBox.appendChild(nameEle); chatLineInner.appendChild(nameBox); chatLineInner.appendChild(messageEle);
    chatEle.appendChild(chatBox);
    requestAnimationFrame(() => chatBox.classList.add('visible'));
    if (mainArray.length > 5) { let cb = mainArray.shift(); if (cb) cb.classList.remove('visible'); }
    if (timeout) setTimeout(() => { if (chatBox.parentElement) { chatBox.classList.remove('visible'); setTimeout(() => chatEle.removeChild(chatBox), 1000); } }, timeout);
}

function handleEmotes(channel, emotes, message) {
    let parts = [], regex = /\{:?[^:{} ]+:?\}/g, lastIndex = 0, match;
    while ((match = regex.exec(message)) !== null) {
        if (match.index > lastIndex) parts.push(message.substring(lastIndex, match.index));
        const emoteId = match[0].replace(/[\{:?\}]/g, "");
        const emoteData = emotes[emoteId];
        let emoteUrl = (emoteData && (typeof emoteData === 'string' ? emoteData : (emoteData.imageUrl || emoteData.url))) || null;
        if (emoteUrl) parts.push({ url: emoteUrl }); else parts.push(match[0]);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < message.length) parts.push(message.substring(lastIndex));
    return parts.length > 0 ? parts : [message];
}

function renderMessageWithEmotesHTML(message, emotes = {}) {
    if (!emotes || Object.keys(emotes).length === 0) return message;
    return message.replace(/\{:?[^:{} ]+:?\}/g, (match) => {
        const emoteId = match.replace(/[\{:?\}]/g, "");
        const d = emotes[emoteId];
        const url = (d && (typeof d === 'string' ? d : (d.imageUrl || d.url))) || null;
        return url ? `<img src="${url}" class="emote_chzzk_inline" style="height: 1.2em; vertical-align: middle; display: inline-block;" alt="${emoteId}">` : match;
    });
}

function addEmoteDOM(ele, data) {
    data.forEach(n => {
        if (typeof n === 'string') ele.appendChild(document.createTextNode(n));
        else if (typeof n === 'object' && n.url) { let img = document.createElement('img'); img.src = n.url; img.classList.add('emote_chzzk'); img.style.height = "1.2em"; img.style.verticalAlign = "middle"; ele.appendChild(img); }
    });
    if (window.twemoji) twemoji.parse(ele);
}

function includesAny(suffixes, string) { for (let s of suffixes) if (string.includes(s)) return true; return false; }
function endsWithAny(suffixes, string) { for (let s of suffixes) if (string.endsWith(s)) return true; return false; }
function startsWithAny(suffixes, string) { for (let s of suffixes) if (string.startsWith(s)) return true; return false; }