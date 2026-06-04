class BaseEffect {
    constructor(director) {
        this.director = director;
        this.config = director.config;
        this.eventBus = director.eventBus;
        this.audioManager = director.audioManager;
    }

    async execute(context) {
        throw new Error("execute() must be implemented by subclasses");
    }
}
