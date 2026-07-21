class HuntHunterTurnExecutor {
    static combatGatherFind(random = Math.random, personality = 'normal') {
        const finds = [
            { kind: 'herb', node: '풀꽃', item: '약초', emoji: '🌿', color: '#aaffaa' },
            { kind: 'ore', node: '광맥', item: '마카라이트광석', emoji: '⛏️', color: '#8fd8ff' },
            { kind: 'ore', node: '광맥', item: '드래그라이트광석', emoji: '💎', color: '#83bfff' },
            { kind: 'mushroom', node: '버섯 군락', item: '푸른버섯', emoji: '🍄', color: '#c59cff' },
            { kind: 'mushroom', node: '버섯 군락', item: '니트로버섯', emoji: '🍄', color: '#ff9b68' },
            { kind: 'insect', node: '곤충 채집 포인트', item: '뇌광충', emoji: '🪲', color: '#f5e96b' },
            { kind: 'insect', node: '곤충 채집 포인트', item: '광충', emoji: '🦋', color: '#fff3a3' },
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
        if (action?.audioCue && action.audioCue !== 'none') return action.audioCue;
        const id = String(action?.id || '');
        if (/^bow\.draw_/.test(id)) return null;
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
        w.atb = 0;

        if (engine.hunterCommandQueue && engine.hunterCommandQueue.tryExecute(engine, w)) return;

        if (engine.perkRuntime && engine.perkRuntime.trySpecialAction(w)) return;

        const trapImmuneMonster = engine.isMonsterTrapImmune();
        if (Number(w.shockTraps || 0) > 0 && !trapImmuneMonster && engine.monsterFlightState !== 'airborne'
            && engine.monsterState === 'normal' && engine.monsterAtb >= 60) {
            w.shockTraps--;
            engine.updateHunterItemUI?.(w);
            w.itemDuration = 12;
            const trapTicks = engine.consumeTrapDuration(40);
            engine.pendingMonsterAction = null;
            engine.monsterState = 'knocked_down';
            engine.monsterKnockdownDuration = Math.max(Number(engine.monsterKnockdownDuration || 0), trapTicks);
            engine.monsterAtb = 0;
            engine.updateMonsterAtbUI(0);
            engine.updateMonsterStateUI('마비함정', `⚡ 마비함정에 걸린 ${engine.selectedMonster.nameKO} ⚡`, { color: '#ffe66d', bg: 'rgba(255,230,80,.14)' });
            engine.triggerEnvironmentEffect('shocktrap', w.index);
            engine.callbacks?.onTriggerMonsterKnockdownAnim?.();
            engine.addLog(`⚡ [마비함정] ${w.hunterName}이(가) 뇌광충으로 만든 덫을 설치했습니다! (${(trapTicks / 10).toFixed(1)}초 · 누적 내성 ${engine.monsterTrapUseCount}단계)`, '#ffe66d');
            return;
        }

        const shouldFlash = Number(w.flashPods || 0) > 0
            && (engine.monsterFlightState === 'airborne' || engine.monsterAtb >= 80 || engine.pendingMonsterAction);
        if (shouldFlash) {
            w.flashPods--;
            w.itemDuration = 8;
            engine.pendingMonsterAction = null;
            engine.monsterAtb = 0;
            engine.updateMonsterAtbUI(0);
            const wasAirborne = engine.monsterFlightState === 'airborne';
            if (wasAirborne && engine.monsterFlightRuntime) {
                engine.monsterFlightRuntime.land(engine, true);
                engine.monsterState = 'knocked_down';
                engine.monsterKnockdownDuration = Math.max(Number(engine.monsterKnockdownDuration || 0), 70);
                engine.updateMonsterStateUI('섬광 격추', `✨ 섬광에 추락한 ${engine.selectedMonster.nameKO} ✨`, { color: '#fff3a3', bg: 'rgba(255,245,170,.14)' });
                engine.callbacks?.onTriggerMonsterKnockdownAnim?.();
            } else {
                engine.monsterRecoveryDuration = Math.max(Number(engine.monsterRecoveryDuration || 0), 25);
            }
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
                    engine.spawnEmojiBubble(w.index, find.emoji);
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
            if (!trapImmune && engine.monsterState === 'normal' && (!w.trapsUsed || w.trapsUsed < 2)) {
                w.trapsUsed = (w.trapsUsed || 0) + 1;
                w.itemDuration = 20;
                const trapTicks = engine.consumeTrapDuration(40);
                engine.monsterKnockdownDuration = trapTicks;
                engine.monsterState = 'knocked_down';
                engine.monsterAtb = 0;
                engine.updateMonsterAtbUI(0);
                engine.updateMonsterStateUI('구멍함정 상태', `🕸️ 함정에 빠진 ${engine.selectedMonster.nameKO} 🕸`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
                
                if (engine.callbacks.onTriggerMonsterKnockdownAnim) engine.callbacks.onTriggerMonsterKnockdownAnim();
                engine.triggerEnvironmentEffect('pitfall', w.index);

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
                engine.spawnEmojiBubble(w.index, find.emoji);
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
            // No verified whetstone sound is mapped yet; a wrong combine-item
            // jingle is more distracting than a deliberately silent action.
            engine.shakeWeapon(w.index, '#c98534');
            return;
        }

        // Check if Valstrax is flying (untargetable)
        if (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_flying') {
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
            currentCombo = { ...currentCombo, name: `${Math.max(1, Number(w.greatSwordCharge || 1))}차지 ${currentCombo.name}` };
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
            w.atb = Math.max(w.atb, Number(mechanicResult.atbAfterAction || 0));
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

            if (engine.monsterFlightRuntime?.shouldEvade(engine, w, currentCombo)) {
                engine.addLog(`🪽 [공중 회피] ${engine.selectedMonster.nameKO}이(가) 비행 기동으로 ${w.hunterName}의 공격을 피했습니다!`, '#8fdcff');
                engine.showSkillBubble('monster', '🪽 공중 회피!');
                engine.shakeWeapon(w.index, '#8fdcff');
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(w, 'failure', currentCombo);
                if (engine.telemetry) engine.telemetry.recordHunterAction(w.id, currentCombo, 0);
                engine.updateSharpnessUI(w.index, w);
                return;
            }

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
            if (engine.smallMonsterSwarm) {
                const targetUnit = engine.smallMonsterSwarm.currentTarget();
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
            engine.shakeWeapon(w.index, '#ff9500', true, currentCombo);
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
            // The action timeline is part of the ATB cycle: ATB remains paused for
            // the measured/estimated occupancy before it can begin filling again.
            currentCombo = { ...currentCombo };
            currentCombo.durationTicks = currentCombo.atbOccupancyTicks || currentCombo.durationTicks || attackTicks;
            if (engine.perkRuntime) currentCombo.durationTicks = engine.perkRuntime.actionDuration(w, currentCombo, currentCombo.durationTicks);
            if (engine.actionStateMachine) engine.actionStateMachine.begin(w, currentCombo);
            else w.attackDuration = attackTicks;
            w.atb = Math.max(w.atb, Number(mechanicResult.atbAfterAction || 0));
            engine.updateWeaponAtbUI(w.index, w.atb);

            // Advance combo index (except during knockdown)
            if (!isKnockdownAttack) {
                w.lastActionId = currentCombo.id;
                w.comboIndex = engine.weaponActionSelector
                    ? engine.weaponActionSelector.nextIndex(w, combos, currentCombo)
                    : (w.comboIndex + 1) % combos.length;
            }
        }
    }
}
