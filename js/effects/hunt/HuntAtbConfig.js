class HuntAtbConfig {
    // Balance these values first. Action definitions remain on the original
    // five-second authoring scale so changing one gauge duration preserves the
    // relative cost of every weapon action.
    static get GAUGE_MAX() { return 100; }
    static get FULL_GAUGE_SECONDS() { return 10; }
    static get AUTHORING_GAUGE_SECONDS() { return 5; }
    static get TICKS_PER_SECOND() { return 10; }
    static get VISUAL_DURATION_SCALE() { return 1.25; }
    static get MIN_AUTHORED_ACTION_SECONDS() { return 0.5; }
    static get STANDARD_CHARGE_STAGE_SECONDS() { return 1; }
    static get STANDARD_CHARGE_STAGE_TICKS() {
        return Math.round(this.STANDARD_CHARGE_STAGE_SECONDS * this.TICKS_PER_SECOND);
    }
    static get STANDARD_CHARGE_VISUAL_MS() {
        return Math.round(this.STANDARD_CHARGE_STAGE_SECONDS * 1000 / this.VISUAL_DURATION_SCALE);
    }
    static get STANDARD_CHARGE_AUTHORED_COST_SECONDS() {
        return this.STANDARD_CHARGE_STAGE_SECONDS / this.CADENCE_SCALE;
    }
    static get GREAT_SWORD_CHARGE_STAGE_SECONDS() { return this.STANDARD_CHARGE_STAGE_SECONDS; }
    static get GREAT_SWORD_CHARGE_STAGE_TICKS() { return this.STANDARD_CHARGE_STAGE_TICKS; }
    static get GREAT_SWORD_CHARGE_VISUAL_MS() { return this.STANDARD_CHARGE_VISUAL_MS; }
    static get DEMON_MODE_ACTION_THRESHOLD() { return 35; }
    static get CADENCE_SCALE() { return this.FULL_GAUGE_SECONDS / this.AUTHORING_GAUGE_SECONDS; }
    static get MONSTER_ACTION_COST_RATIOS() {
        return Object.freeze({
            light: 0.25,
            normal: 0.45,
            strong: 0.70,
            ultimate: 1,
            burrowEnter: 0.45,
            burrowEmerge: 0.75,
            roar: 0.50
        });
    }
    static get MONSTER_POST_ACTION_RECOVERY_SECONDS() {
        return Object.freeze({
            light: 1,
            normal: 1.5,
            strong: 2,
            ultimate: 3,
            burrowEnter: 1,
            burrowEmerge: 2,
            roar: 1
        });
    }
    static get MIN_MONSTER_POST_ACTION_RECOVERY_SECONDS() { return 1; }
    static get MAX_MONSTER_POST_ACTION_RECOVERY_SECONDS() { return 3; }
    static get MAX_MONSTER_ACTION_DEBT_GAUGES() { return 3; }
    static get MONSTER_ENCOUNTER_START_ATB_RATIO() { return 0.75; }
    static get MONSTER_STAMINA_MAX() { return 100; }
    static get MONSTER_STAMINA_DRAIN_PER_ATB() { return 0.02; }
    static get MONSTER_EXHAUST_DURATION_TICKS() { return 600; }
    static get MONSTER_EXHAUST_PANT_TICKS() { return 50; }
    static get MONSTER_EXHAUST_TEAM_WINDOW_TICKS() { return 100; }
    static get MONSTER_EXHAUST_TEAM_WINDOW_CAP_RATE() { return 0.06; }
    static get MONSTER_HUNTER_EXHAUST_MULTIPLIER() { return 0.68; }
    static get MONSTER_EXHAUST_POST_PROTECTION_TICKS() { return 200; }
    static get MONSTER_EXHAUST_RESISTANCE_MULTIPLIERS() {
        return Object.freeze([1, 0.7, 0.5, 0.35]);
    }
    static get MONSTER_PART_BREAK_ATB_RETAIN_RATE() { return 0.5; }
    static get MONSTER_TRAP_BASE_ATB_REDUCTION_RATIO() { return 0.5; }
    static get MONSTER_CONTROL_ATB_RETAIN_RATIOS() {
        return Object.freeze({
            flinch: 0.5,
            partBreak: 0.5,
            trap: 0.5,
            knockdown: 1,
            stun: 1,
            paralysis: 1,
            sleep: 1,
            flash: 0,
            stumble: 0.5
        });
    }
    static get INTERFERENCE_COST_RATIOS() {
        return Object.freeze({ small: 0.50, large: 1 });
    }

    static get FILL_PER_TICK() {
        return this.GAUGE_MAX / (this.FULL_GAUGE_SECONDS * this.TICKS_PER_SECOND);
    }

    static get GAUGE_PER_SECOND() {
        return this.GAUGE_MAX / this.FULL_GAUGE_SECONDS;
    }

    static monsterEncounterStartAtb() {
        return this.GAUGE_MAX * this.MONSTER_ENCOUNTER_START_ATB_RATIO;
    }

    static scaleAuthoredSeconds(seconds) {
        return Number(seconds || 0) * this.CADENCE_SCALE;
    }

    static scaleVisualDurationMs(durationMs) {
        return Math.max(1, Math.round(Number(durationMs || 0) * this.VISUAL_DURATION_SCALE));
    }

    static actionCostSeconds(action = {}) {
        const authoredSeconds = Number.isFinite(Number(action.atbCostSeconds))
            ? Number(action.atbCostSeconds)
            : Math.max(
                this.MIN_AUTHORED_ACTION_SECONDS,
                Number(action.atbOccupancyTicks || action.durationTicks || this.TICKS_PER_SECOND) / this.TICKS_PER_SECOND
            );
        return Math.max(0, Math.min(this.FULL_GAUGE_SECONDS, this.scaleAuthoredSeconds(authoredSeconds)));
    }

    static actionCostGauge(action = {}) {
        // Keep the UI/state deterministic when decimal timing ratios would
        // otherwise leave values such as 63.99999999999999 in the gauge.
        return Math.round(this.actionCostSeconds(action) * this.GAUGE_PER_SECOND * 1000000) / 1000000;
    }

    static normalizedActionCost(action = {}) {
        return this.actionCostSeconds(action) / this.FULL_GAUGE_SECONDS;
    }

    static monsterActionClass(pattern = {}) {
        const tags = new Set(pattern.tags || []);
        const ratios = this.MONSTER_ACTION_COST_RATIOS;
        return tags.has('burrow-enter') ? 'burrowEnter'
            : tags.has('burrow-emerge') ? 'burrowEmerge'
            : pattern.type === 'ultimate' || tags.has('ultimate') ? 'ultimate'
            : pattern.type === 'roar' || tags.has('roar') ? 'roar'
            : tags.has('strong') || tags.has('multi-hit') || Number(pattern.damageRatio || 0) >= 0.38 ? 'strong'
            : tags.has('weak') ? 'light'
            : Number(pattern.damageRatio || 0) <= 0.26 ? 'light'
            : 'normal';
    }

    static monsterPostActionRecoverySeconds(pattern = {}) {
        const explicit = Number(pattern.postActionRecoverySeconds);
        const actionClass = this.monsterActionClass(pattern);
        const classRecovery = Number(
            this.MONSTER_POST_ACTION_RECOVERY_SECONDS[actionClass]
            ?? this.MONSTER_POST_ACTION_RECOVERY_SECONDS.normal
        );
        const authoredRecovery = Math.max(
            0,
            Number(pattern.recoveryTicks || 0) / this.TICKS_PER_SECOND
        );
        const seconds = Number.isFinite(explicit)
            ? explicit
            : Math.max(classRecovery, authoredRecovery);
        return Math.max(
            this.MIN_MONSTER_POST_ACTION_RECOVERY_SECONDS,
            Math.min(this.MAX_MONSTER_POST_ACTION_RECOVERY_SECONDS, seconds)
        );
    }

    static monsterActionCostGauge(pattern = {}, timing = {}) {
        const occupancyTicks = Math.max(0, Number(timing.occupancyTicks || 0));
        const recoveryPerTick = Math.max(0, Number(timing.recoveryPerTick || 0));
        if (occupancyTicks > 0 && recoveryPerTick > 0) {
            // Runtime cadence has one source of truth: visible occupancy plus
            // an authored/derived 1-3 second opening. Fixed legacy costs must
            // never make a short, visually finished attack wait off-screen.
            const recoverySeconds = this.monsterPostActionRecoverySeconds(pattern);
            const cost = (
                occupancyTicks
                + recoverySeconds * this.TICKS_PER_SECOND
            ) * recoveryPerTick;
            const maxDebt = this.GAUGE_MAX * this.MAX_MONSTER_ACTION_DEBT_GAUGES;
            return Math.round(Math.max(0, Math.min(maxDebt, cost)) * 1000000) / 1000000;
        }

        // Compatibility for data inspection and tooling that does not resolve
        // an animation timeline. Live monster turns always use the branch above.
        const authoredMultiplier = Number(pattern.monsterAtbCostMultiplier);
        const multiplier = Number.isFinite(authoredMultiplier) && authoredMultiplier > 0
            ? authoredMultiplier
            : 1;
        const explicit = Number(pattern.monsterAtbCost);
        const actionClass = this.monsterActionClass(pattern);
        const ratio = this.MONSTER_ACTION_COST_RATIOS[actionClass];
        let baseCost;
        if (Number.isFinite(explicit)) {
            baseCost = explicit <= 1 ? explicit * this.GAUGE_MAX : explicit;
        } else {
            baseCost = ratio * this.GAUGE_MAX;
        }
        const authoredCost = Math.max(0, baseCost * multiplier);

        const maxDebt = this.GAUGE_MAX * this.MAX_MONSTER_ACTION_DEBT_GAUGES;
        return Math.round(Math.max(0, Math.min(maxDebt, authoredCost)) * 1000000) / 1000000;
    }

    static monsterAtbAfterPartBreak(_currentAtb) {
        return this.monsterAtbAfterControl('partBreak');
    }

    static monsterAtbAfterControl(kind) {
        const ratio = this.MONSTER_CONTROL_ATB_RETAIN_RATIOS[kind];
        if (!Number.isFinite(ratio)) {
            throw new Error(`Unknown monster control ATB policy: ${kind}`);
        }
        return this.GAUGE_MAX * ratio;
    }

    static applyMonsterControlAtb(engine, kind) {
        const value = this.monsterAtbAfterControl(kind);
        engine.monsterAtb = value;
        engine.updateMonsterAtbUI?.(value);
        return value;
    }

    static monsterAtbAfterTrap(resistanceMultiplier = 1) {
        const multiplier = Math.max(0, Math.min(1, Number(resistanceMultiplier || 0)));
        const reductionRatio = this.MONSTER_TRAP_BASE_ATB_REDUCTION_RATIO * multiplier;
        return this.GAUGE_MAX * (1 - reductionRatio);
    }

    static applyMonsterTrapAtb(engine, resistanceMultiplier = 1) {
        const value = this.monsterAtbAfterTrap(resistanceMultiplier);
        engine.monsterAtb = value;
        engine.updateMonsterAtbUI?.(value);
        return value;
    }

    static interferenceCostGauge(size = 'small') {
        const ratio = this.INTERFERENCE_COST_RATIOS[size] ?? this.INTERFERENCE_COST_RATIOS.small;
        return ratio * this.GAUGE_MAX;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntAtbConfig;
else globalThis.HuntAtbConfig = HuntAtbConfig;
