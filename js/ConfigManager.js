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

        this._initBroadcastChannel();
        this._loadLocalConfig();
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

    _loadLocalConfig() {
        // config.js 혹은 로컬스토리지 로드
        const defaultsSound = window.HIVE_SOUND_CONFIG || {};
        const savedSound = localStorage.getItem('HIVE_SOUND_CONFIG');
        let activeSound = defaultsSound;

        if (savedSound) {
            try { activeSound = { ...defaultsSound, ...JSON.parse(savedSound) }; } catch (e) { }
        }

        const defaultsVolume = window.HIVE_VOLUME_CONFIG || { master: 1.0, visual: 1.0, sfx: 1.0 };
        const savedVolume = localStorage.getItem('HIVE_VOLUME_CONFIG');
        let activeVolume = defaultsVolume;

        if (savedVolume) {
            try { activeVolume = { ...defaultsVolume, ...JSON.parse(savedVolume) }; } catch (e) { }
        }

        // AudioManager가 생성된 후 설정 주입을 위해 전역에 잠시 저장
        window.__INITIAL_SOUND_CONFIG = activeSound;
        window.__INITIAL_VOLUME_CONFIG = activeVolume;
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
