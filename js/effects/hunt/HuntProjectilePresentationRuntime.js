'use strict';

/**
 * BEAT event consumer for detached projectile presentation.
 *
 * It deliberately owns identity and lifecycle only.  HuntBeatActionRuntime is
 * the sole clock: no timeout, CSS delay, or inferred launch time is allowed
 * here.  Live hunts and the motion-only editor feed this exact same event
 * stream into their renderer ports.
 */
class HuntProjectilePresentationRuntime {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        this.sessions = new Map();
    }

    static sessionKey(state = {}) {
        return String(state?.context?.actionSessionId || `${state?.actorKey || 'monster'}#${state?.generation || 0}`);
    }

    begin(state) {
        const key = HuntProjectilePresentationRuntime.sessionKey(state);
        this.cancel(key, 'replaced');
        const session = {
            key,
            state,
            projectiles: new Map(),
            outcomeToProjectile: new Map(),
            status: 'running'
        };
        this.sessions.set(key, session);
        return session;
    }

    observeEvent(state, event) {
        const kind = String(event?.kind || '');
        if (!['projectile-launch', 'projectile-finish'].includes(kind)) return false;
        const key = HuntProjectilePresentationRuntime.sessionKey(state);
        const session = this.sessions.get(key) || this.begin(state);
        const projectileId = String(event?.projectileId || '').trim();
        if (!projectileId) return false;
        if (kind === 'projectile-launch') {
            if (session.projectiles.has(projectileId)) {
                this.callbacks.onAnomaly?.('duplicate-projectile-launch', { state, event, session });
                return false;
            }
            const projectile = {
                id: projectileId,
                sessionKey: key,
                launchEvent: event,
                outcomeEventId: String(event.outcomeEventId || ''),
                finishEvent: null,
                outcome: null,
                status: 'flying'
            };
            session.projectiles.set(projectileId, projectile);
            session.outcomeToProjectile.set(projectile.outcomeEventId, projectileId);
            this.callbacks.onLaunch?.(projectile, state, event);
            return true;
        }
        const projectile = session.projectiles.get(projectileId);
        if (!projectile) {
            this.callbacks.onAnomaly?.('projectile-finish-without-launch', { state, event, session });
            return false;
        }
        projectile.finishEvent = event;
        projectile.status = 'finished';
        this.callbacks.onFinish?.(projectile, state, event);
        session.projectiles.delete(projectileId);
        session.outcomeToProjectile.delete(projectile.outcomeEventId);
        return true;
    }

    resolveOutcome(judgment = {}, results = []) {
        const key = String(judgment?.sessionId || '');
        const session = this.sessions.get(key);
        const projectileId = String(judgment?.projectileId || session?.outcomeToProjectile.get(String(judgment?.id || '')) || '');
        const projectile = session?.projectiles.get(projectileId);
        if (!projectile) return false;
        if (projectile.outcome) {
            this.callbacks.onAnomaly?.('duplicate-projectile-outcome', { judgment, results, projectile, session });
            return false;
        }
        projectile.outcome = { judgment, results };
        projectile.status = results.some(result => result?.result === 'hit') ? 'hit' : 'miss';
        this.callbacks.onOutcome?.(projectile, judgment, results);
        return true;
    }

    complete(state) { return this.cancel(HuntProjectilePresentationRuntime.sessionKey(state), 'complete'); }

    cancel(stateOrKey, reason = 'cancelled') {
        const key = typeof stateOrKey === 'string'
            ? stateOrKey : HuntProjectilePresentationRuntime.sessionKey(stateOrKey);
        const session = this.sessions.get(key);
        if (!session) return false;
        this.sessions.delete(key);
        session.status = reason;
        this.callbacks.onCancel?.(session, reason);
        return true;
    }

    clear(reason = 'runtime-clear') {
        [...this.sessions.values()].forEach(session => this.cancel(session.key, reason));
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntProjectilePresentationRuntime;
else window.HuntProjectilePresentationRuntime = HuntProjectilePresentationRuntime;
