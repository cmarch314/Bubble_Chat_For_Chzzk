'use strict';

class LazyFeatureEffect extends BaseEffect {
    constructor(director, featureKey, options = {}) {
        super(director);
        this.featureKey = featureKey;
        this.loader = options.loader || FeatureRuntimeLoader;
        this.captureChat = options.captureChat === true;
        this.instance = null;
        this.pendingChat = [];
        this.loading = false;
        this.cancelled = false;
    }

    async execute(context) {
        let beganInstanceExecution = false;
        this.cancelled = false;
        this.loading = true;
        this.pendingChat = [];
        if (this.captureChat) this.director.activeGame = this;

        try {
            const Constructor = await this.loader.load(this.featureKey);
            if (this.cancelled) return;
            if (!this.instance) this.instance = new Constructor(this.director);
            this.director._ensureEffectOverlays?.(this.featureKey);
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
            if (beganInstanceExecution) this.instance?.endExecution?.();
        }
    }

    handleChat(message) {
        if (this.instance && this.director.activeGame === this.instance) {
            return this.instance.handleChat?.(message) === true;
        }
        if (!this.loading || !this.captureChat) return false;
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
        super.dispose();
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = LazyFeatureEffect;
else window.LazyFeatureEffect = LazyFeatureEffect;
