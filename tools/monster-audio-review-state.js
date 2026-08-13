'use strict';

(function exposeReviewState(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.MonsterAudioReviewState = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
    const EDITABLE_MOTION_FIELDS = Object.freeze(['ticks', 'at', 'to', 'origin', 'moveEasing',
        'rotationEasing', 'pose', 'face', 'align', 'bounds', 'fade', 'sfx', 'label', 'aimBodyAt',
        'targetMode', 'offsetX', 'offsetY', 'depth', 'rotation', 'rotationToward', 'rotateBy',
        'rotateByFacing', 'scaleX', 'scaleY', 'skewX', 'skewY', 'opacity', 'damageScale', 'hit', 'hitOffsetTicks',
        'judgmentOffsets', 'judgments',
        'alignRotationToTravel', 'instantOpacity', 'instantPose', 'continueTravel', 'flipFacing', 'strideFlipTicks',
        'stompSteps', 'fx', 'fxAnchor', 'fxDurationTicks', 'fxSecondary', 'fxSecondaryAnchor',
        'fxSecondaryDurationTicks', 'fxSecondaryAngleMode', 'fxAdditional']);
    function slotIdsForBeat(beat) {
        return Array.isArray(beat?.audioSlots) ? beat.audioSlots.filter(Boolean) : [];
    }

    function resolvePart(pattern, timeline, request = {}) {
        const beats = Array.isArray(timeline?.beats) ? timeline.beats : [];
        const slots = Array.isArray(pattern?.slots) ? pattern.slots : [];
        if (!beats.length) return null;

        let index = request.beatId ? beats.findIndex(beat => beat.id === request.beatId) : -1;
        if (index < 0 && request.slotId) {
            index = beats.findIndex(beat => slotIdsForBeat(beat).includes(request.slotId));
        }
        if (index < 0) index = 0;

        const beat = beats[index];
        const beatSlotIds = slotIdsForBeat(beat);
        const requestedSlot = request.slotId && beatSlotIds.includes(request.slotId)
            ? request.slotId
            : null;
        const slotId = requestedSlot || beatSlotIds.find(id => slots.some(slot => slot.slot === id)) || '';
        return Object.freeze({ index, beatId: beat.id, slotId });
    }

    function ticks(value) {
        return Math.max(1, Math.min(600, Math.round(Number(
            typeof value === 'object' ? value?.ticks : value
        ) || 1)));
    }

    function createMotionDraft(pattern = {}, timeline = {}) {
        const graphBeats = Array.isArray(pattern.motionGraph?.beats)
            ? pattern.motionGraph.beats : (pattern.motion || []);
        const authored = new Map(graphBeats.map((beat, index) => [
            beat.beat || `beat-${index + 1}`, beat
        ]));
        return Object.fromEntries((timeline.beats || []).map(beat => {
            const source = { ...(authored.get(beat.id) || {}) };
            delete source.beat;
            const legacyJudgments = [];
            if (source.hit || beat.hit) legacyJudgments.push({
                id: `${beat.id}-damage`, group: `${beat.id}-impact`, kind: 'damage',
                target: 'primary', offsetTicks: Math.max(0, Number(source.hitOffsetTicks ?? beat.hitOffsetTicks) || 0),
                damagePercent: Math.max(0, Number(pattern.damageRatio || 0) * 100
                    * Number(source.damageScale ?? beat.damageScale ?? 1))
            });
            for (const [kind, offsetTicks] of Object.entries(source.judgmentOffsets || beat.judgmentOffsets || {})) {
                legacyJudgments.push({ id: `${beat.id}-${kind}`, group: `${beat.id}-impact`, kind,
                    target: 'all', offsetTicks: Math.max(0, Number(offsetTicks) || 0),
                    size: String(pattern.interference?.size || pattern.secondaryInterference?.size || 'large') });
            }
            const judgments = Array.isArray(source.judgments) ? clone(source.judgments).map(item => {
                if (item.kind !== 'damage' || Number.isFinite(Number(item.damagePercent))) return item;
                const next = { ...item, damagePercent: Math.max(0, Number(pattern.damageRatio || 0) * 100
                    * Number(item.damageScale ?? 1)) };
                delete next.damageScale;
                return next;
            }) : legacyJudgments;
            if (judgments.length) {
                source.hit = false;
                delete source.hitOffsetTicks;
                delete source.judgmentOffsets;
            }
            return [beat.id, { ...source, ...(judgments.length ? { judgments } : {}), ticks: ticks(beat.ticks) }];
        }));
    }

    function buildPreviewMotion(pattern = {}, timeline = {}, draft = {}) {
        const motion = (timeline.beats || []).map(beat => ({ ...clone(draft[beat.id] || {}), beat: beat.id }));
        const graphRenderer = pattern.motionGraph?.renderer;
        const useBeatMotion = graphRenderer === 'beat'
            || (!graphRenderer && Boolean(Array.isArray(pattern.motion) && pattern.motion.length));
        return Object.freeze({
            useBeatMotion,
            motion: useBeatMotion ? motion : null,
            runtimeTimingBeats: useBeatMotion ? null : motion.map((beat, index) => ({
                ...beat, ticks: ticks(beat),
                hit: beat.hit === undefined ? Boolean(timeline.beats?.[index]?.hit) : Boolean(beat.hit),
                hitOffsetTicks: Math.max(0, Math.round(Number(
                    beat.hitOffsetTicks ?? timeline.beats?.[index]?.hitOffsetTicks
                ) || 0))
            })),
            renderer: useBeatMotion ? 'beat' : 'keyframe-beat'
        });
    }

    function projectTimeline(timeline = {}, draft = {}) {
        let elapsed = 0;
        const beats = (timeline.beats || []).map(beat => {
            const length = ticks(draft[beat.id] ?? beat.ticks);
            const authored = draft[beat.id] || {};
            const judgments = (Array.isArray(authored.judgments) ? authored.judgments : [])
                .map(item => ({ ...clone(item), offsetTicks: Math.max(0, Math.min(length - 1,
                    Math.round(Number(item?.offsetTicks) || 0))) }));
            const hit = judgments.length ? false
                : (authored.hit === undefined ? Boolean(beat.hit) : Boolean(authored.hit));
            const hitOffsetTicks = hit ? Math.max(0, Math.min(length - 1,
                Math.round(Number(authored.hitOffsetTicks ?? beat.hitOffsetTicks) || 0))) : 0;
            const projected = { ...beat, hit, hitOffsetTicks, judgments,
                judgmentOffsets: clone(authored.judgmentOffsets || beat.judgmentOffsets || {}), ticks: length,
                startTicks: elapsed, endTicks: elapsed + length };
            elapsed += length;
            return projected;
        });
        return Object.freeze({ ...timeline, durationTicks: elapsed, beats });
    }

    function locateTick(timeline = {}, draft = {}, requestedTick = 0) {
        const projected = projectTimeline(timeline, draft);
        const selectedTick = Math.max(0, Math.min(projected.durationTicks,
            Number(requestedTick) || 0));
        const lookupTick = Math.min(Math.max(0, projected.durationTicks - 1e-6), selectedTick);
        let index = projected.beats.findIndex(beat => lookupTick < beat.endTicks);
        if (index < 0) index = Math.max(0, projected.beats.length - 1);
        const beat = projected.beats[index] || null;
        const beatProgress = beat
            ? Math.max(0, Math.min(1, (selectedTick - beat.startTicks) / Math.max(1, beat.ticks)))
            : 0;
        return Object.freeze({ projected, selectedTick, index, beat, beatProgress,
            progress: selectedTick / Math.max(1, projected.durationTicks) });
    }

    function tickAtBeatProgress(timeline = {}, draft = {}, beatId = '', beatProgress = 0) {
        const projected = projectTimeline(timeline, draft);
        const beat = projected.beats.find(item => item.id === beatId) || projected.beats[0];
        if (!beat) return 0;
        return beat.startTicks + Math.round(beat.ticks
            * Math.max(0, Math.min(1, Number(beatProgress) || 0)));
    }

    function normalizePreviewScenario(value = {}) {
        const clampHunter = item => {
            const index = Math.round(Number(item));
            return index >= 0 && index <= 3 ? index : null;
        };
        const uniqueHunters = items => [...new Set((Array.isArray(items) ? items : [])
            .map(clampHunter).filter(Number.isInteger))];
        const forcedImpactTargets = (Array.isArray(value.forcedImpactTargets)
            ? value.forcedImpactTargets : []).map((entry, impactIndex) => ({
            impactIndex: Number.isInteger(entry?.impactIndex) ? entry.impactIndex : impactIndex,
            targetIndices: uniqueHunters(entry?.targetIndices)
        })).filter(entry => entry.impactIndex >= 0);
        return Object.freeze({
            view: value.view === 'design' ? 'design' : 'runtime',
            monsterState: ['normal', 'enraged', 'exhausted', 'airborne'].includes(value.monsterState)
                ? value.monsterState : 'normal',
            primaryTargetIndex: clampHunter(value.primaryTargetIndex),
            forcedTargetIndices: uniqueHunters(value.forcedTargetIndices),
            forcedImpactTargets,
            seed: Math.max(1, Math.round(Number(value.seed) || 1))
        });
    }

    function clone(value) {
        return value == null ? value : JSON.parse(JSON.stringify(value));
    }

    function canonicalJson(value) {
        const normalize = item => {
            if (Array.isArray(item)) return item.map(normalize);
            if (!item || typeof item !== 'object') return item;
            return Object.fromEntries(Object.keys(item).sort().map(key => [key, normalize(item[key])]));
        };
        return JSON.stringify(normalize(value));
    }

    function motionValuesEqual(left, right) {
        return canonicalJson(left) === canonicalJson(right);
    }

    class EditorSession {
        constructor() {
            this.listeners = new Set();
            this.revision = 0;
            this.pattern = null;
            this.timeline = { durationTicks: 0, beats: [] };
            this.draft = {};
            this.selection = { beatId: '', slotId: '' };
            this.scrub = { tick: 0, beatId: '', beatProgress: 0 };
            this.scenario = normalizePreviewScenario();
            this.history = { undo: [], redo: [] };
            this.saved = '';
        }

        subscribe(listener) {
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        }

        emit(type, detail = {}) {
            this.revision += 1;
            const snapshot = this.snapshot();
            for (const listener of this.listeners) listener({ type, detail, snapshot });
            return snapshot;
        }

        snapshot() {
            return Object.freeze({
                revision: this.revision,
                patternId: this.pattern?.id || '',
                timeline: projectTimeline(this.timeline, this.draft),
                draft: clone(this.draft),
                selection: Object.freeze({ ...this.selection }),
                scrub: Object.freeze({ ...this.scrub }),
                scenario: this.scenario,
                dirty: JSON.stringify(this.draft) !== this.saved,
                canUndo: this.history.undo.length > 0,
                canRedo: this.history.redo.length > 0
            });
        }

        load(pattern = {}) {
            this.pattern = pattern;
            this.timeline = pattern.timeline || { durationTicks: 0, beats: [] };
            this.draft = createMotionDraft(pattern, this.timeline);
            const first = resolvePart(pattern, this.timeline, {});
            this.selection = { beatId: first?.beatId || '', slotId: first?.slotId || '' };
            this.scrub = { tick: 0, beatId: first?.beatId || '', beatProgress: 0 };
            this.history = { undo: [], redo: [] };
            this.saved = JSON.stringify(this.draft);
            return this.emit('load');
        }

        checkpoint() {
            this.history.undo.push(clone(this.draft));
            if (this.history.undo.length > 100) this.history.undo.shift();
            this.history.redo.length = 0;
        }

        select(request = {}, { seek = true } = {}) {
            const projected = projectTimeline(this.timeline, this.draft);
            const part = resolvePart(this.pattern, projected, request);
            if (!part) return this.snapshot();
            this.selection = { beatId: part.beatId, slotId: part.slotId };
            if (seek) {
                const beat = projected.beats[part.index];
                this.scrub = { tick: beat.startTicks, beatId: beat.id, beatProgress: 0 };
            }
            return this.emit('select');
        }

        seek(requestedTick) {
            const located = locateTick(this.timeline, this.draft, requestedTick);
            this.scrub = {
                tick: located.selectedTick,
                beatId: located.beat?.id || '',
                beatProgress: located.beatProgress
            };
            if (located.beat) {
                const part = resolvePart(this.pattern, located.projected, { beatId: located.beat.id });
                this.selection = { beatId: part.beatId, slotId: part.slotId };
            }
            return this.emit('seek');
        }

        updateBeat(beatId, patch = {}, { record = true } = {}) {
            if (!this.draft[beatId]) throw new Error(`Unknown beat: ${beatId}`);
            if (record) this.checkpoint();
            const filtered = Object.fromEntries(Object.entries(clone(patch) || {})
                .filter(([key]) => EDITABLE_MOTION_FIELDS.includes(key)));
            const next = { ...this.draft[beatId], ...filtered };
            next.ticks = ticks(next.ticks);
            for (const key of Object.keys(next)) if (next[key] === '' || next[key] == null) delete next[key];
            this.draft[beatId] = next;
            const tick = tickAtBeatProgress(this.timeline, this.draft,
                this.scrub.beatId || beatId, this.scrub.beatProgress);
            const located = locateTick(this.timeline, this.draft, tick);
            this.scrub = { tick: located.selectedTick, beatId: located.beat?.id || beatId,
                beatProgress: located.beatProgress };
            return this.emit('update-beat', { beatId, patch: clone(patch) });
        }

        resizeBoundary(leftId, rightId, delta) {
            if (!this.draft[leftId] || !this.draft[rightId]) throw new Error('Unknown boundary');
            this.checkpoint();
            const left = ticks(this.draft[leftId]), right = ticks(this.draft[rightId]);
            const bounded = Math.max(1 - left, Math.min(right - 1, Math.round(Number(delta) || 0)));
            this.draft[leftId] = { ...this.draft[leftId], ticks: left + bounded };
            this.draft[rightId] = { ...this.draft[rightId], ticks: right - bounded };
            return this.emit('resize-boundary', { leftId, rightId, delta: bounded });
        }

        moveImpact(sourceId, requestedTick) {
            if (!this.draft[sourceId]) throw new Error(`Unknown impact beat: ${sourceId}`);
            const projected = projectTimeline(this.timeline, this.draft);
            const tick = Math.max(0, Math.min(Math.max(0, projected.durationTicks - 1),
                Math.round(Number(requestedTick) || 0)));
            const target = projected.beats.find(beat => tick >= beat.startTicks && tick < beat.endTicks)
                || projected.beats.at(-1);
            if (!target) return this.snapshot();
            this.checkpoint();
            this.draft[sourceId] = { ...this.draft[sourceId], hit: false };
            delete this.draft[sourceId].hitOffsetTicks;
            this.draft[target.id] = {
                ...this.draft[target.id],
                hit: true,
                hitOffsetTicks: Math.max(0, tick - target.startTicks)
            };
            this.scrub = { tick, beatId: target.id,
                beatProgress: target.ticks ? (tick - target.startTicks) / target.ticks : 0 };
            return this.emit('move-impact', { sourceId, targetId: target.id, tick });
        }

        moveJudgment(sourceId, kind, requestedTick) {
            if (!this.draft[sourceId]) throw new Error(`Unknown judgment beat: ${sourceId}`);
            const judgmentKind = String(kind || '').trim();
            if (!judgmentKind) throw new Error('Unknown judgment kind');
            const projected = projectTimeline(this.timeline, this.draft);
            const tick = Math.max(0, Math.min(Math.max(0, projected.durationTicks - 1),
                Math.round(Number(requestedTick) || 0)));
            const target = projected.beats.find(beat => tick >= beat.startTicks && tick < beat.endTicks)
                || projected.beats.at(-1);
            if (!target) return this.snapshot();
            this.checkpoint();
            for (const beat of Object.values(this.draft)) {
                if (!beat?.judgmentOffsets || !(judgmentKind in beat.judgmentOffsets)) continue;
                const next = { ...beat.judgmentOffsets };
                delete next[judgmentKind];
                if (Object.keys(next).length) beat.judgmentOffsets = next;
                else delete beat.judgmentOffsets;
            }
            this.draft[target.id] = {
                ...this.draft[target.id],
                judgmentOffsets: {
                    ...(this.draft[target.id].judgmentOffsets || {}),
                    [judgmentKind]: Math.max(0, tick - target.startTicks)
                }
            };
            this.scrub = { tick, beatId: target.id,
                beatProgress: target.ticks ? (tick - target.startTicks) / target.ticks : 0 };
            return this.emit('move-judgment', { sourceId, targetId: target.id, kind: judgmentKind, tick });
        }

        addJudgment(beatId, input = {}) {
            if (!this.draft[beatId]) throw new Error(`Unknown judgment beat: ${beatId}`);
            this.checkpoint();
            const list = Array.isArray(this.draft[beatId].judgments) ? [...this.draft[beatId].judgments] : [];
            const kind = ['damage', 'roar', 'tremor', 'wind'].includes(input.kind) ? input.kind : 'damage';
            const id = String(input.id || `judgment-${Date.now()}-${list.length + 1}`);
            list.push({ id, group: String(input.group || id), kind,
                target: String(input.target || 'primary'), offsetTicks: Math.max(0, Number(input.offsetTicks) || 0),
                ...(kind === 'damage' ? { damagePercent: Math.max(0, Math.min(1000,
                    Number(input.damagePercent ?? Number(this.pattern?.damageRatio || 0) * 100))),
                    hitReactionKind: ['strong', 'butt-stumble', 'weak'].includes(input.hitReactionKind)
                        ? input.hitReactionKind : 'strong',
                    hitRecoveryTicks: Math.max(1, Math.min(600,
                        Math.round(Number(input.hitRecoveryTicks) || 50))) }
                    : { size: input.size || 'large' }) });
            this.draft[beatId] = { ...this.draft[beatId], judgments: list };
            return this.emit('add-judgment', { beatId, id });
        }

        updateJudgment(id, patch = {}) {
            this.checkpoint(); let found = false;
            for (const beat of Object.values(this.draft)) {
                if (!Array.isArray(beat.judgments)) continue;
                beat.judgments = beat.judgments.map(item => {
                    if (item.id !== id) return item;
                    found = true;
                    const next = { ...item, ...clone(patch), id: item.id };
                    if (next.kind === 'damage') {
                        delete next.size;
                        delete next.damageScale;
                        next.damagePercent = Math.max(0, Math.min(1000,
                            Number(next.damagePercent ?? Number(this.pattern?.damageRatio || 0) * 100)));
                        next.hitReactionKind = ['strong', 'butt-stumble', 'weak'].includes(next.hitReactionKind)
                            ? next.hitReactionKind : 'strong';
                        next.hitRecoveryTicks = Math.max(1, Math.min(600,
                            Math.round(Number(next.hitRecoveryTicks) || 50)));
                    } else {
                        delete next.damageScale;
                        delete next.damagePercent;
                        delete next.hitReactionKind;
                        delete next.hitRecoveryTicks;
                        next.size = next.size === 'small' ? 'small' : 'large';
                    }
                    next.target = ['primary', 'left', 'right', 'pair', 'pair-left', 'pair-right',
                        'primary-adjacent', 'all'].includes(next.target)
                        ? next.target : 'primary';
                    return next;
                });
            }
            if (!found) { this.history.undo.pop(); throw new Error(`Unknown judgment: ${id}`); }
            return this.emit('update-judgment', { id, patch: clone(patch) });
        }

        removeJudgment(id) {
            this.checkpoint(); let found = false;
            for (const beat of Object.values(this.draft)) {
                if (!Array.isArray(beat.judgments)) continue;
                const next = beat.judgments.filter(item => item.id !== id);
                found ||= next.length !== beat.judgments.length;
                // Keep an explicit empty array as a tombstone. Omitting the field
                // would make an inherited/source judgment reappear after reload.
                beat.judgments = next;
            }
            if (!found) { this.history.undo.pop(); return this.snapshot(); }
            return this.emit('remove-judgment', { id });
        }

        moveJudgmentById(id, requestedTick) {
            const projected = projectTimeline(this.timeline, this.draft);
            const tick = Math.max(0, Math.min(Math.max(0, projected.durationTicks - 1), Math.round(Number(requestedTick) || 0)));
            const target = projected.beats.find(beat => tick >= beat.startTicks && tick < beat.endTicks) || projected.beats.at(-1);
            let value = null;
            for (const beat of Object.values(this.draft)) {
                if (!Array.isArray(beat.judgments)) continue;
                const match = beat.judgments.find(item => item.id === id);
                if (match) value = clone(match);
            }
            if (!value || !target) throw new Error(`Unknown judgment: ${id}`);
            this.checkpoint();
            for (const beat of Object.values(this.draft)) if (Array.isArray(beat.judgments)) {
                beat.judgments = beat.judgments.filter(item => item.id !== id);
            }
            const list = Array.isArray(this.draft[target.id].judgments) ? this.draft[target.id].judgments : [];
            list.push({ ...value, offsetTicks: tick - target.startTicks });
            this.draft[target.id] = { ...this.draft[target.id], judgments: list };
            this.scrub = { tick, beatId: target.id, beatProgress: (tick - target.startTicks) / Math.max(1, target.ticks) };
            return this.emit('move-judgment-id', { id, targetId: target.id, tick });
        }

        setScenario(patch = {}) {
            this.scenario = normalizePreviewScenario({ ...this.scenario, ...clone(patch) });
            return this.emit('scenario');
        }

        undo() {
            const previous = this.history.undo.pop();
            if (!previous) return this.snapshot();
            this.history.redo.push(clone(this.draft));
            this.draft = previous;
            return this.emit('undo');
        }

        redo() {
            const next = this.history.redo.pop();
            if (!next) return this.snapshot();
            this.history.undo.push(clone(this.draft));
            this.draft = next;
            return this.emit('redo');
        }

        restoreSaved() {
            if (!this.saved) return this.snapshot();
            this.draft = JSON.parse(this.saved);
            this.history = { undo: [], redo: [] };
            const first = projectTimeline(this.timeline, this.draft).beats[0];
            this.selection = { beatId: first?.id || '', slotId: this.selection.slotId || '' };
            this.scrub = { tick: 0, beatId: first?.id || '', beatProgress: 0 };
            return this.emit('restore-saved');
        }

        markSaved(serverBeats) {
            const submitted = canonicalJson(this.serialize());
            const persisted = canonicalJson(serverBeats || {});
            if (submitted !== persisted) throw new Error('저장 검증 실패: 서버 값이 편집값과 다릅니다.');
            this.saved = JSON.stringify(this.draft);
            return this.emit('saved');
        }

        serialize() {
            return Object.fromEntries(Object.entries(this.draft)
                .map(([id, value]) => [id, { ...clone(value), ticks: ticks(value) }]));
        }
    }

    function createEditorSession() {
        return new EditorSession();
    }

    return Object.freeze({
        resolvePart,
        slotIdsForBeat,
        ticks,
        createMotionDraft,
        buildPreviewMotion,
        projectTimeline,
        locateTick,
        tickAtBeatProgress,
        normalizePreviewScenario,
        EDITABLE_MOTION_FIELDS,
        canonicalJson,
        motionValuesEqual,
        createEditorSession
    });
}));
