class HuntChatTactics {
    constructor(options = {}) {
        this.userCooldownTicks = options.userCooldownTicks || 40;
        this.reset();
    }

    reset() {
        this.userCooldowns = new Map();
        this.strategyVotes = { offensive: 0, defensive: 0, support: 0 };
        this.supportGauge = 0;
        this.maxSupportGauge = 100;
    }

    parse(message) {
        const normalized = String(message || '').trim().replace(/\s+/g, '');
        const commands = {
            '!공격': 'offensive', '!공세': 'offensive',
            '!안전': 'defensive', '!수비': 'defensive',
            '!지원': 'support', '!응원': 'support',
            '!회복': 'heal', '!함정': 'trap', '!섬광': 'flash', '!낙석': 'rockfall'
        };
        return commands[normalized] || null;
    }

    tick(currentTick) {
        for (const [nickname, readyAt] of this.userCooldowns.entries()) {
            if (readyAt <= currentTick) this.userCooldowns.delete(nickname);
        }
    }

    addGauge(amount) {
        this.supportGauge = Math.min(this.maxSupportGauge, this.supportGauge + amount);
        return this.supportGauge;
    }

    spendGauge(amount) {
        if (this.supportGauge < amount) return false;
        this.supportGauge -= amount;
        return true;
    }

    updateStrategy(engine, strategy) {
        this.strategyVotes[strategy]++;
        const order = ['offensive', 'defensive', 'support'];
        engine.teamTactic = order.reduce((best, key) =>
            this.strategyVotes[key] > this.strategyVotes[best] ? key : best, order[0]);
    }

    handle(engine, msgData, message) {
        const command = this.parse(message);
        if (!command || !engine) return { handled: false };
        const nickname = String(msgData && msgData.nickname || 'anonymous');
        const currentTick = engine.battleTime || 0;
        this.tick(currentTick);
        if (this.userCooldowns.has(nickname)) {
            return { handled: true, accepted: false, feedback: '⏳ 대기' };
        }
        this.userCooldowns.set(nickname, currentTick + this.userCooldownTicks);
        if (['offensive', 'defensive', 'support'].includes(command)) {
            this.updateStrategy(engine, command);
            this.addGauge(command === 'support' ? 8 : 4);
            const labels = { offensive: '⚔️ 공격 집중', defensive: '🛡️ 생존 우선', support: '💚 지원 집중' };
            engine.addLog(`📣 [작전 투표] ${nickname}: ${labels[command]} (현재 지원 게이지 ${this.supportGauge}/100)`, '#7fe7ff');
            return { handled: true, accepted: true, feedback: labels[command] };
        }

        if (command === 'heal') {
            if (!this.spendGauge(35)) return { handled: true, accepted: false, feedback: `💚 35 필요 · ${this.supportGauge}/100` };
            const alive = engine.selectedWeapons.filter(item => item.status === 'alive');
            const target = alive.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
            if (!target) return { handled: true, accepted: false, feedback: '회복 대상 없음' };
            const healed = Math.max(1, Math.floor(target.maxHp * 0.18));
            target.hp = Math.min(target.maxHp, target.hp + healed);
            engine.updateHpUI(target);
            engine.addLog(`💚 [시청자 지원] ${nickname}의 광역 회복! ${target.hunterName} +${healed} HP`, '#55ff9a');
            return { handled: true, accepted: true, feedback: `💚 ${target.hunterName} 회복` };
        }

        if (command === 'flash') {
            if (!this.spendGauge(50)) return { handled: true, accepted: false, feedback: `✨ 50 필요 · ${this.supportGauge}/100` };
            const flashPolicy = typeof HuntSupportItemPolicy !== 'undefined'
                ? HuntSupportItemPolicy
                : (typeof require === 'function' ? require('./HuntSupportItemPolicy.js') : null);
            if (!flashPolicy?.isFlashEffective(engine)) {
                this.addGauge(50);
                return { handled: true, accepted: false, feedback: '🚫 섬광 내성' };
            }
            engine.monsterFlashUseCount = Number(engine.monsterFlashUseCount || 0) + 1;
            engine.monsterAtb = 0;
            if (engine.monsterFlightState === 'airborne') {
                engine.monsterFlightRuntime?.forceLanding(engine, 'viewer-flash');
            } else {
                engine.monsterRecoveryDuration = Math.max(engine.monsterRecoveryDuration || 0, 25);
            }
            engine.updateMonsterAtbUI(0);
            engine.playSFX?.('flash_pod', null, {
                action: 'support',
                item: 'flash-pod'
            });
            engine.triggerEnvironmentEffect?.('flash');
            engine.addLog(`✨ [시청자 섬광] ${nickname}의 섬광탄! 몬스터의 행동이 지연됩니다.`, '#fff27a');
            return { handled: true, accepted: true, feedback: '✨ 섬광 성공' };
        }

        if (command === 'trap') {
            if (!this.spendGauge(70)) return { handled: true, accepted: false, feedback: `🪤 70 필요 · ${this.supportGauge}/100` };
            if (engine.isMonsterTrapImmune()) {
                this.addGauge(70);
                return { handled: true, accepted: false, feedback: '🚫 함정 면역' };
            }
            engine.monsterState = 'knocked_down';
            const trapTicks = engine.consumeTrapDuration(35);
            engine.monsterKnockdownDuration = Math.max(engine.monsterKnockdownDuration || 0, trapTicks);
            engine.monsterAtb = 0;
            engine.playSFX?.('monster_trap', null, { monsterId: engine.selectedMonster.id });
            engine.triggerEnvironmentEffect?.('pitfall');
            engine.addLog(`🪤 [시청자 함정] ${nickname}의 함정 성공! ${(trapTicks / 10).toFixed(1)}초 집중 공격 기회입니다.`, '#ffcf66');
            return { handled: true, accepted: true, feedback: '🪤 함정 성공' };
        }

        if (command === 'rockfall') {
            if (!this.spendGauge(80)) return { handled: true, accepted: false, feedback: `🪨 80 필요 · ${this.supportGauge}/100` };
            const damage = Math.max(1, Math.floor(engine.monsterMaxHp * 0.04));
            engine.monsterHp = Math.max(0, engine.monsterHp - damage);
            engine.triggerEnvironmentEffect?.('rockfall');
            engine.updateMonsterHpUI();
            engine.checkMonsterKnockdown();
            engine.addLog(`🪨 [환경 낙석] ${nickname}의 신호로 낙석 명중! -${damage} HP`, '#ffb05c');
            return { handled: true, accepted: true, feedback: `🪨 낙석 -${damage}` };
        }
        return { handled: false };
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntChatTactics;
else window.HuntChatTactics = HuntChatTactics;
