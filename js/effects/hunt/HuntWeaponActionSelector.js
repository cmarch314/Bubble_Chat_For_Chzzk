class HuntWeaponActionSelector {
    constructor(random = Math.random) {
        this.random = random;
    }

    isEligible(hunter, action) {
        const req = action && action.requirements || {};
        if (req.minSpirit && (hunter.spiritLevel || 0) < req.minSpirit) return false;
        if (req.minPhials && (hunter.phials || 0) < req.minPhials) return false;
        if (req.minAmmo && (hunter.ammo || 0) < req.minAmmo) return false;
        if (req.minGauge && (hunter.weaponGauge || 0) < req.minGauge) return false;
        if (req.demonMode && !(hunter.demonModeDuration > 0)) return false;
        if (req.tripleExtract && !(hunter.extractDuration > 0)) return false;
        if (req.shieldCharged && !(hunter.shieldChargeDuration > 0)) return false;
        if (req.notOverheated && hunter.overheatDuration > 0) return false;
        return true;
    }

    select(hunter, actions, context = {}) {
        if (!actions || actions.length === 0) return { action: null, index: -1 };
        const eligible = actions
            .map((action, index) => ({ action, index }))
            .filter(entry => this.isEligible(hunter, entry.action));
        if (!eligible.length) return { action: actions[0], index: 0 };

        if (context.monsterDowned) {
            return eligible.reduce((best, entry) =>
                Number(entry.action.motionValue || entry.action.dmg || 0) > Number(best.action.motionValue || best.action.dmg || 0)
                    ? entry : best
            );
        }

        const requested = eligible.find(entry => entry.index === (hunter.comboIndex || 0));
        if (requested) return requested;

        const lastActionId = hunter.lastActionId;
        const linked = eligible.filter(entry => Array.isArray(entry.action.from) && entry.action.from.includes(lastActionId));
        if (linked.length) return linked[Math.floor(this.random() * linked.length)];
        return eligible[0];
    }

    nextIndex(hunter, actions, currentAction) {
        if (!actions || !actions.length) return 0;
        const requestedNext = Array.isArray(currentAction && currentAction.next) ? currentAction.next : [];
        const linked = requestedNext
            .map(id => actions.findIndex(action => action.id === id))
            .filter(index => index >= 0 && this.isEligible(hunter, actions[index]));
        if (linked.length) return linked[Math.floor(this.random() * linked.length)];

        for (let offset = 1; offset <= actions.length; offset++) {
            const index = ((hunter.comboIndex || 0) + offset) % actions.length;
            if (this.isEligible(hunter, actions[index])) return index;
        }
        return 0;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntWeaponActionSelector;
} else {
    window.HuntWeaponActionSelector = HuntWeaponActionSelector;
}
