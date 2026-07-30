'use strict';

class LazyHuntEffect extends BaseEffect {
    constructor(director, loader = HuntRuntimeLoader) {
        super(director);
        this.loader = loader;
        this.instance = null;
        this.pendingChat = [];
        this.loading = false;
        this.cancelled = false;
    }

    async execute(context) {
        if (this.instance?.isActive) return this.instance.execute(context);
        let beganInstanceExecution = false;
        this.cancelled = false;
        this.loading = true;
        this.pendingChat = [];
        this.director.activeGame = this;

        try {
            const HuntEffectConstructor = await this.loader.load();
            if (this.cancelled) return;
            if (!this.instance) this.instance = new HuntEffectConstructor(this.director);
            this.loading = false;
            this.instance.beginExecution?.();
            beganInstanceExecution = true;
            const execution = this.instance.execute(context);
            const queued = this.pendingChat.splice(0);
            queued.forEach(message => this.instance.handleChat?.(message));
            return await execution;
        } catch (error) {
            this.loading = false;
            this.pendingChat = [];
            if (this.director.activeGame === this) this.director.activeGame = null;
            throw error;
        } finally {
            if (beganInstanceExecution) {
                this.instance?.endExecution?.();
                if (this.instance && !this.instance.isActive) {
                    this.instance.dispose?.();
                    this.instance = null;
                    this.loader.releaseHeavyRuntime?.();
                }
            }
        }
    }

    handleChat(message) {
        if (this.instance && this.director.activeGame === this.instance) {
            return this.instance.handleChat(message);
        }
        if (!this.loading) return false;
        this.pendingChat.push(message);
        return true;
    }

    forceStopGame() {
        this.cancelled = true;
        this.loading = false;
        this.pendingChat = [];
        this.instance?.forceStopGame?.();
        if (this.director.activeGame === this) this.director.activeGame = null;
    }

    dispose() {
        this.forceStopGame();
        this.instance?.dispose?.();
        this.instance = null;
        this.loader.releaseHeavyRuntime?.();
        super.dispose();
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = LazyHuntEffect;
else window.LazyHuntEffect = LazyHuntEffect;
