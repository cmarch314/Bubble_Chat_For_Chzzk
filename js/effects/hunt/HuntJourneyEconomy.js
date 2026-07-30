class HuntJourneyEconomy {
    static MAX_ZENNY = 9;
    static PRICES = Object.freeze({ potion: 1, lifepowder: 2, shockTrap: 2, bomb: 1, reroll: 3 });

    static clampZenny(value) { return Math.max(0, Math.min(this.MAX_ZENNY, Math.floor(Number(value) || 0))); }
    static stock(result) {
        const Supply = typeof HuntSharedSupply !== 'undefined' ? HuntSharedSupply
            : (typeof require === 'function' ? require('./HuntSharedSupply') : null);
        result.supply = Supply ? Supply.normalize(result.supply) : {
            potions: Math.max(0, Math.min(10, Number(result.supply?.potions ?? 10))),
            lifepowders: Math.max(0, Math.min(9, Number(result.supply?.lifepowders ?? 1))),
            shockTraps: Math.max(0, Math.min(9, Number(result.supply?.shockTraps || 0))),
            bombs: Math.max(0, Math.min(9, Number(result.supply?.bombs ?? 1)))
        };
        return result.supply;
    }

    static earn(result, amount) {
        result.zenny = this.clampZenny(Number(result.zenny || 0) + Number(amount || 0));
        return result.zenny;
    }

    static spend(result, price) {
        const amount = Math.max(0, Math.floor(Number(price) || 0));
        if (Number(result.zenny || 0) < amount) return false;
        result.zenny = this.clampZenny(result.zenny - amount);
        return true;
    }

    static canBuy(result, item, quantity = 1, priceOverride = null) {
        const price = priceOverride == null ? Number(this.PRICES[item]) : Math.max(0, Math.floor(Number(priceOverride) || 0));
        if (!price || Number(result.zenny || 0) < price) return false;
        if (item === 'reroll') return Number(result.rerolls || 0) < 9;
        const fields = { potion: 'potions', lifepowder: 'lifepowders', shockTrap: 'shockTraps', bomb: 'bombs' };
        const field = fields[item];
        if (!field) return false;
        const stock = this.stock(result);
        const Supply = typeof HuntSharedSupply !== 'undefined' ? HuntSharedSupply
            : (typeof require === 'function' ? require('./HuntSharedSupply') : null);
        const cap = Supply?.CAPS?.[field] ?? (field === 'potions' ? 10 : 9);
        return Number(quantity || 0) > 0 && Number(stock[field] || 0) < cap;
    }

    static buy(result, indexes, item, quantity = 1, priceOverride = null) {
        if (!this.canBuy(result, item, quantity, priceOverride)) return false;
        const price = priceOverride == null ? Number(this.PRICES[item]) : Math.max(0, Math.floor(Number(priceOverride) || 0));
        if (!this.spend(result, price)) return false;
        const fields = { potion: 'potions', lifepowder: 'lifepowders', shockTrap: 'shockTraps', bomb: 'bombs' };
        if (item === 'reroll') result.rerolls = Math.min(9, Number(result.rerolls || 0) + quantity);
        else if (fields[item]) {
            const stock = this.stock(result);
            const Supply = typeof HuntSharedSupply !== 'undefined' ? HuntSharedSupply
                : (typeof require === 'function' ? require('./HuntSharedSupply') : null);
            const cap = Supply?.CAPS?.[fields[item]] ?? (fields[item] === 'potions' ? 10 : 9);
            stock[fields[item]] = Math.min(cap, Number(stock[fields[item]] || 0) + quantity);
        }
        return true;
    }

    static gather(result, indexes, deep = false) {
        this.earn(result, deep ? 2 : 1);
        const stock = this.stock(result);
        stock.potions = Math.min(10, Number(stock.potions || 0) + 1);
        if (deep) result.ambushHook = { chance: .35, source: 'deep-gather' };
        return result;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyEconomy;
else globalThis.HuntJourneyEconomy = HuntJourneyEconomy;
