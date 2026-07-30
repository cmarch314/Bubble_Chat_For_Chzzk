'use strict';

class HuntSupportItemPolicy {
    static FLASH_LIMITS = Object.freeze({
        offensive: 0,
        normal: 1,
        veteran: 1,
        defensive: 1,
        support: 2,
        newbie: 1
    });

    static FLASH_USE_CHANCES = Object.freeze({
        offensive: 0,
        normal: .50,
        veteran: 1,
        defensive: .75,
        support: .90,
        newbie: .15
    });

    static MAX_EFFECTIVE_FLASHES = 4;

    static initialFlashCount(personality) {
        return Number(this.FLASH_LIMITS[personality] || 0);
    }

    static flashUseChance(personality) {
        return Number(this.FLASH_USE_CHANCES[personality] || 0);
    }

    static hasOtherFlashCarrier(engine, hunter) {
        return (engine?.selectedWeapons || []).some(candidate =>
            candidate !== hunter
            && candidate?.status === 'alive'
            && Number(candidate.flashPods || 0) > 0
        );
    }

    static isFlashEffective(engine) {
        const maxEffectiveFlashes = Number(
            engine?.monsterBehavior?.maxEffectiveFlashes ?? this.MAX_EFFECTIVE_FLASHES
        );
        return Number(engine?.monsterFlashUseCount || 0) < maxEffectiveFlashes;
    }

    static canUseFlash(engine, hunter, random = Math.random) {
        if (!engine || !hunter || engine.monsterFlightState !== 'airborne') return false;
        if (hunter.status !== 'alive' || Number(hunter.flashPods || 0) <= 0) return false;
        if (!this.isFlashEffective(engine)) return false;
        if (hunter.personality === 'veteran' && this.hasOtherFlashCarrier(engine, hunter)) return false;
        return random() < this.flashUseChance(hunter.personality);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntSupportItemPolicy;
else globalThis.HuntSupportItemPolicy = HuntSupportItemPolicy;
