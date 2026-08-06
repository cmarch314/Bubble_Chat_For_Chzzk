'use strict';

// 분노 주기는 세 값이 모두 있어야 성립한다. 예전에는 rageDurationTicks만 적고
// rageRecoveryDurationTicks를 빠뜨리면 HuntMonsterRules.stateForBattleTime이
// 주기 계산 분기를 통째로 건너뛰어, "지속 900틱"이라고 적어둔 몬스터가 실제로는
// 800틱 이후 영구 분노로 동작했다. 값은 적혀 있는데 아무 효과가 없으니
// 조정해도 화면이 바뀌지 않는, 찾기 어려운 종류의 버그였다.
//
// 런타임은 이제 회복 길이가 없으면 표준값으로 메우지만, 데이터는 명시적으로
// 남겨야 의도가 읽힌다. 그래서 양쪽을 다 검사한다.

const assert = require('node:assert');
const HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');
const HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');

const behaviors = HuntMonsterArchetypeCatalog.MONSTER_BEHAVIORS;

for (const [monsterId, behavior] of Object.entries(behaviors)) {
    const duration = Number(behavior.rageDurationTicks || 0);
    const recovery = Number(behavior.rageRecoveryDurationTicks || 0);
    if (!duration && !recovery) continue;

    assert.ok(duration > 0 && recovery > 0,
        `${monsterId}: 분노 지속과 회복은 함께 저작해야 한다 `
        + `(지속 ${duration || '없음'}, 회복 ${recovery || '없음'}). `
        + '한쪽만 적으면 주기가 무효가 되고 영구 분노로 읽힌다.');

    // 저작한 주기가 실제로 관측되는지 확인한다. 값이 있는데 상태가 한 번도
    // 돌아오지 않으면 위 계약이 어딘가에서 다시 끊긴 것이다.
    const start = Math.max(0, Number(behavior.rageStartTick || 800));
    const states = new Set();
    for (let tick = start; tick <= start + duration + recovery; tick += 10) {
        states.add(HuntMonsterRules.stateForBattleTime(tick, behavior));
    }
    assert.ok(states.has('enraged') && states.has('normal'),
        `${monsterId}: 한 주기 안에 분노와 진정이 모두 관측되어야 한다 `
        + `(관측: ${[...states].join(', ')}).`);
}

// 런타임 방어: 회복을 빠뜨려도 영구 분노로 떨어지지 않는다.
{
    const partial = { rageStartTick: 100, rageDurationTicks: 200 };
    const observed = new Set();
    for (let tick = 100; tick <= 700; tick += 10) {
        observed.add(HuntMonsterRules.stateForBattleTime(tick, partial));
    }
    assert.ok(observed.has('normal'),
        '회복 길이가 없어도 표준값으로 메워 주기가 돌아야 한다 (영구 분노 금지).');
}

// 주기를 아예 저작하지 않은 몬스터는 종전대로 800틱 이후 분노를 유지한다.
assert.strictEqual(HuntMonsterRules.stateForBattleTime(900, {}), 'enraged',
    '주기 미저작 몬스터의 기존 동작은 유지되어야 한다');
assert.strictEqual(HuntMonsterRules.stateForBattleTime(700, {}), 'normal',
    '주기 미저작 몬스터도 800틱 전에는 평상시다');

const cadenced = Object.entries(behaviors)
    .filter(([, behavior]) => Number(behavior.rageDurationTicks || 0) > 0);
console.log(`[test] Hunt rage cadence contract passed (${cadenced.length} monsters authored).`);
