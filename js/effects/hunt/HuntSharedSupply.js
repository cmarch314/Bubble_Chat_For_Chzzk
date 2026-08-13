class HuntSharedSupply {
    static KEYS = Object.freeze(['potions', 'lifepowders', 'shockTraps', 'flashPods', 'bombs']);
    static CAPS = Object.freeze({ potions: 40, lifepowders: 18, shockTraps: 12, flashPods: 12, bombs: 24 });
    static INITIAL = Object.freeze({ potions: 10, lifepowders: 1, shockTraps: 0, flashPods: 0, bombs: 1 });

    static normalize(value = {}) {
        return Object.fromEntries(this.KEYS.map(key => [
            key,
            Math.max(0, Math.min(this.CAPS[key], Math.floor(Number(value[key] ?? this.INITIAL[key]) || 0)))
        ]));
    }

    static fromLegacyParty(party = []) {
        if (!party.length) return this.normalize();
        return this.normalize(Object.fromEntries(this.KEYS.map(key => [
            key, (() => {
                const recorded = party
                    .map(member => member?.[key])
                    .filter(value => value !== undefined && Number.isFinite(Number(value)))
                    .map(Number);
                return recorded.length ? Math.max(...recorded) : this.INITIAL[key];
            })()
        ])));
    }

    static add(supply, key, amount = 1) {
        if (!this.KEYS.includes(key)) return false;
        supply[key] = Math.max(0, Math.min(this.CAPS[key], Number(supply[key] || 0) + Number(amount || 0)));
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntSharedSupply;
else globalThis.HuntSharedSupply = HuntSharedSupply;
