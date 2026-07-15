class HuntRenderer {
    constructor(options = {}) {
        this.container = null;
        this.card = null;
        this.lobbyTimer = null;
        this.lobbyTimeouts = [];
        this.lobbyTimers = options.lobbyTimers || new ManagedTimers();
        this.animationTimers = options.animationTimers || new ManagedTimers();
        this.combatAnimator = new HuntCombatAnimator(this);
        this.notifications = new HuntNotificationRenderer(this);
    }

    setContainer(container) {
        this.container = container;
        if (container) {
            this.card = container.querySelector('.game-hunt-card');
        }
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'game-overlay-container';
        document.body.appendChild(this.container);
        this.card = null;
        return this.container;
    }

    clearLobbyTimer() {
        this.lobbyTimers.clearAll();
        this.lobbyTimer = null;
        this.lobbyTimeouts = [];
    }

    clearAnimationTimers() {
        this.animationTimers.clearAll();
    }

    removeContainer() {
        this.clearLobbyTimer();
        this.clearAnimationTimers();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.card = null;
    }

    renderLobby(data) {
        this.clearAnimationTimers();
        // Check if card already exists to prevent glitchy entry animations on consecutive rounds
        const isReentry = !!this.card;

        if (!this.container) {
            this.createContainer();
        }

        // Clear any existing lobby timer before starting a new one
        this.clearLobbyTimer();

        const { consecutiveTotal, currentConsecutiveIndex, consecutiveQueue, selectedMonster, selectedWeapons } = data;

        const titleText = consecutiveTotal > 1 
            ? `${selectedMonster.nameKO} 대연속 수렵 (${currentConsecutiveIndex + 1}/${consecutiveTotal}차전)`
            : `${selectedMonster.nameKO} 수렵 퀘스트`;

        // Build monster showcase section dynamically
        let monsterShowcaseHTML = '';
        if (consecutiveTotal > 1) {
            monsterShowcaseHTML = `
                <div class="game-hunt-monster-showcase" style="margin-bottom: 16px; background: transparent; border: none; box-shadow: none; padding: 0;">
                    <div style="display:flex; justify-content:center; gap:25px; align-items:center; width: 100%;">
                        ${consecutiveQueue.map((m, idx) => {
                            const isCurrent = idx === currentConsecutiveIndex;
                            const borderStyle = isCurrent ? '4px solid #c98534' : '2px dashed #444';
                            const shadowStyle = isCurrent ? '0 0 20px rgba(201, 133, 52,0.5)' : 'none';
                            const opacityStyle = isCurrent ? '1.0' : '0.5';
                            return `
                            <div style="display:flex; flex-direction:column; align-items:center; position:relative; width: 125px; opacity: ${opacityStyle};">
                                <img class="game-hunt-monster-img" src="img/monsters/${m.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width:115px; height:115px; border-radius:18px; border:${borderStyle}; box-shadow:${shadowStyle}; background:rgba(0,0,0,0.6);" />
                                <div style="font-size:1.15rem; font-weight:bold; color:${isCurrent ? '#c98534' : '#888'}; margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:125px;">${m.nameKO}</div>
                            </div>
                            ${idx < consecutiveQueue.length - 1 ? '<div style="font-size:2.2rem; color:#c98534; font-weight:bold; opacity:0.3; margin: 0 6px;">→</div>' : ''}
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else {
            monsterShowcaseHTML = `
                <div class="game-hunt-monster-showcase" style="margin-bottom: 16px; background: transparent; border: none; box-shadow: none; padding: 0;">
                    <img class="game-hunt-monster-img" src="img/monsters/${selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width: 260px; height: 260px; filter: drop-shadow(0 15px 30px rgba(0,0,0,0.8)); transition: transform 0.3s ease;" />
                </div>
            `;
        }

        this.container.innerHTML = `
            <div class="game-hunt-card ${isReentry ? '' : 'entry-anim'}">
                <div style="font-size: 1.0rem; font-weight: bold; color: #c98534; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8; margin-bottom: 2px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span>🏕️</span><span>QUEST DEPARTURE BOARD</span><span>🏕️</span>
                </div>
                <div class="game-title" style="font-size:2.3rem; background: linear-gradient(90deg, #c98534, #ff5500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight:bold; margin-top: 2px; margin-bottom:6px; text-shadow: 0 2px 10px rgba(201, 133, 52,0.25);">
                    ${titleText}
                </div>

                ${monsterShowcaseHTML}

                <div class="game-hunt-weapons-grid">
                    ${(() => {
                        const pMap = {
                            veteran:   { label: "🏆 베테랑",  bg: "rgba(255,200,0,0.18)",   border: "#ffc800", color: "#ffc800" },
                            support:   { label: "💚 서포터",  bg: "rgba(0,220,100,0.18)",   border: "#00dc64", color: "#00dc64" },
                            newbie:    { label: "🐣 몬린이",  bg: "rgba(100,200,255,0.18)", border: "#64c8ff", color: "#64c8ff" },
                            offensive: { label: "💥 공격형",  bg: "rgba(255,60,60,0.18)",   border: "#ff3c3c", color: "#ff3c3c" },
                            defensive: { label: "🛡️ 수비형",  bg: "rgba(80,140,255,0.18)",  border: "#508cff", color: "#508cff" },
                            normal:    { label: "⚖️ 밸런스",  bg: "rgba(160,160,160,0.18)", border: "#aaa",    color: "#aaa"    },
                        };
                        return selectedWeapons.map(w => {
                            const p = pMap[w.personality] || pMap.normal;
                            return `
                            <div class="game-hunt-weapon-card" id="hunt-opt-${w.index}" style="position: relative; padding: 24px 20px 18px;">
                                <div class="lobby-prep-bubble" id="prep-bubble-${w.index}">🍳 식사 버프 준비 중...</div>
                                <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); border: 2.5px solid #c98534; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; font-weight: bold; color: #c98534; box-shadow: 0 0 8px rgba(201, 133, 52, 0.4); z-index: 5;">${w.index + 1}</div>
                                <div class="game-hunt-weapon-img-container" style="position: relative; width: 95px; height: 95px; margin: 0 auto 12px;">
                                    <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" style="margin: 0; width: 95px; height: 95px;" />
                                </div>
                                <div class="game-hunt-weapon-name" style="font-size:1.7rem;font-weight:bold;color:#c98534;margin-bottom:4px;">HUNTER ${w.index + 1}</div>
                                <div style="font-size:1.35rem;font-weight:bold;background:${p.bg};border:1.5px solid ${p.border};border-radius:8px;padding:4px 10px;margin-bottom:8px;color:${p.color};box-shadow: 0 0 10px ${p.bg};">${p.label}</div>
                                <div class="bet-count" style="font-size:1.25rem;color:#aaa;font-weight:bold;">0명 신청</div>
                                <div class="bet-names-list" style="font-size: 1.05rem; color: #aaa; margin-top: 4px; min-height: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%; margin-left: auto; margin-right: auto;"></div>
                            </div>`;
                        }).join("");
                    })()} 
                </div>

                <!-- Hunting Preparation Guide Message -->
                <div style="background: rgba(78, 52, 46, 0.06); border: 1.5px solid rgba(139,90,43,0.25); border-radius: 12px; padding: 6px 16px; margin: 14px auto 10px; max-width: 1000px; text-align: center; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 1.05rem; color: #4e342e; font-weight: bold;">
                        💬 참전 커맨드 ➜ <span style="color: #00ffaa;">👑 구독자:</span> <span style="color: #ffffff; background: rgba(78,52,46,0.9); padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 1.0rem; border: 1px solid #4e342e;">[번호] [무기] [성향]</span> (예: 1 해머 공격적) <span style="margin: 0 8px; opacity: 0.4;">|</span> <span style="color: #aaa;">👤 일반 시청자:</span> <span style="color: #ffffff; background: rgba(78,52,46,0.9); padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 1.0rem; border: 1px solid #4e342e;">[번호]</span> (예: 1)
                    </div>
                </div>

                <div class="game-timer" style="font-size:1.6rem; font-weight:bold; color:#8b5a2b; margin-top:14px; text-shadow:0 0 10px rgba(139,90,43,0.15);">⏳ 30초</div>
            </div>
        `;

        this.card = this.container.querySelector('.game-hunt-card');
        
        // Remove entry-anim class after animation finishes to prevent glitches during DOM updates
        const entryTimeout = this.lobbyTimers.timeout(() => {
            if (this.card) {
                this.card.classList.remove('entry-anim');
            }
        }, 600);
        this.lobbyTimeouts.push(entryTimeout);

        this.startLobbyPrepTimer();
    }

    startLobbyPrepTimer() {
        const messages = [
            "🍳 온천 식당에서 식사 대기 중...",
            "🍖 웰던 고기 맛있게 굽는 중...",
            "🧪 그레이트 회복약 가방에 챙기는 중...",
            "🎒 비약이랑 휴대 식량 챙기는 중...",
            "📖 헌터노트 약점 속성 정독 중...",
            "✨ 안내벌레 유도 세팅하는 중...",
            "🔨 숫돌로 날카롭게 날 갈아두는 중...",
            "⚔️ 수렵 피리 화음 조율 중...",
            "🛡️ 랜스 대형 방패 왁스 칠하는 중...",
            "🧥 특수 복장 주름 펴는 중...",
            "🐱 동반자 아이루한테 고기 먹이는 중...",
            "🐾 아이루 장비 점검 확인 중...",
            "💣 대형 나무통폭탄 화약 믹스 중...",
            "🧘 명상하며 수렵 마인드 컨트롤 중...",
            "🌾 한방약이랑 해독초 분말 제조 중...",
            "🏹 발사대 슬링어 특수 탄환 선별 중..."
        ];

        const showBubble = (idx) => {
            if (!this.container) return;
            const cardEl = this.container.querySelector(`#hunt-opt-${idx}`);
            if (cardEl && cardEl.querySelector('.combat-chat-bubble')) return;

            const bubble = this.container.querySelector(`#prep-bubble-${idx}`);
            if (bubble) {
                const msg = messages[Math.floor(Math.random() * messages.length)];
                bubble.innerHTML = msg;
                bubble.classList.add('visible');
                
                const hideTimeout = this.lobbyTimers.timeout(() => {
                    if (bubble) {
                        bubble.classList.remove('visible');
                    }
                }, 4000);
                this.lobbyTimeouts.push(hideTimeout);
            }
        };

        // 1. Staggered initial show (0.5s, 2s, 3.5s, 5.5s)
        this.lobbyTimeouts = [];
        for (let i = 0; i < 4; i++) {
            const initialTimeout = this.lobbyTimers.timeout(() => {
                showBubble(i);
            }, 500 + i * 1500);
            this.lobbyTimeouts.push(initialTimeout);
        }

        // 2. Periodically show bubble organically (every 3 seconds) for a random hunter
        this.lobbyTimer = this.lobbyTimers.interval(() => {
            if (!this.container) return;
            const targetIndex = Math.floor(Math.random() * 4);
            const bubble = this.container.querySelector(`#prep-bubble-${targetIndex}`);
            if (bubble && !bubble.classList.contains('visible')) {
                showBubble(targetIndex);
            }
        }, 3000);
    }

    updateBettingUI(bets) {
        if (!this.container) return;
        
        // Initialize arrays for each hunter index (0~3)
        const candidates = [[], [], [], []];
        
        Object.entries(bets).forEach(([nickname, bet]) => {
            if (bet.index >= 0 && bet.index < 4) {
                candidates[bet.index].push({
                    nickname,
                    color: bet.color,
                    isSubscriber: bet.isSubscriber
                });
            }
        });

        for (let i = 0; i < 4; i++) {
            const opt = this.container.querySelector(`#hunt-opt-${i}`);
            if (opt) {
                const list = candidates[i];
                const totalCount = list.length;
                
                // Set total counts text
                const countEl = opt.querySelector('.bet-count');
                if (countEl) {
                    countEl.textContent = `${totalCount}명 신청`;
                }

                // Add active class if candidates exist
                if (totalCount > 0) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }

                // Render compact candidate nicknames list (max 3 names)
                const namesEl = opt.querySelector('.bet-names-list');
                if (namesEl) {
                    if (totalCount > 0) {
                        // Sort so subscribers come first in list representation too
                        const sortedList = [...list].sort((a, b) => (b.isSubscriber ? 1 : 0) - (a.isSubscriber ? 1 : 0));
                        
                        namesEl.replaceChildren();
                        sortedList.slice(0, 3).forEach((user, nameIndex) => {
                            if (nameIndex > 0) namesEl.appendChild(document.createTextNode(', '));
                            const name = document.createElement('span');
                            name.style.color = SafeContent.cssColor(user.color, '#eeeeee');
                            name.style.fontWeight = 'bold';
                            name.textContent = String(user.nickname || 'Anonymous');
                            namesEl.appendChild(name);
                            if (user.isSubscriber) {
                                const crown = document.createElement('span');
                                crown.style.color = '#00ffaa';
                                crown.style.marginLeft = '2px';
                                crown.textContent = '👑';
                                namesEl.appendChild(crown);
                            }
                        });
                        if (totalCount > 3) namesEl.appendChild(document.createTextNode(` 외 ${totalCount - 3}명`));
                    } else {
                        namesEl.replaceChildren();
                    }
                }
            }
        }
    }

    updateBettingTimer(timeLeft) {
        if (!this.container) return;
        const timerEl = this.container.querySelector('.game-timer');
        if (timerEl) {
            timerEl.textContent = `⏳ ${timeLeft}초`;
        }
    }

    renderFight(data) {
        this.clearAnimationTimers();
        if (!this.container || !this.card) return;
        this.card.classList.remove('entry-anim');
        this.card.style.position = 'relative';

        const { hpLabelText, selectedMonster, selectedWeapons, showMonsterHp, timeLimit } = data;
        const limitSec = timeLimit || 120;
        const initialMin = String(Math.floor(limitSec / 60)).padStart(2, '0');
        const initialSec = String(limitSec % 60).padStart(2, '0');

        this.card.innerHTML = `
            <div id="game-hunt-top-panel" style="display: flex; flex-direction: column; align-items: center; width: 100%; background: rgba(0,0,0,0.65); border: 2px solid #c5a059; border-radius: 20px; padding: 20px 25px; box-shadow: 0 8px 32px rgba(0,0,0,0.7); position: relative; margin-bottom: 24px; box-sizing: border-box;">
                <!-- Monster HP Bar -->
                <div class="game-hunt-monster-hp-container" style="${showMonsterHp ? '' : 'display:none;'} width: 100%; text-align: left; box-sizing: border-box;">
                    <div class="game-hunt-monster-hp-wrapper" style="width: 100%; height: 34px; background: #111; border: 2px solid #c5a059; border-radius: 17px; overflow: hidden; position: relative; box-shadow: 0 0 15px rgba(255, 59, 48, 0.45);">
                        <div id="monster-hp-fill" style="width: 100%; height: 100%; background: linear-gradient(90deg, #ff3b30, #ff9500); transition: width 0.15s ease-out;"></div>
                        <div id="monster-hp-center-text" class="monster-hp-center-text" data-monster-name="${selectedMonster.nameKO}" style="font-size: 1.5rem; font-weight: bold; line-height: 30px; text-shadow: 0 0 4px rgba(0,0,0,0.9);">
                            ${selectedMonster.nameKO} (12000 / 12000)
                        </div>
                    </div>
                </div>
            </div>

            <!-- Monster Showcase Area -->
            <div id="monster-showcase-panel" style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                margin: 20px auto 24px;
                position: relative;
                overflow: visible;
                box-sizing: border-box;
                gap: 24px;
            ">
                <!-- Left Info Panel -->
                <div style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 14px;
                    background: rgba(0,0,0,0.45);
                    border: 1.5px solid rgba(197, 160, 89, 0.25);
                    border-radius: 16px;
                    padding: 24px;
                    min-height: 216px;
                    justify-content: center;
                    box-sizing: border-box;
                    box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
                ">
                    <div style="font-size: 1.25rem; font-weight: bold; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">Quest Status</div>
                    <div id="cart-counter-board" style="
                        font-size: 1.45rem;
                        font-weight: bold;
                        color: #ff3b30;
                        background: rgba(255,59,48,0.1);
                        border: 1.5px solid rgba(255,59,48,0.3);
                        padding: 10px 20px;
                        border-radius: 10px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                        white-space: nowrap;
                        box-sizing: border-box;
                    ">
                        수레 현황: 🛒 🛒 🛒 (0/3)
                    </div>
                    
                    <div style="font-size: 1.25rem; font-weight: bold; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Monster Action</div>
                    <!-- Monster ATB Bar -->
                    <div style="width: 100%; background: #222; height: 16px; border-radius: 8px; overflow: hidden; border: 1px solid #333; box-sizing: border-box; box-shadow: inset 0 0 5px rgba(0,0,0,0.8);">
                        <div id="monster-atb-fill" style="width: 0%; height: 100%; background: #e58e26; transition: width 0.1s linear;"></div>
                    </div>
                </div>

                <!-- Center Monster Image (Scaled to 380px) -->
                <div style="
                    width: 380px;
                    height: 380px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    <img class="game-hunt-monster-img" id="fight-monster-img" src="img/monsters/${selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width: 380px; height: 380px; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.85)); transition: transform 0.15s ease; position: relative; z-index: 2;" />
                </div>

                <!-- Right Info Panel -->
                <div style="
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 14px;
                    background: rgba(0,0,0,0.45);
                    border: 1.5px solid rgba(197, 160, 89, 0.25);
                    border-radius: 16px;
                    padding: 24px;
                    min-height: 216px;
                    justify-content: center;
                    box-sizing: border-box;
                    box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
                ">
                    <div style="font-size: 1.25rem; font-weight: bold; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">Monster Status</div>
                    <div id="monster-status-label" style="
                        font-size: 1.4rem;
                        font-weight: bold;
                        color: #00ffaa;
                        border: 1.5px solid #00ffaa;
                        background: rgba(0,255,170,0.08);
                        padding: 10px 20px;
                        border-radius: 10px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 4px 10px rgba(0,255,170,0.15);
                        white-space: nowrap;
                        box-sizing: border-box;
                    ">
                        일반 상태
                    </div>

                    <div style="font-size: 1.25rem; font-weight: bold; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Time Limit</div>
                    <div id="battle-timer-label" style="
                        font-size: 1.45rem;
                        font-weight: bold;
                        color: #eee;
                        background: rgba(255,255,255,0.08);
                        border: 1.5px solid rgba(255,255,255,0.15);
                        padding: 10px 20px;
                        border-radius: 10px;
                        width: 100%;
                        text-align: center;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                        white-space: nowrap;
                        box-sizing: border-box;
                    ">
                        남은 시간: ${initialMin}:${initialSec}
                    </div>
                </div>
            </div>

            <!-- 4 Weapons Grid (Bottom) -->
            <div class="game-hunt-weapons-grid">
                ${selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card ${w.status === 'dead' ? 'dead' : ''}" id="fight-card-${w.index}" style="position:relative; transition: transform 0.15s ease, border-color 0.15s ease; ${w.status === 'dead' ? 'transform: rotate(180deg);' : ''}">
                    <div class="game-hunt-weapon-img-container" style="position: relative; width: 115px; height: 115px; margin: 0 auto 16px;">
                        <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" style="margin: 0;" />
                        ${w.id === 'gunlance' ? `
                            <div class="game-hunt-weapon-overlay gunlance-overheat-overlay" id="overheat-overlay-${w.index}" style="background: linear-gradient(180deg, #ff3b30 0%, #ff9500 100%); mask-image: url('img/weapons/gunlance.svg'); -webkit-mask-image: url('img/weapons/gunlance.svg'); opacity: ${w.overheatDuration ? 1 : 0}; clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0px 0px 0px); -webkit-clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0px 0px 0px);"></div>
                        ` : ''}
                        ${w.id === 'long_sword' ? `
                            <div class="game-hunt-weapon-overlay long-sword-spirit-overlay" id="spirit-overlay-${w.index}" style="background: #ffffff; mask-image: url('img/weapons/long_sword.svg'); -webkit-mask-image: url('img/weapons/long_sword.svg');"></div>
                        ` : ''}
                        ${w.id === 'charge_blade' ? `
                            <div class="game-hunt-weapon-overlay charge-blade-shield-overlay" id="shield-overlay-${w.index}" style="background: #e84393; mask-image: url('img/weapons/charge_blade.svg'); -webkit-mask-image: url('img/weapons/charge_blade.svg');"></div>
                        ` : ''}
                        ${w.id === 'charge_blade' ? `
                            <div class="cb-phial-dots" id="cb-phials-${w.index}" style="position: absolute; bottom: 0; right: 0; display: flex; gap: 2px; background: rgba(0,0,0,0.6); padding: 2px 4px; border-radius: 4px; pointer-events: none;">
                                ${Array.from({length: 5}).map((_, i) => `
                                    <span class="cb-dot" style="font-size: 0.8rem; color: #ffffff; line-height: 1; transition: opacity 0.2s;">
                                        ${i < (w.phials !== undefined ? w.phials : 5) ? '●' : '○'}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                        ${w.id === 'insect_glaive' ? `
                            <div class="ig-extracts" id="ig-extracts-${w.index}" style="position: absolute; bottom: 0; right: 0; display: flex; gap: 4px; background: rgba(0,0,0,0.6); padding: 2px 4px; border-radius: 4px; pointer-events: none;">
                                <span class="ig-dot red" style="font-size: 0.8rem; color: ${w.extractBuffs && w.extractBuffs.red ? '#ff3b30' : '#444'}; line-height: 1;">●</span>
                                <span class="ig-dot white" style="font-size: 0.8rem; color: ${w.extractBuffs && w.extractBuffs.white ? '#ffffff' : '#444'}; line-height: 1;">●</span>
                                <span class="ig-dot orange" style="font-size: 0.8rem; color: ${w.extractBuffs && w.extractBuffs.orange ? '#ff9500' : '#444'}; line-height: 1;">●</span>
                            </div>
                        ` : ''}
                    </div>
 
                    <div class="game-hunt-status-tag-container" style="position: absolute; right: calc(50% + 68px); top: 92px; width: 52px; height: 52px; display: flex; align-items: center; justify-content: flex-end; z-index: 5;">
                        <div class="${w.status === 'dead' ? 'game-hunt-status-tag fainted' : (w.status === 'stunned' ? 'game-hunt-status-tag active stunned' : 'game-hunt-status-tag active')}" id="status-tag-${w.index}">
                            ${w.status === 'dead' ? `💀 ${w.cartTimer !== undefined ? Math.ceil(w.cartTimer / 10) : 5}s` : (w.status === 'stunned' ? '🌀 기절' : '⚔️')}
                        </div>
                    </div>
                    
                    <div class="atb-circular-container" style="position: absolute; left: calc(50% + 68px); top: 92px; width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 5;">
                        <svg width="46" height="46" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="12" fill="rgba(0, 0, 0, 0.08)"></circle>
                            <circle id="atb-circle-fill-${w.index}" cx="16" cy="16" r="6" fill="none" stroke="#00a8ff" stroke-width="12"
                                    stroke-dasharray="37.7" stroke-dashoffset="${37.7 - (37.7 * (w.atb || 0)) / 100}"
                                    transform="rotate(-90 16 16)" style="transition: stroke-dashoffset 0.1s linear;"></circle>
                        </svg>
                    </div>
                    
                    <!-- HP Bar -->
                    <div class="game-hunt-hp-wrapper" style="margin-top: 10px; margin-bottom: 8px;">
                        <div class="game-hunt-hp-fill" id="hp-fill-${w.index}" style="width: ${(w.hp / w.maxHp) * 100}%; background: ${(w.hp / w.maxHp) * 100 > 50 ? '#2eff7b' : ((w.hp / w.maxHp) * 100 > 20 ? '#ff9500' : '#ff3b30')};"></div>
                        <div class="game-hunt-hp-text" id="hp-text-${w.index}">${w.hp} / ${w.maxHp}</div>
                    </div>
 
                    <div id="personality-tag-${w.index}" style="font-size:1.35rem; color:#aaa; margin-top:4px; margin-bottom:12px; display:flex; justify-content:center; gap:12px; align-items:center; font-weight:bold;">
                        <span>${
                            w.personality === 'offensive' ? '💥' : 
                            w.personality === 'defensive' ? '🛡️' : 
                            w.personality === 'veteran' ? '🏆' : 
                            w.personality === 'support' ? '💚' : 
                            w.personality === 'newbie' ? '🐣' : 
                            '⚖️'
                        }</span>
                        <span style="opacity:0.3;">|</span>
                        <span id="potion-count-${w.index}">🧪 ${w.potions}</span>
                    </div>
 
                    <div class="game-hunt-weapon-name" style="font-size: 2.5rem; font-weight: bold; color:${w.hunterColor || '#c98534'}; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; margin-bottom: 6px;">
                        👤 ${w.hunterName}
                    </div>
                </div>`).join('')}
            </div>
        `;

        // Restore active weapon borders, glows and overlays immediately after rendering
        selectedWeapons.forEach(w => {
            this.restoreBorder(w.index, w);
        });
    }

    updateHpUI(w) {
        if (!this.card) return;
        const fill = this.card.querySelector(`#hp-fill-${w.index}`);
        const txt = this.card.querySelector(`#hp-text-${w.index}`);
        if (fill && txt) {
            const pct = Math.max(0, Math.min(100, (w.hp / w.maxHp) * 100));
            fill.style.width = `${pct}%`;
            txt.textContent = `${w.hp} / ${w.maxHp}`;

            // HP Bar Color based on health percentage
            if (pct <= 25) {
                fill.style.background = '#ff3b30'; // red
            } else if (pct <= 55) {
                fill.style.background = '#ffcc00'; // yellow
            } else {
                fill.style.background = '#2eff7b'; // green
            }
        }
    }

    updateMonsterHpUI(hp, maxHp) {
        if (!this.card) return;
        const fill = this.card.querySelector('#monster-hp-fill');
        const txt = this.card.querySelector('#monster-hp-center-text');
        if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
        if (txt) {
            const name = txt.dataset.monsterName || "";
            txt.textContent = `${name} (${hp} / ${maxHp})`;
        }
    }

    updateWeaponAtbUI(idx, atb, w) {
        if (!this.card) return;
        const circle = this.card.querySelector(`#atb-circle-fill-${idx}`);
        if (circle) {
            const offset = 37.7 - (37.7 * Math.max(0, Math.min(100, atb))) / 100;
            circle.style.strokeDashoffset = offset;

            // Check if the hunter is fainted, stunned, roar-stunned, or in hit recovery (interrupted)
            const isInterrupted = w && (w.status === 'dead' || w.status === 'stunned' || w.roarStunned || (w.hitDuration && w.hitDuration > 0));
            circle.style.stroke = isInterrupted ? '#7f8c8d' : '#00a8ff';
        }
    }

    updateMonsterAtbUI(atb) {
        if (!this.card) return;
        const fill = this.card.querySelector('#monster-atb-fill');
        if (fill) fill.style.width = `${atb}%`;
    }

    updateMonsterStateUI(stateName, title, colorInfo) {
        if (!this.card) return;
        const statusLbl = this.card.querySelector('#monster-status-label');
        const hpCenterText = this.card.querySelector('#monster-hp-center-text');
        const monsterImg = this.card.querySelector('#fight-monster-img');

        if (statusLbl) {
            statusLbl.textContent = stateName;
            statusLbl.style.color = colorInfo.color;
            statusLbl.style.borderColor = colorInfo.color;
            statusLbl.style.background = colorInfo.bg;
        }

        if (hpCenterText) {
            hpCenterText.dataset.monsterName = title;
            const text = hpCenterText.textContent || "";
            const hpMatch = text.match(/\(([^)]+)\)/);
            const hpStr = hpMatch ? hpMatch[1] : '12000 / 12000';
            hpCenterText.textContent = `${title} (${hpStr})`;
            hpCenterText.style.color = colorInfo.color;
        }

        if (monsterImg) {
            if (stateName.includes('분노')) {
                monsterImg.classList.add('enraged');
            } else {
                monsterImg.classList.remove('enraged');
            }

            if (stateName.includes('기절')) {
                monsterImg.classList.add('stunned_monster');
            } else {
                monsterImg.classList.remove('stunned_monster');
            }

            if (stateName.includes('비행')) {
                monsterImg.classList.add('valstrax-flying');
            } else {
                monsterImg.classList.remove('valstrax-flying');
            }

            if (stateName.includes('대경직') || stateName.includes('함정')) {
                monsterImg.classList.add('monster-knockdown-anim');
            } else {
                monsterImg.classList.remove('monster-knockdown-anim');
            }
        }
    }

    updatePotionCountUI(idx, count) {
        if (!this.card) return;
        const el = this.card.querySelector(`#potion-count-${idx}`);
        if (el) el.textContent = `🧪 ${count}`;
    }

    updateOverheatUI(idx, duration) {
        if (!this.card) return;
        const overlay = this.card.querySelector(`#overheat-overlay-${idx}`);
        if (overlay) {
            if (duration > 0) {
                let pct = ((30 - duration) / 30) * 100;
                overlay.style.opacity = '1';
                overlay.style.clipPath = `inset(${pct}% 0px 0px 0px)`;
                overlay.style.webkitClipPath = `inset(${pct}% 0px 0px 0px)`;
            } else {
                overlay.style.opacity = '0';
                overlay.style.clipPath = `inset(100% 0px 0px 0px)`;
                overlay.style.webkitClipPath = `inset(100% 0px 0px 0px)`;
            }
        }
    }

    updatePhialsUI(idx, phials) {
        if (!this.card) return;
        const phialContainer = this.card.querySelector(`#cb-phials-${idx}`);
        if (phialContainer) {
            phialContainer.innerHTML = Array.from({length: 5}).map((_, i) => `
                <span class="cb-dot" style="font-size: 0.8rem; color: #ffffff; line-height: 1; transition: opacity 0.2s;">
                    ${i < phials ? '●' : '○'}
                </span>
            `).join('');
        }
    }

    updateExtractsUI(idx, buffs) {
        if (!this.card) return;
        const extContainer = this.card.querySelector(`#ig-extracts-${idx}`);
        if (extContainer) {
            extContainer.innerHTML = `
                <span class="ig-dot red" style="font-size: 0.8rem; color: ${buffs.red ? '#ff3b30' : '#444'}; line-height: 1;">●</span>
                <span class="ig-dot white" style="font-size: 0.8rem; color: ${buffs.white ? '#ffffff' : '#444'}; line-height: 1;">●</span>
                <span class="ig-dot orange" style="font-size: 0.8rem; color: ${buffs.orange ? '#ff9500' : '#444'}; line-height: 1;">●</span>
            `;
        }
    }

    updateCartUI(carts) {
        if (!this.card) return;
        const el = this.card.querySelector('#cart-counter-board');
        if (el) {
            let icons = "";
            for (let i = 1; i <= 3; i++) {
                if (i <= carts) {
                    icons += "❌ ";
                } else {
                    icons += "🛒 ";
                }
            }
            el.textContent = `수레 현황: ${icons} (${carts}/3)`;
        }
    }

    updateTimerUI(timeSec) {
        if (!this.card) return;
        const min = String(Math.floor(timeSec / 60)).padStart(2, '0');
        const sec = String(timeSec % 60).padStart(2, '0');
        const timerLbl = this.card.querySelector('#battle-timer-label');
        if (timerLbl) timerLbl.textContent = `남은 시간: ${min}:${sec}`;
    }

    showSkillBubble(idxOrMonster, text) { return this.combatAnimator.showSkillBubble(idxOrMonster, text); }

    triggerMonsterRoar() { return this.combatAnimator.triggerMonsterRoar(); }

    triggerMonsterCharge() { return this.combatAnimator.triggerMonsterCharge(); }

    triggerMonsterAttack(type, emoji, targets, attackName = '') { return this.combatAnimator.triggerMonsterAttack(type, emoji, targets, attackName); }

    triggerHitAnimation(idx, w, damage) { return this.combatAnimator.triggerHitAnimation(idx, w, damage); }

    triggerRollAnimation(idx) { return this.combatAnimator.triggerRollAnimation(idx); }

    triggerStunUI(idx, isStunned) { return this.combatAnimator.triggerStunUI(idx, isStunned); }

    triggerDeathTag(idx, w, timerVal = 5) { return this.combatAnimator.triggerDeathTag(idx, w, timerVal); }

    triggerMonsterKnockdownAnim() { return this.combatAnimator.triggerMonsterKnockdownAnim(); }

    restoreBorder(wIndex, w) { return this.combatAnimator.restoreBorder(wIndex, w); }

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, moveName = null, isDodge = false) {
        return this.combatAnimator.shakeWeapon(idx, w, borderClr, isAttack, moveName, isDodge);
    }

    shakeMonster() { return this.combatAnimator.shakeMonster(); }

    triggerRoarStun(idx, isStunned) { return this.combatAnimator.triggerRoarStun(idx, isStunned); }

    spawnVictoryEmoji(idx, emoji) { return this.combatAnimator.spawnVictoryEmoji(idx, emoji); }

    spawnCombatChatBubble(idx, message) { return this.notifications.spawnCombatChatBubble(idx, message); }

    spawnLobbyNotification(idx, nickname, message, isSubscriber) {
        return this.notifications.spawnLobbyNotification(idx, nickname, message, isSubscriber);
    }

    spawnMaterialBox(idx, materialName) { return this.notifications.spawnMaterialBox(idx, materialName); }

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntRenderer;
} else {
    window.HuntRenderer = HuntRenderer;
}
