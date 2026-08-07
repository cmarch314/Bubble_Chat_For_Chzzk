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

// 음향도 같은 틱에서 나온다. 둘을 따로 적지 않으므로 어긋날 수 없다.
assert.deepStrictEqual(built.cues, [{ atTicks: 10, beat: 'strike', sfx: 'impact' }]);

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
    assert.match(frame.transform, /^rotate\([^)]*\) scale\(/, 'pose는 회전과 신축만 한다');
    assert.ok(!/translate/.test(frame.transform), 'pose는 이동하지 않는다');
}

// ---- 복귀는 항상 똑바로 선 자세로 끝난다 ----

const last = built.pose[built.pose.length - 1];
assert.strictEqual(last.transform, 'rotate(0.00deg) scale(1.0000, 1.0000)',
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
const anatomy = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
for (const [name, definition] of Object.entries(HuntMotionPoses.ROTATION)) {
    if (!definition.pivot) continue;
    assert.doesNotThrow(
        () => HuntStageAnchors.resolvePart(anatomy, { id: 'nargacuga' }, definition.pivot, 1),
        `회전 자세 ${name}의 축(${definition.pivot})이 없는 부위를 가리킨다`);
}

console.log(`[test] 비트 컴파일러 계약 통과 (자세 ${HuntMotionPoses.names().length}종).`);
