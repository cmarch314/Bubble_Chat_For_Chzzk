class AudioCommandMatcher {
    constructor(configManager, soundHive = {}) {
        this.configManager = configManager;
        this.soundHive = soundHive;
    }

    setSoundHive(soundHive) {
        this.soundHive = soundHive || {};
    }

    normalizeCatalog(config = {}) {
        const prependSfx = (src) => {
            if (!src || src.startsWith('SFX/') || src.startsWith('./SFX/')) return src;
            return `SFX/${src}`;
        };
        const processItem = (item) => {
            if (typeof item === 'string') return prependSfx(item);
            if (typeof item === 'object' && item !== null && item.src) {
                return { ...item, src: prependSfx(item.src) };
            }
            return item;
        };
        return Object.fromEntries(Object.entries(config).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.map(processItem) : processItem(value)
        ]));
    }

    normalizeKeyword(value) {
        return String(value || '').normalize('NFC').replace(/\s+/g, '');
    }

    getVisualKeys() {
        const visualKeys = new Set();
        const visualConfig = this.configManager?.getVisualConfig?.() || {};
        Object.entries(visualConfig).forEach(([key, value]) => {
            visualKeys.add(this.normalizeKeyword(key));
            if (value?.soundKey) visualKeys.add(this.normalizeKeyword(value.soundKey));
            if (value?.audioOverride) visualKeys.add(this.normalizeKeyword(value.audioOverride));
        });
        return visualKeys;
    }

    buildVisualAudioPaths(resolveAudioPath) {
        const paths = new Set();
        const visualConfig = this.configManager?.getVisualConfig?.() || {};
        const soundConfig = this.configManager?.getSoundConfig?.() || {};
        const addKey = (key) => {
            const mapped = soundConfig[key];
            if (!mapped) return;
            const items = Array.isArray(mapped) ? mapped : [mapped];
            items.forEach(item => {
                const src = (typeof item === 'object' ? item.src : item) || '';
                if (src) paths.add(resolveAudioPath(src));
            });
        };
        Object.values(visualConfig).forEach(effect => {
            if (effect?.preloadAudio !== true) return;
            if (effect?.soundKey) addKey(effect.soundKey);
            if (effect?.audioOverride) addKey(effect.audioOverride);
        });
        return paths;
    }

    match(message) {
        if (!message) return [];
        const normalizedMessage = this.normalizeKeyword(message);
        const lowerMessage = normalizedMessage.toLowerCase();
        const visualKeys = this.getVisualKeys();
        const allMatches = [];

        Object.keys(this.soundHive).forEach(keyword => {
            const originalKeyword = String(keyword).normalize('NFC');
            const normalizedKeyword = this.normalizeKeyword(originalKeyword);
            if (!normalizedKeyword || visualKeys.has(normalizedKeyword)) return;
            const lowerKeyword = normalizedKeyword.toLowerCase();
            let searchPosition = 0;
            let index;
            while ((index = lowerMessage.indexOf(lowerKeyword, searchPosition)) !== -1) {
                allMatches.push({
                    startIndex: index,
                    endIndex: index + normalizedKeyword.length,
                    length: normalizedKeyword.length,
                    sound: this.soundHive[keyword],
                    keyword: originalKeyword
                });
                searchPosition = index + 1;
            }
        });

        allMatches.sort((a, b) => a.startIndex === b.startIndex
            ? b.length - a.length
            : a.startIndex - b.startIndex);

        const sequence = [];
        const usedKeywords = new Set();
        let lastEnd = 0;
        for (const match of allMatches) {
            if (match.startIndex < lastEnd) continue;
            const firstChar = match.keyword[0];
            const repeatedSingleChar = match.keyword.length > 1
                && match.keyword.split('').every(char => char === firstChar);
            if (repeatedSingleChar && usedKeywords.has(match.keyword)) continue;
            sequence.push(match);
            lastEnd = match.endIndex;
            usedKeywords.add(match.keyword);
            if (repeatedSingleChar) {
                while (lastEnd < normalizedMessage.length && normalizedMessage[lastEnd] === firstChar) lastEnd++;
            }
        }
        return sequence;
    }
}
