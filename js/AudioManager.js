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
        return AudioPlaybackEngine.play(this, input, options);
    }
    // [New] Preloader 지원용 백그라운드 캐싱 메서드
    preloadList(urls) {
        return AudioPlaybackEngine.preload(this, urls);
    }
}
