function huntPattern(id, name, type, damageRatio, options = {}) {
    return { id, name, type, damageRatio, windupTicks: options.windup || 5, activeTicks: options.active || 2,
        recoveryTicks: options.recovery || 8, minTargets: options.minTargets || 1, maxTargets: options.maxTargets || 1,
        cooldownTicks: options.cooldown || 30, weight: options.weight || 1, tags: options.tags || [type],
        requiredState: options.state, maxHpRatio: options.maxHpRatio, sourceGame: options.sourceGame,
        sourceActionClass: options.actionClass || null,
        evidence: options.evidence || (options.actionClass ? 'installed-game-action-class' : 'web-reference'),
        confidence: options.actionClass ? 'extracted-action' : 'curated-behavior' };
}

function huntProfile(sourceGame, definitions) {
    return definitions.map(([id, name, type, ratio, options = {}]) => huntPattern(id, name, type, ratio, { sourceGame, ...options }));
}

const HUNT_MONSTER_PATTERN_OVERRIDES = {
    rathian: huntProfile('wilds', [
        ['rathian.roar', '자화룡의 포효', 'roar', 0, { maxTargets: 4, actionClass: 'cRoarDiscover', tags: ['roar'] }],
        ['rathian.triple_fireball', '삼연 화염 브레스', 'projectile', 0.29, { maxTargets: 3, actionClass: 'cBreathThreeway', tags: ['projectile', 'elemental', 'multi-hit'] }],
        ['rathian.triple_rush', '삼연 돌진', 'charge', 0.36, { maxTargets: 3, actionClass: 'cTripleRush', windup: 6, recovery: 11, tags: ['charge', 'multi-hit', 'cross-charge'] }],
        ['rathian.somersault', '독가시 서머솔트', 'physical', 0.42, { maxTargets: 2, actionClass: 'cSomersault', cooldown: 42, tags: ['poison', 'tail'] }],
        ['rathian.double_somersault', '이단 독가시 서머솔트', 'ultimate', 0.55, { minTargets: 2, maxTargets: 4, actionClass: 'cSomersaultDoubleFirst', state: 'enraged', windup: 9, recovery: 15, tags: ['ultimate', 'poison', 'multi-hit'] }]
    ]),
    rathalos: huntProfile('wilds', [
        ['rathalos.roar', '화룡의 포효', 'roar', 0, { maxTargets: 4, actionClass: 'cRoarDiscover', tags: ['roar'] }],
        ['rathalos.fireball', '화염구 브레스', 'projectile', 0.27, { maxTargets: 2, actionClass: 'cBreathAttack', tags: ['projectile', 'elemental'] }],
        ['rathalos.claw_dive', '독조 급강하', 'charge', 0.36, { windup: 7, recovery: 11, actionClass: 'cVerticalKickFly', tags: ['charge', 'poison'] }],
        ['rathalos.tail_sweep', '이단 꼬리 회전', 'area', 0.31, { minTargets: 2, maxTargets: 4, actionClass: 'cDoubleTurnTailAttackLeft', tags: ['area', 'tail'] }],
        ['rathalos.aerial_barrage', '공중 화염구 연사', 'ultimate', 0.50, { minTargets: 2, maxTargets: 4, state: 'enraged', actionClass: 'cBandBreathTripleShootLFly', tags: ['ultimate', 'projectile', 'elemental', 'multi-hit'] }]
    ]),
    gore_magala: huntProfile('wilds', [
        ['gore_magala.roar', '흑식룡의 포효', 'roar', 0, { maxTargets: 4, actionClass: 'cRoarDiscoverSixLeg', tags: ['roar', 'frenzy'] }],
        ['gore_magala.frenzy_breath', '광룡 브레스', 'projectile', 0.30, { maxTargets: 2, actionClass: 'cSingleBreathFourLeg', tags: ['projectile', 'frenzy'] }],
        ['gore_magala.triple_breath', '삼방향 광룡 브레스', 'area', 0.36, { minTargets: 2, maxTargets: 4, actionClass: 'cThreeWayBreathFourLeg', tags: ['area', 'projectile', 'frenzy'] }],
        ['gore_magala.double_punch', '익각 연속 내려찍기', 'physical', 0.38, { maxTargets: 2, actionClass: 'cDoublePunchSixLeg', tags: ['multi-hit'] }],
        ['gore_magala.virus_rush', '광룡화 돌진 연계', 'ultimate', 0.56, { minTargets: 2, maxTargets: 4, actionClass: 'cSpinRushSixLegFly', state: 'enraged', windup: 10, recovery: 15, tags: ['ultimate', 'charge', 'frenzy'] }]
    ]),
    seregios: huntProfile('wilds', [
        ['seregios.roar', '천인룡의 포효', 'roar', 0, { maxTargets: 4, actionClass: 'cRoar', tags: ['roar'] }],
        ['seregios.scale_shot', '열상비늘 사격', 'projectile', 0.29, { maxTargets: 3, actionClass: 'cScaleAttackFly', tags: ['projectile', 'bleed'] }],
        ['seregios.drop_kick', '공중 급강하 발톱차기', 'charge', 0.39, { maxTargets: 2, actionClass: 'cDropKick', windup: 7, recovery: 10, tags: ['charge', 'bleed'] }],
        ['seregios.spinning_kick', '회전 꼬리차기', 'area', 0.35, { minTargets: 2, maxTargets: 4, actionClass: 'cBackSpinningKickLanding', tags: ['area'] }],
        ['seregios.kill_kick', '천인 연속 살상각', 'ultimate', 0.57, { minTargets: 2, maxTargets: 4, actionClass: 'cKillKickFly', state: 'enraged', windup: 10, recovery: 15, tags: ['ultimate', 'charge', 'bleed'] }]
    ]),
    mizutsune: huntProfile('wilds', [
        ['mizutsune.roar', '포호룡의 포효', 'roar', 0, { maxTargets: 4, actionClass: 'cRoarDiscover', tags: ['roar'] }],
        ['mizutsune.bubble_breath', '포말 삼연 브레스', 'projectile', 0.28, { maxTargets: 3, actionClass: 'cBubbleBreath3ToWall', tags: ['projectile', 'bubble'] }],
        ['mizutsune.water_laser', '고압 수류 레이저', 'projectile', 0.36, { maxTargets: 3, actionClass: 'cWaterPressureLaserExL', tags: ['projectile', 'elemental'] }],
        ['mizutsune.gyro_spin', '회천 꼬리 휩쓸기', 'area', 0.38, { minTargets: 2, maxTargets: 4, actionClass: 'cGyroSpinAttackStart', tags: ['area', 'tail'] }],
        ['mizutsune.cross_laser', '십자 수류 대회전', 'ultimate', 0.56, { minTargets: 2, maxTargets: 4, actionClass: 'cCrossLaserBreath', state: 'enraged', windup: 11, recovery: 16, tags: ['ultimate', 'area', 'elemental'] }]
    ]),
    lagiacrus: huntProfile('wilds', [
        ['lagiacrus.roar', '해룡의 포효', 'roar', 0, { maxTargets: 4, actionClass: 'cRoarDiscover', tags: ['roar'] }],
        ['lagiacrus.thunder_breath', '직선 뇌격 브레스', 'projectile', 0.31, { maxTargets: 2, actionClass: 'cStraightThunderBreath', tags: ['projectile', 'elemental'] }],
        ['lagiacrus.discharge', '전신 방전', 'area', 0.38, { minTargets: 2, maxTargets: 4, actionClass: 'cLargeElectricalDischarge', cooldown: 44, tags: ['area', 'elemental'] }],
        ['lagiacrus.thunder_tackle', '뇌전 돌진 태클', 'charge', 0.41, { maxTargets: 3, actionClass: 'cRushThunderTackle', windup: 8, recovery: 12, tags: ['charge', 'elemental'] }],
        ['lagiacrus.ultimate_thunder', '대해룡 궁극 뇌폭', 'ultimate', 0.60, { minTargets: 2, maxTargets: 4, actionClass: 'cSwimUltimateThunder', state: 'enraged', windup: 13, recovery: 18, tags: ['ultimate', 'area', 'elemental'] }]
    ]),
    diablos: huntProfile('world_iceborne', [
        ['diablos.roar', '각룡의 포효', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['diablos.horn_charge', '각공격 들이받기', 'charge', 0.38, { windup: 7, recovery: 12, tags: ['charge'] }],
        ['diablos.burrow', '지중 급습 쳐올리기', 'charge', 0.44, { windup: 11, recovery: 14, cooldown: 55, tags: ['charge', 'burrow'] }],
        ['diablos.tail', '꼬리 회전치기', 'area', 0.30, { minTargets: 2, maxTargets: 3, tags: ['area'] }],
        ['diablos.rage_chain', '폭주 연쇄 돌진', 'ultimate', 0.52, { minTargets: 2, maxTargets: 4, state: 'enraged', tags: ['ultimate', 'charge', 'cross-charge'] }]
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
        ['tigrex.charge', '광란의 지그재그 돌진', 'charge', 0.39, { maxTargets: 3, tags: ['charge', 'cross-charge'] }],
        ['tigrex.rock', '암석 파편 쳐올리기', 'projectile', 0.29, { maxTargets: 2, tags: ['projectile'] }],
        ['tigrex.spin', '제자리 회전 베기', 'area', 0.34, { minTargets: 2, maxTargets: 4, tags: ['area'] }],
        ['tigrex.rage_rush', '굉룡 폭주 돌진', 'ultimate', 0.55, { minTargets: 2, maxTargets: 4, state: 'enraged', tags: ['ultimate', 'charge', 'cross-charge'] }]
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
        ['valstrax.jet_rush', '제트 돌격 들이받기', 'charge', 0.41, { maxTargets: 3, tags: ['charge', 'elemental'] }]
    ]),
    fatalis: huntProfile('world_iceborne', [
        ['fatalis.roar', '흑룡의 파멸적 노성', 'roar', 0, { maxTargets: 4, tags: ['roar'] }],
        ['fatalis.fireball', '화염구 연사', 'projectile', 0.34, { maxTargets: 3, tags: ['projectile', 'elemental'] }],
        ['fatalis.flame_sweep', '화염 브레스 쓸기', 'area', 0.42, { minTargets: 2, maxTargets: 4, tags: ['area', 'elemental'] }],
        ['fatalis.body_slam', '대형 몸통 강타', 'physical', 0.38, { maxTargets: 2 }],
        ['fatalis.nova', '겁염의 브레스', 'ultimate', 0.68, { minTargets: 3, maxTargets: 4, windup: 16, recovery: 20, state: 'enraged', maxHpRatio: 0.65, tags: ['ultimate', 'area', 'elemental'] }]
    ])
};

function inheritVariant(baseId, variantId, title, damageRate = 1.04) {
    const base = HUNT_MONSTER_PATTERN_OVERRIDES[baseId];
    if (!base) return;
    HUNT_MONSTER_PATTERN_OVERRIDES[variantId] = base.map(pattern => ({
        ...pattern,
        id: pattern.id.replace(`${baseId}.`, `${variantId}.`),
        name: `${title} ${pattern.name.replace(/^[^ ]+ /, '')}`,
        damageRatio: Math.min(0.72, Number((pattern.damageRatio * damageRate).toFixed(3))),
        sourceGame: 'latest-variant-reference',
        sourceActionClass: null,
        evidence: `web-reference:variant-family:${baseId}`,
        confidence: 'variant-curated'
    }));
}

inheritVariant('rathalos', 'azure_rathalos', '창화룡', 1.04);
inheritVariant('rathalos', 'silver_rathalos', '은화룡', 1.10);
inheritVariant('rathian', 'pink_rathian', '앵화룡', 1.04);
inheritVariant('rathian', 'gold_rathian', '금화룡', 1.10);
inheritVariant('diablos', 'black_diablos', '흑각룡', 1.08);
inheritVariant('nergigante', 'ruiner_nergigante', '모멸넬기', 1.09);
inheritVariant('zinogre', 'stygian_zinogre', '옥랑룡', 1.08);
inheritVariant('valstrax', 'crimson_glow_valstrax', '천혜룡', 1.10);

if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_PATTERN_OVERRIDES;
else window.HUNT_MONSTER_PATTERN_OVERRIDES = HUNT_MONSTER_PATTERN_OVERRIDES;
