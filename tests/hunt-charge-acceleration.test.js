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

// 돌진 모션 중 이 규칙을 적용한 것들. 한 번에 전부 옮기지 못했으므로,
// 옮긴 모션만 계약으로 고정하고 나머지는 이 목록에 추가하며 따라온다.
const RAMPED_CHARGES = [
    'monster-motion-ground-charge',
    'monster-motion-rathian-ground-charge',
    'monster-motion-nargacuga-flank-charge',
    'monster-motion-ground-charge-zigzag'
];

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

console.log(`[test] Hunt charge acceleration contract passed (${RAMPED_CHARGES.length} charges).`);
