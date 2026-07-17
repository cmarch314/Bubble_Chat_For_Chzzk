// ==========================================
// [Class 4] Chat Renderer (DOM & Animation)
// ==========================================
class ChatRenderer {
    constructor(eventBus, audioManager = null) {
        this.eventBus = eventBus;
        this.audioManager = audioManager;
        this.scope = new DisposableScope();
        this.timers = new ManagedTimers();
        this.scope.add(() => this.timers.clearAll());
        this.container = document.getElementById('chat');
        this.boxPos = 0;
        this.activeBubbles = [];
        this.mediaBubbleController = new ChatMediaBubbleController(this);

        if (this.eventBus) {
            this.scope.add(this.eventBus.on('chat:render', (data) => {
                try {
                    this.render(data);
                } catch (e) {
                    console.error("[ChatRenderer] Render Error:", e);
                }
            }));
        }
    }

    dispose() {
        this.timers.clearAll();
        this.scope.dispose();
        for (const bubble of this.activeBubbles) bubble?.remove?.();
        this.activeBubbles = [];
    }

    render(data) {
        const normalized = ChatMessageNormalizer.normalize(data);
        const { nickname, color, badges, type, uid } = normalized;
        const emotes = normalized.emotes;
        const originalMessage = normalized.message;
        const normOriginal = normalized.normalizedMessage;
        let displayMessage = normalized.displayMessage;
        const specialBubble = typeof ChatSpecialBubbleCommand !== 'undefined'
            ? ChatSpecialBubbleCommand.parse(originalMessage)
            : null;

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
                const badgeUrl = SafeContent.remoteImageUrl(b.imageUrl || b.url);
                if (!badgeUrl) return;
                let img = document.createElement('img');
                img.src = badgeUrl;
                img.classList.add('badge');
                badgeEle.appendChild(img);
            });
        }

        // [New] Check for CMC video commands starting with #
        const videoQueue = typeof findCMCVideosInMessage === 'function' ? findCMCVideosInMessage(originalMessage) : [];

        let usesSlot = true;
        let slotSpan = 1;
        let timeout = 10000;

        if (specialBubble?.kind === 'clown') {
            chatBox.classList.add('chat-box--clown');
            slotSpan = 2;
            chatLineInner.classList.add('chat-line-inner--clown');
            chatLineInner.style.background = '';
            nameBox.classList.add('name-box--clown');
            messageEle.classList.add('message--clown');
            messageEle.textContent = specialBubble.text;
            timeout = 10000;
        } else if (videoQueue.length > 0) {
            const mediaResult = this.mediaBubbleController.mount(originalMessage, elements, videoQueue);
            timeout = mediaResult.timeout;
        } else {
            // 특수 효과 필터 (채팅 내용 기반)
            this._applyTextFilters(originalMessage, elements, userColor);

            // 이모티콘 처리 및 메시지 삽입
            messageEle.innerHTML = renderMessageWithEmotesHTML(displayMessage, emotes);

            // Ensure Twemoji is applied
            if (window.twemoji) {
                try { twemoji.parse(messageEle); } catch (e) { }
            }

            // 메시지 길이 기반 스타일 조정
            if (displayMessage.length <= 5) {
                messageEle.style.fontSize = (2.6 - displayMessage.length / 3) + "em";
                messageEle.style.textAlign = "center";
            }

            // 애니메이션 적용 (나락, 흔들기 등)
            const animResult = this._applyAnimations(normOriginal, displayMessage, elements);
            if (animResult.usesSlot === false) usesSlot = false;
            if (animResult.timeout) timeout = animResult.timeout;
        }

        // 슬롯 관리 (화면 겹침 방지)
        if (usesSlot) {
            this._claimBubbleSlots(chatBox, slotSpan);
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

        // 타임아웃 제거
        if (timeout) {
            this.timers.timeout(() => {
                if (chatBox.parentElement) {
                    chatBox.classList.remove('visible');
                    this.timers.timeout(() => {
                        chatBox.remove();
                        this._releaseBubbleSlots(chatBox);
                    }, 1000);
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

    _claimBubbleSlots(chatBox, requestedSpan = 1) {
        const slotCount = 5;
        const span = Math.max(1, Math.min(slotCount, Number(requestedSpan) || 1));
        this.activeBubbles = this.activeBubbles.filter(bubble => bubble && bubble.parentElement);

        const findAvailableStart = () => {
            const occupied = new Set();
            this.activeBubbles.forEach(bubble => {
                const start = Number(bubble.dataset?.chatSlotStart);
                const bubbleSpan = Number(bubble.dataset?.chatSlotSpan || 1);
                if (!Number.isFinite(start)) return;
                for (let slot = start; slot < start + bubbleSpan; slot++) occupied.add(slot);
            });
            const cursor = Math.floor((this.boxPos % 100) / 20);
            for (let offset = 0; offset < slotCount; offset++) {
                const start = (cursor + offset) % slotCount;
                if (start + span > slotCount) continue;
                let free = true;
                for (let slot = start; slot < start + span; slot++) {
                    if (occupied.has(slot)) free = false;
                }
                if (free) return start;
            }
            return null;
        };

        let start = findAvailableStart();
        while (start === null && this.activeBubbles.length) {
            const oldest = this.activeBubbles.shift();
            oldest?.remove?.();
            start = findAvailableStart();
        }
        if (start === null) start = 0;

        chatBox.dataset.chatSlotStart = String(start);
        chatBox.dataset.chatSlotSpan = String(span);
        chatBox.style.left = `${start * 20}%`;
        this.boxPos = ((start + span) % slotCount) * 20;
        this.activeBubbles.push(chatBox);
        return { start, span };
    }

    _releaseBubbleSlots(chatBox) {
        this.activeBubbles = this.activeBubbles.filter(bubble => bubble !== chatBox && bubble?.parentElement);
    }

    _resolveColor(color, uid) {
        const safeColor = SafeContent.cssColor(color, '');
        if (safeColor && safeColor !== "#000000") return safeColor;
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
