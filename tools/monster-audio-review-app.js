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
        monster: '', huntId: '', monsters: [], categories: [], groups: [], commonGroups: [], presets: {}, patterns: [],
        partReactions: [], systemAudioPattern: null,
        selectedPatternId: '', selectedSlot: '', selectedJudgmentId: '', anatomy: false, sourceQueue: [], previewTimers: [],
        previewAudios: [], capabilities: [], buildId: '', session: MonsterAudioReviewState.createEditorSession(),
        pickerCategory: '', pickerStatus: 'all', previewReady: false, previewSequence: 0,
        sourceRowsByPath: new Map(), sourceGroupViews: [], sourceRenderLimit: 80,
        hiddenSourcePaths: new Set(), temporarilyRevealedSources: new Set(),
        hiddenSourceGroups: new Set(), favoriteSourceGroups: new Set(),
        showHiddenSources: false, linkedSourcesFirst: false, sourceFocusPath: '', routeClipboard: null,
        routeLastRandomLayer: new Map(),
        revisions: { audio: '', motion: '', anatomy: '' }, playbackState: 'stopped',
        playbackStartedAt: 0, playbackElapsedMs: 0, playbackDurationMs: 0, playbackDurationTicks: 0
    };
    const audio = $('#audio');
    const selectedPattern = () => app.patterns.find(pattern => pattern.id === app.selectedPatternId) || null;
    const selectedSlot = () => selectedPattern()?.slots.find(slot => slot.slot === app.selectedSlot) || null;
    const routeFiles = route => (route?.layers || []).map(layer => Array.isArray(layer) ? layer[0] : layer).filter(Boolean);
    const fileName = file => String(file || '').split('/').pop();
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
    }
    const bridge = new PreviewBridge(previewFrame());

    function stopPreviewAudio() {
        for (const timer of app.previewTimers) clearTimeout(timer);
        for (const clip of app.previewAudios) { clip.pause(); clip.removeAttribute('src'); }
        app.previewTimers = [];
        app.previewAudios = [];
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
        const motionPayload = MonsterAudioReviewState.buildPreviewMotion(
            pattern, snapshot.timeline, app.session.draft);
        const preview = {
            ...pattern,
            animationDurationMs: snapshot.timeline.durationTicks * 100,
            movement: { ...(pattern.movement || {}), ticks: snapshot.timeline.durationTicks },
            runtimePreviewScrub: scrub,
            runtimePreviewCardReactions: true,
            // The review shell owns its audible timeline so slot clocks, drag
            // assignments and playback all describe the same source.  Keep the
            // embedded hunt renderer visual-only; otherwise its legacy phase
            // audio and BEAT audio are both heard on top of this timeline.
            runtimePreviewMuteAudio: true
        };
        if (motionPayload.useBeatMotion) preview.motion = motionPayload.motion;
        else {
            preview.motion = null;
            preview.runtimeTimingBeats = motionPayload.runtimeTimingBeats;
        }
        return preview;
    }

    function sendPreview({ scrub = false, play = false, reset = false, resetOnly = false } = {}) {
        const pattern = selectedPattern(), monster = app.monsters.find(item => item.id === app.monster);
        if (!pattern) return;
        const snapshot = app.session.snapshot();
        const playbackToken = play ? ++app.previewSequence : 0;
        if (!play) stopPlaybackProgress();
        bridge.send('bubblechat:pattern-preview', {
            monsterId: app.huntId,
            monster: { id: app.huntId, nameKO: monster?.name || app.huntId, filename: `${app.huntId}.png` },
            target: $('#previewTarget').value,
            state: snapshot.scenario.monsterState,
            scenario: { ...snapshot.scenario, selectedBeatId: snapshot.selection.beatId,
                editBeat: { ...(snapshot.draft[snapshot.selection.beatId] || {}) } },
            pattern: buildPreviewPattern({ scrub }),
            resetPreviewPose: Boolean(reset),
            resetOnly: Boolean(resetOnly),
            playbackToken
        });
        if (play) playTimelineAudio();
    }

    function syncPreviewSettings() {
        const snapshot = app.session.snapshot();
        bridge.send('bubblechat:pattern-preview-settings', {
            target: $('#previewTarget').value,
            state: snapshot.scenario.monsterState,
            scenario: { ...snapshot.scenario, selectedBeatId: snapshot.selection.beatId,
                editBeat: { ...(snapshot.draft[snapshot.selection.beatId] || {}) } }
        });
    }

    function installPairPreviewTargets() {
        const select = $('#previewTarget');
        if (!select || select.querySelector('option[value^="pair:"]')) return;
        [[0, 1], [1, 2], [2, 3]].forEach(([left, right]) => {
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
        for (const beat of snapshot.timeline.beats) {
            for (const slot of previewSlotsForBeat(pattern, beat)) {
                if (!slot.effective?.layers?.length) continue;
                const offsets = pattern.id === '__reaction.sleep' && beat.id === 'held'
                    ? Array.from({ length: Math.max(1, Math.ceil(beat.ticks / 30)) }, (_, index) => index * 30)
                        .filter(offset => offset < beat.ticks)
                    : [0];
                for (const offset of offsets) app.previewTimers.push(setTimeout(
                    () => playRoute(slot.effective, `${pattern.name} · ${slot.label}`),
                    (beat.startTicks + offset) * 100));
            }
        }
    }

    function playCurrentPreview() {
        if (app.playbackState === 'paused') {
            app.playbackState = 'playing';
            app.playbackStartedAt = performance.now() - app.playbackElapsedMs;
            bridge.send('bubblechat:pattern-preview-transport', { action: 'resume' });
            runPlaybackProgress(); updateTransportControls();
            return;
        }
        app.playbackState = 'playing'; app.playbackElapsedMs = 0;
        sendPreview({ play: true });
        updateTransportControls();
    }

    function stopPlaybackProgress({ preserveState = false } = {}) {
        if (app.playbackTimer) clearInterval(app.playbackTimer);
        app.playbackTimer = 0; app.playbackToken = 0;
        if (!preserveState) app.playbackState = 'stopped';
        updateTransportControls();
    }

    function runPlaybackProgress() {
        if (app.playbackState !== 'playing' || !app.playbackDurationMs) return;
        if (app.playbackTimer) clearInterval(app.playbackTimer);
        const frame = () => {
            if (app.playbackState !== 'playing') return;
            app.playbackElapsedMs = performance.now() - app.playbackStartedAt;
            const ratio = Math.max(0, Math.min(1, app.playbackElapsedMs / app.playbackDurationMs));
            const before = app.session.snapshot().selection.beatId;
            app.session.seek(app.playbackDurationTicks * ratio); updateTimelineCursor();
            renderSelectionOnly({ inspector: before !== app.session.snapshot().selection.beatId });
            if (ratio >= 1) { stopPreviewAudio(); stopPlaybackProgress(); }
        };
        frame(); app.playbackTimer = setInterval(frame, 33);
    }

    function pauseCurrentPreview() {
        if (app.playbackState !== 'playing') return;
        app.playbackElapsedMs = performance.now() - app.playbackStartedAt;
        app.playbackState = 'paused';
        if (app.playbackTimer) clearInterval(app.playbackTimer);
        app.playbackTimer = 0;
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
            row.innerHTML = `<span class="slot-order">${esc(slot.phase || 'beat')}</span><span class="slot-name"><strong>${esc(slot.label)}</strong><small>${slot.atTicks ?? 0}틱 · ${esc(slot.phase || '')}</small></span><div class="slot-route">${routeHtml(slot)}</div><span class="slot-actions"><button type="button" class="icon-button paste-route" title="복사한 음원 붙여넣기" aria-label="복사한 음원 붙여넣기"${app.routeClipboard?.path ? '' : ' disabled'}>📥</button><button type="button" class="icon-button play-slot"${slot.effective ? '' : ' disabled'}>▶</button><button type="button" class="icon-button clear-slot"${slot.assigned ? '' : ' disabled'}>✕</button></span>`;
            row.onclick = event => { if (!event.target.closest('.slot-actions')) selectPart({ slotId: slot.slot }); };
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
        host.innerHTML = `<section class="beat-card timeline-docked"><div class="section-kicker"><b>모션 타임라인</b><span class="beat-source">단일 실행기 · ${snapshot.timeline.durationTicks}틱</span></div><div class="beat-track"></div></section><div class="section-kicker"><b>사운드 순간 선택</b><span>타임라인과 항상 동기화</span></div><section id="slotFlow" class="slot-flow"></section><section class="motion-editor"></section><section class="part-reaction-editor"></section>`;
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
            node.onclick = event => { if (!event.target.closest('.beat-handle')) selectPart({ beatId: beat.id }); };
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
            marker.onclick = event => { event.stopPropagation(); app.selectedJudgmentId = judgment.id; renderPatternDesk(); };
            installUnifiedJudgmentDrag(marker, beat, judgment, track);
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
        app.session.select(request); updateTimelineCursor(); renderSelectionOnly(); seekPreview(app.session.scrub.tick);
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
        const judgmentHost = document.createElement('section');
        judgmentHost.className = 'judgment-manager';
        host.appendChild(judgmentHost);
        renderJudgmentManager();
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
        const targetLabels = { primary: '주 헌터', left: '주 헌터 좌측', right: '주 헌터 우측',
            pair: '2인 동시', 'pair-left': '2인 좌', 'pair-right': '2인 우',
            'primary-adjacent': '주 헌터+좌우', all: '전체' };
        const list = host.querySelector('.judgment-list');
        for (const { beat, judgment } of entries) {
            const row = document.createElement('article');
            row.className = `judgment-row${judgment.id === app.selectedJudgmentId ? ' selected' : ''}`;
            row.innerHTML = `<button type="button" class="select-judgment">${kindLabels[judgment.kind]?.split(' ')[0] || '💥'}</button>
                <select data-field="kind">${Object.entries(kindLabels).map(([value, label]) => `<option value="${value}"${judgment.kind === value ? ' selected' : ''}>${label}</option>`).join('')}</select>
                <select data-field="target">${Object.entries(targetLabels).map(([value, label]) => `<option value="${value}"${(judgment.target || 'primary') === value ? ' selected' : ''}>${label}</option>`).join('')}</select>
                <label>그룹<input data-field="group" value="${esc(judgment.group || judgment.id)}"></label>
                <label>${judgment.kind === 'damage' ? '데미지 (%)' : '강도'}${judgment.kind === 'damage'
                    ? `<input data-field="damagePercent" type="number" min="0" max="1000" step="1" value="${judgment.damagePercent ?? Math.round(Number(pattern.damageRatio || 0) * 100)}">`
                    : `<select data-field="size"><option value="small"${judgment.size === 'small' ? ' selected' : ''}>소</option><option value="large"${judgment.size !== 'small' ? ' selected' : ''}>대</option></select>`}</label>
                <span>${esc(beat.label || beat.id)} · ${beat.startTicks + Number(judgment.offsetTicks || 0)}틱</span><button type="button" class="remove-judgment">×</button>`;
            row.querySelector('.select-judgment').onclick = () => {
                app.selectedJudgmentId = judgment.id;
                app.session.seek(beat.startTicks + Number(judgment.offsetTicks || 0));
                renderPatternDesk();
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

    function renderInspector(pattern) {
        const host = $('.transform-editor'); if (!host) return;
        const snapshot = app.session.snapshot(), beatId = snapshot.selection.beatId,
            value = snapshot.draft[beatId] || { ticks: 1 };
        host.innerHTML = `<div class="transform-head"><b>이동 · 회전 · 이미지 변형</b><select class="beat-select">${snapshot.timeline.beats.map(beat => `<option value="${esc(beat.id)}"${beat.id === beatId ? ' selected' : ''}>${esc(beat.label || beat.id)}</option>`).join('')}</select></div><div class="anchor-editor">${anchorEditor(value)}<section class="anchor-field face-field"><b>이미지 좌우 방향</b><div class="anchor-map face-map" data-anchor-key="face">${[['', '유지'], ['left', '←'], ['right', '→'], ['target', '대상 쪽 좌우']].map(([direction, label]) => `<button type="button" data-anchor="${direction}" class="${String(value.face || '').replace('toward-target', 'target') === direction ? 'active' : ''}">${label}</button>`).join('')}</div><label class="body-aim-toggle"><input type="checkbox"${value.aimBodyAt ? ' checked' : ''}>대상까지 몸체 각도 맞춤</label></section></div><div class="transform-grid">
            <label>X 이동<input data-key="offsetX" type="number" value="${value.offsetX ?? 0}"></label><label>Y 이동<input data-key="offsetY" type="number" value="${value.offsetY ?? 0}"></label>
            <label>투명도<input data-key="opacity" type="number" min="0" max="1" step=".05" value="${value.opacity ?? 1}"></label><label>회전°<input data-key="rotation" type="number" value="${value.rotation ?? ''}"></label>
            <label>추가 회전°<input data-key="rotateBy" type="number" value="${value.rotateBy ?? ''}"></label><label>가로 배율<input data-key="scaleX" type="number" min=".05" step=".05" value="${value.scaleX ?? 1}"></label>
            <label>세로 배율<input data-key="scaleY" type="number" min=".05" step=".05" value="${value.scaleY ?? 1}"></label><label>회전축<input data-key="origin" value="${esc(value.origin || '50% 50%')}"></label>
            <label>X 기울기°<input data-key="skewX" type="number" value="${value.skewX ?? 0}"></label><label>Y 기울기°<input data-key="skewY" type="number" value="${value.skewY ?? 0}"></label>
            <label class="wide">이동 속도<select data-key="moveEasing">${options(easings, value.moveEasing || 'smooth')}</select></label><label class="wide">회전 속도<select data-key="rotationEasing">${options(easings, value.rotationEasing || 'smooth')}</select></label>
            <label class="wide stride-toggle"><span>씰룩씰룩 좌우 반전</span><input class="stride-toggle-input" type="checkbox"${Number(value.strideFlipTicks) > 0 ? ' checked' : ''}></label>
            <label class="stride-period">반전 주기 (틱)<input data-key="strideFlipTicks" type="number" min="1" max="60" value="${Number(value.strideFlipTicks) > 0 ? Number(value.strideFlipTicks) : 3}"${Number(value.strideFlipTicks) > 0 ? '' : ' disabled'}></label></div>`;
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
        host.querySelectorAll('[data-key]').forEach(input => input.onchange = () => {
            const key = input.dataset.key, textKeys = new Set(['at', 'to', 'origin', 'moveEasing', 'rotationEasing']);
            const patch = { [key]: textKeys.has(key) ? input.value : input.value === '' ? null : Number(input.value) };
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
                body: JSON.stringify({ huntId: app.huntId, patternId: pattern.id, beats,
                    expectedRevision: app.revisions.motion }) });
            assertGeneratedMotion(result);
            const reloaded = await api(`/api/hunt-patterns?monster=${encodeURIComponent(app.monster)}`);
            const persisted = reloaded.patterns.find(item => item.id === pattern.id);
            const verify = MonsterAudioReviewState.createMotionDraft(persisted, persisted.timeline);
            if (!MonsterAudioReviewState.motionValuesEqual(beats, verify)) throw new Error('저장 후 재로드 검증 실패');
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
        const result = await api(`/api/hunt-patterns?monster=${encodeURIComponent(app.monster)}`);
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
        const result = await api('/api/hunt-pattern-route', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, expectedRevision: app.revisions.audio }) });
        assertGeneratedAudioRoute(result);
        app.revisions.audio = result.sourceRevision || app.revisions.audio;
        const pattern = app.patterns.find(item => item.id === payload.patternId);
        const slot = pattern?.slots.find(item => item.slot === payload.slot);
        if (slot) {
            const files = Array.isArray(result.files) ? result.files : [];
            const assigned = files.length ? {
                label: payload.label || null,
                ...(result.mode === 'random' ? { mode: 'random' } : {}),
                layers: files.map(file => [file, Number(payload.gain) || .7, Number(payload.delay) || 0])
            } : (result.disabled ? { disabled: true } : null);
            slot.override = assigned;
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
        if (!result.generated) throw new Error('저장 검증 실패: 런타임 모션 모듈 미생성');
    }

    function assertGeneratedAudioRoute(result) {
        if (!result?.generated) throw new Error('저장 검증 실패: 런타임 사운드 모듈 미생성');
    }

    async function clearSlot(patternId, slot) {
        await saveRoute({ huntId: app.huntId, patternId, slot, files: [], disabled: true });
    }

    async function assignSource(source) {
        const pattern = selectedPattern(), slot = selectedSlot(); if (!pattern || !slot || !source.path) return;
        await saveRoute({ huntId: app.huntId, patternId: pattern.id, slot: slot.slot, files: [source.path] });
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
            label: available.length > 1 ? `${group.bank} · EVENT ${group.eventId}` : null
        });
    }

    function installRouteDrag(row, pattern, slot) {
        row.querySelectorAll('[data-route-file]').forEach(file => file.ondragstart = event => event.dataTransfer.setData('application/json', JSON.stringify({ patternId: pattern.id, fromSlot: slot.slot, file: file.dataset.routeFile })));
        row.ondragover = event => event.preventDefault();
        row.ondrop = async event => {
            event.preventDefault(); let payload; try { payload = JSON.parse(event.dataTransfer.getData('application/json')); } catch { return; }
            if (!payload || payload.fromSlot === slot.slot) return;
            await api('/api/hunt-pattern-route-move', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ huntId: app.huntId, patternId: pattern.id, fromSlot: payload.fromSlot, toSlot: slot.slot, file: payload.file, expectedRevision: app.revisions.audio }) });
            await loadPatterns(pattern.id, slot.slot);
            renderPatternList(); renderPatternDesk(); refreshSourceSelection();
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
        const sourcePool = filter === 'common' ? app.commonGroups : app.groups;
        const orderedGroups = sourcePool.map((group, order) => ({ group, order })).sort((left, right) => {
            const favoriteDelta = Number(app.favoriteSourceGroups.has(sourceGroupKey(right.group)))
                - Number(app.favoriteSourceGroups.has(sourceGroupKey(left.group)));
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
            if (!containsFocus && (filter === 'voice' && group.sourceLayer !== 'voice' || filter === 'sound-effect' && group.sourceLayer !== 'sound-effect' || filter === 'reviewed' && !reviewed || filter === 'unreviewed' && reviewed)) continue;
            matchedGroups += 1;
            const containsCurrent = group.sources.some(source => current.has(source.path));
            if (renderedGroups >= app.sourceRenderLimit && !containsCurrent && !containsFocus) continue;
            renderedGroups += 1;
            const details = document.createElement('details'); details.className = 'event-group';
            details.dataset.groupKey = groupKey;
            details.classList.toggle('hidden-source-group', groupHidden);
            details.classList.toggle('favorite-source-group', app.favoriteSourceGroups.has(groupKey));
            details.open = containsFocus || openGroups.has(details.dataset.groupKey);
            details.innerHTML = `<summary><span class="group-audio-actions"><button class="play-group" title="그룹 재생">▶</button><button class="hide-group" title="${groupHidden ? '그룹 숨김 해제' : '그룹 숨기기'}" aria-label="${groupHidden ? '그룹 숨김 해제' : '그룹 숨기기'}">${groupHidden ? '🙈' : '👁'}</button><button class="favorite-group${app.favoriteSourceGroups.has(groupKey) ? ' active' : ''}" title="즐겨찾기" aria-label="즐겨찾기" aria-pressed="${app.favoriteSourceGroups.has(groupKey)}">★</button></span><span class="event-title"><strong>${esc(group.bank)} · EVENT ${esc(group.eventId)}</strong><small>${group.sources.length} SOURCES${group.groupTags.length ? ` · ${esc(group.groupTags.join(', '))}` : ''}</small></span><span class="event-badges"><span class="badge">${esc(group.sourceLayer || '')}</span></span></summary><div class="event-classify"><button data-preset="smallFlinch">소경직</button><button data-preset="knockdown">대경직</button><button data-preset="death">죽음</button><input placeholder="직접 태그"><button data-preset="custom">저장</button><button data-preset="clear">지우기</button><span class="save-state"></span></div><div class="sources"></div>`;
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
                row.innerHTML = `<button class="source-eye"${source.path ? '' : ' disabled'} title="${hidden ? '숨김 해제' : '이 음원 숨기기'}" aria-label="${hidden ? '숨김 해제' : '이 음원 숨기기'}">${hidden ? '🙈' : '👁'}</button><button class="play"${source.path ? '' : ' disabled'}>▶</button><span class="source-meta"><strong>ID ${esc(source.sourceId)}${source.stream != null ? ` · STREAM ${esc(source.stream)}` : ''}</strong><small>${esc(source.path ? fileName(source.path) : '디코딩 파일 없음')}</small></span><span class="source-row-actions"><span class="source-map-links"></span><button class="slot-pick"${source.path && slot ? '' : ' disabled'}>${current.has(source.path) ? '현재' : '배정'}</button></span>`;
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
        $('#previewTarget').onchange = syncPreviewSettings;
        $('#previewState').onchange = () => { app.session.setScenario({ monsterState: $('#previewState').value }); syncPreviewSettings(); };
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
            app.session.updateBeat(beatId, message.patch || {}, { record: first }); renderTimelineVisualOnly(); renderInspector(selectedPattern()); return;
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
        previewFrame().src = metadata.previewPath || '/preview/?embed=1';
        const resizePreview = () => { const stage = $('#previewStage'); previewFrame().style.transform = `scale(${stage.clientWidth / 1920})`; };
        new ResizeObserver(resizePreview).observe($('#previewStage')); resizePreview();
        installScenarioControls(); $('#monsterPickerToggle').onclick = () => $('#monsterPickerPanel').hidden ? openPicker() : closePicker();
        $('.undo-motion').onclick = () => { app.session.undo(); renderPatternDesk(); sendPreview({ scrub: true }); };
        $('.redo-motion').onclick = () => { app.session.redo(); renderPatternDesk(); sendPreview({ scrub: true }); };
        $('.reset-motion').onclick = resetMotion;
        $('.save-motion').onclick = saveMotion;
        document.addEventListener('pointerdown', event => { if (!event.target.closest('#monsterPicker')) closePicker(); });
        let sourceFilterFrame = 0;
        $('#sourceSearch').oninput = () => { cancelAnimationFrame(sourceFilterFrame); sourceFilterFrame = requestAnimationFrame(() => { app.sourceRenderLimit = 80; renderSources(); }); };
        $('#scopeFilter').onchange = async () => {
            app.sourceRenderLimit = 80;
            if ($('#scopeFilter').value === 'common' && !app.commonGroups.length) {
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
