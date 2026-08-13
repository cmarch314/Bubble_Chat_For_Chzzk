# 몬스터 패턴 오디오 BEAT 표준

패턴 오디오의 유일한 시간축은 모션의 `motion[]` BEAT 배열이다. 에디터, 저장 JSON, 생성 런타임, 실수렵은 모두 `beat:<beatId>`를 사용한다. `telegraph`, `start`, `travel`, `impact`, `recovery` 같은 기존 단계명은 과거 데이터를 이관할 때만 참고하며 새 배정 키로 저장하지 않는다.

## 계약

1. 모션 BEAT 하나마다 같은 ID의 오디오 슬롯 하나를 제공한다.
2. 슬롯 재생 시각은 해당 BEAT의 `startTicks`이다.
3. 타격 여부와 오디오 시각은 독립적이다. `hit: true`는 판정 시점이고, 그 BEAT에 배정된 SE/VO는 같은 시각에 재생한다.
4. 비어 있는 슬롯은 무음이다. 의미가 검증되지 않은 소리로 채우지 않는다.
5. 비트 ID가 없거나 현재 모션에 존재하지 않는 슬롯은 서버가 저장을 거부한다.
6. 모션 저장은 현재 패턴의 모든 BEAT를 정확히 한 번씩 포함해야 한다. 일부 누락이나 임의 ID 추가는 전체 저장을 거부한다.
7. 패턴에 BEAT 라우트가 하나라도 있으면 기존 catalog 단계 폴백은 재생하지 않는다. 이중 재생을 방지한다.

## 자료 구조

```json
{
  "version": 2,
  "routes": {
    "barioth": {
      "barioth.shoulder_check": {
        "beat:shoulder-impact": {
          "mode": "single",
          "layers": [["local_assets/.../impact.mp3", 0.7, 0]]
        }
      }
    }
  }
}
```

- `mode`: `single`, `random`, `layer` 중 하나.
- `layers`: 검수된 로컬 음원, 재생 음량, 내부 지연.
- `migratedFrom`: 구형 단계에서 자동 이관된 경우에만 남기는 출처 기록.

## 소유권

- `HuntMotionCompiler`: BEAT 시작 tick, impact, `audioSlot` 산출.
- `HuntMonsterAttackAnimator`: 컴파일된 동일 타임라인으로 모션과 오디오 예약 및 중단.
- `hunt-audio-pattern-map.js`: 검수 UI용 BEAT/슬롯 결합과 구형 데이터 이관.
- `monster-audio-review-server.js`: 저장 입력 검증, 원자적 저장, 런타임 파일 재생성.
- `HuntAudioManager`: 명시된 BEAT 라우트 재생과 구형 폴백 중복 차단.

## 검증

1. `node tests/hunt-motion-compiler.test.js`
2. `node tests/hunt-audio-pattern-map.test.js`
3. `node tests/hunt-pattern-audio-runtime.test.js`
4. `node tests/monster-audio-review-server.test.js`
5. 오디오 또는 라우트 변경 시 `npm.cmd run test:mh-audio`

검수 화면에서는 타임라인 BEAT, 변형 편집기의 선택 BEAT, 사운드 슬롯, 우측 현재 배정 강조가 항상 같은 `beatId`를 가리켜야 한다.
