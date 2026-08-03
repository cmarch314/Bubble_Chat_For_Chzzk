const HUNT_ROAR_ROUTE = {
    azure_rathalos: 'rathalos', silver_rathalos: 'rathalos',
    rathian: 'rathalos', pink_rathian: 'rathalos', gold_rathian: 'rathalos',
    black_diablos: 'diablos', stygian_zinogre: 'zinogre',
    ruiner_nergigante: 'nergigante', savage_deviljho: 'deviljho',
    raging_brachydios: 'brachydios', acidic_glavenus: 'glavenus',
    furious_rajang: 'rajang', seething_bazelgeuse: 'bazelgeuse',
    frostfang_barioth: 'barioth', shrieking_legiana: 'legiana',
    crimson_glow_valstrax: 'valstrax', primordial_malzeno: 'malzeno',
    scarred_yian_garuga: 'yian_garuga', fulgur_anjanath: 'anjanath',
    nightshade_paolumu: 'paolumu', viper_tobi_kadachi: 'tobi_kadachi',
    coral_pukei_pukei: 'pukei_pukei', ebony_odogaron: 'odogaron',
    brute_tigrex: 'tigrex', viper_tobi_kadachi: 'tobi_kadachi',
    blackveil_vaal_hazak: 'vaal_hazak'
};

const HUNT_GENERATED_WORLD_ROAR_ROUTES = typeof module !== 'undefined' && module.exports
    ? require('./data/WorldMonsterRoarRoutes.generated.js').HUNT_WORLD_MONSTER_ROAR_ROUTES
    : (window.HUNT_WORLD_MONSTER_ROAR_ROUTES || {});
const HUNT_GENERATED_WORLD_REVIEW_DATA = typeof module !== 'undefined' && module.exports
    ? require('./data/WorldMonsterAudioReviewRoutes.generated.js')
    : window;
const HUNT_GENERATED_WORLD_REVIEW_ROUTES = HUNT_GENERATED_WORLD_REVIEW_DATA.HUNT_WORLD_MONSTER_REVIEW_ROUTES || {};
const HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES = Object.freeze(
    HUNT_GENERATED_WORLD_REVIEW_DATA.HUNT_WORLD_MONSTER_SE_FALLBACKS || {}
);
const HUNT_GENERATED_SILENT_VOICE_IDS = Object.freeze(
    [...(HUNT_GENERATED_WORLD_REVIEW_DATA.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS || [])]
);

// Kept as an empty compatibility export for older overlay extensions. The
// former generic files were unverified and are no longer valid hunt fallbacks.
const HUNT_WEAPON_AUDIO_CUES = Object.freeze({});

const HUNT_PROTECTED_CLASSIC_AUDIO = Object.freeze([
    'Unified_SFX/Potion Drink.mp3',
    'Unified_SFX/MH - Open Chest.mp3',
    'Unified_SFX/MH - Hunters Depart (MH3U).mp3',
    'Unified_SFX/MH - Item Found.mp3',
    'Unified_SFX/MH - Item Found (rare).mp3',
    'Unified_SFX/MH - Item Found (rarest).mp3'
]);

// Exact World bank labels recovered from the locally installed game. A clip
// enters this table only when its original event label identifies the action;
// duration and filename shape are never treated as semantic evidence.
const HUNT_VERIFIED_LOCAL_WEAPON_CUES = {
    'great_sword:charge_tier_1': [{
        label: 'Charge tier 1', evidence: 'MHW Audio Modding workbook exact World wp00 event label',
        layers: [['local_assets/monster_hunter/world/weapon/great_sword/wp00_two_epvsp_nbnk_010_739955564.mp3', 0.62, 0]]
    }],
    'great_sword:charge_tier_2': [{
        label: 'Charge tier 2', evidence: 'MHW Audio Modding workbook exact World wp00 event label',
        layers: [['local_assets/monster_hunter/world/weapon/great_sword/wp00_two_epvsp_nbnk_002_285500585.mp3', 0.64, 0]]
    }],
    'great_sword:charge_tier_3': [{
        label: 'Charge tier 3', evidence: 'MHW Audio Modding workbook exact World wp00 event label',
        layers: [['local_assets/monster_hunter/world/weapon/great_sword/wp00_two_epvsp_nbnk_009_701005050.mp3', 0.66, 0]]
    }],
    'great_sword:true_charged_slash': [{
        label: 'true charged slash power hit', evidence: 'World wp00 event label',
        layers: [
            ['local_assets/monster_hunter/world/weapon/great_sword/wp00_two_epvsp_nbnk_013_877804327.mp3', 0.62, 0],
            ['local_assets/monster_hunter/world/weapon/great_sword/wp00_two_epvsp_nbnk_011_742113152.mp3', 0.74, 75]
        ]
    }],
    'hammer:charged_swing_light': [{
        label: 'charged swing tier 2', evidence: 'World wp04 event label',
        layers: [['local_assets/monster_hunter/world/weapon/hammer/wp04_ham_epvsp_nbnk_002_146760325.mp3', 0.64, 0]]
    }],
    'hammer:charged_swing_heavy': [
        { label: 'charged swing tier 3 first variation', evidence: 'World wp04 event label', layers: [['local_assets/monster_hunter/world/weapon/hammer/wp04_ham_epvsp_nbnk_005_421068735.mp3', 0.72, 0]] },
        { label: 'charged swing tier 3 second variation', evidence: 'World wp04 event label', layers: [['local_assets/monster_hunter/world/weapon/hammer/wp04_ham_epvsp_nbnk_009_825661652.mp3', 0.72, 0]] }
    ],
    'gunlance:reload': [{
        label: 'gunlance reload', evidence: 'World gunlance common event label',
        layers: [['local_assets/monster_hunter/world/weapon/gunlance/wp_gun_cmn_nbnk_001_86782159.mp3', 0.62, 0]]
    }],
    'gunlance:explosive_heavy': [
        { label: 'full burst five shells', evidence: 'World wp07 shell event label', layers: [['local_assets/monster_hunter/world/weapon/gunlance/wp07_gun_epvsp_shell_nbnk_009_272642002.mp3', 0.76, 0]] },
        { label: 'wyrmstake cannon explosion', evidence: 'World wp07 shell event label', layers: [['local_assets/monster_hunter/world/weapon/gunlance/wp07_gun_epvsp_shell_nbnk_040_932229979.mp3', 0.76, 0]] }
    ],
    // The common-bank string-pull clips are deliberately excluded. Charging
    // uses only the labelled charge-air effect, trimmed to its action window.
    'bow:bow_charge_start': [{
        label: 'Charge air cone',
        evidence: 'MHW Audio Modding workbook exact World wp11 event 2976616266 / source 304692171',
        maxDurationMs: 1050,
        layers: [['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_019_304692171.mp3', 0.52, 0]]
    }],
    'bow:bow_charge_step': [{
        label: 'Charge air cone',
        evidence: 'same-bow charge continuation surrogate; exact World wp11 event 2976616266 / source 304692171',
        maxDurationMs: 550,
        layers: [['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_019_304692171.mp3', 0.48, 0]]
    }],
    'bow:bow_shot': [{
        label: 'arrow shot',
        evidence: 'MHW Audio Modding workbook exact World wp11 event 978594604 / source 217590158',
        layers: [['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_012_217590158.mp3', 0.66, 0]]
    }],
    'bow:bow_charged_shot': [{
        label: 'Shoot charge max arrow',
        evidence: 'MHW Audio Modding workbook exact World wp11 event 798551537 / source 191401661',
        layers: [['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_011_191401661.mp3', 0.68, 0]]
    }],
    'bow:bow_power_shot': [{
        label: 'Power shot arrows shot',
        evidence: 'MHW Audio Modding workbook exact World wp11 event 1882850457 / source 766270597',
        layers: [['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_047_766270597.mp3', 0.68, 0]]
    }],
    'bow:dragon_piercer': [{
        label: 'dragon piercer shot and hit', evidence: 'World wp11 shell event labels',
        layers: [
            ['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_032_473159840.mp3', 0.74, 0],
            ['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_015_283137092.mp3', 0.65, 80]
        ]
    }],
    'switch_axe:sword_slash': [{
        label: 'sword-mode slash effect', evidence: 'World wp08 event label',
        layers: [['local_assets/monster_hunter/world/weapon/switch_axe/wp08_saxe_epvsp_nbnk_002_235177133.mp3', 0.66, 0]]
    }],
    'switch_axe:explosive_heavy': [{
        label: 'switch axe phial explosion', evidence: 'World wp08 event label',
        layers: [['local_assets/monster_hunter/world/weapon/switch_axe/wp08_saxe_epvsp_nbnk_001_32154789.mp3', 0.72, 0]]
    }],
    'long_sword:counter': [{
        label: 'foresight slash begin and release', evidence: 'World wp03 exact event labels',
        layers: [
            ['local_assets/monster_hunter/world/weapon/long_sword/wp03_swo_epvsp_nbnk_008_204146808.mp3', 0.56, 0],
            ['local_assets/monster_hunter/world/weapon/long_sword/wp03_swo_epvsp_nbnk_010_225941642.mp3', 0.68, 55]
        ]
    }],
    'charge_blade:mechanical_transform': [{
        label: 'charge blade change to axe', evidence: 'World charge blade common event label',
        layers: [['local_assets/monster_hunter/world/weapon/charge_blade/wp_caxe_cmn_nbnk_025_766523265.mp3', 0.68, 0]]
    }],
    'charge_blade:explosive_heavy': [{
        label: 'impact phial SAED explosion', evidence: 'World wp09 event label',
        layers: [['local_assets/monster_hunter/world/weapon/charge_blade/wp09_caxe_epvsp_nbnk_036_715381168.mp3', 0.76, 0]]
    }],
    'insect_glaive:kinsect_extract': [{
        label: 'kinsect blunt hit', evidence: 'World wp10 shell event label',
        layers: [['local_assets/monster_hunter/world/weapon/insect_glaive/wp10_rod_epvsp_shell_nbnk_017_769361289.mp3', 0.62, 0]]
    }],
    'sword_shield:charged_slash': [{
        label: 'charged slash release stereo pair', evidence: 'World wp01 exact event labels',
        layers: [
            ['local_assets/monster_hunter/world/weapon/sword_shield/wp01_one_epvsp_nbnk_002_207578362.mp3', 0.54, 0],
            ['local_assets/monster_hunter/world/weapon/sword_shield/wp01_one_epvsp_nbnk_007_1062480315.mp3', 0.54, 0]
        ]
    }]
};

// No labelled Lifepowder item event is available in the current extraction.
// This official World healing-powder burst is the closest semantically proven
// surrogate and is kept distinct from potion drinking and item-acquisition UI.
const HUNT_VERIFIED_LOCAL_ITEM_CUES = {
    flash_pod: [{
        label: 'Flash pod explosion',
        evidence: 'MHW Audio Modding workbook confirmed slinnger_shell WEM 51; '
            + 'Wwise event 2588333717 / source 584946289.',
        layers: [
            ['local_assets/monster_hunter/world/unknown/common/slinnger_shell_nbnk_051_584946289.mp3', 0.82, 0]
        ]
    }],
    lifepowder: [{
        label: 'healing powder burst',
        evidence: 'World healing kinsect powder exact event labels; explicit Lifepowder surrogate',
        layers: [
            ['local_assets/monster_hunter/world/weapon/insect_glaive/wp10_rod_epvsp_shell_nbnk_002_88588799.mp3', 0.62, 0],
            ['local_assets/monster_hunter/world/weapon/insect_glaive/wp10_rod_epvsp_shell_nbnk_019_792796667.mp3', 0.62, 45]
        ]
    }],
    whetstone_stroke: [{
        label: 'Weapon sharpen [1/3]',
        evidence: 'MHW Audio Modding workbook confirmed pl_prop_cmn WEM 34; '
            + 'three strokes match the installed Wilds PlayerItemParam _Toishi_SharpenCount=3.',
        layers: [
            ['local_assets/monster_hunter/world/unknown/common/pl_prop_cmn_nbnk_034_139101520.mp3', 0.74, 0],
            ['local_assets/monster_hunter/world/unknown/common/pl_prop_cmn_nbnk_034_139101520.mp3', 0.78, 0],
            ['local_assets/monster_hunter/world/unknown/common/pl_prop_cmn_nbnk_034_139101520.mp3', 0.82, 0]
        ]
    }],
    whetstone_finish: [{
        label: 'Sharpen finished',
        evidence: 'MHW Audio Modding workbook confirmed wp_cmn_epvsp WEM 52 / source 838569492.',
        layers: [
            ['local_assets/monster_hunter/world/unknown/common/wp_cmn_epvsp_nbnk_052_838569492.mp3', 0.82, 0]
        ]
    }]
};

// Exact barrel-bomb item events are not mapped yet. These weapon-bank sounds are
// explicit, replaceable spectacle surrogates and must never be presented as verified item evidence.
const HUNT_LOCAL_ITEM_SURROGATE_CUES = {
    barrel_bomb: [{
        label: 'barrel bomb explosion and blast',
        evidence: 'World gunlance explosive shell & Wyrmstake detonation evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/gunlance/wp07_gun_epvsp_shell_nbnk_009_272642002.mp3', 0.78, 0],
            ['local_assets/monster_hunter/world/weapon/gunlance/wp07_gun_epvsp_shell_nbnk_040_932229979.mp3', 0.82, 85]
        ]
    }],
    bomb_fuse: [{
        label: 'barrel bomb fuse and placement',
        evidence: 'World item placement and ignition surrogate',
        layers: [
            ['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_047_766270597.mp3', 0.55, 0]
        ]
    }]
};

const HUNT_VERIFIED_HIT_CUES = {
    sever_weakspot: [{
        label: 'sharp severing weakspot hit',
        evidence: 'World slash hit evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/great_sword/wp00_two_epvsp_nbnk_013_877804327.mp3', 0.65, 0],
            ['local_assets/monster_hunter/world/weapon/switch_axe/wp08_saxe_epvsp_nbnk_002_235177133.mp3', 0.70, 45]
        ]
    }],
    sever_normal: [{
        label: 'sharp severing normal hit',
        evidence: 'World slash hit evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/switch_axe/wp08_saxe_epvsp_nbnk_002_235177133.mp3', 0.65, 0]
        ]
    }],
    blunt_weakspot: [{
        label: 'heavy blunt weakspot hit',
        evidence: 'World hammer hit evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/hammer/wp04_ham_epvsp_nbnk_005_421068735.mp3', 0.75, 0],
            ['local_assets/monster_hunter/world/weapon/hammer/wp04_ham_epvsp_nbnk_002_146760325.mp3', 0.65, 40]
        ]
    }],
    blunt_normal: [{
        label: 'heavy blunt normal hit',
        evidence: 'World hammer hit evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/hammer/wp04_ham_epvsp_nbnk_002_146760325.mp3', 0.65, 0]
        ]
    }],
    ranged_weakspot: [{
        label: 'ranged piercer weakspot hit',
        evidence: 'World bow shell evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_032_473159840.mp3', 0.70, 0]
        ]
    }],
    ranged_normal: [{
        label: 'ranged normal hit',
        evidence: 'World bow shell evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_032_473159840.mp3', 0.58, 0]
        ]
    }],
    bounce_hard: [{
        label: 'deflection bounce on hard shell',
        evidence: 'World weapon deflection evidence',
        layers: [
            ['local_assets/monster_hunter/world/weapon/charge_blade/wp_caxe_cmn_nbnk_025_766523265.mp3', 0.60, 0]
        ]
    }]
};

// Monster clips are even stricter than weapon clips: every entry below is tied
// to a named World event in the recovered community bank map. Shared entries
// are listed only when the source label explicitly names both monsters.
const monsterRoar = (label, paths) => [{
    label,
    evidence: 'MHW Audio Modding workbook exact event label',
    layers: paths.map(path => [path, 0.78, 0])
}];

const HUNT_VERIFIED_LOCAL_MONSTER_CUES = {
    'diablos:burrow': [{
        label: 'Diablos burrow ground rumble',
        evidence: 'User-audition-confirmed World em007_se event chain',
        patternKeywords: ['burrow', '지중'],
        layers: [[
            'local_assets/monster_hunter/world/monster/em007/em007_se_nbnk_056_205431218.mp3',
            0.66,
            0
        ]]
    }],
    'black_diablos:burrow': [{
        label: 'Black Diablos shared burrow ground rumble',
        evidence: 'User-audition-confirmed shared World em007 body action',
        patternKeywords: ['burrow', '지중'],
        layers: [[
            'local_assets/monster_hunter/world/monster/em007/em007_se_nbnk_056_205431218.mp3',
            0.66,
            0
        ]]
    }],
    'rathalos:telegraph': [{
        label: 'Rathalos fireball charge vocal',
        evidence: 'User-audition-confirmed World em001 VO breath-charge event chain',
        patternKeywords: ['fireball', 'backstep_fireball', '화염구', '브레스'],
        layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_117_897645699.mp3', 0.66, 0]]
    }],
    'rathian:telegraph': [
        {
            label: 'Rathian somersault vocal 1',
            evidence: 'User-tag-confirmed World em001 VO event 2838412660',
            patternKeywords: ['somersault', '서머솔트'],
            layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_027_137441638.mp3', 0.7, 0]]
        },
        {
            label: 'Rathian somersault vocal 2',
            evidence: 'User-tag-confirmed World em001 VO event 2838412660',
            patternKeywords: ['somersault', '서머솔트'],
            layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_047_287664299.mp3', 0.7, 0]]
        },
        {
            label: 'Rath family fireball charge vocal',
            evidence: 'User-audition-confirmed shared World em001 VO breath-charge event chain',
            patternKeywords: ['fireball', 'backstep_fireball', '화염구', '브레스'],
            layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_117_897645699.mp3', 0.66, 0]]
        }
    ],
    'rathalos:attack': [
        ...[
            'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_042_249895042.mp3',
            'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_124_948696462.mp3'
        ].map((bitePath, index) => ({
            label: `Rathalos bite vocal ${index + 1}`,
            evidence: 'User-audition-confirmed World em001 VO event chain and grouped random playback',
            patternKeywords: ['bite', '물어'],
            layers: [[bitePath, 0.68, 0]]
        })),
        ...[
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_107_840416626.mp3',
                label: 'Rathalos aerial attack vocal'
            },
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_046_267272460.mp3',
                label: 'Rathalos aerial attack vocal event variant 2'
            },
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_105_829711342.mp3',
                label: 'Rathalos user-selected nearby aerial vocal 3'
            },
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_109_846481219.mp3',
                label: 'Rathalos user-selected nearby aerial vocal 4'
            },
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_009_36906213.mp3',
                label: 'Rathalos confirmed wing flap 1'
            },
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_014_53232238.mp3',
                label: 'Rathalos confirmed wing flap 2'
            },
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_013_50067497.mp3',
                label: 'Rathalos confirmed wing flap 3'
            },
            {
                path: 'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_277_1063210653.mp3',
                label: 'Rathalos confirmed wing flap 4'
            }
        ].map(candidate => ({
            label: candidate.label,
            evidence: 'User-audition-confirmed World em001 aerial VO/SE random pool',
            patternKeywords: ['glide', 'claw_dive', 'stomp', '활공', '강습', '내려찍기'],
            layers: [[candidate.path, candidate.path.includes('_vo_') ? 0.64 : 0.6, 0]]
        })),
        {
            label: 'Rathalos backstep fire remaining on the ground',
            evidence: 'User-audition-confirmed World em001 SE event chain',
            patternKeywords: ['backstep_fireball', '백스텝'],
            layers: [['local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_012_44522100.mp3', 0.58, 120]]
        }
    ],
    'rathian:attack': [{
        label: 'Rathian bite vocal',
        evidence: 'User-audition-confirmed World em001 VO event chain',
        patternKeywords: ['bite', '물어'],
        layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_042_249895042.mp3', 0.68, 0]]
    },
    {
        label: 'Rathian shared Rath-family bite vocal 2',
        evidence: 'User-audition-confirmed shared World em001 VO event chain',
        patternKeywords: ['bite'],
        layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_124_948696462.mp3', 0.68, 0]]
    },
    ...[
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_107_840416626.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_046_267272460.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_105_829711342.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_109_846481219.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_009_36906213.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_014_53232238.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_013_50067497.mp3',
        'local_assets/monster_hunter/world/monster/em001/em001_se_nbnk_277_1063210653.mp3'
    ].map((aerialPath, index) => ({
        label: `Rathian shared Rath-family aerial vocal / wing layer ${index + 1}`,
        evidence: 'User-audition-confirmed shared World em001 aerial VO/SE pool',
        patternKeywords: ['somersault', 'glide', 'bite_somersault', 'flight'],
        layers: [[aerialPath, aerialPath.includes('_vo_') ? 0.64 : 0.6, 0]]
    }))
    ],
    'rathalos:knockdown': [{
        label: 'Rathalos incapacitated / trapped vocal',
        evidence: 'User-audition-confirmed World em001 VO event chain',
        layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_044_259426345.mp3', 0.7, 0]]
    }],
    'rathalos:trap': [{
        label: 'Rathalos trapped vocal',
        evidence: 'User-audition-confirmed World em001 VO event chain',
        layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_044_259426345.mp3', 0.7, 0]]
    }],
    'rathalos:flinch': [{
        label: 'Rathalos small flinch vocal',
        evidence: 'User-audition-confirmed World em001 VO event chain',
        layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_121_930577735.mp3', 0.66, 0]]
    }],
    'rathalos:death': [{
        label: 'Rathalos death vocal',
        evidence: 'User-audition-confirmed World em001 VO event chain',
        layers: [['local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_045_265716738.mp3', 0.74, 0]]
    }],
    'diablos:roar': monsterRoar('Diablos roar', [
        'local_assets/monster_hunter/world/monster/em007/em007_vo_nbnk_054_520295467.mp3'
    ]),
    'rajang:roar': monsterRoar('Rajang roar', [
        'local_assets/monster_hunter/world/monster/em023/em023_vo_nbnk_052_330776805.mp3'
    ]),
    'kirin:roar': monsterRoar('Kirin roar', [
        'local_assets/monster_hunter/world/monster/em011/em011_vo_nbnk_088_851733936.mp3'
    ]),
    'kushala_daora:roar': monsterRoar('Kushala Daora roar', [
        'local_assets/monster_hunter/world/monster/em024/em024_vo_nbnk_024_207572245.mp3'
    ]),
    'lunastra:roar': monsterRoar('Lunastra roar', [
        'local_assets/monster_hunter/world/monster/em026/em026_vo_nbnk_018_206753846.mp3'
    ]),
    'teostra:roar': monsterRoar('Teostra roar', [
        'local_assets/monster_hunter/world/monster/em027/em027_vo_nbnk_029_313120888.mp3'
    ]),
    'jyuratodus:roar': monsterRoar('Lavasioth/Jyuratodus roar', [
        'local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_089_727855205.mp3'
    ]),
    'lavasioth:roar': monsterRoar('Lavasioth/Jyuratodus roar', [
        'local_assets/monster_hunter/world/monster/em036/em036_vo_nbnk_089_727855205.mp3'
    ]),
    'nargacuga:roar': monsterRoar('Nargacuga roar', [
        'local_assets/monster_hunter/world/monster/em037/em037_vo_nbnk_121_954859918.mp3'
    ]),
    'nargacuga:attack': [{
        label: 'tail slam telegraph / tail spikes raising',
        evidence: 'MHW Audio Modding workbook exact event label',
        patternKeywords: ['꼬리', '가시', 'tail', 'slam'],
        layers: [['local_assets/monster_hunter/world/monster/em037/em037_se_nbnk_095_264027521.mp3', 0.66, 0]]
    }],
    'deviljho:roar': monsterRoar('Deviljho roar', [
        'local_assets/monster_hunter/world/monster/em043/em043_vo_nbnk_036_183982413.mp3'
    ]),
    'barroth:roar': monsterRoar('Barroth roar', [
        'local_assets/monster_hunter/world/monster/em044/em044_vo_nbnk_002_30982086.mp3'
    ]),
    'uragaan:roar': monsterRoar('Uragaan/Radobaan roar', [
        'local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_050_416529856.mp3'
    ]),
    'radobaan:roar': monsterRoar('Uragaan/Radobaan roar', [
        'local_assets/monster_hunter/world/monster/em045/em045_vo_nbnk_050_416529856.mp3'
    ]),
    'pukei_pukei:roar': monsterRoar('Pukei-Pukei roar', [
        'local_assets/monster_hunter/world/monster/em102/em102_vo_nbnk_048_362681955.mp3'
    ]),
    'nergigante:roar': monsterRoar('Nergigante roar', [
        'local_assets/monster_hunter/world/monster/em103/em103_vo_nbnk_060_614181179.mp3'
    ]),
    'zorah_magdaros:roar': monsterRoar('Zorah Magdaros roar', [
        'local_assets/monster_hunter/world/monster/em106/em106_vo_nbnk_013_274942992.mp3'
    ]),
    'kulu_ya_ku:roar': monsterRoar('Kulu-Ya-Ku roar', [
        'local_assets/monster_hunter/world/monster/em107/em107_vo_nbnk_022_142815062.mp3'
    ]),
    'tobi_kadachi:roar': monsterRoar('Tobi-Kadachi roar', [
        'local_assets/monster_hunter/world/monster/em109/em109_vo_nbnk_062_495388163.mp3'
    ]),
    'paolumu:roar': monsterRoar('Paolumu roar', [
        'local_assets/monster_hunter/world/monster/em110/em110_vo_nbnk_079_890527690.mp3'
    ]),
    'legiana:roar': monsterRoar('Legiana roar', [
        'local_assets/monster_hunter/world/monster/em111/em111_vo_nbnk_040_386696490.mp3'
    ]),
    'great_girros:roar': monsterRoar('Great Girros roar', [
        'local_assets/monster_hunter/world/monster/em112/em112_vo_nbnk_093_624300947.mp3'
    ]),
    'odogaron:roar': monsterRoar('Odogaron roar', [
        'local_assets/monster_hunter/world/monster/em113/em113_vo_nbnk_059_460769289.mp3'
    ]),
    'tzitzi_ya_ku:roar': monsterRoar('Tzitzi-Ya-Ku primary roar event', [
        'local_assets/monster_hunter/world/monster/em120/em120_vo_nbnk_015_126401446.mp3'
    ]),
    'safi_jiiva:roar': monsterRoar('Safi aggro roar', [
        'local_assets/monster_hunter/world/monster/em104/em104_vo_nbnk_117_937363759.mp3'
    ]),
    'safi_jiiva:ultimate': [{
        label: 'Safi sapphire star breath-down and explosion',
        evidence: 'MHW Audio Modding workbook exact em104_se event labels',
        patternKeywords: ['사파이어', '왕의 방울', '제왕', 'sapphire', 'ultimate'],
        layers: [
            ['local_assets/monster_hunter/world/monster/em104/em104_se_nbnk_011_36938036.mp3', 0.68, 0],
            ['local_assets/monster_hunter/world/monster/em104/em104_se_nbnk_015_48283801.mp3', 0.78, 0]
        ]
    }]
};

// World Rathian and Rathalos share the audition-confirmed Rath-family reaction
// Workbook WEM numbers are review indices, not decoded stream ordinals. Never
// fall back to the old hand-authored roar paths when the generated evidence
// audit withholds an ambiguous route.
Object.keys(HUNT_VERIFIED_LOCAL_MONSTER_CUES).forEach(key => {
    if (key.endsWith(':roar')) delete HUNT_VERIFIED_LOCAL_MONSTER_CUES[key];
});
Object.assign(HUNT_VERIFIED_LOCAL_MONSTER_CUES, HUNT_GENERATED_WORLD_ROAR_ROUTES);
for (const [key, variants] of Object.entries(HUNT_GENERATED_WORLD_REVIEW_ROUTES)) {
    const current = Array.isArray(HUNT_VERIFIED_LOCAL_MONSTER_CUES[key])
        ? HUNT_VERIFIED_LOCAL_MONSTER_CUES[key]
        : [];
    const paths = new Set(current.flatMap(variant => (variant.layers || []).map(layer => layer[0])));
    HUNT_VERIFIED_LOCAL_MONSTER_CUES[key] = [
        ...current,
        ...variants.filter(variant => !(variant.layers || []).some(layer => paths.has(layer[0])))
    ];
}
for (const monsterId of HUNT_GENERATED_SILENT_VOICE_IDS) {
    for (const kind of ['roar', 'death', 'flinch', 'knockdown', 'trap', 'telegraph']) {
        delete HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${monsterId}:${kind}`];
    }
}

// Rathian and Rathalos use the same audition-confirmed World roar event.
// Alias the route object itself so future regeneration cannot make only one
// side audible or let the pair drift onto different clips.
const HUNT_SHARED_RATH_ROAR = HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathalos:roar'];
if (Array.isArray(HUNT_SHARED_RATH_ROAR)) {
    HUNT_VERIFIED_LOCAL_MONSTER_CUES['rathian:roar'] = HUNT_SHARED_RATH_ROAR;
}

// Generated review routes may replace either side with a newly merged array.
// Reapply the Rath-family reaction aliases after every generated merge so
// runtime random pools and their tests observe one shared authoritative set.
['knockdown', 'trap', 'flinch', 'death'].forEach(kind => {
    const shared = HUNT_VERIFIED_LOCAL_MONSTER_CUES[`rathalos:${kind}`];
    if (Array.isArray(shared)) HUNT_VERIFIED_LOCAL_MONSTER_CUES[`rathian:${kind}`] = shared;
});

// User audition confirmed that Tigrex and Brute Tigrex share the same voice
// files. Rebuild the variant routes after generated-route merging so later
// review regeneration cannot silently split the pair again. Keep any authored
// Brute Tigrex SE, but never treat a shared body-impact SE as voice evidence.
['roar', 'attack', 'telegraph', 'knockdown', 'trap', 'flinch', 'death'].forEach(kind => {
    const shared = HUNT_VERIFIED_LOCAL_MONSTER_CUES[`tigrex:${kind}`];
    if (!Array.isArray(shared)) return;
    const sharedVoice = shared.filter(variant =>
        (variant.layers || []).some(([audioPath]) => String(audioPath).includes('_vo_')));
    const authoredVariantSe = (HUNT_VERIFIED_LOCAL_MONSTER_CUES[`brute_tigrex:${kind}`] || [])
        .filter(variant => (variant.layers || []).every(([audioPath]) => String(audioPath).includes('_se_')));
    HUNT_VERIFIED_LOCAL_MONSTER_CUES[`brute_tigrex:${kind}`] = [
        ...sharedVoice,
        ...authoredVariantSe
    ];
});

// Rath subspecies, rare species, deviants and apex/guardian forms retain the
// same creature voice identity as their base species. Inherit only confirmed
// VO layers: variant-specific breath, wing and impact SE remain independently
// authored and must never be replaced by a family alias.
const HUNT_MONSTER_VOICE_FAMILY_ROUTES = Object.freeze({
    black_diablos: 'diablos',
    stygian_zinogre: 'zinogre',
    ruiner_nergigante: 'nergigante',
    savage_deviljho: 'deviljho',
    raging_brachydios: 'brachydios',
    acidic_glavenus: 'glavenus',
    furious_rajang: 'rajang',
    seething_bazelgeuse: 'bazelgeuse',
    frostfang_barioth: 'barioth',
    shrieking_legiana: 'legiana',
    crimson_glow_valstrax: 'valstrax',
    primordial_malzeno: 'malzeno',
    scarred_yian_garuga: 'yian_garuga',
    fulgur_anjanath: 'anjanath',
    nightshade_paolumu: 'paolumu',
    viper_tobi_kadachi: 'tobi_kadachi',
    coral_pukei_pukei: 'pukei_pukei',
    ebony_odogaron: 'odogaron',
    brute_tigrex: 'tigrex',
    blackveil_vaal_hazak: 'vaal_hazak',
    azure_rathalos: 'rathalos',
    silver_rathalos: 'rathalos',
    dreadking_rathalos: 'rathalos',
    apex_rathalos: 'rathalos',
    guardian_rathalos: 'rathalos',
    pink_rathian: 'rathian',
    gold_rathian: 'rathian',
    dreadqueen_rathian: 'rathian',
    apex_rathian: 'rathian'
});
const HUNT_MONSTER_VOICE_KINDS = Object.freeze([
    'roar', 'attack', 'telegraph', 'knockdown', 'trap', 'flinch', 'death'
]);
for (const [variantId, baseId] of Object.entries(HUNT_MONSTER_VOICE_FAMILY_ROUTES)) {
    for (const kind of HUNT_MONSTER_VOICE_KINDS) {
        const baseVoice = (HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${baseId}:${kind}`] || [])
            .filter(variant => (variant.layers || [])
                .some(([audioPath]) => String(audioPath).includes('_vo_')));
        if (!baseVoice.length) continue;
        const exactVariantSe = (HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${variantId}:${kind}`] || [])
            .filter(variant => (variant.layers || [])
                .every(([audioPath]) => !String(audioPath).includes('_vo_')));
        HUNT_VERIFIED_LOCAL_MONSTER_CUES[`${variantId}:${kind}`] = [
            ...baseVoice,
            ...exactVariantSe
        ];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HUNT_ROAR_ROUTE,
        HUNT_MONSTER_VOICE_FAMILY_ROUTES,
        HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES,
        HUNT_WORLD_MONSTER_SILENT_VOICE_IDS: HUNT_GENERATED_SILENT_VOICE_IDS,
        HUNT_WEAPON_AUDIO_CUES,
        HUNT_PROTECTED_CLASSIC_AUDIO,
        HUNT_VERIFIED_LOCAL_WEAPON_CUES,
        HUNT_VERIFIED_LOCAL_ITEM_CUES,
        HUNT_LOCAL_ITEM_SURROGATE_CUES,
        HUNT_VERIFIED_HIT_CUES,
        HUNT_VERIFIED_LOCAL_MONSTER_CUES
    };
} else {
    window.HUNT_ROAR_ROUTE = HUNT_ROAR_ROUTE;
    window.HUNT_MONSTER_VOICE_FAMILY_ROUTES = HUNT_MONSTER_VOICE_FAMILY_ROUTES;
    window.HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES = HUNT_VERIFIED_GENERIC_MONSTER_SE_CUES;
    window.HUNT_WORLD_MONSTER_SILENT_VOICE_IDS = HUNT_GENERATED_SILENT_VOICE_IDS;
    window.HUNT_WEAPON_AUDIO_CUES = HUNT_WEAPON_AUDIO_CUES;
    window.HUNT_PROTECTED_CLASSIC_AUDIO = HUNT_PROTECTED_CLASSIC_AUDIO;
    window.HUNT_VERIFIED_LOCAL_WEAPON_CUES = HUNT_VERIFIED_LOCAL_WEAPON_CUES;
    window.HUNT_VERIFIED_LOCAL_ITEM_CUES = HUNT_VERIFIED_LOCAL_ITEM_CUES;
    window.HUNT_LOCAL_ITEM_SURROGATE_CUES = HUNT_LOCAL_ITEM_SURROGATE_CUES;
    window.HUNT_VERIFIED_HIT_CUES = HUNT_VERIFIED_HIT_CUES;
    window.HUNT_VERIFIED_LOCAL_MONSTER_CUES = HUNT_VERIFIED_LOCAL_MONSTER_CUES;
}
