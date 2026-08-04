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

function readJson(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
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
    const timeline = Array.isArray(pattern.impactTimeline) && pattern.impactTimeline.length
        ? pattern.impactTimeline : [{}];
    const hasUniqueCues = timeline.some(event => event && event.audioCue && event.audioCue !== 'none');
    if (isProjectile && !hasUniqueCues) {
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
            const slots = patternAudioSlots(pattern).map(slot => ({
                ...slot,
                current: currentCatalogRoute(catalog, huntId, slot.slot, pattern),
                assigned: (monsterOverrides[pattern.id] || {})[slot.slot] || null
            }));
            return {
                id: pattern.id,
                name: pattern.name || pattern.id,
                type: pattern.type || null,
                delivery: pattern.delivery || null,
                tags: pattern.tags || [],
                slots
            };
        })
    };
}

let cachedCatalogs = null;
// Load the reviewed pattern catalog + hand-authored audio routes once. The hunt
// runtime files expect a browser-ish global, so mirror the test harness shim.
function loadHuntCatalogs() {
    if (cachedCatalogs) return cachedCatalogs;
    if (typeof global.window === 'undefined') global.window = global;
    global.HUNT_MONSTER_PATTERN_OVERRIDES = require('../js/effects/hunt/HuntMonsterProfiles.js');
    for (const file of ['WildsMonsterBehavior', 'RiseMonsterBehavior', 'WorldMonsterBehavior',
        'WorldShellBehavior', 'MhxxMonsterBehavior', 'MhxxDbMonsterBehavior']) {
        require(`../js/effects/hunt/data/${file}.generated.js`);
    }
    require('../js/effects/hunt/data/PublishedMonsterBehavior.js');
    require('../js/effects/MonsterData.js');
    const PatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
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
    return buildMonsterPatternAudioMap({
        huntId,
        patterns: patternsFor(huntId),
        catalog: routes,
        overridesPath,
        bankMapPath
    });
}

// Persist (or clear) a single pattern-slot assignment. `files` is an ordered
// list of repo-relative mp3 paths; empty clears the override so the slot falls
// back to the hand-authored catalog again.
function savePatternRoute({ huntId, patternId, slot, files = [], gain = 0.7, delay = 0, label = null }, overridesPath = OVERRIDES_PATH) {
    if (!huntId || !patternId || !slot) throw new Error('huntId, patternId, slot는 필수입니다.');
    const cleanFiles = (Array.isArray(files) ? files : [files])
        .map(file => String(file || '').replace(/\\/g, '/'))
        .filter(file => file.toLowerCase().endsWith('.mp3'));
    const overrides = readJson(overridesPath, { version: 1, routes: {} });
    overrides.version = Math.max(1, Number(overrides.version) || 1);
    overrides.routes = overrides.routes || {};
    overrides.routes[huntId] = overrides.routes[huntId] || {};
    overrides.routes[huntId][patternId] = overrides.routes[huntId][patternId] || {};
    if (cleanFiles.length) {
        overrides.routes[huntId][patternId][slot] = {
            label,
            layers: cleanFiles.map(file => [file, Number(gain) || 0.7, Number(delay) || 0])
        };
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
    // Recompile the runtime global so the assignment takes effect on next reload.
    // Only when writing the real overrides file (tests use a temp path).
    let generated = null;
    if (overridesPath === OVERRIDES_PATH) {
        try { generated = require('../scripts/generate-monster-pattern-audio-routes.js').generate(); }
        catch { generated = null; }
    }
    return { huntId, patternId, slot, files: cleanFiles, generated };
}

module.exports = {
    OVERRIDES_PATH,
    BANK_MAP_PATH,
    huntToGraphId,
    resolveHuntId,
    patternAudioSlots,
    currentCatalogRoute,
    buildMonsterPatternAudioMap,
    loadHuntCatalogs,
    loadHuntPatternAudioMap,
    savePatternRoute
};
