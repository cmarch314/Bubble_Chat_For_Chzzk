class HuntMonsterTurnExecutor {
    static isGreatSwordCharging(hunter) {
        return hunter?.id === 'great_sword' && (
            Number(hunter.greatSwordCharge || 0) > 0
            || hunter.currentAction?.tags?.includes('charge')
            || /great_sword\.(?:strong_|true_)?charge_/.test(String(hunter.currentAction?.id || ''))
        );
    }

    static interruptGreatSwordCharge(engine, hunter) {
        if (!HuntMonsterTurnExecutor.isGreatSwordCharging(hunter)) return false;
        if (engine.weaponMechanics?.onHit) engine.weaponMechanics.onHit(hunter);
        else {
            hunter.greatSwordCharge = 0;
            hunter.greatSwordChain = 0;
        }
        engine.actionStateMachine?.cancel(hunter, 'idle');
        engine.callbacks?.onInterruptWeaponVisual?.(hunter.index);
        return true;
    }

    // Shared weapon-specific defensive counter repertoire (iai, foresight, perfect
    // guard, hammer offset, lance counter/power guard, charge-blade guard point,
    // switch-axe counter, HBG wyvern counter). Both the standard monster turn and
    // the Valstrax ambush landing route through this so every weapon keeps its
    // signature counter. Returns { handled } === false when no dedicated counter
    // fires, letting the caller apply its own generic shield-guard/dodge fallback.
    // ctx: { defendRoll, actionAllowsEvade, perkModifiers, iaiCounterProb, foresightProb, isStunned }
    static resolveHunterCounter(engine, target, incomingDamage, ctx) {
        const actionMachine = engine.actionStateMachine;
        const defendRoll = Number(ctx.defendRoll);
        const actionAllowsEvade = ctx.actionAllowsEvade;
        const perkModifiers = ctx.perkModifiers || {};
        const iaiCounterProb = Number(ctx.iaiCounterProb ?? 0.58);
        const foresightProb = Number(ctx.foresightProb ?? 0.70);
        const isStunned = Boolean(ctx.isStunned);
        let damage = incomingDamage;
        let handled = false;
        let isGuard = false, isDodge = false, isForesightSlash = false, isIaiCounter = false;
        let isPerfectGuard = false, isHammerOffset = false, isLanceCounter = false;
        let isChargeBladeGuardPoint = false, isSwitchAxeCounter = false;

        // World-style Iai Spirit Slash: success keeps color and deals heavy damage;
        // failure takes the hit and consumes one spirit color level.
        const hasIaiAttempt = Boolean(target.currentAction?.tags?.includes('iai'));
        const canIaiCounter = hasIaiAttempt && target.currentAction?.phase === 'active';
        // Foresight Slash reacts to an incoming hit. It is available while idle or in
        // a valid evade-cancel window, but cannot break an action lock.
        const canForesight = target.id === 'long_sword'
            && Number(target.spiritGauge || 0) >= 20
            && (actionAllowsEvade || Boolean(actionMachine?.canCounter(target, 'foresight')));
        const canPerfectGuard = target.id === 'sword_shield'
            && target.currentAction?.tags?.includes('perfect-guard')
            && target.currentAction?.phase === 'active';
        const canHammerOffset = target.id === 'hammer'
            && target.currentAction?.tags?.includes('hammer-offset')
            && target.currentAction?.phase === 'active';
        const canLanceCounter = target.id === 'lance'
            && target.currentAction?.tags?.includes('lance-counter')
            && target.currentAction?.phase === 'active';
        const canPowerGuard = target.id === 'lance'
            && target.currentAction?.tags?.includes('lance-power-guard')
            && target.currentAction?.phase === 'active';
        const canChargeBladeGuardPoint = target.id === 'charge_blade'
            && target.currentAction?.tags?.includes('charge-blade-guard')
            && target.currentAction?.phase === 'active';
        const canSwitchAxeCounter = target.id === 'switch_axe'
            && target.currentAction?.tags?.includes('switch-axe-sword-counter')
            && target.currentAction?.phase === 'active';
        const canHeavyBowgunCounter = target.id === 'heavy_bowgun'
            && target.currentAction?.tags?.includes('hbg-wyverncounter')
            && target.currentAction?.phase === 'active';
        if (!isStunned && canHeavyBowgunCounter && defendRoll < Math.min(0.9, 0.66 + Number(perkModifiers.counterChance || 0))) {
            handled = true;
            damage = 0;
            isGuard = true;
            target.hbgCounterWaiting = false;
            target.hbgCounterReady = true;
            target.atb = Math.max(Number(target.atb || 0), 82);
            if (actionMachine) actionMachine.cancel(target, 'guard');
            engine.addLog(`🛡️💥 [용열 카운터] ${target.name}이(가) 포격으로 공격을 받아내고 반격 조준을 마쳤습니다!`, '#ffb347');
            engine.showSkillBubble(target.index, '용열 카운터!');
            engine.shakeWeapon(target.index, '#ffb347', true, { id: 'heavy_bowgun.wyverncounter_stance' });
        } else if (!isStunned && canSwitchAxeCounter && defendRoll < Math.min(0.92, 0.7 + Number(perkModifiers.counterChance || 0))) {
            handled = true;
            isGuard = true;
            isSwitchAxeCounter = true;
            damage = Math.max(1, Math.floor(damage * 0.25));
            target.switchCounterWaiting = false;
            target.switchCounterReady = true;
            target.atb = Math.max(Number(target.atb || 0), 82);
            if (actionMachine) actionMachine.cancel(target, 'guard');
            engine.addLog(`⚔️ [검 카운터] ${target.name}이(가) 공격을 받아 흘리며 카운터 올려베기 연계권을 확보했습니다! (피해 75% 경감)`, '#80e8ff');
            engine.showSkillBubble(target.index, '검 카운터 · 성공!');
            engine.shakeWeapon(target.index, '#80e8ff', true, { id: 'switch_axe.sword_counter_rising' });
        } else if (!isStunned && canChargeBladeGuardPoint) {
            handled = true;
            damage = 0;
            isGuard = true;
            isChargeBladeGuardPoint = true;
            target.cbGuardWaiting = false;
            target.cbGuardReady = true;
            target.chargeBladeMode = 'axe';
            target.cbAxeStep = 3;
            const burst = target.shieldChargeDuration > 0 ? 32 : 20;
            engine.monsterHp = Math.max(0, engine.monsterHp - burst);
            engine.updateMonsterHpUI();
            if (actionMachine) actionMachine.cancel(target, 'guard');
            engine.addLog(`🛡️⚡ [가드 포인트] ${target.name}이(가) 정확히 막아 병 폭발을 일으키고 고출력 반격 자세로 전환했습니다!`, '#ff79c6');
            engine.showSkillBubble(target.index, '가드 포인트!');
            engine.shakeWeapon(target.index, '#ff79c6', true, { id: 'charge_blade.guard_point' });
        } else if (!isStunned && (canLanceCounter || canPowerGuard)) {
            handled = true;
            isGuard = true;
            isLanceCounter = true;
            const burden = Math.min(100, Number(target.guardBurden || 0) + (canPowerGuard ? 12 : 7));
            target.guardBurden = burden;
            damage = canPowerGuard ? Math.floor(damage * burden / 300) : 0;
            target.lanceCounterWaiting = false;
            target.powerGuardWaiting = false;
            if (canPowerGuard) {
                target.powerGuardReady = true;
                target.powerGuardCharge = Math.max(1, Number(target.powerGuardCharge || 0));
            } else {
                target.lanceCounterReady = true;
            }
            if (actionMachine) actionMachine.cancel(target, 'guard');
            engine.addLog(`🛡️ [${canPowerGuard ? '파워 가드' : '카운터 가드'}] ${target.name}이(가) 정면에서 버티며 반격권을 확보했습니다!`, '#87ceeb');
            engine.showSkillBubble(target.index, canPowerGuard ? `파워 가드 ${target.powerGuardCharge}단계!` : '카운터 가드!');
            engine.shakeWeapon(target.index, '#87ceeb', true, { id: canPowerGuard ? 'lance.power_guard' : 'lance.counter_stance' });
        } else if (!isStunned && canHammerOffset && defendRoll < Math.min(0.92, 0.7 + Number(perkModifiers.counterChance || 0))) {
            handled = true;
            damage = 0;
            isGuard = true;
            isHammerOffset = true;
            target.hammerOffsetWaiting = false;
            target.hammerOffsetFollowupReady = true;
            if (actionMachine) actionMachine.cancel(target, 'guard');
            const counterDamage = 380;
            engine.monsterHp = Math.max(0, engine.monsterHp - counterDamage);
            engine.monsterStunAccum = Number(engine.monsterStunAccum || 0) + 150;
            engine.updateMonsterHpUI();
            engine.checkMonsterKnockdown();
            engine.addLog(`🔨 [상쇄 어퍼] ${target.name}이(가) 공격을 정면에서 쳐내고 후속 회전 내려치기 기회를 만들었습니다! (-${counterDamage} HP)`, '#ffd166');
            engine.showSkillBubble(target.index, '상쇄 어퍼!');
            engine.shakeWeapon(target.index, '#ffd166', true, { id: 'hammer.offset_upswing' });
        } else if (!isStunned && canPerfectGuard && defendRoll < Math.min(0.94, 0.72 + Number(perkModifiers.guardChance || 0))) {
            handled = true;
            damage = 0;
            isGuard = true;
            isPerfectGuard = true;
            target.snsPerfectGuardReady = false;
            target.snsCounterReady = true;
            if (actionMachine) actionMachine.cancel(target, 'guard');
            engine.addLog(`🛡️ [퍼펙트 가드] ${target.name}이(가) 공격을 정확히 막아내고 카운터베기 연계권을 얻었습니다!`, '#f5f8ff');
            engine.showSkillBubble(target.index, '퍼펙트 가드!');
            engine.shakeWeapon(target.index, '#f5f8ff', true, { id: 'sword_shield.perfect_guard' });
        } else if (!isStunned && target.id === 'long_sword' && hasIaiAttempt) {
            handled = true;
            target.specialSheatheReady = false;
            target.iaiHelmBreakerReady = false;
            if (actionMachine) actionMachine.cancel(target, 'idle');
            if (canIaiCounter && defendRoll < Math.min(0.94, iaiCounterProb + Number(perkModifiers.counterChance || 0))) {
                damage = 0;
                isDodge = true;
                isIaiCounter = true;
                target.iaiHelmBreakerReady = true;
                const counterDamage = Math.round(300 * (1 + Number(target.spiritLevel || 0) * 0.18));
                engine.monsterHp = Math.max(0, engine.monsterHp - counterDamage);
                engine.updateMonsterHpUI();
                engine.checkMonsterKnockdown();
                engine.addLog(`⚡ [거합베기 성공] ${target.name}이(가) 공격을 가르며 ${counterDamage} 피해를 주고 기인 레벨을 유지합니다. 기인투구깨기 연계가 열립니다!`, '#9fdcff');
                engine.showSkillBubble(target.index, '거합베기 · 성공!');
                engine.shakeWeapon(target.index, '#9fdcff', true, { id: 'long_sword.iai_counter_success' });
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(target, 'success', {
                    id: 'long_sword.iai_counter_success', dmg: counterDamage, motionValue: 90, tags: ['counter']
                });
            } else {
                target.spiritLevel = Math.max(0, Number(target.spiritLevel || 0) - 1);
                target.spiritGauge = Math.max(0, Number(target.spiritGauge || 0) - 25);
                engine.addLog(`💥 [거합베기 실패] ${target.name}이(가) 타이밍을 놓쳐 기인 레벨이 하락합니다!`, '#ff6b6b');
                engine.showSkillBubble(target.index, '거합베기 · 실패!');
                if (engine.expressHunterEmotion) engine.expressHunterEmotion(target, 'failure');
            }
        } else if (!isStunned && target.id === 'long_sword' && canForesight && defendRoll < foresightProb) {
            handled = true;
            damage = 0;
            isDodge = true;
            isForesightSlash = true;
            if (actionMachine) actionMachine.cancel(target, 'evade');
            target.spiritGauge = 100;
            target.spiritLevel = Math.min(3, Number(target.spiritLevel || 0) + 1);
            target.spiritRoundslashReady = false;
        }
        return {
            handled, damage, isGuard, isDodge, isForesightSlash, isIaiCounter,
            isPerfectGuard, isHammerOffset, isLanceCounter, isChargeBladeGuardPoint, isSwitchAxeCounter
        };
    }

    static chargeLaneTargets(targetable, count, random = Math.random, crossScreen = false) {
        const ordered = [...targetable].sort((a, b) => Number(a.index) - Number(b.index));
        const take = Math.max(1, Math.min(Number(count || 1), ordered.length));
        const anchor = Math.min(ordered.length - 1, Math.floor(random() * ordered.length));
        const start = Math.max(0, Math.min(ordered.length - take, anchor - Math.floor((take - 1) / 2)));
        const lane = ordered.slice(start, start + take);
        return crossScreen && random() >= .5 ? lane.reverse() : lane;
    }

    static selectPattern(engine) {
        const monsterKey = engine.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
        const list = engine.MONSTER_PATTERNS[monsterKey] || engine.MONSTER_PATTERNS[engine.selectedMonster.id] || engine.MONSTER_PATTERNS.default;
        const eligible = engine.monsterTier === 'small'
            ? list.filter(pattern => pattern.type !== 'roar' && !pattern.tags?.includes('roar'))
            : list;
        const rageEligible = engine.monsterState === 'enraged' && engine.monsterUltimateUsedInRage
            ? eligible.filter(pattern => pattern.type !== 'ultimate' && !pattern.tags?.includes('ultimate'))
            : eligible;
        return engine.monsterPatternSelector
            ? engine.monsterPatternSelector.select(engine.selectedMonster, rageEligible, {
                state: engine.monsterState,
                hpRatio: engine.monsterHp / engine.monsterMaxHp,
                flightState: engine.monsterFlightState,
                monsterTier: engine.monsterTier,
                ultimateUsedInRage: engine.monsterUltimateUsedInRage
            })
            : rageEligible[Math.floor(engine.random() * rageEligible.length)];
    }

    static prepare(engine) {
        if (engine.pendingMonsterAction) return false;
        const monsterKey = engine.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
        const patterns = engine.MONSTER_PATTERNS[monsterKey] || engine.MONSTER_PATTERNS[engine.selectedMonster.id] || engine.MONSTER_PATTERNS.default || [];
        if (engine.monsterFlightRuntime) engine.monsterFlightRuntime.beforeTurn(engine, patterns);
        const pattern = HuntMonsterTurnExecutor.selectPattern(engine);
        if (!pattern) return false;
        engine.monsterAtb = 0;
        engine.updateMonsterAtbUI(0);
        const stateRate = engine.monsterState === 'enraged' ? 0.78 : engine.monsterState === 'exhausted' ? 1.28 : 1;
        const windupTicks = Math.max(1, Math.round(Number(pattern.windupTicks || 1) * stateRate));
        engine.pendingMonsterAction = { pattern, remainingTicks: windupTicks, totalTicks: windupTicks };
        engine.showSkillBubble('monster', `⚠ ${pattern.name}`);
        engine.addLog(`⚠️ [공격 예고] ${engine.selectedMonster.nameKO}이(가) ${pattern.name} 준비에 들어갑니다!`, '#ffc857');
        return true;
    }

    static execute(engine, preparedPattern = null) {
        engine.monsterAtb = 0;
        if (engine.smallMonsterSwarm) {
            const attacker = engine.smallMonsterSwarm.nextAttacker();
            if (!attacker) return;
            if (engine.callbacks.onUpdateSmallMonsterSwarmUI) engine.callbacks.onUpdateSmallMonsterSwarmUI(engine.smallMonsterSwarm.snapshot());
        }
        const targetable = engine.selectedWeapons.filter(w => w.status === 'alive'
            && Number(w.cartRecoveryTicks || 0) <= 0
            && Number(w.jumpInvulnerableTicks || 0) <= 0
            && (!engine.perkRuntime || engine.perkRuntime.isTargetable(w)));
        if (targetable.length === 0) return;

        let pattern = preparedPattern || HuntMonsterTurnExecutor.selectPattern(engine);
        if (engine.monsterTier === 'small' && (pattern?.type === 'roar' || pattern?.tags?.includes('roar'))) {
            pattern = HuntMonsterTurnExecutor.selectPattern(engine);
        }
        if (!pattern) return;
        const attackName = pattern.name;

        if (pattern.type === 'roar') {
            if (engine.telemetry) engine.telemetry.recordMonsterPattern(engine.selectedMonster.id, pattern, 'roar', 0);
            engine.triggerMonsterRoarFlinch(false);
            engine.monsterRecoveryDuration = pattern.recoveryTicks || 8;
            return;
        }

        engine.playSFX('monster_attack', null, {
            monsterId: engine.selectedMonster.id,
            patternId: pattern.id,
            patternName: pattern.name,
            patternType: pattern.type
        });

        const isUltimate = pattern.type === 'ultimate' || pattern.tags?.includes('ultimate');
        if (isUltimate) engine.monsterUltimateUsedInRage = true;
        const maxTargets = Math.min(isUltimate ? targetable.length : (pattern.maxTargets || 1), targetable.length);
        const minTargets = Math.min(pattern.minTargets || 1, maxTargets);
        const numTargets = minTargets + Math.floor(engine.random() * (maxTargets - minTargets + 1));
        const weightedTargets = targetable.flatMap(target => {
            const weight = engine.perkRuntime ? engine.perkRuntime.targetWeight(target) : 1;
            return Array.from({ length: Math.max(1, Math.round(weight * 4)) }, () => target);
        });
        const shuffledTargets = [...weightedTargets].sort(() => engine.random() - 0.5)
            .filter((target, index, list) => list.indexOf(target) === index);
        const isChargePattern = pattern.type === 'charge' || pattern.tags?.includes('charge');
        const isCrossCharge = pattern.tags?.includes('cross-charge');
        let targetsToHit = isUltimate && !isChargePattern
            ? [...targetable]
            : isChargePattern
                ? HuntMonsterTurnExecutor.chargeLaneTargets(targetable, numTargets, engine.random.bind(engine), isCrossCharge)
                : shuffledTargets.slice(0, numTargets);
        const sacrifice = engine.perkRuntime && targetable.find(target => engine.perkRuntime.constructor.has(target, '희생 방패'));
        if (!isUltimate && sacrifice && !targetsToHit.includes(sacrifice)) {
            const endangeredIndex = targetsToHit.findIndex(target => target.hp <= target.maxHp * .35);
            if (endangeredIndex >= 0) {
                const protectedHunter = targetsToHit[endangeredIndex];
                targetsToHit[endangeredIndex] = sacrifice;
                engine.addLog(`🛡️ [희생 방패] ${sacrifice.hunterName}이(가) ${protectedHunter.hunterName} 앞을 막아섰습니다!`, '#8fd7ff');
            }
        }

        engine.showSkillBubble('monster', attackName);

        // Charge trigger
        const isChargeAttack = attackName.includes('돌진') || attackName.includes('급습') || attackName.includes('휩쓸기') || attackName.includes('강습') || attackName.includes('활공') || attackName.includes('진격') || attackName.includes('습격') || attackName.includes('들이받기');
        if (isChargeAttack && !isChargePattern) {
            if (engine.callbacks.onTriggerMonsterCharge) engine.callbacks.onTriggerMonsterCharge();
        }

        let dmgMod = 1.0;
        if (engine.monsterState === 'enraged') dmgMod = 1.5;
        else if (engine.monsterState === 'exhausted') dmgMod = 0.5;

        const attackResults = [];

        targetsToHit.forEach(target => {
            const resistedBy = engine.perkRuntime && engine.perkRuntime.ignoresPattern(target, pattern);
            if (resistedBy) {
                engine.addLog(`🛡️ [${resistedBy}] ${target.name}이(가) ${attackName}의 경직을 무효화했습니다!`, '#8fd7ff');
                engine.showSkillBubble(target.index, `🛡️ ${resistedBy}`);
                attackResults.push({ index: target.index, result: 'resist' });
                return;
            }
            let baseDmg = Math.max(1, Math.floor(target.maxHp * Number(isUltimate ? 0.90 : (pattern.damageRatio || 0.22))));
            // Signature ultimates are a readable 90%-max-HP check before hunter-side
            // guard, tactic, song, and perk mitigation. Rage must not turn it into an
            // opaque guaranteed cart by multiplying it past 100%.
            let damage = Math.floor(baseDmg * (isUltimate ? 1 : dmgMod) * (isUltimate ? 1 : (engine.monsterDamageMod || 1.0)));
            if (engine.teamTactic === 'defensive') damage = Math.max(1, Math.floor(damage * 0.88));
            else if (engine.teamTactic === 'offensive') damage = Math.max(1, Math.floor(damage * 1.05));
            if (Number(target.hornDefenseBuffTicks || 0) > 0) damage = Math.max(1, Math.floor(damage * 0.88));

            const actionMachine = engine.actionStateMachine;

            // Great Sword tackle is now a real counter window, never an implicit combo-index bonus.
            const isGreatSwordTackling = target.id === 'great_sword'
                && actionMachine
                && actionMachine.canCounter(target, 'tackle');
            if (isGreatSwordTackling) {
                damage = Math.floor(damage * 0.5);
                if (engine.blightRuntime?.onIncomingHit) damage = engine.blightRuntime.onIncomingHit(target, damage);
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
                        // Verified monster-stun audio will be added when a labelled event is available.
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
            let isIaiCounter = false;
            let isPerfectGuard = false;
            let isHammerOffset = false;
            let isLanceCounter = false;
            let isChargeBladeGuardPoint = false;
            let isSwitchAxeCounter = false;

            const isStunned = target.status === 'stunned' || target.roarStunned; // [FIX] 포효 중 가드/회피 불가
            const actionAllowsGuard = !actionMachine || actionMachine.canGuard(target);
            const actionAllowsEvade = !actionMachine || actionMachine.canEvade(target);
            const isGreatSwordCharging = HuntMonsterTurnExecutor.isGreatSwordCharging(target);
            const hasShield = !isStunned && actionAllowsGuard && !isGreatSwordCharging
                && (target.type === 'shield' || target.id === 'heavy_bowgun');
            let guardProb = isStunned ? 0 : 0.62;
            let dodgeProb = isStunned || !actionAllowsEvade ? 0 : 0.48;

            // Personality-based dodge modifiers
            let foresightProb = 0.70;
            let iaiCounterProb = 0.58;
            if (target.personality === 'veteran') {
                guardProb = 0.78;
                dodgeProb = 0.75;
                foresightProb = 0.86;
                iaiCounterProb = 0.82;
            } else if (target.personality === 'newbie') {
                guardProb = 0.30;
                dodgeProb = 0.22;
                foresightProb = 0.40;
                iaiCounterProb = 0.22;
            }
            // Signature attacks are meant to be a party-wide 90%-max-HP crisis.
            // Dedicated counter actions keep their full authored windows, but passive
            // auto-guard/auto-evade cannot erase most ultimates before they are seen.
            if (isUltimate) {
                guardProb *= 0.62;
                dodgeProb *= 0.42;
            }
            const perkModifiers = target.perkModifiers || {};
            guardProb += Number(perkModifiers.guardChance || 0);
            dodgeProb += Number(perkModifiers.evadeChance || 0);
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

            const counter = HuntMonsterTurnExecutor.resolveHunterCounter(engine, target, damage, {
                defendRoll, actionAllowsEvade, perkModifiers, iaiCounterProb, foresightProb, isStunned
            });
            if (counter.handled) {
                ({ damage, isGuard, isDodge, isForesightSlash, isIaiCounter,
                    isPerfectGuard, isHammerOffset, isLanceCounter,
                    isChargeBladeGuardPoint, isSwitchAxeCounter } = counter);
            } else if (hasShield && defendRoll < guardProb) {
                const guardReduction = Math.max(0.05, 0.20 - Number(perkModifiers.guardPower || 0));
                damage = Math.max(1, Math.floor(damage * guardReduction));
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                damage = 0;
                isDodge = true;
            }

            if (isGreatSwordCharging && (isGuard || isDodge)) {
                HuntMonsterTurnExecutor.interruptGreatSwordCharge(engine, target);
            }

            if (isGuard && engine.perkRuntime) damage = engine.perkRuntime.guardedDamage(target, damage);
            if (engine.perkRuntime) damage = engine.perkRuntime.incomingDamage(target, damage, { pattern, isUltimate });
            // Preserve active guards and counters, while preventing stacked passive
            // mitigation from turning an unguarded signature hit into ordinary chip.
            if (isUltimate && !isGuard && !isDodge) {
                damage = Math.max(damage, Math.floor(target.maxHp * 0.72));
            }
            const shouldPlayHunterHit = damage > 0;
            if (damage > 0) {
                // Moxie check
                if (engine.perkRuntime && engine.perkRuntime.preventCart(target, damage)) {
                    target.atb = 0;
                    engine.updateWeaponAtbUI(target.index, 0);
                    attackResults.push({ index: target.index, result: 'hit' });
                } else if (target.hp - damage <= 0 && target.hasMoxie && engine.random() < 0.75) {
                    target.hp = 1;
                    target.hasMoxie = false;
                    target.atb = 0;
                    engine.updateWeaponAtbUI(target.index, 0);
                    engine.addLog(`🔥 [근성 발휘!] ${target.name}이(가) ${engine.selectedMonster.nameKO}의 치명타를 입고 근성으로 1 HP 생존했습니다! (행동 게이지 초기화)`, '#c98534');
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'guard' });
                    engine.shakeWeapon(target.index, '#00ffa3');
                    attackResults.push({ index: target.index, result: 'hit' });
                } else {
                    if (engine.blightRuntime?.onIncomingHit) damage = engine.blightRuntime.onIncomingHit(target, damage);
                    target.hp = Math.max(0, target.hp - damage);
                    if (isGuard) {
                        engine.addLog(`🛡️ [방패 가드] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 방어해냈습니다! (-${damage} HP)`, '#00ffff');
                        engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'guard' });
                        engine.shakeWeapon(target.index, '#00ffff');
                        if (engine.callbacks.onTriggerGuardShake) engine.callbacks.onTriggerGuardShake(target.index);
                        target.guardDuration = 6;
                        attackResults.push({ index: target.index, result: 'guard' });
                    } else {
                        if (target.pendingSharpnessRestore) {
                            target.pendingSharpnessRestore = false;
                            target.itemDuration = 0;
                            engine.addLog(`💥 [숫돌질 중단] ${target.hunterName}이(가) 피격되어 숫돌을 집어넣었습니다!`, '#ff9f43');
                        }
                        if (actionMachine) actionMachine.cancel(target, 'hitstun');
                        if (engine.weaponMechanics) engine.weaponMechanics.onHit(target);
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                        if (damage >= 30) {
                            target.hitDuration = 25; // 2.5 seconds
                        } else {
                            target.hitDuration = 10; // 1.0 second
                        }
                        engine.addLog(`💥 [피격] ${engine.selectedMonster.nameKO}이(가) [${attackName}] 시전! ${target.name}에게 큰 타격! (-${damage} HP, 행동 게이지 초기화)`, '#ff5555');
                        // Hunter-hit voice is deferred until the stun result is known.
                        engine.shakeMonster();
                        engine.shakeWeapon(target.index);
                        engine.triggerHitAnimation(target.index, damage);
                        if (engine.expressHunterEmotion) engine.expressHunterEmotion(target, 'hurt');
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
                if (damage > 0 && engine.blightRuntime) {
                    const blight = engine.blightRuntime.fromAttack(pattern);
                    if (blight) engine.blightRuntime.apply(target, blight, pattern.isUltimate || pattern.tags?.includes('ultimate') ? 180 : undefined);
                }
            } else {
                if (isIaiCounter) {
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'counter' });
                    engine.restoreBorder(target.index);
                } else if (isChargeBladeGuardPoint) {
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'counter' });
                    engine.restoreBorder(target.index);
                } else if (isLanceCounter) {
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'counter' });
                    engine.restoreBorder(target.index);
                } else if (isHammerOffset) {
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'counter' });
                    engine.restoreBorder(target.index);
                } else if (isPerfectGuard) {
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'perfect-guard' });
                    engine.restoreBorder(target.index);
                } else if (isForesightSlash) {
                    engine.addLog(`⚡ [간파베기 성공] ${target.name}이(가) 공격을 흘려 기인 레벨을 ${target.spiritLevel}/3으로 올렸습니다!`, '#c98534');
                    engine.playSFX('hunter_guard', null, { hunterIndex: target.index, action: 'guard' });
                    engine.showSkillBubble(target.index, "간파베기!");
                    engine.restoreBorder(target.index);
                    engine.shakeWeapon(target.index, '#c98534', true, { id: 'long_sword.foresight' });
                } else {
                    engine.addLog(`🌀 [회피] ${target.name}이(가) 몬스터의 [${attackName}]을(를) 구르기로 회피했습니다!`, '#2eff7b');
                    engine.playSFX('hunter_evade', null, { hunterIndex: target.index, action: 'evade' });
                    engine.shakeWeapon(target.index, '#2eff7b', false, null, true);
                }
                if (actionMachine) actionMachine.cancel(target, isGuard ? 'guard' : 'evade');
                if (isDodge && engine.blightRuntime) engine.blightRuntime.onEvade(target);
                if (isPerfectGuard || isHammerOffset || isLanceCounter || isChargeBladeGuardPoint) {
                    // A perfect guard holds the shield line; it must not borrow the evade-roll pose.
                    target.guardDuration = 6;
                } else {
                    if (engine.callbacks.onTriggerRollAnimation) engine.callbacks.onTriggerRollAnimation(target.index);
                    target.rollDuration = 6;
                }
                attackResults.push({ index: target.index, result: (isHammerOffset || isLanceCounter || isChargeBladeGuardPoint) ? 'counter' : 'dodge' });
            }

            if (engine.perkRuntime) engine.perkRuntime.onDefense(target,
                isDodge ? 'dodge' : isPerfectGuard ? 'perfect-guard' : isGuard ? 'guard' : 'hit');

            // Sharpness/Ammo penalty on hit
            if (damage > 0 && !isDodge) {
                if (!target.sharpnessProfile) {
                    target.ammo = Math.max(0, target.ammo - 1);
                } else {
                    target.sharpness = Math.max(0, target.sharpness - 8);
                }
            }

            engine.updateHpUI(target);

            let becameStunned = false;

            // Faint check
            if (target.hp <= 0) {
                engine.triggerHunterCart(target);
                if (engine.telemetry) engine.telemetry.recordCart();
            } else {
                // Stun check (15% chance on raw damage)
                let stunChance = engine.perkRuntime ? engine.perkRuntime.stunChance(target, 0.15) : 0.15;
                if (engine.blightRuntime) stunChance = engine.blightRuntime.stunChance(target, stunChance);
                if (damage > 0 && target.status === 'alive' && engine.random() < stunChance) {
                    becameStunned = true;
                    target.status = 'stunned';
                    target.stunDuration = engine.perkRuntime ? engine.perkRuntime.stunDuration(target, 50) : 50;
                    if (engine.blightRuntime) target.stunDuration = engine.blightRuntime.stunDuration(target, target.stunDuration);
                    target.atb = 0;
                    engine.updateWeaponAtbUI(target.index, 0);
                    engine.addLog(`🌀 [기절] ${target.name}이(가) 큰 충격으로 기절했습니다! 행동 게이지가 초기화되며 다음 턴 행동이 불가합니다!`, '#e58e26');
                    // Verified hunter-stun audio will be added when a labelled event is available.
                    engine.shakeWeapon(target.index, '#e58e26');
                    if (engine.callbacks.onTriggerStunUI) engine.callbacks.onTriggerStunUI(target.index, true);
                }
            }
            // A stun has no hunter voice cue in the source game. The ordinary
            // hit reaction on the same frame must not masquerade as a stun sound.
            if (shouldPlayHunterHit && !becameStunned) {
                engine.playSFX('hunter_hit', null, {
                    hunterIndex: target.index,
                    monsterId: engine.selectedMonster.id,
                    action: 'hit'
                });
            }
            if (engine.telemetry) {
                engine.telemetry.recordMonsterPattern(
                    engine.selectedMonster.id,
                    pattern,
                    (isHammerOffset || isLanceCounter || isChargeBladeGuardPoint) ? 'counter' : isDodge ? (isIaiCounter ? 'counter' : 'dodge') : isPerfectGuard ? 'perfect-guard' : isGuard ? 'guard' : 'hit',
                    damage
                );
            }
        });

        // Trigger dynamic monster attack animation
        const { type: attackType, emoji } = engine.getMonsterAttackType(attackName);
        if (engine.callbacks.onTriggerMonsterAttack) {
            engine.callbacks.onTriggerMonsterAttack(attackType, emoji, attackResults, attackName, pattern);
        }
        engine.monsterRecoveryDuration = Math.max(1, Math.round(
            (pattern.recoveryTicks || 7)
            * (engine.monsterState === 'enraged' ? 0.7 : engine.monsterState === 'exhausted' ? 1.5 : 1)
        ));
        if (engine.monsterFlightRuntime) engine.monsterFlightRuntime.afterAction(engine, pattern);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterTurnExecutor;
else if (typeof window !== 'undefined') window.HuntMonsterTurnExecutor = HuntMonsterTurnExecutor;
