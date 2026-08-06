class HuntRenderer {
    constructor(options = {}) {
        this.container = null;
        this.card = null;
        this.selectedMonster = null;
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
        this.combatAnimator?.clearMonsterAnimations('renderer-clear');
        this.animationTimers.clearAll();
    }

    clearCombatTransientVisuals() {
        this.clearAnimationTimers();
        const selectors = [
            '.game-hunt-cart-container',
            '.game-hunt-cart-local',
            '.victory-emoji-bubble',
            '.skill-bubble',
            '.monster-skill-bubble',
            '.hunter-stun-orbit',
            '.roar-stun-overlay',
            '.roar-speaker-emoji',
            '.roar-wave-ring',
            '.monster-hybrid-emoji-left',
            '.monster-hybrid-emoji-right',
            '.monster-local-action-fx',
            '.monster-charge-track',
            '.monster-burrow-dust'
        ];
        this.container?.querySelectorAll?.(selectors.join(','))?.forEach(node => node.remove());
        // Cart overlays normally belong to the hunt container, but the guarded
        // fallback path can attach one to body before renderer ownership exists.
        if (typeof document !== 'undefined') {
            document.querySelectorAll?.('.game-hunt-cart-container,.game-hunt-cart-local')
                ?.forEach(node => node.remove());
        }
        this.card?.classList?.remove?.(
            'monster-charge-rumble',
            'monster-ultimate-board-shake',
            'hunt-valstrax-impact',
            'card-heavy-shake-anim',
            'hunt-bomb-shake',
            'hunt-rockfall-shake'
        );
    }

    removeContainer() {
        this.clearLobbyTimer();
        this.clearAnimationTimers();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.card = null;
        this.selectedMonster = null;
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

    monsterImagePath(monster = {}) {
        const explicit = String(monster.imagePath || '').trim();
        if (/^(?:local_assets\/monster_hunter\/reference-icons\/|img\/monsters\/)/.test(explicit)) return explicit;
        return `img/monsters/${String(monster.filename || 'rathalos.png').replace(/^\/+/, '')}`;
    }

    getPersonalityIcon(personality) {
        return ({ veteran: '🏆', support: '💚', newbie: '🐣', offensive: '💥', defensive: '🛡️', normal: '⚖️' })[personality] || '⚖️';
    }

    renderHunterProbabilityBadges(hunter = {}) {
        const modifiers = hunter.perkModifiers || {};
        const personality = hunter.personality || 'normal';
        const perkNames = new Set((hunter.perks || []).map(perk => perk?.name));
        const base = personality === 'veteran'
            ? { evade: .75, guard: .78, foresight: .80, iai: .82 }
            : personality === 'newbie'
                ? { evade: .22, guard: .30, foresight: .50, iai: .22 }
                : personality === 'defensive'
                    ? { evade: .48, guard: .62, foresight: .85, iai: .58 }
                    : personality === 'offensive'
                        ? { evade: .48, guard: .62, foresight: .80, iai: .58 }
                        : { evade: .48, guard: .62, foresight: .75, iai: .58 };
        const percent = value => Math.round(Math.max(0, Math.min(.97, Number(value) || 0)) * 100);
        const weaponAffinity = Math.max(0, Number(hunter.weaponInstance?.affinity ?? hunter.affinity ?? 0)) / 100;
        const affinity = weaponAffinity + Number(modifiers.critChance || 0) + (perkNames.has('간파') ? .18 : 0);
        const badges = [
            { icon: '🎯', value: percent(.90 + Number(modifiers.hitChance || 0)), label: '적중률' },
            { icon: '💥', value: percent(affinity), label: '회심률' },
            { icon: '💨', value: percent(base.evade + Number(modifiers.evadeChance || 0)), label: '회피율' }
        ];
        const usesGuard = hunter.type === 'shield' || hunter.id === 'heavy_bowgun';

        if (usesGuard) {
            badges.push({ icon: '🛡️', value: percent(base.guard + Number(modifiers.guardChance || 0)), label: '가드율' });
        }

        const specials = {
            great_sword: [{ icon: '🦬', value: .42, label: '태클 선택률' }],
            long_sword: [
                { icon: '👁️', value: base.foresight, label: '간파베기 성공률' },
                { icon: '⚡', value: base.iai, label: '거합베기 성공률' }
            ],
            sword_shield: [
                { icon: '↩️', value: .22, label: '백스텝 선택률' },
                { icon: '✨', value: .42, label: '퍼펙트 가드 선택률' }
            ],
            hammer: [{ icon: '🔨', value: .32, label: '상쇄 자세 선택률' }],
            lance: [{ icon: '🔱', value: .65, label: '카운터 자세 선택률' }],
            switch_axe: [{ icon: '⚔️', value: .38, label: '검 카운터 선택률' }],
            charge_blade: [{ icon: '🛡️⚡', value: .32, label: '가드 포인트 선택률' }],
            heavy_bowgun: [{ icon: '💣', value: .40, label: '용열 카운터 선택률' }],
            bow: [{ icon: '🪽', value: .40, label: '차지 스텝 선택률' }]
        };
        (specials[hunter.id] || []).forEach(stat => badges.push({ ...stat, value: percent(stat.value) }));

        return badges.map(stat => `<span class="hunt-probability-badge" title="${stat.label} ${stat.value}%" aria-label="${stat.label} ${stat.value}%"><b>${stat.icon}</b>${stat.value}%</span>`).join('');
    }

    escapeHTML(value) {
        if (typeof SafeContent !== 'undefined' && SafeContent.escapeHTML) return SafeContent.escapeHTML(String(value || ''));
        return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
    }

    safeColor(value, fallback = '#eeeeee') {
        return typeof SafeContent !== 'undefined' && SafeContent.cssColor ? SafeContent.cssColor(value, fallback) : fallback;
    }

    getPerkVisual(perk = {}) {
        if (perk.name === '💩' || perk.name === '똥') return { icon: '💩', tone: 'twisted', affinity: 'neutral' };
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

    renderPerkBubbles(perks = [], compact = false, lockedPerkId = null) {
        if (!perks.length) {
            return '<span class="hunt-perk-bubble hunt-perk-bubble--empty"><span class="hunt-perk-icon">◇</span><span class="hunt-perk-name">백지의 기록</span></span>';
        }
        const renderBubble = (perk, synergy = null) => {
            const visual = this.getPerkVisual(perk);
            const description = perk.description || '길드의 기록에는 이유가 적혀 있지 않다.';
            const lore = compact ? '' : `<span class="hunt-perk-lore">${this.escapeHTML(description)}</span>`;
            const comboClass = synergy ? ' hunt-perk-bubble--synergy' : '';
            const dungClass = (perk.name === '💩' || perk.name === '똥') ? ' hunt-perk-bubble--dung' : '';
            const locked = perk.id === lockedPerkId;
            const lockClass = locked ? ' hunt-perk-bubble--locked' : '';
            return `<span class="hunt-perk-bubble hunt-perk-bubble--${visual.tone} hunt-perk-bubble--skill-${visual.affinity}${compact ? ' hunt-perk-bubble--compact' : ''}${comboClass}${dungClass}${lockClass}" title="${this.escapeHTML(`${perk.name}: ${description}`)}"><span class="hunt-perk-icon">${synergy?.icon || visual.icon}${locked ? '<span class="hunt-perk-lock" aria-label="잠금">🔒</span>' : ''}</span><span class="hunt-perk-copy"><span class="hunt-perk-name">${this.escapeHTML(perk.name)}</span>${lore}</span></span>`;
        };
        let groups = typeof HuntPerkSynergyCatalog !== 'undefined'
            ? HuntPerkSynergyCatalog.group(perks)
            : perks.map((perk, order) => ({ synergy: null, perks: [perk], order }));
        if (lockedPerkId) {
            groups = groups.map(group => ({
                ...group,
                perks: [...group.perks].sort((a, b) => Number(b.id === lockedPerkId) - Number(a.id === lockedPerkId))
            })).sort((a, b) =>
                Number(b.perks.some(perk => perk.id === lockedPerkId))
                - Number(a.perks.some(perk => perk.id === lockedPerkId))
            );
        }
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

    renderJourneyQuestBoard(data) {
        this.clearAnimationTimers();
        if (!this.container) this.createContainer();
        this.clearLobbyTimer();
        this.container.classList?.add('hunt-pregame-overlay');
        const voting = Array.isArray(data.journeyChoices) && data.journeyChoices.length > 0;
        const recruiting = Boolean(data.journeyOpening);
        const choices = (voting ? data.journeyChoices : [data.selectedMonster]).filter(Boolean).slice(0, 3);
        const reward = Math.max(0, Number(data.journeyReward || 0));
        const waitingSlots = Array.from({ length: 4 }, (_, index) => `
            <div class="hunt-rise-recruit-slot"><b>${index + 1}</b><span>참가 대기</span></div>`).join('');
        const questCards = choices.map((monster, index) => `
            <article class="hunt-journey-quest-card${choices.length === 1 ? ' is-single' : ''}"
                ${voting ? `data-journey-choice="${index}"` : ''}>
                ${voting ? `<strong class="hunt-journey-quest-command">!${index + 1}</strong>` : ''}
                <img src="${this.escapeHTML(this.monsterImagePath(monster))}"
                    onerror="this.src='img/monsters/rathalos.png';" alt="" />
                <h2>${this.escapeHTML(monster.nameKO || monster.id || '미확인 몬스터')}</h2>
                <p><span>보상</span><b>💰 ${reward}</b></p>
                ${voting ? '<em>0</em>' : ''}
            </article>`).join('');
        const journey = data.journey || {};
        this.container.innerHTML = `
            <div class="game-hunt-card game-hunt-pregame-card hunt-journey-quest-board entry-anim">
                <header class="hunt-journey-quest-heading">
                    <div><small>HUNTER JOURNEY</small><strong>${recruiting ? '퀘스트 수주' : (voting ? '다음 사냥감 투표' : '다음 퀘스트')}</strong></div>
                    <span>STAGE ${Number(journey.stage || 1)}/3</span>
                </header>
                <div class="hunt-journey-progress" aria-label="여정 진행 상황">
                    <span>${Number(journey.node || 1)}/${Number(journey.totalNodes || 15)}</span>
                    <span>🛒 ${Number(journey.carts ?? 3)}</span><span>💰 ${Number(journey.zenny || 0)}</span>
                    <span>🔒 ${Number(journey.lockLimit || 1)}</span><span>🎲 ${Number(journey.rerolls || 0)}</span>
                    ${journey.lastEvent ? `<em>${this.escapeHTML(journey.lastEvent)}</em>` : ''}
                </div>
                <main class="hunt-journey-quest-cards" style="--journey-choice-count:${Math.max(1, choices.length)}">${questCards}</main>
                <section class="hunt-journey-party-strip">
                    <div class="hunt-journey-party-title">
                        <b>${recruiting ? '참가 헌터' : '원정대'}</b>
                        <span><strong id="hunt-recruit-count">0</strong> / 4</span>
                    </div>
                    <div id="hunt-recruit-names" class="hunt-rise-recruit-slots">${waitingSlots}</div>
                    <div class="hunt-journey-quest-action">
                        ${voting
                            ? `<small>사냥감 선택</small><strong>!1${choices.length > 1 ? ` ~ !${choices.length}` : ''}</strong>`
                            : recruiting
                                ? '<small>채팅 입력</small><strong>!참가</strong>'
                                : '<small>사냥감 확정</small><strong>자동 출발</strong>'}
                    </div>
                    <div id="hunt-recruit-feed" class="hunt-rise-recruit-feed">${
                        recruiting ? '수주 희망자를 기다리는 중입니다.'
                            : voting ? '원정대의 투표를 기다리는 중입니다.'
                                : '확정된 사냥감으로 출발을 준비합니다.'
                    }</div>
                </section>
                <footer class="hunt-rise-footer">
                    <span>${recruiting ? '4명 충원 시 즉시 장비 설정으로 이동합니다.'
                        : voting ? '최다 득표 사냥감으로 출발합니다.'
                            : '원정대 구성은 유지됩니다.'}</span>
                    <div class="game-timer">${recruiting ? '모집 마감 30초 · 4명 충원 시 즉시 수주'
                        : voting ? '투표 마감 60초 · 전원 투표 시 즉시 확정'
                            : '출발 준비 15초'}</div>
                </footer>
            </div>`;
        this.card = this.container.querySelector('.game-hunt-card');
        this.lobbyTimers.timeout(() => this.card && this.card.classList.remove('entry-anim'), 600);
    }

    renderQuestBoard(data) {
        if (data.journey) {
            this.renderJourneyQuestBoard(data);
            return;
        }
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
                <img src="${this.escapeHTML(this.monsterImagePath(item))}" onerror="this.src='img/monsters/rathalos.png';" alt="" />
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

    renderJourneyEventBoard(data) {
        this.clearAnimationTimers();
        if (!this.container) this.createContainer();
        this.container.classList?.add('hunt-pregame-overlay');
        this.container.innerHTML = `<div class="game-hunt-card game-hunt-pregame-card hunt-journey-event-board">
            <header><small>STAGE ${Number(data.stage)}/3 · ${data.scene ? 'ENCOUNTER' : 'EVENT'}</small>
                <strong>${this.escapeHTML(data.title || (data.scope === 'individual' ? '각자 행동을 선택' : '파티의 다음 행선지를 투표'))}</strong>
                ${data.scene?.narrative ? `<p>${this.escapeHTML(data.scene.narrative)}</p>` : ''}</header>
            <div class="hunt-journey-event-choices">${data.choices.map((choice, index) => {
                return `<div data-journey-event-choice="${index}"><b>!${index + 1}</b><i>${this.escapeHTML(choice.icon)}</i>
                    <strong>${this.escapeHTML(choice.label)}</strong>${choice.description ? `<small>${this.escapeHTML(choice.description)}</small>` : ''}<em>0</em></div>`;
            }).join('')}</div>
            <footer><span>${data.scope === 'individual' ? '헌터별 행동 · 코인이 부족하면 거래 실패 · 무응답 자동 선택' : '파티 공동 행동 · 동표는 시드 선택'}</span><div class="game-timer">선택 마감 60초 · 전원 선택 시 즉시 확정</div></footer>
        </div>`;
        this.card = this.container.querySelector('.game-hunt-card');
    }

    renderJourneyTravelMap(data) {
        this.clearAnimationTimers();
        if (!this.container) this.createContainer();
        this.container.classList?.add('hunt-pregame-overlay');
        const iconFor = node => node.type === 'event' ? '❔'
            : node.isBoss ? '👑'
                : ({ small: '🐾', medium: '🐲', normal: '🐉', elder: '🌌', colossal: '🏔️' })[node.tier] || '⚔️';
        const stages = [0, 1, 2].map(stageIndex => {
            const stageNodes = data.nodes.filter(node => Number(node.stageIndex) === stageIndex);
            return `<section class="hunt-journey-map-stage hunt-journey-map-stage--${stageIndex + 1}">
                <header><b>STAGE ${stageIndex + 1}</b><span>${stageIndex === 0 ? '야생의 길' : stageIndex === 1 ? '강자의 영역' : '최후의 경계'}</span></header>
                <div class="hunt-journey-map-route">${stageNodes.map(node => {
                    const state = node.index < data.currentIndex ? 'is-complete'
                        : node.index === data.currentIndex ? 'is-current' : 'is-future';
                    return `<div class="hunt-journey-map-node ${state}${node.type === 'event' ? ' is-event' : ''}" data-journey-map-node="${node.index}">
                        <i>${iconFor(node)}</i><small>${this.escapeHTML(node.label)}</small>
                        ${node.index === data.currentIndex ? '<em>🚶</em>' : node.index < data.currentIndex ? '<em>✓</em>' : ''}
                    </div>`;
                }).join('')}</div>
            </section>`;
        }).join('');
        const current = data.nodes[data.currentIndex];
        const previous = data.nodes[data.currentIndex - 1];
        this.container.innerHTML = `<div class="game-hunt-card game-hunt-pregame-card hunt-journey-travel-map">
            <header class="hunt-journey-map-heading">
                <small>HUNTER'S ROUTE · STAGE ${Number(data.stage)}/3</small>
                <strong>🗺️ 다음 목적지로 이동 중</strong>
                <p>${previous ? `${this.escapeHTML(previous.label)}에서 ` : '거점에서 '}${this.escapeHTML(current?.label || '미지의 목적지')} 방향으로 향합니다.</p>
            </header>
            <div class="hunt-journey-map-canvas">${stages}</div>
            <footer><span>🛒 ${Number(data.carts || 0)}　💰 ${Number(data.zenny || 0)}　길 위에서는 전투 명령을 받지 않습니다.</span>
                <div class="game-timer" data-journey-travel-timer>도착까지 ${Number(data.duration || 10)}초</div></footer>
        </div>`;
        this.card = this.container.querySelector('.game-hunt-card');
    }

    updateJourneyTravelTimer(seconds) {
        const timer = this.card?.querySelector('[data-journey-travel-timer]');
        if (timer) timer.textContent = `도착까지 ${Math.max(0, Number(seconds || 0))}초`;
    }

    renderJourneyUpgradeBoard(data) {
        this.clearAnimationTimers();
        if (!this.container) this.createContainer();
        this.container.classList?.add('hunt-pregame-overlay');
        const sealEmoji = { iron: '⛓️', bone: '🦴', small: '🐛', bird: '🐦', fanged: '🐾', flying: '🐉',
            aquatic: '🌊', brute: '🦬', elder: '🌌', temnoceran: '🕷️', cephalopod: '🐙', special: '✨' };
        const sharpnessColor = item => ['purple', 'white', 'blue', 'green', 'yellow', 'orange', 'red']
            .find(color => Number(item?.sharpness?.[color] || 0) > 0) || 'red';
        this.container.innerHTML = `<div class="game-hunt-card game-hunt-pregame-card hunt-journey-upgrade-board">
            <header><small>STAGE ${Number(data.stage)} · FORGE</small><strong>🔨 무기 강화 선택</strong></header>
            <div class="hunt-journey-upgrade-list">${data.party.map((member, memberIndex) => `<section data-upgrade-member="${memberIndex}">
                <b>${this.escapeHTML(member.nickname)}</b><div>${(data.choices[memberIndex] || []).map((item, choiceIndex) =>
                    `<span data-upgrade-choice="${choiceIndex}" data-weapon-seal="${this.escapeHTML(item.seal || 'special')}"><strong>!${choiceIndex + 1}</strong>
                    <i>${sealEmoji[item.seal] || '⚒️'}</i>${this.escapeHTML(item.nameKo || item.name || `R${item.rarity}`)}
                    <small>공격 ${Number(item.raw || 0)} · 회심 ${Number(item.affinity || 0)}%</small>
                    <b class="hunt-upgrade-sharpness" style="--edge:${sharpnessColor(item)}"></b><em>R${Number(item.rarity || 1)}</em></span>`).join('') || '<span>강화 후보 없음</span>'}</div>
            </section>`).join('')}</div>
            <footer><span>헌터별 선택 · 무응답/NPC 자동 추천</span><div class="game-timer">강화 선택 60초 · 전원 선택 시 즉시 확정</div></footer>
        </div>`;
        this.card = this.container.querySelector('.game-hunt-card');
    }

    updateJourneyUpgradeVoteUI(memberIndex, choiceIndex) {
        const row = this.card?.querySelector(`[data-upgrade-member="${memberIndex}"]`);
        row?.querySelectorAll('[data-upgrade-choice]').forEach(item => item.classList.toggle('selected', Number(item.dataset.upgradeChoice) === choiceIndex));
    }

    updateJourneyEventVoteUI(counts = []) {
        counts.forEach((count, index) => {
            const target = this.card?.querySelector(`[data-journey-event-choice="${index}"] em`);
            if (target) target.textContent = String(count);
        });
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

    updateJourneyVoteUI(counts = []) {
        counts.forEach((count, index) => {
            const target = this.card?.querySelector(`[data-journey-choice="${index}"] em`);
            if (target) target.textContent = String(count);
        });
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
                    ${(data.selectedWeapons || []).some(hunter => hunter.isNpc) ? '<span class="hunt-loadout-join-command" id="hunt-loadout-join-command">👤 !참가</span>' : ''}
                    <span>!대검 지원가</span><span>!차액</span><span>!추천</span><span class="hunt-loadout-lock-command">🔒 !잠금 1</span><span class="hunt-loadout-unlock-command">🔓 !해제 1</span><span class="hunt-loadout-reroll">🎲 !리롤 ×2</span><span class="hunt-loadout-ready-command">!준비</span>
                </div>
            </div>`;
        this.card = this.container.querySelector('.game-hunt-card');
        (data.selectedWeapons || []).forEach(hunter => this.updateLoadoutCard(hunter));
    }

    updateLoadoutJoinAvailability(hasNpcSlot) {
        if (!this.card) return;
        const command = this.card.querySelector('#hunt-loadout-join-command');
        if (!hasNpcSlot) command?.remove();
    }

    updateLoadoutCard(hunter) {
        if (!this.card || !hunter) return;
        const card = this.card.querySelector(`#hunt-opt-${hunter.index}`);
        if (!card) return;
        card.classList.toggle('hunt-loadout-ready', Boolean(hunter.loadoutReady));
        card.setAttribute('aria-label', hunter.loadoutReady ? '준비 완료, 장비 변경 잠김' : '장비 선택 중');
        const personality = this.getPersonalityStyle(hunter.personality);
        const perkBubbles = this.renderPerkBubbles(hunter.perks || [], false, hunter.lockedPerkId);
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
            <div class="hunt-loadout-perks">${perkBubbles}</div>
            <div class="hunt-perk-lock-capacity">🔒 ${hunter.lockedPerkId ? 1 : 0}/1</div>`;
    }

    highlightLoadoutChanges(hunterIndex, changes = {}) {
        const card = this.card?.querySelector?.(`#hunt-opt-${hunterIndex}`);
        if (!card) return;
        const targets = [];
        if (changes.weaponChanged) {
            targets.push(card.querySelector('.hunt-loadout-weapon-icon'));
            targets.push(card.querySelector('.hunt-loadout-weapon-name'));
        }
        if (changes.personalityChanged) {
            targets.push(card.querySelector('.hunt-loadout-personality'));
        }
        targets.filter(Boolean).forEach(target => {
            target.classList.remove('hunt-loadout-change-flash');
            void target.offsetWidth;
            target.classList.add('hunt-loadout-change-flash');
            this.animationTimers.timeout(
                () => target.classList.remove('hunt-loadout-change-flash'),
                1450
            );
        });
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
                                <img class="game-hunt-monster-img" src="${this.escapeHTML(this.monsterImagePath(m))}" onerror="this.src='img/monsters/rathalos.png';" style="width:115px; height:115px; border-radius:18px; border:${borderStyle}; box-shadow:${shadowStyle}; background:rgba(0,0,0,0.6);" />
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
                    <img class="game-hunt-monster-img" src="${this.escapeHTML(this.monsterImagePath(selectedMonster))}" onerror="this.src='img/monsters/rathalos.png';" style="width: 260px; height: 260px; filter: drop-shadow(0 15px 30px rgba(0,0,0,0.8)); transition: transform 0.3s ease;" />
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

        const { hpLabelText, selectedMonster, selectedWeapons, showMonsterHp, timeLimit, smallMonsterCount = 0,
            cartLimit = 3, sharedSupply = null } = data;
        // HuntCombatAnimator is owned by the renderer. Keep the live monster on
        // that same owner so anatomy, effect origins, and directional mirroring
        // resolve identically in production and in isolated animation previews.
        this.selectedMonster = selectedMonster;
        this.card.classList.toggle('hunt-shared-supply-mode', Boolean(sharedSupply));
        this.cartLimit = Math.max(3, Number(cartLimit || 3));
        const isSmallSwarm = Number(smallMonsterCount) >= 3;
        const monsterVisuals = isSmallSwarm
            ? `<div class="hunt-small-monster-pack" style="--small-monster-count:${smallMonsterCount}">${Array.from({ length: smallMonsterCount }, (_, index) => `
                <div class="hunt-small-monster-slot" data-small-monster-slot="${index}">
                    <div class="hunt-monster-attack-motion is-small-monster">
                        <div class="hunt-monster-facing-layer">
                            <img class="game-hunt-monster-img hunt-small-monster${index === 0 ? ' is-targeted is-attacking' : ''}" ${index === 0 ? 'id="fight-monster-img"' : ''} data-small-monster-index="${index}" src="${this.escapeHTML(this.monsterImagePath(selectedMonster))}" onerror="this.src='img/monsters/rathalos.png';" />
                        </div>
                    </div>
                    <div class="hunt-small-monster-hp"><i></i></div>
                    <div class="hunt-small-monster-atb" aria-label="${selectedMonster.nameKO} ${index + 1} 행동 게이지"><i></i></div>
                    <b>${index + 1}</b>
                </div>`).join('')}</div>`
            : `<div class="hunt-monster-attack-motion">
                    <div class="hunt-monster-aim-layer">
                        <div class="hunt-monster-facing-layer" data-monster-id="${this.escapeHTML(selectedMonster.id)}">
                            <img class="game-hunt-monster-img" id="fight-monster-img" src="${this.escapeHTML(this.monsterImagePath(selectedMonster))}" onerror="this.src='img/monsters/rathalos.png';" style="width:380px;height:380px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.85));transition:transform .15s ease;position:relative;z-index:2;" />
                            <div class="hunt-monster-eye-glow" aria-hidden="true"></div>
                        </div>
                    </div>
                </div>`;
        const limitSec = timeLimit || 480;
        const initialMin = String(Math.floor(limitSec / 60)).padStart(2, '0');
        const initialSec = String(limitSec % 60).padStart(2, '0');

        this.card.innerHTML = `
            <div id="game-hunt-top-panel" class="hunt-monster-vitals">
                <!-- Monster HP Bar -->
                <div class="game-hunt-monster-hp-container" style="${showMonsterHp ? '' : 'display:none;'}">
                    <div class="game-hunt-monster-hp-wrapper">
                        <div id="monster-hp-fill"></div>
                        <div id="monster-hp-center-text" class="monster-hp-center-text">
                            <span id="monster-state-icon" class="monster-state-icon" hidden></span>
                            <span id="monster-name-text" data-monster-name="${selectedMonster.nameKO}">${selectedMonster.nameKO}</span>
                            <span id="monster-hp-values">(12000 / 12000)</span>
                        </div>
                    </div>
                    ${isSmallSwarm ? '' : `
                        <div class="hunt-monster-atb-track" aria-label="몬스터 행동 게이지">
                            <i id="monster-atb-fill"></i>
                        </div>`}
                </div>
            </div>

            <div class="hunt-monster-aux-rail" aria-label="몬스터 전투 정보">
                ${isSmallSwarm ? '<span></span>' : `
                    <section class="hunt-monster-aux-panel hunt-monster-parts-panel" id="hunt-monster-parts-panel" aria-label="파괴 가능 부위" hidden>
                        <div class="hunt-monster-parts" id="hunt-monster-parts"></div>
                    </section>`}
                <section class="hunt-monster-aux-panel hunt-monster-utility-panel" aria-label="퀘스트 정보">
                    <div class="hunt-monster-corner-hud">
                        <span id="cart-counter-board" class="hunt-monster-hud-chip hunt-cart-chip">🛒 ${this.cartLimit}</span>
                        <span id="battle-timer-label" class="hunt-monster-hud-chip hunt-timer-chip">⏱️ ${initialMin}:${initialSec}</span>
                    </div>
                </section>
            </div>

            <!-- Monster Showcase Area -->
            <div id="monster-showcase-panel" style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                margin: 20px auto 24px;
                position: relative;
                overflow: visible;
                box-sizing: border-box;
            ">
                <div class="hunt-monster-motion-stage" style="
                    width: min(1320px, 82vw);
                    height: 380px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                ">
                    ${monsterVisuals}
                </div>
            </div>

            ${selectedWeapons.some(hunter => hunter.isNpc)
                ? '<div class="hunt-combat-hot-join" id="hunt-combat-hot-join">👤 AI 교대 <strong>!참가</strong></div>' : ''}
            ${sharedSupply ? `<div class="hunt-shared-supply" aria-label="공용 캠프 보급고">
                <b>⛺ 공용 보급</b>
                <span id="shared-potion-count">🧪 ${Number(sharedSupply.potions || 0)}/10</span>
                <span id="shared-trap-count">🪤 ${Number(sharedSupply.shockTraps || 0)}</span>
                <span id="shared-lifepowder-count">💚 ${Number(sharedSupply.lifepowders || 0)}</span>
                <span id="shared-bomb-count">💣 ${Number(sharedSupply.bombs || 0)}</span>
            </div>` : ''}

            <!-- 4 Weapons Grid (Bottom) -->
            <div class="game-hunt-weapons-grid">
                ${selectedWeapons.map(w => `
                <div class="game-hunt-weapon-card ${w.status === 'dead' ? 'dead' : ''}" id="fight-card-${w.index}" style="position:relative; transition: transform 0.15s ease, border-color 0.15s ease; ${w.status === 'dead' ? 'transform: rotate(180deg);' : ''}">
                    <div class="hunt-hunter-heading">
                        <span class="hunt-hunter-personality" aria-label="${this.escapeHTML(this.getPersonalityLabel(w.personality))}">${this.getPersonalityIcon(w.personality)}</span>
                        <span class="hunt-hunter-name" style="color:${SafeContent.cssColor(w.hunterColor, '#eeeeee')}">${SafeContent.escapeHTML(w.hunterName || 'HUNTER')}</span>
                    </div>
                    ${this.renderSharpnessGauge(w, `sharpness-${w.index}`)}
                    <div class="hunt-weapon-special-resource">${this.renderWeaponResourceGlyphs(w)}</div>
                    <div class="game-hunt-weapon-img-container weapon-${w.id} weapon-charge-stage-${Math.min(3, Number(w.id === 'hammer' ? w.hammerChargeLevel : w.greatSwordCharge) || 0)}" id="weapon-img-container-${w.index}" style="--weapon-facing:${Number(w.index) < 2 ? 1 : -1};--great-sword-mirror:${Number(w.index) < 2 ? -1 : 1};position: relative; width: 115px; height: 115px; margin: 0 auto 16px;">
                        ${['sword_shield', 'lance', 'gunlance'].includes(w.id) ? `
                            <img class="game-hunt-weapon-img hunt-split-weapon hunt-split-weapon--${w.id}" src="img/weapons/${w.filename}" alt="" />
                            <img class="hunt-split-shield hunt-split-shield--${w.id}" src="img/weapons/${w.filename}" alt="" />
                        ` : `<img class="game-hunt-weapon-img${w.id === 'charge_blade' && w.shieldChargeDuration > 0 ? ' cb-shield-charged-img' : ''}" src="img/weapons/${w.filename}" style="margin: 0;" />`}
                        <div class="hunter-blight-overlay" id="hunter-blights-${w.index}" aria-label="${this.blightLabel(w.elementalBlights)}">${this.renderHunterBlights(w.elementalBlights)}</div>
                        ${w.id === 'insect_glaive' ? `<img class="ig-kinsect" id="ig-kinsect-${w.index}" src="img/weapons/kinsect.svg" alt="" />` : ''}
                        ${w.id === 'gunlance' ? `
                            <div class="game-hunt-weapon-overlay gunlance-overheat-overlay" id="overheat-overlay-${w.index}" style="background: linear-gradient(180deg, #ff3b30 0%, #ff9500 100%); mask-image: url('img/weapons/gunlance.svg'); -webkit-mask-image: url('img/weapons/gunlance.svg'); opacity: ${w.overheatDuration ? 1 : 0}; clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0px 0px 0px); -webkit-clip-path: inset(${w.overheatDuration ? (30 - w.overheatDuration) / 30 * 100 : 100}% 0px 0px 0px);"></div>
                        ` : ''}
                    </div>
                    <div class="hunt-combat-info">
                    <div class="game-hunt-status-tag-container" style="position: absolute; right: calc(50% + 68px); top: 92px; width: 52px; height: 52px; display: flex; align-items: center; justify-content: flex-end; z-index: 5;">
                        <div class="hunt-horn-buff-rack" id="horn-buffs-${w.index}" aria-label="수렵피리 버프">${this.renderHornBuffBadges(w)}</div>
                    </div>
                    
                    <div class="hunt-atb-row" aria-label="ATB">
                        <div class="hunt-atb-track"><i id="atb-fill-${w.index}" style="width:${Math.max(0, Math.min(100, Number(w.atb || 0)))}%"></i></div>
                    </div>
                    
                    <!-- HP Bar -->
                    <div class="game-hunt-hp-wrapper" style="margin-top: 10px; margin-bottom: 8px;">
                        <div class="game-hunt-hp-fill" id="hp-fill-${w.index}" style="width: ${(w.hp / w.maxHp) * 100}%; background: ${(w.hp / w.maxHp) * 100 > 50 ? '#2eff7b' : ((w.hp / w.maxHp) * 100 > 20 ? '#ff9500' : '#ff3b30')};"></div>
                        <div class="game-hunt-hp-text" id="hp-text-${w.index}">${w.hp} / ${w.maxHp}</div>
                    </div>

                    <div class="hunt-item-list" id="personality-tag-${w.index}">
                        <span id="potion-count-${w.index}">🧪 ${w.potions}</span>
                        <span id="trap-count-${w.index}">🪤 ${Number(w.shockTraps || 0)}</span>
                        <span id="lifepowder-count-${w.index}">💚 ${Number(w.lifepowders || 0)}</span>
                        <span id="bomb-count-${w.index}">💣 ${Number(w.bombs || 0)}</span>
                        <span id="flash-count-${w.index}">✨ ${Number(w.flashPods || 0)}</span>
                    </div>
                    <div class="hunt-combat-perks">${this.renderPerkBubbles(w.perks || [], true, w.lockedPerkId)}</div>
 
                    <div class="game-hunt-weapon-name" style="font-size: 2.5rem; font-weight: bold; color:${SafeContent.cssColor(w.hunterColor, '#c98534')}; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px; margin-bottom: 6px;">
                        ${SafeContent.escapeHTML(w.weaponDisplayName || w.name)}
                    </div>
                    <div class="hunt-hunter-probabilities" id="hunter-probabilities-${w.index}" aria-label="헌터 전투 확률">${this.renderHunterProbabilityBadges(w)}</div>
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

            fill.style.background = this.hunterHpBarBackground(w, pct);
        }
    }

    updateCombatHunterIdentity(hunter, hasNpcSlot = true) {
        if (!this.card || !hunter) return;
        const card = this.card.querySelector(`#fight-card-${hunter.index}`);
        const name = card?.querySelector('.hunt-hunter-name');
        if (name) {
            name.textContent = hunter.hunterName || 'HUNTER';
            name.style.color = this.safeColor(hunter.hunterColor, '#eeeeee');
        }
        if (card) {
            card.classList.remove('hunt-hot-joined');
            void card.offsetWidth;
            card.classList.add('hunt-hot-joined');
            this.animationTimers.timeout(() => card.classList.remove('hunt-hot-joined'), 1400);
        }
        if (!hasNpcSlot) this.card.querySelector('#hunt-combat-hot-join')?.remove();
    }

    hunterHpBarBackground(w = {}, pct = 100) {
        const blights = w.elementalBlights || {};
        if (Number(blights.poison || 0) > 0) return 'linear-gradient(90deg, #55206f, #b84de0 68%, #efb6ff)';
        if (Number(blights.fire || 0) > 0) return 'linear-gradient(90deg, #9e1c00, #ff5426 65%, #ffb13b)';
        if (w.environmentDotType === 'effluvium') return 'linear-gradient(90deg, #31410d, #799b26 65%, #bfdc55)';
        if (pct <= 25) return '#ff3b30';
        if (pct <= 55) return '#ffcc00';
        return '#2eff7b';
    }

    hunterAtbBarBackground(w = {}, interrupted = false) {
        if (interrupted) return '#7f8c8d';
        const blights = w.elementalBlights || {};
        if (Number(blights.ice || 0) > 0) return 'linear-gradient(90deg, #4ba7d1, #b9efff 72%, #ffffff)';
        if (Number(blights.water || 0) > 0) return 'linear-gradient(90deg, #075fb8, #28a9ff 72%, #9de6ff)';
        return 'linear-gradient(90deg, #d99b00, #ffd84d 72%, #fff2a3)';
    }

    updateMonsterHpUI(hp, maxHp) {
        if (!this.card) return;
        const fill = this.card.querySelector('#monster-hp-fill');
        const values = this.card.querySelector('#monster-hp-values');
        if (fill) fill.style.width = `${(hp / maxHp) * 100}%`;
        if (values) values.textContent = `(${hp} / ${maxHp})`;
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
            tail.innerHTML = '<img src="local_assets/monster_hunter/ui/rathalos-tail-item-transparent.png" alt="" /><b></b>';
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
        const fill = this.card.querySelector(`#atb-fill-${idx}`);
        if (fill) {
            fill.style.width = `${Math.max(0, Math.min(100, Number(atb || 0)))}%`;

            // Check if the hunter is fainted, stunned, roar-stunned, or in hit recovery (interrupted)
            const isInterrupted = w && (w.status === 'dead' || w.status === 'stunned' || w.roarStunned || (w.hitDuration && w.hitDuration > 0));
            fill.style.background = this.hunterAtbBarBackground(w, isInterrupted);
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
            dual_blades: () => bar('鬼', w.archdemonGauge, null, 'demon'),
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
        const hpFill = this.card?.querySelector(`#hp-fill-${idx}`);
        if (hpFill) {
            const pct = Math.max(0, Math.min(100, Number.parseFloat(hpFill.style.width) || 100));
            hpFill.style.background = this.hunterHpBarBackground({ elementalBlights: blights }, pct);
        }
        const atbFill = this.card?.querySelector(`#atb-fill-${idx}`);
        if (atbFill) atbFill.style.background = this.hunterAtbBarBackground({ elementalBlights: blights });
    }

    updateWeaponChargeAuraUI(idx, w) {
        if (!['great_sword', 'hammer'].includes(w?.id)) return;
        const container = this.card?.querySelector(`#weapon-img-container-${idx}`);
        if (!container) return;
        const mechanicLevel = Number(w.id === 'hammer' ? w.hammerChargeLevel : w.greatSwordCharge) || 0;
        const releaseLevel = Number(container.dataset?.weaponChargeReleaseStage || 0);
        const level = Math.min(3, Math.max(0, releaseLevel || mechanicLevel));
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
            dual_blades: () => `${w.demonMode ? '귀인화' : '평상'} · 붉은 귀인 게이지 ${pct(w.archdemonGauge)}%`,
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
        const visibleAtb = Math.max(0, Math.min(100, Number(atb || 0)));
        if (fill) fill.style.width = `${visibleAtb}%`;
    }

    updateMonsterFlightUI(airborne, progress = 0, damage = 0, threshold = 0, remainingTicks = 0) {
        const monsterImg = this.card?.querySelector('#fight-monster-img');
        if (monsterImg) monsterImg.classList.toggle('monster-airborne', Boolean(airborne));
        const stage = this.card?.querySelector('.hunt-monster-motion-stage');
        if (stage) stage.classList.toggle('monster-flight-stage-airborne', Boolean(airborne));
    }

    updateMonsterTraitVisual(traits = []) {
        const monsterImg = this.card?.querySelector('#fight-monster-img');
        if (!monsterImg) return;
        const known = [
            'monster-trait-inflated',
            'monster-trait-rage-eyes',
            'monster-trait-ice-coated',
            'monster-trait-hellfire',
            'monster-trait-scale-heated',
            'monster-trait-scale-critical'
        ];
        known.forEach(className => monsterImg.classList.remove(className));
        (traits || []).forEach(trait => monsterImg.classList.add(`monster-trait-${trait}`));
    }

    triggerMonsterTraitReaction(kind, durationTicks = 20) {
        const monsterImg = this.card?.querySelector('#fight-monster-img');
        if (!monsterImg) return;
        const className = kind === 'fatigue-stumble'
            ? 'monster-trait-fatigue-stumble'
            : 'monster-trait-limb-slip';
        monsterImg.classList.remove(className);
        void monsterImg.offsetWidth;
        monsterImg.classList.add(className);
        this.animationTimers.timeout(
            () => monsterImg.classList.remove(className),
            Math.max(700, Number(durationTicks || 1) * 100)
        );
    }

    updateMonsterPartsUI(parts = []) {
        const host = this.card?.querySelector('#hunt-monster-parts');
        if (!host || typeof document === 'undefined') return;
        const panel = this.card?.querySelector('#hunt-monster-parts-panel');
        host.replaceChildren();
        (parts || []).forEach(part => {
            const slot = document.createElement('span');
            slot.className = `hunt-monster-part hunt-monster-part--${part.kind || 'part'}`;
            if (part.broken) slot.classList.add('is-broken');
            if (part.severed) slot.classList.add('is-severed');
            slot.dataset.partId = String(part.id || '');
            const material = typeof HuntMonsterPartMaterialCatalog !== 'undefined'
                ? HuntMonsterPartMaterialCatalog.resolve(this.selectedMonster, part)
                : null;
            const materialLabel = material?.label || `${part.kind || '부위'} 소재`;
            const shortLabel = String(part.shortLabel || part.kind || '부위').slice(0, 3);
            slot.setAttribute('aria-label', `${shortLabel}${part.broken ? ' 파괴' : ''}`);
            slot.title = materialLabel;
            const icon = document.createElement('img');
            icon.className = 'hunt-monster-part-image';
            icon.src = material?.path || '';
            icon.alt = '';
            icon.dataset.materialSourceId = material?.sourceId || '';
            icon.dataset.materialShape = material?.shapeFamily || '';
            icon.style.setProperty('--hunt-part-tint', material?.tint || 'none');
            const art = document.createElement('span');
            art.className = 'hunt-monster-part-art';
            art.style.setProperty('--hunt-part-mask', `url("${material?.path || ''}")`);
            art.style.setProperty('--hunt-part-base', material?.palette?.base || '#8e9298');
            art.style.setProperty('--hunt-part-highlight', material?.palette?.highlight || '#e8edf2');
            art.style.setProperty('--hunt-part-shadow', material?.palette?.shadow || '#3f444a');
            art.style.setProperty('--hunt-part-glow', material?.palette?.glow || '#b9c1ca');
            slot.dataset.materialKind = material?.kind || '';
            slot.dataset.materialSide = material?.side || 'center';
            art.appendChild(icon);
            slot.appendChild(art);
            const caption = document.createElement('small');
            caption.className = 'hunt-monster-part-label';
            caption.textContent = shortLabel;
            slot.appendChild(caption);
            host.appendChild(slot);
        });
        const isEmpty = !host.childElementCount;
        host.hidden = isEmpty;
        if (panel) panel.hidden = isEmpty;
    }

    updateMonsterStateUI(stateName, title, colorInfo) {
        if (!this.card) return;
        const statusIcon = this.card.querySelector('#monster-state-icon');
        const hpCenterText = this.card.querySelector('#monster-hp-center-text');
        const monsterImg = this.card.querySelector('#fight-monster-img');
        const state = String(stateName || '');
        const icon = state.includes('일반') ? ''
            : state.includes('분노') ? '😡'
                : state.includes('탈진') ? '🤤'
                    : state.includes('격추') ? '💥'
                    : state.includes('낙석') ? '🪨'
                        : state.includes('섬광') ? '✨'
                            : state.includes('마비') && !state.includes('마비함정') ? '⚡'
                                : state.includes('수면') ? '💤'
                                : state.includes('마비함정') ? '⚡'
                                    : state.includes('함정') ? '🕸️'
                                        : state.includes('기절') ? '💫'
                                            : state.includes('대경직') ? '💤'
                                                : state.includes('고고도') ? '🚀'
                                                    : state.includes('비행') ? '🪽'
                                                        : state.includes('시동') ? '⚡'
                                                            : '❗';

        if (statusIcon) {
            statusIcon.textContent = icon;
            statusIcon.hidden = !icon;
            statusIcon.setAttribute('aria-label', icon ? stateName : '');
        }

        if (hpCenterText) hpCenterText.style.color = '';

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

            monsterImg.classList.toggle('monster-paralyzed', stateName.includes('마비') && !stateName.includes('마비함정'));
            monsterImg.classList.toggle('monster-sleeping', stateName.includes('수면'));

            if (stateName.includes('비행')) {
                monsterImg.classList.add('valstrax-flying');
            } else {
                monsterImg.classList.remove('valstrax-flying');
            }

            if (stateName.includes('대경직') || stateName.includes('함정')) {
                const authoredPartReaction = monsterImg.classList.contains('monster-tail-sever-roll')
                    || monsterImg.classList.contains('monster-part-break-topple');
                monsterImg.classList.toggle('monster-knockdown-anim', !authoredPartReaction);
            } else {
                monsterImg.classList.remove('monster-knockdown-anim');
            }

            if (!stateName.includes('구멍함정')) {
                monsterImg.classList.remove('monster-pitfall-caught', 'monster-pitfall-struggling');
            }
        }
    }

    updatePotionCountUI(idx, count) {
        if (!this.card) return;
        this.updateSharedPotionUI(count);
        const el = this.card.querySelector(`#potion-count-${idx}`);
        if (el) el.textContent = `🧪 ${count}`;
    }

    updateSharedPotionUI(count) {
        if (!this.card) return;
        const sharedPotion = this.card.querySelector('#shared-potion-count');
        if (sharedPotion) sharedPotion.textContent = `🧪 ${Number(count || 0)}/10`;
    }

    updateHunterItemUI(hunter) {
        if (!this.card || !hunter) return;
        const potion = this.card.querySelector(`#potion-count-${hunter.index}`);
        const trap = this.card.querySelector(`#trap-count-${hunter.index}`);
        const powder = this.card.querySelector(`#lifepowder-count-${hunter.index}`);
        const bomb = this.card.querySelector(`#bomb-count-${hunter.index}`);
        const flash = this.card.querySelector(`#flash-count-${hunter.index}`);
        if (potion) potion.textContent = `🧪 ${Number(hunter.potions || 0)}`;
        if (trap) trap.textContent = `🪤 ${Number(hunter.shockTraps || 0)}`;
        if (powder) powder.textContent = `💚 ${Number(hunter.lifepowders || 0)}`;
        if (bomb) bomb.textContent = `💣 ${Number(hunter.bombs || 0)}`;
        if (flash) flash.textContent = `✨ ${Number(hunter.flashPods || 0)}`;
        const sharedPotion = this.card?.querySelector('#shared-potion-count');
        const sharedTrap = this.card?.querySelector('#shared-trap-count');
        const sharedPowder = this.card?.querySelector('#shared-lifepowder-count');
        const sharedBomb = this.card?.querySelector('#shared-bomb-count');
        if (sharedPotion) sharedPotion.textContent = `🧪 ${Number(hunter.potions || 0)}/10`;
        if (sharedTrap) sharedTrap.textContent = `🪤 ${Number(hunter.shockTraps || 0)}`;
        if (sharedPowder) sharedPowder.textContent = `💚 ${Number(hunter.lifepowders || 0)}`;
        if (sharedBomb) sharedBomb.textContent = `💣 ${Number(hunter.bombs || 0)}`;
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
            el.textContent = `🛒 ${Math.max(0, this.cartLimit - carts)}`;
            el.hidden = false;
            el.setAttribute('aria-label', `수레 ${carts}/${this.cartLimit}`);
        }
    }

    updateTimerUI(timeSec) {
        if (!this.card) return;
        const min = String(Math.floor(timeSec / 60)).padStart(2, '0');
        const sec = String(timeSec % 60).padStart(2, '0');
        const timerLbl = this.card.querySelector('#battle-timer-label');
        if (timerLbl) timerLbl.textContent = `⏱️ ${min}:${sec}`;
    }

    showSkillBubble(idxOrMonster, text) { return this.combatAnimator.showSkillBubble(idxOrMonster, text); }

    triggerMonsterRoar() { return this.combatAnimator.triggerMonsterRoar(); }

    triggerMonsterCharge() { return this.combatAnimator.triggerMonsterCharge(); }

    triggerMonsterAttack(type, emoji, targets, attackName = '', pattern = null) { return this.combatAnimator.triggerMonsterAttack(type, emoji, targets, attackName, pattern); }
    resolveMonsterImpactTimeline(pattern, targetIndices) { return this.combatAnimator.resolveMonsterImpactTimeline(pattern, targetIndices); }
    getMonsterMotionTrace() { return this.combatAnimator.getMonsterMotionTrace(); }
    triggerValstraxAmbushWarning() { return this.combatAnimator.triggerValstraxAmbushWarning(); }

    triggerHitAnimation(idx, w, reaction) { return this.combatAnimator.triggerHitAnimation(idx, w, reaction); }
    cancelHitAnimation(idx) { return this.combatAnimator.cancelHitAnimation(idx); }

    triggerRollAnimation(idx) { return this.combatAnimator.triggerRollAnimation(idx); }

    triggerInvincibleJump(idx, active) { return this.combatAnimator.triggerInvincibleJump(idx, active); }

    triggerStunUI(idx, isStunned) { return this.combatAnimator.triggerStunUI(idx, isStunned); }

    triggerDeathTag(idx, w, timerVal = 5) { return this.combatAnimator.triggerDeathTag(idx, w, timerVal); }

    triggerMonsterKnockdownAnim() { return this.combatAnimator.triggerMonsterKnockdownAnim(); }
    triggerMonsterPartBreakReaction(kind, durationTicks, partKind) {
        return this.combatAnimator.triggerMonsterPartBreakReaction(kind, durationTicks, partKind);
    }

    triggerEnvironmentEffect(kind, hunterIndex = null, details = null) {
        return this.combatAnimator.triggerEnvironmentEffect(kind, hunterIndex, details);
    }

    restoreBorder(wIndex, w) { return this.combatAnimator.restoreBorder(wIndex, w); }

    shakeWeapon(idx, w, borderClr = '#ff3b30', isAttack = false, actionOrName = null, isDodge = false) {
        return this.combatAnimator.shakeWeapon(idx, w, borderClr, isAttack, actionOrName, isDodge);
    }

    shakeMonster() { return this.combatAnimator.shakeMonster(); }

    triggerRoarStun(idx, isStunned) { return this.combatAnimator.triggerRoarStun(idx, isStunned); }

    spawnVictoryEmoji(idx, emoji, options) { return this.combatAnimator.spawnVictoryEmoji(idx, emoji, options); }

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
