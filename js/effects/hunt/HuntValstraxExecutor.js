class HuntValstraxExecutor {
    static personalityProfiles() {
        if (typeof HuntPersonalityProfiles !== 'undefined') return HuntPersonalityProfiles;
        if (typeof require === 'function') return require('./HuntPersonalityProfiles.js');
        return null;
    }
    static executeChargeSuccess(engine) {
        engine.monsterAtb = 0;
        engine.updateMonsterAtbUI(0);
        engine.valstraxChargeCount++;
        
        if (engine.valstraxChargeCount >= 3) {
            engine.monsterState = 'enraged';
            engine.monsterUltimateUsedInRage = false;
            engine.valstraxEnrageTimer = 0;
            engine.monsterSpeed = engine.getMonsterSpeedForState('enraged');
            engine.updateMonsterStateUI('분노 상태', `😡 분노한 ${engine.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
            engine.triggerMonsterRoarFlinch(false);
            engine.addLog(`🔥 [분노] 발파루크가 3회의 흡기를 성공하여 전신이 붉게 폭발하며 분노 상태로 돌입합니다! (속도 1.5배, 공격력 1.5배)`, '#ff3b30');
            engine.shakeMonster();
            
            // Reset charging state trackers
            engine.valstraxChargeCount = 0;
            engine.valstraxChargeDmg = 0;
            engine.valstraxChargeTimer = 0;
        } else {
            engine.monsterState = 'normal';
            engine.valstraxChargeTimer = 0;
            engine.monsterSpeed = engine.getMonsterSpeedForState('normal');
            engine.updateMonsterStateUI('일반 상태', engine.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
            engine.addLog(`⚡ [시동 성공] 발파루크가 기 모으기 흡기에 성공했습니다! (현재 성공: ${engine.valstraxChargeCount}/3, 누적 시동 데미지: ${Math.round(engine.valstraxChargeDmg)} / ${Math.round(engine.monsterMaxHp * 0.10)})`, '#eee');
        }
    }

    static triggerChargeInterrupt(engine) {
        engine.monsterKnockdownDuration = 70;
        engine.monsterStunDuration = 0;
        engine.monsterState = 'knocked_down';
        engine.monsterAtb = 0;
        engine.updateMonsterAtbUI(0);
        engine.updateMonsterStateUI('대경직 상태', `💤 대경직에 쓰러진 ${engine.selectedMonster.nameKO} 💤`, { color: '#ff9500', bg: 'rgba(255,149,0,0.1)' });
        
        engine.valstraxChargeCount = 0;
        engine.valstraxChargeDmg = 0;
        engine.valstraxChargeTimer = 0;

        if (engine.callbacks.onTriggerMonsterKnockdownAnim) engine.callbacks.onTriggerMonsterKnockdownAnim();
        
        engine.addLog(`💤 [시동 저지] 헌터들의 집중 포화로 발파루크의 시동 흡기가 저지되었습니다! 대경직에 쓰러집니다. (시동 횟수 및 누적 데미지 리셋)`, '#ff9500');
    }

    static executeAmbushLanding(engine) {
        if (engine.monsterUltimateUsedInRage) return false;
        engine.monsterUltimateUsedInRage = true;
        engine.addLog(`☄️ [붉은 혜성 강습] 발파루크가 화면 밖에서 지상으로 추락해 전장 전체를 뒤엎는 대폭발을 일으킵니다!`, '#ff3333');
        engine.playSFX('monster_attack', null, {
            monsterId: engine.selectedMonster.id,
            patternId: 'valstrax_ambush_landing',
            patternName: '붉은 혜성 강습',
            patternType: 'ultimate'
        });
        engine.shakeMonster();

        const Rules = typeof HuntMonsterRules !== 'undefined'
            ? HuntMonsterRules
            : (typeof require === 'function' ? require('./HuntMonsterRules.js') : null);
        const targets = engine.selectedWeapons.filter(w => Rules
            ? Rules.isHunterTargetable(engine, w)
            : (w.status === 'alive' || w.status === 'stunned'));
        const attackResults = [];

        targets.forEach(target => {
            if (HuntMonsterTurnExecutor.isHunterImpactImmune(target, {
                resolveCounterAttempt: true
            })) {
                attackResults.push({ index: target.index, result: 'invulnerable' });
                return;
            }
            // Signature Ambush is a 90%-max-HP whole-party strike before defenses.
            let damage = Math.max(1, Math.floor(target.maxHp * 0.90));

            // Normal Guard/Evade rolls
            const defendRoll = engine.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;
            let isIaiCounter = false;
            const actionMachine = engine.actionStateMachine;

            const isStunned = target.status === 'stunned';
            const actionAllowsGuard = !actionMachine || actionMachine.canGuard(target);
            const hasShield = !isStunned && actionAllowsGuard
                && (target.type === 'shield' || target.id === 'heavy_bowgun');
            const profiles = HuntValstraxExecutor.personalityProfiles();
            let guardProb = isStunned ? 0 : (profiles?.chance(target, 'guard') ?? .85);
            let dodgeProb = isStunned ? 0 : (profiles?.chance(target, 'evade') ?? .75);

            let foresightProb = HuntMonsterTurnExecutor.longSwordForesightChance(target);

            const actionAllowsEvade = !actionMachine || actionMachine.canEvade(target);
            // Every weapon keeps its signature counter against the ambush ultimate,
            // via the same repertoire the standard monster turn uses. Valstrax has no
            // separate iai window, so its iai success shares the foresight roll.
            const counter = HuntMonsterTurnExecutor.resolveHunterCounter(engine, target, damage, {
                defendRoll, actionAllowsEvade, perkModifiers: target.perkModifiers,
                iaiCounterProb: foresightProb, foresightProb, isStunned,
                pattern: { id: 'valstrax.ambush_landing', tags: ['ultimate'] }
            });
            if (counter.handled) {
                ({ damage, isGuard, isDodge, isForesightSlash, isIaiCounter } = counter);
                if (counter.counterAttempted && !counter.counterSucceeded) {
                    HuntMonsterTurnExecutor.clearCounterInvulnerability(target);
                } else if (counter.counterProtected) {
                    HuntMonsterTurnExecutor.grantCounterInvulnerability(target);
                }
            } else if (hasShield && defendRoll < guardProb) {
                damage = Math.max(1, Math.floor(damage * 0.08));
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                damage = 0;
                isDodge = true;
            }
            if (engine.perkRuntime) {
                if (isGuard) damage = engine.perkRuntime.guardedDamage(target, damage);
                damage = engine.perkRuntime.incomingDamage(target, damage, {
                    pattern: { id: 'valstrax.ambush_landing', tags: ['ultimate'] }, isUltimate: true
                });
            }

            if (damage > 0) {
                if (!isGuard && !isDodge) engine.interruptHunterItemAction?.(target, 'hit');
                // Moxie check
                if (target.hp - damage <= 0 && target.hasMoxie && engine.random() < 0.75) {
                    target.hp = 1;
                    target.hasMoxie = false;
                    target.atb = 0;
                    engine.updateWeaponAtbUI(target.index, 0);
                    engine.addLog(`🔥 [근성 발휘!] ${target.name}이(가) 발파루크의 혜성 습격 폭발 속에서 근성으로 1 HP 생존했습니다!`, '#c98534');
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'guard' });
                    engine.shakeWeapon(target.index, '#00ffa3');
                    attackResults.push({ index: target.index, result: 'hit' });
                } else {
                    target.hp = Math.max(0, target.hp - damage);
                    if (isGuard) {
                        engine.addLog(`🛡️ [방패 가드] ${target.name}이(가) 혜성 습격 폭발을 방어해냈습니다! (-${damage} HP)`, '#00ffff');
                        engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'guard' });
                        engine.shakeWeapon(target.index, '#00ffff');
                        engine.presentHunterImpact?.(target.index, 'guard');
                        target.guardDuration = 6;
                        attackResults.push({ index: target.index, result: 'guard' });
                    } else {
                        // Direct impact replaces ear-covering, tremor, and wind
                        // reactions so the knockback animation remains visible.
                        engine.clearHunterInterference?.(target, 'hit');
                        if (engine.weaponMechanics) engine.weaponMechanics.onHit(target);
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                        const hitReaction = { kind: 'strong', durationTicks: 40, knockbackDirection: target.index < 2 ? -1 : 1 };
                        target.hitDuration = hitReaction.durationTicks;
                        target.hitRecoveryTotalTicks = hitReaction.durationTicks;
                        target.hitStartedThisTick = true;
                        target.hitReactionKind = hitReaction.kind;
                        target.hitKnockbackDirection = hitReaction.knockbackDirection;
                        engine.addLog(`💥 [피격] ${target.name}이(가) 혜성 습격 직격! 치명적인 데미지를 입었습니다. (-${damage} HP)`, '#ff5555');
                        engine.presentHunterImpact?.(target.index, 'hit', { reaction: hitReaction });
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
            } else {
                if (isIaiCounter) {
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'counter' });
                    engine.restoreBorder(target.index);
                } else if (isForesightSlash) {
                    engine.addLog(`⚡ [간파베기] ${target.name}이(가) 혜성 습격 폭발을 간파베기로 흘려넘겼습니다! (현재 기인 게이지 레벨: ${target.spiritLevel}/3)`, '#c98534');
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'guard' });
                    engine.showSkillBubble(target.index, "간파베기!");
                    engine.restoreBorder(target.index);
                    engine.shakeWeapon(target.index, '#c98534', true, { id: 'long_sword.foresight' });
                } else {
                    engine.addLog(`🌀 [회피] ${target.name}이(가) 혜성 습격을 프레임 회피로 피했습니다!`, '#2eff7b');
                    engine.playSFX('hunter_evade', null, { hunterIndex: target.index, action: 'evade' });
                    engine.shakeWeapon(target.index, '#2eff7b', false, null, true);
                }
                engine.presentHunterImpact?.(target.index, 'dodge');
                target.rollDuration = 6;
                attackResults.push({ index: target.index, result: 'dodge' });
            }

            // Sharpness/Ammo loss on hit
            if (damage > 0 && !isDodge) {
                if (target.type === 'ranged') {
                    target.ammo = Math.max(0, target.ammo - 1);
                } else {
                    target.sharpness = Math.max(0, target.sharpness - 8);
                }
            }

            engine.updateHpUI(target);

            // Faint check
            if (target.hp <= 0) {
                engine.triggerHunterCart(target);
            }
        });

        // Trigger dynamic monster attack animation on UI
        if (engine.callbacks.onTriggerMonsterAttack) {
            engine.callbacks.onTriggerMonsterAttack('physical', '☄️', attackResults, '붉은 혜성 강습', {
                id: 'valstrax.crimson_comet_ambush', type: 'ultimate', tags: ['ultimate', 'physical', 'whole-party']
            });
        }

        // Ambush lands back into rage; its next launch gets a fresh, readable interval.
        engine.monsterState = 'enraged';
        engine.valstraxEnrageTimer = 0;
        engine.valstraxChargeTimer = 0;
        engine.valstraxChargeCount = 0;
        engine.valstraxChargeDmg = 0;
        engine.updateMonsterFlightUI?.(false);
        engine.monsterSpeed = engine.getMonsterSpeedForState('enraged');
        engine.updateMonsterStateUI('분노 상태', `😡 분노한 ${engine.selectedMonster.nameKO} 😡`, { color: '#ff3b30', bg: 'rgba(255,59,48,0.1)' });
        engine.addLog(`🔥 발파루크가 혜성 충돌 후에도 붉은 용기를 분출하며 분노 상태를 유지합니다.`, '#ff5a67');
    }
}
