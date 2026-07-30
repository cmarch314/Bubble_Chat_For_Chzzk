'use strict';

/**
 * Mutable, data-driven monster traits which outlive a single action.
 *
 * Profiles still own individual moves. This runtime owns cross-action state
 * such as inflated air sacs, heated scales, delayed hazards and break-driven
 * movement failures. Trait configuration comes from HuntMonsterArchetypeCatalog;
 * monster IDs must not be branched on here.
 */
class HuntMonsterTraitRuntime {
    constructor(random = Math.random) {
        this.random = random;
    }

    initialize(engine) {
        engine.monsterTraits = Array.isArray(engine.monsterBehavior?.traits)
            ? engine.monsterBehavior.traits.map(trait => ({ ...trait }))
            : [];
        engine.monsterTraitState = {
            active: new Set(),
            heat: 0,
            pendingHazards: [],
            visualKey: ''
        };
        this.refresh(engine);
    }

    trait(engine, kind) {
        return (engine.monsterTraits || []).find(trait => trait.kind === kind) || null;
    }

    brokenCount(engine, parts = []) {
        const expected = new Set(parts.map(part => String(part).toLowerCase()));
        return (engine.monsterPartState || []).filter(part =>
            (part.broken || part.severed)
            && expected.has(String(part.kind || '').toLowerCase())
        ).length;
    }

    refresh(engine) {
        const state = engine.monsterTraitState;
        if (!state) return;
        const next = new Set();
        const airborne = engine.monsterFlightState === 'airborne';
        const enraged = engine.monsterState === 'enraged';

        for (const trait of engine.monsterTraits || []) {
            if (trait.kind === 'inflation') {
                const disabled = this.brokenCount(engine, trait.disabledByParts || []) > 0;
                if (airborne && !disabled) next.add('inflated');
            } else if (trait.kind === 'rage-eyes' && enraged) {
                next.add('rage-eyes');
            } else if (trait.kind === 'ice-coat' && (airborne || enraged)) {
                next.add('ice-coated');
            } else if (trait.kind === 'hellfire' && enraged) {
                next.add('hellfire');
            } else if (trait.kind === 'blast-scales' && state.heat > 0) {
                next.add(state.heat >= Number(trait.criticalHeat || 3) ? 'scale-critical' : 'scale-heated');
            }
        }

        state.active = next;
        const visualKey = [...next].sort().join(' ');
        if (visualKey !== state.visualKey) {
            state.visualKey = visualKey;
            engine.callbacks?.onUpdateMonsterTraitVisual?.([...next]);
        }
    }

    context(engine) {
        this.refresh(engine);
        return [...(engine.monsterTraitState?.active || [])];
    }

    canEnterFlight(engine) {
        // Some flight kits depend on a body trait rather than wings alone.
        // Paolumu, for example, cannot sustain its authored aerial kit after
        // the inflation-enabling part is broken. Keep this trait-driven so the
        // flight runtime never needs a monster-ID exception.
        return !(engine.monsterTraits || []).some(trait =>
            trait.kind === 'inflation'
            && this.brokenCount(engine, trait.disabledByParts || []) > 0
        );
    }

    canTriggerTrap(engine, trapKind) {
        const conditional = this.trait(engine, 'conditional-trap');
        if (!conditional || conditional.trap !== trapKind) return true;
        return (conditional.allowedStates || []).includes(engine.monsterState);
    }

    afterAction(engine, pattern, attackResults = []) {
        if (pattern?.runtimeImpactTimelineEvent && pattern.runtimeImpactTimelineFinal !== true) {
            return attackResults;
        }
        const scaleTrait = this.trait(engine, 'blast-scales');
        if (scaleTrait && pattern?.tags?.includes('scale')) {
            const state = engine.monsterTraitState;
            const heated = pattern.tags.includes('heated-scale');
            const heatGain = heated ? 2 : 1;
            state.heat = Math.min(Number(scaleTrait.maxHeat || 4), Number(state.heat || 0) + heatGain);
            const count = Math.max(1, Number(heated ? scaleTrait.heatedDropCount : scaleTrait.dropCount) || 1);
            const baseDelay = Math.max(4, Number(scaleTrait.delayTicks || 24));
            for (let index = 0; index < count; index++) {
                state.pendingHazards.push({
                    remainingTicks: baseDelay + Math.floor(this.random() * Math.max(1, Number(scaleTrait.delayVarianceTicks || 12))),
                    damageRatio: Number(heated ? scaleTrait.heatedDamageRatio : scaleTrait.damageRatio) || .08
                });
            }
            state.pendingHazards = state.pendingHazards
                .sort((a, b) => a.remainingTicks - b.remainingTicks)
                .slice(0, Math.max(1, Number(scaleTrait.maxPending || 6)));
            if (pattern.tags.includes('landing-only')) state.heat = 0;
        }

        const slipTrait = this.trait(engine, 'broken-limb-slip');
        if (slipTrait
            && pattern?.tags?.some(tag => (slipTrait.patternTags || ['charge']).includes(tag))
            && this.brokenCount(engine, slipTrait.parts || []) > 0) {
            const broken = this.brokenCount(engine, slipTrait.parts || []);
            const duration = Math.max(1, Math.round(
                Number(slipTrait.baseTicks || 18) + Number(slipTrait.perBrokenPartTicks || 8) * broken
            ));
            engine.monsterAtb = 0;
            engine.monsterActionLockTicks = Math.max(Number(engine.monsterActionLockTicks || 0), duration);
            engine.updateMonsterAtbUI?.(0);
            engine.callbacks?.onTriggerMonsterTraitReaction?.('limb-slip', duration);
        }

        const fatigueTrait = this.trait(engine, 'charge-fatigue');
        if (fatigueTrait
            && engine.monsterState === 'exhausted'
            && pattern?.tags?.includes('charge')) {
            const duration = Math.max(1, Number(fatigueTrait.stumbleTicks || 24));
            engine.monsterAtb = 0;
            engine.monsterActionLockTicks = Math.max(Number(engine.monsterActionLockTicks || 0), duration);
            engine.updateMonsterAtbUI?.(0);
            engine.callbacks?.onTriggerMonsterTraitReaction?.('fatigue-stumble', duration);
        }

        this.refresh(engine);
        return attackResults;
    }

    tick(engine) {
        const state = engine.monsterTraitState;
        if (!state) return;
        this.refresh(engine);
        if (!state.pendingHazards.length || engine.monsterHp <= 0) return;

        state.pendingHazards.forEach(hazard => { hazard.remainingTicks--; });
        const due = state.pendingHazards.filter(hazard => hazard.remainingTicks <= 0);
        state.pendingHazards = state.pendingHazards.filter(hazard => hazard.remainingTicks > 0);
        if (!due.length) return;

        const targetable = (engine.selectedWeapons || []).filter(hunter =>
            hunter?.status === 'alive'
            && (!globalThis.HuntMonsterRules?.isHunterTargetable
                || globalThis.HuntMonsterRules.isHunterTargetable(engine, hunter))
        );
        if (!targetable.length) return;

        // Resolve a due batch as one spectacle event so OBS never accumulates
        // one animation per physical scale.
        const target = targetable[Math.floor(this.random() * targetable.length)];
        const strongest = Math.max(...due.map(hazard => Number(hazard.damageRatio || 0)));
        engine.triggerEnvironmentEffect?.('blast-scale', target.index);
        engine.executeMonsterTurn?.({
            id: 'trait.delayed_blast_scale',
            name: '지연 폭린 폭발',
            type: 'area',
            delivery: 'field',
            damageRatio: strongest,
            maxTargets: 1,
            tags: ['blast', 'delayed-hazard'],
            runtimeImpactTargetIndices: [target.index],
            runtimeImpactTimelineFinal: true
        }, null, target.index);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterTraitRuntime;
else globalThis.HuntMonsterTraitRuntime = HuntMonsterTraitRuntime;
