'use strict';

/**
 * Shared monster implementation contracts.
 *
 * Monster profiles describe what a move does. Runtime executors only interpret
 * these contracts; they must not branch on a monster ID.
 */
class HuntMonsterArchetypeCatalog {
    static ACTION_PHASES = Object.freeze(['telegraph', 'travel', 'impact', 'return', 'recovery']);

    static FLYING_WYVERN_IDS = new Set([
        'rathalos', 'azure_rathalos', 'silver_rathalos',
        'rathian', 'pink_rathian', 'gold_rathian',
        'legiana', 'shrieking_legiana', 'paolumu', 'nightshade_paolumu',
        'bazelgeuse', 'seething_bazelgeuse',
        'diablos', 'black_diablos',
        'tigrex', 'brute_tigrex', 'nargacuga',
        'barioth', 'frostfang_barioth',
        'seregios', 'astalos'
    ]);

    // Taxonomy and actual sustained flight are separate contracts. Tigrex,
    // Nargacuga and Barioth are Flying Wyverns, but their World kits only use
    // short leaps/glides and must never enter the one-minute airborne state.
    static SUSTAINED_FLIGHT_IDS = new Set([
        'rathalos', 'azure_rathalos', 'silver_rathalos',
        'rathian', 'pink_rathian', 'gold_rathian',
        'legiana', 'shrieking_legiana', 'paolumu', 'nightshade_paolumu',
        'bazelgeuse', 'seething_bazelgeuse',
        'seregios', 'astalos'
    ]);

    static AIRBORNE_CAPABLE_IDS = new Set([
        ...this.SUSTAINED_FLIGHT_IDS,
        'pukei_pukei', 'coral_pukei_pukei',
        'kushala_daora', 'namielle', 'alatreon', 'fatalis',
        'valstrax', 'crimson_glow_valstrax'
    ]);

    static MONSTER_BEHAVIORS = Object.freeze({
        rathian: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'small',
            rageStartTick: 800,
            rageDurationTicks: 900,
            rageRecoveryDurationTicks: 300,
            naturalLandingPatternId: null,
            maxEffectiveFlashes: 4,
            flightMode: 'short-chain',
            flightAttemptChance: .40,
            shortFlightDurationTicks: 120,
            flightCooldownTicks: 0,
            flightFailureChanceByBrokenWings: Object.freeze([0, .35, .70]),
            flightFailureStaggerTicks: 50,
            exhaustedFlightWobbleTicks: 30,
            exhaustedFlightLandingStaggerTicks: 30
        }),
        rathalos: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'small',
            rageStartTick: 800,
            rageDurationTicks: 900,
            rageRecoveryDurationTicks: 300,
            rageOpenerPatternId: 'rathalos.backstep_fireball',
            rageOpenerRetryTicks: 450,
            naturalLandingPatternId: 'rathalos.stomp',
            maxEffectiveFlashes: 4,
            flightFailureChanceByBrokenWings: Object.freeze([0, .35, .70]),
            flightFailureStaggerTicks: 50
        }),
        legiana: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'large',
            // 분노 지속이 짧은 쪽(1분).
            rageDurationTicks: 600,
            rageRecoveryDurationTicks: 300,
            rageOpenerTakeoff: true,
            takeoffPreservesReadyAtb: true,
            flightGroundActionRange: Object.freeze([1, 2]),
            flightActionCountByState: Object.freeze({ normal: 2, enraged: 3 }),
            takeoffInterference: Object.freeze({ kind: 'wind', size: 'small' }),
            aerialRepositionRecoveryTicks: 10,
            naturalLandingPatternId: 'legiana.dive_landing',
            maxEffectiveFlashes: 4,
            flightFailureChanceByBrokenWings: Object.freeze([0, .30, .65]),
            flightFailureStaggerTicks: 45,
            traits: Object.freeze([
                Object.freeze({
                    kind: 'ice-coat',
                    attackFx: Object.freeze({
                        emoji: '❄️',
                        className: 'legiana-rage-ice-release',
                        durationMs: 850
                    })
                })
            ])
        }),
        shrieking_legiana: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.12,
            roarSize: 'small',
            rageDurationTicks: 900,
            rageRecoveryDurationTicks: 300,
            naturalLandingPatternId: 'shrieking_legiana.dive_landing',
            maxEffectiveFlashes: 4,
            flightFailureChanceByBrokenWings: Object.freeze([0, .25, .55]),
            flightFailureStaggerTicks: 42,
            traits: Object.freeze([
                Object.freeze({
                    kind: 'ice-coat',
                    attackFx: Object.freeze({
                        emoji: '❄️',
                        className: 'legiana-rage-ice-release',
                        durationMs: 950
                    })
                })
            ])
        }),
        paolumu: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.08,
            roarSize: 'small',
            flightMode: 'short-chain',
            flightAttemptChance: .46,
            shortFlightDurationTicks: 160,
            naturalLandingPatternId: null,
            maxEffectiveFlashes: 4,
            flightFailureChanceByBrokenWings: Object.freeze([0, .35, .72]),
            flightFailureStaggerTicks: 48,
            traits: Object.freeze([
                Object.freeze({ kind: 'inflation', disabledByParts: Object.freeze(['head']) })
            ])
        }),
        nightshade_paolumu: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'small',
            flightMode: 'short-chain',
            flightAttemptChance: .58,
            shortFlightDurationTicks: 190,
            naturalLandingPatternId: null,
            maxEffectiveFlashes: 4,
            flightFailureChanceByBrokenWings: Object.freeze([0, .30, .65]),
            flightFailureStaggerTicks: 44,
            traits: Object.freeze([
                Object.freeze({ kind: 'inflation', disabledByParts: Object.freeze(['head']) })
            ])
        }),
        bazelgeuse: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'large',
            rageDurationTicks: 900,
            rageRecoveryDurationTicks: 300,
            naturalLandingPatternId: null,
            maxEffectiveFlashes: 4,
            flightFailureChanceByBrokenWings: Object.freeze([0, 0, 0]),
            flightFailureStaggerTicks: 44,
            traits: Object.freeze([
                Object.freeze({
                    kind: 'blast-scales',
                    totalLifetimeTicks: 300,
                    heatedFuseTicks: 30,
                    chainDelayTicks: 10,
                    explosionAudioDelayMs: 1000,
                    damageRatio: .30,
                    maxPending: 4,
                    visualPalette: 'red'
                })
            ])
        }),
        seething_bazelgeuse: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.12,
            roarSize: 'large',
            rageDurationTicks: 900,
            rageRecoveryDurationTicks: 300,
            naturalLandingPatternId: 'seething_bazelgeuse.diving_explosion',
            maxEffectiveFlashes: 4,
            flightFailureChanceByBrokenWings: Object.freeze([0, .20, .45]),
            flightFailureStaggerTicks: 40,
            traits: Object.freeze([
                Object.freeze({
                    kind: 'blast-scales', dropCount: 3, heatedDropCount: 4,
                    delayTicks: 18, delayVarianceTicks: 12, damageRatio: .20,
                    explosionAudioDelayMs: 1000,
                    heatedDamageRatio: .28, maxPending: 7, maxHeat: 4, criticalHeat: 3,
                    visualPalette: 'purple'
                })
            ])
        }),
        tigrex: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            exhaustedDamageMultiplier: .70,
            enragedAtbMultiplier: 1.20,
            exhaustedAtbMultiplier: .70,
            enragedAnimationDurationMultiplier: 1 / 1.20,
            exhaustedAnimationDurationMultiplier: 1.30,
            // 분노 지속이 짧은 쪽(1분).
            rageDurationTicks: 600,
            rageRecoveryDurationTicks: 300,
            rageRoarConsumesFullAtb: true,
            roarSize: 'large',
            stamina: Object.freeze({ max: 80, exhaustDurationTicks: 600, pantTicks: 50 }),
            traits: Object.freeze([
                Object.freeze({ kind: 'charge-fatigue', stumbleTicks: 50 })
            ])
        }),
        brute_tigrex: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.12,
            roarSize: 'large',
            traits: Object.freeze([
                Object.freeze({ kind: 'charge-fatigue', stumbleTicks: 24 })
            ])
        }),
        nargacuga: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'small',
            // 분노 지속은 1분(600틱)으로 짧은 편이다. 세 값이 모두 있어야
            // HuntMonsterRules.stateForBattleTime의 주기 계산이 작동한다.
            // rageRecoveryDurationTicks가 없으면 그 분기를 통째로 건너뛰어
            // 800틱 이후 영구 분노가 된다.
            rageStartTick: 800,
            rageDurationTicks: 600,
            rageRecoveryDurationTicks: 300,
            traits: Object.freeze([
                Object.freeze({ kind: 'rage-eyes' }),
                Object.freeze({ kind: 'conditional-trap', trap: 'pitfall', allowedStates: Object.freeze(['enraged']) })
            ])
        }),
        barioth: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'small',
            traits: Object.freeze([
                Object.freeze({
                    kind: 'broken-limb-slip',
                    parts: Object.freeze(['left-front-leg', 'right-front-leg']),
                    // 이동 기술 전체가 아니라, 실제로 앞발 가시로 제동하는
                    // 도약·돌진·착지에만 미끄러짐을 적용한다.
                    patternTags: Object.freeze(['slip-eligible']),
                    baseTicks: 16,
                    perBrokenPartTicks: 8
                })
            ])
        }),
        frostfang_barioth: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.12,
            roarSize: 'small',
            traits: Object.freeze([
                Object.freeze({
                    kind: 'broken-limb-slip',
                    parts: Object.freeze(['left-front-leg', 'right-front-leg']),
                    patternTags: Object.freeze(['slip-eligible']),
                    baseTicks: 14,
                    perBrokenPartTicks: 7
                }),
                Object.freeze({ kind: 'ice-coat' })
            ])
        }),
        gold_rathian: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'small',
            traits: Object.freeze([
                Object.freeze({ kind: 'hellfire' })
            ])
        }),
        silver_rathalos: Object.freeze({
            sourceGame: 'world_iceborne',
            enragedDamageMultiplier: 1.10,
            roarSize: 'small',
            traits: Object.freeze([
                Object.freeze({ kind: 'hellfire' })
            ])
        })
    });

    static VARIANT_BASES = Object.freeze({
        pink_rathian: 'rathian',
        gold_rathian: 'rathian',
        azure_rathalos: 'rathalos',
        silver_rathalos: 'rathalos',
        black_diablos: 'diablos',
        shrieking_legiana: 'legiana',
        nightshade_paolumu: 'paolumu',
        seething_bazelgeuse: 'bazelgeuse',
        brute_tigrex: 'tigrex',
        frostfang_barioth: 'barioth'
    });

    static ARCHETYPES = Object.freeze({
        common: Object.freeze({
            id: 'common',
            actionPhases: HuntMonsterArchetypeCatalog.ACTION_PHASES,
            reactions: Object.freeze({
                groundPartBreakTicks: 28,
                tailSeverTicks: 32,
                normalKnockdownTicks: 70
            })
        }),
        'flying-wyvern': Object.freeze({
            id: 'flying-wyvern',
            parent: 'common',
            actionPhases: HuntMonsterArchetypeCatalog.ACTION_PHASES,
            flight: Object.freeze({
                durationTicks: 600,
                baseCooldownTicks: 300,
                brokenWingCooldownTicks: 150,
                maxCooldownTicks: 600,
                airborneEvadeChance: .5,
                forcedLandingMultiplier: 1.5,
                partBreakForcesLanding: true
            }),
            targeting: Object.freeze({
                blunt: 'head',
                slash: 'tail',
                airborneRanged: 'wing'
            })
        }),
        'grounded-flying-wyvern': Object.freeze({
            id: 'grounded-flying-wyvern',
            parent: 'common',
            actionPhases: HuntMonsterArchetypeCatalog.ACTION_PHASES,
            targeting: Object.freeze({
                blunt: 'head',
                slash: 'tail'
            })
        }),
        'airborne-capable': Object.freeze({
            id: 'airborne-capable',
            parent: 'common',
            actionPhases: HuntMonsterArchetypeCatalog.ACTION_PHASES,
            flight: Object.freeze({
                durationTicks: 600,
                baseCooldownTicks: 300,
                brokenWingCooldownTicks: 150,
                maxCooldownTicks: 600,
                airborneEvadeChance: .5,
                forcedLandingMultiplier: 1.5,
                partBreakForcesLanding: true
            })
        })
    });

    static normalize(value) {
        return String(value || '').toLowerCase().replace(/[-']/g, '_').replace(/[^a-z0-9_]+/g, '');
    }

    static resolve(monster) {
        const authored = this.normalize(monster?.archetype || monster?.skeleton);
        if (authored && this.ARCHETYPES[authored.replace(/_/g, '-')]) {
            return this.ARCHETYPES[authored.replace(/_/g, '-')];
        }
        const id = this.normalize(monster?.id || monster?.nameEN || monster?.name);
        if (this.SUSTAINED_FLIGHT_IDS.has(id)) return this.ARCHETYPES['flying-wyvern'];
        if (this.FLYING_WYVERN_IDS.has(id)) return this.ARCHETYPES['grounded-flying-wyvern'];
        if (this.AIRBORNE_CAPABLE_IDS.has(id)) return this.ARCHETYPES['airborne-capable'];
        return this.ARCHETYPES.common;
    }

    static flight(monster) {
        return this.resolve(monster).flight || null;
    }

    static behavior(monster) {
        const id = this.normalize(monster?.id || monster?.nameEN || monster);
        return this.MONSTER_BEHAVIORS[id]
            || this.MONSTER_BEHAVIORS[this.VARIANT_BASES[id]]
            || Object.freeze({});
    }

    static brokenWingCount(parts) {
        return (parts || []).filter(part => part?.broken && /wing/i.test(String(part.kind || ''))).length;
    }

    static flightCooldownTicks(monster, parts) {
        const flight = this.flight(monster);
        if (!flight) return 0;
        const behavior = this.behavior(monster);
        if (Number.isFinite(Number(behavior.flightCooldownTicks))) {
            return Math.max(0, Number(behavior.flightCooldownTicks));
        }
        return Math.min(
            flight.maxCooldownTicks,
            flight.baseCooldownTicks + this.brokenWingCount(parts) * flight.brokenWingCooldownTicks
        );
    }

    static displayKind(kind) {
        const value = String(kind || '').toLowerCase();
        if (/(head|horn|chin|spike)/.test(value)) return 'head';
        if (/wing/.test(value)) return 'wing';
        if (/tail/.test(value)) return 'tail';
        if (/(back|torso|body)/.test(value)) return 'back';
        if (/(leg|foot)/.test(value)) return 'leg';
        return value || 'part';
    }

    static shortPartLabel(sourceKind, displayKind) {
        const source = String(sourceKind || '').toLowerCase();
        const left = /(^|[-_])left($|[-_])|^left/.test(source);
        const right = /(^|[-_])right($|[-_])|^right/.test(source);
        if (/horn/.test(source)) return '뿔';
        if (/fang|tooth/.test(source)) return '이빨';
        if (/chin/.test(source)) return '턱';
        if (displayKind === 'head') return '머리';
        if (displayKind === 'wing') return left ? '좌익' : right ? '우익' : '날개';
        if (displayKind === 'leg') return left ? '왼발' : right ? '오른발' : '다리';
        if (displayKind === 'tail') return '꼬리';
        if (displayKind === 'back') {
            if (/chest/.test(source)) return '가슴';
            if (/torso|body/.test(source)) return '몸통';
            return '등';
        }
        return '부위';
    }

    static partDisplaySlots(parts) {
        const order = { head: 0, back: 1, leg: 2, wing: 3, tail: 4 };
        return (parts || [])
            .filter(part => part && (part.breakable || part.severable))
            .map((part, index) => {
                const kind = this.displayKind(part.kind);
                const sourceKind = String(part.kind || '');
                return {
                    id: String(part.id ?? `${part.kind}:${index}`),
                    kind,
                    sourceKind,
                    shortLabel: this.shortPartLabel(sourceKind, kind),
                    broken: Boolean(part.broken || part.severed),
                    severed: Boolean(part.severed),
                    order: order[kind] ?? 9,
                    index
                };
            })
            .sort((a, b) => a.order - b.order || a.index - b.index);
    }

    static validatePattern(pattern) {
        const errors = [];
        if (!pattern || !pattern.id) errors.push('pattern.id');
        if (!pattern || !pattern.name) errors.push('pattern.name');
        if (!Number.isFinite(Number(pattern?.windupTicks)) || Number(pattern.windupTicks) < 1) {
            errors.push('pattern.windupTicks');
        }
        const movement = pattern?.movement;
        if (movement && !Number.isFinite(Number(movement.impactTick ?? pattern.impactDelayTicks))) {
            errors.push('movement.impactTick');
        }
        if (movement?.returnsToOrigin && !Number.isFinite(Number(movement.returnTicks))) {
            errors.push('movement.returnTicks');
        }
        return errors;
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntMonsterArchetypeCatalog;
else globalThis.HuntMonsterArchetypeCatalog = HuntMonsterArchetypeCatalog;
