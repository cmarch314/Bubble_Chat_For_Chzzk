class HuntLobbyRoster {
    constructor(random = Math.random) {
        this.random = random;
        this.entries = new Map();
    }

    register(msgData = {}) {
        const nickname = String(msgData.nickname || '').trim();
        if (!nickname || this.entries.has(nickname)) return { added: false, count: this.entries.size };
        this.entries.set(nickname, {
            nickname,
            color: msgData.color || '#ffffff',
            isSubscriber: Boolean(msgData.isSubscriber || msgData.isSubscription),
            joinedAt: this.entries.size
        });
        return { added: true, count: this.entries.size, participant: this.entries.get(nickname) };
    }

    list() { return Array.from(this.entries.values()); }

    selectFour() {
        const pool = this.list();
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(this.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        const selected = pool.slice(0, 4);
        while (selected.length < 4) {
            const number = selected.length + 1;
            selected.push({ nickname: `길드 헌터 ${number}`, color: '#c9b79c', isNpc: true, joinedAt: Number.MAX_SAFE_INTEGER });
        }
        return selected;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntLobbyRoster;
else window.HuntLobbyRoster = HuntLobbyRoster;
