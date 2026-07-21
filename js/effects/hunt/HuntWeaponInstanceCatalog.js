class HuntWeaponInstanceCatalog {
    static COLORS = Object.freeze(['red', 'orange', 'yellow', 'green', 'blue', 'white', 'purple']);
    static COLOR_HEX = Object.freeze({ red: '#e53b35', orange: '#ef7d26', yellow: '#f4d942', green: '#62c84b', blue: '#3487e8', white: '#f2f3ef', purple: '#b759de' });
    static RAW_MULTIPLIER = Object.freeze({ red: .5, orange: .75, yellow: 1, green: 1.05, blue: 1.2, white: 1.32, purple: 1.39 });

    constructor(entries, random = Math.random) {
        this.entries = Array.isArray(entries) ? entries : [];
        this.random = random;
        this.byKind = new Map();
        this.entries.forEach(entry => {
            if (!this.byKind.has(entry.kind)) this.byKind.set(entry.kind, []);
            this.byKind.get(entry.kind).push(entry);
        });
    }

    pick(kind) {
        const pool = this.byKind.get(String(kind || '')) || [];
        return pool.length ? pool[Math.floor(this.random() * pool.length)] : null;
    }

    apply(hunter, instance = this.pick(hunter?.id)) {
        if (!hunter) return null;
        hunter.weaponInstance = instance ? { ...instance, sharpness: instance.sharpness ? { ...instance.sharpness } : null } : null;
        hunter.weaponDisplayName = instance?.nameKo || instance?.name || hunter.name;
        if (!instance?.sharpness) {
            hunter.sharpnessProfile = null;
            hunter.sharpness = hunter.maxSharpness = 0;
            return instance;
        }
        hunter.sharpnessProfile = { ...instance.sharpness };
        hunter.maxSharpness = HuntWeaponInstanceCatalog.total(instance.sharpness);
        hunter.sharpness = hunter.maxSharpness;
        return instance;
    }

    static total(profile) {
        return HuntWeaponInstanceCatalog.COLORS.reduce((sum, color) => sum + Math.max(0, Number(profile?.[color] || 0)), 0);
    }

    static colorAt(profile, current) {
        let remaining = Math.max(0, Number(current || 0));
        for (const color of HuntWeaponInstanceCatalog.COLORS) {
            const length = Math.max(0, Number(profile?.[color] || 0));
            if (remaining <= length && length > 0) return color;
            remaining -= length;
        }
        return HuntWeaponInstanceCatalog.COLORS.slice().reverse().find(color => Number(profile?.[color] || 0) > 0) || 'red';
    }

    static ratio(hunter) {
        return Number(hunter?.maxSharpness || 0) > 0 ? Math.max(0, Number(hunter.sharpness || 0)) / Number(hunter.maxSharpness) : 1;
    }

    static sharpenThreshold(hunter) {
        if (!hunter?.sharpnessProfile) return 0;
        // Yellow is the universal AI floor. Offensive and veteran hunters maintain
        // combat readiness more strictly and sharpen as soon as the edge enters green.
        const yellowFloor = ['red', 'orange', 'yellow']
            .reduce((sum, color) => sum + Math.max(0, Number(hunter.sharpnessProfile[color] || 0)), 0);
        const greenBand = Math.max(0, Number(hunter.sharpnessProfile.green || 0));
        const earlyGreenByPersonality = {
            offensive: 1,
            veteran: 1
        };
        const earlyGreen = greenBand * (earlyGreenByPersonality[hunter.personality] || 0);
        return Math.max(0, yellowFloor + earlyGreen);
    }

    static shouldSharpen(hunter, random = Math.random) {
        if (!hunter?.sharpnessProfile) return false;
        if (hunter.personality === 'newbie') return false;
        if (Number(hunter.sharpness || 0) <= this.sharpenThreshold(hunter)) return true;
        const color = this.colorAt(hunter.sharpnessProfile, hunter.sharpness);
        return hunter.personality === 'offensive' && color === 'blue' && random() < .6;
    }

    static colorHex(color) { return this.COLOR_HEX[color] || this.COLOR_HEX.red; }

    static rawMultiplier(hunter) {
        if (!hunter?.sharpnessProfile) return 1;
        return this.RAW_MULTIPLIER[this.colorAt(hunter.sharpnessProfile, hunter.sharpness)] || .5;
    }

    static minimumColorForHitzone(hitzone) {
        const value = Math.max(0, Number(hitzone || 0)) * 100;
        return this.COLORS.find(color => value * this.RAW_MULTIPLIER[color] >= 25) || null;
    }

    static bounceCheck(hunter, hitzone, action) {
        if (!hunter?.sharpnessProfile || !Number.isFinite(Number(hitzone))) return { bounced: false };
        const tags = new Set(action?.tags || []);
        const ignored = tags.has('shelling') || tags.has('explosive') || tags.has('hitzone-ignore');
        const mindEye = (hunter.perks || []).some(perk => (perk?.name || perk) === '심안');
        const color = this.colorAt(hunter.sharpnessProfile, hunter.sharpness);
        const score = Number(hitzone) * 100 * (this.RAW_MULTIPLIER[color] || .5);
        return { bounced: !ignored && !mindEye && score < 25, color, score, requiredColor: this.minimumColorForHitzone(hitzone) };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntWeaponInstanceCatalog;
else window.HuntWeaponInstanceCatalog = HuntWeaponInstanceCatalog;
