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
    coral_pukei_pukei: 'pukei_pukei'
};

const HUNT_WEAPON_AUDIO_CUES = {
    slash_light: [['SFX/MonsterHunter_Hunters/mh_slash_hit.mp3', 0.55]],
    slash_heavy: [['SFX/MonsterHunter_Hunters/mh_slash_hit.mp3', 0.70], ['SFX/MonsterHunter_Hunters/mh_heavy_hit.mp3', 0.45]],
    blunt_light: [['SFX/MonsterHunter_Hunters/mh_blunt_hit.mp3', 0.60]],
    blunt_heavy: [['SFX/MonsterHunter_Hunters/mh_blunt_hit.mp3', 0.75], ['SFX/MonsterHunter_Hunters/mh_heavy_hit.mp3', 0.50]],
    explosive_heavy: [['SFX/MonsterHunter_Hunters/mh_heavy_hit.mp3', 0.75], ['SFX/MonsterHunter_Hunters/mh_reload.mp3', 0.25]],
    mechanical_transform: [['SFX/MonsterHunter_Hunters/mh_reload.mp3', 0.55]],
    bowgun_shot: [['SFX/MonsterHunter_Hunters/mh_heavy_hit.mp3', 0.38]],
    bow_shot: [['SFX/MonsterHunter_Hunters/mh_slash_hit.mp3', 0.32]]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HUNT_ROAR_ROUTE, HUNT_WEAPON_AUDIO_CUES };
} else {
    window.HUNT_ROAR_ROUTE = HUNT_ROAR_ROUTE;
    window.HUNT_WEAPON_AUDIO_CUES = HUNT_WEAPON_AUDIO_CUES;
}
