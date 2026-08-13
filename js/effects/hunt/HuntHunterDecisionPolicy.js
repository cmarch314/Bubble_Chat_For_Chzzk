'use strict';

class HuntHunterDecisionPolicy {
    static profiles() {
        if (typeof HuntPersonalityProfiles !== 'undefined') return HuntPersonalityProfiles;
        if (typeof require === 'function') return require('./HuntPersonalityProfiles.js');
        return null;
    }

    static living(engine) {
        return (engine?.selectedWeapons || []).filter(hunter => hunter?.status === 'alive' && !hunter.isAtCamp);
    }

    static context(engine, hunter) {
        const living = this.living(engine);
        const injured = living.filter(ally => Number(ally.hp || 0) <= Number(ally.maxHp || 1) * .55);
        const critical = living.filter(ally => Number(ally.hp || 0) <= Number(ally.maxHp || 1) * .30);
        const pattern = engine?.pendingMonsterAction?.pattern || engine?.pendingMonsterImpact?.pattern || null;
        const dangerous = Boolean(pattern?.ultimate || pattern?.isUltimate
            || Number(pattern?.damageRatio || 0) >= .35 || Number(engine?.monsterAtb || 0) >= 85);
        const controlled = Boolean(Number(engine?.monsterKnockdownDuration || 0) > 0
            || Number(engine?.monsterStunDuration || 0) > 0
            || engine?.activeTrapControl
            || ['knocked_down', 'stunned', 'paralyzed', 'sleeping'].includes(engine?.monsterState));
        const rawEnteredAt = engine?.monsterControlEnteredAtTick;
        const enteredAt = Number(rawEnteredAt);
        const controlAgeTicks = rawEnteredAt !== null && rawEnteredAt !== undefined && Number.isFinite(enteredAt)
            ? Math.max(0, Number(engine?.battleTime || 0) - enteredAt)
            : Number.POSITIVE_INFINITY;
        const progress = Math.max(0, Math.min(1, Number(engine?.battleTime || 0)
            / Math.max(1, Number(engine?.timeLimit || 480) * 10)));
        return { living, injured, critical, pattern, dangerous, controlled, controlAgeTicks, progress,
            sleeping: engine?.monsterState === 'sleeping',
            airborne: engine?.monsterFlightState === 'airborne' };
    }

    static otherCarrier(engine, hunter, key) {
        return this.living(engine).some(ally => ally !== hunter && Number(ally?.[key] || 0) > 0);
    }

    static chooseSupportAction(engine, hunter) {
        const Profiles = this.profiles();
        if (!Profiles || !engine || !hunter) return null;
        const profile = Profiles.get(hunter.personality);
        const ai = profile.ai;
        const ctx = this.context(engine, hunter);
        const random = typeof engine.random === 'function' ? engine.random.bind(engine) : Math.random;
        const perkBias = action => Number(engine.perkRuntime?.aiBias?.(hunter, action) || 0);
        const jitter = () => (Number(random()) - .5) * Number(ai.variance || 0);
        const lateSpend = ctx.progress * (1 - Number(ai.conservation || 0)) * .20;
        const choices = [];
        const add = (kind, score, holdTicks) => {
            const chance = Math.max(0, Math.min(.98, Number(score || 0)));
            if (chance < .05 || Number(random()) >= chance
                || engine.teamIntentCoordinator?.active(kind, engine.battleTime)) return;
            choices.push({ kind, score: chance, holdTicks });
        };

        if (Number(hunter.lifepowders || 0) > 0 && ctx.injured.length) {
            const urgency = ctx.critical.length ? .44 : ctx.injured.length > 1 ? .25 : .08;
            add('powder', Number(ai.powder || 0) + perkBias('powder') + urgency + lateSpend + jitter(), 10);
        }

        if (Number(hunter.flashPods || 0) > 0 && ctx.airborne
            && Number(engine.monsterFlashUseCount || 0) < Number(engine.monsterBehavior?.maxEffectiveFlashes ?? 4)) {
            const veteranDefers = Profiles.normalize(hunter.personality) === 'veteran'
                && this.otherCarrier(engine, hunter, 'flashPods');
            if (!veteranDefers) {
                add('flash', Number(ai.flash || 0) + perkBias('flash') + (ctx.dangerous ? .18 : 0) + lateSpend + jitter(), 12);
            }
        }

        const trapLegal = Number(hunter.shockTraps || 0) > 0
            && !engine.smallMonsterSwarm && !engine.isMonsterTrapImmune?.()
            && !ctx.controlled && !engine.pendingLandingTrap
            && engine.monsterTraitRuntime?.canTriggerTrap?.(engine,
                typeof HuntTrapConfig !== 'undefined' ? HuntTrapConfig.DEFAULT_KIND : 'pitfall') !== false
            && (ctx.airborne || engine.monsterState === 'normal');
        if (trapLegal) {
            const veteranDefers = Profiles.normalize(hunter.personality) === 'veteran'
                && this.otherCarrier(engine, hunter, 'shockTraps');
            if (!veteranDefers) {
                add('trap', Number(ai.trap || 0) + perkBias('trap') + (ctx.dangerous ? .24 : -.28)
                    + (ctx.critical.length ? .18 : 0) + lateSpend + jitter(), 20);
            }
        }

        const hasBombardier = (hunter.perks || []).some(perk =>
            String(typeof perk === 'string' ? perk : perk?.name || '') === '폭파광');
        // Bombs never create control. Give a newly entered knockdown/KO/trap a
        // readable lead before Bombardier follows up, otherwise the same-tick
        // explosion falsely appears to have caused the large stagger. Sleep
        // bombing remains immediate because the sleeping pose is already an
        // established, explicit setup state.
        const readableBombWindow = ctx.sleeping || ctx.controlAgeTicks >= 6;
        if (Number(hunter.bombs || 0) > 0 && ctx.controlled && readableBombWindow
            && (ctx.sleeping || hasBombardier)) {
            add('bomb', Number(ai.bomb || 0) + perkBias('bomb') + .18 + lateSpend + jitter(), 5);
        }

        choices.sort((a, b) => b.score - a.score || a.kind.localeCompare(b.kind));
        const selected = choices[0] || null;
        if (!selected) return null;
        if (engine.teamIntentCoordinator
            && !engine.teamIntentCoordinator.claim(selected.kind, hunter, engine.battleTime, selected.holdTicks)) return null;
        return selected;
    }

    static potionPolicy(hunter, engine = null) {
        const key = this.profiles()?.normalize(hunter?.personality) || 'normal';
        const thresholds = { offensive: .42, normal: .55, defensive: .62, support: .55, veteran: .48, newbie: .80 };
        const chances = { offensive: .45, normal: .65, defensive: .88, support: .75, veteran: .82, newbie: .95 };
        const thresholdBias = Number(engine?.perkRuntime?.aiBias?.(hunter, 'potion-threshold') || 0);
        const chanceBias = Number(engine?.perkRuntime?.aiBias?.(hunter, 'potion') || 0);
        const hpRate = Number(hunter?.hp || 0) / Math.max(1, Number(hunter?.maxHp || 1));
        const threshold = Math.max(.35, Math.min(.82, thresholds[key] + thresholdBias));
        const safetyChance = hpRate <= .30 ? .92 : 0;
        return { threshold, chance: Math.max(safetyChance, Math.min(.98, chances[key] + chanceBias)) };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntHunterDecisionPolicy;
else globalThis.HuntHunterDecisionPolicy = HuntHunterDecisionPolicy;
