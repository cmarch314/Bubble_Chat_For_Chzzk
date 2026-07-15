class GameCommandMatcher {
    find(message, msgData, debugMode = false) {
        if (!msgData.isStreamer && !debugMode) return null;

        const normalized = (message || '').trim().toLowerCase();
        if (normalized.startsWith('!퀴즈')) return 'sound_quiz';
        if (normalized.startsWith('!경마')) return 'racing';
        if (normalized.startsWith('!레이드')) return 'raid';
        if (normalized.startsWith('!토벌') || normalized.startsWith('!수렵')) return 'hunt';
        if (normalized === '!커맨드') return 'commands_scroll';
        return null;
    }
}
