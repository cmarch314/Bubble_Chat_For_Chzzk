class HuntRunPartyAdapter {
    static restore(hunter, member, initializer) {
        if (!hunter || !member || !initializer) return hunter;
        if (member.weaponId) initializer.replaceHunterWeapon?.(hunter, member.weaponId);
        if (member.personality) {
            hunter.personality = member.personality;
            initializer.syncLoadoutItems?.(hunter);
        }
        initializer.applyPersistentProfile(hunter, {
            perkIds: member.perkIds,
            lockedPerkId: member.lockedPerkIds?.[0] || null
        });
        if (member.weaponProgressionKey && typeof WILDS_WEAPON_PROGRESSION !== 'undefined') {
            const progressionWeapon = WILDS_WEAPON_PROGRESSION.find(item =>
                item.key === member.weaponProgressionKey && item.kind === member.weaponId);
            if (progressionWeapon) initializer.weaponInstanceCatalog?.apply(hunter, progressionWeapon);
        }
        hunter.maxHp = Math.max(1, Number(member.maxHp || 100));
        hunter.hp = Math.max(0, Math.min(hunter.maxHp, Number(member.hp ?? hunter.maxHp)));
        hunter.journeyRerolls = Math.max(0, Math.floor(Number(member.rerolls || 0)));
        hunter.weaponTier = Math.max(1, Math.floor(Number(member.weaponTier || hunter.weaponInstance?.rarity || 1)));
        hunter.weaponProgressionKey = member.weaponProgressionKey || null;
        // Whetstone, ammo, and weapon-only gauges are maintenance state, not run
        // inventory. Every node begins serviced while consumable stock stays persisted.
        if (hunter.sharpnessProfile) hunter.sharpness = Number(hunter.maxSharpness || 0);
        if (hunter.type === 'ranged') hunter.ammo = Math.max(5, Number(hunter.ammo || 0));
        return hunter;
    }

    static snapshot(hunters = []) {
        return hunters.map(hunter => ({
            uid: hunter.participantUid || null,
            nickname: hunter.hunterName,
            color: hunter.hunterColor,
            isStreamer: Boolean(hunter.isStreamer),
            isNpc: Boolean(hunter.isNpc),
            hp: Math.max(0, Number(hunter.hp || 0)),
            maxHp: Math.max(1, Number(hunter.maxHp || 100)),
            weaponId: hunter.id,
            weaponInstanceId: hunter.weaponInstance?.id ?? null,
            weaponProgressionKey: hunter.weaponProgressionKey || null,
            weaponTier: Math.max(1, Math.floor(Number(hunter.weaponTier || hunter.weaponInstance?.rarity || 1))),
            personality: hunter.personality,
            perkIds: (hunter.perks || []).map(perk => perk.id),
            lockedPerkIds: hunter.lockedPerkId ? [hunter.lockedPerkId] : [],
            rerolls: Math.max(0, Math.floor(Number(hunter.journeyRerolls || 0)))
        }));
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntRunPartyAdapter;
else globalThis.HuntRunPartyAdapter = HuntRunPartyAdapter;
