'use strict';

(function exposeMonsterMotionAuthoringContract(root, factory) {
    const rotation = typeof module === 'object' && module.exports
        ? require('../js/effects/hunt/HuntRotationContract.js')
        : root?.HuntRotationContract;
    const api = factory(rotation);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.MonsterMotionAuthoringContract = api;
}(typeof globalThis === 'object' ? globalThis : this, rotation => {
    if (!rotation) throw new Error('HuntRotationContract is unavailable');
    const TEXT_FIELDS = Object.freeze(['at', 'to', 'origin', 'moveEasing', 'rotationEasing', 'pose',
        'face', 'align', 'bounds', 'fade', 'sfx', 'label', 'aimBodyAt', 'targetMode',
        'fx', 'fxAnchor', 'fxSecondary', 'fxSecondaryAnchor', 'fxSecondaryAngleMode',
        'rotationDirection', 'rotationResetMode']);
    const NUMBER_FIELDS = Object.freeze(['offsetX', 'offsetY', 'depth', 'rotation', 'rotationToward',
        'scaleX', 'scaleY', 'skewX', 'skewY', 'opacity',
        'damageScale', 'hitOffsetTicks', 'strideFlipTicks', 'stompSteps', 'fxDurationTicks',
        'fxSecondaryDurationTicks', 'rotationDegrees']);
    const BOOLEAN_FIELDS = Object.freeze(['hit', 'alignRotationToTravel', 'instantOpacity',
        'instantPose', 'continueTravel', 'flipFacing']);
    const STRUCTURED_FIELDS = Object.freeze(['judgmentOffsets', 'judgments', 'fxAdditional']);
    const EDITABLE_FIELDS = Object.freeze(['ticks', ...TEXT_FIELDS, ...NUMBER_FIELDS,
        ...BOOLEAN_FIELDS, ...STRUCTURED_FIELDS]);
    const VISUAL_FIELDS = Object.freeze([...TEXT_FIELDS.filter(key => key !== 'label'),
        ...NUMBER_FIELDS.filter(key => key !== 'hitOffsetTicks'),
        ...BOOLEAN_FIELDS.filter(key => key !== 'hit'), 'fxAdditional']);
    const JUDGMENT_KINDS = Object.freeze(['damage', 'roar', 'tremor', 'wind']);
    // Damage elements are authored per judgment, rather than inferred from an
    // action name, so multi-element attacks and status delivery remain explicit.
    const DAMAGE_ELEMENTS = Object.freeze(['fire', 'water', 'thunder', 'ice', 'dragon',
        'paralysis', 'sleep', 'blast']);
    const ROTATION_RESET_MODES = Object.freeze(['auto', 'preserve', 'snap-end', 'animate']);
    const JUDGMENT_TARGETS = Object.freeze(['primary', 'left', 'right', 'pair', 'pair-left',
        'pair-right', 'primary-adjacent', 'all']);

    function ticks(value) {
        return Math.max(1, Math.min(600, Math.round(Number(
            typeof value === 'object' ? value?.ticks : value
        ) || 1)));
    }

    function normalizeJudgment(item = {}, { beatId = 'beat', index = 0, beatTicks = 1 } = {}) {
        const kind = JUDGMENT_KINDS.includes(item.kind) ? item.kind : 'damage';
        const target = JUDGMENT_TARGETS.includes(item.target) ? item.target : 'primary';
        const id = String(item.id || `${beatId}-judgment-${index + 1}`).slice(0, 80);
        const result = {
            id,
            group: String(item.group || item.id || `${beatId}-impact`).slice(0, 80),
            kind,
            target,
            offsetTicks: Math.max(0, Math.min(beatTicks - 1,
                Math.round(Number(item.offsetTicks) || 0)))
        };
        if (kind === 'damage') {
            // Projectile identity is authored gameplay metadata.  It must
            // survive timeline editing so a moved contact still resolves the
            // launch owned by the same BEAT graph.
            if (item.projectileId != null && String(item.projectileId).trim()) {
                result.projectileId = String(item.projectileId).trim().slice(0, 120);
            }
            if (Number.isFinite(Number(item.damagePercent))) {
                result.damagePercent = Math.max(0, Math.min(1000, Number(item.damagePercent)));
            } else if (Number.isFinite(Number(item.damageScale))) {
                result.damageScale = Math.max(0, Math.min(10, Number(item.damageScale)));
            } else result.damagePercent = 0;
            if (['strong', 'butt-stumble', 'weak'].includes(item.hitReactionKind)) {
                result.hitReactionKind = item.hitReactionKind === 'butt-stumble' ? 'weak' : item.hitReactionKind;
            }
            if (DAMAGE_ELEMENTS.includes(item.element)) result.element = item.element;
        } else result.size = item.size === 'small' ? 'small' : 'large';
        if (typeof item.directHitSupersedes === 'boolean') {
            result.directHitSupersedes = item.directHitSupersedes;
        }
        return result;
    }

    function normalizeBeat(value, { id = 'beat', seenJudgmentIds = new Set() } = {}) {
        if (!value || typeof value !== 'object') return { ticks: ticks(value) };
        const clean = { ticks: ticks(value) };
        for (const key of TEXT_FIELDS) {
            if (value[key] != null && String(value[key]).trim()) {
                clean[key] = String(value[key]).trim().slice(0, 120);
            }
        }
        if (clean.rotationResetMode && !ROTATION_RESET_MODES.includes(clean.rotationResetMode)) {
            delete clean.rotationResetMode;
        }
        for (const key of NUMBER_FIELDS) {
            if (value[key] != null && Number.isFinite(Number(value[key]))) clean[key] = Number(value[key]);
        }
        for (const key of BOOLEAN_FIELDS) {
            if (typeof value[key] === 'boolean') clean[key] = value[key];
        }
        if (value.judgmentOffsets && typeof value.judgmentOffsets === 'object') {
            const offsets = Object.fromEntries(['roar', 'tremor', 'wind']
                .filter(kind => Number.isFinite(Number(value.judgmentOffsets[kind])))
                .map(kind => [kind, Math.max(0, Math.min(clean.ticks - 1,
                    Math.round(Number(value.judgmentOffsets[kind]))))]));
            if (Object.keys(offsets).length) clean.judgmentOffsets = offsets;
        }
        if (Array.isArray(value.judgments)) {
            clean.judgments = value.judgments.slice(0, 32)
                .map((item, index) => normalizeJudgment(item, { beatId: id, index, beatTicks: clean.ticks }))
                .filter(item => {
                    if (!item.id || seenJudgmentIds.has(item.id)) return false;
                    seenJudgmentIds.add(item.id);
                    return true;
                });
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
                durationTicks: Math.max(0, Math.min(600,
                    Math.round(Number(item?.durationTicks) || 0))),
                angleMode: String(item?.angleMode || '').trim().slice(0, 120)
            })).filter(item => item.fx);
            if (!clean.fxAdditional.length) delete clean.fxAdditional;
        }
        return rotation.canonicalize(clean);
    }

    function normalizeBeats(beats = {}) {
        const seenJudgmentIds = new Set();
        return Object.fromEntries(Object.entries(beats || {})
            .map(([id, value]) => [String(id), normalizeBeat(value, { id: String(id), seenJudgmentIds })]));
    }

    function compactBeats(beats = {}) {
        return Object.fromEntries(Object.entries(normalizeBeats(beats)).map(([id, value]) => [id,
            Object.keys(value).length === 1 && Object.prototype.hasOwnProperty.call(value, 'ticks')
                ? value.ticks : value]));
    }

    function visualValue(value = {}) {
        const normalized = normalizeBeat(value, { id: String(value.beat || value.id || 'beat') });
        return Object.fromEntries(VISUAL_FIELDS
            .filter(key => Object.prototype.hasOwnProperty.call(normalized, key))
            .map(key => [key, normalized[key]]));
    }

    function canonicalJson(value) {
        const normalize = item => {
            if (Array.isArray(item)) return item.map(normalize);
            if (!item || typeof item !== 'object') return item;
            return Object.fromEntries(Object.keys(item).sort()
                .filter(key => !(key === 'directHitSupersedes' && item[key] === false))
                .map(key => [key, normalize(item[key])]));
        };
        return JSON.stringify(normalize(value));
    }

    function compareBeats(left, right) {
        const expected = normalizeBeats(left);
        const actual = normalizeBeats(right);
        const differences = [];
        const walk = (a, b, path = '') => {
            if (canonicalJson(a) === canonicalJson(b)) return;
            if (!a || !b || typeof a !== 'object' || typeof b !== 'object'
                || Array.isArray(a) !== Array.isArray(b)) {
                differences.push(path || '<root>');
                return;
            }
            const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
            for (const key of keys) walk(a[key], b[key], path ? `${path}.${key}` : key);
        };
        walk(expected, actual);
        return Object.freeze({ equal: differences.length === 0, expected, actual,
            differences: Object.freeze([...new Set(differences)].slice(0, 24)) });
    }

    return Object.freeze({ TEXT_FIELDS, NUMBER_FIELDS, BOOLEAN_FIELDS, STRUCTURED_FIELDS,
        EDITABLE_FIELDS, VISUAL_FIELDS, JUDGMENT_KINDS, JUDGMENT_TARGETS,
        ROTATION_RESET_MODES, ticks,
        normalizeJudgment, normalizeBeat, normalizeBeats, compactBeats, visualValue,
        canonicalJson, compareBeats });
}));
