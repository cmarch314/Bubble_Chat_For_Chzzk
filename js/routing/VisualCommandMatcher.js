class VisualCommandMatcher {
    constructor() {
        this.restrictedEffects = {
            dolphin: data => data.isStreamer || data.isDonation,
            bangjong: data => data.isStreamer,
            mulsulsan: data => data.isStreamer || data.isDonation,
            gazabu: data => data.isStreamer || data.isDonation,
            random_dance: data => data.isStreamer || data.isDonation
        };
    }

    find(message, msgData, registry, debugMode = false) {
        const normalizedMessage = (message || '').toLowerCase();

        for (const key in registry) {
            if (!this._canUse(key, msgData, debugMode)) continue;

            const soundKey = registry[key]?.soundKey;
            if (!soundKey) continue;

            const trigger = `!${soundKey.toLowerCase()}`;
            const matched = msgData.isDonation
                ? normalizedMessage.includes(trigger)
                : normalizedMessage.startsWith(trigger);

            if (matched) return key;
        }

        return null;
    }

    _canUse(key, msgData, debugMode) {
        const policy = this.restrictedEffects[key];
        return !policy || debugMode || policy(msgData);
    }
}
