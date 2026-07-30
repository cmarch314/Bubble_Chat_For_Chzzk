class HuntJourneyRewardCatalog {
    static RULES = Object.freeze([
        ['elder', /(?:dahaad|gore|shia|nakarkos|fatalis|alatreon|kushala|teostra|chameleos|valstrax|nergigante|velkhana)/],
        ['flying', /(?:rath|rey_dau|arkveld|seregios|hirabami|legiana|paolumu|bazel|diablos|nargacuga|tigrex)/],
        ['aquatic', /(?:balahara|uth_duna|lagiacrus|mizutsune|jyuratodus|plesioth|gajau)/],
        ['temnoceran', /(?:lala_barina|nerscylla|rakna)/],
        ['cephalopod', /(?:xu_wu|nu_udra|nakarkos)/],
        ['brute', /(?:rompopolo|ajarakan|gravios|barroth|brachydios|uragaan|deviljho|radobaan|banbaro|duramboros)/],
        ['fanged', /(?:doshaguma|blangonga|chatacabra|congalala|zinogre|odogaron|tobi|rajang|lagombi|arzuros)/],
        ['bird', /(?:kut-ku|kutku|quematrice|gypceros|kulu|pukei|tzitzi|malfestio)/],
        ['small', /(?:vespoid|hornetaur|jagras|shamos|wulg|popo|kelbi|aptonoth|apceros|felyne|gajalaka|boaboa)/]
    ]);

    static sealFor(monsterId, tier = '') {
        const id = String(monsterId || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
        const exact = this.RULES.find(([, pattern]) => pattern.test(id));
        if (exact) return { seal: exact[0], evidence: 'monster-id-to-installed-weapon-series' };
        const fallback = { small: 'small', medium: 'fanged', normal: 'flying', large: 'flying', elder: 'elder', colossal: 'elder' };
        return { seal: fallback[String(tier)] || 'bone', evidence: 'explicit-tier-archetype-fallback' };
    }

    static award(seals, monsterId, tier) {
        const reward = this.sealFor(monsterId, tier);
        return { ...reward, seals: [...new Set([...(Array.isArray(seals) ? seals : []), reward.seal])].slice(-9) };
    }

    static coinFor(tier, isBoss = false) {
        const base = { small: 1, medium: 1, normal: 2, large: 2, elder: 3, colossal: 3 }[String(tier)] || 1;
        return Math.min(3, base + (isBoss && base < 3 ? 1 : 0));
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyRewardCatalog;
else globalThis.HuntJourneyRewardCatalog = HuntJourneyRewardCatalog;
