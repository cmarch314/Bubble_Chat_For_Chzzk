// ==========================================
// [Global Variables] 기본 전역 변수 (호환성 유지)
// ==========================================
const idElement = document.getElementById('id');
const chatEle = document.getElementById('chat');
let soundEnabled = true; // ConfigManager와 동기화됨

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
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id') || urlParams.get('channelId') || urlParams.get('channel');
        const local = localStorage.getItem('CHZZK_CHANNEL_ID');
        const attr = document.getElementById('id')?.getAttribute('chzzkHash');

        let id = urlId || local || attr;
        if (urlId) this.idSource = "URL Parameter";
        else if (local) this.idSource = "LocalStorage";
        else if (attr) this.idSource = "index.html Attribute";
        else this.idSource = "None Found";

        return id;
    }

    _initBroadcastChannel() {
        this.bc = new BroadcastChannel('bubble_chat_control');
        this.bc.onmessage = (event) => this._handleCommand(event.data);
    }

    _handleCommand(data) {
        switch (data.type) {
            case 'setSound':
                soundEnabled = data.enabled;
                if (window.audioManager) window.audioManager.setEnabled(data.enabled);
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
                if (window.audioManager) window.audioManager.updateConfig(data.soundConfig);
                if (data.visualConfig) window.visualConfig = data.visualConfig; // 레거시 호환
                break;
        }
    }

    _loadLocalConfig() {
        // config.js 혹은 로컬스토리지 로드
        const defaultsSound = window.HIVE_SOUND_CONFIG || {};
        const savedSound = localStorage.getItem('HIVE_SOUND_CONFIG');
        let activeSound = defaultsSound;

        if (savedSound) {
            try { activeSound = { ...defaultsSound, ...JSON.parse(savedSound) }; } catch (e) { }
        }

        // AudioManager가 생성된 후 설정 주입을 위해 전역에 잠시 저장
        window.__INITIAL_SOUND_CONFIG = activeSound;
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
            "https://api.codetabs.com/v1/proxy?quest=",
            "https://thingproxy.freeboard.io/fetch/",
            "https://corsproxy.io/?url=" // Fallback variation
        ];
        this.attemptCount = 1;
    }

    async connect() {
        const id = this.config.channelId || "NULL";
        const src = this.config.idSource || "Unknown";
        this._showLoader(`치지직 채널 탐색 중...<br>[ID: ${id}] (출처: ${src})<br>(${this.attemptCount}번째 시도)`, "loading");

        try {
            if (!this.config.channelId || this.config.channelId === "NULL") {
                throw new Error("채널 ID가 설정되지 않았습니다. config.js 혹은 URL 파라미터를 확인해주세요.");
            }

            const statusData = await this._fetchWithProxy(
                `https://api.chzzk.naver.com/polling/v2/channels/${this.config.channelId}/live-status`
            );
            const { chatChannelId } = statusData.content;

            this._showLoader(`채팅 서버 접근 권한 요청 중... [${id}] (${this.attemptCount}번째 시도)`, "loading");
            const tokenData = await this._fetchWithProxy(
                `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`
            );
            const accessToken = tokenData.content.accessToken;

            this._connectSocket(chatChannelId, accessToken);

        } catch (e) {
            this.config.log(`Connection Failed: ${e.message}`);
            this._showLoader(`연결 실패: ${e.message}<br>${this.attemptCount}번째 시도 실패. 5초 후 재시도`, "error");
            this.attemptCount++;
            setTimeout(() => this.connect(), 5000);
        }
    }

    _connectSocket(chatChannelId, accessToken) {
        this.ws = new WebSocket('wss://kr-ss1.chat.naver.com/chat');

        this.ws.onopen = () => {
            this.config.log("WS Open. Sending Handshake.");
            this._showLoader("채팅 서버 연결 완료!", "success");
            this.attemptCount = 1; // Success! Reset counter
            this.ws.send(JSON.stringify({
                ver: "2", cmd: 100, svcid: "game", cid: chatChannelId,
                bdy: { accTkn: accessToken, auth: "READ", devType: 2001, uid: null }, tid: 1
            }));
        };

        this.ws.onmessage = (e) => this._parsePacket(JSON.parse(e.data), chatChannelId);
        this.ws.onclose = () => {
            this.config.log("WS Closed. Reconnecting...");
            this.attemptCount++;
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

        if (data.cmd === 10100) {
            let historyCount = 0;
            if (this.config.debugMode) historyCount = 10;
            else if (this.config.loadHistory) historyCount = 50;

            if (historyCount > 0) {
                this.ws.send(JSON.stringify({
                    ver: "2", cmd: 5101, svcid: "game", cid: chatChannelId,
                    bdy: { recentMessageCount: historyCount }, tid: 2, sid: data.bdy.sid
                }));
            }
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
                    type: 'chat'
                };

                this.onMessage(messageData);
            });
        }
    }

    async _fetchWithProxy(url) {
        let errors = [];

        // 1. Primary: AllOrigins Wrapper (Wraps response in JSON to bypass CORS more effectively)
        try {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const wrapper = await res.json();
                if (wrapper && wrapper.status && wrapper.status.http_code === 200) {
                    const data = JSON.parse(wrapper.contents);
                    if (data && data.code !== undefined && data.code !== 200) throw new Error(`Chzzk ${data.code}`);
                    return data;
                }
                errors.push(`AllOrig: HTTP ${wrapper?.status?.http_code || 'Err'}`);
            } else {
                errors.push(`AllOrig: Fetch ${res.status}`);
            }
        } catch (e) {
            errors.push(`AllOrig: ${e.message.substring(0, 15)}`);
        }

        // 2. Secondary: Raw Proxies (Iterative)
        for (let proxy of this.proxies) {
            const fullUrl = proxy + encodeURIComponent(url);
            try {
                const res = await fetch(fullUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.code !== undefined && data.code !== 200) throw new Error(`Chzzk ${data.code}`);
                    return data;
                }
                errors.push(`${proxy.split('/')[2].substring(0, 8)}: H${res.status}`);
            } catch (e) {
                errors.push(`${proxy.split('/')[2].substring(0, 8)}: ${e.message.substring(0, 15)}`);
            }
        }

        // 3. Fallback: Direct Fetch
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
            errors.push(`Direct: H${res.status}`);
        } catch (e) {
            errors.push(`Direct: ${e.message.substring(0, 15)}`);
        }

        throw new Error(`연결 실패 (${errors.join(' | ')})`);
    }

    _showLoader(msg, type) {
        let loader = document.getElementById('chzzk-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'chzzk-loader';
            document.body.appendChild(loader);
            Object.assign(loader.style, {
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '10px', zIndex: '9999',
                fontSize: '3em'
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
// [Class 3] Audio Manager (Sound Engine)
// ==========================================
class AudioManager {
    constructor() {
        this.soundHive = {};
        this.enabled = true;
        this.updateConfig(window.__INITIAL_SOUND_CONFIG || {});
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    updateConfig(config) {
        this.soundHive = {};
        const processItem = (item) => {
            if (typeof item === 'string') return `SFX/${item}`;
            else if (typeof item === 'object' && item !== null && item.src) return { ...item, src: `SFX/${item.src}` };
            return item;
        };
        for (const [key, value] of Object.entries(config)) {
            if (Array.isArray(value)) this.soundHive[key] = value.map(processItem);
            else this.soundHive[key] = processItem(value);
        }
        // 레거시 호환을 위해 전역 변수에도 할당
        window.soundHive = this.soundHive;
    }

    // 소리만 재생 (채팅 트리거용)
    checkAndPlay(message) {
        if (!this.enabled) return;
        const normOriginal = message.normalize('NFC').trim();

        // Visual Config에 있는 키워드는 사운드 트리거에서 제외 (중복 방지)
        const visualKeys = window.HIVE_VISUAL_CONFIG ? Object.keys(window.HIVE_VISUAL_CONFIG) : [];

        let allMatches = [];
        Object.keys(this.soundHive).forEach(keyword => {
            if (visualKeys.includes(keyword)) return;

            const normKey = keyword.normalize('NFC');
            let searchPos = 0, index;
            while ((index = normOriginal.indexOf(normKey, searchPos)) !== -1) {
                allMatches.push({
                    startIndex: index,
                    endIndex: index + normKey.length,
                    length: normKey.length,
                    sound: this.soundHive[keyword]
                });
                searchPos = index + 1;
            }
        });

        allMatches.sort((a, b) => (a.startIndex === b.startIndex) ? b.length - a.length : a.startIndex - b.startIndex);

        let sequence = [], lastEnd = 0;
        for (let match of allMatches) {
            if (match.startIndex >= lastEnd) {
                sequence.push(match);
                lastEnd = match.endIndex;
            }
        }

        if (sequence.length > 0) {
            (async () => {
                for (let item of sequence.slice(0, 5)) { await this.playSound(item.sound); }
            })();
        }
    }

    // 외부(VisualDirector 등)에서 호출 가능
    playSound(input) {
        if (!this.enabled) return Promise.resolve();
        let target = input;
        if (Array.isArray(target)) target = target[Math.floor(Math.random() * target.length)];
        if (!target) return Promise.resolve();

        let fileName, volume = 0.5;
        if (typeof target === 'object' && target !== null && target.src) {
            fileName = target.src;
            if (target.volume !== undefined) volume = target.volume;
        } else {
            fileName = target;
        }
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
}

// ==========================================
// [Class 4] Chat Renderer (DOM & Animation)
// ==========================================
class ChatRenderer {
    constructor() {
        this.container = document.getElementById('chat');
        this.boxPos = 0;
        this.activeBubbles = [];
    }

    render(data) {
        const { message, nickname, color, badges, emotes, type, uid } = data;
        const originalMessage = message;
        const normOriginal = originalMessage.normalize('NFC').trim();

        // !명령어 제거 및 정리
        let displayMessage = message.replace(/(^|\s)![\S]+/g, "").replace(/\s+/g, " ").trim();

        // DOM 요소 생성
        const elements = this._createBubbleElements();
        const { chatBox, chatLineInner, nameBox, messageEle, nameEle, badgeEle } = elements;

        // 색상 계산
        let userColor = this._resolveColor(color, uid);
        let bgColor = pSBC(-0.5, userColor, false, true) || userColor;

        // 기본 스타일 적용
        chatLineInner.style.borderColor = userColor;
        chatLineInner.style.background = bgColor;
        chatLineInner.style.color = "#ffffff";
        nameBox.style.background = userColor;
        nameEle.innerText = nickname;

        // 배지 처리
        if (badges && badges.length > 0) {
            badgeEle.classList.add('badges');
            badges.forEach(b => {
                let img = document.createElement('img');
                img.src = b.url;
                img.classList.add('badge');
                badgeEle.appendChild(img);
            });
        }

        // 특수 효과 필터 (채팅 내용 기반)
        this._applyTextFilters(originalMessage, elements, userColor);

        // 이모티콘 처리 및 메시지 삽입
        const emoteParts = this._parseEmotes(displayMessage, emotes);
        this._appendMessageContent(messageEle, emoteParts);

        // 메시지 길이 기반 스타일 조정
        if (displayMessage.length <= 5) {
            messageEle.style.fontSize = (2.6 - displayMessage.length / 3) + "em";
            messageEle.style.textAlign = "center";
            chatBox.style.left = (this.boxPos % 100) + Math.random() * 5 % 10 + "%";
        } else {
            this.boxPos = this.boxPos % 100;
            chatBox.style.left = this.boxPos + "%";
        }

        // 애니메이션 적용 (나락, 흔들기 등)
        let usesSlot = true;
        let timeout = 10000;
        const animResult = this._applyAnimations(normOriginal, displayMessage, elements);

        if (animResult.usesSlot === false) usesSlot = false;
        if (animResult.timeout) timeout = animResult.timeout;

        // 슬롯 관리 (화면 겹침 방지)
        if (usesSlot) {
            this.boxPos += 20;
            this.activeBubbles.push(chatBox);
        }

        // DOM 조립 및 화면 표시
        nameBox.appendChild(badgeEle);
        nameBox.appendChild(nameEle);
        chatLineInner.appendChild(nameBox);
        chatLineInner.appendChild(messageEle);
        chatBox.appendChild(elements.chatLine);
        // chatLine -> chatLineBg/chatUser -> chatLineInner -> ... 구조 보존
        elements.chatLine.appendChild(elements.chatLineBg);
        elements.chatLine.appendChild(elements.chatUser);
        elements.chatLineBg.appendChild(chatLineInner);

        this.container.appendChild(chatBox);

        requestAnimationFrame(() => chatBox.classList.add('visible'));

        // 오래된 버블 제거 (슬롯 관리)
        if (this.activeBubbles.length > 5) {
            let cb = this.activeBubbles.shift();
            if (cb) cb.classList.remove('visible');
        }

        // 타임아웃 제거
        if (timeout) {
            setTimeout(() => {
                if (chatBox.parentElement) {
                    chatBox.classList.remove('visible');
                    setTimeout(() => chatBox.remove(), 1000);
                }
            }, timeout);
        }
    }

    _createBubbleElements() {
        let chatBox = document.createElement('div'); chatBox.className = 'chat-box';
        let chatLine = document.createElement('div'); chatLine.className = 'chat-line';
        let chatLineBg = document.createElement('div'); chatLineBg.className = 'chat-line-bg';
        let chatLineInner = document.createElement('div'); chatLineInner.className = 'chat-line-inner';
        let chatLineTail = document.createElement('div'); chatLineTail.className = 'chat-line-inner-tail';
        let chatUser = document.createElement('div'); chatUser.className = 'chat-user';
        let nameBox = document.createElement('div'); nameBox.className = 'name-box';
        let nameEle = document.createElement('span'); nameEle.className = 'user-name';
        let badgeEle = document.createElement('span');
        let messageEle = document.createElement('span'); messageEle.className = 'message';

        chatLineInner.appendChild(chatLineTail);

        return { chatBox, chatLine, chatLineBg, chatLineInner, chatUser, nameBox, nameEle, badgeEle, messageEle };
    }

    _resolveColor(color, uid) {
        if (color && color !== "#000000" && color.startsWith("#")) return color;
        if (color === "#000000") return "#000000"; // Black logic handled in filters
        if (typeof randomColor === 'function') return randomColor({ luminosity: 'light', seed: uid });
        return '#5555ff';
    }

    _applyTextFilters(msg, els, color) {
        const { chatLineInner, nameBox, nameEle, messageEle, badgeEle } = els;
        const lowerMsg = msg.toLowerCase();

        // 1. 흑화 / RIP
        if (lowerMsg.includes("ㅜㅑ")) {
            chatLineInner.style.borderColor = "pink"; chatLineInner.style.background = "hotpink";
            nameBox.style.background = "pink"; nameBox.style.borderColor = "pink";
            nameEle.style.color = "black"; messageEle.style.color = "white";
            messageEle.style.filter = "blur(3px)"; badgeEle.style.filter = "blur(3px)"; nameEle.style.filter = "blur(4px)";
        } else if (["x", "f", "rip"].includes(lowerMsg) || (msg.startsWith("-") && msg.endsWith("-") && msg.length === 3)) {
            chatLineInner.style.borderColor = "black"; chatLineInner.style.background = "#595959";
            chatLineInner.style.color = "#ffffff"; nameBox.style.background = "black";
            chatLineInner.style.borderWidth = "10px"; messageEle.style.fontSize = "3.0em";
            chatLineInner.style.textAlign = "center";
        }

        // 2. 똥/몬헌 관련
        if (this._includesAny(["똥", "츠지모토", "후지오카", "토쿠다", "야스노리", "스즈키", "이치하라"], msg)) {
            chatLineInner.style.color = "#c28f38"; chatLineInner.style.textShadow = "0 0 10px #946f2f";
        } else if (this._includesAny(["흑화", "흑"], msg)) {
            messageEle.style.textShadow = "0px 0px 30px #000000, 0 0px 10px #000000";
            messageEle.style.color = "grey";
        }

        // 3. LED / 빛
        if (msg.includes("빛")) {
            chatLineInner.style.animationName = "chat-hvn-glow";
            chatLineInner.style.animationIterationCount = 10; chatLineInner.style.animationDuration = "1s";
        } else if (this._includesAny(["무지개", "겜성", "led", "rgb"], lowerMsg)) {
            chatLineInner.style.animationName = "chat-hvn-rainbow";
            chatLineInner.style.animationIterationCount = 10; chatLineInner.style.animationDuration = "2.5s";
        }
    }

    _applyAnimations(normOriginal, message, els) {
        const { chatBox, messageEle, chatLineInner, nameBox } = els;
        let usesSlot = true;
        let timeout = null;

        if (normOriginal.includes("ㅂㄷㅂㄷ")) {
            messageEle.style.animation = "chat-hvn-vibrate-laugh 0.5s linear 30";
        } else if (normOriginal.includes("유격")) {
            usesSlot = false;
            chatBox.style.width = "auto"; messageEle.style.whiteSpace = "nowrap";
            chatBox.style.left = "0"; chatBox.style.top = "0"; chatBox.style.bottom = "auto";
            chatBox.style.transform = "none";
            chatBox.style.animation = "chat-hvn-slideDiagonal 3s linear forwards";
            messageEle.style.fontSize = "2.5em";
            timeout = 3500;
        } else if (this._includesAny(["조이고"], message) || (message.startsWith(")") && message.endsWith("("))) {
            messageEle.style.animation = "chat-hvn-shrinkX 3s linear forwards";
        } else if (normOriginal.includes("압축")) {
            messageEle.style.animation = "chat-hvn-squeeze 2s linear forwards";
            messageEle.style.display = "inline-block"; messageEle.style.whiteSpace = "nowrap";
            chatLineInner.style.textAlign = "center";
        } else if (message.includes("자라나라")) {
            messageEle.style.animation = "chat-hvn-growY 1s linear infinite";
        } else if (message.includes("))")) {
            messageEle.style.fontSize = "3em"; messageEle.style.textAlign = "center";
            messageEle.style.animation = "chat-hvn-hipDance 1.8s linear infinite";
        } else if (message.includes("((")) {
            messageEle.style.fontSize = "3em"; messageEle.style.textAlign = "center";
            messageEle.style.animation = "chat-hvn-hipDanceReverse 1.8s linear infinite";
        } else if (message.includes("나죽어")) {
            chatBox.style.animation = "chat-hvn-death 3s linear forwards"; timeout = 3000;
        } else if (message.includes("흡!") || message.endsWith("흡")) {
            chatBox.style.animation = "chat-hvn-fadeOutFall 6s forwards"; timeout = 6000;
        } else if (message.startsWith("성불")) {
            chatBox.style.animation = "chat-hvn-toHeaven 5s forwards";
        } else if (["갔냐?", "갔냐", "ㄱㄴ?", "ㄱㄴㄱㄴ?", "ㄱㄴ", "ㄱㄴㄱㄴ"].includes(message)) {
            chatBox.style.animation = "chat-hvn-scout 4s linear forwards";
        } else if (this._includesAny(["덜렁덜렁", "ㄷㄹㄷㄹ", "출렁", "덜렁"], message)) {
            chatBox.style.animation = "chat-hvn-balls 2s linear forwards"; timeout = 3000;
        } else if (message.endsWith("~")) {
            chatBox.style.animation = `chat-hvn-wave 1s linear ${Math.max(1, (message.match(/~/g) || []).length)}`;
        } else if (message.startsWith("앗") || message.includes("엌")) {
            chatBox.style.animation = "chat-hvn-upDown .4s forwards";
        } else if (this._includesAny(["맞음", "맞아요", "ㅔ", "ㅖ", "ㅇㅇ", "ㅇㅋ", "ㄹㅇ"], message)) {
            chatBox.style.animation = "chat-hvn-yes .6s 2";
        } else if (message.includes("?")) {
            chatBox.style.animation = "chat-hvn-shake4 .3s linear";
        } else if (this._includesAny(["안녕", "👋"], message) || (message.endsWith("하") || message.endsWith("바"))) {
            chatBox.style.animation = "chat-hvn-shake4 .3s linear 5";
        } else if (["해", "명", "극", "나", "락"].includes(message) || message.endsWith("!")) {
            chatBox.style.animation = "chat-hvn-shake3 .4s linear 50";
        } else if (message.includes("ㄷㄷ")) {
            chatBox.style.animation = `chat-hvn-fear .3s linear ${Math.max(1, (message.match(/ㄷ/g) || []).length)}`;
        } else if (this._includesAny(["ㅠㅠ", "ㅠㅜ", "ㅜㅠ", "ㅜㅜ"], message)) {
            chatBox.style.animation = "chat-hvn-crying 1.5s linear 5";
        } else if (message.includes("ㄴㄴ")) {
            chatBox.style.animation = `chat-hvn-nope 1s linear ${Math.max(1, (message.match(/ㄴ/g) || []).length)}`;
        } else if (message.includes("ㅋㅋ") || message.includes("ㅎㅎ")) {
            chatBox.style.animation = `chat-hvn-vibrate-laugh 0.5s linear ${Math.max(1, (message.match(/[ㅋㅎ]/g) || []).length)}`;
        } else if (message.includes("ㄱㄱ")) {
            chatBox.style.animation = `chat-hvn-walking 1s linear ${Math.max(1, (message.match(/ㄱ/g) || []).length)}`;
        } else if (message.includes("헤으응")) {
            chatBox.style.animation = "chat-hvn-shrink 2s linear forwards";
            chatLineInner.style.animation = "chat-hvn-shy 2s linear forwards";
        } else if (["ㄴㅇㄱ", "ㅇ0ㅇ", 'oOo', 'o0o'].includes(message)) {
            messageEle.style.fontSize = "2.6em";
            chatBox.style.animation = "chat-hvn-surprised 0.5s ease-in forwards";
        } else if (this._includesAny(["...", ";;"], message)) {
            chatBox.style.animation = "chat-hvn-fall 10s linear forwards";
        } else if (message == "히오스" || message == "짜잔") {
            chatBox.style.animation = "chat-hvn-Hots 1s linear forwards"; timeout = 3000;
        } else if (message.includes("둠칫둠칫")) {
            messageEle.style.fontSize = "2.2em"; messageEle.style.textAlign = "center";
            chatBox.style.animation = "chat-hvn-beat 0.5s linear 20";
            messageEle.style.animation = "chat-hvn-beat 0.5s linear 20";
        } else if (normOriginal.includes("제발") || message == "🤣") {
            nameBox.style.animation = "chat-hvn-shake3 0.3s linear 50";
            messageEle.style.animation = "chat-hvn-shake2 0.2s linear 40";
        } else if (message == "틀") {
            messageEle.innerText = "-틀-";
            nameBox.style.animation = "chat-hvn-shake3 0.4s linear 40";
            messageEle.style.animation = "chat-hvn-shake3 0.4s linear 40";
            chatBox.style.animation = "chat-hvn-fear 6s linear 10";
        } else if (["지나갑니다", "실례합니다", "수레"].includes(message) || this._includesAny(["가즈아", "드가자"], message) || message.endsWith("ㅏㅏ")) {
            usesSlot = false;
            const fromLeft = Math.random() >= 0.5;
            chatBox.style.left = fromLeft ? "-350px" : "auto"; chatBox.style.right = fromLeft ? "auto" : "-350px";
            chatBox.style.animation = `${fromLeft ? 'chat-hvn-passThroughLtoR' : 'chat-hvn-passThroughRtoL'} 3.5s ease-in forwards`;
            timeout = 3000;
        } else if (["나락", "떡락"].includes(message) || normOriginal.startsWith("!나락") || normOriginal.startsWith("!떡락")) {
            usesSlot = false;
            chatBox.style.width = "auto"; messageEle.style.whiteSpace = "nowrap";
            chatBox.style.left = Math.random() * 90 + "%"; chatBox.style.bottom = "1300px";
            chatBox.style.animation = "chat-hvn-passThrough2 3s cubic-bezier(0.31, 0.44, 0.445, 1.65) forwards";
            messageEle.style.fontSize = "2.5em"; timeout = 3500;
        } else if (["극락", "떡상", "🦇"].includes(message) || normOriginal.startsWith("!극락") || normOriginal.startsWith("!떡상")) {
            usesSlot = false;
            chatBox.style.width = "auto"; messageEle.style.whiteSpace = "nowrap";
            chatBox.style.left = Math.random() * 90 + "%"; chatBox.style.bottom = "-500px";
            chatBox.style.animation = "chat-hvn-passThrough3 3s cubic-bezier(0.31, 0.44, 0.445, 1.65) forwards";
            messageEle.style.fontSize = "2.5em"; timeout = 3500;
        }

        return { usesSlot, timeout };
    }

    _parseEmotes(message, emotes) {
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

    _appendMessageContent(ele, data) {
        data.forEach(n => {
            if (typeof n === 'string') ele.appendChild(document.createTextNode(n));
            else if (typeof n === 'object' && n.url) {
                let img = document.createElement('img'); img.src = n.url;
                img.classList.add('emote_chzzk');
                img.style.height = "1.2em"; img.style.verticalAlign = "middle";
                ele.appendChild(img);
            }
        });
        if (window.twemoji) twemoji.parse(ele);
    }

    _includesAny(suffixes, string) { for (let s of suffixes) if (string.includes(s)) return true; return false; }

}

// ==========================================
// [Class 5] Visual Director (Effects Engine)
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

        // 1. Sound (Using Audio Manager)
        if (soundEnabled && effect.soundKey && window.audioManager) {
            window.audioManager.playSound(window.soundHive[effect.soundKey]);
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
        const triggerKw = "커플";
        if (displayMsg.startsWith(triggerKw)) displayMsg = displayMsg.substring(triggerKw.length).trim();

        const wrappedMsg = this._wrapText(displayMsg, 200);
        const centerMsgSnippet = document.createElement('div');
        centerMsgSnippet.className = 'visual-center-text heart-style';
        centerMsgSnippet.innerHTML = renderMessageWithEmotesHTML(wrappedMsg, context.emotes || {}, 2.0);
        centerMsgSnippet.style.animation = "hvn-couple-fadeIn 1s forwards";

        document.body.appendChild(centerMsgSnippet);

        return new Promise(resolve => {
            flashback.classList.add('visible');
            setTimeout(() => { centerMsgSnippet.style.animation = "hvn-couple-fadeOut 1s forwards"; }, 10300);
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

                const personRanges = [[0x1F600, 0x1F64F], [0x1F466, 0x1F480], [0x1F9DC, 0x1F9DF], [0x1F470, 0x1F478]];
                const heartRanges = [[0x1F493, 0x1F49F], [0x2764, 0x2764], [0x1F9E1, 0x1F9E1], [0x1F90D, 0x1F90E], [0x1F48B, 0x1F48D]];

                const p1 = getRandomFromRanges(personRanges), p2 = getRandomFromRanges(personRanges), h3 = getRandomFromRanges(heartRanges);

                const updateState = (step) => {
                    const hue = Math.floor(Math.random() * 360);
                    overlay.style.backgroundColor = `hsla(${hue}, 100%, 70%, 0.3)`;
                    emojiContainer.classList.remove('grow-effect'); void emojiContainer.offsetWidth; emojiContainer.classList.add('grow-effect');
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
                    overlay.style.backgroundColor = ''; overlay.classList.remove('visible');
                    emojiContainer.innerText = '❤️‍🩹'; emojiContainer.style.fontSize = '';
                    resolve();
                }, 9000);
            }, 11800);
        });
    }

    _runHeart(context) {
        const id = 'heart-overlay-root'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483647; pointer-events:none;";
        ov.innerHTML = `<div id="heart-overlay" class="visible"><div id="heart-backdrop"></div><div class="heart-emoji-container"></div><div class="heart-flash"></div></div>`;
        document.body.appendChild(ov);

        const overlay = ov.querySelector('#heart-overlay'), backdrop = ov.querySelector('#heart-backdrop'), flash = ov.querySelector('.heart-flash'), emojiContainer = ov.querySelector('.heart-emoji-container');

        let msg = context.message || ""; if (msg.startsWith("하트")) msg = msg.substring(2).trim();
        const parts = this._splitMessageIntoParts(msg, 4);

        const showPart = (text, delay, duration, isFinal = false) => {
            if (!text) return;
            setTimeout(() => {
                const el = document.createElement('div'); el.className = isFinal ? 'heart-premium-text' : 'heart-dreamy-text';
                const scale = isFinal ? 1.5 : 1.3;
                let html = renderMessageWithEmotesHTML(this._wrapText(text, 200), context.emotes || {}, scale);

                // If final and single emoji, don't let it be 15rem (premium-text default)
                if (isFinal && !text.includes(' ') && text.length <= 2) {
                    el.style.fontSize = '8rem';
                }

                el.innerHTML = html;
                document.body.appendChild(el);
                el.style.animation = "hvn-heart-fadeIn 0.5s forwards";
                setTimeout(() => { el.style.animation = "hvn-heart-fadeOut 0.5s forwards"; setTimeout(() => el.remove(), 500); }, duration - 500);
            }, delay);
        };
        showPart(parts[0], 0, 4000); showPart(parts[1], 4000, 3500); showPart(parts[2], 7500, 2800); showPart(parts[3], 10300, 1000, true);

        return new Promise(resolve => {
            const startEmojiTime = 11000, endTime = 18000;
            const getRandomFromRanges = (ranges) => {
                let total = 0; ranges.forEach(r => total += (r[1] - r[0] + 1));
                let randomIdx = Math.floor(Math.random() * total);
                for (let r of ranges) {
                    let size = (r[1] - r[0] + 1); if (randomIdx < size) return String.fromCodePoint(r[0] + randomIdx);
                    randomIdx -= size;
                }
                return String.fromCodePoint(ranges[0][0]);
            };
            const allEmojiRanges = [[0x1F600, 0x1F64F], [0x1F9D1, 0x1F9D1], [0x2764, 0x2764], [0x1F493, 0x1F49F], [0x1F466, 0x1F469], [0x1F48B, 0x1F48B]];
            const delays = [1000, 300, 700];
            let delayIdx = 0, currentTime = startEmojiTime, emojiCounter = 0, lastWrapper = null;

            while (currentTime < endTime) {
                const time = currentTime, currentCount = ++emojiCounter;
                setTimeout(() => {
                    const prev = lastWrapper, wrapper = document.createElement('div');
                    wrapper.style.cssText = `position:absolute; left:${Math.random() * 30 + 35}%; top:${Math.random() * 30 + 35}%; transform:translate(-50%,-50%) rotate(${Math.random() * 60 - 30}deg); z-index:15; display:flex; justify-content:center; align-items:center; width:40rem; height:40rem;`;
                    const em = document.createElement('div'); em.className = 'heart-dreamy-emoji'; em.innerText = getRandomFromRanges(allEmojiRanges);
                    wrapper.appendChild(em); emojiContainer.appendChild(wrapper); lastWrapper = wrapper;
                    if (window.twemoji) twemoji.parse(wrapper);
                    if (prev) setTimeout(() => { if (prev.parentNode) prev.remove(); }, 100);
                    if ((currentCount - 1) % 3 === 0) { flash.style.transition = 'none'; flash.style.opacity = '0.3'; setTimeout(() => { flash.style.transition = 'opacity 0.5s'; flash.style.opacity = '0'; }, 100); }
                    setTimeout(() => { if (wrapper.parentNode) wrapper.remove(); }, 2000);
                }, time);
                currentTime += delays[delayIdx % delays.length]; delayIdx++;
            }
            setTimeout(() => { ov.style.transition = 'opacity 1s'; ov.style.opacity = '0'; setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 1000); }, 18000);
        });
    }

    _runVergil(context) {
        const id = 'void-overlay'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.innerHTML = '<div id="void-backdrop"></div><div id="void-slashes"></div>'; document.body.appendChild(ov);
        const slashC = document.getElementById('void-slashes'), backdrop = document.getElementById('void-backdrop');
        backdrop.style.opacity = 1;
        const slashes = [];
        for (let i = 0; i < 30; i++) {
            const s = document.createElement('div'); s.className = 'void-slash';
            s.style.cssText = `position:absolute; top:${10 + Math.random() * 80}%; left:${10 + Math.random() * 80}%; height:${1 + Math.random() * 49}px; --rot:${Math.random() * 360}deg; z-index:${200 - i}; animation:hvn-vergil-slashEnter 0.2s forwards ${i * 0.02}s;`;
            slashC.appendChild(s); slashes.push(s);
        }
        return new Promise(resolve => {
            setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 19000);
            setTimeout(() => { slashes.forEach(s => s.style.animation = `hvn-vergil-slashTremble ${0.05 + Math.random() * 0.1}s infinite`); }, 5200);
            setTimeout(() => {
                slashes.forEach(s => { s.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => s.remove(), 1000); });
                for (let i = 0; i < 12; i++) {
                    const row = Math.floor(i / 4), col = i % 4, w = window.innerWidth / 4, h = window.innerHeight / 3;
                    const cx = (col * w) + (w * 0.2) + (Math.random() * w * 0.6), cy = (row * h) + (h * 0.2) + (Math.random() * h * 0.6);
                    for (let j = 0; j < 20; j++) {
                        const shard = document.createElement('div'); shard.className = 'void-shard';
                        const ang = Math.random() * 360, d = 200 + Math.random() * 400;
                        shard.style.cssText = `left:${cx + Math.random() * 40 - 20}px; top:${cy + Math.random() * 40 - 20}px; --tx:${Math.cos(ang * Math.PI / 180) * d}px; --ty:${Math.sin(ang * Math.PI / 180) * d}px; --rot:${Math.random() * 360}deg;`;
                        const dur = 1.5 + Math.random() * 2; shard.style.animation = `hvn-vergil-shardFly ${dur}s ease-out forwards`;
                        ov.appendChild(shard); setTimeout(() => shard.remove(), dur * 1000);
                    }
                }
                backdrop.style.opacity = 0;
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
        const id = 'dolphin-overlay-root'; let ov = document.getElementById(id); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = id;
        ov.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:2147483640; pointer-events:none; transition:opacity 0.5s; overflow:hidden;";
        ov.innerHTML = `<div id="dolphin-overlay" class="visible event-normal"><div class="dolphin-light dolphin-light-left"></div><div class="dolphin-light dolphin-light-right"></div><div class="dolphin-sea-bottom"><div class="sea-wave"></div></div></div>`;
        document.body.appendChild(ov);

        const overlayC = ov.querySelector('#dolphin-overlay');
        const surfingEmojis = ["🏄", "🏄‍♂️", "🏄‍♀️"];
        this._spawnActor(overlayC, 'surfer-actor', surfingEmojis[Math.floor(Math.random() * surfingEmojis.length)], {
            duration: 21000,
            styles: {
                nametag: (context.nickname || "Anonymous"),
                nameColor: (context.color || "#00ffa3"),
                left: '-20vw',
                animation: 'hvn-dolphin-surfer 21s linear forwards'
            }
        });

        setTimeout(() => {
            const dolphinEl = this._spawnActor(overlayC, 'lead-dolphin', "🐬", { duration: 15000 });
            const animateWildBounce = (el, total) => {
                const start = Date.now(); let rot = 0;
                const bounce = () => {
                    const elapsed = Date.now() - start; if (elapsed >= total) return;
                    const x = 10 + Math.random() * 80, y = 10 + Math.random() * 80, d = 360 + Math.random() * 6040;
                    rot -= d; el.style.transition = `top 600ms ease-in-out, left 600ms ease-in-out, transform 1200ms cubic-bezier(0.1, 0.5, 0.2, 1)`;
                    el.style.left = `${x}%`; el.style.top = `${y}%`; el.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1.2)`;
                    setTimeout(bounce, 1000 + Math.random() * 400);
                };
                el.style.left = '50%'; el.style.top = '50%'; el.style.transform = 'translate(-50%, -50%) scale(0)';
                setTimeout(() => { el.style.transition = "transform 0.5s"; el.style.transform = 'translate(-50%, -50%) scale(1.2)'; setTimeout(bounce, 500); }, 100);
            };
            if (dolphinEl) animateWildBounce(dolphinEl, 14000);
        }, 6000);

        const seaCreatures = ["🐋", "🐳", "🦈", "🦭", "🪼", "🐙", "🐠", "🐡", "🧜‍♀️", "🧜"];
        let accDelay = 0;
        for (let i = 0; i < 30; i++) {
            const interval = 500 + Math.random() * 500; accDelay += interval;
            setTimeout(() => {
                const fromLeft = (i % 2 === 0);
                this._spawnActor(overlayC, 'sea-jump', seaCreatures[Math.floor(Math.random() * seaCreatures.length)], {
                    duration: 4000,
                    styles: {
                        '--sx': (fromLeft ? '-10%' : '110%'), '--ex': (fromLeft ? '110%' : '-10%'),
                        '--sr': (fromLeft ? '-120deg' : '120deg'), '--er': (fromLeft ? '120deg' : '-120deg'),
                        '--sc': (fromLeft ? '-1' : '1')
                    }
                });
            }, accDelay);
        }

        let msg = context.message || ""; if (msg.startsWith("돌핀")) msg = msg.substring(2).trim();
        if (msg) {
            setTimeout(() => {
                const txt = document.createElement('div'); txt.className = 'dolphin-text';
                txt.innerHTML = renderMessageWithEmotesHTML(this._wrapText(msg, 200, "<br>"), context.emotes || {}, 2.0);
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
            el.innerHTML = renderMessageWithEmotesHTML(this._wrapText(text, 200), emotes || {}, 1.5);
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
        const words = msg.split(/\s+/).filter(w => w.length > 0); let parts = new Array(count).fill("");
        if (words.length === 0) return parts; if (words.length === 1) { parts[count - 1] = words[0]; return parts; }
        const last = words.pop(); const rem = words;
        if (rem.length === 1) { parts[0] = parts[1] = parts[2] = rem[0]; parts[3] = last; }
        else if (rem.length === 2) { parts[0] = parts[1] = rem[0]; parts[2] = rem[1]; parts[3] = last; }
        else { const p1 = Math.ceil(rem.length / 3); const p2 = Math.ceil((rem.length - p1) / 2); parts[0] = rem.slice(0, p1).join(' '); parts[1] = rem.slice(p1, p1 + p2).join(' '); parts[2] = rem.slice(p1 + p2).join(' '); parts[3] = last; }
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

// ==========================================
// [Execution & Init]
// ==========================================
const appConfig = new ConfigManager();
const audioManager = new AudioManager();
const chatRenderer = new ChatRenderer();
const visualDirector = new VisualDirector(appConfig);

// 전역 참조 (디버깅 및 호환성용)
window.audioManager = audioManager;
window.visualDirector = visualDirector;

// 네트워크 연결 시작
const network = new ChzzkGateway(appConfig, (msgData) => {
    // 1. 시각 효과 트리거 확인 (강화: 매핑 시스템 적용)
    const visualMap = {
        '해골': 'skull', '우쇼': 'usho', '커플': 'couple',
        '하트': 'heart', '버질': 'vergil', '돌핀': 'dolphin'
    };
    const trimmedMsg = msgData.message.trim();
    const foundKeyword = Object.keys(visualMap).find(k => trimmedMsg.startsWith(k) || trimmedMsg.startsWith('!' + k));

    if (foundKeyword) {
        const effectType = visualMap[foundKeyword];
        visualDirector.trigger(effectType, {
            message: msgData.message,
            emotes: msgData.emojis,
            nickname: msgData.nickname,
            color: msgData.color
        });
    } else {
        // 2. 일반 채팅 렌더링 (사운드 재생 포함)
        audioManager.checkAndPlay(msgData.message);
        chatRenderer.render(msgData);
    }
});

// 자동 시작
network.connect();

// [Utility Helpers Compatibility]
function renderMessageWithEmotesHTML(message, emotes, scale = 1.0) {
    // Legacy helper for VisualDirector
    let content = message;
    if (emotes && Object.keys(emotes).length > 0) {
        content = message.replace(/\{:?[^:{} ]+:?\}/g, (match) => {
            const emoteId = match.replace(/[\{:?\}]/g, "");
            const d = emotes[emoteId];
            const url = (d && (typeof d === 'string' ? d : (d.imageUrl || d.url))) || null;
            return url ? `<img src="${url}" class="emote_chzzk_inline" style="height: ${1.2 * scale}em; vertical-align: middle; display: inline-block;" alt="${emoteId}">` : match;
        });
    }

    if (window.twemoji) {
        const temp = document.createElement('div');
        temp.innerHTML = content;
        twemoji.parse(temp);
        const images = temp.querySelectorAll('img.emoji');
        images.forEach(img => {
            img.style.height = `${scale}em`;
            img.style.width = `${scale}em`;
            img.style.verticalAlign = 'middle';
            img.style.display = 'inline-block';
        });
        return temp.innerHTML;
    }
    return content;
}

// [Utility] Plette Stackable Color Blending
function pSBC(p, c0, c1, l) {
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    const pSBCr = (d) => {
        let n = d.length, x = {};
        if (n > 9) { [r, g, b, a] = d = d.split(","), n = d.length; if (n < 3 || n > 4) return null; x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1 }
        else { if (n == 8 || n == 6 || n < 4) return null; if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : ""); d = i(d.slice(1), 16); if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000; else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1 } return x
    };
    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}