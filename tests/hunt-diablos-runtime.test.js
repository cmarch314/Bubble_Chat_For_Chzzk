const assert = require('assert');

global.HuntAtbConfig = require('../js/effects/hunt/HuntAtbConfig.js');
global.HuntMonsterPatternCatalog = require('../js/effects/hunt/HuntMonsterPatternCatalog.js');
global.HuntMonsterTurnExecutor = require('../js/effects/hunt/HuntMonsterTurnExecutor.js');
const HuntMonsterActionPolicy = require('../js/effects/hunt/HuntMonsterActionPolicy.js');
const HuntHunterTurnExecutor = require('../js/effects/hunt/HuntHunterTurnExecutor.js');
const HuntEngine = require('../js/effects/hunt/HuntEngine.js');
const HuntMonsterAnimationCatalog = require('../js/effects/hunt/HuntMonsterAnimationCatalog.js');
const HuntMonsterPatternSelector = require('../js/effects/hunt/HuntMonsterPatternSelector.js');
const profiles = require('../js/effects/hunt/HuntMonsterProfiles.js');
const motionOverrides = require('../js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js');
const animatorSource = require('fs').readFileSync(
    require('path').join(__dirname, '../js/effects/hunt/HuntMonsterAttackAnimator.js'), 'utf8');
const huntEffectSource = require('fs').readFileSync(
    require('path').join(__dirname, '../js/effects/HuntEffect.js'), 'utf8');

assert.match(animatorSource, /onMonsterPatternAudio\?\.\('monster_attack',[\s\S]*?patternSlot:\s*cue\.audioSlot/,
    'authored BEAT audio slots must leave the renderer through its explicit audio bridge');
assert.match(animatorSource,
    /createTargetImpactDustEffect\(targetCard,[\s\S]*?fxStage[\s\S]*?weaponRect[\s\S]*?fxStage\.appendChild\(dust\)/,
    'target impact dust must use the live weapon centre while living in the combat-board top FX layer');
assert.match(animatorSource,
    /addCssTrack\(facingLayer, 'facing', facingFrames, 'steps\(1,end\)'\)/,
    'BEAT facing must use the dependable scoped CSS track in Preview and embedded Chromium');
assert.match(animatorSource,
    /resolvedImpactTargets\.length \? resolvedImpactTargets : fallbackTargetIndices/,
    'target impact dust must cover every hunter struck by a shared impact tick');
assert.match(animatorSource, /schedulePreviewJudgmentMarkers\(pattern\)/,
    'motion-only Preview must display authored judgment markers without resolving hunter reactions');
assert.match(animatorSource, /damage: 'HIT',[\s\S]*roar: '귀마개',[\s\S]*tremor: '지진',[\s\S]*wind: '풍압'/,
    'Preview judgment markers must distinguish damage, roar, tremor and wind judgments');
assert.doesNotMatch(animatorSource, /owner\.playSFX\?\.\('monster_attack'/,
    'the renderer must not silently call the engine-only playSFX API');
assert.match(animatorSource,
    /if \(Array\.isArray\(pattern\?\.motion\)[\s\S]*?reason: 'beat-motion-unavailable'[\s\S]*?return null;/,
    'an authored BEAT pattern must fail closed instead of falling into a legacy CSS motion');
assert.match(huntEffectSource,
    /renderer\.onMonsterPatternAudio\s*=\s*\(fileName, fallbackKey, context\)[\s\S]*?audioManager\.playMHAsset\(fileName, fallbackKey, context\)/,
    'real hunts must connect reviewed BEAT audio cues to HuntAudioManager');

assert.ok(
    profiles.diablos.every(pattern => Array.isArray(pattern.motion) && pattern.motion.length > 0),
    'reviewed Diablos patterns must all use authored BEAT motion'
);
assert.deepStrictEqual(
    profiles.diablos.filter(pattern => pattern.animationProfile).map(pattern => pattern.id),
    [],
    'reviewed Diablos must not retain legacy CSS animationProfile fallbacks'
);

assert.strictEqual(
    profiles.diablos.find(pattern => pattern.id === 'diablos.horn_charge').damageRatio,
    0.4,
    'the authored ratio must remain safe and unchanged'
);
assert.deepStrictEqual(
    profiles.diablos.find(pattern => pattern.id === 'diablos.side_tackle').targetDamageRatios,
    [0.3, 0.15],
    'authored per-target ratios must remain intact before the common multiplier'
);
assert.ok(
    profiles.diablos.every(pattern => pattern.monsterDamageMultiplier === undefined),
    'Diablos must keep authored damage values and never inject a monster-specific multiplier'
);
assert.strictEqual(
    profiles.black_diablos.find(pattern => pattern.id === 'black_diablos.horn_charge').damageRatio,
    0.44,
    'base Diablos tuning must not silently double the separately balanced Black Diablos variant'
);

const enter = profiles.diablos.find(pattern => pattern.id === 'diablos.burrow_enter');
const roar = profiles.diablos.find(pattern => pattern.id === 'diablos.roar');
{
    const runtimeEnter = HuntMonsterPatternCatalog.synchronizeMotionTiming({
        ...enter,
        motion: enter.motion.map(beat => ({
            ...beat,
            ...(motionOverrides.diablos?.[enter.id]?.beats?.[beat.beat] || {})
        }))
    });
    const hunters = [0, 1, 2, 3].map(index => ({
        index, name: `Hunter ${index + 1}`, hunterName: `Hunter ${index + 1}`,
        status: 'alive', hp: 100, maxHp: 100, cartRecoveryTicks: 0,
        jumpInvulnerableTicks: 0
    }));
    for (const intendedTarget of hunters) {
        const animationCalls = [];
        const engine = {
            selectedMonster: { id: 'diablos', nameKO: 'Diablos' },
            selectedWeapons: hunters.map(hunter => ({ ...hunter })),
            monsterTier: 'large', monsterState: 'normal', monsterPartState: [],
            perkRuntime: null, random: () => .5,
            callbacks: { onTriggerMonsterAttack: (...args) => animationCalls.push(args) },
            playSFX() {}, showSkillBubble() {},
            beginMonsterTraversal(kind, ticks) {
                this.monsterTraversalState = { kind, remainingTicks: ticks };
            },
            beginMonsterBeatAction(action, context) {
                this.startedBeatAction = action;
                this.startedBeatContext = context;
            },
            getMonsterAttackType: () => ({ type: 'physical', emoji: 'impact' })
        };
        HuntMonsterTurnExecutor.execute(engine, runtimeEnter, null, intendedTarget.index);
        assert.strictEqual(engine.pendingMonsterImpact, null,
            'approved BEAT actions must not create the legacy delayed-impact countdown');
        assert.strictEqual(engine.startedBeatContext.targetIndex, intendedTarget.index,
            'burrow judgment session must keep the selected hunter');
        assert.deepStrictEqual(engine.startedBeatContext.judgmentEvents[0].targetIndices, [intendedTarget.index],
            'burrow eruption damage must not migrate to a different hunter');
        assert.strictEqual(animationCalls[0][4].runtimePrimaryTargetIndex, intendedTarget.index,
            'burrow tracking dust and eruption animation must follow the same hunter as damage');
        assert.deepStrictEqual(animationCalls[0][2].map(result => result.index), [intendedTarget.index],
            'burrow pending HIT presentation must mark only the direct-damage hunter');
        assert.strictEqual(
            enter.motion.find(beat => beat.beat === 'eruption').judgments
                .find(judgment => judgment.kind === 'tremor').target,
            'primary-adjacent',
            'burrow tremor must cover only the eruption lane and its immediate neighbours'
        );
    }
}
assert.deepStrictEqual(roar.motion.find(beat => beat.beat === 'roar').judgmentOffsets, { roar: 1 },
    'Diablos roar judgment must occur near the start of the roar beat, not during late recovery');
const reviewedRoar = { ...roar, motion: roar.motion.map(beat => ({
    ...beat,
    ...(motionOverrides.diablos?.['diablos.roar']?.beats?.[beat.beat] || {})
})) };
assert.strictEqual(HuntMonsterActionPolicy.impactDelayTicks(reviewedRoar), 11,
    'Diablos roar gameplay judgment must use the current approved editor marker');
assert.deepStrictEqual(HuntMonsterActionPolicy.impactTimeline(reviewedRoar).map(event => event.atTicks), [11],
    'preview and live combat must commit Diablos roar on the same tick shown by the editor bar');
const hornSweep = profiles.diablos.find(pattern => pattern.id === 'diablos.horn_sweep');
const hornUppercut = profiles.diablos.find(pattern => pattern.id === 'diablos.horn_uppercut');
assert.deepStrictEqual(
    hornUppercut.motion.filter(beat => beat.hit).map(beat => [beat.fx, beat.fxAnchor]),
    [['part-dust', 'head']],
    'the horn uppercut impact must burst dust from the authored head position'
);
assert.deepStrictEqual(
    hornUppercut.motion.filter(beat => beat.hit).map(beat => [beat.fxSecondary, beat.fxSecondaryAnchor]),
    [['target-impact-dust', 'target']],
    'the horn uppercut must also throw directional dust from the struck hunter'
);
assert.strictEqual(hornSweep.targeting.mode, 'adjacent-pair-sequential');
assert.deepStrictEqual(hornSweep.impactTimeline.map(event => [event.atTicks, event.targetMode]),
    [[11, 'sequential'], [24, 'sequential']]);
assert.deepStrictEqual(hornSweep.motion.filter(beat => beat.hit).map(beat => [beat.beat, beat.to]), [
    ['impact-1', undefined],
    ['impact-2', undefined]
], 'both horn lifts must rotate from the pair midpoint instead of tackling each hunter');
assert.deepStrictEqual(hornSweep.motion.filter(beat => beat.hit).map(beat => [beat.fx, beat.fxAnchor]), [
    ['part-dust', 'head'],
    ['part-dust', 'head']
], 'both horn sweep impacts must burst dust from the moving head position');
assert.deepStrictEqual(hornSweep.motion.filter(beat => beat.hit).map(beat => [beat.fxSecondary, beat.fxSecondaryAnchor]), [
    ['target-impact-dust', 'target'],
    ['target-impact-dust', 'target']
], 'each horn sweep contact must throw directional dust from only its own struck hunter');
assert.deepStrictEqual(hornSweep.motion.filter(beat => beat.to).map(beat => [beat.beat, beat.to]), [
    ['telegraph', 'between:pass:1,pass:2'],
    ['return', 'home']
], 'the sequence may move only into the pair midpoint and back home');
assert.strictEqual(enter.motion.find(beat => beat.beat === 'track').fx, 'burrow-tracking-dust',
    'the underground target must be revealed by moving dust instead of a stationary marker');
assert.strictEqual(enter.motion.find(beat => beat.beat === 'still').ticks, 30,
    'the buried monster must remain completely still for three seconds before tracking begins');
assert.deepStrictEqual(enter.motion.map(beat => beat.beat).slice(0, 4), ['dig', 'sink', 'still', 'track'],
    'the burrow choreography must hold still after sinking and only then reveal the target trail');
assert.strictEqual(enter.secondaryInterference, null,
    'Diablos digging dust is visual-only and must not apply legacy wind pressure');
assert.deepStrictEqual(enter.interference,
    { kind: 'tremor', size: 'large', directHitSupersedes: false },
    'the eruption lane and its immediate neighbours must all retain Tremor [L]');
assert.strictEqual(enter.motion.find(beat => beat.beat === 'dig').judgmentOffsets, undefined,
    'the dig beat must not expose a wind-pressure judgment marker');
for (const monsterId of ['diablos', 'black_diablos']) {
    assert.ok(profiles[monsterId].every(pattern =>
        pattern.interference?.kind !== 'wind'
        && pattern.secondaryInterference?.kind !== 'wind'
        && !(pattern.motion || []).some(beat => beat.judgmentOffsets?.wind != null)
    ), `${monsterId} must not retain any hidden legacy wind-pressure route`);
}
assert.strictEqual(
    HuntMonsterTurnExecutor.monsterAttackAccuracy({ accuracy: 0, hitChance: 0 }),
    1,
    'installed monster attacks must use guaranteed contact before hunter defense'
);
for (const idSuffix of ['.horn_charge', '.rage_charge']) {
    const pattern = profiles.diablos.find(candidate => candidate.id.endsWith(idSuffix));
    assert.deepStrictEqual([pattern.minTargets, pattern.maxTargets], [1, 2],
        `${pattern.id} must stay within the one-to-two hunter lane`);
    assert.strictEqual(pattern.chargeLaunchStyle, 'stomp-burst',
        `${pattern.id} must hold during the stomp telegraph and launch without creeping`);
}
const hornCharge = profiles.diablos.find(pattern => pattern.id === 'diablos.horn_charge');
assert.deepStrictEqual(hornCharge.motion.map(beat => [beat.beat, beat.label, beat.hit]), [
    ['stomp', '발구르기', undefined],
    ['charge', '돌진', undefined],
    ['impact', '피격', true],
    ['return', 'Fade-in 복귀', undefined]
], 'the horn charge editor graph must describe the real four-part choreography');
assert.strictEqual(hornCharge.motion[0].stompSteps, 3,
    'the telegraph must visibly alternate three heavy stomps before launch');
assert.match(animatorSource, /pattern\?\.chargeLaunchStyle === 'stomp-burst'/,
    'BEAT-authored Diablos charges must not lose their stomp dust when the resolved profile id is the pattern id');
assert.match(animatorSource, /schedulePreviewImpactCardReactions[\s\S]*event\.atTicks/,
    'preview hunter-card reactions must be scheduled from resolved HIT ticks');
assert.doesNotMatch(animatorSource, /shakeTargets\(/,
    'delayed BEAT impacts must not retain a renderer-owned percentage hit timer');
assert.strictEqual(hornCharge.motion[1].moveEasing, 'linear',
    'the charge must launch at full route speed instead of inheriting the old CSS acceleration');
assert.deepStrictEqual(
    [hornCharge.motion[1].pose, hornCharge.motion[1].strideFlipTicks],
    ['idle', 3],
    'Diablos must keep its aspect ratio and alternate its stride every 0.3 seconds during the charge'
);
assert.strictEqual(hornCharge.motion[2].continueTravel, true,
    'the impact beat must preserve the charge vector and speed past the hunter');
assert.deepStrictEqual([hornCharge.motion[3].at, hornCharge.motion[3].to, hornCharge.motion[3].fade],
    ['offscreen:top', 'home', 'in'], 'the return must be owned by the authored fade-in beat');
assert.strictEqual(HuntAtbConfig.monsterActionCostGauge(enter), 75,
    'the merged dig-to-eruption action spends one complete ATB cost');
assert.strictEqual(HuntAtbConfig.interferenceCostGauge('small'), 50);
assert.strictEqual(HuntAtbConfig.interferenceCostGauge('large'), 100);
assert.strictEqual(hornCharge.motion.reduce((sum, beat) => sum + beat.ticks, 0), 61,
    'the authored motion clock must own stomp, traversal, impact, and visible return');
assert.deepStrictEqual(
    HuntMonsterActionPolicy.movement(
        profiles.diablos.find(pattern => pattern.id.endsWith('.horn_charge'))
    ),
    { kind: 'diablos.horn_charge', ticks: 42, untargetable: true }
);
assert.deepStrictEqual(
    HuntMonsterActionPolicy.movement(
        profiles.diablos.find(pattern => pattern.id.endsWith('.rage_charge'))
    ),
    { kind: 'diablos-return-charge-tail-cross', ticks: 162, untargetable: true },
    'the enraged double-charge lock must include its off-screen pause and rear X follow-up'
);
{
    const rageCharge = profiles.diablos.find(pattern => pattern.id.endsWith('.rage_charge'));
    const scenario = HuntMonsterActionPolicy.resolveTargetScenario({
        pattern: rageCharge,
        monsterState: 'enraged',
        targetable: [0, 1, 2, 3].map(index => ({ index })),
        count: 2,
        passCount: 2,
        mode: rageCharge.targeting.mode,
        random: () => 0
    });
    assert.strictEqual(scenario.impactTimeline.length, 4,
        'one outbound, one return, and two rear X contacts belong to one ATB action');
    assert.deepStrictEqual(scenario.impactTimeline.map(event => event.targetIndices),
        [[0], [1], [0], [1]],
        'the rear X contacts must follow the opposite hunter direction from their authored swing motion');
    assert.strictEqual(rageCharge.impact.completePathOnTargetLoss, true,
        'a carted or absent return target must not stop the off-screen route');
    for (const roll of [0, .18, .36, .54, .72, .9]) {
        const sixHunterScenario = HuntMonsterActionPolicy.resolveTargetScenario({
            pattern: rageCharge,
            monsterState: 'enraged',
            targetable: [0, 1, 2, 3, 4, 5].map(index => ({ index })),
            count: 2,
            passCount: 2,
            mode: rageCharge.targeting.mode,
            random: () => roll
        });
        const pair = [sixHunterScenario.impactTimeline[2].targetIndices[0],
            sixHunterScenario.impactTimeline[3].targetIndices[0]];
        assert.strictEqual(pair.length, 2);
        assert.strictEqual(Math.abs(pair[0] - pair[1]), 1,
            'the stopping lane must always resolve one of 01/12/23/34/45');
        assert.ok(pair[0] < pair[1],
            'the first X swing must now strike the opposite left hunter and the return swing the right hunter');
    }
}
{
    const uppercut = profiles.diablos.find(pattern => pattern.id.endsWith('.horn_uppercut'));
    assert.strictEqual(HuntMonsterTurnExecutor.requiresDelayedImpact(uppercut), true);
    assert.strictEqual(HuntMonsterTurnExecutor.impactDelayTicks(uppercut), 13,
        'the uppercut defense roll must occur when the upward horn rotation begins');
    assert.deepStrictEqual(uppercut.motion.map(beat => beat.beat),
        ['telegraph', 'start', 'impact', 'recover', 'return']);
    assert.strictEqual(uppercut.motion.find(beat => beat.beat === 'impact').rotationToward, -34,
        'the strike must lift the horns through a pronounced upward rotation instead of a diagonal tackle');
    assert.strictEqual(uppercut.motion.find(beat => beat.beat === 'impact').to, 'toward:target 98%',
        'the impact beat must close only the final short gap while the horns rotate upward');
    assert.deepStrictEqual(
        (({ origin, offsetY }) => ({ origin, offsetY }))(uppercut.motion.find(beat => beat.beat === 'impact')),
        { origin: '50% 52%', offsetY: -24 },
        'the scoop must pivot around the neck and rise slightly instead of dragging the lower body downward');

    const hunter = {
        index: 1,
        name: 'Target',
        hunterName: 'Target',
        status: 'alive',
        hp: 100,
        maxHp: 100,
        cartRecoveryTicks: 0,
        jumpInvulnerableTicks: 0
    };
    const animationCalls = [];
    const engine = {
        selectedMonster: { id: 'diablos', nameKO: 'Diablos' },
        selectedWeapons: [hunter],
        monsterTier: 'large',
        monsterState: 'normal',
        monsterPartState: [],
        perkRuntime: null,
        random: () => 0,
        callbacks: {
            onTriggerMonsterAttack: (...args) => animationCalls.push(args)
        },
        playSFX() {},
        beginMonsterTraversal(kind, ticks) {
            this.monsterTraversalState = { kind, remainingTicks: ticks };
        },
        showSkillBubble() {},
        getMonsterAttackType: () => ({ type: 'physical', emoji: 'impact' })
    };
    HuntMonsterTurnExecutor.execute(engine, uppercut);
    assert.strictEqual(hunter.hp, 100,
        'starting the approach must not deal damage or resolve the hunter response');
    assert.strictEqual(engine.pendingMonsterImpact.targetIndex, 1);
    assert.strictEqual(engine.pendingMonsterImpact.remainingTicks, 13);
    assert.strictEqual(engine.pendingMonsterImpact.pattern.runtimeImpactCommit, true);
    assert.deepStrictEqual(
        engine.pendingMonsterImpact.pattern.runtimeDefenseIntents[1],
        { attempted: true, preferred: 'evade' },
        'the telegraph must lock a response intent while leaving success for the impact roll'
    );
    assert.strictEqual(animationCalls.length, 1);
    assert.strictEqual(animationCalls[0][2][0].result, 'pending');
    assert.strictEqual(animationCalls[0][4].runtimeImpactPending, true);
}
{
    assert.ok(!profiles.diablos.some(pattern => pattern.id.endsWith('.tail_sweep')),
        'the rear X sweep must never exist as a standalone ATB action');
    assert.ok(!profiles.black_diablos.some(pattern => pattern.id.endsWith('.tail_sweep')),
        'the derived Black Diablos kit must not reintroduce the standalone sweep');
    const rageCharge = profiles.diablos.find(pattern => pattern.id.endsWith('.rage_charge'));
    assert.strictEqual(rageCharge.movement.kind, 'diablos-return-charge-tail-cross');
    assert.deepStrictEqual(HuntMonsterActionPolicy.impactTimeline(rageCharge).map(event => ({
        atTicks: event.atTicks,
        targetMode: event.targetMode,
        damageScale: event.damageScale
    })), [
        { atTicks: 51, targetMode: 'runtime-pair-left', damageScale: 1 },
        { atTicks: 125, targetMode: 'runtime-pair-right', damageScale: 1 },
        { atTicks: 135, targetMode: 'runtime-pair-left', damageScale: 0.45 },
        { atTicks: 149, targetMode: 'runtime-pair-right', damageScale: 0.45 }
    ], 'the return charge and both X contacts must share the second pass target lane');
    const returnCharge = rageCharge.motion.find(beat => beat.beat === 'return-charge');
    assert.deepStrictEqual(
        rageCharge.motion.slice(0, 3).map(beat => [beat.beat, beat.ticks, beat.moveEasing || null]),
        [['stomp', 7, null], ['charge-out', 44, 'linear'], ['exit-bottom', 8, 'linear']],
        'the first pass must cross the hunter and continue along one uninterrupted line'
    );
    assert.deepStrictEqual(
        rageCharge.motion.slice(4, 6).map(beat => [beat.beat, beat.ticks, beat.moveEasing]),
        [['return-charge', 44, 'linear'], ['return-impact', 2, 'linear']],
        'the second pass must keep the same charge speed and stop at the hunter inside the screen'
    );
    assert.strictEqual(rageCharge.motion.find(beat => beat.beat === 'exit-bottom').to, 'through:pair:center 120',
        'the first pass exit must extend the hunter vector instead of turning toward generic bottom-center');
    assert.strictEqual(rageCharge.motion.find(beat => beat.beat === 'exit-bottom').hit, true,
        'the first charge contact must be owned by the uninterrupted exit beat');
    assert.deepStrictEqual(
        HuntMonsterPatternCatalog.synchronizeMotionTiming(rageCharge).impactTimeline.map(event => event.atTicks),
        [51, 123, 130, 144],
        'runtime impact timing must be regenerated from hit BEAT starts instead of stale absolute ticks'
    );
    assert.ok(!rageCharge.motion.some(beat => beat.beat === 'turn-outside'),
        'there must be no authored direction-turn beat outside the screen');
    assert.strictEqual(returnCharge.to, 'above:pair:center 220');
    assert.deepStrictEqual(
        rageCharge.motion
            .filter(beat => ['charge-out', 'exit-bottom', 'return-charge', 'return-impact'].includes(beat.beat))
            .map(beat => [beat.beat, beat.strideFlipTicks]),
        [['charge-out', 3], ['exit-bottom', 3], ['return-charge', 3], ['return-impact', 3]],
        'both charge runs must stride-flip every three ticks through their impact segments'
    );
    assert.strictEqual(returnCharge.rotation, 180,
        'the return charge must finish with the tail facing its hunters');
    assert.deepStrictEqual(rageCharge.motion.filter(beat => beat.beat.startsWith('tail-cross')).map(beat => [
        beat.beat, beat.offsetX, beat.offsetY, beat.skewX, beat.rotation
    ]), [
        ['tail-cross-one', 0, 0, -6, 202],
        ['tail-cross-two', 0, 0, 6, 158]
    ], 'the two tail contacts must cross around the flipped torso without translating the monster');
    assert.deepStrictEqual(
        rageCharge.motion.filter(beat => beat.flipFacing).map(beat => beat.beat),
        ['tail-wind-right', 'return'],
        'the authored base profile keeps its recovery mirror; review motion overrides own the X-swing flips'
    );
    const rageChargeOverride = motionOverrides.diablos['diablos.rage_charge'].beats;
    assert.deepStrictEqual(
        ['tail-cross-one', 'tail-cross-two'].map(id => rageChargeOverride[id].flipFacing),
        [false, false],
        'the reviewed X-tail override must preserve each prepared tail direction through both strike images'
    );
    assert.ok(rageCharge.motion.filter(beat => beat.beat.startsWith('tail-'))
        .every(beat => beat.origin === 'part:torso'),
    'the flipped follow-up must pivot around the torso instead of reusing the unflipped tail coordinates');
    assert.strictEqual(rageCharge.motion.at(-1).rotation, 180,
        'return translation must not visibly reverse-spin the monster');
}
assert.ok(profiles.black_diablos.every(pattern => pattern.id.startsWith('black_diablos.')));
assert.ok(profiles.black_diablos.every(pattern =>
    pattern.motionOverrideSource?.monsterId === 'diablos'
    && pattern.motionOverrideSource?.patternId === pattern.id.replace(/^black_diablos\./, 'diablos.')),
'Black Diablos must inherit the reviewed base-species BEAT graph');
{
    const previousProfiles = global.HUNT_MONSTER_PATTERN_OVERRIDES;
    const previousMotion = global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES;
    global.HUNT_MONSTER_PATTERN_OVERRIDES = profiles;
    global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = motionOverrides;
    const runtime = HuntMonsterPatternCatalog.build({}, [
        { id: 'diablos' }, { id: 'black_diablos' }
    ]);
    const liveUppercut = runtime.diablos.find(pattern => pattern.id === 'diablos.horn_uppercut');
    const liveSweep = runtime.diablos.find(pattern => pattern.id === 'diablos.horn_sweep');
    assert.deepStrictEqual(liveUppercut.motion.filter(beat => beat.judgments?.some(item => item.kind === 'damage')).map(beat => ({
        targetDust: beat.fxSecondary,
        angleMode: beat.fxSecondaryAngleMode,
        swingFx: beat.fxAdditional?.[0]?.fx,
        swingAngleMode: beat.fxAdditional?.[0]?.angleMode
    })), [{
        targetDust: 'target-impact-dust',
        angleMode: 'upward-diagonal',
        swingFx: 'part-swing-arc',
        swingAngleMode: 'upward-diagonal'
    }], 'the live hunt catalog must retain uppercut target dust and hand-drawn swing FX after editor overrides');
    assert.deepStrictEqual(liveSweep.motion.filter(beat => beat.judgments?.some(item => item.kind === 'damage')).map(beat => [
        beat.fxSecondary, beat.fxSecondaryAngleMode,
        beat.fxAdditional?.[0]?.fx, beat.fxAdditional?.[0]?.angleMode
    ]), [
        ['target-impact-dust', 'upward-diagonal', 'part-swing-arc', 'upward-diagonal'],
        ['target-impact-dust', 'upward-diagonal', 'part-swing-arc', 'upward-diagonal']
    ], 'both live horn-sweep HIT beats must retain their target-specific upward FX');
    assert.deepStrictEqual(liveSweep.motion
        .flatMap(beat => beat.judgments || [])
        .filter(judgment => judgment.kind === 'damage')
        .map(judgment => judgment.target),
    ['pair-left', 'pair-right'],
    'the two horn sweeps must bind their judgments to opposite hunters in the selected pair');
    assert.deepStrictEqual(liveSweep.impactTimeline.map(event => event.targetMode),
        ['runtime-pair-left', 'runtime-pair-right'],
        'live combat must not collapse both horn-sweep impacts back onto the primary hunter');
    assert.deepStrictEqual(liveSweep.motion
        .filter(beat => beat.beat === 'impact-1' || beat.beat === 'impact-2')
        .map(beat => [beat.face, beat.rotationToward]),
    [['pass:1', -34], ['pass:2', -34]],
    'the pair midpoint choreography must mirror the approved uppercut toward each hunter');
    assert.ok(runtime.diablos.every(pattern => !pattern.runtimePreviewScrub
        && !pattern.runtimePreviewCardReactions && !pattern.runtimePreviewMuteAudio),
    'live hunt patterns must not inherit preview-only gates');
    const damagingJudgments = runtime.diablos.flatMap(pattern =>
        (pattern.impactTimeline || [])
            .filter(impact => Number(impact.damageScale ?? 1) > 0)
            .map(impact => ({ patternId: pattern.id, reaction: impact.hitReactionKind }))
    );
    assert.ok(damagingJudgments.length > 0, 'Diablos must expose reviewed damaging judgments');
    damagingJudgments.forEach(judgment => {
        assert.strictEqual(judgment.reaction,
            judgment.patternId === 'diablos.bite' ? 'weak' : 'strong',
            `${judgment.patternId} must use the approved hunter reaction class`);
    });
    for (const basePattern of runtime.diablos) {
        const variantId = basePattern.id.replace(/^diablos\./, 'black_diablos.');
        const variant = runtime.black_diablos.find(pattern => pattern.id === variantId);
        assert.ok(variant, `${variantId} must exist`);
        assert.deepStrictEqual(variant.motion, basePattern.motion,
            `${variantId} must use the reviewed base-species motion override`);
        assert.deepStrictEqual(
            variant.impactTimeline.map(({ atTicks, targetMode, hitReactionKind }) =>
                ({ atTicks, targetMode, hitReactionKind })),
            basePattern.impactTimeline.map(({ atTicks, targetMode, hitReactionKind }) =>
                ({ atTicks, targetMode, hitReactionKind })),
            `${variantId} must keep HIT timing, targets, and reaction synchronized with the inherited BEAT graph`
        );
    }
    global.HUNT_MONSTER_PATTERN_OVERRIDES = previousProfiles;
    global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = previousMotion;
}
{
    const tailRock = profiles.diablos.find(pattern => pattern.id.endsWith('.tail_slam_rock'));
    assert.ok(tailRock, 'the verified Rise/Sunbreak tail-slam rock follow-up must be installed');
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.impactTimeline(tailRock).map(event => ({
            atTicks: event.atTicks,
            launchAtTicks: event.launchAtTicks,
            targetMode: event.targetMode,
            damageScale: event.damageScale,
            audioCue: event.audioCue
        })),
        [
            { atTicks: 26, launchAtTicks: 19, targetMode: 'all-prepared', damageScale: 1, audioCue: 'rock' }
        ],
        'the three rocks must launch on the tail-slam final tick and impact after their visible flight'
    );
    const volleyBeat = tailRock.motion.find(beat => beat.beat === 'tail-slam-volley');
    const flightBeat = tailRock.motion.find(beat => beat.beat === 'volley-flight');
    assert.strictEqual(volleyBeat.hit, undefined, 'the launch beat must not commit projectile damage early');
    assert.strictEqual(flightBeat.hitOffsetTicks, flightBeat.ticks - 1,
        'the projectile impact must commit on the final flight tick');
    assert.strictEqual(tailRock.delivery, 'projectile');
    assert.strictEqual(tailRock.projectileVisual, 'rock',
        'Diablos must route its physical rock through the dedicated rock visual instead of the elemental orb renderer');
    assert.strictEqual(tailRock.motion[0].beat, 'brace',
        'the tail slam must begin from a stationary brace instead of approaching a hunter');
    assert.ok(!tailRock.motion.some(beat => beat.to && beat.to !== 'home'),
        'the tail slam must stay at the monster home position until its recovery');
    assert.strictEqual(tailRock.motion.filter(beat => /^rock-/.test(beat.beat)).length, 0,
        'the three rocks must not survive as staggered follow-up beats');
    const slamVolley = tailRock.motion.find(beat => beat.beat === 'tail-slam-volley');
    assert.deepStrictEqual(
        (({ scaleX, scaleY, hit }) => ({ scaleX, scaleY, hit }))(slamVolley),
        { scaleX: 1.16, scaleY: 1.2, hit: undefined },
        'the rear-facing sprite must fully extend and launch without committing projectile damage early');
    assert.strictEqual(slamVolley.fx, 'tail-slam-arc',
        'the slam must render a tail-anchored downward arc instead of reading as a generic whole-image squash');
    assert.ok(Math.abs(slamVolley.rotation - tailRock.motion.find(beat => beat.beat === 'tail-compress').rotation) >= 70,
        'the lifted tail must sweep through a large readable arc into the ground');
    assert.deepStrictEqual(tailRock.targeting,
        { mode: 'independent-passes', passCount: 3, distinctPasses: true },
        'the simultaneous rock volley must fan toward three distinct hunter lanes');
    assert.deepStrictEqual(tailRock.projectileEventKinds, ['diablos-rock-volley']);
    const volleyPlan = HuntMonsterActionPolicy.resolveTargetScenario({
        pattern: tailRock,
        targetable: [0, 1, 2, 3].map(index => ({ index })),
        count: 3,
        passCount: 3,
        distinctPasses: true,
        mode: 'independent-passes',
        defaultTargets: [{ index: 0 }],
        primaryIndex: 0,
        random: () => 0
    });
    assert.deepStrictEqual(volleyPlan.impactTimeline.map(event => [event.atTicks, event.targetIndices]), [
        [26, [0, 1, 2]]
    ], 'all three launched rocks must resolve as one simultaneous impact after their visible flight');
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.movement(tailRock),
        { kind: 'diablos.tail_slam_rock', ticks: 45, untargetable: false }
    );
    assert.strictEqual(tailRock.animationProfile, null,
        'the authored tail slam must not fall back to the legacy CSS animation catalog');
    const bite = profiles.diablos.find(pattern => pattern.id.endsWith('.bite'));
    assert.strictEqual(bite.motion.find(beat => beat.beat === 'approach').aimBodyAt, 'target',
        'Diablos bite approach must rotate its body axis toward the selected hunter, not only mirror horizontally');
    assert.ok(!bite.tags.includes('butt-stumble'),
        'approved Diablos reactions must not be duplicated in legacy profile tags');
    const previousProfiles = global.HUNT_MONSTER_PATTERN_OVERRIDES;
    const previousMotion = global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES;
    global.HUNT_MONSTER_PATTERN_OVERRIDES = profiles;
    global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = motionOverrides;
    const liveBite = HuntMonsterPatternCatalog.build({}, [{ id: 'diablos' }])
        .diablos.find(pattern => pattern.id === 'diablos.bite');
    global.HUNT_MONSTER_PATTERN_OVERRIDES = previousProfiles;
    global.HUNT_MONSTER_PATTERN_MOTION_OVERRIDES = previousMotion;
    assert.strictEqual(liveBite.impactTimeline[0].hitReactionKind, 'weak',
        'Diablos bite must preserve its Preview-authored small/butt-stumble reaction');
    assert.strictEqual(liveBite.impactTimeline[0].hitRecoveryTicks, undefined,
        'Diablos impacts must not own hunter recovery timing');
    const sideTackle = profiles.diablos.find(pattern => pattern.id.endsWith('.side_tackle'));
    assert.strictEqual(sideTackle.motion.find(beat => beat.beat === 'side-hop').to,
        'pair-flank:targets 150',
        'side tackle must hop outside the selected adjacent pair instead of occupying their midpoint');
    assert.strictEqual(sideTackle.motion.find(beat => beat.beat === 'side-hop').face,
        'target-group',
        'side tackle must face the center of both selected hunters from the outside flank');
    assert.strictEqual(sideTackle.motion.find(beat => beat.beat === 'tackle').bounds, 'reach',
        'authored tackle overshoot percentages must not be flattened by the contact clamp');
    assert.match(sideTackle.motion.find(beat => beat.beat === 'tackle').to, /^through-current:target-group /,
        'side tackle distance must cross the selected pair from its hop position instead of recalculating from monster home');
    assert.deepStrictEqual(
        (({ fx, fxAnchor, fxDurationTicks }) => ({ fx, fxAnchor, fxDurationTicks }))(
            sideTackle.motion.find(beat => beat.beat === 'tackle')
        ),
        { fx: 'target-impact-dust', fxAnchor: 'target', fxDurationTicks: 6 },
        'Diablos side tackle must burst dust at the struck hunter rather than on the monster body'
    );
    assert.strictEqual(sideTackle.name, '철산고');
    assert.deepStrictEqual(sideTackle.targetDamageRatios, [0.30, 0.15]);
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.movement(sideTackle),
        { kind: 'diablos.side_tackle', ticks: 30, untargetable: false }
    );
    assert.ok(profiles.diablos.some(pattern => pattern.id.endsWith('.bite')),
        'the low-threat bite must remain in the kit instead of every turn becoming a spectacle');
}
{
    const hunters = [0, 1, 2, 3].map(index => ({ index }));
    assert.deepStrictEqual(
        HuntMonsterActionPolicy.adjacentLaneTargets([hunters[0], hunters[2], hunters[3]], 2, () => 0)
            .map(target => target.index),
        [0],
        'a two-hunter charge must not jump across an empty, non-adjacent card slot'
    );
    const [first, second] = HuntMonsterActionPolicy.returnAdjacentPasses(hunters, 2, () => 0);
    assert.notStrictEqual(first[0].index, second[0].index,
        'the return charge must lock a new primary hunter after leaving the screen');
    assert.strictEqual(Math.abs(first[0].index - second[0].index), 1,
        'the two return-charge victims must occupy adjacent card slots');
    assert.strictEqual(first.length + second.length, 2);
    const [soloFirst, soloSecond] = HuntMonsterActionPolicy.returnAdjacentPasses(hunters, 1, () => 0);
    assert.strictEqual(soloFirst[0].index, soloSecond[0].index,
        'a one-hunter return charge must not expand onto another card');
}
{
    const pattern = profiles.diablos.find(candidate => candidate.id.endsWith('.rage_charge'));
    assert.strictEqual(pattern.whiffReaction, null,
        'the approved return-charge and tail-cross action must finish at recovery without appending knockdown');
    assert.strictEqual(HuntMonsterActionPolicy.shouldTriggerWhiffReaction([], {
        ...pattern,
        runtimeJudgment: { id: 'tail-cross-two-damage', timelineFinal: true }
    }, [{ result: 'dodge' }]), false,
    'dodging the final tail-cross judgment must not be mistaken for a charge collision');
}
{
    const traversal = {
        callbacks: { onResetMonsterMotion() {} },
        monsterActionLockTicks: 0,
        monsterActionPresentationTicks: 0,
        monsterTraversalGeneration: 0,
        monsterTraversalState: null
    };
    traversal.beginMonsterTraversal = HuntEngine.prototype.beginMonsterTraversal;
    traversal.clearMonsterTraversal = HuntEngine.prototype.clearMonsterTraversal;
    traversal.interruptMonsterMovement = HuntEngine.prototype.interruptMonsterMovement;
    traversal.cancelMonsterBeatAction = () => {};
    traversal.beginMonsterTraversal('diablos-return-charge', 57, { untargetable: true });
    assert.strictEqual(traversal.monsterActionLockTicks, 57);
    assert.strictEqual(traversal.monsterTraversalState.untargetable, true);
    traversal.pendingMonsterAction = { pattern: { id: 'diablos.rage_charge' } };
    traversal.pendingMonsterImpact = { pattern: { id: 'diablos.horn_uppercut' } };
    traversal.monsterBurrowState = { phase: 'underground' };
    let burrowCancelled = false;
    traversal.callbacks.onTriggerMonsterBurrowPhase = phase => { burrowCancelled = phase === 'cancel'; };
    traversal.interruptMonsterMovement('knockdown');
    assert.strictEqual(traversal.monsterTraversalState, null);
    assert.strictEqual(traversal.monsterActionLockTicks, 0);
    assert.strictEqual(traversal.pendingMonsterAction, null);
    assert.strictEqual(traversal.pendingMonsterImpact, null);
    assert.strictEqual(traversal.monsterBurrowState, null);
    assert.strictEqual(burrowCancelled, true);
}
{
    const hunter = {
        index: 0, id: 'hammer', type: 'melee', status: 'alive',
        hp: 100, maxHp: 100, atb: 100, personality: 'balanced',
        hammerChargeLevel: 0, shockTraps: 0, flashPods: 0, potions: 0,
        powders: 0, sharpnessProfile: null, perks: []
    };
    const engine = {
        monsterHp: 1000,
        monsterState: 'normal',
        monsterAtb: 0,
        monsterFlightState: 'grounded',
        selectedMonster: { id: 'diablos' },
        random: () => 0.99,
        perkRuntime: null,
        blightRuntime: null,
        weaponMechanics: null,
        actionStateMachine: { cancel() {} },
        isMonsterTrapImmune: () => false,
        isMonsterTargetable: () => false,
        COMBO_LIST: { hammer: [] },
        updateWeaponAtbUI() {},
        updateSharpnessUI() {},
        updateHunterItemUI() {},
        spawnEmojiBubble() {},
        shakeWeapon() {},
        addLog() { throw new Error('waiting for an unavailable monster must stay silent'); }
    };
    HuntHunterTurnExecutor.execute(engine, hunter);
    assert.strictEqual(hunter.atb, 100,
        'an uncommitted hunter must wait at full ATB instead of attacking the stale home position');
}
assert.ok(profiles.black_diablos.find(pattern => pattern.id.endsWith('.horn_charge')).monsterAtbCost
    < profiles.diablos.find(pattern => pattern.id.endsWith('.horn_charge')).monsterAtbCost,
'Black Diablos must keep a separately faster ATB kit');

assert.strictEqual(enter.type, 'charge');
assert.strictEqual(enter.damageRatio, 0.46);
assert.strictEqual(enter.monsterAtbCost, 0.75,
    'the complete burrow and eruption sequence must spend ATB once as one action');
assert.strictEqual(enter.followUp, null,
    'burrow emergence must not survive as a second queued monster action');
assert.deepStrictEqual(enter.motion.map(beat => beat.beat),
    ['dig', 'sink', 'still', 'track', 'eruption', 'land', 'return'],
    'the single BEAT graph must own the full dig-to-return choreography');
assert.strictEqual(enter.motion.find(beat => beat.beat === 'eruption').hit, true,
    'damage must resolve only on the authored eruption beat');
assert.deepStrictEqual(
    (({ scaleX, scaleY, rotationToward }) => ({ scaleX, scaleY, rotationToward }))(
        enter.motion.find(beat => beat.beat === 'eruption')
    ),
    { scaleX: .88, scaleY: 1.18, rotationToward: 10 },
    'the eruption must release the submerged squash into a tall head-first spring pose'
);
assert.strictEqual(enter.motion.find(beat => beat.beat === 'return').ticks, 10,
    'Diablos must visibly settle and return slowly after the head-first eruption');
assert.ok(!profiles.diablos.some(pattern => pattern.id === 'diablos.burrow_emerge'),
    'the profile must not expose a separate emergence pattern');

function interferenceHarness({ atb = 100, random = 0.99, shield = false, resisted = false } = {}) {
    const calls = { cancelled: 0, reset: 0, visuals: [] };
    const hunter = {
        index: 0, id: shield ? 'lance' : 'hammer', type: shield ? 'shield' : 'melee',
        name: 'Tester', status: 'alive', atb, personality: 'balanced', perkModifiers: {}
    };
    const engine = {
        random: () => random,
        perkRuntime: {
            ignoresPattern: () => resisted ? '내진' : null,
            roarDuration: () => 1
        },
        actionStateMachine: {
            canGuard: () => true,
            cancel: () => { calls.cancelled++; }
        },
        weaponMechanics: { onHit: () => { calls.reset++; } },
        callbacks: {
            onInterruptWeaponVisual() {},
            onTriggerHunterInterference: (...args) => calls.visuals.push(args),
            onTriggerGuardShake() {}
        },
        updateWeaponAtbUI() {},
        addLog() {},
        showSkillBubble() {},
        playSFX() {}
    };
    engine.applyHunterInterference = HuntEngine.prototype.applyHunterInterference;
    engine.clearHunterInterference = HuntEngine.prototype.clearHunterInterference;
    engine.interruptHunterItemAction = HuntEngine.prototype.interruptHunterItemAction;
    engine.cancelHunterBeatAction = () => {};
    engine.presentHunterImpact = () => {};
    return { engine, hunter, calls };
}

{
    const { engine, hunter, calls } = interferenceHarness({ atb: 85 });
    assert.strictEqual(engine.applyHunterInterference(hunter, 'tremor', 'large'), true);
    assert.strictEqual(hunter.atb, 0);
    assert.deepStrictEqual(hunter.interference, { kind: 'tremor', size: 'large' });
    assert.strictEqual(calls.cancelled, 1);
    assert.strictEqual(calls.reset, 1, 'interference must cancel and reset the active combo');
    hunter.atb = 100;
    assert.strictEqual(engine.clearHunterInterference(hunter), true);
    assert.strictEqual(hunter.interference, null);
}

for (const [kind, size] of [['roar', 'large'], ['tremor', 'large'], ['wind', 'small']]) {
    const { engine, hunter, calls } = interferenceHarness({ atb: 85 });
    assert.strictEqual(engine.applyHunterInterference(hunter, kind, size), true);
    assert.strictEqual(engine.clearHunterInterference(hunter, 'hit'), true);
    assert.strictEqual(hunter.interference, null,
        `${kind} reaction must yield immediately to a damaging hit`);
    assert.strictEqual(hunter.roarStunned, false);
    assert.deepStrictEqual(calls.visuals.at(-1), [hunter.index, kind, size, false],
        `${kind} overlay must be removed before hit knockback starts`);
}

for (const kind of ['roar', 'tremor', 'wind']) {
    const { engine, hunter, calls } = interferenceHarness({ atb: 85 });
    hunter.counterInvulnerabilityTicks = 10;
    assert.strictEqual(engine.applyHunterInterference(hunter, kind, 'large'), false,
        `post-counter protection must reject ${kind} judgments`);
    assert.strictEqual(hunter.atb, 85,
        `${kind} must not spend ATB during the one-second counter window`);
    assert.strictEqual(hunter.interference, undefined);
    assert.strictEqual(calls.cancelled, 0);
    assert.strictEqual(calls.reset, 0,
        `${kind} must not interrupt the successful counter follow-through`);
    assert.deepStrictEqual(calls.visuals, [],
        `${kind} must not start an interference animation during counter protection`);
}

{
    const { engine, hunter, calls } = interferenceHarness();
    hunter.roarStunned = true;
    hunter.roarStunDuration = 12;
    assert.strictEqual(engine.clearHunterInterference(hunter, 'hit'), true,
        'legacy roar-only state must also yield to hit recovery');
    assert.strictEqual(hunter.roarStunned, false);
    assert.deepStrictEqual(calls.visuals.at(-1), [hunter.index, 'roar', 'large', false]);
}

{
    const { engine, hunter } = interferenceHarness({ atb: 85 });
    hunter.pendingSharpnessRestore = true;
    hunter.itemDuration = 20;
    assert.strictEqual(engine.applyHunterInterference(hunter, 'wind', 'small'), true);
    assert.strictEqual(hunter.atb, 35);
    assert.strictEqual(hunter.pendingSharpnessRestore, false, 'wind pressure must interrupt sharpening');
    assert.strictEqual(hunter.itemDuration, 0, 'interference must clear the remaining sharpening lock');
}

{
    const { engine, hunter } = interferenceHarness({ atb: 85, shield: true, random: 0 });
    assert.strictEqual(engine.applyHunterInterference(hunter, 'tremor', 'large'), false);
    assert.strictEqual(hunter.atb, 85, 'a successful guard blocks both the pose and ATB loss');
    assert.strictEqual(hunter.interference, undefined);
}

console.log('[test] Diablos merged burrow BEAT, ATB costs, and interference contract passed.');
