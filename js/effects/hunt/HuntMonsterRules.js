class HuntMonsterRules {
    static BASE_ATTACK_ACCURACY = 1;

    // 분노 사이 진정 구간의 표준 길이. 저작 데이터가 지속만 적고 회복을 빠뜨렸을 때
    // 쓰인다(HuntMonsterArchetypeCatalog의 모든 몬스터가 실제로 이 값을 쓴다).
    static DEFAULT_RAGE_RECOVERY_TICKS = 300;

    static attackAccuracy(_pattern = {}) {
        // A selected monster attack always reaches its target. Avoidance belongs
        // exclusively to the hunter response layer: evade, guard, counter,
        // invulnerability, or a pattern-specific immunity.
        return HuntMonsterRules.BASE_ATTACK_ACCURACY;
    }

    static isHunterTargetable(engine = {}, hunter = {}) {
        if (!['alive', 'stunned'].includes(String(hunter.status || ''))) return false;
        if (Number(hunter.cartRecoveryTicks || 0) > 0) return false;
        if (Number(hunter.jumpInvulnerableTicks || 0) > 0) return false;
        if (hunter.isAtCamp) return false;
        return !engine.perkRuntime || engine.perkRuntime.isTargetable(hunter);
    }

    static isTargetable(engine = {}) {
        if (engine.monsterBurrowState?.phase === 'underground') return false;
        if (engine.monsterTraversalState?.untargetable) return false;
        if (engine.monsterState === 'valstrax_flying') return false;
        return true;
    }

    static isTrapImmune(monster = {}, tier = '') {
        if (tier === 'small' || tier === 'elder' || tier === 'colossal') return true;
        const id = String(monster?.id || monster || '').toLowerCase().replace(/[-']/g, '_');
        return new Set([
            'ancient_leshen','alatreon','amatsu','blackveil_vaal_hazak','chameleos',
            'crimson_glow_valstrax','fatalis','gaismagorm','ibushi','kirin','kulve_taroth',
            'kushala_daora','lao_shan_lung','lunastra','malzeno','namielle','nakarkos',
            'narwa','allmother_narwa','nergigante','primordial_malzeno','ruiner_nergigante',
            'safi_jiiva','shagaru_magala','shara_ishvalda','teostra','vaal_hazak',
            'valstrax','velkhana','xeno_jiiva','zorah_magdaros','akantor','ukanlos'
        ]).has(id);
    }

    static speedForState(state, monsterId = '', multiplier = 1) {
        const baseFill = typeof HuntAtbConfig !== 'undefined'
            ? HuntAtbConfig.FILL_PER_TICK
            : 1.25;
        let speed = baseFill;
        if (state === 'enraged') speed = baseFill * 1.5;
        else if (state === 'exhausted' || state === 'valstrax_charging') speed = baseFill * 0.5;
        if (monsterId.includes('vaal_hazak')) speed *= 0.75;
        return speed * multiplier;
    }

    static stateForBattleTime(battleTime, behavior = {}) {
        const tick = Math.max(0, Number(battleTime || 0));
        const rageDuration = Number(behavior.rageDurationTicks || 0);
        // 회복 길이를 빠뜨렸다고 해서 "분노 주기 없음"으로 읽으면 안 된다. 예전에는
        // 그 조합이 조용히 아래 영구 분노 분기로 떨어져, 지속 900틱이라고 적어둔
        // 몬스터가 800틱 이후 영원히 분노 상태였다. 지속을 적었다는 것은 주기를
        // 의도했다는 뜻이므로, 회복은 표준값으로 메운다.
        const rageRecoveryDuration = Number(behavior.rageRecoveryDurationTicks || 0)
            || (rageDuration > 0 ? this.DEFAULT_RAGE_RECOVERY_TICKS : 0);
        if (rageDuration > 0 && rageRecoveryDuration > 0) {
            const rageStart = Math.max(0, Number(behavior.rageStartTick || 800));
            if (tick < rageStart) return 'normal';
            const phaseTick = (tick - rageStart) % (rageDuration + rageRecoveryDuration);
            return phaseTick < rageDuration ? 'enraged' : 'normal';
        }
        if (tick < 800) return 'normal';
        // Exhaustion is stamina-driven and must never be synthesized from the
        // rage clock. Monsters without authored cadence remain enraged here.
        return 'enraged';
    }

    static materialFor(monsterName, random = Math.random) {
        const name = monsterName || '몬스터';
        const materials = ['비늘', '갑각', '발톱', '꼬리', '날개', '꼬리뼈'];
        const index = Math.min(materials.length - 1, Math.floor(random() * materials.length));
        return `${name}의 ${materials[index]}`;
    }

    static crossedKnockdownThresholds(hp, maxHp, triggered, monsterId = '') {
        if (monsterId.includes('valstrax') || hp <= 0 || maxHp <= 0) return [];
        const ratio = (hp / maxHp) * 100;
        return [80, 60, 40, 20].filter(threshold => ratio <= threshold && !triggered[threshold]);
    }

    static crossedKnockdownThreshold(hp, maxHp, triggered, monsterId = '') {
        return this.crossedKnockdownThresholds(hp, maxHp, triggered, monsterId)[0] || null;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterRules;
else globalThis.HuntMonsterRules = HuntMonsterRules;
