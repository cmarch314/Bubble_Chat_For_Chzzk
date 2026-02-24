// ==========================================
// [Class 2] Chzzk Network Gateway
// ==========================================
class ChzzkGateway {
    constructor(config, eventBus, legacyMessageHandler = null) {
        this.config = config;
        this.eventBus = eventBus;
        this.onMessage = legacyMessageHandler;
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

                if (this.eventBus) {
                    this.eventBus.emit('chat:received', messageData);
                } else if (this.onMessage) {
                    this.onMessage(messageData); // Fallback
                }
            });
        }
    }

    async _fetchWithProxy(url) {
        // 1. 빠른 접속을 위해 주요 프록시 3개 동시 요청 (가장 먼저 응답오는 것 사용)
        const fastProxies = [
            this._fetchAllOrigins(url),
            this._fetchStandardProxy("https://corsproxy.io/?", url),
            this._fetchStandardProxy("https://api.codetabs.com/v1/proxy?quest=", url)
        ];

        try {
            return await Promise.any(fastProxies);
        } catch (aggregateError) {
            // 2. 메인 프록시들이 모두 실패하면 예비 프록시 순차 접근
            const fallbackProxies = [
                "https://thingproxy.freeboard.io/fetch/",
                "https://api.cors.lol/?url=",
                "https://cors-anywhere.herokuapp.com/"
            ];

            let lastError = null;
            for (let proxy of fallbackProxies) {
                try {
                    return await this._fetchStandardProxy(proxy, url);
                } catch (e) {
                    lastError = e;
                }
            }

            // 3. 마지막 보루: 직접 요청 (CORS 제한이 풀려있을 경우를 대비)
            try {
                const res = await fetch(url);
                if (res.ok) return await res.json();
            } catch (e) { }

            throw new Error(`연결 실패 (모든 프록시 응답 없음)`);
        }
    }

    async _fetchAllOrigins(url) {
        const cacheBuster = `&_t=${Date.now()}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}${cacheBuster}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error("AllOrigins HTTP Error");
        const wrapper = await res.json();
        if (!wrapper || !wrapper.contents) throw new Error("AllOrigins No Contents");
        const data = JSON.parse(wrapper.contents);
        if (data && data.code !== undefined && data.code !== 200) throw new Error(`Chzzk ${data.code}`);
        return data;
    }

    async _fetchStandardProxy(proxyPrefix, url) {
        const fullUrl = proxyPrefix + encodeURIComponent(url);
        const res = await fetch(fullUrl);
        if (!res.ok) throw new Error(`Proxy HTTP Error: ${res.status}`);
        const data = await res.json();
        if (data && data.code !== undefined && data.code !== 200) throw new Error(`Chzzk ${data.code}`);
        return data;
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
