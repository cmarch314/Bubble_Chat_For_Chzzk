'use strict';

(function exposeHuntRotationContract(root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.HuntRotationContract = api;
}(typeof globalThis === 'object' ? globalThis : this, () => {
    const RESET_MODES = Object.freeze(['auto', 'preserve', 'snap-end', 'animate']);
    const DIRECTIONS = Object.freeze(['clockwise', 'counterclockwise']);

    function resetMode(beat = {}) {
        return RESET_MODES.includes(beat.rotationResetMode) ? beat.rotationResetMode : 'auto';
    }

    function equivalent(angle, previous = 0) {
        const target = Number(angle) || 0;
        const current = Number(previous) || 0;
        if (target === 0 && current !== 0) return 360 * Math.round(current / 360);
        return target;
    }

    function resolve(beat = {}, previous = 0) {
        const start = Number(previous) || 0;
        const mode = resetMode(beat);
        const direction = DIRECTIONS.includes(String(beat.rotationDirection || ''))
            ? String(beat.rotationDirection) : null;
        const authoredDegrees = Number(beat.rotationDegrees);
        const directed = Boolean(direction && beat.rotationDegrees !== undefined
            && beat.rotationDegrees !== null && Number.isFinite(authoredDegrees));
        // Returning home is translation-only by default. The motion owner
        // removes the accumulated transform after completion; recovery itself
        // must never manufacture a reverse/finishing turn.
        const preserve = mode === 'preserve' || (mode === 'auto' && beat.to === 'home');
        let final = start;
        if (!preserve && directed) {
            final = start + (direction === 'counterclockwise' ? -1 : 1)
                * Math.abs(authoredDegrees);
        } else if (!preserve && beat.rotation !== undefined && beat.rotation !== null) {
            final = mode === 'auto' ? equivalent(beat.rotation, start) : Number(beat.rotation) || 0;
        } else if (!preserve && beat.rotateBy !== undefined && beat.rotateBy !== null) {
            final = start + (Number(beat.rotateBy) || 0);
        }
        const delta = final - start;
        return Object.freeze({
            previous: start,
            final,
            delta,
            direction: directed ? direction : delta < 0 ? 'counterclockwise' : 'clockwise',
            degrees: Math.abs(directed ? authoredDegrees : delta),
            directed,
            preserve,
            resetMode: mode
        });
    }

    return Object.freeze({ RESET_MODES, DIRECTIONS, resetMode, equivalent, resolve });
}));
