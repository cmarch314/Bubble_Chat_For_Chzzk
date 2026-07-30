# BubbleChat Agent Rules

## 1. Product North Star

BubbleChat is an OBS entertainment overlay. Its highest purpose is to increase viewer chat participation, make the stream fun to watch, and minimize streamer intervention so the streamer can “거저먹는 방송”에 가까워질 수 있게 하는 것이다.

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

## 3. Core Runtime Ownership

- `config.js` owns primitives, `config/` media catalogs, and `LocalCompanionEndpoint.js` the browser-facing companion origin.
- `MessageRouter.js` routes chat; `VisualDirector.js` owns stacking; feature loaders own lazy DOM/effects; chat renderer/media controller own ordered rendering and cleanup.
- `ChzzkGateway.js` owns discovery/auth/socket recovery. `AudioManager.js` and `js/audio/` own playback/preloads; audio analysis owns measured gains.
- Hunt code lives under `js/effects/hunt/`; `HuntEffect.js` coordinates. Domain modules own perks, ATB, items, monsters, profiles, and browser I/O. Chat sets tactics, never individual attacks.
- Hunt/audio/monster importers own private evidence and compact runtime graphs. The audio review server atomically saves labels and regenerates reviewed runtime routes; keep hunt assets lazy and test load order/replay.

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
- `HuntMonsterArchetypeCatalog` owns phases/skeletons, `HuntMonsterActionPolicy` movement/targets/impacts, and `HuntMonsterTraitRuntime` cross-action state/hazards. Data supplies values; executors never branch on monster IDs.
- Typed data and isolated image transforms drive movement/facing/returns. Shared owners handle ATB, telegraphs, interruptions, landings, parts, recovery, targets, and trap immunity.
- `monster-kits/` owns review stages/editions/mechanics; registry/resolver/release policy reject fictional hooks and fail closed. Windup metadata drives telegraphs and state modifiers before impact.
- Audio uses verified cues or silence. BGM prefers verified themes then habitat pools. Hunter voices keep one profile and use labelled/extracted action banks only; exclude dialogue/NPC/gesture/video sources.
- CMC is an ordinary random fixed actor sourced only from `HIVE_CMC_VOICE_COMMANDS`; nickname ownership is UI metadata. Cart timing remains config-owned.

## 7. Monster Hunter Audio Evidence

Canonical chain:

`game action/state reference → Wwise event → bank HIRC/container → WEM/stream → decoded runtime clip`

- Record game, source, bank/event/container/stream, decoded file, purpose, evidence type, and confidence.
- Duration is never semantic evidence. It only orders review; never infer identity from it.
- Bank names prove only identity/role. Unknown semantics stay `unknown` until a reference, event, label, or verified audition establishes them.
- Action routes require semantic evidence; never fill gaps with unrelated or duration-matched sounds. VO, roars, pain, and death remain monster-identity-bound: reviewed subspecies/special forms may inherit only their base-species VO, never another species. Missing wing and physical-action SE may use audition-confirmed semantic fallback pools temporarily; elemental delivery stays exact. Preserve fallback provenance, and reject every other unresolved SE.
- Weapon fallback stays within the same weapon; item fallback stays within its semantic family and records surrogates.
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
