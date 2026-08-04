# 📜 BubbleChat Development Guidelines and Permanent-Prevention Rules

This document defines rules that prevent regressions during BubbleChat overlay development and refactoring, and permanently exclude anything that degrades the streamer's or viewers' experience.

---

## 1. Restrict combat/debug message output (CRITICAL)
- **Symptom**: In-game combat logs or debug logs were emitted as chat bubbles, covering the streamer's screen or cluttering the chat panel.
- **Prevention**:
  - Never send real-time combat logs to the chat panel from `HuntEffect.js` or any game class via the `this.director.eventBus.emit('chat:render', ...)` event.
  - Logs must go only to the browser DevTools console (`console.log`).
  - This emit code must never come back during refactoring or compaction recovery.

## 2. Hit sound effect (SFX) control (CRITICAL)
- **Symptom**: When a hunter was hit by a monster, a lewd or noisy moan, or a jarring hit/TTS sound, would play.
- **Prevention**:
  - On a hunter hit (the ungarded ordinary-hit path in `HuntEngine.js`), do not call unnecessary sound functions such as `this.playSFX('mh_hit.mp3', ...)`; leave it **silent**.
  - The visual feedback (screen shake, red hit animation, etc.) conveys the impact well enough, so hit sounds are removed.

---

## 3. Sound rules (follow the former audio_guidelines.md)
- Permanently exclude provocative or suggestive voice sounds (moaning, etc.); use only wholesome effort shouts or weapon-native metallic sounds.

---

## 4. Reactive video command (CMC) management rules
- When adding or deleting a video clip (.mp4) in the `AI CMC` folder, **you must add/remove the file name (without extension) in the `window.HIVE_CMC_FILES` array in `config.js`.**
- Do not declare hardcoded video-filename arrays in individual JS files (e.g. `ChatRenderer.js`, `SoundQuizEffect.js`, `CommandsScrollEffect.js`). Always read them dynamically from `window.HIVE_CMC_FILES`.
- This keeps the keywords for the viewer's `@` reactive-video playback, the sound/video quiz, and the `!커맨드` list-scroll feature uniformly synchronized and auto-maintained.

---

## 5. Concurrent multi-agent conflict prevention
- Codex, Claude, and Antigravity share this working directory, so assume another agent may be editing, committing, or running a server at any moment.
- **The authoritative rules are in `AGENTS.md` §12 (Concurrent Agent Coordination); this document is only a pointer.**
- In short: isolate per agent by branch/worktree; never `git add -A`/`-u`/`commit -a` (stage only the files you changed, by explicit path); never commit another agent's unfinished work, generated churn (e.g. `js/audio-levels.generated.js`), `__pycache__`/`*.pyc`, or `scratch/`; regenerate generated files with their scripts; give servers an agent-specific `--port`; never kill a process you did not start; never force-push.
