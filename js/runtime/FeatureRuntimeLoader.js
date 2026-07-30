'use strict';

const FEATURE_RUNTIME_MANIFEST = Object.freeze({
    usho: { scripts: ['js/effects/UshoEffect.js'], resolve: () => UshoEffect },
    skull: { scripts: ['js/effects/SkullEffect.js'], resolve: () => SkullEffect },
    couple: { scripts: ['js/effects/CoupleEffect.js'], resolve: () => CoupleEffect },
    vergil: { scripts: ['js/effects/VergilEffect.js'], resolve: () => VergilEffect },
    dolphin: { scripts: ['js/effects/DolphinEffect.js'], resolve: () => DolphinEffect },
    valstrax: { scripts: ['js/effects/ValstraxEffect.js'], resolve: () => ValstraxEffect },
    bangjong: { scripts: ['js/effects/BangjongEffect.js'], resolve: () => BangjongEffect },
    dango: { scripts: ['js/effects/DangoEffect.js'], resolve: () => DangoEffect },
    king: { scripts: ['js/effects/KingEffect.js'], resolve: () => KingEffect },
    godsong: { scripts: ['js/effects/GodsongEffect.js'], resolve: () => GodsongEffect },
    gazabu: { scripts: ['js/effects/GazabuEffect.js'], resolve: () => GazabuEffect },
    mulsulsan: { scripts: ['js/effects/MulsulsanEffect.js'], resolve: () => MulsulsanEffect },
    random_dance: { scripts: ['js/effects/RandomDanceEffect.js'], resolve: () => RandomDanceEffect },
    sound_quiz: { scripts: ['js/effects/SoundQuizEffect.js'], resolve: () => SoundQuizEffect },
    racing: {
        scripts: [
            'js/effects/RacingData.js',
            'js/effects/RacingRules.js',
            'js/effects/RacingRunner.js',
            'js/effects/RacingEffect.js'
        ],
        resolve: () => RacingEffect
    },
    raid: { scripts: ['js/effects/RaidEffect.js'], resolve: () => RaidEffect },
    game_help: { scripts: ['js/effects/GameHelpEffect.js'], resolve: () => GameHelpEffect },
    commands_scroll: {
        scripts: ['js/effects/CommandsScrollEffect.js'],
        resolve: () => CommandsScrollEffect
    }
});

class FeatureRuntimeLoader {
    static loadPromises = new Map();

    static load(featureKey, documentRef = typeof document !== 'undefined' ? document : null) {
        const manifest = FEATURE_RUNTIME_MANIFEST[featureKey];
        if (!manifest) return Promise.reject(new Error(`Unknown feature runtime: ${featureKey}`));
        if (!documentRef?.head?.appendChild) {
            return Promise.reject(new Error('Feature runtime requires a browser document'));
        }
        if (!this.loadPromises.has(featureKey)) {
            const promise = this.loadSequentially(documentRef, manifest.scripts)
                .then(() => {
                    const Constructor = manifest.resolve();
                    if (typeof Constructor !== 'function') {
                        throw new Error(`Feature constructor did not register: ${featureKey}`);
                    }
                    return Constructor;
                })
                .catch(error => {
                    this.loadPromises.delete(featureKey);
                    throw error;
                });
            this.loadPromises.set(featureKey, promise);
        }
        return this.loadPromises.get(featureKey);
    }

    static async loadSequentially(documentRef, scripts) {
        for (const src of scripts) await this.loadScript(documentRef, src);
    }

    static loadScript(documentRef, src) {
        const existing = [...documentRef.querySelectorAll('script[data-feature-runtime-src]')]
            .find(script => script.dataset.featureRuntimeSrc === src);
        if (existing?.dataset.featureRuntimeReady === 'true') return Promise.resolve();
        if (existing?._featureRuntimePromise) return existing._featureRuntimePromise;

        const script = existing || documentRef.createElement('script');
        script.src = `./${src}`;
        script.async = false;
        script.dataset.featureRuntimeSrc = src;
        script._featureRuntimePromise = new Promise((resolve, reject) => {
            script.addEventListener('load', () => {
                script.dataset.featureRuntimeReady = 'true';
                resolve();
            }, { once: true });
            script.addEventListener('error', () => {
                script.remove();
                reject(new Error(`Failed to load feature runtime script: ${src}`));
            }, { once: true });
        });
        if (!existing) documentRef.head.appendChild(script);
        return script._featureRuntimePromise;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FeatureRuntimeLoader, FEATURE_RUNTIME_MANIFEST };
} else {
    window.FeatureRuntimeLoader = FeatureRuntimeLoader;
    window.FEATURE_RUNTIME_MANIFEST = FEATURE_RUNTIME_MANIFEST;
}
