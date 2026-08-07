'use strict';

// 모션별 회전축이 rig 기본 축에 밀리던 사고를 고정한다.
//
// hunt-runtime.css에는 골격별 기본 축이 있다.
//   .hunt-monster-attack-motion[data-monster-rig="winged"] { transform-origin:50% 54%; }
// 이 선택자는 클래스 1 + 속성 1 = 특이도 (0,2,0)이다. 반면 모션별 축은
//   .monster-motion-나르가-회전 { transform-origin:20% 88%; }
// 처럼 클래스 하나뿐이라 (0,1,0)이고, 항상 rig 기본에 진다.
//
// 그래서 축을 아무리 고쳐도 화면에서는 늘 이미지 중앙 근처를 축으로 돌았다.
// 회전축이 어긋나면 회전뿐 아니라 신축 방향과 최종 위치까지 전부 틀어져,
// 내려찍기가 화면 밖으로 내려가는 것처럼 원인과 동떨어진 증상으로 나타난다.
//
// 클래스를 두 번 겹쳐 쓰면 매칭 대상은 그대로 두고 특이도만 (0,2,0)으로 올릴 수
// 있다. rig 규칙보다 뒤에 오므로 동률에서 이긴다.

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(
    path.join(__dirname, '..', 'styles', 'hunt-runtime.css'), 'utf8');

const rigRulePosition = css.search(/\.hunt-monster-attack-motion\[data-monster-rig=/);
assert.ok(rigRulePosition > 0, 'rig 기본 축 규칙을 찾지 못했다');

// transform-origin을 선언하는 모션 규칙을 모두 찾는다.
const blocks = [...css.matchAll(/^((?:\.[\w.-]+,\s*\n)*\.[\w.-]+)\s*\{([^}]*)\}/gm)]
    .filter(match => /transform-origin/.test(match[2]))
    .filter(match => /\.monster-motion-/.test(match[1]));

assert.ok(blocks.length >= 15,
    `모션 축 규칙이 너무 적게 잡혔다 (${blocks.length}). 정규식이 형식 변화를 놓쳤을 수 있다.`);

const offenders = [];
for (const block of blocks) {
    const position = css.indexOf(block[0]);
    for (const selector of block[1].split(',').map(value => value.trim()).filter(Boolean)) {
        if (!selector.startsWith('.monster-motion-')) continue;
        const classCount = (selector.match(/\./g) || []).length;
        const hasAttribute = selector.includes('[');
        const specificityOk = classCount >= 2 || hasAttribute;
        if (!specificityOk || position < rigRulePosition) {
            offenders.push(`${selector} (클래스 ${classCount}개${position < rigRulePosition ? ', rig 규칙보다 앞' : ''})`);
        }
    }
}

assert.deepStrictEqual(offenders, [],
    '다음 모션 축 규칙이 rig 기본 축(.hunt-monster-attack-motion[data-monster-rig])에 밀린다. '
    + '클래스를 두 번 겹쳐 써서 특이도를 (0,2,0)으로 올려야 한다:\n  '
    + offenders.join('\n  '));

console.log(`[test] Hunt motion pivot specificity contract passed (${blocks.length} rules).`);
