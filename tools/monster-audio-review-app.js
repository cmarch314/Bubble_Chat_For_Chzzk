'use strict';

(function startMonsterAudioReview() {
    const $ = selector => document.querySelector(selector);
    const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
    const api = async (url, options) => {
        const response = await fetch(url, options);
        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch { throw new Error(`${response.status} ${text || 'Invalid JSON'}`); }
        if (!response.ok) throw new Error(result.error || `${response.status} ${response.statusText}`);
        return result;
    };
    const SOURCE_PREFERENCE_PREFIX = 'bubblechat.monsterAudioReview.sources.';
    const preferenceBridgeMode = new URLSearchParams(location.search).get('preferenceBridge') === '1';
    if (preferenceBridgeMode) {
        addEventListener('message', event => {
            if (event.data?.type !== 'bubblechat:source-preferences-request') return;
            const entries = {};
            for (let index = 0; index < localStorage.length; index++) {
                const key = localStorage.key(index);
                if (key?.startsWith(SOURCE_PREFERENCE_PREFIX)) entries[key] = localStorage.getItem(key);
            }
            event.source?.postMessage({ type: 'bubblechat:source-preferences-response', entries }, event.origin);
        });
        parent.postMessage({ type: 'bubblechat:source-preferences-ready' }, '*');
        return;
    }
    const app = {
        monster: '', huntId: '', candidateId: '', monsters: [], categories: [], groups: [], commonGroups: [], presets: {}, patterns: [],
        partReactions: [], systemAudioPattern: null,
        selectedPatternId: '', selectedSlot: '', selectedJudgmentId: '', selectedProjectileEventId: '', anatomy: true, sourceQueue: [], previewTimers: [],
        previewAudios: [], previewAudioSchedule: [], capabilities: [], buildId: '', session: MonsterAudioReviewState.createEditorSession(),
        pickerCategory: '', pickerStatus: 'all', previewReady: false, previewSequence: 0,
        previewRandomPairTarget: '',
        previewActionSeed: 1,
        sourceRowsByPath: new Map(), sourceGroupViews: [], sourceRenderLimit: 80,
        hiddenSourcePaths: new Set(), temporarilyRevealedSources: new Set(),
        hiddenSourceGroups: new Set(), favoriteSourceGroups: new Set(), autoFavoriteSourceGroups: new Set(),
        showHiddenSources: false, linkedSourcesFirst: false, sourceFocusPath: '', routeClipboard: null,
        // Some embedded Chromium builds drop custom DataTransfer MIME values
        // between panels. Keep the active payload locally as the authoritative
        // fallback so native drag-and-drop remains usable in the review app.
        dragPayload: null,
        routeLastRandomLayer: new Map(),
        revisions: { audio: '', motion: '', anatomy: '' }, playbackState: 'stopped',
        playbackStartedAt: 0, playbackElapsedMs: 0, playbackDurationMs: 0, playbackDurationTicks: 0,
        playbackFrame: 0, playbackTimeline: null, playbackBeatId: '',
        simulationMode: false, simulationState: 'pattern', simulationPollTimer: null,
    };
    const audio = $('#audio');
    const selectedPattern = () => app.patterns.find(pattern => pattern.id === app.selectedPatternId) || null;
    const adjacentPreviewTargets = Object.freeze(['pair:0,1', 'pair:1,2', 'pair:2,3']);
    function previewTargetMode({ newAction = false } = {}) {
        const selected = String($('#previewTarget')?.value || 'auto');
        if (selected !== 'pair:random-adjacent') {
            app.previewRandomPairTarget = '';
            return selected;
        }
        if (newAction || !adjacentPreviewTargets.includes(app.previewRandomPairTarget)) {
            app.previewRandomPairTarget = adjacentPreviewTargets[Math.floor(Math.random() * adjacentPreviewTargets.length)];
        }
        return app.previewRandomPairTarget;
    }
    const selectedSlot = () => selectedPattern()?.slots.find(slot => slot.slot === app.selectedSlot) || null;
    const routeFiles = route => (route?.layers || []).map(layer => Array.isArray(layer) ? layer[0] : layer).filter(Boolean);
    const fileName = file => String(file || '').split('/').pop();
    const beginRouteDrag = (event, payload, effect = 'copy') => {
        app.dragPayload = payload;
        const encoded = JSON.stringify(payload);
        const transfer = event.dataTransfer;
        if (!transfer) return;
        transfer.effectAllowed = effect;
        // text/plain is deliberately retained for WebView hosts which reject
        // application/json on drops across independently rendered panels.
        transfer.setData('application/json', encoded);
        transfer.setData('text/plain', encoded);
    };
    const droppedRoutePayload = event => {
        const transfer = event.dataTransfer;
        for (const type of ['application/json', 'text/plain']) {
            const raw = transfer?.getData(type);
            if (!raw) continue;
            try { return JSON.parse(raw); } catch { /* use the local fallback */ }
        }
        return app.dragPayload;
    };
    const finishRouteDrag = () => { app.dragPayload = null; };
    const allSlots = () => app.patterns.flatMap(pattern => pattern.slots || []);
    const syncInheritedReactionAudio = () => {
        const source = app.patterns.find(pattern => pattern.id === '__reaction.knockdown');
        const stun = app.patterns.find(pattern => pattern.id === '__reaction.stun');
        if (!source || !stun) return;
        const sourceSlots = new Map((source.slots || []).map(slot => [slot.slot, slot]));
        stun.slots = (stun.slots || []).map(slot => {
            const inherited = sourceSlots.get(slot.slot);
            return inherited ? { ...slot,
                current: inherited.current, override: inherited.override,
                assigned: inherited.assigned, effective: inherited.effective,
                muted: inherited.muted, inheritedFrom: '__reaction.knockdown' } : slot;
        });
    };
    const previewFrame = () => $('#patternPreviewFrame');
    const previewOrigin = () => location.origin;
    const sourcePreferenceKey = monster => `bubblechat.monsterAudioReview.sources.${monster}`;
    const sourceGroupKey = group => `${group.bank}\u0000${group.eventId}`;
    // These six were reviewed before the BEAT rebuild.  Their routes are the
    // useful evidence while their actions are being rebuilt, so surface every
    // still-linked source group without mutating a reviewer's own favorites.
    const AUTO_FAVORITE_MAPPED_MONSTERS = new Set(['rathian', 'rathalos', 'bazelgeuse', 'tigrex', 'barioth', 'legiana']);
    const sourceGroupIsFavorite = groupKey => app.favoriteSourceGroups.has(groupKey) || app.autoFavoriteSourceGroups.has(groupKey);

    function loadSourcePreferences() {
        let stored = {};
        try { stored = JSON.parse(localStorage.getItem(sourcePreferenceKey(app.monster)) || '{}'); } catch { stored = {}; }
        app.hiddenSourcePaths = new Set(Array.isArray(stored.hidden) ? stored.hidden : []);
        app.hiddenSourceGroups = new Set(Array.isArray(stored.hiddenGroups) ? stored.hiddenGroups : []);
        app.favoriteSourceGroups = new Set(Array.isArray(stored.favoriteGroups) ? stored.favoriteGroups : []);
        app.showHiddenSources = Boolean(stored.showHidden);
        app.linkedSourcesFirst = Boolean(stored.linkedFirst);
        app.temporarilyRevealedSources.clear(); app.sourceFocusPath = '';
        syncSourceToolbar();
    }

    function saveSourcePreferences() {
        localStorage.setItem(sourcePreferenceKey(app.monster), JSON.stringify({
            hidden: [...app.hiddenSourcePaths],
            hiddenGroups: [...app.hiddenSourceGroups],
            favoriteGroups: [...app.favoriteSourceGroups],
            showHidden: app.showHiddenSources,
            linkedFirst: app.linkedSourcesFirst
        }));
    }

    function mergeLegacySourcePreferences(entries = {}) {
        let changed = false;
        for (const [key, raw] of Object.entries(entries)) {
            if (!key.startsWith(SOURCE_PREFERENCE_PREFIX) || !raw) continue;
            let incoming = {}, current = {};
            try { incoming = JSON.parse(raw) || {}; } catch { continue; }
            try { current = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { current = {}; }
            const merged = {
                hidden: [...new Set([...(current.hidden || []), ...(incoming.hidden || [])])],
                hiddenGroups: [...new Set([...(current.hiddenGroups || []), ...(incoming.hiddenGroups || [])])],
                favoriteGroups: [...new Set([...(current.favoriteGroups || []), ...(incoming.favoriteGroups || [])])],
                showHidden: Boolean(current.showHidden || incoming.showHidden),
                linkedFirst: Boolean(current.linkedFirst || incoming.linkedFirst)
            };
            if (JSON.stringify(current) !== JSON.stringify(merged)) {
                localStorage.setItem(key, JSON.stringify(merged)); changed = true;
            }
        }
        return changed;
    }

    async function migrateLegacyPortPreferences() {
        if (location.hostname !== '127.0.0.1' && location.hostname !== 'localhost') return;
        const legacyPorts = ['17930', '17931', '17947'].filter(port => port !== location.port);
        await Promise.all(legacyPorts.map(port => new Promise(resolve => {
            const origin = `${location.protocol}//${location.hostname}:${port}`;
            const frame = document.createElement('iframe');
            frame.hidden = true; frame.setAttribute('aria-hidden', 'true');
            let settled = false;
            const finish = () => {
                if (settled) return; settled = true;
                removeEventListener('message', onMessage); frame.remove(); resolve();
            };
            const onMessage = event => {
                if (event.origin !== origin || event.source !== frame.contentWindow) return;
                if (event.data?.type === 'bubblechat:source-preferences-ready') {
                    frame.contentWindow.postMessage({ type: 'bubblechat:source-preferences-request' }, origin);
                } else if (event.data?.type === 'bubblechat:source-preferences-response') {
                    mergeLegacySourcePreferences(event.data.entries); finish();
                }
            };
            addEventListener('message', onMessage);
            frame.src = `${origin}/?preferenceBridge=1`;
            document.body.appendChild(frame);
            setTimeout(finish, 1200);
        })));
    }

    function sourceMappingIndex() {
        const index = new Map();
        const patterns = [...app.patterns, app.systemAudioPattern].filter(Boolean);
        for (const pattern of patterns) for (const slot of pattern.slots || []) {
            for (const path of routeFiles(slot.effective)) {
                if (!index.has(path)) index.set(path, []);
                index.get(path).push({ patternId: pattern.id, patternName: pattern.name,
                    slotId: slot.slot, slotLabel: slot.label });
            }
        }
        return index;
    }

    function syncSourceToolbar() {
        const visibility = $('#sourceVisibilityToggle'), linked = $('#linkedFirstToggle');
        if (visibility) {
            visibility.classList.toggle('active', app.showHiddenSources);
            visibility.setAttribute('aria-pressed', app.showHiddenSources ? 'true' : 'false');
            visibility.textContent = `👁 모두 보임 ${app.showHiddenSources ? '켬' : '끔'}`;
        }
        if (linked) {
            linked.classList.toggle('active', app.linkedSourcesFirst);
            linked.setAttribute('aria-pressed', app.linkedSourcesFirst ? 'true' : 'false');
            linked.textContent = `🔗 연결 우선 ${app.linkedSourcesFirst ? '켬' : '끔'}`;
        }
    }

    class PreviewBridge {
        constructor(frame) {
            this.frame = frame;
            this.ready = false;
            this.pending = null;
            this.revision = 0;
        }
        send(type, payload = {}) {
            const message = { type, editorRevision: ++this.revision, ...payload };
            if (!this.ready) { this.pending = message; return; }
            this.frame.contentWindow?.postMessage(message, previewOrigin());
        }
        markReady() {
            this.ready = true;
            if (this.pending) { const pending = this.pending; this.pending = null; this.send(pending.type, pending); }
        }
        reset() {
            this.ready = false;
            this.pending = null;
        }
    }
    const bridge = new PreviewBridge(previewFrame());

    function stopPreviewAudio() {
        for (const timer of app.previewTimers) clearTimeout(timer);
        for (const clip of app.previewAudios) { clip.pause(); clip.removeAttribute('src'); }
        app.previewTimers = [];
        app.previewAudios = [];
        app.previewAudioSchedule = [];
    }

    function resetAudioClock(button = app.playingButton) {
        if (!button) return; button.classList.remove('playing', 'audio-clock'); button.style.removeProperty('--audio-progress');
        if (button === app.playingButton) app.playingButton = null;
    }

    function trackAudioClock(clip, button) {
        if (!button) return; resetAudioClock(); app.playingButton = button; button.classList.add('playing', 'audio-clock');
        button.style.setProperty('--audio-progress', '0%');
        clip.addEventListener('timeupdate', () => { if (Number.isFinite(clip.duration) && clip.duration > 0) button.style.setProperty('--audio-progress', `${Math.min(100, clip.currentTime / clip.duration * 100)}%`); });
        clip.addEventListener('ended', () => resetAudioClock(button), { once: true });
    }

    function playRoute(route, label, button = null) {
        if (!route?.layers?.length) return;
        let layers = route.layers;
        if (route.mode === 'random' && route.layers.length > 1) {
            const stableKey = `${label}|${route.layers.map(layer => Array.isArray(layer) ? layer[0] : layer).join('|')}`;
            const previous = app.routeLastRandomLayer.get(stableKey);
            const candidates = route.layers.filter((_, index) => index !== previous);
            const picked = candidates[Math.floor(Math.random() * candidates.length)] || route.layers[0];
            app.routeLastRandomLayer.set(stableKey, route.layers.indexOf(picked));
            layers = [picked];
        }
        for (const [index, layer] of layers.entries()) {
            const file = Array.isArray(layer) ? layer[0] : layer;
            if (!file) continue;
            const clip = new Audio(`/audio?path=${encodeURIComponent(file)}`);
            clip.volume = Math.max(0, Math.min(1, Number(Array.isArray(layer) ? layer[1] : .7) || .7));
            app.previewAudios.push(clip);
            if (index === 0) trackAudioClock(clip, button);
            clip.play().catch(() => {});
            $('#nowTitle').textContent = `미리보기 · ${label}`;
            $('#nowMeta').textContent = fileName(file);
        }
    }

    function previewSlotsForBeat(pattern, beat) {
        const ids = MonsterAudioReviewState.slotIdsForBeat(beat);
        return ids.map(id => pattern.slots.find(slot => slot.slot === id)).filter(Boolean);
    }

    function buildPreviewPattern({ scrub = false } = {}) {
        const pattern = selectedPattern(), snapshot = app.session.snapshot();
        if (!pattern) return null;
        const scrubProgress = scrub
            ? snapshot.scrub.tick / Math.max(1, snapshot.timeline.durationTicks)
            : 0;
        const motionPayload = MonsterAudioReviewState.buildPreviewMotion(
            pattern, snapshot.timeline, app.session.draft);
        const preview = {
            ...pattern,
            animationDurationMs: snapshot.timeline.durationTicks * 100,
            movement: { ...(pattern.movement || {}), ticks: snapshot.timeline.durationTicks },
            runtimePreviewScrub: scrub,
            // `HuntMonsterAttackAnimator.seekBeatMotion` consumes a 0..1
            // progress value, never an absolute tick.  Keep this on the
            // pattern too so the first frozen frame is correct even before
            // the iframe handles its follow-up seek message.
            runtimePreviewProgress: scrubProgress,
            runtimePreviewCardReactions: true,
            // The review shell owns its audible timeline so slot clocks, drag
            // assignments and playback all describe the same source.  Keep the
            // embedded hunt renderer visual-only; otherwise its legacy phase
            // audio and BEAT audio are both heard on top of this timeline.
            runtimePreviewMuteAudio: true
        };
        if (motionPayload.useBeatMotion) preview.motion = motionPayload.motion;
        if (motionPayload.beatV2) preview.beatV2 = motionPayload.beatV2;
        else {
            preview.motion = null;
            preview.runtimeTimingBeats = motionPayload.runtimeTimingBeats;
        }
        return preview;
    }

    function sendPreview({ scrub = false, play = false, reset = false, resetOnly = false } = {}) {
        if (app.simulationMode) return;
        const pattern = selectedPattern(), monster = app.monsters.find(item => item.id === app.monster);
        if (!pattern) return;
        const snapshot = app.session.snapshot();
        const playbackToken = play ? ++app.previewSequence : 0;
        if (play) app.previewActionSeed = Math.max(1,
            Math.floor(Math.random() * 0xFFFFFFFF));
        // A transform edit is a scrub only.  It must never leave an auxiliary
        // beat-only playback timer alive: that timer could pause a subsequent
        // full-pattern replay and make the visible rotation look fixed.
        if (!play) stopPlaybackProgress();
        bridge.send('bubblechat:pattern-preview', {
            monsterId: app.huntId,
            monster: { id: app.huntId, nameKO: monster?.name || app.huntId, filename: `${app.huntId}.png` },
            target: previewTargetMode({ newAction: play }),
            state: snapshot.scenario.monsterState,
            // The iframe may receive a seek message before it has installed
            // the new BEAT controller.  Carry the scrub position with the
            // pattern itself so an inspector edit always opens on the exact
            // authored frame (including signed rotation direction).
            scenario: { ...snapshot.scenario, seed: app.previewActionSeed,
                scrubProgress: scrub
                    ? snapshot.scrub.tick / Math.max(1, snapshot.timeline.durationTicks)
                    : 0,
                selectedBeatId: snapshot.selection.beatId,
                editBeat: { ...(snapshot.draft[snapshot.selection.beatId] || {}) } },
            pattern: buildPreviewPattern({ scrub }),
            resetPreviewPose: Boolean(reset),
            resetOnly: Boolean(resetOnly),
            playbackToken
        });
        if (play) playTimelineAudio();
    }

    function syncPreviewSettings() {
        if (app.simulationMode) return;
        const snapshot = app.session.snapshot();
        bridge.send('bubblechat:pattern-preview-settings', {
            target: previewTargetMode(),
            state: snapshot.scenario.monsterState,
            scenario: { ...snapshot.scenario, selectedBeatId: snapshot.selection.beatId,
                editBeat: { ...(snapshot.draft[snapshot.selection.beatId] || {}) } }
        });
    }

    function simulationWindow() {
        return previewFrame()?.contentWindow || null;
    }

    function simulationApp() {
        return simulationWindow()?.__bubbleChatSimulationApp || null;
    }

    function simulationGame() {
        return simulationApp()?.visuals?.activeGame || null;
    }

    function simulationRuntime() {
        const game = simulationGame();
        return game?.combatRuntime || game?.instance?.combatRuntime || null;
    }

    function setSimulationUi(state, message = '') {
        app.simulationState = state;
        const active = app.simulationMode;
        $('.combat-preview')?.classList.toggle('simulation-active', active);
        const start = $('#simulationStart'), pause = $('#simulationPause');
        const speed = $('#simulationSpeed'), reset = $('#simulationReset'), status = $('#simulationStatus');
        if (start) {
            start.classList.toggle('active', active);
            start.textContent = active ? '패턴 편집으로' : '⚔ 실전 시작';
            start.disabled = state === 'loading';
        }
        if (pause) {
            pause.disabled = state !== 'running' && state !== 'paused';
            pause.textContent = state === 'paused' ? '▶' : 'Ⅱ';
            pause.title = state === 'paused' ? '계속' : '일시정지';
        }
        if (speed) speed.disabled = state !== 'running' && state !== 'paused';
        if (reset) reset.disabled = !active || state === 'loading';
        if (status) {
            status.className = `simulation-status ${state}`;
            status.textContent = message || ({ pattern: '패턴 모드', loading: '전투 준비…', running: '실전 진행', paused: '일시정지', ended: '전투 종료' }[state] || state);
        }
    }

    function stopSimulationMonitor() {
        if (app.simulationPollTimer) clearInterval(app.simulationPollTimer);
        app.simulationPollTimer = null;
    }

    function startSimulationMonitor() {
        stopSimulationMonitor();
        app.simulationPollTimer = setInterval(() => {
            if (!app.simulationMode || app.simulationState === 'paused') return;
            const game = simulationGame(), engine = simulationRuntime()?.engine;
            if (!game) {
                if (app.simulationState === 'running') setSimulationUi('ended', '전투 종료');
                return;
            }
            if (!engine) return;
            const hp = Math.max(0, Math.round(Number(engine.monsterHp || 0)));
            const maxHp = Math.max(hp, Math.round(Number(engine.monsterMaxHp || engine.maxMonsterHp || 0)));
            const time = Math.max(0, Math.round(Number(engine.battleTime || 0) / 10));
            setSimulationUi('running', maxHp ? `HP ${hp}/${maxHp} · ${time}초` : `전투 ${time}초`);
        }, 500);
    }

    function waitForSimulation(predicate, description, timeoutMs = 25000) {
        const startedAt = performance.now();
        return new Promise((resolve, reject) => {
            const poll = () => {
                let value = null;
                try { value = predicate(); } catch { value = null; }
                if (value) return resolve(value);
                if (performance.now() - startedAt >= timeoutMs) return reject(new Error(`실전 시뮬레이션 준비 실패: ${description}`));
                setTimeout(poll, 100);
            };
            poll();
        });
    }

    function sendSimulationChat(message, index = 0, isStreamer = false) {
        const receiver = simulationWindow()?.processMessage;
        if (typeof receiver !== 'function') throw new Error('실제 채팅 라우터를 찾을 수 없습니다.');
        receiver({
            message,
            nickname: isStreamer ? 'Simulation Host' : `Preview Hunter ${index + 1}`,
            uid: isStreamer ? 'preview-simulation-host' : `preview-simulation-hunter-${index + 1}`,
            userIdHash: isStreamer ? 'preview-simulation-host' : `preview-simulation-hunter-${index + 1}`,
            color: ['#64d8ff', '#ff8ca8', '#9be56b', '#ffd166'][index % 4],
            isStreamer,
            isSubscriber: true,
            emojis: []
        });
    }

    async function stopCombatSimulation({ restorePatternPreview = true } = {}) {
        stopSimulationMonitor();
        const game = simulationGame();
        try { game?.forceStopGame?.(); } catch (error) { console.warn('Simulation cleanup failed', error); }
        app.simulationMode = false;
        bridge.reset();
        if (restorePatternPreview) {
            previewFrame().src = '/preview/?embed=1';
            setSimulationUi('pattern');
        }
    }

    async function startCombatSimulation() {
        if (app.simulationMode) {
            await stopCombatSimulation();
            return;
        }
        const monster = app.monsters.find(item => item.id === app.monster);
        if (!monster) throw new Error('선택한 몬스터를 찾을 수 없습니다.');
        stopPreviewAudio();
        stopPlaybackProgress();
        bridge.reset();
        app.simulationMode = true;
        setSimulationUi('loading', '실제 수렵 로딩…');
        previewFrame().src = `/index.html?huntSimulation=1&monster=${encodeURIComponent(app.huntId || app.monster)}`;

        await waitForSimulation(() => simulationApp() && typeof simulationWindow()?.processMessage === 'function', '실제 수렵 앱');
        sendSimulationChat(`!수렵 ${monster.name || app.huntId || app.monster}`, 0, true);
        await waitForSimulation(() => simulationWindow()?.document?.querySelector('.hunt-quest-board'), '퀘스트 보드');
        for (let index = 0; index < 4; index++) sendSimulationChat('!참가', index);
        await waitForSimulation(() => simulationWindow()?.document?.querySelector('.hunt-loadout-board'), '장비 선택');
        for (let index = 0; index < 4; index++) sendSimulationChat('!준비', index);
        await waitForSimulation(() => simulationWindow()?.document?.querySelector('#fight-monster-img') && simulationRuntime(), '전투 시작');
        simulationRuntime().clock?.setRate?.(Number($('#simulationSpeed').value || 1));
        setSimulationUi('running', `${monster.name || app.huntId} 실전`);
        startSimulationMonitor();
    }

    function installCombatSimulationControls() {
        setSimulationUi('pattern');
        $('#simulationStart').onclick = () => startCombatSimulation().catch(error => {
            console.error(error);
            setSimulationUi('ended', error.message);
        });
        $('#simulationPause').onclick = () => {
            const runtime = simulationRuntime();
            if (!runtime) return;
            if (app.simulationState === 'paused') {
                runtime.resume();
                setSimulationUi('running');
            } else {
                runtime.pause();
                setSimulationUi('paused');
            }
        };
        $('#simulationSpeed').onchange = () => simulationRuntime()?.clock?.setRate?.(Number($('#simulationSpeed').value || 1));
        $('#simulationReset').onclick = async () => {
            await stopCombatSimulation({ restorePatternPreview: false });
            await startCombatSimulation();
        };
    }

    function installPairPreviewTargets() {
        const select = $('#previewTarget');
        if (!select) return;
        if (!select.querySelector('option[value="pair:random-adjacent"]')) {
            const randomOption = document.createElement('option');
            randomOption.value = 'pair:random-adjacent';
            randomOption.textContent = '🎲 2인 인접 랜덤 (1·2 / 2·3 / 3·4)';
            select.appendChild(randomOption);
        }
        [[0, 1], [1, 2], [2, 3]].forEach(([left, right]) => {
            if (select.querySelector(`option[value="pair:${left},${right}"]`)) return;
            const option = document.createElement('option');
            option.value = `pair:${left},${right}`;
            option.textContent = `2인 ${left + 1}·${right + 1} 사이`;
            select.appendChild(option);
        });
    }

    function seekPreview(tick) {
        const snapshot = app.session.seek(tick);
        bridge.send('bubblechat:pattern-preview-seek', {
            progress: snapshot.scrub.tick / Math.max(1, snapshot.timeline.durationTicks),
            tick: snapshot.scrub.tick,
            beatId: snapshot.scrub.beatId,
            beatProgress: snapshot.scrub.beatProgress
        });
    }

    function playTimelineAudio() {
        stopPreviewAudio();
        const pattern = selectedPattern(), snapshot = app.session.snapshot();
        if (!pattern) return;
        const schedule = [];
        for (const beat of snapshot.timeline.beats) {
            for (const slot of previewSlotsForBeat(pattern, beat)) {
                if (!slot.effective?.layers?.length) continue;
                const offsets = pattern.id === '__reaction.sleep' && beat.id === 'held'
                    ? Array.from({ length: Math.max(1, Math.ceil(beat.ticks / 30)) }, (_, index) => index * 30)
                        .filter(offset => offset < beat.ticks)
                    : [0];
                for (const offset of offsets) schedule.push({
                    atMs: (beat.startTicks + offset) * 100,
                    route: slot.effective,
                    label: `${pattern.name} · ${slot.label}`,
                    played: false
                });
            }
        }
        app.previewAudioSchedule = schedule.sort((left, right) => left.atMs - right.atMs);
    }

    function emitPreviewAudioThrough(elapsedMs) {
        for (const cue of app.previewAudioSchedule) {
            if (cue.played || cue.atMs > elapsedMs) continue;
            cue.played = true;
            playRoute(cue.route, cue.label);
        }
    }

    function playCurrentPreview() {
        if (app.playbackState === 'paused') {
            app.playbackState = 'playing';
            app.playbackStartedAt = performance.now() - app.playbackElapsedMs;
            app.previewAudios.forEach(clip => clip.play().catch(() => {}));
            bridge.send('bubblechat:pattern-preview-transport', { action: 'resume' });
            runPlaybackProgress(); updateTransportControls();
            return;
        }
        app.playbackState = 'playing'; app.playbackElapsedMs = 0;
        sendPreview({ play: true });
        updateTransportControls();
    }

    function stopPlaybackProgress({ preserveState = false } = {}) {
        if (app.playbackFrame) cancelAnimationFrame(app.playbackFrame);
        app.playbackFrame = 0; app.playbackToken = 0;
        if (!preserveState) app.playbackState = 'stopped';
        updateTransportControls();
    }

    function updatePlaybackCursor(tick, durationTicks) {
        const boundedTick = Math.max(0, Math.min(durationTicks, Number(tick) || 0));
        const percentage = boundedTick / Math.max(1, durationTicks) * 100;
        const cursor = $('.scrub-cursor'), readout = $('.scrub-readout'), slider = $('.timeline-slider');
        if (cursor) cursor.style.left = `${percentage}%`;
        if (readout) {
            readout.style.left = `${percentage}%`;
            readout.textContent = `${Math.floor(boundedTick)} / ${durationTicks}틱`;
        }
        if (slider) { slider.max = String(durationTicks); slider.value = String(boundedTick); }
    }

    function runPlaybackProgress() {
        if (app.playbackState !== 'playing' || !app.playbackDurationMs) return;
        if (app.playbackFrame) cancelAnimationFrame(app.playbackFrame);
        const timeline = app.playbackTimeline || app.session.snapshot().timeline;
        const frame = () => {
            if (app.playbackState !== 'playing') return;
            app.playbackElapsedMs = performance.now() - app.playbackStartedAt;
            emitPreviewAudioThrough(app.playbackElapsedMs);
            const ratio = Math.max(0, Math.min(1, app.playbackElapsedMs / app.playbackDurationMs));
            const tick = app.playbackDurationTicks * ratio;
            updatePlaybackCursor(tick, app.playbackDurationTicks);
            const beat = timeline.beats.find(item => tick >= item.startTicks && tick < item.endTicks)
                || timeline.beats.at(-1);
            if (beat && beat.id !== app.playbackBeatId) {
                app.playbackBeatId = beat.id;
                app.session.seek(Math.min(tick, Math.max(0, app.playbackDurationTicks - 1)));
                renderSelectionOnly();
            }
            if (ratio >= 1) {
                stopPreviewAudio(); stopPlaybackProgress();
                return;
            }
            app.playbackFrame = requestAnimationFrame(frame);
        };
        app.playbackFrame = requestAnimationFrame(frame);
    }

    function pauseCurrentPreview() {
        if (app.playbackState !== 'playing') return;
        app.playbackElapsedMs = performance.now() - app.playbackStartedAt;
        app.playbackState = 'paused';
        if (app.playbackFrame) cancelAnimationFrame(app.playbackFrame);
        app.playbackFrame = 0;
        app.previewAudios.forEach(clip => clip.pause());
        bridge.send('bubblechat:pattern-preview-transport', { action: 'pause' });
        updateTransportControls();
    }

    function stopCurrentPreview() {
        stopPreviewAudio(); stopPlaybackProgress(); app.playbackElapsedMs = 0;
        bridge.send('bubblechat:pattern-preview-transport', { action: 'stop' });
        seekPreview(0); updateTimelineCursor(); renderSelectionOnly();
    }

    function updateTransportControls() {
        document.querySelectorAll('.timeline-transport button').forEach(button => {
            const action = button.dataset.transport;
            const active = (action === 'play' && app.playbackState === 'playing')
                || (action === 'pause' && app.playbackState === 'paused');
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function startPlaybackProgress({ playbackToken, durationMs }) {
        if (!playbackToken || playbackToken !== app.previewSequence) return;
        stopPlaybackProgress({ preserveState: true }); app.playbackToken = playbackToken;
        const snapshot = app.session.snapshot();
        app.playbackState = 'playing'; app.playbackElapsedMs = 0;
        app.playbackStartedAt = performance.now();
        app.playbackDurationTicks = snapshot.timeline.durationTicks;
        app.playbackDurationMs = Math.max(100, Number(durationMs) || app.playbackDurationTicks * 100);
        app.playbackTimeline = snapshot.timeline; app.playbackBeatId = '';
        runPlaybackProgress(); updateTransportControls();
    }

    function renderProgress() {
        const slots = allSlots(), mapped = slots.filter(slot => slot.effective).length;
        const percentage = slots.length ? Math.round(mapped / slots.length * 100) : 0;
        $('#summary').textContent = `${mapped}/${slots.length} 슬롯`;
        $('#progressText').textContent = `${percentage}%`;
        $('#progressFill').style.width = `${percentage}%`;
        $('#patternSummary').textContent = `${app.patterns.length}개 · ${mapped}/${slots.length} 연결`;
    }

    function renderPatternList() {
        const host = $('#patternList'); host.textContent = '';
        let reactionSection = false;
        for (const pattern of app.patterns) {
            const isReaction = (pattern.tags || []).includes('review-reaction');
            if (isReaction && !reactionSection) {
                const label = document.createElement('div');
                label.className = 'pattern-section-label';
                label.textContent = '상태 · 부위 리액션';
                host.appendChild(label);
                reactionSection = true;
            }
            const row = document.createElement('div'); row.className = 'pattern-row';
            const mapped = pattern.slots.filter(slot => slot.effective).length;
            row.innerHTML = `<button class="pattern-button${pattern.id === app.selectedPatternId ? ' active' : ''}${mapped === pattern.slots.length ? ' complete-pattern' : ''}"><strong>${esc(pattern.name)}</strong><small>${esc(pattern.id)}</small><span class="count">${mapped}/${pattern.slots.length}</span></button><button class="pattern-play" type="button" aria-label="${esc(pattern.name)} 재생">▶</button>`;
            row.querySelector('.pattern-button').onclick = () => selectPattern(pattern.id, false);
            row.querySelector('.pattern-play').onclick = () => selectPattern(pattern.id, true);
            host.appendChild(row);
        }
        renderProgress();
    }

    function routeHtml(slot) {
        const files = routeFiles(slot?.effective);
        if (!files.length) return '<span class="missing">음원 미배정</span>';
        const mode = slot.effective.mode === 'random' ? 'RANDOM' : files.length > 1 ? 'LAYER' : 'SINGLE';
        return `<div class="route-summary"><em class="route-mode">${mode}</em><b>${esc(slot.effective.label || '배정')}</b><small>${files.length}개 음원</small></div><ul class="route-files">${files.map(file => `<li draggable="true" data-route-file="${esc(file)}"><span>${esc(fileName(file))}</span><button type="button" class="route-copy-button" data-route-copy="${esc(file)}" title="이 음원 복사" aria-label="이 음원 복사">📋</button><button type="button" class="route-source-link" data-source-link="${esc(file)}" title="우측 음원 목록에서 보기" aria-label="우측 음원 목록에서 보기">🔗</button></li>`).join('')}</ul>`;
    }

    function copyRouteLayer(slot, path) {
        const layer = (slot?.effective?.layers || []).find(item =>
            String(Array.isArray(item) ? item[0] : item) === String(path));
        if (!layer) return;
        const normalized = Array.isArray(layer) ? layer : [layer, .7, 0];
        app.routeClipboard = { version: 1, path: normalized[0], gain: Number(normalized[1]) || .7,
            delay: Number(normalized[2]) || 0, copiedAt: Date.now() };
        localStorage.setItem('bubblechat.monsterAudioReview.routeClipboard', JSON.stringify(app.routeClipboard));
        renderSlotFlow(selectedPattern());
    }

    async function pasteRouteLayer(patternId, slotId) {
        const clip = app.routeClipboard;
        if (!clip?.path) throw new Error('복사된 음원이 없습니다.');
        await saveRoute({ huntId: app.huntId, patternId, slot: slotId, files: [clip.path],
            gain: clip.gain, delay: clip.delay, label: `복사 · ${fileName(clip.path)}` });
    }

    function renderSlotFlow(pattern) {
        const host = $('#slotFlow'); host.textContent = '';
        for (const slot of pattern.slots) {
            const row = document.createElement('div');
            row.className = `slot-card${slot.slot === app.selectedSlot ? ' selected' : ''}`;
            row.dataset.slot = slot.slot;
            const judgmentCondition = slot.judgmentGroup ? (slot.when || slot.effective?.when || 'hit') : null;
            row.innerHTML = `<span class="slot-order">${esc(slot.phase || 'beat')}</span><span class="slot-name"><strong>${esc(slot.label)}</strong><small>${slot.atTicks ?? 0}틱 · ${esc(slot.phase || '')}</small></span><div class="slot-route">${routeHtml(slot)}</div><span class="slot-actions"><button type="button" class="icon-button paste-route" title="복사한 음원 붙여넣기" aria-label="복사한 음원 붙여넣기"${app.routeClipboard?.path ? '' : ' disabled'}>📥</button><button type="button" class="icon-button play-slot"${slot.effective ? '' : ' disabled'}>▶</button><button type="button" class="icon-button clear-slot"${slot.assigned ? '' : ' disabled'}>✕</button></span>`;
            if (judgmentCondition) {
                const control = document.createElement('label');
                control.className = 'judgment-condition';
                control.innerHTML = `판정 조건 <select><option value="hit">적중</option><option value="contact">접촉</option><option value="always">항상</option><option value="miss">비적중</option></select>`;
                const select = control.querySelector('select');
                select.value = judgmentCondition;
                select.onchange = event => {
                    event.stopPropagation();
                    const files = routeFiles(slot.effective);
                    saveRoute({ huntId: app.huntId, patternId: pattern.id, slot: slot.slot,
                        files, gain: .7, delay: 0, label: slot.effective?.label || null,
                        mode: slot.effective?.mode || null, when: select.value })
                        .catch(error => alert(error.message));
                };
                row.querySelector('.slot-name')?.appendChild(control);
            }
            row.onclick = event => { if (!event.target.closest('.slot-actions, .judgment-condition')) selectPart({ slotId: slot.slot }); };
            row.querySelector('.play-slot').onclick = event => playRoute(slot.effective, `${pattern.name} · ${slot.label}`, event.currentTarget);
            row.querySelector('.clear-slot').onclick = () => clearSlot(pattern.id, slot.slot);
            row.querySelector('.paste-route').onclick = () => pasteRouteLayer(pattern.id, slot.slot)
                .catch(error => alert(error.message));
            row.querySelectorAll('.route-copy-button').forEach(button => button.onclick = event => {
                event.preventDefault(); event.stopPropagation(); copyRouteLayer(slot, button.dataset.routeCopy);
            });
            row.querySelectorAll('.route-source-link').forEach(button => button.onclick = event => {
                event.preventDefault(); event.stopPropagation(); revealSource(button.dataset.sourceLink);
            });
            installRouteDrag(row, pattern, slot);
            host.appendChild(row);
        }
    }

    function renderTimeline(pattern) {
        const snapshot = app.session.snapshot(), host = $('#patternDesk');
        host.innerHTML = `<section class="beat-card timeline-docked"><div class="section-kicker"><b>모션 · 판정 타임라인</b><span class="beat-source">단일 실행기 · ${snapshot.timeline.durationTicks}틱</span></div><div class="beat-track"></div><section class="judgment-manager timeline-judgment-manager"></section></section><div class="section-kicker"><b>사운드 순간 선택</b><span>선택 판정과 항상 동기화</span></div><section id="slotFlow" class="slot-flow"></section><section class="motion-editor"></section><section class="part-reaction-editor"></section>`;
        const transport = document.createElement('div');
        transport.className = 'timeline-transport';
        transport.setAttribute('role', 'group');
        transport.setAttribute('aria-label', '타임라인 재생 제어');
        transport.innerHTML = `<button type="button" data-transport="play" title="재생" aria-label="재생"><span>▶</span><small>재생</small></button><button type="button" data-transport="pause" title="일시정지" aria-label="일시정지"><span>Ⅱ</span><small>일시정지</small></button><button type="button" data-transport="stop" title="정지" aria-label="정지"><span>■</span><small>정지</small></button>`;
        host.querySelector('.timeline-docked').prepend(transport);
        transport.querySelector('[data-transport="play"]').onclick = playCurrentPreview;
        transport.querySelector('[data-transport="pause"]').onclick = pauseCurrentPreview;
        transport.querySelector('[data-transport="stop"]').onclick = stopCurrentPreview;
        const track = host.querySelector('.beat-track');
        const hasUnifiedJudgments = snapshot.timeline.beats.some(beat =>
            Array.isArray(beat.judgments) && beat.judgments.length);
        for (const [index, beat] of snapshot.timeline.beats.entries()) {
            const node = document.createElement('div');
            const displaysImpact = hasUnifiedJudgments
                ? (beat.judgments || []).some(judgment => judgment.kind === 'damage')
                : beat.hit;
            node.className = `beat${displaysImpact ? ' hit' : ''}${beat.id === snapshot.selection.beatId ? ' scrub-active' : ''}`;
            node.dataset.beat = beat.id; node.style.setProperty('--ticks', beat.ticks);
            node.innerHTML = `<strong>${esc(beat.label || beat.id)}</strong><small>${beat.startTicks}–${beat.endTicks}틱 · ${(beat.ticks / 10).toFixed(1)}초</small>${displaysImpact ? '<em>HIT</em>' : ''}`;
            node.onclick = event => {
                if (event.target.closest('.beat-handle')) return;
                const firstJudgment = (beat.judgments || [])[0];
                if (firstJudgment) selectJudgmentEntry(beat, firstJudgment);
                else selectPart({ beatId: beat.id });
            };
            if (index < snapshot.timeline.beats.length - 1) installBoundaryHandle(node, beat, snapshot.timeline.beats[index + 1], track);
            track.appendChild(node);
        }
        const effectKinds = judgmentKinds(pattern);
        const effectBeats = effectKinds.map(kind => {
            const authored = snapshot.timeline.beats.find(beat =>
                Number.isFinite(Number(beat.judgmentOffsets?.[kind])));
            return { kind, beat: authored || judgmentBeat(snapshot.timeline.beats, kind), authored: Boolean(authored) };
        }).filter(item => item.beat);
        const markers = hasUnifiedJudgments ? [] : [
            ...snapshot.timeline.beats.filter(item => item.hit).map(beat => ({ beat, judgments: [] })),
            ...effectBeats.map(effect => ({ beat: effect.beat, judgments: [effect.kind], authored: effect.authored }))
        ];
        for (const { beat, judgments, authored } of markers) {
            const marker = document.createElement('span');
            const judgmentText = judgments.map(kind => judgmentMeta(kind).label).join(' ');
            const markerText = [beat.hit ? 'HIT' : '', judgmentText].filter(Boolean).join(' · ');
            marker.className = `hit-tick-marker${judgments.length ? ' judgment' : ''}`;
            marker.dataset.beat = beat.id;
            if (judgments.length) marker.dataset.judgment = judgments.join(' ');
            const judgmentKind = judgments[0] || '';
            const markerTick = beat.startTicks + (beat.hit
                ? Number(beat.hitOffsetTicks || 0)
                : Number(beat.judgmentOffsets?.[judgmentKind] || 0));
            marker.style.left = `${markerTick / Math.max(1, snapshot.timeline.durationTicks) * 100}%`;
            marker.innerHTML = `<b>${markerText}</b><small>${markerTick}틱</small>`;
            marker.title = `${markerText} ${markerTick}틱 · 글씨를 좌우로 드래그하여 판정 시점 조절`;
            marker.setAttribute('role', 'slider');
            marker.setAttribute('aria-label', `${beat.label || beat.id} ${markerText} 시점`);
            marker.setAttribute('aria-valuenow', String(markerTick));
            const hitIndex = snapshot.timeline.beats.findIndex(item => item.id === beat.id);
            if (beat.hit) installImpactMarkerDrag(marker, beat, track);
            else installJudgmentMarkerDrag(marker, beat, judgmentKind, track, authored);
            track.appendChild(marker);
        }
        // Unified judgments are the authoritative markers. Legacy HIT/effect markers remain
        // readable only for patterns that have not yet been promoted to the new schema.
        const unified = snapshot.timeline.beats.flatMap(beat =>
            (beat.judgments || []).map(judgment => ({ beat, judgment })));
        for (const { beat, judgment } of unified) {
            const marker = document.createElement('span');
            const meta = judgment.kind === 'damage' ? { label: 'HIT' } : judgmentMeta(judgment.kind);
            const markerTick = beat.startTicks + Number(judgment.offsetTicks || 0);
            marker.className = `hit-tick-marker judgment${judgment.id === app.selectedJudgmentId ? ' selected' : ''}`;
            marker.dataset.beat = beat.id; marker.dataset.judgmentId = judgment.id;
            marker.style.left = `${markerTick / Math.max(1, snapshot.timeline.durationTicks) * 100}%`;
            marker.innerHTML = `<b>${meta.label}</b><small>${markerTick}틱</small>`;
            marker.onclick = event => { event.stopPropagation(); selectJudgmentEntry(beat, judgment); };
            installUnifiedJudgmentDrag(marker, beat, judgment, track);
            track.appendChild(marker);
        }
        const projectileEvents = snapshot.timeline.beats.flatMap(beat =>
            (beat.projectileEvents || []).map(projectileEvent => ({ beat, projectileEvent })));
        for (const { beat, projectileEvent } of projectileEvents) {
            const marker = document.createElement('span');
            const markerTick = beat.startTicks + Number(projectileEvent.offsetTicks || 0);
            const launch = projectileEvent.kind === 'projectile-launch';
            marker.className = `hit-tick-marker projectile ${launch ? 'launch' : 'finish'}${
                projectileEvent.id === app.selectedProjectileEventId ? ' selected' : ''}`;
            marker.dataset.beat = beat.id;
            marker.dataset.projectileEventId = projectileEvent.id;
            marker.style.left = `${markerTick / Math.max(1, snapshot.timeline.durationTicks) * 100}%`;
            marker.innerHTML = `<b>${launch ? 'LAUNCH' : 'FINISH'}</b><small>${markerTick}틱</small>`;
            marker.title = `${projectileEvent.projectileId} ${launch ? '발사' : '소멸'} · 글자를 드래그해 독립 조절`;
            marker.onclick = event => {
                event.stopPropagation();
                app.selectedProjectileEventId = projectileEvent.id;
                app.selectedJudgmentId = '';
                selectPart({ beatId: beat.id });
            };
            installProjectileEventDrag(marker, beat, projectileEvent, track);
            track.appendChild(marker);
        }
        const cursor = document.createElement('i'); cursor.className = 'scrub-cursor'; track.appendChild(cursor);
        const readout = document.createElement('output'); readout.className = 'scrub-readout'; track.appendChild(readout);
        const slider = document.createElement('input'); slider.className = 'timeline-slider'; slider.type = 'range';
        slider.min = '0'; slider.max = String(snapshot.timeline.durationTicks); slider.step = '.1';
        slider.value = String(snapshot.scrub.tick); slider.setAttribute('aria-label', 'motion timeline position');
        track.appendChild(slider);
        installScrubber(track);
        renderSlotFlow(pattern);
        renderJudgmentManager();
        renderMotionEditor(pattern);
        renderPartReactionEditor();
        updateTimelineCursor(); updateTransportControls();
    }

    function renderPartReactionEditor() {
        const host = $('.part-reaction-editor'); if (!host) return;
        const rows = app.partReactions || [];
        const commonSlot = app.systemAudioPattern?.slots?.find(slot => slot.slot === 'beat:se');
        const commonFiles = routeFiles(commonSlot?.effective);
        host.innerHTML = `<header><div><b>부위파괴 리액션 연결</b><small>부위별 몸 반응만 선택 · 쪼개짐 이미지와 파괴 SE는 전 몬스터 공통 시스템 레이어</small></div><button type="button" class="save-part-reactions">저장</button></header><section class="common-part-break-audio"><div><b>공통 부위파괴 SE</b><small>모든 몬스터 · 모든 파괴 부위에 자동 적용</small><code>${esc(commonFiles.map(fileName).join(' · ') || '배정 파일 없음')}</code></div><button type="button" class="common-part-break-play"${commonSlot?.effective ? '' : ' disabled'} aria-label="공통 부위파괴 SE 재생">▶</button><button type="button" class="common-part-break-source"${commonFiles[0] ? '' : ' disabled'} aria-label="공통 부위파괴 SE 원본 보기">🔗</button></section><div class="part-reaction-grid"></div>`;
        host.querySelector('.common-part-break-play').onclick = event => {
            if (commonSlot?.effective) playRoute(commonSlot.effective, '공통 부위파괴 SE', event.currentTarget);
        };
        host.querySelector('.common-part-break-source').onclick = () => revealSource(commonFiles[0]);
        const grid = host.querySelector('.part-reaction-grid');
        for (const item of rows) {
            const row = document.createElement('label'); row.className = 'part-reaction-row';
            row.innerHTML = `<span><b>${esc(item.label || item.partKind)}</b><small>${esc(item.partKind)}</small></span><select data-part="${esc(item.partKind)}"><option value="flinch"${item.profile === 'flinch' ? ' selected' : ''}>소경직</option><option value="knockdown"${item.profile === 'knockdown' ? ' selected' : ''}>대경직</option><option value="tail"${item.profile === 'tail' ? ' selected' : ''}>꼬짤경직</option></select>`;
            grid.appendChild(row);
        }
        const button = host.querySelector('.save-part-reactions'); button.disabled = !rows.length;
        button.onclick = async () => {
            const mappings = Object.fromEntries([...host.querySelectorAll('select[data-part]')]
                .map(select => [select.dataset.part, select.value]));
            button.disabled = true; button.textContent = '검증 중';
            try {
                const result = await api('/api/hunt-part-reactions', { method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ huntId: app.huntId, mappings, expectedRevision: app.revisions.motion }) });
                app.revisions.motion = result.sourceRevision || app.revisions.motion;
                app.partReactions = rows.map(item => ({ ...item, profile: mappings[item.partKind], authored: true }));
                button.textContent = '저장됨';
            } catch (error) { button.disabled = false; button.textContent = error.message; }
        };
    }

    function installUnifiedJudgmentDrag(marker, sourceBeat, judgment, track) {
        marker.onpointerdown = event => {
            if (!event.target.closest('b')) return;
            event.preventDefault(); event.stopPropagation(); marker.setPointerCapture(event.pointerId);
            app.selectedJudgmentId = judgment.id; marker.classList.add('dragging');
            const snapshot = app.session.snapshot(), total = snapshot.timeline.durationTicks,
                width = track.getBoundingClientRect().width,
                sourceTick = sourceBeat.startTicks + Number(judgment.offsetTicks || 0), startX = event.clientX;
            let latestTick = sourceTick, moved = false;
            marker.onpointermove = move => {
                latestTick = Math.max(0, Math.min(total - 1,
                    Math.round(sourceTick + (move.clientX - startX) / Math.max(1, width) * total)));
                moved ||= latestTick !== sourceTick;
                marker.style.left = `${latestTick / Math.max(1, total) * 100}%`;
                marker.querySelector('small').textContent = `${latestTick}틱`;
            };
            const finish = () => {
                marker.onpointermove = null; marker.onpointerup = null; marker.onpointercancel = null;
                if (moved) app.session.moveJudgmentById(judgment.id, latestTick);
                renderPatternDesk(); sendPreview({ scrub: true });
            };
            marker.onpointerup = finish; marker.onpointercancel = finish;
        };
    }

    function installProjectileEventDrag(marker, sourceBeat, projectileEvent, track) {
        marker.onpointerdown = event => {
            if (!event.target.closest('b')) return;
            event.preventDefault(); event.stopPropagation(); marker.setPointerCapture(event.pointerId);
            app.selectedProjectileEventId = projectileEvent.id;
            app.selectedJudgmentId = '';
            marker.classList.add('dragging');
            const snapshot = app.session.snapshot(), total = snapshot.timeline.durationTicks,
                width = track.getBoundingClientRect().width,
                sourceTick = sourceBeat.startTicks + Number(projectileEvent.offsetTicks || 0),
                startX = event.clientX;
            let latestTick = sourceTick, moved = false;
            marker.onpointermove = move => {
                latestTick = Math.max(0, Math.min(total - 1,
                    Math.round(sourceTick + (move.clientX - startX) / Math.max(1, width) * total)));
                moved ||= latestTick !== sourceTick;
                marker.style.left = `${latestTick / Math.max(1, total) * 100}%`;
                marker.querySelector('small').textContent = `${latestTick}틱`;
            };
            const finish = () => {
                marker.onpointermove = null; marker.onpointerup = null; marker.onpointercancel = null;
                if (moved) app.session.moveProjectileEventById(projectileEvent.id, latestTick);
                renderPatternDesk(); sendPreview({ scrub: true });
            };
            marker.onpointerup = finish; marker.onpointercancel = finish;
        };
    }

    function normalizeJudgmentKind(value = '') {
        const kind = String(value).toLowerCase().replace(/-(?:small|large)$/, '');
        if (kind.includes('roar')) return 'roar';
        if (kind.includes('tremor') || kind.includes('earthquake')) return 'tremor';
        if (kind.includes('wind')) return 'wind';
        return '';
    }

    function judgmentKinds(pattern = {}) {
        const explicit = [pattern.interference, pattern.secondaryInterference]
            .map(value => normalizeJudgmentKind(value?.kind)).filter(Boolean);
        const tags = new Set(pattern.tags || []);
        const tagged = ['roar', 'tremor', 'wind'].filter(kind => tags.has(kind)
            || [...tags].some(tag => String(tag).startsWith(`${kind}-`)));
        return [...new Set([...explicit, ...tagged])];
    }

    function judgmentMeta(kind) {
        return kind === 'roar' ? { label: '📣 포효' }
            : kind === 'tremor' ? { label: '〰️ 지진' }
                : { label: '🌪️ 풍압' };
    }

    function judgmentBeat(beats = [], kind = '') {
        const words = kind === 'roar' ? /roar|포효|함성|괴성/
            : kind === 'tremor' ? /tremor|earthquake|지진|진동/
                : /wind|pressure|풍압|돌풍/;
        return beats.find(beat => beat.hit)
            || beats.find(beat => words.test(`${beat.id} ${beat.label || ''} ${beat.sfx || ''}`.toLowerCase()))
            || beats.find(beat => beat.phase !== 'telegraph')
            || beats[0]
            || null;
    }

    function installBoundaryHandle(node, leftBeat, rightBeat, track) {
        const handle = document.createElement('span'); handle.className = 'beat-handle'; node.appendChild(handle);
        installTimelineBoundaryDrag(handle, leftBeat, rightBeat, track);
    }

    function installHitMarkerDrag(marker, leftBeat, hitBeat, track) {
        installTimelineBoundaryDrag(marker, leftBeat, hitBeat, track, {
            onStart: () => {
                marker.classList.add('dragging');
                selectPart({ beatId: hitBeat.id });
            },
            onFinish: () => marker.classList.remove('dragging')
        });
    }

    function installImpactMarkerDrag(marker, sourceBeat, track) {
        marker.onpointerdown = event => {
            if (!event.target.closest('b')) return;
            event.preventDefault(); event.stopPropagation(); marker.setPointerCapture(event.pointerId);
            marker.classList.add('dragging');
            app.session.select({ beatId: sourceBeat.id }, { seek: false });
            renderSelectionOnly();
            const startX = event.clientX, snapshot = app.session.snapshot(), total = snapshot.timeline.durationTicks,
                width = track.getBoundingClientRect().width,
                sourceTick = sourceBeat.startTicks + Number(sourceBeat.hitOffsetTicks || 0),
                original = Object.fromEntries(snapshot.timeline.beats.map(beat => [beat.id, {
                    hit: app.session.draft[beat.id]?.hit,
                    hitOffsetTicks: app.session.draft[beat.id]?.hitOffsetTicks
                }]));
            let latestTick = sourceTick, moved = false, currentBeatId = sourceBeat.id;
            marker.onpointermove = move => {
                latestTick = Math.max(0, Math.min(total - 1,
                    Math.round(sourceTick + (move.clientX - startX) / Math.max(1, width) * total)));
                moved ||= latestTick !== sourceTick;
                const timeline = app.session.snapshot().timeline;
                const target = timeline.beats.find(beat => latestTick >= beat.startTicks && latestTick < beat.endTicks)
                    || timeline.beats.at(-1);
                for (const [id, value] of Object.entries(original)) {
                    if (value.hit === undefined) delete app.session.draft[id].hit;
                    else app.session.draft[id].hit = value.hit;
                    if (value.hitOffsetTicks === undefined) delete app.session.draft[id].hitOffsetTicks;
                    else app.session.draft[id].hitOffsetTicks = value.hitOffsetTicks;
                }
                app.session.draft[sourceBeat.id].hit = false;
                delete app.session.draft[sourceBeat.id].hitOffsetTicks;
                app.session.draft[target.id].hit = true;
                app.session.draft[target.id].hitOffsetTicks = latestTick - target.startTicks;
                currentBeatId = target.id; marker.dataset.beat = target.id;
                renderTimelineVisualOnly();
            };
            const finish = () => {
                marker.onpointermove = null; marker.onpointerup = null; marker.onpointercancel = null;
                for (const [id, value] of Object.entries(original)) {
                    if (value.hit === undefined) delete app.session.draft[id].hit;
                    else app.session.draft[id].hit = value.hit;
                    if (value.hitOffsetTicks === undefined) delete app.session.draft[id].hitOffsetTicks;
                    else app.session.draft[id].hitOffsetTicks = value.hitOffsetTicks;
                }
                marker.classList.remove('dragging');
                if (moved) app.session.moveImpact(sourceBeat.id, latestTick);
                renderPatternDesk(); sendPreview({ scrub: true });
            };
            marker.onpointerup = finish; marker.onpointercancel = finish;
        };
    }

    function installJudgmentMarkerDrag(marker, sourceBeat, kind, track) {
        marker.onpointerdown = event => {
            if (!event.target.closest('b')) return;
            event.preventDefault(); event.stopPropagation(); marker.setPointerCapture(event.pointerId);
            marker.classList.add('dragging');
            const snapshot = app.session.snapshot(), total = snapshot.timeline.durationTicks,
                width = track.getBoundingClientRect().width,
                sourceTick = sourceBeat.startTicks + Number(sourceBeat.judgmentOffsets?.[kind] || 0),
                startX = event.clientX;
            let latestTick = sourceTick, moved = false;
            marker.onpointermove = move => {
                latestTick = Math.max(0, Math.min(total - 1,
                    Math.round(sourceTick + (move.clientX - startX) / Math.max(1, width) * total)));
                moved ||= latestTick !== sourceTick;
                marker.style.left = `${latestTick / Math.max(1, total) * 100}%`;
                const tick = marker.querySelector('small'); if (tick) tick.textContent = `${latestTick}틱`;
            };
            const finish = () => {
                marker.onpointermove = null; marker.onpointerup = null; marker.onpointercancel = null;
                marker.classList.remove('dragging');
                if (moved) app.session.moveJudgment(sourceBeat.id, kind, latestTick);
                renderPatternDesk(); sendPreview({ scrub: true });
            };
            marker.onpointerup = finish; marker.onpointercancel = finish;
        };
    }

    function installTimelineBoundaryDrag(handle, leftBeat, rightBeat, track, hooks = {}) {
        handle.onpointerdown = event => {
            event.preventDefault(); event.stopPropagation(); handle.setPointerCapture(event.pointerId);
            hooks.onStart?.();
            const startX = event.clientX, leftStart = app.session.serialize()[leftBeat.id].ticks,
                rightStart = app.session.serialize()[rightBeat.id].ticks,
                total = app.session.snapshot().timeline.durationTicks, width = track.getBoundingClientRect().width;
            let latest = 0, moved = false;
            handle.onpointermove = move => {
                latest = Math.max(1 - leftStart, Math.min(rightStart - 1,
                    Math.round((move.clientX - startX) / Math.max(1, width) * total)));
                moved ||= latest !== 0;
                const draft = app.session.draft;
                draft[leftBeat.id].ticks = leftStart + latest; draft[rightBeat.id].ticks = rightStart - latest;
                renderTimelineVisualOnly(); sendPreview({ scrub: true }); seekPreview(app.session.scrub.tick);
            };
            const finish = () => {
                handle.onpointermove = null; handle.onpointerup = null; handle.onpointercancel = null;
                app.session.draft[leftBeat.id].ticks = leftStart; app.session.draft[rightBeat.id].ticks = rightStart;
                hooks.onFinish?.();
                if (moved) app.session.resizeBoundary(leftBeat.id, rightBeat.id, latest);
                renderPatternDesk();
            };
            handle.onpointerup = finish; handle.onpointercancel = finish;
        };
    }

    function installScrubber(track) {
        const slider = track.querySelector('.timeline-slider');
        if (slider) {
            slider.onpointerdown = event => event.stopPropagation();
            slider.oninput = event => {
                const before = app.session.snapshot().selection.beatId;
                seekPreview(Number(event.target.value)); updateTimelineCursor();
                renderSelectionOnly({ inspector: before !== app.session.snapshot().selection.beatId });
            };
        }
        const seekEvent = event => {
            const rect = track.getBoundingClientRect(), total = app.session.snapshot().timeline.durationTicks;
            const before = app.session.snapshot().selection.beatId;
            seekPreview((event.clientX - rect.left) / Math.max(1, rect.width) * total); updateTimelineCursor();
            renderSelectionOnly({ inspector: before !== app.session.snapshot().selection.beatId });
        };
        track.onpointerdown = event => {
            if (event.target.closest('.beat-handle,.timeline-slider')) return;
            event.preventDefault(); sendPreview({ scrub: true }); track.setPointerCapture(event.pointerId);
            seekEvent(event); track.onpointermove = seekEvent; track.onpointerup = () => { track.onpointermove = null; };
        };
    }

    function renderTimelineVisualOnly() {
        const snapshot = app.session.snapshot();
        document.querySelectorAll('.beat-track .beat').forEach((node, index) => {
            const beat = snapshot.timeline.beats[index]; if (!beat) return;
            node.style.setProperty('--ticks', beat.ticks);
            node.querySelector('small').textContent = `${beat.startTicks}–${beat.endTicks}틱 · ${(beat.ticks / 10).toFixed(1)}초`;
        });
        document.querySelectorAll('.hit-tick-marker').forEach(node => {
            const beat = snapshot.timeline.beats.find(item => item.id === node.dataset.beat);
            if (!beat) return;
            if (node.dataset.judgmentId) {
                const judgment = beat.judgments?.find(item => item.id === node.dataset.judgmentId);
                if (!judgment) return;
                const markerTick = beat.startTicks + Number(judgment.offsetTicks || 0);
                node.style.left = `${markerTick / Math.max(1, snapshot.timeline.durationTicks) * 100}%`;
                const label = node.querySelector('small'); if (label) label.textContent = `${markerTick}틱`;
                return;
            }
            if (node.dataset.projectileEventId) {
                const projectileEvent = beat.projectileEvents?.find(item => item.id === node.dataset.projectileEventId);
                if (!projectileEvent) return;
                const markerTick = beat.startTicks + Number(projectileEvent.offsetTicks || 0);
                node.style.left = `${markerTick / Math.max(1, snapshot.timeline.durationTicks) * 100}%`;
                const label = node.querySelector('small'); if (label) label.textContent = `${markerTick}틱`;
                return;
            }
            const judgmentKind = String(node.dataset.judgment || '').split(' ')[0];
            const markerTick = beat.startTicks + (beat.hit && !judgmentKind
                ? Number(beat.hitOffsetTicks || 0)
                : Number(beat.judgmentOffsets?.[judgmentKind] || 0));
            node.style.left = `${markerTick / Math.max(1, snapshot.timeline.durationTicks) * 100}%`;
            const tick = node.querySelector('small'); if (tick) tick.textContent = `${markerTick}틱`;
            node.setAttribute('aria-valuenow', String(markerTick));
        });
        $('.beat-source').textContent = `단일 실행기 · ${snapshot.timeline.durationTicks}틱`;
        updateTimelineCursor();
    }

    function refreshTimingEditVisuals() {
        const snapshot = app.session.snapshot();
        renderTimelineVisualOnly();
        document.querySelectorAll('.motion-field').forEach(node => {
            const beat = snapshot.timeline.beats.find(item => item.id === node.dataset.beat);
            const input = node.querySelector('input[type="number"]');
            if (beat && input && document.activeElement !== input) input.value = String(beat.ticks);
        });
        const total = $('.motion-total');
        if (total) total.textContent = `${snapshot.timeline.durationTicks}틱 · ${(snapshot.timeline.durationTicks / 10).toFixed(1)}초`;
        renderJudgmentManager();
        updateHistoryButtons();
    }

    function syncTimingPreviewAfterPaint() {
        requestAnimationFrame(() => sendPreview({ scrub: true }));
    }

    function updateTimelineCursor() {
        const snapshot = app.session.snapshot(), percentage = snapshot.scrub.tick / Math.max(1, snapshot.timeline.durationTicks) * 100;
        const cursor = $('.scrub-cursor'), readout = $('.scrub-readout');
        if (cursor) cursor.style.left = `${percentage}%`;
        if (readout) { readout.style.left = `${percentage}%`; readout.textContent = `${snapshot.scrub.tick} / ${snapshot.timeline.durationTicks}틱`; }
        const slider = $('.timeline-slider');
        if (slider) { slider.max = String(snapshot.timeline.durationTicks); slider.value = String(snapshot.scrub.tick); }
    }

    function renderSelectionOnly({ inspector = true } = {}) {
        const snapshot = app.session.snapshot(); app.selectedSlot = snapshot.selection.slotId;
        document.querySelectorAll('.beat').forEach(node => node.classList.toggle('scrub-active', node.dataset.beat === snapshot.selection.beatId));
        document.querySelectorAll('.motion-field').forEach(node => node.classList.toggle('scrub-active', node.dataset.beat === snapshot.selection.beatId));
        document.querySelectorAll('.slot-card').forEach(node => node.classList.toggle('selected', node.dataset.slot === app.selectedSlot));
        if (inspector) renderInspector(selectedPattern());
        refreshSourceSelection();
    }

    function selectPart(request) {
        app.selectedJudgmentId = '';
        app.session.select(request); updateTimelineCursor(); renderSelectionOnly(); seekPreview(app.session.scrub.tick);
    }

    function selectJudgmentEntry(beat, judgment, { scrollAudio = false } = {}) {
        if (!beat || !judgment) return;
        const pattern = selectedPattern();
        const group = String(judgment.group || judgment.id || 'impact');
        const slot = pattern?.slots.find(item => item.judgmentGroup === group) || null;
        const tick = beat.startTicks + Number(judgment.offsetTicks || 0);
        app.selectedJudgmentId = judgment.id;
        // One authored judgment owns the visible selection: its exact timeline
        // tick, mapped sound moment, source rail and marker always move together.
        app.session.seek(tick);
        app.session.select({ beatId: beat.id, ...(slot ? { slotId: slot.slot } : {}) }, { seek: false });
        renderPatternDesk();
        seekPreview(tick);
        if (scrollAudio && slot) requestAnimationFrame(() => document
            .querySelector(`.slot-card[data-slot="${CSS.escape(slot.slot)}"]`)
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    }

    const EDITABLE_MOTION_FIELDS = MonsterAudioReviewState.EDITABLE_MOTION_FIELDS;
    const easings = [['linear', '선형'], ['accelerate', '가속'], ['decelerate', '감속'], ['smooth', '부드럽게'],
        ['slow-fast-slow', '느림-빠름-느림'], ['snap', '스냅'], ['heavy', '묵직']];
    const options = (items, current) => items.map(([value, label]) => `<option value="${esc(value)}"${String(current ?? '') === value ? ' selected' : ''}>${esc(label)}</option>`).join('');
    function anchorEditor(value) {
        const key = 'to', current = value.to || '';
        const node = (anchor, label, classes = '') => `<button type="button" class="anchor-node ${classes}${anchor === current ? ' selected' : ''}" data-anchor="${esc(anchor)}" title="${esc(anchor || '이동 없음')}">${label}</button>`;
        return `<div class="destination-head"><b>도착 위치</b><span>시작은 항상 직전 위치</span><code>${esc(value.to || '이동 없음')}</code></div>
        <div class="anchor-map visual-anchor-map" data-anchor-key="${key}"><section><h3>🎯 목표 헌터를 기준으로 찍기</h3><div class="target-compass">
        ${node('polar:target 315deg 180', '↖ 뒤·위')}${node('above:target 180', '↑ 위')}${node('polar:target 45deg 180', '↗ 앞·위')}
        ${node('left:target 180', '← 왼쪽')}${node('target', '◎ 헌터', 'target-core ')}${node('right:target 180', '오른쪽 →')}
        ${node('polar:target 225deg 180', '↙ 뒤·아래')}${node('below:target 180', '↓ 아래')}${node('polar:target 135deg 180', '앞·아래 ↘')}</div></section>
        <section><h3>👥 2인 인접 타겟을 기준으로 찍기</h3><div class="target-compass pair-compass">
        ${node('above:pair:center 180', '↑ 2인 위')}${node('pair:center', '◎ 2인 사이', 'target-core ')}${node('below:pair:center 180', '↓ 2인 아래')}
        ${node('left:pair:center 180', '← 2인 좌측')}${node('pair:left', '◀ 왼쪽 헌터')}${node('pair:right', '오른쪽 헌터 ▶')}${node('right:pair:center 180', '2인 우측 →')}</div><small>패턴의 인접 2인 타겟 규칙이 1·2 / 2·3 / 3·4 중 한 쌍을 정하면, 이 프리셋도 같은 쌍을 따라감</small></section>
        <section><h3>🗺️ 전장 위의 위치를 직접 찍기</h3><div class="arena-anchor-grid">
        ${node('offscreen:top', '화면 밖 ↑', 'top-out ')}${node('offscreen:left', '밖 ←', 'left-out ')}${node('home', '🏠 본위치', 'home ')}${node('arena:center-lower', '● 중앙', 'arena-center ')}${node('', '이동 없음', 'previous ')}${node('offscreen:right', '밖 →', 'right-out ')}
        ${node('hunter:0', 'H1', 'h1 ')}${node('between:0,1', '사이', 'b12 ')}${node('hunter:1', 'H2', 'h2 ')}${node('between:1,2', '사이', 'b23 ')}${node('hunter:2', 'H3', 'h3 ')}${node('between:2,3', '사이', 'b34 ')}${node('hunter:3', 'H4', 'h4 ')}</div></section></div>
        <label class="anchor-custom"><span>정밀 좌표</span><input data-anchor-custom="${key}" value="${esc(current)}" placeholder="예: toward:target 85%"><button type="button" class="apply-anchor-custom">적용</button></label>`;
    }

    function renderMotionEditor(pattern) {
        const host = $('.motion-editor');
        host.innerHTML = `<div class="motion-toolbar"><strong>타이밍 편집</strong><span class="motion-total"></span></div><div class="motion-inputs"></div><div class="transform-editor"></div>`;
        const inputs = host.querySelector('.motion-inputs'), snapshot = app.session.snapshot();
        for (const beat of snapshot.timeline.beats) {
            const field = document.createElement('div'); field.className = `motion-field${beat.id === snapshot.selection.beatId ? ' scrub-active' : ''}`; field.dataset.beat = beat.id;
            field.innerHTML = `<label>${esc(beat.label || beat.id)}</label><input type="number" min="1" max="600" value="${beat.ticks}"><small>틱 · 0.1초</small>`;
            field.onclick = () => selectPart({ beatId: beat.id });
            field.querySelector('input').onchange = event => {
                app.session.updateBeat(beat.id, { ticks: event.target.value });
                event.target.value = String(app.session.snapshot().timeline.beats
                    .find(item => item.id === beat.id)?.ticks || 1);
                refreshTimingEditVisuals();
                syncTimingPreviewAfterPaint();
            };
            inputs.appendChild(field);
        }
        renderInspector(pattern);
        updateHistoryButtons();
    }

    function renderJudgmentManager() {
        const host = $('.judgment-manager'); if (!host) return;
        const pattern = selectedPattern() || {}, snapshot = app.session.snapshot();
        const entries = snapshot.timeline.beats.flatMap(beat =>
            (beat.judgments || []).map(judgment => ({ beat, judgment })));
        if (!entries.some(entry => entry.judgment.id === app.selectedJudgmentId)) {
            app.selectedJudgmentId = entries[0]?.judgment.id || '';
        }
        host.innerHTML = `<header><div><b>판정 관리</b><small>같은 그룹은 한 시점의 피해·포효·지진·풍압으로 실행됨</small></div><button type="button" class="add-judgment">+ 판정 추가</button></header><div class="judgment-list"></div>`;
        const kindLabels = { damage: '💥 피해', roar: '🗣️ 포효', tremor: '🌋 지진', wind: '💨 풍압' };
        const reactionLabels = { weak: '피격 [소] · 엉덩방아', strong: '피격 [대] · 날려버리기' };
        const elementLabels = { none: '무속', fire: '화', water: '수', thunder: '뢰', ice: '빙', dragon: '용',
            paralysis: '마비', sleep: '수면', blast: '폭파' };
        const targetLabels = { primary: '주 헌터', left: '주 헌터 좌측', right: '주 헌터 우측',
            pair: '2인 동시', 'pair-left': '2인 좌', 'pair-right': '2인 우',
            'primary-adjacent': '주 헌터+좌우', all: '전체' };
        const list = host.querySelector('.judgment-list');
        for (const { beat, judgment } of entries) {
            const group = String(judgment.group || judgment.id || 'impact');
            const audioSlot = pattern.slots.find(item => item.judgmentGroup === group) || null;
            const audioFiles = routeFiles(audioSlot?.effective);
            const audioName = audioFiles.length
                ? `${audioFiles.length > 1 ? `랜덤 ${audioFiles.length}개 · ` : ''}${fileName(audioFiles[0])}`
                : '미배정 · 우측 음원을 여기로 드래그';
            const audioWhen = audioSlot?.when || audioSlot?.effective?.when || 'hit';
            const whenLabel = { hit: '적중 시', contact: '접촉 시', always: '항상', miss: '비적중 시' }[audioWhen] || '적중 시';
            const row = document.createElement('article');
            row.className = `judgment-row${judgment.id === app.selectedJudgmentId ? ' selected' : ''}`;
            row.innerHTML = `<button type="button" class="select-judgment">${kindLabels[judgment.kind]?.split(' ')[0] || '💥'}</button>
                <select data-field="kind">${Object.entries(kindLabels).map(([value, label]) => `<option value="${value}"${judgment.kind === value ? ' selected' : ''}>${label}</option>`).join('')}</select>
                <select data-field="target">${Object.entries(targetLabels).map(([value, label]) => `<option value="${value}"${(judgment.target || 'primary') === value ? ' selected' : ''}>${label}</option>`).join('')}</select>
                <label>그룹<input data-field="group" value="${esc(judgment.group || judgment.id)}"></label>
                <label>${judgment.kind === 'damage' ? '데미지 (%)' : '강도'}${judgment.kind === 'damage'
                    ? `<input data-field="damagePercent" type="number" min="0" max="1000" step="1" value="${judgment.damagePercent ?? Math.round(Number(pattern.damageRatio || 0) * 100)}">`
                    : `<select data-field="size"><option value="small"${judgment.size === 'small' ? ' selected' : ''}>소</option><option value="large"${judgment.size !== 'small' ? ' selected' : ''}>대</option></select>`}</label>
                ${judgment.kind === 'damage' ? `<label>피격 종류<select data-field="hitReactionKind">${Object.entries(reactionLabels).map(([value, label]) => `<option value="${value}"${(judgment.hitReactionKind || 'strong') === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label><label>속성<select data-field="element">${Object.entries(elementLabels).map(([value, label]) => `<option value="${value}"${(judgment.element || 'none') === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label>` : ''}
                <span>${esc(beat.label || beat.id)} · ${beat.startTicks + Number(judgment.offsetTicks || 0)}틱</span>
                <button type="button" class="judgment-audio-route${audioFiles.length ? ' assigned' : ''}"${audioSlot ? '' : ' disabled'} title="판정 사운드 배정 열기"><b>🎵 판정 음원</b><small>${esc(whenLabel)} · ${esc(audioName)}</small></button><button type="button" class="remove-judgment">×</button>`;
            row.querySelector('.select-judgment').onclick = () => {
                selectJudgmentEntry(beat, judgment);
            };
            row.querySelector('.judgment-audio-route').onclick = () => {
                if (!audioSlot) return;
                selectJudgmentEntry(beat, judgment, { scrollAudio: true });
            };
            row.querySelector('.remove-judgment').onclick = () => {
                app.session.removeJudgment(judgment.id); app.selectedJudgmentId = ''; renderPatternDesk();
            };
            row.querySelectorAll('[data-field]').forEach(input => input.onchange = () => {
                const value = input.dataset.field === 'damagePercent' ? Number(input.value) : input.value;
                app.session.updateJudgment(judgment.id, { [input.dataset.field]: value }); renderPatternDesk();
            });
            list.appendChild(row);
        }
        host.querySelector('.add-judgment').onclick = () => {
            const beatId = snapshot.selection.beatId || snapshot.timeline.beats[0]?.id;
            if (!beatId) return;
            app.session.addJudgment(beatId, { kind: 'damage', target: 'primary' });
            app.selectedJudgmentId = app.session.snapshot().timeline.beats
                .flatMap(beat => beat.judgments || []).at(-1)?.id || '';
            renderPatternDesk();
        };
    }

    function previewBeatDestination(beatId) {
        const beat = app.session.snapshot().timeline.beats.find(item => item.id === beatId);
        if (!beat) return;
        const destinationTick = Math.max(beat.startTicks, beat.endTicks - 0.01);
        app.session.seek(destinationTick);
        sendPreview({ scrub: true });
        seekPreview(destinationTick);
        renderSelectionOnly();
    }

    function rotationEditorModel(snapshot, beatId, value = {}) {
        const beats = snapshot?.timeline?.beats || [];
        let previous = 0;
        for (const beat of beats) {
            if (beat.id === beatId) break;
            const authored = snapshot?.draft?.[beat.id] || {};
            previous = HuntRotationContract.resolve(authored, previous).final;
        }
        return { ...HuntRotationContract.resolve(value, previous),
            keepRotation: value.keepRotation !== false };
    }

    function renderInspector(pattern) {
        const host = $('.transform-editor'); if (!host) return;
        const snapshot = app.session.snapshot(), beatId = snapshot.selection.beatId,
            value = snapshot.draft[beatId] || { ticks: 1 };
        const poseChoices = [['idle', '기본 · 변형 없음'], ['brace', '버팀 · 세로 압축'],
            ['crouch', '준비 · 세로 압축 / 아래 이동'], ['stretch', '늘림 · 세로 확장'],
            ['stretch-soft', '약한 늘림 · 세로 확장'], ['stretch-strong', '강한 늘림 · 세로 확장'],
            ['land', '착지 · 세로 압축'], ['settle', '반동 회수 · 세로 압축'],
            ['tail-whip', '꼬리 휘두름'], ['tail-slam', '꼬리 내려찍기'],
            ['spin-left', '회전 포즈 · 좌'], ['spin-right', '회전 포즈 · 우']];
        host.innerHTML = `<div class="transform-head"><b>이동 · 회전 · 이미지 변형</b><select class="beat-select">${snapshot.timeline.beats.map(beat => `<option value="${esc(beat.id)}"${beat.id === beatId ? ' selected' : ''}>${esc(beat.label || beat.id)}</option>`).join('')}</select></div><div class="anchor-editor">${anchorEditor(value)}<section class="anchor-field face-field"><b>이미지 좌우 방향</b><div class="anchor-map face-map" data-anchor-key="face">${[['', '유지'], ['left', '←'], ['right', '→'], ['target', '대상 쪽 좌우']].map(([direction, label]) => `<button type="button" data-anchor="${direction}" class="${String(value.face || '').replace('toward-target', 'target') === direction ? 'active' : ''}">${label}</button>`).join('')}</div><label class="body-aim-toggle"><input type="checkbox"${value.aimBodyAt ? ' checked' : ''}>대상까지 몸체 각도 맞춤</label></section></div><div class="transform-grid">
            <label>포즈<select data-key="pose">${options(poseChoices, value.pose || 'idle')}</select></label><label>X 이동<input data-key="offsetX" type="number" value="${value.offsetX ?? 0}"></label><label>Y 이동<input data-key="offsetY" type="number" value="${value.offsetY ?? 0}"></label>
            <label>투명도<input data-key="opacity" type="number" min="0" max="1" step=".05" value="${value.opacity ?? 1}"></label><section class="rotation-controls"><b>회전</b><div><button type="button" data-rotation-direction="counterclockwise" class="${rotationEditorModel(snapshot, beatId, value).direction === 'counterclockwise' ? 'active' : ''}">반시계</button><button type="button" data-rotation-direction="clockwise" class="${rotationEditorModel(snapshot, beatId, value).direction === 'clockwise' ? 'active' : ''}">시계</button></div><label>회전각°<input class="rotation-degrees" type="number" min="0" value="${rotationEditorModel(snapshot, beatId, value).degrees}"></label><label>최종각°<input class="rotation-final" type="number" value="${rotationEditorModel(snapshot, beatId, value).final}"></label><label class="rotation-reset-mode">복귀 회전<select data-key="rotationResetMode">${options([['auto','자동 · 복귀는 현재각 유지'],['preserve','누적각 유지'],['snap-end','복귀 끝에 즉시 정상화'],['animate','회전하며 정상화']], rotationEditorModel(snapshot, beatId, value).resetMode)}</select></label></section>
            <label>가로 배율<input data-key="scaleX" type="number" min=".05" step=".05" value="${value.scaleX ?? 1}"></label>
            <label>세로 배율<input data-key="scaleY" type="number" min=".05" step=".05" value="${value.scaleY ?? 1}"></label><label>회전축<input data-key="origin" value="${esc(value.origin || 'part:torso')}"></label>
            <label>X 기울기°<input data-key="skewX" type="number" value="${value.skewX ?? 0}"></label><label>Y 기울기°<input data-key="skewY" type="number" value="${value.skewY ?? 0}"></label>
            <section class="wide rotation-origin-picker"><b>회전 · 변형 축</b><div>${[['part:torso','몸통 중심'],['part:feet','발 중심'],['part:head','머리'],['part:tail','꼬리']].map(([origin,label]) => `<button type="button" data-origin="${origin}" class="${value.origin === origin || (!value.origin && origin === 'part:torso') ? 'active' : ''}">${label}</button>`).join('')}</div><small>회전·배율·기울기가 같은 부위 축을 공유함</small></section>
            <label class="wide">이동 속도<select data-key="moveEasing">${options(easings, value.moveEasing || 'smooth')}</select></label><label class="wide">회전 속도<select data-key="rotationEasing">${options(easings, value.rotationEasing || 'smooth')}</select></label>
            <label class="wide stride-toggle"><span>씰룩씰룩 좌우 반전</span><input class="stride-toggle-input" type="checkbox"${Number(value.strideFlipTicks) > 0 ? ' checked' : ''}></label>
            <label class="stride-period">반전 주기 (틱)<input data-key="strideFlipTicks" type="number" min="1" max="60" value="${Number(value.strideFlipTicks) > 0 ? Number(value.strideFlipTicks) : 3}"${Number(value.strideFlipTicks) > 0 ? '' : ' disabled'}></label>
            <label class="wide projectile-recoil-toggle"><span>발사 반동</span><input type="checkbox"${value.projectileRecoil ? ' checked' : ''}></label></div>`;
        // The destination grid is intentionally collapsible: it contains every
        // placement preset, but it should not bury the current BEAT's timing
        // and audio controls during ordinary review work.
        const anchorEditorNode = host.querySelector('.anchor-editor');
        const anchorDisclosure = document.createElement('details');
        anchorDisclosure.className = 'anchor-disclosure';
        // Placement, target and facing are first-class authored data.  They
        // must not look like missing controls on an untouched editor session.
        anchorDisclosure.open = app.anchorEditorExpanded !== false;
        anchorDisclosure.innerHTML = '<summary><b>배치 · 방향</b><span>도착 위치 · 대상 · 이미지 좌우</span></summary>';
        anchorEditorNode.before(anchorDisclosure);
        anchorDisclosure.append(anchorEditorNode);
        anchorDisclosure.ontoggle = () => { app.anchorEditorExpanded = anchorDisclosure.open; };
        host.querySelector('.beat-select').onchange = event => selectPart({ beatId: event.target.value });
        host.querySelectorAll('.anchor-map button').forEach(button => button.onclick = () => {
            const key = button.closest('.anchor-map').dataset.anchorKey;
            app.session.updateBeat(beatId, { [key]: button.dataset.anchor || null });
            renderPatternDesk(); previewBeatDestination(beatId);
        });
        host.querySelector('.body-aim-toggle input').onchange = event => {
            app.session.updateBeat(beatId, { aimBodyAt: event.target.checked ? 'target' : null });
            renderPatternDesk(); previewBeatDestination(beatId);
        };
        host.querySelectorAll('[data-origin]').forEach(button => button.onclick = () => {
            app.session.updateBeat(beatId, { origin: button.dataset.origin });
            renderPatternDesk(); sendPreview({ scrub: true }); seekPreview(app.session.scrub.tick);
        });
        const customAnchor = host.querySelector('[data-anchor-custom]');
        const applyCustomAnchor = () => {
            app.session.updateBeat(beatId, { [customAnchor.dataset.anchorCustom]: customAnchor.value || null });
            renderPatternDesk(); previewBeatDestination(beatId);
        };
        customAnchor.onchange = applyCustomAnchor;
        host.querySelector('.apply-anchor-custom').onclick = applyCustomAnchor;
        host.querySelector('.stride-toggle-input').onchange = event => {
            const period = host.querySelector('[data-key="strideFlipTicks"]');
            app.session.updateBeat(beatId, {
                // Keep an explicit zero so an override can disable an authored stride.
                // `null` is intentionally omitted by the save sanitizer, which made the
                // authored value reappear after reload and fail round-trip verification.
                strideFlipTicks: event.target.checked ? Math.max(1, Number(period.value) || 3) : 0
            });
            renderPatternDesk(); sendPreview({ scrub: true }); seekPreview(app.session.scrub.tick);
        };
        host.querySelector('.projectile-recoil-toggle input').onchange = event => {
            app.session.updateBeat(beatId, { projectileRecoil: event.target.checked });
            renderPatternDesk(); sendPreview({ scrub: true }); seekPreview(app.session.scrub.tick);
        };
        const applyRotationDegrees = (direction, rawDegrees) => {
            const current = rotationEditorModel(app.session.snapshot(), beatId, app.session.snapshot().draft[beatId]);
            const degrees = Math.max(0, Number(rawDegrees) || 0);
            const sign = direction === 'counterclockwise' ? -1 : 1;
            app.session.updateBeat(beatId, {
                rotationDirection: direction, rotationDegrees: degrees,
                rotation: null, rotateBy: null,
                rotateByFacing: null, keepRotation: null
            });
            // Direction is authored as a signed BEAT value.  Scrub the shared
            // renderer to this BEAT's terminal frame instead of starting a
            // separate timer-driven preview; full playback then keeps the
            // same clock and cannot be paused/replaced by this edit path.
            renderPatternDesk(); previewBeatDestination(beatId);
        };
        host.querySelectorAll('[data-rotation-direction]').forEach(button => button.onclick = () => {
            applyRotationDegrees(button.dataset.rotationDirection, host.querySelector('.rotation-degrees').value);
        });
        host.querySelector('.rotation-degrees').onchange = event => {
            const current = rotationEditorModel(app.session.snapshot(), beatId, app.session.snapshot().draft[beatId]);
            applyRotationDegrees(current.direction, event.target.value);
        };
        host.querySelector('.rotation-final').onchange = event => {
            const current = rotationEditorModel(app.session.snapshot(), beatId, app.session.snapshot().draft[beatId]);
            const rawFinal = Number(event.target.value) || 0;
            const final = current.resetMode === 'auto'
                ? rawFinal + 360 * Math.round((current.previous - rawFinal) / 360)
                : rawFinal;
            const delta = final - current.previous;
            app.session.updateBeat(beatId, {
                rotation: null, rotationDegrees: Math.abs(delta),
                rotationDirection: delta < 0 ? 'counterclockwise' : 'clockwise',
                rotateBy: null, rotateByFacing: null, keepRotation: null
            });
            renderPatternDesk(); previewBeatDestination(beatId);
        };
        host.querySelectorAll('[data-key]').forEach(input => input.onchange = () => {
            const key = input.dataset.key, textKeys = new Set([
                'at', 'to', 'origin', 'moveEasing', 'rotationEasing', 'rotationResetMode'
            ]);
            const patch = { [key]: textKeys.has(key) ? input.value : input.value === '' ? null : Number(input.value) };
            if (key === 'rotationResetMode') patch.keepRotation = null;
            app.session.updateBeat(beatId, patch); renderPatternDesk(); sendPreview({ scrub: true }); seekPreview(app.session.scrub.tick);
        });
    }

    function updateHistoryButtons() {
        const snapshot = app.session.snapshot();
        if ($('.undo-motion')) $('.undo-motion').disabled = !snapshot.canUndo;
        if ($('.redo-motion')) $('.redo-motion').disabled = !snapshot.canRedo;
        if ($('.reset-motion')) $('.reset-motion').disabled = !snapshot.dirty;
        if ($('.save-motion')) $('.save-motion').disabled = !snapshot.dirty;
    }

    async function saveMotion() {
        const pattern = selectedPattern(), beats = app.session.serialize(), button = $('.save-motion');
        button.disabled = true; button.textContent = '검증 중…';
        try {
            const result = await api('/api/hunt-pattern-motion', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ huntId: app.huntId, patternId: pattern.id,
                    candidate: app.candidateId === app.monster ? app.candidateId : '', beats,
                    expectedRevision: app.revisions.motion }) });
            assertGeneratedMotion(result);
            const candidateQuery = app.candidateId && app.candidateId === app.monster
                ? `&candidate=${encodeURIComponent(app.candidateId)}` : '';
            const reloaded = await api(`/api/hunt-patterns?monster=${encodeURIComponent(app.monster)}${candidateQuery}`);
            const persisted = reloaded.patterns.find(item => item.id === pattern.id);
            const verify = MonsterAudioReviewState.createMotionDraft(persisted, persisted.timeline);
            // The server owns persistence normalization and returns the exact
            // representation it atomically reloaded from disk. Compare that
            // canonical value with the catalog reload; comparing the raw UI
            // draft here produced false failures after canonical cleanup (for
            // example when changing rotationResetMode).
            const savedBeats = result.beats || beats;
            const comparison = MonsterAudioReviewState.compareMotionValues(savedBeats, verify);
            if (!comparison.equal) {
                throw new Error(`저장 후 재로드 검증 실패 · 불일치: ${comparison.differences.join(', ')}`);
            }
            app.patterns = reloaded.patterns; app.revisions = reloaded.revisions || app.revisions;
            app.selectedPatternId = pattern.id; app.session.load(persisted);
            renderPatternList(); renderPatternDesk(); button.textContent = '저장';
        } catch (error) { button.disabled = false; button.textContent = error.message; }
    }

    function resetMotion() {
        if (!selectedPattern() || !app.session.snapshot().dirty) return;
        if (!confirm('편집 중인 변경을 버리고 최근 저장 상태로 되돌릴까요?')) return;
        app.session.restoreSaved();
        renderPatternDesk();
        sendPreview({ scrub: true });
    }

    function renderPatternDesk() {
        stopPreviewAudio(); const pattern = selectedPattern(), titleHost = $('#patternTitleHost'); titleHost.textContent = '';
        if (!pattern) { $('#patternDesk').className = 'empty'; $('#patternDesk').textContent = '패턴 데이터가 없습니다.'; return; }
        $('#patternDesk').className = '';
        titleHost.innerHTML = `<div class="pattern-title"><div><h1>${esc(pattern.name)}</h1><code>${esc(pattern.id)}</code></div><div class="tag-row">${[pattern.type, pattern.delivery, ...(pattern.tags || []).slice(0, 4)].filter(Boolean).map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div></div>`;
        renderTimeline(pattern);
    }

    function selectPattern(id, autoplay) {
        const pattern = app.patterns.find(item => item.id === id); if (!pattern) return;
        // Playing the already-selected pattern must execute the live editor
        // draft. Reloading here silently discarded unsaved transform changes,
        // so both rotation buttons replayed the same persisted direction.
        if (app.selectedPatternId === id && app.session.snapshot().timeline.beats.length) {
            if (autoplay) playCurrentPreview();
            return;
        }
        app.selectedPatternId = id; app.session.load(pattern); app.selectedSlot = app.session.selection.slotId;
        renderPatternList(); renderPatternDesk(); refreshSourceSelection(); app.renderScenario?.();
        if (autoplay) playCurrentPreview();
        else {
            // A selection is an edit-cursor change, not playback. Do not even
            // instantiate the newly selected graph: reset the previous owner
            // and leave the monster motionless at its authored home pose.
            sendPreview({ scrub: true, reset: true, resetOnly: true });
        }
    }

    async function loadPatterns(keepPattern = '', keepSlot = '') {
        const candidateQuery = app.candidateId && app.candidateId === app.monster
            ? `&candidate=${encodeURIComponent(app.candidateId)}` : '';
        const result = await api(`/api/hunt-patterns?monster=${encodeURIComponent(app.monster)}${candidateQuery}`);
        app.huntId = result.huntId;
        const commonBreakRoute = globalThis.HUNT_MONSTER_PATTERN_AUDIO_ROUTES
            ?.common?.['__visual.part-break']?.['beat:se'] || null;
        app.systemAudioPattern = {
            id: '__visual.part-break', name: '공통 부위파괴 SE',
            slots: [{ slot: 'beat:se', label: '공통 부위파괴 SE',
                current: commonBreakRoute, assigned: commonBreakRoute,
                effective: commonBreakRoute, muted: commonBreakRoute?.disabled === true }]
        };
        app.patterns = (result.patterns || []).filter(pattern => pattern.id !== '__visual.part-break');
        syncInheritedReactionAudio();
        app.partReactions = result.partReactions || []; app.revisions = result.revisions || app.revisions;
        const id = app.patterns.some(pattern => pattern.id === keepPattern) ? keepPattern : app.patterns[0]?.id;
        app.selectedPatternId = id || '';
        const pattern = selectedPattern(); if (pattern) app.session.load(pattern);
        app.selectedSlot = pattern?.slots.some(slot => slot.slot === keepSlot) ? keepSlot : app.session.selection.slotId;
    }

    async function saveRoute(payload) {
        const result = await api('/api/hunt-pattern-route', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, candidate: app.candidateId === app.monster ? app.candidateId : '', expectedRevision: app.revisions.audio }) });
        assertGeneratedAudioRoute(result);
        app.revisions.audio = result.sourceRevision || app.revisions.audio;
        const pattern = app.patterns.find(item => item.id === payload.patternId);
        const slot = pattern?.slots.find(item => item.slot === payload.slot);
        if (slot) {
            const files = Array.isArray(result.files) ? result.files : [];
            const assigned = files.length ? {
                label: payload.label || null,
                ...(result.mode === 'random' ? { mode: 'random' } : {}),
                ...(result.when ? { when: result.when } : {}),
                layers: files.map(file => [file, Number(payload.gain) || .7, Number(payload.delay) || 0])
            } : (result.disabled ? { disabled: true, ...(result.when ? { when: result.when } : {}) }
                : (result.when ? { when: result.when } : null));
            slot.override = assigned;
            if (result.when) slot.when = result.when;
            slot.muted = assigned?.disabled === true;
            slot.assigned = slot.muted ? null : (assigned || slot.current || null);
            slot.effective = slot.assigned;
        }
        const reloadsSharedReaction = ['__reaction.knockdown', '__reaction.stun'].includes(payload.patternId);
        if (reloadsSharedReaction) {
            await loadPatterns(app.selectedPatternId, app.selectedSlot);
        } else syncInheritedReactionAudio();
        // Never remount the source rail for route assignment/removal. Updating
        // the selected slot in place preserves its scroll, open groups and focus.
        renderPatternList();
        const activePattern = selectedPattern();
        if (activePattern) renderSlotFlow(activePattern);
        renderProgress(); refreshSourceSelection();
    }

    function assertGeneratedMotion(result) {
        if (!result.generated && !result.candidateSaved) throw new Error('저장 검증 실패: 런타임 모션 모듈 미생성');
    }

    function assertGeneratedAudioRoute(result) {
        if (!result?.generated) throw new Error('저장 검증 실패: 런타임 사운드 모듈 미생성');
    }

    async function clearSlot(patternId, slot) {
        await saveRoute({ huntId: app.huntId, patternId, slot, files: [], disabled: true });
    }

    async function assignSource(source) {
        const pattern = selectedPattern(), slot = selectedSlot(); if (!pattern || !slot || !source.path) return;
        await assignSourceToSlot(source, pattern.id, slot.slot);
    }

    async function assignSourceToSlot(source, patternId, slotId) {
        if (!source?.path || !patternId || !slotId) return;
        const slot = app.patterns.find(pattern => pattern.id === patternId)?.slots
            .find(item => item.slot === slotId);
        await saveRoute({ huntId: app.huntId, patternId, slot: slotId, files: [source.path],
            ...(slot?.judgmentGroup ? { when: slot.when || slot.effective?.when || 'hit' } : {}) });
    }

    async function assignSourceGroup(group, sources) {
        // The source rail intentionally stays mounted while timeline selection
        // changes. Never use the pattern/slot captured when that rail rendered:
        // resolve the live destination at click time or a group can silently be
        // written into the previously selected pattern moment.
        const pattern = selectedPattern(), slot = selectedSlot();
        const available = (sources || []).filter(source => source?.path);
        if (!pattern || !slot) throw new Error('타임라인에서 배정할 사운드 순간을 먼저 선택하세요.');
        if (!available.length) throw new Error('배정할 디코딩 음원이 없습니다.');
        await saveRoute({
            huntId: app.huntId,
            patternId: pattern.id,
            slot: slot.slot,
            files: available.map(source => source.path),
            mode: available.length > 1 ? 'random' : null,
            ...(slot.judgmentGroup ? { when: slot.when || slot.effective?.when || 'hit' } : {}),
            label: available.length > 1 ? `${group.bank} · EVENT ${group.eventId}` : null
        });
    }

    function installRouteDrag(row, pattern, slot) {
        row.querySelectorAll('[data-route-file]').forEach(file => {
            file.ondragstart = event => beginRouteDrag(event, {
                kind: 'route-file', patternId: pattern.id, fromSlot: slot.slot, file: file.dataset.routeFile
            }, 'move');
            file.ondragend = finishRouteDrag;
        });
        row.ondragover = event => {
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = app.dragPayload?.kind === 'route-file' ? 'move' : 'copy';
            row.classList.add('drag-over');
        };
        row.ondragleave = event => {
            if (!row.contains(event.relatedTarget)) row.classList.remove('drag-over');
        };
        row.ondrop = async event => {
            event.preventDefault(); row.classList.remove('drag-over');
            const payload = droppedRoutePayload(event);
            try {
                if (payload?.kind === 'source') {
                    await assignSourceToSlot({ path: payload.path }, pattern.id, slot.slot);
                    return;
                }
                if (!payload || payload.kind !== 'route-file' || payload.fromSlot === slot.slot) return;
                if (payload.patternId !== pattern.id) throw new Error('다른 패턴의 배정 음원은 복사 버튼으로 복사한 뒤 대상 순간에 배정해주세요.');
                await api('/api/hunt-pattern-route-move', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ huntId: app.huntId, patternId: pattern.id, candidate: app.candidateId === app.monster ? app.candidateId : '', fromSlot: payload.fromSlot, toSlot: slot.slot, file: payload.file, expectedRevision: app.revisions.audio }) });
                await loadPatterns(pattern.id, slot.slot);
                renderPatternList(); renderPatternDesk(); refreshSourceSelection();
            } catch (error) {
                alert(error.message || '음원 드래그 배정에 실패했습니다.');
            } finally {
                finishRouteDrag();
            }
        };
    }

    function playSource(source, button) {
        if (!source.path) return; audio.src = `/audio?path=${encodeURIComponent(source.path)}`;
        resetAudioClock(); app.playingButton = button; button.classList.add('playing', 'audio-clock'); button.style.setProperty('--audio-progress', '0%'); audio.play().catch(() => {});
    }

    function openSourceMapping(mapping) {
        if (mapping.patternId === '__visual.part-break') {
            renderPartReactionEditor();
            const card = document.querySelector('.common-part-break-audio');
            card?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            card?.classList.add('source-focus');
            setTimeout(() => card?.classList.remove('source-focus'), 1600);
            return;
        }
        const pattern = app.patterns.find(item => item.id === mapping.patternId); if (!pattern) return;
        app.selectedPatternId = pattern.id; app.session.load(pattern); app.selectedSlot = mapping.slotId;
        app.session.select({ slotId: mapping.slotId });
        renderPatternList(); renderPatternDesk(); refreshSourceSelection(); app.renderScenario?.();
        seekPreview(app.session.scrub.tick);
        document.querySelector(`.slot-card[data-slot="${CSS.escape(mapping.slotId)}"]`)
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function revealSource(path) {
        if (!path) return;
        app.sourceFocusPath = path; app.temporarilyRevealedSources.add(path);
        renderSources();
        const rows = app.sourceRowsByPath.get(path) || [], row = rows[0];
        if (!row) return;
        row.closest('details')?.setAttribute('open', '');
        row.classList.add('source-focus');
        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setTimeout(() => row.classList.remove('source-focus'), 1800);
    }

    function toggleSourceHidden(path) {
        if (!path) return;
        app.hiddenSourcePaths.has(path) ? app.hiddenSourcePaths.delete(path) : app.hiddenSourcePaths.add(path);
        app.temporarilyRevealedSources.delete(path); app.sourceFocusPath = '';
        saveSourcePreferences(); renderSources();
    }

    function toggleSourceGroupHidden(key) {
        if (!key) return;
        app.hiddenSourceGroups.has(key) ? app.hiddenSourceGroups.delete(key) : app.hiddenSourceGroups.add(key);
        saveSourcePreferences(); renderSources();
    }

    function toggleSourceGroupFavorite(key) {
        if (!key) return;
        app.favoriteSourceGroups.has(key) ? app.favoriteSourceGroups.delete(key) : app.favoriteSourceGroups.add(key);
        saveSourcePreferences(); renderSources();
    }

    function renderSourceMappingButtons(host, mappings = []) {
        if (!host) return;
        host.textContent = '';
        mappings.forEach(mapping => {
            const button = document.createElement('button');
            button.type = 'button'; button.className = 'source-map-link'; button.textContent = '🔗';
            button.title = `${mapping.patternName} · ${mapping.slotLabel} 열기`;
            button.setAttribute('aria-label', button.title);
            button.onclick = event => { event.preventDefault(); event.stopPropagation(); openSourceMapping(mapping); };
            host.appendChild(button);
        });
    }

    audio.ontimeupdate = () => { const button = app.playingButton; if (!button || !Number.isFinite(audio.duration) || audio.duration <= 0) return; button.style.setProperty('--audio-progress', `${Math.min(100, audio.currentTime / audio.duration * 100)}%`); };
    audio.onended = () => resetAudioClock();

    function refreshSourceSelection() {
        const slot = selectedSlot(), pattern = selectedPattern(), current = new Set(routeFiles(slot?.effective));
        const mappingIndex = sourceMappingIndex();
        const banner = $('#sourceList .selection-banner');
        if (banner) banner.innerHTML = slot
            ? `배정 대상 · <b>${esc(pattern.name)} / ${esc(slot.label)}</b>`
            : '타임라인에서 사운드 시점을 선택하세요';
        for (const [path, rows] of app.sourceRowsByPath) {
            const active = current.has(path);
            for (const row of rows) {
                row.classList.toggle('current-slot-source', active);
                const button = row.querySelector('.slot-pick');
                if (button) { button.textContent = active ? '현재' : '배정'; button.disabled = !slot; }
                renderSourceMappingButtons(row.querySelector('.source-map-links'), mappingIndex.get(path) || []);
            }
        }
        for (const view of app.sourceGroupViews) {
            const selectedCount = view.paths.filter(path => current.has(path)).length;
            const isExactRoute = view.paths.length > 0
                && selectedCount === view.paths.length
                && current.size === view.paths.length;
            view.details.classList.toggle('has-current-source', selectedCount > 0);
            if (view.assignButton) {
                view.assignButton.disabled = !slot;
                view.assignButton.classList.toggle('current', isExactRoute);
                if (view.isSingle) view.assignButton.textContent = isExactRoute ? '현재' : '배정';
            }
        }
    }

    async function saveLabel(group, preset, custom, status) {
        const selected = app.presets[preset];
        const sourceIds = group.sources.map(source => Number(source.sourceId)).filter(Number.isFinite);
        if (!sourceIds.length) throw new Error('배정할 음원 소스가 없습니다.');
        status.textContent = '매핑 중…';
        const result = await api('/api/group-label', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                monster: app.monster,
                bank: group.bank,
                eventId: group.eventId,
                sourceIds,
                category: preset,
                customLabel: preset === 'custom' ? custom : ''
            })
        });
        if (!result.runtime?.outputPath) throw new Error('반응 음성 런타임 생성에 실패했습니다.');
        group.groupTags = result.tags || [];
        status.textContent = preset === 'clear'
            ? '매핑 해제됨'
            : `${selected?.label || '반응 음성'} 매핑 완료`;
        renderSources();
    }

    function renderSources() {
        const root = $('#sourceList'), query = $('#sourceSearch').value.trim().toLowerCase(), filter = $('#scopeFilter').value,
            slot = selectedSlot(), pattern = selectedPattern(), current = new Set(routeFiles(slot?.effective));
        const mappingIndex = sourceMappingIndex(), linkedPaths = new Set(mappingIndex.keys());
        const previousScrollTop = root.scrollTop;
        const openGroups = new Set([...root.querySelectorAll('details.event-group[open][data-group-key]')]
            .map(details => details.dataset.groupKey));
        app.sourceRowsByPath.clear(); app.sourceGroupViews = [];
        root.textContent = '';
        const banner = document.createElement('div'); banner.className = 'selection-banner'; banner.innerHTML = slot ? `배정 대상 · <b>${esc(pattern.name)} / ${esc(slot.label)}</b>` : '타임라인에서 사운드 순간을 선택하세요.'; root.appendChild(banner);
        let matchedGroups = 0, renderedGroups = 0;
        const commonFilter = filter === 'common' || filter === 'common-part-break' || filter === 'common-items';
        const sourcePool = commonFilter ? app.commonGroups : app.groups;
        app.autoFavoriteSourceGroups = AUTO_FAVORITE_MAPPED_MONSTERS.has(app.huntId)
            ? new Set(sourcePool.filter(group => group.sources.some(source => linkedPaths.has(source.path))).map(sourceGroupKey))
            : new Set();
        const orderedGroups = sourcePool.map((group, order) => ({ group, order })).sort((left, right) => {
            const favoriteDelta = Number(sourceGroupIsFavorite(sourceGroupKey(right.group)))
                - Number(sourceGroupIsFavorite(sourceGroupKey(left.group)));
            if (favoriteDelta) return favoriteDelta;
            if (!app.linkedSourcesFirst) return left.order - right.order;
            const leftLinked = left.group.sources.some(source => linkedPaths.has(source.path));
            const rightLinked = right.group.sources.some(source => linkedPaths.has(source.path));
            return Number(rightLinked) - Number(leftLinked) || left.order - right.order;
        });
        for (const { group } of orderedGroups) {
            const groupKey = sourceGroupKey(group);
            const reviewed = group.groupTags.length > 0, haystack = [group.bank, group.eventId, ...group.groupTags, ...group.sources.map(source => source.path)].join(' ').toLowerCase();
            const containsFocus = group.sources.some(source => source.path === app.sourceFocusPath);
            const groupHidden = app.hiddenSourceGroups.has(groupKey);
            if (groupHidden && !app.showHiddenSources && !containsFocus) continue;
            if (!containsFocus && query && !haystack.includes(query)) continue;
            if (!containsFocus && (filter === 'common-part-break' && group.commonCategory !== 'part-break'
                || filter === 'common-items' && !String(group.commonCategory || '').startsWith('items-')
                || filter === 'voice' && group.sourceLayer !== 'voice'
                || filter === 'sound-effect' && group.sourceLayer !== 'sound-effect'
                || filter === 'reviewed' && !reviewed
                || filter === 'unreviewed' && reviewed)) continue;
            matchedGroups += 1;
            const containsCurrent = group.sources.some(source => current.has(source.path));
            if (renderedGroups >= app.sourceRenderLimit && !containsCurrent && !containsFocus) continue;
            renderedGroups += 1;
            const details = document.createElement('details'); details.className = 'event-group';
            details.dataset.groupKey = groupKey;
            details.classList.toggle('hidden-source-group', groupHidden);
            const autoFavorite = app.autoFavoriteSourceGroups.has(groupKey);
            const favorite = sourceGroupIsFavorite(groupKey);
            details.classList.toggle('favorite-source-group', favorite);
            details.open = containsFocus || openGroups.has(details.dataset.groupKey);
            details.innerHTML = `<summary><span class="group-audio-actions"><button class="play-group" title="그룹 재생">▶</button><button class="hide-group" title="${groupHidden ? '그룹 숨김 해제' : '그룹 숨기기'}" aria-label="${groupHidden ? '그룹 숨김 해제' : '그룹 숨기기'}">${groupHidden ? '🙈' : '👁'}</button><button class="favorite-group${favorite ? ' active' : ''}" title="${autoFavorite ? '기존 맵핑 자동 즐겨찾기' : '즐겨찾기'}" aria-label="${autoFavorite ? '기존 맵핑 자동 즐겨찾기' : '즐겨찾기'}" aria-pressed="${favorite}">★</button></span><span class="event-title"><strong>${esc(group.bank)} · EVENT ${esc(group.eventId)}</strong><small>${group.sources.length} SOURCES${group.groupTags.length ? ` · ${esc(group.groupTags.join(', '))}` : ''}</small></span><span class="event-badges"><span class="badge">${esc(group.categoryLabel || group.sourceLayer || '')}</span></span></summary><div class="event-classify"><button data-preset="smallFlinch">소경직</button><button data-preset="knockdown">대경직</button><button data-preset="death">죽음</button><input placeholder="직접 태그"><button data-preset="custom">저장</button><button data-preset="clear">지우기</button><span class="save-state"></span></div><div class="sources"></div>`;
            details.querySelector('.play-group').onclick = event => { event.preventDefault(); const available = group.sources.filter(source => source.path); if (available.length) playSource(available[0], event.currentTarget); };
            details.querySelector('.hide-group').onclick = event => { event.preventDefault(); event.stopPropagation(); toggleSourceGroupHidden(groupKey); };
            details.querySelector('.favorite-group').onclick = event => { event.preventDefault(); event.stopPropagation(); toggleSourceGroupFavorite(groupKey); };
            const status = details.querySelector('.save-state'), input = details.querySelector('input');
            details.querySelectorAll('[data-preset]').forEach(button => {
                const preset = app.presets[button.dataset.preset];
                const active = preset?.tags?.length
                    && preset.tags.every(tag => group.groupTags.includes(tag));
                button.classList.toggle('selected', Boolean(active));
                button.setAttribute('aria-pressed', active ? 'true' : 'false');
                button.onclick = () => saveLabel(group, button.dataset.preset, input.value, status)
                    .catch(error => status.textContent = error.message);
            });
            const sources = details.querySelector('.sources'), selectedFiles = group.sources.filter(source => current.has(source.path));
            const orderedSources = group.sources.map((source, order) => ({ source, order })).sort((left, right) =>
                app.linkedSourcesFirst
                    ? Number(linkedPaths.has(right.source.path)) - Number(linkedPaths.has(left.source.path)) || left.order - right.order
                    : left.order - right.order);
            for (const { source } of orderedSources) {
                const hidden = source.path && app.hiddenSourcePaths.has(source.path);
                const temporarilyVisible = app.temporarilyRevealedSources.has(source.path) || source.path === app.sourceFocusPath;
                if (hidden && !app.showHiddenSources && !temporarilyVisible) continue;
                const mappings = mappingIndex.get(source.path) || [];
                const row = document.createElement('div'); row.className = `source${current.has(source.path) ? ' current-slot-source' : ''}${source.path ? '' : ' no-file'}${hidden ? ' hidden-source' : ''}`;
                row.draggable = Boolean(source.path);
                row.innerHTML = `<button class="source-eye"${source.path ? '' : ' disabled'} title="${hidden ? '숨김 해제' : '이 음원 숨기기'}" aria-label="${hidden ? '숨김 해제' : '이 음원 숨기기'}">${hidden ? '🙈' : '👁'}</button><button class="play"${source.path ? '' : ' disabled'}>▶</button><span class="source-meta"><strong>ID ${esc(source.sourceId)}${source.stream != null ? ` · STREAM ${esc(source.stream)}` : ''}</strong><small>${esc(source.path ? fileName(source.path) : '디코딩 파일 없음')}</small></span><span class="source-row-actions"><span class="source-map-links"></span><button class="slot-pick"${source.path && slot ? '' : ' disabled'}>${current.has(source.path) ? '현재' : '배정'}</button></span>`;
                row.ondragstart = event => {
                    if (!source.path || event.target.closest('button')) { event.preventDefault(); return; }
                    beginRouteDrag(event, { kind: 'source', path: source.path }, 'copy');
                    row.classList.add('dragging-source');
                };
                row.ondragend = () => { row.classList.remove('dragging-source'); finishRouteDrag(); };
                row.querySelector('.source-eye').onclick = () => toggleSourceHidden(source.path);
                row.querySelector('.play').onclick = event => playSource(source, event.currentTarget);
                renderSourceMappingButtons(row.querySelector('.source-map-links'), mappings);
                row.querySelector('.slot-pick').onclick = () => assignSource(source).catch(error => alert(error.message)); sources.appendChild(row);
                if (source.path) {
                    if (!app.sourceRowsByPath.has(source.path)) app.sourceRowsByPath.set(source.path, []);
                    app.sourceRowsByPath.get(source.path).push(row);
                }
            }
            const available = group.sources.filter(source => source.path);
            let assignButton = null;
            if (available.length > 0 && slot) {
                const isSingle = available.length === 1;
                const isExactRoute = selectedFiles.length === available.length && current.size === available.length;
                const button = document.createElement('button');
                button.className = `group-assign${isSingle ? ' single-assign' : ''}${isExactRoute ? ' current' : ''}`;
                button.textContent = isSingle ? (isExactRoute ? '현재' : '배정') : '그룹배정';
                button.title = isSingle ? '이 음원을 선택한 사운드 순간에 배정' : '이 그룹 전체를 랜덤 재생으로 배정';
                button.onclick = event => {
                    event.preventDefault(); event.stopPropagation();
                    const operation = assignSourceGroup(group, available);
                    operation.catch(error => alert(error.message));
                };
                details.querySelector('summary').appendChild(button); assignButton = button;
            }
            app.sourceGroupViews.push({ details, assignButton, paths: available.map(source => source.path), isSingle: available.length === 1 });
            root.appendChild(details);
        }
        if (matchedGroups > renderedGroups) {
            const more = document.createElement('button'); more.type = 'button'; more.className = 'load-more-sources';
            more.textContent = `후보 ${matchedGroups - renderedGroups}묶음 더 보기`;
            more.onclick = () => { app.sourceRenderLimit += 80; renderSources(); };
            root.appendChild(more);
        }
        refreshSourceSelection();
        root.scrollTop = Math.min(previousScrollTop, Math.max(0, root.scrollHeight - root.clientHeight));
    }

    function categoryFor(monster) { return app.categories.find(category => category.id === monster?.category) || { id: 'other', label: '기타', icon: '🐾' }; }
    function renderMonsterPicker() {
        const selected = app.monsters.find(monster => monster.id === app.monster), category = categoryFor(selected), counts = new Map();
        for (const monster of app.monsters) counts.set(monster.category, (counts.get(monster.category) || 0) + 1);
        if (!app.pickerCategory || !counts.has(app.pickerCategory)) app.pickerCategory = selected?.category || app.categories.find(item => counts.has(item.id))?.id;
        $('#monsterPickerToggle .taxon-icon').textContent = category.icon; $('#monsterPickerToggle small').textContent = selected ? `${category.label} · ${selected.reviewStatus === 'completed' ? '검수 완료' : '미완료'}` : '몬스터 선택'; $('#monsterPickerToggle strong').textContent = selected?.name || '몬스터를 선택하세요';
        $('#monsterCategories').innerHTML = app.categories.filter(item => counts.has(item.id)).map(item => `<button class="monster-filter${item.id === app.pickerCategory ? ' active' : ''}" data-category="${esc(item.id)}"><span>${item.icon} ${esc(item.label)}</span><b>${counts.get(item.id)}</b></button>`).join('');
        const inCategory = app.monsters.filter(monster => monster.category === app.pickerCategory), filtered = inCategory.filter(monster => app.pickerStatus === 'all' || (app.pickerStatus === 'completed') === (monster.reviewStatus === 'completed')).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        $('#monsterStatuses').innerHTML = [['all', '전체'], ['pending', '미완료'], ['completed', '완료']].map(([id, label]) => `<button class="monster-filter${id === app.pickerStatus ? ' active' : ''}" data-status="${id}">${label}</button>`).join('');
        $('#monsterResults').innerHTML = filtered.map(monster => `<button class="monster-result${monster.id === app.monster ? ' selected' : ''}" data-monster="${esc(monster.id)}"><span><strong>${esc(monster.name)}</strong><small>${esc(monster.id)} · ${monster.groups}묶음</small></span><i class="review-dot${monster.reviewStatus === 'completed' ? ' completed' : ''}"></i></button>`).join('');
        document.querySelectorAll('[data-category]').forEach(button => button.onclick = () => { app.pickerCategory = button.dataset.category; app.pickerStatus = 'all'; renderMonsterPicker(); });
        document.querySelectorAll('[data-status]').forEach(button => button.onclick = () => { app.pickerStatus = button.dataset.status; renderMonsterPicker(); });
        document.querySelectorAll('[data-monster]').forEach(button => button.onclick = () => loadMonster(button.dataset.monster).then(closePicker).catch(showError));
    }

    function openPicker() { $('#monsterPicker').classList.add('open'); $('#monsterPickerPanel').hidden = false; renderMonsterPicker(); }
    function closePicker() { $('#monsterPicker').classList.remove('open'); $('#monsterPickerPanel').hidden = true; }

    async function setCompletion() {
        const monster = app.monsters.find(item => item.id === app.monster); if (!monster) return;
        const result = await api('/api/review-completion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monster: app.monster, completed: monster.reviewStatus !== 'completed' }) });
        monster.reviewStatus = result.reviewStatus; renderMonsterPicker(); renderCompletion();
    }

    function renderCompletion() {
        const monster = app.monsters.find(item => item.id === app.monster), done = monster?.reviewStatus === 'completed';
        $('#completeReview').classList.toggle('completed', done); $('#completeReview').textContent = done ? '검수 완료 ✓' : '검수 완료';
    }

    async function loadMonster(id) {
        app.monster = id; app.selectedPatternId = ''; app.selectedSlot = '';
        app.sourceRenderLimit = 80;
        loadSourcePreferences();
        const [groups] = await Promise.all([api(`/api/groups?monster=${encodeURIComponent(id)}`), loadPatterns()]);
        app.groups = groups.groups || []; localStorage.setItem('bubblechat.monsterAudioReview.lastMonster', id);
        renderMonsterPicker(); renderPatternList(); renderPatternDesk(); renderSources(); renderCompletion(); sendPreview({ scrub: true });
    }

    function showError(error) { $('#patternDesk').className = 'empty'; $('#patternDesk').textContent = error.message; }

    function installScenarioControls() {
        const controls = $('.preview-controls'), toggle = document.createElement('span'); toggle.className = 'view-toggle'; toggle.innerHTML = '<button type="button" data-view="runtime" class="active">실사용</button><button type="button" data-view="design">설계</button>'; controls.prepend(toggle);
        const panel = document.createElement('section'); panel.className = 'scenario-panel'; panel.hidden = true;
        panel.innerHTML = '<b>주 대상</b><span class="scenario-options primary-options"></span><b>피격 대상</b><span class="scenario-options forced-options"></span><div class="impact-options"></div><output class="scenario-readout"></output>';
        $('#previewStage').before(panel);
        const buttons = host => { host.innerHTML = [0, 1, 2, 3].map(index => `<button type="button" data-index="${index}">H${index + 1}</button>`).join(''); };
        buttons(panel.querySelector('.primary-options')); buttons(panel.querySelector('.forced-options'));
        const render = () => {
            const snapshot = app.session.snapshot(), scenario = snapshot.scenario; panel.hidden = scenario.view !== 'design';
            toggle.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.view === scenario.view));
            panel.querySelectorAll('.primary-options button').forEach(button => button.classList.toggle('active', Number(button.dataset.index) === scenario.primaryTargetIndex));
            panel.querySelectorAll('.forced-options button').forEach(button => button.classList.toggle('active', scenario.forcedTargetIndices.includes(Number(button.dataset.index))));
            const impacts = Math.max(1, selectedPattern()?.impactTimeline?.length || 1), host = panel.querySelector('.impact-options');
            host.innerHTML = Array.from({ length: impacts }, (_, impactIndex) => { const active = scenario.forcedImpactTargets.find(entry => entry.impactIndex === impactIndex)?.targetIndices || []; return `<span class="impact-option" data-impact="${impactIndex}"><b>${impactIndex + 1}타</b>${[0, 1, 2, 3].map(index => `<button type="button" data-index="${index}" class="${active.includes(index) ? 'active' : ''}">H${index + 1}</button>`).join('')}</span>`; }).join('');
            panel.querySelector('.scenario-readout').textContent = `주 대상 ${Number.isInteger(scenario.primaryTargetIndex) ? `H${scenario.primaryTargetIndex + 1}` : '자동'} · 피격 ${scenario.forcedTargetIndices.length ? scenario.forcedTargetIndices.map(index => `H${index + 1}`).join(', ') : '패턴 규칙'}`;
        };
        toggle.onclick = event => { const button = event.target.closest('button'); if (!button) return; app.session.setScenario({ view: button.dataset.view }); render(); syncPreviewSettings(); };
        panel.querySelector('.primary-options').onclick = event => { const button = event.target.closest('button'); if (!button) return; app.session.setScenario({ primaryTargetIndex: Number(button.dataset.index) }); render(); syncPreviewSettings(); };
        panel.querySelector('.forced-options').onclick = event => { const button = event.target.closest('button'); if (!button) return; const values = new Set(app.session.scenario.forcedTargetIndices); values.has(Number(button.dataset.index)) ? values.delete(Number(button.dataset.index)) : values.add(Number(button.dataset.index)); app.session.setScenario({ forcedTargetIndices: [...values] }); render(); syncPreviewSettings(); };
        panel.querySelector('.impact-options').onclick = event => { const button = event.target.closest('button'), row = event.target.closest('.impact-option'); if (!button || !row) return; const impactIndex = Number(row.dataset.impact), target = Number(button.dataset.index), entries = app.session.scenario.forcedImpactTargets.map(entry => ({ ...entry, targetIndices: [...entry.targetIndices] })), entry = entries.find(item => item.impactIndex === impactIndex) || { impactIndex, targetIndices: [] }, values = new Set(entry.targetIndices); values.has(target) ? values.delete(target) : values.add(target); entry.targetIndices = [...values]; app.session.setScenario({ forcedImpactTargets: [...entries.filter(item => item.impactIndex !== impactIndex), entry] }); render(); syncPreviewSettings(); };
        $('#previewTarget').onchange = () => { app.previewRandomPairTarget = ''; syncPreviewSettings(); };
        $('#previewState').onchange = () => { app.session.setScenario({ monsterState: $('#previewState').value }); syncPreviewSettings(); };
        $('#anatomyToggle').classList.toggle('active', app.anatomy);
        $('#anatomyToggle').onclick = () => { app.anatomy = !app.anatomy; $('#anatomyToggle').classList.toggle('active', app.anatomy); bridge.send('bubblechat:pattern-anatomy', { enabled: app.anatomy }); };
        app.renderScenario = render; render();
    }

    addEventListener('message', async event => {
        if (event.origin !== previewOrigin() || event.source !== previewFrame().contentWindow) return;
        const message = event.data || {};
        if (message.type === 'bubblechat:pattern-preview-ready') { bridge.markReady(); sendPreview({ scrub: true }); bridge.send('bubblechat:pattern-anatomy', { enabled: app.anatomy }); return; }
        if (message.type === 'bubblechat:pattern-preview-playback') {
            document.body.dataset.previewPlaybackToken = String(message.playbackToken || '');
            if (message.ok) startPlaybackProgress(message);
            else { stopPlaybackProgress(); $('#nowTitle').textContent = `재생 실패 · ${message.reason || '패턴 없음'}`; }
            return;
        }
        if (message.type === 'bubblechat:pattern-preview-edit') {
            const beatId = message.beatId; if (!app.session.draft[beatId]) return;
            if (message.commit) { app.gizmoEditingBeat = ''; renderPatternDesk(); return; }
            const first = app.gizmoEditingBeat !== beatId; app.gizmoEditingBeat = beatId;
            const patch = { ...(message.patch || {}) };
            // A freehand gizmo angle is an absolute terminal angle. Clear the
            // directed representation so the same beat cannot have two
            // competing rotation owners.
            if (patch.rotation !== undefined) {
                patch.rotationDirection = null;
                patch.rotationDegrees = null;
            }
            app.session.updateBeat(beatId, patch, { record: first }); renderTimelineVisualOnly(); renderInspector(selectedPattern()); return;
        }
        if (message.type === 'bubblechat:monster-anatomy-edit') {
            const result = await api('/api/hunt-monster-anatomy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monsterId: app.huntId, geometry: message.geometry, expectedRevision: app.revisions.anatomy }) });
            app.revisions.anatomy = result.sourceRevision || app.revisions.anatomy;
        }
    });

    addEventListener('keydown', event => {
        if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
        const redo = event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey), undo = event.key.toLowerCase() === 'z' && !event.shiftKey;
        if (!undo && !redo) return; event.preventDefault(); redo ? app.session.redo() : app.session.undo(); renderPatternDesk(); sendPreview({ scrub: true });
    });

    async function init() {
        await migrateLegacyPortPreferences();
        try {
            const storedClipboard = JSON.parse(localStorage.getItem('bubblechat.monsterAudioReview.routeClipboard') || 'null');
            if (storedClipboard?.path) app.routeClipboard = storedClipboard;
        } catch { app.routeClipboard = null; }
        const metadata = await api('/api/monsters');
        if (metadata.apiVersion !== 3 || metadata.buildId !== 'unified-editor-v3') throw new Error('편집기 서버 버전 불일치 · 서버를 재시작하세요.');
        app.capabilities = metadata.capabilities || []; app.buildId = metadata.buildId; app.presets = metadata.presets || {}; app.monsters = metadata.monsters || []; app.categories = metadata.categories || [];
        installPairPreviewTargets();
        const reviewQuery = new URLSearchParams(location.search);
        const candidate = String(reviewQuery.get('candidate') || '').trim().toLowerCase();
        app.candidateId = candidate;
        const requestedPreviewMonster = String(reviewQuery.get('monster') || '').trim();
        const previewPath = metadata.previewPath || '/preview/?embed=1';
        const previewQuery = new URLSearchParams(previewPath.includes('?')
            ? previewPath.slice(previewPath.indexOf('?') + 1) : '');
        if (candidate) previewQuery.set('candidate', candidate);
        // The iframe must receive the selected monster before its first paint.
        // Otherwise the lab's Tigerx default flashes briefly before the editor
        // posts the actual selection.
        if (requestedPreviewMonster) previewQuery.set('monster', requestedPreviewMonster);
        previewFrame().src = `${previewPath.split('?')[0]}?${previewQuery.toString()}`;
        const resizePreview = () => { const stage = $('#previewStage'); previewFrame().style.transform = `scale(${stage.clientWidth / 1920})`; };
        new ResizeObserver(resizePreview).observe($('#previewStage')); resizePreview();
        installScenarioControls();
        installCombatSimulationControls();
        $('#monsterPickerToggle').onclick = () => $('#monsterPickerPanel').hidden ? openPicker() : closePicker();
        $('.undo-motion').onclick = () => { app.session.undo(); renderPatternDesk(); sendPreview({ scrub: true }); };
        $('.redo-motion').onclick = () => { app.session.redo(); renderPatternDesk(); sendPreview({ scrub: true }); };
        $('.reset-motion').onclick = resetMotion;
        $('.save-motion').onclick = saveMotion;
        document.addEventListener('pointerdown', event => { if (!event.target.closest('#monsterPicker')) closePicker(); });
        let sourceFilterFrame = 0;
        $('#sourceSearch').oninput = () => { cancelAnimationFrame(sourceFilterFrame); sourceFilterFrame = requestAnimationFrame(() => { app.sourceRenderLimit = 80; renderSources(); }); };
        $('#scopeFilter').onchange = async () => {
            app.sourceRenderLimit = 80;
            if ($('#scopeFilter').value.startsWith('common') && !app.commonGroups.length) {
                const result = await api('/api/common-groups');
                app.commonGroups = result.groups || [];
            }
            renderSources();
        };
        $('#sourceVisibilityToggle').onclick = () => {
            app.showHiddenSources = !app.showHiddenSources; saveSourcePreferences(); syncSourceToolbar(); renderSources();
        };
        $('#linkedFirstToggle').onclick = () => {
            app.linkedSourcesFirst = !app.linkedSourcesFirst; saveSourcePreferences(); syncSourceToolbar(); renderSources();
        };
        $('#completeReview').onclick = () => setCompletion().catch(showError);
        let initial = app.monsters.find(monster => monster.reviewStatus !== 'completed')?.id || app.monsters[0]?.id;
        const requested = String(new URLSearchParams(location.search).get('monster') || '').toLowerCase();
        const requestedMonster = app.monsters.find(monster =>
            monster.id === requested || String(monster.graphId || '').toLowerCase() === requested);
        const remembered = localStorage.getItem('bubblechat.monsterAudioReview.lastMonster');
        if (requestedMonster) initial = requestedMonster.id;
        else if (app.monsters.some(monster => monster.id === remembered)) initial = remembered;
        if (initial) await loadMonster(initial); else showError(new Error('검수할 몬스터 데이터가 없습니다.'));
    }

    init().catch(showError);
}());
