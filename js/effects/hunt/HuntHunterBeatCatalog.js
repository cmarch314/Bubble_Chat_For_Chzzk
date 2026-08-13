'use strict';

class HuntHunterBeatCatalog {
    static get WEAPON_IDS() {
        return Object.freeze([
            'great_sword', 'long_sword', 'sword_shield', 'dual_blades', 'hammer', 'hunting_horn',
            'lance', 'gunlance', 'switch_axe', 'charge_blade', 'insect_glaive',
            'light_bowgun', 'heavy_bowgun', 'bow'
        ]);
    }

    static distributeOffsets(count, activeTicks) {
        const size = Math.max(1, Math.floor(Number(activeTicks) || 1));
        if (count <= 1) return [Math.max(0, size - 1)];
        return Array.from({ length: count }, (_, index) => Math.min(
            size - 1,
            Math.round((index / (count - 1)) * (size - 1))
        ));
    }

    static genericWeapon(weaponId, action = {}) {
        const id = String(action.id || '');
        if (!id.startsWith(`${weaponId}.`)) return null;
        const totalTicks = Math.max(1, Math.round(Number(action.durationTicks || 1)));
        const tags = new Set(action.tags || []);
        const preparation = tags.has('preparation') || Number(action.dmg || 0) <= 0;
        const explicitWindup = Number(action.windupTicks);
        const explicitActive = Number(action.activeTicks);
        const explicitRecovery = Number(action.recoveryTicks);
        let windup;
        let active;
        let recovery;
        if ([explicitWindup, explicitActive, explicitRecovery].every(Number.isFinite)
            && explicitWindup + explicitActive + explicitRecovery > 0) {
            const authoredTotal = explicitWindup + explicitActive + explicitRecovery;
            windup = Math.max(1, Math.round(totalTicks * explicitWindup / authoredTotal));
            active = Math.max(1, Math.round(totalTicks * explicitActive / authoredTotal));
            recovery = Math.max(1, totalTicks - windup - active);
        } else if (preparation) {
            windup = Math.max(1, Math.floor(totalTicks * .28));
            active = Math.max(1, Math.floor(totalTicks * .48));
            recovery = Math.max(1, totalTicks - windup - active);
        } else {
            const windupRatio = tags.has('heavy') || tags.has('finisher') ? .46
                : (tags.has('counter') ? .34 : (tags.has('ranged') ? .3 : .36));
            const hitCount = Math.max(1, Array.isArray(action.hits) ? action.hits.length : 1);
            windup = Math.max(1, Math.floor(totalTicks * windupRatio));
            recovery = Math.max(1, Math.floor(totalTicks * (tags.has('mobility') ? .2 : .26)));
            active = Math.max(hitCount > 1 ? 2 : 1, totalTicks - windup - recovery);
            if (windup + active + recovery > totalTicks) {
                recovery = 1;
                windup = Math.max(1, totalTicks - active - recovery);
            }
        }
        active = Math.max(1, totalTicks - windup - recovery);
        const audioCue = String(action.audioCue || 'none');
        const beats = preparation ? [
            { id: 'windup', ticks: windup, events: [] },
            { id: 'active', ticks: active, events: audioCue === 'none' ? [] : [
                { id: `${id}:audio`, kind: 'audio', slot: audioCue, offsetTicks: 0 }
            ] },
            { id: 'recovery', ticks: recovery, events: [] }
        ] : (() => {
            const hitCount = Math.max(1, Array.isArray(action.hits) ? action.hits.length : 1);
            const offsets = this.distributeOffsets(hitCount, active);
            const events = offsets.map((offsetTicks, index) => ({
                id: `${id}:hit:${index + 1}`,
                kind: 'damage',
                target: 'primary',
                hitIndex: index,
                hitCount,
                offsetTicks
            }));
            if (audioCue !== 'none') events.push({
                id: `${id}:audio`, kind: 'audio', slot: audioCue, offsetTicks: offsets[0]
            });
            return [
                { id: 'windup', ticks: windup, events: [] },
                { id: 'impact', ticks: active, events },
                { id: 'recovery', ticks: recovery, events: [] }
            ];
        })();
        return HuntBeatV2Contract.compile({
            schemaVersion: 2,
            backend: 'beat-v2',
            reviewStatus: 'migrated',
            id,
            actor: 'hunter',
            source: Object.freeze({ kind: 'weapon-action', weaponId }),
            atb: { cost: Number(action.atbCostSeconds || 0), recovery: 'during-action', gateUntil: 'complete' },
            beats
        });
    }

    static greatSword(action = {}) {
        const id = String(action.id || '');
        if (!id.startsWith('great_sword.')) return null;
        const totalTicks = Math.max(1, Math.round(Number(action.durationTicks || 1)));
        const preparation = action.tags?.includes('preparation');
        const release = action.tags?.includes('charge-release');
        const tackle = action.tags?.includes('tackle');
        const trueChargedSlash = id === 'great_sword.true_charged_slash';
        const wideSlash = id === 'great_sword.wide_slash';
        const kick = id === 'great_sword.kick';
        let beats;
        if (preparation) {
            beats = [
                { id: 'raise', ticks: Math.max(1, Math.floor(totalTicks * .35)), events: [] },
                { id: 'charge', ticks: totalTicks - Math.max(1, Math.floor(totalTicks * .35)), events: [
                    { id: `${id}:charge-audio`, kind: 'audio', slot: action.audioCue || 'weapon_charge', offsetTicks: 0 }
                ] }
            ];
        } else if (trueChargedSlash) {
            const firstSwing = Math.max(1, Math.floor(totalTicks * .38));
            const plant = Math.max(1, Math.floor(totalTicks * .14));
            const recovery = Math.max(1, Math.floor(totalTicks * .12));
            const rebound = Math.max(1, totalTicks - firstSwing - plant - recovery);
            beats = [
                { id: 'first-swing', ticks: firstSwing, events: [{
                    id: `${id}:hit:1`, kind: 'damage', target: 'primary',
                    hitIndex: 0, hitCount: 2, offsetTicks: firstSwing - 1
                }] },
                { id: 'blade-plant', ticks: plant, events: [{
                    id: `${id}:plant-audio`, kind: 'audio', slot: 'impact', offsetTicks: 0
                }] },
                { id: 'rebound-swing', ticks: rebound, events: [{
                    id: `${id}:hit:2`, kind: 'damage', target: 'primary',
                    hitIndex: 1, hitCount: 2, offsetTicks: rebound - 1
                }] },
                { id: 'recovery', ticks: recovery, events: [] }
            ];
        } else if (wideSlash) {
            const draw = Math.max(1, Math.min(2, totalTicks - 2));
            const sweep = Math.max(1, Math.floor(totalTicks * .45));
            const recovery = Math.max(1, totalTicks - draw - sweep);
            beats = [
                { id: 'draw-side', ticks: draw, events: [] },
                { id: 'horizontal-sweep', ticks: sweep, events: [{
                    id: `${id}:hit:1`, kind: 'damage', target: 'primary',
                    hitIndex: 0, hitCount: 1, offsetTicks: sweep - 1
                }] },
                { id: 'recovery', ticks: recovery, events: [] }
            ];
        } else if (kick) {
            const brace = 1;
            const strike = Math.max(1, Math.min(2, totalTicks - 2));
            const recovery = Math.max(1, totalTicks - brace - strike);
            beats = [
                { id: 'brace', ticks: brace, events: [] },
                { id: 'kick', ticks: strike, events: [{
                    id: `${id}:hit:1`, kind: 'damage', target: 'primary',
                    hitIndex: 0, hitCount: 1, offsetTicks: strike - 1
                }] },
                { id: 'recovery', ticks: recovery, events: [] }
            ];
        } else {
            const windup = Math.max(1, Math.floor(totalTicks * (release ? .42 : .28)));
            const impact = Math.max(1, Math.floor(totalTicks * (tackle ? .32 : .28)));
            const recovery = Math.max(1, totalTicks - windup - impact);
            const correctedImpact = totalTicks - windup - recovery;
            const hitCount = Math.max(1, Array.isArray(action.hits) ? action.hits.length : 1);
            const hitOffsets = this.distributeOffsets(hitCount, correctedImpact);
            beats = [
                { id: 'windup', ticks: windup, events: [] },
                { id: 'impact', ticks: correctedImpact, events: hitOffsets.map((offsetTicks, index) => ({
                    id: `${id}:hit:${index + 1}`,
                    kind: 'damage',
                    target: 'primary',
                    hitIndex: index,
                    hitCount,
                    offsetTicks
                })) },
                { id: 'recovery', ticks: recovery, events: [] }
            ];
        }
        return HuntBeatV2Contract.compile({
            schemaVersion: 2,
            backend: 'beat-v2',
            reviewStatus: 'approved',
            id,
            actor: 'hunter',
            source: Object.freeze({ kind: 'weapon-action', weaponId: 'great_sword' }),
            atb: { cost: Number(action.atbCostSeconds || 0), recovery: 'during-action', gateUntil: 'complete' },
            beats
        });
    }

    static compile(weaponId, action = {}) {
        if (!this.WEAPON_IDS.includes(weaponId)) return null;
        return weaponId === 'great_sword'
            ? this.greatSword(action)
            : this.genericWeapon(weaponId, action);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntHunterBeatCatalog;
else window.HuntHunterBeatCatalog = HuntHunterBeatCatalog;
