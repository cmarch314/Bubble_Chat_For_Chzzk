'use strict';

class HuntCombatJudgmentRuntime {
    static GAMEPLAY_KINDS = new Set(['damage', 'judgment', 'roar', 'tremor', 'wind']);

    constructor(options = {}) {
        this.onTrace = typeof options.onTrace === 'function' ? options.onTrace : null;
        this.sessions = new Map();
        this.queue = [];
        this.consumed = new Set();
        this.trace = [];
        this.nextGeneration = 0;
    }

    begin(actorKey, action, context = {}) {
        this.cancel(actorKey, 'replaced');
        const sessionId = `${String(action?.id || actorKey)}#${++this.nextGeneration}`;
        const judgments = (Array.isArray(context.judgmentEvents) ? context.judgmentEvents : [])
            .map((event, index) => Object.freeze({
                ...event,
                judgmentId: String(event.judgmentId || `${sessionId}:judgment:${index + 1}`),
                atTicks: Math.max(0, Number(event.atTicks || 0)),
                timelineIndex: index,
                timelineFinal: index === context.judgmentEvents.length - 1
            }));
        const session = {
            actorKey: String(actorKey),
            sessionId,
            action,
            pattern: context.pattern || null,
            attackerIndex: context.attackerIndex ?? null,
            primaryTargetIndex: context.targetIndex ?? null,
            judgments,
            emittedTicks: new Set(),
            status: 'running'
        };
        this.sessions.set(session.actorKey, session);
        this.#record('session-started', { sessionId, actorKey: session.actorKey, actionId: action?.id });
        return session;
    }

    observeBeatEvent(actorKey, event) {
        if (!HuntCombatJudgmentRuntime.GAMEPLAY_KINDS.has(String(event?.kind || ''))) return [];
        const session = this.sessions.get(String(actorKey));
        if (!session || session.status !== 'running') return [];
        const atTicks = Math.max(0, Number(event.atTicks || 0));
        if (session.emittedTicks.has(atTicks)) return [];
        session.emittedTicks.add(atTicks);
        const due = session.judgments.filter(judgment => judgment.atTicks === atTicks);
        if (!due.length) {
            this.#record('unmatched-beat-judgment', {
                sessionId: session.sessionId,
                beatEventId: event.id,
                atTicks
            });
            return [];
        }
        const commands = due.map(judgment => Object.freeze({
            ...judgment,
            sessionId: session.sessionId,
            actionId: session.action?.id || null,
            actorKey: session.actorKey,
            pattern: session.pattern,
            attackerIndex: session.attackerIndex,
            primaryTargetIndex: session.primaryTargetIndex,
            beatEventIds: session.action.events
                .filter(candidate => candidate.atTicks === atTicks
                    && HuntCombatJudgmentRuntime.GAMEPLAY_KINDS.has(candidate.kind))
                .map(candidate => candidate.id)
        }));
        this.queue.push(...commands);
        commands.forEach(command => this.#record('judgment-queued', command));
        return commands;
    }

    drain(resolve) {
        if (typeof resolve !== 'function') return [];
        const results = [];
        while (this.queue.length) {
            const command = this.queue.shift();
            if (!command || this.consumed.has(command.judgmentId)) continue;
            this.consumed.add(command.judgmentId);
            const result = resolve(command);
            this.#record('judgment-consumed', {
                sessionId: command.sessionId,
                judgmentId: command.judgmentId,
                atTicks: command.atTicks
            });
            results.push({ command, result });
        }
        return results;
    }

    complete(actorKey) {
        const session = this.sessions.get(String(actorKey));
        if (!session) return false;
        session.status = 'completed';
        this.sessions.delete(session.actorKey);
        this.#record('session-completed', { sessionId: session.sessionId, actorKey: session.actorKey });
        return true;
    }

    cancel(actorKey, reason = 'cancelled') {
        const session = this.sessions.get(String(actorKey));
        if (!session) return false;
        session.status = 'cancelled';
        this.sessions.delete(session.actorKey);
        this.queue = this.queue.filter(command => command.sessionId !== session.sessionId);
        this.#record('session-cancelled', {
            sessionId: session.sessionId,
            actorKey: session.actorKey,
            reason
        });
        return true;
    }

    get(actorKey) { return this.sessions.get(String(actorKey)) || null; }
    recentTrace() { return this.trace.map(entry => ({ ...entry })); }

    #record(type, payload = {}) {
        const entry = Object.freeze({ sequence: this.trace.length + 1, type, ...payload });
        this.trace.push(entry);
        if (this.trace.length > 256) this.trace.shift();
        this.onTrace?.(entry);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntCombatJudgmentRuntime;
else window.HuntCombatJudgmentRuntime = HuntCombatJudgmentRuntime;
