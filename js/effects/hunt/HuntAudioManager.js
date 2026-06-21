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
    }

    getMonsterBgm(monsterName) {
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

    playMonsterRoar(monster) {
        if (!monster) return;
        
        // 1. ID Normalization (lowercase and replace hyphens/apostrophes with underscores)
        const cleanId = monster.id.toLowerCase().replace(/[-']/g, '_');
        
        // 2. Subspecies and Variant Routing Dictionary
        const routingMap = {
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
        const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
        const volume = Math.min(1.0, Math.max(0, volConfig.master * volConfig.sfx * 0.7));

        const audio = new Audio(dedicatedPath);
        audio.volume = volume;
        audio.play().catch(() => {
            const defaultAudio = new Audio(defaultPath);
            defaultAudio.volume = volume;
            defaultAudio.play().catch(() => {
                this.director.eventBus.emit('audio:playVisualSound', this.config.getSoundConfig()['포효'] || '포효');
            });
        });
    }

    playMHAsset(fileName, fallbackKey) {
        // Blacklist hit/damage sound effects to completely silence them as requested
        const blacklist = ['mh_blunt_hit.mp3', 'mh_heavy_hit.mp3', 'mh_slash_hit.mp3'];
        if (fileName && blacklist.some(f => fileName.toLowerCase().endsWith(f) || fileName.toLowerCase() === f)) {
            console.log(`[Audio Blacklist] Blocked playing asset: ${fileName}`);
            return;
        }

        const soundConfig = this.config.getSoundConfig();
        if (fallbackKey && soundConfig[fallbackKey]) {
            // Also check if fallbackKey resolves to one of the blacklisted files
            const fallbackSrc = (soundConfig[fallbackKey].src || "").toLowerCase();
            if (blacklist.some(f => fallbackSrc.endsWith(f) || fallbackSrc === f)) {
                console.log(`[Audio Blacklist] Blocked fallback key: ${fallbackKey} (${fallbackSrc})`);
                return;
            }
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

    playMHAudioFile(subPath, durationLimitMs = null, volumeMultiplier = 1.0) {
        // Blacklist hit/damage sound effects to completely silence them as requested
        const blacklist = ['mh_blunt_hit.mp3', 'mh_heavy_hit.mp3', 'mh_slash_hit.mp3'];
        if (subPath && blacklist.some(f => subPath.toLowerCase().includes(f))) {
            console.log(`[Audio Blacklist] Blocked playing audio file: ${subPath}`);
            return;
        }
        
        const filePath = `MonsterHunter_Soundtracks/${subPath}`;
        try {
            const audio = new Audio(filePath);
            const volConfig = this.director.audioManager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
            const baseVolume = volConfig.master * volConfig.sfx * 0.75 * volumeMultiplier;

            if (volumeMultiplier > 1.0 && window.location.protocol !== 'file:') {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    const ctx = new AudioContext();
                    const source = ctx.createMediaElementSource(audio);
                    const gainNode = ctx.createGain();

                    gainNode.gain.value = baseVolume;
                    source.connect(gainNode);
                    gainNode.connect(ctx.destination);

                    if (ctx.state === 'suspended') {
                        ctx.resume();
                    }

                    let isCleaned = false;
                    const cleanup = () => {
                        if (isCleaned) return;
                        isCleaned = true;
                        try {
                            audio.pause();
                            gainNode.gain.value = 0;
                            source.disconnect();
                            gainNode.disconnect();
                            ctx.close().catch(() => {});
                        } catch (e) {
                            console.warn("Cleanup AudioContext error:", e);
                        }
                    };

                    audio.play().catch(e => {
                        console.warn(`Failed to play amplified audio: ${filePath}`, e);
                        cleanup();
                    });

                    audio.onended = cleanup;
                    audio.onerror = cleanup;

                    if (durationLimitMs) {
                        setTimeout(() => {
                            const fadeDuration = 500;
                            const fadeInterval = 50;
                            let elapsed = 0;
                            const originalGain = gainNode.gain.value;
                            const timer = setInterval(() => {
                                elapsed += fadeInterval;
                                if (elapsed >= fadeDuration) {
                                    clearInterval(timer);
                                    cleanup();
                                } else {
                                    gainNode.gain.value = Math.max(0, originalGain * (1 - elapsed / fadeDuration));
                                }
                            }, fadeInterval);
                        }, durationLimitMs - 500 > 0 ? durationLimitMs - 500 : 0);
                    }
                    return;
                }
            }

            audio.volume = Math.min(1.0, Math.max(0, baseVolume));
            audio.play().then(() => {
                if (durationLimitMs) {
                    setTimeout(() => {
                        const fadeDuration = 500;
                        const fadeInterval = 50;
                        let elapsed = 0;
                        const originalVol = audio.volume;
                        const timer = setInterval(() => {
                            elapsed += fadeInterval;
                            if (elapsed >= fadeDuration) {
                                clearInterval(timer);
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
