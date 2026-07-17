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
        this.localAudioGain = 0.8;
        this.huntVolumeGain = 2;
        this.hunterVoiceProfiles = new Map();
        this.hunterVoiceCooldowns = new Map();
        this.hunterVoiceRoster = [];
        this.voiceProfileCatalog = [];
        this.cmcVoiceProfile = null;
        this.lastCharacterDialogueAt = 0;
        this.localAudioReady = this.loadLocalAudioManifest();
    }

    async loadLocalAudioManifest() {
        if (typeof fetch !== 'function') return false;
        try {
            const response = await fetch('local_assets/monster_hunter/rise/manifest.json', { cache: 'no-store' });
            if (!response.ok) return false;
            const manifest = await response.json();
            this.localAudioGain = Number(manifest.defaultGain || 0.8);
            this.localAudioEntries = Array.isArray(manifest.entries) ? manifest.entries : [];
            this.localAudioByCategory.clear();
            this.localAudioEntries.forEach(entry => {
                if (!this.localAudioByCategory.has(entry.category)) this.localAudioByCategory.set(entry.category, []);
                this.localAudioByCategory.get(entry.category).push(entry);
            });
            this.buildHunterVoiceProfileCatalog();
            if (this.hunterVoiceRoster.length) this.assignHunterVoiceProfiles(this.hunterVoiceRoster);
            console.info(`[HuntAudio] Local Rise library ready: ${this.localAudioEntries.length} clips`);
            return this.localAudioEntries.length > 0;
        } catch (error) {
            console.info('[HuntAudio] Local Rise library unavailable; using fallback SFX.');
            return false;
        }
    }

    selectLocalAudio(category, options = {}) {
        let pool = this.localAudioByCategory.get(category) || [];
        if (options.group) pool = pool.filter(entry => entry.group === options.group);
        if (options.groups && options.groups.length) pool = pool.filter(entry => options.groups.includes(entry.group));
        if (options.groupPrefixes && options.groupPrefixes.length) {
            pool = pool.filter(entry => options.groupPrefixes.some(prefix => String(entry.group || '').startsWith(prefix)));
        }
        if (options.sourceIncludes) {
            const needle = String(options.sourceIncludes).toLowerCase();
            pool = pool.filter(entry => String(entry.sourceBank || '').toLowerCase().includes(needle));
        }
        if (options.languages && options.languages.length) {
            const preferred = pool.filter(entry => options.languages.includes(entry.language));
            if (preferred.length) pool = preferred;
        }
        if (options.maxDuration) pool = pool.filter(entry => Number(entry.duration || 0) <= options.maxDuration);
        if (options.minDuration) pool = pool.filter(entry => Number(entry.duration || 0) >= options.minDuration);
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

    buildHunterVoiceProfileCatalog() {
        const profiles = new Map();
        (this.localAudioByCategory.get('hunter_voice') || []).forEach(entry => {
            const duration = Number(entry.duration || 0);
            if (!duration || duration > 7 || /\[pre\]/i.test(String(entry.sourceStream || ''))) return;
            const language = String(entry.language || 'neutral');
            const group = String(entry.group || 'common');
            const key = `${language}:${group}`;
            if (!profiles.has(key)) {
                profiles.set(key, {
                    key,
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
        const combatReady = candidates.filter(profile =>
            profile.entries.length >= 40 && profile.entries.filter(entry => Number(entry.duration || 0) <= 1.55).length >= 10
        );
        this.voiceProfileCatalog = (combatReady.length ? combatReady : candidates).sort((a, b) =>
            (languageRank[a.language] ?? 9) - (languageRank[b.language] ?? 9) || a.group.localeCompare(b.group)
        );
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const cmcEntries = (globalScope.HIVE_CMC_FILES || []).map(cueName => {
            const path = `AI CMC/${cueName}.mp4`;
            return {
                path,
                category: 'cmc_voice',
                group: 'cmc',
                language: 'ko',
                duration: Number(globalScope.HIVE_AUDIO_LEVELS?.[path]?.duration || 2),
                cueName,
                isCmc: true
            };
        });
        this.cmcVoiceProfile = cmcEntries.length
            ? { key: 'ko:cmc', language: 'ko', group: 'cmc', isCmc: true, entries: cmcEntries }
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
        if (!this.voiceProfileCatalog.length) return false;

        const japanese = this.voiceProfileCatalog.filter(profile => profile.language === 'ja');
        const available = japanese.length >= hunters.length ? japanese : this.voiceProfileCatalog;
        const dlc = available.filter(profile => profile.isDlc);
        const standard = available.filter(profile => !profile.isDlc);
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
            const preferredPool = position % 2 === 0 ? dlc : standard;
            const profile = pick(preferredPool, `${hunter.hunterName || 'hunter'}:${hunter.index ?? position}`);
            if (!profile) return;
            used.add(profile.key);
            const index = Number(hunter.index ?? position);
            this.hunterVoiceProfiles.set(index, profile);
            hunter.voiceProfile = {
                key: profile.key,
                language: profile.language,
                group: profile.group,
                isDlc: profile.isDlc
            };
        });
        return this.hunterVoiceProfiles.size > 0;
    }

    prepareHunterVoiceProfiles(hunters = []) {
        this.hunterVoiceRoster = hunters;
        if (this.voiceProfileCatalog.length) return Promise.resolve(this.assignHunterVoiceProfiles(hunters));
        return this.localAudioReady.then(() => this.assignHunterVoiceProfiles(hunters));
    }

    selectHunterActionVoice(hunterIndex, action = 'attack') {
        if (!this.hunterVoiceProfiles.has(Number(hunterIndex)) && this.hunterVoiceRoster.length && this.voiceProfileCatalog.length) {
            this.assignHunterVoiceProfiles(this.hunterVoiceRoster);
        }
        const profile = this.hunterVoiceProfiles.get(Number(hunterIndex));
        if (!profile) return null;
        const rules = {
            attack: [0.12, 1.55],
            attack_heavy: [0.2, 2.2],
            hit: [0.12, 1.15],
            evade: [0.12, 1.05],
            guard: [0.15, 1.4],
            item: [0.75, 2.8],
            cart: [1.1, 4.8],
            victory: [1.2, 6],
            support: [0.7, 2.8]
        };
        const [minDuration, maxDuration] = rules[action] || rules.attack;
        const actionPool = profile.entries.filter(entry => {
            const duration = Number(entry.duration || 0);
            return duration >= minDuration && duration <= maxDuration;
        });
        const pool = actionPool.length ? actionPool : profile.entries;
        return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    }

    selectCmcActionVoice(action = 'attack') {
        if (!this.cmcVoiceProfile) return null;
        const cuePools = {
            attack: ['에라이', '으루아', '십자베기', '올려칠', '신기술', '빨리잡', '빨리해'],
            attack_heavy: ['으루아', '오오오', '천재지변', '역대급', '드디어고룡'],
            hit: ['아제발요', '환장', '너무 아쉽네요', '할말없', '퉤'],
            cart: ['아제발요', '늙어죽', '할말없', '환장'],
            evade: ['어라', '어디가', '끄덕', '뭐'],
            guard: ['어라', '끄덕', '뭐'],
            item: ['고치라코소', '저도그렇게', '조금만더보여'],
            support: ['고치라코소', '저도그렇게', '조금만더보여'],
            victory: ['굉장해', '끝내주', '스고이', '멋져', '와우', '우와', '캬', '짝짝짝', '정말대단']
        };
        const preferred = cuePools[action] || cuePools.attack;
        const semanticPool = this.cmcVoiceProfile.entries.filter(entry => preferred.some(cue => String(entry.cueName || '').startsWith(cue)));
        const pool = semanticPool.length ? semanticPool : this.cmcVoiceProfile.entries;
        return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    }

    playHunterActionVoice(hunterIndex, action = 'attack', options = {}) {
        if (hunterIndex === undefined || hunterIndex === null) return false;
        if (!options.force && Math.random() > Number(options.chance ?? 1)) return false;
        const now = Date.now();
        const key = Number(hunterIndex);
        if (!options.force && now < Number(this.hunterVoiceCooldowns.get(key) || 0)) return false;
        const cmcChance = Math.min(1, Math.max(0, Number(options.cmcChance ?? 0.14)));
        const useCmc = !options.disableCmc && this.cmcVoiceProfile && Math.random() < cmcChance;
        const entry = useCmc ? this.selectCmcActionVoice(action) : this.selectHunterActionVoice(key, action);
        if (!entry) return false;
        const played = this.playLocalEntry(entry, { volume: options.volume ?? 0.56 });
        if (played) this.hunterVoiceCooldowns.set(key, now + Number(options.cooldownMs ?? 1100));
        return played;
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

    playWeaponAction(weaponId, cue = 'attack') {
        const group = this.weaponGroup(weaponId);
        const sourceIncludes = this.weaponCommonBank(weaponId);
        if (!group || !sourceIncludes) return false;
        const profiles = {
            bow_shot: [0.24, 0.85],
            bowgun_shot: [0.2, 1.1],
            dragon_piercer: [0.9, 1.4],
            slash_heavy: [0.7, 2.7],
            blunt_heavy: [0.7, 2.7],
            explosive_heavy: [0.75, 2.7],
            mechanical_transform: [0.45, 2.4],
            attack_heavy: [0.7, 2.7]
        };
        const [minDuration, maxDuration] = profiles[cue] || [0.18, 1.1];
        const options = { group, sourceIncludes, minDuration, maxDuration, maxDurationFallback: 3, volume: cue === 'dragon_piercer' ? 0.72 : 0.64 };
        if (this.playLocalAudio('weapon', options)) return true;
        return this.playLocalAudio('weapon', { group, sourceIncludes, maxDuration: 3, volume: options.volume });
    }

    monsterGroup(monsterId) {
        const clean = String(monsterId || '').toLowerCase();
        const routes = {
            rathian: 'em001', rathalos: 'em002', diablos: 'em007', rajang: 'em023', furious_rajang: 'em023',
            kushala_daora: 'em024', chameleos: 'em025', teostra: 'em027', tigrex: 'em032', nargacuga: 'em037',
            barioth: 'em042', royal_ludroth: 'em047', zinogre: 'em057', amatsu: 'em058', brachydios: 'em063',
            gore_magala: 'em071', shagaru_magala: 'em072', seregios: 'em077', glavenus: 'em080',
            mizutsune: 'em082', valstrax: 'em086', crimson_glow_valstrax: 'em086', velkhana: 'em124'
        };
        const direct = routes[clean];
        if (direct) return direct;
        const family = Object.keys(routes).find(id => clean.includes(id));
        return family ? routes[family] : null;
    }

    playMonsterAction(monster, kind = 'attack') {
        const group = this.monsterGroup(monster && monster.id ? monster.id : monster);
        if (!group) return false;
        const sourceIncludes = kind === 'roar' ? '_vo_' : '_fx_';
        const minDuration = kind === 'roar' ? 0.55 : 0.65;
        if (this.playLocalAudio('monster', { group, sourceIncludes, volume: kind === 'roar' ? 0.78 : 0.64, minDuration, maxDuration: kind === 'roar' ? 8 : 5 })) return true;
        if (kind === 'attack') {
            if (this.playLocalAudio('monster', { group, sourceIncludes: '_se_', volume: 0.64, minDuration, maxDuration: 5 })) return true;
            return this.playLocalAudio('monster', { group, volume: 0.6, minDuration, maxDuration: 5 });
        }
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
        if (name.includes('진오우거') || name.includes('zinogre')) return 'BGM/MHW_Zinogre.mp3';
        if (name.includes('타마미츠네') || name.includes('mizutsune')) return 'BGM/MHR_Mizutsune.mp3';
        if (name.includes('벨카나') || name.includes('velkhana')) return 'BGM/MHW_Velkhana.mp3';
        if (name.includes('네르기간테') || name.includes('nergigante')) return 'BGM/MHW_Nergigante.mp3';
        if (name.includes('이블조') || name.includes('deviljho')) return 'BGM/MHW_Deviljho.mp3';
        if (name.includes('티가렉스') || name.includes('tigrex')) return 'BGM/MHW_Tigrex.mp3';
        if (name.includes('나르가') || name.includes('nargacuga')) return 'BGM/MHW_Nargacuga.mp3';
        if (name.includes('디노발드') || name.includes('glavenus')) return 'BGM/MHW_Glavenus.mp3';
        if (name.includes('브라키') || name.includes('brachydios')) return 'BGM/MHW_Brachydios.mp3';
        if (name.includes('밀라보레아스') || name.includes('fatalis')) return 'BGM/MHW_Fatalis.mp3';
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
        if (this.playMonsterAction(monster, 'roar')) return;
        
        // 1. ID Normalization (lowercase and replace hyphens/apostrophes with underscores)
        const cleanId = monster.id.toLowerCase().replace(/[-']/g, '_');
        
        // 2. Subspecies and Variant Routing Dictionary
        const routingMap = window.HUNT_ROAR_ROUTE || {
            // Rathalos Family
            'azure_rathalos': 'rathalos',
            'silver_rathalos': 'rathalos',
            
            // Rathian Family (now correctly routes to rathian roar, not rathalos!)
            'rathian': 'rathian',
            'pink_rathian': 'rathian',
            'gold_rathian': 'rathian',
            
            // Diablos Family
            'black_diablos': 'diablos',
            
            // Zinogre Family
            'stygian_zinogre': 'zinogre',
            
            // Nergigante Family
            'ruiner_nergigante': 'nergigante',
            
            // Deviljho Family
            'savage_deviljho': 'deviljho',
            
            // Brachydios Family
            'raging_brachydios': 'brachydios',
            
            // Glavenus Family
            'acidic_glavenus': 'glavenus',
            
            // Rajang Family
            'furious_rajang': 'rajang',
            
            // Bazelgeuse Family
            'seething_bazelgeuse': 'bazelgeuse',
            
            // Barioth Family
            'frostfang_barioth': 'barioth',
            
            // Legiana Family
            'shrieking_legiana': 'legiana',
            
            // Valstrax Family
            'crimson_glow_valstrax': 'valstrax',
            
            // Malzeno Family
            'primordial_malzeno': 'malzeno',
            
            // Yian Garuga Family
            'scarred_yian_garuga': 'yian_garuga',
            
            // Anjanath Family
            'fulgur_anjanath': 'anjanath',
            
            // Paolumu Family
            'nightshade_paolumu': 'paolumu',
            
            // Tobi-Kadachi Family
            'viper_tobi_kadachi': 'tobi_kadachi',
            
            // Pukei-Pukei Family
            'coral_pukei_pukei': 'pukei_pukei'
        };
        
        // Determine final filename ID
        const finalId = routingMap[cleanId] || cleanId;

        const dedicatedPath = `SFX/MonsterHunter_Roars/roar_${finalId}.mp3`;
        const defaultPath = `SFX/MonsterHunter_Roars/roar_default.mp3`;
        const audio = this.director.audioManager.createNativeAudio(dedicatedPath, {
            type: 'sfx', baseVolume: this.huntVolume(0.7)
        });
        audio.play().catch(() => {
            const defaultAudio = this.director.audioManager.createNativeAudio(defaultPath, {
                type: 'sfx', baseVolume: this.huntVolume(0.7)
            });
            defaultAudio.play().catch(() => {
                this.playConfiguredSound(this.config.getSoundConfig()['포효'] || '포효');
            });
        });
    }

    playMHAsset(fileName, fallbackKey, context = {}) {
        if (fileName === 'monster_attack' && this.playMonsterAction(context.monsterId, 'attack')) return;
        if (fileName === 'dragon_piercer') {
            const played = this.playWeaponAction('bow', 'dragon_piercer');
            this.playHunterActionVoice(context.hunterIndex, 'attack_heavy', { chance: 0.5, volume: 0.58 });
            if (played) {
                this.timers.timeout(() => this.playLocalAudio('hit', { group: 'monster', minDuration: 0.42, maxDuration: 1.25, volume: 0.52 }), 70);
            }
            return;
        }
        const weaponGroup = this.weaponGroup(context.weaponId);
        if (weaponGroup) {
            const played = this.playWeaponAction(context.weaponId, fileName || 'attack');
            const voiceAction = /heavy|explosive|charge/i.test(fileName || '') ? 'attack_heavy' : 'attack';
            if (played) {
                this.playHunterActionVoice(context.hunterIndex, voiceAction, { chance: 0.32, volume: 0.56 });
                this.timers.timeout(() => this.playLocalAudio('hit', { group: 'monster', maxDuration: 3, volume: 0.48 }), 35);
            }
            // A weapon-context action must never spill into another weapon's bank.
            return;
        }
        if (/mh_hit|hunter_hit/i.test(fileName || '')) {
            const played = this.playLocalAudio('hit', {
                group: 'hunter', sourceIncludes: 'hit_pl_', minDuration: 0.42, maxDuration: 1.6, volume: 0.62
            });
            this.playHunterActionVoice(context.hunterIndex, 'hit', { chance: 0.68, volume: 0.58 });
            // Never fall back to the old generic "click" impact. If the local Rise
            // bank is still loading, the voice layer is preferable to a wrong SFX.
            return played;
        }
        if (/mh_guard|guard/i.test(fileName || '')) {
            this.playHunterActionVoice(context.hunterIndex, 'guard', { chance: 0.38, volume: 0.54 });
        }
        if (/mh_dodge|dodge|evade/i.test(fileName || '')) {
            this.playHunterActionVoice(context.hunterIndex, 'evade', { chance: 0.42, volume: 0.54 });
        }
        if (/mh_cart|mh_aibo/i.test(fileName || '')) {
            if (this.playHunterActionVoice(context.hunterIndex, 'cart', { chance: 0.78, volume: 0.62 })) return;
        }
        if (/mh_potion|item|chest/i.test(fileName || '') && this.playLocalAudio('item', { maxDuration: 5, volume: 0.6 })) return;
        if (fileName && this.playWeaponCue(fileName)) return;

        const soundConfig = this.config.getSoundConfig();
        if (fallbackKey && soundConfig[fallbackKey]) {
            this.playConfiguredSound(soundConfig[fallbackKey]);
            return;
        }
        if (fileName) {
            const hasAudioExtension = /\.(mp3|wav|ogg|m4a|aac|webm|flac)$/i.test(fileName);
            if (hasAudioExtension) {
                this.playMHAudioFile(fileName);
            }
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
                type: 'sfx', baseVolume: this.huntVolume(0.75 * volumeMultiplier)
            });
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
                            } else {
                                audio.volume = Math.max(0, originalVol * (1 - elapsed / fadeDuration));
                            }
                        }, fadeInterval);
                    }, durationLimitMs - 500 > 0 ? durationLimitMs - 500 : 0);
                }
            }).catch(e => console.warn(`Failed to play MH audio: ${filePath}`, e));
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
        this.lobbyBgm = null;
        this.lobbyBgmPromise = null;
        this.battleBgm = null;
        this.battleBgmPromise = null;
        this.winBgm = null;
        this.winBgmPromise = null;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntAudioManager;
} else {
    window.HuntAudioManager = HuntAudioManager;
}
