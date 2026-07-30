class HuntActionStateMachine {
    static normalizeTiming(action = {}) {
        const total = Math.max(3, Number(action.durationTicks || action.attackTicks || 10));
        const windup = Math.max(1, Number(action.windupTicks || Math.round(total * 0.3)));
        const active = Math.max(1, Number(action.activeTicks || Math.round(total * 0.2)));
        const recovery = Math.max(1, Number(action.recoveryTicks || total - windup - active));
        return { windup, active, recovery, total: windup + active + recovery };
    }

    begin(hunter, action = {}) {
        const timing = HuntActionStateMachine.normalizeTiming(action);
        hunter.currentAction = {
            id: action.id || action.name || 'attack',
            name: action.name || action.id || '공격',
            phase: 'windup',
            elapsed: 0,
            remaining: timing.total,
            timing,
            tags: Array.isArray(action.tags) ? [...action.tags] : [],
            evadeCancelFrom: Number.isFinite(action.evadeCancelFrom) ? action.evadeCancelFrom : null,
            guardCancelFrom: Number.isFinite(action.guardCancelFrom) ? action.guardCancelFrom : null
        };
        hunter.actionState = 'windup';
        hunter.attackDuration = timing.total;
        return hunter.currentAction;
    }

    tick(hunter) {
        const action = hunter && hunter.currentAction;
        if (!action) {
            if (!hunter) return 'idle';
            if (hunter.rollDuration > 0) hunter.actionState = 'evade';
            else if (hunter.guardDuration > 0) hunter.actionState = 'guard';
            else if (hunter.hitDuration > 0) hunter.actionState = 'hitstun';
            else if (hunter.roarStunned) hunter.actionState = 'roar_stun';
            else hunter.actionState = 'idle';
            return hunter.actionState;
        }

        action.elapsed++;
        action.remaining = Math.max(0, action.remaining - 1);
        const { windup, active } = action.timing;
        if (action.elapsed < windup) action.phase = 'windup';
        else if (action.elapsed < windup + active) action.phase = 'active';
        else if (action.remaining > 0) action.phase = 'recovery';
        else {
            hunter.currentAction = null;
            hunter.actionState = 'idle';
            hunter.attackDuration = 0;
            return 'idle';
        }
        hunter.actionState = action.phase;
        hunter.attackDuration = action.remaining;
        return action.phase;
    }

    cancel(hunter, nextState = 'idle') {
        if (!hunter) return;
        hunter.currentAction = null;
        hunter.attackDuration = 0;
        hunter.actionState = nextState;
    }

    canEvade(hunter) {
        if (!hunter || hunter.status !== 'alive' || hunter.roarStunned || hunter.interference) return false;
        if (hunter.pendingSharpnessRestore) return false;
        const action = hunter.currentAction;
        if (!action) return true;
        if (action.tags.includes('counter') || action.tags.includes('guard-point')) return false;
        return action.evadeCancelFrom !== null && action.elapsed >= action.evadeCancelFrom;
    }

    canGuard(hunter) {
        if (!hunter || hunter.status !== 'alive' || (hunter.roarStunned && !hunter.interference)) return false;
        if (hunter.pendingSharpnessRestore) return false;
        const action = hunter.currentAction;
        if (!action) return true;
        if (action.tags.includes('guard-point')) return true;
        return action.guardCancelFrom !== null && action.elapsed >= action.guardCancelFrom;
    }

    canCounter(hunter, counterTag) {
        const action = hunter && hunter.currentAction;
        return Boolean(action && action.tags.includes(counterTag));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntActionStateMachine;
} else {
    window.HuntActionStateMachine = HuntActionStateMachine;
}
