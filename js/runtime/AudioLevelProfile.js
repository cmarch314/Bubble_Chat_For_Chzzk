class AudioLevelProfile {
    constructor(entries = {}) {
        this.entries = entries || {};
        this.lowercaseEntries = new Map(
            Object.entries(this.entries).map(([key, value]) => [key.toLowerCase(), value])
        );
    }

    normalizePath(value) {
        if (!value) return '';
        let path = String(value).replace(/\\/g, '/').replace(/^(?:\.\/)+/, '');
        try {
            if (/^(?:file|https?):/i.test(path)) path = new URL(path).pathname;
        } catch (error) {}
        try { path = decodeURIComponent(path); } catch (error) {}
        path = path.split(/[?#]/, 1)[0];
        const rootMatch = path.match(/(?:^|\/)(SFX|BGM|MonsterHunter_Soundtracks|Video|AI CMC)\//i);
        if (rootMatch) path = path.slice(rootMatch.index + (rootMatch[0].startsWith('/') ? 1 : 0));
        return path.replace(/^\/+/, '');
    }

    get(path) {
        const normalized = this.normalizePath(path);
        return this.entries[normalized] || this.lowercaseEntries.get(normalized.toLowerCase()) || null;
    }

    gain(path) {
        const entry = this.get(path);
        const gainDb = Number(entry?.gainDb);
        if (!Number.isFinite(gainDb)) return 1;
        return Math.pow(10, Math.max(-18, Math.min(12, gainDb)) / 20);
    }

    volume(path, baseVolume) {
        const base = Number.isFinite(Number(baseVolume)) ? Number(baseVolume) : 1;
        return Math.min(1, Math.max(0, base * this.gain(path)));
    }
}
