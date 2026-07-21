'use strict';

class HuntMonsterFlightRuntime {
    static AIRBORNE_EVADE_CHANCE = .5;
    static FLIGHT_DURATION_TICKS = 600;
    static NORMAL_KNOCKDOWN_TICKS = 70;
    static AERIAL_KNOCKDOWN_MULTIPLIER = 1.5;
    static CAPABLE = new Set([
        'rathalos', 'azure_rathalos', 'silver_rathalos', 'rathian', 'pink_rathian', 'gold_rathian',
        'seregios', 'legiana', 'shrieking_legiana', 'paolumu', 'nightshade_paolumu',
        'bazelgeuse', 'seething_bazelgeuse', 'pukei_pukei', 'coral_pukei_pukei',
        'kushala_daora', 'namielle', 'alatreon', 'fatalis', 'astalos',
        'valstrax', 'crimson_glow_valstrax'
    ]);

    constructor(random = Math.random) { this.random = random; }
    static normalize(id) { return String(id || '').toLowerCase().replace(/[-']/g, '_'); }
    static isCapable(monster) { return this.CAPABLE.has(this.normalize(monster?.id)); }

    static decoratePattern(monsterId, pattern) {
        if (!this.CAPABLE.has(this.normalize(monsterId))) return pattern;
        const evidenceText = `${pattern?.sourceActionClass || ''} ${pattern?.name || ''}`;
        const flightOnly = /Fly|Air|Aerial|공중|급강하|활공|비상|낙하 강타|서머솔트/i.test(evidenceText);
        const airCompatible = flightOnly || pattern?.tags?.includes('projectile') || pattern?.type === 'roar';
        return { ...pattern,
            tags: [...new Set([...(pattern.tags || []), flightOnly && 'flight-only', airCompatible && 'air-compatible'].filter(Boolean))],
            flightEvidence: flightOnly ? (pattern.sourceActionClass ? `installed-action:${pattern.sourceActionClass}` : `named-pattern:${pattern.name}`) : undefined
        };
    }

    initialize(engine) {
        engine.monsterCanFly = HuntMonsterFlightRuntime.isCapable(engine.selectedMonster);
        engine.monsterFlightState = 'grounded';
        engine.monsterFlightDamage = 0;
        engine.monsterFlightTicksRemaining = 0;
        engine.monsterFlightTurns = 0;
        engine.monsterGroundTurns = 0;
        engine.monsterFlightCooldown = 0;
    }

    tick(engine) {
        if (engine.monsterFlightCooldown > 0) engine.monsterFlightCooldown--;
        if (engine.monsterFlightState !== 'airborne') return;
        engine.monsterFlightTicksRemaining = Math.max(0, Number(engine.monsterFlightTicksRemaining || 0) - 1);
        this.updateFlightUI(engine);
        if (engine.monsterFlightTicksRemaining <= 0) this.land(engine, false);
    }

    updateFlightUI(engine) {
        const threshold = Math.max(300, Number(engine.monsterMaxHp || 1) * .1);
        const damage = Math.max(0, Number(engine.monsterFlightDamage || 0));
        engine.updateMonsterFlightUI(engine.monsterFlightState === 'airborne', Math.min(1, damage / threshold), damage, threshold, Number(engine.monsterFlightTicksRemaining || 0));
    }

    shouldEvade(engine) {
        return engine?.monsterFlightState === 'airborne' && this.random() < HuntMonsterFlightRuntime.AIRBORNE_EVADE_CHANCE;
    }

    beforeTurn(engine, patterns = []) {
        if (!engine.monsterCanFly || engine.monsterFlightCooldown > 0 || engine.monsterFlightState === 'airborne') return;
        if (['knocked_down', 'stunned', 'exhausted'].includes(engine.monsterState)) return;
        if (!patterns.some(pattern => pattern.tags?.includes('flight-only'))) return;
        engine.monsterGroundTurns++;
        const chance = engine.monsterState === 'enraged' ? .58 : .34;
        if (engine.monsterGroundTurns >= 2 && this.random() < chance) this.takeOff(engine);
    }

    takeOff(engine) {
        engine.monsterFlightState = 'airborne';
        engine.monsterFlightDamage = 0;
        engine.monsterFlightTicksRemaining = HuntMonsterFlightRuntime.FLIGHT_DURATION_TICKS;
        engine.monsterFlightTurns = 0;
        engine.monsterGroundTurns = 0;
        engine.addLog(`🪽 [비행] ${engine.selectedMonster.nameKO}이(가) 체력바 높이까지 날아올라 60초간 공중 패턴을 사용합니다!`, '#8fdcff');
        engine.showSkillBubble('monster', '🪽 비행 상태 · 60초');
        this.updateFlightUI(engine);
    }

    afterAction(engine) {
        if (engine.monsterFlightState === 'airborne') engine.monsterFlightTurns++;
    }

    land(engine, forced = false) {
        if (engine.monsterFlightState !== 'airborne') return;
        engine.monsterFlightState = 'grounded';
        engine.monsterFlightDamage = 0;
        engine.monsterFlightTicksRemaining = 0;
        engine.monsterFlightTurns = 0;
        engine.monsterFlightCooldown = forced ? 220 : 90;
        this.updateFlightUI(engine);
        if (!forced) engine.addLog(`🪽 [착지] ${engine.selectedMonster.nameKO}이(가) 60초의 비행을 마치고 지상으로 내려옵니다.`, '#d7e8ef');
    }

    onHunterDamage(engine, hunter, damage) {
        if (engine.monsterFlightState !== 'airborne' || damage <= 0) return false;
        engine.monsterFlightDamage += Number(damage) * (hunter?.type === 'ranged' ? 1.2 : .75);
        const threshold = Math.max(300, Number(engine.monsterMaxHp || 1) * .1);
        this.updateFlightUI(engine);
        if (engine.monsterFlightDamage < threshold) return false;
        this.land(engine, true);
        engine.pendingMonsterAction = null;
        engine.monsterAtb = 0;
        const aerialKnockdownTicks = Math.ceil(HuntMonsterFlightRuntime.NORMAL_KNOCKDOWN_TICKS * HuntMonsterFlightRuntime.AERIAL_KNOCKDOWN_MULTIPLIER);
        engine.monsterState = 'knocked_down';
        engine.monsterKnockdownDuration = Math.max(Number(engine.monsterKnockdownDuration || 0), aerialKnockdownTicks);
        engine.updateMonsterAtbUI(0);
        engine.updateMonsterStateUI('격추 대경직', `💥 격추된 ${engine.selectedMonster.nameKO} 💥`, { color: '#8fdcff', bg: 'rgba(80,180,255,.16)' });
        engine.addLog(`💥 [격추!] 공중 누적 피해로 ${engine.selectedMonster.nameKO}이(가) 추락해 대경직에 빠졌습니다!`, '#8fdcff');
        engine.showSkillBubble('monster', '💥 격추 대경직!');
        engine.shakeMonster();
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterFlightRuntime;
else globalThis.HuntMonsterFlightRuntime = HuntMonsterFlightRuntime;
