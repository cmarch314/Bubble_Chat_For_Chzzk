/**
 * [FIXED] Helper function for rendering emoticons
 * Handles Chzzk emoticon format: {emoteId} in message text
 * Emoticon data: { "id": { "imageUrl": "url" } } or { "id": "url" }
 */
function renderMessageWithEmotesHTML(message, emotes = {}) {
    if (!emotes || Object.keys(emotes).length === 0) {
        return message;
    }

    let result = message;
    const regex = /\{([^{}]+)\}/g; // Match {emoteId} pattern

    result = result.replace(regex, (match, emoteId) => {
        let emoteUrl = null;

        if (emotes[emoteId]) {
            if (typeof emotes[emoteId] === 'string') {
                emoteUrl = emotes[emoteId];
            } else if (emotes[emoteId].imageUrl) {
                emoteUrl = emotes[emoteId].imageUrl;
            } else if (emotes[emoteId].url) {
                emoteUrl = emotes[emoteId].url;
            }
        }

        if (emoteUrl) {
            return `<img src="${emoteUrl}" class="emote_chzzk_inline" style="height: 1.2em; vertical-align: middle; display: inline-block;" alt="${emoteId}">`;
        }
        return match;
    });

    return result;
}
