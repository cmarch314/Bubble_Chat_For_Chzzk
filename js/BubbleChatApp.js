class BubbleChatApp {
    constructor(constructors = {}) {
        this.scope = new DisposableScope();
        this.timers = new ManagedTimers();
        this.scope.add(() => this.timers.clearAll());
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
        this.stopped = false;
    }

    start() {
        if (this.started) return this;
        this.started = true;

        this.scope.add(this.eventBus.on('chat:process', msgData => this.router.route(msgData)));
        this.scope.add(this.eventBus.on('chat:received', msgData => this.messageQueue.enqueue(msgData)));
        const processMessage = msgData => this.messageQueue.enqueue(msgData);
        window.processMessage = processMessage;
        this.scope.add(() => {
            if (window.processMessage === processMessage) delete window.processMessage;
        });

        const connectedHandler = () => this._handleConnected();
        window.addEventListener('chzzk_connected', connectedHandler, { once: true });
        this.scope.add(() => window.removeEventListener?.('chzzk_connected', connectedHandler));
        this.timers.timeout(() => this._runStartupEffect(), 1000);
        this.network.connect();
        return this;
    }

    stop() {
        if (this.stopped) return;
        this.stopped = true;
        this.network.disconnect?.();
        this.chatRenderer.dispose?.();
        this.visuals.dispose?.();
        this.audio.dispose?.();
        this.scope.dispose();
    }

    _handleConnected() {
        console.log('Connection Established. Stopping Startup Sequences.');
        console.log('🔊 [System] Loading complete. SFX Volume remains as configured.');

        this.visuals.clearQueue();

        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('hidden');
            this.timers.timeout(() => loader.remove(), 1000);
        }

        this.timers.timeout(() => this.preloader.start(), 2000);
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
