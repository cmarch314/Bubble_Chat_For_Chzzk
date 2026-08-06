'use strict';

// 닫히지 않은 <div> 하나가 OBS 레이아웃 전체를 무너뜨린 적이 있다.
// innerHTML 파서는 오류를 내지 않고 뒤따르는 형제 노드를 전부 그 안으로
// 밀어넣는다. 겨냥 레이어(.hunt-monster-aim-layer)를 추가하면서 여는 태그만
// 넣었더니, 헌터 4명 카드가 380px 짜리 .hunt-monster-attack-motion(display:flex)
// 안으로 들어가 몬스터 오른쪽에 짓눌려 배치되고 수렵 틀 높이가 접혔다.
// 유닛테스트 fixture는 별도 HTML이라 정상으로 보여 발견이 늦었다.
//
// 여는/닫는 태그 총량 비교는 조건부 분기가 섞인 템플릿 리터럴에도 안전하고,
// 실제로 그 회귀를 잡아낸다(수정 전 137/136).

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

// 스스로 닫는 태그가 아닌, 짝이 반드시 맞아야 하는 컨테이너 태그.
const PAIRED_TAGS = ['div', 'section', 'span', 'b', 'i'];

const TARGETS = [
    'js/effects/hunt/HuntRenderer.js',
    'tests/fixtures/hunt-monster-pattern-lab.html'
];

for (const relative of TARGETS) {
    const absolute = path.join(ROOT, relative);
    if (!fs.existsSync(absolute)) continue;
    const source = fs.readFileSync(absolute, 'utf8');

    for (const tag of PAIRED_TAGS) {
        const open = (source.match(new RegExp(`<${tag}\\b`, 'g')) || []).length;
        const close = (source.match(new RegExp(`</${tag}>`, 'g')) || []).length;
        assert.strictEqual(open, close,
            `${relative}: <${tag}> ${open}개 / </${tag}> ${close}개. `
            + '짝이 맞지 않으면 innerHTML 파서가 뒤따르는 형제를 전부 그 안으로 중첩시켜 '
            + '레이아웃이 통째로 무너진다.');
    }
}

// 겨냥 레이어는 모션 요소와 방향 레이어 사이에 정확히 한 겹으로 들어가야 한다.
// travel > aim > facing > image 순서가 깨지면 겨냥 회전이 공격 회전과 합성되어
// 비균등 scale과 만나 이미지가 옆으로 늘어난다(전단).
const renderer = fs.readFileSync(path.join(ROOT, 'js/effects/hunt/HuntRenderer.js'), 'utf8');
const nested = /hunt-monster-aim-layer[\s\S]{0,200}?hunt-monster-facing-layer/.test(renderer);
assert.ok(nested, '겨냥 레이어가 방향 레이어를 감싸야 한다 (travel > aim > facing > image).');

console.log('[test] Hunt markup tag-balance and aim-layer nesting contract passed.');
