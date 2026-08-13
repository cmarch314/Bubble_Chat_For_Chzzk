'use strict';

class HuntSupportItemPolicy {
    static MAX_EFFECTIVE_FLASHES = 4;

    static profiles() {
        if (typeof HuntPersonalityProfiles !== 'undefined') return HuntPersonalityProfiles;
        if (typeof require === 'function') return require('./HuntPersonalityProfiles.js');
        return null;
    }

    static initialFlashCount(personality) {
        return Number(this.profiles()?.get(personality)?.issued?.flashPods || 0);
    }

    static flashUseChance(personality) {
        return Number(this.profiles()?.get(personality)?.ai?.flash || 0);
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
