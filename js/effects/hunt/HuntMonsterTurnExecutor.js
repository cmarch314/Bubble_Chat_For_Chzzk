class HuntMonsterTurnExecutor {
    static execute(engine) {
        engine.monsterAtb = 0;
        const targetable = engine.selectedWeapons.filter(w => w.status === 'alive');
        if (targetable.length === 0) return;

        const monsterKey = engine.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
        const list = engine.MONSTER_PATTERNS[monsterKey] || engine.MONSTER_PATTERNS[engine.selectedMonster.id] || engine.MONSTER_PATTERNS.default;
        const pattern = engine.monsterPatternSelector
            ? engine.monsterPatternSelector.select(engine.selectedMonster, list, {
                state: engine.monsterState,
                hpRatio: engine.monsterHp / engine.monsterMaxHp
            })
            : list[Math.floor(engine.random() * list.length)];
        if (!pattern) return;
        const attackName = pattern.name;

        if (pattern.type === 'roar') {
            if (engine.telemetry) engine.telemetry.recordMonsterPattern(engine.selectedMonster.id, pattern, 'roar', 0);
            engine.triggerMonsterRoarFlinch(false);
            engine.monsterRecoveryDuration = pattern.recoveryTicks || 8;
            return;
        }

        const maxTargets = Math.min(pattern.maxTargets || 1, targetable.length);
        const minTargets = Math.min(pattern.minTargets || 1, maxTargets);
        const numTargets = minTargets + Math.floor(engine.random() * (maxTargets - minTargets + 1));
        const shuffledTargets = [...targetable].sort(() => engine.random() - 0.5);
        const targetsToHit = shuffledTargets.slice(0, numTargets);

        engine.showSkillBubble('monster', attackName);

        // Charge trigger
        const isChargeAttack = attackName.includes('돌진') || attackName.includes('급습') || attackName.includes('휩쓸기') || attackName.includes('강습') || attackName.includes('활공') || attackName.includes('진격') || attackName.includes('습격') || attackName.includes('들이받기');
        if (isChargeAttack) {
            if (engine.callbacks.onTriggerMonsterCharge) engine.callbacks.onTriggerMonsterCharge();
        }

        let dmgMod = 1.0;
        if (engine.monsterState === 'enraged') dmgMod = 1.5;
        else if (engine.monsterState === 'exhausted') dmgMod = 0.5;

        const attackResults = [];

        targetsToHit.forEach(target => {
            let baseDmg = Math.max(1, Math.floor(target.maxHp * Number(pattern.damageRatio || 0.22)));
            let damage = Math.floor(baseDmg * dmgMod * (engine.monsterDamageMod || 1.0));
            if (engine.teamTactic === 'defensive') damage = Math.max(1, Math.floor(damage * 0.88));
            else if (engine.teamTactic === 'offensive') damage = Math.max(1, Math.floor(damage * 1.05));

            const actionMachine = engine.actionStateMachine;

            // Great Sword tackle is now a real counter window, never an implicit combo-index bonus.
            const isGreatSwordTackling = target.id === 'great_sword'
                && actionMachine
                && actionMachine.canCounter(target, 'tackle');
            if (isGreatSwordTackling) {
                damage = Math.floor(damage * 0.5);
                target.hp = Math.max(0, target.hp - damage);

                const counterDmg = 90;
                const counterStun = 70;
                engine.monsterHp = Math.max(0, engine.monsterHp - counterDmg);
                engine.monsterStunAccum += counterStun;
                engine.updateMonsterHpUI();

                if (engine.selectedMonster.id.includes('valstrax') && engine.monsterState === 'valstrax_charging') {
                    engine.valstraxChargeDmg += counterDmg;
                    if (engine.monsterHp > 0 && engine.valstraxChargeDmg >= engine.monsterMaxHp * 0.10) {
                        engine.triggerValstraxChargeInterrupt();
                    }
                }

                // Stun check
                if (engine.monsterHp > 0) {
                    if (engine.monsterStunAccum >= engine.monsterStunThreshold && engine.monsterStunDuration <= 0) {
                        engine.monsterStunDuration = 60;
                        engine.monsterState = 'stunned';
                        engine.monsterAtb = 0;
                        engine.updateMonsterAtbUI(0);
                        engine.updateMonsterStateUI('기절 상태', `💫 기절한 ${engine.selectedMonster.nameKO} 💫`, { color: '#e58e26', bg: 'rgba(229,142,38,0.1)' });
                        // engine.playSFX('mh_stun.mp3', '격추');
                        engine.addLog(`💫 [기절] ${engine.selectedMonster.nameKO}이(가) ${target.name}의 강한 타격을 머리에 입고 기절했습니다! 행동 게이지가 초기화되며 6초간 무력화됩니다.`, '#e58e26');
                    }
                }

                // Knockdown check
                engine.checkMonsterKnockdown();

                engine.addLog(`🛡️ [태클 카운터] ${target.name}이(가) 태클로 공격을 맞받아쳐 피해를 50% 경감하고 다음 모으기 연계로 진입합니다! (-${damage} HP, 반사 피해: -${counterDmg} HP, 기절치 +${counterStun})`, '#ff9500');
                engine.updateHpUI(target);
                engine.shakeWeapon(target.index, '#ff9500');
                if (engine.callbacks.onTriggerGuardShake) engine.callbacks.onTriggerGuardShake(target.index);
                attackResults.push({ index: target.index, result: 'tackle' });
                if (engine.telemetry) engine.telemetry.recordMonsterPattern(engine.selectedMonster.id, pattern, 'guard', damage);
                if (target.hp <= 0) {
                    engine.triggerHunterCart(target);
                }
                return;
            }

            // Normal Guard/Evade rolls
            const defendRoll = engine.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;

            const isStunned = target.status === 'stunned' || target.roarStunned; // [FIX] 포효 중 가드/회피 불가
            const actionAllowsGuard = !actionMachine || actionMachine.canGuard(target);
            const actionAllowsEvade = !actionMachine || actionMachine.canEvade(target);
            const hasShield = !isStunned && actionAllowsGuard && (target.type === 'shield' || target.id === 'heavy_bowgun');
            let guardProb = isStunned ? 0 : 0.62;
            let dodgeProb = isStunned || !actionAllowsEvade ? 0 : 0.48;

            // Personality-based dodge modifiers
            let foresightProb = 0.55;
            if (target.personality === 'veteran') {
                guardProb = 0.78;
                dodgeProb = 0.75;
                foresightProb = 0.78;
            } else if (target.personality === 'newbie') {
                guardProb = 0.30;
                dodgeProb = 0.22;
                foresightProb = 0.20;
            }
            if (!actionAllowsGuard) guardProb = 0;
            if (!actionAllowsEvade) dodgeProb = 0;
            if (actionAllowsGuard) guardProb = Math.min(0.97, guardProb + Number(target.nextGuardBoost || 0));
            if (actionAllowsEvade) dodgeProb = Math.min(0.97, dodgeProb + Number(target.nextEvadeBoost || 0));
            target.nextGuardBoost = 0;
            target.nextEvadeBoost = 0;

            // [FIX] 랜스 가드 확률 10% 가산
            if (!isStunned && target.id === 'lance') {
                guardProb = Math.min(0.92, guardProb + 0.12);
            }

            // Long Sword Foresight Slash
            const canForesight = actionMachine && actionMachine.canCounter(target, 'foresight');
            if (!isStunned && target.id === 'long_sword' && canForesight && defendRoll < foresightProb) {
                damage = 0;
                isDodge = true;
                isForesightSlash = true;
                target.spiritLevel = Math.min(3, (target.spiritLevel || 0) + 1);
            } else if (hasShield && defendRoll < guardProb) {
                damage = Math.max(1, Math.floor(damage * 0.20));
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                damage = 0;
                isDodge = true;
            }

            if (damage > 0) {
                // Moxie check
                if (target.hp - damage <= 0 && target.hasMoxie && engine.random() < 0.75) {
                    target.hp = 1;
                    target.hasMoxie = false;
                    target.atb = 0;
                    engine.updateWeaponAtbUI(target.index, 0);
                    engine.addLog(`🔥 [근성 발휘!] ${target.name}이(가) ${engine.selectedMonster.nameKO}의 치명타를 입고 근성으로 1 HP 생존했습니다! (행동 게이지 초기화)`, '#c98534');
                    engine.playSFX('mh_guard.mp3', '오살았어');
                    engine.shakeWeapon(target.index, '#00ffa3');
                    attackResults.push({ index: target.index, result: 'hit' });
                } else {
                    target.hp = Math.max(0, target.hp - damage);
                    if (isGuard) {
                        engine.addLog(`🛡️ [방패 가드] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 방어해냈습니다! (-${damage} HP)`, '#00ffff');
                        engine.playSFX('mh_guard.mp3', '가드성공');
                        engine.shakeWeapon(target.index, '#00ffff');
                        if (engine.callbacks.onTriggerGuardShake) engine.callbacks.onTriggerGuardShake(target.index);
                        target.guardDuration = 6;
                        attackResults.push({ index: target.index, result: 'guard' });
                    } else {
                        if (actionMachine) actionMachine.cancel(target, 'hitstun');
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                        if (damage >= 30) {
                            target.hitDuration = 25; // 2.5 seconds
                        } else {
                            target.hitDuration = 10; // 1.0 second
                        }
                        engine.addLog(`💥 [피격] ${engine.selectedMonster.nameKO}이(가) [${attackName}] 시전! ${target.name}에게 큰 타격! (-${damage} HP, 행동 게이지 초기화)`, '#ff5555');
                        // engine.playSFX('mh_hit.mp3', ['윽!', '으악!', '아야!'][Math.floor(engine.random() * 3)]);
                        engine.shakeMonster();
                        engine.shakeWeapon(target.index);
                        engine.triggerHitAnimation(target.index, damage);
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
            } else {
                if (isForesightSlash) {
                    engine.addLog(`⚡ [간파베기] ${target.name}이(가) 간파베기로 공격을 흘려내며 기인 게이지가 상승했습니다! (현재 레벨: ${target.spiritLevel}/3)`, '#c98534');
                    engine.playSFX('mh_guard.mp3', '가드성공');
                    engine.showSkillBubble(target.index, "간파베기!");
                    engine.restoreBorder(target.index);
                    engine.shakeWeapon(target.index, '#c98534');
                } else {
                    engine.addLog(`🌀 [회피] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 구르기로 회피했습니다!`, '#2eff7b');
                    engine.playSFX('mh_dodge.mp3', '회피');
                    engine.shakeWeapon(target.index, '#2eff7b', false, null, true);
                }
                if (actionMachine) actionMachine.cancel(target, isGuard ? 'guard' : 'evade');
                if (engine.callbacks.onTriggerRollAnimation) engine.callbacks.onTriggerRollAnimation(target.index);
                target.rollDuration = 6;
                attackResults.push({ index: target.index, result: 'dodge' });
            }

            // Sharpness/Ammo penalty on hit
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
                if (engine.telemetry) engine.telemetry.recordCart();
            } else {
                // Stun check (15% chance on raw damage)
                if (damage > 0 && target.status === 'alive' && engine.random() < 0.15) {
                    target.status = 'stunned';
                    target.stunDuration = 50;
                    target.atb = 0;
                    engine.updateWeaponAtbUI(target.index, 0);
                    engine.addLog(`🌀 [기절] ${target.name}이(가) 큰 충격으로 기절했습니다! 행동 게이지가 초기화되며 다음 턴 행동이 불가합니다!`, '#e58e26');
                    // engine.playSFX('mh_stun.mp3', '격추');
                    engine.shakeWeapon(target.index, '#e58e26');
                    if (engine.callbacks.onTriggerStunUI) engine.callbacks.onTriggerStunUI(target.index, true);
                }
            }
            if (engine.telemetry) {
                engine.telemetry.recordMonsterPattern(
                    engine.selectedMonster.id,
                    pattern,
                    isDodge ? 'dodge' : isGuard ? 'guard' : 'hit',
                    damage
                );
            }
        });

        // Trigger dynamic monster attack animation
        const { type: attackType, emoji } = engine.getMonsterAttackType(attackName);
        if (engine.callbacks.onTriggerMonsterAttack) {
            engine.callbacks.onTriggerMonsterAttack(attackType, emoji, attackResults, attackName);
        }
        engine.monsterRecoveryDuration = Math.max(1, Math.round(
            (pattern.recoveryTicks || 7)
            * (engine.monsterState === 'enraged' ? 0.7 : engine.monsterState === 'exhausted' ? 1.5 : 1)
        ));
    }
}
