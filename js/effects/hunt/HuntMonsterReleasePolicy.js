'use strict';

const HUNT_MONSTER_RELEASE_DATA = globalThis.HUNT_MONSTER_RELEASE_MANIFEST
    || (typeof module !== 'undefined' && module.exports
        ? require('./data/MonsterReleaseManifest.generated.js')
        : null);

class HuntMonsterReleasePolicy {
    static MANIFEST = HUNT_MONSTER_RELEASE_DATA;
    static REVIEWED = Object.freeze([...(HUNT_MONSTER_RELEASE_DATA?.records || [])]);

    static normalizeId(monsterOrId) {
        const value = typeof monsterOrId === 'object' ? monsterOrId?.id : monsterOrId;
        return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    }

    static reviewedIds() {
        return new Set(this.REVIEWED.map(entry => entry.id));
    }

    static reviewRecord(monsterOrId) {
        const id = this.normalizeId(monsterOrId);
        return this.REVIEWED.find(entry => entry.id === id) || null;
    }

    static isReviewed(monsterOrId) {
        return Boolean(this.reviewRecord(monsterOrId));
    }

    static isCombatEligible(monster) {
        return Boolean(monster)
            && monster.selectable !== false
            && monster.role !== 'journey-event'
            && this.isReviewed(monster);
    }

    static filter(monsters) {
        const seen = new Set();
        return (monsters || []).filter(monster => {
            const id = this.normalizeId(monster);
            if (!this.isCombatEligible(monster) || seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    }

    static journeyCoverage(monsters, getTier) {
        const required = ['small', 'medium', 'large', 'elder', 'colossal'];
        const present = new Set(this.filter(monsters).map(monster => getTier(monster)));
        return Object.freeze({
            ready: required.every(tier => present.has(tier)),
            missing: Object.freeze(required.filter(tier => !present.has(tier))),
            present: Object.freeze(required.filter(tier => present.has(tier)))
        });
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterReleasePolicy;
else globalThis.HuntMonsterReleasePolicy = HuntMonsterReleasePolicy;
