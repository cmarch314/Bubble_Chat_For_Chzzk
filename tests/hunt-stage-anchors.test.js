'use strict';

// 좌표 어휘 해석기의 계약을 고정한다.
//
// 이 테스트가 지키는 것은 "숫자가 한 곳에만 있다"이다. 지금까지 사고의 대부분은
// 같은 상수가 두 곳에 복사돼 한쪽만 고쳐진 데서 나왔다.
//   - approachX .92(애니메이터)와 standoff .88(CSS)이 서로 모르게 곱해져
//     표적까지의 81%에서 멈췄다.
//   - 430 클램프가 애니메이터·급습·글라이드·양탄자폭격에 각각 복사돼 있었다.
//   - 없는 헌터를 가리키면 undefined가 calc()에 흘러들어 선언이 통째로 무효화되고
//     아무 신호가 없었다.

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const HuntStageAnchors = require('../js/effects/hunt/HuntStageAnchors.js');
const { HuntStageAnchorError } = HuntStageAnchors;

const rect = (left, top, width, height) => ({ left, top, width, height });

// 몬스터는 스테이지 위쪽 중앙, 헌터 넷은 아래에 가로로 늘어선 배치.
// 번호는 DOM의 fight-card-N을 그대로 쓴다. 실제 화면은 0부터 시작하므로,
// 해석기가 번호 범위를 가정하면 0번을 놓친다 — fromDom은 세지 않고 발견한다.
const anchors = new HuntStageAnchors({
    monsterRect: rect(660, 100, 380, 380),        // 중심 (850, 290)
    cardRect: rect(0, 0, 1700, 900),
    stageWidth: 1700,
    hunters: new Map([
        [1, rect(200, 700, 120, 160)],            // 중심 (260, 780)
        [2, rect(600, 700, 120, 160)],            // 중심 (660, 780)
        [3, rect(1000, 700, 120, 160)],           // 중심 (1060, 780)
        [4, rect(1400, 700, 120, 160)]            // 중심 (1460, 780)
    ])
});

// ---- 원점과 이동 한계 ----

assert.deepStrictEqual(anchors.resolve('home'), { x: 0, y: 0 },
    'home은 원점이다');

// maxX = (1700 - 380) / 2 + 130 = 790
assert.strictEqual(anchors.maxX, 790, '이동 한계 계산이 바뀌었다');

// ---- 헌터 앵커 ----

// 3번 중심 (1060, 780) - 원점 (850, 290) = (210, 490) → y는 430으로 잘린다.
assert.deepStrictEqual(anchors.resolve('hunter:3'), { x: 210, y: 430 },
    '헌터 중심과 채팅 안전선');

const top3 = anchors.resolve('hunter:3.top');
assert.strictEqual(top3.x, 210, '기준점을 바꿔도 가로는 같다');
assert.ok(top3.y < 430, '상단 기준점은 안전선 위에 있어야 한다');

assert.ok(anchors.resolve('hunter:3.left').x < anchors.resolve('hunter:3.right').x,
    'left는 right보다 왼쪽이다');

// ---- between ----

// 1번(260)과 2번(660)의 중점 460 - 850 = -390
assert.strictEqual(anchors.resolve('between:1,2').x, -390, '두 헌터의 중점');

// ---- toward: 접근 배율이 어휘가 된다 ----

// 지금까지 애니메이터가 dx * .92로 계산하던 것이 이 형태다.
const full = anchors.resolve('hunter:1', { bounds: 'pivot' });
const partial = anchors.resolve('toward:hunter:1 92%', { bounds: 'pivot' });
assert.strictEqual(partial.x, Math.round(full.x * .92), '92%는 경로의 92% 지점이다');

// 배율을 두 번 거는 문법 자체를 막는다. .92 * .88 = .81 사고는 두 배율이 서로
// 모르게 곱해져서 났다. 인자를 받는 연산자를 중첩하면 인자가 어느 쪽 것인지
// 구분되지 않으므로, 조용히 기본값을 쓰는 대신 예외를 던진다.
assert.throws(() => anchors.resolve('toward:toward:hunter:1 92% 88%'),
    HuntStageAnchorError, '배율 중첩은 문법으로 막혀야 한다');
assert.throws(() => anchors.resolve('above:toward:hunter:1 150'),
    HuntStageAnchorError, '인자를 받는 연산자는 중첩할 수 없다');

// ---- 상대 이동 ----

// 문법 자체를 볼 때는 경계를 열어둔다. 클램프는 마지막에 한 번만 걸리므로,
// 열어두지 않으면 상대 이동 결과가 안전선에 눌려 대칭이 확인되지 않는다.
const WIDE = { minX: -5000, maxX: 5000, minY: -5000, maxY: 5000 };
const raw3 = anchors.resolve('hunter:3', { bounds: WIDE });
assert.deepStrictEqual(raw3, { x: 210, y: 490 }, '클램프 전 헌터 좌표');

const above = anchors.resolve('above:hunter:3 150', { bounds: WIDE });
assert.strictEqual(above.y, raw3.y - 150, 'above는 위로 150만큼 올린다');
assert.strictEqual(anchors.resolve('below:hunter:3 150', { bounds: WIDE }).y,
    above.y + 300, 'below는 above의 반대다');
assert.strictEqual(anchors.resolve('right:hunter:3 100', { bounds: WIDE }).x,
    anchors.resolve('left:hunter:3 100', { bounds: WIDE }).x + 200,
    'right와 left는 대칭이다');

// 클램프는 상대 이동 뒤에 한 번만 걸린다. 순서가 뒤집히면 "위로 150" 지시가
// 안전선에 먼저 눌려 사라진다.
assert.strictEqual(anchors.resolve('above:hunter:3 150').y, 340,
    '상대 이동 결과에 클램프가 걸려야 한다 (중간에 미리 걸리면 안 된다)');
assert.strictEqual(anchors.resolve('below:hunter:3 150').y, 430,
    '아래로 밀면 안전선에서 멈춘다');

// ---- polar ----

// 0도는 위, 시계 방향. 3번 헌터 기준 위로 200.
const north = anchors.resolve('polar:hunter:3 0deg 200', { bounds: WIDE });
const base3 = raw3;
assert.strictEqual(north.x, base3.x, '0도는 세로 방향뿐이다');
assert.strictEqual(north.y, base3.y - 200, '0도는 위쪽이다');

const east = anchors.resolve('polar:hunter:3 90deg 200', { bounds: WIDE });
assert.strictEqual(east.x, base3.x + 200, '90도는 오른쪽이다');

// 급습 재진입 위치 — "표적 기준 45도 아래, 고정 거리"가 한 줄이 된다.
const ambush = anchors.resolve('polar:hunter:2 225deg 700');
assert.ok(Number.isFinite(ambush.x) && Number.isFinite(ambush.y), '급습 좌표가 나온다');

// ---- 화면 밖은 클램프하지 않는다 ----

const out = anchors.resolve('offscreen:left');
assert.ok(out.x < -anchors.maxX,
    '화면 밖 앵커는 이동 한계를 넘어야 한다 (나가라고 지시한 것이다)');
assert.strictEqual(anchors.resolve('offscreen:right').x, -out.x, '좌우가 대칭이다');

// ---- 클램프는 해석기만 한다 ----

const contact = anchors.clamp({ x: 5000, y: 5000 }, 'contact');
assert.deepStrictEqual(contact, { x: 790, y: 430 }, '접촉 경계');

const standoff = anchors.clamp({ x: -5000, y: 5000 }, 'standoff');
assert.deepStrictEqual(standoff, { x: -790, y: 8 },
    '서서 쏘는 기술은 헌터 높이까지 내려가지 않는다');

assert.strictEqual(anchors.clamp({ x: 900, y: 0 }, 'pivot').x, 900,
    '회전 기술은 가로 한계를 넓게 연다');

// ---- 실패는 던진다 ----

assert.throws(() => anchors.resolve('hunter:9'), HuntStageAnchorError,
    '없는 헌터는 조용히 0이 아니라 예외다');
assert.throws(() => anchors.resolve('hunter:2.middle'), HuntStageAnchorError,
    '오타난 기준점은 예외다');
assert.throws(() => anchors.resolve('teleport:2'), HuntStageAnchorError,
    '알 수 없는 종류는 예외다');
assert.throws(() => anchors.resolve('polar:hunter:2 225deg'), HuntStageAnchorError,
    '인자가 모자라면 예외다');
assert.throws(() => anchors.resolve(''), HuntStageAnchorError, '빈 앵커는 예외다');

// 예외 메시지에 앵커 원문이 들어가야 원인을 찾을 수 있다.
try {
    anchors.resolve('hunter:9.bottom');
    assert.fail('예외가 나야 한다');
} catch (error) {
    assert.match(error.message, /hunter:9\.bottom/, '예외 메시지에 앵커 원문이 없다');
}

// ---- 방향은 앵커에서 파생된다 (규칙 3) ----

assert.strictEqual(anchors.facingToward('hunter:1'), -1, '왼쪽 헌터를 보면 -1');
assert.strictEqual(anchors.facingToward('hunter:4'), 1, '오른쪽 헌터를 보면 +1');

// ---- 부위 좌우 반전 (규칙 2) ----

const anatomy = require('../js/effects/hunt/HuntMonsterAnatomyCatalog.js');
const narga = { id: 'nargacuga' };

const tailRight = HuntStageAnchors.resolvePart(anatomy, narga, 'part:tail', 1);
const tailLeft = HuntStageAnchors.resolvePart(anatomy, narga, 'part:tail', -1);
assert.ok(Math.abs((tailRight.xPercent + tailLeft.xPercent) - 100) < 1e-9,
    '반전하면 부위 가로 좌표가 거울상이어야 한다');
assert.strictEqual(tailRight.yPercent, tailLeft.yPercent, '반전은 세로를 바꾸지 않는다');

// 화면 기준 요청은 반전 여부와 무관하게 늘 같은 쪽에 온다.
for (const facing of [1, -1]) {
    const screenLeft = HuntStageAnchors.resolvePart(anatomy, narga, 'part:wing.screen-left', facing);
    const screenRight = HuntStageAnchors.resolvePart(anatomy, narga, 'part:wing.screen-right', facing);
    assert.ok(screenLeft.xPercent < 50,
        `facing=${facing}에서 screen-left가 화면 왼쪽이 아니다 (${screenLeft.xPercent})`);
    assert.ok(screenRight.xPercent > 50,
        `facing=${facing}에서 screen-right가 화면 오른쪽이 아니다 (${screenRight.xPercent})`);
}

assert.throws(() => HuntStageAnchors.resolvePart(anatomy, narga, 'part:fin', 1),
    HuntStageAnchorError, '없는 부위는 예외다');

// ---- fromDom은 헌터 번호를 세지 않고 발견한다 ----
//
// 실제 화면의 카드는 fight-card-0부터 시작한다. 1..4로 훑으면 0번을 놓치고
// 없는 4번을 지어낸다. 처음 구현이 정확히 그랬고, 패턴 랩에서 바로 드러났다.

const stubRect = r => ({ getBoundingClientRect: () => r });
const stubCard = {
    querySelectorAll: () => [0, 1, 2, 3].map(index => ({
        id: `fight-card-${index}`,
        querySelector: () => stubRect(rect(200 + index * 400, 700, 120, 160))
    })),
    getBoundingClientRect: () => rect(0, 0, 1700, 900)
};
const discovered = HuntStageAnchors.fromDom(stubCard, {
    getBoundingClientRect: () => rect(660, 100, 380, 380),
    closest: () => null
});
assert.deepStrictEqual([...discovered.hunters.keys()], [0, 1, 2, 3],
    '헌터 번호는 DOM에서 발견해야 한다 (0부터 시작한다)');
assert.throws(() => discovered.resolve('hunter:4'), HuntStageAnchorError,
    '없는 번호를 지어내지 않는다');

// ---- 상수가 복사되지 않았는지 검사한다 ----
//
// 이 파일들에서 430/-240/maxX 계산식이 다시 나타나면, 앵커 해석기를 우회해
// 자기 클램프를 들고 있는 것이다. 그게 "1타만 다른 거리에서 멈춘다"의 원인이었다.

const owners = ['HuntMonsterAttackAnimator.js', 'HuntMonsterGeometryChoreography.js'];
for (const file of owners) {
    const source = fs.readFileSync(
        path.join(__dirname, '..', 'js', 'effects', 'hunt', file), 'utf8');
    assert.ok(!/Math\.min\(\s*430\b/.test(source),
        `${file}에 채팅 안전선(430)이 다시 복사됐다. anchors.clamp를 써야 한다.`);
    assert.ok(!/Math\.max\(\s*-240\b/.test(source),
        `${file}에 상단 경계(-240)가 다시 복사됐다. anchors.clamp를 써야 한다.`);
    assert.ok(!/\(\s*stage\?\.clientWidth\s*\|\|\s*720\s*\)/.test(source),
        `${file}에 이동 한계 계산이 다시 복사됐다. anchors.maxX를 써야 한다.`);
}

// 해석기 자신은 상수를 가져야 한다. 위 검사가 "지운다"로 통과하는 것을 막는다.
const anchorSource = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'effects', 'hunt', 'HuntStageAnchors.js'), 'utf8');
assert.match(anchorSource, /SAFE_BOTTOM\s*=\s*430/, '안전선 상수가 해석기에 없다');

console.log('hunt-stage-anchors.test.js 통과');
