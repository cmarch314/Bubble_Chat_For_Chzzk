class HuntValstraxExecutor {
    static executeChargeSuccess(engine) {
        engine.monsterAtb = 0;
        engine.updateMonsterAtbUI(0);
        engine.valstraxChargeCount++;
        
        if (engine.valstraxChargeCount >= 3) {
            engine.monsterState = 'enraged';
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
        engine.addLog(`💥 [착륙 대폭발] 발파루크가 혜성처럼 지상으로 돌진 착륙하며 초거대 폭발을 일으킵니다!`, '#ff3333');
        engine.playSFX('mh_heavy_hit.mp3', '격추');
        engine.shakeMonster();

        const targets = engine.selectedWeapons.filter(w => w.status === 'alive' || w.status === 'stunned');
        const attackResults = [];

        targets.forEach(target => {
            let damage = target.maxHp;

            // Normal Guard/Evade rolls
            const defendRoll = engine.random();
            let isGuard = false;
            let isDodge = false;
            let isForesightSlash = false;

            const isStunned = target.status === 'stunned';
            const hasShield = !isStunned && (target.type === 'shield' || target.id === 'heavy_bowgun');
            let guardProb = isStunned ? 0 : 0.85;
            let dodgeProb = isStunned ? 0 : 0.75;

            let foresightProb = 0.70;
            if (target.personality === 'veteran') {
                guardProb = 0.90;
                dodgeProb = 0.90;
                foresightProb = 0.90;
            } else if (target.personality === 'newbie') {
                guardProb = 0.45;
                dodgeProb = 0.35;
                foresightProb = 0.25;
            }

            if (!isStunned && target.id === 'long_sword' && defendRoll < foresightProb) {
                damage = 0;
                isDodge = true;
                isForesightSlash = true;
                target.spiritLevel = Math.min(3, (target.spiritLevel || 0) + 1);
            } else if (hasShield && defendRoll < guardProb) {
                damage = Math.max(1, Math.floor(damage * 0.08));
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
                    engine.addLog(`🔥 [근성 발휘!] ${target.name}이(가) 발파루크의 혜성 습격 폭발 속에서 근성으로 1 HP 생존했습니다!`, '#c98534');
                    engine.playSFX('mh_guard.mp3', '오살았어');
                    engine.shakeWeapon(target.index, '#00ffa3');
                    attackResults.push({ index: target.index, result: 'hit' });
                } else {
                    target.hp = Math.max(0, target.hp - damage);
                    if (isGuard) {
                        engine.addLog(`🛡️ [방패 가드] ${target.name}이(가) 혜성 습격 폭발을 방어해냈습니다! (-${damage} HP)`, '#00ffff');
                        engine.playSFX('mh_guard.mp3', '가드성공');
                        engine.shakeWeapon(target.index, '#00ffff');
                        if (engine.callbacks.onTriggerGuardShake) engine.callbacks.onTriggerGuardShake(target.index);
                        target.guardDuration = 6;
                        attackResults.push({ index: target.index, result: 'guard' });
                    } else {
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                        target.hitDuration = 25; // 피격 경직
                        engine.addLog(`💥 [피격] ${target.name}이(가) 혜성 습격 직격! 치명적인 데미지를 입었습니다. (-${damage} HP)`, '#ff5555');
                        engine.shakeWeapon(target.index);
                        engine.triggerHitAnimation(target.index, damage);
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
            } else {
                if (isForesightSlash) {
                    engine.addLog(`⚡ [간파베기] ${target.name}이(가) 혜성 습격 폭발을 간파베기로 흘려넘겼습니다! (현재 기인 게이지 레벨: ${target.spiritLevel}/3)`, '#c98534');
                    engine.playSFX('mh_guard.mp3', '가드성공');
                    engine.showSkillBubble(target.index, "간파베기!");
                    engine.restoreBorder(target.index);
                    engine.shakeWeapon(target.index, '#c98534');
                } else {
                    engine.addLog(`🌀 [회피] ${target.name}이(가) 혜성 습격을 프레임 회피로 피했습니다!`, '#2eff7b');
                    engine.playSFX('mh_dodge.mp3', '회피');
                    engine.shakeWeapon(target.index, '#2eff7b', false, null, true);
                }
                if (engine.callbacks.onTriggerRollAnimation) engine.callbacks.onTriggerRollAnimation(target.index);
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
            engine.callbacks.onTriggerMonsterAttack('elemental', '☄️', attackResults, '혜성 습격');
        }

        // Return monster to normal state
        engine.monsterState = 'normal';
        engine.valstraxChargeTimer = 0;
        engine.valstraxChargeCount = 0;
        engine.valstraxChargeDmg = 0;
        engine.monsterSpeed = engine.getMonsterSpeedForState('normal');
        engine.updateMonsterStateUI('일반 상태', engine.selectedMonster.nameKO, { color: '#00ffaa', bg: 'rgba(0,255,170,0.08)' });
        engine.addLog(`📢 발파루크가 착륙 후 지면을 고르며 일반 상태로 돌아왔습니다.`, '#eee');
    }
}
