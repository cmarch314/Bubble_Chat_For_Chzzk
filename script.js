// ==========================================
// [Global Variables] 기본 전역 변수
// ==========================================
const idElement = document.getElementById('id');
const chatEle = document.getElementById('chat');
let boxPos = 0;
const mainArray = [];
let soundEnabled = true;
const promptQue = [];
let visualConfig = {};
let soundHive = {};

// [Refactor] Twitch -> Chzzk 변수명 변경
const chzzkBadgeCache = { data: { global: {} } };

// ==========================================
// [Class 1] Config & State Manager
// ==========================================
class ConfigManager {
    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.has('debug');
        this.loadHistory = urlParams.has('history');
        this.channelId = this._resolveChannelId();
        this.startupCommand = this._resolveStartupCommand(urlParams);

        this._initBroadcastChannel();
        this._loadLocalConfig();
    }

    _resolveStartupCommand(params) {
        console.log("[Config] Resolving Startup Command from:", params.toString());
        // 1. ?debug!EffectName
        for (const [key, val] of params.entries()) {
            if (key.includes('!')) {
                const parts = key.split('!');
                if (parts[1]) {
                    try {
                        const decoded = decodeURIComponent(parts[1]);
                        console.log("[Config] Found command in key:", decoded);
                        return decoded;
                    } catch (e) {
                        console.warn("[Config] Decoding failed for key:", parts[1], e);
                        return parts[1];
                    }
                }
            }
            if (val.startsWith('!')) {
                try {
                    const decoded = decodeURIComponent(val.substring(1));
                    console.log("[Config] Found command in value:", decoded);
                    return decoded;
                } catch (e) {
                    console.warn("[Config] Decoding failed for value:", val, e);
                    return val.substring(1);
                }
            }
        }
        // 2. ?effect=EffectName
        if (params.has('effect')) {
            try {
                const decoded = decodeURIComponent(params.get('effect'));
                console.log("[Config] Found command in effect param:", decoded);
                return decoded;
            } catch (e) {
                console.warn("[Config] Decoding failed for effect param:", params.get('effect'), e);
                return params.get('effect');
            }
        }
        // 3. ?trigger=EffectName
        if (params.has('trigger')) {
            try {
                const val = params.get('trigger');
                const decoded = val.startsWith('!') ? decodeURIComponent(val.substring(1)) : decodeURIComponent(val);
                console.log("[Config] Found command in trigger param:", decoded);
                return decoded;
            } catch (e) {
                console.warn("[Config] Decoding failed for trigger param:", params.get('trigger'), e);
                return params.get('trigger');
            }
        }

        return null; // Default
    }

    _resolveChannelId() {
        // 1. 로컬 스토리지 값 최우선
        const local = localStorage.getItem('CHZZK_CHANNEL_ID');

        // 2. Config 파일 (README에 명시된 기능 복구)
        const configId = window.CHZZK_CHANNEL_ID || null;

        // 3. HTML 속성 확인 (이제 chzzkHash만 찾습니다)
        const attr = document.getElementById('id')?.getAttribute('chzzkHash');

        // twitchId는 이제 지원하지 않음
        return local || configId || attr;
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
                if (window.audioManager) {
                    if (data.soundConfig) window.audioManager.updateConfig(data.soundConfig);
                    if (data.volumeConfig) window.audioManager.updateVolumeConfig(data.volumeConfig);
                }
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

        const defaultsVolume = window.HIVE_VOLUME_CONFIG || { master: 1.0, visual: 1.0, sfx: 1.0 };
        const savedVolume = localStorage.getItem('HIVE_VOLUME_CONFIG');
        let activeVolume = defaultsVolume;

        if (savedVolume) {
            try { activeVolume = { ...defaultsVolume, ...JSON.parse(savedVolume) }; } catch (e) { }
        }

        // AudioManager가 생성된 후 설정 주입을 위해 전역에 잠시 저장
        window.__INITIAL_SOUND_CONFIG = activeSound;
        window.__INITIAL_VOLUME_CONFIG = activeVolume;
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
            "https://api.allorigins.win/get?url=", // Wrapper proxy (Excellent reliability)
            "https://corsproxy.io/?",
            "https://api.codetabs.com/v1/proxy?quest=",
            "https://thingproxy.freeboard.io/fetch/",
            "https://api.cors.lol/?url=", // New addition
            "https://cors-anywhere.herokuapp.com/" // Fallback (often rate limited but worth a try)
        ];
        this.attemptCount = 1;
    }

    async connect() {
        const id = this.config.channelId || "NULL";
        const src = this.config.idSource || "Unknown";
        this._showLoader(`치지직 채널 접속 중...<br><div style="font-size: 0.5em; margin-top: 10px; opacity: 0.7; word-break: break-all;">ID: ${id}</div><div style="font-size: 0.4em; margin-top: 5px; opacity: 0.5;">(${this.attemptCount}번째 시도)</div>`, "loading");

        try {
            if (!this.config.channelId || this.config.channelId === "NULL") {
                throw new Error("채널 ID가 설정되지 않았습니다. config.js 혹은 URL 파라미터를 확인해주세요.");
            }

            const statusData = await this._fetchWithProxy(
                `https://api.chzzk.naver.com/polling/v2/channels/${this.config.channelId}/live-status`
            );
            if (!statusData || !statusData.content) throw new Error("채널 라이브 상태 정보를 가져올 수 없습니다.");
            const { chatChannelId } = statusData.content;

            this._showLoader(`채팅 서버 접근 권한 요청 중... [${id}] (${this.attemptCount}번째 시도)`, "loading");
            const tokenData = await this._fetchWithProxy(
                `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`
            );
            if (!tokenData || !tokenData.content) throw new Error("채팅 토큰 정보를 가져올 수 없습니다.");
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
            window.dispatchEvent(new CustomEvent('chzzk_connected')); // Signal connection success
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

        // [FIX] 93102 (후원/구독) 코드 필수 포함
        if ([93101, 93102, 15101, 94101].includes(data.cmd)) {
            const chats = (data.cmd === 15101) ? data.bdy.messageList : data.bdy;
            if (!chats) return; // Null check added back for stability

            // 93102나 94101이 단일 객체로 올 수 있으므로 배열로 변환
            const chatArray = Array.isArray(chats) ? chats : [chats];

            chatArray.forEach(chat => {
                if (!chat) return; // Individual chat null check
                let profile = {}, extra = {};
                try {
                    profile = chat.profile ? JSON.parse(chat.profile) : {};
                    extra = chat.extras ? JSON.parse(chat.extras) : {};
                } catch (e) {
                    console.error("JSON Parse Error (Profile/Extras):", e);
                    return; // Skip malformed chat
                }

                // [Protocol V1.0] 타입 코드 식별 (msgTypeCode fallback 추가)
                const msgType = chat.messageTypeCode || chat.msgTypeCode || 1;
                const isDonation = (msgType === 10);
                const isSubscription = (msgType === 11);

                // [Fix] Extract color safely
                let colorCode = null;
                if (profile && profile.streamingProperty && profile.streamingProperty.nicknameColor) {
                    colorCode = profile.streamingProperty.nicknameColor.colorCode;
                }

                let donationAmount = 0;
                let subMonth = 0;
                if (isDonation) donationAmount = extra.payAmount || 0;
                if (isSubscription) subMonth = extra.month || 1;

                const messageData = {
                    message: chat.msg || chat.content || "",
                    nickname: profile.nickname || "Anonymous",
                    color: colorCode,
                    badges: profile.activityBadges || [],
                    emojis: extra.emojis || {},
                    isStreamer: profile.userRoleCode === 'streamer',
                    uid: profile.userIdHash,
                    type: 'chat',

                    // [Antigravity 확장 필드]
                    isDonation: isDonation,
                    donationAmount: donationAmount,
                    isSubscription: isSubscription,
                    subMonth: subMonth,
                    msgType: msgType
                };

                this.onMessage(messageData);
            });
        }
    }

    async _fetchWithProxy(url) {
        let errors = [];

        // 1. Primary: AllOrigins (Most reliable for Chzzk APIs)
        try {
            // Add cache buster to prevent stale error responses
            const cacheBuster = `&_t=${Date.now()}`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}${cacheBuster}`;
            const res = await fetch(proxyUrl);
            if (res.ok) {
                const wrapper = await res.json();
                if (wrapper && wrapper.contents) {
                    const data = JSON.parse(wrapper.contents);
                    if (data && data.code !== undefined && data.code !== 200) throw new Error(`Chzzk ${data.code}`);
                    return data;
                }
            }
            errors.push("AllOrigins Failed");
        } catch (e) {
            errors.push(`AllOrigins: ${e.message.substring(0, 20)}`);
        }

        // 2. Secondary: Iterative Proxies
        for (let proxy of this.proxies) {
            if (proxy.includes("allorigins")) continue; // Skip if already tried
            const fullUrl = proxy + encodeURIComponent(url);
            try {
                const res = await fetch(fullUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.code !== undefined && data.code !== 200) throw new Error(`Chzzk ${data.code}`);
                    return data;
                }
                errors.push(`${proxy.split('/')[2]}: H${res.status}`);
            } catch (e) {
                errors.push(`${proxy.split('/')[2]}: ${e.message.substring(0, 15)}`);
            }
        }

        // 3. Final Fallback: Direct (May fail due to CORS)
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
        } catch (e) { }

        throw new Error(`연결 실패 (${errors.join(' | ')})`);
    }

    _showLoader(msg, type) {
        // [Refactor] Use Premium Loading Screen
        const loader = document.getElementById('loading-screen');
        const loaderText = loader ? loader.querySelector('.loader-text') : null;

        if (loader && loaderText) {
            // Update text
            // Strip HTML tags for cleaner look if needed, or keep them if styling allows
            loaderText.innerHTML = msg;
            loader.classList.remove('hidden');

            if (type === 'success') {
                setTimeout(() => {
                    loader.classList.add('hidden');
                    setTimeout(() => loader.remove(), 1000);
                }, 1000);
            } else if (type === 'error') {
                // Keep error visible or style it differently
                loaderText.style.color = '#ff4444';
            }
        } else {
            // Fallback: Create legacy loader if premium one is missing
            let legacyLoader = document.getElementById('chzzk-loader');
            if (!legacyLoader) {
                legacyLoader = document.createElement('div');
                legacyLoader.id = 'chzzk-loader';
                document.body.appendChild(legacyLoader);
                Object.assign(legacyLoader.style, {
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '10px', zIndex: '9999',
                    fontSize: '3em'
                });
            }
            legacyLoader.innerHTML = msg;
            legacyLoader.style.display = 'block';

            if (type === 'success') {
                setTimeout(() => { legacyLoader.style.opacity = 0; setTimeout(() => legacyLoader.remove(), 500); }, 1000);
            }
        }
    }
}

// ==========================================
// [Class 3] Audio Manager (Sound Engine)
// ==========================================
// ==========================================
// [Class 2] Audio Controller (Tunable & Smart-Router)
// * 기능: Config 설정을 받아 실시간으로 오디오를 평준화하거나 우회함
// ==========================================
class AudioManager {
    constructor() {
        this.basePath = './SFX/';
        // [Performance] 오디오 버퍼 캐시 (중복 로딩 방지)
        this.bufferCache = new Map();

        // 1. 오디오 엔진 시동
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        // 2. 컴프레서 생성 (공유 노드)
        this.compressor = this.audioCtx.createDynamicsCompressor();
        this._updateCompressorSettings();

        // 3. 마스터 게인 (최종 출력 천장 - 공유 노드)
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 1.0;

        // [핵심 연결] 컴프레서는 항상 마스터 게인으로 연결됨
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.audioCtx.destination);

        // [Core Settings]
        this.soundHive = {};
        this.enabled = true;
        this.volumeConfig = window.__INITIAL_VOLUME_CONFIG || { master: 1.0, visual: 1.0, sfx: 1.0 };
        // [User Request] Start with low SFX volume during loading
        this.volumeConfig.sfx = 0.1;
        this.updateConfigLegacy(window.__INITIAL_SOUND_CONFIG || {});
    }

    _updateCompressorSettings() {
        if (!this.compressor) return;
        const settings = window.COMPRESSOR_SETTINGS || {
            threshold: -15, knee: 0, ratio: 20, attack: 0, release: 0.1
        };
        this.compressor.threshold.value = settings.threshold;
        this.compressor.knee.value = settings.knee;
        this.compressor.ratio.value = settings.ratio;
        this.compressor.attack.value = settings.attack;
        this.compressor.release.value = settings.release;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (typeof window.soundEnabled !== 'undefined') window.soundEnabled = enabled;
        if (this.audioCtx.state === 'suspended' && enabled) this.audioCtx.resume().catch(() => { });
    }

    // [Legacy] 기존 updateConfig -> updateConfigLegacy로 이름 변경 or 유지
    updateConfigLegacy(config) {
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
        window.soundHive = this.soundHive;
    }

    updateVolumeConfig(config) {
        if (!config) return;
        this.volumeConfig = { ...this.volumeConfig, ...config };
    }

    // [명령어] 설정 변경 메서드 (New)
    updateConfig(key, value) {
        const conf = window.NORMALIZER_CONFIG;
        if (!conf) return;

        let msg = "";
        if (key === 'all') {
            conf.enabled = value;
            msg = `[시스템] 볼륨 평준화: ${value ? 'ON' : 'OFF'}`;
        } else if (key === 'visual') {
            conf.visual = !conf.visual;
            msg = `[시스템] 도네 평준화: ${conf.visual ? 'ON' : 'OFF (원음)'}`;
        } else if (key === 'sfx') {
            conf.sfx = !conf.sfx;
            msg = `[시스템] 채팅 평준화: ${conf.sfx ? 'ON' : 'OFF (원음)'}`;
        }
        console.log(msg); // 콘솔 확인용
        return msg;
    }

    // 소리만 재생 (채팅 트리거용 - Legacy Logic 유지)
    checkAndPlay(message, force = false) {
        if (!this.enabled && !force) return;
        const normOriginal = message.normalize('NFC').trim();

        const visualKeys = new Set();
        if (window.HIVE_VISUAL_CONFIG) {
            Object.keys(window.HIVE_VISUAL_CONFIG).forEach(k => {
                visualKeys.add(k.normalize('NFC'));
                const val = window.HIVE_VISUAL_CONFIG[k];
                if (val && val.soundKey) visualKeys.add(val.soundKey.normalize('NFC'));
                // [New] Also exclude audioOverride keys from chat triggers so they don't double-play or play via chat
                if (val && val.audioOverride) visualKeys.add(val.audioOverride.normalize('NFC'));
            });
        }

        let allMatches = [];
        Object.keys(this.soundHive).forEach(keyword => {
            const normKey = keyword.normalize('NFC');
            if (visualKeys.has(normKey)) return;
            let searchPos = 0, index;
            while ((index = normOriginal.indexOf(normKey, searchPos)) !== -1) {
                allMatches.push({
                    startIndex: index,
                    endIndex: index + normKey.length,
                    length: normKey.length,
                    sound: this.soundHive[keyword],
                    keyword: keyword
                });
                searchPos = index + 1;
            }
        });

        allMatches.sort((a, b) => (a.startIndex === b.startIndex) ? b.length - a.length : a.startIndex - b.startIndex);

        let sequence = [], lastEnd = 0;
        let usedKeywords = new Set();

        for (let match of allMatches) {
            if (match.startIndex >= lastEnd) {
                const firstChar = match.keyword[0];
                // [Fix] Allow single-character keywords (like "쎅") to repeat. Only restrict multi-char repeats (like "ㅋㅋㅋㅋ").
                const isSingleCharRepeat = match.keyword.length > 1 && match.keyword.split('').every(c => c === firstChar);

                // [사용자 피드백 반영]
                // 1. "ㅋㅋㅋㅋ" 같은 한 글자 반복형 키워드만 딱 한 번만 나오도록 제한
                if (isSingleCharRepeat && usedKeywords.has(match.keyword)) continue;

                sequence.push(match);
                lastEnd = match.endIndex;
                usedKeywords.add(match.keyword);

                // 2. 한 글자 반복형인 경우, 뒤에 붙어있는 똑같은 글자들을 모두 건너뜁니다 (중복 방지)
                if (isSingleCharRepeat) {
                    while (lastEnd < normOriginal.length && normOriginal[lastEnd] === firstChar) {
                        lastEnd++;
                    }
                }
            }
        }

        if (sequence.length > 0) {
            (async () => {
                // 매번 재생 전 컴프레서 설정을 최신화 (실시간 반영)
                if (window.audioManager) window.audioManager._updateCompressorSettings();
                for (let item of sequence.slice(0, 5)) { await this.playSound(item.sound, { force, type: 'sfx' }); }
            })();
        }
    }

    // ★★★ [Split Gain Staging Edition] playSound ★★★
    async playSound(input, options = {}) {
        let force = false;
        let type = 'sfx';

        if (typeof options === 'boolean') {
            force = options;
        } else {
            force = options.force || false;
            type = options.type || 'sfx';
        }

        // 1. 상태 체크
        const isActuallyEnabled = (typeof window.soundEnabled !== 'undefined') ? window.soundEnabled : this.enabled;
        if (!isActuallyEnabled && !force) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => { });

        // 2. 입력값 정규화 (배열/객체 지원)
        let target = input;
        if (Array.isArray(target)) target = target[Math.floor(Math.random() * target.length)];
        if (!target) return;

        let fileName, baseVolume = 0.5;
        if (typeof target === 'object' && target !== null && target.src) {
            fileName = target.src;
            if (target.volume !== undefined) baseVolume = target.volume;
        } else {
            fileName = target;
        }
        if (!fileName) return;

        // [중복 방지] 시각 효과 사운드 중복 차단
        const visualConf = window.HIVE_VISUAL_CONFIG || {};
        const isVisualSound = Object.values(visualConf).some(vConf => {
            // Check both soundKey and audioOverride
            const checkKeys = [];
            if (vConf.soundKey) checkKeys.push(vConf.soundKey);
            if (vConf.audioOverride) checkKeys.push(vConf.audioOverride);

            return checkKeys.some(k => {
                const mapped = (this.soundHive || {})[k];
                if (!mapped) return false;
                const checkSrc = (item) => (typeof item === 'object' ? item.src : item) || "";
                if (Array.isArray(mapped)) return mapped.some(item => checkSrc(item).includes(fileName));
                return checkSrc(mapped).includes(fileName);
            });
        });
        if (type === 'sfx' && isVisualSound) return;

        // 3. 경로 및 설정 로드
        let playPath = fileName;
        if (!playPath.includes('/') && !playPath.includes('\\')) playPath = this.basePath + playPath;

        const volConfig = this.volumeConfig || { master: 1, visual: 1, sfx: 1 };
        const normConfig = window.NORMALIZER_CONFIG || { enabled: true, visual: false, sfx: true };
        const applyNormalizer = normConfig.enabled &&
            ((type === 'visual' && normConfig.visual) || (type === 'sfx' && normConfig.sfx));

        // ★★★ [Gain Staging] ★★★
        // Input Drive: 컴프레서로 밀어넣는 소리의 크기 (입력 배율만 적용)
        const typeMultiplier = (type === 'visual') ? volConfig.visual : volConfig.sfx;
        const driveGain = baseVolume * typeMultiplier;

        // Output Ceiling: 컴프레서를 거친 뒤의 최종 볼륨 (Master 적용)
        const outputCeiling = volConfig.master;
        this.masterGain.gain.setTargetAtTime(outputCeiling, this.audioCtx.currentTime, 0.05);

        return new Promise((resolve) => {
            const finish = () => {
                source.disconnect();
                preGainNode.disconnect();
                resolve();
            };

            try {
                // [Strategy A] Web Audio Buffer (Drive -> Limiter -> Ceiling)
                // Helper: Play from decoded buffer
                const playBuffer = (audioBuffer) => {
                    const source = this.audioCtx.createBufferSource();
                    source.buffer = audioBuffer;

                    const preGainNode = this.audioCtx.createGain();
                    preGainNode.gain.value = driveGain;

                    source.connect(preGainNode);

                    if (applyNormalizer) {
                        preGainNode.connect(this.compressor);
                        console.log(`[Staging] ON - Drive:${driveGain.toFixed(1)} -> Comp -> Ceiling:${outputCeiling.toFixed(1)}`);
                    } else {
                        preGainNode.connect(this.masterGain);
                        console.log(`[Staging] OFF - Drive:${driveGain.toFixed(1)} -> Ceiling:${outputCeiling.toFixed(1)}`);
                    }

                    source.start(0);
                    source.onended = () => {
                        source.disconnect();
                        preGainNode.disconnect();
                        resolve();
                    };
                };

                // 1. Check Cache
                if (this.bufferCache.has(playPath)) {
                    playBuffer(this.bufferCache.get(playPath));
                } else {
                    // 2. Fetch & Decode & Cache
                    fetch(playPath)
                        .then(response => {
                            if (!response.ok) throw new Error("Fetch failed");
                            return response.arrayBuffer();
                        })
                        .then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
                        .then(audioBuffer => {
                            // Cache the decoded buffer
                            this.bufferCache.set(playPath, audioBuffer);
                            playBuffer(audioBuffer);
                        })
                        .catch(e => {
                            // [Strategy B] HTML5 Fallback
                            console.warn(`[AudioManager] Fallback for "${fileName}": ${e.message}`);
                            const audio = new Audio(playPath);
                            audio.volume = Math.min(1.0, Math.max(0, driveGain * outputCeiling));
                            audio.onended = () => resolve();
                            audio.onerror = () => resolve();
                            audio.play().catch(err => resolve());
                        });
                }

            } catch (e) {
                resolve();
            }
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
        const { message, nickname, color, badges, emojis, type, uid } = data;
        const emotes = emojis || {}; // Map emojis to emotes for compatibility
        const originalMessage = message;
        const normOriginal = originalMessage.normalize('NFC').trim();

        // !명령어 제거 및 정리
        let displayMessage = message.replace(/(^|\s)![\S]+/g, "").replace(/\s+/g, " ").trim();

        // DOM 요소 생성
        const elements = this._createBubbleElements();
        const { chatBox, chatLineInner, nameBox, messageEle, nameEle, badgeEle } = elements;

        // 색상 계산
        let userColor = this._resolveColor(color, uid);

        // 기본 스타일 적용
        chatLineInner.style.borderColor = userColor;
        chatLineInner.style.background = "rgba(0, 0, 0, 0.2)"; // 메시지 영역 셰이딩 강화
        chatLineInner.style.color = "#ffffff";

        elements.chatLineBg.style.background = userColor; // 바깥 배경을 유저 색상으로!!
        nameBox.style.background = userColor;
        nameEle.innerText = nickname;

        // 배지 처리
        if (badges && badges.length > 0) {
            badgeEle.classList.add('badges');
            badges.forEach(b => {
                let img = document.createElement('img');
                img.src = b.imageUrl || b.url; // [Fix] Chzzk uses 'imageUrl'
                if (img.src) {
                    img.classList.add('badge');
                    badgeEle.appendChild(img);
                }
            });
        }

        // 특수 효과 필터 (채팅 내용 기반)
        this._applyTextFilters(originalMessage, elements, userColor);

        // 이모티콘 처리 및 메시지 삽입
        // [Fix] 이모티콘 처리 (Using Helper)
        const safeMsg = displayMessage.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
        messageEle.innerHTML = renderMessageWithEmotesHTML(safeMsg, emotes);

        // Ensure Twemoji is applied
        if (window.twemoji) {
            try { twemoji.parse(messageEle); } catch (e) { }
        }

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
        if (color === "#000000") return "#000000";

        // [New] Fallback to internal random color if external lib is missing
        const colors = ["#ff4444", "#44ff44", "#44bbff", "#ffff44", "#ff88ff", "#44ffff", "#ffa500", "#ff6b6b", "#66d9ef", "#a6e22e"];
        if (typeof randomColor === 'function') return randomColor({ luminosity: 'light', seed: uid });

        // Seeded random for consistency
        const seed = uid ? uid.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0) : Math.random();
        const index = Math.abs(seed) % colors.length;
        return colors[index];
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
        // [Debug] Log incoming data for emoji debugging
        if (emotes && Object.keys(emotes).length > 0) {
            console.log("Parsing Emotes:", { message, keys: Object.keys(emotes) });
        }

        let parts = [], regex = /\{[^}]+\}/g, lastIndex = 0, match;
        while ((match = regex.exec(message)) !== null) {
            if (match.index > lastIndex) parts.push(message.substring(lastIndex, match.index));

            // Flexible ID cleanup: remove { } : and whitespace
            const emoteId = match[0].replace(/[\{\}:]/g, "").trim();
            const emoteData = emotes[emoteId];

            let emoteUrl = (emoteData && (typeof emoteData === 'string' ? emoteData : (emoteData.imageUrl || emoteData.url))) || null;
            if (emoteUrl) {
                parts.push({ url: emoteUrl });
            } else {
                parts.push(match[0]); // Not found, keep original text
            }
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
        if (window.twemoji) {
            try { twemoji.parse(ele); } catch (e) { console.error("Twemoji Parse Error:", e); }
        }
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
        this.enabled = false; // [Default] OFF (Manual trigger keywords)
        this.alertsEnabled = true; // [Default] ON (Sub/Donation Alerts)
        this._initOverlays();
        this.registry = this._buildRegistry();
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
        const isSoundActive = window.audioManager ? (window.audioManager.enabled || context.isStreamer) : false;
        if (isSoundActive && effect.soundKey && window.audioManager) {
            // [New] Support Audio Override (e.g. !가자부송 -> Play Full Version instead of short clips)
            // If audioOverride is present in config, use that key instead of soundKey for audio lookup
            const soundTargetKey = (window.VISUAL_CONFIG && window.VISUAL_CONFIG[effect.key] && window.VISUAL_CONFIG[effect.key].audioOverride)
                ? window.VISUAL_CONFIG[effect.key].audioOverride
                : effect.soundKey;

            // However, effect object here comes from registry: { soundKey: "...", execute: ... }
            // Registry doesn't have the config object directly. 
            // We need to look up config by finding which config entry matches.
            // Simplified approach: Registry key matches config key usually.
            // Let's passed key in queue item? No, queue has { effect, context }.
            // We need to know the 'key' (e.g. 'gazabu').
            // Let's modify trigger to pass key or look it up.
            // Actually, we can just look up based on soundKey if unique, but 'gazabu' config has 'audioOverride'.

            // BETTER APPROACH:
            // Just use the soundKey from registry.
            // AND in config.js, set 'gazabu' soundKey to '가자부송' (which might map to nothing or short clip).
            // BUT if we want override, we should handle it here.

            // Let's try to find the config entry that corresponds to this effect
            let overrideKey = null;
            if (window.VISUAL_CONFIG) {
                for (const [k, v] of Object.entries(window.VISUAL_CONFIG)) {
                    if (v.soundKey === effect.soundKey && v.audioOverride) {
                        overrideKey = v.audioOverride;
                        break;
                    }
                }
            }

            const activeSoundKey = overrideKey || effect.soundKey;
            if (activeSoundKey) {
                window.audioManager.playSound(window.soundHive[activeSoundKey], { force: context.isStreamer, type: 'visual' });
            }
        }

        // 2. Visual
        try {
            await effect.execute(context);
        } catch (e) {
            console.error(`❌ Visual Effect Error (${effect.soundKey}):`, e);
        }

        // 3. Cooldown
        const cooldown = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.common && window.VISUAL_CONFIG.common.cooldown) || 1000;
        await new Promise(r => setTimeout(r, cooldown));

        this.isLocked = false;
        this._processQueue();
    }

    _initOverlays() {
        const create = (id, html) => {
            if (document.getElementById(id)) return;
            const div = document.createElement('div'); div.id = id;
            div.className = 'fullscreen-overlay'; // Apply utility class
            if (html) div.innerHTML = html;
            document.body.appendChild(div);
        };
        create('skull-overlay', '<div class="skull-wrapper"><div class="skull-emoji" data-text="☠️">☠️</div></div><div class="film-grain"></div>');
        create('usho-overlay', `
            <div class="usho-flash"></div>
            <div class="usho-container">
                <div class="usho-scan-wrapper">
                    <img class="usho-gif-scan" src="./img/usho.gif">
                </div>
                <div class="usho-reveal-wrapper">
                    <div class="usho-reveal-content-wrapper">
                        <video class="usho-video-reveal" src="./img/usho.mp4" muted playsinline></video>
                        <div class="usho-rainbow-overlay"></div>
                    </div>
                </div>
                <!-- [New] Multi-Layer Background (Moved outside reveal-wrapper for visibility) -->
                <div class="usho-background-layer">
                    <img class="usho-side-gif left" src="./img/usho4.gif">
                    <img class="usho-side-gif right" src="./img/usho2.gif">
                </div>
            </div>
        `);
        create('heart-overlay', '<div class="heart-emoji">❤️‍🩹</div>');
        create('flashback-overlay');
        create('bangjong-overlay', '<div class="bangjong-flame-border"></div><div class="bangjong-actors-container"></div>');
        create('dango-overlay', '<video class="dango-video" muted playsinline></video><div class="dango-emoji-container"></div>');
        create('king-overlay', '<img class="king-image" src="" alt="King"><div class="king-snow-container"></div>');
        create('god-overlay', '<img class="god-image" src="" alt="God">'); // [New] God Overlay
        create('gazabu-overlay', '<video class="gazabu-bg" src="" muted playsinline loop></video>'); // [Update] Video Background
        create('mulsulsan-overlay', '<video class="mulsulsan-bg" src="" playsinline loop></video>'); // [New] Mulsulsan Background (Unmuted for Audio)
        create('random-dance-overlay', '<div class="rd-container rd-left"></div><div class="rd-container rd-right"></div>');
    }

    _buildRegistry() {
        return {
            usho: { soundKey: "우쇼", execute: (ctx) => this._runUsho(ctx) },
            skull: { soundKey: "해골", execute: (ctx) => this._runSkull(ctx) },
            couple: { soundKey: "커플", execute: (ctx) => this._runCouple(ctx) },
            vergil: { soundKey: "버질", execute: (ctx) => this._runVergil(ctx) },
            dolphin: { soundKey: "돌핀", execute: (ctx) => this._runDolphin(ctx) },
            valstrax: { soundKey: "발파", execute: (ctx) => this.triggerValstrax(ctx.message) },
            bangjong: { soundKey: "방종송", execute: (ctx) => this._runBangjong(ctx) },
            dango: { soundKey: "당고", execute: (ctx) => this._runDango(ctx) },
            king: { soundKey: "몬창왕", execute: (ctx) => this._runKing(ctx) },
            godsong: { soundKey: "갓겜송", execute: (ctx) => this._runGod(ctx) },
            gazabu: { soundKey: "가자부송", execute: (ctx) => this._runGazabu(ctx) },
            mulsulsan: { soundKey: "물설산", execute: (ctx) => this._runMulsulsan(ctx) },
            random_dance: { soundKey: "랜덤댄스", execute: (ctx) => this._runRandomDance(ctx) }
        };
    }

    _runSkull(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.skull) ? window.VISUAL_CONFIG.skull : {
            duration: 8000,
            floatingTextDuration: 4000
        };
        return this._genericSkullLikeEffect('skull-overlay', '!해골', 'skull-style', 'skull-emoji', context, conf);
    }

    _runUsho(context) {
        const overlay = document.getElementById('usho-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.usho) ? window.VISUAL_CONFIG.usho : {
            scanPhase: 7270,
            duration: 19000,
            gifPath: './img/usho.gif',
            videoPath: './img/usho.mp4',
            backgroundVideoPath: './Video/ushoBack.mp4'
        };

        const img = overlay.querySelector('.usho-gif-scan');
        if (img && conf.gifPath && !img.src.includes(conf.gifPath)) img.src = conf.gifPath;

        // [New] Background Video Logic (Replaces Side GIFs)
        let bgVideo = overlay.querySelector('.usho-background-video');
        if (!bgVideo && conf.backgroundVideoPath) {
            bgVideo = document.createElement('video');
            bgVideo.className = 'usho-background-video';
            bgVideo.muted = true;
            bgVideo.loop = true;
            bgVideo.playsInline = true;

            // Append to background layer
            const bgLayer = overlay.querySelector('.usho-background-layer');
            if (bgLayer) {
                bgLayer.innerHTML = ''; // Clear existing GIFs if any
                bgLayer.appendChild(bgVideo);
            }
        }

        if (bgVideo) {
            if (conf.backgroundVideoPath && !bgVideo.src.includes(conf.backgroundVideoPath)) {
                bgVideo.src = conf.backgroundVideoPath;
            }
            // Apply opacity
            bgVideo.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;

            bgVideo.currentTime = 0;
            bgVideo.pause();
        }

        const video = overlay.querySelector('.usho-video-reveal');
        if (video) {
            if (conf.videoPath && !video.src.includes(conf.videoPath)) video.src = conf.videoPath;
            // Apply opacity to reveal video too? Usually yes if it's part of the 'scene'.
            // But reveal might be intended to be full visibility?
            // User asked "Usho also opacity control". 
            // Let's apply to background video primarily, but maybe reveal video should also be controlled?
            // Given the context of "opacity control", it likely means the whole effect or the background.
            // Let's apply to both for consistency, or just background?
            // Usho effect has a background video and a center reveal video.
            // Let's apply to both.
            video.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;

            video.currentTime = 0; // Reset video
            video.pause();
        }

        return new Promise(resolve => {
            overlay.classList.remove('phase-scan', 'phase-reveal', 'visible');
            void overlay.offsetWidth;

            overlay.classList.add('visible', 'phase-scan');

            // Start background video immediately (if desired, or sync with phases)
            if (bgVideo) {
                bgVideo.play().catch(e => console.warn("Background video play failed:", e));
            }

            setTimeout(() => {
                overlay.classList.replace('phase-scan', 'phase-reveal');
                if (video) {
                    video.play().catch(e => console.warn("Video play failed:", e));
                    video.currentTime = 0;
                }
            }, conf.scanPhase);

            setTimeout(() => {
                overlay.classList.remove('visible', 'phase-reveal', 'phase-scan');
                if (video) video.pause();
                if (bgVideo) bgVideo.pause();
                resolve();
            }, conf.duration);
        });
    }

    _runDango(context) {
        const overlay = document.getElementById('dango-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.dango) ? window.VISUAL_CONFIG.dango : {
            duration: 19000,
            videoPath: './Video/Dango.mp4',
            emojiPool: ["🍡", "🍺", "🌀"],
            emojiCount: 20,
            emojiSize: '6rem'
        };

        const video = overlay.querySelector('.dango-video');
        const container = overlay.querySelector('.dango-emoji-container');

        return new Promise(resolve => {
            // Clear previous emojis
            if (container) container.innerHTML = '';

            overlay.classList.add('visible');
            if (video) {
                if (conf.videoPath && !video.src.includes(conf.videoPath)) video.src = conf.videoPath;
                video.currentTime = 0;
                video.muted = false; // Enable audio for this effect
                video.volume = 0.7; // Standard volume consistent with SFX

                // Apply configurable size and opacity
                video.style.width = conf.videoWidth || '100vw';
                video.style.height = conf.videoHeight || '100vh';
                video.style.opacity = conf.videoOpacity !== undefined ? conf.videoOpacity : 1;

                video.play().catch(e => console.warn("Dango video play failed:", e));
            }

            // Spawn emojis
            if (container && conf.emojiPool) {
                const variants = ['hvn-dango-move-v1', 'hvn-dango-move-v2', 'hvn-dango-move-v3', 'hvn-dango-move-v4'];
                for (let i = 0; i < conf.emojiCount; i++) {
                    const span = document.createElement('span');
                    span.className = 'dango-emoji';
                    span.innerText = conf.emojiPool[Math.floor(Math.random() * conf.emojiPool.length)];

                    const variant = variants[Math.floor(Math.random() * variants.length)];
                    const startTop = 10 + Math.random() * 80;
                    const startLeft = 10 + Math.random() * 80;
                    const delay = Math.random() * -10; // Negative delay to start mid-animation
                    const moveDuration = 10 + Math.random() * 10; // Slower movement: 10s to 20s
                    const spinDuration = 3 + Math.random() * 5; // Also slower spinning

                    span.style.top = `${startTop}%`;
                    span.style.left = `${startLeft}%`;
                    span.style.fontSize = (0.5 + Math.random() * 1.5) * parseFloat(conf.emojiSize) + 'rem';
                    span.style.animation = `${variant} ${moveDuration}s ease-in-out ${delay}s infinite alternate, hvn-dango-spin ${spinDuration}s linear infinite`;

                    container.appendChild(span);
                }
            }

            setTimeout(() => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (video) video.pause();
                    if (container) container.innerHTML = '';
                }, 1000); // Wait for transition
                resolve();
            }, conf.duration);
        });
    }

    _runKing(context) {
        const overlay = document.getElementById('king-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.king) ? window.VISUAL_CONFIG.king : {
            duration: 23000,
            imagePath: './img/King_Of_MH.png',
            audioPath: './SFX/아들아.mp3',
            volume: 0.7,
            emojiPool: ["❄️", "🧊", "⭐"],
            delayedEmojiPool: ["💩", "🧻", "🤮"],
            delayedEmojiDelay: 11000
        };

        const image = overlay.querySelector('.king-image');
        const snowContainer = overlay.querySelector('.king-snow-container');

        // Audio setup
        let audio = new Audio(conf.audioPath);
        audio.volume = conf.volume || 0.7;

        return new Promise(resolve => {
            // Setup Image
            if (image) image.src = conf.imagePath;

            // Clear previous flakes and diagnostic tests
            if (snowContainer) snowContainer.innerHTML = '';

            // Safety: ensure any loose flakes on overlay are also cleared
            overlay.querySelectorAll('.king-snowflake').forEach(el => el.remove());

            const getEmoji = (pool) => {
                if (!pool || pool.length === 0) return '❄️';
                return pool[Math.floor(Math.random() * pool.length)];
            };

            const createFlake = (pool, isDelayed = false) => {
                const flake = document.createElement('div');
                flake.className = 'king-snowflake';
                flake.style.left = (Math.random() * 100) + 'vw';

                // Animation duration/delay handled here
                flake.style.animationDuration = (Math.random() * 2 + 3) + 's';
                flake.style.animationDelay = (Math.random() * -5) + 's';

                // Set size based on config or default random
                if (conf.emojiSize) {
                    flake.style.fontSize = conf.emojiSize;
                } else {
                    flake.style.fontSize = (Math.random() * 40 + 60) + 'px';
                }

                flake.innerHTML = getEmoji(pool);

                // If delayed, start with opacity 0 and fade in
                if (isDelayed) {
                    flake.style.opacity = '0';
                    flake.style.transition = 'opacity 2s ease-in';

                    if (snowContainer) snowContainer.appendChild(flake);
                    else overlay.appendChild(flake);

                    // Trigger fade-in
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            flake.style.opacity = '1';
                        });
                    });
                } else {
                    flake.style.opacity = '1';

                    if (snowContainer) snowContainer.appendChild(flake);
                    else overlay.appendChild(flake);
                }
            };

            // Initial Heavy Snowstorm
            const initialCount = conf.emojiCount || 150;
            for (let i = 0; i < initialCount; i++) {
                createFlake(conf.emojiPool, false);
            }

            // Delayed Storm using config delay
            setTimeout(() => {
                if (overlay.classList.contains('visible')) {
                    const delayedCount = conf.delayedEmojiCount || 100;
                    for (let i = 0; i < delayedCount; i++) {
                        createFlake(conf.delayedEmojiPool, true);
                    }
                }
            }, conf.delayedEmojiDelay || 11000);

            overlay.classList.add('visible');
            audio.play().catch(e => console.warn("King audio play failed:", e));

            setTimeout(() => {
                overlay.classList.remove('visible');
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
                setTimeout(() => {
                    if (snowContainer) snowContainer.innerHTML = '';
                }, 1000);
                resolve();
            }, conf.duration);
        });
    }

    // God Game Effect
    _runGod(context) {
        const overlay = document.getElementById('god-overlay');
        if (!overlay) return Promise.resolve();

        // [Fix] Load config explicitly
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.godsong) ? window.VISUAL_CONFIG.godsong : {
            duration: 15000,
            audioPath: './SFX/갓겜합시다FULL.mp3',
            volume: 0.7,
            images: [
                { src: './img/GodGame1.png', width: '30%', top: '30%', slide: 'left', transform: 'scaleX(-1)' }
            ]
        };

        // Clear previous content
        overlay.innerHTML = '';

        // Audio setup
        let audio = new Audio(conf.audioPath);
        audio.volume = conf.volume || 0.7;

        return new Promise(resolve => {
            // 0. Setup Background Video
            if (conf.videoPath) {
                const video = document.createElement('video');
                video.src = conf.videoPath;
                video.className = 'god-video-bg';
                video.autoplay = true;
                video.loop = true; // Loop if video is shorter than duration
                video.muted = true; // Use separate audio file as requested
                video.volume = 0;
                video.style.display = 'block'; // [Fix] Ensure it's not hidden
                video.style.zIndex = '-1'; // [Fix] Explicitly set z-index
                // [Feature] Video Opacity
                if (typeof conf.videoOpacity !== 'undefined') {
                    video.style.opacity = conf.videoOpacity;
                }

                // Muted/Play handling
                video.play().catch(e => console.warn("God video play failed:", e));
                overlay.appendChild(video);
            }

            // Setup Images (Wrapper Approach)
            if (conf.images && Array.isArray(conf.images)) {
                console.log(`[GodEffect] Rendering ${conf.images.length} images.`);
                conf.images.forEach((imgConf, index) => {
                    // 1. Wrapper: Handles Position & Slide Animation
                    const wrapper = document.createElement('div');
                    wrapper.className = 'god-image-wrapper';
                    wrapper.style.width = imgConf.width || '30%';

                    // Position
                    if (imgConf.top) wrapper.style.top = imgConf.top;
                    if (imgConf.bottom) wrapper.style.bottom = imgConf.bottom;

                    // 2. Inner Image: Handles Content & Flip Transform
                    const img = document.createElement('img');
                    img.src = imgConf.src;
                    img.style.width = '100%';
                    img.style.display = 'block';
                    if (imgConf.transform) img.style.transform = imgConf.transform;

                    wrapper.appendChild(img);

                    // 3. Slide Animation on Wrapper (Common Props)
                    wrapper.style.animationDuration = `${conf.duration / 1000}s`;
                    wrapper.style.animationTimingFunction = 'ease-out';
                    wrapper.style.animationFillMode = 'both'; // Ensure initial state (opacity) is applied

                    // Apply Animation Name & Position
                    if (imgConf.slide === 'left') {
                        wrapper.style.left = imgConf.left || '0';
                        wrapper.style.animationName = 'god-slide-in-left';
                    } else if (imgConf.slide === 'right') {
                        wrapper.style.right = imgConf.right || '0';
                        wrapper.style.animationName = 'god-slide-in-right';
                    } else {
                        // Center/Default fallback
                        wrapper.style.left = '50%';
                        wrapper.style.transform = 'translate(-50%, -50%)';
                        wrapper.style.animationName = 'hvn-god-appear';
                    }

                    // [Feature] Configurable Delay
                    if (imgConf.delay) {
                        wrapper.style.animationDelay = `${imgConf.delay}ms`;
                    }

                    // [Feature] Configurable Exit Time (Absolute time from start)
                    if (imgConf.exitTime) {
                        setTimeout(() => {
                            // [Feature] Slide Out Animation
                            wrapper.style.animationTimingFunction = "ease-in";
                            wrapper.style.animationDuration = "1.5s"; // Slide out speed
                            wrapper.style.animationDelay = "0s"; // [Fix] Reset any entrance delay
                            wrapper.style.animationFillMode = "forwards";

                            if (imgConf.slide === 'left') {
                                wrapper.style.animationName = "god-slide-out-left";
                            } else if (imgConf.slide === 'right') {
                                wrapper.style.animationName = "god-slide-out-right";
                            } else {
                                // Fallback for center/other
                                wrapper.style.transition = "opacity 0.5s ease-out";
                                wrapper.style.opacity = "0";
                            }

                            // Remove after animation (Wait 1.5s for slide out)
                            setTimeout(() => {
                                if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
                            }, 1500);
                        }, imgConf.exitTime);
                    }

                    console.log(`[GodEffect] Image ${index}: slide=${imgConf.slide}, delay=${imgConf.delay}ms, exitTime=${imgConf.exitTime}ms`);
                    overlay.appendChild(wrapper);
                });
            }

            overlay.classList.add('visible');
            audio.play().catch(e => console.warn("God audio play failed:", e));

            // End effect
            setTimeout(() => {
                overlay.classList.remove('visible');
                audio.pause();
                audio.currentTime = 0;
                resolve();
            }, conf.duration);
        });
    }

    _runCouple(context) {
        const flashback = document.getElementById('flashback-overlay');
        const overlay = document.getElementById('heart-overlay');
        if (!flashback || !overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.couple) ? window.VISUAL_CONFIG.couple : {
            duration: 21000,
            fontSize: '13rem',
            flashbackDuration: 11800
        };

        let displayMsg = (context.message || "").trim();
        const triggerKw = "!커플";
        if (displayMsg.startsWith(triggerKw)) displayMsg = displayMsg.substring(triggerKw.length).trim();

        const wrappedMsg = this._wrapText(displayMsg, 200);
        const centerMsgSnippet = document.createElement('div');
        centerMsgSnippet.className = 'couple-premium-text';
        centerMsgSnippet.style.fontSize = conf.fontSize; // Apply config font size
        centerMsgSnippet.innerHTML = renderMessageWithEmotesHTML(wrappedMsg, context.emotes || {}, 2.0);
        centerMsgSnippet.style.animation = "hvn-couple-fadeIn 1s forwards";

        document.body.appendChild(centerMsgSnippet);

        return new Promise(resolve => {
            const fadeInTime = 1000;
            const messageTotalTime = conf.flashbackDuration;
            const emojiPhaseDuration = conf.duration - conf.flashbackDuration;

            flashback.classList.add('visible');

            // Fade out message shortly before flashback ends
            setTimeout(() => { centerMsgSnippet.style.animation = "hvn-couple-fadeOut 1s forwards"; }, messageTotalTime - 1500);

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

                const personRanges = conf.personEmojiRanges || [[0x1F600, 0x1F64F], [0x1F466, 0x1F480], [0x1F9DC, 0x1F9DF], [0x1F470, 0x1F478]];
                const heartRanges = conf.heartEmojiRanges || [[0x1F493, 0x1F49F], [0x2764, 0x2764], [0x1F9E1, 0x1F9E1], [0x1F90D, 0x1F90E], [0x1F48B, 0x1F48D]];

                const p1 = getRandomFromRanges(personRanges), p2 = getRandomFromRanges(personRanges), h3 = getRandomFromRanges(heartRanges);

                const updateState = (step) => {
                    const hue = Math.floor(Math.random() * 360);
                    // Use configurable opacity or default 0.3
                    const dim = (conf.bgOpacity !== undefined) ? conf.bgOpacity : 0.3;
                    overlay.style.backgroundColor = `hsla(${hue}, 100%, 70%, ${dim})`;
                    emojiContainer.classList.remove('grow-effect'); void emojiContainer.offsetWidth; emojiContainer.classList.add('grow-effect');

                    if (step === 3) {
                        emojiContainer.style.fontSize = conf.fontSize;
                    } else {
                        // Intermediate emojis are scaled by conf.intermediateScale
                        emojiContainer.style.fontSize = `calc(${conf.fontSize} * ${conf.intermediateScale || 1.5})`;
                    }

                    if (step === 0) emojiContainer.innerText = p1;
                    else if (step === 1) emojiContainer.innerText = p2;
                    else if (step === 2) emojiContainer.innerText = h3;
                    else if (step === 3) emojiContainer.innerText = `${p1}${h3}${p2}`;
                };

                const phaseStep = emojiPhaseDuration / 4;
                updateState(0);
                setTimeout(() => updateState(1), phaseStep);
                setTimeout(() => updateState(2), phaseStep * 2);
                setTimeout(() => updateState(3), phaseStep * 2.5);

                setTimeout(() => {
                    overlay.style.backgroundColor = ''; overlay.classList.remove('visible');
                    emojiContainer.innerText = '❤️‍🩹'; emojiContainer.style.fontSize = '';
                    resolve();
                }, emojiPhaseDuration);
            }, conf.flashbackDuration);
        });
    }


    _runVergil(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.vergil) ? window.VISUAL_CONFIG.vergil : {
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
                    if (msg.startsWith(kw)) msg = msg.substring(kw.length).trim();
                    if (msg) {
                        const txt = document.createElement('div'); txt.className = 'vergil-text';
                        txt.innerHTML = renderMessageWithEmotesHTML(msg, context.emotes || {}); ov.appendChild(txt);
                        setTimeout(() => { txt.style.animation = "hvn-vergil-fadeOut 1s forwards"; setTimeout(() => txt.remove(), 1000); }, 7000);
                    }
                }, conf.textDelay - explosionTime);
            }, explosionTime);
        });
    }

    _runDolphin(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.dolphin) ? window.VISUAL_CONFIG.dolphin : {
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

        this._spawnActor(overlayC, 'surfer-actor', surfingEmojis[Math.floor(Math.random() * surfingEmojis.length)], {
            duration: conf.duration,
            styles: {
                nametag: (context.nickname || "Anonymous"),
                nameColor: (context.color || conf.nametagColor), // Use config fallback
                left: '-20vw',
                animation: `hvn-dolphin-surfer ${conf.duration / 1000}s linear forwards`
            }
        });

        const dolphinLife = conf.duration - conf.dolphinDelay;
        setTimeout(() => {
            const dolphinEl = this._spawnActor(overlayC, 'lead-dolphin', "🐬", { duration: dolphinLife + 5000 });
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
                this._spawnActor(overlayC, 'sea-jump', smallSeaCreatures[Math.floor(Math.random() * smallSeaCreatures.length)], {
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
                this._spawnActor(overlayC, 'sea-extra', smallSeaCreatures[Math.floor(Math.random() * smallSeaCreatures.length)], {
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

        let msg = context.message || ""; if (msg.startsWith("!돌핀")) msg = msg.substring(3).trim();
        if (msg) {
            setTimeout(() => {
                const txt = document.createElement('div'); txt.className = 'dolphin-text';
                txt.innerHTML = renderMessageWithEmotesHTML(this._wrapText(msg, (window.VISUAL_CONFIG?.common?.textWrapLimit || 200), "<br>"), context.emotes || {}, 2.0);
                ov.appendChild(txt);
            }, conf.dolphinDelay);
        }
        return new Promise(resolve => {
            setTimeout(() => { ov.style.opacity = '0'; setTimeout(() => { if (ov.parentNode) ov.remove(); resolve(); }, 2000); }, conf.duration);
        });
    }

    _runValstrax(context) {
        // This method is now a placeholder or can be removed if triggerValstrax is the new entry point.
        // For now, it will just resolve immediately.
        return Promise.resolve();
    }

    // [New] Valstrax Logic
    triggerValstrax(message) {
        if (!window.VISUAL_CONFIG.valstrax) return Promise.resolve();
        const conf = window.VISUAL_CONFIG.valstrax;

        return new Promise(resolve => {
            // 1. 오버레이 생성
            const overlay = document.createElement('div');
            overlay.className = 'valstrax-overlay';
            overlay.style.setProperty('--cloud-height', `${conf.cloudHeight || 180}px`);
            overlay.style.setProperty('--cloud-size', `${conf.cloudSize || 400}px`);
            document.body.appendChild(overlay);

            // [New] 초기 배경 이미지 추가 (6초 전까지)
            const initialBg = document.createElement('div');
            initialBg.className = 'valstrax-initial-bg';
            overlay.appendChild(initialBg);

            // 2. 초기 구름 (바닥 3겹) 생성
            const cloudsContainer = document.createElement('div');
            cloudsContainer.className = 'valstrax-clouds';
            cloudsContainer.innerHTML = `
                <div class="cloud-layer cloud-3"></div>
                <div class="cloud-layer cloud-2"></div>
                <div class="cloud-layer cloud-1"></div>
            `;
            overlay.appendChild(cloudsContainer);

            // 사운드 재생
            if (window.AudioManager && conf.soundKey) window.AudioManager.playSFX(conf.soundKey);

            // 3. 5초: 제트기 (붉은 선 - 두 줄) & 제트운 (흰 선)
            setTimeout(() => {
                // [Fix] 비행운(흰 선)을 비행기(붉은 선)와 분리하여 그 자리에 남도록 처리
                const contrailL = document.createElement('div');
                contrailL.className = 'valstrax-contrail valstrax-jet-left contrail-active';
                overlay.appendChild(contrailL);

                const contrailR = document.createElement('div');
                contrailR.className = 'valstrax-contrail valstrax-jet-right contrail-active';
                overlay.appendChild(contrailR);

                const jetL = document.createElement('div');
                jetL.className = 'valstrax-jet valstrax-jet-left jet-active';
                overlay.appendChild(jetL);

                const jetR = document.createElement('div');
                jetR.className = 'valstrax-jet valstrax-jet-right jet-active';
                overlay.appendChild(jetR);
            }, conf.jetDelay);

            // 4. 6초: 시네마틱 구름 서지 (전환 가림막)
            setTimeout(() => {
                // [New] 구름 서지 레이어 생성 (전체화면 구름 덮기)
                const surge = document.createElement('div');
                surge.className = 'valstrax-surge';
                overlay.appendChild(surge);

                // 구름이 화면을 완전히 가리는 피크 시점(약 0.6초 뒤)에 요소 교체
                setTimeout(() => {
                    overlay.querySelectorAll('.valstrax-clouds, .valstrax-jet, .valstrax-contrail, .valstrax-initial-bg').forEach(el => el.remove());

                    const flashLayer = document.createElement('div');
                    flashLayer.className = 'valstrax-flash-layer scene-active';
                    overlay.appendChild(flashLayer);

                    const mountains = document.createElement('div');
                    mountains.className = 'valstrax-mountains';
                    overlay.appendChild(mountains);

                    const star = document.createElement('div');
                    star.className = 'valstrax-star';
                    star.style.opacity = '1';
                    overlay.appendChild(star);

                    this.activeStar = star;
                }, 600); // 0.6s Peak Timing

                // 3초 뒤(페이드아웃 완료 후) 서지 레이어 제거
                setTimeout(() => surge.remove(), 3000);
            }, conf.flashDelay);

            // 5. 7.3초: 별 폭발 & 유성 진입
            setTimeout(() => {
                if (this.activeStar) this.activeStar.style.display = 'none'; // 별 사라짐

                // [Fix] 쉐이커 컨테이너 추가하여 스케일(접근)과 쉐이크(흔들림) 애니메이션 공존 유도
                const shaker = document.createElement('div');
                shaker.className = 'valstrax-shaker shaker-active';

                const meteor = document.createElement('div');
                meteor.className = 'valstrax-meteor meteor-active';

                shaker.appendChild(meteor);
                overlay.appendChild(shaker);
            }, conf.starExplodeDelay);

            // 6. 충돌 임팩트 (impactDelay 지점)
            setTimeout(() => {
                const impactFlash = document.createElement('div');
                impactFlash.className = 'valstrax-impact-flash';
                overlay.appendChild(impactFlash);

                setTimeout(() => impactFlash.classList.add('flash-fade-out'), 100);
                setTimeout(() => impactFlash.remove(), 1200);

                // [Fix] 메테오 충돌 후 이전 오브젝트들 완전 정리 (비행운 포함)
                overlay.querySelectorAll('.valstrax-clouds, .valstrax-mountains, .valstrax-jet, .valstrax-meteor, .valstrax-star, .valstrax-flash-layer, .valstrax-shaker, .valstrax-contrail').forEach(el => el.remove());

                // [New] 최종 배경 GIF 추가 (전체화면)
                const finalBg = document.createElement('div');
                finalBg.className = 'valstrax-final-bg';
                overlay.appendChild(finalBg);

                // [Fix] 충돌과 동시에 구름 등장
                // 상단 구름 생성
                const topClouds = document.createElement('div');
                topClouds.className = 'valstrax-clouds';
                topClouds.style.top = '0';
                topClouds.style.bottom = 'auto';
                topClouds.innerHTML = `
                    <div class="cloud-layer cloud-3 top"></div>
                    <div class="cloud-layer cloud-2 top"></div>
                    <div class="cloud-layer cloud-1 top"></div>
                `;
                overlay.appendChild(topClouds);

                // 하단 구름 생성 (바닥에 다시 깔림)
                const bottomClouds = document.createElement('div');
                bottomClouds.className = 'valstrax-clouds';
                bottomClouds.innerHTML = `
                    <div class="cloud-layer cloud-3"></div>
                    <div class="cloud-layer cloud-2"></div>
                    <div class="cloud-layer cloud-1"></div>
                `;
                overlay.appendChild(bottomClouds);
            }, conf.impactDelay);

            // 7. 메시지 등장 (textAppearDelay 지점)
            setTimeout(() => {
                let msg = message || "";
                if (msg.startsWith("!발파")) msg = msg.substring(3).trim();

                const msgBox = document.createElement('div');
                msgBox.className = 'valstrax-msg-box';
                msgBox.innerHTML = `<div>${msg}</div>`;
                overlay.appendChild(msgBox);

                // Fade In 효과
                requestAnimationFrame(() => msgBox.classList.add('visible'));

            }, conf.textAppearDelay);

            // 7. 18초: 종료
            setTimeout(() => {
                overlay.remove();
                resolve(); // Signal completion to the queue
            }, conf.duration);
        });
    }

    _runBangjong(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.bangjong) ? window.VISUAL_CONFIG.bangjong : {
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
        if (msg.startsWith("!방종송")) msg = msg.substring(4).trim();
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

                // Initial random position (Narrowed range to keep on-screen)
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

                // --- Puppy-like AI Movement ---
                const movePuppy = () => {
                    if (!isActive) return;

                    const curX = parseFloat(actor.style.left);
                    const destX = Math.random() * 60 + 20; // Narrowed: 20-80%
                    const destY = Math.random() * 52 + 24; // Narrowed: 24-76%

                    // Speed: ~10-20% per second
                    const distance = Math.sqrt(Math.pow(destX - curX, 2));
                    const duration = 1.5 + (distance / 15) + Math.random() * 2;

                    // Direction Flip
                    const movingRight = destX > curX;
                    let flipped = isTeostra ? !movingRight : movingRight;
                    actor.style.transform = flipped ? 'scaleX(-1)' : 'scaleX(1)';

                    actor.style.transition = `left ${duration}s ease-in-out, top ${duration}s ease-in-out`;
                    actor.style.left = destX + '%';
                    actor.style.top = destY + '%';

                    // Next move after reaching or pausing
                    const totalWait = (duration * 1000) + (Math.random() > 0.7 ? 500 + Math.random() * 1500 : 0);
                    setTimeout(movePuppy, totalWait);
                };

                // Start AI with a slight staggered delay
                setTimeout(movePuppy, i * 300);
            }
        }

        return new Promise(resolve => {
            overlay.classList.add('visible');
            setTimeout(() => {
                isActive = false;
                overlay.classList.remove('visible');
                // Wait for fade out transition (0.5s in CSS) before clearing
                setTimeout(() => {
                    if (container) container.innerHTML = '';
                    const txt = overlay.querySelector('.bangjong-text');
                    if (txt) txt.remove();
                    resolve();
                }, 600);
            }, conf.duration);
        });
    }

    _runGazabu(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.gazabu) ? window.VISUAL_CONFIG.gazabu : {
            duration: 8000,
            backgroundPath: './Video/가자부.mp4'
        };

        const overlay = document.getElementById('gazabu-overlay');
        if (!overlay) return Promise.resolve();

        // Set background video
        const bg = overlay.querySelector('.gazabu-bg');
        if (bg) {
            bg.src = conf.backgroundPath;
            bg.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
            bg.play().catch(e => console.warn("Gazabu video play failed:", e));
        }

        return new Promise(resolve => {
            overlay.classList.add('visible');
            setTimeout(() => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (bg) {
                        bg.pause();
                        bg.currentTime = 0;
                        bg.src = "";
                    }
                    resolve();
                }, 600);
            }, conf.duration);
        });
    }

    _runMulsulsan(context) {
        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.mulsulsan) ? window.VISUAL_CONFIG.mulsulsan : {
            duration: 10000,
            backgroundPath: './Video/물설산씨티.mp4'
        };

        const overlay = document.getElementById('mulsulsan-overlay');
        if (!overlay) return Promise.resolve();

        // Set background video
        const bg = overlay.querySelector('.mulsulsan-bg');
        if (bg) {
            bg.src = conf.backgroundPath;
            bg.style.opacity = (conf.opacity !== undefined) ? conf.opacity : 1.0;
            // [Audio] Apply volume from visual audio settings if possible
            const visualVol = (window.audioManager && window.audioManager.volumeConfig) ? window.audioManager.volumeConfig.visual : 1.0;
            bg.volume = visualVol * (conf.videoVolume || 1.0);
            bg.play().catch(e => console.warn("Mulsulsan video play failed:", e));
        }

        return new Promise(resolve => {
            overlay.classList.add('visible');
            setTimeout(() => {
                overlay.classList.remove('visible');
                setTimeout(() => {
                    if (bg) {
                        bg.pause();
                        bg.currentTime = 0;
                        bg.src = "";
                    }
                    resolve();
                }, 600);
            }, conf.duration);
        });
    }

    _runRandomDance(context) {
        const overlay = document.getElementById('random-dance-overlay');
        if (!overlay) return Promise.resolve();

        const conf = (window.VISUAL_CONFIG && window.VISUAL_CONFIG.random_dance) ? window.VISUAL_CONFIG.random_dance : {
            duration: 18000,
            videoSize: '35rem',
            opacity: 0.9,
            positions: { left: { x: '15%', y: '50%' }, right: { x: '85%', y: '50%' } },
            videoPool: []
        };

        const leftContainer = overlay.querySelector('.rd-left');
        const rightContainer = overlay.querySelector('.rd-right');

        // Apply shared styles
        [leftContainer, rightContainer].forEach((cont, idx) => {
            const side = idx === 0 ? 'left' : 'right';
            const pos = conf.positions[side];
            cont.style.width = conf.videoSize;
            cont.style.height = conf.videoSize;
            cont.style.left = pos.x;
            cont.style.top = pos.y;
            cont.style.opacity = '0';
            cont.style.transition = 'opacity 0.5s ease-in-out';
        });

        const shuffle = (array) => array.sort(() => Math.random() - 0.5);
        const selectedVideos = shuffle([...conf.videoPool]).slice(0, 6);
        let currentIndex = 0;

        const spawnVideo = (container, videoName) => {
            container.innerHTML = '';
            const video = document.createElement('video');
            video.src = `./Video/RandomDance/${videoName}`;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.borderRadius = '20px';
            video.style.boxShadow = '0 0 20px rgba(255,105,180,0.5)';
            container.appendChild(video);
        };

        const cycleVideos = () => {
            // Fade out
            leftContainer.style.opacity = '0';
            rightContainer.style.opacity = '0';

            setTimeout(() => {
                const vid1 = selectedVideos[currentIndex];
                const vid2 = selectedVideos[(currentIndex + 1) % selectedVideos.length];
                spawnVideo(leftContainer, vid1);
                spawnVideo(rightContainer, vid2);

                // Fade in
                leftContainer.style.opacity = (conf.opacity || 0.9).toString();
                rightContainer.style.opacity = (conf.opacity || 0.9).toString();

                currentIndex = (currentIndex + 2) % selectedVideos.length;
            }, 500);
        };

        return new Promise(resolve => {
            overlay.classList.add('visible');
            cycleVideos(); // Initial
            const interval = setInterval(cycleVideos, 6000);

            setTimeout(() => {
                clearInterval(interval);
                overlay.classList.remove('visible');
                leftContainer.innerHTML = '';
                rightContainer.innerHTML = '';
                resolve();
            }, conf.duration);
        });
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
            el.innerHTML = renderMessageWithEmotesHTML(this._wrapText(text, (window.VISUAL_CONFIG?.common?.textWrapLimit || 200)), emotes || {}, textScale);
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
        if (window.twemoji) twemoji.parse(el);
        el.style.animationDuration = opts.duration + 'ms';
        if (opts.styles) Object.keys(opts.styles).forEach(key => { if (key.startsWith('--')) el.style.setProperty(key, opts.styles[key]); else if (key !== 'nametag' && key !== 'nameColor') el.style[key] = opts.styles[key]; });
        parent.appendChild(el);
        setTimeout(() => { if (el.parentNode) el.remove(); }, opts.duration + 2000);
        return el;
    }
}

// ==========================================
// [Class 6] System Controller (Toggles)
// ==========================================
class SystemController {
    constructor(audio, visual, renderer) {
        this.audio = audio;
        this.visual = visual;
        this.renderer = renderer;
        this.commands = {
            '!소리끄기': { action: () => this.audio.setEnabled(false), msg: "🔇 사운드 효과가 꺼졌습니다." },
            '!소리켜기': { action: () => this.audio.setEnabled(true), msg: "🔊 사운드 효과가 켜졌습니다." },
            '!사운드': {
                action: () => {
                    const next = !this.audio.enabled;
                    this.audio.setEnabled(next);
                    return next ? "🔊 사운드 효과가 켜졌습니다." : "🔇 사운드 효과가 꺼졌습니다.";
                },
                msg: ""
            },
            '!이펙트끄기': { action: () => this.visual.setEnabled(false), msg: "🚫 비주얼 이펙트가 꺼졌습니다." },
            '!이펙트켜기': { action: () => this.visual.setEnabled(true), msg: "✨ 비주얼 이펙트가 켜졌습니다." },
            '!비주얼': {
                action: () => {
                    const next = !this.visual.enabled;
                    this.visual.setEnabled(next);
                    return next ? "✨ 비주얼 이펙트가 켜졌습니다." : "🚫 비주얼 이펙트가 꺼졌습니다.";
                },
                msg: ""
            },
            '!알람끄기': { action: () => this.visual.setAlertsEnabled(false), msg: "🔔 알람(구독/후원) 이펙트가 꺼졌습니다." },
            '!알람켜기': { action: () => this.visual.setAlertsEnabled(true), msg: "🔔 알람(구독/후원) 이펙트가 켜졌습니다." },
            '!전체끄기': {
                action: () => {
                    this.audio.setEnabled(false);
                    this.visual.setEnabled(false);
                    this.visual.setAlertsEnabled(false);
                },
                msg: "🔒 모든 효과가 꺼졌습니다."
            },
            '!전체켜기': {
                action: () => {
                    this.audio.setEnabled(true);
                    this.visual.setEnabled(true);
                    this.visual.setAlertsEnabled(true);
                },
                msg: "🔓 모든 효과가 켜졌습니다."
            },
            '!데모': {
                action: (args) => {
                    if (args[0] === '끝' || args[0] === '중단') {
                        window.stopDemoSequence();
                        return "🎬 데모를 중단합니다.";
                    }
                    const duration = args[0] ? parseInt(args[0], 10) : 60;
                    window.runDemoSequence(duration);
                    if (args[0]) return `🎬 ${args[0]}초간 데모 모드를 실행합니다.`;
                    return "🎬 데모 모드를 실행합니다.";
                },
                msg: "🎬 데모 모드를 실행합니다."
            },
            '!볼륨평준화': {
                action: (args) => {
                    const cmd = args[0];
                    if (cmd === '켜기') return this.audio.updateConfig('all', true);
                    if (cmd === '끄기') return this.audio.updateConfig('all', false);
                    if (cmd === '도네') return this.audio.updateConfig('visual');
                    if (cmd === '채팅') return this.audio.updateConfig('sfx');
                    return "❓ 사용법: !볼륨평준화 [켜기/끄기/도네/채팅]";
                },
                msg: ""
            },
            // [New] Volume Control (Streamer Only)
            // Usage: set sfx 0.5 | !set visual 1.0
            'set': {
                action: (args) => this._handleSetVolume(args),
                msg: ""
            },
            '!set': {
                action: (args) => this._handleSetVolume(args),
                msg: ""
            }
        };
    }

    // [Helper] Volume Control Logic
    _handleSetVolume(args) {
        if (args.length < 2) return "❓ 사용법: set [sfx/visual/master] [0.0~1.0]";

        const target = args[0].toLowerCase();
        const value = parseFloat(args[1]);

        if (!['sfx', 'visual', 'master'].includes(target)) return "🚫 대상은 sfx, visual, master 중 하나여야 합니다.";
        if (isNaN(value) || value < 0 || value > 2.0) return "🚫 값은 0.0 ~ 2.0 사이의 숫자여야 합니다.";

        // Update AudioManager
        if (this.audio && this.audio.volumeConfig) {
            this.audio.updateVolumeConfig({ [target]: value });

            // Persist to LocalStorage
            try {
                const current = JSON.parse(localStorage.getItem('HIVE_VOLUME_CONFIG') || "{}");
                current[target] = value;
                localStorage.setItem('HIVE_VOLUME_CONFIG', JSON.stringify(current));

                // Update Global Config (for reference)
                if (!window.HIVE_VOLUME_CONFIG) window.HIVE_VOLUME_CONFIG = {};
                window.HIVE_VOLUME_CONFIG[target] = value;

            } catch (e) {
                console.error("Save Failed:", e);
            }

            return `🔊 [Sound] ${target.toUpperCase()} 볼륨이 ${value}로 설정되었습니다. (저장됨)`;
        }
        return "🚫 오디오 매니저를 찾을 수 없습니다.";
    }

    handle(msgData) {
        if (!msgData.isStreamer) return false;
        const fullCmd = msgData.message.trim();
        const parts = fullCmd.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);

        const config = this.commands[cmd];
        if (config) {
            const resultMsg = config.action(args);
            const confirmMsg = resultMsg || config.msg;
            this.renderer.render({ ...msgData, message: confirmMsg });
            return true;
        }
        return false;
    }
}

// ==========================================
// [Execution & Init]
// ==========================================
const appConfig = new ConfigManager();
const audioManager = new AudioManager();
const chatRenderer = new ChatRenderer();
const visualDirector = new VisualDirector(appConfig);
const systemController = new SystemController(audioManager, visualDirector, chatRenderer);

// 전역 참조 (디버깅 및 호환성용)
window.audioManager = audioManager;
window.visualDirector = visualDirector;
window.systemController = systemController;

// 네트워크 연결 시작
// [Global Refactor] Process Message Logic for portability (Real & Fake)
// ==========================================
// [Class 7] Message Queue Manager
// ==========================================
class MessageQueue {
    constructor(processor) {
        this.processor = processor;
        this.queue = [];
        this.isProcessing = false;
        this.lastProcessTime = Date.now();
        this.baseDelay = 300; // 0.3s (Requested Base)
    }

    enqueue(msgData) {
        this.queue.push({
            data: msgData,
            timestamp: Date.now()
        });
        if (!this.isProcessing) {
            console.log("▶ [Queue] Starting Process Loop");
            this._process();
        } else {
            // [Debug] Already processing
            // console.log(`[Queue] Buffered (Current Size: ${this.queue.length})`);
        }
    }

    _process() {
        if (this.queue.length === 0) {
            console.log("⏹ [Queue] Auto-Stop (Empty)");
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const currentItem = this.queue.shift();
        const now = Date.now();

        // [Simpler Adaptive Algorithm]
        // 큐에 있는 메시지 수만큼 속도를 단순 비례로 높입니다.
        // 공식: 300ms base
        const queueSize = this.queue.length + 1;
        let dynamicDelay = 300;

        // [Threshold-based Aggressive Algorithm]
        if (queueSize >= 5) dynamicDelay = 16;       // 60fps (폭주)
        else if (queueSize >= 3) dynamicDelay = 60;  // Very Fast
        else if (queueSize >= 2) dynamicDelay = 150; // Fast
        else dynamicDelay = 300;                     // Normal (Relaxed)

        // 콘솔에 큐 상태 로그 출력 (디버깅용)
        console.log(`[Queue] Proc: "${currentItem.data.message.substring(0, 10)}..." | Size: ${queueSize} | Delay: ${dynamicDelay}ms`);

        try {
            this.processor(currentItem.data);
        } catch (e) {
            console.error("[Queue] Processor Error:", e);
        }

        setTimeout(() => {
            this._process();
        }, dynamicDelay);
    }
}

// 네트워크 연결 시작
// [Global Refactor] Process Message Logic for portability (Real & Fake)
// 내부 처리 함수 (기존 로직)
const _processMessageInternal = (msgData) => {
    // 0. 스트리머 전용 제어 명령어 처리 (Refactored)
    if (systemController.handle(msgData)) return;

    // 구독 알람의 경우 메시지가 없으면 기본 문구 삽입 (Protocol V1.0)
    if (msgData.isSubscription && !msgData.message) {
        msgData.message = `${msgData.nickname}님 ${msgData.subMonth}개월 구독`;
    }

    // [Debug] 모든 채팅 끝에 msgType 표시 (제거됨)
    const updatedTrimmedMsg = msgData.message ? msgData.message.trim() : "";

    // 0.5 특별 이벤트(구독) 처리
    if (msgData.isSubscription) {
        if (visualDirector.alertsEnabled || msgData.isStreamer) {
            visualDirector.trigger('dolphin', {
                message: "!돌핀 " + msgData.message,
                emotes: msgData.emojis,
                nickname: msgData.nickname,
                color: msgData.color,
                isStreamer: msgData.isStreamer
            });
        }
        return; // 구독은 항상 버블 숨김
    }

    // 1. 비주얼 이펙트 트리거 확인 (VisualDirector 위임)
    // [Fix] Check if VisualDirector has a handler for this keyword
    // Iterate registry keys to find match at start of message
    let foundKeyword = null;
    const visualMap = window.visualDirector.registry; // Access registry directly or via getter

    // Check strict matches "!명령어"
    for (const key in visualMap) {
        if (key === 'dolphin' && !msgData.isStreamer) continue; // [Refinement] !돌핀 is subscription-only (unless streamer)
        if (key === 'bangjong' && !msgData.isStreamer) continue; // [New] !방종송 is streamer-only
        if (key === 'mulsulsan' && (!msgData.isStreamer && !msgData.isDonation)) continue; // [Fix] !물설산 is streamer/donation only
        if (key === 'gazabu' && (!msgData.isStreamer && !msgData.isDonation)) continue; // [New] !가자부송 is streamer/donation only
        if (key === 'random_dance' && (!msgData.isStreamer && !msgData.isDonation)) continue; // [New] !랜덤댄스 is streamer/donation only
        const effect = visualMap[key];
        const soundKey = effect.soundKey; // e.g. "해골"
        // Check "!해골" or "!skull" (if mapped)
        if (updatedTrimmedMsg.startsWith("!" + soundKey)) {
            foundKeyword = key;
            break;
        }
    }

    if (foundKeyword) {
        const effectType = visualMap[foundKeyword];
        let shouldTrigger = false;

        if (msgData.isDonation) {
            // 후원은 알람 토글(alertsEnabled) 기준
            if (visualDirector.alertsEnabled || msgData.isStreamer) shouldTrigger = true;
        } else {
            // 일반 채팅은 이펙트 토글(enabled) 기준
            if (visualDirector.enabled || msgData.isStreamer) shouldTrigger = true;
        }

        if (shouldTrigger) {
            visualDirector.trigger(foundKeyword, {
                message: updatedTrimmedMsg,
                emotes: msgData.emojis,
                nickname: msgData.nickname,
                color: msgData.color,
                isStreamer: msgData.isStreamer
            });
            // [Fix] Hide chat message if visual effect is triggered (Requested by User)
            // But verify if it's a donation - donation needs to play TTS/Audio via AudioManager?
            // The original logic flowed down to audioManager.checkAndPlay.
            // If the user wants to HIDE it from chat ("채팅창에 등장 자체를 안해야하는데"),
            // we should return here unless it's a donation which might need a bubble?
            // User said "!갓겜송 is showing up... shouldn't appear".
            // So we return immediately after trigger.
            // However, we must ensure donation audio checks if needed.
            // Since this is a visual effect command, usually audio is handled by the effect itself.
            return;
        }

        if (msgData.isDonation) {
            audioManager.checkAndPlay(msgData.message, msgData.isStreamer);
            return;
        }
    } else {
        const t0 = performance.now();
        audioManager.checkAndPlay(msgData.message, msgData.isStreamer);
        if (msgData.isDonation) return;
        try {
            chatRenderer.render(msgData);
        } catch (e) {
            console.error("Renderer Error:", e);
        }
        const t1 = performance.now();
        if ((t1 - t0) > 10) {
            console.warn(`[Slow Render] Took ${(t1 - t0).toFixed(2)}ms`);
        }
    }
};

// 큐 인스턴스 생성
const messageQueue = new MessageQueue(_processMessageInternal);

// 외부 노출 진입점 (큐에 넣기만 함)
window.processMessage = (msgData) => {
    messageQueue.enqueue(msgData);
};

// 네트워크 연결 시작
const network = new ChzzkGateway(appConfig, window.processMessage);

// [Feature] Demo Mode (Triggered by !데모)
let _demoInterval = null;
let _demoTimeout = null;

window.stopDemoSequence = () => {
    if (_demoInterval) clearInterval(_demoInterval);
    if (_demoTimeout) clearTimeout(_demoTimeout);
    _demoInterval = null;
    _demoTimeout = null;
    console.log("🎬 Demo Sequence Stopped.");
    window.processMessage({
        message: "데모가 중단되었습니다.",
        nickname: "System",
        isStreamer: true,
        type: 'chat'
    });
};

window.runDemoSequence = (durationSeconds = 60) => {
    // Ensure previous demo is stopped
    if (_demoInterval || _demoTimeout) {
        if (_demoInterval) clearInterval(_demoInterval);
        if (_demoTimeout) clearTimeout(_demoTimeout);
    }

    const maxDuration = durationSeconds * 1000;
    console.log(`🎬 Starting Demo Sequence (${durationSeconds}s)...`);
    let demoCount = 0;
    const intervalTime = 1500; // Fast pace
    const names = window.RANDOM_NAMES || ["Anonymous", "트수", "시청자"];

    _demoInterval = setInterval(() => {
        if (!window.WELCOME_MESSAGES || window.WELCOME_MESSAGES.length === 0) return;

        // Random Message
        const msg = window.WELCOME_MESSAGES[Math.floor(Math.random() * window.WELCOME_MESSAGES.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const demoColors = ["#ff4444", "#44ff44", "#44bbff", "#ffff44", "#ff88ff", "#44ffff", "#ffa500", "#ffffff"];
        const color = demoColors[Math.floor(Math.random() * demoColors.length)];

        window.processMessage({
            message: msg,
            nickname: name,
            color: color,
            badges: [],
            emojis: {},
            isStreamer: true, // Force trigger effects
            uid: 'demo_' + Math.random().toString(36).substr(2, 9),
            type: 'chat',
            isDonation: false,
            isSubscription: false
        });

        demoCount++;
    }, intervalTime);

    // Stop after duration
    _demoTimeout = setTimeout(() => {
        clearInterval(_demoInterval);
        _demoInterval = null;
        _demoTimeout = null;
        console.log("🎬 Demo Sequence Finished.");
        window.processMessage({
            message: "데모가 종료되었습니다.",
            nickname: "System",
            isStreamer: true,
            type: 'chat'
        });
    }, maxDuration);
};

// [Feature] Startup Random Welcome Messages (Debug Mode Only)
let welcomeInterval = null;

if (appConfig.debugMode && window.WELCOME_MESSAGES && window.WELCOME_MESSAGES.length > 0) {
    const names = window.RANDOM_NAMES || ["Anonymous"];
    console.log("Starting Welcome Message Loop (Debug Mode)...");

    // Visual Effect Pool from Config
    const visualKeys = window.HIVE_VISUAL_CONFIG ? Object.keys(window.HIVE_VISUAL_CONFIG) : ['해골', '돌핀', '버질', '하트', '커플', '우쇼', '발파', '방종송'];

    // [Fixed] Moved Startup Sequence outside to ensure URL commands work
    // OLD Location - Removed


    welcomeInterval = setInterval(() => {
        // 10% Chance to FORCE a visual effect message if not already picked
        let msg = window.WELCOME_MESSAGES[Math.floor(Math.random() * window.WELCOME_MESSAGES.length)];
        let isVisual = false;

        // "비주얼 이팩트도 랜덤하게 띄워줘" - Explicitly inject visual command occasionally
        if (!msg.startsWith('!') && Math.random() < 0.3) {
            const randomVisual = visualKeys[Math.floor(Math.random() * visualKeys.length)];
            // Prepend visual command to the message
            msg = `!${randomVisual} ${msg}`;
            isVisual = true;
        }

        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomUid = 'bot_' + Math.random().toString(36).substr(2, 9);

        // Simulate incoming message
        window.processMessage({
            message: msg,
            nickname: randomName,
            color: null, // ChatRenderer's _resolveColor will now handle this with seed
            badges: [],
            emojis: {},
            isStreamer: isVisual,
            uid: randomUid,
            type: 'chat',
            isDonation: false,
            isSubscription: false
        });
    }, 2000); // Slower interval (2s) to let effects play out
}

// Global Connection Handler (Always Active)
window.addEventListener('chzzk_connected', () => {
    console.log("Connection Established. Stopping Startup Sequences.");

    // [User Request] Restore SFX Volume to 1.0 after loading
    if (window.audioManager) {
        window.audioManager.updateVolumeConfig({ sfx: 1.0 });
        console.log("🔊 [System] Loading complete. SFX Volume restored to 1.0");
    }

    // Stop Debug Sequences if running
    if (welcomeInterval) {
        clearInterval(welcomeInterval);
        welcomeInterval = null;
    }

    if (window._stressTestInterval) {
        clearInterval(window._stressTestInterval);
        window._stressTestInterval = null;
        console.log("🛑 Connection Established. Stopping Stress Test.");
    }

    // [New] Clear queued visual effects from startup
    if (window.visualDirector) {
        window.visualDirector.clearQueue();
    }

    // [New] Hide Loading Screen
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 1000); // Remove from DOM after transition
    }

}, { once: true });

// [Feature] Startup Effect Trigger (Moved from Debug Block)
setTimeout(() => {
    // 1. URL Command (Highest Priority)
    if (appConfig.startupCommand) {
        console.log(`🚀 [Startup] URL Command Detected: ${appConfig.startupCommand}`);
        window.visualDirector.trigger(appConfig.startupCommand, {
            message: `✨ 시스템 시작: ${appConfig.startupCommand}`,
            nickname: "System",
            isStreamer: true
        });
    }
    // 2. Default Startup Effect (mulsulsan)
    else {
        console.log(`🚀 [Startup] Default Effect: mulsulsan`);
        window.visualDirector.trigger('mulsulsan', {
            message: `✨ 시스템 시작: 물설산 이펙트`,
            nickname: "System",
            isStreamer: true
        });
    }
}, 1000); // 1 second after load

// [Test] Queue Stress Test (Modified for Startup Backlog)
// [Test] Queue Stress Test (Random Burst Mode)
window.runQueueStressTest = () => {
    console.warn("🚀 Starting Queue Stress Test (Random 0-3 msg/sec)...");
    let msgId = 1;
    let seconds = 0;

    const sendBatch = (count, label) => {
        console.log(`🔥 [Test] Sending Batch: ${label} (${count} msgs)`);
        const messages = window.WELCOME_MESSAGES || ["테스트 메시지"];
        const names = window.RANDOM_NAMES || ["Tester"];

        for (let i = 0; i < count; i++) {
            const rawMsg = messages[Math.floor(Math.random() * messages.length)];
            const randomName = names[Math.floor(Math.random() * names.length)];

            window.processMessage({
                message: rawMsg,
                nickname: randomName,
                isStreamer: false,
                type: 'chat',
                uid: 'test_' + msgId + '_' + i
            });
            msgId++;
        }
    };

    // 1초마다 0~3개 랜덤 전송 (최대 20초)
    window._stressTestInterval = setInterval(() => {
        seconds++;
        if (seconds > 20) {
            clearInterval(window._stressTestInterval);
            window._stressTestInterval = null;
            console.warn("🚀 Stress Test Completed (20s Limit).");
            return;
        }

        const randomCount = Math.floor(Math.random() * 4); // 0 ~ 3
        if (randomCount > 0) {
            sendBatch(randomCount, `Sec-${seconds}`);
        } else {
            console.log(`🔥 [Test] Sec-${seconds}: Skipping (0 msgs)`);
        }

    }, 1000);
};

// 즉시 실행 가능하도록 글로벌 등록 (필요시 콘솔에서 window.runQueueStressTest() 입력)

// [New] Dynamic Status Merger
// Detects legacy "치지직 채널 탐색중..." elements and merges them into the premium loader
// 자동 시작
network.connect();

// [Auto-Run] Test Queue immediately to build backlog during connection
setTimeout(() => window.runQueueStressTest(), 500);

// [Utility Helpers Compatibility]
function renderMessageWithEmotesHTML(message, emotes, scale = 1) {
    // Legacy helper for VisualDirector
    let content = message;
    if (emotes && Object.keys(emotes).length > 0) {
        // [Fix] Broaden regex to catch {:d_15:} or {d_15} or other variants
        content = message.replace(/\{[^}]+\}/g, (match) => {
            // Remove {, }, : and whitespace to get pure ID
            const emoteId = match.replace(/[\{\}:]/g, "").trim();
            const d = emotes[emoteId];
            const url = (d && (typeof d === 'string' ? d : (d.imageUrl || d.url))) || null;
            // [Fix] Use height:auto and max-width to preserve aspect ratio, preventing flattening
            // [Fix] Check if message is JUST this emote to scale it up
            const isSingleEmote = message.trim() === match;
            const sizeStyle = isSingleEmote ? "height: 10em; width: auto;" : `height: ${3 * scale}em; width: auto;`;

            return url ? `<img src="${url}" class="emote_chzzk_inline" style="${sizeStyle} vertical-align: middle; display: inline-block;" alt="${emoteId}">` : match;
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