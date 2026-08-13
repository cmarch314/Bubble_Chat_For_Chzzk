'use strict';

class HuntDifficultyProfile {
    static DEFAULT = Object.freeze({
        id: 'standard',
        monsterDamageMultiplier: 1,
        rewardMultiplier: 1
    });

    static normalize(profile = null) {
        const source = profile && typeof profile === 'object' ? profile : {};
        const clamp = value => Math.max(0.25, Math.min(4, Number(value) || 1));
        return Object.freeze({
            id: String(source.id || this.DEFAULT.id).slice(0, 24),
            monsterDamageMultiplier: clamp(source.monsterDamageMultiplier),
            rewardMultiplier: clamp(source.rewardMultiplier)
        });
    }

    static scaleReward(value, profile = null) {
        const normalized = this.normalize(profile);
        return Math.max(0, Math.round(Math.max(0, Number(value) || 0) * normalized.rewardMultiplier));
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntDifficultyProfile;
else globalThis.HuntDifficultyProfile = HuntDifficultyProfile;
