class HuntBalanceTelemetry {
    constructor() {
        this.reset();
    }

    reset() {
        this.hunterActions = {};
        this.monsterPatterns = {};
        this.totalHunterDamage = 0;
        this.totalMonsterDamage = 0;
        this.guards = 0;
        this.dodges = 0;
        this.hits = 0;
        this.carts = 0;
        this.result = null;
    }

    recordHunterAction(weaponId, action, damage) {
        const key = `${weaponId}:${action.id || action.name}`;
        const current = this.hunterActions[key] || { weaponId, actionId: action.id, name: action.name, uses: 0, damage: 0 };
        current.uses++;
        current.damage += Number(damage || 0);
        this.totalHunterDamage += Number(damage || 0);
        this.hunterActions[key] = current;
    }

    recordMonsterPattern(monsterId, pattern, outcome, damage) {
        const key = `${monsterId}:${pattern.id || pattern.name}`;
        const current = this.monsterPatterns[key] || { monsterId, patternId: pattern.id, name: pattern.name, uses: 0, damage: 0, hits: 0, guards: 0, dodges: 0 };
        current.uses++;
        current.damage += Number(damage || 0);
        if (outcome === 'guard') { current.guards++; this.guards++; }
        else if (outcome === 'dodge') { current.dodges++; this.dodges++; }
        else { current.hits++; this.hits++; }
        this.totalMonsterDamage += Number(damage || 0);
        this.monsterPatterns[key] = current;
    }

    recordCart() {
        this.carts++;
    }

    finish(victory, ticks) {
        this.result = { victory: Boolean(victory), ticks: Number(ticks || 0) };
    }

    summary() {
        return {
            ...this.result,
            totalHunterDamage: this.totalHunterDamage,
            totalMonsterDamage: this.totalMonsterDamage,
            guards: this.guards,
            dodges: this.dodges,
            hits: this.hits,
            carts: this.carts,
            hunterActions: Object.values(this.hunterActions),
            monsterPatterns: Object.values(this.monsterPatterns)
        };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntBalanceTelemetry;
else window.HuntBalanceTelemetry = HuntBalanceTelemetry;
