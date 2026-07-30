# 리오레우스 인터뷰 구현 감사

기준은 원종·월드/아이스본 우선이다. 중간 제안보다 사용자의 마지막 확정 답변을 우선한다.

## 실행 계약

| 결정 | 상태 | 소유 코드/검증 |
|---|---|---|
| 분노 진입 포효 뒤 첫 행동은 백스텝 브레스→비행 | 구현 | `HuntBattleTickExecutor`, `rageOpenerPatternId` |
| 백스텝 브레스는 1명 70%, 나머지는 풍압[대] | 구현 | `rathalos.backstep_fireball`, `secondaryInterference` |
| 포효에 걸린 직접 대상은 백스텝 브레스 대응 불가 | 구현 | `guaranteedWhenInterference: roar` |
| 백스텝 브레스 중단 시 45초 뒤 재시도 | 구현 | `monsterRageOpenerRetryTicks` |
| 단발 화염구는 직선 투사체·1명·50% | 구현 | `rathalos.fireball` |
| 머리 파괴 후 화염구 30%, 백스텝 35%, 명중 25% 감소 | 구현 | 부위별 피해/명중 보정 |
| 3연 화염구·스텝 연사·연속 차기·화염 쓸기 제거 | 구현 | 월드식 9개 패턴 키트 |
| 약공은 최대 3회 연속 가능 | 구현 | `maxConsecutiveUses` |
| 원종 필살기 없음 | 구현 | 레우스 키트에 `ultimate` 없음 |
| 꼬리 절단 후 꼬리 회전 1명·절반 위력 | 구현 | 부위별 대상 상한/피해 보정 |
| 공중 활공은 4초 동안 좌↔우 광역 횡단 | 구현 | `chargeMode: wide`, `screen-sweep` |
| 비행 60초·공중 회피 50% | 구현 | `HuntMonsterFlightRuntime` |
| 비행 종료는 독조 내려찍기 후 착지, 탈진 시 즉시 착지 | 구현 | `naturalLandingPatternId`, `landing-only` |
| 분노 120초·탈진 30초·탈진 종료 후 다음 분노 | 구현 | 데이터 기반 상태 주기 |
| 분노 피해 보정 10% | 구현 | `enragedDamageMultiplier: 1.10` |
| 기본 착지 재비행 대기 30초, 날개당 +15초 | 구현 | 비행 쿨다운과 좌/우 날개 파괴 |
| 부위 파괴 또는 대경직 중 비행이면 1.5배 강제 착지 | 구현 | `forceLanding` |
| 기절·마비·수면은 지상으로 내린 뒤 시작 | 구현 | 상태 진입 공통 경로 |
| 공중 대경직 피해 게이지 폐기 | 구현 | 부위/상태 기반 강제 착지만 유지 |
| 성향별 섬광 0/1/1/1/2/1 지급 | 구현 | `HuntSupportItemPolicy` |
| 섬광 확률 0/50/100후순위/75/90/15% | 구현 | 성향별 사용 정책 |
| 배태랑은 다른 보유자가 없을 때만 100% 사용 | 구현 | 파티 보유량 우선순위 |
| 네 번째 섬광 이후 AI가 더 사용하지 않음 | 구현 | `maxEffectiveFlashes: 4` |
| 공중 섬광은 1.5배 격추 대경직 | 구현 | `forceLanding('flash')` |
| 공중에도 함정 1개 설치 가능, 바닥에 보이다 착지 때 발동 | 구현 | `pendingLandingTrap`, `shocktrap-pending` |
| 함정 반복 사용 시 구속시간 감소 | 구현 | `consumeTrapDuration` |
| 파괴 부위 아이콘과 사선 표시 | 구현 | `HuntMonsterArchetypeCatalog.partDisplaySlots`, `HuntRenderer` |
| 포효[소] | 구현 | `roarSize: small` |
| 레우스 포효는 확인된 전용 경로 사용 | 구현/청음 필요 | `HuntAudioCatalog`의 `rathalos:roar` |

## 남은 시각 검수

- 백스텝 브레스→비행, 자연 착지 내려찍기, 섬광 격추를 한 전투에서 이어 보는 1920×1080 OBS 실기 검수.

## 근거

- 월드 데이터: <https://mhworld.kiranico.com/ja/monsters/BnetX/rioreusu>
- 월드 공략의 분노 직후 백점프 브레스 확정 설명: <https://game8.jp/mhw/157267>
- 월드 공략의 백점프 브레스→체공 및 섬광 대응 설명: <https://gamewith.jp/mhw/86976>
