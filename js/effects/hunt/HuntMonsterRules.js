class HuntMonsterRules {
    static speedForState(state, monsterId = '', multiplier = 1) {
        let speed = 2.2;
        if (state === 'enraged') speed = 3.3;
        else if (state === 'exhausted' || state === 'valstrax_charging') speed = 1.1;
        if (monsterId.includes('vaal_hazak')) speed *= 0.75;
        return speed * multiplier;
    }

    static materialFor(monsterName, random = Math.random) {
        const name = monsterName || '몬스터';
        const materials = ['비늘', '갑각', '발톱', '꼬리', '날개', '꼬리뼈'];
        const index = Math.min(materials.length - 1, Math.floor(random() * materials.length));
        return `${name}의 ${materials[index]}`;
    }

    static crossedKnockdownThreshold(hp, maxHp, triggered, monsterId = '') {
        if (monsterId.includes('valstrax') || hp <= 0 || maxHp <= 0) return null;
        const ratio = (hp / maxHp) * 100;
        return [80, 60, 40, 20].find(threshold => ratio <= threshold && !triggered[threshold]) || null;
    }
}
