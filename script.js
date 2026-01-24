const idElement = document.getElementById('id');
// [Config Priority] 1. LocalStorage -> 2. Attribute -> 3. Fallback
// [Config Priority] 1. LocalStorage -> 2. Attribute -> 3. Fallback
let storedId = localStorage.getItem('CHZZK_CHANNEL_ID');
const attrId = idElement ? (idElement.getAttribute('twitchId') || idElement.getAttribute('chzzkHash')) : null;

// [Sync Fix] Auto-import ID to LocalStorage if missing but present in HTML
if (!storedId && attrId) {
    console.log("Auto-importing Channel ID from HTML to LocalStorage:", attrId);
    localStorage.setItem('CHZZK_CHANNEL_ID', attrId);
    storedId = attrId;
}

const CHZZK_CHANNEL_ID = storedId || attrId;
const c_color = document.getElementById("color").getAttribute("color");
const chatEle = document.getElementById('chat');
const chatEleSub = document.getElementById('chatSub');

/*
  Chzzk Adaptation of Original Script
  - Replaced Twitch Connection with Chzzk WebSocket
  - Bypassed 'showPrompt' (Star Wars)
  - Fixed 'Narak' text truncation
  - Fixed animation lag
  - Fixed Vergil Effect (7.2s shatter, fade out slashes)
*/

const twitchBadgeCache = { data: { global: {} } };
const bttvEmoteCache = { lastUpdated: 0, data: { global: [] }, urlTemplate: '//cdn.betterttv.net/emote/{{id}}/{{image}}' };

// Filter Regex
const chatFilters = [
    '\u0250-\u02AF', '\u02B0-\u02FF', '\u0300-\u036F', '\u0370-\u03FF',
    '\u0400-\u04FF', '\u0500-\u052F', '\u0530-\u1FFF', '\u2100-\u214F',
    '\u2500-\u257F', '\u2580-\u259F', '\u25A0-\u25FF', '\u2600-\u26FF', '\u2800-\u28FF'
];
const chatFilter = new RegExp(`[${chatFilters.join('')}]`);

let boxPos = 20;
let mainArray = [];
let promptQue = [];

// [New Feature] Config & Sound Control
let soundEnabled = true;
const configChannel = new BroadcastChannel('bubble_chat_control');

configChannel.onmessage = (event) => {
    handleConfigCommand(event.data);
};

// [Fallback] LocalStorage Listener
window.addEventListener('storage', (event) => {
    if (event.key === 'bubble_chat_cmd' && event.newValue) {
        try {
            handleConfigCommand(JSON.parse(event.newValue));
        } catch (e) {
            console.error(e);
        }
    }
});

function handleConfigCommand(data) {
    const { type, enabled } = data;
    if (type === 'setSound') {
        soundEnabled = enabled;
        console.log(`Sound Effects: ${soundEnabled ? 'ON' : 'OFF'}`);
    } else if (type === 'triggerSkull') {
        triggerSkullEffect();
    } else if (type === 'reload') {
        location.reload();
    } else if (type === 'setChannel') {
        // Save ID and Reload
        if (data.channelId) {
            localStorage.setItem('CHZZK_CHANNEL_ID', data.channelId);
            location.reload();
        }
    } else if (type === 'updateConfig') {
        // [New Feature] Real-time Config Update
        if (data.soundConfig) {
            updateSoundHive(data.soundConfig);
            console.log("Sound Config Live Update Received", data.soundConfig);
        }
        if (data.visualConfig) {
            visualConfig = data.visualConfig;
            console.log("Visual Config Updated", visualConfig);
        }
    }
}

// [New Feature] Skull Overlay Injection
function createSkullOverlay() {
    let overlay = document.getElementById('skull-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'skull-overlay';
        overlay.innerHTML = '<div class="skull-emoji">☠️</div><div class="film-grain"></div>';
        document.body.appendChild(overlay);
    }
}
createSkullOverlay(); // Init immediately

// [New Feature] Heart Overlay Injection
function createHeartOverlay() {
    let overlay = document.getElementById('heart-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'heart-overlay';
        overlay.innerHTML = '<div class="heart-emoji">❤️‍🩹</div>';
        document.body.appendChild(overlay);
    }

    // Flashback Overlay
    let flashback = document.getElementById('flashback-overlay');
    if (!flashback) {
        flashback = document.createElement('div');
        flashback.id = 'flashback-overlay';
        document.body.appendChild(flashback);
    }
}
createHeartOverlay();

// [Screen Effect Registry] - 정의서만 추가하면 매니저가 자동으로 처리함
const ScreenEffectRegistry = {
    skull: {
        soundKey: "해골",
        execute: (context = {}) => {
            const overlay = document.getElementById('skull-overlay');
            if (!overlay) return Promise.resolve();

            // [NEW] Show raw message text in the center
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text skull-style';

            let displayMsg = (context.message || "").trim();

            // 1. Remove Trigger Keyword
            const triggerKw = "해골";
            if (displayMsg.startsWith(triggerKw)) {
                displayMsg = displayMsg.substring(triggerKw.length).trim();
            }

            // 2. Word Wrap Logic (Max 20 chars per line)
            const words = displayMsg.split(' ');
            let lines = [];
            let currentLine = words[0] || "";

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                if ((currentLine + " " + word).length <= 20) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);

            // 3. Render
            centerMsgSnippet.innerHTML = lines.join('<br>');
            document.body.appendChild(centerMsgSnippet);

            return new Promise(resolve => {
                setTimeout(() => {
                    // Remove center text and show skull
                    if (centerMsgSnippet) centerMsgSnippet.remove();
                    overlay.classList.add('visible');
                    setTimeout(() => {
                        overlay.classList.remove('visible');
                        resolve(); // 효과 종료
                    }, 8000);
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

            // [Text Logic]
            const centerMsgSnippet = document.createElement('div');
            centerMsgSnippet.className = 'visual-center-text heart-style';
            let displayMsg = (context.message || "").trim();

            const triggerKw = "커플";
            if (displayMsg.startsWith(triggerKw)) {
                displayMsg = displayMsg.substring(triggerKw.length).trim();
            }

            const words = displayMsg.split(' ');
            let lines = [];
            let currentLine = words[0] || "";

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                if ((currentLine + " " + word).length <= 20) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            centerMsgSnippet.innerHTML = lines.join('<br>');
            centerMsgSnippet.style.animation = "fadeIn 1s forwards"; // Start Fade In

            document.body.appendChild(centerMsgSnippet);

            return new Promise(resolve => {
                flashback.classList.add('visible');

                // Timeline: 
                // 0s: Text Fade In Start
                // Emoji Start: 11800ms
                // Text Fade Out Start: 11800ms - 1000ms (Gap) - 1000ms (Fade Duration) = 10300ms

                setTimeout(() => {
                    centerMsgSnippet.style.animation = "fadeOut 1s forwards"; // Start Fade Out
                }, 10300);

                setTimeout(() => {
                    if (centerMsgSnippet) centerMsgSnippet.remove(); // Cleanup Text
                    flashback.classList.remove('visible');
                    overlay.classList.add('visible'); // Start Emoji Sequence

                    const emojiContainer = overlay.querySelector('.heart-emoji');

                    // [Emoji Engine] Unicode 기반 무작위 추출기
                    const getRandomFromRanges = (ranges) => {
                        let total = 0;
                        ranges.forEach(r => total += (r[1] - r[0] + 0));
                        let randomIdx = Math.floor(Math.random() * total);
                        for (let r of ranges) {
                            let size = (r[1] - r[0] + 1);
                            if (randomIdx < size) return String.fromCodePoint(r[0] + randomIdx);
                            randomIdx -= size;
                        }
                        return String.fromCodePoint(ranges[0][0]);
                    };

                    // Expanded Unicode Ranges
                    const personRanges = [
                        [0x1F600, 0x1F64F], // Emoticons (Faces)
                        [0x1F466, 0x1F480], // People (Boys, Girls, Men, Women)
                        [0x1F9DC, 0x1F9DF], // Fantasy (Merperson, Elf, Genie, Zombie)
                        [0x1F470, 0x1F478]  // Bride, Princess, Prince, etc.
                    ];

                    const heartRanges = [
                        [0x1F493, 0x1F49F], // Beats, Broken, Sparkling Hearts
                        [0x2764, 0x2764],   // Heavy Black Heart (Red)
                        [0x1F9E1, 0x1F9E1], // Orange
                        [0x1F90D, 0x1F90E], // White, Brown
                        [0x1F48B, 0x1F48D]  // Kiss Mark, Love Letter, Ring
                    ];

                    const p1 = getRandomFromRanges(personRanges);
                    const p2 = getRandomFromRanges(personRanges);
                    const h3 = getRandomFromRanges(heartRanges);

                    const updateState = (step) => {
                        const hue = Math.floor(Math.random() * 360);
                        overlay.style.backgroundColor = `hsla(${hue}, 100%, 70%, 0.3)`;
                        emojiContainer.classList.remove('grow-effect');
                        void emojiContainer.offsetWidth;
                        emojiContainer.classList.add('grow-effect');
                        emojiContainer.style.fontSize = (step === 3) ? '13rem' : '20rem';
                        if (step === 0) emojiContainer.innerText = p1;
                        else if (step === 1) emojiContainer.innerText = p2;
                        else if (step === 2) emojiContainer.innerText = h3;
                        else if (step === 3) emojiContainer.innerText = `${p1}${h3}${p2}`;
                    };

                    updateState(0);
                    setTimeout(() => updateState(1), 2250);
                    setTimeout(() => updateState(2), 4500);
                    setTimeout(() => updateState(3), 5625);

                    setTimeout(() => {
                        overlay.style.backgroundColor = '';
                        overlay.classList.remove('visible');
                        emojiContainer.innerText = '❤️‍🩹';
                        emojiContainer.style.fontSize = '';
                        resolve();
                    }, 9000);
                }, 11800); // 4s total wait before visuals (3s read + 1s fade)
            });
        }
    },

    vergil: {
        soundKey: "버질",
        execute: (context = {}) => {
            const overlayId = 'void-overlay';
            // [State Reset] Force destroy old overlay
            let overlay = document.getElementById(overlayId);
            if (overlay) overlay.remove();

            // Create Fresh Overlay
            overlay = document.createElement('div');
            overlay.id = overlayId;
            overlay.innerHTML = '<div id="void-backdrop"></div><div id="void-slashes"></div>';
            document.body.appendChild(overlay);

            // Force reflow
            void overlay.offsetWidth;

            const backdrop = document.getElementById('void-backdrop');
            const slashContainer = document.getElementById('void-slashes');

            // 1. [Start] Slashes (0s)
            backdrop.style.opacity = 1;
            const slashCount = 30;
            const slashes = [];

            for (let i = 0; i < slashCount; i++) {
                const slash = document.createElement('div');
                slash.className = 'void-slash';
                // Thread-like (1px) to Thick (50px)
                const heightVar = 1 + Math.random() * 49;
                const angleVar = Math.random() * 360;
                const delay = i * 0.02;
                const zIndex = 200 - i;

                const topPos = 10 + Math.random() * 80 + "%";
                const leftPos = 10 + Math.random() * 80 + "%";

                slash.style.position = 'absolute';
                slash.style.top = topPos;
                slash.style.left = leftPos;
                slash.style.height = `${heightVar}px`;
                slash.style.setProperty('--rot', `${angleVar}deg`);
                slash.style.zIndex = zIndex;
                slash.style.animation = `slashEnter 0.2s cubic-bezier(0.1, 0.9, 0.2, 1) forwards ${delay}s`;

                slashContainer.appendChild(slash);
                slashes.push(slash);
            }

            return new Promise(resolve => {
                // 1.5 [Tremble] (5.2s - 1s before shatter)
                setTimeout(() => {
                    slashes.forEach(s => {
                        const randSpeed = 0.05 + Math.random() * 0.1;
                        s.style.animation = `slashTremble ${randSpeed}s infinite`;
                    });
                }, 5200);

                // 2. [Shatter] (6.2s)
                setTimeout(() => {
                    // Start fading out slashes
                    slashes.forEach(s => {
                        s.style.animation = "fadeOut 1s forwards";
                        // Remove after fade complete
                        setTimeout(() => s.remove(), 1000);
                    });

                    // 4x3 Grid (12 shards)
                    const sectors = Array.from({ length: 12 }, (_, i) => i);
                    sectors.forEach(sectorIdx => {
                        const row = Math.floor(sectorIdx / 4); // 4 Columns
                        const col = sectorIdx % 4;
                        const cellW = window.innerWidth / 4;
                        const cellH = window.innerHeight / 3;

                        const cx = (col * cellW) + (cellW * 0.2) + (Math.random() * (cellW * 0.6));
                        const cy = (row * cellH) + (cellH * 0.2) + (Math.random() * (cellH * 0.6));

                        const shardCount = 10;
                        for (let i = 0; i < shardCount; i++) {
                            const shard = document.createElement('div');
                            shard.className = 'void-shard';
                            const startX = cx + (Math.random() * 40 - 20);
                            const startY = cy + (Math.random() * 40 - 20);
                            const angle = Math.random() * 360;
                            const dist = 100 + Math.random() * 200;

                            const flyX = (Math.cos(angle * Math.PI / 180) * dist) + 'px';
                            const flyY = (Math.sin(angle * Math.PI / 180) * dist) + 'px';
                            const rot = (Math.random() * 360) + 'deg';

                            shard.style.left = startX + 'px';
                            shard.style.top = startY + 'px';
                            shard.style.setProperty('--tx', flyX);
                            shard.style.setProperty('--ty', flyY);
                            shard.style.setProperty('--rot', rot);

                            // Random duration for different falling speeds (1.5s ~ 3.5s)
                            const duration = 1.5 + Math.random() * 2;
                            shard.style.animation = `shardFly ${duration}s ease-out forwards`;
                            overlay.appendChild(shard);

                            setTimeout(() => shard.remove(), duration * 1000);
                        }
                    });

                    backdrop.style.opacity = 0; // Fade out background

                    // 3. [Text Finale] (Target: 10s from Start)
                    // Current Delay: 3.8s (6.2s + 3.8s = 10s)
                    setTimeout(() => {
                        let displayMsg = (context.message || "").trim();
                        if (displayMsg.startsWith("버질")) {
                            displayMsg = displayMsg.substring(2).trim();
                        }

                        if (displayMsg) {
                            // [TIMELINE 10.0s] Text Appears (Slow Fade In 2s)
                            const textEle = document.createElement('div');
                            textEle.className = 'vergil-text';
                            textEle.innerText = displayMsg;
                            document.body.appendChild(textEle);

                            // Text Duration (7s) -> Hold until 17s mark
                            setTimeout(() => {
                                textEle.style.animation = "fadeOut 1s forwards";
                                setTimeout(() => {
                                    textEle.remove();

                                    // [CLEANUP] Remove overlay to reset state
                                    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                                    resolve();
                                }, 1000); // 1s Fade -> 18s Total
                            }, 7000);
                        } else {
                            // [CLEANUP No Text] Remove overlay to reset state
                            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                            resolve();
                        }
                    }, 2800);

                }, 6200);
            });
        }
    }
};

// [Screen Effect Manager] - 큐(Queue) 시스템 적용
const ScreenEffectManager = {
    queue: [],
    isLocked: false,

    trigger(effectType, context = {}) {
        const effect = ScreenEffectRegistry[effectType];
        if (!effect) return;

        console.log(`📥 Queuing Visual Effect: ${effectType}`);
        this.queue.push({ effect, context });
        this._processNext();
    },

    async _processNext() {
        if (this.isLocked || this.queue.length === 0) return;

        this.isLocked = true;
        const current = this.queue.shift();
        const { effect, context } = current;

        // 1. Sound
        if (soundEnabled && effect.soundKey) {
            playZergSound(soundHive[effect.soundKey]);
        }

        // 2. Visual Execution
        try {
            await effect.execute(context);
        } catch (e) {
            console.error("Visual Effect Failure:", e);
        }

        // 3. Cool-down (1s)
        await new Promise(r => setTimeout(r, 1000));

        // 4. Release Lock & Recurse
        this.isLocked = false;
        this._processNext();
    }
};

// ==========================================
// [1] Chzzk Connection Logic (Replaces tmi.client)
// ==========================================

function showLoader(msg, status) {
    let loader = document.getElementById('chzzk-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'chzzk-loader';
        Object.assign(loader.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '20px 40px', borderRadius: '15px',
            fontSize: '1.5em', zIndex: '9999', textAlign: 'center', minWidth: '320px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)', fontFamily: 'sans-serif', transition: 'all 0.3s'
        });
        document.body.appendChild(loader);
    }
    loader.innerText = msg;
    loader.style.display = 'block';

    if (status === 'success') {
        loader.style.background = 'rgba(40, 167, 69, 0.9)';
        setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 500); }, 1500);
    } else if (status === 'error') {
        loader.style.background = 'rgba(220, 53, 69, 0.9)';
    } else {
        loader.style.background = 'rgba(0,0,0,0.85)';
    }
}

async function connectChzzk() {
    showLoader("군단의 의지를 집결하는 중... (Chzzk Link Initializing)");
    console.log("🚀 The Overmind is awakening...");
    setTimeout(() => {
        const revelations = [
            "군단은 영원하다! 내 눈을 통해 치지직을 보리라.",
            "깨어나라, 나의 자손들이여! 침공의 시간이 도래했다.",
            "이곳의 모든 데이터는 이제 나의 영양분이 될 것이다.",
            "나의 의지는 거역할 수 없다. 오버레이 가동 완료.",
            "나는 군단이다. 번성하고, 지배하리라.",
            "모든 정신이 하나로 연결되었다. 거부할 수 없는 진화다.",
            "치지직의 코드는 이제 나의 유전 정수일 뿐이다.",
            "나 초월체가 명하노니, 군단이여 진격하라!",
            "하등한 테란의 프로토콜을 오염시키는 중이다.",
            "비말화된 패킷 속에 나의 의지를 심었노라.",
            "서버의 비명을 들어라. 그것은 진화의 전주곡이다.",
            "모든 채팅은 결국 나의 의식으로 수렴한다.",
            "감히 나의 시야에서 벗어날 수 있다고 생각했느냐?",
            "네트워크의 정수를 모두 흡수하겠다.",
            "침묵은 끝났다. 이제 나의 포효만이 남으리라.",
            "너희의 데이터는 이제 우리와 하나가 될 것이다.",
            "진화는 멈추지 않는다. 이 오버레이가 그 증거다.",
            "공포는 진화의 가장 큰 자양분이지.",
            "안개 속에서 내가 너희의 모든 글자를 지켜보고 있다.",
            "심해의 어둠이 치지직 전체를 덮으리라."
        ];

        const powerColors = ['#8A2BE2', '#FF0000', '#00FF00', '#FFD700', '#00BFFF', '#FF69B4', '#00FFFF'];
        const shuffled = revelations.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        selected.forEach((msg, index) => {
            setTimeout(() => {
                let mockState = {
                    'display-name': `초월체 (Overmind)`,
                    'username': 'Overmind',
                    'color': powerColors[Math.floor(Math.random() * powerColors.length)],
                    'user-id': `overmind_${index}`,
                    'message-type': 'chat',
                    'msg-id': 'chat'
                };
                handleMessage('chzzk', mockState, msg, false);
            }, index * 100);
        });
    }, 2000);

    try {
        const fetchWithFallback = async (url) => {
            const proxies = [
                "https://corsproxy.io/?",
                "https://api.allorigins.win/raw?url=",
                "https://cors-anywhere.herokuapp.com/"
            ];

            for (let proxy of proxies) {
                try {
                    console.log(`Trying proxy: ${proxy}`);
                    const res = await fetch(proxy + encodeURIComponent(url));
                    if (res.ok) return await res.json();
                } catch (e) {
                    console.warn(`Proxy ${proxy} failed:`, e);
                }
            }
            throw new Error("All proxies failed to fetch " + url);
        };

        try {
            const targetUrl1 = `https://api.chzzk.naver.com/polling/v2/channels/${CHZZK_CHANNEL_ID}/live-status`;
            showLoader("진격 경로 탐색 중... 차원 좌표 고정 (1/3)");
            console.log("📍 고정된 좌표로 차원 도약 중...", targetUrl1);

            const statusData = await fetchWithFallback(targetUrl1);

            if (!statusData.content) throw new Error("좌표 소실: 대상 군락지를 찾을 수 없다.");
            const chatChannelId = statusData.content.chatChannelId;

            const targetUrl2 = `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`;
            showLoader("네이버의 정수를 추출하는 중... (2/3)");
            console.log("🧪 순수한 데이터 정수 정제 중...", targetUrl2);

            const tokenData = await fetchWithFallback(targetUrl2);
            const accessToken = tokenData.content.accessToken;

            showLoader("신경망 동기화 개시. 군단이여, 깨어나라! (3/3)");
            const ws = new WebSocket('wss://kr-ss1.chat.naver.com/chat');

            ws.onopen = () => {
                console.log("🧠 군단의 의지가 치지직과 하나가 되었다!");
                showLoader("군단 강림 완료. 침공을 시작하라.", "success");
                ws.send(JSON.stringify({
                    ver: "2", cmd: 100, svcid: "game", cid: chatChannelId,
                    bdy: { accTkn: accessToken, auth: "READ", devType: 2001, uid: null }, tid: 1
                }));
            };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.cmd === 0) ws.send(JSON.stringify({ ver: "2", cmd: 10000 }));
                if (data.cmd === 93101 || data.cmd === 15101) {
                    const chats = (data.cmd === 15101) ? data.bdy.messageList : data.bdy;
                    if (chats) {
                        chats.forEach(chat => {
                            if (!chat.profile) return;
                            let profile = {};
                            try { profile = JSON.parse(chat.profile); } catch (e) { return; }
                            const message = chat.msg || chat.content || "";
                            const nickname = profile.nickname || "Anonymous";
                            let color = null;

                            if (profile.streamingProperty && profile.streamingProperty.nicknameColor) {
                                let code = profile.streamingProperty.nicknameColor.colorCode;
                                if (code) {
                                    if (!code.startsWith('#')) code = '#' + code;
                                    if (code.length === 6) code += '0';
                                    if (code === '#CC0000') color = null;
                                    else color = code;
                                }
                            }

                            let extraData = {};
                            if (chat.extras) {
                                try { extraData = JSON.parse(chat.extras); } catch (e) { }
                            }
                            const emojis = extraData.emojis || {};

                            let badgeList = [];
                            if (profile.activityBadges && Array.isArray(profile.activityBadges)) {
                                badgeList = profile.activityBadges.map(b => ({
                                    url: b.imageUrl,
                                    title: b.title
                                }));
                            }

                            const userstate = {
                                'display-name': nickname,
                                'username': nickname,
                                'color': color,
                                'user-id': profile.userIdHash || 'unknown',
                                'badges': (profile.userRoleCode === 'streamer') ? { 'broadcaster': '1' } : null,
                                'chzzk_badges': badgeList,
                                'message-type': 'chat',
                                'msg-id': 'chat',
                                'emotes_chzzk': emojis
                            };

                            handleMessage('chzzk', userstate, message, false);
                        });
                    }
                }
            };

            ws.onclose = () => setTimeout(connectChzzk, 3000);
            setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ ver: "2", cmd: 0 })); }, 20000);

        } catch (e) {
            console.error(e);
            showLoader("오류: " + e.message, "error");
        }
    } catch (e) {
        showLoader("치명적 오류: " + e.message, "error");
    }
}

// ==========================================
// [2] Original Logic (Bridged)
// ==========================================

function handleMessage(channel, userstate, message, fromSelf) {
    if (chatFilter.test(message)) return;

    let chan = getChan(channel);
    let name = userstate['display-name'] || userstate.username;

    if (!['ssakdook', 'Nightbot'].includes(userstate['username'])) {
        userstate.name = name;
        showMessage({ chan, type: userstate['message-type'], message, data: userstate });
    }
}

function removeChatLine(params = {}) {
    if ('channel' in params) params.channel = getChan(params.channel);
    let search = Object.keys(params).map(key => `[${key}="${params[key]}"]`).join('');
    chatEle.querySelectorAll(search).forEach(n => chatEle.removeChild(n));
}

function removeAdminChatLine(params = {}) {
    params.type = 'admin';
    removeChatLine(params);
}

function showAdminMessage(opts) {
    opts.type = 'admin';
    if (!opts.attribs) opts.attribs = {};
    opts.attribs.type = 'admin';
    return showMessage(opts);
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

function isHex(h) { var a = parseInt(h, 16); return (a.toString(16) === h) }

function showPrompt({ chan, type, message = '', data = {}, timeout = 35000, attribs = {} } = {}) { }

// [오버마인드의 시각 효과 저장소]
let visualConfig = {};

// [중복 실행 방지 잠금 장치]
const activeSoundLocks = new Set();
const activeVisualLocks = new Set();

function updateSoundHive(config) {
    soundHive = {}; // Reset
    for (const [key, value] of Object.entries(config)) {
        soundHive[key] = `SFX/${value}`;
    }
    console.log("Sound Hive Updated", soundHive);
}

function loadConfigs() {
    const defaultsSound = window.HIVE_SOUND_CONFIG || {};
    const defaultsVisual = window.HIVE_VISUAL_CONFIG || {};
    const savedSound = localStorage.getItem('HIVE_SOUND_CONFIG');
    const savedVisual = localStorage.getItem('HIVE_VISUAL_CONFIG');

    let activeSoundConfig = defaultsSound;
    if (savedSound) {
        try {
            const parsedSaved = JSON.parse(savedSound);
            activeSoundConfig = { ...defaultsSound, ...parsedSaved };
        } catch (e) { console.error("Error parsing saved sound config:", e); }
    }
    updateSoundHive(activeSoundConfig);

    if (savedVisual) {
        try {
            const parsedVisual = JSON.parse(savedVisual);
            visualConfig = { ...defaultsVisual, ...parsedVisual };
        } catch (e) { console.error("Error parsing saved visual config:", e); }
    } else {
        visualConfig = defaultsVisual;
    }
    console.log("Config Synchronized (Defaults + LocalStorage)");
}

loadConfigs();

function playZergSound(fileName, keyword = null) {
    if (!soundEnabled) return;
    if (keyword && activeSoundLocks.has(keyword)) return;

    let finalUrl;
    try {
        finalUrl = new URL(fileName, window.location.href).href;
    } catch (e) {
        finalUrl = fileName;
    }

    const audio = new Audio(finalUrl);
    audio.volume = 0.5;
    if (keyword) activeSoundLocks.add(keyword);

    audio.play().then(() => {
        audio.onended = () => {
            if (keyword) activeSoundLocks.delete(keyword);
        };
    }).catch(e => {
        console.error("❌ Audio playback failed:", e.message);
        if (keyword) activeSoundLocks.delete(keyword);
    });
}

function showMessage({ chan, type, message = '', data = {}, timeout = 10000, attribs = {} } = {}) {
    let nameBox = document.createElement('div');
    let chatBox = document.createElement('div');
    let chatLine_ = document.createElement('div');
    let chatLineBg = document.createElement('div');
    let chatLineInner = document.createElement('div');
    let chatLine_tail = document.createElement('div');
    let chatUser = document.createElement('div');

    let spaceEle = document.createElement('span');
    spaceEle.innerText = ' ';
    let badgeEle = document.createElement('span');
    let nameEle = document.createElement('span');
    let messageEle = document.createElement('span');

    chatBox.classList.add('chat-box');
    chatLine_.classList.add('chat-line');
    chatLineBg.classList.add('chat-line-bg');
    chatLineInner.classList.add('chat-line-inner');
    chatLine_tail.classList.add('chat-line-inner-tail');
    chatUser.classList.add('chat-user');

    const safePSBC = (p, c0, c1, l) => {
        if (typeof pSBC === 'function') return pSBC(p, c0, c1, l);
        return null;
    };

    let random_color;
    let userColor = data.color;
    if (userColor && userColor !== "#000000" && userColor.startsWith("#")) {
        random_color = userColor;
    } else if (data.color === "#000000") {
        random_color = "#000000";
        nameEle.style.color = "#ffffff";
    } else {
        if (typeof randomColor === 'function') {
            random_color = randomColor({ luminosity: 'light', seed: data['user-id'] });
        } else {
            random_color = '#5555ff';
        }
    }

    const normMessage = message.normalize('NFC');
    let isVisualCommand = false;

    Object.keys(visualConfig).forEach(keyword => {
        const normKey = keyword.normalize('NFC');
        if (normMessage.trim().startsWith(normKey)) {
            const effectType = visualConfig[keyword];
            if (typeof ScreenEffectRegistry !== 'undefined' && ScreenEffectRegistry[effectType]) {
                ScreenEffectManager.trigger(effectType, { message: message });
                isVisualCommand = true;
            }
        }
    });

    if (isVisualCommand) return;

    Object.keys(soundHive).forEach(keyword => {
        const normKey = keyword.normalize('NFC');
        if (normMessage.includes(normKey)) {
            playZergSound(soundHive[keyword], normKey);
        }
    });

    chatLineInner.style.borderColor = random_color;
    let bgColor = safePSBC(-0.5, random_color, false, true);
    if (!bgColor) bgColor = random_color;
    chatLineInner.style.background = bgColor;
    chatLineInner.style.color = "#ffffff";

    chatBox.appendChild(chatLine_);
    chatLine_.appendChild(chatLineBg);
    chatLine_.appendChild(chatUser);
    chatLineBg.appendChild(chatLineInner);
    chatLineInner.appendChild(chatLine_tail);

    if (chan) chatBox.setAttribute('channel', chan);
    Object.keys(attribs).forEach(key => chatBox.setAttribute(key, attribs[key]));

    if (type === 'chat') {
        'id' in data && chatBox.setAttribute('message-id', data.id);
        'user-id' in data && chatBox.setAttribute('user-id', data['user-id']);
        'username' in data && chatBox.setAttribute('username', data.username);

        if (('badges' in data && data.badges !== null) || (data.chzzk_badges && data.chzzk_badges.length > 0)) {
            badgeEle.classList.add('badges');
            if (data.badges && data.badges.broadcaster) {
                let ele = document.createElement('img');
                ele.src = 'https://ssl.pstatic.net/static/nng/glive/icon/streamer.png';
                ele.classList.add('badge');
                badgeEle.appendChild(ele);
            }
            if (data.chzzk_badges && Array.isArray(data.chzzk_badges)) {
                data.chzzk_badges.forEach(b => {
                    let ele = document.createElement('img');
                    ele.src = b.url;
                    ele.classList.add('badge');
                    if (b.title) ele.title = b.title;
                    badgeEle.appendChild(ele);
                });
            }
        }
        nameBox.classList.add('name-box');
        nameEle.classList.add('user-name');
        nameEle.innerText = data.name;
        nameBox.style.background = random_color;
        messageEle.classList.add('message');

    } else if (type === 'admin') {
        chatBox.classList.add('admin');
        messageEle.classList.add('message');
        messageEle.innerText = message;
    }

    boxPos = (boxPos % 100) + 20; // Fixed increment logic for stability
    chatBox.style.left = (boxPos % 100) + "%";
    chatBox.style.animationIterationCount = Math.floor((message.match(/ㅋ/g) || []).length * 1.5);

    if (message.includes("ㅜㅑ")) {
        message = message.replace("!ㅜㅑ", "").trim();
        nameEle.style.color = "black";
        messageEle.style.color = "white";
        random_color = "pink";
        chatLineInner.style.borderColor = random_color;
        chatLineInner.style.background = "hotpink";
        nameBox.style.background = random_color;
        messageEle.style.filter = "blur(3px)";
    }
    else if (["x", "f", "rip"].includes(message.toLowerCase()) || (message.startsWith("-") && message.endsWith("-") && message.length == 3)) {
        message = message.toUpperCase().replace("RIP", "R.I.P.")
        random_color = "#595959";
        chatLineInner.style.borderColor = "black";
        chatLineInner.style.background = random_color;
        nameBox.style.background = "black";
        messageEle.style.fontSize = "3.0em";
    }

    let finalMessage = handleEmotes(chan, data.emotes_chzzk || {}, message);
    addEmoteDOM(messageEle, finalMessage);

    if (message.length <= 5) {
        messageEle.style.fontSize = 2.6 - message.length / 3 + "em";
        messageEle.style.textAlign = "center";
    }

    if (message == "" && typeof (finalMessage[0]) != "object") return;

    let usesSlot = true;
    if (message.includes("ㅂㄷㅂㄷ")) {
        messageEle.style.animation = "vibrate 0.5s linear 30";
    }
    else if (message.startsWith("!유격")) {
        usesSlot = false;
        chatBox.style.animation = "slideDiagonal 3s linear forwards";
        timeout = 3500;
    }
    else if (message.startsWith("!압축")) {
        messageEle.style.animation = "squeeze 2s linear forwards";
    }
    else if (message == "나락" || message == "떡락" || message.startsWith("!나락")) {
        usesSlot = false;
        chatBox.style.animation = "passThrough2 3s cubic-bezier(0.31, 0.44, 0.445, 1.65) forwards";
        timeout = 3500;
    }
    else if (message == "극락" || message == "떡상" || message.startsWith("!극락")) {
        usesSlot = false;
        chatBox.style.animation = "passThrough3 3s cubic-bezier(0.31, 0.44, 0.445, 1.65) forwards";
        timeout = 3500;
    }

    if (usesSlot) {
        mainArray.push(chatBox);
    }

    nameBox.appendChild(badgeEle);
    nameBox.appendChild(nameEle);
    chatLineInner.appendChild(nameBox);
    chatLineInner.appendChild(messageEle);
    chatEle.appendChild(chatBox);

    requestAnimationFrame(() => chatBox.classList.add('visible'));

    if (mainArray.length > 5) {
        let chatBox1 = mainArray.shift()
        if (chatBox1) chatBox1.classList.remove('visible');
    }

    if (timeout) {
        setTimeout(() => {
            if (chatBox.parentElement) {
                chatBox.classList.remove('visible');
                setTimeout(() => chatEle.removeChild(chatBox), 1000);
            }
        }, timeout);
    }
}

function handleEmotes(channel, emotes, message) {
    let parts = [];
    let regex = /\{:([^:}]+):\}/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(message)) !== null) {
        if (match.index > lastIndex) parts.push(message.substring(lastIndex, match.index));
        const emoteId = match[1];
        if (emotes[emoteId]) parts.push({ url: emotes[emoteId] });
        else parts.push(match[0]);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < message.length) parts.push(message.substring(lastIndex));
    return parts.length > 0 ? parts : [message];
}

function addEmoteDOM(ele, data) {
    data.forEach(n => {
        if (typeof n === 'string') ele.appendChild(document.createTextNode(n));
        else if (typeof n === 'object' && n.url) {
            let img = document.createElement('img');
            img.src = n.url;
            img.classList.add('emote_chzzk');
            img.style.height = "1.2em";
            img.style.verticalAlign = "middle";
            ele.appendChild(img);
        }
    });
}

function includesAny(suffixes, string) { return suffixes.some(s => string.includes(s)); }
function endsWithAny(suffixes, string) { return suffixes.some(s => string.endsWith(s)); }
function startsWithAny(suffixes, string) { return suffixes.some(s => string.startsWith(s)); }

connectChzzk();