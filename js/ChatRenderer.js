// ==========================================
// [Class 4] Chat Renderer (DOM & Animation)
// ==========================================
class ChatRenderer {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.container = document.getElementById('chat');
        this.boxPos = 0;
        this.activeBubbles = [];

        if (this.eventBus) {
            this.eventBus.on('chat:render', (data) => {
                try {
                    this.render(data);
                } catch (e) {
                    console.error("[ChatRenderer] Render Error:", e);
                }
            });
        }
    }

    render(data) {
        const { message, nickname, color, badges, emojis, type, uid } = data;
        const emotes = emojis || {}; // Map emojis to emotes for compatibility
        const originalMessage = message;
        const normOriginal = originalMessage ? originalMessage.normalize('NFC').trim() : "";

        // !명령어 제거 및 정리
        let displayMessage = message ? message.replace(/(^|\s)![\S]+/g, "").replace(/\s+/g, " ").trim() : "";

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

        // [New] Check for CMC video commands starting with @
        const CMC_FILES = window.HIVE_CMC_FILES || [];

        const findBestMatch = (term) => {
            term = term.toLowerCase().trim();
            // 1. Exact match
            let match = CMC_FILES.find(f => f.toLowerCase() === term);
            if (match) return match;
            // 2. Starts with / Ends with / Includes
            match = CMC_FILES.find(f => f.toLowerCase().startsWith(term));
            if (match) return match;
            match = CMC_FILES.find(f => term.startsWith(f.toLowerCase()));
            if (match) return match;
            match = CMC_FILES.find(f => f.toLowerCase().includes(term));
            if (match) return match;
            match = CMC_FILES.find(f => term.includes(f.toLowerCase()));
            if (match) return match;
            // 3. Common substring of length >= 2
            match = CMC_FILES.find(f => {
                const fLower = f.toLowerCase();
                for (let len = Math.min(fLower.length, term.length); len >= 2; len--) {
                    for (let i = 0; i <= fLower.length - len; i++) {
                        const sub = fLower.substring(i, i + len);
                        if (term.includes(sub)) return true;
                    }
                }
                return false;
            });
            return match || null;
        };

        const videoQueue = [];
        if (originalMessage) {
            const tokens = originalMessage.trim().split(/\s+/);
            for (const token of tokens) {
                if (token.startsWith('@') && token.length > 1) {
                    const term = token.substring(1);
                    const matchedFile = findBestMatch(term);
                    if (matchedFile) {
                        videoQueue.push(matchedFile);
                        if (videoQueue.length >= 5) break;
                    }
                }
            }
        }

        let usesSlot = true;
        let timeout = 10000;

        if (videoQueue.length > 0) {
            // Override max-height limits to prevent video from clipping
            chatBox.style.maxHeight = 'none';
            elements.chatLine.style.maxHeight = 'none';
            chatLineInner.style.overflow = 'hidden'; // Rounded corner clips for video

            // Adjust message element style for video
            messageEle.style.display = 'block';
            messageEle.style.webkitLineClamp = 'none';
            messageEle.style.lineClamp = 'none';
            messageEle.style.webkitBoxOrient = 'horizontal';
            messageEle.style.overflow = 'visible';
            messageEle.style.textOverflow = 'clip';
            messageEle.style.padding = '0'; // flush edge-to-edge inside the borders

            const video = document.createElement('video');
            video.style.width = '100%';
            video.style.display = 'block';
            video.style.borderRadius = '0 0 16px 16px'; // match bottom corners of chat bubble
            video.style.marginTop = '4px';
            video.playsInline = true;

            // Clear standard text timeout
            timeout = null;

            // Safety net: force remove after a timeout based on video count
            let safetyTimeout = setTimeout(() => {
                if (chatBox.parentElement) {
                    chatBox.classList.remove('visible');
                    setTimeout(() => chatBox.remove(), 1000);
                }
            }, Math.max(30000, videoQueue.length * 15000));

            let currentIdx = 0;
            const playNext = () => {
                if (currentIdx >= videoQueue.length) {
                    clearTimeout(safetyTimeout);
                    if (chatBox.parentElement) {
                        chatBox.classList.remove('visible');
                        setTimeout(() => chatBox.remove(), 1000);
                    }
                    return;
                }

                const fileName = videoQueue[currentIdx];
                video.src = `AI CMC/${encodeURIComponent(fileName)}.mp4`;
                video.play().catch(e => {
                    console.error("CMC video play failed, skipping:", e);
                    currentIdx++;
                    playNext();
                });
                currentIdx++;
            };

            video.addEventListener('ended', playNext);
            video.addEventListener('error', (e) => {
                console.error("CMC video error, skipping:", e);
                currentIdx++;
                playNext();
            });

            messageEle.appendChild(video);
            playNext();

            // Set left positioning
            this.boxPos = this.boxPos % 100;
            chatBox.style.left = this.boxPos + "%";
        } else {
            // 특수 효과 필터 (채팅 내용 기반)
            this._applyTextFilters(originalMessage, elements, userColor);

            // 이모티콘 처리 및 메시지 삽입
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
            const animResult = this._applyAnimations(normOriginal, displayMessage, elements);
            if (animResult.usesSlot === false) usesSlot = false;
            if (animResult.timeout) timeout = animResult.timeout;
        }

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
