# 네르기간테

- 현재 런타임 프로필: `js/effects/hunt/HuntMonsterProfiles.js`
- 전용 키트 문서화: 미완료
- 공통 계약: `data/hunt/monster-implementation-standard.md`

## 검토 후보

- 비가시적 `near-far-20` 시간 순환을 사용하는 것으로 제안됨.
- 시간 순환은 거리군 가중치만 바꾸며 가시 성장·가시 경화·파괴 리액션을 담당하지 않는다.
- 가시 성장과 경화는 별도의 가시적 특수 강화 상태로 작성해야 한다.
- 실제 활성화 전 원작 행동 자료와 인터뷰로 구간·거리군·분노 리셋을 확정한다.
