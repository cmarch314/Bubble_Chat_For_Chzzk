# 레이아·레우스 clean BEAT 재구축 작업서

## 결론

확장 기반은 준비됐지만 두 몬스터의 현 패턴은 전부 `migrated`임. 기존 구현은 동작 의도와 실패 사례를 확인하는 읽기 전용 참고자료로만 사용하고, 신규 BEAT 그래프를 별도 후보에서 완성한 뒤 몬스터 단위로 원자 교체함.

## Terra 작업 범위

1. 먼저 `data/hunt/monster-kits/candidates/<id>.json` native 후보 스키마와 compiler를 추가함. 후보는 `HuntBeatV2Contract` 입력과 패턴 메타데이터를 모두 소유함.
2. Review Preview에만 `?candidate=rathian`처럼 후보를 선택하는 로더를 추가함. 후보를 선택하지 않은 Preview와 실수렵은 현 runtime을 그대로 사용함.
3. 후보 compiler는 어댑터를 호출하지 않고 native `beatV2`를 직접 검증함. 후보 파일에서 구형 timing/CSS 필드가 발견되면 실패함.
4. 레이아부터 진행하고 레우스는 레이아에서 검증된 공유 동작만 재사용함.
5. `monster-kits/rebuild/<id>.json`의 행동 목록과 acceptance를 기준으로 누락 없이 신규 그래프를 작성함.
6. 기존 `HuntMonsterProfiles.js`, motion override, CSS keyframe에서 수치나 객체를 복사하지 않음. 화면에서 확인한 궤도·순서·연출 의도만 참고함.
7. 동작·판정·음향·상태 전환·복귀가 하나의 BEAT 세션을 공유해야 함.
8. 한 행동씩 Preview와 candidate trace를 일치시킨 뒤 `draft → approved`로 승격함. 모든 행동 승인 후 compiler가 생성물을 만들고 kit의 `actionManifest`를 바꾸는 단일 커밋으로 원자 교체함.

## 작업 순서

- 기반: candidate schema → native compiler → Preview 전용 후보 로더 → 원자 승격 명령과 rollback 검사
- 레이아 지상 기본기: 포효 → 물어뜯기 → 화염구 → 삼연 화염구 → 돌진
- 레이아 전역/연속기: 꼬리 회전 → 삼연속 돌진
- 레이아 공중기: 서머솔트 → 이단 → 물어뜯기 연계 → 활공 연계 → 저공 활공
- 레우스 지상 공통기와 브레스
- 레우스 비행 전환·공중 브레스·독조·활공
- 두 몬스터 각각 golden trace, 1인/2인/4인·분노·부파·중단 시나리오 고정

## 허용 파일

- `data/hunt/monster-kits/rebuild/rathian.json`
- `data/hunt/monster-kits/rebuild/rathalos.json`
- 신규 canonical action source와 그 생성물
- 관련 계약·trace 테스트
- 필요할 때만 공용 BEAT compiler/runtime. 몬스터 ID 분기 금지

## 완료 조건

- rebuild manifest의 행동 ID와 실제 카탈로그가 정확히 일치함.
- 금지된 구형 필드와 CSS 실행 경로가 신규 후보에 0개임.
- 모든 행동의 Preview/live event trace와 최종 transform이 일치함.
- 판정은 `judgments[]`, 음향은 BEAT event, 복귀와 상태 전환은 세션 완료가 단독 소유함.
- `npm run gate:hunt-expansion:full` 통과 후 몬스터 단위 원자 교체함.

## 첫 Terra 커밋의 완료 조건

- 빈 candidate fixture 하나가 native contract로 컴파일됨.
- candidate Preview trace가 같은 입력의 `HuntBeatActionRuntime` trace와 일치함.
- 후보 선택 없이 실행한 Preview와 실수렵의 compiled hash가 작업 전과 동일함.
- candidate loader·compiler 어디에서도 `HuntBeatV2Adapter`를 import하지 않음.
- 실패한 후보 저장이나 부분 승인으로 released runtime 파일이 갱신되지 않음.
