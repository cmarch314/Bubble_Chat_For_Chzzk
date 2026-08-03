class HuntHunterTurnExecutor {
    static BASE_HIT_CHANCE = 0.90;
    static WHETSTONE_ITEM_VISUAL = Object.freeze({
        type: 'item',
        label: '숫돌',
        imagePath: 'local_assets/monster_hunter/reference-icons/rise/item/426326752.png',
        sourceId: '426326752',
        sourceNameJa: '砥石'
    });

    static supportItemPolicy() {
        if (typeof HuntSupportItemPolicy !== 'undefined') return HuntSupportItemPolicy;
        if (typeof require === 'function') return require('./HuntSupportItemPolicy.js');
        return null;
    }

    static completeAction(engine, hunter, action, context = {}) {
        const {
            attackTicks = 10,
            continuingGreatSwordCharge = false,
            actionStartingAtb = 100,
            beganInDemonMode = false,
            isKnockdownAttack = false,
            combos = []
        } = context;
        const resolvedAction = { ...action };
        resolvedAction.durationTicks = resolvedAction.atbOccupancyTicks || resolvedAction.durationTicks || attackTicks;
        if (hunter.id === 'long_sword') {
            const tags = Array.isArray(resolvedAction.tags) ? resolvedAction.tags : [];
            hunter.longSwordForesightEligible = Number(resolvedAction.dmg || 0) > 0
                && !tags.includes('reaction-only')
                && !tags.includes('counter-fail');
        }
        if (engine.perkRuntime) {
            resolvedAction.durationTicks = engine.perkRuntime.actionDuration(hunter, resolvedAction, resolvedAction.durationTicks);
        }
        if (engine.actionStateMachine) engine.actionStateMachine.begin(hunter, resolvedAction);
        else hunter.attackDuration = attackTicks;
        if (hunter.id === 'great_sword') {
            const endsChargeSequence = resolvedAction.id === 'great_sword.true_charged_slash'
                || resolvedAction.tags?.includes('tackle');
            hunter.greatSwordChargeLocked = !endsChargeSequence
                && (continuingGreatSwordCharge || resolvedAction.tags?.includes('charge-release'));
        }
        if (!continuingGreatSwordCharge) {
            HuntHunterTurnExecutor.spendActionAtb(
                hunter,
                resolvedAction,
                actionStartingAtb,
                beganInDemonMode || Boolean(hunter.longSwordReactiveFollowup)
            );
        }
        engine.updateWeaponAtbUI(hunter.index, hunter.atb);
        if (!isKnockdownAttack) {
            hunter.lastActionId = resolvedAction.id;
            hunter.comboIndex = engine.weaponActionSelector
                ? engine.weaponActionSelector.nextIndex(hunter, combos, resolvedAction)
                : (hunter.comboIndex + 1) % combos.length;
        }
        if (resolvedAction.id === 'long_sword.spirit_roundslash') {
            hunter.longSwordReactiveFollowup = false;
            hunter.longSwordForesightChain = 0;
        }
        return resolvedAction;
    }

    static atbConfig() {
        if (typeof HuntAtbConfig !== 'undefined') return HuntAtbConfig;
        if (typeof require === 'function') return require('./HuntAtbConfig.js');
        throw new Error('HuntAtbConfig is required before the hunter turn runtime');
    }

    static atbCostSeconds(action = {}) {
        return HuntHunterTurnExecutor.atbConfig().actionCostSeconds(action);
    }

    static spendActionAtb(hunter, action = {}, startingAtb = 100, usePartialBudget = false) {
        // One timing scale owns cadence. Legacy mechanic atbAfterAction values are
        // state-machine hints only and must not override verified/proxy motion time.
        const config = HuntHunterTurnExecutor.atbConfig();
        const budget = usePartialBudget ? Number(startingAtb || 0) : config.GAUGE_MAX;
        hunter.atb = Math.max(0, budget - config.actionCostGauge(action));
        return hunter.atb;
    }

    static atbDamageScale(action = {}) {
        return Math.max(0.15, HuntHunterTurnExecutor.atbConfig().normalizedActionCost(action) * 0.65);
    }

    static combatGatherFind(random = Math.random, personality = 'normal') {
        const finds = [
            { kind: 'herb', node: '풀꽃', item: '약초', emoji: '🌿', color: '#aaffaa' },
            { kind: 'ore', node: '광맥', item: '마카라이트광석', emoji: '⛏️', color: '#8fd8ff' },
            { kind: 'ore', node: '광맥', item: '드래그라이트광석', emoji: '💎', color: '#83bfff' },
            { kind: 'mushroom', node: '버섯 군락', item: '푸른버섯', emoji: '🍄', color: '#c59cff' },
            { kind: 'mushroom', node: '버섯 군락', item: '니트로버섯', emoji: '🍄', color: '#ff9b68' },
            { kind: 'insect', node: '곤충 채집 포인트', item: '뇌광충', emoji: '🪲', color: '#f5e96b' },
            {
                kind: 'insect',
                node: '곤충 채집 포인트',
                item: '광충',
                emoji: '🪲',
                color: '#ffe45c',
                visualVariant: 'flashbug'
            },
            { kind: 'bone', node: '뼈무덤', item: '용골【중】', emoji: '🦴', color: '#e8dfc5' },
            { kind: 'honey', node: '벌집', item: '벌꿀', emoji: '🍯', color: '#ffc857' }
        ];
        const roll = Math.max(0, Math.min(.999999, Number(random()) || 0));
        if (personality === 'support') {
            if (roll < .7) return finds[0];
            const nonHerbFinds = finds.slice(1);
            return nonHerbFinds[Math.floor(((roll - .7) / .3) * nonHerbFinds.length)];
        }
        return finds[Math.floor(roll * finds.length)];
    }

    static applyGatherReward(hunter, find) {
        if (find?.item === '뇌광충') {
            hunter.shockTraps = Number(hunter.shockTraps || 0) + 1;
            return ' · 마비함정 1개 조제';
        }
        if (find?.item !== '광충') return '';
        hunter.flashPods = Number(hunter.flashPods || 0) + 1;
        return ' · 섬광탄 1개 조제';
    }

    static preparationAudioCue(action) {
        const id = String(action?.id || '');
        // Bow draw stages are deliberately silent. Even the labelled World
        // charge-air source retains an audible string/creak component when it
        // is repeated by the autobattler, so it must not be routed here.
        if (/^bow\.draw_[123]$/.test(id)) return null;
        if (id === 'bow.charging_sidestep') return 'bow_charge_step';
        if (/^bow\./.test(id)) return null;
        if (action?.audioCue && action.audioCue !== 'none') return action.audioCue;
        const greatSwordChargeTier = id.match(/^great_sword\.(?:strong_|true_)?charge_([123])$/)?.[1];
        if (greatSwordChargeTier) return `charge_tier_${greatSwordChargeTier}`;
        if (/extract_/.test(id)) return 'kinsect_extract';
        if (/reload|load_phials/.test(id)) return 'reload';
        if (/recital|melody|note/.test(id)) return 'hunting_horn_note';
        if (/guard|counter|offset|backstep|sidestep/.test(id)) return 'guard_ready';
        if (/morph|mode|ignition|demon|charge_shield|refresh_shield/.test(id)) return 'weapon_transform';
        if (/charge|draw/.test(id)) return 'weapon_charge';
        if (/stamina|recover/.test(id)) return 'weapon_recover';
        return 'weapon_ready';
    }

    static execute(engine, w) {
        if (engine.perkRuntime && !engine.perkRuntime.canAct(w)) return;
        if (engine.blightRuntime?.canAct && !engine.blightRuntime.canAct(w)) { w.atb = 0; return; }
        if (engine.monsterHp <= 0) return; // [FIX] 몬스터 사망 시 사후 타격(Beatdown) 방지

        if (w.hitDuration && w.hitDuration > 0) {
            w.atb = 0;
            return;
        }
        const actionStartingAtb = Number(w.atb || 0);
        const beganInDemonMode = w.id === 'dual_blades' && Boolean(w.demonMode);
        const continuingGreatSwordCharge = w.id === 'great_sword' && Boolean(w.greatSwordChargeLocked);
        let forceUntargetableWhiff = false;
        if (!continuingGreatSwordCharge) w.atb = 0;

        if (!continuingGreatSwordCharge) {
        if (engine.perkRuntime && engine.perkRuntime.trySpecialAction(w)) return;

        const trapImmuneMonster = engine.isMonsterTrapImmune();
        const supportItemPolicy = HuntHunterTurnExecutor.supportItemPolicy();
        const shouldFlash = supportItemPolicy?.canUseFlash(engine, w, engine.random.bind(engine));
        if (Number(w.shockTraps || 0) > 0
            && !trapImmuneMonster
            && engine.monsterFlightState === 'airborne'
            && !shouldFlash
            && !engine.pendingLandingTrap) {
            w.shockTraps--;
            w.itemDuration = 12;
            engine.pendingLandingTrap = {
                hunterIndex: w.index,
                hunterName: w.hunterName
            };
            engine.updateHunterItemUI?.(w);
            engine.triggerEnvironmentEffect('shocktrap-pending', w.index);
            engine.addLog(`🪤 [함정 설치] ${w.hunterName}이(가) 착지 지점에 함정을 설치했습니다.`, '#ffe66d');
            return;
        }
        if (Number(w.shockTraps || 0) > 0 && !trapImmuneMonster && engine.monsterFlightState !== 'airborne'
            && engine.monsterState === 'normal' && engine.monsterAtb >= 60) {
            w.shockTraps--;
            engine.updateHunterItemUI?.(w);
            w.itemDuration = 12;
            const trapEffect = engine.beginMonsterTrapControl('shocktrap', 40);
            const trapTicks = trapEffect.durationTicks;
            engine.playSFX?.('monster_trap', null, { monsterId: engine.selectedMonster.id });
            engine.updateMonsterStateUI('마비함정', `⚡ 마비함정에 걸린 ${engine.selectedMonster.nameKO} ⚡`, { color: '#ffe66d', bg: 'rgba(255,230,80,.14)' });
            engine.triggerEnvironmentEffect('shocktrap', w.index, trapEffect);
            engine.addLog(`⚡ [마비함정] ${w.hunterName}이(가) 뇌광충으로 만든 덫을 설치했습니다! (${(trapTicks / 10).toFixed(1)}초 · 누적 내성 ${engine.monsterTrapUseCount}단계)`, '#ffe66d');
            return;
        }

        if (shouldFlash) {
            w.flashPods--;
            engine.monsterFlashUseCount = Number(engine.monsterFlashUseCount || 0) + 1;
            w.itemDuration = 8;
            if (engine.monsterTraitState?.atomicFlightActive) {
                engine.monsterTraitRuntime?.cancelInFlightScales?.(engine);
            }
            if (engine.interruptMonsterMovement) engine.interruptMonsterMovement('flash');
            else {
                engine.pendingMonsterAction = null;
                engine.pendingMonsterImpact = null;
            }
            const controlAtb = typeof engine.setMonsterAtbForControl === 'function'
                ? engine.setMonsterAtbForControl.bind(engine)
                : (typeof engine.applyMonsterControlAtb === 'function'
                    ? engine.applyMonsterControlAtb.bind(engine)
                    : null);
            const retainedFlashAtb = controlAtb ? controlAtb('flash') : 50;
            if (!controlAtb) {
                engine.monsterAtb = retainedFlashAtb;
                engine.updateMonsterAtbUI?.(retainedFlashAtb);
            }
            const wasAirborne = engine.monsterFlightState === 'airborne';
            if (wasAirborne && engine.monsterFlightRuntime) {
                engine.monsterFlightRuntime.forceLanding(engine, 'flash', null, {
                    retainedAtb: retainedFlashAtb
                });
            }
            engine.updateHunterItemUI?.(w);
            engine.playSFX?.('flash_pod', null, {
                hunterIndex: w.index,
                action: 'support',
                item: 'flash-pod'
            });
            engine.triggerEnvironmentEffect('flash', w.index);
            engine.addLog(`✨ [섬광탄] ${w.hunterName}이(가) 광충으로 조제한 섬광탄을 사용해 ${wasAirborne ? '몬스터를 격추했습니다' : '몬스터의 공격을 끊었습니다'}! (남은 섬광 ${w.flashPods})`, '#fff3a3');
            engine.showSkillBubble(w.index, '✨ 섬광탄!');
            return;
        }



        // Personality-based heal probability
        let healProb = 0.65;
        if (w.personality === 'offensive') healProb = 0.40;
        else if (w.personality === 'defensive') healProb = 0.85;
        else if (w.personality === 'veteran') healProb = 0.80;
        else if (w.personality === 'support') healProb = 0.75;
        else if (w.personality === 'newbie') healProb = 0.30;
        healProb = Math.max(0.05, Math.min(0.98, healProb + Number(w.perkModifiers && w.perkModifiers.healBias || 0)));

        // 몬린이 전용 돌발 행동 패턴 (채집 딴짓 20%, 분노 시 공황 도주 35%)
        if (w.personality === 'newbie') {
            const roll = engine.random();
            if (roll < 0.20 && engine.tryConsumeCombatGather?.()) {
                w.itemDuration = 15; // 1.5초 행동 봉쇄
                if (engine.consecutiveTotal > 1 && engine.currentConsecutiveIndex > 0 && engine.random() < 0.5) {
                    const prevMonster = engine.consecutiveQueue[engine.currentConsecutiveIndex - 1];
                    const prevMonsterName = prevMonster ? prevMonster.nameKO : "이전 몬스터";
                    const material = engine.getPreviousMonsterMaterial(prevMonsterName);
                    w.isGathering = true;
                    w.itemDuration = 25; // [FIX] tick 기반 상태 관리로 전환
                    engine.addLog(`😅 [몬린이 딴짓] ${w.hunterName} (${w.name})이(가) 전투 도중 이전 토벌 대상인 [${prevMonsterName}]의 사체로 달려가 갈무리를 시도합니다! (획득: ${material} · 파티 채집 ${engine.combatGatherCount}/3)`, '#c98534');
                    engine.playAudioFile('Unified_SFX/MH - Item Found.mp3', null, .7, { hunterIndex: w.index, action: 'item' });
                    engine.spawnEmojiBubble(w.index, `🏃`);
                    engine.shakeWeapon(w.index, '#c98534');
                } else {
                    const find = HuntHunterTurnExecutor.combatGatherFind(engine.random);
                    w.isGathering = true;
                    w.itemDuration = 25; // [FIX] tick 기반 상태 관리로 전환
                    if (!Array.isArray(w.gatheredMaterials)) w.gatheredMaterials = [];
                    w.gatheredMaterials.push({ kind: find.kind, item: find.item });
                    const reward = HuntHunterTurnExecutor.applyGatherReward(w, find);
                    engine.updateHunterItemUI?.(w);
                    engine.addLog(`${find.emoji} [몬린이 딴짓] ${w.hunterName} (${w.name})이(가) ${find.node}을(를) 채집하느라 한눈을 팝니다! (획득: ${find.item}${reward} · 파티 채집 ${engine.combatGatherCount}/3)`, find.color);
                    engine.playAudioFile('Unified_SFX/MH - Item Found.mp3', null, .7, { hunterIndex: w.index, action: 'item' });
                    engine.spawnEmojiBubble(w.index, find.emoji, { variant: find.visualVariant });
                    engine.shakeWeapon(w.index, find.color);
                }
                return;
            } else if (engine.monsterState === 'enraged' && engine.random() < 0.35) {
                w.itemDuration = 15; // 1.5초 행동 봉쇄
                engine.addLog(`😱 [몬린이 공황] ${w.hunterName} (${w.name})이(가) 몬스터의 분노에 기겁하며 비명을 지르고 도망다닙니다! (무기 해제, 1.5초간 공황)`, '#ff5555');
                engine.playSFX('hunter_cart_voice', null, { hunterIndex: w.index, action: 'cart' });
                engine.spawnEmojiBubble(w.index, `😱`);
                engine.shakeWeapon(w.index, '#ff5555');
                return;
            }
        }

        // Veteran / Support team heal AI (Lifepowder)
        const isHealer = w.personality === 'veteran' || w.personality === 'support'
            || (engine.perkRuntime && engine.perkRuntime.constructor.has(w, '광역 분진'));
        if (isHealer && w.lifepowders && w.lifepowders > 0) {
            const damagedTeammates = engine.selectedWeapons.filter(m => m.status === 'alive' && m.hp <= m.maxHp * 0.55);
            if (damagedTeammates.length > 0) {
                if (!engine.perkRuntime || engine.perkRuntime.shouldConsumeItem(w)) w.lifepowders--;
                engine.updateHunterItemUI?.(w);
                w.itemDuration = engine.perkRuntime ? engine.perkRuntime.itemDuration(w, 15) : 15;
                const powderHeal = engine.perkRuntime ? engine.perkRuntime.healAmount(w, 25) : 25;
                engine.selectedWeapons.forEach(m => {
                    if (m.status === 'alive') {
                        m.hp = Math.min(m.maxHp, m.hp + powderHeal);
                        m.atb = Math.min(100, m.atb + 60);
                        engine.updateHpUI(m);
                        engine.updateWeaponAtbUI(m.index, m.atb);
                    }
                });
                engine.addLog(`🌿 [생명의 가루] ${w.hunterName}이(가) 생명의 가루를 흩뿌려 아군 전체 회복 및 ATB 충전! (+25 HP, +60 ATB)`, '#00ffaa');
                engine.playSFX('lifepowder', null, { hunterIndex: w.index, action: 'support' });
                engine.showSkillBubble(w.index, "🌿 생명의 가루!");
                engine.selectedWeapons.forEach(m => {
                    if (m.status === 'alive') engine.shakeWeapon(m.index, '#00ffaa');
                });
                return;
            }
        }

        // Support Trap or Stonefall AI
        if (w.personality === 'support') {
            // Trapping
            const trapImmune = engine.isMonsterTrapImmune();
            if (!trapImmune
                && engine.monsterTraitRuntime?.canTriggerTrap?.(engine, 'pitfall') !== false
                && engine.monsterState === 'normal'
                && (!w.trapsUsed || w.trapsUsed < 2)) {
                w.trapsUsed = (w.trapsUsed || 0) + 1;
                w.itemDuration = 20;
                const trapEffect = engine.beginMonsterTrapControl('pitfall', 40);
                const trapTicks = trapEffect.durationTicks;
                engine.playSFX?.('monster_trap', null, { monsterId: engine.selectedMonster.id });
                engine.updateMonsterStateUI('구멍함정 상태', `🕸️ 함정에 빠진 ${engine.selectedMonster.nameKO} 🕸`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
                engine.triggerEnvironmentEffect('pitfall', w.index, trapEffect);

                engine.addLog(`🕸️ [함정 설치] ${w.hunterName}이(가) 구멍함정으로 몬스터를 구속했습니다! (${(trapTicks / 10).toFixed(1)}초 · 누적 내성 ${engine.monsterTrapUseCount}단계)`, '#e0ffa3');
                // Verified trap-impact audio will be added when a labelled event is available.
                engine.shakeWeapon(w.index, '#e0ffa3');
                return;
            }
            // Stonefall on elder dragons
            if (trapImmune && (!w.stonesUsed || w.stonesUsed < 2) && engine.random() < 0.6) {
                w.stonesUsed = (w.stonesUsed || 0) + 1;
                w.itemDuration = 20;
                engine.monsterKnockdownDuration = 70;
                engine.monsterState = 'knocked_down';
                engine.monsterAtb = 0;
                engine.updateMonsterAtbUI(0);
                engine.updateMonsterStateUI('낙석 대경직', `💤 낙석에 깔린 ${engine.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
                
                if (engine.callbacks.onTriggerMonsterKnockdownAnim) engine.callbacks.onTriggerMonsterKnockdownAnim();
                engine.triggerEnvironmentEffect('rockfall', w.index);

                engine.addLog(`💥 [낙석격동] ${w.hunterName}이(가) 지형 낙석을 맞춰 몬스터에게 대경직을 유발했습니다! 행동 게이지가 초기화되며 7초간 무력화됩니다.`, '#c98534');
                // Verified rock-impact audio will be added when a labelled event is available.
                engine.shakeWeapon(w.index, '#c98534');
                return;
            }

            // Gather lifepowder if empty
            if ((!w.lifepowders || w.lifepowders === 0) && engine.random() < 0.4 && engine.tryConsumeCombatGather?.()) {
                const find = HuntHunterTurnExecutor.combatGatherFind(engine.random, w.personality);
                if (!Array.isArray(w.gatheredMaterials)) w.gatheredMaterials = [];
                w.gatheredMaterials.push({ kind: find.kind, item: find.item });
                if (find.kind === 'herb') w.lifepowders = 1;
                const flashReward = HuntHunterTurnExecutor.applyGatherReward(w, find);
                engine.updateHunterItemUI?.(w);
                w.atb = 60;
                w.isGathering = true;
                const result = find.kind === 'herb' ? ' · 지원 가루 1개 조제' : flashReward;
                engine.addLog(`${find.emoji} [채집] ${w.hunterName}이(가) ${find.node}에서 ${find.item}을(를) 획득했습니다${result}! (파티 채집 ${engine.combatGatherCount}/3)`, find.color);
                engine.playAudioFile('Unified_SFX/MH - Item Found (rare).mp3', null, .7, { hunterIndex: w.index, action: 'item' });
                engine.spawnEmojiBubble(w.index, find.emoji, { variant: find.visualVariant });
                engine.shakeWeapon(w.index, find.color);
                engine.schedule(() => { w.isGathering = false; }, 2500);
                return;
            }
        }

        // Self potion recovery (몬린이는 80% 이하일 때 95% 확률로 조기/강박적 복용)
        const hpThreshold = w.personality === 'newbie' ? 0.80 : 0.55;
        const currentHealProb = w.personality === 'newbie' ? 0.95 : healProb;
        if (w.hp <= w.maxHp * hpThreshold && w.potions > 0 && engine.random() < currentHealProb) {
            if (!engine.perkRuntime || engine.perkRuntime.shouldConsumeItem(w)) w.potions--;
            w.itemDuration = engine.perkRuntime ? engine.perkRuntime.itemDuration(w, 5) : 5;
            const baseHeal = Math.round(w.maxHp * 0.60);
            const healAmount = engine.perkRuntime ? engine.perkRuntime.healAmount(w, baseHeal) : baseHeal;
            w.hp = Math.min(w.maxHp, w.hp + healAmount);
            if (engine.perkRuntime) engine.perkRuntime.afterPotion(w, healAmount);
            engine.addLog(`🧪 [포션] ${w.hunterName} (${w.name})이(가) 비약을 복용 +${healAmount} HP (남은 물약: ${w.potions}/10)`, '#2eff7b');
            engine.playAudioFile('Unified_SFX/Potion Drink.mp3', null, 2.5, { hunterIndex: w.index, action: 'item' });
            engine.updateHpUI(w);
            engine.updatePotionCountUI(w.index, w.potions);
            engine.showSkillBubble(w.index, `🧪 물약 회복 (+60%)`);
            engine.shakeWeapon(w.index, '#2eff7b');
            return;
        }

        // Ranged reload (몬린이는 잔탄 3발 이하일 때 강박적 재장전)
        const ammoThreshold = w.personality === 'newbie' ? 3 : 0;
        if (w.type === 'ranged' && !engine.weaponMechanics?.managesAmmo(w.id) && w.ammo <= ammoThreshold) {
            const prevAmmo = w.ammo;
            w.ammo = 5;
            w.itemDuration = 12;
            engine.addLog(`🔄 [재장전] ${w.hunterName} (${w.name})이(가) 탄창을 갈고 재장전을 실행합니다. (재장전 전 잔탄: ${prevAmmo}/5)`, '#00a8ff');
            engine.playSFX('reload', null, { weaponId: w.id, hunterIndex: w.index, action: 'item' });
            engine.shakeWeapon(w.index, '#00a8ff');
            return;
        }

        // 전체 막대 비율이 아니라 최고 예리도 색이 닳은 정도를 본다.
        const sharpnessThreshold = typeof HuntWeaponInstanceCatalog !== 'undefined'
            ? HuntWeaponInstanceCatalog.sharpenThreshold(w)
            : Number(w.maxSharpness || 0) * .7;
        const shouldSharpen = typeof HuntWeaponInstanceCatalog !== 'undefined'
            ? HuntWeaponInstanceCatalog.shouldSharpen(w, engine.random)
            : w.sharpness <= sharpnessThreshold;
        if (w.sharpnessProfile && shouldSharpen) {
            const prevSharpness = w.sharpness;
            w.itemDuration = engine.perkRuntime ? engine.perkRuntime.whetstoneDuration(w, 30) : 30;
            w.pendingSharpnessRestore = true;
            w.atb = 0;
            engine.addLog(`🪨 [숫돌질 시작] ${w.hunterName} (${w.name})이(가) 빈틈을 보고 숫돌을 꺼냅니다. (${prevSharpness}/${w.maxSharpness})`, '#c98534');
            engine.playSFX('whetstone', null, {
                hunterIndex: w.index,
                action: 'item',
                item: 'whetstone',
                durationTicks: w.itemDuration
            });
            engine.showSkillBubble(w.index, {
                ...HuntHunterTurnExecutor.WHETSTONE_ITEM_VISUAL,
                durationMs: Math.max(500, Number(w.itemDuration || 0) * 100)
            });
            engine.shakeWeapon(w.index, '#c98534');
            return;
        }
        }

        const monsterTargetable = engine.isMonsterTargetable
            ? engine.isMonsterTargetable()
            : !(engine.monsterBurrowState?.phase === 'underground'
                || engine.monsterTraversalState?.untargetable
                || engine.monsterState === 'valstrax_flying');
        if (!monsterTargetable) {
            const unavailableGeneration = Number(engine.monsterTraversalGeneration || 0);
            if (w.personality === 'newbie'
                && w.lastUnavailableQuestionGeneration !== unavailableGeneration
                && engine.random() < 0.55) {
                w.lastUnavailableQuestionGeneration = unavailableGeneration;
                engine.spawnEmojiBubble(w.index, '❓');
            }
            if (continuingGreatSwordCharge || (w.id === 'gunlance' && w.wyvernFireCharging)) {
                forceUntargetableWhiff = true;
            } else if (w.id === 'hammer' && Number(w.hammerChargeLevel || 0) > 0) {
                const holdChance = {
                    offensive: 0.78, veteran: 0.74, balanced: 0.56,
                    defensive: 0.38, support: 0.34, newbie: 0.50
                }[w.personality] ?? 0.56;
                if (engine.random() < holdChance) {
                    w.atb = actionStartingAtb;
                    engine.updateWeaponAtbUI(w.index, w.atb);
                } else {
                    w.hammerChargeLevel = 0;
                    w.rollDuration = 6;
                    engine.actionStateMachine?.cancel(w, 'evade');
                    engine.callbacks?.onTriggerRollAnimation?.(w.index);
                }
                return;
            } else if (w.id === 'long_sword' && w.specialSheatheReady) {
                w.specialSheatheReady = false;
                w.iaiHelmBreakerReady = false;
                w.rollDuration = 6;
                engine.actionStateMachine?.cancel(w, 'evade');
                engine.callbacks?.onTriggerRollAnimation?.(w.index);
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(w, 'failure');
                return;
            } else {
                w.atb = actionStartingAtb;
                engine.updateWeaponAtbUI(w.index, w.atb);
                return;
            }
        }

        // Check if Valstrax is flying (untargetable)
        if (!continuingGreatSwordCharge && engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_flying') {
            engine.addLog(`💨 [공격 실패] 발파루크가 고공 비행 중이라 ${w.name}의 공격이 공중으로 헛돌았습니다!`, '#aaa');
            engine.shakeWeapon(w.index, '#aaa');
            return;
        }

        // Execute combos
        const combos = engine.COMBO_LIST[w.id] || [];
        const selectedAction = engine.weaponActionSelector
            ? engine.weaponActionSelector.select(w, combos, {
                monsterDowned: engine.monsterState === 'knocked_down',
                // Until a dedicated part-wound state lands, a stun is the verified exposed opening
                // that drives Wilds-style focus strikes without inventing random wounds.
                monsterWounded: Boolean(engine.monsterWoundOpen || engine.monsterState === 'stunned'),
                monsterAtb: engine.monsterAtb,
                monsterState: engine.monsterState
            })
            : { action: combos[w.comboIndex], index: w.comboIndex };
        let currentCombo = selectedAction.action;
        if (w.id === 'great_sword' && currentCombo?.tags?.includes('charge-release')) {
            const chargeVisualLevel = Math.max(1, Math.min(3, Number(w.greatSwordCharge || 1)));
            currentCombo = {
                ...currentCombo,
                name: `${chargeVisualLevel}차지 ${currentCombo.name}`,
                // Mechanics consume greatSwordCharge before the slash is rendered.
                // Preserve only the presentation stage through the release animation.
                chargeVisualLevel
            };
        }
        if (w.id === 'hammer' && currentCombo?.tags?.includes('charge-release')) {
            currentCombo = {
                ...currentCombo,
                // Hammer mechanics consume the stored charge before rendering.
                // Keep the presentation tier on the released swing just like Great Sword.
                chargeVisualLevel: Math.max(1, Math.min(3, Number(w.hammerChargeLevel || 1)))
            };
        }
        if (selectedAction.index >= 0) w.comboIndex = selectedAction.index;
        let isKnockdownAttack = false;

        const bypassKnockdownMaxDmg = Boolean(engine.weaponMechanics && HuntWeaponMechanics.actionsFor(w.id));

        if (engine.monsterState === 'knocked_down' && combos.length > 0 && !bypassKnockdownMaxDmg) {
            let maxDmgCombo = combos[0];
            for (let i = 1; i < combos.length; i++) {
                if (combos[i].name === '기인투구깨기') {
                    if (w.id === 'long_sword' && (w.spiritLevel || 0) < 3) continue;
                }
                // Charge Blade phial/shield checks for knockdown attacks
                if (w.id === 'charge_blade') {
                    const isShieldCharged = w.shieldChargeDuration && w.shieldChargeDuration > 0;
                    const phialCount = w.phials || 0;
                    if (combos[i].name === '초고출력 속성해방베기') {
                        if (!isShieldCharged || phialCount === 0) continue;
                    }
                    if (combos[i].name === '고출력 속성해방베기') {
                        if (phialCount === 0) continue;
                    }
                    if (combos[i].name === '도끼 속성해방베기 I') {
                        if (phialCount === 0) continue;
                    }
                }
                // Insect Glaive cannot use high damage combo without tripleUp buff active
                if (w.id === 'insect_glaive') {
                    const hasTripleUp = w.extractDuration && w.extractDuration > 0;
                    if (!hasTripleUp && combos[i].name !== '진액 추출') continue;
                }
                if (combos[i].dmg > maxDmgCombo.dmg) {
                    maxDmgCombo = combos[i];
                }
            }
            if (maxDmgCombo) {
                currentCombo = maxDmgCombo;
                isKnockdownAttack = true;
            }
        }

        // Dual blades demon mode bypass reload index 0
        if (!engine.weaponMechanics && w.id === 'dual_blades' && w.comboIndex === 0 && w.demonModeDuration > 0) {
            w.comboIndex = 1;
            currentCombo = combos[1] || currentCombo;
        }

        // Long Sword spiritLevel threshold for Helm Breaker
        if (!engine.weaponMechanics && w.id === 'long_sword' && w.comboIndex === 3 && (w.spiritLevel || 0) < 3) {
            w.comboIndex = 0;
            currentCombo = combos[0];
        }

        // Gunlance overheat bypass
        if (!engine.weaponMechanics && w.id === 'gunlance' && w.comboIndex === 3) {
            if (w.overheatDuration && w.overheatDuration > 0) {
                w.comboIndex = 0;
                currentCombo = combos[0];
            }
        }

        // Legacy Charge Blade overrides stay available only without the state-machine runtime.
        if (!engine.weaponMechanics && w.id === 'charge_blade') {
            const isShieldCharged = w.shieldChargeDuration && w.shieldChargeDuration > 0;
            
            // 1. Intercept Move 3 if shield not charged and phials === 5
            if (w.comboIndex === 3 && !isKnockdownAttack) {
                if (!isShieldCharged && (w.phials || 0) === 5) {
                    currentCombo = { name: "방패강화", dmg: 0, sharp: -2 };
                }
            }

            // 2. Downgrade Axe attacks if phials are empty
            if ((w.comboIndex === 4 || w.comboIndex === 5 || w.comboIndex === 6) && (w.phials || 0) === 0) {
                currentCombo = combos[7]; // 변형 (도끼→검)
                w.comboIndex = 7;
            }

            // 3. Downgrade SAED to AED if shield not charged
            if (currentCombo && currentCombo.name === '초고출력 속성해방베기') {
                if (!isShieldCharged) {
                    currentCombo = combos[5];
                }
            }
        }

        // Legacy extract restriction stays available only without the state-machine runtime.
        if (!engine.weaponMechanics && w.id === 'insect_glaive') {
            const hasTripleUp = w.extractDuration && w.extractDuration > 0;
            if (!hasTripleUp) {
                w.comboIndex = 0;
                currentCombo = combos[0];
                isKnockdownAttack = false;
            } else {
                if (w.comboIndex === 0) {
                    w.comboIndex = 1;
                }
                currentCombo = combos[w.comboIndex];
            }
        }

        if (currentCombo && engine.weaponMechanics && engine.weaponMechanics.isPreparation(currentCombo)) {
            if (w.id === 'long_sword') w.longSwordForesightEligible = false;
            if (engine.perkRuntime) currentCombo = engine.perkRuntime.prepareActionEconomy(w, currentCombo);
            const presentation = engine.weaponMechanics.presentationFor?.(w, currentCombo);
            const mechanicResult = engine.weaponMechanics.applyAction(engine, w, currentCombo);
            const preparationCue = HuntHunterTurnExecutor.preparationAudioCue(currentCombo);
            if (preparationCue) {
                engine.playSFX(preparationCue, null, {
                    weaponId: w.id,
                    hunterIndex: w.index,
                    action: 'weapon_preparation',
                    actionId: currentCombo.id,
                    actionName: currentCombo.name,
                    actionTags: currentCombo.tags || []
                });
            }
            if (engine.telemetry) engine.telemetry.recordHunterAction(w.id, currentCombo, 0);
            if (!presentation || presentation.bubble) engine.showSkillBubble(w.index, presentation?.label || currentCombo.name);
            if (engine.shakeWeapon) {
                engine.shakeWeapon(w.index, w.id === 'great_sword' || w.id === 'hammer' ? '#f2d18b' : '#8fd7ff', true, currentCombo);
            }
            currentCombo = { ...currentCombo };
            currentCombo.durationTicks = currentCombo.atbOccupancyTicks || currentCombo.durationTicks || 3;
            if (engine.perkRuntime) currentCombo.durationTicks = engine.perkRuntime.actionDuration(w, currentCombo, currentCombo.durationTicks);
            if (engine.actionStateMachine) engine.actionStateMachine.begin(w, currentCombo);
            else w.attackDuration = currentCombo.durationTicks;
            if (w.id === 'great_sword') w.greatSwordChargeLocked = true;
            if (!continuingGreatSwordCharge) {
                HuntHunterTurnExecutor.spendActionAtb(w, currentCombo, actionStartingAtb, beganInDemonMode);
            }
            engine.updateWeaponAtbUI(w.index, w.atb);
            w.lastActionId = currentCombo.id;
            w.comboIndex = engine.weaponActionSelector
                ? engine.weaponActionSelector.nextIndex(w, combos, currentCombo)
                : (w.comboIndex + 1) % combos.length;
            return;
        }

        if (currentCombo) {
            if (engine.smallMonsterSwarm) {
                engine.smallMonsterSwarm.randomTarget(engine.random);
                engine.callbacks.onUpdateSmallMonsterSwarmUI?.(engine.smallMonsterSwarm.snapshot());
            }
            if (engine.perkRuntime) currentCombo = engine.perkRuntime.prepareActionEconomy(w, currentCombo);
            const presentation = engine.weaponMechanics?.presentationFor?.(w, currentCombo);
            let damage = currentCombo.dmg;

            if (engine.weaponMechanics) {
                damage = Math.floor(damage * engine.weaponMechanics.damageMultiplier(w, currentCombo));
            }

            // Legacy multipliers stay available only without the state-machine runtime.
            if (!engine.weaponMechanics && w.id === 'long_sword') {
                const spiritMults = { 0: 1.0, 1: 1.05, 2: 1.10, 3: 1.20 };
                const mult = spiritMults[w.spiritLevel || 0] || 1.0;
                damage = Math.floor(damage * mult);
            }
            if (!engine.weaponMechanics && w.id === 'dual_blades' && w.demonModeDuration > 0) {
                damage = Math.floor(damage * 1.2);
            }
            if (engine.teamTactic === 'offensive') damage = Math.floor(damage * 1.08);
            else if (engine.teamTactic === 'defensive') damage = Math.floor(damage * 0.95);
            else if (engine.teamTactic === 'support') damage = Math.floor(damage * 0.98);

            // Legacy phial costs stay available only without the state-machine runtime.
            if (!engine.weaponMechanics && w.id === 'charge_blade') {
                if (currentCombo.name === '방패강화') {
                    w.phials = 0;
                    w.shieldChargeDuration = 60;
                    engine.addLog(`🛡️ [방패강화] ${w.hunterName}이(가) 병 5개를 소모하여 차지액스의 방패를 고출력 속성강화 상태로 강화했습니다! (60초간 유지)`, '#e84393');
                    engine.restoreBorder(w.index);
                    engine.updatePhialsUI(w.index, w.phials);
                } else if (currentCombo.name === '병충전') {
                    w.phials = 5;
                    engine.addLog(`⚡ [병충전] ${w.hunterName}이(가) 검 에너지를 병에 주입하여 병 5개를 완전히 장전했습니다!`, '#00a8ff');
                    engine.updatePhialsUI(w.index, w.phials);
                } else if (currentCombo.name === '도끼 속성해방베기 I') {
                    if ((w.phials || 0) > 0) {
                        w.phials--;
                        damage += 70;
                        engine.addLog(`⚡ [병소모] 도끼 속성해방베기 I! 병 1개를 소비하여 속성 추타를 가합니다! (남은 병: ${w.phials}/5)`, '#c98534');
                        engine.updatePhialsUI(w.index, w.phials);
                    }
                } else if (currentCombo.name === '고출력 속성해방베기') {
                    if ((w.phials || 0) > 0) {
                        w.phials--;
                        damage += 100;
                        engine.addLog(`⚡ [병소모] 고출력 속성해방베기! 병 1개를 소비하여 속성 충격파가 추가 폭발합니다! (남은 병: ${w.phials}/5)`, '#c98534');
                        engine.updatePhialsUI(w.index, w.phials);
                    }
                } else if (currentCombo.name === '초고출력 속성해방베기') {
                    const phialsUsed = w.phials || 0;
                    w.phials = 0;
                    damage += phialsUsed * 120;
                    engine.addLog(`💥 [초고출력] 초고출력 속성해방베기! 병 ${phialsUsed}개를 한꺼번에 해방하여 전천후 대폭발을 일으킵니다! (데미지 +${phialsUsed * 120})`, '#ff3333');
                    engine.updatePhialsUI(w.index, w.phials);
                }
            }

            // Gunlance special overheat trigger.
            // Legacy fallback only: weaponMechanics owns overheatDuration via heatGauge.
            if (!engine.weaponMechanics && w.id === 'gunlance' && currentCombo.name === '용격포') {
                w.overheatDuration = 30;
                engine.addLog(`🔥 [용격포] ${w.hunterName}이(가) 용격포를 격발했습니다! 대량의 열기로 인해 30초간 오버히트 상태가 됩니다!`, '#ff5500');
                engine.updateOverheatUI(w.index, w.overheatDuration);
            }

            // Legacy extract mutations stay available only without the state-machine runtime.
            if (!engine.weaponMechanics && w.id === 'insect_glaive') {
                if (currentCombo.name === '진액 추출') {
                    w.extractBuffs = w.extractBuffs || { red: 0, white: 0, orange: 0 }; // [FIX] 안전한 초기화
                    let colorAcquired = "";
                    if (!w.extractBuffs.red) {
                        w.extractBuffs.red = 1;
                        colorAcquired = "빨강";
                    } else if (!w.extractBuffs.white) {
                        w.extractBuffs.white = 1;
                        colorAcquired = "하양";
                    } else if (!w.extractBuffs.orange) {
                        w.extractBuffs.orange = 1;
                        colorAcquired = "주황";
                    }

                    if (colorAcquired) {
                        engine.addLog(`🐝 [진액 획득] ${w.hunterName}이(가) ${colorAcquired} 진액을 획득했습니다!`, '#e0ffa3');
                    }
                    engine.updateExtractsUI(w.index, w.extractBuffs);

                    if (w.extractBuffs.red && w.extractBuffs.white && w.extractBuffs.orange && (!w.extractDuration || w.extractDuration === 0)) {
                        w.extractDuration = 90;
                        engine.addLog(`🐝 [진액 트리플업] ${w.hunterName}이(가) 3색 진액을 모두 획득하여 90초간 공격력이 30% 증가합니다!`, '#c98534');
                        engine.restoreBorder(w.index);
                    }
                }

                if (w.extractDuration && w.extractDuration > 0) {
                    damage = Math.floor(damage * 1.3);
                }
            }

            // Dual Blades Demon Mode activation.
            // Legacy fallback only: weaponMechanics owns demonModeDuration via demonMode.
            if (!engine.weaponMechanics && w.id === 'dual_blades' && currentCombo.name === '귀인화 진입') {
                w.demonModeDuration = 20;
                engine.addLog(`👹 [귀인화 발동] ${w.hunterName}이(가) 20초간 귀인화 상태에 돌입합니다! (공격력 +20%, ATB 수급 +20%)`, '#e74c3c');
                engine.restoreBorder(w.index);
            }

            // Legacy spirit progression stays available only without the state-machine runtime.
            if (!engine.weaponMechanics && w.id === 'long_sword') {
                if (currentCombo.name === '기인베기 II') {
                    w.spiritLevel = Math.min(3, (w.spiritLevel || 0) + 1);
                    engine.addLog(`✨ [기인 연계] ${w.hunterName}이(가) 기인베기 II를 성공시켜 기인 게이지 레벨이 상승했습니다! (현재 레벨: ${w.spiritLevel}/3)`, '#c98534');
                    engine.restoreBorder(w.index);
                } else if (currentCombo.name === '기인투구깨기') {
                    w.spiritLevel = Math.max(0, (w.spiritLevel || 0) - 1);
                    engine.addLog(`💥 [기인투구깨기] ${w.hunterName}이(가) 공중에서 내리치며 기인투구깨기를 시전했습니다! 기인 게이지 레벨 1 소모! (현재 레벨: ${w.spiritLevel}/3)`, '#e74c3c');
                    engine.restoreBorder(w.index);
                }
            }

            const mechanicResult = engine.weaponMechanics
                ? engine.weaponMechanics.applyAction(engine, w, currentCombo)
                : { atbAfterAction: 0 };

            // Data-driven perk modifiers preserve autobattler behavior without bypassing action locks.
            const perkModifiers = w.perkModifiers || {};
            damage = Math.floor(damage * Number(perkModifiers.attackRate || 1));
            if (w.hp <= w.maxHp * 0.35) damage = Math.floor(damage * Number(perkModifiers.lowHpAttack || 1));
            if (engine.monsterState === 'enraged') damage = Math.floor(damage * Number(perkModifiers.enragedAttack || 1));
            if (engine.perkRuntime) damage = engine.perkRuntime.outgoingDamage(w, currentCombo, damage);

            // Motion values were authored for the former one-action-per-full-gauge
            // cadence. Normalize damage by ATB commitment so a 0.5-second jab
            // cannot gain ten times the DPS merely by recycling ten times faster.
            damage = Math.max(1, Math.floor(damage * HuntHunterTurnExecutor.atbDamageScale(currentCombo)));

            if (w.sharpnessProfile && typeof HuntWeaponInstanceCatalog !== 'undefined') {
                damage = Math.max(1, Math.floor(damage * HuntWeaponInstanceCatalog.rawMultiplier(w)));
            }

            // Sharpness/Ammo loss on strike
            let isDull = false;
            if (w.sharpnessProfile && Number(w.sharpness || 0) <= Number(w.maxSharpness || 1) * 0.30) {
                damage = Math.floor(damage * 0.5);
                isDull = true;
            }

            if (w.type === 'ranged' && !engine.weaponMechanics?.managesAmmo(w.id)) {
                const ammoCost = engine.perkRuntime ? engine.perkRuntime.ammoCost(w, currentCombo.ammo || 1) : (currentCombo.ammo || 1);
                w.ammo = Math.max(0, w.ammo - ammoCost);
            } else if (w.type !== 'ranged') {
                const sharpnessCost = engine.perkRuntime ? engine.perkRuntime.sharpnessCost(w, currentCombo.sharp || 5) : (currentCombo.sharp || 5);
                w.sharpness = Math.max(0, w.sharpness - sharpnessCost);
            }

            if (forceUntargetableWhiff) {
                engine.weaponMechanics?.onAttackMiss?.(engine, w, currentCombo);
                engine.playSFX(currentCombo.audioCue || 'slash_light', null, {
                    weaponId: w.id,
                    hunterIndex: w.index,
                    action: 'miss',
                    actionId: currentCombo.id,
                    actionName: currentCombo.name,
                    actionTags: currentCombo.tags || []
                });
                engine.shakeWeapon(w.index, '#a9b8c7', true, currentCombo);
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(w, 'failure', currentCombo);
                if (engine.telemetry) engine.telemetry.recordHunterAction(w.id, currentCombo, 0);
                engine.updateSharpnessUI(w.index, w);
                HuntHunterTurnExecutor.completeAction(engine, w, currentCombo, {
                    attackTicks: Number(currentCombo.durationTicks || 10),
                    continuingGreatSwordCharge,
                    actionStartingAtb,
                    beganInDemonMode,
                    isKnockdownAttack,
                    combos
                });
                return;
            }

            if (engine.monsterFlightRuntime?.shouldEvade(engine, w, currentCombo)) {
                engine.weaponMechanics?.onAttackMiss?.(engine, w, currentCombo);
                engine.addLog(`🪽 [공중 회피] ${engine.selectedMonster.nameKO}이(가) 비행 기동으로 ${w.hunterName}의 공격을 피했습니다!`, '#8fdcff');
                engine.showSkillBubble('monster', '🪽 공중 회피!');
                engine.shakeWeapon(w.index, '#8fdcff');
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(w, 'failure', currentCombo);
                if (engine.telemetry) engine.telemetry.recordHunterAction(w.id, currentCombo, 0);
                engine.updateSharpnessUI(w.index, w);
                return;
            }

            const hitChance = Math.min(0.99,
                HuntHunterTurnExecutor.BASE_HIT_CHANCE + Number(w.perkModifiers?.hitChance || 0));
            if (engine.random() >= hitChance) {
                engine.weaponMechanics?.onAttackMiss?.(engine, w, currentCombo);
                engine.addLog(`💨 [빗나감] ${w.hunterName}의 ${presentation?.label || currentCombo.name}이(가) 빗나갔습니다!`, '#a9b8c7');
                engine.showSkillBubble(w.index, '💨 빗나감!');
                engine.shakeWeapon(w.index, '#a9b8c7', true, currentCombo);
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(w, 'failure', currentCombo);
                if (engine.telemetry) engine.telemetry.recordHunterAction(w.id, currentCombo, 0);
                HuntHunterTurnExecutor.completeAction(engine, w, currentCombo, {
                    attackTicks: Number(currentCombo.durationTicks || 10),
                    continuingGreatSwordCharge,
                    actionStartingAtb,
                    beganInDemonMode,
                    isKnockdownAttack,
                    combos
                });
                return;
            }

            engine.weaponMechanics?.onConfirmedHit?.(engine, w, currentCombo);
            const partResult = engine.recordMonsterPartDamage ? engine.recordMonsterPartDamage(w, damage, currentCombo) : null;
            const bounce = partResult && typeof HuntWeaponInstanceCatalog !== 'undefined'
                ? HuntWeaponInstanceCatalog.bounceCheck(w, partResult.hitzone, currentCombo)
                : { bounced: false };
            if (bounce.bounced) {
                const needed = bounce.requiredColor ? ` · ${bounce.requiredColor} 필요` : '';
                engine.addLog(`⚔️ [튕김] ${w.hunterName}의 ${bounce.color} 예리도가 ${partResult.part.kind} 육질을 뚫지 못했습니다${needed}.`, '#f4d942');
                engine.showSkillBubble(w.index, `⚔️ 튕김!${needed}`);
                engine.shakeWeapon(w.index, HuntWeaponInstanceCatalog.colorHex(bounce.color));
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(w, 'failure', currentCombo);
                w.atb = 0;
                const extraWear = engine.perkRuntime ? engine.perkRuntime.sharpnessCost(w, currentCombo.sharp || 5) : (currentCombo.sharp || 5);
                w.sharpness = Math.max(0, w.sharpness - extraWear);
            }

            // Apply Damage to Monster
            let targetUnit = null;
            if (engine.smallMonsterSwarm) {
                targetUnit = engine.smallMonsterSwarm.currentTarget();
                if (targetUnit) damage = Math.min(damage, targetUnit.hp);
            }
            engine.monsterHp = Math.max(0, engine.monsterHp - damage);
            if (engine.monsterFlightRuntime) engine.monsterFlightRuntime.onHunterDamage(engine, w, damage);
            if (engine.perkRuntime) engine.perkRuntime.afterDamage(w, damage);
            if (engine.telemetry) engine.telemetry.recordHunterAction(w.id, currentCombo, damage);
            engine.updateMonsterHpUI();

            if (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_charging') {
                engine.valstraxChargeDmg += damage;
                if (engine.monsterHp > 0 && engine.valstraxChargeDmg >= engine.monsterMaxHp * 0.10) {
                    engine.triggerValstraxChargeInterrupt();
                }
            }

            // Stun values accumulation
            if (currentCombo.stun && currentCombo.stun > 0) {
                if (engine.addMonsterStun) engine.addMonsterStun(w, currentCombo.stun, partResult);
            }

            // Check monster knockdown milestones
            engine.checkMonsterKnockdown();

            // Weapon sounds are semantic layered cues, never unrelated chat signatures.
            engine.playSFX(currentCombo.audioCue || 'slash_light', null, {
                weaponId: w.id,
                hunterIndex: w.index,
                actionId: currentCombo.id,
                actionName: currentCombo.name,
                actionTags: currentCombo.tags || []
            });

            if (isKnockdownAttack) {
                engine.addLog(`✨ [대경직 찬스!] ${w.name}이(가) 최강 기술 [${currentCombo.name}] 시전! (-${damage} HP)`, '#ff9500');
            } else if (isDull) {
                engine.addLog(`⚔️ [무딘 벰] ${w.name}이(가) 예리도 소모 상태로 공격을 가해 피해가 반감되었습니다! (-${damage} HP)`, '#aaaaaa');
            } else if (!presentation || presentation.log) {
                const displayName = presentation?.label || currentCombo.name;
                engine.addLog(`⚔️ [${displayName}] ${w.name}의 공격이 몬스터를 타격했습니다! (-${damage} HP)`, '#eee');
            }

            // Fast Sword & Shield links remain internally precise but only spectacle beats reach OBS.
            if (!presentation || presentation.bubble) engine.showSkillBubble(w.index, presentation?.label || currentCombo.name);

            engine.shakeMonster();
            engine.shakeWeapon(w.index, '#ff9500', true, currentCombo, false, {
                resolved: true,
                hitzoneValue: Number(partResult?.hitzone ?? 45),
                weaponType: w.type === 'ranged' ? 'ranged' : undefined,
                bounced: bounce.bounced === true,
                damage,
                partKind: partResult?.part?.kind || null,
                targetUnitIndex: Number.isInteger(targetUnit?.index) ? targetUnit.index : null
            });
            if (!bounce.bounced && engine.expressHunterEmotion) {
                engine.expressHunterEmotion(w, 'success', currentCombo);
            }

            // Set attack duration based on the shared combat timeline (ATB pauses during attack).
            let attackTicks = 10; // Default 1.0s
            if (isKnockdownAttack) {
                attackTicks = 18; // Heavy knockdown attack takes 1.8s
            } else if (currentCombo.name && (
                currentCombo.name.includes('초고출력') || 
                currentCombo.name.includes('고출력') || 
                currentCombo.name.includes('투구깨기') || 
                currentCombo.name.includes('용격포') || 
                currentCombo.name.includes('참모아') ||
                currentCombo.name.includes('공중회전난무') ||
                currentCombo.name.includes('리와이베기') ||
                currentCombo.name.includes('공중 회전')
            )) {
                attackTicks = 18; // Special/heavy attacks take 1.8s
            }
            // Animation ownership and ATB recovery are independent: the motion
            // still has to finish, while the spent shared ATB budget recovers.
            currentCombo = HuntHunterTurnExecutor.completeAction(engine, w, currentCombo, {
                attackTicks,
                continuingGreatSwordCharge,
                actionStartingAtb,
                beganInDemonMode,
                isKnockdownAttack,
                combos
            });
        }
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntHunterTurnExecutor;
else if (typeof window !== 'undefined') window.HuntHunterTurnExecutor = HuntHunterTurnExecutor;
