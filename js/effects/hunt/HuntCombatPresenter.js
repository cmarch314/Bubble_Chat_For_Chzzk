'use strict';

/**
 * One engine-to-presentation adapter for OBS and the review Preview.
 * It never owns time or gameplay state; it only forwards committed engine
 * callbacks to the supplied renderer/audio ports.
 */
class HuntCombatPresenter {
    constructor(options = {}) {
        this.renderer = options.renderer || null;
        this.audio = options.audio || null;
        this.getHunters = options.getHunters || (() => []);
        this.getEngine = options.getEngine || (() => null);
        this.hooks = options.hooks || {};
    }

    hunter(index) {
        const hunters = this.getHunters() || [];
        return hunters.find(candidate => Number(candidate?.index) === Number(index)) || hunters[index];
    }

    callbacks() {
        const renderer = this.renderer;
        const audio = this.audio;
        const hooks = this.hooks;
        return {
            onLog: (text, color) => hooks.onLog?.(text, color),
            onPlaySFX: (fileName, fallbackKey, context) => audio?.playMHAsset?.(fileName, fallbackKey, context),
            onCancelWhetstoneCue: index => audio?.cancelWhetstoneCue?.(index),
            onPlayAudioFile: (...args) => audio?.playMHAudioFile?.(...args),
            onShakeWeapon: (index, ...args) => renderer?.shakeWeapon?.(
                index, this.hunter(index), ...args),
            onShakeMonster: () => renderer?.shakeMonster?.(),
            onRestoreBorder: index => renderer?.restoreBorder?.(index, this.hunter(index)),
            onUpdateHpUI: hunter => renderer?.updateHpUI?.(hunter),
            onUpdateMonsterHpUI: (...args) => renderer?.updateMonsterHpUI?.(...args),
            onUpdateSmallMonsterSwarmUI: state => renderer?.updateSmallMonsterSwarmUI?.(state),
            onUpdateWeaponAtbUI: (index, atb) => renderer?.updateWeaponAtbUI?.(
                index, atb, this.hunter(index)),
            onUpdateSharpnessUI: (...args) => renderer?.updateSharpnessUI?.(...args),
            onUpdateMonsterAtbUI: atb => renderer?.updateMonsterAtbUI?.(atb),
            onUpdateMonsterStateUI: (...args) => renderer?.updateMonsterStateUI?.(...args),
            onUpdateMonsterFlightUI: (...args) => renderer?.updateMonsterFlightUI?.(...args),
            onUpdateMonsterTraitVisual: traits => renderer?.updateMonsterTraitVisual?.(traits),
            onUpdateMonsterPartsUI: parts => renderer?.updateMonsterPartsUI?.(parts),
            onUpdateTailSeverUI: (...args) => renderer?.updateTailSeverUI?.(...args),
            onUpdatePotionCountUI: (...args) => renderer?.updatePotionCountUI?.(...args),
            onUpdateHunterItemUI: hunter => renderer?.updateHunterItemUI?.(
                hunter, this.getEngine()?.sharedSupply),
            onUpdateOverheatUI: (...args) => renderer?.updateOverheatUI?.(...args),
            onUpdatePhialsUI: (...args) => renderer?.updatePhialsUI?.(...args),
            onUpdateExtractsUI: (...args) => renderer?.updateExtractsUI?.(...args),
            onUpdateHunterBlightUI: (...args) => renderer?.updateHunterBlightUI?.(...args),
            onUpdateCartUI: (carts, limit) => {
                hooks.onCart?.(carts, limit);
                renderer?.updateCartUI?.(carts, limit);
            },
            onUpdateTimerUI: time => renderer?.updateTimerUI?.(time),
            onShowSkillBubble: (...args) => renderer?.showSkillBubble?.(...args),
            onSpawnEmojiBubble: (...args) => renderer?.spawnVictoryEmoji?.(...args),
            onTriggerMonsterRoar: monster => {
                renderer?.triggerMonsterRoar?.();
                audio?.playMonsterRoar?.(monster);
            },
            onTriggerMonsterCharge: () => renderer?.triggerMonsterCharge?.(),
            onTriggerMonsterAttack: (...args) => renderer?.triggerMonsterAttack?.(...args),
            onTriggerMonsterTelegraphFx: effect => renderer?.triggerMonsterTelegraphFx?.(effect),
            onResolveMonsterImpactTimeline: (...args) => renderer?.resolveMonsterImpactTimeline?.(...args),
            onTriggerMonsterBurrowPhase: (...args) => renderer?.combatAnimator
                ?.triggerMonsterBurrowPhase?.(...args),
            onResetMonsterMotion: reason => renderer?.combatAnimator?.monsterAttackAnimator
                ?.clearMonsterMotion?.(reason),
            onMonsterBeatActionComplete: () => renderer?.combatAnimator?.monsterAttackAnimator
                ?.clearMonsterMotion?.('beat-complete'),
            onMonsterBeatActionCancel: (_action, reason) => renderer?.combatAnimator?.monsterAttackAnimator
                ?.clearMonsterMotion?.(`beat-cancel:${reason || 'interrupted'}`),
            onTriggerHunterInterference: (...args) => renderer?.combatAnimator
                ?.triggerHunterInterference?.(...args),
            onTriggerGuardShake: (...args) => renderer?.combatAnimator?.triggerGuardImpact?.(...args),
            onInterruptWeaponVisual: index => renderer?.combatAnimator
                ?.interruptWeaponVisual?.(index, this.hunter(index)),
            onTriggerRollAnimation: index => renderer?.triggerRollAnimation?.(index),
            onTriggerInvincibleJump: (...args) => renderer?.triggerInvincibleJump?.(...args),
            onTriggerHitAnimation: (index, reaction) => renderer?.triggerHitAnimation?.(
                index, this.hunter(index), reaction),
            onCancelHitAnimation: (...args) => renderer?.cancelHitAnimation?.(...args),
            onTriggerDeathTag: (index, seconds) => renderer?.triggerDeathTag?.(
                index, this.hunter(index), seconds || 5),
            onTriggerHunterReturn: index => renderer?.triggerHunterReturn?.(index, this.hunter(index)),
            onTriggerStunUI: (...args) => renderer?.triggerStunUI?.(...args),
            onTriggerRoarStun: (...args) => renderer?.triggerRoarStun?.(...args),
            onTriggerMonsterKnockdownAnim: details => renderer?.triggerMonsterKnockdownAnim?.(details),
            onTriggerMonsterPartBreakReaction: (...args) => renderer
                ?.triggerMonsterPartBreakReaction?.(...args),
            onTriggerMonsterPartBreakVisual: kind => renderer?.triggerMonsterPartBreakVisual?.(kind),
            onTriggerMonsterSleepAnim: details => renderer?.triggerMonsterSleepAnim?.(details),
            onTriggerMonsterTraitReaction: (...args) => renderer?.triggerMonsterTraitReaction?.(...args),
            onTriggerEnvironmentEffect: (...args) => renderer?.triggerEnvironmentEffect?.(...args),
            onGameEnd: (...args) => hooks.onGameEnd?.(...args),
            onNextConsecutive: () => hooks.onNextConsecutive?.(),
            onTriggerValstraxAmbush: () => renderer?.triggerValstraxAmbushWarning?.()
        };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntCombatPresenter;
else globalThis.HuntCombatPresenter = HuntCombatPresenter;
