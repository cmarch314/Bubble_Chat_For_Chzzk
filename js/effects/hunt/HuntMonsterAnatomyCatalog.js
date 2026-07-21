'use strict';

class HuntMonsterAnatomyCatalog {
    static TAIL_SEVERABLE_IDS = new Set([
        'anjanath','azure_rathalos','rathalos','rathian','pink_rathian','gold_rathian','silver_rathalos',
        'bazelgeuse','seething_bazelgeuse','diablos','black_diablos','deviljho','savage_deviljho','dodogama',
        'great_girros','great_jagras','jyuratodus','kushala_daora','lavasioth','legiana','shrieking_legiana',
        'lunastra','teostra','nergigante','ruiner_nergigante','odogaron','ebony_odogaron','paolumu','nightshade_paolumu',
        'pukei_pukei','coral_pukei_pukei','radobaan','tobi_kadachi','viper_tobi_kadachi','uragaan',
        'vaal_hazak','blackveil_vaal_hazak','xenojiiva','safijiiva','acidic_glavenus','glavenus','alatreon',
        'banbaro','barioth','frostfang_barioth','brachydios','raging_brachydios','tigrex','brute_tigrex',
        'fatalis','namielle','nargacuga','yian_garuga','scarred_yian_garuga','zinogre','stygian_zinogre','velkhana',
        'gore_magala','shagaru_magala','valstrax','crimson_glow_valstrax','magnamalo','malzeno','primordial_malzeno',
        'mizutsune','astalos','seregios','chameleos','akantor','ukanlos','amatsu','lagiacrus','royal_ludroth'
    ]);

    static normalize(value) {
        return String(value || '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    }

    static source() {
        if (typeof HUNT_WILDS_MONSTER_ANATOMY !== 'undefined') return HUNT_WILDS_MONSTER_ANATOMY;
        if (typeof window !== 'undefined') return window.HUNT_WILDS_MONSTER_ANATOMY || { monsters: {} };
        return { monsters: {} };
    }

    static FLYING_IDS = new Set([
        'rathalos','azure_rathalos','silver_rathalos','rathian','pink_rathian','gold_rathian',
        'legiana','shrieking_legiana','paolumu','nightshade_paolumu','bazelgeuse','seething_bazelgeuse',
        'kushala_daora','namielle','alatreon','fatalis','astalos','seregios','valstrax','crimson_glow_valstrax'
    ]);

    static FORELEG_TOPPLE_IDS = new Set([
        'barioth','frostfang_barioth','tigrex','brute_tigrex','nargacuga','yian_garuga','scarred_yian_garuga',
        'anjanath','deviljho','savage_deviljho','zinogre','stygian_zinogre','odogaron','ebony_odogaron',
        'nergigante','ruiner_nergigante','magnamalo','malzeno','primordial_malzeno'
    ]);

    static HEAD_TOPPLE_IDS = new Set([
        'uragaan','radobaan','barroth','brachydios','raging_brachydios','nergigante','ruiner_nergigante'
    ]);

    static find(monster) {
        const source = this.source().monsters || {};
        const candidates = [monster?.id, monster?.nameEN, monster?.name].map(this.normalize);
        for (const id of candidates) {
            if (id && source[id]) return { ...source[id], tailSeverable: this.TAIL_SEVERABLE_IDS.has(id) };
        }
        const id = candidates.find(Boolean);
        if (!id) return null;
        return this.fallbackProfile(id);
    }

    static fallbackProfile(id) {
        const flying = this.FLYING_IDS.has(id);
        const forelegTopple = this.FORELEG_TOPPLE_IDS.has(id);
        const parts = [
            { id: `${id}:head`, kind: 'head', health: 620, breakable: true, hitzones: { slash: .55, blunt: .62, pierce: .48 } },
            { id: `${id}:torso`, kind: 'torso', health: 900, breakable: false, hitzones: { slash: .32, blunt: .32, pierce: .28 } }
        ];
        if (flying) {
            parts.push(
                { id: `${id}:left-wing`, kind: 'left-wing', health: 460, breakable: true, hitzones: { slash: .44, blunt: .40, pierce: .48 } },
                { id: `${id}:right-wing`, kind: 'right-wing', health: 460, breakable: true, hitzones: { slash: .44, blunt: .40, pierce: .48 } }
            );
        } else {
            const legKind = forelegTopple ? 'front-leg' : 'leg';
            parts.push(
                { id: `${id}:left-${legKind}`, kind: `left-${legKind}`, health: 500, breakable: true, hitzones: { slash: .42, blunt: .44, pierce: .38 } },
                { id: `${id}:right-${legKind}`, kind: `right-${legKind}`, health: 500, breakable: true, hitzones: { slash: .42, blunt: .44, pierce: .38 } }
            );
        }
        if (this.TAIL_SEVERABLE_IDS.has(id)) {
            parts.push({ id: `${id}:tail`, kind: 'tail', health: 560, breakable: false, hitzones: { slash: .48, blunt: .30, pierce: .40 } });
        }
        return {
            id, baseHealth: 5000, tailSeverable: this.TAIL_SEVERABLE_IDS.has(id),
            evidence: flying ? 'species-archetype:flying-wyvern' : 'species-archetype:grounded-body-plan', parts
        };
    }

    static breakReaction(monsterId, partKind, airborne = false) {
        const id = this.normalize(monsterId);
        const kind = String(partKind || '').toLowerCase();
        if (/tail/.test(kind)) return { type: 'flinch', durationTicks: 32, label: '꼬리 절단 경직' };
        if (/wing/.test(kind)) {
            if (airborne) return { type: 'aerial_topple', durationTicks: 105, label: '날개 파괴 격추 대경직' };
            return { type: 'topple', durationTicks: 70, label: '날개 파괴 대경직' };
        }
        if (/(front-leg|foreleg|front_leg|fore_leg)/.test(kind) && this.FORELEG_TOPPLE_IDS.has(id)) {
            return { type: 'topple', durationTicks: 70, label: '앞다리 파괴 대경직' };
        }
        if (/(leg|foot)/.test(kind)) return { type: 'topple', durationTicks: 70, label: '다리 파괴 대경직' };
        if (/(head|horn|chin|spike)/.test(kind) && this.HEAD_TOPPLE_IDS.has(id)) {
            return { type: 'topple', durationTicks: 70, label: '핵심 부위 파괴 대경직' };
        }
        return { type: 'flinch', durationTicks: 28, label: '부위 파괴 경직' };
    }

    static createPartState(profile) {
        if (!profile) return [];
        return (profile.parts || []).filter(part => Number(part.health) > 0).map(part => ({
            id: part.id,
            kind: part.kind,
            maxHealth: Number(part.health),
            health: Number(part.health),
            breakable: Boolean(part.breakable),
            severable: Boolean(profile.tailSeverable && /(^|-)tail($|-)/.test(part.kind)),
            severed: false,
            broken: false,
            damageAccumulated: 0,
            essence: part.essence || null,
            hitzones: { ...(part.hitzones || {}) }
        }));
    }

    static damageTypeForWeapon(weapon) {
        if (weapon?.damageTypeOverride) return weapon.damageTypeOverride;
        if (weapon?.id === 'hammer' || weapon?.id === 'hunting_horn') return 'blunt';
        if (weapon?.type === 'ranged') return 'pierce';
        return 'slash';
    }

    static choosePart(parts, damageType, random = Math.random) {
        // Broken parts remain hittable in the original games; only a severed tail
        // leaves the target pool. This also lets blunt weapons keep pursuing the head.
        const candidates = (parts || []).filter(part => !part.severed);
        if (!candidates.length) return null;
        const weighted = candidates.map(part => ({
            part,
            weight: Math.max(0.05, Number(part.hitzones?.[damageType] || 0.05))
                * (part.breakable && !part.broken ? 1.35 : 1)
                * (damageType === 'blunt' && /(^|[-_])(head|horn|chin)([-_]|$)/.test(part.kind) ? 4.5 : 1)
        }));
        const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = Math.max(0, Math.min(0.999999, Number(random()) || 0)) * total;
        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll <= 0) return entry.part;
        }
        return weighted[weighted.length - 1].part;
    }

    static applyPartDamage(parts, weapon, rawDamage, scale, random = Math.random) {
        const damageType = this.damageTypeForWeapon(weapon);
        const part = this.choosePart(parts, damageType, random);
        if (!part) return null;
        const hitzone = Math.max(0, Number(part.hitzones?.[damageType] || 0));
        const canDamage = !part.severable || damageType === 'slash';
        const applied = canDamage ? Math.max(0, Number(rawDamage) || 0) * Math.max(0, Number(scale) || 0) * hitzone : 0;
        const wasBroken = part.broken;
        part.damageAccumulated += applied;
        part.health = Math.max(0, part.health - applied);
        if ((part.breakable || part.severable) && part.health <= 0) part.broken = true;
        if (part.severable && part.broken) part.severed = true;
        return { part, damageType, hitzone, applied, newlyBroken: !wasBroken && part.broken, newlySevered: !wasBroken && part.severed };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterAnatomyCatalog;
else window.HuntMonsterAnatomyCatalog = HuntMonsterAnatomyCatalog;
