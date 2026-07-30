class HuntJourneyVoteRuntime {
    static VOTE_DURATION_SECONDS = 60;

    static eligibleVoterKeys(state = {}) {
        return (state.party || [])
            .filter(member => !member.isNpc)
            .map(member => String(member.uid || member.nickname || '').trim())
            .filter(Boolean);
    }

    static hasAllEligibleVotes(state = {}, runtime) {
        const keys = this.eligibleVoterKeys(state);
        return keys.length === 0 || keys.every(key => runtime?.votes?.has(key));
    }

    static shouldOpenCombatVote(state = {}, node = {}) {
        if (node.isBoss || node.monsterId || !Array.isArray(node.monsterChoices) || node.monsterChoices.length <= 1) return false;
        const isInitialRecruitment = Number(state.nodeIndex || 0) === 0 && (!Array.isArray(state.party) || state.party.length === 0);
        return !isInitialRecruitment;
    }

    constructor(seed = 0) {
        this.seed = Number(seed) >>> 0;
        this.votes = new Map();
    }

    static parse(message) {
        const match = String(message || '').trim().match(/^!([1-3])$/);
        return match ? Number(match[1]) - 1 : null;
    }

    cast(voterKey, choiceIndex, choiceCount) {
        const key = String(voterKey || '').trim();
        if (!key || !Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= choiceCount) return false;
        this.votes.set(key, choiceIndex);
        return true;
    }

    tally(choiceCount) {
        const counts = Array.from({ length: choiceCount }, () => 0);
        for (const choice of this.votes.values()) if (choice < choiceCount) counts[choice]++;
        return counts;
    }

    resolve(choiceCount, salt = 0, defaultIndex = undefined) {
        const counts = this.tally(choiceCount);
        if (this.votes.size === 0 && defaultIndex === null) {
            return { index: null, counts, tied: false, usedDefault: true };
        }
        if (this.votes.size === 0 && Number.isInteger(defaultIndex)
            && defaultIndex >= 0 && defaultIndex < choiceCount) {
            return { index: defaultIndex, counts, tied: false, usedDefault: true };
        }
        const best = Math.max(...counts);
        const tied = counts.map((count, index) => count === best ? index : -1).filter(index => index >= 0);
        const random = HuntJourneyCatalog.random((this.seed ^ Number(salt)) >>> 0);
        return { index: tied[Math.floor(random() * tied.length)], counts, tied: tied.length > 1 };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntJourneyVoteRuntime;
else globalThis.HuntJourneyVoteRuntime = HuntJourneyVoteRuntime;
