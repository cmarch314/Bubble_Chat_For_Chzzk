# BubbleChat Agent Rules

## 1. Product North Star

BubbleChat is an OBS entertainment overlay. Its highest purpose is to increase viewer chat participation, make the stream fun to watch, and minimize streamer intervention so the streamer can approach a “거저먹는 방송” (a stream that practically runs itself).

Evaluate work in this order:

1. Preserve working behavior and recover automatically in OBS.
2. Increase meaningful chat participation and readable spectacle.
3. Reduce setup, refresh, moderation, and manual operation for the streamer.
4. Improve maintainability, authenticity, and performance without violating 1–3.

Reject an elegant change if it adds routine streamer work or harms silent-viewer readability.

## 2. Working Method and Token Discipline

- Define acceptance criteria, inspect `git status`, and preserve unrelated/user changes.
- Search/batch reads first; record expensive IDs, paths, formats, provenance, and verification in code or manifests.
- Work dependency-first: inventory → evidence/mapping → selective conversion → runtime → UI → tests. Prefer resumable manifests and never decode archives just to inventory them.
- Reuse an owner/helper, native feature, or installed dependency; otherwise make the smallest coherent change.
- Run focused tests, then proportional regression before handoff.
- Keep reports concise: preserve outcomes, evidence, paths, failures, risks, and required next steps; omit filler and repeated logs.
- When reporting in Korean, default to compact 음슴체 for progress updates and handoffs. Keep questions, approval or safety prompts, and ambiguity-sensitive explanations in natural polite Korean; brevity must not remove evidence, risks, or required next steps.

## 3. Core Runtime Ownership

- `config.js` owns primitives, `config/` media catalogs, and `LocalCompanionEndpoint.js` the browser-facing companion origin.
- `MessageRouter.js` routes chat; `VisualDirector.js` owns stacking; feature loaders own lazy DOM/effects; chat renderer/media controller own ordered rendering and cleanup.
- `ChzzkGateway.js` owns discovery/auth/socket recovery. `AudioManager.js` and `js/audio/` own playback/preloads; audio analysis owns measured gains.
- Hunt code lives under `js/effects/hunt/`; `HuntEffect.js` coordinates. Domain modules own perks, ATB, items, monsters, profiles, and browser I/O; `HuntMonsterStaminaRuntime` owns hidden monster stamina, exhaust drain caps, resistance, and exhaustion transitions. Chat sets tactics, never individual attacks.
- `HuntHunterBeatCatalog` owns approved hunter-action BEAT graphs; `HuntBeatActionRuntime` advances both monster and hunter graphs. Weapon executors select and resolve actions but must not invent a second visual timeline.
- `HuntBeatV2Contract` owns authored timelines; `HuntBeatActionRuntime` advances them. `HuntCombatJudgmentRuntime` owns ordered IDs/traces; `HuntCombatJudgmentResolver` alone mutates combat. Approved BEAT never uses `pendingMonsterImpact` or renderer timing. Verify Diablos Preview/live tick parity and idempotency.
- `HuntPersonalityProfiles` owns base combat chances, issued kits, and start buffs; `HuntIssuedSupplyRuntime` keeps per-hunt kits separate from persistent `HuntSharedSupply` camp stock. `HuntHunterDecisionPolicy` plus `HuntTeamIntentCoordinator` exclusively own autonomous consumable timing so perks modify values and stock without creating a second item AI. `HuntPerkCatalog` owns the 200-perk catalog and typed trigger data; `HuntPerkRuntime` interprets those triggers at shared battle events, and catalog validation rejects unsupported or inert expansion effects.
- Hunt/audio/monster importers own private evidence and compact runtime graphs. The audio review server atomically saves labels and regenerates reviewed runtime routes; keep hunt assets lazy and test load order/replay.
- `HuntMonsterProfileMotionRuntime` owns generated-frame playback for reviewed profile motions. CSS keyframes may remain migration evidence, but reviewed combat must suppress their execution; `hunt-profile-motion-migration.test.js` must cover every released pattern.
- `MonsterAudioReviewState.EditorSession` is the sole owner of review-editor pattern, timeline, selection, scrub, scenario, history, and dirty state. The v3 review server serves the editor and embedded real-hunt preview from one origin, rejects stale source revisions, and reload-verifies generated data before reporting a save.
- The audio review server hot-refreshes compact hunt profile and motion sources when their file stamp changes; its API and embedded real-hunt preview must never retain a catalog older than the source on disk.
- `tools/hunt-monster-review-categories.js` owns the audio-review navigation buckets derived from catalog tier/species; review-only morphology groups must not rewrite runtime species.

Update this section in the same patch when ownership changes.

## 4. OBS and Chzzk Lifecycle

- Production is always 1920×1080. Keep decisive content safe and reserve the bottom 15% for chat in full-screen phases.
- Routine recovery must never reload the page or destroy overlay state.
- WebSocket open is not readiness. Authenticate replacements before retiring working sockets; rediscover on stale/auth/socket/broadcast failure and ignore pending/retired packets.
- Use bounded jittered backoff; failed probes must not tear down a working connection.
- Prefer the OBS-lifecycle-bound Lua companion, retain bounded direct fallback, and treat the batch file as manual recovery only.
- Local `file://` DOM media uses native volume, never `createMediaElementSource`. Lifecycle owners clear timers on disposal.

## 5. Safety, Privacy, and Media

- Treat remote chat as text; validate emote URLs/colors through `SafeContent`.
- The companion validates loopback Host/origin, requires its HttpOnly stateful session, and serves a real-path allowlist; never expose roots or wildcard CORS.
- Chzzk token discovery uses companion then direct access; never route credentials through public proxies.
- Keep private extracts in ignored `game_extracts/` and `local_assets/monster_hunter/`; never stage, publish, or copy them into tracked roots.
- Preserve originals/provenance, use measured loudness compensation, and keep text UTF-8 without BOM. Audit and verify media mapping changes.

## 6. Hunt Product Contract

- `!수렵` is a chat-participatory autobattler, readable and winnable with zero combat chat.
- Flow is quest board → loadout → fighting → results. Config owns timing; tests own defaults, early advance, fair four-player selection, and NPC fill.
- Persist only viewer perk IDs/locks; weapon/personality stay random and NPCs never persist. Loadout commands accumulate until ready; one accepted mutation produces one fixed-profile confirmation.
- Chat controls high-level intent, votes, support, and spectacle—not every attack. Use cooldowns, shared resources, diminishing returns, deterministic ties, and sensible no-vote defaults.
- Weapon actions obey authored resources/combos/locks/reactions/cancels. ATB recovers during locks; turn spends and tick recovers/gates. Targeted effects use live image bounds.
- Delayed defense plans reserve intent only; impact-time state chooses guard, evade, or counter. Counter immunity begins only after confirmed success; a fresh failed response clears prior counter protection and takes the authored hit. Every negated hit needs a visible owner.
- An approved BEAT graph owns one complete live action session: motion, event/audio delivery, lock, return, and completion share its clock. State transitions, traps, and replacement actions queue until completion/cancel; transition roars use the approved `transition-roar` graph and release at its final recovery beat. Legacy timing/audio/direct-roar fallbacks run only without an approved graph.
- `HuntMonsterArchetypeCatalog` owns phases/skeletons, `HuntMonsterActionPolicy` movement/targets/impacts, and `HuntMonsterTraitRuntime` cross-action state/hazards. Data supplies values; executors never branch on monster IDs.
- Typed data and isolated image transforms drive movement/facing/returns. Shared owners handle ATB, telegraphs, interruptions, landings, parts, recovery, targets, and trap immunity. Control visuals use the same release ticks and remove DOM only after their fade completes.
- Preview-authored damage judgments own hit timing, target, damage, and reaction size: `weak` means butt-stumble, `strong` means launch. Legacy `butt-stumble` inputs normalize to `weak`. `HuntHunterTurnExecutor` alone owns recovery/invulnerability duration; recovery tests pin ownership/idempotency.
- `HuntMonsterReactionCatalog` owns shared small/large/tail part-break BEAT motion and per-part reaction selection; `HuntCombatAnimator` layers the independent material-split visual over that motion.
- Monster motion has one graph contract: authored `beat` or extracted `keyframe-beat`. `judgments[]` alone owns timing and targets; multi-target beats encode left/right in each judgment, never only outer targeting metadata. Never revive CSS capture, `hitOffsetTicks`, `judgmentOffsets`, or phase-slot audio ownership.
- Full-turn monster actions preserve their accumulated rotation while translating home; the motion owner removes the transform only after completion, so no recovery segment may interpolate backward to `rotate(0)`.
- Preview/editor and live hunts compile the same current pattern, targets, and BEAT clock. Judgments own per-hit damage/defense/immunity/presentation; runtime recovery clears its visual lock, so DOM timers/action-wide dedupe cannot suppress later hits. Never mix edited motion with saved `beatV2`/impact data or invent Preview-only hits/audio; catalog parity tests enforce this.
- `monster-kits/` owns review stages/editions/mechanics; registry/resolver/release policy reject fictional hooks and fail closed. Windup metadata drives telegraphs and state modifiers before impact.
- `data/hunt/monster-implementation-standard.md` owns shared monster contracts only. Keep monster-specific evidence, interview decisions, and open questions in `data/hunt/monster-kits/notes/<id>.md`; read the shared standard plus only the active monster note. Runtime owners and contract tests remain authoritative.
- Audio uses verified cues or silence. BGM prefers verified themes then habitat pools. Hunter voices keep one profile and use labelled/extracted action banks only; exclude dialogue/NPC/gesture/video sources.
- CMC is an ordinary random fixed actor sourced only from `HIVE_CMC_VOICE_COMMANDS`; nickname ownership is UI metadata. Cart timing remains config-owned.

## 7. Monster Hunter Audio Evidence

Canonical chain:

`game action/state reference → Wwise event → bank HIRC/container → WEM/stream → decoded runtime clip`

- Record game, source, bank/event/container/stream, decoded file, purpose, evidence type, and confidence.
- Duration is never semantic evidence. It only orders review; never infer identity from it.
- Bank names prove only identity/role. Unknown semantics stay `unknown` until a reference, event, label, or verified audition establishes them.
- Action routes require semantic evidence; never fill gaps with unrelated or duration-matched sounds. VO, roars, pain, and death remain monster-identity-bound: reviewed subspecies/special forms may inherit only their base-species VO, never another species. Missing wing and physical-action SE may use audition-confirmed semantic fallback pools temporarily; elemental delivery stays exact. Preserve fallback provenance, and reject every other unresolved SE.
- Attack VO may accompany action start; non-vocal attack SE plays only from its authored impact, projectile, or explosion event. Verify delayed and multi-hit timelines do not emit SE when merely scheduled.
- Weapon fallback stays within the same weapon; item fallback stays within its semantic family and records surrogates.
- Bow draw stages stay silent: never route `wp_bow_cmn` string-pull clips or the rejected charge-air surrogate. Charging sidestep uses only an audition/evidence-confirmed locomotion cue; tests pin both rules.
- Taxonomy/importers own identity and event evidence; graph/review tooling preserves HIRC recipes and atomic event-group labels. Explicit individual auditions remain authoritative.
- Manifests separate semantic, bank, and review evidence. Keep bulk data in ignored SQLite and generate compact runtime outputs.

## 8. Legacy SFX Replacement Policy

- Replace only after semantic mapping: disable references, inventory/back up and quarantine, then verify OBS before removal.
- Protect all `AI CMC/` media, the verified potion-use cue, and individually allowlisted unmistakable classic Monster Hunter sounds.
- Other hunt SFX remains untrusted until provenance/purpose is proven. Record decisions and keep cleanup reversible; never delete protected/referenced files.

## 9. UI and Accessibility

- Inspect at 1920×1080; preserve OBS readability, use horizontal space before shrinking type, and remove redundant labels/dead space.
- Quest/loadout use the top 85%; chat owns the bottom 15%. Combat may use sides without covering action.
- Perks show full two-line descriptions; shorten copy instead of clipping, scrolling, or ellipsizing. Never ellipsize viewer commands.
- Combat depth is card < monster < weapon. Animators never set hunter-card z-index/transform; verify `layout-contracts`.

## 10. Verification Ladder

1. Always run syntax checks and focused owner tests.
2. Audio/routes: `test:mh-audio`, plus `audit:hunt` when assets/routes change.
3. Balance/timing: `simulate:hunt -- 50`; media profiles: `analyze:audio`; catalogs: `verify`.
4. Run `npm test` for cross-cutting/release changes, not isolated docs/tooling.
5. Inspect affected UI at 1920×1080 for overflow, contrast, overlap, and chat clearance.

Report any required check that fails or is skipped.

## 11. Self-Maintaining Rules

Update this file when an owner/lifecycle/command/directory boundary changes, a failure class repeats, or an expensive discovery would be lost.

Each rule names trigger, owner/action, and verification. Merge near related rules, revise stale text, keep under 16 KiB UTF-8 without BOM with unique headings, and prefer tests over prose.

## 12. Concurrent Agent Coordination

Codex, Claude, and Antigravity share this working directory. Assume another agent may edit files, commit, push, or run servers at any moment.

- Isolation first: one agent works on one branch, ideally its own `git worktree`. Never share a live working branch, and never commit onto a branch another agent is actively editing.
- Never absorb foreign work: before committing, read `git status` and stage only the files you changed for this task, by explicit path. Never `git add -A`, `git add -u`, or `git commit -a`. Never commit another agent's uncommitted changes, generated churn (`js/audio-levels.generated.js`, `js/audio-gains.runtime.js`), build artifacts (`__pycache__/`, `*.pyc`), or `scratch/`.
- Honest scoped commits: one logical change per commit; the message states only what actually changed and was verified. Never claim work that is empty, unverified, or another agent's.
- Commit every completed task: after verification, stage only the files owned by that task and create one scoped commit whose message summarizes the completed work. Report that summary and commit hash in the handoff. If the user explicitly forbids committing, leave the changes uncommitted and say so.
- Integrate, don't clobber: pull/rebase onto the shared branch before pushing; if a file changed under you, re-read and merge rather than overwrite. Resolve conflicts; never force-push a shared branch.
- Regenerate, don't hand-merge: `*.generated.js` and route/label JSON come from their scripts (`generate:*`, `apply:*`). Regenerate deterministically after data changes; never hand-edit or manually merge generated output.
- Runtime resources: dev and review servers must pass an agent-specific `--port`; never assume the default port is free, and never kill a process you did not start.
- Signal ownership: make the files or feature you are actively editing discoverable (descriptive branch name or short claims note) and check for other agents' claims before touching shared hot files (`AGENTS.md`, `HuntAudioManager.js`, `HuntMonsterTurnExecutor.js`, catalogs).
