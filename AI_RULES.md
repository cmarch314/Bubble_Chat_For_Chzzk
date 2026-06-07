# 🤖 AI 작업 규칙 (BubbleChat)

> **이 파일은 AI 에이전트가 작업 시 반드시 따라야 하는 규칙입니다.**
> 세션 시작 시 이 파일과 `audio_guidelines.md`를 가장 먼저 읽으세요.

---

## 🚨 CRITICAL: 작업 전 체크리스트

세션 시작 시 반드시 아래를 실행하세요:

```powershell
# 1. 최근 커밋 확인
git log --oneline -5

# 2. 미커밋 변경사항 확인 (가장 중요)
git status

# 3. 변경 내용 파악
git diff --stat HEAD
```

**미커밋 변경사항이 있으면 반드시 내용을 확인하고 커밋 여부를 결정한 뒤 작업을 시작하세요.**

---

## 📌 1. Git 커밋 규칙 (절대 원칙)

### 1-1. 기능 단위로 즉시 커밋
- **기능 하나 완성 = 즉시 커밋.** 예외 없음.
- 커밋 없이 다음 기능 작업 시작 금지.
- 세션 종료 전 반드시 `git status` 확인.

### 1-2. 커밋 타이밍 기준
| 상황 | 커밋 |
|------|------|
| 기능 하나 구현 완료 | ✅ 즉시 |
| 버그 수정 완료 | ✅ 즉시 |
| 대형 파일 일부 수정 완료 | ✅ 즉시 |
| 스크래치 파일만 변경 | ⬜ 생략 가능 |

### 1-3. 커밋 메시지 형식
```
feat: [기능명] 설명
fix: [버그명] 설명
refact: [대상] 설명
chore: 설정/파일 정리
```

---

## 📌 2. 파일 편집 규칙

### 2-1. 문법 검증 필수
- JS 파일 편집 후 **반드시 `node -c [파일명]`** 실행.
- 오류 있으면 커밋 금지. 수정 후 재확인.

### 2-2. 대형 파일 (HuntEffect.js 등 1000줄 이상) 특별 규칙
- **전체 덮어쓰기(Overwrite) 절대 금지.**
- `replace_file_content` / `multi_replace_file_content` 도구로 부분 편집만 허용.
- 한 번에 500줄 이상 변경 금지. 논리 단위로 쪼개서 진행.
- 편집 후 **반드시 해당 라인 전후를 `view_file`로 확인**.

### 2-3. 한글/인코딩 주의
- PowerShell로 파일 직접 쓸 때 한글이 깨질 수 있음.
- 파일 쓰기 시: `[System.IO.File]::WriteAllText(path, content, [System.Text.Encoding]::UTF8)`
- 라인 기반 편집 시: `[System.IO.File]::ReadAllLines` + 인덱스로 교체.

---

## 📌 3. 절대 하지 말 것

| 금지 행동 | 이유 |
|----------|------|
| 기능 구현 후 커밋 없이 다음 작업 | 세션 단절 시 소실 |
| 파일 전체 덮어쓰기로 대규모 수정 | 기존 기능 삭제 위험 |
| 기존 동작 코드 삭제하면서 미커밋 | 복구 불가 |
| `git checkout HEAD -- [파일]` 주의 | 작업 중인 내용 초기화됨 |
| 세션 종료 전 `git status` 미확인 | 미커밋 소실 |
| `RacingEffect.js`, `RaidEffect.js` 등 건드리기 | 반드시 diff 확인 먼저 |

---

## 📌 4. 콘텐츠/사운드 규칙

`audio_guidelines.md` 참조. 요약:
- 자극적/야릇한 소리 절대 사용 금지 (`Huk.mp3`, `ast5.mp3` 등)
- 볼륨 최대 `0.7` 이하
- 새 사운드는 `config.js`의 `HIVE_SOUND_CONFIG`에 등록 후 사용

---

## 📌 5. 대규모 작업 진행 방법

1. **스펙 파악** - `scratch/test_*.js` 파일, 대화 로그, 이 문서 확인
2. **구현 계획 작성** - 무엇을 어떻게 바꿀지 먼저 정리
3. **단계별 구현** - 기능 1개 → 검증 → 커밋 → 반복
4. **최종 테스트** - `node scratch/test_*.js` 실행

---

## 📌 6. HuntEffect.js 전용 규칙

- 2000줄 이상 대형 파일. **부분 편집만 허용.**
- 작업 전 `node -c js/effects/HuntEffect.js` 로 현재 문법 상태 확인.
- 템플릿 리터럴 내부 HTML 편집 시 PowerShell 라인 교체 방식 사용.
- 전투 로직 변경 시 `scratch/test_*.js` 테스트 실행으로 검증.

---

## 📌 7. 작업 현황 추적

### 최신 커밋 현황 (2026-06-07)
- `b09129a` - 사운드 키 추가, RacingData/MonsterData 스크립트 로드
- `82bbdd1` - 성향 6종 확장, 대기화면 성향 배지, lifepowder AI, 퀴즈 UI 분리
- `61a5a8f` - 채팅 사운드 정화 (마지막 안정 커밋)

### 6월 6일 소실 후 복구 진행 중인 기능
| 기능 | 상태 |
|------|------|
| 성향 6종 (veteran/support/newbie) | ✅ 완료·커밋 |
| 대기화면 성향 배지 색상 표시 | ✅ 완료·커밋 |
| lifepowder 아이템 + veteran/support AI | ✅ 완료·커밋 |
| newbie 실수 로직 | ✅ 완료·커밋 |
| 차지액스 phial 8콤보 시스템 | ⬜ 미구현 |
| 건랜스 용격포 + 오버히트 시스템 | ⬜ 미구현 |
| 조충곤 진액 버프 시스템 | ⬜ 미구현 |
| 쌍검 귀인화 (데미지1.2x, ATB+20%, 20초) | ⬜ 미구현 |
| 조충곤 차액 시스템 | ⬜ 미구현 |
| 태도 기인 시스템 (spirit level 3단계, 기인베기 배수, 예지베기) | ⬜ 미구현 |
| 전투속도 1/2 감속 | ⬜ 미구현 (6월6일 구현됐으나 소실) |
| 수렵 시작 로직 버그 수정 | ⬜ 미확인 |

### ⚠️ 소실 사고 경위 (2026-06-06 ~ 2026-06-07)
1. 6월 6일: AI(이 대화)가 HuntEffect.js를 수백 번 수정 → **커밋 없이 세션 종료**
2. 6월 7일 새벽: 새 세션에서 AI가 파일을 다시 편집 → **미커밋 상태의 6월 6일 작업 전체 덮어씀**
3. git reflog 확인 결과: 강제 롤백(reset --hard) 없음. 단순 파일 덮어쓰기로 소실.

**→ 이 사고의 원인은 "커밋 없이 세션 종료"이며, 이를 방지하기 위해 이 규칙 문서가 작성됨.**

### 미구현 기능 스펙 참조 파일

- `scratch/test_charge_blade_phials.js` - 차지액스 phial 시스템 스펙
- `scratch/test_gunlance_overheat.js` - 건랜스 오버히트 스펙
- `scratch/test_veteran_personality.js` - 베테랑 성향 AI 스펙
- `scratch/test_support_personality.js` - 서포터 성향 AI 스펙
- `scratch/test_dual_blades_demon.js` - 쌍검 귀인화 스펙

---

## 📌 8. 프로젝트 구조 요약

```
d:/BubbleChat/
├── js/effects/
│   ├── HuntEffect.js       ← 수렵 미니게임 핵심 (2000줄+)
│   ├── MonsterData.js      ← 몬스터 데이터 (별도 파일)
│   ├── RacingEffect.js     ← 경마 미니게임
│   ├── RaidEffect.js       ← 레이드 미니게임
│   └── SoundQuizEffect.js  ← 퀴즈 게임
├── scratch/
│   └── test_*.js           ← 기능별 테스트 스펙 파일
├── config.js               ← 사운드 설정
├── style.css               ← 스타일
├── AI_RULES.md             ← 이 파일
└── audio_guidelines.md     ← 사운드 가이드라인
```
