class HuntHunterCommandQueue {
    constructor(options = {}) {
        this.maxQueued = Math.max(1, Number(options.maxQueued || 3));
    }

    parse(message) {
        const normalized = String(message || '').trim().replace(/\s+/g, '');
        const commands = {
            '!숫돌': 'whetstone', '!숫돌사용': 'whetstone',
            '!가루': 'lifepowder', '!회복가루': 'lifepowder', '!생명의가루': 'lifepowder',
            '!회복약': 'potion', '!물약': 'potion', '!믈약': 'potion',
            '!폭탄': 'bomb', '!대형폭탄': 'bomb', '!나무통폭탄': 'bomb',
            '!점프': 'jump', '!귀환옥': 'farcaster',
            '!예약취소': 'cancel'
        };
        return commands[normalized] || null;
    }

    label(command) {
        return { whetstone: '!숫돌', lifepowder: '!가루', potion: '!물약', bomb: '!폭탄', jump: '!점프', farcaster: '!귀환옥' }[command] || command;
    }

    compactLabel(command) {
        return { whetstone: '숫돌', lifepowder: '가루', potion: '물약', bomb: '폭탄', jump: '점프', farcaster: '귀환' }[command] || command;
    }

    result(data = {}) {
        return { handled: true, suppressBubble: true, ...data };
    }

    queueFor(hunter) {
        if (!Array.isArray(hunter.queuedCommands)) hunter.queuedCommands = [];
        return hunter.queuedCommands;
    }

    handle(engine, msgData, message) {
        const command = this.parse(message);
        if (!command) return { handled: false };
        const nickname = String(msgData?.nickname || '');
        const hunter = engine?.selectedWeapons?.find(item => !item.isNpc && item.hunterName === nickname);
        if (!hunter) return this.result({ accepted: false, feedback: '참가자만 예약 가능' });

        const queue = this.queueFor(hunter);
        if (command === 'cancel') {
            const removed = queue.length;
            queue.length = 0;
            engine.updateHunterCommandQueueUI?.(hunter);
            return this.result({ accepted: removed > 0, feedback: removed > 0 ? `예약 ${removed}개 취소` : '예약 없음' });
        }
        if (command === 'whetstone' && !hunter.sharpnessProfile) {
            return this.result({ accepted: false, feedback: '사용 불가: !숫돌' });
        }
        if (command === 'whetstone' && hunter.personality === 'newbie') {
            return this.result({ accepted: false, feedback: '몬린이는 숫돌을 사용하지 않음' });
        }
        if (command === 'lifepowder' && Number(hunter.lifepowders || 0) <= 0) {
            return this.result({ accepted: false, feedback: '없음: !가루' });
        }
        if (command === 'potion' && Number(hunter.potions || 0) <= 0) {
            return this.result({ accepted: false, feedback: '없음: !물약' });
        }
        if (command === 'bomb' && Number(hunter.bombs || 0) <= 0) {
            return this.result({ accepted: false, feedback: '없음: !폭탄' });
        }
        if (command === 'farcaster' && hunter.farcasterUsed) {
            return this.result({ accepted: false, feedback: '이번 전투 사용 완료: !귀환옥' });
        }
        if (queue.includes(command)) {
            return this.result({ accepted: false, feedback: `이미 예약: ${this.label(command)}` });
        }
        if (queue.length >= this.maxQueued) {
            return this.result({ accepted: false, feedback: `예약 가득 참 (${this.maxQueued}/${this.maxQueued})` });
        }

        queue.push(command);
        engine.addLog(`📋 ${hunter.hunterName} 예약: ${this.label(command)} (${queue.length}/${this.maxQueued})`, '#7fe7ff');
        engine.updateHunterCommandQueueUI?.(hunter);
        return this.result({ accepted: true, feedback: `예약: ${this.label(command)} (${queue.length}/${this.maxQueued})` });
    }

    canExecute(engine, hunter, command) {
        if (hunter.status !== 'alive') return false;
        if (command === 'whetstone') {
            return hunter.personality !== 'newbie' && Boolean(hunter.sharpnessProfile)
                && Number(hunter.sharpness || 0) < Number(hunter.maxSharpness || 0);
        }
        if (command === 'lifepowder') {
            return Number(hunter.lifepowders || 0) > 0
                && engine.selectedWeapons.some(item => item.status === 'alive' && item.hp < item.maxHp);
        }
        if (command === 'potion') return Number(hunter.potions || 0) > 0 && hunter.hp < hunter.maxHp;
        if (command === 'bomb') return Number(hunter.bombs || 0) > 0 && engine.monsterHp > 0;
        if (command === 'jump') return true;
        if (command === 'farcaster') return !hunter.farcasterUsed && !hunter.isAtCamp;
        return false;
    }

    tryExecute(engine, hunter) {
        const queue = this.queueFor(hunter);
        const queueIndex = queue.findIndex(command => this.canExecute(engine, hunter, command));
        if (queueIndex < 0) return false;
        const [command] = queue.splice(queueIndex, 1);
        engine.updateHunterCommandQueueUI?.(hunter);

        if (command === 'whetstone') {
            const before = Number(hunter.sharpness || 0);
            hunter.itemDuration = engine.perkRuntime ? engine.perkRuntime.whetstoneDuration(hunter, 30) : 30;
            hunter.pendingSharpnessRestore = true;
            engine.addLog(`🪨 [예약 실행] ${hunter.hunterName}이(가) 숫돌질을 시작합니다. (${before}/${hunter.maxSharpness})`, '#c98534');
            engine.showSkillBubble(hunter.index, '🪨 숫돌');
            engine.shakeWeapon(hunter.index, '#c98534');
            return true;
        }

        if (command === 'lifepowder') {
            if (!engine.perkRuntime || engine.perkRuntime.shouldConsumeItem(hunter)) hunter.lifepowders--;
            engine.updateHunterItemUI?.(hunter);
            hunter.itemDuration = engine.perkRuntime ? engine.perkRuntime.itemDuration(hunter, 15) : 15;
            const amount = engine.perkRuntime ? engine.perkRuntime.healAmount(hunter, 25) : 25;
            engine.selectedWeapons.forEach(target => {
                if (target.status !== 'alive') return;
                target.hp = Math.min(target.maxHp, target.hp + amount);
                target.atb = Math.min(100, target.atb + 60);
                engine.updateHpUI(target);
                engine.updateWeaponAtbUI(target.index, target.atb);
                engine.shakeWeapon(target.index, '#00ffaa');
            });
            engine.addLog(`🌿 [예약 실행] ${hunter.hunterName}이(가) 회복가루를 사용했습니다. (전원 +${amount} HP, +60 ATB)`, '#00ffaa');
            engine.playSFX('lifepowder', null, { hunterIndex: hunter.index, action: 'support' });
            engine.showSkillBubble(hunter.index, '🌿 가루');
            return true;
        }

        if (command === 'potion') {
            if (!engine.perkRuntime || engine.perkRuntime.shouldConsumeItem(hunter)) hunter.potions--;
            hunter.itemDuration = engine.perkRuntime ? engine.perkRuntime.itemDuration(hunter, 5) : 5;
            const baseHeal = Math.round(hunter.maxHp * .6);
            const amount = engine.perkRuntime ? engine.perkRuntime.healAmount(hunter, baseHeal) : baseHeal;
            hunter.hp = Math.min(hunter.maxHp, hunter.hp + amount);
            if (engine.perkRuntime) engine.perkRuntime.afterPotion(hunter, amount);
            engine.updateHpUI(hunter);
            engine.updatePotionCountUI(hunter.index, hunter.potions);
            engine.updateHunterItemUI?.(hunter);
            engine.playAudioFile('Unified_SFX/Potion Drink.mp3', null, 2.5, { hunterIndex: hunter.index, action: 'item' });
            engine.addLog(`🧪 [예약 실행] ${hunter.hunterName}이(가) 회복약을 사용했습니다. (+${amount} HP)`, '#2eff7b');
            engine.showSkillBubble(hunter.index, '🧪 물약');
            engine.shakeWeapon(hunter.index, '#2eff7b');
            return true;
        }

        if (command === 'bomb') return this.useBomb(engine, hunter, '예약 실행');

        if (command === 'jump') {
            hunter.jumpInvulnerableTicks = 50;
            hunter.rollDuration = 0;
            hunter.guardDuration = 0;
            hunter.atb = 0;
            engine.actionStateMachine?.cancel(hunter, 'jump');
            engine.updateWeaponAtbUI(hunter.index, 0);
            engine.callbacks?.onTriggerInvincibleJump?.(hunter.index, true);
            engine.addLog(`🌀 ${hunter.hunterName}: !점프`, '#86ffbf');
            engine.showSkillBubble(hunter.index, '🌀 점프');
            return true;
        }

        if (command === 'farcaster') {
            hunter.farcasterUsed = true;
            hunter.isAtCamp = true;
            hunter.campReason = '귀환옥 사용';
            hunter.perkCampTicks = 150;
            hunter.hp = hunter.maxHp;
            hunter.potions = Math.max(Number(hunter.potions || 0), 10);
            if (hunter.sharpnessProfile) hunter.sharpness = Number(hunter.maxSharpness || hunter.sharpness || 0);
            hunter.atb = 0;
            engine.updateHpUI(hunter);
            engine.updatePotionCountUI(hunter.index, hunter.potions);
            engine.updateHunterItemUI?.(hunter);
            engine.updateSharpnessUI?.(hunter.index, hunter);
            engine.updateWeaponAtbUI(hunter.index, 0);
            engine.addLog(`💨 ${hunter.hunterName}: !귀환옥`, '#9fdcff');
            engine.showSkillBubble(hunter.index, '💨 귀환옥');
            return true;
        }
        return false;
    }

    useBomb(engine, hunter, source = '아이템') {
        if (Number(hunter?.bombs || 0) <= 0 || Number(engine?.monsterHp || 0) <= 0) return false;
        const hasBombardier = Array.isArray(hunter.perks) && hunter.perks.some(perk => perk?.name === '폭파광');
        const baseDamage = Math.max(60, Math.floor(Number(engine.monsterMaxHp || 0) * .04));
        let damage = Math.floor(baseDamage * (hasBombardier ? 1.5 : 1));
        if (!engine.perkRuntime || engine.perkRuntime.shouldConsumeItem(hunter)) hunter.bombs--;
        if (engine.smallMonsterSwarm) {
            const target = engine.smallMonsterSwarm.randomTarget(engine.random);
            if (target) damage = Math.min(damage, target.hp);
        }
        hunter.itemDuration = engine.perkRuntime ? engine.perkRuntime.itemDuration(hunter, 18) : 18;
        engine.monsterHp = Math.max(0, engine.monsterHp - damage);
        engine.updateMonsterHpUI();
        engine.updateHunterItemUI?.(hunter);
        engine.triggerEnvironmentEffect?.('bomb');
        engine.playSFX?.('barrel_bomb', null, { hunterIndex: hunter.index, action: 'item', item: 'large-barrel-bomb' });
        engine.addLog(`💣 [${source}] ${hunter.hunterName}이(가) 대형나무통폭탄을 폭발시켰습니다! (-${damage} HP${hasBombardier ? ' · 폭파광 1.5배' : ''})`, '#ff9f43');
        engine.showSkillBubble(hunter.index, hasBombardier ? '💥 폭파광 대폭발!' : '💣 대형나무통폭탄!');
        return true;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntHunterCommandQueue;
else window.HuntHunterCommandQueue = HuntHunterCommandQueue;
