class HuntAudioManager {
    constructor(director, config) {
        this.director = director;
        this.config = config;

        this.lobbyBgm = null;
        this.battleBgm = null;
        this.winBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgmPromise = null;
        this.winBgmPromise = null;
        this.timers = new ManagedTimers();
        this.bgmResolver = new HuntBgmResolver();
        this.lastBgmResolution = null;
        this.localAudioEntries = [];
        this.localAudioByCategory = new Map();
        this.localAudioGamePriority = ['wilds', 'world', 'rise'];
        this.hunterVoiceGamePriority = ['rise', 'wilds', 'world'];
        this.localAudioGain = 0.8;
        this.huntVolumeGain = 2;
        this.hunterVoiceProfiles = new Map();
        this.hunterVoiceCooldowns = new Map();
        this.hunterVoiceRecentPaths = new Map();
        this.whetstoneCueGenerations = new Map();
        this.hunterVoiceRoster = [];
        this.voiceProfileCatalog = [];
        this.cmcVoiceProfile = null;
        this.lastCharacterDialogueAt = 0;
        this.activeTransientAudios = new Set();
        // CMC is a chat catalog feature and must remain available even when a
        // private extracted game manifest is absent or still loading.
        this.buildHunterVoiceProfileCatalog();
        this.localAudioReady = this.loadLocalAudioManifest();
    }

    async loadLocalAudioManifest() {
        let embeddedLibraries = globalThis.HUNT_LOCAL_AUDIO_MANIFESTS
            || (typeof window !== 'undefined' && window.HUNT_LOCAL_AUDIO_MANIFESTS);
        if (!embeddedLibraries
            && typeof HuntRuntimeLoader !== 'undefined'
            && typeof HuntRuntimeLoader.loadAudioCatalog === 'function') {
            await HuntRuntimeLoader.loadAudioCatalog();
            embeddedLibraries = globalThis.HUNT_LOCAL_AUDIO_MANIFESTS
                || (typeof window !== 'undefined' && window.HUNT_LOCAL_AUDIO_MANIFESTS);
        }
        if (embeddedLibraries && typeof embeddedLibraries === 'object') {
            const libraries = this.localAudioGamePriority
                .map(game => embeddedLibraries[game] ? { game, manifest: embeddedLibraries[game] } : null)
                .filter(Boolean);
            if (libraries.length) return this.installLocalAudioLibraries(libraries, 'OBS runtime catalog');
        }
        if (typeof fetch !== 'function') return false;
        try {
            const libraries = await Promise.all(this.localAudioGamePriority.map(async game => {
                try {
                    const response = await fetch(`local_assets/monster_hunter/${game}/manifest.json`, { cache: 'no-store' });
                    if (!response.ok) return null;
                    const manifest = await response.json();
                    return { game, manifest };
                } catch (error) {
                    return null;
                }
            }));
            const available = libraries.filter(Boolean);
            if (!available.length) return false;
            return this.installLocalAudioLibraries(available, 'manifest fetch');
        } catch (error) {
            console.info('[HuntAudio] Local MH library unavailable; using fallback SFX.');
            return false;
        }
    }

    installLocalAudioLibraries(libraries, source = 'catalog') {
        this.localAudioGain = Math.max(...libraries.map(item => Number(item.manifest.defaultGain || 0.8)));
        this.localAudioEntries = libraries.flatMap(({ game, manifest }) =>
            (Array.isArray(manifest.entries) ? manifest.entries : []).map(entry => {
                if (!entry.game && Object.isExtensible(entry)) entry.game = game;
                return entry.game ? entry : { ...entry, game };
            })
        );
        this.localAudioByCategory.clear();
        this.localAudioEntries.forEach(entry => {
            if (!this.localAudioByCategory.has(entry.category)) this.localAudioByCategory.set(entry.category, []);
            this.localAudioByCategory.get(entry.category).push(entry);
        });
        this.buildHunterVoiceProfileCatalog();
        if (this.hunterVoiceRoster.length) this.assignHunterVoiceProfiles(this.hunterVoiceRoster);
        console.info(`[HuntAudio] Local MH library ready via ${source}: ${this.localAudioEntries.length} clips (${libraries.map(item => item.game).join(', ')})`);
        return this.localAudioEntries.length > 0;
    }

    selectLocalAudio(category, options = {}) {
        let pool = this.localAudioByCategory.get(category) || [];
        if (options.group) pool = pool.filter(entry => entry.group === options.group);
        if (options.weaponId) pool = pool.filter(entry => entry.weaponId === options.weaponId || entry.group === options.weaponId);
        if (options.monsterIds && options.monsterIds.length) pool = pool.filter(entry => options.monsterIds.some(id =>
            String(entry.monsterId || entry.group || '').toLowerCase().startsWith(String(id).toLowerCase())
        ));
        if (options.monsterVariants && options.monsterVariants.length) pool = pool.filter(entry => options.monsterVariants.some(id =>
            String(entry.monsterVariant || entry.monsterId || entry.group || '').toLowerCase().startsWith(String(id).toLowerCase())
        ));
        if (options.purposes && options.purposes.length) pool = pool.filter(entry => options.purposes.includes(entry.purpose));
        if (options.actionFamilies && options.actionFamilies.length) pool = pool.filter(entry => options.actionFamilies.includes(entry.actionFamily));
        if (options.semanticOnly) pool = pool.filter(entry => entry.semanticEvidence && entry.semanticEvidence.actionFamily !== 'unknown');
        if (options.bankEvidenceOnly) pool = pool.filter(entry => entry.bankEvidence && ['medium', 'high'].includes(entry.bankEvidence.level));
        if (options.groups && options.groups.length) pool = pool.filter(entry => options.groups.includes(entry.group));
        if (options.groupPrefixes && options.groupPrefixes.length) {
            pool = pool.filter(entry => options.groupPrefixes.some(prefix => String(entry.group || '').startsWith(prefix)));
        }
        if (options.sourceIncludes) {
            const needle = String(options.sourceIncludes).toLowerCase();
            pool = pool.filter(entry => String(entry.sourceBank || '').toLowerCase().includes(needle));
        }
        if (options.excludeSourceIncludes && options.excludeSourceIncludes.length) {
            pool = pool.filter(entry => !options.excludeSourceIncludes.some(needle => String(entry.sourceBank || '').toLowerCase().includes(String(needle).toLowerCase())));
        }
        if (options.languages && options.languages.length) {
            const preferred = pool.filter(entry => options.languages.includes(entry.language));
            if (preferred.length) pool = preferred;
        }
        if (options.maxDuration) pool = pool.filter(entry => Number(entry.duration || 0) <= options.maxDuration);
        if (options.minDuration) pool = pool.filter(entry => Number(entry.duration || 0) >= options.minDuration);
        if (options.preferGames !== false && pool.length) {
            const priority = options.preferGames || this.localAudioGamePriority;
            const best = priority.find(game => pool.some(entry => entry.game === game));
            if (best) pool = pool.filter(entry => entry.game === best);
        }
        if (!pool.length) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    playLocalAudio(category, options = {}) {
        const entry = this.selectLocalAudio(category, options);
        if (!entry) return false;
        return this.playLocalEntry(entry, options);
    }

    huntVolume(volume) {
        return Math.min(1, Math.max(0, Number(volume || 0) * this.huntVolumeGain));
    }

    playConfiguredSound(input, type = 'visual') {
        if (!input || !this.director.audioManager?.playSound) return false;
        const boost = item => {
            if (typeof item === 'string') return { src: item, volume: this.huntVolume(0.5) };
            if (item && typeof item === 'object' && item.src) {
                return { ...item, volume: this.huntVolume(item.volume ?? 0.5) };
            }
            return item;
        };
        const boosted = Array.isArray(input) ? input.map(boost) : boost(input);
        this.director.audioManager.playSound(boosted, { force: true, type });
        return true;
    }

    playLocalEntry(entry, options = {}) {
        if (!entry) return false;
        try {
            const audio = this.director.audioManager.createNativeAudio(entry.path, {
                type: 'sfx',
                baseVolume: this.huntVolume(Number(options.volume ?? 0.7) * this.localAudioGain)
            });
            audio.play().catch(() => {});
            return true;
        } catch (error) {
            return false;
        }
    }

    isHunterActionVoiceEntry(entry) {
        const bank = String(entry?.sourceBank || '');
        if (/PL_Dia_|clb_npc|clb_Gesture/i.test(bank)) return false;
        return /Player_ActVoice_|pl_act_vo_|pl_voice_[a-z]_[0-9]+_(?:(?:event(?:_khk)?|sv)_)?media/i.test(bank);
    }

    buildHunterVoiceProfileCatalog() {
        const profiles = new Map();
        (this.localAudioByCategory.get('hunter_voice') || []).forEach(entry => {
            const duration = Number(entry.duration || 0);
            if (!duration || duration > 7 || /\[pre\]/i.test(String(entry.sourceStream || ''))) return;
            const game = String(entry.game || 'rise');
            const language = String(entry.language || 'neutral');
            const group = String(entry.group || 'common');
            const key = `${game}:${language}:${group}`;
            if (!profiles.has(key)) {
                profiles.set(key, {
                    key,
                    game,
                    language,
                    group,
                    isDlc: /^(?:d|c|s)_/i.test(group),
                    entries: []
                });
            }
            profiles.get(key).entries.push(entry);
        });
        const languageRank = { ja: 0, fc: 1, en: 2, neutral: 3 };
        const candidates = [...profiles.values()];
        const combatReady = candidates.filter(profile => profile.entries.some(entry =>
            (entry.semanticEvidence && entry.semanticEvidence.actionFamily !== 'unknown')
            || this.isHunterActionVoiceEntry(entry)
        ));
        this.voiceProfileCatalog = (combatReady.length ? combatReady : candidates).sort((a, b) =>
            this.hunterVoiceGamePriority.indexOf(a.game) - this.hunterVoiceGamePriority.indexOf(b.game)
            || (languageRank[a.language] ?? 9) - (languageRank[b.language] ?? 9)
            || a.group.localeCompare(b.group)
        );
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const cmcEntries = (globalScope.HIVE_CMC_VOICE_COMMANDS || []).flatMap(cueName => {
            const configured = globalScope.HIVE_SOUND_CONFIG?.[cueName];
            const variants = Array.isArray(configured) ? configured : configured ? [configured] : [];
            return variants.filter(variant => variant?.src).map((variant, variantIndex) => {
                const path = String(variant.src).startsWith('SFX/')
                    ? String(variant.src)
                    : `SFX/${variant.src}`;
                return {
                    path,
                    category: 'cmc_voice',
                    group: 'cmc',
                    language: 'ko',
                    duration: Number(globalScope.HIVE_AUDIO_LEVELS?.[path]?.duration || 0),
                    volume: Number(variant.volume ?? 0.7),
                    cueName,
                    variantIndex,
                    isCmc: true
                };
            });
        });
        this.cmcVoiceProfile = cmcEntries.length
            ? {
                key: 'chat:cmc',
                game: 'chat-catalog',
                language: 'ko',
                group: 'cmc',
                source: 'HIVE_CMC_VOICE_COMMANDS',
                isCmc: true,
                entries: cmcEntries
            }
            : null;
        return this.voiceProfileCatalog;
    }

    voiceProfileHash(value) {
        let hash = 2166136261;
        for (const char of String(value || '')) {
            hash ^= char.charCodeAt(0);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    assignHunterVoiceProfiles(hunters = []) {
        this.hunterVoiceRoster = hunters;
        this.hunterVoiceProfiles.clear();
        this.hunterVoiceCooldowns.clear();
        this.hunterVoiceRecentPaths.clear();
        if (!this.voiceProfileCatalog.length && !this.cmcVoiceProfile) return false;

        const japanese = this.voiceProfileCatalog.filter(profile => profile.language === 'ja');
        const hunterCount = hunters.length;
        const localized = japanese.length >= hunterCount ? japanese : this.voiceProfileCatalog;
        const preferredGame = this.hunterVoiceGamePriority.find(game =>
            localized.filter(profile => profile.game === game).length >= hunterCount
        );
        const gameProfiles = preferredGame
            ? localized.filter(profile => profile.game === preferredGame)
            : localized;
        const available = this.cmcVoiceProfile ? [...gameProfiles, this.cmcVoiceProfile] : gameProfiles;
        const used = new Set();

        const pick = (pool, seed) => {
            const source = pool.length ? pool : available;
            const start = this.voiceProfileHash(seed) % source.length;
            for (let offset = 0; offset < source.length; offset++) {
                const candidate = source[(start + offset) % source.length];
                if (!used.has(candidate.key)) return candidate;
            }
            return source[start];
        };

        hunters.forEach((hunter, position) => {
            const index = Number(hunter.index ?? position);
            const profile = pick(available, `${hunter.hunterName || 'hunter'}:${hunter.index ?? position}`);
            if (!profile) return;
            used.add(profile.key);
            this.hunterVoiceProfiles.set(index, profile);
            hunter.voiceProfile = {
                key: profile.key,
                game: profile.game,
                language: profile.language,
                group: profile.group,
                source: profile.source,
                isDlc: profile.isDlc,
                isCmc: Boolean(profile.isCmc)
            };
        });
        return this.hunterVoiceProfiles.size > 0;
    }

    prepareHunterVoiceProfiles(hunters = []) {
        this.hunterVoiceRoster = hunters;
        if (this.voiceProfileCatalog.length) return Promise.resolve(this.assignHunterVoiceProfiles(hunters));
        return this.localAudioReady.then(() => this.assignHunterVoiceProfiles(hunters));
    }

    selectHunterActionVoice(hunterIndex, action = 'attack', options = {}) {
        if (!this.hunterVoiceProfiles.has(Number(hunterIndex)) && this.hunterVoiceRoster.length && this.voiceProfileCatalog.length) {
            this.assignHunterVoiceProfiles(this.hunterVoiceRoster);
        }
        const profile = this.hunterVoiceProfiles.get(Number(hunterIndex));
        if (!profile || profile.isCmc) return null;
        const families = {
            attack: ['attack_effort', 'short_combat_call'],
            attack_heavy: ['heavy_attack_effort', 'attack_effort', 'short_combat_call'],
            hit: ['hit_reaction', 'pain_reaction'],
            evade: ['evade_call'],
            guard: ['guard_call', 'hit_reaction'],
            item: ['item_call'],
            cart: ['cart_call', 'pain_reaction'],
            victory: ['victory_call'],
            support: ['support_call', 'item_call'],
            ready: ['support_call', 'victory_call', 'short_combat_call'],
            loadout: ['short_combat_call', 'support_call', 'victory_call', 'attack_effort', 'heavy_attack_effort', 'guard_call', 'evade_call', 'item_call']
        };
        const wanted = families[action] || families.attack;
        const pool = profile.entries.filter(entry => wanted.includes(entry.semanticEvidence?.actionFamily));
        if (options.preferLong) {
            const longEnough = entry => Number(entry.duration || 0) >= Number(options.minDuration || 0.9);
            const wantedLong = pool.filter(longEnough);
            if (wantedLong.length) return this.pickHunterVoiceEntry(hunterIndex, wantedLong);
            const anyLongActionVoice = profile.entries.filter(entry => longEnough(entry) && (
                (entry.semanticEvidence?.actionFamily && entry.semanticEvidence.actionFamily !== 'unknown')
                || this.isHunterActionVoiceEntry(entry)
            ));
            if (anyLongActionVoice.length) return this.pickHunterVoiceEntry(hunterIndex, anyLongActionVoice);
        }
        if (pool.length) return this.pickHunterVoiceEntry(hunterIndex, pool);

        // The extracted banks currently prove the actor and that these are
        // player action voices, but most individual WEM events are not yet
        // labelled by purpose. Keep the actor fixed and allow that proven
        // action-voice bank as an unclassified fallback instead of muting the
        // hunter. Explicit dialogue, NPC and gesture banks remain excluded.
        const actionVoicePool = profile.entries.filter(entry => this.isHunterActionVoiceEntry(entry));
        return actionVoicePool.length ? this.pickHunterVoiceEntry(hunterIndex, actionVoicePool) : null;
    }

    pickHunterVoiceEntry(hunterIndex, pool = []) {
        if (!pool.length) return null;
        const key = Number(hunterIndex);
        const recent = this.hunterVoiceRecentPaths.get(key) || [];
        const fresh = pool.filter(entry => !recent.includes(entry.path));
        const choices = fresh.length ? fresh : pool;
        const selected = choices[Math.floor(Math.random() * choices.length)] || null;
        if (selected?.path) {
            this.hunterVoiceRecentPaths.set(key, [...recent, selected.path].slice(-8));
        }
        return selected;
    }

    selectCmcActionVoice(action = 'attack', options = {}) {
        if (!this.cmcVoiceProfile) return null;
        const cuePools = {
            attack: ['야!', '가자', '따사!', '조룡!', '발차기!', '아스아!'],
            attack_heavy: ['아스아!', '기폭용항', '수면참!', '다단히트!', '아주강력해'],
            hit: ['아야!', '으악!', '윽!', '살려조', '죽겠는데'],
            cart: ['죽는다', '죽겠는데', '아이고~', '안 돼!'],
            evade: ['회피', '도망쳐', '어디가냐', '내려와!'],
            guard: ['가드성공', '가드만', '팅!'],
            item: ['아이템박스', '밥먹어', '밥먹자', '야무지게먹어'],
            support: ['가자', '나이스', '걱정마'],
            ready: ['가자', '나이스', '걱정마', '성공!', '아주강력해'],
            victory: ['나이스', '성공!', '갓겜', '기쁨이폭발', '존잼']
        };
        const preferred = cuePools[action] || cuePools.attack;
        const semanticPool = this.cmcVoiceProfile.entries.filter(entry => preferred.some(cue => String(entry.cueName || '').startsWith(cue)));
        let pool = semanticPool.length ? semanticPool : this.cmcVoiceProfile.entries;
        if (options.preferLong) {
            const longPool = pool.filter(entry => Number(entry.duration || 0) >= Number(options.minDuration || 0.9));
            const anyLong = this.cmcVoiceProfile.entries.filter(entry => Number(entry.duration || 0) >= Number(options.minDuration || 0.9));
            pool = longPool.length ? longPool : (anyLong.length ? anyLong : pool);
        }
        return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    }

    playHunterActionVoice(hunterIndex, action = 'attack', options = {}) {
        if (hunterIndex === undefined || hunterIndex === null) return false;
        const key = Number(hunterIndex);
        if (!this.hunterVoiceProfiles.has(key) && this.hunterVoiceRoster.length) {
            this.assignHunterVoiceProfiles(this.hunterVoiceRoster);
        }
        const profile = this.hunterVoiceProfiles.get(key);
        // Generic combat voices are deliberately sparse, but applying their
        // low chance unchanged can leave the owner profile silent for too long.
        const requestedChance = Number(options.chance ?? 1);
        const chance = profile?.isCmc && !options.force ? Math.max(requestedChance, .72) : requestedChance;
        if (!options.force && Math.random() > chance) return false;
        const now = Date.now();
        if (!options.force && now < Number(this.hunterVoiceCooldowns.get(key) || 0)) return false;
        const entry = profile?.isCmc
            ? this.selectCmcActionVoice(action, options)
            : this.selectHunterActionVoice(key, action, options);
        if (!entry) return false;
        const played = this.playLocalEntry(entry, { volume: options.volume ?? entry.volume ?? 0.56 });
        if (played) this.hunterVoiceCooldowns.set(key, now + Number(options.cooldownMs ?? (profile?.isCmc ? 850 : 1100)));
        return played;
    }

    playLoadoutConfirmationVoice(hunter, change = {}) {
        if (!hunter || hunter.index === undefined || hunter.index === null) return false;
        const personalityActions = {
            defensive: 'guard',
            support: 'support',
            offensive: 'attack_heavy',
            veteran: 'attack',
            newbie: 'attack',
            normal: 'attack'
        };
        const heavyWeapons = new Set(['great_sword', 'hammer', 'hunting_horn', 'gunlance', 'heavy_bowgun', 'charge_blade']);
        const action = change.personalityChanged
            ? (personalityActions[hunter.personality] || 'attack')
            : (heavyWeapons.has(hunter.id) ? 'attack_heavy' : 'attack');
        const options = {
            force: true,
            cooldownMs: 850,
            volume: 0.54,
            preferLong: true,
            minDuration: 0.9
        };
        if (this.playHunterActionVoice(hunter.index, action, options)) return true;
        return this.playHunterActionVoice(hunter.index, 'loadout', options);
    }

    playReadyConfirmationVoice(hunter) {
        if (!hunter || hunter.index === undefined || hunter.index === null) return false;
        const options = { force: true, cooldownMs: 1100, volume: 0.56, preferLong: true, minDuration: 0.9 };
        if (this.playHunterActionVoice(hunter.index, 'ready', options)) return true;
        return this.playHunterActionVoice(hunter.index, 'loadout', options);
    }

    weaponGroup(weaponId) {
        return ({
            great_sword: 'g_swd', long_sword: 'l_swd', sword_shield: 's_swd', dual_blades: 'd_bld',
            hammer: 'ham', hunting_horn: 'hrn', lance: 'lan', gunlance: 'g_lan', switch_axe: 's_axe',
            charge_blade: 'c_axe', insect_glaive: 'i_gla', light_bowgun: 'l_bg', heavy_bowgun: 'h_bg', bow: 'bow'
        })[weaponId] || null;
    }

    weaponCommonBank(weaponId) {
        const group = this.weaponGroup(weaponId);
        return group ? `pl_wp_${group}_com_media` : null;
    }

    verifiedWeaponCue(weaponId, cue) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const variants = globalScope.HUNT_VERIFIED_LOCAL_WEAPON_CUES?.[`${weaponId}:${cue}`];
        if (!Array.isArray(variants) || !variants.length) return null;
        return variants[Math.floor(Math.random() * variants.length)] || null;
    }

    playVerifiedWeaponCue(weaponId, cue) {
        const variant = this.verifiedWeaponCue(weaponId, cue);
        return this.playVerifiedLayers(variant);
    }

    playVerifiedItemCue(cue) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const variants = globalScope.HUNT_VERIFIED_LOCAL_ITEM_CUES?.[cue];
        if (!Array.isArray(variants) || !variants.length) return false;
        return this.playVerifiedLayers(variants[Math.floor(Math.random() * variants.length)]);
    }

    playItemSurrogateCue(cue) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const variants = globalScope.HUNT_LOCAL_ITEM_SURROGATE_CUES?.[cue];
        if (!Array.isArray(variants) || !variants.length) return false;
        return this.playVerifiedLayers(variants[Math.floor(Math.random() * variants.length)]);
    }

    playWhetstoneCue(context = {}) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const variants = globalScope.HUNT_VERIFIED_LOCAL_ITEM_CUES?.whetstone_stroke;
        if (!Array.isArray(variants) || !variants.length) return false;
        const variant = variants[Math.floor(Math.random() * variants.length)];
        const layers = Array.isArray(variant?.layers) ? variant.layers : [];
        if (!layers.length) return false;

        // Combat ticks run at 100 ms. Fit the three confirmed sharpening strokes
        // across the actual item lock. The separate completion glint is fired by
        // HuntBattleTickExecutor only after sharpness is successfully restored.
        const strokeDurationMs = 544;
        const durationMs = Math.max(strokeDurationMs, Number(context.durationTicks || 30) * 100);
        const cadenceWindowMs = Math.max(0, durationMs - strokeDurationMs);
        const hunterKey = String(context.hunterIndex ?? 'global');
        const generation = Number(this.whetstoneCueGenerations.get(hunterKey) || 0) + 1;
        this.whetstoneCueGenerations.set(hunterKey, generation);
        let scheduled = false;
        layers.forEach(([path, volume = 0.85], index) => {
            if (!path) return;
            const delayMs = layers.length > 1
                ? Math.round(cadenceWindowMs * index / (layers.length - 1))
                : 0;
            const play = () => {
                if (this.whetstoneCueGenerations.get(hunterKey) !== generation) return;
                this.playLocalEntry({ path }, { volume });
            };
            if (delayMs > 0) this.timers.timeout(play, delayMs);
            else play();
            scheduled = true;
        });
        return scheduled;
    }

    cancelWhetstoneCue(hunterIndex) {
        const hunterKey = String(hunterIndex ?? 'global');
        const generation = Number(this.whetstoneCueGenerations.get(hunterKey) || 0) + 1;
        this.whetstoneCueGenerations.set(hunterKey, generation);
    }

    playVerifiedHitCue(cueKey) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const variants = globalScope.HUNT_VERIFIED_HIT_CUES?.[cueKey];
        if (!Array.isArray(variants) || !variants.length) return false;
        return this.playVerifiedLayers(variants[Math.floor(Math.random() * variants.length)]);
    }

    playVerifiedLayers(variant) {
        if (!variant || !Array.isArray(variant.layers) || !variant.layers.length) return false;
        let scheduled = false;
        variant.layers.forEach(([path, volume = 0.65, delayMs = 0]) => {
            if (!path) return;
            const play = () => this.playLocalEntry({ path }, {
                volume,
                maxDurationMs: variant.maxDurationMs
            });
            if (Number(delayMs) > 0) this.timers.timeout(play, Number(delayMs));
            else play();
            scheduled = true;
        });
        return scheduled;
    }

    monsterCueLayersForPhase(variant, audioPhase = null) {
        const layers = Array.isArray(variant?.layers) ? variant.layers : [];
        if (!audioPhase) return layers;
        const phase = String(audioPhase).toLowerCase();
        if (!['action-start', 'impact'].includes(phase)) return layers;
        const explicitPhase = String(variant.audioPhase || '').toLowerCase();
        if (explicitPhase) return explicitPhase === phase ? layers : [];
        const wantsVocal = phase === 'action-start';
        const semanticTag = String(variant.semanticTag || '').toLowerCase();
        const sourceBank = String(variant.sourceBank || '').toLowerCase();
        const taggedVocal = /(?:vocal|voice)/.test(semanticTag) || /(?:^|_)vo(?:_|$)/.test(sourceBank);
        const taggedSoundEffect = /(?:^|_)se(?:_|$)/.test(sourceBank);
        return layers.filter(([audioPath]) => {
            const path = String(audioPath || '').toLowerCase();
            const isVocal = path.includes('_vo_') || taggedVocal;
            const isSoundEffect = path.includes('_se_') || taggedSoundEffect;
            if (wantsVocal) return isVocal && !isSoundEffect;
            return isSoundEffect && !isVocal;
        });
    }

    verifiedMonsterCue(monster, kind = 'attack', options = {}) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const catalog = globalScope.HUNT_VERIFIED_LOCAL_MONSTER_CUES || {};
        const monsterId = String(monster && monster.id ? monster.id : monster || '')
            .toLowerCase()
            .replace(/[-']/g, '_');
        if (!monsterId) return null;
        const normalizedKind = String(kind || 'attack').toLowerCase();
        const roarRoutes = globalScope.HUNT_ROAR_ROUTE || {};
        // Family routing may supply an exact reviewed semantic cue (roar,
        // Bazelgeuse scale explosion, etc.). Broad `attack` pools stay local so
        // variant-specific physical/elemental SE cannot leak across forms.
        const routedMonsterId = ['roar', 'blast_scale_explosion'].includes(normalizedKind)
            ? roarRoutes[monsterId]
            : null;
        const routeKeys = [`${monsterId}:${normalizedKind}`];
        if (routedMonsterId && routedMonsterId !== monsterId) routeKeys.push(`${routedMonsterId}:${normalizedKind}`);
        let variants = routeKeys.flatMap(key => Array.isArray(catalog[key]) ? catalog[key] : []);
        // Exact semantic routes win as a set. Mixing the broad attack pool into
        // an existing telegraph/reaction route made confirmed release voices
        // randomly lose to generic aerial or body sounds.
        if (!variants.length
            && normalizedKind !== 'roar'
            && normalizedKind !== 'attack'
            && normalizedKind !== 'projectile_launch') {
            variants = Array.isArray(catalog[`${monsterId}:attack`])
                ? catalog[`${monsterId}:attack`]
                : [];
        }
        if (!variants.length) return null;
        const patternText = [
            options.patternId,
            options.patternName,
            options.patternType,
            ...(Array.isArray(options.patternTags) ? options.patternTags : []),
            options.patternDelivery,
            normalizedKind
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        const matched = variants.filter(variant => {
            if (!Array.isArray(variant.patternKeywords) || !variant.patternKeywords.length) return true;
            return variant.patternKeywords.some(keyword => patternText.includes(String(keyword).toLowerCase()));
        }).filter(variant => this.monsterCueLayersForPhase(variant, options.audioPhase).length > 0);
        if (!matched.length) return null;
        return matched[Math.floor(Math.random() * matched.length)] || null;
    }

    playVerifiedMonsterCue(monster, kind = 'attack', options = {}) {
        const variant = this.verifiedMonsterCue(monster, kind, options);
        if (variant && options.audioPhase) {
            return this.playVerifiedLayers({
                ...variant,
                layers: this.monsterCueLayersForPhase(variant, options.audioPhase)
            });
        }
        // A roar is one creature voice event. Layering a second VO/SE clip here
        // sounds like unrelated ambience under the roar and can linger after it.
        if (String(kind).toLowerCase() === 'roar' && Array.isArray(variant?.layers)) {
            return this.playVerifiedLayers({ ...variant, layers: variant.layers.slice(0, 1) });
        }
        if (String(kind).toLowerCase() === 'telegraph'
            && Array.isArray(variant?.layers)
            && Array.isArray(variant.telegraphReleaseLayerIndices)) {
            const telegraphMs = Math.max(100, Number(options.durationTicks || 1) * 100);
            const releaseAt = Math.max(0, telegraphMs - Number(variant.telegraphReleaseLeadMs || 150));
            const releaseIndices = new Set(variant.telegraphReleaseLayerIndices.map(Number));
            const layers = variant.layers.map((layer, index) =>
                releaseIndices.has(index) ? [layer[0], layer[1], releaseAt] : layer);
            return this.playVerifiedLayers({ ...variant, layers });
        }
        return this.playVerifiedLayers(variant);
    }

    playEvidenceRankedWeaponAction(weaponId, actionId) {
        if (!actionId || !String(actionId).startsWith(`${weaponId}.`)) return false;
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const variants = globalScope.HUNT_LOCAL_WEAPON_ACTION_ROUTES?.[actionId];
        if (!Array.isArray(variants) || !variants.length) return false;
        const bestScore = Math.max(...variants.map(variant => Number(variant.score || 0)));
        const strongest = variants.filter(variant => Number(variant.score || 0) >= bestScore - 12);
        const selected = strongest[Math.floor(Math.random() * strongest.length)];
        return this.playLocalEntry(selected, { volume: 0.64 });
    }

    playWeaponAction(weaponId, cue = 'attack', context = {}) {
        const group = this.weaponGroup(weaponId);
        if (!group) return false;

        // Exact labelled actions remain authoritative. When an action-specific
        // event has not been mapped yet, use audio proven to belong to the same weapon.
        // Action effect banks (epvsp) are prioritized over common banks, and non-attack clips
        // (gimmick, wirebug, sheathing, slinger, ui) are strictly excluded.
        if (this.playVerifiedWeaponCue(weaponId, cue)) return true;

        // Never fall back to the generic bow bank for draw/release cues: it
        // contains the removed string-pull and creak layers.
        const exactOnlyBowCues = new Set([
            'bow_charge_start', 'bow_charge_step', 'bow_shot',
            'bow_charged_shot', 'bow_power_shot', 'dragon_piercer'
        ]);
        if (weaponId === 'bow' && exactOnlyBowCues.has(String(cue))) return false;

        if (this.playEvidenceRankedWeaponAction(weaponId, context.actionId)) return true;

        const nonAttackExclusions = ['gimmick', 'wirebug', 'slinger', 'sheath', 'ui'];

        if (this.playLocalAudio('weapon', {
            weaponId,
            actionFamilies: [cue, 'weapon_action'],
            semanticOnly: true,
            excludeSourceIncludes: nonAttackExclusions,
            preferGames: ['world', 'rise'],
            volume: 0.64
        })) return true;

        if (this.playLocalAudio('weapon', {
            weaponId,
            bankEvidenceOnly: true,
            sourceIncludes: 'epvsp',
            excludeSourceIncludes: nonAttackExclusions,
            preferGames: ['world', 'rise'],
            volume: 0.58
        })) return true;

        return this.playLocalAudio('weapon', {
            weaponId,
            bankEvidenceOnly: true,
            excludeSourceIncludes: nonAttackExclusions,
            preferGames: ['world', 'rise'],
            volume: 0.58
        });
    }

    monsterGroup(monsterId) {
        const clean = String(monsterId || '').toLowerCase();
        // Internal IDs are stable Capcom enemy-file identities. Variant suffixes
        // are retained so a subspecies never borrows the base monster by accident.
        const routes = {
            ancient_leshen: 'em127_01', leshen: 'em127', anjanath: 'em100', fulgur_anjanath: 'em100_01',
            barroth: 'em044', bazelgeuse: 'em118', seething_bazelgeuse: 'em118_05', behemoth: 'em121',
            deviljho: 'em043', savage_deviljho: 'em043_05', dodogama: 'em116', great_girros: 'em112',
            great_jagras: 'em101', jyuratodus: 'em108', kirin: 'em011', kulu_ya_ku: 'em107',
            kulve_taroth: 'em117', lavasioth: 'em036', legiana: 'em111', shrieking_legiana: 'em111_05',
            lunastra: 'em026', nergigante: 'em103', ruiner_nergigante: 'em103_05', odogaron: 'em113',
            ebony_odogaron: 'em113_01', paolumu: 'em110', nightshade_paolumu: 'em110_01',
            pukei_pukei: 'em102', coral_pukei_pukei: 'em102_01', radobaan: 'em114', tzitzi_ya_ku: 'em120',
            uragaan: 'em045', vaal_hazak: 'em115', blackveil_vaal_hazak: 'em115_05', xeno_jiiva: 'em105',
            zorah_magdaros: 'em106', alatreon: 'em050', banbaro: 'em123', beotodus: 'em122',
            namielle: 'em125', shara_ishvalda: 'em126', safi_jiiva: 'em104', yian_garuga: 'em018',
            scarred_yian_garuga: 'em018_05',
            pink_rathian: 'em001_01', gold_rathian: 'em001_02', rathian: 'em001',
            azure_rathalos: 'em002_01', silver_rathalos: 'em002_02', rathalos: 'em002',
            black_diablos: 'em007_01', diablos: 'em007', rajang: 'em023', furious_rajang: 'em023_05',
            kushala_daora: 'em024', chameleos: 'em025', teostra: 'em027', tigrex: 'em032', nargacuga: 'em037',
            barioth: 'em042', royal_ludroth: 'em047', zinogre: 'em057', amatsu: 'em058', brachydios: 'em063',
            gore_magala: 'em071', shagaru_magala: 'em072', seregios: 'em077', glavenus: 'em080',
            mizutsune: 'em082', valstrax: 'em086', crimson_glow_valstrax: 'em086', velkhana: 'em124'
        };
        const normalized = clean.replace(/[-']/g, '_');
        const direct = routes[normalized];
        if (direct) return direct;
        const family = Object.keys(routes).find(id => normalized.includes(id));
        return family ? routes[family] : null;
    }

    normalizedMonsterAudioKind(kind) {
        const normalized = String(kind || 'attack').toLowerCase();
        return new Set([
            'attack', 'roar', 'telegraph', 'death', 'flinch',
            'knockdown', 'trap', 'ultimate', 'burrow', 'charge_stride_step', 'projectile_launch'
        ]).has(normalized) ? normalized : 'attack';
    }

    monsterSeFallbackTag(kind, options = {}) {
        if (this.normalizedMonsterAudioKind(kind) !== 'attack') return null;
        const text = [
            options.patternId,
            options.patternName,
            options.patternType,
            kind
        ].filter(Boolean).join(' ').toLowerCase();
        if (/(?:air|aerial|flight|fly|glide|wing|비행|날개|활공)/.test(text)) return 'wing_flap';
        if (/(?:breath|fireball|projectile|laser|beam|gas|tornado|thunder|element|브레스|화염|투사체|가스|회오리|번개)/.test(text)) {
            return null;
        }
        if (/(?:impact|hit|slam|stomp|charge|rush|tackle|tail|bite|claw|kick|sweep|physical|body|돌진|충돌|내려찍|몸통|박치기|꼬리|깨물|발톱|후려|휘두)/.test(text)) {
            return 'physical_impact';
        }
        return 'physical_attack';
    }

    playGenericMonsterSeFallback(kind, options = {}) {
        // Physical/wing SE belongs to contact or authored movement events. Playing
        // it while an action is merely announced makes every hit sound early.
        if (String(options.audioPhase || '').toLowerCase() === 'action-start') return false;
        const tag = this.monsterSeFallbackTag(kind, options);
        if (!tag) return false;
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const variants = globalScope.HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES?.[tag];
        if (!Array.isArray(variants) || !variants.length) return false;
        const selected = variants[Math.floor(Math.random() * variants.length)];
        if ((selected.layers || []).some(([audioPath]) => String(audioPath).includes('_vo_'))) return false;
        return this.playVerifiedLayers(selected);
    }

    // User-mapped per-pattern audio (review tool) wins over every catalog route.
    // Keyed monster -> patternId -> phase slot; see monster-audio-phase-standard.md.
    patternAudioRoute(monsterId, patternId, slot) {
        if (!monsterId || !patternId || !slot) return null;
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const map = globalScope.HUNT_MONSTER_PATTERN_AUDIO_ROUTES;
        if (!map) return null;
        const candidates = [monsterId, String(monsterId).toLowerCase(), this.monsterGroup?.(monsterId)];
        for (const id of candidates) {
            const route = id && map[id]?.[patternId]?.[slot];
            if (route && Array.isArray(route.layers) && route.layers.length) return route;
        }
        return null;
    }

    static resolveOverrideSlot(kind, options = {}) {
        if (options.patternSlot) return options.patternSlot;
        const normalized = String(kind || '').toLowerCase();
        if (normalized === 'telegraph') return 'telegraph';
        if (normalized === 'projectile_launch') return 'launch';
        if (normalized === 'charge_stride_step') return 'travel';
        if (normalized === 'roar') return 'roar';
        if (normalized === 'burrow') return 'burrow';
        if (String(options.audioPhase || '').toLowerCase() === 'action-start') return 'start';
        return null;
    }

    playMonsterAction(monster, kind = 'attack', options = {}) {
        const actionKind = this.normalizedMonsterAudioKind(kind);
        const monsterId = monster && monster.id ? monster.id : monster;
        const overrideSlot = HuntAudioManager.resolveOverrideSlot(kind, options);
        if (options.patternId && overrideSlot) {
            const route = this.patternAudioRoute(monsterId, options.patternId, overrideSlot);
            if (route) return this.playVerifiedLayers(route);
            if (options.overrideOnly) return false;
        }
        const normalizedMonsterId = String(monsterId || '').toLowerCase().replace(/[-']/g, '_');
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const silentVoiceIds = new Set(globalScope.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS || []);
        const routedVoiceId = (globalScope.HUNT_ROAR_ROUTE || {})[normalizedMonsterId] || normalizedMonsterId;
        if (silentVoiceIds.has(normalizedMonsterId) || silentVoiceIds.has(routedVoiceId)) {
            if (['roar', 'telegraph', 'death', 'flinch', 'knockdown', 'trap'].includes(actionKind)) return false;
        }
        if (actionKind === 'roar'
            && monster && typeof monster === 'object'
            && monster.roar?.status
            && monster.roar.status !== 'verified-present') return false;
        if (this.playVerifiedMonsterCue(monster, actionKind, options)) return true;
        if (this.playGenericMonsterSeFallback(actionKind, options)) return true;
        if (['telegraph', 'death', 'flinch', 'knockdown', 'trap'].includes(actionKind)) {
            // These semantic moments are VO-sensitive. Silence is safer than
            // substituting an arbitrary same-bank pain, idle, death, or roar clip.
            return false;
        }
        const routedMonsterId = actionKind === 'roar'
            ? ((globalScope.HUNT_ROAR_ROUTE || {})[String(monsterId || '').replace(/[-']/g, '_')] || monsterId)
            : monsterId;
        const group = this.monsterGroup(routedMonsterId);
        if (!group) return false;
        if (actionKind === 'roar') {
            return this.playLocalAudio('monster', {
                monsterIds: [group],
                actionFamilies: ['monster_roar'],
                semanticOnly: true,
                preferGames: ['world'],
                volume: 0.78
            });
        }
        // Do not replace an unresolved semantic slot with an arbitrary same-bank
        // clip. Only the audition-confirmed generic SE families above may cross
        // species; creature voices never do.
        return false;
    }

    playHunterVoice(options = {}) {
        if (options.hunterIndex !== undefined && options.hunterIndex !== null) {
            return this.playHunterActionVoice(options.hunterIndex, options.action || 'attack', options);
        }
        return this.playLocalAudio('hunter_voice', {
            languages: options.languages || ['ja', 'fc', 'en', 'neutral'],
            minDuration: 0.25,
            maxDuration: options.maxDuration || 4.5,
            volume: options.volume || 0.58
        });
    }

    playCharacterDialogue(moment = 'ambient', options = {}) {
        const now = Date.now();
        const cooldownMs = Number(options.cooldownMs ?? 12000);
        if (!options.force && now - this.lastCharacterDialogueAt < cooldownMs) return false;

        const common = {
            languages: options.languages || ['ja', 'fc', 'en', 'neutral'],
            minDuration: 0.45,
            maxDuration: options.maxDuration || 7,
            volume: options.volume || 0.54
        };
        let played = false;

        // NPC/character dialogue is the cleanest fit for lobby and quest-result beats.
        if (moment === 'lobby' || moment === 'result' || moment === 'ambient') {
            played = this.playLocalAudio('dialogue', common);
        }

        // Rise's extra character voice sets are preserved as distinct bank groups.
        // d_/c_/s_ groups are preferred here so normal combat grunts do not dominate
        // the fun dialogue layer; all hunter voices remain a safe final fallback.
        if (!played) {
            played = this.playLocalAudio('hunter_voice', {
                ...common,
                groupPrefixes: options.groupPrefixes || ['d_', 'c_', 's_']
            });
        }
        if (!played) played = this.playLocalAudio('hunter_voice', common);
        if (played) this.lastCharacterDialogueAt = now;
        return played;
    }

    getMonsterBgm(monster, options = {}) {
        if (monster && typeof monster === 'object') {
            this.lastBgmResolution = this.bgmResolver.resolve(monster, options);
            if (this.lastBgmResolution.track) return this.lastBgmResolution.track;
        }
        const monsterName = typeof monster === 'string' ? monster : (monster && (monster.nameKO || monster.nameEN)) || '';
        const name = (monsterName || "").toLowerCase();
        if (name.includes('벨카나') || name.includes('velkhana')) return 'BGM/MHW_Velkhana.mp3';
        if (name.includes('네르기간테') || name.includes('nergigante')) return 'BGM/MHW_Nergigante.mp3';
        if (name.includes('이블조') || name.includes('deviljho')) return 'BGM/MHW_Deviljho.mp3';
        if (name.includes('바젤') || name.includes('bazelgeuse')) return 'BGM/MHW_Bazelgeuse.mp3';
        if (name.includes('티가렉스') || name.includes('tigrex')) return 'BGM/MHW_Tigrex.mp3';
        if (name.includes('나르가') || name.includes('nargacuga')) return 'BGM/MHW_Nargacuga.mp3';
        if (name.includes('디노발드') || name.includes('glavenus')) return 'BGM/MHW_Glavenus.mp3';
        if (name.includes('브라키') || name.includes('brachydios')) return 'BGM/MHW_Brachydios.mp3';
        if (name.includes('아마츠') || name.includes('amatsu')) return 'BGM/MHR_Amatsu.mp3';
        if (name.includes('샤가르') || name.includes('샤갈') || name.includes('shagaru')) return 'BGM/MH4_Shagaru_Magala.mp3';
        if (name.includes('노산룡') || name.includes('lao_shan')) return 'BGM/MH_Lao_Shan_Lung.mp3';
        if (name.includes('라잔') || name.includes('rajang')) return 'BGM/William Tell.mp3';
        if (name.includes('요츠미와두') || name.includes('tetranadon')) return 'BGM/MHGU_Arena.mp3';
        if (name.includes('발파루크') || name.includes('valstrax')) return 'BGM/MHGU_Valstrax.mp3';
        if (name.includes('테오') || name.includes('teostra') || name.includes('나나') || name.includes('lunastra')) return 'BGM/MHW_Teostra.mp3';

        if (name.includes('안쟈나프') || name.includes('anjan') || 
            name.includes('리오레우스') || name.includes('rathalos') ||
            name.includes('리오레이아') || name.includes('rathian') ||
            name.includes('푸케푸케') || name.includes('pukei') ||
            name.includes('도스쟈그라스') || name.includes('jagras') ||
            name.includes('토비카가치') || name.includes('kadachi') ||
            name.includes('쿠루루야쿠') || name.includes('kulu')) {
            return 'BGM/MHW_Ancient_Forest.mp3';
        }

        if (name.includes('디아블로스') || name.includes('diablos') ||
            name.includes('볼보로스') || name.includes('barroth') ||
            name.includes('쥬라토도스') || name.includes('jyuratodus')) {
            return 'BGM/MHW_Wildspire_Waste.mp3';
        }

        if (name.includes('레이기에나') || name.includes('legiana') ||
            name.includes('파오우르무') || name.includes('paolumu') ||
            name.includes('치치야쿠') || name.includes('tzitzi') ||
            name.includes('치치') || name.includes('푸케푸케 아종') || name.includes('coral_pukei')) {
            return 'BGM/MHW_Coral_Highlands.mp3';
        }

        if (name.includes('오도가론') || name.includes('odogaron') ||
            name.includes('도스기르오스') || name.includes('girros') ||
            name.includes('라도발킨') || name.includes('radobaan')) {
            return 'BGM/MHW_Rotten_Vale.mp3';
        }

        if (name.includes('도도가마') || name.includes('dodogama') ||
            name.includes('우라간킨') || name.includes('uragaan') ||
            name.includes('볼가노스') || name.includes('lavasioth')) {
            return 'BGM/MHW_Elders_Recess.mp3';
        }

        if (name.includes('버프바로') || name.includes('banbaro') ||
            name.includes('베리오로스') || name.includes('barioth') ||
            name.includes('브란토도스') || name.includes('beotodus')) {
            return 'BGM/MHWI_Hoarfrost_Reach.mp3';
        }

        return 'BGM/MHGU_Arena.mp3';
    }

    getSelectedHabitatLabel() {
        const habitatId = this.lastBgmResolution && this.lastBgmResolution.habitatId;
        return habitatId && window.HUNT_HABITAT_LABELS ? window.HUNT_HABITAT_LABELS[habitatId] || habitatId : '';
    }

    playMonsterRoar(monster) {
        if (!monster) return;
        // Roars are creature VO at action start. Without an explicit phase an
        // audition group containing impact SE could be selected instead.
        if (this.playMonsterAction(monster, 'roar', { audioPhase: 'action-start' })) return;
        // Old downloaded roar files contain several misidentified/non-MH clips.
        // Silence is safer than assigning the wrong creature while the verified
        // extracted catalog is still being expanded.
        return false;
    }

    playMHAsset(fileName, fallbackKey, context = {}) {
        if (context.hunterStunned === true || context.action === 'stun' || /(?:hunter|mh)_stun/i.test(fileName || '')) {
            // Hunter stun is intentionally silent; keep only its UI/state presentation.
            return;
        }
        if (fileName === 'monster_attack') {
            this.playMonsterAction(context.monsterId, context.patternType || 'attack', context);
            return;
        }
        if (fileName === 'monster_telegraph') {
            this.playMonsterAction(context.monsterId, 'telegraph', context);
            return;
        }
        // Phase-slot cues (타격/후딜/이동) route through playMonsterAction so the
        // user-mapped pattern override is honoured; overrideOnly keeps them silent
        // until a sound is assigned in the review tool.
        if (fileName === 'monster_impact' || fileName === 'monster_recovery' || fileName === 'monster_travel') {
            this.playMonsterAction(context.monsterId, fileName.replace('monster_', ''), context);
            return;
        }
        if (fileName === 'monster_death' || fileName === 'monster_knockdown'
            || fileName === 'monster_trap' || fileName === 'monster_flinch') {
            this.playMonsterAction(context.monsterId, fileName.replace('monster_', ''), context);
            return;
        }
        if (/^monster_[a-z0-9_]+$/i.test(fileName || '')) {
            const semanticKind = fileName.replace(/^monster_/i, '');
            this.playVerifiedMonsterCue(context.monsterId, semanticKind, context);
            return;
        }
        if (fileName === 'dragon_piercer') {
            this.playWeaponAction('bow', 'dragon_piercer', context);
            this.playHunterActionVoice(context.hunterIndex, 'attack_heavy', { chance: 0.5, volume: 0.58 });
            return;
        }
        if (fileName === 'lifepowder') {
            this.playVerifiedItemCue('lifepowder');
            this.playHunterActionVoice(context.hunterIndex, 'support', { chance: 0.3, volume: 0.52 });
            return;
        }
        if (fileName === 'flash_pod' || context.item === 'flash-pod') {
            this.playVerifiedItemCue('flash_pod');
            return;
        }
        if (fileName === 'whetstone' || context.item === 'whetstone') {
            this.playWhetstoneCue(context);
            return;
        }
        if (fileName === 'whetstone_finish') {
            this.playVerifiedItemCue('whetstone_finish');
            return;
        }
        if (fileName === 'bomb_fuse' || context.item === 'fuse') {
            this.playItemSurrogateCue('bomb_fuse');
            return;
        }
        if (fileName === 'barrel_bomb' || context.item === 'large-barrel-bomb') {
            this.playItemSurrogateCue('barrel_bomb');
            this.playHunterActionVoice(context.hunterIndex, 'item', { chance: 0.4, volume: 0.54 });
            return;
        }
        if (fileName === 'hit_impact' || context.action === 'hit_impact') {
            const hitFamily = {
                projectile: 'ranged',
                ranged: 'ranged',
                explosive: 'ranged',
                counter: 'sever',
                blunt: 'blunt',
                sever: 'sever'
            }[context.weaponType] || 'sever';
            const hitzoneVal = Number(context.hitzoneValue ?? 45);
            const isWeakspot = hitzoneVal >= 45;
            const isBounce = context.bounced === true || hitzoneVal < 25;
            const cueKey = isBounce
                ? 'bounce_hard'
                : `${hitFamily}_${isWeakspot ? 'weakspot' : 'normal'}`;
            if (!this.playVerifiedHitCue(cueKey) && hitFamily === 'ranged') {
                this.playVerifiedHitCue('ranged_weakspot');
            }
            return;
        }
        const rosterHunter = this.hunterVoiceRoster.find(hunter => Number(hunter.index) === Number(context.hunterIndex));
        const effectiveWeaponId = context.weaponId || rosterHunter?.id;
        if (/mh_reload|reload/i.test(fileName || '')) {
            if (effectiveWeaponId && this.playWeaponAction(effectiveWeaponId, 'reload', context)) {
                this.playHunterActionVoice(context.hunterIndex, 'item', { chance: 0.2, volume: 0.5 });
            }
            // A missing exact reload is preferable to the old unrelated click.
            return;
        }
        if (/mh_heavy_hit|heavy_hit/i.test(fileName || '')) {
            // No action-labelled standalone heavy impact is verified yet.
            return;
        }
        const weaponGroup = this.weaponGroup(effectiveWeaponId);
        if (weaponGroup) {
            const played = this.playWeaponAction(effectiveWeaponId, fileName || 'attack', context);
            const voiceAction = /heavy|explosive|charge/i.test(fileName || '') ? 'attack_heavy' : 'attack';
            if (played) {
                this.playHunterActionVoice(context.hunterIndex, voiceAction, { chance: 0.32, volume: 0.56 });
            }
            // A weapon-context action must never spill into another weapon's bank.
            return;
        }
        if (/mh_hit|hunter_hit/i.test(fileName || '')) {
            this.playHunterActionVoice(context.hunterIndex, 'hit', { chance: 0.68, volume: 0.58 });
            // The old hit bank produced the unrelated hard "click". A fixed
            // actor reaction is the only proven hunter-hit layer for now.
            return;
        }
        if (/mh_guard|hunter_guard|guard/i.test(fileName || '')) {
            this.playHunterActionVoice(context.hunterIndex, 'guard', { chance: 0.38, volume: 0.54 });
            return;
        }
        if (/mh_dodge|hunter_evade|dodge|evade/i.test(fileName || '')) {
            this.playHunterActionVoice(context.hunterIndex, 'evade', { chance: 0.42, volume: 0.54 });
            return;
        }
        if (/mh_cart|mh_aibo|hunter_cart_voice/i.test(fileName || '')) {
            this.playHunterActionVoice(context.hunterIndex, 'cart', { chance: 0.78, volume: 0.62 });
            return;
        }
        if (/mh_potion/i.test(fileName || '')) {
            this.playMHAudioFile('Unified_SFX/Potion Drink.mp3');
            return;
        }
        if (/item|chest/i.test(fileName || '')) {
            this.playMHAudioFile('Unified_SFX/MH - Item Found.mp3');
            return;
        }

        const soundConfig = this.config.getSoundConfig();
        if (fallbackKey && soundConfig[fallbackKey]) {
            this.playConfiguredSound(soundConfig[fallbackKey]);
            return;
        }
        if (fileName) {
            const protectedClassic = new Set((typeof window !== 'undefined' && window.HUNT_PROTECTED_CLASSIC_AUDIO) || []);
            if (protectedClassic.has(fileName)) this.playMHAudioFile(fileName);
        }
    }

    playWeaponCue(cue) {
        if (cue === 'dragon_piercer') {
            return this.playWeaponAction('bow', 'dragon_piercer');
        }
        const localWeaponByCue = {
            bow_shot: 'bow', bowgun_shot: Math.random() < 0.5 ? 'light_bowgun' : 'heavy_bowgun',
            mechanical_transform: Math.random() < 0.5 ? 'switch_axe' : 'charge_blade',
            blunt_light: 'hammer', blunt_heavy: 'hammer', explosive_heavy: 'gunlance',
            slash_light: 'long_sword', slash_heavy: 'great_sword'
        };
        const weaponId = localWeaponByCue[cue];
        return weaponId ? this.playWeaponAction(weaponId, cue) : false;
    }

    playMHAudioFile(subPath, durationLimitMs = null, volumeMultiplier = 1.0, context = {}) {
        const filePath = `MonsterHunter_Soundtracks/${subPath}`;
        const isItemFoundCue = /MH - Item Found(?: \(|\.mp3)/i.test(subPath || '');
        if (context.hunterIndex !== undefined && context.action) {
            this.playHunterActionVoice(context.hunterIndex, context.action, {
                chance: context.voiceChance ?? 0.55,
                volume: context.voiceVolume ?? 0.56
            });
        }
        try {
            // Native playback is required for OBS file:// compatibility. Loudness
            // compensation is supplied by AudioManager's measured level profile.
            const audio = this.director.audioManager.createNativeAudio(filePath, {
                type: 'sfx',
                baseVolume: this.huntVolume(0.75 * volumeMultiplier) * (isItemFoundCue ? 0.7 : 1)
            });
            this.activeTransientAudios.add(audio);
            const release = () => {
                this.activeTransientAudios.delete(audio);
                this.director.audioManager.releaseMediaElement?.(audio);
            };
            if (typeof audio.addEventListener === 'function') audio.addEventListener('ended', release, { once: true });
            audio.play().then(() => {
                if (durationLimitMs) {
                    this.timers.timeout(() => {
                        const fadeDuration = 500;
                        const fadeInterval = 50;
                        let elapsed = 0;
                        const originalVol = audio.volume;
                        const timer = this.timers.interval(() => {
                            elapsed += fadeInterval;
                            if (elapsed >= fadeDuration) {
                                this.timers.clear(timer);
                                audio.pause();
                                audio.volume = 0;
                                release();
                            } else {
                                audio.volume = Math.max(0, originalVol * (1 - elapsed / fadeDuration));
                            }
                        }, fadeInterval);
                    }, durationLimitMs - 500 > 0 ? durationLimitMs - 500 : 0);
                }
            }).catch(e => { release(); console.warn(`Failed to play MH audio: ${filePath}`, e); });
        } catch(e) {
            console.warn(`Error loading MH audio: ${filePath}`, e);
        }
    }

    stopBgms() {
        this.timers.clearAll();
        const stop = (bgm, promise) => {
            if (bgm) {
                const action = () => {
                    try {
                        bgm.pause();
                        bgm.volume = 0;
                        bgm.muted = true;
                        bgm.src = '';
                        bgm.load();
                        this.director.audioManager.releaseMediaElement?.(bgm);
                    } catch(e){}
                };
                if (promise) {
                    promise.then(action).catch(action);
                } else {
                    action();
                }
            }
        };
        stop(this.lobbyBgm, this.lobbyBgmPromise);
        stop(this.battleBgm, this.battleBgmPromise);
        stop(this.winBgm, this.winBgmPromise);
        for (const audio of this.activeTransientAudios) {
            try {
                audio.pause();
                audio.volume = 0;
                audio.src = '';
                audio.load?.();
                this.director.audioManager.releaseMediaElement?.(audio);
            } catch (error) {}
        }
        this.activeTransientAudios.clear();
        this.lobbyBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgm = null;
        this.battleBgmPromise = null;
        this.winBgm = null;
        this.winBgmPromise = null;
    }

    dispose() {
        this.stopBgms();
        this.localAudioEntries = [];
        this.localAudioByCategory.clear();
        this.hunterVoiceProfiles.clear();
        this.hunterVoiceCooldowns.clear();
        this.hunterVoiceRecentPaths.clear();
        this.hunterVoiceRoster = [];
        this.voiceProfileCatalog = [];
        this.cmcVoiceProfile = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntAudioManager;
} else {
    window.HuntAudioManager = HuntAudioManager;
}
