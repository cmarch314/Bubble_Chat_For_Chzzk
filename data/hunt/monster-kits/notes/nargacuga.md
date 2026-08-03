# 나르가쿠르가

- 키트: `data/hunt/monster-kits/nargacuga.json`
- 기준작: Monster Hunter World: Iceborne 원종
- 공통 계약: `data/hunt/monster-implementation-standard.md`

## 검토 후보

- 비가시적 `near-far-20` 시간 순환을 사용하는 것으로 제안됨.
- 이는 강화 상태가 아니라 근거리·원거리 패턴 선택 가중치만 미묘하게 바꾸는 내부 AI 리듬이다.
- 실제 활성화 전 원작 행동 자료와 인터뷰로 구간·거리군·분노 리셋을 확정한다.
- 다른 비룡에게 골격 기준으로 자동 상속하지 않는다.
