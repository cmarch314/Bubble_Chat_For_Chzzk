# BEAT 재구축 사건·구조 핸드오프

작성 기준: 2026-08-15, `codex/full-rebuild`의 `6ce0115`

## 1. 이 문서를 먼저 읽어야 하는 이유

이 프로젝트는 구형 CSS 모션을 BEAT로 옮기는 과정에서 같은 결함을 여러 번 반복했음. 화면에서 한 증상만 고치면 다른 실행 경로가 예전 값을 다시 적용했고, Preview에서 맞춘 결과가 실수렵에서 달라졌으며, 저장은 성공한 것처럼 보인 뒤 재로드 검증에서 실패했음.

이제 목표는 **전체 구형 패턴을 자동 마이그레이션하는 것**이 아님. 구형 구현은 동작 의도와 실패 사례를 보는 읽기 전용 레퍼런스로만 남기고, 각 패턴을 새 BEAT 그래프로 다시 작성해 한 개씩 승인함. 어댑터를 덧붙이거나 구형 수치를 복사해 빠르게 통과시키면 이 문서에 기록된 문제가 다시 발생함.

## 2. 실제로 겪은 대표 증상

### 시간 소유자가 여러 개였음

- BEAT ticks, `impactTimeline`, profile motion, CSS keyframe, `setTimeout`이 동시에 같은 행동을 진행했음.
- 타임라인을 바꿔도 실제 애니메이션 출발 시점이 그대로였음.
- 패턴 복귀 전에 분노 포효나 다음 패턴이 시작됐음.
- 함정 탈출 마지막 프레임에서 그물과 마스크가 서서히 사라지지 않고 즉시 제거됐음.
- 취소된 패턴의 늦은 콜백이 판정, 대경직, 사운드 또는 복귀를 다시 실행했음.

### Preview와 실수렵이 같은 데이터를 다르게 실행했음

- Preview는 별도 타이머와 표시용 판정을 만들고, 실수렵은 구형 executor와 CSS를 함께 사용했음.
- Preview에서 두 명을 맞힌 철산고와 X자 꼬리치기가 실수렵에서는 한 명만 맞혔음.
- Preview 타이밍과 실제 사운드·피격·복귀 시간이 달랐음.
- Preview 패턴 선택만으로 효과나 사운드가 발동하거나, 이전 패턴 transform이 다음 패턴에 남았음.

### 저장의 원본과 검증 대상이 달랐음

- UI/DOM, `EditorSession`, 후보 JSON, 생성 JS가 서로 다른 값을 가지고 있었음.
- 저장은 후보 JSON을 바꿨지만 재검증은 오래된 catalog나 다른 projection을 비교했음.
- 틱, 회전, 복귀회전, HIT 이동을 저장하면 `후보 모션 항목 불일치`, `모션 값 불일치`, `BEAT 누락`이 반복됐음.
- 다른 탭이나 서버가 같은 후보 파일을 바꾸면 사용자가 조정한 값이 조용히 덮일 위험이 있었음.

### 투사체의 발사와 피격을 하나의 HIT로 취급했음

- `spit` 시작, 투사체 발사, 이동, 도착, 헌터 피격이 하나의 tick 또는 서로 다른 숨은 offset에 묶였음.
- 화염구 한 발이 두 번 생성되거나 삼연 화염구가 발사마다 두 발씩 나갔음.
- 화염구가 도착하기 전에 헌터 HIT 표시가 발생했음.
- 화면 밖 빈 슬롯으로 쏘는 탄은 생성되지 않았고, 좌우 반전과 무관하게 똥꼬에서 발사되는 경우가 있었음.

현재 계약에서 `projectile-launch`는 입에서 탄이 출발하는 사건이고, `judgment`는 이동이 끝난 뒤 대상에게 도착한 사건임. 둘을 같은 HIT marker로 다시 합치면 안 됨. 거리와 대상 위치가 다르면 착탄 tick도 달라질 수 있음.

### 회전·반전·복귀를 여러 곳에서 보정했음

- UI 회전값이 0인데 CSS나 choreography가 별도 회전을 적용했음.
- 시계/반시계 설정이 같은 방향으로 재생됐음.
- 좌우 반전 상태에서 회전 방향과 부위 좌표가 함께 반전되지 않았음.
- 360도 회전 후 최종각도 0을 보간하면서 역회전으로 되감겼음.
- `return`이 위치뿐 아니라 누적 회전까지 0으로 돌려 사용자가 끈 복귀회전을 되살렸음.

회전은 작성 그래프의 누적 signed rotation이 단독 소유함. facing은 별도 레이어이며 반전된 화면에서 회전의 시각 방향을 공용 계약이 해석함. renderer나 몬스터별 executor가 추가 각도를 만들면 안 됨.

### 대상 선택과 위치 선택이 분리돼 있었음

- `2인 랜덤`을 골라도 12/23/34 중 하나가 아니라 항상 23 또는 34로 갔음.
- 주 대상 2번인데 지중잠행 흙먼지와 실제 출현 대상이 달랐음.
- 빈 슬롯을 인접 헌터에게 전가해 1번 대상의 지진이 의도하지 않은 슬롯으로 이동했음.
- 2인 패턴의 이동 종점은 두 헌터 사이여야 하지만 판정만 두 명이고 모션은 주 대상에게 갔음.

대상 시나리오는 세션 시작 때 한 번 잠그고, 이동 anchor와 각 `judgment.target`이 그 결과를 함께 사용해야 함. 빈 슬롯은 빈자리로 유지하며 임의 재매핑하지 않음.

### 상태·리액션이 공격 행동과 경쟁했음

- 함정 중 부위파괴, 기절, 대경직이 겹치면 몬스터가 멈추거나 순간이동했음.
- 지중잠행 진입 중 기절로 다시 튀어나오거나, 탈출 애니메이션 도중 다른 패턴 막타가 실행됐음.
- 포효 경직이 끝난 순간 예약된 부위파괴가 뒤늦게 재생됐음.
- 피격 무적 중 피해는 막았지만 피격 애니메이션은 다시 시작됐음.

행동·리액션·상태 전환은 세션의 완료/취소 규칙과 generation token을 따라야 함. DOM 타이머나 action-wide dedupe가 별도 상태 소유자가 되면 안 됨.

### 사운드 라우트도 여러 소유자가 있었음

- 구형 phase slot, 패턴 audio route, HIT 사운드, 랜덤 그룹이 겹쳐 지정하지 않은 소리가 났음.
- BEAT 구분동작이 바뀌면서 이전 맵핑이 사라지거나 첫 음원만 반복됐음.
- 발사 SE가 예약 시점에 먼저 재생되고 실제 impact에서는 무음인 경우가 있었음.

사운드는 BEAT event 또는 judgment 결과가 소유함. 공격 SE는 예약 시점이 아니라 실제 authored event에서 한 번만 재생하고, HIT 전용 사운드는 실제 적중했을 때만 재생함.

## 3. 현재 확정된 구조

```text
candidate JSON의 native BEAT graph
        │
        ▼
HuntBeatV2Contract compile + fingerprint
        │
        ▼
HuntActionSession (유일한 tick/lifecycle/seek/cancel 소유자)
        ├─ Preview: presentationOnly, 판정 결과는 표시만 함
        └─ Live: 동일 event trace로 실제 gameplay를 적용함
                 │
                 ├─ renderer: 현재 frame만 그림
                 ├─ judgment: 도착 tick에 대상/피해/리액션 처리
                 └─ audio: authored event/result만 재생
```

주요 소유자:

- `HuntBeatV2Contract`: canonical graph와 fingerprint.
- `HuntActionSession`: Preview와 실수렵의 공용 transport/lifecycle.
- `HuntBeatActionRuntime`: compiled graph의 tick/event 실행.
- `MonsterAudioReviewState.EditorSession`: 에디터 선택·스크럽·history·dirty 상태.
- `HuntMonsterNativeBeatCatalog`: 승인한 신규 그래프만 런타임 패턴으로 승격.
- `NativeMonsterBeatGraphs.generated.js`: 생성 도구만 쓰는 런타임 산출물.

`impactTimeline`이 남아 있더라도 승인된 native 패턴에서는 감사·호환 확인용 파생 projection일 뿐임. 런타임 시계로 소비하면 안 됨.

## 4. 현재 완료된 수직 슬라이스

- Preview와 실수렵이 `HuntActionSession`을 사용함.
- 편집 저장 시 canonical graph fingerprint를 보내고, stale source면 쓰기 전에 거부함.
- 저장 후 디스크에서 다시 읽은 graph hash가 다르면 성공으로 보고하지 않음.
- 스크럽 후에도 대상/시나리오 context가 유지됨.
- `rathian.fireball`, `rathian.triple_fireball`은 native BEAT 승격 경로를 사용함.
- 단일 화염구는 발사 1회, 삼연 화염구는 서로 다른 projectile 3개를 가짐.
- 발사는 `spit` authored event, 착탄은 거리 기반 resolver가 계산함.

관련 커밋:

- `ed15f45` Preview transport session 통합
- `c374426` canonical graph 저장 검증
- `987379e` 실수렵 몬스터 행동 session 연결
- `95845ae` 레이아 단일 화염구 native 승격
- `50b9225` 스크럽 context 보존
- `21227a4` 레이아 삼연 화염구 native 승격
- `5a249a7` 생성·승격 게이트
- `6ce0115` native graph의 파생 감사 projection 정리

## 5. 아직 완료됐다고 보면 안 되는 부분

- 레이아의 나머지 패턴과 레우스 패턴은 신규 native graph로 전부 승인된 상태가 아님.
- 다른 몬스터의 구형 패턴은 새 구조의 품질 증거가 아니며 자동 승인하면 안 됨.
- `hunt-beat-v2-full-migration.test.js`는 미작성 패턴 전체를 나열하므로 현재 실패함. 현재 전략은 전체 마이그레이션이 아니므로 이 목록을 자동 변환하거나 `approved`로 채워 테스트를 억지로 녹색으로 만들지 않음.
- `hunt-preview-live-catalog-contract.test.js`도 미승격 패턴을 포함한 전체 catalog 기준으로는 실패할 수 있음.
- 위 실패는 native 수직 슬라이스를 무효화하지 않지만, 전체 로스터가 새 엔진으로 릴리스됐다는 뜻도 아님.

## 6. 앞으로 패턴 하나를 새로 구성하는 절차

1. `AGENTS.md`, `monster-implementation-standard.md`, 이 문서, 활성 몬스터 note만 읽음.
2. `git status`와 다른 에이전트의 hot-file 작업 여부를 확인하고 독립 브랜치/워크트리를 사용함.
3. 구형 구현은 궤도, 순서, 원작 의도를 눈으로 확인하는 데만 사용함. 수치·타이머·CSS 클래스·adapter 객체를 복사하지 않음.
4. 후보 JSON에 native graph를 `draft`로 작성함. 이동, transform, projectile, judgment, audio, return, completion을 한 그래프에 둠.
5. `HuntBeatV2Contract`로 직접 compile함. 구형 timing 필드가 발견되면 실패시킴.
6. Preview에서 1인/2인/4인, 좌우 대칭, 빈 슬롯, 스크럽, 일시정지, 재생 종료를 검증함.
7. 같은 입력·seed로 live session trace와 Preview trace를 비교함.
8. 저장 후 reload hash와 graph hash가 동일한지 확인함.
9. 사람 검수 완료 후에만 생성 도구의 명시 목록에 추가하고 native catalog로 승격함.
10. 생성 JS는 직접 편집하지 않고 생성기를 실행한 뒤 `--check`를 통과시킴.

패턴 단위 완료 조건:

- Preview/live의 tick별 transform, event, judgment target, audio, completion trace가 동일함.
- 선택만으로 재생되지 않고, 재생·정지·스크럽이 다른 상태를 남기지 않음.
- 발사체 수와 `projectileId`가 authored event 수와 정확히 일치함.
- HIT marker는 실제 judgment tick과 대상에만 표시됨.
- 취소 후 늦은 판정·사운드·복귀가 0건임.
- 저장 직후 재로드 검증이 통과하고 새로고침 뒤에도 같은 값임.

## 7. 금지 사항

- 전체 구형 catalog를 한 번에 자동 BEAT 승인하지 않음.
- Preview 전용 hit/audio/projectile/timer를 만들지 않음.
- 실수렵 executor에서 몬스터 ID 분기로 모션을 보정하지 않음.
- `hitOffsetTicks`, `judgmentOffsets`, CSS keyframe, profile timer를 신규 그래프의 두 번째 시계로 사용하지 않음.
- 발사 tick과 착탄 tick을 같은 HIT로 묶지 않음.
- UI 값을 저장한 뒤 다른 projection에서 기본값을 다시 덮지 않음.
- generated file을 직접 수정하거나 다른 에이전트의 미커밋 파일을 함께 커밋하지 않음.
- 전체 마이그레이션 테스트를 통과시키려고 미검수 패턴을 자동 `approved`로 만들지 않음.

## 8. 현재 수직 슬라이스 검증 명령

```powershell
node tests/hunt-action-session.test.js
node tests/hunt-beat-v2-live-runtime.test.js
node tests/hunt-live-combat-beat-integration.test.js
node tests/hunt-native-monster-beat-catalog.test.js
node tests/monster-audio-review-graph-hash.test.js
node tests/hunt-rathian-runtime.test.js
node tests/hunt-projectile-timing-resolver.test.js
node tests/hunt-monster-breath-delivery.test.js
node tests/hunt-profile-motion-migration.test.js
node tools/generate-native-beat-graphs.js --check
```

새 패턴을 승인할 때는 해당 패턴의 1인/2인/4인 trace 테스트와 1920×1080 시각 검수를 추가해야 함. 단순히 위 명령만 통과했다고 원작 모션과 타격감까지 승인된 것은 아님.

## 9. 다음 에이전트의 첫 작업

레이아를 계속한다면 단일·삼연 화염구 수직 슬라이스를 기준으로 다음 지상 패턴 하나만 선택해 새로 작성함. 포효, 물어뜯기, 돌진, 꼬리 회전 중 하나를 끝까지 완료한 뒤 다음 패턴으로 넘어감. 레우스는 레이아에서 검증된 공용 계약만 재사용하며 레이아 candidate나 생성물을 복사해 이름만 바꾸지 않음.

작업 보고에는 반드시 다음을 포함함.

- 수정한 authored source와 생성 도구
- Preview/live trace 비교 결과
- 저장/reload hash 결과
- 실행한 테스트와 실패한 전체 게이트
- 아직 legacy reference로 남은 패턴
- 커밋 해시와 다른 에이전트 변경을 포함하지 않았다는 확인
