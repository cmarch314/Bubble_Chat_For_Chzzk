class HuntHunterBlightRuntime {
    static DEFINITIONS = Object.freeze({
        fire: { emoji: '🔥', label: '화상', ticks: 120 },
        water: { emoji: '💧', label: '수상', ticks: 140 },
        thunder: { emoji: '⚡', label: '뢰상', ticks: 120 },
        ice: { emoji: '❄️', label: '빙상', ticks: 140 },
        dragon: { emoji: '🐉', label: '용상', ticks: 120 },
        poison: { emoji: '☠️', label: '독', ticks: 120 },
        paralysis: { emoji: '⚡', label: '마비', ticks: 38, actionLock: true },
        sleep: { emoji: '💤', label: '수면', ticks: 70, actionLock: true }
    });

    constructor(engine) { this.engine = engine; }

    initialize(hunter) {
        if (!hunter.elementalBlights) hunter.elementalBlights = {};
    }

    fromAttack(pattern) {
        const text = `${pattern?.id || ''} ${pattern?.name || ''} ${(pattern?.tags || []).join(' ')}`.toLowerCase();
        if (/poison|venom|독|맹독|독액|독가시/.test(text)) return 'poison';
        if (/paraly|마비|전기충격|신경독/.test(text)) return 'paralysis';
        if (/sleep|수면|최면|수면가스|졸음/.test(text)) return 'sleep';
        const elemental = pattern?.type === 'elemental' || pattern?.tags?.includes('elemental');
        if (!elemental) return null;
        if (/fire|화염|불꽃|겁염|폭염|용암|열선/.test(text)) return 'fire';
        if (/water|수류|수압|물|포말|거품|해류/.test(text)) return 'water';
        if (/thunder|electric|번개|벼락|뇌격|전격|방전|초전도/.test(text)) return 'thunder';
        if (/ice|frost|얼음|빙결|냉기|절대영도|빙벽/.test(text)) return 'ice';
        if (/dragon|용속성|용기|광룡|용염/.test(text)) return 'dragon';
        return null;
    }

    apply(hunter, type, duration) {
        const def = HuntHunterBlightRuntime.DEFINITIONS[type];
        if (!def || !hunter || hunter.status === 'dead') return false;
        this.initialize(hunter);
        hunter.elementalBlights[type] = Math.max(Number(hunter.elementalBlights[type] || 0), duration || def.ticks);
        if (def.actionLock) {
            hunter.atb = 0;
            hunter.isGathering = false;
            hunter.pendingSharpnessRestore = false;
            this.engine.actionStateMachine?.cancel(hunter, type);
            this.engine.updateWeaponAtbUI?.(hunter.index, 0);
        }
        this.engine.addLog(`${def.emoji} [${def.label}] ${hunter.name || hunter.hunterName}에게 ${def.label} 상태이상이 적용됐습니다!`, type === 'poison' ? '#c77dff' : '#9fe8ff');
        this.update(hunter);
        return true;
    }

    active(hunter, type) { return Number(hunter?.elementalBlights?.[type] || 0) > 0; }
    canAct(hunter) { return !this.active(hunter, 'paralysis') && !this.active(hunter, 'sleep'); }

    tick(hunter) {
        this.initialize(hunter);
        let changed = false;
        Object.keys(hunter.elementalBlights).forEach(type => {
            if (hunter.elementalBlights[type] <= 0) return;
            hunter.elementalBlights[type]--;
            if (hunter.elementalBlights[type] === 0) {
                delete hunter.elementalBlights[type];
                changed = true;
                if (type === 'paralysis' || type === 'sleep') hunter.actionState = 'idle';
            }
        });
        if ((this.active(hunter, 'fire') || this.active(hunter, 'poison'))
            && this.engine.battleTime % 10 === 0 && hunter.status !== 'dead'
            && Number(hunter.jumpInvulnerableTicks || 0) <= 0) {
            const rate = this.active(hunter, 'poison') ? .015 : .008;
            hunter.hp = Math.max(0, Number(hunter.hp || 0) - Math.max(1, Math.floor(hunter.maxHp * rate)));
            this.engine.updateHpUI(hunter);
            if (hunter.hp <= 0) this.engine.triggerHunterCart(hunter);
        }
        if (changed) this.update(hunter);
    }

    onIncomingHit(hunter, damage) {
        if (!this.active(hunter, 'sleep') || Number(damage || 0) <= 0) return Number(damage || 0);
        delete hunter.elementalBlights.sleep;
        hunter.actionState = 'idle';
        this.update(hunter);
        this.engine.addLog(`💥 [수면 기상] ${hunter.name || hunter.hunterName}이(가) 피격으로 깨어났습니다!`, '#ffd27a');
        return Math.max(1, Math.floor(Number(damage) * 1.5));
    }

    onEvade(hunter) {
        if (!this.active(hunter, 'fire')) return;
        hunter.elementalBlights.fire = Math.max(0, hunter.elementalBlights.fire - 35);
        if (!hunter.elementalBlights.fire) delete hunter.elementalBlights.fire;
        this.update(hunter);
    }

    staminaDelta(hunter, delta) {
        if (!Number.isFinite(Number(delta)) || !delta) return Number(delta || 0);
        if (delta > 0 && this.active(hunter, 'water')) return delta * .35;
        if (delta < 0 && this.active(hunter, 'ice')) return delta * 1.5;
        return delta;
    }

    stunChance(hunter, base) { return this.active(hunter, 'thunder') ? Math.min(.95, base * 2) : base; }
    stunDuration(hunter, ticks) { return this.active(hunter, 'thunder') ? Math.ceil(ticks * 1.35) : ticks; }
    blocksElementAndStatus(hunter) { return this.active(hunter, 'dragon'); }

    clear(hunter) {
        hunter.elementalBlights = {};
        this.update(hunter);
    }

    update(hunter) {
        if (this.engine.callbacks.onUpdateHunterBlightUI) this.engine.callbacks.onUpdateHunterBlightUI(hunter.index, hunter.elementalBlights);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntHunterBlightRuntime;
else globalThis.HuntHunterBlightRuntime = HuntHunterBlightRuntime;
