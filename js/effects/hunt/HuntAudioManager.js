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
        if (options.sourceIncludes) pool = pool.filter(entry => String(entry.sourceBank || '').toLowerCase().includes(options.sourceIncludes));
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
        try {
            const audio = this.director.audioManager.createNativeAudio(entry.path, {
                type: 'sfx',
                baseVolume: Math.min(1, Number(options.volume || 0.7) * this.localAudioGain)
            });
            audio.play().catch(() => {});
            return true;
        } catch (error) {
            return false;
        }
    }

    weaponGroup(weaponId) {
        return ({
            great_sword: 'g_swd', long_sword: 'l_swd', sword_shield: 's_swd', dual_blades: 'd_bld',
            hammer: 'ham', hunting_horn: 'hrn', lance: 'lan', gunlance: 'g_lan', switch_axe: 's_axe',
            charge_blade: 'c_axe', insect_glaive: 'i_gla', light_bowgun: 'l_bg', heavy_bowgun: 'h_bg', bow: 'bow'
        })[weaponId] || null;
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
        const sourceIncludes = kind === 'roar' ? '_vo_' : (Math.random() < 0.58 ? '_se_' : '_fx_');
        if (this.playLocalAudio('monster', { group, sourceIncludes, volume: kind === 'roar' ? 0.78 : 0.64, maxDuration: kind === 'roar' ? 8 : 5 })) return true;
        if (kind === 'attack') {
            const alternate = sourceIncludes === '_se_' ? '_fx_' : '_se_';
            if (this.playLocalAudio('monster', { group, sourceIncludes: alternate, volume: 0.64, maxDuration: 5 })) return true;
            return this.playLocalAudio('monster', { group, volume: 0.6, maxDuration: 5 });
        }
        return false;
    }

    playHunterVoice(options = {}) {
        return this.playLocalAudio('hunter_voice', {
            languages: options.languages || ['ja', 'fc', 'en', 'neutral'],
            minDuration: 0.25,
            maxDuration: options.maxDuration || 4.5,
            volume: options.volume || 0.58
        });
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
            type: 'sfx', baseVolume: 0.7
        });
        audio.play().catch(() => {
            const defaultAudio = this.director.audioManager.createNativeAudio(defaultPath, {
                type: 'sfx', baseVolume: 0.7
            });
            defaultAudio.play().catch(() => {
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['포효'] || '포효');
            });
        });
    }

    playMHAsset(fileName, fallbackKey, context = {}) {
        if (fileName === 'monster_attack' && this.playMonsterAction(context.monsterId, 'attack')) return;
        const weaponGroup = this.weaponGroup(context.weaponId);
        if (weaponGroup && this.playLocalAudio('weapon', { group: weaponGroup, maxDuration: 5, volume: 0.64 })) {
            this.timers.timeout(() => this.playLocalAudio('hit', { group: 'monster', maxDuration: 3, volume: 0.48 }), 35);
            return;
        }
        if (/mh_hit|hunter_hit/i.test(fileName || '')) {
            const played = this.playLocalAudio('hit', { group: 'hunter', maxDuration: 3, volume: 0.62 });
            if (Math.random() < 0.52) this.playHunterVoice({ maxDuration: 3.5, volume: 0.54 });
            if (played) return;
        }
        if (/mh_cart|mh_aibo/i.test(fileName || '')) {
            if (Math.random() < 0.22 && this.playLocalAudio('dialogue', { languages: ['ja', 'fc', 'en'], maxDuration: 7, volume: 0.56 })) return;
            if (this.playHunterVoice({ maxDuration: 6, volume: 0.62 })) return;
        }
        if (/mh_potion|item|chest/i.test(fileName || '') && this.playLocalAudio('item', { maxDuration: 5, volume: 0.6 })) return;
        if (fileName && this.playWeaponCue(fileName)) return;

        const soundConfig = this.config.getSoundConfig();
        if (fallbackKey && soundConfig[fallbackKey]) {
            this.director.eventBus.emit('audio:playVisualSound', soundConfig[fallbackKey]);
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
        const layers = window.HUNT_WEAPON_AUDIO_CUES || {};
        const selected = layers[cue];
        if (!selected) return false;
        const localGroupByCue = {
            bow_shot: 'bow', bowgun_shot: Math.random() < 0.5 ? 'l_bg' : 'h_bg', mechanical_transform: Math.random() < 0.5 ? 's_axe' : 'c_axe',
            blunt_light: 'ham', blunt_heavy: 'ham', explosive_heavy: 'g_lan', slash_light: 'l_swd', slash_heavy: 'g_swd'
        };
        if (this.playLocalAudio('weapon', { group: localGroupByCue[cue], maxDuration: 5, volume: 0.64 })) return true;
        selected.forEach(([path, volume], index) => {
            this.timers.timeout(() => {
                try {
                    const audio = this.director.audioManager.createNativeAudio(path, {
                        type: 'sfx', baseVolume: volume
                    });
                    audio.play().catch(() => {});
                } catch (error) {
                    console.warn(`[HuntAudio] Failed cue layer ${cue}: ${path}`, error);
                }
            }, index * 35);
        });
        return true;
    }

    playMHAudioFile(subPath, durationLimitMs = null, volumeMultiplier = 1.0) {
        const filePath = `MonsterHunter_Soundtracks/${subPath}`;
        try {
            // Native playback is required for OBS file:// compatibility. Loudness
            // compensation is supplied by AudioManager's measured level profile.
            const audio = this.director.audioManager.createNativeAudio(filePath, {
                type: 'sfx', baseVolume: 0.75 * volumeMultiplier
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
