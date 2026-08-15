# BubbleChat Agent Rules

## 1. Product North Star

BubbleChat is an OBS overlay to increase viewer chat participation and minimize streamer intervention for a “거저먹는 방송”.

Evaluate work in this order:

1. Preserve working behavior and recover automatically in OBS.
2. Increase meaningful chat participation and readable spectacle.
3. Reduce setup, refresh, moderation, and manual operation for the streamer.
4. Improve maintainability, authenticity, and performance without violating 1–3.

Reject an elegant change if it adds routine streamer work or harms silent-viewer readability.

## 2. Working Method and Token Discipline

- Define acceptance criteria, inspect `git status`, and preserve unrelated/user changes.
- Batch reads first; record expensive IDs, paths, formats, provenance, and verification in code or manifests.
- Work dependency-first: inventory → evidence/mapping → selective conversion → runtime → UI → tests. Prefer resumable manifests and never decode archives just to inventory them.
- Reuse an owner/helper, native feature, or installed dependency; otherwise make the smallest coherent change.
- Run focused tests, then proportional regression.
- Keep reports concise: preserve outcomes, evidence, paths, failures, risks, and required next steps; omit filler and repeated logs.
- When reporting in Korean, default to compact 음슴체 for progress updates and handoffs. Keep questions, approval or safety prompts, and ambiguity-sensitive explanations in natural polite Korean; brevity must not remove evidence, risks, or required next steps.

## 3. Core Runtime Ownership

- `config.js` owns primitives, `config/` media catalogs, and `LocalCompanionEndpoint.js` the browser-facing companion origin.
- `MessageRouter.js` routes chat; `VisualDirector.js` owns stacking; feature loaders own lazy DOM/effects; chat renderer/media controller own ordered rendering and cleanup.
- `ChzzkGateway.js` owns discovery/auth/socket recovery. `AudioManager.js` and `js/audio/` own playback/preloads; audio analysis owns measured gains.
- Hunt code lives under `js/effects/hunt/`; `HuntEffect.js` coordinates. Domain modules own perks, ATB, items, monsters, profiles, and browser I/O; `HuntMonsterStaminaRuntime` owns hidden monster stamina, exhaust drain caps, resistance, and exhaustion transitions. Chat sets tactics, never individual attacks.
- `HuntBeatV2Contract`/`HuntHunterBeatCatalog` own graphs; `HuntBeatActionRuntime` advances them. `HuntActionSession` owns one authored-action lifecycle and clock boundary for live or presentation-only execution. `HuntProjectileTimingResolver` resolves distance before sessions; `HuntProjectilePresentationRuntime` presents lifecycle without a clock. `HuntCombatJudgmentRuntime` traces and `HuntCombatJudgmentResolver` mutates combat. Approved BEAT never uses legacy timing.
- `HuntMonsterNativeBeatCatalog` owns promotion of reviewed candidate graphs into released monster patterns; promoted graphs are data-only, compiled once by `HuntBeatV2Contract`, and shared unchanged by Preview and live hunts. Candidate JSON is never read by the browser runtime.
- `tools/generate-native-beat-graphs.js` is the only writer for `NativeMonsterBeatGraphs.generated.js`; run its `--check` gate after candidate graph edits.
- `HuntRotationContract` owns native-image direction, accumulated angles, and recovery. `HuntMotionCompiler` reverses the inner rotation sign whenever facing mirrors the sprite; home translation never adds a turn.
- `HuntCombatRuntime` owns the live engine host; `HuntActionSession` is the shared action transport used by live and Preview. `HuntCombatClock` provides automatic live or manual Preview transport. No consumer may schedule a second action/event timer.
- `HuntPersonalityProfiles` owns base combat chances, issued kits, and start buffs; `HuntIssuedSupplyRuntime` keeps per-hunt kits separate from persistent `HuntSharedSupply` camp stock. `HuntHunterDecisionPolicy` plus `HuntTeamIntentCoordinator` exclusively own autonomous consumable timing so perks modify values and stock without creating a second item AI. `HuntPerkCatalog` owns the 200-perk catalog and typed trigger data; `HuntPerkRuntime` interprets those triggers at shared battle events, and catalog validation rejects unsupported or inert expansion effects.
- Hunt/audio/monster importers own private evidence and compact runtime graphs. The audio review server atomically saves labels and regenerates reviewed runtime routes; keep hunt assets lazy and test load order/replay.
- `HuntMonsterProfileMotionRuntime` owns generated-frame playback for reviewed profile motions. CSS keyframes may remain migration evidence, but reviewed combat must suppress their execution; `hunt-profile-motion-migration.test.js` must cover every released pattern.
- `MonsterAudioReviewState.EditorSession` owns review-editor pattern, timeline, selection, scrub, scenario, history, and dirty state. `MonsterMotionAuthoringContract` owns editable fields, normalization, storage, and round-trip comparison across motion sources; save paths must not keep private allowlists. The v3 review server serves the editor and embedded real-hunt preview from one origin, rejects stale revisions, and reload-verifies generated data before reporting a save. Clients compare server-canonical beats with reloads, never raw UI drafts. Live simulation boots production `index.html` and drives its real chat router; never add a preview-only battle loop.
- The audio review server hot-refreshes compact hunt profile and motion sources when their file stamp changes; its API and embedded real-hunt preview must never retain a catalog older than the source on disk.
- Candidate motion saves carry a `HuntBeatV2Contract.fingerprint` of the authored graph; the server rejects stale fingerprints before mutation and returns the reloaded fingerprint. UI verification compares that hash first, so derived tick fields cannot cause false rollback failures.
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
- An approved BEAT graph owns motion, events/audio, lock, return, and completion on one clock. Queue transitions, traps, and replacement actions until completion/cancel; transition roars release at their final recovery beat. Legacy fallbacks run only without an approved graph.
- `HuntMonsterArchetypeCatalog` owns phases/skeletons, `HuntMonsterActionPolicy` movement/targets/impacts, and `HuntMonsterTraitRuntime` cross-action state/hazards. Data supplies values; executors never branch on monster IDs.
- Typed data and isolated image transforms drive movement/facing/returns. Shared owners handle ATB, telegraphs, interruptions, landings, parts, recovery, targets, and trap immunity. Control visuals use the same release ticks and remove DOM only after their fade completes.
- Preview-authored damage judgments own hit timing, target, damage, and reaction size: `weak` means butt-stumble, `strong` means launch. Legacy `butt-stumble` inputs normalize to `weak`. `HuntHunterTurnExecutor` alone owns recovery/invulnerability duration; recovery tests pin ownership/idempotency.
- The motion-only editor renders the authored BEAT through a `HuntActionSession` in `presentationOnly` mode; it keeps target geometry for placement but never mutates combat. Scrubbing seeks that same session and suppresses side effects. Direct `setInterval` event clocks and Preview-only projectile schedules are forbidden.
- `HuntMonsterReactionCatalog` owns shared part-break and pitfall BEAT motion; `HuntCombatAnimator` layers material-split visuals. `HuntTrapConfig` derives pitfall entry, struggles, release lock, and fade from resolved BEAT; live control keeps no second escape duration.
- Monster motion has one graph contract: authored `beat` or extracted `keyframe-beat`. `judgments[]` owns contact/targets; projectile launch/finish events independently own lifecycle, and the editor round-trips all three points without side effects. Multi-target beats encode left/right per judgment. Never revive CSS capture, legacy offsets, inferred projectile delays, or phase-slot audio ownership.
- Preview/editor and live compile the same pattern, targets, and `HuntActionSession` BEAT clock. Judgments own each hit; recovery clears its visual lock so later hits remain valid. Never mix edited motion with saved `beatV2`/impact data or invent Preview-only hits/audio; parity tests compare the session trace and enforce this.
- `monster-kits/` owns review stages/editions/mechanics; `monster-kits/rebuild/` is isolated reference-only planning and never runtime input. Registry/resolver/release policy reject fictional hooks and fail closed.
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

Update this file when ownership changes, a failure repeats, or costly discovery would be lost. Name trigger, owner/action, verification; merge stale rules; keep under 16 KiB UTF-8 without BOM; prefer tests.

## 12. Concurrent Agent Coordination

Codex, Claude, and Antigravity share this directory; assume concurrent edits, commits, pushes, and servers.

- Isolation first: one agent per branch/worktree; never share a live branch or commit onto one another agent edits.
- Never absorb foreign work: check `git status`; stage explicit owned paths only. Never `git add -A/-u`, `commit -a`, foreign changes, generated churn, build artifacts, or `scratch/`.
- Honest scoped commits: one logical change per commit; the message states only what actually changed and was verified. Never claim work that is empty, unverified, or another agent's.
- Commit each verified task with owned files only; report summary/hash. If forbidden, leave changes uncommitted and say so.
- Integrate, don't clobber: pull/rebase onto the shared branch before pushing; if a file changed under you, re-read and merge rather than overwrite. Resolve conflicts; never force-push a shared branch.
- Regenerate, don't hand-merge: `*.generated.js` and route/label JSON come from their scripts (`generate:*`, `apply:*`). Regenerate deterministically after data changes; never hand-edit or manually merge generated output.
- Runtime resources: dev and review servers must pass an agent-specific `--port`; never assume the default port is free, and never kill a process you did not start.
- Signal ownership: make the files or feature you are actively editing discoverable (descriptive branch name or short claims note) and check for other agents' claims before touching shared hot files (`AGENTS.md`, `HuntAudioManager.js`, `HuntMonsterTurnExecutor.js`, catalogs).
