class ChatSpecialBubbleCommand {
    static parse(message) {
        const match = String(message || '').match(/^\s*!광대(?:\s+([\s\S]*))?\s*$/u);
        if (!match) return null;
        return {
            kind: 'clown',
            text: String(match[1] || '').trim() || '...'
        };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = ChatSpecialBubbleCommand;
else window.ChatSpecialBubbleCommand = ChatSpecialBubbleCommand;
