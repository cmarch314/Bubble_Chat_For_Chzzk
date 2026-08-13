# 몬스터 패턴 에디터: 실사용 뷰 / 설계 뷰 구현 계획

## 1. 목적

패턴 에디터를 두 가지 관점으로 분리한다.

- **실사용 뷰**: 실제 수렵과 같은 타겟 선정 및 타격 순서를 재생하여 최종 결과를 검수한다.
- **설계 뷰**: 주 타겟, 피격 인원, 타격별 대상 순서를 고정하여 모션·충돌·사운드를 정밀 편집한다.

두 뷰는 렌더러, 모션 컴파일러, 타겟 정책, 충돌 시점 계산을 공유해야 한다. 별도 전투 로직이나 절대 화면 좌표를 만들지 않는다.

## 2. 현재 구조와 문제

### 현재 소유권

- `HuntMonsterActionPolicy.js`: 타겟 모드와 `impactTimeline` 해석 소유자
- `HuntMonsterTurnExecutor.js`: 실수렵의 생존자·퍽·상태를 반영하고 실제 타겟 계획을 실행
- `HuntStageAnchors.js`: `target`, `pass:N`, `between`, `hunter:N` 등 상대 앵커 해석
- `HuntMotionCompiler.js`: BEAT와 상대 앵커를 배치·자세·방향 키프레임으로 컴파일
- `HuntMonsterAttackAnimator.js`: 컴파일된 모션과 `runtimeResolvedImpactTimeline` 재생
- `tests/fixtures/hunt-monster-pattern-lab.html`: 에디터용 실수렵 렌더러
- `tools/monster-audio-review.html`: 상위 편집 UI, 타임라인 draft와 iframe 메시지 소유

### 현재 불일치

`hunt-monster-pattern-lab.html`의 `resolvePreviewTargets()`가 다음 작업을 자체 수행한다.

- 주 타겟 선택
- 대상 수 계산
- `resolveTargeting()` 호출 전 기본 대상을 구성
- 타격별 `targetIndices` 구성
- `runtimeResolvedImpactTimeline` 생성

실수렵의 `HuntMonsterTurnExecutor`도 유사 작업을 별도로 수행한다. 두 경로는 시간이 지나면 다시 달라질 수 있다. 뷰 토글을 추가하기 전에 공통 순수 함수를 만들어야 한다.

## 3. 변경하지 않을 계약

1. OBS 실수렵 렌더러는 그대로 사용한다.
2. 타겟 해석 소유자는 `HuntMonsterActionPolicy`로 유지한다.
3. 모션 좌표는 `target`, `pass:N`, `between`, `home` 등의 상대 앵커와 `offsetX/Y`로 저장한다.
4. 에디터 시나리오는 패턴 데이터에 저장하지 않는다.
5. 설계 뷰는 피해·가드·회피 결과를 새로 계산하지 않는다. 해당 검수는 실사용 뷰가 담당한다.
6. 사운드와 타격 시점은 동일한 `impactTimeline`을 사용한다.
7. 타임라인의 `hit` BEAT 및 사운드 슬롯 ID는 시나리오 전환으로 바뀌지 않는다.

## 4. 공통 타겟 시나리오 계약

### 4.1 편집기 전용 입력

다음 객체는 브라우저 세션 상태이며 JSON이나 런타임 패턴에 영구 저장하지 않는다.

```js
{
  version: 1,
  view: 'runtime' | 'design',
  monsterState: 'normal' | 'enraged' | 'exhausted' | 'airborne',
  seed: 1234,
  primaryTargetIndex: null | 0 | 1 | 2 | 3,
  forcedTargetIndices: null | [0, 1, 2, 3],
  forcedImpactTargets: null | [
    { impactIndex: 0, targetIndices: [1] },
    { impactIndex: 1, targetIndices: [2, 3] }
  ]
}
```

### 4.2 공통 출력

`HuntMonsterActionPolicy.resolveTargetScenario()`를 추가한다.

입력:

- 패턴 및 몬스터 상태
- 살아 있고 공격 가능한 헌터 목록
- 실제 수렵이 준비한 기본 대상 목록
- 난수 함수
- 선택적 강제 주 타겟·대상·타격별 대상

출력:

```js
{
  primaryTargetIndex: 1,
  targetIndices: [1, 2],
  runtime: { /* 기존 resolveTargeting 런타임 필드 */ },
  impactTimeline: [
    { index: 0, atTicks: 18, targetIndices: [1] },
    { index: 1, atTicks: 38, targetIndices: [2] }
  ],
  warnings: []
}
```

규칙:

- 강제 값이 없으면 기존 `resolveTargeting()` 및 `impactTimeline()` 결과와 같아야 한다.
- 강제 대상도 `targetable`에 없는 헌터를 포함할 수 없다.
- `repeat-previous`, `sequential`, `pair`, `runtime-dive`, `random-live` 의미를 보존한다.
- `forcedImpactTargets`는 대상만 고정하며 틱, 위력, 사운드 단서는 변경하지 않는다.
- 동일 입력과 seed는 동일 출력을 만든다.
- 실사용 경로에서는 `warnings`가 비어 있어야 한다. 설계 경로는 잘못된 조합을 경고로 표시한다.

## 5. 뷰별 동작

### 5.1 실사용 뷰

상단 토글: `[실사용] [설계]`

제공 기능:

- 상태 선택
- 자동 타겟
- seed 고정/재굴림
- 실제 패턴의 최소·최대 대상 수 사용
- 실제 타겟 모드와 타격별 대상 전환 사용
- 회피·가드·피격·상태이상·사운드 표시

`다시 실행`은 seed를 변경한다. `같은 조건 반복`은 seed를 유지한다.

### 5.2 설계 뷰

제공 기능:

- 대상 수 `1 / 2 / 3 / 4`
- 주 타겟 `H1 / H2 / H3 / H4`
- 전체 피격 대상 직접 토글
- 타격 이벤트별 대상 직접 토글
- 패턴 원본 정책으로 복원
- 인접 대상 자동 선택
- 모든 타격 대상을 같은 주 타겟으로 고정
- 부위 위치·방향 가이드
- 타겟 및 타격 순서 오버레이

표시 규칙:

- 주 타겟: 금색
- 보조 타겟: 청록색
- 현재 타격 대상: 붉은색 점멸
- 타격 순서: `①`, `②`, `③` 배지
- 대상 없는 화면 통과: 회색 `허공` 배지
- 정책상 불가능한 구성: 빨간 경고, 저장은 차단하지 않되 실사용 검증 실패로 표시

## 6. 프리뷰 메시지 계약

### 상위 편집기 → iframe

기존 `bubblechat:pattern-preview`에 `scenario`만 추가한다.

```js
{
  type: 'bubblechat:pattern-preview',
  monsterId,
  pattern,
  scenario: { /* PreviewScenarioV1 */ }
}
```

iframe은 상위 편집기가 만든 `runtimeResolvedImpactTimeline`을 받지 않는다. 반드시 공통 정책으로 직접 생성한다.

### iframe → 상위 편집기

```js
{
  type: 'bubblechat:pattern-preview-resolved',
  patternId,
  scenario,
  targetPlan,
  durationTicks
}
```

상위 편집기는 이 결과로 타격 순서 UI와 경고를 표시한다. 타겟 계획을 재계산하지 않는다.

## 7. 드래그 편집과 시나리오 연동

### 7.1 1차 지원 범위

- 설계 뷰에서만 몬스터 전체 위치 드래그 허용
- 현재 선택 BEAT의 도착 위치만 수정
- 기존 `to`/`at` 앵커는 유지
- 드래그 차이를 `offsetX`, `offsetY`로 기록
- 이미지가 아니라 `hunt-monster-attack-motion` 배치 레이어를 드래그
- 좌우반전·회전·부위 피벗 레이어는 건드리지 않음

예:

```js
{ to: 'target', offsetX: 42, offsetY: -18 }
{ to: 'pass:2', offsetX: -30, offsetY: 6 }
```

### 7.2 이미지 변형 기즈모

설계 뷰에서 현재 몬스터 이미지 바깥에 선택 테두리와 변형 기즈모를 표시한다. 기즈모는 `hunt-monster-attack-motion`의 이동과 `pose layer`의 변형을 구분한다.

구성:

- 이미지 내부 드래그: 배치 위치 이동
- 네 모서리 핸들: 가로·세로 비율을 유지한 확대/축소
- 좌우 중앙 핸들: `scaleX` 늘림/줄임
- 상하 중앙 핸들: `scaleY` 늘림/줄임
- 테두리 면을 평행하게 드래그: `skewX` 또는 `skewY`
- 이미지 바깥 회전 원: 회전
- 회전축 점: 현재 `origin` 표시
- 부위 가이드의 점 클릭: `origin: part:head`, `part:left-front-leg`처럼 회전축 선택

기본 조작:

- `Shift`: 회전 15도 단위, 크기 0.05 단위 스냅
- `Alt`: 중심을 고정하고 양쪽으로 확대/축소
- `Escape`: 현재 드래그 취소
- 더블클릭: 현재 조작 항목만 이전 상속값으로 초기화
- `Ctrl+Z / Ctrl+Y`: 저장 전 draft 실행취소/재실행

저장 필드:

```js
{
  offsetX: 42,
  offsetY: -18,
  scaleX: 1.12,
  scaleY: 0.86,
  skewX: 8,
  skewY: 0,
  rotation: -24,
  origin: 'part:left-front-leg'
}
```

저장 금지:

- CSS `matrix(...)`
- `left`, `top`
- iframe 축소율이 적용된 좌표
- 좌우반전 결과가 이미 곱해진 음수 좌표

기즈모는 이미지의 최종 화면 경계를 읽되, 포인터 이동량은 `DOMMatrix.inverse()`로 현재 회전·스케일·좌우반전을 제거한 로컬 좌표로 환산한다. 따라서 이미지가 반전되거나 180도 회전한 상태에서도 사용자가 드래그한 화면 방향과 결과가 일치해야 한다.

#### 회전 필드 선택 규칙

- 현재 BEAT에 `rotateBy`가 있으면 회전 원은 누적 회전량 `rotateBy`를 수정한다.
- 현재 BEAT에 `rotation`이 있으면 절대 회전 `rotation`을 수정한다.
- 둘 다 없으면 스크럽 프레임의 상속된 각도를 기준으로 새 `rotation`을 만든다.
- `rotateByFacing`은 자동 좌우 방향 보정용이므로 일반 회전 원이 덮어쓰지 않는다.
- 전체 회전을 마치고 복귀할 때 역회전하지 않는 공통 계약을 유지한다.

#### 제한값

- `scaleX`, `scaleY`: 0.1~4.0
- `skewX`, `skewY`: -75~75도
- 회전: 입력 중에는 제한하지 않고 표시만 -180~180도로 정규화
- 전장 이탈 위치: 경고하되 편집 중 강제 clamp하지 않음. 저장 검증에서 패턴 의도를 확인한다.

### 7.3 iframe 드래그 메시지

```js
{
  type: 'bubblechat:pattern-preview-edit',
  phase: 'start' | 'move' | 'end',
  operation: 'translate' | 'scale-uniform' | 'scale-x' | 'scale-y'
    | 'skew-x' | 'skew-y' | 'rotate' | 'origin',
  patternId,
  beatId,
  tick,
  values: { offsetX, offsetY, scaleX, scaleY, skewX, skewY, rotation, rotateBy, origin }
}
```

iframe이 포인터 계산과 역행렬 변환을 소유한다. 상위 편집기는 검증된 의미 필드만 받아 draft에 병합한다. iframe 내부 포인터 좌표는 1920×1080 실수렵 좌표계이므로 상위 페이지의 CSS 축소율을 다시 곱하지 않는다.

상위 편집기는 `draft[beatId].offsetX/Y`를 변경하고 동일 틱으로 다시 스크럽한다. 저장은 기존 `/api/hunt-pattern-motion`만 사용한다.

### 7.4 임의 틱 키프레임은 후속 단계

BEAT 중간 틱에서 드래그했다고 자동 분할하지 않는다. 1차 구현은 해당 BEAT의 도착 위치를 바꾼다.

후속 기능 `이 틱에 키프레임 추가`는 별도 작업으로 한다. 자동 분할은 사운드 슬롯과 hit BEAT ID를 깨뜨릴 수 있으므로 다음 조건이 필요하다.

- 기존 BEAT ID 유지
- 새 BEAT에 결정적인 파생 ID 부여
- hit 및 사운드 슬롯은 원래 BEAT에 유지
- 총 틱 보존
- 경계 이동 후 오디오 라우트 검증

## 8. 저장 전 시나리오 검증 행렬

패턴의 `minTargets`, `maxTargets`, `targeting`, `impactTimeline`을 읽어 필요한 조합만 검사한다.

기본 행렬:

- 1인: H1, H2, H3, H4
- 2인: H1+H2, H2+H3, H3+H4, H1+H4
- 3인: H1+H2+H3, H2+H3+H4
- 4인: 전체
- 순차 타격: 첫 타격과 마지막 타격의 주 대상이 다른 경우
- 화면 통과: 빈 pass가 허용된 경우

검증 항목:

- 앵커 해석 오류 없음
- 몬스터가 허용 전장 밖에서 멈추지 않음
- 타격 틱이 모션 총 틱을 넘지 않음
- `pass:N`이 실제 타겟 순서 범위 안에 있음
- 지정 대상 수와 실제 피격 대상 수가 일치
- 주 타겟이 타겟 가능 목록에 포함
- 사운드 슬롯과 hit BEAT의 시작 틱 일치

검증은 저장을 느리게 만들지 않도록 순수 데이터 검사와 대표 프레임 샘플링으로 나눈다. 브라우저 애니메이션 전수 재생은 명시적 `전체 조합 검사` 버튼에서만 수행한다.

## 9. Lite 모델 구현 순서

### 단계 1: 공통 타겟 계획 추출

수정:

- `js/effects/hunt/HuntMonsterActionPolicy.js`
- `js/effects/hunt/HuntMonsterTurnExecutor.js`
- `tests/fixtures/hunt-monster-pattern-lab.html`

작업:

1. `resolveTargetScenario()` 순수 함수 추가
2. 현재 실수렵 결과를 고정 fixture로 기록
3. TurnExecutor가 공통 함수를 사용하도록 전환
4. pattern lab의 중복 `runtimeResolvedImpactTimeline` 조립 제거

완료 조건:

- 강제 시나리오가 없을 때 기존 실수렵 타겟 결과 불변
- 같은 seed에서 실사용 뷰와 fixture 결과 동일

### 단계 2: 뷰 상태와 메시지 계약

수정:

- `tools/monster-audio-review-state.js`
- `tools/monster-audio-review.html`
- `tests/fixtures/hunt-monster-pattern-lab.html`

작업:

1. `PreviewScenarioV1` 정규화 함수 추가
2. `[실사용] [설계]` 토글 추가
3. 마지막 뷰와 설계 시나리오를 `localStorage`에 저장
4. preview/resolved 메시지 추가

완료 조건:

- 토글 시 iframe reload 없음
- 패턴·몬스터 변경 시 유효하지 않은 대상만 안전하게 초기화
- 페이지 새로고침 후 마지막 뷰 복구

### 단계 3: 설계 뷰 대상 패널

수정:

- `tools/monster-audio-review.html`
- `tools/monster-audio-review-state.js`

작업:

1. 대상 수, 주 대상, 전체 대상 UI
2. impact별 대상 행 생성
3. 원본 정책/인접/동일 타겟 프리셋
4. 타겟 색상 및 순서 배지

완료 조건:

- H1~H4 어느 주 타겟에서도 즉시 재생
- 1~4인 구성 전환 시 모션·타격·사운드가 같은 계획을 표시
- 잘못된 구성은 이유가 포함된 경고 표시

### 단계 4: 위치 드래그

수정:

- `tests/fixtures/hunt-monster-pattern-lab.html`
- `tools/monster-audio-review.html`
- `tools/monster-audio-review-state.js`

작업:

1. 설계 뷰에서 배치 레이어 pointer capture
2. drag 메시지 송신
3. 현재 BEAT `offsetX/Y` 갱신
4. 숫자 입력, 타임라인, 프리뷰 동기화
5. Escape 취소, Ctrl+Z/Y draft 실행취소·재실행

완료 조건:

- 드래그 중 프리뷰 reload 없음
- 좌우반전 상태에서도 같은 화면 방향으로 이동
- 다른 주 타겟으로 바꾸면 상대 앵커를 기준으로 동일 오프셋 유지
- 저장 후 새로고침해도 동일 위치

### 단계 5: 변형 기즈모

수정:

- `tests/fixtures/hunt-monster-pattern-lab.html`
- `tools/monster-audio-review.html`
- `tools/monster-audio-review-state.js`

작업:

1. 이미지 경계 선택 테두리와 8개 크기 핸들 생성
2. 테두리 평행 드래그 skew 입력 구현
3. 이미지 바깥 회전 원과 회전축 점 구현
4. 화면 포인터를 pose 로컬 좌표로 역변환
5. 의미 필드 edit 메시지 송신
6. 숫자 입력·스크럽 프레임·기즈모 동기화
7. 부위 가이드 점을 회전축 선택기로 연결

완료 조건:

- 모서리, 가로, 세로, skew, 회전이 서로 다른 필드만 수정
- 위치 이동이 회전·스케일 값을 덮어쓰지 않음
- 좌우반전 상태에서도 핸들 방향과 결과 일치
- 회전 원은 이미지 외부에 유지되고 몬스터 공격 클릭을 방해하지 않음
- 숫자 입력 후 기즈모 위치가 즉시 갱신
- 스크럽 이동 후 해당 틱의 상속된 변형을 정확히 표시
- 저장·새로고침 후 같은 프레임 재현

### 단계 6: 자동 행렬 검사

수정:

- `tools/monster-audio-review-state.js`
- `tools/monster-audio-review.html`
- 필요 시 `tools/hunt-audio-pattern-map.js`

작업:

1. 패턴별 필요한 시나리오 행렬 생성
2. 순수 계약 검사
3. `전체 조합 검사` 버튼과 결과 목록
4. 실패 조합 클릭 시 설계 뷰로 즉시 이동

완료 조건:

- 실패한 대상 수·주 타겟·impact를 한 번에 재현
- 검수 완료 전 미검사/실패 수 표시

## 10. 1차 구현 비대상

- 임의 틱에서 자동 BEAT 분할
- 마우스로 타겟 정책 자체를 새로 저작
- 피해량·회피·가드 밸런스 편집
- 실수렵 코드를 복제한 별도 에디터 전투 엔진
- 절대 `left/top` 좌표 저장
- 구형 CSS 내부 키프레임의 자유 변형

구형 `BEAT 전환` 패턴은 타이밍 스크럽과 시나리오 검수는 가능하지만, 위치 드래그는 진짜 `motion` 배열을 가진 패턴부터 활성화한다. CSS 모션에 편집 가능한 좌표가 없는 경우 버튼을 비활성화하고 `배치 모션 신형화 필요`를 표시한다.

## 11. 테스트 계획

추가:

- `tests/hunt-monster-target-scenario.test.js`
- `tests/hunt-pattern-editor-view.test.js`
- `tests/hunt-pattern-editor-drag.test.js`
- `tests/hunt-pattern-editor-transform-gizmo.test.js`

필수 실행:

```text
node tests/hunt-monster-target-scenario.test.js
node tests/hunt-monster-patterns.test.js
node tests/hunt-monster-pattern-lab.test.js
node tests/monster-audio-review-state.test.js
node tests/hunt-motion-compiler.test.js
node tests/hunt-motion-scrub.test.js
node tests/hunt-pattern-editor-transform-gizmo.test.js
```

브라우저 확인:

- 1920×1080
- 실사용/설계 토글 시 reload 및 깜빡임 없음
- 1~4인과 H1~H4 대표 행렬
- 좌우반전 상태 드래그
- 모서리 크기, 면 skew, 외곽 원 회전
- 부위 회전축 선택
- 타격·사운드·커서 동기화
- 편집기 하단 및 우측 패널 overflow 없음

## 12. 최종 인수 조건

1. 실사용 뷰와 설계 뷰가 같은 `HuntMonsterActionPolicy` 결과를 사용한다.
2. 설계 뷰는 주 타겟과 각 impact 대상을 결정적으로 고정할 수 있다.
3. 타겟 수나 주 타겟을 바꿔도 절대 좌표를 저장하지 않는다.
4. 드래그 결과는 상대 앵커의 `offsetX/Y`로만 저장된다.
5. 실사용 뷰 결과가 변경되는 리팩터링은 기존 계약 테스트가 차단한다.
6. iframe reload 없이 선택, 스크럽, 재생, 드래그가 동작한다.
7. 실패한 시나리오를 한 번의 클릭으로 재현할 수 있다.
