'use strict';

class HuntPersonalityProfiles {
    static CAPS = Object.freeze({ hit: .99, critical: .95, evade: .95, guard: .95, special: .90 });

    static PROFILES = Object.freeze({
        offensive: Object.freeze({
            label: '공격형', stats: { hit: .90, critical: .70, evade: .75, guard: .75, special: .60 },
            issued: { potions: 10, lifepowders: 0, shockTraps: 0, flashPods: 1, bombs: 5 },
            startBuff: { kind: 'attack', multiplier: 1.20, ticks: 900 },
            ai: { aggression: .96, support: .10, conservation: .22, coordination: .48,
                risk: .86, gather: .12, variance: .10, flash: .55, trap: 0, powder: 0, bomb: .94 }
        }),
        normal: Object.freeze({
            label: '밸런스', stats: { hit: .85, critical: .55, evade: .75, guard: .75, special: .55 },
            issued: { potions: 10, lifepowders: 1, shockTraps: 1, flashPods: 1, bombs: 2 },
            ai: { aggression: .58, support: .52, conservation: .52, coordination: .66,
                risk: .52, gather: .35, variance: .12, flash: .50, trap: .48, powder: .48, bomb: .55 }
        }),
        defensive: Object.freeze({
            label: '수비형', stats: { hit: .85, critical: .45, evade: .85, guard: .85, special: .70 },
            issued: { potions: 10, lifepowders: 3, shockTraps: 0, flashPods: 0, bombs: 2 },
            startBuff: { kind: 'defense', multiplier: .80, ticks: 900 },
            ai: { aggression: .28, support: .68, conservation: .65, coordination: .78,
                risk: .18, gather: .30, variance: .06, flash: 0, trap: 0, powder: .72, bomb: .38 }
        }),
        support: Object.freeze({
            label: '지원형', stats: { hit: .80, critical: .40, evade: .75, guard: .75, special: .50 },
            issued: { potions: 10, lifepowders: 3, shockTraps: 2, flashPods: 2, bombs: 4 },
            ai: { aggression: .30, support: .98, conservation: .42, coordination: .96,
                risk: .28, gather: .88, variance: .06, flash: .90, trap: .92, powder: .96, bomb: .60 }
        }),
        veteran: Object.freeze({
            label: '배태랑', stats: { hit: .90, critical: .60, evade: .80, guard: .80, special: .60 },
            issued: { potions: 10, lifepowders: 2, shockTraps: 1, flashPods: 2, bombs: 2 },
            ai: { aggression: .65, support: .65, conservation: .92, coordination: 1,
                risk: .38, gather: .32, variance: .02, flash: 1, trap: .68, powder: .76, bomb: .72 }
        }),
        newbie: Object.freeze({
            label: '몬린이', stats: { hit: .80, critical: .40, evade: .70, guard: .70, special: .40 },
            issued: { potions: 10, lifepowders: 3, shockTraps: 2, flashPods: 2, bombs: 2 },
            ai: { aggression: .44, support: .42, conservation: .58, coordination: .24,
                risk: .62, gather: .92, variance: .38, flash: .15, trap: .18, powder: .20, bomb: .18 }
        })
    });

    static normalize(personality) {
        const value = String(personality || 'normal').toLowerCase();
        if (value === 'balanced' || value === 'balance') return 'normal';
        return this.PROFILES[value] ? value : 'normal';
    }

    static get(personality) { return this.PROFILES[this.normalize(personality)]; }

    static chance(hunter, stat, extra = 0) {
        const profile = this.get(hunter?.personality);
        const modifierKeys = {
            hit: 'hitChance', critical: 'critChance', evade: 'evadeChance',
            guard: 'guardChance', special: 'counterChance'
        };
        const base = Number(profile.stats?.[stat] || 0);
        const perk = Number(hunter?.perkModifiers?.[modifierKeys[stat]] || 0);
        return Math.max(0, Math.min(this.CAPS[stat] ?? .95, base + perk + Number(extra || 0)));
    }

    static longSwordForesightChance(hunter) {
        const values = { offensive: .80, normal: .75, defensive: .85, support: .75, veteran: .80, newbie: .50 };
        return Math.min(.95, (values[this.normalize(hunter?.personality)] ?? .75)
            + Number(hunter?.perkModifiers?.counterChance || 0));
    }

    static specialActionChance(hunter, authoredBase = .55) {
        const profileChance = this.chance(hunter, 'special');
        return Math.max(0, Math.min(this.CAPS.special, Number(authoredBase || 0) * (profileChance / .55)));
    }

    static issuedPack(hunter) {
        const base = this.get(hunter?.personality).issued;
        const modifiers = hunter?.perkModifiers || {};
        const bonusKeys = {
            potions: 'issuedPotions', lifepowders: 'issuedLifepowders', shockTraps: 'issuedTraps',
            flashPods: 'issuedFlashes', bombs: 'issuedBombs'
        };
        return Object.fromEntries(Object.entries(base).map(([key, value]) => [
            key, Math.max(0, Math.floor(Number(value) + Number(modifiers[bonusKeys[key]] || 0)))
        ]));
    }

    static outgoingDamageMultiplier(hunter, engine) {
        const buff = this.get(hunter?.personality).startBuff;
        return buff?.kind === 'attack' && Number(engine?.battleTime || 0) < buff.ticks
            ? buff.multiplier : 1;
    }

    static incomingDamageMultiplier(hunter, engine) {
        const buff = this.get(hunter?.personality).startBuff;
        return buff?.kind === 'defense' && Number(engine?.battleTime || 0) < buff.ticks
            ? buff.multiplier : 1;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntPersonalityProfiles;
else globalThis.HuntPersonalityProfiles = HuntPersonalityProfiles;
