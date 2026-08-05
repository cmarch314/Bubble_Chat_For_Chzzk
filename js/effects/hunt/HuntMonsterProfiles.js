function huntPattern(id, name, type, damageRatio, options = {}) {
    return { id, name, type, damageRatio, windupTicks: options.windup || 5, activeTicks: options.active || 2,
        recoveryTicks: options.recovery || 8, minTargets: options.minTargets || 1, maxTargets: options.maxTargets || 1,
        cooldownTicks: options.cooldown || 30, weight: options.weight || 1, tags: options.tags || [type],
        requiredState: options.state, maxHpRatio: options.maxHpRatio, sourceGame: options.sourceGame,
        sourceActionClass: options.actionClass || null,
        sourceMoveNameJA: options.sourceMoveNameJA || null, sourceUrl: options.sourceUrl || null,
        delivery: options.delivery || null,
        projectileVisual: options.projectileVisual || null,
        projectileEventKinds: options.projectileEventKinds || null,
        roarVisual: options.roarVisual || null,
        forbiddenStates: options.forbiddenStates || [],
        forbiddenWhenBroken: options.forbiddenWhenBroken || [],
        weightWhenBroken: options.weightWhenBroken || null,
        brokenPartDamageModifiers: options.brokenPartDamageModifiers || null,
        brokenPartAccuracyModifiers: options.brokenPartAccuracyModifiers || null,
        brokenPartTargetCaps: options.brokenPartTargetCaps || null,
        statusBlockedWhenBroken: options.statusBlockedWhenBroken || [],
        monsterAtbCost: options.monsterAtbCost,
        monsterAtbCostMultiplier: options.monsterAtbCostMultiplier,
        postActionRecoverySeconds: options.postActionRecoverySeconds,
        targetDamageRatios: options.targetDamageRatios || null,
        interference: options.interference || null,
        repeatWhenEnraged: options.repeatWhenEnraged || 1,
        maxConsecutiveUses: Math.max(1, Number(options.maxConsecutiveUses || 1)),
        enragedTargetCount: options.enragedTargetCount || null,
        movement: options.movement || null,
        targeting: options.targeting || null,
        followUp: options.followUp || null,
        phase: options.phase || null,
        attachedFx: options.attachedFx || null,
        secondaryInterference: options.secondaryInterference || null,
        guaranteedWhenInterference: options.guaranteedWhenInterference || null,
        whiffReaction: options.whiffReaction || null,
        chargeMode: options.chargeMode || null,
        impact: options.impact || null,
        impactTimeline: options.impactTimeline || null,
        impactTimelineByState: options.impactTimelineByState || null,
        flightTransition: options.flightTransition || null,
        flight: options.flight || null,
        suppressPrepareAudio: Boolean(options.suppressPrepareAudio),
        animationProfile: options.animationProfile || null,
        animationDurationMs: options.animationDurationMs || null,
        animationGeometry: options.animationGeometry || null,
        chargeLaunchStyle: options.chargeLaunchStyle || null,
        originPart: options.originPart || null,
        projectileLaunchDelayTicks: options.projectileLaunchDelayTicks || null,
        branchKind: options.branchKind || null,
        branchLabel: options.branchLabel || null,
        staminaCostProfile: options.staminaCostProfile || null,
        stateMachine: options.stateMachine || null,
        visualAnchors: options.visualAnchors || null,
        habitatVariants: options.habitatVariants || null,
        directDamageScope: options.directDamageScope || null,
        partUse: options.partUse || null,
        requiresPreviousPattern: options.requiresPreviousPattern || null,
        ...(options.maxConsecutiveUsesByState
            ? { maxConsecutiveUsesByState: options.maxConsecutiveUsesByState } : {}),
        ...(options.weightByState ? { weightByState: options.weightByState } : {}),
        ...(options.selectionChanceByState
            ? { selectionChanceByState: options.selectionChanceByState } : {}),
        ...(options.selectionChancePenaltyPerBrokenPart
            ? { selectionChancePenaltyPerBrokenPart: options.selectionChancePenaltyPerBrokenPart } : {}),
        ...(options.scaleDropsByPart ? { scaleDropsByPart: options.scaleDropsByPart } : {}),
        ...(options.scaleSlotMode ? { scaleSlotMode: options.scaleSlotMode } : {}),
        ...(options.scaleDropTiming ? { scaleDropTiming: options.scaleDropTiming } : {}),
        ...(options.ignitesScaleTarget ? { ignitesScaleTarget: true } : {}),
        ...(options.ignitesAllScales ? { ignitesAllScales: true } : {}),
        ...(options.defenseMode ? { defenseMode: options.defenseMode } : {}),
        ...(options.telegraphFx ? { telegraphFx: options.telegraphFx } : {}),
        ...(options.fixedWindup ? { fixedWindup: true } : {}),
        evidence: options.evidence || (options.actionClass ? 'installed-game-action-class' : 'web-reference'),
        confidence: options.confidence || (options.actionClass ? 'extracted-action' : 'curated-behavior') };
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
        name: pattern.name.replace(/^[가-힣]{1,10}룡(?:의\s*|\s+)/, ''),
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

// Four-monster reconstruction pilot. Assigning these after variant inheritance
// prevents an original-species review from silently changing subspecies.
const PILOT_SOURCES = Object.freeze({
    bazelgeuse: 'data/hunt/research/world-iceborne-flying-wyverns.json',
    chameleos: 'https://mhrise.mhrice.info/monster/025_00.html',
    rathian: 'https://mhworld.kiranico.com/ja/monsters/Rz9Tb/rioreia',
    rathalos: 'https://mhworld.kiranico.com/ja/monsters/BnetX/rioreusu',
    diablos: 'data/hunt/research/world-iceborne-flying-wyverns.json'
});
const pilot = (sourceGame, sourceUrl, definitions) => huntProfile(sourceGame,
    definitions.map(definition => {
        const options = definition[4] || {};
        return [...definition.slice(0, 4), {
            ...options, sourceUrl,
            evidence: 'verified-complete-action',
            confidence: 'cross-checked-behavior'
        }];
    }));
const RATHALOS_ATTACK_ATB_COST_MULTIPLIER = 1.10;

// Reviewed World high-rank Bazelgeuse kit.
HUNT_MONSTER_PATTERN_OVERRIDES.bazelgeuse = pilot('world_iceborne', PILOT_SOURCES.bazelgeuse, [
    ['bazelgeuse.roar', '포효', 'roar', 0, {
        maxTargets: 4, sourceMoveNameJA: '咆哮', tags: ['roar', 'transition-roar'],
        weight: 0.08, active: 40, recovery: 1, animationProfile: 'roar',
        animationDurationMs: 3200, impact: { visualRatio: .43 },
        ignitesAllScales: true
    }],
    ['bazelgeuse.bite', '깨물기', 'physical', 0.25, {
        sourceMoveNameJA: '噛みつき', weight: 20, active: 30, recovery: 1,
        weightByState: { normal: 20, enraged: 10 },
        tags: ['physical', 'ground-only', 'target-contact', 'ignites-scale-target'],
        animationProfile: 'close-strike', animationDurationMs: 2400,
        impact: { visualRatio: .46 },
        maxConsecutiveUsesByState: { normal: 1, enraged: 2 },
        ignitesScaleTarget: true
    }],
    ['bazelgeuse.charge', '돌진', 'charge', 0.35, {
        sourceMoveNameJA: '突進', weight: 20, active: 50, recovery: 1,
        weightByState: { normal: 20, enraged: 25 },
        tags: ['charge', 'ground-only', 'target-contact', 'blast-scale-source', 'ignites-scale-target'],
        animationProfile: 'ground-charge', animationDurationMs: 4000,
        movement: { kind: 'ground-charge', ticks: 50, untargetable: true },
        impact: { visualRatio: .38 },
        scaleDropsByPart: { body: 1, head: 1, tail: 1 }, scaleSlotMode: 'target-adjacent',
        maxConsecutiveUsesByState: { normal: 1, enraged: 2 },
        ignitesScaleTarget: true
    }],
    ['bazelgeuse.side_tackle', '측면 몸통박치기', 'physical', 0.40, {
        sourceMoveNameJA: '体当たり', weight: 15, active: 40, recovery: 1,
        weightByState: { normal: 15, enraged: 15 },
        tags: ['physical', 'ground-only', 'target-contact', 'blast-scale-source', 'ignites-scale-target'],
        animationProfile: 'side-tackle-contact', animationDurationMs: 3200,
        movement: { kind: 'side-tackle-contact', ticks: 40 },
        impact: { visualRatio: .58 },
        scaleDropsByPart: { body: 1, head: 1, tail: 1 }, scaleSlotMode: 'target-adjacent',
        maxConsecutiveUsesByState: { normal: 1, enraged: 2 },
        ignitesScaleTarget: true
    }],
    ['bazelgeuse.tail_sweep', '꼬리 휩쓸기', 'area', 0.30, {
        sourceMoveNameJA: '尻尾振り', weight: 15, active: 40, recovery: 1,
        weightByState: { normal: 15, enraged: 15 },
        maxTargets: 1,
        tags: ['area', 'tail', 'ground-only', 'target-contact', 'blast-scale-source', 'ignites-scale-target'],
        animationProfile: 'tail-sweep', animationDurationMs: 3200,
        impact: { visualRatio: .58 },
        scaleDropsByPart: { body: 1, tail: 2 }, scaleSlotMode: 'target-adjacent',
        brokenPartDamageModifiers: { tail: 0.5 },
        maxConsecutiveUsesByState: { normal: 1, enraged: 2 },
        ignitesScaleTarget: true
    }],
    ['bazelgeuse.body_press', '바디 프레스', 'physical', 0.45, {
        sourceMoveNameJA: '押しつぶし', weight: 15, active: 30, recovery: 1,
        weightByState: { normal: 15, enraged: 15 },
        maxTargets: 1,
        tags: ['physical', 'ground-only', 'target-contact', 'blast-scale-source', 'ignites-scale-target'],
        animationProfile: 'leap-slam', animationDurationMs: 2400,
        movement: { kind: 'leap-slam', ticks: 30 },
        postActionRecoverySeconds: 1,
        impact: { visualRatio: .73 },
        scaleDropsByPart: { body: 3, head: 1, tail: 1 }, scaleSlotMode: 'target-adjacent',
        secondaryInterference: { kind: 'tremor', size: 'small', scope: 'all-other' },
        maxConsecutiveUsesByState: { normal: 1, enraged: 2 },
        ignitesScaleTarget: true
    }],
    ['bazelgeuse.breath', '브레스', 'elemental', 0.10, {
        sourceMoveNameJA: '火炎ブレス', weight: 15, active: 40, recovery: 1,
        weightByState: { normal: 15, enraged: 20 },
        maxTargets: 1,
        tags: ['elemental', 'fire', 'ground-only', 'blast-scale-source', 'ignites-scale-target'],
        delivery: 'gas', forbiddenStates: ['exhausted'], originPart: 'mouth',
        animationProfile: 'ranged-cast', animationDurationMs: 3200,
        impact: { visualRatio: .70, survivesInterruption: true },
        impactTimeline: [
            {
                atTicks: 10, damageScale: 0, eventKind: 'blast-scale-volley',
                suppressStatus: true
            },
            { atTicks: 28, damageScale: 1, eventKind: 'breath-impact' }
        ],
        scaleDropsByPart: { body: 1, head: 2 }, scaleSlotMode: 'target-adjacent',
        scaleDropTiming: 'before-impact',
        maxConsecutiveUsesByState: { normal: 1, enraged: 2 },
        ignitesScaleTarget: true
    }],
    ['bazelgeuse.carpet_bombing', '융단폭격', 'charge', 0.60, {
        sourceMoveNameJA: '爆鱗絨毯爆撃', weight: 0.01, active: 120, recovery: 1,
        cooldown: 450, maxTargets: 1, forbiddenStates: ['exhausted'],
        tags: ['charge', 'ground-only', 'tracking', 'high-flight-sequence', 'blast-scale-airdrop'],
        movement: { kind: 'bazel-carpet-bombing', ticks: 120, untargetable: true },
        targeting: { mode: 'bazel-carpet' },
        animationProfile: 'bazel-carpet-bombing', animationDurationMs: 9600,
        selectionChanceByState: { normal: 0.20, enraged: 0.45 },
        selectionChancePenaltyPerBrokenPart: { partPattern: 'wing', amount: 0.05 },
        scaleDropsByPart: { body: 2, head: 1, tail: 1 }, scaleSlotMode: 'all',
        impactTimeline: [
            { atTicks: 12, damageScale: 0.583333, eventKind: 'initial-charge' },
            {
                atTicks: 91, damageScale: 1, eventKind: 'carpet-dive',
                targetMode: 'runtime-dive',
                defenseMode: 'emergency-jump',
                secondaryInterference: { kind: 'tremor', size: 'large', scope: 'all' }
            }
        ]
    }]
]);

HUNT_MONSTER_PATTERN_OVERRIDES.chameleos = pilot('rise_sunbreak', PILOT_SOURCES.chameleos, [
    ['chameleos.roar', '포효', 'roar', 0, { maxTargets: 4, sourceMoveNameJA: '咆哮', tags: ['roar'], weight: 0.24 }],
    ['chameleos.tongue', '혀 휘두르기', 'physical', 0.24, { sourceMoveNameJA: '舌攻撃', maxTargets: 2, tags: ['physical', 'steal'] }],
    ['chameleos.claw', '앞발 할퀴기', 'physical', 0.26, { sourceMoveNameJA: 'ひっかき', recovery: 7 }],
    ['chameleos.poison_blob', '독액 발사', 'projectile', 0.29, {
        sourceMoveNameJA: '毒液ブレス', maxTargets: 2, tags: ['projectile', 'poison'], delivery: 'projectile'
    }],
    ['chameleos.poison_mist', '직선 독무', 'area', 0.31, {
        sourceMoveNameJA: '固定長ビーム状毒霧', minTargets: 2, maxTargets: 3, cooldown: 38,
        tags: ['area', 'poison', 'mist'], delivery: 'gas'
    }],
    ['chameleos.poison_fan', '부채꼴 독무', 'area', 0.36, {
        sourceMoveNameJA: '扇状毒霧', minTargets: 2, maxTargets: 4, windup: 8, recovery: 12,
        cooldown: 52, tags: ['area', 'poison', 'mist'], delivery: 'gas'
    }],
    ['chameleos.poison_rush', '독무 연계', 'area', 0.43, {
        sourceMoveNameJA: '毒霧大技', minTargets: 2, maxTargets: 4, windup: 11, recovery: 15,
        cooldown: 75, state: 'enraged', tags: ['area', 'poison', 'mist', 'multi-hit'], delivery: 'gas',
        weightWhenBroken: { head: 0.55 }
    }]
]);

HUNT_MONSTER_PATTERN_OVERRIDES.rathalos = pilot('world_iceborne', PILOT_SOURCES.rathalos, [
    ['rathalos.roar', '포효', 'roar', 0, {
        maxTargets: 4, sourceMoveNameJA: '咆哮', tags: ['roar', 'transition-roar'],
        weight: 0.16, cooldown: 90, monsterAtbCost: 0.5
    }],
    ['rathalos.bite', '물어뜯기', 'physical', 0.24, {
        sourceMoveNameJA: '噛みつき', recovery: 1, tags: ['physical', 'ground-only', 'target-contact', 'weak'],
        monsterAtbCost: 0.32, movement: { ticks: 20 }, impact: { delayRatio: 0.6 },
        animationProfile: 'rathalos-bite-contact', maxConsecutiveUses: 3
    }],
    ['rathalos.rush', '돌진 물어뜯기', 'charge', 0.30, {
        sourceMoveNameJA: '突進噛みつき', minTargets: 1, maxTargets: 2, windup: 6, recovery: 1,
        tags: ['charge', 'ground-only', 'target-contact'], monsterAtbCost: 0.52,
        movement: { ticks: 32 }, targeting: { mode: 'adjacent-lane' },
        impact: { delayRatio: 0.61 }, animationProfile: 'rathalos-rush-bite'
    }],
    ['rathalos.fireball', '화염구 브레스', 'projectile', 0.50, {
        sourceMoveNameJA: '火球ブレス', maxTargets: 1, recovery: 1, monsterAtbCost: 0.38,
        tags: ['projectile', 'elemental', 'fire', 'ground-only'], delivery: 'projectile',
        impact: { delayTicks: 17, survivesInterruption: true }, animationProfile: 'rathalos-fireball', originPart: 'head',
        projectileLaunchDelayTicks: 10,
        brokenPartDamageModifiers: { head: 0.60 },
        brokenPartAccuracyModifiers: { head: 0.75 }
    }],
    ['rathalos.aerial_fireball', '공중 화염구', 'projectile', 0.42, {
        sourceMoveNameJA: '空中火球ブレス', maxTargets: 1, recovery: 1, cooldown: 24,
        monsterAtbCost: 0.44,
        tags: ['projectile', 'elemental', 'fire', 'flight-only'], delivery: 'projectile',
        impact: { delayTicks: 17, survivesInterruption: true },
        projectileLaunchDelayTicks: 10,
        animationProfile: 'rathalos-fireball', originPart: 'head',
        brokenPartDamageModifiers: { head: 0.60 },
        brokenPartAccuracyModifiers: { head: 0.75 }
    }],
    ['rathalos.backstep_fireball', '백스텝 브레스', 'projectile', 0.70, {
        sourceMoveNameJA: 'バックブレス', minTargets: 1, maxTargets: 1, cooldown: 48,
        recovery: 1, state: 'enraged', monsterAtbCost: 0.55,
        tags: ['projectile', 'elemental', 'fire', 'ground-only', 'rage-opener'],
        delivery: 'projectile', impact: { delayTicks: 17, survivesInterruption: true },
        projectileLaunchDelayTicks: 10,
        flightTransition: 'takeoff', animationProfile: 'rathalos-backstep-fireball', originPart: 'head',
        secondaryInterference: { kind: 'wind', size: 'large' },
        guaranteedWhenInterference: 'roar',
        brokenPartDamageModifiers: { head: 0.50 },
        brokenPartAccuracyModifiers: { head: 0.75 }
    }],
    ['rathalos.claw_dive', '독조 강습', 'charge', 0.39, {
        sourceMoveNameJA: '毒爪急襲', maxTargets: 1, windup: 8, recovery: 1,
        tags: ['charge', 'poison', 'flight-only', 'target-contact'], monsterAtbCost: 0.7,
        movement: { ticks: 36 }, impact: { delayRatio: 0.66 }, animationProfile: 'rathalos-claw-dive'
    }],
    ['rathalos.tail_sweep', '꼬리 회전', 'area', 0.31, {
        sourceMoveNameJA: '尻尾回転', minTargets: 2, maxTargets: 3, recovery: 1,
        tags: ['area', 'tail', 'ground-only', 'target-contact'],
        monsterAtbCost: 0.62, movement: { ticks: 38 }, targeting: { mode: 'lane' },
        impactTimeline: [{ atTicks: 14 }, { atTicks: 24 }],
        animationProfile: 'rathalos-tail-sweep-double', animationDurationMs: 3800,
        brokenPartTargetCaps: { tail: 1 }, brokenPartDamageModifiers: { tail: 0.50 }
    }],
    ['rathalos.aerial_tail_sweep', '공중 꼬리 휩쓸기', 'area', 0.32, {
        sourceMoveNameJA: '空中尻尾回転', minTargets: 1, maxTargets: 2, recovery: 1,
        cooldown: 34, tags: ['area', 'tail', 'flight-only', 'target-contact'],
        monsterAtbCost: 0.58, movement: { ticks: 30 }, targeting: { mode: 'adjacent-lane' },
        impact: { delayRatio: 0.62 }, animationProfile: 'tail-sweep',
        brokenPartTargetCaps: { tail: 1 }, brokenPartDamageModifiers: { tail: 0.50 }
    }],
    ['rathalos.hop_stomp', '도약 발톱 내려찍기', 'physical', 0.35, {
        sourceMoveNameJA: '飛びかかり蹴り', maxTargets: 1, windup: 6, recovery: 1,
        cooldown: 32, monsterAtbCost: 0.52,
        tags: ['physical', 'poison', 'ground-only', 'target-contact'],
        movement: { ticks: 26 }, impact: { delayRatio: 0.68 },
        animationProfile: 'rathalos-stomp'
    }],
    ['rathalos.stomp', '독조 내려찍기', 'physical', 0.35, {
        sourceMoveNameJA: '踏みつけ攻撃', maxTargets: 1, windup: 7, recovery: 1,
        cooldown: 38, monsterAtbCost: 0.58,
        tags: ['physical', 'poison', 'flight-only', 'landing-only', 'target-contact'],
        movement: { ticks: 27 }, impact: { delayRatio: 0.7 },
        animationProfile: 'rathalos-stomp', flightTransition: 'land'
    }],
    ['rathalos.glide', '저공 활공 돌진', 'charge', 0.30, {
        sourceMoveNameJA: '滑空突進', minTargets: 4, maxTargets: 4, recovery: 1,
        cooldown: 42, monsterAtbCost: 0.64, chargeMode: 'wide',
        tags: ['charge', 'flight-only', 'wide-charge', 'screen-crossing'],
        movement: { kind: 'aerial-screen-crossing', ticks: 40, untargetable: true },
        targeting: { mode: 'screen-sweep' },
        impactTimeline: [
            { atTicks: 12, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 16, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 20, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 24, targetMode: 'sequential', damageScale: 1 }
        ],
        animationProfile: 'aerial-charge-cross', animationDurationMs: 3200
    }]
]).map(pattern => pattern.type === 'roar' ? pattern : ({
    ...pattern,
    monsterAtbCostMultiplier: RATHALOS_ATTACK_ATB_COST_MULTIPLIER
}));

// Final World-original Rathian review. Only this record is exported to runtime.
HUNT_MONSTER_PATTERN_OVERRIDES.rathian = pilot('world_iceborne', PILOT_SOURCES.rathian, [
    ['rathian.roar', '포효', 'roar', 0, {
        maxTargets: 4, sourceMoveNameJA: '咆哮', tags: ['roar', 'transition-roar'],
        weight: 0.14, cooldown: 90, monsterAtbCost: 0.48
    }],
    ['rathian.bite', '물어뜯기', 'physical', 0.22, {
        sourceMoveNameJA: '噛みつき', recovery: 1,
        tags: ['physical', 'ground-only', 'target-contact', 'weak'], monsterAtbCost: 0.30,
        movement: { ticks: 20 }, impact: { visualRatio: 0.55 },
        animationProfile: 'rathalos-bite-contact', animationDurationMs: 2400,
        maxConsecutiveUses: 1
    }],
    ['rathian.tail_sweep', '이단 꼬리 회전', 'area', 0.27, {
        sourceMoveNameJA: '尻尾回転', minTargets: 4, maxTargets: 4, recovery: 1,
        tags: ['area', 'tail', 'ground-only', 'target-contact'], monsterAtbCost: 0.58,
        movement: { ticks: 42 }, targeting: { mode: 'left-right-halves' },
        impactTimeline: [
            { atTicks: 24, damageScale: 1 },
            { atTicks: 34, damageScale: 1 }
        ],
        animationProfile: 'rathian-tail-sweep-double', animationDurationMs: 4200,
        animationGeometry: { anchor: 'arena-center-lower', yRatio: 0.56, approachX: 1, approachY: 1 },
        brokenPartTargetCaps: { tail: 1 }, brokenPartDamageModifiers: { tail: 0.70 }
    }],
    ['rathian.fireball', '화염구 브레스', 'projectile', 0.34, {
        sourceMoveNameJA: '炎ブレス', maxTargets: 1, recovery: 1,
        tags: ['projectile', 'elemental', 'fire', 'ground-only'], monsterAtbCost: 0.38,
        forbiddenStates: ['enraged', 'exhausted'],
        delivery: 'projectile', impact: { delayTicks: 17, survivesInterruption: true },
        projectileLaunchDelayTicks: 10,
        animationProfile: 'rathalos-fireball', originPart: 'head',
        brokenPartDamageModifiers: { head: 0.80 },
        brokenPartAccuracyModifiers: { head: 0.75 }
    }],
    ['rathian.triple_fireball', '삼연 화염구', 'projectile', 0.402, {
        sourceMoveNameJA: '三連火球ブレス', minTargets: 1, maxTargets: 1, recovery: 1,
        state: 'enraged', cooldown: 42,
        tags: ['projectile', 'elemental', 'fire', 'ground-only', 'multi-hit'],
        monsterAtbCost: 0.68, targeting: { mode: 'center-left-right' }, delivery: 'projectile',
        movement: { ticks: 28 },
        impactTimeline: [
            { atTicks: 17, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 22, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 27, targetMode: 'sequential', damageScale: 1 }
        ],
        animationProfile: 'rathian-triple-fireball', animationDurationMs: 2800, originPart: 'head',
        projectileLaunchDelayTicks: 10,
        brokenPartDamageModifiers: { head: 0.80 },
        brokenPartAccuracyModifiers: { head: 0.75 }
    }],
    ['rathian.fireball_fizzle', '탈진 화염구 불발', 'physical', 0, {
        sourceMoveNameJA: '疲労ブレス不発', maxTargets: 1, recovery: 1,
        state: 'exhausted',
        tags: ['ground-only', 'fire', 'no-impact', 'exhausted-fizzle'],
        monsterAtbCost: 0.38, movement: { ticks: 18 },
        animationProfile: 'rathalos-fireball', animationDurationMs: 1800, originPart: 'head',
        attachedFx: { emoji: '☁️', className: 'breath-fizzle', durationMs: 1800 },
        suppressPrepareAudio: true
    }],
    ['rathian.charge', '돌진', 'charge', 0.29, {
        sourceMoveNameJA: '突進', minTargets: 1, maxTargets: 2, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['charge', 'ground-only', 'target-contact'], monsterAtbCost: 0.52,
        movement: { ticks: 24, untargetable: true }, targeting: { mode: 'adjacent-lane' },
        impact: { visualRatio: 0.30 }, animationProfile: 'rathian-ground-charge', animationDurationMs: 3000
    }],
    ['rathian.triple_charge', '삼연속 돌진', 'charge', 0.30, {
        sourceMoveNameJA: '三連突進', minTargets: 1, maxTargets: 2, windup: 5, recovery: 1,
        state: 'enraged', cooldown: 54, tags: ['charge', 'ground-only', 'multi-hit'],
        monsterAtbCost: 0.82,
        movement: { kind: 'rathian-triple-charge', ticks: 113, untargetable: true },
        targeting: { mode: 'triple-adjacent-passes' },
        impact: { passRatios: [0.12, 0.43, 0.74], completePathOnTargetLoss: true },
        animationProfile: 'ground-charge-triple', animationDurationMs: 9000
    }],
    ['rathian.somersault', '독가시 서머솔트', 'physical', 0.48, {
        sourceMoveNameJA: 'サマーソルト尻尾攻撃', maxTargets: 1, windup: 8, recovery: 1,
        forbiddenStates: ['enraged', 'exhausted'],
        weight: 1.25,
        tags: ['physical', 'poison', 'tail', 'flight-only', 'target-contact', 'strong'],
        monsterAtbCost: 0.72, movement: { ticks: 25 },
        impactTimeline: [{ atTicks: 19, damageScale: 1, audioCue: 'somersault' }],
        animationProfile: 'rathian-somersault', animationDurationMs: 3200,
        originPart: 'tail', statusBlockedWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.70 },
        flightTransition: 'land', flight: { takeoffInterference: null },
        suppressPrepareAudio: true
    }],
    ['rathian.double_somersault', '이단 독가시 서머솔트', 'physical', 0.48, {
        sourceMoveNameJA: 'サマーソルト尻尾攻撃・二連', minTargets: 2, maxTargets: 2,
        windup: 8, recovery: 1, cooldown: 58, state: 'enraged', weight: 0.72,
        tags: ['physical', 'poison', 'tail', 'flight-only', 'target-contact', 'multi-hit', 'strong'],
        monsterAtbCost: 0.86, movement: { ticks: 50 },
        targeting: { mode: 'independent-passes', passCount: 2 },
        impactTimeline: [
            { atTicks: 22, targetMode: 'sequential', damageScale: 1, audioCue: 'somersault' },
            { atTicks: 53, targetMode: 'sequential', damageScale: 1, audioCue: 'somersault' }
        ],
        animationProfile: 'rathian-somersault-double', animationDurationMs: 6400, originPart: 'tail',
        statusBlockedWhenBroken: ['tail'], brokenPartTargetCaps: { tail: 1 },
        brokenPartDamageModifiers: { tail: 0.70 },
        flightTransition: 'land', flight: { takeoffInterference: null },
        suppressPrepareAudio: true
    }],
    ['rathian.bite_somersault', '공중 물어뜯기 연계', 'physical', 0.48, {
        sourceMoveNameJA: '空中噛みつき・サマーソルト', maxTargets: 1, windup: 7, recovery: 1,
        state: 'enraged', weight: 0.38,
        tags: ['physical', 'poison', 'tail', 'flight-only', 'target-contact', 'multi-hit', 'strong'],
        monsterAtbCost: 0.84, movement: { ticks: 55 },
        impactTimeline: [
            { atTicks: 20, damageScale: 0.50, ignoreBrokenPartDamage: true, suppressStatus: true },
            { atTicks: 54, damageScale: 1, audioCue: 'somersault' }
        ],
        animationProfile: 'rathian-bite-somersault', animationDurationMs: 6600,
        originPart: 'tail', statusBlockedWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.70 },
        flightTransition: 'land',
        flight: { takeoffInterference: { kind: 'wind', size: 'small' } },
        suppressPrepareAudio: true
    }],
    ['rathian.somersault_glide', '서머솔트 후 저공 활공', 'physical', 0.48, {
        sourceMoveNameJA: 'サマーソルト・滑空突進', minTargets: 2, maxTargets: 2,
        windup: 8, recovery: 1, state: 'enraged', weight: 0.32,
        tags: ['physical', 'poison', 'tail', 'flight-only', 'target-contact', 'multi-hit', 'strong'],
        monsterAtbCost: 0.88, movement: { ticks: 78, untargetable: true },
        targeting: { mode: 'independent-passes', passCount: 2 },
        impactTimeline: [
            { atTicks: 21, targetMode: 'sequential', damageScale: 1, audioCue: 'somersault' },
            {
                atTicks: 56, targetMode: 'sequential', damageScale: 0.583,
                ignoreBrokenPartDamage: true, suppressStatus: true,
                secondaryInterference: { kind: 'wind', size: 'small', scope: 'adjacent' }
            }
        ],
        animationProfile: 'rathian-somersault-glide', animationDurationMs: 7800,
        originPart: 'tail', statusBlockedWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.70 },
        flightTransition: 'land', flight: { takeoffInterference: null },
        suppressPrepareAudio: true
    }],
    ['rathian.glide', '저공 활공', 'charge', 0.28, {
        sourceMoveNameJA: '滑空突進', minTargets: 1, maxTargets: 1, windup: 6, recovery: 1,
        forbiddenStates: ['enraged', 'exhausted'],
        tags: ['charge', 'flight-only', 'target-contact'], monsterAtbCost: 0.58,
        movement: { ticks: 40, untargetable: true },
        impactTimeline: [{
            atTicks: 33, damageScale: 1,
            secondaryInterference: { kind: 'wind', size: 'small', scope: 'adjacent' }
        }],
        animationProfile: 'rathian-glide', animationDurationMs: 4800,
        flightTransition: 'land',
        flight: { takeoffInterference: { kind: 'wind', size: 'small' } }
    }]
]);

const RATHIAN_WORLD_DISPLAY_NAMES = Object.freeze({
    'rathian.roar': '포효',
    'rathian.bite': '물어뜯기',
    'rathian.tail_sweep': '이단 꼬리 회전',
    'rathian.fireball': '화염구',
    'rathian.triple_fireball': '삼연 화염구',
    'rathian.fireball_fizzle': '탈진 화염구 불발',
    'rathian.charge': '돌진',
    'rathian.triple_charge': '삼연속 돌진',
    'rathian.somersault': '서머솔트',
    'rathian.double_somersault': '이단 서머솔트',
    'rathian.bite_somersault': '공중 물어뜯기 연계',
    'rathian.somersault_glide': '서머솔트 저공 활공',
    'rathian.glide': '저공 활공'
});
HUNT_MONSTER_PATTERN_OVERRIDES.rathian = HUNT_MONSTER_PATTERN_OVERRIDES.rathian.map(pattern => ({
    ...pattern,
    name: RATHIAN_WORLD_DISPLAY_NAMES[pattern.id] || pattern.name
}));

HUNT_MONSTER_PATTERN_OVERRIDES.diablos = pilot('world_iceborne', PILOT_SOURCES.diablos, [
    ['diablos.roar', '포효', 'roar', 0, {
        maxTargets: 4, sourceMoveNameJA: '咆哮', tags: ['roar', 'transition-roar', 'interference-large'],
        weight: 0.12, cooldown: 95, monsterAtbCost: 0.50, interference: { kind: 'roar', size: 'large' }
    }],
    ['diablos.horn_charge', '뿔 돌진', 'charge', 0.40, {
        sourceMoveNameJA: '突進', maxTargets: 3, windup: 7, recovery: 1,
        tags: ['charge', 'horn', 'strong'], monsterAtbCost: 0.70,
        movement: { ticks: 42, untargetable: true },
        targeting: { mode: 'adjacent-lane' },
        chargeLaunchStyle: 'stomp-burst',
        animationProfile: 'ground-charge', animationDurationMs: 3360,
        brokenPartDamageModifiers: { 'left-horn': 0.935, 'right-horn': 0.935 }
    }],
    ['diablos.burrow_enter', '지중 잠행', 'burrow', 0, {
        sourceMoveNameJA: '地中潜行', maxTargets: 1, windup: 5, recovery: 1, cooldown: 56,
        tags: ['burrow', 'burrow-enter'], monsterAtbCost: 0.45,
        secondaryInterference: { kind: 'wind', size: 'small', scope: 'all' },
        phase: { kind: 'burrow', enterVisualMs: 1250, emergeVisualMs: 1450 },
        animationProfile: 'burrow-enter',
        followUp: {
            idSuffix: 'burrow_emerge', name: '지중 급습', type: 'charge', damageRatio: 0.46,
            windupTicks: { normal: 12, enraged: 8 }, activeTicks: 2, recoveryTicks: 1,
            minTargets: 1, maxTargets: 1, monsterAtbCost: 0.75,
            tags: ['charge', 'burrow', 'burrow-emerge', 'locked-target', 'horn', 'strong', 'tremor-large'],
            interference: { kind: 'tremor', size: 'large' },
            secondaryInterference: { kind: 'tremor', size: 'large' },
            animationProfile: 'burrow-emerge'
        },
        brokenPartDamageModifiers: { 'left-horn': 0.89, 'right-horn': 0.89 }
    }],
    ['diablos.horn_uppercut', '뿔 쳐올리기', 'physical', 0.37, {
        sourceMoveNameJA: '角振り上げ', maxTargets: 1, recovery: 1,
        tags: ['physical', 'horn', 'target-contact'], monsterAtbCost: 0.45,
        movement: { ticks: 28 },
        impact: { delayRatio: 0.57 },
        animationProfile: 'horn-uppercut',
        brokenPartDamageModifiers: { 'left-horn': 0.931, 'right-horn': 0.931 }
    }],
    ['diablos.horn_sweep', '연속 뿔 휘두르기', 'area', 0.39, {
        sourceMoveNameJA: '連続角振り', minTargets: 2, maxTargets: 3, cooldown: 42, recovery: 1,
        tags: ['area', 'horn', 'multi-hit', 'target-contact'], monsterAtbCost: 0.70,
        movement: { ticks: 34 },
        impactTimeline: [
            { atTicks: 14, damageScale: 0.54 },
            { atTicks: 25, damageScale: 0.54 }
        ],
        targeting: { mode: 'lane' },
        animationProfile: 'horn-sweep-contact',
        brokenPartDamageModifiers: { 'left-horn': 0.817, 'right-horn': 0.817 }
    }],
    ['diablos.tail_sweep', '꼬리 휘두르기', 'area', 0.30, {
        sourceMoveNameJA: '尻尾振り', minTargets: 2, maxTargets: 2, recovery: 1,
        tags: ['area', 'tail', 'target-contact', 'charge-follow-up'], monsterAtbCost: 0.65,
        requiresPreviousPattern: 'diablos.horn_charge', weight: 4,
        movement: { ticks: 32 }, targeting: { mode: 'lane' },
        impactTimeline: [{ atTicks: 14 }, { atTicks: 24 }],
        animationProfile: 'diablos-tail-cross', animationDurationMs: 3200,
        animationGeometry: { approachX: 0.15, approachY: 0.15 },
        brokenPartTargetCaps: { tail: 1 }, brokenPartDamageModifiers: { tail: 0.76 }
    }],
    ['diablos.rage_charge', '분노 연속 돌진', 'charge', 0.45, {
        sourceMoveNameJA: '怒り連続突進', minTargets: 2, maxTargets: 4, windup: 8, recovery: 1,
        cooldown: 65, state: 'enraged', tags: ['charge', 'horn', 'cross-charge', 'multi-hit'],
        monsterAtbCost: 0.80,
        movement: { kind: 'diablos-return-charge', ticks: 133, untargetable: true },
        targeting: { mode: 'return-adjacent-passes' },
        impact: {
            // One telegraph owns both passes. Resolve defense only as each
            // off-board traversal physically crosses its locked hunter lane.
            passRatios: [0.357, 0.773],
            completePathOnTargetLoss: true
        },
        chargeLaunchStyle: 'stomp-burst',
        animationProfile: 'ground-charge-double', animationDurationMs: 10640,
        whiffReaction: {
            pass: 'last', result: 'dodge',
            disabledWhenAllBroken: ['left-horn', 'right-horn'],
            kind: 'knockdown'
        },
        brokenPartDamageModifiers: { 'left-horn': 0.906, 'right-horn': 0.906 }
    }]
]);

// Diablos charges occupy a narrow card lane: one primary hunter and, at most,
// one immediately adjacent hunter. Black Diablos inherits the same geometry.
HUNT_MONSTER_PATTERN_OVERRIDES.diablos
    .filter(pattern => pattern.id.endsWith('.horn_charge') || pattern.id.endsWith('.rage_charge'))
    .forEach(pattern => {
        pattern.minTargets = 1;
        pattern.maxTargets = 2;
    });

HUNT_MONSTER_PATTERN_OVERRIDES.diablos.splice(-1, 0, huntPattern(
    'diablos.tail_slam_rock',
    '꼬리 내려찍기·바위 날리기',
    'projectile',
    0.35,
    {
        sourceGame: 'world_iceborne',
        sourceMoveNameJA: '尻尾たたきつけ・岩飛ばし',
        sourceUrl: PILOT_SOURCES.diablos,
        minTargets: 2,
        maxTargets: 2,
        windup: 5,
        recovery: 1,
        cooldown: 38,
        tags: ['tail', 'tail-slam-rock', 'projectile'],
        delivery: 'projectile',
        projectileVisual: 'rock',
        monsterAtbCost: 0.60,
        movement: { ticks: 34 },
        targeting: { mode: 'lane' },
        animationProfile: 'tail-slam-rock',
        impactTimeline: [
            { atTicks: 16, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 27, targetMode: 'sequential', damageScale: 1.114, audioCue: 'rock' }
        ],
        brokenPartTargetCaps: { tail: 1 },
        brokenPartDamageModifiers: { tail: 0.76 },
        evidence: 'verified-complete-action',
        confidence: 'cross-checked-behavior'
    }
));
HUNT_MONSTER_PATTERN_OVERRIDES.diablos.splice(-1, 0,
    huntPattern('diablos.bite', '물어뜯기', 'physical', 0.18, {
        sourceGame: 'world_iceborne',
        sourceMoveNameJA: '噛み付き',
        sourceUrl: PILOT_SOURCES.diablos,
        recovery: 1,
        cooldown: 22,
        tags: ['physical', 'bite', 'weak'],
        monsterAtbCost: 0.32,
        evidence: 'verified-complete-action',
        confidence: 'cross-checked-behavior'
    }),
    huntPattern('diablos.side_tackle', '철산고', 'physical', 0.30, {
        sourceGame: 'world_iceborne',
        sourceMoveNameJA: 'サイドタックル',
        sourceUrl: PILOT_SOURCES.diablos,
        minTargets: 2,
        maxTargets: 2,
        windup: 4,
        recovery: 1,
        cooldown: 32,
        tags: ['physical', 'side-tackle', 'target-contact'],
        monsterAtbCost: 0.54,
        movement: { ticks: 30 },
        targeting: { mode: 'lane' },
        animationProfile: 'side-tackle-contact',
        targetDamageRatios: [0.30, 0.15],
        brokenPartTargetCaps: { tail: 1 },
        evidence: 'verified-complete-action',
        confidence: 'cross-checked-behavior'
    })
);

HUNT_MONSTER_PATTERN_OVERRIDES.diablos = HUNT_MONSTER_PATTERN_OVERRIDES.diablos.map(pattern =>
    pattern.id === 'diablos.tail_sweep'
        ? { ...pattern, name: '후방 X자 꼬리치기' }
        : pattern
);

// Black Diablos shares the verified body-plan mechanics, but keeps a separate,
// more aggressive kit instead of inheriting normal Diablos tuning.
HUNT_MONSTER_PATTERN_OVERRIDES.black_diablos = HUNT_MONSTER_PATTERN_OVERRIDES.diablos.map(pattern => ({
    ...pattern,
    id: pattern.id.replace(/^diablos\./, 'black_diablos.'),
    damageRatio: Math.min(0.62, Number((Number(pattern.damageRatio || 0) * 1.1).toFixed(3))),
    targetDamageRatios: Array.isArray(pattern.targetDamageRatios)
        ? pattern.targetDamageRatios.map(ratio => Math.min(0.62, Number((Number(ratio) * 1.1).toFixed(3))))
        : pattern.targetDamageRatios,
    windupTicks: Math.max(1, Math.round(Number(pattern.windupTicks || 1) * 0.84)),
    cooldownTicks: Math.max(18, Math.round(Number(pattern.cooldownTicks || 30) * 0.78)),
    monsterAtbCost: Math.max(0.2, Number(pattern.monsterAtbCost || 0.45) * 0.88),
    weight: pattern.tags?.includes('charge') || pattern.tags?.includes('burrow-enter')
        ? Number(pattern.weight || 1) * 1.35
        : pattern.weight,
    sourceGame: 'world_iceborne',
    sourceUrl: pattern.sourceUrl,
    evidence: 'web-reference:variant-specific-review',
    confidence: 'variant-curated',
    runtimePolicy: 'reviewed-variant-kit'
}));

// World/Iceborne Flying Wyvern completion batch.
// These profiles use installed World action classes plus the reviewed Japanese
// move references recorded in data/hunt/research/world-iceborne-flying-wyverns.json.
const WORLD_FLYING_REVIEW = 'data/hunt/research/world-iceborne-flying-wyverns.json';
const worldFlying = definitions => huntProfile('world_iceborne', definitions.map(definition => {
    const options = definition[4] || {};
    return [...definition.slice(0, 4), {
        evidence: 'world-installed-action+ja-web-review',
        confidence: 'cross-checked-behavior',
        sourceUrl: options.sourceUrl || WORLD_FLYING_REVIEW,
        ...options
    }];
}));
const worldVariant = (baseId, variantId, damageMultiplier, extras = [], transform = pattern => pattern) => {
    HUNT_MONSTER_PATTERN_OVERRIDES[variantId] = [
        ...HUNT_MONSTER_PATTERN_OVERRIDES[baseId].map(pattern => transform({
            ...pattern,
            id: pattern.id.replace(`${baseId}.`, `${variantId}.`),
            damageRatio: Math.min(.68, Number((Number(pattern.damageRatio || 0) * damageMultiplier).toFixed(3))),
            sourceGame: 'world_iceborne',
            sourceUrl: WORLD_FLYING_REVIEW,
            evidence: `world-variant-review:${baseId}`,
            confidence: 'variant-curated'
        })),
        ...worldFlying(extras)
    ];
};

HUNT_MONSTER_PATTERN_OVERRIDES.legiana = worldFlying([
    ['legiana.roar', '포효', 'roar', 0, {
        maxTargets: 4, actionClass: 'Roar', tags: ['roar', 'transition-roar'], weight: .12,
        interference: { kind: 'roar', size: 'large' }, monsterAtbCost: .50
    }],
    ['legiana.bite', '깨물기', 'physical', .27, {
        maxTargets: 1, actionClass: 'Bite', tags: ['physical', 'ground-only', 'target-contact', 'weak'],
        windup: 2, monsterAtbCost: .30, maxConsecutiveUses: 3,
        movement: { ticks: 14, returnsToOrigin: true, returnTicks: 8 }, impact: { delayRatio: .56 },
        animationProfile: 'legiana-hop-strike', animationDurationMs: 1400
    }],
    ['legiana.hop_claw', '도약 발톱치기', 'physical', .30, {
        maxTargets: 1, actionClass: 'SideAttackL/SideAttackR',
        tags: ['physical', 'ground-only', 'target-contact', 'weak', 'claw'], originPart: 'claw',
        windup: 2, monsterAtbCost: .32, maxConsecutiveUses: 3,
        movement: { ticks: 15, returnsToOrigin: true, returnTicks: 8 }, impact: { delayRatio: .54 },
        animationProfile: 'legiana-hop-strike', animationDurationMs: 1500
    }],
    ['legiana.ground_charge', '지상 돌진', 'charge', .34, {
        minTargets: 1, maxTargets: 2, actionClass: 'Rush',
        tags: ['charge', 'ground-only', 'target-contact'], monsterAtbCost: .52,
        targeting: { mode: 'adjacent-lane' }, movement: { ticks: 30, returnsToOrigin: true, returnTicks: 14 },
        impact: { delayRatio: .50 }, animationProfile: 'ground-charge', animationDurationMs: 2600
    }],
    ['legiana.tail_spin', '지상 꼬리 회전', 'area', .31, {
        minTargets: 1, maxTargets: 2, actionClass: 'TailAttack',
        tags: ['area', 'tail', 'ground-only', 'target-contact'], monsterAtbCost: .48,
        targeting: { mode: 'adjacent-lane' }, brokenPartDamageModifiers: { tail: .7 },
        brokenPartTargetCaps: { tail: 1 }, animationProfile: 'tail-sweep', animationDurationMs: 2200,
        originPart: 'tail'
    }],
    ['legiana.aerial_claw', '공중 발톱 공격', 'physical', .30, {
        maxTargets: 1, actionClass: 'VerticalKickFly',
        tags: ['flight-only', 'physical', 'target-contact', 'weak', 'aerial-reposition', 'claw'], originPart: 'claw',
        windup: 2, monsterAtbCost: .42, maxConsecutiveUses: 3,
        targeting: { avoidPreviousTargetOnRepeat: true },
        movement: { ticks: 18, returnsToOrigin: true, returnTicks: 10 }, impact: { delayRatio: .56 },
        animationProfile: 'aerial-dive', animationDurationMs: 1800
    }],
    ['legiana.aerial_cold_sweep', '냉기 휩쓸기', 'area', .36, {
        minTargets: 1, maxTargets: 3, actionClass: 'ChillAttackFly',
        tags: ['flight-only', 'area', 'ice', 'elemental', 'weak', 'aerial-reposition'],
        delivery: 'gas', originPart: 'body',
        targeting: { mode: 'primary-adjacent-both', avoidPreviousTargetOnRepeat: true },
        monsterAtbCost: .54, maxConsecutiveUses: 3, windup: 4, fixedWindup: true,
        telegraphFx: { emoji: '❄️', className: 'legiana-ice-charge', durationMs: 800 },
        animationProfile: 'lateral-sweep', animationDurationMs: 2200
    }],
    ['legiana.cold_tail_slam', '냉기 꼬리 내려찍기', 'area', .48, {
        minTargets: 1, maxTargets: 3, actionClass: 'TailAttackFly',
        tags: ['flight-only', 'area', 'tail', 'ice', 'elemental', 'strong', 'aerial-reposition'],
        delivery: 'gas', originPart: 'tail', targeting: { mode: 'primary-adjacent-both' },
        targetDamageRatios: [.48, .24, .24], monsterAtbCost: .68, windup: 5, fixedWindup: true,
        telegraphFx: { emoji: '❄️', className: 'legiana-ice-charge', durationMs: 800 },
        animationProfile: 'aerial-dive', animationDurationMs: 2500
    }],
    ['legiana.drill_cross', '회전 급강하', 'charge', .54, {
        minTargets: 1, maxTargets: 4, actionClass: 'HoverRushF2F',
        tags: ['flight-only', 'charge', 'wide-charge', 'screen-crossing', 'ice', 'elemental', 'strong', 'aerial-reposition'],
        targeting: { mode: 'screen-sweep' }, chargeMode: 'wide', monsterAtbCost: .82,
        delivery: 'attached',
        windup: 6, fixedWindup: true, movement: { ticks: 32, untargetable: true },
        impact: { delayRatio: .58, contactLeadRatio: .28 },
        animationProfile: 'legiana-drill-cross', animationDurationMs: 3000,
        telegraphFx: { emoji: '❄️', className: 'legiana-ice-charge', durationMs: 700 }
    }],
    ['legiana.dive_landing', '강한 발톱 착지', 'charge', .46, {
        maxTargets: 1, actionClass: 'HoverRushG2F',
        tags: ['flight-only', 'charge', 'target-contact', 'strong', 'landing-only', 'claw'], originPart: 'claw',
        flightTransition: 'land', chargeMode: 'single', monsterAtbCost: .72,
        postActionRecoverySeconds: 2, movement: { ticks: 26 }, impact: { delayRatio: .60 },
        animationProfile: 'aerial-dive', animationDurationMs: 2800
    }]
]);

worldVariant('legiana', 'shrieking_legiana', 1.08, [
    ['shrieking_legiana.ice_ring_dive', '빙결 고리 급강하', 'area', .45, {
        minTargets: 2, maxTargets: 4, actionClass: 'HoverRushF2F', requiredState: 'enraged',
        tags: ['flight-only', 'area', 'ice', 'elemental', 'multi-hit'], delivery: 'ground-wave',
        cooldown: 62, windup: 10, recovery: 14
    }]
], pattern => ({
    ...pattern,
    maxConsecutiveUses: pattern.tags?.includes('flight-only') ? 2 : pattern.maxConsecutiveUses,
    monsterAtbCostMultiplier: .92
}));

HUNT_MONSTER_PATTERN_OVERRIDES.paolumu = worldFlying([
    ['paolumu.roar', '포효', 'roar', 0, { maxTargets: 4, actionClass: 'Roar', tags: ['roar'], weight: .18 }],
    ['paolumu.tail_sweep', '꼬리 휘두르기', 'area', .25, {
        maxTargets: 2, actionClass: 'TailAttack', tags: ['area', 'tail'], brokenPartDamageModifiers: { tail: .7 }, brokenPartTargetCaps: { tail: 1 }
    }],
    ['paolumu.air_blast', '압축 공기탄', 'projectile', .27, {
        maxTargets: 2, actionClass: 'AirBreathFly', tags: ['flight-only', 'projectile', 'wind'], delivery: 'projectile'
    }],
    ['paolumu.hover_charge', '부유 몸통박치기', 'charge', .32, {
        maxTargets: 2, actionClass: 'MidDistKickFly', tags: ['flight-only', 'charge', 'target-contact'],
        chargeMode: 'single', movement: { ticks: 24, returnsToOrigin: true, returnTicks: 15 }, impact: { delayRatio: .64 }
    }],
    ['paolumu.air_slam', '공기주머니 내려찍기', 'area', .38, {
        minTargets: 2, maxTargets: 3, actionClass: 'AirBreathFromGlide', tags: ['flight-only', 'area', 'wind', 'landing-only'],
        flightTransition: 'land', secondaryInterference: { kind: 'wind-small' }, animationProfile: 'aerial-slam'
    }]
]);

worldVariant('paolumu', 'nightshade_paolumu', 1.06, [
    ['nightshade_paolumu.sleep_cloud', '수면 가스 구름', 'area', .18, {
        minTargets: 2, maxTargets: 4, actionClass: 'EcoSleepBreath', tags: ['flight-only', 'area', 'sleep', 'gas'],
        delivery: 'gas', attachedFx: { emoji: '💤', className: 'sleep-cloud', durationMs: 4200 }, cooldown: 40
    }],
    ['nightshade_paolumu.sleep_dive', '수면 구름 급강하', 'charge', .36, {
        maxTargets: 3, actionClass: 'AirBreathFly2', tags: ['flight-only', 'charge', 'sleep', 'gas'],
        delivery: 'gas', chargeMode: 'wide', cooldown: 54
    }]
], pattern => ({
    ...pattern,
    tags: (pattern.tags || []).filter(tag => tag !== 'wind')
}));

worldVariant('bazelgeuse', 'seething_bazelgeuse', 1.08, [
    ['seething_bazelgeuse.purple_scale_barrage', '보라빛 폭린 융단폭격', 'projectile', .43, {
        minTargets: 2, maxTargets: 4, actionClass: 'BombGlide', requiredState: 'enraged',
        tags: ['flight-only', 'projectile', 'blast', 'scale', 'heated-scale', 'multi-hit'], delivery: 'projectile',
        cooldown: 58, windup: 9, recovery: 14
    }],
    ['seething_bazelgeuse.diving_explosion', '홍련 폭린 급강하', 'area', .58, {
        minTargets: 3, maxTargets: 4, actionClass: 'TailAttackTripleStartRedRelease', requiredState: 'enraged',
        tags: ['flight-only', 'area', 'blast', 'scale', 'heated-scale', 'landing-only'], flightTransition: 'land',
        cooldown: 90, windup: 14, recovery: 18, animationProfile: 'aerial-dive-explosion'
    }]
], pattern => ({
    ...pattern,
    tags: [...new Set([...(pattern.tags || []), pattern.tags?.includes('scale') ? 'heated-scale' : null].filter(Boolean))],
    weightWhenBroken: pattern.tags?.includes('scale') ? { head: .6, tail: .6 } : pattern.weightWhenBroken
}));

const TIGREX_ANCHORS = Object.freeze({
    mouth: Object.freeze({ x: .43, y: .72 }),
    rightFrontLeg: Object.freeze({ x: .72, y: .70 }),
    leftFrontLeg: Object.freeze({ x: .25, y: .28 }),
    tail: Object.freeze({ x: .62, y: .28 })
});

function tigrexChargeBranch(id, branchKind, branchLabel, weightByState, normalFinal, enragedFinal) {
    const branchProfile = branchKind === 'rock' ? 'tigrex-rock-hop'
        : branchKind === 'spin' ? 'tigrex-sliding-spin'
            : 'tigrex-running-double-bite';
    const branchScale = branchKind === 'rock' ? .75 : branchKind === 'spin' ? 1.25 : .625;
    const finalEvent = (tick, secondBite = false) => ({
        atTicks: tick,
        damageScale: branchScale,
        targetMode: 'repeat-previous',
        targetShape: secondBite ? null
            : branchKind === 'rock' ? 'center-left-right'
                : branchKind === 'spin' ? 'primary-adjacent-both' : null,
        eventKind: `tigrex-${branchKind}${secondBite ? '-second' : ''}`,
        displayName: branchLabel,
        animationProfile: branchProfile,
        animationDurationMs: branchKind === 'spin' ? 2000 : branchKind === 'rock' ? 2200 : 1800,
        animationImpactRatio: branchKind === 'rock' ? .70 : branchKind === 'spin' ? .52 : .34,
        audioCue: secondBite ? null : 'tigrex-final-vocal'
    });
    const normalTimeline = [
        { atTicks: 15, damageScale: 1, eventKind: 'tigrex-charge-pass' },
        { atTicks: 42, damageScale: 1, eventKind: 'tigrex-charge-return' },
        finalEvent(normalFinal)
    ];
    const enragedTimeline = [
        { atTicks: 14, damageScale: 1, eventKind: 'tigrex-charge-pass' },
        { atTicks: 34, damageScale: 1, eventKind: 'tigrex-charge-return' },
        finalEvent(enragedFinal)
    ];
    const exhaustedTimeline = [
        { atTicks: 28, damageScale: 1, eventKind: 'tigrex-charge-pass' },
        {
            atTicks: 58,
            damageScale: 0,
            eventKind: 'tigrex-exhausted-trip',
            displayName: '돌진 실족',
            animationProfile: 'tigrex-exhausted-trip',
            animationDurationMs: 5000
        }
    ];
    if (branchKind === 'bite') {
        normalTimeline.push(finalEvent(normalFinal + 5, true));
        enragedTimeline.push(finalEvent(enragedFinal + 5, true));
    }
    return ['tigrex.charge_' + id, '연속 돌진', 'charge', .40, {
        maxTargets: 1,
        actionClass: branchKind === 'rock' ? 'AfterRushRockLauncher'
            : branchKind === 'spin' ? 'AfterRushSpin' : 'AfterRushBite',
        tags: ['charge', 'multi-hit', 'ground-only', 'strong', 'tigrex-charge-chain'],
        weightByState,
        cooldown: 1,
        maxConsecutiveUses: 99,
        monsterAtbCost: branchKind === 'spin' ? 1 : branchKind === 'rock' ? .95 : .88,
        postActionRecoverySeconds: branchKind === 'rock' ? 3 : branchKind === 'spin' ? 3 : 1,
        staminaCostProfile: 'timeline-atb',
        // Two collision passes, followed by a third charge-speed approach that
        // brakes in front of the hunter and branches without passing through.
        targeting: { mode: 'independent-passes', passCountByState: { normal: 2, enraged: 2, exhausted: 2 } },
        movement: { kind: 'tigrex-charge-chain', ticks: 100, ticksByState: { normal: 100, enraged: 86, exhausted: 92 }, untargetable: true },
        impactTimelineByState: { normal: normalTimeline, enraged: enragedTimeline, exhausted: exhaustedTimeline },
        animationProfile: 'tigrex-charge-chain',
        animationDurationMs: 8500,
        projectileVisual: branchKind === 'rock' ? 'rock' : null,
        projectileEventKinds: branchKind === 'rock' ? ['tigrex-rock'] : null,
        originPart: branchKind === 'rock' ? 'lower-front-leg' : null,
        branchKind,
        branchLabel,
        visualAnchors: TIGREX_ANCHORS,
        stateMachine: {
            normalPasses: 2,
            enragedPasses: 3,
            exhaustedPasses: 2,
            firstTelegraphMs: 1000,
            passDurationMs: 2500,
            enragedSpeedMultiplier: 1.20,
            offscreenGapMs: 600,
            enragedOffscreenGapMs: 400,
            finalApproachDealsDamage: false,
            exhaustedReturnTrip: { beforeImpact: true, recoveryMs: 5000 },
            secondReturnDodgeStuck: { chance: .30, recoveryMs: 7000 }
        }
    }];
}

HUNT_MONSTER_PATTERN_OVERRIDES.tigrex = worldFlying([
    ['tigrex.roar', '포효', 'roar', .40, {
        maxTargets: 4, actionClass: 'Roar', tags: ['roar', 'sonic', 'combat-roar', 'strong', 'ground-only'],
        state: 'enraged', interference: { kind: 'roar-large', directHitSupersedes: true },
        cooldown: 150, weight: .25, maxConsecutiveUses: 99, monsterAtbCost: .50,
        postActionRecoverySeconds: 1.5, animationDurationMs: 2500,
        directDamageScope: 'engaged-melee', brokenPartDamageModifiers: { head: .75 },
        roarVisual: 'sonic-impact',
        visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.foreleg_slam', '앞발 내려찍기', 'physical', .25, {
        maxTargets: 1, actionClass: 'FootAttack', tags: ['physical', 'target-contact', 'weak', 'ground-only'],
        cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .32,
        postActionRecoverySeconds: 1, movement: { ticks: 20, returnsToOrigin: true },
        impact: { visualRatio: .56 }, animationProfile: 'tigrex-foreleg-slam', animationDurationMs: 2000,
        partUse: { mode: 'random-front-leg', brokenDamageMultiplier: .70 }, visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.bite', '깨물기', 'physical', .25, {
        maxTargets: 1, actionClass: 'Bite', tags: ['physical', 'target-contact', 'weak', 'ground-only'],
        cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .34,
        postActionRecoverySeconds: 1, movement: { ticks: 22, returnsToOrigin: true },
        impact: { visualRatio: .58 }, brokenPartDamageModifiers: { head: .75 },
        animationProfile: 'tigrex-bite', animationDurationMs: 1800, visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.double_bite', '연속 깨물기', 'physical', .25, {
        maxTargets: 1, actionClass: 'DoubleBite', tags: ['physical', 'target-contact', 'weak', 'multi-hit', 'ground-only'],
        cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .42,
        postActionRecoverySeconds: 1.5, movement: { ticks: 30, returnsToOrigin: true },
        impactTimeline: [{ atTicks: 10 }, { atTicks: 15 }],
        brokenPartDamageModifiers: { head: .75 }, animationProfile: 'tigrex-double-bite', animationDurationMs: 2400, visualAnchors: TIGREX_ANCHORS
    }],
    ...[
        tigrexChargeBranch('rock', 'rock', '바위 날리기', { normal: .0875, enraged: .0375, exhausted: .0875 }, 78, 80),
        tigrexChargeBranch('spin', 'spin', '전신 회전', { normal: .0625, enraged: .1375, exhausted: .0625 }, 78, 80),
        tigrexChargeBranch('bite', 'bite', '연속 깨물기', { normal: .10, enraged: .075, exhausted: .10 }, 78, 80)
    ],
    ['tigrex.spin', '전신 회전', 'area', .50, {
        minTargets: 1, maxTargets: 3, actionClass: 'SpinAttack', tags: ['area', 'tail', 'strong', 'ground-only'],
        cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .62,
        postActionRecoverySeconds: 3, targeting: { mode: 'primary-adjacent-both' },
        impact: { visualRatio: .82 },
        brokenPartTargetCaps: { tail: 2 }, animationProfile: 'tigrex-clockwise-spin', animationDurationMs: 1540,
        visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.rock_shot', '바위 날리기', 'projectile', .30, {
        minTargets: 3, maxTargets: 3, actionClass: 'RockLauncher', tags: ['projectile', 'strong', 'ground-only'],
        delivery: 'projectile', cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .48,
        projectileVisual: 'rock',
        originPart: 'lower-front-leg',
        postActionRecoverySeconds: 3, targeting: { mode: 'primary-adjacent-both' },
        impact: { visualRatio: .55 }, animationDurationMs: 2200,
        brokenPartTargetCaps: { 'right-front-leg': 1 }, partUse: { fixed: 'right-front-leg' },
        habitatVariants: { snow: 'ice', volcanic: 'fire', wet: 'water', default: 'raw' },
        animationProfile: 'tigrex-rock-shot', visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.leap', '도약 덮치기', 'charge', .50, {
        maxTargets: 1, actionClass: 'JumpAttack', tags: ['charge', 'target-contact', 'strong', 'ground-only'],
        chargeMode: 'single', cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .58,
        postActionRecoverySeconds: 3, movement: { ticks: 24, returnsToOrigin: true, returnTicks: 15 },
        impact: { visualRatio: .68 }, animationProfile: 'tigrex-leap', animationDurationMs: 2400, visualAnchors: TIGREX_ANCHORS
    }]
]);

worldVariant('tigrex', 'brute_tigrex', 1.08, [
    ['brute_tigrex.charge_roar', '돌진 급정지 포효', 'area', .36, {
        minTargets: 2, maxTargets: 4, actionClass: 'AfterRushSuperRoarR', tags: ['area', 'roar', 'sonic', 'combat-roar', 'charge-chain'],
        interference: { kind: 'roar-large' }, cooldown: 44
    }],
    ['brute_tigrex.sweeping_roar', '전방 휩쓸기 포효', 'area', .46, {
        minTargets: 2, maxTargets: 4, actionClass: 'AfterRushMaxRoar', requiredState: 'enraged',
        tags: ['area', 'roar', 'sonic', 'combat-roar'], interference: { kind: 'roar-large' }, delivery: 'cone',
        cooldown: 66, windup: 10, recovery: 15
    }]
], pattern => ({
    ...pattern,
    weight: pattern.tags?.includes('roar') ? Number(pattern.weight || 1) * 1.55 : pattern.weight
}));

// 나르가쿠르가 — 흑속의 신속형. 모션 리듬은 표범(웅크림 → 휙! → 착지).
//
// 스탠스: 평상시에는 근접/원거리 모드가 30초마다 번갈아 돌아가고, 그 전환은
// 견제 도약(stance-switch)이 강제 선택되며 이뤄진다. 패턴이 어느 모드에 속하는지는
// stance-melee / stance-ranged 태그로만 표기한다(공유 코드에 몬스터 id 분기 금지).
// 태그가 없는 패턴(포효 등)은 양쪽 모드 공용이다.
// 분노 상태에서는 모드를 무시하고 분노 패턴 전체에서 무작위로 고른다.
//
// 시그니처는 "도약 칼날깃 급습": 화면 밖으로 도약해 사라진 뒤 측면·후면에서
// 한 팔을 내밀며 파고든다. 분노에서는 이탈→공격을 3회 반복하는 연속기가 된다.
//
// 모든 impactTimeline의 atTicks는 movement.ticks 이내여야 한다
// (monster-timing-unification-plan.md INV-2).
HUNT_MONSTER_PATTERN_OVERRIDES.nargacuga = pilot('world_iceborne',
    'https://monsterhunterrise.wiki.fextralife.com/Nargacuga', [
    ['nargacuga.roar', '포효', 'roar', 0, {
        maxTargets: 4, sourceMoveNameJA: '咆哮', tags: ['roar', 'transition-roar'],
        weight: 0.13, cooldown: 88, monsterAtbCost: 0.44
    }],

    // ── 평상시 · 근접 모드 ──────────────────────────────────────────────────
    ['nargacuga.quick_bite', '재빠른 물어뜯기', 'physical', 0.26, {
        sourceMoveNameJA: '噛みつき', maxTargets: 1, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['physical', 'ground-only', 'target-contact', 'weak', 'stance-melee'],
        monsterAtbCost: 0.30, movement: { ticks: 16 },
        impactTimeline: [{ atTicks: 11, damageScale: 1 }],
        animationProfile: 'nargacuga-dash-bite', animationDurationMs: 1600,
        originPart: 'head', maxConsecutiveUses: 2,
        brokenPartDamageModifiers: { head: 0.82 }
    }],
    // 꼬리는 상단에서 좌상단(←)을 향해 뻗어 있다. 그 꼬리로 찌르듯 135도 반시계로
    // 쫀득하게 돌려 꽂고, 같은 경로를 역회전으로 되짚어 복귀한다.
    ['nargacuga.tail_whip', '꼬리 후려치기', 'area', 0.30, {
        sourceMoveNameJA: '尻尾薙ぎ払い', minTargets: 2, maxTargets: 3, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['area', 'tail', 'ground-only', 'target-contact', 'stance-melee'],
        monsterAtbCost: 0.52, movement: { ticks: 24 },
        targeting: { mode: 'left-right-halves' },
        impactTimeline: [{ atTicks: 15, damageScale: 1 }],
        animationProfile: 'nargacuga-tail-whip', animationDurationMs: 2400,
        originPart: 'tail', statusBlockedWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.68 }
    }],
    // 오른팔을 축으로 삼으면 좌회전, 왼팔이면 우회전. 1회전.
    ['nargacuga.tail_sweep', '꼬리 회전', 'area', 0.34, {
        sourceMoveNameJA: '尻尾回転', minTargets: 2, maxTargets: 3, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['area', 'tail', 'ground-only', 'target-contact', 'stance-melee'],
        monsterAtbCost: 0.62, movement: { ticks: 26 },
        targeting: { mode: 'adjacent-pair-pivot' },
        impactTimeline: [{ atTicks: 18, damageScale: 1 }],
        animationProfile: 'nargacuga-pivot-spin', animationDurationMs: 2600,
        originPart: 'tail',
        brokenPartDamageModifiers: { tail: 0.68 }
    }],
    // 분노판과 같은 내려찍기지만 1회. 꼬리가 땅에 박혀 3초(30틱) 후딜을 갖는다.
    ['nargacuga.spiked_tail_slam', '가시 꼬리 내려찍기', 'physical', 0.47, {
        sourceMoveNameJA: '棘尻尾叩きつけ', maxTargets: 1, windup: 9, recovery: 30,
        forbiddenStates: ['enraged'],
        tags: ['physical', 'tail', 'target-contact', 'strong', 'stance-melee'],
        monsterAtbCost: 0.72, movement: { ticks: 30 },
        impactTimeline: [{ atTicks: 22, damageScale: 1 }],
        animationProfile: 'nargacuga-turn-tail-slam', animationDurationMs: 3000,
        originPart: 'tail',
        whiffReaction: { kind: 'stuck', durationTicks: 30 },
        statusBlockedWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.65 }
    }],

    // ── 평상시 · 원거리 모드 ────────────────────────────────────────────────
    // 측면으로 도약한 뒤 표적 방향으로 화면 밖까지 꿰뚫는다.
    ['nargacuga.cutwing_barrage', '칼날깃 연격', 'charge', 0.34, {
        sourceMoveNameJA: '斬翅連撃', minTargets: 1, maxTargets: 2, windup: 6, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['charge', 'ground-only', 'target-contact', 'stance-ranged'],
        monsterAtbCost: 0.58, movement: { ticks: 34, untargetable: true },
        targeting: { mode: 'adjacent-lane' },
        impactTimeline: [{ atTicks: 24, damageScale: 1 }],
        animationProfile: 'nargacuga-flank-charge', animationDurationMs: 3400,
        brokenPartDamageModifiers: { 'left-wing': 0.78, 'right-wing': 0.78 }
    }],
    // 시그니처. 화면 밖으로 도약해 사라진 뒤 측면·후면에서 한 팔을 내밀며 파고든다.
    ['nargacuga.leaping_cutwing', '도약 칼날깃 급습', 'charge', 0.42, {
        sourceMoveNameJA: '跳躍斬翅', minTargets: 1, maxTargets: 1, windup: 8, recovery: 1,
        forbiddenStates: ['enraged'], cooldown: 46, weight: 1.15,
        tags: ['charge', 'ambush', 'vanish', 'target-contact', 'strong', 'stance-ranged'],
        monsterAtbCost: 0.74,
        movement: { ticks: 40, untargetable: true },
        impactTimeline: [{ atTicks: 29, damageScale: 1 }],
        animationProfile: 'nargacuga-leap-ambush', animationDurationMs: 4000,
        originPart: 'left-wing',
        brokenPartDamageModifiers: { 'left-wing': 0.76, 'right-wing': 0.76 }
    }],
    // 화면 밖으로 빠진 뒤 돌진 모션으로 되돌아온다.
    ['nargacuga.lunge_chain', '연속 런지 돌진', 'charge', 0.35, {
        sourceMoveNameJA: '連続突進', minTargets: 1, maxTargets: 2,
        windup: 6, recovery: 1, forbiddenStates: ['enraged'], cooldown: 40,
        tags: ['charge', 'ground-only', 'target-contact', 'stance-ranged'],
        monsterAtbCost: 0.70,
        movement: { ticks: 42, untargetable: true },
        impactTimeline: [{ atTicks: 31, damageScale: 1 }],
        animationProfile: 'nargacuga-offscreen-charge', animationDurationMs: 4200
    }],
    ['nargacuga.quill_shot', '가시깃 사출', 'projectile', 0.33, {
        sourceMoveNameJA: '棘飛ばし', minTargets: 1, maxTargets: 3, windup: 5, recovery: 1,
        tags: ['projectile', 'tail', 'bleed', 'ground-hazard', 'stance-ranged'],
        monsterAtbCost: 0.48,
        delivery: 'projectile', movement: { ticks: 26 },
        projectileLaunchDelayTicks: 9,
        impactTimeline: [
            { atTicks: 15, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 23, targetMode: 'sequential', damageScale: 0.80 }
        ],
        animationProfile: 'ranged-cast', animationDurationMs: 2600,
        originPart: 'tail',
        // 가시깃은 던지는 칼날이다. 카드 다이아 기호를 CSS에서 남색으로 칠해 쓴다.
        attachedFx: { emoji: '♦', className: 'tail-spikes', durationMs: 2600 },
        forbiddenWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.70 }
    }],

    // ── 모드 전환 ───────────────────────────────────────────────────────────
    // 30초마다 강제 선택되어 근접↔원거리 모드를 바꾼다. 화면 밖으로 도약해 사라졌다가
    // 제자리에 Fade in으로 돌아오며, 좌/우를 무작위로 골라 2회 연속으로 뛴다.
    ['nargacuga.reposition_hop', '견제 도약', 'physical', 0.22, {
        sourceMoveNameJA: '牽制跳躍', maxTargets: 1, windup: 4, recovery: 1,
        tags: ['physical', 'mobility', 'vanish', 'stance-switch'],
        monsterAtbCost: 0.26,
        movement: { ticks: 30, untargetable: true },
        impactTimeline: [{ atTicks: 24, damageScale: 1 }],
        animationProfile: 'nargacuga-stance-hop', animationDurationMs: 3000,
        weight: 0.35, maxConsecutiveUses: 1
    }],

    // ── 분노 전용 (모드 무시, 전부 원거리에서 파고든다) ─────────────────────
    // 도약해 깨물고, 꼬리를 회전시키며 제자리로 돌아온다. 두 동작 모두 타격이다.
    ['nargacuga.double_bite', '연속 물어뜯기', 'physical', 0.36, {
        sourceMoveNameJA: '連続噛みつき', minTargets: 1, maxTargets: 2,
        windup: 5, recovery: 1, state: 'enraged', cooldown: 30,
        tags: ['physical', 'target-contact', 'multi-hit'], monsterAtbCost: 0.56,
        movement: { ticks: 36, untargetable: true },
        targeting: { mode: 'independent-passes', passCount: 2 },
        impactTimeline: [
            { atTicks: 16, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 30, targetMode: 'sequential', damageScale: 0.82 }
        ],
        animationProfile: 'nargacuga-bite-spin-return', animationDurationMs: 3600,
        originPart: 'head',
        brokenPartDamageModifiers: { head: 0.82, tail: 0.74 }
    }],
    // 이탈 → 공격을 3회 반복하고 제자리로 회귀한다(회귀 시 후딜 음성).
    ['nargacuga.leaping_cutwing_triple', '도약 칼날깃 3연 급습', 'charge', 0.42, {
        sourceMoveNameJA: '跳躍斬翅・三連', minTargets: 1, maxTargets: 3,
        windup: 9, recovery: 12, state: 'enraged', cooldown: 62, weight: 0.46,
        tags: ['charge', 'ambush', 'vanish', 'target-contact', 'multi-hit', 'strong'],
        monsterAtbCost: 0.92,
        movement: { ticks: 66, untargetable: true },
        targeting: { mode: 'independent-passes', passCount: 3 },
        impactTimeline: [
            { atTicks: 22, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 38, targetMode: 'sequential', damageScale: 0.92 },
            { atTicks: 54, targetMode: 'sequential', damageScale: 0.92 }
        ],
        animationProfile: 'nargacuga-leap-ambush-triple', animationDurationMs: 6600,
        originPart: 'left-wing',
        brokenPartDamageModifiers: { 'left-wing': 0.76, 'right-wing': 0.76 }
    }],
    // 우측 팔을 축으로 좌회전, 이어서 좌측 팔을 축으로 우회전. 주먹을 휘두르는 느낌.
    // 축은 헌터 위치가 아니라 인접한 두 명 사이에 놓여, 회전이 그 둘을 함께 훑는다.
    ['nargacuga.tail_sweep_reverse', '역회전 연계 꼬리 회전', 'area', 0.34, {
        sourceMoveNameJA: '尻尾回転・逆回転', minTargets: 2, maxTargets: 4,
        windup: 5, recovery: 1, state: 'enraged', cooldown: 44,
        tags: ['area', 'tail', 'target-contact', 'multi-hit'],
        monsterAtbCost: 0.78, movement: { ticks: 44 },
        targeting: { mode: 'adjacent-pair-pivot', passCount: 2 },
        impactTimeline: [
            { atTicks: 18, targetMode: 'pair', damageScale: 1 },
            { atTicks: 38, targetMode: 'pair', damageScale: 1 }
        ],
        animationProfile: 'nargacuga-twin-pivot-spin', animationDurationMs: 4400,
        originPart: 'tail', brokenPartTargetCaps: { tail: 2 },
        brokenPartDamageModifiers: { tail: 0.68 }
    }],
    // 헌터 앞으로 펄쩍 뛰어 붙고 꼬리를 살랑인 뒤, 뒤돌며 늘어난 형상이 내리꽂힌다.
    // 뒤돌기와 내려치기는 한 동작으로 매우 빠르게 일어난다. 2회 내려친 뒤 꼬리가
    // 땅에 박혀 3초(30틱) 후딜을 갖고, 제자리로 뛰어서 복귀한다.
    ['nargacuga.furious_tail_slam', '격노 연속 꼬리 내려찍기', 'physical', 0.47, {
        sourceMoveNameJA: '激昂尻尾連続叩きつけ', minTargets: 1, maxTargets: 2,
        windup: 11, recovery: 30, state: 'enraged', cooldown: 58, weight: 0.52,
        tags: ['physical', 'tail', 'target-contact', 'multi-hit', 'strong'],
        monsterAtbCost: 0.88, movement: { ticks: 54 },
        targeting: { mode: 'independent-passes', passCount: 2 },
        impactTimeline: [
            { atTicks: 26, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 44, targetMode: 'sequential', damageScale: 1 }
        ],
        animationProfile: 'nargacuga-turn-tail-slam-double', animationDurationMs: 5400,
        originPart: 'tail',
        whiffReaction: { kind: 'stuck', durationTicks: 30 },
        statusBlockedWhenBroken: ['tail'], brokenPartTargetCaps: { tail: 1 },
        brokenPartDamageModifiers: { tail: 0.65 }
    }],
    // 3연 급습과 같은 이탈·급습 리듬이되, 마지막은 평범한 돌진으로 마무리한다.
    // 복귀 후 후딜과 함께 특유의 연계기 종료 음성이 재생된다.
    ['nargacuga.lunge_chain_triple', '3연 런지 돌진', 'charge', 0.35, {
        sourceMoveNameJA: '三連突進', minTargets: 1, maxTargets: 3,
        windup: 6, recovery: 14, state: 'enraged', cooldown: 56, weight: 0.5,
        tags: ['charge', 'target-contact', 'multi-hit'],
        monsterAtbCost: 0.86,
        movement: { ticks: 72, untargetable: true },
        targeting: { mode: 'independent-passes', passCount: 3 },
        impactTimeline: [
            { atTicks: 22, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 40, targetMode: 'sequential', damageScale: 0.92 },
            { atTicks: 62, targetMode: 'sequential', damageScale: 1, audioCue: 'narga-combo-finish' }
        ],
        animationProfile: 'nargacuga-lunge-finish', animationDurationMs: 7200
    }]
]);

HUNT_MONSTER_PATTERN_OVERRIDES.barioth = worldFlying([
    ['barioth.roar', '포효', 'roar', 0, { maxTargets: 4, actionClass: 'Roar', tags: ['roar'], weight: .14 }],
    ['barioth.shoulder_check', '빙아 몸통박치기', 'physical', .31, {
        maxTargets: 2, actionClass: 'BiteSlammedLatter', tags: ['physical', 'target-contact'],
        movement: { ticks: 22, returnsToOrigin: true, returnTicks: 16 }, impact: { delayRatio: .62 }
    }],
    ['barioth.leap', '측면 도약 덮치기', 'charge', .34, {
        maxTargets: 2, actionClass: 'JumpAttack', tags: ['charge', 'target-contact'], chargeMode: 'single',
        movement: { ticks: 25, returnsToOrigin: true, returnTicks: 18 }, impact: { delayRatio: .66 },
        whiffReaction: { kind: 'slip', durationTicks: 24 },
        weightWhenBroken: { 'left-front-leg': .62, 'right-front-leg': .62 }
    }],
    ['barioth.tail_sweep', '빙결 꼬리 휩쓸기', 'area', .32, {
        minTargets: 2, maxTargets: 3, actionClass: 'TailAttackClockwise', tags: ['area', 'tail', 'ice'],
        brokenPartDamageModifiers: { tail: .7 }, brokenPartTargetCaps: { tail: 1 }
    }],
    ['barioth.ice_tornado', '빙결 회오리탄', 'projectile', .30, {
        maxTargets: 3, actionClass: 'BreathNormal', tags: ['projectile', 'ice', 'elemental', 'ground-hazard'],
        delivery: 'projectile', brokenPartDamageModifiers: { head: .72 }, statusBlockedWhenBroken: ['head']
    }],
    ['barioth.glide_dive', '저공 활강 덮치기', 'charge', .39, {
        maxTargets: 3, actionClass: 'BreathFly', tags: ['charge', 'air-compatible', 'target-contact'],
        chargeMode: 'wide', animationProfile: 'low-glide-sweep'
    }]
]);

worldVariant('barioth', 'frostfang_barioth', 1.08, [
    ['frostfang_barioth.freezing_floor', '빙결 지면 브레스', 'area', .33, {
        minTargets: 2, maxTargets: 4, actionClass: 'BreathNormal', tags: ['area', 'ice', 'frost-ground', 'elemental'],
        delivery: 'ground-wave', attachedFx: { emoji: '❄️', className: 'freezing-floor', durationMs: 4200 },
        interference: { kind: 'frost-root' }, brokenPartDamageModifiers: { head: .68 },
        brokenPartAccuracyModifiers: { head: .75 }, statusBlockedWhenBroken: ['head']
    }],
    ['frostfang_barioth.frost_leap', '서리 지면 도약', 'charge', .44, {
        maxTargets: 3, actionClass: 'BiteSlammedLatterR', requiredState: 'enraged',
        tags: ['charge', 'ice', 'frost-ground', 'multi-hit'], chargeMode: 'wide', cooldown: 58
    }]
]);

worldVariant('rathian', 'pink_rathian', 1.05, [
    ['pink_rathian.sweeping_somersault', '사선 서머솔트', 'area', .47, {
        maxTargets: 3, actionClass: 'SomersaultKickFlyToLanding', tags: ['area', 'tail', 'poison', 'multi-hit'],
        cooldown: 48, windup: 9, recovery: 14, brokenPartDamageModifiers: { tail: .7 },
        brokenPartTargetCaps: { tail: 1 }, statusBlockedWhenBroken: ['tail']
    }]
]);
worldVariant('rathalos', 'azure_rathalos', 1.05, [
    ['azure_rathalos.back_hover_combo', '후퇴 화염구 연계', 'projectile', .39, {
        maxTargets: 3, actionClass: 'BackHoverBreathCombo', tags: ['flight-only', 'projectile', 'fire', 'elemental', 'multi-hit'],
        delivery: 'projectile', cooldown: 50
    }]
], pattern => ({ ...pattern, weight: pattern.tags?.includes('flight-only') ? Number(pattern.weight || 1) * 1.25 : pattern.weight }));
worldVariant('rathian', 'gold_rathian', 1.10, [
    ['gold_rathian.blue_flame_burst', '겁염 폭발', 'area', .54, {
        minTargets: 2, maxTargets: 4, actionClass: 'UltimateBreathGround', requiredState: 'enraged',
        tags: ['area', 'fire', 'blue-flame', 'elemental'], delivery: 'ground-wave', cooldown: 76, windup: 12, recovery: 17
    }],
    ['gold_rathian.venom_tail_chain', '맹독 서머솔트 연계', 'charge', .52, {
        maxTargets: 3, actionClass: 'DoubleKickFly2', requiredState: 'enraged',
        tags: ['charge', 'tail', 'poison', 'multi-hit'], cooldown: 62,
        brokenPartDamageModifiers: { tail: .65 }, statusBlockedWhenBroken: ['tail']
    }]
]);
worldVariant('rathalos', 'silver_rathalos', 1.10, [
    ['silver_rathalos.blue_flame_sweep', '겁염 공중 휩쓸기', 'area', .55, {
        minTargets: 2, maxTargets: 4, actionClass: 'BreathFlyCombo', requiredState: 'enraged',
        tags: ['flight-only', 'area', 'fire', 'blue-flame', 'elemental', 'multi-hit'],
        delivery: 'cone', cooldown: 74, windup: 12, recovery: 17
    }],
    ['silver_rathalos.claw_breath_chain', '발톱 화염 연계', 'charge', .50, {
        maxTargets: 3, actionClass: 'RushBiteFlyCombo', requiredState: 'enraged',
        tags: ['flight-only', 'charge', 'fire', 'elemental', 'multi-hit'], cooldown: 58
    }]
]);

// Cross-action trait gates stay declarative. Mutable state belongs to
// HuntMonsterTraitRuntime.
['paolumu', 'nightshade_paolumu'].forEach(monsterId => {
    HUNT_MONSTER_PATTERN_OVERRIDES[monsterId] = (HUNT_MONSTER_PATTERN_OVERRIDES[monsterId] || []).map(pattern =>
        pattern.tags?.includes('flight-only')
            ? { ...pattern, requiredTraits: [...new Set([...(pattern.requiredTraits || []), 'inflated'])] }
            : pattern
    );
});
['legiana', 'shrieking_legiana', 'frostfang_barioth'].forEach(monsterId => {
    HUNT_MONSTER_PATTERN_OVERRIDES[monsterId] = (HUNT_MONSTER_PATTERN_OVERRIDES[monsterId] || []).map(pattern =>
        pattern.tags?.includes('ice')
            ? { ...pattern, weightWhenTraits: { ...(pattern.weightWhenTraits || {}), 'ice-coated': 1.35 } }
            : pattern
    );
});
['gold_rathian', 'silver_rathalos'].forEach(monsterId => {
    HUNT_MONSTER_PATTERN_OVERRIDES[monsterId] = (HUNT_MONSTER_PATTERN_OVERRIDES[monsterId] || []).map(pattern =>
        pattern.tags?.includes('blue-flame')
            ? { ...pattern, requiredTraits: [...new Set([...(pattern.requiredTraits || []), 'hellfire'])] }
            : pattern
    );
});
HUNT_MONSTER_PATTERN_OVERRIDES.nargacuga = HUNT_MONSTER_PATTERN_OVERRIDES.nargacuga.map(pattern =>
    pattern.id === 'nargacuga.quill_shot'
        ? { ...pattern, weightWhenTraits: { ...(pattern.weightWhenTraits || {}), 'rage-eyes': 1.8 } }
        : pattern
);

if (typeof module !== 'undefined' && module.exports) module.exports = HUNT_MONSTER_PATTERN_OVERRIDES;
else window.HUNT_MONSTER_PATTERN_OVERRIDES = HUNT_MONSTER_PATTERN_OVERRIDES;
