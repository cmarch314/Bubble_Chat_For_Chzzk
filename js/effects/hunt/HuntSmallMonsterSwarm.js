class HuntSmallMonsterSwarm {
    constructor(count, totalHp) {
        this.count = Math.max(3, Math.min(5, Math.floor(Number(count) || 3)));
        this.maxHp = Math.max(this.count, Math.floor(Number(totalHp) || this.count));
        const base = Math.floor(this.maxHp / this.count);
        let remainder = this.maxHp - base * this.count;
        this.units = Array.from({ length: this.count }, (_, index) => {
            const maxHp = base + (remainder-- > 0 ? 1 : 0);
            return { index, hp: maxHp, maxHp, alive: true, atb: 0 };
        });
        this.targetIndex = 0;
        this.attackerCursor = -1;
        this.activeAttackerIndex = -1;
    }
    aliveUnits() { return this.units.filter(unit => unit.alive); }
    totalHp() { return this.units.reduce((sum, unit) => sum + unit.hp, 0); }
    currentTarget() {
        const current = this.units[this.targetIndex];
        if (current?.alive) return current;
        const next = this.aliveUnits()[0] || null;
        if (next) this.targetIndex = next.index;
        return next;
    }
    randomTarget(random = Math.random) {
        const alive = this.aliveUnits();
        if (!alive.length) return null;
        const roll = Math.max(0, Math.min(0.999999, Number(random()) || 0));
        const target = alive[Math.floor(roll * alive.length)];
        this.targetIndex = target.index;
        return target;
    }
    advanceAtb(amount) {
        const rate = Math.max(0, Number(amount) || 0);
        this.aliveUnits().forEach(unit => {
            // A small deterministic cadence offset keeps a pack from reaching
            // 100% on the same frame while preserving the authored base speed.
            const cadence = 0.9 + (unit.index % 3) * 0.1;
            unit.atb = Math.min(100, unit.atb + rate * cadence);
        });
        return this.maxAtb();
    }
    maxAtb() {
        return this.aliveUnits().reduce((highest, unit) => Math.max(highest, Number(unit.atb || 0)), 0);
    }
    reconcileTotal(nextTotal) {
        let damage = Math.max(0, this.totalHp() - Math.max(0, Number(nextTotal) || 0));
        const defeated = [];
        while (damage > 0) {
            const target = this.currentTarget();
            if (!target) break;
            const dealt = Math.min(target.hp, damage);
            target.hp -= dealt;
            damage -= dealt;
            if (target.hp <= 0) {
                target.alive = false;
                target.atb = 0;
                defeated.push(target.index);
                const next = this.units.find(unit => unit.alive && unit.index > target.index) || this.aliveUnits()[0];
                if (next) this.targetIndex = next.index;
            }
        }
        return { defeated, targetIndex: this.currentTarget()?.index ?? -1, remaining: this.totalHp() };
    }
    nextAttacker() {
        const alive = this.aliveUnits();
        if (!alive.length) return null;
        const ready = alive.filter(unit => Number(unit.atb || 0) >= 100);
        const later = alive.find(unit => unit.index > this.attackerCursor);
        const attacker = ready.sort((a, b) => b.atb - a.atb || a.index - b.index)[0] || later || alive[0];
        this.attackerCursor = attacker.index;
        this.activeAttackerIndex = attacker.index;
        attacker.atb = 0;
        return attacker;
    }
    reserveReadyAttacker() {
        const ready = this.aliveUnits()
            .filter(unit => Number(unit.atb || 0) >= 100)
            .sort((a, b) => {
                const aOrder = (a.index - this.attackerCursor - 1 + this.count) % this.count;
                const bOrder = (b.index - this.attackerCursor - 1 + this.count) % this.count;
                return aOrder - bOrder || a.index - b.index;
            });
        const attacker = ready[0] || null;
        if (!attacker) return null;
        this.attackerCursor = attacker.index;
        this.activeAttackerIndex = attacker.index;
        attacker.atb = 0;
        return attacker;
    }
    snapshot() {
        return { units: this.units.map(unit => ({ ...unit })), targetIndex: this.targetIndex, activeAttackerIndex: this.activeAttackerIndex };
    }
}
if (typeof module !== 'undefined' && module.exports) module.exports = HuntSmallMonsterSwarm;
else window.HuntSmallMonsterSwarm = HuntSmallMonsterSwarm;
