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

- Define observable acceptance criteria and inspect `git status` before editing. Never clean user files or unrelated dirty changes.
- Search with `rg`, read related files in batches, and reuse recorded findings. Preserve expensive discoveries about game IDs, extraction paths, formats, and verification in code or manifests.
- Work dependency-first: inventory/reference metadata → semantic mapping → selective conversion → runtime routing → UI → tests.
- Prefer resumable manifests and cheap inventories. Never decode an archive merely to discover its contents.
- Make the smallest coherent change that advances the outcome. Avoid speculative refactors while a higher-risk functional issue remains.
- Run focused tests per subsystem, then full regression and verification before handoff.
- Keep updates concise: outcome, evidence, remaining risk. Do not repeat large logs or already-recorded findings.

## 3. Core Runtime Ownership

- `config.js` owns runtime primitives; `config/` owns media catalogs; `LocalCompanionEndpoint.js` owns the localhost companion origin used by browser clients.
- `js/effects/hunt/HuntPerkCatalog.js` defines immutable perk records; `js/effects/hunt/HuntPerkRuntime.js` owns their event-driven combat behavior. Every non-empty perk needs a real runtime hook and a focused behavior test; thematic names cannot fall back to unrelated tempo or attack modifiers.
- `js/MessageRouter.js` routes chat. `js/VisualDirector.js` owns the active effect/game stack.
- `js/ChatRenderer.js` renders chat. `js/chat/ChatMediaBubbleController.js` owns ordered chat-media playback and cleanup.
- `js/ChzzkGateway.js` owns discovery, authentication, socket replacement, and broadcast-session recovery.
- `js/AudioManager.js` coordinates audio; matching, staging, and decoded playback remain under `js/audio/`.
- `scripts/generate-local-mh-audio-runtime.js` queries the ignored SQLite audio evidence catalog and compacts private manifests into `local_assets/monster_hunter/runtime-catalog.js`, including evidence-ranked per-action routes; OBS loads this script before hunt audio, while JSON fetch remains a development fallback. Regenerate it after manifest/DB changes and verify all 14 weapon groups have candidates plus the labelled-action route count.
- Weapon imports/policy/generators own private trees and the compact journey graph. `import-mhgu-monster-reference.js` compacts MHGUDB; its policy, icon harvester, and `generate-hunt-monster-catalog.js` own the merged roster, anatomy, habitats, and private media evidence. Regenerate and test after source changes.
- Hunt mechanics live under `js/effects/hunt/`; `HuntEffect.js` coordinates only. Named command, profile, journey state/flow/vote/supply/economy/reward/invasion/party, colossal, flight, and animation modules own their domains. Combat remains autonomous: chat may set team-level tactics and support intent, but it must not queue a hunter's next item or movement action. `HuntRunClient` owns browser I/O; `tools/hunt-profile-store.js` owns the ignored versioned SQLite DB.
- `js/effects/hunt/HuntAtbConfig.js` owns the full-gauge duration, authoring-to-live cadence scale, gauge conversion, and special action thresholds. Weapon actions keep stable authoring-scale timings; runtime ATB costs must be derived through this config rather than duplicating seconds or points-per-tick.

Update this section in the same patch when ownership changes.

## 4. OBS and Chzzk Lifecycle

- Production is always 1920×1080. Keep decisive content safe and reserve the bottom 15% for chat in full-screen phases.
- Routine recovery must never reload the page or destroy overlay state.
- WebSocket open is not readiness. Mark connected only after Chzzk authentication succeeds.
- Cached session IDs are hints. Re-discover on stale traffic, auth timeout, socket failure, or broadcast restart.
- Authenticate a replacement before retiring a working socket. Ignore packets from pending or retired sockets.
- Use bounded backoff with jitter. Failed status probes must not tear down a working connection.
- Prefer the OBS-lifecycle-bound Lua companion, retain bounded direct fallback, and treat the batch file as manual recovery only.
- Local `file://` DOM media uses native volume. Never route it through `createMediaElementSource` in OBS Chromium.
- Timers belong to a lifecycle owner and are cleared on phase/effect disposal.

## 5. Safety, Privacy, and Media

- Remote chat is text by default. Escape it or use `textContent`; validate emote URLs and colors through `SafeContent`.
- The companion validates loopback Host/origin, requires its HttpOnly session for APIs, and serves a real-path-contained runtime allowlist; never restore wildcard CORS or expose private roots.
- Chzzk token discovery uses companion then direct access; never route credentials through public proxies.
- Private extracted game media stays in ignored `game_extracts/` and `local_assets/monster_hunter/`. Never stage, commit, publish, or copy it into tracked runtime roots.
- Never destructively normalize originals. Preserve provenance and use measured loudness compensation.
- All text/source files are UTF-8 without BOM.
- After media mappings change, run the relevant audit and project verification.

## 6. Hunt Product Contract

- `!수렵` is a chat-participatory autobattler that remains readable, complete, and winnable with zero combat chat.
- Flow: quest board → loadout → fighting → results. Recruitment is 30 seconds and advances at four entrants; loadout is 60 seconds; combat limit is 480 seconds.
- `!참가` registers unique viewers. Four are selected fairly; empty seats use guild NPCs.
- A returning viewer starts from their last confirmed weapon, personality, 0–4 perk IDs, and lock when the local companion profile DB is available; otherwise generate them randomly. Loadout remains editable until `!준비`; standalone `!리롤` has two uses and NPCs do not reroll or persist.
- Weapon/personality choices may change repeatedly and accumulate across separate messages. Accept aliases and either token order. `!추천` chooses a compatible weapon.
- Each accepted loadout mutation plays exactly one confirmation line from that hunter's fixed voice profile; a combined weapon/personality message must not double-play, and locked or unchanged requests stay silent. Verify this in the loadout and local-audio contracts.
- During loadout, `!준비` locks that participant's weapon and personality. Guild NPCs are ready automatically; when all four hunters are ready, clear the loadout timer and start combat exactly once. Verify the locked-card visual, rejected post-ready edits, mixed human/NPC parties, and immediate departure.
- Chat controls high-level intent, votes, support, and spectacle—not every attack. Use cooldowns, shared resources, diminishing returns, deterministic ties, and sensible no-vote defaults.
- Weapon actions obey conditions, resources, combos, action locks, and valid cancel windows. Evasion cannot fire arbitrarily during an attack.
- Weapon effects anchor and scale from the resolved monster image, not the card midpoint.
- Hunter ATB uses authored cost or timing fallback; recovery continues during action lock. The turn executor spends it and the tick executor recovers/gates it. `speedGroup` is descriptive. Verify quick chains, finishers, locks, and all-weapon pacing.
- Great Sword spends ATB once per locked charge sequence. Confirmed hits clear every weapon's transient combo/counter steps while preserving durable resources and modes.
- Monster moves are typed patterns with state gates, telegraphs, cooldowns, repeat protection, variable timing, damage ratios, and targets.
- Airborne knockdowns become forced landings with the 1.5× aerial duration before flight ticking.
- Small-monster battles and Elder Dragons reject every AI, perk, and chat trap path through `HuntMonsterRules.isTrapImmune`.
- Hunter stun entry, duration, and recovery are silent; never reuse hit, cart, or arbitrary voice cues for the stun state. Verify that a hit becoming a stun suppresses its ordinary hunter reaction voice.
- Monster patterns resolve installed actions, named tables, then `PublishedMonsterBehavior`; never ship archetype guesses. Preserve source action classes and URLs, and validate every selectable kit.
- Monster windup metadata must drive a real telegraph before damage. Rage shortens and exhaustion lengthens windup; knockdown or stun cancels a pending action.
- BGM is verified dedicated theme first, then habitat-weighted non-repeating pools.
- Monster roar playback is a single verified VO event. Never layer a second roar, attack SE, ambience, or musical tail beneath it; verify every `:roar` route has exactly one runtime layer.
- One hunter keeps one voice profile for the hunt: game, language, character/voice group, and gender presentation cannot mix. CMC hunt voices come from the chat MP3 group `HIVE_CMC_VOICE_COMMANDS`, never from `AI CMC/` videos; they remain in the same random pool and are never globally fixed.
- The CMC hunter profile is one ordinary random fixed-actor candidate available to streamer, viewer, and NPC hunters alike. It is never forced by ownership or nickname; once selected, that hunter keeps it for the hunt without mixing a game actor. `HIVE_CMC_STREAMER_NICKNAMES` remains roster/UI ownership metadata only.
- Hunter voice selection uses labelled action events first. If individual events are unlabelled, a fixed actor may fall back only to an extracted player action-voice bank; explicit dialogue, NPC, and gesture banks remain excluded. Rise player-action coverage includes its `pl_voice_*_media`, `event_media`, `event_khk`, and `sv` banks; the runtime generator must not collapse this to `event_media` grunts. Production-manifest tests must cover these unlabelled-bank paths so a semantic-label gap cannot mute every hunter or discard the spoken combat calls.
- Results do not show a redundant survival label.
- A carted hunter returns at full maximum HP and receives a brief camp-return target lockout so a ready monster attack cannot erase the full-health state on the same tick.

## 7. Monster Hunter Audio Evidence

Canonical chain:

`game action/state reference → Wwise event → bank HIRC/container → WEM/stream → decoded runtime clip`

- Record game, source reference, bank, Wwise event ID/name, container/source/stream ID, decoded file, semantic purpose, evidence type, and confidence when available.
- Duration is never semantic evidence. It is only a review-order hint. Never infer a roar, attack, pain voice, item, or character identity from length.
- Bank names establish only what they encode, such as monster identity or a broad voice bank. Unknown action/purpose stays `unknown` until a game reference, event, labelled map, or verified audition establishes it.
- Action-specific runtime routing requires exact identity and semantic evidence. Never fill gaps with unrelated clicks, lasers, chat sounds, or duration matches.
- An unmapped monster attack may use a same-monster `SE` bank as an explicitly generic body/action layer, never as an exact pattern claim. Unlabelled `VO` remains forbidden because pain, idle, death, and roar cannot be distinguished safely.
- Weapon audio falls back in evidence order: exact labelled action, same-weapon semantic action, then same-weapon non-gimmick bank evidence. A missing exact map must not make an entire weapon silent or borrow another weapon's identity.
- Item-use cues are routed by item family. Healing powder must never reuse potion drinking or item-acquisition UI audio; an explicit labelled surrogate records that limitation until an exact Lifepowder event is mapped.
- Item-acquisition jingles apply a final 0.7 gain after hunt mastering so the master-volume cap cannot cancel the intended 30% attenuation; potion and combat cues are unaffected.
- `scripts/mh-audio-taxonomy.js` owns cross-game bank classification. Import labelled maps and extracted references into normalized records; do not duplicate heuristics in runtime code.
- `scripts/import-wilds-monster-audio-triggers.py` owns Wilds monster trigger/event/motion evidence and feeds the ignored reference SQLite catalog. A trigger becomes a roar only when its owning installed motion/action is identified as a roar or howl; numeric recurrence alone is not semantic proof.
- `data/hunt/wilds-weapon-codes.json` owns Wilds `Wp00`–`Wp13` identity for motion, combo, and audio tooling. Never duplicate or reorder this mapping.
- Inventory archives cheaply, resolve references, then decode relevant candidates. Builders are resumable and cannot overwrite stronger evidence with weaker guesses.
- Manifests distinguish `semanticEvidence`, `bankEvidence`, and `reviewHints` and preserve provenance.
- A completed extraction bank whose recorded outputs are all missing is automatically reopened and rebuilt; completion metadata must never make a missing runtime clip permanent.
- Keep bulk mechanics in ignored SQLite; generate small per-feature runtime data instead of loading raw catalogs into prompts or OBS.

## 8. Legacy SFX Replacement Policy

- Perform replacement only after extracted-audio semantic mapping is ready. First disable runtime references, then quarantine with an inventory/backup, verify OBS behavior, and only then remove obsolete files.
- Protect all `AI CMC/` media, the verified potion-use cue, and individually allowlisted unmistakable classic Monster Hunter sounds.
- Everything else previously added as hunt SFX is untrusted until its origin and purpose are proven. File names and subjective similarity are insufficient evidence.
- A cleanup manifest must record path, current references, decision (`keep`, `replace`, `quarantine`), reason, replacement, and verification status.
- No protected or referenced file may be deleted. Cleanup must be reversible until full tests and a 1920×1080 OBS preview pass.

## 9. UI and Accessibility

- Inspect at exactly 1920×1080. Text must be readable in OBS capture, not only close-up.
- Use unused horizontal space before shrinking type. Remove redundant labels/dead space before reducing essential information.
- Quest/loadout may use the top 85%; chat owns the bottom 15%. Combat frames may use left/right space without covering action.
- Perks look like skill badges. Loadout perks stack vertically and show their complete description at once in no more than two wrapped lines; shorten copy instead of scrolling, clipping, or ellipsizing it.
- Never ellipsize exact commands viewers need to type.

## 10. Verification Ladder

1. Syntax and focused unit test.
2. Hunt audio: `npm run test:mh-audio`, then `npm run audit:hunt`.
3. Balance/timing: `npm run simulate:hunt -- 200`, including silent and participatory modes when relevant.
4. Media/catalog: `npm run analyze:audio` if profiles change, then `npm run verify`.
5. Full regression: `npm test`.
6. UI: 1920×1080 preview of every changed phase; inspect overflow, contrast, overlap, and chat clearance.

Do not claim completion while a required step is failing or skipped without an explicit reason.

## 11. Self-Maintaining Rules

Update this file in the same change when a source owner/lifecycle/command/directory boundary changes, the same failure class appears twice, or an expensive discovery would otherwise be repeated.

Every new rule names its trigger, owner/action, and verification. Merge it into the closest section instead of appending a diary. Revise stale rules in the same patch. Keep this file under 16 KiB, UTF-8 without BOM, with unique headings. Prefer an executable test over prose.
