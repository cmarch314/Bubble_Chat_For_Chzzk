class BubbleChatApp {
    constructor(constructors = {}) {
        const Types = {
            EventBus: constructors.EventBus || EventBus,
            ConfigManager: constructors.ConfigManager || ConfigManager,
            AudioManager: constructors.AudioManager || AudioManager,
            AssetPreloader: constructors.AssetPreloader || AssetPreloader,
            ChatRenderer: constructors.ChatRenderer || ChatRenderer,
            VisualDirector: constructors.VisualDirector || VisualDirector,
            SystemController: constructors.SystemController || SystemController,
            DebugController: constructors.DebugController || DebugController,
            MessageRouter: constructors.MessageRouter || MessageRouter,
            MessageQueue: constructors.MessageQueue || MessageQueue,
            ChzzkGateway: constructors.ChzzkGateway || ChzzkGateway
        };

        this.eventBus = new Types.EventBus();
        this.config = new Types.ConfigManager(this.eventBus);
        this.audio = new Types.AudioManager(this.config, this.eventBus);
        this.preloader = new Types.AssetPreloader(this.config, this.audio);
        this.chatRenderer = new Types.ChatRenderer(this.eventBus, this.audio);
        this.visuals = new Types.VisualDirector(this.config, this.eventBus, this.audio);
        this.systemController = new Types.SystemController(this.eventBus);
        this.debugController = new Types.DebugController(this.config, this.eventBus);
        this.router = new Types.MessageRouter(
            this.config,
            this.eventBus,
            this.systemController,
            this.audio,
            this.visuals
        );
        this.messageQueue = new Types.MessageQueue(this.eventBus);
        this.network = new Types.ChzzkGateway(this.config, this.eventBus);
        this.started = false;
    }

    start() {
        if (this.started) return this;
        this.started = true;

        this.eventBus.on('chat:process', msgData => this.router.route(msgData));
        this.eventBus.on('chat:received', msgData => this.messageQueue.enqueue(msgData));
        window.processMessage = msgData => this.messageQueue.enqueue(msgData);

        window.addEventListener('chzzk_connected', () => this._handleConnected(), { once: true });
        setTimeout(() => this._runStartupEffect(), 1000);
        this.network.connect();
        return this;
    }

    _handleConnected() {
        console.log('Connection Established. Stopping Startup Sequences.');
        console.log('🔊 [System] Loading complete. SFX Volume remains as configured.');

        this.visuals.clearQueue();

        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 1000);
        }

        setTimeout(() => this.preloader.start(), 2000);
    }

    _runStartupEffect() {
        if (!this.config.startupCommand) return;

        console.log(`🚀 [Startup] URL Command Detected: ${this.config.startupCommand}`);
        this.visuals.trigger(this.config.startupCommand, {
            message: `✨ 시스템 시작: ${this.config.startupCommand}`,
            nickname: 'System',
            isStreamer: true
        });
    }
}
