const idElement = document.getElementById('id');
let storedId = localStorage.getItem('CHZZK_CHANNEL_ID');
const attrId = idElement ? (idElement.getAttribute('twitchId') || idElement.getAttribute('chzzkHash')) : null;
if (!storedId && attrId) { localStorage.setItem('CHZZK_CHANNEL_ID', attrId); storedId = attrId; }
const CHZZK_CHANNEL_ID = storedId || attrId;
const chatEle = document.getElementById('chat');
let mainArray = [];
let soundEnabled = true;
let soundHive = {};
let visualConfig = {};
const configChannel = new BroadcastChannel('bubble_chat_control');
configChannel.onmessage = (e) => handleConfigCommand(e.data);
window.addEventListener('storage', (e) => { if (e.key === 'bubble_chat_cmd' && e.newValue) { try { handleConfigCommand(JSON.parse(e.newValue)); } catch (err) { } } });
function handleConfigCommand(data) {
    if (data.type === 'setSound') soundEnabled = data.enabled;
    else if (data.type === 'reload') location.reload();
    else if (data.type === 'setChannel' && data.channelId) { localStorage.setItem('CHZZK_CHANNEL_ID', data.channelId); location.reload(); }
    else if (data.type === 'updateConfig') { if (data.soundConfig) updateSoundHive(data.soundConfig); if (data.visualConfig) visualConfig = data.visualConfig; }
}
const ScreenEffectRegistry = {
    skull: {
        soundKey: "?닿낏",
        execute: (context = {}) => {
            const overlay = document.getElementById('skull-overlay') || createSkullOverlay();
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text skull-style';
            let msg = (context.message || "").replace("?닿낏", "").trim();
            centerMsgSnippet.innerHTML = msg;
            document.body.appendChild(centerMsgSnippet);
            return new Promise(resolve => {
                setTimeout(() => {
                    centerMsgSnippet.remove();
                    overlay.classList.add('visible');
                    setTimeout(() => { overlay.classList.remove('visible'); resolve(); }, 8000);
                }, 4000);
            });
        }
    },
    heart: {
        soundKey: "而ㅽ뵆",
        execute: (context = {}) => {
            const overlay = document.getElementById('heart-overlay') || createHeartOverlay();
            const flashback = document.getElementById('flashback-overlay');
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text heart-style';
            centerMsgSnippet.innerHTML = (context.message || "").replace("而ㅽ뵆", "").trim();
            document.body.appendChild(centerMsgSnippet);
            return new Promise(resolve => {
                flashback.classList.add('visible');
                setTimeout(() => {
                    centerMsgSnippet.remove();
                    flashback.classList.remove('visible');
                    overlay.classList.add('visible');
                    setTimeout(() => { overlay.classList.remove('visible'); resolve(); }, 12000);
                }, 11800);
            });
        }
    },
    vergil: {
        soundKey: "踰꾩쭏",
        execute: (context = {}) => {
            const id = 'void-overlay';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            ov.innerHTML = '<div id="void-backdrop"></div><div id="void-slashes"></div>';
            document.body.appendChild(ov);
            return new Promise(resolve => {
                setTimeout(() => {
                    let msg = (context.message || "").replace("踰꾩쭏", "").trim();
                    if (msg) {
                        const txt = document.createElement('div'); txt.className = 'vergil-text'; txt.innerText = msg; document.body.appendChild(txt);
                        setTimeout(() => { txt.remove(); ov.remove(); resolve(); }, 8000);
                    } else { ov.remove(); resolve(); }
                }, 10000);
            });
        }
    },
    dolphin: {
        soundKey: "?뚰?",
        execute: (context = {}) => {
            const id = 'dolphin-overlay-root';
            let ov = document.getElementById(id); if (ov) ov.remove();
            ov = document.createElement('div'); ov.id = id;
            // Transparent background to test actor visibility
            ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483640; pointer-events:none; background: transparent;";
            document.body.appendChild(ov);

            const spawnActor = (type, emoji, options = {}) => {
                const el = document.createElement('div');
                el.className = `sea-actor ${type}`;
                el.innerText = emoji;
                // Force absolute positioning and visibility properties
                el.style.position = 'absolute';
                el.style.zIndex = '2147483647';

                if (options.styles) {
                    Object.entries(options.styles).forEach(([k, v]) => el.style.setProperty(k, v));
                }

                if (type === 'sea-extra') {
                    el.style.left = (Math.random() * 90) + 'vw';
                    el.style.top = (40 + Math.random() * 50) + 'vh';
                }

                ov.appendChild(el);
                return el;
            };

            console.log("?맟 Dolphin Debug: Spawning actors without background");

            // 1. Extras (Increased count, immediate)
            const extraEmojis = ["\u{1F990}", "\u{1F991}", "\u{1F980}", "\u{1F99E}", "\u{1F420}", "\u{1F421}", "\u{1F41F}"];
            for (let i = 0; i < 15; i++) {
                spawnActor('sea-extra', extraEmojis[Math.floor(Math.random() * extraEmojis.length)], { duration: 21000 });
            }

            let msg = (context.message || "").trim(); if (msg.startsWith("?뚰?")) msg = msg.substring(2).trim();
            if (msg) {
                const txt = document.createElement('div');
                txt.className = 'dolphin-text';
                txt.innerText = msg;
                txt.style.cssText = "position:fixed; bottom:15%; left:50%; transform:translateX(-50%); font-size:4rem; color:white; text-shadow:0 0 10px blue; z-index:2147483647;";
                ov.appendChild(txt);
            }

            return new Promise(resolve => {
                // 2. Lead Dolphin
                setTimeout(() => {
                    spawnActor('lead-dolphin', "\u{1F42C}", { duration: 12000 });
                }, 5100);

                // 3. Supporting
                setTimeout(() => {
                    const supportList = ["\u{1F988}", "\u{1F433}", "\u{1F40B}", "\u{1F9AD}", "\u{1F3C4}", "\u{1F422}"];
                    for (let i = 0; i < 10; i++) {
                        const emoji = supportList[Math.floor(Math.random() * supportList.length)];
                        setTimeout(() => {
                            const fromLeft = Math.random() > 0.5;
                            const sx = fromLeft ? '-20vw' : '120vw';
                            const ex = fromLeft ? '120vw' : '-20vw';
                            spawnActor('sea-jump', emoji, {
                                duration: 5000,
                                styles: { '--sx': sx, '--ex': ex, '--mx': '50vw', '--sr': '0deg', '--mr': '0deg', '--er': '0deg' }
                            });
                        }, i * 500);
                    }
                }, 6100);

                setTimeout(() => {
                    ov.style.transition = 'opacity 2s';
                    ov.style.opacity = '0';
                    setTimeout(() => { ov.remove(); resolve(); }, 2000);
                }, 19000);
            });
        }
    }
};
const ScreenEffectManager = {
    queue: [], isLocked: false,
    trigger(type, context = {}) {
        const effect = ScreenEffectRegistry[type];
        if (!effect) return;
        this.queue.push({ effect, context, type });
        this._processNext();
    },
    async _processNext() {
        if (this.isLocked || this.queue.length === 0) return;
        this.isLocked = true;
        const current = this.queue.shift();
        console.log(`?렗 [Manager] Executing: ${current.type}`);
        if (soundEnabled && current.effect.soundKey) playZergSound(soundHive[current.effect.soundKey]);
        try { await current.effect.execute(current.context); } catch (e) { console.error(e); }
        console.log(`??[Manager] Completed: ${current.type}`);
        await new Promise(r => setTimeout(r, 1000));
        this.isLocked = false;
        this._processNext();
    }
};
function updateSoundHive(c) { soundHive = {}; for (const [k, v] of Object.entries(c)) soundHive[k] = `SFX/${v}`; }
function loadConfigs() {
    const ds = window.HIVE_SOUND_CONFIG || {}, dv = window.HIVE_VISUAL_CONFIG || {};
    const ss = localStorage.getItem('HIVE_SOUND_CONFIG'), sv = localStorage.getItem('HIVE_VISUAL_CONFIG');
    let sc = ds; if (ss) { try { sc = { ...ds, ...JSON.parse(ss) }; } catch (e) { } }
    updateSoundHive(sc);
    if (sv) { try { visualConfig = { ...dv, ...JSON.parse(sv) }; } catch (e) { } } else visualConfig = dv;
}
loadConfigs();
function playZergSound(f, k = null) {
    if (!soundEnabled) return;
    const a = new Audio(f); a.volume = 0.5;
    a.play().catch(e => console.error(e));
}
function showMessage({ message = '', data = {} } = {}) {
    const norm = message.normalize('NFC').trim();
    let isVis = false;
    Object.keys(visualConfig).forEach(kw => {
        if (norm.startsWith(kw.normalize('NFC'))) {
            const et = visualConfig[kw];
            if (ScreenEffectRegistry[et]) { ScreenEffectManager.trigger(et, { message }); isVis = true; }
        }
    });
    if (isVis) return;
    Object.keys(soundHive).forEach(kw => { if (norm.includes(kw.normalize('NFC'))) playZergSound(soundHive[kw], kw); });
    const box = document.createElement('div'); box.className = 'chat-box';
    box.innerHTML = `<div class="chat-line-inner" style="background:${data.color || '#5555ff'}"><span class="user-name">${data.name}</span>: <span class="message">${message}</span></div>`;
    chatEle.appendChild(box);
    setTimeout(() => box.classList.add('visible'), 50);
    mainArray.push(box); if (mainArray.length > 5) { mainArray.shift().remove(); }
    setTimeout(() => box.remove(), 10000);
}
async function connectChzzk() {
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
        ws.onopen = () => { ws.send(JSON.stringify({ ver: "2", cmd: 100, svcid: "game", cid: cid, bdy: { accTkn: tkn, auth: "READ", devType: 2001, uid: null }, tid: 1 })); };
        ws.onmessage = (e) => {
            const d = JSON.parse(e.data);
            if (d.cmd === 0) ws.send(JSON.stringify({ ver: "2", cmd: 10000 }));
            if (d.cmd === 93101 || d.cmd === 15101) {
                const cs = (d.cmd === 15101) ? d.bdy.messageList : d.bdy;
                if (cs) cs.forEach(c => {
                    let p = {}; try { p = JSON.parse(c.profile); } catch (e) { return; }
                    handleMessage({ message: c.msg || c.content || "", data: { name: p.nickname, color: "#" + (p.streamingProperty?.nicknameColor?.colorCode || "ffffff") } });
                });
            }
        };
        ws.onclose = () => setTimeout(connectChzzk, 3000);
    } catch (e) { console.error(e); }
}
function handleMessage(payload) { showMessage(payload); }
connectChzzk();
function createSkullOverlay() {
    let o = document.createElement('div'); o.id = 'skull-overlay';
    o.innerHTML = '<div class="skull-emoji">\u{2620}\u{FE0F}</div>'; document.body.appendChild(o); return o;
}
function createHeartOverlay() {
    let o = document.createElement('div'); o.id = 'heart-overlay';
    o.innerHTML = '<div class="heart-emoji">\u{2764}\u{FE0F}\u{200D}\u{1FA79}</div>'; document.body.appendChild(o);
    let f = document.createElement('div'); f.id = 'flashback-overlay'; document.body.appendChild(f); return o;
}
