class HuntWeaponMechanics {
    // Per-weapon numeric field defaults, applied idempotently each tick in
    // initialize(). Hoisted to a shared frozen constant so the 13-weapon literal
    // is not rebuilt on every hunter tick (4 hunters x 10Hz for the whole stream).
    static WEAPON_FIELD_DEFAULTS = Object.freeze({
        great_sword: { greatSwordCharge: 0, greatSwordChain: 0 },
        long_sword: { spiritGauge: 0, spiritLevel: 0 },
        sword_shield: { snsChain: 0, snsShieldStep: 0, perfectRushStep: 0 },
        dual_blades: { demonStamina: 100, archdemonGauge: 0, dualChain: 0, demonChain: 0, demonDanceStep: 0, archdemonStep: 0, demonToggleCooldown: 0, demonModeMinTicks: 0 },
        hammer: { hammerChargeLevel: 0, hammerNormalStep: 0, hammerBigBangStep: 0, hammerSpinStep: 0 },
        hunting_horn: { echoGauge: 0, melodyBuffTicks: 0, echoBubbleTicks: 0, hornMelodyCursor: 0, recitalPlayed: 0, recitalStartCount: 0 },
        lance: { lanceStep: 0, guardPower: 0, guardBurden: 0, powerGuardCharge: 0, lanceMobilityStep: 0, lanceDashStep: 0 },
        gunlance: { shells: 5, maxShells: 5, wyrmstake: 1, wyvernGauge: 0, wyvernFireCooldown: 0, gunlanceStep: 0, shellStep: 0 },
        charge_blade: { chargeEnergy: 0, phials: 0, shieldChargeDuration: 0, savageAxeTicks: 0, cbSwordStep: 0, cbAxeStep: 0 },
        insect_glaive: { extractDuration: 0, glaiveStep: 0, glaiveCharge: 0 },
        light_bowgun: { magazine: 5, maxMagazine: 5, rapidGauge: 0, wyvernblastCharges: 3, wyvernblastRecharge: 0 },
        heavy_bowgun: { magazine: 4, maxMagazine: 4, ignitionGauge: 0, specialAmmoCooldown: 0, wyvernheartStep: 0 },
        bow: { bowCharge: 0, bowPowerStep: 0, tracerGauge: 0, tracerTicks: 0, bowStamina: 100, fuseArrows: 0 }
    });

    static LONG_SWORD_SPECIAL_SHEATHE_CHANCE = Object.freeze([0, 0.10, 0.20, 1]);

    constructor(random = Math.random) {
        this.random = random;
    }

    static longSwordSpecialSheatheChance(spiritLevel = 0) {
        const level = Math.max(0, Math.min(3, Math.floor(Number(spiritLevel || 0))));
        return HuntWeaponMechanics.LONG_SWORD_SPECIAL_SHEATHE_CHANCE[level];
    }

    static specialActionChance(hunter, authoredBase) {
        const profiles = typeof HuntPersonalityProfiles !== 'undefined'
            ? HuntPersonalityProfiles
            : (typeof require === 'function' ? require('./HuntPersonalityProfiles.js') : null);
        return profiles?.specialActionChance(hunter, authoredBase) ?? authoredBase;
    }

    static atbConfig() {
        return typeof HuntAtbConfig !== 'undefined'
            ? HuntAtbConfig
            : require('./HuntAtbConfig.js');
    }

    static canonicalActions() {
        const atbConfig = this.atbConfig();
        const chargeStageTicks = atbConfig.STANDARD_CHARGE_STAGE_TICKS;
        const chargeStageAuthoredCost = atbConfig.STANDARD_CHARGE_AUTHORED_COST_SECONDS;
        return {
            switch_axe: [
                {
                    id: 'switch_axe.axe_overhead_slash', name: '도끼: 세로베기', dmg: 180, motionValue: 45,
                    requirements: { weaponMode: 'axe' }, effects: { switchGauge: 14 },
                    next: ['switch_axe.axe_wild_swing'], tags: ['sever', 'axe-mode'], audioCue: 'slash_heavy',
                    durationTicks: 10, mechanicEvidence: 'wilds-action-class:cAxeVSlash'
                },
                {
                    id: 'switch_axe.axe_wild_swing', name: '도끼: 붕붕 휘두르기', dmg: 352, motionValue: 88, hits: [23, 21, 23, 21],
                    requirements: { weaponMode: 'axe' }, effects: { switchGauge: 18 },
                    next: ['switch_axe.axe_heavy_slam'], tags: ['sever', 'axe-mode', 'multi-hit'], audioCue: 'slash_heavy',
                    durationTicks: 12, mechanicEvidence: 'wilds-action-class:cAxeDempsey'
                },
                {
                    id: 'switch_axe.axe_heavy_slam', name: '도끼: 강화 내려치기', dmg: 348, motionValue: 87, hits: [15, 72],
                    requirements: { weaponMode: 'axe' }, effects: { switchGauge: 22, powerAxeTicks: 160 },
                    next: ['switch_axe.morph_to_sword', 'switch_axe.axe_overhead_slash'], tags: ['sever', 'axe-mode', 'heavy'], audioCue: 'slash_heavy',
                    durationTicks: 14, mechanicEvidence: 'wilds-action-class:cAxeDempseyFinish'
                },
                {
                    id: 'switch_axe.morph_to_sword', name: '변형베기: 도끼→검', dmg: 136, motionValue: 34,
                    requirements: { weaponMode: 'axe', minSwitchGauge: 35 }, effects: { weaponMode: 'sword', switchGauge: -6 },
                    next: ['switch_axe.sword_rising_slash'], tags: ['sever', 'morph'], audioCue: 'mechanical_transform',
                    durationTicks: 8, mechanicEvidence: 'wilds-action-class:cChangeAxeToSword'
                },
                {
                    id: 'switch_axe.sword_rising_slash', name: '검: 올려베기', dmg: 232, motionValue: 58,
                    requirements: { weaponMode: 'sword', minSwitchGauge: 10 }, effects: { switchGauge: -10, ampGauge: 18 },
                    next: ['switch_axe.sword_double_slash'], tags: ['sever', 'sword-mode'], audioCue: 'sword_slash',
                    durationTicks: 9, mechanicEvidence: 'wilds-action-class:cSwordUSlashRight/cSwordUSlashLeft'
                },
                {
                    id: 'switch_axe.sword_double_slash', name: '검: 2연베기', dmg: 192, motionValue: 48, hits: [22, 26],
                    requirements: { weaponMode: 'sword', minSwitchGauge: 14 }, effects: { switchGauge: -14, ampGauge: 27 },
                    next: ['switch_axe.sword_heavenward_flurry'], tags: ['sever', 'sword-mode', 'multi-hit'], audioCue: 'sword_slash',
                    durationTicks: 11, mechanicEvidence: 'wilds-action-class:cSwordDoubleSlash'
                },
                {
                    id: 'switch_axe.sword_heavenward_flurry', name: '검: 비천연격', dmg: 320, motionValue: 80, hits: [34, 46],
                    requirements: { weaponMode: 'sword', minSwitchGauge: 18 }, effects: { switchGauge: -18, ampGauge: 38 },
                    next: ['switch_axe.sword_rising_slash', 'switch_axe.zero_sum_discharge'], tags: ['sever', 'sword-mode', 'multi-hit'], audioCue: 'sword_slash',
                    durationTicks: 14, mechanicEvidence: 'wilds-action-class:cSwordSpinSlash'
                },
                {
                    id: 'switch_axe.sword_counter_stance', name: '검 카운터 준비', dmg: 0, motionValue: 0,
                    requirements: { weaponMode: 'sword', minSwitchGauge: 15, monsterPressure: true },
                    effects: { switchCounterWaiting: true, atbAfterAction: 76 },
                    tags: ['preparation', 'counter', 'switch-axe-sword-counter'], audioCue: 'none',
                    windupTicks: 2, activeTicks: 9, recoveryTicks: 2, durationTicks: 13,
                    mechanicEvidence: 'wilds-motion-values:sword-counter-rising-slash'
                },
                {
                    id: 'switch_axe.sword_counter_rising', name: '검: 카운터 올려베기', dmg: 328, motionValue: 82, hits: [37, 45],
                    requirements: { weaponMode: 'sword', switchCounterReady: true },
                    effects: { switchCounterWaiting: false, switchCounterReady: false, switchGauge: -14, ampGauge: 38 },
                    tags: ['sever', 'counter', 'sword-mode', 'multi-hit'], audioCue: 'counter', durationTicks: 11,
                    mechanicEvidence: 'wilds-motion-values:sword-counter-rising-slash-success-37+45'
                },
                {
                    id: 'switch_axe.sword_counter_miss', name: '검 카운터 실패', dmg: 0, motionValue: 0,
                    requirements: { weaponMode: 'sword', switchCounterWaiting: true },
                    effects: { switchCounterWaiting: false, switchCounterReady: false, switchGauge: -8 },
                    tags: ['counter-fail'], audioCue: 'none', durationTicks: 6,
                    mechanicEvidence: 'wilds-mechanic:sword-counter-rising-slash-missed-window'
                },
                {
                    id: 'switch_axe.unbridled_slash', name: '검: 압축 해방 베기', dmg: 640, motionValue: 160, hits: [85, 25, 25, 25],
                    requirements: { weaponMode: 'sword', minSwitchGauge: 35, amped: false },
                    effects: { switchGauge: -30, ampGauge: 25 },
                    tags: ['sever', 'sword-mode', 'multi-hit', 'explosive', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 17,
                    mechanicEvidence: 'wilds-motion-values:unbridled-slash-85+25x3'
                },
                {
                    id: 'switch_axe.zero_sum_discharge', name: '검: 영거리 속성해방 찌르기', dmg: 760, motionValue: 190, hits: [25, 12, 12, 12, 12, 12, 105],
                    requirements: { weaponMode: 'sword', amped: true, minSwitchGauge: 22 }, effects: { switchGauge: -22, ampGauge: -18 },
                    next: ['switch_axe.morph_to_axe'], tags: ['sever', 'sword-mode', 'multi-hit', 'explosive', 'finisher'], audioCue: 'explosive_heavy',
                    durationTicks: 18, mechanicEvidence: 'wilds-action-class:cSwordDischargeStab/cSwordDischargeStabFinish'
                },
                {
                    id: 'switch_axe.full_release_slash', name: '검: 풀 릴리스 슬래시', dmg: 1040, motionValue: 260, hits: [50, 82, 20, 20, 20, 68],
                    requirements: { weaponMode: 'sword', amped: true, minSwitchGauge: 35 },
                    effects: { weaponMode: 'axe', switchGauge: -35, consumeAmp: true },
                    next: ['switch_axe.axe_overhead_slash'], tags: ['sever', 'sword-mode', 'multi-hit', 'explosive', 'finisher'], audioCue: 'explosive_heavy',
                    durationTicks: 20, mechanicEvidence: 'wilds-action-class:cSwordDischargeSwitchChargeFinish/cSwordDischargeSwitchFinish'
                },
                {
                    id: 'switch_axe.morph_to_axe', name: '변형베기: 검→도끼', dmg: 140, motionValue: 36,
                    requirements: { weaponMode: 'sword' }, effects: { weaponMode: 'axe', switchGauge: 14 },
                    next: ['switch_axe.axe_overhead_slash'], tags: ['sever', 'morph'], audioCue: 'mechanical_transform',
                    durationTicks: 8, mechanicEvidence: 'wilds-action-class:cChangeSwordToAxe'
                }
            ],
            hammer: [
                { id: 'hammer.overhead_1', name: '종베기 I', dmg: 164, motionValue: 41, stun: 20, requirements: { hammerNormalStep: 0 }, effects: { hammerNormalStep: 1 }, next: ['hammer.overhead_2'], tags: ['blunt', 'hammer-normal'], audioCue: 'blunt_light', durationTicks: 8, mechanicEvidence: 'wilds-motion-value:overhead-smash-i' },
                { id: 'hammer.overhead_2', name: '종베기 II', dmg: 180, motionValue: 45, stun: 25, requirements: { hammerNormalStep: 1 }, effects: { hammerNormalStep: 2 }, next: ['hammer.upswing'], tags: ['blunt', 'hammer-normal'], audioCue: 'blunt_heavy', durationTicks: 9, mechanicEvidence: 'wilds-motion-value:overhead-smash-ii' },
                { id: 'hammer.upswing', name: '어퍼스윙', dmg: 380, motionValue: 95, stun: 50, requirements: { hammerNormalStep: 2 }, effects: { hammerNormalStep: 0 }, tags: ['blunt', 'hammer-normal', 'finisher'], audioCue: 'blunt_heavy', durationTicks: 12, mechanicEvidence: 'wilds-motion-value:upswing+150-parry' },
                { id: 'hammer.big_bang_1', name: '빅뱅 I', dmg: 172, motionValue: 43, stun: 5, requirements: { hammerBigBangStep: 0 }, effects: { hammerBigBangStep: 1, atbAfterAction: 76 }, next: ['hammer.big_bang_2'], tags: ['blunt', 'big-bang'], audioCue: 'blunt_light', durationTicks: 7, mechanicEvidence: 'wilds-motion-value:big-bang-i' },
                { id: 'hammer.big_bang_2', name: '빅뱅 II', dmg: 192, motionValue: 48, stun: 5, requirements: { hammerBigBangStep: 1 }, effects: { hammerBigBangStep: 2, atbAfterAction: 74 }, next: ['hammer.big_bang_3'], tags: ['blunt', 'big-bang'], audioCue: 'blunt_light', durationTicks: 7, mechanicEvidence: 'wilds-motion-value:big-bang-ii' },
                { id: 'hammer.big_bang_3', name: '빅뱅 III', dmg: 280, motionValue: 70, stun: 10, requirements: { hammerBigBangStep: 2 }, effects: { hammerBigBangStep: 3, atbAfterAction: 70 }, next: ['hammer.big_bang_4'], tags: ['blunt', 'big-bang'], audioCue: 'blunt_heavy', durationTicks: 9, mechanicEvidence: 'wilds-motion-value:big-bang-iii' },
                { id: 'hammer.big_bang_4', name: '빅뱅 IV', dmg: 360, motionValue: 90, stun: 10, requirements: { hammerBigBangStep: 3 }, effects: { hammerBigBangStep: 4, atbAfterAction: 66 }, next: ['hammer.big_bang_finisher'], tags: ['blunt', 'big-bang'], audioCue: 'blunt_heavy', durationTicks: 10, mechanicEvidence: 'wilds-motion-value:big-bang-iv' },
                { id: 'hammer.big_bang_finisher', name: '빅뱅 피니시', dmg: 744, motionValue: 186, hits: [28, 28, 130], stun: 25, requirements: { hammerBigBangStep: 4 }, effects: { hammerBigBangStep: 0 }, tags: ['blunt', 'big-bang', 'multi-hit', 'heavy', 'finisher'], audioCue: 'blunt_heavy', durationTicks: 18, mechanicEvidence: 'wilds-motion-value:big-bang-v-1+2+3' },
                { id: 'hammer.spinning_start', name: '회전공격', dmg: 92, motionValue: 23, stun: 5, requirements: { hammerSpinStep: 0 }, effects: { hammerSpinStep: 1, atbAfterAction: 80 }, next: ['hammer.spinning_mid'], tags: ['blunt', 'spinning'], audioCue: 'blunt_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:spinning-bludgeon-start' },
                { id: 'hammer.spinning_mid', name: '회전 연타', dmg: 216, motionValue: 54, hits: [18, 18, 18], stun: 30, requirements: { hammerSpinStep: 1 }, effects: { hammerSpinStep: 2, atbAfterAction: 72 }, next: ['hammer.spinning_finish', 'hammer.spinning_upswing'], tags: ['blunt', 'spinning', 'multi-hit'], audioCue: 'blunt_light', durationTicks: 9, mechanicEvidence: 'wilds-motion-value:spinning-bludgeon-mid-x3' },
                { id: 'hammer.spinning_finish', name: '회전 옆찍기', dmg: 120, motionValue: 30, stun: 15, requirements: { hammerSpinStep: 2 }, effects: { hammerSpinStep: 0 }, tags: ['blunt', 'spinning'], audioCue: 'blunt_heavy', durationTicks: 8, mechanicEvidence: 'wilds-motion-value:spinning-side-smash' },
                { id: 'hammer.spinning_upswing', name: '회전 강어퍼', dmg: 400, motionValue: 100, stun: 40, requirements: { hammerSpinStep: 2 }, effects: { hammerSpinStep: 0 }, tags: ['blunt', 'spinning', 'heavy', 'finisher'], audioCue: 'blunt_heavy', durationTicks: 12, mechanicEvidence: 'wilds-motion-value:spinning-strong-upswing+150-parry' },
                { id: 'hammer.offset_stance', name: '상쇄 어퍼 준비', dmg: 0, motionValue: 0, requirements: { monsterPressure: true }, effects: { hammerOffsetWaiting: true, atbAfterAction: 78 }, tags: ['blunt', 'preparation', 'counter', 'hammer-offset'], audioCue: 'none', windupTicks: 1, activeTicks: 10, recoveryTicks: 2, durationTicks: 13, mechanicEvidence: 'wilds-motion-value:upswing-150-parry-window' },
                { id: 'hammer.offset_miss', name: '상쇄 대기 해제', dmg: 0, motionValue: 0, requirements: {}, effects: { hammerOffsetWaiting: false, atbAfterAction: 70 }, tags: ['preparation'], audioCue: 'none', durationTicks: 3, mechanicEvidence: 'autobattler-rule:unanswered-offset-window-expires' },
                { id: 'hammer.offset_followup_spinslam', name: '상쇄 후 회전 내려치기', dmg: 1040, motionValue: 260, hits: [20, 20, 20, 50, 210], stun: 58, requirements: { hammerOffsetFollowupReady: true }, effects: { hammerOffsetFollowupReady: false }, tags: ['blunt', 'spinning', 'multi-hit', 'heavy', 'finisher'], audioCue: 'blunt_heavy', durationTicks: 20, mechanicEvidence: 'wilds-motion-value:follow-up-spinslam-spin+1+2' },
                { id: 'hammer.focus_earthquake', name: '집중 타격【진천】', dmg: 600, motionValue: 150, hits: [15, 30, 30, 30, 45], stun: 60, requirements: { monsterWounded: true }, effects: { hammerFocusCooldown: 180 }, tags: ['blunt', 'focus-strike', 'multi-hit', 'finisher'], audioCue: 'blunt_heavy', durationTicks: 17, mechanicEvidence: 'wilds-motion-value:focus-strike-earthquake-start+spin-x3+finish' },
                {
                    id: 'hammer.charge_1', name: '차지 1단계', dmg: 0, motionValue: 0,
                    requirements: { hammerChargeLevel: 0 }, effects: { hammerChargeLevel: 1, atbAfterAction: 94 },
                    tags: ['blunt', 'charge', 'preparation'], audioCue: 'none',
                    atbCostSeconds: chargeStageAuthoredCost,
                    windupTicks: 1, activeTicks: 1, recoveryTicks: 3, durationTicks: chargeStageTicks,
                    mechanicEvidence: 'wilds-action-class:cChargeStart/cCharge1Swing1'
                },
                {
                    id: 'hammer.release_1', name: '1차지: 차지 사이드 블로', dmg: 105, motionValue: 28, stun: 32,
                    requirements: { hammerChargeLevel: 1 }, effects: { hammerChargeLevel: 0 },
                    tags: ['blunt', 'charge-release'], audioCue: 'charged_swing_light', durationTicks: 7,
                    mechanicEvidence: 'wilds-action-class:cCharge1Swing1'
                },
                {
                    id: 'hammer.charge_2', name: '차지 2단계', dmg: 0, motionValue: 0,
                    requirements: { hammerChargeLevel: 1 }, effects: { hammerChargeLevel: 2, atbAfterAction: 94 },
                    tags: ['blunt', 'charge', 'preparation'], audioCue: 'none',
                    atbCostSeconds: chargeStageAuthoredCost,
                    windupTicks: 1, activeTicks: 1, recoveryTicks: 3, durationTicks: chargeStageTicks,
                    mechanicEvidence: 'wilds-action-class:cCharge2Swing'
                },
                {
                    id: 'hammer.release_2', name: '2차지: 어퍼', dmg: 225, motionValue: 58, stun: 72,
                    requirements: { hammerChargeLevel: 2 }, effects: { hammerChargeLevel: 0 },
                    tags: ['blunt', 'charge-release'], audioCue: 'charged_swing_light', durationTicks: 10,
                    mechanicEvidence: 'wilds-action-class:cCharge2Swing/cBuffCharge2Swing'
                },
                {
                    id: 'hammer.charge_3', name: '차지 3단계', dmg: 0, motionValue: 0,
                    requirements: { hammerChargeLevel: 2 }, effects: { hammerChargeLevel: 3, atbAfterAction: 92 },
                    tags: ['blunt', 'charge', 'preparation'], audioCue: 'none',
                    atbCostSeconds: chargeStageAuthoredCost,
                    windupTicks: 1, activeTicks: 1, recoveryTicks: 3, durationTicks: chargeStageTicks,
                    mechanicEvidence: 'wilds-action-class:cCharge3Lash/cCharge3Spin'
                },
                {
                    id: 'hammer.release_3', name: '3차지: 강 내려치기', dmg: 405, motionValue: 105, stun: 125,
                    requirements: { hammerChargeLevel: 3 }, effects: { hammerChargeLevel: 0 },
                    tags: ['blunt', 'charge-release', 'heavy'], audioCue: 'charged_swing_heavy', durationTicks: 14,
                    mechanicEvidence: 'wilds-action-class:cCharge3Lash'
                },
                {
                    id: 'hammer.mighty_charge', name: '혼신 모으기', dmg: 0, motionValue: 0,
                    requirements: { hammerChargeLevel: 3 }, effects: { hammerChargeLevel: 4, atbAfterAction: 90 },
                    tags: ['blunt', 'charge', 'preparation', 'finisher-setup'], audioCue: 'none',
                    atbCostSeconds: chargeStageAuthoredCost,
                    windupTicks: 1, activeTicks: 1, recoveryTicks: 3, durationTicks: chargeStageTicks,
                    mechanicEvidence: 'wilds-action-class:cSuperChargeStartToLoop'
                },
                {
                    id: 'hammer.mighty_charge_slam', name: '혼신 모아 내려치기', dmg: 640, motionValue: 165, stun: 190,
                    requirements: { hammerChargeLevel: 4 }, effects: { hammerChargeLevel: 0 },
                    tags: ['blunt', 'charge-release', 'heavy', 'finisher'], audioCue: 'charged_swing_heavy', durationTicks: 19,
                    mechanicEvidence: 'wilds-action-class:cSuperChargeAttackSmash'
                }
            ],
            ...this.extendedActions()
        };
    }

    static extendedActions() {
        const greatSwordChargeTicks = this.atbConfig().STANDARD_CHARGE_STAGE_TICKS;
        const prep = (id, name, requirements, effects, evidence, durationTicks = 4) => ({
            id, name, dmg: 0, motionValue: 0, requirements, effects,
            tags: ['preparation', ...(/charge|draw/.test(id) ? ['charge'] : [])], audioCue: 'none', durationTicks,
            mechanicEvidence: evidence
        });
        return {
            great_sword: [
                { ...prep('great_sword.charge_1', '모아베기 · 1차지', { greatSwordChain: 0, greatSwordCharge: 0 }, { greatSwordCharge: 1, atbAfterAction: 94 }, 'wilds-action-class:cIdleToCharge', greatSwordChargeTicks), atbCostSeconds: 5 },
                prep('great_sword.charge_2', '모아베기 · 2차지', { greatSwordChain: 0, greatSwordCharge: 1 }, { greatSwordCharge: 2, atbAfterAction: 93 }, 'wilds-motion-reference:charged-slash-hold-loop', greatSwordChargeTicks),
                prep('great_sword.charge_3', '모아베기 · 3차지', { greatSwordChain: 0, greatSwordCharge: 2 }, { greatSwordCharge: 3, atbAfterAction: 92 }, 'wilds-motion-reference:charged-slash-hold-loop', greatSwordChargeTicks),
                { id: 'great_sword.charged_slash', name: '모아베기', dmg: 330, motionValue: 82, requirements: { greatSwordChain: 0, minGreatSwordCharge: 1 }, effects: { greatSwordCharge: 0, greatSwordChain: 1 }, next: ['great_sword.strong_charge_1'], tags: ['sever', 'charge-release', 'heavy'], audioCue: 'charged_slash', durationTicks: 15, mechanicEvidence: 'wilds-action-class:cVerticalSlash' },
                prep('great_sword.strong_charge_1', '강 모아베기 · 1차지', { greatSwordChain: 1, greatSwordCharge: 0 }, { greatSwordCharge: 1, atbAfterAction: 94 }, 'wilds-action-class:cStrongCharge', greatSwordChargeTicks),
                prep('great_sword.strong_charge_2', '강 모아베기 · 2차지', { greatSwordChain: 1, greatSwordCharge: 1 }, { greatSwordCharge: 2, atbAfterAction: 93 }, 'wilds-motion-reference:strong-charged-slash-hold-loop', greatSwordChargeTicks),
                prep('great_sword.strong_charge_3', '강 모아베기 · 3차지', { greatSwordChain: 1, greatSwordCharge: 2 }, { greatSwordCharge: 3, atbAfterAction: 92 }, 'wilds-motion-reference:strong-charged-slash-hold-loop', greatSwordChargeTicks),
                { id: 'great_sword.strong_charged_slash', name: '강 모아베기', dmg: 470, motionValue: 118, requirements: { greatSwordChain: 1, minGreatSwordCharge: 1 }, effects: { greatSwordCharge: 0, greatSwordChain: 2 }, next: ['great_sword.true_charge_1'], tags: ['sever', 'charge-release', 'heavy'], audioCue: 'charged_slash', durationTicks: 17, mechanicEvidence: 'wilds-action-class:cStrongVerticalSlash' },
                prep('great_sword.true_charge_1', '참 모아베기 · 1차지', { greatSwordChain: 2, greatSwordCharge: 0 }, { greatSwordCharge: 1, atbAfterAction: 94 }, 'wilds-action-class:cSpiritCharge', greatSwordChargeTicks),
                prep('great_sword.true_charge_2', '참 모아베기 · 2차지', { greatSwordChain: 2, greatSwordCharge: 1 }, { greatSwordCharge: 2, atbAfterAction: 93 }, 'wilds-motion-reference:true-charged-slash-hold-loop', greatSwordChargeTicks),
                prep('great_sword.true_charge_3', '참 모아베기 · 3차지', { greatSwordChain: 2, greatSwordCharge: 2 }, { greatSwordCharge: 3, atbAfterAction: 92 }, 'wilds-motion-reference:true-charged-slash-hold-loop', greatSwordChargeTicks),
                { id: 'great_sword.true_charged_slash', name: '참 모아베기', dmg: 760, motionValue: 190, hits: [15, 175], requirements: { greatSwordChain: 2, minGreatSwordCharge: 1 }, effects: { greatSwordCharge: 0, greatSwordChain: 0 }, tags: ['sever', 'charge-release', 'heavy', 'finisher'], audioCue: 'true_charged_slash', durationTicks: 21, mechanicEvidence: 'wilds-action-class:cSpiritVerticalSlash' },
                { id: 'great_sword.tackle', name: '태클', dmg: 95, motionValue: 26, stun: 55, requirements: { minGreatSwordCharge: 1 }, effects: { greatSwordCharge: 0, advanceGreatSwordChain: true, atbAfterAction: 86 }, tags: ['blunt', 'counter', 'tackle'], audioCue: 'blunt_light', durationTicks: 7, mechanicEvidence: 'wilds-action-class:cTackle' },
                { id: 'great_sword.wide_slash', name: '횡베기', dmg: 168, motionValue: 42, effects: {}, next: ['great_sword.kick'], tags: ['sever'], audioCue: 'slash_heavy', durationTicks: 9, mechanicEvidence: 'wilds-motion-values:wide-slash-42' },
                { id: 'great_sword.kick', name: '발차기', dmg: 20, motionValue: 5, stun: 10, effects: {}, tags: ['blunt'], audioCue: 'blunt_light', durationTicks: 5, mechanicEvidence: 'wilds-motion-values:kick-5-stun-10' }
            ],
            long_sword: [
                { id: 'long_sword.overhead_slash', name: '내려베기', dmg: 105, motionValue: 26, effects: { spiritGauge: 35 }, next: ['long_sword.thrust'], tags: ['sever'], audioCue: 'slash_light', durationTicks: 8, mechanicEvidence: 'wilds-action-class:cSlash1NoCombo' },
                { id: 'long_sword.thrust', name: '찌르기', dmg: 75, motionValue: 18, effects: { spiritGauge: 32 }, next: ['long_sword.rising_slash'], tags: ['sever'], audioCue: 'slash_light', durationTicks: 7, mechanicEvidence: 'wilds-action-class:cStub' },
                { id: 'long_sword.rising_slash', name: '올려베기', dmg: 90, motionValue: 22, effects: { spiritGauge: 30 }, next: ['long_sword.spirit_slash_1'], tags: ['sever'], audioCue: 'slash_light', durationTicks: 8, mechanicEvidence: 'wilds-action-class:cUSlash' },
                { id: 'long_sword.spirit_slash_1', name: '기인베기 I', dmg: 145, motionValue: 36, requirements: { minSpiritGauge: 28 }, effects: { spiritGauge: -28 }, next: ['long_sword.spirit_slash_2'], tags: ['sever', 'spirit'], audioCue: 'slash_heavy', durationTicks: 9, mechanicEvidence: 'wilds-action-class:cKijinSlash1NoCombo' },
                { id: 'long_sword.spirit_slash_2', name: '기인베기 II', dmg: 185, motionValue: 46, requirements: { minSpiritGauge: 20 }, effects: { spiritGauge: -20 }, next: ['long_sword.spirit_slash_3'], tags: ['sever', 'spirit'], audioCue: 'slash_heavy', durationTicks: 10, mechanicEvidence: 'wilds-action-class:cKijinSlash2' },
                { id: 'long_sword.spirit_slash_3', name: '기인베기 III', dmg: 220, motionValue: 55, requirements: { minSpiritGauge: 18 }, effects: { spiritGauge: -18 }, next: ['long_sword.spirit_roundslash'], tags: ['sever', 'spirit'], audioCue: 'slash_heavy', durationTicks: 11, mechanicEvidence: 'wilds-action-class:cKijinSlash3' },
                { id: 'long_sword.spirit_roundslash', name: '대회전베기', dmg: 285, motionValue: 70, requirements: { minSpiritGauge: 12 }, effects: { spiritGauge: -12, spiritRoundslashReady: false }, next: ['long_sword.overhead_slash'], tags: ['sever', 'spirit', 'finisher'], audioCue: 'slash_heavy', durationTicks: 13, mechanicEvidence: 'wilds-action-class:cKijinSlashRound;spirit-level-on-confirmed-hit' },
                { id: 'long_sword.helm_breaker', name: '기인투구깨기', dmg: 560, motionValue: 140, hits: [20, 20, 20, 20, 20, 20, 20], requirements: { minSpiritLevel: 3 }, effects: { spiritLevel: -1, iaiHelmBreakerReady: false, openSpiritRelease: true }, next: ['long_sword.spirit_release_slash'], tags: ['sever', 'spirit', 'multi-hit', 'finisher'], audioCue: 'slash_heavy', durationTicks: 18, mechanicEvidence: 'wilds-action-class:cKabutowariLand' },
                { id: 'long_sword.spirit_release_slash', name: '기인해방베기', dmg: 520, motionValue: 104, hits: [18, 20, 22, 22, 22], requirements: { spiritReleaseReady: true }, effects: { spiritReleaseReady: false }, tags: ['sever', 'spirit', 'multi-hit', 'finisher'], audioCue: 'slash_heavy', durationTicks: 19, mechanicEvidence: 'wilds-motion-reference:spirit-release-slash' },
                { id: 'long_sword.foresight', name: '간파베기', dmg: 125, motionValue: 31, requirements: { monsterPressure: true }, effects: { spiritGauge: 20 }, tags: ['sever', 'counter', 'foresight', 'reaction-only'], audioCue: 'counter', durationTicks: 9, mechanicEvidence: 'wilds-action-class:cMikiriSlash' },
                { id: 'long_sword.special_sheathe', name: '특수납도', dmg: 0, motionValue: 0, requirements: { minSpiritLevel: 1 }, effects: { specialSheatheReady: true, atbAfterAction: 58 }, tags: ['preparation', 'counter', 'iai'], audioCue: 'none', windupTicks: 2, activeTicks: 60, recoveryTicks: 2, durationTicks: 64, mechanicEvidence: 'world-action-reference:special-sheathe-to-iai-spirit-slash;balance:six-second-counter-wait-window' },
                { id: 'long_sword.iai_counter_fail', name: '거합베기 실패', dmg: 0, motionValue: 0, requirements: { specialSheatheReady: true }, effects: { specialSheatheReady: false, iaiHelmBreakerReady: false, spiritLevel: -1, spiritGauge: -25 }, tags: ['counter-fail'], audioCue: 'none', durationTicks: 6, mechanicEvidence: 'world-mechanic:iai-spirit-slash-miss-consumes-spirit-level' }
            ],
            sword_shield: [
                { id: 'sword_shield.chop', name: '베어내리기', dmg: 72, motionValue: 18, effects: { snsChain: 1 }, next: ['sword_shield.lateral_slash'], tags: ['sever', 'sns-flow'], audioCue: 'slash_light', durationTicks: 5, atbCostSeconds: 0.5, mechanicEvidence: 'wilds-action-class:cSlash1' },
                { id: 'sword_shield.lateral_slash', name: '가로베기', dmg: 82, motionValue: 20, requirements: { snsChain: 1 }, effects: { snsChain: 2 }, next: ['sword_shield.return_stroke'], tags: ['sever', 'sns-flow'], audioCue: 'slash_light', durationTicks: 5, atbCostSeconds: 0.5, mechanicEvidence: 'wilds-action-class:cHorizontalSlash' },
                { id: 'sword_shield.return_stroke', name: '되돌려베기', dmg: 88, motionValue: 22, requirements: { snsChain: 2 }, effects: { snsChain: 3 }, next: ['sword_shield.spinning_rising_slash'], tags: ['sever', 'sns-flow'], audioCue: 'slash_light', durationTicks: 5, atbCostSeconds: 0.5, mechanicEvidence: 'wilds-motion-reference:return-stroke' },
                { id: 'sword_shield.spinning_rising_slash', name: '회전 올려베기', dmg: 102, motionValue: 26, requirements: { snsChain: 3 }, effects: { snsChain: 4 }, next: ['sword_shield.spinning_reaper'], tags: ['sever', 'sns-flow'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-reference:spinning-rising-slash' },
                { id: 'sword_shield.spinning_reaper', name: '회전 수확베기', dmg: 126, motionValue: 32, requirements: { snsChain: 4 }, effects: { snsChain: 0 }, next: ['sword_shield.chop'], tags: ['sever', 'sns-flow'], audioCue: 'slash_light', durationTicks: 7, mechanicEvidence: 'wilds-motion-reference:spinning-reaper' },
                { id: 'sword_shield.charged_chop', name: '모아베기', dmg: 265, motionValue: 66, requirements: { minSnsChain: 2 }, effects: { snsChain: 0 }, tags: ['sever', 'sns-finisher'], audioCue: 'slash_heavy', durationTicks: 11, mechanicEvidence: 'wilds-motion-reference:charged-chop' },
                { id: 'sword_shield.shield_bash_1', name: '방패치기 I', dmg: 76, motionValue: 19, stun: 42, effects: { snsShieldStep: 1 }, next: ['sword_shield.shield_bash_2'], tags: ['blunt', 'shield-bash', 'sns-flow'], audioCue: 'blunt_light', durationTicks: 5, mechanicEvidence: 'wilds-action-reference:shield-attack-chain' },
                { id: 'sword_shield.shield_bash_2', name: '방패치기 II', dmg: 84, motionValue: 21, stun: 48, requirements: { snsShieldStep: 1 }, effects: { snsShieldStep: 2 }, next: ['sword_shield.shield_bash_3'], tags: ['blunt', 'shield-bash', 'sns-flow'], audioCue: 'blunt_light', durationTicks: 5, mechanicEvidence: 'wilds-action-reference:shield-attack-chain' },
                { id: 'sword_shield.shield_bash_3', name: '방패치기 III', dmg: 108, motionValue: 27, stun: 68, requirements: { snsShieldStep: 2 }, effects: { snsShieldStep: 3 }, next: ['sword_shield.guard_slash'], tags: ['blunt', 'shield-bash', 'sns-flow'], audioCue: 'blunt_heavy', durationTicks: 6, mechanicEvidence: 'wilds-action-reference:shield-attack-chain' },
                prep('sword_shield.guard_slash', '가드베기', { snsShieldStep: 3 }, { snsShieldStep: 0, snsGuardSlashReady: true, atbAfterAction: 82 }, 'wilds-action-class:cGuardSlash', 5),
                { ...prep('sword_shield.backstep', '백스텝', {}, { snsBackstepReady: true, atbAfterAction: 88 }, 'wilds-action-class:cBackStepCharge', 5), tags: ['preparation', 'backstep', 'counter'] },
                { id: 'sword_shield.perfect_rush_1', name: '저스트 러시 I', dmg: 165, motionValue: 42, requirements: { snsBackstepReady: true }, effects: { snsBackstepReady: false, perfectRushStep: 2, atbAfterAction: 72 }, next: ['sword_shield.perfect_rush_2'], tags: ['sever', 'perfect-rush'], audioCue: 'slash_heavy', durationTicks: 8, mechanicEvidence: 'wilds-action-class:cJustRushCombo0' },
                { id: 'sword_shield.perfect_rush_2', name: '저스트 러시 II', dmg: 225, motionValue: 56, requirements: { perfectRushStep: 2 }, effects: { perfectRushStep: 3, atbAfterAction: 68 }, next: ['sword_shield.perfect_rush_finisher'], tags: ['blunt', 'perfect-rush'], audioCue: 'blunt_heavy', durationTicks: 9, mechanicEvidence: 'wilds-action-class:cJustRushCombo1' },
                { id: 'sword_shield.perfect_rush_finisher', name: '저스트 러시 피니시', dmg: 390, motionValue: 98, requirements: { perfectRushStep: 3 }, effects: { perfectRushStep: 0, snsChain: 0 }, tags: ['sever', 'perfect-rush', 'finisher'], audioCue: 'slash_heavy', durationTicks: 13, mechanicEvidence: 'wilds-action-class:cJustRushCombo2' },
                { id: 'sword_shield.charged_slash', name: '모아 뛰어베기', dmg: 185, motionValue: 46, requirements: { snsBackstepReady: true }, effects: { snsBackstepReady: false, snsAerialReady: true }, tags: ['sever', 'charge'], audioCue: 'slash_heavy', durationTicks: 9, mechanicEvidence: 'wilds-motion-reference:charged-slash-2' },
                { id: 'sword_shield.jumping_slash', name: '점프 베기', dmg: 170, motionValue: 43, requirements: { snsAerialReady: true }, effects: { snsAerialReady: false, snsChain: 1 }, tags: ['sever', 'aerial'], audioCue: 'slash_heavy', durationTicks: 10, mechanicEvidence: 'wilds-motion-reference:jumping-slash' },
                { id: 'sword_shield.falling_bash', name: '방패 내려찍기', dmg: 310, motionValue: 78, stun: 145, requirements: { snsAerialReady: true }, effects: { snsAerialReady: false, snsChain: 0 }, tags: ['blunt', 'aerial', 'sns-finisher'], audioCue: 'blunt_heavy', durationTicks: 13, mechanicEvidence: 'wilds-motion-reference:falling-bash' },
                { id: 'sword_shield.plunging_thrust', name: '내려꽂기', dmg: 290, motionValue: 73, hits: [16, 18, 20, 19], requirements: { snsAerialReady: true }, effects: { snsAerialReady: false, snsChain: 0 }, tags: ['sever', 'aerial', 'multi-hit', 'sns-finisher'], audioCue: 'slash_heavy', durationTicks: 13, mechanicEvidence: 'wilds-motion-reference:plunging-thrust' },
                { ...prep('sword_shield.perfect_guard', '퍼펙트 가드', { monsterPressure: true }, { snsPerfectGuardReady: true, atbAfterAction: 76 }, 'wilds-action-reference:perfect-guard', 5), tags: ['preparation', 'guard-point', 'perfect-guard'] },
                { id: 'sword_shield.counter_slash', name: '카운터베기', dmg: 225, motionValue: 56, requirements: { snsCounterReady: true }, effects: { snsCounterReady: false, snsChain: 1 }, tags: ['sever', 'counter', 'sns-finisher'], audioCue: 'counter', durationTicks: 8, mechanicEvidence: 'wilds-motion-reference:counter-slash' }
            ],
            dual_blades: [
                prep('dual_blades.enter_demon', '귀인화', { demonMode: false, minArchdemonGauge: 100 }, { demonMode: true, atbAfterAction: 92 }, 'wilds-action-class:cKijinOn', 3),
                prep('dual_blades.exit_demon', '귀인화 해제', { demonMode: true }, { demonMode: false, demonDanceStep: 0, atbAfterAction: 88 }, 'wilds-controls:demon-mode-toggle-off', 3),
                { id: 'dual_blades.double_slash', name: '이단베기', dmg: 76, motionValue: 19, hits: [9, 10], requirements: { demonMode: false, dualChain: 0 }, effects: { dualChain: 1, archdemonGauge: 25 }, next: ['dual_blades.double_slash_return'], tags: ['sever', 'multi-hit', 'dual-flow'], audioCue: 'slash_light', durationTicks: 5, mechanicEvidence: 'wilds-action-class:cTwiceSlash' },
                { id: 'dual_blades.double_slash_return', name: '이단되돌려베기', dmg: 88, motionValue: 22, hits: [10, 12], requirements: { demonMode: false, dualChain: 1 }, effects: { dualChain: 2, archdemonGauge: 30 }, next: ['dual_blades.circle_slash'], tags: ['sever', 'multi-hit', 'dual-flow'], audioCue: 'slash_light', durationTicks: 5, mechanicEvidence: 'wilds-motion-reference:double-slash-return' },
                { id: 'dual_blades.circle_slash', name: '차륜베기', dmg: 112, motionValue: 28, hits: [8, 9, 11], requirements: { demonMode: false, dualChain: 2 }, effects: { dualChain: 0, archdemonGauge: 35 }, next: ['dual_blades.double_slash'], tags: ['sever', 'multi-hit', 'dual-flow'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-reference:circle-slash' },
                { id: 'dual_blades.demon_fang', name: '귀인연참', dmg: 128, motionValue: 32, hits: [9, 11, 12], requirements: { demonMode: true, minArchdemonGauge: 12, demonChain: 0 }, effects: { demonChain: 1, archdemonGauge: -12 }, next: ['dual_blades.demon_double_slash'], tags: ['sever', 'multi-hit', 'demon', 'dual-flow'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-action-class:cKijinChain1NoCombo' },
                { id: 'dual_blades.demon_double_slash', name: '귀인이단베기', dmg: 152, motionValue: 38, hits: [10, 12, 16], requirements: { demonMode: true, minArchdemonGauge: 14, demonChain: 1 }, effects: { demonChain: 2, archdemonGauge: -14 }, next: ['dual_blades.demon_flurry'], tags: ['sever', 'multi-hit', 'demon', 'dual-flow'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-action-class:cKijinTwiceSlash' },
                { id: 'dual_blades.demon_flurry', name: '귀인육단베기', dmg: 224, motionValue: 56, hits: [7, 8, 9, 9, 11, 12], requirements: { demonMode: true, minArchdemonGauge: 18, demonChain: 2 }, effects: { demonChain: 3, archdemonGauge: -18 }, next: ['dual_blades.demon_roundslash'], tags: ['sever', 'multi-hit', 'demon', 'dual-flow'], audioCue: 'slash_light', durationTicks: 8, mechanicEvidence: 'wilds-action-class:cKijinSixTimeSlash' },
                { id: 'dual_blades.demon_roundslash', name: '귀인차륜베기', dmg: 176, motionValue: 44, hits: [10, 14, 20], requirements: { demonMode: true, minArchdemonGauge: 16, demonChain: 3 }, effects: { demonChain: 0, archdemonGauge: -16 }, next: ['dual_blades.demon_fang'], tags: ['sever', 'multi-hit', 'demon', 'dual-flow'], audioCue: 'slash_light', durationTicks: 7, mechanicEvidence: 'wilds-motion-reference:demon-roundslash' },
                { id: 'dual_blades.blade_dance_1', name: '귀인난무 I', dmg: 138, motionValue: 34, hits: [7, 8, 9, 10], requirements: { demonMode: true, minArchdemonGauge: 18, demonDanceStep: 0 }, effects: { demonDanceStep: 1, demonChain: 0, archdemonGauge: -18, atbAfterAction: 74 }, next: ['dual_blades.blade_dance_2'], tags: ['sever', 'multi-hit', 'demon', 'blade-dance'], audioCue: 'slash_light', durationTicks: 7, mechanicEvidence: 'wilds-action-class:cRanbu1' },
                { id: 'dual_blades.blade_dance_2', name: '귀인난무 II', dmg: 206, motionValue: 52, hits: [8, 9, 10, 11, 14], requirements: { demonMode: true, minArchdemonGauge: 20, demonDanceStep: 1 }, effects: { demonDanceStep: 2, archdemonGauge: -20, atbAfterAction: 68 }, next: ['dual_blades.blade_dance'], tags: ['sever', 'multi-hit', 'demon', 'blade-dance'], audioCue: 'slash_light', durationTicks: 9, mechanicEvidence: 'wilds-action-class:cRanbu2' },
                { id: 'dual_blades.blade_dance', name: '귀인난무 III', dmg: 390, motionValue: 98, hits: [7, 8, 9, 9, 10, 11, 13, 15, 16], requirements: { demonMode: true, minArchdemonGauge: 28, demonDanceStep: 2 }, effects: { demonDanceStep: 0, demonChain: 0, archdemonGauge: -28 }, tags: ['sever', 'multi-hit', 'demon', 'blade-dance', 'finisher'], audioCue: 'slash_heavy', durationTicks: 15, mechanicEvidence: 'wilds-action-class:cRanbu3' },
                { id: 'dual_blades.archdemon_rush', name: '귀인돌진연참 · 귀인강화', dmg: 142, motionValue: 36, hits: [10, 12, 14], requirements: { demonMode: false, archdemonMode: true, archdemonStep: 0 }, effects: { archdemonStep: 1, archdemonGauge: -10 }, next: ['dual_blades.archdemon_flurry'], tags: ['sever', 'multi-hit', 'archdemon', 'dual-flow'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-action-class:cKijinRush' },
                { id: 'dual_blades.archdemon_flurry', name: '귀인연속베기 · 귀인강화', dmg: 194, motionValue: 49, hits: [9, 10, 13, 17], requirements: { demonMode: false, archdemonStep: 1 }, effects: { archdemonStep: 2, archdemonGauge: -12 }, next: ['dual_blades.archdemon_slash'], tags: ['sever', 'multi-hit', 'archdemon', 'dual-flow'], audioCue: 'slash_light', durationTicks: 8, mechanicEvidence: 'wilds-motion-reference:archdemon-flurry' },
                { id: 'dual_blades.archdemon_slash', name: '귀인강화 연참', dmg: 270, motionValue: 68, hits: [13, 15, 18, 22], requirements: { demonMode: false, archdemonStep: 2 }, effects: { archdemonStep: 0, archdemonGauge: -18 }, tags: ['sever', 'multi-hit', 'archdemon', 'finisher'], audioCue: 'slash_heavy', durationTicks: 10, mechanicEvidence: 'wilds-motion-reference:archdemon-finish' }
            ],
            hunting_horn: [
                { id: 'hunting_horn.note_red', name: '좌 내젓기', dmg: 105, motionValue: 26, stun: 32, effects: { hornNote: 'red' }, tags: ['blunt', 'note', 'horn-flow'], audioCue: 'blunt_light', durationTicks: 7, mechanicEvidence: 'wilds-action-class:cLeftAttack' },
                { id: 'hunting_horn.note_blue', name: '우 내젓기', dmg: 115, motionValue: 29, stun: 34, effects: { hornNote: 'blue' }, tags: ['blunt', 'note', 'horn-flow'], audioCue: 'blunt_light', durationTicks: 7, mechanicEvidence: 'wilds-action-class:cRightAttack' },
                { id: 'hunting_horn.note_green', name: '후방 공격', dmg: 150, motionValue: 38, stun: 46, effects: { hornNote: 'green' }, tags: ['blunt', 'note', 'horn-flow'], audioCue: 'blunt_heavy', durationTicks: 8, mechanicEvidence: 'wilds-action-class:cBackAttack' },
                prep('hunting_horn.recital_start', '연주 준비', { minStoredMelodies: 1, recitalActive: false }, { recitalActive: true, beginRecital: true, atbAfterAction: 92 }, 'wilds-action-class:cMStart1', 3),
                { id: 'hunting_horn.recital_strike', name: '연주 타격', dmg: 178, motionValue: 45, stun: 58, requirements: { minStoredMelodies: 1, recitalActive: true }, effects: { consumeStoredMelody: true, echoGauge: 12, atbAfterAction: 90 }, tags: ['blunt', 'support', 'recital'], audioCue: 'blunt_heavy', durationTicks: 7, mechanicEvidence: 'wilds-mechanic:performance-consumes-one-stocked-melody-per-stage' },
                prep('hunting_horn.recital_finish', '연주 마무리', { recitalActive: true }, { recitalActive: false, finishRecital: true, atbAfterAction: 76 }, 'wilds-action-reference:performance-finish', 4),
                { id: 'hunting_horn.echo_bubble', name: '향옥 설치', dmg: 90, motionValue: 22, requirements: { minEchoGauge: 30 }, effects: { echoGauge: -30, echoBubbleTicks: 120 }, tags: ['blunt', 'support'], audioCue: 'blunt_light', durationTicks: 9, mechanicEvidence: 'wilds-action-class-candidate:cNewAddMStartAttack00_01' },
                { id: 'hunting_horn.offset_melody', name: '상쇄의 선율', dmg: 315, motionValue: 78, stun: 95, requirements: { minEchoGauge: 60, monsterPressure: true }, effects: { echoGauge: -60 }, tags: ['blunt', 'support', 'counter', 'offset'], audioCue: 'blunt_heavy', durationTicks: 13, mechanicEvidence: 'wilds-action-class:cSpParrySoundAttackEnd' }
            ],
            lance: [
                { id: 'lance.mid_thrust_1', name: '중단찌르기 I', dmg: 104, motionValue: 26, requirements: { lanceStep: 0 }, effects: { lanceStep: 1 }, next: ['lance.mid_thrust_2'], tags: ['sever', 'lance-poke'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:mid-thrust-i-ii' },
                { id: 'lance.mid_thrust_2', name: '중단찌르기 II', dmg: 104, motionValue: 26, requirements: { lanceStep: 1 }, effects: { lanceStep: 2 }, next: ['lance.high_thrust_3'], tags: ['sever', 'lance-poke'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:mid-thrust-i-ii' },
                { id: 'lance.high_thrust_3', name: '상단찌르기 III', dmg: 168, motionValue: 42, requirements: { lanceStep: 2 }, effects: { lanceStep: 0, guardPower: 10 }, tags: ['sever', 'lance-poke', 'finisher'], audioCue: 'slash_heavy', durationTicks: 7, mechanicEvidence: 'wilds-motion-value:high-thrust-iii' },
                { ...prep('lance.counter_stance', '카운터 자세', { monsterPressure: true }, { lanceCounterWaiting: true, atbAfterAction: 82 }, 'wilds-action-class:cAttackCancelGuard', 6), tags: ['preparation', 'counter', 'guard-point', 'lance-counter'] },
                { id: 'lance.counter_thrust', name: '카운터 찌르기', dmg: 292, motionValue: 73, requirements: { lanceCounterReady: true }, effects: { lanceCounterReady: false, lanceCounterWaiting: false, guardPower: -10 }, tags: ['sever', 'counter', 'finisher'], audioCue: 'counter', durationTicks: 9, mechanicEvidence: 'wilds-motion-value:charge-counter-lv3' },
                { ...prep('lance.power_guard_1', '파워 가드 · 1단계', { monsterPressure: true, powerGuardCharge: 0 }, { powerGuardCharge: 1, powerGuardWaiting: true, atbAfterAction: 88 }, 'wilds-action-class:cSuperGuardStart', 4), tags: ['preparation', 'guard-point', 'lance-power-guard'] },
                { ...prep('lance.power_guard_2', '파워 가드 · 2단계', { powerGuardCharge: 1 }, { powerGuardCharge: 2, powerGuardWaiting: true, guardBurden: 5, atbAfterAction: 86 }, 'wilds-action-class:cSuperGuardLoop', 4), tags: ['preparation', 'guard-point', 'lance-power-guard'] },
                { ...prep('lance.power_guard_3', '파워 가드 · 3단계', { powerGuardCharge: 2 }, { powerGuardCharge: 3, powerGuardWaiting: true, guardBurden: 7, atbAfterAction: 84 }, 'wilds-action-class:cSuperGuardLoop', 4), tags: ['preparation', 'guard-point', 'lance-power-guard'] },
                { id: 'lance.payback_thrust', name: '되갚아주기 찌르기', dmg: 340, motionValue: 85, requirements: { powerGuardReady: true }, effects: { powerGuardReady: false, powerGuardWaiting: false, powerGuardCharge: 0, guardBurden: -12 }, tags: ['sever', 'counter', 'multi-hit', 'finisher'], hits: [35, 50], audioCue: 'slash_heavy', durationTicks: 12, mechanicEvidence: 'wilds-motion-value:double-counter-thrust-lv3' },
                { ...prep('lance.guard_dash', '가드 대시', {}, { lanceMobilityStep: 1, atbAfterAction: 78 }, 'wilds-action-reference:guard-dash', 5), tags: ['preparation', 'guard-point', 'lance-mobility'] },
                { id: 'lance.leaping_thrust', name: '뛰어들어 찌르기', dmg: 232, motionValue: 58, hits: [29, 29], requirements: { lanceMobilityStep: 1 }, effects: { lanceMobilityStep: 0, guardPower: 8 }, tags: ['sever', 'multi-hit', 'lance-mobility'], audioCue: 'slash_heavy', durationTicks: 8, mechanicEvidence: 'wilds-motion-value:leaping-thrust-x2' },
                { ...prep('lance.dash_start', '돌진', {}, { lanceDashStep: 1, atbAfterAction: 80 }, 'wilds-action-reference:dash-attack', 5), tags: ['preparation', 'lance-dash'] },
                { id: 'lance.dash_attack', name: '가속 돌진', dmg: 204, motionValue: 51, hits: [17, 17, 17], requirements: { lanceDashStep: 1 }, effects: { lanceDashStep: 2, atbAfterAction: 72 }, tags: ['sever', 'multi-hit', 'lance-dash'], audioCue: 'slash_light', durationTicks: 8, mechanicEvidence: 'wilds-motion-value:dash-attack-x3' },
                { id: 'lance.finishing_twin_thrust', name: '피니시 2단 찌르기', dmg: 420, motionValue: 105, hits: [35, 70], requirements: { lanceDashStep: 2 }, effects: { lanceDashStep: 0 }, tags: ['sever', 'multi-hit', 'lance-dash', 'finisher'], audioCue: 'slash_heavy', durationTicks: 11, mechanicEvidence: 'wilds-motion-value:finishing-twin-thrust-1+2' }
            ],
            gunlance: [
                { id: 'gunlance.guard_thrust', name: '가드 찌르기', dmg: 72, motionValue: 18, effects: { gunlanceStep: 0, shellStep: 0 }, tags: ['sever', 'guard-point', 'gunlance-melee'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:guard-thrust' },
                { id: 'gunlance.lateral_thrust', name: '수평 찌르기', dmg: 96, motionValue: 24, requirements: { gunlanceStep: 0 }, effects: { gunlanceStep: 1 }, next: ['gunlance.rising_slash'], tags: ['sever', 'gunlance-melee'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:lateral-thrust-i-ii' },
                { id: 'gunlance.rising_slash', name: '베어올리기', dmg: 152, motionValue: 38, requirements: { gunlanceStep: 1 }, effects: { gunlanceStep: 2 }, next: ['gunlance.slam'], tags: ['sever', 'gunlance-melee'], audioCue: 'slash_light', durationTicks: 7, mechanicEvidence: 'wilds-motion-value:rising-slash' },
                { id: 'gunlance.slam', name: '내려치기', dmg: 228, motionValue: 57, requirements: { gunlanceStep: 2 }, effects: { gunlanceStep: 3 }, next: ['gunlance.full_burst'], tags: ['sever', 'heavy', 'gunlance-melee'], audioCue: 'slash_heavy', durationTicks: 9, mechanicEvidence: 'wilds-motion-value:overhead-smash' },
                { id: 'gunlance.full_burst', name: '풀버스트', dmg: 350, motionValue: 70, hits: [14, 14, 14, 14, 14], requirements: { gunlanceStep: 3, minShells: 2 }, effects: { consumeAllShells: true, gunlanceStep: 4, wyvernGauge: 24 }, next: ['gunlance.sweep'], tags: ['explosive', 'multi-hit', 'fixed-damage', 'gunlance-fullburst'], audioCue: 'explosive_heavy', durationTicks: 12, mechanicEvidence: 'wilds-shelling:fullburst-normal-lv4-x5' },
                { id: 'gunlance.sweep', name: '휘둘러 베기', dmg: 160, motionValue: 40, requirements: { gunlanceStep: 4 }, effects: { gunlanceStep: 5 }, next: ['gunlance.wyrmstake_attach', 'gunlance.quick_reload'], tags: ['sever', 'gunlance-melee'], audioCue: 'slash_heavy', durationTicks: 8, mechanicEvidence: 'wilds-motion-value:sweep' },
                { id: 'gunlance.wyrmstake_attach', name: '용항 장전', dmg: 100, motionValue: 25, requirements: { gunlanceStep: 5, minWyrmstake: 1 }, effects: { wyrmstake: -1, gunlanceStep: 6, atbAfterAction: 72 }, tags: ['sever', 'wyrmstake-attach'], audioCue: 'mechanical_transform', durationTicks: 7, mechanicEvidence: 'wilds-motion-value:wyrmstake-attach' },
                { id: 'gunlance.wyrmstake_detonate', name: '용항포 폭발', dmg: 376, motionValue: 94, hits: [8, 8, 8, 8, 8, 8, 8, 38], requirements: { gunlanceStep: 6 }, effects: { gunlanceStep: 0, wyvernGauge: 30 }, tags: ['explosive', 'multi-hit', 'fixed-damage', 'finisher', 'wyrmstake'], audioCue: 'explosive_heavy', durationTicks: 12, mechanicEvidence: 'wilds-motion-value:normal-wyrmstake-lv4-ticks+explosion' },
                { id: 'gunlance.shell_1', name: '포격', dmg: 120, motionValue: 10, requirements: { shellStep: 0, minShells: 1 }, effects: { shells: -1, shellStep: 1, wyvernGauge: 8, atbAfterAction: 76 }, tags: ['explosive', 'fixed-damage', 'gunlance-shell'], audioCue: 'explosive_light', durationTicks: 6, mechanicEvidence: 'wilds-shelling:normal-shell-lv4' },
                { id: 'gunlance.shell_2', name: '연속 포격', dmg: 120, motionValue: 10, requirements: { shellStep: 1, minShells: 1 }, effects: { shells: -1, shellStep: 2, wyvernGauge: 8, atbAfterAction: 74 }, tags: ['explosive', 'fixed-damage', 'gunlance-shell'], audioCue: 'explosive_light', durationTicks: 6, mechanicEvidence: 'wilds-shelling:normal-shell-lv4' },
                { id: 'gunlance.shell_wyrmstake', name: '포격 연계 용항포', dmg: 400, motionValue: 100, hits: [10, 10, 10, 10, 60], requirements: { shellStep: 2, minWyrmstake: 1 }, effects: { wyrmstake: -1, shellStep: 0, wyvernGauge: 28 }, tags: ['explosive', 'multi-hit', 'fixed-damage', 'wyrmstake', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 13, mechanicEvidence: 'wilds-action-reference:shell-to-wyrmstake' },
                { id: 'gunlance.wyrmstake_full_blast', name: '용항 풀버스트', dmg: 640, motionValue: 130, hits: [20, 12, 12, 12, 12, 12, 25, 25], requirements: { gunlanceStep: 3, minShells: 3, minWyrmstake: 1 }, effects: { consumeAllShells: true, wyrmstake: -1, gunlanceStep: 0, wyvernGauge: 38 }, tags: ['explosive', 'multi-hit', 'fixed-damage', 'wyrmstake', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 18, mechanicEvidence: 'wilds-motion-value:wyrmstake-full-blast-thrust+attach+shells' },
                { ...prep('gunlance.wyvern_fire_charge', '용격포 충전', { minWyvernGauge: 100 }, { wyvernFireCharging: true, atbAfterAction: 62 }, 'wilds-action-class:cRyuugekiStart', 12), tags: ['preparation', 'guard-point', 'wyvern-fire-charge'] },
                { id: 'gunlance.wyvern_fire', name: '용격포', dmg: 780, motionValue: 156, hits: [52, 52, 52], requirements: { wyvernFireCharging: true }, effects: { wyvernFireCharging: false, wyvernGauge: -100, wyvernFireCooldown: 140, gunlanceStep: 0 }, tags: ['explosive', 'heavy', 'fixed-damage', 'multi-hit', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 21, mechanicEvidence: 'wilds-shelling:normal-wyvernfire-lv4-x3' },
                prep('gunlance.quick_reload', '퀵 리로드', { maxShells: 5 }, { reloadShells: true, gunlanceStep: 2, shellStep: 0, atbAfterAction: 78 }, 'wilds-action-class:cQuickReload', 7)
            ],
            charge_blade: [
                { id: 'charge_blade.sword_slash', name: '검 전진베기', dmg: 72, motionValue: 18, requirements: { chargeBladeMode: 'sword', cbSwordStep: 0 }, effects: { chargeEnergy: 18, cbSwordStep: 1 }, next: ['charge_blade.sword_return_stroke'], tags: ['sever', 'sword-mode'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:sword-forward-slash' },
                { id: 'charge_blade.sword_return_stroke', name: '검 돌려베기', dmg: 72, motionValue: 18, requirements: { chargeBladeMode: 'sword', cbSwordStep: 1 }, effects: { chargeEnergy: 18, cbSwordStep: 2 }, next: ['charge_blade.charged_double_slash'], tags: ['sever', 'sword-mode'], audioCue: 'slash_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:sword-return-stroke' },
                { id: 'charge_blade.charged_double_slash', name: '모아 2연베기', dmg: 164, motionValue: 41, hits: [25, 16], requirements: { chargeBladeMode: 'sword', cbSwordStep: 2 }, effects: { chargeEnergy: 38, cbSwordStep: 3 }, next: ['charge_blade.shield_thrust'], tags: ['sever', 'sword-mode', 'multi-hit'], audioCue: 'charged_slash', durationTicks: 10, mechanicEvidence: 'wilds-motion-value:charged-double-slash-1+2' },
                { id: 'charge_blade.shield_thrust', name: '방패찌르기', dmg: 84, motionValue: 21, hits: [15, 6], requirements: { chargeBladeMode: 'sword', cbSwordStep: 3 }, effects: { chargeEnergy: 12, cbSwordStep: 0 }, tags: ['sever', 'sword-mode', 'multi-hit', 'guard-point'], audioCue: 'blunt_light', durationTicks: 6, mechanicEvidence: 'wilds-motion-value:sword-shield-thrust-1+2' },
                prep('charge_blade.load_phials', '병 충전', { chargeBladeMode: 'sword', minChargeEnergy: 45 }, { loadPhials: true, chargeEnergy: -100, atbAfterAction: 78 }, 'wilds-action-class:cSwordEnergyCharge', 7),
                prep('charge_blade.charge_shield', '방패·도끼 동시 강화', { chargeBladeMode: 'sword', minPhials: 3, shieldCharged: false }, { consumePhials: 3, shieldChargeTicks: 240, savageAxeTicks: 240, cbSwordStep: 0, atbAfterAction: 70 }, 'autobattler-rule:shield-and-power-axe-unified+wilds-elemental-roundslash', 9),
                prep('charge_blade.refresh_shield', '방패·도끼 강화 연장', { chargeBladeMode: 'sword', minPhials: 3, shieldCharged: true }, { consumePhials: 3, shieldChargeTicks: 240, savageAxeTicks: 240, cbSwordStep: 0, atbAfterAction: 70 }, 'autobattler-rule:refresh-unified-shield-power-axe-before-expiry', 9),
                { ...prep('charge_blade.guard_point', '변형베기 가드 포인트', { chargeBladeMode: 'sword', monsterPressure: true }, { cbGuardWaiting: true, atbAfterAction: 80 }, 'wilds-action-class:cChangeSwordToAxeAttack', 6), tags: ['preparation', 'guard-point', 'charge-blade-guard'] },
                { id: 'charge_blade.morph_axe', name: '변형베기 · 도끼', dmg: 216, motionValue: 54, requirements: { chargeBladeMode: 'sword', minPhials: 1 }, effects: { chargeBladeMode: 'axe', cbAxeStep: 0 }, next: ['charge_blade.axe_overhead'], tags: ['sever', 'morph', 'guard-point'], audioCue: 'mechanical_transform', durationTicks: 9, mechanicEvidence: 'wilds-motion-value:sword-morph-slash' },
                { id: 'charge_blade.axe_overhead', name: '도끼 내려베기', dmg: 216, motionValue: 54, requirements: { chargeBladeMode: 'axe', cbAxeStep: 0 }, effects: { cbAxeStep: 1 }, next: ['charge_blade.element_discharge_1'], tags: ['sever', 'axe-mode'], audioCue: 'slash_heavy', durationTicks: 9, mechanicEvidence: 'wilds-motion-value:axe-overhead-slash' },
                { id: 'charge_blade.element_discharge_1', name: '속성해방베기 I', dmg: 260, motionValue: 65, requirements: { chargeBladeMode: 'axe', cbAxeStep: 1, minPhials: 1 }, effects: { consumePhials: 1, cbAxeStep: 2 }, next: ['charge_blade.element_discharge_2'], tags: ['sever', 'axe-mode', 'explosive'], audioCue: 'explosive_heavy', durationTicks: 11, mechanicEvidence: 'wilds-motion-value:axe-elemental-discharge-i+phial' },
                { id: 'charge_blade.element_discharge_2', name: '속성해방베기 II', dmg: 420, motionValue: 105, hits: [35, 58, 12], requirements: { chargeBladeMode: 'axe', cbAxeStep: 2, minPhials: 1 }, effects: { consumePhials: 1, cbAxeStep: 3 }, next: ['charge_blade.aed'], tags: ['sever', 'axe-mode', 'explosive', 'multi-hit'], audioCue: 'explosive_heavy', durationTicks: 13, mechanicEvidence: 'wilds-motion-value:axe-elemental-discharge-ii-1+2+phial' },
                { id: 'charge_blade.aed', name: '고출력 속성해방베기', dmg: 336, motionValue: 84, requirements: { chargeBladeMode: 'axe', cbAxeStep: 3, minPhials: 1 }, effects: { consumePhials: 1, cbAxeStep: 0, chargeBladeMode: 'sword' }, tags: ['sever', 'axe-mode', 'explosive', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 14, mechanicEvidence: 'wilds-motion-value:axe-amped-elemental-discharge+phial' },
                { id: 'charge_blade.saed', name: '초고출력 속성해방베기', dmg: 620, motionValue: 155, requirements: { chargeBladeMode: 'axe', minPhials: 3, shieldCharged: true }, effects: { consumeAllPhials: true, chargeBladeMode: 'sword' }, tags: ['sever', 'axe-mode', 'explosive', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 21, mechanicEvidence: 'wilds-action-class:cAxeSuperDischargeSlash' },
                { id: 'charge_blade.savage_axe', name: '강화 도끼 회전베기', dmg: 424, motionValue: 106, hits: [58, 12, 12, 12, 12], requirements: { chargeBladeMode: 'axe', shieldCharged: true, cbAxeStep: 1, minPhials: 1 }, effects: { consumePhials: 1, cbAxeStep: 2 }, next: ['charge_blade.element_discharge_2'], tags: ['sever', 'axe-mode', 'multi-hit', 'power-axe'], audioCue: 'slash_heavy', durationTicks: 14, mechanicEvidence: 'wilds-motion-value:savage-axe+power-axe-ticks' },
                { id: 'charge_blade.morph_sword', name: '변형베기 · 검', dmg: 135, motionValue: 34, requirements: { chargeBladeMode: 'axe' }, effects: { chargeBladeMode: 'sword' }, tags: ['sever', 'morph', 'guard-point'], audioCue: 'mechanical_transform', durationTicks: 9, mechanicEvidence: 'wilds-action-class:cChangeAxeToSwordAttack' }
            ],
            insect_glaive: [
                prep('insect_glaive.extract_red', '벌레 발사 · 빨강 진액', { missingExtract: 'red' }, { addExtract: 'red', atbAfterAction: 65 }, 'wilds-action-class:cGunShotAim', 14),
                prep('insect_glaive.extract_white', '벌레 발사 · 흰색 진액', { missingExtract: 'white' }, { addExtract: 'white', atbAfterAction: 65 }, 'wilds-action-class:cGunShotAim', 14),
                prep('insect_glaive.extract_orange', '벌레 발사 · 주황 진액', { missingExtract: 'orange' }, { addExtract: 'orange', atbAfterAction: 65 }, 'wilds-action-class:cGunShotAim', 14),
                { id: 'insect_glaive.rising_slash', name: '강화 연속베어올리기', dmg: 185, motionValue: 46, requirements: { tripleExtract: true }, effects: { glaiveStep: 1 }, next: ['insect_glaive.tornado_slash'], tags: ['sever', 'multi-hit'], audioCue: 'slash_light', durationTicks: 18, mechanicEvidence: 'wilds-action-class:cBatonUSlashSuper' },
                { id: 'insect_glaive.tornado_slash', name: '비원베기', dmg: 305, motionValue: 76, requirements: { tripleExtract: true, glaiveStep: 1 }, effects: { glaiveStep: 0, airborne: true }, next: ['insect_glaive.descending_thrust'], tags: ['sever', 'multi-hit'], audioCue: 'slash_heavy', durationTicks: 24, mechanicEvidence: 'wilds-action-class:cBatonSpinSlashSuper' },
                { id: 'insect_glaive.descending_thrust', name: '급습찌르기', dmg: 455, motionValue: 114, requirements: { airborne: true }, effects: { airborne: false, glaiveCharge: 0 }, tags: ['sever', 'multi-hit', 'finisher'], audioCue: 'slash_heavy', durationTicks: 30, mechanicEvidence: 'wilds-action-class:cBatonJDiveAttack' },
                prep('insect_glaive.descending_charge_1', '강 급습베기 · 1단 충전', { tripleExtract: true, glaiveCharge: 0 }, { glaiveCharge: 1, atbAfterAction: 70 }, 'wilds-motion-values:strong-descending-slash-lv1', 10),
                prep('insect_glaive.descending_charge_2', '강 급습베기 · 2단 충전', { tripleExtract: true, glaiveCharge: 1 }, { glaiveCharge: 2, atbAfterAction: 68 }, 'wilds-motion-values:strong-descending-slash-lv2', 10),
                { id: 'insect_glaive.strong_descending_slash', name: '강 급습베기', dmg: 576, motionValue: 144, hits: [32, 12, 18, 18, 18, 46], requirements: { tripleExtract: true, glaiveCharge: 2 }, effects: { glaiveCharge: 0, spiralReady: true, atbAfterAction: 45 }, next: ['insect_glaive.rising_spiral_slash'], tags: ['sever', 'multi-hit', 'charge-release', 'heavy'], audioCue: 'slash_heavy', durationTicks: 34, mechanicEvidence: 'wilds-motion-values:strong-descending-slash-lv2-total-144' },
                { id: 'insect_glaive.rising_spiral_slash', name: '비천나선참', dmg: 352, motionValue: 88, hits: [8, 8, 8, 8, 8, 8, 8, 8, 24], requirements: { tripleExtract: true, spiralReady: true }, effects: { spiralReady: false, consumeExtracts: true, airborne: true }, tags: ['sever', 'multi-hit', 'kinsect-joint', 'finisher'], audioCue: 'slash_heavy', durationTicks: 38, mechanicEvidence: 'wilds-motion-values:rising-spiral-lv2-64+kinsect-joint-24' },
                { id: 'insect_glaive.focus_thrust', name: '집중 찌르기 · 삼색 회수', dmg: 240, motionValue: 60, requirements: { airborne: true, monsterWounded: true }, effects: { airborne: false, recoverAllExtracts: true }, tags: ['sever', 'kinsect-joint', 'focus-strike'], audioCue: 'slash_heavy', durationTicks: 30, mechanicEvidence: 'wilds-mechanic:focus-thrust-wound-recover-three-extracts' }
            ],
            light_bowgun: [
                { id: 'light_bowgun.normal_shot', name: '통상탄 사격', dmg: 112, motionValue: 28, requirements: { minMagazine: 1, rapidMode: false }, effects: { magazine: -1, rapidGauge: 8, lbgChaserReady: true }, tags: ['ranged'], audioCue: 'bowgun_shot', durationTicks: 6, mechanicEvidence: 'wilds-mechanic:standard-fire-builds-rapid-gauge' },
                { id: 'light_bowgun.pierce_shot', name: '관통탄 사격', dmg: 176, motionValue: 44, hits: [9, 10, 12, 13], requirements: { minMagazine: 1, rapidMode: false }, effects: { magazine: -1, rapidGauge: 9, lbgChaserReady: true }, tags: ['ranged', 'multi-hit'], audioCue: 'bowgun_shot', durationTicks: 8, mechanicEvidence: 'wilds-mechanic:standard-pierce-fire' },
                { id: 'light_bowgun.chaser', name: '체이서 샷', dmg: 188, motionValue: 47, requirements: { minMagazine: 1, lbgChaserReady: true }, effects: { magazine: -1, rapidGauge: 24, lbgChaserReady: false }, tags: ['ranged', 'chaser'], audioCue: 'bowgun_shot', durationTicks: 8, mechanicEvidence: 'wilds-mechanic:chaser-shot-rapid-gauge-recovery' },
                prep('light_bowgun.enter_rapid', '속사 모드 전개', { rapidMode: false, minRapidGauge: 60 }, { rapidMode: true, lbgChaserReady: false, atbAfterAction: 88 }, 'wilds-mechanic:rapid-fire-mode-toggle', 4),
                { id: 'light_bowgun.rapid_burst', name: '속사 모드 · 연속사격', dmg: 248, motionValue: 62, hits: [14, 15, 16, 17], requirements: { minMagazine: 1, rapidMode: true, minRapidGauge: 18 }, effects: { magazine: -1, rapidGauge: -18, lbgChaserReady: true }, tags: ['ranged', 'multi-hit', 'rapid-fire'], audioCue: 'bowgun_shot', durationTicks: 7, mechanicEvidence: 'wilds-action-class:cShootRapidVariableLight' },
                { id: 'light_bowgun.burst_step', name: '버스트 스텝 사격', dmg: 160, motionValue: 40, hits: [12, 13, 15], requirements: { minMagazine: 1, rapidMode: true, minRapidGauge: 10 }, effects: { magazine: -1, rapidGauge: -10, nextEvadeBoost: 0.18, lbgChaserReady: true }, tags: ['ranged', 'multi-hit', 'rapid-fire', 'mobility'], audioCue: 'bowgun_shot', durationTicks: 6, mechanicEvidence: 'wilds-mechanic:rapid-fire-burst-step' },
                prep('light_bowgun.exit_rapid', '속사 모드 해제', { rapidMode: true }, { rapidMode: false, lbgChaserReady: false, atbAfterAction: 90 }, 'wilds-mechanic:rapid-fire-mode-toggle', 3),
                prep('light_bowgun.wyvernblast_plant', '기폭용탄 설치', { minWyvernblastCharges: 1 }, { wyvernblastCharges: -1, wyvernblastPlanted: true, atbAfterAction: 82 }, 'wilds-mechanic:wyvernblast-mine-placement', 6),
                { id: 'light_bowgun.wyvernblast_detonate', name: '기폭용탄 유폭', dmg: 360, motionValue: 90, requirements: { wyvernblastPlanted: true }, effects: { wyvernblastPlanted: false }, tags: ['ranged', 'explosive', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 10, mechanicEvidence: 'wilds-mechanic:wyvernblast-triggered-by-hunter-attacks' },
                prep('light_bowgun.reload', '사이드스텝 리로드', { maxMagazine: 5 }, { reloadMagazine: true, nextEvadeBoost: 0.12, atbAfterAction: 82 }, 'wilds-mechanic:sidestep-reload', 6)
            ],
            heavy_bowgun: [
                { id: 'heavy_bowgun.pierce', name: '관통탄 사격', dmg: 285, motionValue: 71, hits: [15, 17, 19, 20], requirements: { minMagazine: 1, ignitionMode: false }, effects: { magazine: -1, ignitionGauge: 18 }, tags: ['ranged', 'multi-hit'], audioCue: 'bowgun_shot', durationTicks: 11, mechanicEvidence: 'wilds-action-class-candidate:cShootMiddle' },
                { id: 'heavy_bowgun.spread', name: '산탄 집중사격', dmg: 330, motionValue: 82, hits: [14, 16, 16, 18, 18], requirements: { minMagazine: 1, ignitionMode: false }, effects: { magazine: -1, ignitionGauge: 18 }, tags: ['ranged', 'multi-hit'], audioCue: 'bowgun_shot', durationTicks: 12, mechanicEvidence: 'wilds-action-class-candidate:cShootMiddle' },
                prep('heavy_bowgun.enter_ignition', '점화 모드 전개', { ignitionMode: false, minIgnitionGauge: 60 }, { ignitionMode: true, wyvernheartStep: 0, atbAfterAction: 78 }, 'wilds-mechanic:ignition-mode-toggle', 5),
                { id: 'heavy_bowgun.wyvernheart_1', name: '용열기관 · 초동사격', dmg: 260, motionValue: 65, hits: [11, 12, 13, 14, 15], requirements: { ignitionMode: true, wyvernheartStep: 0, minIgnitionGauge: 15 }, effects: { ignitionGauge: -15, wyvernheartStep: 1, atbAfterAction: 76 }, tags: ['ranged', 'multi-hit', 'wyvernheart'], audioCue: 'bowgun_shot', durationTicks: 9, mechanicEvidence: 'wilds-mechanic:wyvernheart-ramping-barrage' },
                { id: 'heavy_bowgun.wyvernheart_2', name: '용열기관 · 가속사격', dmg: 360, motionValue: 90, hits: [13, 14, 15, 16, 16, 16], requirements: { ignitionMode: true, wyvernheartStep: 1, minIgnitionGauge: 20 }, effects: { ignitionGauge: -20, wyvernheartStep: 2, atbAfterAction: 72 }, tags: ['ranged', 'multi-hit', 'wyvernheart'], audioCue: 'bowgun_shot', durationTicks: 11, mechanicEvidence: 'wilds-mechanic:wyvernheart-ramping-barrage' },
                { id: 'heavy_bowgun.wyvernheart_3', name: '용열기관 · 최대출력', dmg: 520, motionValue: 130, hits: [15, 16, 17, 18, 20, 22, 22], requirements: { ignitionMode: true, wyvernheartStep: 2, minIgnitionGauge: 25 }, effects: { ignitionGauge: -25, wyvernheartStep: 0 }, tags: ['ranged', 'multi-hit', 'wyvernheart', 'finisher'], audioCue: 'bowgun_shot', durationTicks: 14, mechanicEvidence: 'wilds-mechanic:wyvernheart-maximum-ramp' },
                { ...prep('heavy_bowgun.wyverncounter_stance', '용열 카운터 준비', { ignitionMode: true, minIgnitionGauge: 20, monsterPressure: true }, { ignitionGauge: -20, hbgCounterWaiting: true, atbAfterAction: 72 }, 'wilds-mechanic:wyverncounter-ignition', 6), tags: ['preparation', 'counter', 'hbg-wyverncounter'] },
                { id: 'heavy_bowgun.wyverncounter_shot', name: '용열 카운터 발사', dmg: 480, motionValue: 120, requirements: { hbgCounterReady: true }, effects: { hbgCounterReady: false, hbgCounterWaiting: false, ignitionGauge: 20 }, tags: ['ranged', 'explosive', 'counter', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 12, mechanicEvidence: 'wilds-mechanic:successful-wyverncounter-restores-ignition-gauge' },
                prep('heavy_bowgun.wyverncounter_miss', '용열 카운터 실패', { hbgCounterWaiting: true }, { hbgCounterWaiting: false, hbgCounterReady: false }, 'wilds-mechanic:wyverncounter-missed-window', 6),
                prep('heavy_bowgun.exit_ignition', '점화 모드 해제', { ignitionMode: true }, { ignitionMode: false, wyvernheartStep: 0, atbAfterAction: 84 }, 'wilds-mechanic:ignition-mode-toggle', 4),
                { id: 'heavy_bowgun.focus_blast', name: '집중 폭발탄 · 용의 포효', dmg: 610, motionValue: 152, requirements: { specialAmmoReady: true, monsterWounded: true }, effects: { specialAmmoCooldown: 240 }, tags: ['ranged', 'explosive', 'focus-strike', 'finisher'], audioCue: 'explosive_heavy', durationTicks: 20, mechanicEvidence: 'wilds-mechanic:focus-blast-wyvern-howl-wound-punish' },
                prep('heavy_bowgun.reload', '중화기 리로드', { maxMagazine: 4 }, { reloadMagazine: true, atbAfterAction: 68 }, 'wilds-action-guide-unresolved:reload', 9)
            ],
            bow: [
                prep('bow.draw_1', '활 당기기 · 1단계', { bowCharge: 0, minBowStamina: 6 }, { bowCharge: 1, bowStamina: -6, atbAfterAction: 92 }, 'wilds-action-class-candidate:cSpecialCharge', 3),
                prep('bow.draw_2', '활 당기기 · 2단계', { bowCharge: 1, minBowStamina: 7 }, { bowCharge: 2, bowStamina: -7, atbAfterAction: 92 }, 'wilds-action-class-candidate:cChargeRun', 3),
                prep('bow.draw_3', '활 당기기 · 3단계', { bowCharge: 2, minBowStamina: 8 }, { bowCharge: 3, bowStamina: -8, atbAfterAction: 90 }, 'wilds-action-class-candidate:cChargeRun', 4),
                { ...prep('bow.charging_sidestep', '차지 스텝', { minBowStamina: 15, monsterPressure: true }, { bowStamina: -15, advanceBowCharge: true, nextEvadeBoost: 0.25, atbAfterAction: 86 }, 'wilds-mechanic:charging-sidestep-perfect-evade', 5), tags: ['preparation', 'evade', 'bow-perfect-dodge'] },
                { id: 'bow.charged_shot', name: '3단계 모아쏘기', dmg: 285, motionValue: 71, requirements: { bowCharge: 3, minBowStamina: 8 }, effects: { bowCharge: 2, bowPowerStep: 1, bowStamina: -8, tracerGauge: 15 }, next: ['bow.power_shot'], tags: ['ranged', 'charge-release'], audioCue: 'bow_charged_shot', durationTicks: 8, mechanicEvidence: 'wilds-action-class:cShotMaxLv' },
                { id: 'bow.power_shot', name: '강사', dmg: 330, motionValue: 82, hits: [16, 16, 16, 17, 17], requirements: { minBowCharge: 2, bowPowerStep: 1, minBowStamina: 12 }, effects: { bowCharge: 1, bowPowerStep: 2, bowStamina: -12, tracerGauge: 20 }, next: ['bow.power_volley'], tags: ['ranged', 'multi-hit'], audioCue: 'bow_power_shot', durationTicks: 9, mechanicEvidence: 'wilds-action-class:cGoushaShot' },
                { id: 'bow.power_volley', name: '강사 연계', dmg: 385, motionValue: 96, hits: [16, 16, 16, 16, 16, 16], requirements: { minBowCharge: 1, bowPowerStep: 2, minBowStamina: 16 }, effects: { bowCharge: 0, bowPowerStep: 0, bowStamina: -16, tracerGauge: 24 }, tags: ['ranged', 'multi-hit', 'finisher'], audioCue: 'bow_power_shot', durationTicks: 11, mechanicEvidence: 'wilds-action-class:cGoushaRapidShot' },
                { id: 'bow.tracer_arrow', name: '유도 화살', dmg: 125, motionValue: 31, requirements: { minTracerGauge: 60, tracerActive: false }, effects: { tracerGauge: -60, tracerTicks: 150, bowCharge: 1 }, tags: ['ranged', 'setup'], audioCue: 'bow_shot', durationTicks: 8, mechanicEvidence: 'wilds-action-class-candidate:cTsugiyaSet' },
                { id: 'bow.arc_shot', name: '곡사 · 유폭 화살', dmg: 108, motionValue: 27, requirements: { minTracerGauge: 30, maxFuseArrows: 0 }, effects: { tracerGauge: -30, fuseArrows: 3 }, tags: ['ranged', 'setup'], audioCue: 'bow_shot', durationTicks: 9, mechanicEvidence: 'wilds-motion-values:arc-shot-arrow-attach' },
                { id: 'bow.focus_fire', name: '집중 사격 · 유폭', dmg: 390, motionValue: 97, hits: [13, 13, 13, 30, 28], requirements: { minFuseArrows: 1, monsterWounded: true }, effects: { fuseArrows: -3, bowCharge: 2, tracerGauge: 15 }, tags: ['ranged', 'multi-hit', 'focus-strike', 'explosive'], audioCue: 'bow_shot', durationTicks: 12, mechanicEvidence: 'wilds-motion-values:arc-attach+focus-strike-detonation' },
                { id: 'bow.tracer_dragon_piercer', name: '유도 용화살', dmg: 575, motionValue: 144, requirements: { tracerActive: true, bowCharge: 3 }, effects: { tracerTicks: 0, bowCharge: 0, bowPowerStep: 0 }, tags: ['ranged', 'multi-hit', 'finisher'], audioCue: 'dragon_piercer', durationTicks: 18, mechanicEvidence: 'wilds-action-class-candidate:cSpecialShot' },
                prep('bow.recover_stamina', '호흡 정비', { maxBowStamina: 24 }, { bowStamina: 38, bowCharge: 0, bowPowerStep: 0, atbAfterAction: 70 }, 'autobattler-rule:bow-stamina-recovery-window', 7)
            ]
        };
    }

    static actionsFor(weaponId) {
        const actions = this.canonicalActions()[weaponId];
        return actions ? actions.map(action => ({ ...action, requirements: { ...(action.requirements || {}) }, effects: { ...(action.effects || {}) } })) : null;
    }

    initialize(hunter) {
        if (!hunter) return;
        const numberDefault = (key, value = 0) => {
            if (!Number.isFinite(hunter[key])) hunter[key] = value;
        };
        Object.entries(HuntWeaponMechanics.WEAPON_FIELD_DEFAULTS[hunter.id] || {}).forEach(([key, value]) => numberDefault(key, value));
        if (hunter.id === 'long_sword') {
            hunter.longSwordForesightEligible = Boolean(hunter.longSwordForesightEligible);
            hunter.longSwordReactiveFollowup = Boolean(hunter.longSwordReactiveFollowup);
            hunter.longSwordForesightChain = Math.max(0, Number(hunter.longSwordForesightChain || 0));
            hunter.specialSheatheReady = Boolean(hunter.specialSheatheReady);
            hunter.spiritRoundslashReady = Boolean(hunter.spiritRoundslashReady);
            hunter.iaiHelmBreakerReady = Boolean(hunter.iaiHelmBreakerReady);
            hunter.spiritReleaseReady = Boolean(hunter.spiritReleaseReady);
        }
        if (hunter.id === 'sword_shield') {
            ['snsBackstepReady', 'snsAerialReady', 'snsPerfectGuardReady', 'snsCounterReady', 'snsGuardSlashReady']
                .forEach(key => { hunter[key] = Boolean(hunter[key]); });
        }
        if (hunter.id === 'switch_axe') {
            hunter.weaponMode = hunter.weaponMode || 'axe';
            numberDefault('switchGauge', 45);
            numberDefault('ampGauge');
            numberDefault('ampedStateDuration');
            numberDefault('powerAxeDuration');
            hunter.switchCounterWaiting = Boolean(hunter.switchCounterWaiting);
            hunter.switchCounterReady = Boolean(hunter.switchCounterReady);
            hunter.weaponGauge = hunter.switchGauge;
        }
        if (hunter.id === 'dual_blades') hunter.demonMode = Boolean(hunter.demonMode);
        if (hunter.id === 'lance') {
            ['lanceCounterWaiting', 'lanceCounterReady', 'powerGuardWaiting', 'powerGuardReady']
                .forEach(key => { hunter[key] = Boolean(hunter[key]); });
        }
        if (hunter.id === 'hammer') {
            ['hammerOffsetWaiting', 'hammerOffsetFollowupReady'].forEach(key => { hunter[key] = Boolean(hunter[key]); });
            numberDefault('hammerFocusCooldown');
        }
        if (hunter.id === 'gunlance') hunter.wyvernFireCharging = Boolean(hunter.wyvernFireCharging);
        if (hunter.id === 'hunting_horn') {
            if (!Array.isArray(hunter.hornNotes)) hunter.hornNotes = [];
            if (!Array.isArray(hunter.storedMelodies)) hunter.storedMelodies = [];
            hunter.recitalActive = Boolean(hunter.recitalActive);
        }
        if (hunter.id === 'charge_blade') hunter.chargeBladeMode = hunter.chargeBladeMode || 'sword';
        if (hunter.id === 'charge_blade') {
            hunter.cbGuardWaiting = Boolean(hunter.cbGuardWaiting);
            hunter.cbGuardReady = Boolean(hunter.cbGuardReady);
        }
        if (hunter.id === 'gunlance') {
            if (!hunter.shellingType) hunter.shellingType = ['normal', 'long', 'wide'][Math.floor(this.random() * 3)];
            hunter.wyvernFireCharging = Boolean(hunter.wyvernFireCharging);
        }
        if (hunter.id === 'insect_glaive') {
            hunter.extractBuffs = hunter.extractBuffs || { red: 0, white: 0, orange: 0 };
            hunter.spiralReady = Boolean(hunter.spiralReady);
            hunter.airborne = Boolean(hunter.airborne);
        }
        if (hunter.id === 'light_bowgun') {
            hunter.rapidMode = Boolean(hunter.rapidMode);
            hunter.lbgChaserReady = Boolean(hunter.lbgChaserReady);
            hunter.wyvernblastPlanted = Boolean(hunter.wyvernblastPlanted);
        }
        if (hunter.id === 'heavy_bowgun') {
            hunter.ignitionMode = Boolean(hunter.ignitionMode);
            hunter.hbgCounterWaiting = Boolean(hunter.hbgCounterWaiting);
            hunter.hbgCounterReady = Boolean(hunter.hbgCounterReady);
        }
        if (this.managesAmmo(hunter.id)) hunter.ammo = hunter.magazine;
    }

    managesAmmo(weaponId) {
        return weaponId === 'light_bowgun' || weaponId === 'heavy_bowgun';
    }

    setContext(hunter, context = {}) {
        if (!hunter) return;
        hunter._mechanicMonsterPressure = Boolean(context.monsterPressure || context.monsterAtb >= 68 || context.monsterState === 'enraged');
        hunter._mechanicMonsterDowned = Boolean(context.monsterDowned);
        hunter._mechanicMonsterWounded = Boolean(context.monsterWounded);
    }

    isEligible(hunter, action) {
        // Incoming-attack reactions never enter the ordinary ATB attack pool.
        if (action?.tags?.includes('reaction-only')) return false;
        const req = action?.requirements || {};
        if (req.weaponMode && hunter.weaponMode !== req.weaponMode) return false;
        if (req.minSwitchGauge && Number(hunter.switchGauge || 0) < req.minSwitchGauge) return false;
        if (req.amped && !(hunter.ampedStateDuration > 0)) return false;
        if (req.amped === false && hunter.ampedStateDuration > 0) return false;
        if (req.switchCounterReady !== undefined && Boolean(hunter.switchCounterReady) !== req.switchCounterReady) return false;
        if (req.switchCounterWaiting !== undefined && Boolean(hunter.switchCounterWaiting) !== req.switchCounterWaiting) return false;
        if (req.hammerChargeLevel !== undefined && Number(hunter.hammerChargeLevel || 0) !== req.hammerChargeLevel) return false;
        if (req.hammerNormalStep !== undefined && Number(hunter.hammerNormalStep || 0) !== req.hammerNormalStep) return false;
        if (req.hammerBigBangStep !== undefined && Number(hunter.hammerBigBangStep || 0) !== req.hammerBigBangStep) return false;
        if (req.hammerSpinStep !== undefined && Number(hunter.hammerSpinStep || 0) !== req.hammerSpinStep) return false;
        if (req.hammerOffsetFollowupReady !== undefined && Boolean(hunter.hammerOffsetFollowupReady) !== req.hammerOffsetFollowupReady) return false;
        if (req.greatSwordCharge !== undefined && Number(hunter.greatSwordCharge || 0) !== req.greatSwordCharge) return false;
        if (req.greatSwordChain !== undefined && Number(hunter.greatSwordChain || 0) !== req.greatSwordChain) return false;
        if (req.minGreatSwordCharge && Number(hunter.greatSwordCharge || 0) < req.minGreatSwordCharge) return false;
        if (req.minSpiritGauge && Number(hunter.spiritGauge || 0) < req.minSpiritGauge) return false;
        if (req.minSpiritLevel && Number(hunter.spiritLevel || 0) < req.minSpiritLevel) return false;
        if (req.specialSheatheReady !== undefined && Boolean(hunter.specialSheatheReady) !== req.specialSheatheReady) return false;
        if (req.spiritReleaseReady !== undefined && Boolean(hunter.spiritReleaseReady) !== req.spiritReleaseReady) return false;
        if (req.rushStep !== undefined && Number(hunter.rushStep || 0) !== req.rushStep) return false;
        if (req.perfectRushStep !== undefined && Number(hunter.perfectRushStep || 0) !== req.perfectRushStep) return false;
        if (req.perfectRushReady !== undefined && Boolean(hunter.perfectRushReady) !== req.perfectRushReady) return false;
        if (req.snsChain !== undefined && Number(hunter.snsChain || 0) !== req.snsChain) return false;
        if (req.minSnsChain && Number(hunter.snsChain || 0) < req.minSnsChain) return false;
        if (req.snsShieldStep !== undefined && Number(hunter.snsShieldStep || 0) !== req.snsShieldStep) return false;
        if (req.snsBackstepReady !== undefined && Boolean(hunter.snsBackstepReady) !== req.snsBackstepReady) return false;
        if (req.snsAerialReady !== undefined && Boolean(hunter.snsAerialReady) !== req.snsAerialReady) return false;
        if (req.snsCounterReady !== undefined && Boolean(hunter.snsCounterReady) !== req.snsCounterReady) return false;
        if (req.demonMode !== undefined && Boolean(hunter.demonMode) !== req.demonMode) return false;
        if (req.minArchdemonGauge && Number(hunter.archdemonGauge || 0) < req.minArchdemonGauge) return false;
        if (req.minDemonStamina && Number(hunter.demonStamina || 0) < req.minDemonStamina) return false;
        if (req.archdemonMode && Number(hunter.archdemonGauge || 0) < 50) return false;
        if (req.dualChain !== undefined && Number(hunter.dualChain || 0) !== req.dualChain) return false;
        if (req.demonChain !== undefined && Number(hunter.demonChain || 0) !== req.demonChain) return false;
        if (req.demonDanceStep !== undefined && Number(hunter.demonDanceStep || 0) !== req.demonDanceStep) return false;
        if (req.archdemonStep !== undefined && Number(hunter.archdemonStep || 0) !== req.archdemonStep) return false;
        if (req.minHornNotes && (hunter.hornNotes || []).length < req.minHornNotes) return false;
        if (req.minStoredMelodies && (hunter.storedMelodies || []).length < req.minStoredMelodies) return false;
        if (req.recitalActive !== undefined && Boolean(hunter.recitalActive) !== req.recitalActive) return false;
        if (req.minEchoGauge && Number(hunter.echoGauge || 0) < req.minEchoGauge) return false;
        if (req.lanceStep !== undefined && Number(hunter.lanceStep || 0) !== req.lanceStep) return false;
        if (req.lanceCounterReady !== undefined && Boolean(hunter.lanceCounterReady) !== req.lanceCounterReady) return false;
        if (req.powerGuardReady !== undefined && Boolean(hunter.powerGuardReady) !== req.powerGuardReady) return false;
        if (req.powerGuardCharge !== undefined && Number(hunter.powerGuardCharge || 0) !== req.powerGuardCharge) return false;
        if (req.lanceMobilityStep !== undefined && Number(hunter.lanceMobilityStep || 0) !== req.lanceMobilityStep) return false;
        if (req.lanceDashStep !== undefined && Number(hunter.lanceDashStep || 0) !== req.lanceDashStep) return false;
        if (req.gunlanceStep !== undefined && Number(hunter.gunlanceStep || 0) !== req.gunlanceStep) return false;
        if (req.shellStep !== undefined && Number(hunter.shellStep || 0) !== req.shellStep) return false;
        if (req.minShells && Number(hunter.shells || 0) < req.minShells) return false;
        if (req.maxShells !== undefined && Number(hunter.shells || 0) >= req.maxShells) return false;
        if (req.minWyrmstake && Number(hunter.wyrmstake || 0) < req.minWyrmstake) return false;
        if (req.wyvernFireReady && Number(hunter.wyvernFireCooldown || 0) > 0) return false;
        if (req.minWyvernGauge && Number(hunter.wyvernGauge || 0) < req.minWyvernGauge) return false;
        if (req.wyvernFireCharging !== undefined && Boolean(hunter.wyvernFireCharging) !== req.wyvernFireCharging) return false;
        if (req.maxHeatGauge !== undefined && Number(hunter.heatGauge || 0) > req.maxHeatGauge) return false;
        if (req.chargeBladeMode && hunter.chargeBladeMode !== req.chargeBladeMode) return false;
        if (req.minPhials && Number(hunter.phials || 0) < req.minPhials) return false;
        if (req.cbSwordStep !== undefined && Number(hunter.cbSwordStep || 0) !== req.cbSwordStep) return false;
        if (req.cbAxeStep !== undefined && Number(hunter.cbAxeStep || 0) !== req.cbAxeStep) return false;
        if (req.minChargeEnergy && Number(hunter.chargeEnergy || 0) < req.minChargeEnergy) return false;
        if (req.shieldCharged !== undefined && Boolean(hunter.shieldChargeDuration > 0) !== req.shieldCharged) return false;
        if (req.minSavageAxeGauge && Number(hunter.savageAxeGauge || 0) < req.minSavageAxeGauge) return false;
        if (req.missingExtract && Boolean(hunter.extractBuffs?.[req.missingExtract])) return false;
        if (req.tripleExtract && !(hunter.extractDuration > 0)) return false;
        if (req.glaiveStep !== undefined && Number(hunter.glaiveStep || 0) !== req.glaiveStep) return false;
        if (req.glaiveCharge !== undefined && Number(hunter.glaiveCharge || 0) !== req.glaiveCharge) return false;
        if (req.spiralReady !== undefined && Boolean(hunter.spiralReady) !== req.spiralReady) return false;
        if (req.airborne !== undefined && Boolean(hunter.airborne) !== req.airborne) return false;
        if (req.minMagazine && Number(hunter.magazine || 0) < req.minMagazine) return false;
        if (req.maxMagazine !== undefined && Number(hunter.magazine || 0) >= req.maxMagazine) return false;
        if (req.minRapidGauge && Number(hunter.rapidGauge || 0) < req.minRapidGauge) return false;
        if (req.rapidMode !== undefined && Boolean(hunter.rapidMode) !== req.rapidMode) return false;
        if (req.lbgChaserReady !== undefined && Boolean(hunter.lbgChaserReady) !== req.lbgChaserReady) return false;
        if (req.minWyvernblastCharges && Number(hunter.wyvernblastCharges || 0) < req.minWyvernblastCharges) return false;
        if (req.wyvernblastPlanted !== undefined && Boolean(hunter.wyvernblastPlanted) !== req.wyvernblastPlanted) return false;
        if (req.minIgnitionGauge && Number(hunter.ignitionGauge || 0) < req.minIgnitionGauge) return false;
        if (req.ignitionMode !== undefined && Boolean(hunter.ignitionMode) !== req.ignitionMode) return false;
        if (req.wyvernheartStep !== undefined && Number(hunter.wyvernheartStep || 0) !== req.wyvernheartStep) return false;
        if (req.hbgCounterReady !== undefined && Boolean(hunter.hbgCounterReady) !== req.hbgCounterReady) return false;
        if (req.hbgCounterWaiting !== undefined && Boolean(hunter.hbgCounterWaiting) !== req.hbgCounterWaiting) return false;
        if (req.specialAmmoReady && Number(hunter.specialAmmoCooldown || 0) > 0) return false;
        if (req.bowCharge !== undefined && Number(hunter.bowCharge || 0) !== req.bowCharge) return false;
        if (req.minBowCharge && Number(hunter.bowCharge || 0) < req.minBowCharge) return false;
        if (req.minBowStamina && Number(hunter.bowStamina || 0) < req.minBowStamina) return false;
        if (req.maxBowStamina !== undefined && Number(hunter.bowStamina || 0) > req.maxBowStamina) return false;
        if (req.minFuseArrows && Number(hunter.fuseArrows || 0) < req.minFuseArrows) return false;
        if (req.maxFuseArrows !== undefined && Number(hunter.fuseArrows || 0) > req.maxFuseArrows) return false;
        if (req.bowPowerStep !== undefined && Number(hunter.bowPowerStep || 0) !== req.bowPowerStep) return false;
        if (req.minTracerGauge && Number(hunter.tracerGauge || 0) < req.minTracerGauge) return false;
        if (req.tracerActive !== undefined && Boolean(hunter.tracerTicks > 0) !== req.tracerActive) return false;
        if (req.monsterPressure && !hunter._mechanicMonsterPressure) return false;
        if (req.monsterWounded && !hunter._mechanicMonsterWounded) return false;
        return true;
    }

    selectAction(hunter, actions, context = {}) {
        this.initialize(hunter);
        const byId = id => actions.findIndex(action => action.id === id && this.isEligible(hunter, action));
        if (hunter.id === 'switch_axe') {
            if (hunter.weaponMode === 'sword') {
                if (hunter.switchCounterReady) return byId('switch_axe.sword_counter_rising');
                if (hunter.switchCounterWaiting) return byId('switch_axe.sword_counter_miss');
                if (Number(hunter.switchGauge || 0) <= 12) return byId('switch_axe.morph_to_axe');
                if (hunter._mechanicMonsterPressure && Number(hunter.switchGauge || 0) >= 15 && this.random() < 0.38) {
                    return byId('switch_axe.sword_counter_stance');
                }
                if (hunter.ampedStateDuration > 0) {
                    if (context.monsterDowned && Number(hunter.switchGauge || 0) >= 35) return byId('switch_axe.full_release_slash');
                    if (Number(hunter.switchGauge || 0) >= 22 && this.random() < 0.42) return byId('switch_axe.zero_sum_discharge');
                } else if ((context.monsterDowned || context.largeOpening) && Number(hunter.switchGauge || 0) >= 35) {
                    return byId('switch_axe.unbridled_slash');
                }
                const swordChain = {
                    'switch_axe.morph_to_sword': 'switch_axe.sword_rising_slash',
                    'switch_axe.sword_rising_slash': 'switch_axe.sword_double_slash',
                    'switch_axe.sword_double_slash': 'switch_axe.sword_heavenward_flurry',
                    'switch_axe.sword_heavenward_flurry': 'switch_axe.sword_rising_slash',
                    'switch_axe.zero_sum_discharge': 'switch_axe.morph_to_axe',
                    'switch_axe.unbridled_slash': 'switch_axe.morph_to_axe',
                    'switch_axe.sword_counter_rising': 'switch_axe.sword_double_slash'
                };
                const linked = byId(swordChain[hunter.lastActionId]);
                if (linked >= 0) return linked;
                return byId('switch_axe.sword_rising_slash');
            }
            if (hunter.lastActionId === 'switch_axe.axe_overhead_slash') return byId('switch_axe.axe_wild_swing');
            if (hunter.lastActionId === 'switch_axe.axe_wild_swing') return byId('switch_axe.axe_heavy_slam');
            if (Number(hunter.switchGauge || 0) >= 55 && hunter.lastActionId === 'switch_axe.axe_heavy_slam') {
                return byId('switch_axe.morph_to_sword');
            }
            return byId('switch_axe.axe_overhead_slash');
        }
        if (hunter.id === 'hammer') {
            const level = Number(hunter.hammerChargeLevel || 0);
            const hpRatio = Number(hunter.hp || 0) / Math.max(1, Number(hunter.maxHp || 1));
            const pressured = Boolean(context.monsterPressure || context.monsterAtb >= 68 || context.monsterState === 'enraged');
            if (hunter.hammerOffsetFollowupReady) return byId('hammer.offset_followup_spinslam');
            if (hunter.hammerOffsetWaiting) return byId('hammer.offset_miss');
            const bigBang = Number(hunter.hammerBigBangStep || 0);
            if (bigBang > 0) return byId(`hammer.${bigBang === 4 ? 'big_bang_finisher' : `big_bang_${bigBang + 1}`}`);
            const spin = Number(hunter.hammerSpinStep || 0);
            if (spin === 1) return byId('hammer.spinning_mid');
            if (spin === 2) return byId((context.monsterDowned || pressured || this.random() < 0.48) ? 'hammer.spinning_upswing' : 'hammer.spinning_finish');
            const normal = Number(hunter.hammerNormalStep || 0);
            if (normal === 1) return byId('hammer.overhead_2');
            if (normal === 2) return byId('hammer.upswing');
            if (level === 0) {
                if (context.monsterWounded && Number(hunter.hammerFocusCooldown || 0) <= 0) return byId('hammer.focus_earthquake');
                if (context.monsterDowned) return byId(this.random() < 0.58 ? 'hammer.big_bang_1' : 'hammer.charge_1');
                if (pressured && this.random() < 0.32) return byId('hammer.offset_stance');
                const route = this.random();
                if (route < 0.34) return byId('hammer.overhead_1');
                if (route < 0.55) return byId('hammer.spinning_start');
                return byId('hammer.charge_1');
            }
            if (level === 1) return byId(pressured && hpRatio <= 0.22 ? 'hammer.release_1' : 'hammer.charge_2');
            if (level === 2) return byId(pressured && hpRatio <= 0.42 ? 'hammer.release_2' : 'hammer.charge_3');
            if (level === 3) return byId(context.monsterDowned ? 'hammer.mighty_charge' : 'hammer.release_3');
            return byId('hammer.mighty_charge_slam');
        }
        const linkedFromLast = () => {
            const current = actions.find(action => action.id === hunter.lastActionId);
            for (const id of current?.next || []) {
                const index = byId(id);
                if (index >= 0) return index;
            }
            return -1;
        };
        if (hunter.id === 'great_sword') {
            const chain = Math.max(0, Math.min(2, Number(hunter.greatSwordChain || 0)));
            const charge = Math.max(0, Math.min(3, Number(hunter.greatSwordCharge || 0)));
            const prefixes = ['great_sword.charge', 'great_sword.strong_charge', 'great_sword.true_charge'];
            const releases = ['great_sword.charged_slash', 'great_sword.strong_charged_slash', 'great_sword.true_charged_slash'];
            if (charge === 0 && chain === 0 && !context.monsterDowned) {
                const normalMoves = new Set(['great_sword.wide_slash']);
                const linked = normalMoves.has(hunter.lastActionId) ? linkedFromLast() : -1;
                if (linked >= 0 && this.random() < 0.62) return linked;
                const route = this.random();
                if (route < 0.30) return byId('great_sword.wide_slash');
                if (route < 0.42) return byId('great_sword.kick');
            }
            if (charge === 0) return byId(`${prefixes[chain]}_1`);
            if (charge >= 3) return byId(releases[chain]);
            if (context.monsterDowned) return byId(`${prefixes[chain]}_${charge + 1}`);

            const monsterAtb = Math.max(0, Math.min(100, Number(context.monsterAtb || 0)));
            const riskBias = hunter.personality === 'offensive' ? 7
                : (hunter.personality === 'defensive' || hunter.personality === 'support' ? -6 : 0);
            const continueLimit = (charge === 1 ? 76 : 84) + riskBias + ((this.random() - 0.5) * 12);
            // Check the charge-cancel reaction before extending the charge.
            // Previously the early continue return made tackle unreachable through
            // most of its useful window. An imminent attack is deterministic;
            // earlier pressure still respects the personality special-action rate.
            const tackleBase = monsterAtb >= 90 ? .9 : (monsterAtb >= 78 ? .68 : .42);
            const tackleChance = HuntWeaponMechanics.specialActionChance(hunter, tackleBase);
            if (hunter._mechanicMonsterPressure
                && (monsterAtb >= 94 || this.random() < tackleChance)) return byId('great_sword.tackle');
            if (monsterAtb < continueLimit) return byId(`${prefixes[chain]}_${charge + 1}`);
            return byId(releases[chain]);
        }
        if (hunter.id === 'long_sword') {
            if (hunter.spiritReleaseReady) return byId('long_sword.spirit_release_slash');
            if (hunter.iaiHelmBreakerReady && hunter.spiritLevel >= 3) return byId('long_sword.helm_breaker');
            if (hunter.specialSheatheReady) return byId('long_sword.iai_counter_fail');
            if (hunter.spiritRoundslashReady && hunter.spiritGauge >= 12) return byId('long_sword.spirit_roundslash');
            if (context.monsterDowned && hunter.spiritLevel >= 3 && this.random() < 0.72) return byId('long_sword.helm_breaker');
            const specialSheatheChance = HuntWeaponMechanics.longSwordSpecialSheatheChance(hunter.spiritLevel);
            if (hunter._mechanicMonsterPressure && hunter.spiritLevel > 0 && this.random() < specialSheatheChance) return byId('long_sword.special_sheathe');
            const linked = linkedFromLast();
            if (linked >= 0 && this.random() < 0.86) return linked;
            if (hunter.spiritGauge >= 78 && this.random() < 0.76) return byId('long_sword.spirit_slash_1');
            return byId('long_sword.overhead_slash');
        }
        if (hunter.id === 'sword_shield') {
            if (hunter.snsCounterReady) return byId('sword_shield.counter_slash');
            if (hunter.perfectRushStep > 0) return byId(`sword_shield.perfect_rush_${hunter.perfectRushStep === 3 ? 'finisher' : hunter.perfectRushStep}`);
            if (hunter.snsAerialReady) {
                if (context.monsterDowned) return byId('sword_shield.falling_bash');
                return byId(this.random() < 0.46 ? 'sword_shield.jumping_slash' : this.random() < 0.6 ? 'sword_shield.falling_bash' : 'sword_shield.plunging_thrust');
            }
            if (hunter.snsBackstepReady) {
                if (context.monsterDowned || this.random() < 0.60) return byId('sword_shield.perfect_rush_1');
                return byId('sword_shield.charged_slash');
            }
            if (hunter._mechanicMonsterPressure
                && this.random() < HuntWeaponMechanics.specialActionChance(hunter, .42)) return byId('sword_shield.perfect_guard');
            if (hunter.snsShieldStep > 0) return byId(`sword_shield.shield_bash_${hunter.snsShieldStep + 1}`) >= 0
                ? byId(`sword_shield.shield_bash_${hunter.snsShieldStep + 1}`)
                : byId('sword_shield.guard_slash');
            if (context.monsterDowned && this.random() < 0.34) return byId('sword_shield.shield_bash_1');
            if (context.monsterDowned && Number(hunter.snsChain || 0) >= 2 && this.random() < 0.52) return byId('sword_shield.charged_chop');
            if (hunter._mechanicMonsterPressure
                && this.random() < HuntWeaponMechanics.specialActionChance(hunter, .22)) return byId('sword_shield.backstep');
            if (Number(hunter.snsChain || 0) > 0
                && this.random() < HuntWeaponMechanics.specialActionChance(hunter, .16)) return byId('sword_shield.backstep');
            const linked = linkedFromLast();
            if (linked >= 0 && this.random() < 0.86) return linked;
            return byId('sword_shield.chop');
        }
        if (hunter.id === 'dual_blades') {
            if (hunter.demonMode) {
                if (hunter.demonDanceStep === 1) return byId('dual_blades.blade_dance_2');
                if (hunter.demonDanceStep === 2) return byId('dual_blades.blade_dance');
                if (Number(hunter.archdemonGauge || 0) < 12) return byId('dual_blades.exit_demon');
                if (context.monsterDowned && hunter.archdemonGauge >= 66) return byId('dual_blades.blade_dance_1');
                const demonLinks = {
                    'dual_blades.demon_fang': 'dual_blades.demon_double_slash',
                    'dual_blades.demon_double_slash': 'dual_blades.demon_flurry',
                    'dual_blades.demon_flurry': 'dual_blades.demon_roundslash',
                    'dual_blades.demon_roundslash': 'dual_blades.demon_fang'
                };
                const linked = byId(demonLinks[hunter.lastActionId]);
                if (linked >= 0 && this.isEligible(hunter, actions[linked], context)) return linked;
                const fang = byId('dual_blades.demon_fang');
                return fang >= 0 && this.isEligible(hunter, actions[fang], context)
                    ? fang
                    : byId('dual_blades.exit_demon');
            }
            if (hunter.demonToggleCooldown <= 0 && hunter.archdemonGauge >= 100) return byId('dual_blades.enter_demon');
            const normalLinks = {
                'dual_blades.double_slash': 'dual_blades.double_slash_return',
                'dual_blades.double_slash_return': 'dual_blades.circle_slash',
                'dual_blades.circle_slash': 'dual_blades.double_slash'
            };
            const linked = byId(normalLinks[hunter.lastActionId]);
            return linked >= 0 ? linked : byId('dual_blades.double_slash');
        }
        if (hunter.id === 'hunting_horn') {
            if (hunter.recitalActive) {
                if ((hunter.storedMelodies || []).length > 0) return byId('hunting_horn.recital_strike');
                return byId('hunting_horn.recital_finish');
            }
            if (hunter._mechanicMonsterPressure && hunter.echoGauge >= 60) return byId('hunting_horn.offset_melody');
            const stocked = (hunter.storedMelodies || []).length;
            if (stocked >= 3 || (stocked >= 2 && this.random() < 0.5) || (stocked >= 1 && context.monsterDowned)) {
                return byId('hunting_horn.recital_start');
            }
            if (hunter.echoGauge >= 30 && hunter.echoBubbleTicks <= 0 && this.random() < 0.35) return byId('hunting_horn.echo_bubble');
            const melodies = this.hornMelodies();
            const target = melodies[Number(hunter.hornMelodyCursor || 0) % melodies.length];
            const note = target.notes[(hunter.hornNotes || []).length] || target.notes[0];
            return byId(`hunting_horn.note_${note}`);
        }
        if (hunter.id === 'lance') {
            if (hunter.powerGuardReady) return byId('lance.payback_thrust');
            if (hunter.lanceCounterReady) return byId('lance.counter_thrust');
            if (hunter.powerGuardWaiting) {
                const charge = Number(hunter.powerGuardCharge || 0);
                if (charge < 3 && hunter._mechanicMonsterPressure) return byId(`lance.power_guard_${charge + 1}`);
                hunter.powerGuardWaiting = false;
                hunter.powerGuardReady = true;
                return byId('lance.payback_thrust');
            }
            if (hunter.lanceCounterWaiting) {
                hunter.lanceCounterWaiting = false;
                hunter.lanceCounterReady = true;
                return byId('lance.counter_thrust');
            }
            if (Number(hunter.lanceMobilityStep || 0) === 1) return byId('lance.leaping_thrust');
            if (Number(hunter.lanceDashStep || 0) === 1) return byId('lance.dash_attack');
            if (Number(hunter.lanceDashStep || 0) === 2) return byId('lance.finishing_twin_thrust');
            if (hunter._mechanicMonsterPressure) return byId(this.random()
                < HuntWeaponMechanics.specialActionChance(hunter, .35) ? 'lance.power_guard_1' : 'lance.counter_stance');
            const linked = linkedFromLast();
            if (linked >= 0) return linked;
            const route = this.random();
            if (route < 0.16 && hunter.lastActionId !== 'lance.leaping_thrust') return byId('lance.guard_dash');
            if (context.monsterDowned && route > 0.72) return byId('lance.dash_start');
            return byId('lance.mid_thrust_1');
        }
        if (hunter.id === 'gunlance') {
            if (hunter.wyvernFireCharging) {
                if (context.monsterAtb >= 78 && !context.monsterDowned) {
                    hunter.wyvernFireCharging = false;
                    return byId('gunlance.guard_thrust');
                }
                return byId('gunlance.wyvern_fire');
            }
            if (context.monsterDowned && hunter.wyvernGauge >= 100 && hunter.wyvernFireCooldown <= 0) return byId('gunlance.wyvern_fire_charge');
            if (Number(hunter.gunlanceStep || 0) === 6) return byId('gunlance.wyrmstake_detonate');
            if (Number(hunter.gunlanceStep || 0) === 2 && hunter.lastActionId === 'gunlance.quick_reload') return byId('gunlance.slam');
            if (Number(hunter.gunlanceStep || 0) === 4) return byId('gunlance.sweep');
            if (Number(hunter.gunlanceStep || 0) === 5) return hunter.wyrmstake > 0 ? byId('gunlance.wyrmstake_attach') : byId('gunlance.quick_reload');
            if (Number(hunter.shellStep || 0) === 1) return byId('gunlance.shell_2');
            if (Number(hunter.shellStep || 0) === 2) return hunter.wyrmstake > 0 ? byId('gunlance.shell_wyrmstake') : byId('gunlance.quick_reload');
            if (hunter.shells <= 1) return byId('gunlance.quick_reload');
            if (Number(hunter.gunlanceStep || 0) === 3 && context.monsterDowned && hunter.wyrmstake > 0 && hunter.shells >= 3) return byId('gunlance.wyrmstake_full_blast');
            const linked = linkedFromLast();
            if (linked >= 0) return linked;
            const typeRoll = this.random();
            if ((hunter.shellingType === 'wide' && typeRoll < 0.58) || (hunter.shellingType === 'long' && typeRoll < 0.3)) return byId('gunlance.shell_1');
            return byId('gunlance.lateral_thrust');
        }
        if (hunter.id === 'charge_blade') {
            if (hunter.cbGuardReady) {
                hunter.cbGuardReady = false;
                if (hunter.shieldChargeDuration > 0 && hunter.phials >= 3) return byId('charge_blade.saed');
                return byId('charge_blade.aed');
            }
            if (hunter.chargeBladeMode === 'sword') {
                if (hunter._mechanicMonsterPressure && hunter.phials > 0
                    && this.random() < HuntWeaponMechanics.specialActionChance(hunter, .32)) return byId('charge_blade.guard_point');
                if (hunter.chargeEnergy >= 45 && hunter.phials < 5) return byId('charge_blade.load_phials');
                if (hunter.phials >= 3 && hunter.shieldChargeDuration <= 0) return byId('charge_blade.charge_shield');
                if (hunter.phials >= 3 && hunter.shieldChargeDuration > 0 && hunter.shieldChargeDuration <= 60) return byId('charge_blade.refresh_shield');
                if (hunter.phials > 0 && (context.monsterDowned || hunter.shieldChargeDuration > 0)) return byId('charge_blade.morph_axe');
                const linked = linkedFromLast();
                return linked >= 0 ? linked : byId('charge_blade.sword_slash');
            }
            if ((context.monsterDowned || context.largeOpening) && hunter.shieldChargeDuration > 0 && hunter.phials >= 3) return byId('charge_blade.saed');
            if (hunter.shieldChargeDuration <= 60 && hunter.phials >= 3) return byId('charge_blade.morph_sword');
            if (hunter.shieldChargeDuration > 0 && hunter.cbAxeStep === 1 && hunter.phials > 0 && this.random() < 0.48) return byId('charge_blade.savage_axe');
            const linked = linkedFromLast();
            if (linked >= 0) return linked;
            if (hunter.phials > 0) return byId('charge_blade.element_discharge_2');
            return byId('charge_blade.morph_sword');
        }
        if (hunter.id === 'insect_glaive') {
            if (hunter.airborne) {
                if (hunter._mechanicMonsterWounded) return byId('insect_glaive.focus_thrust');
                return byId('insect_glaive.descending_thrust');
            }
            const missing = ['red', 'white', 'orange'].find(color => !hunter.extractBuffs?.[color]);
            if (missing) return byId(`insect_glaive.extract_${missing}`);
            if (hunter.spiralReady) return byId('insect_glaive.rising_spiral_slash');
            if (Number(hunter.glaiveCharge || 0) < 2) return byId(`insect_glaive.descending_charge_${Number(hunter.glaiveCharge || 0) + 1}`);
            if (context.monsterDowned || context.largeOpening || this.random() < 0.68) return byId('insect_glaive.strong_descending_slash');
            const linked = linkedFromLast();
            return linked >= 0 ? linked : byId('insect_glaive.rising_slash');
        }
        if (hunter.id === 'light_bowgun') {
            if (hunter.wyvernblastPlanted) return byId('light_bowgun.wyvernblast_detonate');
            if (context.monsterDowned && hunter.wyvernblastCharges > 0 && this.random() < 0.55) return byId('light_bowgun.wyvernblast_plant');
            if (hunter.magazine <= 0) return byId('light_bowgun.reload');
            if (hunter.rapidMode) {
                if (hunter.rapidGauge < 10) return byId('light_bowgun.exit_rapid');
                if (hunter.lbgChaserReady && this.random() < 0.42) return byId('light_bowgun.chaser');
                if (hunter._mechanicMonsterPressure && hunter.rapidGauge >= 10) return byId('light_bowgun.burst_step');
                return byId('light_bowgun.rapid_burst');
            }
            if (hunter.rapidGauge >= 60) return byId('light_bowgun.enter_rapid');
            if (hunter.lbgChaserReady) return byId('light_bowgun.chaser');
            if (this.random() < 0.45) return byId('light_bowgun.pierce_shot');
            return byId('light_bowgun.normal_shot');
        }
        if (hunter.id === 'heavy_bowgun') {
            if (hunter.hbgCounterReady) return byId('heavy_bowgun.wyverncounter_shot');
            if (hunter.hbgCounterWaiting) return byId('heavy_bowgun.wyverncounter_miss');
            if (hunter._mechanicMonsterWounded && hunter.specialAmmoCooldown <= 0) return byId('heavy_bowgun.focus_blast');
            if (hunter.magazine <= 0) return byId('heavy_bowgun.reload');
            if (hunter.ignitionMode) {
                if (hunter._mechanicMonsterPressure && hunter.ignitionGauge >= 20
                    && this.random() < HuntWeaponMechanics.specialActionChance(hunter, .4)) return byId('heavy_bowgun.wyverncounter_stance');
                const step = Number(hunter.wyvernheartStep || 0);
                if (hunter.ignitionGauge < [15, 20, 25][step]) return byId('heavy_bowgun.exit_ignition');
                return byId(`heavy_bowgun.wyvernheart_${step + 1}`);
            }
            if (hunter.ignitionGauge >= 60 && (context.monsterDowned || context.largeOpening || this.random() < 0.62)) return byId('heavy_bowgun.enter_ignition');
            return byId(this.random() < 0.5 ? 'heavy_bowgun.pierce' : 'heavy_bowgun.spread');
        }
        if (hunter.id === 'bow') {
            if (hunter.bowStamina <= 24) return byId('bow.recover_stamina');
            if (hunter._mechanicMonsterWounded && hunter.fuseArrows > 0) return byId('bow.focus_fire');
            if (hunter.tracerTicks > 0 && hunter.bowCharge === 3) return byId('bow.tracer_dragon_piercer');
            if (hunter.tracerGauge >= 60 && hunter.tracerTicks <= 0 && hunter.bowCharge <= 1) return byId('bow.tracer_arrow');
            if (hunter.tracerGauge >= 30 && hunter.fuseArrows <= 0 && context.monsterDowned) return byId('bow.arc_shot');
            if (hunter._mechanicMonsterPressure && hunter.bowStamina >= 15
                && this.random() < HuntWeaponMechanics.specialActionChance(hunter, .4)) return byId('bow.charging_sidestep');
            if (hunter.bowPowerStep === 1) return byId('bow.power_shot');
            if (hunter.bowPowerStep === 2) return byId('bow.power_volley');
            if (hunter.bowCharge < 3) return byId(`bow.draw_${hunter.bowCharge + 1}`);
            return byId('bow.charged_shot');
        }
        return -1;
    }

    isPreparation(action) {
        return Boolean(action?.tags?.includes('preparation'));
    }

    damageMultiplier(hunter, action) {
        let multiplier = 1;
        if (hunter?.id === 'great_sword' && action?.tags?.includes('charge-release')) {
            multiplier *= [0, 0.55, 0.78, 1][Math.max(1, Math.min(3, Number(hunter.greatSwordCharge || 1)))];
        }
        if (hunter?.id === 'switch_axe') {
            if (hunter.weaponMode === 'sword') multiplier *= 1.08;
            if (hunter.ampedStateDuration > 0 && action?.tags?.includes('sword-mode')) {
                const mv = Math.max(1, Number(action.motionValue || 1));
                multiplier *= (mv + 12) / mv;
            }
            if (hunter.powerAxeDuration > 0 && action?.tags?.includes('axe-mode')) multiplier *= 1.05;
        }
        if (hunter?.id === 'long_sword') multiplier *= [1, 1.05, 1.1, 1.2][hunter.spiritLevel || 0] || 1;
        if (hunter?.id === 'dual_blades') {
            // Many small, readable internal steps should still cash out at the weapon's intended DPS.
            multiplier *= 1.22;
            if (hunter.demonMode) multiplier *= 1.2;
            else if (action?.tags?.includes('archdemon')) multiplier *= 1.1;
        }
        if (hunter?.id === 'hunting_horn' && hunter.melodyBuffTicks > 0) multiplier *= 1.12;
        if (hunter?.id === 'lance' && action?.id === 'lance.payback_thrust') {
            multiplier *= [1, 1, 1.2, 1.4][Math.max(1, Math.min(3, Number(hunter.powerGuardCharge || 1)))];
        }
        if (hunter?.id === 'gunlance') {
            if (hunter.shellingType === 'normal' && action?.tags?.includes('gunlance-fullburst')) multiplier *= 1.2;
            if (hunter.shellingType === 'long' && (action?.tags?.includes('wyrmstake') || action?.id === 'gunlance.wyvern_fire')) multiplier *= 1.18;
            if (hunter.shellingType === 'wide' && action?.tags?.includes('gunlance-shell')) multiplier *= 1.25;
        }
        if (Number(hunter?.hornAttackBuffTicks || 0) > 0) multiplier *= 1.1;
        if (hunter?.id === 'charge_blade' && hunter.shieldChargeDuration > 0 && action?.tags?.includes('axe-mode')) multiplier *= 1.15;
        if (hunter?.id === 'charge_blade' && action?.id === 'charge_blade.saed') {
            multiplier *= 1 + Math.max(0, Number(hunter.phials || 0) - 3) * 0.1;
        }
        if (hunter?.id === 'insect_glaive' && hunter.extractDuration > 0) multiplier *= 1.3;
        if (hunter?.id === 'bow' && hunter.tracerTicks > 0 && action?.tags?.includes('ranged')) multiplier *= 1.12;
        return multiplier;
    }

    hornMelodies() {
        if (!this._hornMelodies) this._hornMelodies = Object.freeze([
            Object.freeze({ id: 'attack', name: '공격력 강화', symbol: '♬', color: '#ff6868', notes: Object.freeze(['red', 'blue', 'red']) }),
            Object.freeze({ id: 'defense', name: '방어력 강화', symbol: '♬', color: '#6aa9ff', notes: Object.freeze(['blue', 'green', 'blue']) }),
            Object.freeze({ id: 'heal', name: '체력 회복', symbol: '♬', color: '#62df8a', notes: Object.freeze(['green', 'red', 'green']) }),
            Object.freeze({ id: 'self', name: '자기 강화', symbol: '♫', color: '#ff9a64', notes: Object.freeze(['red', 'red', 'blue']) }),
            Object.freeze({ id: 'divine', name: '정령의 가호', symbol: '♫', color: '#9ab8ff', notes: Object.freeze(['blue', 'blue', 'green']) }),
            Object.freeze({ id: 'speed', name: '행동 속도 강화', symbol: '♫', color: '#78e6b0', notes: Object.freeze(['green', 'blue', 'green']) })
        ]);
        return this._hornMelodies;
    }

    hornMelodyById(id) {
        return this.hornMelodies().find(melody => melody.id === id) || null;
    }

    applyHornMelody(engine, hunter, melody) {
        const party = (engine.selectedWeapons || [hunter]).filter(member => member && member.status === 'alive');
        if (melody.id === 'attack') party.forEach(member => { member.hornAttackBuffTicks = Math.max(Number(member.hornAttackBuffTicks || 0), 180); });
        if (melody.id === 'defense') party.forEach(member => { member.hornDefenseBuffTicks = Math.max(Number(member.hornDefenseBuffTicks || 0), 180); });
        if (melody.id === 'heal') party.forEach(member => {
            const amount = Math.max(1, Math.round(Number(member.maxHp || 100) * 0.18));
            member.hp = Math.min(Number(member.maxHp || 100), Number(member.hp || 0) + amount);
            if (engine.updateHpUI) engine.updateHpUI(member);
        });
        if (melody.id === 'self') hunter.melodyBuffTicks = Math.max(Number(hunter.melodyBuffTicks || 0), 210);
        if (melody.id === 'divine') party.forEach(member => { member.hornDefenseBuffTicks = Math.max(Number(member.hornDefenseBuffTicks || 0), 120); });
        if (melody.id === 'speed') party.forEach(member => { member.hornSpeedBuffTicks = Math.max(Number(member.hornSpeedBuffTicks || 0), 150); });
        engine.addLog(`${melody.symbol} [${melody.name}] ${hunter.hunterName}의 연주 타격과 함께 효과가 발동했습니다!`, melody.color);
    }

    presentationFor(hunter, action) {
        const id = String(action?.id || '');
        if (hunter?.id === 'hammer') {
            if (action?.tags?.includes('charge')) return { label: action.name, bubble: false, log: false };
            if (id === 'hammer.big_bang_finisher') return { label: '빅뱅 피니시!', bubble: true, log: true };
            if (id === 'hammer.spinning_upswing') return { label: '회전 강어퍼!', bubble: true, log: true };
            if (id === 'hammer.offset_followup_spinslam') return { label: '상쇄 후 회전 내려치기!', bubble: true, log: true };
            if (id === 'hammer.focus_earthquake') return { label: '집중 타격【진천】!', bubble: true, log: true };
            if (id === 'hammer.release_3') return { label: '3차지 강 내려치기!', bubble: true, log: true };
            if (id === 'hammer.mighty_charge_slam') return { label: '혼신 모아 내려치기!', bubble: true, log: true };
            return { label: action?.name || '해머 연계', bubble: false, log: false };
        }
        if (hunter?.id === 'dual_blades') {
            if (id === 'dual_blades.enter_demon') return { label: '귀인화!', bubble: true, log: true };
            if (id === 'dual_blades.exit_demon') return { label: '귀인화 해제', bubble: true, log: true };
            if (id === 'dual_blades.blade_dance') return { label: '귀인난무 III!', bubble: true, log: true };
            if (id === 'dual_blades.archdemon_slash') return { label: '귀인강화 연참!', bubble: true, log: true };
            if (id.includes('blade_dance')) return { label: '귀인난무', bubble: false, log: false };
            return { label: hunter.demonMode ? '귀인 연계' : '쌍검 연계', bubble: false, log: false };
        }
        if (hunter?.id === 'hunting_horn') {
            if (id.startsWith('hunting_horn.note_')) return { label: '음색 입력', bubble: false, log: false };
            if (id === 'hunting_horn.recital_start') return { label: `연주 개시 · ${(hunter.storedMelodies || []).length}악보`, bubble: true, log: true };
            if (id === 'hunting_horn.recital_strike') {
                const melody = this.hornMelodyById((hunter.storedMelodies || [])[0]);
                return { label: melody ? `${melody.symbol} ${melody.name}!` : '연주 타격!', bubble: true, log: false };
            }
            if (id === 'hunting_horn.recital_finish') {
                const full = Number(hunter.recitalStartCount || 0) >= 3;
                return { label: full ? '3악보 연주 완주!' : '연주 완료', bubble: full, log: full };
            }
            if (id === 'hunting_horn.echo_bubble') return { label: '향옥 설치!', bubble: true, log: true };
            if (id === 'hunting_horn.offset_melody') return { label: '상쇄의 선율!', bubble: true, log: true };
        }
        if (hunter?.id === 'lance') {
            if (id === 'lance.counter_thrust') return { label: '카운터 찌르기!', bubble: true, log: true };
            if (id === 'lance.payback_thrust') return { label: `되갚아주기 ${Math.max(1, Number(hunter.powerGuardCharge || 1))}단계!`, bubble: true, log: true };
            if (id === 'lance.finishing_twin_thrust') return { label: '피니시 2단 찌르기!', bubble: true, log: true };
            return { label: action?.name || '랜스 연계', bubble: false, log: false };
        }
        if (hunter?.id === 'gunlance') {
            if (id === 'gunlance.full_burst') return { label: '풀버스트!', bubble: true, log: false };
            if (id === 'gunlance.wyrmstake_detonate') return { label: '용항포 폭발!', bubble: true, log: true };
            if (id === 'gunlance.wyrmstake_full_blast') return { label: '용항 풀버스트!', bubble: true, log: true };
            if (id === 'gunlance.wyvern_fire_charge') return { label: '용격포 충전!', bubble: true, log: true };
            if (id === 'gunlance.wyvern_fire') return { label: '용격포!', bubble: true, log: true };
            return { label: action?.name || '건랜스 연계', bubble: false, log: false };
        }
        if (hunter?.id === 'charge_blade') {
            if (id === 'charge_blade.charge_shield') return { label: '방패·도끼 강화!', bubble: true, log: true };
            if (id === 'charge_blade.refresh_shield') return { label: '방패·도끼 강화 연장!', bubble: true, log: true };
            if (id === 'charge_blade.guard_point') return { label: '가드 포인트 준비', bubble: false, log: false };
            if (id === 'charge_blade.savage_axe') return { label: '강화 도끼 회전베기!', bubble: true, log: false };
            if (id === 'charge_blade.aed') return { label: '고출력 속성해방베기!', bubble: true, log: true };
            if (id === 'charge_blade.saed') return { label: '초고출력 속성해방베기!', bubble: true, log: true };
            return { label: action?.name || '차지액스 연계', bubble: false, log: false };
        }
        if (hunter?.id === 'switch_axe') {
            if (id === 'switch_axe.axe_heavy_slam') return { label: '도끼 강화 내려치기!', bubble: true, log: true };
            if (id === 'switch_axe.zero_sum_discharge') return { label: '영거리 속성해방!', bubble: true, log: true };
            if (id === 'switch_axe.sword_counter_stance') return { label: '검 카운터 대기!', bubble: false, log: false };
            if (id === 'switch_axe.sword_counter_rising') return { label: '검 카운터 성공!', bubble: true, log: true };
            if (id === 'switch_axe.unbridled_slash') return { label: '압축 해방 베기!', bubble: true, log: true };
            if (id === 'switch_axe.full_release_slash') return { label: '풀 릴리스 슬래시!', bubble: true, log: true };
            return { label: action?.name || '슬래시액스 연계', bubble: false, log: false };
        }
        if (hunter?.id !== 'sword_shield') return null;
        if (id.includes('perfect_rush')) return { label: '저스트 러시!', bubble: id.endsWith('finisher'), log: id.endsWith('finisher') };
        if (id === 'sword_shield.falling_bash') return { label: '방패 내려찍기!', bubble: true, log: true };
        if (id === 'sword_shield.plunging_thrust') return { label: '공중 강습!', bubble: true, log: true };
        if (id === 'sword_shield.counter_slash') return { label: '카운터베기!', bubble: true, log: true };
        if (id === 'sword_shield.perfect_guard') return { label: '퍼펙트 가드!', bubble: false, log: false };
        if (id.startsWith('sword_shield.shield_bash') || id === 'sword_shield.guard_slash') return { label: '방패 연타', bubble: false, log: false };
        if (id === 'sword_shield.charged_chop') return { label: '모아베기!', bubble: true, log: true };
        if (id === 'sword_shield.backstep' || id === 'sword_shield.charged_slash' || id === 'sword_shield.jumping_slash') return { label: '기동 전환', bubble: false, log: false };
        return { label: '연속 베기', bubble: false, log: false };
    }

    applyAction(engine, hunter, action) {
        this.initialize(hunter);
        const effects = action?.effects || {};
        if (hunter.id === 'switch_axe') {
            const previousMode = hunter.weaponMode;
            if (effects.weaponMode) hunter.weaponMode = effects.weaponMode;
            hunter.switchGauge = Math.max(0, Math.min(100, Number(hunter.switchGauge || 0) + Number(effects.switchGauge || 0)));
            hunter.weaponGauge = hunter.switchGauge;
            hunter.ampGauge = Math.max(0, Math.min(100, Number(hunter.ampGauge || 0) + Number(effects.ampGauge || 0)));
            if (effects.powerAxeTicks) hunter.powerAxeDuration = Math.max(hunter.powerAxeDuration, effects.powerAxeTicks);
            ['switchCounterWaiting', 'switchCounterReady']
                .forEach(key => { if (effects[key] !== undefined) hunter[key] = Boolean(effects[key]); });
            if (effects.consumeAmp) {
                hunter.ampGauge = 0;
                hunter.ampedStateDuration = 0;
            } else if (hunter.ampGauge >= 100 && hunter.ampedStateDuration <= 0) {
                hunter.ampedStateDuration = 180;
                engine.addLog(`⚡ [고출력 상태] ${hunter.hunterName}의 검 공격 누적이 임계점에 도달했습니다. 속성해방 피니시가 열립니다!`, '#ff4fd8');
            }
            if (previousMode !== hunter.weaponMode) {
                engine.addLog(`🔁 [슬래시액스 변형] ${hunter.hunterName}: ${previousMode === 'axe' ? '도끼' : '검'} → ${hunter.weaponMode === 'axe' ? '도끼' : '검'} 모드`, '#61dafb');
            }
            if (effects.powerAxeTicks) {
                engine.addLog(`🪓 [도끼 강화] 강화 내려치기로 도끼의 부위 압박과 게이지 회수력이 상승합니다.`, '#ffb347');
            }
        } else if (hunter.id === 'hammer') {
            hunter.hammerChargeLevel = Number(effects.hammerChargeLevel ?? hunter.hammerChargeLevel ?? 0);
            ['hammerNormalStep', 'hammerBigBangStep', 'hammerSpinStep', 'hammerFocusCooldown']
                .forEach(key => { if (effects[key] !== undefined) hunter[key] = Number(effects[key]); });
            ['hammerOffsetWaiting', 'hammerOffsetFollowupReady']
                .forEach(key => { if (effects[key] !== undefined) hunter[key] = Boolean(effects[key]); });
            if (this.isPreparation(action) && action?.tags?.includes('charge')) {
                const label = hunter.hammerChargeLevel === 4 ? '혼신 모으기' : `${hunter.hammerChargeLevel}차지`;
                engine.addLog(`🔨 [${label}] ${hunter.hunterName}가 짧게 호흡을 모읍니다. 다음 ATB가 빠르게 이어집니다.`, '#ffd166');
            }
        }
        const add = (key, delta, min = 0, max = 100) => {
            if ((key === 'demonStamina' || key === 'bowStamina') && engine.blightRuntime) {
                delta = engine.blightRuntime.staminaDelta(hunter, Number(delta || 0));
            }
            hunter[key] = Math.max(min, Math.min(max, Number(hunter[key] || 0) + Number(delta || 0)));
        };
        if (hunter.id === 'great_sword') {
            if (effects.greatSwordCharge !== undefined) hunter.greatSwordCharge = effects.greatSwordCharge;
            if (effects.greatSwordChain !== undefined) hunter.greatSwordChain = effects.greatSwordChain;
            if (effects.advanceGreatSwordChain) hunter.greatSwordChain = Math.min(2, Number(hunter.greatSwordChain || 0) + 1);
            if (this.isPreparation(action)) {
                const names = ['모아베기', '강 모아베기', '참 모아베기'];
                engine.addLog(`⚔️ [${names[hunter.greatSwordChain] || names[0]} ${hunter.greatSwordCharge}차지] ${hunter.hunterName}가 다음 판단까지 짧게 힘을 모읍니다.`, '#f2d18b');
            } else if (action?.tags?.includes('tackle')) {
                engine.addLog(`🛡️ [태클] ${hunter.hunterName}가 공격을 받아내며 다음 모아베기 연계로 넘어갑니다.`, '#d9e4f2');
            }
        }
        if (hunter.id === 'long_sword') {
            const spiritLevelBefore = Number(hunter.spiritLevel || 0);
            add('spiritGauge', effects.spiritGauge);
            if (effects.specialSheatheReady !== undefined) hunter.specialSheatheReady = effects.specialSheatheReady;
            if (effects.spiritRoundslashReady !== undefined) hunter.spiritRoundslashReady = effects.spiritRoundslashReady;
            if (effects.iaiHelmBreakerReady !== undefined) hunter.iaiHelmBreakerReady = effects.iaiHelmBreakerReady;
            if (effects.spiritReleaseReady !== undefined) hunter.spiritReleaseReady = effects.spiritReleaseReady;
            if (effects.openSpiritRelease) hunter.spiritReleaseReady = spiritLevelBefore >= 3;
            if (effects.spiritLevel) {
                hunter.spiritLevel = Math.max(0, Math.min(3, Number(hunter.spiritLevel || 0) + effects.spiritLevel));
                engine.addLog(`✨ [기인 단계] ${hunter.hunterName}: ${hunter.spiritLevel}/3`, '#ff9f43');
            }
            if (action?.id === 'long_sword.special_sheathe') {
                engine.addLog(`🗡️ [특수납도] ${hunter.hunterName}가 기인 레벨을 걸고 공격 타이밍을 기다립니다.`, '#d8e6ff');
            } else if (action?.id === 'long_sword.iai_counter_fail') {
                engine.addLog(`💢 [거합베기 실패] 타이밍을 놓쳐 기인 레벨이 한 단계 하락합니다.`, '#ff6b6b');
            }
        }
        if (hunter.id === 'sword_shield') {
            if (effects.snsChain !== undefined) hunter.snsChain = effects.snsChain;
            if (effects.snsShieldStep !== undefined) hunter.snsShieldStep = effects.snsShieldStep;
            if (effects.perfectRushStep !== undefined) hunter.perfectRushStep = effects.perfectRushStep;
            ['snsBackstepReady', 'snsAerialReady', 'snsPerfectGuardReady', 'snsCounterReady', 'snsGuardSlashReady']
                .forEach(key => { if (effects[key] !== undefined) hunter[key] = effects[key]; });
        }
        if (hunter.id === 'dual_blades') {
            if (effects.demonMode !== undefined) hunter.demonMode = effects.demonMode;
            add('demonStamina', effects.demonStamina);
            add('archdemonGauge', effects.archdemonGauge);
            ['dualChain', 'demonChain', 'demonDanceStep', 'archdemonStep']
                .forEach(key => { if (effects[key] !== undefined) hunter[key] = effects[key]; });
            hunter.demonModeDuration = hunter.demonMode ? 1 : 0;
            if (action.id === 'dual_blades.enter_demon') {
                hunter.demonToggleCooldown = 100;
                hunter.demonModeMinTicks = 0;
                engine.addLog(`🔥 [귀인화] ${hunter.hunterName}이(가) 가득 채운 붉은 귀인 게이지를 해방합니다.`, '#ff5252');
            }
            if (action.id === 'dual_blades.exit_demon') {
                hunter.demonToggleCooldown = 100;
                hunter.demonModeMinTicks = 0;
                engine.addLog(`🌘 [귀인화 해제] ${hunter.hunterName}이(가) 축적한 귀인 게이지로 전투를 이어갑니다.`, '#b9a7d9');
            }
        }
        if (hunter.id === 'hunting_horn') {
            if (effects.hornNote) {
                hunter.hornNotes.push(effects.hornNote);
                const target = this.hornMelodies()[Number(hunter.hornMelodyCursor || 0) % this.hornMelodies().length];
                if (hunter.hornNotes.length >= 3) {
                    const completed = this.hornMelodies().find(melody => melody.notes.join(',') === hunter.hornNotes.slice(-3).join(',')) || target;
                    if (hunter.storedMelodies.length < 3) hunter.storedMelodies.push(completed.id);
                    hunter.hornNotes = [];
                    hunter.hornMelodyCursor = (Number(hunter.hornMelodyCursor || 0) + 1) % this.hornMelodies().length;
                    engine.addLog(`${completed.symbol} [${completed.name} 악보] ${hunter.hunterName}이(가) 악보를 충전했습니다. (${hunter.storedMelodies.length}/3)`, completed.color);
                    if (engine.showSkillBubble) engine.showSkillBubble(hunter.index, `${completed.symbol} ${completed.name} 악보 완성!`);
                }
            }
            if (effects.recitalActive !== undefined) hunter.recitalActive = effects.recitalActive;
            if (effects.beginRecital) {
                hunter.recitalStartCount = hunter.storedMelodies.length;
                hunter.recitalPlayed = 0;
            }
            if (effects.consumeStoredMelody) {
                const melody = this.hornMelodyById(hunter.storedMelodies.shift());
                if (melody) this.applyHornMelody(engine, hunter, melody);
                hunter.recitalPlayed++;
            }
            if (effects.finishRecital) {
                if (hunter.recitalStartCount >= 3 && hunter.recitalPlayed >= 3) {
                    add('echoGauge', 24);
                    (engine.selectedWeapons || []).forEach(member => { if (member.status === 'alive') member.hornSpeedBuffTicks = Math.max(Number(member.hornSpeedBuffTicks || 0), 90); });
                    engine.addLog(`♬ [3악보 연주 완주] ${hunter.hunterName}의 마무리 박자가 파티의 행동을 가속합니다!`, '#ffd166');
                }
                hunter.recitalStartCount = 0;
                hunter.recitalPlayed = 0;
            }
            add('echoGauge', effects.echoGauge);
            if (effects.echoBubbleTicks) hunter.echoBubbleTicks = effects.echoBubbleTicks;
        }
        if (hunter.id === 'lance') {
            if (effects.lanceStep !== undefined) hunter.lanceStep = effects.lanceStep;
            ['lanceMobilityStep', 'lanceDashStep', 'powerGuardCharge']
                .forEach(key => { if (effects[key] !== undefined) hunter[key] = Number(effects[key]); });
            ['lanceCounterWaiting', 'lanceCounterReady', 'powerGuardWaiting', 'powerGuardReady']
                .forEach(key => { if (effects[key] !== undefined) hunter[key] = Boolean(effects[key]); });
            add('guardPower', effects.guardPower);
            add('guardBurden', effects.guardBurden, 0, 100);
        }
        if (hunter.id === 'gunlance') {
            if (effects.gunlanceStep !== undefined) hunter.gunlanceStep = effects.gunlanceStep;
            if (effects.shellStep !== undefined) hunter.shellStep = effects.shellStep;
            if (effects.shells !== undefined) add('shells', effects.shells, 0, hunter.maxShells);
            if (effects.consumeAllShells) hunter.shells = 0;
            if (effects.reloadShells) {
                hunter.shells = hunter.maxShells;
                hunter.wyrmstake = 1;
            }
            add('wyrmstake', effects.wyrmstake, 0, 1);
            add('heatGauge', effects.heatGauge);
            add('wyvernGauge', effects.wyvernGauge, 0, 100);
            if (effects.wyvernFireCharging !== undefined) hunter.wyvernFireCharging = Boolean(effects.wyvernFireCharging);
            if (effects.wyvernFireCooldown) hunter.wyvernFireCooldown = effects.wyvernFireCooldown;
            hunter.overheatDuration = hunter.heatGauge >= 100 ? 30 : 0;
            if (engine.updateOverheatUI) engine.updateOverheatUI(hunter.index, Math.round(hunter.heatGauge * 0.3));
        }
        if (hunter.id === 'charge_blade') {
            const storedChargeEnergy = hunter.chargeEnergy;
            if (effects.chargeBladeMode) hunter.chargeBladeMode = effects.chargeBladeMode;
            add('chargeEnergy', effects.chargeEnergy);
            add('savageAxeGauge', effects.savageAxeGauge);
            if (effects.cbSwordStep !== undefined) hunter.cbSwordStep = Number(effects.cbSwordStep);
            if (effects.cbAxeStep !== undefined) hunter.cbAxeStep = Number(effects.cbAxeStep);
            if (effects.cbGuardWaiting !== undefined) hunter.cbGuardWaiting = Boolean(effects.cbGuardWaiting);
            if (effects.cbGuardReady !== undefined) hunter.cbGuardReady = Boolean(effects.cbGuardReady);
            if (effects.loadPhials) {
                const loaded = Math.max(1, Math.min(5 - hunter.phials, Math.floor((storedChargeEnergy + 24) / 25)));
                hunter.phials = Math.min(5, hunter.phials + loaded);
                hunter.chargeEnergy = 0;
                engine.addLog(`⚡ [병 충전] ${hunter.hunterName}: ${hunter.phials}/5`, '#54a0ff');
            }
            if (effects.consumePhials) hunter.phials = Math.max(0, hunter.phials - effects.consumePhials);
            if (effects.consumeAllPhials) hunter.phials = 0;
            if (effects.shieldChargeTicks) {
                hunter.shieldChargeDuration = effects.shieldChargeTicks;
                hunter.savageAxeTicks = effects.savageAxeTicks || effects.shieldChargeTicks;
                engine.addLog('🛡️ [방패 속성강화] 도끼 기술과 초고출력의 인과가 열렸습니다.', '#ff6bcb');
            }
            if (engine.updatePhialsUI) engine.updatePhialsUI(hunter.index, hunter.phials);
        }
        if (hunter.id === 'insect_glaive') {
            if (effects.addExtract) {
                hunter.extractBuffs[effects.addExtract] = 1;
                if (hunter.extractBuffs.red && hunter.extractBuffs.white && hunter.extractBuffs.orange) {
                    hunter.extractDuration = 240;
                    engine.addLog(`🪲 [3색 진액] ${hunter.hunterName}의 강화 연계와 공중 피니시가 해금됩니다.`, '#c7f464');
                }
                if (engine.updateExtractsUI) engine.updateExtractsUI(hunter.index, hunter.extractBuffs);
            }
            if (effects.glaiveStep !== undefined) hunter.glaiveStep = effects.glaiveStep;
            if (effects.glaiveCharge !== undefined) hunter.glaiveCharge = effects.glaiveCharge;
            if (effects.spiralReady !== undefined) hunter.spiralReady = Boolean(effects.spiralReady);
            if (effects.airborne !== undefined) hunter.airborne = effects.airborne;
            if (effects.consumeExtracts) {
                hunter.extractBuffs = { red: 0, white: 0, orange: 0 };
                hunter.extractDuration = 0;
            }
            if (effects.recoverAllExtracts) {
                hunter.extractBuffs = { red: 1, white: 1, orange: 1 };
                hunter.extractDuration = 240;
            }
            if ((effects.consumeExtracts || effects.recoverAllExtracts) && engine.updateExtractsUI) {
                engine.updateExtractsUI(hunter.index, hunter.extractBuffs);
            }
        }
        if (this.managesAmmo(hunter.id)) {
            add('magazine', effects.magazine, 0, hunter.maxMagazine);
            if (effects.reloadMagazine) hunter.magazine = hunter.maxMagazine;
            hunter.ammo = hunter.magazine;
            add('rapidGauge', effects.rapidGauge);
            add('ignitionGauge', effects.ignitionGauge);
            if (effects.specialAmmoCooldown) hunter.specialAmmoCooldown = effects.specialAmmoCooldown;
            if (hunter.id === 'light_bowgun') {
                if (effects.rapidMode !== undefined) hunter.rapidMode = Boolean(effects.rapidMode);
                if (effects.lbgChaserReady !== undefined) hunter.lbgChaserReady = Boolean(effects.lbgChaserReady);
                if (effects.wyvernblastPlanted !== undefined) hunter.wyvernblastPlanted = Boolean(effects.wyvernblastPlanted);
                add('wyvernblastCharges', effects.wyvernblastCharges, 0, 3);
                if (effects.nextEvadeBoost) hunter.nextEvadeBoost = Math.max(Number(hunter.nextEvadeBoost || 0), effects.nextEvadeBoost);
            }
            if (hunter.id === 'heavy_bowgun') {
                if (effects.ignitionMode !== undefined) hunter.ignitionMode = Boolean(effects.ignitionMode);
                if (effects.wyvernheartStep !== undefined) hunter.wyvernheartStep = Number(effects.wyvernheartStep);
                if (effects.hbgCounterWaiting !== undefined) hunter.hbgCounterWaiting = Boolean(effects.hbgCounterWaiting);
                if (effects.hbgCounterReady !== undefined) hunter.hbgCounterReady = Boolean(effects.hbgCounterReady);
            }
        }
        if (hunter.id === 'bow') {
            if (effects.bowCharge !== undefined) hunter.bowCharge = effects.bowCharge;
            if (effects.advanceBowCharge) hunter.bowCharge = Math.min(3, Number(hunter.bowCharge || 0) + 1);
            if (effects.bowPowerStep !== undefined) hunter.bowPowerStep = effects.bowPowerStep;
            add('tracerGauge', effects.tracerGauge);
            add('bowStamina', effects.bowStamina, 0, 100);
            add('fuseArrows', effects.fuseArrows, 0, 3);
            if (effects.tracerTicks !== undefined) hunter.tracerTicks = effects.tracerTicks;
            if (effects.nextEvadeBoost) hunter.nextEvadeBoost = Math.max(Number(hunter.nextEvadeBoost || 0), effects.nextEvadeBoost);
        }
        const atbAfterAction = Number(effects.atbAfterAction || 0);
        return { atbAfterAction };
    }

    onAttackMiss(engine, hunter, action) {
        if (hunter?.id !== 'long_sword' || action?.id !== 'long_sword.spirit_roundslash') return false;
        hunter.spiritGauge = 0;
        hunter.spiritRoundslashReady = false;
        engine.addLog?.(`💨 [대회전 실패] ${hunter.hunterName}의 대회전베기가 빗나가 기인 게이지가 0이 되었습니다.`, '#a9b8c7');
        return true;
    }

    onConfirmedHit(engine, hunter, action) {
        if (hunter?.id !== 'long_sword' || action?.id !== 'long_sword.spirit_roundslash') return false;
        hunter.spiritLevel = Math.min(3, Number(hunter.spiritLevel || 0) + 1);
        engine.addLog?.(`✨ [대회전 적중] ${hunter.hunterName}: 기인 ${hunter.spiritLevel}/3`, '#ff9f43');
        return true;
    }

    tick(hunter) {
        this.initialize(hunter);
        if (hunter.id === 'switch_axe') {
            if (hunter.powerAxeDuration > 0) hunter.powerAxeDuration--;
            if (hunter.ampedStateDuration > 0) {
                hunter.ampedStateDuration--;
                if (hunter.ampedStateDuration === 0) hunter.ampGauge = 0;
            }
            if (hunter.weaponMode === 'axe' && hunter.switchGauge < 100) {
                hunter.switchGauge = Math.min(100, hunter.switchGauge + (hunter.powerAxeDuration > 0 ? 0.45 : 0.3));
                hunter.weaponGauge = hunter.switchGauge;
            }
        }
        if (hunter.id === 'dual_blades') {
            if (hunter.demonToggleCooldown > 0) hunter.demonToggleCooldown--;
            if (hunter.demonModeMinTicks > 0) hunter.demonModeMinTicks--;
            hunter.demonModeDuration = hunter.demonMode ? 1 : 0;
        }
        ['melodyBuffTicks', 'echoBubbleTicks', 'hornAttackBuffTicks', 'hornDefenseBuffTicks', 'hornSpeedBuffTicks', 'wyvernFireCooldown', 'shieldChargeDuration', 'specialAmmoCooldown', 'tracerTicks', 'hammerFocusCooldown']
            .forEach(key => { if (hunter[key] > 0) hunter[key]--; });
        if (hunter.id === 'gunlance' && hunter.heatGauge > 0) hunter.heatGauge = Math.max(0, hunter.heatGauge - 0.12);
        if (hunter.id === 'lance' && hunter.guardBurden > 0 && !hunter.powerGuardWaiting) hunter.guardBurden = Math.max(0, hunter.guardBurden - 0.18);
        if (hunter.id === 'charge_blade') hunter.savageAxeTicks = Number(hunter.shieldChargeDuration || 0);
        if (hunter.id === 'light_bowgun' && hunter.wyvernblastCharges < 3) {
            hunter.wyvernblastRecharge = Number(hunter.wyvernblastRecharge || 0) + 1;
            if (hunter.wyvernblastRecharge >= 180) {
                hunter.wyvernblastCharges++;
                hunter.wyvernblastRecharge = 0;
            }
        }
        if (hunter.id === 'bow' && hunter.bowStamina < 100) {
            const recovery = this.engine?.blightRuntime ? this.engine.blightRuntime.staminaDelta(hunter, 0.35) : 0.35;
            hunter.bowStamina = Math.min(100, hunter.bowStamina + recovery);
        }
        if (hunter.id === 'insect_glaive' && hunter.extractDuration > 0) {
            hunter.extractDuration--;
            if (hunter.extractDuration === 0) hunter.extractBuffs = { red: 0, white: 0, orange: 0 };
        }
    }

    onHit(hunter) {
        if (!hunter) return;
        // A confirmed hit breaks the current input chain. Durable resources and
        // modes remain, but the next turn must never resume at an internal step.
        hunter.lastActionId = null;
        if (hunter.id === 'long_sword') {
            hunter.longSwordForesightEligible = false;
            hunter.longSwordForesightChain = 0;
            hunter.specialSheatheReady = false;
            hunter.spiritRoundslashReady = false;
            hunter.iaiHelmBreakerReady = false;
            hunter.spiritReleaseReady = false;
        }
        if (hunter.id === 'hammer') {
            hunter.hammerChargeLevel = 0;
            hunter.hammerNormalStep = 0;
            hunter.hammerBigBangStep = 0;
            hunter.hammerSpinStep = 0;
            hunter.hammerOffsetWaiting = false;
            hunter.hammerOffsetFollowupReady = false;
        }
        if (hunter.id === 'switch_axe') {
            hunter.switchCounterWaiting = false;
            hunter.switchCounterReady = false;
        }
        if (hunter.id === 'lance') {
            hunter.lanceStep = 0;
            hunter.lanceMobilityStep = 0;
            hunter.lanceDashStep = 0;
            hunter.lanceCounterWaiting = false;
            hunter.lanceCounterReady = false;
            hunter.powerGuardWaiting = false;
            hunter.powerGuardReady = false;
            hunter.powerGuardCharge = 0;
        }
        if (hunter.id === 'gunlance') {
            hunter.wyvernFireCharging = false;
            hunter.gunlanceStep = 0;
            hunter.shellStep = 0;
        }
        if (hunter.id === 'charge_blade') {
            hunter.cbGuardWaiting = false;
            hunter.cbGuardReady = false;
            hunter.cbSwordStep = 0;
            hunter.cbAxeStep = 0;
        }
        if (hunter.id === 'heavy_bowgun') {
            hunter.hbgCounterWaiting = false;
            hunter.hbgCounterReady = false;
            hunter.wyvernheartStep = 0;
        }
        if (hunter.id === 'great_sword') {
            hunter.greatSwordCharge = 0;
            hunter.greatSwordChain = 0;
            hunter.greatSwordChargeLocked = false;
        }
        if (hunter.id === 'sword_shield') {
            hunter.snsChain = 0;
            hunter.perfectRushStep = 0;
            hunter.snsBackstepReady = false;
            hunter.snsAerialReady = false;
            hunter.snsPerfectGuardReady = false;
            hunter.snsCounterReady = false;
            hunter.snsShieldStep = 0;
        }
        if (hunter.id === 'dual_blades') {
            hunter.dualChain = 0;
            hunter.demonChain = 0;
            hunter.demonDanceStep = 0;
            hunter.archdemonStep = 0;
        }
        if (hunter.id === 'hunting_horn' && hunter.recitalActive) {
            hunter.recitalActive = false;
            hunter.recitalPlayed = 0;
            hunter.recitalStartCount = 0;
        }
        if (hunter.id === 'insect_glaive') {
            hunter.airborne = false;
            hunter.glaiveStep = 0;
            hunter.glaiveCharge = 0;
        }
        if (hunter.id === 'bow') {
            hunter.bowCharge = 0;
            hunter.bowPowerStep = 0;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) module.exports = HuntWeaponMechanics;
else window.HuntWeaponMechanics = HuntWeaponMechanics;
