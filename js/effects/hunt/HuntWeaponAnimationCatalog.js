class HuntWeaponAnimationCatalog {
    static get PROFILES() {
        if (!this._profiles) this._profiles = this.buildProfiles();
        return this._profiles;
    }

    static buildProfiles() {
        const profiles = {};
        const directionalBladeWeapons = new Set([
            'great_sword', 'long_sword', 'sword_shield', 'dual_blades',
            'switch_axe', 'charge_blade', 'insect_glaive'
        ]);
        const add = (weaponId, actionIds, motion, durationMs, effect = 'sever', options = {}) => {
            actionIds.forEach(actionId => {
                profiles[`${weaponId}.${actionId}`] = Object.freeze({
                    actionId: `${weaponId}.${actionId}`,
                    weaponId,
                    motion,
                    durationMs,
                    effect,
                    impact: effect !== 'none',
                    animateWeapon: options.animateWeapon !== false,
                    releaseChargePose: options.releaseChargePose === true,
                    trackTarget: options.trackTarget === true
                        || (directionalBladeWeapons.has(weaponId)
                            && ['sever', 'multi', 'counter'].includes(effect)),
                    transformOrigin: options.transformOrigin || (weaponId === 'long_sword'
                        ? '82% 18%'
                        : (weaponId === 'great_sword' ? '50% 88%' : '50% 50%')),
                    kinsect: options.kinsect || 'none',
                    source: 'capcom-controls+wilds-action-class'
                });
            });
        };

        const atbConfig = typeof HuntAtbConfig !== 'undefined'
            ? HuntAtbConfig
            : require('./HuntAtbConfig.js');
        const chargeStageVisualMs = atbConfig.STANDARD_CHARGE_VISUAL_MS;
        add('great_sword', ['charge_1', 'strong_charge_1', 'true_charge_1'], 'great_sword_charge_raise', chargeStageVisualMs, 'none');
        add('great_sword', ['charge_2', 'charge_3', 'strong_charge_2', 'strong_charge_3', 'true_charge_2', 'true_charge_3'], 'great_sword_charge_hold', chargeStageVisualMs, 'none');
        add('great_sword', ['charged_slash'], 'great_sword_charged_release', 920, 'sever', {
            releaseChargePose: true, trackTarget: true
        });
        add('great_sword', ['strong_charged_slash'], 'great_sword_charged_release', 1020, 'sever', {
            releaseChargePose: true, trackTarget: true
        });
        // 참모아는 21틱 BEAT 전체를 사용한다. 시각 모션을 더 짧게 끝내면
        // 첫 HIT가 이미 다음 회전에 들어간 뒤 발생해 "때리고 허공에서 돈다".
        add('great_sword', ['true_charged_slash'], 'great_sword_true_release', 2100, 'sever', {
            releaseChargePose: true, trackTarget: true
        });
        add('great_sword', ['tackle'], 'shoulder_tackle', 480, 'counter');
        add('great_sword', ['wide_slash'], 'horizontal_slash', 620, 'sever');
        add('great_sword', ['side_blow'], 'quick_chop', 430, 'blunt');
        add('great_sword', ['kick'], 'shoulder_tackle', 390, 'blunt');

        add('long_sword', ['overhead_slash'], 'ls_overhead_slash', 560);
        add('long_sword', ['thrust'], 'ls_thrust', 430);
        add('long_sword', ['rising_slash'], 'ls_rising_slash', 520);
        add('long_sword', ['spirit_slash_1'], 'ls_spirit_slash_1', 590);
        add('long_sword', ['spirit_slash_2'], 'ls_spirit_slash_2', 590);
        add('long_sword', ['spirit_slash_3'], 'ls_spirit_slash_3', 680);
        add('long_sword', ['spirit_roundslash'], 'ls_roundslash', 720);
        add('long_sword', ['helm_breaker'], 'ls_helm_breaker', 980, 'multi');
        add('long_sword', ['spirit_release_slash'], 'ls_spirit_release_slash', 1080, 'multi');
        add('long_sword', ['foresight'], 'ls_foresight_slash', 720, 'counter');
        add('long_sword', ['special_sheathe'], 'ls_special_sheathe', 640, 'none');
        add('long_sword', ['iai_counter_fail'], 'ls_iai_counter_fail', 520, 'none');
        add('long_sword', ['iai_counter_success'], 'ls_iai_counter_success', 820, 'counter');

        add('sword_shield', ['chop'], 'quick_chop', 360);
        add('sword_shield', ['lateral_slash'], 'horizontal_slash', 390);
        add('sword_shield', ['return_stroke'], 'return_stroke', 390);
        add('sword_shield', ['spinning_rising_slash'], 'spinning_rising', 460);
        add('sword_shield', ['spinning_reaper'], 'spinning_reaper', 510);
        add('sword_shield', ['charged_chop'], 'charged_chop', 720, 'sever');
        add('sword_shield', ['shield_bash_1', 'shield_bash_2'], 'shield_bash', 380, 'blunt');
        add('sword_shield', ['shield_bash_3'], 'shield_bash_finish', 480, 'blunt');
        add('sword_shield', ['guard_slash', 'perfect_guard'], 'guard_ready', 460, 'none');
        add('sword_shield', ['backstep'], 'backstep', 420, 'none');
        add('sword_shield', ['perfect_rush_1', 'perfect_rush_2'], 'perfect_rush', 570, 'multi');
        add('sword_shield', ['perfect_rush_finisher'], 'rush_finisher', 700);
        add('sword_shield', ['charged_slash'], 'sns_charged_slash', 660);
        add('sword_shield', ['jumping_slash'], 'jumping_slash', 700);
        add('sword_shield', ['falling_bash'], 'falling_bash', 800, 'blunt');
        add('sword_shield', ['plunging_thrust'], 'plunging_thrust', 820, 'multi');
        add('sword_shield', ['counter_slash'], 'counter_slash', 620, 'counter');

        add('dual_blades', ['enter_demon'], 'demon_mode', 520, 'none');
        add('dual_blades', ['exit_demon'], 'demon_mode', 420, 'none');
        add('dual_blades', ['double_slash', 'double_slash_return'], 'dual_cross', 390, 'multi');
        add('dual_blades', ['circle_slash'], 'dual_roundslash', 470, 'multi');
        add('dual_blades', ['demon_fang'], 'dual_lunge', 410, 'multi');
        add('dual_blades', ['demon_double_slash', 'demon_flurry'], 'dual_flurry', 560, 'multi');
        add('dual_blades', ['demon_roundslash'], 'dual_roundslash', 540, 'multi');
        add('dual_blades', ['blade_dance_1'], 'blade_dance_open', 620, 'multi');
        add('dual_blades', ['blade_dance_2'], 'blade_dance_drive', 760, 'multi');
        add('dual_blades', ['blade_dance'], 'blade_dance', 940, 'multi');
        add('dual_blades', ['archdemon_rush'], 'dual_lunge', 480, 'multi');
        add('dual_blades', ['archdemon_flurry'], 'dual_flurry', 580, 'multi');
        add('dual_blades', ['archdemon_slash'], 'archdemon_slash', 650, 'multi');

        add('hammer', ['charge_1'], 'hammer_charge_raise', chargeStageVisualMs, 'none');
        add('hammer', ['charge_2', 'charge_3', 'mighty_charge'], 'hammer_charge_hold', chargeStageVisualMs, 'none');
        add('hammer', ['release_1'], 'hammer_charged_side_swing', 520, 'blunt', {
            releaseChargePose: true, trackTarget: true
        });
        add('hammer', ['release_2'], 'hammer_charged_uppercut', 650, 'blunt', {
            releaseChargePose: true, trackTarget: true
        });
        add('hammer', ['release_3'], 'hammer_charged_spin_slam', 890, 'blunt', {
            releaseChargePose: true, trackTarget: true
        });
        add('hammer', ['mighty_charge_slam'], 'hammer_charged_mighty_slam', 1080, 'blunt', {
            releaseChargePose: true, trackTarget: true
        });
        add('hammer', ['overhead_1', 'overhead_2'], 'hammer_overhead_chain', 580, 'blunt');
        add('hammer', ['upswing'], 'hammer_uppercut', 720, 'blunt');
        add('hammer', ['big_bang_1', 'big_bang_2', 'big_bang_3', 'big_bang_4'], 'hammer_big_bang', 580, 'blunt');
        add('hammer', ['big_bang_finisher'], 'hammer_big_bang_finish', 1040, 'blunt');
        add('hammer', ['spinning_start', 'spinning_mid'], 'hammer_spin_chain', 720, 'blunt');
        add('hammer', ['spinning_finish'], 'hammer_side_swing', 570, 'blunt');
        add('hammer', ['spinning_upswing'], 'hammer_uppercut', 760, 'blunt');
        add('hammer', ['offset_stance', 'offset_miss'], 'hammer_offset_ready', 520, 'none');
        add('hammer', ['offset_followup_spinslam'], 'hammer_followup_spinslam', 1160, 'blunt');
        add('hammer', ['focus_earthquake'], 'hammer_focus_earthquake', 1120, 'blunt');

        add('hunting_horn', ['note_red'], 'horn_left_swing', 590, 'blunt');
        add('hunting_horn', ['note_blue'], 'horn_right_swing', 590, 'blunt');
        add('hunting_horn', ['note_green'], 'horn_back_strike', 670, 'blunt');
        add('hunting_horn', ['recital_start'], 'recital', 520, 'none');
        add('hunting_horn', ['recital_strike'], 'recital_strike', 620, 'blunt');
        add('hunting_horn', ['recital_finish'], 'recital_finish', 540, 'none');
        add('hunting_horn', ['echo_bubble'], 'echo_bubble', 720, 'none');
        add('hunting_horn', ['offset_melody'], 'offset_melody', 760, 'counter');

        add('lance', ['mid_thrust_1', 'mid_thrust_2'], 'lance_thrust', 450);
        add('lance', ['high_thrust_3'], 'lance_high_thrust', 520);
        add('lance', ['counter_stance'], 'guard_stance', 560, 'none');
        add('lance', ['counter_thrust'], 'counter_thrust', 660, 'counter');
        add('lance', ['power_guard_1', 'power_guard_2', 'power_guard_3'], 'power_guard', 520, 'none');
        add('lance', ['payback_thrust'], 'payback_thrust', 760, 'counter');
        add('lance', ['guard_dash'], 'lance_guard_dash', 500, 'none');
        add('lance', ['leaping_thrust'], 'lance_leaping_thrust', 700);
        add('lance', ['dash_start', 'dash_attack'], 'lance_dash', 720, 'multi');
        add('lance', ['finishing_twin_thrust'], 'lance_dash_finish', 860, 'multi');

        add('gunlance', ['rising_slash'], 'rising_slash', 560);
        add('gunlance', ['guard_thrust', 'lateral_thrust'], 'lance_thrust', 440);
        add('gunlance', ['slam'], 'heavy_overhead', 690, 'blunt');
        add('gunlance', ['full_burst'], 'full_burst', 820, 'explosive');
        add('gunlance', ['sweep'], 'gunlance_sweep', 650);
        add('gunlance', ['wyrmstake_attach'], 'wyrmstake_attach', 680, 'sever');
        add('gunlance', ['wyrmstake_detonate', 'shell_wyrmstake'], 'wyrmstake', 870, 'explosive');
        add('gunlance', ['shell_1', 'shell_2'], 'gunlance_shell', 480, 'explosive');
        add('gunlance', ['wyrmstake_full_blast'], 'wyrmstake_full_blast', 1080, 'explosive');
        add('gunlance', ['wyvern_fire_charge'], 'wyvern_fire_charge', 880, 'none');
        add('gunlance', ['wyvern_fire'], 'wyvern_fire', 1180, 'explosive');
        add('gunlance', ['quick_reload'], 'reload', 560, 'none');

        add('switch_axe', ['axe_overhead_slash'], 'overhead_slash', 620);
        add('switch_axe', ['axe_wild_swing'], 'wild_swing', 780, 'multi');
        add('switch_axe', ['axe_heavy_slam'], 'heavy_overhead', 820);
        add('switch_axe', ['morph_to_sword', 'morph_to_axe'], 'morph', 590, 'none');
        add('switch_axe', ['sword_rising_slash'], 'rising_slash', 510);
        add('switch_axe', ['sword_double_slash'], 'double_slash', 590, 'multi');
        add('switch_axe', ['sword_heavenward_flurry'], 'heavenward_flurry', 760, 'multi');
        add('switch_axe', ['sword_counter_stance', 'sword_counter_miss'], 'switch_counter_ready', 620, 'none');
        add('switch_axe', ['sword_counter_rising'], 'counter_slash', 820, 'counter');
        add('switch_axe', ['unbridled_slash'], 'full_release', 980, 'explosive');
        add('switch_axe', ['zero_sum_discharge'], 'attached_discharge', 1160, 'explosive');
        add('switch_axe', ['full_release_slash'], 'full_release', 1050, 'explosive');

        add('charge_blade', ['sword_slash'], 'quick_chop', 430);
        add('charge_blade', ['sword_return_stroke'], 'return_stroke', 420);
        add('charge_blade', ['shield_thrust'], 'lance_thrust', 440, 'blunt');
        add('charge_blade', ['charged_double_slash'], 'double_slash', 660, 'multi');
        add('charge_blade', ['load_phials'], 'load_phials', 570, 'none');
        add('charge_blade', ['charge_shield', 'refresh_shield'], 'charge_shield', 700, 'none');
        add('charge_blade', ['guard_point'], 'guard_ready', 520, 'none');
        add('charge_blade', ['morph_axe', 'morph_sword'], 'morph', 610, 'none');
        add('charge_blade', ['axe_overhead'], 'heavy_overhead', 690);
        add('charge_blade', ['element_discharge_1', 'element_discharge_2'], 'element_discharge', 790, 'explosive');
        add('charge_blade', ['aed'], 'element_discharge', 900, 'explosive');
        add('charge_blade', ['saed'], 'saed', 1160, 'explosive');
        add('charge_blade', ['savage_axe'], 'savage_axe', 850, 'multi');

        add('insect_glaive', ['extract_red', 'extract_white', 'extract_orange'], 'kinsect_command', 1120, 'none', { animateWeapon: false, kinsect: 'extract' });
        add('insect_glaive', ['rising_slash'], 'glaive_rising', 1440, 'multi', { kinsect: 'assault' });
        add('insect_glaive', ['tornado_slash'], 'glaive_tornado', 1920, 'multi', { kinsect: 'assault' });
        add('insect_glaive', ['descending_thrust'], 'descending_thrust', 2400, 'multi', { kinsect: 'assault' });
        add('insect_glaive', ['descending_charge_1', 'descending_charge_2'], 'glaive_charge', 800, 'none', { kinsect: 'none' });
        add('insect_glaive', ['strong_descending_slash'], 'descending_thrust', 2720, 'multi', { kinsect: 'assault' });
        add('insect_glaive', ['rising_spiral_slash'], 'glaive_tornado', 3040, 'multi', { kinsect: 'assault' });
        add('insect_glaive', ['focus_thrust'], 'descending_thrust', 2400, 'multi', { kinsect: 'extract' });

        add('light_bowgun', ['normal_shot'], 'light_recoil', 460, 'projectile');
        add('light_bowgun', ['pierce_shot'], 'rapid_recoil', 560, 'projectile');
        add('light_bowgun', ['chaser'], 'chaser_shot', 650, 'explosive');
        add('light_bowgun', ['enter_rapid', 'exit_rapid'], 'reload', 440, 'none');
        add('light_bowgun', ['rapid_burst'], 'rapid_recoil', 620, 'projectile');
        add('light_bowgun', ['burst_step'], 'light_recoil', 540, 'projectile');
        add('light_bowgun', ['wyvernblast_plant'], 'reload', 560, 'none');
        add('light_bowgun', ['wyvernblast_detonate'], 'chaser_shot', 760, 'explosive');
        add('light_bowgun', ['reload'], 'reload', 570, 'none');

        add('heavy_bowgun', ['pierce'], 'heavy_recoil', 660, 'projectile');
        add('heavy_bowgun', ['spread'], 'spread_recoil', 700, 'projectile');
        add('heavy_bowgun', ['enter_ignition', 'exit_ignition'], 'heavy_reload', 520, 'none');
        add('heavy_bowgun', ['wyvernheart_1', 'wyvernheart_2', 'wyvernheart_3'], 'ignition_burst', 900, 'multi');
        add('heavy_bowgun', ['wyverncounter_stance', 'wyverncounter_miss'], 'heavy_reload', 620, 'none');
        add('heavy_bowgun', ['wyverncounter_shot'], 'ignition_burst', 850, 'explosive');
        add('heavy_bowgun', ['focus_blast'], 'wyvernsnipe', 1120, 'explosive');
        add('heavy_bowgun', ['reload'], 'heavy_reload', 720, 'none');

        add('bow', ['draw_1', 'draw_2', 'draw_3'], 'bow_draw', 480, 'none');
        add('bow', ['charging_sidestep'], 'bow_draw', 520, 'none');
        add('bow', ['charged_shot'], 'bow_release', 590, 'projectile');
        add('bow', ['power_shot'], 'bow_power_shot', 620, 'projectile');
        add('bow', ['power_volley'], 'bow_volley', 760, 'multi');
        add('bow', ['tracer_arrow'], 'tracer_arrow', 680, 'projectile');
        add('bow', ['arc_shot'], 'bow_volley', 720, 'projectile');
        add('bow', ['focus_fire'], 'bow_volley', 840, 'explosive');
        add('bow', ['tracer_dragon_piercer'], 'dragon_piercer', 1140, 'projectile');
        add('bow', ['recover_stamina'], 'bow_draw', 620, 'none');

        return Object.freeze(profiles);
    }

    static resolve(weaponId, actionOrName) {
        const rawId = typeof actionOrName === 'object' ? actionOrName?.id : '';
        const actionId = rawId && rawId.includes('.') ? rawId : (rawId ? `${weaponId}.${rawId}` : '');
        const exact = this.PROFILES[actionId];
        if (exact) return exact;
        return Object.freeze({
            actionId: actionId || `${weaponId || 'unknown'}.legacy`,
            motion: this.fallbackMotionFor(weaponId), durationMs: 600, effect: 'sever', impact: true,
            animateWeapon: true, kinsect: weaponId === 'insect_glaive' ? 'assault' : 'none',
            source: 'legacy-fallback', fallback: true
        });
    }

    static fallbackMotionFor(weaponId) {
        if (['light_bowgun', 'heavy_bowgun'].includes(weaponId)) return 'heavy_recoil';
        if (weaponId === 'bow') return 'bow_release';
        if (['hammer', 'hunting_horn'].includes(weaponId)) return 'hammer_side_swing';
        if (['lance', 'gunlance'].includes(weaponId)) return 'lance_thrust';
        return 'horizontal_slash';
    }

    static get MOTIONS() {
        if (this._motions) return this._motions;
        // [offset, target-x ratio, target-y ratio, rotation, scale, x nudge, y nudge]
        const idle = [0, 0, 0, 0, 1, 0, 0];
        const end = [1, 0, 0, 0, 1, 0, 0];
        const motions = {
            charge: [idle, [.3, 0, 0, -12, .92, -10, 10], [.7, 0, 0, -7, 1.12, -5, 5], end],
            great_sword_charge_raise: [idle, [.42, 0, 0, 74, .98, -28, -22], [.76, 0, 0, 120, 1.04, -45, -48], [1, 0, 0, 135, 1.06, -50, -55]],
            great_sword_charge_hold: [[0, 0, 0, 135, 1.06, -50, -55], [.42, 0, 0, 139, 1.1, -54, -59], [.72, 0, 0, 132, 1.04, -46, -51], [1, 0, 0, 135, 1.07, -50, -55]],
            // The source stands vertically: blade edge left, grip at the bottom.
            // Great Sword receives its bitmap-axis correction in keyframes();
            // these authored rotations describe the swing relative to that base.
            // Positive rotation carries the edge down through the target;
            // slots 3/4 receive the exact mirrored path.
            great_sword_charged_release: [[0, 0, 0, 135, 1.07, -50, -55], [.2, 0, 0, 120, 1.1, -60, -68], [.46, .72, .75, 185, 1.13, -12, -88], [.72, 1, 1, 270, 1.2, 0, 0], [.86, .9, .9, 285, 1.12, 0, 7], [1, 0, 0, 270, 1, 0, 0]],
            // Complete the first forward roll before the planted-blade contact.
            // The rebound then continues through a second full turn into the
            // heavy hit; neither turn may begin after its damage event.
            great_sword_true_release: [[0, 0, 0, 135, 1.1, -54, -60], [.08, 0, 0, 118, 1.14, -65, -74], [.17, .34, .38, 245, 1.16, -18, -94], [.25, .72, .76, 405, 1.2, -8, -74], [6 / 21, 1, 1, 495, 1.24, 0, 0], [.43, 1, 1, 495, 1.12, 0, 18], [.55, .42, .46, 585, 1.2, -8, -30], [.7, .78, .82, 735, 1.24, 0, -108], [18 / 21, 1, 1, 855, 1.34, 0, 0], [.93, .9, .9, 870, 1.18, 0, 8], [1, 0, 0, 855, 1, 0, 0]],
            heavy_overhead: [idle, [.3, 0, 0, -92, 1.04, -26, 18], [.52, .18, .18, -42, 1.08, 0, 0], [.76, 1, 1, 38, 1.15, 0, 0], end],
            true_charged_slash: [idle, [.24, 0, 0, -115, 1.08, -34, 22], [.48, .14, .12, -78, 1.14, 0, 0], [.68, 1, 1, 48, 1.28, 0, 0], [.82, .88, .84, 56, 1.18, 0, 0], end],
            shoulder_tackle: [idle, [.25, 0, 0, -8, .96, -18, 5], [.62, .65, .58, 9, 1.13, 0, 0], end],
            overhead_slash: [idle, [.3, 0, 0, -76, 1.02, -18, 12], [.7, 1, 1, 34, 1.08, 0, 0], end],
            quick_chop: [idle, [.25, 0, 0, -48, .98, -12, 7], [.65, .82, .82, 28, 1.06, 0, 0], end],
            horizontal_slash: [idle, [.28, 0, 0, -58, 1, -28, -2], [.68, 1, 1, 76, 1.08, 0, 0], end],
            rising_slash: [idle, [.25, 0, 0, 54, .98, -22, 30], [.7, 1, 1, -62, 1.09, 0, 0], end],
            thrust: [idle, [.3, 0, 0, -5, .97, -20, 2], [.7, 1, 1, 3, 1.1, 0, 0], end],
            // The Long Sword source image is asymmetric: the grip is at the
            // upper-right and the blade extends diagonally away from it. Every
            // motion pivots from that grip so the blade, never the handle, traces
            // the contact arc through the monster.
            ls_overhead_slash: [[0, 0, 0, -92, 1, -18, 8], [.28, 0, 0, -116, 1.03, -24, -2], [.68, .88, .9, 38, 1.1, 0, 0], [.82, 1, 1, 48, 1.06, 0, 3], end],
            ls_thrust: [[0, 0, 0, -42, .98, -18, 7], [.32, 0, 0, -48, .95, -28, 10], [.7, .92, .94, -45, 1.12, 0, 0], [.82, .72, .76, -42, 1.04, 0, 1], end],
            ls_rising_slash: [[0, 0, 0, 68, .98, -24, 28], [.28, 0, 0, 82, .96, -32, 34], [.7, .9, .94, -58, 1.11, 0, -5], [.82, 1, 1, -70, 1.07, 0, -10], end],
            ls_spirit_slash_1: [[0, 0, 0, -88, 1, -22, 5], [.26, 0, 0, -108, 1.02, -30, 2], [.68, .92, .94, 48, 1.12, 0, 0], end],
            ls_spirit_slash_2: [[0, 0, 0, 76, 1, -24, 14], [.26, 0, 0, 94, 1.02, -32, 20], [.68, .94, .96, -62, 1.13, 0, -3], end],
            ls_spirit_slash_3: [[0, 0, 0, -112, 1.02, -34, 5], [.24, 0, 0, -128, 1.06, -42, -2], [.5, .58, .66, 66, 1.12, 0, 0], [.76, 1, 1, -48, 1.16, 0, -4], end],
            ls_roundslash: [[0, 0, 0, -72, 1, -26, 4], [.24, 0, 0, -96, 1.03, -34, 0], [.62, 1, 1, 258, 1.14, 0, 0], [.82, .82, .86, 342, 1.08, 0, 2], [1, 0, 0, 360, 1, 0, 0]],
            ls_helm_breaker: [[0, 0, 0, -38, 1, 0, 0], [.24, .25, .82, -54, 1.04, 0, -78], [.48, .62, .96, -62, 1.1, 0, -112], [.7, 1, 1, 92, 1.2, 0, 30], [.84, .9, .92, 108, 1.08, 0, 10], end],
            ls_foresight_slash: [[0, 0, 0, -28, .96, -18, 8], [.26, -.18, -.08, -74, .9, -64, 22], [.48, -.12, -.05, -98, .94, -72, 18], [.76, .92, .94, 62, 1.15, 0, 0], end],
            ls_special_sheathe: [[0, 0, 0, 8, 1, 0, 0], [.32, 0, 0, 42, .94, -38, 16], [.64, 0, 0, 102, .88, -58, 22], [.84, 0, 0, 108, .9, -56, 18], end],
            ls_iai_counter_fail: [[0, 0, 0, 108, .9, -56, 18], [.42, 0, 0, 112, .88, -62, 22], [.74, 0, 0, 30, .9, -22, 12], end],
            ls_iai_counter_success: [[0, 0, 0, 108, .9, -56, 18], [.26, 0, 0, 122, .86, -68, 22], [.54, 1, 1, -76, 1.24, 0, 0], [.72, .74, .78, -92, .98, 0, 4], end],
            ls_spirit_release_slash: [[0, 0, 0, -62, .96, -24, 10], [.18, 0, 0, -94, 1, -32, 5], [.4, .34, .2, 78, 1.14, 0, 0], [.6, 1, 1, -112, 1.27, 0, 0], [.8, .84, .88, 54, 1.12, 0, 4], [.92, 1, 1, -48, 1.08, 0, 0], end],
            lance_thrust: [idle, [.24, 0, 0, 0, .98, -16, 4], [.62, 1, 1, 0, 1.13, 0, 0], [.78, .72, .72, 0, 1.05, 0, 0], end],
            lance_high_thrust: [idle, [.25, 0, 0, 18, .98, -14, 12], [.65, 1, 1, -24, 1.13, 0, -32], end],
            spirit_chain: [idle, [.22, 0, 0, -52, 1, -24, 6], [.5, .65, .72, 58, 1.06, 0, 0], [.72, .38, .62, -34, 1.08, 0, 0], end],
            spirit_chain_finish: [idle, [.22, 0, 0, -72, 1.02, -32, 8], [.48, .48, .62, 82, 1.1, 0, 0], [.7, 1, 1, -48, 1.14, 0, 0], end],
            roundslash: [idle, [.25, 0, 0, -58, 1, -20, 2], [.68, 1, 1, 300, 1.1, 0, 0], [1, 0, 0, 360, 1, 0, 0]],
            helm_breaker: [idle, [.25, .28, .88, -18, 1.03, 0, -75], [.48, .68, .95, -25, 1.08, 0, -100], [.72, 1, 1, 84, 1.18, 0, 25], end],
            counter_slash: [idle, [.28, 0, 0, -25, .92, -54, 24], [.48, 0, 0, -70, .96, -62, 20], [.76, 1, 1, 86, 1.13, 0, 0], end],
            special_sheathe: [idle, [.32, 0, 0, 18, .94, -42, 16], [.64, 0, 0, 82, .9, -58, 20], [.82, 0, 0, 88, .92, -55, 18], end],
            iai_counter_fail: [idle, [.4, 0, 0, 88, .92, -55, 18], [.72, 0, 0, 25, .9, -20, 12], end],
            iai_counter_success: [[0, 0, 0, 88, .92, -55, 18], [.28, 0, 0, 96, .88, -65, 22], [.54, 1, 1, -74, 1.22, 0, 0], [.7, .72, .76, -86, .96, 0, 4], end],
            spirit_release_slash: [idle, [.18, 0, 0, -48, .95, 0, 12], [.42, .32, .15, 92, 1.14, 0, 0], [.62, 1, 1, -118, 1.25, 0, 0], [.82, .82, .86, -42, 1.02, 0, 5], end],
            backstep: [idle, [.45, 0, 0, -12, .92, -62, 32], [.72, 0, 0, -18, .94, -70, 34], end],
            return_stroke: [idle, [.28, 0, 0, 48, .98, -22, 6], [.66, 1, 1, -62, 1.08, 0, 0], end],
            spinning_rising: [idle, [.22, 0, 0, -72, .98, -18, 20], [.58, .7, .72, 118, 1.1, 0, -12], [.8, 1, 1, 190, 1.04, 0, 0], end],
            spinning_reaper: [idle, [.2, 0, 0, -65, 1, -18, 4], [.58, 1, 1, 250, 1.13, 0, 0], [.82, .78, .8, 310, 1.05, 0, 0], end],
            charged_chop: [idle, [.3, 0, 0, 42, .92, -22, 24], [.55, 0, 0, 58, .96, -18, 28], [.76, 1, 1, -80, 1.18, 0, 0], end],
            shield_bash: [idle, [.28, 0, 0, 18, 1.04, -28, 0], [.64, 1, 1, -16, 1.12, 0, 0], end],
            shield_bash_finish: [idle, [.2, 0, 0, 26, 1.04, -28, 0], [.52, .7, .72, -44, 1.14, 0, 0], [.72, 1, 1, 20, 1.16, 0, 0], end],
            guard_ready: [idle, [.38, 0, 0, 4, .92, -18, 0], [.72, 0, 0, 2, .94, -22, 0], end],
            perfect_rush: [idle, [.2, .32, .36, 42, 1.04, 0, 0], [.42, .62, .66, -48, 1.07, 0, 0], [.66, 1, 1, 55, 1.1, 0, 0], [.82, .78, .76, -22, 1.04, 0, 0], end],
            rush_finisher: [idle, [.22, 0, 0, -65, .96, -28, 10], [.66, 1, 1, 52, 1.18, 0, 0], [.8, 1.08, 1.04, 60, 1.12, 0, 0], end],
            sns_charged_slash: [idle, [.25, 0, 0, 38, .94, -22, 22], [.56, .4, .55, -58, 1.1, 0, -38], [.78, 1, 1, -42, 1.12, 0, -56], end],
            jumping_slash: [idle, [.3, .35, .7, -26, 1.06, 0, -48], [.62, 1, 1, 62, 1.15, 0, 4], end],
            falling_bash: [idle, [.24, .2, .75, 12, 1.06, 0, -58], [.56, .62, .95, 128, 1.14, 0, 14], [.76, 1, 1, 172, 1.18, 0, 0], end],
            plunging_thrust: [idle, [.28, .3, .8, 0, 1.06, 0, -62], [.58, .7, 1, -2, 1.16, 0, 12], [.8, 1, 1, 0, 1.1, 0, 0], end],
            counter_slash: [idle, [.2, 0, 0, 10, .96, -18, 0], [.5, 1, 1, -76, 1.16, 0, 0], [.74, .82, .86, -20, 1.04, 0, 0], end],
            split_shield_brace: [idle, [.3, 0, 0, -5, 1.02, 8, 2], [.72, 0, 0, 3, 1.06, 12, 0], end],
            split_shield_guard: [idle, [.24, 0, 0, -20, 1.08, -12, -4], [.62, 0, 0, -28, 1.16, -20, -6], [.84, 0, 0, -20, 1.1, -14, -3], end],
            split_shield_bash: [idle, [.22, 0, 0, -18, 1.04, -20, 2], [.58, .72, .68, 16, 1.2, 0, 0], [.78, .35, .32, -8, 1.08, 8, 2], end],
            split_shield_dash: [idle, [.2, 0, 0, -12, 1.08, -16, 0], [.56, .48, .42, 8, 1.18, 0, 0], [.8, .25, .22, -5, 1.1, 4, 0], end],
            split_shield_recoil: [idle, [.26, 0, 0, -10, 1.08, 10, 2], [.52, 0, 0, 14, .92, 24, 8], [.78, 0, 0, -4, 1.06, 8, 1], end],
            demon_mode: [idle, [.3, 0, 0, -14, .92, 0, 0], [.58, 0, 0, 10, 1.18, 0, -12], [.78, 0, 0, -6, 1.1, 0, -4], end],
            dual_cross: [idle, [.2, .38, .42, 52, 1.04, -10, 0], [.42, .65, .7, -58, 1.08, 12, 0], [.68, 1, 1, 66, 1.12, 0, 0], [.84, .76, .8, -32, 1.04, 0, 0], end],
            dual_roundslash: [idle, [.18, .2, .3, -72, 1.02, -12, 3], [.44, .62, .68, 150, 1.08, 8, 0], [.7, 1, 1, 330, 1.14, 0, 0], [.86, .8, .82, 410, 1.06, 0, 0], [1, 0, 0, 360, 1, 0, 0]],
            dual_lunge: [idle, [.24, 0, 0, -30, .96, -20, 7], [.56, .78, .82, 48, 1.08, 0, 0], [.75, 1, 1, -34, 1.1, 0, 0], end],
            dual_flurry: [idle, [.18, .34, .4, 55, 1.04, 0, 0], [.38, .6, .64, -62, 1.07, 0, 0], [.58, .84, .88, 72, 1.1, 0, 0], [.76, 1, 1, -68, 1.1, 0, 0], end],
            blade_dance_open: [idle, [.16, .2, .28, 72, 1.02, 0, 0], [.38, .48, .58, -110, 1.07, 0, 0], [.64, .82, .86, 170, 1.1, 0, 0], [.82, 1, 1, -185, 1.13, 0, 0], end],
            blade_dance_drive: [idle, [.14, .18, .24, -85, 1.02, 0, 0], [.32, .4, .5, 125, 1.07, 0, 0], [.5, .64, .7, -210, 1.1, 0, 0], [.7, .9, .94, 315, 1.13, 0, 0], [.86, 1, 1, -390, 1.14, 0, 0], end],
            blade_dance: [idle, [.18, .25, .35, 120, 1.03, 0, 0], [.42, .62, .72, 320, 1.08, 0, 0], [.7, 1, 1, 620, 1.14, 0, 0], [.86, .84, .82, 720, 1.08, 0, 0], [1, 0, 0, 720, 1, 0, 0]],
            archdemon_slash: [idle, [.25, 0, 0, -70, .98, -20, 8], [.6, 1, 1, 210, 1.13, 0, 0], [.8, .84, .82, 310, 1.08, 0, 0], [1, 0, 0, 360, 1, 0, 0]],
            hammer_charge_raise: [idle, [.28, 0, 0, -36, .92, -13, 12], [.62, 0, 0, -68, 1.08, -20, 1], [.82, 0, 0, -82, 1.1, -24, -7], [1, 0, 0, -78, 1.08, -22, -6]],
            hammer_charge_hold: [[0, 0, 0, -78, 1.08, -22, -6], [.38, 0, 0, -83, 1.1, -24, -8], [.72, 0, 0, -74, 1.05, -20, -4], [1, 0, 0, -78, 1.08, -22, -6]],
            hammer_overhead_chain: [idle, [.24, 0, 0, -108, 1.05, -28, 18], [.6, .72, .78, -35, 1.12, 0, -4], [.76, 1, 1, 44, 1.18, 0, 0], end],
            hammer_big_bang: [idle, [.22, 0, 0, -88, 1.03, -24, 12], [.56, .3, .36, -48, 1.12, 0, -8], [.7, 1, 1, 38, 1.2, 0, 2], [.86, .72, .74, 30, 1.07, 0, 5], end],
            hammer_big_bang_finish: [idle, [.18, 0, 0, -112, 1.08, -34, 10], [.42, .34, .38, -55, 1.18, 0, -12], [.58, 1, 1, 55, 1.3, 0, 0], [.72, .82, .88, -36, 1.2, 0, -6], [.86, 1, 1, 64, 1.28, 0, 3], end],
            hammer_spin_chain: [idle, [.18, .16, .2, -55, 1.05, -12, 5], [.42, .55, .62, 75, 1.14, 0, 0], [.66, .86, .88, 230, 1.17, 0, 0], [.84, 1, 1, 390, 1.2, 0, 0], end],
            hammer_offset_ready: [idle, [.3, 0, 0, 62, .94, -30, 20], [.64, 0, 0, 78, 1.02, -38, 12], [.88, 0, 0, 66, .98, -34, 16], end],
            hammer_followup_spinslam: [idle, [.15, .12, .18, -45, 1.08, 0, -8], [.34, .5, .58, 125, 1.18, 0, -18], [.54, .78, .86, 310, 1.24, 0, -8], [.72, 1, 1, 480, 1.32, 0, 2], [.88, .82, .88, 545, 1.2, 0, 8], end],
            hammer_focus_earthquake: [idle, [.16, .12, .18, 48, 1.04, 0, -3], [.38, .58, .62, 190, 1.15, 0, -20], [.58, .88, .92, 365, 1.22, 0, -4], [.72, 1, 1, 445, 1.3, 0, 5], [.84, .9, .92, 520, 1.22, 0, 0], end],
            hammer_side_swing: [idle, [.3, 0, 0, -72, 1, -32, 4], [.7, 1, 1, 88, 1.16, 0, 0], end],
            hammer_uppercut: [idle, [.28, 0, 0, 62, .96, -28, 34], [.72, 1, 1, -76, 1.2, 0, -22], end],
            hammer_spin_slam: [idle, [.2, 0, 0, -70, 1, -18, 10], [.58, .68, .7, 300, 1.12, 0, 0], [.78, 1, 1, 410, 1.22, 0, 0], [1, 0, 0, 360, 1, 0, 0]],
            hammer_mighty_slam: [idle, [.28, 0, 0, -118, 1.08, -36, 26], [.52, .12, .14, -88, 1.16, 0, 0], [.72, 1, 1, 62, 1.34, 0, 0], [.84, .92, .86, 66, 1.2, 0, 0], end],
            hammer_charged_side_swing: [[0, 0, 0, -78, 1.08, -22, -6], [.24, 0, 0, -104, 1.12, -34, -12], [.7, 1, 1, 88, 1.18, 0, 0], end],
            hammer_charged_uppercut: [[0, 0, 0, -78, 1.08, -22, -6], [.24, 0, 0, -42, .98, -30, 18], [.72, 1, 1, -76, 1.22, 0, -22], end],
            hammer_charged_spin_slam: [[0, 0, 0, -78, 1.08, -22, -6], [.18, 0, 0, -112, 1.12, -30, -8], [.56, .68, .7, 300, 1.16, 0, 0], [.78, 1, 1, 410, 1.24, 0, 0], [1, 0, 0, 360, 1, 0, 0]],
            hammer_charged_mighty_slam: [[0, 0, 0, -82, 1.12, -25, -8], [.26, 0, 0, -126, 1.16, -40, -22], [.5, .12, .14, -92, 1.2, 0, 0], [.72, 1, 1, 62, 1.36, 0, 0], [.84, .92, .86, 66, 1.22, 0, 0], end],
            horn_left_swing: [idle, [.3, 0, 0, -74, 1, -36, 4], [.72, 1, 1, 80, 1.15, 0, 0], end],
            horn_right_swing: [idle, [.3, 0, 0, 74, 1, 36, 4], [.72, 1, 1, -80, 1.15, 0, 0], end],
            horn_back_strike: [idle, [.34, 0, 0, -105, .98, -54, 12], [.72, .88, .9, 135, 1.18, 0, 0], end],
            recital: [idle, [.22, 0, 0, -25, .96, -14, 4], [.46, 0, 0, 22, 1.09, 12, -10], [.7, 0, 0, -16, 1.12, -8, -6], end],
            recital_strike: [idle, [.18, 0, 0, -34, .96, -18, 8], [.48, .62, .68, 78, 1.13, 0, 0], [.7, 1, 1, -48, 1.18, 0, 0], [.84, .78, .8, 20, 1.04, 0, 0], end],
            recital_finish: [idle, [.25, 0, 0, -22, .94, -12, 8], [.55, 0, 0, 28, 1.18, 10, -14], [.78, 0, 0, -8, 1.08, 0, -5], end],
            echo_bubble: [idle, [.28, 0, 0, -18, .94, 0, 8], [.56, 0, 0, 18, 1.18, 0, -22], [.78, 0, 0, -8, 1.1, 0, -10], end],
            offset_melody: [idle, [.28, 0, 0, -52, .92, -46, 20], [.68, 1, 1, 74, 1.2, 0, 0], end],
            guard_stance: [idle, [.35, 0, 0, 8, 1.12, 18, 4], [.72, 0, 0, 8, 1.15, 20, 2], end],
            power_guard: [idle, [.3, 0, 0, 12, 1.14, 20, 10], [.62, 0, 0, 5, 1.24, 14, 16], [.82, 0, 0, 8, 1.18, 18, 8], end],
            counter_thrust: [idle, [.32, 0, 0, 8, 1.12, 20, 5], [.58, 0, 0, -4, .96, -18, 2], [.78, 1, 1, 2, 1.18, 0, 0], end],
            payback_thrust: [idle, [.3, 0, 0, 8, 1.15, 22, 8], [.52, 0, 0, -8, .93, -32, 3], [.74, 1.08, 1.02, 4, 1.24, 0, 0], end],
            lance_guard_dash: [idle, [.25, .18, .2, 5, 1.1, 12, 0], [.65, .62, .7, 2, 1.16, 0, 0], end],
            lance_leaping_thrust: [idle, [.2, .15, .18, -5, 1.04, -20, 4], [.58, 1, 1, 3, 1.2, 0, -8], [.78, .88, .9, -2, 1.12, 0, 2], end],
            lance_dash: [idle, [.2, .22, .25, 0, 1.06, -12, 0], [.48, .62, .68, 1, 1.14, 0, 0], [.72, 1, 1, -2, 1.18, 0, 0], end],
            lance_dash_finish: [idle, [.2, .3, .34, -6, 1.08, -20, 4], [.48, 1, 1, 5, 1.24, 0, -4], [.66, .68, .74, -8, 1.1, -12, 3], [.84, 1.05, 1, 3, 1.25, 0, 0], end],
            full_burst: [idle, [.24, 0, 0, -72, 1, -18, 15], [.5, .9, .9, 38, 1.12, 0, 0], [.64, .72, .72, 30, .96, 0, 0], [.78, .88, .88, 35, 1.12, 0, 0], end],
            gunlance_sweep: [idle, [.22, 0, 0, -72, 1.03, -26, 5], [.62, 1, 1, 115, 1.16, 0, 0], [.82, .82, .86, 155, 1.08, 0, 2], end],
            gunlance_shell: [idle, [.25, 0, 0, -6, 1.05, -18, 3], [.52, .72, .76, 4, 1.18, 0, 0], [.68, 1, 1, 12, 1.22, 0, 0], end],
            wyrmstake_attach: [idle, [.25, 0, 0, -18, 1.02, -20, 3], [.62, 1, 1, 6, 1.16, 0, 0], [.82, .88, .9, 10, 1.1, 0, 0], end],
            wyrmstake_full_blast: [idle, [.18, 0, 0, -82, 1.06, -30, 10], [.42, .45, .5, -35, 1.14, 0, -5], [.62, 1, 1, 22, 1.3, 0, 0], [.8, .86, .9, 35, 1.18, 0, 4], end],
            wyvern_fire_charge: [idle, [.24, 0, 0, -8, .96, -28, 8], [.55, 0, 0, 2, 1.1, -18, 0], [.84, 0, 0, -3, 1.16, -12, -2], end],
            wyrmstake: [idle, [.3, 0, 0, -4, .97, -20, 2], [.58, 1, 1, 2, 1.12, 0, 0], [.74, 1, 1, 2, .94, 0, 0], end],
            wyvern_fire: [idle, [.28, 0, 0, 5, 1.08, 18, 12], [.58, .72, .72, 0, 1.14, 0, 0], [.7, .48, .5, -5, .9, 0, 0], [.8, .72, .72, 3, 1.18, 0, 0], end],
            reload: [idle, [.28, 0, 0, -18, .92, -12, 18], [.55, 0, 0, 16, 1.04, 10, 12], [.76, 0, 0, -5, 1.08, -4, 4], end],
            heavy_reload: [idle, [.25, 0, 0, -24, .9, -18, 22], [.52, 0, 0, 18, 1.08, 16, 18], [.74, 0, 0, -8, 1.12, -8, 8], end],
            wild_swing: [idle, [.2, 0, 0, -78, 1, -34, 4], [.42, .5, .54, 82, 1.08, 0, 0], [.62, .25, .48, -76, 1.08, 0, 0], [.8, 1, 1, 92, 1.14, 0, 0], end],
            morph: [idle, [.28, 0, 0, -35, .9, -8, 6], [.55, 0, 0, 78, 1.18, 8, -7], [.76, 0, 0, 110, 1.08, 4, -3], end],
            double_slash: [idle, [.24, .45, .5, 58, 1.05, 0, 0], [.5, .72, .78, -66, 1.08, 0, 0], [.72, 1, 1, 70, 1.12, 0, 0], end],
            heavenward_flurry: [idle, [.2, .25, .55, -35, 1.03, 0, -40], [.45, .58, .9, 110, 1.09, 0, -55], [.7, 1, 1, 250, 1.15, 0, 0], end],
            attached_discharge: [idle, [.26, 1, 1, 4, 1.12, 0, 0], [.66, 1, 1, 4, 1.2, 0, 0], [.76, .58, .58, -12, .88, 0, 0], [.86, .8, .8, 8, 1.14, 0, 0], end],
            full_release: [idle, [.28, 0, 0, -88, 1.04, -28, 16], [.58, 1, 1, 54, 1.24, 0, 0], [.7, .72, .7, 42, .88, 0, 0], [.82, .94, .92, 58, 1.18, 0, 0], end],
            load_phials: [idle, [.3, 0, 0, -22, .9, -10, 18], [.56, 0, 0, 28, 1.08, 12, 8], [.78, 0, 0, 0, 1.13, 0, -3], end],
            charge_shield: [idle, [.25, 0, 0, 18, 1.08, 15, 8], [.52, 0, 0, 48, 1.22, 5, -10], [.74, 0, 0, 28, 1.15, 10, -4], end],
            element_discharge: [idle, [.26, 0, 0, -72, 1, -24, 12], [.62, 1, 1, 56, 1.18, 0, 0], [.76, .72, .74, 44, .92, 0, 0], end],
            saed: [idle, [.28, 0, 0, -118, 1.08, -38, 25], [.52, .12, .12, -84, 1.16, 0, 0], [.7, 1, 1, 60, 1.32, 0, 0], [.8, .72, .7, 48, .86, 0, 0], [.9, .95, .92, 62, 1.18, 0, 0], end],
            savage_axe: [idle, [.22, 0, 0, -72, 1.02, -24, 10], [.54, .62, .68, 260, 1.15, 0, 0], [.76, 1, 1, 500, 1.2, 0, 0], [1, 0, 0, 540, 1, 0, 0]],
            kinsect_command: [idle, end],
            glaive_rising: [idle, [.24, 0, 0, 56, .96, -20, 28], [.58, .65, .9, -74, 1.1, 0, -40], [.78, 1, 1, 45, 1.14, 0, 0], end],
            glaive_tornado: [idle, [.2, .24, .45, 80, 1.03, 0, -28], [.5, .62, .88, 300, 1.1, 0, -50], [.76, 1, 1, 560, 1.15, 0, 0], [1, 0, 0, 720, 1, 0, 0]],
            descending_thrust: [idle, [.28, .38, 1, -15, 1.05, 0, -110], [.48, .62, 1, -10, 1.1, 0, -125], [.72, 1, 1, 88, 1.22, 0, 30], end],
            light_recoil: [idle, [.3, .32, .35, 0, 1.03, 0, 0], [.48, .18, .2, -5, .94, 0, 0], [.66, .32, .35, 2, 1.06, 0, 0], end],
            rapid_recoil: [idle, [.18, .28, .3, 0, 1.03, 0, 0], [.32, .16, .18, -6, .93, 0, 0], [.48, .3, .32, 2, 1.06, 0, 0], [.62, .17, .2, -5, .94, 0, 0], [.78, .31, .34, 2, 1.06, 0, 0], end],
            chaser_shot: [idle, [.28, .34, .38, 0, 1.05, 0, 0], [.46, .12, .15, -10, .88, 0, 0], [.66, .32, .36, 4, 1.12, 0, 0], end],
            heavy_recoil: [idle, [.34, .28, .32, 0, 1.06, 0, 0], [.52, 0, 0, -13, .86, -34, 18], [.7, .1, .12, 5, 1.12, 0, 0], end],
            spread_recoil: [idle, [.3, .24, .28, 0, 1.08, 0, 0], [.48, 0, 0, -16, .82, -46, 24], [.66, .08, .1, 7, 1.16, 0, 0], end],
            ignition_burst: [idle, [.2, .22, .25, 0, 1.04, 0, 0], [.34, 0, 0, -8, .9, -25, 12], [.5, .24, .27, 3, 1.08, 0, 0], [.64, 0, 0, -10, .88, -30, 16], [.78, .22, .25, 5, 1.1, 0, 0], end],
            wyvernsnipe: [idle, [.28, .16, .18, 0, .96, 0, 0], [.54, .28, .32, 0, 1.12, 0, 0], [.66, 0, 0, -20, .74, -64, 30], [.82, .05, .08, 8, 1.14, 0, 0], end],
            bow_draw: [idle, [.28, 0, 0, -12, .94, -15, 6], [.72, 0, 0, -18, 1.12, -30, 4], [.9, 0, 0, -18, 1.1, -28, 4], end],
            bow_release: [idle, [.28, 0, 0, -18, 1.1, -28, 4], [.48, .22, .25, 2, 1.05, 0, 0], [.62, 0, 0, -8, .92, -12, 8], end],
            bow_power_shot: [idle, [.26, 0, 0, -20, 1.13, -34, 3], [.46, .28, .3, 3, 1.08, 0, 0], [.62, 0, 0, -10, .88, -20, 10], end],
            bow_volley: [idle, [.2, 0, 0, -18, 1.1, -30, 4], [.34, .22, .24, 2, 1.05, 0, 0], [.48, 0, 0, -8, .9, -18, 8], [.62, .26, .28, 3, 1.08, 0, 0], [.76, 0, 0, -10, .88, -22, 10], end],
            tracer_arrow: [idle, [.3, 0, 0, -22, 1.14, -38, 2], [.52, .3, .34, 2, 1.1, 0, 0], [.68, 0, 0, -12, .86, -25, 11], end],
            dragon_piercer: [idle, [.3, 0, 0, -30, 1.18, -48, 12], [.56, 0, 0, -32, 1.24, -55, 8], [.7, .34, .38, 4, 1.15, 0, 0], [.8, 0, 0, -18, .72, -48, 26], end]
        };
        this._motions = Object.freeze(motions);
        return this._motions;
    }

    static shieldMotion(profile = {}) {
        const id = String(profile.actionId || '');
        if (!/^(?:sword_shield|lance|gunlance)\./.test(id)) return null;
        if (/shield_bash|falling_bash/.test(id)) return 'split_shield_bash';
        if (/guard|counter|power_guard|payback/.test(id)) return 'split_shield_guard';
        if (/backstep|dash|leaping/.test(id)) return 'split_shield_dash';
        if (/shell|burst|wyrmstake|wyvern_fire/.test(id)) return 'split_shield_recoil';
        return 'split_shield_brace';
    }

    static keyframes(profile, hunterIndex = 0, targetVector = null) {
        const vectors = [
            { x: 174, y: -150, side: 1 }, { x: 68, y: -184, side: 1 },
            { x: -68, y: -184, side: -1 }, { x: -174, y: -150, side: -1 }
        ];
        const fallbackVector = vectors[Math.max(0, Math.min(3, Number(hunterIndex) || 0))];
        const hasMeasuredTarget = Number.isFinite(targetVector?.x) && Number.isFinite(targetVector?.y);
        const directionalBladeWeapons = new Set([
            'great_sword', 'long_sword', 'sword_shield', 'dual_blades',
            'switch_axe', 'charge_blade', 'insect_glaive'
        ]);
        const directionalBlade = directionalBladeWeapons.has(String(profile?.weaponId || ''));
        const v = hasMeasuredTarget
            ? { x: Number(targetVector.x), y: Number(targetVector.y),
                // Directional blades obey the stable combat formation: slots
                // 1/2 share a stance and slots 3/4 are its mirror. Live DOM
                // jitter may change distance, never the cutting-edge side.
                side: directionalBlade ? fallbackVector.side
                    : (Number(targetVector.x) < 0 ? -1 : 1) }
            : fallbackVector;
        const spec = this.MOTIONS[profile?.motion] || this.MOTIONS.horizontal_slash;
        // The Great Sword bitmap's visible clock axis is +90deg from the
        // catalog's generic vertical-weapon axis. Mirroring its cutting edge
        // without correcting this axis produced a 9→6 o'clock slash in slots
        // 1/2. Apply the asset correction once, centrally: 12→9 for slots 1/2
        // and the exact mirror for slots 3/4.
        const assetRotationOffset = profile?.weaponId === 'great_sword' ? 90 : 0;
        const rotationFor = rotation => (rotation + assetRotationOffset) * v.side;
        // Slots 1/2 share one stance; slots 3/4 are its true visual mirror.
        // Mirroring the whole weapon is intentional here: the cutting edge must
        // face inward after the hunter crosses to the other side of the monster.
        // Great Sword's bitmap has its cutting edge on the opposite local side
        // from the other directional weapon assets. Flip its source first so
        // the charged stance presents the edge toward the swing, then mirror
        // the complete stance between the left and right hunter pairs.
        const bladeMirror = profile?.weaponId === 'great_sword'
            ? -v.side
            : (directionalBlade ? v.side : 1);
        return spec.map(([offset, xRatio, yRatio, rotation, scale, xNudge, yNudge]) => ({
            offset,
            transformOrigin: profile?.transformOrigin || '50% 50%',
            transform: `translate(${Math.round(v.x * xRatio + xNudge * v.side)}px, ${Math.round(v.y * yRatio + yNudge)}px) rotate(${Math.round(rotationFor(rotation))}deg) scale(${scale})${directionalBlade ? ` scaleX(${bladeMirror})` : ''}`
        }));
    }
}

if (typeof window !== 'undefined') window.HuntWeaponAnimationCatalog = HuntWeaponAnimationCatalog;
if (typeof module !== 'undefined' && module.exports) module.exports = HuntWeaponAnimationCatalog;
