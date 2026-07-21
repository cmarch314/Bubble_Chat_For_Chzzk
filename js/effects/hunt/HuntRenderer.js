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
        this.combatAnimator?.clearWeaponAnimations();
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

    getPersonalityStyle(personality) {
        const styles = {
            veteran: { label: '🏆 베테랑', color: '#ffc800', bg: 'rgba(255,200,0,0.16)' },
            support: { label: '💚 지원형', color: '#00dc64', bg: 'rgba(0,220,100,0.16)' },
            newbie: { label: '🐣 몬린이', color: '#64c8ff', bg: 'rgba(100,200,255,0.16)' },
            offensive: { label: '💥 공격형', color: '#ff5a5a', bg: 'rgba(255,60,60,0.16)' },
            defensive: { label: '🛡️ 수비형', color: '#6f9dff', bg: 'rgba(80,140,255,0.16)' },
            normal: { label: '⚖️ 밸런스', color: '#c7c7c7', bg: 'rgba(160,160,160,0.16)' }
        };
        return styles[personality] || styles.normal;
    }

    getPersonalityLabel(personality) { return this.getPersonalityStyle(personality).label; }

    escapeHTML(value) {
        if (typeof SafeContent !== 'undefined' && SafeContent.escapeHTML) return SafeContent.escapeHTML(String(value || ''));
        return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    }

    safeColor(value, fallback = '#eeeeee') {
        return typeof SafeContent !== 'undefined' && SafeContent.cssColor ? SafeContent.cssColor(value, fallback) : fallback;
    }

    getPerkVisual(perk = {}) {
        if (perk.name === '똥') return { icon: '💩', tone: 'twisted', affinity: 'neutral' };
        const affinities = Array.isArray(perk.affinities) ? perk.affinities : [];
        const iconByAffinity = {
            guard: '⛨', mobility: '➤', support: '✚', burst: '◆', status: '◈',
            blunt: '●', sever: '✦', ranged: '⌁', explosive: '✹'
        };
        const affinity = affinities.find(item => iconByAffinity[item]);
        const modifiers = Object.entries(perk.modifiers || {});
        let upside = 0;
        let downside = 0;
        modifiers.forEach(([key, value]) => {
            const neutral = key.endsWith('Rate') || key.endsWith('Attack') ? 1 : 0;
            if (Number(value) > neutral) upside++;
            if (Number(value) < neutral) downside++;
        });
        const tone = upside && downside ? 'twisted' : downside ? 'ominous' : 'boon';
        return { icon: iconByAffinity[affinity] || '✦', tone, affinity: affinity || 'neutral' };
    }

    renderPerkBubbles(perks = [], compact = false) {
        if (!perks.length) {
            return '<span class="hunt-perk-bubble hunt-perk-bubble--empty"><span class="hunt-perk-icon">◇</span><span class="hunt-perk-name">백지의 기록</span></span>';
        }
        const renderBubble = (perk, synergy = null) => {
            const visual = this.getPerkVisual(perk);
            const description = perk.description || '길드의 기록에는 이유가 적혀 있지 않다.';
            const lore = compact ? '' : `<span class="hunt-perk-lore">${this.escapeHTML(description)}</span>`;
            const comboClass = synergy ? ' hunt-perk-bubble--synergy' : '';
            const dungClass = perk.name === '똥' ? ' hunt-perk-bubble--dung' : '';
            return `<span class="hunt-perk-bubble hunt-perk-bubble--${visual.tone} hunt-perk-bubble--skill-${visual.affinity}${compact ? ' hunt-perk-bubble--compact' : ''}${comboClass}${dungClass}" title="${this.escapeHTML(`${perk.name}: ${description}`)}"><span class="hunt-perk-icon">${synergy?.icon || visual.icon}</span><span class="hunt-perk-copy"><span class="hunt-perk-name">${this.escapeHTML(perk.name)}</span>${lore}</span></span>`;
        };
        const groups = typeof HuntPerkSynergyCatalog !== 'undefined'
            ? HuntPerkSynergyCatalog.group(perks)
            : perks.map((perk, order) => ({ synergy: null, perks: [perk], order }));
        return groups.map(group => {
            if (!group.synergy) return renderBubble(group.perks[0]);
            const synergy = group.synergy;
            const label = `<span class="hunt-perk-synergy-label">${synergy.icon} ${this.escapeHTML(synergy.label)}</span>`;
            return `<span class="hunt-perk-synergy${compact ? ' hunt-perk-synergy--compact' : ''}" style="--synergy-color:${this.safeColor(synergy.color, '#ffd66b')}" title="${this.escapeHTML(`${synergy.label} 조합 발동`)}">${label}<span class="hunt-perk-synergy-chain">${group.perks.map(perk => renderBubble(perk, synergy)).join('')}</span></span>`;
        }).join('');
    }

    getQuestLocaleLabel(monsters = []) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const habitats = globalScope.HUNT_MONSTER_HABITATS || {};
        const labels = globalScope.HUNT_HABITAT_LABELS || {};
        const localeLabels = monsters.map(monster => {
            const id = String(monster?.id || '').toLowerCase().replace(/[-']/g, '_');
            const habitatId = habitats[id]?.habitats?.[0]?.id || 'arena';
            return labels[habitatId] || '결전장';
        });
        const unique = [...new Set(localeLabels)];
        return unique.length > 1 ? `${unique.slice(0, 2).join(' · ')} 외` : (unique[0] || '결전장');
    }

    renderQuestBoard(data) {
        this.clearAnimationTimers();
        if (!this.container) this.createContainer();
        this.clearLobbyTimer();
        this.container.classList?.add('hunt-pregame-overlay');
        const monster = data.selectedMonster || {};
        const monsterName = this.escapeHTML(monster.nameKO || '미확인 몬스터');
        const questMonsters = data.consecutiveTotal > 1 ? (data.consecutiveQueue || []) : [monster];
        const isConsecutive = questMonsters.length > 1;
        const tier = data.questTier || 'large';
        const rank = ({ small: 2, medium: 4, large: 6, elder: 7, colossal: 7 })[tier] || 6;
        const rewardBase = ({ small: 1800, medium: 4800, large: 10800, elder: 25200, colossal: 28800 })[tier] || 10800;
        const questKind = tier === 'elder' || tier === 'colossal' ? '토벌' : '수렵';
        const questTitle = isConsecutive ? `${monsterName} 외 ${questMonsters.length - 1}마리` : monsterName;
        const questObjective = isConsecutive ? `대형 몬스터 ${questMonsters.length}마리 연속 ${questKind}` : `${monsterName} 1마리 ${questKind}`;
        const localeLabel = this.escapeHTML(this.getQuestLocaleLabel(questMonsters));
        const targetCards = questMonsters.map((item, index) => `
            <div class="hunt-rise-target${index === 0 ? ' hunt-rise-target--primary' : ''}">
                <span class="hunt-rise-target-number">${index + 1}</span>
                <img src="img/monsters/${this.escapeHTML(item.filename || 'rathalos.png')}" onerror="this.src='img/monsters/rathalos.png';" alt="" />
                <span class="hunt-rise-target-name">${this.escapeHTML(item.nameKO || '미확인 몬스터')}</span>
            </div>`).join('');
        const waitingSlots = Array.from({ length: 4 }, (_, index) => `
            <div class="hunt-rise-recruit-slot"><b>${index + 1}</b><span>참가 대기</span></div>`).join('');
        this.container.innerHTML = `
            <div class="game-hunt-card game-hunt-pregame-card hunt-quest-board${isConsecutive ? ' hunt-quest-board--consecutive' : ''} entry-anim" style="position:relative;">
                <header class="hunt-rise-header">
                    <div class="hunt-rise-kamura-mark"><span>集</span></div>
                    <div class="hunt-rise-heading-copy">
                        <span>집회소 퀘스트 · 수주 확인</span>
                        <strong>${this.escapeHTML(data.voteTitle || '집회소 퀘스트')}</strong>
                    </div>
                    <div class="hunt-rise-rank"><span>QUEST</span><b>${'★'.repeat(rank)}</b></div>
                </header>
                <div class="hunt-rise-layout">
                    <section class="hunt-rise-sheet">
                        <div class="hunt-rise-sheet-tab">${isConsecutive ? '대연속 퀘스트' : `${questKind} 퀘스트`}</div>
                        <div class="hunt-rise-quest-title"><small>QUEST TITLE</small><strong>${questTitle}</strong></div>
                        <div class="hunt-rise-objective-heading"><span>주요 목표</span><b>${questObjective}</b></div>
                        <div class="hunt-rise-mission-body">
                            <div class="hunt-rise-target-grid${isConsecutive ? '' : ' hunt-rise-target-grid--single'}" style="--quest-target-columns:${Math.min(5, questMonsters.length)};">${targetCards}</div>
                            <div class="hunt-rise-details">
                                <div><span>목적지</span><b>${localeLabel}</b></div>
                                <div><span>제한 시간</span><b>50분</b></div>
                                <div><span>보수금</span><b>${(rewardBase * questMonsters.length).toLocaleString('ko-KR')} z</b></div>
                                <div><span>실패 조건</span><b>제한 시간 종료 · 전원 전투 불능</b></div>
                                <div><span>참가 조건</span><b>집회소에 모인 모든 헌터</b></div>
                            </div>
                        </div>
                    </section>
                    <aside class="hunt-rise-recruit-panel">
                        <div class="hunt-rise-recruit-title"><span>참가 요청</span><small>JOIN REQUEST</small></div>
                        <div class="hunt-rise-recruit-count"><strong id="hunt-recruit-count">0</strong><span>/ 4</span></div>
                        <div id="hunt-recruit-names" class="hunt-rise-recruit-slots">${waitingSlots}</div>
                        <div class="hunt-rise-flow"><span>① 참가</span><i>›</i><span>② 장비 설정</span><i>›</i><span>③ 즉시 출발</span></div>
                        <div class="hunt-rise-join-command"><small>채팅 입력</small><strong>!참가</strong></div>
                        <div id="hunt-recruit-feed" class="hunt-rise-recruit-feed">수주 희망자를 기다리는 중입니다.</div>
                    </aside>
                </div>
                <footer class="hunt-rise-footer">
                    <span>${this.escapeHTML(data.voteSubtitle || '')}</span>
                    <div class="game-timer">모집 마감 30초 · 4명 충원 시 즉시 수주</div>
                </footer>
            </div>`;
        this.card = this.container.querySelector('.game-hunt-card');
        this.lobbyTimers.timeout(() => this.card && this.card.classList.remove('entry-anim'), 600);
    }

    updateRecruitmentUI(participants = []) {
        if (!this.card) return;
        const count = this.card.querySelector('#hunt-recruit-count');
        const names = this.card.querySelector('#hunt-recruit-names');
        if (count) count.textContent = String(participants.length);
        if (names) {
            names.replaceChildren();
            for (let index = 0; index < 4; index++) {
                const participant = participants[index];
                const slot = document.createElement('div');
                slot.className = `hunt-rise-recruit-slot${participant ? ' hunt-rise-recruit-slot--filled' : ''}`;
                const number = document.createElement('b');
                number.textContent = String(index + 1);
                const nickname = document.createElement('span');
                nickname.textContent = participant?.nickname || '참가 대기';
                if (participant) nickname.style.color = this.safeColor(participant.color, '#ffffff');
                slot.appendChild(number);
                slot.appendChild(nickname);
                names.appendChild(slot);
            }
        }
    }

    spawnRecruitmentNotification(nickname) {
        if (!this.card) return;
        const feed = this.card.querySelector('#hunt-recruit-feed');
        if (feed) feed.textContent = `✒️ ${String(nickname || '헌터')}이(가) 퀘스트에 서명했습니다.`;
    }

    renderLoadout(data) {
        this.clearAnimationTimers();
        if (!this.container) this.createContainer();
        this.clearLobbyTimer();
        this.container.classList?.add('hunt-pregame-overlay');
        const monsterName = this.escapeHTML((data.selectedMonster && data.selectedMonster.nameKO) || '미확인 몬스터');
        this.container.innerHTML = `
            <div class="game-hunt-card game-hunt-pregame-card hunt-loadout-board" style="position:relative;">
                <div class="game-timer hunt-loadout-timer">⏳ 장비 확정 ${data.timeLeft || 60}초</div>
                <div class="hunt-loadout-kicker" style="font-size:1rem;color:#c98534;font-weight:900;letter-spacing:3px;">⚒️ HUNTER LOADOUT</div>
                <div class="game-title" style="font-size:2.25rem;margin:6px 0 2px;">${monsterName} 출발 준비</div>
                <div class="game-hunt-weapons-grid" id="hunt-loadout-grid">
                    ${(data.selectedWeapons || []).map(hunter => `<div class="game-hunt-weapon-card hunt-loadout-card" id="hunt-opt-${hunter.index}" style="position:relative;padding:18px 14px;min-height:330px;"></div>`).join('')}
                </div>
                <div class="hunt-loadout-guide" aria-label="로드아웃 채팅 명령어">
                    <b class="hunt-loadout-guide-label">채팅 명령어</b>
                    <span>!대검 지원가</span><span>!차액</span><span>!추천</span><span class="hunt-loadout-reroll">🎲 !리롤 ×2</span><span class="hunt-loadout-ready-command">!준비</span>
                </div>
            </div>`;
        this.card = this.container.querySelector('.game-hunt-card');
        (data.selectedWeapons || []).forEach(hunter => this.updateLoadoutCard(hunter));
    }

    updateLoadoutCard(hunter) {
        if (!this.card || !hunter) return;
        const card = this.card.querySelector(`#hunt-opt-${hunter.index}`);
        if (!card) return;
        card.classList.toggle('hunt-loadout-ready', Boolean(hunter.loadoutReady));
        card.setAttribute('aria-label', hunter.loadoutReady ? '준비 완료, 장비 변경 잠김' : '장비 선택 중');
        const personality = this.getPersonalityStyle(hunter.personality);
        const perkBubbles = this.renderPerkBubbles(hunter.perks || []);
        const hunterName = this.escapeHTML(hunter.hunterName || `HUNTER ${hunter.index + 1}`);
        card.innerHTML = `
            <div class="hunt-loadout-hunter-name" style="font-size:1.15rem;font-weight:900;color:${this.safeColor(hunter.hunterColor, '#eeeeee')};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${hunter.isNpc ? '🐱 ' : ''}${hunterName}</div>
            ${this.renderSharpnessGauge(hunter, `loadout-sharpness-${hunter.index}`)}
            <div class="game-hunt-weapon-img-container hunt-loadout-weapon-icon" style="position:relative;width:92px;height:92px;margin:7px auto;">
                <img class="game-hunt-weapon-img" src="img/weapons/${this.escapeHTML(hunter.filename)}" style="width:92px;height:92px;margin:0;" />
                ${hunter.id === 'insect_glaive' ? '<img class="ig-kinsect ig-kinsect--rest" src="img/weapons/kinsect.svg" alt="" />' : ''}
            </div>
            <div class="hunt-loadout-build-line">
                <div class="hunt-loadout-weapon-name" style="font-size:1.35rem;font-weight:1000;color:#c98534;" title="${this.escapeHTML(hunter.weaponDisplayName || hunter.name)}">${this.escapeHTML(hunter.weaponDisplayName || hunter.name)}</div>
                <div class="hunt-loadout-personality" style="background:${personality.bg};border:1px solid ${personality.color};border-radius:7px;color:${personality.color};font-weight:900;padding:3px 7px;">${personality.label}</div>
            </div>
            <div class="hunt-loadout-perks">${perkBubbles}</div>`;
    }

    updatePhaseTimer(timeLeft, label) {
        if (!this.container) return;
        const timer = this.container.querySelector('.game-timer');
        if (timer) timer.textContent = `⏳ ${label} ${timeLeft}초`;
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
        this.container.classList?.remove('hunt-pregame-overlay');
        this.card.classList.remove('game-hunt-pregame-card', 'hunt-quest-board', 'hunt-loadout-board');
        this.card.classList.add('hunt-combat-board');
        this.card.classList.remove('entry-anim');
        this.card.style.position = 'relative';
        this.card.style.opacity = '1';
        this.card.style.filter = 'none';
        this.card.style.animation = 'none';
        this.card.style.transform = '';

        const { hpLabelText, selectedMonster, selectedWeapons, showMonsterHp, timeLimit, smallMonsterCount = 0, cartLimit = 3 } = data;
        this.cartLimit = Math.max(3, Number(cartLimit || 3));
        const isSmallSwarm = Number(smallMonsterCount) >= 3;
        const monsterVisuals = isSmallSwarm
            ? `<div class="hunt-small-monster-pack" style="--small-monster-count:${smallMonsterCount}">${Array.from({ length: smallMonsterCount }, (_, index) => `
                <div class="hunt-small-monster-slot" data-small-monster-slot="${index}">
                    <img class="game-hunt-monster-img hunt-small-monster${index === 0 ? ' is-targeted is-attacking' : ''}" ${index === 0 ? 'id="fight-monster-img"' : ''} data-small-monster-index="${index}" src="img/monsters/${selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" />
                    <div class="hunt-small-monster-hp"><i></i></div>
                    <div class="hunt-small-monster-atb" aria-label="${selectedMonster.nameKO} ${index + 1} 행동 게이지"><i></i></div>
                    <b>${index + 1}</b>
                </div>`).join('')}</div>`
            : `<img class="game-hunt-monster-img" id="fight-monster-img" src="img/monsters/${selectedMonster.filename}" onerror="this.src='img/monsters/rathalos.png';" style="width:380px;height:380px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.85));transition:transform .15s ease;position:relative;z-index:2;" />`;
        const limitSec = timeLimit || 480;
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
                <div class="hunt-monster-side-panel hunt-monster-side-panel--left" style="
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 14px;
                    background: rgba(0,0,0,0.45);
                    border: 1.5px solid rgba(197, 160, 89, 0.25);
                    border-radius: 16px;
                    padding: 14px;
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
                        수레 현황: ${this.cartLimit <= 4 ? Array(this.cartLimit).fill('🛒').join(' ') : `🛒 ×${this.cartLimit}`} (0/${this.cartLimit})
                    </div>
                    
                    <div style="font-size: 1.25rem; font-weight: bold; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Monster Action</div>
                    <!-- Monster ATB Bar -->
                    <div style="width: 100%; background: #222; height: 16px; border-radius: 8px; overflow: hidden; border: 1px solid #333; box-sizing: border-box; box-shadow: inset 0 0 5px rgba(0,0,0,0.8);">
                        <div id="monster-atb-fill" style="width: 0%; height: 100%; background: #e58e26; transition: width 0.1s linear;"></div>
                    </div>
                </div>

                <!-- Center Monster Image (Scaled to 380px) -->
                <div class="hunt-monster-motion-stage" style="
                    width: min(720px, 48vw);
                    height: 380px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    ${monsterVisuals}
                    <div class="hunt-flight-knockdown-gauge" id="hunt-flight-knockdown-gauge" hidden>
                        <div><span id="hunt-flight-knockdown-fill"></span></div>
                        <b id="hunt-flight-knockdown-label">격추 0%</b><small id="hunt-flight-timer">60초</small>
                    </div>
                </div>

                <!-- Right Info Panel -->
                <div class="hunt-monster-side-panel hunt-monster-side-panel--right" style="
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 14px;
                    background: rgba(0,0,0,0.45);
                    border: 1.5px solid rgba(197, 160, 89, 0.25);
                    border-radius: 16px;
                    padding: 14px;
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

            <div class="hunt-combat-reserve-commands" aria-label="참가 헌터 행동 예약 명령">
                <b>예약</b><span>!물약 · !가루 · !폭탄 · !숫돌 · !점프 · !귀환옥</span>
            </div>

            <!-- 4 Weapons Grid (Bottom) -->
            <div class="game-hunt-weapons-grid">
                ${selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card ${w.status === 'dead' ? 'dead' : ''}" id="fight-card-${w.index}" style="position:relative; transition: transform 0.15s ease, border-color 0.15s ease; ${w.status === 'dead' ? 'transform: rotate(180deg);' : ''}">
                    ${this.renderSharpnessGauge(w, `sharpness-${w.index}`)}
                    <div class="hunt-action-queue" id="hunt-action-queue-${w.index}" aria-label="예약 행동 큐">${this.renderHunterCommandQueue(w)}</div>
                    <div class="game-hunt-weapon-img-container weapon-${w.id} weapon-charge-stage-${Math.min(3, Number(w.id === 'hammer' ? w.hammerChargeLevel : w.greatSwordCharge) || 0)}" id="weapon-img-container-${w.index}" style="--weapon-facing:${Number(w.index) < 2 ? 1 : -1};--great-sword-mirror:${Number(w.index) < 2 ? -1 : 1};position: relative; width: 115px; height: 115px; margin: 0 auto 16px;">
                        <img class="game-hunt-weapon-img" src="img/weapons/${w.filename}" style="margin: 0;" />
                        <div class="hunter-blight-overlay" id="hunter-blights-${w.index}" aria-label="${this.blightLabel(w.elementalBlights)}">${this.renderHunterBlights(w.elementalBlights)}</div>
                        ${w.id === 'insect_glaive' ? `<img class="ig-kinsect" id="ig-kinsect-${w.index}" src="img/weapons/kinsect.svg" alt="" />` : ''}
                        ${w.id === 'gunlance' ? `
                            <div class="game-hunt-weapon-overlay gunlance-overheat-overlay" id="overheat-overlay-${w.index}" style="background: linear-gradient(180deg, #ff3b30 0%, #ff9500 100%); mask-image: url('img/weapons/gunlance.svg'); -webkit-mask-image: url('img/weapons/gunlance.svg'); opacity: ${w.overheatDuration ? 1 : 0}; clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0px 0px 0px); -webkit-clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0px 0px 0px);"></div>
                        ` : ''}
                        ${w.id === 'long_sword' ? `
                            <div class="game-hunt-weapon-overlay long-sword-spirit-overlay" id="spirit-overlay-${w.index}" style="background: #ffffff; mask-image: url('img/weapons/long_sword.svg'); -webkit-mask-image: url('img/weapons/long_sword.svg');"></div>
                        ` : ''}
                        ${w.id === 'charge_blade' ? `
                            <div class="game-hunt-weapon-overlay charge-blade-shield-overlay" id="shield-overlay-${w.index}" style="background: #e84393; mask-image: url('img/weapons/charge_blade.svg'); -webkit-mask-image: url('img/weapons/charge_blade.svg');"></div>
                        ` : ''}
                        ${w.id === 'hunting_horn'
                            ? `<div class="weapon-resource-dock weapon-resource-dock-horn">${this.renderWeaponResourceGlyphs(w)}</div>`
                            : this.renderWeaponResourceGlyphs(w)}
                        ${['great_sword', 'hammer'].includes(w.id) ? `<div class="weapon-charge-aura" aria-hidden="true" style="mask-image:url('img/weapons/${w.filename}');-webkit-mask-image:url('img/weapons/${w.filename}');"></div>` : ''}
                    </div>
                    <div class="hunt-combat-info">
                    <div class="game-hunt-status-tag-container" style="position: absolute; right: calc(50% + 68px); top: 92px; width: 52px; height: 52px; display: flex; align-items: center; justify-content: flex-end; z-index: 5;">
                        <div class="hunt-horn-buff-rack" id="horn-buffs-${w.index}" aria-label="수렵피리 버프">${this.renderHornBuffBadges(w)}</div>
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
                        <span id="trap-count-${w.index}">🪤 ${Number(w.shockTraps || 0)}</span>
                        <span id="lifepowder-count-${w.index}">✨ ${Number(w.lifepowders || 0)}</span>
                        <span id="bomb-count-${w.index}">💣 ${Number(w.bombs || 0)}</span>
                    </div>
                    <div class="hunt-combat-perks">${this.renderPerkBubbles(w.perks || [], true)}</div>
 
                    <div class="game-hunt-weapon-name" style="font-size: 2.5rem; font-weight: bold; color:${SafeContent.cssColor(w.hunterColor, '#c98534')}; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; margin-bottom: 6px;">
                        👤 ${SafeContent.escapeHTML(w.hunterName || 'HUNTER')}
                    </div>
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

    updateSmallMonsterSwarmUI(state) {
        if (!this.card || !state?.units) return;
        this.card.querySelectorAll('.hunt-small-monster').forEach(image => {
            const index = Number(image.dataset.smallMonsterIndex);
            const unit = state.units[index];
            const slot = image.closest('.hunt-small-monster-slot');
            if (!unit || !slot) return;
            const fill = slot.querySelector('.hunt-small-monster-hp i');
            if (fill) fill.style.width = `${Math.max(0, unit.hp / unit.maxHp * 100)}%`;
            const atbFill = slot.querySelector('.hunt-small-monster-atb i');
            if (atbFill) atbFill.style.width = `${Math.max(0, Math.min(100, Number(unit.atb || 0)))}%`;
            slot.classList.toggle('is-defeated', !unit.alive);
            image.classList.toggle('is-targeted', unit.alive && index === state.targetIndex);
            image.classList.toggle('is-attacking', unit.alive && index === state.activeAttackerIndex);
        });
    }

    updateTailSeverUI(visible, carved = false, displayName = '몬스터 꼬리') {
        if (!this.card) return;
        let tail = this.card.querySelector('#hunt-severed-tail');
        if (!tail) {
            tail = document.createElement('div');
            tail.id = 'hunt-severed-tail';
            tail.className = 'hunt-severed-tail';
            tail.setAttribute('aria-label', '잘린 꼬리');
            tail.innerHTML = '<img src="local_assets/monster_hunter/ui/rathalos-tail-item.png" alt="" /><b></b>';
            this.card.appendChild(tail);
        }
        tail.hidden = !visible;
        tail.classList.toggle('is-carved', carved);
        const label = tail.querySelector('b');
        if (label) label.textContent = displayName;
        if (visible && !carved) {
            const width = Math.max(640, this.card.clientWidth || 1920);
            const height = Math.max(520, Math.min((this.card.clientHeight || 900) * .68, 680));
            tail.style.left = `${Math.round(width * (.12 + Math.random() * .76))}px`;
            tail.style.top = `${Math.round(130 + Math.random() * Math.max(160, height - 280))}px`;
            tail.classList.remove('is-dropping');
            void tail.offsetWidth;
            tail.classList.add('is-dropping');
        }
    }

    updateWeaponAtbUI(idx, atb, w) {
        if (!this.card) return;
        const weaponCard = this.card.querySelector(`#fight-card-${idx}`);
        if (weaponCard) {
            weaponCard.classList.toggle('hunter-at-camp', Boolean(w?.isAtCamp));
            if (w?.isAtCamp) weaponCard.dataset.campLabel = `⛺ ${w.campReason || '캠프 대기 중'}`;
            else delete weaponCard.dataset.campLabel;
        }
        const circle = this.card.querySelector(`#atb-circle-fill-${idx}`);
        if (circle) {
            const offset = 37.7 - (37.7 * Math.max(0, Math.min(100, atb))) / 100;
            circle.style.strokeDashoffset = offset;

            // Check if the hunter is fainted, stunned, roar-stunned, or in hit recovery (interrupted)
            const isInterrupted = w && (w.status === 'dead' || w.status === 'stunned' || w.roarStunned || (w.hitDuration && w.hitDuration > 0));
            circle.style.stroke = isInterrupted ? '#7f8c8d' : '#00a8ff';
        }
        if (w) {
            this.updateWeaponMechanicUI(idx, w);
            this.updateHornBuffUI(idx, w);
        }
    }

    hornBuffVisuals(w) {
        return [
            { active: Number(w?.hornAttackBuffTicks || 0) > 0, emoji: '⚔️', label: '공격력 강화' },
            { active: Number(w?.hornDefenseBuffTicks || 0) > 0, emoji: '🛡️', label: '방어력 강화' },
            { active: Number(w?.hornSpeedBuffTicks || 0) > 0, emoji: '💨', label: '행동 속도 강화' },
            { active: w?.id === 'hunting_horn' && Number(w?.melodyBuffTicks || 0) > 0, emoji: '🎵', label: '자기 강화' }
        ].filter(buff => buff.active);
    }

    renderHornBuffBadges(w) {
        return this.hornBuffVisuals(w)
            .map(buff => `<span class="hunt-horn-buff" title="${buff.label}" aria-label="${buff.label}">${buff.emoji}</span>`)
            .join('');
    }

    updateHornBuffUI(idx, w) {
        const rack = this.card?.querySelector(`#horn-buffs-${idx}`);
        if (!rack) return;
        const signature = this.hornBuffVisuals(w).map(buff => buff.emoji).join('');
        if (rack.dataset.buffSignature === signature) return;
        rack.dataset.buffSignature = signature;
        rack.innerHTML = this.renderHornBuffBadges(w);
    }

    weaponResourceVisual(w) {
        const pct = value => Math.max(0, Math.min(100, Number(value || 0)));
        const segment = (code, count, active, tone = '') => ({ code, count, active, tone });
        const bar = (code, primary, secondary = null, tone = '') => ({ code, primary: pct(primary), secondary: secondary === null ? null : pct(secondary), tone });
        const visuals = {
            long_sword: () => ({ ...segment('氣', 3, Math.min(3, Number(w.spiritLevel || 0)), 'spirit'), primary: pct(w.spiritGauge) }),
            dual_blades: () => bar('鬼', w.demonStamina, w.archdemonGauge, 'demon'),
            hunting_horn: () => ({ code: '♪', tone: 'note', noteColors: (w.hornNotes || []).slice(0, 3), scoreCount: Math.min(3, (w.storedMelodies || []).length), primary: pct(w.echoGauge) }),
            gunlance: () => ({ ...segment(w.wyrmstake > 0 ? '砲◆' : '砲◇', Math.min(5, Number(w.maxShells || 5)), Math.min(5, Number(w.shells ?? 5)), 'shell'), primary: pct(w.wyvernGauge) }),
            switch_axe: () => bar(w.weaponMode === 'sword' ? (w.ampedStateDuration > 0 ? '剣✦' : '剣') : (w.powerAxeDuration > 0 ? '斧✦' : '斧'), w.switchGauge, w.ampGauge, 'switch'),
            charge_blade: () => segment(w.shieldChargeDuration > 0 ? '瓶⚡' : '瓶', 5, Math.min(5, Number(w.phials ?? 5)), 'phial'),
            insect_glaive: () => ({ code: '蟲', count: 3, active: [Boolean(w.extractBuffs?.red), Boolean(w.extractBuffs?.white), Boolean(w.extractBuffs?.orange)], tone: 'extract' }),
            light_bowgun: () => ({ ...segment(w.rapidMode ? '速' : '彈', Math.min(6, Number(w.maxMagazine || 5)), Math.min(6, Number(w.magazine ?? 5)), 'ammo'), primary: pct(w.rapidGauge) }),
            heavy_bowgun: () => ({ ...segment(w.ignitionMode ? '熱' : '彈', Math.min(6, Number(w.maxMagazine || 4)), Math.min(6, Number(w.magazine ?? 4)), 'ammo'), primary: pct(w.ignitionGauge) }),
            bow: () => bar(Number(w.fuseArrows || 0) > 0 ? `爆${w.fuseArrows}` : '導', w.tracerGauge, w.bowStamina, 'tracer')
        };
        return visuals[w.id] ? visuals[w.id]() : null;
    }

    renderWeaponResourceGlyphs(w) {
        const visual = this.weaponResourceVisual(w);
        if (!visual) return '';
        if (Array.isArray(visual.noteColors)) {
            const notes = Array.from({ length: 3 }, (_, index) => {
                const color = ['red', 'blue', 'green'].includes(visual.noteColors[index]) ? visual.noteColors[index] : 'empty';
                return `<i class="horn-note note-${color}">♪</i>`;
            }).join('');
            const scores = Array.from({ length: 3 }, (_, index) => `<i class="horn-score ${index < visual.scoreCount ? 'active' : ''}">♬</i>`).join('');
            return `<div class="weapon-icon-resource-glyph resource-note" id="weapon-resource-${w.index}" title="${SafeContent.escapeHTML(this.weaponMechanicLabel(w))}">
                <div class="weapon-resource-meter"><div class="horn-note-strip">${notes}</div><div class="horn-score-strip">${scores}</div><div class="weapon-resource-mini-track"><i id="weapon-resource-primary-${w.index}" style="width:${visual.primary}%"></i></div></div>
            </div>`;
        }
        const active = Array.isArray(visual.active)
            ? visual.active
            : Array.from({ length: visual.count || 0 }, (_, index) => index < Number(visual.active || 0));
        const segments = active.length ? `<div class="weapon-resource-segments">${active.map((isActive, index) => `<i class="weapon-resource-segment segment-${index} ${isActive ? 'active' : ''}"></i>`).join('')}</div>` : '';
        const primary = visual.primary === undefined ? '' : `<div class="weapon-resource-mini-track"><i id="weapon-resource-primary-${w.index}" style="width:${visual.primary}%"></i></div>`;
        const secondary = visual.secondary === null || visual.secondary === undefined ? '' : `<div class="weapon-resource-mini-track secondary"><i id="weapon-resource-secondary-${w.index}" style="width:${visual.secondary}%"></i></div>`;
        const legacyId = w.id === 'charge_blade' ? `cb-phials-${w.index}` : (w.id === 'insect_glaive' ? `ig-extracts-${w.index}` : `weapon-resource-${w.index}`);
        return `<div class="weapon-icon-resource-glyph resource-${visual.tone || 'plain'}" id="${legacyId}" title="${SafeContent.escapeHTML(this.weaponMechanicLabel(w))}">
            <b>${visual.code}</b><div class="weapon-resource-meter">${segments}${primary}${secondary}</div>
        </div>`;
    }

    updateWeaponMechanicUI(idx, w) {
        if (!this.card || !w) return;
        this.updateSharpnessUI(idx, w);
        this.updateWeaponChargeAuraUI(idx, w);
        const glyph = this.card.querySelector(`#weapon-resource-${idx}, #cb-phials-${idx}, #ig-extracts-${idx}`);
        const visual = this.weaponResourceVisual(w);
        if (!glyph || !visual) return;
        glyph.title = this.weaponMechanicLabel(w);

        const primary = glyph.querySelector(`#weapon-resource-primary-${idx}`);
        const secondary = glyph.querySelector(`#weapon-resource-secondary-${idx}`);
        if (primary && visual.primary !== undefined) primary.style.width = `${visual.primary}%`;
        if (secondary && visual.secondary !== undefined && visual.secondary !== null) secondary.style.width = `${visual.secondary}%`;

        if (Array.isArray(visual.noteColors)) {
            glyph.querySelectorAll('.horn-note').forEach((note, index) => {
                note.className = `horn-note note-${visual.noteColors[index] || 'empty'}`;
            });
            glyph.querySelectorAll('.horn-score').forEach((score, index) => score.classList.toggle('active', index < visual.scoreCount));
            return;
        }

        const active = Array.isArray(visual.active)
            ? visual.active
            : Array.from({ length: visual.count || 0 }, (_, index) => index < Number(visual.active || 0));
        glyph.querySelectorAll('.weapon-resource-segment').forEach((segment, index) => {
            segment.classList.toggle('active', Boolean(active[index]));
        });
    }

    renderSharpnessGauge(hunter, id) {
        const element = this.weaponElementEmoji(hunter?.weaponInstance?.element);
        if (!hunter?.sharpnessProfile) {
            return `<div class="hunt-sharpness-wrap hunt-sharpness-wrap--ranged">
                ${element}
                <div class="hunt-sharpness-gauge is-ranged" id="${id}" aria-label="원거리 무기, 예리도 없음"><span>AMMO</span></div>
            </div>`;
        }
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'white', 'purple'];
        const total = Math.max(1, colors.reduce((sum, color) => sum + Number(hunter.sharpnessProfile[color] || 0), 0));
        let cumulative = 0;
        const segments = colors.map(color => {
            const length = Number(hunter.sharpnessProfile[color] || 0);
            if (length <= 0) return '';
            const filled = Math.max(0, Math.min(length, Number(hunter.sharpness || 0) - cumulative));
            cumulative += length;
            return `<i class="sharpness-segment sharpness-${color}" style="width:${length / total * 100}%"><b style="width:${filled / length * 100}%"></b></i>`;
        }).join('');
        const currentColor = typeof HuntWeaponInstanceCatalog !== 'undefined'
            ? HuntWeaponInstanceCatalog.colorAt(hunter.sharpnessProfile, hunter.sharpness)
            : 'green';
        return `<div class="hunt-sharpness-wrap" title="${this.escapeHTML(hunter.weaponDisplayName || hunter.name)} · ${currentColor}">
            <span class="hunt-sharpness-name">${this.escapeHTML(hunter.weaponDisplayName || hunter.name)}</span>
            ${element}
            <div class="hunt-sharpness-gauge" id="${id}" style="--sharpness-current:${HuntWeaponInstanceCatalog.colorHex(currentColor)}" aria-label="예리도 ${currentColor}">${segments}<em class="sharpness-notch"></em></div>
        </div>`;
    }

    weaponElementEmoji(element) {
        const elements = {
            fire: ['🔥', '불 속성'],
            water: ['💧', '물 속성'],
            thunder: ['⚡', '번개 속성'],
            ice: ['❄️', '얼음 속성'],
            dragon: ['🐉', '용 속성']
        };
        const entry = elements[String(element || '').toLowerCase()];
        return entry
            ? `<span class="hunt-weapon-element" role="img" aria-label="${entry[1]}" title="${entry[1]}">${entry[0]}</span>`
            : '';
    }

    updateSharpnessUI(idx, hunter) {
        const gauge = this.card?.querySelector(`#sharpness-${idx}`);
        if (!gauge || !hunter?.sharpnessProfile) return;
        const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'white', 'purple'];
        let cumulative = 0;
        colors.forEach(color => {
            const length = Number(hunter.sharpnessProfile[color] || 0);
            const fill = gauge.querySelector(`.sharpness-${color} b`);
            if (fill && length > 0) fill.style.width = `${Math.max(0, Math.min(100, (Number(hunter.sharpness || 0) - cumulative) / length * 100))}%`;
            cumulative += length;
        });
        const currentColor = typeof HuntWeaponInstanceCatalog !== 'undefined'
            ? HuntWeaponInstanceCatalog.colorAt(hunter.sharpnessProfile, hunter.sharpness)
            : 'green';
        gauge.setAttribute('aria-label', `예리도 ${currentColor}`);
        gauge.style.setProperty('--sharpness-current', HuntWeaponInstanceCatalog.colorHex(currentColor));
        const wrap = gauge.closest('.hunt-sharpness-wrap');
        if (wrap) wrap.title = `${hunter.weaponDisplayName || hunter.name} · ${currentColor}`;
    }

    renderHunterCommandQueue(hunter) {
        const labels = { whetstone: '숫돌', lifepowder: '가루', potion: '물약', bomb: '폭탄', jump: '점프', farcaster: '귀환' };
        const queue = Array.isArray(hunter?.queuedCommands) ? hunter.queuedCommands : [];
        return queue.map((command, index) => `${index ? '&lt;' : ''}<span>[${labels[command] || command}]</span>`).join('');
    }

    updateHunterCommandQueueUI(hunter) {
        if (!this.card || !hunter) return;
        const queue = this.card.querySelector(`#hunt-action-queue-${hunter.index}`);
        if (!queue) return;
        queue.innerHTML = this.renderHunterCommandQueue(hunter);
        queue.classList.toggle('active', Boolean(hunter.queuedCommands?.length));
    }

    renderHunterBlights(blights = {}) {
        const defs = {
            fire: ['🔥', '화상'], water: ['💧', '수상'], thunder: ['⚡', '뢰상'],
            ice: ['❄️', '빙상'], dragon: ['🐉', '용상']
        };
        return Object.entries({ ...defs,
            poison: ['☠️', '독'], paralysis: ['⚡', '마비'], sleep: ['💤', '수면']
        })
            .filter(([type]) => Number(blights?.[type] || 0) > 0)
            .map(([type, [emoji, label]]) => `<span class="hunter-blight blight-${type}" title="${label}">${emoji}</span>`)
            .join('');
    }

    blightLabel(blights = {}) {
        const labels = { fire: '화상', water: '수상', thunder: '뢰상', ice: '빙상', dragon: '용상' };
        Object.assign(labels, { poison: '독', paralysis: '마비', sleep: '수면' });
        return Object.keys(labels).filter(type => Number(blights?.[type] || 0) > 0).map(type => labels[type]).join(', ');
    }

    updateHunterBlightUI(idx, blights = {}) {
        const overlay = this.card?.querySelector(`#hunter-blights-${idx}`);
        if (!overlay) return;
        overlay.innerHTML = this.renderHunterBlights(blights);
        overlay.setAttribute('aria-label', this.blightLabel(blights));
        overlay.classList.toggle('active', Boolean(overlay.childElementCount));
    }

    updateWeaponChargeAuraUI(idx, w) {
        if (!['great_sword', 'hammer'].includes(w?.id)) return;
        const container = this.card?.querySelector(`#weapon-img-container-${idx}`);
        if (!container) return;
        const level = Math.min(3, Math.max(0, Number(w.id === 'hammer' ? w.hammerChargeLevel : w.greatSwordCharge) || 0));
        container.classList.remove('weapon-charge-stage-0', 'weapon-charge-stage-1', 'weapon-charge-stage-2', 'weapon-charge-stage-3');
        container.classList.add(`weapon-charge-stage-${level}`);
    }

    weaponMechanicLabel(w) {
        if (!w) return '';
        const pct = value => Math.round(Math.max(0, Math.min(100, Number(value || 0))));
        const labels = {
            great_sword: () => `CHARGE ${w.greatSwordCharge || 0} · TCS ${w.greatSwordChain || 0}/2`,
            long_sword: () => `기인 ${pct(w.spiritGauge)} · 색 ${w.spiritLevel || 0}/3`,
            sword_shield: () => w.perfectRushStep ? `JUST RUSH ${w.perfectRushStep}/3` : `RUSH BUILD ${w.rushStep || 0}/2`,
            dual_blades: () => `${w.demonMode ? '귀인화' : (pct(w.archdemonGauge) >= 50 ? '귀인강화' : '평상')} · STA ${pct(w.demonStamina)} · 鬼 ${pct(w.archdemonGauge)}`,
            hunting_horn: () => `음표 ${(w.hornNotes || []).map(note => ({ red: 'R', blue: 'B', green: 'G' })[note] || '·').join('') || '—'} · 악보 ${(w.storedMelodies || []).length}/3 · 향 ${pct(w.echoGauge)}`,
            lance: () => w.powerGuardReady ? 'POWER GUARD · 반격 대기' : (w.lanceCounterReady ? 'COUNTER · 반격 대기' : `THRUST ${w.lanceStep || 0}/2`),
            gunlance: () => `${({ normal: '일반', long: '방사', wide: '확산' })[w.shellingType] || '일반'} · 탄 ${w.shells ?? 5}/${w.maxShells || 5} · 용항 ${w.wyrmstake > 0 ? 'READY' : 'EMPTY'} · 용격 ${pct(w.wyvernGauge)}`,
            switch_axe: () => `${w.weaponMode === 'sword' ? 'SWORD' : 'AXE'} · 검 ${pct(w.switchGauge)} · ${w.ampedStateDuration > 0 ? '고출력' : `각성 ${pct(w.ampGauge)}`} · ${w.powerAxeDuration > 0 ? '도끼 강화' : '도끼 보통'}`,
            charge_blade: () => `${w.chargeBladeMode === 'axe' ? 'AXE' : 'SWORD'} · 병 ${w.phials || 0}/5 · ${w.shieldChargeDuration > 0 ? '방패·도끼 강화' : `충전 ${pct(w.chargeEnergy)}`}`,
            insect_glaive: () => `진액 ${w.extractBuffs?.red ? 'R' : '·'}${w.extractBuffs?.white ? 'W' : '·'}${w.extractBuffs?.orange ? 'O' : '·'} · ${w.airborne ? 'AIR' : 'GROUND'}`,
            light_bowgun: () => `${w.rapidMode ? 'RAPID' : 'NORMAL'} · MAG ${w.magazine ?? 5}/${w.maxMagazine || 5} · 속사 ${pct(w.rapidGauge)} · 기폭 ${w.wyvernblastCharges ?? 3}`,
            heavy_bowgun: () => `${w.ignitionMode ? 'IGNITION' : 'STANDARD'} · MAG ${w.magazine ?? 4}/${w.maxMagazine || 4} · 점화 ${pct(w.ignitionGauge)}${w.ignitionMode ? ` · 기관 ${Number(w.wyvernheartStep || 0) + 1}단` : ''}`,
            bow: () => `CHARGE ${w.bowCharge || 0}/3 · STAMINA ${pct(w.bowStamina)} · 유도 ${pct(w.tracerGauge)} · 유폭 ${w.fuseArrows || 0}`
        };
        return labels[w.id] ? labels[w.id]() : w.name || '';
    }

    updateMonsterAtbUI(atb) {
        if (!this.card) return;
        const fill = this.card.querySelector('#monster-atb-fill');
        if (fill) fill.style.width = `${atb}%`;
    }

    updateMonsterFlightUI(airborne, progress = 0, damage = 0, threshold = 0, remainingTicks = 0) {
        const monsterImg = this.card?.querySelector('#fight-monster-img');
        if (monsterImg) monsterImg.classList.toggle('monster-airborne', Boolean(airborne));
        const stage = this.card?.querySelector('.hunt-monster-motion-stage');
        if (stage) stage.classList.toggle('monster-flight-stage-airborne', Boolean(airborne));
        const gauge = this.card?.querySelector('#hunt-flight-knockdown-gauge');
        if (gauge) gauge.hidden = !airborne;
        const percent = Math.round(Math.max(0, Math.min(1, Number(progress || 0))) * 100);
        const fill = this.card?.querySelector('#hunt-flight-knockdown-fill');
        if (fill) fill.style.width = `${percent}%`;
        const label = this.card?.querySelector('#hunt-flight-knockdown-label');
        if (label) label.textContent = `격추 ${percent}%`;
        const timer = this.card?.querySelector('#hunt-flight-timer');
        if (timer) timer.textContent = `${Math.ceil(Number(remainingTicks || 0) / 10)}초`;
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

    updateHunterItemUI(hunter) {
        if (!this.card || !hunter) return;
        const potion = this.card.querySelector(`#potion-count-${hunter.index}`);
        const trap = this.card.querySelector(`#trap-count-${hunter.index}`);
        const powder = this.card.querySelector(`#lifepowder-count-${hunter.index}`);
        const bomb = this.card.querySelector(`#bomb-count-${hunter.index}`);
        if (potion) potion.textContent = `🧪 ${Number(hunter.potions || 0)}`;
        if (trap) trap.textContent = `🪤 ${Number(hunter.shockTraps || 0)}`;
        if (powder) powder.textContent = `✨ ${Number(hunter.lifepowders || 0)}`;
        if (bomb) bomb.textContent = `💣 ${Number(hunter.bombs || 0)}`;
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
            phialContainer.querySelectorAll('.weapon-resource-segment').forEach((dot, index) => {
                dot.classList.toggle('active', index < Number(phials || 0));
            });
        }
    }

    updateExtractsUI(idx, buffs) {
        if (!this.card) return;
        const extContainer = this.card.querySelector(`#ig-extracts-${idx}`);
        if (extContainer) {
            const state = buffs || {};
            ['red', 'white', 'orange'].forEach((color, index) => {
                extContainer.querySelector(`.segment-${index}`)?.classList.toggle('active', Boolean(state[color]));
            });
        }
    }

    updateCartUI(carts, limit = this.cartLimit || 3) {
        if (!this.card) return;
        this.cartLimit = Math.max(3, Number(limit || 3));
        const el = this.card.querySelector('#cart-counter-board');
        if (el) {
            let icons = this.cartLimit > 4
                ? `💥×${carts} · 🛒×${Math.max(0, this.cartLimit - carts)}`
                : Array.from({ length: this.cartLimit }, (_, index) => index < carts ? '❌' : '🛒').join(' ');
            el.textContent = `수레 현황: ${icons} (${carts}/${this.cartLimit})`;
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

    triggerMonsterAttack(type, emoji, targets, attackName = '', pattern = null) { return this.combatAnimator.triggerMonsterAttack(type, emoji, targets, attackName, pattern); }
    triggerValstraxAmbushWarning() { return this.combatAnimator.triggerValstraxAmbushWarning(); }

    triggerHitAnimation(idx, w, damage) { return this.combatAnimator.triggerHitAnimation(idx, w, damage); }

    triggerRollAnimation(idx) { return this.combatAnimator.triggerRollAnimation(idx); }

    triggerInvincibleJump(idx, active) { return this.combatAnimator.triggerInvincibleJump(idx, active); }

    triggerStunUI(idx, isStunned) { return this.combatAnimator.triggerStunUI(idx, isStunned); }

    triggerDeathTag(idx, w, timerVal = 5) { return this.combatAnimator.triggerDeathTag(idx, w, timerVal); }

    triggerMonsterKnockdownAnim() { return this.combatAnimator.triggerMonsterKnockdownAnim(); }

    triggerEnvironmentEffect(kind) { return this.combatAnimator.triggerEnvironmentEffect(kind); }

    restoreBorder(wIndex, w) { return this.combatAnimator.restoreBorder(wIndex, w); }

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, actionOrName = null, isDodge = false) {
        return this.combatAnimator.shakeWeapon(idx, w, borderClr, isAttack, actionOrName, isDodge);
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
