'use strict';

// 몬스터 모션 레이어의 순서와 책임을 고정한다 (재설계안 원칙 1 / 반전 규칙 1).
//
//   placement (.hunt-monster-attack-motion)  translate 전용
//     pose    (.hunt-monster-pose-layer)     rotate/scale 전용
//       aim   (.hunt-monster-aim-layer)      대상을 바라보는 몸 방향
//         facing (.hunt-monster-facing-layer)  scaleX(±1) — 반전은 여기 하나뿐
//           img
//
// 왜 테스트로 지키는가:
//
// 1) 위치와 자세를 같은 요소가 가지면 회전이 위치를 바꾼다. 축과 몸통 중심이
//    184px 떨어져 있으면 180도 회전에서 몸이 지름 368px 호를 그린다 — 이미지가
//    380px이니 몸 전체가 원을 그리며 도는 그림이 된다. 실제로 그렇게 됐다.
//
// 2) 반전이 회전보다 바깥에 있으면 안쪽 회전이 전부 거울상이 된다. 저작한 각도와
//    화면이 어긋나고, 각도를 아무리 고쳐도 안 잡힌다.
//
// 3) 검수 화면(패턴 랩)과 실수렵의 레이어가 다르면 여기서 고친 것이 저기서 안
//    보인다. 이번 세션에서 "적용이 안 된 듯한데 서버를 리셋해야 하나"로 나타났던
//    부류다. 그래서 둘을 대조한다.

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const read = (...parts) => fs.readFileSync(path.join(__dirname, '..', ...parts), 'utf8');

const LAYERS = [
    'hunt-monster-attack-motion',
    'hunt-monster-pose-layer',
    'hunt-monster-aim-layer',
    'hunt-monster-facing-layer'
];

// ---- 레이어 순서: 생성하는 모든 곳에서 같아야 한다 ----

// 각 소스에서 레이어 클래스가 나타나는 순서를 뽑는다. 중첩 자체는 마크업 균형
// 테스트(hunt-markup-balance)가 보고, 여기서는 순서만 본다.
function layerOrder(source) {
    return [...source.matchAll(/class="([^"]*hunt-monster-(?:attack-motion|pose-layer|aim-layer|facing-layer)[^"]*)"/g)]
        .map(match => LAYERS.find(layer => match[1].split(/\s+/).includes(layer)))
        .filter(Boolean);
}

const sources = {
    'HuntRenderer.js': read('js', 'effects', 'hunt', 'HuntRenderer.js'),
    'hunt-monster-pattern-lab.html': read('tests', 'fixtures', 'hunt-monster-pattern-lab.html'),
    'hunt-rathalos-preview.html': read('tests', 'fixtures', 'hunt-rathalos-preview.html'),
    'hunt-rathian-preview.html': read('tests', 'fixtures', 'hunt-rathian-preview.html'),
    'hunt-world-flying-wyverns-preview.html': read('tests', 'fixtures', 'hunt-world-flying-wyverns-preview.html')
};

for (const [name, source] of Object.entries(sources)) {
    const order = layerOrder(source);
    assert.ok(order.length >= LAYERS.length, `${name}에서 레이어를 찾지 못했다 (${order.length}개)`);

    // 작은 몬스터 무리는 placement + facing만 쓴다(자세 레이어 없음). 그 축약형은
    // 허용하되, 네 레이어가 다 나오는 구간은 반드시 규정 순서여야 한다.
    const full = order.slice(order.indexOf('hunt-monster-pose-layer') - 1);
    assert.deepStrictEqual(full.slice(0, 4), LAYERS,
        `${name}의 레이어 순서가 규정과 다르다: ${full.slice(0, 4).join(' > ')}`);
}

// ---- 반전은 facing 레이어 바깥에 있으면 안 된다 ----

const css = read('styles', 'hunt-runtime.css');

// 몬스터 레이어를 대상으로 scaleX를 거는 규칙을 찾는다. facing 레이어와 그
// 자식(이미지)은 허용 — 그 아래에는 회전하는 것이 없다.
const scaleXOffenders = [];
for (const match of css.matchAll(/([^{}]+)\{([^{}]*scaleX\([^{}]*)\}/g)) {
    const selector = match[1].trim();
    if (!/hunt-monster-(attack-motion|pose-layer|aim-layer)/.test(selector)) continue;
    if (/hunt-monster-facing-layer|game-hunt-monster-img/.test(selector)) continue;
    scaleXOffenders.push(selector.replace(/\s+/g, ' ').slice(0, 90));
}
assert.deepStrictEqual(scaleXOffenders, [],
    `반전(scaleX)은 facing 레이어와 그 안쪽에만 건다. 바깥에 걸면 안쪽 회전이 전부 거울상이 된다:\n  ${scaleXOffenders.join('\n  ')}`);

// ---- 자세 레이어는 이동하지 않는다 ----

const poseRule = css.match(/\.hunt-monster-pose-layer\s*\{([^}]*)\}/);
assert.ok(poseRule, '자세 레이어 규칙이 없다');
assert.ok(/transform:\s*rotate\([^;]*scale\(/.test(poseRule[1]),
    '자세 레이어는 rotate와 scale을 가져야 한다');
assert.ok(!/translate/.test(poseRule[1]),
    '자세 레이어는 이동하지 않는다. 이동은 placement가 갖는다.');

// 기본값이 항등이어야 옛 경로(키프레임을 직접 쓰는 모션)가 영향을 받지 않는다.
assert.match(poseRule[1], /--pose-rotate,\s*0deg/, '회전 기본값이 0이어야 한다');
assert.match(poseRule[1], /--pose-scale-x,\s*1/, '가로 배율 기본값이 1이어야 한다');
assert.match(poseRule[1], /--pose-scale-y,\s*1/, '세로 배율 기본값이 1이어야 한다');

// ---- 자세 분해: 비율과 원근이 왕복해야 한다 ----

const Animator = require('../js/effects/hunt/HuntMonsterAttackAnimator.js');

for (const [squash, depth] of [[1, 1], [1.294, 1], [0.744, 1.18], [1.430, .82], [1, 1.62]]) {
    const scale = Animator.poseScale(squash, depth);
    assert.ok(Math.abs(scale.x / scale.y - squash) < 1e-9,
        `비율이 왕복하지 않는다 (squash=${squash}, depth=${depth})`);
    assert.ok(Math.abs(Math.sqrt(scale.x * scale.y) - depth) < 1e-9,
        `원근이 왕복하지 않는다 (squash=${squash}, depth=${depth})`);
}

// 잘못된 값이 NaN으로 흘러 scale()을 통째로 무효화하지 않게 한다. CSS는 오류를
// 내지 않으므로, 무효화되면 "아무 일도 안 일어남"으로만 보인다.
for (const bad of [0, -1, NaN, null, undefined, 'x']) {
    const scale = Animator.poseScale(bad, bad);
    assert.ok(Number.isFinite(scale.x) && Number.isFinite(scale.y),
        `잘못된 자세 값(${String(bad)})이 NaN을 만들면 안 된다`);
}

console.log(`[test] 몬스터 모션 레이어 계약 통과 (${Object.keys(sources).length}개 마크업 대조).`);
