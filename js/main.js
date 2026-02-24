// [Execution & Init]
// ==========================================
const eventBus = new EventBus();

const appConfig = new ConfigManager();
const audioManager = new AudioManager(appConfig, eventBus);
const chatRenderer = new ChatRenderer(eventBus);
const visualDirector = new VisualDirector(appConfig, eventBus);
const systemController = new SystemController(eventBus);

// 네트워크 연결 시작
// [Global Refactor] Process Message Logic for portability (Real & Fake)
// 내부 처리 함수를 Event Bus Listener로 변환
eventBus.on('chat:process', (msgData) => {
    // 0. 스트리머 전용 제어 명령어 처리 (Refactored)
    if (systemController.handle(msgData)) return;

    // 구독 알람의 경우 메시지가 없으면 기본 문구 삽입 (Protocol V1.0)
    if (msgData.isSubscription && !msgData.message) {
        msgData.message = `${msgData.nickname}님 ${msgData.subMonth}개월 구독`;
    }

    // [Debug] 모든 채팅 끝에 msgType 표시 (제거됨)
    const updatedTrimmedMsg = msgData.message ? msgData.message.trim() : "";

    // 0.5 특별 이벤트(구독) 처리
    if (msgData.isSubscription) {
        if (visualDirector.alertsEnabled || msgData.isStreamer) {
            visualDirector.trigger('dolphin', {
                message: "!돌핀 " + msgData.message,
                emotes: msgData.emojis,
                nickname: msgData.nickname,
                color: msgData.color,
                isStreamer: msgData.isStreamer
            });
        }
        return; // 구독은 항상 버블 숨김
    }

    // 1. 비주얼 이펙트 트리거 확인 (VisualDirector 위임)
    // [Fix] Check if VisualDirector has a handler for this keyword
    // Iterate registry keys to find match at start of message
    let foundKeyword = null;
    const visualMap = visualDirector.registry; // Access registry directly or via getter

    // Check strict matches "!명령어"
    const lowerTrimmedMsg = updatedTrimmedMsg.toLowerCase();
    for (const key in visualMap) {
        if (key === 'dolphin' && !msgData.isStreamer) continue;
        if (key === 'bangjong' && !msgData.isStreamer) continue;
        if (key === 'mulsulsan' && (!msgData.isStreamer && !msgData.isDonation)) continue;
        if (key === 'gazabu' && (!msgData.isStreamer && !msgData.isDonation)) continue;
        if (key === 'random_dance' && (!msgData.isStreamer && !msgData.isDonation)) continue;
        const effect = visualMap[key];
        const soundKey = effect.soundKey; // e.g. "해골"
        const lowerSoundKey = soundKey.toLowerCase();

        // Check "!해골" or "!skull" (case-insensitive)
        if (lowerTrimmedMsg.startsWith("!" + lowerSoundKey)) {
            foundKeyword = key;
            break;
        }
    }

    if (foundKeyword) {
        const effectType = visualMap[foundKeyword];
        let shouldTrigger = false;

        if (msgData.isDonation) {
            // 후원은 알람 토글(alertsEnabled) 기준
            if (visualDirector.alertsEnabled || msgData.isStreamer) shouldTrigger = true;
        } else {
            // 일반 채팅은 이펙트 토글(enabled) 기준
            if (visualDirector.enabled || msgData.isStreamer) shouldTrigger = true;
        }

        if (shouldTrigger) {
            visualDirector.trigger(foundKeyword, {
                message: updatedTrimmedMsg,
                emotes: msgData.emojis,
                nickname: msgData.nickname,
                color: msgData.color,
                isStreamer: msgData.isStreamer
            });
            // [Fix] Hide chat message if visual effect is triggered (Requested by User)
            // But verify if it's a donation - donation needs to play TTS/Audio via AudioManager?
            // The original logic flowed down to audioManager.checkAndPlay.
            // If the user wants to HIDE it from chat ("채팅창에 등장 자체를 안해야하는데"),
            // we should return here unless it's a donation which might need a bubble?
            // User said "!갓겜송 is showing up... shouldn't appear".
            // So we return immediately after trigger.
            // However, we must ensure donation audio checks if needed.
            // Since this is a visual effect command, usually audio is handled by the effect itself.
            return;
        }

        if (msgData.isDonation) {
            audioManager.checkAndPlay(msgData.message, msgData.isStreamer);
            return;
        }
    } else {
        const t0 = performance.now();
        audioManager.checkAndPlay(msgData.message, msgData.isStreamer);
        if (msgData.isDonation) return;
        eventBus.emit('chat:render', msgData);

        const t1 = performance.now();
        if ((t1 - t0) > 10) {
            console.warn(`[Slow Render] Took ${(t1 - t0).toFixed(2)}ms`);
        }
    }
});

// 큐 인스턴스 생성
const messageQueue = new MessageQueue(eventBus);

// 외부 노출 진입점 (큐에 직접 넣기 - 레거시 호환용)
window.processMessage = (msgData) => {
    messageQueue.enqueue(msgData);
};

// EventBus 리스너 등록: ChzzkGateway에서 받은 메시지를 처리 큐로 넘김
eventBus.on('chat:received', (msgData) => {
    messageQueue.enqueue(msgData);
});

// 네트워크 연결 시작
const network = new ChzzkGateway(appConfig, eventBus);

// [Feature] Demo Mode (Triggered by !데모)
let _demoInterval = null;
let _demoTimeout = null;

window.stopDemoSequence = () => {
    if (_demoInterval) clearInterval(_demoInterval);
    if (_demoTimeout) clearTimeout(_demoTimeout);
    _demoInterval = null;
    _demoTimeout = null;
    console.log("🎬 Demo Sequence Stopped.");
    window.processMessage({
        message: "데모가 중단되었습니다.",
        nickname: "System",
        isStreamer: true,
        type: 'chat'
    });
};

window.runDemoSequence = (durationSeconds = 60) => {
    // Ensure previous demo is stopped
    if (_demoInterval || _demoTimeout) {
        if (_demoInterval) clearInterval(_demoInterval);
        if (_demoTimeout) clearTimeout(_demoTimeout);
    }

    const maxDuration = durationSeconds * 1000;
    console.log(`🎬 Starting Demo Sequence (${durationSeconds}s)...`);
    let demoCount = 0;
    const intervalTime = 1500; // Fast pace
    const names = appConfig.getRandomNames() || ["Anonymous", "트수", "시청자"];

    _demoInterval = setInterval(() => {
        if (!appConfig.getWelcomeMessages() || appConfig.getWelcomeMessages().length === 0) return;

        // Random Message
        const msg = appConfig.getWelcomeMessages()[Math.floor(Math.random() * appConfig.getWelcomeMessages().length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const demoColors = ["#ff4444", "#44ff44", "#44bbff", "#ffff44", "#ff88ff", "#44ffff", "#ffa500", "#ffffff"];
        const color = demoColors[Math.floor(Math.random() * demoColors.length)];

        window.processMessage({
            message: msg,
            nickname: name,
            color: color,
            badges: [],
            emojis: {},
            isStreamer: true, // Force trigger effects
            uid: 'demo_' + Math.random().toString(36).substr(2, 9),
            type: 'chat',
            isDonation: false,
            isSubscription: false
        });

        demoCount++;
    }, intervalTime);

    // Stop after duration
    _demoTimeout = setTimeout(() => {
        clearInterval(_demoInterval);
        _demoInterval = null;
        _demoTimeout = null;
        console.log("🎬 Demo Sequence Finished.");
        window.processMessage({
            message: "데모가 종료되었습니다.",
            nickname: "System",
            isStreamer: true,
            type: 'chat'
        });
    }, maxDuration);
};

// [Feature] Startup Random Welcome Messages (Debug Mode Only)
let welcomeInterval = null;

if (appConfig.debugMode && appConfig.getWelcomeMessages() && appConfig.getWelcomeMessages().length > 0) {
    const names = appConfig.getRandomNames() || ["Anonymous"];
    console.log("Starting Welcome Message Loop (Debug Mode)...");

    // Visual Effect Pool from Config
    const visualKeys = appConfig.getVisualConfig() ? Object.keys(appConfig.getVisualConfig()) : ['해골', '돌핀', '버질', '하트', '커플', '우쇼', '발파', '방종송'];

    // [Fixed] Moved Startup Sequence outside to ensure URL commands work
    // OLD Location - Removed


    welcomeInterval = setInterval(() => {
        // 10% Chance to FORCE a visual effect message if not already picked
        let msg = appConfig.getWelcomeMessages()[Math.floor(Math.random() * appConfig.getWelcomeMessages().length)];
        let isVisual = false;

        // "비주얼 이팩트도 랜덤하게 띄워줘" - Explicitly inject visual command occasionally
        if (!msg.startsWith('!') && Math.random() < 0.3) {
            const randomVisual = visualKeys[Math.floor(Math.random() * visualKeys.length)];
            // Prepend visual command to the message
            msg = `!${randomVisual} ${msg}`;
            isVisual = true;
        }

        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomUid = 'bot_' + Math.random().toString(36).substr(2, 9);

        // Simulate incoming message
        window.processMessage({
            message: msg,
            nickname: randomName,
            color: null, // ChatRenderer's _resolveColor will now handle this with seed
            badges: [],
            emojis: {},
            isStreamer: isVisual,
            uid: randomUid,
            type: 'chat',
            isDonation: false,
            isSubscription: false
        });
    }, 2000); // Slower interval (2s) to let effects play out
}

// Global Connection Handler (Always Active)
window.addEventListener('chzzk_connected', () => {
    console.log("Connection Established. Stopping Startup Sequences.");

    // [User Request] Restore SFX Volume to 1.0 after loading
    if (audioManager) {
        audioManager.updateVolumeConfig({ sfx: 1.0 });
        console.log("🔊 [System] Loading complete. SFX Volume restored to 1.0");
    }

    // Stop Debug Sequences if running
    if (welcomeInterval) {
        clearInterval(welcomeInterval);
        welcomeInterval = null;
    }

    if (window._stressTestInterval) {
        clearInterval(window._stressTestInterval);
        window._stressTestInterval = null;
        console.log("🛑 Connection Established. Stopping Stress Test.");
    }

    // [New] Clear queued visual effects from startup
    if (visualDirector) {
        visualDirector.clearQueue();
    }

    // [New] Hide Loading Screen
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 1000); // Remove from DOM after transition
    }

}, { once: true });

// [Feature] Startup Effect Trigger (Moved from Debug Block)
setTimeout(() => {
    // 1. URL Command (Highest Priority)
    if (appConfig.startupCommand) {
        console.log(`🚀 [Startup] URL Command Detected: ${appConfig.startupCommand}`);
        visualDirector.trigger(appConfig.startupCommand, {
            message: `✨ 시스템 시작: ${appConfig.startupCommand}`,
            nickname: "System",
            isStreamer: true
        });
    }
    // 2. Default Startup Effect (mulsulsan)
    else {
        console.log(`🚀 [Startup] Default Effect: random_dance`);
        visualDirector.trigger('random_dance', {
            message: `✨ 시스템 시작: 랜덤 댄스 이펙트`,
            nickname: "System",
            isStreamer: true
        });
    }
}, 1000); // 1 second after load

// [Test] Queue Stress Test (Modified for Startup Backlog)
// [Test] Queue Stress Test (Random Burst Mode)
window.runQueueStressTest = () => {
    console.warn("🚀 Starting Queue Stress Test (Random 0-3 msg/sec)...");
    let msgId = 1;
    let seconds = 0;

    const sendBatch = (count, label) => {
        console.log(`🔥 [Test] Sending Batch: ${label} (${count} msgs)`);
        const messages = appConfig.getWelcomeMessages() || ["테스트 메시지"];
        const names = appConfig.getRandomNames() || ["Tester"];

        for (let i = 0; i < count; i++) {
            const rawMsg = messages[Math.floor(Math.random() * messages.length)];
            const randomName = names[Math.floor(Math.random() * names.length)];

            window.processMessage({
                message: rawMsg,
                nickname: randomName,
                isStreamer: false,
                type: 'chat',
                uid: 'test_' + msgId + '_' + i
            });
            msgId++;
        }
    };

    // 1초마다 0~3개 랜덤 전송 (최대 20초)
    window._stressTestInterval = setInterval(() => {
        seconds++;
        if (seconds > 20) {
            clearInterval(window._stressTestInterval);
            window._stressTestInterval = null;
            console.warn("🚀 Stress Test Completed (20s Limit).");
            return;
        }

        const randomCount = Math.floor(Math.random() * 4); // 0 ~ 3
        if (randomCount > 0) {
            sendBatch(randomCount, `Sec-${seconds}`);
        } else {
            console.log(`🔥 [Test] Sec-${seconds}: Skipping (0 msgs)`);
        }

    }, 1000);
};

// 즉시 실행 가능하도록 글로벌 등록 (필요시 콘솔에서 window.runQueueStressTest() 입력)

// [New] Dynamic Status Merger
// Detects legacy "치지직 채널 탐색중..." elements and merges them into the premium loader
// 자동 시작
network.connect();

// [Auto-Run] Test Queue immediately to build backlog during connection
setTimeout(() => window.runQueueStressTest(), 500);

