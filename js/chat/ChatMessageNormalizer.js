class ChatMessageNormalizer {
    static normalize(data = {}) {
        const message = String(data.message || '');
        return {
            ...data,
            message,
            nickname: String(data.nickname || ''),
            emotes: data.emojis && typeof data.emojis === 'object' ? data.emojis : {},
            normalizedMessage: message.normalize('NFC').trim(),
            displayMessage: message.replace(/(^|\s)![\S]+/g, '').replace(/\s+/g, ' ').trim()
        };
    }
}
