class HuntTierRules {
    static resolve(tier, stage = 'initial') {
        const initial = {
            normal: { hp: 15600, stunThreshold: 390, damageMod: 0.9, atbSpeedMod: 1.15, label: '대형 몬스터' },
            small: { hp: 6500, stunThreshold: 140, damageMod: 0.3, atbSpeedMod: 0.7, label: '소형 몬스터' },
            medium: { hp: 10500, stunThreshold: 260, damageMod: 0.65, atbSpeedMod: 0.95, label: '중형 몬스터' },
            elder: { hp: 31200, stunThreshold: 650, damageMod: 1.15, atbSpeedMod: 1.2, label: '고룡종' },
            colossal: { hp: 46800, stunThreshold: 975, damageMod: 2.0, atbSpeedMod: 0.7, label: '초대형 몬스터' }
        };
        const consecutive = {
            normal: { hp: 15600, stunThreshold: 390, damageMod: 1.0, atbSpeedMod: 1.0, label: '특수 몬스터' },
            small: { hp: 6500, stunThreshold: 140, damageMod: 0.4, atbSpeedMod: 0.8, label: '소형 몬스터' },
            medium: { hp: 10500, stunThreshold: 260, damageMod: 0.7, atbSpeedMod: 1.0, label: '중형 몬스터' },
            elder: { hp: 31200, stunThreshold: 650, damageMod: 1.4, atbSpeedMod: 1.2, label: '고룡종' },
            colossal: { hp: 46800, stunThreshold: 975, damageMod: 2.0, atbSpeedMod: 0.7, label: '초대형 몬스터' }
        };
        const profile = stage === 'consecutive' ? consecutive : initial;
        return Object.freeze({ ...(profile[tier] || profile.normal) });
    }
}
