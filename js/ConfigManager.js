// ==========================================
// [Class 1] Config & State Manager
// ==========================================
class ConfigManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.has('debug');
        this.loadHistory = urlParams.has('history');
        this.channelId = this._resolveChannelId();
        this.startupCommand = this._resolveStartupCommand(urlParams);

        // --- 캡슐화된 내부 상태 (Encapsulated State) ---
        this._soundConfig = {};
        this._visualConfig = {};
        this._volumeConfig = { master: 1.0, visual: 1.0, sfx: 1.0 };
        this._welcomeMessages = [];
        this._randomNames = [];
        this._normalizerConfig = { enabled: true, visual: false, sfx: false };

        this._initBroadcastChannel();
        this._loadAllConfigs(); // [NEW] 통합 로더
    }

    _resolveStartupCommand(params) {
        console.log("[Config] Resolving Startup Command from:", params.toString());
        // 1. ?debug!EffectName
        for (const [key, val] of params.entries()) {
            if (key.includes('!')) {
                const parts = key.split('!');
                if (parts[1]) {
                    try {
                        const decoded = decodeURIComponent(parts[1]);
                        console.log("[Config] Found command in key:", decoded);
                        return decoded;
                    } catch (e) {
                        console.warn("[Config] Decoding failed for key:", parts[1], e);
                        return parts[1];
                    }
                }
            }
            if (val.startsWith('!')) {
                try {
                    const decoded = decodeURIComponent(val.substring(1));
                    console.log("[Config] Found command in value:", decoded);
                    return decoded;
                } catch (e) {
                    console.warn("[Config] Decoding failed for value:", val, e);
                    return val.substring(1);
                }
            }
        }
        // 2. ?effect=EffectName
        if (params.has('effect')) {
            try {
                const decoded = decodeURIComponent(params.get('effect'));
                console.log("[Config] Found command in effect param:", decoded);
                return decoded;
            } catch (e) {
                console.warn("[Config] Decoding failed for effect param:", params.get('effect'), e);
                return params.get('effect');
            }
        }
        // 3. ?trigger=EffectName
        if (params.has('trigger')) {
            try {
                const val = params.get('trigger');
                const decoded = val.startsWith('!') ? decodeURIComponent(val.substring(1)) : decodeURIComponent(val);
                console.log("[Config] Found command in trigger param:", decoded);
                return decoded;
            } catch (e) {
                console.warn("[Config] Decoding failed for trigger param:", params.get('trigger'), e);
                return params.get('trigger');
            }
        }

        return null; // Default
    }

    _resolveChannelId() {
        // 1. 로컬 스토리지 값 최우선
        const local = localStorage.getItem('CHZZK_CHANNEL_ID');

        // 2. Config 파일 (README에 명시된 기능 복구)
        const configId = window.CHZZK_CHANNEL_ID || null;

        // 3. HTML 속성 확인 (이제 chzzkHash만 찾습니다)
        const attr = document.getElementById('id')?.getAttribute('chzzkHash');

        // twitchId는 이제 지원하지 않음
        return local || configId || attr;
    }

    _initBroadcastChannel() {
        this.bc = new BroadcastChannel('bubble_chat_control');
        this.bc.onmessage = (event) => this._handleCommand(event.data);
    }

    _handleCommand(data) {
        switch (data.type) {
            case 'setSound':
                soundEnabled = data.enabled;
                if (this.eventBus && data.enabled !== undefined) {
                    if (data.enabled) this.eventBus.emit('system:unmuteAudio');
                    else this.eventBus.emit('system:muteAudio');
                }
                this.log(`Sound: ${data.enabled}`);
                break;
            case 'reload':
                location.reload();
                break;
            case 'setChannel':
                if (data.channelId) {
                    localStorage.setItem('CHZZK_CHANNEL_ID', data.channelId);
                    location.reload();
                }
                break;
            case 'updateConfig':
                if (this.eventBus) {
                    if (data.soundConfig) {
                        // For legacy updateConfig - better emit a specific event if possible. Let's use system:updateVolume config for volume, but we might need a system:updateSoundConfig for raw config.
                        this.eventBus.emit('system:reloadSoundConfig', data.soundConfig);
                    }
                    if (data.volumeConfig) {
                        this.eventBus.emit('system:updateVolume', data.volumeConfig);
                    }
                }
                if (data.visualConfig) window.visualConfig = data.visualConfig; // 레거시 호환
                break;
        }
    }

    _loadAllConfigs() {
        // 1. config.js 에서 하드코딩된 전역 변수들(window.*)을 우선 안전하게 복사
        if (window.HIVE_SOUND_CONFIG) this._soundConfig = { ...window.HIVE_SOUND_CONFIG };
        if (window.VISUAL_CONFIG) this._visualConfig = { ...window.VISUAL_CONFIG };
        if (window.HIVE_VISUAL_CONFIG) { // Legacy 호환 혹은 병합 병행
            this._visualConfig = { ...this._visualConfig, ...window.HIVE_VISUAL_CONFIG };
        }
        if (window.HIVE_VOLUME_CONFIG) this._volumeConfig = { ...this._volumeConfig, ...window.HIVE_VOLUME_CONFIG };
        if (window.WELCOME_MESSAGES) this._welcomeMessages = [...window.WELCOME_MESSAGES];
        if (window.RANDOM_NAMES) this._randomNames = [...window.RANDOM_NAMES];
        if (window.NORMALIZER_CONFIG) this._normalizerConfig = { ...this._normalizerConfig, ...window.NORMALIZER_CONFIG };

        // 2. 로컬 스토리지 데이터로 덮어쓰기 (사용자 설정 우선)
        const savedSound = localStorage.getItem('HIVE_SOUND_CONFIG');
        if (savedSound) {
            try { this._soundConfig = { ...this._soundConfig, ...JSON.parse(savedSound) }; } catch (e) { }
        }

        const savedVolume = localStorage.getItem('HIVE_VOLUME_CONFIG');
        if (savedVolume) {
            try { this._volumeConfig = { ...this._volumeConfig, ...JSON.parse(savedVolume) }; } catch (e) { }
        }

        // 3. 전역 오염 방지: `config.js`를 통해 로드된 전역 객체 삭제 (캡슐화 완료)
        // (단, config.js가 재생성/덮어쓰기 될 때를 고려해 `config.html` 로직이 있다면 주의 필요. 지금은 맵핑용이므로 은닉.)
        try {
            delete window.HIVE_SOUND_CONFIG;
            delete window.VISUAL_CONFIG;
            delete window.HIVE_VISUAL_CONFIG;
            delete window.HIVE_VOLUME_CONFIG;
            delete window.WELCOME_MESSAGES;
            delete window.RANDOM_NAMES;
            delete window.NORMALIZER_CONFIG;
        } catch (e) {
            console.warn("[ConfigManager] Could not delete global window variables.");
        }

        console.log("[ConfigManager] All configurations securely encapsulated.");
    }

    // ==========================================
    // [Getter Methods] - 내부 설정을 안전하게 제공
    // ==========================================
    getSoundConfig() { return this._soundConfig; }
    getVisualConfig() { return this._visualConfig; }
    getVolumeConfig() { return this._volumeConfig; }
    getWelcomeMessages() { return this._welcomeMessages; }
    getRandomNames() { return this._randomNames; }
    getNormalizerConfig() { return this._normalizerConfig; }

    // ==========================================
    // [Setter Methods] - 설정 변경 시 내부 객체와 로컬스토리지만 업데이트
    // ==========================================
    updateVolumeConfig(newConfig) {
        this._volumeConfig = { ...this._volumeConfig, ...newConfig };
        try {
            localStorage.setItem('HIVE_VOLUME_CONFIG', JSON.stringify(this._volumeConfig));
            console.log(`[Config] Volume updated:`, this._volumeConfig);
        } catch (e) { console.error("Volume Save Failed"); }
        return this._volumeConfig;
    }

    updateSoundConfig(newConfig) {
        this._soundConfig = { ...this._soundConfig, ...newConfig };
        // 필요시 저장소 업데이트 추가
        return this._soundConfig;
    }

    log(msg) {
        console.log(`[Config] ${msg}`);
        if (this.debugMode) this._visualLog(msg);
    }

    _visualLog(msg) {
        let box = document.getElementById('debug-log-box');
        if (!box) {
            box = document.createElement('div');
            box.id = 'debug-log-box';
            Object.assign(box.style, {
                position: 'fixed', bottom: '10px', right: '10px', width: '300px',
                maxHeight: '200px', background: 'rgba(0,0,0,0.8)', color: '#0f0',
                fontSize: '12px', zIndex: '10000', overflowY: 'auto'
            });
            document.body.appendChild(box);
        }
        const line = document.createElement('div');
        line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        box.appendChild(line);
        box.scrollTop = box.scrollHeight;
    }
}
