const HUNT_BGM_LOCALES = {
    ancient_forest: ['BGM/MHW_Ancient_Forest.mp3'],
    wildspire_waste: ['BGM/MHW_Wildspire_Waste.mp3'],
    coral_highlands: ['BGM/MHW_Coral_Highlands.mp3'],
    rotten_vale: ['BGM/MHW_Rotten_Vale.mp3'],
    elders_recess: ['BGM/MHW_Elders_Recess.mp3'],
    hoarfrost_reach: ['BGM/MHWI_Hoarfrost_Reach.mp3'],
    old_world: ['BGM/MHGU_Arena.mp3'],
    kamura: ['BGM/MHR_Kamura.mp3', 'BGM/MHGU_Arena.mp3'],
    arena: ['BGM/MHGU_Arena.mp3']
};

const HUNT_DEDICATED_THEMES = {
    zinogre: ['BGM/MHW_Zinogre.mp3'],
    mizutsune: ['BGM/MHR_Mizutsune.mp3'],
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
    fatalis: ['BGM/MHW_Fatalis.mp3'],
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HUNT_BGM_LOCALES, HUNT_DEDICATED_THEMES, HUNT_MONSTER_HABITATS };
} else {
    window.HUNT_BGM_LOCALES = HUNT_BGM_LOCALES;
    window.HUNT_DEDICATED_THEMES = HUNT_DEDICATED_THEMES;
    window.HUNT_MONSTER_HABITATS = HUNT_MONSTER_HABITATS;
}
