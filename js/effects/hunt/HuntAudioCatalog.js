const HUNT_ROAR_ROUTE = {
    azure_rathalos: 'rathalos', silver_rathalos: 'rathalos',
    rathian: 'rathian', pink_rathian: 'rathian', gold_rathian: 'rathian',
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
    'bow:bow_shot': [
        { label: 'arrow shot', evidence: 'World wp11 shell event label', layers: [['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_012_217590158.mp3', 0.66, 0]] },
        { label: 'power shot', evidence: 'World wp11 shell event label', layers: [['local_assets/monster_hunter/world/weapon/bow/wp11_bow_epvsp_shell_nbnk_047_766270597.mp3', 0.66, 0]] }
    ],
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
    lifepowder: [{
        label: 'healing powder burst',
        evidence: 'World healing kinsect powder exact event labels; explicit Lifepowder surrogate',
        layers: [
            ['local_assets/monster_hunter/world/weapon/insect_glaive/wp10_rod_epvsp_shell_nbnk_002_88588799.mp3', 0.62, 0],
            ['local_assets/monster_hunter/world/weapon/insect_glaive/wp10_rod_epvsp_shell_nbnk_019_792796667.mp3', 0.62, 45]
        ]
    }],
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
    'rathian:roar': monsterRoar('Rathian/Rathalos roar', [
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_087_695415387.mp3'
    ]),
    'rathalos:roar': monsterRoar('Rathian/Rathalos roar', [
        'local_assets/monster_hunter/world/monster/em001/em001_vo_nbnk_087_695415387.mp3'
    ]),
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HUNT_ROAR_ROUTE,
        HUNT_WEAPON_AUDIO_CUES,
        HUNT_PROTECTED_CLASSIC_AUDIO,
        HUNT_VERIFIED_LOCAL_WEAPON_CUES,
        HUNT_VERIFIED_LOCAL_ITEM_CUES,
        HUNT_VERIFIED_HIT_CUES,
        HUNT_VERIFIED_LOCAL_MONSTER_CUES
    };
} else {
    window.HUNT_ROAR_ROUTE = HUNT_ROAR_ROUTE;
    window.HUNT_WEAPON_AUDIO_CUES = HUNT_WEAPON_AUDIO_CUES;
    window.HUNT_PROTECTED_CLASSIC_AUDIO = HUNT_PROTECTED_CLASSIC_AUDIO;
    window.HUNT_VERIFIED_LOCAL_WEAPON_CUES = HUNT_VERIFIED_LOCAL_WEAPON_CUES;
    window.HUNT_VERIFIED_LOCAL_ITEM_CUES = HUNT_VERIFIED_LOCAL_ITEM_CUES;
    window.HUNT_VERIFIED_HIT_CUES = HUNT_VERIFIED_HIT_CUES;
    window.HUNT_VERIFIED_LOCAL_MONSTER_CUES = HUNT_VERIFIED_LOCAL_MONSTER_CUES;
}
