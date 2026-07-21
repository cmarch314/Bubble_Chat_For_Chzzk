const HUNT_BGM_LOCALES = {
    ancient_forest: ['BGM/MHW_Ancient_Forest.mp3'],
    wildspire_waste: ['BGM/MHW_Wildspire_Waste.mp3'],
    coral_highlands: ['BGM/MHW_Coral_Highlands.mp3'],
    rotten_vale: ['BGM/MHW_Rotten_Vale.mp3'],
    elders_recess: ['BGM/MHW_Elders_Recess.mp3'],
    hoarfrost_reach: ['BGM/MHWI_Hoarfrost_Reach.mp3'],
    old_world: ['BGM/MHGU_Arena.mp3'],
    // Kamura village music is a lobby cue, not a battle-area cue.
    kamura: ['BGM/MHGU_Arena.mp3'],
    arena: ['BGM/MHGU_Arena.mp3']
};
const HUNT_HABITAT_LABELS = {
    ancient_forest: '고대수의 숲', wildspire_waste: '개밋둑의 황야', coral_highlands: '육산호의 대지',
    rotten_vale: '독기의 골짜기', elders_recess: '용결정의 땅', hoarfrost_reach: '바다 건너 극한지',
    old_world: '구대륙 수렵지', kamura: '카무라 권역', arena: '결전장'
};

const HUNT_DEDICATED_THEMES = {
    // Zinogre is intentionally routed through habitat music until a verified
    // dedicated file is supplied; the previous file duplicated Proof of a Hero.
    magnamalo: ['BGM/MHR_Magnamalo.mp3'],
    velkhana: ['BGM/MHW_Velkhana.mp3'],
    nergigante: ['BGM/MHW_Nergigante.mp3'],
    ruiner_nergigante: ['BGM/MHW_Nergigante.mp3'],
    deviljho: ['BGM/MHW_Deviljho.mp3'],
    savage_deviljho: ['BGM/MHW_Deviljho.mp3'],
    tigrex: ['BGM/MHW_Tigrex.mp3'],
    brute_tigrex: ['BGM/MHW_Tigrex.mp3'],
    nargacuga: ['BGM/MHW_Nargacuga.mp3'],
    glavenus: ['BGM/MHW_Glavenus.mp3'],
    acidic_glavenus: ['BGM/MHW_Glavenus.mp3'],
    brachydios: ['BGM/MHW_Brachydios.mp3'],
    raging_brachydios: ['BGM/MHW_Brachydios.mp3'],
    amatsu: ['BGM/MHR_Amatsu.mp3'],
    shagaru_magala: ['BGM/MH4_Shagaru_Magala.mp3'],
    lao_shan_lung: ['BGM/MH_Lao_Shan_Lung.mp3'],
    valstrax: ['BGM/MHGU_Valstrax.mp3'],
    crimson_glow_valstrax: ['BGM/MHGU_Valstrax.mp3'],
    teostra: ['BGM/MHW_Teostra.mp3'],
    lunastra: ['BGM/MHW_Teostra.mp3']
};

const HUNT_MONSTER_HABITATS = {};

function registerHuntHabitats(ids, habitats, latestAppearance = 'mixed') {
    ids.forEach(id => {
        HUNT_MONSTER_HABITATS[id] = {
            latestAppearance,
            habitats: habitats.map((habitat, index) => ({
                id: habitat,
                weight: Math.max(1, habitats.length - index)
            }))
        };
    });
}

registerHuntHabitats([
    'rathalos', 'azure_rathalos', 'silver_rathalos', 'rathian', 'pink_rathian', 'gold_rathian',
    'anjanath', 'pukei_pukei', 'great_jagras', 'kulu_ya_ku'
], ['ancient_forest', 'elders_recess'], 'world_iceborne');
registerHuntHabitats(['diablos', 'black_diablos', 'barroth'], ['wildspire_waste'], 'world_iceborne');
registerHuntHabitats(['legiana', 'tzitzi_ya_ku', 'coral_pukei_pukei'], ['coral_highlands'], 'world_iceborne');
registerHuntHabitats(['odogaron', 'ebony_odogaron', 'great_girros'], ['rotten_vale', 'coral_highlands'], 'world_iceborne');
registerHuntHabitats([
    'dodogama', 'brachydios', 'raging_brachydios', 'bazelgeuse', 'seething_bazelgeuse',
    'nergigante', 'ruiner_nergigante', 'teostra', 'lunastra', 'kushala_daora'
], ['elders_recess'], 'world_iceborne');
registerHuntHabitats([
    'velkhana', 'frostfang_barioth', 'barioth', 'banbaro', 'beotodus'
], ['hoarfrost_reach'], 'world_iceborne');
registerHuntHabitats([
    'zinogre', 'stygian_zinogre', 'deviljho', 'savage_deviljho', 'nargacuga', 'tigrex', 'brute_tigrex',
    'glavenus', 'acidic_glavenus', 'rajang', 'furious_rajang', 'namielle'
], ['ancient_forest', 'wildspire_waste', 'coral_highlands', 'rotten_vale', 'elders_recess', 'hoarfrost_reach'], 'world_iceborne');
registerHuntHabitats([
    'magnamalo', 'malzeno', 'primordial_malzeno', 'mizutsune', 'tetranadon', 'somnacanth',
    'goss_harag', 'lunagaron', 'garangolm', 'royal_ludroth', 'amatsu', 'chameleos'
], ['kamura', 'old_world'], 'rise_sunbreak');
registerHuntHabitats([
    'gore_magala', 'shagaru_magala', 'valstrax', 'crimson_glow_valstrax', 'astalos', 'gammoth',
    'seregios', 'lagiacrus', 'akantor', 'ukanlos', 'nakarkos', 'yamatsukami', 'lao_shan_lung'
], ['old_world', 'arena'], 'latest_available');
registerHuntHabitats([
    'alatreon', 'fatalis', 'safi_jiiva', 'shara_ishvalda', 'behemoth'
], ['arena'], 'world_iceborne');
registerHuntHabitats(['aptonoth', 'vespoid'], ['ancient_forest', 'wildspire_waste'], 'latest_available');
registerHuntHabitats(['ancient_leshen', 'leshen', 'tobi_kadachi', 'yian_garuga', 'scarred_yian_garuga'], ['ancient_forest'], 'world_iceborne');
registerHuntHabitats(['jyuratodus'], ['wildspire_waste'], 'world_iceborne');
registerHuntHabitats(['kirin', 'paolumu'], ['coral_highlands'], 'world_iceborne');
registerHuntHabitats(['radobaan', 'vaal_hazak', 'blackveil_vaal_hazak'], ['rotten_vale'], 'world_iceborne');
registerHuntHabitats(['lavasioth', 'uragaan'], ['elders_recess'], 'world_iceborne');
registerHuntHabitats(['kulve_taroth', 'xeno_jiiva', "xeno'jiiva", 'zorah_magdaros', 'safi_jiiva', "safi'jiiva"], ['arena'], 'world_iceborne');
registerHuntHabitats(['fulgur_anjanath'], ['hoarfrost_reach', 'ancient_forest'], 'iceborne');
registerHuntHabitats(['nightshade_paolumu'], ['wildspire_waste', 'coral_highlands'], 'iceborne');
registerHuntHabitats(['shrieking_legiana', 'viper_tobi_kadachi'], ['hoarfrost_reach'], 'iceborne');
registerHuntHabitats(['apceros', 'kestodon', 'kestodon_female', 'noios'], ['wildspire_waste'], 'world_iceborne');
registerHuntHabitats(['barnos', 'gastodon'], ['elders_recess'], 'world_iceborne');
registerHuntHabitats(['gajau', 'jagras', 'mosswine', 'mernos', 'felyne', 'grimalkyne'], ['ancient_forest'], 'world_iceborne');
registerHuntHabitats(['gajalaka', 'dodogama'], ['elders_recess'], 'world_iceborne');
registerHuntHabitats(['girros', 'hornetaur', 'shamos'], ['rotten_vale'], 'world_iceborne');
registerHuntHabitats(['kelbi', 'anteka', 'popo'], ['hoarfrost_reach', 'old_world'], 'latest_available');
registerHuntHabitats(['boaboa', 'cortos', 'wulg'], ['hoarfrost_reach'], 'iceborne');
registerHuntHabitats(['raphinos'], ['coral_highlands', 'rotten_vale'], 'world_iceborne');
registerHuntHabitats(['unknown_monster'], ['arena'], 'safe_fallback');

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HUNT_BGM_LOCALES, HUNT_HABITAT_LABELS, HUNT_DEDICATED_THEMES, HUNT_MONSTER_HABITATS };
} else {
    window.HUNT_BGM_LOCALES = HUNT_BGM_LOCALES;
    window.HUNT_HABITAT_LABELS = HUNT_HABITAT_LABELS;
    window.HUNT_DEDICATED_THEMES = HUNT_DEDICATED_THEMES;
    window.HUNT_MONSTER_HABITATS = HUNT_MONSTER_HABITATS;
}
