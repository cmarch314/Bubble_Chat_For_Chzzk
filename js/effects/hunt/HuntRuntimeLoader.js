'use strict';

const HUNT_RUNTIME_SCRIPT_PATHS = Object.freeze([
    'local_assets/monster_hunter/runtime-action-routes.js?v=20260728a',
    'js/effects/hunt/data/ReleasedMonsterRuntimeIndex.generated.js',
    'js/effects/hunt/data/MonsterReleaseManifest.generated.js',
    'js/effects/hunt/HuntMonsterReleasePolicy.js',
    'js/effects/hunt/data/HuntMonsterHabitats.generated.js',
    'js/effects/hunt/HuntData.js',
    'js/effects/hunt/HuntProfileContract.js',
    'js/effects/hunt/HuntPersonalityProfiles.js',
    'js/effects/hunt/HuntIssuedSupplyRuntime.js',
    'js/effects/hunt/HuntSharedSupply.js',
    'js/effects/hunt/HuntDifficultyProfile.js',
    'js/effects/hunt/HuntTrapConfig.js',
    'js/effects/hunt/HuntRunState.js',
    'js/effects/hunt/HuntRunPartyAdapter.js',
    'js/effects/hunt/HuntJourneyCatalog.js',
    'js/effects/hunt/HuntJourneyRewardCatalog.js',
    'js/effects/hunt/HuntJourneyInvasionCatalog.js',
    'js/effects/hunt/HuntJourneyEconomy.js',
    'js/effects/hunt/HuntJourneyEventCatalog.js',
    'js/effects/hunt/HuntJourneyVoteRuntime.js',
    'js/effects/hunt/HuntJourneyFlowController.js',
    'js/effects/hunt/data/WildsWeaponProgression.generated.js',
    'js/effects/hunt/HuntJourneyWeaponGrowth.js',
    'js/effects/hunt/HuntJourneyEventEngine.js',
    'js/effects/hunt/HuntRunClient.js',
    'js/effects/hunt/HuntRunDirector.js',
    'js/effects/hunt/HuntAtbConfig.js',
    'js/effects/hunt/data/WildsMotionValues.generated.js',
    'js/effects/hunt/data/WildsRuntimeMotionTimings.generated.js',
    'js/effects/hunt/data/WildsMonsterAnatomy.generated.js',
    'js/effects/hunt/data/ReviewedMonsterAnatomy.js',
    'js/effects/hunt/data/WildsComboLinks.generated.js',
    'js/effects/hunt/data/WildsWeaponInstances.generated.js',
    'js/effects/hunt/HuntMonsterArchetypeCatalog.js',
    'js/effects/hunt/data/MonsterVisualGeometryOverrides.generated.js',
    'js/effects/hunt/data/MonsterPatternMotionOverrides.generated.js',
    'js/effects/hunt/HuntMonsterReactionCatalog.js',
    'js/effects/hunt/HuntMonsterAnatomyCatalog.js',
    'js/effects/hunt/HuntMonsterPartMaterialCatalog.js?v=20260803e',
    'js/effects/hunt/HuntMotionValueCatalog.js',
    'js/effects/hunt/HuntWeaponMechanics.js',
    'js/effects/hunt/HuntWeaponInstanceCatalog.js',
    'js/effects/hunt/HuntWeaponCatalog.js',
    'js/effects/hunt/HuntWeaponActionSelector.js',
    'js/effects/hunt/HuntBeatV2Contract.js',
    'js/effects/hunt/HuntBeatV2Adapter.js',
    'js/effects/hunt/HuntBeatActionRuntime.js',
    'js/effects/hunt/HuntCombatJudgmentRuntime.js',
    'js/effects/hunt/HuntCombatJudgmentResolver.js',
    'js/effects/hunt/HuntHunterBeatCatalog.js',
    'js/effects/hunt/HuntActionStateMachine.js',
    'js/effects/hunt/HuntSeededRandom.js',
    'js/effects/hunt/HuntBalanceTelemetry.js',
    'js/effects/hunt/HuntBgmCatalog.js',
    'js/effects/hunt/HuntBgmResolver.js',
    'js/effects/hunt/data/WorldMonsterRoarRoutes.generated.js?v=20260803a',
    'js/effects/hunt/data/WorldMonsterAudioReviewRoutes.generated.js?v=20260803a',
    'js/effects/hunt/HuntAudioCatalog.js?v=20260803a',
    'js/effects/hunt/HuntMonsterFlightRuntime.js',
    'js/effects/hunt/HuntMonsterTraitRuntime.js',
    'js/effects/hunt/HuntMonsterStaminaRuntime.js',
    'js/effects/hunt/HuntMonsterProfiles.js?v=20260803h',
    'js/effects/hunt/HuntMonsterEditionResolver.js',
    'js/effects/hunt/HuntMonsterPatternCatalog.js',
    'js/effects/hunt/HuntMonsterPatternSelector.js',
    'js/effects/hunt/HuntLifecycle.js',
    'js/effects/hunt/HuntTeamIntentCoordinator.js',
    'js/effects/hunt/HuntHunterDecisionPolicy.js',
    'js/effects/hunt/HuntSupportItemPolicy.js',
    'js/effects/hunt/HuntPerkCatalog.js',
    'js/effects/hunt/HuntPerkSynergyCatalog.js',
    'js/effects/hunt/HuntPerkRuntime.js?v=20260803g',
    'js/effects/hunt/HuntHunterBlightRuntime.js',
    'js/effects/hunt/HuntLobbyRoster.js',
    'js/effects/hunt/HuntLoadoutAdvisor.js',
    'js/effects/hunt/HuntProfileClient.js',
    'js/effects/hunt/HuntTierRules.js',
    'js/effects/hunt/HuntMonsterRules.js',
    'js/effects/hunt/HuntParticipantParser.js',
    'js/effects/hunt/HuntChatTactics.js?v=20260803g',
    'js/effects/hunt/HuntBattleTickExecutor.js?v=20260803e',
    'js/effects/hunt/HuntValstraxExecutor.js',
    'js/effects/hunt/HuntSmallMonsterSwarm.js',
    'js/effects/hunt/HuntColossalPhaseRuntime.js',
    'js/effects/hunt/HuntMonsterActionPolicy.js',
    'js/effects/hunt/HuntMonsterTurnExecutor.js?v=20260803h',
    'js/effects/hunt/HuntHunterTurnExecutor.js?v=20260803g',
    'js/effects/hunt/HuntEngine.js',
    'js/effects/hunt/HuntMonsterAnimationCatalog.js',
    'js/effects/hunt/HuntMonsterFacingChoreography.js',
    'js/effects/hunt/HuntStageAnchors.js',
    'js/effects/hunt/HuntMotionPoses.js',
    'js/effects/hunt/HuntMotionCompiler.js',
    'js/effects/hunt/data/MonsterProfileKeyframes.generated.js',
    'js/effects/hunt/HuntMonsterProfileMotionRuntime.js',
    'js/effects/hunt/HuntMonsterGeometryChoreography.js',
    'js/effects/hunt/HuntMonsterAttackAnimator.js?v=20260810a',
    'js/effects/hunt/HuntWeaponAnimationCatalog.js',
    'js/effects/hunt/HuntCombatAnimator.js?v=20260803e',
    'js/effects/hunt/HuntNotificationRenderer.js',
    'js/effects/hunt/HuntRenderer.js',
    'js/effects/hunt/data/MonsterPatternAudioRoutes.generated.js',
    'js/effects/hunt/HuntAudioManager.js?v=20260803a',
    'js/effects/hunt/HuntInitializer.js',
    'js/effects/hunt/HuntResultPresenter.js',
    'js/effects/HuntEffect.js'
]);
const HUNT_RUNTIME_STYLE_PATH = 'styles/hunt-runtime.css?v=20260803f';
const HUNT_ACTION_AUDIO_RUNTIME_PATH = HUNT_RUNTIME_SCRIPT_PATHS[0];
const HUNT_AUDIO_RUNTIME_PATH = 'local_assets/monster_hunter/runtime-audio-manifests.js?v=20260728a';

class HuntRuntimeLoader {
    static loadPromise = null;

    static load(documentRef = typeof document !== 'undefined' ? document : null) {
        const constructorReady = typeof window !== 'undefined' && typeof window.HuntEffect === 'function';
        const actionAudioReady = typeof window !== 'undefined'
            && window.HUNT_LOCAL_WEAPON_ACTION_ROUTES;
        if (constructorReady && actionAudioReady) {
            // Hunt classes can outlive the released hunt-only stylesheet. Always
            // restore the style contract before reusing an already-loaded runtime.
            return documentRef?.head?.appendChild
                ? this.loadStyle(documentRef).then(() => window.HuntEffect)
                : Promise.resolve(window.HuntEffect);
        }
        if (!documentRef?.head?.appendChild) {
            return Promise.reject(new Error('Hunt runtime requires a browser document'));
        }
        if (!this.loadPromise) {
            const scriptsReady = constructorReady
                ? this.loadScript(documentRef, HUNT_ACTION_AUDIO_RUNTIME_PATH)
                : this.loadSequentially(documentRef);
            this.loadPromise = Promise.all([this.loadStyle(documentRef), scriptsReady])
                .then(() => {
                    if (typeof window.HuntEffect !== 'function') {
                        throw new Error('HuntEffect did not register after runtime loading');
                    }
                    return window.HuntEffect;
                })
                .catch(error => {
                    this.loadPromise = null;
                    throw error;
                });
        }
        return this.loadPromise;
    }

    static loadAudioCatalog(documentRef = typeof document !== 'undefined' ? document : null) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        if (globalScope.HUNT_LOCAL_AUDIO_MANIFESTS) return Promise.resolve(true);
        if (!documentRef?.head?.appendChild) return Promise.resolve(false);
        return this.loadScript(documentRef, HUNT_AUDIO_RUNTIME_PATH)
            .then(() => Boolean(globalScope.HUNT_LOCAL_AUDIO_MANIFESTS));
    }

    static releaseHeavyRuntime(documentRef = typeof document !== 'undefined' ? document : null) {
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        delete globalScope.HUNT_LOCAL_AUDIO_MANIFESTS;
        delete globalScope.HUNT_LOCAL_WEAPON_ACTION_ROUTES;
        if (documentRef?.querySelectorAll) {
            [...documentRef.querySelectorAll('script[data-hunt-runtime-src]')]
                .filter(script => [
                    HUNT_ACTION_AUDIO_RUNTIME_PATH,
                    HUNT_AUDIO_RUNTIME_PATH
                ].includes(script.dataset.huntRuntimeSrc))
                .forEach(script => script.remove());
            [...documentRef.querySelectorAll('link[data-hunt-runtime-style]')]
                .forEach(link => link.remove());
        }
        this.loadPromise = null;
    }

    static loadStyle(documentRef) {
        const existing = [...documentRef.querySelectorAll('link[data-hunt-runtime-style]')]
            .find(link => link.dataset.huntRuntimeStyle === HUNT_RUNTIME_STYLE_PATH);
        if (existing?.dataset.huntRuntimeReady === 'true') return Promise.resolve();
        if (existing?._huntRuntimePromise) return existing._huntRuntimePromise;

        const link = existing || documentRef.createElement('link');
        link.rel = 'stylesheet';
        link.href = `./${HUNT_RUNTIME_STYLE_PATH}`;
        link.dataset.huntRuntimeStyle = HUNT_RUNTIME_STYLE_PATH;
        link._huntRuntimePromise = new Promise((resolve, reject) => {
            link.addEventListener('load', () => {
                link.dataset.huntRuntimeReady = 'true';
                resolve();
            }, { once: true });
            link.addEventListener('error', () => {
                link.remove();
                reject(new Error(`Failed to load hunt runtime style: ${HUNT_RUNTIME_STYLE_PATH}`));
            }, { once: true });
        });
        if (!existing) documentRef.head.appendChild(link);
        return link._huntRuntimePromise;
    }

    static async loadSequentially(documentRef) {
        for (const src of HUNT_RUNTIME_SCRIPT_PATHS) {
            await this.loadScript(documentRef, src);
        }
    }

    static loadScript(documentRef, src) {
        const existing = [...documentRef.querySelectorAll('script[data-hunt-runtime-src]')]
            .find(script => script.dataset.huntRuntimeSrc === src);
        if (existing?.dataset.huntRuntimeReady === 'true') return Promise.resolve();
        if (existing?._huntRuntimePromise) return existing._huntRuntimePromise;

        const script = existing || documentRef.createElement('script');
        script.src = `./${src}`;
        script.async = false;
        script.dataset.huntRuntimeSrc = src;
        script._huntRuntimePromise = new Promise((resolve, reject) => {
            script.addEventListener('load', () => {
                script.dataset.huntRuntimeReady = 'true';
                resolve();
            }, { once: true });
            script.addEventListener('error', () => {
                script.remove();
                reject(new Error(`Failed to load hunt runtime script: ${src}`));
            }, { once: true });
        });
        if (!existing) documentRef.head.appendChild(script);
        return script._huntRuntimePromise;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HuntRuntimeLoader,
        HUNT_RUNTIME_SCRIPT_PATHS,
        HUNT_RUNTIME_STYLE_PATH,
        HUNT_ACTION_AUDIO_RUNTIME_PATH,
        HUNT_AUDIO_RUNTIME_PATH
    };
} else {
    window.HuntRuntimeLoader = HuntRuntimeLoader;
    window.HUNT_RUNTIME_SCRIPT_PATHS = HUNT_RUNTIME_SCRIPT_PATHS;
    window.HUNT_RUNTIME_STYLE_PATH = HUNT_RUNTIME_STYLE_PATH;
}
