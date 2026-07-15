# Project Architecture and Agent Guardrails (AGENTS.md)

This file contains the structural mapping and critical development guidelines for the **BubbleChat** codebase. Refer to these guidelines during planning and execution to prevent architectural regression.

---

## 1. Project Directory Structure

```
d:/BubbleChat/
├── .agents/                    # Workspace Customizations
│   └── AGENTS.md               # [THIS FILE] Project rules & mapping
├── AI CMC/                     # Video command clips (.mp4 files)
├── Video/                      # Main video assets (overlays, loops)
├── SFX/                        # Sound effect files (.mp3, .wav)
├── BGM/                        # Background music tracks
├── js/                         # JavaScript Modules
│   ├── ConfigManager.js        # Config settings loader (config.js / LocalStorage)
│   ├── AudioManager.js         # Sound effects explorer & exclusion/rename router
│   ├── MessageRouter.js        # Main chat command interceptor & router
│   ├── VisualDirector.js       # Active overlay controller & activeGame manager
│   ├── ChatRenderer.js         # Chat bubble rendering, text filters & video commands
│   ├── SystemController.js     # Chat system utilities (demo, end etc.)
│   ├── DebugController.js      # Debug panels & simulation triggers
│   └── effects/                # Visual effects and mini-games
│       ├── hunt/               # Monster Hunter Hunt Game sub-module
│       │   ├── HuntEngine.js   # Game logic state loop (weapons, monster ATB)
│       │   ├── HuntRenderer.js # Hunt UI updates and weapon/monster DOM elements
│       │   ├── HuntAudioManager.js
│       │   ├── HuntData.js
│       │   └── HuntInitializer.js
│       ├── EffectInterface.js  # BaseEffect class definition
│       ├── CommandsScrollEffect.js # Credits roll overlay for commands
│       ├── SoundQuizEffect.js  # Audio quiz minigame
│       ├── RacingEffect.js     # Chat horse racing minigame
│       ├── RaidEffect.js       # Chat boss raid minigame
│       ├── HuntEffect.js       # Hunt minigame supervisor
│       └── [Overlays].js       # Single-trigger overlays (Usho, Skull, Valstrax etc.)
├── index.html                  # Main OBS browser source entrypoint
├── style.css                   # Custom stylesheets, fonts, and animation keyframes
├── config.html                 # Streamer dashboard config interface
└── config.js                   # central exported configuration file
```

---

## 2. Key Component Responsibilities

1. **Config Staging**: 
   - `config.js` acts as the source-of-truth configuration file. 
   - `ConfigManager.js` encapsulates configuration access, resolving properties in order: `config.js` variables -> `localStorage` overrides.
2. **Audio Staging**:
   - `AudioManager.js` coordinates all sound playing. It handles exclusions and virtual renames by mapping virtual paths to physical paths on disk dynamically before playing.
3. **Chat Commands & Directing**:
   - `MessageRouter.js` checks chat messages. Streamer commands (`!퀴즈`, `!경마`, `!레이드`, `!토벌`, `!커맨드`) trigger visual overlays in `VisualDirector.js`.
   - `VisualDirector.js` maintains an `activeGame` pointer. If a mini-game or overlay is active, standard chat messages are routed to its `.handleChat(msgData)` first.
4. **Chat Bubble & Video Overlay**:
   - `ChatRenderer.js` processes standard chat messages. It detects hashtag (`#`) prefixes to parse video commands, mounts the video player inside chat bubbles, and manages volume.

5. **Chat Connection Supervision**:
   - `ChzzkGateway.js` treats WebSocket transport-open and Chzzk authentication-ready as separate states.
   - A running OBS page must survive a Chzzk broadcast restart without reloading. The gateway periodically re-discovers the current internal chat session, obtains a fresh token, authenticates a replacement socket, and only then retires the previous socket.
   - A cached `chatChannelId` is a startup hint, not a permanent source of truth. Socket close, authentication timeout, stale protocol traffic, or a changed live-session identifier must force rediscovery.

6. **Remote Content Safety**:
   - `js/runtime/SafeContent.js` is the single policy layer for escaping remote chat text, validating HTTPS emote URLs, and constraining remote color values.

7. **Measured Audio Levels**:
   - `scripts/analyze-audio-levels.js` measures local media without modifying originals and generates `js/audio-levels.generated.js`.
   - `js/runtime/AudioLevelProfile.js` applies those file-specific gains. Decoded SFX use the shared compressor; local `file://` media uses native element volume to avoid OBS Chromium CORS muting.

---

## 3. Critical Guardrails & Behavioral Rules

### 🚨 Rule 1: No Web Audio API on Local Media Files (`file://` Protocol)
* **Problem**: OBS browser sources and local widgets are almost always loaded directly from local disks via the `file://` protocol. Under the `file://` protocol, Google Chrome/Chromium treats the files as having unique origins. Consequently, trying to connect a `<video>` or `<audio>` element to a Web Audio `AudioContext` using `createMediaElementSource(element)` triggers a CORS security block, which **silently and completely mutes the audio track**.
* **Directive**: **NEVER** use Web Audio API nodes (`AudioContext`, `createMediaElementSource`, `GainNode` routing) for DOM-played media elements if there is any chance they will run locally. Always fallback to assigning settings directly to the native element's volume property:
  ```javascript
  video.volume = Math.min(1.0, Math.max(0, masterVolume * targetVolume));
  ```

### 🏷️ Rule 2: Video Command Matching and Prefix Synchronization
* **Prefix Rule**: Reaction video overlay commands are triggered by the **`#`** prefix in chat (e.g. `#수호룡삭제`, `#천재지변`). Do not use `@` (which conflicts with Chzzk/Twitch username mentions).
* **Command-Filename Equality**: The name of the command (e.g., `수호룡삭제`) must be kept **exactly identical** to the base filename on disk (`수호룡삭제.mp4` in `AI CMC/` folder, represented in `window.HIVE_CMC_FILES` in `config.js`).
* **Listing Rule**: Never apply strict text-truncation (`text-overflow: ellipsis`) on lists intended to show command names (e.g. `CommandsScrollEffect.js`). Always display full command strings using responsive layouts (like `repeat(auto-fill, minmax(180px, 1fr))`) and `word-break: break-all` so users can see the exact spelling to type.

### ⏱️ Rule 3: Snappy Video Transitions (Early Dismissal)
* **Directive**: Web video playback often leaves a 0.5-second freeze frame or blank space at the end of clips. To maintain a snappy UI transition:
  - Add a listener for the `<video>` element's `timeupdate` event.
  - Transition or clear the overlay 0.5 seconds early if `currentTime >= duration - 0.5`.
  - Use a boolean guard (e.g. `hasTriggeredNext`) to ensure the transition is called exactly once, using the standard `ended` event as a fallback.

### 🔄 Rule 4: Active Game Reference & Stack Preservation
* **Directive**: When a temporary overlay (like `CommandsScrollEffect`) registers itself as the `this.director.activeGame` to intercept `!중단` commands:
  - It **MUST** store the existing active game reference in `this.previousActiveGame`.
  - Upon cleanup or termination, it **MUST** restore the previous game: `this.director.activeGame = this.previousActiveGame`.
  - This prevents disrupting long-running background game states (like Hunt or Quiz phases) when a streamer invokes a temporary utility overlay.

### ⏱️ Rule 6: Sequential Chat Audio Queue (Video command vs Chat sound)
* **Directive**: `#` Video commands and normal chat sounds (SFX) must never play simultaneously. To ensure sequential playback:
  - If a single message contains both video commands and SFX keywords, `ChatRenderer.js` maps their positions (via `mapIndexSpaceRemovedToOriginal`), merges them into a `unifiedQueue`, and plays them in the exact order they appeared in the text.
  - If subsequent messages (without video commands) arrive during video playback (`window._activeVideoCount > 0`), their sounds are queued in `AudioManager.pendingChatAudioQueue`.
  - When the video overlay completes, `ChatRenderer.js` decrements `window._activeVideoCount` and emits `chat:videoFinished`.
  - `AudioManager.js` listens to `chat:videoFinished` and flushes the queue sequentially.

### 🔄 Rule 7: Rules File Maintenance & Meta-Updates (AGENTS.md)
* **Directive**: If any development task introduces structural changes (e.g., adding/deleting media asset directories, creating new JavaScript modules) or alters core design constraints (e.g., adding routing layers or updating styling conventions), the agent **MUST** synchronously update this `AGENTS.md` file. This guarantees that the project layout map and critical guardrails remain 100% accurate and fresh for all future coding agents.

### 🌐 Rule 8: Strict UTF-8 Encoding Without BOM
* **Directive**: To prevent Chinese character Mojibake issues on GitHub and modern web browsers:
  - **ALL** text files, configuration files (`config.js`), source code files (`.js`, `.html`, `.css`, `.json`), and documentation (`README.md`, `AI_RULES.md`, `AGENTS.md`) **MUST** be written and saved strictly in **UTF-8 (without BOM)** encoding.
  - Never use system-default encodings like CP949 or EUC-KR on Windows environments when modifying files.
  - When writing scripts (Python, Node.js, etc.) that read, write, or generate text files:
    - Always specify `encoding='utf-8'` explicitly (e.g., `open(file, 'w', encoding='utf-8')`).
    - For Python scripts on Windows, run with the environment variable `PYTHONUTF8=1` or python command line flag `-X utf8` to ensure that python uses UTF-8 as the default encoding for file operations and standard output.

### Rule 9: OBS Chat Session Handover
* **No page reload for routine recovery**: Network recovery must restart only the gateway. It must not call `location.reload()` or destroy active games, effects, chat bubbles, or audio state.
* **Authenticated readiness**: Never emit `chzzk_connected` on `WebSocket.onopen`. Emit readiness only after the Chzzk `10100` authentication response is received.
* **Safe replacement**: During a broadcast-session handover, retain the currently authenticated socket until the replacement socket has authenticated. Ignore chat packets from pending or retired sockets to prevent duplicates.
* **Bounded retries**: Reconnects use bounded exponential backoff with jitter, and live-session monitoring failures must not tear down a working connection.

### Rule 10: Remote Chat Content Is Text by Default
* Nicknames, chat messages, winners, participants, and other Chzzk-provided values must use `textContent` or `SafeContent.escapeHTML()` before entering an HTML template.
* Only `SafeContent.renderEmotesHTML()` may turn remote chat text into rich markup. It permits escaped text plus validated HTTPS emote images.
* Remote colors must pass through `SafeContent.cssColor()` before being used in inline styles. Never interpolate an untrusted color or URL into HTML.

### Rule 11: Loudness Normalization Must Preserve Local Playback
* Never rewrite or destructively normalize source media. Store measured LUFS/true-peak compensation in `js/audio-levels.generated.js`.
* All programmatic `Audio` creation must go through `AudioManager.createNativeAudio()`. DOM media must be registered through `AudioManager.connectMediaElement()`.
* The shared compressor is collision and peak protection, not the primary loudness normalizer. File-specific measured gain is applied before it for decoded SFX and through native volume for local media.

### Rule 12: Timers Must Follow Their Owner's Lifecycle
* Effects derived from `BaseEffect` must schedule delayed work through `this.timers`. `EffectRegistry` begins a fresh execution scope and clears it when `execute()` settles, including error paths.
* Long-lived renderers and managers must own an explicit `ManagedTimers` instance and clear it when their UI, phase, or application is disposed. Hunt fight animations are cleared separately from the engine scheduler.
* Do not add raw `setTimeout()` or `setInterval()` calls to effects or UI controllers. The only exception is a pure engine's injected default scheduler, which must be replaceable by its lifecycle owner.

### Rule 13: Runtime Media References Must Be Verifiable
* `npm run verify` must pass before a release or OBS handoff. It validates both source integrity and configured runtime media assets.
* Sound-config paths are relative to `SFX/`. Visual-config paths must be explicit root-relative `./...` paths, except Random Dance pool filenames which resolve under `Video/RandomDance/`.
* After adding, removing, renaming, or replacing media, run `npm run analyze:audio` and then `npm run verify`. Do not hand-edit the generated audio-level table.

### Rule 14: Feature Data, Rules, Presentation, and Notifications Stay Separate
* Racing data lives in `RacingData.js`, deterministic selection and lookup rules in `RacingRules.js`, and racing presentation styles in `styles/racing.css`.
* Hunt monster calculations live in `HuntMonsterRules.js`; weapon-specific hunter turns execute through `HuntHunterTurnExecutor.js`. Combat animations live in `HuntCombatAnimator.js`; chat, lobby, and material popups live in `HuntNotificationRenderer.js`. `HuntRenderer` owns and delegates to both render helpers.
* Chat input cleanup must pass through `ChatMessageNormalizer` before `ChatRenderer` creates DOM. Do not reintroduce duplicate inline data tables or dynamic feature CSS.

### Rule 15: Configuration Catalogs Stay Modular and Ordered
* Runtime primitives remain in `config.js`. Sound mappings live in `config/sound-catalog.js`, visual-effect settings in `config/visual-config.js`, and chat-video commands in `config/cmc-catalog.js`.
* Load the four files in that order in both `index.html` and `config.html`. Default catalogs may fill missing globals, but must not overwrite values exported into a user-managed `config.js`.
* Any catalog move or edit must keep `tests/config-modules.test.js` and `npm run verify` passing so OBS cannot start with a partial mapping or missing media.

### Rule 16: Prefer the Local OBS Companion Without Making It Mandatory
* The recommended OBS URL is `http://127.0.0.1:17890/index.html`. `obs/bubblechat-companion.lua` starts the companion with OBS and stops it on unload; `START_OBS_OVERLAY.bat` is manual recovery only.
* `ChzzkGateway` must try the loopback companion first, while retaining direct and bounded public fallbacks when the companion is unavailable.
* The companion may proxy only the allowlisted Chzzk live-status and access-token endpoints. Keep loopback binding, OBS-parent monitoring, PID/start-time identity checks, path containment, media range support, response size limits, and request timeouts intact.
