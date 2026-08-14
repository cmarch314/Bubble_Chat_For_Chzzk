'use strict';

class HuntBeatV2ContractError extends Error {
    constructor(message, path = '') {
        super(path ? `${path}: ${message}` : message);
        this.name = 'HuntBeatV2ContractError';
        this.path = path;
    }
}

class HuntBeatV2Contract {
    static VERSION = 2;
    static BACKEND = 'beat-v2';
    static ACTORS = new Set(['monster', 'hunter', 'reaction', 'environment']);
    static REVIEW_STATUSES = new Set(['draft', 'migrated', 'approved']);
    static FORBIDDEN_APPROVED_FIELDS = Object.freeze([
        'impactTimeline', 'profileMotion', 'runtimeTimingBeats', 'runtimeSourceTimingBeats',
        'animationClass', 'cssAnimation', 'hitOffsetTicks',
        // Projectile timing must be authored as BEAT events.  These fields
        // created a second renderer-owned clock and made Preview diverge from
        // the live hunt.
        'projectileLaunchDelayTicks', 'runtimeImpactPending', 'runtimeImpactDelayTicks'
    ]);

    // Projectile lifecycle links are authored as a pair: launch points at its
    // outcome event, and the outcome carries the same projectile id.  Motion
    // editors deliberately expose only the judgment fields, so older saves
    // could retain the launch reference while dropping the redundant outcome
    // field.  Normalize that deterministic relationship at the graph boundary
    // instead of making each editor/runtime repair it independently.
    //
    // This returns a copy and never overwrites an explicitly conflicting id;
    // conflicts remain validation errors rather than silently changing combat
    // meaning.
    static hydrateProjectileLifecycle(source = {}) {
        if (!source || typeof source !== 'object' || !Array.isArray(source.beats)) return source;
        const beats = source.beats.map(rawBeat => ({
            ...rawBeat,
            events: Array.isArray(rawBeat?.events)
                ? rawBeat.events.map(event => ({ ...event }))
                : rawBeat?.events
        }));
        const eventsById = new Map();
        beats.forEach(beat => (beat.events || []).forEach(event => {
            const id = String(event?.id || '').trim();
            if (id) eventsById.set(id, event);
        }));
        beats.forEach(beat => (beat.events || []).forEach(event => {
            if (String(event?.kind || '') !== 'projectile-launch') return;
            const projectileId = String(event.projectileId || '').trim();
            const outcomeEventId = String(event.outcomeEventId || '').trim();
            const outcome = eventsById.get(outcomeEventId);
            if (!projectileId || !outcome || String(outcome.kind || '') !== 'damage') return;
            if (outcome.projectileId == null || String(outcome.projectileId).trim() === '') {
                outcome.projectileId = projectileId;
            }
        }));
        return { ...source, beats };
    }

    static compile(source = {}) {
        source = this.hydrateProjectileLifecycle(source);
        const id = String(source.id || '').trim();
        if (!id) throw new HuntBeatV2ContractError('action id is required', 'id');
        const actor = String(source.actor || '').trim();
        if (!this.ACTORS.has(actor)) {
            throw new HuntBeatV2ContractError(`unsupported actor: ${actor || '-'}`, 'actor');
        }
        if (source.backend !== this.BACKEND) {
            throw new HuntBeatV2ContractError(`backend must be ${this.BACKEND}`, 'backend');
        }
        if (source.schemaVersion !== this.VERSION) {
            throw new HuntBeatV2ContractError(`schemaVersion must be ${this.VERSION}`, 'schemaVersion');
        }
        const reviewStatus = String(source.reviewStatus || 'migrated').trim().toLowerCase();
        if (!this.REVIEW_STATUSES.has(reviewStatus)) {
            throw new HuntBeatV2ContractError(`unsupported reviewStatus: ${reviewStatus || '-'}`, 'reviewStatus');
        }
        if (reviewStatus === 'approved') {
            const forbidden = this.FORBIDDEN_APPROVED_FIELDS.filter(field => source[field] != null);
            if (forbidden.length) {
                throw new HuntBeatV2ContractError(
                    `approved action contains duplicate legacy timing owners: ${forbidden.join(', ')}`,
                    id
                );
            }
        }
        if (!Array.isArray(source.beats) || !source.beats.length) {
            throw new HuntBeatV2ContractError('at least one beat is required', `${id}.beats`);
        }

        const beatIds = new Set();
        const eventIds = new Set();
        const timeline = [];
        const events = [];
        let elapsed = 0;
        source.beats.forEach((rawBeat, index) => {
            const path = `${id}.beats[${index}]`;
            const beatId = String(rawBeat?.id || rawBeat?.beat || '').trim();
            if (!beatId) throw new HuntBeatV2ContractError('beat id is required', path);
            if (beatIds.has(beatId)) throw new HuntBeatV2ContractError(`duplicate beat id: ${beatId}`, path);
            beatIds.add(beatId);
            const ticks = Number(rawBeat?.ticks);
            if (!Number.isInteger(ticks) || ticks < 1) {
                throw new HuntBeatV2ContractError('ticks must be a positive integer', `${path}.ticks`);
            }
            const startTicks = elapsed;
            const endTicks = startTicks + ticks;
            const beatEvents = (Array.isArray(rawBeat.events) ? rawBeat.events : []).map((rawEvent, eventIndex) => {
                const eventPath = `${path}.events[${eventIndex}]`;
                const kind = String(rawEvent?.kind || '').trim();
                if (!kind) throw new HuntBeatV2ContractError('event kind is required', eventPath);
                const offsetTicks = Number(rawEvent.offsetTicks || 0);
                if (!Number.isInteger(offsetTicks) || offsetTicks < 0 || offsetTicks >= ticks) {
                    throw new HuntBeatV2ContractError(
                        `offsetTicks must be between 0 and ${ticks - 1}`,
                        `${eventPath}.offsetTicks`
                    );
                }
                const eventId = String(rawEvent.id || `${beatId}:${kind}:${eventIndex + 1}`);
                if (eventIds.has(eventId)) {
                    throw new HuntBeatV2ContractError(`duplicate event id: ${eventId}`, eventPath);
                }
                eventIds.add(eventId);
                const event = Object.freeze({
                    ...rawEvent,
                    id: eventId,
                    kind,
                    beatId,
                    offsetTicks,
                    atTicks: startTicks + offsetTicks
                });
                events.push(event);
                return event;
            });
            const tracks = this.#normalizeTracks(rawBeat.tracks, ticks, path);
            timeline.push(Object.freeze({
                ...rawBeat,
                id: beatId,
                beat: beatId,
                ticks,
                startTicks,
                endTicks,
                events: Object.freeze(beatEvents),
                tracks
            }));
            elapsed = endTicks;
        });

        events.sort((left, right) => left.atTicks - right.atTicks || left.id.localeCompare(right.id));
        this.#validateProjectileEvents(events, id);
        const atb = Object.freeze({
            cost: Math.max(0, Number(source.atb?.cost || 0)),
            recovery: String(source.atb?.recovery || 'during-action'),
            gateUntil: String(source.atb?.gateUntil || 'complete')
        });
        return this.#deepFreeze({
            ...source,
            schemaVersion: this.VERSION,
            backend: this.BACKEND,
            id,
            actor,
            reviewStatus,
            totalTicks: elapsed,
            atb,
            beats: timeline,
            events,
            eventIds: events.map(event => event.id)
        });
    }

    static #validateProjectileEvents(events, actionId) {
        const launches = events.filter(event => event.kind === 'projectile-launch');
        const finishes = events.filter(event => event.kind === 'projectile-finish');
        const byId = new Map(events.map(event => [event.id, event]));
        const projectileIds = new Set();
        const finishByProjectileId = new Map();
        finishes.forEach(event => {
            const projectileId = String(event.projectileId || '').trim();
            if (!projectileId) {
                throw new HuntBeatV2ContractError('projectile-finish requires projectileId', `${actionId}.${event.id}`);
            }
            if (finishByProjectileId.has(projectileId)) {
                throw new HuntBeatV2ContractError(`duplicate projectile finish: ${projectileId}`, `${actionId}.${event.id}`);
            }
            finishByProjectileId.set(projectileId, event);
        });
        launches.forEach(event => {
            const path = `${actionId}.${event.id}`;
            const projectileId = String(event.projectileId || '').trim();
            const outcomeEventId = String(event.outcomeEventId || '').trim();
            if (!projectileId) throw new HuntBeatV2ContractError('projectile-launch requires projectileId', path);
            if (projectileIds.has(projectileId)) {
                throw new HuntBeatV2ContractError(`duplicate projectileId: ${projectileId}`, path);
            }
            projectileIds.add(projectileId);
            if (!outcomeEventId || !byId.has(outcomeEventId)) {
                throw new HuntBeatV2ContractError('projectile-launch requires an existing outcomeEventId', path);
            }
            const outcome = byId.get(outcomeEventId);
            if (outcome.kind !== 'damage') {
                throw new HuntBeatV2ContractError('projectile outcomeEventId must reference damage', path);
            }
            if (String(outcome.projectileId || '') !== projectileId) {
                throw new HuntBeatV2ContractError('projectile outcome must share projectileId', path);
            }
            if (outcome.atTicks <= event.atTicks) {
                throw new HuntBeatV2ContractError('projectile outcome must occur after launch', path);
            }
            if (String(outcome.target || '') !== String(event.target || '')) {
                throw new HuntBeatV2ContractError('projectile launch/outcome target mismatch', path);
            }
            const finish = finishByProjectileId.get(projectileId);
            if (!finish) {
                throw new HuntBeatV2ContractError('projectile-launch requires one projectile-finish event', path);
            }
            if (finish.atTicks <= outcome.atTicks) {
                throw new HuntBeatV2ContractError('projectile finish must occur after outcome', path);
            }
        });
        events.filter(event => event.kind === 'damage' && event.projectileId).forEach(event => {
            if (!projectileIds.has(String(event.projectileId))) {
                throw new HuntBeatV2ContractError(
                    `projectile damage has no launch: ${event.projectileId}`,
                    `${actionId}.${event.id}`
                );
            }
        });
        finishes.forEach(event => {
            if (!projectileIds.has(String(event.projectileId))) {
                throw new HuntBeatV2ContractError(
                    `projectile finish has no launch: ${event.projectileId}`,
                    `${actionId}.${event.id}`
                );
            }
        });
    }

    static #normalizeTracks(rawTracks, beatTicks, path) {
        if (rawTracks == null) return Object.freeze({});
        if (!rawTracks || typeof rawTracks !== 'object' || Array.isArray(rawTracks)) {
            throw new HuntBeatV2ContractError('tracks must be a keyed frame object', `${path}.tracks`);
        }
        const tracks = {};
        for (const [name, rawFrames] of Object.entries(rawTracks)) {
            if (!Array.isArray(rawFrames)) {
                throw new HuntBeatV2ContractError('track must be a frame array', `${path}.tracks.${name}`);
            }
            let previous = -1;
            tracks[name] = Object.freeze(rawFrames.map((frame, index) => {
                const offsetTicks = Number(frame?.offsetTicks || 0);
                if (!Number.isInteger(offsetTicks) || offsetTicks < 0 || offsetTicks > beatTicks) {
                    throw new HuntBeatV2ContractError(
                        `offsetTicks must be between 0 and ${beatTicks}`,
                        `${path}.tracks.${name}[${index}]`
                    );
                }
                if (offsetTicks < previous) {
                    throw new HuntBeatV2ContractError(
                        'frames must be ordered by offsetTicks',
                        `${path}.tracks.${name}[${index}]`
                    );
                }
                previous = offsetTicks;
                return Object.freeze({ ...frame, offsetTicks });
            }));
        }
        return Object.freeze(tracks);
    }

    static #deepFreeze(value) {
        if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
        Object.values(value).forEach(item => this.#deepFreeze(item));
        return Object.freeze(value);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HuntBeatV2Contract, HuntBeatV2ContractError };
} else {
    window.HuntBeatV2Contract = HuntBeatV2Contract;
    window.HuntBeatV2ContractError = HuntBeatV2ContractError;
}
