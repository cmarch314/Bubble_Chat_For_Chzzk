'use strict';

/**
 * Resolves distance-driven projectile arrival before an action session starts.
 * It never owns a clock: it returns another valid compiled BEAT graph whose
 * contact/finish events are consumed by HuntBeatActionRuntime as usual.
 */
class HuntProjectileTimingResolver {
    static DEFAULT_STAGE = Object.freeze({ width: 1920, height: 900 });
    static DEFAULT_ORIGIN = Object.freeze({ x: .5, y: .27 });
    static DEFAULT_TARGET_Y = .78;

    static resolveSession(compiledAction, context = {}) {
        if (!compiledAction?.events?.some(event => event.kind === 'projectile-launch'
            && event.flightMode === 'distance')) {
            return Object.freeze({ action: compiledAction, context });
        }
        const Contract = typeof HuntBeatV2Contract !== 'undefined'
            ? HuntBeatV2Contract
            : (typeof require === 'function' ? require('./HuntBeatV2Contract.js').HuntBeatV2Contract : null);
        if (!Contract) throw new Error('HuntBeatV2Contract is unavailable');

        const source = this.#sourceGraph(compiledAction);
        const originalById = new Map(compiledAction.events.map(event => [String(event.id), event]));
        const resolvedJudgments = new Map((context.judgmentEvents || [])
            .map(event => [String(event.id || event.eventId || ''), event]));
        const requestedTicks = new Map();

        for (const launch of compiledAction.events.filter(event => event.kind === 'projectile-launch'
            && event.flightMode === 'distance')) {
            const outcome = originalById.get(String(launch.outcomeEventId || ''));
            if (!outcome) continue;
            const resolved = resolvedJudgments.get(String(outcome.id)) || outcome;
            const targetIndex = this.#targetIndex(resolved, context);
            if (!Number.isFinite(targetIndex)) continue;
            const flightTicks = this.flightTicks(launch, targetIndex, context.projectileStage);
            const contactAt = Number(launch.atTicks) + flightTicks;
            requestedTicks.set(String(outcome.id), contactAt);
            const finish = compiledAction.events.find(event => event.kind === 'projectile-finish'
                && String(event.projectileId || '') === String(launch.projectileId || ''));
            if (finish) {
                const finishGap = Math.max(1, Number(finish.atTicks) - Number(outcome.atTicks));
                requestedTicks.set(String(finish.id), contactAt + finishGap);
            }
        }
        if (!requestedTicks.size) return Object.freeze({ action: compiledAction, context });

        this.#moveEvents(source, requestedTicks);
        const action = Contract.compile(source);
        const eventById = new Map(action.events.map(event => [String(event.id), event]));
        const judgmentEvents = Array.isArray(context.judgmentEvents)
            ? context.judgmentEvents.map(event => {
                const resolved = eventById.get(String(event.id || event.eventId || ''));
                return resolved ? { ...event, beatId: resolved.beatId,
                    offsetTicks: resolved.offsetTicks, atTicks: resolved.atTicks } : event;
            }) : context.judgmentEvents;
        return Object.freeze({ action, context: { ...context, judgmentEvents } });
    }

    static flightTicks(launch = {}, targetIndex = 0, stage = {}) {
        const width = Math.max(1, Number(stage?.width) || this.DEFAULT_STAGE.width);
        const height = Math.max(1, Number(stage?.height) || this.DEFAULT_STAGE.height);
        const origin = stage?.origin || this.DEFAULT_ORIGIN;
        const originX = Number(origin.x ?? this.DEFAULT_ORIGIN.x) * width;
        const originY = Number(origin.y ?? this.DEFAULT_ORIGIN.y) * height;
        // Hunter lanes remain evenly spaced even for virtual -1 / 4 targets,
        // allowing edge fireballs to visibly miss beyond H1/H4.
        const targetX = (Number(targetIndex) + .5) / 4 * width;
        const targetY = Number(stage?.targetY ?? this.DEFAULT_TARGET_Y) * height;
        const distance = Math.hypot(targetX - originX, targetY - originY);
        const speed = Math.max(1, Number(launch.speedPxPerTick) || 120);
        return Math.max(1, Math.ceil(distance / speed));
    }

    static #targetIndex(event = {}, context = {}) {
        const indices = Array.isArray(event.targetIndices) ? event.targetIndices
            : Number.isFinite(Number(event.targetIndices)) ? [Number(event.targetIndices)] : [];
        const explicit = indices.find(index => Number.isFinite(Number(index)));
        if (explicit != null) return Number(explicit);
        return Number.isFinite(Number(context.targetIndex)) ? Number(context.targetIndex) : NaN;
    }

    static #sourceGraph(action) {
        const source = { ...action,
            beats: action.beats.map(beat => ({
                id: beat.id,
                ticks: beat.ticks,
                ...(beat.label ? { label: beat.label } : {}),
                tracks: JSON.parse(JSON.stringify(beat.tracks || {})),
                events: (beat.events || []).map(event => {
                    const { atTicks, ...authored } = event;
                    return { ...authored };
                })
            }))
        };
        delete source.totalTicks;
        delete source.events;
        delete source.eventIds;
        return source;
    }

    static #moveEvents(source, requestedTicks) {
        let elapsed = 0;
        let maximumTick = 0;
        const records = source.beats.map(beat => {
            const record = { beat, start: elapsed, end: elapsed + beat.ticks };
            elapsed = record.end;
            return record;
        });
        for (const tick of requestedTicks.values()) maximumTick = Math.max(maximumTick, tick);
        if (maximumTick >= elapsed) {
            const last = records.at(-1);
            last.beat.ticks += maximumTick - elapsed + 1;
            last.end = maximumTick + 1;
        }
        const events = source.beats.flatMap(beat => beat.events || []);
        source.beats.forEach(beat => { beat.events = []; });
        for (const event of events) {
            const originalRecord = records.find(record => record.beat.id === event.beatId)
                || records.find(record => event.offsetTicks < record.beat.ticks)
                || records[0];
            const originalAt = originalRecord.start + Number(event.offsetTicks || 0);
            const at = requestedTicks.get(String(event.id)) ?? originalAt;
            const destination = records.find(record => at >= record.start && at < record.end) || records.at(-1);
            const { beatId, atTicks, ...authored } = event;
            destination.beat.events.push({ ...authored, offsetTicks: at - destination.start });
        }
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntProjectileTimingResolver;
else window.HuntProjectileTimingResolver = HuntProjectileTimingResolver;
