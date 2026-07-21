class HuntLobbyRoster {
    constructor(random = Math.random) {
        this.random = random;
        this.entries = new Map();
    }

    static normalizeNickname(value) {
        return String(value || '')
            .normalize('NFKC')
            .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
            .trim()
            .toLowerCase();
    }

    static isStreamerParticipant(msgData, nickname) {
        if (msgData?.isStreamer) return true;
        const globalScope = typeof window !== 'undefined' ? window : globalThis;
        const configured = Array.isArray(globalScope.HIVE_CMC_STREAMER_NICKNAMES)
            ? globalScope.HIVE_CMC_STREAMER_NICKNAMES
            : ['최마치'];
        const normalized = HuntLobbyRoster.normalizeNickname(nickname);
        return configured.some(alias => HuntLobbyRoster.normalizeNickname(alias) === normalized);
    }

    register(msgData = {}) {
        const nickname = String(msgData.nickname || '').trim();
        if (!nickname || this.entries.has(nickname)) return { added: false, count: this.entries.size };
        this.entries.set(nickname, {
            nickname,
            color: msgData.color || '#ffffff',
            uid: msgData.uid || msgData.userIdHash || null,
            isStreamer: HuntLobbyRoster.isStreamerParticipant(msgData, nickname),
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
            selected.push({
                nickname: `길드 헌터 ${number}`,
                color: '#c9b79c',
                uid: null,
                isStreamer: false,
                isNpc: true,
                joinedAt: Number.MAX_SAFE_INTEGER
            });
        }
        return selected;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntLobbyRoster;
else window.HuntLobbyRoster = HuntLobbyRoster;
