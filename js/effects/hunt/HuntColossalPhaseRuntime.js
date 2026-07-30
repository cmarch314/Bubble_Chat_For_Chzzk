class HuntColossalPhaseRuntime {
    constructor() {
        this.thresholds = Object.freeze([.66, .33]);
        this.phase = 1;
    }

    update(engine) {
        if (!engine || engine.monsterTier !== 'colossal' || engine.monsterMaxHp <= 0) return false;
        const ratio = Math.max(0, engine.monsterHp / engine.monsterMaxHp);
        const nextThreshold = this.thresholds[this.phase - 1];
        if (nextThreshold === undefined || ratio > nextThreshold) return false;
        this.phase++;
        if (engine.interruptMonsterMovement) engine.interruptMonsterMovement('colossal-phase');
        else {
            engine.pendingMonsterAction = null;
            engine.pendingMonsterImpact = null;
        }
        engine.monsterAtb = 0;
        engine.monsterKnockdownDuration = Math.max(Number(engine.monsterKnockdownDuration || 0), 24);
        engine.monsterState = 'enraged';
        engine.monsterUltimateUsedInRage = false;
        engine.monsterDamageMod *= 1.12;
        engine.monsterAtbSpeedMod *= 1.08;
        engine.addLog?.(`🌋 [초대형 결전] ${this.phase}페이즈 돌입`, '#ff6b35');
        engine.callbacks?.onColossalPhase?.(this.phase, ratio);
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntColossalPhaseRuntime;
else globalThis.HuntColossalPhaseRuntime = HuntColossalPhaseRuntime;
