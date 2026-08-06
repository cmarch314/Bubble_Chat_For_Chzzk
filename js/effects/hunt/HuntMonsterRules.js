class HuntMonsterRules {
    static BASE_ATTACK_ACCURACY = 1;

    // 분노 지속은 두 가지 값만 쓴다: 표준 1분 30초, 짧은 쪽 1분.
    // 영구 분노인 몬스터는 존재하지 않으므로, 주기를 저작하지 않은 몬스터도
    // 표준 주기로 돈다. 저작 데이터는 표준과 다를 때만 값을 적으면 된다.
    static DEFAULT_RAGE_DURATION_TICKS = 900;
    static SHORT_RAGE_DURATION_TICKS = 600;
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
        // 분노는 언제나 주기다. 영구 분노인 몬스터는 없으므로, 저작 데이터가
        // 비어 있거나 일부만 있어도 표준 주기(1분 30초 분노 / 30초 진정)로 돈다.
        // 예전에는 값이 없거나 회복만 빠져도 "800틱 이후 영원히 분노"로 떨어져,
        // 지속을 적어둔 몬스터의 값이 아무 효과가 없었다.
        const rageDuration = Number(behavior.rageDurationTicks || 0)
            || this.DEFAULT_RAGE_DURATION_TICKS;
        const rageRecoveryDuration = Number(behavior.rageRecoveryDurationTicks || 0)
            || this.DEFAULT_RAGE_RECOVERY_TICKS;
        const rageStart = Math.max(0, Number(behavior.rageStartTick || 800));
        if (tick < rageStart) return 'normal';
        // Exhaustion is stamina-driven and must never be synthesized from the
        // rage clock: this function only ever returns 'normal' or 'enraged'.
        const phaseTick = (tick - rageStart) % (rageDuration + rageRecoveryDuration);
        return phaseTick < rageDuration ? 'enraged' : 'normal';
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
