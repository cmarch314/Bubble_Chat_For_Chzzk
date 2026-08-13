'use strict';

class HuntTrapConfig {
    // Inventory keeps the legacy key until the item overhaul. Runtime meaning
    // is centralized so shock traps can be introduced later without AI churn.
    static DEFAULT_KIND = 'pitfall';
    static INVENTORY_KEY = 'shockTraps';
    static ENTRY_TICKS = 6;
    static ESCAPE_TICKS = 8;
    static STRUGGLE_TICKS = 12;
    static STRUGGLE_COUNTS = Object.freeze([6, 3, 1, 0]);

    static normalizeKind(kind = '') {
        const requested = String(kind || '').toLowerCase();
        if (requested === 'pitfall') return 'pitfall';
        if (requested === 'shocktrap') return 'shocktrap';
        if (!requested || requested === 'trap') return this.DEFAULT_KIND;
        return this.DEFAULT_KIND;
    }

    static reactionPatternId(kind = '') {
        return this.normalizeKind(kind) === 'pitfall' ? '__reaction.pitfall' : '__reaction.shocktrap';
    }

    static struggleCount(useCount = 1) {
        const index = Math.max(0, Math.min(
            this.STRUGGLE_COUNTS.length - 1,
            Math.floor(Number(useCount || 1)) - 1
        ));
        return this.STRUGGLE_COUNTS[index];
    }

    static minimumDurationTicks(useCount = 4) {
        return this.ENTRY_TICKS
            + this.struggleCount(useCount) * this.STRUGGLE_TICKS
            + this.ESCAPE_TICKS;
    }

    static struggleSchedule(durationTicks, useCount = 1) {
        const count = this.struggleCount(useCount);
        if (count <= 0) return [];
        const duration = Math.max(this.minimumDurationTicks(useCount), Number(durationTicks || 0));
        const freeTicks = Math.max(0, duration - this.minimumDurationTicks(useCount));
        const gap = freeTicks / (count + 1);
        return Array.from({ length: count }, (_, index) => Math.round(
            this.ENTRY_TICKS + gap * (index + 1) + this.STRUGGLE_TICKS * index
        ));
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntTrapConfig;
else globalThis.HuntTrapConfig = HuntTrapConfig;
