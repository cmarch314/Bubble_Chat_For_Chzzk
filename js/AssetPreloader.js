// ==========================================
// [Class] Asset Preloader
// * 기능: 미디어 리소스(이미지, 비디오, 음원)를 브라우저 백그라운드에서 캐싱하여 체감 지연 시간을 0ms로 만듭니다.
// ==========================================
class AssetPreloader {
    constructor(configManager, audioManager) {
        this.configManager = configManager;
        this.audioManager = audioManager;
        this.hasStarted = false;
    }

    start() {
        if (this.hasStarted) return;
        this.hasStarted = true;
        console.log("📥 [Preloader] Starting Background Asset Caching...");

        // 1. 시각 이펙트 미디어 세트 추출
        const vConf = this.configManager.getVisualConfig();
        const mediaUrls = new Set();
        const soundKeys = new Set();

        if (vConf) {
            Object.values(vConf).forEach(effect => {
                if (effect.gifPath) mediaUrls.add(effect.gifPath);
                if (effect.videoPath) mediaUrls.add(effect.videoPath);
                if (effect.backgroundVideoPath) mediaUrls.add(effect.backgroundVideoPath);
                if (effect.teostraPath) mediaUrls.add(effect.teostraPath);
                if (effect.lunastraPath) mediaUrls.add(effect.lunastraPath);
                // 등등 명시적으로 경로가 있는 이미지/비디오들 추가

                // 사운드 키 수집 (중복 제거)
                if (effect.soundKey) soundKeys.add(effect.soundKey);
                if (effect.audioOverride) soundKeys.add(effect.audioOverride);
            });
        }

        // 2. 사운드(오디오) 리스트 추출
        const sConf = this.configManager.getSoundConfig();
        const rawAudioUrls = new Set();

        if (sConf) {
            // 시각 효과 관련 음원 우선 로딩, 혹은 전체 사운드 로딩
            // 전체 사운드를 캐싱하면 첫 1회 메모리가 소량 증가하지만 즉각 반응 (추천)
            Object.values(sConf).forEach(item => {
                const processItem = (obj) => {
                    const src = (typeof obj === 'object') ? obj.src : obj;
                    if (src) {
                        const path = src.includes('/') || src.includes('\\') ? src : `./SFX/${src}`;
                        rawAudioUrls.add(path);
                    }
                };

                if (Array.isArray(item)) {
                    item.forEach(processItem);
                } else {
                    processItem(item);
                }
            });
        }

        // 3. 브라우저 캐시에 이미지/비디오 Preload 태그 주입
        this._preloadMedia(Array.from(mediaUrls));

        // 4. Audio Engine 에 백그라운드 디코딩 요청
        if (this.audioManager && this.audioManager.preloadList) {
            this.audioManager.preloadList(Array.from(rawAudioUrls));
        } else {
            console.warn("[Preloader] AudioManager does not support preloadList.");
        }
    }

    _preloadMedia(urls) {
        if (!urls || urls.length === 0) return;
        console.log(`[Preloader] Preloading ${urls.length} media files...`);

        // 유휴 상태(requestIdleCallback)를 활용하여 DOM 부하 분산
        const processItems = (deadline) => {
            while (urls.length > 0 && deadline.timeRemaining() > 0) {
                const url = urls.pop();
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = url;

                // 확장자에 따라 as 속성 지정
                if (url.endsWith('.mp4') || url.endsWith('.webm')) {
                    link.as = 'video';
                } else {
                    link.as = 'image';
                }

                document.head.appendChild(link);
            }

            if (urls.length > 0) {
                if (window.requestIdleCallback) {
                    requestIdleCallback(processItems);
                } else {
                    setTimeout(() => processItems({ timeRemaining: () => 10 }), 50);
                }
            }
        };

        if (window.requestIdleCallback) {
            requestIdleCallback(processItems);
        } else {
            setTimeout(() => processItems({ timeRemaining: () => 10 }), 50);
        }
    }
}
