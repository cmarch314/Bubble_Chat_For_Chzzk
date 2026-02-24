// ==========================================
// [Class 3] Audio Manager (Sound Engine)
// ==========================================
// ==========================================
// [Class 2] Audio Controller (Tunable & Smart-Router)
// * 기능: Config 설정을 받아 실시간으로 오디오를 평준화하거나 우회함
// ==========================================
class AudioManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.basePath = './SFX/';
        // [Performance] 오디오 버퍼 캐시 (중복 로딩 방지)
        this.bufferCache = new Map();

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
        this.volumeConfig = window.__INITIAL_VOLUME_CONFIG || { master: 1.0, visual: 1.0, sfx: 1.0 };
        // [User Request] Start with low SFX volume during loading
        this.volumeConfig.sfx = 0.1;
        this.updateConfigLegacy(window.__INITIAL_SOUND_CONFIG || {});

        // Event Bus Listeners
        if (this.eventBus) {
            this.eventBus.on('audio:playSFX', (soundPath, options) => {
                this.playSound(soundPath, options);
            });
            this.eventBus.on('audio:playVisualSound', (soundPath) => {
                this.playSound(soundPath, { force: true, type: 'visual' });
            });
            this.eventBus.on('system:muteAudio', () => {
                this.setEnabled(false);
                this.playSound(this.soundHive['윈도우종료'], { force: true });
            });
            this.eventBus.on('system:unmuteAudio', () => {
                this.setEnabled(true);
            });
            this.eventBus.on('system:toggleAudio', () => {
                const next = !this.enabled;
                this.setEnabled(next);
                if (!next) {
                    this.playSound(this.soundHive['윈도우종료'], { force: true });
                }
            });
            this.eventBus.on('system:updateVolume', (config) => {
                this.updateVolumeConfig(config);
            });
            this.eventBus.on('system:updateConfig', (key) => {
                if (key === '켜기') this.updateConfig('all', true);
                else if (key === '끄기') this.updateConfig('all', false);
                else if (key === '도네') this.updateConfig('visual');
                else if (key === '채팅') this.updateConfig('sfx');
            });
        }
    }

    _updateCompressorSettings() {
        if (!this.compressor) return;
        const settings = window.COMPRESSOR_SETTINGS || {
            threshold: -15, knee: 0, ratio: 20, attack: 0, release: 0.1
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
        this.soundHive = {};
        const processItem = (item) => {
            if (typeof item === 'string') return `SFX/${item}`;
            else if (typeof item === 'object' && item !== null && item.src) return { ...item, src: `SFX/${item.src}` };
            return item;
        };
        for (const [key, value] of Object.entries(config)) {
            if (Array.isArray(value)) this.soundHive[key] = value.map(processItem);
            else this.soundHive[key] = processItem(value);
        }
        window.soundHive = this.soundHive;
    }

    updateVolumeConfig(config) {
        if (!config) return;
        this.volumeConfig = { ...this.volumeConfig, ...config };

        // Persist to LocalStorage
        try {
            const current = JSON.parse(localStorage.getItem('HIVE_VOLUME_CONFIG') || "{}");
            Object.assign(current, config);
            localStorage.setItem('HIVE_VOLUME_CONFIG', JSON.stringify(current));

            if (!window.HIVE_VOLUME_CONFIG) window.HIVE_VOLUME_CONFIG = {};
            Object.assign(window.HIVE_VOLUME_CONFIG, config);
        } catch (e) {
            console.error("Save Failed:", e);
        }
    }

    // [명령어] 설정 변경 메서드 (New)
    updateConfig(key, value) {
        const conf = window.NORMALIZER_CONFIG;
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
        console.log(msg); // 콘솔 확인용
        return msg;
    }

    // 소리만 재생 (채팅 트리거용 - Legacy Logic 유지)
    checkAndPlay(message, force = false) {
        if (!this.enabled && !force) return;
        // [User Request] 띄어쓰기 상관없이 발동되도록 공백 모두 제거
        const normOriginal = message.normalize('NFC').replace(/\s+/g, '');

        const visualKeys = new Set();
        if (window.HIVE_VISUAL_CONFIG) {
            Object.keys(window.HIVE_VISUAL_CONFIG).forEach(k => {
                visualKeys.add(k.normalize('NFC').replace(/\s+/g, ''));
                const val = window.HIVE_VISUAL_CONFIG[k];
                if (val && val.soundKey) visualKeys.add(val.soundKey.normalize('NFC').replace(/\s+/g, ''));
                // [New] Also exclude audioOverride keys from chat triggers so they don't double-play or play via chat
                if (val && val.audioOverride) visualKeys.add(val.audioOverride.normalize('NFC').replace(/\s+/g, ''));
            });
        }

        const lowerOriginal = normOriginal.toLowerCase(); // Case-insensitive matching

        let allMatches = [];
        Object.keys(this.soundHive).forEach(keyword => {
            const originalNormKey = keyword.normalize('NFC');
            const normKey = originalNormKey.replace(/\s+/g, ''); // 키워드의 공백도 제거
            if (normKey.length === 0) return; // 빈 키워드 방지

            const lowerKey = normKey.toLowerCase();
            if (visualKeys.has(normKey)) return;

            let searchPos = 0, index;
            while ((index = lowerOriginal.indexOf(lowerKey, searchPos)) !== -1) {
                allMatches.push({
                    startIndex: index,
                    endIndex: index + normKey.length,
                    length: normKey.length,
                    sound: this.soundHive[keyword],
                    keyword: originalNormKey // 원본 키워드 유지 (중복 방지용)
                });
                searchPos = index + 1;
            }
        });

        allMatches.sort((a, b) => (a.startIndex === b.startIndex) ? b.length - a.length : a.startIndex - b.startIndex);

        let sequence = [], lastEnd = 0;
        let usedKeywords = new Set();

        for (let match of allMatches) {
            if (match.startIndex >= lastEnd) {
                const firstChar = match.keyword[0];
                // [Fix] Allow single-character keywords (like "쎅") to repeat. Only restrict multi-char repeats (like "ㅋㅋㅋㅋ").
                const isSingleCharRepeat = match.keyword.length > 1 && match.keyword.split('').every(c => c === firstChar);

                // [사용자 피드백 반영]
                // 1. "ㅋㅋㅋㅋ" 같은 한 글자 반복형 키워드만 딱 한 번만 나오도록 제한
                if (isSingleCharRepeat && usedKeywords.has(match.keyword)) continue;

                sequence.push(match);
                lastEnd = match.endIndex;
                usedKeywords.add(match.keyword);

                // 2. 한 글자 반복형인 경우, 뒤에 붙어있는 똑같은 글자들을 모두 건너뜁니다 (중복 방지)
                if (isSingleCharRepeat) {
                    while (lastEnd < normOriginal.length && normOriginal[lastEnd] === firstChar) {
                        lastEnd++;
                    }
                }
            }
        }

        if (sequence.length > 0) {
            (async () => {
                // 매번 재생 전 컴프레서 설정을 최신화 (실시간 반영)
                this._updateCompressorSettings();
                for (let item of sequence.slice(0, 5)) { await this.playSound(item.sound, { force, type: 'sfx' }); }
            })();
        }
    }

    // ★★★ [Split Gain Staging Edition] playSound ★★★
    async playSound(input, options = {}) {
        let force = false;
        let type = 'sfx';

        if (typeof options === 'boolean') {
            force = options;
        } else {
            force = options.force || false;
            type = options.type || 'sfx';
        }

        // 1. 상태 체크
        const isActuallyEnabled = (typeof window.soundEnabled !== 'undefined') ? window.soundEnabled : this.enabled;
        if (!isActuallyEnabled && !force) return;
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

        // [중복 방지] 시각 효과 사운드 중복 차단
        const visualConf = window.HIVE_VISUAL_CONFIG || {};
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
        let playPath = fileName;
        if (!playPath.includes('/') && !playPath.includes('\\')) playPath = this.basePath + playPath;

        const volConfig = this.volumeConfig || { master: 1, visual: 1, sfx: 1 };
        const normConfig = window.NORMALIZER_CONFIG || { enabled: true, visual: false, sfx: true };
        const applyNormalizer = normConfig.enabled &&
            ((type === 'visual' && normConfig.visual) || (type === 'sfx' && normConfig.sfx));

        // ★★★ [Gain Staging] ★★★
        // Input Drive: 컴프레서로 밀어넣는 소리의 크기 (입력 배율만 적용)
        const typeMultiplier = (type === 'visual') ? volConfig.visual : volConfig.sfx;
        const driveGain = baseVolume * typeMultiplier;

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
                    const source = this.audioCtx.createBufferSource();
                    source.buffer = audioBuffer;

                    const preGainNode = this.audioCtx.createGain();
                    preGainNode.gain.value = driveGain;

                    source.connect(preGainNode);

                    if (applyNormalizer) {
                        preGainNode.connect(this.compressor);
                        console.log(`[Staging] ON - Drive:${driveGain.toFixed(1)} -> Comp -> Ceiling:${outputCeiling.toFixed(1)}`);
                    } else {
                        preGainNode.connect(this.masterGain);
                        console.log(`[Staging] OFF - Drive:${driveGain.toFixed(1)} -> Ceiling:${outputCeiling.toFixed(1)}`);
                    }

                    source.start(0);
                    source.onended = () => {
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
                            playBuffer(audioBuffer);
                        })
                        .catch(e => {
                            // [Strategy B] HTML5 Fallback
                            console.warn(`[AudioManager] Fallback for "${fileName}": ${e.message}`);
                            const audio = new Audio(playPath);
                            audio.volume = Math.min(1.0, Math.max(0, driveGain * outputCeiling));
                            audio.onended = () => resolve();
                            audio.onerror = () => resolve();
                            audio.play().catch(err => resolve());
                        });
                }

            } catch (e) {
                resolve();
            }
        });
    }
}
