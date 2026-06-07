class HuntRenderer {
    constructor() {
        this.container = null;
        this.card = null;
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

    removeContainer() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.card = null;
    }

    renderLobby(data) {
        if (!this.container) {
            this.createContainer();
        }

        const { voteTitle, voteSubtitle, consecutiveTotal, currentConsecutiveIndex, consecutiveQueue, selectedMonster, selectedWeapons } = data;

        // Build monster showcase section dynamically
        let monsterShowcaseHTML = '';
        if (consecutiveTotal > 1) {
            monsterShowcaseHTML = `
                <div class="game-hunt-monster-showcase" style="margin-bottom: 25px; width: 90%; margin-left: auto; margin-right: auto; padding: 20px 25px;">
                    <div style="font-size: 1.3rem; color: #ffaa00; font-weight: bold; margin-bottom: 15px;">연속 수렵 대상 (${consecutiveTotal}마리)</div>
                    <div style="display:flex; justify-content:center; gap:25px; align-items:center; width: 100%;">
                        ${consecutiveQueue.map((m, idx) => `
                            <div style="display:flex; flex-direction:column; align-items:center; position:relative; width: 110px;">
                                <div style="position:absolute; top:-12px; left:-12px; background:#ffaa00; color:#111; font-weight:bold; border-radius:50%; width:26px; height:26px; display:flex; justify-content:center; align-items:center; font-size:0.9rem; border:2px solid #111; z-index:10;">
                                    ${idx + 1}
                                </div>
                                <img class="game-hunt-monster-img" src="img/monsters/${m.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width:105px; height:105px; border-radius:18px; border:2.5px solid #ffaa00; box-shadow:0 0 15px rgba(255,170,0,0.35); background:rgba(0,0,0,0.6);" />
                                <div style="font-size:1.1rem; font-weight:bold; color:#ffaa00; margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:115px;" title="${m.nameKO}">${m.nameKO}</div>
                            </div>
                            ${idx < consecutiveQueue.length - 1 ? '<div style="font-size:2.2rem; color:#ffaa00; font-weight:bold; opacity:0.6; margin: 0 5px;">→</div>' : ''}
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            monsterShowcaseHTML = `
                <div class="game-hunt-monster-showcase" style="margin-bottom: 25px;">
                    <div style="font-size: 1.25rem; color: #ffaa00; font-weight: bold; margin-bottom: 8px;">수렵 대상 몬스터</div>
                    <img class="game-hunt-monster-img" src="img/monsters/${selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" />
                    <div class="game-hunt-monster-name">${selectedMonster.nameKO}</div>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div class="game-hunt-card">
                <div class="game-title" style="font-size:2.8rem; background: linear-gradient(90deg, #ffaa00, #ff5500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight:bold; margin-bottom:10px;">
                    ${voteTitle}
                </div>
                <div class="game-subtitle" style="font-size:1.3rem; color:#ccc; margin-bottom: 25px;">
                    ${voteSubtitle}
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
                            <div class="game-hunt-weapon-card" id="hunt-opt-${w.index}" style="position: relative;">
                                <div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.7); border: 2px solid #ffaa00; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: bold; color: #ffaa00; box-shadow: 0 0 8px rgba(255, 170, 0, 0.4); z-index: 5;">${w.index + 1}</div>
                                <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" />
                                <div class="game-hunt-weapon-name" style="font-size:1.6rem;font-weight:bold;color:#ffaa00;">${w.name}</div>
                                <div style="font-size:1.15rem;font-weight:bold;background:${p.bg};border:1.5px solid ${p.border};border-radius:8px;padding:6px 12px;margin-top:10px;margin-bottom:12px;color:${p.color};box-shadow: 0 0 10px ${p.bg};">${p.label}</div>
                                <div class="bet-count" style="font-size:1.05rem;color:#aaa;font-weight:bold;">0명 신청</div>
                            </div>`;
                        }).join("");
                    })()} 
                </div>

                <div class="game-timer" style="font-size:1.8rem; font-weight:bold; color:#ff5500; margin-top:20px;">참가 모집 시간: 30초</div>
            </div>
        `;

        this.card = this.container.querySelector('.game-hunt-card');
    }

    updateBettingUI(bets) {
        if (!this.container) return;
        const counts = [0, 0, 0, 0];
        Object.values(bets).forEach(bet => {
            counts[bet.index]++;
        });
        for (let i = 0; i < 4; i++) {
            const opt = this.container.querySelector(`#hunt-opt-${i}`);
            if (opt) {
                opt.querySelector('.bet-count').textContent = `${counts[i]}명 신청`;
                if (counts[i] > 0) opt.classList.add('active');
            }
        }
    }

    updateBettingTimer(timeLeft) {
        if (!this.container) return;
        const timerEl = this.container.querySelector('.game-timer');
        if (timerEl) {
            timerEl.textContent = `참가 모집 시간: ${timeLeft}초`;
        }
    }

    renderFight(data) {
        if (!this.container || !this.card) return;
        this.card.style.position = 'relative';

        const { hpLabelText, selectedMonster, selectedWeapons, showMonsterHp } = data;

        this.card.innerHTML = `
            <div id="game-hunt-top-panel">
                <!-- Monster HP Bar -->
                <div class="game-hunt-monster-hp-container" style="${showMonsterHp ? '' : 'display:none;'} margin-bottom: 15px;">
                    <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:1.15rem; color:#ffaa00; margin-bottom:4px;">
                        <span>${hpLabelText}</span>
                        <span id="monster-hp-text">12000 / 12000</span>
                    </div>
                    <div class="game-hunt-monster-hp-wrapper" style="width:100%; height:20px; background:#222; border: 2px solid #555; border-radius:10px; overflow:hidden; position:relative;">
                        <div id="monster-hp-fill" style="width:100%; height:100%; background:linear-gradient(90deg, #ff3b30, #ff9500); transition: width 0.15s ease-out;"></div>
                    </div>
                </div>

                <!-- Header Info (Carts, Rage Loop, BGM status) -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background:rgba(0,0,0,0.4); padding:10px 15px; border-radius:10px;">
                    <div id="cart-counter-board" style="font-size:1.15rem; font-weight:bold; color:#ff3b30;">
                        🛒 수레 상황: 🛒 🛒 🛒 (0/3)
                    </div>
                    <div id="monster-status-label" style="font-size:1.15rem; font-weight:bold; color:#00ffaa; padding:3px 10px; border-radius:6px; border:1px solid #00ffaa; background:rgba(0,255,170,0.08);">
                        일반 상태
                    </div>
                    <div id="battle-timer-label" style="font-size:1.15rem; font-weight:bold; color:#eee;">
                        전투 시간: 00:00
                    </div>
                </div>

                <!-- Target Monster Showcase (Middle) -->
                <div class="game-hunt-monster-showcase" id="monster-showcase-panel" style="margin-bottom: 20px; position:relative; overflow:visible;">
                    <img class="game-hunt-monster-img" id="fight-monster-img" src="img/monsters/${selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" />
                    <div class="game-hunt-monster-name" id="fight-monster-title">${selectedMonster.nameKO}</div>
                    
                    <!-- Monster ATB Bar -->
                    <div style="width: 70%; margin: 8px auto 0 auto; background:#333; height:8px; border-radius:4px; overflow:hidden; border:1px solid #444;">
                        <div id="monster-atb-fill" style="width: 0%; height:100%; background:#e58e26;"></div>
                    </div>
                    <div style="font-size:0.85rem; color:#aaa; margin-top:2px;">몬스터 행동 게이지</div>
                </div>
            </div>

            <!-- 4 Weapons Grid (Bottom) -->
            <div class="game-hunt-weapons-grid">
                ${selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card" id="fight-card-${w.index}" style="position:relative; transition: transform 0.15s ease, border-color 0.15s ease;">
                    <div class="game-hunt-weapon-img-container" style="position: relative; width: 95px; height: 95px; margin: 0 auto 12px;">
                        <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" style="margin: 0;" />
                        ${w.id === 'gunlance' ? `
                            <div class="gunlance-overheat-overlay" id="overheat-overlay-${w.index}" style="position: absolute; top: 0; left: 0; width: 95px; height: 95px; background: linear-gradient(180deg, #ff3b30 0%, #ff9500 100%); mask-image: url('img/weapons/gunlance.svg'); -webkit-mask-image: url('img/weapons/gunlance.svg'); mask-size: 95px 95px; -webkit-mask-size: 95px 95px; mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-position: center; -webkit-mask-position: center; pointer-events: none; transition: clip-path 0.3s ease; clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0 0 0);"></div>
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
                    <div class="game-hunt-weapon-name" style="font-size: 2.1rem; font-weight: bold; color:${w.hunterColor || '#ffaa00'}; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; margin-bottom: 4px;">
                        👤 ${w.hunterName}
                    </div>
                    
                    <div id="personality-tag-${w.index}" style="font-size:0.85rem; color:#aaa; margin-top:2px; margin-bottom:8px; display:flex; justify-content:center; gap:8px;">
                        <span style="color: #ffaa00; font-weight: bold;">${w.name}</span>
                        <span>|</span>
                        <span>성향: ${
                            w.personality === 'offensive' ? '💥 공격형' : 
                            w.personality === 'defensive' ? '🛡️ 수비형' : 
                            w.personality === 'veteran' ? '🏆 베테랑' : 
                            w.personality === 'support' ? '💚 서포터' : 
                            w.personality === 'newbie' ? '🐣 몬린이' : 
                            '⚖️ 밸런스형'
                        }</span>
                        <span>|</span>
                        <span id="potion-count-${w.index}">🧪 포션 ${w.potions}/10</span>
                    </div>
                    
                    <!-- HP Bar -->
                    <div class="game-hunt-hp-wrapper">
                        <div class="game-hunt-hp-fill" id="hp-fill-${w.index}" style="width: 100%; background:#2eff7b;"></div>
                        <div class="game-hunt-hp-text" id="hp-text-${w.index}">100 / 100</div>
                    </div>
                    
                    <!-- ATB Bar -->
                    <div style="width:90%; height:8px; background:#222; border-radius:4px; margin: 6px auto; overflow:hidden; border: 1px solid #333;">
                        <div class="game-hunt-atb-fill" id="atb-fill-${w.index}" style="width: 0%; height:100%; background:#00a8ff; transition: width 0.1s linear;"></div>
                    </div>

                    <div class="game-hunt-status-tag active" id="status-tag-${w.index}">전투 대기</div>
                </div>`).join('')}
            </div>
        `;
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
        const txt = this.card.querySelector('#monster-hp-text');
        if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
        if (txt) txt.textContent = `${hp} / ${maxHp}`;
    }

    updateWeaponAtbUI(idx, atb) {
        if (!this.card) return;
        const fill = this.card.querySelector(`#atb-fill-${idx}`);
        if (fill) fill.style.width = `${atb}%`;
    }

    updateMonsterAtbUI(atb) {
        if (!this.card) return;
        const fill = this.card.querySelector('#monster-atb-fill');
        if (fill) fill.style.width = `${atb}%`;
    }

    updateMonsterStateUI(stateName, title, colorInfo) {
        if (!this.card) return;
        const statusLbl = this.card.querySelector('#monster-status-label');
        const monsterTitle = this.card.querySelector('#fight-monster-title');
        const monsterImg = this.card.querySelector('#fight-monster-img');

        if (statusLbl) {
            statusLbl.textContent = stateName;
            statusLbl.style.color = colorInfo.color;
            statusLbl.style.borderColor = colorInfo.color;
            statusLbl.style.background = colorInfo.bg;
        }

        if (monsterTitle) {
            monsterTitle.textContent = title;
            monsterTitle.style.color = colorInfo.color;
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
        if (el) el.textContent = `🧪 포션 ${count}/10`;
    }

    updateOverheatUI(idx, duration) {
        if (!this.card) return;
        const overlay = this.card.querySelector(`#overheat-overlay-${idx}`);
        if (overlay) {
            let pct = ((30 - duration) / 30) * 100;
            overlay.style.clipPath = `inset(${pct}% 0 0 0)`;
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
        if (monsterImg) {
            monsterImg.classList.remove('monster-roar-anim');
            void monsterImg.offsetWidth; // trigger reflow
            monsterImg.classList.add('monster-roar-anim');
            setTimeout(() => monsterImg.classList.remove('monster-roar-anim'), 800);
        }
    }

    triggerMonsterCharge() {
        if (!this.card) return;
        const monsterImg = this.card.querySelector('#fight-monster-img');
        if (monsterImg) {
            monsterImg.classList.remove('monster-charge-anim');
            void monsterImg.offsetWidth; // trigger reflow
            monsterImg.classList.add('monster-charge-anim');
            setTimeout(() => monsterImg.classList.remove('monster-charge-anim'), 600);
        }
    }

    triggerMonsterAttack(type, emoji, targets) {
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

        if (type === 'physical' || type === 'hybrid') {
            const cardRect = targetCard.getBoundingClientRect();
            const cardCenter = {
                x: cardRect.left + cardRect.width / 2,
                y: cardRect.top + cardRect.height / 2
            };

            const dx = cardCenter.x - monsterCenter.x;
            const dy = cardCenter.y - monsterCenter.y;

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
                    tag.textContent = '다운!';
                    tag.className = 'game-hunt-status-tag fainted';
                }

                setTimeout(() => {
                    weaponCard.classList.remove('large-hit-anim');
                    if (w.status === 'alive' && w.hp > 0) {
                        const currentTag = this.card.querySelector(`#status-tag-${idx}`);
                        if (currentTag) {
                            currentTag.textContent = '';
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
                    tag.textContent = '넘어짐';
                    tag.className = 'game-hunt-status-tag stunned';
                }

                setTimeout(() => {
                    weaponCard.classList.remove('small-hit-anim');
                    if (w.status === 'alive' && w.hp > 0) {
                        const currentTag = this.card.querySelector(`#status-tag-${idx}`);
                        if (currentTag) {
                            currentTag.textContent = '';
                            currentTag.className = 'game-hunt-status-tag active';
                        }
                    }
                }, 1000);
            }
        }
    }

    triggerRollAnimation(idx) {
        if (!this.card) return;
        const img = this.card.querySelector(`#fight-card-${idx} .game-hunt-weapon-img`);
        if (img) {
            img.classList.remove('roll-anim');
            void img.offsetWidth; // trigger reflow
            img.classList.add('roll-anim');
            setTimeout(() => img.classList.remove('roll-anim'), 600);
        }
    }

    triggerStunUI(idx, isStunned) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (isStunned) {
            if (weaponCard) weaponCard.classList.add('stunned');
            if (tag) {
                tag.textContent = '기절 상태';
                tag.className = 'game-hunt-status-tag stunned';
            }
        } else {
            if (weaponCard) weaponCard.classList.remove('stunned');
            if (tag) {
                tag.textContent = '';
                tag.className = 'game-hunt-status-tag active';
            }
        }
    }

    triggerDeathTag(idx, timerVal = 5) {
        if (!this.card) return;
        const tag = this.card.querySelector(`#status-tag-${idx}`);
        if (tag) {
            tag.textContent = `부활대기 (${timerVal}s)`;
            tag.className = 'game-hunt-status-tag fainted';
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
            // Remove all custom classes
            weaponCard.classList.remove('ls-spirit-1', 'ls-spirit-2', 'ls-spirit-3', 'db-demon-mode', 'cb-shield-charged', 'ig-3-extracts');
            weaponCard.style.borderColor = '';
            weaponCard.style.boxShadow = '';

            if (w.id === 'long_sword' && w.spiritLevel > 0) {
                weaponCard.classList.add(`ls-spirit-${w.spiritLevel}`);
            }
            if (w.id === 'dual_blades' && w.demonModeDuration > 0) {
                weaponCard.classList.add('db-demon-mode');
            }
            if (w.id === 'charge_blade' && w.phials > 0) {
                weaponCard.classList.add('cb-shield-charged');
            }
            if (w.id === 'insect_glaive' && w.extractDuration > 0) {
                weaponCard.classList.add('ig-3-extracts');
            }
        }
    }

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, moveName = null) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (weaponCard) {
            if (isAttack) {
                let animClass = 'attack-melee-anim';
                let animDuration = 250;

                if (w) {
                    if (w.id === 'hammer') {
                        if (moveName === '쿵 쿵 따') {
                            animClass = 'attack-hammer-kkt';
                            animDuration = 1200;
                        } else if (moveName === '키프 스웨이') {
                            animClass = 'attack-hammer-keep-sway';
                            animDuration = 450;
                        } else if (moveName === '2차지 어퍼!') {
                            animClass = 'attack-hammer-charge2';
                            animDuration = 650;
                        } else if (moveName === '3차지 내려치기') {
                            animClass = 'attack-hammer-charge3';
                            animDuration = 900;
                        } else if (moveName === '회전 회오리!!!') {
                            animClass = 'attack-hammer-tornado';
                            animDuration = 1600;
                        } else {
                            animClass = 'attack-hammer-anim';
                            animDuration = 400;
                        }
                    } else if (w.id === 'great_sword') {
                        if (moveName === '모아베기') {
                            animClass = 'attack-gs-charge1';
                            animDuration = 800;
                        } else if (moveName === '강모아베기') {
                            animClass = 'attack-gs-charge2';
                            animDuration = 1000;
                        } else if (moveName === '참모아베기') {
                            animClass = 'attack-gs-charge3';
                            animDuration = 1300;
                        }
                    } else if (w.id === 'light_bowgun' || w.id === 'heavy_bowgun') {
                        animClass = 'attack-bowgun-anim';
                        animDuration = 600;
                    }
                }

                weaponCard.classList.remove('attack-melee-anim', 'attack-hammer-kkt', 'attack-hammer-keep-sway', 'attack-hammer-charge2', 'attack-hammer-charge3', 'attack-hammer-tornado', 'attack-hammer-anim', 'attack-gs-charge1', 'attack-gs-charge2', 'attack-gs-charge3', 'attack-bowgun-anim');
                void weaponCard.offsetWidth; // trigger reflow
                weaponCard.classList.add(animClass);
                weaponCard.style.borderColor = borderClr;
                weaponCard.style.zIndex = "10";
                setTimeout(() => {
                    weaponCard.classList.remove(animClass);
                    this.restoreBorder(idx, w);
                    weaponCard.style.zIndex = "";
                }, animDuration);
            } else {
                weaponCard.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px) scale(0.95)`;
                weaponCard.style.borderColor = borderClr;
                setTimeout(() => {
                    weaponCard.style.transform = '';
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
                weaponCard.style.transform = 'rotate(30deg)';
                weaponCard.classList.add('roar-stunned');
            }
            if (tag) {
                tag.textContent = '🙉 귀막기 경직';
                tag.className = 'game-hunt-status-tag stunned';
            }
        } else {
            if (weaponCard) {
                weaponCard.style.transform = '';
                weaponCard.classList.remove('roar-stunned');
            }
            if (tag) {
                tag.textContent = '';
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

        // Animate up and fade out
        setTimeout(() => {
            emojiEl.style.opacity = '1';
            emojiEl.style.transform = 'translate(-50%, -60px) scale(1.3)';
        }, 50);

        setTimeout(() => {
            emojiEl.style.opacity = '0';
            emojiEl.style.transform = 'translate(-50%, -90px) scale(1.0)';
            setTimeout(() => emojiEl.remove(), 400);
        }, 1800);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntRenderer;
} else {
    window.HuntRenderer = HuntRenderer;
}
