'use strict';

// Bridges the reviewed hunt combat patterns to the per-monster audio review
// tool. For a hunt monster it enumerates the patterns we actually implemented,
// breaks each into the distinct audio moments (slots) it fires at runtime, and
// reports the sound currently wired to each slot plus any user-assigned
// override. This is the data the review page needs so a user can map an
// auditioned em-bank group directly onto a real move instead of an abstract tag.
//
// Everything is derived from live data — the pattern catalog, the audio bank
// map, and the override file — so adding a new monster needs no changes here.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BANK_MAP_PATH = path.join(ROOT, 'data', 'hunt', 'world-monster-audio-banks.json');
const OVERRIDES_PATH = path.join(ROOT, 'data', 'hunt', 'monster-pattern-audio-routes.json');
const MOTION_OVERRIDES_PATH = path.join(ROOT, 'data', 'hunt', 'monster-pattern-motion-overrides.json');

function canonicalAudioPatternId(patternId) {
    // Stun is the same fall/struggle/rise reaction as knockdown. One route
    // prevents the two sound mappings from drifting after later edits.
    return patternId === '__reaction.stun' ? '__reaction.knockdown' : patternId;
}

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function normalizeMotionJudgments(motion = [], pattern = {}) {
    const seenJudgments = new Set();
    return motion.map((beat, index) => {
        const next = { ...beat };
        const judgments = Array.isArray(next.judgments) ? next.judgments.map(item => ({ ...item })) : [];
        if (next.hit === true && !judgments.some(item => item.kind === 'damage')) {
            const beatId = next.beat || `beat-${index + 1}`;
            judgments.push({ id: `${beatId}-damage`, group: `${beatId}-impact`, kind: 'damage',
                target: 'primary', offsetTicks: Math.max(0, Number(next.hitOffsetTicks) || 0),
                damagePercent: Math.max(0, Number(pattern.damageRatio || 0) * 100
                    * Number(next.damageScale ?? 1)) });
        }
        for (const [kind, offsetTicks] of Object.entries(next.judgmentOffsets || {})) {
            if (!judgments.some(item => item.kind === kind)) judgments.push({
                id: `${next.beat || `beat-${index + 1}`}-${kind}`,
                group: `${next.beat || `beat-${index + 1}`}-impact`, kind, target: 'all',
                offsetTicks: Math.max(0, Number(offsetTicks) || 0),
                size: String(pattern.interference?.size || pattern.secondaryInterference?.size || 'large')
            });
        }
        const uniqueJudgments = judgments.filter(judgment => {
            const key = String(judgment?.id || judgment?.group || '');
            if (!key || seenJudgments.has(key)) return false;
            seenJudgments.add(key);
            return true;
        });
        if (judgments.length) {
            next.judgments = uniqueJudgments;
            next.hit = false;
            delete next.hitOffsetTicks;
            delete next.judgmentOffsets;
        }
        if (next.hit !== true) delete next.hitOffsetTicks;
        return next;
    });
}

// hunt monster id -> em graph id, inverted from the *_vo bank map
// (e.g. { em007_vo: ['diablos'] } => { diablos: 'em007' }).
function huntToGraphId(bankMapPath = BANK_MAP_PATH) {
    const bankMap = readJson(bankMapPath, {});
    const index = {};
    for (const [bank, huntIds] of Object.entries(bankMap)) {
        const graphId = String(bank).replace(/_(vo|se)$/i, '');
        for (const huntId of huntIds || []) {
            if (!index[huntId]) index[huntId] = graphId;
        }
    }
    return index;
}

// Which runtime trigger currently fires each phase (see
// data/hunt/monster-audio-phase-standard.md §3). Drives the "미배선" hint so a
// reviewer knows a mapping will not play in-game until the trigger is added.
const PHASE_RUNTIME_READY = { telegraph: true, start: true, launch: true, travel: 'partial', impact: false, recovery: false, roar: true, burrow: true };

// Canonical audio phases a single pattern produces, in play order:
// telegraph → start/launch → travel → impact(s) → recovery. Derived from the
// pattern's timing fields (windup / delivery / movement / impactTimeline /
// recovery). Each slot = { slot, phase, label, note, order, runtimeReady, atTicks? }.
function patternAudioSlots(pattern = {}) {
    const tags = new Set(pattern.tags || []);
    const type = String(pattern.type || '');
    const delivery = String(pattern.delivery || '');
    const id = String(pattern.id || '');
    const slots = [];
    const add = (slot, phase, label, note, opts = {}) => {
        if (slots.some(existing => existing.slot === slot)) return;
        slots.push({
            slot, phase, label, note,
            order: slots.length,
            runtimeReady: opts.runtimeReady ?? PHASE_RUNTIME_READY[phase] ?? false,
            ...(opts.atTicks != null ? { atTicks: opts.atTicks } : {})
        });
    };

    if (type === 'roar' || tags.has('roar')) {
        add('roar', 'roar', '포효', 'VO — 포효/전이 포효');
        return slots;
    }
    if (tags.has('burrow-emerge') || /emerge/.test(id)) {
        add('telegraph', 'telegraph', '재출현 전조', '땅밑에서 올라오기 직전 경고음');
        add('impact', 'impact', '재출현 타격', '뿔로 쳐올리는 실제 타격음', { runtimeReady: false });
        return slots;
    }
    if (tags.has('burrow-enter') || type === 'burrow') {
        add('burrow', 'burrow', '잠복 진입', '땅속으로 들어가는 진동음');
        return slots;
    }

    const isProjectile = type === 'projectile'
        || ['projectile', 'laser', 'cone', 'gas', 'ground-dot'].includes(delivery);
    const isCharge = type === 'charge' || tags.has('charge');
    const isSomersault = tags.has('somersault') || /somersault/.test(id);
    const stomp = pattern.chargeLaunchStyle === 'stomp-burst';

    // 1. telegraph (전조)
    if (!pattern.suppressPrepareAudio) {
        const label = isProjectile ? '전조 (모으기)'
            : isCharge ? (stomp ? '전조 (발구르기)' : '돌진 전조')
                : isSomersault ? '전조 (기합)' : '전조 (준비)';
        add('telegraph', 'telegraph', label, isSomersault ? 'VO — 몬스터 기합' : 'windup 시작 자세/기척');
    }
    // 2. start / launch (시작)
    if (isProjectile) add('launch', 'launch', '발사', '투사체가 나가는 순간');
    else add('start', 'start', isSomersault ? '휘두르기' : isCharge ? '돌진 개시' : '시작 (스윙)', '실제 동작 개시');
    // 3. travel (이동)
    if (isCharge && Number(pattern.movement?.ticks || 0) > 0) {
        add('travel', 'travel', '질주 (이동)', '돌진 중 발소리 · 현재 티가렉스만 배선');
    }
    // 4. impact(s) (타격)
    const timeline = tags.has('no-impact') ? [] : (Array.isArray(pattern.impactTimeline) && pattern.impactTimeline.length
        ? pattern.impactTimeline : [{}]);
    const hasUniqueCues = timeline.some(event => event && event.audioCue && event.audioCue !== 'none');
    if (!timeline.length) {
        // Deliberate whiffs/fizzles have no contact frame and therefore no
        // impact audio slot to accidentally populate.
    } else if (isProjectile && !hasUniqueCues) {
        const tickNote = timeline.map(e => e.atTicks).filter(t => t != null).join(', ');
        add('impact', 'impact', '적중', '브레스/투사체 적중 프레임' + (tickNote ? ` · ${tickNote}틱` : ''), {
            runtimeReady: false,
            atTicks: timeline[0]?.atTicks
        });
    } else {
        timeline.forEach((event, index) => {
            const cue = event && event.audioCue && event.audioCue !== 'none' ? event.audioCue : null;
            const multi = timeline.length > 1;
            const slot = cue ? `impact:${cue}` : (multi ? `impact-${index + 1}` : 'impact');
            const base = isProjectile ? '적중' : isSomersault ? '착지 타격' : isCharge ? '돌진 피격' : '타격';
            add(slot, 'impact', base + (multi ? ` ${index + 1}` : ''),
                (cue ? `audioCue:${cue}` : '접촉 프레임') + (event.atTicks != null ? ` · ${event.atTicks}틱` : ''),
                { runtimeReady: cue === 'somersault' || cue === 'tigrex-final-vocal', atTicks: event.atTicks });
        });
    }
    // 5. recovery (후딜)
    if (isCharge) add('recovery', 'recovery', '후딜 (멈춤)', '돌진을 멈추는 마무리음');
    else if (isProjectile && (tags.has('elemental') || tags.has('fire') || pattern.attachedFx)) {
        add('recovery', 'recovery', '후딜 (잔염)', '적중 후 속성 지속음');
    }
    return slots;
}

// Review UI projection of the authored motion. Beat motion is authoritative
// when present; legacy patterns still expose a compact phase timeline so the
// reviewer uses the same left-to-right workflow during gradual migration.
function patternReviewTimeline(pattern = {}, slots = patternAudioSlots(pattern)) {
    const motion = Array.isArray(pattern.motion) ? pattern.motion : [];
    if (motion.length) {
        let elapsed = 0;
        const beats = motion.map((beat, index) => {
            const ticks = Math.max(1, Number(beat.ticks) || 1);
            const item = {
                id: beat.beat || `beat-${index + 1}`,
                label: beat.label || beat.beat || `beat ${index + 1}`,
                startTicks: elapsed,
                endTicks: elapsed + ticks,
                ticks,
                pose: beat.pose || null,
                destination: beat.to || beat.at || null,
                at: beat.at || null,
                to: beat.to || null,
                offsetX: Number(beat.offsetX) || 0,
                offsetY: Number(beat.offsetY) || 0,
                rotation: Number.isFinite(Number(beat.rotation)) ? Number(beat.rotation) : null,
                rotateBy: Number.isFinite(Number(beat.rotateBy)) ? Number(beat.rotateBy) : null,
                scaleX: Number.isFinite(Number(beat.scaleX)) ? Number(beat.scaleX) : 1,
                scaleY: Number.isFinite(Number(beat.scaleY)) ? Number(beat.scaleY) : 1,
                skewX: Number(beat.skewX) || 0,
                skewY: Number(beat.skewY) || 0,
                opacity: Number.isFinite(Number(beat.opacity)) ? Number(beat.opacity) : null,
                instantOpacity: Boolean(beat.instantOpacity),
                origin: beat.origin || null,
                moveEasing: beat.moveEasing || 'smooth',
                rotationEasing: beat.rotationEasing || 'smooth',
                hit: Boolean(beat.hit),
                hitOffsetTicks: beat.hit ? Math.max(0, Math.min(ticks - 1,
                    Math.round(Number(beat.hitOffsetTicks) || 0))) : 0,
                sfx: beat.sfx || null
            };
            elapsed += ticks;
            return item;
        });
        return { source: 'beat-motion', durationTicks: elapsed, beats };
    }

    const savedRuntimeTiming = Array.isArray(pattern.runtimeTimingBeats)
        ? pattern.runtimeTimingBeats : [];
    if (savedRuntimeTiming.length) {
        let elapsed = 0;
        const beats = savedRuntimeTiming.map((beat, index) => {
            const ticks = Math.max(1, Math.round(Number(beat.ticks) || 1));
            const id = beat.beat || `action-${index + 1}`;
            const item = {
                id,
                label: beat.label || (/^impact-/.test(id) ? `타격 ${index + 1}`
                    : id === 'telegraph' ? '전조' : '동작'),
                startTicks: elapsed,
                endTicks: elapsed + ticks,
                ticks,
                phase: beat.hit || /^impact-/.test(id) ? 'impact'
                    : id === 'telegraph' ? 'telegraph' : 'motion',
                hit: Boolean(beat.hit || /^impact-/.test(id)),
                sfx: beat.sfx || (/^impact-/.test(id) ? 'impact' : null)
            };
            elapsed += ticks;
            return item;
        });
        return { source: 'keyframe-motion', durationTicks: elapsed, beats };
    }

    // Legacy animation profiles do not expose editable transforms yet, but their
    // runtime clock and impact ticks are authoritative.  The former projection
    // added windup + the *entire* movement clock + impact + recovery once per
    // audio slot, so a 66-tick move could appear as a 95-tick editor timeline.
    // Partition the one real runtime clock instead.  This is deliberately not
    // called beat-motion: transform editing remains disabled until the profile
    // is migrated, while timing/audio scrubbing is now exact.
    const animationTicks = Math.max(1, Math.round(Number(pattern.animationDurationMs || 0) / 100));
    const authoredImpacts = Array.isArray(pattern.impactTimeline) ? pattern.impactTimeline : [];
    const latestImpactEnd = Math.max(0, ...authoredImpacts
        .map(event => Math.round(Number(event?.atTicks)) + 1)
        .filter(Number.isFinite));
    const durationTicks = Math.max(1,
        Math.round(Number(pattern.movement?.ticks) || 0),
        animationTicks,
        latestImpactEnd);
    const hasRuntimeClock = Number(pattern.movement?.ticks) > 0 || Number(pattern.animationDurationMs) > 0;
    const requiresImpact = slots.some(slot => slot.phase === 'impact');
    const hasTimedImpacts = (!requiresImpact || authoredImpacts.length > 0)
        && authoredImpacts.every(event => Number.isFinite(Number(event?.atTicks)));
    if (!hasRuntimeClock || !hasTimedImpacts) {
        const phaseTicks = slot => Math.max(1, Number(
            slot.phase === 'telegraph' ? pattern.windupTicks
                : slot.phase === 'travel' ? Number(pattern.movement?.ticks || 1)
                    : slot.phase === 'recovery' ? pattern.recoveryTicks
                        : pattern.activeTicks
        ) || Math.round(animationTicks / Math.max(1, slots.length)) || 1);
        let elapsed = 0;
        const beats = slots.map(slot => {
            const ticks = phaseTicks(slot);
            const beat = { id: slot.slot, label: slot.label, startTicks: elapsed,
                endTicks: elapsed + ticks, ticks, phase: slot.phase,
                hit: slot.phase === 'impact', sfx: null };
            elapsed += ticks;
            return beat;
        });
        return { source: 'unresolved-motion', durationTicks: elapsed, beats };
    }
    const impacts = authoredImpacts
        .map((event, index) => ({ event, index, tick: Math.round(Number(event?.atTicks)) }))
        .filter(item => Number.isFinite(item.tick) && item.tick >= 0 && item.tick < durationTicks)
        .sort((a, b) => a.tick - b.tick || a.index - b.index);
    const boundaries = new Set([0, durationTicks]);
    const windupEnd = Math.max(0, Math.min(durationTicks, Math.round(Number(pattern.windupTicks) || 0)));
    if (windupEnd > 0 && windupEnd < durationTicks) boundaries.add(windupEnd);
    for (const item of impacts) {
        boundaries.add(item.tick);
        boundaries.add(Math.min(durationTicks, item.tick + 1));
    }
    const points = [...boundaries].sort((a, b) => a - b);
    let actionIndex = 0;
    const beats = [];
    for (let index = 0; index < points.length - 1; index += 1) {
        const startTicks = points[index], endTicks = points[index + 1];
        if (endTicks <= startTicks) continue;
        const impact = impacts.find(item => item.tick === startTicks);
        const isWindup = startTicks === 0 && windupEnd > 0;
        const loneSemanticSlot = slots.length === 1 && !impacts.length ? slots[0] : null;
        const id = impact ? `impact-${impact.index + 1}`
            : loneSemanticSlot ? loneSemanticSlot.slot
                : isWindup ? 'telegraph' : `action-${++actionIndex}`;
        beats.push({
            id,
            label: impact ? `타격 ${impact.index + 1}` : loneSemanticSlot?.label || (isWindup ? '전조' : '동작'),
            startTicks,
            endTicks,
            ticks: endTicks - startTicks,
            phase: impact ? 'impact' : isWindup ? 'telegraph' : 'motion',
            hit: Boolean(impact),
            sfx: impact ? 'impact' : null,
            ...(impact?.event?.audioCue ? { audioSlot: `impact:${impact.event.audioCue}` } : {})
        });
    }
    return { source: 'keyframe-motion', durationTicks, beats };
}

// Resolve audio moments against authored motion once on the server. Consumers
// must not infer this relationship from translated labels or array positions.
function bindAudioSlotsToTimeline(slots = [], timeline = { beats: [] }) {
    const beats = Array.isArray(timeline.beats) ? timeline.beats : [];
    if (!beats.length) return { slots, timeline, errors: slots.map(slot => `unbound:${slot.slot}`) };
    const claimed = new Set(), bindings = new Map(), slotById = new Map(slots.map(slot => [slot.slot, slot]));
    const bind = (slot, beat) => {
        if (!slot || !beat || bindings.has(slot.slot)) return false;
        bindings.set(slot.slot, beat.id); claimed.add(beat.id); return true;
    };
    const sfxSlotAliases = { projectile: 'launch', launch: 'launch', impact: 'impact', start: 'start', recovery: 'recovery', travel: 'travel' };
    for (const beat of beats) bind(slotById.get(beat.audioSlot || sfxSlotAliases[beat.sfx] || (slotById.has(beat.sfx) ? beat.sfx : null)), beat);
    const hitBeats = beats.filter(beat => beat.hit
        || beat.phase === 'impact'
        || (Array.isArray(beat.judgments) && beat.judgments.some(judgment =>
            ['damage', 'projectile', 'explosion'].includes(judgment?.kind))));
    slots.filter(slot => slot.phase === 'impact' && !bindings.has(slot.slot))
        .forEach((slot, index) => {
            const timed = Number.isFinite(Number(slot.atTicks))
                ? beats.find(beat => Number(slot.atTicks) >= beat.startTicks && Number(slot.atTicks) < beat.endTicks)
                : null;
            bind(slot, hitBeats[Math.min(index, hitBeats.length - 1)] || timed);
        });
    const firstHitIndex = beats.findIndex(beat => hitBeats.includes(beat));
    const lastHitIndex = beats.reduce((found, beat, index) => hitBeats.includes(beat) ? index : found, -1);
    const find = (predicate, reverse = false) => {
        const source = reverse ? [...beats].reverse() : beats;
        return source.find(beat => !claimed.has(beat.id) && predicate(beat)) || source.find(predicate) || null;
    };
    const text = beat => `${beat.id} ${beat.label || ''} ${beat.pose || ''}`.toLowerCase();
    for (const slot of slots) {
        if (bindings.has(slot.slot)) continue;
        let beat = null;
        if (['telegraph', 'roar', 'burrow'].includes(slot.phase)) beat = beats[0];
        else if (slot.phase === 'launch') beat = find(item => /launch|shot|fire|release|발사/.test(text(item)));
        else if (slot.phase === 'travel') beat = find(item => /travel|charge|approach|dash|glide|hop|돌진|접근|활강/.test(text(item)));
        else if (slot.phase === 'recovery') beat = find(item => /return|recover|recoil|land|idle|복귀|후딜|착지/.test(text(item)), true);
        else if (slot.phase === 'start') {
            if (firstHitIndex > 0) for (let index = firstHitIndex - 1; index >= 0; index -= 1) {
                if (!claimed.has(beats[index].id)) { beat = beats[index]; break; }
            }
            beat ||= find(item => /start|swing|release|lunge|slam|tackle|휘두|들이박|공격/.test(text(item)));
        }
        if (!beat && slot.phase === 'recovery') beat = lastHitIndex >= 0
            ? (beats[lastHitIndex + 1] || beats.at(-1)) : beats.at(-1);
        if (!beat && slot.phase === 'launch') beat = beats[Math.max(0, firstHitIndex - 1)] || beats[0];
        if (!beat && slot.phase === 'impact' && Number.isFinite(Number(slot.atTicks))) {
            beat = beats.find(item => Number(slot.atTicks) >= item.startTicks && Number(slot.atTicks) < item.endTicks) || null;
        }
        if (!beat && slot.phase === 'travel') {
            const startBeatId = bindings.get('start');
            beat = beats.find(item => item.id === startBeatId)
                || beats.find(item => item.phase === 'motion') || beats[0];
        }
        if (!beat && slot.phase === 'impact') beat = hitBeats[0] || beats.find(item => item.phase === 'impact') || beats.at(-1);
        if (!beat && slot.phase === 'start') beat = beats[Math.max(0, firstHitIndex - 1)] || beats[0];
        bind(slot, beat);
    }
    const boundSlots = slots.map(slot => {
        const beatId = bindings.get(slot.slot) || null, beat = beats.find(item => item.id === beatId);
        return { ...slot, beatId, atTicks: beat ? beat.startTicks : slot.atTicks };
    });
    const slotsByBeat = new Map();
    for (const slot of boundSlots) if (slot.beatId) slotsByBeat.set(slot.beatId, [...(slotsByBeat.get(slot.beatId) || []), slot.slot]);
    return {
        slots: boundSlots,
        timeline: { ...timeline, beats: beats.map(beat => ({ ...beat, audioSlots: slotsByBeat.get(beat.id) || [] })) },
        errors: boundSlots.filter(slot => !slot.beatId).map(slot => `unbound:${slot.slot}`)
    };
}

// Map a canonical slot to the HuntAudioCatalog action key it corresponds to.
const SLOT_TO_ACTION = { telegraph: 'telegraph', start: 'attack', launch: 'projectile_launch', travel: 'charge_stride_step', recovery: 'recovery', roar: 'roar', burrow: 'burrow' };
function slotToAction(slot) {
    if (slot.startsWith('impact')) return 'impact';
    return SLOT_TO_ACTION[slot] || slot;
}

// The route currently answering `monster:slot`, if any, read from the hand
// authored HuntAudioCatalog (best-effort match by action + pattern keywords).
function currentCatalogRoute(catalog, huntId, slot, pattern) {
    const action = slotToAction(slot);
    const routes = catalog[`${huntId}:${action}`] || [];
    if (!routes.length) return null;
    const keywords = [String(pattern.id || '').split('.').pop(), ...(pattern.tags || [])];
    const matched = routes.find(route =>
        (route.patternKeywords || []).some(keyword => keywords.includes(keyword)))
        || routes[0];
    return {
        label: matched.label || null,
        files: (matched.layers || []).map(layer => (Array.isArray(layer) ? layer[0] : layer)),
        evidence: matched.evidence || null
    };
}

function buildMonsterPatternAudioMap({
    huntId,
    patterns = [],
    catalog = {},
    overridesPath = OVERRIDES_PATH,
    bankMapPath = BANK_MAP_PATH
} = {}) {
    const graphId = huntToGraphId(bankMapPath)[huntId] || null;
    const overrides = readJson(overridesPath, { version: 1, routes: {} });
    const monsterOverrides = (overrides.routes || {})[huntId] || {};
    return {
        huntId,
        graphId,
        patterns: patterns.map(pattern => {
            const audioPatternId = canonicalAudioPatternId(pattern.id);
            const rawSlots = patternAudioSlots(pattern);
            const binding = bindAudioSlotsToTimeline(rawSlots, patternReviewTimeline(pattern, rawSlots));
            const canonicalSlots = binding.slots.map(slot => {
                const catalogRoute = currentCatalogRoute(catalog, huntId, slot.slot, pattern);
                const override = (monsterOverrides[audioPatternId] || {})[slot.slot] || null;
                const muted = override?.disabled === true;
                const effective = muted ? null : (override || (catalogRoute && {
                    label: catalogRoute.label,
                    layers: (catalogRoute.files || []).map(file => [file, 0.7, 0]),
                    evidence: catalogRoute.evidence || null
                }));
                return {
                    ...slot,
                    current: catalogRoute,
                    assigned: effective,
                    override,
                    effective,
                    muted
                };
            });
            // The editor is beat-native: every authored motion segment is an
            // assignable sound moment. Canonical phase routes remain visible as
            // legacy fallbacks on their bound beat, while all new saves use the
            // stable `beat:<beatId>` key consumed by preview and live runtime.
            const patternOverrides = monsterOverrides[audioPatternId] || {};
            // Synthetic state/reaction rows retain a full visual timeline, but
            // live combat emits their sound at one authoritative reaction
            // moment. Exposing recovery/hold beats as assignable audio would
            // create mappings that can never be heard in the hunt runtime.
            const assignableBeats = (pattern.tags || []).includes('review-reaction')
                && !['__reaction.knockdown', '__reaction.stun',
                    '__reaction.paralysis', '__reaction.sleep', '__reaction.tail-sever'].includes(pattern.id)
                ? binding.timeline.beats.filter(beat => beat.id === 'reaction')
                : binding.timeline.beats;
            let slots = assignableBeats.map((beat, index) => {
                const slotKey = `beat:${beat.id}`;
                const direct = patternOverrides[slotKey] || null;
                const phase = canonicalSlots.find(slot => slot.beatId === beat.id)?.phase || 'motion';
                const inheritedRoutes = canonicalSlots.filter(slot => slot.beatId === beat.id)
                    .map(slot => slot.effective).filter(Boolean);
                const inherited = inheritedRoutes.length ? {
                    label: inheritedRoutes.map(route => route.label).filter(Boolean).join(' + ') || null,
                    layers: inheritedRoutes.flatMap(route => route.layers || []),
                    ...(inheritedRoutes.some(route => route.mode === 'random') ? { mode: 'random' } : {})
                } : null;
                const muted = direct?.disabled === true;
                const effective = muted ? null : (direct || inherited);
                return {
                    slot: slotKey,
                    phase,
                    label: beat.label || beat.id,
                    note: '모션 BEAT',
                    order: index,
                    runtimeReady: true,
                    atTicks: beat.startTicks,
                    beatId: beat.id,
                    current: inherited,
                    assigned: effective,
                    override: direct,
                    effective,
                    muted
                };
            });
            if ((pattern.tags || []).includes('part-break-visual')) {
                const reactionBeat = binding.timeline.beats.find(beat => beat.id === 'reaction')
                    || binding.timeline.beats[0];
                const makePartSlot = (label, order = 0) => {
                    const slotKey = 'beat:se';
                    const direct = patternOverrides[slotKey] || null;
                    const muted = direct?.disabled === true;
                    const fallback = overrides.routes?.common?.['__visual.part-break']?.[slotKey]
                        || (monsterOverrides['__reaction.part-break-small'] || {})['beat:break-se']
                        || null;
                    return {
                        slot: slotKey,
                        phase: 'reaction',
                        label,
                        note: '부위파괴 동시 재생',
                        order,
                        runtimeReady: true,
                        atTicks: reactionBeat?.startTicks || 0,
                        beatId: reactionBeat?.id || 'reaction',
                        current: fallback,
                        assigned: muted ? null : (direct || fallback),
                        override: direct,
                        effective: muted ? null : (direct || fallback),
                        muted
                    };
                };
                slots = [makePartSlot('공통 부위파괴 SE', 0)];
            } else if ((pattern.tags || []).includes('trap')) {
                const trapLabels = {
                    reaction: '지반 붕괴',
                    release: '탈출'
                };
                slots = binding.timeline.beats.flatMap((beat, beatIndex) => ['se', 'vo'].map((layer, layerIndex) => {
                    const slotKey = `beat:${beat.id}-${layer}`;
                    const direct = patternOverrides[slotKey] || null;
                    const fallback = null;
                    const muted = direct?.disabled === true;
                    return {
                        slot: slotKey,
                        phase: 'reaction',
                        label: `${trapLabels[beat.id] || beat.label} ${layer.toUpperCase()}`,
                        note: '구멍함정 단계별 SE·VO 동시 재생',
                        order: beatIndex * 2 + layerIndex,
                        runtimeReady: true,
                        atTicks: beat.startTicks,
                        beatId: beat.id,
                        current: null,
                        assigned: muted ? null : (direct || fallback),
                        override: direct,
                        effective: muted ? null : (direct || fallback),
                        muted
                    };
                }));
            }
            const beatSlots = new Map();
            slots.forEach(slot => {
                if (!beatSlots.has(slot.beatId)) beatSlots.set(slot.beatId, []);
                beatSlots.get(slot.beatId).push(slot.slot);
            });
            const timeline = {
                ...binding.timeline,
                beats: binding.timeline.beats.map(beat => ({
                    ...beat,
                    audioSlots: beatSlots.get(beat.id) || []
                }))
            };
            // The review tool consumes one graph contract regardless of the
            // renderer used by the live hunt. Older CSS profiles are an
            // implementation adapter, not a second editor/data model.
            const authoredMotion = Array.isArray(pattern.motion) && pattern.motion.length
                ? normalizeMotionJudgments(pattern.motion, pattern) : null;
            const graphBeats = authoredMotion || normalizeMotionJudgments(timeline.beats.map(beat => {
                const saved = (pattern.runtimeTimingBeats || []).find(item => item.beat === beat.id) || {};
                return { ...saved, beat: beat.id, ticks: Number(saved.ticks) || beat.ticks,
                    hit: saved.hit === undefined ? Boolean(beat.hit) : Boolean(saved.hit),
                    hitOffsetTicks: Math.max(0, Math.round(Number(
                        saved.hitOffsetTicks ?? beat.hitOffsetTicks
                    ) || 0)) };
            }), pattern);
            const motionGraph = {
                version: 1,
                renderer: authoredMotion ? 'beat' : 'keyframe-beat',
                profile: authoredMotion ? null : (pattern.animationProfile || null),
                beats: graphBeats
            };
            return {
                id: pattern.id,
                name: pattern.name || pattern.id,
                type: pattern.type || null,
                delivery: pattern.delivery || null,
                damageRatio: Math.max(0, Number(pattern.damageRatio || 0)),
                minTargets: Math.max(1, Number(pattern.minTargets || 1)),
                maxTargets: Math.max(1, Number(pattern.maxTargets || pattern.minTargets || 1)),
                targeting: pattern.targeting ? { ...pattern.targeting } : null,
                projectileVisual: pattern.projectileVisual || null,
                projectileEventKinds: Array.isArray(pattern.projectileEventKinds)
                    ? [...pattern.projectileEventKinds] : [],
                originPart: pattern.originPart || null,
                tags: pattern.tags || [],
                reactionKind: pattern.reactionKind || null,
                reactionPart: pattern.reactionPart || null,
                reactionSize: pattern.reactionSize || null,
                interference: pattern.interference ? { ...pattern.interference } : null,
                secondaryInterference: pattern.secondaryInterference
                    ? { ...pattern.secondaryInterference } : null,
                motion: authoredMotion,
                motionGraph,
                runtimeMotionBackend: pattern.runtimeMotionBackend || null,
                runtimeSourceTimingBeats: Array.isArray(pattern.runtimeSourceTimingBeats)
                    ? pattern.runtimeSourceTimingBeats.map(beat => ({ ...beat })) : null,
                runtimeTimingBeats: Array.isArray(pattern.runtimeTimingBeats)
                    ? pattern.runtimeTimingBeats.map(beat => ({ ...beat })) : null,
                animationProfile: pattern.animationProfile || null,
                animationDurationMs: Number(pattern.animationDurationMs) || null,
                movement: pattern.movement ? { ...pattern.movement } : null,
                windupTicks: Number(pattern.windupTicks) || 0,
                recoveryTicks: Number(pattern.recoveryTicks) || 0,
                impactTimeline: Array.isArray(pattern.impactTimeline)
                    ? pattern.impactTimeline.map(event => ({ ...event })) : [],
                timeline,
                slots,
                audioBindingErrors: binding.errors
            };
        })
    };
}

let cachedCatalogs = null;
let cachedCatalogSourceStamp = '';
const HUNT_CATALOG_SOURCE_FILES = [
    '../js/effects/hunt/HuntMonsterProfiles.js',
    '../js/effects/hunt/data/WildsMonsterBehavior.generated.js',
    '../js/effects/hunt/data/RiseMonsterBehavior.generated.js',
    '../js/effects/hunt/data/WorldMonsterBehavior.generated.js',
    '../js/effects/hunt/data/WorldShellBehavior.generated.js',
    '../js/effects/hunt/data/MhxxMonsterBehavior.generated.js',
    '../js/effects/hunt/data/MhxxDbMonsterBehavior.generated.js',
    '../js/effects/hunt/data/PublishedMonsterBehavior.js',
    '../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js',
    '../js/effects/MonsterData.js',
    '../js/effects/hunt/HuntMonsterPatternCatalog.js'
];

function catalogSourceStamp() {
    return HUNT_CATALOG_SOURCE_FILES.map(file => {
        const absolute = require.resolve(file);
        const stat = fs.statSync(absolute);
        return `${absolute}:${stat.mtimeMs}:${stat.size}`;
    }).join('|');
}

function requireFresh(file) {
    const resolved = require.resolve(file);
    delete require.cache[resolved];
    return require(resolved);
}

// The review UI and its embedded real-hunt preview must read the same authored
// catalog. Source files are cheap compared with decoded audio graphs, so refresh
// only this compact runtime catalog when an editor or another agent changes it.
// This removes the old split where HTML hot-reloaded but pattern data stayed
// frozen until the review server was manually restarted.
function refreshHuntCatalogSources({ force = false } = {}) {
    const stamp = catalogSourceStamp();
    if (!force && stamp === cachedCatalogSourceStamp) return false;
    if (typeof global.window === 'undefined') global.window = global;
    global.HUNT_MONSTER_PATTERN_OVERRIDES = requireFresh(HUNT_CATALOG_SOURCE_FILES[0]);
    for (const file of HUNT_CATALOG_SOURCE_FILES.slice(1, 8)) requireFresh(file);
    global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = requireFresh(HUNT_CATALOG_SOURCE_FILES[8]);
    requireFresh(HUNT_CATALOG_SOURCE_FILES[9]);
    requireFresh(HUNT_CATALOG_SOURCE_FILES[10]);
    cachedCatalogSourceStamp = stamp;
    return true;
}

function loadHuntCatalogs() {
    const refreshed = refreshHuntCatalogSources({ force: !cachedCatalogs });
    if (refreshed) cachedCatalogs = null;
    if (cachedCatalogs) return cachedCatalogs;
    const PatternCatalog = requireFresh('../js/effects/hunt/HuntMonsterPatternCatalog.js');
    const AudioCatalog = require('../js/effects/hunt/HuntAudioCatalog.js');
    cachedCatalogs = {
        patternsFor: huntId => (PatternCatalog.build(
            {}, global.MONSTER_DATA.filter(monster => monster.id === huntId)
        )[huntId] || []),
        routes: AudioCatalog.HUNT_VERIFIED_LOCAL_MONSTER_CUES || {}
    };
    return cachedCatalogs;
}

const GRAPH_ID_TO_HUNT_ID = {
    em001: 'rathian',
    em002: 'rathalos',
    em007: 'diablos',
    em032: 'tigrex',
    em102: 'pukei_pukei',
    em111: 'legiana',
    em118: 'bazelgeuse',
    em037: 'nargacuga',
    em042: 'barioth',
    em057: 'zinogre',
    em063: 'brachydios',
    em080: 'glavenus',
    em100: 'anjanath'
};

// The review UI selects monsters by their World bank id (em007 / em002); accept either
// that or the hunt id (diablos / rathalos) and normalise to the hunt id everything else
// keys on.
function resolveHuntId(idOrGraphId, bankMapPath = BANK_MAP_PATH) {
    const id = String(idOrGraphId || '').toLowerCase();
    if (GRAPH_ID_TO_HUNT_ID[id]) return GRAPH_ID_TO_HUNT_ID[id];
    const huntIndex = huntToGraphId(bankMapPath);
    if (huntIndex[id]) return id;
    for (const [huntId, graphId] of Object.entries(huntIndex)) {
        if (graphId === id) return huntId;
    }
    return id;
}

function loadHuntPatternAudioMap(idOrGraphId, { overridesPath = OVERRIDES_PATH, bankMapPath = BANK_MAP_PATH } = {}) {
    const { patternsFor, routes } = loadHuntCatalogs();
    const huntId = resolveHuntId(idOrGraphId, bankMapPath);
    const monster = (global.MONSTER_DATA || []).find(entry => entry.id === huntId) || {};
    const partLabels = {
        head: '머리', tail: '꼬리', torso: '몸통', back: '등', chest: '가슴', neck: '목',
        'left-wing': '좌익', 'right-wing': '우익', wing: '날개',
        'left-horn': '좌뿔', 'right-horn': '우뿔', horn: '뿔',
        'left-leg': '왼발', 'right-leg': '오른발', 'left-foreleg': '왼앞발',
        'right-foreleg': '오른앞발', foot: '발'
    };
    Object.assign(partLabels, {
        head: '머리', tail: '꼬리', back: '등', torso: '몸통',
        'left-horn': '좌뿔', 'right-horn': '우뿔',
        'left-front-leg': '왼발', 'right-front-leg': '오른발',
        'left-wing': '좌익', 'right-wing': '우익'
    });
    const reactionPattern = (id, name, beats, tags = [], reaction = {}) => ({
        id, name, type: 'reaction', damageRatio: 0, minTargets: 1, maxTargets: 1,
        suppressPrepareAudio: true, tags: ['review-reaction', 'no-impact', ...tags], motion: beats,
        reactionKind: reaction.kind || id.replace('__reaction.', ''),
        reactionPart: reaction.part || null,
        reactionSize: reaction.size || null
    });
    const flinchMotion = impactLabel => [
        { beat: 'reaction', label: impactLabel, ticks: 3, pose: 'stretch-strong',
            origin: '50% 88%', offsetX: -12, offsetY: -8, rotation: -18,
            skewX: 5, scaleX: 1.06, scaleY: .94, moveEasing: 'snap',
            rotationEasing: 'snap' },
        { beat: 'recoil', label: '퍽 밀려남', ticks: 7, pose: 'land',
            origin: '50% 88%', offsetX: 42, offsetY: 18, rotation: 25,
            skewX: -9, scaleX: .96, scaleY: 1.06, moveEasing: 'decelerate',
            rotationEasing: 'slow-fast-slow' },
        { beat: 'brace', label: '넘어지지 않게 버팀', ticks: 8, pose: 'brace',
            origin: '50% 88%', offsetX: 34, offsetY: 14, rotation: 15,
            skewX: -4, scaleX: .98, scaleY: 1.03, moveEasing: 'slow-fast-slow',
            rotationEasing: 'slow-fast-slow' },
        { beat: 'recover', label: '비틀거리며 복귀', ticks: 12, pose: 'idle',
            origin: '50% 88%', offsetX: 0, offsetY: 0, rotation: 0,
            skewX: 0, scaleX: 1, scaleY: 1, moveEasing: 'decelerate',
            rotationEasing: 'decelerate' }
    ];
    // Stun reuses this exact body timeline. Only its state marker and audio
    // route differ; timing overrides are inherited from knockdown below.
    const knockdownMotion = () => [
        { beat: 'reaction', label: '넘어짐', ticks: 6, pose: 'land' },
        { beat: 'struggle-1', label: '바둥 1', ticks: 12, pose: 'land' },
        { beat: 'struggle-2', label: '바둥 2', ticks: 12, pose: 'land' },
        { beat: 'struggle-3', label: '바둥 3', ticks: 12, pose: 'land' },
        { beat: 'struggle-4', label: '바둥 4', ticks: 12, pose: 'land' },
        { beat: 'struggle-5', label: '바둥 5', ticks: 12, pose: 'land' },
        { beat: 'rise', label: '일어남', ticks: 10, pose: 'idle' }
    ];
    const reactions = [
        reactionPattern('__reaction.flinch', '소경직', flinchMotion('어퍼컷 피격'), ['flinch']),
        reactionPattern('__reaction.knockdown', '대경직', knockdownMotion(), ['knockdown']),
        reactionPattern('__reaction.tail-sever', '꼬짤경직', [
            { beat: 'reaction', label: '절단 충격', ticks: 4, pose: 'stretch-strong',
                origin: '50% 68%', offsetX: -16, offsetY: -18, rotation: -14,
                scaleX: 1.06, scaleY: 1.06, moveEasing: 'snap', rotationEasing: 'snap' },
            { beat: 'roll-1', label: '첫 바퀴', ticks: 11, pose: 'land',
                origin: '50% 68%', offsetX: 36, offsetY: 4, rotation: 170,
                scaleX: 1.04, scaleY: .94, moveEasing: 'accelerate', rotationEasing: 'accelerate' },
            { beat: 'roll-2', label: '두 바퀴', ticks: 12, pose: 'land',
                origin: '50% 68%', offsetX: 126, offsetY: 32, rotation: 700,
                scaleX: 1.03, scaleY: .9, moveEasing: 'slow-fast-slow', rotationEasing: 'slow-fast-slow' },
            { beat: 'down', label: '옆으로 쓰러짐', ticks: 20, pose: 'land',
                origin: '50% 68%', offsetX: 112, offsetY: 42, rotation: 720,
                skewX: -10, scaleX: 1.08, scaleY: .68, moveEasing: 'decelerate', rotationEasing: 'decelerate' },
            { beat: 'recover', label: '일어남', ticks: 13, pose: 'idle',
                origin: '50% 68%', offsetX: 0, offsetY: 0, rotation: 720,
                skewX: 0, scaleX: 1, scaleY: 1, moveEasing: 'decelerate', rotationEasing: 'decelerate' }
        ], ['tail-sever'], { kind: 'tail-sever' }),
        reactionPattern('__visual.part-break', '부위파괴 이미지·사운드 레이어', [
            { beat: 'reaction', label: '소재 쪼개짐', ticks: 25, pose: 'idle' }
        ], ['part-break-visual'], { kind: 'part-break-visual' }),
        reactionPattern('__reaction.pitfall', '구멍함정', [
            { beat: 'reaction', label: '지반 붕괴', ticks: 6, pose: 'land' },
            { beat: 'held-1', label: '허덕임 1', ticks: 12, pose: 'crouch' },
            { beat: 'held-2', label: '허덕임 2', ticks: 12, pose: 'crouch' },
            { beat: 'held-3', label: '허덕임 3', ticks: 12, pose: 'crouch' },
            { beat: 'held-4', label: '허덕임 4', ticks: 12, pose: 'crouch' },
            { beat: 'held-5', label: '허덕임 5', ticks: 12, pose: 'crouch' },
            { beat: 'held-6', label: '허덕임 6', ticks: 12, pose: 'crouch' },
            { beat: 'release', label: '탈출', ticks: 8, pose: 'idle' }
        ], ['trap'], { kind: 'pitfall' }),
        reactionPattern('__reaction.stun', '기절', knockdownMotion(), ['knockdown'], { kind: 'stunned' }),
        reactionPattern('__reaction.paralysis', '마비', [
            { beat: 'held', label: '마비', ticks: 38, pose: 'crouch' }
        ], ['knockdown'], { kind: 'paralyzed' }),
        reactionPattern('__reaction.sleep', '수면', [
            { beat: 'sleep-enter', label: '드러누워 잠들기', ticks: 30, pose: 'land', origin: '50% 88%',
                offsetX: 24, offsetY: 30, rotation: 28, skewX: -8, scaleX: 1.06, scaleY: .68,
                moveEasing: 'decelerate', rotationEasing: 'decelerate' },
            { beat: 'held', label: '수면 유지', ticks: 200, pose: 'land', origin: '50% 88%',
                offsetX: 24, offsetY: 30, rotation: 28, skewX: -8, scaleX: 1.06, scaleY: .68 },
            { beat: 'wake', label: '! 기상', ticks: 5, pose: 'idle', origin: '50% 88%',
                offsetX: 0, offsetY: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1,
                moveEasing: 'snap', rotationEasing: 'snap' }
        ], ['knockdown'], { kind: 'sleeping' }),
        reactionPattern('__reaction.death', '죽음', [
            { beat: 'reaction', label: '죽음', ticks: 8, pose: 'land', rotationToward: 34 },
            { beat: 'down', label: '쓰러짐', ticks: 18, pose: 'land', opacity: .72 }
        ], ['death'])
    ];
    // Reactions and part-break rows are editor/runtime patterns created here,
    // after HuntMonsterPatternCatalog has already applied motion overrides to
    // the regular attack catalog. Apply the same persisted BEAT contract to
    // these synthetic patterns as well. Without this pass a save succeeded on
    // disk, but the immediate GET rebuilt the default 12-tick reaction and the
    // editor falsely reported a reload-verification failure.
    const reactionOverrides = global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES?.[huntId] || {};
    const reviewedReactions = reactions.map(pattern => {
        const overrideId = pattern.id === '__reaction.stun' ? '__reaction.knockdown' : pattern.id;
        const saved = reactionOverrides[overrideId]?.beats;
        const sourceMotion = pattern.motion;
        if (!saved || !Array.isArray(sourceMotion)) return { ...pattern, motion: sourceMotion };
        return {
            ...pattern,
            motion: sourceMotion.map((beat, index) => {
                const beatId = beat.beat || `beat-${index + 1}`;
                const value = saved[beatId];
                if (value == null) return beat;
                const patch = typeof value === 'object' ? value : { ticks: value };
                return { ...beat, ...patch, beat: beatId,
                    ticks: Math.max(1, Number(patch.ticks) || Number(beat.ticks) || 1) };
            })
        };
    });
    const result = buildMonsterPatternAudioMap({
        huntId,
        patterns: [...patternsFor(huntId), ...reviewedReactions],
        catalog: routes,
        overridesPath,
        bankMapPath
    });
    const motionDocument = readJson(MOTION_OVERRIDES_PATH, { overrides: {} });
    const authored = motionDocument.overrides?.[huntId]?.__partReactions || {};
    const ReactionCatalog = require('../js/effects/hunt/HuntMonsterReactionCatalog.js');
    const reviewed = require('../js/effects/hunt/data/ReviewedMonsterAnatomy.js');
    const anatomyParts = monster.parts?.length ? monster.parts : (reviewed.monsters?.[huntId]?.parts || []);
    result.partReactions = anatomyParts.filter(part => part.breakable || part.severable
        || (reviewed.monsters?.[huntId]?.tailSeverable && /tail/.test(part.kind))).map(part => ({
        partKind: part.kind,
        label: partLabels[part.kind] || part.kind,
        profile: ReactionCatalog.profile(
            authored[part.kind] || ReactionCatalog.defaultProfile(huntId, part.kind, false)
        ).id,
        authored: Object.prototype.hasOwnProperty.call(authored, part.kind)
    }));
    return result;
}

function savePartReactionMappings({ huntId, mappings = {} }, overridesPath = MOTION_OVERRIDES_PATH) {
    if (!huntId) throw new Error('huntId is required');
    const allowed = new Set(['flinch', 'knockdown', 'tail']);
    const aliases = { small: 'flinch', large: 'knockdown' };
    const document = readJson(overridesPath, { version: 1, overrides: {} });
    document.overrides = document.overrides || {};
    document.overrides[huntId] = document.overrides[huntId] || {};
    const clean = Object.fromEntries(Object.entries(mappings)
        .map(([partKind, profile]) => [partKind, aliases[profile] || profile])
        .filter(([partKind, profile]) => partKind && allowed.has(profile))
        .map(([partKind, profile]) => [String(partKind), profile]));
    document.overrides[huntId].__partReactions = clean;
    document.updatedAt = new Date().toISOString();
    const temporary = `${overridesPath}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, overridesPath);
    const persisted = readJson(overridesPath, null)?.overrides?.[huntId]?.__partReactions;
    if (JSON.stringify(persisted) !== JSON.stringify(clean)) throw new Error('Part reaction mapping verification failed');
    const generated = overridesPath === MOTION_OVERRIDES_PATH
        ? require('../scripts/generate-monster-pattern-motion-overrides.js').generate()
        : null;
    global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = document.overrides;
    return { huntId, mappings: clean, generated, revision: `${Number(document.version) || 1}:${document.updatedAt}` };
}

// Persist, suppress, or clear a single pattern-slot assignment. `disabled`
// explicitly silences the slot, including its hand-authored catalog fallback.
function savePatternRoute({ huntId, patternId, slot, files = [], gain = 0.7, delay = 0, label = null, mode = null, disabled = false }, overridesPath = OVERRIDES_PATH) {
    patternId = canonicalAudioPatternId(patternId);
    // The material crack belongs to the shared visual layer, never to a
    // monster identity. Saving it from any monster updates the common route.
    if (patternId === '__visual.part-break') huntId = 'common';
    if (!huntId || !patternId || !slot) throw new Error('huntId, patternId, slot는 필수입니다.');
    const cleanFiles = (Array.isArray(files) ? files : [files])
        .map(file => String(file || '').replace(/\\/g, '/'))
        .filter(file => file.toLowerCase().endsWith('.mp3'));
    const previousText = fs.existsSync(overridesPath) ? fs.readFileSync(overridesPath, 'utf8') : null;
    const overrides = readJson(overridesPath, { version: 1, routes: {} });
    overrides.version = Math.max(1, Number(overrides.version) || 1);
    overrides.routes = overrides.routes || {};
    overrides.routes[huntId] = overrides.routes[huntId] || {};
    overrides.routes[huntId][patternId] = overrides.routes[huntId][patternId] || {};
    if (cleanFiles.length) {
        overrides.routes[huntId][patternId][slot] = {
            label,
            ...(mode === 'random' ? { mode: 'random' } : {}),
            layers: cleanFiles.map(file => [file, Number(gain) || 0.7, Number(delay) || 0])
        };
    } else if (disabled === true) {
        overrides.routes[huntId][patternId][slot] = { disabled: true };
    } else {
        delete overrides.routes[huntId][patternId][slot];
        if (!Object.keys(overrides.routes[huntId][patternId]).length) delete overrides.routes[huntId][patternId];
        if (!Object.keys(overrides.routes[huntId]).length) delete overrides.routes[huntId];
    }
    overrides.updatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(overridesPath), { recursive: true });
    const temporary = `${overridesPath}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, overridesPath);
    try {
        const persisted = readJson(overridesPath, null);
        if (JSON.stringify(persisted?.routes || {}) !== JSON.stringify(overrides.routes)) throw new Error('Audio route source verification failed');
        let generated = null;
        if (overridesPath === OVERRIDES_PATH) generated = require('../scripts/generate-monster-pattern-audio-routes.js').generate();
        return { huntId, patternId, slot, files: cleanFiles, mode: mode === 'random' ? 'random' : null,
            disabled: disabled === true, generated, revision: `${overrides.version}:${overrides.updatedAt}` };
    } catch (error) {
        const rollback = `${overridesPath}.rollback.tmp`;
        if (previousText == null) fs.rmSync(overridesPath, { force: true });
        else { fs.writeFileSync(rollback, previousText, 'utf8'); fs.renameSync(rollback, overridesPath); }
        if (overridesPath === OVERRIDES_PATH) {
            try { require('../scripts/generate-monster-pattern-audio-routes.js').generate(); } catch { /* preserve original error */ }
        }
        throw new Error(`Audio route save rolled back: ${error.message}`);
    }
}

function movePatternRouteFile({ huntId, patternId, fromSlot, toSlot, file }, overridesPath = OVERRIDES_PATH) {
    const requestedPatternId = patternId;
    patternId = canonicalAudioPatternId(patternId);
    if (!huntId || !patternId || !fromSlot || !toSlot || fromSlot === toSlot) throw new Error('Two different sound slots are required');
    const cleanFile = String(file || '').replace(/\\/g, '/');
    if (!cleanFile.toLowerCase().endsWith('.mp3')) throw new Error('Only decoded MP3 routes can be moved');
    const pattern = loadHuntPatternAudioMap(huntId, { overridesPath }).patterns.find(item => item.id === requestedPatternId);
    if (!pattern) throw new Error(`Unknown pattern: ${huntId}/${patternId}`);
    const from = pattern.slots.find(item => item.slot === fromSlot), to = pattern.slots.find(item => item.slot === toSlot);
    if (!from || !to) throw new Error(`Unknown sound slot: ${fromSlot} -> ${toSlot}`);
    const sourceRoute = from.effective, targetRoute = to.effective;
    const sourceLayers = (sourceRoute?.layers || []).filter(Array.isArray);
    const movedLayer = sourceLayers.find(layer => String(layer[0] || '').replace(/\\/g, '/') === cleanFile);
    if (!movedLayer) throw new Error('The dragged audio is no longer assigned to the source slot');
    const remaining = sourceLayers.filter(layer => String(layer[0] || '').replace(/\\/g, '/') !== cleanFile);
    const targetLayers = (targetRoute?.layers || []).filter(Array.isArray)
        .filter(layer => String(layer[0] || '').replace(/\\/g, '/') !== cleanFile);
    targetLayers.push([...movedLayer]);
    const previousText = fs.existsSync(overridesPath) ? fs.readFileSync(overridesPath, 'utf8') : null;
    const overrides = readJson(overridesPath, { version: 1, routes: {} });
    overrides.version = Math.max(1, Number(overrides.version) || 1);
    overrides.routes = overrides.routes || {};
    overrides.routes[huntId] = overrides.routes[huntId] || {};
    overrides.routes[huntId][patternId] = overrides.routes[huntId][patternId] || {};
    overrides.routes[huntId][patternId][fromSlot] = remaining.length ? {
        label: sourceRoute?.label || null,
        ...(sourceRoute?.mode === 'random' ? { mode: 'random' } : {}),
        layers: remaining
    } : { disabled: true };
    overrides.routes[huntId][patternId][toSlot] = {
        label: targetRoute?.label || null,
        ...(targetRoute?.mode === 'random' ? { mode: 'random' } : {}),
        layers: targetLayers
    };
    overrides.updatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(overridesPath), { recursive: true });
    const temporary = `${overridesPath}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(overrides, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, overridesPath);
    try {
        const persisted = readJson(overridesPath, null);
        if (JSON.stringify(persisted?.routes || {}) !== JSON.stringify(overrides.routes)) throw new Error('Moved route verification failed');
        let generated = null;
        if (overridesPath === OVERRIDES_PATH) generated = require('../scripts/generate-monster-pattern-audio-routes.js').generate();
        return { huntId, patternId, fromSlot, toSlot, file: cleanFile, generated,
            revision: `${overrides.version}:${overrides.updatedAt}` };
    } catch (error) {
        const rollback = `${overridesPath}.rollback.tmp`;
        if (previousText == null) fs.rmSync(overridesPath, { force: true });
        else { fs.writeFileSync(rollback, previousText, 'utf8'); fs.renameSync(rollback, overridesPath); }
        if (overridesPath === OVERRIDES_PATH) {
            try { require('../scripts/generate-monster-pattern-audio-routes.js').generate(); } catch { /* preserve original error */ }
        }
        throw new Error(`Audio route move rolled back: ${error.message}`);
    }
}

function savePatternMotion({ huntId, patternId, beats = null, reset = false }, overridesPath = MOTION_OVERRIDES_PATH) {
    if (!huntId || !patternId) throw new Error('huntId와 patternId는 필수입니다.');
    const previousText = fs.existsSync(overridesPath) ? fs.readFileSync(overridesPath, 'utf8') : null;
    const document = readJson(overridesPath, { version: 1, overrides: {} });
    document.version = Math.max(1, Number(document.version) || 1);
    document.overrides = document.overrides || {};
    if (reset) {
        delete document.overrides[huntId]?.[patternId];
        if (document.overrides[huntId] && !Object.keys(document.overrides[huntId]).length) delete document.overrides[huntId];
    } else {
        const allowedText = ['at', 'to', 'origin', 'moveEasing', 'rotationEasing', 'pose',
            'face', 'align', 'bounds', 'fade', 'sfx', 'label', 'aimBodyAt', 'targetMode',
            'fx', 'fxAnchor', 'fxSecondary', 'fxSecondaryAnchor', 'fxSecondaryAngleMode'];
        const allowedNumber = ['offsetX', 'offsetY', 'depth', 'rotation', 'rotationToward',
            'rotateBy', 'rotateByFacing', 'scaleX', 'scaleY', 'skewX', 'skewY', 'opacity',
            'damageScale', 'hitOffsetTicks', 'strideFlipTicks', 'stompSteps', 'fxDurationTicks',
            'fxSecondaryDurationTicks'];
        const allowedBoolean = ['hit', 'alignRotationToTravel', 'instantOpacity', 'instantPose',
            'continueTravel', 'flipFacing'];
        const seenJudgmentIds = new Set();
        const cleanBeats = Object.fromEntries(Object.entries(beats || {}).map(([id, value]) => {
            if (!value || typeof value !== 'object') {
                return [String(id), Math.max(1, Math.min(600, Math.round(Number(value) || 1)))];
            }
            const clean = { ticks: Math.max(1, Math.min(600, Math.round(Number(value.ticks) || 1))) };
            for (const key of allowedText) if (value[key] != null && String(value[key]).trim()) clean[key] = String(value[key]).trim().slice(0, 120);
            for (const key of allowedNumber) if (value[key] != null && Number.isFinite(Number(value[key]))) clean[key] = Number(value[key]);
            for (const key of allowedBoolean) if (typeof value[key] === 'boolean') clean[key] = value[key];
            if (value.judgmentOffsets && typeof value.judgmentOffsets === 'object') {
                const judgmentOffsets = Object.fromEntries(['roar', 'tremor', 'wind']
                    .filter(kind => Number.isFinite(Number(value.judgmentOffsets[kind])))
                    .map(kind => [kind, Math.max(0, Math.min(clean.ticks - 1,
                        Math.round(Number(value.judgmentOffsets[kind]))))]));
                if (Object.keys(judgmentOffsets).length) clean.judgmentOffsets = judgmentOffsets;
            }
            if (Array.isArray(value.judgments)) {
                clean.judgments = value.judgments.slice(0, 32).map((item, index) => {
                    const kind = ['damage', 'roar', 'tremor', 'wind'].includes(item?.kind) ? item.kind : 'damage';
                    const target = ['primary', 'left', 'right', 'pair', 'pair-left', 'pair-right',
                        'primary-adjacent', 'all'].includes(item?.target)
                        ? item.target : 'primary';
                    const result = {
                        id: String(item?.id || `${id}-judgment-${index + 1}`).slice(0, 80),
                        group: String(item?.group || item?.id || `${id}-impact`).slice(0, 80),
                        kind, target,
                        offsetTicks: Math.max(0, Math.min(clean.ticks - 1, Math.round(Number(item?.offsetTicks) || 0)))
                    };
                    if (kind === 'damage') {
                        if (Number.isFinite(Number(item?.damagePercent))) {
                            result.damagePercent = Math.max(0, Math.min(1000, Number(item.damagePercent)));
                        } else if (Number.isFinite(Number(item?.damageScale))) {
                            result.damageScale = Math.max(0, Math.min(10, Number(item.damageScale)));
                        } else result.damagePercent = 0;
                        if (['strong', 'butt-stumble', 'weak'].includes(item?.hitReactionKind)) {
                            result.hitReactionKind = item.hitReactionKind;
                        }
                    }
                    else result.size = item?.size === 'small' ? 'small' : 'large';
                    if (item?.directHitSupersedes === true) result.directHitSupersedes = true;
                    return result;
                }).filter(item => {
                    const key = String(item.id || item.group || '');
                    if (!key || seenJudgmentIds.has(key)) return false;
                    seenJudgmentIds.add(key);
                    return true;
                });
                // [] is a deliberate override that clears inherited judgments.
                // Never collapse it to an omitted field or deleted judgments return on reload.
            }
            if (Array.isArray(clean.judgments) && clean.judgments.length) {
                clean.hit = false;
                delete clean.hitOffsetTicks;
                delete clean.judgmentOffsets;
            }
            if (Array.isArray(value.fxAdditional)) {
                clean.fxAdditional = value.fxAdditional.slice(0, 12).map(item => ({
                    fx: String(item?.fx || '').trim().slice(0, 120),
                    anchor: String(item?.anchor || '').trim().slice(0, 120),
                    durationTicks: Math.max(0, Math.min(600, Math.round(Number(item?.durationTicks) || 0))),
                    angleMode: String(item?.angleMode || '').trim().slice(0, 120)
                })).filter(item => item.fx);
                if (!clean.fxAdditional.length) delete clean.fxAdditional;
            }
            return [String(id), clean];
        }));
        if (!Object.keys(cleanBeats).length) throw new Error('저장할 모션 비트가 없습니다.');
        document.overrides[huntId] = document.overrides[huntId] || {};
        document.overrides[huntId][patternId] = { beats: cleanBeats };
    }
    document.updatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(overridesPath), { recursive: true });
    const temporary = `${overridesPath}.tmp`;
    fs.writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
    fs.renameSync(temporary, overridesPath);
    let generated = null;
    try {
        const persisted = readJson(overridesPath, null);
        const expected = document.overrides[huntId]?.[patternId]?.beats || null;
        const actual = persisted?.overrides?.[huntId]?.[patternId]?.beats || null;
        if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('Motion source verification failed');
        if (overridesPath === MOTION_OVERRIDES_PATH) {
            generated = require('../scripts/generate-monster-pattern-motion-overrides.js').generate();
        }
        global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = document.overrides;
        return { huntId, patternId, reset: Boolean(reset), beats: actual, generated,
            revision: `${Number(document.version) || 1}:${document.updatedAt}` };
    } catch (error) {
        const rollback = `${overridesPath}.rollback.tmp`;
        if (previousText == null) fs.rmSync(overridesPath, { force: true });
        else { fs.writeFileSync(rollback, previousText, 'utf8'); fs.renameSync(rollback, overridesPath); }
        if (overridesPath === MOTION_OVERRIDES_PATH) {
            try { require('../scripts/generate-monster-pattern-motion-overrides.js').generate(); } catch { /* preserve original error */ }
        }
        throw new Error(`Motion save rolled back: ${error.message}`);
    }
}

function migrateLegacyPatternRoutes(overridesPath = OVERRIDES_PATH, { write = false } = {}) {
    const document = readJson(overridesPath, { version: 1, routes: {} });
    const migrated = [], errors = [];
    for (const [huntId, patternRoutes] of Object.entries(document.routes || {})) {
        const map = loadHuntPatternAudioMap(huntId, { overridesPath });
        for (const [patternId, routeSlots] of Object.entries(patternRoutes || {})) {
            const pattern = map.patterns.find(item => item.id === patternId);
            if (!pattern) { errors.push(`${huntId}/${patternId}:pattern-missing`); continue; }
            const next = {};
            for (const [slotKey, route] of Object.entries(routeSlots || {})) {
                if (slotKey.startsWith('beat:')) { next[slotKey] = route; continue; }
                const phase = slotKey.startsWith('impact') ? 'impact' : slotKey.split(':')[0];
                const moment = pattern.slots.find(slot => (slot.legacySlots || []).includes(slotKey))
                    || pattern.slots.find(slot => slot.phase === phase)
                    || (['telegraph', 'impact'].includes(phase) ? pattern.slots[0] : null);
                if (!moment) { errors.push(`${huntId}/${patternId}/${slotKey}:beat-missing`); continue; }
                const target = moment.slot;
                const sourceLayers = Array.isArray(route?.layers) ? route.layers : [];
                if (next[target]) {
                    next[target] = {
                        ...next[target],
                        label: [next[target].label, route?.label].filter(Boolean).join(' + ') || null,
                        layers: [...(next[target].layers || []), ...sourceLayers],
                        migratedFrom: [...new Set([...(next[target].migratedFrom || []), slotKey])]
                    };
                } else {
                    next[target] = { ...route, migratedFrom: [slotKey] };
                }
                migrated.push(`${huntId}/${patternId}/${slotKey}->${target}`);
            }
            patternRoutes[patternId] = next;
        }
    }
    if (write) {
        if (errors.length) throw new Error(`사운드 경로 마이그레이션 중단:\n${errors.join('\n')}`);
        document.version = 2;
        document.updatedAt = new Date().toISOString();
        const temporary = `${overridesPath}.tmp`;
        fs.writeFileSync(temporary, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
        fs.renameSync(temporary, overridesPath);
        if (overridesPath === OVERRIDES_PATH) require('../scripts/generate-monster-pattern-audio-routes.js').generate();
    }
    return { migrated, errors, document };
}

module.exports = {
    OVERRIDES_PATH,
    MOTION_OVERRIDES_PATH,
    BANK_MAP_PATH,
    huntToGraphId,
    resolveHuntId,
    patternAudioSlots,
    patternReviewTimeline,
    bindAudioSlotsToTimeline,
    currentCatalogRoute,
    buildMonsterPatternAudioMap,
    loadHuntCatalogs,
    refreshHuntCatalogSources,
    loadHuntPatternAudioMap,
    savePatternRoute,
    movePatternRouteFile,
    savePatternMotion,
    savePartReactionMappings,
    migrateLegacyPatternRoutes
};
