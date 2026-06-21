// [Execution & Init]
// ==========================================
const eventBus = new EventBus();

const appConfig = new ConfigManager();
const audioManager = new AudioManager(appConfig, eventBus);
const preloader = new AssetPreloader(appConfig, audioManager);
const chatRenderer = new ChatRenderer(eventBus, audioManager);
const visualDirector = new VisualDirector(appConfig, eventBus, audioManager);
const systemController = new SystemController(eventBus);
const debugController = new DebugController(appConfig, eventBus);
const messageRouter = new MessageRouter(appConfig, eventBus, systemController, audioManager, visualDirector);

// 네트워크 연결 시작
eventBus.on('chat:process', (msgData) => {
    messageRouter.route(msgData);
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

// Global Connection Handler (Always Active)
window.addEventListener('chzzk_connected', () => {
    console.log("Connection Established. Stopping Startup Sequences.");

    // [Fix] Removed the hardcoded volume restoration to 1.0 here because it overwrites the user's config.js settings
    if (audioManager) {
        console.log("🔊 [System] Loading complete. SFX Volume remains as configured.");
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

    // [New] Start Background Asset Caching
    if (preloader) {
        // 약간의 지연을 주어 렌더링 부하를 피해 캐싱 시작
        setTimeout(() => preloader.start(), 2000);
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
    /* else {
        console.log(`🚀 [Startup] Default Effect: random_dance`);
        visualDirector.trigger('random_dance', {
            message: `✨ 시스템 시작: 랜덤 댄스 이펙트`,
            nickname: "System",
            isStreamer: true
        });
    } */
}, 1000); // 1 second after load

// [New] Dynamic Status Merger
// Detects legacy "치지직 채널 탐색중..." elements and merges them into the premium loader
// 자동 시작
network.connect();
