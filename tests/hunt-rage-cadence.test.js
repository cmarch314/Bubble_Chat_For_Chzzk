'use strict';

// 분노는 언제나 주기다. 영구 분노인 몬스터는 존재하지 않으며, 지속은 두 값만 쓴다:
// 표준 1분 30초(900틱), 짧은 쪽 1분(600틱). 진정은 30초(300틱)다.
//
// 예전에는 두 가지 경로로 영구 분노가 새어 나왔다.
//   1. rageDurationTicks만 적고 rageRecoveryDurationTicks를 빠뜨리면
//      주기 계산 분기를 통째로 건너뛰었다. legiana(900), shrieking_legiana(1100),
//      seething_bazelgeuse(1200), tigrex(900)이 여기 걸려, 적어둔 값이 아무
//      효과 없이 800틱 이후 영원히 분노 상태였다.
//   2. 주기를 아예 저작하지 않은 몬스터(paolumu, barioth, 아종 다수, 그리고
//      MONSTER_BEHAVIORS에 없는 모든 몬스터)는 애초에 영구 분노가 기본값이었다.
//
// 이제 런타임이 비어 있는 저작을 표준 주기로 메우므로 두 경로 모두 막혔다.
// 이 테스트는 그 불변식과 "지속은 900 아니면 600" 규칙을 함께 지킨다.

const assert = require('node:assert');
const HuntMonsterRules = require('../js/effects/hunt/HuntMonsterRules.js');
const HuntMonsterArchetypeCatalog = require('../js/effects/hunt/HuntMonsterArchetypeCatalog.js');

const behaviors = HuntMonsterArchetypeCatalog.MONSTER_BEHAVIORS;
const ALLOWED_DURATIONS = [
    HuntMonsterRules.DEFAULT_RAGE_DURATION_TICKS,
    HuntMonsterRules.SHORT_RAGE_DURATION_TICKS
];

assert.strictEqual(HuntMonsterRules.DEFAULT_RAGE_DURATION_TICKS, 900,
    '표준 분노 지속은 1분 30초다');
assert.strictEqual(HuntMonsterRules.SHORT_RAGE_DURATION_TICKS, 600,
    '짧은 분노 지속은 1분이다');

// 저작된 값은 허용된 두 가지 중 하나여야 한다. 1100, 1200 같은 중간값이 다시
// 들어오면 "짧은 편/보통" 구분이 흐려진다.
for (const [monsterId, behavior] of Object.entries(behaviors)) {
    const duration = Number(behavior.rageDurationTicks || 0);
    if (!duration) continue;
    assert.ok(ALLOWED_DURATIONS.includes(duration),
        `${monsterId}: 분노 지속은 ${ALLOWED_DURATIONS.join(' 또는 ')}틱만 쓴다 (현재 ${duration}).`);
}

// 영구 분노는 어떤 경로로도 나오면 안 된다. 등록된 몬스터 전부와, 저작이
// 아예 없는 경우({})까지 한 주기를 돌려 진정 구간이 실제로 관측되는지 본다.
const cases = [...Object.entries(behaviors), ['(저작 없음)', {}]];
for (const [monsterId, behavior] of cases) {
    const duration = Number(behavior.rageDurationTicks || 0)
        || HuntMonsterRules.DEFAULT_RAGE_DURATION_TICKS;
    const recovery = Number(behavior.rageRecoveryDurationTicks || 0)
        || HuntMonsterRules.DEFAULT_RAGE_RECOVERY_TICKS;
    const start = Math.max(0, Number(behavior.rageStartTick || 800));

    const states = new Set();
    for (let tick = start; tick <= start + duration + recovery; tick += 10) {
        states.add(HuntMonsterRules.stateForBattleTime(tick, behavior));
    }
    assert.ok(states.has('enraged'),
        `${monsterId}: 한 주기 안에 분노 구간이 있어야 한다.`);
    assert.ok(states.has('normal'),
        `${monsterId}: 한 주기 안에 진정 구간이 있어야 한다 (영구 분노 금지).`);

    // 상태는 분노/평상시 둘뿐이다. 탈진은 스태미나가 만드는 것이지 분노 시계가
    // 합성해내는 것이 아니다.
    states.forEach(state => assert.ok(['normal', 'enraged'].includes(state),
        `${monsterId}: 분노 시계가 만들 수 있는 상태는 normal/enraged뿐이다 (${state}).`));
}

// 분노 시작 전에는 평상시다.
assert.strictEqual(HuntMonsterRules.stateForBattleTime(700, {}), 'normal',
    '800틱 전에는 평상시여야 한다');
assert.strictEqual(HuntMonsterRules.stateForBattleTime(900, {}), 'enraged',
    '800틱 이후 첫 주기는 분노여야 한다');

const short = Object.entries(behaviors).filter(([, behavior]) =>
    Number(behavior.rageDurationTicks || 0) === HuntMonsterRules.SHORT_RAGE_DURATION_TICKS);
console.log(`[test] Hunt rage cadence contract passed `
    + `(${cases.length - 1} monsters, ${short.length} short-rage, 영구 분노 없음).`);
