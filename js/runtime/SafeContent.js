class SafeContent {
    static escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[character]));
    }

    static remoteImageUrl(value) {
        if (typeof value !== 'string' || !value.trim()) return null;
        try {
            const url = new URL(value);
            return url.protocol === 'https:' ? url.href : null;
        } catch (error) {
            return null;
        }
    }

    static cssColor(value, fallback = '#ffffff') {
        if (typeof value !== 'string') return fallback;
        const color = value.trim();
        if (/^#[0-9a-f]{3,8}$/i.test(color)) return color;
        if (/^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s+-]+\)$/i.test(color)) return color;
        return fallback;
    }

    static renderEmotesHTML(message, emotes = {}, scale = 1) {
        const source = String(message ?? '');
        const safeScale = Number.isFinite(Number(scale))
            ? Math.min(4, Math.max(0.5, Number(scale)))
            : 1;
        const singleToken = /^\{[^}]+\}$/.test(source.trim());
        const tokenPattern = /\{[^}]+\}/g;
        let cursor = 0;
        let html = '';
        let match;

        while ((match = tokenPattern.exec(source)) !== null) {
            html += this.escapeHTML(source.slice(cursor, match.index));
            const emoteId = match[0].replace(/[{}:]/g, '').trim();
            const descriptor = emotes?.[emoteId];
            const rawUrl = typeof descriptor === 'string'
                ? descriptor
                : descriptor?.imageUrl || descriptor?.url;
            const safeUrl = this.remoteImageUrl(rawUrl);

            if (safeUrl) {
                const height = singleToken ? 10 : 3 * safeScale;
                html += `<img src="${this.escapeHTML(safeUrl)}" class="emote_chzzk_inline" style="height:${height}em;width:auto;vertical-align:middle;display:inline-block;" alt="${this.escapeHTML(emoteId)}">`;
            } else {
                html += this.escapeHTML(match[0]);
            }
            cursor = match.index + match[0].length;
        }

        html += this.escapeHTML(source.slice(cursor));
        return html;
    }

    static setText(element, value) {
        if (element) element.textContent = String(value ?? '');
        return element;
    }
}
