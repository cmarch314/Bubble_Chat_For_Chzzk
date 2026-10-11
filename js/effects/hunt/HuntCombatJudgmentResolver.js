'use strict';

class HuntCombatJudgmentResolver {
    static monsterTurnExecutor() {
        if (typeof HuntMonsterTurnExecutor !== 'undefined') return HuntMonsterTurnExecutor;
        if (typeof require === 'function') return require('./HuntMonsterTurnExecutor.js');
        return null;
    }

    resolve(engine, command) {
        if (!engine || !command) return false;
        const interrupted = Number(engine.monsterKnockdownDuration || 0) > 0
            || Number(engine.monsterStunDuration || 0) > 0
            || ['knocked_down', 'stunned'].includes(String(engine.monsterState || ''));
        const survivesInterruption = HuntCombatJudgmentResolver.monsterTurnExecutor()
            ?.actionPolicy?.().impactSurvivesInterruption?.(command.pattern) === true;
        if (interrupted && !survivesInterruption) {
            engine.cancelMonsterBeatAction?.('judgment-interrupted');
            return false;
        }
        const eventKind = command.eventKind || null;
        if (eventKind === 'blast-scale-drop') {
            engine.monsterTraitRuntime?.dropScaleAtSlot?.(
                engine,
                command.targetIndices?.[0],
                command.sourcePart || null
            );
            return true;
        }
        if (eventKind === 'blast-scale-volley') {
            engine.monsterTraitRuntime?.dropScalesForAction?.(
                engine,
                command.pattern,
                (command.targetIndices || []).map(index => ({ index, result: 'judgment' }))
            );
            return true;
        }
        if (eventKind === 'carpet-dive'
            && engine.monsterTraitRuntime?.interceptAerialImpact?.(
                engine,
                command.pattern,
                command
            )) return true;

        engine.monsterTraitRuntime?.onImpactEvent?.(
            engine,
            command.pattern,
            command,
            command.timelineFinal === true
        );
        const resolution = HuntCombatJudgmentResolver.monsterTurnExecutor()?.executeJudgment?.(engine, command) ?? false;
        // The combat judgment runtime consumes each command once.  Dispatch the
        // conditional cue only after target defense/immunity has been resolved;
        // this prevents Preview and live hunts from disagreeing about hit-only
        // projectile sounds or replaying a multi-target group per hunter.
        if (resolution && command.judgmentGroup) {
            engine.playSFX?.('monster_impact', null, {
                monsterId: engine.selectedMonster?.id,
                patternId: command.pattern?.id,
                patternName: command.pattern?.name,
                patternSlot: `judgment:${encodeURIComponent(String(command.judgmentGroup))}:cue`,
                judgmentResults: resolution.results || [],
                overrideOnly: true
            });
        }
        return resolution;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntCombatJudgmentResolver;
else window.HuntCombatJudgmentResolver = HuntCombatJudgmentResolver;
