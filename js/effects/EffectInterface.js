class BaseEffect {
    constructor(director) {
        this.director = director;
        this.config = director.config;
        this.eventBus = director.eventBus;
        this.audioManager = director.audioManager;
        this.scope = new DisposableScope();
    }

    async execute(context) {
        throw new Error("execute() must be implemented by subclasses");
    }

    dispose() {
        this.scope.dispose();
    }
}
