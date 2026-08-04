# 몬스터 패턴 오디오 페이즈 표준

이 문서는 모든 몬스터 패턴의 소리를 **일정한 페이즈 단위**로 나누고, 각 페이즈마다 SE(효과음) 또는 VO(몬스터 음성) 트리거를 배선하기 위한 기준이다. 새 몬스터는 이 페이즈에 맞춰 소리를 채운다. 검수 도구(`review:monster-audio`)의 "패턴 슬롯 매핑 현황"은 이 표준으로 슬롯을 파생한다.

## 1. 정준 페이즈

한 공격은 최대 5개, 최소 2개의 오디오 순간을 갖는다. 순서는 항상 아래를 따른다.

| # | 페이즈 | 뜻 | 타이밍 근거(패턴 필드) | 예시 소리 |
|---|---|---|---|---|
| 1 | `telegraph` (전조) | 자세·기척·모으기 | `windup` / `windupTicks` 시작 | 브레스 모으는 소리, 돌진 발구르기, 꼬리 준비, 서머솔트 준비 목소리 |
| 2 | `start` (시작) | 실제 동작 개시 / 발사 | windup 종료(행동 커밋); 투사체는 발사 프레임 | 발사 소리, 돌진 개시, 꼬리 휘두르는 소리, 서머솔트 휘두르기 |
| 3 | `travel` (이동) | 돌진·활공 등 이동 구간 | `movement.ticks` (charge/cross 계열) | 돌진 질주 발소리 |
| 4 | `impact` (타격) | 실제 접촉/적중 | `impactTimeline[].atTicks` (복수 가능) | 맞추는 소리, 돌진 피격, 꼬리 맞는 소리, 서머솔트 착지 |
| 5 | `recovery` (후딜) | 마무리·잔향 | `recovery` / `recoveryTicks`; 잔염은 `attachedFx` | 돌진 멈추는 소리, 화염 지속음 |

- 모든 페이즈가 항상 있는 것은 아니다. 패턴 종류에 따라 아래 §2처럼 2~4개가 선택된다.
- `telegraph`은 `suppressPrepareAudio: true`면 생략한다(예: 탈진 브레스 불발).
- `impact`는 `impactTimeline` 이벤트마다 하나씩 생긴다(이단 꼬리·다연발 브레스는 타격 슬롯이 2개 이상).
- 각 슬롯은 SE 또는 VO 중 하나를 받는다. VO는 몬스터 정체성(포효·서머솔트 기합)이고, SE는 물리/속성 접촉음이다.

## 2. 패턴 종류별 슬롯 구성

| 종류 | 슬롯(순서) | 예 |
|---|---|---|
| 포효 `roar` | `roar` | 각룡의 포효 |
| 브레스/투사체 `projectile`,`delivery=breath/laser/cone/gas` | `telegraph`(모으기) → `start`(발사) → `impact`(적중) → `recovery`(잔염, 속성/`attachedFx`일 때) | 화염구 브레스 |
| 돌진 `charge` | `telegraph`(준비; `stomp-burst`면 발구르기) → `travel`(질주) → `impact`(피격) → `recovery`(멈춤) | 뿔 돌진 |
| 근접 물리 `physical`/`area` | `telegraph`(준비) → `start`(휘두르기) → `impact`(타격) | 꼬리 휘두르기, 뿔 쳐올리기 |
| 공중 물리(서머솔트) | `telegraph`(기합 VO) → `start`(휘두르기) → `impact`(착지) | 레이아 서머솔트 |
| 잠복 진입 `burrow-enter` | `burrow` | 지중 잠행 |
| 잠복 재출현 `burrow-emerge` | `telegraph`(재출현 전조) → `impact`(쳐올리기) | 지중 급습 |

## 3. 런타임 트리거 배선 현황과 목표

각 페이즈는 실제 재생 시점에 트리거가 걸려야 한다. 현재 배선 상태:

| 페이즈 | 현재 트리거 | 상태 |
|---|---|---|
| `telegraph` | `HuntMonsterTurnExecutor` prepare 시 `monster_telegraph` SFX | ✅ 배선됨 |
| `start` | 행동 커밋 시 `monster_attack` (`audioPhase:'action-start'`) | ✅ 배선됨 |
| `start`(발사) | 발사 프레임 `onMonsterProjectileLaunchAudio` → `projectile_launch` | ✅ 배선됨 |
| `travel` | `onMonsterStrideAudio` → `charge_stride_step` | ⚠️ 티가렉스만 배선 |
| `impact` | 특수 큐(`somersault`,`tigrex-final-vocal`)만 VO | ❌ 일반 타격 미배선 |
| `recovery` | 없음 | ❌ 미배선 |

**목표:** 페이즈 경계마다 슬롯이 정의돼 있으면 SE/VO를 재생하는 **범용 트리거**로 통일한다.
1. `impactTimeline` 각 이벤트의 `atTicks`에서 해당 `impact` 슬롯을 재생(타격).
2. `movement.ticks` 구간에서 `travel` 슬롯을 몬스터 무관하게 재생(이동).
3. `recovery` 진입 시 `recovery` 슬롯을 재생(후딜·잔염).
4. 슬롯 소스는 `data/hunt/monster-pattern-audio-routes.json`(검수 도구 저장분)을 catalog보다 우선 사용.

## 4. 검수·구현 순서

1. 패턴 데이터에 `windup`/`impactTimeline`/`movement`/`recovery`/`delivery`를 정확히 채운다(페이즈 타이밍의 근거).
2. `review:monster-audio`의 패턴 슬롯 패널에서 각 페이즈에 SE/VO를 지정한다.
3. 지정은 `monster-pattern-audio-routes.json`에 저장된다.
4. 런타임 범용 트리거가 페이즈 경계에서 지정 소스를 재생한다.
5. `telegraph`는 전조 전용, `impact`는 접촉 프레임 전용 — 조기/지연 재생 금지(공통 모션 규칙 §9와 동일).
