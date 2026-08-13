'use strict';

class HuntTeamIntentCoordinator {
    constructor() { this.claims = new Map(); }

    active(kind, now = 0) {
        const claim = this.claims.get(kind);
        if (!claim) return null;
        if (Number(claim.until || 0) <= Number(now || 0)) {
            this.claims.delete(kind);
            return null;
        }
        return claim;
    }

    claim(kind, hunter, now = 0, holdTicks = 1) {
        const active = this.active(kind, now);
        if (active && active.hunterIndex !== hunter?.index) return false;
        this.claims.set(kind, {
            hunterIndex: hunter?.index,
            until: Number(now || 0) + Math.max(1, Number(holdTicks || 1))
        });
        return true;
    }

    clear(kind) { this.claims.delete(kind); }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntTeamIntentCoordinator;
else globalThis.HuntTeamIntentCoordinator = HuntTeamIntentCoordinator;
