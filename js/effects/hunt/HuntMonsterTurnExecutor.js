class HuntMonsterTurnExecutor {
    static LONG_SWORD_FORESIGHT_CHANCE = Object.freeze({
        normal: 0.75,
        support: 0.75,
        offensive: 0.80,
        veteran: 0.80,
        defensive: 0.85,
        newbie: 0.50
    });

    static longSwordForesightChance(hunter) {
        return HuntMonsterTurnExecutor.LONG_SWORD_FORESIGHT_CHANCE[hunter?.personality] ?? 0.75;
    }

    static longSwordCanForesight(hunter) {
        if (!hunter || hunter.id !== 'long_sword' || hunter.status !== 'alive') return false;
        if (Number(hunter.spiritGauge || 0) <= 0 || !hunter.longSwordForesightEligible) return false;
        if (Number(hunter.itemDuration || 0) > 0
            || Number(hunter.rollDuration || 0) > 0
            || Number(hunter.guardDuration || 0) > 0
            || Number(hunter.jumpInvulnerableTicks || 0) > 0
            || hunter.isGathering
            || hunter.interference) return false;
        const currentId = String(hunter.currentAction?.id || '');
        if (!currentId) return true;
        return hunter.currentAction?.phase === 'recovery' && new Set([
            'long_sword.overhead_slash',
            'long_sword.thrust',
            'long_sword.rising_slash'
        ]).has(currentId);
    }

    static incomingHitCount(pattern = {}) {
        if (Array.isArray(pattern.hits) && pattern.hits.length > 1) return pattern.hits.length;
        const authored = Number(pattern.repeatCount || pattern.hitCount || 0);
        if (authored > 1) return Math.min(8, Math.floor(authored));
        const tags = Array.isArray(pattern.tags) ? pattern.tags : [];
        return tags.some(tag => ['multi-hit', 'repeat', 'chain'].includes(tag)) ? 2 : 1;
    }

    static resolveLongSwordForesight(engine, target, incomingDamage, ctx = {}) {
        if (!HuntMonsterTurnExecutor.longSwordCanForesight(target) || ctx.isStunned) {
            return { handled: false, attempted: false, success: false, damage: incomingDamage, hitCount: 0 };
        }

        const chance = Number.isFinite(ctx.foresightProb)
            ? Number(ctx.foresightProb)
            : HuntMonsterTurnExecutor.longSwordForesightChance(target);
        const hitCount = HuntMonsterTurnExecutor.incomingHitCount(ctx.pattern);
        const action = engine.weaponMechanics?.constructor?.actionsFor?.('long_sword')
            ?.find(candidate => candidate.id === 'long_sword.foresight')
            || { durationTicks: 9 };
        const atbCost = HuntMonsterTurnExecutor.atbConfig().actionCostGauge(action);
        let counterDamage = 0;

        for (let hit = 0; hit < hitCount; hit++) {
            target.spiritGauge = 0;
            target.atb = Math.max(0, Number(target.atb || 0) - atbCost);
            const roll = hit === 0 ? Number(ctx.defendRoll) : Number(engine.random());
            if (!(roll < chance)) {
                target.longSwordForesightEligible = false;
                target.longSwordForesightChain = 0;
                target.longSwordReactiveFollowup = false;
                target.spiritRoundslashReady = false;
                target.spiritGauge = 0;
                engine.showSkillBubble?.(target.index, '간파베기 · 실패');
                return { handled: true, attempted: true, success: false, damage: incomingDamage, hitCount: hit + 1 };
            }

            target.spiritGauge = 100;
            counterDamage += Math.round(125 * (1 + Number(target.spiritLevel || 0) * 0.05));
            if (hit < hitCount - 1) counterDamage += 75; // 간파 → 찌르기 → 간파
        }

        engine.monsterHp = Math.max(0, Number(engine.monsterHp || 0) - counterDamage);
        engine.updateMonsterHpUI?.();
        engine.checkMonsterKnockdown?.();
        engine.actionStateMachine?.cancel(target, 'evade');
        target.longSwordForesightEligible = false;
        target.longSwordForesightChain = hitCount;
        target.longSwordReactiveFollowup = true;
        target.spiritRoundslashReady = true;
        engine.updateWeaponAtbUI?.(target.index, target.atb);
        return { handled: true, attempted: true, success: true, damage: 0, hitCount, counterDamage };
    }

    static atbConfig() {
        if (typeof HuntAtbConfig !== 'undefined') return HuntAtbConfig;
        if (typeof require === 'function') return require('./HuntAtbConfig.js');
        throw new Error('HuntAtbConfig is required before monster turns');
    }

    static animationCatalog() {
        if (typeof HuntMonsterAnimationCatalog !== 'undefined') return HuntMonsterAnimationCatalog;
        if (typeof require === 'function') return require('./HuntMonsterAnimationCatalog.js');
        return null;
    }

    static actionPolicy() {
        if (typeof globalThis !== 'undefined' && globalThis.HuntMonsterActionPolicy) return globalThis.HuntMonsterActionPolicy;
        if (typeof require === 'function') {
            try {
                const loaded = require('./HuntMonsterActionPolicy.js');
                if (loaded) return loaded;
            } catch (e) {}
        }
        return (typeof globalThis !== 'undefined' && globalThis.HuntMonsterActionPolicy) || {};
    }

    static hitReactionForPattern(pattern = {}, target = {}) {
        const tags = Array.isArray(pattern.tags) ? pattern.tags.map(tag => String(tag).toLowerCase()) : [];
        const kind = tags.includes('weak') || tags.includes('butt-stumble') ? 'weak' : 'strong';
        const hasExplicitKnockback = pattern.knockbackDirection !== undefined
            && pattern.knockbackDirection !== null;
        const authoredDirection = hasExplicitKnockback
            ? pattern.knockbackDirection
            : (pattern.attackDirection ?? pattern.direction);
        let direction = Number(authoredDirection);
        if (!Number.isFinite(direction) || direction === 0) {
            const textDirection = String(authoredDirection || '').toLowerCase();
            direction = textDirection === 'left' ? -1 : textDirection === 'right' ? 1 : 0;
        }
        if (direction && !hasExplicitKnockback) direction *= -1;
        if (!direction) direction = Number(target.index || 0) < 2 ? -1 : 1;
        return {
            kind,
            durationTicks: kind === 'weak' ? 15 : 40,
            knockbackDirection: direction < 0 ? -1 : 1
        };
    }

    static canInflictHunterStun(pattern = {}) {
        const type = String(pattern.type || '').toLowerCase();
        const tags = new Set(
            (Array.isArray(pattern.tags) ? pattern.tags : [])
                .map(tag => String(tag).toLowerCase())
        );
        const name = String(pattern.name || pattern.displayName || '');
        const interferenceKind = ['roar', 'tremor', 'wind'].some(kind =>
            type === kind || tags.has(kind)
        );
        return !interferenceKind
            && !tags.has('interference')
            && !/(포효|지진|풍압)/.test(name);
    }

    static isHunterHitRecovering(target = {}) {
        // Stun is a vulnerable control state. A stale/overlapping tumble timer
        // must never grant invulnerability while the hunter is visibly stunned.
        if (String(target.status || '') === 'stunned') return false;
        return Number(target.hitDuration || 0) > 0;
    }

    static isHunterDefenseLocked(target = {}) {
        // Roar, tremor, and wind-pressure reactions are vulnerable action locks,
        // not invulnerability. Once caught, a hunter cannot roll or raise a new
        // guard until the interference ends; a damaging hit replaces the pose.
        return String(target.status || '') === 'stunned'
            || Boolean(target.interference)
            || Boolean(target.roarStunned);
    }

    static isEngagedMeleeTarget(target = {}) {
        if (!target || target.type === 'ranged') return false;
        const action = target.currentAction;
        if (!action) return false;
        return ['active', 'recovery'].includes(String(action.phase || ''));
    }

    static effectiveTargetCap(partState, pattern) {
        return HuntMonsterTurnExecutor.actionPolicy().effectiveTargetCap(pattern || partState, partState);
    }

    static brokenPartDamageModifier(partState, pattern) {
        return HuntMonsterTurnExecutor.actionPolicy().brokenPartDamageModifier(partState, pattern);
    }

    static brokenHornCount(partState) {
        return (partState?.monsterPartState || []).filter(p => (p.kind === 'horn' || p.kind?.includes('horn')) && p.broken).length;
    }

    static shouldTriggerWhiffReaction(engine, pattern, attackResults) {
        return HuntMonsterTurnExecutor.actionPolicy().shouldTriggerWhiffReaction(engine, pattern, attackResults);
    }

    static enterScriptedKnockdown(engine, ticks, reason) {
        engine.pendingMonsterImpact = null;
        engine.monsterKnockdownDuration = Math.max(
            Number(engine.monsterKnockdownDuration || 0),
            Math.max(1, Number(ticks || 1))
        );
        engine.monsterState = 'knocked_down';
        engine.setMonsterAtbForControl?.('knockdown');
        if (!engine.setMonsterAtbForControl) {
            engine.monsterAtb = HuntMonsterTurnExecutor.atbConfig().monsterAtbAfterControl('knockdown');
            engine.updateMonsterAtbUI?.(engine.monsterAtb);
        }
        engine.callbacks?.onTriggerMonsterKnockdownAnim?.();
        engine.monsterTraversalState = null;
        engine.clearMonsterTraversal?.(reason);
    }

    static phasedFollowUpPattern(engine) {
        return HuntMonsterTurnExecutor.actionPolicy().phasedFollowUp(
            engine.selectedMonster?.id,
            String(engine.monsterState || 'normal'),
            engine.monsterBurrowState
        );
    }

    static displayPatternName(pattern, monster) {
        const catalog = globalThis.HuntMonsterPatternCatalog
            || (typeof require === 'function' ? require('./HuntMonsterPatternCatalog.js') : null);
        return catalog?.displayName ? catalog.displayName(pattern, monster) : String(pattern?.name || '');
    }

    static targetableHunters(engine) {
        const Rules = typeof HuntMonsterRules !== 'undefined'
            ? HuntMonsterRules
            : (typeof require === 'function' ? require('./HuntMonsterRules.js') : null);
        return (engine.selectedWeapons || []).filter(hunter =>
            Rules
                ? Rules.isHunterTargetable(engine, hunter)
                : ['alive', 'stunned'].includes(String(hunter.status || '')));
    }

    static monsterAttackAccuracy(pattern = {}, engine = null) {
        const Rules = typeof HuntMonsterRules !== 'undefined'
            ? HuntMonsterRules
            : (typeof require === 'function' ? require('./HuntMonsterRules.js') : null);
        const base = Rules?.attackAccuracy ? Rules.attackAccuracy(pattern) : 1;
        const partModifier = engine
            ? HuntMonsterTurnExecutor.actionPolicy().brokenPartAccuracyModifier(
                engine.monsterPartState || [], pattern)
            : 1;
        return Math.max(0, Math.min(1, base * partModifier));
    }

    static cancelPreparedTargetAction(engine, reason = 'target-unavailable') {
        engine.monsterTraitRuntime?.cancelAtomicFlight?.(engine, reason);
        if (engine.interruptMonsterMovement) {
            engine.interruptMonsterMovement(reason);
        } else {
            engine.pendingMonsterAction = null;
            engine.pendingMonsterImpact = null;
            if (engine.monsterBurrowState) {
                engine.monsterBurrowState = null;
                engine.callbacks?.onTriggerMonsterBurrowPhase?.('cancel', null, 0);
            }
            engine.clearMonsterTraversal?.(reason);
        }
        engine.monsterAtb = 0;
        engine.updateMonsterAtbUI?.(0);
        return false;
    }

    static refreshPreparedTarget(engine) {
        const pending = engine.pendingMonsterAction;
        if (!pending) return false;
        const requiresLockedTarget = pending.pattern?.tags?.includes('locked-target')
            || pending.pattern?.tags?.includes('burrow-emerge');
        if (!requiresLockedTarget) return true;

        const targetable = HuntMonsterTurnExecutor.targetableHunters(engine);
        if (!targetable.length) {
            return HuntMonsterTurnExecutor.cancelPreparedTargetAction(engine);
        }
        if (targetable.some(hunter => hunter.index === pending.targetIndex)) return true;

        const replacement = targetable[Math.floor(engine.random() * targetable.length)];
        pending.targetIndex = replacement.index;
        if (pending.pattern?.tags?.includes('burrow-emerge')) {
            engine.callbacks?.onTriggerMonsterBurrowPhase?.(
                'telegraph',
                replacement.index,
                Math.max(1, Number(pending.remainingTicks || 1)) * 100
            );
        }
        return true;
    }

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
            engine.callbacks?.onTriggerGuardShake?.(target.index);
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
            target.atb = 100;
            engine.updateWeaponAtbUI?.(target.index, target.atb);
            if (actionMachine) actionMachine.cancel(target, 'guard');
            engine.addLog(`🛡️ [${canPowerGuard ? '파워 가드' : '카운터 가드'}] ${target.name}이(가) 정면에서 버티며 반격권을 확보했습니다!`, '#87ceeb');
            engine.showSkillBubble(target.index, canPowerGuard ? `파워 가드 ${target.powerGuardCharge}단계!` : '카운터 가드!');
            engine.callbacks?.onTriggerGuardShake?.(target.index);
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
            engine.callbacks?.onTriggerGuardShake?.(target.index);
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
        } else if (!isStunned && target.id === 'long_sword') {
            const foresight = HuntMonsterTurnExecutor.resolveLongSwordForesight(engine, target, damage, {
                ...ctx,
                defendRoll,
                foresightProb,
                isStunned
            });
            if (foresight.handled) {
                handled = true;
                damage = foresight.damage;
                isDodge = foresight.success;
                isForesightSlash = foresight.success;
            }
        }
        return {
            handled, damage, isGuard, isDodge, isForesightSlash, isIaiCounter,
            isPerfectGuard, isHammerOffset, isLanceCounter, isChargeBladeGuardPoint, isSwitchAxeCounter
        };
    }

    static chargeLaneTargets(targetable, count, random = Math.random, crossScreen = false) {
        return HuntMonsterTurnExecutor.actionPolicy().laneTargets(
            targetable, count, random, crossScreen);
    }

    static adjacentLaneTargets(targetable, count, random = Math.random) {
        return HuntMonsterTurnExecutor.actionPolicy().adjacentLaneTargets(
            targetable, count, random);
    }

    static returnAdjacentPasses(targetable, totalTargets, random = Math.random) {
        return HuntMonsterTurnExecutor.actionPolicy().returnAdjacentPasses(
            targetable, totalTargets, random);
    }

    static allPartsBroken(engine, partKinds = []) {
        return HuntMonsterTurnExecutor.actionPolicy().allPartsBroken(
            engine.monsterPartState || [], partKinds);
    }

    static shouldTriggerWhiffReaction(engine, pattern, attackResults) {
        return HuntMonsterTurnExecutor.actionPolicy().shouldTriggerWhiffReaction(
            engine.monsterPartState || [], pattern, attackResults);
    }

    static movementForPattern(pattern, monsterState = 'normal') {
        return HuntMonsterTurnExecutor.actionPolicy().movement(pattern, monsterState);
    }

    static requiresDelayedImpact(pattern = {}) {
        return HuntMonsterTurnExecutor.actionPolicy().requiresDelayedImpact(pattern);
    }

    static resolveImpactEventTargetIndices(engine, event = {}, fallbackIndices = []) {
        const targetShape = event.targetShape || event.targetMode;
        if (targetShape === 'primary-adjacent-both' || targetShape === 'center-left-right') {
            const targetable = HuntMonsterTurnExecutor.targetableHunters(engine);
            // Timeline events may retarget between charge passes. Anchor the
            // splash to that event's resolved primary, not the action's first
            // prepared target retained in fallbackIndices.
            const primaryIndex = (Array.isArray(event.targetIndices)
                ? event.targetIndices
                : []).find(Number.isInteger)
                ?? fallbackIndices.find(Number.isInteger);
            const primary = targetable.find(target => target.index === primaryIndex);
            if (!primary) return [];
            return targetable
                .filter(target => Math.abs(Number(target.index) - Number(primary.index)) <= 1)
                .map(target => target.index);
        }
        if (event.targetMode !== 'random-live') {
            return Array.isArray(event.targetIndices)
                ? event.targetIndices.filter(Number.isInteger)
                : fallbackIndices.filter(Number.isInteger);
        }
        const targetable = HuntMonsterTurnExecutor.targetableHunters(engine);
        if (!targetable.length) return [];
        const ready = targetable.filter(target =>
            !HuntMonsterTurnExecutor.isHunterHitRecovering(target));
        const pool = ready.length ? ready : targetable;
        return [pool[Math.floor(engine.random() * pool.length)].index];
    }

    static impactDelayTicks(pattern = {}, monsterState = 'normal') {
        return HuntMonsterTurnExecutor.actionPolicy().impactDelayTicks(pattern, monsterState);
    }

    static isPatternGuardable(pattern = {}) {
        if (pattern.guardable === false || String(pattern.guardable).toLowerCase() === 'false') {
            return false;
        }
        if (pattern.runtimeDefenseMode === 'emergency-jump') return false;
        const tags = new Set((pattern.tags || []).map(tag => String(tag).toLowerCase()));
        return !['unguardable', 'unblockable', 'guard-break', 'guard-piercing', 'no-guard']
            .some(tag => tags.has(tag));
    }

    static planHunterResponseIntent(engine, target, pattern = {}) {
        const actionMachine = engine.actionStateMachine;
        const isStunned = HuntMonsterTurnExecutor.isHunterDefenseLocked(target);
        if (isStunned) return { attempted: false, preferred: 'none' };
        const canGuard = HuntMonsterTurnExecutor.isPatternGuardable(pattern)
            && (!actionMachine || actionMachine.canGuard(target));
        const canEvade = !actionMachine || actionMachine.canEvade(target);
        const isCharging = HuntMonsterTurnExecutor.isGreatSwordCharging(target);
        const hasShield = canGuard && !isCharging
            && (target.type === 'shield' || target.id === 'heavy_bowgun');
        const guaranteedLanceGuard = target.id === 'lance' && hasShield;
        const counterReady = Boolean(target.currentAction?.tags?.includes('counter'))
            || (target.id === 'long_sword'
                && target.longSwordForesightEligible
                && Number(target.spiritGauge || 0) > 0);
        const attemptChance = target.personality === 'newbie' ? .90
            : target.personality === 'offensive' ? .96 : .99;
        return {
            attempted: guaranteedLanceGuard
                || ((canGuard || canEvade) && engine.random() < attemptChance),
            preferred: counterReady ? 'counter' : hasShield ? 'guard' : canEvade ? 'evade' : 'none'
        };
    }

    static repeatTargetsForState(targets, pattern, monsterState = 'normal') {
        return HuntMonsterTurnExecutor.actionPolicy().repeatTargets(
            targets, pattern, monsterState);
    }

    static isPartBroken(engine, partKind) {
        return HuntMonsterTurnExecutor.actionPolicy().isPartBroken(
            engine.monsterPartState || [], partKind);
    }

    static effectiveTargetCap(engine, pattern) {
        return HuntMonsterTurnExecutor.actionPolicy().effectiveTargetCap(
            engine.monsterPartState || [], pattern);
    }

    static brokenPartDamageModifier(engine, pattern) {
        if (pattern?.runtimeImpactIgnoreBrokenPartDamage) return 1;
        const authored = HuntMonsterTurnExecutor.actionPolicy().brokenPartDamageModifier(
            engine.monsterPartState || [], pattern);
        const usedPartPenalty = pattern?.runtimeUsedPart
            && HuntMonsterTurnExecutor.isPartBroken(engine, pattern.runtimeUsedPart)
            ? Number(pattern.partUse?.brokenDamageMultiplier || 1)
            : 1;
        return authored * usedPartPenalty;
    }

    static statusAllowed(engine, pattern) {
        if (pattern?.runtimeImpactSuppressStatus) return false;
        return HuntMonsterTurnExecutor.actionPolicy().statusAllowed(
            engine.monsterPartState || [], pattern);
    }

    static decorateHabitatVariant(engine, pattern) {
        if (!pattern?.habitatVariants) return pattern;
        const habitat = String(engine?.monsterHabitatId || '').toLowerCase();
        const terrain = /snow|frost|hoarfrost|arctic|ice/.test(habitat) ? 'snow'
            : /volcan|lava|recess/.test(habitat) ? 'volcanic'
                : /jungle|forest|flood|water|wet/.test(habitat) ? 'wet' : 'default';
        const variant = pattern.habitatVariants[terrain] || pattern.habitatVariants.default || 'raw';
        const tags = (pattern.tags || []).filter(tag => !['fire', 'ice', 'water'].includes(tag));
        if (variant !== 'raw') tags.push(variant, 'elemental');
        return { ...pattern, tags, runtimeProjectileVariant: variant, runtimeTerrainVariant: terrain };
    }

    static selectPattern(engine) {
        if (engine.monsterBurrowState?.phase === 'underground') {
            const followUp = HuntMonsterTurnExecutor.phasedFollowUpPattern(engine);
            if (followUp) return followUp;
            return null;
        }
        const monsterKey = engine.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
        const list = engine.MONSTER_PATTERNS[monsterKey] || engine.MONSTER_PATTERNS[engine.selectedMonster.id] || engine.MONSTER_PATTERNS.default;
        const eligible = engine.monsterTier === 'small'
            ? list.filter(pattern => pattern.type !== 'roar' && !pattern.tags?.includes('roar'))
            : list;
        if (engine.forcedMonsterPatternId) {
            const forced = eligible.find(pattern =>
                pattern.id === engine.forcedMonsterPatternId
                && (!pattern.requiredState || pattern.requiredState === engine.monsterState)
                && !(pattern.tags || []).includes(
                    engine.monsterFlightState === 'airborne' ? 'ground-only' : 'flight-only'
                )
            );
            engine.forcedMonsterPatternId = null;
            if (forced) return forced;
        }
        const rageEligible = engine.monsterState === 'enraged' && engine.monsterUltimateUsedInRage
            ? eligible.filter(pattern => pattern.type !== 'ultimate' && !pattern.tags?.includes('ultimate'))
            : eligible;
        return engine.monsterPatternSelector
            ? engine.monsterPatternSelector.select(engine.selectedMonster, rageEligible, {
                state: engine.monsterState,
                hpRatio: engine.monsterHp / engine.monsterMaxHp,
                flightState: engine.monsterFlightState,
                monsterTier: engine.monsterTier,
                ultimateUsedInRage: engine.monsterUltimateUsedInRage,
                partState: engine.monsterPartState,
                traits: engine.monsterTraitRuntime?.context?.(engine) || [],
                landingPending: Boolean(engine.monsterLandingPending),
                shortFlightChain: engine.monsterBehavior?.flightMode === 'short-chain'
            })
            : rageEligible[Math.floor(engine.random() * rageEligible.length)];
    }

    static prepare(engine) {
        if (engine.pendingMonsterAction) return false;
        // Do not begin (or pay for) an action while every hunter is temporarily
        // unavailable. This commonly happens while the party is carting, at
        // camp, or inside a brief invulnerability exit. Previously an airborne
        // monster could repeatedly spend a full ATB bar on actions that were
        // cancelled immediately, appearing frozen until a hunter returned.
        if (!HuntMonsterTurnExecutor.targetableHunters(engine).length) {
            engine.monsterActionGateDiagnostics = [
                ...(engine.monsterActionGateDiagnostics || []),
                {
                    tick: Number(engine.battleTime || 0),
                    monsterId: engine.selectedMonster?.id || 'unknown',
                    reason: 'no-targetable-hunters',
                    retainedAtb: Number(engine.monsterAtb || 0)
                }
            ].slice(-24);
            return false;
        }
        const monsterKey = engine.selectedMonster.id.replace(/-/g, '_').replace(/'/g, '');
        const patterns = engine.MONSTER_PATTERNS[monsterKey] || engine.MONSTER_PATTERNS[engine.selectedMonster.id] || engine.MONSTER_PATTERNS.default || [];
        if (engine.monsterFlightRuntime
            && engine.monsterFlightRuntime.beforeTurn(engine, patterns) === false) return false;
        let pattern = HuntMonsterTurnExecutor.selectPattern(engine);
        if (!pattern
            && engine.monsterFlightRuntime?.recoverNoEligibleAirAction?.(engine)) {
            pattern = HuntMonsterTurnExecutor.selectPattern(engine);
        }
        if (!pattern) return false;
        pattern = HuntMonsterTurnExecutor.decorateHabitatVariant(engine,
            engine.monsterTraitRuntime?.decorateAction?.(engine, pattern) || pattern);
        if (pattern.partUse?.mode === 'random-front-leg') {
            pattern = {
                ...pattern,
                runtimeUsedPart: engine.random() < .5 ? 'left-front-leg' : 'right-front-leg'
            };
        } else if (pattern.partUse?.fixed) {
            pattern = { ...pattern, runtimeUsedPart: pattern.partUse.fixed };
        }
        pattern = {
            ...pattern,
            runtimeBrokenPartKinds: (engine.monsterPartState || [])
                .filter(part => part?.broken || part?.severed)
                .map(part => part.kind)
        };
        engine.monsterTraitRuntime?.beforeAction?.(engine, pattern);
        if (engine.monsterJustTookOff) {
            const takeoffInterference = pattern.flight?.takeoffInterference;
            if (takeoffInterference) {
                HuntMonsterTurnExecutor.targetableHunters(engine).forEach(target => {
                    engine.applyHunterInterference?.(
                        target,
                        takeoffInterference.kind,
                        takeoffInterference.size
                    );
                });
            }
            engine.monsterJustTookOff = false;
        }
        const attacker = engine.smallMonsterSwarm?.reserveReadyAttacker?.() || null;
        if (engine.smallMonsterSwarm && !attacker) return false;
        const stateRate = pattern.fixedWindup
            ? 1
            : engine.monsterState === 'enraged'
                ? Number(engine.monsterBehavior?.enragedAnimationDurationMultiplier || .78)
                : engine.monsterState === 'exhausted'
                    ? Number(engine.monsterBehavior?.exhaustedAnimationDurationMultiplier || 1.28)
                    : 1;
        const isBurrowEmerge = pattern.tags?.includes('burrow-emerge');
        const windupTicks = Math.max(1, Math.round(Number(pattern.windupTicks || 1) * (isBurrowEmerge ? 1 : stateRate)));
        const animationProfile = HuntMonsterTurnExecutor.animationCatalog()?.resolve?.(
            pattern,
            HuntMonsterTurnExecutor.displayPatternName(pattern, engine.selectedMonster),
            pattern.type,
            engine.selectedMonster
        );
        const animationTicks = Math.max(1, Math.ceil(Number(animationProfile?.duration || 0) / 100));
        const movementTicks = Math.max(0, Number(
            HuntMonsterTurnExecutor.movementForPattern(pattern, engine.monsterState)?.ticks || 0
        ));
        const impactTimelineTicks = Math.max(0, ...(pattern.impactTimeline || [])
            .map(event => Number(event?.atTicks || 0)));
        const postWindupTicks = Math.max(
            animationTicks,
            movementTicks,
            impactTimelineTicks
        );
        const timing = Object.freeze({
            windupTicks,
            animationTicks,
            movementTicks,
            impactTimelineTicks,
            postWindupTicks,
            occupancyTicks: windupTicks + postWindupTicks,
            recoveryPerTick: Math.max(0, Number(engine.monsterSpeed || 0))
        });
        const actionCost = HuntMonsterTurnExecutor.atbConfig().monsterActionCostGauge(pattern, timing);
        // Negative ATB is intentional action debt. The visible bar clamps to
        // zero, while the simulation retains the full cost of long motions.
        engine.monsterAtb = engine.smallMonsterSwarm
            ? 0
            : Number(engine.monsterAtb || 0) - actionCost;
        if (!engine.smallMonsterSwarm) engine.updateMonsterAtbUI(engine.monsterAtb);
        let targetIndex = null;
        if (isBurrowEmerge) {
            const targetable = HuntMonsterTurnExecutor.targetableHunters(engine);
            if (!targetable.length) {
                return HuntMonsterTurnExecutor.cancelPreparedTargetAction(engine);
            }
            targetIndex = targetable[Math.floor(engine.random() * targetable.length)].index;
            engine.callbacks?.onTriggerMonsterBurrowPhase?.('telegraph', targetIndex, windupTicks * 100);
        }
        engine.pendingMonsterAction = {
            pattern,
            remainingTicks: windupTicks,
            totalTicks: windupTicks,
            attackerIndex: attacker?.index ?? null,
            targetIndex,
            actionCost,
            timing
        };
        const staminaResult = engine.monsterStaminaRuntime?.consumeMonsterAction?.(engine, actionCost);
        if (staminaResult?.exhausted) return true;
        if (pattern.telegraphFx) {
            engine.callbacks?.onTriggerMonsterTelegraphFx?.(pattern.telegraphFx);
        }
        if (!pattern.suppressPrepareAudio) {
            engine.playSFX?.('monster_telegraph', null, {
                monsterId: engine.selectedMonster.id,
                patternId: pattern.id,
                patternName: pattern.name,
                patternType: pattern.type,
                durationTicks: windupTicks
            });
        }
        if (attacker && engine.callbacks.onUpdateSmallMonsterSwarmUI) {
            engine.callbacks.onUpdateSmallMonsterSwarmUI(engine.smallMonsterSwarm.snapshot());
        }
        const displayName = HuntMonsterTurnExecutor.displayPatternName(pattern, engine.selectedMonster);
        engine.showSkillBubble('monster', `⚠ ${displayName}`);
        engine.addLog(`⚠️ [공격 예고] ${engine.selectedMonster.nameKO}이(가) ${displayName} 준비에 들어갑니다!`, '#ffc857');
        return true;
    }

    static execute(engine, preparedPattern = null, preparedAttackerIndex = null, preparedTargetIndex = null) {
        if (engine.smallMonsterSwarm) {
            const attacker = Number.isInteger(preparedAttackerIndex)
                ? engine.smallMonsterSwarm.units[preparedAttackerIndex]
                : engine.smallMonsterSwarm.reserveReadyAttacker();
            if (!attacker) return;
            if (engine.callbacks.onUpdateSmallMonsterSwarmUI) engine.callbacks.onUpdateSmallMonsterSwarmUI(engine.smallMonsterSwarm.snapshot());
        }
        let pattern = preparedPattern || HuntMonsterTurnExecutor.selectPattern(engine);
        if (engine.monsterTier === 'small' && (pattern?.type === 'roar' || pattern?.tags?.includes('roar'))) {
            pattern = HuntMonsterTurnExecutor.selectPattern(engine);
        }
        if (!pattern) return;
        const isImpactCommit = pattern.runtimeImpactCommit === true;
        const targetable = HuntMonsterTurnExecutor.targetableHunters(engine);
        const completesPathOnTargetLoss = isImpactCommit
            && pattern.impact?.completePathOnTargetLoss === true;
        if (targetable.length === 0 && !completesPathOnTargetLoss) {
            HuntMonsterTurnExecutor.cancelPreparedTargetAction(engine);
            return;
        }
        if (engine.monsterState === 'enraged' && Number(pattern.enragedTargetCount || 0) > 0) {
            const enragedTargetCount = Math.max(1, Number(pattern.enragedTargetCount));
            pattern = {
                ...pattern,
                minTargets: enragedTargetCount,
                maxTargets: enragedTargetCount,
                tags: [...new Set([...(pattern.tags || []), 'double-sweep', 'multi-hit'])]
            };
        }
        const attackName = HuntMonsterTurnExecutor.displayPatternName(pattern, engine.selectedMonster);

        if (pattern.tags?.includes('burrow-enter') && pattern.followUp) {
            if (pattern.secondaryInterference) {
                HuntMonsterTurnExecutor.targetableHunters(engine).forEach(target => {
                    engine.applyHunterInterference?.(
                        target,
                        pattern.secondaryInterference.kind,
                        pattern.secondaryInterference.size
                    );
                });
            }
            engine.monsterBurrowState = { phase: 'underground', sourcePattern: pattern };
            engine.monsterTraversalGeneration = Number(engine.monsterTraversalGeneration || 0) + 1;
            engine.playSFX?.('monster_attack', null, {
                monsterId: engine.selectedMonster.id,
                patternId: pattern.id,
                patternName: pattern.name,
                patternType: 'burrow'
            });
            engine.callbacks?.onTriggerMonsterBurrowPhase?.(
                'enter',
                null,
                Number(pattern.phase?.enterVisualMs || 1250)
            );
            engine.showSkillBubble('monster', '지중 잠행');
            engine.addLog(`🌪️ [지중 잠행] ${engine.selectedMonster.nameKO}이(가) 모래먼지를 흩날리며 땅속으로 사라졌습니다!`, '#d6b06f');
            engine.monsterRecoveryDuration = 0;
            return;
        }

        if (pattern.type === 'roar' && isImpactCommit) {
            if (engine.telemetry) engine.telemetry.recordMonsterPattern(engine.selectedMonster.id, pattern, 'roar', 0);
            engine.triggerMonsterRoarFlinch(false);
            if (Number(pattern.damageRatio || 0) <= 0) {
                engine.monsterTraitRuntime?.afterAction?.(engine, pattern, []);
                engine.monsterRecoveryDuration = 0;
                return;
            }
        }

        if (!isImpactCommit && pattern.type !== 'roar' && !pattern.suppressPrepareAudio) {
            engine.playSFX('monster_attack', null, {
                monsterId: engine.selectedMonster.id,
                patternId: pattern.id,
                patternName: pattern.name,
                patternType: pattern.tags?.includes('burrow-emerge') ? 'burrow' : pattern.type,
                patternTags: pattern.tags,
                patternDelivery: pattern.delivery,
                audioPhase: 'action-start'
            });
        } else if (isImpactCommit && pattern.runtimeImpactAudioCue === 'somersault') {
            engine.playSFX?.('monster_telegraph', null, {
                monsterId: engine.selectedMonster.id,
                patternId: pattern.id,
                patternName: pattern.name,
                patternType: 'somersault'
            });
        } else if (isImpactCommit && pattern.runtimeImpactAudioCue === 'tigrex-final-vocal') {
            engine.playSFX?.('monster_attack', null, {
                monsterId: engine.selectedMonster.id,
                patternId: pattern.id,
                patternName: pattern.name,
                patternType: pattern.branchKind || 'attack',
                patternTags: pattern.tags,
                audioPhase: 'action-start'
            });
        }

        const isUltimate = pattern.type === 'ultimate' || pattern.tags?.includes('ultimate');
        const hazardHpOnly = pattern.tags?.includes('hazard-hp-only');
        if (isUltimate) engine.monsterUltimateUsedInRage = true;
        const maxTargets = Math.min(isUltimate ? targetable.length
            : HuntMonsterTurnExecutor.effectiveTargetCap(engine, pattern), targetable.length);
        const minTargets = Math.min(pattern.minTargets || 1, maxTargets);
        const numTargets = minTargets + Math.floor(engine.random() * (maxTargets - minTargets + 1));
        const weightedTargets = targetable.flatMap(target => {
            const weight = engine.perkRuntime ? engine.perkRuntime.targetWeight(target) : 1;
            return Array.from({ length: Math.max(1, Math.round(weight * 4)) }, () => target);
        });
        const shuffledTargets = [...weightedTargets].sort(() => engine.random() - 0.5)
            .filter((target, index, list) => list.indexOf(target) === index);
        const isChargePattern = pattern.type === 'charge' || pattern.tags?.includes('charge');
        const chargeMode = HuntMonsterTurnExecutor.actionPolicy().chargeMode(pattern);
        const isCrossCharge = pattern.tags?.includes('cross-charge');
        const targetingMode = String(pattern.targeting?.mode || '');
        const isSpecialCharge = ['adjacent-lane', 'primary-adjacent-both', 'return-adjacent-passes', 'screen-sweep'].includes(targetingMode);
        const preparedTargetIndices = isImpactCommit && Array.isArray(pattern.runtimeImpactTargetIndices)
            ? pattern.runtimeImpactTargetIndices.filter(Number.isInteger)
            : Number.isInteger(preparedTargetIndex) ? [preparedTargetIndex] : [];
        const preparedTarget = Number.isInteger(preparedTargetIndex)
            ? targetable.find(target => target.index === preparedTargetIndex)
            : null;
        const resolvedPreparedTargetIndex = preparedTarget
            ? preparedTarget.index
            : pattern.tags?.includes('burrow-emerge')
                ? targetable[Math.floor(engine.random() * targetable.length)].index
                : null;
        let targetsToHit = isImpactCommit && pattern.runtimeImpactEmpty === true
            ? []
            : isImpactCommit && preparedTargetIndices.length
            ? targetable.filter(target => preparedTargetIndices.includes(target.index))
            : Number.isInteger(resolvedPreparedTargetIndex)
            ? targetable.filter(target => target.index === resolvedPreparedTargetIndex).slice(0, 1)
            : isUltimate && !isChargePattern
            ? [...targetable]
            : isChargePattern && chargeMode === 'single'
                ? HuntMonsterTurnExecutor.chargeLaneTargets(targetable, numTargets, engine.random.bind(engine), isCrossCharge)
                : shuffledTargets.slice(0, numTargets);
        if (isImpactCommit && targetsToHit.length === 0 && pattern.tags?.includes('tracking')) {
            targetsToHit = [targetable[Math.floor(engine.random() * targetable.length)]];
        }
        const targetPlan = isImpactCommit
            ? { targets: targetsToHit, runtime: {} }
            : HuntMonsterTurnExecutor.actionPolicy().resolveTargeting({
                targetable,
                count: numTargets,
                passCount: Number(pattern.targeting?.passCountByState?.[engine.monsterState]
                    || pattern.targeting?.passCount
                    || pattern.impactTimelineByState?.[engine.monsterState]?.length
                    || pattern.impactTimeline?.length || 2),
                random: engine.random.bind(engine),
                mode: targetingMode,
                defaultTargets: targetsToHit
            });
        targetsToHit = targetPlan.targets;
        if (Object.keys(targetPlan.runtime).length) {
            pattern = {
                ...pattern,
                ...targetPlan.runtime
            };
        }
        const sacrifice = engine.perkRuntime && targetable.find(target => engine.perkRuntime.constructor.has(target, '희생 방패'));
        if (!isImpactCommit && !isUltimate && !isSpecialCharge && sacrifice && !targetsToHit.includes(sacrifice)) {
            const endangeredIndex = targetsToHit.findIndex(target => target.hp <= target.maxHp * .35);
            if (endangeredIndex >= 0) {
                const protectedHunter = targetsToHit[endangeredIndex];
                targetsToHit[endangeredIndex] = sacrifice;
                engine.addLog(`🛡️ [희생 방패] ${sacrifice.hunterName}이(가) ${protectedHunter.hunterName} 앞을 막아섰습니다!`, '#8fd7ff');
            }
        }
        if (!pattern.runtimeImpactTimelineEvent) {
            targetsToHit = HuntMonsterTurnExecutor.repeatTargetsForState(
                targetsToHit,
                pattern,
                engine.monsterState
            );
        }

        const traversal = HuntMonsterTurnExecutor.movementForPattern(pattern, engine.monsterState);
        if (!isImpactCommit && traversal) {
            engine.beginMonsterTraversal?.(
                traversal.kind,
                traversal.ticks,
                { untargetable: traversal.untargetable }
            );
        }

        if (!isImpactCommit) engine.showSkillBubble('monster', attackName);

        if (HuntMonsterTurnExecutor.requiresDelayedImpact(pattern)) {
            const uniqueTargets = targetsToHit.filter((target, index, list) =>
                list.findIndex(item => item.index === target.index) === index);
            const targetIndex = uniqueTargets[0]?.index;
            if (!Number.isInteger(targetIndex)) {
                HuntMonsterTurnExecutor.cancelPreparedTargetAction(engine, 'impact-target-unavailable');
                return;
            }
            const policy = HuntMonsterTurnExecutor.actionPolicy();
            const measuredImpact = engine.callbacks.onResolveMonsterImpactTimeline?.(
                pattern,
                uniqueTargets.map(target => target.index)
            );
            const timeline = measuredImpact?.timeline?.length
                ? measuredImpact.timeline
                : policy.impactTimeline(pattern, engine.monsterState);
            const impactTargetSequence = Array.isArray(pattern.runtimeImpactTargetSequence)
                ? pattern.runtimeImpactTargetSequence
                : null;
            const events = timeline.map(event => {
                const repeatedSequenceIndex = impactTargetSequence?.length
                    ? Math.min(impactTargetSequence.length - 1, Math.max(0, event.index - 1))
                    : -1;
                const sequencedTargets = event.targetMode === 'repeat-previous'
                    ? impactTargetSequence?.[repeatedSequenceIndex]
                    : impactTargetSequence?.[event.index];
                return {
                    ...event,
                    targetIndices: Array.isArray(sequencedTargets)
                        ? sequencedTargets
                        : event.targetMode === 'runtime-dive'
                            && Number.isInteger(pattern.runtimeDiveTargetIndex)
                            ? [pattern.runtimeDiveTargetIndex]
                        : event.targetMode === 'random-live'
                            ? null
                        : event.targetIndices?.length
                            ? event.targetIndices
                            : event.targetMode === 'sequential' && uniqueTargets.length
                                ? [uniqueTargets[event.index % uniqueTargets.length].index]
                                : uniqueTargets.map(target => target.index),
                    allowEmpty: Array.isArray(sequencedTargets)
                        && sequencedTargets.length === 0
                        && pattern.runtimeImpactAllowEmptySequence === true
                };
            });
            const runtimeDefenseIntents = Object.fromEntries(uniqueTargets.map(target => [
                target.index,
                HuntMonsterTurnExecutor.planHunterResponseIntent(engine, target, pattern)
            ]));
            const impactDelayTicks = events[0]?.atTicks
                || HuntMonsterTurnExecutor.impactDelayTicks(pattern, engine.monsterState);
            engine.pendingMonsterImpact = {
                pattern: {
                    ...pattern,
                    runtimeSweepVector: measuredImpact?.runtimeSweepVector,
                    runtimeImpactCommit: true,
                    runtimeImpactTimelineEvent: true,
                    runtimeDefenseIntents
                },
                remainingTicks: impactDelayTicks,
                totalTicks: impactDelayTicks,
                attackerIndex: preparedAttackerIndex,
                targetIndex,
                events,
                nextEventIndex: 0
            };
            const { type: pendingAttackType, emoji: pendingEmoji } = engine.getMonsterAttackType(attackName, pattern);
            engine.callbacks.onTriggerMonsterAttack?.(
                pendingAttackType,
                pendingEmoji,
                uniqueTargets.map(target => ({ index: target.index, result: 'pending' })),
                attackName,
                {
                    ...pattern,
                    runtimeSweepVector: measuredImpact?.runtimeSweepVector,
                    runtimeImpactPending: true,
                    runtimeImpactDelayTicks: impactDelayTicks,
                    runtimeResolvedImpactTimeline: events
                }
            );
            // The renderer may synchronously replace authored ticks with
            // measured collision ticks (Tigrex charge passes, screen sweeps,
            // projectile travel). Keep the engine's first countdown on that
            // same mutated timeline instead of retaining the pre-render value.
            const synchronizedImpactDelay = Math.max(1, Number(
                events[0]?.atTicks || impactDelayTicks
            ));
            engine.pendingMonsterImpact.remainingTicks = synchronizedImpactDelay;
            engine.pendingMonsterImpact.totalTicks = synchronizedImpactDelay;
            const synchronizedFinalImpactTick = events.reduce((latest, event) =>
                Math.max(latest, Number(event?.atTicks || 0)), synchronizedImpactDelay);
            if (engine.monsterTraversalState) {
                engine.monsterTraversalState.remainingTicks = Math.max(
                    Number(engine.monsterTraversalState.remainingTicks || 0),
                    synchronizedFinalImpactTick
                );
                engine.monsterTraversalState.totalTicks = Math.max(
                    Number(engine.monsterTraversalState.totalTicks || 0),
                    synchronizedFinalImpactTick
                );
            }
            engine.monsterRecoveryDuration = 0;
            return;
        }

        // Creature vocals may accompany the action start, but authored and
        // fallback SE belongs to the actual contact/projectile/explosion event.
        // Delayed and multi-hit timelines re-enter here once per committed event.
        if (pattern.type !== 'roar' && pattern.runtimeImpactAudioCue !== 'somersault') {
            engine.playSFX('monster_attack', null, {
                monsterId: engine.selectedMonster.id,
                patternId: pattern.id,
                patternName: pattern.name,
                patternType: pattern.tags?.includes('burrow-emerge') ? 'burrow' : pattern.type,
                patternTags: pattern.tags,
                patternDelivery: pattern.delivery,
                audioPhase: 'impact',
                impactEventKind: pattern.runtimeImpactEventKind || null,
                impactTimelineIndex: pattern.runtimeImpactTimelineIndex
            });
        }

        // Charge trigger
        const isChargeAttack = attackName.includes('돌진') || attackName.includes('급습') || attackName.includes('휩쓸기') || attackName.includes('강습') || attackName.includes('활공') || attackName.includes('진격') || attackName.includes('습격') || attackName.includes('들이받기');
        if (!isImpactCommit && isChargeAttack && !isChargePattern) {
            if (engine.callbacks.onTriggerMonsterCharge) engine.callbacks.onTriggerMonsterCharge();
        }

        let dmgMod = 1.0;
        if (engine.monsterState === 'enraged') {
            dmgMod = Number(engine.monsterBehavior?.enragedDamageMultiplier || 1.5);
        }
        else if (engine.monsterState === 'exhausted') {
            dmgMod = Number(engine.monsterBehavior?.exhaustedDamageMultiplier || .5);
        }

        const attackResults = isImpactCommit && pattern.impact?.completePathOnTargetLoss
            ? preparedTargetIndices
                .filter(index => !targetsToHit.some(target => target.index === index))
                .map(index => ({ index, result: 'dodge' }))
            : [];

        const directDamageTargetIds = new Set();
        targetsToHit.forEach((target, targetOrder) => {
            const canTakeDirectDamage = pattern.directDamageScope !== 'engaged-melee'
                || HuntMonsterTurnExecutor.isEngagedMeleeTarget(target);
            if (!canTakeDirectDamage) {
                attackResults.push({ index: target.index, result: 'effect' });
                return;
            }
            directDamageTargetIds.add(target.index);
            if (Number(pattern.runtimeImpactDamageScale) === 0) {
                attackResults.push({ index: target.index, result: 'effect' });
                return;
            }
            if (pattern.tags?.includes('no-impact')) {
                attackResults.push({ index: target.index, result: 'miss' });
                return;
            }
            // The monster may keep its chosen target, but a hunter already tumbling
            // through hit recovery silently ignores every follow-up hit.
            if (HuntMonsterTurnExecutor.isHunterHitRecovering(target)) {
                attackResults.push({ index: target.index, result: 'invulnerable' });
                return;
            }
            const resistedBy = engine.perkRuntime && engine.perkRuntime.ignoresPattern(target, pattern);
            if (resistedBy) {
                engine.addLog(`🛡️ [${resistedBy}] ${target.name}이(가) ${attackName}의 경직을 무효화했습니다!`, '#8fd7ff');
                engine.showSkillBubble(target.index, `🛡️ ${resistedBy}`);
                attackResults.push({ index: target.index, result: 'resist' });
                return;
            }
            const monsterAccuracy = HuntMonsterTurnExecutor.monsterAttackAccuracy(pattern, engine);
            if (monsterAccuracy < 1 && engine.random() >= monsterAccuracy) {
                attackResults.push({ index: target.index, result: 'miss' });
                return;
            }
            const partDamageModifier = HuntMonsterTurnExecutor.brokenPartDamageModifier(engine, pattern);
            const authoredTargetRatio = Array.isArray(pattern.targetDamageRatios)
                ? pattern.targetDamageRatios[Math.min(targetOrder, pattern.targetDamageRatios.length - 1)]
                : null;
            let baseDmg = Math.max(1, Math.floor(target.maxHp
                * Number(isUltimate ? 0.90 : (authoredTargetRatio ?? pattern.damageRatio ?? 0.22))
                * (isUltimate ? 1 : partDamageModifier)));
            baseDmg = Math.max(1, Math.floor(baseDmg * Number(pattern.runtimeImpactDamageScale ?? 1)));
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
                        if (engine.enterMonsterControlState) {
                            engine.enterMonsterControlState('stun', 60, { source: 'great-sword-tackle' });
                        } else {
                            engine.monsterStunDuration = 60;
                            engine.monsterState = 'stunned';
                            engine.monsterAtb = HuntMonsterTurnExecutor.atbConfig()
                                .monsterAtbAfterControl('stun');
                            engine.updateMonsterAtbUI(engine.monsterAtb);
                            engine.updateMonsterStateUI('기절 상태', `💫 기절한 ${engine.selectedMonster.nameKO} 💫`, { color: '#e58e26', bg: 'rgba(229,142,38,0.1)' });
                        }
                        // Verified monster-stun audio will be added when a labelled event is available.
                        engine.addLog(`💫 [기절] ${engine.selectedMonster.nameKO}이(가) ${target.name}의 강한 타격을 머리에 입고 6초간 무력화됩니다.`, '#e58e26');
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

            const guaranteedByInterference = Boolean(
                pattern.guaranteedWhenInterference
                && target.interference?.kind === pattern.guaranteedWhenInterference
            );
            const isStunned = guaranteedByInterference
                || HuntMonsterTurnExecutor.isHunterDefenseLocked(target);
            const responseIntent = pattern.runtimeDefenseIntents?.[target.index] || null;
            const intendsDefense = !responseIntent || responseIntent.attempted;
            const actionAllowsGuard = intendsDefense
                && responseIntent?.preferred !== 'evade'
                && HuntMonsterTurnExecutor.isPatternGuardable(pattern)
                && (!actionMachine || actionMachine.canGuard(target));
            const actionAllowsEvade = intendsDefense
                && responseIntent?.preferred !== 'guard'
                && (!actionMachine || actionMachine.canEvade(target))
                && !['tremor', 'wind'].includes(target.interference?.kind);
            const isGreatSwordCharging = HuntMonsterTurnExecutor.isGreatSwordCharging(target);
            const emergencyJumpRequired = pattern.runtimeDefenseMode === 'emergency-jump';
            const emergencyJumpAvailable = emergencyJumpRequired
                && !isStunned
                && (!engine.blightRuntime?.canAct || engine.blightRuntime.canAct(target))
                && actionAllowsEvade;
            const hasShield = !isStunned && actionAllowsGuard && !isGreatSwordCharging
                && (target.type === 'shield' || target.id === 'heavy_bowgun');
            const guaranteedLanceGuard = target.id === 'lance' && hasShield;
            let guardProb = isStunned ? 0 : 0.62;
            let dodgeProb = isStunned || !actionAllowsEvade ? 0 : 0.48;

            // Personality-based dodge modifiers
            let foresightProb = HuntMonsterTurnExecutor.longSwordForesightChance(target);
            let iaiCounterProb = 0.58;
            if (target.personality === 'veteran') {
                guardProb = 0.78;
                dodgeProb = 0.75;
                iaiCounterProb = 0.82;
            } else if (target.personality === 'newbie') {
                guardProb = 0.30;
                dodgeProb = 0.22;
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

            const counter = emergencyJumpRequired
                ? { handled: false }
                : HuntMonsterTurnExecutor.resolveHunterCounter(engine, target, damage, {
                    defendRoll, actionAllowsEvade, perkModifiers, iaiCounterProb, foresightProb, isStunned, pattern
                });
            if (emergencyJumpRequired) {
                if (emergencyJumpAvailable) {
                    damage = 0;
                    isDodge = true;
                }
            } else if (counter.handled) {
                ({ damage, isGuard, isDodge, isForesightSlash, isIaiCounter,
                    isPerfectGuard, isHammerOffset, isLanceCounter,
                    isChargeBladeGuardPoint, isSwitchAxeCounter } = counter);
            } else if (hasShield && (guaranteedLanceGuard || defendRoll < guardProb)) {
                const guardReduction = Math.max(0.05, 0.20 - Number(perkModifiers.guardPower || 0));
                damage = Math.max(1, Math.floor(damage * guardReduction));
                isGuard = true;
            } else if (!hasShield && defendRoll < dodgeProb) {
                damage = 0;
                isDodge = true;
            }
            if (hazardHpOnly && isGuard) damage = 0;

            if (isGreatSwordCharging && (isGuard || isDodge)) {
                HuntMonsterTurnExecutor.interruptGreatSwordCharge(engine, target);
            }
            if (isDodge && target.pendingSharpnessRestore) {
                engine.interruptHunterItemAction?.(target, 'evade');
            }

            if (isGuard && target.id === 'lance' && !isLanceCounter) {
                target.lanceCounterWaiting = false;
                target.lanceCounterReady = true;
                target.atb = 100;
                engine.updateWeaponAtbUI?.(target.index, target.atb);
            }

            if (isGuard && engine.perkRuntime) damage = engine.perkRuntime.guardedDamage(target, damage);
            if (engine.perkRuntime) damage = engine.perkRuntime.incomingDamage(target, damage, { pattern, isUltimate });
            // Preserve active guards and counters, while preventing stacked passive
            // mitigation from turning an unguarded signature hit into ordinary chip.
            if (isUltimate && !isGuard && !isDodge) {
                damage = Math.max(damage, Math.floor(target.maxHp * 0.72));
            }
            const shouldPlayHunterHit = damage > 0 && !isGuard && !isDodge && !hazardHpOnly;
            if (shouldPlayHunterHit) engine.interruptHunterItemAction?.(target, 'hit');
            if (damage > 0) {
                // Moxie check
                if (engine.perkRuntime && engine.perkRuntime.preventCart(target, damage)) {
                    if (!hazardHpOnly) {
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                    }
                    attackResults.push({ index: target.index, result: 'hit' });
                } else if (target.hp - damage <= 0 && target.hasMoxie && engine.random() < 0.75) {
                    target.hp = 1;
                    target.hasMoxie = false;
                    if (!hazardHpOnly) {
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                    }
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
                    } else if (hazardHpOnly) {
                        engine.addLog(`💥 [폭린] ${target.name}의 체력이 폭발로 감소했습니다. (-${damage} HP)`, '#ff8a45');
                        attackResults.push({ index: target.index, result: 'hit' });
                    } else {
                        // A real hit owns the reaction state. Stop ear-covering,
                        // tremor wobble, or wind-pressure before knockback starts.
                        engine.clearHunterInterference?.(target, 'hit');
                        if (actionMachine) actionMachine.cancel(target, 'hitstun');
                        if (engine.weaponMechanics) engine.weaponMechanics.onHit(target);
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                        const hitReaction = HuntMonsterTurnExecutor.hitReactionForPattern(pattern, target);
                        target.hitDuration = hitReaction.durationTicks;
                        target.hitRecoveryTotalTicks = hitReaction.durationTicks;
                        target.hitReactionKind = hitReaction.kind;
                        target.hitKnockbackDirection = hitReaction.knockbackDirection;
                        engine.addLog(`💥 [피격] ${engine.selectedMonster.nameKO}이(가) [${attackName}] 시전! ${target.name}에게 큰 타격! (-${damage} HP, 행동 게이지 초기화)`, '#ff5555');
                        // Hunter-hit voice is deferred until the stun result is known.
                        engine.shakeMonster();
                        engine.triggerHitAnimation(target.index, hitReaction);
                        if (engine.expressHunterEmotion) engine.expressHunterEmotion(target, 'hurt');
                        attackResults.push({ index: target.index, result: 'hit' });
                    }
                }
                // Guard chip is still HP damage, but a successful guard blocks the
                // attack's elemental blight and poison/paralysis/sleep payload.
                if (damage > 0 && !isGuard && !isDodge && engine.blightRuntime
                    && HuntMonsterTurnExecutor.statusAllowed(engine, pattern)) {
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
                    const chainText = Number(target.longSwordForesightChain || 0) > 1
                        ? ` 간파→찌르기→간파 ${target.longSwordForesightChain}회 대응!`
                        : '';
                    engine.addLog(`⚡ [간파베기 성공] ${target.name}이(가) 공격을 흘렸습니다.${chainText} 대회전베기 연계!`, '#c98534');
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
                if (emergencyJumpRequired && isDodge) {
                    engine.actionStateMachine?.cancel(target, 'evade');
                    target.jumpInvulnerableTicks = Math.max(
                        Number(target.jumpInvulnerableTicks || 0),
                        50
                    );
                    engine.callbacks?.onTriggerInvincibleJump?.(target.index, true);
                    engine.showSkillBubble?.(target.index, '긴급회피!');
                } else if (isPerfectGuard || isHammerOffset || isLanceCounter || isChargeBladeGuardPoint) {
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
            if (damage > 0 && !isDodge && !hazardHpOnly) {
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
                const stunRollSucceeded = () => {
                    let stunChance = engine.perkRuntime ? engine.perkRuntime.stunChance(target, 0.15) : 0.15;
                    if (engine.blightRuntime) stunChance = engine.blightRuntime.stunChance(target, stunChance);
                    return engine.random() < stunChance;
                };
                if (HuntMonsterTurnExecutor.canInflictHunterStun(pattern)
                    && damage > 0 && !isGuard && !isDodge && !hazardHpOnly && target.status === 'alive'
                    && (!engine.blightRuntime?.canAct || engine.blightRuntime.canAct(target))
                    && stunRollSucceeded()) {
                    becameStunned = true;
                    let stunDuration = engine.perkRuntime ? engine.perkRuntime.stunDuration(target, 50) : 50;
                    if (engine.blightRuntime) stunDuration = engine.blightRuntime.stunDuration(target, stunDuration);
                    if (HuntMonsterTurnExecutor.isHunterHitRecovering(target)) {
                        target.pendingStunDuration = stunDuration;
                    } else {
                        target.status = 'stunned';
                        target.stunDuration = stunDuration;
                        target.atb = 0;
                        engine.updateWeaponAtbUI(target.index, 0);
                        engine.addLog(`🌀 [기절] ${target.name}이(가) 큰 충격으로 기절했습니다! 행동 게이지가 초기화되며 다음 턴 행동이 불가합니다!`, '#e58e26');
                        if (engine.callbacks.onTriggerStunUI) engine.callbacks.onTriggerStunUI(target.index, true);
                    }
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

        const isTigrexExhaustedTrip = pattern.runtimeImpactEventKind === 'tigrex-exhausted-trip';
        const isTigrexReturnDodgeStuck = pattern.tags?.includes('tigrex-charge-chain')
            && engine.monsterState === 'enraged'
            && Number(pattern.runtimeImpactTimelineIndex) === 1
            && attackResults.some(result => ['dodge', 'miss'].includes(result.result))
            && engine.random() < Number(pattern.stateMachine?.secondReturnDodgeStuck?.chance || 0);
        if (isTigrexExhaustedTrip || isTigrexReturnDodgeStuck) {
            const recoveryMs = isTigrexExhaustedTrip
                ? Number(pattern.stateMachine?.exhaustedReturnTrip?.recoveryMs || 5000)
                : Number(pattern.stateMachine?.secondReturnDodgeStuck?.recoveryMs || 7000);
            HuntMonsterTurnExecutor.enterScriptedKnockdown(
                engine,
                Math.ceil(recoveryMs / 100),
                isTigrexExhaustedTrip ? 'tigrex-exhausted-trip' : 'tigrex-wall-stuck'
            );
            if (isTigrexReturnDodgeStuck) {
                engine.showSkillBubble?.('monster', '💥 이빨이 벽에 박힘!');
                engine.addLog?.(`💥 [벽 충돌] ${engine.selectedMonster.nameKO}의 이빨이 벽에 박혀 무방비 상태가 됐습니다!`, '#ffd06a');
            }
        }

        // Trigger dynamic monster attack animation
        const { type: attackType, emoji } = engine.getMonsterAttackType(attackName, pattern);
        if (!isImpactCommit && engine.callbacks.onTriggerMonsterAttack) {
            engine.callbacks.onTriggerMonsterAttack(attackType, emoji, attackResults, attackName, pattern);
        }
        const authoredInterference = pattern.interference?.kind
            ? {
                kind: String(pattern.interference.kind).replace(/-(?:small|large)$/, ''),
                size: pattern.interference.size
                    || (String(pattern.interference.kind).endsWith('-large') ? 'large' : 'small'),
                scope: pattern.interference.scope,
                directHitSupersedes: pattern.interference.directHitSupersedes
            }
            : null;
        const impactSecondaryInterference = pattern.runtimeImpactSecondaryInterference
            || pattern.secondaryInterference
            || authoredInterference;
        if (impactSecondaryInterference) {
            const directTargetIds = impactSecondaryInterference === authoredInterference
                ? (impactSecondaryInterference.directHitSupersedes
                    ? directDamageTargetIds
                    : new Set())
                : new Set(targetsToHit.map(target => target.index));
            const secondary = impactSecondaryInterference;
            const directIndices = [...directTargetIds];
            targetable.filter(target => {
                if (directTargetIds.has(target.index)) {
                    return secondary.scope === 'all'
                        && Number(target.jumpInvulnerableTicks || 0) <= 0;
                }
                if (secondary.scope === 'adjacent') {
                    return directIndices.some(index =>
                        Math.abs(Number(target.index) - Number(index)) === 1);
                }
                return true;
            }).forEach(target => {
                const applied = engine.applyHunterInterference?.(target, secondary.kind, secondary.size);
                if (applied) {
                    const labels = { tremor: '지진', wind: '풍압', roar: '포효' };
                    engine.addLog(`〰️ [${labels[secondary.kind] || secondary.kind}·${secondary.size === 'large' ? '대' : '소'}] ${target.name}이(가) 행동을 방해받았습니다!`, '#d6b06f');
                }
            });
        }
        if (pattern.tags?.includes('burrow-emerge')) {
            engine.monsterBurrowState = null;
            engine.callbacks?.onTriggerMonsterBurrowPhase?.(
                'emerge',
                resolvedPreparedTargetIndex,
                Number(pattern.phase?.emergeVisualMs || 1450)
            );
        }
        if (pattern.whiffReaction?.kind === 'knockdown'
            && HuntMonsterTurnExecutor.shouldTriggerWhiffReaction(engine, pattern, attackResults)) {
            engine.monsterKnockdownDuration = Math.max(
                Number(engine.monsterKnockdownDuration || 0),
                Number(engine.monsterDefaultKnockdownTicks || 70)
            );
            engine.monsterState = 'knocked_down';
            engine.setMonsterAtbForControl?.('knockdown');
            if (!engine.setMonsterAtbForControl) {
                engine.monsterAtb = HuntMonsterTurnExecutor.atbConfig().monsterAtbAfterControl('knockdown');
                engine.updateMonsterAtbUI(engine.monsterAtb);
            }
            engine.callbacks?.onTriggerMonsterKnockdownAnim?.();
            engine.addLog(`💥 [뿔 박힘] 되돌아온 돌진이 빗나가 ${engine.selectedMonster.nameKO}의 뿔이 지형에 박혔습니다!`, '#ffcf70');
        }
        engine.monsterRecoveryDuration = 0;
        if (engine.monsterFlightRuntime) engine.monsterFlightRuntime.afterAction(engine, pattern);
        engine.monsterTraitRuntime?.afterAction?.(engine, pattern, attackResults);
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterTurnExecutor;
else if (typeof window !== 'undefined') window.HuntMonsterTurnExecutor = HuntMonsterTurnExecutor;
