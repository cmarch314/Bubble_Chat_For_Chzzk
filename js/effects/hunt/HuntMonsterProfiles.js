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
        // 비트 목록. 있으면 새 모션 경로를 타고, 없으면 animationProfile의
        // 키프레임 경로 그대로다(재설계 3단계).
        motion: options.motion || null,
        profileMotion: options.profileMotion || null,
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
        ...(options.impactFx ? { impactFx: options.impactFx } : {}),
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
        ignitesAllScales: true,
        motion: [
            { beat: 'brace', label: '포효 준비', ticks: 8, pose: 'crouch' },
            { beat: 'roar', label: '폭린 점화 포효', ticks: 8, pose: 'stretch-strong', sfx: 'roar' },
            { beat: 'hold', label: '포효 유지', ticks: 5, pose: 'brace' },
            { beat: 'recover', label: '후딜', ticks: 6, pose: 'idle' }
        ]
    }],
    ['bazelgeuse.bite', '깨물기', 'physical', 0.25, {
        sourceMoveNameJA: '噛みつき', weight: 20, active: 30, recovery: 1,
        weightByState: { normal: 20, enraged: 10 },
        tags: ['physical', 'ground-only', 'target-contact', 'ignites-scale-target'],
        animationProfile: 'close-strike', animationDurationMs: 2400,
        impact: { visualRatio: .46 },
        motion: [
            { beat: 'approach', label: '깨물기 접근', ticks: 25, to: 'toward:target 82%', face: 'target', pose: 'stretch-soft' },
            { beat: 'jaw-open', label: '턱 벌리기', ticks: 10, pose: 'crouch' },
            { beat: 'bite', label: '깨물기', ticks: 3, to: 'target', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'scale-drop', label: '폭린 낙하', ticks: 7, pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 20, to: 'home', pose: 'idle' }
        ],
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
        motion: [
            { beat: 'stomp', label: '돌진 준비', ticks: 25, pose: 'crouch', face: 'target' },
            { beat: 'charge', label: '직선 돌진', ticks: 80, to: 'target', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact', label: '충돌', ticks: 3, continueTravel: true, hit: true, sfx: 'impact', moveEasing: 'linear' },
            { beat: 'scale-drop', label: '폭린 낙하', ticks: 8, opacity: 0, pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 40, at: 'offscreen:top', to: 'home', opacity: 1, pose: 'idle' }
        ],
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
        motion: [
            { beat: 'side-hop', label: '측면 이동', ticks: 25, to: 'flank:target 170', face: 'target', pose: 'stretch-soft' },
            { beat: 'shoulder-set', label: '몸통 들이밀기', ticks: 20, pose: 'brace', rotationToward: 14 },
            { beat: 'tackle', label: '측면 충돌', ticks: 4, to: 'target', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'scale-drop', label: '폭린 낙하', ticks: 6, pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 30, to: 'home', pose: 'idle' }
        ],
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
        motion: [
            { beat: 'approach', label: '꼬리 사거리 진입', ticks: 25, to: 'toward:target 68%', face: 'target', pose: 'brace' },
            { beat: 'tail-wind', label: '꼬리 감기', ticks: 20, rotateByFacing: -40, origin: '72% 70%', pose: 'crouch' },
            { beat: 'tail-sweep', label: '꼬리 휩쓸기', ticks: 4, rotateByFacing: 180, origin: '72% 70%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'scale-drop', label: '폭린 낙하', ticks: 6, pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 30, to: 'home', pose: 'idle', rotation: 0 }
        ],
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
        motion: [
            { beat: 'spring-load', label: '프레스 준비', ticks: 15, pose: 'crouch', face: 'target' },
            { beat: 'leap', label: '수직 도약', ticks: 20, to: 'above:target 180', pose: 'stretch-strong', moveEasing: 'snap' },
            { beat: 'press', label: '바디 프레스', ticks: 3, to: 'target', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'scale-drop', label: '폭린 대량 낙하', ticks: 7, pose: 'brace' },
            { beat: 'return', label: '복귀', ticks: 20, to: 'home', pose: 'idle' }
        ],
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
        motion: [
            { beat: 'scale-volley', label: '폭린 선투하', ticks: 10, face: 'target', pose: 'crouch' },
            { beat: 'scales-land', label: '폭린 낙하', ticks: 1, sfx: 'projectile', hit: true },
            { beat: 'gas-charge', label: '화염가스 준비', ticks: 9, pose: 'brace' },
            { beat: 'gas-spray', label: '부채꼴 화염가스', ticks: 8, pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'breath-impact', label: '가스 착화', ticks: 2, hit: true, sfx: 'impact' },
            { beat: 'recover', label: '후딜', ticks: 2, pose: 'idle' }
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
        ],
        motion: [
            { beat: 'charge-out', label: '돌진 이륙', ticks: 12, to: 'offscreen:bottom', face: 'target', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'initial-impact', label: '돌진 충돌', ticks: 2, hit: true, sfx: 'impact', opacity: 0 },
            { beat: 'rise-offscreen', label: '화면 상단 상승', ticks: 14, at: 'offscreen:top', opacity: 0, pose: 'brace' },
            { beat: 'bombing-run', label: '융단 폭격 횡단', ticks: 45, to: 'offscreen:right', opacity: 1, pose: 'stretch-soft', moveEasing: 'linear', sfx: 'projectile' },
            { beat: 'dive-lineup', label: '급강하 조준', ticks: 18, at: 'offscreen:top', opacity: 0, face: 'target', pose: 'crouch' },
            { beat: 'dive-impact', label: '급강하 충돌', ticks: 3, to: 'target', opacity: 1, pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'explosion-chain', label: '폭린 연쇄 폭발', ticks: 10, pose: 'brace', sfx: 'explosion' },
            { beat: 'recover', label: '착지 후딜', ticks: 8, pose: 'settle' },
            { beat: 'return', label: '복귀', ticks: 8, to: 'home', pose: 'idle' }
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
        weight: 0.16, cooldown: 90, monsterAtbCost: 0.5,
        motion: [
            { beat: 'brace', label: '몸 낮추기', ticks: 2, pose: 'crouch' },
            { beat: 'roar', label: '포효', ticks: 4, pose: 'stretch-strong', sfx: 'roar' },
            { beat: 'settle', label: '자세 회복', ticks: 3, pose: 'idle' }
        ]
    }],
    ['rathalos.bite', '물어뜯기', 'physical', 0.24, {
        sourceMoveNameJA: '噛みつき', recovery: 1, tags: ['physical', 'ground-only', 'target-contact', 'weak'],
        monsterAtbCost: 0.32, movement: { ticks: 20 }, impact: { delayRatio: 0.6 },
        animationProfile: 'rathalos-bite-contact', maxConsecutiveUses: 3,
        motion: [
            { beat: 'approach', label: '접근', ticks: 9, to: 'toward:target 82%', face: 'target', pose: 'stretch-soft' },
            { beat: 'bite', label: '물어뜯기', ticks: 3, to: 'toward:target 106%', pose: 'stretch-strong', moveEasing: 'snap', hit: true, sfx: 'impact' },
            { beat: 'recoil', label: '반동', ticks: 3, to: 'toward:target 91%', pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 5, to: 'home', pose: 'idle' }
        ]
    }],
    ['rathalos.rush', '돌진 물어뜯기', 'charge', 0.30, {
        sourceMoveNameJA: '突進噛みつき', minTargets: 1, maxTargets: 2, windup: 6, recovery: 1,
        tags: ['charge', 'ground-only', 'target-contact'], monsterAtbCost: 0.52,
        movement: { ticks: 32 }, targeting: { mode: 'adjacent-lane' },
        impact: { delayRatio: 0.61 }, animationProfile: 'rathalos-rush-bite',
        motion: [
            { beat: 'brace', label: '돌진 준비', ticks: 6, to: 'toward:target -10%', face: 'target', pose: 'crouch' },
            { beat: 'rush', label: '직선 돌진', ticks: 13, to: 'toward:target 90%', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'bite', label: '돌진 물기', ticks: 3, continueTravel: true, pose: 'stretch-strong', hit: true, sfx: 'impact', moveEasing: 'linear' },
            { beat: 'pass', label: '지나침', ticks: 4, to: 'offscreen:bottom', pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 6, at: 'offscreen:top', to: 'home', pose: 'idle' }
        ]
    }],
    ['rathalos.fireball', '화염구 브레스', 'projectile', 0.50, {
        sourceMoveNameJA: '火球ブレス', maxTargets: 1, recovery: 1, monsterAtbCost: 0.38,
        tags: ['projectile', 'elemental', 'fire', 'ground-only'], delivery: 'projectile',
        impact: { delayTicks: 17, survivesInterruption: true }, animationProfile: 'rathalos-fireball', originPart: 'head',
        motion: [
            { beat: 'aim', label: '조준', ticks: 6, face: 'target', pose: 'brace' },
            { beat: 'charge', label: '화염 모으기', ticks: 4, pose: 'crouch', sfx: 'charge' },
            { beat: 'launch', label: '화염구 발사', ticks: 7, pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'impact', label: '착탄', ticks: 1, hit: true, sfx: 'impact' },
            { beat: 'recover', label: '후딜', ticks: 6, pose: 'idle' }
        ],
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
        motion: [
            { beat: 'hover-aim', label: '공중 조준', ticks: 6, face: 'target', offsetY: -85, pose: 'brace' },
            { beat: 'charge', label: '화염 모으기', ticks: 4, pose: 'crouch', sfx: 'charge' },
            { beat: 'launch', label: '공중 화염구', ticks: 7, pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'impact', label: '착탄', ticks: 1, hit: true, sfx: 'impact' },
            { beat: 'hover-recover', label: '비행 자세 회복', ticks: 6, pose: 'idle' }
        ],
        brokenPartDamageModifiers: { head: 0.60 },
        brokenPartAccuracyModifiers: { head: 0.75 }
    }],
    // 공중에 뜬 채 좌 · 우 · 정면으로 세 발을 연달아 쏜다. 지상 삼연 브레스(레이아)와
    // 같은 리듬이되 착지하지 않는다. 사출 타이밍(애니메이션의 밝기 강조 프레임)과
    // 착탄(impactTimeline)은 레이아와 같은 간격을 쓴다: 발사 후 약 9~10틱 뒤 착탄.
    ['rathalos.aerial_triple_fireball', '공중 삼연 화염구', 'projectile', 0.44, {
        sourceMoveNameJA: '空中三連火球ブレス', minTargets: 1, maxTargets: 3, recovery: 1,
        cooldown: 46, monsterAtbCost: 0.72,
        tags: ['projectile', 'elemental', 'fire', 'flight-only', 'multi-hit'],
        // 분노 상태에서 더 자주 나오되, 평상시 비행 중에도 쓸 수 있게 둔다.
        // state로 잠그면 '분노 && 비행'이라는 좁은 교집합에서만 나와 거의 보이지 않는다.
        weightByState: { enraged: 1.4 },
        targeting: { mode: 'center-left-right' }, delivery: 'projectile',
        movement: { ticks: 30 },
        impactTimeline: [
            { atTicks: 17, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 22, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 27, targetMode: 'sequential', damageScale: 1 }
        ],
        animationProfile: 'rathalos-triple-fireball', animationDurationMs: 3000, originPart: 'head',
        projectileLaunchDelayTicks: 10,
        motion: [
            { beat: 'hover-aim', label: '공중 정면 조준', ticks: 10, face: 'target', offsetY: -85, pose: 'brace' },
            { beat: 'charge', label: '화염 모으기', ticks: 7, pose: 'crouch', sfx: 'charge' },
            { beat: 'shot-center', label: '중앙 발사', ticks: 5, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 'shot-left', label: '좌측 발사', ticks: 5, rotateByFacing: -18, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 'shot-right', label: '우측 발사', ticks: 1, rotateByFacing: 36, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 'hover-recover', label: '비행 자세 회복', ticks: 2, pose: 'idle' }
        ],
        brokenPartDamageModifiers: { head: 0.80 },
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
        motion: [
            { beat: 'backstep', label: '백스탭', ticks: 6, to: 'toward:target -28%', face: 'target', offsetY: -55, pose: 'stretch-soft', moveEasing: 'snap' },
            { beat: 'charge', label: '화염 모으기', ticks: 4, pose: 'crouch', sfx: 'charge' },
            { beat: 'launch', label: '백스탭 브레스', ticks: 7, pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'impact', label: '착탄', ticks: 1, hit: true, sfx: 'impact' },
            { beat: 'takeoff', label: '비행 전환', ticks: 8, offsetY: -120, pose: 'stretch-soft' }
        ],
        brokenPartDamageModifiers: { head: 0.50 },
        brokenPartAccuracyModifiers: { head: 0.75 }
    }],
    ['rathalos.claw_dive', '독조 강습', 'charge', 0.39, {
        sourceMoveNameJA: '毒爪急襲', maxTargets: 1, windup: 8, recovery: 1,
        tags: ['charge', 'poison', 'flight-only', 'target-contact'], monsterAtbCost: 0.7,
        movement: { ticks: 36 }, impact: { delayRatio: 0.66 }, animationProfile: 'rathalos-claw-dive',
        motion: [
            { beat: 'hover-track', label: '공중 추적', ticks: 10, offsetY: -115, face: 'target', pose: 'brace' },
            { beat: 'dive', label: '발톱 급강하', ticks: 14, to: 'target', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'claw-impact', label: '발톱 적중', ticks: 2, to: 'below:target 26', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'rise', label: '다시 상승', ticks: 5, offsetY: -105, pose: 'stretch-soft' },
            { beat: 'return', label: '비행 위치 복귀', ticks: 5, to: 'home', pose: 'idle' }
        ]
    }],
    ['rathalos.tail_sweep', '꼬리 회전', 'area', 0.31, {
        sourceMoveNameJA: '尻尾回転', minTargets: 2, maxTargets: 3, recovery: 1,
        tags: ['area', 'tail', 'ground-only', 'target-contact'],
        monsterAtbCost: 0.62, movement: { ticks: 38 }, targeting: { mode: 'lane' },
        impactTimeline: [{ atTicks: 14 }, { atTicks: 24 }],
        animationProfile: 'rathalos-tail-sweep-double', animationDurationMs: 3800,
        motion: [
            { beat: 'approach', label: '회전 위치 진입', ticks: 8, to: 'toward:target 68%', face: 'target', pose: 'brace' },
            { beat: 'wind', label: '꼬리 준비', ticks: 6, rotateByFacing: -30, origin: '76% 72%', pose: 'crouch' },
            { beat: 'sweep-one', label: '첫 반회전', ticks: 10, rotateByFacing: 180, origin: '76% 72%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'sweep-two', label: '둘째 반회전', ticks: 10, rotateByFacing: 180, origin: '76% 72%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 4, to: 'home', pose: 'idle', rotation: 0 }
        ],
        brokenPartTargetCaps: { tail: 1 }, brokenPartDamageModifiers: { tail: 0.50 }
    }],
    ['rathalos.aerial_tail_sweep', '공중 꼬리 휩쓸기', 'area', 0.32, {
        sourceMoveNameJA: '空中尻尾回転', minTargets: 1, maxTargets: 2, recovery: 1,
        cooldown: 34, tags: ['area', 'tail', 'flight-only', 'target-contact'],
        monsterAtbCost: 0.58, movement: { ticks: 30 }, targeting: { mode: 'adjacent-lane' },
        impact: { delayRatio: 0.62 }, animationProfile: 'tail-sweep',
        motion: [
            { beat: 'hover-approach', label: '공중 접근', ticks: 10, to: 'toward:target 68%', offsetY: -80, face: 'target', pose: 'brace' },
            { beat: 'wind', label: '꼬리 준비', ticks: 8, rotateByFacing: -36, origin: '76% 72%', pose: 'crouch' },
            { beat: 'sweep', label: '공중 꼬리 휩쓸기', ticks: 4, to: 'target', rotateByFacing: 180, origin: '76% 72%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'return', label: '비행 위치 복귀', ticks: 8, to: 'home', pose: 'idle', rotation: 0 }
        ],
        brokenPartTargetCaps: { tail: 1 }, brokenPartDamageModifiers: { tail: 0.50 }
    }],
    ['rathalos.hop_stomp', '도약 발톱 내려찍기', 'physical', 0.35, {
        sourceMoveNameJA: '飛びかかり蹴り', maxTargets: 1, windup: 6, recovery: 1,
        cooldown: 32, monsterAtbCost: 0.52,
        tags: ['physical', 'poison', 'ground-only', 'target-contact'],
        movement: { ticks: 26 }, impact: { delayRatio: 0.68 },
        animationProfile: 'rathalos-stomp',
        motion: [
            { beat: 'crouch', label: '도약 준비', ticks: 6, pose: 'crouch', face: 'target' },
            { beat: 'hop', label: '수직 도약', ticks: 7, to: 'toward:target 78%', offsetY: -100, pose: 'stretch-soft', moveEasing: 'snap' },
            { beat: 'stomp', label: '발톱 내려찍기', ticks: 5, to: 'target', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact', label: '충돌', ticks: 2, pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 6, to: 'home', pose: 'idle' }
        ]
    }],
    ['rathalos.stomp', '독조 내려찍기', 'physical', 0.35, {
        sourceMoveNameJA: '踏みつけ攻撃', maxTargets: 1, windup: 7, recovery: 1,
        cooldown: 38, monsterAtbCost: 0.58,
        tags: ['physical', 'poison', 'flight-only', 'landing-only', 'target-contact'],
        movement: { ticks: 27 }, impact: { delayRatio: 0.7 },
        animationProfile: 'rathalos-stomp', flightTransition: 'land',
        motion: [
            { beat: 'hover-track', label: '공중 조준', ticks: 7, offsetY: -105, face: 'target', pose: 'brace' },
            { beat: 'stomp', label: '발톱 착지', ticks: 12, to: 'target', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact', label: '착지 충돌', ticks: 2, pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'recover', label: '착지 후딜', ticks: 6, to: 'home', pose: 'idle' }
        ]
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
        , motion: [
            { beat: 'offscreen-start', label: '화면 밖 진입', ticks: 8, at: 'offscreen:left', opacity: 0, face: 'target', pose: 'stretch-soft' },
            { beat: 'cross-left', label: '좌측 횡단', ticks: 4, to: 'between:hunter:0,hunter:1', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear', hit: true, sfx: 'impact' },
            { beat: 'cross-center-left', label: '중앙 좌측 횡단', ticks: 4, to: 'between:hunter:1,hunter:2', pose: 'stretch-strong', moveEasing: 'linear', hit: true, sfx: 'impact' },
            { beat: 'cross-center-right', label: '중앙 우측 횡단', ticks: 4, to: 'between:hunter:2,hunter:3', pose: 'stretch-strong', moveEasing: 'linear', hit: true, sfx: 'impact' },
            { beat: 'cross-right', label: '우측 횡단', ticks: 4, to: 'offscreen:right', pose: 'stretch-strong', moveEasing: 'linear', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 16, at: 'offscreen:top', to: 'home', opacity: 1, pose: 'idle' }
        ]
    }]
]).map(pattern => pattern.type === 'roar' ? pattern : ({
    ...pattern,
    monsterAtbCostMultiplier: RATHALOS_ATTACK_ATB_COST_MULTIPLIER
}));

// Final World-original Rathian review. Only this record is exported to runtime.
HUNT_MONSTER_PATTERN_OVERRIDES.rathian = pilot('world_iceborne', PILOT_SOURCES.rathian, [
    ['rathian.roar', '포효', 'roar', 0, {
        maxTargets: 4, sourceMoveNameJA: '咆哮', tags: ['roar', 'transition-roar'],
        weight: 0.14, cooldown: 90, monsterAtbCost: 0.48,
        motion: [
            { beat: 'brace', label: '몸 낮추기', ticks: 2, pose: 'crouch' },
            { beat: 'roar', label: '포효', ticks: 4, pose: 'stretch-strong', sfx: 'roar' },
            { beat: 'settle', label: '자세 회복', ticks: 3, pose: 'idle' }
        ]
    }],
    ['rathian.bite', '물어뜯기', 'physical', 0.22, {
        sourceMoveNameJA: '噛みつき', recovery: 1,
        tags: ['physical', 'ground-only', 'target-contact', 'weak'], monsterAtbCost: 0.30,
        movement: { ticks: 20 }, impact: { visualRatio: 0.55 },
        animationProfile: 'rathalos-bite-contact', animationDurationMs: 2400,
        maxConsecutiveUses: 1,
        motion: [
            { beat: 'approach', label: '접근', ticks: 9, to: 'toward:target 82%', face: 'target', pose: 'stretch-soft' },
            { beat: 'bite', label: '물어뜯기', ticks: 3, to: 'toward:target 106%', pose: 'stretch-strong', moveEasing: 'snap', hit: true, sfx: 'impact' },
            { beat: 'recoil', label: '반동', ticks: 3, to: 'toward:target 91%', pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 5, to: 'home', pose: 'idle' }
        ]
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
        motion: [
            { beat: 'center', label: '중앙 진입', ticks: 12, to: 'arena:center-lower .56', face: 'target', pose: 'brace' },
            { beat: 'wind', label: '꼬리 준비', ticks: 12, rotateByFacing: -36, origin: '76% 72%', pose: 'crouch' },
            { beat: 'left-half', label: '좌측 반회전', ticks: 10, rotateByFacing: 180, origin: '76% 72%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'right-half', label: '우측 반회전', ticks: 4, rotateByFacing: 180, origin: '76% 72%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 4, to: 'home', pose: 'idle', rotation: 0 }
        ],
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
        motion: [
            { beat: 'aim', label: '조준', ticks: 6, face: 'target', pose: 'brace' },
            { beat: 'charge', label: '화염 모으기', ticks: 4, pose: 'crouch', sfx: 'charge' },
            { beat: 'launch', label: '화염구 발사', ticks: 7, pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'impact', label: '착탄', ticks: 1, pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'recover', label: '후딜', ticks: 6, pose: 'idle' }
        ],
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
        motion: [
            { beat: 'aim-center', label: '정면 조준', ticks: 10, face: 'target', pose: 'brace' },
            { beat: 'charge', label: '화염 모으기', ticks: 7, pose: 'crouch', sfx: 'charge' },
            { beat: 'shot-center', label: '정면 발사', ticks: 5, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 'shot-left', label: '좌측 발사', ticks: 5, rotateByFacing: -18, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 'shot-right', label: '우측 발사', ticks: 1, rotateByFacing: 36, pose: 'stretch-strong', hit: true, sfx: 'projectile' }
        ],
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
        suppressPrepareAudio: true,
        motion: [
            { beat: 'aim', label: '조준', ticks: 6, face: 'target', pose: 'brace' },
            { beat: 'charge', label: '불발 준비', ticks: 5, pose: 'crouch' },
            { beat: 'fizzle', label: '입김 불발', ticks: 3, pose: 'stretch-soft', sfx: 'fizzle' },
            { beat: 'wheeze', label: '헐떡임', ticks: 4, pose: 'settle' }
        ]
    }],
    ['rathian.charge', '돌진', 'charge', 0.29, {
        sourceMoveNameJA: '突進', minTargets: 1, maxTargets: 2, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['charge', 'ground-only', 'target-contact'], monsterAtbCost: 0.52,
        movement: { ticks: 24, untargetable: true }, targeting: { mode: 'adjacent-lane' },
        impact: { visualRatio: 0.30 }, animationProfile: 'rathian-ground-charge', animationDurationMs: 3000,
        motion: [
            { beat: 'backstep', label: '짧은 물러남', ticks: 5, to: 'toward:target -12%', face: 'target', pose: 'crouch' },
            { beat: 'charge', label: '직선 돌진', ticks: 2, to: 'target', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact', label: '충돌', ticks: 2, continueTravel: true, pose: 'land', hit: true, sfx: 'impact', moveEasing: 'linear' },
            { beat: 'exit', label: '화면 밖 이탈', ticks: 8, opacity: 0, pose: 'stretch-soft' },
            { beat: 'return', label: '복귀', ticks: 7, at: 'offscreen:top', to: 'home', opacity: 1, pose: 'idle' }
        ]
    }],
    ['rathian.triple_charge', '삼연속 돌진', 'charge', 0.30, {
        sourceMoveNameJA: '三連突進', minTargets: 1, maxTargets: 2, windup: 5, recovery: 1,
        state: 'enraged', cooldown: 54, tags: ['charge', 'ground-only', 'multi-hit'],
        monsterAtbCost: 0.82,
        movement: { kind: 'rathian-triple-charge', ticks: 113, untargetable: true },
        targeting: { mode: 'triple-adjacent-passes' },
        impact: { passRatios: [0.12, 0.43, 0.74], completePathOnTargetLoss: true },
        animationProfile: 'ground-charge-triple', animationDurationMs: 9000,
        motion: [
            { beat: 'backstep', label: '짧은 물러남', ticks: 5, to: 'toward:target -12%', face: 'target', pose: 'crouch' },
            { beat: 'pass-one', label: '1차 돌진', ticks: 9, to: 'offscreen:bottom', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact-one', label: '1차 충돌', ticks: 1, hit: true, sfx: 'impact' },
            { beat: 'turn-one', label: '화면 밖 선회', ticks: 34, at: 'offscreen:top', opacity: 0, pose: 'brace' },
            { beat: 'impact-two', label: '2차 충돌', ticks: 1, to: 'offscreen:bottom', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear', hit: true, sfx: 'impact' },
            { beat: 'turn-two', label: '재선회', ticks: 34, at: 'offscreen:top', opacity: 0, pose: 'brace' },
            { beat: 'impact-three', label: '3차 충돌', ticks: 1, to: 'offscreen:bottom', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 28, at: 'offscreen:top', to: 'home', opacity: 1, pose: 'idle' }
        ]
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
        suppressPrepareAudio: true,
        motion: [
            { beat: 'approach', label: '도약 접근', ticks: 10, to: 'toward:target 72%', face: 'target', pose: 'stretch-soft', moveEasing: 'accelerate' },
            { beat: 'coil-back', label: '뒤로 45도 꺾기', ticks: 4, rotateByFacing: -45, origin: '76% 72%', pose: 'crouch' },
            { beat: 'tail-rise', label: '올려치기 회전', ticks: 5, to: 'target', rotateByFacing: 360, origin: '76% 72%', pose: 'stretch-strong', moveEasing: 'snap' },
            { beat: 'impact', label: '꼬리 적중', ticks: 2, pose: 'land', hit: true, sfx: 'somersault' },
            { beat: 'land', label: '착지', ticks: 4, to: 'home', pose: 'idle', rotation: 0 }
        ]
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
        suppressPrepareAudio: true,
        motion: [
            { beat: 'approach-one', label: '1차 접근', ticks: 12, to: 'toward:target 72%', face: 'target', pose: 'stretch-soft' },
            { beat: 'coil-one', label: '1차 꺾기', ticks: 5, rotateByFacing: -45, origin: '76% 72%', pose: 'crouch' },
            { beat: 'rise-one', label: '1차 올려치기', ticks: 5, to: 'pass:1', rotateByFacing: 360, origin: '76% 72%', pose: 'stretch-strong' },
            { beat: 'impact-one', label: '1차 적중', ticks: 2, hit: true, sfx: 'somersault' },
            { beat: 'reposition', label: '공중 재정렬', ticks: 12, to: 'toward:pass:2 72%', pose: 'brace' },
            { beat: 'approach-two', label: '2차 접근', ticks: 10, to: 'toward:pass:2 90%', face: 'pass:2', pose: 'stretch-soft' },
            { beat: 'coil-two', label: '2차 꺾기', ticks: 7, rotateByFacing: -45, origin: '76% 72%', pose: 'crouch' },
            { beat: 'impact-two', label: '2차 올려치기', ticks: 2, to: 'pass:2', rotateByFacing: 360, origin: '76% 72%', pose: 'stretch-strong', hit: true, sfx: 'somersault' },
            { beat: 'land', label: '착지', ticks: 9, to: 'home', pose: 'idle', rotation: 0 }
        ]
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
        suppressPrepareAudio: true,
        motion: [
            { beat: 'takeoff', label: '이륙', ticks: 7, offsetY: -90, face: 'target', pose: 'stretch-soft' },
            { beat: 'bite-approach', label: '물기 접근', ticks: 13, to: 'target', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'bite-impact', label: '깨물기', ticks: 2, hit: true, sfx: 'impact' },
            { beat: 'separate', label: '거리 벌리기', ticks: 15, to: 'toward:target 55%', offsetY: -90, pose: 'brace' },
            { beat: 'coil', label: '뒤로 꺾기', ticks: 10, rotateByFacing: -45, origin: '76% 72%', pose: 'crouch' },
            { beat: 'rise', label: '올려치기 회전', ticks: 7, to: 'target', rotateByFacing: 360, origin: '76% 72%', pose: 'stretch-strong' },
            { beat: 'tail-impact', label: '꼬리 적중', ticks: 2, hit: true, sfx: 'somersault' },
            { beat: 'land', label: '착지', ticks: 10, to: 'home', pose: 'idle', rotation: 0 }
        ]
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
        suppressPrepareAudio: true,
        motion: [
            { beat: 'approach', label: '서머솔트 접근', ticks: 12, to: 'toward:pass:1 72%', face: 'pass:1', pose: 'stretch-soft' },
            { beat: 'coil', label: '뒤로 꺾기', ticks: 5, rotateByFacing: -45, origin: '76% 72%', pose: 'crouch' },
            { beat: 'rise', label: '올려치기 회전', ticks: 4, to: 'pass:1', rotateByFacing: 360, origin: '76% 72%', pose: 'stretch-strong' },
            { beat: 'tail-impact', label: '꼬리 적중', ticks: 2, hit: true, sfx: 'somersault' },
            { beat: 'separate', label: '활공 거리 확보', ticks: 13, to: 'toward:pass:2 48%', offsetY: -80, pose: 'brace' },
            { beat: 'glide', label: 'S자 저공 활공', ticks: 20, to: 'pass:2', pose: 'stretch-strong', moveEasing: 'slow-fast-slow' },
            { beat: 'glide-impact', label: '활공 충돌', ticks: 2, to: 'offscreen:bottom', hit: true, sfx: 'impact' },
            { beat: 'land', label: '착지 복귀', ticks: 20, at: 'offscreen:top', to: 'home', pose: 'idle' }
        ]
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
        flight: { takeoffInterference: { kind: 'wind', size: 'small' } },
        motion: [
            { beat: 'takeoff', label: '이륙', ticks: 6, offsetY: -90, face: 'target', pose: 'stretch-soft' },
            { beat: 'line-up', label: '활공 정렬', ticks: 10, to: 'toward:target 45%', offsetY: -70, pose: 'brace' },
            { beat: 'glide', label: 'S자 저공 활공', ticks: 17, to: 'target', pose: 'stretch-strong', moveEasing: 'slow-fast-slow' },
            { beat: 'impact', label: '활공 충돌', ticks: 2, to: 'offscreen:bottom', hit: true, sfx: 'impact' },
            { beat: 'land', label: '착지 복귀', ticks: 5, at: 'offscreen:top', to: 'home', pose: 'idle' }
        ]
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
        weight: 0.12, cooldown: 95, monsterAtbCost: 0.50, interference: { kind: 'roar', size: 'large' },
        motion: [
            { beat: 'brace', label: '몸 낮추기', ticks: 2, pose: 'crouch' },
            { beat: 'roar', label: '포효', ticks: 4, pose: 'stretch-strong', sfx: 'roar',
                judgmentOffsets: { roar: 1 }, judgments: [{ id: 'roar-control', group: 'roar-control',
                    kind: 'roar', target: 'all', size: 'large', offsetTicks: 1 }] },
            { beat: 'settle', label: '자세 회복', ticks: 3, pose: 'idle' }
        ]
    }],
    ['diablos.horn_charge', '뿔 돌진', 'charge', 0.40, {
        sourceMoveNameJA: '突進', maxTargets: 3, windup: 7, recovery: 1,
        tags: ['charge', 'horn', 'strong'], monsterAtbCost: 0.70,
        movement: { ticks: 42, untargetable: true },
        targeting: { mode: 'adjacent-lane' },
        chargeLaunchStyle: 'stomp-burst',
        motion: [
            { beat: 'stomp', label: '발구르기', ticks: 7, pose: 'crouch', stompSteps: 3 },
            { beat: 'charge', label: '돌진', ticks: 44, to: 'target', face: 'target',
                bounds: 'reach', pose: 'idle', instantPose: true, strideFlipTicks: 3, moveEasing: 'linear' },
            { beat: 'impact', label: '피격', ticks: 2, continueTravel: true, pose: 'land',
                hit: true, sfx: 'impact', fade: 'out', moveEasing: 'linear',
                judgments: [{ id: 'horn-charge-hit', group: 'horn-charge-hit', kind: 'damage',
                    target: 'primary-adjacent', damageScale: 1, offsetTicks: 0 }] },
            { beat: 'return', label: 'Fade-in 복귀', ticks: 8, at: 'offscreen:top', to: 'home',
                pose: 'idle', fade: 'in', moveEasing: 'decelerate' }
        ],
        brokenPartDamageModifiers: { 'left-horn': 0.935, 'right-horn': 0.935 }
    }],
    ['diablos.burrow_enter', '지중 잠행·급습', 'charge', 0.46, {
        sourceMoveNameJA: '地中潜行→地中急襲', maxTargets: 1, windup: 5, recovery: 1, cooldown: 56,
        tags: ['charge', 'burrow', 'burrow-combo', 'locked-target', 'horn', 'strong', 'tremor-large'], monsterAtbCost: 0.75,
        // The complete authored graph is one traversal. Hunters cannot damage,
        // stagger, break, or stun Diablos between sinking and emergence.
        movement: { kind: 'diablos-burrow-complete', ticks: 69, untargetable: true },
        // Tremor [L] occupies the eruption lane and its immediate neighbours,
        // including the directly struck lane. Adjacency is clipped naturally
        // at the left/right edge.
        // Digging dust is visual only and must never become legacy wind pressure.
        interference: { kind: 'tremor', size: 'large', directHitSupersedes: false },
        motion: [
            { beat: 'dig', label: '땅 파기', ticks: 3, pose: 'crouch', scaleY: .82,
                fx: 'burrow-dust', fxDurationTicks: 11 },
            { beat: 'sink', label: '잠복', ticks: 2, offsetY: 105, scaleY: .42, opacity: .35, moveEasing: 'accelerate' },
            { beat: 'still', label: '정적', ticks: 30, opacity: 0, pose: 'crouch' },
            { beat: 'track', label: '지중 추적', ticks: 14, at: 'below:target 150', opacity: 0,
                pose: 'crouch', fx: 'burrow-tracking-dust', fxAnchor: 'target', fxDurationTicks: 14 },
            { beat: 'eruption', label: '머리 쳐올리기', ticks: 5, to: 'above:target 20', bounds: 'reach',
                opacity: 1, instantOpacity: true, pose: 'stretch-strong',
                scaleX: .88, scaleY: 1.18, rotationToward: 10, moveEasing: 'snap', hit: true,
                sfx: 'impact', fx: 'burrow-emerge-dust', fxAnchor: 'target', fxDurationTicks: 6,
                judgmentOffsets: { tremor: 2 }, judgments: [
                    { id: 'burrow-hit', group: 'burrow-eruption', kind: 'damage', target: 'primary',
                        damageScale: 1, offsetTicks: 2 },
                    { id: 'burrow-tremor', group: 'burrow-eruption', kind: 'tremor', target: 'primary-adjacent',
                        size: 'large', directHitSupersedes: false, offsetTicks: 2 }
                ] },
            { beat: 'land', label: '솟구침 반동', ticks: 5, to: 'below:target 28', pose: 'settle',
                scaleX: 1.03, scaleY: .96, rotation: 0, moveEasing: 'decelerate' },
            { beat: 'return', label: '천천히 복귀', ticks: 10, to: 'home', pose: 'idle',
                scaleX: 1, scaleY: 1, rotation: 0, moveEasing: 'decelerate' }
        ],
        brokenPartDamageModifiers: { 'left-horn': 0.89, 'right-horn': 0.89 }
    }],
    ['diablos.horn_uppercut', '뿔 쳐올리기', 'physical', 0.37, {
        sourceMoveNameJA: '角振り上げ', maxTargets: 1, recovery: 1,
        tags: ['physical', 'horn', 'target-contact'], monsterAtbCost: 0.45,
        movement: { ticks: 32 },
        impact: { delayTicks: 13 },
        motion: [
            { beat: 'telegraph', label: '헌터 앞 접근', ticks: 8, to: 'toward:target 82%', face: 'target', pose: 'stretch-soft', moveEasing: 'linear' },
            { beat: 'start', label: '뿔 낮추기', ticks: 5, pose: 'crouch', origin: '50% 52%', rotationToward: 10 },
            { beat: 'impact', label: '뿔 쳐올리기', ticks: 4, to: 'toward:target 98%', offsetY: -24,
                pose: 'idle', origin: '50% 52%', rotationToward: -34,
                scaleX: 1, scaleY: 1.03, moveEasing: 'snap', hit: true, sfx: 'impact',
                fx: 'part-dust', fxAnchor: 'head', fxDurationTicks: 6,
                fxSecondary: 'target-impact-dust', fxSecondaryAnchor: 'target', fxSecondaryDurationTicks: 6,
                fxSecondaryAngleMode: 'upward-diagonal',
                fxAdditional: [{ fx: 'part-swing-arc', anchor: 'head', durationTicks: 5,
                    angleMode: 'upward-diagonal' }] },
            { beat: 'recover', label: '상체 복구', ticks: 7, offsetY: -10, pose: 'settle',
                origin: '50% 52%', rotationToward: -8, moveEasing: 'decelerate' },
            { beat: 'return', label: '제자리 복귀', ticks: 8, to: 'home', pose: 'idle', rotation: 0,
                origin: '50% 50%', moveEasing: 'decelerate' }
        ],
        brokenPartDamageModifiers: { 'left-horn': 0.931, 'right-horn': 0.931 }
    }],
    ['diablos.horn_sweep', '연속 뿔 휘두르기', 'area', 0.39, {
        sourceMoveNameJA: '連続角振り', minTargets: 2, maxTargets: 2, cooldown: 42, recovery: 1,
        tags: ['area', 'horn', 'multi-hit', 'target-contact'], monsterAtbCost: 0.70,
        movement: { ticks: 42 },
        impactTimeline: [
            { atTicks: 11, targetMode: 'sequential', damageScale: 0.54 },
            { atTicks: 24, targetMode: 'sequential', damageScale: 0.54 }
        ],
        targeting: { mode: 'adjacent-pair-sequential', passCount: 2 },
        motion: [
            { beat: 'telegraph', label: '두 헌터 사이 접근', ticks: 7, to: 'between:pass:1,pass:2', face: 'pass:1', pose: 'brace', moveEasing: 'linear' },
            { beat: 'lower-1', label: '첫 뿔 낮추기', ticks: 4, face: 'pass:1',
                pose: 'crouch', origin: '50% 52%', rotationToward: 10 },
            { beat: 'impact-1', label: '첫 쳐올리기', ticks: 4, offsetY: -18,
                pose: 'idle', origin: '50% 52%', rotationToward: -34, moveEasing: 'snap', hit: true, sfx: 'impact',
                fx: 'part-dust', fxAnchor: 'head', fxDurationTicks: 6,
                fxSecondary: 'target-impact-dust', fxSecondaryAnchor: 'target', fxSecondaryDurationTicks: 6,
                fxSecondaryAngleMode: 'upward-diagonal',
                fxAdditional: [{ fx: 'part-swing-arc', anchor: 'head', durationTicks: 5,
                    angleMode: 'upward-diagonal' }] },
            { beat: 'recenter', label: '중앙 자세 전환', ticks: 5,
                pose: 'settle', rotation: 0, offsetY: 0, moveEasing: 'decelerate' },
            { beat: 'lower-2', label: '둘째 뿔 낮추기', ticks: 4, face: 'pass:2',
                pose: 'crouch', origin: '50% 52%', rotationToward: 10 },
            { beat: 'impact-2', label: '둘째 쳐올리기', ticks: 4, offsetY: -18,
                pose: 'idle', origin: '50% 52%', rotationToward: -34, moveEasing: 'snap', hit: true, sfx: 'impact',
                fx: 'part-dust', fxAnchor: 'head', fxDurationTicks: 6,
                fxSecondary: 'target-impact-dust', fxSecondaryAnchor: 'target', fxSecondaryDurationTicks: 6,
                fxSecondaryAngleMode: 'upward-diagonal',
                fxAdditional: [{ fx: 'part-swing-arc', anchor: 'head', durationTicks: 5,
                    angleMode: 'upward-diagonal' }] },
            { beat: 'recover', label: '상체 복구', ticks: 6, offsetY: -8, pose: 'settle',
                origin: '50% 52%', rotationToward: -8, moveEasing: 'decelerate' },
            { beat: 'return', label: '제자리 복귀', ticks: 8, to: 'home', pose: 'idle', rotation: 0,
                origin: '50% 50%', moveEasing: 'decelerate' }
        ],
        brokenPartDamageModifiers: { 'left-horn': 0.817, 'right-horn': 0.817 }
    }],
    ['diablos.rage_charge', '분노 연속 돌진', 'charge', 0.45, {
        sourceMoveNameJA: '怒り連続突進', minTargets: 2, maxTargets: 4, windup: 8, recovery: 1,
        cooldown: 65, state: 'enraged', tags: ['charge', 'horn', 'cross-charge', 'multi-hit'],
        monsterAtbCost: 0.80,
        movement: { kind: 'diablos-return-charge-tail-cross', ticks: 162, untargetable: true },
        targeting: { mode: 'return-adjacent-passes' },
        impact: {
            // One telegraph owns both passes. Resolve defense only as each
            // off-board traversal physically crosses its locked hunter lane.
            passRatios: [0.315, 0.772],
            completePathOnTargetLoss: true
        },
        impactTimeline: [
            { atTicks: 51, targetMode: 'runtime-pair-left', damageScale: 1 },
            { atTicks: 125, targetMode: 'runtime-pair-right', damageScale: 1 },
            { atTicks: 135, targetMode: 'runtime-pair-left', damageScale: .45 },
            { atTicks: 149, targetMode: 'runtime-pair-right', damageScale: .45 }
        ],
        chargeLaunchStyle: 'stomp-burst',
        animationDurationMs: 16200,
        motion: [
            // Reuse the reviewed single-charge cadence verbatim: 7 tick stomp,
            // 44 tick constant-speed line, then a 2 tick contact pass.
            { beat: 'stomp', label: '발구르기', ticks: 7, pose: 'crouch', stompSteps: 3 },
            { beat: 'charge-out', label: '1차 돌진·2인 조 중앙 관통', ticks: 44, to: 'pair:center', face: 'pair:center',
                bounds: 'reach', pose: 'idle', instantPose: true, strideFlipTicks: 3,
                moveEasing: 'linear' },
            { beat: 'exit-bottom', label: '같은 직선으로 화면 하단 이탈', ticks: 8,
                to: 'through:pair:center 120', face: 'pair:center', pose: 'idle', fade: 'out',
                moveEasing: 'linear', strideFlipTicks: 3,
                hit: true, sfx: 'impact', targetMode: 'runtime-pair-left' },
            { beat: 'hold-outside', label: '화면 하단 밖 대기', ticks: 20,
                opacity: 0, pose: 'brace' },
            { beat: 'return-charge', label: '2차 돌진·화면 안 정지', ticks: 44,
                to: 'above:pair:center 220', face: 'pair:center', bounds: 'pivot', opacity: 1,
                instantOpacity: true, rotation: 180, pose: 'idle', instantPose: true, strideFlipTicks: 3,
                moveEasing: 'linear' },
            { beat: 'return-impact', label: '2차 충돌·정지', ticks: 2,
                rotation: 180, pose: 'land', strideFlipTicks: 3,
                hit: true, sfx: 'impact', moveEasing: 'linear',
                targetMode: 'runtime-pair-right' },
            { beat: 'tail-wind-left', label: '좌상단 꼬리 준비', ticks: 5,
                rotation: 165, offsetX: 0, offsetY: 0, skewX: 4,
                scaleX: 1.01, scaleY: .99, pose: 'stretch-soft', origin: 'part:torso',
                moveEasing: 'accelerate' },
            { beat: 'tail-cross-one', label: '후방 X자 좌상→우하', ticks: 5,
                rotation: 202, offsetX: 0, offsetY: 0, skewX: -6,
                scaleX: 1.04, scaleY: .96, pose: 'stretch-strong', origin: 'part:torso',
                moveEasing: 'snap', hit: true, sfx: 'impact', damageScale: .45,
                targetMode: 'runtime-pair-left', fx: 'target-impact-dust', fxAnchor: 'target', fxDurationTicks: 5 },
            { beat: 'tail-rebound', label: '꼬리 반동', ticks: 4,
                rotation: 185, offsetX: 0, offsetY: 0, skewX: -2,
                scaleX: 1.01, scaleY: .99, pose: 'settle', origin: 'part:torso',
                moveEasing: 'decelerate' },
            { beat: 'tail-wind-right', label: '우상단 꼬리 준비', ticks: 5,
                rotation: 195, offsetX: 0, offsetY: 0, skewX: -4,
                scaleX: 1.01, scaleY: .99, pose: 'stretch-soft', origin: 'part:torso',
                moveEasing: 'accelerate', flipFacing: true },
            { beat: 'tail-cross-two', label: '후방 X자 우상→좌하', ticks: 5,
                rotation: 158, offsetX: 0, offsetY: 0, skewX: 6,
                scaleX: 1.04, scaleY: .96, pose: 'stretch-strong', origin: 'part:torso',
                moveEasing: 'snap', hit: true, sfx: 'impact', damageScale: .45,
                targetMode: 'runtime-pair-right', fx: 'target-impact-dust', fxAnchor: 'target', fxDurationTicks: 5 },
            { beat: 'tail-settle', label: '꼬리 회수', ticks: 5,
                rotation: 176, offsetX: 0, offsetY: 0, skewX: 2,
                scaleX: 1.01, scaleY: .99, pose: 'settle', origin: 'part:torso',
                moveEasing: 'decelerate' },
            { beat: 'return', label: '회전 유지 복귀', ticks: 8, to: 'home',
                rotation: 180, skewX: 0, scaleX: 1, scaleY: 1, opacity: 1,
                pose: 'idle', origin: '74% 30%', moveEasing: 'decelerate', flipFacing: true }
        ],
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
        minTargets: 1,
        maxTargets: 3,
        windup: 5,
        recovery: 1,
        cooldown: 38,
        tags: ['tail', 'tail-slam-rock', 'projectile'],
        delivery: 'projectile',
        projectileVisual: 'rock',
        monsterAtbCost: 0.60,
        movement: { ticks: 45 },
        targeting: { mode: 'independent-passes', passCount: 3, distinctPasses: true },
        projectileEventKinds: ['diablos-rock-volley'],
        originPart: 'tail',
        motion: [
            { beat: 'brace', label: '제자리 준비', ticks: 5, pose: 'brace' },
            { beat: 'turn-back', label: '뒤돌기', ticks: 5, rotation: 180, origin: 'part:torso', pose: 'brace', rotationEasing: 'accelerate' },
            { beat: 'tail-compress', label: '꼬리 높이 들어올리기', ticks: 6, rotation: 145, origin: 'part:torso', scaleX: .9, scaleY: .86, skewX: -8, pose: 'crouch', moveEasing: 'decelerate', rotationEasing: 'decelerate' },
            { beat: 'tail-slam-volley', label: '꼬리 원호 내려찍기 · 바위 발사', ticks: 4, rotation: 218, origin: 'part:torso', scaleX: 1.16, scaleY: 1.2, skewX: 10, pose: 'stretch-strong', moveEasing: 'snap', rotationEasing: 'snap', fx: 'tail-slam-arc', fxAnchor: 'tail', fxDurationTicks: 4 },
            { beat: 'volley-flight', label: '바위 3갈래 비행', ticks: 7, rotation: 218, origin: 'part:torso', scaleX: 1.16, scaleY: 1.2, skewX: 10, pose: 'stretch-strong', hit: true, hitOffsetTicks: 6, sfx: 'impact' },
            { beat: 'recoil', label: '내려찍기 반동', ticks: 5, rotation: 196, origin: 'part:torso', scaleX: 1.03, scaleY: .96, pose: 'land', rotationEasing: 'decelerate' },
            { beat: 'recover', label: '꼬리 회수', ticks: 5, rotation: 180, origin: 'part:torso', scaleX: 1, scaleY: 1, pose: 'settle', rotationEasing: 'decelerate' },
            { beat: 'return', label: '제자리 복귀', ticks: 8, to: 'home', pose: 'idle', rotation: 180, origin: 'part:torso', scaleX: 1, scaleY: 1, moveEasing: 'decelerate' }
        ],
        impactTimeline: [
            { atTicks: 26, launchAtTicks: 19, targetMode: 'all-prepared', damageScale: 1, eventKind: 'diablos-rock-volley', audioCue: 'rock', sourcePart: 'tail' }
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
        motion: [
            { beat: 'approach', label: '접근', ticks: 5, to: 'toward:target 82%', face: 'target', aimBodyAt: 'target', pose: 'stretch-soft', moveEasing: 'accelerate' },
            { beat: 'bite', label: '물어뜯기', ticks: 3, to: 'toward:target 106%', pose: 'stretch-strong', moveEasing: 'snap', hit: true, sfx: 'impact' },
            { beat: 'recoil', label: '반동', ticks: 3, to: 'toward:target 90%', pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 5, to: 'home', pose: 'idle' }
        ],
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
        motion: [
            { beat: 'side-hop', label: '측면 도약', ticks: 7, to: 'pair-flank:targets 150', face: 'target-group', pose: 'stretch-soft', moveEasing: 'snap' },
            { beat: 'shoulder-set', label: '어깨 들이밀기', ticks: 5, pose: 'brace', rotationToward: 14 },
            { beat: 'tackle', label: '철산고 충돌', ticks: 6, to: 'through-current:target-group 104%', bounds: 'reach', pose: 'stretch-strong', rotationToward: 22, moveEasing: 'slow-fast-slow', hit: true, sfx: 'impact', fx: 'target-impact-dust', fxAnchor: 'target', fxDurationTicks: 6 },
            { beat: 'step-back', label: '한걸음 후퇴', ticks: 6, to: 'toward:target 82%', pose: 'settle', rotation: 0 },
            { beat: 'return', label: '복귀', ticks: 6, to: 'home', pose: 'idle', moveEasing: 'decelerate' }
        ],
        targetDamageRatios: [0.30, 0.15],
        brokenPartTargetCaps: { tail: 1 },
        evidence: 'verified-complete-action',
        confidence: 'cross-checked-behavior'
    })
);

// Black Diablos shares the verified body-plan mechanics, but keeps a separate,
// more aggressive kit instead of inheriting normal Diablos tuning.
HUNT_MONSTER_PATTERN_OVERRIDES.diablos.forEach(pattern => {
    pattern.beatV2Approved = true;
});
HUNT_MONSTER_PATTERN_OVERRIDES.black_diablos = HUNT_MONSTER_PATTERN_OVERRIDES.diablos.map(pattern => ({
    ...pattern,
    // Review-editor motion belongs to the shared Diablos body plan. Keep the
    // authored Black Diablos combat tuning below, but resolve its BEAT graph
    // from the reviewed base pattern unless this variant receives an explicit
    // override of its own.
    motionOverrideSource: { monsterId: 'diablos', patternId: pattern.id },
    beatV2Approved: false,
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
        cooldown: 58, windup: 9, recovery: 14,
        motion: [
            { beat: 'rise', label: '고공 상승', ticks: 4, offsetY: -140, pose: 'stretch-soft' },
            { beat: 'line-up', label: '폭격 정렬', ticks: 4, face: 'target', pose: 'brace' },
            { beat: 'scale-barrage', label: '보라빛 폭린 투하', ticks: 3, to: 'target', pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'impact', label: '폭린 착탄', ticks: 1, hit: true, sfx: 'impact' },
            { beat: 'recover', label: '비행 후딜', ticks: 1, to: 'home', pose: 'idle' }
        ]
    }],
    ['seething_bazelgeuse.diving_explosion', '홍련 폭린 급강하', 'area', .58, {
        minTargets: 3, maxTargets: 4, actionClass: 'TailAttackTripleStartRedRelease', requiredState: 'enraged',
        tags: ['flight-only', 'area', 'blast', 'scale', 'heated-scale', 'landing-only'], flightTransition: 'land',
        cooldown: 90, windup: 14, recovery: 18, animationProfile: 'aerial-dive-explosion',
        motion: [
            { beat: 'rise', label: '고공 상승', ticks: 5, to: 'offscreen:top', opacity: 0, pose: 'stretch-soft' },
            { beat: 'dive-lineup', label: '급강하 조준', ticks: 5, at: 'offscreen:top', opacity: 0, face: 'target', pose: 'crouch' },
            { beat: 'dive', label: '홍련 급강하', ticks: 6, to: 'target', opacity: 1, pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact', label: '대폭발 착지', ticks: 1, pose: 'land', hit: true, sfx: 'explosion' },
            { beat: 'recover', label: '착지 후딜', ticks: 1, to: 'home', pose: 'idle' }
        ]
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
        motion: [
            { beat: 'backstep', label: '돌진 준비', ticks: 5, to: 'toward:target -12%', face: 'target', pose: 'crouch' },
            { beat: 'pass-one', label: '1차 직선 돌진', ticks: 9, to: 'offscreen:bottom', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact-one', label: '1차 충돌', ticks: 1, hit: true, sfx: 'impact' },
            { beat: 'turn-outside', label: '화면 밖 방향전환', ticks: 27, at: 'offscreen:top', opacity: 0, pose: 'brace' },
            { beat: 'impact-two', label: '2차 직선 충돌', ticks: 1, to: 'offscreen:bottom', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear', hit: true, sfx: 'impact' },
            { beat: 'final-lineup', label: '마지막 진입 정렬', ticks: 20, at: 'offscreen:top', opacity: 0, face: 'target', pose: 'brace' },
            { beat: 'final-approach', label: '목표 앞까지 돌진', ticks: 7, to: 'toward:target 84%', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear' },
            ...(branchKind === 'rock' ? [
                { beat: 'hop-home', label: '뒤로 폴짝 복귀', ticks: 8, to: 'home', pose: 'stretch-soft', moveEasing: 'snap' },
                { beat: 'rock-launch', label: '바위 투척', ticks: 1, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
                { beat: 'rock-recovery', label: '투척 후딜', ticks: 21, pose: 'settle' }
            ] : branchKind === 'spin' ? [
                { beat: 'slide-in', label: '미끄러지며 진입', ticks: 8, to: 'target', pose: 'land' },
                { beat: 'spin-impact', label: '전신 회전', ticks: 4, rotateByFacing: 360, origin: '50% 58%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
                { beat: 'spin-recovery', label: '회전 후딜', ticks: 18, to: 'home', pose: 'idle', rotation: 0 }
            ] : [
                { beat: 'bite-contact', label: '깨물기 사거리 진입', ticks: 8, to: 'target', pose: 'stretch-soft' },
                { beat: 'bite-one', label: '1차 깨물기', ticks: 5, to: 'target', pose: 'stretch-strong', hit: true, sfx: 'impact' },
                { beat: 'bite-two', label: '2차 깨물기', ticks: 3, rotateByFacing: -16, pose: 'stretch-strong', hit: true, sfx: 'impact' },
                { beat: 'bite-recovery', label: '깨물기 후딜', ticks: 14, to: 'home', pose: 'idle' }
            ])
        ],
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
        motion: [
            { beat: 'brace', label: '숨 들이쉬기', ticks: 6, pose: 'crouch' },
            { beat: 'sonic-roar', label: '충격 포효', ticks: 8, pose: 'stretch-strong', sfx: 'roar', hit: true },
            { beat: 'roar-hold', label: '포효 유지', ticks: 5, pose: 'brace' },
            { beat: 'recover', label: '포효 후딜', ticks: 6, pose: 'idle' }
        ],
        visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.foreleg_slam', '앞발 내려찍기', 'physical', .25, {
        maxTargets: 1, actionClass: 'FootAttack', tags: ['physical', 'target-contact', 'weak', 'ground-only'],
        cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .32,
        postActionRecoverySeconds: 1, movement: { ticks: 20, returnsToOrigin: true },
        impact: { visualRatio: .56 }, animationProfile: 'tigrex-foreleg-slam', animationDurationMs: 2000,
        motion: [
            { beat: 'approach', label: '앞발 접근', ticks: 7, to: 'toward:target 80%', face: 'target', pose: 'stretch-soft' },
            { beat: 'raise-foreleg', label: '앞발 들기', ticks: 4, pose: 'brace', rotationToward: -10 },
            { beat: 'foreleg-impact', label: '앞발 내려찍기', ticks: 2, to: 'target', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 7, to: 'home', pose: 'idle' }
        ],
        partUse: { mode: 'random-front-leg', brokenDamageMultiplier: .70 }, visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.bite', '깨물기', 'physical', .25, {
        maxTargets: 1, actionClass: 'Bite', tags: ['physical', 'target-contact', 'weak', 'ground-only'],
        cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .34,
        postActionRecoverySeconds: 1, movement: { ticks: 22, returnsToOrigin: true },
        impact: { visualRatio: .58 }, brokenPartDamageModifiers: { head: .75 },
        animationProfile: 'tigrex-bite', animationDurationMs: 1800, visualAnchors: TIGREX_ANCHORS
        , motion: [
            { beat: 'approach', label: '깨물기 접근', ticks: 8, to: 'toward:target 82%', face: 'target', pose: 'stretch-soft' },
            { beat: 'bite', label: '깨물기', ticks: 3, to: 'toward:target 108%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'recoil', label: '반동', ticks: 3, to: 'toward:target 92%', pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 8, to: 'home', pose: 'idle' }
        ]
    }],
    ['tigrex.double_bite', '연속 깨물기', 'physical', .25, {
        maxTargets: 1, actionClass: 'DoubleBite', tags: ['physical', 'target-contact', 'weak', 'multi-hit', 'ground-only'],
        cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .42,
        postActionRecoverySeconds: 1.5, movement: { ticks: 30, returnsToOrigin: true },
        impactTimeline: [{ atTicks: 10 }, { atTicks: 15 }],
        motion: [
            { beat: 'approach', label: '연속 물기 접근', ticks: 10, to: 'toward:target 84%', face: 'target', pose: 'stretch-soft' },
            { beat: 'bite-one', label: '1차 깨물기', ticks: 5, to: 'target', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'bite-two', label: '2차 깨물기', ticks: 3, rotateByFacing: -18, pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'recoil', label: '깨물기 반동', ticks: 4, to: 'toward:target 90%', pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 8, to: 'home', pose: 'idle' }
        ],
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
        motion: [
            { beat: 'approach', label: '회전 사거리 진입', ticks: 6, to: 'toward:target 72%', face: 'target', pose: 'brace' },
            { beat: 'wind', label: '회전 준비', ticks: 3, rotateByFacing: -28, pose: 'crouch' },
            { beat: 'spin', label: '전신 회전', ticks: 4, rotateByFacing: 360, origin: '50% 58%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'recover', label: '회전 후딜', ticks: 3, to: 'home', pose: 'idle', rotation: 0 }
        ],
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
        motion: [
            { beat: 'brace', label: '투척 준비', ticks: 5, face: 'target', pose: 'crouch' },
            { beat: 'foreleg-scoop', label: '앞발로 바위 긁기', ticks: 7, rotateByFacing: -18, pose: 'brace' },
            { beat: 'rock-launch', label: '바위 발사', ticks: 1, pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'rock-impact', label: '바위 착탄', ticks: 1, hit: true, sfx: 'impact' },
            { beat: 'recover', label: '투척 후딜', ticks: 8, pose: 'idle' }
        ],
        animationProfile: 'tigrex-rock-shot', visualAnchors: TIGREX_ANCHORS
    }],
    ['tigrex.leap', '도약 덮치기', 'charge', .50, {
        maxTargets: 1, actionClass: 'JumpAttack', tags: ['charge', 'target-contact', 'strong', 'ground-only'],
        chargeMode: 'single', cooldown: 1, weight: .10, maxConsecutiveUses: 99, monsterAtbCost: .58,
        postActionRecoverySeconds: 3, movement: { ticks: 24, returnsToOrigin: true, returnTicks: 15 },
        impact: { visualRatio: .68 }, animationProfile: 'tigrex-leap', animationDurationMs: 2400, visualAnchors: TIGREX_ANCHORS,
        motion: [
            { beat: 'spring-load', label: '도약 압축', ticks: 5, pose: 'crouch', face: 'target', scaleY: .82 },
            { beat: 'leap', label: '수직 도약', ticks: 7, to: 'toward:target 72%', offsetY: -150, pose: 'stretch-strong', moveEasing: 'snap' },
            { beat: 'descend', label: '목표로 낙하', ticks: 5, to: 'target', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact', label: '도약 덮치기', ticks: 2, to: 'below:target 24', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 5, to: 'home', pose: 'idle' }
        ]
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
        weight: 0.13, cooldown: 88, monsterAtbCost: 0.44,
        motion: [
            { beat: 'brace', label: '몸 낮추기', ticks: 2, pose: 'crouch' },
            { beat: 'roar', label: '포효', ticks: 4, pose: 'stretch-strong', sfx: 'roar' },
            { beat: 'settle', label: '자세 회복', ticks: 3, pose: 'idle' }
        ]
    }],

    // ── 평상시 · 근접 모드 ──────────────────────────────────────────────────
    ['nargacuga.quick_bite', '재빠른 물어뜯기', 'physical', 0.286, {
        sourceMoveNameJA: '噛みつき', maxTargets: 1, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['physical', 'ground-only', 'target-contact', 'weak', 'stance-melee'],
        monsterAtbCost: 0.30, movement: { ticks: 16 },
        impactTimeline: [{ atTicks: 11, damageScale: 1 }],
        motion: [
            { beat: 'windup', ticks: 5, pose: 'crouch' },
            { beat: 'approach', ticks: 6, to: 'target', align: 'part:head', pose: 'stretch-soft' },
            { beat: 'bite', ticks: 2, to: 'target', align: 'part:head', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'return', ticks: 3, to: 'home', pose: 'idle' }
        ],
        animationProfile: 'nargacuga-dash-bite', animationDurationMs: 1600,
        originPart: 'head', maxConsecutiveUses: 2,
        brokenPartDamageModifiers: { head: 0.82 }
    }],
    // 꼬리는 상단에서 좌상단(←)을 향해 뻗어 있다. 그 꼬리로 찌르듯 135도 반시계로
    // 쫀득하게 돌려 꽂고, 같은 경로를 역회전으로 되짚어 복귀한다.
    ['nargacuga.tail_whip', '꼬리 후려치기', 'area', 0.33, {
        sourceMoveNameJA: '尻尾薙ぎ払い', minTargets: 2, maxTargets: 2, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['area', 'tail', 'ground-only', 'target-contact', 'stance-melee'],
        monsterAtbCost: 0.52, movement: { ticks: 24 },
        // 지정한 대상을 겨눠 찌르는 기술이라 좌/우 절반 고정 분배(left-right-halves)를
        // 쓰면 안 된다. 그 모드는 표적을 무시하고 늘 1·2 / 3·4로만 나눈다.
        // 모드를 아예 비워두면 기본 레인 창(defaultTargets)이 그대로 쓰여, 고른 표적과
        // 상관없는 사람들이 맞는다. 주 표적과 이웃 하나를 훑는 1패스로 고정한다.
        targeting: { mode: 'primary-flank-passes', passCount: 1 },
        impactTimeline: [{ atTicks: 15, damageScale: 1 }],
        // 편집기의 네 구간이 실제 모션을 직접 소유한다. 이전 CSS 프로필은
        // 타격점을 전체 길이의 62.5%에 고정해, 구간 틱을 바꿔도 화면과 판정이
        // 어긋났다. 저장된 override는 같은 beat id에 병합되므로 새로고침 뒤에도
        // 전조/접근·휘두르기/접촉 유지/복귀가 편집한 폭 그대로 재생된다.
        motion: [
            { beat: 'telegraph', label: '전조', ticks: 5, pose: 'crouch', face: 'target' },
            { beat: 'action-1', label: '접근·휘두르기', ticks: 10, to: 'target', align: 'part:tail', bounds: 'reach', pose: 'tail-whip', moveEasing: 'slow-fast-slow' },
            { beat: 'impact-1', label: '꼬리 접촉', ticks: 2, to: 'target', align: 'part:tail', bounds: 'reach', pose: 'settle', hit: true, sfx: 'impact' },
            { beat: 'action-2', label: '회수·복귀', ticks: 8, to: 'home', pose: 'idle', moveEasing: 'decelerate', rotationEasing: 'decelerate' }
        ],
        // 꼬리가 표적에 닿아야 하므로 접근 배율을 줄이지 않는다.
        animationGeometry: { approachX: 1 },
        animationProfile: 'nargacuga-tail-whip', animationDurationMs: 2400,
        originPart: 'tail', statusBlockedWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.68 }
    }],
    // 역회전 연계와 같은 방식이되 1회전이다. 주 표적 바로 위에서 제자리로 돌며,
    // 고른 이웃이 왼쪽이면 하단 좌측 축 · 시계 회전, 오른쪽이면 하단 우측 축 · 반시계.
    ['nargacuga.tail_sweep', '꼬리 회전', 'area', 0.374, {
        sourceMoveNameJA: '尻尾回転', minTargets: 2, maxTargets: 2, windup: 5, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['area', 'tail', 'ground-only', 'target-contact', 'stance-melee'],
        monsterAtbCost: 0.62, movement: { ticks: 26 },
        targeting: { mode: 'primary-flank-passes', passCount: 1 },
        impactTimeline: [{ atTicks: 18, damageScale: 1 }],
        motion: [
            { beat: 'center', label: '회전 위치 진입', ticks: 8, to: 'toward:target 70%', face: 'target', pose: 'brace' },
            { beat: 'wind', label: '꼬리 감기', ticks: 10, rotateByFacing: -42, origin: '62% 28%', pose: 'crouch' },
            { beat: 'sweep', label: '꼬리 반회전', ticks: 2, rotateByFacing: 180, origin: '62% 28%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'follow-through', label: '회전 관성', ticks: 2, rotateByFacing: 180, origin: '62% 28%', pose: 'land' },
            { beat: 'return', label: '복귀', ticks: 4, to: 'home', pose: 'idle', rotation: 0 }
        ],
        animationProfile: 'nargacuga-pivot-spin', animationDurationMs: 2600,
        originPart: 'tail',
        brokenPartDamageModifiers: { tail: 0.68 }
    }],
    // 분노판과 같은 내려찍기지만 1회. 꼬리가 땅에 박혀 3초(30틱) 후딜을 갖는다.
    ['nargacuga.spiked_tail_slam', '가시 꼬리 내려찍기', 'physical', 0.517, {
        sourceMoveNameJA: '棘尻尾叩きつけ', maxTargets: 1, windup: 9, recovery: 30,
        forbiddenStates: ['enraged'],
        tags: ['physical', 'tail', 'target-contact', 'strong', 'stance-melee'],
        monsterAtbCost: 0.72, movement: { ticks: 55 },
        impactTimeline: [{ atTicks: 22, damageScale: 1 }],
        // 재설계 4단계 시범 이전. 이 패턴만 비트 경로를 탄다(나머지 14개는 종전
        // 키프레임 그대로다). 옛 구조로는 표현 자체가 불가능했던 동작이라 골랐다 —
        // 컨테이너 하나가 이동·회전을 다 가지면 "몸은 두고 꼬리만 휘두르기"가
        // 안 된다. 축을 꼬리에 두면 몸이 지름 368px 호를 그렸다(이미지가 380px).
        //
        // 접근은 헌터 상단으로만 간다. 접합(align)을 접근에 걸면 몸이 헌터보다
        // 아래로 내려온다 — 꼬리가 이미지 위쪽(17%)이라 꼬리를 얹으려면 몸을
        // 아래로 밀어야 하기 때문이다. 그래서 접합은 내려찍는 순간에만 건다.
        // 그 순간 tail-slam이 꼬리를 축으로 180도 돌므로, 꼬리는 헌터 위에 남고
        // 몸이 위로 넘어간다. 축이 곧 접합점이라 회전이 접합을 흩뜨리지 않는다.
        //
        // 틱 합 55 = animationDurationMs 5500, 접촉 22틱 = impactTimeline과 일치.
        // 타이밍은 그대로 두고 그림만 바꿨다.
        motion: [
            { beat: 'windup', ticks: 9, pose: 'crouch' },
            { beat: 'rise', ticks: 8, to: 'above:target 300', pose: 'stretch' },
            // 내려찍기 직전부터 꼬리를 길게 편다. slam에서 같은 축 보정을 유지하지
            // 않으면 180도 회전 보간 중 꼬리가 먼저 접힌 뒤 내려치는 것처럼 보인다.
            { beat: 'aim', ticks: 5, to: 'above:target 260', pose: 'stretch-soft', scaleX: .92, scaleY: 1.20 },
            // bounds 'reach' — 접합 보정이 채팅 안전선을 넘어야 한다. 여기서는 회전축이
            // 곧 접합 부위(꼬리)라, 180도 회전이 몸을 도로 위로 올린다.
            { beat: 'slam', ticks: 3, to: 'target', align: 'part:tail', bounds: 'reach', pose: 'tail-slam', scaleX: .92, scaleY: 1.08, hit: true, sfx: 'impact' },
            // 꼬리가 박힌 채 버틴다. 회전은 유지되고 idle이 풀어준다.
            { beat: 'brace', ticks: 26, pose: 'brace' },
            { beat: 'return', ticks: 4, to: 'home', pose: 'idle' }
        ],
        // 꼬리가 표적에 닿아야 하므로 접근 배율을 줄이지 않는다.
        animationGeometry: { approachX: 1 },
        animationProfile: 'nargacuga-turn-tail-slam', animationDurationMs: 5500,
        originPart: 'tail',
        whiffReaction: { kind: 'stuck', durationTicks: 30 },
        statusBlockedWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.65 }
    }],

    // ── 평상시 · 원거리 모드 ────────────────────────────────────────────────
    // 측면으로 도약한 뒤 표적 방향으로 화면 밖까지 꿰뚫는다.
    ['nargacuga.cutwing_barrage', '칼날깃 연격', 'charge', 0.374, {
        sourceMoveNameJA: '斬翅連撃', minTargets: 1, maxTargets: 2, windup: 6, recovery: 1,
        forbiddenStates: ['enraged'],
        tags: ['charge', 'ground-only', 'target-contact', 'stance-ranged'],
        monsterAtbCost: 0.58, movement: { ticks: 34, untargetable: true },
        targeting: { mode: 'adjacent-lane' },
        impactTimeline: [{ atTicks: 24, damageScale: 1 }],
        motion: [
            { beat: 'flank-hop', label: '측면 도약', ticks: 10, to: 'flank:target 180', face: 'target', pose: 'stretch-soft', moveEasing: 'snap' },
            { beat: 'circle', label: '사각 파고들기', ticks: 8, to: 'toward:target 66%', opacity: .55, pose: 'brace' },
            { beat: 'lunge', label: '칼날깃 돌진', ticks: 6, to: 'target', opacity: 1, pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact', label: '칼날깃 적중', ticks: 2, hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 8, to: 'home', pose: 'idle' }
        ],
        animationProfile: 'nargacuga-flank-charge', animationDurationMs: 3400,
        brokenPartDamageModifiers: { 'left-wing': 0.78, 'right-wing': 0.78 }
    }],
    // 시그니처. 화면 밖으로 도약해 사라진 뒤 측면·후면에서 한 팔을 내밀며 파고든다.
    ['nargacuga.leaping_cutwing', '도약 칼날깃 급습', 'charge', 0.462, {
        sourceMoveNameJA: '跳躍斬翅', minTargets: 1, maxTargets: 1, windup: 8, recovery: 1,
        forbiddenStates: ['enraged'], cooldown: 46, weight: 1.15,
        tags: ['charge', 'ambush', 'vanish', 'target-contact', 'strong', 'stance-ranged'],
        monsterAtbCost: 0.74,
        movement: { ticks: 31, untargetable: true },
        impactTimeline: [{ atTicks: 21, damageScale: 1 }],
        // 31틱 전체를 실전과 검수기가 함께 읽는 단일 비트 모션으로 저작한다.
        // 측후방 페이드인이 끝난 뒤 3틱 동안 조준 자세를 노출하고 급습한다.
        // hit 비트 시작이 곧 21틱 판정이다.
        motion: [
            { beat: 'windup', label: '도약 압축', ticks: 5, pose: 'crouch', sfx: 'start' },
            { beat: 'leap-out', label: '화면 밖 도약', ticks: 4, to: 'offscreen:left', offsetY: -280, pose: 'stretch', fade: 'out', alignRotationToTravel: true, moveEasing: 'accelerate' },
            { beat: 'vanish', label: '사각 이동', ticks: 3, pose: 'stretch', opacity: 0 },
            // 출현 비트를 직접 선택하거나 스크럽해도 첫 프레임부터 보여야 한다.
            // fade-in은 비트 시작을 투명 상태로 남겨 실제로는 다음 조준 비트에서
            // 갑자기 나타나는 것처럼 보였으므로, 숨은 이동이 끝나는 경계에서 즉시
            // 측후방 좌표와 가시성을 확정한다.
            { beat: 'reappear', label: '측후방 출현', ticks: 2, at: 'polar:target 315deg 700', face: 'target', bounds: 'reach', pose: 'crouch', opacity: 1, instantOpacity: true, aimBodyAt: 'target' },
            { beat: 'ambush-aim', label: '측후방 조준', ticks: 3, face: 'target', pose: 'crouch', opacity: 1, aimBodyAt: 'target' },
            { beat: 'dive', label: '칼날깃 급습', ticks: 4, to: 'target', face: 'target', align: 'part:left-wing', bounds: 'reach', pose: 'stretch-strong', alignRotationToTravel: true, moveEasing: 'accelerate' },
            { beat: 'impact', label: '칼날깃 충돌', ticks: 2, to: 'target', align: 'part:left-wing', bounds: 'reach', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'pass-through', label: '관통 이탈', ticks: 4, to: 'offscreen:right', offsetY: 620, pose: 'stretch', fade: 'out', alignRotationToTravel: true, moveEasing: 'accelerate' },
            { beat: 'return', label: '상단 복귀', ticks: 4, at: 'offscreen:top', to: 'home', pose: 'idle', fade: 'in', moveEasing: 'decelerate' }
        ],
        // 급습은 표적 좌표까지 온전히 도달해야 한다. 기본 접근 배율(.92)은 헌터
        // 앞에서 멈추라고 넣은 값인데, 45도 아래에서 뛰어드는 이 패턴에서는
        // 표적 중심에서 안쪽으로 밀려 좌측 헌터를 노릴 때 우측을 때리게 된다.
        animationGeometry: { approachX: 1 },
        animationProfile: 'nargacuga-leap-ambush', animationDurationMs: 3100,
        originPart: 'left-wing',
        brokenPartDamageModifiers: { 'left-wing': 0.76, 'right-wing': 0.76 }
    }],
    // 화면 밖으로 빠진 뒤 돌진 모션으로 되돌아온다.
    ['nargacuga.lunge_chain', '연속 런지 돌진', 'charge', 0.385, {
        sourceMoveNameJA: '連続突進', minTargets: 1, maxTargets: 2,
        windup: 6, recovery: 1, forbiddenStates: ['enraged'], cooldown: 40,
        tags: ['charge', 'ground-only', 'target-contact', 'stance-ranged'],
        monsterAtbCost: 0.70,
        movement: { ticks: 56, untargetable: true },
        targeting: { mode: 'independent-passes', passCount: 2 },
        impactTimeline: [
            { atTicks: 24, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 48, targetMode: 'sequential', damageScale: 1 }
        ],
        motion: [
            { beat: 'line-up', label: '1차 정렬', ticks: 8, face: 'pass:1', pose: 'crouch' },
            { beat: 'lunge-one', label: '1차 런지', ticks: 16, to: 'pass:1', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact-one', label: '1차 적중', ticks: 2, to: 'offscreen:bottom', hit: true, sfx: 'impact' },
            { beat: 'turn-outside', label: '화면 밖 전환', ticks: 10, at: 'offscreen:top', opacity: 0, face: 'pass:2', pose: 'brace' },
            { beat: 'lunge-two', label: '2차 런지', ticks: 12, to: 'pass:2', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact-two', label: '2차 적중', ticks: 2, to: 'offscreen:bottom', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 6, at: 'offscreen:top', to: 'home', pose: 'idle' }
        ],
        // 1타가 급습과 같은 구조이므로 접근 배율도 같이 맞춘다(표적 좌표까지 온전히 도달).
        animationGeometry: { approachX: 1 },
        animationProfile: 'nargacuga-offscreen-charge', animationDurationMs: 5600
    }],
    ['nargacuga.quill_shot', '가시깃 사출', 'projectile', 0.363, {
        sourceMoveNameJA: '棘飛ばし', minTargets: 1, maxTargets: 3, windup: 5, recovery: 1,
        tags: ['projectile', 'tail', 'bleed', 'ground-hazard', 'stance-ranged'],
        monsterAtbCost: 0.48,
        delivery: 'projectile', movement: { ticks: 26 },
        projectileLaunchDelayTicks: 9,
        impactTimeline: [
            { atTicks: 15, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 23, targetMode: 'sequential', damageScale: 0.80 }
        ],
        motion: [
            { beat: 'aim', label: '꼬리깃 조준', ticks: 8, face: 'target', pose: 'brace' },
            { beat: 'fan-open', label: '가시깃 펼치기', ticks: 7, rotateByFacing: -22, origin: '62% 28%', pose: 'crouch' },
            { beat: 'shot-one', label: '1차 사출', ticks: 1, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 're-aim', label: '재조준', ticks: 7, rotateByFacing: 18, pose: 'brace' },
            { beat: 'shot-two', label: '2차 사출', ticks: 1, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 'recover', label: '사출 후딜', ticks: 2, pose: 'idle' }
        ],
        animationProfile: 'ranged-cast', animationDurationMs: 2600,
        originPart: 'tail',
        // 부착 FX(꼬리에서 떨어지는 다이아)를 두지 않는다. 2.6초에 걸쳐 아래로
        // 흘러내려, 정작 표적으로 날아가는 날과 겹쳐 연출이 산만해졌다.
        // 이 패턴의 연출은 날아가는 날 하나로 끝난다.
        forbiddenWhenBroken: ['tail'],
        brokenPartDamageModifiers: { tail: 0.70 }
    }],

    // ── 모드 전환 ───────────────────────────────────────────────────────────
    // 30초마다 강제 선택되어 근접↔원거리 모드를 바꾼다. 화면 밖으로 도약해 사라졌다가
    // 제자리에 Fade in으로 돌아오며, 좌/우를 무작위로 골라 2회 연속으로 뛴다.
    ['nargacuga.reposition_hop', '견제 도약', 'physical', 0.242, {
        sourceMoveNameJA: '牽制跳躍', maxTargets: 1, windup: 4, recovery: 1,
        tags: ['physical', 'mobility', 'vanish', 'stance-switch'],
        monsterAtbCost: 0.26,
        movement: { ticks: 30, untargetable: true },
        impactTimeline: [{ atTicks: 24, damageScale: 1 }],
        motion: [
            { beat: 'vanish-hop', label: '화면 밖 도약', ticks: 6, to: 'offscreen:top', opacity: 0, pose: 'stretch-soft' },
            { beat: 'flank-shift', label: '측면 재배치', ticks: 10, at: 'flank:target 240', opacity: 0, face: 'target', pose: 'crouch' },
            { beat: 'reappear', label: '재출현', ticks: 8, opacity: 1, pose: 'stretch-soft' },
            { beat: 'feint', label: '견제 타격', ticks: 2, to: 'toward:target 82%', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 4, to: 'home', pose: 'idle' }
        ],
        animationProfile: 'nargacuga-stance-hop', animationDurationMs: 3000,
        weight: 0.35, maxConsecutiveUses: 1
    }],

    // ── 분노 전용 (모드 무시, 전부 원거리에서 파고든다) ─────────────────────
    // 도약해 깨물고, 꼬리를 회전시키며 제자리로 돌아온다. 두 동작 모두 타격이다.
    ['nargacuga.double_bite', '연속 물어뜯기', 'physical', 0.396, {
        sourceMoveNameJA: '連続噛みつき', minTargets: 1, maxTargets: 2,
        windup: 5, recovery: 1, state: 'enraged', cooldown: 30,
        tags: ['physical', 'target-contact', 'multi-hit'], monsterAtbCost: 0.56,
        movement: { ticks: 36, untargetable: true },
        targeting: { mode: 'independent-passes', passCount: 2 },
        impactTimeline: [
            { atTicks: 16, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 30, targetMode: 'sequential', damageScale: 0.82 }
        ],
        motion: [
            { beat: 'windup', ticks: 5, pose: 'crouch' },
            { beat: 'approach-1', ticks: 11, to: 'pass:1', align: 'part:head', pose: 'stretch-soft' },
            { beat: 'bite-1', ticks: 3, to: 'pass:1', align: 'part:head', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'approach-2', ticks: 11, to: 'pass:2', align: 'part:head', pose: 'stretch-soft' },
            { beat: 'bite-2', ticks: 2, to: 'pass:2', align: 'part:head', pose: 'land', hit: true, damageScale: 0.82, sfx: 'impact' },
            { beat: 'return', ticks: 4, to: 'home', pose: 'idle' }
        ],
        animationProfile: 'nargacuga-bite-spin-return', animationDurationMs: 3600,
        originPart: 'head',
        brokenPartDamageModifiers: { head: 0.82, tail: 0.74 }
    }],
    // 이탈 → 공격을 3회 반복하고 제자리로 회귀한다(회귀 시 후딜 음성).
    ['nargacuga.leaping_cutwing_triple', '도약 칼날깃 3연 급습', 'charge', 0.462, {
        sourceMoveNameJA: '跳躍斬翅・三連', minTargets: 1, maxTargets: 3,
        windup: 9, recovery: 12, state: 'enraged', cooldown: 62, weight: 0.46,
        tags: ['charge', 'ambush', 'vanish', 'target-contact', 'multi-hit', 'strong'],
        monsterAtbCost: 0.92,
        movement: { ticks: 66, untargetable: true },
        // 세 번의 급습이 각각 다른 헌터를 노린다. 같은 대상을 두 번 치면
        // 화면 밖으로 빠졌다 되돌아오는 연출의 의미가 없어진다.
        targeting: { mode: 'independent-passes', passCount: 3, distinctPasses: true },
        impactTimeline: [
            { atTicks: 22, targetMode: 'sequential', damageScale: 1, hitReactionKind: 'weak' },
            { atTicks: 38, targetMode: 'sequential', damageScale: 0.92, hitReactionKind: 'weak' },
            { atTicks: 54, targetMode: 'sequential', damageScale: 0.92 }
        ],
        motion: [
            { beat: 'vanish', label: '도약 이탈', ticks: 6, to: 'offscreen:top', opacity: 0, pose: 'stretch-soft' },
            { beat: 'aim-one', label: '1차 측후방 출현', ticks: 6, at: 'polar:pass:1 315deg 620', opacity: 1, face: 'pass:1', pose: 'crouch' },
            { beat: 'dive-one', label: '1차 급습', ticks: 10, to: 'pass:1', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact-one', label: '1차 적중', ticks: 2, hit: true, sfx: 'impact' },
            { beat: 'aim-two', label: '2차 재출현', ticks: 6, at: 'polar:pass:2 45deg 620', opacity: 1, face: 'pass:2', pose: 'crouch' },
            { beat: 'dive-two', label: '2차 급습', ticks: 8, to: 'pass:2', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact-two', label: '2차 적중', ticks: 2, hit: true, sfx: 'impact' },
            { beat: 'aim-three', label: '3차 재출현', ticks: 6, at: 'polar:pass:3 315deg 620', opacity: 1, face: 'pass:3', pose: 'crouch' },
            { beat: 'dive-three', label: '3차 급습', ticks: 8, to: 'pass:3', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'impact-three', label: '3차 적중', ticks: 2, hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 10, to: 'home', pose: 'idle' }
        ],
        animationGeometry: { approachX: 1 },
        animationProfile: 'nargacuga-leap-ambush-triple', animationDurationMs: 6600,
        originPart: 'left-wing',
        brokenPartDamageModifiers: { 'left-wing': 0.76, 'right-wing': 0.76 }
    }],
    // 주 표적 바로 위에 자리를 잡고, 그 자리에서 축만 바꿔 두 번 돈다.
    // 1회전은 하단 좌측 축 · 시계 방향이라 주 표적과 왼쪽 헌터에 닿고,
    // 2회전은 하단 우측 축 · 반시계 방향이라 주 표적과 오른쪽 헌터에 닿는다.
    // 주 표적은 두 번 다 맞는다.
    ['nargacuga.tail_sweep_reverse', '역회전 연계 꼬리 회전', 'area', 0.374, {
        sourceMoveNameJA: '尻尾回転・逆回転', minTargets: 2, maxTargets: 3,
        windup: 5, recovery: 1, state: 'enraged', cooldown: 44,
        tags: ['area', 'tail', 'target-contact', 'multi-hit'],
        monsterAtbCost: 0.78, movement: { ticks: 44 },
        targeting: { mode: 'primary-flank-passes' },
        impactTimeline: [
            { atTicks: 18, targetMode: 'pair', damageScale: 1 },
            { atTicks: 38, targetMode: 'pair', damageScale: 1 }
        ],
        motion: [
            { beat: 'center', label: '회전 위치 진입', ticks: 8, to: 'arena:center-lower .56', face: 'target', pose: 'brace' },
            { beat: 'wind-one', label: '정회전 준비', ticks: 10, rotateByFacing: -42, origin: '62% 28%', pose: 'crouch' },
            { beat: 'spin-one', label: '정회전', ticks: 2, rotateByFacing: 180, origin: '62% 28%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'wind-two', label: '역회전 준비', ticks: 18, rotateByFacing: 42, origin: '62% 28%', pose: 'brace' },
            { beat: 'spin-two', label: '역회전', ticks: 2, rotateByFacing: -180, origin: '62% 28%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'return', label: '복귀', ticks: 4, to: 'home', pose: 'idle', rotation: 0 }
        ],
        animationProfile: 'nargacuga-twin-pivot-spin', animationDurationMs: 4400,
        originPart: 'tail', brokenPartTargetCaps: { tail: 2 },
        brokenPartDamageModifiers: { tail: 0.68 }
    }],
    // 헌터 앞으로 펄쩍 뛰어 붙고 꼬리를 살랑인 뒤, 뒤돌며 늘어난 형상이 내리꽂힌다.
    // 뒤돌기와 내려치기는 한 동작으로 매우 빠르게 일어난다. 2회 내려친 뒤 꼬리가
    // 땅에 박혀 3초(30틱) 후딜을 갖고, 제자리로 뛰어서 복귀한다.
    ['nargacuga.furious_tail_slam', '격노 연속 꼬리 내려찍기', 'physical', 0.517, {
        sourceMoveNameJA: '激昂尻尾連続叩きつけ', minTargets: 1, maxTargets: 2,
        windup: 11, recovery: 30, state: 'enraged', cooldown: 58, weight: 0.52,
        tags: ['physical', 'tail', 'target-contact', 'multi-hit', 'strong'],
        monsterAtbCost: 0.88, movement: { ticks: 80 },
        targeting: { mode: 'independent-passes', passCount: 2 },
        impactTimeline: [
            { atTicks: 26, targetMode: 'sequential', damageScale: 1 },
            { atTicks: 44, targetMode: 'sequential', damageScale: 1 }
        ],
        motion: [
            { beat: 'wind-one', label: '1차 꼬리 준비', ticks: 8, pose: 'crouch' },
            { beat: 'rise-one', label: '1차 도약', ticks: 8, to: 'above:pass:1 280', pose: 'stretch-soft' },
            { beat: 'aim-one', label: '1차 조준', ticks: 10, face: 'pass:1', origin: '62% 28%', pose: 'brace' },
            { beat: 'slam-one', label: '1차 내려찍기', ticks: 3, to: 'pass:1', rotateByFacing: 180, origin: '62% 28%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'rebound', label: '꼬리 뽑기', ticks: 7, to: 'above:pass:2 240', pose: 'stretch-soft' },
            { beat: 'aim-two', label: '2차 조준', ticks: 8, face: 'pass:2', pose: 'brace' },
            { beat: 'slam-two', label: '2차 내려찍기', ticks: 3, to: 'pass:2', rotateByFacing: 180, origin: '62% 28%', pose: 'stretch-strong', hit: true, sfx: 'impact' },
            { beat: 'stuck', label: '꼬리 박힘 후딜', ticks: 23, pose: 'brace' },
            { beat: 'return', label: '복귀', ticks: 10, to: 'home', pose: 'idle', rotation: 0 }
        ],
        // 꼬리가 표적에 닿아야 하므로 접근 배율을 줄이지 않는다.
        animationGeometry: { approachX: 1 },
        animationProfile: 'nargacuga-turn-tail-slam-double', animationDurationMs: 8000,
        originPart: 'tail',
        whiffReaction: { kind: 'stuck', durationTicks: 30 },
        statusBlockedWhenBroken: ['tail'], brokenPartTargetCaps: { tail: 1 },
        brokenPartDamageModifiers: { tail: 0.65 }
    }],
    // 3연 급습과 같은 이탈·급습 리듬이되, 마지막은 평범한 돌진으로 마무리한다.
    // 복귀 후 후딜과 함께 특유의 연계기 종료 음성이 재생된다.
    ['nargacuga.lunge_chain_triple', '3연 런지 돌진', 'charge', 0.385, {
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
        motion: [
            { beat: 'line-up-one', label: '1차 정렬', ticks: 6, face: 'pass:1', pose: 'crouch' },
            { beat: 'lunge-one', label: '1차 런지', ticks: 16, to: 'pass:1', pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact-one', label: '1차 적중', ticks: 2, to: 'offscreen:bottom', hit: true, sfx: 'impact' },
            { beat: 'turn-one', label: '1차 화면 밖 전환', ticks: 8, at: 'offscreen:top', opacity: 0, face: 'pass:2', pose: 'brace' },
            { beat: 'lunge-two', label: '2차 런지', ticks: 8, to: 'pass:2', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact-two', label: '2차 적중', ticks: 2, to: 'offscreen:bottom', hit: true, sfx: 'impact' },
            { beat: 'turn-two', label: '2차 화면 밖 전환', ticks: 8, at: 'offscreen:top', opacity: 0, face: 'pass:3', pose: 'brace' },
            { beat: 'lunge-three', label: '3차 런지', ticks: 12, to: 'pass:3', opacity: 1, pose: 'stretch-strong', moveEasing: 'linear' },
            { beat: 'impact-three', label: '마무리 적중', ticks: 2, to: 'offscreen:bottom', hit: true, sfx: 'narga-combo-finish' },
            { beat: 'return', label: '복귀', ticks: 8, at: 'offscreen:top', to: 'home', pose: 'idle' }
        ],
        // 1·2타가 급습과 같은 구조이므로 접근 배율도 같이 맞춘다(표적 좌표까지 온전히 도달).
        animationGeometry: { approachX: 1 },
        animationProfile: 'nargacuga-lunge-finish', animationDurationMs: 7200
    }]
]);

// 벨리오로스 — MHW:Iceborne 원종 기준으로 재조사해 재구축했다.
//
// 조사 근거(2026-08-09):
//   altema.jp/mhw/beriorosu  기술 7종의 일본어 원문 모션 설명
//     かみつき「前方に飛びかかりかみついて攻撃する」
//     尻尾攻撃「尻尾振り後方から前面に攻撃」「当たると氷やられ」
//     ショートタックル「横向きになり、ハンターにタックルする」
//     滑空攻撃「滑空しハンターに向かって飛びかかる」
//     回転ひっかき「前方に向かって飛びかかり、前脚で攻撃する」
//     叩きつけかみつき「ジャンプしハンターを攻撃する。攻撃時に振動が発生」
//     氷ブレス「氷ブレスを発射し着弾点に竜巻を発生させる」
//   gamewith.jp/mhw/163255   尻尾「一歩後退した後、尻尾を横振り」
//                            「通常のモンスターと違い先端が遅れてくる」
//                            棘破壊「ダウン状態になり、タックルで転倒可能」
//                            頭破壊「氷ブレス後の竜巻が残らなくなる」
//   fextralife / game8       앞발 파괴 시 "slips a lot", 탈진 시 브레스 불발
//                            위력 순서 slam 90 > 회전 70~75 > 활공 60 > 물기·꼬리 50
//
// 이전 구현에서 실제로 고친 것:
//   - 頭破壊 효과가 근거 없는 값(피해 .70 · 명중 .75)이었다. 실제 효과는
//     "브레스 뒤 竜巻이 남지 않는다"이므로 2타를 잃는 것으로 환산한다.
//   - 回転ひっかき과 空中ブレス 두 기술이 통째로 빠져 있었다.
//   - 물어뜯기가 측면으로 돌아 들어갔다. 원문은 前方に飛びかかり다.
//   - 꼬리 휩쓸기가 표적 쪽으로 다가갔다. 원문은 一歩後退した後다.
//     선단이 늦게 따라오는 특징도 없었다.
//   - 벽차기가 늘 화면 왼쪽으로 고정이었다. 표적 반대편에서 파생시킨다.
//   - 태클·활공·내려찍기가 모션 비트 없이 공용 프로파일로 떨어져 있었다.
HUNT_MONSTER_PATTERN_OVERRIDES.barioth = worldFlying([
    ['barioth.roar', '포효', 'roar', 0, {
        maxTargets: 4, actionClass: 'Roar', sourceMoveNameJA: '咆哮',
        tags: ['roar', 'transition-roar'], weight: .12, cooldown: 88, monsterAtbCost: .44,
        movement: { ticks: 9 },
        interference: { kind: 'roar', size: 'small' },
        motion: [
            { beat: 'brace', label: '몸 낮추기', ticks: 2, pose: 'crouch' },
            { beat: 'roar', label: '포효', ticks: 4, pose: 'stretch-strong', sfx: 'roar' },
            { beat: 'settle', label: '자세 회복', ticks: 3, pose: 'idle' }
        ]
    }],

    // 前方に飛びかかりかみついて攻撃する — 제자리에서 무는 것이 아니라 앞으로
    // 뛰어들며 문다. 그래서 접근 비트가 가속이고, 무는 순간이 곧 착지다.
    ['barioth.bite', '물어뜯기', 'physical', .22, {
        maxTargets: 1, actionClass: 'BiteSlammedLatter', sourceMoveNameJA: '噛みつき',
        tags: ['physical', 'ground-only', 'target-contact', 'weak', 'butt-stumble'], recovery: 1,
        monsterAtbCost: .26, movement: { ticks: 10 }, maxConsecutiveUses: 2,
        impactTimeline: [{ atTicks: 5, damageScale: 1 }],
        motion: [
            { beat: 'bite-load', label: '순간 압축', ticks: 1, pose: 'crouch', face: 'target', origin: 'part:head', scaleX: 1.06, scaleY: .88 },
            { beat: 'leaping-bite', label: '도약 물어뜯기', ticks: 4, to: 'toward:target 112%', align: 'part:mouth', pose: 'stretch-strong', face: 'target', origin: 'part:head', rotationToward: 16, scaleX: 1.16, scaleY: .88, moveEasing: 'snap', rotationEasing: 'accelerate' },
            { beat: 'bite-impact', label: '턱 충돌', ticks: 1, pose: 'brace', origin: 'part:head', rotationToward: 16, scaleX: 1.10, scaleY: .78, hit: true, sfx: 'impact' },
            { beat: 'bite-recoil', label: '짧은 반동', ticks: 1, to: 'toward:target 96%', pose: 'land', origin: 'part:head', rotationToward: 7, scaleX: .98, scaleY: 1.04, moveEasing: 'snap' },
            { beat: 'bite-return', label: '즉시 복귀', ticks: 3, to: 'home', pose: 'idle', rotation: 0, scaleX: 1, scaleY: 1, moveEasing: 'decelerate', rotationEasing: 'decelerate' }
        ],
        animationProfile: 'barioth-leaping-bite-contact', animationDurationMs: 1000,
        originPart: 'head', brokenPartDamageModifiers: { head: .82 }
    }],

    // 横向きになり、ハンターにタックルする — 옆으로 몸을 돌린 뒤 살짝 뛰고 몸통으로
    // 밀어붙인다. 앞발 스파이크가 부서지면 여기서 제동에 실패해 넘어진다
    // (棘破壊「タックルで転倒可能」) — slip-eligible이 그 계약이다.
    //
    // 이름은 철산고다. 국내 몬헌 커뮤니티가 빙아룡의 이 기술을 부르는 이름이고,
    // 원문 ショートタックル의 직역보다 이쪽이 통한다. 재구축 때 "숏 태클"로
    // 바꿨다가 되돌렸다 — 알아보는 이름을 번역 정확도로 갈아치우면 안 된다.
    ['barioth.shoulder_check', '철산고', 'physical', .32, {
        minTargets: 1, maxTargets: 2, actionClass: 'BiteSlammedLatterR', sourceMoveNameJA: 'ショートタックル',
        tags: ['physical', 'ground-only', 'target-contact', 'slip-eligible'], recovery: 1,
        monsterAtbCost: .48, movement: { ticks: 25 }, targeting: { mode: 'adjacent-lane' },
        impactTimeline: [{ atTicks: 13, damageScale: 1 }],
        motion: [
            { beat: 'spring-load', label: '도약 압축', ticks: 2, pose: 'crouch', face: 'target', scaleX: 1.10, scaleY: .80 },
            { beat: 'flank-hop', label: '측면 도약', ticks: 5, to: 'flank:target 210', pose: 'stretch-strong', face: 'target', scaleX: .90, scaleY: 1.14, moveEasing: 'snap' },
            { beat: 'shoulder-set', label: '어깨 들이밀기', ticks: 3, pose: 'brace', face: 'target', origin: 'part:torso', rotationToward: 12, scaleX: .96, scaleY: 1.06, rotationEasing: 'accelerate' },
            { beat: 'lateral-slam', label: '횡이동 충돌', ticks: 3, to: 'target', align: 'part:torso', pose: 'stretch-strong', origin: 'part:torso', rotationToward: 30, moveEasing: 'snap', rotationEasing: 'slow-fast-slow' },
            { beat: 'shoulder-impact', label: '철산고 충돌', ticks: 2, pose: 'brace', origin: 'part:torso', hit: true, sfx: 'impact' },
            { beat: 'slow-return', label: '느린 자세 복귀', ticks: 10, to: 'home', pose: 'brace', rotation: 0, scaleX: 1, scaleY: 1, moveEasing: 'decelerate', rotationEasing: 'decelerate' }
        ],
        animationProfile: 'side-tackle-contact', animationDurationMs: 2500,
        originPart: 'torso'
    }],

    // 前方に向かって飛びかかり、前脚で攻撃する — 벨리오로스 대표 기술인데 이전
    // 구현에 아예 없었다. 위력이 물기·꼬리(50)보다 높고 내려찍기(90)보다 낮은
    // 70~75대라 그 사이에 놓는다. 앞발 둘로 연속 두 번 긁는다.
    ['barioth.spin_claw', '회전 할퀴기', 'physical', .40, {
        minTargets: 1, maxTargets: 2, actionClass: 'JumpAttack', sourceMoveNameJA: '回転ひっかき',
        tags: ['physical', 'ground-only', 'target-contact', 'multi-hit', 'slip-eligible'], recovery: 1,
        monsterAtbCost: .54, movement: { ticks: 28 }, targeting: { mode: 'adjacent-lane' },
        impactTimeline: [
            { atTicks: 9, damageScale: 1 },
            { atTicks: 15, targetMode: 'repeat-previous', damageScale: .5 }
        ],
        motion: [
            { beat: 'step-back', ticks: 5, to: 'toward:target -32%', pose: 'brace', face: 'target', moveEasing: 'decelerate' },
            { beat: 'coil', ticks: 4, pose: 'crouch' },
            { beat: 'sweep', ticks: 6, to: 'target.top', align: 'part:tail', pose: 'tail-whip', hit: true, sfx: 'impact', moveEasing: 'slow-fast-slow' },
            { beat: 'tip-lag', ticks: 4, pose: 'settle', rotateBy: 26, origin: 'part:torso', hit: true, damageScale: .5 },
            { beat: 'unwind', ticks: 4, pose: 'brace', moveEasing: 'decelerate' },
            { beat: 'return', ticks: 5, to: 'home', pose: 'idle', moveEasing: 'smooth' }
        ],
        animationProfile: 'barioth-wide-tail-sweep', animationDurationMs: 2800,
        originPart: 'tail',
        weightWhenBroken: { 'left-front-leg': .72, 'right-front-leg': .72 }
    }],

    // 一歩後退した後、尻尾を横振りして攻撃する
    // 通常のモンスターと違い先端が遅れてくる
    // 이 두 가지가 벨리오로스 꼬리의 정체성이다. 이전 구현은 반대로 표적 쪽으로
    // 64% 다가갔고 선단 지연도 없었다. 물러남은 toward의 음수 비율로, 선단 지연은
    // 본 타격 뒤에 오는 약한 2타로 쓴다.
    ['barioth.tail_sweep', '꼬리 휩쓸기', 'area', .32, {
        minTargets: 2, maxTargets: 3, actionClass: 'TailAttackClockwise', sourceMoveNameJA: '尻尾なぎ払い',
        tags: ['area', 'tail', 'ice', 'ground-only', 'target-contact'], recovery: 1,
        monsterAtbCost: .52, movement: { ticks: 28 }, targeting: { mode: 'primary-flank-passes', passCount: 1 },
        impactTimeline: [
            { atTicks: 9, damageScale: 1 },
            { atTicks: 15, targetMode: 'repeat-previous', damageScale: .5 }
        ],
        motion: [
            { beat: 'step-back', ticks: 5, to: 'toward:target -32%', pose: 'brace', face: 'target', moveEasing: 'decelerate' },
            { beat: 'coil', ticks: 4, pose: 'crouch' },
            // 꼬리를 표적 상단에 얹는다. 표적 중심에 얹으면 벨리오로스 꼬리 앵커가
            // 이미지 위쪽(y .15)이라 몸이 133px 아래로 밀려 채팅 안전선을 넘는다.
            { beat: 'sweep', ticks: 6, to: 'target.top', align: 'part:tail', pose: 'tail-whip', hit: true, sfx: 'impact', moveEasing: 'slow-fast-slow' },
            // 몸이 멈춘 뒤에도 꼬리 끝이 계속 돌아 나온다. 몸통을 축으로 조금 더
            // 돌려 그 지연을 만든다.
            { beat: 'tip-lag', ticks: 4, pose: 'settle', rotateBy: 26, origin: 'part:torso', hit: true, damageScale: .5 },
            { beat: 'unwind', ticks: 4, pose: 'brace', moveEasing: 'decelerate' },
            { beat: 'return', ticks: 5, to: 'home', pose: 'idle', moveEasing: 'smooth' }
        ],
        animationProfile: 'barioth-wide-tail-sweep', animationDurationMs: 2800, originPart: 'tail',
        // 尻尾切断「判定が大きく縮まる」
        brokenPartDamageModifiers: { tail: .70 }, brokenPartTargetCaps: { tail: 1 },
        statusBlockedWhenBroken: ['tail']
    }],

    // 氷ブレスを発射し着弾点に竜巻を発生させる — 착탄(1타) 뒤 남는 회오리(2타).
    // 頭破壊「氷ブレス後の竜巻が残らなくなる」이므로 머리를 부수면 2타가 사라진다.
    // 지금 구조로는 타임라인 항목을 조건부로 뺄 수 없어, .55+.45 중 2타분을 잃는
    // 것으로 환산해 x.55를 쓴다. 상태이상도 남는 회오리가 거는 것이라 함께 막는다.
    // (이전 구현의 피해 .70 · 명중 .75는 어느 자료에도 없는 값이었다.)
    ['barioth.ice_tornado', '빙결 회오리 브레스', 'projectile', .30, {
        minTargets: 1, maxTargets: 2, actionClass: 'BreathNormal', sourceMoveNameJA: '氷ブレス',
        tags: ['projectile', 'ice', 'elemental', 'ground-hazard', 'butt-stumble'], recovery: 1,
        monsterAtbCost: .48, movement: { ticks: 30 }, delivery: 'projectile',
        projectileLaunchDelayTicks: 9, impact: { delayTicks: 18, survivesInterruption: true },
        impactTimeline: [
            { atTicks: 18, damageScale: .55 },
            { atTicks: 28, targetMode: 'repeat-previous', damageScale: .45 }
        ],
        motion: [
            // 사출은 projectileLaunchDelayTicks 9와 같은 틱에서 시작해야 한다.
            // 어긋나면 입이 열리기 전에 얼음이 날아가거나 그 반대가 된다.
            { beat: 'anchor-claws', ticks: 6, pose: 'crouch', face: 'target' },
            { beat: 'draw-breath', ticks: 3, pose: 'brace', scaleX: .94, scaleY: 1.06 },
            { beat: 'exhale', ticks: 3, pose: 'stretch-soft', sfx: 'projectile' },
            { beat: 'recoil', ticks: 6, pose: 'settle', offsetX: 18, moveEasing: 'decelerate' },
            { beat: 'watch-tornado', ticks: 7, pose: 'brace' },
            { beat: 'reset', ticks: 5, to: 'home', pose: 'idle' }
        ],
        animationProfile: 'barioth-ice-tornado-cast', animationDurationMs: 3000, originPart: 'mouth',
        impactFx: { emoji: '🌪️', className: 'barioth-ice-tornado', durationMs: 3600 },
        brokenPartDamageModifiers: { head: .55 },
        statusBlockedWhenBroken: ['head']
    }],

    // 滞空してから空中でブレスを吐く。지상 브레스와 예비 동작이 달라 별개 기술이다
    // (지상은 앞발을 박고 버티지만 이쪽은 떠오른 채 쏜다). 이전 구현에 없었다.
    ['barioth.hover_breath', '체공 빙결 브레스', 'projectile', .30, {
        minTargets: 1, maxTargets: 2, actionClass: 'BreathFly', sourceMoveNameJA: '空中氷ブレス',
        tags: ['projectile', 'ice', 'elemental', 'air-compatible', 'ground-hazard'], recovery: 1,
        cooldown: 40, monsterAtbCost: .52, movement: { ticks: 32 }, delivery: 'projectile',
        projectileLaunchDelayTicks: 13, impact: { delayTicks: 22, survivesInterruption: true },
        impactTimeline: [{ atTicks: 22, damageScale: 1 }],
        motion: [
            // 사출은 projectileLaunchDelayTicks 13과 같은 틱이다(5+6+2).
            { beat: 'wing-load', ticks: 5, pose: 'crouch', face: 'target' },
            { beat: 'lift', ticks: 6, to: 'above:home 190', pose: 'stretch', moveEasing: 'decelerate' },
            { beat: 'hover', ticks: 2, pose: 'stretch-soft' },
            { beat: 'exhale', ticks: 6, pose: 'stretch-strong', sfx: 'projectile' },
            { beat: 'hold-aim', ticks: 5, pose: 'settle' },
            { beat: 'descend', ticks: 8, to: 'home', pose: 'idle', moveEasing: 'decelerate' }
        ],
        animationProfile: 'barioth-ice-tornado-cast', animationDurationMs: 3200, originPart: 'mouth',
        impactFx: { emoji: '🌪️', className: 'barioth-ice-tornado', durationMs: 3600 },
        brokenPartDamageModifiers: { head: .70 },
        statusBlockedWhenBroken: ['head']
    }],

    // 벽에 붙었다가 차고 나오는 급습. 이전 구현은 늘 화면 왼쪽(left:home 420)으로
    // 고정이라 표적이 왼쪽에 있어도 왼쪽 벽으로 갔다. 표적 반대편에서 파생시킨다 —
    // toward의 음수 비율이 곧 "표적 반대 방향"이다.
    ['barioth.wall_pounce', '벽차기 급습', 'charge', .42, {
        maxTargets: 1, actionClass: 'JumpAttack', sourceMoveNameJA: '壁蹴り飛びかかり',
        tags: ['charge', 'wall-cling', 'ambush', 'target-contact', 'strong', 'slip-eligible'],
        cooldown: 48, recovery: 1, monsterAtbCost: .68, movement: { ticks: 42, untargetable: true },
        impactTimeline: [{ atTicks: 30, damageScale: 1 }],
        motion: [
            { beat: 'spot-wall', ticks: 4, pose: 'crouch', face: 'target' },
            { beat: 'wall-bound', ticks: 7, to: 'toward:target -190%', pose: 'stretch', bounds: 'pivot', moveEasing: 'snap' },
            { beat: 'cling', ticks: 7, pose: 'brace', rotation: -34, origin: 'part:left-front-leg' },
            { beat: 'kick-off', ticks: 4, to: 'toward:target -150%', pose: 'stretch-strong', bounds: 'pivot', face: 'target', moveEasing: 'snap' },
            { beat: 'diagonal-pounce', ticks: 8, to: 'target', align: 'part:head', pose: 'stretch-strong', rotateBy: 360, origin: 'part:left-front-leg', moveEasing: 'accelerate' },
            { beat: 'impact', ticks: 3, to: 'target', align: 'part:head', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'skid', ticks: 4, to: 'below:target 65', pose: 'settle', moveEasing: 'decelerate' },
            { beat: 'return', ticks: 5, to: 'home', pose: 'idle', moveEasing: 'smooth' }
        ],
        animationProfile: 'barioth-wall-pounce', animationDurationMs: 4200, originPart: 'head',
        weightWhenBroken: { 'left-front-leg': .55, 'right-front-leg': .55 }
    }],

    // 滑空しハンターに向かって飛びかかる — 낮게 활공해 지나간다. 이전 구현은
    // 노트에 "한쪽 앞발이 닿는 순간부터 관성으로 180도 회전하며 미끄러져 착지"라고
    // 적어두고 정작 모션 비트가 없어 공용 프로파일로 떨어졌다. 적어둔 대로 만든다.
    ['barioth.glide_pounce', '저공 활공 덮치기', 'charge', .39, {
        minTargets: 2, maxTargets: 3, actionClass: 'BreathFly', sourceMoveNameJA: '滑空攻撃',
        tags: ['charge', 'air-compatible', 'target-contact', 'slip-eligible'], recovery: 1,
        monsterAtbCost: .62, movement: { ticks: 36, untargetable: true }, targeting: { mode: 'adjacent-lane' },
        chargeMode: 'single',
        impactTimeline: [{ atTicks: 20, damageScale: 1 }],
        motion: [
            { beat: 'wing-load', ticks: 5, pose: 'crouch', face: 'target' },
            { beat: 'take-off', ticks: 5, to: 'above:home 150', pose: 'stretch', moveEasing: 'decelerate' },
            { beat: 'glide-in', ticks: 10, to: 'above:target 90', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'claw-touch', ticks: 3, to: 'target', align: 'part:left-front-leg', pose: 'land', hit: true, sfx: 'impact' },
            // 앞발이 닿은 지점을 축으로 관성이 몸을 반 바퀴 돌린다.
            { beat: 'inertia-slide', ticks: 6, to: 'toward:target 132%', pose: 'settle', rotateBy: 180, origin: 'part:left-front-leg', moveEasing: 'decelerate' },
            { beat: 'return', ticks: 7, to: 'home', pose: 'idle', moveEasing: 'smooth' }
        ],
        animationProfile: 'barioth-glide-circle-land', animationDurationMs: 3600,
        originPart: 'left-front-leg',
        weightWhenBroken: { 'left-front-leg': .65, 'right-front-leg': .65 }
    }],

    // ジャンプしハンターを攻撃する。攻撃時に振動が発生する — 위력 90으로 최대.
    // 수직으로 크게 뛰어 표적 상공에서 떨어진다. 착지 진동은 직격자에게 중복되지 않는다.
    ['barioth.landing_slam', '도약 내려찍기', 'physical', .45, {
        maxTargets: 1, actionClass: 'JumpAttack', sourceMoveNameJA: '叩きつけかみつき',
        tags: ['physical', 'jump', 'slam', 'strong', 'target-contact', 'slip-eligible'],
        cooldown: 52, recovery: 1, monsterAtbCost: .72, movement: { ticks: 44 },
        interference: { kind: 'tremor', size: 'small', directHitSupersedes: true },
        impactTimeline: [{ atTicks: 26, damageScale: 1 }],
        motion: [
            { beat: 'coil', ticks: 7, pose: 'crouch', face: 'target' },
            { beat: 'vertical-leap', ticks: 7, to: 'above:home 330', pose: 'stretch', moveEasing: 'decelerate' },
            { beat: 'apex', ticks: 4, to: 'above:target 300', pose: 'stretch-soft' },
            { beat: 'fall', ticks: 8, to: 'above:target 60', pose: 'stretch-strong', moveEasing: 'accelerate' },
            { beat: 'slam', ticks: 3, to: 'target', align: 'part:torso', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'tremor-hold', ticks: 8, pose: 'brace' },
            { beat: 'return', ticks: 7, to: 'home', pose: 'idle', moveEasing: 'smooth' }
        ],
        animationProfile: 'barioth-spring-leap',
        animationDurationMs: 4400, originPart: 'torso'
    }],

    // 탈진 중에는 브레스가 나오지 않는다(not even his ice breath will work).
    ['barioth.ice_breath_fizzle', '탈진 빙결 브레스 불발', 'physical', 0, {
        maxTargets: 1, actionClass: 'BreathNormal', sourceMoveNameJA: '疲労ブレス不発',
        state: 'exhausted', tags: ['ground-only', 'ice', 'no-impact', 'exhausted-fizzle'], recovery: 1,
        monsterAtbCost: .36, movement: { ticks: 20 }, suppressPrepareAudio: true,
        motion: [
            { beat: 'try-breath', ticks: 5, pose: 'crouch', face: 'target' },
            { beat: 'dry-exhale', ticks: 4, pose: 'stretch-soft' },
            { beat: 'cough', ticks: 4, pose: 'land', offsetX: 14 },
            { beat: 'pant', ticks: 7, to: 'home', pose: 'brace' }
        ],
        animationProfile: 'barioth-exhausted-breath-fizzle', animationDurationMs: 2000, originPart: 'mouth',
        attachedFx: { emoji: '☁️', className: 'breath-fizzle', durationMs: 2000 }
    }]
]);

worldVariant('barioth', 'frostfang_barioth', 1.08, [
    ['frostfang_barioth.freezing_floor', '빙결 지면 브레스', 'area', .33, {
        minTargets: 2, maxTargets: 4, actionClass: 'BreathNormal', tags: ['area', 'ice', 'frost-ground', 'elemental'],
        delivery: 'ground-wave', attachedFx: { emoji: '❄️', className: 'freezing-floor', durationMs: 4200 },
        interference: { kind: 'frost-root' }, brokenPartDamageModifiers: { head: .68 },
        movement: { ticks: 9 }, impactTimeline: [{ atTicks: 7 }],
        brokenPartAccuracyModifiers: { head: .75 }, statusBlockedWhenBroken: ['head'],
        motion: [
            { beat: 'aim', label: '지면 조준', ticks: 3, face: 'target', pose: 'brace' },
            { beat: 'frost-charge', label: '냉기 모으기', ticks: 4, pose: 'crouch', sfx: 'charge' },
            { beat: 'floor-breath', label: '빙결 지면 분사', ticks: 1, pose: 'stretch-strong', hit: true, sfx: 'projectile' },
            { beat: 'recover', label: '후딜', ticks: 1, pose: 'idle' }
        ]
    }],
    ['frostfang_barioth.frost_leap', '서리 지면 도약', 'charge', .44, {
        maxTargets: 3, actionClass: 'BiteSlammedLatterR', requiredState: 'enraged',
        tags: ['charge', 'ice', 'frost-ground', 'multi-hit'], chargeMode: 'wide', cooldown: 58,
        movement: { ticks: 17 }, impactTimeline: [{ atTicks: 7 }, { atTicks: 9 }],
        motion: [
            { beat: 'spring-load', label: '도약 압축', ticks: 3, pose: 'crouch', face: 'target' },
            { beat: 'frost-leap', label: '서리 도약', ticks: 4, to: 'above:target 180', pose: 'stretch-strong', moveEasing: 'snap' },
            { beat: 'impact', label: '빙결 착지', ticks: 2, to: 'target', pose: 'land', hit: true, sfx: 'impact' },
            { beat: 'frost-wave', label: '서리 확산', ticks: 3, pose: 'brace', hit: true, sfx: 'projectile' },
            { beat: 'return', label: '복귀', ticks: 5, to: 'home', pose: 'idle' }
        ]
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
