# 🤖 AI Working Rules (BubbleChat)

> **This file defines rules every AI agent must follow while working.**
> At the start of a session, read this file and `audio_guidelines.md` first.

> ⚠️ **Concurrent multi-agent work (Codex, Claude, and Antigravity share one folder):**
> The authoritative rules for preventing commit/branch/port conflicts are in **`AGENTS.md` §12 (Concurrent Agent Coordination)**.
> Key points: never `git add -A`/`-u`/`commit -a` — stage only the files you changed, by explicit path (do not absorb another agent's unfinished work, generated churn, `.pyc`, or `scratch/`); give servers an agent-specific `--port`; never kill a process you did not start.

---

## 🚨 CRITICAL: pre-work checklist

At the start of a session, always run:

```powershell
# 1. Check recent commits
git log --oneline -5

# 2. Check uncommitted changes (most important)
git status

# 3. Understand the changes
git diff --stat HEAD
```

**If there are uncommitted changes, always inspect them and decide whether to commit before you begin work.**

---

## 📌 1. Git commit rules (absolute principles)

### 1-1. Commit each feature immediately
- **One feature complete = commit immediately.** No exceptions.
- Do not start the next feature without committing.
- Always check `git status` before ending a session.

### 1-2. Commit-timing criteria
| Situation | Commit |
|------|------|
| One feature implemented | ✅ Immediately |
| Bug fix complete | ✅ Immediately |
| Part of a large file modified and complete | ✅ Immediately |
| Only scratch files changed | ⬜ May skip |

### 1-3. Commit message format
```
feat: [feature] description
fix: [bug] description
refact: [target] description
chore: config/file cleanup
```

---

## 📌 2. File-editing rules

### 2-1. Syntax check required
- After editing a JS file, **always run `node -c [file]`**.
- If there is an error, do not commit. Fix and re-check.

### 2-2. Special rules for large files (`HuntEffect.js`, etc., 1000+ lines)
- **Never overwrite the whole file.**
- Only partial edits via `replace_file_content` / `multi_replace_file_content`.
- Do not change 500+ lines at once. Split into logical units.
- After editing, **always verify the lines around the change with `view_file`**.

### 2-3. Korean / encoding caution
- Korean can be corrupted when writing files directly from PowerShell.
- When writing files: `[System.IO.File]::WriteAllText(path, content, [System.Text.Encoding]::UTF8)`.
- For line-based edits: `[System.IO.File]::ReadAllLines` + replace by index.

---

## 📌 3. Absolutely do not

| Forbidden action | Reason |
|----------|------|
| Starting the next task without committing a finished feature | Lost if the session breaks |
| Large edits by overwriting the whole file | Risk of deleting existing features |
| Deleting working code while leaving it uncommitted | Unrecoverable |
| Careless `git checkout HEAD -- [file]` | Resets in-progress content |
| Ending a session without checking `git status` | Uncommitted work is lost |
| Touching `RacingEffect.js`, `RaidEffect.js`, etc. | Always diff-check first |

---

## 📌 4. Content / sound rules

See `audio_guidelines.md`. Summary:
- Never use provocative/suggestive sounds (`Huk.mp3`, `ast5.mp3`, etc.).
- Keep volume at `0.7` or lower.
- Register new sounds in `HIVE_SOUND_CONFIG` in `config.js` before use.

---

## 📌 5. How to run large tasks

1. **Understand the spec** — check `scratch/test_*.js` files, conversation logs, and this document.
2. **Write an implementation plan** — decide what to change and how, first.
3. **Implement in steps** — one feature → verify → commit → repeat.
4. **Final test** — run `node scratch/test_*.js`.

---

## 📌 6. Rules specific to `HuntEffect.js`

- Large file, 2000+ lines. **Partial edits only.**
- Before working, check current syntax with `node -c js/effects/HuntEffect.js`.
- When editing HTML inside template literals, use the PowerShell line-replacement method.
- When changing combat logic, verify with the `scratch/test_*.js` tests.

---

## 📌 7. Work-status tracking

### Latest commit status (2026-06-07)
- `b09129a` — added sound keys; load RacingData/MonsterData scripts
- `82bbdd1` — expanded to 6 personalities, waiting-screen personality badge, lifepowder AI, quiz UI split
- `61a5a8f` — chat-sound cleanup (last stable commit)

### Features being recovered after the June 6 loss (Korean game-feature names kept)
| Feature | Status |
|------|------|
| 성향 6종 (veteran/support/newbie personalities) | ✅ Done, committed |
| 대기화면 성향 배지 색상 표시 (waiting-screen personality badge colors) | ✅ Done, committed |
| lifepowder item + veteran/support AI | ✅ Done, committed |
| newbie mistake logic | ✅ Done, committed |
| 차지액스 phial 8-combo system (Charge Blade) | ✅ Done, committed |
| 건랜스 용격포 + overheat system (Gunlance) | ✅ Done, committed |
| 조충곤 진액 buff system (Insect Glaive) | ✅ Done, committed |
| 쌍검 귀인화 (Dual Blades demon mode: dmg 1.2x, ATB +20%, 20s) | ✅ Done, committed |
| 조충곤 차액 system (Insect Glaive) | ✅ Done, committed |
| 태도 기인 system (Long Sword spirit level 3 stages, spirit-slash multiplier, foresight slash) | ✅ Done, committed |
| Combat-speed 1/2 slowdown | ✅ Done, committed |
| Hunt start-logic bug fix | ✅ Done, committed |

### ⚠️ How the loss happened (2026-06-06 ~ 2026-06-07)
1. June 6: the AI (this conversation) edited `HuntEffect.js` hundreds of times → **ended the session without committing**.
2. Early June 7: in a new session the AI edited the file again → **overwrote all of the uncommitted June 6 work**.
3. `git reflog` showed no forced rollback (`reset --hard`); the loss was from a plain file overwrite.

**→ The root cause was "ending a session without committing," and this rules document was written to prevent it.**

### Spec reference files for unimplemented features
- `scratch/test_charge_blade_phials.js` — Charge Blade phial system spec
- `scratch/test_gunlance_overheat.js` — Gunlance overheat spec
- `scratch/test_veteran_personality.js` — veteran personality AI spec
- `scratch/test_support_personality.js` — support personality AI spec
- `scratch/test_dual_blades_demon.js` — Dual Blades demon-mode spec

---

## 📌 8. Preventing and handling deadlocks

### 8-1. Announce when user approval is needed (most important)
- When calling a tool that needs user approval (running a terminal command, writing a file, etc.), **always first print a text message that clearly explains, in Korean, what you are about to do and asks for approval**.
- If you call a tool and wait with no text explanation, the user may think the work is finished or stuck, fail to press approve, and the AI stays deadlocked.

### 8-2. Register a timer for async work
- When you leave long-running or async work (a build, a test, a subagent call) and yield the turn, **always register a suitable notification timer (e.g. 30–60s) with the `schedule` tool**.
- This prevents the case where a background task or server quietly stops or restarts and no notification arrives — the timer wakes you to re-check state.

### 8-3. Do not run interactive commands
- Never run a terminal command that waits for the user's direct input (e.g. `npm install` without `-y`, a login prompt during git push, or a tool with a confirmation prompt).
- Always use automation flags (`-y`, `--yes`, `-q`, etc.) so it finishes in one shot, or use a pipeline (`yes | command`) if needed.

### 8-4. Avoid loops and polling
- Do not build polling loops that repeatedly call `manage_task` or `run_command` to keep checking terminal state or file changes, within a turn or across turns.
- Trust the system's reactive-wakeup mechanism; wait for the task to finish, or use a one-shot `schedule` timer to wake up.

### 8-5. Enforce timeouts in custom scripts
- Never write code that can infinite-loop in project verification scripts or temporary edits.
- Always add a safeguard so the script auto-exits after a fixed time (e.g. 5 or 10 seconds), such as `setTimeout(() => process.exit(0), 10000)`.

### 8-6. Do not use the `cd` command
- Due to a system constraint, running `cd` alone in `run_command` is forbidden. When you need to change the working directory, use the tool's `Cwd` parameter directly.

### 8-7. Check state on session restart/resume
- When a session resumes after compaction or a server restart, existing background tasks (e.g. a dev server) may be stopped, so **first check state with `manage_task`'s `list` action and restart if needed**.

---

## 📌 9. Project structure summary

```
d:/BubbleChat/
├── js/effects/
│   ├── HuntEffect.js       ← Hunt minigame core (2000+ lines)
│   ├── MonsterData.js      ← Monster data (separate file)
│   ├── RacingEffect.js     ← Racing minigame
│   ├── RaidEffect.js       ← Raid minigame
│   └── SoundQuizEffect.js  ← Quiz game
├── scratch/
│   └── test_*.js           ← Per-feature test/spec files
├── config.js               ← Sound config
├── style.css               ← Styles
├── AI_RULES.md             ← This file
└── audio_guidelines.md     ← Audio guidelines
```

---

## 📌 10. Reactive video command (CMC) management rules

- When adding or deleting a video clip (.mp4) in the `AI CMC` folder, **you must add/remove the file name (without extension) in the `window.HIVE_CMC_FILES` array in `config.js`.**
- Do not declare hardcoded video-filename arrays in individual JS files (e.g. `ChatRenderer.js`, `SoundQuizEffect.js`, `CommandsScrollEffect.js`). Always read them dynamically from `window.HIVE_CMC_FILES`.
- This keeps the keywords for the viewer's `@` reactive-video playback, the sound/video quiz, and the `!커맨드` list-scroll feature uniformly synchronized and auto-maintained.

---

## 📌 11. Strict UTF-8 encoding without BOM

- **All text/code/document files (especially `.md`, `.js`, `.html`, `.css`, `.json`) must be authored and saved as UTF-8 without a BOM.**
- On Windows, do not save files with the system default (CP949 / EUC-KR), which makes Korean appear as Chinese characters (mojibake/corruption) on GitHub, etc.
- When writing or running scripts (Python, Node.js, etc.) that auto-generate or modify docs/config:
  - Always pass `encoding='utf-8'` explicitly when opening files (e.g. `open(file, 'w', encoding='utf-8')`).
  - For Python on Windows, use the `PYTHONUTF8=1` environment variable or the `-X utf8` flag so stdio and file encoding are not corrupted.
