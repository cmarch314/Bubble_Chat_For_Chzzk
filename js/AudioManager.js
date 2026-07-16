// ==========================================
// [Class 3] Audio Manager (Sound Engine)
// ==========================================
// ==========================================
// [Class 2] Audio Controller (Tunable & Smart-Router)
// * 기능: Config 설정을 받아 실시간으로 오디오를 평준화하거나 우회함
// ==========================================
class AudioManager {
    constructor(configManager, eventBus) {
        this.configManager = configManager;
        this.eventBus = eventBus;
        this.scope = new DisposableScope();
        this.timers = new ManagedTimers();
        this.scope.add(() => this.timers.clearAll());
        this.activeBufferSources = new Set();
        this.activeFallbackAudio = new Set();
        this.disposed = false;
        this.basePath = './SFX/';
        this.commandMatcher = new AudioCommandMatcher(configManager);
        this.levelProfile = typeof AudioLevelProfile === 'function'
            ? new AudioLevelProfile(window.HIVE_AUDIO_LEVELS || {})
            : { gain: () => 1, volume: (path, volume) => Math.min(1, Math.max(0, volume)) };
        // [Performance] 오디오 버퍼 캐시 (중복 로딩 방지)
        this.bufferCache = new Map();

        // [Volume Control] 현재 재생 중인 소리 추적
        this.activeVoices = 0;

        // [New] Sequential Chat Audio Queue
        this.pendingChatAudioQueue = [];
        this._processingQueue = false;

        // 1. 오디오 엔진 시동
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        // 2. 컴프레서 생성 (공유 노드)
        this.compressor = this.audioCtx.createDynamicsCompressor();
        this._updateCompressorSettings();

        // 3. 마스터 게인 (최종 출력 천장 - 공유 노드)
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = 1.0;

        // [핵심 연결] 컴프레서는 항상 마스터 게인으로 연결됨
        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.audioCtx.destination);

        // [Core Settings]
        this.soundHive = {};
        this.enabled = true;
        this.volumeConfig = { ...this.configManager.getVolumeConfig() };
        this.masterGain.gain.value = this.volumeConfig.master;
        this.mediaStager = new AudioMediaStager({
            configManager: this.configManager,
            levelProfile: this.levelProfile,
            getVolumeConfig: () => this.volumeConfig,
            audioContext: this.audioCtx,
            compressor: this.compressor
        });
        this.updateConfigLegacy(this.configManager.getSoundConfig());

        // [Visual Audio Tracking]
        this.visualAudioPaths = new Set();
        this._buildVisualAudioPaths();

        // Event Bus Listeners
        if (this.eventBus) {
            this.scope.add(this.eventBus.on('audio:playSFX', (soundPath, options) => {
                this.playSound(soundPath, options);
            }));
            this.scope.add(this.eventBus.on('audio:playVisualSound', (soundPath) => {
                this.playSound(soundPath, { force: true, type: 'visual' });
            }));
            this.scope.add(this.eventBus.on('chat:videoFinished', () => {
                this.processPendingChatAudioQueue();
            }));
            this.scope.add(this.eventBus.on('system:muteAudio', () => {
                this.setEnabled(false);
                this.playSound(this.soundHive['윈도우종료'], { force: true });
            }));
            this.scope.add(this.eventBus.on('system:unmuteAudio', () => {
                this.setEnabled(true);
            }));
            this.scope.add(this.eventBus.on('system:toggleAudio', () => {
                const next = !this.enabled;
                this.setEnabled(next);
                if (!next) {
                    this.playSound(this.soundHive['윈도우종료'], { force: true });
                }
            }));
            this.scope.add(this.eventBus.on('system:updateVolume', (config) => {
                this.updateVolumeConfig(config);
            }));
            this.scope.add(this.eventBus.on('system:updateConfig', (key) => {
                if (key === '켜기') this.updateConfig('all', true);
                else if (key === '끄기') this.updateConfig('all', false);
                else if (key === '도네') this.updateConfig('visual');
                else if (key === '채팅') this.updateConfig('sfx');
            }));
        }
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.scope.dispose();
        this.pendingChatAudioQueue = [];
        this._processingQueue = false;

        for (const source of this.activeBufferSources) {
            try { source.stop(); } catch (error) {}
            try { source.disconnect(); } catch (error) {}
        }
        this.activeBufferSources.clear();

        for (const audio of this.activeFallbackAudio) {
            try { audio.pause(); } catch (error) {}
            audio.onended = null;
            audio.onerror = null;
        }
        this.activeFallbackAudio.clear();

        this.mediaStager.dispose();
        this.bufferCache.clear();
        if (this.audioCtx && typeof this.audioCtx.close === 'function') {
            this.audioCtx.close().catch(() => {});
        }
    }

    resolveAudioPath(src) {
        if (!src) return src;
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) {
            return src;
        }
        
        let path = src.replace(/^\.\//, '');
        
        // Check for virtual rename mapping
        if (this.configManager) {
            const renames = this.configManager.getSfxRenames() || {};
            let lookupPath = path;
            let hasSfxPrefix = false;
            if (lookupPath.startsWith('SFX/')) {
                lookupPath = lookupPath.substring(4);
                hasSfxPrefix = true;
            }
            if (renames[lookupPath]) {
                const physical = renames[lookupPath];
                path = hasSfxPrefix ? 'SFX/' + physical : physical;
            }
        }

        if (path.startsWith('SFX/') || path.startsWith('BGM/') || path.startsWith('MonsterHunter_Soundtracks/')) {
            return './' + path;
        }
        return this.basePath + path;
    }

    _buildVisualAudioPaths() {
        this.visualAudioPaths = this.commandMatcher.buildVisualAudioPaths(
            source => this.resolveAudioPath(source)
        );
    }

    connectMediaElement(mediaElement, type = 'visual', options = {}) {
        return this.mediaStager.connectMediaElement(mediaElement, type, options);
    }

    getOutputVolume(path, type = 'visual', baseVolume = 1) {
        return this.mediaStager.outputVolume(path, type, baseVolume);
    }

    _profileGain(path, type) {
        return this.mediaStager.profileGain(path, type);
    }

    applyNativeVolume(mediaElement, options = {}) {
        return this.mediaStager.applyNativeVolume(mediaElement, options);
    }

    createNativeAudio(path, options = {}) {
        return this.mediaStager.createNativeAudio(path, options);
    }

    _updateCompressorSettings() {
        if (!this.compressor) return;
        // Use default settings if window.COMPRESSOR_SETTINGS is not set (it wasn't encapsulated but that's fine, we can keep it hardcoded for now or use defaults)
        const settings = window.COMPRESSOR_SETTINGS || {
            threshold: -18, knee: 12, ratio: 4, attack: 0.008, release: 0.18
        };
        this.compressor.threshold.value = settings.threshold;
        this.compressor.knee.value = settings.knee;
        this.compressor.ratio.value = settings.ratio;
        this.compressor.attack.value = settings.attack;
        this.compressor.release.value = settings.release;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (this.audioCtx.state === 'suspended' && enabled) this.audioCtx.resume().catch(() => { });
    }

    // [Legacy] 기존 updateConfig -> updateConfigLegacy로 이름 변경 or 유지
    updateConfigLegacy(config) {
        this.soundHive = this.commandMatcher.normalizeCatalog(config);
        this.commandMatcher.setSoundHive(this.soundHive);
    }

    updateVolumeConfig(config) {
        if (!config) return;
        this.volumeConfig = { ...this.volumeConfig, ...config };
        this.masterGain.gain.setTargetAtTime(this.volumeConfig.master, this.audioCtx.currentTime, 0.05);

        // ConfigManager에 업데이트 위임 (LocalStorage 저장 등 수행)
        if (this.configManager) {
            this.configManager.updateVolumeConfig(config);
        }

        this.mediaStager.updateVolumes();
    }

    // [명령어] 설정 변경 메서드 (New)
    updateConfig(key, value) {
        const conf = this.configManager.getNormalizerConfig();
        if (!conf) return;

        let msg = "";
        if (key === 'all') {
            conf.enabled = value;
            msg = `[시스템] 볼륨 평준화: ${value ? 'ON' : 'OFF'}`;
        } else if (key === 'visual') {
            conf.visual = !conf.visual;
            msg = `[시스템] 도네 평준화: ${conf.visual ? 'ON' : 'OFF (원음)'}`;
        } else if (key === 'sfx') {
            conf.sfx = !conf.sfx;
            msg = `[시스템] 채팅 평준화: ${conf.sfx ? 'ON' : 'OFF (원음)'}`;
        }
        this.mediaStager.updateVolumes();
        console.log(msg); // 콘솔 확인용
        return msg;
    }

    // [New] Extracts matched SFX sequence for a message
    getSFXSequence(message) {
        return this.commandMatcher.match(message);
    }

    // 소리만 재생 (채팅 트리거용 - Legacy Logic 유지)
    async checkAndPlay(message, force = false, hasVideo = false) {
        if (this.disposed) return;
        if (!this.enabled && !force) return;

        // If a video is currently playing, or this message triggers a video, queue the audio
        const isVideoActive = (window._activeVideoCount && window._activeVideoCount > 0);
        if (hasVideo || isVideoActive) {
            console.log(`[AudioManager] Video active (${window._activeVideoCount}) or has video command. Queueing audio: "${message}"`);
            this.pendingChatAudioQueue.push({ message, force });
            return;
        }

        const sequence = this.getSFXSequence(message);

        if (sequence.length > 0) {
            // 매번 재생 전 컴프레서 설정을 최신화 (실시간 반영)
            this._updateCompressorSettings();
            for (let item of sequence.slice(0, 5)) { 
                await this.playSound(item.sound, { force, type: 'sfx' }); 
            }
        }
    }

    // [New] Sequential Chat Audio Queue Processor
    async processPendingChatAudioQueue() {
        if (this._processingQueue) return;
        this._processingQueue = true;

        try {
            while (this.pendingChatAudioQueue.length > 0) {
                // If a video starts playing during queue processing, stop and wait
                if (window._activeVideoCount && window._activeVideoCount > 0) {
                    break;
                }
                const item = this.pendingChatAudioQueue.shift();
                await this.checkAndPlay(item.message, item.force, false);
            }
        } catch (e) {
            console.error("[AudioManager] Error processing audio queue:", e);
        } finally {
            this._processingQueue = false;
        }
    }

    // ★★★ [Split Gain Staging Edition] playSound ★★★
    async playSound(input, options = {}) {
        if (this.disposed) return;
        let force = false;
        let type = 'sfx';

        if (typeof options === 'boolean') {
            force = options;
        } else {
            force = options.force || false;
            type = options.type || 'sfx';
        }

        // 1. 상태 체크
        if (!this.enabled && !force) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => { });

        // 2. 입력값 정규화 (배열/객체 지원)
        let target = input;
        if (Array.isArray(target)) target = target[Math.floor(Math.random() * target.length)];
        if (!target) return;

        let fileName, baseVolume = 0.5;
        if (typeof target === 'object' && target !== null && target.src) {
            fileName = target.src;
            if (target.volume !== undefined) baseVolume = target.volume;
        } else {
            fileName = target;
        }
        if (!fileName) return;

        // Check for exclusions (using clean path)
        if (this.configManager) {
            let cleanFile = fileName.replace(/^\.\//, '');
            if (cleanFile.startsWith('SFX/')) {
                cleanFile = cleanFile.substring(4);
            }
            const excludedList = this.configManager.getExcludedSfx() || [];
            
            // Resolve physical path first for exclusion check
            let lookupPath = cleanFile;
            const renames = this.configManager.getSfxRenames() || {};
            if (renames[lookupPath]) {
                lookupPath = renames[lookupPath];
            }
            
            if (excludedList.includes(cleanFile) || excludedList.includes(lookupPath)) {
                console.log(`[AudioManager] Blocked playback of excluded sound: ${fileName}`);
                return;
            }
        }

        // [파일명 검증 가드] 음원 확장자가 포함되지 않은 텍스트형 키워드는 무시하여 404 에러 및 브라우저 디코딩 클릭 노이즈 예방
        const hasAudioExtension = /\.(mp3|wav|ogg|m4a|aac|webm|flac)$/i.test(fileName);
        const isUrl = fileName.startsWith('http://') || fileName.startsWith('https://');
        if (!hasAudioExtension && !isUrl) {
            return;
        }

        // [중복 방지] 시각 효과 사운드 중복 차단
        const visualConf = this.configManager ? this.configManager.getVisualConfig() : {};
        const isVisualSound = Object.values(visualConf).some(vConf => {
            // Check both soundKey and audioOverride
            const checkKeys = [];
            if (vConf.soundKey) checkKeys.push(vConf.soundKey);
            if (vConf.audioOverride) checkKeys.push(vConf.audioOverride);

            return checkKeys.some(k => {
                const mapped = (this.soundHive || {})[k];
                if (!mapped) return false;
                const checkSrc = (item) => (typeof item === 'object' ? item.src : item) || "";
                if (Array.isArray(mapped)) return mapped.some(item => checkSrc(item).includes(fileName));
                return checkSrc(mapped).includes(fileName);
            });
        });
        if (type === 'sfx' && isVisualSound) return;

        // 3. 경로 및 설정 로드
        let playPath = this.resolveAudioPath(fileName);

        const volConfig = this.volumeConfig || { master: 1, visual: 1, sfx: 1 };
        const normConfig = this.configManager ? this.configManager.getNormalizerConfig() : { enabled: true, visual: false, sfx: true };
        const applyNormalizer = normConfig.enabled &&
            ((type === 'visual' && normConfig.visual) || (type === 'sfx' && normConfig.sfx));

        // ★★★ [Gain Staging] ★★★
        // Input Drive: 컴프레서로 밀어넣는 소리의 크기 (입력 배율만 적용)
        const typeMultiplier = (type === 'visual') ? volConfig.visual : volConfig.sfx;
        const profileGain = this._profileGain(playPath, type);
        const driveGain = baseVolume * typeMultiplier * profileGain;

        // Output Ceiling: 컴프레서를 거친 뒤의 최종 볼륨 (Master 적용)
        const outputCeiling = volConfig.master;
        this.masterGain.gain.setTargetAtTime(outputCeiling, this.audioCtx.currentTime, 0.05);

        return new Promise((resolve) => {
            const finish = () => {
                source.disconnect();
                preGainNode.disconnect();
                resolve();
            };

            try {
                // [Strategy A] Web Audio Buffer (Drive -> Limiter -> Ceiling)
                // Helper: Play from decoded buffer
                const playBuffer = (audioBuffer) => {
                    if (this.disposed) {
                        resolve();
                        return;
                    }
                    const source = this.audioCtx.createBufferSource();
                    source.buffer = audioBuffer;

                    const preGainNode = this.audioCtx.createGain();

                    // [Dynamic Volume Scaling] 소리가 겹칠수록 볼륨을 줄여서 컴프레서 폭발 방지
                    this.activeVoices++;
                    this.activeBufferSources.add(source);
                    const voiceScale = Math.max(0.3, 1.0 - (this.activeVoices * 0.15)); // 1개=0.85, 2개=0.7... 최소 30% 유지
                    const scaledDriveGain = driveGain * voiceScale;

                    preGainNode.gain.value = scaledDriveGain;

                    source.connect(preGainNode);

                    // Per-file loudness gain does the normalization. The compressor is
                    // the final collision/peak safety stage for every decoded SFX.
                    preGainNode.connect(this.compressor);

                    source.start(0);
                    source.onended = () => {
                        this.activeBufferSources.delete(source);
                        this.activeVoices = Math.max(0, this.activeVoices - 1);
                        source.disconnect();
                        preGainNode.disconnect();
                        resolve();
                    };
                };

                // 1. Check Cache
                if (this.bufferCache.has(playPath)) {
                    playBuffer(this.bufferCache.get(playPath));
                } else {
                    // 2. Fetch & Decode & Cache
                    fetch(playPath)
                        .then(response => {
                            if (!response.ok) throw new Error("Fetch failed");
                            return response.arrayBuffer();
                        })
                        .then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
                        .then(audioBuffer => {
                            // Cache the decoded buffer
                            this.bufferCache.set(playPath, audioBuffer);
                            // Cache eviction limit (Max 80, skip visual audio)
                            if (this.bufferCache.size > 80) {
                                for (const key of this.bufferCache.keys()) {
                                    if (!this.visualAudioPaths.has(key)) {
                                        this.bufferCache.delete(key);
                                        console.log(`[AudioManager] Evicted chat SFX from cache: ${key}`);
                                        break;
                                    }
                                }
                            }
                            playBuffer(audioBuffer);
                        })
                        .catch(e => {
                            // [Strategy B] HTML5 Fallback
                            console.warn(`[AudioManager] Fallback for "${fileName}": ${e.message}`);
                            const audio = this.createNativeAudio(playPath, {
                                type,
                                baseVolume
                            });
                            if (this.disposed) {
                                resolve();
                                return;
                            }
                            this.activeFallbackAudio.add(audio);
                            const cleanup = () => {
                                this.activeFallbackAudio.delete(audio);
                                resolve();
                            };
                            audio.onended = cleanup;
                            audio.onerror = cleanup;
                            audio.play().catch(cleanup);
                        });
                }

            } catch (e) {
                resolve();
            }
        });
    }

    // [New] Preloader 지원용 백그라운드 캐싱 메서드
    preloadList(urls) {
        if (!urls || urls.length === 0) return;
        
        // Filter to only preload visual/alert audio paths (Tier 1)
        const toPreload = urls.filter(url => this.visualAudioPaths.has(url));
        console.log(`[AudioManager] Preloading ${toPreload.length} visual/alert audio files (Lazy loading ${urls.length - toPreload.length} chat SFX in background)...`);

        // requestIdleCallback 활용으로 부하 분산
        const processAudio = (deadline) => {
            while (toPreload.length > 0 && deadline.timeRemaining() > 0) {
                const url = toPreload.pop();
                if (!this.bufferCache.has(url)) {
                    // Silently fetch and decode
                    fetch(url)
                        .then(response => {
                            if (!response.ok) throw new Error("Fetch failed");
                            return response.arrayBuffer();
                        })
                        .then(arrayBuffer => this.audioCtx.decodeAudioData(arrayBuffer))
                        .then(audioBuffer => {
                            this.bufferCache.set(url, audioBuffer);
                        })
                        .catch(e => {
                            // Do nothing on preloader failure, fallback handles it at play time
                        });
                }
            }

            if (toPreload.length > 0) {
                if (window.requestIdleCallback) {
                    requestIdleCallback(processAudio);
                } else {
                    this.timers.timeout(() => processAudio({ timeRemaining: () => 10 }), 50);
                }
            }
        };

        if (window.requestIdleCallback) {
            requestIdleCallback(processAudio);
        } else {
            this.timers.timeout(() => processAudio({ timeRemaining: () => 10 }), 50);
        }
    }
}
