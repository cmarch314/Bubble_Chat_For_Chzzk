const idElement = document.getElementById('id');
// [Config Priority] 1. LocalStorage -> 2. Attribute -> 3. Fallback
let storedId = localStorage.getItem('CHZZK_CHANNEL_ID');
const attrId = idElement ? (idElement.getAttribute('twitchId') || idElement.getAttribute('chzzkHash')) : null;

if (!storedId && attrId) {
    localStorage.setItem('CHZZK_CHANNEL_ID', attrId);
    storedId = attrId;
}

const CHZZK_CHANNEL_ID = storedId || attrId;
const chatEle = document.getElementById('chat');

const twitchBadgeCache = { data: { global: {} } };
const bttvEmoteCache = { lastUpdated: 0, data: { global: [] }, urlTemplate: '//cdn.betterttv.net/emote/{{id}}/{{image}}' };

const chatFilters = [
    '\u0250-\u02AF', '\u02B0-\u02FF', '\u0300-\u036F', '\u0370-\u03FF',
    '\u0400-\u04FF', '\u0500-\u052F', '\u0530-\u1FFF', '\u2100-\u214F',
    '\u2500-\u257F', '\u2580-\u259F', '\u25A0-\u25FF', '\u2600-\u26FF', '\u2800-\u28FF'
];
const chatFilter = new RegExp(`[${chatFilters.join('')}]`);

let boxPos = 20;
let mainArray = [];
let soundEnabled = true;
let soundHive = {}; // Essential global
let visualConfig = {};

const configChannel = new BroadcastChannel('bubble_chat_control');
configChannel.onmessage = (event) => handleConfigCommand(event.data);

window.addEventListener('storage', (event) => {
    if (event.key === 'bubble_chat_cmd' && event.newValue) {
        try { handleConfigCommand(JSON.parse(event.newValue)); } catch (e) { }
    }
});

function handleConfigCommand(data) {
    const { type, enabled } = data;
    if (type === 'setSound') soundEnabled = enabled;
    else if (type === 'reload') location.reload();
    else if (type === 'setChannel' && data.channelId) {
        localStorage.setItem('CHZZK_CHANNEL_ID', data.channelId);
        location.reload();
    } else if (type === 'updateConfig') {
        if (data.soundConfig) updateSoundHive(data.soundConfig);
        if (data.visualConfig) visualConfig = data.visualConfig;
    }
}

function createSkullOverlay() {
    if (document.getElementById('skull-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'skull-overlay';
    overlay.innerHTML = '<div class="skull-emoji">☠️</div><div class="film-grain"></div>';
    document.body.appendChild(overlay);
}
createSkullOverlay();

function createHeartOverlay() {
    if (document.getElementById('heart-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'heart-overlay';
    overlay.innerHTML = '<div class="heart-emoji">❤️‍🩹</div>';
    document.body.appendChild(overlay);

    const flashback = document.createElement('div');
    flashback.id = 'flashback-overlay';
    document.body.appendChild(flashback);
}
createHeartOverlay();

const ScreenEffectRegistry = {
    skull: {
        soundKey: "해골",
        execute: (context = {}) => {
            const overlay = document.getElementById('skull-overlay');
            if (!overlay) return Promise.resolve();
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text skull-style';
            let displayMsg = (context.message || "").trim();
            if (displayMsg.startsWith("해골")) displayMsg = displayMsg.substring(2).trim();
            const words = displayMsg.split(' ');
            let lines = [], currentLine = words[0] || "";
            for (let i = 1; i < words.length; i++) {
                if ((currentLine + " " + words[i]).length <= 20) currentLine += " " + words[i];
                else { lines.push(currentLine); currentLine = words[i]; }
            }
            if (currentLine) lines.push(currentLine);
            centerMsgSnippet.innerHTML = lines.join('<br>');
            document.body.appendChild(centerMsgSnippet);
            return new Promise(resolve => {
                setTimeout(() => {
                    if (centerMsgSnippet) centerMsgSnippet.remove();
                    overlay.classList.add('visible');
                    setTimeout(() => { overlay.classList.remove('visible'); resolve(); }, 8000);
                }, 4000);
            });
        }
    },
    heart: {
        soundKey: "커플",
        execute: (context = {}) => {
            const flashback = document.getElementById('flashback-overlay');
            const overlay = document.getElementById('heart-overlay');
            if (!flashback || !overlay) return Promise.resolve();
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text heart-style';
            let displayMsg = (context.message || "").trim();
            if (displayMsg.startsWith("커플")) displayMsg = displayMsg.substring(2).trim();
            const words = displayMsg.split(' ');
            let lines = [], currentLine = words[0] || "";
            for (let i = 1; i < words.length; i++) {
                if ((currentLine + " " + words[i]).length <= 20) currentLine += " " + words[i];
                else { lines.push(currentLine); currentLine = words[i]; }
            }
            if (currentLine) lines.push(currentLine);
            centerMsgSnippet.innerHTML = lines.join('<br>');
            centerMsgSnippet.style.animation = "fadeIn 1s forwards";
            document.body.appendChild(centerMsgSnippet);
            return new Promise(resolve => {
                flashback.classList.add('visible');
                setTimeout(() => { centerMsgSnippet.style.animation = "fadeOut 1s forwards"; }, 10300);
                setTimeout(() => {
                    if (centerMsgSnippet) centerMsgSnippet.remove();
                    flashback.classList.remove('visible');
                    overlay.classList.add('visible');
                    const emojiContainer = overlay.querySelector('.heart-emoji');
                    const getRandomFromRanges = (ranges) => {
                        let total = 0; ranges.forEach(r => total += (r[1] - r[0] + 1));
                        let idx = Math.floor(Math.random() * total);
                        for (let r of ranges) {
                            let s = r[1] - r[0] + 1;
                            if (idx < s) return String.fromCodePoint(r[0] + idx);
                            idx -= s;
                        }
                        return String.fromCodePoint(ranges[0][0]);
                    };
                    const personRanges = [[0x1F600, 0x1F64F], [0x1F466, 0x1F480], [0x1F9DC, 0x1F9DF], [0x1F470, 0x1F478]];
                    const heartRanges = [[0x1F493, 0x1F49F], [0x2764, 0x2764], [0x1F9E1, 0x1F9E1], [0x1F90D, 0x1F90E], [0x1F48B, 0x1F48D]];
                    const p1 = getRandomFromRanges(personRanges), p2 = getRandomFromRanges(personRanges), h3 = getRandomFromRanges(heartRanges);
                    const update = (s) => {
                        const h = Math.floor(Math.random() * 360);
                        overlay.style.backgroundColor = `hsla(${h}, 100%, 70%, 0.3)`;
                        emojiContainer.classList.remove('grow-effect'); void emojiContainer.offsetWidth; emojiContainer.classList.add('grow-effect');
                        emojiContainer.style.fontSize = (s === 3) ? '13rem' : '20rem';
                        if (s === 0) emojiContainer.innerText = p1; else if (s === 1) emojiContainer.innerText = p2; else if (s === 2) emojiContainer.innerText = h3; else emojiContainer.innerText = `${p1}${h3}${p2}`;
                    };
                    update(0); setTimeout(() => update(1), 2250); setTimeout(() => update(2), 4500); setTimeout(() => update(3), 5625);
                    setTimeout(() => { overlay.classList.remove('visible'); resolve(); }, 9000);
                }, 11800);
            });
        }
    },
    vergil: {
        soundKey: "버질",
        execute: (context = {}) => {
            const id = 'void-overlay';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            ov.innerHTML = '<div id="void-backdrop"></div><div id="void-slashes"></div>';
            document.body.appendChild(ov);
            const backdrop = document.getElementById('void-backdrop'), slashC = document.getElementById('void-slashes');
            backdrop.style.opacity = 1;
            const slashes = [];
            for (let i = 0; i < 30; i++) {
                const s = document.createElement('div'); s.className = 'void-slash';
                s.style.cssText = `position:absolute; top:${10 + Math.random() * 80}%; left:${10 + Math.random() * 80}%; height:${1 + Math.random() * 49}px; --rot:${Math.random() * 360}deg; z-index:${200 - i}; animation:slashEnter 0.2s forwards ${i * 0.02}s;`;
                slashC.appendChild(s); slashes.push(s);
            }
            return new Promise(resolve => {
                setTimeout(() => { slashes.forEach(s => s.style.animation = `slashTremble ${0.05 + Math.random() * 0.1}s infinite`); }, 5200);
                setTimeout(() => {
                    slashes.forEach(s => { s.style.animation = "fadeOut 1s forwards"; setTimeout(() => s.remove(), 1000); });
                    for (let i = 0; i < 12; i++) {
                        const row = Math.floor(i / 4), col = i % 4, w = window.innerWidth / 4, h = window.innerHeight / 3;
                        const cx = (col * w) + (w * 0.2) + (Math.random() * w * 0.6), cy = (row * h) + (h * 0.2) + (Math.random() * h * 0.6);
                        for (let j = 0; j < 20; j++) {
                            const shard = document.createElement('div'); shard.className = 'void-shard';
                            const ang = Math.random() * 360, d = 200 + Math.random() * 400;
                            shard.style.cssText = `left:${cx + Math.random() * 40 - 20}px; top:${cy + Math.random() * 40 - 20}px; --tx:${Math.cos(ang * Math.PI / 180) * d}px; --ty:${Math.sin(ang * Math.PI / 180) * d}px; --rot:${Math.random() * 360}deg;`;
                            const dur = 1.5 + Math.random() * 2; shard.style.animation = `shardFly ${dur}s ease-out forwards`;
                            ov.appendChild(shard); setTimeout(() => shard.remove(), dur * 1000);
                        }
                    }
                    backdrop.style.opacity = 0;
                    setTimeout(() => {
                        let msg = (context.message || "").trim(); if (msg.startsWith("버질")) msg = msg.substring(2).trim();
                        if (msg) {
                            const txt = document.createElement('div'); txt.className = 'vergil-text'; txt.innerText = msg; document.body.appendChild(txt);
                            setTimeout(() => { txt.style.animation = "fadeOut 1s forwards"; setTimeout(() => { txt.remove(); if (ov.parentNode) ov.remove(); resolve(); }, 1000); }, 7000);
                        } else { if (ov.parentNode) ov.remove(); resolve(); }
                    }, 3800);
                }, 6200);
            });
        }
    },
    dolphin: {
        soundKey: "돌핀",
        execute: (context = {}) => {
            const id = 'dolphin-overlay-root';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483640; pointer-events:none; transition:opacity 2s;";
            ov.innerHTML = `<div id="dolphin-overlay" class="visible"><div class="dolphin-sky"><div class="dolphin-sun"></div></div><div class="dolphin-sea"></div></div>`;
            document.body.appendChild(ov);
            let msg = (context.message || "").trim(); if (msg.startsWith("돌핀")) msg = msg.substring(2).trim();
            if (msg) {
                const txt = document.createElement('div'); txt.className = 'dolphin-text'; txt.innerText = msg; ov.appendChild(txt);
            }
            return new Promise(resolve => {
                // [TOTAL DURATION] 19s Display + 2s Fade-out = 21s
                setTimeout(() => {
                    ov.style.opacity = '0';
                    setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 2000);
                }, 19000);
            });
        }
    }
};

const ScreenEffectManager = {
    queue: [],
    isLocked: false,
    trigger(type, context = {}) {
        const effect = ScreenEffectRegistry[type];
        if (!effect) return;
        console.log(`📥 [Manager] Queuing effect: ${type}. Current queue size: ${this.queue.length}`);
        this.queue.push({ effect, context, type });
        this._processNext();
    },
    async _processNext() {
        if (this.isLocked || this.queue.length === 0) {
            console.log(`⏳ [Manager] Process skipped. isLocked: ${this.isLocked}, queue: ${this.queue.length}`);
            return;
        }
        this.isLocked = true;
        const current = this.queue.shift();
        console.log(`🎬 [Manager] Executing: ${current.type}`);
        if (soundEnabled && current.effect.soundKey) playZergSound(soundHive[current.effect.soundKey]);
        try { await current.effect.execute(current.context); } catch (e) { console.error("Effect Error:", e); }
        console.log(`✅ [Manager] Completed: ${current.type}. Cooling down (1s).`);
        await new Promise(r => setTimeout(r, 1000));
        this.isLocked = false;
        this._processNext();
    }
};

function updateSoundHive(config) {
    soundHive = {};
    for (const [key, value] of Object.entries(config)) soundHive[key] = `SFX/${value}`;
    console.log("Sound Hive Updated", soundHive);
}

function loadConfigs() {
    const ds = window.HIVE_SOUND_CONFIG || {}, dv = window.HIVE_VISUAL_CONFIG || {};
    const ss = localStorage.getItem('HIVE_SOUND_CONFIG'), sv = localStorage.getItem('HIVE_VISUAL_CONFIG');
    let sc = ds; if (ss) { try { sc = { ...ds, ...JSON.parse(ss) }; } catch (e) { } }
    updateSoundHive(sc);
    if (sv) { try { visualConfig = { ...dv, ...JSON.parse(sv) }; } catch (e) { } } else visualConfig = dv;
}
loadConfigs();

function playZergSound(file, key = null) {
    if (!soundEnabled || (key && activeSoundLocks.has(key))) return;
    const audio = new Audio(file); audio.volume = 0.5;
    if (key) activeSoundLocks.add(key);
    audio.play().then(() => { audio.onended = () => { if (key) activeSoundLocks.delete(key); }; })
        .catch(e => { if (key) activeSoundLocks.delete(key); });
}
const activeSoundLocks = new Set();

function showMessage({ chan, type, message = '', data = {}, timeout = 10000, attribs = {} } = {}) {
    const norm = message.normalize('NFC').trim();
    let isVis = false;
    Object.keys(visualConfig).forEach(kw => {
        if (norm.startsWith(kw.normalize('NFC'))) {
            const et = visualConfig[kw];
            if (ScreenEffectRegistry[et]) { ScreenEffectManager.trigger(et, { message }); isVis = true; }
        }
    });
    if (isVis) return;

    Object.keys(soundHive).forEach(kw => {
        if (norm.includes(kw.normalize('NFC'))) playZergSound(soundHive[kw], kw);
    });

    const box = document.createElement('div'); box.className = 'chat-box';
    const inner = document.createElement('div'); inner.className = 'chat-line-inner';
    const nameBox = document.createElement('div'); nameBox.className = 'name-box';
    const nameEle = document.createElement('span'); nameEle.className = 'user-name'; nameEle.innerText = data.name;
    const msgEle = document.createElement('span'); msgEle.className = 'message';

    let color = data.color || '#5555ff';
    if (color === "#000000") { color = "#000000"; nameEle.style.color = "#ffffff"; }
    inner.style.borderColor = color; inner.style.background = color; inner.style.color = "#ffffff";
    nameBox.style.background = color;

    box.style.left = (boxPos % 100) + "%"; boxPos += 20;

    const finalMsg = handleEmotes(chan, data.emotes_chzzk || {}, message);
    addEmoteDOM(msgEle, finalMsg);

    nameBox.appendChild(nameEle); inner.appendChild(nameBox); inner.appendChild(msgEle); box.appendChild(inner);
    chatEle.appendChild(box);
    requestAnimationFrame(() => box.classList.add('visible'));
    mainArray.push(box); if (mainArray.length > 5) { const b = mainArray.shift(); b.classList.remove('visible'); }
    if (timeout) setTimeout(() => { if (box.parentNode) { box.classList.remove('visible'); setTimeout(() => box.remove(), 1000); } }, timeout);
}

function handleEmotes(c, em, m) {
    let p = [], r = /\{:([^:}]+):\}/g, l = 0, match;
    while ((match = r.exec(m)) !== null) {
        if (match.index > l) p.push(m.substring(l, match.index));
        if (em[match[1]]) p.push({ url: em[match[1]] }); else p.push(match[0]);
        l = r.lastIndex;
    }
    if (l < m.length) p.push(m.substring(l));
    return p.length > 0 ? p : [m];
}

function addEmoteDOM(el, d) {
    d.forEach(n => {
        if (typeof n === 'string') el.appendChild(document.createTextNode(n));
        else { let img = document.createElement('img'); img.src = n.url; img.className = 'emote_chzzk'; img.style.cssText = "height:1.2em; vertical-align:middle;"; el.appendChild(img); }
    });
}

function showAdminMessage(o) { o.type = 'admin'; return showMessage(o); }
function getChan(c = '') { return c.replace(/^#/, ''); }

async function showLoader(m, s) {
    let ld = document.getElementById('chzzk-loader');
    if (!ld) { ld = document.createElement('div'); ld.id = 'chzzk-loader'; document.body.appendChild(ld); }
    ld.innerText = m; ld.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.85); color:#fff; padding:20px 40px; border-radius:15px; font-size:1.5em; z-index:9999; text-align:center;";
    if (s === 'success') { ld.style.background = 'rgba(40,167,69,0.9)'; setTimeout(() => ld.remove(), 1500); }
}

async function connectChzzk() {
    showLoader("군단의 의지를 집결하는 중...");
    try {
        const fetchW = async (u) => {
            const px = ["https://corsproxy.io/?", "https://api.allorigins.win/raw?url="];
            for (let p of px) { try { const r = await fetch(p + encodeURIComponent(u)); if (r.ok) return await r.json(); } catch (e) { } }
            throw new Error("Proxy failed");
        };
        const sData = await fetchW(`https://api.chzzk.naver.com/polling/v2/channels/${CHZZK_CHANNEL_ID}/live-status`);
        const cid = sData.content.chatChannelId;
        const tData = await fetchW(`https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${cid}&chatType=STREAMING`);
        const tkn = tData.content.accessToken;
        const ws = new WebSocket('wss://kr-ss1.chat.naver.com/chat');
        ws.onopen = () => {
            showLoader("군단 강림 완료.", "success");
            ws.send(JSON.stringify({ ver: "2", cmd: 100, svcid: "game", cid: cid, bdy: { accTkn: tkn, auth: "READ", devType: 2001, uid: null }, tid: 1 }));
        };
        ws.onmessage = (e) => {
            const d = JSON.parse(e.data);
            if (d.cmd === 0) ws.send(JSON.stringify({ ver: "2", cmd: 10000 }));
            if (d.cmd === 93101 || d.cmd === 15101) {
                const cs = (d.cmd === 15101) ? d.bdy.messageList : d.bdy;
                if (cs) cs.forEach(c => {
                    if (!c.profile) return; let p = {}; try { p = JSON.parse(c.profile); } catch (e) { return; }
                    let clr = null; if (p.streamingProperty?.nicknameColor?.colorCode) clr = "#" + p.streamingProperty.nicknameColor.colorCode;
                    let bl = []; if (p.activityBadges) bl = p.activityBadges.map(b => ({ url: b.imageUrl, title: b.title }));
                    const us = { 'display-name': p.nickname, username: p.nickname, color: clr, 'user-id': p.userIdHash, badges: (p.userRoleCode === 'streamer') ? { broadcaster: '1' } : null, chzzk_badges: bl, 'message-type': 'chat', 'msg-id': 'chat', emotes_chzzk: JSON.parse(c.extras || '{}').emojis || {} };
                    handleMessage('chzzk', us, c.msg || c.content || "", false);
                });
            }
        };
        ws.onclose = () => setTimeout(connectChzzk, 3000);
        setInterval(() => { if (ws.readyState === 1) ws.send(JSON.stringify({ ver: "2", cmd: 0 })); }, 20000);
    } catch (e) { showLoader("오류: " + e.message, "error"); }
}

function handleMessage(c, us, m, f) {
    if (chatFilter.test(m)) return;
    if (!['ssakdook', 'Nightbot'].includes(us.username)) { us.name = us['display-name'] || us.username; showMessage({ chan: c, type: us['message-type'], message: m, data: us }); }
}

connectChzzk();