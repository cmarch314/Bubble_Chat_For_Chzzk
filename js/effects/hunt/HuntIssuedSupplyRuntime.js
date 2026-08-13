'use strict';

class HuntIssuedSupplyRuntime {
    static KEYS = Object.freeze(['potions', 'lifepowders', 'shockTraps', 'flashPods', 'bombs']);

    static profiles() {
        if (typeof HuntPersonalityProfiles !== 'undefined') return HuntPersonalityProfiles;
        if (typeof require === 'function') return require('./HuntPersonalityProfiles.js');
        throw new Error('HuntPersonalityProfiles must load before issued supplies');
    }

    static packFor(hunter) { return this.profiles().issuedPack(hunter); }

    static grant(hunter, grantId = 'loadout', { force = false } = {}) {
        if (!hunter) return null;
        if (!force && hunter.issuedSupplyGrantId === grantId) return hunter.issuedSupply;
        const pack = this.packFor(hunter);
        for (const key of this.KEYS) hunter[key] = Number(pack[key] || 0);
        hunter.issuedSupply = { ...pack };
        hunter.issuedSupplyGrantId = grantId;
        return pack;
    }

    static resupplyFromCamp(hunter, campSupply) {
        if (!hunter || !campSupply) return {};
        const desired = this.packFor(hunter);
        const transferred = {};
        for (const key of this.KEYS) {
            if (!Object.prototype.hasOwnProperty.call(campSupply, key)) continue;
            const missing = Math.max(0, Number(desired[key] || 0) - Number(hunter[key] || 0));
            const amount = Math.min(missing, Math.max(0, Number(campSupply[key] || 0)));
            hunter[key] = Number(hunter[key] || 0) + amount;
            campSupply[key] = Number(campSupply[key] || 0) - amount;
            transferred[key] = amount;
        }
        return transferred;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntIssuedSupplyRuntime;
else globalThis.HuntIssuedSupplyRuntime = HuntIssuedSupplyRuntime;
