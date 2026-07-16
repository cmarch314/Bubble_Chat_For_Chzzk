function huntPattern(id, name, type, damageRatio, options = {}) {
    return { id, name, type, damageRatio, windupTicks: options.windup || 5, activeTicks: options.active || 2,
        recoveryTicks: options.recovery || 8, minTargets: options.minTargets || 1, maxTargets: options.maxTargets || 1,
        cooldownTicks: options.cooldown || 30, weight: options.weight || 1, tags: options.tags || [type],
        requiredState: options.state, maxHpRatio: options.maxHpRatio, sourceGame: options.sourceGame,
        confidence: 'curated-behavior' };
}

function huntProfile(sourceGame, definitions) {
    return definitions.map(([id, name, type, ratio, options = {}]) => huntPattern(id, name, type, ratio, { sourceGame, ...options }));
}

const HUNT_MONSTER_PATTERN_OVERRIDES = {
    rathalos: huntProfile('wilds', [
        ['rathalos.roar', '화룡의 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['rathalos.fireball', '화염구 브레스', 'projectile', 0.27, { maxTargets: 2, tags: ['projectile', 'elemental'] }],
        ['rathalos.claw_dive', '독조강습 타격', 'charge', 0.36, { windup: 7, recovery: 11, tags: ['charge', 'poison'] }],
        ['rathalos.tail_sweep', '꼬리 휩쓸기', 'area', 0.31, { minTargets: 2, maxTargets: 4, tags: ['area'] }],
        ['rathalos.aerial_barrage', '공중 화염구 연사', 'ultimate', 0.50, { minTargets: 2, maxTargets: 4, state: 'enraged', tags: ['ultimate', 'projectile', 'elemental'] }]
    ]),
    diablos: huntProfile('world_iceborne', [
        ['diablos.roar', '각룡의 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['diablos.horn_charge', '각공격 들이받기', 'charge', 0.38, { windup: 7, recovery: 12, tags: ['charge'] }],
        ['diablos.burrow', '지중 급습 쳐올리기', 'charge', 0.44, { windup: 11, recovery: 14, cooldown: 55, tags: ['charge', 'burrow'] }],
        ['diablos.tail', '꼬리 회전치기', 'area', 0.30, { minTargets: 2, maxTargets: 3, tags: ['area'] }],
        ['diablos.rage_chain', '폭주 연쇄 돌진', 'ultimate', 0.52, { minTargets: 2, maxTargets: 4, state: 'enraged', tags: ['ultimate', 'charge'] }]
    ]),
    zinogre: huntProfile('world_iceborne', [
        ['zinogre.roar', '뇌랑룡의 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['zinogre.paw_slam', '연속 전뇌 펀치', 'physical', 0.31, { maxTargets: 2, tags: ['multi-hit'] }],
        ['zinogre.back_slam', '등 찍기 폭발', 'area', 0.37, { minTargets: 2, maxTargets: 4, tags: ['area', 'elemental'] }],
        ['zinogre.lightning', '초전도 번개벼락', 'projectile', 0.34, { maxTargets: 3, tags: ['projectile', 'elemental'] }],
        ['zinogre.charged_combo', '초대전 연속공격', 'ultimate', 0.53, { minTargets: 2, maxTargets: 4, state: 'enraged', tags: ['ultimate', 'multi-hit', 'elemental'] }]
    ]),
    tigrex: huntProfile('world_iceborne', [
        ['tigrex.roar', '굉룡의 음파 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['tigrex.charge', '광란의 지그재그 돌진', 'charge', 0.39, { maxTargets: 3, tags: ['charge'] }],
        ['tigrex.rock', '암석 파편 쳐올리기', 'projectile', 0.29, { maxTargets: 2, tags: ['projectile'] }],
        ['tigrex.spin', '제자리 회전 베기', 'area', 0.34, { minTargets: 2, maxTargets: 4, tags: ['area'] }],
        ['tigrex.rage_rush', '굉룡 폭주 돌진', 'ultimate', 0.55, { minTargets: 2, maxTargets: 4, state: 'enraged', tags: ['ultimate', 'charge'] }]
    ]),
    nergigante: huntProfile('world_iceborne', [
        ['nergigante.roar', '멸진룡의 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['nergigante.paw', '앞발 내려치기', 'physical', 0.31, { maxTargets: 2 }],
        ['nergigante.spikes', '가시 파편 발사', 'projectile', 0.33, { maxTargets: 3, tags: ['projectile'] }],
        ['nergigante.wing_slam', '날개 지면 강타', 'area', 0.38, { minTargets: 2, maxTargets: 4, tags: ['area'] }],
        ['nergigante.divebomb', '파멸의 일격', 'ultimate', 0.60, { minTargets: 2, maxTargets: 4, windup: 13, recovery: 17, state: 'enraged', tags: ['ultimate', 'charge'] }]
    ]),
    velkhana: huntProfile('rise_sunbreak', [
        ['velkhana.roar', '빙룡의 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['velkhana.tail', '꼬리 얼음칼 찌르기', 'physical', 0.30, { maxTargets: 2 }],
        ['velkhana.breath', '얼음 브레스 방출', 'projectile', 0.32, { maxTargets: 3, tags: ['projectile', 'elemental'] }],
        ['velkhana.ice_wall', '빙벽 생성 강타', 'area', 0.37, { minTargets: 2, maxTargets: 4, tags: ['area', 'elemental'] }],
        ['velkhana.zero', '고리형 절대영도 폭발', 'ultimate', 0.57, { minTargets: 2, maxTargets: 4, state: 'enraged', tags: ['ultimate', 'area', 'elemental'] }]
    ]),
    valstrax: huntProfile('rise_sunbreak', [
        ['valstrax.roar', '천혜룡의 제트 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['valstrax.wing_stab', '용기 제트 찌르기', 'physical', 0.34, { maxTargets: 2 }],
        ['valstrax.dragon_shot', '기공 탄환 사격', 'projectile', 0.31, { maxTargets: 3, tags: ['projectile', 'elemental'] }],
        ['valstrax.jet_rush', '제트 돌격 들이받기', 'charge', 0.41, { maxTargets: 3, tags: ['charge', 'elemental'] }],
        ['valstrax.ambush', '붉은 혜성 강습', 'ultimate', 0.62, { minTargets: 2, maxTargets: 4, windup: 14, recovery: 18, state: 'enraged', tags: ['ultimate', 'charge'] }]
    ]),
    fatalis: huntProfile('world_iceborne', [
        ['fatalis.roar', '흑룡의 파멸적 노성', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['fatalis.fireball', '화염구 연사', 'projectile', 0.34, { maxTargets: 3, tags: ['projectile', 'elemental'] }],
        ['fatalis.flame_sweep', '화염 브레스 쓸기', 'area', 0.42, { minTargets: 2, maxTargets: 4, tags: ['area', 'elemental'] }],
        ['fatalis.body_slam', '대형 몸통 강타', 'physical', 0.38, { maxTargets: 2 }],
        ['fatalis.nova', '겁염의 브레스', 'ultimate', 0.68, { minTargets: 3, maxTargets: 4, windup: 16, recovery: 20, state: 'enraged', maxHpRatio: 0.65, tags: ['ultimate', 'area', 'elemental'] }]
    ])
};

if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_PATTERN_OVERRIDES;
else window.HUNT_MONSTER_PATTERN_OVERRIDES = HUNT_MONSTER_PATTERN_OVERRIDES;
