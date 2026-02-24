// ==========================================
// [Class 7] Debug Controller
// * 기능: url 파라미터(?debug) 감지 시 활성화되는 개발 및 테스트 기능들 은닉
// ==========================================
class DebugController {
    constructor(configManager, eventBus) {
        this.config = configManager;
        this.eventBus = eventBus;

        this._demoInterval = null;
        this._demoTimeout = null;
        this._welcomeInterval = null;
        this._stressTestInterval = null;

        // URL 파라미터를 통해 직접 구동 여부 판단
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.has('debug');

        if (this.debugMode) {
            console.warn("🛠️ [DebugController] Debug Mode ON. Exposing global test methods.");
            this._exposeMethods();
            this._startWelcomeLoop();

            // 연결 시 종료되도록 리스너 등록
            window.addEventListener('chzzk_connected', () => this.stopAll(), { once: true });
        }
    }

    _exposeMethods() {
        window.stopDemoSequence = () => {
            if (this._demoInterval) clearInterval(this._demoInterval);
            if (this._demoTimeout) clearTimeout(this._demoTimeout);
            this._demoInterval = null;
            this._demoTimeout = null;
            console.log("🎬 Demo Sequence Stopped.");
            if (window.processMessage) {
                window.processMessage({
                    message: "데모가 중단되었습니다.", nickname: "System", isStreamer: true, type: 'chat'
                });
            }
        };

        window.runDemoSequence = (durationSeconds = 60) => {
            window.stopDemoSequence();
            const maxDuration = durationSeconds * 1000;
            console.log(`🎬 Starting Demo Sequence (${durationSeconds}s)...`);

            const names = this.config.getRandomNames() || ["Anonymous", "트수", "시청자"];

            this._demoInterval = setInterval(() => {
                const messages = this.config.getWelcomeMessages();
                if (!messages || messages.length === 0) return;

                const msg = messages[Math.floor(Math.random() * messages.length)];
                const name = names[Math.floor(Math.random() * names.length)];
                const demoColors = ["#ff4444", "#44ff44", "#44bbff", "#ffff44", "#ff88ff", "#44ffff", "#ffa500", "#ffffff"];
                const color = demoColors[Math.floor(Math.random() * demoColors.length)];

                if (window.processMessage) {
                    window.processMessage({
                        message: msg, nickname: name, color: color, badges: [], emojis: {},
                        isStreamer: true, uid: 'demo_' + Math.random().toString(36).substr(2, 9),
                        type: 'chat', isDonation: false, isSubscription: false
                    });
                }
            }, 1500);

            this._demoTimeout = setTimeout(() => {
                window.stopDemoSequence();
                console.log("🎬 Demo Sequence Finished.");
                if (window.processMessage) {
                    window.processMessage({
                        message: "데모가 종료되었습니다.", nickname: "System", isStreamer: true, type: 'chat'
                    });
                }
            }, maxDuration);
        };

        // Queue Stress Test (Random Burst Mode)
        window.runQueueStressTest = () => {
            if (this._stressTestInterval) {
                clearInterval(this._stressTestInterval);
                this._stressTestInterval = null;
            }
            console.warn("🚀 Starting Queue Stress Test (Random 0-3 msg/sec)...");
            let msgId = 1;
            let seconds = 0;

            const sendBatch = (count, label) => {
                console.log(`🔥 [Test] Sending Batch: ${label} (${count} msgs)`);
                const messages = this.config.getWelcomeMessages() || ["테스트 메시지"];
                const names = this.config.getRandomNames() || ["Tester"];

                for (let i = 0; i < count; i++) {
                    const rawMsg = messages[Math.floor(Math.random() * messages.length)];
                    const randomName = names[Math.floor(Math.random() * names.length)];

                    if (window.processMessage) {
                        window.processMessage({
                            message: rawMsg, nickname: randomName, isStreamer: false, type: 'chat',
                            uid: 'test_' + msgId + '_' + i
                        });
                    }
                    msgId++;
                }
            };

            this._stressTestInterval = setInterval(() => {
                seconds++;
                if (seconds > 20) {
                    clearInterval(this._stressTestInterval);
                    this._stressTestInterval = null;
                    console.warn("🚀 Stress Test Completed (20s Limit).");
                    return;
                }
                const randomCount = Math.floor(Math.random() * 4); // 0 ~ 3
                if (randomCount > 0) sendBatch(randomCount, `Sec-${seconds}`);
            }, 1000);
        };

        // 자동 실행 (선택사항, main.js에서 하던 역할 복구)
        setTimeout(() => { if (window.runQueueStressTest) window.runQueueStressTest(); }, 500);
    }

    _startWelcomeLoop() {
        if (this._welcomeInterval) clearInterval(this._welcomeInterval);
        const messages = this.config.getWelcomeMessages();
        if (!messages || messages.length === 0) return;

        console.log("Starting Welcome Message Loop (Debug Mode)...");
        const names = this.config.getRandomNames() || ["Anonymous"];
        const vConf = this.config.getVisualConfig() || {};
        const visualKeys = Object.keys(vConf).length > 0 ? Object.keys(vConf) : ['해골', '돌핀', '버질', '하트', '커플', '우쇼', '발파', '방종송'];

        this._welcomeInterval = setInterval(() => {
            let msg = messages[Math.floor(Math.random() * messages.length)];
            let isVisual = false;

            if (!msg.startsWith('!') && Math.random() < 0.3) {
                const randomVisual = visualKeys[Math.floor(Math.random() * visualKeys.length)];
                msg = `!${randomVisual} ${msg}`;
                isVisual = true;
            }

            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomUid = 'bot_' + Math.random().toString(36).substr(2, 9);

            if (window.processMessage) {
                window.processMessage({
                    message: msg, nickname: randomName, color: null, badges: [], emojis: {},
                    isStreamer: isVisual, uid: randomUid, type: 'chat',
                    isDonation: false, isSubscription: false
                });
            }
        }, 2000);
    }

    stopAll() {
        if (this._demoInterval) clearInterval(this._demoInterval);
        if (this._demoTimeout) clearTimeout(this._demoTimeout);
        if (this._welcomeInterval) clearInterval(this._welcomeInterval);
        if (this._stressTestInterval) clearInterval(this._stressTestInterval);

        this._demoInterval = null;
        this._demoTimeout = null;
        this._welcomeInterval = null;
        this._stressTestInterval = null;

        // Remove global references if necessary, or just leave them cleanly stopped.
    }
}
