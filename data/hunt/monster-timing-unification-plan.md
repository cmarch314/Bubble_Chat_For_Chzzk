# 몬스터 애니메이션 × 틱 타이밍 통합 관리 계획

> 상태: **계획 단계 (미구현)**
> 작성 근거: 2026-08-04 리오레이아 애니메이션/사운드 정밀 점검
> 이 문서는 구현자가 **추가 설계 판단 없이** 그대로 따라 작업할 수 있도록 작성한다.
> 수식·상수·파일 경로·함수 시그니처·테스트 이름은 전부 확정값이다. 임의로 바꾸지 않는다.

---

## 0. 이 문서를 읽는 구현자에게

**절대 규칙 3가지. 이걸 어기면 과거의 롤백이 반복된다.**

1. **틱 간격(100ms)은 절대 바꾸지 않는다.** 몬스터를 빠르게 만드는 것은 "틱을 빨리 돌리는 것"이 아니라 "행동이 점유하는 틱 수를 줄이는 것"이다. 틱 간격을 건드리면 헌터 ATB·아이템·BGM까지 전부 어긋난다.
2. **배속은 단 한 곳에서, 단 한 번 계산하고, 얼려서(freeze) 전달한다.** 소비자가 각자 다시 계산하면 반드시 어긋난다.
3. **파생값을 다시 스케일하지 않는다.** 항상 원본 정수(authored base)에 배율을 곱하고 **한 번만** 반올림한다.

작업은 **Phase 0 → 5 순서대로**만 진행한다. 각 Phase는 독립 커밋이며 단독으로 되돌릴 수 있어야 한다. 여러 Phase를 한 커밋에 섞지 않는다.

---

## 1. 문제 정의 (측정된 사실)

### 1.1 현재 구조

| 항목 | 현재 값/위치 | 비고 |
|---|---|---|
| 틱 루프 주기 | `js/effects/HuntEffect.js:1150`, `:1398` — `this.timers.interval(fn, 100)` | **하드코딩 100ms, 2곳** |
| 틱 상수 | `js/effects/hunt/HuntAtbConfig.js:8` — `TICKS_PER_SECOND = 10` | 100ms와 일치 |
| 시각 배율 | `HuntAtbConfig.js:9` — `VISUAL_DURATION_SCALE = 1.25` | **문제의 근원** |
| 배율 적용 | `HuntAtbConfig.js:98-100` — `scaleVisualDurationMs()` | |
| 배율 호출 | `HuntMonsterAnimationCatalog.js:158-163` — `profile()` | 모든 애니메이션에 일괄 적용 |
| 게임플레이 시간 | `pattern.movement.ticks` | 실제 행동 점유 시간 |
| 애니메이션 시간 | `pattern.animationDurationMs` | **독립적으로 저작됨** |
| CSS 적용 | `HuntMonsterAttackAnimator.js:599`, `:1041`, `:1279`, `:1302` — `--monster-motion-duration` | |
| 방향 레이어 | `HuntMonsterAttackAnimator.js:357` — `layer.animate(kf, {duration: profile.duration})` | |
| 감시 타이머 | `HuntMonsterAttackAnimator.js:496` — `timeout(finish, duration + 160)` | |
| 강제 정리 | `HuntMonsterAttackAnimator.js:417-440` — `clearActiveMonsterMotion()` | `transform` 제거 → 즉시 스냅 |

### 1.2 결함 A — 애니메이션이 게임플레이보다 25% 길다

`animationDurationMs`는 이미 틱 예산에 맞춰 저작됐는데 `VISUAL_DURATION_SCALE=1.25`가 **한 번 더** 곱해진다(이중 적용).

리오레이아 실측:

| 패턴 | movement.ticks | 이동 시간 | 실제 표시 | 초과 |
|---|---|---|---|---|
| `rathian.bite` | 20 | 2000ms | 3000ms | +1000 |
| `rathian.tail_sweep` | 42 | 4200ms | 5250ms | +1050 |
| `rathian.triple_fireball` | 28 | 2800ms | 3500ms | +700 |
| `rathian.fireball_fizzle` | 18 | 1800ms | 2250ms | +450 |
| `rathian.charge` | 24 | 2400ms | 3750ms | +1350 |
| `rathian.triple_charge` | 113 | 11300ms | 11250ms | -50 (유일 정상) |
| `rathian.somersault` | 25 | 2500ms | 4000ms | +1500 |
| `rathian.double_somersault` | 50 | 5000ms | 8000ms | **+3000** |
| `rathian.bite_somersault` | 55 | 5500ms | 8250ms | +2750 |
| `rathian.somersault_glide` | 78 | 7800ms | 9750ms | +1950 |
| `rathian.glide` | 40 | 4000ms | 6000ms | +2000 |

11개 중 10개 불일치.

**파생 증상 1 — "패턴 끝나고 제자리로 순간이동":**
게임플레이는 `movement.ticks`에서 끝나지만 CSS 애니메이션은 아직 재생 중이다. 다음 행동이 시작되면 `startMonsterMotion`(`:443`)이 `clearActiveMonsterMotion(null,'replaced')`를 호출하고, 이것이 `:426`에서 `style.removeProperty('transform')`를 실행한다. 공중/화면 밖에 있던 몬스터가 **그 프레임에 즉시 홈으로 스냅**한다.

**파생 증상 2 — "매우 느리다":**
모든 동작이 25% 늘어져 재생된다.

### 1.3 결함 B — 타격 시점이 이동 창을 벗어남

전수조사 결과 3건:

```
rathian.double_somersault       impact#1 atTicks=53 > movement.ticks=50  (초과 3)
pink_rathian.double_somersault  impact#1 atTicks=53 > movement.ticks=50  (초과 3)
gold_rathian.double_somersault  impact#1 atTicks=53 > movement.ticks=50  (초과 3)
```

두 번째 타격이 이동 창이 끝난 뒤에 예약되어 있다. 현재는 25% 늘어난 애니메이션이 이 초과분을 우연히 가려주고 있어서 드러나지 않았다. **결함 A를 고치면 이 버그가 즉시 표면화된다.** 반드시 Phase 2에서 함께 고친다.

### 1.4 결함 C — CSS 키프레임 %와 `atTicks`가 서로 모른다

`@keyframes`의 접촉 프레임 퍼센트와 `impactTimeline[].atTicks`가 **독립적으로 저작**된다. 정합을 강제하는 장치가 없어, 화면상 타격 순간과 실제 판정/사운드 순간이 어긋난다.

### 1.5 결함 D — 배속 개념이 존재하지 않음

- `inheritVariant(baseId, variantId, title, damageRate)` (`HuntMonsterProfiles.js`)의 배수는 **damageRatio 전용**이다. 속도와 무관하다.
- 분노(`engine.monsterState === 'enraged'`)는 패턴 선택에만 영향을 주고 속도에는 영향이 없다.
- 밸런싱용 전역 속도 노브가 없다.

---

## 2. 설계 목표와 불변식

### 2.1 목표

1. 애니메이션 길이와 행동 점유 틱이 **정의상 동일**하다. 어긋날 수 없는 구조로 만든다.
2. 분노/아종/밸런싱 배속을 **오차 없이** 적용한다.
3. 새 몬스터 추가 시 타이밍 관련 코드 수정이 **0줄**이다.

### 2.2 불변식 (테스트로 강제)

| ID | 불변식 | 강제 테스트 |
|---|---|---|
| **INV-1** | `plan.durationMs === plan.activeTicks × 100` | `hunt-timing-tick-animation-parity` |
| **INV-2** | 모든 `impact.atTicks`는 `1 ≤ atTicks ≤ activeTicks` | `hunt-timing-tick-animation-parity` |
| **INV-3** | `impacts[i].atTicks > impacts[i-1].atTicks` (강한 단조증가) | `hunt-timing-monotonic-impacts` |
| **INV-4** | 임의의 `timeScale`에서 `impacts[i].offset`이 기준 대비 ±3% 이내 | `hunt-timing-scale-invariance` |
| **INV-5** | `TimingPlan`은 깊게 동결되어 있다 | `hunt-action-timing-resolver` |
| **INV-6** | 행동 진행 중 `TimingPlan`은 재계산되지 않는다 | `hunt-timing-plan-stability` |
| **INV-7** | CSS 접촉 키프레임 % ≈ `atTicks/activeTicks×100` (±3%p) | `hunt-timing-keyframe-contract` |

---

## 3. 핵심 설계

### 3.1 한 줄 요약

> **틱이 유일한 화폐다. 틱 간격은 상수다. 배속은 "행동이 점유하는 틱 수"를 바꾸고, 애니메이션 길이는 그 틱 수에서 파생된다.**

이 구조가 오차를 **구조적으로** 제거하는 이유:

- 애니메이션 길이 = `activeTicks × 100ms` (정수 × 정수 = 정수). 부동소수 누적 없음.
- 배속은 `activeTicks`와 `atTicks`에 **같은 배율**로 곱해지므로 **비율이 보존**된다.
- 비율이 보존되므로 **정적 CSS 키프레임 퍼센트가 모든 배속에서 그대로 유효하다.** → CSS를 배속마다 다시 만들 필요가 없다. 이것이 이 설계의 핵심이다.

### 3.2 신규 모듈

**파일: `js/effects/hunt/HuntActionTimingResolver.js`** (신규)

기존 모듈 규약을 따른다 (UMD, `HuntRuntimeLoader.js`에서 `HuntMonsterTurnExecutor`보다 **먼저** 로드).

```js
'use strict';

// 몬스터 행동의 틱 예산과 애니메이션 길이를 계산하는 유일한 지점.
// 다른 어떤 모듈도 틱→ms 변환이나 배속 곱셈을 직접 수행하지 않는다.

class HuntActionTimingResolver {
    /** 틱 간격(ms). HuntEffect의 interval(100)과 반드시 일치. 변경 금지. */
    static get TICK_MS() { return 100; }

    /** 애니메이션 종료 감시 타이머 여유분(ms). */
    static get WATCHDOG_GRACE_MS() { return 160; }

    /** activeTicks 최소값. 이보다 작으면 반올림 오차가 눈에 보인다. */
    static get MIN_ACTIVE_TICKS() { return 10; }

    /** 합성 배율 허용 범위. 벗어나면 클램프하고 경고를 남긴다. */
    static get MIN_TIME_SCALE() { return 0.5; }
    static get MAX_TIME_SCALE() { return 2.0; }

    /** 몬스터 상태별 기본 배속. 작을수록 빠르다. */
    static get STATE_TIME_SCALE() {
        return Object.freeze({
            normal: 1.00,
            enraged: 0.85,   // 분노 15% 빠름
            exhausted: 1.18, // 탈진 18% 느림
            // 아래는 속도 개념이 없는 상태. 1.00 고정.
            knocked_down: 1.00,
            stunned: 1.00,
            valstrax_charging: 1.00,
            valstrax_flying: 1.00
        });
    }

    /**
     * 배율 스택을 합성한다. 곱셈이므로 순서는 결과에 영향이 없으나,
     * 로그·테스트 재현성을 위해 아래 순서를 고정한다.
     */
    static composeTimeScale(context = {}) { /* §3.4 */ }

    /**
     * @param {object} pattern  HUNT_MONSTER_PATTERN_OVERRIDES의 패턴
     * @param {object} context  { monster, monsterState, balanceScale, difficultyScale }
     * @returns {TimingPlan}    깊게 동결된 계획
     */
    static resolve(pattern, context = {}) { /* §3.5 */ }

    /** 정수 틱 반올림. 최소 1틱 보장. */
    static roundTicks(value) {
        return Math.max(1, Math.round(Number(value) || 0));
    }
}
```

### 3.3 `TimingPlan` 스키마 (반환 타입)

```js
{
  version: 1,
  patternId: 'rathian.double_somersault',

  tickMs: 100,                 // = TICK_MS. 소비자는 이 값만 신뢰한다.
  timeScale: 0.85,             // 합성 배율 (소수 4자리 반올림, 로그/테스트용)

  windupTicks:   7,            // 전조(준비)
  activeTicks:  43,            // 본 동작 = 애니메이션 재생 구간
  recoveryTicks: 1,            // 후딜
  totalTicks:   51,            // windup + active + recovery

  windupMs:    700,            // windupTicks × tickMs
  durationMs: 4300,            // activeTicks × tickMs  ← 애니메이션 길이 (INV-1)
  recoveryMs:  100,

  impacts: [                   // activeTicks 기준 (0 = 동작 시작)
    { index: 0, atTicks: 19, atMs: 1900, offset: 0.4419, audioCue: 'somersault', final: false },
    { index: 1, atTicks: 41, atMs: 4100, offset: 0.9535, audioCue: 'somersault', final: true }
  ],

  scaleBreakdown: {            // 디버깅/검수 도구 표시용
    species: 1.00, variant: 1.00, state: 0.85,
    pattern: 1.00, balance: 1.00, difficulty: 1.00,
    composed: 0.85, clamped: false
  }
}
```

전체를 `Object.freeze`한다. `impacts` 배열과 각 원소, `scaleBreakdown`도 개별적으로 freeze한다 (INV-5).

### 3.4 배율 스택 (`composeTimeScale`)

**값이 클수록 느리다.** 모두 기본값 `1.0`이며, 미지정 시 1.0으로 취급한다.

| 순서 | 이름 | 출처 | 기본 | 예시 |
|---|---|---|---|---|
| 1 | `species` | `monster.agility` (`HuntMonsterProfiles`) | 1.00 | 티가렉스 0.94 |
| 2 | `variant` | `monster.variantAgility` (아종) | 1.00 | 금화룡 0.92 |
| 3 | `state` | `STATE_TIME_SCALE[monsterState]` | 1.00 | 분노 0.85 |
| 4 | `pattern` | `pattern.timeScale` (패턴 개별 예외) | 1.00 | 특정 대기술 1.10 |
| 5 | `balance` | `context.balanceScale` (전역 밸런싱 노브) | 1.00 | **"5% 느리게" = 1.05** |
| 6 | `difficulty` | `context.difficultyScale` (퀘스트 랭크) | 1.00 | 마스터랭크 0.96 |

```js
static composeTimeScale(context = {}) {
    const monster = context.monster || {};
    const factors = {
        species:    Number(monster.agility) || 1,
        variant:    Number(monster.variantAgility) || 1,
        state:      this.STATE_TIME_SCALE[String(context.monsterState || 'normal')] ?? 1,
        pattern:    Number(context.patternTimeScale) || 1,
        balance:    Number(context.balanceScale) || 1,
        difficulty: Number(context.difficultyScale) || 1
    };
    const raw = factors.species * factors.variant * factors.state
              * factors.pattern * factors.balance * factors.difficulty;
    const clamped = Math.min(this.MAX_TIME_SCALE, Math.max(this.MIN_TIME_SCALE, raw));
    return {
        ...factors,
        composed: Number(clamped.toFixed(4)),
        clamped: clamped !== raw
    };
}
```

> **주의:** 아종 배율을 `inheritVariant`의 4번째 인자(`damageRate`)에 섞지 말 것. 그것은 데미지 전용이다. 아종 속도는 `variantAgility`라는 **별도 필드**로 추가한다.

### 3.5 `resolve()` 알고리즘 — 드리프트 제로 절차

**순서를 바꾸지 말 것. 각 단계는 이전 단계의 반올림 결과가 아니라 원본 정수에서 계산한다.**

```
[1] baseWindup   = pattern.windup        ?? 0
    baseActive   = pattern.movement.ticks ?? Math.round(pattern.animationDurationMs / TICK_MS) ?? 10
    baseRecovery = pattern.recovery      ?? 0
    baseImpacts  = pattern.impactTimeline ?? [{ atTicks: Math.round(baseActive * 0.6) }]

[2] scale = composeTimeScale(context).composed

[3] windupTicks   = baseWindup   > 0 ? roundTicks(baseWindup   * scale) : 0
    activeTicks   =                     roundTicks(baseActive   * scale)
    recoveryTicks = baseRecovery > 0 ? roundTicks(baseRecovery * scale) : 0
    // ※ 원본이 0이면 0을 유지한다. roundTicks의 최소 1틱을 적용하지 않는다.

[4] activeTicks = Math.max(MIN_ACTIVE_TICKS, activeTicks)
    // MIN_ACTIVE_TICKS 미만이면 반올림 오차가 3%를 넘는다.

[5] 각 impact i에 대해:
        at = roundTicks(baseImpacts[i].atTicks * scale)     // 원본×배율, 한 번만 반올림
        at = Math.min(at, activeTicks)                       // INV-2 상한
        at = Math.max(at, previousAt + 1)                    // INV-3 단조증가
        at = Math.min(at, activeTicks)                       // 재클램프
        previousAt = at
    // 마지막 impact의 at이 activeTicks를 넘으면 데이터 오류다.
    // 개발 빌드에서 console.warn을 남기고, 테스트에서는 실패시킨다.

[6] durationMs = activeTicks * TICK_MS      // 정수 곱. 부동소수 금지.
    windupMs   = windupTicks   * TICK_MS
    recoveryMs = recoveryTicks * TICK_MS
    각 impact: atMs  = at * TICK_MS
               offset = at / activeTicks     // 0..1, CSS/WAAPI 오프셋용

[7] deepFreeze(plan) 후 반환
```

**반올림 규칙 요약 (이것만 지키면 드리프트가 없다):**

- 곱셈은 **항상 원본 정수 × 배율**. `이미 반올림된 값 × 배율` 금지.
- 반올림은 각 값마다 **정확히 한 번**.
- ms 변환은 **반올림된 정수 틱 × 100**. 절대 float ms를 반올림하지 않는다.

### 3.6 비율 보존 증명 (INV-4의 근거)

기준 비율 `r = baseAt / baseActive`. 배속 후 비율 `r' = round(baseAt·s) / round(baseActive·s)`.

반올림 오차는 각각 최대 0.5틱이므로:

```
|r' - r| ≤ 0.5/activeTicks + 0.5·r/activeTicks = 0.5(1+r)/activeTicks
```

`r ≤ 1`이므로 최악의 경우 `|r' - r| ≤ 1/activeTicks`.

`MIN_ACTIVE_TICKS = 10`이면 최대 편차 **10%**, 실전값 `activeTicks ≥ 34`(§7 표 참조)이면 **3% 이내**.
따라서 **INV-4의 허용 오차는 ±3%로 하고, `activeTicks ≥ 34`를 권장 하한으로 문서화한다.**
`activeTicks`가 10~33인 패턴은 테스트에서 경고(warn)만 낸다.

---

## 4. 소비자 개조 명세 (파일별)

> 아래 목록이 **전부**다. 이 외의 곳에서 틱→ms 변환이나 `VISUAL_DURATION_SCALE`을 사용하면 안 된다.
> 작업 전 `grep -rn "scaleVisualDurationMs\|VISUAL_DURATION_SCALE\|animationDurationMs" js/`로 잔존 호출을 확인한다.

### 4.1 `js/effects/hunt/HuntMonsterTurnExecutor.js`

**`prepare()` (~798행 `engine.pendingMonsterAction = {...}` 부근)**

```js
// 추가: 계획을 여기서 딱 한 번 계산한다.
const timing = HuntActionTimingResolver.resolve(pattern, {
    monster: engine.selectedMonster,
    monsterState: engine.monsterState,
    patternTimeScale: pattern.timeScale,
    balanceScale: engine.balanceTimeScale,        // §6.3에서 추가
    difficultyScale: engine.difficultyTimeScale   // §6.3에서 추가
});

engine.pendingMonsterAction = {
    pattern,
    timing,                              // ← 추가. 이후 모든 소비자가 이걸 읽는다.
    remainingTicks: timing.windupTicks,  // ← 변경 (기존: windupTicks 지역변수)
    totalTicks:     timing.windupTicks,  // ← 변경
    attackerIndex: attacker?.index ?? null,
    targetIndex, actionCost, timing: undefined // 주의: 기존 `timing` 지역변수와 이름 충돌
};
```

> ⚠ **이름 충돌 주의:** `pendingMonsterAction`에 이미 `timing` 키가 존재한다(`:805`). 신규 필드명은 **`timingPlan`**으로 한다. 위 예시의 `timing`을 전부 `timingPlan`으로 읽을 것.

**telegraph 오디오 (`:813-819`)**

```js
durationTicks: timingPlan.windupTicks   // 기존: windupTicks
```

### 4.2 `js/effects/hunt/HuntBattleTickExecutor.js`

impact 스케줄 비교 로직이 `pattern.impactTimeline[].atTicks`를 읽는 부분을 **전부** `pendingImpact.timingPlan.impacts[].atTicks`로 교체한다.

`:260-266`의 런타임 필드 주입에 아래를 추가한다:

```js
runtimeTimingPlan: pendingImpact.timingPlan,   // 애니메이터가 읽는다
```

`runtimeImpactTimelineFinal`은 `timingPlan.impacts[i].final`에서 가져온다.

### 4.3 `js/effects/hunt/HuntMonsterAnimationCatalog.js`

**`profile()` (`:158-163`)** — 배율 적용 제거:

```js
static profile(id, ultimate, duration, aim, rig = this.resolveRig(), delivery = null) {
    // 길이는 더 이상 여기서 정하지 않는다. HuntActionTimingResolver가 유일한 출처다.
    // duration은 TimingPlan이 없는 경로(프리뷰/폴백)를 위한 참고값으로만 남긴다.
    return Object.freeze({ id, ultimate: Boolean(ultimate), duration, aim, rig, delivery });
}
```

- `HuntMonsterAnimationTiming` import(`:1-3`) 제거.
- `authoredDurations` 테이블(`:29-71`)은 **Phase 3까지 유지**하고 폴백 전용으로 남긴다. Phase 3에서 제거.

### 4.4 `js/effects/hunt/HuntMonsterAttackAnimator.js`

`playPatternMotion(monsterImg, targetCard, pattern, attackName, type)` 시그니처에 계획을 전달해야 한다. 시그니처 변경 대신 **`pattern.runtimeTimingPlan`을 읽는다** (기존 `runtime*` 필드 관례와 일치, 호출부 수정 최소화).

```js
// playPatternMotion 상단에 추가
const timingPlan = pattern?.runtimeTimingPlan || null;
const motionDurationMs = timingPlan
    ? timingPlan.durationMs
    : profile.duration;   // 프리뷰/폴백 경로
```

교체 지점:

| 행 | 기존 | 변경 |
|---|---|---|
| `:599` | `--monster-motion-duration` = `${profile.duration}ms` | `${motionDurationMs}ms` |
| `:1041` | `${scaledDuration}ms` | 해당 경로의 plan 기반 값 |
| `:1279` | `${approachMotionMs}ms` | plan 파생값 (티가렉스 분기 접근) |
| `:1302` | `${profile.duration}ms` | `${motionDurationMs}ms` |
| `:357` | `layer.animate(kf, { duration: profile.duration, ... })` | `duration: motionDurationMs` |
| `:496` | `timeout(finish, duration + 160)` | `timeout(finish, duration + HuntActionTimingResolver.WATCHDOG_GRACE_MS)` |

**`startMonsterMotion`의 `duration` 인자**는 호출부에서 `motionDurationMs`를 넘기도록 통일한다.

### 4.5 `js/effects/hunt/HuntAtbConfig.js`

- `VISUAL_DURATION_SCALE`(`:9`)와 `scaleVisualDurationMs`(`:98-100`): **Phase 3에서 제거**.
- Phase 2에서는 남겨두되 **호출부가 0개**임을 테스트로 확인한다.
- `TICKS_PER_SECOND`는 유지하되, `HuntActionTimingResolver.TICK_MS`와의 일치를 테스트로 강제한다:
  `TICK_MS === 1000 / TICKS_PER_SECOND`.

### 4.6 `js/effects/HuntEffect.js`

`:1150`, `:1398`의 하드코딩 `100`을 상수 참조로 바꾼다:

```js
}, HuntActionTimingResolver.TICK_MS);
```

**틱 간격 자체는 바꾸지 않는다.** 상수화만 한다 (두 곳이 갈라지는 것을 방지).

### 4.7 `js/effects/hunt/HuntRuntimeLoader.js`

`HuntActionTimingResolver.js`를 **`HuntMonsterTurnExecutor.js`·`HuntMonsterAttackAnimator.js`보다 먼저** 로드한다.

---

## 5. CSS 키프레임 정합 계약

### 5.1 문제

`@keyframes`의 접촉 프레임 %가 `atTicks/activeTicks`와 무관하게 저작되어 화면과 판정이 어긋난다.

### 5.2 해법 — 선언적 접촉 오프셋 레지스트리

**신규 파일: `js/effects/hunt/data/MonsterMotionContactOffsets.js`**

각 모션 프로파일이 CSS에서 실제로 "때리는" 키프레임 퍼센트를 선언한다.

```js
const HUNT_MOTION_CONTACT_OFFSETS = Object.freeze({
    'rathian-somersault':        [0.48],
    'rathian-somersault-double': [0.27, 0.66],
    'rathian-bite-somersault':   [0.24, 0.65],
    'rathian-somersault-glide':  [0.22, 0.72],
    'rathian-tail-sweep-double': [0.45, 0.64],
    'rathian-triple-fireball':   [0.28, 0.43, 0.58],
    'rathian-glide':             [0.68],
    'rathian-ground-charge':     [0.30],
    'ground-charge-triple':      [0.12, 0.43, 0.74]
    // 신규 모션 추가 시 여기에 한 줄 추가
});
```

위 값들은 **현재 `styles/hunt-runtime.css`에 저작된 실제 퍼센트에서 읽어온 것**이다 (`:2102-2190`, `:1888-1902`, `:1913-1922`).

### 5.3 계약 테스트 (INV-7)

`tests/hunt-timing-keyframe-contract.test.js`가 검증한다:

```
모든 released 몬스터의 모든 패턴에 대해:
  profileId = 패턴의 animationProfile
  contacts  = HUNT_MOTION_CONTACT_OFFSETS[profileId]
  (없으면 skip + 미등록 목록 출력)

  plan = resolve(pattern, { monsterState: 'normal' })

  assert contacts.length === plan.impacts.length
  각 i: |contacts[i] - plan.impacts[i].offset| ≤ 0.03      // ±3%p
```

**불일치 시 조치 우선순위:**
1. `atTicks`를 CSS에 맞춘다 (게임플레이 데이터가 더 유연하다)
2. CSS 키프레임 %를 옮긴다 (시각적 검수 필요)
3. 둘 다 틀렸으면 원작 영상 기준으로 재저작

### 5.4 이징 규칙 (별도 결함, 함께 명문화)

> **CSS `animation-timing-function`은 전체가 아니라 키프레임 구간마다 적용된다.**

- **이동/활공/돌진처럼 연속 궤적을 그리는 모션은 반드시 `linear`를 쓴다.** 키프레임을 조밀하게 저작해 곡선을 표현한다.
- `cubic-bezier`를 쓰면 **매 키프레임마다 감속→가속이 반복**되어 "멈칫멈칫하다 순간이동"처럼 보인다. 키프레임을 조밀하게 만들수록 악화된다.
- 타격 임팩트처럼 **단일 구간**에서 가속감이 필요한 경우에만 `cubic-bezier`를 허용한다.

현재 위반: `.monster-motion-rathian-glide`(`:1578`), `.monster-motion-rathian-somersault-glide`(`:1577`) — `cubic-bezier(.33,0,.2,1)`.

**추가 규칙(승인된 모션 규칙 5번 재확인):** 돌진은 `linear` 이징 + **등간격 키프레임 값**이어야 한다. 현재 `monster-motion-ground-charge`(`:1746-1755`)는 구간 속도가 0.0183 → 0.0163 → 0.0274로 가속한다. 규칙 위반이며 별도 수정 대상이다.

---

## 6. 데이터 스키마 변경

### 6.1 패턴 필드

| 필드 | 상태 | 설명 |
|---|---|---|
| `movement.ticks` | **유지 · 유일한 진실** | 본 동작 틱 예산 |
| `windup` | 유지 | 전조 틱 |
| `recovery` | 유지 | 후딜 틱 |
| `impactTimeline[].atTicks` | 유지 | `1 ≤ atTicks ≤ movement.ticks` 강제 |
| `animationDurationMs` | **Phase 3에서 제거** | `movement.ticks`에서 파생 |
| `animationProfile` | 유지 | CSS 모션 클래스 선택 |
| `timeScale` | **신규(선택)** | 패턴 개별 배속 예외. 기본 1.0 |

### 6.2 몬스터 필드 (`HuntMonsterProfiles.js`)

| 필드 | 상태 | 설명 |
|---|---|---|
| `agility` | **신규(선택)** | 종 고유 속도. 기본 1.0 |
| `variantAgility` | **신규(선택)** | 아종 속도. 기본 1.0 |

`inheritVariant` / `worldVariant`에 아종 속도 인자를 **추가**한다. 기존 `damageRate` 인자의 의미는 **절대 바꾸지 않는다.**

```js
function inheritVariant(baseId, variantId, title, damageRate = 1.04, variantAgility = 1.0) { ... }
```

### 6.3 엔진 필드 (`HuntEngine.js`)

| 필드 | 기본 | 설명 |
|---|---|---|
| `balanceTimeScale` | 1.0 | 전역 밸런싱 노브. **"5% 느리게" = 1.05** |
| `difficultyTimeScale` | 1.0 | 퀘스트 랭크별 배속 |

---

## 7. 데이터 마이그레이션 (Phase 2에서 수행)

`animationDurationMs`를 버리고 `movement.ticks`를 진실로 삼으면 아래처럼 바뀐다.

| 패턴 | 현재 표시 | 신규 표시 | 변화 |
|---|---|---|---|
| `rathian.bite` | 3000ms | 2000ms | -33% |
| `rathian.tail_sweep` | 5250ms | 4200ms | -20% |
| `rathian.triple_fireball` | 3500ms | 2800ms | -20% |
| `rathian.fireball_fizzle` | 2250ms | 1800ms | -20% |
| `rathian.charge` | 3750ms | 2400ms | -36% |
| `rathian.triple_charge` | 11250ms | 11300ms | +0.4% |
| `rathian.somersault` | 4000ms | 2500ms | -38% |
| `rathian.double_somersault` | 8000ms | 5000ms | -38% |
| `rathian.bite_somersault` | 8250ms | 5500ms | -33% |
| `rathian.somersault_glide` | 9750ms | 7800ms | -20% |
| `rathian.glide` | 6000ms | 4000ms | -33% |

**필수 동반 수정 (결함 B):**

```
rathian.double_somersault      impactTimeline[1].atTicks: 53 → 48   (movement.ticks=50 이내)
pink_rathian.double_somersault 동일 (inheritVariant로 자동 상속)
gold_rathian.double_somersault 동일 (inheritVariant로 자동 상속)
```

> `48`을 택한 이유: 원본 비율 53/50=1.06을 유효 범위로 눌러야 하며, CSS `rathian-somersault-double`의 2타 접촉 키프레임이 66%이므로 `0.66 × 50 = 33`... **→ 실제 값은 Phase 2에서 CSS 접촉 오프셋(§5.2)과 대조해 확정한다. 임의로 정하지 말 것.**

**속도가 빨라지는 것에 대한 판단:** 사용자가 "느리다"고 지적한 항목이므로 이 방향이 맞다. 다만 **-38%는 큰 변화**이므로, Phase 2 배포 후 실제 플레이로 확인하고 필요하면 `movement.ticks` 자체를 올려 조정한다(애니메이션이 자동으로 따라온다 — 이것이 통합의 이득이다).

---

## 8. 테스트 명세

### 8.1 신규 테스트

| 파일 | 검증 내용 |
|---|---|
| `tests/hunt-action-timing-resolver.test.js` | `composeTimeScale` 곱셈/클램프, `roundTicks` 경계, `TimingPlan` 깊은 동결(INV-5), `TICK_MS === 1000/TICKS_PER_SECOND` |
| `tests/hunt-timing-tick-animation-parity.test.js` | 모든 released 패턴에 대해 INV-1, INV-2 |
| `tests/hunt-timing-scale-invariance.test.js` | `timeScale ∈ {0.70, 0.85, 1.00, 1.05, 1.25}`에서 INV-4 (±3%) |
| `tests/hunt-timing-monotonic-impacts.test.js` | INV-3 |
| `tests/hunt-timing-keyframe-contract.test.js` | INV-7 (§5.3) |
| `tests/hunt-timing-plan-stability.test.js` | 행동 중 `monsterState` 변경 시에도 `timingPlan`이 불변(INV-6) |

### 8.2 기존 테스트 갱신

| 파일 | 조치 |
|---|---|
| `tests/hunt-released-monster-baseline.test.js` | `npm run generate:monster-baseline`으로 재생성 (Phase 2, 3에서 각각) |
| `tests/hunt-monster-evidence-audit.test.js` | `npm run audit:hunt-monsters` 재생성. 하드코딩 수치 확인 |
| `tests/hunt-monster-atb-cadence.test.js` | 틱 예산 변경 반영 |
| `tests/hunt-rathian-runtime.test.js` | `animationDurationMs` 참조 assertion 갱신 |
| `tests/hunt-monster-animation-catalog.test.js` | `scaleVisualDurationMs` 제거 반영 |
| `tests/hunt-monster-pattern-lab.test.js` | 프리뷰 경로가 plan 없이 동작하는지 확인 |

### 8.3 `package.json` 등록

`test:hunt-monsters`에 신규 테스트 6개를 추가한다. `pretest`에는 `hunt-timing-tick-animation-parity`만 추가한다(가장 빠르고 회귀 감지력이 높음).

---

## 9. 실행 단계 (Phase)

> 각 Phase = 1커밋. 순서 엄수. 이전 Phase의 테스트가 전부 통과한 뒤에만 다음으로 넘어간다.

### Phase 0 — 계측 (동작 변경 0)

- 현재 상태 스냅샷: `npm run generate:monster-baseline`, `npm run audit:hunt-monsters` 결과를 커밋해 기준선 고정.
- `scripts/audit-monster-timing-drift.js` 작성: 모든 몬스터의 `movement.ticks × 100` vs `animationDurationMs × 1.25` 차이와 `atTicks > movement.ticks` 위반을 표로 출력. `npm run audit:hunt-timing`으로 등록.
- **커밋 기준:** 감사 스크립트만 추가. 런타임 코드 무수정.

### Phase 1 — Resolver 도입 (사용처 0)

- `HuntActionTimingResolver.js` 작성.
- `HuntRuntimeLoader.js`에 로드 등록.
- 신규 테스트 6개 중 resolver 단위 테스트 4개 작성 (`parity`/`keyframe-contract`는 Phase 2).
- **커밋 기준:** 기존 동작 완전 무변경. 전체 테스트 통과.

### Phase 2 — 애니메이션 길이를 plan에서 파생

- §4.1~4.4, §4.6, §4.7 개조.
- §7 데이터 마이그레이션 (`atTicks` 초과 3건 수정 포함).
- `MonsterMotionContactOffsets.js` 작성 + `keyframe-contract` 테스트 추가.
- 베이스라인·감사 재생성.
- **커밋 기준:** 순간이동 소실, 애니메이션·틱 일치. 리오레이아 프리뷰 육안 확인.
- **되돌리기:** 이 커밋만 revert하면 Phase 1 상태로 복귀.

### Phase 3 — 죽은 코드/데이터 제거

- `VISUAL_DURATION_SCALE`, `scaleVisualDurationMs` 제거.
- `authoredDurations` 테이블 제거.
- 모든 패턴의 `animationDurationMs` 제거.
- **커밋 기준:** `grep -rn "VISUAL_DURATION_SCALE\|animationDurationMs" js/ data/` 결과 0건.

### Phase 4 — 배속 활성화 (기본값 전부 1.0 → 무변화)

- `agility`, `variantAgility`, `balanceTimeScale`, `difficultyTimeScale` 필드 배선.
- `STATE_TIME_SCALE`을 **일단 전부 1.00으로 두고** 배선만 완성한다.
- `scale-invariance` 테스트 추가.
- **커밋 기준:** 배선 완료, 화면 변화 0.

### Phase 5 — 튜닝값 투입

- `enraged: 0.85`, `exhausted: 1.18` 적용.
- 아종별 `variantAgility` 부여 (금화룡 0.92 등).
- 베이스라인 재생성, 시뮬레이션(`npm run simulate:hunt`)으로 밸런스 확인.
- **커밋 기준:** 분노 시 체감 속도 상승. 밸런스 시뮬레이션 회귀 없음.

---

## 10. 사용 예시 (밸런싱 시나리오)

### 10.1 "분노하면 빨라진다"

```js
HuntActionTimingResolver.STATE_TIME_SCALE.enraged = 0.85;
```
끝. 애니메이션·타격 판정·사운드 슬롯·방향 전환 타임라인이 **전부 함께** 15% 빨라진다.

### 10.2 "금화룡은 더 빠르다"

```js
inheritVariant('rathian', 'gold_rathian', '금화룡', 1.10, /* variantAgility */ 0.92);
```

분노 상태 합성: `1.00 × 0.92 × 0.85 = 0.782`

`rathian.double_somersault` (base: windup 8, active 50, recovery 1, impacts 22/48):

```
windupTicks   = round(8  × 0.782) = round(6.256)  = 6   →  600ms
activeTicks   = round(50 × 0.782) = round(39.1)   = 39  → 3900ms  ← 애니메이션 길이
recoveryTicks = round(1  × 0.782) = round(0.782)  = 1   →  100ms
impact[0]     = round(22 × 0.782) = round(17.204) = 17  → offset 17/39 = 0.4359
impact[1]     = round(48 × 0.782) = round(37.536) = 38  → offset 38/39 = 0.9744
```

비율 검증: 기준 `22/50 = 0.4400` vs `0.4359` → 편차 **0.41%** ✓ (±3% 이내)
기준 `48/50 = 0.9600` vs `0.9744` → 편차 **1.44%** ✓

→ CSS 키프레임 27%/66%는 **수정 없이 그대로 유효**하다.

### 10.3 "밸런싱을 위해 전체 5% 늦춘다"

```js
engine.balanceTimeScale = 1.05;
```
모든 몬스터, 모든 패턴, 모든 상태에 균일 적용. 비율 보존이므로 CSS 무수정.

### 10.4 "특정 대기술만 좀 더 느리게"

```js
['fatalis.nova', '대기술', 'ultimate', 0.9, { timeScale: 1.15, /* ... */ }]
```

---

## 11. 금지 사항 (위반 시 반드시 회귀한다)

1. ❌ 틱 간격(100ms) 변경. 배속은 틱 **수**로만 표현한다.
2. ❌ `TimingPlan`을 행동 진행 중 재계산. `prepare`에서 한 번, 이후 읽기 전용.
3. ❌ 반올림된 값에 배율 재적용 (이중 스케일).
4. ❌ float ms를 반올림해 길이 산출. 항상 `정수틱 × 100`.
5. ❌ CSS에 절대 ms 하드코딩. 반드시 `var(--monster-motion-duration)`.
6. ❌ 연속 이동 모션에 `cubic-bezier` 사용 (§5.4).
7. ❌ 공유 파일(`HuntMonsterAttackAnimator`/`AnimationCatalog`/`TurnExecutor`)에 몬스터 id 분기 추가.
   → `hunt-architecture-boundaries.test.js`가 검사한다. 몬스터별 예외는
   `HuntMonsterGeometryChoreography.js` / `HuntMonsterFacingChoreography.js` /
   `MonsterMotionContactOffsets.js`에 **데이터로** 추가한다.
8. ❌ 아종 속도를 `inheritVariant`의 `damageRate` 인자에 섞기.
9. ❌ 여러 Phase를 한 커밋에 병합.

---

## 12. 완료 체크리스트

- [ ] `grep -rn "scaleVisualDurationMs\|VISUAL_DURATION_SCALE" js/` → 0건
- [ ] `grep -rn "animationDurationMs" js/ data/` → 0건
- [ ] `grep -rn "interval(.*, *100)" js/effects/HuntEffect.js` → 상수 참조로 대체됨
- [ ] 모든 released 패턴: `durationMs === activeTicks × 100` (INV-1)
- [ ] 모든 released 패턴: `atTicks ≤ activeTicks` (INV-2) — 현재 위반 3건 해소
- [ ] `timeScale ∈ {0.70, 0.85, 1.00, 1.05, 1.25}` 전부에서 INV-4 통과
- [ ] CSS 접촉 오프셋 ↔ `atTicks` 비율 정합 (INV-7)
- [ ] 활공/돌진 이징 `linear` 전환 (§5.4)
- [ ] 돌진 등속화 — 승인된 모션 규칙 5번 준수
- [ ] `npm run generate:monster-baseline` 재생성 및 커밋
- [ ] `npm run audit:hunt-monsters` 재생성 및 커밋
- [ ] `npm test` 전체 통과
- [ ] 1920×1080 실 레이아웃 프리뷰에서 리오레이아 11개 패턴 육안 확인
- [ ] `npm run pretest` 후 `js/audio-levels.generated.js`·`audio-gains.runtime.js`
      변경분은 `git checkout --`로 원복 (몬스터 작업과 무관)

---

## 13. 관련 문서

- `data/hunt/approved-monster-motion-rules.md` — 승인된 모션 규칙 (특히 5번 등속 돌진, 6번 복귀)
- `data/hunt/monster-audio-phase-standard.md` — 오디오 페이즈 표준
- `data/hunt/monster-implementation-standard.md` — 몬스터 구현 표준
- `data/hunt/rathian-implementation-audit.md` — 리오레이아 구현 감사
