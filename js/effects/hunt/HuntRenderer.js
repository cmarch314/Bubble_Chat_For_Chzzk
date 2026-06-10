class HuntRenderer {
    constructor() {
        this.container = null;
        this.card = null;
        this.lobbyTimer = null;
        this.lobbyTimeouts = [];
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
        if (this.lobbyTimer) {
            clearInterval(this.lobbyTimer);
            this.lobbyTimer = null;
        }
        if (this.lobbyTimeouts && this.lobbyTimeouts.length > 0) {
            this.lobbyTimeouts.forEach(t => clearTimeout(t));
            this.lobbyTimeouts = [];
        }
    }

    removeContainer() {
        this.clearLobbyTimer();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.card = null;
    }

    renderLobby(data) {
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
                <div class="game-hunt-monster-showcase" style="margin-bottom: 6px; background: transparent; border: none; box-shadow: none; padding: 0;">
                    <div style="display:flex; justify-content:center; gap:15px; align-items:center; width: 100%;">
                        ${consecutiveQueue.map((m, idx) => {
                            const isCurrent = idx === currentConsecutiveIndex;
                            const borderStyle = isCurrent ? '3px solid #c98534' : '2px dashed #444';
                            const shadowStyle = isCurrent ? '0 0 20px rgba(201, 133, 52,0.5)' : 'none';
                            const opacityStyle = isCurrent ? '1.0' : '0.5';
                            return `
                            <div style="display:flex; flex-direction:column; align-items:center; position:relative; width: 80px; opacity: ${opacityStyle};">
                                <img class="game-hunt-monster-img" src="img/monsters/${m.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width:70px; height:70px; border-radius:12px; border:${borderStyle}; box-shadow:${shadowStyle}; background:rgba(0,0,0,0.6);" />
                                <div style="font-size:0.9rem; font-weight:bold; color:${isCurrent ? '#c98534' : '#888'}; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:85px;">${m.nameKO}</div>
                            </div>
                            ${idx < consecutiveQueue.length - 1 ? '<div style="font-size:1.5rem; color:#c98534; font-weight:bold; opacity:0.3; margin: 0 2px;">→</div>' : ''}
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else {
            monsterShowcaseHTML = `
                <div class="game-hunt-monster-showcase" style="margin-bottom: 4px; background: transparent; border: none; box-shadow: none; padding: 0;">
                    <img class="game-hunt-monster-img" src="img/monsters/${selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width: 180px; height: 180px; filter: drop-shadow(0 15px 30px rgba(0,0,0,0.8)); transition: transform 0.3s ease;" />
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
                            <div class="game-hunt-weapon-card" id="hunt-opt-${w.index}" style="position: relative; padding: 18px; padding-bottom: 12px;">
                                <div class="lobby-prep-bubble" id="prep-bubble-${w.index}">🍳 식사 버프 준비 중...</div>
                                <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); border: 2.5px solid #c98534; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; font-weight: bold; color: #c98534; box-shadow: 0 0 8px rgba(201, 133, 52, 0.4); z-index: 5;">${w.index + 1}</div>
                                <div class="game-hunt-weapon-img-container" style="position: relative; width: 80px; height: 80px; margin: 0 auto 10px;">
                                    <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" style="margin: 0; width: 80px; height: 80px;" />
                                </div>
                                <div class="game-hunt-weapon-name" style="font-size:1.55rem;font-weight:bold;color:#c98534;margin-bottom:4px;">HUNTER ${w.index + 1}</div>
                                <div style="font-size:1.25rem;font-weight:bold;background:${p.bg};border:1.5px solid ${p.border};border-radius:8px;padding:4px 10px;margin-bottom:8px;color:${p.color};box-shadow: 0 0 10px ${p.bg};">${p.label}</div>
                                <div class="bet-count" style="font-size:1.15rem;color:#aaa;font-weight:bold;">0명 신청</div>
                                <div class="bet-names-list" style="font-size: 0.95rem; color: #aaa; margin-top: 4px; min-height: 18px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%; margin-left: auto; margin-right: auto;"></div>
                            </div>`;
                        }).join("");
                    })()} 
                </div>

                <!-- Hunting Preparation Guide Message -->
                <div style="background: rgba(78, 52, 46, 0.06); border: 1.5px solid rgba(139,90,43,0.25); border-radius: 12px; padding: 4px 12px; margin: 6px auto 4px; max-width: 920px; text-align: center; box-sizing: border-box; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.95rem; color: #4e342e; font-weight: bold;">
                        💬 참전 커맨드 ➜ <span style="color: #00ffaa;">👑 구독자:</span> <span style="color: #ffffff; background: rgba(78,52,46,0.9); padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; border: 1px solid #4e342e;">[번호] [무기] [성향]</span> (예: 1 해머 공격적) <span style="margin: 0 8px; opacity: 0.4;">|</span> <span style="color: #aaa;">👤 일반 시청자:</span> <span style="color: #ffffff; background: rgba(78,52,46,0.9); padding: 2px 6px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; border: 1px solid #4e342e;">[번호]</span> (예: 1)
                    </div>
                </div>

                <div class="game-timer" style="font-size:1.4rem; font-weight:bold; color:#8b5a2b; margin-top:6px; text-shadow:0 0 10px rgba(139,90,43,0.15);">⏳ 30초</div>
            </div>
        `;

        this.card = this.container.querySelector('.game-hunt-card');
        
        // Remove entry-anim class after animation finishes to prevent glitches during DOM updates
        setTimeout(() => {
            if (this.card) {
                this.card.classList.remove('entry-anim');
            }
        }, 600);

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
                
                const hideTimeout = setTimeout(() => {
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
            const initialTimeout = setTimeout(() => {
                showBubble(i);
            }, 500 + i * 1500);
            this.lobbyTimeouts.push(initialTimeout);
        }

        // 2. Periodically show bubble organically (every 3 seconds) for a random hunter
        this.lobbyTimer = setInterval(() => {
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
                        
                        const displayNames = sortedList.slice(0, 3).map(user => {
                            const subSuffix = user.isSubscriber ? '<span style="color:#00ffaa;margin-left:2px;">👑</span>' : '';
                            return `<span style="color: ${user.color || '#eee'}; font-weight: bold;">${user.nickname}</span>${subSuffix}`;
                        });
                        
                        let suffix = '';
                        if (totalCount > 3) {
                            suffix = ` 외 ${totalCount - 3}명`;
                        }
                        namesEl.innerHTML = displayNames.join(', ') + suffix;
                    } else {
                        namesEl.innerHTML = '';
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
        if (!this.container || !this.card) return;
        this.card.classList.remove('entry-anim');
        this.card.style.position = 'relative';

        const { hpLabelText, selectedMonster, selectedWeapons, showMonsterHp } = data;

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
                        전투 시간: 00:00
                    </div>
                </div>
            </div>

            <!-- 4 Weapons Grid (Bottom) -->
            <div class="game-hunt-weapons-grid">
                ${selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card" id="fight-card-${w.index}" style="position:relative; transition: transform 0.15s ease, border-color 0.15s ease;">
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

                    <div style="display: flex; justify-content: center; align-items: center; height: 34px; margin-bottom: 6px;">
                        <div class="game-hunt-status-tag active" id="status-tag-${w.index}">⚔️</div>
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
                        <div class="game-hunt-hp-fill" id="hp-fill-${w.index}" style="width: 100%; background:#2eff7b;"></div>
                        <div class="game-hunt-hp-text" id="hp-text-${w.index}">100 / 100</div>
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
        if (timerLbl) timerLbl.textContent = `전투 시간: ${min}:${sec}`;
    }

    showSkillBubble(idxOrMonster, text) {
        if (!this.card) return;
        let targetEl = null;
        if (idxOrMonster === 'monster') {
            targetEl = this.card.querySelector('#monster-showcase-panel');
        } else {
            targetEl = this.card.querySelector(`#fight-card-${idxOrMonster}`);
        }
        if (!targetEl) return;

        // Remove old bubble if exists
        const oldBubble = targetEl.querySelector('.skill-bubble');
        if (oldBubble) oldBubble.remove();

        const bubble = document.createElement('div');
        bubble.className = 'skill-bubble';
        bubble.textContent = text;
        targetEl.appendChild(bubble);

        setTimeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateX(-50%) translateY(-15px)';
        }, 10);

        setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateX(-50%) translateY(-30px)';
            setTimeout(() => bubble.remove(), 400);
        }, 2500);
    }

    triggerMonsterRoar() {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('#fight-monster-img');
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (!monsterImg || !showcase) return;

        // Roar vibration animation on monster image
        monsterImg.classList.remove('monster-roar-vibrate');
        void monsterImg.offsetWidth;
        monsterImg.classList.add('monster-roar-vibrate');
        setTimeout(() => monsterImg.classList.remove('monster-roar-vibrate'), 1200);

        // Spawn a large shaking speaker emoji that fades out
        const speaker = document.createElement('div');
        speaker.className = 'roar-speaker-emoji';
        speaker.textContent = '🔊';
        showcase.appendChild(speaker);

        // Spawn concentric sound wave rings
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (!this.card) return;
                const ring = document.createElement('div');
                ring.className = 'roar-wave-ring';
                showcase.appendChild(ring);
                setTimeout(() => ring.remove(), 1000);
            }, i * 300);
        }

        // Vibrate all hunter cards during the roar
        const weaponCards = this.card.querySelectorAll('.game-hunt-weapon-card');
        weaponCards.forEach(c => c.classList.add('hunter-roar-shake-anim'));
        setTimeout(() => {
            weaponCards.forEach(c => c.classList.remove('hunter-roar-shake-anim'));
        }, 1500);

        setTimeout(() => {
            speaker.remove();
        }, 1500);
    }

    triggerMonsterCharge() {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            monsterImg.classList.remove('monster-charge-slide');
            void monsterImg.offsetWidth;
            monsterImg.classList.add('monster-charge-slide');
            setTimeout(() => monsterImg.classList.remove('monster-charge-slide'), 750);
        }
    }

    triggerMonsterAttack(type, emoji, targets, attackName = '') {
        if (!this.card || !targets || targets.length === 0) return;

        const monsterImg = this.card.querySelector('#fight-monster-img');
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (!monsterImg || !showcase) return;

        const firstTarget = targets[0];
        const targetCard = this.card.querySelector(`#fight-card-${firstTarget.index}`);
        if (!targetCard) return;

        const containerRect = this.card.getBoundingClientRect();
        const monsterRect = monsterImg.getBoundingClientRect();

        const monsterCenter = {
            x: monsterRect.left + monsterRect.width / 2,
            y: monsterRect.top + monsterRect.height / 2
        };

        // Custom animations based on attackName
        if (attackName) {
            const cleanName = attackName.toLowerCase();
            
            // 1. Roar attack
            if (cleanName.includes('포효') || cleanName.includes('울음') || cleanName.includes('노성') || cleanName.includes('소리') || cleanName.includes('음파') || cleanName.includes('폭효')) {
                this.triggerMonsterRoar();
                return;
            }

            // 2. Tail Spin
            if (cleanName.includes('회전') || cleanName.includes('대회전') || cleanName.includes('테일베기') || cleanName.includes('꼬리치기') || cleanName.includes('휩쓸기') || cleanName.includes('후려치기')) {
                monsterImg.classList.remove('monster-tailspin-anim');
                void monsterImg.offsetWidth;
                monsterImg.classList.add('monster-tailspin-anim');
                setTimeout(() => monsterImg.classList.remove('monster-tailspin-anim'), 600);
                
                // Spawn a spinning/scaling wind slash emoji centered on the monster
                const slash = document.createElement('div');
                slash.className = 'tailspin-slash-particle';
                slash.textContent = '🌀';
                showcase.appendChild(slash);
                setTimeout(() => slash.remove(), 700);

                // Slight forward tackle impact during tail spin
                monsterImg.style.transition = 'transform 0.2s ease';
                monsterImg.style.transform = `translateY(40px)`;
                
                // Card heavy shake on impact
                setTimeout(() => {
                    if (this.card) {
                        this.card.classList.remove('card-heavy-shake-anim');
                        void this.card.offsetWidth;
                        this.card.classList.add('card-heavy-shake-anim');
                        setTimeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                    }
                }, 200);

                setTimeout(() => {
                    monsterImg.style.transition = 'transform 0.4s ease-in-out';
                    monsterImg.style.transform = '';
                    setTimeout(() => {
                        monsterImg.style.transition = '';
                    }, 400);
                }, 200);
                return;
            }

            // 3. Charge toward target
            if (cleanName.includes('돌진') || cleanName.includes('급습') || cleanName.includes('돌격') || cleanName.includes('대폭격') || cleanName.includes('태클') || cleanName.includes('강습') || cleanName.includes('박치기') || cleanName.includes('몸통박치기') || cleanName.includes('들이받기')) {
                const cardRect = targetCard.getBoundingClientRect();
                const cardCenter = {
                    x: cardRect.left + cardRect.width / 2,
                    y: cardRect.top + cardRect.height / 2
                };
                const dx = cardCenter.x - monsterCenter.x;
                const dy = cardCenter.y - monsterCenter.y;

                // Spawn dust particles drifting in the opposite direction of the charge
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const odx = -(dx / len) * 80;
                const ody = -(dy / len) * 80;

                for (let i = 0; i < 4; i++) {
                    setTimeout(() => {
                        if (!this.card) return;
                        const dust = document.createElement('div');
                        dust.className = 'charge-dust-particle';
                        dust.textContent = '💨';
                        dust.style.setProperty('--dx', `${odx + (Math.random() - 0.5) * 40}px`);
                        dust.style.setProperty('--dy', `${ody + (Math.random() - 0.5) * 40}px`);
                        dust.style.left = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
                        dust.style.top = `calc(50% + ${(Math.random() - 0.5) * 60}px)`;
                        showcase.appendChild(dust);
                        setTimeout(() => dust.remove(), 700);
                    }, i * 80);
                }

                // Charge windup and slam
                monsterImg.style.transition = 'transform 0.15s ease-in';
                monsterImg.style.transform = `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1.15)`;
                
                // Card heavy shake on impact
                setTimeout(() => {
                    if (this.card) {
                        this.card.classList.remove('card-heavy-shake-anim');
                        void this.card.offsetWidth;
                        this.card.classList.add('card-heavy-shake-anim');
                        setTimeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                    }
                }, 300);

                setTimeout(() => {
                    monsterImg.style.transition = 'transform 0.1s ease-out';
                    monsterImg.style.transform = `translate(${dx * 0.85}px, ${dy * 0.85}px) scale(1.2)`;
                    
                    setTimeout(() => {
                        monsterImg.style.transition = 'transform 0.4s ease-in-out';
                        monsterImg.style.transform = '';
                        setTimeout(() => {
                            monsterImg.style.transition = '';
                        }, 400);
                    }, 150);
                }, 150);
                return;
            }
        }

        if (type === 'physical' || type === 'hybrid') {
            const cardRect = targetCard.getBoundingClientRect();
            const cardCenter = {
                x: cardRect.left + cardRect.width / 2,
                y: cardRect.top + cardRect.height / 2
            };

            const dx = cardCenter.x - monsterCenter.x;
            const dy = cardCenter.y - monsterCenter.y;

            // Trigger card shake on physical impact
            setTimeout(() => {
                if (this.card) {
                    this.card.classList.remove('card-heavy-shake-anim');
                    void this.card.offsetWidth;
                    this.card.classList.add('card-heavy-shake-anim');
                    setTimeout(() => this.card.classList.remove('card-heavy-shake-anim'), 500);
                }
            }, 200);

            if (type === 'physical') {
                monsterImg.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                monsterImg.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;

                setTimeout(() => {
                    monsterImg.style.transition = 'transform 0.3s ease-in-out';
                    monsterImg.style.transform = '';
                    setTimeout(() => {
                        monsterImg.style.transition = '';
                    }, 300);
                }, 200);
            } else if (type === 'hybrid') {
                const leftEmoji = document.createElement('div');
                leftEmoji.className = 'monster-hybrid-emoji-left';
                leftEmoji.textContent = emoji;

                const rightEmoji = document.createElement('div');
                rightEmoji.className = 'monster-hybrid-emoji-right';
                rightEmoji.textContent = emoji;

                showcase.appendChild(leftEmoji);
                showcase.appendChild(rightEmoji);

                void leftEmoji.offsetWidth;

                monsterImg.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                leftEmoji.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                rightEmoji.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

                monsterImg.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
                leftEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
                rightEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;

                setTimeout(() => {
                    monsterImg.style.transition = 'transform 0.3s ease-in-out';
                    monsterImg.style.transform = '';

                    leftEmoji.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-out';
                    rightEmoji.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-out';
                    leftEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                    rightEmoji.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
                    leftEmoji.style.opacity = '0';
                    rightEmoji.style.opacity = '0';

                    setTimeout(() => {
                        monsterImg.style.transition = '';
                        leftEmoji.remove();
                        rightEmoji.remove();
                    }, 300);
                }, 200);
            }
        } else if (type === 'elemental') {
            targets.forEach(t => {
                const curTargetCard = this.card.querySelector(`#fight-card-${t.index}`);
                if (!curTargetCard) return;

                const cardRect = curTargetCard.getBoundingClientRect();
                const cardCenter = {
                    x: cardRect.left + cardRect.width / 2,
                    y: cardRect.top + cardRect.height / 2
                };

                const startX = monsterCenter.x - containerRect.left;
                const startY = monsterCenter.y - containerRect.top;
                const destX = cardCenter.x - containerRect.left;
                const destY = cardCenter.y - containerRect.top;

                const proj = document.createElement('div');
                proj.className = 'elemental-projectile';
                proj.style.left = `${startX}px`;
                proj.style.top = `${startY}px`;
                proj.textContent = emoji;
                this.card.appendChild(proj);

                void proj.offsetWidth;

                proj.style.transition = 'left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease';

                const isDodge = (t.result === 'dodge');

                if (isDodge) {
                    const extendFactor = 1.5;
                    const passX = startX + (destX - startX) * extendFactor;
                    const passY = startY + (destY - startY) * extendFactor;

                    proj.style.left = `${passX}px`;
                    proj.style.top = `${passY}px`;
                    proj.style.opacity = '0';

                    setTimeout(() => {
                        proj.remove();
                    }, 400);
                } else {
                    proj.style.left = `${destX}px`;
                    proj.style.top = `${destY}px`;

                    setTimeout(() => {
                        proj.remove();

                        const burnEl = document.createElement('div');
                        burnEl.className = 'elemental-burn';
                        burnEl.textContent = emoji;
                        curTargetCard.appendChild(burnEl);

                        setTimeout(() => {
                            burnEl.style.opacity = '0';
                            setTimeout(() => burnEl.remove(), 500);
                        }, 1500);
                    }, 400);
                }
            });
        }
    }

    triggerHitAnimation(idx, w, damage) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (weaponCard && w.hp > 0) {
            if (damage >= 30) {
                weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                void weaponCard.offsetWidth; // reflow
                weaponCard.classList.add('large-hit-anim');

                const tag = this.card.querySelector(`#status-tag-${idx}`);
                if (tag) {
                    tag.textContent = '🥴';
                    tag.className = 'game-hunt-status-tag fainted';
                }

                setTimeout(() => {
                    weaponCard.classList.remove('large-hit-anim');
                    if (w.status === 'alive' && w.hp > 0) {
                        const currentTag = this.card.querySelector(`#status-tag-${idx}`);
                        if (currentTag) {
                            currentTag.textContent = '⚔️';
                            currentTag.className = 'game-hunt-status-tag active';
                        }
                    }
                }, 2500);
            } else {
                weaponCard.classList.remove('large-hit-anim', 'small-hit-anim');
                void weaponCard.offsetWidth; // reflow
                weaponCard.classList.add('small-hit-anim');

                const tag = this.card.querySelector(`#status-tag-${idx}`);
                if (tag) {
                    tag.textContent = '💫';
                    tag.className = 'game-hunt-status-tag stunned';
                }

                setTimeout(() => {
                    weaponCard.classList.remove('small-hit-anim');
                    if (w.status === 'alive' && w.hp > 0) {
                        const currentTag = this.card.querySelector(`#status-tag-${idx}`);
                        if (currentTag) {
                            currentTag.textContent = '⚔️';
                            currentTag.className = 'game-hunt-status-tag active';
                        }
                    }
                }, 1000);
            }
        }
    }

    triggerRollAnimation(idx) {
        if (!this.card) return;
        const container = this.card.querySelector(`#fight-card-${idx} .game-hunt-weapon-img-container`);
        if (container) {
            container.classList.remove('roll-anim');
            void container.offsetWidth; // trigger reflow
            container.classList.add('roll-anim');
            setTimeout(() => container.classList.remove('roll-anim'), 600);
        }
    }

    triggerStunUI(idx, isStunned) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (isStunned) {
            if (weaponCard) weaponCard.classList.add('stunned');
            if (tag) {
                tag.textContent = '🌀';
                tag.className = 'game-hunt-status-tag stunned';
            }
        } else {
            if (weaponCard) weaponCard.classList.remove('stunned');
            if (tag) {
                tag.textContent = '⚔️';
                tag.className = 'game-hunt-status-tag active';
            }
        }
    }

    triggerDeathTag(idx, timerVal = 5) {
        if (!this.card) return;
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (tag) {
            tag.textContent = `💀 ${timerVal}s`;
            tag.className = 'game-hunt-status-tag fainted';
        }
        
        // Hide weapon image when carted
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (weaponCard) {
            const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
            if (weaponImg) {
                weaponImg.style.transition = 'opacity 0.2s ease-out';
                weaponImg.style.opacity = '0';
            }
        }
    }

    triggerMonsterKnockdownAnim() {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            monsterImg.classList.remove('enraged');
            monsterImg.classList.remove('stunned_monster');
            monsterImg.classList.add('monster-knockdown-anim');
        }
    }

    restoreBorder(wIndex, w) {
        if (!this.card || !w) return;
        const weaponCard = this.card.querySelector(`#fight-card-${w.index}`);
        if (weaponCard) {
            // Remove all custom classes from card
            weaponCard.classList.remove('ls-spirit-1', 'ls-spirit-2', 'ls-spirit-3', 'db-demon-mode', 'cb-shield-charged', 'ig-3-extracts');
            weaponCard.style.borderColor = '';
            weaponCard.style.boxShadow = '';

            // Handle Weapon Image Overlays
            const spiritOverlay = this.card.querySelector(`#spirit-overlay-${w.index}`);
            if (spiritOverlay) {
                spiritOverlay.style.opacity = '0';
                spiritOverlay.style.animation = 'none';
            }

            const shieldOverlay = this.card.querySelector(`#shield-overlay-${w.index}`);
            if (shieldOverlay) {
                shieldOverlay.style.opacity = '0';
            }

            // Handle Long Sword Image Border & Glow on Container
            const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
            if (imgContainer) {
                imgContainer.classList.remove('ls-spirit-border-1', 'ls-spirit-border-2', 'ls-spirit-border-3');
                if (w.id === 'long_sword' && w.spiritLevel > 0) {
                    imgContainer.classList.add(`ls-spirit-border-${w.spiritLevel}`);
                }
            }

            // Handle Long Sword Image direct filter classes
            const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
            if (weaponImg) {
                weaponImg.style.transition = 'opacity 0.2s ease-in';
                weaponImg.style.opacity = '1';
                weaponImg.classList.remove('ls-spirit-img-1', 'ls-spirit-img-2', 'ls-spirit-img-3');
                if (w.id === 'long_sword' && w.spiritLevel > 0) {
                    weaponImg.classList.add(`ls-spirit-img-${w.spiritLevel}`);
                }
            }

            if (w.id === 'long_sword' && w.spiritLevel > 0) {
                if (spiritOverlay) {
                    if (w.spiritLevel === 1) {
                        spiritOverlay.style.backgroundColor = '#ffffff';
                        spiritOverlay.style.opacity = '0.5';
                    } else if (w.spiritLevel === 2) {
                        spiritOverlay.style.backgroundColor = '#f1c40f';
                        spiritOverlay.style.opacity = '0.6';
                    } else if (w.spiritLevel === 3) {
                        spiritOverlay.style.backgroundColor = '#e74c3c';
                        spiritOverlay.style.opacity = '0.75';
                        spiritOverlay.style.animation = 'ls-spirit-image-pulse 1s infinite alternate';
                    }
                }
            }
            if (w.id === 'dual_blades' && w.demonModeDuration > 0) {
                weaponCard.classList.add('db-demon-mode');
            }
            if (w.id === 'charge_blade' && w.phials > 0) {
                // Charge Blade shield charge activates overlay
                weaponCard.classList.add('cb-shield-charged');
                if (shieldOverlay) {
                    shieldOverlay.style.opacity = '0.75';
                }
            }
            if (w.id === 'insect_glaive' && w.extractDuration > 0) {
                weaponCard.classList.add('ig-3-extracts');
            }
        }
    }

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, moveName = null, isDodge = false) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (weaponCard) {
            const weaponImg = weaponCard.querySelector('.game-hunt-weapon-img');
            if (isAttack) {
                // Default fallback
                let animClass = 'w-anim-ls';
                let animDuration = 500;

                const animMap = {
                    great_sword: { className: 'w-anim-gs', duration: 900 },
                    long_sword: { className: 'w-anim-ls', duration: 500 },
                    dual_blades: { className: 'w-anim-db', duration: 450 },
                    sword_shield: { className: 'w-anim-sns', duration: 400 },
                    hammer: { className: 'w-anim-hm', duration: 850 },
                    hunting_horn: { className: 'w-anim-hh', duration: 600 },
                    lance: { className: 'w-anim-lc', duration: 550 },
                    gunlance: { className: 'w-anim-gl', duration: 650 },
                    switch_axe: { className: 'w-anim-sa', duration: 600 },
                    charge_blade: { className: 'w-anim-cb', duration: 750 },
                    insect_glaive: { className: 'w-anim-ig', duration: 650 },
                    light_bowgun: { className: 'w-anim-lbg', duration: 500 },
                    heavy_bowgun: { className: 'w-anim-hbg', duration: 700 },
                    bow: { className: 'w-anim-bow', duration: 650 }
                };

                if (w && animMap[w.id]) {
                    animClass = animMap[w.id].className;
                    animDuration = animMap[w.id].duration;
                }

                if (weaponImg) {
                    // Remove all old and new animation classes
                    const allClasses = [
                        'attack-melee-anim', 'attack-hammer-kkt', 'attack-hammer-keep-sway', 
                        'attack-hammer-charge2', 'attack-hammer-charge3', 'attack-hammer-tornado', 
                        'attack-hammer-anim', 'attack-gs-charge1', 'attack-gs-charge2', 
                        'attack-gs-charge3', 'attack-bowgun-anim',
                        'w-anim-gs', 'w-anim-ls', 'w-anim-db', 'w-anim-sns', 'w-anim-hm',
                        'w-anim-hh', 'w-anim-lc', 'w-anim-gl', 'w-anim-sa', 'w-anim-cb',
                        'w-anim-ig', 'w-anim-lbg', 'w-anim-hbg', 'w-anim-bow'
                    ];
                    allClasses.forEach(cls => weaponImg.classList.remove(cls));
                    void weaponImg.offsetWidth; // trigger reflow
                    weaponImg.classList.add(animClass);
                }

                weaponCard.style.borderColor = borderClr;
                weaponCard.style.zIndex = "10";
                setTimeout(() => {
                    if (weaponImg) weaponImg.classList.remove(animClass);
                    this.restoreBorder(idx, w);
                    weaponCard.style.zIndex = "";
                }, animDuration);
            } else {
                if (!isDodge) {
                    weaponCard.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px) scale(0.95)`;
                }
                weaponCard.style.borderColor = borderClr;
                setTimeout(() => {
                    if (!isDodge) weaponCard.style.transform = '';
                    this.restoreBorder(idx, w);
                }, 150);
            }
        }
    }

    shakeMonster() {
        if (!this.card) return;
        const showcase = this.card.querySelector('#monster-showcase-panel');
        if (showcase) {
            showcase.style.transform = `translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px)`;
            setTimeout(() => showcase.style.transform = '', 100);
        }
    }

    triggerRoarStun(idx, isStunned) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (isStunned) {
            if (weaponCard) {
                weaponCard.classList.add('roar-stunned');
                
                const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
                if (imgContainer) {
                    let roarOverlay = imgContainer.querySelector('.roar-stun-overlay');
                    if (!roarOverlay) {
                        roarOverlay = document.createElement('div');
                        roarOverlay.className = 'roar-stun-overlay';
                        roarOverlay.textContent = '🙉';
                        imgContainer.appendChild(roarOverlay);
                    }
                }
            }
            if (tag) {
                tag.textContent = '🙉';
                tag.className = 'game-hunt-status-tag stunned';
            }
        } else {
            if (weaponCard) {
                weaponCard.classList.remove('roar-stunned');
                
                const imgContainer = weaponCard.querySelector('.game-hunt-weapon-img-container');
                if (imgContainer) {
                    const roarOverlay = imgContainer.querySelector('.roar-stun-overlay');
                    if (roarOverlay) {
                        roarOverlay.remove();
                    }
                }
            }
            if (tag) {
                tag.textContent = '⚔️';
                tag.className = 'game-hunt-status-tag active';
            }
        }
    }

    spawnVictoryEmoji(idx, emoji) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#fight-card-${idx}`);
        if (!targetEl) return;

        const emojiEl = document.createElement('div');
        emojiEl.className = 'victory-emoji-bubble';
        emojiEl.textContent = emoji;
        targetEl.appendChild(emojiEl);

        // Animate up and fade out (starts from weapon image center and floats up higher)
        setTimeout(() => {
            emojiEl.style.opacity = '1';
            emojiEl.style.transform = 'translate(-50%, -80px) scale(1.3)';
        }, 50);

        setTimeout(() => {
            emojiEl.style.opacity = '0';
            emojiEl.style.transform = 'translate(-50%, -120px) scale(1.0)';
            setTimeout(() => emojiEl.remove(), 400);
        }, 2200);
    }

    spawnCombatChatBubble(idx, message) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#fight-card-${idx}`) || this.card.querySelector(`#hunt-opt-${idx}`);
        if (!targetEl) return;

        // Hide lobby prep bubble immediately if it's currently visible
        const prepBubble = targetEl.querySelector('.lobby-prep-bubble');
        if (prepBubble) {
            prepBubble.classList.remove('visible');
        }

        // Remove old bubble if exists
        const oldBubble = targetEl.querySelector('.combat-chat-bubble');
        if (oldBubble) oldBubble.remove();

        const bubble = document.createElement('div');
        bubble.className = 'combat-chat-bubble';
        
        // Escape HTML to prevent XSS
        const escapedMessage = message
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        bubble.innerHTML = escapedMessage;
        targetEl.appendChild(bubble);

        // Transition in
        setTimeout(() => {
            bubble.classList.add('visible');
        }, 10);

        // Auto remove bubble after 4 seconds
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.classList.remove('visible');
                setTimeout(() => {
                    if (bubble.parentNode) bubble.remove();
                }, 400);
            }
        }, 4000);
    }

    spawnLobbyNotification(idx, nickname, message, isSubscriber) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#hunt-opt-${idx}`);
        if (!targetEl) return;

        // 1. Notification Bubble
        const oldBubble = targetEl.querySelector('.lobby-bubble');
        if (oldBubble) oldBubble.remove();

        const bubble = document.createElement('div');
        bubble.className = isSubscriber ? 'lobby-bubble subscriber' : 'lobby-bubble';
        bubble.innerHTML = `
            <div style="font-size: 0.8rem; font-weight: bold; color: ${isSubscriber ? '#00ffa3' : '#c98534'}; margin-bottom: 2px;">
                ${isSubscriber ? '👑 ' : ''}${nickname}
            </div>
            <div style="font-size: 0.95rem; font-weight: bold; color: #fff;">${message}</div>
        `;
        targetEl.appendChild(bubble);

        // 2. Interactive Particles
        const emojis = isSubscriber ? ['👑', '🔥', '⚔️', '✨', '🍗'] : ['⛺', '🍗', '⚔️', '🛡️', '🏹'];
        const numParticles = isSubscriber ? 4 : 2;

        for (let i = 0; i < numParticles; i++) {
            const part = document.createElement('div');
            part.className = 'lobby-particle';
            part.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const rx = (Math.random() - 0.5) * 60;
            part.style.left = `calc(50% + ${rx}px)`;
            part.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
            part.style.setProperty('--dy', `-${65 + Math.random() * 50}px`);

            targetEl.appendChild(part);
            setTimeout(() => part.remove(), 1200);
        }

        setTimeout(() => {
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateX(-50%) translateY(-20px)';
        }, 10);

        setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateX(-50%) translateY(-35px)';
            setTimeout(() => bubble.remove(), 300);
        }, 2200);
    }

    spawnMaterialBox(idx, materialName) {
        if (!this.card) return;
        const targetEl = this.card.querySelector(`#fight-card-${idx}`);
        if (!targetEl) return;

        // Remove old material box if exists
        const oldBox = targetEl.querySelector('.carve-material-box');
        if (oldBox) oldBox.remove();

        const box = document.createElement('div');
        box.className = 'carve-material-box';

        let borderClr = '#00ffa3';
        let bgClr = 'rgba(0, 255, 163, 0.12)';
        let textClr = '#00ffa3';
        let rarityLabel = '일반';

        if (materialName.includes('홍옥') || materialName.includes('보옥') || materialName.includes('투기모피') || materialName.includes('대꼬리') || materialName.includes('재생가시')) {
            borderClr = '#ff9500';
            bgClr = 'rgba(255, 149, 0, 0.15)';
            textClr = '#c98534';
            rarityLabel = '🌟 희귀';
        } else if (materialName.includes('그레이트') || materialName.includes('비약') || materialName.includes('귀인약') || materialName.includes('가루')) {
            borderClr = '#af52de';
            bgClr = 'rgba(175, 82, 222, 0.15)';
            textClr = '#bf5af2';
            rarityLabel = '🧪 소비';
        }

        box.innerHTML = `
            <div style="font-size: 0.85rem; font-weight: bold; color: ${borderClr}; opacity: 0.85; margin-bottom: 2px;">${rarityLabel}</div>
            <div style="font-size: 1.45rem; font-weight: bold; color: ${textClr}; text-shadow: 0 0 5px rgba(0,0,0,0.8);">${materialName}</div>
        `;

        box.style.position = 'absolute';
        box.style.bottom = '115%';
        box.style.left = '50%';
        box.style.transform = 'translateX(-50%) translateY(15px)';
        box.style.background = 'rgba(15, 15, 15, 0.95)';
        box.style.border = `1.5px solid ${borderClr}`;
        box.style.padding = '8px 14px';
        box.style.borderRadius = '10px';
        box.style.whiteSpace = 'nowrap';
        box.style.zIndex = '200';
        box.style.opacity = '0';
        box.style.boxShadow = `0 4px 15px ${bgClr}`;
        box.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';

        targetEl.appendChild(box);

        setTimeout(() => {
            box.style.opacity = '1';
            box.style.transform = 'translateX(-50%) translateY(0)';
        }, 30);

        setTimeout(() => {
            box.style.opacity = '0';
            box.style.transform = 'translateX(-50%) translateY(-15px)';
            setTimeout(() => box.remove(), 400);
        }, 2500);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntRenderer;
} else {
    window.HuntRenderer = HuntRenderer;
}
