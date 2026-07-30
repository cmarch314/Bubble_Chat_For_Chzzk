class AudioPlaybackEngine {
    static trimBufferCache(manager, maxEntries = 80) {
        const cache = manager?.bufferCache;
        if (!cache || typeof cache.keys !== 'function' || typeof cache.delete !== 'function') return;
        const protectedPaths = manager.visualAudioPaths || new Set();
        while (cache.size > maxEntries) {
            const keys = [...cache.keys()];
            const victim = keys.find(key => !protectedPaths.has(key)) || keys[0];
            if (victim === undefined) break;
            cache.delete(victim);
        }
    }

    static async play(manager, input, options = {}) {
        if (manager.disposed) return;
        let force = false;
        let type = 'sfx';

        if (typeof options === 'boolean') {
            force = options;
        } else {
            force = options.force || false;
            type = options.type || 'sfx';
        }

        // 1. 상태 체크
        if (!manager.enabled && !force) return;
        if (manager.audioCtx.state === 'suspended') manager.audioCtx.resume().catch(() => { });

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
        if (manager.configManager) {
            let cleanFile = fileName.replace(/^\.\//, '');
            if (cleanFile.startsWith('SFX/')) {
                cleanFile = cleanFile.substring(4);
            }
            const excludedList = manager.configManager.getExcludedSfx() || [];
            
            // Resolve physical path first for exclusion check
            let lookupPath = cleanFile;
            const renames = manager.configManager.getSfxRenames() || {};
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
        const visualConf = manager.configManager ? manager.configManager.getVisualConfig() : {};
        const isVisualSound = Object.values(visualConf).some(vConf => {
            // Check both soundKey and audioOverride
            const checkKeys = [];
            if (vConf.soundKey) checkKeys.push(vConf.soundKey);
            if (vConf.audioOverride) checkKeys.push(vConf.audioOverride);

            return checkKeys.some(k => {
                const mapped = (manager.soundHive || {})[k];
                if (!mapped) return false;
                const checkSrc = (item) => (typeof item === 'object' ? item.src : item) || "";
                if (Array.isArray(mapped)) return mapped.some(item => checkSrc(item).includes(fileName));
                return checkSrc(mapped).includes(fileName);
            });
        });
        if (type === 'sfx' && isVisualSound) return;

        // 3. 경로 및 설정 로드
        let playPath = manager.resolveAudioPath(fileName);

        const volConfig = manager.volumeConfig || { master: 1, visual: 1, sfx: 1 };
        // ★★★ [Gain Staging] ★★★
        // Input Drive: 컴프레서로 밀어넣는 소리의 크기 (입력 배율만 적용)
        const typeMultiplier = (type === 'visual') ? volConfig.visual : volConfig.sfx;
        const profileGain = manager._profileGain(playPath, type);
        const driveGain = baseVolume * typeMultiplier * profileGain;

        // Output Ceiling: 컴프레서를 거친 뒤의 최종 볼륨 (Master 적용)
        const outputCeiling = volConfig.master;
        manager.masterGain.gain.setTargetAtTime(outputCeiling, manager.audioCtx.currentTime, 0.05);

        return new Promise((resolve) => {
            try {
                // [Strategy A] Web Audio Buffer (Drive -> Limiter -> Ceiling)
                // Helper: Play from decoded buffer
                const playBuffer = (audioBuffer) => {
                    if (manager.disposed) {
                        resolve();
                        return;
                    }
                    const source = manager.audioCtx.createBufferSource();
                    source.buffer = audioBuffer;

                    const preGainNode = manager.audioCtx.createGain();

                    // [Dynamic Volume Scaling] 소리가 겹칠수록 볼륨을 줄여서 컴프레서 폭발 방지
                    manager.activeVoices++;
                    manager.activeBufferSources.add(source);
                    const voiceScale = Math.max(0.3, 1.0 - (manager.activeVoices * 0.15)); // 1개=0.85, 2개=0.7... 최소 30% 유지
                    const scaledDriveGain = driveGain * voiceScale;

                    preGainNode.gain.value = scaledDriveGain;

                    source.connect(preGainNode);

                    // Per-file loudness gain does the normalization. The compressor is
                    // the final collision/peak safety stage for every decoded SFX.
                    preGainNode.connect(manager.compressor);

                    source.start(0);
                    source.onended = () => {
                        manager.activeBufferSources.delete(source);
                        manager.activeVoices = Math.max(0, manager.activeVoices - 1);
                        source.disconnect();
                        preGainNode.disconnect();
                        resolve();
                    };
                };

                // 1. Check Cache
                if (manager.bufferCache.has(playPath)) {
                    const cachedBuffer = manager.bufferCache.get(playPath);
                    // Map insertion order is the LRU order used by trimBufferCache.
                    manager.bufferCache.delete(playPath);
                    manager.bufferCache.set(playPath, cachedBuffer);
                    playBuffer(cachedBuffer);
                } else {
                    // 2. Fetch & Decode & Cache
                    fetch(playPath)
                        .then(response => {
                            if (!response.ok) throw new Error("Fetch failed");
                            return response.arrayBuffer();
                        })
                        .then(arrayBuffer => manager.audioCtx.decodeAudioData(arrayBuffer))
                        .then(audioBuffer => {
                            // Cache the decoded buffer
                            manager.bufferCache.set(playPath, audioBuffer);
                            // Visual clips are preferred, but never allowed to defeat the hard cap.
                            AudioPlaybackEngine.trimBufferCache(manager);
                            playBuffer(audioBuffer);
                        })
                        .catch(e => {
                            // [Strategy B] HTML5 Fallback
                            console.warn(`[AudioManager] Fallback for "${fileName}": ${e.message}`);
                            const audio = manager.createNativeAudio(playPath, {
                                type,
                                baseVolume
                            });
                            if (manager.disposed) {
                                manager.releaseMediaElement?.(audio);
                                resolve();
                                return;
                            }
                            manager.activeFallbackAudio.add(audio);
                            const cleanup = () => {
                                manager.activeFallbackAudio.delete(audio);
                                manager.releaseMediaElement?.(audio);
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


    static preload(manager, urls) {
        if (!urls || urls.length === 0) return;
        
        // Filter to only preload visual/alert audio paths (Tier 1)
        const toPreload = urls.filter(url => manager.visualAudioPaths.has(url));
        console.log(`[AudioManager] Preloading ${toPreload.length} visual/alert audio files (Lazy loading ${urls.length - toPreload.length} chat SFX in background)...`);

        // requestIdleCallback 활용으로 부하 분산
        const processAudio = (deadline) => {
            while (toPreload.length > 0 && deadline.timeRemaining() > 0) {
                const url = toPreload.pop();
                if (!manager.bufferCache.has(url)) {
                    // Silently fetch and decode
                    fetch(url)
                        .then(response => {
                            if (!response.ok) throw new Error("Fetch failed");
                            return response.arrayBuffer();
                        })
                        .then(arrayBuffer => manager.audioCtx.decodeAudioData(arrayBuffer))
                        .then(audioBuffer => {
                            manager.bufferCache.set(url, audioBuffer);
                            AudioPlaybackEngine.trimBufferCache(manager);
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
                    manager.timers.timeout(() => processAudio({ timeRemaining: () => 10 }), 50);
                }
            }
        };

        if (window.requestIdleCallback) {
            requestIdleCallback(processAudio);
        } else {
            manager.timers.timeout(() => processAudio({ timeRemaining: () => 10 }), 50);
        }
    }
}
