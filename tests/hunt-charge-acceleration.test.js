'use strict';

// 돌진 공통 규칙(approved-monster-motion-rules.md 6번):
// 출발 후 0.5초 동안만 가속해 최고 속도에 도달하고, 그 뒤로는 접촉까지 속도가
// 변하지 않는다.
//
// 여기서 검사하는 것은 "가속이 끝난 뒤의 등속"이다. 가속 구간 자체는 출발
// 프레임의 animation-timing-function이 만들므로 키프레임 좌표만으로는 보이지 않는다.
// 대신 두 가지를 본다.
//   1. 클래스 이징이 linear인가. CSS 이징은 키프레임 구간마다 적용되므로
//      클래스에 cubic-bezier를 걸면 경유점마다 감속·재가속이 반복된다.
//      지그재그 돌진이 실제로 이 문제로 버벅였다.
//   2. 램프 종료 이후 프레임들의 구간 속도가 일정한가. 예전에는 출발 직후
//      한참을 거의 제자리에 있다가 갑자기 최고 속도로 튀었다.

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const runtimeStyle = fs.readFileSync(
    path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');

// 등가속 위치 곡선. 가속 구간을 여는 프레임은 반드시 이 곡선을 쓴다.
const ACCEL_CURVE = 'cubic-bezier(.333,0,.667,.333)';

// 돌진 모션을 손으로 나열하지 않는다. 예전에는 여기 적힌 4개만 검사했고,
// 나머지 돌진은 규칙 밖에 조용히 남았다. 고쳤다고 보고한 뒤에도 사용자가 보는
// 돌진은 그대로인 일이 반복된 직접적인 원인이다. 목록을 손으로 관리하는 순간
// 빠뜨린 것은 영원히 안 보인다.
//
// 이제 CSS에서 돌진 키프레임을 전부 찾아내고, 아직 못 옮긴 것은 PENDING에 이유와
// 함께 남긴다. 새 돌진을 추가하면 자동으로 검사 대상이 되고, PENDING에 없으면
// 테스트가 실패한다. 부채가 코드에 드러나 있고 줄어드는지 눈에 보인다.
const ALL_CHARGES = [...runtimeStyle.matchAll(
    /@keyframes (monster-motion-[\w-]*charge[\w-]*|tigrex-charge-chain[\w-]*)\s*\{/g)]
    .map(match => match[1])
    // 스텝 반전처럼 이동하지 않는 보조 애니메이션은 제외한다.
    .filter(name => !/stride-flip|footfall|rumble|slide|dust/.test(name));

// 아직 0.5초 램프로 옮기지 못한 돌진. 옮길 때마다 여기서 지운다.
// tigrex-charge-chain 계열은 CSS가 아니라 런타임이 경로를 만들므로(WAAPI),
// 접근 구간 속도와 횡단 구간 속도를 각각 따로 계산한다. CSS만 고쳐서는 안 되고
// HuntMonsterAttackAnimator.tigrexChargeRouteKeyframes를 함께 손봐야 한다.
const PENDING = new Set([
    'monster-motion-ground-charge-cross',
    'monster-motion-ground-charge-double',
    'monster-motion-ground-charge-triple',
    'monster-motion-ground-charge-stomp-burst',
    'monster-motion-ground-charge-double-stomp-burst',
    'monster-motion-aerial-charge-cross',
    'monster-motion-nargacuga-offscreen-charge',
    'tigrex-charge-chain',
    'tigrex-charge-chain-three'
]);

const RAMPED_CHARGES = ALL_CHARGES.filter(name => !PENDING.has(name));

// PENDING에 적힌 이름이 실제로 존재하는지 확인한다. 이름이 바뀌면 부채가 조용히
// 사라진 것처럼 보이므로, 없는 이름은 즉시 실패시킨다.
for (const name of PENDING) {
    assert.ok(ALL_CHARGES.includes(name),
        `PENDING의 ${name}이 CSS에 없다. 이름이 바뀌었거나 이미 지워졌다면 PENDING에서도 빼라.`);
}
assert.ok(RAMPED_CHARGES.length >= 4,
    `램프를 적용한 돌진이 너무 적다 (${RAMPED_CHARGES.length}). 전부 PENDING으로 빠져나갔을 수 있다.`);

for (const name of RAMPED_CHARGES) {
    const block = runtimeStyle.match(
        new RegExp(`@keyframes ${name}\\s*\\{([\\s\\S]*?)\\n\\}`));
    assert.ok(block, `${name} 키프레임을 찾지 못했다`);

    assert.ok(block[1].includes(ACCEL_CURVE),
        `${name}: 출발 프레임에 등가속 곡선 ${ACCEL_CURVE}이 있어야 한다. `
        + '이게 없으면 최고 속도로 즉시 출발하는 뻣뻣한 돌진이 된다.');

    // 가속 곡선은 딱 한 프레임에만 건다. 여러 프레임에 걸면 구간마다 재가속한다.
    const curveCount = block[1].split(ACCEL_CURVE).length - 1;
    assert.strictEqual(curveCount, 1,
        `${name}: 등가속 곡선은 출발 프레임 하나에만 건다 (현재 ${curveCount}곳).`);

    // 클래스 이징은 linear여야 한다.
    const rule = runtimeStyle.match(
        new RegExp(`\\.${name}\\s*\\{[^}]*animation:[^;]*?;`));
    if (rule) {
        assert.ok(/\blinear\b/.test(rule[0]),
            `${name}: 클래스 이징은 linear여야 한다. CSS 이징은 키프레임 구간마다 `
            + '적용되므로 cubic-bezier를 걸면 경유점마다 감속·재가속이 반복된다.');
    }
}

// 램프 이후 등속: ground-charge를 대표로 좌표에서 직접 검산한다.
// (--monster-attack-x 배수가 곧 진행도다.)
{
    const block = runtimeStyle.match(
        /@keyframes monster-motion-ground-charge\s*\{([\s\S]*?)\n\}/)[1];
    const points = [...block.matchAll(
        /(\d+(?:\.\d+)?)%\{transform:translate\(calc\(var\(--monster-attack-x\)\*(\.\d+)\)/g)]
        .map(match => ({ percent: Number(match[1]), progress: Number(match[2]) }));
    const arrival = block.match(
        /(\d+(?:\.\d+)?)%\{transform:translate\(var\(--monster-attack-x\),/);
    assert.ok(points.length >= 2 && arrival, 'ground-charge 이동 좌표를 읽지 못했다');
    points.push({ percent: Number(arrival[1]), progress: 1 });

    const speeds = [];
    for (let i = 1; i < points.length; i += 1) {
        speeds.push((points[i].progress - points[i - 1].progress)
            / (points[i].percent - points[i - 1].percent));
    }
    const spread = Math.max(...speeds) / Math.min(...speeds);
    assert.ok(spread < 1.05,
        `ground-charge: 가속이 끝난 뒤 구간 속도는 일정해야 한다 `
        + `(최대/최소 ${spread.toFixed(3)}, 구간 속도 ${speeds.map(s => s.toFixed(5)).join(', ')}).`);
}

// 문서에 규칙이 남아 있어야 한다. 코드만 고치고 문서가 없으면 다음 몬스터를
// 추가할 때 같은 실수를 반복한다.
const rules = fs.readFileSync(
    path.join(__dirname, '..', 'data', 'hunt', 'approved-monster-motion-rules.md'), 'utf8');
assert.match(rules, /0\.5초 동안만 가속/,
    '돌진 가속 규칙이 공통 모션 규칙 문서에 명시되어 있어야 한다');
assert.ok(rules.includes(ACCEL_CURVE),
    '공통 규칙 문서에 등가속 곡선 값이 적혀 있어야 한다');

console.log(`[test] Hunt charge acceleration contract passed `
    + `(적용 ${RAMPED_CHARGES.length}개 / 미적용 ${PENDING.size}개: ${[...PENDING].join(", ")}).`);
