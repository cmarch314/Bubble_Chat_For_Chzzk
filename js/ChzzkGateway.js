// Chzzk connection supervisor for the OBS overlay.
// Keeps the page and running effects alive while chat sessions are replaced.
class ChzzkGateway {
    constructor(config, eventBus, legacyMessageHandler = null, timers = {}) {
        this.config = config;
        this.eventBus = eventBus;
        this.onMessage = legacyMessageHandler;

        this.ws = null;
        this.pendingSocket = null;
        this.activeChatChannelId = null;
        this.socketGeneration = 0;
        this.connectGeneration = 0;

        this.attemptCount = 1;
        this.failureCount = 0;
        this.reconnectTimer = null;
        this.heartbeatTimer = null;
        this.sessionCheckTimer = null;
        this.authTimer = null;

        this.state = 'idle';
        this.stopped = false;
        this.connectInFlight = false;
        this.sessionCheckInFlight = false;
        this.lastPacketAt = 0;
        this.preferredTransport = null;

        this.setTimeout = timers.setTimeout || ((callback, delay) => setTimeout(callback, delay));
        this.clearTimeout = timers.clearTimeout || (id => clearTimeout(id));
        this.setInterval = timers.setInterval || ((callback, delay) => setInterval(callback, delay));
        this.clearInterval = timers.clearInterval || (id => clearInterval(id));
        this.now = timers.now || (() => Date.now());
        this.random = timers.random || Math.random;
        this.sessionCheckIntervalMs = timers.sessionCheckIntervalMs || 30000;
        this.authTimeoutMs = timers.authTimeoutMs || 8000;
        this.staleConnectionMs = timers.staleConnectionMs || 120000;
    }

    async connect(options = {}) {
        if (this.connectInFlight) return;

        this.stopped = false;
        this.connectInFlight = true;
        const generation = ++this.connectGeneration;
        const forceDiscovery = options.forceDiscovery === true;
        const cacheKey = `chzzk_chat_channel_id_${this.config.channelId}`;

        this._clearReconnect();
        this._setState('discovering', options.reason || 'connect');
        this._showLoader(`치지직 채널 연결 중… (${this.attemptCount}번째 시도)`, 'loading');

        try {
            if (!this.config.channelId || this.config.channelId === 'NULL') {
                throw new Error('채널 ID가 설정되지 않았습니다.');
            }

            let chatChannelId = forceDiscovery ? null : this._readCachedChannelId(cacheKey);
            if (!chatChannelId) {
                const statusData = await this._fetchLiveStatus();
                chatChannelId = statusData?.content?.chatChannelId;
                if (!chatChannelId) throw new Error('현재 방송의 채팅 세션을 찾지 못했습니다.');
                this._writeCachedChannelId(cacheKey, chatChannelId);
            }

            if (generation !== this.connectGeneration || this.stopped) return;
            this._setState('fetching-token');
            this._showLoader(`채팅 인증 정보 요청 중… (${this.attemptCount}번째 시도)`, 'loading');

            let tokenData;
            try {
                tokenData = await this._fetchAccessToken(chatChannelId);
            } catch (error) {
                this._removeCachedChannelId(cacheKey);
                throw new Error(`채팅 인증 정보 요청 실패: ${error.message}`);
            }

            const accessToken = tokenData?.content?.accessToken;
            if (!accessToken) {
                this._removeCachedChannelId(cacheKey);
                throw new Error('채팅 인증 응답이 올바르지 않습니다.');
            }

            if (generation !== this.connectGeneration || this.stopped) return;
            this._connectSocket(chatChannelId, accessToken);
        } catch (error) {
            if (generation !== this.connectGeneration || this.stopped) return;
            this.config.log(`Connection failed: ${error.message}`);
            this._showLoader(`연결 실패 · 자동 재시도 중 (${this.attemptCount}회)`, 'error');
            this.attemptCount++;
            this.failureCount++;
            this._setState('backoff', error.message);
            this._scheduleReconnect(this._getReconnectDelay(), {
                forceDiscovery: true,
                reason: 'connect-failed'
            });
        } finally {
            if (generation === this.connectGeneration) this.connectInFlight = false;
        }
    }

    _readCachedChannelId(cacheKey) {
        try {
            const value = localStorage.getItem(cacheKey);
            if (value) this.config.log(`Using cached chat session: ${value}`);
            return value;
        } catch (error) {
            this.config.log(`LocalStorage read failed: ${error.message}`);
            return null;
        }
    }

    _writeCachedChannelId(cacheKey, value) {
        try {
            localStorage.setItem(cacheKey, value);
        } catch (error) {
            this.config.log(`LocalStorage write failed: ${error.message}`);
        }
    }

    _removeCachedChannelId(cacheKey) {
        try {
            localStorage.removeItem(cacheKey);
        } catch (error) {
            this.config.log(`LocalStorage remove failed: ${error.message}`);
        }
    }

    _fetchLiveStatus() {
        this.config.log('Discovering current live chat session.');
        return this._fetchWithProxy(
            `https://api.chzzk.naver.com/polling/v2/channels/${this.config.channelId}/live-status`
        );
    }

    _fetchAccessToken(chatChannelId) {
        return this._fetchWithProxy(
            `https://comm-api.game.naver.com/nng_main/v1/chats/access-token?channelId=${chatChannelId}&chatType=STREAMING`
        );
    }

    _connectSocket(chatChannelId, accessToken) {
        this._closePendingSocket();
        const generation = ++this.socketGeneration;
        const socket = new WebSocket('wss://kr-ss1.chat.naver.com/chat');
        this.pendingSocket = socket;
        this._setState('opening-socket');

        socket.onopen = () => {
            if (socket !== this.pendingSocket || generation !== this.socketGeneration || this.stopped) return;
            this._setState('authenticating');
            this.config.log('WS open. Authenticating chat session.');
            socket.send(JSON.stringify({
                ver: '2',
                cmd: 100,
                svcid: 'game',
                cid: chatChannelId,
                bdy: { accTkn: accessToken, auth: 'READ', devType: 2001, uid: null },
                tid: 1
            }));

            this._clearAuthTimer();
            this.authTimer = this.setTimeout(() => {
                if (socket !== this.pendingSocket || generation !== this.socketGeneration) return;
                this.config.log('Chat authentication timed out. Refreshing session.');
                this._failPendingSocket(socket, 'auth-timeout');
            }, this.authTimeoutMs);
        };

        socket.onmessage = event => {
            if (this.stopped || (socket !== this.pendingSocket && socket !== this.ws)) return;
            try {
                if (socket === this.ws) this.lastPacketAt = this.now();
                this._parsePacket(JSON.parse(event.data), chatChannelId, socket, generation);
            } catch (error) {
                this.config.log(`WS packet parse failed: ${error.message}`);
            }
        };

        socket.onclose = () => this._handleSocketClose(socket, generation);
        socket.onerror = () => this.config.log('WS transport error.');
    }

    _handleSocketClose(socket, generation) {
        if (this.stopped || generation > this.socketGeneration) return;
        const wasPending = socket === this.pendingSocket;
        const wasActive = socket === this.ws;
        if (!wasPending && !wasActive) return;

        if (wasPending) this.pendingSocket = null;
        if (wasActive) this.ws = null;
        this._clearAuthTimer();
        if (wasActive) {
            this._clearHeartbeat();
            this._clearSessionCheck();
        }

        this.config.log('WS closed. Refreshing the live chat session.');
        this.attemptCount++;
        this.failureCount++;
        this._setState('backoff', 'socket-closed');
        this._scheduleReconnect(this._getReconnectDelay(), {
            forceDiscovery: true,
            reason: 'socket-closed'
        });
    }

    _markSocketReady(socket, generation, chatChannelId) {
        if (socket !== this.pendingSocket || generation !== this.socketGeneration || this.stopped) return;

        this._clearAuthTimer();
        const previousSocket = this.ws;
        this.ws = socket;
        this.pendingSocket = null;
        this.activeChatChannelId = chatChannelId;
        this.lastPacketAt = this.now();
        this.failureCount = 0;
        this.attemptCount = 1;
        this._setState('ready');

        if (previousSocket && previousSocket !== socket) this._closeSocketSilently(previousSocket);
        this._startHeartbeat(socket);
        this._startSessionCheck();
        this._showLoader('채팅 연결 완료', 'success');
        window.dispatchEvent(new CustomEvent('chzzk_connected'));
        this.eventBus?.emit?.('network:ready', { chatChannelId });
    }

    _startHeartbeat(socket) {
        this._clearHeartbeat();
        this.heartbeatTimer = this.setInterval(() => {
            if (socket !== this.ws || this.stopped) return;
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ ver: '2', cmd: 0 }));
            }
        }, 20000);
    }

    _startSessionCheck() {
        this._clearSessionCheck();
        this.sessionCheckTimer = this.setInterval(
            () => this._checkLiveSession(),
            this.sessionCheckIntervalMs
        );
    }

    async _checkLiveSession() {
        if (this.sessionCheckInFlight || this.stopped || !this.ws) return;
        this.sessionCheckInFlight = true;
        try {
            if (this.lastPacketAt && this.now() - this.lastPacketAt > this.staleConnectionMs) {
                this.config.log('Chat transport is stale. Re-authenticating without a page reload.');
                this._restartSession('stale-transport');
                return;
            }

            const statusData = await this._fetchLiveStatus();
            const currentChatChannelId = statusData?.content?.chatChannelId;
            if (currentChatChannelId && currentChatChannelId !== this.activeChatChannelId) {
                this.config.log(`Live chat session changed: ${this.activeChatChannelId} -> ${currentChatChannelId}`);
                this._restartSession('live-session-changed');
            }
        } catch (error) {
            // A monitoring failure must not tear down a working chat connection.
            this.config.log(`Live session check skipped: ${error.message}`);
        } finally {
            this.sessionCheckInFlight = false;
        }
    }

    _restartSession(reason) {
        if (this.stopped) return;
        this.connectGeneration++;
        this.connectInFlight = false;
        this._closePendingSocket();
        this._clearAuthTimer();
        this._clearSessionCheck();
        this._scheduleReconnect(0, { forceDiscovery: true, reason });
    }

    _failPendingSocket(socket, reason) {
        if (socket !== this.pendingSocket) return;
        this.pendingSocket = null;
        this._closeSocketSilently(socket);
        this.failureCount++;
        this.attemptCount++;
        this._setState('backoff', reason);
        this._scheduleReconnect(this._getReconnectDelay(), {
            forceDiscovery: true,
            reason
        });
    }

    _getReconnectDelay() {
        const base = Math.min(15000, 1000 * (2 ** Math.min(this.failureCount, 4)));
        return Math.round(base + (base * 0.2 * this.random()));
    }

    _scheduleReconnect(delay, options = {}) {
        if (this.stopped) return;
        this._clearReconnect();
        this.reconnectTimer = this.setTimeout(() => {
            this.reconnectTimer = null;
            this.connect(options);
        }, delay);
    }

    _clearReconnect() {
        if (this.reconnectTimer === null) return;
        this.clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
    }

    _clearHeartbeat() {
        if (this.heartbeatTimer === null) return;
        this.clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    }

    _clearSessionCheck() {
        if (this.sessionCheckTimer === null) return;
        this.clearInterval(this.sessionCheckTimer);
        this.sessionCheckTimer = null;
    }

    _clearAuthTimer() {
        if (this.authTimer === null) return;
        this.clearTimeout(this.authTimer);
        this.authTimer = null;
    }

    _closeSocketSilently(socket) {
        if (!socket || typeof socket.close !== 'function') return;
        socket.onclose = null;
        try { socket.close(); } catch (error) {}
    }

    _closePendingSocket() {
        const socket = this.pendingSocket;
        this.pendingSocket = null;
        this._closeSocketSilently(socket);
    }

    _setState(state, reason = '') {
        this.state = state;
        this.eventBus?.emit?.('network:state', {
            state,
            reason,
            attempt: this.attemptCount
        });
    }

    disconnect() {
        this.stopped = true;
        this.connectGeneration++;
        this.connectInFlight = false;
        this.socketGeneration++;
        this._clearReconnect();
        this._clearHeartbeat();
        this._clearSessionCheck();
        this._clearAuthTimer();
        this._closePendingSocket();
        this._closeSocketSilently(this.ws);
        this.ws = null;
        this.activeChatChannelId = null;
        this._setState('stopped');
    }

    _parsePacket(data, chatChannelId, socket = this.ws, generation = this.socketGeneration) {
        if (data.cmd === 0) {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ ver: '2', cmd: 10000 }));
            }
            return;
        }

        if (data.cmd === 10100) {
            if (socket === this.pendingSocket) this._markSocketReady(socket, generation, chatChannelId);

            let historyCount = 0;
            if (this.config.debugMode) historyCount = 10;
            else if (this.config.loadHistory) historyCount = 50;

            if (historyCount > 0 && socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    ver: '2', cmd: 5101, svcid: 'game', cid: chatChannelId,
                    bdy: { recentMessageCount: historyCount }, tid: 2, sid: data.bdy?.sid
                }));
            }
            return;
        }

        if (![93101, 93102, 15101, 94101].includes(data.cmd) || socket !== this.ws) return;
        const chats = data.cmd === 15101 ? data.bdy?.messageList : data.bdy;
        if (!chats) return;

        const chatArray = Array.isArray(chats) ? chats : [chats];
        chatArray.forEach(chat => {
            if (!chat) return;
            let profile = {};
            let extra = {};
            try {
                profile = chat.profile ? JSON.parse(chat.profile) : {};
                extra = chat.extras ? JSON.parse(chat.extras) : {};
            } catch (error) {
                this.config.log(`Chat metadata parse failed: ${error.message}`);
                return;
            }

            const msgType = chat.messageTypeCode || chat.msgTypeCode || 1;
            const isDonation = msgType === 10;
            const isSubscription = msgType === 11;
            const colorCode = profile?.streamingProperty?.nicknameColor?.colorCode || null;
            const messageData = {
                message: chat.msg || chat.content || '',
                nickname: profile.nickname || 'Anonymous',
                color: colorCode,
                badges: profile.activityBadges || [],
                emojis: extra.emojis || {},
                isStreamer: profile.userRoleCode === 'streamer' || profile.userIdHash === this.config.channelId,
                isSubscriber: !!profile?.streamingProperty?.subscription,
                uid: profile.userIdHash,
                type: 'chat',
                isDonation,
                donationAmount: isDonation ? extra.payAmount || 0 : 0,
                isSubscription,
                subMonth: isSubscription ? extra.month || 1 : 0,
                msgType
            };

            if (this.eventBus) this.eventBus.emit('chat:received', messageData);
            else this.onMessage?.(messageData);
        });
    }

    _prepareUrl(url) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}_t=${this.now()}`;
    }

    async _fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
        const controller = new AbortController();
        const timeout = this.setTimeout(() => controller.abort(), timeoutMs);
        try {
            return await fetch(url, { ...options, signal: controller.signal });
        } finally {
            this.clearTimeout(timeout);
        }
    }

    _transportCandidates(targetUrl) {
        return [
            { id: 'direct', run: () => this._fetchDirect(targetUrl) },
            { id: 'allorigins', run: () => this._fetchAllOrigins(targetUrl) },
            { id: 'cors-lol', run: () => this._fetchStandardProxy('https://api.cors.lol/?url=', targetUrl, true) },
            { id: 'corsfix', run: () => this._fetchStandardProxy('https://proxy.corsfix.com/', targetUrl, false) },
            { id: 'thingproxy', run: () => this._fetchStandardProxy('https://thingproxy.freeboard.io/fetch/', targetUrl, false) },
            { id: 'corsproxy-io', run: () => this._fetchStandardProxy('https://corsproxy.io/?', targetUrl, true) },
            { id: 'codetabs', run: () => this._fetchStandardProxy('https://api.codetabs.com/v1/proxy?quest=', targetUrl, true) }
        ];
    }

    async _fetchWithProxy(url) {
        const targetUrl = this._prepareUrl(url);
        const candidates = this._transportCandidates(targetUrl);

        if (this.preferredTransport) {
            const preferred = candidates.find(candidate => candidate.id === this.preferredTransport);
            if (preferred) {
                try {
                    return await preferred.run();
                } catch (error) {
                    this.config.log(`Preferred transport ${preferred.id} failed: ${error.message}`);
                    this.preferredTransport = null;
                }
            }
        }

        const primary = candidates.slice(0, 4);
        try {
            return await this._raceTransports(primary);
        } catch (primaryError) {
            return this._raceTransports(candidates.slice(4));
        }
    }

    async _raceTransports(candidates) {
        const result = await Promise.any(candidates.map(async candidate => ({
            id: candidate.id,
            data: await candidate.run()
        })));
        this.preferredTransport = result.id;
        return result.data;
    }

    async _fetchDirect(targetUrl) {
        const response = await this._fetchWithTimeout(targetUrl);
        return this._parseApiResponse(response, 'Direct');
    }

    async _fetchAllOrigins(targetUrl) {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const response = await this._fetchWithTimeout(proxyUrl);
        if (!response.ok) throw new Error(`AllOrigins HTTP ${response.status}`);
        const wrapper = await response.json();
        if (!wrapper?.contents) throw new Error('AllOrigins returned no content');
        const data = JSON.parse(wrapper.contents);
        this._validateApiData(data, 'AllOrigins');
        return data;
    }

    async _fetchStandardProxy(prefix, targetUrl, encode = true) {
        const fullUrl = prefix + (encode ? encodeURIComponent(targetUrl) : targetUrl);
        const response = await this._fetchWithTimeout(fullUrl);
        return this._parseApiResponse(response, prefix);
    }

    async _parseApiResponse(response, source) {
        if (!response.ok) throw new Error(`${source} HTTP ${response.status}`);
        const data = await response.json();
        this._validateApiData(data, source);
        return data;
    }

    _validateApiData(data, source) {
        if (!data || data.code !== 200 || !data.content) {
            throw new Error(`${source} returned an invalid Chzzk response`);
        }
    }

    _showLoader(message, type) {
        const loader = document.getElementById('loading-screen');
        const loaderText = loader?.querySelector?.('.loader-text');
        if (loader && loaderText) {
            loaderText.textContent = message;
            loader.classList.remove('hidden');
            loaderText.style.color = type === 'error' ? '#ff4444' : '';
            if (type === 'success') {
                this.setTimeout(() => loader.classList.add('hidden'), 1000);
            }
            return;
        }

        let fallback = document.getElementById('chzzk-loader');
        if (!fallback && document.createElement && document.body?.appendChild) {
            fallback = document.createElement('div');
            fallback.id = 'chzzk-loader';
            document.body.appendChild(fallback);
            Object.assign(fallback.style, {
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '10px',
                zIndex: '9999', fontSize: '3em'
            });
        }
        if (!fallback) return;
        fallback.textContent = message;
        fallback.style.display = 'block';
        fallback.style.color = type === 'error' ? '#ff4444' : 'white';
        if (type === 'success') this.setTimeout(() => fallback.remove?.(), 1000);
    }
}
