class HuntLoadoutAdvisor {
    constructor(weapons = []) { this.weapons = weapons; }

    recommend(hunter, monster = null, party = []) {
        const personalityTags = {
            offensive: ['burst'], defensive: ['guard'], veteran: ['mobility', 'burst'],
            support: ['support', 'status'], newbie: ['guard', 'mobility'], normal: []
        };
        const weaponTags = {
            great_sword: ['sever', 'burst'], long_sword: ['sever', 'mobility'], sword_shield: ['support', 'status', 'mobility'],
            dual_blades: ['sever', 'status', 'mobility'], hammer: ['blunt', 'burst'], hunting_horn: ['blunt', 'support'],
            lance: ['guard'], gunlance: ['guard', 'explosive'], switch_axe: ['sever', 'burst'],
            charge_blade: ['guard', 'explosive', 'burst'], insect_glaive: ['sever', 'mobility'],
            light_bowgun: ['ranged', 'status', 'support'], heavy_bowgun: ['ranged', 'burst', 'guard'], bow: ['ranged', 'mobility', 'status']
        };
        const desired = new Set(personalityTags[hunter.personality] || []);
        (hunter.perks || []).forEach(perk => (perk.affinities || []).forEach(tag => desired.add(tag)));
        const partyCounts = party.reduce((counts, member) => {
            counts[member.id] = (counts[member.id] || 0) + 1;
            return counts;
        }, {});

        let best = this.weapons[0];
        let bestScore = -Infinity;
        this.weapons.forEach(weapon => {
            const tags = weaponTags[weapon.id] || [];
            let score = tags.reduce((sum, tag) => sum + (desired.has(tag) ? 3 : 0), 0);
            score -= (partyCounts[weapon.id] || 0) * 0.25;
            if (monster && /rathalos|legiana|paolumu|bazel/i.test(monster.id || '') && tags.includes('ranged')) score += 1;
            if (score > bestScore) { bestScore = score; best = weapon; }
        });
        return best;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntLoadoutAdvisor;
else window.HuntLoadoutAdvisor = HuntLoadoutAdvisor;
