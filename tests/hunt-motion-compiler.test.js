'use strict';

// 비트 컴파일러의 계약을 고정한다 (재설계안 원칙 3).
//
// 이 테스트가 지키는 핵심은 "그림과 판정이 같은 곳에서 나온다"이다.
// 지금은 impactTimeline은 틱으로, 애니메이션은 퍼센트로 적고 둘을 사람이 맞춘다.
// 어긋나면 "때리는 순간과 소리가 다르다"로 나타난다. 실제로
// VISUAL_DURATION_SCALE 이중 적용 때문에 모든 패턴이 25%씩 잘려 있었고,
// recovery 틱은 점유 시간에 반영되지 않아 3초 후딜이 화면에 없었다.

const assert = require('node:assert');

const HuntStageAnchors = require('../js/effects/hunt/HuntStageAnchors.js');
const HuntMotionPoses = require('../js/effects/hunt/HuntMotionPoses.js');
const HuntMotionCompiler = require('../js/effects/hunt/HuntMotionCompiler.js');
const { HuntMotionCompilerError } = HuntMotionCompiler;

const rect = (left, top, width, height) => ({ left, top, width, height });
const anchors = new HuntStageAnchors({
    monsterRect: rect(660, 100, 380, 380),
    cardRect: rect(0, 0, 1700, 900),
    stageWidth: 1700,
    hunters: new Map([
        [0, rect(200, 700, 120, 160)],
        [1, rect(600, 700, 120, 160)],
        [2, rect(1000, 700, 120, 160)],
        [3, rect(1400, 700, 120, 160)]
    ])
});

// 도약 칼날깃 급습을 비트로 적으면 이렇게 된다. 지금은 키프레임 15~35줄이다.
const AMBUSH = [
    { beat: 'windup', ticks: 5, pose: 'crouch' },
    { beat: 'leap', ticks: 3, to: 'offscreen:left', pose: 'stretch', fade: 'out' },
    { beat: 'appear', ticks: 2, at: 'polar:hunter:2 225deg 700', fade: 'in' },
    { beat: 'strike', ticks: 4, to: 'hunter:2.bottom', pose: 'land', hit: true, sfx: 'impact' },
    { beat: 'hold', ticks: 2, pose: 'settle' },
    { beat: 'return', ticks: 4, to: 'home', pose: 'idle' }
];

const built = HuntMotionCompiler.compile(AMBUSH, { anchors });

const heldRotation = HuntMotionCompiler.compile([
    { beat: 'brace', ticks: 5, pose: 'brace' },
    { beat: 'turn-back', ticks: 5, pose: 'brace', rotation: 180,
        origin: 'part:torso', rotationEasing: 'accelerate' }
], { anchors });
const turnBoundary = 5 / 10;
assert.ok(!heldRotation.pose.some(frame => frame.offset > turnBoundary
    && frame.offset < 1 && frame.transform.includes('rotate(180.00deg)')),
    'held poses must not snap an authored rotation to its final angle at beat start');
assert.ok(heldRotation.pose.some(frame => frame.offset === 1
    && frame.transform.includes('rotate(180.00deg)')),
    'authored rotation must reach its final angle at the end of the beat');
assert.ok(heldRotation.pose.some(frame => frame.offset === turnBoundary
    && frame.transform.includes('rotate(0.00deg)') && frame.pivot === 'part:torso'),
    'the authored pivot must be active from the first frame of the rotation interval');

const reviewedCutwingAmbush = HuntMotionCompiler.compile([
    { beat: 'windup', ticks: 5, pose: 'crouch' },
    { beat: 'leap-out', ticks: 4, to: 'offscreen:left', offsetY: -280, pose: 'stretch', opacity: 0 },
    { beat: 'vanish', ticks: 3, pose: 'stretch', opacity: 0 },
    { beat: 'reappear', ticks: 2, at: 'polar:hunter:2 315deg 700', face: 'hunter:2', pose: 'crouch', opacity: 1, instantOpacity: true, aimBodyAt: 'hunter:2' },
    { beat: 'ambush-aim', ticks: 3, face: 'hunter:2', pose: 'crouch', opacity: 1, aimBodyAt: 'hunter:2' },
    { beat: 'dive', ticks: 4, to: 'hunter:2', face: 'hunter:2', pose: 'stretch-strong', alignRotationToTravel: true },
    { beat: 'impact', ticks: 2, to: 'hunter:2', pose: 'land', hit: true },
    { beat: 'pass-through', ticks: 4, to: 'offscreen:right', offsetY: 620, pose: 'stretch', opacity: 0 },
    { beat: 'return', ticks: 4, at: 'offscreen:top', to: 'home', pose: 'idle', opacity: 1 }
], { anchors });
const cutwingReappear = reviewedCutwingAmbush.timeline.find(beat => beat.beat === 'reappear');
const cutwingAim = reviewedCutwingAmbush.timeline.find(beat => beat.beat === 'ambush-aim');
const cutwingReappearFrame = reviewedCutwingAmbush.placement
    .filter(frame => Math.abs(frame.offset - (12 / 31)) < 1e-8).at(-1);
const cutwingAimFrame = reviewedCutwingAmbush.placement
    .filter(frame => Math.abs(frame.offset - (14 / 31)) < 1e-8).at(-1);
assert.strictEqual(cutwingReappear.startTicks, 12);
assert.strictEqual(cutwingReappear.instantOpacity, true);
assert.strictEqual(cutwingReappearFrame.opacity, 1,
    '측후방 출현은 해당 비트의 첫 프레임부터 보여야 한다');
assert.notStrictEqual(cutwingReappearFrame.transform, 'translate(0px, 0px)',
    '측후방 출현은 홈이 아니라 목표 주변 좌표에 배치되어야 한다');
assert.strictEqual(cutwingAimFrame.transform, cutwingReappearFrame.transform,
    '측후방 조준은 출현 좌표를 유지해야 한다');
assert.deepStrictEqual(reviewedCutwingAmbush.impacts.map(impact => impact.atTicks), [21],
    '급습 충돌은 dive가 목표에 도착한 21틱에 발생해야 한다');

const fadingLeap = HuntMotionCompiler.compile([
    { beat: 'leap', ticks: 4, to: 'offscreen:left', pose: 'stretch', fade: 'out' }
], { anchors });
assert.ok(fadingLeap.placement
    .filter(frame => frame.offset === 0)
    .every(frame => frame.transform === 'translate(0px, 0px)'),
'a fading leap must begin at home instead of teleporting to its destination on the first frame');
assert.ok(!fadingLeap.placement.some(frame => frame.offset > 0 && frame.offset < 1),
    'fade must share the travel interval instead of injecting a destination EPS frame');

const reentry = HuntMotionCompiler.compile([
    { beat: 'hidden', ticks: 2, opacity: 0 },
    { beat: 'appear', ticks: 2, at: 'polar:hunter:2 315deg 700', fade: 'in' }
], { anchors });
const reentryBoundary = reentry.placement.filter(frame => frame.offset === .5);
assert.notStrictEqual(reentryBoundary.at(-1).transform, 'translate(0px, 0px)',
    '`at` must remain the final frame at its boundary instead of being overwritten by the previous point');

const transformed = HuntMotionCompiler.compile([{
    beat: 'edited', ticks: 10, to: 'hunter:1', offsetX: 12, offsetY: -8,
    rotation: 30, rotateBy: 180, scaleX: 1.2, scaleY: .8,
    skewX: 5, skewY: -3, opacity: .7, origin: '25% 75%',
    moveEasing: 'accelerate', rotationEasing: 'slow-fast-slow'
}], { anchors });
assert.ok(transformed.placement.some(frame => frame.easing === HuntMotionCompiler.EASING_PRESETS.accelerate));
assert.ok(transformed.pose.some(frame => frame.easing === HuntMotionCompiler.EASING_PRESETS['slow-fast-slow']));
assert.ok(transformed.pose.some(frame => frame.transform.includes('skew(5.00deg, -3.00deg)')));
assert.ok(transformed.pose.some(frame => frame.transform.includes('scale(1.2000, 0.8000)')));
assert.ok(transformed.pose.some(frame => frame.origin === '25% 75%'));

const continuousCharge = HuntMotionCompiler.compile([
    { beat: 'charge', ticks: 5, to: 'hunter:1', moveEasing: 'linear' },
    { beat: 'impact', ticks: 3, continueTravel: true, hit: true, moveEasing: 'linear' }
], { anchors });
const chargeStart = continuousCharge.placement.find(frame => frame.offset === 0);
const contact = continuousCharge.placement.filter(frame => frame.offset === 5 / 8).at(-1);
const passThrough = continuousCharge.placement.at(-1);
const chargeXY = frame => frame.transform.match(/translate\((-?\d+)px, (-?\d+)px\)/).slice(1).map(Number);
const [startX, startY] = chargeXY(chargeStart), [contactX, contactY] = chargeXY(contact),
    [endX, endY] = chargeXY(passThrough);
assert.ok(Math.abs((contactX - startX) / 5 - (endX - contactX) / 3) <= 1
    && Math.abs((contactY - startY) / 5 - (endY - contactY) / 3) <= 1,
    '돌진과 피격 BEAT는 같은 방향과 픽셀/틱 속도로 한 직선을 계속 달려야 한다');
assert.strictEqual(continuousCharge.timeline[1].continueTravel, true);

const directionalTilt = HuntMotionCompiler.compile([
    { beat: 'right-hit', ticks: 3, to: 'hunter:3', pose: 'brace', rotationToward: 28 },
    { beat: 'recover', ticks: 5, to: 'home', pose: 'brace', rotation: 0 }
], { anchors });
assert.strictEqual(directionalTilt.timeline[0].rotation, 28,
    'rightward shoulder travel tilts the sprite upper edge to the right');
assert.strictEqual(directionalTilt.timeline[1].rotation, 0,
    'explicit recovery returns the sprite upright');

const travelAligned = HuntMotionCompiler.compile([
    { beat: 'left-flight', ticks: 4, to: 'hunter:0', face: 'hunter:0', pose: 'stretch', alignRotationToTravel: true },
    { beat: 'plant', ticks: 2, pose: 'brace', origin: 'part:left-front-leg' },
    { beat: 'pivot', ticks: 4, pose: 'stretch-strong', origin: 'part:left-front-leg', rotateBy: 180 }
], { anchors });
assert.ok(travelAligned.timeline[0].rotation < 0,
    'a leftward descending flight aligns the sprite angle to its actual travel vector');
assert.strictEqual(travelAligned.timeline[0].alignRotationToTravel, true);
assert.strictEqual(travelAligned.timeline[1].to, null,
    'planting a foreleg does not translate the monster');
assert.ok(Math.abs(travelAligned.timeline[2].rotation - (travelAligned.timeline[0].rotation + 180)) < 1e-6,
    'the planted foreleg pivot adds exactly one half-turn after arrival');

const anatomicalAim = HuntMotionCompiler.compile([{
    beat: 'feet-forward', ticks: 4, to: 'toward:hunter:0 70%', face: 'hunter:0',
    pose: 'stretch', aimBodyAt: 'hunter:0'
}], {
    anchors,
    partOffset: name => ({
        'part:torso': { x: 0, y: 0 },
        'part:left-front-leg': { x: -40, y: 100 },
        'part:right-front-leg': { x: 40, y: 100 }
    }[name] || { x: 0, y: 0 })
});
assert.strictEqual(anatomicalAim.timeline[0].aimBodyAt, 'hunter:0');
assert.ok(anatomicalAim.timeline[0].rotation > 0,
    'body aim rotates the torso-to-forefeet axis toward the hunter instead of aligning the sprite edge to travel');

const rightOnlyFacing = HuntMotionCompiler.compile([
    { beat: 'spring-load', ticks: 2, face: 'hunter:3', pose: 'crouch' },
    { beat: 'flank-hop', ticks: 5, to: 'flank:hunter:3 210', face: 'hunter:3', pose: 'stretch-strong' },
    { beat: 'impact', ticks: 2, to: 'hunter:3', face: 'hunter:3', hit: true }
], { anchors });
assert.strictEqual(rightOnlyFacing.facingActive, true,
    'a consistently right-facing motion must still activate the facing layer');
assert.strictEqual(rightOnlyFacing.facing[0].direction, 1);
assert.strictEqual(rightOnlyFacing.facing.length, 1,
    'the regression case has no direction change and therefore needs facingActive, not frame-count guessing');
const temporaryMirror = HuntMotionCompiler.compile([
    { beat: 'first-swing', ticks: 4, pose: 'stretch' },
    { beat: 'second-swing', ticks: 4, pose: 'stretch', flipFacing: true },
    { beat: 'settle', ticks: 4, pose: 'settle', flipFacing: true }
], { anchors });
assert.deepStrictEqual(temporaryMirror.facing.map(frame => [frame.offset, frame.direction]), [
    [4 / 12, -1], [8 / 12, 1]
], 'a temporary mirrored strike must flip only its authored BEAT and restore on settle');
const pairAnchors = primaryTarget => new HuntStageAnchors({
    monsterRect: anchors.monsterRect,
    cardRect: anchors.cardRect,
    stageWidth: anchors.stageWidth,
    hunters: anchors.hunters,
    primaryTarget,
    targetSequence: [1, 2],
    targetGroup: [1, 2]
});
const pairFromLeft = pairAnchors(1);
const pairFromRight = pairAnchors(2);
assert.ok(pairFromLeft.resolve('pair-flank:targets 150').x < pairFromLeft.resolve('hunter:1').x,
    'an adjacent pair led by its left member must be approached from outside hunter 2');
assert.ok(pairFromRight.resolve('pair-flank:targets 150').x > pairFromRight.resolve('hunter:2').x,
    'an adjacent pair led by its right member must be approached from outside hunter 3');
const inwardTackle = HuntMotionCompiler.compile([
    { beat: 'outside', ticks: 2, to: 'pair-flank:targets 150', bounds: 'reach' },
    { beat: 'cross', ticks: 4, to: 'through-current:target-group 200%', bounds: 'reach',
        hit: true, hitOffsetTicks: 2, fx: 'target-impact-dust', fxAnchor: 'target' }
], { anchors: pairFromRight });
const placementX = frame => Number(String(frame.transform).match(/translate\((-?\d+)px/)?.[1]);
const outsideBoundary = inwardTackle.timeline.find(beat => beat.beat === 'outside').endTicks
    / inwardTackle.totalTicks;
const outsideX = placementX(inwardTackle.placement.filter(frame => frame.offset === outsideBoundary).at(-1));
const finalX = placementX(inwardTackle.placement.at(-1));
const pairCenterX = pairFromRight.resolve('target-group').x;
assert.ok(outsideX > pairFromRight.resolve('hunter:2').x && finalX < pairCenterX,
    'increasing shoulder-check distance must cross both adjacent hunters on the same inward line');
assert.deepStrictEqual(inwardTackle.visualCues.find(cue => cue.fx === 'target-impact-dust'), {
    atTicks: 4,
    beat: 'cross',
    fx: 'target-impact-dust',
    anchor: 'target',
    targetMode: 'sequential',
    durationTicks: 4
}, 'target impact dust must follow the independently edited HIT tick and target route');

const layeredImpact = HuntMotionCompiler.compile([
    { beat: 'impact', ticks: 4, hit: true, fx: 'part-dust', fxAnchor: 'head',
        fxSecondary: 'target-impact-dust', fxSecondaryAnchor: 'target', fxSecondaryDurationTicks: 6,
        fxAdditional: [{ fx: 'part-swing-arc', anchor: 'head', durationTicks: 5 }] }
], { anchors, rig: 'winged' });
assert.deepStrictEqual(layeredImpact.visualCues.map(cue => [cue.fx, cue.anchor]), [
    ['part-dust', 'head'],
    ['target-impact-dust', 'target'],
    ['part-swing-arc', 'head']
], 'one HIT beat may retain part dust while adding target dust and a directional swing arc');
const leftOnlyFacing = HuntMotionCompiler.compile([
    { beat: 'spring-load', ticks: 2, face: 'hunter:0', pose: 'crouch' },
    { beat: 'flank-hop', ticks: 5, to: 'flank:hunter:0 210', face: 'hunter:0', pose: 'stretch-strong' },
    { beat: 'impact', ticks: 2, to: 'hunter:0', face: 'hunter:0', hit: true }
], { anchors });
assert.deepStrictEqual(leftOnlyFacing.facing, [{ offset: 0, direction: -1 }],
    'a consistently left-facing shoulder check must not retain a conflicting default frame at offset zero');
const editorFacingAlias = HuntMotionCompiler.compile([
    { beat: 'approach', ticks: 5, to: 'hunter:0', face: 'toward-target', pose: 'stretch-soft' }
], { anchors });
assert.deepStrictEqual(editorFacingAlias.facing, [{ offset: 0, direction: -1 }],
    'the editor target-facing command must resolve as target instead of aborting compilation');
const explicitRightFacing = HuntMotionCompiler.compile([
    { beat: 'approach', ticks: 5, to: 'hunter:0', face: 'right', pose: 'stretch-soft' }
], { anchors });
assert.deepStrictEqual(explicitRightFacing.facing, [{ offset: 0, direction: 1 }],
    'explicit left/right facing controls must not be parsed as stage anchors');

const strideFlip = HuntMotionCompiler.compile([
    { beat: 'stomp', ticks: 3, pose: 'crouch', stompSteps: 3 },
    { beat: 'charge', ticks: 10, to: 'hunter:3', face: 'hunter:3', pose: 'idle', instantPose: true, strideFlipTicks: 3 }
], { anchors });
assert.deepStrictEqual(
    strideFlip.strideWindows,
    [{ startTicks: 3, endTicks: 13, intervalTicks: 3 }],
    '돌진 스텝은 전조가 끝난 뒤 실제 돌진 구간에만 0.3초 교대 창을 열어야 한다'
);
assert.strictEqual(strideFlip.timeline[1].strideFlipTicks, 3);
const chargeStartPose = strideFlip.pose.filter(frame => frame.offset === 3 / 13).at(-1);
assert.match(chargeStartPose.transform, /scale\(1\.0000, 1\.0000\)/,
    '돌진 시작 프레임부터 몬스터 이미지의 원래 종횡비를 유지해야 한다');
assert.strictEqual(strideFlip.timeline[0].stompSteps, 3);
assert.ok(strideFlip.pose.some(frame => frame.offset > 0 && frame.offset < 3 / 13
    && /rotate\(-7\.00deg\)/.test(frame.transform)),
    '발구르기 전조에는 왼발을 찍는 하강 프레임이 있어야 한다');
assert.ok(strideFlip.pose.some(frame => frame.offset > 0 && frame.offset < 3 / 13
    && /rotate\(7\.00deg\)/.test(frame.transform)),
    '발구르기 전조에는 오른발을 찍는 하강 프레임이 있어야 한다');

// ---- 길이는 틱에서만 나온다 ----

assert.strictEqual(built.totalTicks, 20, '틱 합이 총 길이다');
assert.strictEqual(built.durationMs, 2000, '길이는 틱에서 파생된다 (배율을 더 곱하지 않는다)');

// VISUAL_DURATION_SCALE(1.25)이 다시 곱해지면 2500이 된다. 그러면 애니메이션이
// 자기 틱 창보다 25% 길어지고, 턴이 끝나며 잘려나가 마무리 없이 뚝 끊긴다.
assert.notStrictEqual(built.durationMs, 2500, '시각 배율이 이중 적용되면 안 된다');

// ---- 타격 시점은 그림에서 나온다 ----

assert.strictEqual(built.impacts.length, 1, '타격이 하나다');
assert.strictEqual(built.impacts[0].atTicks, 10, 'strike 비트의 시작 틱이 곧 접촉이다');
assert.strictEqual(built.impacts[0].beat, 'strike');
const offsetImpact = HuntMotionCompiler.compile([
    { beat: 'approach', ticks: 5, to: 'hunter:2', pose: 'idle' },
    { beat: 'strike', ticks: 4, pose: 'land', hit: true, hitOffsetTicks: 2 }
], { anchors, rig: 'winged' });
assert.strictEqual(offsetImpact.impacts[0].atTicks, 7,
    '독립 HIT 오프셋은 BEAT 길이를 바꾸지 않고 실제 판정 틱만 이동해야 한다');

// 음향도 같은 틱에서 나온다. 둘을 따로 적지 않으므로 어긋날 수 없다.
assert.deepStrictEqual(built.cues.map(cue => [cue.atTicks, cue.beat, cue.audioSlot, cue.authoredSfx]), [
    [0, 'windup', 'beat:windup', null],
    [5, 'leap', 'beat:leap', null],
    [8, 'appear', 'beat:appear', null],
    [10, 'strike', 'beat:strike', 'impact'],
    [14, 'hold', 'beat:hold', null],
    [16, 'return', 'beat:return', null]
], 'every authored beat must expose one stable audio slot at the same timeline offset');

const burrowFx = HuntMotionCompiler.compile([
    { beat: 'dig', ticks: 5, fx: 'burrow-dust', fxDurationTicks: 11 },
    { beat: 'sink', ticks: 6, opacity: .35 },
    { beat: 'track', ticks: 8, fx: 'burrow-tracking-dust', fxAnchor: 'target', fxDurationTicks: 8 }
], { anchors });
assert.deepStrictEqual(burrowFx.visualCues, [
    { atTicks: 0, beat: 'dig', fx: 'burrow-dust', anchor: 'monster', durationTicks: 11 },
    { atTicks: 11, beat: 'track', fx: 'burrow-tracking-dust', anchor: 'target', durationTicks: 8 }
], '지중 진입·추적 먼지 FX는 각 BEAT 시작 틱과 지속 틱에 묶여야 한다');

// 타이밍 계획서와 대조할 수 있도록 비트 구간을 그대로 내보낸다.
assert.deepStrictEqual(built.timeline.map(step => [step.beat, step.startTicks, step.endTicks]), [
    ['windup', 0, 5], ['leap', 5, 8], ['appear', 8, 10],
    ['strike', 10, 14], ['hold', 14, 16], ['return', 16, 20]
]);

// ---- 오프셋은 정렬되어 있고 0~1을 벗어나지 않는다 ----

for (const track of ['placement', 'pose']) {
    const offsets = built[track].map(frame => frame.offset);
    assert.deepStrictEqual(offsets, [...offsets].sort((a, b) => a - b), `${track} 오프셋이 뒤로 간다`);
    assert.ok(offsets.every(value => value >= 0 && value <= 1), `${track} 오프셋이 범위를 벗어난다`);
    assert.strictEqual(offsets[0], 0, `${track}는 0에서 시작해야 한다`);
    assert.strictEqual(offsets[offsets.length - 1], 1, `${track}는 1에서 끝나야 한다`);
}

// ---- 레이어 책임이 지켜진다 ----

for (const frame of built.placement) {
    assert.match(frame.transform, /^translate\(/, 'placement는 이동만 한다');
    assert.ok(!/rotate|scale/.test(frame.transform), 'placement는 회전·신축하지 않는다');
}
for (const frame of built.pose) {
    assert.match(frame.transform, /^rotate\([^)]*\) skew\([^)]*\) scale\(/, 'pose는 회전·기울기·신축만 한다');
    assert.ok(!/translate/.test(frame.transform), 'pose는 이동하지 않는다');
}

// ---- 복귀는 항상 똑바로 선 자세로 끝난다 ----

const last = built.pose[built.pose.length - 1];
assert.strictEqual(last.transform, 'rotate(0.00deg) skew(0.00deg, 0.00deg) scale(1.0000, 1.0000)',
    '마지막 자세가 idle이면 이미지가 늘 원래 방향으로 선다');

// ---- 화면 밖은 실제로 밖으로 나간다 ----

const leapFrame = built.placement.find(frame => /translate\(-\d{3,}px/.test(frame.transform));
assert.ok(leapFrame, 'offscreen 앵커가 화면 밖 좌표를 만들어야 한다');

// ---- 방향은 이동에서 파생된다 (규칙 3) ----

assert.ok(built.facing.length >= 2, '이동 방향이 바뀌면 facing도 바뀐다');
assert.ok(built.facing.every(step => Math.abs(step.direction) === 1), 'facing은 ±1이다');

// ---- 정지(hold)는 저작자가 프레임을 두 번 적지 않아도 생긴다 ----

const settleFrames = built.pose.filter(frame => /scale\(1\.04/.test(frame.transform));
assert.ok(settleFrames.length >= 2,
    'hold가 붙은 자세는 두 프레임으로 펼쳐져야 한다 ("휙! 착지!"의 멈춤)');

// ---- 회전 자세: 반동 -> 오버슛 -> 되감기 ----

const spin = HuntMotionCompiler.compile([
    { beat: 'spin', ticks: 12, pose: 'spin-right' },
    { beat: 'settle', ticks: 3, pose: 'idle' }
], { anchors });

const angles = spin.pose.map(frame => Number(frame.transform.match(/rotate\((-?[\d.]+)deg\)/)[1]));
const windup = Math.min(...angles);
const peak = Math.max(...angles);
assert.ok(windup < 0, '시계 회전은 먼저 반시계로 감았다가 푼다 (반동)');
assert.strictEqual(peak, 375, '한 바퀴 + 15도까지 돈다 (관성 오버슛)');
// 오버슛 뒤 되감김. 375에서 recoil 15만큼 돌아온다.
assert.ok(angles.includes(360), '접촉 후 15도 되감겨야 한다');

// 회전 자세는 축을 함께 들고 있어야 한다. 축이 CSS에 흩어져 있으면 특이도
// 사고(rig 기본 축이 모션별 축을 이기던 22개 규칙)가 다시 생긴다.
assert.ok(spin.pose.some(frame => frame.pivot === 'part:foreleg.screen-right'),
    '회전 자세는 회전축을 부위 이름으로 들고 있어야 한다');

// ---- 원근은 비트가 갖고, 명시하지 않으면 이어진다 ----

const depths = HuntMotionCompiler.compile([
    { beat: 'a', ticks: 2, pose: 'idle' },
    { beat: 'b', ticks: 2, pose: 'idle', depth: 1.4 },
    { beat: 'c', ticks: 2, pose: 'idle' }
], { anchors });
const scales = depths.pose.map(frame => Number(frame.transform.match(/scale\(([\d.]+)/)[1]));
assert.strictEqual(scales[0], 1, '기본 원근은 1이다');
assert.strictEqual(scales[scales.length - 1], 1.4, '명시하지 않은 비트는 이전 원근을 잇는다');

// 자세(비율)와 원근(크기)이 독립이다. 같은 웅크림을 거리만 바꿔 쓸 수 있어야
// 한다 — 이걸 한 필드에 묶었기 때문에 scale 조합이 139가지까지 늘어났다.
const near = HuntMotionCompiler.compile([{ beat: 'x', ticks: 2, pose: 'crouch', depth: 1.4 }], { anchors });
const far = HuntMotionCompiler.compile([{ beat: 'x', ticks: 2, pose: 'crouch', depth: .7 }], { anchors });
const ratio = frame => {
    const [, x, y] = frame.transform.match(/scale\(([\d.]+), ([\d.]+)\)/);
    return Number(x) / Number(y);
};
// 허용 오차는 소수 네 자리 반올림에서 나오는 것뿐이다(약 1e-4).
assert.ok(Math.abs(ratio(near.pose[near.pose.length - 1]) - ratio(far.pose[far.pose.length - 1])) < 1e-3,
    '원근이 달라도 자세 비율은 같아야 한다');

// ---- 회전은 비트를 넘어 유지되고 idle이 푼다 ----
//
// 꼬리가 박힌 채 버티는 구간이 회전을 물고 있어야 한다. 그래서 회전은 자동으로
// 풀리지 않는다. 대신 idle이 "똑바로 선다"를 뜻하고, 복귀 비트가 그걸로 끝난다.
// 이게 없으면 몬스터가 뒤집힌 채 제자리에 돌아간다.
const held = HuntMotionCompiler.compile([
    { beat: 'slam', ticks: 3, pose: 'tail-slam' },
    { beat: 'brace', ticks: 20, pose: 'brace' },
    { beat: 'return', ticks: 4, pose: 'idle' }
], { anchors });
const angleAt = offset => Number(held.pose
    .filter(frame => frame.offset <= offset).pop()
    .transform.match(/rotate\((-?[\d.]+)deg\)/)[1]);
assert.strictEqual(angleAt(.5), 180, '버티는 동안 회전이 유지돼야 한다');
assert.strictEqual(angleAt(1), 0, '복귀는 똑바로 선 채로 끝나야 한다');

// 한 바퀴를 마친 회전은 복귀 중 0도로 보간하면 역회전해 보인다. 누적 각도를
// 유지한 채 이동하고, 애니메이션 종료 시 owner가 transform을 제거해야 한다.
const fullTurnReturn = HuntMotionCompiler.compile([
    { beat: 'spin', ticks: 12, pose: 'spin-right' },
    { beat: 'return', ticks: 4, to: 'home', pose: 'idle' }
], { anchors });
const returnStart = 12 / 16;
const returnAngles = fullTurnReturn.pose
    .filter(frame => frame.offset >= returnStart)
    .map(frame => Number(frame.transform.match(/rotate\((-?[\d.]+)deg\)/)[1]));
assert.ok(returnAngles.every(angle => angle === 360),
    '한 바퀴 회전은 복귀 중 역회전하지 않고 360도를 유지해야 한다');

// 반 바퀴 자세는 복귀 구간에 걸쳐 되감지 않고 경계에서 즉시 기본 자세가 된다.
const halfTurnReturn = HuntMotionCompiler.compile([
    { beat: 'slam', ticks: 3, pose: 'tail-slam' },
    { beat: 'return', ticks: 4, to: 'home', pose: 'idle' }
], { anchors });
const halfReturnAngles = halfTurnReturn.pose
    .filter(frame => frame.offset > 3 / 7)
    .map(frame => Number(frame.transform.match(/rotate\((-?[\d.]+)deg\)/)[1]));
assert.ok(halfReturnAngles.every(angle => angle === 0),
    '반 바퀴 자세도 복귀 중 되감지 말고 복귀 시작점에서 즉시 세워야 한다');

// 축도 회전과 함께 유지돼야 한다. 회전이 남았는데 축만 기본값으로 돌아가면
// 버티는 구간으로 넘어가는 순간 몸이 튄다.
const pivotAt = offset => held.pose.filter(frame => frame.offset <= offset).pop().pivot || null;
assert.strictEqual(pivotAt(.5), 'part:tail', '버티는 동안 축이 유지돼야 한다');
assert.strictEqual(pivotAt(1), null, '똑바로 서면 축도 기본으로 돌아간다');

// ---- align: 몸 중심이 아니라 그 부위를 목적지에 얹는다 ----
//
// "너무 헌터 중앙으로 이동해서 몸통 내려찍기나 다름없다"가 이 뺄셈이 없어서 났다.
// 나르가 꼬리는 이미지 상단 좌측(30%, 17%)이라 중심을 (+76, +125)px 옮겨야
// 꼬리가 헌터를 덮는다. 그 숫자를 패턴에 적지 않는다.
const SPRITE = 380;
const anatomy = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const partOffset = (name, facing) => {
    const point = HuntStageAnchors.resolvePart(anatomy, { id: 'nargacuga' }, name, facing);
    return { x: (point.xPercent / 100 - .5) * SPRITE, y: (point.yPercent / 100 - .5) * SPRITE };
};

const plain = HuntMotionCompiler.compile(
    [{ beat: 'slam', ticks: 4, to: 'hunter:2', bounds: 'reach' }], { anchors, partOffset });
const aligned = HuntMotionCompiler.compile(
    [{ beat: 'slam', ticks: 4, to: 'hunter:2', align: 'part:tail', bounds: 'reach' }], { anchors, partOffset });

const xy = frame => frame.transform.match(/translate\((-?\d+)px, (-?\d+)px\)/).slice(1).map(Number);
const [plainX, plainY] = xy(plain.placement[plain.placement.length - 1]);
const [alignX, alignY] = xy(aligned.placement[aligned.placement.length - 1]);

// 꼬리 (.30, .17) → 중심에서 (-76, -125.4)px. 그만큼 반대로 밀어야 꼬리가 목적지에 온다.
// 여기서는 보정 산술만 본다. 경계는 바로 아래 항목에서 따로 확인한다.
assert.strictEqual(alignX - plainX, 76, '꼬리를 얹으려면 몸이 오른쪽으로 76px 가야 한다');
assert.strictEqual(alignY - plainY, 125, '꼬리를 얹으려면 몸이 아래로 125px 가야 한다');

// 반전하면 가로 보정도 뒤집힌다. 저작자는 좌우 두 벌을 적지 않는다.
const mirrored = HuntMotionCompiler.compile(
    [{ beat: 'turn', ticks: 2, to: 'hunter:0' },
     { beat: 'slam', ticks: 4, to: 'hunter:0', align: 'part:tail', bounds: 'reach' }], { anchors, partOffset });
const [mirrorX] = xy(mirrored.placement[mirrored.placement.length - 1]);
const [plainLeftX] = xy(HuntMotionCompiler.compile(
    [{ beat: 'turn', ticks: 2, to: 'hunter:0' },
     { beat: 'slam', ticks: 4, to: 'hunter:0', bounds: 'reach' }], { anchors, partOffset })
    .placement.slice(-1)[0]);
assert.strictEqual(mirrorX - plainLeftX, -76,
    '왼쪽을 보면 꼬리가 화면 오른쪽에 오므로 보정도 반대다');

const passAnchors = new HuntStageAnchors({
    monsterRect: rect(660, 100, 380, 380),
    cardRect: rect(0, 0, 1700, 900),
    stageWidth: 1700,
    hunters: anchors.hunters,
    primaryTarget: 2,
    targetSequence: [2, 3]
});
const doubleBite = HuntMotionCompiler.compile([
    { beat: 'windup', ticks: 5, pose: 'crouch' },
    { beat: 'approach-1', ticks: 11, to: 'pass:1', align: 'part:head', pose: 'stretch-soft' },
    { beat: 'bite-1', ticks: 3, to: 'pass:1', align: 'part:head', pose: 'land', hit: true },
    { beat: 'approach-2', ticks: 11, to: 'pass:2', align: 'part:head', pose: 'stretch-soft' },
    { beat: 'bite-2', ticks: 2, to: 'pass:2', align: 'part:head', pose: 'land', hit: true, damageScale: .82 },
    { beat: 'return', ticks: 4, to: 'home', pose: 'idle' }
], { anchors: passAnchors, partOffset });
assert.strictEqual(doubleBite.totalTicks, 36);
assert.deepStrictEqual(doubleBite.impacts.map(hit => [hit.atTicks, hit.damageScale]),
    [[16, 1], [30, .82]], '연속 물어뜯기의 두 접촉은 실제 순차 표적 타이밍과 같아야 한다');

assert.throws(() => HuntMotionCompiler.compile(
    [{ beat: 'a', ticks: 2, align: 'part:tail' }], { anchors, partOffset }),
    HuntMotionCompilerError, 'align은 목적지 없이 쓸 수 없다');

// 접합 보정은 경계를 조용히 넘을 수 없다. 앞에서만 클램프하면 부위를 얹느라
// 몸이 OBS 채팅 영역으로 밀려들어간다 — 벨리오로스 꼬리에서 실제로 그랬다.
const CONTACT_MAX_Y = HuntStageAnchors.BOUNDS.contact.maxY;
const pushed = HuntMotionCompiler.compile(
    [{ beat: 'sweep', ticks: 4, to: 'hunter:2', align: 'part:tail' }], { anchors, partOffset });
const pushedY = xy(pushed.placement[pushed.placement.length - 1])[1];
assert.ok(pushedY <= CONTACT_MAX_Y,
    `접합 뒤에도 클램프가 걸려야 한다 (${pushedY} > ${CONTACT_MAX_Y})`);

// 일부러 넘겨야 하는 기술은 명시한다. 회전축이 곧 접합 부위여서 회전이 몸을
// 도로 올리는 경우다.
const reached = HuntMotionCompiler.compile(
    [{ beat: 'slam', ticks: 4, to: 'hunter:2', align: 'part:tail', bounds: 'reach' }],
    { anchors, partOffset });
assert.ok(xy(reached.placement[reached.placement.length - 1])[1] > CONTACT_MAX_Y,
    "bounds: 'reach'는 접합이 안전선을 넘도록 허용한다");

// ---- 골격마다 값만 다르다 ----

const wingedCrouch = HuntMotionPoses.resolve('crouch', 'winged').squash;
const quadCrouch = HuntMotionPoses.resolve('crouch', 'quadruped').squash;
assert.notStrictEqual(wingedCrouch, quadCrouch, '골격마다 수치가 다르다');
for (const rig of Object.keys(HuntMotionPoses.RIGS)) {
    for (const name of Object.keys(HuntMotionPoses.BASE)) {
        assert.ok(HuntMotionPoses.resolve(name, rig), `${rig}에 ${name} 자세가 없다`);
    }
}

// ---- 실패는 던진다 ----

assert.throws(() => HuntMotionCompiler.compile([], { anchors }),
    HuntMotionCompilerError, '빈 비트는 예외다');
assert.throws(() => HuntMotionCompiler.compile([{ beat: 'a', ticks: 0 }], { anchors }),
    HuntMotionCompilerError, '틱이 0이면 예외다');
assert.throws(() => HuntMotionCompiler.compile([{ beat: 'a', ticks: 1.5 }], { anchors }),
    HuntMotionCompilerError, '틱이 정수가 아니면 예외다');
assert.throws(() => HuntMotionCompiler.compile([{ beat: 'a', ticks: 2, depth: 0 }], { anchors }),
    HuntMotionCompilerError, '원근이 0이면 예외다');
assert.throws(() => HuntMotionCompiler.compile([{ beat: 'a', ticks: 2, pose: 'crounch' }], { anchors }),
    /알 수 없는 자세/, '오타난 자세는 조용히 idle로 떨어지지 않는다');
assert.throws(() => HuntMotionCompiler.compile([{ beat: 'a', ticks: 2, to: 'hunter:9' }], { anchors }),
    /9번 헌터가 없다/, '앵커 오류가 그대로 올라온다');

// 회전축이 존재하는 부위를 가리키는지 — 나르가로 전수 확인한다.
for (const [name, definition] of Object.entries(HuntMotionPoses.ROTATION)) {
    if (!definition.pivot) continue;
    assert.doesNotThrow(
        () => HuntStageAnchors.resolvePart(anatomy, { id: 'nargacuga' }, definition.pivot, 1),
        `회전 자세 ${name}의 축(${definition.pivot})이 없는 부위를 가리킨다`);
}

console.log(`[test] 비트 컴파일러 계약 통과 (자세 ${HuntMotionPoses.names().length}종).`);
