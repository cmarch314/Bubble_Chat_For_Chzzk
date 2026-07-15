class BaseEffect {
    constructor(director) {
        this.director = director;
        this.config = director.config;
        this.eventBus = director.eventBus;
        this.audioManager = director.audioManager;
        this.scope = new DisposableScope();
        this.timers = new ManagedTimers();
        this.executionGeneration = 0;
        this.scope.add(() => this.timers.clearAll());
    }

    async execute(context) {
        throw new Error("execute() must be implemented by subclasses");
    }

    beginExecution() {
        this.executionGeneration++;
        this.timers.clearAll();
    }

    endExecution() {
        this.timers.clearAll();
    }

    dispose() {
        this.executionGeneration++;
        this.timers.clearAll();
        this.scope.dispose();
    }
}
