class RacingRules {
    static createRacers(pool, random = Math.random, count = 4) {
        const shuffled = [...pool].sort(() => random() - 0.5);
        return shuffled.slice(0, count).map((racer, id) => ({
            id,
            name: racer.name,
            emoji: racer.emoji,
            code: racer.code,
            pos: 0,
            speed: 0,
            boost: 0,
            stunTicks: 0,
            shieldTicks: 0,
            scale: 1,
            rotate: 0,
            statusText: '',
            statusTimer: 0,
            hasItem1: false,
            hasItem2: false,
            eventCooldownTicks: 0
        }));
    }

    static resolveRacerIndex(message, racers) {
        const normalized = String(message || '').trim();
        const numeric = normalized.match(/^!?(\d)$/);
        if (numeric) {
            const index = Number(numeric[1]) - 1;
            return index >= 0 && index < racers.length ? index : -1;
        }

        return racers.findIndex(racer =>
            (racer.emoji && normalized.includes(racer.emoji)) ||
            (racer.name && normalized.includes(racer.name))
        );
    }

    static standings(racers) {
        return [...racers].sort((a, b) => b.pos - a.pos);
    }

    static leader(racers) {
        return RacingRules.standings(racers)[0] || null;
    }
}
