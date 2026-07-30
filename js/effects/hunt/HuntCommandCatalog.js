class HuntCommandCatalog {
    static DEFINITIONS = Object.freeze([
        Object.freeze({
            mode: 'single',
            aliases: Object.freeze(['!수렵', '!토벌']),
            acceptsArguments: true,
            helpLabel: '!수렵 [몬스터] · !토벌'
        }),
        Object.freeze({
            mode: 'journey',
            aliases: Object.freeze(['!몬헌']),
            acceptsArguments: false,
            helpLabel: '!몬헌',
            lobbyTitle: '🧭 몬헌 여정 원정대 모집 🧭',
            lobbySubtitle: '여정형 수렵입니다. !참가 입력자 중 4명을 선발해 첫 노드부터 출발합니다.'
        })
    ]);

    static normalize(message) {
        return String(message || '').normalize('NFKC').trim().toLowerCase();
    }

    static matchStart(message) {
        const normalized = this.normalize(message);
        for (const definition of this.DEFINITIONS) {
            for (const alias of definition.aliases) {
                const spaced = normalized.startsWith(`${alias} `);
                const compactArgs = normalized.slice(alias.length);
                const legacyCompactCount = definition.acceptsArguments && /^(?:10|[1-9])(?:마리)?(?:\s|$)/.test(compactArgs);
                if (normalized !== alias && !spaced && !legacyCompactCount) continue;
                return Object.freeze({
                    definition,
                    mode: definition.mode,
                    alias,
                    args: compactArgs.trim()
                });
            }
        }
        return null;
    }

    static mode(modeId) {
        return this.DEFINITIONS.find(definition => definition.mode === modeId) || this.DEFINITIONS[0];
    }

    static isStop(message) {
        const normalized = this.normalize(message);
        if (normalized === '!중단') return true;
        return this.DEFINITIONS.some(definition => definition.aliases.some(alias =>
            normalized === `${alias} 중단` || normalized === `${alias}중단`
        ));
    }

    static helpLabel() {
        return this.DEFINITIONS.map(definition => definition.helpLabel).join(' / ');
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntCommandCatalog;
else globalThis.HuntCommandCatalog = HuntCommandCatalog;
