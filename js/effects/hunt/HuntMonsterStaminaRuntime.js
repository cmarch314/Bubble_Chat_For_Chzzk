'use strict';

class HuntMonsterStaminaRuntime {
    static precise(value) {
        return Math.round(Number(value || 0) * 1000000) / 1000000;
    }

    static atbConfig() {
        if (typeof HuntAtbConfig !== 'undefined') return HuntAtbConfig;
        if (typeof require === 'function') return require('./HuntAtbConfig.js');
        throw new Error('HuntAtbConfig is required before monster stamina');
    }

    constructor(overrides = {}) {
        const config = HuntMonsterStaminaRuntime.atbConfig();
        this.overrides = overrides || {};
        this.defaults = Object.freeze({
            max: config.MONSTER_STAMINA_MAX,
            naturalDrainPerAtb: config.MONSTER_STAMINA_DRAIN_PER_ATB,
            exhaustDurationTicks: config.MONSTER_EXHAUST_DURATION_TICKS,
            pantTicks: config.MONSTER_EXHAUST_PANT_TICKS,
            teamWindowTicks: config.MONSTER_EXHAUST_TEAM_WINDOW_TICKS,
            teamWindowCapRate: config.MONSTER_EXHAUST_TEAM_WINDOW_CAP_RATE,
            hunterDrainMultiplier: config.MONSTER_HUNTER_EXHAUST_MULTIPLIER,
            postProtectionTicks: config.MONSTER_EXHAUST_POST_PROTECTION_TICKS,
            resistanceMultipliers: config.MONSTER_EXHAUST_RESISTANCE_MULTIPLIERS
        });
    }

    initialize(engine, supplied = {}) {
        const authored = engine?.monsterBehavior?.stamina || {};
        const profile = { ...this.defaults, ...authored, ...this.overrides, ...supplied };
        profile.max = Math.max(1, Number(profile.max || this.defaults.max));
        profile.naturalDrainPerAtb = Math.max(0, Number(profile.naturalDrainPerAtb || 0));
        profile.exhaustDurationTicks = Math.max(1, Number(profile.exhaustDurationTicks || 1));
        profile.pantTicks = Math.max(0, Number(profile.pantTicks || 0));
        profile.teamWindowTicks = Math.max(1, Number(profile.teamWindowTicks || 1));
        profile.teamWindowCapRate = Math.max(0, Number(profile.teamWindowCapRate || 0));
        profile.hunterDrainMultiplier = Math.max(0, Number(profile.hunterDrainMultiplier || 0));
        profile.postProtectionTicks = Math.max(0, Number(profile.postProtectionTicks || 0));
        profile.resistanceMultipliers = Array.isArray(profile.resistanceMultipliers)
            && profile.resistanceMultipliers.length
            ? profile.resistanceMultipliers.map(value => Math.max(0, Number(value || 0)))
            : [...this.defaults.resistanceMultipliers];

        engine.monsterStaminaProfile = profile;
        engine.monsterStaminaMax = profile.max;
        engine.monsterStamina = Number.isFinite(Number(engine.monsterStamina))
            ? Math.max(0, Math.min(profile.max, Number(engine.monsterStamina)))
            : profile.max;
        engine.monsterExhaustionCount = Math.max(0, Number(engine.monsterExhaustionCount || 0));
        engine.monsterExhaustionTicks = Math.max(0, Number(engine.monsterExhaustionTicks || 0));
        engine.monsterExhaustProtectionTicks = Math.max(0, Number(engine.monsterExhaustProtectionTicks || 0));
        engine.monsterExhaustWindowStartTick = Math.max(0, Number(engine.monsterExhaustWindowStartTick || 0));
        engine.monsterExhaustWindowDrain = Math.max(0, Number(engine.monsterExhaustWindowDrain || 0));
        engine.monsterExhaustionHistory = Array.isArray(engine.monsterExhaustionHistory)
            ? engine.monsterExhaustionHistory
            : [];
        engine.monsterStaminaEnabled = supplied.enabled !== false
            && authored.enabled !== false
            && engine.monsterTier !== 'small';
        return profile;
    }

    isExhausted(engine) {
        return Number(engine?.monsterExhaustionTicks || 0) > 0;
    }

    tick(engine) {
        if (!engine?.monsterStaminaEnabled) return;
        if (Number(engine.monsterExhaustProtectionTicks || 0) > 0) {
            engine.monsterExhaustProtectionTicks--;
        }
        if (!this.isExhausted(engine)) return;

        engine.monsterStamina = 0;
        engine.monsterExhaustionTicks--;
        if (engine.monsterExhaustionTicks > 0) return;

        const profile = engine.monsterStaminaProfile || this.defaults;
        engine.monsterExhaustionTicks = 0;
        engine.monsterStamina = Number(engine.monsterStaminaMax || profile.max);
        engine.monsterExhaustProtectionTicks = Number(profile.postProtectionTicks || 0);
        engine.monsterExhaustWindowStartTick = Number(engine.battleTime || 0);
        engine.monsterExhaustWindowDrain = 0;
        engine.monsterState = 'normal';
        engine.monsterSpeed = engine.getMonsterSpeedForState?.('normal') ?? engine.monsterSpeed;
        engine.updateMonsterStateUI?.('일반 상태', engine.selectedMonster?.nameKO || '몬스터', {
            color: '#00ffaa', bg: 'rgba(0,255,170,0.08)'
        });
        engine.addLog?.(`📢 ${engine.selectedMonster?.nameKO || '몬스터'}이(가) 숨을 고르고 다시 움직입니다.`, '#eee');
    }

    consumeMonsterAction(engine, actionCost) {
        if (!engine?.monsterStaminaEnabled || this.isExhausted(engine)) return { drained: 0, exhausted: false };
        const rate = Number(engine.monsterStaminaProfile?.naturalDrainPerAtb || 0);
        return this.applyDrain(engine, Math.max(0, Number(actionCost || 0)) * rate, 'action');
    }

    consumeHunterExhaust(engine, rawAmount, context = {}) {
        if (!engine?.monsterStaminaEnabled || this.isExhausted(engine)) return { drained: 0, exhausted: false };
        if (Number(engine.monsterExhaustProtectionTicks || 0) > 0) return { drained: 0, exhausted: false };

        const profile = engine.monsterStaminaProfile || this.defaults;
        const now = Number(engine.battleTime || 0);
        if (now - Number(engine.monsterExhaustWindowStartTick || 0) >= Number(profile.teamWindowTicks || 1)) {
            engine.monsterExhaustWindowStartTick = now;
            engine.monsterExhaustWindowDrain = 0;
        }
        const stages = profile.resistanceMultipliers || this.defaults.resistanceMultipliers;
        const resistance = Number(stages[Math.min(
            Number(engine.monsterExhaustionCount || 0),
            stages.length - 1
        )] ?? stages[stages.length - 1] ?? 1);
        const perkMultiplier = context.staminaThief ? 1.25 : 1;
        const requested = Math.max(0, Number(rawAmount || 0))
            * Number(profile.hunterDrainMultiplier || 0)
            * resistance
            * perkMultiplier;
        const cap = Number(engine.monsterStaminaMax || profile.max) * Number(profile.teamWindowCapRate || 0);
        const available = Math.max(0, cap - Number(engine.monsterExhaustWindowDrain || 0));
        const accepted = Math.min(requested, available);
        engine.monsterExhaustWindowDrain = HuntMonsterStaminaRuntime.precise(
            Number(engine.monsterExhaustWindowDrain || 0) + accepted
        );
        return this.applyDrain(engine, accepted, 'hunter');
    }

    applyDrain(engine, amount, source) {
        const drained = Math.min(
            Math.max(0, Number(engine.monsterStamina || 0)),
            Math.max(0, Number(amount || 0))
        );
        engine.monsterStamina = HuntMonsterStaminaRuntime.precise(
            Math.max(0, Number(engine.monsterStamina || 0) - drained)
        );
        if (engine.monsterStamina > 0) return { drained, exhausted: false };
        return { drained, exhausted: this.enterExhaustion(engine, source) };
    }

    enterExhaustion(engine, source = 'action') {
        if (!engine?.monsterStaminaEnabled || this.isExhausted(engine) || Number(engine.monsterHp || 0) <= 0) return false;
        const profile = engine.monsterStaminaProfile || this.defaults;
        const pendingImpact = engine.pendingMonsterImpact || null;
        const ActionPolicy = typeof HuntMonsterActionPolicy !== 'undefined'
            ? HuntMonsterActionPolicy
            : (typeof require === 'function' ? require('./HuntMonsterActionPolicy.js') : null);
        const detachedImpact = Boolean(
            pendingImpact
            && ActionPolicy?.impactSurvivesInterruption?.(pendingImpact.pattern)
        );
        engine.interruptMonsterMovement?.(`stamina-exhausted:${source}`);
        if (detachedImpact) engine.pendingMonsterImpact = pendingImpact;
        engine.pendingMonsterAction = null;
        engine.monsterExhaustionCount = Number(engine.monsterExhaustionCount || 0) + 1;
        engine.monsterExhaustionHistory.push({
            tick: Number(engine.battleTime || 0),
            source,
            count: engine.monsterExhaustionCount
        });
        engine.monsterExhaustionTicks = Number(profile.exhaustDurationTicks || 1);
        engine.monsterStamina = 0;
        engine.monsterState = 'exhausted';
        engine.monsterSpeed = engine.getMonsterSpeedForState?.('exhausted') ?? engine.monsterSpeed;
        engine.monsterActionLockTicks = Math.max(
            Number(engine.monsterActionLockTicks || 0),
            Number(profile.pantTicks || 0)
        );
        const atb = HuntMonsterStaminaRuntime.atbConfig();
        engine.monsterAtb = atb.GAUGE_MAX;
        engine.updateMonsterAtbUI?.(engine.monsterAtb);
        engine.updateMonsterStateUI?.('탈진 상태', `🤤 ${engine.selectedMonster?.nameKO || '몬스터'}`, {
            color: '#00a8ff', bg: 'rgba(0,168,255,0.1)'
        });
        engine.addLog?.(`🤤 [탈진] ${engine.selectedMonster?.nameKO || '몬스터'}의 스태미나가 고갈됐습니다!`, '#00a8ff');
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterStaminaRuntime;
else globalThis.HuntMonsterStaminaRuntime = HuntMonsterStaminaRuntime;
