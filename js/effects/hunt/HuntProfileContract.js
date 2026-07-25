const HuntCompanionEndpoint = typeof LocalCompanionEndpoint !== 'undefined'
    ? LocalCompanionEndpoint
    : (typeof require === 'function' ? require('../../runtime/LocalCompanionEndpoint') : null);

class HuntProfileContract {
    static SCHEMA_VERSION = 1;
    static MAX_PERKS = 4;
    static ENDPOINT_PATH = '/api/hunt-profile';
    static REQUEST_TIMEOUT_MS = 500;
    static SAVE_DELAY_MS = 700;
    static PERSONALITIES = Object.freeze(['offensive', 'normal', 'defensive', 'veteran', 'support', 'newbie']);
    static WEAPON_ID = /^[a-z][a-z0-9_]{1,31}$/;
    static PERK_ID = /^perk_[a-z0-9_]{1,48}$/;

    static cleanText(value, maxLength) {
        return String(value || '').trim().slice(0, maxLength);
    }

    static normalize(profile = {}) {
        const weaponId = this.cleanText(profile.weaponId, 32);
        const personality = this.cleanText(profile.personality, 24);
        const normalizedPerkIds = [...new Set(Array.isArray(profile.perkIds) ? profile.perkIds : [])]
            .map(id => this.cleanText(id, 64))
            .filter(id => this.PERK_ID.test(id));
        const lockedPerkId = this.cleanText(profile.lockedPerkId, 64);
        let perkIds = normalizedPerkIds.slice(0, this.MAX_PERKS);
        if (normalizedPerkIds.includes(lockedPerkId) && !perkIds.includes(lockedPerkId)) {
            perkIds = [lockedPerkId, ...perkIds].slice(0, this.MAX_PERKS);
        }
        const instanceId = Number(profile.weaponInstanceId);
        return {
            weaponId: this.WEAPON_ID.test(weaponId) ? weaponId : null,
            weaponInstanceId: Number.isSafeInteger(instanceId) && instanceId >= 0 ? instanceId : null,
            personality: this.PERSONALITIES.includes(personality) ? personality : null,
            perkIds,
            lockedPerkId: perkIds.includes(lockedPerkId) ? lockedPerkId : null
        };
    }

    static snapshot(hunter) {
        return this.normalize({
            weaponId: hunter?.id,
            weaponInstanceId: hunter?.weaponInstance?.id,
            personality: hunter?.personality,
            perkIds: (hunter?.perks || []).map(perk => perk?.id),
            lockedPerkId: hunter?.lockedPerkId
        });
    }

    static endpoint(globalObject = typeof globalThis !== 'undefined' ? globalThis : {}) {
        return HuntCompanionEndpoint.url(this.ENDPOINT_PATH, {}, globalObject);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntProfileContract;
else globalThis.HuntProfileContract = HuntProfileContract;
